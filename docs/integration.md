# Integration Guide - Vitra CSS Framework

Complete guide to integrating Vitra CSS Framework into your projects: CSS pieces, data attributes, the JS module API and imports by name.

## Overview

Vitra provides multiple integration paths depending on your project needs:

| Method | Best For | Features |
|---------|----------|----------|
| **HTML Link** | Quick start, static sites | CSS + optional JS |
| **CSS pieces** | Pages that need only part of the CSS | `core`, `scenery`, `effects` loaded separately |
| **CSS @import** | Existing CSS workflows | Cascade layers, tokens |
| **Build Tools** | Production apps, SPAs | Minification, ES module with named exports |
| **data-config** | Declarative setup | Zero-JS configuration |
| **JS Module API** | Dynamic apps, SPAs | Full programmatic control |

---

## Method 1: HTML Link (Quick Start)

### Step 1: Include the CSS

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Vitra CSS -->
  <link rel="stylesheet" href="path/to/vitra.min.css">
  
  <title>My Vitra Project</title>
</head>
<body>
  <!-- Your content -->
</body>
</html>
```

### Step 2: (Optional) Include the JS

```html
<!-- At the end of <body> -->
<script src="path/to/vitra.min.js"></script>
<script>
  // Initialize theme with auto-detect
  Vitra.theme.init({ defaultTheme: 'auto' });
  
  // Initialize reveal animations
  Vitra.reveal.init();
</script>
```

Load the JS and the CSS from the same release: the tooltip's styles live in the CSS (`.vitra-tooltip-js`), so a newer script with an older stylesheet shows an unstyled tooltip.

### Step 3: Start Using Classes

```html
<body data-theme="dark">
  <div class="vitra-container">
    <div class="vitra-card vitra-card-glass">
      <h2 class="vitra-card-title">Hello Vitra</h2>
      <p class="vitra-card-body">This is a glass card.</p>
      <button class="vitra-btn vitra-btn-glass">Click Me</button>
    </div>
  </div>
</body>
```

---

## CSS Pieces (Load Only What You Use)

`vitra.min.css` is the whole framework. The same rules are also built as three pieces, so a page that has no scenery and no shader effects can leave them out:

| Piece | File | Contains | Brotli |
|-------|------|----------|--------|
| `core` | `dist/vitra.core.min.css` | tokens, themes, glass, motion (keyframes, reveal classes, cinematic effects such as glow orbs, aurora, mesh gradient, gradient text, border glow), layout, components, utilities | 13.0 kB |
| `scenery` | `dist/vitra.scenery.min.css` | the `.vitra-scenery` / `.vitra-scenery-inline` mountain landscape and its layers | 5.0 kB |
| `effects` | `dist/vitra.effects.min.css` | particles (`.vitra-particle*`), noise overlays, shape morph, progress rings, gradient-rotate borders, click ripple (`.vitra-ripple`), CSS scroll reveal (`.vitra-scroll-reveal*`) | 2.3 kB |

```html
<link rel="stylesheet" href="dist/vitra.core.min.css">
<link rel="stylesheet" href="dist/vitra.scenery.min.css">  <!-- only if you use .vitra-scenery -->
<link rel="stylesheet" href="dist/vitra.effects.min.css">  <!-- only if you use particles or shader effects -->
```

- `scenery` and `effects` need `core`: the tokens and themes they read are defined there.
- Load order between the pieces does not matter. Each file starts with the same `@layer` statement, which fixes the layer order whichever file the browser sees first. Do not strip that line.
- `core + scenery + effects` gives the same computed styles as `vitra.min.css` (a browser test compares a sample of elements in dark and light, in three load orders).
- Without `effects`, particles that `Vitra.particles.spawn()` creates appear as small static dots (the JS sets their size and colour inline, the animation lives in the CSS), and `.vitra-ripple` has no ripple styling. Without `scenery`, `.vitra-scenery` roots take no space and draw nothing.
- Each piece is compressed on its own, so the three together weigh more than the bundle (20.3 kB against 18.9 kB brotli). Use the pieces to leave one out, not to load all three.
- Installed from npm or git: `vitra-css/core.css`, `vitra-css/scenery.css`, `vitra-css/effects.css` (see `exports` in `package.json`).

---

## Method 2: CSS @import

Import Vitra into your existing CSS workflow:

```css
/* Your main.css */
@import url('path/to/vitra.css');

/* Your custom styles */
.my-component {
  /* Use Vitra tokens */
  background: var(--vitra-color-surface);
  border-radius: var(--vitra-radius-md);
  padding: var(--vitra-space-3);
}
```

**Note:** `@import` can impact performance. For production, consider concatenating with your build tool.

---

## Method 3: Build Tools (Recommended for Production)

Vitra is built with `lightningcss` (CSS) and `esbuild` (JS). From a clone of the repository:

```bash
npm install
npm run build
```

| Output | Files |
|--------|-------|
| CSS bundle | `dist/vitra.css`, `dist/vitra.min.css` |
| CSS pieces | `dist/vitra.{core,scenery,effects}.css` and `.min.css` |
| JS for a script tag | `dist/vitra.js`, `dist/vitra.min.js` (sets `window.Vitra`) |
| JS for bundlers | `dist/vitra.esm.js` (named exports and default), `dist/vitra.cjs` |
| Types | `dist/vitra.d.ts` (copied from `src/vitra.d.ts`) |
| Integrity | `dist/SRI.txt` (sha256 of the minified files and pieces) |

Link the minified files, or import the module from your own bundler:

```html
<link rel="stylesheet" href="dist/vitra.min.css">
<script src="dist/vitra.min.js" defer></script>
```

```javascript
import Vitra, { theme, drawer } from './dist/vitra.esm.js';
```

---

## data-config Attribute (Declarative Configuration)

Vitra supports declarative configuration via the `data-config` attribute. No JavaScript code required!

Only the first element in the document that carries `data-config` is read. The default-on modules start even when there is no `data-config` at all: the attribute is for tuning and opting out.

### Basic Usage

```html
<!-- Configure Vitra with JSON in data-config -->
<div data-config='{
  "theme": { "default": "auto" },
  "particles": { "count": 10, "color": "#6c63ff" },
  "reveal": { "threshold": 0.1, "stagger": 100 }
}'>
  <!-- Your content -->
</div>
```

### Configuration Options

```javascript
{
  "theme": "neon",             // Shorthand for { "default": "neon" }
  // or the object form:
  "theme": {
    "default": "auto",         // Fallback theme ("defaultTheme" is accepted as well)
    "persist": true,           // Save to localStorage
    "transition": false        // Animate later theme changes (View Transition circular reveal)
  },
  "particles": {
    "count": 10,              // Number of particles
    "color": "#6c63ff",      // Particle color
    "size": 4,                // Particle size (px)
    "emoji": null              // Or emoji string like "✨"
  },
  "reveal": {
    "selector": ".vitra-reveal",  // Element selector
    "threshold": 0.1,            // Visibility threshold
    "stagger": 100,              // Stagger delay (ms)
    "scrollReveal": false        // Also watch .vitra-scroll-reveal* elements
  },
  "ripple": true,              // Click ripple (true by default)
  "toast": true,               // Create the toast live region on load (true by default)
  "tooltip": true,             // Initialize tooltips (true by default)
  "drawer": true,              // Drawer toggles, Esc, focus trap (true by default)
  "dropdown": true,            // Dropdown click/keyboard handling (true by default)
  "spotlight": true,           // Pointer-follow glow on .vitra-spotlight (true by default)
  "scenery": true,             // Fill empty .vitra-scenery roots with their layers (true by default)
  "motionGuard": true          // Pause ambient animations while offscreen (true by default)
}
```

Set a default-on key to `false` to skip that module (for example `"drawer": false`). `theme`, `particles` and `reveal` run only when their key is present. There is no `tabs` key: tabs are CSS plus markup (see *Tabs* below).

`theme.init()` restores the theme the visitor saved before it applies the `default`, so the default only matters on a first visit (or with `"persist": false`).

### data-config with Theme Only

```html
<!-- Just initialize theme with auto-detect -->
<div data-config='{"theme": {"default": "auto"}}'>
  <!-- Page content -->
</div>

<!-- Or the string form -->
<div data-config='{"theme": "neon"}'>
  <!-- Page content -->
</div>
```

### data-config with Particles

```html
<!-- Initialize particles on a container -->
<div data-vitra-particles="20" 
     data-vitra-particle-color="#ff6b6b"
     data-config='{"particles": {"count": 20}}'>
  <!-- Particles will appear here -->
</div>
```

**Note:** `data-config` is processed automatically when the DOM is ready. No need to call `Vitra.init()`.

---

## JS Module API (Programmatic Control)

### ES Module Import

```javascript
// Default export: the whole API
import Vitra from './path/to/vitra.esm.js';

Vitra.theme.set('dark');
Vitra.particles.spawn(10);

// Or by name
import { theme, particles, drawer } from './path/to/vitra.esm.js';
```

`require('./path/to/vitra.cjs')` returns the same named exports plus `default`. Importing in Node without a DOM does not throw.

### Global Script Tag

```html
<script src="vitra.min.js"></script>
<script>
  // Vitra is available as window.Vitra
  const { theme, particles, reveal, modal, drawer, tooltip } = window.Vitra;
  
  theme.init({ defaultTheme: 'auto' });
</script>
```

---

## Module Reference

The modules are `theme`, `particles`, `reveal`, `ripple`, `modal`, `drawer`, `tooltip`, `toast`, `dropdown`, `spotlight`, `scenery` and `motionGuard`, plus `destroyAll()`.

### Theme Module

```javascript
import { theme } from './vitra.esm.js';

// Get current theme
const current = theme.get(); // 'dark', 'light', etc.

// Set theme
theme.set('neon');

// Toggle between light and dark (any other theme goes to light)
theme.toggle();

// Animated swap growing out of the pressed control
button.addEventListener('click', (event) => {
  theme.toggle({ transition: true, origin: event });
});

// Initialize with options
theme.init({
  default: 'auto',      // or defaultTheme: 'auto'
  persist: true,
  transition: false
});

// Get effective theme (resolves 'auto')
const effective = theme.getEffective();

// Clear stored preference
theme.clear();

// List valid themes
const themes = theme.getValidThemes();
```

`theme.set()` is safe to call from a script in `<head>`: until `<body>` exists the screen-reader announcement is skipped, not the theme change. `get`, `set`, `toggle` and `init` can be destructured (`const { toggle } = Vitra.theme`); `getEffective()` has to be called as a method. `init({ persist: false })` is remembered, so later `set()` calls do not write to `localStorage` either.

### Particles Module

```javascript
import { particles } from './vitra.esm.js';

// Spawn particles
const spawned = particles.spawn(10, {
  color: 'var(--vitra-color-accent)',
  size: 4,
  emoji: null,        // Or '✨' for emoji particles
  container: 'body',  // CSS selector or element
  direction: null     // Opt-in: 'down', 'down-left', 'down-right', or a degree angle (number)
});

// direction omitted/null: unchanged symmetric bob (vitra-particle-float)
// direction set: particles fall/drift toward that angle and fade out (vitra-particle-drift)
particles.spawn(15, { direction: 'down' });
particles.spawn(15, { direction: 45 }); // custom angle in degrees

// Destroy particles
particles.destroy(5);  // Destroy 5, or all if no argument
particles.destroy();    // Destroy all

// Check limits
const limits = particles.limits();
console.log(`Active: ${limits.active}, Available: ${limits.available}`);

// Initialize from data attributes
particles.init();
```

The limit is 40 on desktop and 15 at 768 px or narrower. Nodes that were removed from the DOM by someone else are dropped before the limit is computed. Particle styling and animation come from the `effects` piece (see *CSS Pieces*).

### Reveal Module

```javascript
import { reveal } from './vitra.esm.js';

// Initialize scroll reveal
reveal.init({
  selector: '.vitra-reveal',   // CSS selector
  threshold: 0.1,               // Visibility threshold (0-1)
  stagger: 100,                 // Delay between elements (ms)
  scrollReveal: false           // Also observe .vitra-scroll-reveal* elements
});

// Count revealed elements
const count = reveal.count();

// Reset all (for re-triggering)
reveal.reset();

// Disconnect the observer; elements still waiting are shown
reveal.destroy();
```

Calling `init()` again replaces the previous observer. Without JS (`@media (scripting: none)`) `.vitra-reveal` content is simply visible.

### Modal Module

```javascript
import { modal } from './vitra.esm.js';

// Open modal (a selector, a bare id such as 'my-modal', or the element)
modal.open('#my-modal', {
  closeOnOverlay: true,  // Close when clicking overlay
  closeOnEsc: true        // Close on Escape key
});

// Close modal
modal.close();
```

```html
<div id="my-modal" class="vitra-modal-overlay" aria-hidden="true"
     role="dialog" aria-modal="true" aria-labelledby="my-modal-title">
  <div class="vitra-modal-content">
    <div class="vitra-modal-header">
      <h2 id="my-modal-title">Modal Title</h2>
      <button class="vitra-modal-close" data-vitra-modal-close aria-label="Close">&times;</button>
    </div>
    <div class="vitra-modal-body">
      Modal content here
    </div>
    <div class="vitra-modal-footer">
      <button class="vitra-btn" data-vitra-modal-close>Close</button>
    </div>
  </div>
</div>
```

What `open()` does:

- **Trap scope.** The element you pass to `open()` (the overlay above) is the trap root: Tab and Shift+Tab cycle through its visible, enabled focusable elements, recomputed on every key press. The first one gets focus; if there is none, `.vitra-modal-content` does (it is given `tabindex="-1"` while open), and failing that the element itself. The trap listens on `document`, so it still works if focus fell to `<body>`.
- **Roles.** `role="dialog"` and `aria-modal="true"` are added to that element only when it has none, and removed again on close. Attributes you wrote are kept. Put `aria-labelledby` or `aria-label` on the same element.
- **One at a time.** Opening a modal while another is open closes the first.
- **Scroll lock.** The body gets `overflow: hidden`, with `padding-right` compensating the scrollbar width; your own inline values are restored on close. The lock is reference-counted, so it stays on while a drawer is also open.
- **Close.** Esc, a click on the overlay itself, or any `[data-vitra-modal-close]` inside. Focus returns to the element that was focused before `open()`.

### Drawer Module

```javascript
import { drawer } from './vitra.esm.js';

drawer.open('#menu');      // selector or element; closes any other open drawer
drawer.close();            // close the open drawer
drawer.close('#menu');     // close it only if it is the open one
drawer.toggle('#menu');    // returns true when it ends up open
drawer.init();             // bind toggles; runs on load unless "drawer": false
drawer.destroy();          // close, remove inert, unbind
```

```html
<button class="vitra-burger" data-vitra-drawer-toggle="#menu" aria-label="Open menu">
  <span class="vitra-burger-line"></span>
  <span class="vitra-burger-line"></span>
  <span class="vitra-burger-line"></span>
</button>

<div class="vitra-drawer-overlay"></div>
<nav id="menu" class="vitra-drawer" aria-label="Menu">
  <div class="vitra-drawer-header">
    <span class="vitra-drawer-title">Menu</span>
    <button class="vitra-drawer-close" aria-label="Close menu">&times;</button>
  </div>
  <div class="vitra-drawer-body">
    <a class="vitra-drawer-link" href="/">Home</a>
  </div>
</nav>
```

- **`data-vitra-drawer-toggle="#id"`** on any element links it to a drawer. The module sets `aria-expanded` on every toggle and `.active` on a `.vitra-burger` toggle. The `.open` class is the open state, as before; the CSS slides the drawer in from the right.
- **Closed means inert.** A managed drawer gets `inert` while closed (out of the tab order and the accessibility tree) and loses it when it opens. Opening it traps focus, locks scroll (same helper as the modal) and sets `role="dialog"` and `aria-modal="true"` if you did not provide a `role`; if you wrote `aria-hidden` on the drawer, the module flips it to `"false"` while open and back to `"true"` on close. Esc closes it, except while a modal is open. Focus goes back to the toggle (or the previously focused element) on close.
- **Overlay.** The module adds and removes `.open` on the drawer's overlay: the element named by `data-vitra-drawer-overlay="#id"` on the drawer, otherwise the `.vitra-drawer-overlay` that is a direct child of the drawer's parent. A click on the overlay closes the drawer at once. A click anywhere else outside the drawer closes it as well, one tick later, so a button of your own that calls `drawer.toggle()` in its click handler is not undone.
- **`.vitra-drawer-close`** inside a managed drawer closes it.
- **Which drawers are managed.** Only the ones referenced by a `[data-vitra-drawer-toggle]` and the ones you open with `drawer.open()`/`toggle()`. A `.vitra-drawer` that you open yourself by adding `.open` gets no `inert`, no focus trap and no other change, and keeps working as it did before 1.14.
- **Toggles call `preventDefault()`** on every click, so a link or a submit button with `data-vitra-drawer-toggle` will not navigate or submit.
- Only one drawer is open at a time.

### Ripple Module

```javascript
import { ripple } from './vitra.esm.js';

// Initialize click ripple (auto-enabled by default)
ripple.init();

// Add .vitra-ripple to any element to enable
// Click ripple is handled automatically via event delegation
```

A ripple started from the keyboard (or `element.click()`) grows from the centre of the element. Its styling lives in the `effects` piece.

### Toast Module

```javascript
import { toast } from './vitra.esm.js';

// Show a toast notification
const el = toast.show('Saved successfully!', {
  type: 'success',  // 'success' | 'error' | 'info' | 'warning' | 'default'
  duration: 3000,   // Auto-dismiss after ms (0 = no auto-dismiss)
  closable: false   // Add a close button (always added when duration is 0)
});

// Create the (empty) live region ahead of the first toast.
// Runs on load unless "toast": false; show() creates it on demand otherwise.
toast.init();
toast.destroy();   // clear timers, remove all toasts and the container
```

The markup is created for you: a `.vitra-toast-container` with `role="status"` and `aria-live="polite"`, holding `.vitra-toast` elements (`.vitra-toast-success`, `-error`, `-info`, `-warning`) that contain a `<span class="vitra-toast-text">` and, when closable, a `.vitra-toast-close` button labelled "Close". An `error` toast has `role="alert"` so it is announced at once. `show()` returns the toast element.

### Dropdown Module

```javascript
import { dropdown } from './vitra.esm.js';

// Initialize (handles click outside, keyboard, Popover API when available)
dropdown.init();
dropdown.destroy();
```

```html
<div class="vitra-dropdown">
  <button data-vitra-dropdown-toggle>Options</button>
  <div class="vitra-dropdown-menu">
    <button class="vitra-dropdown-item">Edit</button>
    <button class="vitra-dropdown-item">Delete</button>
  </div>
</div>

<!-- Right-aligned variant: -->
<div class="vitra-dropdown-menu vitra-dropdown-menu-end">...</div>

<!-- Popover API (modern browsers): add the popover attribute -->
<div class="vitra-dropdown-menu" popover>...</div>
```

Keyboard, on both the `.open` route and the `[popover]` route:

| Key | Where | Effect |
|-----|-------|--------|
| Arrow Down | toggle, menu closed | opens the menu and focuses the first item |
| Arrow Down / Arrow Up | menu open | next / previous item, wrapping around |
| Home / End | menu open | first / last item |
| Tab / Shift+Tab | menu open | closes the menu and moves on from the toggle |
| Esc | `.open` route | closes the menu and focuses the toggle (a `[popover]` menu is closed by the browser) |

Disabled items (`disabled` or `aria-disabled="true"`) are skipped; keys typed in a text field inside the menu and keys pressed with Alt, Ctrl or Meta are left alone. `aria-expanded` on the toggle follows the open state, including light dismiss of a popover. A `[popover]` menu is placed under its toggle and kept inside the viewport. Activating the toggle with a programmatic `toggle.click()` counts as a keyboard activation and moves focus into the menu; a real mouse click does not.

### Spotlight Module

```javascript
import { spotlight } from './vitra.esm.js';

// Initialize — tracks the pointer and applies spotlight to .vitra-spotlight elements
spotlight.init();
spotlight.destroy();
```

```html
<div class="vitra-card vitra-spotlight">
  Content with radial gradient following cursor
</div>
```

The module listens to `pointermove` (so a touch drag moves it too) and writes `--vitra-mouse-x` and `--vitra-mouse-y` on the element under the pointer; the pre-1.14 `--mouse-x` / `--mouse-y` are still written and read as aliases. Before the first move the glow sits at `50% 50%`.

### Motion Guard Module

```javascript
import { motionGuard } from './vitra.esm.js';

motionGuard.init();           // runs on load unless "motionGuard": false
motionGuard.observe(el);      // put one more element under the offscreen pause
motionGuard.destroy();
```

The guard adds `.vitra-motion-paused` to ambient loops while they are outside the viewport (plus 50 px): glow orbs, aurora, mesh gradient, gradient text, border glow, shape morph, gradient rotate, scenery, particles (through their container), spinners, skeletons, animated progress bars, indeterminate rings and the noise overlay.

It collects the matching elements once, at `init()`. **Elements you add to the page later are not observed automatically** (there is no `MutationObserver`): call `Vitra.motionGuard.observe(el)` for them. `scenery.mount()` and `particles.spawn()` do that for the elements they create. `observe()` does nothing before `init()`, and `init()` does nothing under `prefers-reduced-motion` (the CSS already stops those animations).

### destroyAll

```javascript
// Tear down all modules (removes listeners, resets state)
Vitra.destroyAll();
```

### Tooltip Module

There are two tooltips, with different mechanisms. Pick one per element.

**1. `data-vitra-tooltip` (needs JS and the CSS).** `tooltip.init()` runs on load unless `"tooltip": false`; it binds one set of listeners on `document`, so elements added later work too, and calling it again does nothing.

```html
<button data-vitra-tooltip="Click to save"
        data-vitra-tooltip-position="top"
        data-vitra-tooltip-delay="100">
  Save
</button>
```

```javascript
import { tooltip } from './vitra.esm.js';

// Show a tooltip from code
tooltip.show('#target-element', 'Tooltip text', {
  position: 'top',  // 'top', 'bottom', 'left', 'right'
  delay: 0          // Delay before show (ms)
});

// Hide the active tooltip (the argument is accepted but there is only ever one)
tooltip.hide();

tooltip.init();     // idempotent
tooltip.destroy();  // hide, unbind
```

It opens on pointer enter and on focus, and closes on pointer leave and blur. On touch, a tap on the target opens it and a tap anywhere else closes it. Esc and a window resize close it, and so does a scroll that moves the target relative to the tooltip (a scroll caused by focusing the target does not). It is placed on the requested side, flipped to the opposite side when it does not fit, then clamped to the viewport with an 8 px margin. It adds its id to the target's `aria-describedby` (keeping what you wrote) and removes only that id on close. The node is `role="tooltip"` with class `.vitra-tooltip-js`; all of its styling is in the CSS.

**2. `data-tooltip` + `.vitra-tooltip` (CSS only, no JS).** A wrapper whose `::before` shows the attribute text above it:

```html
<span class="vitra-tooltip" data-tooltip="Save changes">
  <button class="vitra-btn">Save</button>
</span>
```

It appears on `:focus-within` and, on devices that can hover (`@media (hover: hover)`), on `:hover`. It always sits above the wrapper and wraps at `min(20rem, 100vw - 2rem)`. It adds no ARIA (the text is not announced), so the element inside needs its own accessible name. The two attributes do not interact: `data-tooltip` is never read by the script.

### Tabs

There is no `Vitra.tabs` module in 1.14: tabs are CSS plus markup that you write, with a script of your own to switch them.

```html
<div id="my-tabs">
  <div class="vitra-tabs" role="tablist" aria-label="Sections">
    <button class="vitra-tabs-tab" role="tab" id="tab-1" aria-selected="true"  aria-controls="panel-1">First</button>
    <button class="vitra-tabs-tab" role="tab" id="tab-2" aria-selected="false" aria-controls="panel-2">Second</button>
  </div>
  <div class="vitra-tabs-panel vitra-active" role="tabpanel" id="panel-1" aria-labelledby="tab-1">First panel</div>
  <div class="vitra-tabs-panel" role="tabpanel" id="panel-2" aria-labelledby="tab-2">Second panel</div>
</div>
```

```javascript
const tabs = document.querySelectorAll('#my-tabs [role="tab"]');
tabs.forEach((tab) => tab.addEventListener('click', () => {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    document.getElementById(t.getAttribute('aria-controls')).classList.toggle('vitra-active', on);
  });
}));
```

- The selected tab is styled by `aria-selected="true"` (or `.vitra-tabs-tab-active`). A panel is shown only while it has `.vitra-active`; the framework does not switch them for you. `.vitra-tab` / `.vitra-tab-panel` are accepted as shorter class names.
- **The framework provides no keyboard navigation between tabs in 1.14** (no arrow keys, no Home/End). Because of that, do not put `tabindex="-1"` on the inactive tabs, which is what a roving-tabindex pattern does: without an arrow-key handler they would be unreachable. Leave every tab in the Tab order, or write the arrow-key handling yourself. A `Vitra.tabs` module is on the roadmap.
- The tab row scrolls horizontally instead of wrapping, with its scrollbar hidden; tabs are 44 px tall on touch screens.

### Radio and checkbox

```html
<label class="vitra-radio"><input type="radio" name="plan" value="a"> Option A</label>
<label class="vitra-checkbox"><input type="checkbox"> Accept the terms</label>
```

Both are painted controls (18 px, border from `--vitra-color-border-control`, accent fill when checked, a 44 px tall row on touch screens, a focus ring on `:focus-visible`). Under `forced-colors: active` the browser's native control is restored. A plain `<label><input type="checkbox">` without the class is not styled by Vitra.

---

## CSS-Only Features (No JS Import Needed)

### Scenery Module

Ambient, eight-layer mountain-landscape backdrop. Pure CSS — works with no JS, no `import`, no `data-config` entry (it lives in the `scenery` piece, which needs `core`; see *CSS Pieces*). (If `vitra.js` is on the page, `Vitra.scenery` will write the eight layers for you — see *One-element markup* below.) Colors derive automatically from the active theme's `--vitra-color-accent-h`/`-s` tokens, so switching themes re-colors the scene automatically.

```html
<!-- Full-page: position:fixed, sits behind all content -->
<div class="vitra-scenery" aria-hidden="true">
  <div class="vitra-scenery-sky"></div>
  <div class="vitra-scenery-clouds"></div>
  <div class="vitra-scenery-stars"></div>
  <div class="vitra-scenery-halo"></div>
  <div class="vitra-scenery-ridge-far"></div>
  <div class="vitra-scenery-ridge-mid"></div>
  <div class="vitra-scenery-ridge-near"></div>
  <div class="vitra-scenery-grain"></div>
</div>

<!-- Inline: position:absolute, scope to any position:relative; overflow:hidden container -->
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
```

The eight child layers are always the same regardless of which root class is used — only the root's positioning changes. The root element must always carry `aria-hidden="true"`; it's decorative only. `.vitra-scenery-stars` is opacity-gated to `0` on light-scheme themes (`light`, `pastel`, and `auto` under a light OS scheme) — safe to always include in markup, it just won't render there.

**Overridable tokens:**

| Token | Default | Purpose |
|---|---|---|
| `--vitra-scenery-hue` | `var(--vitra-color-accent-h)` | Base hue for the whole scene |
| `--vitra-scenery-sat` | `var(--vitra-color-accent-s)` | Base saturation |
| `--vitra-scenery-warm-h` | `calc(hue - 140)` (dark) / `32` (light, pastel) | Alpenglow hue: afterglow band, ridge rim light, cloud undersides, valley mist |
| `--vitra-scenery-glow-x` | `38%` | Horizontal anchor of the afterglow + valley mist ("where the sun set") |
| `--vitra-scenery-halo-x` / `-y` | `76%` / `13%` | Moon/sun position — compose your hero without custom CSS |
| `--vitra-scenery-halo-size` | `clamp(56px, 9vmin, 110px)` | Moon/sun diameter |
| `--vitra-scenery-opacity-rim` | `0.85` (dark) / `0.6` (light, pastel) | Ridge crest rim-light strength |
| `--vitra-scenery-speed` | `1` | Drift speed multiplier (higher = faster) |
| `--vitra-scenery-intro` | `1` | Entrance fade length multiplier (`2` = slower, `0` = no entrance) |
| `--vitra-scenery-depth` | `1` | Scroll-depth strength for `.vitra-scenery-inline` (`0` = layers stay locked) |
| `--vitra-scenery-opacity-far` / `-mid` / `-near` | `0.6` / `0.75` / `0.92` | Per-layer opacity (atmospheric perspective) |
| `--vitra-scenery-opacity-clouds` | `0.35` | Cloud layer opacity |

**Moon phase modifier:** add `vitra-scenery-halo-crescent` to the halo layer for a crescent moon:

```html
<div class="vitra-scenery-halo vitra-scenery-halo-crescent"></div>
```

On dark-scheme themes the halo renders as a textured full moon (or crescent with the modifier); on `light`/`pastel` it renders as a warm low sun. Ridge crests catch a warm rim light on their silhouette edges — it rides the same parallax transform as the ridge, so it never detaches in motion.

Ridge and cloud silhouettes come from inline SVG masks (shape) colored by theme tokens (color) — no external assets. Where `mask-image` is unsupported, ridges/clouds gracefully fall back to soft gradient bands. The far and mid ranges and the clouds drift the same right-to-left direction at different speeds for a consistent parallax/wind read; the near foreground rise stands still. Under `prefers-reduced-motion: reduce`, all layers stop animating and hold position — the scene stays visible, just static.

**One-element markup (`Vitra.scenery`).** With `vitra.js` loaded, an *empty* scenery root is filled with the eight layers (and `aria-hidden="true"`) on init — roots that already contain layers are never touched:

```html
<div class="vitra-scenery"></div>
<div class="vitra-scenery-inline" data-vitra-moon="crescent"></div>
```

```javascript
Vitra.scenery.init();                                   // fill every empty root; returns how many
Vitra.scenery.mount('#hero-bg', { inline: true, moon: 'crescent' }); // turn any element into a scene
Vitra.scenery.destroy();                                // remove only the layers it injected
```

Opt out of the auto-fill with `"scenery": false` in `data-config`.

**Motion, and what it costs.** Every moving layer animates `transform`/`opacity` only, so the scene runs on the compositor: an idle page performs no repaints and no per-frame style work.

- *Twinkle* — the near star field shimmers (an opacity flicker on its wrapper, five steps a second) against a far plane that holds steady. Nothing that paints a star tile is ever animated: Firefox re-rasterizes an element's SVG backgrounds and masks every time that element changes.
- *Entrance* — the whole scene fades up as one piece, a single opacity animation on the root. A scene that starts offscreen fades up when it scrolls into view.
- *Scroll depth* (`.vitra-scenery-inline`, browsers with CSS scroll-driven animations) — while the host scrolls out of view, the sky and moon lag the most, the far range less, the near treeline barely at all. No scroll listener. **The host must not be `overflow: hidden`** — that makes it the scroll container the timeline attaches to, and the effect silently stays off. Use `overflow: clip`, or nothing: the scenery root clips itself.
- *Gliding drift* — the ranges and clouds interpolate continuously (`linear`), so they land on sub-pixel positions every frame instead of advancing a pixel at a time. Their keyframes carry a `skewX(0.3deg)` that is not a look: Firefox snaps a layer whose transform is a pure translation to whole device pixels, and a transform that is not axis-aligned cannot be snapped. If you override the drift keyframes, keep the skew (and the `transform-origin: 0 100%` on the layers) or Firefox goes back to ticking. The moon's glow breathes continuously too. Only the star twinkle is stepped: it is a flicker, not travel.
- *Offscreen* — `Vitra.motionGuard` pauses every layer, pseudo-elements included, while the root is outside the viewport.

**Reshaping the mountains.** The ridge masks are generated, not hand-drawn: `node scripts/gen-ridges.cjs --write` rewrites them in `src/09-scenery.css`. Edit the `FAR` / `MID` control points to move summits and valleys, or set `SEED_FAR` / `SEED_MID` / `SEED_NEAR` to re-roll the crag detail and the tree stands.

### Motion tokens and animated theme changes

```css
.my-panel.open {
  transition: transform var(--vitra-duration-spring) var(--vitra-ease-spring-soft);
}
```

`--vitra-ease-spring` overshoots and settles (toasts, playful arrivals); `--vitra-ease-spring-soft` barely overshoots (modals, drawers, menus). Put the spring on the *open* state only, so things spring in and ease out.

```javascript
// Opt in once...
Vitra.theme.init({ transition: true });
// ...or per call, growing the new theme out of the button that was pressed
button.addEventListener('click', (event) => {
  Vitra.theme.toggle({ transition: true, origin: event });
});
```

The swap runs inside a View Transition, so `document.documentElement.dataset.theme` changes one frame after the call. Browsers without the API, and visitors with reduced motion, get the instant swap.

---

## Imports by Name

`dist/vitra.esm.js` is an ES module with one named export per module (`theme`, `particles`, `reveal`, `ripple`, `modal`, `drawer`, `tooltip`, `toast`, `dropdown`, `spotlight`, `scenery`, `motionGuard`, `destroyAll`) and a default export holding all of them. `dist/vitra.cjs` has the same names for `require()`, and `dist/vitra.d.ts` types both.

```javascript
// Only the theme API in this file
import { theme } from './dist/vitra.esm.js';

theme.init({ default: 'auto' });
```

```javascript
// The whole API
import Vitra from './dist/vitra.esm.js';

Vitra.drawer.open('#menu');
```

Importing by name selects the API you call; it does not promise a smaller bundle. Loading the module runs its auto-initialisation (the saved theme is restored at once, and on `DOMContentLoaded` every default-on module starts unless `data-config` turns it off), so the package is not declared free of side effects and a bundler keeps that code. To leave modules out at run time, set their key to `false` in `data-config`. To leave CSS out, use the CSS pieces.

Measured sizes of the built files (brotli): `vitra.min.js` 7.32 kB, `vitra.esm.js` 9.76 kB, `vitra.cjs` 10.08 kB.

---

## Data Attributes Reference

Vitra uses data attributes for declarative configuration without JavaScript.

### Theme

| Attribute | Value | Description |
|-----------|-------|-------------|
| `data-theme` | Theme name | Apply theme to element (inherits to children) |

```html
<html data-theme="dark">
```

### Particles

| Attribute | Value | Description |
|-----------|-------|-------------|
| `data-vitra-particles` | Count | Number of particles to spawn |
| `data-vitra-particle-color` | Color | Particle color |
| `data-vitra-particle-emoji` | Emoji | Use emoji instead of dots |
| `data-vitra-particle-direction` | `down`, `down-left`, `down-right`, or a degree angle | Opt-in falling direction (omit for the default symmetric bob) |

```html
<div data-vitra-particles="10" data-vitra-particle-color="#ff6b6b"></div>
<div data-vitra-particles="5" data-vitra-particle-emoji="✨"></div>
<div data-vitra-particles="15" data-vitra-particle-direction="down"></div>
```

### Tooltips

| Attribute | Value | Description |
|-----------|-------|-------------|
| `data-vitra-tooltip` | Text | Tooltip text content (JS tooltip) |
| `data-vitra-tooltip-position` | Position | 'top', 'bottom', 'left', 'right' |
| `data-vitra-tooltip-delay` | Ms | Delay before show (e.g., "100") |
| `data-tooltip` | Text | Text of the CSS-only tooltip on a `.vitra-tooltip` wrapper (no JS) |

```html
<button data-vitra-tooltip="Save changes" data-vitra-tooltip-position="top">
  Save
</button>
```

### Modal

| Attribute | Value | Description |
|-----------|-------|-------------|
| `data-vitra-modal-close` | (none) | Close button inside modal |

```html
<button data-vitra-modal-close>Close</button>
```

### Drawer

| Attribute | Value | Description |
|-----------|-------|-------------|
| `data-vitra-drawer-toggle` | Selector of the drawer | On the element that opens and closes it (gets `aria-expanded`; `.active` on a `.vitra-burger`) |
| `data-vitra-drawer-overlay` | Selector of the overlay | On the drawer, when its overlay is not the `.vitra-drawer-overlay` that is a direct child of the drawer's parent |

```html
<button data-vitra-drawer-toggle="#menu">Menu</button>
```

### Dropdown

| Attribute | Value | Description |
|-----------|-------|-------------|
| `data-vitra-dropdown-toggle` | (none) | The button that opens the menu inside a `.vitra-dropdown` |

### Scenery

| Attribute | Value | Description |
|-----------|-------|-------------|
| `data-vitra-moon` | `crescent` | On an empty scenery root: crescent instead of full moon |

---

## Integration Examples

### Example 1: Simple Landing Page (No Build)

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <link rel="stylesheet" href="vitra.css">
</head>
<body>
  <div class="vitra-container vitra-mt-5">
    <h1 class="vitra-text-4xl vitra-text-center">Welcome to My Site</h1>
    <div class="vitra-flex vitra-justify-center vitra-mt-4">
      <button class="vitra-btn vitra-btn-glass">Get Started</button>
    </div>
  </div>
  
  <script src="vitra.js"></script>
  <script>
    Vitra.theme.init({ defaultTheme: 'auto' });
  </script>
</body>
</html>
```

### Example 2: SPA with ES Modules

```javascript
// main.js
import Vitra from './vitra.esm.js';

// Initialize everything
Vitra.theme.init({ defaultTheme: 'auto' });
Vitra.reveal.init();
Vitra.tooltip.init();

// Dynamic theme toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
  Vitra.theme.toggle();
});

// Spawn particles on an event
document.getElementById('party-btn').addEventListener('click', () => {
  Vitra.particles.spawn(20, { emoji: '🎉' });
});
```

### Example 3: Static Site with data-config

```html
<!-- No JavaScript code needed! -->
<div data-config='{
  "theme": { "default": "auto" },
  "reveal": { "threshold": 0.1 }
}'>
  <div class="vitra-container">
    <div class="vitra-reveal vitra-reveal-up">
      <h2>Section 1</h2>
      <p>This fades in on scroll.</p>
    </div>
    <div class="vitra-reveal vitra-reveal-up vitra-delay-200">
      <h2>Section 2</h2>
      <p>This appears after a delay.</p>
    </div>
  </div>
  
  <script src="vitra.min.js"></script>
</div>
```

---

## Build Optimization Tips

### 1. Only Load What You Need

```html
<!-- If you only need CSS, skip the JS -->
<link rel="stylesheet" href="vitra.min.css">

<!-- No scenery, no particles or shader effects: load the core piece only -->
<link rel="stylesheet" href="vitra.core.min.css">
```

### 2. Minify for Production

```bash
# Minify CSS with lightningcss
npx lightningcss vitra.css --minify --output vitra.min.css

# Minify JS with esbuild
npx esbuild vitra.js --bundle --minify --outfile=vitra.min.js
```

### 3. Use the CDN with a pinned version

```html
<!-- jsDelivr serves the repository tag; add the hash from dist/SRI.txt -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/DesvoSoft/Vitra@v1.14.0/dist/vitra.min.css" integrity="sha256-..." crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/gh/DesvoSoft/Vitra@v1.14.0/dist/vitra.min.js" integrity="sha256-..." crossorigin="anonymous" defer></script>
```

### 4. Runtime Rendering Performance

Vitra's motion/glass effects are designed to be compositor-cheap by default,
but a few patterns can still add up if you stack many instances on one page:

- **Don't stack large-radius blurs.** `--vitra-blur-lg`/`--vitra-blur-xl` are
  already fairly wide; multiple overlapping `.vitra-glass` panels or glow
  effects each carrying their own large blur radius forces the compositor to
  re-rasterize a big region every frame. Prefer one blurred backdrop per
  screen area, not one per component.
- **Avoid animating `box-shadow` directly.** `.vitra-transition-shadow`
  exists for hover/focus state changes, not for continuous/looping
  animation — `box-shadow` is a paint property, not a compositor one, so
  animating it in a loop repaints every frame. Use `transform`/`opacity`
  (or a pseudo-element's `opacity`) for anything that runs continuously.
- **`.vitra-glass::after`'s specular highlight is a pseudo-element per
  panel.** Fine at normal counts; if a page renders dozens of glass panels
  at once (e.g. a long card grid), consider dropping the glass variant on
  off-screen or lower-priority cards, or pair with `content-visibility:
  auto` (below) so browsers skip painting instances that are scrolled out
  of view.
- **Long pages: use `content-visibility: auto`.** For sections, card grids,
  or list items that repeat down a long page, apply the `.vitra-cv-auto`
  utility (`src/07-utilities.css`) to skip layout/paint work for content
  that's far outside the viewport:
  ```html
  <section class="demo-section vitra-cv-auto">…</section>
  ```
  It ships with a generic `contain-intrinsic-size: auto 500px` — override
  this per-component if your actual content is significantly taller or
  shorter, otherwise the browser's placeholder size estimate will cause a
  visible scrollbar jump. Don't apply it to content that must stay
  measurable while hidden (e.g. components already toggled via
  `display:none`, like tab panels) — there's nothing left to skip.
- **Cards/modals without `contain`.** If you're composing large repeated
  structures (card grids, modal stacks) that don't already use
  `content-visibility`, adding `contain: layout style` scopes layout/style
  recalculation to that subtree instead of the whole document, which helps
  when many instances mount/update at once.

---

## Troubleshooting

### Vitra is not defined (JS)

- Ensure `vitra.js` is loaded before calling `Vitra.*` methods
- Check that the script tag is not `type="module"` without proper import
- For ES modules: use `import Vitra from './vitra.esm.js'` (or `import { theme } from './vitra.esm.js'`); `vitra.js` is the script-tag build

### Theme not applying

- Check that `data-theme` is set on `<html>` or a parent container
- Verify the theme name is valid (see `Vitra.theme.getValidThemes()`)
- Ensure `00-themes.css` is included in your CSS

### Particles not showing

- Check browser console for errors
- Verify `prefers-reduced-motion` is not enabled (particles skip if enabled)
- Check particle limits: `Vitra.particles.limits()`
- Particles that appear as small static dots, or a click ripple without styling: the `effects` piece is not loaded (see *CSS Pieces*)

### Tooltip unstyled or misplaced

- The tooltip's styles are in the CSS (`.vitra-tooltip-js`): load the stylesheet and the script from the same release
- For `data-tooltip` (CSS-only) the markup needs the `.vitra-tooltip` wrapper class; `data-vitra-tooltip` needs the script

### data-config not working

- Ensure the JSON is valid (no trailing commas)
- Check browser console for parse errors
- Verify `vitra.js` is loaded (data-config is processed on DOMContentLoaded)
- Only the first element with a `data-config` attribute is read

---

## Migration Guide

### From v1.x to v2.x (Example)

```javascript
// Old API (v1.x)
Vitra.setTheme('dark');

// New API (v2.x)
Vitra.theme.set('dark');
```

---

**Related Documentation:**
- [README.md](../README.md) - Quick start guide
- [docs/themes.md](themes.md) - Theme reference
- [docs/compatibility.md](compatibility.md) - Browser support
