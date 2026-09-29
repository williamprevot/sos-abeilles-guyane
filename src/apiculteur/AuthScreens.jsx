import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

/* Écrans de connexion de l'espace apiculteur. Pas d'inscription libre :
   les comptes sont créés par invitation (onglet « Équipe » ou tableau Supabase). */

function AuthCard({ title, children }){
  return (
    <div className="bk-auth">
      <div className="bk-auth-card">
        <a className="bk-auth-brand" href="/">
          <span aria-hidden="true">🐝</span> S.O.S Abeilles Guyane
        </a>
        <h1>{title}</h1>
        {children}
      </div>
    </div>
  );
}

function frenchAuthError(error){
  const msg = (error && (error.message || error.error_description)) || String(error || '');
  if(/invalid login credentials/i.test(msg)) return 'Email ou mot de passe incorrect.';
  if(/email not confirmed/i.test(msg)) return 'Ce compte n\'est pas encore activé : ouvrez le lien reçu par email.';
  if(/rate limit|too many/i.test(msg)) return 'Trop de tentatives. Patientez quelques minutes puis réessayez.';
  if(/expired|invalid/i.test(msg)) return 'Ce lien a expiré ou a déjà servi. Demandez un nouveau lien avec « Mot de passe oublié ».';
  if(/should be at least|password.*characters/i.test(msg)) return 'Le mot de passe doit contenir au moins 8 caractères.';
  if(/same.*password|different from the old/i.test(msg)) return 'Choisissez un mot de passe différent de l\'ancien.';
  if(/failed to fetch|network/i.test(msg)) return 'Pas de connexion internet. Réessayez dans un instant.';
  return msg || 'Une erreur est survenue.';
}
export { frenchAuthError };

export function LoginScreen({ linkError }){
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(linkError ? frenchAuthError({ message: linkError }) : '');
  const [info, setInfo] = useState('');

  async function onLogin(e){
    e.preventDefault();
    setBusy(true); setError(''); setInfo('');
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if(err) setError(frenchAuthError(err));
  }

  async function onForgot(e){
    e.preventDefault();
    setBusy(true); setError(''); setInfo('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/apiculteur'
    });
    setBusy(false);
    if(err) setError(frenchAuthError(err));
    else setInfo('Si un compte existe pour cette adresse, un email avec un lien vient de partir. Pensez à regarder dans les indésirables.');
  }

  if(mode === 'forgot'){
    return (
      <AuthCard title="Mot de passe oublié">
        <p className="bk-muted">Indiquez votre email : vous recevrez un lien pour choisir un nouveau mot de passe.</p>
        <form onSubmit={onForgot} className="bk-form">
          <label className="bk-field">
            <span>Email</span>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {error && <p className="bk-error" role="alert">{error}</p>}
          {info && <p className="bk-info" role="status">{info}</p>}
          <button className="bk-btn bk-btn-primary" disabled={busy}>{busy ? 'Envoi…' : 'Recevoir le lien'}</button>
          <button type="button" className="bk-linkbtn" onClick={() => { setMode('login'); setError(''); setInfo(''); }}>Retour à la connexion</button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Espace apiculteur">
      <p className="bk-muted">Accès réservé à l'équipe. Les comptes sont créés sur invitation.</p>
      <form onSubmit={onLogin} className="bk-form">
        <label className="bk-field">
          <span>Email</span>
          <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="bk-field">
          <span>Mot de passe</span>
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="bk-error" role="alert">{error}</p>}
        <button className="bk-btn bk-btn-primary" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}</button>
        <button type="button" className="bk-linkbtn" onClick={() => { setMode('forgot'); setError(''); }}>Mot de passe oublié ?</button>
      </form>
    </AuthCard>
  );
}

export function SetPasswordScreen({ kind, onDone }){
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e){
    e.preventDefault();
    setError('');
    if(password.length < 8){ setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    if(password !== confirm){ setError('Les deux mots de passe ne sont pas identiques.'); return; }
    setBusy(true);
    const { data, error: err } = await supabase.auth.updateUser({ password });
    if(err){ setBusy(false); setError(frenchAuthError(err)); return; }
    if(kind === 'invite' && name.trim() && data && data.user){
      await supabase.from('profiles').update({ display_name: name.trim() }).eq('id', data.user.id);
    }
    setBusy(false);
    onDone();
  }

  return (
    <AuthCard title={kind === 'invite' ? 'Bienvenue dans l\'équipe' : 'Nouveau mot de passe'}>
      <p className="bk-muted">
        {kind === 'invite'
          ? 'Choisissez votre mot de passe pour activer votre compte.'
          : 'Choisissez un nouveau mot de passe.'}
      </p>
      <form onSubmit={onSubmit} className="bk-form">
        {kind === 'invite' && (
          <label className="bk-field">
            <span>Votre prénom et nom <small>(visible par l'équipe)</small></span>
            <input type="text" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
        )}
        <label className="bk-field">
          <span>Mot de passe <small>(8 caractères minimum)</small></span>
          <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label className="bk-field">
          <span>Confirmer le mot de passe</span>
          <input type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
        {error && <p className="bk-error" role="alert">{error}</p>}
        <button className="bk-btn bk-btn-primary" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
      </form>
    </AuthCard>
  );
}

export function PendingScreen({ email, onSignOut }){
  return (
    <AuthCard title="Compte en attente">
      <p>Votre compte <strong>{email}</strong> est bien créé.</p>
      <p className="bk-muted">Un administrateur doit encore l'activer avant que vous puissiez voir les signalements. Revenez un peu plus tard.</p>
      <div className="bk-form">
        <button className="bk-btn" onClick={() => window.location.reload()}>Vérifier à nouveau</button>
        <button className="bk-linkbtn" onClick={onSignOut}>Se déconnecter</button>
      </div>
    </AuthCard>
  );
}

export function SetupNeededScreen(){
  return (
    <AuthCard title="Base de données à brancher">
      <p>L'espace apiculteur a besoin de la base Supabase.</p>
      <p className="bk-muted">
        Ajoutez <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code> dans Netlify
        (Site configuration → Environment variables), puis relancez un déploiement.
        Tout est expliqué dans le fichier <code>SETUP.md</code> du projet.
      </p>
      <a className="bk-btn" href="/">Retour au site</a>
    </AuthCard>
  );
}

export function ErrorScreen({ message, onRetry, onSignOut }){
  return (
    <AuthCard title="Connexion impossible">
      <p className="bk-error" role="alert">{message}</p>
      <div className="bk-form">
        <button className="bk-btn bk-btn-primary" onClick={onRetry}>Réessayer</button>
        {onSignOut && <button className="bk-linkbtn" onClick={onSignOut}>Se déconnecter</button>}
      </div>
    </AuthCard>
  );
}
