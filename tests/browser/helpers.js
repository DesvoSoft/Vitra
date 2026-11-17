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
 * composited bottom-up onto the root --vitra-color-bg. Background images are
 * ignored.
 * @param {import('@playwright/test').Locator} locator
 * @returns {Promise<number>}
 */
export async function contrastRatio(locator) {
  return locator.evaluate((el) => {
    // Computed colors may be rgb(), rgba() or color(srgb ...) depending on the browser.
    const parse = (s) => {
      const m = s.match(/rgba?\(([^)]+)\)|color\(srgb ([^)]+)\)/);
      if (!m) return { r: 0, g: 0, b: 0, a: 0 };
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
    if (base.a < 1) base = { r: 255, g: 255, b: 255, a: 1 };

    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      layers.push(parse(getComputedStyle(n).backgroundColor));
    }
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
