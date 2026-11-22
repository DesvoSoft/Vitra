import { test, expect } from '@playwright/test';
import { openSink } from './helpers.js';

// The JS locks scrolling with overflow: hidden on <body>. A body value only
// reaches the viewport while <html> has no overflow of its own, so a page
// that sets one (off-canvas hygiene: overflow-x: clip on html and body) kept
// scrolling behind an open modal or drawer. The stylesheet locks the root
// too; these tests reproduce that page.

const ROOT_CLIP = 'html, body { overflow-x: clip; }';

async function wheelMoves(page) {
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 0); });
  await page.mouse.move(5, 300);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(250);
  return page.evaluate(() => scrollY);
}

test.describe('scroll lock on a page that sets overflow on <html>', () => {
  test.beforeEach(async ({ page }) => {
    await openSink(page, { viewport: { width: 390, height: 700 } });
    await page.addStyleTag({ content: ROOT_CLIP });
    expect(await wheelMoves(page), 'the page scrolls while nothing is open').toBeGreaterThan(0);
  });

  test('[contract] an open drawer keeps the page still, and closing it frees the page', async ({ page }) => {
    await page.click('#ks-drawer-toggle');
    await expect(page.locator('#ks-drawer')).toHaveClass(/open/);
    expect(await wheelMoves(page), 'page behind the open drawer').toBe(0);
    await page.keyboard.press('Escape');
    await expect(page.locator('#ks-drawer')).not.toHaveClass(/open/);
    expect(await wheelMoves(page), 'page after closing').toBeGreaterThan(0);
  });

  test('[contract] an open modal keeps the page still, and closing it frees the page', async ({ page }) => {
    await page.evaluate(() => window.Vitra.modal.open('#ks-modal'));
    expect(await wheelMoves(page), 'page behind the open modal').toBe(0);
    await page.evaluate(() => window.Vitra.modal.close());
    await page.waitForTimeout(300);
    expect(await wheelMoves(page), 'page after closing').toBeGreaterThan(0);
  });

  test('[contract] a drawer the page opens with its own script does not lock the page (as in 1.13)', async ({ page }) => {
    await page.evaluate(() => document.querySelector('#ks-drawer-manual').classList.add('open'));
    expect(await wheelMoves(page)).toBeGreaterThan(0);
  });
});
