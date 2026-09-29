/* Statuts d'un signalement. Couleurs validées (daltonisme, contraste) et
   toujours accompagnées d'un pictogramme + d'un libellé, jamais seules. */
export const STATUSES = [
  { id: 'nouveau',  label: 'Nouveau',             short: 'Nouveaux',   color: '#C4851A' },
  { id: 'planifie', label: 'Planifié',            short: 'Planifiés',  color: '#3A7FD4' },
  { id: 'recupere', label: 'Essaim récupéré',     short: 'Récupérés',  color: '#23945A' },
  { id: 'annule',   label: 'Annulé / sans suite', short: 'Annulés',    color: '#8A938C' }
];
export const STATUS = Object.fromEntries(STATUSES.map((s) => [s.id, s]));

/* Un petit point de la couleur du statut, toujours suivi du libellé. */
export function StatusDot({ status }){
  const s = STATUS[status] || STATUS.nouveau;
  return <span className={'bk-dot bk-dot-' + s.id} style={{ '--c': s.color }} aria-hidden="true" />;
}

export function StatusBadge({ status }){
  const s = STATUS[status] || STATUS.nouveau;
  return (
    <span className={'bk-status bk-status-' + s.id}>
      <StatusDot status={s.id} />
      {s.label}
    </span>
  );
}

/* Logo du site (trois alvéoles dorées), repris de l'en-tête public. */
export function BrandMark({ size = 30 }){
  return (
    <svg className="bk-mark" width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M20,2 L27.8,6.5 L27.8,15.5 L20,20 L12.2,15.5 L12.2,6.5 Z" stroke="#D9A02C" strokeWidth="1.8" />
      <path d="M13,15 L20.8,19.5 L20.8,28.5 L13,33 L5.2,28.5 L5.2,19.5 Z" stroke="#D9A02C" strokeWidth="1.8" />
      <path d="M27,15 L34.8,19.5 L34.8,28.5 L27,33 L19.2,28.5 L19.2,19.5 Z" stroke="#D9A02C" strokeWidth="1.8" />
    </svg>
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
