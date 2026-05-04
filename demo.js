/**
 * Vitra CSS Interactive Demo - JavaScript
 * Wires up all interactive controls to the Vitra JS API
 */

(function () {
  'use strict';

  // Wait for DOM and Vitra to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDemo);
  } else {
    initDemo();
  }

  function initDemo() {
    // Initialize Vitra theme from localStorage or system preference
    if (window.Vitra && Vitra.theme) {
      Vitra.theme.init({ defaultTheme: 'auto', persist: true });
    }

    // Initialize all demo features
    initThemeSelector();
    initParticleControls();
    initMotionDemo();
    initTabs();
    initModalDemo();
    initNavigation();

    console.log('[Vitra Demo] Interactive demo initialized');
  }

  // ==================== Theme Selector ====================
  function initThemeSelector() {
    const themeDisplay = document.getElementById('current-theme-name');
    const themeItems = document.querySelectorAll('.theme-dropdown-item');

    if (!themeDisplay) return;

    // Set initial value based on current theme
    const currentTheme = Vitra.theme.get();
    updateThemeDisplay(currentTheme);

    // Handle theme changes
    themeItems.forEach(item => {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        const selectedTheme = this.getAttribute('data-theme-value');
        const success = Vitra.theme.set(selectedTheme);

        if (success) {
          updateThemeDisplay(selectedTheme);
          if (window.Vitra && Vitra.toast) {
            Vitra.toast.show(`Theme changed to: ${selectedTheme}`, { type: 'success' });
          }
        } else {
          if (window.Vitra && Vitra.toast) {
            Vitra.toast.show(`Invalid theme: ${selectedTheme}`, { type: 'error' });
          }
        }
        
        // Close dropdown
        const dropdown = this.closest('.vitra-dropdown');
        if (dropdown) dropdown.classList.remove('open');
      });
    });

    // Also update when system theme changes (for 'auto' mode)
    if (window.matchMedia) {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      if (media.addEventListener) {
        media.addEventListener('change', function () {
          if (Vitra.theme.get() === 'auto') {
            updateThemeDisplay('auto');
          }
        });
      }
    }
  }

  // Global toggle function for the button in index.html
  window.toggleTheme = function() {
    console.log('[Vitra Demo] Toggle requested');
    if (window.Vitra && Vitra.theme) {
      const nextTheme = Vitra.theme.toggle();
      console.log('[Vitra Demo] Toggled to:', nextTheme);
      
      updateThemeDisplay(nextTheme);
      if (Vitra.toast) {
        Vitra.toast.show(`Theme toggled to: ${nextTheme}`, { type: 'success' });
      }
    } else {
      console.error('[Vitra Demo] Vitra theme API not available');
    }
  };

  function updateThemeDisplay(themeName) {
    const themeDisplay = document.getElementById('current-theme-name');
    if (!themeDisplay) return;

    if (themeName === 'auto') {
      const effective = Vitra.theme.getEffective();
      themeDisplay.textContent = `Auto (${effective})`;
    } else {
      themeDisplay.textContent = themeName.charAt(0).toUpperCase() + themeName.slice(1);
    }
  }

  // ==================== Particle Controls ====================
  function initParticleControls() {
    const countSlider = document.getElementById('particle-count');
    const countValue = document.getElementById('particle-count-value');
    const colorPicker = document.getElementById('particle-color');
    const colorText = document.getElementById('particle-color-text');
    const sizeSlider = document.getElementById('particle-size');
    const sizeValue = document.getElementById('particle-size-value');
    const speedSlider = document.getElementById('particle-speed');
    const speedValue = document.getElementById('particle-speed-value');
    const limitDisplay = document.getElementById('particle-limit');

    if (!countSlider) return;

    // Initialize displays
    updateParticleInfo();

    // Update limit display based on viewport
    if (limitDisplay) {
      const limit = window.innerWidth <= 768 ? 15 : 40;
      limitDisplay.textContent = limit;
    }

    // Count slider
    countSlider.addEventListener('input', function () {
      if (countValue) countValue.textContent = this.value;
    });

    // Color picker syncs with text input
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

    // Size slider
    if (sizeSlider) {
      sizeSlider.addEventListener('input', function () {
        if (sizeValue) sizeValue.textContent = this.value;
      });
    }

    // Speed slider
    if (speedSlider) {
      speedSlider.addEventListener('input', function () {
        if (speedValue) speedValue.textContent = this.value;
      });
    }

    // Update info on window resize (for mobile limit)
    window.addEventListener('resize', function () {
      if (limitDisplay) {
        const limit = window.innerWidth <= 768 ? 15 : 40;
        limitDisplay.textContent = limit;
      }
      updateParticleInfo();
    });
  }

  // Make these functions available globally for button onclick handlers
  window.spawnParticles = function () {
    const count = parseInt(document.getElementById('particle-count')?.value || '10', 10);
    const color = document.getElementById('particle-color')?.value || '#6c63ff';
    const size = parseInt(document.getElementById('particle-size')?.value || '4', 10);
    const speed = parseInt(document.getElementById('particle-speed')?.value || '3', 10);

    // Destroy existing particles first
    Vitra.particles.destroy();

    // Spawn new particles
    const spawned = Vitra.particles.spawn(count, {
      color: color,
      size: size,
      container: '#particle-demo-area'
    });

    if (spawned > 0) {
      if (window.Vitra && Vitra.toast) Vitra.toast.show(`Spawned ${spawned} particles`, { type: 'success' });
    } else {
      if (window.Vitra && Vitra.toast) Vitra.toast.show('No particles spawned (check limits or reduced motion)', { type: 'warning' });
    }

    updateParticleInfo();
  };

  window.destroyParticles = function () {
    const destroyed = Vitra.particles.destroy();
    if (window.Vitra && Vitra.toast) Vitra.toast.show(`Destroyed ${destroyed} particles`, { type: 'info' });
    updateParticleInfo();
  };

  window.updateParticleInfo = function () {
    const infoDiv = document.getElementById('particle-info');
    if (!infoDiv || !Vitra.particles) return;

    const limits = Vitra.particles.limits();
    infoDiv.textContent = `Active: ${limits.active} | Available: ${limits.available} | Max: ${limits.max}`;
  };

  window.setParticleColor = function (colorVar) {
    const colorPicker = document.getElementById('particle-color');
    const colorText = document.getElementById('particle-color-text');

    // Resolve CSS variable
    const rootStyle = getComputedStyle(document.documentElement);
    const resolvedColor = rootStyle.getPropertyValue(colorVar.replace('var(', '').replace(')', '')).trim() || '#6c63ff';

    if (colorPicker) colorPicker.value = resolvedColor;
    if (colorText) colorText.value = resolvedColor;
  };

  window.spawnEmojiParticles = function (emoji) {
    const count = parseInt(document.getElementById('particle-count')?.value || '5', 10);

    // Destroy existing particles first
    Vitra.particles.destroy();

    // Spawn emoji particles
    const spawned = Vitra.particles.spawn(count, {
      emoji: emoji,
      size: 4,
      container: '#particle-demo-area'
    });

    if (spawned > 0) {
      if (window.Vitra && Vitra.toast) Vitra.toast.show(`Spawned ${spawned} ${emoji} particles`, { type: 'success' });
    }

    updateParticleInfo();
  };

  // ==================== Motion Demo ====================
  function initMotionDemo() {
    const motionBtn = document.getElementById('test-reduced-motion');
    const resultDiv = document.getElementById('motion-preference-result');

    if (!motionBtn || !resultDiv) return;

    motionBtn.addEventListener('click', function () {
      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

      resultDiv.innerHTML = `
        <strong>Motion Preference:</strong> ${prefersReducedMotion ? 'Reduced motion' : 'Full motion'}<br>
        <strong>Color Scheme:</strong> ${prefersDark ? 'Dark' : 'Light'}<br>
        <small>Change in OS settings: Settings → Accessibility → Display → Reduce Motion</small>
      `;
    });

    // Initialize reveal on scroll
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
    const tabsContainer = document.getElementById('demo-tabs');
    if (!tabsContainer) return;

    const tabButtons = tabsContainer.querySelectorAll('.vitra-tabs-tab');
    const tabPanels = tabsContainer.querySelectorAll('.vitra-tabs-panel');

    tabButtons.forEach(button => {
      button.addEventListener('click', function () {
        const targetTab = this.getAttribute('data-tab');

        // Update active tab button
        tabButtons.forEach(btn => btn.classList.remove('vitra-tabs-tab-active'));
        this.classList.add('vitra-tabs-tab-active');

        // Show target panel, hide others
        tabPanels.forEach(panel => {
          if (panel.id === targetTab) {
            panel.style.display = 'block';
          } else {
            panel.style.display = 'none';
          }
        });
      });
    });
  }

  // ==================== Modal Demo ====================
  function initModalDemo() {
    // Modal open buttons
    const openButtons = document.querySelectorAll('[data-vitra-modal-open]');
    openButtons.forEach(button => {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('data-vitra-modal-open');
        if (Vitra.modal) {
          Vitra.modal.open(targetId);
        }
      });
    });

    // Modal close buttons (handled by Vitra JS, but adding fallback)
    const closeButtons = document.querySelectorAll('[data-vitra-modal-close]');
    closeButtons.forEach(button => {
      button.addEventListener('click', function () {
        if (Vitra.modal) {
          Vitra.modal.close();
        }
      });
    });
  }



  // ==================== Mobile Navigation ====================
  function initNavigation() {
    const burger = document.querySelector('.vitra-burger');
    const drawer = document.querySelector('.vitra-drawer');
    const drawerClose = document.querySelector('.vitra-drawer-close');
    const drawerLinks = document.querySelectorAll('.vitra-drawer .vitra-navbar-link');

    if (!burger || !drawer) return;

    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      drawer.classList.toggle('open');
    });

    if (drawerClose) {
      drawerClose.addEventListener('click', () => {
        burger.classList.remove('active');
        drawer.classList.remove('open');
      });
    }

    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        drawer.classList.remove('open');
      });
    });
  }
})();
