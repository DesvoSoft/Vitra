# Hero + Scenery "Alpenglow" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the scenery system into a dusk-alpenglow scene (warm horizon light that touches the landscape: rim-lit ridges, textured full moon, wisp clouds, valley mist) and redesign the demo hero around it.

**Architecture:** All framework changes live in `src/09-scenery.css` using pseudo-elements only — the 8-div user markup contract is unchanged. Ridge divs become unmasked animation carriers; silhouettes repaint in `::after`, warm rim light in `::before` (same mask, shifted up), so the existing parallax drift transform on the parent moves both glued together. New warm hue derives from the accent via `calc()` — theming stays token-driven. Demo hero changes live on the demo branch worktree and ship after the framework is tagged (jsDelivr pins by tag).

**Tech Stack:** Pure CSS (masks, gradients, custom properties), esbuild/`scripts/build-css.js` build, stylelint, size-limit, headless Edge screenshots for visual validation.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-17-hero-scenery-alpenglow-design.md`.
- Main repo: `C:\Users\johan\OneDrive\Documentos\DEV\Vitra CSS` (branch `main`). Demo worktree: `C:\Users\johan\OneDrive\Documentos\DEV\Vitra-demo-wt` (branch `demo`).
- User-facing markup contract unchanged: same 8 scenery child divs.
- All classes `.vitra-`, tokens `--vitra-`; scenery colors derive from `--vitra-scenery-hue`/`--vitra-color-accent-h` via `calc()`.
- Compositor-only animation: no new keyframes animating anything but `transform`/`opacity`; no filters/blend modes on animated layers.
- Every animated layer keeps its `@media (prefers-reduced-motion: reduce)` coverage; `@supports` mask guards keep a gradient-band fallback.
- Themes (from `VALID_THEMES` in `src/vitra.js`): `light, dark, auto, pastel, neon, ocean, emerald`. Dark-scheme = dark/neon/ocean/emerald; light-scheme = light/pastel. Stars stay gated to dark/neon/ocean.
- Version: 1.10.3 → **1.11.0**. Release ritual: CHANGELOG + README/ROADMAP strings + `npm version 1.11.0 --no-git-tag-version` + `npm run build` + `npm test` + commit + `git tag v1.11.0` + `git push origin main --tags` **before** bumping demo CDN refs (~10 in demo `index.html`, ~8 in demo `docs/index.html`).
- Commits: Conventional Commits, **no AI/Claude attribution of any kind**, registered git credentials.
- Screenshot tool (no test framework — visual validation): headless Edge at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`. Scratch dir for PNGs: `C:\Users\johan\AppData\Local\Temp\claude\C--Users-johan-OneDrive-Documentos-DEV-Vitra-CSS\10b657db-c259-489a-8846-c74078a7b2e1\scratchpad`.

### Shared validation harness (used by many tasks)

Run from the main repo root (Git Bash). Generates one page per theme from `index.html` and screenshots each:

```bash
cd "C:\Users\johan\OneDrive\Documentos\DEV\Vitra CSS"
SCRATCH="C:\\Users\\johan\\AppData\\Local\\Temp\\claude\\C--Users-johan-OneDrive-Documentos-DEV-Vitra-CSS\\10b657db-c259-489a-8846-c74078a7b2e1\\scratchpad"
for t in dark light pastel neon ocean emerald; do
  sed "s/data-theme=\"dark\"/data-theme=\"$t\"/" index.html > "_shot-$t.html"
  "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu \
    --screenshot="$SCRATCH\\theme-$t.png" --window-size=1440,900 --hide-scrollbars \
    --virtual-time-budget=6000 "file:///C:/Users/johan/OneDrive/Documentos/DEV/Vitra CSS/_shot-$t.html" 2>/dev/null
done
rm -f _shot-*.html
```

Then Read each `theme-*.png` and check the task's stated expectations. `auto` theme cannot be forced headlessly — check it manually in a browser during Task 6.

---

### Task 1: Scenery tokens + alpenglow sky

**Files:**
- Modify: `src/09-scenery.css` (`:root` token block ~lines 25-51; `.vitra-scenery-sky` blocks ~lines 80-120)

**Interfaces:**
- Produces tokens later tasks consume: `--vitra-scenery-warm-h`, `--vitra-scenery-glow-x`, `--vitra-scenery-halo-x`, `--vitra-scenery-halo-y`, `--vitra-scenery-halo-size`, `--vitra-scenery-opacity-rim`.

- [ ] **Step 1: Add new tokens.** In the `:root` block of `@layer scenery`, after `--vitra-scenery-sat`, add:

```css
    /* --- ALPENGLOW TOKENS ---
       Warm complement derived from the accent: every theme gets its own
       harmonic "sunset" hue. Override --vitra-scenery-warm-h to art-direct. */
    --vitra-scenery-warm-h: calc(var(--vitra-scenery-hue) - 140);
    /* Where the sun went down (afterglow + valley mist anchor) */
    --vitra-scenery-glow-x: 38%;
    /* Moon position + size: heroes recompose via tokens, no custom CSS */
    --vitra-scenery-halo-x: 76%;
    --vitra-scenery-halo-y: 13%;
    --vitra-scenery-halo-size: clamp(56px, 9vmin, 110px);
    /* Rim-light strength on ridge crests */
    --vitra-scenery-opacity-rim: 0.85;
```

And in the existing light-scheme override block (`:where([data-theme="light"], [data-theme="pastel"])`), add:

```css
    --vitra-scenery-opacity-rim: 0.6;
```

- [ ] **Step 2: Replace the dark `.vitra-scenery-sky` background.** Replace the whole `background:` stack of `.vitra-scenery-sky` with:

```css
    background:
      /* afterglow core: warm light pooling where the sun set */
      radial-gradient(
        58% 26% at var(--vitra-scenery-glow-x) 97%,
        hsl(var(--vitra-scenery-warm-h) calc(var(--vitra-scenery-sat) * 0.9) 72% / 32%) 0%,
        transparent 62%
      ),
      /* afterglow spread: wide warm wash dying upward */
      radial-gradient(
        115% 52% at var(--vitra-scenery-glow-x) 90%,
        hsl(var(--vitra-scenery-warm-h) calc(var(--vitra-scenery-sat) * 0.8) 62% / 24%) 0%,
        hsl(var(--vitra-scenery-warm-h) calc(var(--vitra-scenery-sat) * 0.6) 55% / 9%) 40%,
        transparent 70%
      ),
      /* cool zenith falling into an accent-tinted horizon */
      linear-gradient(
        to bottom,
        var(--vitra-color-bg) 0%,
        hsl(calc(var(--vitra-scenery-hue) + 10) calc(var(--vitra-scenery-sat) * 0.55) 30% / 55%) 55%,
        hsl(var(--vitra-scenery-hue) calc(var(--vitra-scenery-sat) * 0.6) 44% / 50%) 100%
      );
```

- [ ] **Step 3: Replace the light/pastel sky override** (`:where([data-theme="light"], [data-theme="pastel"]) .vitra-scenery-sky`) background with a golden-hour day version:

```css
    background:
      radial-gradient(
        58% 26% at var(--vitra-scenery-glow-x) 97%,
        hsl(var(--vitra-scenery-warm-h) calc(var(--vitra-scenery-sat) * 0.85) 78% / 42%) 0%,
        transparent 62%
      ),
      radial-gradient(
        115% 52% at var(--vitra-scenery-glow-x) 90%,
        hsl(var(--vitra-scenery-warm-h) calc(var(--vitra-scenery-sat) * 0.7) 74% / 26%) 0%,
        transparent 68%
      ),
      linear-gradient(
        to bottom,
        var(--vitra-color-bg) 0%,
        hsl(var(--vitra-scenery-hue) calc(var(--vitra-scenery-sat) * 0.45) 78% / 35%) 55%,
        hsl(var(--vitra-scenery-warm-h) calc(var(--vitra-scenery-sat) * 0.5) 80% / 40%) 100%
      );
```

- [ ] **Step 4: Build.** Run: `npm run build:css` — expect clean exit, `dist/vitra.css` + `dist/vitra.min.css` regenerated.

- [ ] **Step 5: Screenshot check.** Run the shared harness. Expect in `theme-dark.png`: a warm (amber/orange for the default teal accent) glow band low-left at ~38% width, cool dark zenith, stars unchanged. `theme-light.png`: brighter warm horizon, no stars. No layout breakage.

- [ ] **Step 6: Commit.**

```bash
git add src/09-scenery.css dist/
git commit -m "feat(scenery): alpenglow sky - warm horizon band + cool zenith, warm-hue tokens"
```

---

### Task 2: Full moon with surface texture + crescent modifier + sun for light themes

**Files:**
- Modify: `src/09-scenery.css` (`.vitra-scenery-halo` block ~lines 299-322; light-theme overrides section)

**Interfaces:**
- Consumes tokens from Task 1 (`--vitra-scenery-halo-x/y/size`, `--vitra-scenery-warm-h`).
- Produces: `.vitra-scenery-halo-crescent` modifier class (demo Task 9 toggles it).

- [ ] **Step 1: Replace `.vitra-scenery-halo`** with:

```css
  /* Full moon: crisp disc with faint maria texture, positioned by tokens
     in the upper third - clear of hero headlines by default. */
  .vitra-scenery-halo {
    position: absolute;
    top: var(--vitra-scenery-halo-y);
    left: var(--vitra-scenery-halo-x);
    width: var(--vitra-scenery-halo-size);
    aspect-ratio: 1;
    border-radius: 50%;
    background:
      /* maria: three faint darker patches */
      radial-gradient(30% 30% at 62% 38%, hsl(var(--vitra-scenery-hue) 14% 68% / 38%) 0%, transparent 100%),
      radial-gradient(24% 24% at 36% 60%, hsl(var(--vitra-scenery-hue) 12% 70% / 30%) 0%, transparent 100%),
      radial-gradient(16% 16% at 56% 74%, hsl(var(--vitra-scenery-hue) 12% 72% / 26%) 0%, transparent 100%),
      /* disc: cool paper, subtly brighter toward upper-left */
      radial-gradient(
        circle at 40% 36%,
        hsl(var(--vitra-scenery-hue) 22% 96%) 0%,
        hsl(var(--vitra-scenery-hue) 16% 88%) 70%,
        hsl(var(--vitra-scenery-hue) 14% 82%) 100%
      );
    box-shadow:
      0 0 26px 8px hsl(var(--vitra-scenery-hue) calc(var(--vitra-scenery-sat) * 0.5) 82% / 32%),
      0 0 90px 40px hsl(var(--vitra-scenery-hue) calc(var(--vitra-scenery-sat) * 0.6) 70% / 14%);
    animation: vitra-scenery-halo-drift calc(24s / var(--vitra-scenery-speed)) ease-in-out infinite alternate;
    will-change: opacity;
  }

  /* Crescent variant: hollow disc, lit sliver via inset shadow.
     Offset scales with the size token so the phase reads the same
     at any moon size. */
  .vitra-scenery-halo-crescent {
    background: none;
    transform: rotate(-14deg);
    box-shadow:
      inset calc(var(--vitra-scenery-halo-size) / -4) calc(var(--vitra-scenery-halo-size) / 9) 0 0
        hsl(var(--vitra-scenery-hue) 20% 92%),
      0 0 26px 8px hsl(var(--vitra-scenery-hue) calc(var(--vitra-scenery-sat) * 0.5) 82% / 26%),
      0 0 90px 40px hsl(var(--vitra-scenery-hue) calc(var(--vitra-scenery-sat) * 0.6) 70% / 12%);
  }
```

(The `vitra-scenery-halo-drift` keyframes and its reduced-motion override already exist — unchanged.)

- [ ] **Step 2: Add light-theme sun override.** Next to the other light-scheme overrides, add:

```css
  /* Light schemes: golden hour - the disc reads as a low sun, no maria */
  :where([data-theme="light"], [data-theme="pastel"]) .vitra-scenery-halo {
    background: radial-gradient(
      circle at 45% 40%,
      hsl(var(--vitra-scenery-warm-h) calc(var(--vitra-scenery-sat) * 0.9) 92%) 0%,
      hsl(var(--vitra-scenery-warm-h) calc(var(--vitra-scenery-sat) * 0.85) 80%) 100%
    );
    box-shadow:
      0 0 34px 12px hsl(var(--vitra-scenery-warm-h) calc(var(--vitra-scenery-sat) * 0.9) 75% / 45%),
      0 0 120px 60px hsl(var(--vitra-scenery-warm-h) calc(var(--vitra-scenery-sat) * 0.8) 65% / 20%);
  }
```

- [ ] **Step 3: Build.** `npm run build:css` — clean exit.

- [ ] **Step 4: Screenshot check.** Harness. `theme-dark.png`: moon now upper-right (~76%/13%), textured, NOT overlapping the demo panel text. `theme-light.png`: warm sun disc. Temporarily add `class="vitra-scenery-halo vitra-scenery-halo-crescent"` in a scratch copy of `index.html`, screenshot, verify crescent reads correctly, then discard the scratch copy.

- [ ] **Step 5: Commit.**

```bash
git add src/09-scenery.css dist/
git commit -m "feat(scenery): textured full moon with token position/size + crescent modifier + light-theme sun"
```

---

### Task 3: Ridge restructure — silhouettes to ::after, warm rim light in ::before, parallax untouched

**Files:**
- Modify: `src/09-scenery.css` (ridge section ~lines 324-434 and the `@supports` mask block)

**Interfaces:**
- Consumes: `--vitra-scenery-warm-h`, `--vitra-scenery-opacity-rim` (Task 1).
- Produces: ridge divs as unmasked animation carriers; silhouette in `::after`, rim in `::before`. The three ridge mask SVG data-URIs are **unchanged** — where a step below says `<EXISTING ... DATA-URI>`, it means: keep the exact `url("data:image/svg+xml;utf8,<svg ...>...")` string already present in the file you are editing (the far/mid/near ridge masks currently at ~lines 392/401/408 and the feTurbulence noise at ~line 447 of `src/09-scenery.css`). Never retype them — cut and paste within the file.

- [ ] **Step 1: Rewrite the ridge base rules.** Replace the shared block and the three per-ridge blocks (`.vitra-scenery-ridge-far/mid/near` including their current `background`/`opacity`/`animation` declarations) with:

```css
  /* Each ridge div is now an unmasked ANIMATION CARRIER: the drift
     transform lives here, while the visible silhouette paints in ::after
     and the warm crest rim light in ::before. Both pseudos share the
     parent's transform, so parallax moves silhouette + rim as one body -
     the rim can never detach from its crest. */
  .vitra-scenery-ridge-far,
  .vitra-scenery-ridge-mid,
  .vitra-scenery-ridge-near {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 200%;
    will-change: transform;
  }

  .vitra-scenery-ridge-far::before,
  .vitra-scenery-ridge-far::after,
  .vitra-scenery-ridge-mid::before,
  .vitra-scenery-ridge-mid::after,
  .vitra-scenery-ridge-near::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  .vitra-scenery-ridge-far {
    height: 58%;
    opacity: var(--vitra-scenery-opacity-far);
    animation: vitra-scenery-drift-far calc(260s / var(--vitra-scenery-speed)) linear infinite;
  }

  /* Fallback (no mask support): gradient band, same as before */
  .vitra-scenery-ridge-far::after {
    background: linear-gradient(
      to bottom,
      hsl(calc(var(--vitra-scenery-hue) - 12) calc(var(--vitra-scenery-sat) * 0.35) 46% / 48%) 0%,
      hsl(calc(var(--vitra-scenery-hue) - 12) calc(var(--vitra-scenery-sat) * 0.45) 34% / 62%) 30%,
      hsl(calc(var(--vitra-scenery-hue) - 12) calc(var(--vitra-scenery-sat) * 0.5) 24% / 80%) 100%
    );
  }

  /* Warm rim: same mask as the silhouette, nudged up 3px. Only the
     sliver above the ::after crest shows crisply; the short fade below
     it reads as the lit face of the summit. Hidden until mask support
     confirmed (would be a full-width band otherwise). */
  .vitra-scenery-ridge-far::before {
    transform: translateY(-3px);
    visibility: hidden;
    background: linear-gradient(
      to bottom,
      hsl(var(--vitra-scenery-warm-h) calc(var(--vitra-scenery-sat) * 0.95) 74% / calc(0.9 * var(--vitra-scenery-opacity-rim))) 0%,
      hsl(var(--vitra-scenery-warm-h) calc(var(--vitra-scenery-sat) * 0.8) 66% / calc(0.3 * var(--vitra-scenery-opacity-rim))) 5%,
      transparent 11%
    );
  }

  .vitra-scenery-ridge-mid {
    height: 40%;
    opacity: var(--vitra-scenery-opacity-mid);
    animation: vitra-scenery-drift-mid calc(150s / var(--vitra-scenery-speed)) linear infinite;
  }

  .vitra-scenery-ridge-mid::after {
    background: linear-gradient(
      to bottom,
      hsl(calc(var(--vitra-scenery-hue) - 6) calc(var(--vitra-scenery-sat) * 0.45) 26% / 62%) 0%,
      hsl(calc(var(--vitra-scenery-hue) - 6) calc(var(--vitra-scenery-sat) * 0.5) 18% / 82%) 35%,
      hsl(calc(var(--vitra-scenery-hue) - 6) calc(var(--vitra-scenery-sat) * 0.55) 12% / 94%) 100%
    );
  }

  /* Mid rim: weaker - farther from the light than the far crests are
     from the sky, and half in shadow already */
  .vitra-scenery-ridge-mid::before {
    transform: translateY(-2px);
    visibility: hidden;
    background: linear-gradient(
      to bottom,
      hsl(var(--vitra-scenery-warm-h) calc(var(--vitra-scenery-sat) * 0.85) 68% / calc(0.55 * var(--vitra-scenery-opacity-rim))) 0%,
      hsl(var(--vitra-scenery-warm-h) calc(var(--vitra-scenery-sat) * 0.7) 60% / calc(0.18 * var(--vitra-scenery-opacity-rim))) 4%,
      transparent 9%
    );
  }

  /* Near treeline: fully in shadow - darkest value, no rim */
  .vitra-scenery-ridge-near {
    height: 24%;
    opacity: var(--vitra-scenery-opacity-near);
    animation: vitra-scenery-drift-near calc(75s / var(--vitra-scenery-speed)) linear infinite;
  }

  .vitra-scenery-ridge-near::after {
    background: linear-gradient(
      to bottom,
      hsl(calc(var(--vitra-scenery-hue) + 15) calc(var(--vitra-scenery-sat) * 0.6) 12% / 92%) 0%,
      hsl(calc(var(--vitra-scenery-hue) + 15) calc(var(--vitra-scenery-sat) * 0.7) 4% / 98%) 100%
    );
  }
```

- [ ] **Step 2: Rewrite the `@supports` mask block for ridges.** Replace the three ridge mask rules inside `@supports (mask-image: url("")) or (-webkit-mask-image: url(""))` so each mask applies to BOTH pseudos of its ridge (`::before` and `::after` for far/mid; `::after` only for near), keeping the **exact same three SVG data-URIs currently in the file**, plus reveal the rims:

```css
    .vitra-scenery-ridge-far::before,
    .vitra-scenery-ridge-far::after {
      mask-image: url("<EXISTING FAR RIDGE SVG DATA-URI - copy verbatim from current file>");
      mask-size: 50% 100%;
      mask-repeat: repeat-x;
    }

    .vitra-scenery-ridge-mid::before,
    .vitra-scenery-ridge-mid::after {
      mask-image: url("<EXISTING MID RIDGE SVG DATA-URI - copy verbatim from current file>");
      mask-size: 50% 100%;
      mask-repeat: repeat-x;
    }

    .vitra-scenery-ridge-near::after {
      mask-image: url("<EXISTING NEAR RIDGE SVG DATA-URI - copy verbatim from current file>");
      mask-size: 50% 100%;
      mask-repeat: repeat-x;
    }

    /* Rims only exist once masks are confirmed */
    .vitra-scenery-ridge-far::before,
    .vitra-scenery-ridge-mid::before {
      visibility: visible;
    }
```

- [ ] **Step 3: Verify reduced-motion block still valid.** The existing `@media (prefers-reduced-motion: reduce)` rules set `animation: none; transform: none;` on the ridge PARENTS — still correct (pseudos don't animate). No change needed; just confirm the selectors still match.

- [ ] **Step 4: Build.** `npm run build:css` — clean exit.

- [ ] **Step 5: Screenshot check.** Harness. `theme-dark.png`: silhouette shapes IDENTICAL to before (same SVGs); thin warm line tracing far-ridge crests, fainter on mid ridge, none on near treeline; no bright uniform mist strip on ridge tops anymore. Also do a live-motion check: `npx serve .` + open in a real browser for ~30 s — rim must travel glued to its crest during drift, no seams at the loop point.

- [ ] **Step 6: Commit.**

```bash
git add src/09-scenery.css dist/
git commit -m "feat(scenery): warm rim light on ridge crests via masked pseudos, parallax carrier untouched"
```

---

### Task 4: Grain restructure + valley mist

**Files:**
- Modify: `src/09-scenery.css` (`.vitra-scenery-grain` block ~lines 443-449)

**Interfaces:**
- Consumes: `--vitra-scenery-warm-h`, `--vitra-scenery-glow-x` (Task 1).

**Critical detail:** grain currently has `opacity: 0.04` on the element — a mist pseudo inside it would inherit that and become invisible. The noise moves to `::after` (carrying the 0.04), the element goes to opacity 1, and mist lives in `::before`.

- [ ] **Step 1: Replace the `.vitra-scenery-grain` block** with:

```css
  /* Grain host: element stays fully opaque so its pseudos can carry
     different opacities - noise in ::after, valley mist in ::before. */
  .vitra-scenery-grain {
    position: absolute;
    inset: 0;
  }

  /* Valley mist: soft pools of light hanging between the ridges.
     Sits in front of the mountains (atmosphere), warm on the afterglow
     side, cool accent on the other. Static - no animation. */
  .vitra-scenery-grain::before {
    content: '';
    position: absolute;
    inset: auto 0 6% 0;
    height: 24%;
    background:
      radial-gradient(
        65% 100% at var(--vitra-scenery-glow-x) 100%,
        hsl(var(--vitra-scenery-warm-h) calc(var(--vitra-scenery-sat) * 0.7) 70% / 12%) 0%,
        transparent 68%
      ),
      radial-gradient(
        45% 85% at calc(100% - var(--vitra-scenery-glow-x)) 100%,
        hsl(var(--vitra-scenery-hue) calc(var(--vitra-scenery-sat) * 0.5) 75% / 8%) 0%,
        transparent 70%
      );
  }

  /* Subtle noise texture, breaks up gradient banding. Same data-URI
     as before, now on ::after so the element itself stays opaque. */
  .vitra-scenery-grain::after {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.04;
    background-image: url("<EXISTING feTurbulence SVG DATA-URI - copy verbatim from current file>");
    background-repeat: repeat;
  }
```

- [ ] **Step 2: Build.** `npm run build:css` — clean exit.

- [ ] **Step 3: Screenshot check.** Harness. `theme-dark.png`: faint warm luminous pools low in the frame near the glow side; grain texture unchanged (zoom a crop if needed). No banding regression.

- [ ] **Step 4: Commit.**

```bash
git add src/09-scenery.css dist/
git commit -m "feat(scenery): valley mist pools; grain noise moved to pseudo so host stays opaque"
```

---

### Task 5: Cloud wisps lit from below

**Files:**
- Modify: `src/09-scenery.css` (`.vitra-scenery-clouds` blocks ~lines 130-163 and its `@supports` mask)

**Interfaces:**
- Consumes: `--vitra-scenery-warm-h` (Task 1). Drift keyframes `vitra-scenery-drift-clouds` unchanged.

- [ ] **Step 1: Replace the cloud gradient (dark default).** In `.vitra-scenery-clouds`, replace the `background` with an under-lit gradient (keep `width: 200%`, `height: 45%`, opacity token, animation, `will-change` as-is):

```css
    background: linear-gradient(
      to top,
      hsl(var(--vitra-scenery-warm-h) calc(var(--vitra-scenery-sat) * 0.75) 74% / 55%) 0%,
      hsl(var(--vitra-scenery-hue) calc(var(--vitra-scenery-sat) * 0.2) 88% / 8%) 100%
    );
```

- [ ] **Step 2: Add a light-scheme cloud override** next to the other light overrides:

```css
  :where([data-theme="light"], [data-theme="pastel"]) .vitra-scenery-clouds {
    background: linear-gradient(
      to top,
      hsl(var(--vitra-scenery-warm-h) calc(var(--vitra-scenery-sat) * 0.6) 88% / 55%) 0%,
      hsl(var(--vitra-scenery-hue) calc(var(--vitra-scenery-sat) * 0.15) 96% / 20%) 100%
    );
  }
```

- [ ] **Step 3: Replace the cloud mask SVG** inside the `@supports` block with thin horizontal wisps (replaces the puffy ellipse blobs; same `mask-size: 50% 100%; mask-repeat: repeat-x; mask-position: left top;`):

```css
      mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 300' preserveAspectRatio='none'><ellipse cx='170' cy='96' rx='150' ry='7' fill-opacity='0.5'/><ellipse cx='250' cy='86' rx='90' ry='5' fill-opacity='0.35'/><ellipse cx='520' cy='150' rx='190' ry='6' fill-opacity='0.42'/><ellipse cx='610' cy='140' rx='90' ry='4' fill-opacity='0.28'/><ellipse cx='860' cy='104' rx='140' ry='6' fill-opacity='0.45'/><ellipse cx='950' cy='114' rx='80' ry='4' fill-opacity='0.3'/><ellipse cx='1180' cy='170' rx='170' ry='7' fill-opacity='0.4'/><ellipse cx='1290' cy='160' rx='80' ry='4' fill-opacity='0.26'/><ellipse cx='1400' cy='90' rx='110' ry='5' fill-opacity='0.3'/></svg>");
```

- [ ] **Step 4: Build.** `npm run build:css` — clean exit.

- [ ] **Step 5: Screenshot check.** Harness. `theme-dark.png`: clouds are now thin horizontal streaks with a warm underside, no dark smudge blobs over the star field. `theme-light.png`: bright soft wisps.

- [ ] **Step 6: Commit.**

```bash
git add src/09-scenery.css dist/
git commit -m "feat(scenery): thin wisp clouds lit from below, replace ellipse blobs"
```

---

### Task 6: Full validation matrix + lint + size + docs

**Files:**
- Modify: `docs/integration.md` (scenery section — document new tokens + crescent modifier)
- Possibly modify: `package.json` (size-limit only if exceeded)

- [ ] **Step 1: Lint.** `npm run lint` — expect clean (stylelint may auto-fix formatting; re-add if it does).

- [ ] **Step 2: Full build + tests.** `npm run build && npm test` — expect all green (existing vitest suite covers JS; CSS untouched by tests).

- [ ] **Step 3: Size check.** `npm run size`. Budget: `dist/vitra.min.css` ≤ 16 kB. If exceeded (new gradients add ~1-2 kB), bump the limit in `package.json` to `"18 kB"` and note the increase in the CHANGELOG entry (Task 7).

- [ ] **Step 4: Screenshot matrix.** Run the shared harness (6 themes) and Read every PNG. Checklist per theme: warm band visible and harmonic with the accent; moon/sun clear of center; rims present (dark) and not neon-loud; wisp clouds; valley mist; no seams, no layout breaks.

- [ ] **Step 5: Manual checks in a live browser** (`npx serve .`):
  - `auto` theme under both OS schemes (flip Windows dark/light or emulate in DevTools).
  - `prefers-reduced-motion: reduce` emulation: everything static, no rim/mist glitches.
  - DevTools rendering: paint-flashing OFF during drift (compositor-only preserved).
  - No-mask fallback: temporarily test in DevTools by disabling mask-image support is impractical — instead verify the fallback rule by inspection: `::before` rims are `visibility: hidden` outside `@supports` and `::after` keeps a gradient band. Code-inspection only, state it in the summary.

- [ ] **Step 6: Update `docs/integration.md`.** In the scenery documentation, add the new tokens table rows (`--vitra-scenery-warm-h`, `--vitra-scenery-glow-x`, `--vitra-scenery-halo-x`, `--vitra-scenery-halo-y`, `--vitra-scenery-halo-size`, `--vitra-scenery-opacity-rim`) with one-line descriptions and defaults, plus the `.vitra-scenery-halo-crescent` modifier with a usage snippet:

```html
<div class="vitra-scenery-halo vitra-scenery-halo-crescent"></div>
```

- [ ] **Step 7: Commit.**

```bash
git add docs/integration.md package.json
git commit -m "docs(scenery): alpenglow tokens + crescent modifier reference"
```

---

### Task 7: Release v1.11.0

**Files:**
- Modify: `CHANGELOG.md`, `README.md`, `ROADMAP.md` (version strings), `package.json` (version)

- [ ] **Step 1: CHANGELOG entry.** Add at the top of `CHANGELOG.md` following its existing format:

```markdown
## [1.11.0] - 2026-07-17

### Added
- Scenery "alpenglow" light system: warm horizon band derived from the accent (`--vitra-scenery-warm-h`), warm rim light on ridge crests, valley mist pools, clouds lit from below.
- Full-moon halo with surface texture; `.vitra-scenery-halo-crescent` modifier.
- New scenery tokens: `--vitra-scenery-warm-h`, `--vitra-scenery-glow-x`, `--vitra-scenery-halo-x`, `--vitra-scenery-halo-y`, `--vitra-scenery-halo-size`, `--vitra-scenery-opacity-rim`.

### Changed
- Ridge silhouettes now paint in pseudo-elements (markup contract unchanged); parallax drift untouched.
- Cloud mask: thin wisps replace ellipse blobs.
- Halo default position moved to the upper-right third (clear of hero headlines).
```

(If Task 6 bumped the size budget, add a `### Note` line about it.)

- [ ] **Step 2: Version strings.** Update version references in `README.md` and `ROADMAP.md` (search `1.10.3`), then:

```bash
npm version 1.11.0 --no-git-tag-version
```

- [ ] **Step 3: Build + test.** `npm run build && npm test` — green.

- [ ] **Step 4: Commit + tag + push.**

```bash
git add -A
git commit -m "chore(release): v1.11.0 - scenery alpenglow light system"
git tag v1.11.0
git push origin main --tags
```

Expected: tag visible on GitHub; jsDelivr can now serve `@v1.11.0`.

---

### Task 8: Demo hero redesign (demo branch worktree)

**Files (all under `C:\Users\johan\OneDrive\Documentos\DEV\Vitra-demo-wt`):**
- Modify: `index.html` (hero section lines ~148-170; CDN refs throughout; `docs/index.html` CDN refs)
- Modify: `demo.css` (hero section lines ~75-219)
- Modify: `demo.js` (spotlight function ~lines 36-56 + its `initDemo` call)

**Interfaces:**
- Consumes: framework v1.11.0 via jsDelivr (Task 7 must be pushed first); tokens `--vitra-scenery-warm-h`, `--vitra-scenery-halo-x/y`.

- [ ] **Step 1: Bump CDN refs.** In the worktree: `grep -rn "1\.10\.3" index.html docs/index.html` — replace ALL occurrences with `1.11.0` (~10 in `index.html`, ~8 in `docs/index.html`: CDN links, badges, install snippets, SRI note if version-pinned). If SRI hashes are pinned next to CDN URLs, regenerate from `dist/SRI.txt` of the tagged build.

- [ ] **Step 2: Rewrite hero markup** (`index.html` lines ~148-170) to:

```html
  <section class="demo-hero" aria-label="Hero">
    <div class="vitra-scenery-inline" aria-hidden="true">
      <div class="vitra-scenery-sky"></div>
      <div class="vitra-scenery-clouds"></div>
      <div class="vitra-scenery-stars"></div>
      <div class="vitra-scenery-halo"></div>
      <div class="vitra-scenery-ridge-far"></div>
      <div class="vitra-scenery-ridge-mid"></div>
      <div class="vitra-scenery-ridge-near"></div>
      <div class="vitra-scenery-grain"></div>
    </div>
    <div class="vitra-container vitra-text-center">
      <p class="demo-hero-overline">Vitra · CSS Framework · v1.11.0</p>
      <h1 class="demo-hero-title">Vitra <span class="demo-hero-title-accent">CSS</span></h1>
      <p class="vitra-text-xl demo-hero-sub">Cinematic glassmorphism. Zero dependencies, pure CSS.</p>
      <div class="vitra-flex vitra-justify-center vitra-gap-4 vitra-flex-wrap vitra-mt-6">
        <a href="#quick-start" class="vitra-btn vitra-btn-lg demo-btn-warm">Get Started</a>
        <a href="https://github.com/DesvoSoft/Vitra" class="vitra-btn vitra-btn-ghost vitra-btn-lg" target="_blank" rel="noopener">GitHub</a>
      </div>
    </div>
    <div class="demo-hero-scroll-cue" aria-hidden="true"></div>
  </section>
```

Notes: `data-spotlight` removed; badge pill removed; inline `style` on the sub removed (handled in CSS).

- [ ] **Step 3: Rewrite hero CSS.** In `demo.css`, DELETE: both animated gradient-text blocks for `.demo-hero h1.demo-hero-title` (dark + light variants), the `[data-spotlight]` rules, and `.demo-hero-badge`. KEEP: `.demo-hero` base, `::after` bottom fade, `.vitra-container` z-index, particle blocks (edited in Step 4), responsive blocks (update selectors if they referenced deleted rules). ADD:

```css
/* Hero type: solid near-white, static. The scene provides the color;
   the type provides the contrast. */
.demo-hero h1.demo-hero-title {
  font-size: clamp(2.5rem, 8vw, 5rem);
  line-height: 1.05;
  margin-bottom: var(--vitra-space-4);
  letter-spacing: -0.04em;
  color: hsl(var(--vitra-color-accent-h) 20% 96%);
}

html[data-theme="light"] .demo-hero h1.demo-hero-title,
html[data-theme="pastel"] .demo-hero h1.demo-hero-title {
  color: hsl(var(--vitra-color-accent-h) 30% 14%);
}

/* Single warm word - the one deliberate color note in the headline */
.demo-hero-title-accent {
  background: linear-gradient(
    100deg,
    hsl(var(--vitra-scenery-warm-h) 95% 78%),
    hsl(calc(var(--vitra-scenery-warm-h) - 20) 90% 68%)
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.demo-hero-overline {
  display: inline-block;
  margin-bottom: var(--vitra-space-4);
  font-size: 0.72rem;
  font-weight: 400;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: hsl(var(--vitra-scenery-warm-h) 70% 78% / 0.9);
}

html[data-theme="light"] .demo-hero-overline,
html[data-theme="pastel"] .demo-hero-overline {
  color: hsl(var(--vitra-scenery-warm-h) 75% 38% / 0.95);
}

.demo-hero-sub {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  color: var(--vitra-color-text-secondary);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Warm primary CTA - the single strong warm UI element on the page */
.demo-btn-warm {
  background: linear-gradient(
    120deg,
    hsl(var(--vitra-scenery-warm-h) 90% 78%),
    hsl(calc(var(--vitra-scenery-warm-h) - 25) 85% 62%)
  );
  border: none;
  color: hsl(var(--vitra-scenery-warm-h) 60% 12%);
  font-weight: 600;
  box-shadow: 0 4px 24px hsl(var(--vitra-scenery-warm-h) 85% 62% / 0.35);
}

.demo-btn-warm:hover {
  box-shadow: 0 6px 32px hsl(var(--vitra-scenery-warm-h) 85% 62% / 0.5);
  transform: translateY(-1px);
}

/* Scroll cue: minimal chevron, fading drop */
.demo-hero-scroll-cue {
  position: absolute;
  bottom: 26px;
  left: 50%;
  width: 14px;
  height: 14px;
  z-index: 2;
  border-right: 2px solid hsl(var(--vitra-color-accent-h) 30% 85% / 0.55);
  border-bottom: 2px solid hsl(var(--vitra-color-accent-h) 30% 85% / 0.55);
  transform: translateX(-50%) rotate(45deg);
  animation: demo-hero-scroll-cue 2.4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes demo-hero-scroll-cue {
  0%, 100% { opacity: 0.25; transform: translateX(-50%) translateY(0) rotate(45deg); }
  50% { opacity: 0.8; transform: translateX(-50%) translateY(6px) rotate(45deg); }
}

@media (prefers-reduced-motion: reduce) {
  .demo-hero-scroll-cue { animation: none; opacity: 0.4; }
}

/* Mobile: smaller moon, higher in the frame, glow pulled center-left
   so the composition still breathes on a narrow viewport */
@media (max-width: 640px) {
  .demo-hero .vitra-scenery-inline {
    --vitra-scenery-halo-size: clamp(40px, 11vw, 64px);
    --vitra-scenery-halo-x: 72%;
    --vitra-scenery-halo-y: 8%;
  }
}
```

- [ ] **Step 4: Warm particles.** In `demo.css` update the existing hero particle override (~line 194) to:

```css
.demo-hero .vitra-scenery-inline .vitra-particle {
  --vitra-particle-color: hsl(var(--vitra-scenery-warm-h) 85% 75%);
  box-shadow: 0 0 6px hsl(var(--vitra-scenery-warm-h) 85% 75% / 70%);
}
```

And in `demo.js` `window.spawnHeroParticles`, change `var counts = [8, 18, 35, 60, 90];` to `var counts = [12, 18, 35, 60, 90];` (initial load = 12 fireflies; easter-egg escalation intact).

- [ ] **Step 5: Remove spotlight JS.** In `demo.js`: delete the whole `initHeroSpotlight` function (~lines 36-56) and its call inside `initDemo`. Verify with `grep -n "spotlight" demo.js` → no matches.

- [ ] **Step 6: Validate locally.** `npx serve "C:\Users\johan\OneDrive\Documentos\DEV\Vitra-demo-wt"` + headless screenshots (same Edge command, URL `http://localhost:3000`). Checks: moon upper-right clear of the headline at 1440×900, 1280×800 and 390×844 (mobile: use `--window-size=390,844`); title solid white with a warm "CSS"; warm CTA; no spotlight following; scroll cue breathing; fireflies warm.

- [ ] **Step 7: Commit (demo worktree).**

```bash
cd "C:\Users\johan\OneDrive\Documentos\DEV\Vitra-demo-wt"
git add index.html docs/index.html demo.css demo.js
git commit -m "feat(hero): alpenglow hero - warm CTA, solid title, overline, scroll cue; bump framework to v1.11.0"
```

---

### Task 9: Showcase moon-phase toggle + final demo validation + deploy

**Files (demo worktree):**
- Modify: `index.html` (#scenery showcase section, ~line 326+, next to the speed buttons)
- Modify: `demo.js` (new `setMoonPhase` beside `setScenerySpeed`, ~line 750)

**Interfaces:**
- Consumes: `.vitra-scenery-halo-crescent` (Task 2), `setScenerySpeed` pattern in `demo.js`.

- [ ] **Step 1: Add toggle markup.** In the #scenery showcase, next to the existing speed `role="group"`, add:

```html
        <div role="group" aria-label="Moon phase" class="vitra-flex vitra-gap-3 vitra-mt-3 vitra-justify-center">
          <button class="vitra-btn vitra-btn-sm vitra-btn-solid" onclick="setMoonPhase(this, false)">Full moon</button>
          <button class="vitra-btn vitra-btn-sm vitra-btn-ghost" onclick="setMoonPhase(this, true)">Crescent</button>
        </div>
```

- [ ] **Step 2: Add handler.** In `demo.js`, after `window.setScenerySpeed`, add (mirror its solid/ghost swap logic):

```js
  window.setMoonPhase = function (btn, crescent) {
    document.querySelectorAll('.vitra-scenery-halo').forEach(function (halo) {
      halo.classList.toggle('vitra-scenery-halo-crescent', crescent);
    });
    var group = btn.closest('[role="group"]');
    if (group) {
      group.querySelectorAll('.vitra-btn').forEach(function (b) {
        b.classList.remove('vitra-btn-solid');
        b.classList.add('vitra-btn-ghost');
      });
    }
    btn.classList.remove('vitra-btn-ghost');
    btn.classList.add('vitra-btn-solid');
  };
```

(Toggles every halo on the page — hero included — which doubles as a live demo of the modifier.)

- [ ] **Step 3: Validate.** Serve locally; click both buttons; verify hero + showcase moons swap phase; screenshot both states.

- [ ] **Step 4: Full-page pass.** Scroll the whole demo at 1440×900 + mobile width: no other section visually broken by the hero/scenery changes (sections reuse scenery-inline and gradient-text elsewhere — confirm only hero was touched).

- [ ] **Step 5: Commit + deploy.**

```bash
cd "C:\Users\johan\OneDrive\Documentos\DEV\Vitra-demo-wt"
git add index.html demo.js
git commit -m "feat(scenery): moon phase toggle in showcase"
git push origin demo
```

Expected: GitHub Pages redeploys; verify https://desvosoft.github.io/Vitra/ within a few minutes (hard-refresh for CDN/Pages cache).

- [ ] **Step 6: Prod smoke test.** Headless screenshot of the prod URL; compare against local validation shots. Confirm jsDelivr serves v1.11.0 (check a CDN URL directly returns the new CSS: `curl -sI https://cdn.jsdelivr.net/gh/DesvoSoft/Vitra@v1.11.0/dist/vitra.min.css` → 200).
