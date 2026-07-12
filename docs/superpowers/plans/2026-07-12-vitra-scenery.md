# Vitra Scenery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `.vitra-scenery` — a CSS-only, six-layer ambient blob-landscape backdrop (full-page and inline variants) that gives `.vitra-glass` panels an actual "window onto a scene" feel, themed automatically via existing accent tokens, safe on mobile and under `prefers-reduced-motion`.

**Architecture:** New `src/09-scenery.css` file, new `@layer scenery` inserted into the existing cascade after `motion`/`particles` and before `layout`. Six absolutely-positioned pseudo/child layers (sky, halo, ridge-far, ridge-mid, ridge-near, grain) driven entirely by `transform`/`opacity` keyframes and derived from `--vitra-color-accent-h/-s/-l`. No JS. Wired into `scripts/build-css.js` and demonstrated in a new demo section.

**Tech Stack:** Plain CSS (`@layer`, custom properties, `@keyframes`, `@supports`, `@media`), existing `lightningcss` minify pipeline, existing `stylelint` config.

## Global Constraints

- All classes prefixed `.vitra-`, all new tokens prefixed `--vitra-` (per project CLAUDE.md).
- Every animated layer must have a `@media (prefers-reduced-motion: reduce)` override (per project CLAUDE.md).
- No `@import` in CSS source — build concatenates files (per project CLAUDE.md).
- `dist/` files are committed — rebuild after every source change (per project CLAUDE.md).
- Layer order after this change: `tokens, glass, particles, motion, scenery, layout, components, utilities, shaders` (per spec).
- Decorative-only markup: root scenery element always carries `aria-hidden="true"` (per spec).
- Only `transform`/`opacity` may be animated — compositor-only, no layout-affecting animated properties (per spec).
- Mobile breakpoint matches existing project convention: `@media (width <= 768px)` (per spec, matching `03-particles.css`).
- No mouse/scroll JS coupling in this plan — ambient drift only (per spec, explicitly out of scope).
- `npm run lint` (stylelint) must pass on all new CSS.

---

## File Map

- Create: `src/09-scenery.css` — the entire scenery system (tokens, six layers, keyframes, mobile override, reduced-motion override, `@supports` grain guard).
- Modify: `src/01-tokens.css:8` — update the `@layer` statement to insert `scenery`.
- Modify: `scripts/build-css.js` — add `'09-scenery.css'` to `sourceFiles` in correct order.
- Modify: `README.md` — add a "Scenery" section to the component/feature list (short, matches existing doc style; exact insertion point identified in Task 6).
- Modify: `docs/integration.md` — add markup + usage snippet (mirrors how other components are documented there).
- Create/Modify demo: since no `index.html` currently exists in the repo (confirmed absent during brainstorming), Task 6 creates a minimal `index.html` demo root containing a working scenery example plus a glass panel on top, matching what CLAUDE.md's "Validate manually via index.html demo page in browser" instruction expects to exist.

## Interfaces (for later tasks / future maintainers)

- Root class: `.vitra-scenery` (fixed, full-page) / `.vitra-scenery-inline` (absolute, container-scoped). Both require the six fixed child classes below, in this exact order/naming — no BEM modifiers, no variants beyond mobile/reduced-motion media overrides:
  - `.vitra-scenery-sky`
  - `.vitra-scenery-halo`
  - `.vitra-scenery-ridge-far`
  - `.vitra-scenery-ridge-mid`
  - `.vitra-scenery-ridge-near`
  - `.vitra-scenery-grain`
- Tokens (all under `:root` in the `scenery` layer, theme-independent — themes only ever touch `--vitra-color-accent-h/-s/-l` which these derive from):
  - `--vitra-scenery-hue` (default: `var(--vitra-color-accent-h)`)
  - `--vitra-scenery-sat` (default: `var(--vitra-color-accent-s)`)
  - `--vitra-scenery-speed` (default: `1`, unitless multiplier — consumed via `calc()` in each layer's `animation-duration`)
  - `--vitra-scenery-blur-far` / `--vitra-scenery-blur-mid` / `--vitra-scenery-blur-near`
  - `--vitra-scenery-opacity-far` / `--vitra-scenery-opacity-mid` / `--vitra-scenery-opacity-near`

---

## Task 1: Scaffold the file, layer wiring, and base tokens

**Files:**
- Create: `src/09-scenery.css`
- Modify: `src/01-tokens.css:8`
- Modify: `scripts/build-css.js:11-21`

**Interfaces:**
- Produces: the `@layer scenery { }` block (empty body for now, just tokens), and the corrected build order, that every subsequent task adds rules into.

- [ ] **Step 1: Update the layer order in `src/01-tokens.css`**

Current line 8:
```css
@layer tokens, glass, particles, motion, layout, components, utilities, shaders;
```

Replace with:
```css
@layer tokens, glass, particles, motion, scenery, layout, components, utilities, shaders;
```

- [ ] **Step 2: Add `09-scenery.css` to the build script**

In `scripts/build-css.js`, the `sourceFiles` array currently reads:
```js
const sourceFiles = [
  '01-tokens.css',    // Foundation tokens layer (Base)
  '00-themes.css',    // Theme definitions (Overrides base tokens)
  '02-glass.css',     // Glass layer
  '03-particles.css', // Particles layer
  '04-motion.css',    // Motion layer
  '05-layout.css',    // Layout layer
  '06-components.css', // Components layer
  '07-utilities.css',  // Utilities layer
  '08-shaders.css'     // Shaders layer (premium CSS effects)
];
```

Replace with:
```js
const sourceFiles = [
  '01-tokens.css',    // Foundation tokens layer (Base)
  '00-themes.css',    // Theme definitions (Overrides base tokens)
  '02-glass.css',     // Glass layer
  '03-particles.css', // Particles layer
  '04-motion.css',    // Motion layer
  '09-scenery.css',   // Scenery layer (ambient blob-landscape backdrop)
  '05-layout.css',    // Layout layer
  '06-components.css', // Components layer
  '07-utilities.css',  // Utilities layer
  '08-shaders.css'     // Shaders layer (premium CSS effects)
];
```

- [ ] **Step 3: Create `src/09-scenery.css` with header and base tokens**

```css
/* 09-scenery.css - Ambient Scenery System */

/* Part of Vitra CSS Framework */

/* ============================================
   SCENERY LAYER - Vitra CSS Framework
   CSS-only ambient blob-landscape backdrop.
   Gives .vitra-glass panels a "window onto a
   scene" feel instead of a flat color fill.
   Six layers: sky, halo, ridge-far/mid/near, grain.
   ============================================ */

@layer scenery {
  :root {
    /* --- SCENERY COLOR TOKENS (derived from theme accent) --- */
    --vitra-scenery-hue: var(--vitra-color-accent-h);
    --vitra-scenery-sat: var(--vitra-color-accent-s);

    /* --- SCENERY MOTION TOKENS --- */
    --vitra-scenery-speed: 1;

    /* --- SCENERY BLUR TOKENS --- */
    --vitra-scenery-blur-far: 60px;
    --vitra-scenery-blur-mid: 40px;
    --vitra-scenery-blur-near: 24px;

    /* --- SCENERY OPACITY TOKENS --- */
    --vitra-scenery-opacity-far: 0.35;
    --vitra-scenery-opacity-mid: 0.45;
    --vitra-scenery-opacity-near: 0.55;
  }
}
```

- [ ] **Step 4: Rebuild and verify no errors**

Run: `npm run build:css`
Expected: completes with no errors, prints `Created: dist/vitra.min.css (N bytes)`.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no errors reported for `src/09-scenery.css` or `src/01-tokens.css`.

- [ ] **Step 6: Commit**

```bash
git add src/09-scenery.css src/01-tokens.css scripts/build-css.js
git commit -m "feat(scenery): scaffold scenery layer, tokens, and build wiring"
```

---

## Task 2: Root containers — `.vitra-scenery` and `.vitra-scenery-inline`

**Files:**
- Modify: `src/09-scenery.css`

**Interfaces:**
- Consumes: nothing beyond Task 1's tokens.
- Produces: `.vitra-scenery` and `.vitra-scenery-inline` root classes that every child layer (Tasks 3-5) is positioned relative to.

- [ ] **Step 1: Add root container rules**

Append inside the existing `@layer scenery { ... }` block in `src/09-scenery.css`, after the `:root` token block:

```css
  /* --- ROOT CONTAINERS --- */

  /* Full-page fixed ambient backdrop, sits behind all content */
  .vitra-scenery {
    position: fixed;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
  }

  /* Container-scoped variant: drop into any position:relative;
     overflow:hidden host (hero section, large card) */
  .vitra-scenery-inline {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
  }
```

- [ ] **Step 2: Rebuild**

Run: `npm run build:css`
Expected: succeeds, no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: passes clean.

- [ ] **Step 4: Commit**

```bash
git add src/09-scenery.css
git commit -m "feat(scenery): add root container classes"
```

---

## Task 3: Sky and halo layers

**Files:**
- Modify: `src/09-scenery.css`

**Interfaces:**
- Consumes: `--vitra-scenery-hue`, `--vitra-scenery-sat` from Task 1; `--vitra-color-bg` (existing token, defined in `01-tokens.css`/`00-themes.css`).
- Produces: `.vitra-scenery-sky`, `.vitra-scenery-halo` classes, plus `@keyframes vitra-scenery-halo-drift`.

- [ ] **Step 1: Add sky layer**

Append to `src/09-scenery.css`:

```css
  /* --- SKY LAYER --- */

  /* Full-bleed gradient base, theme-derived hue */
  .vitra-scenery-sky {
    position: absolute;
    inset: -10%;
    background: linear-gradient(
      175deg,
      var(--vitra-color-bg) 0%,
      hsl(var(--vitra-scenery-hue) calc(var(--vitra-scenery-sat) * 0.6) 12% / 60%) 55%,
      var(--vitra-color-bg) 100%
    );
  }
```

- [ ] **Step 2: Add halo layer with drift keyframe**

Append:

```css
  /* --- HALO LAYER --- */

  /* Diffuse light source (sun/moon-like), slow opacity drift */
  .vitra-scenery-halo {
    position: absolute;
    top: -20%;
    left: 50%;
    width: 70%;
    aspect-ratio: 1;
    translate: -50% 0;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      hsl(var(--vitra-scenery-hue) var(--vitra-scenery-sat) 70% / 40%) 0%,
      hsl(var(--vitra-scenery-hue) var(--vitra-scenery-sat) 70% / 0%) 70%
    );
    filter: blur(var(--vitra-scenery-blur-mid));
    animation: vitra-scenery-halo-drift calc(18s / var(--vitra-scenery-speed)) ease-in-out infinite alternate;
    will-change: opacity;
  }

  @keyframes vitra-scenery-halo-drift {
    0% { opacity: 0.6; }
    100% { opacity: 1; }
  }
```

- [ ] **Step 3: Add reduced-motion override for halo**

Append (this starts the plan's single consolidated reduced-motion block; later tasks append to it rather than creating new blocks):

```css
  /* --- ACCESSIBILITY: Reduced Motion --- */

  @media (prefers-reduced-motion: reduce) {
    .vitra-scenery-halo {
      animation: none;
      opacity: 0.8;
    }
  }
```

- [ ] **Step 4: Rebuild**

Run: `npm run build:css`
Expected: succeeds.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: passes clean.

- [ ] **Step 6: Visual smoke check**

Add a temporary scratch HTML file to eyeball the two layers before the full demo exists (deleted in Task 6 once the real demo supersedes it):

Create `scratch-scenery-check.html` in the repo root:
```html
<!DOCTYPE html>
<html data-theme="dark">
<head><link rel="stylesheet" href="dist/vitra.css"></head>
<body style="margin:0;height:100vh;">
  <div class="vitra-scenery" aria-hidden="true">
    <div class="vitra-scenery-sky"></div>
    <div class="vitra-scenery-halo"></div>
  </div>
</body>
</html>
```

Run: `npm run dev`, open `http://localhost:3000/scratch-scenery-check.html` (or whatever port `serve` reports).
Expected: a dark gradient sky with a soft glowing halo near the top, pulsing gently. Toggle `data-theme` to `light`, `neon`, `ocean` in DevTools to confirm hue shifts automatically.

- [ ] **Step 7: Commit**

```bash
git add src/09-scenery.css
git commit -m "feat(scenery): add sky and halo layers with reduced-motion support"
```

(Leave `scratch-scenery-check.html` uncommitted/untracked — it's cleaned up in Task 6.)

---

## Task 4: Ridge layers (far / mid / near) — the blob landscape

**Files:**
- Modify: `src/09-scenery.css`

**Interfaces:**
- Consumes: `--vitra-scenery-hue/-sat/-speed`, `--vitra-scenery-blur-far/-mid/-near`, `--vitra-scenery-opacity-far/-mid/-near` from Task 1.
- Produces: `.vitra-scenery-ridge-far`, `.vitra-scenery-ridge-mid`, `.vitra-scenery-ridge-near`, and three `@keyframes` (`vitra-scenery-drift-far`, `vitra-scenery-drift-mid`, `vitra-scenery-drift-near`) — distinct durations/directions per layer for the false-parallax effect.

- [ ] **Step 1: Add ridge-far**

Append:

```css
  /* --- RIDGE LAYERS (blob landscape, back to front) --- */

  .vitra-scenery-ridge-far {
    position: absolute;
    bottom: -15%;
    left: -10%;
    width: 130%;
    height: 55%;
    background:
      radial-gradient(ellipse 40% 60% at 20% 100%, hsl(var(--vitra-scenery-hue) var(--vitra-scenery-sat) 30% / var(--vitra-scenery-opacity-far)) 0%, transparent 70%),
      radial-gradient(ellipse 35% 50% at 55% 100%, hsl(calc(var(--vitra-scenery-hue) + 20) var(--vitra-scenery-sat) 25% / var(--vitra-scenery-opacity-far)) 0%, transparent 70%),
      radial-gradient(ellipse 45% 65% at 85% 100%, hsl(calc(var(--vitra-scenery-hue) - 15) var(--vitra-scenery-sat) 28% / var(--vitra-scenery-opacity-far)) 0%, transparent 70%);
    filter: blur(var(--vitra-scenery-blur-far));
    animation: vitra-scenery-drift-far calc(55s / var(--vitra-scenery-speed)) ease-in-out infinite alternate;
    will-change: transform;
  }

  @keyframes vitra-scenery-drift-far {
    0% { transform: translateX(-2%) scale(1); }
    100% { transform: translateX(2%) scale(1.05); }
  }
```

- [ ] **Step 2: Add ridge-mid**

Append:

```css
  .vitra-scenery-ridge-mid {
    position: absolute;
    bottom: -10%;
    left: -8%;
    width: 120%;
    height: 42%;
    background:
      radial-gradient(ellipse 32% 55% at 10% 100%, hsl(calc(var(--vitra-scenery-hue) + 10) var(--vitra-scenery-sat) 32% / var(--vitra-scenery-opacity-mid)) 0%, transparent 72%),
      radial-gradient(ellipse 38% 60% at 48% 100%, hsl(var(--vitra-scenery-hue) var(--vitra-scenery-sat) 35% / var(--vitra-scenery-opacity-mid)) 0%, transparent 72%),
      radial-gradient(ellipse 30% 50% at 82% 100%, hsl(calc(var(--vitra-scenery-hue) - 10) var(--vitra-scenery-sat) 30% / var(--vitra-scenery-opacity-mid)) 0%, transparent 72%);
    filter: blur(var(--vitra-scenery-blur-mid));
    animation: vitra-scenery-drift-mid calc(38s / var(--vitra-scenery-speed)) ease-in-out infinite alternate;
    will-change: transform;
  }

  @keyframes vitra-scenery-drift-mid {
    0% { transform: translateX(2%) scale(1.03); }
    100% { transform: translateX(-2.5%) scale(1); }
  }
```

- [ ] **Step 3: Add ridge-near**

Append:

```css
  .vitra-scenery-ridge-near {
    position: absolute;
    bottom: -8%;
    left: -5%;
    width: 110%;
    height: 30%;
    background:
      radial-gradient(ellipse 28% 60% at 15% 100%, hsl(var(--vitra-scenery-hue) var(--vitra-scenery-sat) 40% / var(--vitra-scenery-opacity-near)) 0%, transparent 75%),
      radial-gradient(ellipse 34% 65% at 60% 100%, hsl(calc(var(--vitra-scenery-hue) + 8) var(--vitra-scenery-sat) 38% / var(--vitra-scenery-opacity-near)) 0%, transparent 75%),
      radial-gradient(ellipse 26% 55% at 92% 100%, hsl(calc(var(--vitra-scenery-hue) - 8) var(--vitra-scenery-sat) 36% / var(--vitra-scenery-opacity-near)) 0%, transparent 75%);
    filter: blur(var(--vitra-scenery-blur-near));
    animation: vitra-scenery-drift-near calc(26s / var(--vitra-scenery-speed)) ease-in-out infinite alternate;
    will-change: transform;
  }

  @keyframes vitra-scenery-drift-near {
    0% { transform: translateX(-1.5%) scale(1); }
    100% { transform: translateX(1.5%) scale(1.04); }
  }
```

- [ ] **Step 4: Extend the reduced-motion block from Task 3**

Find the `@media (prefers-reduced-motion: reduce)` block added in Task 3, and replace it with:

```css
  @media (prefers-reduced-motion: reduce) {
    .vitra-scenery-halo {
      animation: none;
      opacity: 0.8;
    }

    .vitra-scenery-ridge-far,
    .vitra-scenery-ridge-mid,
    .vitra-scenery-ridge-near {
      animation: none;
      transform: none;
    }
  }
```

- [ ] **Step 5: Rebuild**

Run: `npm run build:css`
Expected: succeeds.

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: passes clean.

- [ ] **Step 7: Visual smoke check**

Update `scratch-scenery-check.html` body to:
```html
  <div class="vitra-scenery" aria-hidden="true">
    <div class="vitra-scenery-sky"></div>
    <div class="vitra-scenery-halo"></div>
    <div class="vitra-scenery-ridge-far"></div>
    <div class="vitra-scenery-ridge-mid"></div>
    <div class="vitra-scenery-ridge-near"></div>
  </div>
```

Run: `npm run dev`, reload the scratch page.
Expected: three soft blob-hill horizons stacked with visible depth (far = softest/dimmest, near = crispest/brightest), drifting at clearly different speeds/directions — no jank, no visible repaint flashing (confirm via DevTools Rendering > Paint flashing = off during animation). Toggle `prefers-reduced-motion` via DevTools Rendering tab → confirm all three freeze immediately.

- [ ] **Step 8: Commit**

```bash
git add src/09-scenery.css
git commit -m "feat(scenery): add three-depth ridge blob layers with drift animation"
```

---

## Task 5: Grain texture, `@supports` guard, and mobile performance overrides

**Files:**
- Modify: `src/09-scenery.css`

**Interfaces:**
- Consumes: nothing new.
- Produces: `.vitra-scenery-grain`, final mobile `@media (width <= 768px)` block reducing blur tokens and hiding `ridge-far`.

- [ ] **Step 1: Add the grain layer**

Append:

```css
  /* --- GRAIN LAYER --- */

  /* Subtle noise texture, breaks up gradient banding.
     Data-URI SVG feTurbulence, no external asset. */
  .vitra-scenery-grain {
    position: absolute;
    inset: 0;
    opacity: 0.05;
    mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
    background-repeat: repeat;
  }

  /* Grain relies on mix-blend-mode; skip entirely where unsupported
     rather than render a flat noisy rectangle over the scene */
  @supports not (mix-blend-mode: overlay) {
    .vitra-scenery-grain {
      display: none;
    }
  }
```

- [ ] **Step 2: Add mobile performance override**

Append (matching the existing `03-particles.css` mobile pattern):

```css
  /* --- MOBILE PERFORMANCE --- */

  /* Reduce blur cost and drop the least-visible layer on small viewports */
  @media (width <= 768px) {
    :root {
      --vitra-scenery-blur-far: 30px;
      --vitra-scenery-blur-mid: 22px;
      --vitra-scenery-blur-near: 14px;
    }

    .vitra-scenery-ridge-far {
      display: none;
    }
  }
```

- [ ] **Step 3: Rebuild**

Run: `npm run build:css`
Expected: succeeds.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: passes clean. (If stylelint flags the data-URI SVG string quoting, switch inner double quotes in the SVG to single quotes consistently and re-run — the snippet above already uses single quotes inside a double-quoted `url("...")`, which is the standard safe pairing.)

- [ ] **Step 5: Visual smoke check**

Update `scratch-scenery-check.html` to include all six layers (final markup):
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

Run: `npm run dev`, reload.
Expected: grain adds a faint filmic texture, not a visible grid/tile seam (check at 100% and 200% zoom). Resize viewport below 768px width (DevTools device toolbar) → confirm `ridge-far` disappears and the scene still reads as layered (mid+near remain).

- [ ] **Step 6: Commit**

```bash
git add src/09-scenery.css
git commit -m "feat(scenery): add grain texture and mobile performance overrides"
```

---

## Task 6: Demo page, docs, and cleanup

**Files:**
- Create: `index.html` (repo root — confirmed absent from the repo; CLAUDE.md's "Validate manually via index.html demo page" instruction expects this to exist)
- Modify: `README.md` (add Scenery to feature/component list)
- Modify: `docs/integration.md` (add usage snippet)
- Delete: `scratch-scenery-check.html`

**Interfaces:**
- Consumes: the full six-layer markup contract from Tasks 2-5.
- Produces: a working, browsable demo proving the spec's core promise — a `.vitra-glass` panel sitting on top of `.vitra-scenery` reads as a window onto a scene.

- [ ] **Step 1: Locate README's feature list insertion point**

Run: `grep -n "^##" README.md | head -30`
Find the section listing components/features (e.g., "## Features" or similar heading) to append a "Scenery" bullet/subsection consistent with existing entries' format (read 5 lines around an existing entry first to match style before writing).

- [ ] **Step 2: Add a Scenery entry to README.md**

Insert a short section (mirror whatever format neighboring entries use — typically a heading + one-line description + tiny code snippet):

```markdown
### Scenery

Ambient, CSS-only blob-landscape backdrop. Gives `.vitra-glass` panels a window-onto-a-scene feel. Six layered depths, themed automatically via accent tokens, drifts continuously, respects `prefers-reduced-motion`.

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

Use `.vitra-scenery-inline` instead of `.vitra-scenery` to scope it to a single container (hero, large card) rather than the full page.
```

- [ ] **Step 3: Add the same snippet + prose to `docs/integration.md`**

Read the file's existing per-component section format first (`grep -n "^##" docs/integration.md`), then add a "Scenery" section in that same style, at the end of the component list, containing the markup contract above plus a one-line note on the two usage modes and the token list from the spec (`--vitra-scenery-hue`, `--vitra-scenery-speed`, etc.) so consumers know what's overridable.

- [ ] **Step 4: Create the root `index.html` demo**

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vitra CSS Demo</title>
  <link rel="stylesheet" href="dist/vitra.css">
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; }
    .demo-panel { max-width: 32rem; padding: 2.5rem; text-align: center; }
    .demo-panel h1 { margin-top: 0; }
    select { margin-top: 1.5rem; }
  </style>
</head>
<body>
  <div class="vitra-scenery" aria-hidden="true">
    <div class="vitra-scenery-sky"></div>
    <div class="vitra-scenery-halo"></div>
    <div class="vitra-scenery-ridge-far"></div>
    <div class="vitra-scenery-ridge-mid"></div>
    <div class="vitra-scenery-ridge-near"></div>
    <div class="vitra-scenery-grain"></div>
  </div>

  <div class="vitra-glass demo-panel">
    <h1>Vitra CSS</h1>
    <p>Glassmorphism, ambient scenery, particles, and motion — CSS-only, zero dependencies.</p>
    <label for="theme-picker">Theme:</label>
    <select id="theme-picker" onchange="document.documentElement.setAttribute('data-theme', this.value)">
      <option value="dark" selected>Dark</option>
      <option value="light">Light</option>
      <option value="pastel">Pastel</option>
      <option value="neon">Neon</option>
      <option value="ocean">Ocean</option>
      <option value="emerald">Emerald</option>
      <option value="auto">Auto</option>
    </select>
  </div>

  <script src="dist/vitra.js"></script>
</body>
</html>
```

- [ ] **Step 5: Delete the scratch file**

```bash
rm scratch-scenery-check.html
```

- [ ] **Step 6: Full rebuild**

Run: `npm run build`
Expected: CSS + JS build both succeed.

- [ ] **Step 7: Manual browser verification**

Run: `npm run dev`, open the served root URL.
Expected: dark scene with layered blob horizon and glowing halo behind a glass panel reading "Vitra CSS". Switching the theme `<select>` changes both the glass panel token colors and the scenery hue together (confirms shared token derivation). No console errors.

- [ ] **Step 8: Commit**

```bash
git add index.html README.md docs/integration.md
git commit -m "docs: add scenery demo page and integration docs"
```

---

## Task 7: Bundle size check and final verification

**Files:**
- None modified — verification only. May touch `package.json` size-limit values if this plan's addition pushes past the existing budget (coordinate with the parallel audit-fix work's size-limit task rather than duplicating it — if a conflict exists, leave a note in the commit body and let the audit-fix pass finalize numbers).

- [ ] **Step 1: Measure bundle size delta**

Run:
```bash
npm run build:css
ls -la dist/vitra.min.css
```
Record the byte size. Compare against the pre-scenery baseline (~101799-102088 bytes per the parallel audit-fix session's last measurement, noted in that work's context).

- [ ] **Step 2: Run full verification suite**

```bash
npm run build
npm run lint
npm test
```
Expected: build succeeds, lint passes clean, all existing tests still pass (60/60 baseline from the parallel audit-fix work — scenery adds no JS, so this count should be unchanged).

- [ ] **Step 3: `git diff --stat` sanity check**

```bash
git diff --stat main
```
Expected: only the files listed in this plan's File Map appear (`src/09-scenery.css`, `src/01-tokens.css`, `scripts/build-css.js`, `index.html`, `README.md`, `docs/integration.md`, plus `dist/*` rebuild artifacts).

- [ ] **Step 4: Final commit if dist artifacts changed**

```bash
git add dist/
git commit -m "chore: rebuild dist artifacts with scenery layer"
```

---

## Self-Review Notes (completed during plan authoring)

- **Spec coverage:** every spec section maps to a task — layer stack (Tasks 2-5), theming via accent tokens (Task 1), usage modes (Task 2), markup contract (Task 6), performance/mobile (Task 5), reduced-motion (Tasks 3-4), file/build wiring (Task 1), verification plan (Task 7). No spec requirement left unmapped.
- **Placeholder scan:** no TBD/TODO; every step has literal code or literal commands with expected output.
- **Type/naming consistency:** class names (`vitra-scenery-sky/halo/ridge-far/ridge-mid/ridge-near/grain`) and token names (`--vitra-scenery-hue/-sat/-speed/-blur-*/-opacity-*`) are identical across Tasks 1-6 — verified no drift between the Interfaces block and later task bodies.
