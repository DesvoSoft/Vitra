# Vitra CSS Framework — Roadmap

**Current version:** v1.10.3  
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

**Low-priority fixes (findings 24-29 of the 29-item audit):**
- Removed dead keyframes `vitra-shimmer`/`vitra-aurora-hue` (no `animation:` reference anywhere in the codebase)
- `tooltip.destroy()` now stores per-element listener references in a `WeakMap` set during `init()` and calls `removeEventListener` explicitly, replacing the `cloneNode`/`replaceChild` strip trick
- Focus-trap autofocus swaps `setTimeout(fn, 100)` for a double `requestAnimationFrame`, waiting for the open paint to commit instead of guessing a fixed delay
- Stray Spanish comment in `05-layout.css` translated
- `--vitra-color-border-rgb` was hardcoded white at the base token level with no per-theme override, so `.vitra-glass`'s border rendered white-on-near-white (invisible) on the `light`/`pastel` themes and `auto`'s light-media branch — added theme-appropriate dark-tint overrides for those three
- Added real interaction tests for `dropdown` (open/close/`aria-expanded` cycle, closing sibling dropdowns, no-op after `destroy()`) and `spotlight` (`--mouse-x`/`--mouse-y` update on `mousemove`, no-op after `destroy()`), replacing the old smoke-only "doesn't throw" tests

All 29 audit findings are now closed. (Note: findings 12's dead-token removal — `--vitra-color-bg-warm`/`-cool`/`--vitra-color-accent-oklch` — was marked complete under high-priority above but not actually applied until v1.8.5, once the test asserting their existence was corrected.)

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
| R7 | Low | `src/vitra.js` | `theme` module is a plain object literal, not a closure — its `_getSystemTheme`/`_isLocalStorageAvailable`/`_watchSystemTheme` "private" helpers leak as real enumerable own-properties on `Vitra.theme`, unlike every other module's closure-scoped-private pattern |
| D1 | Medium | demo | Heavy particle/cinematic sections not paused off-screen — can drop frames on mobile |
| D2 | Low | demo | `demo.js` parses CSS custom props with string replace — breaks on nested vars |

> R2 (modal focus-trap listener stacking), R4 (`particles.init()` type-guard), and R6 (tooltip `WeakMap`) were re-verified during the v1.9 audit and are already fixed in current code — closed. R1, R3, R5 closed previously (v1.8).

**Audit backlog (medium/low tier, deferred from the v1.8 pass):** glass-variant components (`badge/input/alert/table/spinner-glass`) still hardcode `hsl()` instead of glass tokens and lack `@supports` guards; `.vitra-table-stack` duplicated across media/container queries; glass variant fallback leaks outside `@supports` guard in `02-glass.css`; `.vitra-container-sm` naming.

---

## v1.9 — Scenery Depth, Directional Particles & Definitive Audit ✅

**New features:**
- **Scenery**: cloud layer (`.vitra-scenery-clouds`), star field (`.vitra-scenery-stars`, dark-appropriate themes only), atmospheric radial-gradient grading on the sky layer — eight layers total, same seamless right-to-left drift read, full reduced-motion coverage
- **Directional particles** (opt-in, non-breaking): `Vitra.particles.spawn(count, { direction })` — `'down'`/`'down-left'`/`'down-right'`/numeric degree angle; default (`direction` omitted) is byte-identical to the existing symmetric bob. Declarative `data-vitra-particle-direction` attribute supported too.
- **Scenery**: far and near ridge layers shift hue away from the base `--vitra-scenery-hue` token (`-15deg` far, `+20deg` near) instead of sharing one hue and varying only lightness/saturation — the near ridge previously read as "the same mountains, just darker." Verified across all 8 themes, no clipping/banding.

**Audit fixes:**
- `--vitra-color-accent-rgb` was only ever defined once at `:root` — every non-default theme (`light`/`pastel`/`neon`/`ocean`/`emerald`/`auto`'s light branch) silently kept the dark theme's RGB triplet instead of its own accent color. Added correct per-theme overrides (same fix `--vitra-color-border-rgb` already got in v1.8.6).
- Dropdown had no keyboard dismissal path in its non-popover fallback (Escape did nothing; popover-based dropdowns already got this for free from the browser). Added an `Escape` handler that closes open dropdowns and refocuses the toggle.
- `.d.ts` drift-guard test extended to cover `particles`/`reveal`/`modal`/`tooltip` (previously only `ripple`/`dropdown`/`spotlight`/`toast`) — this surfaced and fixed 3 real gaps: `reveal.destroy()`, `modal.destroy()`, and `tooltip.destroy()` all existed at runtime but were missing from `dist/vitra.d.ts`.
- Keyboard-only walkthrough (Tab/Shift-Tab/Escape, no mouse) across dropdown/modal/tooltip/spotlight: modal's focus-trap and Escape handling confirmed already correct; tooltip's focus/blur-driven show/hide needs no Escape by design (non-interactive, `pointer-events: none`); spotlight has no focusable semantics of its own.
- Found (not fixed — filed as R7): `theme` module's `_`-prefixed helpers leak onto the public `Vitra.theme` object, unlike every other module. Real fix requires restructuring `theme` into a closure like the rest of the codebase; deferred to avoid rushing a mid-release refactor.

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
