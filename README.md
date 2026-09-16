# S.O.S Abeilles Guyane

Site vitrine + formulaire de signalement pour un service gratuit de collecte et
relocalisation d'essaims d'abeilles en Guyane française (zone CACL : Cayenne,
Rémire-Montjoly, Matoury, Macouria, Montsinéry-Tonnegrande, Roura).

Site statique en un seul fichier HTML (aucun framework, aucun build) :
chatbot de signalement, carte interactive, FAQ, animation d'essaim en canvas.

## Fichiers

- `index.html` — le site complet (HTML + CSS + JS inline)
- `robots.txt` — autorise l'indexation par les moteurs de recherche
- `sitemap.xml` — plan du site pour le référencement

## Configuration nécessaire avant mise en ligne

Le site fonctionne visuellement tel quel, mais **trois clés gratuites**
doivent être renseignées pour que le formulaire et la carte marchent
réellement. Elles sont toutes en clair dans `index.html`, repérables par
leur nom :

### 1. EmailJS (envoi des emails) — gratuit, 200 emails/mois

1. Créer un compte sur [emailjs.com](https://emailjs.com)
2. Ajouter un service email relié à `maracudja973@gmail.com`
3. Créer 3 templates nommés exactement :
   - `template_notification` (à l'apiculteur)
   - `template_confirmation` (au client, immédiat)
   - `template_prise_en_charge` (au client, quand l'apiculteur confirme)
4. Dans `index.html`, remplacer :
   - `VOTRE_PUBLIC_KEY` → votre Public Key EmailJS
   - `VOTRE_SERVICE_ID` → votre Service ID EmailJS

Le contenu suggéré pour chaque template (variables `{{...}}` à utiliser) est
détaillé dans l'historique de conversation avec Claude ; les noms de
variables correspondent aux champs du formulaire (`client_nom`,
`commune`, `handoff_link`, etc.).

### 2. MapTiler (fond de carte) — gratuit, sans carte bancaire

1. Créer un compte sur [maptiler.com](https://maptiler.com)
2. Récupérer la clé API
3. Dans `index.html`, remplacer `VOTRE_CLE_MAPTILER` par cette clé

### 3. Netlify Forms (notification photo) — après déploiement

Une fois le site déployé sur Netlify :
Site settings → Forms → Form notifications → Add notification →
Email notification → mettre `maracudja973@gmail.com`.

## Déploiement

Voir la procédure recommandée (Netlify relié à GitHub) dans la conversation
avec Claude, ou simplement glisser-déposer ce dossier sur
[app.netlify.com/drop](https://app.netlify.com/drop) pour une mise en ligne
immédiate.

## Avant de mettre en ligne pour de vrai

- Ne pas oublier la clé MapTiler et les identifiants EmailJS (voir ci-dessus)
- Vérifier que `robots.txt` et `sitemap.xml` pointent vers le vrai nom de domaine
