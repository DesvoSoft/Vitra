# Vitra CSS Framework

A lightweight CSS framework focused on glassmorphism, configurable particles with glow effects, and smooth motion — built for internal use with zero external dependencies.

## Core Value

**Internal design system that eliminates CSS boilerplate while delivering premium glass + motion aesthetics out of the box.**

## Features

- **@layer cascade**: `tokens → glass → particles → layout → components → utilities`
- **8 Preset Themes**: default, light, dark, pastel, neon, earth, mono, midnight + auto-detect
- **Glassmorphism**: Configurable backdrop-filter with `@supports` fallbacks
- **Particles**: CSS-variable configurable with performance limits (15 mobile / 40 desktop)
- **Motion**: Accessibility-first animations (`prefers-reduced-motion`)
- **Components**: 9 component types (buttons, cards, forms, navigation, modals, badges, avatars, tooltips, sliders, tabs, progress)
- **JS Optional**: Progressive enhancement via vanilla JS modules
- **Zero Dependencies**: Pure CSS + optional vanilla JS

## Quick Start

### 1. Download or Clone

```bash
git clone https://github.com/your-org/vitra-css.git
cd vitra-css
```

### 2. Include in Your Project

#### Option A: Link the CSS file directly

```html
<!-- Include Vitra CSS -->
<link rel="stylesheet" href="src/vitra.css">

<!-- Optional: Include Vitra JS for interactive features -->
<script src="src/vitra.js"></script>
```

#### Option B: Import in your CSS

```css
@import url('path/to/vitra.css');
```

#### Option C: Build from source (recommended for production)

```bash
# Install dev dependencies
npm install

# Build for production
npm run build
```

Then link the minified files:

```html
<link rel="stylesheet" href="dist/vitra.min.css">
<script src="dist/vitra.js" type="module"></script>
```

## Basic Usage

### Apply a Theme

```html
<!-- Set theme via data attribute on <html> -->
<html data-theme="dark">
  <!-- Your content -->
</html>
```

Or use JavaScript:

```javascript
// Set theme
Vitra.theme.set('dark');

// Toggle between light and dark
Vitra.theme.toggle('light', 'dark');

// Initialize with auto-detect
Vitra.theme.init({ defaultTheme: 'auto' });
```

### Glass Effect

```html
<div class="vitra-glass">
  <h2>Glass Card</h2>
  <p>This uses backdrop-filter with fallback.</p>
</div>

<!-- Blur variants -->
<div class="vitra-glass vitra-glass-sm">Subtle blur</div>
<div class="vitra-glass vitra-glass-lg">Strong blur</div>
```

### Responsive Container

```html
<div class="vitra-container">
  <div class="vitra-grid vitra-grid-3 vitra-gap-4">
    <div class="vitra-card">Column 1</div>
    <div class="vitra-card">Column 2</div>
    <div class="vitra-card">Column 3</div>
  </div>
</div>
```

### Buttons

```html
<button class="vitra-btn">Solid Button</button>
<button class="vitra-btn vitra-btn-glass">Glass Button</button>
<button class="vitra-btn vitra-btn-ghost">Ghost Button</button>
<button class="vitra-btn vitra-btn-gradient">Gradient Button</button>
```

### Particles

```html
<!-- CSS-only particles -->
<div class="vitra-particle" style="--vitra-particle-color: #6c63ff;"></div>

<!-- With glow effect -->
<div class="vitra-particle vitra-particle-glow-md"></div>

<!-- Emoji particles -->
<div class="vitra-particles-emoji" data-emoji="✨"></div>
```

JavaScript API:

```javascript
// Spawn particles
Vitra.particles.spawn(10, {
  color: 'var(--vitra-color-accent)',
  size: 4,
  emoji: null
});

// Check limits
const limits = Vitra.particles.limits();
console.log(`Active: ${limits.active}, Available: ${limits.available}`);
```

### Motion & Reveal

```html
<!-- Reveal on scroll -->
<div class="vitra-reveal vitra-reveal-up">
  <h2>I fade in while sliding up</h2>
</div>

<!-- With delay -->
<div class="vitra-reveal vitra-reveal-up vitra-delay-300">
  I appear after 300ms
</div>
```

Initialize with JS:

```javascript
Vitra.reveal.init({
  selector: '.vitra-reveal',
  threshold: 0.1,
  stagger: 100
});
```

## Key Design Tokens

All tokens use `--vitra-` prefix and are immutable (defined once, overridden only in themes):

```css
/* Colors */
--vitra-color-bg: #0f0f14;
--vitra-color-surface: rgba(255, 255, 255, 0.05);
--vitra-color-accent: #6c63ff;

/* Spacing (base: 8px) */
--vitra-space-1: 0.5rem;   /* 8px */
--vitra-space-2: 1rem;     /* 16px */
--vitra-space-3: 1.5rem;   /* 24px */

/* Radius */
--vitra-radius-sm: 0.25rem;
--vitra-radius-md: 0.5rem;
--vitra-radius-lg: 0.75rem;

/* Motion */
--vitra-duration-fast: 150ms;
--vitra-duration-normal: 250ms;
--vitra-ease-out: cubic-bezier(0, 0, 0.2, 1);
```

## Build & Development

### Prerequisites

- Node.js 16+ (for build tools only)

### Build Commands

```bash
# Install dependencies
npm install

# Build CSS (minify with lightningcss)
npm run build:css

# Build JS (bundle with esbuild)
npm run build:js

# Build both
npm run build

# Development server
npm run dev
```

### Build Tools

| Tool | Purpose | Command |
|------|---------|---------|
| `lightningcss` | CSS minification, syntax lowering | `npx lightningcss src/vitra.css --minify --output dist/vitra.min.css` |
| `esbuild` | JS bundling, tree-shaking | `npx esbuild src/vitra.js --bundle --outfile=dist/vitra.js --format=esm` |

## Browser Support

- **Modern browsers**: Full feature support (Chrome 88+, Firefox 87+, Safari 14+)
- **Backdrop-filter**: Uses `@supports` with solid background fallback
- **Reduced motion**: Respects `prefers-reduced-motion: reduce`
- **Legacy browsers**: Graceful degradation (solid backgrounds instead of glass)

See [docs/compatibility.md](docs/compatibility.md) for full details.

## Documentation

| Document | Description |
|----------|-------------|
| [docs/themes.md](docs/themes.md) | 8 preset themes, data-theme usage, Vitra.theme API |
| [docs/compatibility.md](docs/compatibility.md) | Browser support table, @supports fallbacks |
| [docs/integration.md](docs/integration.md) | data-config attribute, JS module API, tree-shaking |

## Project Structure

```
vitra-css/
├── src/
│   ├── 00-themes.css      # Theme definitions (8 presets)
│   ├── 01-tokens.css      # Design tokens (immutable)
│   ├── 02-glass.css       # Glassmorphism system
│   ├── 03-particles.css   # Particle system
│   ├── 04-motion.css      # Motion engine
│   ├── 05-layout.css      # Layout system (grid, flex, container)
│   ├── 06-components.css  # UI components
│   ├── 07-utilities.css   # Utility classes
│   └── vitra.js           # Optional JS modules
├── docs/                   # Documentation
├── dist/                   # Build output (generated)
└── .planning/              # GSD planning files
```

## Accessibility

- **prefers-reduced-motion**: All animations disabled when user prefers reduced motion
- **Focus visible**: Clear focus indicators on interactive elements
- **Color contrast**: Themes designed for WCAG AA compliance
- **Semantic HTML**: Components use appropriate ARIA attributes

## Contributing

This is an internal framework for DesvoSoft projects. For modifications:

1. Check `.planning/ROADMAP.md` for planned features
2. Follow the `@layer` cascade order
3. Use `--vitra-` prefix for all tokens
4. Test with `prefers-reduced-motion`
5. Ensure `@supports` fallbacks for glass effects

## License

Internal use only — DesvoSoft.

---

*Powered by Vitra CSS Framework*
