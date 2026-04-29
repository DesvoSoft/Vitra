# Plan 01: Foundation Tokens

**Phase:** 1 - Tokens & Themes
**Status:** ○ Pending
**Created:** 2026-04-26

## Objective

Establish foundation layer with `@layer` cascade order and immutable CSS variables using `.vitra-` prefix.

## Requirements Covered

- ARCH-01: @layer cascade order: tokens, glass, layout, components, utilities
- ARCH-02: Prefijo consistente `.vitra-` en todas las clases
- ARCH-03: Tokens inmutables (colores, spacing, radius, shadows, typography, motion)

## Tasks

### Task 1: Define @layer cascade

- [ ] Define `@layer tokens, glass, layout, components, utilities` at top of file
- [ ] Wrap all rules in appropriate layers

### Task 2: Define core tokens

- [ ] Colors: background, surface, border, accent, text variants
- [ ] Spacing: base unit (8px), scale 1-12
- [ ] Radius: sm, md, lg, xl, full
- [ ] Shadows: subtle, medium, elevated, glow variants
- [ ] Typography: font family, sizes, weights, line heights
- [ ] Motion: ease curves, durations

## Files

- `src/01-tokens.css`

## Verification

- [ ] CSS @layer cascade order correct
- [ ] All tokens use `--vitra-` prefix
- [ ] No hardcoded values in components
- [ ] Tokens override correctly in themes

## Checklist

```
[ ] Task 1 complete
[ ] Task 2 complete
[ ] Verification passed
```