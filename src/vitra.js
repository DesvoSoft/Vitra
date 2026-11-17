/**
 * Vitra CSS Framework - JavaScript Modules
 * Phase 1: Tokens & Themes - Plan 02
 *
 * Optional JS for enhanced interactivity
 * Works with data-theme attribute on <html> element
 */

const Vitra = (() => {
  'use strict';

  // Shared private helpers

  const _resolve = (t) => (typeof t === 'string' ? document.querySelector(t) : t && t.nodeType === 1 ? t : null);

  const _reducedMotion = () =>
    !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const _FOCUSABLE = 'a[href],button,input:not([type=hidden]),textarea,select,summary,[tabindex],[contenteditable=""],[contenteditable="true"]';

  // Visible, enabled, non-inert focusable descendants. Recomputed on every call.
  // Walks ancestors instead of using offsetParent so it also works without layout.
  const _focusables = (root) =>
    Array.from(root.querySelectorAll(_FOCUSABLE)).filter((el) => {
      if (el.tabIndex < 0 || el.matches(':disabled') || getComputedStyle(el).visibility === 'hidden') return false;
      for (let n = el; n; n = n.parentElement) {
        if (n.hidden || n.hasAttribute('inert') || getComputedStyle(n).display === 'none') return false;
        if (n === root) break;
      }
      return true;
    });

  // Focus the first focusable of root (or home, default root) and keep Tab inside root.
  // The keydown listener is on document so it still works after focus fell to body.
  // Returns the release function.
  // Traps stack: only the most recent one (e.g. a modal over a drawer) handles Tab.
  const _traps = [];
  const _trapFocus = (root, home = root) => {
    const hadTabindex = home.getAttribute('tabindex');
    if (hadTabindex === null) home.setAttribute('tabindex', '-1');
    let r1, r2;
    const focusFirst = () => (_focusables(root)[0] || home).focus();
    const onKey = (e) => {
      if (e.key !== 'Tab' || _traps[_traps.length - 1] !== onKey) return;
      const list = _focusables(root);
      const first = list[0] || home;
      const last = list[list.length - 1] || home;
      const active = document.activeElement;
      if (active === (e.shiftKey ? first : last) || active === home || !root.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    document.addEventListener('keydown', onKey);
    _traps.push(onKey);
    focusFirst();
    // A transition may keep the element unfocusable until the paint commits.
    if (!root.contains(document.activeElement)) {
      r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(focusFirst); });
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      if (_traps.includes(onKey)) _traps.splice(_traps.indexOf(onKey), 1);
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      if (hadTabindex === null) home.removeAttribute('tabindex');
      else home.setAttribute('tabindex', hadTabindex);
    };
  };

  // Counted body scroll lock: only the last release restores the author's values.
  let _scrollLocks = 0;
  let _savedBody;
  const _lockScroll = () => {
    const b = document.body;
    if (!_scrollLocks++) {
      _savedBody = [b.style.overflow, b.style.paddingRight];
      const gap = document.documentElement.clientWidth && window.innerWidth - document.documentElement.clientWidth;
      b.style.overflow = 'hidden';
      if (gap > 0) b.style.paddingRight = (parseFloat(getComputedStyle(b).paddingRight) || 0) + gap + 'px';
    }
    let done = false;
    return () => {
      if (done) return;
      done = true;
      if (!--_scrollLocks) [b.style.overflow, b.style.paddingRight] = _savedBody;
    };
  };

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
    set(themeName, options = {}) {
      if (!VALID_THEMES.includes(themeName)) {
        console.warn(`[Vitra Theme] Invalid theme: "${themeName}". Valid themes: ${VALID_THEMES.join(', ')}`);
        return false;
      }

      const html = document.documentElement;
      const animate = options.transition !== undefined ? options.transition : theme._transition;
      if (animate && html.dataset.theme !== themeName && theme._canTransition()) {
        theme._reveal(themeName, options.origin);
      } else {
        html.dataset.theme = themeName;
      }

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
    toggle(options) {
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

      this.set(next, options);
      return next;
    },

    // Animated theme swaps are opt-in: theme.init({ transition: true }),
    // or per call via set(name, { transition: true }).
    _transition: false,

    _canTransition() {
      return typeof document.startViewTransition === 'function' &&
        !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    },

    /**
     * Swap the theme inside a View Transition: the new theme grows as a
     * circle out of `origin` (a pointer event, an element, or {x, y};
     * defaults to the viewport centre). The attribute changes inside the
     * transition callback, i.e. one frame later than a plain set().
     */
    _reveal(themeName, origin) {
      const html = document.documentElement;
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      if (origin && typeof origin.clientX === 'number') {
        x = origin.clientX;
        y = origin.clientY;
      } else if (origin && typeof origin.getBoundingClientRect === 'function') {
        const rect = origin.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      } else if (origin && typeof origin.x === 'number') {
        x = origin.x;
        y = origin.y;
      }
      // Radius that reaches the farthest corner from the origin
      const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      html.style.setProperty('--vitra-theme-x', `${x}px`);
      html.style.setProperty('--vitra-theme-y', `${y}px`);
      html.style.setProperty('--vitra-theme-r', `${Math.ceil(r)}px`);
      html.classList.add('vitra-theme-transition');

      const done = () => html.classList.remove('vitra-theme-transition');
      try {
        const vt = document.startViewTransition(() => { html.dataset.theme = themeName; });
        Promise.resolve(vt && vt.finished).then(done, done);
      } catch (e) {
        html.dataset.theme = themeName;
        done();
      }
    },

    /**
     * Initialize theme from localStorage or system preference
     * Should be called on page load
     * @param {Object} options - Initialization options
     * @param {string} options.defaultTheme - Fallback theme if nothing stored (default: 'auto')
     * @param {boolean} options.persist - Whether to persist the theme (default: true)
     * @param {boolean} options.transition - Animate later theme changes with a circular reveal (default: false)
     */
    init(options = {}) {
      // `default` is the key the docs and data-config use; `defaultTheme`
      // is the original option name. Accept both.
      const { defaultTheme = options.default || 'auto', persist = true } = options;
      theme._transition = options.transition === true;

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

    // Get device-based particle limit
    const _getDeviceLimit = () => {
      if (window.innerWidth <= 768) {
        return 15; // Mobile
      }
      return 40; // Desktop
    };

    // Named direction presets -> angle in degrees (0 = up, 90 = right, 180 = down, 270 = left)
    const _DIRECTION_ANGLES = {
      down: 180,
      'down-left': 210,
      'down-right': 150
    };

    const _resolveAngle = (direction) => {
      if (typeof direction === 'number') {
        return direction;
      }
      if (Object.prototype.hasOwnProperty.call(_DIRECTION_ANGLES, direction)) {
        return _DIRECTION_ANGLES[direction];
      }
      console.warn(`[Vitra Particles] Unknown direction "${direction}", falling back to "down"`);
      return _DIRECTION_ANGLES.down;
    };

    /**
     * Spawn particles
     * @param {number} count - Number of particles to spawn
     * @param {Object} options - Particle options
     * @param {string} options.color - Particle color (CSS color value)
     * @param {number} options.size - Particle size in pixels
     * @param {string} options.emoji - Emoji to use instead of dot
     * @param {string} options.container - CSS selector for container (default: body)
     * @param {string|number} options.direction - Opt-in directional drift: 'down', 'down-left',
     *   'down-right', or a custom angle in degrees. Omitted/null keeps the default symmetric bob.
     * @returns {number} Number of particles actually spawned
     */
    const spawn = (count, options = {}) => {
      // Respect reduced motion
      if (_reducedMotion()) {
        console.warn('[Vitra Particles] prefers-reduced-motion detected, skipping particle spawn');
        return 0;
      }

      const {
        color = 'var(--vitra-color-accent, #6c63ff)',
        size = 4,
        emoji = null,
        container,
        direction = null
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
        ? _resolve(container) || document.body
        : document.body;

      const angle = direction !== null ? _resolveAngle(direction) : null;

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
          particle.style.left = `${Math.random() * 100}%`;
          particle.style.top = angle !== null ? `${Math.random() * -20}%` : `${Math.random() * 100}%`;
        }

        particle.style.animationDuration = `${3 + Math.random() * 2}s`;
        particle.style.opacity = '0.7';

        if (angle !== null) {
          const angleRad = (angle * Math.PI) / 180;
          const driftDistance = 60 + Math.random() * 60;
          const driftX = Math.sin(angleRad) * driftDistance + (Math.random() * 30 - 15);
          particle.dataset.direction = direction;
          particle.style.setProperty('--vitra-particle-drift-x', `${driftX.toFixed(1)}px`);
          particle.style.setProperty('--vitra-particle-drift-y', '120%');
        }

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
        const direction = container.dataset.vitraParticleDirection || null;
        spawn(count, { color, emoji, container, direction });
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
    const _pendingElements = new Set();

    // --- FAST-SCROLL DETECTION ---
    // Tracks scroll speed so a fast flick/fling doesn't queue up a visible
    // stagger of sections fading in after the user has already scrolled
    // past them. Threshold picked empirically: a deliberate scroll rarely
    // exceeds ~2.5px/ms, a fling/trackpad flick comfortably does.
    const FAST_SCROLL_THRESHOLD = 2.5;
    let _lastScrollY = null;
    let _lastScrollTime = null;
    let _isFastScrolling = false;
    let _scrollListenerAttached = false;

    const _handleScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      if (_lastScrollY !== null) {
        const dt = now - _lastScrollTime;
        if (dt > 0) {
          const speed = Math.abs(y - _lastScrollY) / dt;
          _isFastScrolling = speed > FAST_SCROLL_THRESHOLD;
        }
      }
      _lastScrollY = y;
      _lastScrollTime = now;
    };

    const _ensureScrollTracking = () => {
      if (_scrollListenerAttached) return;
      window.addEventListener('scroll', _handleScroll, { passive: true });
      _scrollListenerAttached = true;
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

      // Idempotent: a second init() used to orphan the first observer
      if (_observer) {
        _observer.disconnect();
        _observer = null;
      }

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
      if (_reducedMotion()) {
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

      _ensureScrollTracking();

      _observer = new IntersectionObserver((entries) => {
        // Stagger within the batch that became visible together —
        // staggering by global element index would make late
        // sections wait (index * stagger) ms after entering view.
        // Skipped entirely while fast-scrolling: queuing staggered
        // reveals behind a flick just makes them pop in after the
        // fact, once the user's already scrolled past.
        const visible = entries.filter((entry) => entry.isIntersecting);
        const effectiveStagger = _isFastScrolling ? 0 : stagger;
        visible.forEach((entry, batchIndex) => {
          setTimeout(() => {
            if (entry.target.classList.contains('vitra-scroll-reveal-observer')) {
              entry.target.classList.add('vitra-scroll-revealed');
            } else {
              entry.target.classList.add('vitra-revealed');
            }
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'none';
          }, batchIndex * effectiveStagger);

          _observer.unobserve(entry.target);
          _pendingElements.delete(entry.target);
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
        _pendingElements.add(el);
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
        // Watch it again, otherwise "reset" just hid it for good
        if (_observer) {
          _pendingElements.add(el);
          _observer.observe(el);
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
      if (_scrollListenerAttached) {
        window.removeEventListener('scroll', _handleScroll);
        _scrollListenerAttached = false;
      }
      _lastScrollY = null;
      _lastScrollTime = null;
      _isFastScrolling = false;
      // Elements still waiting to be revealed must come back too, or
      // destroy() leaves them at inline opacity: 0 with nothing watching.
      [..._revealedElements, ..._pendingElements].forEach(el => {
        el.style.opacity = '';
        el.style.transform = '';
        el.style.transition = '';
        if (el.classList.contains('vitra-scroll-reveal-observer')) {
          el.classList.remove('vitra-scroll-revealed');
          el.classList.remove('vitra-scroll-reveal-observer');
        } else {
          el.classList.remove('vitra-revealed');
        }
        // Without the observer the CSS hidden state would win again
        if (_pendingElements.has(el)) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }
      });
      _revealedElements = [];
      _pendingElements.clear();
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
    // The single open modal (opening another closes the current one first).
    let _active = null;

    const _closeEntry = (en) => {
      if (en !== _active) return;
      _active = null;
      const el = en.el;
      el.classList.remove('vitra-modal-open');
      el.removeAttribute('open');
      if (en.setRole) el.removeAttribute('role');
      if (en.setModal) el.removeAttribute('aria-modal');
      el.setAttribute('aria-hidden', 'true');
      en.untrap();
      en.unlock();
      el.removeEventListener('click', en.onClick);
      en.buttons.forEach((btn) => btn.removeEventListener('click', en.close));
      document.removeEventListener('keydown', _handleEsc);
      if (en.prev && en.prev.focus) en.prev.focus();
    };

    const _handleEsc = (e) => {
      if (e.key === 'Escape' && _active && _active.esc) _closeEntry(_active);
    };

    /**
     * Open a modal
     * @param {string|HTMLElement} target - CSS selector, bare id or element
     * @param {Object} options - Modal options
     * @param {boolean} options.closeOnOverlay - Close when clicking overlay (default: true)
     * @param {boolean} options.closeOnEsc - Close on Escape key (default: true)
     */
    const open = (target, options = {}) => {
      const { closeOnOverlay = true, closeOnEsc = true } = options;

      const modalEl = _resolve(typeof target === 'string' && !/^[#.]/.test(target) ? '#' + target : target);
      if (!modalEl) {
        console.warn('[Vitra Modal] Modal element not found');
        return false;
      }
      if (_active && _active.el === modalEl) return true;
      // One modal at a time: opening another closes the current one first
      close();

      const en = {
        el: modalEl,
        prev: document.activeElement,
        esc: closeOnEsc,
        setRole: !modalEl.hasAttribute('role'),
        setModal: !modalEl.hasAttribute('aria-modal'),
        buttons: Array.from(modalEl.querySelectorAll('[data-vitra-modal-close]')),
        close: () => _closeEntry(en),
        onClick: (e) => { if (closeOnOverlay && e.target === modalEl) _closeEntry(en); }
      };

      if (en.setRole) modalEl.setAttribute('role', 'dialog');
      if (en.setModal) modalEl.setAttribute('aria-modal', 'true');
      modalEl.setAttribute('aria-hidden', 'false');
      en.unlock = _lockScroll();
      modalEl.classList.add('vitra-modal-open');
      modalEl.setAttribute('open', '');
      en.untrap = _trapFocus(modalEl, modalEl.querySelector('.vitra-modal-content') || modalEl);

      modalEl.addEventListener('click', en.onClick);
      en.buttons.forEach((btn) => btn.addEventListener('click', en.close));
      document.addEventListener('keydown', _handleEsc);
      _active = en;
      return true;
    };

    /**
     * Close the open modal
     */
    const close = () => {
      if (_active) _closeEntry(_active);
    };

    return { open, close, destroy: close };
  })();

  // =========================================================================
  // DRAWER MODULE
  // Side drawer: .open class, inert when closed, focus trap, Esc, overlay
  // =========================================================================

  const drawer = (() => {
    const _managed = new Set();
    let _active = null; // { el, prev, setRole, setModal, untrap, unlock }
    let _bound = false;

    const _toggles = (el) =>
      Array.from(document.querySelectorAll('[data-vitra-drawer-toggle]'))
        .filter((t) => _resolve(t.getAttribute('data-vitra-drawer-toggle')) === el);

    const _overlay = (el) =>
      _resolve(el.getAttribute('data-vitra-drawer-overlay')) ||
      (el.parentElement && el.parentElement.querySelector(':scope > .vitra-drawer-overlay'));

    const _sync = (el, on) => {
      const ov = _overlay(el);
      if (ov) ov.classList.toggle('open', on);
      _toggles(el).forEach((t) => {
        t.setAttribute('aria-expanded', String(on));
        if (t.classList.contains('vitra-burger')) t.classList.toggle('active', on);
      });
    };

    const _manage = (el) => {
      if (_managed.has(el)) return;
      _managed.add(el);
      el.setAttribute('inert', '');
      _sync(el, false);
    };

    const _close = (en) => {
      if (en !== _active) return;
      _active = null;
      const el = en.el;
      el.classList.remove('open');
      _sync(el, false);
      if (en.setRole) el.removeAttribute('role');
      if (en.setRole) el.removeAttribute('aria-modal');
      if (en.hid) el.setAttribute('aria-hidden', 'true');
      en.untrap();
      en.unlock();
      if (en.prev && en.prev.focus) en.prev.focus();
      el.setAttribute('inert', '');
    };

    const close = (target) => {
      if (!_active) return;
      if (target === undefined || _resolve(target) === _active.el) _close(_active);
    };

    const open = (target, opener) => {
      const el = _resolve(target);
      if (!el) {
        console.warn('[Vitra Drawer] Target element not found');
        return false;
      }
      if (_active && _active.el === el) return true;
      close();
      _manage(el);
      const en = {
        el,
        prev: opener || document.activeElement,
        setRole: !el.hasAttribute('role'),
        hid: el.hasAttribute('aria-hidden')
      };
      if (en.setRole) {
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
      }
      if (en.hid) el.setAttribute('aria-hidden', 'false');
      el.removeAttribute('inert');
      el.classList.add('open');
      _sync(el, true);
      en.unlock = _lockScroll();
      en.untrap = _trapFocus(el);
      _active = en;
      return true;
    };

    const toggle = (target, opener) => {
      const el = _resolve(target);
      if (el && _active && _active.el === el) {
        close();
        return false;
      }
      return open(target, opener);
    };

    const _onClick = (e) => {
      const t = e.target;
      if (!t.closest) return;
      const tg = t.closest('[data-vitra-drawer-toggle]');
      if (tg) {
        e.preventDefault();
        toggle(tg.getAttribute('data-vitra-drawer-toggle'), tg);
        return;
      }
      const btn = t.closest('.vitra-drawer-close');
      const d = btn && btn.closest('.vitra-drawer');
      if (d && _managed.has(d)) close(d);
      else if (_active && !_active.el.contains(t) && !t.closest('.vitra-modal-open')) {
        const en = _active;
        // The overlay closes at once; any other outside click is deferred so an
        // author button that calls toggle()/open() in its own handler wins.
        if (t === _overlay(en.el)) close();
        else setTimeout(() => _close(en));
      }
    };

    const _onKey = (e) => {
      if (e.key === 'Escape' && _active && !document.querySelector('.vitra-modal-open')) close();
    };

    const init = () => {
      document.querySelectorAll('[data-vitra-drawer-toggle]').forEach((t) => {
        const el = _resolve(t.getAttribute('data-vitra-drawer-toggle'));
        if (el) _manage(el);
      });
      if (_bound) return;
      _bound = true;
      document.addEventListener('click', _onClick, true); // capture: sees the modal still open
      document.addEventListener('keydown', _onKey);
    };

    const destroy = () => {
      close();
      _managed.forEach((el) => el.removeAttribute('inert'));
      _managed.clear();
      document.removeEventListener('click', _onClick, true);
      document.removeEventListener('keydown', _onKey);
      _bound = false;
    };

    return { open, close, toggle, init, destroy };
  })();

  // =========================================================================
  // TOOLTIP MODULE
  // Tooltip with positioning and accessibility
  // =========================================================================

  const tooltip = (() => {
    let _active = null;
    let _cur = null;
    let _showTimeout = null;
    let _touch = false;
    let _bound = false;
    const _SEL = '[data-vitra-tooltip]';
    const _offset = 8;
    const _opp = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

    // Place the tip: requested side, else the opposite side, else clamped
    // to the viewport with an 8px margin.
    const _positionTooltip = (target, tip, position) => {
      const r = target.getBoundingClientRect();
      const w = tip.offsetWidth;
      const h = tip.offsetHeight;
      const W = document.documentElement.clientWidth;
      const H = window.innerHeight;
      const xy = (p) => p === 'bottom' ? [r.left + (r.width - w) / 2, r.bottom + _offset]
        : p === 'left' ? [r.left - w - _offset, r.top + (r.height - h) / 2]
        : p === 'right' ? [r.right + _offset, r.top + (r.height - h) / 2]
        : [r.left + (r.width - w) / 2, r.top - h - _offset];
      const fits = (p, [x, y]) => p === 'left' ? x >= _offset : p === 'right' ? x + w <= W - _offset
        : p === 'bottom' ? y + h <= H - _offset : y >= _offset;
      let p = _opp[position] ? position : 'top';
      let c = xy(p);
      if (!fits(p, c)) {
        p = _opp[p];
        c = fits(p, xy(p)) ? xy(p) : c;
      }
      tip.style.left = `${Math.max(_offset, Math.min(c[0], W - w - _offset)) + window.scrollX}px`;
      tip.style.top = `${Math.max(_offset, Math.min(c[1], H - h - _offset)) + window.scrollY}px`;
    };

    const _key = (e) => { if (e.key === 'Escape') hide(); };
    const _watch = (on) => {
      const f = on ? 'addEventListener' : 'removeEventListener';
      document[f]('keydown', _key);
      document[f]('scroll', _scroll, { capture: true, passive: true });
      window[f]('resize', _off);
    };
    const _off = () => hide();
    // Focus can scroll the target into view just after the tip opens: only a
    // scroll that moves the target away from the tip hides it.
    const _at = () => { const r = _cur.getBoundingClientRect(); return r.top + ',' + r.left; };
    const _scroll = () => { if (_at() !== _active._at) hide(); };

    /**
     * Show a tooltip
     * @param {string|HTMLElement} target - CSS selector or element to attach tooltip to
     * @param {string} text - Tooltip text content
     * @param {Object} options - Tooltip options
     * @param {string} options.position - Position: top, bottom, left, right (default: 'top')
     * @param {number} options.delay - Delay before show in ms (default: 0)
     */
    const show = (target, text, options = {}) => {
      const { position = 'top', delay = 0 } = options;
      const targetEl = _resolve(target);

      if (!targetEl) {
        console.warn('[Vitra Tooltip] Target element not found');
        return false;
      }

      // Hide any active tooltip first (also clears a pending one)
      hide();
      _cur = targetEl;

      _showTimeout = setTimeout(() => {
        const tooltipEl = document.createElement('div');
        const tooltipId = 'vitra-tt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
        tooltipEl.className = 'vitra-tooltip-js';
        tooltipEl.id = tooltipId;
        tooltipEl.setAttribute('role', 'tooltip');
        tooltipEl.textContent = text;

        // Add to (never replace) the author's aria-describedby list
        targetEl.setAttribute('aria-describedby',
          [targetEl.getAttribute('aria-describedby'), tooltipId].filter(Boolean).join(' '));

        document.body.appendChild(tooltipEl);
        _positionTooltip(targetEl, tooltipEl, position);

        // Show with animation (the opacity transition lives in CSS)
        setTimeout(() => {
          tooltipEl.style.opacity = '1';
        }, 10);

        _active = tooltipEl;
        tooltipEl._at = _at();
        tooltipEl._vitraTarget = targetEl;
        _watch(true);
      }, delay);

      return true;
    };

    /**
     * Hide the active tooltip
     * @param {string|HTMLElement} target - Optional target to hide tooltip for
     */
    const hide = (target) => {
      if (target && _resolve(target) !== _cur) return;
      clearTimeout(_showTimeout);
      _cur = null;

      // Only one tooltip is ever alive. Capture the node: the fade-out
      // timer must remove this node, not whichever tooltip is active then.
      const el = _active;
      _active = null;
      if (el) {
        _watch(false);
        const tg = el._vitraTarget;
        const rest = (tg.getAttribute('aria-describedby') || '').split(' ').filter(i => i && i !== el.id).join(' ');
        if (rest) tg.setAttribute('aria-describedby', rest);
        else tg.removeAttribute('aria-describedby');
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 200);
      }
    };

    const _open = (e) => {
      const t = e.pointerType === 'touch' ? null : e.target.closest?.(_SEL);
      if (t && t !== _cur) {
        show(t, t.getAttribute('data-vitra-tooltip'), {
          position: t.getAttribute('data-vitra-tooltip-position') || 'top',
          delay: +t.getAttribute('data-vitra-tooltip-delay') || 0
        });
      }
    };
    const _close = (e) => {
      const t = e.target.closest?.(_SEL);
      if (t && t === _cur && !t.contains(e.relatedTarget)) hide();
    };
    // Touch: a tap on a target shows, a tap anywhere else hides
    const _tap = (e) => {
      if (!_touch) return;
      if (e.target.closest?.(_SEL)) _open({ target: e.target });
      else hide();
    };
    const _events = [
      ['pointerenter', _open], ['focusin', _open],
      ['pointerleave', _close], ['focusout', _close],
      ['pointerdown', (e) => { _touch = e.pointerType === 'touch'; }],
      ['click', _tap]
    ];
    const _bind = (on) => _events.forEach(([n, f]) =>
      document[on ? 'addEventListener' : 'removeEventListener'](n, f, true));

    /**
     * Initialize tooltips: one delegated set of listeners on document, so
     * elements added later work too. Calling it again is a no-op.
     */
    const init = () => {
      if (!_bound) _bind(_bound = true);
    };

    /**
     * Destroy tooltip module - hide and unbind all
     */
    const destroy = () => {
      hide();
      document.querySelectorAll('.vitra-tooltip-js').forEach(n => n.remove());
      _bind(_bound = false);
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
        _container.setAttribute('role', 'status');
        _container.setAttribute('aria-live', 'polite');
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
     * @param {Object} options - Options (type: 'success'|'error'|'info'|'warning'|'default', duration: number, closable: boolean)
     */
    const show = (message, options = {}) => {
      const { type = 'default', duration = 3000, closable = false } = options;
      const container = _ensureContainer();

      const el = document.createElement('div');
      el.className = `vitra-toast`;
      if (type !== 'default') {
        el.classList.add(`vitra-toast-${type}`);
      }
      // role=alert is its own assertive live region; do not add aria-live
      if (type === 'error') el.setAttribute('role', 'alert');

      const text = document.createElement('span');
      text.className = 'vitra-toast-text';
      text.textContent = message;
      el.appendChild(text);
      container.appendChild(el);

      const dismiss = () => {
        el.classList.remove('show');
        _schedule(() => {
          if (el.parentNode === container) {
            container.removeChild(el);
          }
        }, 300); // Wait for transition
      };

      // A toast that never expires must be dismissable
      if (closable || duration === 0) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'vitra-toast-close';
        btn.setAttribute('aria-label', 'Close');
        btn.textContent = '×';
        btn.addEventListener('click', dismiss);
        el.appendChild(btn);
      }

      // Trigger animation
      _schedule(() => el.classList.add('show'), 10);

      if (duration > 0) _schedule(dismiss, duration);

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
    const _boundMenus = new WeakSet();

    // aria-expanded follows the popover's own state, so light dismiss
    // (outside click, Esc) is reflected too - not only toggle clicks.
    const _bindPopover = (menu, toggle) => {
      if (_boundMenus.has(menu)) return;
      _boundMenus.add(menu);
      menu.addEventListener('toggle', (ev) => {
        toggle.setAttribute('aria-expanded', String(ev.newState === 'open'));
      });
    };

    // A popover lives in the top layer: its containing block is the
    // viewport, so the stylesheet's `top: 100%` cannot anchor it to the
    // toggle. Place it under the toggle and keep it inside the viewport.
    const _placePopover = (menu, toggle) => {
      const gap = 8;
      const t = toggle.getBoundingClientRect();
      const m = menu.getBoundingClientRect();
      const alignEnd = menu.classList.contains('vitra-dropdown-menu-end');
      let left = alignEnd ? t.right - m.width : t.left;
      left = Math.max(gap, Math.min(left, window.innerWidth - m.width - gap));
      let top = t.bottom + gap;
      if (top + m.height > window.innerHeight - gap && t.top - gap - m.height >= gap) {
        top = t.top - gap - m.height;
      }
      menu.style.position = 'fixed';
      menu.style.margin = '0';
      menu.style.inset = `${top}px auto auto ${left}px`;
    };

    const _clickHandler = (e) => {
      const toggle = e.target.closest('[data-vitra-dropdown-toggle]');
      const dropdown = toggle ? toggle.closest('.vitra-dropdown') : null;
      const menu = dropdown ? dropdown.querySelector('.vitra-dropdown-menu') : null;

      // A click on an item inside an open popover menu closes it
      const item = e.target.closest('.vitra-dropdown-item');
      const itemMenu = item ? item.closest('.vitra-dropdown-menu[popover]') : null;
      if (_supportsPopover && itemMenu && itemMenu.matches(':popover-open')) {
        itemMenu.hidePopover();
      }

      if (_supportsPopover && menu && menu.hasAttribute('popover')) {
        // Popover API handles close-on-outside-click automatically
        if (toggle) {
          e.preventDefault();
          _bindPopover(menu, toggle);
          menu.togglePopover();
          if (menu.matches(':popover-open')) _placePopover(menu, toggle);
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

      // Opened with the keyboard (detail 0): focus the first enabled item
      _release();
      if (toggle && menu && e.detail === 0 && _isOpen(dropdown, menu)) {
        const first = _items(menu)[0];
        if (first) first.focus();
      }
    };

    const _isOpen = (dd, menu) =>
      _supportsPopover && menu.hasAttribute('popover') ? menu.matches(':popover-open') : dd.classList.contains('open');
    const _items = (menu) => [...menu.querySelectorAll('.vitra-dropdown-item')]
      .filter(i => !i.disabled && i.getAttribute('aria-disabled') !== 'true');

    // Transient guard: a Tab-closed menu is inert only while it is still
    // rendered and fading out (longer than the closing transition), so Tab
    // cannot step into it. It never persists.
    let _guardMenu = null;
    let _guardTimer = 0;
    const _release = () => {
      clearTimeout(_guardTimer);
      if (_guardMenu) _guardMenu.inert = false;
      _guardMenu = null;
    };

    // One delegated keydown: Esc, Tab and the arrow keys of an open menu
    const _keyHandler = (e) => {
      const k = e.key;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (k === 'Escape') {
        document.querySelectorAll('.vitra-dropdown.open').forEach(dd => {
          dd.classList.remove('open');
          const btn = dd.querySelector('[data-vitra-dropdown-toggle]');
          if (btn) {
            btn.setAttribute('aria-expanded', 'false');
            btn.focus();
          }
        });
        return;
      }
      const dd = e.target.closest && e.target.closest('.vitra-dropdown');
      const menu = dd && dd.querySelector('.vitra-dropdown-menu');
      const toggle = dd && dd.querySelector('[data-vitra-dropdown-toggle]');
      if (!menu || !toggle) return;
      const onToggle = e.target === toggle;
      if (!onToggle && !menu.contains(e.target)) return;
      if (e.target.closest('input, textarea, select, [contenteditable]')) return;
      const items = _items(menu);
      if (!_isOpen(dd, menu)) {
        // click() has detail 0, so the click handler focuses the first item
        if (onToggle && k === 'ArrowDown') { e.preventDefault(); toggle.click(); }
        return;
      }
      if (k === 'Tab') {
        // Close and make the menu unreachable at once (it stays rendered
        // while it fades out), then let Tab move on from the toggle
        _release();
        _guardMenu = menu;
        menu.inert = true;
        _guardTimer = setTimeout(_release, 400);
        if (!onToggle) {
          toggle.focus();
          if (e.shiftKey) e.preventDefault();
        }
        if (menu.hasAttribute('popover') && _supportsPopover) menu.hidePopover();
        else { dd.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
        return;
      }
      const i = onToggle ? -1 : items.indexOf(document.activeElement);
      const n = items.length;
      const to = k === 'ArrowDown' ? (i + 1) % n
        : k === 'ArrowUp' ? (i < 0 ? n - 1 : (i - 1 + n) % n)
        : k === 'Home' ? 0 : k === 'End' ? n - 1 : -1;
      if (to < 0 || !n) return;
      e.preventDefault();
      items[to].focus();
    };

    const init = () => {
      if (_initialized) return;
      document.addEventListener('click', _clickHandler);
      document.addEventListener('keydown', _keyHandler);
      _initialized = true;
    };

    const destroy = () => {
      _release();
      document.removeEventListener('click', _clickHandler);
      document.removeEventListener('keydown', _keyHandler);
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
    let _pending = null;

    const init = () => {
      if (initialized) return;
      // The glow is only visible on :hover, so only the spotlight under the
      // pointer needs its coordinates - resolved from the event target, not
      // by re-querying and measuring every .vitra-spotlight on the page.
      _handleMove = (e) => {
        const el = e.target instanceof Element ? e.target.closest('.vitra-spotlight') : null;
        if (!el) return;
        _pending = { el, x: e.clientX, y: e.clientY };
        if (_rafId) return;
        _rafId = requestAnimationFrame(() => {
          _rafId = null;
          const { el: target, x, y } = _pending;
          _pending = null;
          const rect = target.getBoundingClientRect();
          target.style.setProperty('--mouse-x', `${x - rect.left}px`);
          target.style.setProperty('--mouse-y', `${y - rect.top}px`);
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
      _pending = null;
      initialized = false;
    };

    return { init, destroy };
  })();

  // =========================================================================
  // SCENERY MODULE
  // Fills an empty .vitra-scenery / .vitra-scenery-inline element with its
  // eight layer divs, so the markup is one line instead of ten. Hand-written
  // layer markup keeps working untouched (CSS-only usage needs no JS at all).
  // =========================================================================
  const scenery = (() => {
    const SELECTOR = '.vitra-scenery, .vitra-scenery-inline';
    const LAYERS = ['sky', 'stars', 'clouds', 'halo', 'ridge-far', 'ridge-mid', 'ridge-near', 'grain'];

    let _mounted = [];

    const mount = (target, options = {}) => {
      const el = _resolve(target);
      if (!el) {
        console.warn('[Vitra Scenery] Target element not found');
        return null;
      }

      if (!el.matches(SELECTOR)) {
        el.classList.add(options.inline ? 'vitra-scenery-inline' : 'vitra-scenery');
      }
      // Purely decorative: keep it out of the accessibility tree
      el.setAttribute('aria-hidden', 'true');

      // Never touch a scene that already has (hand-written) layers
      if (el.children.length === 0) {
        LAYERS.forEach(name => {
          const layer = document.createElement('div');
          layer.className = `vitra-scenery-${name}`;
          el.appendChild(layer);
        });
        _mounted.push(el);
      }

      const moon = options.moon || el.dataset.vitraMoon;
      if (moon) {
        const halo = el.querySelector('.vitra-scenery-halo');
        if (halo) halo.classList.toggle('vitra-scenery-halo-crescent', moon === 'crescent');
      }

      return el;
    };

    const init = () => {
      let count = 0;
      document.querySelectorAll(SELECTOR).forEach(el => {
        if (el.children.length === 0) {
          mount(el);
          count++;
        }
      });
      return count;
    };

    const destroy = () => {
      _mounted.forEach(el => {
        el.querySelectorAll(':scope > [class^="vitra-scenery-"]').forEach(layer => layer.remove());
      });
      _mounted = [];
    };

    return { init, mount, destroy };
  })();

  // =========================================================================
  // MOTION GUARD MODULE
  // Pauses infinite ambient animations (glow orbs, aurora, mesh gradient,
  // gradient text, scenery) while
  // their container is offscreen, so long-running blur/transform loops
  // don't keep compositing every frame on sections the user has scrolled past.
  // =========================================================================
  const motionGuard = (() => {
    const SELECTOR = '.vitra-glow-orb, .vitra-aurora-bg, .vitra-aurora-layer, .vitra-aurora-layer-1, .vitra-aurora-layer-2, .vitra-gradient-bg, .vitra-gradient-text, .vitra-border-glow, .vitra-shape-morph, .vitra-gradient-rotate, .vitra-scenery, .vitra-scenery-inline';
    const PAUSED_CLASS = 'vitra-motion-paused';

    let _observer = null;
    let initialized = false;

    const init = () => {
      if (initialized) return;

      // Reduced-motion already collapses these animations via CSS;
      // nothing to pause, so skip setting up the observer entirely.
      if (_reducedMotion()) return;

      if (!('IntersectionObserver' in window)) {
        console.warn('[Vitra MotionGuard] IntersectionObserver not supported');
        return;
      }

      const elements = [...document.querySelectorAll(SELECTOR)];
      if (elements.length === 0) return;

      _observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          entry.target.classList.toggle(PAUSED_CLASS, !entry.isIntersecting);
        });
      }, { rootMargin: '50px' });

      elements.forEach(el => _observer.observe(el));
      initialized = true;
    };

    const destroy = () => {
      if (_observer) {
        _observer.disconnect();
        _observer = null;
      }
      document.querySelectorAll(`.${PAUSED_CLASS}`).forEach(el => {
        el.classList.remove(PAUSED_CLASS);
      });
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

    // data-config is an opt-out/tuning mechanism: default modules below must
    // initialize even when no [data-config] element exists on the page.
    let config = {};
    if (el) {
      try {
        config = JSON.parse(el.getAttribute('data-config')) || {};
      } catch (e) {
        console.warn('[Vitra] Failed to parse data-config:', e.message);
        config = {};
      }
    }

    // 1. Theme Configuration
    if (config.theme) {
      const themeOptions = typeof config.theme === 'object'
        ? config.theme
        : (typeof config.theme === 'string' ? { default: config.theme } : {});
      theme.init(themeOptions);
    }

    // 2. Particles Configuration
    if (config.particles) {
      if (config.particles === true) {
        particles.init();
      } else if (typeof config.particles === 'object') {
        particles.spawn(config.particles.count || 10, config.particles);
      }
    }

    // 3. Reveal Configuration
    if (config.reveal) {
      const revealOptions = typeof config.reveal === 'object' ? config.reveal : {};
      reveal.init(revealOptions);
    }

    // 4. Ripple Configuration
    if (config.ripple !== false) {
      ripple.init();
    }

    // 5. Tooltip Configuration
    if (config.tooltip !== false) {
      tooltip.init();
    }

    if (config.drawer !== false) {
      drawer.init();
    }

    // 6. Dropdown Configuration
    if (config.dropdown !== false) {
      dropdown.init();
    }

    // 7. Spotlight Configuration
    if (config.spotlight !== false) {
      spotlight.init();
    }

    // 8. Scenery Configuration (before the guard, which observes the result)
    if (config.scenery !== false) {
      scenery.init();
    }

    // 9. Motion Guard Configuration
    if (config.motionGuard !== false) {
      motionGuard.init();
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
      });
    } else {
      _parseDataConfig();
    }
  }

  // Global destroy: clean up all modules
  const destroyAll = () => {
    reveal.destroy();
    ripple.destroy();
    modal.destroy();
    drawer.destroy();
    tooltip.destroy();
    toast.destroy();
    dropdown.destroy();
    spotlight.destroy();
    particles.destroy();
    motionGuard.destroy();
    scenery.destroy();
  };

  // Public API
  return {
    theme,
    particles,
    reveal,
    ripple,
    modal,
    drawer,
    tooltip,
    toast,
    dropdown,
    spotlight,
    scenery,
    motionGuard,
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
