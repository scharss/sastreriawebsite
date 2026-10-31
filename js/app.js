/* ============================================================
   SastrerIA — interacciones
   Sin dependencias. Transiciones sobrias, foco gestionado.
   ============================================================ */
(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var toggle = document.getElementById('nav-toggle');
  var drawer = document.getElementById('drawer');
  var backdrop = document.getElementById('drawer-backdrop');
  var closeBtn = document.getElementById('drawer-close');
  var body = document.body;

  /* ── Header: borde al hacer scroll ──────────────────────── */
  var lastState = null;
  function onScroll() {
    var scrolled = window.scrollY > 8;
    if (scrolled !== lastState) {
      header.classList.toggle('is-scrolled', scrolled);
      lastState = scrolled;
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Menú móvil ─────────────────────────────────────────── */
  var drawerLinks = drawer.querySelectorAll('a, button');
  var firstFocusable = drawerLinks[0];
  var lastFocusable = drawerLinks[drawerLinks.length - 1];
  var isOpen = false;
  var returnFocusTo = null;

  function openDrawer() {
    if (isOpen) return;
    isOpen = true;
    returnFocusTo = document.activeElement;
    drawer.inert = false;
    drawer.setAttribute('aria-hidden', 'false');
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú de navegación');
    body.classList.add('menu-open');
    body.style.overflow = 'hidden';
    window.setTimeout(function () {
      if (firstFocusable) firstFocusable.focus();
    }, 60);
  }

  function closeDrawer() {
    if (!isOpen) return;
    isOpen = false;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú de navegación');
    body.classList.remove('menu-open');
    body.style.overflow = '';
    window.setTimeout(function () {
      if (!isOpen) drawer.inert = true;
    }, 200);
    if (returnFocusTo && typeof returnFocusTo.focus === 'function') {
      returnFocusTo.focus();
    }
  }

  toggle.addEventListener('click', function () {
    if (isOpen) closeDrawer();
    else openDrawer();
  });

  closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  /* Cerrar al elegir un destino */
  drawer.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeDrawer);
  });

  /* Escape y trampa de foco */
  document.addEventListener('keydown', function (event) {
    if (!isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeDrawer();
      return;
    }

    if (event.key === 'Tab') {
      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  });

  /* Al pasar a escritorio, el cajón deja de existir */
  var desktopQuery = window.matchMedia('(min-width: 981px)');
  var handleDesktop = function (event) {
    if (event.matches && isOpen) closeDrawer();
  };
  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', handleDesktop);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(handleDesktop);
  }

  /* ── Navegación activa según la sección visible ─────────── */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var sections = navLinks
    .map(function (link) {
      var hash = link.getAttribute('href');
      if (!hash || hash.charAt(0) !== '#') return null;
      var target = document.querySelector(hash);
      if (!target) return null;
      return { link: link, target: target };
    })
    .filter(Boolean);

  function setCurrent(link) {
    navLinks.forEach(function (item) {
      var active = item === link;
      item.classList.toggle('is-current', active);
      if (active) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var match = sections.find(function (item) {
            return item.target === entry.target;
          });
          if (match) setCurrent(match.link);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach(function (item) {
      observer.observe(item.target);
    });

    /* El tope de la página siempre es Inicio */
    var topLink = navLinks[0];
    window.addEventListener('scroll', function () {
      if (window.scrollY < 120) setCurrent(topLink);
    }, { passive: true });
  }

  /* ── Botón de WhatsApp: pausa el pulso al pasar el cursor ── */
  var waBtn = document.querySelector('.wa-btn');
  if (waBtn) {
    var waRing = waBtn.querySelector('.wa-btn__ring');

    var pausePulse = function () {
      waBtn.style.animationPlayState = 'paused';
      if (waRing) waRing.style.animationPlayState = 'paused';
    };
    var resumePulse = function () {
      waBtn.style.animationPlayState = 'running';
      if (waRing) waRing.style.animationPlayState = 'running';
    };

    waBtn.addEventListener('mouseenter', pausePulse);
    waBtn.addEventListener('mouseleave', resumePulse);
    waBtn.addEventListener('focus', pausePulse);
    waBtn.addEventListener('blur', resumePulse);
  }

  /* ── Año del pie ─────────────────────────────────────────── */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
