import { useI18n } from '../../i18n/I18nProvider.jsx';

/* Pied de page. */
export default function Footer(){
  const { t } = useI18n();
  return (
    <>
    <footer>
      <div className="wrap footer-main">
        <div className="brand footer-brand">
          <svg className="brand-mark" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M20,2 L27.8,6.5 L27.8,15.5 L20,20 L12.2,15.5 L12.2,6.5 Z" stroke="#D9A02C" strokeWidth="1.5" />
            <path d="M13,15 L20.8,19.5 L20.8,28.5 L13,33 L5.2,28.5 L5.2,19.5 Z" stroke="#D9A02C" strokeWidth="1.5" />
            <path d="M27,15 L34.8,19.5 L34.8,28.5 L27,33 L19.2,28.5 L19.2,19.5 Z" stroke="#D9A02C" strokeWidth="1.5" />
          </svg>
          <div className="brand-name">S.O.S <span>Abeilles</span> Guyane</div>
        </div>
        <div className="footer-links">
          <button type="button" className="footer-link open-about">{t("about.title")}</button>
          <button type="button" className="footer-link open-privacy">{t("privacy.linkLabel")}</button>
          <button type="button" className="footer-link" data-consent-open>{t("consent.manage")}</button>
          <a className="footer-link" href="/apiculteur">{t("footer.beekeeper")}</a>
        </div>
      </div>

      <div className="wrap footer-bottom">
        <p dangerouslySetInnerHTML={{ __html: t("footer.copyright") }} />
      </div>
    </footer>
    </>
  );
}
