import { createClient } from '@supabase/supabase-js';

/* Connexion à la base Supabase. Les deux valeurs viennent des variables
   d'environnement Netlify (VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY).
   La clé « anon » est publique : ce sont les règles de sécurité de la base
   (Row Level Security, voir supabase/migrations) qui protègent les données. */
/* Seule l'origine compte (https://xxxx.supabase.co) : on tolère une adresse
   copiée avec un chemin (…/rest/v1/), une barre finale ou des espaces. */
function supabaseOrigin(value){
  let v = String(value || '').trim();
  if(v && !/^https?:\/\//i.test(v)) v = 'https://' + v;
  try{ return new URL(v).origin; }catch(e){ return ''; }
}
const url = supabaseOrigin(import.meta.env.VITE_SUPABASE_URL);
const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const supabaseConfigured = Boolean(url && anonKey);

/* Liens reçus par email (invitation, mot de passe oublié) : on garde une copie
   de l'adresse avant que Supabase ne la nettoie, pour savoir s'il faut proposer
   de choisir un mot de passe. Si le lien arrive sur la page d'accueil, on le
   renvoie vers l'espace apiculteur. */
export const INITIAL_HASH = typeof window !== 'undefined' ? window.location.hash : '';
if(typeof window !== 'undefined'
   && /(^#|&)(access_token|error_description)=/.test(INITIAL_HASH)
   && !/^\/apiculteur(\/|$)/.test(window.location.pathname)){
  window.history.replaceState(null, '', '/apiculteur' + window.location.search + INITIAL_HASH);
}

export const supabase = supabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' }
    })
  : null;

/* Bucket privé des photos d'essaims */
export const PHOTO_BUCKET = 'photos';
