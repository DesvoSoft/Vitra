const fs = require('fs');
const crypto = require('crypto');

function getSRI(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return 'sha256-' + hashSum.digest('base64');
}

console.log('vitra.min.css: ' + getSRI('dist/vitra.min.css'));
console.log('vitra.min.js: ' + getSRI('dist/vitra.min.js'));
