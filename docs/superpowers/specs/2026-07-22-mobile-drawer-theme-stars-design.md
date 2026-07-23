# Mobile drawer, theme-switch fluidity, star twinkle — design

## Problem

Three unrelated polish issues surfaced during mobile/theme review:

1. Mobile navbar drawer: links are hard to read/tap, and the last one or two links are clipped off-screen — not scrollable into view.
2. Theme switching feels abrupt: colors jump instantly with no transition, and there's a visible flash on page load when a stored non-default theme swaps in after first paint.
3. Scenery star field twinkles as one uniform layer (all stars brighten/dim in lockstep) instead of individual stars flickering asynchronously.

## Scope split

Framework fixes (this repo, `main`) vs. demo-page-only fix (`Vitra-demo-wt`, `demo` branch) are called out per item below. Framework changes ship in `src/`; the demo fix only touches `Vitra-demo-wt/index.html`.

## 1. Drawer viewport truncation (framework)

**Root cause:** `.vitra-drawer` (`src/06-components.css:585`) sets `height: 100vh`. Mobile browsers include the space behind the collapsible URL bar in `100vh`, so the drawer's box is taller than the actually-visible viewport. `overflow-y: auto` is already present on the drawer, but the last links still render below the real visible fold.

**Fix:** cascade to dynamic viewport height:
```css
.vitra-drawer {
  height: 100vh; /* fallback for browsers without dvh */
  height: 100dvh;
  ...
}
```
No `@supports` needed — browsers that don't understand `100dvh` simply ignore that declaration and keep the `100vh` fallback.

## 2. Drawer legibility & tap targets (framework)

**Links:** `.vitra-drawer-link` padding increases from `--vitra-space-2 --vitra-space-3` to values that guarantee a ≥44px tap height (WCAG 2.5.5 / mobile HIG minimum), and font-size steps up one size for readability.

**Burger button:** `.vitra-burger` is currently 28×28px with no padding — the icon itself scales up slightly but the real fix is padding the hit area to 44×44 without inflating the visual glyph size (padding added around the existing 28px icon box, `box-sizing: content-box` equivalent sizing).

**Drawer close button:** `.vitra-drawer-close` is currently 32×32px — bumped to 44×44 the same way.

Both burger and close icon lines/glyphs stay visually similar in size; only the clickable/tappable box grows.

## 3. Theme switch fluidity (framework + demo)

### 3a. Abrupt color jump (framework)

Add a scoped global transition covering theme-affected properties (`background-color`, `color`, `border-color`, `box-shadow`) using the existing `--vitra-duration-normal` / `--vitra-ease-luxury` tokens, applied broadly across framework surfaces rather than per-component opt-in.

Exclusions (must not be caught by the broad rule):
- `.vitra-scenery-*` layers and any particle/animation elements that already animate continuously — a generic transition on these would visibly stutter against their existing keyframe animations.
- Respect `prefers-reduced-motion: reduce` (existing pattern in the codebase — no transition when set).

### 3b. Load-time flash (FOUC) (framework doc + demo)

**Root cause:** `Vitra.theme.init()` (`src/vitra.js`) runs on `DOMContentLoaded`, which fires after first paint. If a stored theme differs from the `data-theme` value already in the HTML markup (typically `auto`), the user sees the page render once in the wrong theme, then flip.

**Fix:** this cannot be solved inside `vitra.js` itself, since by the time any linked/deferred script executes, first paint has already happened. The correct fix is a tiny inline `<head>` script, before any stylesheet, that reads `localStorage` synchronously and sets `data-theme` on `<html>` before CSS ever paints:

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem('vitra-theme');
      if (t) document.documentElement.dataset.theme = t;
    } catch (e) {}
  })();
</script>
```

- **Framework side:** document this snippet in `docs/integration.md` as the recommended head-first setup, alongside the existing `Vitra.theme.init()` guidance (init still needed for `auto`/system-theme watching and first-run persistence — this snippet only prevents the visible flash).
- **Demo side (`Vitra-demo-wt`):** add this snippet to `index.html`'s `<head>`, before the Vitra stylesheet link.

## 4. Asynchronous star twinkle (framework)

**Current behavior:** `.vitra-scenery-sky::before` (`src/09-scenery.css:252`) is the only star layer that animates, using `vitra-scenery-stars-twinkle` — a single opacity keyframe applied to the entire layer, so all stars brighten/dim together.

**Constraint (documented in the existing CSS):** the masked `.vitra-scenery-stars` layer is deliberately static — animating transforms/opacity inside a masked group forces per-frame re-rasterization of the whole mask, which is why the existing drift/twinkle animation was moved to the unmasked `.vitra-scenery-sky::before` pseudo-element instead.

**Fix:** keep `.vitra-scenery-stars` static as-is. Add 2–3 additional small unmasked star-cluster pseudo-layers (same pattern already used for the drift layer and shooting star — hosted on `.vitra-scenery-sky`, theme-gated to the same dark-appropriate themes), each with:
- a distinct small SVG data-URI point cluster,
- its own `vitra-scenery-stars-twinkle` animation `animation-duration`,
- a negative `animation-delay` so cycles start out of phase.

This desynchronizes brightness across clusters instead of one uniform pulse. True per-individual-star desync would require far more elements than is practical in a data-URI SVG background layer; clustering into 3–4 out-of-phase groups is the approximation, consistent with how drift/shooting-star are already layered.

## 5. Cloud layer horizontal seam (framework)

**Root cause:** `.vitra-scenery-clouds` (`src/09-scenery.css`) is a box `height: 45%` anchored at `top: 0`. Its background gradient (`linear-gradient(to top, warm/55% 0%, faint/8% 100%)`) is solid warm color at `0%` — the bottom of the gradient direction, which is also the box's hard bottom edge. That edge sits at a fixed height mid-scene (roughly where a vertically-centered hero title lands), and composites against the independent sky gradient below it, producing a visible thin horizontal seam where the two layers' colors meet without blending.

**Fix:** fade the clouds gradient to `transparent` at both ends instead of only at the top, moving peak brightness to the middle of the band:
```css
background: linear-gradient(
  to top,
  transparent 0%,
  hsl(var(--vitra-scenery-warm-h) calc(var(--vitra-scenery-sat) * 0.75) 74% / 55%) 22%,
  hsl(var(--vitra-scenery-hue) calc(var(--vitra-scenery-sat) * 0.2) 88% / 8%) 100%
);
```

## 6. Parallax layer speed contrast (framework)

**Root cause:** ridge drift durations (`src/09-scenery.css`) were `far: 260s`, `mid: 150s`, `near: 75s` — a 1.73x and 2x step between adjacent layers. All three layers tile at the same relative scale (`mask-size: 50% 100%` on a `200%`-wide parent), so speed differences are duration-driven only; with cycles this long (75s+), the relative difference read as "barely moving" rather than distinct parallax depth.

**Fix:** widen the spread between layers (`mid` kept as pivot at `150s`):
- far: `260s → 340s`
- mid: `150s` (unchanged)
- near: `75s → 45s`

New ratios: far/mid 2.27x, mid/near 3.33x, far/near ~7.6x (was 3.5x) — three perceptibly distinct speeds instead of a narrow band.

## Testing

No test framework in this repo (per `CLAUDE.md`) — validate manually:
- Drawer: open on a real mobile viewport (or DevTools device toolbar with URL bar simulation) at various content lengths; confirm all links reachable via scroll and tap targets feel comfortable.
- Theme switch: toggle between themes and confirm smooth color transition; reload with a non-default stored theme and confirm no flash.
- Stars: visually confirm clusters twinkle out of phase in dark/neon/ocean themes.
- `prefers-reduced-motion: reduce`: confirm theme transition is disabled.
