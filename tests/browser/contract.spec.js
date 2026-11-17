import { test, expect } from '@playwright/test';
import { SCHEMES, schemeLabel, openSink, scanContrast, expectedFail } from './helpers.js';

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
    await page.evaluate(() => document.querySelector('#ks-drawer').classList.add('open'));
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

// ---------------------------------------------------------------- touch ---

const TOUCH_COMPONENTS = [
  'button', 'input', 'toggle', 'radio', 'checkbox', 'select', 'tabs', 'modal',
  'drawer', 'dropdown', 'tooltip', 'alert', 'navbar',
];
const TOUCH_IDS = {
  alert: 'K-alert-touch',
  button: 'K-button-touch',
  checkbox: 'K-checkbox-touch',
  modal: 'C12',
  navbar: 'K-navbar-touch',
  radio: 'C12',
  toggle: 'C6',
};

const OPEN_FOR_TOUCH = {
  modal: async (page) => {
    await page.evaluate(() => window.Vitra.modal.open('#ks-modal'));
    await page.waitForTimeout(500);
  },
  drawer: async (page) => {
    await page.evaluate(() => document.querySelector('#ks-drawer').classList.add('open'));
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

  test('[C12] tabs scroll horizontally instead of overflowing their container', async ({ page }) => {
    expectedFail(test, 'C12');
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
    await page.evaluate(() => document.querySelector('#ks-drawer').classList.add('open'));
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
  tabs: 'C12',
  toggle: 'K-toggle-overflow',
};

const scrollWidth = (page) =>
  page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
    inner: window.innerWidth,
  }));

test.describe('horizontal overflow at 360px', () => {
  // Whole kitchen sink at rest. It includes the long-text variants of every
  // component, so it stays red until every per-component test below is green.
  const REST_ID = 'K-overflow-page';
  test(`[${REST_ID}] no horizontal overflow at 360x740: whole page at rest`, async ({ page }) => {
    if (REST_ID) expectedFail(test, REST_ID);
    await openSink(page, { viewport: MOBILE });
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
