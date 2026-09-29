import { useMemo, useRef, useState } from 'react';
import { COMMUNES } from '../lib/communes.js';

const SAVED = '#23945A';   // couleur du statut « récupéré »
const nf = new Intl.NumberFormat('fr-FR');
const pf = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 0 });
const monthFmt = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
const monthLongFmt = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });

function monthStart(d){ return new Date(d.getFullYear(), d.getMonth(), 1); }
function addMonths(d, n){ return new Date(d.getFullYear(), d.getMonth() + n, 1); }
function monthKey(d){ return d.getFullYear() * 12 + d.getMonth(); }

function periodRange(id, reports){
  const now = new Date();
  const thisMonth = monthStart(now);
  if(id === 'year') return { from: new Date(now.getFullYear(), 0, 1), to: addMonths(thisMonth, 1), label: `en ${now.getFullYear()}` };
  if(id === 'prev') return { from: new Date(now.getFullYear() - 1, 0, 1), to: new Date(now.getFullYear(), 0, 1), label: `en ${now.getFullYear() - 1}` };
  if(id === 'all'){
    const first = reports.reduce((m, r) => Math.min(m, new Date(r.created_at).getTime()), Date.now());
    const from = monthStart(new Date(first));
    const minFrom = addMonths(thisMonth, -35);
    return { from: from < minFrom ? minFrom : from, allFrom: new Date(0), to: addMonths(thisMonth, 1), label: 'depuis le début' };
  }
  return { from: addMonths(thisMonth, -11), to: addMonths(thisMonth, 1), label: 'sur 12 mois' };
}

function median(values){
  if(!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function formatDelay(ms){
  if(ms == null) return '—';
  const h = ms / 3600000;
  if(h < 1) return 'moins d\'1 h';
  if(h < 48) return `${Math.round(h)} h`;
  return `${(h / 24).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} j`;
}

function inRange(iso, from, to){
  if(!iso) return false;
  const t = new Date(iso).getTime();
  return t >= from.getTime() && t < to.getTime();
}

/* Statistiques internes : essaims sauvés par commune et par mois, délais, taux. */
export default function StatsView({ reports }){
  const [period, setPeriod] = useState('12m');
  const [tip, setTip] = useState(null);
  const wrapRef = useRef(null);

  const stats = useMemo(() => {
    if(!reports) return null;
    const range = periodRange(period, reports);
    const countFrom = range.allFrom || range.from;
    const received = reports.filter((r) => inRange(r.created_at, countFrom, range.to));
    const saved = reports.filter((r) => r.status === 'recupere' && inRange(r.recovered_at, countFrom, range.to));
    const closed = received.filter((r) => r.status === 'recupere' || r.status === 'annule');
    const successRate = closed.length ? closed.filter((r) => r.status === 'recupere').length / closed.length : null;
    const delay = median(saved.map((r) => new Date(r.recovered_at) - new Date(r.created_at)).filter((x) => x >= 0));
    const waiting = reports.filter((r) => r.status === 'nouveau' || r.status === 'planifie').length;

    const byCommune = COMMUNES.map((c) => {
      const rec = received.filter((r) => r.commune === c.nom);
      const sav = saved.filter((r) => r.commune === c.nom);
      const cl = rec.filter((r) => r.status === 'recupere' || r.status === 'annule');
      return {
        commune: c.nom,
        received: rec.length,
        saved: sav.length,
        cancelled: rec.filter((r) => r.status === 'annule').length,
        open: rec.filter((r) => r.status === 'nouveau' || r.status === 'planifie').length,
        rate: cl.length ? cl.filter((r) => r.status === 'recupere').length / cl.length : null,
        delay: median(sav.map((r) => new Date(r.recovered_at) - new Date(r.created_at)).filter((x) => x >= 0))
      };
    }).sort((a, b) => b.saved - a.saved || b.received - a.received || a.commune.localeCompare(b.commune));

    const months = [];
    const current = monthKey(new Date());
    for(let d = monthStart(range.from); d < range.to; d = addMonths(d, 1)){
      const k = monthKey(d);
      months.push({
        date: d,
        current: k === current,
        saved: saved.filter((r) => monthKey(new Date(r.recovered_at)) === k).length,
        received: received.filter((r) => monthKey(new Date(r.created_at)) === k).length
      });
    }
    return { range, received, saved, successRate, delay, waiting, byCommune, months };
  }, [reports, period]);

  if(!reports) return <div className="bk-loading">Chargement…</div>;

  const { range, byCommune, months } = stats;
  const maxCommune = Math.max(1, ...byCommune.map((c) => c.saved));
  const maxMonth = Math.max(1, ...months.map((m) => m.saved));
  // Graduation « ronde » et paire : la ligne du milieu tombe toujours sur un entier
  const niceMax = [4, 6, 8, 10, 20, 30, 40, 50, 60, 80, 100, 200, 500, 1000].find((v) => v >= maxMonth) || Math.ceil(maxMonth / 100) * 100;
  const ticks = [0, niceMax / 2, niceMax];

  function showTip(e, content){
    const box = wrapRef.current.getBoundingClientRect();
    const target = e.currentTarget.getBoundingClientRect();
    setTip({ x: target.left + target.width / 2 - box.left, y: target.top - box.top, content });
  }
  const hideTip = () => setTip(null);

  function exportCsv(){
    const head = ['Commune', 'Signalements reçus', 'Essaims récupérés', 'Annulés', 'En cours', 'Taux de réussite', 'Délai médian (heures)'];
    const rows = byCommune.map((c) => [c.commune, c.received, c.saved, c.cancelled, c.open,
      c.rate == null ? '' : Math.round(c.rate * 100) + ' %', c.delay == null ? '' : Math.round(c.delay / 3600000)]);
    const csv = [head, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `essaims-par-commune-${period}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return (
    <section className="bk-view bk-stats" ref={wrapRef}>
      <div className="bk-view-head bk-view-head-row">
        <div>
          <h1>Statistiques</h1>
          <p className="bk-muted">Calculées en direct à partir des signalements.</p>
        </div>
        <label className="bk-field bk-field-inline">
          <span className="visually-hidden">Période</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="12m">12 derniers mois</option>
            <option value="year">Cette année</option>
            <option value="prev">L'an dernier</option>
            <option value="all">Depuis le début</option>
          </select>
        </label>
      </div>

      <div className="bk-kpis">
        <div className="bk-kpi bk-kpi-hero">
          <span className="bk-kpi-value">{nf.format(stats.saved.length)}</span>
          <span className="bk-kpi-label">essaims récupérés {range.label}</span>
        </div>
        <div className="bk-kpi">
          <span className="bk-kpi-value">{nf.format(stats.received.length)}</span>
          <span className="bk-kpi-label">signalements reçus</span>
        </div>
        <div className="bk-kpi">
          <span className="bk-kpi-value">{stats.successRate == null ? '—' : pf.format(stats.successRate)}</span>
          <span className="bk-kpi-label">taux de réussite <small>(récupérés parmi les dossiers clos)</small></span>
        </div>
        <div className="bk-kpi">
          <span className="bk-kpi-value">{formatDelay(stats.delay)}</span>
          <span className="bk-kpi-label">délai médian signalement → récupération</span>
        </div>
        <div className="bk-kpi">
          <span className="bk-kpi-value">{nf.format(stats.waiting)}</span>
          <span className="bk-kpi-label">en attente aujourd'hui <small>(nouveaux + planifiés)</small></span>
        </div>
      </div>

      <div className="bk-charts">
        <figure className="bk-panel bk-chart">
          <figcaption>
            <h2>Essaims récupérés par commune</h2>
            <p className="bk-muted bk-small">{range.label} · en gris : nombre de signalements reçus</p>
          </figcaption>
          <ul className="bk-hbars">
            {byCommune.map((c) => (
              <li key={c.commune} className="bk-hbar-row" tabIndex={0}
                  aria-label={`${c.commune} : ${c.saved} récupérés sur ${c.received} signalements`}
                  onMouseEnter={(e) => showTip(e, <><strong>{c.commune}</strong><span>{c.saved} récupéré{c.saved > 1 ? 's' : ''} · {c.received} signalement{c.received > 1 ? 's' : ''}</span>{c.rate != null && <span>Taux de réussite {pf.format(c.rate)}</span>}</>)}
                  onFocus={(e) => showTip(e, <><strong>{c.commune}</strong><span>{c.saved} récupérés · {c.received} signalements</span></>)}
                  onMouseLeave={hideTip} onBlur={hideTip}>
                <span className="bk-hbar-name">{c.commune}</span>
                <span className="bk-hbar-track">
                  <span className="bk-hbar" style={{ width: `${(c.saved / maxCommune) * 100}%`, background: SAVED }} />
                </span>
                <span className="bk-hbar-value">{c.saved}<span className="bk-muted"> / {c.received}</span></span>
              </li>
            ))}
          </ul>
        </figure>

        <figure className="bk-panel bk-chart">
          <figcaption>
            <h2>Essaims récupérés par mois</h2>
            <p className="bk-muted bk-small">Mois en cours hachuré (pas encore terminé)</p>
          </figcaption>
          <div className="bk-cols" style={{ '--n': months.length }}>
            <div className="bk-cols-grid" aria-hidden="true">
              {ticks.slice().reverse().map((t) => <span key={t}><em>{t}</em></span>)}
            </div>
            <ol className="bk-cols-bars">
              {months.map((m, i) => {
                const label = monthLongFmt.format(m.date);
                const showLabel = months.length <= 12 || i % 3 === 0 || m.current;
                return (
                  <li key={m.date.toISOString()} className={'bk-col' + (m.current ? ' is-current' : '')} tabIndex={0}
                      aria-label={`${label} : ${m.saved} récupérés, ${m.received} signalements reçus`}
                      onMouseEnter={(e) => showTip(e, <><strong>{label}{m.current ? ' (en cours)' : ''}</strong><span>{m.saved} récupéré{m.saved > 1 ? 's' : ''} · {m.received} signalement{m.received > 1 ? 's' : ''}</span></>)}
                      onFocus={(e) => showTip(e, <><strong>{label}</strong><span>{m.saved} récupérés · {m.received} signalements</span></>)}
                      onMouseLeave={hideTip} onBlur={hideTip}>
                    <span className="bk-col-area">
                      <span className="bk-col-bar" style={{ height: `${(m.saved / niceMax) * 100}%`, background: SAVED }} />
                    </span>
                    <span className="bk-col-label">{showLabel ? monthFmt.format(m.date).replace('.', '') : ''}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </figure>
      </div>

      <section className="bk-panel">
        <div className="bk-panel-head">
          <h2>Détail par commune</h2>
          <button type="button" className="bk-btn" onClick={exportCsv}>Exporter (CSV)</button>
        </div>
        <div className="bk-table-wrap">
          <table className="bk-table">
            <thead>
              <tr>
                <th scope="col">Commune</th>
                <th scope="col" className="num">Reçus</th>
                <th scope="col" className="num">Récupérés</th>
                <th scope="col" className="num">Annulés</th>
                <th scope="col" className="num">En cours</th>
                <th scope="col" className="num">Réussite</th>
                <th scope="col" className="num">Délai médian</th>
              </tr>
            </thead>
            <tbody>
              {byCommune.map((c) => (
                <tr key={c.commune}>
                  <th scope="row">{c.commune}</th>
                  <td className="num">{c.received}</td>
                  <td className="num"><strong>{c.saved}</strong></td>
                  <td className="num">{c.cancelled}</td>
                  <td className="num">{c.open}</td>
                  <td className="num">{c.rate == null ? '—' : pf.format(c.rate)}</td>
                  <td className="num">{formatDelay(c.delay)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <td className="num">{stats.received.length}</td>
                <td className="num"><strong>{stats.saved.length}</strong></td>
                <td className="num">{byCommune.reduce((s, c) => s + c.cancelled, 0)}</td>
                <td className="num">{byCommune.reduce((s, c) => s + c.open, 0)}</td>
                <td className="num">{stats.successRate == null ? '—' : pf.format(stats.successRate)}</td>
                <td className="num">{formatDelay(stats.delay)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="bk-muted bk-small">Les signalements anonymisés (après 12 mois) restent comptés. Le total « essaims sauvés » affiché sur le site public est calculé de la même façon, sans aucune donnée personnelle.</p>
      </section>

      {tip && (
        <div className="bk-tip" style={{ left: tip.x, top: tip.y }} role="tooltip">{tip.content}</div>
      )}
    </section>
  );
}
