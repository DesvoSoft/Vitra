# Scenery Polish & Hero Hierarchy — Design Spec

Date: 2026-07-15
Branches: `main` (framework), `demo` (demo site, worktree `../Vitra-demo-wt`)

## Problem

The demo hero's ambient scenery doesn't land as "premium high-tech":

1. **Stars read as a grid.** `.vitra-scenery-stars` is a single 300×200 SVG tile repeated — the repeat period is visible ("sorted in a matrix"). Stars are also fully static.
2. **Atmosphere depth is weak.** Far ridge doesn't melt into the sky; depth ladder between the three ridges is not convincing.
3. **Ridges look like flat paper cutouts** with artificial profiles — but silhouette masks are explicitly **out of scope for src/ changes** this release (approach A chosen after repeated past failures; a shading experiment happens in a throwaway preview only).
4. **Hero composition is cluttered** — too many CTAs, weak hierarchy.

## Scope decision (user-approved)

**Approach A + preview experiment:** conservative polish. Star system rebuilt, atmosphere colors retuned. Ridge silhouette masks in `src/09-scenery.css` are **not modified**. A mask-shading prototype is built in a standalone preview file for visual review only; porting it is a separate future effort contingent on user approval of what they see.

## Constraints (framework invariants)

- CSS-only, zero external assets — all imagery is inline data-URI SVG
- Compositor-only animation: `transform` and `opacity` exclusively; no `background-position` animation, no filters, no blend modes
- Colors derive from theme tokens (`--vitra-scenery-hue` / `--vitra-scenery-sat`); no hardcoded theme colors except white star dots
- `@media (prefers-reduced-motion: reduce)` must disable every new animation while keeping the static field visible
- Existing DOM contract unchanged: one `.vitra-scenery-stars` div; users' existing markup keeps working
- Star visibility theme rules unchanged (dark/neon/ocean + auto-dark only)

## 1. Star system (`src/09-scenery.css`)

One div, three drawing surfaces:

### 1a. Element background — grid breaker (static base)

Replace the single 300×200 tile with **two stacked data-URI star tiles** in one `background-image` list with per-layer `background-size`:

- Tile A: ~420×280, dense small stars (r 0.5–1.0, opacity 0.4–0.7)
- Tile B: ~660×440, sparse larger stars (r 0.9–1.5, opacity 0.6–0.9)

Two overlapping non-synchronized periods destroy perceivable repetition. Star positions inside each tile hand-scattered (no rows/columns, no equal spacing).

### 1b. `::before` — drifting/twinkling layer

- Third star tile (distinct size, e.g. ~540×360), medium density
- **Drift:** `translate3d` right-to-left — same direction as ridges/clouds (one wind), slower than clouds (~180s+ cycle). Seamless loop: pseudo-element oversized by exactly one tile width; keyframe translates exactly one tile width, landing on an identical frame.
- **Twinkle:** opacity keyframe (~0.5 → 0.9, irregular intermediate steps), ~9s ease-in-out infinite alternate. Combined with drift as comma-separated animations on the same pseudo-element.

### 1c. `::after` — shooting star

- Thin streak: ~2×90px `linear-gradient` (bright head fading to transparent tail), rotated ~35°
- One keyframe cycle 16–18s: streak translates diagonally (upper-right region toward mid-left) and fades in/out during the first ~6% of the cycle; invisible (opacity 0) for the rest
- Fixed path (CSS can't randomize); long period keeps it feeling occasional

### 1d. Stagger & accessibility

- Distinct durations + `animation-delay` per layer so nothing pulses in sync
- Reduced motion: all three animations `none`; static two-tile field remains
- Theme visibility rules copied unchanged for the pseudo-elements (they must also hide on light themes)

## 2. Atmosphere retune (`src/09-scenery.css`)

Gradient color stops and opacity tokens only — **mask URLs untouched**:

- **Far ridge:** top of gradient lighter + lower alpha and slightly desaturated, so the summit line melts into the sky glow (atmospheric haze)
- **Mid ridge:** mild desaturation; weight otherwise as-is
- **Near ridge:** bottom deepens toward near-black accent tint; slightly more contrast against mid
- **Sky:** horizon glow band slightly warmer/wider on the halo side so the far ridge has something to melt into
- Retune `--vitra-scenery-opacity-far/mid/near` defaults and the light/pastel overrides **together**; verify per theme: dark, light, pastel, neon, ocean

## 3. Mountain shading experiment (preview only — NOT in release)

- Standalone `scenery-preview.html` in the session scratchpad; openable via `file://` (all data-URI, no fetches)
- Shows current scenery next to a variant whose ridge masks contain interior paths at `fill-opacity` ~1.0/0.7/0.45 — producing slope shading that follows the silhouette
- User reviews in browser. Approve → separate follow-up effort to port. Reject → file deleted; `src/` never touched by this experiment

## 4. Hero hierarchy (demo branch)

- Hero CTAs reduced to exactly 2: primary **Get Started** → `#quick-start`, ghost **GitHub** (external)
- Remove remaining hero buttons; adjust spacing so title → subtitle → CTA pair reads as one clear ladder
- No other hero content changes in this effort

## 5. Release & sync

1. Framework (`main`): implement §1–§2 → `npm run build` → run existing test suite → bump **v1.10.0** (new star behaviors = minor features) → commit
2. Demo (`demo` branch worktree): bump CDN URLs + version badges to v1.10.0, apply §4 CTA cut, verify all themes in browser

## Out of scope

- Any change to ridge silhouette mask SVGs in `src/`
- Trees / treeline detail
- Hero content beyond CTA reduction (no code snippet, no live component teaser)
- New DOM requirements for scenery users

## Verification

- Browser check on demo page across 5 themes: no visible star grid, twinkle subtle, drift direction matches ridges, shooting star fires ~once per 16–18s
- DevTools rendering: no repaint storms; star/streak layers composited (transform/opacity only)
- `prefers-reduced-motion: reduce` emulation: static stars visible, nothing moves
- Light/pastel: star layers fully hidden
