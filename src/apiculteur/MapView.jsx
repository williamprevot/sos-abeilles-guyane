import { useEffect, useMemo, useRef, useState } from 'react';
import { navigate } from './nav.jsx';
import { photoUrls, geocodeAddress, updateReport } from './api.js';
import { STATUSES, STATUS, glyphSvg, escapeHtml, timeAgo, urgencyLabel, urgencyLevel } from './constants.jsx';
import { communeCenter } from '../lib/communes.js';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || 'BWLQgt3asW0Wt5A6AKvg';
const PERIODS = [
  { id: '30', label: '30 derniers jours', days: 30 },
  { id: '90', label: '3 derniers mois', days: 90 },
  { id: '365', label: '12 derniers mois', days: 365 },
  { id: 'all', label: 'Depuis le début', days: null }
];

/* Position stable « autour du centre de la commune » pour les signalements
   sans GPS ni adresse localisée (jusqu'à ~1,2 km, toujours la même pour un id). */
function approxPosition(r){
  let h = 0;
  for(let i = 0; i < r.id.length; i++) h = (h * 31 + r.id.charCodeAt(i)) >>> 0;
  const c = communeCenter(r.commune);
  const angle = (h % 360) * Math.PI / 180;
  const dist = 0.003 + ((h >>> 9) % 1000) / 1000 * 0.008;
  return { lat: c.lat + Math.sin(angle) * dist, lng: c.lng + Math.cos(angle) * dist };
}

function positionOf(r){
  if(r.lat != null && r.lng != null) return { lat: r.lat, lng: r.lng, approx: false };
  return { ...approxPosition(r), approx: true };
}

function isFresh(r){
  return r.status === 'nouveau' && Date.now() - new Date(r.created_at).getTime() < 24 * 3600 * 1000;
}

function pinHtml(r, approx){
  const s = STATUS[r.status] || STATUS.nouveau;
  const cls = ['bk-pin', 'bk-pin-' + s.id, approx ? 'bk-pin-approx' : '', isFresh(r) ? 'bk-pin-fresh' : ''].join(' ');
  return `<span class="${cls}" style="--pin:${s.color}">${glyphSvg(s.id, 14, s.id === 'annule' ? '#4F5752' : '#FFFFFF')}</span>`;
}

function popupHtml(r, approx, photoUrl){
  const s = STATUS[r.status] || STATUS.nouveau;
  const urg = urgencyLevel(r.urgence);
  return `
    <div class="bk-popup">
      ${photoUrl ? `<img src="${escapeHtml(photoUrl)}" alt="" class="bk-popup-photo">` : r.photo_path ? '<div class="bk-popup-photo bk-popup-photo-empty">Photo…</div>' : ''}
      <div class="bk-popup-body">
        <span class="bk-status bk-status-${s.id}"><span class="bk-status-dot" style="background:${s.color}">${glyphSvg(s.id, 11)}</span>${escapeHtml(s.label)}</span>
        <strong>${escapeHtml(r.commune)}${r.adresse ? ' · ' + escapeHtml(r.adresse) : ''}</strong>
        ${r.emplacement ? `<span>${escapeHtml(r.emplacement)}</span>` : ''}
        <span class="bk-muted">${escapeHtml(timeAgo(r.created_at))}${urg >= 2 && (r.status === 'nouveau' || r.status === 'planifie') ? ' · urgence ' + escapeHtml(urgencyLabel(r.urgence).toLowerCase()) : ''}</span>
        ${approx ? '<span class="bk-muted bk-small">Position approximative (centre de la commune)</span>' : ''}
        <a href="/apiculteur/signalements/${r.id}" data-bk-link class="bk-popup-link">Ouvrir la fiche →</a>
      </div>
    </div>`;
}

/* Carte réservée à l'équipe : signalements en direct, avec photos. */
export default function MapView({ reports, focusId, pushToast, replaceReport }){
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const markersRef = useRef(new Map());
  const fittedRef = useRef(false);
  const [visible, setVisible] = useState({ nouveau: true, planifie: true, recupere: true, annule: false });
  const [period, setPeriod] = useState('365');
  const [urls, setUrls] = useState({});
  const [geoBusy, setGeoBusy] = useState(null);
  const leafletMissing = typeof window.L === 'undefined';

  const inPeriod = useMemo(() => {
    if(!reports) return [];
    const p = PERIODS.find((x) => x.id === period);
    if(!p.days) return reports;
    const since = Date.now() - p.days * 86400000;
    // Les signalements encore ouverts restent toujours visibles, quelle que soit leur date.
    return reports.filter((r) => r.status === 'nouveau' || r.status === 'planifie' || new Date(r.created_at).getTime() >= since);
  }, [reports, period]);

  const counts = useMemo(() => Object.fromEntries(STATUSES.map((s) => [s.id, inPeriod.filter((r) => r.status === s.id).length])), [inPeriod]);
  const shown = useMemo(() => inPeriod.filter((r) => visible[r.status] && !(r.anonymized_at && r.lat == null)), [inPeriod, visible]);
  const approxList = useMemo(() => shown.filter((r) => r.lat == null && !r.anonymized_at && r.adresse), [shown]);

  // Carte Leaflet (chargée par index.html), créée une seule fois.
  useEffect(() => {
    if(leafletMissing || !boxRef.current) return;
    const L = window.L;
    const map = L.map(boxRef.current, { zoomControl: true, attributionControl: true }).setView([4.87, -52.37], 10);
    L.tileLayer('https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=' + MAPTILER_KEY, {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Liens « Ouvrir la fiche » dans les bulles : navigation interne.
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[data-bk-link]');
      if(a){ e.preventDefault(); navigate(a.getAttribute('href')); }
    };
    boxRef.current.addEventListener('click', onClick);
    const box = boxRef.current;
    return () => { box.removeEventListener('click', onClick); map.remove(); mapRef.current = null; markersRef.current.clear(); };
  }, [leafletMissing]);

  // Liens temporaires des photos visibles
  const photoKey = shown.map((r) => r.photo_path).filter(Boolean).join('|');
  useEffect(() => {
    const paths = photoKey ? photoKey.split('|') : [];
    if(!paths.length) return;
    let alive = true;
    photoUrls(paths).then((m) => { if(alive) setUrls((old) => ({ ...old, ...m })); }).catch(() => {});
    return () => { alive = false; };
  }, [photoKey]);

  // Marqueurs : ajout / mise à jour / retrait à chaque changement (temps réel compris).
  useEffect(() => {
    const map = mapRef.current;
    if(!map) return;
    const L = window.L;
    const keep = new Set();
    shown.forEach((r) => {
      keep.add(r.id);
      const pos = positionOf(r);
      const icon = L.divIcon({ className: 'bk-pin-wrap', html: pinHtml(r, pos.approx), iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -14] });
      const html = popupHtml(r, pos.approx, r.photo_path ? urls[r.photo_path] : null);
      const z = { nouveau: 400, planifie: 300, recupere: 200, annule: 100 }[r.status] || 0;
      let m = markersRef.current.get(r.id);
      if(!m){
        m = L.marker([pos.lat, pos.lng], { icon, zIndexOffset: z, title: `${STATUS[r.status].label} · ${r.commune}`, keyboard: true, riseOnHover: true });
        m.bindPopup(html, { maxWidth: 260, minWidth: 220 });
        m.addTo(layerRef.current);
        markersRef.current.set(r.id, m);
      }else{
        m.setLatLng([pos.lat, pos.lng]);
        m.setIcon(icon);
        m.setZIndexOffset(z);
        m.setPopupContent(html);
      }
    });
    markersRef.current.forEach((m, id) => {
      if(!keep.has(id)){ layerRef.current.removeLayer(m); markersRef.current.delete(id); }
    });
    if(!fittedRef.current && shown.length && !focusId){
      const b = L.latLngBounds(shown.map((r) => { const p = positionOf(r); return [p.lat, p.lng]; }));
      map.fitBounds(b.pad(0.2), { maxZoom: 14 });
      fittedRef.current = true;
    }
  }, [shown, urls, focusId]);

  // ?focus=<id> : centre la carte sur un signalement et ouvre sa bulle.
  useEffect(() => {
    const map = mapRef.current;
    if(!map || !focusId || !reports) return;
    const r = reports.find((x) => x.id === focusId);
    if(!r) return;
    if(!visible[r.status]) setVisible((v) => ({ ...v, [r.status]: true }));
    const t = setTimeout(() => {
      const m = markersRef.current.get(focusId);
      const pos = positionOf(r);
      map.setView([pos.lat, pos.lng], 16);
      if(m) m.openPopup();
      fittedRef.current = true;
    }, 50);
    return () => clearTimeout(t);
  }, [focusId, reports ? reports.length : 0]); // eslint-disable-line react-hooks/exhaustive-deps

  async function locateAll(){
    setGeoBusy({ done: 0, total: approxList.length, found: 0 });
    let found = 0;
    for(let i = 0; i < approxList.length; i++){
      const r = approxList[i];
      try{
        const pos = await geocodeAddress(r.adresse, r.commune);
        if(pos){
          const row = await updateReport(r.id, { lat: pos.lat, lng: pos.lng, geo_source: 'adresse' });
          replaceReport(row);
          found++;
        }
      }catch(e){ /* on passe au suivant */ }
      setGeoBusy({ done: i + 1, total: approxList.length, found });
    }
    setGeoBusy(null);
    pushToast({ title: `${found} adresse${found > 1 ? 's' : ''} située${found > 1 ? 's' : ''} sur ${approxList.length}`, duration: 5000 });
  }

  if(!reports) return <div className="bk-loading">Chargement…</div>;

  return (
    <section className="bk-view bk-map-view">
      <div className="bk-view-head">
        <h1>Carte des signalements</h1>
        <p className="bk-muted">Visible uniquement par l'équipe. Les nouveaux signalements apparaissent en direct.</p>
      </div>

      <div className="bk-toolbar bk-map-toolbar">
        <div className="bk-legend" role="group" aria-label="Statuts affichés">
          {STATUSES.map((s) => (
            <button key={s.id} type="button" className={'bk-legend-item' + (visible[s.id] ? ' is-on' : '')} aria-pressed={visible[s.id]}
                    onClick={() => setVisible((v) => ({ ...v, [s.id]: !v[s.id] }))}>
              <span className={'bk-pin bk-pin-mini bk-pin-' + s.id} style={{ '--pin': s.color }}
                    dangerouslySetInnerHTML={{ __html: glyphSvg(s.id, 10, s.id === 'annule' ? '#4F5752' : '#FFFFFF') }} />
              {s.short} <span className="bk-chip-count">{counts[s.id]}</span>
            </button>
          ))}
        </div>
        <label className="bk-field bk-field-inline">
          <span className="visually-hidden">Période</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </label>
      </div>

      {leafletMissing ? (
        <div className="bk-empty">
          <p>La carte n'a pas pu se charger (connexion internet ?). Rechargez la page, ou utilisez la liste des signalements.</p>
        </div>
      ) : (
        <div className="bk-map" ref={boxRef} role="region" aria-label="Carte des signalements" />
      )}

      <div className="bk-map-foot">
        <p className="bk-muted bk-small">
          <span className="bk-pin bk-pin-mini bk-pin-approx bk-pin-legend" aria-hidden="true" /> Contour en pointillés : position approximative (ni GPS ni adresse localisée).
          {' '}Un halo signale les nouveaux signalements des dernières 24 h.
        </p>
        {approxList.length > 0 && (
          geoBusy
            ? <p className="bk-info" role="status">Localisation des adresses… {geoBusy.done}/{geoBusy.total}</p>
            : <button type="button" className="bk-btn" onClick={locateAll}>
                Situer {approxList.length} adresse{approxList.length > 1 ? 's' : ''} approximative{approxList.length > 1 ? 's' : ''}
              </button>
        )}
      </div>
    </section>
  );
}
