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
  'J13', // tooltip: no Esc, replaces aria-describedby, long tooltip overflows 360px

  // Component contract failures with no audit finding of their own
  'K-alert-touch', // alert dismiss button is 24x31
  'K-badge-overflow', // long badge text widens the page at 360px
  'K-button-touch', // .vitra-btn-sm is 35px high
  'K-checkbox-overflow', // long checkbox label widens the page at 360px
  'K-checkbox-touch', // checkbox label rows are 26px high
  'K-navbar-touch', // navbar brand is 38px high, small button 32px
  'K-radio-overflow', // long radio label widens the page at 360px
  'K-spinner-overflow', // long spinner label widens the page at 360px
  'K-tabs-keyboard', // no Vitra.tabs: arrows/Home/End and roving tabindex missing
  'K-toggle-overflow', // long switch label widens the page at 360px
]);
