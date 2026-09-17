/* Config EmailJS — service + 2 templates (notification apiculteur, confirmation client) */
const EMAILJS_PUBLIC_KEY   = "p82valRt_i5V00YJK";
const EMAILJS_SERVICE_ID   = "service_hwx119g";
const TEMPLATE_NOTIFY      = "template_vmgefba";   // Notification apiculteur (+ copie dev)
const TEMPLATE_CONFIRM     = "template_b3x7ci3";   // Confirmation client, immédiate

// Aucune adresse email en dur ici : ce fichier est public. Les destinataires
// sont configurés dans le champ "To Email" du template EmailJS lui-même.
emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

/* =========================================================
   SYSTÈME MULTILINGUE (FR / EN / ES / PT)
   - Le français reste la langue de référence : toutes les clés
     manquantes dans une autre langue retombent automatiquement
     sur le texte français (jamais de trou dans l'affichage).
   - data-i18n="clé"           -> el.textContent = traduction
   - data-i18n-html="clé"      -> el.innerHTML = traduction (uniquement
     pour du texte statique avec <br>/<span>, jamais d'éléments
     cliquables à l'intérieur, pour ne jamais perdre un écouteur
     d'événement en régénérant le DOM)
   - data-i18n-aria-label="clé"  -> attribut aria-label
   - data-i18n-placeholder="clé" -> attribut placeholder
   - L'email reçu par l'apiculteur reste TOUJOURS en français, quelle
     que soit la langue choisie par le visiteur : seuls les modèles
     EmailJS eux-mêmes (configurés sur emailjs.com) déterminent la
     langue des emails, et ce fichier envoie toujours les valeurs
     "canoniques" en français pour les champs à choix (commune,
     depuis, urgence) — voir data-value sur les boutons de choix.
   ========================================================= */
const I18N = {
  fr: {
    "cta.report": "Signaler un essaim",
    "nav.zone": "Zone d'intervention",
    "nav.comment": "Comment ça marche",
    "nav.attendant": "En attendant",
    "hero.title": "Un essaim d'abeilles installé chez vous ?🐝",
    "hero.lead": "Nous récupérons et relocalisons les abeilles dans leur milieu, plutôt que de les détruire.<br><br>Signalez un essaim en quelques clics, un apiculteur local prend le relais.",
    "hero.btnGhost": "Que faire en attendant ?",
    "nid.title": "Où les essaims aiment s'installer",
    "nid.subtitle": "Survolez les différentes zones pour découvrir les emplacements de la maison où les essaims s'installent le plus souvent.",
    "nid.hotspot1.aria": "Branches et troncs d'arbres : le lieu le plus fréquent, souvent une branche basse ou un tronc creux",
    "nid.hotspot1.tip": "Branches et troncs<br><small>le lieu le plus fréquent</small>",
    "nid.hotspot2.aria": "Faux plafonds et combles : un endroit sombre et sec en hauteur",
    "nid.hotspot2.tip": "Faux plafonds et combles<br><small>sombre et sec en hauteur</small>",
    "nid.hotspot3.aria": "Seaux et pneus abandonnés : surtout secs et à l'abri de la pluie",
    "nid.hotspot3.tip": "Seaux et pneus abandonnés<br><small>secs et à l'abri de la pluie</small>",
    "nid.hotspot4.aria": "Compteurs d'eau ou d'électricité : leur cavité protégée est idéale",
    "nid.hotspot4.tip": "Compteurs d'eau ou d'électricité<br><small>cavité protégée idéale</small>",
    "nid.hotspot5.aria": "Cartons et caisses vides : laissés dehors ou dans un abri de jardin",
    "nid.hotspot5.tip": "Cartons et caisses vides<br><small>abri de jardin et garage</small>",
    "zone.title": "Zone d'intervention",
    "zone.subtitle": "Le service couvre le territoire de la CACL (Communauté d'Agglomération du Centre Littoral).",
    "zone.mapAria": "Carte géographique de la zone d'intervention : Cayenne, Rémire-Montjoly, Matoury, Macouria, Montsinéry-Tonnegrande et Roura",
    "zone.mapNote": "Carte OpenStreetMap réelle : le cercle miel indique la zone d'intervention globale, de Macouria à Roura, à titre indicatif.",
    "steps.title": "Comment ça marche",
    "steps.subtitle": "Trois étapes, du signalement à l'intervention.",
    "steps.1.title": "Vous signalez",
    "steps.1.text": "Remplissez une description complète de l'essaim grâce à notre chat interactif.",
    "steps.2.title": "Vous recevez une confirmation",
    "steps.2.text": "Un email vous confirme immédiatement que votre signalement est bien arrivé et en cours d'examen.",
    "steps.3.title": "L'apiculteur intervient",
    "steps.3.text": "Dès qu'il prend en charge votre demande, il vous contacte directement (le plus souvent par téléphone, parfois par email) pour programmer un horaire d'intervention.",
    "consignes.title": "En attendant l'intervention",
    "consignes.subtitle": "Un essaim posé est généralement calme. Voici les bons réflexes.",
    "tab.faire": "À faire",
    "tab.eviter": "À éviter",
    "tab.faq": "Questions fréquentes",
    "faire.1": "<span class=\"info-key\">10 mètres minimum</span> de distance avec l'essaim",
    "faire.2": "Fenêtres et portes <span class=\"info-key\">doivent être fermées</span>",
    "faire.3": "Maintenir enfants et animaux <span class=\"info-key\">éloignés</span> de la zone d'essaimage",
    "faire.4": "Maintenir <span class=\"info-key\">éloignées</span> les personnes allergiques",
    "faire.5": "Prévenir les voisins si l'essaim est en zone partagée",
    "eviter.1": "<span class=\"info-key\">Jamais</span> d'eau, d'insecticide ou de bombe aérosol",
    "eviter.2": "<span class=\"info-key\">Ne pas</span> déplacer ou détruire l'essaim soi-même",
    "eviter.3": "Pas de fumée ni de feu à proximité",
    "eviter.4": "Eviter les Bruits et vibrations (tondeuse, perceuse, musique, bruits d'animaux allées et venues)",
    "faq.1.q": "Qui intervient chez moi ?",
    "faq.1.a": "Un <span class=\"info-key\">apiculteur local</span>, pas une entreprise de nuisibles. Il capture l'essaim et le relocalise vivant dans une ruche, pour préserver les abeilles.",
    "faq.2.q": "Est-ce vraiment gratuit ?",
    "faq.2.a": "<span class=\"info-key\">Oui, dans l'immense majorité des cas.</span> Dans certaines situations particulières, une participation peut être convenue directement entre vous et l'apiculteur, à la discrétion des deux parties.",
    "faq.3.q": "Comment l'apiculteur me contacte-t-il ?",
    "faq.3.a": "La plupart du temps <span class=\"info-key\">par téléphone</span>, pour convenir rapidement d'un horaire. Il peut aussi vous écrire par email, selon sa disponibilité.",
    "faq.4.q": "Délai avant l'intervention ?",
    "faq.4.a": "<span class=\"info-key\">24 à 48h</span> selon disponibilité. Priorité aux situations urgentes (passage, enfants et animaux).",
    "faq.5.q": "Délai de réponse à mon signalement ?",
    "faq.5.a": "Confirmation <span class=\"info-key\">immédiate</span> par email, puis appel de l'apiculteur pour convenir d'un horaire.",
    "faq.6.q": "Déjà signalé par un voisin, je signale quand même ?",
    "faq.6.a": "Inutile si vous êtes <span class=\"info-key\">certain</span> qu'il l'a déjà été. En cas de doute, signalez tout de même.",
    "faq.7.q": "Piqûre ou réaction allergique ?",
    "faq.7.a": "Gonflement, difficulté à respirer, malaise : <span class=\"info-key\">urgence</span>, appelez le 15 ou le 112 immédiatement.",
    "faq.8.q": "Pourquoi éviter le bruit ?",
    "faq.8.a": "Les vibrations stressent les abeilles et peuvent déclencher une <span class=\"info-key\">réaction défensive</span> collective.",
    "faq.9.q": "Comment protéger mes animaux ?",
    "faq.9.a": "Rentrez-les, ou tenez-les au calme à <span class=\"info-key\">10 mètres minimum</span> de l'essaim.",
    "loading.aria": "Envoi du signalement en cours",
    "loading.text": "Envoi de votre signalement...",
    "modal.close": "Fermer",
    "report.title": "Signaler un essaim",
    "report.subtitle": "Répondez aux questions les unes après les autres. C'est rapide !",
    "step1.label": "Comment vous appelez-vous ?",
    "step2.label": "Quel est votre numéro de téléphone ?",
    "step3.label": "Quel est votre email ?",
    "step3.hint": "Pour obtenir la confirmation de prise en charge.",
    "step4.label": "Dans quelle commune se trouve l'essaim ?",
    "step5.label": "Precisez une adresse, ou un point de repère",
    "step5.placeholder": "Rue, lotissement, repère...",
    "step6.label": "Où se trouve l'essaim exactement ?",
    "step6.hint": "Arbre, mur, compteur électrique, véhicule...",
    "step7.label": "Depuis quand est-il là ?",
    "step8.legend": "Comment évalueriez-vous l'urgence de la situation ?",
    "step8.opt1": "Faible — zone peu fréquentée",
    "step8.opt2": "Moyenne — proche d'un passage",
    "step8.opt3": "Élevée — proche d'enfants, école ou lieu public",
    "step9.label": "Avez-vous une photo de l'essaim ?",
    "step9.hint": "Facultatif — aide l'apiculteur à évaluer la situation. Compressée automatiquement avant l'envoi.",
    "step10.label": "Une information complémentaire à ajouter ?",
    "step10.hint": "Taille approximative, comportement observé, accès au terrain...",
    "btn.continue": "Continuer",
    "btn.skip": "Passer cette étape",
    "depuis.opt1": "Aujourd'hui",
    "depuis.opt2": "Depuis hier",
    "depuis.opt3": "Depuis plus de 2 jours",
    "depuis.opt4": "Je ne sais pas",
    "recap.privacyPrefix": "Vos données ne sont utilisées que pour organiser cette intervention.",
    "privacy.linkLabel": "Politique de confidentialité",
    "btn.submit": "Envoyer le signalement",
    "success.title": "Signalement envoyé !",
    "success.text": "Un apiculteur local prendra en charge votre demande d'intervention.",
    "about.title": "À propos de nous",
    "about.subtitle": "Une entreprise familiale d'apiculture, établie depuis 2006 aux alentours de Cayenne, animée par trois valeurs simples.",
    "about.card1.title": "Modernité",
    "about.card1.text": "Un savoir-faire apicole familial, allié à des outils actuels comme ce site, pour un service réactif et accessible en ligne.",
    "about.card2.title": "Qualité",
    "about.card2.text": "Chaque essaim est capturé vivant et relocalisé avec soin, dans le respect du bien-être animal et de l'environnement guyanais.",
    "about.card3.title": "Équité",
    "about.card3.text": "Un service pensé pour rester juste, aussi bien pour les personnes qui nous signalent un essaim que pour nos apiculteurs.",
    "footer.copyright": "&copy; <strong>2026</strong> S.O.S Abeilles Guyane. Tous droits réservés.",
    "bot.step1": "Bonjour 👋 Je vais vous poser quelques questions pour organiser la collecte de l'essaim. Comment vous appelez-vous ?",
    "bot.step2": "Merci. Quel est votre numéro de téléphone ?",
    "bot.step3": "Et votre adresse email ? Elle servira à vous envoyer la confirmation de prise en charge.",
    "bot.step4": "Dans quelle commune se trouve l'essaim ?",
    "bot.step5": "Quelle est l'adresse précise, ou un point de repère ?",
    "bot.step6": "Où se trouve l'essaim exactement ?",
    "bot.step7": "Depuis quand est-il là ?",
    "bot.step8": "Comment évalueriez-vous l'urgence de la situation ?",
    "bot.step9": "Avez-vous une photo de l'essaim ? Ça aide beaucoup l'apiculteur avant de se déplacer.",
    "bot.step10": "Une dernière information à ajouter avant l'envoi ?",
    "bot.step11": "Voici le récapitulatif de votre signalement. Vérifiez que tout est correct avant l'envoi.",
    "progress.step": "Étape {n} sur 10",
    "progress.last": "Dernière étape — vérifiez et envoyez",
    "validator.nom.tooShort": "Merci d'indiquer votre nom (2 caractères minimum).",
    "validator.nom.invalid": "Merci d'indiquer un nom valide.",
    "validator.telephone.tooShort": "Merci d'indiquer un numéro de téléphone valide (9 chiffres minimum, ex. 0694 12 34 56).",
    "validator.telephone.tooLong": "Ce numéro de téléphone semble trop long — vérifiez la saisie.",
    "validator.email.invalid": "Merci d'indiquer une adresse email valide (ex. nom@exemple.com).",
    "validator.adresse.tooShort": "Merci de préciser l'adresse ou un point de repère.",
    "validator.emplacement.tooShort": "Merci de préciser où se trouve l'essaim.",
    "answer.noPhoto": "Aucune photo",
    "answer.nothingToAdd": "Rien à ajouter",
    "skip.noPhoto": "Pas de photo",
    "recap.label.nom": "Nom",
    "recap.label.telephone": "Téléphone",
    "recap.label.email": "Email",
    "recap.label.commune": "Commune",
    "recap.label.adresse": "Adresse",
    "recap.label.emplacement": "Emplacement",
    "recap.label.depuis": "Depuis quand",
    "recap.label.urgence": "Urgence",
    "recap.label.photo": "Photo",
    "recap.label.message": "Message",
    "recap.value.noPhoto": "Aucune",
    "recap.value.noMessage": "Aucun",
    "recap.edit": "Modifier",
    "error.send": "Erreur d'envoi. Réessayez ou contactez-nous autrement.",
    "meta.title": "S.O.S Abeilles Guyane — Collecte gratuite d'essaims",
    "meta.description": "Service gratuit et local de collecte et relocalisation d'essaims d'abeilles en Guyane (CACL) : Cayenne, Rémire-Montjoly, Matoury, Macouria, Montsinéry-Tonnegrande, Roura. Signalement en ligne, réponse rapide.",
    "banner.text": "Collecte gratuite & sans danger pour vous et les abeilles"
  },
  en: {
    "cta.report": "Report a swarm",
    "nav.zone": "Service area",
    "nav.comment": "How it works",
    "nav.attendant": "While you wait",
    "hero.title": "A bee swarm settled at your place?🐝",
    "hero.lead": "We collect and relocate bees in their environment, rather than destroy them.<br><br>Report a swarm in a few clicks, a local beekeeper takes it from there.",
    "hero.btnGhost": "What to do while you wait?",
    "nid.title": "Where swarms like to settle",
    "nid.subtitle": "Hover over the different areas to discover where swarms most often settle.",
    "nid.hotspot1.aria": "Branches and tree trunks: the most common spot, often a low branch or a hollow trunk",
    "nid.hotspot1.tip": "Branches and trunks<br><small>the most common spot</small>",
    "nid.hotspot2.aria": "False ceilings and attics: a dark, dry spot up high",
    "nid.hotspot2.tip": "False ceilings, attics<br><small>dark and dry, up high</small>",
    "nid.hotspot3.aria": "Abandoned buckets and tyres: mainly dry and sheltered from rain",
    "nid.hotspot3.tip": "Buckets, old tyres<br><small>dry, sheltered from rain</small>",
    "nid.hotspot4.aria": "Water or electricity meters: their protected cavity is ideal",
    "nid.hotspot4.tip": "Water / electric meters<br><small>ideal protected cavity</small>",
    "nid.hotspot5.aria": "Cardboard boxes and empty crates: left outside or in a garden shed",
    "nid.hotspot5.tip": "Boxes, empty crates<br><small>garden shed, garage</small>",
    "zone.title": "Service area",
    "zone.subtitle": "The service covers the CACL area (Communauté d'Agglomération du Centre Littoral).",
    "zone.mapAria": "Map of the service area: Cayenne, Rémire-Montjoly, Matoury, Macouria, Montsinéry-Tonnegrande and Roura",
    "zone.mapNote": "Real OpenStreetMap map: the honey-coloured circle shows the overall service area, from Macouria to Roura, as a rough guide only — not an exact administrative boundary.",
    "steps.title": "How it works",
    "steps.subtitle": "Three steps, from report to intervention.",
    "steps.1.title": "You report it",
    "steps.1.text": "Fill in a full description of the swarm through our interactive chat.",
    "steps.2.title": "You get a confirmation",
    "steps.2.text": "An email immediately confirms your report has been received and is being reviewed.",
    "steps.3.title": "The beekeeper steps in",
    "steps.3.text": "As soon as they take on your request, they contact you directly (usually by phone, sometimes by email) to arrange a time for the intervention.",
    "consignes.title": "While you wait for the intervention",
    "consignes.subtitle": "A settled swarm is usually calm. Here are the right things to do.",
    "tab.faire": "Do",
    "tab.eviter": "Don't",
    "tab.faq": "FAQ",
    "faire.1": "<span class=\"info-key\">10 metres minimum</span> away from the swarm",
    "faire.2": "Windows and doors <span class=\"info-key\">must stay closed</span>",
    "faire.3": "Keep children and pets <span class=\"info-key\">away</span> from the swarming area",
    "faire.4": "Keep people with allergies <span class=\"info-key\">away</span>",
    "faire.5": "Warn your neighbours if the swarm is in a shared area",
    "eviter.1": "<span class=\"info-key\">Never</span> use water, insecticide or aerosol spray",
    "eviter.2": "<span class=\"info-key\">Do not</span> move or destroy the swarm yourself",
    "eviter.3": "No smoke or fire nearby",
    "eviter.4": "Avoid noise and vibrations (mower, drill, music, pets coming and going)",
    "faq.1.q": "Who comes to my place?",
    "faq.1.a": "A <span class=\"info-key\">local beekeeper</span>, not a pest control company. They capture the swarm and relocate it alive into a hive, to protect the bees.",
    "faq.2.q": "Is it really free?",
    "faq.2.a": "<span class=\"info-key\">Yes, in the vast majority of cases.</span> In certain specific situations, a contribution may be agreed directly between you and the beekeeper, at both parties' discretion.",
    "faq.3.q": "How does the beekeeper contact me?",
    "faq.3.a": "Most of the time <span class=\"info-key\">by phone</span>, to quickly agree on a time. They may also write to you by email, depending on their availability.",
    "faq.4.q": "How long before the intervention?",
    "faq.4.a": "<span class=\"info-key\">24 to 48h</span> depending on availability. Priority goes to urgent situations (foot traffic, children and pets).",
    "faq.5.q": "How long to respond to my report?",
    "faq.5.a": "<span class=\"info-key\">Immediate</span> confirmation by email, then a call from the beekeeper to arrange a time.",
    "faq.6.q": "A neighbour already reported it, should I report it too?",
    "faq.6.a": "Not needed if you're <span class=\"info-key\">certain</span> it has already been reported. If in doubt, report it anyway.",
    "faq.7.q": "Sting or allergic reaction?",
    "faq.7.a": "Swelling, difficulty breathing, feeling faint: <span class=\"info-key\">emergency</span>, call 15 or 112 immediately.",
    "faq.8.q": "Why avoid noise?",
    "faq.8.a": "Vibrations stress the bees and can trigger a collective <span class=\"info-key\">defensive reaction</span>.",
    "faq.9.q": "How do I protect my pets?",
    "faq.9.a": "Bring them inside, or keep them calm at least <span class=\"info-key\">10 metres</span> from the swarm.",
    "loading.aria": "Sending your report",
    "loading.text": "Sending your report...",
    "modal.close": "Close",
    "report.title": "Report a swarm",
    "report.subtitle": "Answer the questions one by one. It's quick!",
    "step1.label": "What's your name?",
    "step2.label": "What's your phone number?",
    "step3.label": "What's your email?",
    "step3.hint": "To receive confirmation that your request is being handled.",
    "step4.label": "Which town is the swarm in?",
    "step5.label": "Please specify an address, or a landmark",
    "step5.placeholder": "Street, housing estate, landmark...",
    "step6.label": "Exactly where is the swarm?",
    "step6.hint": "Tree, wall, electric meter, vehicle...",
    "step7.label": "How long has it been there?",
    "step8.legend": "How would you rate the urgency of the situation?",
    "step8.opt1": "Low — rarely used area",
    "step8.opt2": "Medium — near a walkway",
    "step8.opt3": "High — near children, a school or a public place",
    "step9.label": "Do you have a photo of the swarm?",
    "step9.hint": "Optional — helps the beekeeper assess the situation. Automatically compressed before sending.",
    "step10.label": "Anything else you'd like to add?",
    "step10.hint": "Approximate size, observed behaviour, site access...",
    "btn.continue": "Continue",
    "btn.skip": "Skip this step",
    "depuis.opt1": "Today",
    "depuis.opt2": "Since yesterday",
    "depuis.opt3": "For more than 2 days",
    "depuis.opt4": "I don't know",
    "recap.privacyPrefix": "Your data is only used to organise this intervention.",
    "privacy.linkLabel": "Privacy policy",
    "btn.submit": "Send the report",
    "success.title": "Report sent!",
    "success.text": "A local beekeeper will take care of your intervention request.",
    "about.title": "About us",
    "about.subtitle": "A family beekeeping business, established since 2006 around Cayenne, driven by three simple values.",
    "about.card1.title": "Modernity",
    "about.card1.text": "Family beekeeping know-how, combined with modern tools like this site, for a responsive service that's accessible online.",
    "about.card2.title": "Quality",
    "about.card2.text": "Every swarm is captured alive and carefully relocated, respecting animal welfare and French Guiana's environment.",
    "about.card3.title": "Fairness",
    "about.card3.text": "A service designed to stay fair, both for the people reporting a swarm to us and for our beekeepers.",
    "footer.copyright": "&copy; <strong>2026</strong> S.O.S Abeilles Guyane. All rights reserved.",
    "bot.step1": "Hello 👋 I'll ask you a few questions to organise the swarm collection. What's your name?",
    "bot.step2": "Thanks. What's your phone number?",
    "bot.step3": "And your email address? It will be used to send you the confirmation.",
    "bot.step4": "Which town is the swarm in?",
    "bot.step5": "What's the exact address, or a landmark?",
    "bot.step6": "Exactly where is the swarm?",
    "bot.step7": "How long has it been there?",
    "bot.step8": "How would you rate the urgency of the situation?",
    "bot.step9": "Do you have a photo of the swarm? It really helps the beekeeper before heading out.",
    "bot.step10": "One last thing you'd like to add before sending?",
    "bot.step11": "Here's a summary of your report. Check that everything is correct before sending.",
    "progress.step": "Step {n} of 10",
    "progress.last": "Last step — check and send",
    "validator.nom.tooShort": "Please enter your name (2 characters minimum).",
    "validator.nom.invalid": "Please enter a valid name.",
    "validator.telephone.tooShort": "Please enter a valid phone number (9 digits minimum, e.g. 0694 12 34 56).",
    "validator.telephone.tooLong": "This phone number looks too long — please check it.",
    "validator.email.invalid": "Please enter a valid email address (e.g. name@example.com).",
    "validator.adresse.tooShort": "Please specify the address or a landmark.",
    "validator.emplacement.tooShort": "Please specify where the swarm is.",
    "answer.noPhoto": "No photo",
    "answer.nothingToAdd": "Nothing to add",
    "skip.noPhoto": "No photo",
    "recap.label.nom": "Name",
    "recap.label.telephone": "Phone",
    "recap.label.email": "Email",
    "recap.label.commune": "Town",
    "recap.label.adresse": "Address",
    "recap.label.emplacement": "Location",
    "recap.label.depuis": "Since when",
    "recap.label.urgence": "Urgency",
    "recap.label.photo": "Photo",
    "recap.label.message": "Message",
    "recap.value.noPhoto": "None",
    "recap.value.noMessage": "None",
    "recap.edit": "Edit",
    "error.send": "Sending failed. Please try again or contact us another way.",
    "meta.title": "S.O.S Abeilles Guyane — Free bee swarm collection",
    "meta.description": "Free local service to collect and relocate bee swarms in French Guiana (CACL): Cayenne, Rémire-Montjoly, Matoury, Macouria, Montsinéry-Tonnegrande, Roura. Report online, fast response.",
    "banner.text": "Free collection, safe for you and the bees"
  },
  es: {
    "cta.report": "Notificar un enjambre",
    "nav.zone": "Zona de intervención",
    "nav.comment": "Cómo funciona",
    "nav.attendant": "Mientras espera",
    "hero.title": "¿Un enjambre de abejas se instaló en su casa?🐝",
    "hero.lead": "Recuperamos y reubicamos a las abejas en su entorno, en lugar de destruirlas.<br><br>Notifique un enjambre en unos clics, un apicultor local se encarga del resto.",
    "hero.btnGhost": "¿Qué hacer mientras tanto?",
    "nid.title": "Dónde le gusta instalarse a los enjambres",
    "nid.subtitle": "Pase el cursor sobre las diferentes zonas para descubrir dónde suelen instalarse los enjambres.",
    "nid.hotspot1.aria": "Ramas y troncos de árboles: el lugar más frecuente, a menudo una rama baja o un tronco hueco",
    "nid.hotspot1.tip": "Ramas y troncos<br><small>el lugar más frecuente</small>",
    "nid.hotspot2.aria": "Falsos techos y áticos: un lugar oscuro y seco en altura",
    "nid.hotspot2.tip": "Falsos techos, áticos<br><small>oscuro y seco, en altura</small>",
    "nid.hotspot3.aria": "Cubos y neumáticos abandonados: sobre todo secos y protegidos de la lluvia",
    "nid.hotspot3.tip": "Cubos, neumáticos<br><small>secos, sin lluvia</small>",
    "nid.hotspot4.aria": "Contadores de agua o de electricidad: su cavidad protegida es ideal",
    "nid.hotspot4.tip": "Contadores de agua / luz<br><small>cavidad protegida ideal</small>",
    "nid.hotspot5.aria": "Cajas de cartón y cajones vacíos: dejados afuera o en un cobertizo",
    "nid.hotspot5.tip": "Cajas, cajones vacíos<br><small>cobertizo, garaje</small>",
    "zone.title": "Zona de intervención",
    "zone.subtitle": "El servicio cubre el territorio de la CACL (Communauté d'Agglomération du Centre Littoral).",
    "zone.mapAria": "Mapa de la zona de intervención: Cayenne, Rémire-Montjoly, Matoury, Macouria, Montsinéry-Tonnegrande y Roura",
    "zone.mapNote": "Mapa real de OpenStreetMap: el círculo color miel indica la zona de intervención general, de Macouria a Roura, a título indicativo — no es un límite administrativo exacto.",
    "steps.title": "Cómo funciona",
    "steps.subtitle": "Tres pasos, desde la notificación hasta la intervención.",
    "steps.1.title": "Usted notifica",
    "steps.1.text": "Complete una descripción completa del enjambre a través de nuestro chat interactivo.",
    "steps.2.title": "Recibe una confirmación",
    "steps.2.text": "Un correo le confirma de inmediato que su solicitud fue recibida y está siendo revisada.",
    "steps.3.title": "El apicultor interviene",
    "steps.3.text": "En cuanto se hace cargo de su solicitud, le contacta directamente (casi siempre por teléfono, a veces por correo) para acordar un horario de intervención.",
    "consignes.title": "Mientras espera la intervención",
    "consignes.subtitle": "Un enjambre asentado suele estar tranquilo. Estos son los reflejos correctos.",
    "tab.faire": "Qué hacer",
    "tab.eviter": "Qué evitar",
    "tab.faq": "Preguntas frecuentes",
    "faire.1": "<span class=\"info-key\">10 metros como mínimo</span> de distancia con el enjambre",
    "faire.2": "Ventanas y puertas <span class=\"info-key\">deben permanecer cerradas</span>",
    "faire.3": "Mantenga a niños y animales <span class=\"info-key\">alejados</span> de la zona del enjambre",
    "faire.4": "Mantenga <span class=\"info-key\">alejadas</span> a las personas alérgicas",
    "faire.5": "Avise a los vecinos si el enjambre está en una zona compartida",
    "eviter.1": "<span class=\"info-key\">Nunca</span> use agua, insecticida ni aerosol",
    "eviter.2": "<span class=\"info-key\">No</span> mueva ni destruya el enjambre usted mismo",
    "eviter.3": "Sin humo ni fuego cerca",
    "eviter.4": "Evite ruidos y vibraciones (cortacésped, taladro, música, idas y venidas de animales)",
    "faq.1.q": "¿Quién viene a mi casa?",
    "faq.1.a": "Un <span class=\"info-key\">apicultor local</span>, no una empresa de control de plagas. Captura el enjambre y lo reubica vivo en una colmena, para preservar a las abejas.",
    "faq.2.q": "¿Es realmente gratuito?",
    "faq.2.a": "<span class=\"info-key\">Sí, en la gran mayoría de los casos.</span> En ciertas situaciones particulares, se puede acordar una contribución directamente entre usted y el apicultor, a discreción de ambas partes.",
    "faq.3.q": "¿Cómo me contacta el apicultor?",
    "faq.3.a": "La mayoría de las veces <span class=\"info-key\">por teléfono</span>, para acordar rápidamente un horario. También puede escribirle por correo, según su disponibilidad.",
    "faq.4.q": "¿Cuánto tiempo antes de la intervención?",
    "faq.4.a": "<span class=\"info-key\">De 24 a 48h</span> según disponibilidad. Prioridad a las situaciones urgentes (paso de gente, niños y animales).",
    "faq.5.q": "¿Tiempo de respuesta a mi solicitud?",
    "faq.5.a": "Confirmación <span class=\"info-key\">inmediata</span> por correo, luego llamada del apicultor para acordar un horario.",
    "faq.6.q": "Ya lo notificó un vecino, ¿aviso igual?",
    "faq.6.a": "No es necesario si está <span class=\"info-key\">seguro</span> de que ya se notificó. En caso de duda, notifíquelo de todos modos.",
    "faq.7.q": "¿Picadura o reacción alérgica?",
    "faq.7.a": "Hinchazón, dificultad para respirar, malestar: <span class=\"info-key\">emergencia</span>, llame de inmediato al 15 o al 112.",
    "faq.8.q": "¿Por qué evitar el ruido?",
    "faq.8.a": "Las vibraciones estresan a las abejas y pueden provocar una <span class=\"info-key\">reacción defensiva</span> colectiva.",
    "faq.9.q": "¿Cómo protejo a mis animales?",
    "faq.9.a": "Métalos adentro, o manténgalos tranquilos a <span class=\"info-key\">10 metros como mínimo</span> del enjambre.",
    "loading.aria": "Enviando su solicitud",
    "loading.text": "Enviando su solicitud...",
    "modal.close": "Cerrar",
    "report.title": "Notificar un enjambre",
    "report.subtitle": "Responda las preguntas una tras otra. ¡Es rápido!",
    "step1.label": "¿Cómo se llama?",
    "step2.label": "¿Cuál es su número de teléfono?",
    "step3.label": "¿Cuál es su correo electrónico?",
    "step3.hint": "Para recibir la confirmación de que su solicitud está siendo atendida.",
    "step4.label": "¿En qué municipio está el enjambre?",
    "step5.label": "Indique una dirección, o un punto de referencia",
    "step5.placeholder": "Calle, urbanización, punto de referencia...",
    "step6.label": "¿Exactamente dónde está el enjambre?",
    "step6.hint": "Árbol, muro, contador eléctrico, vehículo...",
    "step7.label": "¿Desde cuándo está ahí?",
    "step8.legend": "¿Cómo evaluaría la urgencia de la situación?",
    "step8.opt1": "Baja — zona poco frecuentada",
    "step8.opt2": "Media — cerca de un paso de gente",
    "step8.opt3": "Alta — cerca de niños, una escuela o un lugar público",
    "step9.label": "¿Tiene una foto del enjambre?",
    "step9.hint": "Opcional — ayuda al apicultor a evaluar la situación. Se comprime automáticamente antes de enviarla.",
    "step10.label": "¿Alguna información adicional que quiera agregar?",
    "step10.hint": "Tamaño aproximado, comportamiento observado, acceso al terreno...",
    "btn.continue": "Continuar",
    "btn.skip": "Saltar este paso",
    "depuis.opt1": "Hoy",
    "depuis.opt2": "Desde ayer",
    "depuis.opt3": "Desde hace más de 2 días",
    "depuis.opt4": "No lo sé",
    "recap.privacyPrefix": "Sus datos solo se usan para organizar esta intervención.",
    "privacy.linkLabel": "Política de privacidad",
    "btn.submit": "Enviar la solicitud",
    "success.title": "¡Solicitud enviada!",
    "success.text": "Un apicultor local se encargará de su solicitud de intervención.",
    "about.title": "Sobre nosotros",
    "about.subtitle": "Una empresa familiar de apicultura, establecida desde 2006 en los alrededores de Cayenne, guiada por tres valores simples.",
    "about.card1.title": "Modernidad",
    "about.card1.text": "Un saber apícola familiar, combinado con herramientas actuales como este sitio, para un servicio rápido y accesible en línea.",
    "about.card2.title": "Calidad",
    "about.card2.text": "Cada enjambre se captura vivo y se reubica con cuidado, respetando el bienestar animal y el medio ambiente de la Guayana.",
    "about.card3.title": "Equidad",
    "about.card3.text": "Un servicio pensado para ser justo, tanto para las personas que nos notifican un enjambre como para nuestros apicultores.",
    "footer.copyright": "&copy; <strong>2026</strong> S.O.S Abeilles Guyane. Todos los derechos reservados.",
    "bot.step1": "Hola 👋 Le haré algunas preguntas para organizar la recogida del enjambre. ¿Cómo se llama?",
    "bot.step2": "Gracias. ¿Cuál es su número de teléfono?",
    "bot.step3": "¿Y su correo electrónico? Se usará para enviarle la confirmación.",
    "bot.step4": "¿En qué municipio está el enjambre?",
    "bot.step5": "¿Cuál es la dirección exacta, o un punto de referencia?",
    "bot.step6": "¿Exactamente dónde está el enjambre?",
    "bot.step7": "¿Desde cuándo está ahí?",
    "bot.step8": "¿Cómo evaluaría la urgencia de la situación?",
    "bot.step9": "¿Tiene una foto del enjambre? Ayuda mucho al apicultor antes de desplazarse.",
    "bot.step10": "¿Algo más que quiera agregar antes de enviar?",
    "bot.step11": "Aquí tiene el resumen de su solicitud. Verifique que todo sea correcto antes de enviarla.",
    "progress.step": "Paso {n} de 10",
    "progress.last": "Último paso — verifique y envíe",
    "validator.nom.tooShort": "Indique su nombre (2 caracteres como mínimo).",
    "validator.nom.invalid": "Indique un nombre válido.",
    "validator.telephone.tooShort": "Indique un número de teléfono válido (9 dígitos como mínimo, ej. 0694 12 34 56).",
    "validator.telephone.tooLong": "Este número de teléfono parece demasiado largo — verifíquelo.",
    "validator.email.invalid": "Indique una dirección de correo válida (ej. nombre@ejemplo.com).",
    "validator.adresse.tooShort": "Indique la dirección o un punto de referencia.",
    "validator.emplacement.tooShort": "Indique dónde está el enjambre.",
    "answer.noPhoto": "Sin foto",
    "answer.nothingToAdd": "Nada que agregar",
    "skip.noPhoto": "Sin foto",
    "recap.label.nom": "Nombre",
    "recap.label.telephone": "Teléfono",
    "recap.label.email": "Correo",
    "recap.label.commune": "Municipio",
    "recap.label.adresse": "Dirección",
    "recap.label.emplacement": "Ubicación",
    "recap.label.depuis": "Desde cuándo",
    "recap.label.urgence": "Urgencia",
    "recap.label.photo": "Foto",
    "recap.label.message": "Mensaje",
    "recap.value.noPhoto": "Ninguna",
    "recap.value.noMessage": "Ninguno",
    "recap.edit": "Editar",
    "error.send": "Error al enviar. Intente de nuevo o contáctenos de otra forma.",
    "meta.title": "S.O.S Abeilles Guyane — Recogida gratuita de enjambres",
    "meta.description": "Servicio gratuito y local de recogida y reubicación de enjambres de abejas en la Guayana Francesa (CACL): Cayenne, Rémire-Montjoly, Matoury, Macouria, Montsinéry-Tonnegrande, Roura. Notifique en línea, respuesta rápida.",
    "banner.text": "Recogida gratuita y sin peligro para usted y las abejas"
  },
  pt: {
    "cta.report": "Sinalizar um enxame",
    "nav.zone": "Área de atuação",
    "nav.comment": "Como funciona",
    "nav.attendant": "Enquanto espera",
    "hero.title": "Um enxame de abelhas se instalou na sua casa?🐝",
    "hero.lead": "Nós recolhemos e realocamos as abelhas em seu ambiente natural, em vez de as destruir.<br><br>Sinalize um enxame em poucos cliques, um apicultor local assume o resto.",
    "hero.btnGhost": "O que fazer enquanto espera?",
    "nid.title": "Onde os enxames gostam de se instalar",
    "nid.subtitle": "Passe o cursor sobre as diferentes áreas para descobrir onde os enxames mais costumam se instalar.",
    "nid.hotspot1.aria": "Ramos e troncos de árvores: o local mais frequente, muitas vezes um ramo baixo ou um tronco vazio",
    "nid.hotspot1.tip": "Ramos e troncos<br><small>o local mais frequente</small>",
    "nid.hotspot2.aria": "Forros e sótãos: um local escuro e seco em altura",
    "nid.hotspot2.tip": "Forros, sótãos<br><small>escuro e seco, em altura</small>",
    "nid.hotspot3.aria": "Baldes e pneus abandonados: geralmente secos e protegidos da chuva",
    "nid.hotspot3.tip": "Baldes, pneus velhos<br><small>secos, sem chuva</small>",
    "nid.hotspot4.aria": "Medidores de água ou de eletricidade: sua cavidade protegida é ideal",
    "nid.hotspot4.tip": "Medidores de água / luz<br><small>cavidade protegida ideal</small>",
    "nid.hotspot5.aria": "Caixas de papelão e caixotes vazios: deixados fora ou em um galpão de jardim",
    "nid.hotspot5.tip": "Caixas, caixotes vazios<br><small>galpão, garagem</small>",
    "zone.title": "Área de atuação",
    "zone.subtitle": "O serviço cobre o território da CACL (Communauté d'Agglomération du Centre Littoral).",
    "zone.mapAria": "Mapa da área de atuação: Cayenne, Rémire-Montjoly, Matoury, Macouria, Montsinéry-Tonnegrande e Roura",
    "zone.mapNote": "Mapa real do OpenStreetMap: o círculo cor de mel indica a área de atuação geral, de Macouria a Roura, apenas a título indicativo — não é um limite administrativo exato.",
    "steps.title": "Como funciona",
    "steps.subtitle": "Três etapas, do sinal até a intervenção.",
    "steps.1.title": "Você sinaliza",
    "steps.1.text": "Preencha uma descrição completa do enxame através do nosso chat interativo.",
    "steps.2.title": "Você recebe uma confirmação",
    "steps.2.text": "Um email confirma imediatamente que o seu sinal foi recebido e está sendo analisado.",
    "steps.3.title": "O apicultor intervém",
    "steps.3.text": "Assim que assume o seu pedido, ele entra em contato diretamente com você (geralmente por telefone, às vezes por email) para agendar um horário de intervenção.",
    "consignes.title": "Enquanto espera a intervenção",
    "consignes.subtitle": "Um enxame já instalado costuma estar calmo. Aqui estão as atitudes certas.",
    "tab.faire": "Fazer",
    "tab.eviter": "Evitar",
    "tab.faq": "Perguntas frequentes",
    "faire.1": "<span class=\"info-key\">10 metros no mínimo</span> de distância do enxame",
    "faire.2": "Janelas e portas <span class=\"info-key\">devem ficar fechadas</span>",
    "faire.3": "Mantenha crianças e animais <span class=\"info-key\">afastados</span> da área do enxame",
    "faire.4": "Mantenha <span class=\"info-key\">afastadas</span> as pessoas alérgicas",
    "faire.5": "Avise os vizinhos se o enxame estiver em uma área compartilhada",
    "eviter.1": "<span class=\"info-key\">Nunca</span> use água, insecticida ou aerossol",
    "eviter.2": "<span class=\"info-key\">Não</span> mova ou destrua o enxame você mesmo",
    "eviter.3": "Sem fumaça nem fogo próximo",
    "eviter.4": "Evite ruídos e vibrações (cortador de grama, furadeira, música, idas e vindas de animais)",
    "faq.1.q": "Quem vem até a minha casa?",
    "faq.1.a": "Um <span class=\"info-key\">apicultor local</span>, não uma empresa de controle de pragas. Ele captura o enxame e o realoca vivo em uma colmeia, para preservar as abelhas.",
    "faq.2.q": "É realmente gratuito?",
    "faq.2.a": "<span class=\"info-key\">Sim, na grande maioria dos casos.</span> Em certas situações particulares, uma contribuição pode ser acordada diretamente entre você e o apicultor, a critério de ambas as partes.",
    "faq.3.q": "Como o apicultor entra em contato comigo?",
    "faq.3.a": "Na maioria das vezes <span class=\"info-key\">por telefone</span>, para combinar rapidamente um horário. Ele também pode escrever por email, conforme a disponibilidade dele.",
    "faq.4.q": "Qual o prazo antes da intervenção?",
    "faq.4.a": "<span class=\"info-key\">24 a 48h</span> conforme a disponibilidade. Prioridade para situações urgentes (movimento de pessoas, crianças e animais).",
    "faq.5.q": "Qual o prazo de resposta ao meu sinal?",
    "faq.5.a": "Confirmação <span class=\"info-key\">imediata</span> por email, depois uma ligação do apicultor para combinar um horário.",
    "faq.6.q": "Um vizinho já sinalizou, eu sinalizo mesmo assim?",
    "faq.6.a": "Não é necessário se você tem <span class=\"info-key\">certeza</span> de que já foi sinalizado. Em caso de dúvida, sinalize mesmo assim.",
    "faq.7.q": "Picada ou reação alérgica?",
    "faq.7.a": "Inchaço, dificuldade para respirar, mal-estar: <span class=\"info-key\">emergência</span>, ligue imediatamente para o 15 ou o 112.",
    "faq.8.q": "Por que evitar o ruído?",
    "faq.8.a": "As vibrações estressam as abelhas e podem desencadear uma <span class=\"info-key\">reação defensiva</span> coletiva.",
    "faq.9.q": "Como proteger meus animais?",
    "faq.9.a": "Coloque-os para dentro, ou mantenha-os calmos a <span class=\"info-key\">10 metros no mínimo</span> do enxame.",
    "loading.aria": "Enviando o seu sinal",
    "loading.text": "Enviando o seu sinal...",
    "modal.close": "Fechar",
    "report.title": "Sinalizar um enxame",
    "report.subtitle": "Responda as perguntas uma após a outra. É rápido!",
    "step1.label": "Qual é o seu nome?",
    "step2.label": "Qual é o seu número de telefone?",
    "step3.label": "Qual é o seu email?",
    "step3.hint": "Para receber a confirmação de que seu pedido está sendo tratado.",
    "step4.label": "Em qual município está o enxame?",
    "step5.label": "Indique um endereço, ou um ponto de referência",
    "step5.placeholder": "Rua, loteamento, ponto de referência...",
    "step6.label": "Exatamente onde está o enxame?",
    "step6.hint": "Árvore, parede, medidor elétrico, veículo...",
    "step7.label": "Desde quando ele está aí?",
    "step8.legend": "Como você avaliaria a urgência da situação?",
    "step8.opt1": "Baixa — área pouco frequentada",
    "step8.opt2": "Média — próximo de uma passagem",
    "step8.opt3": "Alta — próximo de crianças, escola ou local público",
    "step9.label": "Você tem uma foto do enxame?",
    "step9.hint": "Opcional — ajuda o apicultor a avaliar a situação. Comprimida automaticamente antes do envio.",
    "step10.label": "Alguma informação adicional a acrescentar?",
    "step10.hint": "Tamanho aproximado, comportamento observado, acesso ao local...",
    "btn.continue": "Continuar",
    "btn.skip": "Pular esta etapa",
    "depuis.opt1": "Hoje",
    "depuis.opt2": "Desde ontem",
    "depuis.opt3": "Há mais de 2 dias",
    "depuis.opt4": "Não sei",
    "recap.privacyPrefix": "Seus dados são usados apenas para organizar esta intervenção.",
    "privacy.linkLabel": "Política de privacidade",
    "btn.submit": "Enviar o sinal",
    "success.title": "Sinal enviado!",
    "success.text": "Um apicultor local vai assumir o seu pedido de intervenção.",
    "about.title": "Sobre nós",
    "about.subtitle": "Uma empresa familiar de apicultura, estabelecida desde 2006 nos arredores de Cayenne, guiada por três valores simples.",
    "about.card1.title": "Modernidade",
    "about.card1.text": "Um saber-fazer apícola familiar, combinado com ferramentas atuais como este site, para um serviço rápido e acessível on-line.",
    "about.card2.title": "Qualidade",
    "about.card2.text": "Cada enxame é capturado vivo e realocado com cuidado, respeitando o bem-estar animal e o meio ambiente da Guiana Francesa.",
    "about.card3.title": "Equidade",
    "about.card3.text": "Um serviço pensado para ser justo, tanto para as pessoas que nos sinalizam um enxame quanto para os nossos apicultores.",
    "footer.copyright": "&copy; <strong>2026</strong> S.O.S Abeilles Guyane. Todos os direitos reservados.",
    "bot.step1": "Olá 👋 Vou fazer algumas perguntas para organizar a coleta do enxame. Qual é o seu nome?",
    "bot.step2": "Obrigado. Qual é o seu número de telefone?",
    "bot.step3": "E o seu email? Ele será usado para enviar a confirmação.",
    "bot.step4": "Em qual município está o enxame?",
    "bot.step5": "Qual é o endereço exato, ou um ponto de referência?",
    "bot.step6": "Exatamente onde está o enxame?",
    "bot.step7": "Desde quando ele está aí?",
    "bot.step8": "Como você avaliaria a urgência da situação?",
    "bot.step9": "Você tem uma foto do enxame? Isso ajuda bastante o apicultor antes de se deslocar.",
    "bot.step10": "Mais alguma coisa que queira acrescentar antes de enviar?",
    "bot.step11": "Aqui está o resumo do seu sinal. Verifique se tudo está correto antes de enviar.",
    "progress.step": "Etapa {n} de 10",
    "progress.last": "Última etapa — confira e envie",
    "validator.nom.tooShort": "Indique o seu nome (2 caracteres no mínimo).",
    "validator.nom.invalid": "Indique um nome válido.",
    "validator.telephone.tooShort": "Indique um número de telefone válido (9 dígitos no mínimo, ex. 0694 12 34 56).",
    "validator.telephone.tooLong": "Este número de telefone parece longo demais — verifique.",
    "validator.email.invalid": "Indique um endereço de email válido (ex. nome@exemplo.com).",
    "validator.adresse.tooShort": "Indique o endereço ou um ponto de referência.",
    "validator.emplacement.tooShort": "Indique onde está o enxame.",
    "answer.noPhoto": "Sem foto",
    "answer.nothingToAdd": "Nada a acrescentar",
    "skip.noPhoto": "Sem foto",
    "recap.label.nom": "Nome",
    "recap.label.telephone": "Telefone",
    "recap.label.email": "Email",
    "recap.label.commune": "Município",
    "recap.label.adresse": "Endereço",
    "recap.label.emplacement": "Localização",
    "recap.label.depuis": "Desde quando",
    "recap.label.urgence": "Urgência",
    "recap.label.photo": "Foto",
    "recap.label.message": "Mensagem",
    "recap.value.noPhoto": "Nenhuma",
    "recap.value.noMessage": "Nenhuma",
    "recap.edit": "Editar",
    "error.send": "Falha no envio. Tente novamente ou contate-nos de outra forma.",
    "meta.title": "S.O.S Abeilles Guyane — Coleta gratuita de enxames",
    "meta.description": "Serviço gratuito e local de coleta e realocação de enxames de abelhas na Guiana Francesa (CACL): Cayenne, Rémire-Montjoly, Matoury, Macouria, Montsinéry-Tonnegrande, Roura. Sinalize on-line, resposta rápida.",
    "banner.text": "Recolha gratuita e sem perigo para si e para as abelhas"
  },
  zh: {
    "cta.report": "报告蜂群",
    "nav.zone": "服务区域",
    "nav.comment": "运作方式",
    "nav.attendant": "等待期间",
    "hero.title": "家里出现蜂群了吗?🐝",
    "hero.lead": "我们收集并转移蜜蜂,而不是消灭它们。<br><br>只需几步即可报告蜂群,当地养蜂人将接手处理。",
    "hero.btnGhost": "等待期间该怎么办?",
    "nid.title": "蜂群喜欢安家的地方",
    "nid.subtitle": "将鼠标悬停在不同区域上,了解蜂群最常安家的位置。",
    "nid.hotspot1.aria": "树枝和树干:最常见的地点,通常是低矮的树枝或空心树干",
    "nid.hotspot1.tip": "树枝和树干<br><small>最常见的地点</small>",
    "nid.hotspot2.aria": "吊顶和阁楼:高处干燥阴暗的地方",
    "nid.hotspot2.tip": "吊顶、阁楼<br><small>高处干燥阴暗</small>",
    "nid.hotspot3.aria": "废弃的桶和轮胎:干燥且可避雨",
    "nid.hotspot3.tip": "废弃桶、轮胎<br><small>干燥、可避雨</small>",
    "nid.hotspot4.aria": "水表或电表:其保护空腔非常理想",
    "nid.hotspot4.tip": "水表/电表<br><small>理想的保护空腔</small>",
    "nid.hotspot5.aria": "空纸箱和箱子:放在室外或花园棚里的",
    "nid.hotspot5.tip": "纸箱、空箱子<br><small>花园棚、车库</small>",
    "zone.title": "服务区域",
    "zone.subtitle": "本服务覆盖CACL(中央沿海城市群)辖区。",
    "zone.mapAria": "服务区域地图:卡宴、雷米尔蒙乔利、马图里、马库里亚、蒙西内里-通尼格朗德和鲁拉",
    "zone.mapNote": "真实的OpenStreetMap地图:蜂蜜色圆圈仅作参考,标示从马库里亚到鲁拉的整体服务范围——并非精确的行政边界。",
    "steps.title": "运作方式",
    "steps.subtitle": "从报告到处理,共三个步骤。",
    "steps.1.title": "您进行报告",
    "steps.1.text": "通过我们的互动聊天,填写蜂群的完整描述。",
    "steps.2.title": "您收到确认",
    "steps.2.text": "系统会立即发送邮件确认您的报告已收到并正在处理中。",
    "steps.3.title": "养蜂人介入处理",
    "steps.3.text": "一旦养蜂人接手您的请求,会直接与您联系(通常通过电话,有时通过邮件)以安排处理时间。",
    "consignes.title": "等待处理期间",
    "consignes.subtitle": "安定下来的蜂群通常很平静。以下是正确的应对方法。",
    "tab.faire": "应该做",
    "tab.eviter": "不应该做",
    "tab.faq": "常见问题",
    "faire.1": "与蜂群保持<span class=\"info-key\">至少10米</span>的距离",
    "faire.2": "门窗<span class=\"info-key\">必须保持关闭</span>",
    "faire.3": "让儿童和宠物<span class=\"info-key\">远离</span>蜂群所在区域",
    "faire.4": "让过敏体质的人<span class=\"info-key\">远离</span>",
    "faire.5": "如果蜂群位于共用区域,请提醒邻居",
    "eviter.1": "<span class=\"info-key\">切勿</span>使用水、杀虫剂或喷雾剂",
    "eviter.2": "<span class=\"info-key\">切勿</span>自行移动或摧毁蜂群",
    "eviter.3": "附近不要有烟雾或火源",
    "eviter.4": "避免噪音和震动(割草机、电钻、音乐、宠物往来走动)",
    "faq.1.q": "谁会来我家处理?",
    "faq.1.a": "是<span class=\"info-key\">当地的养蜂人</span>,而不是灭虫公司。他们会活捉蜂群并将其安置到蜂箱中,以保护蜜蜂。",
    "faq.2.q": "真的是免费的吗?",
    "faq.2.a": "<span class=\"info-key\">绝大多数情况下是免费的。</span>在某些特殊情况下,您可以与养蜂人直接协商,自愿给予一定报酬。",
    "faq.3.q": "养蜂人会如何联系我?",
    "faq.3.a": "通常<span class=\"info-key\">通过电话</span>联系,以便迅速约定时间。根据情况,也可能通过邮件联系您。",
    "faq.4.q": "处理需要多长时间?",
    "faq.4.a": "视情况而定,通常为<span class=\"info-key\">24至48小时</span>。紧急情况(人流密集处、儿童或宠物附近)将优先处理。",
    "faq.5.q": "我的报告多久会得到回复?",
    "faq.5.a": "系统会<span class=\"info-key\">立即</span>发送确认邮件,随后养蜂人会致电与您约定时间。",
    "faq.6.q": "邻居已经报告过了,我还需要报告吗?",
    "faq.6.a": "如果您<span class=\"info-key\">确定</span>已经有人报告过,则无需重复。如有疑问,建议您仍然报告。",
    "faq.7.q": "被蜂螫或出现过敏反应怎么办?",
    "faq.7.a": "如出现肿胀、呼吸困难或不适:<span class=\"info-key\">这是紧急情况</span>,请立即拨打15或112。",
    "faq.8.q": "为什么要避免噪音?",
    "faq.8.a": "震动会让蜜蜂感到压力,可能引发集体<span class=\"info-key\">防御性反应</span>。",
    "faq.9.q": "如何保护我的宠物?",
    "faq.9.a": "将宠物带回室内,或让它们保持安静,并与蜂群保持<span class=\"info-key\">至少10米</span>的距离。",
    "loading.aria": "正在发送您的报告",
    "loading.text": "正在发送您的报告...",
    "modal.close": "关闭",
    "report.title": "报告蜂群",
    "report.subtitle": "请逐一回答以下问题,非常简单快捷!",
    "step1.label": "请问您的姓名是?",
    "step2.label": "您的电话号码是多少?",
    "step3.label": "您的电子邮箱是?",
    "step3.hint": "用于接收处理确认。",
    "step4.label": "蜂群位于哪个市镇?",
    "step5.label": "请提供具体地址或参照物",
    "step5.placeholder": "街道、小区、参照物……",
    "step6.label": "蜂群具体位于哪里?",
    "step6.hint": "树上、墙上、电表、车辆……",
    "step7.label": "蜂群出现多久了?",
    "step8.legend": "您认为目前情况的紧急程度如何?",
    "step8.opt1": "较低 — 人迹罕至的区域",
    "step8.opt2": "中等 — 靠近人行通道",
    "step8.opt3": "较高 — 靠近儿童、学校或公共场所",
    "step9.label": "您有蜂群的照片吗?",
    "step9.hint": "可选 — 有助于养蜂人评估情况,发送前会自动压缩。",
    "step10.label": "还有其他需要补充的信息吗?",
    "step10.hint": "大致大小、观察到的行为、场地是否易于进入……",
    "btn.continue": "继续",
    "btn.skip": "跳过此步骤",
    "depuis.opt1": "今天",
    "depuis.opt2": "从昨天开始",
    "depuis.opt3": "超过2天了",
    "depuis.opt4": "不确定",
    "recap.privacyPrefix": "您的数据仅用于安排本次处理。",
    "privacy.linkLabel": "隐私政策",
    "btn.submit": "提交报告",
    "success.title": "报告已发送!",
    "success.text": "当地养蜂人将负责处理您的请求。",
    "about.title": "关于我们",
    "about.subtitle": "一家自2006年起在卡宴周边经营的家族养蜂企业,秉持三个简单的价值观。",
    "about.card1.title": "现代化",
    "about.card1.text": "家族传承的养蜂技艺,结合本网站等现代工具,提供快捷且便于在线使用的服务。",
    "about.card2.title": "品质",
    "about.card2.text": "每一个蜂群都被活体捕获并妥善安置,充分尊重动物福利及圭亚那的自然环境。",
    "about.card3.title": "公平",
    "about.card3.text": "本服务致力于兼顾公平,无论是报告蜂群的居民,还是我们的养蜂人。",
    "footer.copyright": "&copy; <strong>2026</strong> S.O.S Abeilles Guyane. 保留所有权利。",
    "bot.step1": "您好 👋 我将问您几个问题,以便安排蜂群的收集工作。请问您的姓名是?",
    "bot.step2": "谢谢。您的电话号码是多少?",
    "bot.step3": "您的电子邮箱是?用于向您发送处理确认。",
    "bot.step4": "蜂群位于哪个市镇?",
    "bot.step5": "具体地址或参照物是什么?",
    "bot.step6": "蜂群具体位于哪里?",
    "bot.step7": "蜂群出现多久了?",
    "bot.step8": "您认为目前情况的紧急程度如何?",
    "bot.step9": "您有蜂群的照片吗?这将大大帮助养蜂人做好出发前的准备。",
    "bot.step10": "发送前还有什么需要补充的吗?",
    "bot.step11": "这是您报告内容的摘要。请在发送前确认信息无误。",
    "progress.step": "第 {n} 步,共10步",
    "progress.last": "最后一步 — 请检查并发送",
    "validator.nom.tooShort": "请填写您的姓名(至少2个字符)。",
    "validator.nom.invalid": "请填写有效的姓名。",
    "validator.telephone.tooShort": "请填写有效的电话号码(至少9位数字,例如0694 12 34 56)。",
    "validator.telephone.tooLong": "该电话号码似乎过长——请检查填写内容。",
    "validator.email.invalid": "请填写有效的电子邮箱地址(例如nom@exemple.com)。",
    "validator.adresse.tooShort": "请填写地址或参照物。",
    "validator.emplacement.tooShort": "请说明蜂群的具体位置。",
    "answer.noPhoto": "无照片",
    "answer.nothingToAdd": "无需补充",
    "skip.noPhoto": "无照片",
    "recap.label.nom": "姓名",
    "recap.label.telephone": "电话",
    "recap.label.email": "邮箱",
    "recap.label.commune": "市镇",
    "recap.label.adresse": "地址",
    "recap.label.emplacement": "位置",
    "recap.label.depuis": "出现时间",
    "recap.label.urgence": "紧急程度",
    "recap.label.photo": "照片",
    "recap.label.message": "留言",
    "recap.value.noPhoto": "无",
    "recap.value.noMessage": "无",
    "recap.edit": "修改",
    "error.send": "发送失败,请重试或通过其他方式联系我们。",
    "meta.title": "S.O.S Abeilles Guyane — 免费蜂群收集服务",
    "meta.description": "法属圭亚那(CACL地区)免费本地蜂群收集与转移服务:卡宴、雷米尔蒙乔利、马图里、马库里亚、蒙西内里-通尼格朗德、鲁拉。在线报告,快速响应。",
    "banner.text": "免费收集,对您和蜜蜂都安全无害"
  }
};

let currentLang = "fr";
function t(key){
  const dict = I18N[currentLang] || I18N.fr;
  return (dict && dict[key] !== undefined) ? dict[key] : (I18N.fr[key] !== undefined ? I18N.fr[key] : key);
}

function applyTranslations(lang){
  currentLang = I18N[lang] ? lang : "fr";
  document.documentElement.lang = currentLang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
  });

  document.title = t("meta.title");
  const metaDesc = document.querySelector('meta[name="description"]');
  if(metaDesc){ metaDesc.setAttribute("content", t("meta.description")); }
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if(ogTitle){ ogTitle.setAttribute("content", t("meta.title")); }
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if(ogDesc){ ogDesc.setAttribute("content", t("meta.description")); }

  // La progression du chatbot ("Étape X sur 10") est du texte généré en
  // JS, pas statique dans le HTML : on la remet à jour ici si la boîte
  // de signalement est déjà ouverte au moment du changement de langue.
  if(typeof window.__updateProgressLabel === "function"){ window.__updateProgressLabel(); }

  try{ localStorage.setItem("sosAbeillesLang", currentLang); }catch(e){}
}

function getInitialLang(){
  try{
    const saved = localStorage.getItem("sosAbeillesLang");
    if(saved && I18N[saved]) return saved;
  }catch(e){}
  return "fr";
}

/* ---------- Onglets "En attendant l'intervention" ---------- */
(function initInfoTabs(){
  const nav = document.querySelector(".info-tab-nav");
  if(!nav) return;
  const buttons = nav.querySelectorAll(".info-tab-btn");
  const panels = document.querySelectorAll(".info-tab-panel");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      const target = btn.dataset.tab;
      panels.forEach((panel) => {
        const match = panel.dataset.panel === target;
        panel.hidden = !match;
        panel.classList.toggle("active", match);
      });
    });
  });
})();

(function initZoneMap(){
  const mapEl = document.getElementById("zone-leaflet-map");
  if(!mapEl || typeof L === "undefined") return;

  // Clé gratuite : maptiler.com (compte requis, sans carte bancaire)
  const MAPTILER_KEY = "BWLQgt3asW0Wt5A6AKvg";

  const communes = [
    { nom: "Cayenne",                 lat: 4.9372, lng: -52.3260 },
    { nom: "Rémire-Montjoly",         lat: 4.9050, lng: -52.2767 },
    { nom: "Matoury",                 lat: 4.8472, lng: -52.3311 },
    { nom: "Macouria",                lat: 5.0139, lng: -52.4742 },
    { nom: "Montsinéry-Tonnegrande",  lat: 4.8919, lng: -52.4933 },
    { nom: "Roura",                   lat: 4.7280, lng: -52.3260 }
  ];

  const map = L.map(mapEl, {
    scrollWheelZoom: false,
    attributionControl: true
  }).setView([4.925, -52.38], 10);

  L.tileLayer("https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=" + MAPTILER_KEY, {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map).on("tileerror", function(){
    if(mapEl.dataset.fallbackShown) return;
    mapEl.dataset.fallbackShown = "1";
    const fallback = document.createElement("div");
    fallback.className = "map-fallback";
    fallback.innerHTML = "<p>Carte momentanément indisponible.</p>"
      + "<p class=\"map-fallback-hint\">Clé MapTiler manquante ou invalide — voir la constante MAPTILER_KEY dans le code.</p>";
    mapEl.appendChild(fallback);
  });

  // Rayon global recalculé (centroïde + distance max + marge) pour
  // englober les 6 communes, plutôt qu'un cercle par ville.
  L.circle([4.8872, -52.3712], {
    radius: 22000,
    color: "#D9A02C",
    weight: 1.5,
    fillColor: "#D9A02C",
    fillOpacity: 0.12
  }).addTo(map);

  const markers = communes.map((c) => {
    const marker = L.circleMarker([c.lat, c.lng], {
      radius: 5,
      color: "#16281C",
      weight: 1.6,
      fillColor: "#D9A02C",
      fillOpacity: 1
    }).addTo(map);

    const label = L.marker([c.lat, c.lng], {
      icon: L.divIcon({
        className: "commune-label",
        html: c.nom,
        iconSize: [160, 16],
        iconAnchor: [-10, 8]
      }),
      interactive: false
    }).addTo(map);

    function activate(){
      marker.setRadius(8);
      label.getElement() && label.getElement().classList.add("is-active");
    }
    function deactivate(){
      marker.setRadius(5);
      label.getElement() && label.getElement().classList.remove("is-active");
    }

    marker.on("mouseover", activate);
    marker.on("mouseout", deactivate);

    return { activate, deactivate };
  });

  // Chaque ville s'accentue et grossit tour à tour, en boucle continue
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!reduceMotion){
    let cycleIndex = 0;
    setInterval(() => {
      markers.forEach((m, i) => { i === cycleIndex ? m.activate() : m.deactivate(); });
      cycleIndex = (cycleIndex + 1) % markers.length;
    }, 1800);
  }
})();

/* =========================================================
/* =========================================================
   Nuée interactive (hero) — points noir & or qui restent groupés
   autour de leur reine et se dispersent au passage de la souris.
   Rendue en <canvas> pour rester fluide à ce nombre de points ;
   respecte prefers-reduced-motion et se met en pause si l'onglet
   n'est pas visible.
   ========================================================= */
   (function initSwarm(){
     const canvas = document.getElementById("swarm-canvas");
     if(!canvas) return;
     const ctx = canvas.getContext("2d");
     const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 
     const GOLD = ["#D9A02C", "#E8B44A", "#B87F1E"];
     const DARK = ["#1B140C", "#241A0F"];
     const QUEEN_COUNT = 5;
     const COUNT = 1500;
     const MIN_BEES_PER_QUEEN = 10;
     const NEIGHBOR_RADIUS = 55;   // rayon de perception pour l'alignement
     const MAX_NEIGHBOR_CHECKS = 24; // plafond dur : évite l'explosion quand un essaim se resserre
     const SEPARATION_RADIUS = 7;  // distance minimale confortable entre deux points
     const FLEE_RADIUS = 110;
     const CRUISE_SPEED = 0.9;     // vitesse de croisière visée — plus vif, moins "flottant"
     const BOUNCE_FACTOR = 2.2;    // rebond aux bords : vitesse fortement amplifiée pour un vrai "éclatement"
     const BOOST_DURATION = 20;    // nombre d'images pendant lesquelles la propulsion reste active
     const FLEE_BOOST_DURATION = 16; // fuite au passage de la souris : même logique de propulsion, instantanée
     const SCATTER_KICK = 1.6;     // kick latéral aléatoire ajouté à chaque rebond, pour un éclatement en grappes désordonnées plutôt qu'un simple rebond uniforme
     const ZIGZAG_AMOUNT = 1.15;   // force latérale (perpendiculaire à la reine) qui rend la trajectoire d'approche erratique plutôt qu'en ligne droite
     // Approche finale sur une vignette de nidification (reine "accrochée") : cas à part.
     // Sans ça, des centaines d'abeilles convergent en ligne quasi droite vers un point fixe,
     // ce qui donne un vol qui "tombe" verticalement au lieu de grouiller.
     const DOCK_ZIGZAG_BOOST = 2.4;     // désordre latéral individuel bien plus fort qu'un simple repos en vol
     const DOCK_ZIGZAG_FREQ = 0.26;     // oscillation plus rapide : des trajectoires en S courtes et nerveuses, pas de longues ondulations
     const DOCK_WANDER_JITTER = 0.9;    // vol individuel beaucoup plus imprévisible que le repos normal
     const DOCK_WANDER_FORCE = 0.14;
     const DOCK_ATTRACTION = 0.011;     // se ruent vers leur reine posée, plus vite qu'un simple resserrement
     const DOCK_SEPARATION_RADIUS = 15; // rayon de collision élargi : à cette densité, les abeilles qui convergent doivent se croiser, s'éviter et se percuter
     const DOCK_BUMP_FORCE = 1.2;       // réponse à la collision nettement plus franche qu'un simple lissage
     const DOCK_BUMP_BOOST = 7;         // petit coup de vitesse bref à l'impact, pour un vrai rebond plutôt qu'un glissement
     const SCROLL_IMPULSE = 0.05;  // force transmise à l'essaim quand on fait défiler la page
     const CAPTURE_RADIUS = 130;   // distance à laquelle une abeille peut changer de reine
     const CAPTURE_CHANCE = 0.015; // chance par image de changer d'allégeance en passant à côté
     const DISTURB_CAPTURE_CHANCE = 0.16; // chance nettement plus forte juste après une perturbation
     const dpr = Math.min(window.devicePixelRatio || 1, 2);
 
     let width = 0, height = 0;
     let headerHeight = 0;
     let beeCeilingY = Infinity;
     let particles = [];
     let queens = [];
     let mouse = { x: -9999, y: -9999, active: false };
     let rafId = null;
     let frameCount = 0;
 
     function resize(){
       width = window.innerWidth;
       height = window.innerHeight;
       canvas.width = width * dpr;
       canvas.height = height * dpr;
       canvas.style.width = width + "px";
       canvas.style.height = height + "px";
       ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
       const headerEl = document.querySelector("header");
       headerHeight = headerEl ? headerEl.offsetHeight : 0;
     }
 
     function randomColor(){
       const dark = Math.random() < 0.4;
       return dark ? DARK[Math.floor(Math.random() * DARK.length)] : GOLD[Math.floor(Math.random() * GOLD.length)];
     }
 
     function makeParticle(queenIndex){
       const angle = Math.random() * Math.PI * 2;
       return {
         x: Math.random() * width,
         y: Math.random() * height,
         vx: Math.cos(angle) * CRUISE_SPEED,
         vy: Math.sin(angle) * CRUISE_SPEED,
         wanderAngle: angle,
         zigzagSeed: Math.random() * Math.PI * 2, // déphasage individuel : le zigzag de chaque abeille est indépendant
         r: 0.9 + Math.random() * 1.1,
         boostFrames: 0,
         queenIndex: queenIndex,
         color: randomColor()
       };
     }
 
     // Zones de départ réparties à l'écran, chacune avec son propre
     // cycle vol/repos indépendant.
     function initQueens(){
       const zones = [
         { x: 0.2, y: 0.25 },
         { x: 0.8, y: 0.28 },
         { x: 0.5, y: 0.5 },
         { x: 0.28, y: 0.78 },
         { x: 0.75, y: 0.75 }
       ];
       queens = zones.map((z) => {
         const wanderAngle = Math.random() * Math.PI * 2;
         return {
           x: width * z.x,
           y: Math.max(headerHeight + 20, height * z.y),
           vx: Math.cos(wanderAngle) * 0.2,
           vy: Math.sin(wanderAngle) * 0.2,
           wanderAngle: wanderAngle,
           pulsePhase: Math.random() * Math.PI * 2, // désynchronise la pulsation de chaque essaim
           boostFrames: 0,
           state: "flying",
           stateTimer: 100 + Math.floor(Math.random() * 300),
           homeXFrac: z.x,
           homeYFrac: z.y,
           // Même apparence qu'une ouvrière : ni taille ni couleur ne la distingue
           r: 0.9 + Math.random() * 1.1,
           color: randomColor()
         };
       });
     }
 
     let colorBuckets = new Map();
 
     function initParticles(){
       initQueens();
       // Dispersées largement autour de leur reine dès le départ ; la
       // répartition entre les reines est aléatoire, pas forcément égale.
       particles = Array.from({ length: COUNT }, () => {
         const qi = Math.floor(Math.random() * QUEEN_COUNT);
         const q = queens[qi];
         const p = makeParticle(qi);
         const a = Math.random() * Math.PI * 2;
         const r = Math.random() * Math.min(width, height) * 0.22;
         p.x = q.x + Math.cos(a) * r;
         p.y = q.y + Math.sin(a) * r;
         return p;
       });
 
       // Regroupées par couleur (fixe pour chaque point) pour dessiner chaque
       // groupe en un seul fill() plutôt que des milliers d'appels individuels.
       colorBuckets = new Map();
       const addToBucket = (obj) => {
         if(!colorBuckets.has(obj.color)){ colorBuckets.set(obj.color, []); }
         colorBuckets.get(obj.color).push(obj);
       };
       particles.forEach(addToBucket);
       queens.forEach(addToBucket);
     }
 
     // Grille spatiale : évite de comparer chaque point à tous les autres
     // (O(n) plutôt que O(n²), nécessaire à ce nombre de particules)
     function buildGrid(cellSize){
       const grid = new Map();
       for(let i = 0; i < particles.length; i++){
         const p = particles[i];
         // Clé numérique : plus rapide à calculer et à hacher qu'une chaîne
         const key = Math.floor(p.x / cellSize) * 100000 + Math.floor(p.y / cellSize);
         if(!grid.has(key)){ grid.set(key, []); }
         grid.get(key).push(p);
       }
       return grid;
     }
 
     // Alterne "flying" (nuée dispersée) et "resting" (nuée resserrée), comme un
     // essaim qui se pose puis repart. Minuteur indépendant par reine.
     function updateQueenState(q){
       q.stateTimer--;
       if(q.stateTimer <= 0){
         if(q.state === "flying"){
           q.state = "resting";
           q.stateTimer = 180 + Math.floor(Math.random() * 180); // ~3 à 6s
         } else {
           q.state = "flying";
           q.stateTimer = 240 + Math.floor(Math.random() * 240); // ~4 à 8s
         }
       }
     }
 
     function stepQueen(q){
       // Mode "accroché" (section nidification visible) : la reine se
       // stabilise sur sa vignette, état "resting" forcé, vol en pause.
       if(q.dockTarget){
         q.x += (q.dockTarget.x - q.x) * 0.22;
         q.y += (q.dockTarget.y - q.y) * 0.22;
         q.vx = 0; q.vy = 0;
         q.state = "resting";
         return;
       }
 
       if(q.state === "flying"){
         q.wanderAngle += (Math.random() - 0.5) * 0.4;
         q.vx += Math.cos(q.wanderAngle) * 0.045;
         q.vy += Math.sin(q.wanderAngle) * 0.045;
       } else {
         // Se pose : freine fortement jusqu'à l'arrêt
         q.vx *= 0.9;
         q.vy *= 0.9;
       }
 
       // Rappel doux vers sa zone d'origine (sinon scroll/rebonds poussent tout
       // dans un coin), avec un léger zigzag pour éviter une ligne droite téléguidée.
       const flyTop = headerHeight;
       const flyBottom = Math.min(height, beeCeilingY);
       if(flyBottom > flyTop){
         const homeX = width * q.homeXFrac;
         const homeY = flyTop + (flyBottom - flyTop) * q.homeYFrac;
         const dxh = homeX - q.x, dyh = homeY - q.y;
         q.vx += dxh * 0.0009;
         q.vy += dyh * 0.0009;
         const distH = Math.hypot(dxh, dyh) || 1;
         const wobble = Math.sin(frameCount * 0.05 + q.pulsePhase) * 0.35;
         q.vx += (-dyh / distH) * wobble;
         q.vy += (dxh / distH) * wobble;
       }
 
       // Répulsion douce entre reines, pour éviter qu'elles finissent
       // regroupées au même endroit avec le temps.
       const minQueenDist = Math.min(width, height) * 0.3; // légèrement élargi : les essaims se répartissent mieux sur l'ensemble de la zone de vol
       queens.forEach((other) => {
         if(other === q) return;
         const dx = q.x - other.x, dy = q.y - other.y;
         const dist = Math.hypot(dx, dy) || 1;
         if(dist < minQueenDist){
           const force = (1 - dist / minQueenDist) * 0.05;
           q.vx += (dx / dist) * force;
           q.vy += (dy / dist) * force;
         }
       });
 
       // Fuite : si la souris s'approche du cœur de l'essaim, il détale d'un coup
       if(mouse.active){
         const dx = q.x - mouse.x, dy = q.y - mouse.y;
         const dist = Math.hypot(dx, dy) || 1;
         if(dist < FLEE_RADIUS){
           const force = (1 - dist / FLEE_RADIUS) * 0.7;
           q.vx += (dx / dist) * force;
           q.vy += (dy / dist) * force;
           q.boostFrames = Math.max(q.boostFrames, FLEE_BOOST_DURATION);
         }
       }
 
       q.vx *= 0.97;
       q.vy *= 0.97;
       const baseMaxQueenSpeed = q.state === "flying" ? 0.75 : 0.12;
       const maxQueenSpeed = q.boostFrames > 0 ? baseMaxQueenSpeed * BOUNCE_FACTOR : baseMaxQueenSpeed;
       if(q.boostFrames > 0){ q.boostFrames--; }
       const speed = Math.hypot(q.vx, q.vy);
       if(speed > maxQueenSpeed){
         q.vx = (q.vx / speed) * maxQueenSpeed;
         q.vy = (q.vy / speed) * maxQueenSpeed;
       }
 
       // Rebond sur les bords : au lieu de simplement s'arrêter au bord,
       // elle repart propulsée de l'autre côté avec un léger kick latéral —
       // sa nuée, attirée vers elle, suit le mouvement et éclate avec elle.
       let nqx = q.x + q.vx;
       let nqy = q.y + q.vy;
       if(nqx < 0){ nqx = -nqx; q.vx = Math.abs(q.vx) * BOUNCE_FACTOR; q.vy += (Math.random() - 0.5) * SCATTER_KICK * 0.6; q.boostFrames = BOOST_DURATION; }
       else if(nqx > width){ nqx = 2 * width - nqx; q.vx = -Math.abs(q.vx) * BOUNCE_FACTOR; q.vy += (Math.random() - 0.5) * SCATTER_KICK * 0.6; q.boostFrames = BOOST_DURATION; }
       if(nqy < headerHeight){ nqy = 2 * headerHeight - nqy; q.vy = Math.abs(q.vy) * BOUNCE_FACTOR; q.vx += (Math.random() - 0.5) * SCATTER_KICK * 0.6; q.boostFrames = BOOST_DURATION; }
       else if(nqy > height){ nqy = 2 * height - nqy; q.vy = -Math.abs(q.vy) * BOUNCE_FACTOR; q.vx += (Math.random() - 0.5) * SCATTER_KICK * 0.6; q.boostFrames = BOOST_DURATION; }
       if(nqy > beeCeilingY){ nqy = beeCeilingY; q.vy = -Math.abs(q.vy) * BOUNCE_FACTOR; q.vx += (Math.random() - 0.5) * SCATTER_KICK * 0.6; q.boostFrames = BOOST_DURATION; }
       q.x = nqx;
       q.y = nqy;
     }
 
     function step(p, grid){
       const queen = queens[p.queenIndex];
       const resting = queen.state === "resting";
       const docking = !!queen.dockTarget; // approche finale sur une vignette de nidification : cas à part, plus chaotique
       let disturbed = false;
 
       let aliVX = 0, aliVY = 0, aliN = 0;
       let sepX = 0, sepY = 0;
       let bumped = false;
 
       // Boucle inlinée et plafonnée à MAX_NEIGHBOR_CHECKS (sinon un essaim
       // resserré fait exploser le calcul). Rayon de collision élargi pendant
       // l'accrochage pour que les abeilles convergentes se percutent plutôt
       // que de glisser en douceur les unes sur les autres.
       const effSepRadius = docking ? DOCK_SEPARATION_RADIUS : SEPARATION_RADIUS;
       const gcx = Math.floor(p.x / NEIGHBOR_RADIUS);
       const gcy = Math.floor(p.y / NEIGHBOR_RADIUS);
       let checked = 0;
       outer:
       for(let dx = -1; dx <= 1; dx++){
         for(let dy = -1; dy <= 1; dy++){
           const cell = grid.get((gcx + dx) * 100000 + (gcy + dy));
           if(!cell) continue;
           for(let i = 0; i < cell.length; i++){
             if(checked >= MAX_NEIGHBOR_CHECKS){ break outer; }
             const other = cell[i];
             if(other === p) continue;
             checked++;
             const ndx = other.x - p.x, ndy = other.y - p.y;
             const dist = Math.hypot(ndx, ndy) || 0.001;
             if(dist < NEIGHBOR_RADIUS){
               aliVX += other.vx; aliVY += other.vy; aliN++;
             }
             if(dist < effSepRadius){
               sepX -= ndx / dist; sepY -= ndy / dist;
               if(docking){ bumped = true; }
             }
           }
         }
       }
 
       // Attraction vers la reine : faible en vol, pulsée par saccades au repos,
       // encore plus vive à l'accrochage (les abeilles se ruent vers la vignette).
       const restPulse = resting ? (1.4 + 1.1 * Math.max(0, Math.sin(frameCount * 0.045 + queen.pulsePhase))) : 1;
       const attraction = (docking ? DOCK_ATTRACTION : (resting ? 0.0075 : 0.0016)) * restPulse;
       const dxq = queen.x - p.x, dyq = queen.y - p.y;
       p.vx += dxq * attraction;
       p.vy += dyq * attraction;
 
       // Zigzag perpendiculaire à l'axe abeille→reine : casse la ligne droite en
       // trajectoire en "S", surtout marqué près d'une vignette (sinon les
       // abeilles "tombent" en ligne verticale au lieu de grouiller). N'a de sens
       // qu'en groupe : une abeille isolée (aliN faible) vole plus droit.
       const dockCrowdFactor = docking ? Math.min(1, aliN / 5) : 1;
       const distQ = Math.hypot(dxq, dyq) || 1;
       const perpX = -dyq / distQ, perpY = dxq / distQ;
       const zigzagPhase = frameCount * (docking ? DOCK_ZIGZAG_FREQ : (resting ? 0.09 : 0.15)) + p.zigzagSeed;
       const zigzagStrength = (docking ? DOCK_ZIGZAG_BOOST * dockCrowdFactor : (resting ? 0.55 : 1)) * ZIGZAG_AMOUNT;
       const zigzag = Math.sin(zigzagPhase) * zigzagStrength;
       p.vx += perpX * zigzag;
       p.vy += perpY * zigzag;
 
       // Alignement très léger : juste assez pour garder un semblant de nuée,
       // sans lisser le mouvement au point de ressembler à un banc de poissons.
       if(aliN > 0){
         p.vx += (aliVX / aliN - p.vx) * 0.012;
         p.vy += (aliVY / aliN - p.vy) * 0.012;
       }
       // Séparation : éviter de se superposer exactement — nettement plus
       // franche à l'approche d'une vignette, pour un vrai croisement/rebond
       // entre abeilles plutôt qu'un simple lissage de trajectoire.
       p.vx += sepX * (docking ? DOCK_BUMP_FORCE : 0.5);
       p.vy += sepY * (docking ? DOCK_BUMP_FORCE : 0.5);
       if(docking && bumped){
         // Petit coup de vitesse bref à l'impact : lecture visuelle d'un vrai
         // rebond entre deux abeilles qui se percutent, pas d'un glissement.
         p.boostFrames = Math.max(p.boostFrames, DOCK_BUMP_BOOST);
       }
 
       // Vol erratique et saccadé : frénétique en vol, toujours nerveux une fois
       // posée — encore plus imprévisible à l'approche d'une vignette, pour un
       // désordre individuel bien visible pendant que la reine visée avance
       // plus franchement vers son point d'accroche.
       const wanderJitter = docking ? DOCK_WANDER_JITTER : (resting ? 0.4 : 1.0);
       const wanderForce = docking ? DOCK_WANDER_FORCE : (resting ? 0.05 : 0.18);
       p.wanderAngle += (Math.random() - 0.5) * wanderJitter;
       p.vx += Math.cos(p.wanderAngle) * wanderForce;
       p.vy += Math.sin(p.wanderAngle) * wanderForce;
 
       // Fuite au passage de la souris : réaction immédiate et vive (même
       // mécanique de propulsion que les rebonds), pas juste une petite poussée.
       if(mouse.active){
         const dx = p.x - mouse.x, dy = p.y - mouse.y;
         const dist = Math.hypot(dx, dy) || 1;
         if(dist < FLEE_RADIUS){
           const force = (1 - dist / FLEE_RADIUS) * 1.9;
           p.vx += (dx / dist) * force;
           p.vy += (dy / dist) * force;
           p.boostFrames = Math.max(p.boostFrames, FLEE_BOOST_DURATION);
           disturbed = true;
         }
       }
 
       // Frottement + vitesse maximale (plus élevée en vol, pour l'effet frénétique)
       p.vx *= 0.95;
       p.vy *= 0.95;
       const baseMaxSpeed = resting ? 1.6 : 3.6;
       const maxSpeed = p.boostFrames > 0 ? baseMaxSpeed * BOUNCE_FACTOR : baseMaxSpeed;
       if(p.boostFrames > 0){ p.boostFrames--; }
       const speed = Math.hypot(p.vx, p.vy);
       if(speed > maxSpeed){
         p.vx = (p.vx / speed) * maxSpeed;
         p.vy = (p.vy / speed) * maxSpeed;
       }
 
       // Rebond sur les bords de l'écran : propulsée à l'opposé, avec en plus un
       // kick latéral aléatoire — chaque abeille rebondit un peu différemment,
       // ce qui éclate la grappe en plein vol plutôt que de la faire ricocher
       // comme un seul bloc.
       let nx = p.x + p.vx;
       let ny = p.y + p.vy;
       if(nx < 0){ nx = -nx; p.vx = Math.abs(p.vx) * BOUNCE_FACTOR; p.vy += (Math.random() - 0.5) * SCATTER_KICK; p.boostFrames = BOOST_DURATION; disturbed = true; }
       else if(nx > width){ nx = 2 * width - nx; p.vx = -Math.abs(p.vx) * BOUNCE_FACTOR; p.vy += (Math.random() - 0.5) * SCATTER_KICK; p.boostFrames = BOOST_DURATION; disturbed = true; }
       if(ny < headerHeight){ ny = 2 * headerHeight - ny; p.vy = Math.abs(p.vy) * BOUNCE_FACTOR; p.vx += (Math.random() - 0.5) * SCATTER_KICK; p.boostFrames = BOOST_DURATION; disturbed = true; }
       else if(ny > height){ ny = 2 * height - ny; p.vy = -Math.abs(p.vy) * BOUNCE_FACTOR; p.vx += (Math.random() - 0.5) * SCATTER_KICK; p.boostFrames = BOOST_DURATION; disturbed = true; }
       // Plafond bas strict : jamais plus bas que le titre "En attendant
       // l'intervention" (devient négatif une fois remonté hors écran,
       // ce qui fait aussi disparaître la nuée)
       if(ny > beeCeilingY){ ny = beeCeilingY; p.vy = -Math.abs(p.vy) * BOUNCE_FACTOR; p.vx += (Math.random() - 0.5) * SCATTER_KICK; p.boostFrames = BOOST_DURATION; disturbed = true; }
       p.x = nx;
       p.y = ny;
 
       // Changement de reine mère : vérifié seulement si l'abeille vient
       // d'être perturbée, ou de temps en temps sinon (évite de tout
       // revérifier à chaque image)
       if(disturbed || Math.random() < 0.05){
         for(let qi = 0; qi < queens.length; qi++){
           if(qi === p.queenIndex) continue;
           const other = queens[qi];
           const dist = Math.hypot(p.x - other.x, p.y - other.y);
           if(dist < CAPTURE_RADIUS){
             const chance = disturbed ? DISTURB_CAPTURE_CHANCE : CAPTURE_CHANCE;
             if(Math.random() < chance){ p.queenIndex = qi; }
           }
         }
       }
     }
 
     function renderFrame(withMotion){
       ctx.clearRect(0, 0, width, height);
       const grid = withMotion ? buildGrid(NEIGHBOR_RADIUS) : null;
       if(withMotion){
         frameCount++;
         queens.forEach((q) => { updateQueenState(q); stepQueen(q); });
         particles.forEach((p) => { step(p, grid); });
       }
 
       // Rendu groupé par couleur : un seul chemin + un seul fill() par
       // couleur, au lieu d'un appel par point. Les reines sont mêlées aux
       // ouvrières dans les mêmes lots : rien ne permet de les repérer.
       colorBuckets.forEach((list, color) => {
         ctx.beginPath();
         for(let i = 0; i < list.length; i++){
           const o = list[i];
           ctx.moveTo(o.x + o.r, o.y);
           ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
         }
         ctx.fillStyle = color;
         ctx.fill();
       });
     }
 
     // Garde-fou : sans ça, le changement d'allégeance aléatoire peut, avec le
     // temps, vider certaines reines au profit des autres. On vérifie
     // régulièrement qu'il reste au moins MIN_BEES_PER_QUEEN abeilles autour
     // de chacune, en en empruntant aux reines les plus peuplées si besoin.
     function rebalanceQueens(){
       const counts = queens.map(() => 0);
       particles.forEach((p) => { counts[p.queenIndex]++; });
 
       for(let qi = 0; qi < queens.length; qi++){
         while(counts[qi] < MIN_BEES_PER_QUEEN){
           let maxIdx = 0;
           for(let j = 1; j < counts.length; j++){ if(counts[j] > counts[maxIdx]){ maxIdx = j; } }
           if(maxIdx === qi || counts[maxIdx] <= MIN_BEES_PER_QUEEN) break;
           const donor = particles.find((p) => p.queenIndex === maxIdx);
           if(!donor) break;
           donor.queenIndex = qi;
           counts[maxIdx]--;
           counts[qi]++;
         }
       }
 
       // De temps en temps, une reine change de zone de repos habituelle (sinon
       // les essaims se reforment toujours aux mêmes endroits), avec un coup de
       // vent qui disperse sa nuée pour un vrai envol plutôt qu'un glissement.
       if(Math.random() < 0.5){
         const candidates = queens.filter((q) => !q.dockTarget);
         if(candidates.length){
           const q = candidates[Math.floor(Math.random() * candidates.length)];
           q.homeXFrac = 0.12 + Math.random() * 0.76;
           q.homeYFrac = 0.15 + Math.random() * 0.7;
           burstQueenAndSwarm(q);
         }
       }
     }
 
     // Disperse une reine et toute sa nuée d'un coup — utilisé au décollage
     // (fin de nidification) et lors d'un déménagement vers une nouvelle zone.
     function burstQueenAndSwarm(q){
       const qAngle = Math.random() * Math.PI * 2;
       q.vx += Math.cos(qAngle) * 1.1;
       q.vy += Math.sin(qAngle) * 1.1;
       q.boostFrames = BOOST_DURATION * 2;
       const qi = queens.indexOf(q);
       particles.forEach((p) => {
         if(p.queenIndex !== qi) return;
         const angle = Math.random() * Math.PI * 2;
         const force = 0.8 + Math.random() * 1.6;
         p.vx += Math.cos(angle) * force;
         p.vy += Math.sin(angle) * force;
         p.boostFrames = BOOST_DURATION * 2;
       });
     }
 
     function loop(){
       renderFrame(true);
       rafId = requestAnimationFrame(loop);
     }
 
     function start(){
       resize();
       initParticles();
       if(reduceMotion){
         renderFrame(false);
         return;
       }
       if(rafId){ cancelAnimationFrame(rafId); }
       loop();
       setInterval(rebalanceQueens, 4000);
     }
 
     let resizeTimer = null;
     window.addEventListener("resize", () => {
       clearTimeout(resizeTimer);
       resizeTimer = setTimeout(() => {
         resize();
         queens.forEach((q) => {
           q.x = Math.min(q.x, width);
           q.y = Math.max(headerHeight, Math.min(q.y, height));
         });
         particles.forEach((p) => {
           p.x = Math.min(p.x, width);
           p.y = Math.max(headerHeight, Math.min(p.y, height));
         });
       }, 150);
     });
 
     if(!reduceMotion){
       window.addEventListener("pointermove", (e) => {
         mouse.x = e.clientX;
         mouse.y = e.clientY;
         mouse.active = true;
       });
       window.addEventListener("pointerleave", () => { mouse.active = false; });
 
       // Le défilement de la page pousse l'essaim : il rebondit et se propulse
       // à l'opposé quand il touche le bord haut ou bas de l'écran.
       let lastScrollY = window.scrollY;
       window.addEventListener("scroll", () => {
         const scrollY = window.scrollY;
         const delta = scrollY - lastScrollY;
         lastScrollY = scrollY;
         const impulse = delta * SCROLL_IMPULSE;
         queens.forEach((q) => { q.vy += impulse; });
         particles.forEach((p) => { p.vy += impulse * (0.6 + Math.random() * 0.6); });
       }, { passive: true });
 
       document.addEventListener("visibilitychange", () => {
         if(document.hidden){
           if(rafId){ cancelAnimationFrame(rafId); rafId = null; }
         } else if(!rafId){
           loop();
         }
       });
     }
 
     // Section "nidification" visible : chaque reine (une par vignette) s'y
     // accroche. Relâchées dès que la carte des zones apparaît ou qu'on quitte l'illustration.
     const nestSection = document.querySelector("#nidification .nest-scene");
     const nestHotspots = document.querySelectorAll("#nidification .nest-hotspot");
     const zoneMapEl = document.getElementById("zone-leaflet-map");
 
     if(!reduceMotion && nestSection && nestHotspots.length && "IntersectionObserver" in window){
       let docked = false;
 
       function updateDockTargets(){
         nestHotspots.forEach((el, i) => {
           if(!queens[i]) return;
           const rect = el.getBoundingClientRect();
           queens[i].dockTarget = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
         });
       }
 
       function release(){
         docked = false;
         // Redécollage : chaque reine posée quitte sa vignette d'un coup, et
         // toute sa nuée éclate avec elle — pas une glissade, un vrai envol brusque.
         queens.forEach((q) => {
           if(q.dockTarget){ burstQueenAndSwarm(q); }
           q.dockTarget = null;
         });
       }
 
       const nestObserver = new IntersectionObserver((entries) => {
         entries.forEach((entry) => {
           if(entry.isIntersecting){ docked = true; }
           else { release(); }
         });
       }, { threshold: 0.5 });
       nestObserver.observe(nestSection);
 
       // Sécurité supplémentaire : dès que la carte des zones d'intervention
       // apparaît à l'écran, on relâche les reines même si l'observateur de
       // la nidification n'a pas encore réagi.
       if(zoneMapEl){
         const zoneObserver = new IntersectionObserver((entries) => {
           entries.forEach((entry) => { if(entry.isIntersecting){ release(); } });
         }, { threshold: 0.15 });
         zoneObserver.observe(zoneMapEl);
       }
 
       // Les vignettes bougent avec le défilement : la cible est recalculée
       // en continu tant que la section est visible.
       function trackDockTargets(){
         if(docked){ updateDockTargets(); }
         requestAnimationFrame(trackDockTargets);
       }
       trackDockTargets();
     }
 
     // Plafond bas de la nuée, recalculé en continu : jamais plus bas que le
     // HAUT de la section "consignes" (pas son titre, qui resterait visible
     // tout l'écran une fois snappée) — la nuée disparaît derrière l'en-tête
     // dès que cet écran est en place, pour toute la durée de la lecture.
     const ceilingSection = document.getElementById("consignes");
     if(ceilingSection){
       (function updateBeeCeiling(){
         beeCeilingY = ceilingSection.getBoundingClientRect().top - 10;
         requestAnimationFrame(updateBeeCeiling);
       })();
     }
 
     start();
   })();
 
   function generateRequestId(){
     return "SOS-" + Date.now().toString(36).toUpperCase();
   }
 
   // Redimensionne et compresse la photo côté navigateur avant envoi
   // (reste sous la limite Netlify de 8 Mo par envoi, et sous le quota gratuit de stockage)
   function compressImage(file, maxWidth = 1280, quality = 0.72){
     return new Promise((resolve, reject) => {
       if(!file){ resolve(null); return; }
       const reader = new FileReader();
       reader.onload = (e) => {
         const img = new Image();
         img.onload = () => {
           const scale = Math.min(1, maxWidth / img.width);
           const canvas = document.createElement("canvas");
           canvas.width = Math.round(img.width * scale);
           canvas.height = Math.round(img.height * scale);
           const ctx = canvas.getContext("2d");
           ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
           canvas.toBlob((blob) => {
             if(!blob){ reject(new Error("Compression échouée")); return; }
             const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
             resolve(new File([blob], newName, { type: "image/jpeg" }));
           }, "image/jpeg", quality);
         };
         img.onerror = reject;
         img.src = e.target.result;
       };
       reader.onerror = reject;
       reader.readAsDataURL(file);
     });
   }
 
   const form = document.getElementById("swarm-form");
   const statusEl = document.getElementById("form-status");
   const submitBtn = document.getElementById("submit-btn");
   const photoInput = document.getElementById("photo");
   const chatLog = document.getElementById("chat-log");
   const steps = Array.from(document.querySelectorAll(".chat-step"));
 
   /* ---------- Machine à états du chatbot ----------
      Les textes du bot sont recalculés à chaque appel (via t()) plutôt
      que figés dans un objet, pour toujours refléter la langue en
      cours au moment où chaque étape s'affiche. */
   function getStepBotText(stepNum){
     const keys = {1:"bot.step1",2:"bot.step2",3:"bot.step3",4:"bot.step4",5:"bot.step5",
       6:"bot.step6",7:"bot.step7",8:"bot.step8",9:"bot.step9",10:"bot.step10",11:"bot.step11"};
     return keys[stepNum] ? t(keys[stepNum]) : null;
   }

   let currentStep = 0;
   let editReturnStep = null;
 
   function addMessage(text, who){
     const div = document.createElement("div");
     div.className = "msg " + who;
     if(who === "bot"){
       div.innerHTML = '<svg class="bee-avatar" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
         + '<ellipse cx="12" cy="14" rx="6.5" ry="4.6" fill="#2B1D0F"/>'
         + '<path d="M6.2 14a5.8 5 0 0 0 11.6 0" fill="none" stroke="#F6EEDA" stroke-width="2.4"/>'
         + '<circle cx="12" cy="6.8" r="2.6" fill="#1A130A"/></svg><span></span>';
       div.querySelector("span").textContent = text;
     } else {
       div.textContent = text;
     }
     chatLog.appendChild(div);
     chatLog.scrollTop = chatLog.scrollHeight;
   }
 
   let lastProgressStep = 0;
   function updateProgress(n){
     lastProgressStep = n;
     const bar = document.getElementById("chat-progress-bar");
     const label = document.getElementById("chat-progress-label");
     if(!bar || !label) return;
     if(n <= 10){
       bar.style.width = (n / 10 * 100) + "%";
       label.textContent = t("progress.step").replace("{n}", n);
     } else {
       bar.style.width = "100%";
       label.textContent = t("progress.last");
     }
   }
   // Exposé pour que applyTranslations() puisse rafraîchir ce libellé
   // généré en JS si la langue change alors que la boîte est déjà ouverte.
   window.__updateProgressLabel = function(){
     if(lastProgressStep){ updateProgress(lastProgressStep); }
   };
 
   function goToStep(n){
     steps.forEach((s) => { s.hidden = Number(s.dataset.step) !== n; });
     currentStep = n;
     updateProgress(n);
     if(n === 11){ buildRecap(); }
     const activeStep = steps[n-1];
     const focusable = activeStep.querySelector("input:not([type=hidden]):not(.visually-hidden), textarea");
     if(focusable){ focusable.focus({ preventScroll: true }); }
   }
 
   function showTypingThenStep(stepNum){
     const typing = document.createElement("div");
     typing.className = "msg typing";
     typing.innerHTML = "<span></span><span></span><span></span>";
     chatLog.appendChild(typing);
     chatLog.scrollTop = chatLog.scrollHeight;
     setTimeout(() => {
       typing.remove();
       const text = getStepBotText(stepNum);
       if(text){ addMessage(text, "bot"); }
       goToStep(stepNum);
     }, 450);
   }
 
   function advance(userAnswerText){
     if(userAnswerText !== null){ addMessage(userAnswerText, "user"); }
     const next = editReturnStep !== null ? editReturnStep : currentStep + 1;
     editReturnStep = null;
     showTypingThenStep(next);
   }
 
   // Validation renforcée : HTML5 seul ne suffit pas (type="tel" n'impose aucun
   // format, type="email" accepte "nnm2@dd") pour des champs critiques au recontact.
   const FIELD_VALIDATORS = {
     nom: (v) => {
       if(v.trim().length < 2) return t("validator.nom.tooShort");
       if(!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(v)) return t("validator.nom.invalid");
       return "";
     },
     telephone: (v) => {
       const digits = v.replace(/\D/g, "");
       if(digits.length < 9) return t("validator.telephone.tooShort");
       if(digits.length > 15) return t("validator.telephone.tooLong");
       return "";
     },
     email: (v) => {
       if(!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(v.trim())) return t("validator.email.invalid");
       return "";
     },
     adresse: (v) => {
       if(v.trim().length < 3) return t("validator.adresse.tooShort");
       return "";
     },
     emplacement: (v) => {
       if(v.trim().length < 3) return t("validator.emplacement.tooShort");
       return "";
     }
   };
   Object.keys(FIELD_VALIDATORS).forEach((id) => {
     const el = document.getElementById(id);
     if(el){ el.addEventListener("input", () => el.setCustomValidity("")); }
   });

   // Étapes en texte libre, validées puis envoyées via le bouton "Continuer"
   document.querySelectorAll(".chat-step .btn-step").forEach((btn) => {
     btn.addEventListener("click", () => {
       const stepEl = btn.closest(".chat-step");
       const input = stepEl.querySelector("input:not([type=hidden]):not(.visually-hidden), textarea");
       if(input){
         const validator = FIELD_VALIDATORS[input.id];
         if(validator){ input.setCustomValidity(validator(input.value)); }
         if(input.hasAttribute("required") && !input.checkValidity()){
           input.reportValidity();
           return;
         }
       }
       let answer;
       if(!input){ answer = "—"; }
       else if(input.type === "file"){ answer = input.files[0] ? input.files[0].name : t("answer.noPhoto"); }
       else { answer = input.value.trim() || t("answer.nothingToAdd"); }
       advance(answer);
     });
   });

   // Étapes à choix rapide (commune, depuis). Le libellé affiché suit la langue,
   // mais la VALEUR enregistrée (envoyée à l'apiculteur) reste en français —
   // via data-value sur les boutons "depuis" (communes: noms propres, inutile).
   let selectedLabels = {};
   document.querySelectorAll(".choice-row[data-target]").forEach((row) => {
     const targetName = row.dataset.target;
     row.querySelectorAll(".choice-btn").forEach((btn) => {
       btn.addEventListener("click", () => {
         const displayText = btn.textContent.trim();
         const canonicalValue = btn.dataset.value || displayText;
         document.getElementById(targetName).value = canonicalValue;
         selectedLabels[targetName] = displayText;
         advance(displayText);
       });
     });
   });

   // Étape urgence (boutons liés à des radios) — même principe de
   // découplage affichage traduit / valeur canonique française.
   document.querySelectorAll(".choice-btn[data-radio]").forEach((btn) => {
     btn.addEventListener("click", () => {
       document.getElementById(btn.dataset.radio).checked = true;
       selectedLabels.urgence = btn.textContent.trim();
       advance(btn.textContent.trim());
     });
   });

   // Étapes facultatives avec "Passer cette étape"
   document.querySelectorAll(".btn-skip").forEach((btn) => {
     btn.addEventListener("click", () => {
       const field = btn.dataset.skip;
       if(field === "photo"){ photoInput.value = ""; advance(t("skip.noPhoto")); }
       else { document.getElementById(field).value = ""; advance(t("answer.nothingToAdd")); }
     });
   });

   function buildRecap(){
     const recap = document.getElementById("recap-card");
     const raw = Object.fromEntries(new FormData(form).entries());
     const rows = [
       [t("recap.label.nom"), raw.nom, 1],
       [t("recap.label.telephone"), raw.telephone, 2],
       [t("recap.label.email"), raw.email, 3],
       [t("recap.label.commune"), raw.commune, 4],
       [t("recap.label.adresse"), raw.adresse, 5],
       [t("recap.label.emplacement"), raw.emplacement, 6],
       [t("recap.label.depuis"), selectedLabels.depuis || raw.depuis, 7],
       [t("recap.label.urgence"), selectedLabels.urgence || raw.urgence, 8],
       [t("recap.label.photo"), photoInput.files[0] ? photoInput.files[0].name : t("recap.value.noPhoto"), 9],
       [t("recap.label.message"), raw.message || t("recap.value.noMessage"), 10]
     ];
     recap.innerHTML = rows.map(([label, value, step]) =>
       '<div class="recap-row"><span class="rlabel">' + label + '</span><span class="rvalue">'
       + (value || "—") + ' <button type="button" class="redit" data-jump="' + step + '">' + t("recap.edit") + '</button></span></div>'
     ).join("");
 
     recap.querySelectorAll(".redit").forEach((b) => {
       b.addEventListener("click", () => {
         editReturnStep = 11;
         showTypingThenStep(Number(b.dataset.jump));
       });
     });
   }
 
   // Démarrage de la conversation
   showTypingThenStep(1);
 
(function initFaqAccordion(){
  document.querySelectorAll(".faq-list").forEach((list) => {
    const items = list.querySelectorAll(".faq-item");
    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if(item.open){
          items.forEach((other) => { if(other !== item){ other.open = false; } });
        }
      });
    });
  });
})();

/* ---------- "Comment ça marche" : révélation progressive du gris vers la couleur ---------- */
(function initStepsReveal(){
  const steps = document.querySelector(".steps");
  if(!steps || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      steps.classList.toggle("is-active", entry.isIntersecting);
    });
  }, { threshold: 0.4 });

  observer.observe(steps);
})();

/* ---------- Rejouer le tracé du nid d'abeilles à chaque retour sur le hero ---------- */
(function initCombReplay(){
  const heroEl = document.querySelector(".hero");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!heroEl || !("IntersectionObserver" in window) || reduceMotion) return;

  function restartCombAnimation(){
    document.querySelectorAll(".comb .hex, .comb .dot").forEach((el) => {
      const clone = el.cloneNode(true);
      el.replaceWith(clone);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if(entry.isIntersecting){ restartCombAnimation(); }
    });
  }, { threshold: 0.4 });

  observer.observe(heroEl);
})();

/* ---------- Boîtes de dialogue flottantes : gestion commune ----------
   Plusieurs boîtes (signalement, à propos, confidentialité) partagent le
   même habillage et peuvent, dans de rares cas, être ouvertes l'une
   au-dessus de l'autre (ex. lien "Politique de confidentialité" cliqué
   depuis le formulaire de signalement). On ne retire le verrou de défilement
   du corps de page que lorsque plus aucune boîte n'est ouverte. ---------- */
const allFloatingModals = [];
function anyFloatingModalOpen(){
  return allFloatingModals.some((m) => !m.hidden);
}
function syncBodyScrollLock(){
  document.body.classList.toggle("modal-open", anyFloatingModalOpen());
}

/* ---------- Modale "Signaler un essaim" ---------- */
const reportModal = document.getElementById("report-modal");
const reportBackdrop = document.getElementById("report-backdrop");
const reportModalClose = document.getElementById("report-modal-close");
allFloatingModals.push(reportModal);

function openReportModal(){
  reportModal.hidden = false;
  reportBackdrop.hidden = false;
  syncBodyScrollLock();
}
function closeReportModal(){
  // Un envoi est en cours (chargement plein écran, sans croix ni carte
  // visible) : impossible de fermer tant qu'il n'est pas terminé.
  if(!document.getElementById("loading-overlay").hidden){ return; }

  reportModal.hidden = true;
  reportBackdrop.hidden = true;
  syncBodyScrollLock();

  const successScreen = document.getElementById("success-screen");
  if(!successScreen.hidden){
    reportModal.classList.remove("is-transition-state");
    successScreen.hidden = true;
    document.getElementById("submit-row").hidden = false;
    submitBtn.disabled = false;
    statusEl.textContent = "";
    statusEl.className = "form-status";
    chatLog.innerHTML = "";
    editReturnStep = null;
    showTypingThenStep(1);
  }
}

document.querySelectorAll(".open-report").forEach((btn) => {
  btn.addEventListener("click", openReportModal);
});
reportModalClose.addEventListener("click", closeReportModal);
reportBackdrop.addEventListener("click", closeReportModal);
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape" && !reportModal.hidden){ closeReportModal(); }
});

/* ---------- Modale "À propos de nous" (ouverte depuis le pied de page) ---------- */
const aboutModal = document.getElementById("about-modal");
const aboutBackdrop = document.getElementById("about-backdrop");
const aboutModalClose = document.getElementById("about-modal-close");

if(aboutModal && aboutBackdrop && aboutModalClose){
  allFloatingModals.push(aboutModal);

  function openAboutModal(){
    aboutModal.hidden = false;
    aboutBackdrop.hidden = false;
    syncBodyScrollLock();
  }
  function closeAboutModal(){
    aboutModal.hidden = true;
    aboutBackdrop.hidden = true;
    syncBodyScrollLock();
  }

  document.querySelectorAll(".open-about").forEach((btn) => {
    btn.addEventListener("click", openAboutModal);
  });
  aboutModalClose.addEventListener("click", closeAboutModal);
  aboutBackdrop.addEventListener("click", closeAboutModal);
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && !aboutModal.hidden){ closeAboutModal(); }
  });
}

/* ---------- Modale "Politique de confidentialité" (pied de page + formulaire) ---------- */
const privacyModal = document.getElementById("privacy-modal");
const privacyBackdrop = document.getElementById("privacy-backdrop");
const privacyModalClose = document.getElementById("privacy-modal-close");

if(privacyModal && privacyBackdrop && privacyModalClose){
  allFloatingModals.push(privacyModal);

  function openPrivacyModal(e){
    if(e){ e.preventDefault(); }
    privacyModal.hidden = false;
    privacyBackdrop.hidden = false;
    syncBodyScrollLock();
  }
  function closePrivacyModal(){
    privacyModal.hidden = true;
    privacyBackdrop.hidden = true;
    syncBodyScrollLock();
  }

  document.querySelectorAll(".open-privacy").forEach((btn) => {
    btn.addEventListener("click", openPrivacyModal);
  });
  privacyModalClose.addEventListener("click", closePrivacyModal);
  privacyBackdrop.addEventListener("click", closePrivacyModal);
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && !privacyModal.hidden){ closePrivacyModal(); }
  });
}

/* ---------- Bouton "Signaler un essaim" de l'en-tête (petit écran) :
   visible seulement quand celui du hero est hors champ, pour éviter
   d'avoir les deux affichés en même temps. ---------- */
(function initHeaderReportButton(){
  const headerBtn = document.querySelector(".mobile-report-fab");
  const heroBtn = document.querySelector(".hero .btn-primary.open-report");
  if(!headerBtn || !heroBtn || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      headerBtn.classList.toggle("visible", !entry.isIntersecting);
    });
  }, { threshold: 0, rootMargin: "-112px 0px 0px 0px" });
  observer.observe(heroBtn);
})();

/* ---------- Sélecteur de langue de l'en-tête ---------- */
(function initLangSwitch(){
  const trigger = document.getElementById("lang-trigger");
  const menu = document.getElementById("lang-menu");
  if(!trigger || !menu) return;

  function closeMenu(){
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }

  trigger.addEventListener("click", () => {
    const isOpen = !menu.hidden;
    menu.hidden = isOpen;
    trigger.setAttribute("aria-expanded", String(!isOpen));
  });

  menu.querySelectorAll(".lang-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      menu.querySelectorAll(".lang-option").forEach((o) => { o.classList.remove("active"); });
      opt.classList.add("active");
      trigger.querySelector(".lang-current").textContent = opt.dataset.lang.toUpperCase();
      closeMenu();
      applyTranslations(opt.dataset.lang);
    });
  });

  document.addEventListener("click", (e) => {
    if(!menu.hidden && !e.target.closest(".lang-switch")){ closeMenu(); }
  });
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && !menu.hidden){ closeMenu(); trigger.focus(); }
  });

  // Applique au chargement la langue mémorisée d'une visite précédente
  // (sinon le français reste la langue par défaut).
  const initialLang = getInitialLang();
  if(initialLang !== "fr"){
    const initialOpt = menu.querySelector('.lang-option[data-lang="' + initialLang + '"]');
    if(initialOpt){
      menu.querySelectorAll(".lang-option").forEach((o) => { o.classList.remove("active"); });
      initialOpt.classList.add("active");
      trigger.querySelector(".lang-current").textContent = initialLang.toUpperCase();
    }
  }
  applyTranslations(initialLang);
})();

form.addEventListener("submit", async function(e){
  e.preventDefault();
  // Revalidation complète à l'envoi : le formulaire peut être soumis autrement
  // qu'en cliquant "Continuer" à chaque étape (touche Entrée, retour arrière...).
  Object.entries(FIELD_VALIDATORS).forEach(([id, validator]) => {
    const el = document.getElementById(id);
    if(el){ el.setCustomValidity(validator(el.value)); }
  });
  if(!form.checkValidity()){
    // Le champ invalide peut être sur une étape masquée — reportValidity() n'y
    // affiche rien. On rouvre donc la bonne étape avant de signaler l'erreur.
    const invalidField = steps
      .map((s) => s.querySelector("input:invalid, textarea:invalid, select:invalid"))
      .find((el) => el);
    if(invalidField){
      const stepEl = invalidField.closest(".chat-step");
      goToStep(Number(stepEl.dataset.step));
      invalidField.reportValidity();
    } else {
      form.reportValidity();
    }
    return;
  }

  submitBtn.disabled = true;
  statusEl.textContent = "";
  statusEl.className = "form-status";
  // Pendant l'envoi : carte masquée (aucun moyen de quitter), chargement
  // flottant directement sur le fond assombri.
  reportModal.hidden = true;
  document.getElementById("loading-overlay").hidden = false;

  const raw = Object.fromEntries(new FormData(form).entries());
  delete raw.photo;
  delete raw["bot-field"];
  delete raw["form-name"];

  const requestId = generateRequestId();

  const photoFile = photoInput.files[0] || null;
  const hasPhoto = !!photoFile;

  try{
    let compressedPhoto = null;
    if(photoFile){
      try{ compressedPhoto = await compressImage(photoFile); }
      catch(err){ console.error("Compression impossible, envoi de l'originale", err); compressedPhoto = photoFile; }
    }

    // Envoi vers Netlify Forms : stocke la photo et déclenche l'email natif Netlify
    // (à configurer une fois dans le dashboard, voir instructions)
    const netlifyData = new FormData();
    netlifyData.append("form-name", "signalement-essaim");
    netlifyData.append("request_id", requestId);
    Object.entries(raw).forEach(([key, value]) => netlifyData.append(key, value));
    if(compressedPhoto){ netlifyData.append("photo", compressedPhoto, compressedPhoto.name); }

    // Email détaillé à l'apiculteur (+ copie dev), contient le téléphone du
    // client pour un appel direct. Pas de "to_email" : les destinataires sont
    // figés dans le template EmailJS (voir le commentaire en haut du fichier).
    const notifyParams = {
      request_id: requestId,
      client_nom: raw.nom,
      client_telephone: raw.telephone,
      client_email: raw.email,
      commune: raw.commune,
      adresse: raw.adresse,
      emplacement: raw.emplacement,
      depuis: raw.depuis,
      urgence: raw.urgence,
      message: raw.message || "—",
      // Photo NON jointe à l'email (limite EmailJS gratuit) : elle part via
      // Netlify Forms, d'où le lien direct vers son tableau de bord.
      a_photo: hasPhoto
        ? "Oui — à récupérer dans le tableau de bord Netlify : https://app.netlify.com/sites/sosabeillesguyane/forms (dossier " + requestId + ")."
        : "Aucune photo jointe."
    };

    // Confirmation immédiate au client, avec une copie complète du signalement
    const confirmParams = {
      to_email: raw.email,
      client_nom: raw.nom,
      client_telephone: raw.telephone,
      commune: raw.commune,
      adresse: raw.adresse,
      emplacement: raw.emplacement,
      depuis: raw.depuis,
      urgence: raw.urgence,
      message: raw.message || "Aucun",
      a_photo: hasPhoto ? "Oui" : "Aucune",
      request_id: requestId
    };

    await Promise.all([
      fetch("/", { method: "POST", body: netlifyData }),
      emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_NOTIFY, notifyParams),
      emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_CONFIRM, confirmParams)
    ]);

    // Fin du chargement : on masque l'animation flottante et on refait
    // apparaître la carte (avec sa transition d'entrée douce), cette
    // fois directement sur le message de remerciement.
    document.getElementById("loading-overlay").hidden = true;
    reportModal.hidden = false;
    // La demande est envoyée, l'objectif de la page est atteint : on
    // remplace tout le contenu de la boîte de dialogue (fil de discussion,
    // récapitulatif, barre de progression...) par le seul message de
    // remerciement, plutôt que de l'empiler avec ce qui précède.
    reportModal.classList.add("is-transition-state");
    document.getElementById("submit-row").hidden = true;
    const successScreen = document.getElementById("success-screen");
    successScreen.hidden = false;
    form.reset();
  }catch(err){
    console.error(err);
    // En cas d'échec, on masque l'animation de chargement, on refait
    // apparaître la carte, et on revient à l'écran normal (le
    // récapitulatif et le bouton "Envoyer" réapparaissent) pour
    // permettre de réessayer.
    document.getElementById("loading-overlay").hidden = true;
    reportModal.hidden = false;
    reportModal.classList.remove("is-transition-state");
    statusEl.textContent = t("error.send");
    statusEl.className = "form-status err";
    submitBtn.disabled = false;
  }
});