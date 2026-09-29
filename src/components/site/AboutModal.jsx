import { useI18n } from '../../i18n/I18nProvider.jsx';

/* Boîte « À propos de nous ». */
export default function AboutModal(){
  const { t } = useI18n();
  return (
    <>
    <div className="modal-backdrop" id="about-backdrop" hidden></div>
    <div className="report-modal about-modal" id="about-modal" hidden role="dialog" aria-modal="true" aria-labelledby="about-modal-title">
      <button type="button" className="modal-close" id="about-modal-close" aria-label={t("modal.close")}>×</button>
      <div className="section-head">
        <h2 id="about-modal-title">{t("about.title")}</h2>
        <p>{t("about.subtitle")}</p>
      </div>
      <div className="about-grid">
        <div className="about-card">
          <span className="about-icon">📡</span>
          <h3>{t("about.card1.title")}</h3>
          <p>{t("about.card1.text")}</p>
        </div>
        <div className="about-card">
          <span className="about-icon">🍯</span>
          <h3>{t("about.card2.title")}</h3>
          <p>{t("about.card2.text")}</p>
        </div>
        <div className="about-card">
          <span className="about-icon">⚖️</span>
          <h3>{t("about.card3.title")}</h3>
          <p>{t("about.card3.text")}</p>
        </div>
      </div>
    </div>
    </>
  );
}
