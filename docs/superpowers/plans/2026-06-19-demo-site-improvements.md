# Demo Site Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Quick Start section, fix bugs, redesign footer, improve hero particles, and audit demo-specific CSS for framework gaps.

**Architecture:** All changes confined to `index.html`, `demo.css`, `demo.js`. No changes to `dist/`. The Quick Start section follows existing page section pattern (`id`, `vitra-reveal`, `demo-section`). Copy button logic added to `demo.js`. Footer redesigned to 3-column layout.

**Tech Stack:** Vanilla HTML/CSS/JS, Vitra CSS framework (v1.6.0 CDN), `navigator.clipboard` API.

## Global Constraints

- All demo-specific classes prefixed `demo-` — never add to `vitra-*` namespace
- Framework CSS lives in `dist/` — never modify it in this branch
- CDN URLs must stay `https://cdn.jsdelivr.net/gh/DesvoSoft/Vitra@v1.6.0/dist/vitra.min.{css,js}`
- No external JS dependencies
- All new JS goes inside the existing IIFE in `demo.js`
- Console log pattern: `[Demo]` prefix if needed

---

### Task 1: Fix Hero Subtitle Text Bug

**Files:**
- Modify: `index.html:94`

**Interfaces:**
- Produces: nothing (text fix only)

- [ ] **Step 1: Fix the subtitle text**

In `index.html` line 94, change:
```html
A premium glassmorphism framework cinematic effects, modern CSS APIs, obsessive attention detail.
```
to:
```html
A premium glassmorphism framework with cinematic effects, modern CSS APIs, and obsessive attention to detail.
```

- [ ] **Step 2: Verify visually**

Open `index.html` in browser (`npm run dev`). Confirm hero subtitle reads correctly.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "fix: hero subtitle missing words"
```

---

### Task 2: Quick Start Section — HTML

**Files:**
- Modify: `index.html` — add section after line 108 (after closing `</section>` of hero), add navbar links

**Interfaces:**
- Produces: `#quick-start` anchor, `.demo-qs-code` elements with `data-copy` attributes consumed by Task 3

- [ ] **Step 1: Add navbar link (desktop)**

In `index.html` inside `.vitra-navbar-links` div (around line 28), add before the Cinematic link:
```html
<a href="#quick-start" class="vitra-navbar-link">Get Started</a>
```

- [ ] **Step 2: Add mobile drawer link**

In `index.html` inside the drawer `<nav>` (around line 68), add before the Cinematic link:
```html
<a href="#quick-start" class="vitra-navbar-link">Get Started</a>
```

- [ ] **Step 3: Add Quick Start section**

After the hero closing `</section>` (line 108), insert:
```html
<!-- ============================================================
  QUICK START
  ============================================================ -->
<section id="quick-start" class="demo-section vitra-reveal">
  <div class="vitra-container">
    <span class="vitra-badge vitra-badge-primary demo-qs-eyebrow">Get Started in 30 seconds</span>
    <h2 class="demo-section-title vitra-mt-4">Drop in. No build step.</h2>
    <p class="demo-section-desc vitra-text-secondary">
      Vitra CSS is a zero-dependency glassmorphism framework. Paste two lines into your HTML and you're done — CSS handles effects, JS adds interactivity.
    </p>

    <div class="demo-qs-block">
      <div class="demo-qs-label">1. Add the stylesheet</div>
      <div class="demo-qs-code-wrap">
        <pre class="demo-qs-code" data-copy='&lt;link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/DesvoSoft/Vitra@v1.6.0/dist/vitra.min.css" crossorigin="anonymous"&gt;'><code>&lt;link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/DesvoSoft/Vitra@v1.6.0/dist/vitra.min.css" crossorigin="anonymous"&gt;</code></pre>
        <button class="demo-qs-copy vitra-btn vitra-btn-ghost vitra-btn-sm" data-copy-target="css">Copy</button>
      </div>
    </div>

    <div class="demo-qs-block">
      <div class="demo-qs-label">2. Add the script (optional — needed for modals, tooltips, particles)</div>
      <div class="demo-qs-code-wrap">
        <pre class="demo-qs-code" data-copy='&lt;script src="https://cdn.jsdelivr.net/gh/DesvoSoft/Vitra@v1.6.0/dist/vitra.min.js" crossorigin="anonymous"&gt;&lt;/script&gt;'><code>&lt;script src="https://cdn.jsdelivr.net/gh/DesvoSoft/Vitra@v1.6.0/dist/vitra.min.js" crossorigin="anonymous"&gt;&lt;/script&gt;</code></pre>
        <button class="demo-qs-copy vitra-btn vitra-btn-ghost vitra-btn-sm" data-copy-target="js">Copy</button>
      </div>
    </div>

    <p class="demo-qs-note vitra-text-secondary">
      That's it. Start using <code class="demo-qs-inline-code">.vitra-*</code> classes immediately.
      <a href="docs/integration.md" class="vitra-link">Full integration guide →</a>
    </p>
  </div>
</section>
```

- [ ] **Step 4: Update footer Resources list**

In the footer Resources `<ul>` (around line 971), add Quick Start link as first item:
```html
<li><a href="#quick-start">Quick Start</a></li>
```

- [ ] **Step 5: Verify structure**

Open browser. Confirm "Get Started" appears in navbar, section renders below hero, scroll works.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: add quick start section with CDN snippets"
```

---

### Task 3: Quick Start Copy Button Logic — JS

**Files:**
- Modify: `demo.js` — add `initQuickStartCopy()` function, call it from `initDemo()`

**Interfaces:**
- Consumes: `.demo-qs-copy` buttons with `data-copy-target` attribute, `.demo-qs-code` `pre` elements with `data-copy` attribute (from Task 2)
- Produces: `window` clipboard write on click

- [ ] **Step 1: Add `initQuickStartCopy` function**

Inside the IIFE in `demo.js`, after `initProgressRing` function (before the closing `})();`), add:

```js
// ==================== Quick Start Copy ====================
function initQuickStartCopy() {
  var copyBtns = document.querySelectorAll('.demo-qs-copy');
  copyBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = this.getAttribute('data-copy-target');
      var pre = document.querySelector('.demo-qs-code[data-copy-target="' + target + '"]');
      // fall back: grab data-copy attr from sibling pre
      var wrap = this.closest('.demo-qs-code-wrap');
      var codePre = wrap ? wrap.querySelector('.demo-qs-code') : null;
      var text = codePre ? codePre.getAttribute('data-copy') : '';
      if (!text || !navigator.clipboard) return;
      var self = this;
      navigator.clipboard.writeText(text).then(function () {
        self.textContent = 'Copied!';
        setTimeout(function () { self.textContent = 'Copy'; }, 1500);
      });
    });
  });
}
```

- [ ] **Step 2: Call it from `initDemo`**

In the `initDemo()` function body, add after `initProgressRing()`:
```js
initQuickStartCopy();
```

- [ ] **Step 3: Verify in browser**

Click each copy button. Confirm label changes to "Copied!" then reverts. Paste into a text editor to confirm correct CDN string copied.

- [ ] **Step 4: Commit**

```bash
git add demo.js
git commit -m "feat: copy button for quick start CDN snippets"
```

---

### Task 4: Quick Start CSS

**Files:**
- Modify: `demo.css` — add Quick Start styles before the Footer section

**Interfaces:**
- Consumes: `.demo-qs-*` classes from Task 2 HTML

- [ ] **Step 1: Add styles**

In `demo.css`, before the `/* Footer */` comment block, add:

```css
/* ============================================
   Quick Start
   ============================================ */

.demo-qs-eyebrow {
  margin-bottom: var(--vitra-space-4);
  display: inline-block;
}

.demo-qs-block {
  margin-bottom: var(--vitra-space-6);
}

.demo-qs-label {
  font-size: var(--vitra-font-size-sm);
  color: var(--vitra-color-text-secondary);
  margin-bottom: var(--vitra-space-2);
  font-weight: 500;
}

.demo-qs-code-wrap {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--vitra-space-3);
  background: hsla(var(--vitra-color-accent-h), 20%, 8%, 0.8);
  border: 1px solid var(--vitra-color-border);
  border-radius: var(--vitra-radius-md);
  padding: var(--vitra-space-3) var(--vitra-space-4);
}

.demo-qs-code {
  flex: 1;
  margin: 0;
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  font-size: 0.8rem;
  color: var(--vitra-color-accent);
  white-space: pre;
  overflow-x: auto;
  background: none;
  border: none;
  padding: 0;
}

.demo-qs-code code {
  background: none;
  padding: 0;
  font-size: inherit;
  color: inherit;
}

.demo-qs-copy {
  flex-shrink: 0;
  min-width: 64px;
}

.demo-qs-note {
  font-size: var(--vitra-font-size-sm);
  margin-top: var(--vitra-space-2);
}

.demo-qs-inline-code {
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  font-size: 0.85em;
  background: hsla(var(--vitra-color-accent-h), 60%, 60%, 0.12);
  padding: 0.1em 0.4em;
  border-radius: var(--vitra-radius-sm);
  color: var(--vitra-color-accent);
}
```

- [ ] **Step 2: Verify visual**

Open browser. Confirm code blocks render with monospace font, copy button aligns right, section looks consistent with rest of page.

- [ ] **Step 3: Commit**

```bash
git add demo.css
git commit -m "style: quick start section styles"
```

---

### Task 5: Footer Redesign

**Files:**
- Modify: `index.html` — footer section (lines ~951–990)
- Modify: `demo.css` — footer grid styles

**Interfaces:**
- Produces: 3-column footer layout

- [ ] **Step 1: Replace footer HTML**

Replace the entire `<footer>` block in `index.html` with:

```html
<footer class="demo-footer">
  <div class="vitra-container">
    <div class="footer-grid">
      <div class="footer-info">
        <div class="footer-brand vitra-text-gradient">Vitra CSS</div>
        <p class="footer-tagline">
          A high-end glassmorphism framework for modern web experiences. Engineered for performance and elegance.
        </p>
        <a href="https://github.com/DesvoSoft/Vitra" class="vitra-btn vitra-btn-glass vitra-btn-sm footer-github-btn" target="_blank" rel="noopener">
          GitHub →
        </a>
      </div>
      <div class="footer-links">
        <h4>Framework</h4>
        <ul>
          <li><a href="#quick-start">Quick Start</a></li>
          <li><a href="#cinematic">Cinematic</a></li>
          <li><a href="#themes">Themes</a></li>
          <li><a href="#modern-css">Modern CSS</a></li>
          <li><a href="#shaders">Shaders</a></li>
          <li><a href="#components">Components</a></li>
        </ul>
      </div>
      <div class="footer-links">
        <h4>Resources</h4>
        <ul>
          <li><a href="docs/integration.md">Integration Guide</a></li>
          <li><a href="docs/themes.md">Themes Guide</a></li>
          <li><a href="https://github.com/DesvoSoft/Vitra" target="_blank" rel="noopener">GitHub</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2025 DesvoSoft — Vitra CSS v1.6.0</span>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Update footer CSS grid**

In `demo.css`, find `.footer-grid` and replace its rule with:

```css
.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--vitra-space-8);
  margin-bottom: var(--vitra-space-8);
}

@media (max-width: 640px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: var(--vitra-space-6);
  }
}
```

- [ ] **Step 3: Add footer tagline + github btn styles**

In `demo.css`, after `.footer-brand` rule block, add:

```css
.footer-tagline {
  opacity: 0.6;
  font-size: 0.9rem;
  max-width: 320px;
  margin-bottom: var(--vitra-space-4);
  line-height: 1.6;
}

.footer-github-btn {
  display: inline-flex;
}
```

- [ ] **Step 4: Verify**

Open browser. Confirm 3-column footer, Contact column gone, GitHub button visible, mobile collapses to 1 column.

- [ ] **Step 5: Commit**

```bash
git add index.html demo.css
git commit -m "redesign: footer to 3-column layout, remove contact section"
```

---

### Task 6: Hero Particle Button — Destroy-then-Spawn

**Files:**
- Modify: `index.html:103` — hero spawn button onclick

**Interfaces:**
- Consumes: `Vitra.particles.destroy(selector)`, `Vitra.particles.spawn(count, options)`

- [ ] **Step 1: Update hero button onclick**

In `index.html` line 103, replace:
```html
<button class="vitra-btn vitra-btn-ghost vitra-btn-lg" onclick="Vitra.particles.spawn(15, {container: '.demo-hero'})">
```
with:
```html
<button class="vitra-btn vitra-btn-ghost vitra-btn-lg" onclick="spawnHeroParticles(this)">
```

- [ ] **Step 2: Add `spawnHeroParticles` to `demo.js`**

Inside the IIFE in `demo.js`, after `initQuickStartCopy` (before closing `})();`), add:

```js
// ==================== Hero Particles ====================
window.spawnHeroParticles = function (btn) {
  Vitra.particles.destroy('.demo-hero');
  var spawned = Vitra.particles.spawn(15, { container: '.demo-hero' });
  if (spawned > 0 && btn) {
    btn.textContent = 'Particles!';
    setTimeout(function () { btn.textContent = 'Spawn Particles'; }, 1800);
  }
};
```

- [ ] **Step 3: Verify**

Open browser hero. Click "Spawn Particles" repeatedly — confirm particles reset cleanly each click, no accumulation. Button label briefly changes.

- [ ] **Step 4: Commit**

```bash
git add index.html demo.js
git commit -m "fix: hero spawn particles destroys previous batch before spawning"
```

---

### Task 7: CSS Audit — Framework Gap Notes

**Files:**
- Create: `docs/framework-gaps.md`

**Interfaces:**
- Produces: reference doc for framework improvement backlog

- [ ] **Step 1: Audit demo.css for patterns missing from framework**

Read through `demo.css` and `index.html` and identify classes that exist only in demo layer but would benefit as framework utilities or components.

- [ ] **Step 2: Write gap doc**

Create `docs/framework-gaps.md`:

```markdown
# Framework Gap Notes

Patterns found in `demo.css` / `index.html` that reveal missing framework utilities or components. Candidates for future Vitra CSS additions.

## Components

### Hero / Jumbotron
- `demo-hero`, `demo-hero-title`, `demo-hero-sub`, `demo-hero-badge` are all custom
- Framework has no hero/jumbotron pattern
- Could add `.vitra-hero` with glass + gradient-bg + glow-orb layout built in

### Code Block
- Quick Start section uses fully custom `.demo-qs-code-wrap`, `.demo-qs-code` styles
- Framework has no `.vitra-code` / `.vitra-pre` component
- Copy button pattern also missing — common enough to warrant a framework utility

### Footer
- Layout fully custom (`footer-grid`, `footer-info`, `footer-links`, `footer-tagline`)
- Framework has no footer component or semantic layout helpers

## Utilities

### Navbar
- Desktop navbar uses many small `demo-` overrides to achieve visual polish
- `.vitra-navbar` lacks density/variant options (compact, bordered, etc.)
- Navbar brand sizing, link spacing, action slot — all demo-overridden

### Text
- `demo-section-title`, `demo-section-desc` are repeated across every section
- Could be `.vitra-section-title` / `.vitra-section-desc` utilities

### Grid
- `demo-grid` (auto-fit minmax 280px) used repeatedly — fits as a framework utility `.vitra-grid-auto`

## CSS Variables Used But Undefined in Framework
- `--vitra-font-size-3xl` used via fallback `var(--vitra-font-size-3xl, 2rem)` — may not be defined
- `--vitra-info-h` used in `demo.css` body gradient — not in framework tokens

## Notes
- Most demo custom CSS correctly consumes `--vitra-*` tokens (good hygiene)
- Animations and transitions use hardcoded values instead of `--vitra-ease-*` or `--vitra-duration-*` — framework could expose these
```

- [ ] **Step 3: Commit**

```bash
git add docs/framework-gaps.md
git commit -m "docs: framework gap notes from demo CSS audit"
```

---

### Task 8: Final QA Pass

**Files:** None modified — verification only

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Check list**
  - Hero subtitle text correct
  - "Get Started" in navbar and mobile drawer
  - Quick Start section renders below hero with correct CDN text
  - Copy buttons work (CSS and JS lines)
  - Footer is 3-column, no Contact section, GitHub button present
  - Hero "Spawn Particles" resets correctly on each click
  - All existing sections still render correctly (no regressions)
  - Mobile drawer closes on link click (existing behavior preserved)

- [ ] **Step 3: Commit final**

```bash
git add -A
git commit -m "chore: final QA pass — demo site improvements complete"
```
