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

  const VALID_THEMES = Object.freeze(['light', 'dark', 'auto', 'pastel', 'neon', 'ocean', 'emerald']);

  /**
   * Theme Module
   * Handles theme toggling, auto-detection, and persistence
   */
  const theme = {

    /**
     * Get the current theme from DOM
     * @returns {string} Current theme name or 'auto'
     */
    get() {
      const html = document.documentElement;
      return html.dataset.theme || 'auto';
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

      // Announce theme change for screen readers
      const announcer = document.getElementById('vitra-theme-announcer') || (() => {
        const el = document.createElement('div');
        el.id = 'vitra-theme-announcer';
        el.setAttribute('aria-live', 'polite');
        el.setAttribute('aria-atomic', 'true');
        el.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
        document.body.appendChild(el);
        return el;
      })();
      announcer.textContent = `Theme changed to ${themeName}`;

      // Persist to localStorage if available
      if (theme._isLocalStorageAvailable()) {
        try {
          localStorage.setItem(STORAGE_KEY, themeName);
        } catch (e) {
          // localStorage may be full or disabled
          console.warn('[Vitra Theme] Could not save theme to localStorage:', e.message);
        }
      }

      if (themeName === 'auto') {
        theme._watchSystemTheme();
      }

      return true;
    },

    /**
     * Toggle between light and dark themes
     * @returns {string} The new active theme
     */
    toggle() {
      const current = this.get();
      let next;

      if (current === 'light') {
        next = 'dark';
      } else if (current === 'dark') {
        next = 'light';
      } else if (current === 'auto') {
        const effective = this.getEffective();
        next = effective === 'dark' ? 'light' : 'dark';
      } else {
        // If in a special theme, toggle back to light/dark based on contrast or just default to light
        next = 'light';
      }

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

      // Remove previous listener before adding new one to avoid accumulation
      if (theme._mediaChangeHandler) {
        if (typeof media.removeEventListener === 'function') {
          media.removeEventListener('change', theme._mediaChangeHandler);
        } else if (typeof media.removeListener === 'function') {
          media.removeListener(theme._mediaChangeHandler);
        }
      }

      theme._mediaChangeHandler = () => {
        if (theme.get() === 'auto') {
          document.documentElement.dataset.theme = 'auto';
        }
      };

      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', theme._mediaChangeHandler);
      } else if (typeof media.addListener === 'function') {
        media.addListener(theme._mediaChangeHandler);
      }
    },

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     * @private
     */
    _isLocalStorageAvailable() {
      try {
        if (typeof window === 'undefined' || !window.localStorage) return false;
        const test = '__vitra_test__';
        window.localStorage.setItem(test, test);
        window.localStorage.removeItem(test);
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
        container
      } = options;

      // Apply device limit
      const limit = _getDeviceLimit();
      const availableSlots = limit - _activeParticles.length;
      const actualCount = Math.min(count, availableSlots);

      if (actualCount <= 0) {
        console.warn(`[Vitra Particles] Particle limit reached (${limit})`);
        return 0;
      }

      const targetContainer = container
        ? (typeof container === 'string' ? document.querySelector(container) || document.body : (container instanceof Element ? container : document.body))
        : document.body;

      for (let i = 0; i < actualCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'vitra-particle';

        if (emoji) {
          particle.setAttribute('data-emoji', emoji);
          particle.className = 'vitra-particles-emoji';
          particle.style.fontSize = `${size * 4}px`;
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
        spawn(count, { color, emoji, container: container || null });
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
     * @param {string} options.rootMargin - Observer rootMargin, e.g. '0px 0px 15% 0px' to pre-trigger before entry (default: '0px')
     */
    const init = (options = {}) => {
      const {
        selector = '.vitra-reveal',
        threshold = 0.1,
        stagger = 100,
        rootMargin = '0px',
        scrollReveal = false
      } = options;

      // Collect all elements to observe
      let elements = [];
      if (scrollReveal) {
        const scrollSelectors = '.vitra-scroll-reveal, .vitra-scroll-reveal-left, .vitra-scroll-reveal-right, .vitra-scroll-reveal-scale';
        const scrollElements = document.querySelectorAll(scrollSelectors);
        scrollElements.forEach(el => {
          el.classList.add('vitra-scroll-reveal-observer'); // mark for IntersectionObserver
        });
        elements = [...document.querySelectorAll(selector)];
        elements.push(...scrollElements);
      } else {
        elements = [...document.querySelectorAll(selector)];
      }

      // Respect reduced motion - reveal immediately without animation
      if (_prefersReducedMotion()) {
        elements.forEach(el => {
          if (el.classList.contains('vitra-scroll-reveal-observer')) {
            el.classList.add('vitra-scroll-revealed');
          } else {
            el.classList.add('vitra-revealed');
          }
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
        // Stagger within the batch that became visible together —
        // staggering by global element index would make late
        // sections wait (index * stagger) ms after entering view
        const visible = entries.filter((entry) => entry.isIntersecting);
        visible.forEach((entry, batchIndex) => {
          setTimeout(() => {
            if (entry.target.classList.contains('vitra-scroll-reveal-observer')) {
              entry.target.classList.add('vitra-scroll-revealed');
            } else {
              entry.target.classList.add('vitra-revealed');
            }
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'none';
          }, batchIndex * stagger);

          _observer.unobserve(entry.target);
          _revealedElements.push(entry.target);
        });
      }, { threshold, rootMargin });

      elements.forEach(el => {
        // Initial state
        if (el.classList.contains('vitra-scroll-reveal-observer')) {
          if (el.classList.contains('vitra-scroll-reveal-left')) {
            el.style.transform = 'translateX(-40px)';
          } else if (el.classList.contains('vitra-scroll-reveal-right')) {
            el.style.transform = 'translateX(40px)';
          } else if (el.classList.contains('vitra-scroll-reveal-scale')) {
            el.style.transform = 'scale(0.8)';
          } else {
            el.style.transform = 'translateY(40px)';
          }
          el.style.transition = 'opacity 1s cubic-bezier(0.23, 1, 0.32, 1), transform 1s cubic-bezier(0.23, 1, 0.32, 1)';
        } else {
          el.style.transform = 'translateY(20px)';
          el.style.transition = 'opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1), transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        }
        el.style.opacity = '0';
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
        if (el.classList.contains('vitra-scroll-reveal-observer')) {
          el.classList.remove('vitra-scroll-revealed');
          el.style.opacity = '0';
          if (el.classList.contains('vitra-scroll-reveal-left')) {
            el.style.transform = 'translateX(-40px)';
          } else if (el.classList.contains('vitra-scroll-reveal-right')) {
            el.style.transform = 'translateX(40px)';
          } else if (el.classList.contains('vitra-scroll-reveal-scale')) {
            el.style.transform = 'scale(0.8)';
          } else {
            el.style.transform = 'translateY(40px)';
          }
        } else {
          el.classList.remove('vitra-revealed');
          el.style.opacity = '0';
          el.style.transform = 'translateY(20px)';
        }
      });
      _revealedElements = [];
    };

    /**
     * Destroy reveal module - disconnect observer, clean up DOM
     */
    const destroy = () => {
      if (_observer) {
        _observer.disconnect();
        _observer = null;
      }
      _revealedElements.forEach(el => {
        el.style.opacity = '';
        el.style.transform = '';
        el.style.transition = '';
        if (el.classList.contains('vitra-scroll-reveal-observer')) {
          el.classList.remove('vitra-scroll-revealed');
          el.classList.remove('vitra-scroll-reveal-observer');
        } else {
          el.classList.remove('vitra-revealed');
        }
      });
      _revealedElements = [];
    };

    return {
      init,
      count,
      reset,
      destroy
    };
  })();

  // =========================================================================
  // RIPPLE MODULE
  // Material-like click ripple effect
  // =========================================================================

  const ripple = (() => {
    let _clickHandler = null;

    const init = () => {
      if (_clickHandler) return;
      _clickHandler = (e) => {
        const target = e.target.closest('.vitra-ripple');
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const span = document.createElement('span');
        span.className = 'vitra-ripple-effect';
        span.style.width = `${size}px`;
        span.style.height = `${size}px`;
        span.style.left = `${x}px`;
        span.style.top = `${y}px`;

        target.appendChild(span);
        span.addEventListener('animationend', () => span.remove(), { once: true });
      };
      document.addEventListener('click', _clickHandler);
    };

    const destroy = () => {
      if (_clickHandler) {
        document.removeEventListener('click', _clickHandler);
        _clickHandler = null;
      }
    };

    return { init, destroy };
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
    let _tabKeyTarget = null;
    let _lastFocusable = null;
    let _overlayClickHandler = null;

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

      // Set ARIA attributes for accessibility
      modalEl.setAttribute('role', 'dialog');
      modalEl.setAttribute('aria-modal', 'true');
      modalEl.setAttribute('aria-hidden', 'false');

      // Lock body scroll
      document.body.style.overflow = 'hidden';

      // Show modal
      modalEl.classList.add('vitra-modal-open');
      modalEl.setAttribute('open', '');

      // Set up focus trap
      _setupFocusTrap(modalEl);

      // Event listeners with cleanup
      if (closeOnOverlay) {
        if (_overlayClickHandler) {
          modalEl.removeEventListener('click', _overlayClickHandler);
        }
        _overlayClickHandler = (e) => {
          if (e.target === modalEl) {
            close();
          }
        };
        modalEl.addEventListener('click', _overlayClickHandler);
      }

      if (closeOnEsc) {
        document.removeEventListener('keydown', _handleEsc);
        document.addEventListener('keydown', _handleEsc);
      }

      // Find close buttons and bind them (remove old listeners first)
      const closeButtons = modalEl.querySelectorAll('[data-vitra-modal-close]');
      closeButtons.forEach(btn => {
        btn.removeEventListener('click', close);
        btn.addEventListener('click', close);
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
      _activeModal.removeAttribute('role');
      _activeModal.removeAttribute('aria-modal');
      _activeModal.setAttribute('aria-hidden', 'true');

      // Restore body scroll
      document.body.style.overflow = '';

      // Remove event listeners
      document.removeEventListener('keydown', _handleEsc);
      if (_tabKeyTarget) {
        _tabKeyTarget.removeEventListener('keydown', _handleTabKey);
        _tabKeyTarget = null;
      }
      if (_overlayClickHandler) {
        _activeModal.removeEventListener('click', _overlayClickHandler);
        _overlayClickHandler = null;
      }

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

      _focusableElements = Array.from(modalEl.querySelectorAll(focusableSelectors));

      if (_focusableElements.length === 0) return;

      _firstFocusable = _focusableElements[0];
      _lastFocusable = _focusableElements[_focusableElements.length - 1];

      // Trap focus — remove previous listener first to avoid accumulation
      if (_tabKeyTarget) {
        _tabKeyTarget.removeEventListener('keydown', _handleTabKey);
      }
      _tabKeyTarget = modalEl;
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

    /**
     * Destroy modal module - close and clean up
     */
    const destroy = () => {
      if (_activeModal) {
        close();
      }
      document.removeEventListener('keydown', _handleEsc);
    };

    return {
      open,
      close,
      destroy
    };
  })();

  // =========================================================================
  // TOOLTIP MODULE
  // Tooltip with positioning and accessibility
  // =========================================================================

  const tooltip = (() => {
    let _activeTooltip = null;
    let _showTimeout = null;
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

      if (_showTimeout) {
        clearTimeout(_showTimeout);
        _showTimeout = null;
      }

      _showTimeout = setTimeout(() => {
        const tooltipEl = document.createElement('div');
        const tooltipId = 'vitra-tt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
        tooltipEl.className = 'vitra-tooltip-js';
        tooltipEl.id = tooltipId;
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
        tooltipEl.style.whiteSpace = 'normal';
        tooltipEl.style.wordWrap = 'break-word';
        tooltipEl.style.maxWidth = '90vw';
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.opacity = '0';
        tooltipEl.style.transition = 'opacity 0.2s ease';

        // Connect tooltip to target via aria-describedby
        targetEl.setAttribute('aria-describedby', tooltipId);

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

      tooltip.style.top = `${top + window.scrollY}px`;
      tooltip.style.left = `${left + window.scrollX}px`;
    };

    /**
     * Hide the active tooltip
     * @param {string|HTMLElement} target - Optional target to hide tooltip for
     */
    const _removeDescribedBy = (target) => {
      if (target && target.getAttribute('aria-describedby')?.startsWith('vitra-tt-')) {
        target.removeAttribute('aria-describedby');
      }
    };

    const hide = (target = null) => {
      if (_showTimeout) {
        clearTimeout(_showTimeout);
        _showTimeout = null;
      }

      if (_activeTooltip) {
        _removeDescribedBy(document.querySelector(`[aria-describedby="${_activeTooltip.id}"]`));
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
          _removeDescribedBy(targetEl);
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

    /**
     * Destroy tooltip module - hide and unbind all
     */
    const destroy = () => {
      hide();
      const elements = document.querySelectorAll('[data-vitra-tooltip]');
      elements.forEach(el => {
        // Clone and replace to remove all event listeners
        const clone = el.cloneNode(true);
        el.parentNode.replaceChild(clone, el);
      });
    };

    return {
      show,
      hide,
      init,
      destroy
    };
  })();

  // =========================================================================
  // TOAST MODULE
  // Toast notifications with glassmorphism
  // =========================================================================

  const toast = (() => {
    let _container = null;
    const _pendingTimeouts = new Set();

    const _ensureContainer = () => {
      if (!_container) {
        _container = document.createElement('div');
        _container.className = 'vitra-toast-container';
        document.body.appendChild(_container);
      }
      return _container;
    };

    const _schedule = (fn, delay) => {
      const id = setTimeout(() => {
        _pendingTimeouts.delete(id);
        fn();
      }, delay);
      _pendingTimeouts.add(id);
      return id;
    };

    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {Object} options - Options (type: 'success'|'error'|'info'|'default', duration: number)
     */
    const show = (message, options = {}) => {
      const { type = 'default', duration = 3000 } = options;
      const container = _ensureContainer();

      const el = document.createElement('div');
      el.className = `vitra-toast`;
      if (type !== 'default') {
        el.classList.add(`vitra-toast-${type}`);
      }

      el.textContent = message;
      container.appendChild(el);

      // Trigger animation
      _schedule(() => el.classList.add('show'), 10);

      // Remove after duration
      if (duration > 0) {
        _schedule(() => {
          el.classList.remove('show');
          _schedule(() => {
            if (el.parentNode === container) {
              container.removeChild(el);
            }
          }, 300); // Wait for transition
        }, duration);
      }

      return el;
    };

    /**
     * Clear pending timers and remove all toasts and the container.
     */
    const destroy = () => {
      _pendingTimeouts.forEach(id => clearTimeout(id));
      _pendingTimeouts.clear();
      if (_container && _container.parentNode) {
        _container.parentNode.removeChild(_container);
      }
      _container = null;
    };

    return { show, destroy };
  })();

  // =========================================================================
  // DROPDOWN MODULE
  // Custom dropdowns with A11y support
  // =========================================================================

  const dropdown = (() => {
    const _supportsPopover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;
    let _initialized = false;

    const _clickHandler = (e) => {
      const toggle = e.target.closest('[data-vitra-dropdown-toggle]');
      const dropdown = toggle ? toggle.closest('.vitra-dropdown') : null;
      const menu = dropdown ? dropdown.querySelector('.vitra-dropdown-menu') : null;

      if (_supportsPopover && menu && menu.hasAttribute('popover')) {
        // Popover API handles close-on-outside-click automatically
        if (toggle) {
          e.preventDefault();
          menu.togglePopover();
          const isOpen = menu.matches(':popover-open');
          toggle.setAttribute('aria-expanded', String(isOpen));
        }
      } else {
        // Fallback: close all other dropdowns
        document.querySelectorAll('.vitra-dropdown.open').forEach(dd => {
          if (!toggle || dd !== dropdown) {
            dd.classList.remove('open');
            const btn = dd.querySelector('[data-vitra-dropdown-toggle]');
            if (btn) btn.setAttribute('aria-expanded', 'false');
          }
        });

        if (toggle) {
          e.preventDefault();
          if (dropdown) {
            dropdown.classList.toggle('open');
            const isOpen = dropdown.classList.contains('open');
            toggle.setAttribute('aria-expanded', String(isOpen));
          }
        }
      }
    };

    const init = () => {
      if (_initialized) return;
      document.addEventListener('click', _clickHandler);
      _initialized = true;
    };

    const destroy = () => {
      document.removeEventListener('click', _clickHandler);
      _initialized = false;
    };

    return { init, destroy };
  })();

  // =========================================================================
  // SPOTLIGHT MODULE
  // Adds magnetic hover effect to elements
  // =========================================================================
  const spotlight = (() => {
    let initialized = false;
    let _rafId = null;
    let _handleMove = null;

    const init = () => {
      if (initialized) return;
      _handleMove = (e) => {
        if (_rafId) return;
        _rafId = requestAnimationFrame(() => {
          _rafId = null;
          const spotlights = document.querySelectorAll('.vitra-spotlight');
          spotlights.forEach(el => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            el.style.setProperty('--mouse-x', `${x}px`);
            el.style.setProperty('--mouse-y', `${y}px`);
          });
        });
      };
      document.addEventListener('mousemove', _handleMove, { passive: true });
      initialized = true;
    };

    const destroy = () => {
      if (_handleMove) {
        document.removeEventListener('mousemove', _handleMove);
        _handleMove = null;
      }
      if (_rafId) {
        cancelAnimationFrame(_rafId);
        _rafId = null;
      }
      initialized = false;
    };

    return { init, destroy };
  })();

  // =========================================================================
  // DATA-CONFIG PARSER
  // Parse data-config attributes for module configuration
  // =========================================================================

  const _parseDataConfig = () => {
    const el = document.querySelector('[data-config]');
    if (!el) return;

    try {
      const config = JSON.parse(el.getAttribute('data-config'));

      // 1. Theme Configuration
      if (config.theme) {
        const themeOptions = typeof config.theme === 'object'
          ? config.theme
          : (typeof config.theme === 'string' ? { default: config.theme } : {});
        Vitra.theme.init(themeOptions);
      }

      // 2. Particles Configuration
      if (config.particles) {
        if (config.particles === true) {
          Vitra.particles.init();
        } else if (typeof config.particles === 'object') {
          Vitra.particles.spawn(config.particles.count || 10, config.particles);
        }
      }

      // 3. Reveal Configuration
      if (config.reveal) {
        const revealOptions = typeof config.reveal === 'object' ? config.reveal : {};
        Vitra.reveal.init(revealOptions);
      }

      // 4. Ripple Configuration
      if (config.ripple !== false) {
        Vitra.ripple.init();
      }

      // 5. Tooltip Configuration
      if (config.tooltip !== false) {
        Vitra.tooltip.init();
      }
    } catch (e) {
      console.warn('[Vitra] Failed to parse data-config:', e.message);
    }
  };

  // Flash prevention: restore saved theme before paint
  (() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && VALID_THEMES.includes(saved)) {
        document.documentElement.dataset.theme = saved;
      }
    } catch (e) {
      // Silently fail
    }
  })();

  // Auto-initialize on DOMContentLoaded
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        _parseDataConfig();
        dropdown.init();
        spotlight.init();
      });
    } else {
      _parseDataConfig();
      dropdown.init();
      spotlight.init();
    }
  }

  // Global destroy: clean up all modules
  const destroyAll = () => {
    reveal.destroy();
    ripple.destroy();
    modal.destroy();
    tooltip.destroy();
    toast.destroy();
    dropdown.destroy();
    spotlight.destroy();
    particles.destroy();
  };

  // Public API
  return {
    theme,
    particles,
    reveal,
    ripple,
    modal,
    tooltip,
    toast,
    dropdown,
    spotlight,
    destroyAll
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
