import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getLang, initialLang, setRuntimeLang, t } from './runtime.js';

const I18nContext = createContext({ lang: 'fr', setLang: () => {}, t });

function setMeta(selector, value){
  const el = document.querySelector(selector);
  if(el) el.setAttribute('content', value);
}

export function I18nProvider({ children }){
  const [lang, setLangState] = useState(() => {
    const l = initialLang();
    setRuntimeLang(l);
    return l;
  });

  const setLang = useCallback((next) => {
    setRuntimeLang(next);
    setLangState(getLang());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t('meta.title');
    setMeta('meta[name="description"]', t('meta.description'));
    setMeta('meta[property="og:title"]', t('meta.title'));
    setMeta('meta[property="og:description"]', t('meta.description'));
    try{ localStorage.setItem('sosAbeillesLang', lang); }catch(e){ /* ignoré */ }
    // Libellé « Étape X sur 10 » du chatbot, généré par le code historique
    if(typeof window.__updateProgressLabel === 'function') window.__updateProgressLabel();
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(){ return useContext(I18nContext); }
