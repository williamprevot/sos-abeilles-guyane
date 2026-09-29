import { useI18n } from '../../i18n/I18nProvider.jsx';

/* « Comment ça marche » en trois étapes. */
export default function HowItWorks(){
  const { t } = useI18n();
  return (
    <>
    <section id="comment-ca-marche">
      <div className="wrap">
        <div className="section-head">
          <h2>{t("steps.title")}</h2>
          <p>{t("steps.subtitle")}</p>
        </div>

        <div className="steps">
          <article className="step">
            <div className="step-num">1</div>
            <h3>{t("steps.1.title")}</h3>
            <p>{t("steps.1.text")}</p>
          </article>

          <article className="step">
            <div className="step-num">2</div>
            <h3>{t("steps.2.title")}</h3>
            <p>{t("steps.2.text")}</p>
          </article>

          <article className="step">
            <div className="step-num">3</div>
            <h3>{t("steps.3.title")}</h3>
            <p>{t("steps.3.text")}</p>
          </article>
        </div>
      </div>
    </section>
    </>
  );
}
