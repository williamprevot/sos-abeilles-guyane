import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider.jsx';

const LABELS = { fr: 'Français', en: 'English', es: 'Español', pt: 'Português', zh: '中文' };

/* Sélecteur de langue de l'en-tête (FR / EN / ES / PT / ZH). */
export default function LangSwitch(){
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if(!open) return undefined;
    const onClick = (e) => { if(rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if(e.key === 'Escape'){ setOpen(false); triggerRef.current?.focus(); } };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className="lang-switch" ref={rootRef}>
      <button type="button" className="lang-trigger" id="lang-trigger" ref={triggerRef}
        aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="lang-current">{lang.toUpperCase()}</span> <span className="lang-caret">▾</span>
      </button>
      <ul className="lang-menu" id="lang-menu" hidden={!open}>
        {Object.entries(LABELS).map(([code, label]) => (
          <li key={code}>
            <button type="button" className={'lang-option' + (code === lang ? ' active' : '')} data-lang={code}
              onClick={() => { setLang(code); setOpen(false); }}>{label}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
