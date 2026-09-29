import { supabase, PHOTO_BUCKET } from '../lib/supabase.js';

/* Accès aux données de l'espace apiculteur. Toutes ces requêtes passent par
   les règles de sécurité de la base : sans compte apiculteur/admin, rien ne revient. */

export async function fetchReports(){
  const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
  if(error) throw error;
  return data || [];
}

export async function fetchEvents(reportId){
  const { data, error } = await supabase.from('report_events').select('*')
    .eq('report_id', reportId).order('created_at', { ascending: true });
  if(error) throw error;
  return data || [];
}

export async function updateReport(id, patch){
  const { data, error } = await supabase.from('reports').update(patch).eq('id', id).select().single();
  if(error) throw error;
  return data;
}

export async function deleteReport(report){
  if(report.photo_path){
    const { error: photoErr } = await supabase.storage.from(PHOTO_BUCKET).remove([report.photo_path]);
    if(photoErr) throw photoErr;
  }
  const { error } = await supabase.from('reports').delete().eq('id', report.id);
  if(error) throw error;
}

/* Photos : liens temporaires (1 h), gardés en mémoire 50 minutes. */
const urlCache = new Map();
export async function photoUrls(paths){
  const now = Date.now();
  const wanted = [...new Set(paths.filter(Boolean))];
  const missing = wanted.filter((p) => { const c = urlCache.get(p); return !c || c.exp < now; });
  if(missing.length){
    const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(missing, 3600);
    if(error) throw error;
    (data || []).forEach((d) => { if(d.signedUrl) urlCache.set(d.path, { url: d.signedUrl, exp: now + 50 * 60 * 1000 }); });
  }
  return Object.fromEntries(wanted.map((p) => [p, urlCache.has(p) ? urlCache.get(p).url : null]));
}

/* Conservation : efface photos puis données personnelles des signalements clos
   depuis plus de 12 mois (admin uniquement, contrôlé aussi côté base). */
export const RETENTION_MONTHS = 12;
export function isExpired(report, now = new Date()){
  if(report.anonymized_at || !['recupere', 'annule'].includes(report.status)) return false;
  const limit = new Date(now); limit.setMonth(limit.getMonth() - RETENTION_MONTHS);
  return new Date(report.status_changed_at) < limit;
}
export async function anonymizeReports(reports){
  const paths = reports.map((r) => r.photo_path).filter(Boolean);
  for(let i = 0; i < paths.length; i += 100){
    const { error } = await supabase.storage.from(PHOTO_BUCKET).remove(paths.slice(i, i + 100));
    if(error) throw error;
  }
  paths.forEach((p) => urlCache.delete(p));
  const { data, error } = await supabase.rpc('anonymize_reports', { report_ids: reports.map((r) => r.id) });
  if(error) throw error;
  return data;
}

/* Situe une adresse sur la carte (MapTiler, déjà utilisé pour la carte du site). */
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || 'BWLQgt3asW0Wt5A6AKvg';
export async function geocodeAddress(adresse, commune){
  const q = encodeURIComponent(`${adresse}, ${commune}, Guyane`);
  const res = await fetch(`https://api.maptiler.com/geocoding/${q}.json?key=${MAPTILER_KEY}&country=gf&limit=1&language=fr`);
  if(!res.ok) return null;
  const json = await res.json();
  const f = json && json.features && json.features[0];
  if(!f || !Array.isArray(f.center)) return null;
  const [lng, lat] = f.center;
  if(lat < 1.5 || lat > 6.5 || lng < -55.5 || lng > -50.5) return null;
  return { lat, lng };
}

export async function fetchProfiles(){
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
  if(error) throw error;
  return data || [];
}

export async function updateProfile(id, patch){
  const { error } = await supabase.from('profiles').update(patch).eq('id', id);
  if(error) throw error;
}

/* Invitations et retraits : passent par la fonction Netlify « team »
   (elle seule détient la clé secrète service_role). */
export async function teamAction(body){
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch('/.netlify/functions/team', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session ? session.access_token : ''}` },
    body: JSON.stringify(body)
  });
  let json = {};
  try{ json = await res.json(); }catch(e){ /* réponse vide */ }
  if(!res.ok) throw new Error(json.error || `Erreur ${res.status}`);
  return json;
}
