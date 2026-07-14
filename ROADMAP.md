# Vitra CSS Framework — Roadmap

**Current version:** v1.8.4  
**Last updated:** 2026-07-14

---

## Released

### v1.8 — Scenery & Audit Fix Pass ✅

**New feature:**
- **Scenery system** (`.vitra-scenery` / `.vitra-scenery-inline`, `@layer scenery`): CSS-only ambient mountain landscape — SVG-silhouette ridgelines at three depths, sun/moon disc with glow, atmospheric-perspective haze, differential-speed parallax drift, grain finish. Theme-derived color via accent tokens, `mask-image` fallback, reduced-motion safe.

**Critical/High fixes (findings 1-15 of the 29-item audit):**
- `@layer` order corrected (`motion` before `layout`, matching build order) — cascade bug
- Google Fonts `@import` removed — no third-party network request; fonts now opt-in
- Orphaned `.vitra-slider-*` CSS removed (correction: v1.0 listed sliders, but no base class ever shipped)
- `:focus-visible` rings added to `.vitra-btn` and `.vitra-dropdown-item`
- Emoji particle double-render fixed (single `::before` render path)
- `toast.destroy()` added with timeout tracking; wired into `destroyAll()`
- Reduced-motion coverage extended: toast, dropdown menu, input shake, spotlight
- Input validation states: `!important` dropped for compound-selector specificity
- Duplicate `.vitra-grid` removed from utilities layer
- `size-limit` budgets corrected (brotli-measured: 16 kB CSS gate vs 13.7 kB actual)

**Medium-priority fixes (findings 16-23 of the 29-item audit):**
- Glass fallback/`@supports` guard fixed on `.vitra-input-glass`, `.vitra-badge-glass`, `.vitra-spinner-glass`, `.vitra-alert-glass`, `.vitra-table-glass` (previously unconditional translucent backgrounds, no opaque fallback)
- `02-glass.css` size-variant fallback rule scoped to `@supports not (...)` — was silently overriding the enhanced background in browsers that DO support `backdrop-filter`
- `.vitra-table-stack` container-query and media-query rule sets deduplicated behind `@supports not (container-type: inline-size)` so only one is ever active
- `vitra.d.ts` synced with runtime: `ripple` module and `destroyAll()` were undeclared; `destroy()` missing from `Toast`/`Dropdown`/`Spotlight` interfaces. Added a drift-guard test that fails CI if runtime module keys and declared interface keys diverge again
- `dropdown.init()`/`spotlight.init()` now respect `data-config` opt-out (`config.dropdown/spotlight !== false`), matching the existing `ripple`/`tooltip` pattern — previously ran unconditionally regardless of config
- CI now fails a tagged release if `package.json` version doesn't match the git tag
- `.vitra-container-sm` fixed — was using the same width as default `.vitra-container` at the md breakpoint (720px); added `--vitra-container-narrow` (560px) so the "sm" variant is genuinely narrower

**Still open (findings 24-29, low-priority):** dead `vitra-shimmer`/`vitra-aurora-hue` keyframes, tooltip `destroy()` via `cloneNode` trick, focus-trap `setTimeout` → `requestAnimationFrame`, stray Spanish comment in `05-layout.css`, `--vitra-color-border-rgb` light-theme verification, real dropdown/spotlight interaction tests. Also still open despite being listed under high-priority above: `--vitra-color-bg-warm`/`-cool`/`--vitra-color-accent-oklch` dead tokens were never actually removed from `01-tokens.css` — a test in `vitra.test.js` still asserts they exist, so removing them now requires updating that test first.

**Infrastructure:**
- CI: Windows build matrix, `npm audit` gate, weekly Dependabot
- Governance: `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`
- Root `index.html` demo restored (scenery + glass + theme switcher)
- Dev dependencies patched via `npm audit fix` (0 known vulnerabilities)

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
| R2 | Medium | `src/vitra.js` | Modal focus trap `keydown` listener can stack if modal opens without full close cycle |
| R4 | Low | `src/vitra.js` | `particles.init()` passes DOM element to `spawn()` in auto-init path — should be selector or type-guarded |
| R6 | Low | `src/vitra.js` | Tooltip expands DOM nodes with `._vitraTooltipInstance` — `WeakMap` preferred |
| D1 | Medium | demo | Heavy particle/cinematic sections not paused off-screen — can drop frames on mobile |
| D2 | Low | demo | `demo.js` parses CSS custom props with string replace — breaks on nested vars |

> R1 (tooltip scroll offset), R3 (reveal stagger order), and R5 (`.vitra-reveal-scale` keyframe) were re-verified during the v1.8 audit and are already fixed in current code — closed.

**Audit backlog (medium/low tier, deferred from the v1.8 pass):** glass-variant components (`badge/input/alert/table/spinner-glass`) still hardcode `hsl()` instead of glass tokens and lack `@supports` guards; `.vitra-table-stack` duplicated across media/container queries; glass variant fallback leaks outside `@supports` guard in `02-glass.css`; `vitra.d.ts` dropdown/spotlight interface drift; `spotlight`/`dropdown` lack `data-config` opt-out gating; `.vitra-container-sm` naming; dead keyframes `vitra-aurora-hue`/`vitra-shimmer`; tooltip `cloneNode` teardown; focus-trap `setTimeout(100)` → `requestAnimationFrame`; `--vitra-color-border-rgb` light-theme verification; dropdown/spotlight interaction tests.

---

## v1.9 — Polish & DX (Next)

- Audit backlog above (medium/low tier)
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
