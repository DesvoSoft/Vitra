# Vitra CSS Framework

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/DesvoSoft/Vitra)
[![Version](https://img.shields.io/badge/version-1.13.2-blue)](https://github.com/DesvoSoft/Vitra)
[![License](https://img.shields.io/badge/license-ISC-blue)](https://github.com/DesvoSoft/Vitra)
[![Bundle Size](https://img.shields.io/badge/css-19.8%20kB%20brotli-brightgreen)](https://github.com/DesvoSoft/Vitra)
[![Tests](https://img.shields.io/badge/tests-97%20passing-brightgreen)](https://github.com/DesvoSoft/Vitra)

Vitra is a high-performance, premium CSS framework engineered for modern web applications. It specializes in Glassmorphism, Motion Design, Interactive Particles, and Cinematic Visual Effects, providing a sophisticated aesthetic out of the box with zero external dependencies.

---

## Why Vitra?

Unlike generic utility-first frameworks, Vitra is built with a specific aesthetic philosophy: **Depth, Motion, and Life**. It eliminates CSS boilerplate while enforcing a strict, maintainable architecture.

-   **Glass-First Design**: Optimized backdrop-filter effects with robust `@supports` fallbacks for all browsers.
-   **Strict @layer Architecture**: Predictable cascade management using modern CSS layers.
-   **Motion Engine**: 25+ choreographed keyframes that automatically respect `prefers-reduced-motion`, plus spring easing tokens (`--vitra-ease-spring`) for things that arrive.
-   **Light on the machine**: ambient effects animate `transform`/`opacity` only, move in small steps on a shared 10 Hz clock so the screen is only redrawn when a pixel changes, and pause offscreen.
-   **Particle System**: Native CSS/JS hybrid particles with built-in performance limits (15 mobile / 40 desktop).
-   **Cinematic Effects**: Animated mesh gradients, floating glow orbs, gradient text, spinning border glows, page-enter animation, 3D tilt cards, aurora background, text reveal, stagger system.
-   **Ambient Scenery**: CSS-only mountain landscape — faceted ranges with lit planes over a still foreground, twinkling stars, a moon with a breathing corona. It assembles on load and separates into depth planes as you scroll. One element of markup.
-   **Shader Effects**: Pure-CSS shader effects — noise overlay, shape morphing, progress rings, gradient rotate borders, scroll-driven reveals, material ripple.
-   **Modern CSS Features**: Container Queries, `@starting-style`, Popover API, scroll-driven animations, View Transitions, `linear()` easing — all with fallbacks.
-   **Premium Color System**: All surfaces tinted with accent hue — no pure neutral grays. Warm/cool/oklch variants.
-   **Smart Theming**: 7 themes (light, dark, auto, pastel, neon, ocean, emerald) with system-level sync.

---

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/DesvoSoft/Vitra.git
cd Vitra

# Install dependencies and build
npm install
npm run build
```

### 2. Basic Setup

You can use Vitra by installing it locally, or via a free CDN (jsDelivr) for instant global delivery.

#### Option A: Via CDN (Recommended for production)

Use jsDelivr to load the minified files. We strongly recommend using a fixed version and including Subresource Integrity (SRI) hashes to guarantee security and stability.

```html
<!-- High-performance CSS (Fixed version with SRI) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/DesvoSoft/Vitra@v1.13.2/dist/vitra.min.css" integrity="sha256-..." crossorigin="anonymous">

<!-- Optional: Modular JS Engine (Fixed version with SRI) -->
<script src="https://cdn.jsdelivr.net/gh/DesvoSoft/Vitra@v1.13.2/dist/vitra.min.js" integrity="sha256-..." crossorigin="anonymous" defer></script>
```

> **Note:** Always use a pinned version (e.g., `@v1.13.2`) for production. The SRI hashes are generated during build and stored in `dist/SRI.txt`.

#### Option B: Local Assets

```html
<!-- High-performance CSS -->
<link rel="stylesheet" href="dist/vitra.min.css">

<!-- Optional: Modular JS Engine -->
<script src="dist/vitra.min.js" defer></script>
```

---

## Architecture

Vitra uses a strict @layer cascade to prevent specificity leaks and ensure consistent styling across large projects.

1.  tokens: Immutable design primitives (colors, spacing, shadows).
2.  glass: The core glassmorphism engine.
3.  particles: Background effects and glow systems.
4.  motion: Animation engine and reveal logic.
5.  scenery: Ambient mountain-landscape backdrop.
6.  layout: Structural utilities (Flex, Grid, Container).
7.  components: Premium UI elements (Buttons, Cards, Forms).
8.  utilities: High-precedence helper classes.
9.  shaders: Pure-CSS shader effects.

---

## Themes & Glassmorphism

Vitra supports three core theme modes: light, dark, and auto. It also includes several premium variants: Pastel, Neon, Ocean, and Emerald.

```html
<!-- Apply a theme -->
<html data-theme="dark">

<!-- Apply the signature Glass effect -->
<div class="vitra-glass vitra-glass-md">
  <h2>Premium Content</h2>
  <p>Seamlessly integrated with backdrop-filter.</p>
</div>
```

---

## JS API

The Vitra JS API is modular and declarative. You can configure it via data-config on the script tag or use the global Vitra object.

### Theme Control
```javascript
Vitra.theme.set('neon');          // Switch to neon theme
Vitra.theme.toggle();             // Flip between light/dark
Vitra.theme.getEffective();       // Resolve 'auto' to actual theme

// Animated: the new theme grows as a circle out of the control that was pressed
button.addEventListener('click', (event) => {
  Vitra.theme.toggle({ transition: true, origin: event });
});
```

### Scenery
```javascript
Vitra.scenery.init();                                  // fill every empty .vitra-scenery root (automatic on load)
Vitra.scenery.mount('#hero-bg', { inline: true, moon: 'crescent' });
```

### Always-on helpers
`ripple`, `tooltip`, `dropdown`, `spotlight`, `scenery` and `motionGuard` initialize themselves on load. `motionGuard` pauses ambient loops (scenery, glow orbs, aurora, mesh gradient, gradient text) while they are offscreen. Turn any of them off in `data-config`, e.g. `{"motionGuard": false}`.

### Particle Engine
```javascript
Vitra.particles.spawn(15, {
  color: 'var(--vitra-color-accent)',
  size: 5,
  container: '#hero-section'
});
```

### Cinematic Effects (CSS-only, no JS needed)
```html
<!-- Animated mesh gradient background -->
<div class="vitra-gradient-bg"></div>

<!-- Floating glow orbs -->
<div class="vitra-glow-orb vitra-glow-orb-1"></div>
<div class="vitra-glow-orb vitra-glow-orb-2"></div>

<!-- Animated gradient text -->
<h1 class="vitra-gradient-text">Premium Heading</h1>

<!-- Spinning border glow -->
<div class="vitra-border-glow">
  <div class="vitra-card">Content</div>
</div>
```

### Scenery — Ambient Mountain Landscape

An ambient backdrop that turns `.vitra-glass` panels into a window onto a scene instead of a translucent card on a flat color: SVG-silhouette mountain ranges at three depths, a moon (or low sun on light themes) with a breathing corona, a star field that twinkles the way real air makes starlight flicker, drifting wisps and valley mist. Colors derive from the active theme's accent hue.

It is built to be light: every moving layer animates `transform`/`opacity` only (no repaints, no main-thread work), all loops are stepped on one 10 Hz clock so the compositor redraws the scene about ten times a second instead of on every display frame, the foreground stands still, and `Vitra.motionGuard` pauses the scene while it is offscreen. Respects `prefers-reduced-motion`.

```html
<!-- Full-page fixed backdrop. With vitra.js loaded, one element is all you write -->
<div class="vitra-scenery"></div>

<!-- Or scope it to one container (hero, large card) -->
<section style="position: relative;">
  <div class="vitra-scenery-inline" data-vitra-moon="crescent"></div>
  <div class="vitra-glass" style="position: relative;">Content over the scene</div>
</section>
```

No JavaScript? Write the eight layers yourself — the scene is pure CSS either way:

```html
<div class="vitra-scenery" aria-hidden="true">
  <div class="vitra-scenery-sky"></div>
  <div class="vitra-scenery-stars"></div>
  <div class="vitra-scenery-clouds"></div>
  <div class="vitra-scenery-halo"></div>
  <div class="vitra-scenery-ridge-far"></div>
  <div class="vitra-scenery-ridge-mid"></div>
  <div class="vitra-scenery-ridge-near"></div>
  <div class="vitra-scenery-grain"></div>
</div>
```

The scene assembles on load (ranges rise back-to-front, the moon climbs, stars fade up) and, for `.vitra-scenery-inline`, separates into depth planes as it scrolls away — CSS scroll-driven, no listeners. Tune with `--vitra-scenery-intro`, `--vitra-scenery-depth`, `--vitra-scenery-speed`; full token list in [docs/integration.md](docs/integration.md).

---

## Project Structure

```text
Vitra/
├── src/
│   ├── 00-themes.css      # 7 themes (light, dark, auto, pastel, neon, ocean, emerald)
│   ├── 01-tokens.css      # Foundation tokens (colors, spacing, typography, shadows)
│   ├── 02-glass.css       # Glassmorphism engine with @supports fallbacks
│   ├── 03-particles.css   # Particle systems with device-aware limits
│   ├── 04-motion.css      # Motion engine + cinematic effects (gradient, glow, border, stagger, tilt, aurora, reveal)
│   ├── 05-layout.css      # Grid, container, hero, flex, responsive utilities
│   ├── 06-components.css  # 17 component systems (buttons, cards, modals, tables, etc.)
│   ├── 07-utilities.css   # Spacing, display, width/height, z-index, responsive variants
│   ├── 08-shaders.css     # Noise, grain and shader-style surface effects
│   ├── 09-scenery.css     # Ambient mountain-landscape backdrop (SVG-silhouette parallax)
│   └── vitra.js           # 11 modules: theme, particles, reveal, ripple, modal, tooltip, toast, dropdown, spotlight, scenery, motionGuard
├── dist/                  # Production builds + source maps + SRI hashes
├── docs/                  # Theming, integration, compatibility, audit
└── tests/                 # 97 vitest tests
```

---

## Modern CSS Features

Vitra leverages cutting-edge CSS for progressive enhancement:

| Feature | Usage | Browser Support |
|---------|-------|-----------------|
| **`@layer`** | Cascade ordering (tokens < components < utilities) | Chrome 88+, FF 97+, Safari 15.4+ |
| **`@container`** | Responsive table card layout | Chrome 105+, FF 110+, Safari 16+ |
| **`@starting-style`** | Entry animations for modals, toasts, dropdowns | Chrome 117+, FF 128+, Safari 17.4+ |
| **`popover` API** | Native dropdown with JS fallback | Chrome 114+, FF 125+, Safari 17.4+ |
| **`:has()`** | Parent-aware component states | All modern browsers |
| **`clamp()`** | Fluid spacing and typography | Chrome 79+, FF 75+ |
| **`oklch()`** | Premium color space alternative | Chrome 111+, FF 113+, Safari 15.4+ |
| **Scroll-driven animations** | Scenery scroll depth, `.vitra-scroll-reveal*` | Chrome 115+, Safari 26+ (skipped elsewhere) |
| **`linear()` easing** | Spring tokens | Chrome 113+, FF 112+, Safari 17.2+ (`cubic-bezier` fallback) |
| **View Transitions** | Animated theme change (opt-in) | Chrome 111+, Safari 18+, FF 144+ (instant swap elsewhere) |
| **Individual `translate`** | Scenery entrance layered over drift | Chrome 104+, FF 72+, Safari 14.1+ |

---

## Accessibility & Performance

-   **Reduced Motion**: All transitions and animations auto-disable if `prefers-reduced-motion` is detected. Supported at CSS (`0.01ms !important`) and JS levels; the scenery holds a static frame and animated theme changes fall back to an instant swap.
-   **Compositor-only, stepped ambient motion**: scenery, mesh gradient, glow orbs, aurora, drawer and skeleton shimmer animate `transform`/`opacity` only, and the infinite loops advance in steps on a shared 10 Hz clock. Measured in headless Chromium on an idle page with the full scenery: 0 repaints, ~3 ms/s of main-thread work, and 10 screen redraws a second (a continuously interpolated loop forces one per display frame).
-   **Offscreen pause**: `Vitra.motionGuard` stops ambient loops outside the viewport.
-   **Resource Safety**: Particle counts capped (15 mobile, 40 desktop).
-   **Contrast**: checked with axe-core against WCAG 2.2 AA across all themes; status badges use a fixed dark ink (`--vitra-color-on-status`) so they stay legible in light themes.
-   **Screen Reader Support**: `aria-live` announcer on theme changes, `aria-describedby` on tooltips, `role="dialog"` + `aria-modal` on modals, `.vitra-sr-only` utilities. Scenery is `aria-hidden`.
-   **Bundle Size**: CSS ~142 KB minified (~19.8 kB brotli), JS ~20 KB minified (~5.7 kB brotli). Monitored via `size-limit`.

---

## Documentation

| Document | Description |
|----------|-------------|
| [Theming Guide](docs/themes.md) | Theme reference, customization, persistence |
| [Integration & API](docs/integration.md) | CDN, JS API, data-config, tree-shaking |
| [Browser Compatibility](docs/compatibility.md) | Support matrix, fallback strategies |
| [Audit & Roadmap](docs/AUDIT-2026.md) | Full codebase audit, gaps, future plans |
| [Performance & A11y Audit (1.13)](docs/AUDIT-2026-10-05.md) | Measured before/after, causes, open items |

---

Developed and maintained by DesvoSoft.  
Released under the ISC License.
