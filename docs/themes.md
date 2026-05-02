# Themes - Vitra CSS Framework

Complete guide to using and customizing the 8 preset themes in Vitra CSS Framework.

## Overview

Vitra includes **7 preset themes** that can be applied via the `data-theme` attribute or JavaScript API. Each theme overrides the core design tokens to create a unique visual experience.

| Theme | Name | Description |
|-------|------|-------------|
| `light` | Light | Light background (#ffffff) with dark text |
| `dark` | Dark | Dark background (#06060a) with light text |
| `pastel` | Pastel | Soft muted colors with pink accents |
| `neon` | Neon | Bright glowing accents on deep black background |
| `ocean` | Ocean | Deep blue-toned theme with cyan accents |
| `emerald` | Emerald | Rich green-toned theme with soft glows |
| `auto` | Auto-Detect | Uses `prefers-color-scheme` to detect system preference |

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

// Toggle between two themes
Vitra.theme.toggle('light', 'dark');

// Get current theme
const current = Vitra.theme.get();
console.log('Current theme:', current);

// Get effective theme (resolves 'auto' to actual theme)
const effective = Vitra.theme.getEffective();
console.log('Effective theme:', effective);
```

## Theme Reference

### 1. Default (No data-theme attribute)

The default theme matches the base token values defined in `01-tokens.css`.

**Core Colors:**
- Background: `#0f0f14` (dark)
- Surface: `rgba(255, 255, 255, 0.05)`
- Accent: `#6c63ff` (purple)
- Text: `rgba(255, 255, 255, 0.95)` (light)

**Use case:** Dark-themed applications, matches the "dark" theme.

---

### 2. Light Theme

Bright theme with dark text on light background.

**Key Tokens:**
```css
html[data-theme="light"] {
  --vitra-color-bg: #ffffff;
  --vitra-color-surface: rgba(0, 0, 0, 0.05);
  --vitra-color-text-primary: rgba(0, 0, 0, 0.95);
  --vitra-color-accent: #6c63ff;
}
```

**Shadows:** Lighter shadows for light backgrounds.

**Use case:** Documentation sites, light-themed dashboards.

---

### 3. Dark Theme

Dark background with light text (explicit).

**Key Tokens:**
```css
html[data-theme="dark"] {
  --vitra-color-bg: #06060a;
  --vitra-color-surface: rgba(255, 255, 255, 0.05);
  --vitra-color-text-primary: rgba(255, 255, 255, 0.95);
  --vitra-color-accent: #6c63ff;
}
```

**Shadows:** Glow effects enhanced for dark theme.

**Use case:** Default for admin panels, dark-mode applications.

---

### 4. Pastel Theme

Soft, muted colors with pink accents.

**Key Tokens:**
```css
[data-theme="pastel"] {
  --vitra-color-bg: #f9f7f7;
  --vitra-color-surface: rgba(255, 182, 193, 0.15);
  --vitra-color-accent: #ffb6c1; /* Light pink */
  --vitra-color-text-primary: rgba(80, 60, 80, 0.95);
}
```

**Shadows:** Soft pastel shadows.

**Use case:** Children's apps, playful interfaces, soft UI.

---

### 5. Neon Theme

Bright cyan glow effects on deep black background.

**Key Tokens:**
```css
[data-theme="neon"] {
  --vitra-color-bg: #0a0a0f;
  --vitra-color-accent: #00ffff; /* Cyan */
  --vitra-color-text-primary: rgba(0, 255, 255, 0.95);
  --vitra-shadow-glow: 0 0 20px rgba(0, 255, 255, 0.5);
}
```

**Shadows:** Strong glow effects using cyan.

**Use case:** Gaming interfaces, creative portfolios, cyberpunk themes.

---

### 6. Earth Theme

Warm natural tones with brown accents.

**Key Tokens:**
```css
[data-theme="earth"] {
  --vitra-color-bg: #f5e6d3;
  --vitra-color-surface: rgba(139, 90, 43, 0.08);
  --vitra-color-accent: #8b5a2b; /* Brown */
  --vitra-color-text-primary: rgba(62, 39, 18, 0.95);
}
```

**Shadows:** Earthy brown shadows.

**Use case:** Nature-themed sites, organic brands, eco-friendly applications.

---

### 7. Mono Theme

Grayscale-only theme (no color).

**Key Tokens:**
```css
[data-theme="mono"] {
  --vitra-color-bg: #f5f5f5;
  --vitra-color-surface: rgba(0, 0, 0, 0.05);
  --vitra-color-accent: #505050; /* Gray */
  --vitra-color-text-primary: rgba(0, 0, 0, 0.95);
  --vitra-color-success: #404040;
  --vitra-color-error: #202020;
}
```

**Use case:** Print-friendly views, high-contrast accessibility, minimalist designs.

---

### 8. Midnight Theme

Deep blue-purple theme with purple glow.

**Key Tokens:**
```css
[data-theme="midnight"] {
  --vitra-color-bg: #0f0b1a;
  --vitra-color-surface: rgba(106, 90, 205, 0.08);
  --vitra-color-accent: #6a5acd; /* Slate blue */
  --vitra-color-text-primary: rgba(230, 230, 250, 0.95);
  --vitra-shadow-glow: 0 0 20px rgba(106, 90, 205, 0.4);
}
```

**Shadows:** Purple glow effects.

**Use case:** Night modes, creative applications, luxurious interfaces.

---

### 9. Auto Theme (System Preference)

Automatically detects the user's system theme preference via `prefers-color-scheme`.

**Behavior:**
- Uses `prefers-color-scheme: dark` → Applies "dark" theme tokens
- Uses `prefers-color-scheme: light` → Applies "light" theme tokens
- Falls back to "dark" theme if detection fails

**Implementation:**
```css
html[data-theme="auto"] {
  /* Default to dark */
  --vitra-color-bg: #06060a;
  /* ... other dark theme tokens ... */
}

@media (prefers-color-scheme: light) {
  html[data-theme="auto"] {
    --vitra-color-bg: #ffffff;
    /* ... light theme tokens ... */
  }
}
```

**JavaScript watches for changes:**
```javascript
// Auto theme listens for system changes
if (themeToSet === 'auto') {
  theme._watchSystemTheme();
}
```

**Use case:** Respecting user's OS-level theme preference automatically.

---

## JavaScript API Reference

### Vitra.theme Methods

#### `Vitra.theme.get()`
Returns the current theme name from the DOM.

```javascript
const theme = Vitra.theme.get();
// Returns: 'dark', 'light', 'auto', etc.
// If no data-theme is set, returns 'default'
```

#### `Vitra.theme.set(themeName)`
Sets the theme on the document element.

```javascript
const success = Vitra.theme.set('neon');
// Returns: true if successful, false if invalid theme

// Persists to localStorage automatically
```

#### `Vitra.theme.toggle(themeA, themeB)`
Toggles between two themes.

```javascript
// Toggle between light and dark
const newTheme = Vitra.theme.toggle('light', 'dark');
// If current is 'light', sets to 'dark' and returns 'dark'
// If current is 'dark', sets to 'light' and returns 'light'
```

#### `Vitra.theme.init(options)`
Initializes theme from localStorage or system preference.

```javascript
Vitra.theme.init({
  defaultTheme: 'auto',  // Fallback if nothing stored (default: 'auto')
  persist: true            // Whether to persist theme (default: true)
});

// Behavior:
// 1. Try to restore from localStorage
// 2. If nothing stored, use defaultTheme
// 3. Apply the theme
// 4. If persist is true and no stored theme, save defaultTheme
// 5. If theme is 'auto', watch for system changes
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
// Returns: ['light', 'dark', 'pastel', 'neon', 'ocean', 'emerald', 'auto']
```

---

## Creating a Theme Toggle

### Simple Toggle Button

```html
<button onclick="toggleTheme()">Toggle Theme</button>

<script>
function toggleTheme() {
  Vitra.theme.toggle('light', 'dark');
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
  <option value="earth">Earth</option>
  <option value="mono">Mono</option>
  <option value="midnight">Midnight</option>
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
  const newTheme = Vitra.theme.toggle('light', 'dark');
  
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
2. **Test all themes:** Verify your UI looks good in all 8 presets
3. **Use auto theme for new users:** Set `defaultTheme: 'auto'` in `Vitra.theme.init()`
4. **Respect persistence:** Let users override the system preference if they want
5. **Test with prefers-color-scheme:** Use DevTools to simulate system theme changes

---

## Troubleshooting

### Theme not applying?
- Ensure `data-theme` is set on `<html>` or a parent container
- Check that `00-themes.css` is included in your CSS bundle
- Verify the theme name is spelled correctly (case-sensitive)

### localStorage not working?
- Check if localStorage is available: `Vitra.theme._isLocalStorageAvailable()`
- Some browsers disable localStorage in private/incognito mode

### Auto theme not detecting system preference?
- Ensure browser supports `prefers-color-scheme` (Chrome 76+, Firefox 67+)
- Check with: `window.matchMedia('(prefers-color-scheme: dark)').matches`

---

**Related Documentation:**
- [docs/integration.md](integration.md) - JS module API and data-config
- [docs/compatibility.md](compatibility.md) - Browser support for themes
- [README.md](../README.md) - Quick start guide
