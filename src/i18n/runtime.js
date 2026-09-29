import I18N from './translations.js';

/* Langue courante, partagée entre les composants React (via I18nProvider)
   et le code historique (chatbot, validations) qui appelle t() directement. */
export const LANGS = ['fr', 'en', 'es', 'pt', 'zh'];
let current = 'fr';

export function getLang(){ return current; }
export function setRuntimeLang(lang){ current = I18N[lang] ? lang : 'fr'; }

export function t(key){
  const dict = I18N[current] || I18N.fr;
  if(dict[key] !== undefined) return dict[key];
  return I18N.fr[key] !== undefined ? I18N.fr[key] : key;
}

export function initialLang(){
  try{
    const saved = localStorage.getItem('sosAbeillesLang');
    if(saved && I18N[saved]) return saved;
  }catch(e){ /* stockage indisponible : français par défaut */ }
  return 'fr';
}
