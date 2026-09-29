import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider.jsx';

/* Nid d'abeilles animé : remonté (nouvelle clé) à chaque retour sur le hero pour rejouer le tracé. */
function Comb(){
  return (
    <svg className="comb" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g stroke="#D9A02C" strokeWidth="1.6" opacity="0.9">
              <path className="hex" style={{ animationDelay: "0.05s" }} d="M110 40 L160 15 L210 40 V95 L160 120 L110 95 Z" />
              <path className="hex" style={{ animationDelay: "0.18s" }} d="M210 40 L260 15 L310 40 V95 L260 120 L210 95 Z" />
              <path className="hex" style={{ animationDelay: "0.18s" }} d="M10 40 L60 15 L110 40 V95 L60 120 L10 95 Z" />
              <path className="hex" style={{ animationDelay: "0.32s" }} d="M60 120 L110 95 L160 120 V175 L110 200 L60 175 Z" />
              <path className="hex" style={{ animationDelay: "0.32s" }} d="M160 120 L210 95 L260 120 V175 L210 200 L160 175 Z" />
              <path className="hex" style={{ animationDelay: "0.46s" }} d="M110 200 L160 175 L210 200 V255 L160 280 L110 255 Z" />
              <path className="hex" style={{ animationDelay: "0.46s" }} d="M10 200 L60 175 L110 200 V255 L60 280 L10 255 Z" />
            </g>
            <g fill="#F6EEDA">
              <circle className="dot" cx="160" cy="67" r="3" />
              <circle className="dot" cx="185" cy="147" r="3" />
              <circle className="dot" cx="135" cy="227" r="3" />
            </g>
          </svg>
  );
}

/* Grand titre d'accueil et nid d'abeilles animé. */
export default function Hero(){
  const { t } = useI18n();
  const heroRef = useRef(null);
  const [combKey, setCombKey] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!heroRef.current || !('IntersectionObserver' in window) || reduce) return undefined;
    let first = true;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if(entry.isIntersecting){ if(first){ first = false; } else { setCombKey((k) => k + 1); } }
      });
    }, { threshold: 0.4 });
    obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);
  return (
    <>
    <section className="hero" ref={heroRef}>
      <div className="wrap">
        <div>
          <h1>{t("hero.title")}</h1>
          <p className="lead" dangerouslySetInnerHTML={{ __html: t("hero.lead") }} />
          <div className="hero-actions">
            <button type="button" className="btn-primary open-report">{t("cta.report")}</button>
            <a href="#consignes" className="btn-ghost">{t("hero.btnGhost")}</a>
          </div>
        </div>
        <Comb key={combKey} />
      </div>
    </section>
    </>
  );
}
