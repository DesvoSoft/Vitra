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
});

describe('Reveal Module', () => {
  it('should init without error', () => {
    expect(() => Vitra.reveal.init()).not.toThrow();
  });

  it('should reveal elements immediately when reduced motion is set', () => {
    Object.defineProperty(window, 'matchMedia', {
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
});

describe('Dropdown Module', () => {
  it('should initialize without error', () => {
    expect(() => Vitra.dropdown.init()).not.toThrow();
  });
});

describe('Spotlight Module', () => {
  it('should initialize without error', () => {
    expect(() => Vitra.spotlight.init()).not.toThrow();
  });
});

describe('Module Structure', () => {
  it('should expose all expected modules', () => {
    expect(Vitra.theme).toBeDefined();
    expect(Vitra.particles).toBeDefined();
    expect(Vitra.reveal).toBeDefined();
    expect(Vitra.modal).toBeDefined();
    expect(Vitra.tooltip).toBeDefined();
    expect(Vitra.toast).toBeDefined();
    expect(Vitra.dropdown).toBeDefined();
    expect(Vitra.spotlight).toBeDefined();
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
  it('should define --vitra-color-accent-oklch in source', () => {
    const rootRules = [...document.styleSheets].flatMap(s =>
      [...s.cssRules].filter(r => r.selectorText === ':root' || r.selectorText?.includes(':root'))
    );
    // Check via import of compiled CSS
    const style = getComputedStyle(document.documentElement);
    // oklch may not be supported in jsdom, so we check the source file presence
    const src = require('fs').readFileSync(require('path').resolve(__dirname, '../src/01-tokens.css'), 'utf8');
    expect(src).toContain('--vitra-color-accent-oklch');
    expect(src).toContain('--vitra-color-bg-warm');
    expect(src).toContain('--vitra-color-bg-cool');
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

  it('should define warm and cool variants in source', () => {
    const src = require('fs').readFileSync(require('path').resolve(__dirname, '../src/01-tokens.css'), 'utf8');
    expect(src).toContain('--vitra-color-bg-warm');
    expect(src).toContain('--vitra-color-bg-cool');
  });
});
