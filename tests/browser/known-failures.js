// Test ids that are known to fail until their fix lands. Each id passed to
// expectedFail() that is in this set marks the test as test.fail(), so a fix
// turns it into an "unexpected pass" and forces the id to be removed here.
// Ids are audit findings (docs/AUDIT-2026-11-16.md: C#, J#) or K-<component>-<aspect>
// for failures of the component contract the audit does not list.
export default new Set([
]);
