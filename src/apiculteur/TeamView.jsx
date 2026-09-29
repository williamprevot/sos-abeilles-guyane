import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { fetchProfiles, updateProfile, teamAction, isExpired, anonymizeReports, RETENTION_MONTHS } from './api.js';
import { displayName, formatDate } from './constants.jsx';
import { frenchAuthError } from './AuthScreens.jsx';
import { Icon } from './icons.jsx';

const ROLES = [
  { id: 'apiculteur', label: 'Apiculteur' },
  { id: 'admin', label: 'Administrateur' },
  { id: 'en_attente', label: 'En attente (aucun accès)' }
];

/* « Mon compte » pour tous ; gestion de l'équipe et conservation des données pour les admins. */
export default function TeamView({ reports, profile, isAdmin, pushToast, staffReload, onProfileChange, onSignOut }){
  useEffect(() => {
    if(window.location.hash){
      const el = document.getElementById(window.location.hash.slice(1));
      if(el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }, []);

  return (
    <section className="bk-view bk-team">
      <div className="bk-view-head">
        <h1>{isAdmin ? 'Équipe' : 'Mon compte'}</h1>
      </div>
      <div className="bk-team-grid">
        <MyAccount profile={profile} pushToast={pushToast} onProfileChange={onProfileChange} onSignOut={onSignOut} />
        {isAdmin && <Members profile={profile} pushToast={pushToast} staffReload={staffReload} />}
        {isAdmin && <Retention reports={reports} pushToast={pushToast} />}
      </div>
    </section>
  );
}

function MyAccount({ profile, pushToast, onProfileChange, onSignOut }){
  const [name, setName] = useState(profile.display_name || '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  async function saveName(e){
    e.preventDefault();
    setBusy('name'); setError('');
    try{
      await updateProfile(profile.id, { display_name: name.trim() || null });
      onProfileChange();
      pushToast({ title: 'Nom enregistré', duration: 3000 });
    }catch(err){ setError(err.message || String(err)); }
    setBusy('');
  }
  async function savePassword(e){
    e.preventDefault();
    if(password.length < 8){ setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    setBusy('pw'); setError('');
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy('');
    if(err){ setError(frenchAuthError(err)); return; }
    setPassword('');
    pushToast({ title: 'Mot de passe modifié', duration: 3000 });
  }

  return (
    <section className="bk-panel">
      <h2>Mon compte</h2>
      <p className="bk-muted bk-small">{profile.email} · {profile.role === 'admin' ? 'administrateur' : 'apiculteur'}</p>
      <form className="bk-form" onSubmit={saveName}>
        <label className="bk-field">
          <span>Nom affiché dans l'historique</span>
          <input type="text" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <button className="bk-btn" disabled={busy === 'name' || name === (profile.display_name || '')}>Enregistrer le nom</button>
      </form>
      <form className="bk-form" onSubmit={savePassword}>
        <label className="bk-field">
          <span>Nouveau mot de passe <small>(8 caractères minimum)</small></span>
          <input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button className="bk-btn" disabled={busy === 'pw' || !password}>Changer le mot de passe</button>
      </form>
      {error && <p className="bk-error" role="alert">{error}</p>}
      <button className="bk-linkbtn" onClick={onSignOut}><Icon name="logout" size={15} /> Se déconnecter</button>
    </section>
  );
}

function Members({ profile, pushToast, staffReload }){
  const [members, setMembers] = useState(null);
  const [error, setError] = useState('');
  const [invite, setInvite] = useState({ email: '', display_name: '', role: 'apiculteur' });
  const [busy, setBusy] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(null);

  const load = () => fetchProfiles().then(setMembers).catch((e) => setError(e.message || String(e)));
  useEffect(() => { load(); }, []);

  async function changeRole(m, role){
    setBusy('role-' + m.id); setError('');
    try{
      await updateProfile(m.id, { role });
      await load(); staffReload();
      pushToast({ title: `${displayName(m)} : ${ROLES.find((r) => r.id === role).label.toLowerCase()}`, duration: 3500 });
    }catch(e){ setError(e.message || String(e)); }
    setBusy('');
  }

  async function sendInvite(e){
    e.preventDefault();
    setBusy('invite'); setError('');
    try{
      await teamAction({ action: 'invite', email: invite.email.trim(), display_name: invite.display_name.trim(), role: invite.role });
      pushToast({ title: 'Invitation envoyée', text: invite.email.trim(), duration: 5000 });
      setInvite({ email: '', display_name: '', role: 'apiculteur' });
      await load(); staffReload();
    }catch(err){ setError(err.message || String(err)); }
    setBusy('');
  }

  async function remove(m){
    setBusy('remove-' + m.id); setError('');
    try{
      await teamAction({ action: 'remove', user_id: m.id });
      pushToast({ title: 'Accès retiré', text: displayName(m), duration: 4000 });
      setConfirmRemove(null);
      await load(); staffReload();
    }catch(e){ setError(e.message || String(e)); }
    setBusy('');
  }

  return (
    <section className="bk-panel bk-members">
      <h2>Membres</h2>
      {error && <p className="bk-error" role="alert">{error}</p>}
      {!members ? <p className="bk-muted">Chargement…</p> : (
        <ul className="bk-member-list">
          {members.map((m) => {
            const me = m.id === profile.id;
            return (
              <li key={m.id} className={'bk-member' + (m.role === 'en_attente' ? ' is-pending' : '')}>
                <div className="bk-member-id">
                  <strong>{displayName(m)}{me ? ' (vous)' : ''}</strong>
                  <span className="bk-muted bk-small">{m.email} · depuis le {formatDate(m.created_at)}</span>
                </div>
                <div className="bk-member-actions">
                  {m.role === 'en_attente' && !me && (
                    <button className="bk-btn bk-btn-primary" disabled={busy === 'role-' + m.id} onClick={() => changeRole(m, 'apiculteur')}>Activer</button>
                  )}
                  <label className="bk-field bk-field-inline">
                    <span className="visually-hidden">Rôle de {displayName(m)}</span>
                    <select value={m.role} disabled={me || busy === 'role-' + m.id} onChange={(e) => changeRole(m, e.target.value)}>
                      {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                  </label>
                  {!me && (confirmRemove === m.id ? (
                    <>
                      <button className="bk-btn bk-btn-danger" disabled={busy === 'remove-' + m.id} onClick={() => remove(m)}>Confirmer</button>
                      <button className="bk-btn" onClick={() => setConfirmRemove(null)}>Annuler</button>
                    </>
                  ) : (
                    <button className="bk-linkbtn bk-danger-text" onClick={() => setConfirmRemove(m.id)}><Icon name="userMinus" size={15} /> Retirer l'accès</button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <h3>Inviter quelqu'un</h3>
      <p className="bk-muted bk-small">La personne reçoit un email pour choisir son mot de passe. Personne ne peut créer de compte sans invitation.</p>
      <form className="bk-form bk-invite" onSubmit={sendInvite}>
        <label className="bk-field">
          <span>Email</span>
          <input type="email" required value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
        </label>
        <label className="bk-field">
          <span>Nom <small>(facultatif)</small></span>
          <input type="text" maxLength={80} value={invite.display_name} onChange={(e) => setInvite({ ...invite, display_name: e.target.value })} />
        </label>
        <label className="bk-field">
          <span>Rôle</span>
          <select value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}>
            <option value="apiculteur">Apiculteur : voit et traite les signalements</option>
            <option value="admin">Administrateur : gère aussi l'équipe</option>
          </select>
        </label>
        <button className="bk-btn bk-btn-primary" disabled={busy === 'invite'}><Icon name="userPlus" size={17} /> {busy === 'invite' ? 'Envoi…' : 'Envoyer l\'invitation'}</button>
      </form>
    </section>
  );
}

function Retention({ reports, pushToast }){
  const expired = useMemo(() => (reports || []).filter((r) => isExpired(r)), [reports]);
  const anonymized = useMemo(() => (reports || []).filter((r) => r.anonymized_at).length, [reports]);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run(){
    setBusy(true); setError('');
    try{
      const n = await anonymizeReports(expired);
      pushToast({ title: `${n} signalement${n > 1 ? 's' : ''} anonymisé${n > 1 ? 's' : ''}`, duration: 5000 });
      setConfirm(false);
    }catch(e){ setError(e.message || String(e)); }
    setBusy(false);
  }

  return (
    <section className="bk-panel" id="conservation">
      <h2>Conservation des données</h2>
      <p className="bk-small">
        {RETENTION_MONTHS} mois après la clôture d'un signalement (récupéré ou annulé), on efface le nom, le téléphone,
        l'email, l'adresse, la position, les notes et la photo. Restent la commune, les dates et le statut, pour les statistiques.
      </p>
      <p className="bk-muted bk-small">{anonymized} signalement{anonymized > 1 ? 's' : ''} déjà anonymisé{anonymized > 1 ? 's' : ''}.</p>
      {expired.length === 0 ? (
        <p className="bk-info">Rien à effacer pour le moment.</p>
      ) : !confirm ? (
        <button className="bk-btn bk-btn-primary" onClick={() => setConfirm(true)}>
          Anonymiser {expired.length} signalement{expired.length > 1 ? 's' : ''}…
        </button>
      ) : (
        <div className="bk-actions">
          <button className="bk-btn bk-btn-danger" disabled={busy} onClick={run}>{busy ? 'En cours…' : 'Oui, effacer ces données'}</button>
          <button className="bk-btn" onClick={() => setConfirm(false)}>Annuler</button>
        </div>
      )}
      {error && <p className="bk-error" role="alert">{error}</p>}
    </section>
  );
}
