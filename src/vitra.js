/**
 * Vitra CSS Framework - JavaScript Modules
 * Phase 1: Tokens & Themes - Plan 02
 *
 * Optional JS for enhanced interactivity
 * Works with data-theme attribute on <html> element
 */

const Vitra = (() => {
  'use strict';

  // Storage key for localStorage persistence
  const STORAGE_KEY = 'vitra-theme';

  // Valid theme names
  const VALID_THEMES = [
    'default',
    'light',
    'light-dark',
    'light-soft',
    'dark',
    'dark-light',
    'dark-deep',
    'pastel',
    'pastel-dark',
    'pastel-light',
    'neon',
    'neon-dark',
    'neon-light',
    'earth',
    'earth-dark',
    'earth-light',
    'mono',
    'mono-dark',
    'mono-light',
    'midnight',
    'midnight-dark',
    'midnight-light',
    'auto'
  ];

  // Cache for prefers-color-scheme media query
  let _prefersDarkMedia = null;
  let _prefersLightMedia = null;

  /**
   * Theme Module
   * Handles theme toggling, auto-detection, and persistence
   */
  const theme = {

    /**
     * Get the current theme from DOM
     * @returns {string} Current theme name or 'default'
     */
    get() {
      const html = document.documentElement;
      return html.dataset.theme || 'default';
    },

    /**
     * Set the theme on the document element
     * @param {string} themeName - Theme name to apply
     * @returns {boolean} Success status
     */
    set(themeName) {
      if (!VALID_THEMES.includes(themeName)) {
        console.warn(`[Vitra Theme] Invalid theme: "${themeName}". Valid themes: ${VALID_THEMES.join(', ')}`);
        return false;
      }

      const html = document.documentElement;
      html.dataset.theme = themeName;

      // Persist to localStorage if available
      if (theme._isLocalStorageAvailable()) {
        try {
          localStorage.setItem(STORAGE_KEY, themeName);
        } catch (e) {
          // localStorage may be full or disabled
          console.warn('[Vitra Theme] Could not save theme to localStorage:', e.message);
        }
      }

      return true;
    },

    /**
     * Toggle between two themes (useful for light/dark switches)
     * @param {string} themeA - First theme
     * @param {string} themeB - Second theme
     * @returns {string} The new active theme
     */
    toggle(themeA = 'light', themeB = 'dark') {
      const current = this.get();
      const next = current === themeA ? themeB : themeA;
      this.set(next);
      return next;
    },

    /**
     * Initialize theme from localStorage or system preference
     * Should be called on page load
     * @param {Object} options - Initialization options
     * @param {string} options.defaultTheme - Fallback theme if nothing stored (default: 'auto')
     * @param {boolean} options.persist - Whether to persist the theme (default: true)
     */
    init(options = {}) {
      const { defaultTheme = 'auto', persist = true } = options;

      // Try to restore from localStorage first
      let themeToSet = null;
      if (theme._isLocalStorageAvailable()) {
        try {
          themeToSet = localStorage.getItem(STORAGE_KEY);
        } catch (e) {
          // localStorage may be disabled
        }
      }

      // If no stored theme, use default
      if (!themeToSet || !VALID_THEMES.includes(themeToSet)) {
        themeToSet = defaultTheme;
      }

      // Apply the theme (without persistence on init to avoid loops)
      const html = document.documentElement;
      html.dataset.theme = themeToSet;

      // If persist is enabled and we had to use default, save it
      if (persist && theme._isLocalStorageAvailable() && !localStorage.getItem(STORAGE_KEY)) {
        try {
          localStorage.setItem(STORAGE_KEY, themeToSet);
        } catch (e) {
          // Ignore storage errors
        }
      }

      // Listen for system theme changes when using 'auto' theme
      if (themeToSet === 'auto') {
        theme._watchSystemTheme();
      }

      return themeToSet;
    },

    /**
     * Get the effective theme (resolves 'auto' to actual theme)
     * @returns {string} The effective theme name
     */
    getEffective() {
      const current = this.get();
      if (current !== 'auto') {
        return current;
      }
      return theme._getSystemTheme();
    },

    /**
     * Get system theme preference
     * @returns {string} 'dark' or 'light'
     * @private
     */
    _getSystemTheme() {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    },

    /**
     * Watch for system theme changes (when using 'auto' theme)
     * @private
     */
    _watchSystemTheme() {
      if (!window.matchMedia) return;

      const media = window.matchMedia('(prefers-color-scheme: dark)');

      // Modern browsers
      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', (e) => {
          // Only react if current theme is 'auto'
          if (theme.get() === 'auto') {
            // Force re-evaluation by re-setting the attribute
            const html = document.documentElement;
            const currentTheme = html.dataset.theme;
            html.dataset.theme = '';
            // Trigger reflow
            void html.offsetHeight;
            html.dataset.theme = currentTheme;
          }
        });
      }
    },

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     * @private
     */
    _isLocalStorageAvailable() {
      try {
        const test = '__vitra_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    },

    /**
     * Clear stored theme preference
     */
    clear() {
      if (theme._isLocalStorageAvailable()) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
          // Ignore
        }
      }
    },

    /**
     * Get list of valid theme names
     * @returns {string[]} Array of valid theme names
     */
    getValidThemes() {
      return [...VALID_THEMES];
    }
  };

  // =========================================================================
  // PARTICLES MODULE
  // Particle spawn controller with performance limits
  // =========================================================================

  const particles = (() => {
    // Active particle instances
    let _activeParticles = [];
    let _maxParticles = 40; // Desktop default

    // Check for reduced motion preference
    const _prefersReducedMotion = () => {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    // Get device-based particle limit
    const _getDeviceLimit = () => {
      if (window.innerWidth <= 768) {
        return 15; // Mobile
      }
      return 40; // Desktop
    };

    /**
     * Spawn particles
     * @param {number} count - Number of particles to spawn
     * @param {Object} options - Particle options
     * @param {string} options.color - Particle color (CSS color value)
     * @param {number} options.size - Particle size in pixels
     * @param {string} options.emoji - Emoji to use instead of dot
     * @param {string} options.container - CSS selector for container (default: body)
     * @returns {number} Number of particles actually spawned
     */
    const spawn = (count, options = {}) => {
      // Respect reduced motion
      if (_prefersReducedMotion()) {
        console.warn('[Vitra Particles] prefers-reduced-motion detected, skipping particle spawn');
        return 0;
      }

      const {
        color = 'var(--vitra-color-accent, #6c63ff)',
        size = 4,
        emoji = null,
        container = 'body'
      } = options;

      // Apply device limit
      const limit = _getDeviceLimit();
      const availableSlots = limit - _activeParticles.length;
      const actualCount = Math.min(count, availableSlots);

      if (actualCount <= 0) {
        console.warn(`[Vitra Particles] Particle limit reached (${limit})`);
        return 0;
      }

      const targetContainer = document.querySelector(container) || document.body;

      for (let i = 0; i < actualCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'vitra-particle';

        if (emoji) {
          particle.setAttribute('data-emoji', emoji);
          particle.className = 'vitra-particles-emoji';
          particle.style.fontSize = `${size * 4}px`;
          particle.textContent = emoji;
        } else {
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          particle.style.background = color;
          particle.style.borderRadius = '50%';
          particle.style.position = 'absolute';
          particle.style.top = `${Math.random() * 100}%`;
          particle.style.left = `${Math.random() * 100}%`;
        }

        particle.style.animationDuration = `${3 + Math.random() * 2}s`;
        particle.style.opacity = '0.7';

        targetContainer.appendChild(particle);
        _activeParticles.push(particle);
      }

      return actualCount;
    };

    /**
     * Destroy particles created by this module
     * @param {number|null} count - Number to destroy (null = all)
     * @returns {number} Number of particles destroyed
     */
    const destroy = (count = null) => {
      let toRemove = count !== null ? Math.min(count, _activeParticles.length) : _activeParticles.length;
      const removed = _activeParticles.splice(0, toRemove);

      removed.forEach(p => {
        if (p.parentNode) {
          p.parentNode.removeChild(p);
        }
      });

      return removed.length;
    };

    /**
     * Get current particle limits
     * @returns {Object} Limit information
     */
    const limits = () => {
      return {
        max: _getDeviceLimit(),
        active: _activeParticles.length,
        available: _getDeviceLimit() - _activeParticles.length
      };
    };

    /**
     * Initialize particle system from data attributes
     * Looks for [data-vitra-particles] elements
     */
    const init = () => {
      const containers = document.querySelectorAll('[data-vitra-particles]');
      containers.forEach(container => {
        const count = parseInt(container.dataset.vitraParticles || '10', 10);
        const color = container.dataset.vitraParticleColor || undefined;
        const emoji = container.dataset.vitraParticleEmoji || null;
        spawn(count, { color, emoji, container: null });
        // Re-append to correct container since we queried it
        const jsParticles = document.querySelectorAll('.vitra-particle-js, .vitra-particles-emoji-js');
        jsParticles.forEach(p => {
          if (p.parentNode === document.body && container !== document.body) {
            p.parentNode.removeChild(p);
            container.appendChild(p);
          }
        });
      });
    };

    return {
      spawn,
      destroy,
      limits,
      init
    };
  })();

  // =========================================================================
  // REVEAL MODULE
  // Scroll reveal using IntersectionObserver
  // =========================================================================

  const reveal = (() => {
    let _observer = null;
    let _revealedElements = [];

    // Check for reduced motion preference
    const _prefersReducedMotion = () => {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    /**
     * Initialize reveal observer
     * @param {Object} options - Observer options
     * @param {string} options.selector - CSS selector for elements to reveal (default: '.vitra-reveal')
     * @param {number} options.threshold - Visibility threshold (default: 0.1)
     * @param {number} options.stagger - Stagger delay in ms (default: 100)
     */
    const init = (options = {}) => {
      const {
        selector = '.vitra-reveal',
        threshold = 0.1,
        stagger = 100
      } = options;

      // Respect reduced motion - reveal immediately without animation
      if (_prefersReducedMotion()) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.classList.add('vitra-revealed');
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
        return;
      }

      if (!('IntersectionObserver' in window)) {
        console.warn('[Vitra Reveal] IntersectionObserver not supported');
        return;
      }

      _observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // Apply stagger delay
            setTimeout(() => {
              entry.target.classList.add('vitra-revealed');
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'none';
            }, index * stagger);

            _observer.unobserve(entry.target);
            _revealedElements.push(entry.target);
          }
        });
      }, { threshold });

      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        // Initial state
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        _observer.observe(el);
      });
    };

    /**
     * Get revealed elements count
     * @returns {number}
     */
    const count = () => {
      return _revealedElements.length;
    };

    /**
     * Reset all revealed elements (for re-triggering)
     */
    const reset = () => {
      _revealedElements.forEach(el => {
        el.classList.remove('vitra-revealed');
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
      });
      _revealedElements = [];
    };

    return {
      init,
      count,
      reset
    };
  })();

  // =========================================================================
  // MODAL MODULE
  // Modal dialog with focus trap and accessibility
  // =========================================================================

  const modal = (() => {
    let _activeModal = null;
    let _previousFocus = null;
    let _focusableElements = null;
    let _firstFocusable = null;
    let _lastFocusable = null;

    /**
     * Open a modal
     * @param {string|HTMLElement} target - CSS selector or element
     * @param {Object} options - Modal options
     * @param {boolean} options.closeOnOverlay - Close when clicking overlay (default: true)
     * @param {boolean} options.closeOnEsc - Close on Escape key (default: true)
     */
    const open = (target, options = {}) => {
      const {
        closeOnOverlay = true,
        closeOnEsc = true
      } = options;

      const selector = typeof target === 'string' ? (target.startsWith('#') || target.startsWith('.') ? target : '#' + target) : null;
      const modalEl = selector ? document.querySelector(selector) : (typeof target === 'object' ? target : null);

      if (!modalEl) {
        console.warn('[Vitra Modal] Modal element not found');
        return false;
      }

      // Close any active modal first
      if (_activeModal) {
        close();
      }

      _activeModal = modalEl;
      _previousFocus = document.activeElement;

      // Show modal
      modalEl.classList.add('vitra-modal-open');
      modalEl.setAttribute('open', '');
      modalEl.setAttribute('aria-hidden', 'false');

      // Set up focus trap
      _setupFocusTrap(modalEl);

      // Event listeners
      if (closeOnOverlay) {
        const overlay = modalEl;
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            close();
          }
        });
      }

      if (closeOnEsc) {
        document.addEventListener('keydown', _handleEsc);
      }

      // Find close buttons and bind them
      const closeButtons = modalEl.querySelectorAll('[data-vitra-modal-close]');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => close());
      });

      return true;
    };

    /**
     * Close the active modal
     */
    const close = () => {
      if (!_activeModal) return;

      _activeModal.classList.remove('vitra-modal-open');
      _activeModal.removeAttribute('open');
      _activeModal.setAttribute('aria-hidden', 'true');

      // Remove event listeners
      document.removeEventListener('keydown', _handleEsc);

      // Restore focus
      if (_previousFocus && _previousFocus.focus) {
        _previousFocus.focus();
      }

      _activeModal = null;
      _previousFocus = null;
    };

    /**
     * Set up focus trap within modal
     */
    const _setupFocusTrap = (modalEl) => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ].join(', ');

      _focusableElements = modalEl.querySelectorAll(focusableSelectors);
      _focusableElements = Array.from(_focusableElements);

      if (_focusableElements.length === 0) return;

      _firstFocusable = _focusableElements[0];
      _lastFocusable = _focusableElements[_focusableElements.length - 1];

      // Trap focus
      modalEl.addEventListener('keydown', _handleTabKey);

      // Focus first element
      setTimeout(() => _firstFocusable.focus(), 100);
    };

    /**
     * Handle Tab key for focus trap
     */
    const _handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === _firstFocusable) {
          e.preventDefault();
          _lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === _lastFocusable) {
          e.preventDefault();
          _firstFocusable.focus();
        }
      }
    };

    /**
     * Handle Escape key
     */
    const _handleEsc = (e) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    return {
      open,
      close
    };
  })();

  // =========================================================================
  // TOOLTIP MODULE
  // Tooltip with positioning and accessibility
  // =========================================================================

  const tooltip = (() => {
    let _activeTooltip = null;
    const _offset = 8;

    /**
     * Show a tooltip
     * @param {string|HTMLElement} target - CSS selector or element to attach tooltip to
     * @param {string} text - Tooltip text content
     * @param {Object} options - Tooltip options
     * @param {string} options.position - Position: top, bottom, left, right (default: 'top')
     * @param {number} options.delay - Delay before show in ms (default: 0)
     */
    const show = (target, text, options = {}) => {
      const {
        position = 'top',
        delay = 0
      } = options;

      const targetEl = typeof target === 'string' ? document.querySelector(target) : target;

      if (!targetEl) {
        console.warn('[Vitra Tooltip] Target element not found');
        return false;
      }

      // Hide any active tooltip first
      hide();

      setTimeout(() => {
        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'vitra-tooltip-js';
        tooltipEl.setAttribute('role', 'tooltip');
        tooltipEl.textContent = text;

        // Style the tooltip
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.zIndex = '9999';
        tooltipEl.style.background = 'var(--vitra-color-bg, #0f0f14)';
        tooltipEl.style.color = 'var(--vitra-color-text-primary, #ffffff)';
        tooltipEl.style.border = '1px solid var(--vitra-color-border, #2a2a35)';
        tooltipEl.style.borderRadius = 'var(--vitra-radius-sm, 4px)';
        tooltipEl.style.padding = 'var(--vitra-space-1, 4px) var(--vitra-space-2, 8px)';
        tooltipEl.style.fontSize = 'var(--vitra-font-size-sm, 0.875rem)';
        tooltipEl.style.whiteSpace = 'nowrap';
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.opacity = '0';
        tooltipEl.style.transition = 'opacity 0.2s ease';

        document.body.appendChild(tooltipEl);

        // Position the tooltip
        _positionTooltip(targetEl, tooltipEl, position);

        // Show with animation
        setTimeout(() => {
          tooltipEl.style.opacity = '1';
        }, 10);

        _activeTooltip = tooltipEl;

        // Store reference on target for hide
        targetEl._vitraTooltip = tooltipEl;
      }, delay);

      return true;
    };

    /**
     * Position tooltip relative to target
     */
    const _positionTooltip = (target, tooltip, position) => {
      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      let top, left;

      switch (position) {
        case 'bottom':
          top = targetRect.bottom + _offset;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.left - tooltipRect.width - _offset;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.right + _offset;
          break;
        case 'top':
        default:
          top = targetRect.top - tooltipRect.height - _offset;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
      }

      // Adjust for viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left + tooltipRect.width > viewportWidth) {
        left = viewportWidth - tooltipRect.width - 8;
      }
      if (left < 0) {
        left = 8;
      }
      if (top + tooltipRect.height > viewportHeight) {
        top = targetRect.top - tooltipRect.height - _offset; // Flip to top
      }
      if (top < 0) {
        top = targetRect.bottom + _offset; // Flip to bottom
      }

      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    };

    /**
     * Hide the active tooltip
     * @param {string|HTMLElement} target - Optional target to hide tooltip for
     */
    const hide = (target = null) => {
      if (_activeTooltip) {
        _activeTooltip.style.opacity = '0';
        setTimeout(() => {
          if (_activeTooltip && _activeTooltip.parentNode) {
            _activeTooltip.parentNode.removeChild(_activeTooltip);
          }
        }, 200);
        _activeTooltip = null;
      }

      // Also check target-specific tooltip
      if (target) {
        const targetEl = typeof target === 'string' ? document.querySelector(target) : target;
        if (targetEl && targetEl._vitraTooltip) {
          targetEl._vitraTooltip.style.opacity = '0';
          setTimeout(() => {
            if (targetEl._vitraTooltip && targetEl._vitraTooltip.parentNode) {
              targetEl._vitraTooltip.parentNode.removeChild(targetEl._vitraTooltip);
            }
            targetEl._vitraTooltip = null;
          }, 200);
        }
      }
    };

    /**
     * Initialize tooltips from data attributes
     * Looks for [data-vitra-tooltip] elements
     */
    const init = () => {
      const elements = document.querySelectorAll('[data-vitra-tooltip]');
      elements.forEach(el => {
        const text = el.getAttribute('data-vitra-tooltip');
        const position = el.getAttribute('data-vitra-tooltip-position') || 'top';
        const delay = parseInt(el.getAttribute('data-vitra-tooltip-delay') || '0', 10);

        el.addEventListener('mouseenter', () => show(el, text, { position, delay }));
        el.addEventListener('mouseleave', () => hide(el));
        el.addEventListener('focus', () => show(el, text, { position, delay }));
        el.addEventListener('blur', () => hide(el));
      });
    };

    return {
      show,
      hide,
      init
    };
  })();

  // =========================================================================
  // DATA-CONFIG PARSER
  // Parse data-config attributes for module configuration
  // =========================================================================

  const _parseDataConfig = () => {
    const elements = document.querySelectorAll('[data-config]');
    elements.forEach(el => {
      try {
        const config = JSON.parse(el.getAttribute('data-config'));

        // Apply configuration to modules
        if (config.theme) {
          if (config.theme.init) {
            Vitra.theme.init(config.theme.options || {});
          }
        }

        if (config.particles) {
          if (config.particles.spawn) {
            Vitra.particles.spawn(
              config.particles.spawn.count || 10,
              config.particles.spawn.options || {}
            );
          }
        }

        if (config.reveal) {
          if (config.reveal.init) {
            Vitra.reveal.init(config.reveal.options || {});
          }
        }

        if (config.modal) {
          // Modal config is handled via data attributes
        }

        if (config.tooltip) {
          if (config.tooltip.init) {
            Vitra.tooltip.init();
          }
        }
      } catch (e) {
        console.warn('[Vitra] Failed to parse data-config:', e.message);
      }
    });
  };

  // Auto-initialize on DOMContentLoaded
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        _parseDataConfig();
      });
    } else {
      _parseDataConfig();
    }
  }

  // Public API
  return {
    theme,
    particles,
    reveal,
    modal,
    tooltip
  };
})();

// Export for ES modules (if using import/export)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Vitra;
}

// Also attach to window for script tag usage
if (typeof window !== 'undefined') {
  window.Vitra = Vitra;
}
