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
    // Entrance animations (the directional reveal variants fade in at load)
    // must be over before axe reads colours: mid-fade text measures as low
    // contrast. Finite animations only; ambient loops never finish.
    // Only the ones actually running: a loop paused offscreen never settles.
    await page.evaluate(() => Promise.race([
      Promise.all(document.getAnimations()
        .filter((a) => a.playState === 'running'
          && a.effect && a.effect.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => {}))),
      new Promise((r) => setTimeout(r, 2500)),
    ]));
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
