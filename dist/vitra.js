var Vitra = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // src/vitra.js
  var require_vitra = __commonJS({
    "src/vitra.js"(exports, module) {
      var Vitra = (() => {
        "use strict";
        const STORAGE_KEY = "vitra-theme";
        const VALID_THEMES = Object.freeze(["light", "dark", "auto", "pastel", "neon", "ocean", "emerald"]);
        const theme = {
          /**
           * Get the current theme from DOM
           * @returns {string} Current theme name or 'auto'
           */
          get() {
            const html = document.documentElement;
            return html.dataset.theme || "auto";
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
            const announcer = document.getElementById("vitra-theme-announcer") || (() => {
              const el = document.createElement("div");
              el.id = "vitra-theme-announcer";
              el.setAttribute("aria-live", "polite");
              el.setAttribute("aria-atomic", "true");
              el.style.cssText = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
              document.body.appendChild(el);
              return el;
            })();
            announcer.textContent = `Theme changed to ${themeName}`;
            if (theme._isLocalStorageAvailable()) {
              try {
                localStorage.setItem(STORAGE_KEY, themeName);
              } catch (e) {
                console.warn("[Vitra Theme] Could not save theme to localStorage:", e.message);
              }
            }
            if (themeName === "auto") {
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
            if (current === "light") {
              next = "dark";
            } else if (current === "dark") {
              next = "light";
            } else if (current === "auto") {
              const effective = this.getEffective();
              next = effective === "dark" ? "light" : "dark";
            } else {
              next = "light";
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
            if (theme._mediaChangeHandler) {
              if (typeof media.removeEventListener === "function") {
                media.removeEventListener("change", theme._mediaChangeHandler);
              } else if (typeof media.removeListener === "function") {
                media.removeListener(theme._mediaChangeHandler);
              }
            }
            theme._mediaChangeHandler = () => {
              if (theme.get() === "auto") {
                document.documentElement.dataset.theme = "auto";
              }
            };
            if (typeof media.addEventListener === "function") {
              media.addEventListener("change", theme._mediaChangeHandler);
            } else if (typeof media.addListener === "function") {
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
              if (typeof window === "undefined" || !window.localStorage) return false;
              const test = "__vitra_test__";
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
              container
            } = options;
            const limit = _getDeviceLimit();
            const availableSlots = limit - _activeParticles.length;
            const actualCount = Math.min(count, availableSlots);
            if (actualCount <= 0) {
              console.warn(`[Vitra Particles] Particle limit reached (${limit})`);
              return 0;
            }
            const targetContainer = container ? typeof container === "string" ? document.querySelector(container) || document.body : container instanceof Element ? container : document.body : document.body;
            for (let i = 0; i < actualCount; i++) {
              const particle = document.createElement("div");
              particle.className = "vitra-particle";
              if (emoji) {
                particle.setAttribute("data-emoji", emoji);
                particle.className = "vitra-particles-emoji";
                particle.style.fontSize = `${size * 4}px`;
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
              stagger = 100,
              scrollReveal = false
            } = options;
            let elements = [];
            if (scrollReveal) {
              const scrollSelectors = ".vitra-scroll-reveal, .vitra-scroll-reveal-left, .vitra-scroll-reveal-right, .vitra-scroll-reveal-scale";
              const scrollElements = document.querySelectorAll(scrollSelectors);
              scrollElements.forEach((el) => {
                el.classList.add("vitra-scroll-reveal-observer");
              });
              elements = [...document.querySelectorAll(selector)];
              elements.push(...scrollElements);
            } else {
              elements = [...document.querySelectorAll(selector)];
            }
            if (_prefersReducedMotion()) {
              elements.forEach((el) => {
                if (el.classList.contains("vitra-scroll-reveal-observer")) {
                  el.classList.add("vitra-scroll-revealed");
                } else {
                  el.classList.add("vitra-revealed");
                }
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
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  const index = elements.indexOf(entry.target);
                  setTimeout(() => {
                    if (entry.target.classList.contains("vitra-scroll-reveal-observer")) {
                      entry.target.classList.add("vitra-scroll-revealed");
                    } else {
                      entry.target.classList.add("vitra-revealed");
                    }
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "none";
                  }, index * stagger);
                  _observer.unobserve(entry.target);
                  _revealedElements.push(entry.target);
                }
              });
            }, { threshold });
            elements.forEach((el) => {
              if (el.classList.contains("vitra-scroll-reveal-observer")) {
                if (el.classList.contains("vitra-scroll-reveal-left")) {
                  el.style.transform = "translateX(-40px)";
                } else if (el.classList.contains("vitra-scroll-reveal-right")) {
                  el.style.transform = "translateX(40px)";
                } else if (el.classList.contains("vitra-scroll-reveal-scale")) {
                  el.style.transform = "scale(0.8)";
                } else {
                  el.style.transform = "translateY(40px)";
                }
                el.style.transition = "opacity 1s cubic-bezier(0.23, 1, 0.32, 1), transform 1s cubic-bezier(0.23, 1, 0.32, 1)";
              } else {
                el.style.transform = "translateY(20px)";
                el.style.transition = "opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1), transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
              }
              el.style.opacity = "0";
              _observer.observe(el);
            });
          };
          const count = () => {
            return _revealedElements.length;
          };
          const reset = () => {
            _revealedElements.forEach((el) => {
              if (el.classList.contains("vitra-scroll-reveal-observer")) {
                el.classList.remove("vitra-scroll-revealed");
                el.style.opacity = "0";
                if (el.classList.contains("vitra-scroll-reveal-left")) {
                  el.style.transform = "translateX(-40px)";
                } else if (el.classList.contains("vitra-scroll-reveal-right")) {
                  el.style.transform = "translateX(40px)";
                } else if (el.classList.contains("vitra-scroll-reveal-scale")) {
                  el.style.transform = "scale(0.8)";
                } else {
                  el.style.transform = "translateY(40px)";
                }
              } else {
                el.classList.remove("vitra-revealed");
                el.style.opacity = "0";
                el.style.transform = "translateY(20px)";
              }
            });
            _revealedElements = [];
          };
          const destroy = () => {
            if (_observer) {
              _observer.disconnect();
              _observer = null;
            }
            _revealedElements.forEach((el) => {
              el.style.opacity = "";
              el.style.transform = "";
              el.style.transition = "";
              if (el.classList.contains("vitra-scroll-reveal-observer")) {
                el.classList.remove("vitra-scroll-revealed");
                el.classList.remove("vitra-scroll-reveal-observer");
              } else {
                el.classList.remove("vitra-revealed");
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
        const ripple = /* @__PURE__ */ (() => {
          let _clickHandler = null;
          const init = () => {
            if (_clickHandler) return;
            _clickHandler = (e) => {
              const target = e.target.closest(".vitra-ripple");
              if (!target) return;
              const rect = target.getBoundingClientRect();
              const size = Math.max(rect.width, rect.height);
              const x = e.clientX - rect.left - size / 2;
              const y = e.clientY - rect.top - size / 2;
              const span = document.createElement("span");
              span.className = "vitra-ripple-effect";
              span.style.width = `${size}px`;
              span.style.height = `${size}px`;
              span.style.left = `${x}px`;
              span.style.top = `${y}px`;
              target.appendChild(span);
              span.addEventListener("animationend", () => span.remove(), { once: true });
            };
            document.addEventListener("click", _clickHandler);
          };
          const destroy = () => {
            if (_clickHandler) {
              document.removeEventListener("click", _clickHandler);
              _clickHandler = null;
            }
          };
          return { init, destroy };
        })();
        const modal = /* @__PURE__ */ (() => {
          let _activeModal = null;
          let _previousFocus = null;
          let _focusableElements = null;
          let _firstFocusable = null;
          let _tabKeyTarget = null;
          let _lastFocusable = null;
          let _overlayClickHandler = null;
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
            modalEl.setAttribute("role", "dialog");
            modalEl.setAttribute("aria-modal", "true");
            modalEl.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
            modalEl.classList.add("vitra-modal-open");
            modalEl.setAttribute("open", "");
            _setupFocusTrap(modalEl);
            if (closeOnOverlay) {
              if (_overlayClickHandler) {
                modalEl.removeEventListener("click", _overlayClickHandler);
              }
              _overlayClickHandler = (e) => {
                if (e.target === modalEl) {
                  close();
                }
              };
              modalEl.addEventListener("click", _overlayClickHandler);
            }
            if (closeOnEsc) {
              document.removeEventListener("keydown", _handleEsc);
              document.addEventListener("keydown", _handleEsc);
            }
            const closeButtons = modalEl.querySelectorAll("[data-vitra-modal-close]");
            closeButtons.forEach((btn) => {
              btn.removeEventListener("click", close);
              btn.addEventListener("click", close);
            });
            return true;
          };
          const close = () => {
            if (!_activeModal) return;
            _activeModal.classList.remove("vitra-modal-open");
            _activeModal.removeAttribute("open");
            _activeModal.removeAttribute("role");
            _activeModal.removeAttribute("aria-modal");
            _activeModal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
            document.removeEventListener("keydown", _handleEsc);
            if (_tabKeyTarget) {
              _tabKeyTarget.removeEventListener("keydown", _handleTabKey);
              _tabKeyTarget = null;
            }
            if (_overlayClickHandler) {
              _activeModal.removeEventListener("click", _overlayClickHandler);
              _overlayClickHandler = null;
            }
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
            _focusableElements = Array.from(modalEl.querySelectorAll(focusableSelectors));
            if (_focusableElements.length === 0) return;
            _firstFocusable = _focusableElements[0];
            _lastFocusable = _focusableElements[_focusableElements.length - 1];
            if (_tabKeyTarget) {
              _tabKeyTarget.removeEventListener("keydown", _handleTabKey);
            }
            _tabKeyTarget = modalEl;
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
          const destroy = () => {
            if (_activeModal) {
              close();
            }
            document.removeEventListener("keydown", _handleEsc);
          };
          return {
            open,
            close,
            destroy
          };
        })();
        const tooltip = /* @__PURE__ */ (() => {
          let _activeTooltip = null;
          let _showTimeout = null;
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
            if (_showTimeout) {
              clearTimeout(_showTimeout);
              _showTimeout = null;
            }
            _showTimeout = setTimeout(() => {
              const tooltipEl = document.createElement("div");
              const tooltipId = "vitra-tt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
              tooltipEl.className = "vitra-tooltip-js";
              tooltipEl.id = tooltipId;
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
              tooltipEl.style.whiteSpace = "normal";
              tooltipEl.style.wordWrap = "break-word";
              tooltipEl.style.maxWidth = "90vw";
              tooltipEl.style.pointerEvents = "none";
              tooltipEl.style.opacity = "0";
              tooltipEl.style.transition = "opacity 0.2s ease";
              targetEl.setAttribute("aria-describedby", tooltipId);
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
            tooltip2.style.top = `${top + window.scrollY}px`;
            tooltip2.style.left = `${left + window.scrollX}px`;
          };
          const _removeDescribedBy = (target) => {
            if (target && target.getAttribute("aria-describedby")?.startsWith("vitra-tt-")) {
              target.removeAttribute("aria-describedby");
            }
          };
          const hide = (target = null) => {
            if (_showTimeout) {
              clearTimeout(_showTimeout);
              _showTimeout = null;
            }
            if (_activeTooltip) {
              _removeDescribedBy(document.querySelector(`[aria-describedby="${_activeTooltip.id}"]`));
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
                _removeDescribedBy(targetEl);
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
          const destroy = () => {
            hide();
            const elements = document.querySelectorAll("[data-vitra-tooltip]");
            elements.forEach((el) => {
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
        const toast = /* @__PURE__ */ (() => {
          let _container = null;
          const _pendingTimeouts = /* @__PURE__ */ new Set();
          const _ensureContainer = () => {
            if (!_container) {
              _container = document.createElement("div");
              _container.className = "vitra-toast-container";
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
          const show = (message, options = {}) => {
            const { type = "default", duration = 3e3 } = options;
            const container = _ensureContainer();
            const el = document.createElement("div");
            el.className = `vitra-toast`;
            if (type !== "default") {
              el.classList.add(`vitra-toast-${type}`);
            }
            el.textContent = message;
            container.appendChild(el);
            _schedule(() => el.classList.add("show"), 10);
            if (duration > 0) {
              _schedule(() => {
                el.classList.remove("show");
                _schedule(() => {
                  if (el.parentNode === container) {
                    container.removeChild(el);
                  }
                }, 300);
              }, duration);
            }
            return el;
          };
          const destroy = () => {
            _pendingTimeouts.forEach((id) => clearTimeout(id));
            _pendingTimeouts.clear();
            if (_container && _container.parentNode) {
              _container.parentNode.removeChild(_container);
            }
            _container = null;
          };
          return { show, destroy };
        })();
        const dropdown = (() => {
          const _supportsPopover = typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;
          let _initialized = false;
          const _clickHandler = (e) => {
            const toggle = e.target.closest("[data-vitra-dropdown-toggle]");
            const dropdown2 = toggle ? toggle.closest(".vitra-dropdown") : null;
            const menu = dropdown2 ? dropdown2.querySelector(".vitra-dropdown-menu") : null;
            if (_supportsPopover && menu && menu.hasAttribute("popover")) {
              if (toggle) {
                e.preventDefault();
                menu.togglePopover();
                const isOpen = menu.matches(":popover-open");
                toggle.setAttribute("aria-expanded", String(isOpen));
              }
            } else {
              document.querySelectorAll(".vitra-dropdown.open").forEach((dd) => {
                if (!toggle || dd !== dropdown2) {
                  dd.classList.remove("open");
                  const btn = dd.querySelector("[data-vitra-dropdown-toggle]");
                  if (btn) btn.setAttribute("aria-expanded", "false");
                }
              });
              if (toggle) {
                e.preventDefault();
                if (dropdown2) {
                  dropdown2.classList.toggle("open");
                  const isOpen = dropdown2.classList.contains("open");
                  toggle.setAttribute("aria-expanded", String(isOpen));
                }
              }
            }
          };
          const init = () => {
            if (_initialized) return;
            document.addEventListener("click", _clickHandler);
            _initialized = true;
          };
          const destroy = () => {
            document.removeEventListener("click", _clickHandler);
            _initialized = false;
          };
          return { init, destroy };
        })();
        const spotlight = /* @__PURE__ */ (() => {
          let initialized = false;
          let _rafId = null;
          let _handleMove = null;
          const init = () => {
            if (initialized) return;
            _handleMove = (e) => {
              if (_rafId) return;
              _rafId = requestAnimationFrame(() => {
                _rafId = null;
                const spotlights = document.querySelectorAll(".vitra-spotlight");
                spotlights.forEach((el) => {
                  const rect = el.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  el.style.setProperty("--mouse-x", `${x}px`);
                  el.style.setProperty("--mouse-y", `${y}px`);
                });
              });
            };
            document.addEventListener("mousemove", _handleMove, { passive: true });
            initialized = true;
          };
          const destroy = () => {
            if (_handleMove) {
              document.removeEventListener("mousemove", _handleMove);
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
        const _parseDataConfig = () => {
          const el = document.querySelector("[data-config]");
          if (!el) return;
          try {
            const config = JSON.parse(el.getAttribute("data-config"));
            if (config.theme) {
              const themeOptions = typeof config.theme === "object" ? config.theme : typeof config.theme === "string" ? { default: config.theme } : {};
              Vitra.theme.init(themeOptions);
            }
            if (config.particles) {
              if (config.particles === true) {
                Vitra.particles.init();
              } else if (typeof config.particles === "object") {
                Vitra.particles.spawn(config.particles.count || 10, config.particles);
              }
            }
            if (config.reveal) {
              const revealOptions = typeof config.reveal === "object" ? config.reveal : {};
              Vitra.reveal.init(revealOptions);
            }
            if (config.ripple !== false) {
              Vitra.ripple.init();
            }
            if (config.tooltip !== false) {
              Vitra.tooltip.init();
            }
          } catch (e) {
            console.warn("[Vitra] Failed to parse data-config:", e.message);
          }
        };
        (() => {
          try {
            if (typeof window === "undefined" || !window.localStorage) return;
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && VALID_THEMES.includes(saved)) {
              document.documentElement.dataset.theme = saved;
            }
          } catch (e) {
          }
        })();
        if (typeof document !== "undefined") {
          if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {
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
