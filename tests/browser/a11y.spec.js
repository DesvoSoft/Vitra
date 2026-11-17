import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { SCHEMES, schemeLabel, openSink, expectedFail } from './helpers.js';

// Schemes where axe reports serious/critical violations today, with the id
// they are filed under. Every violation axe finds there is a color-contrast
// hit on the navbar links (same cause as the navbar contrast spec); the other
// three schemes are clean.
const AXE_IDS = {
  light: 'K-navbar-contrast',
  pastel: 'K-navbar-contrast',
  neon: 'K-navbar-contrast',
  ocean: 'K-navbar-contrast',
  'auto+light': 'K-navbar-contrast',
};

for (const s of SCHEMES) {
  const label = schemeLabel(s);
  const id = AXE_IDS[label];
  test(`[${id || 'contract'}] axe: no serious or critical violations: ${label}`, async ({ page }, testInfo) => {
    if (id) expectedFail(test, id);
    await openSink(page, s);
    const results = await new AxeBuilder({ page }).analyze();
    await testInfo.attach(`axe-${label}.json`, {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });
    const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    const summary = bad.map(
      (v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
    expect(summary).toEqual([]);
  });
}
