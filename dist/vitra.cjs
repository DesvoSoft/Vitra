"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/vitra.js
var vitra_exports = {};
__export(vitra_exports, {
  default: () => vitra_default,
  destroyAll: () => destroyAll,
  drawer: () => drawer,
  dropdown: () => dropdown,
  modal: () => modal,
  motionGuard: () => motionGuard,
  particles: () => particles,
  reveal: () => reveal,
  ripple: () => ripple,
  scenery: () => scenery,
  spotlight: () => spotlight,
  theme: () => theme,
  toast: () => toast,
  tooltip: () => tooltip
});
module.exports = __toCommonJS(vitra_exports);
var _bad = /* @__PURE__ */ new Set();
var _q = (s, m, all) => {
  try {
    return all ? [...document.querySelectorAll(s)] : document.querySelector(s);
  } catch (e) {
    if (!_bad.has(s)) console.warn(`[Vitra ${m}] Invalid selector "${s}"`);
    _bad.add(s);
    return all ? [] : null;
  }
};
var _resolve = (t, m) => typeof t === "string" ? _q(t, m) : t && t.nodeType === 1 ? t : null;
var _reducedMotion = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
var _FOCUSABLE = 'a[href],button,input:not([type=hidden]),textarea,select,summary,[tabindex],[contenteditable=""],[contenteditable="true"]';
var _focusables = (root) => Array.from(root.querySelectorAll(_FOCUSABLE)).filter((el) => {
  if (el.tabIndex < 0 || el.matches(":disabled") || getComputedStyle(el).visibility === "hidden") return false;
  for (let n = el; n; n = n.parentElement) {
    if (n.hidden || n.hasAttribute("inert") || getComputedStyle(n).display === "none") return false;
    if (n === root) break;
  }
  return true;
});
var _traps = [];
var _trapFocus = (root, home = root) => {
  const hadTabindex = home.getAttribute("tabindex");
  if (hadTabindex === null) home.setAttribute("tabindex", "-1");
  let r1, r2;
  const focusFirst = () => (_focusables(root)[0] || home).focus();
  const onKey = (e) => {
    if (e.key !== "Tab" || _traps[_traps.length - 1] !== onKey) return;
    const list = _focusables(root);
    const first = list[0] || home;
    const last = list[list.length - 1] || home;
    const active = document.activeElement;
    if (active === (e.shiftKey ? first : last) || active === home || !root.contains(active)) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  };
  document.addEventListener("keydown", onKey);
  _traps.push(onKey);
  focusFirst();
  if (!root.contains(document.activeElement)) {
    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(focusFirst);
    });
  }
  return () => {
    document.removeEventListener("keydown", onKey);
    if (_traps.includes(onKey)) _traps.splice(_traps.indexOf(onKey), 1);
    cancelAnimationFrame(r1);
    cancelAnimationFrame(r2);
    if (hadTabindex === null) home.removeAttribute("tabindex");
    else home.setAttribute("tabindex", hadTabindex);
  };
};
var _escTaken;
var _scrollLocks = 0;
var _savedBody;
var _lockScroll = () => {
  const b = document.body;
  if (!_scrollLocks++) {
    _savedBody = [b.style.overflow, b.style.paddingRight];
    const gap = document.documentElement.clientWidth && window.innerWidth - document.documentElement.clientWidth;
    b.style.overflow = "hidden";
    if (gap > 0) b.style.paddingRight = (parseFloat(getComputedStyle(b).paddingRight) || 0) + gap + "px";
  }
  let done = false;
  return () => {
    if (done) return;
    done = true;
    if (!--_scrollLocks) [b.style.overflow, b.style.paddingRight] = _savedBody;
  };
};
var STORAGE_KEY = "vitra-theme";
var VALID_THEMES = Object.freeze(["light", "dark", "auto", "pastel", "neon", "ocean", "emerald"]);
var theme = {
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
  set(themeName, options = {}) {
    if (!VALID_THEMES.includes(themeName)) {
      console.warn(`[Vitra Theme] Invalid theme: "${themeName}". Valid themes: ${VALID_THEMES.join(", ")}`);
      return false;
    }
    const html = document.documentElement;
    const animate = options.transition !== void 0 ? options.transition : theme._transition;
    if (animate && html.dataset.theme !== themeName && typeof document.startViewTransition === "function" && !_reducedMotion()) {
      theme._reveal(themeName, options.origin);
    } else {
      html.dataset.theme = themeName;
    }
    const announcer = document.getElementById("vitra-theme-announcer") || document.body && (() => {
      const el = document.createElement("div");
      el.id = "vitra-theme-announcer";
      el.setAttribute("aria-live", "polite");
      el.setAttribute("aria-atomic", "true");
      el.style.cssText = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
      document.body.appendChild(el);
      return el;
    })();
    if (announcer) announcer.textContent = `Theme changed to ${themeName}`;
    if (theme._persist) {
      try {
        localStorage.setItem(STORAGE_KEY, themeName);
      } catch (e) {
      }
    }
    return true;
  },
  /**
   * Toggle between light and dark themes
   * @returns {string} The new active theme
   */
  toggle(options) {
    const current = theme.get();
    let next;
    if (current === "light") {
      next = "dark";
    } else if (current === "dark") {
      next = "light";
    } else if (current === "auto") {
      const effective = theme.getEffective();
      next = effective === "dark" ? "light" : "dark";
    } else {
      next = "light";
    }
    theme.set(next, options);
    return next;
  },
  // Animated theme swaps are opt-in: theme.init({ transition: true }),
  // or per call via set(name, { transition: true }).
  _transition: false,
  _persist: true,
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
    if (origin && typeof origin.clientX === "number") {
      x = origin.clientX;
      y = origin.clientY;
    } else if (origin && typeof origin.getBoundingClientRect === "function") {
      const rect = origin.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else if (origin && typeof origin.x === "number") {
      x = origin.x;
      y = origin.y;
    }
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    html.style.setProperty("--vitra-theme-x", `${x}px`);
    html.style.setProperty("--vitra-theme-y", `${y}px`);
    html.style.setProperty("--vitra-theme-r", `${Math.ceil(r)}px`);
    html.classList.add("vitra-theme-transition");
    const done = () => html.classList.remove("vitra-theme-transition");
    try {
      const vt = document.startViewTransition(() => {
        html.dataset.theme = themeName;
      });
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
    const { defaultTheme = options.default || "auto", persist = true } = options;
    theme._transition = options.transition === true;
    theme._persist = persist;
    let themeToSet = null;
    try {
      themeToSet = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
    }
    if (!themeToSet || !VALID_THEMES.includes(themeToSet)) {
      themeToSet = defaultTheme;
    }
    const html = document.documentElement;
    html.dataset.theme = themeToSet;
    try {
      if (persist && !localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STORAGE_KEY, themeToSet);
    } catch (e) {
    }
    return themeToSet;
  },
  /**
   * Get the effective theme (resolves 'auto' to actual theme)
   * @returns {string} The effective theme name
   */
  getEffective() {
    const current = theme.get();
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
   * Clear stored theme preference
   */
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
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
var particles = /* @__PURE__ */ (() => {
  let _activeParticles = [];
  const _getDeviceLimit = () => {
    if (window.innerWidth <= 768) {
      return 15;
    }
    return 40;
  };
  const _DIRECTION_ANGLES = {
    down: 180,
    "down-left": 210,
    "down-right": 150
  };
  const _prune = () => {
    _activeParticles = _activeParticles.filter((p) => p.isConnected);
  };
  const _resolveAngle = (direction) => {
    if (typeof direction === "number") {
      return direction;
    }
    if (Object.hasOwn(_DIRECTION_ANGLES, direction)) {
      return _DIRECTION_ANGLES[direction];
    }
    console.warn(`[Vitra Particles] Unknown direction "${direction}", falling back to "down"`);
    return _DIRECTION_ANGLES.down;
  };
  const spawn = (count, options = {}) => {
    if (_reducedMotion()) {
      console.warn("[Vitra Particles] prefers-reduced-motion detected, skipping particle spawn");
      return 0;
    }
    const {
      color = "var(--vitra-color-accent, #6c63ff)",
      size = 4,
      emoji = null,
      container,
      direction = null
    } = options;
    const limit = _getDeviceLimit();
    _prune();
    const availableSlots = limit - _activeParticles.length;
    const actualCount = Math.min(count, availableSlots);
    if (actualCount <= 0) {
      console.warn(`[Vitra Particles] Particle limit reached (${limit})`);
      return 0;
    }
    const targetContainer = container ? _resolve(container, "Particles") || document.body : document.body;
    const angle = direction !== null ? _resolveAngle(direction) : null;
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
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = angle !== null ? `${Math.random() * -20}%` : `${Math.random() * 100}%`;
      }
      particle.style.animationDuration = `${3 + Math.random() * 2}s`;
      particle.style.opacity = "0.7";
      if (angle !== null) {
        const angleRad = angle * Math.PI / 180;
        const driftDistance = 60 + Math.random() * 60;
        const driftX = Math.sin(angleRad) * driftDistance + (Math.random() * 30 - 15);
        particle.dataset.direction = direction;
        particle.style.setProperty("--vitra-particle-drift-x", `${driftX.toFixed(1)}px`);
        particle.style.setProperty("--vitra-particle-drift-y", "120%");
      }
      targetContainer.appendChild(particle);
      _activeParticles.push(particle);
    }
    motionGuard.observe(targetContainer);
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
    _prune();
    return {
      max: _getDeviceLimit(),
      active: _activeParticles.length,
      available: _getDeviceLimit() - _activeParticles.length
    };
  };
  const init = () => {
    const containers = document.querySelectorAll("[data-vitra-particles]");
    containers.forEach((container) => {
      if (_activeParticles.some((p) => p.parentNode === container)) return;
      const count = parseInt(container.dataset.vitraParticles || "10", 10);
      const color = container.dataset.vitraParticleColor || void 0;
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
var reveal = /* @__PURE__ */ (() => {
  let _observer = null;
  let _revealedElements = [];
  const _pendingElements = /* @__PURE__ */ new Set();
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
  const _OBS = "vitra-scroll-reveal-observer";
  const _cls = (el) => el.classList.contains(_OBS) ? "vitra-scroll-revealed" : "vitra-revealed";
  const _hide = (el) => {
    const c = el.classList;
    el.style.transform = !c.contains(_OBS) ? "translateY(20px)" : c.contains("vitra-scroll-reveal-left") ? "translateX(-40px)" : c.contains("vitra-scroll-reveal-right") ? "translateX(40px)" : c.contains("vitra-scroll-reveal-scale") ? "scale(0.8)" : "translateY(40px)";
    el.style.opacity = "0";
    el.style.animationName = "none";
  };
  const _show = (el) => {
    el.classList.add(_cls(el));
    el.style.opacity = "1";
    el.style.transform = "none";
    el.style.animationName = "";
  };
  const _ensureScrollTracking = () => {
    if (_scrollListenerAttached) return;
    window.addEventListener("scroll", _handleScroll, { passive: true });
    _scrollListenerAttached = true;
  };
  const init = (options = {}) => {
    const {
      selector = ".vitra-reveal",
      threshold = 0.1,
      stagger = 100,
      rootMargin = "0px",
      scrollReveal = false
    } = options;
    if (_observer) {
      _observer.disconnect();
      _observer = null;
    }
    let elements = [];
    if (scrollReveal) {
      const scrollSelectors = ".vitra-scroll-reveal, .vitra-scroll-reveal-left, .vitra-scroll-reveal-right, .vitra-scroll-reveal-scale";
      const scrollElements = document.querySelectorAll(scrollSelectors);
      scrollElements.forEach((el) => {
        el.classList.add(_OBS);
      });
      elements = _q(selector, "Reveal", 1);
      elements.push(...scrollElements);
    } else {
      elements = _q(selector, "Reveal", 1);
    }
    if (_reducedMotion()) {
      elements.forEach(_show);
      return;
    }
    if (!("IntersectionObserver" in window)) {
      console.warn("[Vitra Reveal] IntersectionObserver not supported");
      return;
    }
    _ensureScrollTracking();
    _observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      const effectiveStagger = _isFastScrolling ? 0 : stagger;
      visible.forEach((entry, batchIndex) => {
        setTimeout(() => _show(entry.target), batchIndex * effectiveStagger);
        _observer.unobserve(entry.target);
        _pendingElements.delete(entry.target);
        _revealedElements.push(entry.target);
      });
    }, { threshold, rootMargin });
    elements.forEach((el) => {
      _hide(el);
      const t = el.classList.contains(_OBS) ? "1s" : "0.6s";
      el.style.transition = `opacity ${t} cubic-bezier(0.23, 1, 0.32, 1), transform ${t} cubic-bezier(0.23, 1, 0.32, 1)`;
      _pendingElements.add(el);
      _observer.observe(el);
    });
  };
  const count = () => {
    return _revealedElements.length;
  };
  const reset = () => {
    _revealedElements.forEach((el) => {
      el.classList.remove(_cls(el));
      _hide(el);
      if (_observer) {
        _pendingElements.add(el);
        _observer.observe(el);
      }
    });
    _revealedElements = [];
  };
  const destroy = () => {
    if (_observer) {
      _observer.disconnect();
      _observer = null;
    }
    if (_scrollListenerAttached) {
      window.removeEventListener("scroll", _handleScroll);
      _scrollListenerAttached = false;
    }
    _lastScrollY = null;
    _lastScrollTime = null;
    _isFastScrolling = false;
    [..._revealedElements, ..._pendingElements].forEach((el) => {
      el.style.opacity = el.style.transform = el.style.transition = el.style.animationName = "";
      el.classList.remove(_cls(el), _OBS);
      if (_pendingElements.has(el)) {
        el.style.opacity = "1";
        el.style.transform = "none";
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
var ripple = /* @__PURE__ */ (() => {
  let _clickHandler = null;
  const init = () => {
    if (_clickHandler) return;
    _clickHandler = (e) => {
      const target = e.target.closest(".vitra-ripple");
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const key = e.detail === 0;
      const x = (key ? rect.width / 2 : e.clientX - rect.left) - size / 2;
      const y = (key ? rect.height / 2 : e.clientY - rect.top) - size / 2;
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
var modal = /* @__PURE__ */ (() => {
  let _active = null;
  const _closeEntry = (en) => {
    if (en !== _active) return;
    _active = null;
    const el = en.el;
    el.classList.remove("vitra-modal-open");
    el.removeAttribute("open");
    if (en.setRole) el.removeAttribute("role");
    if (en.setModal) el.removeAttribute("aria-modal");
    el.setAttribute("aria-hidden", "true");
    en.untrap();
    en.unlock();
    el.removeEventListener("click", en.onClick);
    en.buttons.forEach((btn) => btn.removeEventListener("click", en.close));
    window.removeEventListener("keydown", _handleEsc);
    if (en.prev && en.prev.focus) en.prev.focus();
  };
  const _handleEsc = (e) => {
    if (e.key === "Escape" && _escTaken !== e && _active && _active.esc) {
      _escTaken = e;
      _closeEntry(_active);
    }
  };
  const open = (target, options = {}) => {
    const { closeOnOverlay = true, closeOnEsc = true } = options;
    const modalEl = _resolve(typeof target === "string" && !/^[#.]/.test(target) ? "#" + target : target, "Modal");
    if (!modalEl) {
      console.warn("[Vitra Modal] Modal element not found");
      return false;
    }
    if (_active && _active.el === modalEl) return true;
    close();
    const en = {
      el: modalEl,
      prev: document.activeElement,
      esc: closeOnEsc,
      setRole: !modalEl.hasAttribute("role"),
      setModal: !modalEl.hasAttribute("aria-modal"),
      buttons: Array.from(modalEl.querySelectorAll("[data-vitra-modal-close]")),
      close: () => _closeEntry(en),
      onClick: (e) => {
        if (closeOnOverlay && e.target === modalEl) _closeEntry(en);
      }
    };
    if (en.setRole) modalEl.setAttribute("role", "dialog");
    if (en.setModal) modalEl.setAttribute("aria-modal", "true");
    modalEl.setAttribute("aria-hidden", "false");
    en.unlock = _lockScroll();
    modalEl.classList.add("vitra-modal-open");
    modalEl.setAttribute("open", "");
    en.untrap = _trapFocus(modalEl, modalEl.querySelector(".vitra-modal-content") || modalEl);
    modalEl.addEventListener("click", en.onClick);
    en.buttons.forEach((btn) => btn.addEventListener("click", en.close));
    window.addEventListener("keydown", _handleEsc);
    _active = en;
    return true;
  };
  const close = () => {
    if (_active) _closeEntry(_active);
  };
  return { open, close, destroy: close };
})();
var drawer = /* @__PURE__ */ (() => {
  const _managed = /* @__PURE__ */ new Set();
  let _active = null;
  let _bound = false;
  const _r = (t) => _resolve(t, "Drawer");
  const _toggles = (el) => Array.from(document.querySelectorAll("[data-vitra-drawer-toggle]")).filter((t) => _r(t.getAttribute("data-vitra-drawer-toggle")) === el);
  const _overlay = (el) => _r(el.getAttribute("data-vitra-drawer-overlay")) || el.parentElement && el.parentElement.querySelector(":scope > .vitra-drawer-overlay");
  const _sync = (el, on) => {
    const ov = _overlay(el);
    if (ov) ov.classList.toggle("open", on);
    _toggles(el).forEach((t) => {
      t.setAttribute("aria-expanded", String(on));
      if (t.classList.contains("vitra-burger")) t.classList.toggle("active", on);
    });
  };
  const _manage = (el) => {
    if (_managed.has(el)) return;
    _managed.add(el);
    el.setAttribute("inert", "");
    _sync(el, false);
  };
  const _close = (en, keep) => {
    if (en !== _active) return;
    _active = null;
    const el = en.el;
    el.classList.remove("open");
    _sync(el, false);
    if (en.setRole) el.removeAttribute("role");
    if (en.setRole) el.removeAttribute("aria-modal");
    if (en.hid) el.setAttribute("aria-hidden", "true");
    en.untrap();
    en.unlock();
    if (!keep && en.prev && en.prev.focus) en.prev.focus();
    el.setAttribute("inert", "");
  };
  const close = (target) => {
    if (!_active) return;
    if (target === void 0 || _r(target) === _active.el) _close(_active);
  };
  const open = (target, opener) => {
    const el = _r(target);
    if (!el) {
      console.warn("[Vitra Drawer] Target element not found");
      return false;
    }
    if (_active && _active.el === el) return true;
    close();
    _manage(el);
    const en = {
      el,
      prev: opener || document.activeElement,
      setRole: !el.hasAttribute("role"),
      hid: el.hasAttribute("aria-hidden")
    };
    if (en.setRole) {
      el.setAttribute("role", "dialog");
      el.setAttribute("aria-modal", "true");
    }
    if (en.hid) el.setAttribute("aria-hidden", "false");
    el.removeAttribute("inert");
    el.classList.add("open");
    _sync(el, true);
    en.unlock = _lockScroll();
    en.untrap = _trapFocus(el);
    _active = en;
    return true;
  };
  const toggle = (target, opener) => {
    const el = _r(target);
    if (el && _active && _active.el === el) {
      close();
      return false;
    }
    return open(target, opener);
  };
  const _onClick = (e) => {
    const t = e.target;
    if (!t.closest) return;
    const tg = t.closest("[data-vitra-drawer-toggle]");
    if (tg) {
      e.preventDefault();
      toggle(tg.getAttribute("data-vitra-drawer-toggle"), tg);
      return;
    }
    const btn = t.closest(".vitra-drawer-close");
    const d = btn && btn.closest(".vitra-drawer");
    if (d && _managed.has(d)) close(d);
    else if (_active && !_active.el.contains(t) && !t.closest(".vitra-modal-open, .vitra-toast-container")) {
      const en = _active;
      if (t === _overlay(en.el)) close();
      else setTimeout(() => _close(en, 1));
    }
  };
  const _onKey = (e) => {
    if (e.key === "Escape" && _escTaken !== e && _active && !document.querySelector(".vitra-modal-open")) close();
  };
  const init = () => {
    document.querySelectorAll("[data-vitra-drawer-toggle]").forEach((t) => {
      const el = _r(t.getAttribute("data-vitra-drawer-toggle"));
      if (el) _manage(el);
    });
    if (_bound) return;
    _bound = true;
    document.addEventListener("click", _onClick, true);
    window.addEventListener("keydown", _onKey);
  };
  const destroy = () => {
    close();
    _managed.forEach((el) => el.removeAttribute("inert"));
    _managed.clear();
    document.removeEventListener("click", _onClick, true);
    window.removeEventListener("keydown", _onKey);
    _bound = false;
  };
  return { open, close, toggle, init, destroy };
})();
var tooltip = /* @__PURE__ */ (() => {
  let _active = null;
  let _cur = null;
  let _showTimeout = null;
  let _touch = false;
  const _SEL = "[data-vitra-tooltip]";
  const _offset = 8;
  const _opp = { top: "bottom", bottom: "top", left: "right", right: "left" };
  const _positionTooltip = (target, tip, position) => {
    const r = target.getBoundingClientRect();
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    const W = document.documentElement.clientWidth;
    const H = window.innerHeight;
    const xy = (p2) => p2 === "bottom" ? [r.left + (r.width - w) / 2, r.bottom + _offset] : p2 === "left" ? [r.left - w - _offset, r.top + (r.height - h) / 2] : p2 === "right" ? [r.right + _offset, r.top + (r.height - h) / 2] : [r.left + (r.width - w) / 2, r.top - h - _offset];
    const fits = (p2, [x, y]) => p2 === "left" ? x >= _offset : p2 === "right" ? x + w <= W - _offset : p2 === "bottom" ? y + h <= H - _offset : y >= _offset;
    let p = _opp[position] ? position : "top";
    let c = xy(p);
    if (!fits(p, c)) {
      p = _opp[p];
      c = fits(p, xy(p)) ? xy(p) : c;
    }
    tip.style.left = `${Math.max(_offset, Math.min(c[0], W - w - _offset)) + window.scrollX}px`;
    tip.style.top = `${Math.max(_offset, Math.min(c[1], H - h - _offset)) + window.scrollY}px`;
  };
  const _key = (e) => {
    if (e.key === "Escape") {
      _escTaken = e;
      hide();
    }
  };
  const _watch = (on) => {
    const f = on ? "addEventListener" : "removeEventListener";
    window[f]("keydown", _key, true);
    document[f]("scroll", _scroll, { capture: true, passive: true });
    window[f]("resize", hide);
  };
  const _at = () => {
    const r = _cur.getBoundingClientRect();
    const q = _active.getBoundingClientRect();
    return [r.top - q.top, r.left - q.left];
  };
  const _scroll = () => {
    if (_at().some((v, i) => Math.abs(v - _active._at[i]) > 1)) hide();
  };
  const show = (target, text, options = {}) => {
    const { position = "top", delay = 0 } = options;
    const targetEl = _resolve(target, "Tooltip");
    if (!targetEl) {
      console.warn("[Vitra Tooltip] Target element not found");
      return false;
    }
    hide();
    _cur = targetEl;
    _showTimeout = setTimeout(() => {
      const tooltipEl = document.createElement("div");
      const tooltipId = "vitra-tt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
      tooltipEl.className = "vitra-tooltip-js";
      tooltipEl.id = tooltipId;
      tooltipEl.setAttribute("role", "tooltip");
      tooltipEl.textContent = text;
      targetEl.setAttribute(
        "aria-describedby",
        [targetEl.getAttribute("aria-describedby"), tooltipId].filter(Boolean).join(" ")
      );
      document.body.appendChild(tooltipEl);
      _positionTooltip(targetEl, tooltipEl, position);
      setTimeout(() => {
        tooltipEl.style.opacity = "1";
      }, 10);
      _active = tooltipEl;
      tooltipEl._at = _at();
      tooltipEl._vitraTarget = targetEl;
      _watch(true);
    }, delay);
    return true;
  };
  const hide = () => {
    clearTimeout(_showTimeout);
    _cur = null;
    const el = _active;
    _active = null;
    if (el) {
      _watch(false);
      const tg = el._vitraTarget;
      const rest = (tg.getAttribute("aria-describedby") || "").split(/\s+/).filter((i) => i && i !== el.id).join(" ");
      if (rest) tg.setAttribute("aria-describedby", rest);
      else tg.removeAttribute("aria-describedby");
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 150);
    }
  };
  const _open = (e) => {
    const t = e.pointerType === "touch" ? null : e.target.closest?.(_SEL);
    if (t && t !== _cur) {
      show(t, t.getAttribute("data-vitra-tooltip"), {
        position: t.getAttribute("data-vitra-tooltip-position") || "top",
        delay: +t.getAttribute("data-vitra-tooltip-delay") || 0
      });
    }
  };
  const _close = (e) => {
    const t = e.target.closest?.(_SEL);
    if (t && t === _cur && !t.contains(e.relatedTarget)) hide();
  };
  const _tap = (e) => {
    if (!_touch) return;
    if (e.target.closest?.(_SEL)) _open({ target: e.target });
    else hide();
  };
  const _events = [
    ["pointerenter", _open],
    ["focusin", _open],
    ["pointerleave", _close],
    ["focusout", _close],
    ["pointerdown", (e) => {
      _touch = e.pointerType === "touch";
    }],
    ["click", _tap]
  ];
  const _bind = (on) => _events.forEach(([n, f]) => document[on ? "addEventListener" : "removeEventListener"](n, f, true));
  const init = () => {
    _bind(true);
  };
  const destroy = () => {
    hide();
    document.querySelectorAll(".vitra-tooltip-js").forEach((n) => n.remove());
    _bind(false);
  };
  return {
    show,
    hide,
    init,
    destroy
  };
})();
var toast = /* @__PURE__ */ (() => {
  let _container = null;
  const _pendingTimeouts = /* @__PURE__ */ new Set();
  const _ensureContainer = () => {
    if (!_container || !_container.isConnected) {
      _container = document.createElement("div");
      _container.className = "vitra-toast-container";
      _container.setAttribute("role", "status");
      _container.setAttribute("aria-live", "polite");
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
  const init = () => {
    if (document.body) _ensureContainer();
  };
  const show = (message, options = {}) => {
    const { type = "default", duration = 3e3, closable = false } = options;
    const container = _ensureContainer();
    const el = document.createElement("div");
    el.className = `vitra-toast`;
    if (type !== "default") {
      el.classList.add(`vitra-toast-${type}`);
    }
    if (type === "error") el.setAttribute("role", "alert");
    const text = document.createElement("span");
    text.className = "vitra-toast-text";
    text.textContent = message;
    el.appendChild(text);
    container.appendChild(el);
    const dismiss = () => {
      el.classList.remove("show");
      _schedule(() => {
        if (el.parentNode === container) {
          container.removeChild(el);
        }
      }, 300);
    };
    if (closable || duration === 0) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "vitra-toast-close";
      btn.setAttribute("aria-label", "Close");
      btn.textContent = "\xD7";
      btn.addEventListener("click", dismiss);
      el.appendChild(btn);
    }
    _schedule(() => el.classList.add("show"), 10);
    if (duration > 0) _schedule(dismiss, duration);
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
  return { show, init, destroy };
})();
var dropdown = (() => {
  const _supportsPopover = typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;
  let _initialized = false;
  const _boundMenus = /* @__PURE__ */ new WeakSet();
  const _bindPopover = (menu, toggle) => {
    if (_boundMenus.has(menu)) return;
    _boundMenus.add(menu);
    menu.addEventListener("toggle", (ev) => {
      toggle.setAttribute("aria-expanded", String(ev.newState === "open"));
    });
  };
  const _placePopover = (menu, toggle) => {
    const gap = 8;
    const t = toggle.getBoundingClientRect();
    const m = menu.getBoundingClientRect();
    const alignEnd = menu.classList.contains("vitra-dropdown-menu-end");
    let left = alignEnd ? t.right - m.width : t.left;
    left = Math.max(gap, Math.min(left, window.innerWidth - m.width - gap));
    let top = t.bottom + gap;
    if (top + m.height > window.innerHeight - gap && t.top - gap - m.height >= gap) {
      top = t.top - gap - m.height;
    }
    menu.style.position = "fixed";
    menu.style.margin = "0";
    menu.style.inset = `${top}px auto auto ${left}px`;
  };
  const _clickHandler = (e) => {
    const toggle = e.target.closest("[data-vitra-dropdown-toggle]");
    const dropdown2 = toggle ? toggle.closest(".vitra-dropdown") : null;
    const menu = dropdown2 ? dropdown2.querySelector(".vitra-dropdown-menu") : null;
    const item = e.target.closest(".vitra-dropdown-item");
    const itemMenu = item ? item.closest(".vitra-dropdown-menu[popover]") : null;
    if (_supportsPopover && itemMenu && itemMenu.matches(":popover-open")) {
      itemMenu.hidePopover();
    }
    if (_supportsPopover && menu && menu.hasAttribute("popover")) {
      if (toggle) {
        e.preventDefault();
        _bindPopover(menu, toggle);
        menu.togglePopover();
        if (menu.matches(":popover-open")) _placePopover(menu, toggle);
      }
    } else {
      document.querySelectorAll(".vitra-dropdown.open").forEach((dd) => {
        if (!toggle || dd !== dropdown2) _shut(dd);
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
    _release();
    if (toggle && menu && e.detail === 0 && _isOpen(dropdown2, menu)) {
      const first = _items(menu)[0];
      if (first) first.focus();
    }
  };
  const _isOpen = (dd, menu) => _supportsPopover && menu.hasAttribute("popover") ? menu.matches(":popover-open") : dd.classList.contains("open");
  const _shut = (dd, menu = dd.querySelector(".vitra-dropdown-menu")) => {
    const btn = dd.querySelector("[data-vitra-dropdown-toggle]");
    if (menu && _supportsPopover && menu.hasAttribute("popover")) menu.hidePopover();
    else dd.classList.remove("open");
    if (btn) btn.setAttribute("aria-expanded", "false");
    return btn;
  };
  const _items = (menu) => [...menu.querySelectorAll(".vitra-dropdown-item")].filter((i) => !i.disabled && i.getAttribute("aria-disabled") !== "true");
  let _guardMenu = null;
  let _guardTimer = 0;
  const _release = () => {
    clearTimeout(_guardTimer);
    if (_guardMenu) _guardMenu.inert = false;
    _guardMenu = null;
  };
  const _keyHandler = (e) => {
    const k = e.key;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (k === "Escape") {
      if (_escTaken !== e) document.querySelectorAll(".vitra-dropdown").forEach((dd2) => {
        const menu2 = dd2.querySelector(".vitra-dropdown-menu");
        if (menu2 && _isOpen(dd2, menu2)) {
          _escTaken = e;
          const btn = _shut(dd2, menu2);
          if (btn) btn.focus();
        }
      });
      return;
    }
    const dd = e.target.closest && e.target.closest(".vitra-dropdown");
    const menu = dd && dd.querySelector(".vitra-dropdown-menu");
    const toggle = dd && dd.querySelector("[data-vitra-dropdown-toggle]");
    if (!menu || !toggle) return;
    const onToggle = e.target === toggle;
    if (!onToggle && !menu.contains(e.target)) return;
    if (e.target.closest("input, textarea, select, [contenteditable]")) return;
    const items = _items(menu);
    if (!_isOpen(dd, menu)) {
      if (onToggle && k === "ArrowDown") {
        e.preventDefault();
        toggle.click();
      }
      return;
    }
    if (k === "Tab") {
      _release();
      _guardMenu = menu;
      menu.inert = true;
      _guardTimer = setTimeout(_release, 400);
      if (!onToggle) {
        toggle.focus();
        if (e.shiftKey) e.preventDefault();
      }
      _shut(dd, menu);
      return;
    }
    const i = onToggle ? -1 : items.indexOf(document.activeElement);
    const n = items.length;
    const to = k === "ArrowDown" ? (i + 1) % n : k === "ArrowUp" ? i < 0 ? n - 1 : (i - 1 + n) % n : k === "Home" ? 0 : k === "End" ? n - 1 : -1;
    if (to < 0 || !n) return;
    e.preventDefault();
    items[to].focus();
  };
  const init = () => {
    if (_initialized) return;
    document.addEventListener("click", _clickHandler);
    document.addEventListener("keydown", _keyHandler);
    _initialized = true;
  };
  const destroy = () => {
    _release();
    document.removeEventListener("click", _clickHandler);
    document.removeEventListener("keydown", _keyHandler);
    _initialized = false;
  };
  return { init, destroy };
})();
var spotlight = /* @__PURE__ */ (() => {
  let initialized = false;
  let _rafId = null;
  let _handleMove = null;
  let _pending = null;
  const init = () => {
    if (initialized) return;
    _handleMove = (e) => {
      const el = e.target instanceof Element ? e.target.closest(".vitra-spotlight") : null;
      if (!el) return;
      _pending = { el, x: e.clientX, y: e.clientY };
      if (_rafId) return;
      _rafId = requestAnimationFrame(() => {
        _rafId = null;
        const { el: target, x, y } = _pending;
        _pending = null;
        const rect = target.getBoundingClientRect();
        const px = `${x - rect.left}px`;
        const py = `${y - rect.top}px`;
        ["--vitra-mouse-x", "--mouse-x"].forEach((n) => target.style.setProperty(n, px));
        ["--vitra-mouse-y", "--mouse-y"].forEach((n) => target.style.setProperty(n, py));
      });
    };
    document.addEventListener("pointermove", _handleMove, { passive: true });
    initialized = true;
  };
  const destroy = () => {
    if (_handleMove) {
      document.removeEventListener("pointermove", _handleMove);
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
var scenery = /* @__PURE__ */ (() => {
  const SELECTOR = ".vitra-scenery, .vitra-scenery-inline";
  const LAYERS = ["sky", "stars", "clouds", "halo", "ridge-far", "ridge-mid", "ridge-near", "grain"];
  let _mounted = [];
  const mount = (target, options = {}) => {
    const el = _resolve(target, "Scenery");
    if (!el) {
      console.warn("[Vitra Scenery] Target element not found");
      return null;
    }
    if (!el.matches(SELECTOR)) {
      el.classList.add(options.inline ? "vitra-scenery-inline" : "vitra-scenery");
    }
    el.setAttribute("aria-hidden", "true");
    if (el.children.length === 0) {
      LAYERS.forEach((name) => {
        const layer = document.createElement("div");
        layer.className = `vitra-scenery-${name}`;
        el.appendChild(layer);
      });
      _mounted.push(el);
    }
    motionGuard.observe(el);
    const moon = options.moon || el.dataset.vitraMoon;
    if (moon) {
      const halo = el.querySelector(".vitra-scenery-halo");
      if (halo) halo.classList.toggle("vitra-scenery-halo-crescent", moon === "crescent");
    }
    return el;
  };
  const init = () => {
    let count = 0;
    document.querySelectorAll(SELECTOR).forEach((el) => {
      if (el.children.length === 0) {
        mount(el);
        count++;
      }
    });
    return count;
  };
  const destroy = () => {
    _mounted.forEach((el) => {
      el.querySelectorAll(':scope > [class^="vitra-scenery-"]').forEach((layer) => layer.remove());
    });
    _mounted = [];
  };
  return { init, mount, destroy };
})();
var motionGuard = /* @__PURE__ */ (() => {
  const SELECTOR = ".vitra-glow-orb, .vitra-aurora-bg, .vitra-aurora-layer, .vitra-aurora-layer-1, .vitra-aurora-layer-2, .vitra-gradient-bg, .vitra-gradient-text, .vitra-border-glow, .vitra-shape-morph, .vitra-gradient-rotate, .vitra-scenery, .vitra-scenery-inline, [data-vitra-particles], .vitra-spinner, .vitra-skeleton, .vitra-progress-bar-animated, .vitra-progress-ring-indeterminate, .vitra-noise-overlay";
  const PAUSED_CLASS = "vitra-motion-paused";
  let _observer = null;
  let initialized = false;
  let _seen = /* @__PURE__ */ new WeakSet();
  const observe = (el) => {
    if (!_observer || _seen.has(el)) return;
    _seen.add(el);
    _observer.observe(el);
  };
  const init = () => {
    if (initialized) return;
    if (_reducedMotion()) return;
    if (!("IntersectionObserver" in window)) {
      console.warn("[Vitra MotionGuard] IntersectionObserver not supported");
      return;
    }
    _observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle(PAUSED_CLASS, !entry.isIntersecting);
      });
    }, { rootMargin: "50px" });
    document.querySelectorAll(SELECTOR).forEach(observe);
    initialized = true;
  };
  const destroy = () => {
    if (_observer) {
      _observer.disconnect();
      _observer = null;
    }
    document.querySelectorAll(`.${PAUSED_CLASS}`).forEach((el) => {
      el.classList.remove(PAUSED_CLASS);
    });
    _seen = /* @__PURE__ */ new WeakSet();
    initialized = false;
  };
  return { init, observe, destroy };
})();
var _parseDataConfig = () => {
  const el = document.querySelector("[data-config]");
  let config = {};
  if (el) {
    try {
      config = JSON.parse(el.getAttribute("data-config")) || {};
    } catch (e) {
      console.warn("[Vitra] Failed to parse data-config:", e.message);
      config = {};
    }
  }
  const t = config.theme;
  const p = config.particles;
  const r = config.reveal;
  [
    [t, () => theme.init(typeof t === "object" ? t : typeof t === "string" ? { default: t } : {})],
    [p, () => p === true ? particles.init() : typeof p === "object" && particles.spawn(p.count || 10, p)],
    [r, () => reveal.init(typeof r === "object" ? r : {})],
    // Default-on modules, in this order (scenery before the guard, which
    // observes the result); each is skipped when its key is false.
    ...Object.entries({ ripple, toast, tooltip, drawer, dropdown, spotlight, scenery, motionGuard }).map(([k, m]) => [config[k] !== false, m.init])
  ].forEach(([on, f]) => {
    if (on) try {
      f();
    } catch (e) {
      console.warn("[Vitra] Init failed:", e);
    }
  });
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
    });
  } else {
    _parseDataConfig();
  }
}
var destroyAll = () => {
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
var Vitra = {
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
var vitra_default = Vitra;
if (typeof window !== "undefined") {
  window.Vitra = Vitra;
}
//# sourceMappingURL=vitra.cjs.map
