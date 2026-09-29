import { supabase, supabaseConfigured, PHOTO_BUCKET } from './supabase.js';
import { getLang } from '../i18n/runtime.js';

/* EmailJS — service + 2 modèles (notification apiculteur, confirmation habitant).
   Aucune adresse email en dur : les destinataires sont réglés dans le modèle EmailJS. */
const EMAILJS_PUBLIC_KEY = 'p82valRt_i5V00YJK';
const EMAILJS_SERVICE_ID = 'service_hwx119g';
const TEMPLATE_NOTIFY = 'template_vmgefba';   // Notification apiculteur (+ copie dev)
const TEMPLATE_CONFIRM = 'template_b3x7ci3';  // Confirmation habitant, immédiate

let emailjsReady = false;
function emailjsClient(){
  if(!window.emailjs) return null;
  if(!emailjsReady){ window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); emailjsReady = true; }
  return window.emailjs;
}

function newId(){
  if(window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
  // Repli pour les très vieux navigateurs
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function numberOrNull(v){
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Enregistre un signalement : photo (bucket privé) + ligne dans la table
 * « reports », puis prévient l'apiculteur et l'habitant par email.
 * Si la base n'est pas encore configurée, seuls les emails partent (comme avant).
 */
export async function submitReport(raw, photoFile){
  const id = newId();
  const reference = 'SOS-' + Date.now().toString(36).toUpperCase();
  const lat = numberOrNull(raw.lat);
  const lng = numberOrNull(raw.lng);
  let photoPath = null;
  let photoSaved = false;

  if(supabaseConfigured){
    if(photoFile){
      const path = `reports/${id}/photo.jpg`;
      const { error: upErr } = await supabase.storage.from(PHOTO_BUCKET)
        .upload(path, photoFile, { contentType: photoFile.type || 'image/jpeg', upsert: false });
      if(upErr){ console.error('Photo non enregistrée', upErr); }
      else { photoPath = path; photoSaved = true; }
    }
    const { error } = await supabase.from('reports').insert({
      id,
      reference,
      nom: raw.nom,
      telephone: raw.telephone,
      email: raw.email,
      commune: raw.commune,
      adresse: raw.adresse,
      emplacement: raw.emplacement,
      depuis: raw.depuis || null,
      urgence: raw.urgence || null,
      message: raw.message || null,
      photo_path: photoPath,
      lat,
      lng,
      geo_source: lat !== null && lng !== null ? 'gps' : null,
      lang: getLang()
    });
    if(error) throw error;
  }

  const origin = window.location.origin;
  const notifyParams = {
    request_id: reference,
    client_nom: raw.nom,
    client_telephone: raw.telephone,
    client_email: raw.email,
    commune: raw.commune,
    adresse: raw.adresse,
    emplacement: raw.emplacement,
    depuis: raw.depuis,
    urgence: raw.urgence,
    message: raw.message || '—',
    a_photo: photoSaved
      ? 'Oui — visible dans l\'espace apiculteur.'
      : (photoFile ? 'Photo envoyée mais non enregistrée (voir l\'espace apiculteur).' : 'Aucune photo jointe.'),
    lien_espace: supabaseConfigured ? `${origin}/apiculteur/signalements/${id}` : `${origin}/apiculteur`
  };
  const confirmParams = {
    to_email: raw.email,
    client_nom: raw.nom,
    client_telephone: raw.telephone,
    commune: raw.commune,
    adresse: raw.adresse,
    emplacement: raw.emplacement,
    depuis: raw.depuis,
    urgence: raw.urgence,
    message: raw.message || 'Aucun',
    a_photo: photoFile ? 'Oui' : 'Aucune',
    request_id: reference
  };

  const ejs = emailjsClient();
  const sends = ejs ? [
    ejs.send(EMAILJS_SERVICE_ID, TEMPLATE_NOTIFY, notifyParams),
    ejs.send(EMAILJS_SERVICE_ID, TEMPLATE_CONFIRM, confirmParams)
  ] : [];

  if(supabaseConfigured){
    // Le signalement est déjà en sécurité dans la base : un souci d'email ne bloque pas l'habitant.
    const results = await Promise.allSettled(sends);
    results.forEach((r) => { if(r.status === 'rejected') console.error('Email non envoyé', r.reason); });
  }else{
    if(!ejs) throw new Error('EmailJS indisponible');
    await Promise.all(sends);
  }
  return { id, reference };
}
