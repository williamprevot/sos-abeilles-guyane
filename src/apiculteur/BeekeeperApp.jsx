import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, supabaseConfigured, INITIAL_HASH } from '../lib/supabase.js';
import { Link, navigate, useLocation } from './nav.jsx';
import { useReports } from './useReports.js';
import { fetchProfiles, isExpired } from './api.js';
import { displayName, urgencyLabel, BrandMark } from './constants.jsx';
import { Icon } from './icons.jsx';
import { LoginScreen, SetPasswordScreen, PendingScreen, SetupNeededScreen, ErrorScreen, frenchAuthError } from './AuthScreens.jsx';
import ReportsView from './ReportsView.jsx';
import ReportDetail from './ReportDetail.jsx';
import StatsView from './StatsView.jsx';
import TeamView from './TeamView.jsx';
import './apiculteur.css';

// La carte (Leaflet) n'est chargée que si on ouvre l'onglet « Carte ».
const MapView = lazy(() => import('./MapView.jsx'));

/* Lien reçu par email : invitation ou mot de passe oublié ? */
const LINK_TYPE = (/(?:^#|&)type=(invite|recovery)(?:&|$)/.exec(INITIAL_HASH) || [])[1] || null;
const LINK_ERROR = (() => {
  const m = /(?:^#|&)error_description=([^&]*)/.exec(INITIAL_HASH);
  return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
})();

export default function BeekeeperApp(){
  useEffect(() => {
    document.body.classList.add('bk-body');
    document.documentElement.classList.add('bk-html');
    const robots = document.createElement('meta');
    robots.name = 'robots'; robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    return () => { document.body.classList.remove('bk-body'); document.documentElement.classList.remove('bk-html'); robots.remove(); };
  }, []);

  if(!supabaseConfigured) return <SetupNeededScreen />;
  return <AuthGate />;
}

function AuthGate(){
  const [session, setSession] = useState(undefined);     // undefined = on vérifie
  const [passwordMode, setPasswordMode] = useState(LINK_TYPE);
  const [profile, setProfile] = useState(undefined);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if(alive) setSession(data.session || null); });
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if(event === 'PASSWORD_RECOVERY') setPasswordMode('recovery');
      setSession(s || null);
    });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);

  const userId = session && session.user ? session.user.id : null;

  const loadProfile = useCallback(async () => {
    if(!userId){ setProfile(undefined); return; }
    setProfileError('');
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if(error){ setProfileError(frenchAuthError(error)); return; }
    setProfile(data || { id: userId, role: 'en_attente', email: session.user.email });
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(undefined);
    navigate('/apiculteur', { replace: true });
  }, []);

  if(session === undefined) return <div className="bk-loading">Chargement…</div>;
  if(!session) return <LoginScreen linkError={LINK_ERROR} />;
  if(passwordMode) return <SetPasswordScreen kind={passwordMode} onDone={() => { setPasswordMode(null); loadProfile(); }} />;
  if(profileError) return <ErrorScreen message={profileError} onRetry={loadProfile} onSignOut={signOut} />;
  if(profile === undefined) return <div className="bk-loading">Chargement…</div>;
  if(profile.role !== 'apiculteur' && profile.role !== 'admin'){
    return <PendingScreen email={profile.email || session.user.email} onSignOut={signOut} />;
  }
  return <Dashboard profile={profile} onProfileChange={loadProfile} onSignOut={signOut} />;
}

const TABS = [
  { to: '/apiculteur', label: 'Signalements', match: (p) => p === '/apiculteur' || p.startsWith('/apiculteur/signalements'),
    icon: 'inbox' },
  { to: '/apiculteur/carte', label: 'Carte', match: (p) => p.startsWith('/apiculteur/carte'),
    icon: 'map' },
  { to: '/apiculteur/statistiques', label: 'Statistiques', match: (p) => p.startsWith('/apiculteur/statistiques'),
    icon: 'chart' },
  { to: '/apiculteur/equipe', label: 'Équipe', match: (p) => p.startsWith('/apiculteur/equipe'),
    icon: 'users' }
];

function Dashboard({ profile, onProfileChange, onSignOut }){
  const { path, search } = useLocation();
  const isAdmin = profile.role === 'admin';
  const [toasts, setToasts] = useState([]);
  const [staff, setStaff] = useState([]);

  const pushToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list.slice(-2), { id, ...toast }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), toast.duration || 8000);
  }, []);

  const data = useReports({
    onNewReport: (r) => pushToast({
      kind: 'new', title: 'Nouveau signalement',
      text: `${r.commune} · urgence ${urgencyLabel(r.urgence).toLowerCase()}`,
      to: `/apiculteur/signalements/${r.id}`, duration: 15000
    })
  });

  const loadStaff = useCallback(() => { fetchProfiles().then(setStaff).catch(() => {}); }, []);
  useEffect(() => { loadStaff(); }, [loadStaff]);

  const reports = data.reports;
  const newCount = reports ? reports.filter((r) => r.status === 'nouveau').length : 0;
  const expiredCount = useMemo(() => (reports && isAdmin ? reports.filter((r) => isExpired(r)).length : 0), [reports, isAdmin]);

  useEffect(() => {
    document.title = (newCount ? `(${newCount}) ` : '') + 'Espace apiculteur — S.O.S Abeilles Guyane';
  }, [newCount]);

  const detailMatch = /^\/apiculteur\/signalements\/([0-9a-f-]{36})$/.exec(path);
  const focusId = new URLSearchParams(search).get('focus');
  const common = { reports, staff, profile, isAdmin, pushToast, replaceReport: data.replaceReport, removeReport: data.removeReport };

  let view;
  if(detailMatch) view = <ReportDetail id={detailMatch[1]} {...common} />;
  else if(path === '/apiculteur/carte') view = <Suspense fallback={<div className="bk-loading">Chargement de la carte…</div>}><MapView focusId={focusId} {...common} /></Suspense>;
  else if(path === '/apiculteur/statistiques') view = <StatsView {...common} />;
  else if(path === '/apiculteur/equipe') view = <TeamView {...common} staffReload={loadStaff} onProfileChange={onProfileChange} onSignOut={onSignOut} />;
  else if(path === '/apiculteur') view = <ReportsView {...common} search={search} expiredCount={expiredCount} />;
  else view = (
    <div className="bk-empty">
      <p>Cette page n'existe pas.</p>
      <Link className="bk-btn" to="/apiculteur">Voir les signalements</Link>
    </div>
  );

  return (
    <div className="bk-app" data-clarity-mask="True">
      <header className="bk-top">
        <div className="bk-top-inner">
          <Link to="/apiculteur" className="bk-brand">
            <BrandMark size={30} />
            <span className="bk-brand-text">S.O.S Abeilles <em>Espace apiculteur</em></span>
          </Link>
          <nav className="bk-tabs" aria-label="Sections">
            {TABS.map((tab) => {
              const active = tab.match(path);
              const label = tab.to === '/apiculteur/equipe' && !isAdmin ? 'Mon compte' : tab.label;
              return (
                <Link key={tab.to} to={tab.to} className={'bk-tab' + (active ? ' is-active' : '')} aria-current={active ? 'page' : undefined}>
                  <Icon name={tab.to === '/apiculteur/equipe' && !isAdmin ? 'user' : tab.icon} size={19} />
                  <span>{label}</span>
                  {tab.to === '/apiculteur' && newCount > 0 && <span className="bk-count" aria-label={`${newCount} nouveaux`}>{newCount}</span>}
                </Link>
              );
            })}
          </nav>
          <div className="bk-user">
            <span className={'bk-live' + (data.live ? ' is-on' : '')} title={data.live ? 'Mises à jour en direct actives' : 'Connexion en direct interrompue'}>
              <span className="bk-live-dot" aria-hidden="true" />{data.live ? 'En direct' : 'Hors ligne'}
            </span>
            <span className="bk-user-name">{displayName(profile)}</span>
            <button className="bk-linkbtn bk-signout" onClick={onSignOut}><Icon name="logout" size={16} /><span>Déconnexion</span></button>
          </div>
        </div>
      </header>

      <main className="bk-main">
        {data.error && (
          <div className="bk-banner bk-banner-error" role="alert">
            Impossible de charger les signalements : {data.error}
            <button className="bk-linkbtn" onClick={data.reload}>Réessayer</button>
          </div>
        )}
        {view}
      </main>

      <div className="bk-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={'bk-toast bk-toast-' + (t.kind || 'info')}>
            <div>
              <strong>{t.title}</strong>
              {t.text && <span>{t.text}</span>}
            </div>
            {t.to && <Link to={t.to} className="bk-toast-link" onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))}>Ouvrir</Link>}
            <button className="bk-toast-close" aria-label="Fermer" onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))}><Icon name="close" size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
