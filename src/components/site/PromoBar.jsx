import { useI18n } from '../../i18n/I18nProvider.jsx';

/* Bandeau défilant tout en haut de la page. */
export default function PromoBar(){
  const { t } = useI18n();
  return (
    <>
    <div className="promo-bar" role="note" aria-label={t("banner.text")}>
      <div className="promo-track" aria-hidden="true">
        <div className="promo-group">
          <span className="promo-item">{t("banner.text")}</span>
          <span className="promo-dot">•</span>
          <span className="promo-item">{t("banner.text")}</span>
          <span className="promo-dot">•</span>
          <span className="promo-item">{t("banner.text")}</span>
          <span className="promo-dot">•</span>
          <span className="promo-item">{t("banner.text")}</span>
          <span className="promo-dot">•</span>
        </div>
        <div className="promo-group">
          <span className="promo-item">{t("banner.text")}</span>
          <span className="promo-dot">•</span>
          <span className="promo-item">{t("banner.text")}</span>
          <span className="promo-dot">•</span>
          <span className="promo-item">{t("banner.text")}</span>
          <span className="promo-dot">•</span>
          <span className="promo-item">{t("banner.text")}</span>
          <span className="promo-dot">•</span>
        </div>
      </div>
    </div>
    </>
  );
}
