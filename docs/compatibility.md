# Browser Compatibility - Vitra CSS Framework

Complete browser support matrix and fallback strategies for the Vitra CSS Framework.

## Browser Support Table

| Feature | Chrome | Firefox | Safari | Edge | Opera | IE 11 |
|---------|---------|----------|--------|------|-------|-------|
| **Core CSS (Tokens, Utilities)** | 88+ ✅ | 87+ ✅ | 14+ ✅ | 88+ ✅ | 74+ ✅ | ❌ |
| **@layer Cascade** | 88+ ✅ | 97+ ✅ | 15.4+ ✅ | 88+ ✅ | 74+ ✅ | ❌ |
| **backdrop-filter (Glass)** | 76+ ✅ | 103+ ✅ | 9+ ✅ | 79+ ✅ | 63+ ✅ | ❌ |
| **@supports Detection** | 28+ ✅ | 22+ ✅ | 9+ ✅ | 12+ ✅ | 15+ ✅ | 12+ ⚠️ |
| **CSS Grid (Layout)** | 57+ ✅ | 52+ ✅ | 10.1+ ✅ | 16+ ✅ | 44+ ✅ | 10+ ⚠️ |
| **CSS Flexbox** | 29+ ✅ | 22+ ✅ | 9+ ✅ | 12+ ✅ | 17+ ✅ | 11+ ⚠️ |
| **CSS clamp()** | 79+ ✅ | 75+ ✅ | 13.1+ ✅ | 79+ ✅ | 66+ ✅ | ❌ |
| **CSS Variables** | 49+ ✅ | 31+ ✅ | 9.1+ ✅ | 15+ ✅ | 36+ ✅ | ❌ |
| **prefers-reduced-motion** | 74+ ✅ | 63+ ✅ | 10.1+ ✅ | 79+ ✅ | 62+ ✅ | ❌ |
| **prefers-color-scheme** | 76+ ✅ | 67+ ✅ | 12.1+ ✅ | 79+ ✅ | 63+ ✅ | ❌ |
| **IntersectionObserver** | 51+ ✅ | 55+ ✅ | 12.1+ ✅ | 15+ ✅ | 38+ ✅ | ❌ |
| **ES Modules (JS)** | 61+ ✅ | 60+ ✅ | 10.1+ ✅ | 16+ ✅ | 48+ ✅ | ❌ |

**Legend:**
- ✅ Full support
- ⚠️ Partial support (with caveats)
- ❌ Not supported

## Graceful Degradation Strategy

Vitra CSS is designed **mobile-first and modern-first**, with graceful degradation for older browsers.

### Tier 1: Modern Browsers (Recommended)
- **Chrome 88+**, **Firefox 97+**, **Safari 15.4+**, **Edge 88+**
- Full feature set: glassmorphism, motion, themes, particles
- All @layer cascade features work

### Tier 2: Broad Support (Functional)
- **Chrome 76+**, **Firefox 63+**, **Safari 12+**, **Edge 79+**
- Core features work; some advanced features may degrade
- Glass effect falls back to solid backgrounds
- Animations may be simplified

### Tier 3: Legacy (Basic)
- **IE 11**, **Older Edge (Spartan)**
- **Not officially supported**
- Basic layout may work with CSS fallbacks
- JS features will not work (no ES module support)

## @supports Fallback Strategy

Vitra uses `@supports` queries to detect feature support and provide fallbacks.

### Glass Effect Fallback

```css
/* Base: Solid background (works everywhere) */
.vitra-glass {
  background: var(--vitra-color-surface);
  border: 1px solid var(--vitra-color-border);
  box-shadow: var(--vitra-shadow-medium);
}

/* Enhanced: backdrop-filter (modern browsers) */
@supports (backdrop-filter: blur(4px)) {
  .vitra-glass {
    background: rgba(255, 255, 255, 0.08); /* More transparent */
    backdrop-filter: blur(var(--vitra-blur-md));
  }
}
```

**What happens in older browsers:**
1. They get the solid `var(--vitra-color-surface)` background
2. They ignore the `@supports` block entirely
3. The element still looks good (just not "glassy")

### Using @supports in Your Code

```css
/* Your custom glass component */
.my-glass-panel {
  background: rgba(0, 0, 0, 0.05); /* Fallback */
  border-radius: 12px;
}

@supports (backdrop-filter: blur(10px)) {
  .my-glass-panel {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }
}
```

### Testing @supports Support

```javascript
// Check if a feature is supported
if ('CSS' in window && 'supports' in window.CSS) {
  const hasBackdropFilter = CSS.supports('backdrop-filter', 'blur(4px)');
  console.log('backdrop-filter supported:', hasBackdropFilter);
} else {
  console.log('@supports not available, using fallbacks');
}
```

## Feature Detection Matrix

### CSS Features

| Feature | Detection | Fallback |
|---------|------------|----------|
| `backdrop-filter` | `@supports (backdrop-filter: blur(4px))` | Solid background |
| `@layer` | `@supports (layer: tokens)` (limited) | Cascade still works, just no layer isolation |
| `clamp()` | `@supports (width: clamp(1px, 2px, 3px))` | Use media queries |
| `css variables` | `@supports (--test: 0)` | Not practical to fallback |
| `prefers-reduced-motion` | `@media (prefers-reduced-motion: reduce)` | Always animate (no harm) |

### JS Features

| Feature | Detection | Fallback |
|---------|------------|----------|
| `IntersectionObserver` | `'IntersectionObserver' in window` | Use scroll events (not provided) |
| `matchMedia` | `'matchMedia' in window` | Skip theme auto-detect |
| `localStorage` | `try/catch` test | Skip persistence |
| `ES Modules` | `type="module"` | Use bundler for older syntax |

## Accessibility: Reduced Motion

Vitra respects `prefers-reduced-motion` at multiple levels:

### CSS Level

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### JS Level

```javascript
// Particles respect reduced motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  console.warn('[Vitra] Reduced motion detected, skipping particles');
  return 0; // Don't spawn particles
}

// Reveal animations respect reduced motion
if (prefersReducedMotion) {
  element.style.opacity = '1';
  element.style.transform = 'none';
  return; // Skip animation
}
```

### Testing Reduced Motion

**Chrome/Edge:**
1. Open DevTools → Rendering tab
2. Check "Emulate CSS media feature prefers-reduced-motion"

**Firefox:**
1. About:config → `ui.prefersReducedMotion` → Set to `1`

**Safari:**
1. Settings → Accessibility → Reduce motion → Enable

## Browser-Specific Known Issues

### Safari (14-15.3)
- `@layer` not supported until 15.4
- **Workaround**: Cascade still works, layers just don't provide isolation
- Glass effects work fine with `-webkit-backdrop-filter`

### Firefox (87-96)
- `@layer` not supported until 97
- **Workaround**: Same as Safari, cascade works without layer isolation

### IE 11
- **Not supported**
- No CSS variables, no `@supports`, no ES modules
- **Recommendation**: Don't use Vitra for IE 11 projects

## Recommended `@supports` Patterns

### Pattern 1: Enhance Progressively

```css
/* Base (all browsers) */
.component {
  background: white;
  border: 1px solid #ddd;
}

/* Enhance if backdrop-filter works */
@supports (backdrop-filter: blur(4px)) {
  .component {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(4px);
  }
}
```

### Pattern 2: Feature-Gated Components

```css
/* Only apply if CSS Grid is supported */
@supports (display: grid) {
  .vitra-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Pattern 3: Combining Conditions

```css
/* Only apply if BOTH features are supported */
@supports (backdrop-filter: blur(4px)) and (--vitra-color-bg: 0) {
  .vitra-glass-enhanced {
    backdrop-filter: blur(10px);
  }
}
```

## Testing Checklist

Before deploying, test your Vitra-based project in:

- [ ] **Chrome Latest** (full features)
- [ ] **Firefox Latest** (full features)
- [ ] **Safari Latest** (full features)
- [ ] **Chrome 88** (minimum modern)
- [ ] **Firefox 87** (minimum modern)
- [ ] **Safari 14** (backdrop-filter works, no @layer)
- [ ] **With prefers-reduced-motion enabled** (accessibility)
- [ ] **Mobile browsers** (iOS Safari, Android Chrome)

## Polyfills & Fallbacks (Not Included)

Vitra does **not** include polyfills for:
- CSS @layer (not polyfillable)
- backdrop-filter (can't be polyfilled)
- CSS variables (not practical to polyfill)
- ES modules (use bundler like esbuild or webpack)

**For legacy support**, consider:
1. Using a bundler to transpile JS
2. Providing a "no-Vitra" fallback stylesheet
3. Setting expectations that modern browsers are required

## Summary

| Browser Category | Support Level | Key Fallbacks |
|------------------|---------------|---------------|
| Modern (Chrome 88+, FF 97+, Safari 15.4+) | ✅ Full | None needed |
| Compatible (Chrome 76+, FF 63+, Safari 12+) | ⚠️ Good | No @layer, solid bg for glass |
| Legacy (IE 11, old Android) | ❌ None | Not supported |

**Bottom line**: Vitra works best in modern browsers. For older browsers, features degrade gracefully but the experience may be simplified.
