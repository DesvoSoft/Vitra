# Vitra Docs Page — Design

**Date:** 2026-07-17
**Status:** Approved direction (option B: static docs on demo branch)
**Deploys to:** GitHub Pages via `demo` branch → `…/Vitra/docs/`

## Goal

A documentation page, separate from the demo, with a classic framework-docs
layout (sidebar + prose + copyable code) that explains how to use Vitra in
detail — and that showcases Vitra loudly: the docs UI itself is built from
Vitra components, so reading the docs *is* using the framework.

## Why static, not Starlight

- Current deploy stays untouched: push static files to `demo` branch, no CI,
  no Pages source switch, no Astro toolchain.
- Dogfooding: Starlight owns `html[data-theme]`, which collides with Vitra's
  theme system and would force examples into iframes. Static page styled by
  Vitra itself has no collision and doubles as marketing.
- Scale fits: core-first scope is one page. Starlight remains a future
  migration path if docs grow past ~30 pages; the prose ports easily.

## Files (all on `demo` branch)

| File | Purpose |
|------|---------|
| `docs/index.html` | The docs page (single long page, one section per topic) |
| `docs/docs.css` | Docs-specific layout/prose styles (sidebar grid, typography, code blocks) |
| `docs/docs.js` | Small: scrollspy for sidebar active state, copy-to-clipboard buttons (Vitra toast on copy), mobile nav drawer wiring |

Loads `vitra.min.css` + `vitra.min.js` from jsDelivr pinned at the current
release tag (v1.10.3 today; bumped with the demo on each release). No
`demo.css`/`demo.js` reuse — docs stand alone. `<link rel="preconnect">` to
cdn.jsdelivr.net like the demo. No scenery, no particles: instant load.

## Layout

- **Header (sticky, slim, glass):** "Vitra · Docs" wordmark, version badge,
  links → Demo / GitHub, and the navbar theme dropdown (same pattern the demo
  uses, working since v1.10.3). Theme switching is prominent on purpose:
  re-coloring the whole docs site is the framework's best pitch.
- **Sidebar (left, fixed, ~240px, subtle glass):** section nav with
  scrollspy-highlighted active item.
- **Content column:** prose capped ~72ch, anchor-linked headings, code blocks
  with a copy button (`data-copy` pattern; confirmation via `Vitra.toast`).
- **Mobile:** sidebar hides; burger button opens the nav as a drawer
  (demo's burger/drawer pattern).
- **Docs hero band (compact):** glass panel with accent gradient, title,
  one-line pitch, version badge. Not a full-screen hero.

## Showcase requirement (user: Vitra must stand out, by a lot)

The docs chrome is built from real Vitra components:

- Vitra **tabs** switch CDN / npm install instructions.
- Vitra **badges** tag sections ("CSS-only", "needs JS").
- Vitra **toast** confirms every code copy.
- Vitra **tooltips** on token names in the tokens table.
- **Glass** on header, sidebar, hero, and example panels.
- Every component section shows the **live rendered example first**, snippet
  second.

Prose itself sits on a clean surface for readability — Vitra owns the chrome,
legibility owns the text.

## Sections (core-first scope)

1. **Introduction** — what Vitra is, philosophy (CSS-only core, optional JS,
   zero dependencies), link to demo.
2. **Installation** — pinned CDN (`@vX.Y.Z`) + SRI note, npm, which files to
   use (`vitra.min.css`, optional `vitra.min.js`). Tabs: CDN / npm.
3. **Theming** — the 7 themes, `data-theme` on `<html>`, auto mode +
   persistence, creating a custom theme (which `--vitra-*` tokens to
   override). Source: `docs/themes.md`.
4. **Components** — overview grid: each component (buttons, cards, forms,
   tabs, modals, tooltips, toasts, dropdowns, badges, progress, avatars) with
   a live inline example + minimal HTML snippet. Per-component deep pages are
   out of scope.
5. **JavaScript API** — module-by-module reference: `theme`, `particles`,
   `reveal`, `modal`, `tooltip`, `toast`, `dropdown`, `spotlight`, plus
   `destroyAll`. Source: `docs/integration.md`.
6. **data-config** — declarative init without writing JS; document defaults
   and opt-outs (e.g. `"dropdown": false`), reflecting the v1.10.3 auto-init
   behavior: missing `data-config` still initializes default modules.
7. **Accessibility & Browser Support** — `prefers-reduced-motion` behavior,
   `@supports` fallbacks for `backdrop-filter`, short browser matrix.
   Source: `docs/compatibility.md`.

All content in English.

## Behavior details

- Scrollspy: one `IntersectionObserver` over section headings toggles the
  sidebar active class. No scroll listeners.
- Copy buttons: clipboard API with `execCommand` fallback; success/failure
  via `Vitra.toast`.
- Theme: `Vitra.theme.init({ defaultTheme: 'auto', persist: true })` — shares
  the `vitra-theme` localStorage key with the demo, so theme choice carries
  across demo ↔ docs.
- Demo navbar gets a "Docs" link pointing at `docs/` (small demo edit, same
  commit series).

## Error handling / edge cases

- No-JS: full content readable, sidebar links still work as anchors; only
  scrollspy/copy/toasts/theme-dropdown degrade. (CSS-only framework —
  docs must honor that.)
- `prefers-reduced-motion`: no docs-added animation beyond Vitra's own
  guarded ones.
- Old browsers: same graceful degradation story as the framework
  (`@supports` guards).

## Out of scope (v1)

Search, multi-page structure, docs versioning, i18n, scenery/particles on
docs, per-component deep-dive pages, build tooling for docs.

## Success criteria

- Docs reachable at `/Vitra/docs/`, loads with no CLS and no long main-thread
  work (nothing animates offscreen; no scenery).
- Every code snippet copyable; every component section shows a live example.
- Theme dropdown works and re-colors the whole page; choice persists across
  demo ↔ docs.
- Layout readable at 360px, 768px, 1440px.
