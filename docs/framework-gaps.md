# Framework Gap Notes

Patterns found in `demo.css` and `index.html` that reveal missing framework utilities or components. Candidates for future Vitra CSS additions.

---

## Components

### Hero / Jumbotron

`demo.css` defines a fully custom hero pattern: `demo-hero`, `demo-hero-title`, `demo-hero-sub`, `demo-hero-badge`.

- Full-viewport section (`min-height: 85vh`) with flex centering
- Responsive fluid typography via `clamp()` on the title (`clamp(2.5rem, 8vw, 5rem)`)
- Spotlight cursor-tracking overlay via `data-spotlight` attribute + `::before` pseudo-element
- Stacked z-index layers for gradient-bg, glow-orb, and content

Framework has no hero/jumbotron pattern at all. Could add `.vitra-hero` as a component with modifier classes:
- `.vitra-hero--full` (85 vh) / `.vitra-hero--half` (50 vh)
- `.vitra-hero-title`, `.vitra-hero-sub`, `.vitra-hero-badge` for typography slots
- Spotlight behaviour could ship as a data-attribute enhancement in `Vitra.hero`

### Code Block / Pre

Quick Start section uses `.demo-qs-code-wrap` and `.demo-qs-code` to produce a dark-background code snippet with a copy button slot. A global bare `pre` rule is also set in demo.css (surface bg, border, monospace font).

Framework has no `.vitra-code` / `.vitra-pre` / `.vitra-code-block` component.

Suggested additions:
- `.vitra-pre` — styled `<pre>` using framework surface + border tokens, monospace stack, overflow-x scroll
- `.vitra-code-block` — wrapper with copy-button slot (flex row, relative position, accent-tinted dark background)
- `.vitra-inline-code` — inline `<code>` with accent-tinted background (mirrors `.demo-qs-inline-code`)

### Footer

Footer layout is entirely custom (`demo-footer`, `footer-grid`, `footer-brand`, `footer-tagline`, `footer-links`, `footer-bottom`).

- Three-column grid (`2fr 1fr 1fr`) collapsing to single column at 640 px
- Glassmorphism background (`backdrop-filter: blur`) with semi-transparent dark overlay
- Top border separator using translucent white

Framework has no footer component or semantic footer layout helpers. Could add:
- `.vitra-footer` — glass + dark overlay + top border
- `.vitra-footer-grid` — responsive three-column layout
- `.vitra-footer-brand`, `.vitra-footer-tagline`, `.vitra-footer-links` — content slots

---

## Utilities

### Navbar Overrides

`demo.css` applies several small overrides to `.vitra-navbar-actions` children:

```css
.vitra-navbar-actions .vitra-btn.vitra-btn-sm {
  padding: var(--vitra-space-1) var(--vitra-space-2);
  font-size: var(--vitra-font-size-xs);
  white-space: nowrap;
}
.vitra-navbar-actions .vitra-dropdown-menu {
  right: 0;
  left: auto;
}
```

These suggest the framework navbar lacks:
- A **compact/dense variant** — `.vitra-navbar--compact` or `data-density="compact"`
- **Right-aligned dropdown** positioning — a `.vitra-dropdown-menu--end` modifier
- Navbar action slots with pre-tuned button sizing

### Section Title / Description

`.demo-section-title` and `.demo-section-desc` appear before every demo section. They are identical across the entire page — a repeated pattern with no framework equivalent.

Suggested utilities:
- `.vitra-section-title` — `font-size: var(--vitra-font-size-3xl)`, tight `letter-spacing: -0.03em`, bottom margin
- `.vitra-section-desc` — constrained max-width (≈560 px), bottom margin, secondary text color implied by opacity/color

### Auto-Fit Grid

`.demo-grid` (and `.modern-grid`) use the same `repeat(auto-fit, minmax(280–300px, 1fr))` pattern with a `--vitra-space-4` gap. This appears in at least two distinct sections.

Suggested utility: `.vitra-grid-auto` with a `--vitra-grid-min` custom property for the minimum column width (defaulting to `280px`).

### Lift / Hover Card

`.component-showcase` and `.motion-demo-item` both implement a "lift on hover" pattern:

```css
transform: translateY(-2px); /* or -4px */
box-shadow: var(--vitra-shadow-medium); /* or shadow-elevated */
```

With hardcoded transition timing (`0.2s ease`, `0.3s ease`) instead of the framework's `--vitra-duration-*` / `--vitra-ease-*` tokens.

Suggested utility: `.vitra-lift` — hover lift effect using framework tokens. Could accept a data attribute or modifier for intensity (subtle vs elevated).

### Demo Controls Panel

`.demo-controls` and `.demo-label` describe a settings/controls panel pattern (surface card + uppercase label with tracking). Reusable in any interactive UI:
- `.vitra-panel` — surface background, border, rounded corners, standard padding
- `.vitra-label-uppercase` (or `.vitra-form-label`) — small caps, tracking, bold heading font

---

## CSS Variables Used in demo.css But Undefined in Framework Tokens

| Variable | Where used | Status | Notes |
|---|---|---|---|
| `--vitra-color-info-h` | `body` background gradient (2nd radial) | **Not defined** | Used with a fallback (`200`). Framework has `--vitra-color-accent-h` / `--vitra-color-success-h` etc. but no `info-h` hue. Add as a semantic hue token alongside the existing set. |
| `--spotlight-x` / `--spotlight-y` | `demo-hero[data-spotlight]::before` | Demo-local | Set via JS. Would need to be documented as a companion API if `vitra-hero` becomes a component. |
| `--swatch-border` | `.theme-swatch` | Demo-local | Inline override only; not a gap per se. |

**Tokens defined in framework that demo.css should already use (but uses hardcoded values instead):**

- `--vitra-ease-default`, `--vitra-ease-luxury`, `--vitra-ease-out` — all defined; demo uses `ease`, `cubic-bezier(0.23, 1, 0.32, 1)` inline
- `--vitra-duration-fast`, `--vitra-duration-normal` — defined; demo uses `0.2s`, `0.25s`, `0.3s` inline
- Consistent use of these tokens in framework components will reduce the need for demo overrides

---

## Notes

- Demo CSS correctly consumes `--vitra-*` tokens throughout (good hygiene). Missing tokens are the exception, not the rule.
- `--vitra-font-size-3xl`, `--vitra-shadow-medium`, `--vitra-shadow-elevated`, `--vitra-color-surface-hover`, and all ease/duration tokens **are** defined in the framework and available for use.
- The `@starting-style` popover/panel animations in `demo.css` are modern-CSS demos; no framework gap implied there.
- The container-query responsive table pattern (`@container (max-width: 500px)`) in `demo.css` is a strong candidate for the framework's table component — currently undocumented as a framework feature.
