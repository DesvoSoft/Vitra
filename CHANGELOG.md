# Changelog

All notable changes to Vitra CSS are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.8.3] - 2026-07-14

### Changed

- **Themes given distinct hues** — `light` and `dark` previously both fell back to the base token hue (177°), making them read as near-identical besides brightness; `neon` (180°) and `emerald` (155°) were also only a few degrees from that same base hue. All 7 themes now sit at deliberately separated hues across the wheel (dark 177, light 222, emerald 145, ocean 205, neon 285, pastel 330), so switching themes actually changes color character, not just contrast — this is most visible in the scenery backdrop, which derives its palette from the same accent-hue tokens.
- **Scenery contrast tuned per color-scheme** — ridge opacity was a flat constant regardless of theme; on light-scheme themes (`light`, `pastel`) the translucent mist bands were washing out against a bright sky. Light-scheme themes now get heavier ridge opacity and a dialed-back sky glow to keep the horizon legible.
- **Parallax now drifts one direction, true loop** — ridges previously used `ease-in-out infinite alternate`, which reads as layers breathing back and forth rather than a camera pan. Each ridge's SVG silhouette is now tiled twice inside a 200%-wide strip; animating `translate3d(0%) -> translate3d(-50%)` linear/infinite lands on a frame pixel-identical to the start, so the loop is seamless and travels one direction only (near ridge fastest, far ridge slowest — real depth-parallax cue).

### Fixed

- Far/mid ridge SVG paths had a vertical mismatch between their start and end anchor points (26px / 30px), which would have shown as a visible step at the tile seam once ridges became seamless loops — corrected so each path's edges meet at the same height.

## [1.8.2] - 2026-07-13

### Added

- `rootMargin` option on `Vitra.reveal.init()` — lets consumers pre-trigger reveals before elements enter the viewport (e.g. `'0px 0px 15% 0px'`). Typed in `vitra.d.ts` (with previously missing `scrollReveal`).

### Changed

- **Scenery silhouettes redrawn as a painterly panorama**: flowing cubic-bezier ridgeline with summit hierarchy (dominant massif, secondary summit, eroded round valleys, asymmetric slopes) replacing the uniform zigzag; sun repositioned to sit cradled in the saddle between massifs.

### Fixed

- **Reveal stagger used the global element index** — an element revealed alone still waited `(its index) × stagger` ms after entering the viewport, so late-page sections appeared up to seconds late. Stagger is now per-visibility-batch.

## [1.8.1] - 2026-07-13

### Changed

- **Scenery performance overhaul** — the whole system now animates on the compositor only:
  - `filter: blur()` removed from ridge layers (was re-rasterizing 130%-wide surfaces); atmospheric haze now comes from translucent mist-band gradients at each ridge top.
  - Grain layer dropped `mix-blend-mode: overlay` (forced full-stack re-blend every animation frame); now plain low opacity.
  - Drift keyframes use `translate3d` to pin each ridge to its own compositor layer; `contain: strict` on both scenery roots.
- **Scenery silhouettes reworked**: far ridge is a dense-detail alpine range (36 points, dominant massif, micro-jitter rock texture), mid ridge mixes sharp spurs with rounded shoulders overlapping the far range's valleys, near ridge is a soft dark treeline. Valley-fog mist bands between ranges strengthen depth separation.

### Removed

- `--vitra-scenery-blur-far/-mid/-near` tokens (obsolete with the no-filter design; introduced in 1.8.0).

## [1.8.0] - 2026-07-13

### Added

- **Scenery system** (`src/09-scenery.css`, new `@layer scenery`): CSS-only ambient mountain-landscape backdrop. SVG-silhouette ridgelines at three depths (shape from inline SVG masks, color from theme tokens), crisp sun/moon disc with layered glow, atmospheric-perspective haze, differential-speed parallax drift, grain finish. Two modes: `.vitra-scenery` (full-page fixed) and `.vitra-scenery-inline` (container-scoped). Graceful gradient fallback where `mask-image` is unsupported; static under `prefers-reduced-motion`.
- `:focus-visible` rings on `.vitra-btn` and `.vitra-dropdown-item` (previously `outline: none` with no replacement on dropdown items).
- `Vitra.toast.destroy()` — clears pending timeouts, removes the toast container; wired into `Vitra.destroyAll()`.
- Governance docs: `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1), this `CHANGELOG.md`.
- CI: Windows build matrix (ubuntu + windows), `npm audit --audit-level=high` gate, weekly Dependabot (npm + github-actions).
- Root `index.html` demo page (scenery + glass panel + theme switcher).

### Changed

- Input validation states (`.vitra-input-valid` / `.vitra-input-invalid`) now use compound-selector specificity instead of `!important`.
- Reduced-motion coverage extended: toast transitions, dropdown menu, input-invalid shake, spotlight.
- `size-limit` budgets corrected to brotli-realistic gates (CSS 16 kB, JS 6 kB, ESM 8 kB vs 13.7/4.4/6.2 kB actual).
- Dev dependencies refreshed via `npm audit fix` (0 known vulnerabilities).

### Fixed

- **`@layer` order bug**: layer statement declared `layout` before `motion`, contradicting the documented and build-concatenation order — motion rules could lose cascade conflicts they should win.
- **Google Fonts `@import` removed** from `01-tokens.css` — the framework no longer triggers a third-party network request; fonts are opt-in for consumers.
- Emoji particles rendered twice (both `textContent` and CSS `::before` via `data-emoji`); now single render path.
- Toast `setTimeout` chain leaked timers if the page tore down mid-animation.
- Duplicate `.vitra-grid` declaration in utilities layer removed (layout layer owns it).

### Removed

- Orphaned `.vitra-slider-*` CSS fragments — no base `.vitra-slider` class ever shipped, despite the v1.0 changelog listing sliders. Corrected here.

## [1.7.2] - 2026-06-19

### Fixed

- Dropdown syncs `aria-expanded` on toggle and close, both popover and fallback paths.

## [1.7.1] - 2026-06-19

### Fixed

- `focusTrap` NodeList double-allocation cleaned up.

## [1.7.0] - 2026-06-19

### Changed

- Full code audit across all CSS and JS; `demo` branch made CDN-only; GitHub Pages `.nojekyll` fix.

### Fixed

- Glass components (`navbar`, `drawer`, `dropdown-menu`, `tooltip`, `toast`): hardcoded dark `hsl()` replaced with `--vitra-glass-bg` tokens; `@supports (backdrop-filter)` guards added.
- `ripple.destroy()` now actually removes its listener; double-init guarded.
- `data-config` theme string correctly passed as `{ default: value }`.
- `dropdown` `aria-expanded` synced on toggle and close-others.
- `_watchSystemTheme` listener deduplication.

## [1.6.0]

### Changed

- `will-change` audit — removed from non-animating elements.
- Build pipeline verified (lightningcss + esbuild).

### Removed

- Orphaned styles in `tooltip::before`.

## [1.5.0]

### Added

- Pure-CSS shader effects (`@layer shaders`): noise overlay, shape morphing, progress rings, gradient rotate borders, scroll-driven reveals, material ripple.
- Interactive demo site.

## [1.4.0]

### Added

- `aria-live` announcer for theme changes; `focus-visible` on all interactive components.

### Fixed

- Focus trap listener leak (modal `keydown` cleanup).
- `prefers-reduced-motion` coverage across all cinematic classes.

## [1.3.0]

### Added

- CSS container queries on responsive table (`.vitra-table-stack`).
- `@starting-style` transitions on modals, drawers, toasts, dropdowns.
- `dvh` units on modal sizing; `prefers-contrast: more` support.

## [1.2.0]

### Added

- Cinematic animations: mesh gradient backgrounds, glow orbs, gradient text, animated gradient borders, aurora background, text reveal, page enter, stagger system, 3D tilt cards.

## [1.1.0]

### Added

- Components: toasts, dropdowns, alerts, tables, skeleton loaders, spinners.
- Ripple click module, spotlight hover module, form validation states.

## [1.0.0]

### Added

- CSS `@layer` architecture, design token system, 7 preset themes.
- Glassmorphism system with `@supports` fallbacks.
- Particle system with device limits (40 desktop / 15 mobile).
- Motion engine, layout utilities, core components.
- Optional JS module (`window.Vitra`): theme, particles, reveal, modal, tooltip.
