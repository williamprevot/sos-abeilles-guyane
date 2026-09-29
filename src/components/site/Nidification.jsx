import { useI18n } from '../../i18n/I18nProvider.jsx';

/* Illustration « Où les essaims aiment s'installer ». */
export default function Nidification(){
  const { t } = useI18n();
  return (
    <>
    <section id="nidification">
      <div className="wrap">
        <div className="section-head">
          <h2>{t("nid.title")}</h2>
          <p>{t("nid.subtitle")}</p>
        </div>
        <div className="nest-scene">
          <svg className="nest-illustration" viewBox="0 0 800 420" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <line x1="0" y1="340" x2="800" y2="340" stroke="#3D5C3A" strokeWidth="2" opacity="0.7" />

            <line x1="150" y1="340" x2="150" y2="225" stroke="#F6EEDA" strokeWidth="4" />
            <path d="M150,120 C185,120 205,145 200,172 C215,180 214,205 195,212 C198,228 178,238 160,230 C142,240 118,230 118,212 C100,206 98,180 118,170 C112,145 128,120 150,120 Z" fill="none" stroke="#F6EEDA" strokeWidth="2.2" />

            <polygon points="360,180 500,100 640,180" fill="none" stroke="#F6EEDA" strokeWidth="2.5" />
            <rect x="380" y="180" width="240" height="160" fill="none" stroke="#F6EEDA" strokeWidth="2.5" />
            <rect x="470" y="255" width="60" height="85" fill="none" stroke="#F6EEDA" strokeWidth="2" />
            <rect x="400" y="205" width="45" height="45" fill="none" stroke="#F6EEDA" strokeWidth="2" />
            <line x1="422.5" y1="205" x2="422.5" y2="250" stroke="#F6EEDA" strokeWidth="1.5" />
            <line x1="400" y1="227.5" x2="445" y2="227.5" stroke="#F6EEDA" strokeWidth="1.5" />
            <rect x="555" y="205" width="45" height="45" fill="none" stroke="#F6EEDA" strokeWidth="2" />
            <line x1="577.5" y1="205" x2="577.5" y2="250" stroke="#F6EEDA" strokeWidth="1.5" />
            <line x1="555" y1="227.5" x2="600" y2="227.5" stroke="#F6EEDA" strokeWidth="1.5" />

            <rect x="392" y="290" width="26" height="34" rx="2" fill="none" stroke="#F6EEDA" strokeWidth="2" />

            <path d="M270,306 L276,330 L304,330 L310,306" fill="none" stroke="#F6EEDA" strokeWidth="2" />
            <ellipse cx="290" cy="306" rx="20" ry="5" fill="none" stroke="#F6EEDA" strokeWidth="2" />
            <path d="M276,304 C276,290 304,290 304,304" fill="none" stroke="#F6EEDA" strokeWidth="2" />

            <polygon points="645,280 702,232 760,280" fill="none" stroke="#F6EEDA" strokeWidth="2" />
            <rect x="650" y="280" width="105" height="60" fill="none" stroke="#F6EEDA" strokeWidth="2" />
            <rect x="656" y="320" width="28" height="20" fill="none" stroke="#F6EEDA" strokeWidth="2" />
            <rect x="662" y="302" width="16" height="18" fill="none" stroke="#F6EEDA" strokeWidth="1.5" />
          </svg>

          <button type="button" className="nest-hotspot" style={{ left: "18.7%", top: "39%" }} aria-label={t("nid.hotspot1.aria")}>
            <span className="hotspot-dot"></span>
            <span className="hotspot-tip" dangerouslySetInnerHTML={{ __html: t("nid.hotspot1.tip") }} />
          </button>
          <button type="button" className="nest-hotspot" style={{ left: "62.5%", top: "25%" }} aria-label={t("nid.hotspot2.aria")}>
            <span className="hotspot-dot"></span>
            <span className="hotspot-tip" dangerouslySetInnerHTML={{ __html: t("nid.hotspot2.tip") }} />
          </button>
          <button type="button" className="nest-hotspot" style={{ left: "36.25%", top: "76%" }} aria-label={t("nid.hotspot3.aria")}>
            <span className="hotspot-dot"></span>
            <span className="hotspot-tip" dangerouslySetInnerHTML={{ __html: t("nid.hotspot3.tip") }} />
          </button>
          <button type="button" className="nest-hotspot" style={{ left: "50.5%", top: "73%" }} aria-label={t("nid.hotspot4.aria")}>
            <span className="hotspot-dot"></span>
            <span className="hotspot-tip" dangerouslySetInnerHTML={{ __html: t("nid.hotspot4.tip") }} />
          </button>
          <button type="button" className="nest-hotspot" style={{ left: "83.75%", top: "76.2%" }} aria-label={t("nid.hotspot5.aria")}>
            <span className="hotspot-dot"></span>
            <span className="hotspot-tip" dangerouslySetInnerHTML={{ __html: t("nid.hotspot5.tip") }} />
          </button>
        </div>
      </div>
    </section>
    </>
  );
}
