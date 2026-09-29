import { useI18n } from '../../i18n/I18nProvider.jsx';

/* Boîte « Signaler un essaim » : chatbot en 10 étapes (logique dans legacy/chatbot.js). */
export default function ReportModal(){
  const { t } = useI18n();
  return (
    <>
    <div className="modal-backdrop" id="report-backdrop" hidden></div>
    <div className="loading-overlay" id="loading-overlay" hidden aria-live="polite" aria-label={t("loading.aria")}>
      <div className="hive-loader" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
      <p>{t("loading.text")}</p>
    </div>
    <div className="report-modal" id="report-modal" data-clarity-mask="True" hidden role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
      <button type="button" className="modal-close" id="report-modal-close" aria-label={t("modal.close")}>×</button>
      <div className="section-head">
        <h2 id="report-modal-title">{t("report.title")}</h2>
        <p>{t("report.subtitle")}</p>
      </div>

        <div className="chat-progress" aria-hidden="true"><div className="chat-progress-bar" id="chat-progress-bar"></div></div>
        <p className="chat-progress-label" id="chat-progress-label">Étape 1 sur 10</p>

        <div className="chatbox">
          <div className="chat-log" id="chat-log" aria-live="polite"></div>

          {/* Les signalements vont dans la base Supabase (src/lib/reports.js), plus par Netlify Forms. */}
          <form id="swarm-form" noValidate>
            <p className="visually-hidden" aria-hidden="true">
              <label>Ne pas remplir ce champ : <input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
            </p>

            <div className="chat-step" data-step="1" hidden>
              <div className="field">
                <label htmlFor="nom">{t("step1.label")}</label>
                <input type="text" id="nom" name="nom" required autoComplete="name" />
              </div>
              <button type="button" className="btn-step">{t("btn.continue")}</button>
            </div>

            <div className="chat-step" data-step="2" hidden>
              <div className="field">
                <label htmlFor="telephone">{t("step2.label")}</label>
                <input type="tel" id="telephone" name="telephone" required autoComplete="tel" />
              </div>
              <button type="button" className="btn-step">{t("btn.continue")}</button>
            </div>

            <div className="chat-step" data-step="3" hidden>
              <div className="field">
                <label htmlFor="email"><span>{t("step3.label")}</span>
                  <span className="hint">{t("step3.hint")}</span>
                </label>
                <input type="email" id="email" name="email" required autoComplete="email" />
              </div>
              <button type="button" className="btn-step">{t("btn.continue")}</button>
            </div>

            <div className="chat-step" data-step="4" hidden>
              <div className="field">
                <label>{t("step4.label")}</label>
                <select defaultValue="" id="commune" name="commune" required className="visually-hidden" tabIndex={-1} aria-hidden="true">
                  <option value="" disabled>Choisir une commune</option>
                  <option>Cayenne</option>
                  <option>Rémire-Montjoly</option>
                  <option>Matoury</option>
                  <option>Macouria</option>
                  <option>Montsinéry-Tonnegrande</option>
                  <option>Roura</option>
                </select>
                <div className="choice-row" data-target="commune">
                  <button type="button" className="choice-btn">Cayenne</button>
                  <button type="button" className="choice-btn">Rémire-Montjoly</button>
                  <button type="button" className="choice-btn">Matoury</button>
                  <button type="button" className="choice-btn">Macouria</button>
                  <button type="button" className="choice-btn">Montsinéry-Tonnegrande</button>
                  <button type="button" className="choice-btn">Roura</button>
                </div>
              </div>
            </div>

            <div className="chat-step" data-step="5" hidden>
              <div className="field">
                <label htmlFor="adresse">{t("step5.label")}</label>
                <input type="text" id="adresse" name="adresse" placeholder={t("step5.placeholder")} required />
                <input type="hidden" id="geo-lat" name="lat" />
                <input type="hidden" id="geo-lng" name="lng" />
                <div className="geo-row">
                  <button type="button" className="btn-geo" id="geo-btn">{t("step5.geo")}</button>
                  <span className="geo-status" id="geo-status" aria-live="polite"></span>
                </div>
                <span className="hint geo-hint">{t("step5.geoHint")}</span>
              </div>
              <button type="button" className="btn-step">{t("btn.continue")}</button>
            </div>

            <div className="chat-step" data-step="6" hidden>
              <div className="field">
                <label htmlFor="emplacement"><span>{t("step6.label")}</span>
                  <span className="hint">{t("step6.hint")}</span>
                </label>
                <input type="text" id="emplacement" name="emplacement" required />
              </div>
              <button type="button" className="btn-step">{t("btn.continue")}</button>
            </div>

            <div className="chat-step" data-step="7" hidden>
              <div className="field">
                <label>{t("step7.label")}</label>
                <select defaultValue="Aujourd'hui" id="depuis" name="depuis" className="visually-hidden" tabIndex={-1} aria-hidden="true">
                  <option value="Aujourd'hui">Aujourd'hui</option>
                  <option>Depuis hier</option>
                  <option>Depuis plus de 2 jours</option>
                  <option>Je ne sais pas</option>
                </select>
                <div className="choice-row" data-target="depuis">
                  <button type="button" className="choice-btn" data-value="Aujourd'hui">{t("depuis.opt1")}</button>
                  <button type="button" className="choice-btn" data-value="Depuis hier">{t("depuis.opt2")}</button>
                  <button type="button" className="choice-btn" data-value="Depuis plus de 2 jours">{t("depuis.opt3")}</button>
                  <button type="button" className="choice-btn" data-value="Je ne sais pas">{t("depuis.opt4")}</button>
                </div>
              </div>
            </div>

            <div className="chat-step" data-step="8" hidden>
              <fieldset>
                <legend>{t("step8.legend")}</legend>
                <input type="radio" name="urgence" id="urg-1" value="Faible - zone peu fréquentée" defaultChecked className="visually-hidden" tabIndex={-1} />
                <input type="radio" name="urgence" id="urg-2" value="Moyenne - proche d'un passage" className="visually-hidden" tabIndex={-1} />
                <input type="radio" name="urgence" id="urg-3" value="Élevée - proche d'enfants, école ou lieu public" className="visually-hidden" tabIndex={-1} />
                <div className="choice-row vertical">
                  <button type="button" className="choice-btn" data-radio="urg-1">{t("step8.opt1")}</button>
                  <button type="button" className="choice-btn" data-radio="urg-2">{t("step8.opt2")}</button>
                  <button type="button" className="choice-btn" data-radio="urg-3">{t("step8.opt3")}</button>
                </div>
              </fieldset>
            </div>

            <div className="chat-step" data-step="9" hidden>
              <div className="field">
                <label htmlFor="photo"><span>{t("step9.label")}</span>
                  <span className="hint">{t("step9.hint")}</span>
                </label>
                <input type="file" id="photo" name="photo" accept="image/*" capture="environment" />
              </div>
              <div className="step-actions">
                <button type="button" className="btn-step">{t("btn.continue")}</button>
                <button type="button" className="btn-skip" data-skip="photo">{t("btn.skip")}</button>
              </div>
            </div>

            <div className="chat-step" data-step="10" hidden>
              <div className="field">
                <label htmlFor="message"><span>{t("step10.label")}</span>
                  <span className="hint">{t("step10.hint")}</span>
                </label>
                <textarea id="message" name="message"></textarea>
              </div>
              <div className="step-actions">
                <button type="button" className="btn-step">{t("btn.continue")}</button>
                <button type="button" className="btn-skip" data-skip="message">{t("btn.skip")}</button>
              </div>
            </div>

            <div className="chat-step" data-step="11" hidden>
              <div className="recap-card" id="recap-card"></div>
              <p className="privacy-note"><span>{t("recap.privacyPrefix")}</span> <button type="button" className="link-like open-privacy">{t("privacy.linkLabel")}</button>.</p>
              <div className="submit-row" id="submit-row">
                <button type="submit" className="btn-submit" id="submit-btn">{t("btn.submit")}</button>
                <span className="form-status" id="form-status"></span>
              </div>

              <div className="success-screen" id="success-screen" hidden>
                <div className="success-icon">🚀</div>
                <h3>{t("success.title")}</h3>
                <p>{t("success.text")}</p>
              </div>
            </div>
          </form>
        </div>
    </div>
    </>
  );
}
