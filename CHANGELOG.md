# Changelog

All notable changes to Vitra CSS are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.11.1] - 2026-07-22

### Fixed

- **Dropdown menus almost invisible**: `.vitra-dropdown-menu` reused `--vitra-glass-bg`, a token tuned for large glass panels (navbar, drawer) sitting over the controlled scenery backdrop — 3-5% alpha on dark-family themes, functionally invisible over arbitrary page content behind a small floating menu. New `--vitra-glass-bg-menu` token (stronger, ~88-92% alpha) is now dedicated to dropdown menus; other glass surfaces are untouched.
- **Light/pastel/auto(light) glass tint never applied**: `--vitra-glass-bg`/`--vitra-glass-bg-menu` per-theme overrides lived in the `tokens` layer (`00-themes.css`), but the `glass` layer's own `:root` default is declared later in the `@layer` order (`tokens, glass, ...`) — layer order always wins over selector specificity, so the glass layer's generic 3% default silently beat every theme override regardless of how specific the selector was. Overrides for all themes now live in `02-glass.css`, in the same layer as the default they're meant to override.
- **Off-canvas drawer bled onscreen at narrow widths**: `.vitra-drawer` used content-box sizing, so its padding/border inflated the rendered box past the 80%/320px basis that `right: -100%` assumes — below ~400px viewport width the true left edge landed inside the viewport, visible without toggling the burger. `box-sizing: border-box` brings the rendered box back in line with the offscreen math.
- **Light/pastel ridges and sun read as flat grey/pale wash**: ridge fills and the sun disc reused dark theme's lightness/alpha ladder, tuned to punch through a near-black sky. Alpha-composited over light theme's ~97%-lightness sky, those values averaged toward flat grey instead of solid color. Added light/pastel-specific ridge and halo values with lower lightness and higher saturation/alpha so mountains and sun read with real depth.
- **Cloud layer horizontal seam behind hero title**: the cloud band's gradient had a hard color stop at its bottom edge (45% down the scene) instead of fading to transparent, so the box boundary was visible as a seam against the sky beneath. Also widened the parallax speed contrast between ridge layers (far: 260s→340s, near: 75s→45s) for a more convincing depth cue.
- **Hero title seam from clustered gradient stops**: the sky background gradient, star-field mask, and ridge-far's box edge all had their falloff curvature centered on the same vertical band, creating a Mach-band illusion of a hard horizontal line behind the hero title even though no single layer had an actual edge there. Staggered the sky gradient and star mask fade stops so the transitions no longer overlap.

## [1.11.0] - 2026-07-17

### Added

- **Scenery — alpenglow light system**: warm horizon band derived from the theme accent (`--vitra-scenery-warm-h`, `calc(hue - 140)`), warm rim light tracing the ridge crests (masked `::before` sharing the silhouette mask, riding the same parallax transform), valley mist pools anchored to the afterglow, and clouds lit from below. The light now *touches* the landscape instead of coexisting with it.
- **Scenery — full moon**: the halo is a textured disc (faint maria via radial-gradients) positioned by tokens in the upper third, clear of hero headlines. New `.vitra-scenery-halo-crescent` modifier renders a crescent. On `light`/`pastel` the disc reads as a warm low sun.
- **Scenery tokens**: `--vitra-scenery-warm-h`, `--vitra-scenery-glow-x`, `--vitra-scenery-halo-x`, `--vitra-scenery-halo-y`, `--vitra-scenery-halo-size`, `--vitra-scenery-opacity-rim`.

### Changed

- **Scenery**: ridge silhouettes paint in `::after` pseudos (divs are now unmasked animation carriers) — user markup contract unchanged, parallax drift untouched, zero new animations.
- **Scenery**: cloud mask is now thin horizontal wisps (dusk stratus) instead of puffy ellipse blobs; under-lit warm gradient in dark schemes.
- **Scenery**: uniform mist bands on ridge tops removed — replaced by crest rim light and valley mist.

### Fixed

- **Scenery**: light/pastel token overrides (ridge/cloud opacities) were declared with zero-specificity `:where()` and could never override the `:root` defaults — they now use attribute selectors and actually apply. Light schemes also pin `--vitra-scenery-warm-h: 32` (true amber) since the derived complement lands on lime/cyan for their accents.

## [1.10.3] - 2026-07-17

### Fixed

- **Auto-init**: pages without a `[data-config]` element regained default module initialization (ripple, tooltip, dropdown, spotlight). The v1.10.0 gating change moved `dropdown.init()`/`spotlight.init()` inside `_parseDataConfig`, which returned early when no `[data-config]` existed — turning the documented opt-out (`"dropdown": false`) into an accidental opt-in and silently breaking dropdowns on any page that never declared `data-config`. `_parseDataConfig` now treats a missing/unparseable `data-config` as `{}` and still initializes the `!== false` modules. Regression guard added in `tests/autoinit.test.js`.
- **Auto-init**: `_parseDataConfig` referenced the outer `Vitra` const, which throws a TDZ `ReferenceError` when the script initializes synchronously (document already parsed, e.g. dynamic import). Module init calls now use the internal module references directly.

## [1.10.2] - 2026-07-15

### Performance

- **Scenery**: animated star layers (drift/twinkle tile and shooting star) moved off the masked `.vitra-scenery-stars` element onto `.vitra-scenery-sky::before`/`::after`. A mask is a group effect — transform-animated children inside a masked group can force the whole group to re-rasterize every frame. The stars element is now static-only under its mask (rasterized once); each animated layer composites on its own layer and carries its own copy of the vertical fade mask (drift is horizontal-only, so a mask traveling with the layer is visually identical). Sky pseudos are visibility-gated to dark themes, brightness pre-multiplied by the 0.8 the old parent contributed. No markup change.

### Changed

- **Scenery**: parallax slowed further and spread wider apart for motion comfort and clearer depth (near 55s → 75s, mid 100s → 150s, far 160s → 260s, clouds 260s → 400s; ratio now ~1 : 2 : 3.5).
- **Scenery**: mid ridge lightened and hue-shifted (−8) into a far(−15) → mid(−8) → near(+20) hue ladder — stronger contrast between the dark near treeline and the range behind it.
- **Scenery**: clouds softened — opacity tokens 0.35 → 0.28 (dark) / 0.5 → 0.42 (light), gentler per-ellipse mask densities, and low-opacity skirt ellipses feathering each formation's underside.

## [1.10.1] - 2026-07-15

### Fixed

- **Scenery**: stars no longer show through the semi-transparent ridges — the star field now occupies only the upper 58% of the scene and fades out via a linear-gradient mask before the ridge peaks begin (mask on the parent also clips the drift/twinkle pseudo-layers).

### Changed

- **Scenery**: ridge parallax slowed to roughly half speed (far 90s → 160s, mid 55s → 100s, near 30s → 55s; clouds 130s → 260s) — same differential-speed ordering, calmer scene.
- **Scenery**: cloud mask redrawn as five distinct formations (three-lobe cumulus, thin stratus wisp, tall double-lobe, small high wisp, medium cluster) at varied altitudes with per-ellipse `fill-opacity` density — clouds no longer read as identical blobs.
- **Scenery**: twinkle rebuilt as an irregular 8-stop 13s cycle (end = start, no `alternate`) instead of the uniform 9s ping-pong — shimmer no longer reads as a metronome.

## [1.10.0] - 2026-07-15

### Added

- **Scenery**: star field rebuilt as three overlapping data-URI tiles (660×440 + 420×280 on the base element, 540×360 on `::before`) — non-synchronized tile periods eliminate the visible repeat grid a single tile produced. No new DOM: same single `.vitra-scenery-stars` div.
- **Scenery**: star drift layer — `::before` tile drifts right-to-left with the scene wind (`--vitra-scenery-speed` aware, slower than clouds) with a staggered opacity twinkle riding the same pseudo-element. Seamless loop: layer oversized by exactly one tile width, translates exactly one tile width.
- **Scenery**: occasional shooting star (`::after`) — thin gradient streak falling down-left during the first ~5% of a 17s cycle. Transform/opacity only, like every other scenery animation.
- All new star animations disabled under `prefers-reduced-motion` (static two-tile field stays visible; streak fully hidden).

### Changed

- **Scenery** atmospheric depth retune: far ridge melts into the sky haze (lighter, desaturated, lower-alpha summit stops; `--vitra-scenery-opacity-far` 0.6 → 0.55 on dark schemes), mid ridge mildly desaturated, near ridge deepened (18%→5% lightness ramp at higher alpha), dark-sky horizon band slightly warmer (+8 hue) and stronger. Light/pastel overrides untouched.

## [1.9.0] - 2026-07-14

### Added

- **Scenery**: cloud layer (`.vitra-scenery-clouds`) and star field (`.vitra-scenery-stars`, gated to dark-appropriate themes) — eight scenery layers total, same seamless one-direction parallax drift as the existing ridges, full `prefers-reduced-motion` coverage. Atmospheric radial-gradient grading added to `.vitra-scenery-sky`, no new DOM.
- **Scenery**: far and near ridge layers shift hue away from the base `--vitra-scenery-hue` token (`-15deg` far, `+20deg` near) instead of sharing one hue and varying only lightness/saturation. A flat lightness ramp read as "the same mountains, just darker" toward the front; the hue shift gives each layer a genuinely distinct atmospheric tint (far: hazier/warmer toward the horizon glow; near: cooler/deeper foreground shadow), verified across all 8 themes with no clipping or banding.
- **Directional particles** (opt-in, non-breaking): `Vitra.particles.spawn(count, { direction })` accepts `'down'`, `'down-left'`, `'down-right'`, or a numeric degree angle. Particles fade in, drift toward that angle, and fade out via a new `vitra-particle-drift` keyframe. Omitting `direction` keeps the existing symmetric `vitra-particle-float` bob byte-identical. Declarative `data-vitra-particle-direction` attribute supported in the auto-init path.
- `--vitra-color-accent-rgb` per-theme overrides for `light`, `pastel`, `neon`, `ocean`, `emerald`, and `auto`'s light-media branch — the token was previously only defined once at `:root`, so every non-default theme silently kept the dark theme's RGB triplet instead of its own accent color (same class of bug `--vitra-color-border-rgb` had before v1.8.6).
- Dropdown `Escape` key support in the non-popover fallback path — closes any open dropdown and refocuses its toggle. Popover-based dropdowns already got this for free from the browser's native light-dismiss behavior.

### Fixed

- `dist/vitra.d.ts` was missing `destroy()` on the `RevealModule`, `ModalModule`, and `TooltipModule` interfaces despite all three existing at runtime. Found by extending the `.d.ts` drift-guard test to cover every module, not just `ripple`/`dropdown`/`spotlight`/`toast`.

### Known issues

- `Vitra.theme` is structured as a plain object literal rather than a closure like every other module, so its `_getSystemTheme`/`_isLocalStorageAvailable`/`_watchSystemTheme` helpers leak onto the public object as real enumerable own-properties instead of staying private. Tracked in ROADMAP as R7; deferred rather than restructuring the module mid-release.

## [1.8.6] - 2026-07-14

### Fixed

- `tooltip.destroy()` used a `cloneNode`/`replaceChild` trick to strip listeners, unlike every other module's explicit `removeEventListener` teardown. `init()` now stores each element's four listener references in a `WeakMap`; `destroy()` removes them explicitly.
- Focus-trap autofocus used `setTimeout(fn, 100)`, a guessed fixed delay. Replaced with a double `requestAnimationFrame`, which waits for the open paint to actually commit.
- `--vitra-color-border-rgb` was hardcoded white (`255, 255, 255`) at the base token level with no per-theme override — `.vitra-glass`'s border rendered white-on-near-white (invisible) on the `light`/`pastel` themes and `auto`'s light-media branch. Added theme-appropriate dark-tint overrides for those three.
- Stray Spanish comment in `05-layout.css` translated to English.

### Removed

- Dead keyframes `vitra-shimmer` and `vitra-aurora-hue` — no `animation:` reference anywhere in the codebase.

### Added

- Real interaction tests for `dropdown` (open/close/`aria-expanded` cycle, closing sibling dropdowns, no-op after `destroy()`) and `spotlight` (`--mouse-x`/`--mouse-y` update on `mousemove`, no-op after `destroy()`), replacing the old smoke-only "doesn't throw" tests. This closes the 29-item enterprise audit pass started in v1.8.0.

## [1.8.5] - 2026-07-14

### Removed

- **Dead tokens** `--vitra-color-accent-oklch`, `--vitra-color-bg-warm`, `--vitra-color-bg-cool` — defined at the base and overridden across four theme blocks, never consumed by any `var()` reference anywhere in the codebase. This was audit item 12, marked complete on the internal tracker despite a test still asserting the tokens must exist, which meant they were never actually deleted. Removed from source; the test now asserts they stay gone.

## [1.8.4] - 2026-07-14

### Fixed

- **Glass fallback leaks** — `.vitra-input-glass`, `.vitra-badge-glass`, `.vitra-spinner-glass`, `.vitra-alert-glass`, `.vitra-table-glass` set a translucent `hsl()` background with no `@supports` guard at all, so the glass look silently applied even where `backdrop-filter` isn't supported, with no opaque fallback underneath. Each now gets a solid fallback background outside `@supports`, translucent + blur only inside the positive branch, matching the pattern already used elsewhere in the framework.
- `02-glass.css`'s size-variant fallback rule (`.vitra-glass-sm/md/lg/xl`) was unconditional, silently overriding the enhanced translucent background in every browser that DOES support `backdrop-filter` since both rules matched and the fallback came later in source order. Scoped it to `@supports not (...)`.
- `.vitra-table-stack` had identical rule sets duplicated verbatim under both a `@container` query and a `@media` query, so both fired redundantly in browsers that support container queries. The `@media` fallback is now scoped behind `@supports not (container-type: inline-size)` so only one is ever active.
- `.vitra-container-sm` used the same max-width as plain `.vitra-container` at its md breakpoint (720px) — the "sm" variant wasn't actually narrower. Added `--vitra-container-narrow` (560px) and pointed the class at it.
- `dropdown.init()`/`spotlight.init()` ran unconditionally on `DOMContentLoaded` regardless of `data-config`, unlike `ripple`/`tooltip` which already respect a `!== false` opt-out. Both now gate on `config.dropdown`/`config.spotlight`.
- `vitra.d.ts` was stale against the runtime module: the `ripple` module and `destroyAll()` weren't declared at all, and `destroy()` was missing from the `Toast`/`Dropdown`/`Spotlight` interfaces. Synced all four; added a drift-guard test that diffs `Object.keys()` of each runtime module against its declared interface so future drift fails CI instead of shipping silently-wrong types.

### Added

- CI now fails a tagged release if `package.json`'s version doesn't match the pushed git tag (`v*`).

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
