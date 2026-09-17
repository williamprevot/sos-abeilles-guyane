# S.O.S Abeilles Guyane

Site vitrine + formulaire de signalement pour un service gratuit de collecte et
relocalisation d'essaims d'abeilles en Guyane française (zone CACL : Cayenne,
Rémire-Montjoly, Matoury, Macouria, Montsinéry-Tonnegrande, Roura).

Site statique (aucun framework, aucun build) : chatbot de signalement, carte
interactive, FAQ, animation d'essaim en canvas.

## Structure du projet

```
index.html        — structure de la page uniquement
css/styles.css     — tous les styles
js/script.js       — toute la logique (chatbot, carte, animation, formulaire)
robots.txt         — autorise l'indexation par les moteurs de recherche
sitemap.xml        — plan du site pour le référencement
```

Le HTML, le CSS et le JavaScript sont séparés en fichiers distincts pour
faciliter la maintenance : on modifie l'apparence dans `css/styles.css` sans
toucher au comportement, et le comportement dans `js/script.js` sans toucher
à la structure. Aucune étape de compilation n'est nécessaire — ces fichiers
sont chargés tels quels par le navigateur.

## Configuration nécessaire avant mise en ligne

Trois clés gratuites doivent être renseignées dans `js/script.js` pour que le
formulaire et la carte fonctionnent réellement (repérables par leur nom en
majuscules) :

### 1. EmailJS (envoi des emails) — gratuit, 200 emails/mois

1. Créer un compte sur [emailjs.com](https://emailjs.com)
2. Ajouter un service email relié à une boîte mail (voir le guide de configuration pour l'adresse exacte)
3. Créer 2 templates :
   - notification à l'apiculteur (+ copie dev)
   - confirmation immédiate au client
4. Dans `js/script.js`, remplacer :
   - `VOTRE_PUBLIC_KEY` → votre Public Key EmailJS
   - les identifiants de service/templates (déjà renseignés) si vous recréez vos propres templates

L'apiculteur reçoit dans cet unique email toutes les informations nécessaires
(dont le téléphone du client) et le contacte directement par téléphone pour
convenir d'un horaire — aucune étape de confirmation automatique par email
n'est nécessaire.

**Confidentialité :** ne jamais saisir d'adresse email réelle (apiculteur ou
développeur) dans `js/script.js`, ni dans ce README, ni dans aucun fichier du
dépôt — ce sont des fichiers publics, lisibles par n'importe qui via "Afficher
le code source" ou en parcourant le dépôt. Les destinataires se configurent
uniquement dans le champ **To Email** du modèle EmailJS `template_notification`
(tableau de bord EmailJS) et dans les notifications Netlify Forms ci-dessous —
deux réglages privés, jamais exposés au navigateur.

### 2. MapTiler (fond de carte) — gratuit, sans carte bancaire

1. Créer un compte sur [maptiler.com](https://maptiler.com)
2. Récupérer la clé API (déjà fait : `BWLQgt3asW0Wt5A6AKvg`)
3. Une fois le nom de domaine définitif connu, la restreindre dans
   MapTiler → API Keys → Allowed HTTP Origins, pour la sécurité.

### 3. Netlify Forms (notification photo) — après déploiement

Project configuration → Forms → Form notifications → Add notification →
Email notification, une fois par destinataire (apiculteur, puis dev) — voir
le guide de configuration pour les adresses exactes.

## Déploiement

Le dépôt est relié à Netlify : chaque `git push` sur la branche `main`
redéploie automatiquement le site (aucune action manuelle nécessaire).

## Sécurité

- HTTPS automatique via Netlify.
- Un champ anti-robot (honeypot) protège le formulaire des soumissions
  automatisées.
- Activer la limite de taux et la liste blanche de domaines dans les
  tableaux de bord EmailJS et MapTiler une fois le domaine final connu.