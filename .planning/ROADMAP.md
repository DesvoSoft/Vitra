# Roadmap: Vitra CSS Framework

**Defined:** 2026-04-26
**Target:** v1.0 initial release

## Phase Overview

| Phase | Status | Focus | Requirements |
|-------|--------|-------|-------------|
| 1 | ✓ Complete | Tokens & Themes | ARCH-01-03, THEM-01-04 |
| 2 | ○ Pending | Glass System | GLAS-01-04 |
| 3 | ○ Pending | Particles & Motion | PART-01-05, MOTI-01-05 |
| 4 | ○ Pending | Layout & Utilities | LAYO-01-04, UTIL-01-04 |
| 5 | ○ Pending | Components | COMP-01-09 |
| 6 | ○ Pending | JavaScript | JS-01-05 |
| 7 | ○ Pending | Docs & Build | DOCS-01-04, BUILD-01-04 |
| 7.5 | ○ Pending | Demo interactiva | DEMO-01-04 |

---

## Phase 1: Tokens & Themes

**Duration:** Implementation + verification

### Goals
- [ ] Establish foundation layer with immutable CSS variables
- [ ] Implement 6 preset themes with full token override
- [ ] Theme toggle mechanism (CSS + JS optional)

### Files
- `src/01-tokens.css` — Core variables (colors, spacing, radius, shadows, typography, motion)
- `src/00-themes.css` — Theme definitions (default, light, dark, pastel, neon, earth, mono, midnight)

### Deliverables
- [ ] Tokens respond correctly to theme changes
- [ ] No token breaking changes in future phases

### Verification
- [ ] CSS renders with all 6 themes
- [ ] JS theme toggle works (if enabled)
- [ ] localStorage persistence functional

---

## Phase 2: Glass System

**Duration:** Implementation + verification

### Goals
- [ ] Core glassmorphism effect with configurable blur
- [ ] Graceful @supports fallback for unsupported browsers
- [ ] Multiple blur intensity variants

### Files
- `src/02-glass.css` — Glass effect + fallbacks

### Deliverables
- [ ] `.vitra-glass` renders with backdrop-filter
- [ ] Fallback applies when @supports negative
- [ ] Border and shadow tokens applied correctly

### Verification
- [ ] Visual test in Chrome/Firefox/Safari
- [ ] Fallback test in simulated old browser
- [ ] Performance acceptable (no layout thrashing)

---

## Phase 3: Particles & Motion

**Duration:** Implementation + verification

### Goals
- [ ] Configurable particle system via CSS variables
- [ ] Glow effects and emoji particles
- [ ] Performance limits per device
- [ ] Complete motion engine with accessibility

### Files
- `src/03-particles.css` — Particle system
- `src/04-motion.css` — Keyframes and animation classes

### Deliverables
- [ ] Particles configurable without new classes
- [ ] Animation respects prefers-reduced-motion
- [ ] Reveal classes trigger on scroll (JS optional)

### Verification
- [ ] Particles render and animate
- [ ] prefers-reduced-motion disables animations
- [ ] Performance acceptable on mobile (40 particles max)

---

## Phase 4: Layout & Utilities

**Duration:** Implementation + verification

### Goals
- [ ] Responsive container system
- [ ] Grid and flex utilities
- [ ] Spacing and text utilities
- [ ] Fluid spacing with clamp()

### Files
- `src/05-layout.css` — Container, grid, flex
- `src/07-utilities.css` — Spacing, text, state utilities

### Deliverables
- [ ] Layout classes work responsively
- [ ] No duplication with components
- [ ] Utility classes don't override components

### Verification
- [ ] Responsive breakpoints work correctly
- [ ] Layout + components stack properly
- [ ] No specificity conflicts

---

## Phase 5: Components

**Duration:** Implementation + verification

### Goals
- [ ] Core UI components using only tokens
- [ ] Consistent states (hover, focus, disabled, active)
- [ ] Glass variants where appropriate

### Files
- `src/06-components.css` — All core components

### Components
1. Buttons (glass, ghost, solid, gradient)
2. Cards (basic, glass, hover, stacked)
3. Forms (input, select, textarea, toggle)
4. Navigation (navbar, mobile drawer, burger)
5. Modals (overlay, content, focus trap)
6. Badges/Avatars
7. Tooltips
8. Sliders
9. Tabs/Progress

### Deliverables
- [ ] All components render correctly
- [ ] States work as expected
- [ ] Components use only tokens (no hardcoded values)

### Verification
- [ ] Each component renders in isolation
- [ ] Interactions work (hover, focus, click)
- [ ] Accessibility: focus rings visible, contrast sufficient

---

## Phase 6: JavaScript (Optional)

**Duration:** Implementation + verification

### Goals
- [ ] Optional JS modules for enhanced interactivity
- [ ] Theme toggle with persistence
- [ ] Scroll reveal with IntersectionObserver
- [ ] Modal/tooltip with accessibility

### Files
- `src/vitra.js` or `dist/vitra.js` — Modular JS library

### Modules
1. `theme` — toggle, set, auto-detect, persistence
2. `particles` — spawn, destroy, limits
3. `reveal` — scroll observer, stagger
4. `modal` — open, close, focus trap
5. `tooltip` — show, hide, position

### Deliverables
- [ ] JS works without CSS framework (progressive enhancement)
- [ ] data-config attribute works
- [ ] Tree-shakeable for partial usage

### Verification
- [ ] All modules functional in isolation
- [ ] No global pollution
- [ ] Typescript types (optional)

---

## Phase 7: Documentation & Build

**Duration:** Implementation + verification

### Goals
- [ ] Complete documentation
- [ ] Build system for distribution
- [ ] Version tagging

### Files
- `README.md` — Quick start, installation
- `docs/compatibility.md` — Browser support, fallbacks
- `docs/themes.md` — Theme customization
- `docs/integration.md` — data-config, JS API
- `dist/vitra.css` — Built CSS
- `dist/vitra.min.css` — Minified CSS

### Deliverables
- [ ] README clear and actionable
- [ ] Docs cover all features
- [ ] Build outputs correct
- [ ] npm/package.json ready (optional)

### Verification
- [ ] Documentation renders correctly
- [ ] Build produces valid CSS
- [ ] Version in package.json matches

---

## Phase 7.5: Demo interactiva

**Duration:** Implementation + verification

### Goals
- [ ] Interactive demo page showcasing all Vitra CSS features
- [ ] Functional theme toggle with live preview
- [ ] Configurable particles via CSS variables and JS
- [ ] Zero external dependencies (self-contained demo)

### Files
- `demo/index.html` — Interactive demo page
- `demo/demo.css` — Demo-specific styles (uses Vitra tokens)
- `demo/demo.js` — Demo interactions (theme toggle, particle config)

### Deliverables
- [ ] `demo/index.html` renders correctly with all components
- [ ] Theme toggle switches between all 6 themes instantly
- [ ] Particle configuration (count, glow, emoji) works via UI controls
- [ ] Demo loads without any external dependencies (CDN, npm packages)
- [ ] Glass components demonstrate fallback behavior

### Verification
- [ ] axe-core accessibility scan passes (0 violations)
- [ ] Lighthouse accessibility score: 100
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge
- [ ] Theme toggle works (keyboard + click)
- [ ] Particle controls update visuals in real-time
- [ ] `prefers-reduced-motion` disables all demo animations
- [ ] DevTools Performance: ≥ 50 FPS with active particles
- [ ] No network requests to external resources

---

## Success Criteria

- [ ] All 49 requirements implemented
- [ ] All phases verified complete
- [ ] Zero breaking changes in v1
- [ ] Documentation complete
- [ ] Build system functional

---
*Roadmap defined: 2026-04-26*
*Last updated: 2026-04-29 after adding Phase 7.5 (Demo interactiva)*