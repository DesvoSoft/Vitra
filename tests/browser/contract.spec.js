import { test, expect } from '@playwright/test';
import { SCHEMES, schemeLabel, openSink, scanContrast, expectedFail, sampleStyles } from './helpers.js';

// Component contract (spec section 3): contrast, touch targets, overflow,
// reduced motion, no-JS and screenshots. Each test covers one component (or
// one state) and loops over schemes inside, so a failure message lists every
// scheme/element that broke and a fix removes exactly one id.

const MOBILE = { width: 360, height: 740 };

// Components under contrast test. Scenery is excluded on purpose: the spec
// asserts nothing over the landscape (it is reviewed in the screenshots).
const CONTRAST_COMPONENTS = [
  'button', 'card', 'input', 'toggle', 'radio', 'checkbox', 'select', 'tabs',
  'modal', 'drawer', 'dropdown', 'tooltip', 'toast', 'progress', 'badge',
  'alert', 'table', 'navbar', 'spinner', 'skeleton', 'glass', 'reveal',
];

// Audit id (or invented K- id) each failing test is filed under. Components
// that pass are simply absent.
const CONTRAST_IDS = {
  'alert:text': 'K-alert-contrast',
  'button:text': 'K-button-contrast',
  'drawer:text': 'K-drawer-contrast',
  'navbar:text': 'K-navbar-contrast',
  'input:placeholder': 'K-input-placeholder',
  'input:border': 'K-input-border',
  'select:border': 'K-input-border',
  'toggle:border': 'K-toggle-border',
};

// Put a component in the state its contrast should be judged in.
const OPEN_FOR_CONTRAST = {
  modal: async (page) => {
    await page.evaluate(() => window.Vitra.modal.open('#ks-modal'));
    await page.waitForTimeout(500);
  },
  drawer: async (page) => {
    await page.evaluate(() => {
      if (window.Vitra.drawer) window.Vitra.drawer.open('#ks-drawer');
      else document.querySelector('#ks-drawer').classList.add('open');
    });
    await page.waitForTimeout(500);
  },
  dropdown: async (page) => {
    await page.locator('#ks-dd [data-vitra-dropdown-toggle]').click();
    await page.keyboard.press('Escape');
    await page.locator('#ks-dd [data-vitra-dropdown-toggle]').click();
    await page.waitForTimeout(400);
  },
  tooltip: async (page) => {
    await page.locator('#ks-tooltip').focus();
    await page.locator('.vitra-tooltip-js').waitFor();
    await page.waitForTimeout(400);
  },
  toast: async (page) => {
    await page.evaluate(() => {
      for (const type of ['success', 'error', 'info', 'warning']) {
        window.Vitra.toast.show(`${type} toast`, { type, duration: 0 });
      }
    });
    await page.waitForTimeout(500);
  },
  reveal: async (page) => {
    // Reveal is opt-in: content stays at opacity 0 until Vitra.reveal.init()
    // sees it scroll into view.
    await page.evaluate(async () => {
      window.Vitra.reveal.init();
      for (const el of document.querySelectorAll('.vitra-reveal')) {
        el.scrollIntoView({ block: 'center' });
        await new Promise((r) => setTimeout(r, 60));
      }
      await new Promise((r) => setTimeout(r, 150));
    });
  },
};

// One test per (component x kind). 'text' covers every component; control
// borders and placeholders are checked where the component owns them (the
// input inside the modal is covered by the input tests).
const CONTRAST_TESTS = [
  ...CONTRAST_COMPONENTS.map((c) => [c, 'text']),
  ['input', 'placeholder'],
  ['input', 'border'],
  ['select', 'border'],
  ['toggle', 'border'],
];

test.describe('contrast', () => {
  for (const [component, kind] of CONTRAST_TESTS) {
    const id = CONTRAST_IDS[component + ':' + kind];
    test(`[${id || 'contract'}] contrast (${kind}): ${component}`, async ({ page }) => {
      if (id) expectedFail(test, id);
      const failures = [];
      let checked = 0;
      for (const s of SCHEMES) {
        await openSink(page, s);
        if (OPEN_FOR_CONTRAST[component]) await OPEN_FOR_CONTRAST[component](page);
        const r = await scanContrast(page, component, [kind]);
        checked += r.checked;
        failures.push(...r.failures.map((f) => `${schemeLabel(s)}: ${f}`));
      }
      expect(checked, 'something was measured').toBeGreaterThan(0);
      expect(failures).toEqual([]);
    });
  }
});

// Checkbox and radio paint their own border: it must reach 3:1 against the
// surface behind the control, like inputs, selects and the switch.
test.describe('contrast (border): checkbox and radio', () => {
  test('[contract] unchecked checkbox and radio borders reach 3:1 in every scheme', async ({ page }) => {
    const failures = [];
    let checked = 0;
    for (const s of SCHEMES) {
      await openSink(page, s);
      const r = await page.evaluate(() => {
        const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
        const px = (paint) => {
          ctx.clearRect(0, 0, 1, 1);
          for (const c of paint) { ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); }
          return [...ctx.getImageData(0, 0, 1, 1).data];
        };
        const lum = ([r, g, b]) => {
          const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const out = [];
        let n = 0;
        const inputs = document.querySelectorAll(
          '[data-component="checkbox"] .vitra-checkbox input:not(:checked):not(:disabled), [data-component="radio"] .vitra-radio input:not(:checked):not(:disabled)');
        for (const el of inputs) {
          if (!el.checkVisibility()) continue;
          n++;
          const chain = [];
          for (let a = el.parentElement; a; a = a.parentElement) chain.unshift(getComputedStyle(a).backgroundColor);
          const cs = getComputedStyle(el);
          const behind = px(chain);
          const border = px([...chain, cs.borderTopColor]);
          const [hi, lo] = [lum(behind), lum(border)].sort((x, y) => y - x);
          const ratio = (hi + 0.05) / (lo + 0.05);
          if (parseFloat(cs.borderTopWidth) === 0 || !(ratio >= 3)) {
            out.push(el.type + ' ' + ratio.toFixed(2) + ' width ' + cs.borderTopWidth);
          }
        }
        return { n, out };
      });
      checked += r.n;
      failures.push(...r.out.map((f) => schemeLabel(s) + ': ' + f));
    }
    expect(checked, 'something was measured').toBeGreaterThan(0);
    expect(failures).toEqual([]);
  });
});

// The checked state is painted too: the inverse mark must stand out from the
// accent fill, and the fill from the page.
test.describe('checkbox and radio: checked, focus, disabled, forced colors', () => {
  const CHECKED = '[data-component="checkbox"] .vitra-checkbox input:checked, [data-component="radio"] .vitra-radio input:checked';

  test('[contract] checked mark reaches 3:1 on the fill and the fill on the page in every scheme', async ({ page }) => {
    const failures = [];
    let checked = 0;
    for (const s of SCHEMES) {
      await openSink(page, s);
      const r = await page.evaluate((sel) => {
        const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
        const px = (paint) => {
          ctx.clearRect(0, 0, 1, 1);
          for (const c of paint) { ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); }
          return [...ctx.getImageData(0, 0, 1, 1).data];
        };
        const lum = ([r, g, b]) => {
          const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
        const out = [];
        let n = 0;
        for (const el of document.querySelectorAll(sel)) {
          if (!el.checkVisibility() || el.disabled) continue;
          n++;
          const chain = [];
          for (let a = el.parentElement; a; a = a.parentElement) chain.unshift(getComputedStyle(a).backgroundColor);
          const cs = getComputedStyle(el);
          const mark = getComputedStyle(el, '::before');
          const page = px(chain);
          const fill = px([...chain, cs.backgroundColor]);
          const markPx = px([...chain, cs.backgroundColor, mark.backgroundColor]);
          const m = ratio(markPx, fill);
          const f = ratio(fill, page);
          if (mark.content === 'none' || !(m >= 3)) out.push(el.type + ' mark on fill ' + m.toFixed(2));
          if (!(f >= 3)) out.push(el.type + ' fill on page ' + f.toFixed(2));
        }
        return { n, out };
      }, CHECKED);
      checked += r.n;
      failures.push(...r.out.map((f) => schemeLabel(s) + ': ' + f));
    }
    expect(checked, 'something was measured').toBeGreaterThan(0);
    expect(failures).toEqual([]);
  });

  test('[contract] focus ring is visible and disabled controls look disabled', async ({ page }) => {
    await openSink(page);
    for (const [root, input] of [['checkbox', '.vitra-checkbox input'], ['radio', '.vitra-radio input']]) {
      const sel = '[data-component="' + root + '"] ' + input;
      // A keyboard interaction first, so programmatic focus counts as :focus-visible.
      await page.keyboard.press('Shift');
      await page.locator(sel + ':not(:disabled)').first().focus();
      const focus = await page.locator(sel + ':not(:disabled)').first().evaluate((el) => {
        const cs = getComputedStyle(el);
        return { match: el.matches(':focus-visible'), style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
      });
      expect(focus, root + ' focus').toEqual({ match: true, style: 'solid', width: 2 });
      const opacity = await page.locator(sel + ':disabled').first().evaluate((el) => parseFloat(getComputedStyle(el).opacity));
      expect(opacity, root + ' disabled opacity').toBeLessThan(1);
    }
  });

  test('[contract] forced colors: the painted control is handed back to the system and checked differs from unchecked', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await openSink(page);
    const matches = await page.evaluate(() => matchMedia('(forced-colors: active)').matches);
    test.skip(!matches, 'this browser cannot emulate forced-colors');
    for (const [root, input] of [['checkbox', '.vitra-checkbox input'], ['radio', '.vitra-radio input']]) {
      const base = '[data-component="' + root + '"] ' + input;
      const on = page.locator(base + ':checked');
      const off = page.locator(base + ':not(:checked):not(:disabled)').first();
      expect(await on.evaluate((el) => getComputedStyle(el).appearance), root + ' appearance').toBe('auto');
      expect(await on.evaluate((el) => getComputedStyle(el, '::before').content), root + ' mark').toBe('none');
      const [a, b] = [await on.screenshot(), await off.screenshot()];
      expect(a.equals(b), root + ' checked looks like unchecked').toBe(false);
    }
  });
});

// ---------------------------------------------------------------- touch ---

const TOUCH_COMPONENTS = [
  'button', 'input', 'toggle', 'radio', 'checkbox', 'select', 'tabs', 'modal',
  'drawer', 'dropdown', 'tooltip', 'alert', 'navbar',
];
const TOUCH_IDS = {
  alert: 'K-alert-touch',
  button: 'K-button-touch',
  checkbox: 'K-checkbox-touch',
  modal: 'C12-modal',
  navbar: 'K-navbar-touch',
  radio: 'C12-radio',
  toggle: 'C6',
};

const OPEN_FOR_TOUCH = {
  modal: async (page) => {
    await page.evaluate(() => window.Vitra.modal.open('#ks-modal'));
    await page.waitForTimeout(500);
  },
  drawer: async (page) => {
    await page.evaluate(() => {
      if (window.Vitra.drawer) window.Vitra.drawer.open('#ks-drawer');
      else document.querySelector('#ks-drawer').classList.add('open');
    });
    await page.waitForTimeout(500);
  },
  dropdown: async (page) => {
    await page.locator('#ks-dd [data-vitra-dropdown-toggle]').click();
    await page.waitForTimeout(400);
  },
};

test.describe('touch targets', () => {
  test.use({ hasTouch: true });

  for (const component of TOUCH_COMPONENTS) {
    const id = TOUCH_IDS[component];
    test(`[${id || 'contract'}] touch targets >= 44px at 360x740: ${component}`, async ({ page }) => {
      if (id) expectedFail(test, id);
      await openSink(page, { viewport: MOBILE });
      if (OPEN_FOR_TOUCH[component]) await OPEN_FOR_TOUCH[component](page);
      const { checked, small } = await page.evaluate((component) => {
        const root = document.querySelector(`[data-component="${component}"]`);
        const name = (el) =>
          el.tagName.toLowerCase() +
          (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '') +
          (el.dataset && el.dataset.state ? `[${el.dataset.state}]` : '');
        const visible = (el) =>
          el.checkVisibility({ visibilityProperty: true }) && el.getClientRects().length > 0;
        const sel = 'a, button, input, select, label[for], [role=tab], [role=button]';
        const targets = new Set();
        for (const el of root.querySelectorAll(sel)) {
          // Checkbox/radio/switch inputs are small or visually hidden: the
          // tappable row is their label.
          if (el.matches('input[type=checkbox], input[type=radio]')) {
            const label = el.closest('label') || (el.id && root.querySelector(`label[for="${el.id}"]`));
            if (label) targets.add(label);
            else targets.add(el);
          } else {
            targets.add(el);
          }
        }
        const small = [];
        let checked = 0;
        for (const el of targets) {
          if (!visible(el) || el.closest(':disabled, [data-state="disabled"]') || el.matches(':disabled')) continue;
          checked++;
          const r = el.getBoundingClientRect();
          if (r.width < 43.99 || r.height < 43.99) {
            small.push(`${name(el)} ${r.width.toFixed(1)}x${r.height.toFixed(1)}`);
          }
        }
        return { checked, small };
      }, component);
      expect(checked, 'something was measured').toBeGreaterThan(0);
      expect(small).toEqual([]);
    });
  }

  test('[C12-tabs] tabs scroll horizontally instead of overflowing their container', async ({ page }) => {
    expectedFail(test, 'C12-tabs');
    await openSink(page, { viewport: MOBILE });
    const info = await page.evaluate(() => {
      const bar = document.querySelector('[data-component="tabs"] [data-state="long-text"] .vitra-tabs');
      const cs = getComputedStyle(bar);
      return {
        overflows: bar.scrollWidth > bar.clientWidth,
        overflowX: cs.overflowX,
        wraps: cs.flexWrap !== 'nowrap',
      };
    });
    // Either the bar wraps or it scrolls; spilling out of its box is the bug.
    const spills = info.overflows && info.overflowX === 'visible' && !info.wraps;
    expect(spills, JSON.stringify(info)).toBe(false);
  });
});

// ------------------------------------------------------------- overflow ---

const OVERFLOW_STATES = {
  modal: async (page) => {
    await page.evaluate(() => window.Vitra.modal.open('#ks-modal'));
    await page.waitForTimeout(500);
  },
  drawer: async (page) => {
    await page.evaluate(() => {
      if (window.Vitra.drawer) window.Vitra.drawer.open('#ks-drawer');
      else document.querySelector('#ks-drawer').classList.add('open');
    });
    await page.waitForTimeout(500);
  },
  dropdown: async (page) => {
    await page.locator('#ks-dd [data-vitra-dropdown-toggle]').click();
    await page.waitForTimeout(400);
  },
  tooltip: async (page) => {
    await page.locator('[data-state="long-text"][data-vitra-tooltip]').focus();
    await page.locator('.vitra-tooltip-js').waitFor();
    await page.waitForTimeout(400);
  },
  toasts: async (page) => {
    for (const t of ['success', 'error', 'info', 'warning', 'sticky']) {
      await page.locator(`#ks-toast-btn-${t}`).click();
    }
    await page.waitForTimeout(500);
  },
};
const OVERFLOW_STATE_IDS = { tooltip: 'J13' };
const OVERFLOW_COMPONENT_IDS = {
  badge: 'K-badge-overflow',
  checkbox: 'K-checkbox-overflow',
  radio: 'K-radio-overflow',
  spinner: 'K-spinner-overflow',
  tabs: 'C12-tabs',
  toggle: 'K-toggle-overflow',
};

// Wait until every running finite, time-based animation and transition on
// the page has ended (paused and scroll-driven ones never finish).
const settle = (page) => page.evaluate(() => Promise.all(document.getAnimations()
  .filter((a) => a.playState === 'running' && a.timeline === document.timeline &&
    a.effect && a.effect.getComputedTiming().iterations !== Infinity)
  .map((a) => a.finished.catch(() => {}))));

const scrollWidth = (page) =>
  page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
    inner: window.innerWidth,
  }));

test.describe('horizontal overflow at 360px', () => {
  // Whole kitchen sink at rest with ordinary content: the long-text variants
  // are hidden because each has its own per-component test below.
  test('[contract] no horizontal overflow at 360x740: whole page at rest', async ({ page }) => {
    await openSink(page, { viewport: MOBILE });
    await page.addStyleTag({ content: '[data-state="long-text"] { display: none !important; }' });
    const w = await scrollWidth(page);
    expect(w.scroll, JSON.stringify(w)).toBe(360);
  });

  // Overlay states are measured with the long-text variants hidden (except
  // the long tooltip trigger), so they report only what opening the overlay
  // itself adds to the page width.
  for (const [state, open] of Object.entries(OVERFLOW_STATES)) {
    const id = OVERFLOW_STATE_IDS[state];
    test(`[${id || 'contract'}] no horizontal overflow at 360x740: ${state} open`, async ({ page }) => {
      if (id) expectedFail(test, id);
      await openSink(page, { viewport: MOBILE });
      await page.addStyleTag({ content: '[data-state="long-text"]:not([data-vitra-tooltip]) { display: none !important; }' });
      await open(page);
      const w = await scrollWidth(page);
      expect(w.scroll, JSON.stringify(w)).toBe(360);
    });
  }

  // A closed menu is visibility: hidden, which still creates scrollable
  // overflow: measure the page with the long items present, closed and open.
  for (const dd of ['#ks-dd', '#ks-dd-popover']) {
    test(`[contract] a long dropdown item does not widen the 360px page: ${dd} closed and open`, async ({ page }) => {
      await openSink(page, { viewport: MOBILE });
      await page.addStyleTag({ content: '[data-state="long-text"]:not(.vitra-dropdown-item) { display: none !important; }' });
      expect((await scrollWidth(page)).scroll, 'closed').toBe(360);
      await page.locator(`${dd} [data-vitra-dropdown-toggle]`).click();
      await expect(page.locator(`${dd} .vitra-dropdown-item[data-state="long-text"]`)).toBeVisible();
      await settle(page);
      const w = await scrollWidth(page);
      expect(w.scroll, 'open ' + JSON.stringify(w)).toBe(360);
      const r = await page.locator(`${dd} .vitra-dropdown-menu`).evaluate((m) => m.getBoundingClientRect().toJSON());
      expect(r.left, 'menu inside the viewport').toBeGreaterThanOrEqual(0);
      expect(r.right, 'menu inside the viewport').toBeLessThanOrEqual(360);
    });
  }

  // The whole page with the long-text variant of every component visible.
  // The scenery section's paragraph is plain author text, not a component.
  test('[contract] no horizontal overflow at 360x740: whole page with every long-text variant', async ({ page }) => {
    await openSink(page, { viewport: MOBILE });
    await page.addStyleTag({ content: '[data-component="scenery"] p[data-state="long-text"] { display: none !important; }' });
    const w = await scrollWidth(page);
    expect(w.scroll, JSON.stringify(w)).toBe(360);
  });

  // Every overlay opened WITH its long-text content visible: nothing may
  // scroll the page sideways (the whole page's long-text variants stay in,
  // except the scenery paragraph, see above).
  const OVERLAYS_WITH_LONG_TEXT = {
    'dropdown menu': async (page) => {
      await page.locator('#ks-dd [data-vitra-dropdown-toggle]').click();
      await expect(page.locator('#ks-dd .vitra-dropdown-item').first()).toBeVisible();
    },
    'popover menu': async (page) => {
      await page.locator('#ks-dd-popover [data-vitra-dropdown-toggle]').click();
      await expect(page.locator('#ks-dd-popover .vitra-dropdown-item').first()).toBeVisible();
    },
    modal: async (page) => {
      await page.evaluate(() => window.Vitra.modal.open('#ks-modal'));
      await expect(page.locator('#ks-modal [data-state="long-text"]')).toBeVisible();
    },
    drawer: async (page) => {
      await page.evaluate(() => window.Vitra.drawer.open('#ks-drawer'));
      await expect(page.locator('#ks-drawer [data-state="long-text"]')).toBeVisible();
    },
    toast: async (page) => {
      await page.locator('#ks-toast-btn-long').click();
      await expect(page.locator('.vitra-toast.show')).toBeVisible();
    },
    tooltip: async (page) => {
      await page.locator('[data-state="long-text"][data-vitra-tooltip]').focus();
      await expect(page.locator('.vitra-tooltip-js')).toBeVisible();
    },
  };
  for (const [name, open] of Object.entries(OVERLAYS_WITH_LONG_TEXT)) {
    test(`[contract] no horizontal overflow at 360x740 with long text: ${name} open`, async ({ page }) => {
      await openSink(page, { viewport: MOBILE });
      await page.addStyleTag({ content: '[data-component="scenery"] p[data-state="long-text"] { display: none !important; }' });
      await open(page);
      await settle(page);
      const w = await scrollWidth(page);
      expect(w.scroll, JSON.stringify(w)).toBe(360);
    });
  }

  // Long text inside each component must stay within the viewport. Elements
  // under position:fixed or inside a clipping/scrolling ancestor cannot widen
  // the page and are ignored.
  for (const component of CONTRAST_COMPONENTS) {
    const id = OVERFLOW_COMPONENT_IDS[component];
    test(`[${id || 'contract'}] long text stays inside 360px: ${component}`, async ({ page }) => {
      if (id) expectedFail(test, id);
      await openSink(page, { viewport: MOBILE });
      const offenders = await page.evaluate((component) => {
        const root = document.querySelector(`[data-component="${component}"]`);
        const name = (el) =>
          el.tagName.toLowerCase() +
          (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : '') +
          (el.dataset && el.dataset.state ? `[${el.dataset.state}]` : '');
        const widensPage = (el) => {
          for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
            const cs = getComputedStyle(n);
            if (cs.position === 'fixed') return false;
            if (n !== el && n !== document.body && cs.overflowX !== 'visible') return false;
          }
          return true;
        };
        const out = [];
        for (const el of root.querySelectorAll('*')) {
          if (!el.checkVisibility({ visibilityProperty: true }) || !widensPage(el)) continue;
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.right > 360.5) out.push(`${name(el)} right=${Math.round(r.right)}`);
        }
        return out;
      }, component);
      expect(offenders).toEqual([]);
    });
  }
});

// -------------------------------------------------------- reduced motion ---

test.describe('reduced motion', () => {
  const MOTION_ID = '';
  test(`[${MOTION_ID || 'contract'}] reduced motion: zero running animations`, async ({ page }) => {
    if (MOTION_ID) expectedFail(test, MOTION_ID);
    const running = [];
    for (const s of SCHEMES) {
      await openSink(page, { ...s, reducedMotion: true });
      await page.waitForTimeout(300);
      const list = await page.evaluate(() =>
        document.getAnimations()
          .filter((a) => a.playState === 'running')
          .map((a) => {
            const t = a.effect && a.effect.target;
            const owner = t && t.closest ? t.closest('[data-component]') : null;
            const pseudo = a.effect && a.effect.pseudoElement ? a.effect.pseudoElement : '';
            return `${a.animationName || a.transitionProperty || 'anim'} on ${t && t.tagName ? t.tagName.toLowerCase() + (t.className && typeof t.className === 'string' ? '.' + t.className.trim().split(/\s+/)[0] : '') : '?'}${pseudo} in ${owner ? owner.dataset.component : 'page'}`;
          }));
      running.push(...list.map((l) => `${schemeLabel(s)}: ${l}`));
    }
    expect(running).toEqual([]);
  });

  test('[C9] burger .active draws an X under reduced motion', async ({ page }) => {
    await openSink(page, { reducedMotion: true, viewport: MOBILE });
    await page.evaluate(() => document.querySelector('#ks-drawer-toggle').classList.add('active'));
    await page.waitForTimeout(100);
    const lines = await page.evaluate(() =>
      [...document.querySelectorAll('#ks-drawer-toggle .vitra-burger-line')].map((l) => {
        const cs = getComputedStyle(l);
        return { opacity: cs.opacity, transform: cs.transform };
      }));
    expect(lines).toHaveLength(3);
    expect(lines[1].opacity).toBe('0');
    expect(lines[0].transform).not.toBe('none');
    expect(lines[2].transform).not.toBe('none');
  });
});

// ------------------------------------------------- auto = light | dark ---

// [data-theme="auto"] is generated by the build from the light and dark
// rules (scripts/lib/auto-mirror.cjs): on the sample (the root, one element per
// component, the modal panel, gradient text and the scenery layers with their
// pseudo-elements) it must compute exactly like the theme it follows.
test.describe('auto theme', () => {
  for (const scheme of ['light', 'dark']) {
    test(`[contract] auto+${scheme} computes like ${scheme}`, async ({ page }) => {
      await openSink(page, { theme: scheme });
      const reference = await sampleStyles(page);
      expect(Object.keys(reference).length).toBeGreaterThanOrEqual(40);
      await openSink(page, { theme: 'auto', scheme });
      expect(await sampleStyles(page)).toEqual(reference);
    });
  }

  test('[contract] auto follows the OS scheme live, without a reload', async ({ page }) => {
    await openSink(page, { theme: 'auto', scheme: 'light' });
    const light = await sampleStyles(page);
    await page.emulateMedia({ colorScheme: 'dark' });
    const dark = await sampleStyles(page);
    expect(dark).not.toEqual(light);
    await openSink(page, { theme: 'dark' });
    expect(dark).toEqual(await sampleStyles(page));
    await openSink(page, { theme: 'auto', scheme: 'dark' });
    await page.emulateMedia({ colorScheme: 'light' });
    expect(await sampleStyles(page)).toEqual(light);
  });
});

// ---------------------------------------------------------------- stars ---

// Stars belong to every dark-scheme theme and to a page with no theme at all
// (the :root defaults are the dark palette). Where they are hidden they must
// not animate either (C17).
test.describe('scenery stars', () => {
  const STARS = [
    { label: 'dark', open: { theme: 'dark' }, visible: true },
    { label: 'neon', open: { theme: 'neon' }, visible: true },
    { label: 'ocean', open: { theme: 'ocean' }, visible: true },
    { label: 'emerald', open: { theme: 'emerald' }, visible: true },
    { label: 'no theme', open: {}, visible: true },
    { label: 'auto+dark', open: { theme: 'auto', scheme: 'dark' }, visible: true },
    { label: 'light', open: { theme: 'light' }, visible: false },
    { label: 'pastel', open: { theme: 'pastel' }, visible: false },
    { label: 'auto+light', open: { theme: 'auto', scheme: 'light' }, visible: false },
  ];

  const probe = (page) => page.evaluate(() => {
    const layers = [...document.querySelectorAll('.vitra-scenery-stars')];
    const skies = [...document.querySelectorAll('.vitra-scenery-sky')];
    const vis = (el, pseudo) => getComputedStyle(el, pseudo).visibility;
    const animations = document.getAnimations().map((a) => ({
      name: a.animationName,
      pseudo: a.effect && a.effect.pseudoElement ? a.effect.pseudoElement : '',
      star: !!(a.effect && a.effect.target && layers.some((l) => l.contains(a.effect.target))),
      sky: !!(a.effect && a.effect.target && skies.includes(a.effect.target)),
    }));
    return {
      hasThemeAttr: document.documentElement.hasAttribute('data-theme'),
      count: layers.length,
      stars: layers.map((l) => vis(l)),
      farStars: skies.map((s) => vis(s, '::before')),
      shooting: skies.map((s) => vis(s, '::after')),
      twinkle: animations.filter((a) => a.star && a.pseudo === '').length,
      shootingAnims: animations.filter((a) => a.sky && a.pseudo === '::after').length,
      starAnims: animations.filter((a) => a.star || (a.sky && a.pseudo === '::after')).map((a) => a.name),
    };
  });

  for (const { label, open, visible } of STARS) {
    test(`[C17] stars are ${visible ? 'visible and twinkling' : 'hidden and still'} in ${label}`, async ({ page }) => {
      await openSink(page, open);
      const r = await probe(page);
      expect(r.hasThemeAttr).toBe(open.theme !== undefined);
      expect(r.count).toBeGreaterThan(0);
      const want = visible ? 'visible' : 'hidden';
      expect(r.stars).toEqual(Array(r.count).fill(want));
      expect(r.farStars).toEqual(Array(r.count).fill(want));
      expect(r.shooting).toEqual(Array(r.count).fill(want));
      if (visible) {
        expect(r.twinkle).toBeGreaterThanOrEqual(r.count);
        expect(r.shootingAnims).toBe(r.count);
      } else {
        expect(r.starAnims).toEqual([]);
      }
    });
  }
});

// --------------------------------------------------------------- reveal ---

// The kitchen sink has no data-config, so reveal.init() never runs on it
// unless a test calls it: it is the page without init.
test.describe('reveal', () => {
  const VARIANTS = ['up', 'left', 'scale', 'blur'];
  const opacity = (page, state) => page.locator(`[data-component="reveal"] [data-state="${state}"]`)
    .evaluate((el) => getComputedStyle(el).opacity);
  const settleOn = (page, sel) => page.locator(sel).evaluate((el) =>
    Promise.all(el.getAnimations().map((a) => a.finished.catch(() => {}))));

  test('[contract] directional variants without reveal.init() end visible, as in 1.13.5', async ({ page }) => {
    await openSink(page);
    for (const state of VARIANTS) {
      await settleOn(page, `[data-component="reveal"] [data-state="${state}"]`);
      expect(await opacity(page, state), state).toBe('1');
    }
  });

  test('[contract] with reveal.init() a directional variant below the fold waits, then reveals on scroll', async ({ page }) => {
    await openSink(page);
    const sel = '[data-component="reveal"] [data-state="up"]';
    await page.evaluate(() => {
      const spacer = document.createElement('div');
      spacer.style.height = '4000px';
      const section = document.querySelector('[data-component="reveal"]');
      section.parentNode.insertBefore(spacer, section);
      window.scrollTo(0, 0);
      window.Vitra.reveal.init();
    });
    await settleOn(page, sel);
    expect(await opacity(page, 'up'), 'hidden while below the fold').toBe('0');
    await page.locator(sel).evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect.poll(async () => {
      await settleOn(page, sel);
      return opacity(page, 'up');
    }, { message: 'visible once scrolled into view' }).toBe('1');
  });
});

// ---------------------------------------------------------------- no JS ---

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('[J2] .vitra-reveal content stays visible', async ({ page }) => {
    await page.goto('/tests/kitchen-sink');
    // The stylesheet must have loaded (via <noscript>) or the check is vacuous.
    const cssLoaded = await page.locator('.vitra-btn').first().evaluate(
      (el) => getComputedStyle(el).borderRadius !== '0px');
    expect(cssLoaded, 'vitra css applied without JS').toBe(true);
    const reveals = page.locator('.vitra-reveal');
    expect(await reveals.count()).toBeGreaterThan(0);
    const opacities = await reveals.evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity));
    expect(opacities.filter((o) => parseFloat(o) === 0)).toEqual([]);
  });
});

// ---------------------------------------------------------- screenshots ---

test.describe('screenshots', () => {
  for (const s of SCHEMES) {
    test(`[contract] full-page screenshot: ${schemeLabel(s)}`, async ({ page }, testInfo) => {
      await openSink(page, s);
      const shot = await page.screenshot({ fullPage: true });
      await testInfo.attach(`kitchen-sink-${schemeLabel(s)}.png`, { body: shot, contentType: 'image/png' });
      expect(shot.length).toBeGreaterThan(0);
    });
  }
});
