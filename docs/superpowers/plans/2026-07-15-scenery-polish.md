# Scenery Polish & Hero Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kill the visible star grid with a 3-tile layered star system (twinkle, drift, shooting star), retune ridge atmosphere for depth, cut hero CTAs to 2, ship as v1.10.0, sync demo branch for GitHub Pages prod.

**Architecture:** All framework work happens in `src/09-scenery.css` on `main` — one `.vitra-scenery-stars` div gains two pseudo-element layers; ridge silhouette mask SVGs are NOT touched, only gradient color stops and one opacity token. Demo work happens in the `demo` branch worktree at `C:\Users\johan\OneDrive\Documentos\DEV\Vitra-demo-wt`. A mask-shading experiment goes to the session scratchpad only, never committed.

**Tech Stack:** Vanilla CSS (data-URI SVG, CSS masks, compositor-only animation), node build script (`scripts/build-css.js`), vitest, stylelint, jsDelivr CDN pinned by git tag.

## Global Constraints

- CSS-only, zero external assets — all imagery inline data-URI SVG
- Compositor-only animation: `transform` and `opacity` ONLY (no background-position animation, no filters, no blend modes)
- Colors from tokens `--vitra-scenery-hue` / `--vitra-scenery-sat`; white star dots are the only allowed literal color
- Every new animation disabled under `@media (prefers-reduced-motion: reduce)`; static star field stays visible
- DOM contract unchanged: single `.vitra-scenery-stars` div, no new required markup
- Star visibility theme gating unchanged: parent opacity 0 by default, 0.8 on dark/neon/ocean (+ auto-dark) — pseudo-elements inherit this gating automatically
- Ridge silhouette `mask-image` URLs in `src/09-scenery.css` MUST NOT change
- Never use `@import` in CSS source; build concatenates
- `dist/` is committed — always run `npm run build` before committing framework changes
- Commits: plain author credentials, no co-author/attribution trailers
- Drift direction right-to-left everywhere (one wind); star drift slower than clouds (clouds = 130s)

---

### Task 1: Star field rebuild (`src/09-scenery.css`)

**Files:**
- Modify: `src/09-scenery.css` — star field block (currently lines ~160–187) and reduced-motion block (currently lines ~343–356)

**Interfaces:**
- Consumes: existing tokens `--vitra-scenery-speed`; existing theme-gating rules on `.vitra-scenery-stars` (kept verbatim)
- Produces: keyframes `vitra-scenery-stars-drift`, `vitra-scenery-stars-twinkle`, `vitra-scenery-shooting-star` (Task 2 does not depend on them; names only matter within this file)

- [ ] **Step 1: Replace the star field block**

In `src/09-scenery.css`, replace the entire block from the comment `/* --- STAR FIELD (dark-appropriate themes only) --- */` through the `@media (prefers-color-scheme: dark) { ... }` rule that ends the star section (just before `/* --- HALO LAYER (sun / moon) --- */`) with:

```css
  /* --- STAR FIELD (dark-appropriate themes only) --- */

  /* Three overlapping data-URI star tiles with different tile
     periods (420x280, 660x440 on the base element; 540x360 on
     ::before) - non-synchronized repeats destroy the visible
     grid a single tile produces. ::before also drifts with the
     scene wind and twinkles (transform/opacity only). ::after
     is an occasional shooting star. All layers inherit the
     parent's theme-gated opacity, so light themes hide
     everything with no extra rules. */
  .vitra-scenery-stars {
    position: absolute;
    inset: 0;
    opacity: 0;
    background-image:
      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='660' height='440'><circle cx='37' cy='68' r='1.3' fill='white' opacity='0.85'/><circle cx='118' cy='301' r='1.1' fill='white' opacity='0.7'/><circle cx='176' cy='142' r='1.5' fill='white' opacity='0.9'/><circle cx='243' cy='388' r='1' fill='white' opacity='0.65'/><circle cx='312' cy='52' r='1.2' fill='white' opacity='0.8'/><circle cx='398' cy='247' r='1.4' fill='white' opacity='0.85'/><circle cx='451' cy='109' r='1' fill='white' opacity='0.6'/><circle cx='505' cy='354' r='1.2' fill='white' opacity='0.75'/><circle cx='571' cy='183' r='1.5' fill='white' opacity='0.9'/><circle cx='622' cy='71' r='1.1' fill='white' opacity='0.7'/><circle cx='89' cy='412' r='1' fill='white' opacity='0.6'/><circle cx='270' cy='203' r='0.9' fill='white' opacity='0.6'/><circle cx='532' cy='26' r='1' fill='white' opacity='0.65'/><circle cx='645' cy='296' r='1.3' fill='white' opacity='0.8'/></svg>"),
      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='420' height='280'><circle cx='23' cy='31' r='0.9' fill='white' opacity='0.5'/><circle cx='57' cy='142' r='0.6' fill='white' opacity='0.4'/><circle cx='81' cy='66' r='1' fill='white' opacity='0.65'/><circle cx='99' cy='214' r='0.5' fill='white' opacity='0.35'/><circle cx='131' cy='109' r='0.8' fill='white' opacity='0.55'/><circle cx='148' cy='17' r='0.7' fill='white' opacity='0.45'/><circle cx='172' cy='253' r='0.9' fill='white' opacity='0.6'/><circle cx='189' cy='83' r='0.5' fill='white' opacity='0.4'/><circle cx='214' cy='178' r='1' fill='white' opacity='0.7'/><circle cx='243' cy='41' r='0.6' fill='white' opacity='0.45'/><circle cx='259' cy='231' r='0.8' fill='white' opacity='0.5'/><circle cx='287' cy='132' r='0.7' fill='white' opacity='0.55'/><circle cx='301' cy='12' r='0.5' fill='white' opacity='0.35'/><circle cx='322' cy='199' r='0.9' fill='white' opacity='0.65'/><circle cx='352' cy='91' r='0.6' fill='white' opacity='0.4'/><circle cx='369' cy='262' r='0.7' fill='white' opacity='0.5'/><circle cx='391' cy='155' r='0.8' fill='white' opacity='0.6'/><circle cx='407' cy='48' r='0.5' fill='white' opacity='0.4'/><circle cx='44' cy='251' r='0.7' fill='white' opacity='0.5'/><circle cx='117' cy='161' r='0.6' fill='white' opacity='0.45'/><circle cx='203' cy='124' r='0.55' fill='white' opacity='0.35'/><circle cx='276' cy='74' r='0.9' fill='white' opacity='0.6'/><circle cx='338' cy='28' r='0.65' fill='white' opacity='0.45'/><circle cx='413' cy='222' r='0.75' fill='white' opacity='0.55'/></svg>");
    background-repeat: repeat;
  }

  /* Drifting + twinkling third tile. Seamless drift loop:
     the layer is one tile-width (540px) wider than the
     viewport strip and translates exactly one tile width,
     landing on a pixel-identical frame. Twinkle rides the
     same pseudo-element as a second, opacity-only animation. */
  .vitra-scenery-stars::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: calc(100% + 540px);
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='540' height='360'><circle cx='29' cy='47' r='0.8' fill='white' opacity='0.6'/><circle cx='71' cy='183' r='1.1' fill='white' opacity='0.75'/><circle cx='108' cy='312' r='0.6' fill='white' opacity='0.5'/><circle cx='142' cy='96' r='0.9' fill='white' opacity='0.65'/><circle cx='187' cy='241' r='0.7' fill='white' opacity='0.55'/><circle cx='216' cy='29' r='1.2' fill='white' opacity='0.8'/><circle cx='251' cy='157' r='0.6' fill='white' opacity='0.5'/><circle cx='289' cy='334' r='1' fill='white' opacity='0.7'/><circle cx='317' cy='88' r='0.8' fill='white' opacity='0.6'/><circle cx='348' cy='213' r='0.7' fill='white' opacity='0.5'/><circle cx='382' cy='21' r='1.1' fill='white' opacity='0.75'/><circle cx='411' cy='299' r='0.6' fill='white' opacity='0.5'/><circle cx='446' cy='132' r='0.9' fill='white' opacity='0.65'/><circle cx='478' cy='251' r='0.7' fill='white' opacity='0.55'/><circle cx='509' cy='63' r='1' fill='white' opacity='0.7'/><circle cx='527' cy='341' r='0.8' fill='white' opacity='0.6'/><circle cx='63' cy='268' r='0.65' fill='white' opacity='0.5'/><circle cx='334' cy='152' r='0.75' fill='white' opacity='0.55'/></svg>");
    background-repeat: repeat;
    opacity: 0.7;
    will-change: transform, opacity;
    animation:
      vitra-scenery-stars-drift calc(220s / var(--vitra-scenery-speed)) linear infinite,
      vitra-scenery-stars-twinkle 9s ease-in-out infinite alternate;
  }

  /* Shooting star: thin streak, visible only during the first
     ~5% of a 17s cycle. Fixed path (CSS cannot randomize);
     the long period keeps it feeling occasional. rotate(-35deg)
     tilts the travel axis so translating -x moves down-left. */
  .vitra-scenery-stars::after {
    content: '';
    position: absolute;
    top: 14%;
    left: 66%;
    width: 90px;
    height: 2px;
    border-radius: 1px;
    background: linear-gradient(to left, white 0%, hsl(0 0% 100% / 0.4) 35%, transparent 100%);
    opacity: 0;
    transform: rotate(-35deg) translate3d(0, 0, 0);
    will-change: transform, opacity;
    animation: vitra-scenery-shooting-star 17s linear 4s infinite;
  }

  @keyframes vitra-scenery-stars-drift {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-540px, 0, 0); }
  }

  @keyframes vitra-scenery-stars-twinkle {
    0% { opacity: 0.55; }
    35% { opacity: 0.8; }
    60% { opacity: 0.6; }
    100% { opacity: 0.9; }
  }

  @keyframes vitra-scenery-shooting-star {
    0% { transform: rotate(-35deg) translate3d(0, 0, 0); opacity: 0; }
    1% { opacity: 0.9; }
    5% { transform: rotate(-35deg) translate3d(-340px, 0, 0); opacity: 0; }
    100% { transform: rotate(-35deg) translate3d(-340px, 0, 0); opacity: 0; }
  }

  :where([data-theme="dark"], [data-theme="neon"], [data-theme="ocean"]) .vitra-scenery-stars {
    opacity: 0.8;
  }

  html[data-theme="auto"] .vitra-scenery-stars {
    opacity: 0;
  }

  @media (prefers-color-scheme: dark) {
    html[data-theme="auto"] .vitra-scenery-stars {
      opacity: 0.8;
    }
  }
```

Note: the four theme-gating rules at the end are byte-identical to the current file — keep them, do not rewrite them.

- [ ] **Step 2: Extend the reduced-motion block**

In the same file, inside `@media (prefers-reduced-motion: reduce) { ... }` (near the end of the `@layer scenery` block), add after the existing ridge/clouds rule:

```css
    .vitra-scenery-stars::before {
      animation: none;
      transform: none;
    }

    .vitra-scenery-stars::after {
      animation: none;
      opacity: 0;
    }
```

- [ ] **Step 3: Lint and build**

Run (from `C:\Users\johan\OneDrive\Documentos\DEV\Vitra CSS`):
```bash
npm run lint && npm run build
```
Expected: stylelint exits clean (it may auto-fix formatting); build writes `dist/vitra.css`, `dist/vitra.min.css`, JS bundles, SRI. No errors.

- [ ] **Step 4: Run tests**

```bash
npm test
```
Expected: PASS (existing vitest suite; no scenery-CSS assertions should break).

- [ ] **Step 5: Visual verify**

```bash
npm run dev
```
Open `http://localhost:3000` (root demo `index.html` uses `dist/vitra.css` and has the scenery + stars markup — temporarily add `<div class="vitra-scenery-stars"></div>` inside `.vitra-scenery` if it's missing there, since main's minimal demo predates stars; revert after checking, or verify against the demo worktree by pointing its `<link>` temporarily at the local `dist/vitra.css`).

Check in dark theme:
- No visible repeating grid pattern in stars (pan eye across viewport)
- One star layer slowly drifts right-to-left; subtle brightness pulse
- Shooting star streaks down-left roughly every 17s (first after ~4s)
- DevTools > Rendering > Paint flashing: no repaints while stars animate
- DevTools > Rendering > Emulate `prefers-reduced-motion: reduce`: stars static, no streak
- Switch to light theme: stars fully hidden

- [ ] **Step 6: Commit**

```bash
git add src/09-scenery.css dist/
git commit -m "feat(scenery): layered star field - grid-free tiles, drift, twinkle, shooting star"
```

---

### Task 2: Atmosphere retune (`src/09-scenery.css`)

**Files:**
- Modify: `src/09-scenery.css` — `:root` opacity token, sky gradient, three ridge gradient fallbacks. Mask URLs untouched.

**Interfaces:**
- Consumes: nothing from Task 1
- Produces: nothing consumed later — pure value tuning

- [ ] **Step 1: Retune far-ridge opacity token**

In the `:root` block, change:
```css
    --vitra-scenery-opacity-far: 0.6;
```
to:
```css
    --vitra-scenery-opacity-far: 0.55;
```
Leave the light/pastel override block (`--vitra-scenery-opacity-far: 0.78;` etc.) unchanged.

- [ ] **Step 2: Melt far ridge into sky haze**

Replace the `.vitra-scenery-ridge-far` background gradient:
```css
    background: linear-gradient(
      to bottom,
      hsl(calc(var(--vitra-scenery-hue) - 15) calc(var(--vitra-scenery-sat) * 0.35) 82% / 55%) 0%,
      hsl(calc(var(--vitra-scenery-hue) - 15) calc(var(--vitra-scenery-sat) * 0.5) 55% / 45%) 18%,
      hsl(calc(var(--vitra-scenery-hue) - 15) calc(var(--vitra-scenery-sat) * 0.6) 34% / 65%) 100%
    );
```
with:
```css
    background: linear-gradient(
      to bottom,
      hsl(calc(var(--vitra-scenery-hue) - 15) calc(var(--vitra-scenery-sat) * 0.25) 86% / 38%) 0%,
      hsl(calc(var(--vitra-scenery-hue) - 15) calc(var(--vitra-scenery-sat) * 0.4) 58% / 42%) 22%,
      hsl(calc(var(--vitra-scenery-hue) - 15) calc(var(--vitra-scenery-sat) * 0.5) 36% / 62%) 100%
    );
```
(Lighter, less saturated, lower-alpha summit → haze eats the top line.)

- [ ] **Step 3: Mild desaturation on mid ridge**

Replace the `.vitra-scenery-ridge-mid` gradient saturations only — `* 0.45` → `* 0.4`, `* 0.65` → `* 0.55`, `* 0.7` → `* 0.6` (three stops, same lightness/alpha/positions):
```css
    background: linear-gradient(
      to bottom,
      hsl(var(--vitra-scenery-hue) calc(var(--vitra-scenery-sat) * 0.4) 68% / 50%) 0%,
      hsl(var(--vitra-scenery-hue) calc(var(--vitra-scenery-sat) * 0.55) 36% / 65%) 25%,
      hsl(var(--vitra-scenery-hue) calc(var(--vitra-scenery-sat) * 0.6) 20% / 85%) 100%
    );
```

- [ ] **Step 4: Deepen near ridge**

Replace the `.vitra-scenery-ridge-near` gradient:
```css
    background: linear-gradient(
      to bottom,
      hsl(calc(var(--vitra-scenery-hue) + 20) calc(var(--vitra-scenery-sat) * 0.7) 22% / 85%) 0%,
      hsl(calc(var(--vitra-scenery-hue) + 20) calc(var(--vitra-scenery-sat) * 0.8) 8% / 97%) 100%
    );
```
with:
```css
    background: linear-gradient(
      to bottom,
      hsl(calc(var(--vitra-scenery-hue) + 20) calc(var(--vitra-scenery-sat) * 0.7) 18% / 88%) 0%,
      hsl(calc(var(--vitra-scenery-hue) + 20) calc(var(--vitra-scenery-sat) * 0.8) 5% / 98%) 100%
    );
```

- [ ] **Step 5: Warm the dark-sky horizon band**

In the `.vitra-scenery-sky` rule (the dark default one, NOT the `[data-theme="light"], [data-theme="pastel"]` override), change the final `to bottom` gradient stop:
```css
      hsl(var(--vitra-scenery-hue) calc(var(--vitra-scenery-sat) * 0.6) 40% / 25%) 100%
```
to:
```css
      hsl(calc(var(--vitra-scenery-hue) + 8) calc(var(--vitra-scenery-sat) * 0.65) 45% / 30%) 100%
```
Light-theme sky override: untouched.

- [ ] **Step 6: Lint, build, test**

```bash
npm run lint && npm run build && npm test
```
Expected: all pass.

- [ ] **Step 7: Visual verify across themes**

`npm run dev`, check dark, light, pastel, neon, ocean:
- Dark: far ridge summit melts into sky glow (no crisp cutout line at top of far range); near ridge reads darkest; depth ladder far→mid→near obvious
- Light/pastel: ridges still legible (their opacity overrides untouched), no washout regression
- Neon/ocean: hue-derived colors still harmonious

- [ ] **Step 8: Commit**

```bash
git add src/09-scenery.css dist/
git commit -m "feat(scenery): atmospheric depth retune - far ridge haze melt, deeper near ridge, warmer horizon"
```

---

### Task 3: Release v1.10.0 on main

**Files:**
- Modify: `package.json` (version), `CHANGELOG.md` (new entry), `README.md` (any `1.9.0` version strings)
- Do NOT edit: `package-lock.json` by hand (`npm version` handles it), `ROADMAP.md` unless it states a "current version"

**Interfaces:**
- Produces: git tag `v1.10.0` on origin — Task 4's CDN URLs depend on this tag existing on GitHub

- [ ] **Step 1: Add CHANGELOG entry**

At the top of `CHANGELOG.md` (below the title, above the `1.9.0` entry), add — match the existing entry format in the file:

```markdown
## [1.10.0] — 2026-07-15

### Added
- Scenery star field rebuilt as three overlapping tiles (420×280 / 660×440 / 540×360) — visible repeat grid eliminated
- Star drift layer (right-to-left, follows scene wind, `--vitra-scenery-speed` aware) with staggered twinkle
- Occasional shooting-star streak (17s cycle, transform/opacity only)
- All new star animations disabled under `prefers-reduced-motion`

### Changed
- Atmospheric depth retune: far ridge melts into sky haze (lighter/desaturated summit, opacity 0.6 → 0.55), near ridge deepened, dark-sky horizon band slightly warmer
```

- [ ] **Step 2: Update README version strings**

```bash
grep -n "1\.9\.0" README.md
```
Update every hit to `1.10.0` (CDN examples, badges). Same check on `ROADMAP.md` — only change strings that claim "current version"; leave historical notes.

- [ ] **Step 3: Bump version + rebuild**

```bash
npm version 1.10.0 --no-git-tag-version
npm run build
npm test
```
Expected: `package.json`/`package-lock.json` at 1.10.0, fresh `dist/` + `dist/SRI.txt`, tests PASS.

- [ ] **Step 4: Commit, tag, push**

```bash
git add -A
git commit -m "chore(release): v1.10.0 - layered star field + atmospheric depth retune"
git tag v1.10.0
git push origin main --tags
```
Expected: main and tag `v1.10.0` on GitHub (tag is what jsDelivr serves `@v1.10.0` from).

---

### Task 4: Demo sync + hero CTA cut (demo branch worktree)

**Files:**
- Modify: `C:\Users\johan\OneDrive\Documentos\DEV\Vitra-demo-wt\index.html` — version strings + hero buttons
- Do NOT modify: `demo.js` (`spawnHeroParticles` is still called internally at demo.js:697)

**Interfaces:**
- Consumes: git tag `v1.10.0` pushed in Task 3 (CDN URLs 404 without it)

- [ ] **Step 1: Bump all version references**

In the demo worktree `index.html`, replace every `v1.9.0` with `v1.10.0` and every bare `1.9.0` with `1.10.0`. Known locations: line 10 (CSS CDN link), 157 (hero badge), 193/201 (quick-start `data-copy` + visible code, both occurrences each), 221/225/231/235 (usage examples), 1229 (footer), 1235 (JS CDN script). Verify none remain:
```bash
grep -n "1\.9\.0" "C:\Users\johan\OneDrive\Documentos\DEV\Vitra-demo-wt\index.html"
```
Expected: no output.

- [ ] **Step 2: Cut hero CTAs to 2**

Replace the hero button group (the `<div class="vitra-flex vitra-justify-center vitra-gap-4 vitra-flex-wrap vitra-mt-6">` containing four `<button>`s: Meet Scenery / Toggle Theme / More Particles / Spawn Particles (Classic)) with:

```html
      <div class="vitra-flex vitra-justify-center vitra-gap-4 vitra-flex-wrap vitra-mt-6">
        <a href="#quick-start" class="vitra-btn vitra-btn-solid vitra-btn-lg">Get Started</a>
        <a href="https://github.com/DesvoSoft/Vitra" class="vitra-btn vitra-btn-ghost vitra-btn-lg" target="_blank" rel="noopener">GitHub</a>
      </div>
```

Theme switching stays available via the navbar dropdown (`data-theme-value` buttons, index.html:80–86) — no loss of function.

- [ ] **Step 3: Verify in browser**

Serve the worktree (`npx serve "C:\Users\johan\OneDrive\Documentos\DEV\Vitra-demo-wt"`) and check:
- Page loads with CDN v1.10.0 assets (Network tab: 200s from jsdelivr, not 404 — if 404, jsDelivr hasn't picked up the tag yet; retry after a few minutes)
- New star behavior visible in hero (grid-free, drift, twinkle, shooting star)
- Hero shows exactly 2 CTAs; "Get Started" scrolls to Quick Start; GitHub opens repo
- Theme dropdown still switches themes; light theme hides stars

- [ ] **Step 4: Commit and push (GitHub Pages prod)**

```bash
git -C "C:\Users\johan\OneDrive\Documentos\DEV\Vitra-demo-wt" add index.html
git -C "C:\Users\johan\OneDrive\Documentos\DEV\Vitra-demo-wt" commit -m "feat(demo): sync to v1.10.0 - layered stars, hero cut to 2 CTAs"
git -C "C:\Users\johan\OneDrive\Documentos\DEV\Vitra-demo-wt" push origin demo
```
Expected: push succeeds; GitHub Pages redeploys demo branch; prod shows new hero.

---

### Task 5: Mountain-shading preview experiment (scratchpad only — NOT committed)

**Files:**
- Create: `<session scratchpad>\scenery-preview.html` (self-contained, opens via file://)

**Interfaces:**
- Consumes: current ridge mask SVGs from `src/09-scenery.css` (copied verbatim for the "current" pane)
- Produces: a visual verdict from the user only. NOTHING from this task enters `src/` or any commit.

- [ ] **Step 1: Build the side-by-side preview**

Create `scenery-preview.html`: two `position:relative; overflow:hidden` panes side by side, each containing the full scenery DOM (`sky`, `stars`, `halo`, `ridge-far/mid/near`, `grain`) and an inline `<style>` copied from the current `@layer scenery` rules (hardcode `--vitra-scenery-hue: 250; --vitra-scenery-sat: 60%;` and a dark `--vitra-color-bg: #0a0a14` since no framework CSS is linked).

Left pane: current masks verbatim.
Right pane: identical except each ridge `mask-image` gains interior shading paths. Masks are luminance/alpha — a path at partial `fill-opacity` renders that region partially transparent, i.e. darker terrain shading that follows the silhouette. Far ridge example (silhouette path copied from src, plus two interior facet paths):

```
mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 400' preserveAspectRatio='none'><path d='M0 400V258C50 252 95 240 135 222C165 208 190 186 220 172C240 163 258 168 275 158C295 146 310 128 330 118L345 110C360 122 372 138 390 148C405 156 418 152 432 144C450 134 462 116 478 104L495 92C505 85 512 78 522 70L535 60C555 80 570 104 592 122C615 141 640 152 668 162C700 173 730 180 760 190C795 202 825 215 858 224C888 232 920 236 950 234C980 232 1008 222 1035 208C1060 195 1080 176 1105 160L1125 146C1135 138 1143 130 1155 124L1168 117C1185 135 1200 155 1222 170C1250 189 1280 200 1310 210C1350 222 1395 227 1440 258V400Z' fill-opacity='0.62'/><path d='M535 60C555 80 570 104 592 122C615 141 640 152 668 162L668 400H535Z' fill-opacity='0.25'/><path d='M330 118L345 110C360 122 372 138 390 148L390 400H330Z' fill-opacity='0.2'/><path d='M1168 117C1185 135 1200 155 1222 170L1222 400H1168Z' fill-opacity='0.22'/></svg>");
```

(Base silhouette at `fill-opacity 0.62`; the shadow-side facets stack on top of it, so overlap regions sum toward ~0.85 opacity — east faces read darker, west faces lighter. Iterate the facet paths freely in the preview; visual result is what's judged, not these starting values.)

Mid and near ridges: same technique, one or two facet paths each, subtler (`fill-opacity` 0.1–0.15 over a ~0.7 base).

- [ ] **Step 2: Hand to user**

Tell the user the file path; they open it in a browser and compare panes. Record verdict:
- Approve → future release ports the shaded masks to `src/` (separate spec/plan)
- Reject → delete the file; done

---

## Final QA (after Task 4)

- [ ] Prod GitHub Pages URL: hero shows grid-free animated stars, 2 CTAs, v1.10.0 badge
- [ ] All 5 themes cycle cleanly on prod
- [ ] `prefers-reduced-motion` emulation on prod: static scenery, no streak
