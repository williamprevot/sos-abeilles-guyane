import { useI18n } from '../../i18n/I18nProvider.jsx';

/* « En attendant l'intervention » : onglets À faire / À éviter / FAQ. */
export default function Consignes(){
  const { t } = useI18n();
  return (
    <>
    <section id="consignes">
      <div className="wrap">
        <div className="section-head">
          <h2>{t("consignes.title")}</h2>
          <p>{t("consignes.subtitle")}</p>
        </div>

        <div className="info-tabs">
          <div className="info-tab-nav" role="tablist">
            <button type="button" className="info-tab-btn active" data-tab="faire" role="tab" aria-selected="true" aria-controls="panel-faire">{t("tab.faire")}</button>
            <button type="button" className="info-tab-btn" data-tab="eviter" role="tab" aria-selected="false" aria-controls="panel-eviter">{t("tab.eviter")}</button>
            <button type="button" className="info-tab-btn" data-tab="faq" role="tab" aria-selected="false" aria-controls="panel-faq">{t("tab.faq")}</button>
          </div>

          <div className="info-tab-panel active" data-panel="faire" id="panel-faire" role="tabpanel">
            <ul className="info-list">
              <li dangerouslySetInnerHTML={{ __html: t("faire.1") }} />
              <li dangerouslySetInnerHTML={{ __html: t("faire.2") }} />
              <li dangerouslySetInnerHTML={{ __html: t("faire.3") }} />
              <li dangerouslySetInnerHTML={{ __html: t("faire.4") }} />
              <li>{t("faire.5")}</li>
            </ul>
          </div>

          <div className="info-tab-panel" data-panel="eviter" id="panel-eviter" role="tabpanel" hidden>
            <ul className="info-list">
              <li dangerouslySetInnerHTML={{ __html: t("eviter.1") }} />
              <li dangerouslySetInnerHTML={{ __html: t("eviter.2") }} />
              <li>{t("eviter.3")}</li>
              <li>{t("eviter.4")}</li>
            </ul>
          </div>

          <div className="info-tab-panel" data-panel="faq" id="panel-faq" role="tabpanel" hidden>
            <div className="faq-list">
              <details className="faq-item">
                <summary>{t("faq.1.q")}</summary>
                <p dangerouslySetInnerHTML={{ __html: t("faq.1.a") }} />
              </details>
              <details className="faq-item">
                <summary>{t("faq.2.q")}</summary>
                <p dangerouslySetInnerHTML={{ __html: t("faq.2.a") }} />
              </details>
              <details className="faq-item">
                <summary>{t("faq.3.q")}</summary>
                <p dangerouslySetInnerHTML={{ __html: t("faq.3.a") }} />
              </details>
              <details className="faq-item">
                <summary>{t("faq.4.q")}</summary>
                <p dangerouslySetInnerHTML={{ __html: t("faq.4.a") }} />
              </details>
              <details className="faq-item">
                <summary>{t("faq.5.q")}</summary>
                <p dangerouslySetInnerHTML={{ __html: t("faq.5.a") }} />
              </details>
              <details className="faq-item">
                <summary>{t("faq.6.q")}</summary>
                <p dangerouslySetInnerHTML={{ __html: t("faq.6.a") }} />
              </details>
              <details className="faq-item">
                <summary>{t("faq.7.q")}</summary>
                <p dangerouslySetInnerHTML={{ __html: t("faq.7.a") }} />
              </details>
              <details className="faq-item">
                <summary>{t("faq.8.q")}</summary>
                <p dangerouslySetInnerHTML={{ __html: t("faq.8.a") }} />
              </details>
              <details className="faq-item">
                <summary>{t("faq.9.q")}</summary>
                <p dangerouslySetInnerHTML={{ __html: t("faq.9.a") }} />
              </details>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
