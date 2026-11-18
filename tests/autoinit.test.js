import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Auto-init behavior: on pages WITHOUT a [data-config] element, the default
// modules (dropdown, ripple, tooltip, spotlight) must still initialize.
// data-config is an opt-out mechanism, not an opt-in requirement.
// Regression guard for the v1.10.0 gating change.

const DROPDOWN_HTML = `
  <div class="vitra-dropdown">
    <button data-vitra-dropdown-toggle aria-expanded="false">Menu</button>
    <div class="vitra-dropdown-menu"><button class="vitra-dropdown-item">A</button></div>
  </div>
`;

let Vitra;

beforeEach(() => {
  vi.resetModules();
  document.body.innerHTML = '';
});

afterEach(() => {
  if (Vitra) Vitra.destroyAll();
  document.body.innerHTML = '';
});

async function importVitra() {
  const mod = await import('../src/vitra.js');
  return mod.default || mod;
}

describe('Auto-init', () => {
  it('initializes dropdown by default when no [data-config] element exists', async () => {
    document.body.innerHTML = DROPDOWN_HTML;

    Vitra = await importVitra();

    const toggle = document.querySelector('[data-vitra-dropdown-toggle]');
    toggle.click();

    const dd = document.querySelector('.vitra-dropdown');
    expect(dd.classList.contains('open')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('initializes drawer by default and respects drawer:false', async () => {
    const DRAWER = `<button id="t" data-vitra-drawer-toggle="#d">m</button><nav id="d" class="vitra-drawer"><a href="#x">x</a></nav>`;
    document.body.innerHTML = DRAWER;
    Vitra = await importVitra();
    document.getElementById('t').click();
    expect(document.getElementById('d').classList.contains('open')).toBe(true);
    Vitra.destroyAll();

    vi.resetModules();
    document.body.innerHTML = `<div data-config='{"drawer": false}'></div>` + DRAWER;
    Vitra = await importVitra();
    document.getElementById('t').click();
    expect(document.getElementById('d').classList.contains('open')).toBe(false);
    expect(document.getElementById('d').hasAttribute('inert')).toBe(false);
  });

  it('respects dropdown:false opt-out via data-config', async () => {
    document.body.innerHTML =
      `<div data-config='{"dropdown": false}'></div>` + DROPDOWN_HTML;

    Vitra = await importVitra();

    const toggle = document.querySelector('[data-vitra-dropdown-toggle]');
    toggle.click();

    const dd = document.querySelector('.vitra-dropdown');
    expect(dd.classList.contains('open')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('a malformed drawer toggle selector warns and the following modules still initialise', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    document.body.innerHTML = '<button data-vitra-drawer-toggle="menu[1">a</button><button data-vitra-drawer-toggle="#1nav">b</button>' + DROPDOWN_HTML;
    Vitra = await importVitra();
    const toggle = document.querySelector('[data-vitra-dropdown-toggle]');
    toggle.click();
    expect(document.querySelector('.vitra-dropdown').classList.contains('open')).toBe(true);
    expect(warn).toHaveBeenCalledWith('[Vitra Drawer] Invalid selector "menu[1"');
    expect(warn).toHaveBeenCalledWith('[Vitra Drawer] Invalid selector "#1nav"');
    warn.mockRestore();
  });

  it('a valid drawer opens and closes while a malformed toggle exists', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    document.body.innerHTML = '<button id="bad" data-vitra-drawer-toggle="menu[1">a</button>' +
      '<button id="t" data-vitra-drawer-toggle="#d">m</button><nav id="d" class="vitra-drawer"><a href="#x">x</a></nav>';
    Vitra = await importVitra();
    const d = document.getElementById('d');
    document.getElementById('t').click();
    expect(d.classList.contains('open')).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    expect(d.contains(document.activeElement)).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(d.classList.contains('open')).toBe(false);
    document.getElementById('t').click();
    expect(d.classList.contains('open')).toBe(true);
    document.getElementById('t').click();
    expect(d.classList.contains('open')).toBe(false);
    expect(document.body.style.overflow).toBe('');
    // A click on the malformed toggle itself is a no-op, not an exception
    expect(() => document.getElementById('bad').click()).not.toThrow();
    // Warned once per selector, however often it is resolved
    expect(warn.mock.calls.filter((c) => c[0] === '[Vitra Drawer] Invalid selector "menu[1"').length).toBe(1);
    warn.mockRestore();
  });

  it('one module whose init throws does not stop the modules after it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const had = 'IntersectionObserver' in window;
    const IO = window.IntersectionObserver;
    window.IntersectionObserver = function () { throw new Error('boom'); };
    document.body.innerHTML = `<div data-config='{"reveal": true}'></div><div class="vitra-reveal"></div>` + DROPDOWN_HTML;
    try {
      Vitra = await importVitra();
    } finally {
      if (had) window.IntersectionObserver = IO;
      else delete window.IntersectionObserver;
    }
    document.querySelector('[data-vitra-dropdown-toggle]').click();
    expect(document.querySelector('.vitra-dropdown').classList.contains('open')).toBe(true);
    expect(warn.mock.calls.some((c) => String(c[0]).startsWith('[Vitra]'))).toBe(true);
    warn.mockRestore();
  });

  it('respects toast:false (no container at load) and show() still works lazily', async () => {
    document.body.innerHTML = `<div data-config='{"toast": false}'></div>`;
    Vitra = await importVitra();
    expect(document.querySelector('.vitra-toast-container')).toBeNull();
    Vitra.toast.show('hi');
    expect(document.querySelectorAll('.vitra-toast-container').length).toBe(1);
  });
});
