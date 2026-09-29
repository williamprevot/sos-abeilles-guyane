import { useI18n } from '../../i18n/I18nProvider.jsx';
import LangSwitch from './LangSwitch.jsx';

/* En-tête : logo, navigation, bouton « Signaler », sélecteur de langue. */
export default function Header(){
  const { t } = useI18n();
  return (
    <>
    <header>
      <div className="wrap">
        <div className="brand">
          <svg className="brand-mark" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M20,2 L27.8,6.5 L27.8,15.5 L20,20 L12.2,15.5 L12.2,6.5 Z" stroke="#D9A02C" strokeWidth="1.5" />
            <path d="M13,15 L20.8,19.5 L20.8,28.5 L13,33 L5.2,28.5 L5.2,19.5 Z" stroke="#D9A02C" strokeWidth="1.5" />
            <path d="M27,15 L34.8,19.5 L34.8,28.5 L27,33 L19.2,28.5 L19.2,19.5 Z" stroke="#D9A02C" strokeWidth="1.5" />
          </svg>
          <div className="brand-name">S.O.S <span>Abeilles</span><span className="brand-region"> Guyane</span></div>
        </div>
        <div className="header-right">
          <button type="button" className="mobile-report-fab open-report">{t("cta.report")}</button>
          <nav>
            <a href="#zone">{t("nav.zone")}</a>
            <a href="#comment-ca-marche">{t("nav.comment")}</a>
            <a href="#consignes">{t("nav.attendant")}</a>
            <button type="button" className="btn-header open-report">{t("cta.report")}</button>
          </nav>
          <LangSwitch />
        </div>
      </div>
    </header>
    </>
  );
}
