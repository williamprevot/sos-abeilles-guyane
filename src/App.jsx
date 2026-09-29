import { lazy, Suspense } from 'react';
import { I18nProvider } from './i18n/I18nProvider.jsx';
import Home from './pages/Home.jsx';

// L'espace apiculteur est chargé à part : les visiteurs du site public ne le téléchargent jamais.
const BeekeeperApp = lazy(() => import('./apiculteur/BeekeeperApp.jsx'));

export default function App(){
  const path = window.location.pathname;
  if(path === '/apiculteur' || path.startsWith('/apiculteur/')){
    return (
      <Suspense fallback={<div className="bk-loading">Chargement…</div>}>
        <BeekeeperApp />
      </Suspense>
    );
  }
  return (
    <I18nProvider>
      <Home />
    </I18nProvider>
  );
}
