import knownFailures from './known-failures.js';

export const THEMES = ['dark', 'light', 'pastel', 'neon', 'ocean', 'emerald'];

export const SCHEMES = [
  ...THEMES.map((t) => ({ theme: t })),
  { theme: 'auto', scheme: 'light' },
  { theme: 'auto', scheme: 'dark' },
];

/** Human label for a SCHEMES entry: "dark", "auto+light". */
export const schemeLabel = (s) => (s.scheme ? `${s.theme}+${s.scheme}` : s.theme);

/**
 * Open the kitchen sink page and wait until window.Vitra exists, the document
 * is fully loaded (so DOMContentLoaded auto-init has run) and one frame passed.
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
  await page.waitForFunction(() => typeof window.Vitra !== 'undefined' && document.readyState === 'complete');
  // DOMContentLoaded auto-init (tooltip, dropdown, reveal, scenery) has run
  // by now; one more frame lets anything it scheduled settle.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
}

/**
 * Page-side colour toolkit. Defined once as a plain function, serialised with
 * String() and rebuilt inside the page, so contrastRatio() and scanContrast()
 * share exactly the same maths. Translucent backgrounds of an element and its
 * ancestors are composited bottom-up onto the root --vitra-color-bg, and
 * element/ancestor opacity is factored in. Background images are ignored.
 * Throws on colour formats it cannot parse (oklch, lab, display-p3...)
 * instead of guessing.
 */
function colorTools() {
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
  const base = parse(getComputedStyle(probe).backgroundColor);
  probe.remove();
  if (base.a < 1) throw new Error('contrastRatio: --vitra-color-bg did not resolve to an opaque color');

  const mix = (top, a, under) => ({
    r: top.r * a + under.r * (1 - a),
    g: top.g * a + under.g * (1 - a),
    b: top.b * a + under.b * (1 - a),
    a: 1,
  });

  // Layers run from the node (index 0) up to the root. Opacity of a node
  // applies to its own background and to everything inside it, so each
  // layer's alpha is scaled by the product of opacity from the root down to it.
  // Returns the flattened background and the cumulative opacity of the node.
  const stack = (node) => {
    const layers = [];
    const opacities = [];
    for (let n = node; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      layers.push(parse(cs.backgroundColor));
      opacities.push(parseFloat(cs.opacity));
    }
    let cum = 1;
    for (let i = layers.length - 1; i >= 0; i--) {
      cum *= opacities[i];
      layers[i].a *= cum;
    }
    let bg = base;
    for (let i = layers.length - 1; i >= 0; i--) {
      if (layers[i].a === 0) continue;
      bg = mix(layers[i], layers[i].a, bg);
    }
    return { bg, opacity: cum };
  };

  const lum = ({ r, g, b }) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a);
    const l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  // Ratio of a CSS color string (drawn at extra opacity) over a flattened background.
  const over = (colorStr, opacity, bg) => {
    const fg = parse(colorStr);
    return ratio(mix(fg, fg.a * opacity, bg), bg);
  };

  // Text colour of an element against its own effective background.
  // A gradient background is judged against its worst colour stop.
  const text = (el) => {
    const s = stack(el);
    const cs = getComputedStyle(el);
    const stops = cs.backgroundImage.includes('gradient(')
      ? cs.backgroundImage.match(/rgba?\([^)]*\)|color\(srgb[^)]*\)/g) || []
      : [];
    if (!stops.length) return over(cs.color, s.opacity, s.bg);
    return Math.min(...stops.map((c) => {
      const st = parse(c);
      return over(cs.color, s.opacity, mix(st, st.a, s.bg));
    }));
  };

  return { parse, stack, ratio, over, text };
}

/**
 * WCAG contrast ratio between the element text color and its effective
 * background (see colorTools).
 * @param {import('@playwright/test').Locator} locator
 * @returns {Promise<number>}
 */
export async function contrastRatio(locator) {
  return locator.evaluate((el, src) => (0, eval)('(' + src + ')')().text(el), String(colorTools));
}

/**
 * Scan every visible element of a component that draws its own text (and,
 * separately, every bordered form control) and return the ones below the
 * WCAG thresholds. Disabled controls are exempt (WCAG 1.4.3). Placeholders
 * count as text. Elements with an unparseable colour are reported, not skipped.
 * Finite animations/transitions are awaited first so nothing is measured
 * mid-fade. Gradient backgrounds are judged against their worst stop.
 * @param {import('@playwright/test').Page} page
 * @param {string} component value of data-component
 * @param {Array<'text'|'placeholder'|'border'>} [kinds] which checks to run
 * @returns {Promise<{checked: number, failures: string[]}>}
 */
export async function scanContrast(page, component, kinds = ['text', 'placeholder', 'border']) {
  return page.evaluate(async ({ src, component, kinds }) => {
    const settled = Promise.all(
      document.getAnimations()
        .filter((a) => a.effect && a.effect.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => {})));
    await Promise.race([settled, new Promise((r) => setTimeout(r, 2500))]);
    const T = (0, eval)('(' + src + ')')();
    const root = document.querySelector('[data-component="' + component + '"]');
    const failures = [];
    let checked = 0;
    const name = (el) =>
      el.tagName.toLowerCase() +
      (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '') +
      (el.dataset && el.dataset.state ? '[' + el.dataset.state + ']' : '');
    const visible = (el) =>
      el.checkVisibility({ visibilityProperty: true, contentVisibilityAuto: true }) &&
      el.getClientRects().length > 0;
    const exempt = (el) =>
      el.closest(':disabled, [data-state="disabled"]') || el.closest('label:has(:disabled)');
    const needed = (cs) => {
      const px = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight, 10) >= 700;
      return px >= 24 || (bold && px >= 18.66) ? 3 : 4.5;
    };
    const guard = (el, kind, req, fn, what = kind) => {
      if (!kinds.includes(kind)) return;
      checked++;
      try {
        const r = fn();
        if (!(r >= req)) failures.push(name(el) + ' ' + what + ' ' + r.toFixed(2) + ' < ' + req);
      } catch (e) {
        failures.push(name(el) + ' ' + what + ' ' + e.message);
      }
    };

    // Toasts and tooltips are appended to <body>, outside the section: scan them too when open.
    const roots = [root, ...root.querySelectorAll('*')];
    const outside = { toast: '.vitra-toast-container, .vitra-toast-container *', tooltip: '.vitra-tooltip-js' };
    if (outside[component]) roots.push(...document.querySelectorAll(outside[component]));
    for (const el of roots) {
      if (!visible(el) || exempt(el)) continue;
      const cs = getComputedStyle(el);
      const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim());
      const isField = el.matches('input:not([type=checkbox]):not([type=radio]), textarea, select');
      const hasValue = isField && (el.value || '').length > 0;
      if (ownText || hasValue) guard(el, 'text', needed(cs), () => T.text(el));

      if (el.matches('input[placeholder], textarea[placeholder]') && !el.value) {
        guard(el, 'placeholder', 4.5, () => {
          const ph = getComputedStyle(el, '::placeholder');
          const s = T.stack(el);
          return T.over(ph.color, s.opacity * parseFloat(ph.opacity), s.bg);
        });
      }

      // Borders that delimit an interactive control must reach 3:1 against
      // the surface behind the control.
      const borderOf = (target, pseudo, behind) => {
        const b = getComputedStyle(target, pseudo);
        if (parseFloat(b.borderTopWidth) === 0 || b.borderTopStyle === 'none') return;
        guard(el, 'border', 3, () =>
          T.over(b.borderTopColor, T.stack(target).opacity, T.stack(behind).bg), (pseudo || '') + ' border');
      };
      if (el.matches('input:not([type=checkbox]):not([type=radio]), select, textarea, .vitra-checkbox, .vitra-radio')) {
        borderOf(el, null, el.parentElement);
      }
      if (el.matches('.vitra-toggle-label')) borderOf(el, '::before', el);
    }
    return { checked, failures };
  }, { src: String(colorTools), component, kinds });
}

/**
 * Mark the running test as expected-to-fail when its id is listed in
 * known-failures. Call it as the FIRST statement inside the test body
 * (test.fail() without arguments only works from within a test).
 * `when` restricts the expectation: a browser name ('chromium' | 'firefox')
 * or a predicate receiving the project name, for failures that only
 * reproduce in one engine.
 * @param {typeof import('@playwright/test').test} test
 * @param {string} id
 * @param {string | ((browser: string) => boolean)} [when]
 */
export function expectedFail(test, id, when) {
  if (!knownFailures.has(id)) return;
  const browser = test.info().project.name;
  if (typeof when === 'string' && when !== browser) return;
  if (typeof when === 'function' && !when(browser)) return;
  test.fail();
}

export const SAMPLE_PROPS = [
  'color', 'background-color', 'background-image', 'border-color',
  'box-shadow', 'opacity', 'visibility',
];

/**
 * Computed styles of a fixed sample of ~40 elements of the kitchen sink:
 * the root, the body, the first Vitra element of every component section, the
 * modal panel, a gradient-text probe injected here, and the eight scenery
 * layers (plus the pseudo-elements that paint stars, the shooting star, the
 * halo ring and the ridge masses). Keys are stable labels, so two snapshots
 * taken under different themes can be compared entry by entry. Running
 * transitions, fades and loops are settled first, so two reads of the same
 * style cannot differ by timing.
 * @param {import('@playwright/test').Page} page
 * @param {string[]} [props] computed properties to read
 * @returns {Promise<Record<string, Record<string, string>>>}
 */
export async function sampleStyles(page, props = SAMPLE_PROPS) {
  return page.evaluate((props) => {
    // Transitions and finite animations jump to their end state (a theme switch
    // is still fading otherwise); loops park at their first frame. Scroll-driven
    // animations have no clock to move and are deterministic already.
    for (const a of document.getAnimations().filter((x) => x.timeline === document.timeline)) {
      if (a.effect.getComputedTiming().iterations === Infinity) {
        a.pause();
        a.currentTime = 0;
      } else {
        a.finish();
      }
    }
    if (!document.querySelector('#ks-gradient-probe')) {
      const probe = document.createElement('span');
      probe.id = 'ks-gradient-probe';
      probe.className = 'vitra-gradient-text';
      probe.textContent = 'Gradient';
      document.body.appendChild(probe);
    }
    const targets = [['html', document.documentElement, null], ['body', document.body, null]];
    for (const section of document.querySelectorAll('[data-component]')) {
      const el = section.querySelector('[class*="vitra-"]');
      if (el) targets.push([`${section.dataset.component}:${el.className.split(/\s+/)[0]}`, el, null]);
    }
    targets.push(['modal-content', document.querySelector('.vitra-modal-content'), null]);
    targets.push(['gradient-text', document.querySelector('#ks-gradient-probe'), null]);
    const scenery = document.querySelector('.vitra-scenery-inline');
    for (const layer of scenery.children) {
      const name = layer.className.split(/\s+/)[0];
      targets.push([name, layer, null]);
      for (const pseudo of ['::before', '::after']) {
        if (getComputedStyle(layer, pseudo).content !== 'none') targets.push([name + pseudo, layer, pseudo]);
      }
    }
    const out = {};
    for (const [label, el, pseudo] of targets) {
      const cs = getComputedStyle(el, pseudo);
      out[label] = Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
    }
    return out;
  }, props);
}
