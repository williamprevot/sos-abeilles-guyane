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
2. Ajouter un service email relié à `maracudja973@gmail.com`
3. Créer 3 templates nommés exactement :
   - `template_notification` (à l'apiculteur)
   - `template_confirmation` (au client, immédiat)
   - `template_prise_en_charge` (au client, quand l'apiculteur confirme)
4. Dans `js/script.js`, remplacer :
   - `VOTRE_PUBLIC_KEY` → votre Public Key EmailJS
   - `VOTRE_SERVICE_ID` → votre Service ID EmailJS

### 2. MapTiler (fond de carte) — gratuit, sans carte bancaire

1. Créer un compte sur [maptiler.com](https://maptiler.com)
2. Récupérer la clé API (déjà fait : `BWLQgt3asW0Wt5A6AKvg`)
3. Une fois le nom de domaine définitif connu, la restreindre dans
   MapTiler → API Keys → Allowed HTTP Origins, pour la sécurité.

### 3. Netlify Forms (notification photo) — après déploiement

Site settings → Forms → Form notifications → Add notification →
Email notification → `maracudja973@gmail.com`.

## Déploiement

Le dépôt est relié à Netlify : chaque `git push` sur la branche `main`
redéploie automatiquement le site (aucune action manuelle nécessaire).

## Sécurité

- HTTPS automatique via Netlify.
- Un champ anti-robot (honeypot) protège le formulaire des soumissions
  automatisées.
- Activer la limite de taux et la liste blanche de domaines dans les
  tableaux de bord EmailJS et MapTiler une fois le domaine final connu.
