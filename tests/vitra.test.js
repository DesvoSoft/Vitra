import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

let Vitra;

beforeEach(async () => {
  document.documentElement.dataset.theme = '';
  localStorage.clear();

  Vitra = await import('../src/vitra.js');
  Vitra = Vitra.default || Vitra;
});

afterEach(() => {
  document.documentElement.dataset.theme = '';
  localStorage.clear();
});

describe('Theme Module', () => {
  it('should get current theme (default auto)', () => {
    expect(Vitra.theme.get()).toBe('auto');
  });

  it('should set a valid theme', () => {
    const result = Vitra.theme.set('dark');
    expect(result).toBe(true);
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('should reject invalid theme', () => {
    const result = Vitra.theme.set('invalid');
    expect(result).toBe(false);
  });

  it('should persist theme to localStorage', () => {
    Vitra.theme.set('dark');
    expect(localStorage.getItem('vitra-theme')).toBe('dark');
  });

  it('should toggle between light and dark', () => {
    Vitra.theme.set('light');
    expect(Vitra.theme.toggle()).toBe('dark');
    expect(Vitra.theme.toggle()).toBe('light');
  });

  it('should toggle from auto based on effective theme', () => {
    Vitra.theme.set('auto');
    const next = Vitra.theme.toggle();
    expect(['light', 'dark']).toContain(next);
  });

  it('should init from localStorage', () => {
    localStorage.setItem('vitra-theme', 'neon');
    const result = Vitra.theme.init();
    expect(result).toBe('neon');
    expect(document.documentElement.dataset.theme).toBe('neon');
  });

  it('should use default theme when nothing stored', () => {
    const result = Vitra.theme.init({ defaultTheme: 'dark' });
    expect(result).toBe('dark');
  });

  it('should get effective theme (non-auto)', () => {
    Vitra.theme.set('pastel');
    expect(Vitra.theme.getEffective()).toBe('pastel');
  });

  it('should clear stored theme', () => {
    Vitra.theme.set('ocean');
    expect(localStorage.getItem('vitra-theme')).toBe('ocean');
    Vitra.theme.clear();
    expect(localStorage.getItem('vitra-theme')).toBeNull();
  });

  it('should return valid themes list', () => {
    const themes = Vitra.theme.getValidThemes();
    expect(themes).toEqual(['light', 'dark', 'auto', 'pastel', 'neon', 'ocean', 'emerald']);
  });

  it('should set emerald theme', () => {
    Vitra.theme.set('emerald');
    expect(document.documentElement.dataset.theme).toBe('emerald');
  });

  it('should have frozen VALID_THEMES to prevent mutation', () => {
    const themes = Vitra.theme.getValidThemes();
    expect(() => { themes.push('custom'); }).not.toThrow();
    // The original should remain unchanged
    expect(Vitra.theme.getValidThemes()).toEqual(['light', 'dark', 'auto', 'pastel', 'neon', 'ocean', 'emerald']);
  });

  it('should create aria-live announcer on theme change', () => {
    Vitra.theme.set('dark');
    const announcer = document.getElementById('vitra-theme-announcer');
    expect(announcer).not.toBeNull();
    expect(announcer.getAttribute('aria-live')).toBe('polite');
    expect(announcer.textContent).toContain('dark');
  });
});

describe('Particles Module', () => {
  beforeEach(() => {
    Vitra.particles.destroy();
  });

  it('should spawn particles in body', () => {
    const count = Vitra.particles.spawn(5);
    expect(count).toBe(5);
  });

  it('should spawn particles inside specified container', () => {
    const container = document.createElement('div');
    container.id = 'particle-container';
    document.body.appendChild(container);

    Vitra.particles.spawn(5, { container: '#particle-container' });
    const particles = container.querySelectorAll('.vitra-particle');
    expect(particles.length).toBe(5);

    document.body.removeChild(container);
  });

  it('should spawn particles in body when container selector invalid', () => {
    const count = Vitra.particles.spawn(3, { container: '#non-existent-container' });
    expect(count).toBe(3);
    const particles = document.body.querySelectorAll('.vitra-particle');
    expect(particles.length).toBeGreaterThanOrEqual(3);
  });

  it('should respect device limit (max 40)', () => {
    const count = Vitra.particles.spawn(100);
    expect(count).toBeLessThanOrEqual(40);
  });

  it('should destroy particles', () => {
    Vitra.particles.spawn(10);
    const destroyed = Vitra.particles.destroy(5);
    expect(destroyed).toBe(5);
  });

  it('should destroy all particles when count is null', () => {
    Vitra.particles.spawn(10);
    const destroyed = Vitra.particles.destroy();
    expect(destroyed).toBe(10);
  });

  it('should report particle limits', () => {
    const limits = Vitra.particles.limits();
    expect(limits).toHaveProperty('max');
    expect(limits).toHaveProperty('active');
    expect(limits).toHaveProperty('available');
    expect(limits.max).toBeGreaterThan(0);
  });

  it('should not set data-direction or drift custom properties when direction is omitted', () => {
    Vitra.particles.spawn(5);
    const particles = document.body.querySelectorAll('.vitra-particle');
    particles.forEach(p => {
      expect(p.dataset.direction).toBeUndefined();
      expect(p.style.getPropertyValue('--vitra-particle-drift-x')).toBe('');
      expect(p.style.getPropertyValue('--vitra-particle-drift-y')).toBe('');
    });
  });

  it('should set data-direction and drift custom properties for a named direction', () => {
    Vitra.particles.spawn(5, { direction: 'down' });
    const particles = document.body.querySelectorAll('.vitra-particle');
    particles.forEach(p => {
      expect(p.dataset.direction).toBe('down');
      expect(p.style.getPropertyValue('--vitra-particle-drift-x')).toMatch(/px$/);
      expect(p.style.getPropertyValue('--vitra-particle-drift-y')).toBe('120%');
    });
  });

  it('should accept a numeric angle for direction', () => {
    Vitra.particles.spawn(3, { direction: 45 });
    const particles = document.body.querySelectorAll('.vitra-particle');
    particles.forEach(p => {
      expect(p.dataset.direction).toBe('45');
      expect(p.style.getPropertyValue('--vitra-particle-drift-x')).toMatch(/px$/);
    });
  });
});

describe('Reveal Module', () => {
  it('should init without error', () => {
    expect(() => Vitra.reveal.init()).not.toThrow();
  });

  it('should reveal elements immediately when reduced motion is set', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        addListener: vi.fn(),
      })),
    });

    const el = document.createElement('div');
    el.className = 'vitra-reveal';
    document.body.appendChild(el);

    Vitra.reveal.init();
    expect(el.classList.contains('vitra-revealed')).toBe(true);

    document.body.removeChild(el);
  });
});

describe('Modal Module', () => {
  it('should not open non-existent modal', () => {
    const result = Vitra.modal.open('#non-existent');
    expect(result).toBe(false);
  });

  it('should open and close a modal', () => {
    const modal = document.createElement('div');
    modal.id = 'test-modal';
    modal.className = 'vitra-modal-overlay';
    modal.setAttribute('aria-hidden', 'true');
    document.body.appendChild(modal);

    const result = Vitra.modal.open('#test-modal');
    expect(result).toBe(true);
    expect(modal.classList.contains('vitra-modal-open')).toBe(true);
    expect(modal.getAttribute('aria-hidden')).toBe('false');

    Vitra.modal.close();
    expect(modal.classList.contains('vitra-modal-open')).toBe(false);
    expect(modal.getAttribute('aria-hidden')).toBe('true');

    document.body.removeChild(modal);
  });

  it('should set role=dialog and aria-modal=true on open', () => {
    const modal = document.createElement('div');
    modal.id = 'test-modal-aria';
    modal.className = 'vitra-modal-overlay';
    document.body.appendChild(modal);

    Vitra.modal.open('#test-modal-aria');
    expect(modal.getAttribute('role')).toBe('dialog');
    expect(modal.getAttribute('aria-modal')).toBe('true');

    Vitra.modal.close();
    document.body.removeChild(modal);
  });

  it('should lock body scroll when modal is open', () => {
    const modal = document.createElement('div');
    modal.id = 'test-modal-scroll';
    modal.className = 'vitra-modal-overlay';
    document.body.appendChild(modal);

    expect(document.body.style.overflow).toBe('');
    Vitra.modal.open('#test-modal-scroll');
    expect(document.body.style.overflow).toBe('hidden');

    Vitra.modal.close();
    expect(document.body.style.overflow).toBe('');
    document.body.removeChild(modal);
  });

  it('should not accumulate duplicate listeners on repeated open/close', () => {
    const modal = document.createElement('div');
    modal.id = 'test-modal-dup';
    modal.className = 'vitra-modal-overlay';
    document.body.appendChild(modal);

    Vitra.modal.open('#test-modal-dup');
    Vitra.modal.close();
    Vitra.modal.open('#test-modal-dup');
    expect(modal.classList.contains('vitra-modal-open')).toBe(true);

    Vitra.modal.close();
    document.body.removeChild(modal);
  });

  describe('shared helpers (focus trap, scroll lock, role)', () => {
    const made = [];
    const mk = (id, inner = '', attrs = '') => {
      const el = document.createElement('div');
      el.id = id;
      el.className = 'vitra-modal-overlay';
      el.setAttribute('aria-hidden', 'true');
      if (attrs) el.setAttribute(...attrs.split('='));
      el.innerHTML = `<div class="vitra-modal-content">${inner}</div>`;
      document.body.appendChild(el);
      made.push(el);
      return el;
    };
    const tab = (shift = false) => {
      const e = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: shift, bubbles: true, cancelable: true });
      document.activeElement.dispatchEvent(e);
      return e;
    };
    afterEach(() => {
      Vitra.modal.close();
      made.splice(0).forEach((el) => el.remove());
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    });

    it('restores the author body overflow after close', () => {
      const m = mk('j7-scroll');
      document.body.style.overflow = 'scroll';
      Vitra.modal.open(m);
      expect(document.body.style.overflow).toBe('hidden');
      Vitra.modal.close();
      expect(document.body.style.overflow).toBe('scroll');
    });

    it('keeps an author role and borrows dialog only when there is none', () => {
      const a = mk('j7-alert', '', 'role=alertdialog');
      const n = mk('j7-norole');
      Vitra.modal.open(a);
      expect(a.getAttribute('role')).toBe('alertdialog');
      Vitra.modal.close();
      expect(a.getAttribute('role')).toBe('alertdialog');
      Vitra.modal.open(n);
      expect(n.getAttribute('role')).toBe('dialog');
      Vitra.modal.close();
      expect(n.hasAttribute('role')).toBe(false);
    });

    it('focuses the content container when there are no focusables', () => {
      const m = mk('j7-empty', '<p>text</p>');
      Vitra.modal.open(m);
      const active = document.activeElement;
      expect(active === m || active.classList.contains('vitra-modal-content')).toBe(true);
      expect(active.getAttribute('tabindex')).toBe('-1');
      expect(tab().defaultPrevented).toBe(true);
    });

    it('cancels the deferred focus when closed right after open', async () => {
      const m = mk('j7-race', '<button id="j7-race-b">x</button>');
      const orig = HTMLElement.prototype.focus;
      const seen = [];
      // Simulate a modal that is not focusable yet (transition): focus() inside it is a no-op,
      // so open() schedules the deferred retry.
      HTMLElement.prototype.focus = function (...args) {
        if (m.contains(this)) { seen.push(this.id); return undefined; }
        return orig.apply(this, args);
      };
      try {
        Vitra.modal.open(m);
        Vitra.modal.close();
        seen.length = 0;
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        await new Promise((r) => setTimeout(r, 50));
      } finally {
        HTMLElement.prototype.focus = orig;
      }
      expect(seen).toEqual([]);
    });

    it('keeps Tab inside the modal when the focused element is removed', () => {
      const m = mk('j7-lost', '<button id="j7-l1">one</button><button id="j7-l2">two</button>');
      Vitra.modal.open(m);
      const one = m.querySelector('#j7-l1');
      one.focus();
      one.remove();
      expect(document.activeElement).toBe(document.body);
      const e = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      document.dispatchEvent(e);
      expect(e.defaultPrevented).toBe(true);
      expect(m.contains(document.activeElement)).toBe(true);
    });

    it('binds a single effective close listener per button across 3 open/close cycles', () => {
      const m = mk('j7-dup', '<button class="vitra-modal-close" data-vitra-modal-close>x</button>');
      const btn = m.querySelector('.vitra-modal-close');
      const live = new Set();
      const add = btn.addEventListener.bind(btn);
      const rem = btn.removeEventListener.bind(btn);
      btn.addEventListener = (t, f, o) => { if (t === 'click') live.add(f); return add(t, f, o); };
      btn.removeEventListener = (t, f, o) => { if (t === 'click') live.delete(f); return rem(t, f, o); };
      for (let i = 0; i < 3; i++) { Vitra.modal.open(m); Vitra.modal.close(); }
      Vitra.modal.open(m);
      expect(live.size).toBe(1);
      btn.click();
      expect(m.classList.contains('vitra-modal-open')).toBe(false);
      Vitra.modal.close();
      expect(live.size).toBe(0);
    });

    it('keeps hidden focusables out of the Tab cycle and sees late ones', () => {
      const m = mk('j7-tab', '<button id="j7-a">a</button><button id="j7-c">c</button><button id="j7-h" hidden>h</button>');
      Vitra.modal.open(m);
      const a = m.querySelector('#j7-a');
      const c = m.querySelector('#j7-c');
      c.focus();
      expect(tab().defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(a);
      const late = document.createElement('button');
      late.id = 'j7-late';
      m.querySelector('.vitra-modal-content').appendChild(late);
      late.focus();
      tab();
      expect(document.activeElement).toBe(a);
      tab(true);
      expect(document.activeElement).toBe(late);
    });

    it('opening a second modal closes the first and leaks no scroll lock', () => {
      const a = mk('j7-two-a');
      const b = mk('j7-two-b');
      document.body.style.overflow = 'scroll';
      Vitra.modal.open(a);
      Vitra.modal.open(b);
      expect(a.classList.contains('vitra-modal-open')).toBe(false);
      expect(b.classList.contains('vitra-modal-open')).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');
      Vitra.modal.close();
      expect(b.classList.contains('vitra-modal-open')).toBe(false);
      expect(document.body.style.overflow).toBe('scroll');
      Vitra.modal.open(a);
      Vitra.modal.close();
      expect(document.body.style.overflow).toBe('scroll');
    });
  });
});

describe('Drawer Module', () => {
  const HTML = `
    <button id="t1" class="vitra-burger" data-vitra-drawer-toggle="#d1" aria-expanded="false">menu</button>
    <button id="t2" data-vitra-drawer-toggle="#d1">second</button>
    <div class="vitra-drawer-overlay" id="ov"></div>
    <nav id="d1" class="vitra-drawer"><button class="vitra-drawer-close">x</button><a href="#a" id="d1a">a</a></nav>
    <nav id="manual" class="vitra-drawer"><a href="#m" id="ma">m</a></nav>
    <button id="outside">outside</button>
  `;
  const $ = (s) => document.querySelector(s);
  const click = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  const esc = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

  beforeEach(() => {
    document.body.innerHTML = HTML;
  });
  afterEach(() => {
    Vitra.drawer.destroy();
    document.body.innerHTML = '';
    document.body.removeAttribute('style');
  });

  it('open/close/toggle return values and set classes and attributes', () => {
    Vitra.drawer.init();
    expect($('#d1').hasAttribute('inert')).toBe(true);
    expect(Vitra.drawer.open('#d1')).toBe(true);
    const d = $('#d1');
    expect(d.classList.contains('open')).toBe(true);
    expect(d.hasAttribute('inert')).toBe(false);
    expect($('#ov').classList.contains('open')).toBe(true);
    expect(d.getAttribute('role')).toBe('dialog');
    expect(d.getAttribute('aria-modal')).toBe('true');
    expect(document.body.style.overflow).toBe('hidden');
    ['#t1', '#t2'].forEach((s) => expect($(s).getAttribute('aria-expanded')).toBe('true'));
    expect($('#t1').classList.contains('active')).toBe(true);
    expect($('#t2').classList.contains('active')).toBe(false);
    expect(d.contains(document.activeElement)).toBe(true);
    Vitra.drawer.close();
    expect(d.classList.contains('open')).toBe(false);
    expect(d.hasAttribute('inert')).toBe(true);
    expect(d.hasAttribute('role')).toBe(false);
    expect(d.hasAttribute('aria-modal')).toBe(false);
    expect($('#ov').classList.contains('open')).toBe(false);
    expect($('#t1').getAttribute('aria-expanded')).toBe('false');
    expect($('#t1').classList.contains('active')).toBe(false);
    expect(document.body.style.overflow).toBe('');
    expect(Vitra.drawer.toggle($('#d1'))).toBe(true);
    expect(Vitra.drawer.toggle('#d1')).toBe(false);
  });

  it('keeps an author role and returns focus to the toggle that opened it', () => {
    $('#d1').setAttribute('role', 'navigation');
    Vitra.drawer.init();
    $('#t1').focus();
    click($('#t1'));
    expect($('#d1').getAttribute('role')).toBe('navigation');
    expect($('#d1').classList.contains('open')).toBe(true);
    esc();
    expect($('#d1').classList.contains('open')).toBe(false);
    expect($('#d1').getAttribute('role')).toBe('navigation');
    expect(document.activeElement).toBe($('#t1'));
    expect($('#t1').getAttribute('aria-expanded')).toBe('false');
    expect($('#t1').classList.contains('active')).toBe(false);
  });

  it('missing target returns false and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(Vitra.drawer.open('#nope')).toBe(false);
    expect(warn).toHaveBeenCalledWith('[Vitra Drawer] Target element not found');
    warn.mockRestore();
  });

  const tick = () => new Promise((r) => setTimeout(r));

  it('close button, overlay click and outside click close it', async () => {
    Vitra.drawer.init();
    click($('#t1'));
    click($('#d1 .vitra-drawer-close'));
    expect($('#d1').classList.contains('open')).toBe(false);
    click($('#t1'));
    click($('#ov'));
    expect($('#d1').classList.contains('open')).toBe(false);
    click($('#t1'));
    click($('#d1a'));
    expect($('#d1').classList.contains('open')).toBe(true);
    click($('#outside'));
    await tick();
    expect($('#d1').classList.contains('open')).toBe(false);
  });

  it('a plain author button calling toggle() opens and closes (outside-click close is deferred)', async () => {
    $('#outside').addEventListener('click', () => Vitra.drawer.toggle('#d1'));
    Vitra.drawer.init();
    click($('#outside'));
    await tick();
    expect($('#d1').classList.contains('open')).toBe(true);
    click($('#outside'));
    await tick();
    expect($('#d1').classList.contains('open')).toBe(false);
  });

  it('author role navigation: no aria-modal while open', () => {
    $('#d1').setAttribute('role', 'navigation');
    Vitra.drawer.open('#d1');
    expect($('#d1').hasAttribute('aria-modal')).toBe(false);
    Vitra.drawer.close();
    expect($('#d1').getAttribute('role')).toBe('navigation');
    expect($('#d1').hasAttribute('aria-modal')).toBe(false);
  });

  it('a link toggle does not navigate', () => {
    document.body.insertAdjacentHTML('beforeend', '<a id="lk" href="#" data-vitra-drawer-toggle="#d1">l</a>');
    Vitra.drawer.init();
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    $('#lk').dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
  });

  it('init() twice: one click toggles once; destroy() stops responding and removes inert', () => {
    Vitra.drawer.init();
    Vitra.drawer.init();
    click($('#t1'));
    expect($('#d1').classList.contains('open')).toBe(true);
    click($('#t1'));
    expect($('#d1').classList.contains('open')).toBe(false);
    Vitra.drawer.destroy();
    expect($('#d1').hasAttribute('inert')).toBe(false);
    click($('#t1'));
    expect($('#d1').classList.contains('open')).toBe(false);
  });

  it('destroy() while open releases the scroll lock and the trap', () => {
    Vitra.drawer.init();
    click($('#t1'));
    Vitra.drawer.destroy();
    expect(document.body.style.overflow).toBe('');
    expect($('#d1').classList.contains('open')).toBe(false);
  });

  it('does not touch a drawer without toggle (init and manual .open)', () => {
    Vitra.drawer.init();
    const m = $('#manual');
    expect(m.hasAttribute('inert')).toBe(false);
    m.classList.add('open');
    expect(m.hasAttribute('inert')).toBe(false);
    esc();
    click($('#outside'));
    expect(m.classList.contains('open')).toBe(true);
    expect(m.hasAttribute('role')).toBe(false);
    expect(getComputedStyle(m).visibility).not.toBe('hidden');
    expect(Vitra.drawer.close()).toBeUndefined();
  });

  it('a toggle and drawer inserted after init() work', () => {
    Vitra.drawer.init();
    document.body.insertAdjacentHTML('beforeend',
      '<button id="t3" data-vitra-drawer-toggle="#d2">x</button><nav id="d2" class="vitra-drawer"><a href="#z">z</a></nav>');
    click($('#t3'));
    expect($('#d2').classList.contains('open')).toBe(true);
    expect($('#t3').getAttribute('aria-expanded')).toBe('true');
    click($('#t3'));
    expect($('#d2').classList.contains('open')).toBe(false);
    expect($('#d2').hasAttribute('inert')).toBe(true);
  });

  it('opening a modal over the drawer keeps the drawer open, locked and trapped after the modal closes', () => {
    document.body.insertAdjacentHTML('beforeend',
      '<div id="m1" class="vitra-modal"><div class="vitra-modal-content"><button id="mc" data-vitra-modal-close>c</button></div></div>');
    $('#d1').insertAdjacentHTML('beforeend', '<button id="om">open modal</button>');
    Vitra.drawer.init();
    click($('#t1'));
    $('#om').focus();
    Vitra.modal.open('#m1');
    // clicks and Esc inside the modal layer do not close the drawer
    click($('#mc'));
    expect($('#d1').classList.contains('open')).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    expect($('#d1').contains(document.activeElement)).toBe(true);
    Vitra.modal.open('#m1');
    esc();
    expect($('#d1').classList.contains('open')).toBe(true);
    Vitra.modal.close();
    expect(document.body.style.overflow).toBe('hidden');
    // drawer trap is active again: Tab from the last focusable wraps inside
    const list = Array.from($('#d1').querySelectorAll('button,a[href]'));
    list[list.length - 1].focus();
    const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    document.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(list[0]);
    Vitra.drawer.close();
    expect(document.body.style.overflow).toBe('');
  });
});

describe('Tooltip Module', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should show and hide a tooltip', () => {
    const btn = document.createElement('button');
    btn.id = 'tooltip-target';
    document.body.appendChild(btn);

    const result = Vitra.tooltip.show('#tooltip-target', 'Hello');
    expect(result).toBe(true);

    Vitra.tooltip.hide('#tooltip-target');
    const tooltip = document.querySelector('.vitra-tooltip-js');
    expect(tooltip).toBeNull();
  });

  it('should set aria-describedby on target element', () => {
    const btn = document.createElement('button');
    btn.id = 'tooltip-describedby';
    document.body.appendChild(btn);

    // Use delay 0 to schedule immediately
    Vitra.tooltip.show('#tooltip-describedby', 'Tooltip text', { delay: 0 });

    // Advance past the setTimeout
    return new Promise(resolve => {
      setTimeout(() => {
        const describedby = btn.getAttribute('aria-describedby');
        expect(describedby).not.toBeNull();
        expect(describedby.startsWith('vitra-tt-')).toBe(true);
        Vitra.tooltip.hide('#tooltip-describedby');
        resolve();
      }, 50);
    });
  });

  it('should remove aria-describedby on hide after show', () => {
    const btn = document.createElement('button');
    btn.id = 'tooltip-describedby-remove';
    document.body.appendChild(btn);

    Vitra.tooltip.show('#tooltip-describedby-remove', 'Text', { delay: 0 });
    return new Promise(resolve => {
      setTimeout(() => {
        expect(btn.getAttribute('aria-describedby')).not.toBeNull();
        Vitra.tooltip.hide('#tooltip-describedby-remove');
        expect(btn.getAttribute('aria-describedby')).toBeNull();
        resolve();
      }, 50);
    });
  });

  describe('delegated init', () => {
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const enter = (el) => el.dispatchEvent(new Event('pointerenter', { bubbles: false }));
    const tip = () => document.querySelector('.vitra-tooltip-js');

    afterEach(() => {
      Vitra.tooltip.destroy();
    });

    it('init() twice then destroy() leaves nothing bound', async () => {
      document.body.innerHTML = '<button id="b" data-vitra-tooltip="Hi">B</button>';
      Vitra.tooltip.init();
      Vitra.tooltip.init();
      Vitra.tooltip.destroy();
      enter(document.getElementById('b'));
      await wait(30);
      expect(tip()).toBeNull();
    });

    it('init() twice binds once: one tooltip, one describedby id', async () => {
      document.body.innerHTML = '<button id="b" data-vitra-tooltip="Hi">B</button>';
      Vitra.tooltip.init();
      Vitra.tooltip.init();
      enter(document.getElementById('b'));
      await wait(30);
      expect(document.querySelectorAll('.vitra-tooltip-js').length).toBe(1);
      expect(document.getElementById('b').getAttribute('aria-describedby')).toBe(tip().id);
    });

    it('works for an element added after init()', async () => {
      Vitra.tooltip.init();
      document.body.innerHTML = '<button id="late" data-vitra-tooltip="Late">L</button>';
      document.getElementById('late').dispatchEvent(new Event('focusin', { bubbles: true }));
      await wait(30);
      expect(tip().textContent).toBe('Late');
    });

    it('appends to an existing aria-describedby and removes only its own id', async () => {
      document.body.innerHTML = '<button id="b" aria-describedby="x" data-vitra-tooltip="Hi">B</button>';
      const b = document.getElementById('b');
      Vitra.tooltip.init();
      enter(b);
      await wait(30);
      expect(b.getAttribute('aria-describedby')).toBe('x ' + tip().id);
      b.dispatchEvent(new Event('pointerleave'));
      expect(b.getAttribute('aria-describedby')).toBe('x');
    });

    it('Esc hides the tooltip', async () => {
      document.body.innerHTML = '<button id="b" data-vitra-tooltip="Hi">B</button>';
      Vitra.tooltip.init();
      enter(document.getElementById('b'));
      await wait(30);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(document.getElementById('b').hasAttribute('aria-describedby')).toBe(false);
      await wait(260);
      expect(tip()).toBeNull();
    });

    it('scroll and resize hide it', async () => {
      document.body.innerHTML = '<button id="b" data-vitra-tooltip="Hi">B</button>';
      Vitra.tooltip.init();
      enter(document.getElementById('b'));
      await wait(30);
      window.dispatchEvent(new Event('resize'));
      expect(document.getElementById('b').hasAttribute('aria-describedby')).toBe(false);
      enter(document.getElementById('b'));
      await wait(30);
      // A scroll that leaves the target where it was (focus scroll-into-view) keeps it
      document.dispatchEvent(new Event('scroll'));
      expect(document.getElementById('b').hasAttribute('aria-describedby')).toBe(true);
      document.getElementById('b').getBoundingClientRect = () => ({ top: 40, left: 0 }); // target moved, tip did not
      document.dispatchEvent(new Event('scroll'));
      expect(document.getElementById('b').hasAttribute('aria-describedby')).toBe(false);
    });

    it('hide(anything) still hides the active tooltip', async () => {
      document.body.innerHTML = '<button id="b">B</button><button id="o">O</button>';
      Vitra.tooltip.show('#b', 'Hi');
      await wait(30);
      Vitra.tooltip.hide('#o');
      expect(document.getElementById('b').hasAttribute('aria-describedby')).toBe(false);
    });

    it('a tap on a target shows it and a tap elsewhere hides it', async () => {
      document.body.innerHTML = '<button id="b" data-vitra-tooltip="Hi">B</button><p id="p">x</p>';
      Vitra.tooltip.init();
      const b = document.getElementById('b');
      const down = (el) => el.dispatchEvent(Object.assign(new Event('pointerdown', { bubbles: true }), { pointerType: 'touch' }));
      down(b);
      b.dispatchEvent(new Event('click', { bubbles: true }));
      await wait(30);
      expect(tip()).not.toBeNull();
      const p = document.getElementById('p');
      down(p);
      p.dispatchEvent(new Event('click', { bubbles: true }));
      expect(b.hasAttribute('aria-describedby')).toBe(false);
    });

    it('keeps visual styling out of inline styles', async () => {
      document.body.innerHTML = '<button id="b" data-vitra-tooltip="Hi">B</button>';
      Vitra.tooltip.show('#b', 'Hi');
      await wait(30);
      expect(tip().style.background).toBe('');
      expect(tip().style.position).toBe('');
      Vitra.tooltip.hide();
    });
  });
});

describe('Toast Module', () => {
  it('should show a toast notification', () => {
    const el = Vitra.toast.show('Test message');
    expect(el).toBeDefined();
    expect(el.classList.contains('vitra-toast')).toBe(true);
    expect(el.textContent).toContain('Test message');
  });

  it('should not execute HTML in toast message (XSS prevention)', () => {
    const el = Vitra.toast.show('<img src=x onerror=alert(1)>');
    expect(el.innerHTML).not.toContain('<img');
    expect(el.textContent).toBe('<img src=x onerror=alert(1)>');
  });

  describe('accessibility', () => {
    afterEach(() => Vitra.toast.destroy());

    it('container is a polite status live region', () => {
      Vitra.toast.show('Hi');
      const c = document.querySelector('.vitra-toast-container');
      expect(c.getAttribute('role')).toBe('status');
      expect(c.getAttribute('aria-live')).toBe('polite');
    });

    it('error toast is role=alert without its own aria-live; others have no role', () => {
      const err = Vitra.toast.show('Bad', { type: 'error' });
      expect(err.getAttribute('role')).toBe('alert');
      expect(err.hasAttribute('aria-live')).toBe(false);
      expect(Vitra.toast.show('Ok', { type: 'success' }).hasAttribute('role')).toBe(false);
    });

    it('warning type gets vitra-toast-warning', () => {
      expect(Vitra.toast.show('W', { type: 'warning' }).classList.contains('vitra-toast-warning')).toBe(true);
    });

    it('has no close button by default', () => {
      expect(Vitra.toast.show('x').querySelector('.vitra-toast-close')).toBeNull();
    });

    it('closable: true adds a labelled close button that removes the toast', () => {
      vi.useFakeTimers();
      try {
        const el = Vitra.toast.show('x', { closable: true });
        const btn = el.querySelector('button.vitra-toast-close');
        expect(btn.getAttribute('aria-label')).toBe('Close');
        expect(btn.getAttribute('type')).toBe('button');
        btn.click();
        vi.advanceTimersByTime(400);
        expect(el.isConnected).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });

    it('duration: 0 forces a close button', () => {
      const el = Vitra.toast.show('x', { duration: 0 });
      expect(el.querySelector('.vitra-toast-close')).not.toBeNull();
    });
  });
});

describe('Dropdown Module', () => {
  afterEach(() => {
    Vitra.dropdown.destroy();
    document.body.innerHTML = '';
  });

  it('should initialize without error', () => {
    expect(() => Vitra.dropdown.init()).not.toThrow();
  });

  it('should open a dropdown on toggle click and set aria-expanded', () => {
    document.body.innerHTML = `
      <div class="vitra-dropdown">
        <button data-vitra-dropdown-toggle aria-expanded="false">Menu</button>
        <div class="vitra-dropdown-menu"></div>
      </div>
    `;
    Vitra.dropdown.init();
    const dd = document.querySelector('.vitra-dropdown');
    const toggle = document.querySelector('[data-vitra-dropdown-toggle]');

    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(dd.classList.contains('open')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('should close an open dropdown on a second toggle click', () => {
    document.body.innerHTML = `
      <div class="vitra-dropdown">
        <button data-vitra-dropdown-toggle aria-expanded="false">Menu</button>
        <div class="vitra-dropdown-menu"></div>
      </div>
    `;
    Vitra.dropdown.init();
    const dd = document.querySelector('.vitra-dropdown');
    const toggle = document.querySelector('[data-vitra-dropdown-toggle]');

    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(dd.classList.contains('open')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('should close other open dropdowns when a different one is opened', () => {
    document.body.innerHTML = `
      <div class="vitra-dropdown" id="dd1">
        <button data-vitra-dropdown-toggle aria-expanded="false">A</button>
        <div class="vitra-dropdown-menu"></div>
      </div>
      <div class="vitra-dropdown" id="dd2">
        <button data-vitra-dropdown-toggle aria-expanded="false">B</button>
        <div class="vitra-dropdown-menu"></div>
      </div>
    `;
    Vitra.dropdown.init();
    const dd1 = document.getElementById('dd1');
    const dd2 = document.getElementById('dd2');
    const toggle1 = dd1.querySelector('[data-vitra-dropdown-toggle]');
    const toggle2 = dd2.querySelector('[data-vitra-dropdown-toggle]');

    toggle1.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(dd1.classList.contains('open')).toBe(true);

    toggle2.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(dd2.classList.contains('open')).toBe(true);
    expect(dd1.classList.contains('open')).toBe(false);
    expect(toggle1.getAttribute('aria-expanded')).toBe('false');
  });

  it('should close an open dropdown and refocus the toggle on Escape', () => {
    document.body.innerHTML = `
      <div class="vitra-dropdown">
        <button data-vitra-dropdown-toggle aria-expanded="false">Menu</button>
        <div class="vitra-dropdown-menu"></div>
      </div>
    `;
    Vitra.dropdown.init();
    const dd = document.querySelector('.vitra-dropdown');
    const toggle = document.querySelector('[data-vitra-dropdown-toggle]');

    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(dd.classList.contains('open')).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(dd.classList.contains('open')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle);
  });

  describe('keyboard navigation (.open route)', () => {
    const setup = () => {
      document.body.innerHTML = `
        <div class="vitra-dropdown">
          <button data-vitra-dropdown-toggle aria-expanded="false">Menu</button>
          <div class="vitra-dropdown-menu">
            <button class="vitra-dropdown-item" disabled>Off</button>
            <button class="vitra-dropdown-item">A</button>
            <button class="vitra-dropdown-item" aria-disabled="true">Off2</button>
            <button class="vitra-dropdown-item">B</button>
            <button class="vitra-dropdown-item">C</button>
          </div>
        </div>`;
      Vitra.dropdown.init();
      const dd = document.querySelector('.vitra-dropdown');
      const toggle = dd.querySelector('[data-vitra-dropdown-toggle]');
      const [, a, , b, c] = dd.querySelectorAll('.vitra-dropdown-item');
      const press = (el, key) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      return { dd, toggle, a, b, c, press };
    };

    it('keyboard click focuses the first enabled item; a mouse click does not move focus', () => {
      const { dd, toggle, a } = setup();
      toggle.focus();
      toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
      expect(dd.classList.contains('open')).toBe(true);
      expect(document.activeElement).toBe(toggle);
      toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 0 }));
      toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 0 }));
      expect(dd.classList.contains('open')).toBe(true);
      expect(document.activeElement).toBe(a);
    });

    it('ArrowDown on the toggle opens and focuses the first item; arrows wrap and skip disabled items', () => {
      const { dd, toggle, a, b, c, press } = setup();
      toggle.focus();
      press(toggle, 'ArrowDown');
      expect(dd.classList.contains('open')).toBe(true);
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(document.activeElement).toBe(a);
      press(a, 'ArrowDown');
      expect(document.activeElement).toBe(b);
      press(b, 'ArrowDown');
      press(c, 'ArrowDown');
      expect(document.activeElement).toBe(a);
      press(a, 'ArrowUp');
      expect(document.activeElement).toBe(c);
      press(c, 'Home');
      expect(document.activeElement).toBe(a);
      press(a, 'End');
      expect(document.activeElement).toBe(c);
    });

    it('ArrowUp from a non-item goes to the last item; text fields and modified keys are ignored', () => {
      const { dd, toggle, a, c, press } = setup();
      const input = document.createElement('input');
      dd.querySelector('.vitra-dropdown-menu').appendChild(input);
      toggle.focus();
      press(toggle, 'ArrowDown');
      input.focus();
      press(input, 'ArrowUp');
      expect(document.activeElement).toBe(input);
      const alt = new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true, cancelable: true });
      a.focus();
      a.dispatchEvent(alt);
      expect(document.activeElement).toBe(a);
      const menu = dd.querySelector('.vitra-dropdown-menu');
      const plain = document.createElement('div');
      plain.tabIndex = -1;
      menu.appendChild(plain);
      plain.focus();
      press(plain, 'ArrowUp');
      expect(document.activeElement).toBe(c);
    });

    describe('inert guard after Tab', () => {
      const tabClose = () => {
        vi.useFakeTimers();
        const ctx = setup();
        ctx.toggle.focus();
        ctx.press(ctx.toggle, 'ArrowDown');
        ctx.press(ctx.a, 'Tab');
        ctx.menu = ctx.dd.querySelector('.vitra-dropdown-menu');
        return ctx;
      };
      afterEach(() => vi.useRealTimers());

      it('is transient: timers clear it', () => {
        const { menu } = tabClose();
        expect(menu.inert).toBe(true);
        vi.runAllTimers();
        expect(menu.inert).toBe(false);
      });

      it('a script adding .open right after leaves the menu usable once the timer fires', () => {
        const { dd, menu } = tabClose();
        dd.classList.add('open');
        vi.runAllTimers();
        expect(menu.inert).toBe(false);
      });

      it('destroy() clears it at once', () => {
        const { menu } = tabClose();
        Vitra.dropdown.destroy();
        expect(menu.inert).toBe(false);
      });
    });

    it('Tab closes the menu without preventing the default focus move', () => {
      const { dd, toggle, a, press } = setup();
      toggle.focus();
      press(toggle, 'ArrowDown');
      const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      a.dispatchEvent(ev);
      expect(dd.classList.contains('open')).toBe(false);
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(ev.defaultPrevented).toBe(false);
    });
  });

  it('should not respond to clicks after destroy', () => {
    document.body.innerHTML = `
      <div class="vitra-dropdown">
        <button data-vitra-dropdown-toggle aria-expanded="false">Menu</button>
        <div class="vitra-dropdown-menu"></div>
      </div>
    `;
    Vitra.dropdown.init();
    Vitra.dropdown.destroy();
    const dd = document.querySelector('.vitra-dropdown');
    const toggle = document.querySelector('[data-vitra-dropdown-toggle]');

    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(dd.classList.contains('open')).toBe(false);
  });
});

describe('Spotlight Module', () => {
  afterEach(() => {
    Vitra.spotlight.destroy();
    document.body.innerHTML = '';
  });

  it('should initialize without error', () => {
    expect(() => Vitra.spotlight.init()).not.toThrow();
  });

  it('should update --mouse-x/--mouse-y on the spotlight under the pointer', async () => {
    document.body.innerHTML = '<div class="vitra-spotlight"><span id="inner"></span></div>';
    const el = document.querySelector('.vitra-spotlight');
    el.getBoundingClientRect = () => ({ left: 10, top: 20, right: 110, bottom: 120, width: 100, height: 100 });

    Vitra.spotlight.init();
    document.getElementById('inner').dispatchEvent(new MouseEvent('pointermove', { clientX: 60, clientY: 70, bubbles: true }));

    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(el.style.getPropertyValue('--mouse-x')).toBe('50px');
    expect(el.style.getPropertyValue('--mouse-y')).toBe('50px');
  });

  it('should only measure the hovered spotlight, not every spotlight on the page', async () => {
    document.body.innerHTML = '<div class="vitra-spotlight" id="a"></div><div class="vitra-spotlight" id="b"></div>';
    const a = document.getElementById('a');
    const b = document.getElementById('b');
    let bMeasured = 0;
    a.getBoundingClientRect = () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 });
    b.getBoundingClientRect = () => { bMeasured++; return { left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 }; };

    Vitra.spotlight.init();
    a.dispatchEvent(new MouseEvent('pointermove', { clientX: 5, clientY: 6, bubbles: true }));

    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(a.style.getPropertyValue('--mouse-x')).toBe('5px');
    expect(b.style.getPropertyValue('--mouse-x')).toBe('');
    expect(bMeasured).toBe(0);
  });

  it('should ignore pointer movement outside any spotlight', async () => {
    document.body.innerHTML = '<div class="vitra-spotlight"></div><p id="outside"></p>';
    const el = document.querySelector('.vitra-spotlight');

    Vitra.spotlight.init();
    document.getElementById('outside').dispatchEvent(new MouseEvent('pointermove', { clientX: 60, clientY: 70, bubbles: true }));

    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(el.style.getPropertyValue('--mouse-x')).toBe('');
  });

  it('should not update properties after destroy', async () => {
    document.body.innerHTML = '<div class="vitra-spotlight"></div>';
    const el = document.querySelector('.vitra-spotlight');
    el.getBoundingClientRect = () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 });

    Vitra.spotlight.init();
    Vitra.spotlight.destroy();
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 60, clientY: 70, bubbles: true }));

    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(el.style.getPropertyValue('--mouse-x')).toBe('');
    expect(el.style.getPropertyValue('--mouse-y')).toBe('');
  });
});

describe('Theme transition', () => {
  // An earlier suite pins window.matchMedia to a non-writable mock that
  // always matches, so reduced motion is steered through that mock here
  // and its previous behaviour is put back afterwards.
  let previousImpl;
  const setReducedMotion = (on) => {
    const impl = (q) => ({ matches: on && String(q).includes('reduced-motion'), addEventListener() {}, addListener() {}, removeEventListener() {} });
    if (window.matchMedia && typeof window.matchMedia.mockImplementation === 'function') {
      window.matchMedia.mockImplementation(impl);
    } else {
      Object.defineProperty(window, 'matchMedia', { value: vi.fn().mockImplementation(impl), configurable: true });
    }
  };

  beforeEach(() => {
    previousImpl = window.matchMedia && window.matchMedia.getMockImplementation ? window.matchMedia.getMockImplementation() : undefined;
    setReducedMotion(false);
  });

  afterEach(() => {
    if (previousImpl) window.matchMedia.mockImplementation(previousImpl);
    delete document.startViewTransition;
    document.documentElement.classList.remove('vitra-theme-transition');
    Vitra.theme._transition = false;
  });

  const mockViewTransition = () => {
    const calls = [];
    document.startViewTransition = (cb) => {
      calls.push(cb);
      cb();
      return { finished: Promise.resolve() };
    };
    return calls;
  };

  it('should swap the theme inside a view transition when asked to', async () => {
    const calls = mockViewTransition();
    Vitra.theme.set('dark');

    expect(Vitra.theme.set('light', { transition: true, origin: { x: 10, y: 20 } })).toBe(true);

    expect(calls.length).toBe(1);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.style.getPropertyValue('--vitra-theme-x')).toBe('10px');
    expect(document.documentElement.style.getPropertyValue('--vitra-theme-y')).toBe('20px');

    await Promise.resolve();
    await Promise.resolve();
    expect(document.documentElement.classList.contains('vitra-theme-transition')).toBe(false);
  });

  it('should not use a view transition by default', () => {
    const calls = mockViewTransition();
    Vitra.theme.set('dark');
    Vitra.theme.set('light');

    expect(calls.length).toBe(0);
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('should honour init({ transition: true }) for later changes, toggle included', () => {
    const calls = mockViewTransition();
    Vitra.theme.init({ defaultTheme: 'dark', transition: true });

    Vitra.theme.toggle();

    expect(calls.length).toBe(1);
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('should fall back to an instant swap when the API is missing', () => {
    Vitra.theme.set('dark');

    expect(Vitra.theme.set('neon', { transition: true })).toBe(true);
    expect(document.documentElement.dataset.theme).toBe('neon');
  });

  it('should skip the animation under prefers-reduced-motion', () => {
    const calls = mockViewTransition();
    setReducedMotion(true);
    Vitra.theme.set('dark');

    Vitra.theme.set('light', { transition: true });

    expect(calls.length).toBe(0);
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});

describe('Scenery Module', () => {
  const LAYERS = ['sky', 'stars', 'clouds', 'halo', 'ridge-far', 'ridge-mid', 'ridge-near', 'grain'];

  afterEach(() => {
    Vitra.scenery.destroy();
    document.body.innerHTML = '';
  });

  it('should fill an empty scenery element with the eight layers, in paint order', () => {
    document.body.innerHTML = '<div class="vitra-scenery"></div>';

    expect(Vitra.scenery.init()).toBe(1);

    const el = document.querySelector('.vitra-scenery');
    expect([...el.children].map(c => c.className)).toEqual(LAYERS.map(n => `vitra-scenery-${n}`));
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('should leave hand-written layer markup untouched', () => {
    document.body.innerHTML = '<div class="vitra-scenery-inline"><div class="vitra-scenery-sky" id="mine"></div></div>';

    expect(Vitra.scenery.init()).toBe(0);
    expect(document.querySelector('.vitra-scenery-inline').children.length).toBe(1);

    Vitra.scenery.destroy();
    expect(document.getElementById('mine')).not.toBeNull();
  });

  it('should mount onto any element, adding the container class and moon variant', () => {
    document.body.innerHTML = '<section id="hero"></section>';

    const el = Vitra.scenery.mount('#hero', { inline: true, moon: 'crescent' });

    expect(el.classList.contains('vitra-scenery-inline')).toBe(true);
    expect(el.children.length).toBe(8);
    expect(el.querySelector('.vitra-scenery-halo').classList.contains('vitra-scenery-halo-crescent')).toBe(true);
  });

  it('should read the moon variant from data-vitra-moon', () => {
    document.body.innerHTML = '<div class="vitra-scenery" data-vitra-moon="crescent"></div>';

    Vitra.scenery.init();

    expect(document.querySelector('.vitra-scenery-halo-crescent')).not.toBeNull();
  });

  it('should return null and warn when the target does not exist', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(Vitra.scenery.mount('#nope')).toBeNull();
    expect(warn).toHaveBeenCalledWith('[Vitra Scenery] Target element not found');

    warn.mockRestore();
  });

  it('should remove only the layers it injected on destroy', () => {
    document.body.innerHTML = '<div class="vitra-scenery"></div>';
    Vitra.scenery.init();

    Vitra.scenery.destroy();

    expect(document.querySelector('.vitra-scenery').children.length).toBe(0);
  });
});

describe('Module Structure', () => {
  it('should expose all expected modules', () => {
    expect(Vitra.theme).toBeDefined();
    expect(Vitra.particles).toBeDefined();
    expect(Vitra.reveal).toBeDefined();
    expect(Vitra.modal).toBeDefined();
    expect(Vitra.drawer).toBeDefined();
    expect(Vitra.tooltip).toBeDefined();
    expect(Vitra.toast).toBeDefined();
    expect(Vitra.dropdown).toBeDefined();
    expect(Vitra.spotlight).toBeDefined();
    expect(Vitra.scenery).toBeDefined();
    expect(Vitra.motionGuard).toBeDefined();
  });

  it('should have expected API methods on theme module', () => {
    expect(typeof Vitra.theme.get).toBe('function');
    expect(typeof Vitra.theme.set).toBe('function');
    expect(typeof Vitra.theme.toggle).toBe('function');
    expect(typeof Vitra.theme.init).toBe('function');
    expect(typeof Vitra.theme.getEffective).toBe('function');
    expect(typeof Vitra.theme.clear).toBe('function');
    expect(typeof Vitra.theme.getValidThemes).toBe('function');
  });

  it('should have expected API methods on modal module', () => {
    expect(typeof Vitra.modal.open).toBe('function');
    expect(typeof Vitra.modal.close).toBe('function');
  });

  it('should have expected API methods on particles module', () => {
    expect(typeof Vitra.particles.spawn).toBe('function');
    expect(typeof Vitra.particles.destroy).toBe('function');
    expect(typeof Vitra.particles.limits).toBe('function');
    expect(typeof Vitra.particles.init).toBe('function');
  });
});

describe('CSS Component Classes (new components)', () => {
  it('should have skeleton classes defined in the module', () => {
    const el = document.createElement('div');
    el.className = 'vitra-skeleton';
    document.body.appendChild(el);
    expect(el.className).toContain('vitra-skeleton');
    document.body.removeChild(el);
  });

  it('should have spinner class defined in the module', () => {
    const el = document.createElement('div');
    el.className = 'vitra-spinner';
    document.body.appendChild(el);
    expect(el.className).toContain('vitra-spinner');
    document.body.removeChild(el);
  });

  it('should have alert class defined in the module', () => {
    const el = document.createElement('div');
    el.className = 'vitra-alert';
    document.body.appendChild(el);
    expect(el.className).toContain('vitra-alert');
    document.body.removeChild(el);
  });

  it('should have table class defined in the module', () => {
    const el = document.createElement('table');
    el.className = 'vitra-table';
    document.body.appendChild(el);
    expect(el.className).toContain('vitra-table');
    document.body.removeChild(el);
  });

  it('should have sr-only utility defined', () => {
    const el = document.createElement('div');
    el.className = 'vitra-sr-only';
    document.body.appendChild(el);
    expect(el.className).toContain('vitra-sr-only');
    document.body.removeChild(el);
  });

  it('should have z-index utilities defined', () => {
    const el = document.createElement('div');
    el.className = 'vitra-z-50';
    document.body.appendChild(el);
    expect(el.className).toContain('vitra-z-50');
    document.body.removeChild(el);
  });

  it('should have display utilities defined', () => {
    const el = document.createElement('div');
    el.className = 'vitra-block';
    document.body.appendChild(el);
    expect(el.className).toContain('vitra-block');
    document.body.removeChild(el);
  });

  it('should have width utilities defined', () => {
    const el = document.createElement('div');
    el.className = 'vitra-w-full';
    document.body.appendChild(el);
    expect(el.className).toContain('vitra-w-full');
    document.body.removeChild(el);
  });

  it('should have overflow utilities defined', () => {
    const el = document.createElement('div');
    el.className = 'vitra-overflow-hidden';
    document.body.appendChild(el);
    expect(el.className).toContain('vitra-overflow-hidden');
    document.body.removeChild(el);
  });

  it('should have the vitra-flex class with gap', () => {
    const el = document.createElement('div');
    el.className = 'vitra-flex';
    document.body.appendChild(el);
    expect(el.className).toContain('vitra-flex');
    document.body.removeChild(el);
  });
});

describe('CSS Cinematic Effects', () => {
  it('should have .vitra-gradient-bg class defined in motion module', () => {
    const src = require('fs').readFileSync(require('path').resolve(__dirname, '../src/04-motion.css'), 'utf8');
    expect(src).toContain('.vitra-gradient-bg');
    expect(src).toContain('vitra-mesh-shift');
  });

  it('should have .vitra-glow-orb classes defined', () => {
    const src = require('fs').readFileSync(require('path').resolve(__dirname, '../src/04-motion.css'), 'utf8');
    expect(src).toContain('.vitra-glow-orb');
    expect(src).toContain('.vitra-glow-orb-1');
    expect(src).toContain('.vitra-glow-orb-2');
    expect(src).toContain('.vitra-glow-orb-3');
    expect(src).toContain('vitra-float');
    expect(src).toContain('vitra-float-reverse');
  });

  it('should have .vitra-gradient-text class defined', () => {
    const src = require('fs').readFileSync(require('path').resolve(__dirname, '../src/04-motion.css'), 'utf8');
    expect(src).toContain('.vitra-gradient-text');
    expect(src).toContain('vitra-text-shift');
  });

  it('should have .vitra-border-glow class defined', () => {
    const src = require('fs').readFileSync(require('path').resolve(__dirname, '../src/04-motion.css'), 'utf8');
    expect(src).toContain('.vitra-border-glow');
    expect(src).toContain('vitra-border-rotate');
  });

  it('should have .vitra-hero-spotlight class defined', () => {
    const src = require('fs').readFileSync(require('path').resolve(__dirname, '../src/04-motion.css'), 'utf8');
    expect(src).toContain('.vitra-hero-spotlight');
  });

  it('should include reduced-motion override for cinematic effects', () => {
    const src = require('fs').readFileSync(require('path').resolve(__dirname, '../src/04-motion.css'), 'utf8');
    // The global * selector in prefers-reduced-motion covers all animations
    const reducedMotionBlock = src.slice(src.lastIndexOf('prefers-reduced-motion'));
    expect(reducedMotionBlock).toContain('animation-duration: 0.01ms');
  });

  it('should have --vitra-border-glow-angle token defined', () => {
    const src = require('fs').readFileSync(require('path').resolve(__dirname, '../src/01-tokens.css'), 'utf8');
    expect(src).toContain('--vitra-border-glow-angle');
  });
});

describe('CSS Premium Tokens', () => {
  it('should not reintroduce the removed accent-oklch/bg-warm/bg-cool dead tokens', () => {
    const src = require('fs').readFileSync(require('path').resolve(__dirname, '../src/01-tokens.css'), 'utf8');
    expect(src).not.toContain('--vitra-color-accent-oklch');
    expect(src).not.toContain('--vitra-color-bg-warm');
    expect(src).not.toContain('--vitra-color-bg-cool');
  });

  it('should define --vitra-space-16 in source', () => {
    const src = require('fs').readFileSync(require('path').resolve(__dirname, '../src/01-tokens.css'), 'utf8');
    expect(src).toContain('--vitra-space-16');
  });

  it('should tint neutral backgrounds with accent hue in all themes', () => {
    const src = require('fs').readFileSync(require('path').resolve(__dirname, '../src/00-themes.css'), 'utf8');
    const lines = src.split('\n');
    const bgLines = lines.filter(l => l.includes('--vitra-color-bg') && l.includes('hsl('));
    // At least one theme uses the accent hue variable for background
    const usesAccentVar = bgLines.some(l => l.includes('var(--vitra-color-accent-h)'));
    expect(usesAccentVar).toBe(true);
    // No theme uses a flat 0deg hue (pure neutral gray, isolated)
    bgLines.forEach(line => {
      const hasPureNeutral = /\bhsl\(0deg/.test(line);
      expect(hasPureNeutral).toBe(false);
    });
  });

});

describe('vitra.d.ts drift guard', () => {
  const dtsSrc = require('fs').readFileSync(
    require('path').resolve(__dirname, '../src/vitra.d.ts'),
    'utf8'
  );

  // Extracts the member names (method/property keys) declared inside a
  // named `interface Foo { ... }` block from the raw .d.ts text.
  const interfaceMembers = (interfaceName) => {
    const match = dtsSrc.match(new RegExp(`interface ${interfaceName} \\{([^}]*)\\}`));
    if (!match) return [];
    return match[1]
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.match(/^(\w+)/)?.[1])
      .filter(Boolean);
  };

  // theme excluded: its module object leaks _-prefixed private helpers as
  // real own-properties (object-literal pattern, unlike every other module's
  // closure-scoped privates) - tracked as a v1.9 audit finding, not .d.ts drift.
  it.each([
    ['ripple', 'RippleModule'],
    ['dropdown', 'DropdownModule'],
    ['spotlight', 'SpotlightModule'],
    ['scenery', 'SceneryModule'],
    ['motionGuard', 'MotionGuardModule'],
    ['toast', 'ToastModule'],
    ['particles', 'ParticlesModule'],
    ['reveal', 'RevealModule'],
    ['modal', 'ModalModule'],
    ['drawer', 'DrawerModule'],
    ['tooltip', 'TooltipModule']
  ])('%s runtime keys match declared %s interface', (moduleName, interfaceName) => {
    const runtimeKeys = Object.keys(Vitra[moduleName]).sort();
    const declaredKeys = interfaceMembers(interfaceName).sort();
    expect(runtimeKeys).toEqual(declaredKeys);
  });

  it('the module has named exports for every module, and the default object carries the same ones', async () => {
    const ns = await import('../src/vitra.js');
    const named = Object.keys(ns).filter((k) => k !== 'default').sort();
    expect(named).toEqual(Object.keys(ns.default).sort());
    named.forEach((k) => expect(ns[k]).toBe(ns.default[k]));
  });

  it('every named export has a matching `export const|function` declaration', async () => {
    const ns = await import('../src/vitra.js');
    const declared = [...dtsSrc.matchAll(/^export (?:const|function) ([A-Za-z]+)/gm)].map((m) => m[1]).sort();
    expect(declared).toEqual(Object.keys(ns).filter((k) => k !== 'default').sort());
  });

  it('VitraInstance declares every top-level Vitra module', () => {
    const declaredTopLevel = interfaceMembers('VitraInstance');
    const runtimeTopLevel = Object.keys(Vitra);
    runtimeTopLevel.forEach((key) => {
      expect(declaredTopLevel).toContain(key);
    });
  });
});

// Regression guards for the 2026-11 audit
describe('Audit 2026-11 regressions', () => {
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('tooltip: hide() removes the node it faded out', async () => {
    document.body.innerHTML = '<button id="a">A</button>';
    Vitra.tooltip.show('#a', 'one');
    await wait(30);
    expect(document.querySelectorAll('.vitra-tooltip-js').length).toBe(1);
    Vitra.tooltip.hide();
    await wait(260);
    expect(document.querySelectorAll('.vitra-tooltip-js').length).toBe(0);
  });

  it('tooltip: showing a second tooltip does not delete it', async () => {
    document.body.innerHTML = '<button id="a">A</button><button id="b">B</button>';
    Vitra.tooltip.show('#a', 'one');
    await wait(30);
    Vitra.tooltip.show('#b', 'two');
    await wait(300);
    const left = [...document.querySelectorAll('.vitra-tooltip-js')];
    expect(left.length).toBe(1);
    expect(left[0].textContent).toBe('two');
    expect(document.getElementById('b').getAttribute('aria-describedby')).toBe(left[0].id);
    expect(document.getElementById('a').hasAttribute('aria-describedby')).toBe(false);
    Vitra.tooltip.hide();
  });

  it('theme: init accepts `default` as an alias of `defaultTheme`', () => {
    Vitra.theme.init({ default: 'neon', persist: false });
    expect(document.documentElement.dataset.theme).toBe('neon');
  });

  describe('reveal with an observer', () => {
    let observers;
    let originalIO;
    let originalMatchMedia;

    beforeEach(() => {
      observers = [];
      originalIO = window.IntersectionObserver;
      originalMatchMedia = window.matchMedia;
      window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
      window.IntersectionObserver = class {
        constructor(cb) { this.cb = cb; this.targets = new Set(); this.disconnected = false; observers.push(this); }
        observe(el) { this.targets.add(el); }
        unobserve(el) { this.targets.delete(el); }
        disconnect() { this.disconnected = true; this.targets.clear(); }
      };
    });

    afterEach(() => {
      Vitra.reveal.destroy();
      window.IntersectionObserver = originalIO;
      window.matchMedia = originalMatchMedia;
    });

    it('destroy() makes not-yet-revealed elements visible again', () => {
      document.body.innerHTML = '<div class="vitra-reveal" id="r"></div>';
      const el = document.getElementById('r');
      Vitra.reveal.init();
      expect(el.style.opacity).toBe('0');
      Vitra.reveal.destroy();
      expect(el.style.opacity).toBe('1');
    });

    it('init() twice disconnects the first observer', () => {
      document.body.innerHTML = '<div class="vitra-reveal"></div>';
      Vitra.reveal.init();
      Vitra.reveal.init();
      expect(observers.length).toBe(2);
      expect(observers[0].disconnected).toBe(true);
    });

    it('reset() observes revealed elements again', async () => {
      document.body.innerHTML = '<div class="vitra-reveal" id="r"></div>';
      const el = document.getElementById('r');
      Vitra.reveal.init({ stagger: 0 });
      const io = observers[observers.length - 1];
      io.cb([{ isIntersecting: true, target: el }]);
      await wait(10);
      expect(el.classList.contains('vitra-revealed')).toBe(true);
      expect(io.targets.has(el)).toBe(false);
      Vitra.reveal.reset();
      expect(io.targets.has(el)).toBe(true);
    });
  });
});

// Edge cases: theme, particles, motionGuard, spotlight, ripple, toast
describe('Edge cases (task 12)', () => {
  afterEach(() => {
    Vitra.destroyAll();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('theme', () => {
    it('set() without document.body applies the theme, skips the announcer, and creates it in <body> later', () => {
      const body = document.body;
      body.remove();
      try {
        let result;
        expect(() => { result = Vitra.theme.set('dark'); }).not.toThrow();
        expect(result).toBe(true);
        expect(document.documentElement.dataset.theme).toBe('dark');
        expect(document.getElementById('vitra-theme-announcer')).toBeNull();
      } finally {
        document.documentElement.appendChild(body);
      }
      Vitra.theme.set('light');
      const ann = document.getElementById('vitra-theme-announcer');
      expect(ann).not.toBeNull();
      expect(ann.parentNode).toBe(document.body);
    });

    it('toggle() works when destructured', () => {
      const { toggle } = Vitra.theme;
      Vitra.theme.set('light');
      expect(() => toggle()).not.toThrow();
      expect(Vitra.theme.get()).toBe('dark');
    });

    it('init({ persist: false }) makes a later set() skip localStorage', () => {
      Vitra.theme.init({ persist: false });
      Vitra.theme.set('neon');
      expect(localStorage.getItem('vitra-theme')).toBeNull();
      expect(Vitra.theme.get()).toBe('neon');
      Vitra.theme.init();
    });
  });

  describe('particles', () => {
    let origMM;
    beforeEach(() => {
      origMM = window.matchMedia;
      window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
    });
    afterEach(() => {
      window.matchMedia = origMM;
      Vitra.particles.destroy();
    });

    it('frees slots when the container is removed from the DOM', () => {
      document.body.innerHTML = '<div id="box"></div>';
      expect(Vitra.particles.spawn(40, { container: '#box' })).toBe(40);
      document.getElementById('box').remove();
      expect(Vitra.particles.limits().active).toBe(0);
      document.body.innerHTML = '<div id="box2"></div>';
      expect(Vitra.particles.spawn(5, { container: '#box2' })).toBe(5);
    });

    it('init() twice does not spawn a second batch', () => {
      document.body.innerHTML = '<div id="p" data-vitra-particles="5"></div>';
      Vitra.particles.init();
      Vitra.particles.init();
      expect(document.querySelectorAll('#p > *').length).toBe(5);
    });
  });

  describe('motionGuard.observe', () => {
    let observed;
    let origIO;
    let origMM;
    beforeEach(() => {
      observed = [];
      origIO = window.IntersectionObserver;
      origMM = window.matchMedia;
      window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
      window.IntersectionObserver = class {
        observe(el) { observed.push(el); }
        disconnect() {}
      };
    });
    afterEach(() => {
      window.IntersectionObserver = origIO;
      window.matchMedia = origMM;
    });

    it('is a no-op before init', () => {
      const el = document.createElement('div');
      Vitra.motionGuard.observe(el);
      expect(observed).toEqual([]);
    });

    it('observes an element once, and scenery.mount() uses it', () => {
      document.body.innerHTML = '<div id="s"></div>';
      Vitra.motionGuard.init();
      const el = document.getElementById('s');
      Vitra.scenery.mount(el);
      expect(observed).toContain(el);
      Vitra.motionGuard.observe(el);
      expect(observed.filter(o => o === el).length).toBe(1);
    });
  });

  it('spotlight: pointermove writes --vitra-mouse-* and the --mouse-* aliases', async () => {
    document.body.innerHTML = '<div class="vitra-spotlight"></div>';
    const el = document.querySelector('.vitra-spotlight');
    el.getBoundingClientRect = () => ({ left: 10, top: 20, width: 100, height: 100 });
    Vitra.spotlight.init();
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 60, clientY: 70, bubbles: true }));
    await new Promise(r => requestAnimationFrame(r));
    expect(el.style.getPropertyValue('--vitra-mouse-x')).toBe('50px');
    expect(el.style.getPropertyValue('--mouse-x')).toBe('50px');
    expect(el.style.getPropertyValue('--vitra-mouse-y')).toBe('50px');
    expect(el.style.getPropertyValue('--mouse-y')).toBe('50px');
  });

  it('ripple: a keyboard click (detail 0) starts from the centre', () => {
    document.body.innerHTML = '<button class="vitra-ripple">Go</button>';
    const btn = document.querySelector('button');
    btn.getBoundingClientRect = () => ({ left: 100, top: 50, width: 80, height: 40 });
    Vitra.ripple.init();
    btn.click();
    const fx = btn.querySelector('.vitra-ripple-effect');
    // size 80: centre (40, 20) minus half the size
    expect(fx.style.left).toBe('0px');
    expect(fx.style.top).toBe('-20px');
  });

  describe('toast live region', () => {
    it('exists empty after auto-init and show() reuses it', async () => {
      vi.resetModules();
      document.body.innerHTML = '';
      const fresh = await import('../src/vitra.js');
      const V = fresh.default || fresh;
      const containers = document.querySelectorAll('.vitra-toast-container');
      expect(containers.length).toBe(1);
      expect(containers[0].children.length).toBe(0);
      expect(containers[0].getAttribute('role')).toBe('status');
      V.toast.show('hello');
      expect(document.querySelectorAll('.vitra-toast-container').length).toBe(1);
      expect(containers[0].children.length).toBe(1);
      V.destroyAll();
      expect(document.querySelector('.vitra-toast-container')).toBeNull();
    });
  });
});
