// @ts-check
import { test, expect } from '@playwright/test';

// Ambient loops: compositor-only properties, full offscreen pause, border-glow
// coverage. Fixtures live in tests/kitchen-sink.html behind ?only=<section>.

async function openOnly(page, only, { theme = 'dark', reducedMotion } = {}) {
  if (reducedMotion !== undefined) await page.emulateMedia({ reducedMotion: reducedMotion ? 'reduce' : 'no-preference' });
  await page.goto(`/tests/kitchen-sink?theme=${theme}&only=${only}`);
  await page.waitForFunction(() => typeof window.Vitra !== 'undefined' && document.readyState === 'complete');
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
}

// Play states of every animation on the target and its pseudo-elements/subtree.
const playStates = (page, selector) => page.evaluate((sel) =>
  document.querySelector(sel).getAnimations({ subtree: true }).map((a) => a.playState), selector);

// ------------------------------------------------------- compositor only ---

test.describe('compositor-only loops', () => {
  const CASES = [
    { only: 'progress', sel: '#ks-progress-animated', name: 'striped progress bar' },
    { only: 'ring', sel: '#ks-ring', name: 'indeterminate progress ring' },
    { only: 'spinner', sel: '.vitra-spinner', name: 'spinner' },
    { only: 'noise', sel: '#ks-noise', name: 'animated noise overlay' },
  ];
  for (const { only, sel, name } of CASES) {
    test(`[C15] ${name} animates only transform or opacity`, async ({ page }) => {
      await openOnly(page, only);
      const props = await page.evaluate((s) =>
        document.querySelector(s).getAnimations({ subtree: true }).flatMap((a) =>
          a.effect.getKeyframes().flatMap((k) => Object.keys(k).filter((p) =>
            !['offset', 'computedOffset', 'easing', 'composite'].includes(p)))), sel);
      expect(props.length).toBeGreaterThan(0);
      expect([...new Set(props)].filter((p) => p !== 'transform' && p !== 'opacity')).toEqual([]);
    });
  }

  test('[C14] animated noise: the blended overlay holds no painted background', async ({ page }) => {
    await openOnly(page, 'noise');
    const r = await page.evaluate(() => {
      const el = document.querySelector('#ks-noise');
      return { self: getComputedStyle(el).backgroundImage, grain: getComputedStyle(el, '::before').backgroundImage };
    });
    expect(r.self).toBe('none');
    expect(r.grain).toContain('feTurbulence');
  });
});

// ----------------------------------------------------------- border glow ---

test.describe('border glow', () => {
  test('[C11] a 600x60 host shows the border on all four corners at four instants', async ({ page }) => {
    await openOnly(page, 'border-glow');
    const host = page.locator('#ks-border-glow-wide');
    const misses = [];
    for (const t of [0, 1000, 2000, 3000]) {
      await page.evaluate((time) => {
        for (const a of document.querySelector('#ks-border-glow-wide').getAnimations({ subtree: true })) {
          a.pause();
          a.currentTime = time;
        }
      }, t);
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      const png = (await host.screenshot()).toString('base64');
      const res = await page.evaluate(async (b64) => {
        const bmp = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob());
        const c = new OffscreenCanvas(bmp.width, bmp.height);
        const g = c.getContext('2d');
        g.drawImage(bmp, 0, 0);
        const { width: w, height: h } = bmp;
        const px = (x, y) => [...g.getImageData(x, y, 1, 1).data.slice(0, 3)];
        const inner = px(w >> 1, h >> 1);
        const dist = (p) => p.reduce((s, v, i) => s + Math.abs(v - inner[i]), 0);
        // Inside the 2px band, just past the 12px corner radius; one pixel in
        // from the edge, as the host may sit at a fractional offset.
        const points = {
          'top-left': [16, 1], 'top-right': [w - 17, 1], 'bottom-left': [16, h - 2], 'bottom-right': [w - 17, h - 2],
          'left': [1, h >> 1], 'right': [w - 2, h >> 1],
        };
        return Object.fromEntries(Object.entries(points).map(([k, [x, y]]) => [k, dist(px(x, y))]));
      }, png);
      for (const [corner, d] of Object.entries(res)) if (d < 60) misses.push(`t=${t} ${corner} (${d})`);
    }
    expect(misses).toEqual([]);
  });
});

// -------------------------------------------------------- offscreen pause ---

test.describe('motionGuard offscreen pause', () => {
  const CASES = [
    { only: 'spinner', sel: '.vitra-spinner', name: 'spinner' },
    { only: 'skeleton', sel: '[data-component="skeleton"] [data-state="shimmer"]', name: 'skeleton shimmer' },
    { only: 'skeleton', sel: '[data-component="skeleton"] [data-state="pulse"]', name: 'skeleton pulse' },
    { only: 'progress', sel: '#ks-progress-animated', name: 'striped progress bar' },
    { only: 'ring', sel: '#ks-ring', name: 'indeterminate progress ring' },
    { only: 'noise', sel: '#ks-noise', name: 'animated noise overlay', unfix: true },
    { only: 'rotate', sel: '#ks-rotate-double', name: 'double gradient rotate (layer included)' },
    { only: 'particles', sel: '#ks-particles', name: 'particles', spawn: true },
  ];
  for (const { only, sel, name, unfix, spawn } of CASES) {
    test(`[C15] ${name}: paused 3000px below the viewport, running once scrolled into view`, async ({ page }) => {
      await openOnly(page, only);
      await page.evaluate(({ sel, unfix, spawn }) => {
        const el = document.querySelector(sel);
        const section = el.closest('[data-component]');
        const gap = innerHeight + 3000;
        const spacer = document.createElement('div');
        spacer.style.height = gap + 'px';
        section.prepend(spacer);
        if (unfix) {
          // The overlay is position: fixed (always on screen); take it out of
          // the viewport to exercise the guard itself.
          section.style.position = 'relative';
          Object.assign(el.style, { position: 'absolute', inset: 'auto', top: gap + 'px', left: '0', width: '200px', height: '200px' });
        }
        if (spawn) window.Vitra.particles.spawn(5, { container: sel });
      }, { sel, unfix, spawn });
      await expect.poll(() => playStates(page, sel)).not.toEqual([]);
      await expect.poll(async () => [...new Set(await playStates(page, sel))]).toEqual(['paused']);
      await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sel);
      await expect.poll(async () => [...new Set(await playStates(page, sel))]).toEqual(['running']);
    });
  }
});

// ---------------------------------------------------------- reduced motion ---

test.describe('motion fixtures under reduced motion', () => {
  for (const only of ['progress', 'ring', 'noise', 'rotate', 'border-glow', 'spinner', 'skeleton', 'particles']) {
    test(`[contract] reduced motion: zero running animations in ${only}`, async ({ page }) => {
      await openOnly(page, only, { reducedMotion: true });
      if (only === 'particles') await page.evaluate(() => window.Vitra.particles.spawn(5, { container: '#ks-particles' }));
      await page.waitForTimeout(300);
      const running = await page.evaluate((o) =>
        document.querySelector(`[data-component="${o}"]`).getAnimations({ subtree: true })
          .filter((a) => a.playState === 'running')
          .map((a) => `${a.animationName || a.transitionProperty} on ${a.effect.target.className}${a.effect.pseudoElement || ''}`), only);
      expect(running).toEqual([]);
    });
  }
});
