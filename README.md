# Vitra CSS Framework

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/DesvoSoft/Vitra)
[![Version](https://img.shields.io/badge/version-1.2.0-blue)](https://github.com/DesvoSoft/Vitra)
[![License](https://img.shields.io/badge/license-Internal-red)](https://github.com/DesvoSoft/Vitra)

Vitra is a high-performance, premium CSS framework engineered for modern web applications. It specializes in Glassmorphism, Motion Design, and Interactive Particles, providing a sophisticated aesthetic out of the box with zero external dependencies.

---

## Why Vitra?

Unlike generic utility-first frameworks, Vitra is built with a specific aesthetic philosophy: Depth and Motion. It eliminates CSS boilerplate while enforcing a strict, maintainable architecture.

-   Glass-First Design: Optimized backdrop-filter effects with robust @supports fallbacks for all browsers.
-   Strict @layer Architecture: Predictable cascade management using modern CSS layers.
-   Motion Engine: High-performance animations that automatically respect prefers-reduced-motion.
-   Particle System: Native CSS/JS hybrid particles with built-in performance limits.
-   Smart Theming: Zero-config Light, Dark, and Auto modes with system-level synchronization.

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

Use jsDelivr to load the minified files. We strongly recommend using a fixed version (e.g., `@1.2.0`) and including Subresource Integrity (SRI) hashes to guarantee security and stability.

```html
<!-- High-performance CSS (Fixed version with SRI) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/DesvoSoft/Vitra@1.2.0/dist/vitra.min.css" integrity="sha256-SgZY5apaP48KO2UquhWXH0TJQ9qQbAyM9PagKnSS6iI=" crossorigin="anonymous">

<!-- Optional: Modular JS Engine (Fixed version with SRI) -->
<script src="https://cdn.jsdelivr.net/gh/DesvoSoft/Vitra@1.2.0/dist/vitra.min.js" integrity="sha256-nLbPlWz+rimhFqBHQMaRifl0D4sfTiod6aTxky5epFc=" crossorigin="anonymous" defer></script>
```

> **Note:** You can use `@latest` instead of `@1.2.0` for testing the most recent updates, but this is **not recommended** for production as breaking changes could affect your site.

#### Option B: Local Assets

If you built the framework locally, link the assets in your HTML:

```html
<!-- High-performance CSS -->
<link rel="stylesheet" href="dist/vitra.min.css">

<!-- Optional: Modular JS Engine -->
<script src="dist/vitra.min.js" defer data-config='{"theme":"auto"}'></script>
```

---

## Architecture

Vitra uses a strict @layer cascade to prevent specificity leaks and ensure consistent styling across large projects.

1.  tokens: Immutable design primitives (colors, spacing, shadows).
2.  glass: The core glassmorphism engine.
3.  particles: Background effects and glow systems.
4.  layout: Structural utilities (Flex, Grid, Container).
5.  motion: Animation engine and reveal logic.
6.  components: Premium UI elements (Buttons, Cards, Forms).
7.  utilities: High-precedence helper classes.

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
Vitra.theme.toggle(); // Intelligently flips between Light/Dark
Vitra.theme.set('light');
```

### Particle Engine
```javascript
Vitra.particles.spawn(15, {
  color: 'var(--vitra-color-accent)',
  size: 5,
  container: '#hero-section'
});
```

---

## Project Structure

```text
Vitra/
├── src/
│   ├── 00-themes.css      # Smart theme definitions
│   ├── 01-tokens.css      # Design tokens (colors, spacing)
│   ├── 02-glass.css       # Glassmorphism engine
│   ├── 03-particles.css   # Particle systems
│   ├── 04-motion.css      # Motion & Animation engine
│   ├── 05-layout.css      # Modern Layout system
│   ├── 06-components.css  # Premium UI components
│   └── vitra.js           # Modular JS core
├── dist/                  # Production builds
└── docs/                  # Detailed implementation guides
```

---

## Accessibility & Performance

-   Reduced Motion: All transitions and animations are automatically disabled if prefers-reduced-motion is detected.
-   Resource Safety: Particle counts are capped (15 on mobile, 40 on desktop) to ensure 60fps performance on all devices.
-   Semantic HTML: All components are designed with accessibility and screen readers in mind.

---

## Documentation

For deep dives into the framework, check the internal documentation:
-   Theming Guide (docs/themes.md)
-   Integration & API (docs/integration.md)
-   Browser Compatibility (docs/compatibility.md)

---

Developed and maintained by DesvoSoft.  
Internal Use Only.
