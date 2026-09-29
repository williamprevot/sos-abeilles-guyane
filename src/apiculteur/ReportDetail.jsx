import { useEffect, useState } from 'react';
import { Link, navigate, canGoBack } from './nav.jsx';
import { fetchEvents, updateReport, deleteReport, photoUrls, geocodeAddress } from './api.js';
import { Icon } from './icons.jsx';
import {
  STATUSES, STATUS, StatusBadge, StatusDot, urgencyLevel, urgencyLabel,
  formatDateTime, timeAgo, telHref, directionsLinks, displayName
} from './constants.jsx';

const LANG_NAMES = { fr: 'français', en: 'anglais', es: 'espagnol', pt: 'portugais', zh: 'chinois' };

/* Fiche d'un signalement : photo, contact, itinéraire, statut, suivi, historique. */
export default function ReportDetail({ id, reports, staff, profile, isAdmin, replaceReport, removeReport, pushToast }){
  const report = reports ? reports.find((r) => r.id === id) : undefined;
  const [events, setEvents] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const status = report && report.status;
  useEffect(() => {
    if(!report) return;
    fetchEvents(id).then(setEvents).catch(() => {});
  }, [id, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const savedNotes = report ? report.notes || '' : '';
  useEffect(() => { setNotes(savedNotes); }, [id, savedNotes]);

  const photoPath = report && report.photo_path;
  useEffect(() => {
    setPhoto(null);
    if(!photoPath) return;
    let alive = true;
    photoUrls([photoPath]).then((m) => { if(alive) setPhoto(m[photoPath]); }).catch(() => {});
    return () => { alive = false; };
  }, [photoPath]);

  if(!reports) return <div className="bk-loading">Chargement…</div>;
  if(!report){
    return (
      <div className="bk-empty">
        <p>Ce signalement n'existe plus (il a peut-être été supprimé).</p>
        <Link className="bk-btn" to="/apiculteur">Retour à la liste</Link>
      </div>
    );
  }

  async function save(patch, label){
    setBusy(label); setError('');
    try{
      const row = await updateReport(report.id, patch);
      replaceReport(row);
      return row;
    }catch(e){
      setError('Enregistrement impossible : ' + (e.message || e));
      return null;
    }finally{
      setBusy('');
    }
  }

  async function changeStatus(next){
    if(next === report.status) return;
    const row = await save({ status: next }, 'status');
    if(row) pushToast({ title: 'Statut mis à jour', text: STATUS[next].label, duration: 3500 });
  }

  async function locate(){
    setBusy('geo'); setError('');
    try{
      const pos = await geocodeAddress(report.adresse, report.commune);
      if(!pos){ setError('Adresse introuvable sur la carte. Le signalement reste placé au centre de la commune.'); return; }
      const row = await updateReport(report.id, { lat: pos.lat, lng: pos.lng, geo_source: 'adresse' });
      replaceReport(row);
      pushToast({ title: 'Adresse située sur la carte', duration: 3500 });
    }catch(e){
      setError('Localisation impossible : ' + (e.message || e));
    }finally{
      setBusy('');
    }
  }

  async function onDelete(){
    setBusy('delete'); setError('');
    try{
      await deleteReport(report);
      removeReport(report.id);
      pushToast({ title: 'Signalement supprimé', duration: 3500 });
      navigate('/apiculteur', { replace: true });
    }catch(e){
      setError('Suppression impossible : ' + (e.message || e));
      setBusy('');
    }
  }

  const r = report;
  const anonymized = Boolean(r.anonymized_at);
  const staffList = (staff || []).filter((s) => s.role === 'apiculteur' || s.role === 'admin');
  const urg = urgencyLevel(r.urgence);
  const links = directionsLinks(r);
  const hasPos = r.lat != null && r.lng != null;
  const smsBody = `Bonjour, ici S.O.S Abeilles Guyane au sujet de votre signalement d'essaim${r.reference ? ' (' + r.reference + ')' : ''}. `;
  const mailSubject = `Votre signalement d'essaim${r.reference ? ' ' + r.reference : ''}`;

  return (
    <article className="bk-view bk-detail">
      <Link to="/apiculteur" className="bk-back" onClick={(e) => { if(canGoBack()){ e.preventDefault(); window.history.back(); } }}><Icon name="back" size={16} /> Retour</Link>

      <div className="bk-detail-head">
        <div>
          <p className="bk-muted bk-mono">{r.reference || 'Sans référence'} · reçu {timeAgo(r.created_at)}</p>
          <h1>{r.commune}{r.adresse ? ' · ' + r.adresse : ''}</h1>
        </div>
        <StatusBadge status={r.status} />
      </div>

      {error && <p className="bk-error" role="alert">{error}</p>}

      <div className="bk-detail-grid">
        <div className="bk-detail-col">
          <section className="bk-panel">
            <h2>Habitant</h2>
            {anonymized ? (
              <p className="bk-muted">Données personnelles effacées le {formatDateTime(r.anonymized_at)} (conservation de 12 mois après clôture).</p>
            ) : (
              <>
                <p className="bk-contact-name">{r.nom}</p>
                <div className="bk-actions">
                  <a className="bk-btn bk-btn-primary" href={telHref(r.telephone)}><Icon name="phone" size={17} /> Appeler {r.telephone}</a>
                  <a className="bk-btn" href={`sms:${String(r.telephone).replace(/[^\d+]/g, '')}?&body=${encodeURIComponent(smsBody)}`}><Icon name="sms" size={17} /> SMS</a>
                  <a className="bk-btn" href={`mailto:${r.email}?subject=${encodeURIComponent(mailSubject)}`}><Icon name="mail" size={17} /> Email</a>
                </div>
                <p className="bk-muted bk-small">{r.email}{r.lang && r.lang !== 'fr' ? ` · a écrit en ${LANG_NAMES[r.lang] || r.lang}` : ''}</p>
              </>
            )}
          </section>

          <section className="bk-panel">
            <h2>Statut</h2>
            <div className="bk-status-picker" role="radiogroup" aria-label="Statut du signalement">
              {STATUSES.map((s) => (
                <button key={s.id} type="button" role="radio" aria-checked={r.status === s.id}
                        className={'bk-status-opt bk-status-opt-' + s.id + (r.status === s.id ? ' is-on' : '')}
                        disabled={busy === 'status'} onClick={() => changeStatus(s.id)}>
                  <StatusDot status={s.id} />
                  {s.label}
                </button>
              ))}
            </div>
            {r.recovered_at && <p className="bk-muted">Essaim récupéré le {formatDateTime(r.recovered_at)}.</p>}

            <label className="bk-field">
              <span>Suivi par</span>
              <select value={r.assigned_to || ''} disabled={busy === 'assign'}
                      onChange={(e) => save({ assigned_to: e.target.value || null }, 'assign')}>
                <option value="">Personne pour l'instant</option>
                {staffList.map((s) => <option key={s.id} value={s.id}>{displayName(s)}{s.id === profile.id ? ' (moi)' : ''}</option>)}
              </select>
            </label>
            {r.assigned_to !== profile.id && (
              <button type="button" className="bk-linkbtn" onClick={() => save({ assigned_to: profile.id }, 'assign')}>Je m'en occupe</button>
            )}

            <label className="bk-field">
              <span>Notes internes <small>(jamais visibles par l'habitant)</small></span>
              <textarea rows={4} maxLength={4000} value={notes} disabled={anonymized} onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ex. : rappelé à 14 h, passage prévu samedi matin, échelle nécessaire…" />
            </label>
            {notes !== savedNotes && (
              <button type="button" className="bk-btn bk-btn-primary" disabled={busy === 'notes'}
                      onClick={() => save({ notes: notes.trim() || null }, 'notes')}>
                {busy === 'notes' ? 'Enregistrement…' : 'Enregistrer les notes'}
              </button>
            )}
          </section>
        </div>

        <div className="bk-detail-col">
          <section className="bk-panel bk-panel-photo">
            <h2>Photo</h2>
            {photo ? (
              <a href={photo} target="_blank" rel="noopener noreferrer" className="bk-photo-link">
                <img src={photo} alt={`Essaim signalé à ${r.commune}`} />
                <span><Icon name="expand" size={14} /> Agrandir</span>
              </a>
            ) : (
              <p className="bk-muted">{r.photo_path ? 'Chargement de la photo…' : anonymized ? 'Photo effacée.' : 'Aucune photo envoyée.'}</p>
            )}
          </section>

          <section className="bk-panel">
            <h2>L'essaim</h2>
            <dl className="bk-dl">
              <dt>Emplacement</dt><dd>{r.emplacement || '—'}</dd>
              <dt>Présent</dt><dd>{r.depuis || '—'}</dd>
              <dt>Urgence</dt><dd><span className={'bk-urg bk-urg-' + urg}>{urgencyLabel(r.urgence)}</span>{r.urgence && r.urgence.includes(' - ') ? ' — ' + r.urgence.split(' - ').slice(1).join(' - ') : ''}</dd>
              {r.message && <><dt>Message</dt><dd className="bk-pre">{r.message}</dd></>}
              <dt>Reçu le</dt><dd>{formatDateTime(r.created_at)}</dd>
            </dl>
          </section>

          {!anonymized && (
            <section className="bk-panel">
              <h2>Se rendre sur place</h2>
              <p>{r.adresse}, {r.commune}</p>
              <p className="bk-muted bk-small">
                {hasPos
                  ? (r.geo_source === 'gps' ? 'Position GPS envoyée par l\'habitant.' : 'Position calculée à partir de l\'adresse.')
                  : 'Pas encore de position précise sur la carte.'}
              </p>
              <div className="bk-actions">
                <a className="bk-btn" href={links.google} target="_blank" rel="noopener noreferrer"><Icon name="navigation" size={16} /> Google Maps</a>
                <a className="bk-btn" href={links.waze} target="_blank" rel="noopener noreferrer"><Icon name="route" size={16} /> Waze</a>
                {hasPos
                  ? <Link className="bk-btn" to={`/apiculteur/carte?focus=${r.id}`}><Icon name="mapPin" size={16} /> Voir sur la carte</Link>
                  : <button type="button" className="bk-btn" disabled={busy === 'geo'} onClick={locate}><Icon name="locate" size={16} /> {busy === 'geo' ? 'Recherche…' : 'Situer l\'adresse sur la carte'}</button>}
              </div>
            </section>
          )}

          <section className="bk-panel">
            <h2>Historique</h2>
            {events.length === 0 ? <p className="bk-muted">—</p> : (
              <ol className="bk-timeline">
                {events.map((ev) => (
                  <li key={ev.id}>
                    <StatusDot status={ev.status} />
                    <span>
                      <strong>{(STATUS[ev.status] || { label: ev.status }).label}</strong>
                      {' · '}{ev.changed_by_name || (ev.status === 'nouveau' ? 'formulaire du site' : 'équipe')}
                      <br /><span className="bk-muted bk-small">{formatDateTime(ev.created_at)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {isAdmin && (
            <section className="bk-panel bk-panel-danger">
              <h2>Supprimer</h2>
              <p className="bk-muted bk-small">Pour les doublons, tests ou messages indésirables. La photo est effacée aussi. Un signalement supprimé ne compte plus dans les statistiques.</p>
              {!confirmDelete
                ? <button type="button" className="bk-btn bk-btn-danger-outline" onClick={() => setConfirmDelete(true)}><Icon name="trash" size={16} /> Supprimer ce signalement…</button>
                : (
                  <div className="bk-actions">
                    <button type="button" className="bk-btn bk-btn-danger" disabled={busy === 'delete'} onClick={onDelete}>{busy === 'delete' ? 'Suppression…' : 'Oui, supprimer définitivement'}</button>
                    <button type="button" className="bk-btn" onClick={() => setConfirmDelete(false)}>Annuler</button>
                  </div>
                )}
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
