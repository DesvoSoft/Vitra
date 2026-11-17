import knownFailures from './known-failures.js';

export const THEMES = ['dark', 'light', 'pastel', 'neon', 'ocean', 'emerald'];

export const SCHEMES = [
  ...THEMES.map((t) => ({ theme: t })),
  { theme: 'auto', scheme: 'light' },
  { theme: 'auto', scheme: 'dark' },
];

/**
 * Open the kitchen sink page and wait until window.Vitra exists.
 * @param {import('@playwright/test').Page} page
 * @param {{theme?: string, scheme?: 'light'|'dark', reducedMotion?: boolean,
 *          css?: string, viewport?: {width: number, height: number}}} [opts]
 */
export async function openSink(page, { theme, scheme, reducedMotion, css, viewport } = {}) {
  if (viewport) await page.setViewportSize(viewport);
  const media = {};
  if (scheme) media.colorScheme = scheme;
  if (reducedMotion !== undefined) media.reducedMotion = reducedMotion ? 'reduce' : 'no-preference';
  if (Object.keys(media).length) await page.emulateMedia(media);

  const params = new URLSearchParams();
  if (theme) params.set('theme', theme);
  if (css) params.set('css', css);
  const qs = params.toString();
  await page.goto('/tests/kitchen-sink' + (qs ? '?' + qs : ''));
  await page.waitForFunction(() => typeof window.Vitra !== 'undefined');
}

/**
 * WCAG contrast ratio between the element text color and its effective
 * background. Translucent backgrounds of the element and its ancestors are
 * composited bottom-up onto the root --vitra-color-bg, and element/ancestor
 * opacity is factored in. Background images are ignored. Throws on color
 * formats it cannot parse (oklch, lab, display-p3...) instead of guessing.
 * @param {import('@playwright/test').Locator} locator
 * @returns {Promise<number>}
 */
export async function contrastRatio(locator) {
  return locator.evaluate((el) => {
    // Computed colors may be rgb(), rgba() or color(srgb ...) depending on the browser.
    const parse = (s) => {
      const m = s.match(/^\s*(?:rgba?\(([^)]+)\)|color\(srgb ([^)]+)\))\s*$/);
      if (!m) throw new Error('contrastRatio: unrecognised color format: ' + s);
      if (m[2]) {
        const [r, g, b, a = 1] = m[2].replace('/', ' ').trim().split(/[\s,]+/).map(Number);
        return { r: r * 255, g: g * 255, b: b * 255, a };
      }
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };

    // Resolve --vitra-color-bg through a probe element's computed background.
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;background-color:var(--vitra-color-bg)';
    document.body.appendChild(probe);
    let base = parse(getComputedStyle(probe).backgroundColor);
    probe.remove();
    if (base.a < 1) throw new Error('contrastRatio: --vitra-color-bg did not resolve to an opaque color');

    // Layers run from the element (index 0) up to the root. Opacity of a node
    // applies to its own background and to everything inside it, so each
    // layer's alpha is scaled by the product of opacity from the root down to it.
    const layers = [];
    const opacities = [];
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      layers.push(parse(cs.backgroundColor));
      opacities.push(parseFloat(cs.opacity));
    }
    let cum = 1;
    for (let i = layers.length - 1; i >= 0; i--) {
      cum *= opacities[i];
      layers[i].a *= cum;
    }
    const textOpacity = cum;
    let bg = base;
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      if (l.a === 0) continue;
      bg = {
        r: l.r * l.a + bg.r * (1 - l.a),
        g: l.g * l.a + bg.g * (1 - l.a),
        b: l.b * l.a + bg.b * (1 - l.a),
        a: 1,
      };
    }
    const fg = parse(getComputedStyle(el).color);
    fg.a *= textOpacity;
    const fgc = {
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
    };
    const lum = ({ r, g, b }) => {
      const f = (v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const l1 = lum(fgc);
    const l2 = lum(bg);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  });
}

/** Mark the test as expected-to-fail when its id is listed in known-failures. */
export function expectedFail(test, id) {
  if (knownFailures.has(id)) test.fail();
}
