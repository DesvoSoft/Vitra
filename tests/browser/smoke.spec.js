import { test, expect } from '@playwright/test';
import { SCHEMES, openSink, contrastRatio } from './helpers.js';

test('contrastRatio throws on an unrecognised color format', async ({ page }) => {
  await openSink(page, { theme: 'dark' });
  const h1 = page.locator('h1');
  await h1.evaluate((el) => { el.style.color = 'lab(50% 20 20)'; });
  await expect(contrastRatio(h1)).rejects.toThrow(/unrecognised color format/);
});

test('contrastRatio factors in opacity', async ({ page }) => {
  await openSink(page, { theme: 'dark' });
  const h1 = page.locator('h1');
  const full = await contrastRatio(h1);
  await h1.evaluate((el) => { el.style.opacity = '0.5'; });
  expect(await contrastRatio(h1)).toBeLessThan(full);
});

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

const FIXED_IDS = [
  'ks-modal', 'ks-modal-open', 'ks-modal-empty', 'ks-drawer', 'ks-drawer-toggle',
  'ks-drawer-manual', 'ks-dd', 'ks-dd-popover', 'ks-tabs', 'ks-tooltip',
  'ks-toast-btn-success', 'ks-toast-btn-error', 'ks-toast-btn-info',
  'ks-toast-btn-warning', 'ks-toast-btn-sticky',
];

test('kitchen sink exposes every fixed #ks-* id the specs rely on', async ({ page }) => {
  await openSink(page);
  for (const id of FIXED_IDS) {
    await expect(page.locator('#' + id), `#${id}`).toHaveCount(1);
  }
});
