import { useI18n } from '../../i18n/I18nProvider.jsx';

/* Carte de la zone d'intervention (Leaflet, initialisée par legacy/zoneMap.js). */
export default function Zone(){
  const { t } = useI18n();
  return (
    <>
    <section id="zone">
      <div className="wrap">
        <div className="section-head">
          <h2>{t("zone.title")}</h2>
          <p>{t("zone.subtitle")}</p>
        </div>
        <div id="zone-leaflet-map" className="zone-leaflet-map" role="img" aria-label={t("zone.mapAria")}></div>
        <p className="map-note visually-hidden">{t("zone.mapNote")}</p>
      </div>
    </section>
    </>
  );
}
