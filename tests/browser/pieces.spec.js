import { test, expect } from '@playwright/test';
import { openSink, sampleStyles } from './helpers.js';

// CSS pieces (core, scenery, effects) must compute exactly like the full
// bundle, in any load order, and core alone must stay harmless when scenery /
// particle markup is on the page (the markup is just not styled).

const PROPS = ['color', 'background-color', 'background-image', 'border', 'box-shadow', 'transform', 'opacity', 'display'];

const openPieces = (page, theme, order) => openSink(page, { theme, css: 'pieces', order });

for (const theme of ['dark', 'light']) {
  test.describe(`pieces vs bundle (${theme})`, () => {
    test(`[pieces] core+scenery+effects compute like the bundle in ${theme}`, async ({ page }) => {
      await openSink(page, { theme });
      const reference = await sampleStyles(page, PROPS);
      expect(Object.keys(reference).length).toBeGreaterThanOrEqual(40);
      await openPieces(page, theme);
      expect(await sampleStyles(page, PROPS)).toEqual(reference);
    });

    test(`[pieces] loading scenery, effects, core in that order computes like the bundle in ${theme}`, async ({ page }) => {
      await openSink(page, { theme });
      const reference = await sampleStyles(page, PROPS);
      await openPieces(page, theme, 'scenery,effects,core');
      expect(await sampleStyles(page, PROPS)).toEqual(reference);
    });

    test(`[pieces] loading effects, scenery, core in that order computes like the bundle in ${theme}`, async ({ page }) => {
      await openSink(page, { theme });
      const reference = await sampleStyles(page, PROPS);
      await openPieces(page, theme, 'effects,scenery,core');
      expect(await sampleStyles(page, PROPS)).toEqual(reference);
    });
  });
}

test.describe('core alone with orphaned scenery and particle markup', () => {
  test('[pieces] orphaned scenery/particles neither cover content nor take space, no console errors', async ({ page }) => {
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    await openSink(page, { theme: 'dark', css: 'core' });
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('.vitra-btn')).display)).not.toBe('inline'); // core loaded

    const before = await page.evaluate(() => document.documentElement.scrollHeight);
    // Hand-written scenery (page-wide and inline), a JS-mounted one, hand-written
    // particles and JS-spawned ones, all at the top of the page.
    await page.evaluate(() => {
      const wrap = document.createElement('div');
      wrap.id = 'orphans';
      wrap.innerHTML =
        '<div class="vitra-scenery" id="orphan-scenery"><div class="vitra-scenery-sky"></div><div class="vitra-scenery-ridge-near"></div></div>' +
        '<div class="vitra-scenery-inline" id="orphan-inline"><div class="vitra-scenery-sky"></div></div>' +
        '<div id="orphan-js-scenery"></div>' +
        '<div id="orphan-particles"><span class="vitra-particle"></span><span class="vitra-particle"></span></div>';
      document.body.prepend(wrap);
      window.Vitra.scenery.mount('#orphan-js-scenery');
      window.Vitra.particles.spawn(5, { container: '#orphan-particles' });
    });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));

    const result = await page.evaluate(() => {
      const btn = document.querySelector('.vitra-btn');
      btn.scrollIntoView({ block: 'center' });
      const r = btn.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      const space = (el) => {
        const cs = getComputedStyle(el);
        const b = el.getBoundingClientRect();
        return { display: cs.display, position: cs.position, h: b.height, w: b.width };
      };
      return {
        hitIsButton: hit === btn || btn.contains(hit),
        scenery: space(document.querySelector('#orphan-scenery')),
        inline: space(document.querySelector('#orphan-inline')),
        jsScenery: space(document.querySelector('#orphan-js-scenery')),
        particles: [...document.querySelectorAll('#orphan-particles > *')].map((p) => space(p)),
        scrollHeight: document.documentElement.scrollHeight,
      };
    });
    expect(result.hitIsButton).toBe(true);
    for (const s of [result.scenery, result.inline, result.jsScenery]) {
      expect(s.display === 'none' || s.h === 0, JSON.stringify(s)).toBe(true);
    }
    for (const p of result.particles) {
      expect(p.display === 'none' || (p.w === 0 && p.h === 0) || p.position === 'absolute', JSON.stringify(p)).toBe(true);
    }
    expect(result.scrollHeight).toBe(before);
    expect(errors).toEqual([]);
  });
});

// The cascade layer order must hold whatever order the pieces load in. Probe
// every pair of layers: the later layer of the declared order has to win.
const LAYERS = ['tokens', 'glass', 'particles', 'motion', 'scenery', 'layout', 'components', 'utilities', 'shaders'];

for (const order of [null, 'scenery,effects,core', 'effects,scenery,core', 'effects,core,scenery', 'core,effects,scenery']) {
  test(`[pieces] cascade layer order holds (${order || 'bundle'})`, async ({ page }) => {
    await openSink(page, order ? { css: 'pieces', order } : {});
    const wrong = await page.evaluate((LAYERS) => {
      const style = document.createElement('style');
      let css = '';
      const pairs = [];
      for (let i = 0; i < LAYERS.length; i++) {
        for (let j = i + 1; j < LAYERS.length; j++) {
          pairs.push([i, j]);
          css += `@layer ${LAYERS[i]} { #probe-${i}-${j} { z-index: 1; } } @layer ${LAYERS[j]} { #probe-${i}-${j} { z-index: 2; } }`;
        }
      }
      style.textContent = css;
      document.head.appendChild(style);
      const out = [];
      for (const [i, j] of pairs) {
        const el = document.createElement('div');
        el.id = `probe-${i}-${j}`;
        el.style.position = 'absolute';
        document.body.appendChild(el);
        if (getComputedStyle(el).zIndex !== '2') out.push(`${LAYERS[i]} < ${LAYERS[j]}`);
      }
      return out;
    }, LAYERS);
    expect(wrong).toEqual([]);
  });
}
