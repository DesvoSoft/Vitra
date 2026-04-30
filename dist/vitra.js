var Vitra = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/vitra.js
  var require_vitra = __commonJS({
    "src/vitra.js"(exports, module) {
      var Vitra = (() => {
        "use strict";
        const STORAGE_KEY = "vitra-theme";
        const VALID_THEMES = [
          "default",
          "light",
          "light-dark",
          "light-soft",
          "dark",
          "dark-light",
          "dark-deep",
          "pastel",
          "pastel-dark",
          "pastel-light",
          "neon",
          "neon-dark",
          "neon-light",
          "earth",
          "earth-dark",
          "earth-light",
          "mono",
          "mono-dark",
          "mono-light",
          "midnight",
          "midnight-dark",
          "midnight-light",
          "auto"
        ];
        let _prefersDarkMedia = null;
        let _prefersLightMedia = null;
        const theme = {
          /**
           * Get the current theme from DOM
           * @returns {string} Current theme name or 'default'
           */
          get() {
            const html = document.documentElement;
            return html.dataset.theme || "default";
          },
          /**
           * Set the theme on the document element
           * @param {string} themeName - Theme name to apply
           * @returns {boolean} Success status
           */
          set(themeName) {
            if (!VALID_THEMES.includes(themeName)) {
              console.warn(`[Vitra Theme] Invalid theme: "${themeName}". Valid themes: ${VALID_THEMES.join(", ")}`);
              return false;
            }
            const html = document.documentElement;
            html.dataset.theme = themeName;
            if (theme._isLocalStorageAvailable()) {
              try {
                localStorage.setItem(STORAGE_KEY, themeName);
              } catch (e) {
                console.warn("[Vitra Theme] Could not save theme to localStorage:", e.message);
              }
            }
            return true;
          },
          /**
           * Toggle between themes (smart: toggles current theme's light/dark variants)
           * @param {string} themeA - First theme (default: 'light')
           * @param {string} themeB - Second theme (default: 'dark')
           * @returns {string} The new active theme
           */
          toggle(themeA = "light", themeB = "dark") {
            const current = this.get();
            const darkVariants = ["dark", "dark-light", "dark-deep", "pastel-dark", "neon-dark", "earth-dark", "mono-dark", "midnight", "midnight-dark"];
            const lightVariants = ["light", "light-dark", "light-soft", "pastel", "pastel-light", "neon", "neon-light", "earth", "earth-light", "mono", "mono-light", "midnight-light"];
            if (darkVariants.includes(current)) {
              let nextTheme = themeA;
              if (current.startsWith("pastel")) nextTheme = "pastel";
              else if (current.startsWith("neon")) nextTheme = "neon";
              else if (current.startsWith("earth")) nextTheme = "earth";
              else if (current.startsWith("mono")) nextTheme = "mono";
              else if (current.startsWith("midnight")) nextTheme = "midnight-light";
              else if (current.startsWith("dark")) nextTheme = "light";
              this.set(nextTheme);
              return nextTheme;
            }
            if (lightVariants.includes(current)) {
              let nextTheme = themeB;
              if (current.startsWith("pastel")) nextTheme = "pastel-dark";
              else if (current.startsWith("neon")) nextTheme = "neon-dark";
              else if (current.startsWith("earth")) nextTheme = "earth-dark";
              else if (current.startsWith("mono")) nextTheme = "mono-dark";
              else if (current.startsWith("midnight")) nextTheme = "midnight";
              else if (current.startsWith("light")) nextTheme = "dark";
              this.set(nextTheme);
              return nextTheme;
            }
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
            const { defaultTheme = "auto", persist = true } = options;
            let themeToSet = null;
            if (theme._isLocalStorageAvailable()) {
              try {
                themeToSet = localStorage.getItem(STORAGE_KEY);
              } catch (e) {
              }
            }
            if (!themeToSet || !VALID_THEMES.includes(themeToSet)) {
              themeToSet = defaultTheme;
            }
            const html = document.documentElement;
            html.dataset.theme = themeToSet;
            if (persist && theme._isLocalStorageAvailable() && !localStorage.getItem(STORAGE_KEY)) {
              try {
                localStorage.setItem(STORAGE_KEY, themeToSet);
              } catch (e) {
              }
            }
            if (themeToSet === "auto") {
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
            if (current !== "auto") {
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
            if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
              return "dark";
            }
            return "light";
          },
          /**
           * Watch for system theme changes (when using 'auto' theme)
           * @private
           */
          _watchSystemTheme() {
            if (!window.matchMedia) return;
            const media = window.matchMedia("(prefers-color-scheme: dark)");
            if (typeof media.addEventListener === "function") {
              media.addEventListener("change", (e) => {
                if (theme.get() === "auto") {
                  const html = document.documentElement;
                  const currentTheme = html.dataset.theme;
                  html.dataset.theme = "";
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
              const test = "__vitra_test__";
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
        const particles = /* @__PURE__ */ (() => {
          let _activeParticles = [];
          let _maxParticles = 40;
          const _prefersReducedMotion = () => {
            return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          };
          const _getDeviceLimit = () => {
            if (window.innerWidth <= 768) {
              return 15;
            }
            return 40;
          };
          const spawn = (count, options = {}) => {
            if (_prefersReducedMotion()) {
              console.warn("[Vitra Particles] prefers-reduced-motion detected, skipping particle spawn");
              return 0;
            }
            const {
              color = "var(--vitra-color-accent, #6c63ff)",
              size = 4,
              emoji = null,
              container = "body"
            } = options;
            const limit = _getDeviceLimit();
            const availableSlots = limit - _activeParticles.length;
            const actualCount = Math.min(count, availableSlots);
            if (actualCount <= 0) {
              console.warn(`[Vitra Particles] Particle limit reached (${limit})`);
              return 0;
            }
            const targetContainer = document.querySelector(container) || document.body;
            for (let i = 0; i < actualCount; i++) {
              const particle = document.createElement("div");
              particle.className = "vitra-particle";
              if (emoji) {
                particle.setAttribute("data-emoji", emoji);
                particle.className = "vitra-particles-emoji";
                particle.style.fontSize = `${size * 4}px`;
                particle.textContent = emoji;
              } else {
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.background = color;
                particle.style.borderRadius = "50%";
                particle.style.position = "absolute";
                particle.style.top = `${Math.random() * 100}%`;
                particle.style.left = `${Math.random() * 100}%`;
              }
              particle.style.animationDuration = `${3 + Math.random() * 2}s`;
              particle.style.opacity = "0.7";
              targetContainer.appendChild(particle);
              _activeParticles.push(particle);
            }
            return actualCount;
          };
          const destroy = (count = null) => {
            let toRemove = count !== null ? Math.min(count, _activeParticles.length) : _activeParticles.length;
            const removed = _activeParticles.splice(0, toRemove);
            removed.forEach((p) => {
              if (p.parentNode) {
                p.parentNode.removeChild(p);
              }
            });
            return removed.length;
          };
          const limits = () => {
            return {
              max: _getDeviceLimit(),
              active: _activeParticles.length,
              available: _getDeviceLimit() - _activeParticles.length
            };
          };
          const init = () => {
            const containers = document.querySelectorAll("[data-vitra-particles]");
            containers.forEach((container) => {
              const count = parseInt(container.dataset.vitraParticles || "10", 10);
              const color = container.dataset.vitraParticleColor || void 0;
              const emoji = container.dataset.vitraParticleEmoji || null;
              spawn(count, { color, emoji, container: null });
              const jsParticles = document.querySelectorAll(".vitra-particle-js, .vitra-particles-emoji-js");
              jsParticles.forEach((p) => {
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
        const reveal = /* @__PURE__ */ (() => {
          let _observer = null;
          let _revealedElements = [];
          const _prefersReducedMotion = () => {
            return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          };
          const init = (options = {}) => {
            const {
              selector = ".vitra-reveal",
              threshold = 0.1,
              stagger = 100
            } = options;
            if (_prefersReducedMotion()) {
              const elements2 = document.querySelectorAll(selector);
              elements2.forEach((el) => {
                el.classList.add("vitra-revealed");
                el.style.opacity = "1";
                el.style.transform = "none";
              });
              return;
            }
            if (!("IntersectionObserver" in window)) {
              console.warn("[Vitra Reveal] IntersectionObserver not supported");
              return;
            }
            _observer = new IntersectionObserver((entries) => {
              entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                  setTimeout(() => {
                    entry.target.classList.add("vitra-revealed");
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "none";
                  }, index * stagger);
                  _observer.unobserve(entry.target);
                  _revealedElements.push(entry.target);
                }
              });
            }, { threshold });
            const elements = document.querySelectorAll(selector);
            elements.forEach((el) => {
              el.style.opacity = "0";
              el.style.transform = "translateY(20px)";
              el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
              _observer.observe(el);
            });
          };
          const count = () => {
            return _revealedElements.length;
          };
          const reset = () => {
            _revealedElements.forEach((el) => {
              el.classList.remove("vitra-revealed");
              el.style.opacity = "0";
              el.style.transform = "translateY(20px)";
            });
            _revealedElements = [];
          };
          return {
            init,
            count,
            reset
          };
        })();
        const modal = /* @__PURE__ */ (() => {
          let _activeModal = null;
          let _previousFocus = null;
          let _focusableElements = null;
          let _firstFocusable = null;
          let _lastFocusable = null;
          const open = (target, options = {}) => {
            const {
              closeOnOverlay = true,
              closeOnEsc = true
            } = options;
            const selector = typeof target === "string" ? target.startsWith("#") || target.startsWith(".") ? target : "#" + target : null;
            const modalEl = selector ? document.querySelector(selector) : typeof target === "object" ? target : null;
            if (!modalEl) {
              console.warn("[Vitra Modal] Modal element not found");
              return false;
            }
            if (_activeModal) {
              close();
            }
            _activeModal = modalEl;
            _previousFocus = document.activeElement;
            modalEl.classList.add("vitra-modal-open");
            modalEl.setAttribute("open", "");
            modalEl.setAttribute("aria-hidden", "false");
            _setupFocusTrap(modalEl);
            if (closeOnOverlay) {
              const overlay = modalEl;
              overlay.addEventListener("click", (e) => {
                if (e.target === overlay) {
                  close();
                }
              });
            }
            if (closeOnEsc) {
              document.addEventListener("keydown", _handleEsc);
            }
            const closeButtons = modalEl.querySelectorAll("[data-vitra-modal-close]");
            closeButtons.forEach((btn) => {
              btn.addEventListener("click", () => close());
            });
            return true;
          };
          const close = () => {
            if (!_activeModal) return;
            _activeModal.classList.remove("vitra-modal-open");
            _activeModal.removeAttribute("open");
            _activeModal.setAttribute("aria-hidden", "true");
            document.removeEventListener("keydown", _handleEsc);
            if (_previousFocus && _previousFocus.focus) {
              _previousFocus.focus();
            }
            _activeModal = null;
            _previousFocus = null;
          };
          const _setupFocusTrap = (modalEl) => {
            const focusableSelectors = [
              "a[href]",
              "button:not([disabled])",
              "input:not([disabled])",
              "textarea:not([disabled])",
              "select:not([disabled])",
              '[tabindex]:not([tabindex="-1"])'
            ].join(", ");
            _focusableElements = modalEl.querySelectorAll(focusableSelectors);
            _focusableElements = Array.from(_focusableElements);
            if (_focusableElements.length === 0) return;
            _firstFocusable = _focusableElements[0];
            _lastFocusable = _focusableElements[_focusableElements.length - 1];
            modalEl.addEventListener("keydown", _handleTabKey);
            setTimeout(() => _firstFocusable.focus(), 100);
          };
          const _handleTabKey = (e) => {
            if (e.key !== "Tab") return;
            if (e.shiftKey) {
              if (document.activeElement === _firstFocusable) {
                e.preventDefault();
                _lastFocusable.focus();
              }
            } else {
              if (document.activeElement === _lastFocusable) {
                e.preventDefault();
                _firstFocusable.focus();
              }
            }
          };
          const _handleEsc = (e) => {
            if (e.key === "Escape") {
              close();
            }
          };
          return {
            open,
            close
          };
        })();
        const tooltip = /* @__PURE__ */ (() => {
          let _activeTooltip = null;
          const _offset = 8;
          const show = (target, text, options = {}) => {
            const {
              position = "top",
              delay = 0
            } = options;
            const targetEl = typeof target === "string" ? document.querySelector(target) : target;
            if (!targetEl) {
              console.warn("[Vitra Tooltip] Target element not found");
              return false;
            }
            hide();
            setTimeout(() => {
              const tooltipEl = document.createElement("div");
              tooltipEl.className = "vitra-tooltip-js";
              tooltipEl.setAttribute("role", "tooltip");
              tooltipEl.textContent = text;
              tooltipEl.style.position = "absolute";
              tooltipEl.style.zIndex = "9999";
              tooltipEl.style.background = "var(--vitra-color-bg, #0f0f14)";
              tooltipEl.style.color = "var(--vitra-color-text-primary, #ffffff)";
              tooltipEl.style.border = "1px solid var(--vitra-color-border, #2a2a35)";
              tooltipEl.style.borderRadius = "var(--vitra-radius-sm, 4px)";
              tooltipEl.style.padding = "var(--vitra-space-1, 4px) var(--vitra-space-2, 8px)";
              tooltipEl.style.fontSize = "var(--vitra-font-size-sm, 0.875rem)";
              tooltipEl.style.whiteSpace = "nowrap";
              tooltipEl.style.pointerEvents = "none";
              tooltipEl.style.opacity = "0";
              tooltipEl.style.transition = "opacity 0.2s ease";
              document.body.appendChild(tooltipEl);
              _positionTooltip(targetEl, tooltipEl, position);
              setTimeout(() => {
                tooltipEl.style.opacity = "1";
              }, 10);
              _activeTooltip = tooltipEl;
              targetEl._vitraTooltip = tooltipEl;
            }, delay);
            return true;
          };
          const _positionTooltip = (target, tooltip2, position) => {
            const targetRect = target.getBoundingClientRect();
            const tooltipRect = tooltip2.getBoundingClientRect();
            let top, left;
            switch (position) {
              case "bottom":
                top = targetRect.bottom + _offset;
                left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                break;
              case "left":
                top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
                left = targetRect.left - tooltipRect.width - _offset;
                break;
              case "right":
                top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
                left = targetRect.right + _offset;
                break;
              case "top":
              default:
                top = targetRect.top - tooltipRect.height - _offset;
                left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                break;
            }
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            if (left + tooltipRect.width > viewportWidth) {
              left = viewportWidth - tooltipRect.width - 8;
            }
            if (left < 0) {
              left = 8;
            }
            if (top + tooltipRect.height > viewportHeight) {
              top = targetRect.top - tooltipRect.height - _offset;
            }
            if (top < 0) {
              top = targetRect.bottom + _offset;
            }
            tooltip2.style.top = `${top}px`;
            tooltip2.style.left = `${left}px`;
          };
          const hide = (target = null) => {
            if (_activeTooltip) {
              _activeTooltip.style.opacity = "0";
              setTimeout(() => {
                if (_activeTooltip && _activeTooltip.parentNode) {
                  _activeTooltip.parentNode.removeChild(_activeTooltip);
                }
              }, 200);
              _activeTooltip = null;
            }
            if (target) {
              const targetEl = typeof target === "string" ? document.querySelector(target) : target;
              if (targetEl && targetEl._vitraTooltip) {
                targetEl._vitraTooltip.style.opacity = "0";
                setTimeout(() => {
                  if (targetEl._vitraTooltip && targetEl._vitraTooltip.parentNode) {
                    targetEl._vitraTooltip.parentNode.removeChild(targetEl._vitraTooltip);
                  }
                  targetEl._vitraTooltip = null;
                }, 200);
              }
            }
          };
          const init = () => {
            const elements = document.querySelectorAll("[data-vitra-tooltip]");
            elements.forEach((el) => {
              const text = el.getAttribute("data-vitra-tooltip");
              const position = el.getAttribute("data-vitra-tooltip-position") || "top";
              const delay = parseInt(el.getAttribute("data-vitra-tooltip-delay") || "0", 10);
              el.addEventListener("mouseenter", () => show(el, text, { position, delay }));
              el.addEventListener("mouseleave", () => hide(el));
              el.addEventListener("focus", () => show(el, text, { position, delay }));
              el.addEventListener("blur", () => hide(el));
            });
          };
          return {
            show,
            hide,
            init
          };
        })();
        const _parseDataConfig = () => {
          const elements = document.querySelectorAll("[data-config]");
          elements.forEach((el) => {
            try {
              const config = JSON.parse(el.getAttribute("data-config"));
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
              }
              if (config.tooltip) {
                if (config.tooltip.init) {
                  Vitra.tooltip.init();
                }
              }
            } catch (e) {
              console.warn("[Vitra] Failed to parse data-config:", e.message);
            }
          });
        };
        if (typeof document !== "undefined") {
          if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {
              _parseDataConfig();
            });
          } else {
            _parseDataConfig();
          }
        }
        return {
          theme,
          particles,
          reveal,
          modal,
          tooltip
        };
      })();
      if (typeof module !== "undefined" && module.exports) {
        module.exports = Vitra;
      }
      if (typeof window !== "undefined") {
        window.Vitra = Vitra;
      }
    }
  });
  return require_vitra();
})();
//# sourceMappingURL=vitra.js.map
