# Demo Site Improvements — Design Spec
Date: 2026-06-19  
Branch: `demo`

## Scope

Improve the Vitra CSS demo/marketing site (`index.html`, `demo.css`, `demo.js`). No changes to framework source (`dist/`).

---

## 1. Quick Start Section

**Location:** Between hero and `#cinematic` section.  
**Anchor:** `id="quick-start"`  
**Navbar:** Add "Get Started" link to desktop nav, mobile drawer, and footer.

### Content structure
1. Badge/eyebrow: "Get Started in 30 seconds"
2. Two-sentence intro: what Vitra is, zero deps, CSS + optional JS
3. CDN code block — CSS `<link>` + JS `<script>` — each with a copy button
4. Closing note: "That's it. No build step required." + link to `docs/integration.md`

### Copy button behavior
- JS in `demo.js`: click copies text to clipboard, button label briefly changes to "Copied!"
- Revert after 1.5s
- No external deps; use `navigator.clipboard.writeText`

---

## 2. Bug Fixes

| # | Location | Issue | Fix |
|---|----------|-------|-----|
| 1 | Hero subtitle (line 94) | Missing "with" and "to": `"cinematic effects, modern CSS APIs, obsessive attention detail"` | `"with cinematic effects, modern CSS APIs, and obsessive attention to detail."` |
| 2 | Navbar / drawer | No "Quick Start" link | Add after brand / before "Cinematic" |

---

## 3. Footer Redesign

**Remove:** Contact column entirely (Email Us, Support links).  
**Layout:** 3-column grid instead of 4 (Brand info + Framework links + Resources).  
**Improve:** Better visual balance — brand col wider, links cols equal width. Keep existing `footer-grid` class but adjust CSS in `demo.css`.

---

## 4. Particles Hero Behavior Improvement

**Current problem:** "Spawn Particles" button adds 15 more particles each click with no cleanup. Particles accumulate indefinitely (up to JS cap, but UX feels broken).

**Fix:** Toggle behavior — first click spawns, second click destroys, label updates accordingly. Or: always destroy existing hero particles first, then spawn fresh batch.

**Chosen approach:** Destroy-then-spawn on each click (simpler, predictable). Button label stays "Spawn Particles".

Implementation in `demo.js` inline script or `demo.js` file — call `Vitra.particles.destroy('.demo-hero')` before `Vitra.particles.spawn(...)`.

---

## 5. CSS Audit — Framework Gap Notes

Track demo-specific CSS that reveals missing framework utilities. Do not fix framework in this branch — record for backlog.

### Findings to note during implementation
- Navbar: uses many `demo-` prefixed overrides → framework `.vitra-navbar` may lack sufficient variant/density options
- Footer: layout fully custom → no framework grid/footer component
- Hero: `demo-hero`, `demo-hero-title`, `demo-hero-sub`, `demo-hero-badge` all custom → framework has no hero/jumbotron pattern
- Code blocks for CDN: will need custom styling → framework has no `.vitra-code` / `.vitra-pre` component

Record findings in `docs/framework-gaps.md` as a running list.

---

## Out of Scope

- Version bump (stays v1.6.0)
- Adding tokens/glass/motion to navbar
- Framework source changes
