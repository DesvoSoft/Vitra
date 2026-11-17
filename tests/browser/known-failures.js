// Test ids that are known to fail until their fix lands. Each id passed to
// expectedFail() that is in this set marks the test as test.fail(), so a fix
// turns it into an "unexpected pass" and forces the id to be removed here.
// Ids are audit findings (docs/AUDIT-2026-11-16.md: C#, J#) or K-<component>-<aspect>
// for failures of the component contract the audit does not list.
export default new Set([
  // Audit findings (pending)
  'C6', // toggle row is 26px high, contract wants 44px
  'C12-modal', // mobile: modal close button is 40px
  'C12-radio', // mobile: radio row is 26px high
  'C12-tabs', // mobile: .vitra-tabs is nowrap with visible overflow instead of scrolling
  'J6', // dropdown: no keyboard navigation (first item focus, arrows, Home, End)
  'J7', // modal: no focus without focusables, overflow/role not kept, focus timer not cancelled, trap list stale
  'J8', // toast: no role/aria-live, no warning class, no close button
  'J9', // drawer: no Vitra.drawer module (open, inert, focus, Esc, overlay)
  'J13', // tooltip: no Esc, replaces aria-describedby, long tooltip overflows 360px

  // Component contract failures with no audit finding of their own
  'K-alert-contrast', // alert dismiss button text below 4.5:1 in light-family themes
  'K-alert-touch', // alert dismiss button is 24x31
  'K-badge-overflow', // long badge text widens the page at 360px
  'K-button-contrast', // gradient button text 4.45:1 in light and auto+light
  'K-button-touch', // .vitra-btn-sm is 35px high
  'K-checkbox-overflow', // long checkbox label widens the page at 360px
  'K-checkbox-touch', // checkbox label rows are 26px high
  'K-drawer-contrast', // active drawer link 4.40:1 in light and auto+light
  'K-input-border', // input and select borders are 1.1-1.3:1, contract wants 3:1
  'K-input-placeholder', // placeholder text is 3.8-4.2:1
  'K-navbar-contrast', // navbar links below 4.5:1 in light, pastel, neon, ocean, auto+light (axe agrees)
  'K-navbar-touch', // navbar brand is 38px high, small button 32px
  'K-radio-overflow', // long radio label widens the page at 360px
  'K-spinner-overflow', // long spinner label widens the page at 360px
  'K-tabs-keyboard', // no Vitra.tabs: arrows/Home/End and roving tabindex missing
  'K-toggle-border', // switch track border is 1.1-1.3:1, contract wants 3:1
  'K-toggle-overflow', // long switch label widens the page at 360px
]);
