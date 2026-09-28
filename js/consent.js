/* =========================================================================
   S.O.S Abeilles Guyane — Consentement aux cookies (RGPD / CNIL)
   + mesure d'audience Microsoft Clarity
   -------------------------------------------------------------------------
   • RIEN n'est chargé tant que le visiteur n'a pas cliqué « Accepter ».
   • « Refuser » a exactement le même poids visuel que « Accepter » (CNIL).
   • Le choix (accord OU refus) est mémorisé 6 mois, comme le recommande
     la CNIL, puis redemandé. Augmenter CONSENT_VERSION force une nouvelle
     demande à tout le monde (à faire si vous ajoutez un outil de suivi).
   • Le visiteur peut changer d'avis à tout moment : « Gérer mes cookies »
     (pied de page + politique de confidentialité). Un retrait efface les
     cookies Clarity et recharge la page pour couper le script.
   • Les textes suivent la langue choisie sur le site (FR / EN / ES / PT / ZH).
   • Ne JAMAIS appeler clarity('identify', ...) avec un nom, un email ou un
     téléphone : Clarity doit rester sans donnée identifiante.
   ========================================================================= */
(function(){
  "use strict";

  /* 1) Collez ici l'identifiant du projet Clarity de CE site :
        clarity.microsoft.com → projet « S.O.S Abeilles Guyane » → Paramètres
        → Vue d'ensemble → ID de projet (une dizaine de lettres/chiffres).
        Tant que la valeur commence par "COLLEZ_", la bannière s'affiche
        quand même mais aucun outil n'est chargé. */
  var CLARITY_PROJECT_ID = "COLLEZ_VOTRE_ID_CLARITY";

  var STORAGE_KEY = "sosAbeillesConsent";
  var CONSENT_VERSION = 1;
  var DAYS_VALID = 180; /* 6 mois, pour l'accord comme pour le refus (CNIL) */

  var TXT = {
    fr: {
      title: "Votre vie privée, vos choix",
      desc: "Avec votre accord, nous mesurons la fréquentation du site à l'aide de cookies (outil de Microsoft) afin de l'améliorer. Certaines données sont traitées hors de l'Union européenne. Vous pouvez refuser ou changer d'avis à tout moment.",
      policy: "Politique de confidentialité",
      refuse: "Refuser", accept: "Accepter", customize: "Personnaliser",
      prefsTitle: "Personnaliser mes choix",
      essTitle: "Essentiels", essDesc: "Mémorisent vos choix (langue, cookies) sur cet appareil.", always: "Toujours actifs",
      anaTitle: "Mesure d'audience",
      anaDesc: "Nous aide à comprendre comment le site est utilisé pour l'améliorer. Outil : Microsoft Clarity ; données traitées notamment aux États-Unis.",
      refuseAll: "Tout refuser", save: "Enregistrer mes choix", back: "Retour",
      region: "Choix de confidentialité", manage: "Gérer mes cookies"
    },
    en: {
      title: "Your privacy, your choice",
      desc: "With your permission, we use cookies (a Microsoft tool) to measure site traffic and improve the site. Some data is processed outside the European Union. You can decline or change your mind at any time.",
      policy: "Privacy policy",
      refuse: "Decline", accept: "Accept", customize: "Customize",
      prefsTitle: "Customize my choices",
      essTitle: "Essential", essDesc: "Remember your choices (language, cookies) on this device.", always: "Always on",
      anaTitle: "Audience measurement",
      anaDesc: "Helps us understand how the site is used so we can improve it. Tool: Microsoft Clarity; data processed notably in the United States.",
      refuseAll: "Decline all", save: "Save my choices", back: "Back",
      region: "Privacy choices", manage: "Cookie settings"
    },
    es: {
      title: "Su privacidad, su elección",
      desc: "Con su permiso, medimos las visitas al sitio mediante cookies (herramienta de Microsoft) para mejorarlo. Algunos datos se tratan fuera de la Unión Europea. Puede rechazarlas o cambiar de opinión en cualquier momento.",
      policy: "Política de privacidad",
      refuse: "Rechazar", accept: "Aceptar", customize: "Personalizar",
      prefsTitle: "Personalizar mis opciones",
      essTitle: "Esenciales", essDesc: "Recuerdan sus opciones (idioma, cookies) en este dispositivo.", always: "Siempre activas",
      anaTitle: "Medición de audiencia",
      anaDesc: "Nos ayuda a entender cómo se usa el sitio para mejorarlo. Herramienta: Microsoft Clarity; datos tratados en particular en Estados Unidos.",
      refuseAll: "Rechazar todo", save: "Guardar mis opciones", back: "Volver",
      region: "Opciones de privacidad", manage: "Configuración de cookies"
    },
    pt: {
      title: "A sua privacidade, as suas escolhas",
      desc: "Com a sua autorização, medimos as visitas ao site com cookies (ferramenta da Microsoft) para o melhorar. Alguns dados são tratados fora da União Europeia. Pode recusar ou mudar de ideia a qualquer momento.",
      policy: "Política de privacidade",
      refuse: "Recusar", accept: "Aceitar", customize: "Personalizar",
      prefsTitle: "Personalizar as minhas escolhas",
      essTitle: "Essenciais", essDesc: "Guardam as suas escolhas (idioma, cookies) neste dispositivo.", always: "Sempre ativos",
      anaTitle: "Medição de audiência",
      anaDesc: "Ajuda-nos a perceber como o site é usado para o melhorar. Ferramenta: Microsoft Clarity; dados tratados nomeadamente nos Estados Unidos.",
      refuseAll: "Recusar tudo", save: "Guardar as minhas escolhas", back: "Voltar",
      region: "Escolhas de privacidade", manage: "Gerir cookies"
    },
    zh: {
      title: "您的隐私，由您选择",
      desc: "在您同意的情况下，我们使用 Cookie（微软提供的工具）统计网站访问量，以改进网站。部分数据会在欧盟以外处理。您可以拒绝，也可以随时改变主意。",
      policy: "隐私政策",
      refuse: "拒绝", accept: "接受", customize: "自定义",
      prefsTitle: "自定义我的选择",
      essTitle: "必要", essDesc: "在本设备上记住您的选择（语言、Cookie）。", always: "始终启用",
      anaTitle: "访问统计",
      anaDesc: "帮助我们了解网站的使用情况，以便改进。工具：Microsoft Clarity；数据主要在美国处理。",
      refuseAll: "全部拒绝", save: "保存我的选择", back: "返回",
      region: "隐私选项", manage: "Cookie 设置"
    }
  };

  function lang(){
    var l = (document.documentElement.getAttribute('lang') || 'fr').slice(0, 2).toLowerCase();
    return TXT[l] ? l : 'fr';
  }
  function T(){ return TXT[lang()]; }

  /* ---- mémorisation du choix (stockage local, essentiel) ---- */
  function readChoice(){
    try{
      var c = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
      if(!c || c.v !== CONSENT_VERSION || !c.date) return null;
      if(Date.now() - new Date(c.date).getTime() > DAYS_VALID * 864e5) return null;
      return c;
    }catch(e){ return null; }
  }
  function saveChoice(analytics){
    var c = { v: CONSENT_VERSION, analytics: !!analytics, date: new Date().toISOString() };
    try{ window.localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); }catch(e){}
    return c;
  }

  /* ---- Microsoft Clarity ---- */
  var clarityLoaded = false;
  function hasClarityId(){ return /^[a-z0-9]{6,16}$/i.test(CLARITY_PROJECT_ID); }

  function loadClarity(){
    if(clarityLoaded || !hasClarityId()) return;
    clarityLoaded = true;
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", CLARITY_PROJECT_ID);
    /* Signal de consentement exigé par Clarity pour les visiteurs de l'UE :
       mesure d'audience accordée, aucun usage publicitaire. */
    window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
    window.clarity('set', 'langue', lang());
  }

  function clearClarityCookies(){
    var host = location.hostname;
    var parts = host.split('.');
    var domains = ['', host, '.' + host];
    if(parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
    ['_clck', '_clsk'].forEach(function(name){
      domains.forEach(function(d){
        document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  function revokeClarity(){
    if(typeof window.clarity === 'function'){
      try{
        window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
        window.clarity('consent', false);
      }catch(e){}
    }
    clearClarityCookies();
  }

  /* Événements personnalisés (Clarity → Filtres → Événements personnalisés).
     Ignorés tant que le visiteur n'a pas accepté. */
  function track(name){
    if(current && current.analytics && clarityLoaded && typeof window.clarity === 'function'){
      try{ window.clarity('event', name); }catch(e){}
    }
  }

  /* ---- bannière ---- */
  var current = readChoice();
  var banner, mainView, prefsView, anaSwitch, lastFocus;

  function el(tag, attrs, children){
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function(k){
      if(k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function(c){ if(c) n.appendChild(c); });
    return n;
  }

  function policyLink(t){
    return el('p', { 'class': 'sosc-policy' }, [ el('a', { href: 'confidentialite.html', 'data-sosc-policy': '', text: t.policy }) ]);
  }

  function buildBanner(){
    if(banner) return;
    var t = T();
    anaSwitch = el('input', { type: 'checkbox', role: 'switch', id: 'sosc-analytics', 'class': 'sosc-switch' });

    mainView = el('div', { 'class': 'sosc-view' }, [
      el('h2', { 'class': 'sosc-title', text: t.title }),
      el('p', { 'class': 'sosc-desc', text: t.desc }),
      policyLink(t),
      el('div', { 'class': 'sosc-actions' }, [
        el('button', { type: 'button', 'class': 'sosc-btn', 'data-sosc': 'refuse', text: t.refuse }),
        el('button', { type: 'button', 'class': 'sosc-btn', 'data-sosc': 'accept', text: t.accept })
      ]),
      el('button', { type: 'button', 'class': 'sosc-link', 'data-sosc': 'customize', text: t.customize })
    ]);

    prefsView = el('div', { 'class': 'sosc-view', hidden: '' }, [
      el('h2', { 'class': 'sosc-title', id: 'sosc-prefs-title', tabindex: '-1', text: t.prefsTitle }),
      el('div', { 'class': 'sosc-row' }, [
        el('div', {}, [ el('h3', { text: t.essTitle }), el('p', { text: t.essDesc }) ]),
        el('span', { 'class': 'sosc-always', text: t.always })
      ]),
      el('div', { 'class': 'sosc-row' }, [
        el('div', {}, [
          el('h3', {}, [ el('label', { 'for': 'sosc-analytics', text: t.anaTitle }) ]),
          el('p', { id: 'sosc-ana-desc', text: t.anaDesc })
        ]),
        anaSwitch
      ]),
      policyLink(t),
      el('div', { 'class': 'sosc-actions' }, [
        el('button', { type: 'button', 'class': 'sosc-btn', 'data-sosc': 'refuse', text: t.refuseAll }),
        el('button', { type: 'button', 'class': 'sosc-btn', 'data-sosc': 'save', text: t.save })
      ]),
      el('button', { type: 'button', 'class': 'sosc-link', 'data-sosc': 'back', text: t.back })
    ]);
    anaSwitch.setAttribute('aria-describedby', 'sosc-ana-desc');

    banner = el('div', { 'class': 'sos-consent', role: 'region', 'aria-label': t.region, hidden: '' }, [
      el('div', { 'class': 'sosc-card' }, [ mainView, prefsView ])
    ]);

    banner.addEventListener('click', function(e){
      var btn = e.target.closest ? e.target.closest('[data-sosc]') : null;
      if(!btn) return;
      var action = btn.getAttribute('data-sosc');
      if(action === 'accept') applyChoice(true);
      else if(action === 'refuse') applyChoice(false);
      else if(action === 'save') applyChoice(anaSwitch.checked);
      else if(action === 'customize') showView('prefs');
      else if(action === 'back') showView('main');
    });
    banner.addEventListener('keydown', function(e){
      /* Échap referme seulement si un choix existe déjà (le silence ne vaut pas accord) */
      if(e.key === 'Escape' && current) hideBanner();
    });

    document.body.insertBefore(banner, document.body.firstChild);
  }

  function currentView(){ return (prefsView && !prefsView.hidden) ? 'prefs' : 'main'; }

  function showView(which){
    mainView.hidden = (which !== 'main');
    prefsView.hidden = (which !== 'prefs');
    if(which === 'prefs'){
      anaSwitch.checked = !!(current && current.analytics);
      var h = document.getElementById('sosc-prefs-title');
      if(h) h.focus();
    }
  }

  function showBanner(view, moveFocus){
    buildBanner();
    lastFocus = moveFocus ? document.activeElement : null;
    banner.hidden = false;
    showView(view || 'main');
    if(moveFocus && view !== 'prefs'){
      var first = banner.querySelector('[data-sosc]');
      if(first) first.focus();
    }
  }

  function hideBanner(){
    if(!banner) return;
    banner.hidden = true;
    if(lastFocus && lastFocus.focus){ try{ lastFocus.focus(); }catch(e){} }
    lastFocus = null;
  }

  function applyChoice(analytics){
    current = saveChoice(analytics);
    if(analytics){
      loadClarity();
      hideBanner();
      return;
    }
    revokeClarity();
    hideBanner();
    /* Clarity déjà chargé dans cette page : on recharge pour couper le script complètement */
    if(clarityLoaded) window.location.reload();
  }

  /* ---- changement de langue sur le site : on retraduit la bannière ---- */
  function relabel(){
    var t = T();
    Array.prototype.forEach.call(document.querySelectorAll('[data-consent-open]'), function(b){
      if(b.hasAttribute('data-consent-label')) b.textContent = t.manage;
    });
    if(banner){
      var wasVisible = !banner.hidden, view = currentView(), checked = anaSwitch.checked;
      banner.remove(); banner = null;
      buildBanner();
      if(wasVisible){ banner.hidden = false; showView(view); anaSwitch.checked = checked; }
    }
    if(clarityLoaded && typeof window.clarity === 'function'){ try{ window.clarity('set', 'langue', lang()); }catch(e){} }
  }

  /* ---- démarrage ---- */
  function init(){
    if(current && current.analytics){
      loadClarity();
    }else{
      clearClarityCookies(); /* nettoie d'éventuels restes d'un ancien consentement */
      if(!current) showBanner('main', false);
    }
    relabel();

    if('MutationObserver' in window){
      new MutationObserver(relabel).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }

    document.addEventListener('click', function(e){
      if(!e.target.closest) return;
      /* « Gérer mes cookies » : ferme d'abord la boîte de dialogue où il se trouve (politique) */
      var opener = e.target.closest('[data-consent-open]');
      if(opener){
        e.preventDefault();
        var dlg = opener.closest('[role="dialog"]');
        var closeBtn = dlg ? dlg.querySelector('.modal-close') : null;
        if(closeBtn) closeBtn.click();
        showBanner('prefs', true);
        return;
      }
      /* lien « Politique de confidentialité » de la bannière : ouvre la fenêtre du site */
      var pol = e.target.closest('[data-sosc-policy]');
      if(pol){
        var siteOpener = document.querySelector('.open-privacy');
        if(siteOpener && document.getElementById('privacy-modal')){ e.preventDefault(); siteOpener.click(); }
      }
    });

    /* clics utiles à mesurer : appels, emails */
    document.addEventListener('click', function(e){
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if(!a) return;
      var href = a.getAttribute('href') || '';
      if(/^tel:/i.test(href)) track('clic_telephone');
      else if(/^mailto:/i.test(href)) track('clic_email');
    }, true);
  }

  window.SOSConsent = {
    open: function(){ showBanner('prefs', true); },
    track: track,
    hasAnalyticsConsent: function(){ return !!(current && current.analytics); }
  };

  if(document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
