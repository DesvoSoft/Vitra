/**
 * CSS Build Script for Vitra CSS Framework
 * Concatenates source files in layer order, then minifies with lightningcss
 */

const fs = require('fs');
const path = require('path');
const lightningcss = require('lightningcss');

// Define source files in layer order
const sourceFiles = [
  '01-tokens.css',    // Foundation tokens layer (Base)
  '00-themes.css',    // Theme definitions (Overrides base tokens)
  '02-glass.css',     // Glass layer
  '03-particles.css', // Particles layer
  '04-motion.css',    // Motion layer
  '05-layout.css',    // Layout layer
  '06-components.css', // Components layer
  '07-utilities.css'  // Utilities layer (last to override)
];

const srcDir = path.join(__dirname, '..', 'src');
const distDir = path.join(__dirname, '..', 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('Building Vitra CSS...');
console.log('');

// Step 1: Concatenate source files
console.log('Step 1: Concatenating source files...');
let combinedCSS = '';

for (const file of sourceFiles) {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`  Warning: ${file} not found, skipping...`);
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  combinedCSS += `/* === ${file} === */\n`;
  combinedCSS += content + '\n\n';
}

// Write unminified version
const unminifiedPath = path.join(distDir, 'vitra.css');
fs.writeFileSync(unminifiedPath, combinedCSS);
console.log(`  Created: dist/vitra.css (${combinedCSS.length} bytes)`);
console.log('');

// Step 2: Minify with lightningcss
console.log('Step 2: Minifying with lightningcss...');
try {
  // Convert string to Uint8Array
  const code = new TextEncoder().encode(combinedCSS);

  const result = lightningcss.transform({
    filename: 'vitra.css',
    code: code,
    minify: true,
    sourceMap: false,
    errorRecovery: true, // Ignore invalid rules
    targets: {
      // Support last 2 versions of major browsers
      chrome: (120 << 16),
      firefox: (120 << 16),
      safari: (17 << 16),
      edge: (120 << 16)
    }
  });

  const minifiedPath = path.join(distDir, 'vitra.min.css');
  fs.writeFileSync(minifiedPath, result.code);
  console.log(`  Created: dist/vitra.min.css (${result.code.length} bytes)`);
  console.log('');

  console.log('CSS build complete!');
} catch (error) {
  console.error('Error during minification:', error.message);
  if (error.loc) {
    console.error(`  at ${error.loc.filename}:${error.loc.line}:${error.loc.col}`);
  }
  process.exit(1);
}
