---
phase: 1
plan: 01
subsystem: tokens
tags: [foundation, tokens, layers, css-variables]
dependency-graph:
  requires: []
  provides: [tokens-layer, vitra-prefix, design-tokens]
  affects: [glass, layout, components, utilities]
tech-stack:
  added: [css-@layer, css-custom-properties]
  patterns: [@layer cascade, immutable tokens, --vitra- prefix]
key-files:
  created: [src/01-tokens.css]
  modified: []
decisions:
  - id: tokens-layer-structure
    summary: "Use @layer tokens, glass, layout, components, utilities cascade order"
  - id: vitra-prefix
    summary: "All tokens use --vitra- prefix to avoid collisions"
  - id: immutable-tokens
    summary: "Tokens defined once in tokens layer, overridden only in themes"
metrics:
  duration: 0.8 minutes
  completed-date: 2026-04-29
---

# Phase 1 Plan 01: Foundation Tokens Summary

## One-liner

Established CSS foundation with `@layer` cascade order and 65 immutable design tokens using `.vitra-` prefix for the Vitra CSS framework.

## Objective

Establish foundation layer with `@layer` cascade order and immutable CSS variables using `.vitra-` prefix.

## Requirements Covered

- **ARCH-01**: @layer cascade order: tokens, glass, layout, components, utilities ✓
- **ARCH-02**: Prefijo consistente `.vitra-` en todas las clases ✓
- **ARCH-03**: Tokens inmutables (colores, spacing, radius, shadows, typography, motion) ✓

## Tasks Completed

| Task | Name | Commit | Status |
|------|------|--------|--------|
| 1 | Define @layer cascade | 09476fc | ✓ Complete |
| 2 | Define core tokens | dc011af | ✓ Complete |

## What Was Built

### Task 1: Define @layer cascade
- Created `src/01-tokens.css` with `@layer tokens, glass, layout, components, utilities` declaration
- Established proper cascade order for the framework
- Set up tokens layer block structure

### Task 2: Define core tokens
Implemented 65 immutable design tokens with `--vitra-` prefix:

**Colors (15 tokens):**
- Background: `--vitra-color-bg: #0f0f14`
- Surface variants: surface, surface-hover, surface-active with rgba values
- Border: border, border-hover
- Accent: accent, accent-hover, accent-active with indigo palette
- Text: primary, secondary, tertiary, inverse
- Semantic: success (green), warning (amber), error (red), info (blue)

**Spacing (12 tokens):**
- Base unit: 8px (0.5rem)
- Scale: `--vitra-space-1` through `--vitra-space-12` (0.5rem to 6rem)

**Radius (5 tokens):**
- `--vitra-radius-sm`: 4px
- `--vitra-radius-md`: 8px
- `--vitra-radius-lg`: 12px
- `--vitra-radius-xl`: 16px
- `--vitra-radius-full`: 9999px

**Shadows (5 tokens):**
- `--vitra-shadow-subtle`: Light drop shadow
- `--vitra-shadow-medium`: Medium elevation
- `--vitra-shadow-elevated`: High elevation
- `--vitra-shadow-glow`: Accent color glow (30% opacity)
- `--vitra-shadow-glow-strong`: Strong accent glow (50% opacity)

**Typography (15 tokens):**
- Font families: system sans-serif and monospace stack
- Sizes: xs (12px) through 4xl (36px)
- Weights: normal, medium, semibold, bold
- Line heights: tight, normal, relaxed

**Motion (8 tokens):**
- Easing curves: default, in, out, in-out (cubic-bezier)
- Durations: fast (150ms), normal (250ms), slow (350ms), slower (500ms)

## Verification Results

- [x] **CSS @layer cascade order correct**: Verified `@layer tokens, glass, layout, components, utilities` at line 6
- [x] **All tokens use `--vitra-` prefix**: 65 tokens verified with `--vitra-` prefix
- [x] **No hardcoded values in components**: No components exist yet (will be verified in Phase 5)
- [ ] **Tokens override correctly in themes**: Pending Phase 1 Plan 02 (Theme System)

## Deviations from Plan

None - plan executed exactly as written.

## Auth Gates

None encountered.

## Known Stubs

None.

## Threat Flags

None.

## Decisions Made

1. **Layer Cascade Order**: Used `tokens, glass, layout, components, utilities` as defined in ARCH-01
2. **Token Prefix**: All tokens use `--vitra-` prefix for consistency and collision avoidance
3. **Immutable Token Strategy**: Tokens defined once in tokens layer; theme overrides will use the same properties in theme layer
4. **Spacing Scale**: Used 8px base unit with 12-step scale (0.5rem to 6rem) for flexibility
5. **Color Strategy**: Dark theme defaults with rgba for surface/border tokens to support glassmorphism effects

## Self-Check: PASSED

- [x] Created file exists: `src/01-tokens.css` (95 lines)
- [x] Commit 09476fc exists: "feat(01-01): define @layer cascade order"
- [x] Commit dc011af exists: "feat(01-01): define core design tokens"
- [x] All 65 tokens use `--vitra-` prefix
- [x] @layer declaration present and correct
- [x] Tokens organized in logical groups (colors, spacing, radius, shadows, typography, motion)
