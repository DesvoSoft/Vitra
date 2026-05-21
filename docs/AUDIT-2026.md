# Vitra CSS Framework — Audit 2026

**Date**: 2026-05-21  
**Version**: 1.3.0  
**Scope**: Full codebase analysis — architecture, components, JS modules, themes, performance, accessibility, testing

---

## Table of Contents

1. [File Inventory](#1-file-inventory)
2. [Architecture Audit](#2-architecture-audit)
3. [Theme System Audit](#3-theme-system-audit)
4. [Component Coverage](#4-component-coverage)
5. [JS Module Audit](#5-js-module-audit)
6. [Test Coverage Analysis](#6-test-coverage-analysis)
7. [Bundle Analysis](#7-bundle-analysis)
8. [Build Pipeline Audit](#8-build-pipeline-audit)
9. [API Design Review](#9-api-design-review)
10. [Mobile Responsiveness](#10-mobile-responsiveness)
11. [Typography & Motion](#11-typography--motion)
12. [Naming Convention](#12-naming-convention)
13. [Accessibility Audit](#13-accessibility-audit)
14. [Roadmap 2026-2027](#14-roadmap-2026-2027)

---

## 1. File Inventory

### Source CSS

| File | Lines | Key Content |
|------|-------|-------------|
| `00-themes.css` | 136 | 7 themes (light, dark, auto, pastel, neon, ocean, emerald) |
| `01-tokens.css` | 181 | Foundation tokens, Google Fonts import, layer declaration |
| `02-glass.css` | 117 | Glass system with `@supports` fallbacks, 4 blur levels |
| `03-particles.css` | 202 | Particle system, glow variants, responsive limits |
| `04-motion.css` | 421 | 17 keyframes, reveal classes, hover interactions, cinematic effects |
| `05-layout.css` | 313 | Grid, container, section, hero, footer, fluid spacing |
| `06-components.css` | 2,326 | 17 component systems (buttons, cards, forms, modals, drawers, etc.) |
| `07-utilities.css` | 614 | Spacing, display, flex, grid, width/height, z-index, responsive variants |

### Source JS

| File | Lines | Content |
|------|-------|---------|
| `vitra.js` | 1,059 | 8 modules: theme, particles, reveal, modal, tooltip, toast, dropdown, spotlight |

### Tests

| File | Lines | Tests |
|------|-------|-------|
| `vitra.test.js` | 535 | 60 tests |

### Build Output

| Asset | Size (minified) | Size (brotlied) |
|-------|-----------------|-----------------|
| `vitra.min.css` | 83,448 B | ~10.5 KB |
| `vitra.min.js` | 11,670 B | ~3.7 KB |
| `vitra.esm.js` | 28,129 B | ~5.3 KB |

---

## 2. Architecture Audit

### @layer Strategy

**Status**: ✅ Sound with caveats

- Layer order: `tokens, glass, particles, layout, motion, components, utilities`
- Build concatenation respects layer order
- `00-themes.css` is placed after `01-tokens.css` so themes override base tokens within `@layer tokens`

**Issues**:

1. **`@import` before `@layer` violates CSS spec** (`01-tokens.css:7`)
   - Google Fonts `@import` is placed before `@layer` declaration
   - The CSS spec requires `@import` to precede all other at-rules including `@layer`
   - Fix: Move to `<link>` in HTML or place after `@layer` declaration

2. **`errorRecovery: true` in build-css.js** (`scripts/build-css.js:65`)
   - Suppresses CSS syntax errors silently
   - Should be disabled in production builds

---

## 3. Theme System Audit

### Current Themes

| Theme | Accent Hue | Pattern |
|-------|-----------|---------|
| Default (dark) | 245 (purple) | Full coverage |
| Light | 245 (purple) | Full coverage |
| Dark | 245 (purple) | Full coverage |
| Pastel | 320 (pink) | **Incomplete property coverage** |
| Neon | 180 (cyan) | **Incomplete property coverage** |
| Ocean | 200 (blue) | **Incomplete property coverage** |
| Emerald | 155 (green) | **Incomplete property coverage** |
| Auto | 245 (purple) | Dark variant incomplete |

### Critical Issues

1. **Decorative themes missing properties**: Pastel, neon, ocean, emerald do not define `--vitra-color-text-tertiary`, `--vitra-color-surface-hover`, `--vitra-color-surface-active`, `--vitra-color-border-hover`, `--vitra-shadow-*`, `--vitra-color-bg-warm`, `--vitra-color-bg-cool`, `--vitra-color-accent-oklch`, `--vitra-border-glow-angle`. These fall through to default dark values.

2. **Auto theme dark variant incomplete**: `html[data-theme="auto"]` does not define `--vitra-color-text-primary` or `--vitra-color-text-secondary` for dark mode — they rely on `:root` defaults.

3. **Missing `color-scheme`**: No `color-scheme: light/dark` on `html[data-theme="..."]`, so browser-native elements (scrollbars, form controls) may not match theme.

4. **No flash prevention**: No blocking `<script>` in `<head>` to read localStorage and set `data-theme` before CSS renders.

5. **No `forced-colors` or `prefers-contrast` support**: Accessibility gap for high-contrast users.

### Recent Improvements (Lote 2)

- All surfaces now tinted with `var(--vitra-color-accent-h)` — no more pure neutral grays
- Added `--vitra-color-accent-oklch`, `--vitra-color-bg-warm`, `--vitra-color-bg-cool`
- Auto-light theme completed with all tokens
- `VALID_THEMES` frozen with `Object.freeze()`
- Theme changes announce via `#vitra-theme-announcer` (aria-live)

---

## 4. Component Coverage

### Covered (17 component systems)

Buttons, Cards, Forms (partial), Navigation (Navbar + Drawer), Modals, Badges, Avatars, Tooltips, Sliders, Tabs, Progress bars, Toasts, Dropdowns, Form Validation, Spotlight (magnetic hover), Skeleton loaders, Spinners, Alerts, Tables, Cinematic effects (gradient bg, glow orbs, gradient text, border glow)

### Missing (for premium completeness)

| Priority | Component | Reason |
|----------|-----------|--------|
| **High** | Sidebar / Side Navigation | No app-layout sidebar — drawer is overlay-only |
| **High** | Custom checkbox | Only toggle switch exists; checkbox needs visual styling + `accent-color` |
| **High** | Input group (prepend/append) | Ultra-common form pattern |
| **Medium** | Accordion | Expected in any component library |
| **Medium** | Pagination | Required for list/data navigation |
| **Medium** | Chips / Tags | Modern form UX |
| **Medium** | File upload / Dropzone | Real-world forms |
| **Medium** | Dialog / Confirm | Semantic distinct from modal |
| **Low** | Breadcrumbs, Stepper, Timeline, Rating, Carousel, Empty State, List group, Stat card | Nice-to-have |

---

## 5. JS Module Audit

### Modules (8)

| Module | Lines | Has `destroy()`? | Known Issues |
|--------|-------|------------------|--------------|
| Theme | ~170 | No | `_watchSystemTheme` listener never cleaned up |
| Particles | ~135 | ✅ Yes | `_activeParticles` array leaks if `destroy()` not called; `init()` spawns without clearing previous |
| Reveal | ~90 | No | `_revealedElements` array grows unbounded; no way to disconnect observer |
| Modal | ~120 | No | Focus trap doesn't guard against removed elements |
| Tooltip | ~195 | No | Dangling DOM nodes if `hide()` interrupted; listener cleanup incomplete |
| Toast | ~50 | N/A | Functional — creates and removes elements |
| Dropdown | ~35 | No | Document listener never removed; Popover API fallback when supported |
| Spotlight | ~90 | No | mousemove listener never removed; runs even when no spotlight elements exist |

### Critical Issues

1. **Memory leaks**: 5 of 8 modules lack `destroy()` methods → no cleanup path
2. **Duplicate event listeners**: Tooltip `init()` adds listeners on every call without removing previous
3. **Hard-coded easing in reveal** (`vitra.js:438`): Uses `cubic-bezier(0.23, 1, 0.32, 1)` instead of referencing `--vitra-ease-luxury`
4. **`_previousFocus.focus()` unguarded** (`vitra.js:578`): Throws if element was removed from DOM
5. **`particles.init()` multiple calls**: Spawns additional particles without destroying previous ones

---

## 6. Test Coverage Analysis

### Current: 60 tests, all passing

| Area | Tests | What's Tested | Gap |
|------|-------|---------------|-----|
| Theme | 14 | get/set/toggle/init/persist/clear/validation/announcer/themes list | No `color-scheme` test, no flash-prevention test |
| Particles | 7 | spawn/destroy/limits/container/device limit | No emoji test, no reduced-motion path |
| Reveal | 2 | no-error init, reduced-motion | No stagger timing, no IntersectionObserver mock test |
| Modal | 4 | open/close/aria/scroll lock/listeners | No focus trap, no Escape key, no overlay click |
| Tooltip | 3 | show/hide/aria-describedby | No position tests, no delay test, no viewport edge test |
| Toast | 2 | show/XSS prevention | No auto-dismiss timing, no variants test |
| Dropdown | 1 | init no-error | No open/close test, no Popover API test |
| Spotlight | 1 | init no-error | No mouse tracking test |
| CSS Classes | 13 | Class existence in source | **No computed style tests** |
| Cinematic | 7 | Class existence in source | **No computed style tests** |
| Premium Tokens | 4 | Token presence in source | **No computed style tests** |

### Critical Gaps

1. **No CSS rendering tests**: Tests verify class names, not computed styles. No test for `getComputedStyle(el).display`, `borderRadius`, etc.
2. **No integration tests**: JS + CSS interaction untested (e.g., does `set('dark')` actually change the background?)
3. **No accessibility tests**: No axe-core or automated a11y checking
4. **No cross-browser tests**: No Playwright multi-browser tests
5. **`size-limit` not in CI**: Bundle size regressions not caught automatically

---

## 7. Bundle Analysis

### CSS Composition

| Metric | Value |
|--------|-------|
| Total rules | 803 |
| Selectors | ~858 |
| At-rules | 57 |
| `@keyframes` | 17 |
| `@media` blocks | 24 |
| Unique `--vitra-*` properties | 386 |

### CSS Size by Layer (approximate)

| Layer | Size (minified) |
|-------|-----------------|
| Tokens + Themes | ~10 KB |
| Glass | ~3 KB |
| Particles | ~4 KB |
| Motion + Cinematic | ~8 KB |
| Layout | ~6 KB |
| Components | ~40 KB |
| Utilities | ~17 KB |

### Size Budget

| Asset | Budget | Actual | Status |
|-------|--------|--------|--------|
| `vitra.min.css` | 85 KB | 83.4 KB | ✅ Pass |
| `vitra.min.js` | 15 KB | 11.7 KB | ✅ Pass |
| `vitra.esm.js` | 30 KB | 28.1 KB | ✅ Pass |

### Efficiency Concerns

- `.vitra-grid` defined in both `05-layout.css` and `07-utilities.css` (duplicate)
- Spacing utilities generate ~216 rules from 12 values × 9 directions × 2 (margin/padding)
- `@import` for Google Fonts blocks rendering

---

## 8. Build Pipeline Audit

### Current Pipeline

```
src/*.css → [concatenate] → dist/vitra.css → [lightningcss minify] → dist/vitra.min.css
src/vitra.js → [esbuild IIFE] → dist/vitra.js → [esbuild --minify] → dist/vitra.min.js
             → [esbuild ESM] → dist/vitra.esm.js
```

### Issues

| Issue | Severity | Fix |
|-------|----------|-----|
| `errorRecovery: true` in prod | Medium | Gate behind `--dev` flag or remove |
| No CSS lint in build pipeline | Low | Add `stylelint` to build script |
| Hard-coded browser targets | Low | Use `browserslist` config |
| `size-limit` not in CI | Medium | Add to GitHub workflow |

### Improvements Already Made

- ✅ CSS source maps for `vitra.min.css`
- ✅ `size-limit` config with 3 budgets (CSS, JS, ESM)
- ✅ SRI hashes generated in postbuild
- ✅ TypeScript definitions (`vitra.d.ts`)

---

## 9. API Design Review

### Strengths
- Intuitive naming: `Vitra.theme.set('dark')`
- Consistent options object pattern
- `getEffective()` resolves `auto` theme
- ESM/CJS/IIFE multi-export

### Pain Points

| Issue | Detail |
|-------|--------|
| Modal selector auto-prepends `#` | `modal.open('my-id')` → `#my-id`, but `.my-class` stays — confusing |
| Tooltip `hide()` optional target vs modal `close()` no args | Inconsistent signatures |
| Inconsistent state class names | `.open` (drawer) vs `.vitra-modal-open` (modal) vs `.show` (toast) |
| No `destroy()` on most modules | Memory leaks |
| `data-config` magic not documented | Hidden feature, JSON in HTML attribute |

---

## 10. Mobile Responsiveness

### ✅ What works well
- Responsive container with `clamp()` padding
- Grid with responsive variants (`vitra-grid-md-2`, `vitra-grid-lg-3`)
- Table with stacked card layout via `@media` + `@container`
- Drawer as mobile overlay (`width: 80%; max-width: 320px`)
- Particles capped at 15 on mobile vs 40 on desktop
- Responsive display utilities (`vitra-md-block`, `vitra-lg-hidden`)

### ❌ Gaps

| Issue | Detail |
|-------|--------|
| No responsive heading sizes | `h1-h6` have no `font-size` across breakpoints |
| No responsive button sizing | `vitra-btn-lg` stays large on mobile |
| No responsive card grid auto-fill | Fixed columns only (`vitra-grid-4` is always 4 columns) |
| Modal padding on small screens | `padding: var(--vitra-space-6)` (48px) leaves ~54% for content on 375px screens |
| Icon buttons below touch target | `vitra-drawer-close` at 32×32px < recommended 44×44px |
| No `-webkit-tap-highlight-color` on interactive elements | Only toggle label has it |
| Toast overflow on mobile | 350px max on 375px screen + 16px margin = overflow risk |
| No vertical rhythm utility | No `.vitra-stack` for consistent sibling spacing |

---

## 11. Typography & Motion

### Typography

| Token | Value |
|-------|-------|
| `--vitra-font-family` | Inter, system sans-serif stack |
| `--vitra-font-heading` | Outfit |
| `--vitra-font-mono` | JetBrains Mono (unused) |
| Size scale | 0.75rem → 3rem (12px → 48px) |
| 4 weights | 400, 500, 600, 700 |

**Issues**: No heading-specific size tokens (`--vitra-font-size-h1`), no responsive scale via `clamp()`, `--vitra-font-mono` never used, Google Fonts `@import` is render-blocking.

### Motion

| Easing | Curve | Usage |
|--------|-------|-------|
| `--vitra-ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions |
| `--vitra-ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Rarely used |
| `--vitra-ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Exit animations |
| `--vitra-ease-luxury` | `cubic-bezier(0.23, 1, 0.32, 1)` | Premium reveals, modals |
| 17 `@keyframes` | — | Particles, reveal, shimmer, cinematic |

**Issues**: 3 easing curves + hard-coded `ease`, `ease-in-out`, `linear` in keyframes = diluted design system; no `will-change` hints; global `*` reduced-motion may break third-party widgets.

---

## 12. Naming Convention

### Prefix: `vitra-` (classes) / `--vitra-` (properties)

**Consistency issues**:

| Issue | Location |
|-------|----------|
| `--vitra-bg-accent` vs `--vitra-color-bg-accent` | `00-themes.css:23` — missing `color-` prefix |
| `.open` vs `.vitra-modal-open` vs `.show` | Different state class names across components |
| `.vitra-tab` vs `.vitra-tabs-tab` (duplicate) | `06-components.css:1471-1472` |
| `.vitra-grid` in two files | Layout + Utilities layers |
| `--mouse-x` / `--mouse-y` missing `vitra-` prefix | `06-components.css:1935` |
| `--vitra-color-border-rgb` (theme-dependent white) | `01-tokens.css:27` — should be dynamic per theme |

---

## 13. Accessibility Audit

### ✅ What's implemented
- `prefers-reduced-motion` respected at CSS + JS level
- Modal: `role="dialog"`, `aria-modal="true"`, `aria-hidden`, focus trap, body scroll lock
- Tooltip: `role="tooltip"`, `aria-describedby` with unique ID
- Theme announcer: `#vitra-theme-announcer` with `aria-live="polite"`
- `.vitra-sr-only` utility for screen-reader-only content
- `:focus-visible` on interactive elements
- Toggle switch: hidden native checkbox with visible custom toggle (accessible)

### ❌ Gaps

| Gap | Detail |
|-----|--------|
| No `color-scheme` on themes | Browser-native UI not themed |
| No `forced-colors` support | High-contrast mode not tested |
| No `prefers-contrast` support | No enhanced contrast variants |
| No `:invalid` / `:required` styling | Form validation relies on JS classes |
| No error message pattern | No `.vitra-input-error` or `aria-describedby` integration |
| No `fieldset`/`legend` styling | Form groups not styled |
| Keyboard navigation gaps | Drawer focus trap, tooltip keyboard dismissal not documented |
| No axe-core tests | No automated a11y regression checks |

---

## 14. Roadmap 2026-2027

### Phase: Immediate (v1.3.1 — hotfixes from audit)

- [ ] Complete property coverage in pastel/neon/ocean/emerald themes
- [ ] Add `color-scheme: light/dark` to all `html[data-theme]`
- [ ] Fix `@import` before `@layer` (move Google Fonts to `<link>` recommendation)
- [ ] Add CSS rendering tests (computed style verification)
- [ ] Disable `errorRecovery: true` in production build
- [ ] Add `--vitra-font-size-h1` through `--vitra-font-size-h6` tokens

### Phase: Short-term (v1.4 — JS hygiene + missing components)

- [ ] Add `destroy()` to modal, tooltip, reveal, dropdown, spotlight
- [ ] Fix memory leaks (particles array, tooltip DOM, reveal array)
- [ ] Add Sidebar / Side Navigation component
- [ ] Add custom checkbox styling
- [ ] Add Input group (prepend/append)
- [ ] Add Accordion component
- [ ] Add Pagination component

### Phase: Medium-term (v1.5 — modern CSS migration)

- [ ] Migrate to `light-dark()` function for single-declaration theming
- [ ] Add blocking `<script>` for theme flash prevention
- [ ] Add per-component CSS imports for tree-shaking
- [ ] Export design tokens as JSON / Style Dictionary format
- [ ] Add `@scope` for component isolation (when browser support matures)

### Phase: Long-term (v2.0 — premium maturity)

- [ ] Add remaining components: Chips, File Upload, Dialog, Stepper, Timeline, Carousel
- [ ] Interactive playground for documentation
- [ ] Visual regression tests with Playwright
- [ ] axe-core a11y audit in CI
- [ ] Responsive heading scale with `clamp()`
- [ ] `will-change` hints on animated elements
- [ ] Reduce easing curves to 2-3 max for cohesive motion language

---

## Appendix: Key Metrics Comparison

| Metric | Vitra v1.2 | Vitra v1.3 | Target v2.0 |
|--------|-----------|-----------|-------------|
| CSS minified | 77 KB | 83 KB | <100 KB |
| JS minified | 11 KB | 11 KB | <15 KB |
| Tests | 49 | 60 | >200 |
| Themes | 7 | 7 | 7+ |
| Components | 14 | 19 | 25+ |
| `@keyframes` | 13 | 17 | 20 |
| Browser support | Modern | Modern | Modern + graceful degradation |
| Tree-shaking | No | No | Per-component imports |

---

*Maintained by DesvoSoft. Updated 2026-05-21.*
