(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDemo);
  } else {
    initDemo();
  }

  function initDemo() {
    if (window.Vitra && Vitra.theme) {
      Vitra.theme.init({ defaultTheme: 'auto', persist: true });
    }

    initThemeSelector();
    initHeroSpotlight();
    initCinematicToggles();
    initGradientTextEditor();
    initThemeSwatches();
    initPopoverDemo();
    initStartingStyleDemo();
    initParticleControls();
    initMotionDemo();
    initTabs();
    initModalDemo();
    initNavigation();
    initShaderToggles();
    initProgressRing();

    updateParticleInfo();
  }

  // ==================== Hero Spotlight ====================
  function initHeroSpotlight() {
    const hero = document.querySelector('.demo-hero');
    if (!hero) return;

    hero.addEventListener('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      this.style.setProperty('--spotlight-x', x + '%');
      this.style.setProperty('--spotlight-y', y + '%');
    });
  }

  // ==================== Theme Selector ====================
  function initThemeSelector() {
    const themeDisplay = document.getElementById('current-theme-name');
    const themeItems = document.querySelectorAll('.theme-dropdown-item');

    if (!themeDisplay) return;

    const currentTheme = Vitra.theme.get();
    updateThemeDisplay(currentTheme);

    themeItems.forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        var selectedTheme = this.getAttribute('data-theme-value');
        var success = Vitra.theme.set(selectedTheme);

        if (success) {
          updateThemeDisplay(selectedTheme);
          updateActiveSwatch(selectedTheme);
          if (window.Vitra && Vitra.toast) {
            Vitra.toast.show('Theme changed to: ' + selectedTheme, { type: 'success' });
          }
        }

        var dropdown = this.closest('.vitra-dropdown');
        if (dropdown) dropdown.classList.remove('open');
      });
    });

    if (window.matchMedia) {
      var media = window.matchMedia('(prefers-color-scheme: dark)');
      if (media.addEventListener) {
        media.addEventListener('change', function () {
          if (Vitra.theme.get() === 'auto') {
            updateThemeDisplay('auto');
          }
        });
      }
    }
  }

  window.toggleTheme = function () {
    if (window.Vitra && Vitra.theme) {
      var nextTheme = Vitra.theme.toggle();
      updateThemeDisplay(nextTheme);
      updateActiveSwatch(nextTheme);
      if (Vitra.toast) {
        Vitra.toast.show('Toggled to: ' + nextTheme, { type: 'success' });
      }
    }
  };

  function updateThemeDisplay(themeName) {
    var themeDisplay = document.getElementById('current-theme-name');
    if (!themeDisplay) return;

    if (themeName === 'auto') {
      var effective = Vitra.theme.getEffective();
      themeDisplay.textContent = 'Auto (' + effective + ')';
    } else {
      themeDisplay.textContent = themeName.charAt(0).toUpperCase() + themeName.slice(1);
    }
  }

  // ==================== Theme Studio Swatches ====================
  function initThemeSwatches() {
    var swatches = document.querySelectorAll('#theme-swatches .theme-swatch');

    swatches.forEach(function (swatch) {
      swatch.addEventListener('click', function () {
        var theme = this.getAttribute('data-theme-value');
        Vitra.theme.set(theme);
        updateThemeDisplay(theme);
        updateActiveSwatch(theme);
      });
    });
  }

  function updateActiveSwatch(themeName) {
    var swatches = document.querySelectorAll('#theme-swatches .theme-swatch');
    swatches.forEach(function (s) {
      s.classList.remove('active');
      if (s.getAttribute('data-theme-value') === themeName) {
        s.classList.add('active');
      }
    });

    var nameEl = document.getElementById('theme-preview-name');
    if (nameEl) {
      nameEl.textContent = themeName.charAt(0).toUpperCase() + themeName.slice(1);
    }
  }

  // ==================== Cinematic Toggles ====================
  function initCinematicToggles() {
    // Gradient BG toggle
    var gradientToggle = document.getElementById('toggle-gradient-bg');
    var gradientPreview = document.getElementById('cinematic-gradient-bg');
    if (gradientToggle && gradientPreview) {
      var gradientBg = gradientPreview.querySelector('.vitra-gradient-bg');
      gradientToggle.addEventListener('change', function () {
        if (gradientBg) {
          gradientBg.style.display = this.checked ? '' : 'none';
        }
      });
    }

    // Glow Orbs toggle
    var glowToggle = document.getElementById('toggle-glow-orbs');
    var glowPreview = document.getElementById('cinematic-glow-orbs');
    if (glowToggle && glowPreview) {
      var orbs = glowPreview.querySelectorAll('.vitra-glow-orb');
      glowToggle.addEventListener('change', function () {
        orbs.forEach(function (orb) {
          orb.style.display = this.checked ? '' : 'none';
        }, this);
      });
    }

    // Border Glow toggle
    var borderToggle = document.getElementById('toggle-border-glow');
    var borderPreview = document.getElementById('cinematic-border-glow');
    if (borderToggle && borderPreview) {
      borderToggle.addEventListener('change', function () {
        borderPreview.classList.toggle('toggle-off', !this.checked);
        if (this.checked) {
          borderPreview.classList.add('vitra-border-glow');
        } else {
          borderPreview.classList.remove('vitra-border-glow');
        }
      });
    }
  }

  // ==================== Gradient Text Editor ====================
  function initGradientTextEditor() {
    var input = document.getElementById('gradient-text-input');
    var display = document.getElementById('gradient-text-display');
    if (input && display) {
      input.addEventListener('input', function () {
        display.textContent = this.value || ' ';
      });
    }
  }

  // ==================== Popover Demo ====================
  function initPopoverDemo() {
    var btn = document.getElementById('popover-demo-btn');
    var panel = document.getElementById('popover-demo');
    var close = document.getElementById('popover-demo-close');
    if (!btn || !panel) return;

    btn.addEventListener('click', function () {
      panel.classList.toggle('open');
      if (panel.classList.contains('open')) {
        panel.style.display = 'block';
      } else {
        panel.style.display = 'none';
      }
    });

    if (close) {
      close.addEventListener('click', function () {
        panel.classList.remove('open');
        panel.style.display = 'none';
      });
    }

    // Close on click outside
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== btn && panel.classList.contains('open')) {
        panel.classList.remove('open');
        panel.style.display = 'none';
      }
    });
  }

  // ==================== @starting-style Demo ====================
  function initStartingStyleDemo() {
    var toggle = document.getElementById('starting-style-toggle');
    var panel = document.getElementById('starting-style-panel');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', function () {
      if (panel.style.display === 'none' || !panel.style.display) {
        panel.style.display = 'block';
        requestAnimationFrame(function () {
          panel.classList.add('open');
        });
      } else {
        panel.classList.remove('open');
        panel.addEventListener('transitionend', function handler() {
          panel.style.display = 'none';
          panel.removeEventListener('transitionend', handler);
        });
      }
    });
  }

  // ==================== Particle Controls ====================
  function initParticleControls() {
    var countSlider = document.getElementById('particle-count');
    var countValue = document.getElementById('particle-count-value');
    var colorPicker = document.getElementById('particle-color');
    var colorText = document.getElementById('particle-color-text');
    var sizeSlider = document.getElementById('particle-size');
    var sizeValue = document.getElementById('particle-size-value');
    var speedSlider = document.getElementById('particle-speed');
    var speedValue = document.getElementById('particle-speed-value');
    var limitDisplay = document.getElementById('particle-limit');

    if (!countSlider) return;

    if (limitDisplay) {
      var limit = window.innerWidth <= 768 ? 15 : 40;
      limitDisplay.textContent = limit;
    }

    countSlider.addEventListener('input', function () {
      if (countValue) countValue.textContent = this.value;
    });

    if (colorPicker && colorText) {
      colorPicker.addEventListener('input', function () {
        colorText.value = this.value;
      });
      colorText.addEventListener('input', function () {
        if (this.value.match(/^#[0-9A-F]{6}$/i)) {
          colorPicker.value = this.value;
        }
      });
    }

    if (sizeSlider) {
      sizeSlider.addEventListener('input', function () {
        if (sizeValue) sizeValue.textContent = this.value;
      });
    }

    if (speedSlider) {
      speedSlider.addEventListener('input', function () {
        if (speedValue) speedValue.textContent = this.value;
      });
    }

    window.addEventListener('resize', function () {
      if (limitDisplay) {
        var newLimit = window.innerWidth <= 768 ? 15 : 40;
        limitDisplay.textContent = newLimit;
      }
      updateParticleInfo();
    });
  }

  window.spawnParticles = function () {
    var count = parseInt(document.getElementById('particle-count')?.value || '10', 10);
    var color = document.getElementById('particle-color')?.value || '#6c63ff';
    var size = parseInt(document.getElementById('particle-size')?.value || '4', 10);
    var speed = parseInt(document.getElementById('particle-speed')?.value || '3', 10);

    Vitra.particles.destroy();

    var spawned = Vitra.particles.spawn(count, {
      color: color,
      size: size,
      container: '#particle-demo-area'
    });

    if (spawned > 0) {
      if (window.Vitra && Vitra.toast) Vitra.toast.show('Spawned ' + spawned + ' particles', { type: 'success' });
    } else {
      if (window.Vitra && Vitra.toast) Vitra.toast.show('No particles spawned', { type: 'warning' });
    }

    updateParticleInfo();
  };

  window.destroyParticles = function () {
    var destroyed = Vitra.particles.destroy();
    if (window.Vitra && Vitra.toast) Vitra.toast.show('Destroyed ' + destroyed + ' particles', { type: 'info' });
    updateParticleInfo();
  };

  window.updateParticleInfo = function () {
    var infoDiv = document.getElementById('particle-info');
    if (!infoDiv || !Vitra.particles) return;

    var limits = Vitra.particles.limits();
    infoDiv.textContent = 'Active: ' + limits.active + ' | Available: ' + limits.available + ' | Max: ' + limits.max;
  };

  window.setParticleColor = function (colorVar) {
    var picker = document.getElementById('particle-color');
    var text = document.getElementById('particle-color-text');
    var rootStyle = getComputedStyle(document.documentElement);
    var resolved = rootStyle.getPropertyValue(colorVar.replace('var(', '').replace(')', '')).trim() || '#6c63ff';

    if (picker) picker.value = resolved;
    if (text) text.value = resolved;
  };

  window.spawnEmojiParticles = function (emoji) {
    var count = parseInt(document.getElementById('particle-count')?.value || '5', 10);
    Vitra.particles.destroy();

    var spawned = Vitra.particles.spawn(count, {
      emoji: emoji,
      size: 4,
      container: '#particle-demo-area'
    });

    if (spawned > 0 && window.Vitra && Vitra.toast) {
      Vitra.toast.show('Spawned ' + spawned + ' ' + emoji + ' particles', { type: 'success' });
    }

    updateParticleInfo();
  };

  // ==================== Motion Demo ====================
  function initMotionDemo() {
    var motionBtn = document.getElementById('test-reduced-motion');
    var resultDiv = document.getElementById('motion-preference-result');

    if (!motionBtn || !resultDiv) return;

    motionBtn.addEventListener('click', function () {
      var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

      resultDiv.innerHTML =
        '<strong>Motion Preference:</strong> ' + (prefersReducedMotion ? 'Reduced motion' : 'Full motion') + '<br>' +
        '<strong>Color Scheme:</strong> ' + (prefersDark ? 'Dark' : 'Light') + '<br>' +
        '<small>Change in OS settings: Settings \u2192 Accessibility \u2192 Display \u2192 Reduce Motion</small>';
    });

    if (Vitra.reveal) {
      Vitra.reveal.init({
        selector: '.vitra-reveal',
        threshold: 0.1,
        stagger: 100
      });
    }
  }

  // ==================== Tabs ====================
  function initTabs() {
    var tabsContainer = document.getElementById('demo-tabs');
    if (!tabsContainer) return;

    var tabButtons = tabsContainer.querySelectorAll('.vitra-tabs-tab');
    var tabPanels = tabsContainer.querySelectorAll('.vitra-tabs-panel');

    tabButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var targetTab = this.getAttribute('data-tab');

        tabButtons.forEach(function (btn) { btn.classList.remove('vitra-tabs-tab-active'); });
        this.classList.add('vitra-tabs-tab-active');

        tabPanels.forEach(function (panel) {
          panel.style.display = panel.id === targetTab ? 'block' : 'none';
        });
      });
    });
  }

  // ==================== Modal Demo ====================
  function initModalDemo() {
    var openButtons = document.querySelectorAll('[data-vitra-modal-open]');
    openButtons.forEach(function (button) {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        var targetId = this.getAttribute('data-vitra-modal-open');
        if (Vitra.modal) Vitra.modal.open(targetId);
      });
    });

    var closeButtons = document.querySelectorAll('[data-vitra-modal-close]');
    closeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        if (Vitra.modal) Vitra.modal.close();
      });
    });
  }

  // ==================== Mobile Navigation ====================
  function initNavigation() {
    var burger = document.querySelector('.vitra-burger');
    var drawer = document.querySelector('.vitra-drawer');
    var drawerClose = document.querySelector('.vitra-drawer-close');
    var drawerLinks = document.querySelectorAll('.vitra-drawer .vitra-navbar-link');
    var drawerOverlay = document.querySelector('.vitra-drawer-overlay');

    if (!burger || !drawer) return;

    function closeDrawer() {
      burger.classList.remove('active');
      drawer.classList.remove('open');
      if (drawerOverlay) drawerOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    burger.addEventListener('click', function () {
      var opening = !drawer.classList.contains('open');
      burger.classList.toggle('active');
      drawer.classList.toggle('open');
      if (drawerOverlay) drawerOverlay.classList.toggle('open');
      document.body.style.overflow = opening ? 'hidden' : '';
    });

    if (drawerClose) {
      drawerClose.addEventListener('click', closeDrawer);
    }

    drawerLinks.forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });

    // Close drawer on outside click
    document.addEventListener('click', function (e) {
      if (!drawer.classList.contains('open')) return;
      if (drawer.contains(e.target) || burger.contains(e.target)) return;
      closeDrawer();
    });

    // Close drawer on ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }

  // ==================== Shader Toggles ====================
  function initShaderToggles() {
    // Noise overlay toggle
    var noiseToggle = document.getElementById('toggle-noise-overlay');
    var noiseOverlay = document.querySelector('.vitra-noise-overlay');
    if (noiseToggle && !noiseOverlay) {
      noiseOverlay = document.createElement('div');
      noiseOverlay.className = 'vitra-noise-overlay';
      document.body.appendChild(noiseOverlay);
    }
    if (noiseToggle && noiseOverlay) {
      noiseToggle.addEventListener('change', function () {
        noiseOverlay.style.display = noiseToggle.checked ? '' : 'none';
        if (noiseToggle.checked) {
          noiseOverlay.style.setProperty('--vitra-noise-opacity', '0.15');
          setTimeout(function () {
            noiseOverlay.style.setProperty('--vitra-noise-opacity', '');
          }, 600);
        }
      });
    }

    // Shape morph toggle
    var morphToggle = document.getElementById('toggle-shape-morph');
    var morphEls = document.querySelectorAll('.vitra-shape-morph');
    if (morphToggle) {
      morphToggle.addEventListener('change', function () {
        morphEls.forEach(function (el) {
          el.style.animationPlayState = morphToggle.checked ? 'running' : 'paused';
          el.style.opacity = morphToggle.checked ? '1' : '0.3';
        });
      });
    }

    // Gradient rotate toggle
    var gradRotateToggle = document.getElementById('toggle-gradient-rotate');
    var gradRotateEls = document.querySelectorAll('.vitra-gradient-rotate');
    if (gradRotateToggle) {
      gradRotateToggle.addEventListener('change', function () {
        gradRotateEls.forEach(function (el) {
          el.classList.toggle('toggle-off', !gradRotateToggle.checked);
        });
      });
    }

    // Scroll reveal toggle
    var scrollToggle = document.getElementById('toggle-scroll-reveal');
    var scrollEls = document.querySelectorAll('.vitra-scroll-reveal, .vitra-scroll-reveal-left, .vitra-scroll-reveal-right, .vitra-scroll-reveal-scale');
    if (scrollToggle) {
      scrollToggle.addEventListener('change', function () {
        scrollEls.forEach(function (el) {
          el.style.animationPlayState = scrollToggle.checked ? 'running' : 'paused';
          el.style.opacity = scrollToggle.checked ? '' : '1';
          el.style.transform = scrollToggle.checked ? '' : 'none';
        });
      });
    }
  }

  // ==================== Progress Ring ====================
  function initProgressRing() {
    // Set initial values
    setProgressRing('progress-ring-1', 'progress-ring-label-1', 0);
    setProgressRing('progress-ring-2', 'progress-ring-label-2', 75);
  }

  function setProgressRing(ringId, labelId, value) {
    var ring = document.getElementById(ringId);
    var label = document.getElementById(labelId);
    if (!ring) return;
    ring.style.setProperty('--vitra-progress-ring-value', value + '%');
    if (label) label.textContent = Math.round(value) + '%';
  }

  window.animateProgressRing = function (ringId, labelId, from, to) {
    var ring = document.getElementById(ringId);
    var label = document.getElementById(labelId);
    if (!ring) return;

    setProgressRing(ringId, labelId, from);

    requestAnimationFrame(function () {
      ring.style.transition = '--vitra-progress-ring-value 1.2s var(--vitra-ease-out, cubic-bezier(0, 0, 0.2, 1))';
      setProgressRing(ringId, labelId, to);
      setTimeout(function () {
        ring.style.transition = '';
      }, 1300);
    });
  };
})();
