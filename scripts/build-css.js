/**
 * CSS Build Script for Vitra CSS Framework
 * Concatenates source files in layer order, then minifies with lightningcss.
 * Emits the full bundle (dist/vitra.css) and three pieces that can be loaded
 * separately: core, scenery and effects.
 */

const fs = require('fs');
const path = require('path');
const lightningcss = require('lightningcss');
const { mirrorAuto } = require('./lib/auto-mirror.cjs');

// Every piece declares the whole layer order, so they can load in any order.
const LAYER_ORDER = '@layer tokens, glass, particles, motion, scenery, layout, components, utilities, shaders;';

// Source files of each output, in cascade order
const outputs = [
  {
    name: 'vitra',
    files: [
      '01-tokens.css',    // Foundation tokens layer (Base)
      '00-themes.css',    // Theme definitions (Overrides base tokens)
      '02-glass.css',     // Glass layer
      '03-particles.css', // Particles layer
      '04-motion.css',    // Motion layer
      '09-scenery.css',   // Scenery layer (ambient blob-landscape backdrop)
      '05-layout.css',    // Layout layer
      '06-components.css', // Components layer
      '07-utilities.css',  // Utilities layer
      '08-shaders.css'     // Shaders layer (premium CSS effects)
    ]
  },
  {
    name: 'vitra.core',
    piece: true,
    files: ['01-tokens.css', '00-themes.css', '02-glass.css', '04-motion.css', '05-layout.css', '06-components.css', '07-utilities.css']
  },
  { name: 'vitra.scenery', piece: true, files: ['09-scenery.css'] },
  { name: 'vitra.effects', piece: true, files: ['03-particles.css', '08-shaders.css'] }
];

const srcDir = path.join(__dirname, '..', 'src');
const distDir = path.join(__dirname, '..', 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('Building Vitra CSS...');
console.log('');

function concat(files) {
  let css = '';
  for (const file of files) {
    const filePath = path.join(srcDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`Error: source file src/${file} not found (listed in scripts/build-css.js).`);
      process.exit(1);
    }
    // A Windows checkout has CRLF sources: emit LF only, so every platform
    // builds the same bytes, the bytes git stores and the CDN serves.
    css += `/* === ${file} === */\n${fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n')}\n\n`;
  }
  return css;
}

for (const { name, files, piece } of outputs) {
  console.log(`${name}: ${files.join(', ')}`);
  let css = concat(files);
  // 01-tokens.css carries the layer order itself; the other pieces need it first.
  if (!files.includes('01-tokens.css')) css = LAYER_ORDER + '\n\n' + css;

  // Generate [data-theme="auto"] from the rules marked with @vitra-auto-mirror
  css = mirrorAuto(css);

  fs.writeFileSync(path.join(distDir, `${name}.css`), css);
  console.log(`  Created: dist/${name}.css (${css.length} bytes)`);

  try {
    const result = lightningcss.transform({
      filename: `${name}.css`,
      code: new TextEncoder().encode(css),
      minify: true,
      sourceMap: true,
      errorRecovery: false, // Fail on invalid rules
      targets: {
        // Support last 2 versions of major browsers
        chrome: (120 << 16),
        firefox: (120 << 16),
        safari: (17 << 16),
        edge: (120 << 16)
      }
    });

    const minName = `${name}.min.css`;
    let body = result.code;
    let map = result.map;
    if (piece) {
      // lightningcss trims the layer statement down to what the file itself
      // needs, which would let a piece loaded first fix a wrong layer order.
      // Put the full statement back on its own line and shift the map by it.
      body = Buffer.concat([Buffer.from(LAYER_ORDER.replace(/, /g, ',') + '\n'), body]);
      const parsed = JSON.parse(map.toString());
      map = Buffer.from(JSON.stringify({ ...parsed, mappings: ';' + parsed.mappings }));
    }
    const code = Buffer.concat([body, Buffer.from(`\n/*# sourceMappingURL=${minName}.map */\n`)]);
    fs.writeFileSync(path.join(distDir, minName), code);
    console.log(`  Created: dist/${minName} (${code.length} bytes)`);
    if (map) {
      fs.writeFileSync(path.join(distDir, `${minName}.map`), map);
      console.log(`  Created: dist/${minName}.map`);
    }
  } catch (error) {
    console.error(`Error during minification of ${name}:`, error.message);
    if (error.loc) {
      console.error(`  at ${error.loc.filename}:${error.loc.line}:${error.loc.col}`);
    }
    process.exit(1);
  }
}

console.log('');
console.log('CSS build complete!');
