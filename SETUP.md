# Mise en route de la version 2 (base de données + espace apiculteur)

Comptez environ 30 minutes, une seule fois. Tout est gratuit.
Faites les étapes dans l'ordre, puis testez sur l'aperçu Netlify (deploy preview)
**avant** de fusionner dans `main`.

> Ne collez jamais de clé secrète ni d'adresse email réelle dans un fichier du dépôt :
> le dépôt est public. Les clés vont uniquement dans Netlify (étape 4).

---

## 1. Créer la base Supabase

1. Allez sur [supabase.com](https://supabase.com) → **Start your project** → connectez-vous avec GitHub.
2. **New project** :
   - Name : `sos-abeilles-guyane`
   - Database password : cliquez **Generate**, puis gardez-le dans votre gestionnaire de mots de passe
   - Region : une région **en Europe** (RGPD) — `West EU (Paris)` si elle est proposée, sinon `Central EU (Frankfurt)`
   - Plan : **Free**
3. Attendez 1 à 2 minutes que le projet soit prêt.

## 2. Créer les tables et les règles de sécurité

1. Menu de gauche → **SQL Editor** → **New query**.
2. Ouvrez le fichier `supabase/migrations/20260928000000_init.sql` du projet, copiez **tout**, collez, puis **Run**.
3. Résultat attendu : `Success. No rows returned`.
   (Le script peut être relancé sans risque s'il faut le rejouer.)

Ce script crée :
- `reports` : les signalements (le public peut **déposer**, jamais **lire**) ;
- `report_events` : l'historique des statuts (qui a fait quoi, quand) ;
- `profiles` : les comptes de l'équipe et leur rôle (`en_attente`, `apiculteur`, `admin`) ;
- un espace **privé** `photos` pour les photos (visible seulement par l'équipe) ;
- `public_stats()` : les totaux par commune affichés sur le site, sans donnée personnelle ;
- un frein anti-abus (20 dépôts maximum toutes les 10 minutes).

## 3. Réglages de connexion (Authentication)

1. **Authentication → Sign In / Providers** : désactivez **Allow new users to sign up**.
   Personne ne peut créer de compte seul : uniquement sur invitation.
2. **Authentication → URL Configuration** :
   - Site URL : `https://sosabeillesguyane.netlify.app`
   - Redirect URLs → **Add URL**, une par ligne :
     - `https://sosabeillesguyane.netlify.app/apiculteur`
     - `https://deploy-preview-*--sosabeillesguyane.netlify.app/apiculteur` (pour tester les aperçus)
     - `http://localhost:5173/apiculteur` (seulement si vous testez sur votre ordinateur)
3. **Authentication → Emails → Templates** : mettez les emails en français.
   - *Invite user* — Sujet : `Invitation à l'espace apiculteur S.O.S Abeilles` —
     Message : `Bonjour, vous êtes invité(e) dans l'équipe S.O.S Abeilles Guyane. <a href="{{ .ConfirmationURL }}">Choisir mon mot de passe</a>`
   - *Reset password* — Sujet : `Nouveau mot de passe — S.O.S Abeilles` —
     Message : `Pour choisir un nouveau mot de passe : <a href="{{ .ConfirmationURL }}">cliquez ici</a>. Si vous n'avez rien demandé, ignorez cet email.`

### Envoi des emails de connexion (important)

Sans réglage, Supabase n'envoie ses emails (invitation, mot de passe oublié) **qu'aux membres
de votre compte Supabase**, et 2 par heure au maximum. Pour inviter d'autres apiculteurs
par email, branchez un envoi SMTP — par exemple avec le Gmail du service :

1. Sur le compte Gmail : activez la validation en 2 étapes, puis créez un
   **mot de passe d'application** (Compte Google → Sécurité → Mots de passe des applications).
2. Supabase → **Authentication → Emails → SMTP Settings** → **Enable custom SMTP** :
   - Sender email : l'adresse Gmail · Sender name : `S.O.S Abeilles Guyane`
   - Host : `smtp.gmail.com` · Port : `465`
   - Username : l'adresse Gmail · Password : le mot de passe d'application

**Sans SMTP, ça marche aussi** : créez les comptes à la main (étape 5, méthode B).
Seuls l'invitation par email et « Mot de passe oublié » ne fonctionneront pas.

## 4. Brancher Netlify sur la base

1. Supabase → **Project Settings → API Keys** :
   - copiez la **Publishable key** (`sb_publishable_…`) — publique, sans danger ;
   - dans **Secret keys**, créez/copiez une clé (`sb_secret_…`) — **secrète** ;
   - Supabase → **Project Settings → Data API** (ou la page d'accueil du projet) : copiez la **Project URL** (`https://xxxx.supabase.co`).
   (Les anciennes clés `anon` / `service_role` fonctionnent aussi, mais Supabase les retire fin 2026.)
2. Netlify → votre site → **Project configuration → Environment variables → Add a variable** :

   | Nom | Valeur | Secret ? |
   |---|---|---|
   | `VITE_SUPABASE_URL` | Project URL | non |
   | `VITE_SUPABASE_ANON_KEY` | Publishable key | non |
   | `VITE_MAPTILER_KEY` | `BWLQgt3asW0Wt5A6AKvg` | non |
   | `SUPABASE_SERVICE_ROLE_KEY` | Secret key | **oui** : cochez *Contains secret values*, portée **Functions** uniquement |

   Laissez « All deploy contexts » pour que les aperçus (deploy previews) marchent aussi.
3. **EmailJS** → modèle de notification à l'apiculteur (`template_vmgefba`) : ajoutez une ligne
   `Voir la fiche : {{lien_espace}}` — elle ouvre directement le signalement dans l'espace apiculteur.

## 5. Créer le premier compte administrateur

**Méthode A (avec SMTP)** — Supabase → **Authentication → Users → Add user → Send invitation**, avec votre email.
Ouvrez l'email, choisissez votre mot de passe.

**Méthode B (sans SMTP)** — Supabase → **Authentication → Users → Add user → Create new user** :
email + mot de passe, cochez **Auto Confirm User**.

Puis, dans **SQL Editor**, une seule fois (remplacez par votre email) :

```sql
update public.profiles set role = 'admin' where email = 'vous@exemple.com';
```

Les apiculteurs suivants s'ajoutent ensuite **depuis le site** : Espace apiculteur → **Équipe → Inviter**
(méthode A), ou créés à la main comme ci-dessus puis **Équipe → Activer** (méthode B).

## 6. Tester sur l'aperçu Netlify

Poussez la branche `v2-dynamique` et ouvrez la Pull Request : Netlify construit un aperçu
`deploy-preview-N--sosabeillesguyane.netlify.app`.

- [ ] Le site s'affiche comme avant (design, langues, carte de la zone, animation).
- [ ] Faites un **faux signalement** avec photo (et « Utiliser ma position ») → écran de succès, emails reçus.
- [ ] Ouvrez `/apiculteur` sur l'aperçu → connectez-vous → le signalement est là, avec la photo.
- [ ] Gardez l'espace ouvert et faites un 2ᵉ signalement depuis votre téléphone → il apparaît **en direct**.
- [ ] Passez-le en « Essaim récupéré » → la section **« Essaims sauvés »** du site public affiche 1.
- [ ] Onglets **Carte** et **Statistiques** : tout s'affiche.
- [ ] Supprimez les signalements de test (fiche → Supprimer, réservé à l'admin).

Si l'espace affiche « Base de données à brancher » : les variables `VITE_…` manquent (étape 4),
puis **Deploys → Trigger deploy → Clear cache and deploy site**.

## 7. Au quotidien

- **Téléphone** : ouvrez `…/apiculteur` dans le navigateur, puis « Ajouter à l'écran d'accueil ».
- **Conservation** : un bandeau prévient l'admin quand des signalements clos ont plus de 12 mois ;
  **Équipe → Conservation des données → Anonymiser** efface nom, téléphone, email, adresse,
  position, notes et photo. La commune et le résultat restent pour les statistiques.
- **Limites gratuites** : Supabase 500 Mo de base + 1 Go de photos (plusieurs milliers de
  signalements) ; EmailJS 200 emails/mois = 100 signalements/mois (2 emails chacun).
- **Mise en veille** : un projet Supabase gratuit se met en pause après **1 semaine sans aucune
  activité**. Les visites du site suffisent normalement à l'éviter ; si c'est arrivé,
  Supabase → **Restore project**.
- **Clarity** ne se charge jamais dans l'espace apiculteur (données personnelles).

## Pour les développeurs

```bash
npm install
cp .env.example .env      # puis remplir les valeurs
npm run dev               # http://localhost:5173 et http://localhost:5173/apiculteur
npm run build             # produit dist/ (ce que Netlify publie)
```

La fonction `netlify/functions/team.mjs` (inviter / retirer un membre) ne tourne que sur
Netlify ou avec `netlify dev`.
