# Vitra CSS Framework

## What This Is

A lightweight CSS framework focused on glassmorphism, configurable particles with glow effects, and smooth motion — built for internal use with zero external dependencies. Designed to provide consistent UI patterns across projects while maintaining a distinctive aesthetic.

## Core Value

**Internal design system that eliminates CSS boilerplate while delivering premium glass + motion aesthetics out of the box.**

## Requirements

### Validated

- **ARCH-01 to ARCH-03**: @layer cascade, --vitra- prefix, immutable tokens — validated in Phase 1
- **THEM-01 to THEM-04**: 8 preset themes, data-theme toggle, auto-detect, localStorage — validated in Phase 1

### Active

Ver: `.planning/REQUIREMENTS.md` para los 49 requisitos activos (49 requisitos trazables a fases)

### Out of Scope

- [Bootstrap/Tailwind compatibility] — Vitra is standalone, not a plugin
- [Server-side rendering] — Pure CSS, no SSR concerns
- [Component framework (React/Vue)] — CSS only, integrations via data attributes
- [Icon library] — Developers use their preferred icon set
- [Mobile-first responsive grid system] — Layout uses fluid/clamp, not a full grid framework

## Context

- **Planning phase complete**: Two comprehensive plans analyzed (v2.1 pragmatic, v3.0 architectural)
- **Technical decision**: v3.0 adopted as foundation with v2.1 fallback features integrated
- **Domain**: Internal framework for consistent UI across projects
- **Inspiration**: Glassmorphism + particles aesthetic from existing style.css patterns

### Key Features from Plans

| Feature | Source | Integration |
|---------|--------|-------------|
| @layer cascade | v3.0 | Core architecture |
| Tokens (immutable) | v3.0 | Foundation |
| @supports fallbacks | v2.1 | Glass + particles |
| Particle limits | v2.1 | Performance |
| prefers-reduced-motion | v2.1 | Accessibility |
| Theme system | v3.0 | Core feature |
| JS modules | v3.0 | Optional layer |

## Toolchain de Build

Minimal build configuration for production distribution:

### CSS Processing
- **Tool:** `lightningcss` (via CLI or npm script)
- **Purpose:** Minification, syntax lowering for broader browser support
- **Config:** No config file needed — CLI flags only

```bash
# Minify CSS
npx lightningcss --minify src/vitra.css > dist/vitra.min.css
```

### JS Bundling
- **Tool:** `esbuild` (via CLI or npm script)
- **Purpose:** Bundle optional JS modules, tree-shaking
- **Config:** No config file needed — CLI flags only

```bash
# Bundle JS modules
npx esbuild src/vitra.js --bundle --outfile=dist/vitra.js --format=esm
```

### package.json Scripts

```json
{
  "scripts": {
    "build:css": "npx lightningcss src/vitra.css --minify --output dist/vitra.min.css",
    "build:js": "npx esbuild src/vitra.js --bundle --outfile=dist/vitra.js --format=esm",
    "build": "npm run build:css && npm run build:js",
    "dev": "npx serve ."
  }
}
```

### Validation Strategy
See `.planning/TEST.md` for per-phase validation linking to ROADMAP.md phases, including:
- axe-core / Lighthouse for accessibility
- DevTools Performance for particle animation
- Cross-browser visual comparison

## Constraints

- **Tech Stack**: Pure CSS + optional vanilla JS — no frameworks; build tools (lightningcss, esbuild) for distribution only
- **Browser Support**: Modern browsers + graceful degradation for older browsers
- **Bundle Size**: Clean and maintainable, not chasing artificial size limits
- **Accessibility**: prefers-reduced-motion, focus visibility, contrast validation
- **Configuration**: Declarative via CSS variables and data attributes

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Adopt v3.0 as base | Strict layer architecture prevents CSS conflicts | ✓ Good |
| Integrate v2.1 fallbacks | Production-ready without reinventing compatibility patterns | ✓ Good |
| .vitra- prefix | Avoid collisions, strong identity | ✓ Good |
| CSS-only core | Zero dependencies, progressive enhancement | ✓ Good |
| JS optional | Developers opt-in to interactivity | ✓ Good |
| @layer cascade | tokens → glass → layout → components → utilities | ✓ Good |

---
*Last updated: 2026-04-29 after adding Toolchain de Build section and Phase 7.5 updates*