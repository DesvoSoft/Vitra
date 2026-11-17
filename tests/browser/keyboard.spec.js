import { test, expect } from '@playwright/test';
import { openSink, expectedFail } from './helpers.js';

// Keyboard and screen-reader flows (spec section 3). One test per flow. The
// first argument of every title is the audit id (or invented K- id) the test
// is filed under in known-failures.js.

const MOBILE = { width: 360, height: 740 };

const activeId = (page) => page.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.tagName));
const isInside = (page, sel) =>
  page.evaluate((sel) => {
    const root = document.querySelector(sel);
    return !!root && root.contains(document.activeElement);
  }, sel);
const attr = (page, sel, name) => page.locator(sel).first().getAttribute(name);

/** Focus a control and activate it with the keyboard, as a user would. */
async function activate(page, sel, key = 'Enter') {
  await page.locator(sel).focus();
  await page.keyboard.press(key);
}

// ----------------------------------------------------------------- modal ---

test.describe('modal', () => {
  test('[J7] modal: focus lands inside synchronously on open, not after a later frame', async ({ page }) => {
    await openSink(page);
    const r = await page.evaluate(() => {
      Vitra.modal.open('#ks-modal');
      const el = document.querySelector('#ks-modal');
      return { inside: el.contains(document.activeElement), visibility: getComputedStyle(el).visibility };
    });
    expect(r.visibility, 'overlay is visible as soon as it opens').toBe('visible');
    expect(r.inside, 'focus is inside the modal in the same task as open()').toBe(true);
  });

  test('[contract] modal: focus enters, Tab cycles inside, Esc closes and focus returns to the opener', async ({ page }) => {
    await openSink(page);
    await activate(page, '#ks-modal-open');
    await expect(page.locator('#ks-modal')).toHaveAttribute('aria-hidden', 'false');
    await expect.poll(() => isInside(page, '#ks-modal'), { message: 'focus moved into the modal' }).toBe(true);

    // Forward and backward past the last/first focusable never leaves the modal.
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      expect(await isInside(page, '#ks-modal'), `Tab #${i + 1} stays inside`).toBe(true);
    }
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Shift+Tab');
      expect(await isInside(page, '#ks-modal'), `Shift+Tab #${i + 1} stays inside`).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(page.locator('#ks-modal')).toHaveAttribute('aria-hidden', 'true');
    await expect.poll(() => activeId(page)).toBe('ks-modal-open');
  });

  test('[J7] modal without focusables: the container takes focus and Tab does not escape', async ({ page }) => {
    expectedFail(test, 'J7');
    await openSink(page);
    await activate(page, '#ks-modal-empty-open');
    await expect(page.locator('#ks-modal-empty')).toHaveAttribute('aria-hidden', 'false');
    await expect
      .poll(() => isInside(page, '#ks-modal-empty'), { message: 'focus moved into the empty modal' })
      .toBe(true);
    const focused = await page.evaluate(() => {
      const a = document.activeElement;
      return { tab: a.getAttribute('tabindex'), role: a.getAttribute('role'), tag: a.tagName };
    });
    expect(focused.tab, JSON.stringify(focused)).toBe('-1');
    await page.keyboard.press('Tab');
    expect(await isInside(page, '#ks-modal-empty'), 'Tab stays inside').toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('#ks-modal-empty')).toHaveAttribute('aria-hidden', 'true');
    await expect.poll(() => activeId(page)).toBe('ks-modal-empty-open');
  });

  test("[J7] modal restores the author's body overflow", async ({ page }) => {
    expectedFail(test, 'J7');
    await openSink(page);
    await page.evaluate(() => { document.body.style.overflow = 'scroll'; });
    await activate(page, '#ks-modal-open');
    await expect(page.locator('#ks-modal')).toHaveAttribute('aria-hidden', 'false');
    await page.keyboard.press('Escape');
    await expect(page.locator('#ks-modal')).toHaveAttribute('aria-hidden', 'true');
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('scroll');
  });

  test('[J7] modal keeps an author role and only borrows dialog when there is none', async ({ page }) => {
    expectedFail(test, 'J7');
    await openSink(page);
    const role = (sel) => page.locator(sel).getAttribute('role');
    await page.evaluate(() => window.Vitra.modal.open('#ks-modal-alert'));
    expect(await role('#ks-modal-alert'), 'author alertdialog kept while open').toBe('alertdialog');
    await page.keyboard.press('Escape');
    await expect(page.locator('#ks-modal-alert')).toHaveAttribute('aria-hidden', 'true');
    expect(await role('#ks-modal-alert'), 'author alertdialog kept after close').toBe('alertdialog');

    await page.evaluate(() => window.Vitra.modal.open('#ks-modal-norole'));
    expect(await role('#ks-modal-norole'), 'no author role: dialog while open').toBe('dialog');
    await page.keyboard.press('Escape');
    await expect(page.locator('#ks-modal-norole')).toHaveAttribute('aria-hidden', 'true');
    expect(await role('#ks-modal-norole'), 'no author role: none after close').toBeNull();
  });

  test('[J7] modal closed before its deferred focus fires does not steal focus afterwards', async ({ page }) => {
    expectedFail(test, 'J7');
    await openSink(page);
    await page.locator('#ks-modal-open').focus();
    // A focus() on a hidden element is a silent no-op, so watch the calls
    // instead of the final activeElement.
    const calls = await page.evaluate(async () => {
      const seen = [];
      const orig = HTMLElement.prototype.focus;
      HTMLElement.prototype.focus = function (...a) {
        if (this.closest('#ks-modal')) seen.push(this.tagName.toLowerCase() + (this.id ? '#' + this.id : ''));
        return orig.apply(this, a);
      };
      window.Vitra.modal.open('#ks-modal');
      window.Vitra.modal.close('#ks-modal');
      // A synchronous focus inside open() is allowed; only calls made after
      // close() returned (the deferred ones) are a bug.
      seen.length = 0;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise((r) => setTimeout(r, 600));
      HTMLElement.prototype.focus = orig;
      return seen;
    });
    expect(calls, 'no focus() call lands inside the modal after close() returned').toEqual([]);
    expect(await isInside(page, '#ks-modal'), 'focus is not inside the closed modal').toBe(false);
  });

  test('[J7] modal trap ignores hidden focusables and picks up ones added later', async ({ page }) => {
    expectedFail(test, 'J7');
    await openSink(page);
    await page.evaluate(() => {
      const footer = document.querySelector('#ks-modal .vitra-modal-footer');
      const hidden = document.createElement('button');
      hidden.textContent = 'hidden';
      hidden.hidden = true;
      footer.appendChild(hidden);
    });
    await activate(page, '#ks-modal-open');
    await expect.poll(() => isInside(page, '#ks-modal')).toBe(true);
    // Add a button after opening: it must become part of the cycle.
    await page.evaluate(() => {
      const late = document.createElement('button');
      late.id = 'ks-late';
      late.textContent = 'late';
      document.querySelector('#ks-modal .vitra-modal-footer').appendChild(late);
    });
    await page.locator('#ks-late').focus();
    await page.keyboard.press('Tab');
    expect(await isInside(page, '#ks-modal'), 'Tab past the last button wraps inside').toBe(true);
    await page.keyboard.press('Shift+Tab');
    expect(await activeId(page), 'Shift+Tab from the first wraps to the late button').toBe('ks-late');
  });
});

// ---------------------------------------------------------------- drawer ---

test.describe('drawer', () => {
  test('[J9] drawer: toggle opens it, focus enters, Tab is trapped, Esc closes and focus returns', async ({ page }) => {
    expectedFail(test, 'J9');
    await openSink(page, { viewport: MOBILE });
    await activate(page, '#ks-drawer-toggle');
    await expect(page.locator('#ks-drawer')).toHaveClass(/\bopen\b/);
    expect(await attr(page, '#ks-drawer-toggle', 'aria-expanded')).toBe('true');
    await expect(page.locator('#ks-drawer-toggle')).toHaveClass(/\bactive\b/);
    await expect.poll(() => isInside(page, '#ks-drawer'), { message: 'focus moved into the drawer' }).toBe(true);
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      expect(await isInside(page, '#ks-drawer'), `Tab #${i + 1} stays inside`).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('#ks-drawer')).not.toHaveClass(/\bopen\b/);
    expect(await attr(page, '#ks-drawer-toggle', 'aria-expanded')).toBe('false');
    await expect.poll(() => activeId(page)).toBe('ks-drawer-toggle');
  });

  test('[J9] drawer: closed drawer is inert and out of the tab order', async ({ page }) => {
    expectedFail(test, 'J9');
    await openSink(page, { viewport: MOBILE });
    expect(await page.locator('#ks-drawer').evaluate((el) => el.inert), 'closed drawer is inert').toBe(true);
    await page.locator('#ks-drawer-toggle').focus();
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      expect(await isInside(page, '#ks-drawer'), `Tab #${i + 1} does not land in the closed drawer`).toBe(false);
    }
  });

  test('[J9] drawer: close button and overlay click close it', async ({ page }) => {
    expectedFail(test, 'J9');
    await openSink(page, { viewport: MOBILE });
    await activate(page, '#ks-drawer-toggle');
    await expect(page.locator('#ks-drawer')).toHaveClass(/\bopen\b/);
    await page.locator('#ks-drawer .vitra-drawer-close').click();
    await expect(page.locator('#ks-drawer')).not.toHaveClass(/\bopen\b/);

    await activate(page, '#ks-drawer-toggle');
    await expect(page.locator('#ks-drawer')).toHaveClass(/\bopen\b/);
    await expect(page.locator('[data-component="drawer"] .vitra-drawer-overlay')).toHaveClass(/\bopen\b/);
    // Click the overlay on the side the drawer does not cover.
    await page.mouse.click(4, MOBILE.height - 4);
    await expect(page.locator('#ks-drawer')).not.toHaveClass(/\bopen\b/);
  });

  test('[J9] drawer: a modal opened from inside keeps the scroll lock and returns focus into the drawer', async ({ page }) => {
    await openSink(page, { viewport: MOBILE });
    await activate(page, '#ks-drawer-toggle');
    await expect(page.locator('#ks-drawer')).toHaveClass(/open/);
    await activate(page, '#ks-drawer-modal-open');
    await expect(page.locator('#ks-modal')).toHaveAttribute('aria-hidden', 'false');
    await expect(page.locator('#ks-drawer')).toHaveClass(/open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#ks-modal')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('#ks-drawer')).toHaveClass(/open/);
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden');
    await expect.poll(() => isInside(page, '#ks-drawer')).toBe(true);
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      expect(await isInside(page, '#ks-drawer'), `Tab #${i + 1} stays inside the drawer`).toBe(true);
    }
  });

  test('[J9] drawer opened by the author script (.open) is left untouched by the module', async ({ page }) => {
    await openSink(page, { viewport: MOBILE });
    const before = await page.evaluate(() => ({
      inert: document.querySelector('#ks-drawer-manual').inert,
      hidden: document.querySelector('#ks-drawer-manual').getAttribute('aria-hidden'),
    }));
    await page.evaluate(() => document.querySelector('#ks-drawer-manual').classList.add('open'));
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => {
      const d = document.querySelector('#ks-drawer-manual');
      return { inert: d.inert, hidden: d.getAttribute('aria-hidden'), left: d.getBoundingClientRect().left };
    });
    // Manual drawers are not managed: no inert is added, and it is reachable.
    expect(before.inert, 'manual drawer not made inert at init').toBe(false);
    expect(after.inert).toBe(false);
    expect(after.hidden).toBe(before.hidden);
    expect(after.left).toBeGreaterThanOrEqual(0);
    await page.locator('#ks-drawer-manual .vitra-drawer-link').focus();
    expect(await isInside(page, '#ks-drawer-manual')).toBe(true);
  });
});

// -------------------------------------------------------------- dropdown ---

for (const [kind, sel] of [['classic', '#ks-dd'], ['popover', '#ks-dd-popover']]) {
  test.describe(`dropdown (${kind})`, () => {
    const toggle = `${sel} [data-vitra-dropdown-toggle]`;
    const items = `${sel} .vitra-dropdown-item`;
    const focusedIndex = (page) =>
      page.evaluate((items) => [...document.querySelectorAll(items)].indexOf(document.activeElement), items);

    test(`[J6] dropdown (${kind}): opening focuses the first item; arrows, Home and End move between items`, async ({ page }) => {
      expectedFail(test, 'J6');
      await openSink(page);
      await activate(page, toggle);
      await expect(page.locator(toggle)).toHaveAttribute('aria-expanded', 'true');
      await expect.poll(() => focusedIndex(page), { message: 'first item focused on open' }).toBe(0);
      await page.keyboard.press('ArrowDown');
      expect(await focusedIndex(page), 'ArrowDown').toBe(1);
      await page.keyboard.press('ArrowUp');
      expect(await focusedIndex(page), 'ArrowUp').toBe(0);
      await page.keyboard.press('End');
      const last = (await page.locator(items).count()) - 1;
      expect(await focusedIndex(page), 'End').toBe(last);
      await page.keyboard.press('Home');
      expect(await focusedIndex(page), 'Home').toBe(0);
    });

    // Where Tab / Shift+Tab should land: the neighbours of the whole dropdown
    // among the controls outside any dropdown menu, in document order.
    const neighbours = (page) => page.evaluate((sel) => {
      const dd = document.querySelector(sel);
      const all = [...document.querySelectorAll('button, a[href], input, select, textarea, [tabindex]')]
        .filter((e) => !e.closest('.vitra-dropdown-menu') && !e.disabled && e.tabIndex >= 0 && e.getClientRects().length && !e.closest('[inert]') && getComputedStyle(e).visibility !== 'hidden');
      const mark = (e) => (e ? e.textContent.trim() || e.id : null);
      const inside = all.filter((e) => dd.contains(e));
      const next = all.find((e) => dd.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING && !dd.contains(e));
      const prev = [...all].reverse().find((e) => dd.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING && !dd.contains(e));
      return { next: mark(next), prev: mark(prev), inside: inside.length };
    }, sel);
    const where = (page) => page.evaluate((sel) => {
      const a = document.activeElement;
      return { text: a.textContent.trim() || a.id, item: !!a.closest('.vitra-dropdown-menu'), toggle: a === document.querySelector(sel + ' [data-vitra-dropdown-toggle]') };
    }, sel);

    for (const [from, key, expect_] of [
      ['toggle', 'Tab', 'next'], ['item', 'Tab', 'next'], ['item', 'Shift+Tab', 'toggle'], ['toggle', 'Shift+Tab', 'prev'],
    ]) {
      test(`dropdown (${kind}): ${key} from the ${from} closes the menu and focus moves on`, async ({ page }) => {
        await openSink(page);
        const n = await neighbours(page);
        await activate(page, toggle);
        await expect(page.locator(toggle)).toHaveAttribute('aria-expanded', 'true');
        await expect.poll(() => focusedIndex(page)).toBe(0);
        if (from === 'toggle') await page.locator(toggle).focus();
        await page.keyboard.press(key);
        await expect(page.locator(toggle)).toHaveAttribute('aria-expanded', 'false');
        const w = await where(page);
        expect(w.item, 'never on a menu item').toBe(false);
        if (expect_ === 'toggle') expect(w.toggle, 'Shift+Tab from an item lands on the toggle').toBe(true);
        else {
          expect(w.toggle, 'not stuck on the toggle').toBe(false);
          expect(w.text).toBe(n[expect_]);
        }
        await expect(page.locator(items).first()).toBeHidden();
      });
    }

    test(`dropdown (${kind}): after a Tab close, a script can reopen the menu and its first item is focusable and clickable`, async ({ page }) => {
      await openSink(page);
      await activate(page, toggle);
      await expect.poll(() => focusedIndex(page)).toBe(0);
      await page.keyboard.press('Tab');
      await expect(page.locator(toggle)).toHaveAttribute('aria-expanded', 'false');
      await page.evaluate((sel) => {
        const dd = document.querySelector(sel);
        const menu = dd.querySelector('.vitra-dropdown-menu');
        if (menu.hasAttribute('popover')) menu.showPopover(); else dd.classList.add('open');
      }, sel);
      const first = page.locator(items).first();
      await expect(first).toBeVisible();
      await expect.poll(async () => {
        await first.evaluate((el) => el.focus());
        return focusedIndex(page);
      }, { message: 'first item becomes focusable after the guard releases' }).toBe(0);
      await first.click({ timeout: 2000 });
    });

    test(`[contract] dropdown (${kind}): Esc closes it, clears aria-expanded and returns focus to the toggle`, async ({ page }) => {
      await openSink(page);
      await activate(page, toggle);
      await expect(page.locator(items).first()).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator(items).first()).toBeHidden();
      await expect(page.locator(toggle)).toHaveAttribute('aria-expanded', 'false');
      expect(await page.locator(toggle).evaluate((el) => el === document.activeElement), 'focus back on toggle').toBe(true);
    });
  });
}

// ------------------------------------------------------------------ tabs ---

test.describe('tabs', () => {
  const tabs = '#ks-tabs [role=tab]';
  const selectedIndex = (page) =>
    page.evaluate((sel) => [...document.querySelectorAll(sel)].findIndex((t) => t.getAttribute('aria-selected') === 'true'), tabs);
  const focusedIndex = (page) =>
    page.evaluate((sel) => [...document.querySelectorAll(sel)].indexOf(document.activeElement), tabs);

  test('[K-tabs-keyboard] tabs: arrows, Home and End move focus and selection; the panel follows', async ({ page }) => {
    test.skip(true, 'no Vitra.tabs module in 1.14: JS budget; ARIA markup is documented instead');
    await openSink(page);
    await page.locator('#ks-tab-1').focus();
    await page.keyboard.press('ArrowRight');
    expect(await focusedIndex(page), 'ArrowRight focus').toBe(1);
    expect(await selectedIndex(page), 'ArrowRight aria-selected').toBe(1);
    await expect(page.locator('#ks-panel-2')).toBeVisible();
    await expect(page.locator('#ks-panel-1')).toBeHidden();
    await page.keyboard.press('End');
    expect(await focusedIndex(page), 'End focus').toBe(2);
    expect(await selectedIndex(page), 'End aria-selected').toBe(2);
    await page.keyboard.press('ArrowLeft');
    expect(await focusedIndex(page), 'ArrowLeft focus').toBe(1);
    expect(await selectedIndex(page), 'ArrowLeft aria-selected').toBe(1);
    await page.keyboard.press('Home');
    expect(await focusedIndex(page), 'Home focus').toBe(0);
    expect(await selectedIndex(page), 'Home aria-selected').toBe(0);
    await expect(page.locator('#ks-panel-1')).toBeVisible();
  });

  test('[K-tabs-keyboard] tabs: roving tabindex keeps a single tab stop and clicking selects', async ({ page }) => {
    test.skip(true, 'no Vitra.tabs module in 1.14: JS budget; ARIA markup is documented instead');
    await openSink(page);
    await page.locator('#ks-tab-3').click();
    expect(await selectedIndex(page), 'click aria-selected').toBe(2);
    await expect(page.locator('#ks-panel-3')).toBeVisible();
    const tabindexes = await page.locator(tabs).evaluateAll((els) => els.map((e) => e.getAttribute('tabindex')));
    expect(tabindexes, 'only the selected tab is tabbable').toEqual(['-1', '-1', '0']);
  });
});

// --------------------------------------------------------------- tooltip ---

test.describe('tooltip', () => {
  test('[contract] tooltip: keyboard focus shows it, blur hides it', async ({ page }) => {
    await openSink(page);
    await page.locator('#ks-tooltip').focus();
    await expect(page.locator('.vitra-tooltip-js')).toBeVisible();
    expect(await attr(page, '#ks-tooltip', 'aria-describedby')).toBe(await page.locator('.vitra-tooltip-js').getAttribute('id'));
    await page.locator('#ks-tooltip').blur();
    await expect(page.locator('.vitra-tooltip-js')).toHaveCount(0);
  });

  test('[J13] tooltip: Esc hides it while the trigger keeps focus', async ({ page }) => {
    expectedFail(test, 'J13');
    await openSink(page);
    await page.locator('#ks-tooltip').focus();
    await expect(page.locator('.vitra-tooltip-js')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.vitra-tooltip-js')).toHaveCount(0);
    expect(await activeId(page)).toBe('ks-tooltip');
  });

  test('[J13] tooltip: keeps an existing aria-describedby and restores it on hide', async ({ page }) => {
    expectedFail(test, 'J13');
    await openSink(page);
    await page.evaluate(() => {
      const note = document.createElement('p');
      note.id = 'ks-note';
      note.textContent = 'note';
      document.body.appendChild(note);
      document.querySelector('#ks-tooltip').setAttribute('aria-describedby', 'ks-note');
    });
    await page.locator('#ks-tooltip').focus();
    await expect(page.locator('.vitra-tooltip-js')).toBeVisible();
    expect(await attr(page, '#ks-tooltip', 'aria-describedby'), 'author id kept while shown').toContain('ks-note');
    await page.locator('#ks-tooltip').blur();
    await expect(page.locator('.vitra-tooltip-js')).toHaveCount(0);
    expect(await attr(page, '#ks-tooltip', 'aria-describedby'), 'author id restored').toBe('ks-note');
  });

  test('[contract] tooltip: stays inside the 360px viewport when the target hugs the top-left corner', async ({ page }) => {
    await openSink(page, { viewport: MOBILE });
    await page.addStyleTag({ content: '[data-state="long-text"] { display: none !important; }' });
    await page.evaluate(() => {
      const t = document.querySelector('#ks-tooltip');
      t.style.cssText = 'position:fixed;top:0;left:0;margin:0';
      t.setAttribute('data-vitra-tooltip', 'A tooltip that is long enough to need wrapping inside a very narrow viewport');
    });
    await page.locator('#ks-tooltip').focus();
    await expect(page.locator('.vitra-tooltip-js')).toBeVisible();
    const r = await page.evaluate(() => {
      const b = document.querySelector('.vitra-tooltip-js').getBoundingClientRect();
      return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: innerWidth, h: innerHeight, sw: document.documentElement.scrollWidth };
    });
    expect(r.l).toBeGreaterThanOrEqual(0);
    expect(r.t).toBeGreaterThanOrEqual(0);
    expect(r.r).toBeLessThanOrEqual(r.w);
    expect(r.b).toBeLessThanOrEqual(r.h);
    expect(r.sw).toBe(360);
  });

  test('[contract] tooltip: a long CSS-only data-tooltip does not widen the page at 360px while hidden', async ({ page }) => {
    await openSink(page, { viewport: MOBILE });
    await page.addStyleTag({ content: '[data-state="long-text"]:not(.vitra-tooltip) { display: none !important; }' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);
  });

  test('[contract] tooltip: hides when the page scrolls under a fixed target', async ({ page }) => {
    await openSink(page);
    await page.evaluate(() => {
      document.body.style.minHeight = '3000px';
      document.querySelector('#ks-tooltip').style.cssText = 'position:fixed;top:100px;left:100px;margin:0';
    });
    await page.locator('#ks-tooltip').focus();
    await expect(page.locator('.vitra-tooltip-js')).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 300));
    await expect(page.locator('.vitra-tooltip-js')).toHaveCount(0);
  });

  test('[contract] tooltip: a 60-character unbroken string does not scroll the page sideways', async ({ page }) => {
    await openSink(page, { viewport: MOBILE });
    await page.addStyleTag({ content: '[data-state="long-text"] { display: none !important; }' });
    await page.evaluate(() => {
      document.querySelector('#ks-tooltip').setAttribute('data-vitra-tooltip', 'W'.repeat(60));
    });
    await page.locator('#ks-tooltip').focus();
    await expect(page.locator('.vitra-tooltip-js')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);
  });
});

// ----------------------------------------------------------------- toast ---

test.describe('toast', () => {
  test('[J8] toast: container is a polite live region and an error toast is an alert', async ({ page }) => {
    expectedFail(test, 'J8');
    await openSink(page);
    await page.locator('#ks-toast-btn-success').click();
    const container = page.locator('.vitra-toast-container');
    expect(await container.getAttribute('role'), 'container role').toBe('status');
    expect(await container.getAttribute('aria-live'), 'container aria-live').toBe('polite');
    await page.locator('#ks-toast-btn-error').click();
    const error = page.locator('.vitra-toast-error');
    const errorRole = await error.getAttribute('role');
    const errorLive = await error.getAttribute('aria-live');
    expect(errorRole === 'alert' || errorLive === 'assertive', `error toast role=${errorRole} aria-live=${errorLive}`).toBe(true);
  });

  test('[J8] toast: warning type gets its own class', async ({ page }) => {
    expectedFail(test, 'J8');
    await openSink(page);
    await page.locator('#ks-toast-btn-warning').click();
    await expect(page.locator('.vitra-toast-container .vitra-toast')).toHaveClass(/vitra-toast-warning/);
    const border = await page.locator('.vitra-toast-warning').evaluate((el) => getComputedStyle(el).borderLeftWidth);
    expect(border, 'warning toast has a coloured edge like the other types').toBe('4px');
  });

  test('[J8] toast: a sticky toast has a close button that works from the keyboard', async ({ page }) => {
    expectedFail(test, 'J8');
    await openSink(page);
    await page.locator('#ks-toast-btn-sticky').click();
    const toast = page.locator('.vitra-toast-container .vitra-toast');
    await expect(toast).toHaveCount(1);
    const close = toast.locator('button');
    await expect(close, 'sticky toast has a button').toHaveCount(1);
    await close.focus();
    await page.keyboard.press('Enter');
    await expect(toast).toHaveCount(0);
  });
});
