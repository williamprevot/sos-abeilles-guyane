import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { supabase, supabaseConfigured } from '../../lib/supabase.js';

/* « Essaims sauvés » : chiffres publics par commune (uniquement des totaux,
   aucune donnée personnelle — fonction public_stats() de la base).
   La section reste cachée tant qu'aucun essaim n'a été récupéré. */
export default function PublicStats(){
  const { t, lang } = useI18n();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    if(!supabaseConfigured) return;
    let alive = true;
    supabase.rpc('public_stats').then(({ data, error }) => {
      if(!alive) return;
      if(error){ console.error(error); return; }
      setRows(data || []);
    });
    return () => { alive = false; };
  }, []);

  if(!rows) return null;
  const total = rows.reduce((s, r) => s + Number(r.sauves || 0), 0);
  if(total === 0) return null;
  const max = Math.max(...rows.map((r) => Number(r.sauves || 0)), 1);
  const fmt = new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : lang);

  return (
    <section id="essaims-sauves" className="public-stats">
      <div className="wrap">
        <div className="section-head">
          <h2>{t('stats.title')}</h2>
          <p>{t('stats.subtitle')}</p>
        </div>
        <div className="ps-grid">
          <div className="ps-hero">
            <span className="ps-hero-value">{fmt.format(total)}</span>
            <span className="ps-hero-label">{t('stats.total')}</span>
          </div>
          <ul className="ps-bars">
            {rows.map((r) => {
              const v = Number(r.sauves || 0);
              return (
                <li key={r.commune} className="ps-row" title={`${r.commune} : ${fmt.format(v)}`}>
                  <span className="ps-name">{r.commune}</span>
                  <span className="ps-track" aria-hidden="true">
                    <span className="ps-bar" style={{ width: `${(v / max) * 100}%` }} />
                  </span>
                  <span className="ps-value">{fmt.format(v)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
