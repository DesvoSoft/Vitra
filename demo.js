(function () {
  'use strict';

  // demo.js is loaded with `defer` after vitra.min.js. Every use of the
  // framework goes through vitra(): if the CDN script did not load, the
  // page keeps its content and the controls that need Vitra do nothing.
  // There are no inline handlers: one delegated click listener reads the
  // data-* attributes of the buttons (CSP-friendly markup).

  function vitra(mod) {
    return window.Vitra && window.Vitra[mod] ? window.Vitra[mod] : null;
  }

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function toast(message, type, extra) {
    if (!vitra('toast')) return;
    var opts = extra || {};
    opts.type = type || 'info';
    Vitra.toast.show(message, opts);
  }

  function initDemo() {
    if (vitra('theme')) Vitra.theme.init({ defaultTheme: 'auto', persist: true });

    initReveal();
    initThemeControls();
    initToggles();
    initGradientTextEditor();
    initStartingStyleDemo();
    initParticleControls();
    initOffscreenPause();
    initTabs();
    initQuickStartCopy();
    initMenuLinks();
    initMotionCheck();
    initProgressRings();
    document.addEventListener('click', onClick);
  }

  // ==================== Reveal ====================
  // Sections fade in on scroll. Without the framework nothing would ever
  // reveal them, so they are shown at once.
  function initReveal() {
    if (vitra('reveal')) {
      Vitra.reveal.init({
        selector: '.vitra-reveal',
        threshold: 0,
        rootMargin: '0px 0px 10% 0px',
        stagger: 80
      });
      return;
    }
    document.querySelectorAll('.vitra-reveal').forEach(function (el) {
      el.classList.add('vitra-revealed');
    });
  }

  // ==================== Themes ====================
  // The navbar menu, the "What's new" chips and the Theme Studio swatches
  // all set the theme; syncTheme() keeps their labels and pressed states
  // in step.
  function themeLabel(name) {
    if (name === 'auto' && vitra('theme')) return 'Auto (' + Vitra.theme.getEffective() + ')';
    return cap(name);
  }

  function syncTheme(name) {
    var label = document.getElementById('current-theme-name');
    if (label) label.textContent = themeLabel(name);
    var preview = document.getElementById('theme-preview-name');
    if (preview) preview.textContent = themeLabel(name);
    document.querySelectorAll('.demo-bloom [data-theme-value], #theme-swatches [data-theme-value]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-theme-value') === name));
    });
  }

  function applyTheme(name, event) {
    if (!vitra('theme')) return false;
    if (!Vitra.theme.set(name, { transition: true, origin: event })) return false;
    syncTheme(name);
    return true;
  }

  function initThemeControls() {
    if (!vitra('theme')) return;
    syncTheme(Vitra.theme.get());
    if (window.matchMedia) {
      var media = window.matchMedia('(prefers-color-scheme: dark)');
      if (media.addEventListener) {
        media.addEventListener('change', function () {
          if (Vitra.theme.get() === 'auto') syncTheme('auto');
        });
      }
    }
  }

  // ==================== Delegated clicks ====================
  function onClick(e) {
    var t = e.target.closest('button, a');
    if (!t) return;

    var theme = t.getAttribute('data-theme-value');
    if (theme) {
      var fromMenu = t.classList.contains('theme-dropdown-item');
      if (applyTheme(theme, e) && fromMenu) toast('Theme changed to ' + themeLabel(theme), 'success');
      // The dropdown module closes the menu and resets aria-expanded; the
      // item that had focus is hidden now, so focus goes back to the toggle.
      if (fromMenu && t === document.activeElement) {
        var toggle = t.closest('.vitra-dropdown').querySelector('[data-vitra-dropdown-toggle]');
        setTimeout(function () { toggle.focus(); }, 0);
      }
      return;
    }

    if (t.hasAttribute('data-scenery-speed')) return setScenerySpeed(t);
    if (t.hasAttribute('data-scenery-replay')) return replaySceneryEntrance(parseFloat(t.getAttribute('data-scenery-replay')));
    if (t.hasAttribute('data-moon')) return setMoonPhase(t);
    if (t.hasAttribute('data-ring')) return animateRings(t);
    if (t.hasAttribute('data-emoji')) return spawnEmojiParticles(t.getAttribute('data-emoji'));
    if (t.hasAttribute('data-direction')) return setParticleDirection(t);
    if (t.hasAttribute('data-toast')) return showDemoToast(t.getAttribute('data-toast'));
    if (t.hasAttribute('data-pick')) return pick(t);

    var modal = t.getAttribute('data-modal-open');
    if (modal) {
      if (vitra('modal')) Vitra.modal.open(modal);
      return;
    }

    switch (t.getAttribute('data-action')) {
      case 'particles-spawn': return spawnParticles();
      case 'particles-clear': return destroyParticles();
      case 'particle-accent': return useAccentColor();
      case 'reveal-reset': if (vitra('reveal')) Vitra.reveal.reset(); return;
    }
  }

  // "Menus from the keyboard": say which item was chosen
  function pick(item) {
    var out = document.getElementById('kbd-dropdown-result');
    if (out) out.textContent = 'Chose: ' + item.getAttribute('data-pick');
    var toggle = item.closest('.vitra-dropdown').querySelector('[data-vitra-dropdown-toggle]');
    if (item === document.activeElement) setTimeout(function () { toggle.focus(); }, 0);
  }

  function showDemoToast(kind) {
    if (kind === 'sticky') return toast('This one stays until you close it', 'info', { duration: 0 });
    var durations = { error: 5000, warning: 7000 };
    toast(cap(kind) + ' toast', kind, durations[kind] ? { duration: durations[kind] } : {});
  }

  // ==================== Effect toggles ====================
  // Each switch toggles .demo-off on its preview; demo.css says what "off"
  // means for that effect. The film-grain switch drives the page overlay.
  function initToggles() {
    var noise = null;
    var noiseToggle = document.getElementById('toggle-noise-overlay');
    if (noiseToggle) {
      noise = document.createElement('div');
      noise.className = 'vitra-noise-overlay';
      noise.setAttribute('aria-hidden', 'true');
      document.body.appendChild(noise);
    }
    document.addEventListener('change', function (e) {
      var input = e.target;
      if (!input.classList || !input.classList.contains('vitra-toggle')) return;
      if (input === noiseToggle) {
        noise.classList.toggle('demo-off', !input.checked);
        return;
      }
      var target = input.getAttribute('data-target') && document.querySelector(input.getAttribute('data-target'));
      if (target) target.classList.toggle('demo-off', !input.checked);
    });
  }

  // ==================== Gradient Text Editor ====================
  function initGradientTextEditor() {
    var input = document.getElementById('gradient-text-input');
    var display = document.getElementById('gradient-text-display');
    if (!input || !display) return;
    input.addEventListener('input', function () {
      display.textContent = this.value || ' ';
    });
  }

  // ==================== @starting-style Demo ====================
  function initStartingStyleDemo() {
    var toggle = document.getElementById('starting-style-toggle');
    var panel = document.getElementById('starting-style-panel');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      var opening = panel.hidden;
      panel.hidden = !opening;
      toggle.setAttribute('aria-expanded', String(opening));
    });
  }

  // ==================== Particles ====================
  function el(id) {
    return document.getElementById(id);
  }

  function initParticleControls() {
    var pairs = [['particle-count', 'particle-count-value'], ['particle-size', 'particle-size-value'], ['particle-speed', 'particle-speed-value']];
    pairs.forEach(function (p) {
      var slider = el(p[0]);
      var out = el(p[1]);
      if (!slider || !out) return;
      slider.addEventListener('input', function () {
        out.textContent = slider.value;
        if (p[0] === 'particle-speed') applyParticleSpeed();
      });
    });

    var picker = el('particle-color');
    var text = el('particle-color-text');
    if (picker && text) {
      picker.addEventListener('input', function () { text.value = picker.value; });
      text.addEventListener('input', function () {
        if (/^#[0-9a-f]{6}$/i.test(text.value)) picker.value = text.value;
      });
    }

    showLimit();
    window.addEventListener('resize', function () {
      showLimit();
      updateParticleInfo();
    });
    updateParticleInfo();
  }

  function showLimit() {
    var limit = el('particle-limit');
    if (limit) limit.textContent = vitra('particles') ? Vitra.particles.limits().max : (window.innerWidth <= 768 ? 15 : 40);
  }

  // spawn() gives each particle a 3-5 s cycle; the speed slider rescales
  // that, keeping the spread so they do not move in lockstep.
  function applyParticleSpeed() {
    var speed = parseFloat((el('particle-speed') || {}).value || 3);
    document.querySelectorAll('#particle-demo-area .vitra-particle, #particle-demo-area .vitra-particles-emoji').forEach(function (p) {
      p.style.animationDuration = (speed * (1 + Math.random() * 0.6)).toFixed(2) + 's';
    });
  }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function afterSpawn(spawned, what) {
    applyParticleSpeed();
    if (spawned > 0) toast('Spawned ' + spawned + ' ' + what, 'success');
    else if (reducedMotion()) toast('Particles are off: your system asks for reduced motion', 'info');
    else toast('No particles spawned (limit reached)', 'warning');
    updateParticleInfo();
  }

  function spawnParticles() {
    if (!vitra('particles')) return;
    var group = el('particle-direction-group');
    var direction = group ? group.getAttribute('data-selected') : '';
    Vitra.particles.destroy();
    var spawned = Vitra.particles.spawn(parseInt(el('particle-count').value, 10), {
      color: el('particle-color').value,
      size: parseInt(el('particle-size').value, 10),
      direction: direction || null,
      container: '#particle-demo-area'
    });
    afterSpawn(spawned, 'particles');
  }

  function spawnEmojiParticles(emoji) {
    if (!vitra('particles')) return;
    Vitra.particles.destroy();
    var spawned = Vitra.particles.spawn(parseInt(el('particle-count').value, 10) || 5, {
      emoji: emoji,
      size: 4,
      container: '#particle-demo-area'
    });
    afterSpawn(spawned, emoji + ' particles');
  }

  function destroyParticles() {
    if (!vitra('particles')) return;
    var destroyed = Vitra.particles.destroy();
    toast('Removed ' + destroyed + ' particles', 'info');
    updateParticleInfo();
  }

  function updateParticleInfo() {
    var info = el('particle-info');
    if (!info || !vitra('particles')) return;
    var l = Vitra.particles.limits();
    info.textContent = 'Active: ' + l.active + ' | Available: ' + l.available + ' | Max: ' + l.max;
  }

  function setParticleDirection(btn) {
    var group = el('particle-direction-group');
    if (!group) return;
    group.setAttribute('data-selected', btn.getAttribute('data-direction'));
    pressOne(btn);
  }

  // The colour input only takes #rrggbb: resolve the accent through the
  // browser (computed rgb), then convert.
  function useAccentColor() {
    var probe = document.createElement('span');
    probe.className = 'demo-accent-probe';
    document.body.appendChild(probe);
    var rgb = getComputedStyle(probe).color.match(/\d+(\.\d+)?/g) || ['108', '99', '255'];
    probe.remove();
    var hex = '#' + rgb.slice(0, 3).map(function (v) {
      return ('0' + Math.round(parseFloat(v)).toString(16)).slice(-2);
    }).join('');
    el('particle-color').value = hex;
    el('particle-color-text').value = hex;
  }

  // In a group of buttons, mark one as the chosen one
  function pressOne(btn) {
    var group = btn.closest('[role="group"]') || btn.parentElement;
    group.querySelectorAll('.vitra-btn').forEach(function (b) {
      var on = b === btn;
      b.classList.toggle('vitra-btn-solid', on);
      b.classList.toggle('vitra-btn-ghost', !on);
      if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', String(on));
    });
  }

  // ==================== Scenery controls ====================
  function setScenerySpeed(btn) {
    var showcase = el('scenery-showcase');
    if (!showcase) return;
    showcase.style.setProperty('--vitra-scenery-speed', btn.getAttribute('data-scenery-speed'));
    pressOne(btn);
  }

  // Replay the showcase scene's entrance fade (it lives on the scene root)
  function replaySceneryEntrance(length) {
    var scene = document.querySelector('#scenery-showcase .vitra-scenery-inline');
    if (!scene) return;
    scene.style.setProperty('--vitra-scenery-intro', length);
    scene.style.animation = 'none';
    void scene.offsetWidth;
    scene.style.animation = '';
  }

  // Toggles every halo on the page (hero included) so the modifier is
  // demonstrated live wherever a scenery instance is visible.
  function setMoonPhase(btn) {
    var crescent = btn.getAttribute('data-moon') === 'crescent';
    document.querySelectorAll('.vitra-scenery-halo').forEach(function (halo) {
      halo.classList.toggle('vitra-scenery-halo-crescent', crescent);
    });
    pressOne(btn);
  }

  // ==================== Motion preference check ====================
  function initMotionCheck() {
    var btn = el('test-reduced-motion');
    var out = el('motion-preference-result');
    if (!btn || !out) return;
    btn.addEventListener('click', function () {
      var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      out.textContent = 'Motion preference: ' + (reducedMotion() ? 'reduced motion' : 'full motion') +
        '. Colour scheme: ' + (dark ? 'dark' : 'light') + '.';
    });
  }

  // ==================== Tabs ====================
  // The documented 1.14 markup (role="tab" + aria-controls, the panel shown
  // by .vitra-active). Arrow keys, Home and End move between tabs.
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

  // ==================== Progress Ring ====================
  // The ring's value is a registered custom property: a class transitions
  // it, and the label counts with it.
  function initProgressRings() {
    document.querySelectorAll('#shaders .vitra-progress-ring').forEach(function (ring) {
      ring.classList.add('demo-ring-animated');
    });
  }

  function setRing(n, value) {
    var ring = el('progress-ring-' + n);
    var label = el('progress-ring-label-' + n);
    if (!ring) return;
    ring.style.setProperty('--vitra-progress-ring-value', value + '%');
    ring.setAttribute('aria-valuenow', String(value));
    if (label) label.textContent = value + '%';
  }

  function animateRings(btn) {
    var to = parseInt(btn.getAttribute('data-ring-to'), 10);
    btn.getAttribute('data-ring').split(' ').forEach(function (n) { setRing(n, to); });
  }

  // ==================== Quick Start Copy ====================
  function initQuickStartCopy() {
    document.querySelectorAll('.demo-qs-copy').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pre = btn.closest('.demo-qs-code-wrap').querySelector('.demo-qs-code');
        var text = pre ? pre.getAttribute('data-copy') : '';
        if (!text || !navigator.clipboard) return;
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = 'Copied!';
        }, function () {
          btn.textContent = 'Failed';
        }).then(function () {
          setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
        });
      });
    });
  }

  // ==================== Mobile menu ====================
  // Vitra.drawer owns the menu: the burger toggle, the overlay, Esc, the
  // focus trap and inert while closed. An in-page link inside it also
  // closes it and hands focus to the section it points to, so a keyboard
  // user carries on from there instead of from the burger.
  function initMenuLinks() {
    var menu = document.getElementById('site-menu');
    if (!menu) return;
    menu.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link || !vitra('drawer')) return;
      var target = document.getElementById(link.getAttribute('href').slice(1));
      Vitra.drawer.close();
      if (target) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  }

  // Pause every CSS animation inside offscreen zones (scenery layers,
  // particles, gradients keep compositing forever otherwise). Transitions
  // are unaffected, so reveal-on-scroll keeps working.
  function initOffscreenPause() {
    if (!('IntersectionObserver' in window)) return;

    var zones = document.querySelectorAll('.demo-hero, .demo-section');
    if (!zones.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('demo-anim-paused', !entry.isIntersecting);
      });
    }, { rootMargin: '30% 0px 30% 0px' });

    zones.forEach(function (zone) { observer.observe(zone); });
  }

  // ==================== Hero Particles + BSOD Prank ====================
  var _heroClickCount = 0;
  var _bsodActive = false;

  var _btnLabels = [
    'Spawn Particles',
    'More! 🔥',
    'EVEN MORE!! 💥',
    'TOO MANY!!! ⚠️',
    'SYSTEM OVERLOAD ☠️'
  ];

  function _triggerBSOD() {
    if (_bsodActive) return;
    _bsodActive = true;

    var overlay = document.createElement('div');
    overlay.id = 'demo-bsod';
    overlay.innerHTML = [
      '<div class="bsod-inner">',
      '  <div class="bsod-emoji">:(</div>',
      '  <h1 class="bsod-title">Your PC ran into a problem</h1>',
      '  <p class="bsod-msg">Too many particles were spawned. We\'ll restart Vitra CSS for you.</p>',
      '  <p class="bsod-code">PARTICLE_OVERFLOW_EXCEPTION</p>',
      '  <div class="bsod-progress-wrap">',
      '    <div class="bsod-bar"></div>',
      '  </div>',
      '  <p class="bsod-pct" id="bsod-pct">0% complete</p>',
      '  <p class="bsod-footer">For more information visit <u>vitra.css/bsod</u></p>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);

    var pctEl = document.getElementById('bsod-pct');
    var barEl = overlay.querySelector('.bsod-bar');
    var pct = 0;
    var ticker = setInterval(function () {
      pct += Math.floor(Math.random() * 8) + 2;
      if (pct >= 100) { pct = 100; clearInterval(ticker); }
      pctEl.textContent = pct + '% complete';
      barEl.style.width = pct + '%';
    }, 80);

    setTimeout(function () {
      overlay.classList.add('bsod-fade-out');
      setTimeout(function () {
        overlay.remove();
        _bsodActive = false;
        _heroClickCount = 0;
      }, 600);
    }, 4000);
  }

  // Re-parents freshly spawned .vitra-particle nodes into the scenery's
  // depth stack so they fall behind the near ridge instead of on top of
  // the whole hero (Vitra.particles.spawn always appends to the
  // container element itself, with no z-index/insertion-point option).
  function _sinkParticlesIntoScenery(hero) {
    var scenery = hero.querySelector('.vitra-scenery-inline');
    var nearRidge = hero.querySelector('.vitra-scenery-ridge-near');
    if (!scenery || !nearRidge) return;

    var particles = hero.querySelectorAll(':scope > .vitra-particle');
    particles.forEach(function (p) {
      // spawn() places directional particles at top: -20%..0% (above the
      // container) so they can fall/fade in from off-screen against a
      // full-viewport spawn; .demo-hero has overflow: hidden, which clips
      // that entire band and reads as "particles don't show up". Remap
      // into the visible band so the fall plays out over the ridges.
      if (p.hasAttribute('data-direction')) {
        p.style.top = (Math.random() * 35) + '%';
      }
      scenery.insertBefore(p, nearRidge);
    });
  }

  // Falling particles are the hero's default look: fire once on load so
  // visitors see the depth effect without needing to click a button.
  function initHeroParticles() {
    var hero = document.querySelector('.demo-hero');
    if (!hero) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    window.spawnHeroParticles();
  }

  window.spawnHeroParticles = function () {
    var hero = document.querySelector('.demo-hero');
    if (!hero) return;

    _heroClickCount++;
    var counts = [12, 18, 35, 60, 90];
    var count = counts[Math.min(_heroClickCount - 1, counts.length - 1)];

    Vitra.particles.destroy();
    Vitra.particles.spawn(count, { container: '.demo-hero', direction: 'down', size: 7 });
    hero.querySelectorAll(':scope > .vitra-particle[data-direction]').forEach(function (p) {
      p.setAttribute('data-glow', 'sm');
    });
    _sinkParticlesIntoScenery(hero);

    if (_heroClickCount >= 5) {
      setTimeout(_triggerBSOD, 400);
    }
  };

  window.spawnHeroParticlesClassic = function () {
    var hero = document.querySelector('.demo-hero');
    if (!hero) return;

    Vitra.particles.destroy();
    Vitra.particles.spawn(18, { container: '.demo-hero' });
    _sinkParticlesIntoScenery(hero);
  };


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDemo);
  } else {
    initDemo();
  }
})();
