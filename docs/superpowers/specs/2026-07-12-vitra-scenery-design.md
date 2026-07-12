# Vitra Scenery — Ambient Blob Landscape

Status: approved, pending implementation
Date: 2026-07-12

## Problem

Vitra's glass system (`02-glass.css`) gives panels a frosted-window look, but there's nothing behind them — panels blur a flat `--vitra-color-bg` color. The goal: make `.vitra-glass` feel like an actual window onto a scene, not a translucent card floating on a solid fill. Should feel premium, alive, never-seen-before, but stay CSS-only (no images, no JS, no canvas/WebGL) and cheap enough to run everywhere.

## Concept

A new ambient background system, `.vitra-scenery`, rendering an abstract "blob landscape": a horizon of soft organic shapes at three depths, plus a diffuse light halo and a subtle grain texture. Pure CSS animation — slow, continuous, non-interactive drift. No parallax, no mouse/scroll coupling (keeps it CSS-only and consistent with the framework's zero-JS-required core philosophy).

## Layer Stack

Six layers, each `position: absolute; inset: 0` inside a container with `overflow: hidden`:

1. **`sky`** — full-bleed gradient base, from `--vitra-color-bg` toward a hue derived from the theme's accent.
2. **`halo`** — large diffuse radial-gradient light source (sun/moon-like), fixed near the top, opacity drifts slowly.
3. **`ridge-far`** — 2–3 very large organic blobs (asymmetric `border-radius`), heavy blur, lowest opacity, slowest horizontal drift (~50–60s cycle).
4. **`ridge-mid`** — mid-sized blobs, medium blur, distinct drift speed/direction from `ridge-far` (creates false parallax via differential speed, not real interaction).
5. **`ridge-near`** — smaller, more saturated/defined blobs, light blur, anchored toward the bottom, highest visual contrast of the three ridge layers.
6. **`grain`** — SVG `feTurbulence` data-URI noise texture, `mix-blend-mode: overlay`, very low opacity — breaks up flat gradient banding, adds a premium non-digital finish.

All motion: `transform: translate/scale` only, `ease-in-out infinite alternate`, multi-second durations (never abrupt). No layout-affecting properties animated.

## Theming

No per-theme CSS duplication. All color derives from the existing `--vitra-color-accent-h/-s/-l` tokens already defined per theme in `00-themes.css`. New tokens:

```css
--vitra-scenery-hue: var(--vitra-color-accent-h);
--vitra-scenery-sat: var(--vitra-color-accent-s);
--vitra-scenery-speed: 1;              /* global speed multiplier */
--vitra-scenery-blur-far/-mid/-near
--vitra-scenery-opacity-far/-mid/-near
```

A theme can override `--vitra-scenery-hue` directly if it ever needs a manual tone, but none require it initially — all 7 themes (light/dark/pastel/neon/ocean/emerald/auto) inherit automatically via the accent hue.

## Usage Modes

- **`.vitra-scenery`** — `position: fixed; inset: 0; z-index: -1;` — full-page ambient backdrop, sits behind all content.
- **`.vitra-scenery-inline`** — `position: absolute; inset: 0;` — drop into any `position: relative; overflow: hidden` container (hero section, large card) for a localized scene.

Both share the same six-layer internal structure/markup contract; only the outer positioning class differs.

## Markup Contract

```html
<div class="vitra-scenery" aria-hidden="true">
  <div class="vitra-scenery-sky"></div>
  <div class="vitra-scenery-halo"></div>
  <div class="vitra-scenery-ridge-far"></div>
  <div class="vitra-scenery-ridge-mid"></div>
  <div class="vitra-scenery-ridge-near"></div>
  <div class="vitra-scenery-grain"></div>
</div>
```

`aria-hidden="true"` always — purely decorative, never carries content.

## Performance & Responsiveness

- Only `transform` and `opacity` animated — compositor-only, no repaint/reflow.
- `will-change: transform` on ridge layers only (not sky/grain, which don't move via transform).
- Blur via `filter: blur()` on the blob layers directly (not `backdrop-filter` — this is the backdrop, nothing to see through).
- **Mobile** (`@media (width <= 768px)`, matching the existing pattern in `03-particles.css`): reduce blur tokens, hide `ridge-far` entirely (least perceptible layer, most expensive), leaving 4 active layers.
- **`prefers-reduced-motion: reduce`**: all animations set to `none`; layers stay static at their mid-cycle position — landscape remains visible, just motionless.

## File & Build Wiring

- New file: `src/09-scenery.css`, new `@layer scenery`.
- Layer order update in `src/01-tokens.css`: `tokens, glass, particles, motion, scenery, layout, components, utilities, shaders` (scenery sits after motion/particles, before layout — it's ambient background, must lose to any real layout/component stacking).
- Add `'09-scenery.css'` to `sourceFiles` in `scripts/build-css.js`, positioned to match the layer order.
- Note: build script's `sourceFiles` list already includes `08-shaders.css`, which isn't mentioned in CLAUDE.md's documented layer list — pre-existing drift, out of scope for this spec, flagged separately.

## Out of Scope (explicitly rejected during design)

- Mouse/scroll-driven parallax — rejected in favor of CSS-only ambient drift (no JS dependency for the base effect).
- Per-theme geometry variants (different blob shapes per theme) — rejected in favor of single geometry + token-driven palette, for maintainability.
- Selectable landscape "shape" variants (waves/hills/grid via `data-landscape`) — rejected for v1, not ruled out for future.

## Verification Plan

- Visual check across all 7 themes + `auto` in both color-scheme branches.
- `prefers-reduced-motion: reduce` toggle in DevTools — confirm static, no jank.
- Mobile viewport (< 768px) — confirm `ridge-far` absent, reduced blur, no dropped frames on a throttled CPU profile.
- `.vitra-scenery-inline` inside a card/hero container — confirm containment (`overflow: hidden` on host), no bleed outside bounds.
- Bundle size delta — measure `dist/vitra.min.css` before/after, ensure still within (or informs) the `size-limit` budget being finalized in the parallel audit-fix work.
- Stack with `.vitra-glass` panel on top — confirm the "window" effect reads correctly (glass panel + scenery behind = intended final look).
