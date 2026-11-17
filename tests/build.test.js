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
