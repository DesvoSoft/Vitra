# Changelog

All notable changes to Vitra CSS are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.14.2] - 2026-11-22

### Fixed

- **Scroll lock on pages that set `overflow` on `<html>`.** The modal and the drawer lock scrolling with `overflow: hidden` on `<body>`, but a body value only reaches the viewport while `<html>` has no overflow of its own. A page that sets one (for example `overflow-x: clip` on `html` and `body`, common with off-canvas menus) kept scrolling behind an open modal or drawer. The stylesheet now also locks the root while a Vitra modal is open, while a drawer toggle is expanded, or while a drawer the module made modal is open. Drawers a page opens with its own script are not affected, as before. CSS only: the script is unchanged.

### Sizes

`vitra.min.css` 18.91 kB brotli (was 18.85); `vitra.min.js` unchanged at 7.49 kB. The SRI hash of the CSS files changes; the JS hashes do not.

### Not verified

Safari (`:has()` is supported since 15.4). Firefox before 121 has no `:has()`: there the body lock works as in 1.14.1.

## [1.14.1] - 2026-11-22

No code changes: every file in `dist/` is byte-identical to 1.14.0, with the same SRI hashes.

jsDelivr cached a file it minified itself in place of `dist/vitra.min.js` for the `v1.14.0` tag, so `https://cdn.jsdelivr.net/gh/DesvoSoft/Vitra@v1.14.0/dist/vitra.min.js` does not match its SRI hash and a browser that checks integrity blocks it. Load 1.14.1 instead. The CSS and every other file served for 1.14.0 are correct.

## [1.14.0] - 2026-11-20

Every component with state or interaction was checked against one contract: legible in all seven themes and in `auto` under a light and a dark system, operable by keyboard with a visible focus ring, 44 px touch targets under `(pointer: coarse)`, no horizontal scroll at 360 px, correct final state under `prefers-reduced-motion`, content visible without JS, and role, name and state exposed for screen readers. The exceptions are listed under Known limitations and Open (tabs have no keyboard module, for one). The screen-reader part is inferred from axe-core and attribute assertions; no screen reader was run. A browser test suite (Playwright with axe-core, Chromium and Firefox) now checks the rest on every change. The one new module is `Vitra.drawer`. No class, token, `data-*` attribute or public method was removed (see "Removed" for one selector that styled nothing).

### Added

- **`Vitra.drawer`** (`open()`, `close()`, `toggle()`, `init()`, `destroy()`): links `[data-vitra-drawer-toggle="#id"]` to a `.vitra-drawer`, keeps the existing `.open` class, and adds `inert` while closed, `aria-expanded` on the toggles, `.active` on a `.vitra-burger` toggle, Esc to close, a focus trap, focus return and the shared scroll lock. It opens and closes the `.vitra-drawer-overlay` (the one named by the drawer's `data-vitra-drawer-overlay="#id"`, or the overlay that is a direct child of the drawer's parent). Auto-initialised; opt out with `"drawer": false` in `data-config`. A drawer that nothing references and the API never opened is left alone.
- **CSS pieces**: `dist/vitra.core.css`, `dist/vitra.scenery.css` and `dist/vitra.effects.css`, each with a `.min.css`, a source map, an `exports` entry (`vitra-css/core.css`, `/scenery.css`, `/effects.css`), a `size-limit` entry and a line in `SRI.txt`. `vitra.css` and `vitra.min.css` keep their content and layer order. Every piece starts with the full `@layer` statement, so pieces can be loaded in any order.
- **ES module with named exports** (`import { theme, drawer } from 'vitra-css'`), plus `dist/vitra.cjs` for `require()`. The `exports` map gains `types`; `src/vitra.d.ts` is now the source of the typings and the build copies it to `dist/vitra.d.ts`. Importing the package still runs the auto-init, so it is not declared side-effect free.
- **`.vitra-checkbox`**, the counterpart of `.vitra-radio` (`<label class="vitra-checkbox"><input type="checkbox"> Text</label>`).
- **Toast**: `Vitra.toast.init()` (creates the live region ahead of the first message; runs on load, opt out with `"toast": false`), the `warning` type (`.vitra-toast-warning`), the `closable` option and `.vitra-toast-close`. A toast with `duration: 0` always gets a close button.
- **Tooltip without JS**: `.vitra-tooltip` with `data-tooltip` now shows on `:hover` (under `(hover: hover)`) and on `:focus-within`. The `::before` rule existed before but nothing revealed it.
- **Dropdown keyboard support**: Arrow Up/Down, Home and End move between items; Arrow Down on the toggle opens the menu; opening with the keyboard focuses the first item; Tab closes the menu and moves on. Both the `.open` route and the `[popover]` route.
- **`Vitra.motionGuard.observe(el)`** puts one element under the offscreen pause. `scenery.mount()` and `particles.spawn()` call it.
- **Tokens**: `--vitra-color-border-control` (the border of an interactive control, defined for every theme), `--vitra-gradient-text-l` (lightness of the animated gradient text) and `--vitra-noise-image` (the grain image of the noise overlays).
- **`--vitra-mouse-x` / `--vitra-mouse-y`** on `.vitra-spotlight`. The old `--mouse-x` / `--mouse-y` are still written and still read, as aliases.
- **Tooling**: `tests/kitchen-sink.html` (every component in every state plus one scenery instance, served by `npm run dev`), Playwright and axe-core specs for contrast, keyboard, touch, reduced motion, no-JS, pieces and motion, a CI job that runs them, `npm run test:browser`, `npm run test:types` and `scripts/measure-motion.cjs`.

### Fixed

- **Themes.** The `auto` theme is generated from the `light` and `dark` rules (marked `/* @vitra-auto-mirror light|dark */` in the source) instead of being written by hand, so it cannot drift from them. `auto` under a light system used to get the dark theme's accent lightness and the night scenery. Colours in `@layer components`, `utilities` and `shaders` come from theme tokens (21 fixed white fills in buttons, cards, inputs, badges, alerts, tables and glass spinners were replaced). The modal panel was near-black in `light`, `pastel` and `auto` light, with dark text on it.
- **`.vitra-glass` border** was dropped by the browser: `rgb(r, g, b / a)` is invalid when the token is a comma-separated triplet.
- **Contrast.** Navbar links, alert dismiss buttons and input placeholders reach 4.5:1 in every theme; input, select and switch borders reach 3:1 (values under "Visible changes"). The light-theme primary button was at 4.45:1 and the active drawer link at 4.40:1.
- **Modal**: focus goes to the content container when nothing inside is focusable; the author's `role`, `aria-modal`, and the body's `overflow` and `padding-right` are kept and restored; the scrollbar width is compensated; the focusable list is recomputed on every Tab and skips hidden elements; the Tab trap listens on `document`, so it survives focus falling to `<body>`; a pending deferred focus is cancelled if the modal closes first. The overlay no longer inherits a `visibility` transition on open, which could leave it hidden for the first frames so that `focus()` failed on a slow frame (seen as a Firefox flake in the test suite).
- **Esc closes one layer at a time.** A tooltip, then a dropdown menu (`.open` or `[popover]`), then the modal or drawer around it: each press closes only the innermost open layer. Before, Esc on a menu or a focused tooltip trigger inside a modal or drawer closed the modal or drawer too, and with it any form state.
- **Malformed selectors no longer break the page.** A `data-vitra-drawer-toggle` or `data-vitra-drawer-overlay` value that is not a valid selector (`"menu[1"`, `"#1nav"`) threw inside auto-init, so the modules after the drawer (dropdown, spotlight, scenery, motionGuard) never started; after load it left a valid drawer open with no scroll lock, no trap and no way to close it. Every selector taken from markup or from a caller (drawer, modal, tooltip, scenery targets, the particles container, the reveal `selector` option) now warns once, `[Vitra <Module>] Invalid selector "…"`, and matches nothing. Auto-init also runs each module on its own: one whose `init()` throws is reported with `console.warn("[Vitra] <key> init failed:", error)` and the next ones still start.
- **`dist/SRI.txt`** listed wrong hashes for `vitra.core.css`, `vitra.scenery.css` and `vitra.effects.css`: the CSS build copied the CRLF line endings of a Windows checkout into the unminified files and hashed those bytes, while git and the CDN serve LF. The build emits LF only, `generate-sri.js` hashes the LF form, `.gitattributes` keeps `dist/` LF in the working copy, and CI checks that `dist/` matches a fresh build. The `.min` files and `vitra.min.js` were already right.
- **Tooltip**: Esc closes it; it adds to, and on close restores, the author's `aria-describedby` instead of overwriting it; it opens on tap and closes on a tap elsewhere; it hides on resize and when the target moves relative to it on scroll (by more than 1 px, so a fractional offset that rounds differently no longer hides it); it is clamped to the viewport; `init()` is idempotent and delegated (elements added later work); no orphan nodes are left behind; its inline styles are one `.vitra-tooltip-js` rule.
- **Toast**: the container is `role="status" aria-live="polite"`; error toasts are `role="alert"`; the message wraps instead of overflowing; the toast is bounded to the screen width.
- **Dropdown**: a `[popover]` menu is placed under its toggle and kept inside the viewport (the top layer ignores `top: 100%`); `aria-expanded` follows the popover's own state, light dismiss included; choosing an item closes it. A long item no longer widens a 360 px page to 569 px, open or closed (a closed menu is `visibility: hidden`, which still creates scrollable overflow): the menu is capped at `calc(100vw - 2 * var(--vitra-space-4))` (the viewport only, so a width you set yourself is kept up to that) and items wrap.
- **Drawer**: a click on a toast (its close button, for one) no longer closes the open drawer; an outside-click close no longer pulls focus back to the toggle, so the input you clicked keeps it (Esc, the close button, the overlay and the API still return focus).
- **Tabs**: a row of tabs scrolls horizontally instead of wrapping or spilling out; tabs are 44 px tall under `(pointer: coarse)`.
- **Touch targets** under `(pointer: coarse)`: toggle label, radio, checkbox, `.vitra-btn-sm`, navbar brand and links, alert dismiss, modal close, toast close, tabs. Hover lifts of buttons, cards, `.vitra-hover-lift` and tilt cards sit under `(hover: hover)`, so they no longer stick after a tap.
- **Overflow** at 360 px: badge, checkbox, radio, spinner label, toggle label, navbar brand and tabs wrap or scroll long text; `.vitra-h-screen` and `.vitra-min-h-screen` use `dvh`; the drawer is `100dvh` and `visibility: hidden` while closed.
- **Reveal**: with `reveal.init()`, the directional variants (`.vitra-reveal` with a direction class) wait for the scroll again, where a load-time keyframe used to hold `opacity: 1` over the hidden state (`init()` holds the keyframe inline until each element is revealed; a page that never calls `init()` still shows them at load, as in 1.13.5); `@media (scripting: none)` shows the content; `reveal.init()` is idempotent, `reset()` watches elements again and `destroy()` restores elements that were still waiting.
- **Theme**: `theme.set()` before `<body>` exists no longer throws; `toggle()` and `getEffective()` work when destructured; `init({ persist: false })` is remembered by later `set()` calls; the system-theme watcher that did nothing is gone; `init({ default })` and `"theme": "neon"` in `data-config` were silently ignored and now work (`defaultTheme` still works); a page with no `data-theme` declares `color-scheme: dark`, so form controls and scrollbars are no longer light on a dark page.
- **Particles**: disconnected nodes are dropped before the limit is computed; `init()` does not spawn twice into a container that already holds particles.
- **Spotlight** listens to `pointermove`; **ripple** started from the keyboard now begins at the centre of the element.
- **Gradient text** takes its lightness from a token and darkens in light themes; `.vitra-modal-full` content gets `90dvh` after the `90vh` fallback; `.vitra-btn-glass` and `.vitra-card-glass` have a solid fallback with their blur inside `@supports (backdrop-filter: …)`.

### Removed

- `.vitra-skeleton-shimmer`, a selector that appeared only inside a `prefers-reduced-motion` rule and styled nothing. The `vitra-skeleton-shimmer` keyframes remain.
- The private `theme._watchSystemTheme`, `theme._mediaChangeHandler` and `theme._isLocalStorageAvailable`, and `theme._canTransition` (it duplicated the shared reduced-motion check).

### Performance

Ambient loops moved off the main thread, and the offscreen pause now covers every infinite loop.

- `.vitra-progress-bar-animated`: the stripes slide with `transform` on a pseudo-element, under the bar's content and transparent to clicks. They used to animate `background-position`, which meant a repaint every frame.
- `.vitra-progress-ring-indeterminate`: a quarter arc turned with `transform`. It used to animate a registered custom property, which repainted the gradient every frame. **Looks different:** it now spins instead of filling.
- The keyframes `vitra-progress-bar-stripes` and `vitra-progress-ring-spin` keep their names but now animate `transform`. A stylesheet that reuses them on its own elements gets the new motion.
- `.vitra-border-glow`: the spinning layer covers hosts of any proportion (a 600×60 bar used to show bare ends). The layer is larger for wide hosts: it is a square of 1.5× the longer side, so a 600×60 host goes from 1200×120 to 900×900 and a 1200×80 host from 2400×160 to 1800×1800 (more GPU memory per element).
- `.vitra-noise-overlay-animated`: the grain now sits in a static layer and only the overlay fades. This is a structural change with no measured gain: it is kept because the result is pixel-identical and it follows the rule of animating a container, not the painted layer.
- `Vitra.motionGuard` now also pauses particles (through their container), spinners, skeletons, animated progress bars, indeterminate rings, the noise overlay and the `-double` gradient layer while they are offscreen.
- Permanent `will-change` removed from buttons, burger lines, `.vitra-hover-lift` and the clip-path effects; reveal classes drop it once revealed.

Idle cost, one section at a time (before → after):

| | Chromium paints/s | Chromium style recalcs/s | Chromium main thread ms/s | Firefox main thread ms/frame |
|---|---|---|---|---|
| Empty page | 0 → 0 | 0 → 0 | 0 → 0 | 0.027 → 0.021 |
| Animated progress bar | 180 → **0** | 60 → **0** | 14.7 → **0.4** | 0.314 → **0.062** |
| Indeterminate ring | 181 → **0** | 60 → **0** | 18.7 → **0.3** | 0.241 → **0.053** |
| Gradient rotate (not fixed) | 240 → 240 | 60 → 60 | 18.4 → 17.7 | not comparable* |
| Scenery (untouched) | 0 → 0 | 1 → 1 | 1.0 → 1.1 | 0.132 → 0.142 |

\* The two gradient-rotate runs ran at different Firefox frame rates (222 and 73 fps), so their per-frame figures cannot be compared. Its cost is unchanged by design: this release only adds its double layer to the offscreen pause.

These are headless figures (Chromium and Firefox render in software): compare them before against after and against the empty page, not as what a real machine would show. The Firefox column times style, layout and display-list work only; rasterisation runs off the main thread and is not included. Measured with `node scripts/measure-motion.cjs --ab`. Not fixed: `.vitra-gradient-rotate` still repaints every frame while it is on screen; it is paused offscreen.

### Visible changes

Things an existing site will see differ after upgrading.

- **`.vitra-glass` now has its border.** The declaration was invalid before, so the border never rendered.
- **Stars** now show in `emerald` and on pages with no `data-theme` (every theme with a dark colour scheme has them). A `light` subtree inside a page with no `data-theme` also shows them; `data-theme=""` does not.
- **Light accent**: `--vitra-color-accent-l` 52% → 51% (`--vitra-color-accent-rgb` 44, 97, 221 → 40, 94, 220), the smallest change that takes the primary button from 4.45:1 to 4.64:1 and the active drawer link from 4.40:1 to about 4.55:1. Hue and saturation are unchanged, `auto` under a light system gets the same value, and no dark theme was retuned.
- **Control borders** (input, select, switch, checkbox, radio) use the new `--vitra-color-border-control`, which reaches 3:1 against the page. In dark, input and switch outlines go from a 10% white line to a 37% one.

  | Theme | `--vitra-color-border-control` |
  |---|---|
  | dark / default | `hsl(accent-h 20% 95% / 37%)` |
  | light | `hsl(222 25% 15% / 50%)` |
  | pastel | `hsl(330 25% 30% / 59%)` |
  | neon | `hsl(285 50% 70% / 56%)` |
  | ocean | `hsl(205 50% 70% / 50%)` |
  | emerald | `hsl(145 50% 60% / 49%)` |

  `--vitra-color-border` is unchanged and stays the quiet line of cards and panels. Placeholders use `--vitra-color-text-secondary` at full opacity, and the valid-input border is `color-mix(success 75%, text-primary)`.
- **Navbar links** use `--vitra-color-text-secondary` instead of `opacity: .7`; alert dismiss buttons use `text-secondary` instead of `text-tertiary`.
- **Radio and `.vitra-checkbox` are painted controls** (`appearance: none`, 18 px, accent fill when checked, mark in the inverse text colour) instead of the browser's native ones. Under `forced-colors: active` the native control comes back. A bare `<label><input type="checkbox">` without the class is still native.
- **The indeterminate progress ring is a spinning quarter arc** instead of a fill-and-reset.
- **Glass spinner and click ripple** follow `--vitra-color-text-primary` instead of a fixed white, so they are dark on light themes.
- **Tabs**: the separator under the row is an inset shadow instead of a border, and the row no longer wraps.
- **Spotlight**: before the first pointer move the glow sits at `50% 50%` instead of the top-left corner, and it follows a touch drag.
- **Toast**: the message is wrapped in `<span class="vitra-toast-text">` (followed by a close button when closable), so the toast's first child is no longer a bare text node.
- **`auto` theme** is identical to `light` under a light system and to `dark` under a dark one, scenery and modal included.
- **Control sizes**: `.vitra-burger` is 44 px square (the three lines stay 28 px wide), `.vitra-drawer-close` is 44 px (was 32), `.vitra-modal-close` is 44 px under `(pointer: coarse)` only.
- **Pages with no `data-theme`** declare `color-scheme: dark`.
- **Long text** in badge, checkbox, radio, spinner label, toggle label, alert, progress label and dropdown item wraps instead of overflowing; `overflow-wrap: anywhere` can break an unbroken string mid-word. A dropdown menu is at most `calc(100vw - 2 * var(--vitra-space-4))` wide (it had no maximum).
- **The burger draws its X under reduced motion** (`.vitra-burger.active`); before, the two outer lines stayed flat, so no X appeared.
- **`.vitra-tilt-card` renders real 3-D** (its `perspective()` now takes effect) and also tilts on `:focus-visible`.
- **A closed `.vitra-drawer` is `visibility: hidden`.** Author CSS that showed a closed drawer as a desktop sidebar must also set `visibility: visible`.
- **The CSS-only tooltip's `::before` is zero-width while hidden.** A rule of your own that revealed it without the `:hover` / `:focus-within` states now shows an empty box.
- **Border glow layer** is larger on wide hosts (see Performance), and an animated striped progress bar establishes a stacking context (`isolation: isolate`).

### Behaviour notes for integrators

- **JS and CSS ship together.** The tooltip's styles moved out of the script into `.vitra-tooltip-js`. New `vitra.js` with an old copy of the CSS produces an unstyled tooltip.
- **Drawer toggles call `preventDefault()`** on every click of an element that carries `data-vitra-drawer-toggle`, so a link or a submit button used as a toggle will not navigate or submit. A click outside an open drawer closes it one tick later, so a button of your own that calls `toggle()` or `open()` in its handler wins; that close leaves focus where the click put it.
- **One Esc closes one layer.** In 1.13.5 Esc on an open `.open` dropdown inside a modal closed the menu and the modal; now the first Esc closes the menu (or a showing tooltip) and the second the modal. A `[popover]` menu is still closed by the browser's light dismiss, so Esc on it closes only the menu, also inside a native `<dialog>` opened with `showModal()`.
- **The modal's and the drawer's Esc listeners moved from `document` to `window`** (bubble phase; the tooltip's is on `window`, capture phase). Two consequences: a `keydown` listener of yours on `document` that calls `stopPropagation()` now keeps Esc from reaching the modal or drawer; and a `keydown` listener of yours on `window` registered before the modal opened now runs before the modal's (while the modal is still open), so a `stopImmediatePropagation()` there blocks the close.
- **Malformed selectors warn instead of throwing.** `Vitra.modal.open('menu[1')`, `tooltip.show()`, `scenery.mount()`, `drawer.open()` / `toggle()` / `close()`, a particles `container` and a reveal `selector` that are not valid CSS now log `[Vitra <Module>] Invalid selector "…"` once and behave as "not found" (`false`, `null` or no-op). An id that starts with a digit has to be escaped (`#\31 nav`).
- **`toggle.click()` on a dropdown moves focus into the menu.** A programmatic click (`detail === 0`) is treated like a keyboard activation and focuses the first item. A real mouse click does not.
- **Modal trap scope.** The element passed to `modal.open()` is the trap root: Tab cycles through the focusable elements inside it, and the first one gets focus (else `.vitra-modal-content`, else the element itself). The module adds `role="dialog"` and `aria-modal="true"` to that element only when it has none, and removes only what it added. Opening a modal while another is open closes the first, as in 1.13.
- **Keyframes** `vitra-progress-bar-stripes` and `vitra-progress-ring-spin` now animate `transform`.
- **`package.json`**: `style` and `exports["."].style` point to `dist/vitra.min.css` (they pointed to the unminified `dist/vitra.css`); `main` and `exports["."].require` are `dist/vitra.cjs` (they were the IIFE `dist/vitra.js`); `exports` gains `types`, `./core.css`, `./scenery.css` and `./effects.css`. `./dist/*` still resolves every file.
- **`dist/vitra.js` and `dist/vitra.min.js`** are built from `src/vitra.iife.js` and keep `"use strict"`. They set `window.Vitra`; they no longer declare a bare global `Vitra` where there is no `window` (a worker, for example).
- **`Vitra.toast.init()` is public** and runs on load unless `"toast": false`. `toast.show()` still creates the container if `init()` never ran.
- **`motionGuard` does not watch the DOM.** An element added after init is not paused offscreen unless you call `Vitra.motionGuard.observe(el)`; the scenery and particle modules do it for the elements they create.
- **Pieces**: `Vitra.particles.spawn()` output and `.vitra-ripple` need the `effects` piece. With only `core`, spawned plain particles show as small static dots, emoji particles show nothing (the glyph is drawn by a rule in `effects`) and ripples are unstyled.
- **A stored theme wins.** `theme.init()` and the load-time flash prevention restore the saved theme before the `default` option or the `data-config` value applies.

### Sizes

Brotli, measured with `npx size-limit`; "1.13.5" is the `v1.13.5` tag, measured with the same method. Raw sizes are the files on disk.

| File | 1.13.5 | 1.14.0 | Limit | Raw 1.14.0 |
|---|---|---|---|---|
| `dist/vitra.min.css` (bundle) | 17.73 kB | 18.85 kB | 20 kB | 144,193 B |
| `dist/vitra.core.min.css` | | 13.04 kB | 13.5 kB | 102,472 B |
| `dist/vitra.scenery.min.css` | | 5.01 kB | 5.5 kB | 29,888 B |
| `dist/vitra.effects.min.css` | | 2.25 kB | 2.5 kB | 12,383 B |
| `dist/vitra.min.js` | 5.68 kB | 7.49 kB | 7.5 kB (was 6 kB) | 23,505 B |
| `dist/vitra.esm.js` | 8.04 kB | 10.03 kB | 10.6 kB | 44,145 B |
| `dist/vitra.cjs` | | 10.39 kB | 10.6 kB | 45,232 B |

The three pieces add up to 20.30 kB brotli because each is compressed on its own: loading all three costs about 1.5 kB more than the bundle. Use the pieces to leave something out, not to load everything.

**Why the JavaScript grew by 1.81 kB (+32%).** The budget was 6 kB and is now 7.5 kB, the ceiling the design set. The growth is the new drawer module, keyboard support in the dropdown, and the focus and ARIA fixes in modal, tooltip and toast (a shared focus-trap and scroll-lock helper, the tooltip's delegated listeners with touch, Esc and scroll handling, the toast live region and close button). The tooltip's inline styles moved to CSS, which is part of the CSS growth. The last fixes before release (one Esc per layer, guarded selectors, isolated auto-init) added about 0.17 kB, partly paid for by sharing the dropdown close path and the reveal hide/show steps. Accessibility behaviour was not cut to fit: the budget moved instead. About 0.01 kB of headroom remains, so a tabs module (see Open) does not fit.

### Security

- CI actions are pinned to commit SHAs instead of version tags, and a CI step fails the build when `dist/` differs from a fresh build.
- Development dependencies updated for three advisories (vite, undici); `npm audit` reports none. The distributed files have no dependencies, so users were not affected.
- `package.json` `homepage` pointed to a domain that does not resolve; it now points to the project site. `SECURITY.md` and `CONTRIBUTING.md` linked to a repository that does not exist; they now link to `DesvoSoft/Vitra`.
- The CDN snippets in the README and the integration guide carry SRI hashes. The guide no longer says the package is on the npm registry: it is not, and a registry package named `vitra-css` is not this project.

### Known limitations

- **Tabs** have static ARIA markup and no keyboard module (see Open). The tab row hides its scrollbar, so a mouse with a plain wheel cannot scroll it sideways (touch, trackpad and Shift + wheel can).
- **Tooltip**: a second tap on a target whose tooltip is already open flickers it (hide, then show); a tooltip target nested inside another is not handled; its `max-width: calc(100vw - 16px)` ignores a classic scrollbar; the CSS-only tooltip can widen the page while it is visible when its trigger is near the right edge.
- **Drawer**: if the drawer is closed through the API while a modal opened from it is still open, focus is lost; a deferred outside-click close can take focus from a modal that a script opened in the same click without the `.vitra-modal-open` class; a drawer's original `aria-hidden="false"` is restored as `"true"`; the module holds references to the drawers it manages until `destroy()`. The drawer slides in from the right only.
- **Dropdown**: Esc is ignored while Alt, Ctrl or Meta is held; Tab from a text field inside the menu leaves the menu open; Home and End are swallowed on the toggle while the menu is open. The 400 ms guard that keeps a Tab-closed menu unreachable while it fades out was not checked against every closing transition.
- **Reveal**: calling `reveal.init()` after the first paint makes directional elements that are already visible blink (they drop to `opacity: 0` and fade in again once the observer reports them). With `data-config` auto-init (`"reveal": true`) init runs on `DOMContentLoaded` and this does not normally happen.
- **Inputs**: `opacity: 1` on the placeholder also applies to disabled inputs.
- **Two copies of Vitra on one page** (the script tag and an ES import) both register their listeners; there is no guard. This predates 1.14. With drawers and modals it is worse in 1.14: the two copies keep two independent scroll-lock counters, so the page can stay unscrollable after everything is closed.
- **TypeScript**: `export as namespace Vitra` makes `Vitra.default` visible on the global namespace in the types; at runtime `window.Vitra.default` is undefined.
- **`dist/vitra.cjs` is not in `SRI.txt`**; the list is explicit and covers the files a page loads.
- **Pieces**: each one starts with the full `@layer` statement, which is what keeps the order stable when they load in a different order from the bundle's; do not strip it.

### Open

Not fixed in 1.14, and why.

- **`.vitra-gradient-rotate` still repaints every frame** while it is on screen (240 paints/s and 60 style recalcs/s in Chromium; still well above the empty page's main-thread time per frame in Firefox). It animates a registered custom property, and its continuous look was an explicit choice in 1.13.5. It is only paused offscreen. Rotating it with `transform`, as `.vitra-border-glow` now does, is the follow-up.
- **`Vitra.tabs` keyboard module** (roles, roving tabindex, arrow keys, Home/End) was dropped for size: about 0.01 kB of headroom under the 7.5 kB ceiling cannot hold it. It is on the roadmap.
- **The drawer, dropdown and tooltip edge cases** listed under Known limitations.
- **`Vitra.theme` is still a plain object**, so its `_`-prefixed members (`_transition`, `_persist`, `_reveal`, `_getSystemTheme`) are enumerable on it; `_transition` and `_persist` are new in 1.14.
- `tests/browser/known-failures.js` is empty: no test is expected to fail.

### Not verified

- **Safari and WebKit** were not tested at all, desktop or iOS. Safari 17 still needs `-webkit-backdrop-filter` (kept); the Safari support in the README table is from compatibility data, not observation.
- **Touch** was checked with an emulated coarse pointer in desktop Chromium and Firefox, not on a real device.
- **Screen readers** were not run. Roles, names and states are checked by axe-core and by assertions on attributes.
- **Performance figures are headless and relative** (software rendering). GPU time, Firefox's compositor and real hardware were not measured; the border glow's larger layer and the noise overlay's full-screen blend have a GPU cost that was not quantified.
- **Contrast** is measured with the component on a plain `--vitra-color-bg` page. Over the scenery or over arbitrary content nothing is claimed.
- **Forced colors** was checked by emulation in both engines.
- **The CI check that `dist/` matches a fresh build** was run locally on Windows (clean `git status` after `npm run build`, also with CRLF JavaScript sources), not yet on the GitHub ubuntu and windows runners.

## [1.13.5] - 2026-10-13

The rest of the stepped loops, judged the same way as the mountains in 1.13.4: each effect on its own in a real Brave 155 and Firefox 158 window (240 Hz display), comparing consecutive screen captures. "Jump" is the largest change of any pixel between two pictures, out of 255.

| Effect | Stepped (1.13.4) | Now |
|---|---|---|
| Moon glow | 5 updates/s, jump 3 (Chromium) / 15-18 (Firefox) | continuous, typical jump 1-2 (Firefox shows an occasional larger one) |
| Conic borders (`.vitra-gradient-rotate`, `-double`) | 30 pictures/s (15 for `-slow`), jump 5-10 | continuous, typical jump 2-3 |
| Gradient text | 10 updates/s, jump 8 | continuous, typical jump 1-2 |
| Mesh gradient | 10 updates/s, jump 3-5 across the whole surface | continuous, jump 2 in Firefox; 3-4 in Chromium, where it is now fine per-frame grain from resampling the gradient instead of the whole surface shifting at once |
| Glow orbs, aurora | 10-20 updates/s, jump 1-2 | unchanged: still stepped |

### Fixed

- **Moon glow, conic borders, gradient text and the mesh gradient interpolate continuously again**, with the easings they had before 1.13.1 (`ease-in-out`; `linear` for the borders). Their steps were visible: a ring with a hard edge jumping five times a second, a sweep of light at 30 pictures a second, a surface-wide flicker at 10 Hz.
- Glow orbs and aurora stay stepped: no pixel changes by more than 2/255 a step, so there is nothing to see and the saving is real.

### Cost

Headless Chromium, software rendering at 240 fps (the worst case), each effect alone on a page: GPU-process time goes from 28-50 ms/s to 120-205 ms/s, main-thread time by about 10 ms/s. Frame pacing is unchanged in headless Chromium and in Firefox. In a real Brave window any continuously animated page, a bare 40px moving square included, runs at 220-232 fps with an occasional 12-35 ms frame against 239.9 for a still page; these effects add nothing beyond that.

### Not fixed

- `.vitra-shape-morph` does not morph, stepped or not: its keyframes are polygons with different numbers of points (and a circle), which cannot be interpolated, so the shape flips every 2.4s.

## [1.13.4] - 2026-10-13

The mountains glide. Since 1.13.1 the scenery's drift was stepped one device pixel at a time to spare the compositor a draw per display frame; on screen that was a range ticking 3 times a second (far) and 10 times a second (mid), plainly visible on a crisp silhouette. Measured by capturing a real window on a 240 Hz display and comparing consecutive frames of the far range:

| | 1.13.3 | 1.13.4 |
|---|---|---|
| Chromium (Brave 155): frames showing a new position | 3 a second, 1px each | **every captured frame**, even advance (8% variation) |
| Firefox 158: updates a second | 3, each a 1px jump (edge pixels change by 62/255) | **~40**, each a fraction of a pixel (5-9/255) |
| Frame pacing, full scene, both engines | 239 fps | 239 fps |

### Fixed

- **Scenery drift is continuous again** (`linear` instead of `steps()`) for both ranges and the clouds. Every drifting element is an unmasked carrier since 1.13.3, so the per-frame draw is a plain composite of cached layers. Cost, measured in headless Chromium (software rendering, the worst case): GPU-process time for the scene goes up three to four times (0.23-0.33s to 0.72-1.3s per 6s of animation at 240 fps, over two runs); frame pacing is unchanged in both engines.
- **Firefox no longer moves the ranges a whole pixel at a time.** WebRender snaps a layer whose transform is a pure translation to whole device pixels, so a continuous drift alone still ticked there. The drift keyframes now end in `skewX(0.3deg)` (anchored bottom-left): a transform that is not axis-aligned is drawn at its sub-pixel position. The lean is 2-3px over the height of a range and not visible; travel stays exactly horizontal and the loop stays seamless.

### Removed

- `--vitra-scenery-steps` and `--vitra-scenery-cloud-steps` (added in 1.13.2), and the measuring `Vitra.scenery` did to set them (a `ResizeObserver` per scene). Nothing to tune any more; setting them is harmless and does nothing.

## [1.13.3] - 2026-10-05

Firefox pass. The scenery was smooth in Chromium and badly janky in Firefox; measured in headless Firefox 157 by frame pacing (`requestAnimationFrame` intervals over 4s, an empty page reads 240fps):

| | 1.13.2 | 1.13.3 |
|---|---|---|
| Hero at rest | 20–37 fps, 35–43 frames over 25 ms | **233–237 fps, 2** |
| Hero during its entrance | 16 fps | **135–230 fps** |
| Demo page, hero | 12–35 fps (tab sometimes died) | **233 fps** |

The cause was not the stepping (1.13.2 guessed wrong): Firefox re-rasterizes an element's SVG backgrounds and masks whenever *that element* animates, on the main thread, about 100 ms a time. Animating a wrapper that merely contains such an element is free in every engine. Chromium is unchanged: 0 repaints, 0 style recalcs, 15–20 compositor draws/s at rest.

### Changed

- **Star twinkle is an opacity shimmer on the (unmasked) star wrapper**, five steps a second; the star plane itself is static. The per-star noise-mask "scintillation" of 1.13.0–1.13.2 animated the very elements that paint the star tiles. The far star plane is now steady and no longer drifts — it is the constant the near field twinkles against, and point-sized stars creeping a pixel at a time were the most visible stepping artefact.
- **Entrance is one fade on the scenery root** instead of seven layer-by-layer animations (ranges rising, moon climbing, wisps and mist fading up). `--vitra-scenery-intro` still scales its length; `0` disables it.
- `--vitra-scenery-star-steps` is gone (nothing uses it).

### Fixed

- A second opacity animation on the star wrapper (entrance + twinkle) put both on the main thread in Chromium — caught before release; the wrapper carries exactly one.

## [1.13.2] - 2026-10-05

### Fixed

- **Uneven scenery drift in Firefox**: the stepped drift moved a fixed number of steps per loop (1600), so one step was `width / 1600` pixels — 0.8px on a 1280px-wide scene. Chromium draws layers at fractional offsets and it read as smooth; in Firefox the ridge advanced a pixel every ~100ms and then stalled for ~200ms every fourth or fifth step (measured on a ridge edge in headless Firefox 157). Step counts are now the distance travelled in device pixels, so every step is exactly one pixel: `Vitra.scenery` measures each scene (ridge travel, cloud travel, star tile, times `devicePixelRatio`), sets `--vitra-scenery-steps`, `--vitra-scenery-cloud-steps` and `--vitra-scenery-star-steps` on it, and keeps them current with a `ResizeObserver`. Hand-written scenes are tuned too. Without JavaScript the stylesheet defaults fit a ~1600px-wide scene (800px in portrait).

## [1.13.1] - 2026-10-05

GPU pass. 1.13.0 took the scenery off the main thread but left the compositor redrawing the whole viewport on every display frame: any continuously interpolated animation does that, however slowly the layer moves (measured ~96 draws/s for a ridge creeping at 3 px/s; the mist sway alone, 191). Counted from compositor `DrawFrame` trace events in headless Chromium: **screen redraws at rest ~96/s → 10/s** for both scenery variants, and ≤ 10/s on every section of the demo page (was 120–240).

### Changed

- **All ambient loops are stepped on a shared 10 Hz clock**: scenery drift (far/mid ridges, clouds, far stars), star scintillation (14s → 12.8s so it lands on the grid), corona breathing, and in the motion layer the mesh gradient, glow orbs, aurora and gradient text. Layers change together about ten times a second; at these speeds a step is a pixel or less.
- **Near scenery layer stands still and the conifer line is gone**: a foreground racing past at one viewport-width every 32s was the fastest-changing layer on screen and the one that reads as "the room is moving". It is now a dark, still foreground rise that grounds the scene; it still takes part in the entrance and in scroll depth. `.vitra-scenery-ridge-near` markup is unchanged.
- **Valley mist is static again**: its sway put a scene-wide translucent layer in continuous motion for a movement nobody could see.
- **Shooting star is a streak-sized layer** placed with container units (both scenery roots are now size containers) instead of a scene-sized transparent box.
- **`.vitra-shape-morph` and `.vitra-gradient-rotate` are stepped** (20 and 30 updates/s): they can only animate by repainting, and were doing so once per display frame.
- **`Vitra.motionGuard` also covers `.vitra-border-glow`, `.vitra-shape-morph` and `.vitra-gradient-rotate`.**

### Fixed

- `scripts/gen-ridges.cjs`: the path-compacting regex had lost its escapes and never matched; ridge masks are now emitted as relative segments (~6 KB less CSS together with the removed treeline).

## [1.13.0] - 2026-10-05

Performance and motion pass on the scenery system. Measured in headless Chromium over CDP on an otherwise idle page (1600x900, dark theme): **paints 210/s → 0**, **style recalcs 81/s → ~1**, **main-thread time 137 ms/s → 3 ms/s**; with 4x CPU throttling the demo hero went from 677 ms/s of main-thread work at rest to compositor-only scenery. `vitra.min.css` 180 KB → 142 KB (20.4 kB → 19.7 kB brotli) with the new ridge artwork included.

### Added

- **`Vitra.scenery` module** (`init()`, `mount()`, `destroy()`): an empty `.vitra-scenery` / `.vitra-scenery-inline` element is filled with the eight layers and `aria-hidden="true"` on init, so the markup is one line. `data-vitra-moon="crescent"` picks the moon phase. Roots that already contain layers are never touched; opt out with `"scenery": false` in `data-config`. Hand-written, JS-free markup works exactly as before.
- **Entrance choreography**: the scene assembles on load — ranges rise back-to-front on one shared deceleration curve, the moon climbs to its mark, stars/wisps/mist fade up. Runs on `translate`/`opacity`, layered over the `transform` drift loops. New token `--vitra-scenery-intro` (length multiplier; `0` disables).
- **Scroll depth for `.vitra-scenery-inline`**: CSS scroll-driven parallax (named view timeline + `cqh` offsets) — as the host scrolls away the sky and moon lag most, the near treeline least. No scroll listener, compositor-driven, skipped entirely where scroll-driven animations are unsupported. New token `--vitra-scenery-depth`. Requires a host that is not `overflow: hidden` (use `overflow: clip`).
- **Living valley mist**: the mist layer now sways slowly against the direction the ridges travel.
- **Spring easing tokens**: `--vitra-ease-spring`, `--vitra-ease-spring-soft` and `--vitra-duration-spring`. Sampled damped springs via `linear()` where supported, back-out `cubic-bezier` elsewhere. Modal, toast, drawer and dropdown now spring *in* and still ease *out* — the spring lives on the open state only.
- **Animated theme changes**: `Vitra.theme.set(name, { transition: true, origin })` (or `theme.init({ transition: true })`) swaps the theme inside a View Transition — the new theme grows as a circle out of the pressed control. `origin` takes a pointer event, an element or `{ x, y }`. Opt-in; instant swap where the API is missing or under `prefers-reduced-motion`.
- **`scripts/gen-ridges.cjs`**: the generator behind the new ridge artwork (art-directed control points + seeded midpoint displacement), so the ranges can be reshaped or re-rolled instead of hand-editing path data.

### Changed

- **Mountains redrawn**: the three ridge masks were smooth bezier swells that read as hills. They are now faceted ranges — straight-segment crests with real summits, shoulders and cols — with a second mask per range painting the light-facing planes (the warm rim now only catches the lit side of each crest), and the near layer is a conifer line growing in stands with gaps rather than a flat band. Drift speeds and colour tokens are unchanged.
- **Portrait screens**: a ridge tile now spans two viewport-widths below a 4:5 aspect ratio (drift duration doubled to hold on-screen speed), so ranges drawn for 16:9 are no longer squeezed into needles on phones.
- **Valley mist no longer ends in a hard line**: its pools are centred inside their box instead of anchored to its bottom edge.
- **`.vitra-drawer` slides on `transform`** instead of animating `right` (layout on every frame); `right` only parks the closed panel.
- **`.vitra-skeleton` shimmer is a transform-swept `::after`** instead of an animated `background-position`. The element is now `position: relative; overflow: hidden`.
- **Star twinkle rebuilt as compositor-only "scintillation"**: the star tiles are now static and a seamless turbulence-noise mask slides across them while the star plane counter-slides, so every star flickers on its own schedule with two `transform` animations and zero repaints. The previous per-star SMIL `<animate>` tags inside the background SVGs re-rasterized all three tiles on every frame. The discrete "flare" bloom is gone; brightness now varies continuously.
- **Moon glow breathes, the disc does not**: the wide glow moved to a `::after` corona that pulses in scale/opacity; previously the whole moon faded to 75% opacity and back.
- **Star tiles re-encoded**: dots are batched into one round-capped `<path>` per radius/opacity bucket instead of one `<circle>` each, and the duplicated reduced-motion tile copies are gone (there is no SMIL left to strip) — ~54 KB less CSS.
- **`.vitra-gradient-bg` mesh pans via `transform`** on a `::before` layer instead of animating `background-position` on the element (never compositor-accelerated: a style recalc and full-surface repaint every frame). Same path, same timing.
- **`Vitra.spotlight` only measures the hovered element**: resolved from the event target instead of `querySelectorAll` + `getBoundingClientRect()` on every `.vitra-spotlight` per frame.
- **`Vitra.motionGuard` also covers `.vitra-gradient-bg`, `.vitra-gradient-text` and `.vitra-aurora-layer`.** Gradient text has to repaint glyphs to animate, so it is now only animated while visible.
- **Shooting star is transform-only**: entry point, angle, length and travel live in one transform list. It used to animate `top`/`left`/`width`, which kept a main-thread animation ticking for the whole 34s cycle. The bright head now leads the streak.
- `size-limit` budgets: CSS 20 kB brotli (was 16 kB, and had been failing at 20.4 kB), ESM 8.5 kB.

### Accessibility

Checked with axe-core 4.10 (WCAG 2.2 AA) across every theme.

- **Status badges legible in light themes**: `.vitra-badge-success/-warning/-error/-info` used the theme's inverse text colour, which is white on light themes — 2.6:1 on success, 3.6:1 on info. They now use a fixed dark ink, new token `--vitra-color-on-status` (≥ 5:1 on all four fills, every theme).
- **Pastel accent deepened** (`--vitra-color-accent-l` 55% → 44%): primary badges/buttons sat at 3.9:1 and ghost-button text at 3.3:1.

### Fixed

- **Offscreen pause never reached pseudo-elements**: `.vitra-motion-paused *` does not match `::before`/`::after` and `animation-play-state` is not inherited, so the far star tile and the shooting star kept animating offscreen.
- **Moon cutout in the star mask was off-centre**: it was anchored to the halo's top-left corner in the wrong coordinate space; it now tracks the disc's centre for any `--vitra-scenery-halo-*` values.
- **README scenery markup was missing the `stars` and `clouds` layers**; version strings and module list brought up to date.
- `package.json` `repository`/`bugs` URLs pointed at a repository that does not exist.
- Stylelint errors in `09-scenery.css` (vendor-prefixed mask properties dropped; unprefixed `mask-*` covers Safari 15.4+).

## [1.12.1] - 2026-07-23

### Fixed

- **Twinkling star glow replaced**: the previous bloom (three flat-opacity concentric circles per twinkling star) read as visible hard-edged rings instead of a soft glow. Replaced with a single circle filled via an SVG `radialGradient` (smooth continuous falloff, no filter — `<circle filter="url(#id)">` inside a `data:` URI background-image silently drops the entire image in Chromium, confirmed via isolated repro) for a genuinely soft, ring-free bloom at twinkle peak.
- **Primary star field drift slowed**: `.vitra-scenery-stars` background-position drift duration increased 1100s → 2600s to read as a subtle ambient creep rather than perceptible motion; travel distance kept at exactly one tile width per layer so the loop stays seamless.
- **Star field extended toward the horizon**: `.vitra-scenery-stars` and `.vitra-scenery-sky::before` height 58% → 68%, so more stars populate the band just above the ridge/mountain line.

## [1.12.0] - 2026-07-23

### Added

- **`Vitra.motionGuard` module**: pauses ambient looping animations (`.vitra-glow-orb`, `.vitra-aurora-bg`, `.vitra-aurora-layer-1/2`, `.vitra-scenery`, `.vitra-scenery-inline`) via a shared `IntersectionObserver` while their container is scrolled offscreen, resuming on re-entry. Auto-initializes like the other always-on modules (opt out with `motionGuard: false` in `data-config`), skips entirely under `prefers-reduced-motion`. Long-running blur/transform loops no longer keep compositing every frame for sections the user has scrolled past.
- **`.vitra-cv-auto` utility** (`src/07-utilities.css`): opt-in `content-visibility: auto` + `contain-intrinsic-size: auto 500px` for long, repeating page content (sections, card grids, list items) where skipping offscreen layout/paint work pays off. Not meant for content already gated by `display:none` (tab panels, modal bodies) — nothing left to skip there.
- **Second twinkling star layer**: `.vitra-scenery-stars` (the primary star field) previously had zero shimmer — only the secondary drifting tile (`.vitra-scenery-sky::before`) twinkled, so most visible stars sat static and the sky read like a photo. New `vitra-scenery-stars-twinkle-b` keyframe (17s, different amplitude/phase from the existing 13s cycle) shimmers the primary field independently, so the two layers never pulse in lockstep.

### Changed

- **Scenery ridge parallax contrast widened**: far/mid/near drift periods moved from 340s/150s/45s (≈7.6:3.3:1) to 480s/160s/32s (≈15:5:1) — the previous ratio read as two speed tiers instead of three distinct depth planes. Far ridge now drifts more slowly (distant, majestic), near treeline noticeably faster (foreground rush), for a stronger sense of depth without touching any ridge silhouette shape.
- **Glow-orb/aurora blur radius trimmed**: `.vitra-glow-orb` 80px→40px, `.vitra-aurora-bg` pseudo-elements 100px→50px, `.vitra-aurora-layer` 120px→60px. Each source is already a `radial-gradient(..., transparent 70%)`, so the blur only needs to soften the remaining edge, not carry all the softness itself — visual result is close to identical at a fraction of the per-frame raster cost.
- **Scroll-reveal fast-scroll handling**: `Vitra.reveal` now tracks scroll velocity and zeroes its batch stagger delay above a ~2.5px/ms threshold, so flinging/fast-scrolling past a run of reveal-on-scroll sections doesn't queue up a visible cascade of elements fading in behind the user after they've already moved on.

### Docs

- Added a "Runtime Rendering Performance" section to `docs/integration.md`: blur-stacking caution, avoid animating `box-shadow` directly, `.vitra-glass::after` specular-highlight cost at scale, `.vitra-cv-auto` usage, and `contain: layout style` for large repeated structures.

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
