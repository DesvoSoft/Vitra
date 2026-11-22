const fs = require('fs');
const crypto = require('crypto');

// Hash the LF form of the file: that is what git stores (dist/** is eol=lf,
// see .gitattributes) and what the CDN serves, whatever the checkout's line
// endings are. The build emits LF already; this keeps a stray CRLF copy from
// producing a hash nobody will ever be served.
function getSRI(filePath) {
  const content = Buffer.from(fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n'));
  const hashSum = crypto.createHash('sha256');
  hashSum.update(content);
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
