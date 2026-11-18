# Themes - Vitra CSS Framework

Complete guide to using and customizing the 7 preset themes in Vitra CSS Framework.

## Overview

Vitra includes **6 preset themes** (plus `auto` for system detection) that can be applied via the `data-theme` attribute or JavaScript API. Each theme overrides the core design tokens to create a unique visual experience. All surface colors are tinted with the accent hue — no pure neutral grays.

| Theme | Name | Accent Hue | Description |
|-------|------|-----------|-------------|
| `light` | Light | 222 (blue) | Pale blue-tinted background, blue accent |
| `dark` | Dark | 177 (teal) | Near-black background tinted by the teal accent |
| `pastel` | Pastel | 330 (pink) | Soft blush surfaces with a deep pink accent |
| `neon` | Neon | 285 (violet) | Vivid violet accent on a deep dark background |
| `ocean` | Ocean | 205 (blue) | Deep blue-toned theme with a bright blue accent |
| `emerald` | Emerald | 145 (green) | Rich green-toned theme with soft glows |
| `auto` | Auto-Detect | 222 or 177 | Follows the system: identical to `light` or to `dark` (see *Auto Theme*) |

### Premium Color Features

Since v1.3, Vitra's theming system includes:

- **Tinted Neutrals**: Every surface carries a trace of the accent hue — inspired by Stripe, Linear, and Raycast
- **`color-scheme` Sync**: Browser-native UI (scrollbars, form controls) automatically matches the theme

## Quick Start

### Apply a Theme via HTML

```html
<!-- Set theme on <html> element -->
<html data-theme="dark">
  <!-- Your content -->
</html>

<!-- Or apply to any container -->
<div data-theme="light">
  <p>This content uses the light theme.</p>
</div>
```

### Apply a Theme via JavaScript

```javascript
// Vitra is available as a global or ES module
const Vitra = window.Vitra; // or import from './vitra.js'

// Set a specific theme
Vitra.theme.set('dark');

// Toggle between light and dark
const newTheme = Vitra.theme.toggle();

// Get current theme
const current = Vitra.theme.get();
console.log('Current theme:', current);

// Get effective theme (resolves 'auto' to actual theme)
const effective = Vitra.theme.getEffective();
console.log('Effective theme:', effective);
```

## Theme Reference

### 1. Default (No data-theme attribute)

The default theme is the base token set in `01-tokens.css`, which is the dark palette: accent hue 177 (teal) and `color-scheme: dark`. A page with no `data-theme` therefore gets dark form controls and scrollbars, and the stars of the scenery.

**Core Colors:**
- Background: `hsl(var(--vitra-color-accent-h) 15% 4%)`
- Surface: `hsl(var(--vitra-color-accent-h) 20% 95% / 5%)`
- Text: `hsl(0deg 0% 100% / 95%)`

**Use case:** Dark-themed applications; the same as the "dark" theme.

---

### 2. Light Theme

Bright theme with dark text on a pale blue-tinted background.

```css
html[data-theme="light"] {
  --vitra-color-accent-h: 222;
  --vitra-color-accent-s: 72%;
  --vitra-color-accent-l: 51%;
  --vitra-color-bg: hsl(222deg 32% 97%);
  --vitra-color-surface: hsl(222deg 30% 10% / 5%);
  --vitra-color-border-control: hsl(222deg 25% 15% / 50%);
  --vitra-color-text-primary: hsl(222deg 28% 10%);
}
```

**Use case:** Documentation sites, light-themed dashboards.

---

### 3. Dark Theme

Dark background with light text (explicit), tinted with the accent hue.

```css
html[data-theme="dark"] {
  --vitra-color-bg: hsl(var(--vitra-color-accent-h) 15% 4%);
  --vitra-color-surface: hsl(var(--vitra-color-accent-h) 20% 95% / 5%);
  --vitra-color-border-control: hsl(var(--vitra-color-accent-h) 20% 95% / 37%);
  --vitra-color-text-primary: hsl(0deg 0% 100% / 95%);
}
```

**Use case:** Default for admin panels, dark-mode applications.

---

### 4. Pastel Theme

Soft, muted colors with pink accents.

```css
html[data-theme="pastel"] {
  --vitra-color-bg: hsl(330deg 30% 98%);
  --vitra-color-accent-h: 330;
  --vitra-color-accent-s: 70%;
  --vitra-color-accent-l: 44%; /* deep enough for 4.5:1 under white labels and as text on the pale surfaces */
}
```

**Use case:** Children's apps, playful interfaces, soft UI.

---

### 5. Neon Theme

Vivid violet accent on a deep dark background.

```css
html[data-theme="neon"] {
  --vitra-color-bg: hsl(285deg 35% 3%);
  --vitra-color-accent-h: 285;
  --vitra-color-accent-s: 100%;
  --vitra-color-accent-l: 58%;
  --vitra-color-text-primary: hsl(285deg 100% 96%);
}
```

**Use case:** Gaming interfaces, creative portfolios, cyberpunk themes.

---

### 6. Ocean Theme

Deep blue-toned theme with a bright blue accent.

```css
html[data-theme="ocean"] {
  --vitra-color-bg: hsl(205deg 35% 4%);
  --vitra-color-accent-h: 205;
  --vitra-color-accent-s: 90%;
  --vitra-color-accent-l: 55%;
  --vitra-color-text-primary: hsl(205deg 100% 95%);
}
```

**Use case:** Marine-themed interfaces, creative portfolios, data dashboards.

---

### 7. Emerald Theme

Rich green-toned theme with soft glows.

```css
html[data-theme="emerald"] {
  --vitra-color-bg: hsl(145deg 22% 3%);
  --vitra-color-accent-h: 145;
  --vitra-color-accent-s: 80%;
  --vitra-color-accent-l: 45%;
  --vitra-color-text-primary: hsl(145deg 100% 95%);
}
```

**Use case:** Nature-themed sites, financial dashboards, premium branding.

---

### 8. Auto Theme (System Preference)

`auto` follows the system: `prefers-color-scheme: dark` gives exactly the `dark` theme and `prefers-color-scheme: light` exactly the `light` theme, scenery, glass and modal included.

**It is generated, not written.** Nobody edits an `auto` block. The build (`scripts/lib/auto-mirror.cjs`, called from `scripts/build-css.js`) reads the rules marked with `@vitra-auto-mirror` and, right after each one, emits a copy for `[data-theme="auto"]` wrapped in `@media (prefers-color-scheme: light)` or `(prefers-color-scheme: dark)`. The copy has the same specificity as the original and the marker comment is removed from the output. Source files never contain the string `data-theme="auto"`; a test enforces it.

To make a rule part of `auto` as well as of `light` or `dark`, put the marker on the line before it, naming the scheme the rule belongs to:

```css
/* @vitra-auto-mirror light */
:where([data-theme="light"], [data-theme="pastel"]) .vitra-scenery-halo {
  /* … */
}
```

- The marker takes `light` or `dark`, and the rule after it must name at least one theme attribute.
- In a selector list only the selectors that name a theme are copied; inside `:where()` or `:is()` the whole list of theme attributes is replaced by `[data-theme="auto"]`.
- The build throws if a theme attribute is inside `:not()`, if theme attributes appear in several places of one selector, if the marker is not followed by a rule, or if the scheme is not `light` or `dark`.
- A selector for pages with no `data-theme` (`:where(:root:not([data-theme]))`) can sit in the same list; the mirror leaves it out of the `auto` copy.

**JavaScript.** `theme.getEffective()` resolves `auto` with `matchMedia('(prefers-color-scheme: dark)')`. There is no JS watcher: the CSS media query handles a change of the system theme.

### Control borders and the token-only rule

- **`--vitra-color-border-control`** is the border of an interactive control (input, select, switch, checkbox, radio). It is defined in `:root` and in every theme, and each value is the lowest alpha that reaches 3:1 against that theme's `--vitra-color-bg`. `--vitra-color-border` stays the quiet line of cards and panels (decorative, exempt from the 3:1 rule). A new theme must define both.
- **Colours in components come from tokens.** Inside `@layer components`, `utilities` and `shaders`, colour declarations (`color`, `background`, `border`, `outline`, `fill`, `stroke`) use `var(--vitra-color-*)`, not literals. The exceptions are accent-hue expressions (`hsl(var(--vitra-color-accent-h) …)`), colours inside gradients, shadows, and a declaration preceded by `/* vitra-literal-ok: <reason> */`. `tests/build.test.js` fails on any other literal.
- `--vitra-color-text-tertiary` is for non-essential text (hints, watermarks); text a user needs to read, placeholders included, uses `secondary` or `primary`.

### CSS Custom Properties Reference

Each theme defines the following `--vitra-*` properties:

| Property | Purpose | Overridden in themes? |
|----------|---------|-----------------------|
| `--vitra-color-bg` | Page background | ✅ All themes |
| `--vitra-color-surface` | Card/component background | ✅ All themes |
| `--vitra-color-surface-hover` | Hover state surface | ✅ All themes |
| `--vitra-color-surface-active` | Active state surface | ✅ All themes |
| `--vitra-color-border` | Subtle borders | ✅ All themes |
| `--vitra-color-border-hover` | Hover border state | ✅ All themes |
| `--vitra-color-border-control` | Border of an interactive control (3:1 against the page) | ✅ All themes |
| `--vitra-color-text-primary` | Primary text | ✅ All themes |
| `--vitra-color-text-secondary` | Secondary/muted text | ✅ All themes |
| `--vitra-color-text-tertiary` | Tertiary/disabled text | ✅ All themes |
| `--vitra-color-text-inverse` | Text on accent backgrounds | ✅ All themes |
| `--vitra-shadow-*` | Shadow levels | ✅ Dark/light, ⚠️ decorative (fallback to dark) |
| `--vitra-glass-bg` | Glass background | ✅ All themes |
| `--vitra-color-accent-h` | Accent hue | ✅ Decorative themes override |
| `--vitra-color-accent-s` | Accent saturation | ✅ Decorative themes override |
| `--vitra-color-accent-l` | Accent lightness | ✅ Decorative themes override |
| `--vitra-border-glow-angle` | Animated border start angle | Base value only |
| `--vitra-gradient-text-l` | Lightness of the animated gradient text | Base 55%, `light` sets 35% |

**Note:** Decorative themes (pastel, neon, ocean, emerald) inherit shadow and premium token values from the default dark theme unless explicitly overridden.

**Use case:** Respecting user's OS-level theme preference automatically.

---

## JavaScript API Reference

### Vitra.theme Methods

#### `Vitra.theme.get()`
Returns the current theme name from the DOM.

```javascript
const theme = Vitra.theme.get();
// Returns: 'dark', 'light', 'auto', etc.
// If no data-theme is set, returns 'auto'
```

#### `Vitra.theme.set(themeName)`
Sets the theme on the document element.

```javascript
const success = Vitra.theme.set('neon');
// Returns: true if successful, false if invalid theme

// Persists to localStorage automatically
```

#### `Vitra.theme.toggle(options)`
Toggles between light and dark themes. If currently in a special theme (pastel, neon, etc.), defaults to light. `options` is `{ transition, origin }` as for `set()`.

```javascript
// Toggle between light and dark
const newTheme = Vitra.theme.toggle();
// Returns: 'light' or 'dark' depending on the new state
```

#### `Vitra.theme.init(options)`
Initializes theme from localStorage or system preference.

```javascript
Vitra.theme.init({
  default: 'auto',       // Fallback if nothing stored (default: 'auto'); 'defaultTheme' works too
  persist: true,         // Whether to persist theme (default: true)
  transition: false      // Animate later changes with a circular reveal (default: false)
});

// Behavior:
// 1. Try to restore from localStorage
// 2. If nothing stored, use the default
// 3. Apply the theme
// 4. If persist is true and no stored theme, save the default
// 5. 'auto' needs no watcher: the CSS media query follows the system
```

#### `Vitra.theme.getEffective()`
Gets the effective theme (resolves 'auto' to actual theme).

```javascript
Vitra.theme.set('auto');
const effective = Vitra.theme.getEffective();
// Returns: 'dark' or 'light' based on system preference
```

#### `Vitra.theme.clear()`
Clears the stored theme preference.

```javascript
Vitra.theme.clear();
// Removes 'vitra-theme' from localStorage
```

#### `Vitra.theme.getValidThemes()`
Returns an array of valid theme names.

```javascript
const themes = Vitra.theme.getValidThemes();
// Returns: ['light', 'dark', 'auto', 'pastel', 'neon', 'ocean', 'emerald']
```

---

## Creating a Theme Toggle

### Simple Toggle Button

```html
<button onclick="toggleTheme()">Toggle Theme</button>

<script>
function toggleTheme() {
  Vitra.theme.toggle();
}
</script>
```

### Theme Selector Dropdown

```html
<select onchange="Vitra.theme.set(this.value)">
  <option value="light">Light</option>
  <option value="dark" selected>Dark</option>
  <option value="pastel">Pastel</option>
  <option value="neon">Neon</option>
  <option value="ocean">Ocean</option>
  <option value="emerald">Emerald</option>
  <option value="auto">Auto (System)</option>
</select>
```

### Theme Toggle with Icons (CSS-only)

```html
<button class="vitra-btn vitra-btn-ghost" onclick="toggleTheme()">
  <span data-theme-icon="dark">🌙</span>
  <span data-theme-icon="light" style="display:none;">☀️</span>
</button>

<script>
function toggleTheme() {
  const newTheme = Vitra.theme.toggle();
  
  // Update icons
  document.querySelectorAll('[data-theme-icon]').forEach(el => {
    el.style.display = el.getAttribute('data-theme-icon') === newTheme ? 'inline' : 'none';
  });
}
</script>
```

---

## Theme Persistence

When using `Vitra.theme.set()` or `Vitra.theme.init()`, the theme is automatically saved to `localStorage` under the key `vitra-theme`.

**To disable persistence:**
```javascript
Vitra.theme.init({
  persist: false
});
```

**To clear stored preference:**
```javascript
Vitra.theme.clear();
```

---

## Custom Theme Creation

You can create custom themes by adding a new `[data-theme="custom-name"]` block in your CSS.

```css
/* Custom theme example */
html[data-theme="brand"] {
  --vitra-color-bg: #your-bg-color;
  --vitra-color-surface: rgba(...);
  --vitra-color-accent: #your-accent;
  --vitra-color-text-primary: rgba(...);
  --vitra-color-text-secondary: rgba(...);
  --vitra-color-border: rgba(...);
  --vitra-shadow-glow: 0 0 20px rgba(...);
}
```

**Note:** Custom themes are not included in `Vitra.theme.getValidThemes()` unless you modify the `VALID_THEMES` array in `vitra.js`.

---

## Theme-Specific Component Styling

Components automatically adapt to the current theme through CSS cascade.

```html
<!-- This card will use the current theme's tokens -->
<div class="vitra-card">
  <h3 class="vitra-card-title">Themed Card</h3>
  <p class="vitra-card-body">This card uses the active theme's colors.</p>
</div>
```

No additional work needed — all components use `var(--vitra-color-*)` tokens that are overridden by the theme.

---

## Best Practices

1. **Always use tokens:** Reference `var(--vitra-color-*)` in your custom CSS, not hard-coded colors
2. **Test all themes:** Verify your UI looks good in all 7 presets, and in `auto` under a light and a dark system
3. **Use auto theme for new users:** Set `default: 'auto'` in `Vitra.theme.init()` (or `"theme": "auto"` in `data-config`)
4. **Respect persistence:** Let users override the system preference if they want
5. **Test with prefers-color-scheme:** Use DevTools to simulate system theme changes

---

## Troubleshooting

### Theme not applying?
- Ensure `data-theme` is set on `<html>` or a parent container
- Check that `00-themes.css` is included in your CSS bundle
- Verify the theme name is spelled correctly (case-sensitive)

### localStorage not working?
- Check if localStorage is available: `try { localStorage.setItem('t', '1'); localStorage.removeItem('t'); } catch (e) { /* blocked */ }`
- Some browsers disable localStorage in private/incognito mode

### Auto theme not detecting system preference?
- Ensure browser supports `prefers-color-scheme` (Chrome 76+, Firefox 67+)
- Check with: `window.matchMedia('(prefers-color-scheme: dark)').matches`

---

**Related Documentation:**
- [docs/integration.md](integration.md) - JS module API and data-config
- [docs/compatibility.md](compatibility.md) - Browser support for themes
- [README.md](../README.md) - Quick start guide
