# Hero + Scenery "Alpenglow" Redesign — Design Spec

**Date:** 2026-07-17
**Scope:** Framework scenery system (`src/09-scenery.css`, main repo) + demo hero (demo branch worktree)
**Direction chosen:** "Alpenglow — la última luz" (option A of three mockups, validated visually by user via brainstorm companion; full moon variant, parallax preserved)

## Problem

Current scenery/hero is technically strong (seamless loops, compositor-only animation) but reads generic:

1. Moon/halo disc collides with the headline (63%/34% overlaps "CSS").
2. Halo is a flat featureless disc.
3. Entire scene is monochrome accent hue — no color tension.
4. Light source doesn't interact with the scene (no rim light, no lit clouds).
5. Clouds render as dark ellipse smudges over the star field.
6. Uniform mist band on every ridge top reads as an artifact strip.
7. Hero typography: accent-on-accent animated gradient text, badge-title-sub-two-buttons template, mouse-follow spotlight cliché.

## Vision

Dusk alpenglow: a warm band of last sunlight dying behind the ridges, cool starry zenith above, full moon risen opposite. The light **touches** the scene — warm rim light on ridge crests, valley mist pools, thin clouds lit from below. Typography goes near-white and static; the single strong warm element in the UI is the primary CTA.

## Section 1 — Framework scenery (`src/09-scenery.css`)

**User markup unchanged.** Same 8 child divs. All additions live in pseudo-elements and tokens. Non-breaking visual upgrade → minor version bump (v1.11.0).

### New tokens

| Token | Default | Purpose |
|---|---|---|
| `--vitra-scenery-warm-h` | `calc(var(--vitra-scenery-hue) - 140)` | Warm complementary hue; every theme derives its own harmonic sunset; manually overridable |
| `--vitra-scenery-glow-x` | `38%` | Horizontal position of the afterglow (where the sun set) |
| `--vitra-scenery-halo-x` / `--vitra-scenery-halo-y` | `76%` / `13%` | Moon position; heroes can recompose without custom CSS |

### Per-layer changes

1. **Sky** — add alpenglow band: warm radial dying at the horizon at `glow-x`, cooler/darker zenith. Existing star-drift and shooting-star pseudos unchanged.
2. **Halo → full moon** — subtle surface texture (2–3 radial-gradient "maria"), neutral-warm glow. Default position upper-right third, clear of headlines. New optional modifier `.vitra-scenery-halo-crescent` (crescent via inset box-shadow).
3. **Ridges — rim light** — each ridge div becomes an unmasked container; silhouette paints in its `::after` (current mask + gradient), warm rim light in its `::before` (same mask, `translateY(-3px)`, warm→transparent gradient). Drift animation stays on the parent div, so both pseudos travel glued to it: **parallax intact, rim never detaches.** Zero new animations. Uniform top mist bands removed (replaced by rim + valley mist).
4. **Valley mist** — soft light pools on `grain::before` (static, in front of ridges — physically correct atmosphere).
5. **Clouds** — new mask: thin horizontal wisps; gradient lit from below (warm in dark themes). Replaces ellipse blobs.
6. **Theme adaptation** — dark-scheme themes (dark, neon, ocean, emerald): dusk; star field stays gated to dark/neon/ocean as today. light/pastel: golden-hour day (halo reads as sun, stronger warm band, no stars). `auto` follows system scheme as today.
7. **Perf/a11y** — every addition is a static gradient or rides existing transforms; compositor-only preserved. `prefers-reduced-motion` blocks and no-mask `@supports` fallbacks maintained (rim hidden without mask support; gradient bands remain).

## Section 2 — Demo hero (demo branch)

1. **Overline replaces badge pill**: `VITRA · CSS FRAMEWORK · v1.10.x`, letterspaced micro-type, warm tint.
2. **Title**: "Vitra CSS" solid near-white, static; subtle warm gradient only on "CSS". Animated gradient-shift removed.
3. **Sub**: one line — "Cinematic glassmorphism. Zero dependencies, pure CSS."
4. **CTAs**: primary solid warm (from warm token — the single strong warm UI element), secondary ghost.
5. **Mouse-follow spotlight removed** — competes with scene light.
6. **Particles**: kept behind near ridge, warm firefly tint, ~12 count.
7. **Moon**: positioned via `halo-x/y` tokens; clear of headline at all breakpoints; smaller and higher on mobile.
8. **Scroll cue**: minimal fading chevron at hero bottom.
9. **#scenery showcase**: inherits framework changes; add full/crescent moon toggle next to speed buttons.

## Out of scope

- Other demo sections, docs site, new themes.
- JS changes (scenery is CSS-only; particle color via CSS token).

## Constraints

- All classes `.vitra-`, tokens `--vitra-`; colors derived from accent via `calc()` — token-driven theming untouched.
- `dist/` rebuilt and committed per release flow; demo pins jsDelivr by tag → framework tag pushed before demo CDN bump (release ritual).
- Commits: conventional format, no AI attribution, registered git credentials.

## Validation

- No test framework: visual validation via `index.html` demo across all 7 themes (light, dark, auto, pastel, neon, ocean, emerald — per `VALID_THEMES` in `src/vitra.js`; note project CLAUDE.md's theme list is outdated), plus `prefers-reduced-motion` and no-mask fallback checks.
- Headless-browser screenshots per theme for before/after comparison.
