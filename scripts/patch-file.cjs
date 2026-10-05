// EOL-agnostic file patcher: require('./edit.cjs')(file, s => newS)
const fs = require('fs');
module.exports = (file, fn) => {
  const raw = fs.readFileSync(file, 'utf8');
  const crlf = raw.includes('\r\n');
  let s = raw.replace(/\r\n/g, '\n');
  const api = {
    rep(a, b) { if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 80)); s = s.replace(a, () => b); return api; },
    between(startMarker, endMarker, b) {
      const i = s.indexOf(startMarker), j = s.indexOf(endMarker, i + 1);
      if (i < 0 || j < 0) throw new Error('markers: ' + startMarker.slice(0, 50) + ' / ' + endMarker.slice(0, 50));
      s = s.slice(0, i) + b + s.slice(j); return api;
    },
    get text() { return s; },
  };
  fn(api);
  fs.writeFileSync(file, crlf ? s.replace(/\n/g, '\r\n') : s);
};
