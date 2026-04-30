---
phase: 03-particles-motion
plan: 01
subsystem: particles
tags: [particles, glow effects, emoji, css variables, performance limits, accessibility, prefers-reduced-motion]

# Dependency graph
requires:
  - phase: 01-tokens-themes
    provides: CSS custom properties (--vitra-*) and @layer tokens definition
  - phase: 02-glass-system
    provides: @layer glass definition and blur/surface tokens for consistency
provides:
  - .vitra-particle base class with configurable CSS variables
  - Glow effect variants (sm/md/lg) using --vitra-shadow-* tokens
  - .vitra-particles-emoji class with data-emoji attribute support
  - Performance limits via media queries (15 mobile / 40 desktop)
  - prefers-reduced-motion accessibility support
affects: [components, demo, motion engine]

# Tech tracking
tech-stack:
  added: []
  patterns: [particle system with @layer architecture, CSS variable configuration, emoji rendering via attr()]
patterns-established:
  - "Use @layer particles for all particle-related styles"
  - "Define --vitra-particle-* tokens in particles layer for configuration"
  - "Use --vitra-shadow-glow and --vitra-shadow-glow-strong tokens for glow effects"
  - "Use data-emoji attribute with attr() function for emoji particles"
  - "Set performance limits via media queries on --vitra-particle-count"

key-files:
  created:
    - src/03-particles.css - Particle system with base class, glow variants, emoji particles, and performance limits
  modified:
    - src/01-tokens.css - Added particles layer to @layer cascade order

key-decisions:
  - "Add particles layer between glass and layout in cascade order for proper styling priority"
  - "Use box-shadow with --vitra-shadow-glow and --vitra-shadow-glow-strong tokens for glow effects"
  - "Implement emoji particles via ::before pseudo-element with attr(data-emoji)"
  - "Set --vitra-particle-count via :root in media queries for performance limits"

requirements-completed: [PART-01, PART-02, PART-03, PART-04]

# Metrics
duration: 12min
completed: 2026-04-29
---

# Phase 3: Particle System Summary

**Configurable particle system with glow effects, emoji particles, and automatic performance limits via CSS variables and media queries**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-29T18:45:00-06:00
- **Completed:** 2026-04-29T18:57:00-06:00
- **Tasks:** 4
- **Files modified:** 2 (src/03-particles.css created, src/01-tokens.css modified)

## Accomplishments

- Implemented `.vitra-particle` base class with configurable CSS variables (--vitra-particle-count, --vitra-particle-color, --vitra-particle-size, --vitra-particle-speed, --vitra-particle-glow)
- Created glow effect variants (`.vitra-particle-glow-sm/md/lg`) and data-glow attribute support using `--vitra-shadow-glow` and `--vitra-shadow-glow-strong` tokens
- Added `.vitra-particles-emoji` class with `data-emoji` attribute support via `attr()` function and random/preset positioning
- Implemented performance limits: 15 particles on mobile (max-width: 768px), 40 particles on desktop (min-width: 769px)
- Added `prefers-reduced-motion` media query to disable animations and glow effects for accessibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Define CSS particle base** - `eaa4414` (feat)
2. **Task 2: Implement glow effects** - `a3cd21b` (feat)
3. **Task 3: Add emoji particles** - `1f7e5cf` (feat)
4. **Task 4: Set performance limits** - `ea38285` (feat)
5. **Prerequisite: Add particles layer to cascade** - `a62e3e0` (chore)
6. **Fix: Use token values for glow effects** - `248047b` (fix)

**Plan metadata:** Will be committed separately (docs: complete plan)

_Note: Task 2 required a follow-up fix commit to use correct --vitra-shadow-* token values per plan requirements._

## Files Created/Modified

- `src/03-particles.css` - Particle system with @layer particles wrapper, base class, glow variants, emoji particles, performance limits, and accessibility support
- `src/01-tokens.css` - Added "particles" layer to @layer cascade order (tokens → glass → particles → layout → components → utilities)

## Decisions Made

- Add particles layer between glass and layout in cascade order for proper styling priority
- Use `box-shadow` with `--vitra-shadow-glow` and `--vitra-shadow-glow-strong` tokens for glow effects (not hardcoded values)
- Implement emoji particles via `::before` pseudo-element with `attr(data-emoji)` for semantic markup
- Set `--vitra-particle-count` via `:root` in media queries to allow JS/runtime overrides
- Use `!important` in `prefers-reduced-motion` to ensure animations are disabled regardless of inline styles

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Incorrect glow effect implementation not using token values**
- **Found during:** Task 2 (Implement glow effects)
- **Issue:** Initially used hardcoded `box-shadow` values (0 0 5px, etc.) instead of token values as specified in plan: "Use `box-shadow` with token values"
- **Fix:** Updated glow variants to use `--vitra-shadow-glow` and `--vitra-shadow-glow-strong` tokens
- **Files modified:** src/03-particles.css
- **Committed in:** 248047b (fix commit after Task 2)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Fix was necessary to match plan requirement for using token values. No scope creep - change aligns with specified token usage.

## Issues Encountered

None - all tasks completed as planned after auto-fix for token value usage in glow effects.

## Next Phase Readiness

- Particle system foundation complete with base class, glow variants, emoji support, and performance limits
- Ready for Phase 3 Plan 02 (Motion Engine) which can use particle animations as reference
- CSS variable system working correctly across layers (tokens → glass → particles)
- Accessibility support (prefers-reduced-motion) established for future animation work

---
*Phase: 03-particles-motion*
*Completed: 2026-04-29*

## Self-Check: PASSED

All verification checks passed:
- ✅ `src/03-particles.css` - FOUND
- ✅ `src/01-tokens.css` - FOUND (modified)
- ✅ Commit `eaa4414` (Task 1) - FOUND in git log
- ✅ Commit `a3cd21b` (Task 2) - FOUND in git log
- ✅ Commit `1f7e5cf` (Task 3) - FOUND in git log
- ✅ Commit `ea38285` (Task 4) - FOUND in git log
- ✅ Commit `a62e3e0` (prerequisite) - FOUND in git log
- ✅ Commit `248047b` (fix) - FOUND in git log
- ✅ `.planning/phases/03-particles-motion/03-01-SUMMARY.md` - CREATED
