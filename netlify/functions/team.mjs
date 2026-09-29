/* Fonction Netlify « team » : inviter ou retirer un membre de l'équipe.
 *
 * Ces deux actions demandent la clé secrète « service_role » de Supabase,
 * qui ne doit JAMAIS se trouver dans le code du site. Elle vit uniquement
 * dans les variables d'environnement Netlify (SUPABASE_SERVICE_ROLE_KEY)
 * et n'est utilisée qu'ici, côté serveur, après avoir vérifié que la
 * personne qui appelle est bien administrateur.
 */

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
});

const ROLES = new Set(['apiculteur', 'admin']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async (req) => {
  if(req.method !== 'POST') return json(405, { error: 'Méthode non autorisée' });

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url || !anonKey || !serviceKey){
    return json(500, { error: 'Fonction non configurée : ajoutez SUPABASE_SERVICE_ROLE_KEY dans Netlify (voir SETUP.md).' });
  }
  // Nouvelle clé secrète (sb_secret_…) : en-tête apikey seul. Ancienne clé service_role (JWT) : les deux.
  const admin = serviceKey.startsWith('sb_')
    ? { apikey: serviceKey, 'Content-Type': 'application/json' }
    : { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' };

  // 1) Qui appelle ? (jeton de session envoyé par l'espace apiculteur)
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if(!token) return json(401, { error: 'Connexion requise' });
  const who = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } });
  if(!who.ok) return json(401, { error: 'Session expirée, reconnectez-vous' });
  const caller = await who.json();

  // 2) Est-ce un administrateur ?
  const prof = await fetch(`${url}/rest/v1/profiles?id=eq.${caller.id}&select=role`, { headers: admin });
  const rows = prof.ok ? await prof.json() : [];
  if(!rows[0] || rows[0].role !== 'admin') return json(403, { error: 'Réservé aux administrateurs' });

  let body;
  try{ body = await req.json(); }catch(e){ return json(400, { error: 'Requête illisible' }); }

  // 3a) Inviter
  if(body.action === 'invite'){
    const email = String(body.email || '').trim().toLowerCase();
    const displayName = String(body.display_name || '').trim().slice(0, 80);
    const role = ROLES.has(body.role) ? body.role : 'apiculteur';
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return json(400, { error: 'Adresse email invalide' });

    // Lien de l'email : retour sur l'espace apiculteur du site qui a fait la demande
    const origin = req.headers.get('origin') || process.env.URL || '';
    const redirect = origin ? `?redirect_to=${encodeURIComponent(origin + '/apiculteur')}` : '';
    const inv = await fetch(`${url}/auth/v1/invite${redirect}`, {
      method: 'POST', headers: admin,
      body: JSON.stringify({ email, data: displayName ? { display_name: displayName } : {} })
    });
    const invBody = await inv.json().catch(() => ({}));
    if(!inv.ok){
      const msg = invBody.msg || invBody.message || invBody.error_description || '';
      if(/already been registered|already exists/i.test(msg)) return json(409, { error: 'Cette adresse a déjà un compte.' });
      if(/rate limit/i.test(msg)) return json(429, { error: 'Trop d\'emails envoyés récemment. Réessayez dans une heure (limite gratuite de Supabase).' });
      return json(502, { error: 'Invitation impossible : ' + (msg || inv.status) });
    }
    const userId = invBody.id || (invBody.user && invBody.user.id);
    if(userId){
      const patch = { role };
      if(displayName) patch.display_name = displayName;
      await fetch(`${url}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH', headers: { ...admin, Prefer: 'return=minimal' }, body: JSON.stringify(patch)
      });
    }
    return json(200, { ok: true, id: userId || null });
  }

  // 3b) Retirer l'accès (supprime le compte ; ses actions restent dans l'historique)
  if(body.action === 'remove'){
    const id = String(body.user_id || '');
    if(!UUID.test(id)) return json(400, { error: 'Identifiant invalide' });
    if(id === caller.id) return json(400, { error: 'Vous ne pouvez pas retirer votre propre accès.' });
    const del = await fetch(`${url}/auth/v1/admin/users/${id}`, { method: 'DELETE', headers: admin });
    if(!del.ok){
      const b = await del.json().catch(() => ({}));
      return json(502, { error: 'Retrait impossible : ' + (b.msg || b.message || del.status) });
    }
    return json(200, { ok: true });
  }

  return json(400, { error: 'Action inconnue' });
};
