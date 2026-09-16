  /* =========================================================
     CONFIGURATION EMAILJS — à compléter avant mise en ligne
     Voir les instructions fournies séparément pour créer :
     - un compte sur emailjs.com
     - un service email relié à maracudja973@gmail.com
     - 3 templates : notification, confirmation, prise en charge
     ========================================================= */
  const EMAILJS_PUBLIC_KEY   = "VOTRE_PUBLIC_KEY";
  const EMAILJS_SERVICE_ID   = "VOTRE_SERVICE_ID";
  const TEMPLATE_NOTIFY      = "template_notification";   // envoyé à l'apiculteur
  const TEMPLATE_CONFIRM     = "template_confirmation";   // envoyé au client, immédiat
  const TEMPLATE_HANDOFF     = "template_prise_en_charge"; // envoyé au client, quand l'apiculteur confirme

  const BEEKEEPER_EMAIL = "maracudja973@gmail.com";

  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  /* =========================================================
     Carte de la zone d'intervention — vraie carte géographique
     (OpenStreetMap via Leaflet, gratuit, sans clé API).
     Coordonnées exactes des mairies ; le rayon de chaque cercle
     est calculé à partir de la superficie réelle de la commune
     (surface équivalente), pas de ses limites administratives.
     ========================================================= */
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

    // Clé gratuite à récupérer sur maptiler.com (inscription sans carte
    // bancaire, ~2 min). OpenStreetMap bloque désormais l'accès direct à
    // ses serveurs pour ce type de site (osm.wiki/Blocked), MapTiler est
    // la solution stable pour un usage réel une fois déployé.
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

    // Un seul rayon d'action global, recalculé pour englober les 6 communes
    // (centroïde + distance à la plus éloignée + marge), plutôt qu'un cercle
    // par ville.
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
     Nuée interactive (hero) — essaim de points noir & or qui
     cherchent à rester groupés (cohésion + alignement, comme un
     vrai essaim) et se dispersent au passage de la souris avant
     de se regrouper. Mouvement lissé par angle (pas de bruit
     indépendant par axe, pour éviter les saccades).
     Rendue en <canvas> plutôt qu'en CSS pour rester fluide avec
     un grand nombre de points, respecte prefers-reduced-motion
     et se met en pause quand l'onglet n'est pas visible.
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
    const FLEE_RADIUS = 85;
    const CRUISE_SPEED = 0.5;     // vitesse de croisière visée
    const BOUNCE_FACTOR = 1.35;   // rebond aux bords : vitesse amplifiée pour "propulser" à l'opposé
    const BOOST_DURATION = 14;    // nombre d'images pendant lesquelles la propulsion reste active
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
        r: 0.9 + Math.random() * 1.1,
        boostFrames: 0,
        queenIndex: queenIndex,
        color: randomColor()
      };
    }

    // Trois reines réparties dans des zones différentes de l'écran, chacune
    // avec son propre cycle vol/repos indépendant.
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
      // Dispersées largement autour de leur reine dès le départ ; la répartition
      // entre les trois reines est aléatoire, donc pas forcément égale.
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

      // Regroupées par couleur une bonne fois pour toutes : la couleur de
      // chaque point ne change jamais, donc ce regroupement reste valide.
      // Permet de dessiner tout un groupe en un seul appel fill() au lieu
      // de milliers d'appels individuels (essentiel pour rester fluide).
      colorBuckets = new Map();
      const addToBucket = (obj) => {
        if(!colorBuckets.has(obj.color)){ colorBuckets.set(obj.color, []); }
        colorBuckets.get(obj.color).push(obj);
      };
      particles.forEach(addToBucket);
      queens.forEach(addToBucket);
    }

    // Grille spatiale : évite de comparer chaque point à tous les autres
    // (essentiel à 3000 points pour rester fluide — O(n) plutôt que O(n²))
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

    // Alterne entre deux comportements : "flying" (la reine vole, sa nuée reste
    // dispersée et erratique) et "resting" (elle s'arrête, sa nuée se resserre
    // autour d'elle) — comme un essaim qui se pose puis repart. Chaque reine a
    // son propre minuteur, indépendant des deux autres.
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
      // Mode "accroché" : quand la section nidification est visible, chaque
      // reine se dirige vers sa vignette et s'y stabilise (état "resting"
      // forcé, pour que ses ouvrières se resserrent autour d'elle). Le reste
      // du comportement habituel (vol, rebonds...) est mis en pause.
      if(q.dockTarget){
        q.x += (q.dockTarget.x - q.x) * 0.07;
        q.y += (q.dockTarget.y - q.y) * 0.07;
        q.vx = 0; q.vy = 0;
        q.state = "resting";
        return;
      }

      if(q.state === "flying"){
        q.wanderAngle += (Math.random() - 0.5) * 0.22;
        q.vx += Math.cos(q.wanderAngle) * 0.02;
        q.vy += Math.sin(q.wanderAngle) * 0.02;
      } else {
        // Se pose : freine fortement jusqu'à l'arrêt
        q.vx *= 0.9;
        q.vy *= 0.9;
      }

      // Rappel doux vers sa zone d'origine : sans ça, les impulsions du
      // scroll et les rebonds successifs finissent, avec le temps, par
      // pousser les reines dans un coin ou hors de la zone visible.
      // Calculé sur l'espace de vol réellement disponible à l'écran
      // (entre l'en-tête et le plafond bas actuel), pas sur toute la page.
      const flyTop = headerHeight;
      const flyBottom = Math.min(height, beeCeilingY);
      if(flyBottom > flyTop){
        const homeX = width * q.homeXFrac;
        const homeY = flyTop + (flyBottom - flyTop) * q.homeYFrac;
        q.vx += (homeX - q.x) * 0.00025;
        q.vy += (homeY - q.y) * 0.00025;
      }

      // Répulsion douce entre reines : sans ça, rien n'empêche qu'avec le
      // temps elles finissent, par hasard, toutes regroupées au même endroit
      // (souvent un coin, où les rebonds sur deux bords se cumulent).
      const minQueenDist = Math.min(width, height) * 0.26;
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

      // Fuite légère : si la souris s'approche du cœur de l'essaim, il se déplace
      if(mouse.active){
        const dx = q.x - mouse.x, dy = q.y - mouse.y;
        const dist = Math.hypot(dx, dy) || 1;
        if(dist < FLEE_RADIUS){
          const force = (1 - dist / FLEE_RADIUS) * 0.4;
          q.vx += (dx / dist) * force;
          q.vy += (dy / dist) * force;
        }
      }

      q.vx *= 0.97;
      q.vy *= 0.97;
      const baseMaxQueenSpeed = q.state === "flying" ? 0.4 : 0.06;
      const maxQueenSpeed = q.boostFrames > 0 ? baseMaxQueenSpeed * BOUNCE_FACTOR : baseMaxQueenSpeed;
      if(q.boostFrames > 0){ q.boostFrames--; }
      const speed = Math.hypot(q.vx, q.vy);
      if(speed > maxQueenSpeed){
        q.vx = (q.vx / speed) * maxQueenSpeed;
        q.vy = (q.vy / speed) * maxQueenSpeed;
      }

      // Rebond sur les bords : au lieu de simplement s'arrêter au bord,
      // elle repart propulsée de l'autre côté, et reste plus rapide un instant
      let nqx = q.x + q.vx;
      let nqy = q.y + q.vy;
      if(nqx < 0){ nqx = -nqx; q.vx = Math.abs(q.vx) * BOUNCE_FACTOR; q.boostFrames = BOOST_DURATION; }
      else if(nqx > width){ nqx = 2 * width - nqx; q.vx = -Math.abs(q.vx) * BOUNCE_FACTOR; q.boostFrames = BOOST_DURATION; }
      if(nqy < headerHeight){ nqy = 2 * headerHeight - nqy; q.vy = Math.abs(q.vy) * BOUNCE_FACTOR; q.boostFrames = BOOST_DURATION; }
      else if(nqy > height){ nqy = 2 * height - nqy; q.vy = -Math.abs(q.vy) * BOUNCE_FACTOR; q.boostFrames = BOOST_DURATION; }
      if(nqy > beeCeilingY){ nqy = beeCeilingY; q.vy = -Math.abs(q.vy) * BOUNCE_FACTOR; q.boostFrames = BOOST_DURATION; }
      q.x = nqx;
      q.y = nqy;
    }

    function step(p, grid){
      let aliVX = 0, aliVY = 0, aliN = 0;
      let sepX = 0, sepY = 0;

      // Boucle de voisinage inlinée (pas de fonction de rappel) : à 3000
      // points, éviter l'indirection ici compte vraiment pour la fluidité.
      // Plafonnée à MAX_NEIGHBOR_CHECKS : sans ça, quand un essaim se resserre
      // (phase "posée"), des centaines de points se retrouvent dans les mêmes
      // cellules et le calcul explose. Un échantillon suffit très largement
      // pour une moyenne d'alignement/séparation.
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
            if(dist < SEPARATION_RADIUS){
              sepX -= ndx / dist; sepY -= ndy / dist;
            }
          }
        }
      }

      const queen = queens[p.queenIndex];
      const resting = queen.state === "resting";
      let disturbed = false;

      // Attraction vers sa reine : faible et lâche en vol (nuée étalée et
      // chaotique), forte dès qu'elle se pose (la nuée se resserre vite)
      const attraction = resting ? 0.0028 : 0.0011;
      const dxq = queen.x - p.x, dyq = queen.y - p.y;
      p.vx += dxq * attraction;
      p.vy += dyq * attraction;

      // Alignement léger : donne un mouvement d'ensemble, pas juste un nuage figé
      if(aliN > 0){
        p.vx += (aliVX / aliN - p.vx) * 0.02;
        p.vy += (aliVY / aliN - p.vy) * 0.02;
      }
      // Séparation : éviter de se superposer exactement
      p.vx += sepX * 0.5;
      p.vy += sepY * 0.5;

      // Vol erratique lissé : frénétique en vol, plus calme une fois posée
      const wanderJitter = resting ? 0.18 : 0.5;
      const wanderForce = resting ? 0.018 : 0.09;
      p.wanderAngle += (Math.random() - 0.5) * wanderJitter;
      p.vx += Math.cos(p.wanderAngle) * wanderForce;
      p.vy += Math.sin(p.wanderAngle) * wanderForce;

      // Fuite au passage de la souris (elle cherche quand même à se reposer ensuite)
      if(mouse.active){
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy) || 1;
        if(dist < FLEE_RADIUS){
          const force = (1 - dist / FLEE_RADIUS) * 1.1;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          disturbed = true;
        }
      }

      // Frottement + vitesse maximale (plus élevée en vol, pour l'effet frénétique)
      p.vx *= 0.95;
      p.vy *= 0.95;
      const baseMaxSpeed = resting ? 1.1 : 2.5;
      const maxSpeed = p.boostFrames > 0 ? baseMaxSpeed * BOUNCE_FACTOR : baseMaxSpeed;
      if(p.boostFrames > 0){ p.boostFrames--; }
      const speed = Math.hypot(p.vx, p.vy);
      if(speed > maxSpeed){
        p.vx = (p.vx / speed) * maxSpeed;
        p.vy = (p.vy / speed) * maxSpeed;
      }

      // Rebond sur les bords de l'écran : propulsée à l'opposé plutôt que stoppée,
      // et reste plus rapide un court instant (comme relancée)
      let nx = p.x + p.vx;
      let ny = p.y + p.vy;
      if(nx < 0){ nx = -nx; p.vx = Math.abs(p.vx) * BOUNCE_FACTOR; p.boostFrames = BOOST_DURATION; disturbed = true; }
      else if(nx > width){ nx = 2 * width - nx; p.vx = -Math.abs(p.vx) * BOUNCE_FACTOR; p.boostFrames = BOOST_DURATION; disturbed = true; }
      if(ny < headerHeight){ ny = 2 * headerHeight - ny; p.vy = Math.abs(p.vy) * BOUNCE_FACTOR; p.boostFrames = BOOST_DURATION; disturbed = true; }
      else if(ny > height){ ny = 2 * height - ny; p.vy = -Math.abs(p.vy) * BOUNCE_FACTOR; p.boostFrames = BOOST_DURATION; disturbed = true; }
      // Plafond bas strict : jamais plus bas que le titre "En attendant
      // l'intervention" (négatif une fois ce titre remonté hors écran,
      // ce qui fait disparaître la nuée du même coup)
      if(ny > beeCeilingY){ ny = beeCeilingY; p.vy = -Math.abs(p.vy) * BOUNCE_FACTOR; p.boostFrames = BOOST_DURATION; disturbed = true; }
      p.x = nx;
      p.y = ny;

      // Changement de reine mère : vérifié seulement si l'abeille vient d'être
      // perturbée, ou de temps en temps sinon (évite 9000 vérifications/image)
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
        queens.forEach((q) => { updateQueenState(q); stepQueen(q); });
        particles.forEach((p) => { step(p, grid); });
      }

      // Rendu groupé par couleur : un seul chemin + un seul fill() par couleur,
      // au lieu d'un appel par point. Essentiel pour rester fluide à 3000+ points.
      // Les reines sont mêlées aux ouvrières dans les mêmes lots : rien ne
      // permet de les repérer dans la masse.
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

    // Quand la section "nidification" est visible, chaque reine (les 5
    // correspondent exactement aux 5 vignettes) se dirige vers sa vignette
    // et s'y stabilise. Dès que la carte des zones d'intervention apparaît
    // à l'écran (ou qu'on quitte l'illustration), elles sont relâchées et
    // reprennent leur mouvement là où elles en étaient.
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
        queens.forEach((q) => { q.dockTarget = null; });
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

    // Plafond bas de la nuée : jamais plus bas que le titre "En attendant
    // l'intervention", recalculé en continu puisqu'il se déplace avec le
    // défilement. Une fois ce titre remonté au-dessus de l'écran, le plafond
    // devient négatif et la nuée entière se retrouve hors champ (invisible),
    // ce qui règle aussi le cas où elle ne devait plus du tout apparaître.
    const ceilingTitle = document.querySelector("#consignes h2");
    if(ceilingTitle){
      (function updateBeeCeiling(){
        beeCeilingY = ceilingTitle.getBoundingClientRect().top - 10;
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

  /* ---------- Machine à états du chatbot ---------- */
  const stepBotText = {
    1: "Bonjour 👋 Je vais vous poser quelques questions pour organiser la collecte de l'essaim. Comment vous appelez-vous ?",
    2: "Merci. Quel est votre numéro de téléphone ?",
    3: "Et votre adresse email ? Elle servira à vous envoyer la confirmation de prise en charge.",
    4: "Dans quelle commune se trouve l'essaim ?",
    5: "Quelle est l'adresse précise, ou un point de repère ?",
    6: "Où se trouve l'essaim exactement ?",
    7: "Depuis quand est-il là ?",
    8: "Comment évalueriez-vous l'urgence de la situation ?",
    9: "Avez-vous une photo de l'essaim ? Ça aide beaucoup l'apiculteur avant de se déplacer.",
    10: "Une dernière information à ajouter avant l'envoi ?",
    11: "Voici le récapitulatif de votre signalement. Vérifiez que tout est correct avant l'envoi."
  };

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

  function updateProgress(n){
    const bar = document.getElementById("chat-progress-bar");
    const label = document.getElementById("chat-progress-label");
    if(!bar || !label) return;
    if(n <= 10){
      bar.style.width = (n / 10 * 100) + "%";
      label.textContent = "Étape " + n + " sur 10";
    } else {
      bar.style.width = "100%";
      label.textContent = "Dernière étape — vérifiez et envoyez";
    }
  }

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
      if(stepBotText[stepNum]){ addMessage(stepBotText[stepNum], "bot"); }
      goToStep(stepNum);
    }, 450);
  }

  function advance(userAnswerText){
    if(userAnswerText !== null){ addMessage(userAnswerText, "user"); }
    const next = editReturnStep !== null ? editReturnStep : currentStep + 1;
    editReturnStep = null;
    showTypingThenStep(next);
  }

  // Étapes en texte libre, validées puis envoyées via le bouton "Continuer"
  document.querySelectorAll(".chat-step .btn-step").forEach((btn) => {
    btn.addEventListener("click", () => {
      const stepEl = btn.closest(".chat-step");
      const input = stepEl.querySelector("input:not([type=hidden]):not(.visually-hidden), textarea");
      if(input && input.hasAttribute("required") && !input.checkValidity()){
        input.reportValidity();
        return;
      }
      let answer;
      if(!input){ answer = "—"; }
      else if(input.type === "file"){ answer = input.files[0] ? input.files[0].name : "Aucune photo"; }
      else { answer = input.value.trim() || "Rien à ajouter"; }
      advance(answer);
    });
  });

  // Étapes à choix rapide (commune, depuis)
  document.querySelectorAll(".choice-row[data-target]").forEach((row) => {
    const targetName = row.dataset.target;
    row.querySelectorAll(".choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.getElementById(targetName).value = btn.textContent.trim();
        advance(btn.textContent.trim());
      });
    });
  });

  // Étape urgence (boutons liés à des radios)
  document.querySelectorAll(".choice-btn[data-radio]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById(btn.dataset.radio).checked = true;
      advance(btn.textContent.trim());
    });
  });

  // Étapes facultatives avec "Passer cette étape"
  document.querySelectorAll(".btn-skip").forEach((btn) => {
    btn.addEventListener("click", () => {
      const field = btn.dataset.skip;
      if(field === "photo"){ photoInput.value = ""; advance("Pas de photo"); }
      else { document.getElementById(field).value = ""; advance("Rien à ajouter"); }
    });
  });

  function buildRecap(){
    const recap = document.getElementById("recap-card");
    const raw = Object.fromEntries(new FormData(form).entries());
    const rows = [
      ["Nom", raw.nom, 1],
      ["Téléphone", raw.telephone, 2],
      ["Email", raw.email, 3],
      ["Commune", raw.commune, 4],
      ["Adresse", raw.adresse, 5],
      ["Emplacement", raw.emplacement, 6],
      ["Depuis quand", raw.depuis, 7],
      ["Urgence", raw.urgence, 8],
      ["Photo", photoInput.files[0] ? photoInput.files[0].name : "Aucune", 9],
      ["Message", raw.message || "Aucun", 10]
    ];
    recap.innerHTML = rows.map(([label, value, step]) =>
      '<div class="recap-row"><span class="rlabel">' + label + '</span><span class="rvalue">'
      + (value || "—") + ' <button type="button" class="redit" data-jump="' + step + '">Modifier</button></span></div>'
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

  /* ---------- Rejouer le tracé du nid d'abeilles à chaque retour sur le hero ---------- */
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

  /* ---------- Modale "Signaler un essaim" ---------- */
  const reportModal = document.getElementById("report-modal");
  const reportBackdrop = document.getElementById("report-backdrop");
  const reportModalClose = document.getElementById("report-modal-close");

  function openReportModal(){
    reportModal.hidden = false;
    reportBackdrop.hidden = false;
    document.body.classList.add("modal-open");
  }
  function closeReportModal(){
    reportModal.hidden = true;
    reportBackdrop.hidden = true;
    document.body.classList.remove("modal-open");

    const successScreen = document.getElementById("success-screen");
    if(!successScreen.hidden){
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
  document.getElementById("success-close-btn").addEventListener("click", closeReportModal);
  reportBackdrop.addEventListener("click", closeReportModal);
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && !reportModal.hidden){ closeReportModal(); }
  });

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

  form.addEventListener("submit", async function(e){
    e.preventDefault();
    if(!form.checkValidity()){
      form.reportValidity();
      return;
    }

    submitBtn.disabled = true;
    statusEl.innerHTML = "<span class=\"spinner\"></span>Envoi en cours...";
    statusEl.className = "form-status";

    const raw = Object.fromEntries(new FormData(form).entries());
    delete raw.photo;
    delete raw["bot-field"];
    delete raw["form-name"];

    const requestId = generateRequestId();
    const siteUrl = window.location.origin + window.location.pathname;
    const handoffLink = siteUrl + "?action=prise-en-charge"
      + "&id=" + encodeURIComponent(requestId)
      + "&nom=" + encodeURIComponent(raw.nom)
      + "&email=" + encodeURIComponent(raw.email)
      + "&telephone=" + encodeURIComponent(raw.telephone)
      + "&commune=" + encodeURIComponent(raw.commune);

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

      // Email détaillé à l'apiculteur, avec le lien de prise en charge
      const notifyParams = {
        request_id: requestId,
        to_email: BEEKEEPER_EMAIL,
        client_nom: raw.nom,
        client_telephone: raw.telephone,
        client_email: raw.email,
        commune: raw.commune,
        adresse: raw.adresse,
        emplacement: raw.emplacement,
        depuis: raw.depuis,
        urgence: raw.urgence,
        message: raw.message || "—",
        handoff_link: handoffLink,
        a_photo: hasPhoto
          ? "Oui — voir l'email séparé envoyé par Netlify Forms (dossier " + requestId + ") pour la photo jointe."
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

      document.getElementById("submit-row").hidden = true;
      const successScreen = document.getElementById("success-screen");
      successScreen.hidden = false;
      form.reset();
    }catch(err){
      console.error(err);
      statusEl.textContent = "Erreur d'envoi. Réessayez ou contactez-nous autrement.";
      statusEl.className = "form-status err";
      submitBtn.disabled = false;
    }
  });

  /* ---------- Panneau "prise en charge" (ouvert via le lien dans l'email apiculteur) ---------- */
  const params = new URLSearchParams(window.location.search);
  if(params.get("action") === "prise-en-charge"){
    const section = document.getElementById("handoff-section");
    section.classList.add("visible");
    document.getElementById("ho-nom").textContent = params.get("nom") || "—";
    document.getElementById("ho-commune").textContent = params.get("commune") || "—";
    document.getElementById("ho-telephone").textContent = params.get("telephone") || "—";
    section.scrollIntoView({ behavior: "smooth" });

    document.getElementById("handoff-btn").addEventListener("click", function(){
      const btn = this;
      const hoStatus = document.getElementById("handoff-status");
      btn.disabled = true;
      hoStatus.textContent = "Envoi en cours...";
      hoStatus.className = "form-status";

      emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_HANDOFF, {
        to_email: params.get("email"),
        client_nom: params.get("nom"),
        commune: params.get("commune"),
        request_id: params.get("id")
      }).then(() => {
        hoStatus.textContent = "Confirmation envoyée à la personne.";
        hoStatus.className = "form-status ok";
      }).catch((err) => {
        console.error(err);
        hoStatus.textContent = "Erreur d'envoi. Réessayez.";
        hoStatus.className = "form-status err";
        btn.disabled = false;
      });
    });
  }
