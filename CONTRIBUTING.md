# Contributing to Vitra CSS

Thanks for your interest in improving Vitra CSS. This document covers how to set up the project, the conventions the codebase follows, and how to propose changes.

## Development Setup

```bash
git clone https://github.com/desvosoft/vitra-css.git
cd vitra-css
npm install
npm run dev        # serves the repo root (npx serve .), open index.html for the live demo
```

There is no framework build step required to preview changes to `index.html` — it loads `dist/` directly. If you change anything in `src/`, rebuild before viewing:

```bash
npm run build       # full build: CSS + JS (+ ESM + SRI manifest)
npm run build:css   # src/*.css -> dist/vitra.css + dist/vitra.min.css
npm run build:js    # src/vitra.js -> dist/vitra.js (IIFE) + dist/vitra.min.js
npm run build:esm   # src/vitra.js -> dist/vitra.esm.js
```

## Running Checks Locally

Run these before opening a pull request — CI runs the same checks on Linux, macOS, and Windows:

```bash
npm run build   # must succeed
npm run lint     # stylelint --fix on src/**/*.css, must exit clean
npm test         # vitest run, must pass
npm run size     # size-limit budget check (dist/vitra.min.css, vitra.min.js, vitra.esm.js)
```

`npm run lint` auto-fixes what it can; re-run it and inspect the diff before committing.

## Branch and PR Conventions

- Branch from `main`, name branches descriptively (`fix/dropdown-focus`, `feat/table-glass-tokens`, `docs/contributing-guide`).
- Keep pull requests scoped to one concern where possible — a CSS fix and an unrelated JS refactor should be separate PRs.
- Write commit messages in [Conventional Commits](https://www.conventionalcommits.org/) style: `feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`. This keeps history scannable and helps `CHANGELOG.md` stay accurate.
- Reference the relevant issue number in the PR description if one exists.
- A maintainer will review and may request changes before merging. Small, focused PRs get reviewed faster.

## Coding Conventions

Full architectural rules live in [`CLAUDE.md`](./CLAUDE.md) — read it before making non-trivial changes. The essentials:

- **Naming:** every CSS class is prefixed `.vitra-`; every custom property is prefixed `--vitra-`. No exceptions.
- **CSS layers:** the cascade layer order (`tokens, glass, particles, motion, scenery, layout, components, utilities, shaders`) is defined once in `src/01-tokens.css` and must be preserved. Never use `@import` in CSS source files — the build concatenates files listed in `scripts/build-css.js`.
- **Glass components:** any translucent/glassmorphism surface must be wrapped in `@supports (backdrop-filter: blur(4px)) or (-webkit-backdrop-filter: blur(4px))`, with a solid, non-transparent fallback declared outside/before that block. Never ship a glass effect without a fallback.
- **Motion:** every new animation, transition, or keyframe-driven effect needs a corresponding rule inside a `@media (prefers-reduced-motion: reduce)` block that disables or neutralizes it.
- **No new `!important`.** Existing instances are being phased out; don't add more.
- **JavaScript:** `src/vitra.js` is a single IIFE exposing `window.Vitra`. Private members (functions, variables not part of the public module API) are prefixed with `_`. Console warnings use `console.warn('[Vitra <ModuleName>] ...')` — never `console.error()`.
- **No runtime dependencies.** Vitra CSS ships zero dependencies; keep it that way.

## Proposing a New Theme

1. Add a new `html[data-theme="name"]` block in `src/00-themes.css`, overriding the same token set the existing themes override (background, surface, border, text, shadows, `--vitra-glass-bg`, `color-scheme`).
2. Add the theme name to the `VALID_THEMES` array in `src/vitra.js`.
3. Add an `<option>` for it in the theme switcher in `index.html`.
4. Verify contrast and glass legibility manually in the demo page under both `prefers-reduced-motion: reduce` and `prefers-contrast: more`.

## Proposing a New Component

1. Add the component's CSS to `src/06-components.css`, inside the existing `@layer components { ... }` block, following the section-comment style already used there (`/* === COMPONENT NAME (COMP-NN) === */`).
2. If the component needs JS behavior, add a new module to the IIFE in `src/vitra.js` and expose it on the public `Vitra` return object.
3. Document usage in `docs/integration.md`.
4. If the component includes a glassmorphism variant, follow the `@supports` fallback pattern described above.
5. If the component animates anything, add a `prefers-reduced-motion` rule for it.

## Proposing a New Utility

Add it to `src/07-utilities.css` inside the existing `@layer utilities { ... }` block, matching the naming pattern of nearby utilities.

## Proposing a New CSS Layer

Create `src/NN-name.css`, add the layer name to the `@layer` directive in `src/01-tokens.css` (in the correct cascade position), and add the file to the `sourceFiles` array in `scripts/build-css.js` in the same order.

## Questions

Open a [GitHub issue](https://github.com/desvosoft/vitra-css/issues) for anything not covered here.
