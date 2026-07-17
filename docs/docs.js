/* Vitra Docs — theme dropdown, scrollspy, copy buttons, tabs, mobile drawer.
   Page stays fully readable without this file; everything here is enhancement. */
(function () {
  'use strict';

  function initDocs() {
    if (!window.Vitra) {
      console.warn('[Vitra Docs] Vitra failed to load; interactive features disabled.');
      return;
    }
    Vitra.theme.init({ defaultTheme: 'auto', persist: true });
    initThemeDropdown();
    initScrollspy();
    initCopyButtons();
    initTabs();
    initLiveExamples();
    initMobileNav();
  }

  // Wire the components section's live triggers (modal / toast / particles).
  function initLiveExamples() {
    document.querySelectorAll('[data-docs-modal-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (Vitra.modal) Vitra.modal.open(this.getAttribute('data-docs-modal-open'));
      });
    });
    document.querySelectorAll('[data-docs-toast]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (Vitra.toast) Vitra.toast.show('Saved successfully!', { type: 'success', duration: 3000 });
      });
    });
    document.querySelectorAll('[data-docs-particles]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (Vitra.particles) Vitra.particles.spawn(10, { direction: 'down' });
      });
    });
  }

  function themeLabel(name) {
    if (name === 'auto') return 'Auto (' + Vitra.theme.getEffective() + ')';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  function initThemeDropdown() {
    var label = document.getElementById('docs-theme-name');
    if (!label) return;
    label.textContent = themeLabel(Vitra.theme.get());
    document.querySelectorAll('.docs-theme-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var value = this.getAttribute('data-theme-value');
        if (Vitra.theme.set(value)) {
          label.textContent = themeLabel(value);
          var dd = this.closest('.vitra-dropdown');
          if (dd) dd.classList.remove('open');
        }
      });
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
        if (current) current.classList.remove('active');
        current = links[entry.target.id] || null;
        if (current) current.classList.add('active');
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
      btn.addEventListener('click', function () {
        var text = pre.getAttribute('data-copy');
        var done = function () {
          if (Vitra.toast) Vitra.toast.show('Copied to clipboard', { type: 'success' });
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () {
            console.warn('[Vitra Docs] Clipboard write failed.');
          });
        } else {
          var ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand('copy');
            done();
          } catch (e) {
            console.warn('[Vitra Docs] Copy unsupported in this browser.');
          }
          document.body.removeChild(ta);
        }
      });
      pre.parentElement.appendChild(btn);
    });
  }

  function initTabs() {
    document.querySelectorAll('.vitra-tabs').forEach(function (tabs) {
      var buttons = tabs.querySelectorAll('.vitra-tabs-tab');
      var panels = tabs.querySelectorAll('.vitra-tabs-panel');
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var target = this.getAttribute('data-tab');
          buttons.forEach(function (b) { b.classList.remove('vitra-tabs-tab-active'); });
          this.classList.add('vitra-tabs-tab-active');
          panels.forEach(function (p) {
            p.style.display = p.id === target ? '' : 'none';
          });
        });
      });
    });
  }

  function initMobileNav() {
    var burger = document.querySelector('.docs-burger');
    var sidebar = document.getElementById('docs-sidebar');
    if (!burger || !sidebar) return;
    burger.addEventListener('click', function () {
      var open = sidebar.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    sidebar.addEventListener('click', function (e) {
      if (e.target.classList.contains('docs-nav-link')) {
        sidebar.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDocs);
  } else {
    initDocs();
  }
})();
