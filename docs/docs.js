/* Vitra Docs — theme dropdown, scrollspy, copy buttons, tabs, menu links.
   The page stays fully readable without this file or without Vitra; the
   parts that need the framework check for it first. */
(function () {
  'use strict';

  function vitra(mod) {
    return window.Vitra && window.Vitra[mod] ? window.Vitra[mod] : null;
  }

  function initDocs() {
    // These work without the framework script
    initScrollspy();
    initCopyButtons();
    initTabs();
    if (!window.Vitra) return;
    if (vitra('theme')) Vitra.theme.init({ defaultTheme: 'auto', persist: true });
    initThemeDropdown();
    initLiveExamples();
    initMenuLinks();
  }

  // Live triggers in the components section (modal / toast / particles),
  // one delegated listener.
  function initLiveExamples() {
    document.addEventListener('click', function (e) {
      var modalBtn = e.target.closest('[data-docs-modal-open]');
      if (modalBtn && vitra('modal')) Vitra.modal.open(modalBtn.getAttribute('data-docs-modal-open'));
      if (e.target.closest('[data-docs-toast]') && vitra('toast')) {
        Vitra.toast.show('Saved successfully!', { type: 'success', duration: 3000 });
      }
      if (e.target.closest('[data-docs-particles]') && vitra('particles')) {
        Vitra.particles.spawn(10, { direction: 'down' });
      }
    });
  }

  function themeLabel(name) {
    if (name === 'auto') return 'Auto (' + Vitra.theme.getEffective() + ')';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  // The dropdown module closes the menu on an item click and resets
  // aria-expanded; this only applies the theme and gives focus back to
  // the toggle, since the item that had it is now hidden.
  function initThemeDropdown() {
    var label = document.getElementById('docs-theme-name');
    if (!label || !vitra('theme')) return;
    label.textContent = themeLabel(Vitra.theme.get());
    document.addEventListener('click', function (e) {
      var item = e.target.closest('.docs-theme-item');
      if (!item) return;
      var value = item.getAttribute('data-theme-value');
      if (Vitra.theme.set(value)) label.textContent = themeLabel(value);
      var toggle = item.closest('.vitra-dropdown').querySelector('[data-vitra-dropdown-toggle]');
      if (toggle && item === document.activeElement) setTimeout(function () { toggle.focus(); }, 0);
    });
  }

  function initScrollspy() {
    if (!('IntersectionObserver' in window)) return;
    var links = {};
    document.querySelectorAll('.docs-nav-link').forEach(function (a) {
      links[a.getAttribute('href').slice(1)] = a;
    });
    var current = null;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (current) { current.classList.remove('active'); current.removeAttribute('aria-current'); }
        current = links[entry.target.id] || null;
        if (current) { current.classList.add('active'); current.setAttribute('aria-current', 'location'); }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    document.querySelectorAll('.docs-section').forEach(function (s) { observer.observe(s); });
  }

  function initCopyButtons() {
    document.querySelectorAll('.docs-code pre[data-copy]').forEach(function (pre) {
      var btn = document.createElement('button');
      btn.className = 'vitra-btn vitra-btn-glass vitra-btn-sm docs-copy-btn';
      btn.type = 'button';
      btn.textContent = 'Copy';
      btn.setAttribute('aria-label', 'Copy code');
      btn.addEventListener('click', function () {
        var text = pre.getAttribute('data-copy');
        var done = function () {
          if (vitra('toast')) Vitra.toast.show('Copied to clipboard', { type: 'success' });
          btn.textContent = 'Copied';
          setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () {
            btn.textContent = 'Failed';
            setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
          });
        }
      });
      pre.parentElement.insertBefore(btn, pre);
    });
  }

  // Tabs: the documented 1.14 markup (role="tab" + aria-controls, the
  // panel shown by .vitra-active). Arrow keys, Home and End move between
  // tabs; every tab stays in the Tab order, as the integration guide says.
  function initTabs() {
    document.querySelectorAll('[role="tablist"]').forEach(function (list) {
      var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
      function select(tab) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', String(on));
          var panel = document.getElementById(t.getAttribute('aria-controls'));
          if (panel) panel.classList.toggle('vitra-active', on);
        });
      }
      list.addEventListener('click', function (e) {
        var tab = e.target.closest('[role="tab"]');
        if (tab) select(tab);
      });
      list.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(document.activeElement);
        if (i < 0) return;
        var next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (next === undefined) return;
        e.preventDefault();
        var tab = tabs[(next + tabs.length) % tabs.length];
        tab.focus();
        select(tab);
      });
    });
  }

  // Vitra.drawer owns the mobile menu (toggle, overlay, Esc, focus trap,
  // inert while closed). An in-page link closes it and moves focus to the
  // section it points to.
  function initMenuLinks() {
    var menu = document.getElementById('docs-menu');
    if (!menu || !vitra('drawer')) return;
    menu.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var target = document.getElementById(link.getAttribute('href').slice(1));
      Vitra.drawer.close();
      if (target) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDocs);
  } else {
    initDocs();
  }
})();
