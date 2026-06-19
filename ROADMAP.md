# Vitra CSS Framework — Roadmap

**Current version:** v1.6  
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

### v1.5 — Demo Interactiva
- Full interactive demo (`index.html`, `demo.css`, `demo.js`)
- Live theme switcher, particle controls, component showcase
- Zero external dependencies

### v1.6 — Technical Cleanup
- `will-change` audit — removed from non-animating elements
- Orphaned styles in `tooltip::before` removed
- Build pipeline verified (lightningcss + esbuild)

---

## Active Bugs (v1.6)

Issues identified in audit — pending fix in v1.7:

| # | File | Issue |
|---|------|-------|
| B1 | `vitra.js:361` | `particles.init()` passes DOM element instead of CSS selector to `spawn()` |
| B2 | `vitra.js:436` | Reveal stagger uses `entries` index (non-DOM order) instead of element order |
| B3 | `vitra.js:722` | Focus trap `keydown` listener accumulates on each modal open |
| B4 | `vitra.js:863` | Tooltip position ignores `window.scrollY`/`scrollX` — wrong position on scroll |
| B5 | `06-components.css:105` | Invalid `rgb(var(), 0.x)` syntax in `.vitra-btn-solid` hover shadow |
| B6 | `06-components.css:675` | Same invalid `rgb()` syntax in `.vitra-drawer-link.active` |
| B7 | `06-components.css:269` | Orphaned `}` in card `prefers-reduced-motion` block |
| B8 | `vitra.js:173` | `_watchSystemTheme` accumulates listeners on repeat calls |
| B9 | `04-motion.css:143` | `.vitra-reveal-scale` uses `vitra-fade-up` instead of a scale keyframe |

---

## v1.7 — Bug Fix Release (Next)

**Goal:** Resolve all active bugs from audit.

- Fix particle `container` type mismatch (B1)
- Fix reveal stagger ordering (B2)
- Fix modal focus trap listener leak (B3)
- Fix tooltip scroll offset (B4)
- Fix invalid `rgb()` CSS syntax (B5, B6)
- Fix orphaned `}` in components (B7)
- Deduplicate `_watchSystemTheme` listeners (B8)
- Fix `.vitra-reveal-scale` keyframe (B9)
- Fix `tooltip._positionTooltip` reference — uses `tooltip` local before declaration
- Add `window.scrollY/X` correction to tooltip positioning

---

## v1.8 — Polish & DX

- `--vitra-color-accent-rgb` token for consumers using `rgb()` notation
- `Vitra.toast`, `Vitra.dropdown`, `Vitra.spotlight` documented in integration guide
- `WeakMap` for tooltip target → element mapping (replace DOM property expansion)
- Theme count: add missing `earth`, `mono`, `midnight` themes OR remove from docs
- `ripple.destroy()` removes global click listener

---

## v2.0 — Future

- TypeScript type definitions (`vitra.d.ts`)
- CSS Layers exposed for consumer override documentation
- CSS custom properties for animation durations per-component
- `Vitra.destroyAll()` comprehensive teardown
- Potential CDN distribution

---

## Non-Goals (Permanent Out of Scope)

- Bootstrap/Tailwind compatibility plugin
- Server-side rendering
- React/Vue component wrappers
- Icon library
- Full mobile-first grid system (use fluid/clamp instead)
