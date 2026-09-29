import { useEffect, useMemo, useState } from 'react';
import { Link } from './nav.jsx';
import { photoUrls } from './api.js';
import { STATUSES, StatusBadge, urgencyLevel, urgencyLabel, timeAgo, telHref, displayName } from './constants.jsx';
import { COMMUNES } from '../lib/communes.js';

const FILTERS = [
  { id: 'actifs', label: 'À traiter', test: (r) => r.status === 'nouveau' || r.status === 'planifie' },
  ...STATUSES.map((s) => ({ id: s.id, label: s.short, test: (r) => r.status === s.id })),
  { id: 'tous', label: 'Tous', test: () => true }
];

function readParams(search){
  const p = new URLSearchParams(search);
  return {
    filtre: FILTERS.some((f) => f.id === p.get('statut')) ? p.get('statut') : 'actifs',
    commune: p.get('commune') || '',
    q: p.get('q') || '',
    tri: p.get('tri') === 'recents' ? 'recents' : 'urgence'
  };
}

/* Liste des signalements : filtres (statut, commune, recherche), tri, fiches. */
export default function ReportsView({ reports, staff, isAdmin, search, expiredCount }){
  const initial = readParams(search);
  const [filtre, setFiltre] = useState(initial.filtre);
  const [commune, setCommune] = useState(initial.commune);
  const [q, setQ] = useState(initial.q);
  const [tri, setTri] = useState(initial.tri);
  const [urls, setUrls] = useState({});

  // Les filtres restent dans l'adresse : retour arrière depuis une fiche = même liste.
  useEffect(() => {
    const p = new URLSearchParams();
    if(filtre !== 'actifs') p.set('statut', filtre);
    if(commune) p.set('commune', commune);
    if(q) p.set('q', q);
    if(tri !== 'urgence') p.set('tri', tri);
    const qs = p.toString();
    window.history.replaceState(window.history.state, '', '/apiculteur' + (qs ? '?' + qs : ''));
  }, [filtre, commune, q, tri]);

  const staffById = useMemo(() => Object.fromEntries((staff || []).map((s) => [s.id, s])), [staff]);

  const baseList = useMemo(() => {
    if(!reports) return [];
    const needle = q.trim().toLowerCase();
    return reports.filter((r) => {
      if(commune && r.commune !== commune) return false;
      if(!needle) return true;
      return [r.nom, r.adresse, r.reference, r.telephone, r.email, r.emplacement, r.message]
        .some((v) => v && String(v).toLowerCase().includes(needle));
    });
  }, [reports, commune, q]);

  const counts = useMemo(() => Object.fromEntries(FILTERS.map((f) => [f.id, baseList.filter(f.test).length])), [baseList]);

  const list = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filtre) || FILTERS[0];
    const out = baseList.filter(f.test);
    out.sort((a, b) => {
      if(tri === 'urgence'){
        const openA = a.status === 'nouveau' || a.status === 'planifie';
        const openB = b.status === 'nouveau' || b.status === 'planifie';
        if(openA !== openB) return openA ? -1 : 1;
        const u = urgencyLevel(b.urgence) - urgencyLevel(a.urgence);
        if(openA && u) return u;
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
    return out;
  }, [baseList, filtre, tri]);

  const shown = list.slice(0, 200);
  const photoKey = shown.map((r) => r.photo_path).filter(Boolean).join('|');
  useEffect(() => {
    const paths = photoKey ? photoKey.split('|') : [];
    if(!paths.length) return;
    let alive = true;
    photoUrls(paths).then((m) => { if(alive) setUrls((old) => ({ ...old, ...m })); }).catch(() => {});
    return () => { alive = false; };
  }, [photoKey]);

  if(!reports) return <div className="bk-loading">Chargement des signalements…</div>;

  return (
    <section className="bk-view">
      <div className="bk-view-head">
        <h1>Signalements</h1>
        <p className="bk-muted">{reports.length} au total · la liste se met à jour toute seule.</p>
      </div>

      {isAdmin && expiredCount > 0 && (
        <div className="bk-banner">
          {expiredCount} signalement{expiredCount > 1 ? 's' : ''} clos depuis plus de 12 mois
          contien{expiredCount > 1 ? 'nent' : 't'} encore des données personnelles.
          <Link to="/apiculteur/equipe#conservation" className="bk-linkbtn">Les anonymiser</Link>
        </div>
      )}

      <div className="bk-filters" role="group" aria-label="Filtrer par statut">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className={'bk-chip' + (filtre === f.id ? ' is-on' : '')}
                  aria-pressed={filtre === f.id} onClick={() => setFiltre(f.id)}>
            {f.label} <span className="bk-chip-count">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      <div className="bk-toolbar">
        <label className="bk-field bk-field-inline bk-search">
          <span className="visually-hidden">Rechercher</span>
          <input type="search" placeholder="Nom, adresse, téléphone, référence…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label className="bk-field bk-field-inline">
          <span className="visually-hidden">Commune</span>
          <select value={commune} onChange={(e) => setCommune(e.target.value)}>
            <option value="">Toutes les communes</option>
            {COMMUNES.map((c) => <option key={c.nom} value={c.nom}>{c.nom}</option>)}
          </select>
        </label>
        <label className="bk-field bk-field-inline">
          <span className="visually-hidden">Trier</span>
          <select value={tri} onChange={(e) => setTri(e.target.value)}>
            <option value="urgence">Urgents d'abord</option>
            <option value="recents">Plus récents d'abord</option>
          </select>
        </label>
      </div>

      {list.length === 0 ? (
        <div className="bk-empty">
          {reports.length === 0
            ? <p>Aucun signalement pour l'instant. Ils apparaîtront ici dès qu'un habitant utilisera le formulaire du site.</p>
            : <p>Aucun signalement ne correspond à ces filtres.</p>}
        </div>
      ) : (
        <ul className="bk-cards">
          {shown.map((r) => {
            const urg = urgencyLevel(r.urgence);
            const assignee = r.assigned_to && staffById[r.assigned_to];
            const url = r.photo_path && urls[r.photo_path];
            return (
              <li key={r.id} className={'bk-card bk-card-' + r.status}>
                <Link to={`/apiculteur/signalements/${r.id}`} className="bk-card-main">
                  <div className="bk-card-photo">
                    {url ? <img src={url} alt="" loading="lazy" /> : <span>{r.anonymized_at ? 'Effacée' : r.photo_path ? '…' : 'Pas de photo'}</span>}
                  </div>
                  <div className="bk-card-body">
                    <div className="bk-card-top">
                      <StatusBadge status={r.status} />
                      {urg >= 2 && (r.status === 'nouveau' || r.status === 'planifie') && (
                        <span className={'bk-urg bk-urg-' + urg}>Urgence {urgencyLabel(r.urgence).toLowerCase()}</span>
                      )}
                      <time className="bk-time" dateTime={r.created_at}>{timeAgo(r.created_at)}</time>
                    </div>
                    <h2 className="bk-card-title">
                      {r.commune}{r.adresse ? ' · ' + r.adresse : ''}
                    </h2>
                    {r.emplacement && <p className="bk-card-text">{r.emplacement}</p>}
                    <p className="bk-card-meta">
                      {r.anonymized_at ? 'Données personnelles effacées' : r.nom}
                      {r.reference ? ' · ' + r.reference : ''}
                      {assignee ? ' · suivi par ' + displayName(assignee) : ''}
                    </p>
                  </div>
                </Link>
                {r.telephone && (r.status === 'nouveau' || r.status === 'planifie') && (
                  <a className="bk-card-call" href={telHref(r.telephone)} aria-label={`Appeler ${r.nom}`}>
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5.5 2.5l1.5 3-1.6 1.2a8 8 0 0 0 3.9 3.9L10.5 9l3 1.5-.6 2.4c-.2.7-.9 1.1-1.6 1C6.4 13.3 2.7 9.6 2.1 4.7c-.1-.7.3-1.4 1-1.6z"/></svg>
                    <span>Appeler</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {list.length > shown.length && <p className="bk-muted">Seuls les 200 premiers sont affichés : affinez la recherche.</p>}
    </section>
  );
}
