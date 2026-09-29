/* =========================================================================
   Comportements historiques de la page d'accueil, repris tels quels du site
   statique (js/script.js) : onglets, carte de la zone, nuée d'abeilles,
   chatbot de signalement, FAQ, boîtes de dialogue.
   La page est désormais rendue par React (src/components/site/*) ; ce module
   branche ces comportements une seule fois, une fois la page affichée.
   Les textes passent par t() (src/i18n/runtime.js), partagé avec React.
   ========================================================================= */
import { t } from '../i18n/runtime.js';
import { submitReport } from '../lib/reports.js';

/* Mesure d'audience (Microsoft Clarity, via public/js/consent.js) : n'envoie RIEN
   tant que le visiteur n'a pas accepté. Seuls des noms d'étapes sont transmis,
   jamais le contenu du formulaire. */
function sosTrack(name){
  if(window.SOSConsent && typeof window.SOSConsent.track === "function"){ window.SOSConsent.track(name); }
}

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

let started = false;

/* Une partie décorative qui plante (carte, animation…) ne doit jamais
   empêcher le reste de la page — et surtout le formulaire — de fonctionner. */
function safeInit(fn){
  try{ fn(); }catch(err){ console.error("[S.O.S Abeilles] " + (fn.name || "init") + " :", err); }
}

export function initHome(){
  if(started) return;
  started = true;

  /* ---------- Onglets "En attendant l'intervention" ---------- */
  safeInit(function initInfoTabs(){
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
  });

  safeInit(function initZoneMap(){
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
  });

  /* =========================================================
  /* =========================================================
     Nuée interactive (hero) — points noir & or qui restent groupés
     autour de leur reine et se dispersent au passage de la souris.
     Rendue en <canvas> pour rester fluide à ce nombre de points ;
     respecte prefers-reduced-motion et se met en pause si l'onglet
     n'est pas visible.
     ========================================================= */
     safeInit(function initSwarm(){
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

         // Seuil bas (comme zoneObserver) + marge de proximité : l'accrochage doit
         // être systématique dès qu'une bonne part de la maison est visible, pas
         // seulement quand elle occupe la moitié de l'écran — un seuil à 0.5 se
         // faisait décrocher par de simples à-coups du scroll-snap, obligeant à
         // dépasser puis revenir pour ré-attirer les abeilles.
         const nestObserver = new IntersectionObserver((entries) => {
           entries.forEach((entry) => {
             if(entry.isIntersecting){ docked = true; }
             else { release(); }
           });
         }, { threshold: 0.15, rootMargin: "15% 0px" });
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
     });



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
       if(n > 1){ sosTrack("signalement_etape_" + n); }
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
       if(document.getElementById("geo-lat").value){ rows[4][1] = (raw.adresse || "") + "  📍"; }
       recap.innerHTML = rows.map(([label, value, step]) =>
         '<div class="recap-row"><span class="rlabel">' + escapeHtml(label) + '</span><span class="rvalue">'
         + escapeHtml(value || "—") + ' <button type="button" class="redit" data-jump="' + step + '">' + escapeHtml(t("recap.edit")) + '</button></span></div>'
       ).join("");

       recap.querySelectorAll(".redit").forEach((b) => {
         b.addEventListener("click", () => {
           editReturnStep = 11;
           showTypingThenStep(Number(b.dataset.jump));
         });
       });
     }


     /* ---------- Position GPS facultative (étape adresse) ----------
        Demandée seulement si l'habitant clique sur le bouton : aide
        l'apiculteur à trouver l'essaim sur sa carte. */
     (function initGeoButton(){
       const btn = document.getElementById("geo-btn");
       const status = document.getElementById("geo-status");
       if(!btn || !status) return;
       if(!("geolocation" in navigator)){ btn.hidden = true; return; }
       btn.addEventListener("click", () => {
         status.textContent = "…";
         status.className = "geo-status";
         navigator.geolocation.getCurrentPosition((pos) => {
           document.getElementById("geo-lat").value = pos.coords.latitude.toFixed(6);
           document.getElementById("geo-lng").value = pos.coords.longitude.toFixed(6);
           status.textContent = t("step5.geoOk");
           status.className = "geo-status ok";
         }, () => {
           status.textContent = t("step5.geoErr");
           status.className = "geo-status err";
         }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
       });
     })();

     // Démarrage de la conversation
     showTypingThenStep(1);

  safeInit(function initFaqAccordion(){
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
  });

  /* ---------- "Comment ça marche" : révélation progressive du gris vers la couleur ---------- */
  safeInit(function initStepsReveal(){
    const steps = document.querySelector(".steps");
    if(!steps || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        steps.classList.toggle("is-active", entry.isIntersecting);
      });
    }, { threshold: 0.4 });

    observer.observe(steps);
  });

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
    sosTrack("signalement_ouvert");
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
  safeInit(function initHeaderReportButton(){
    const headerBtn = document.querySelector(".mobile-report-fab");
    const heroBtn = document.querySelector(".hero .btn-primary.open-report");
    if(!headerBtn || !heroBtn || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        headerBtn.classList.toggle("visible", !entry.isIntersecting);
      });
    }, { threshold: 0, rootMargin: "-112px 0px 0px 0px" });
    observer.observe(heroBtn);
  });


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
    const honeypot = raw["bot-field"];
    delete raw.photo;
    delete raw["bot-field"];
    const photoFile = photoInput.files[0] || null;

    try{
      if(!honeypot){
        let compressedPhoto = null;
        if(photoFile){
          try{ compressedPhoto = await compressImage(photoFile); }
          catch(err){ console.error("Compression impossible, envoi de l'originale", err); compressedPhoto = photoFile; }
        }
        // Enregistrement dans la base (Supabase) + photo + emails (apiculteur et habitant)
        await submitReport(raw, compressedPhoto);
      }
      // (champ anti-robot rempli : on affiche le succès sans rien enregistrer)

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
      const geoStatus = document.getElementById("geo-status");
      if(geoStatus){ geoStatus.textContent = ""; geoStatus.className = "geo-status"; }
      sosTrack("signalement_envoye");
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
}
