# Vitra CSS Framework - Audit & Improvements Plan

## Visual & Layout Issues
- **Padding/Margin Exuberance**: Some components have excessive default padding that makes them look "chunky" rather than "elegant". Need to refine `06-components.css`.
- **Link Decoration**: Links are still using browser defaults in some cases. Need to enforce a "no-decoration" policy with elegant hover states.
- **Section Spacing**: Demo sections lack consistent vertical margins, leading to a "cramped" feel in certain screen sizes.

## Functional Issues
- **Theme Toggle Logic**: The current `toggle()` function in `vitra.js` is too simple (only Light/Dark). It needs to handle a multi-theme environment gracefully.
- **Theme Persistence**: Ensure `localStorage` is correctly synced with the attribute on `html`.

## Proposed Improvements
1. **Multi-Theme Support**: Recover and professionalize "Mockup Themes" (Pastel, Neon, Deep Ocean) to allow rapid prototyping.
2. **Typography Refinement**: Increase letter-spacing slightly for headings to achieve a more "Luxury" look.
3. **Global Link Styles**: Reset all `<a>` tags to `text-decoration: none` and add a subtle bottom-border or color shift on hover.
4. **Spacing Tokens Audit**: Review if 8px grid is being followed strictly or if there are ad-hoc values causing the "padding excess".

## To-Do List
- [x] Refine `src/00-themes.css` with 5 professional themes.
- [x] Update `src/vitra.js` toggle logic to support cycling or smart switching.
- [x] Fix global link styles in `src/01-tokens.css`.
- [x] Adjust component paddings in `src/06-components.css`.
- [x] Clean up `index.html` layout and demo-specific CSS.
- [x] Implement missing Navbar and Drawer components in framework.
