import { useEffect, useState } from 'react';

/* Mini-routeur de l'espace apiculteur (adresses /apiculteur/...). */
export function navigate(to, { replace = false } = {}){
  if(to === window.location.pathname + window.location.search) return;
  if(replace) window.history.replaceState(window.history.state, '', to);
  else window.history.pushState({ bk: true }, '', to);
  window.dispatchEvent(new Event('bk:navigate'));
  window.scrollTo(0, 0);
}

/* Vrai si la page précédente de l'historique est aussi dans l'espace apiculteur. */
export function canGoBack(){
  return Boolean(window.history.state && window.history.state.bk);
}

export function useLocation(){
  const read = () => ({ path: window.location.pathname.replace(/\/+$/, '') || '/', search: window.location.search });
  const [loc, setLoc] = useState(read);
  useEffect(() => {
    const update = () => setLoc(read());
    window.addEventListener('popstate', update);
    window.addEventListener('bk:navigate', update);
    return () => { window.removeEventListener('popstate', update); window.removeEventListener('bk:navigate', update); };
  }, []);
  return loc;
}

export function Link({ to, children, onClick, ...rest }){
  return (
    <a href={to} {...rest} onClick={(e) => {
      if(onClick) onClick(e);
      if(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      navigate(to);
    }}>{children}</a>
  );
}
