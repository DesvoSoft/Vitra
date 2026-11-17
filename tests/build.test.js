import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { mirrorAuto } = require('../scripts/lib/auto-mirror.cjs');

const norm = (s) => s.replace(/\s+/g, ' ').trim();

describe('mirrorAuto', () => {
  it('copies a light rule into prefers-color-scheme: light and keeps the original', () => {
    const out = norm(mirrorAuto('/* @vitra-auto-mirror light */\nhtml[data-theme="light"] { --a: 1 }'));
    expect(out).toContain('html[data-theme="light"] { --a: 1 }');
    expect(out).toContain('@media (prefers-color-scheme: light) { html[data-theme="auto"] { --a: 1 } }');
    expect(out).not.toContain('@vitra-auto-mirror');
  });

  it('keeps only the selectors that name the mirrored theme', () => {
    const out = norm(mirrorAuto('/* @vitra-auto-mirror light */\n[data-theme="light"], [data-theme="pastel"] { --b: 2 }'));
    expect(out).toContain('@media (prefers-color-scheme: light) { [data-theme="auto"] { --b: 2 } }');
    expect(out).toContain('[data-theme="light"], [data-theme="pastel"] { --b: 2 }');
  });

  it('replaces the whole theme list inside :where()', () => {
    const out = norm(mirrorAuto('/* @vitra-auto-mirror light */\n:where([data-theme="light"], [data-theme="pastel"]) .x { color: red }'));
    expect(out).toContain('@media (prefers-color-scheme: light) { :where([data-theme="auto"]) .x { color: red } }');
  });

  it('mirrors a dark marker into prefers-color-scheme: dark', () => {
    const out = norm(mirrorAuto('/* @vitra-auto-mirror dark */\n:where([data-theme="dark"], [data-theme="neon"]) .y { color: blue }'));
    expect(out).toContain('@media (prefers-color-scheme: dark) { :where([data-theme="auto"]) .y { color: blue } }');
  });

  it('handles :is() and a selector list mixing both forms', () => {
    const out = norm(mirrorAuto('/* @vitra-auto-mirror dark */\n:is([data-theme="dark"], [data-theme="neon"]) .a, [data-theme="dark"] .b, [data-theme="neon"] .c { top: 0 }'));
    expect(out).toContain('{ :is([data-theme="auto"]) .a, [data-theme="auto"] .b { top: 0 } }');
  });

  it('places the copy inside the same layer, right after the rule, with declarations intact', () => {
    const out = norm(mirrorAuto('@layer l { /* @vitra-auto-mirror light */\nhtml[data-theme="light"] { --a: hsl(1 2% 3% / 4%); b: calc(1px + 2px) } .z { c: d } }'));
    expect(out).toMatch(/^@layer l \{ html\[data-theme="light"\] \{[^}]*\} @media \(prefers-color-scheme: light\) \{ html\[data-theme="auto"\] \{ --a: hsl\(1 2% 3% \/ 4%\); b: calc\(1px \+ 2px\) \} \} \.z \{ c: d \} \}$/);
  });

  it('leaves css without markers untouched', () => {
    const css = '.a { color: red }\n[data-theme="light"] { --a: 1 }\n';
    expect(mirrorAuto(css)).toBe(css);
  });

  it('throws when a marker is not followed by a rule', () => {
    expect(() => mirrorAuto('/* @vitra-auto-mirror light */')).toThrow();
    expect(() => mirrorAuto('/* @vitra-auto-mirror light */\n@media print { a { b: c } }')).toThrow();
    expect(() => mirrorAuto('@layer l { .a { b: c } /* @vitra-auto-mirror dark */ }')).toThrow();
  });

  it('throws when the rule does not contain the marked theme', () => {
    expect(() => mirrorAuto('/* @vitra-auto-mirror light */\n[data-theme="dark"] { --a: 1 }')).toThrow();
    expect(() => mirrorAuto('/* @vitra-auto-mirror dark */\n.plain { --a: 1 }')).toThrow();
  });

  it('throws on an unknown scheme in the marker', () => {
    expect(() => mirrorAuto('/* @vitra-auto-mirror sepia */\n[data-theme="sepia"] { --a: 1 }')).toThrow();
  });
});

describe('source files', () => {
  it('never write data-theme="auto" by hand (the build generates it)', () => {
    const dir = path.join(__dirname, '..', 'src');
    const offenders = fs.readdirSync(dir)
      .filter((f) => f.endsWith('.css'))
      .filter((f) => fs.readFileSync(path.join(dir, f), 'utf8').includes('data-theme="auto"'));
    expect(offenders).toEqual([]);
  });
});

describe('mirrorAuto refuses selectors it cannot mirror faithfully', () => {
  it('throws when the theme attribute is inside :not()', () => {
    expect(() => mirrorAuto('/* @vitra-auto-mirror light */\n.x:not([data-theme="light"]) { a: b }')).toThrow(Error);
    expect(() => mirrorAuto('/* @vitra-auto-mirror light */\n[data-theme="light"]:not([data-theme="pastel"]) { a: b }')).toThrow(/:not/);
    expect(() => mirrorAuto('/* @vitra-auto-mirror dark */\n:where([data-theme="dark"]):not(:where([data-theme="neon"])) .y { a: b }')).toThrow(/:not/);
  });

  it('throws when theme attributes appear more than once outside one :where()/:is() list', () => {
    expect(() => mirrorAuto('/* @vitra-auto-mirror light */\n:where([data-theme="light"]) :where([data-theme="pastel"]) { a: b }')).toThrow(Error);
    expect(() => mirrorAuto('/* @vitra-auto-mirror light */\n[data-theme="light"] [data-theme="pastel"] { a: b }')).toThrow(/more than once/);
    expect(() => mirrorAuto('/* @vitra-auto-mirror light */\n:is([data-theme="light"]) [data-theme="pastel"] .z { a: b }')).toThrow(/more than once/);
  });

  it('still accepts one theme list, even next to selectors without a theme', () => {
    const out = norm(mirrorAuto('/* @vitra-auto-mirror dark */\n:where([data-theme="dark"], [data-theme="neon"]) .a, :where(:root:not([data-theme])) .a { top: 0 }'));
    expect(out).toContain('@media (prefers-color-scheme: dark) { :where([data-theme="auto"]) .a { top: 0 } }');
  });
});

// ---------------------------------------------------------------- tokens ---

const postcss = require('postcss');
const valueParser = require('postcss-value-parser');

const SRC = path.join(__dirname, '..', 'src');
const srcFiles = fs.readdirSync(SRC).filter((f) => f.endsWith('.css')).sort();
const parseSrc = (f) => postcss.parse(fs.readFileSync(path.join(SRC, f), 'utf8'), { from: f });

const COLOR_PROP = /^(color|background|background-color|outline|outline-color|fill|stroke|border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-color)?)$/;
const COLOR_FN = /^(rgba?|hsla?)$/i;
const GRADIENT_FN = /-gradient$/i;

/** Colour literals of a value that are not inside a gradient function. */
function literalsOutsideGradients(value) {
  const found = [];
  const walk = (nodes, inGradient) => {
    for (const n of nodes) {
      if (n.type === 'function') {
        if (COLOR_FN.test(n.value) && !inGradient) found.push(valueParser.stringify(n));
        walk(n.nodes, inGradient || GRADIENT_FN.test(n.value));
      } else if (n.type === 'word' && /^#[0-9a-f]{3,8}$/i.test(n.value) && !inGradient) {
        found.push(n.value);
      }
    }
  };
  walk(valueParser(value).nodes, false);
  return found;
}

describe('components, utilities and shaders use theme tokens only', () => {
  it('has no colour literal in colour declarations unless it is accent-derived, in a gradient or marked vitra-literal-ok', () => {
    const offenders = [];
    for (const file of srcFiles) {
      parseSrc(file).walkDecls((decl) => {
        if (!COLOR_PROP.test(decl.prop)) return;
        let layer = decl.parent;
        while (layer && !(layer.type === 'atrule' && layer.name === 'layer')) layer = layer.parent;
        if (!layer || !['components', 'utilities', 'shaders'].includes(layer.params.trim())) return;
        if (!literalsOutsideGradients(decl.value).length) return;
        if (decl.value.includes('var(--vitra-color-accent-h)')) return;
        const prev = decl.prev();
        if (prev && prev.type === 'comment' && /^\s*vitra-literal-ok:\s*\S/.test(prev.text)) return;
        const rule = decl.parent.type === 'rule' ? decl.parent.selector.replace(/\s+/g, ' ') : '?';
        offenders.push(`${file}:${decl.source.start.line} ${rule} { ${decl.prop}: ${decl.value} }`);
      });
    }
    expect(offenders).toEqual([]);
  });
});

describe('every theme covers the dark tokens', () => {
  const THEMES = ['light', 'pastel', 'neon', 'ocean', 'emerald'];
  const TOKEN = /^--vitra-(color|shadow|glass)-/;

  /** token -> value, for the rules with a selector that is just :root or the given theme. */
  const defined = (theme) => {
    const tokens = new Map();
    const target = theme === null
      ? (s) => s === ':root'
      : (s) => new RegExp(`^(html)?\\[data-theme="${theme}"\\]$`).test(s);
    for (const file of srcFiles) {
      parseSrc(file).walkRules((rule) => {
        const parts = rule.selector.split(',').map((s) => s.trim());
        if (!parts.some(target)) return;
        rule.walkDecls(TOKEN, (d) => tokens.set(d.prop, d.value));
      });
    }
    return tokens;
  };

  const root = defined(null);
  const dark = new Map([...root, ...defined('dark')]);

  it('defines the dark tokens in :root or html[data-theme="dark"]', () => {
    expect(dark.size).toBeGreaterThan(30);
  });

  for (const theme of THEMES) {
    it(`${theme} defines or inherits from :root every dark token`, () => {
      const own = new Set([...root.keys(), ...defined(theme).keys()]);
      expect([...dark.keys()].filter((t) => !own.has(t))).toEqual([]);
    });
  }

  for (const theme of ['light', 'pastel']) {
    it(`${theme} redefines every surface, border, text and shadow token`, () => {
      const own = defined(theme);
      // Glows are built from the accent colour, which the theme already redefines.
      const needed = [...dark].filter(([t, v]) =>
        /^--vitra-(color-(surface|border|text-)|shadow-)/.test(t) && !v.includes('--vitra-color-accent-l'));
      expect(needed.map(([t]) => t).filter((t) => !own.has(t))).toEqual([]);
    });
  }
});

// ------------------------------------------------------------ backdrop ---

describe('backdrop-filter', () => {
  it('is always inside an @supports backdrop-filter block, unless marked vitra-backdrop-ok', () => {
    const offenders = [];
    for (const file of srcFiles) {
      parseSrc(file).walkDecls(/^(-webkit-)?backdrop-filter$/, (decl) => {
        if (/^\s*none\b/.test(decl.value)) return;
        for (let n = decl.parent; n; n = n.parent) {
          if (n.type === 'atrule' && n.name === 'supports' && /backdrop-filter/.test(n.params) && !/^\s*not\b/.test(n.params)) return;
        }
        const prev = decl.prev();
        if (prev && prev.type === 'comment' && /^\s*vitra-backdrop-ok:\s*\S/.test(prev.text)) return;
        const rule = decl.parent.type === 'rule' ? decl.parent.selector.replace(/\s+/g, ' ') : '?';
        offenders.push(`${file}:${decl.source.start.line} ${rule}`);
      });
    }
    expect(offenders).toEqual([]);
  });
});
