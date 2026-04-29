# Plan 02: Theme System

**Phase:** 1 - Tokens & Themes
**Status:** ○ Pending
**Created:** 2026-04-26

## Objective

Implement 6 preset themes with full token override, toggle via data-theme, auto-detect preferences, and localStorage persistence.

## Requirements Covered

- THEM-01: 6 themes predefinidos (default, light, dark, pastel, neon, earth, mono, midnight)
- THEM-02: Toggle via data-theme attribute
- THEM-03: Auto-detección via prefers-color-scheme
- THEM-04: Persistencia opcional con localStorage

## Tasks

### Task 1: Define theme toggle

- [ ] Create data-theme attribute selectors
- [ ] document.documentElement.dataset.theme = "theme-name"
- [ ] <html data-theme="theme-name"> markup support

### Task 2: Implement 6 preset themes

- [ ] default: neutral base tokens
- [ ] light: light backgrounds, dark text
- [ ] dark: dark backgrounds, light text
- [ ] pastel: soft muted colors
- [ ] neon: bright glowing accents
- [ ] earth: warm natural tones
- [ ] mono: grayscale only
- [ ] midnight: deep blue-purple

### Task 3: Add auto-detect and persistence

- [ ] prefers-color-scheme media query
- [ ] data-theme="auto" for system detection
- [ ] localStorage for user preference
- [ ] JS fallback if no localStorage

## Files

- `src/00-themes.css`

## Verification

- [ ] All 8 themes render correctly
- [ ] Theme switch updates all tokens
- [ ] Auto-detect works on page load
- [ ] localStorage persists across sessions

## Checklist

```
[ ] Task 1 complete
[ ] Task 2 complete
[ ] Task 3 complete
[ ] Verification passed
```