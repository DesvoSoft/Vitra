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
    const selector = document.getElementById('theme-selector');
    const themeDisplay = document.getElementById('current-theme-name');

    if (!selector || !themeDisplay) return;

    // Set initial value based on current theme
    const currentTheme = Vitra.theme.get();
    selector.value = currentTheme;
    updateThemeDisplay(currentTheme);

    // Handle theme changes
    selector.addEventListener('change', function (e) {
      const selectedTheme = e.target.value;
      const success = Vitra.theme.set(selectedTheme);

      if (success) {
        updateThemeDisplay(selectedTheme);
        showNotification(`Theme changed to: ${selectedTheme}`);
      } else {
        showNotification(`Invalid theme: ${selectedTheme}`, 'error');
      }
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
    if (window.Vitra && Vitra.theme) {
      const nextTheme = Vitra.theme.toggle();
      
      // Update UI
      const selector = document.getElementById('theme-selector');
      if (selector) selector.value = nextTheme;
      
      updateThemeDisplay(nextTheme);
      showNotification(`Theme toggled to: ${nextTheme}`);
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
      showNotification(`Spawned ${spawned} particles`);
    } else {
      showNotification('No particles spawned (check limits or reduced motion)', 'warning');
    }

    updateParticleInfo();
  };

  window.destroyParticles = function () {
    const destroyed = Vitra.particles.destroy();
    showNotification(`Destroyed ${destroyed} particles`);
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
      showNotification(`Spawned ${spawned} ${emoji} particles`);
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

  // ==================== Utilities ====================
  function showNotification(message, type = 'success') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = 'vitra-glass';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: var(--vitra-radius-md, 8px);
      z-index: 1000;
      font-size: var(--vitra-font-size-sm, 0.875rem);
      animation: slideIn 0.3s ease;
      max-width: 300px;
    `;

    // Set background color based on type
    if (type === 'error') {
      notification.style.borderLeft = '4px solid var(--vitra-color-error, #ef4444)';
    } else if (type === 'warning') {
      notification.style.borderLeft = '4px solid var(--vitra-color-warning, #f59e0b)';
    } else {
      notification.style.borderLeft = '4px solid var(--vitra-color-success, #10b981)';
    }

    notification.textContent = message;

    // Add animation keyframes if not exists
    if (!document.getElementById('demo-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'demo-notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
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
