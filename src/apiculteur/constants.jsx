/* Statuts d'un signalement. Couleurs validées (daltonisme, contraste) et
   toujours accompagnées d'un pictogramme + d'un libellé, jamais seules. */
export const STATUSES = [
  { id: 'nouveau',  label: 'Nouveau',             short: 'Nouveaux',   color: '#C4851A' },
  { id: 'planifie', label: 'Planifié',            short: 'Planifiés',  color: '#3A7FD4' },
  { id: 'recupere', label: 'Essaim récupéré',     short: 'Récupérés',  color: '#23945A' },
  { id: 'annule',   label: 'Annulé / sans suite', short: 'Annulés',    color: '#8A938C' }
];
export const STATUS = Object.fromEntries(STATUSES.map((s) => [s.id, s]));

/* Pictogramme de chaque statut (tracés SVG 16×16), partagé par les badges et la carte. */
export const STATUS_GLYPH = {
  nouveau:  '<path d="M8 3v6"/><path d="M8 12.5v.01"/>',
  planifie: '<circle cx="8" cy="8" r="5.5"/><path d="M8 5v3.2l2 1.3"/>',
  recupere: '<path d="M3.5 8.5l3 3 6-7"/>',
  annule:   '<path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/>'
};
export function glyphSvg(status, size = 14, stroke = 'currentColor'){
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${STATUS_GLYPH[status] || STATUS_GLYPH.nouveau}</svg>`;
}
export function StatusIcon({ status, size = 14 }){
  return <span className="bk-glyph" dangerouslySetInnerHTML={{ __html: glyphSvg(status, size) }} />;
}

export function StatusBadge({ status }){
  const s = STATUS[status] || STATUS.nouveau;
  return (
    <span className={'bk-status bk-status-' + s.id}>
      <span className="bk-status-dot" style={{ background: s.color }}><StatusIcon status={s.id} size={11} /></span>
      {s.label}
    </span>
  );
}

/* Urgence : le texte enregistré commence par « Faible », « Moyenne » ou « Élevée ». */
export function urgencyLevel(urgence){
  const u = (urgence || '').toLowerCase();
  if(u.startsWith('élev') || u.startsWith('elev')) return 3;
  if(u.startsWith('moy')) return 2;
  if(u.startsWith('faib')) return 1;
  return 0;
}
export function urgencyLabel(urgence){
  return ['Non précisée', 'Faible', 'Moyenne', 'Élevée'][urgencyLevel(urgence)];
}

const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
export function timeAgo(iso){
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if(abs < 60) return 'à l\'instant';
  if(abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if(abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if(abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day');
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}
export function formatDateTime(iso){
  return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}

export function escapeHtml(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function telHref(tel){ return 'tel:' + String(tel || '').replace(/[^\d+]/g, ''); }

export function directionsLinks(r){
  const hasPos = r.lat != null && r.lng != null;
  const dest = hasPos ? `${r.lat},${r.lng}` : `${r.adresse || ''}, ${r.commune}, Guyane`;
  return {
    google: 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(dest),
    waze: hasPos
      ? `https://waze.com/ul?ll=${r.lat},${r.lng}&navigate=yes`
      : 'https://waze.com/ul?q=' + encodeURIComponent(dest) + '&navigate=yes'
  };
}

export function displayName(profile){
  if(!profile) return '';
  return profile.display_name || (profile.email ? profile.email.split('@')[0] : 'Membre');
}

export function formatDate(iso){
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}
