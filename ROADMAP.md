# Vitra CSS Framework — Roadmap

**Current version:** v1.7.2  
**Last updated:** 2026-06-19

---

## Released

### v1.0 — Foundation
- CSS `@layer` architecture (`tokens → glass → particles → motion → layout → components → utilities`)
- Design token system (`--vitra-` prefix, immutable primitives)
- 7 preset themes: `light`, `dark`, `auto`, `pastel`, `neon`, `ocean`, `emerald`
- Theme toggle with `localStorage` persistence and `prefers-color-scheme` auto-detect
- Glassmorphism system (`.vitra-glass` variants, `@supports` fallbacks)
- Particle system with glow effects, emoji particles, device limits (40 desktop / 15 mobile)
- Motion engine: reveal classes, delay utilities, hover interactions, `prefers-reduced-motion`
- Layout utilities: container, grid, flex, fluid `clamp()` spacing
- Core components: buttons, cards, forms, navigation, modals, tooltips, badges, avatars, sliders, tabs, progress
- Optional JS module (`window.Vitra`): theme, particles, reveal, modal, tooltip

### v1.1 — Component Expansion
- Additional components: toasts, dropdowns, alerts, tables, skeleton loaders, spinners
- Ripple click effect module
- Spotlight hover module
- Form validation states with shake animation

### v1.2 — Cinematic Animations
- Mesh gradient backgrounds (`.vitra-gradient-bg`)
- Floating glow orbs (`.vitra-glow-orb-*`)
- Animated gradient text (`.vitra-gradient-text`)
- Animated gradient border (`.vitra-border-glow`)
- Aurora background (`.vitra-aurora-bg`)
- Text reveal via `clip-path` (`.vitra-text-reveal`)
- Page enter animation (`.vitra-page-enter`)
- Stagger system (`.vitra-stagger` + `.vitra-stagger-item`)
- 3D tilt card (`.vitra-tilt-card`)

### v1.3 — Layout Upgrades
- CSS container queries on responsive table (`.vitra-table-stack`)
- `@starting-style` transitions on modals, drawers, toasts, dropdowns
- `dvh` units on modal sizing
- High contrast media query support (`prefers-contrast: more`)

### v1.4 — Accessibility Pass
- Focus trap listener leak fix (modal `keydown` cleanup)
- `prefers-reduced-motion` coverage across all new cinematic classes
- `aria-live` announcer for theme changes
- `focus-visible` on all interactive components

### v1.5 — CSS Shader Components
- Pure-CSS shader effects: noise overlay, shape morphing, progress rings, gradient rotate borders
- Scroll-driven reveals, material ripple, `@layer shaders` added to layer stack
- Interactive demo site (`index.html`, `demo.css`, `demo.js`)

### v1.6 — Technical Cleanup
- `will-change` audit — removed from non-animating elements
- Orphaned styles in `tooltip::before` removed
- Build pipeline verified (lightningcss + esbuild)

### v1.7 — Audit & Quality Pass ✅
- Full code audit across all CSS and JS
- Branch architecture fixed: `demo` branch now CDN-only, no `dist/` in demo
- GitHub Pages fixed: `.nojekyll` added to prevent Jekyll stripping CSS

**CSS fixes:**
- `navbar-glass`, `drawer-glass`, `dropdown-menu`, `tooltip`, `toast` — all replaced hardcoded dark `hsl(240deg 15% ...)` with `--vitra-glass-bg` tokens
- Added `@supports (backdrop-filter)` guards to all glass components (dropdown, tooltip, toast, navbar, drawer)
- `dropdown-item` hover — replaced hardcoded white with `--vitra-color-surface-hover`
- `_watchSystemTheme` — listener deduplication (B8 ✅)

**JS fixes:**
- `ripple.destroy()` — now actually removes listener; guard prevents double-init (B8-adjacent ✅)
- `data-config` theme string — was silently dropped; now correctly passed as `{ default: value }` ✅
- `_setupFocusTrap` — collapsed redundant `querySelectorAll` + `Array.from` to one call ✅
- `dropdown` — `aria-expanded` now synced on toggle and close-others, both popover and fallback paths ✅

**Demo fixes:**
- Dropdown overflow clipped (`overflow: hidden` + `max-width`)
- `aria-haspopup`, `aria-expanded`, `aria-hidden`, `aria-label` on all nav elements
- `rel="noopener noreferrer"` on all external links
- Version badge, footer, and QS code blocks updated

---

## Known Open Issues

| # | Priority | Area | Issue |
|---|----------|------|-------|
| R1 | Medium | `src/vitra.js` | Tooltip ignores `window.scrollY/scrollX` — wrong position when page scrolled |
| R2 | Medium | `src/vitra.js` | Modal focus trap `keydown` listener can stack if modal opens without full close cycle |
| R3 | Low | `src/vitra.js` | Reveal stagger uses observation order, not DOM order — wrong on complex layouts |
| R4 | Low | `src/vitra.js` | `particles.init()` passes DOM element to `spawn()` in auto-init path — should be selector or type-guarded |
| R5 | Low | `src/04-motion.css` | `.vitra-reveal-scale` uses `vitra-fade-up` keyframe instead of a scale keyframe |
| R6 | Low | `src/vitra.js` | Tooltip expands DOM nodes with `._vitraTooltipInstance` — `WeakMap` preferred |
| D1 | Medium | demo | Heavy particle/cinematic sections not paused off-screen — can drop frames on mobile |
| D2 | Low | demo | `demo.js` parses CSS custom props with string replace — breaks on nested vars |

---

## v1.8 — Polish & DX (Next)

- Fix tooltip scroll offset (R1)
- Fix modal focus trap stacking (R2)
- `--vitra-color-accent-rgb` token for consumers using `rgb()` notation
- Document `Vitra.toast`, `Vitra.dropdown`, `Vitra.spotlight` in integration guide
- `WeakMap` for tooltip target → element mapping (R6)
- Demo performance: `IntersectionObserver` to pause off-screen effects (D1)

---

## v2.0 — Future

- TypeScript type definitions (`vitra.d.ts`)
- CSS Layers exposed for consumer override documentation
- CSS custom properties for animation durations per-component
- `Vitra.destroyAll()` comprehensive teardown
- npm publish for shorter CDN URLs (`cdn.jsdelivr.net/npm/vitra-css@latest/...`)

---

## Non-Goals (Permanent Out of Scope)

- Bootstrap/Tailwind compatibility plugin
- Server-side rendering
- React/Vue component wrappers
- Icon library
- Full mobile-first grid system (use fluid/clamp instead)
