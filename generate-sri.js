const fs = require('fs');
const crypto = require('crypto');

function getSRI(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return 'sha256-' + hashSum.digest('base64');
}

// The first two lines keep their format for existing consumers of SRI.txt.
for (const file of [
  'vitra.min.css',
  'vitra.min.js',
  'vitra.core.css',
  'vitra.core.min.css',
  'vitra.scenery.css',
  'vitra.scenery.min.css',
  'vitra.effects.css',
  'vitra.effects.min.css'
]) {
  console.log(file + ': ' + getSRI('dist/' + file));
}
