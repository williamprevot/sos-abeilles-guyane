# S.O.S Abeilles Guyane

Site vitrine + formulaire de signalement pour un service gratuit de collecte et
relocalisation d'essaims d'abeilles en Guyane française (zone CACL : Cayenne,
Rémire-Montjoly, Matoury, Macouria, Montsinéry-Tonnegrande, Roura).

Version 2 : le site garde exactement son design, mais il est devenu **dynamique**.

- Les signalements sont **enregistrés dans une base de données** (Supabase, serveurs
  dans l'Union européenne), en plus des emails de notification et de confirmation.
- Un **espace apiculteur** (`/apiculteur`, connexion obligatoire) liste les
  signalements et leur statut (nouveau → planifié → **essaim récupéré** / annulé),
  avec photo, appel/SMS en un geste, itinéraire, notes internes et historique.
- Une **carte réservée à l'équipe** montre les signalements **en direct**, avec les
  photos envoyées par les habitants (position GPS si l'habitant l'a partagée).
- Des **statistiques par commune** suivent le nombre d'essaims sauvés ; les totaux
  (sans aucune donnée personnelle) s'affichent aussi sur le site public.
- Comptes **apiculteur(s) + administrateur**, sur invitation uniquement.

**Mise en route : voir [SETUP.md](SETUP.md)** (base Supabase, variables Netlify, premier compte).

## Structure du projet

```
index.html                  — point d'entrée (balises SEO inchangées)
public/css/styles.css       — le CSS historique du site, réutilisé tel quel
public/js/consent.js        — bandeau cookies (RGPD) + mesure d'audience Clarity
public/confidentialite.html — politique de confidentialité (page autonome)
public/img, robots.txt, sitemap.xml

src/main.jsx, src/App.jsx   — démarrage React + aiguillage site / espace apiculteur
src/pages/Home.jsx          — la page d'accueil, assemblée à partir des composants
src/components/site/        — les sections du site (en-tête, héros, carte, chatbot…)
src/legacy/home.js          — le comportement historique (chatbot, carte, animation)
src/i18n/                   — les 5 langues (FR / EN / ES / PT / ZH)
src/lib/                    — connexion Supabase, envoi d'un signalement, communes
src/apiculteur/             — l'espace apiculteur (liste, fiche, carte, stats, équipe)
src/styles/site-v2.css      — les quelques styles ajoutés au site public

supabase/migrations/        — tables, règles de sécurité, photos, statistiques (SQL)
netlify/functions/team.mjs  — inviter / retirer un membre (clé secrète côté serveur)
netlify.toml                — construction (npm run build) et adresses /apiculteur
```

Netlify construit le site à chaque push (`npm run build` → dossier `dist/`).

## Sécurité et données personnelles

- La clé Supabase présente dans le site est **publique par conception** : ce sont les
  règles de la base (Row Level Security) qui protègent les données. Le public peut
  **déposer** un signalement, jamais en **lire** un.
- Les photos sont dans un espace **privé**, affichées à l'équipe par des liens valables 1 h.
- La clé **secrète** Supabase n'existe que dans Netlify (fonction `team`), jamais dans le code.
- Un compte nouvellement créé est « en attente » tant qu'un admin ne l'a pas activé ;
  un apiculteur ne peut pas changer son propre rôle.
- Conservation : 12 mois après la clôture, les données personnelles sont anonymisées
  (Équipe → Conservation des données).
- L'espace apiculteur n'est ni indexé (noindex, robots.txt) ni mesuré (pas de Clarity).

### Emails EmailJS

Les deux emails (alerte à l'apiculteur, confirmation à l'habitant) partent toujours
via EmailJS (200 emails/mois gratuits). Le modèle de l'apiculteur peut afficher
`{{lien_espace}}`, le lien direct vers la fiche du signalement.

**Confidentialité :** ne jamais saisir d'adresse email réelle (apiculteur ou
développeur) dans le code, ni dans ce README, ni dans aucun fichier du dépôt — ce
sont des fichiers publics. Les destinataires se règlent uniquement dans le champ
**To Email** du modèle EmailJS (tableau de bord EmailJS), jamais exposé au navigateur.

### MapTiler (fonds de carte)

Clé gratuite `BWLQgt3asW0Wt5A6AKvg` (variable `VITE_MAPTILER_KEY`). Une fois le nom de
domaine définitif connu, la restreindre dans MapTiler → API Keys → Allowed HTTP Origins.

## Statistiques de visite (Microsoft Clarity) et RGPD

Le site mesure les visites avec **Microsoft Clarity** (gratuit) : visites, défilement,
cartes de chaleur, relectures de visites, et étapes du signalement.

**Rien n'est chargé sans l'accord du visiteur** (RGPD / CNIL) : un bandeau en 5 langues
propose « Refuser » et « Accepter » avec le même poids visuel, plus « Personnaliser ».
Le choix est gardé 6 mois (recommandation CNIL), puis redemandé. « Gérer mes cookies »
dans le pied de page permet de changer d'avis à tout moment.

Fichiers : `public/js/consent.js` (bandeau + chargement de Clarity), fin de `public/css/styles.css`,
politique dans `src/components/site/PrivacyModal.jsx` (boîte de dialogue) et `public/confidentialite.html`,
formulaire de signalement masqué (`data-clarity-mask="True"`).

### Activer Clarity
1. clarity.microsoft.com → menu des projets → **Nouveau projet** : `S.O.S Abeilles Guyane`,
   URL `https://sosabeillesguyane.netlify.app`. Ne PAS coller le code proposé.
2. Paramètres → Vue d'ensemble → copier l'**ID de projet**.
3. Dans `public/js/consent.js`, remplacer `COLLEZ_VOTRE_ID_CLARITY` par cet ID, puis publier.
4. Paramètres → Configuration → **Cookies : désactivé** ; Masque en cours → **Équilibré**.

### Événements envoyés (Clarity → Filtres → Événements personnalisés)
`signalement_ouvert`, `signalement_etape_2` à `signalement_etape_11`, `signalement_envoye`,
`clic_telephone`, `clic_email`. Seuls les visiteurs qui acceptent sont comptés.

Si vous ajoutez un autre outil de suivi : l'ajouter au bandeau et à la politique, et
augmenter `CONSENT_VERSION` dans `public/js/consent.js` pour redemander l'accord.

## Déploiement

Le dépôt est relié à Netlify : chaque `git push` sur `main` reconstruit et redéploie le
site. Chaque Pull Request produit un aperçu (deploy preview) pour tester avant.

## Sécurité du formulaire

- HTTPS automatique via Netlify.
- Un champ anti-robot (honeypot) et un frein côté base (20 dépôts / 10 min) protègent
  des soumissions automatisées.
- Activer la limite de taux et la liste blanche de domaines dans les tableaux de bord
  EmailJS et MapTiler une fois le domaine final connu.
