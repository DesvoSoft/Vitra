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
});
