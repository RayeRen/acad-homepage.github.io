/* Homepage enhancements: smooth in-page nav, scroll-spy, reveal-on-scroll,
   back-to-top, dark mode toggle and project tag filter. No dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  var masthead = document.querySelector('.masthead');

  function headerOffset() {
    return (masthead ? masthead.offsetHeight : 0) + 16;
  }

  /* ---- Smooth in-page navigation (replaces the template's fixed -20px offset) ---- */
  window.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = decodeURIComponent(link.getAttribute('href').slice(1));
    var target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    e.stopPropagation(); // keep the old jQuery smoothScroll handler from also firing
    var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
    window.scrollTo({ top: id === 'about-me' ? 0 : top, behavior: 'smooth' });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }, true);

  /* ---- Scroll-spy: highlight the nav item of the section in view ---- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.masthead__menu-item a[href^="#"]'));
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  function updateSpy() {
    var pos = window.pageYOffset + headerOffset() + 40;
    var current = sections.length ? sections[0].id : null;
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top + window.pageYOffset <= pos) current = s.id;
    });
    if (window.innerHeight + window.pageYOffset >= document.body.scrollHeight - 4 && sections.length) {
      current = sections[sections.length - 1].id;
    }
    navLinks.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + current && !a.parentNode.classList.contains('masthead__menu-home-item');
      a.classList.toggle('is-active', on);
    });
  }

  /* ---- Back to top ---- */
  var toTop = document.querySelector('.back-to-top');
  if (toTop) {
    toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateSpy();
      if (toTop) toTop.classList.toggle('is-visible', window.pageYOffset > 600);
      if (masthead) masthead.classList.toggle('is-scrolled', window.pageYOffset > 8);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('reveal-ready');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  }

  /* ---- Dark mode toggle ---- */
  var toggle = document.querySelector('.theme-toggle');
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---- Project tag filter ---- */
  var filterBtns = document.querySelectorAll('.project-filter__btn');
  var cards = document.querySelectorAll('.project-card');
  Array.prototype.forEach.call(filterBtns, function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      Array.prototype.forEach.call(filterBtns, function (b) { b.classList.toggle('is-active', b === btn); });
      Array.prototype.forEach.call(cards, function (c) {
        var tags = (c.getAttribute('data-tags') || '').split(' ');
        var show = f === '*' || tags.indexOf(f) !== -1;
        c.classList.toggle('is-hidden', !show);
        if (show) c.classList.add('is-visible');
      });
    });
  });
})();
