import { test, expect } from '@playwright/test';
import { SCHEMES, openSink } from './helpers.js';

const COMPONENTS = [
  'button', 'card', 'input', 'toggle', 'radio', 'checkbox', 'select', 'tabs',
  'modal', 'drawer', 'dropdown', 'tooltip', 'toast', 'progress', 'badge',
  'alert', 'table', 'navbar', 'spinner', 'skeleton', 'glass', 'reveal', 'scenery',
];
const LIGHT = new Set(['light', 'pastel']);

for (const s of SCHEMES) {
  const label = s.scheme ? `${s.theme}+${s.scheme}` : s.theme;
  test(`kitchen sink loads clean: ${label}`, async ({ page }) => {
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));

    await openSink(page, s);

    for (const name of COMPONENTS) {
      await expect(page.locator(`section[data-component="${name}"]`)).toHaveCount(1);
    }
    const isLight = s.theme === 'auto' ? s.scheme === 'light' : LIGHT.has(s.theme);
    const scheme = await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
    expect(scheme).toBe(isLight ? 'light' : 'dark');
    expect(errors).toEqual([]);
  });
}
