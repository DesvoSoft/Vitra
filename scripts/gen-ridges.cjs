// Ridge silhouette generator: art-directed control points + seeded midpoint
// displacement, straight segments only (faceted, paper-cut alpine look).
// Usage: node scripts/gen-ridges.cjs [--write]   (prints sizes; --write patches src/09-scenery.css)
// Re-roll the fractal detail with SEED_FAR / SEED_MID / SEED_NEAR; reshape the ranges by editing FAR / MID.
const W = 1440, H = 400;
const rng = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

function fractal(ctrl, levels, rough, seed) {
  const r = rng(seed);
  let pts = ctrl.map(p => ({ x: p[0], y: p[1], keep: true }));
  for (let l = 0; l < levels; l++) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], dx = b.x - a.x;
      out.push(a);
      if (dx < 16) continue;
      const t = 0.5 + (r() - 0.5) * 0.36;
      const amp = dx * rough * Math.pow(0.6, l);
      out.push({ x: a.x + dx * t, y: a.y + (b.y - a.y) * t + (r() - 0.5) * 2 * amp });
    }
    out.push(pts[pts.length - 1]);
    pts = out;
  }
  // summits stay the highest thing around them: clamp neighbours below control peaks
  return pts.map(p => ({ x: Math.round(p.x), y: Math.round(p.y) }));
}

const d = pts => pts.map((p, i) => (i ? 'L' : 'M') + p.x + ' ' + p.y).join('');
const closed = pts => `M0 ${H}V${pts[0].y}` + pts.slice(1).map(p => `L${p.x} ${p.y}`).join('') + `V${H}Z`;

// Lit faces: light comes from the left. For every prominent summit, the face
// runs from the summit down its left ridgeline to the valley, and is cut on the
// right by a spine that zigzags from the summit to the base.
function facets(pts, minProm, seed, lean) {
  const r = rng(seed);
  const polys = [];
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    if (!(p.y < pts[i - 1].y && p.y <= pts[i + 1].y)) continue;
    // walk left to the valley
    let j = i;
    while (j > 0 && pts[j - 1].y >= pts[j].y) j--;
    // right valley, for prominence
    let k = i;
    while (k < pts.length - 1 && pts[k + 1].y >= pts[k].y) k++;
    const prom = Math.min(pts[j].y, pts[k].y) - p.y;
    if (prom < minProm) continue;
    // spine: descends to a depth proportional to prominence, drifting right
    const depth = Math.min(H - p.y, prom * 2.6 + 30);
    const steps = Math.max(2, Math.round(depth / 45));
    const spine = [];
    let sx = p.x, sy = p.y;
    for (let s = 1; s <= steps; s++) {
      sy = p.y + (depth * s) / steps;
      sx += (depth / steps) * (lean + (r() - 0.5) * 0.7);
      spine.push({ x: Math.round(sx), y: Math.round(sy) });
    }
    const left = pts.slice(j, i + 1);
    const foot = spine[spine.length - 1];
    // bottom edge returns toward the valley, rising a little so faces do not all end on one line
    const back = { x: Math.round(left[0].x + (foot.x - left[0].x) * 0.25), y: Math.round(Math.min(H, Math.max(left[0].y + 8, foot.y - depth * 0.12))) };
    polys.push('M' + left.map(q => q.x + ' ' + q.y).join('L') + 'L' + spine.map(q => q.x + ' ' + q.y).join('L') + 'L' + back.x + ' ' + back.y + 'Z');
  }
  return polys.join('');
}

const FAR = [[0, 262], [70, 250], [150, 205], [205, 178], [250, 118], [285, 150], [330, 172], [372, 160], [430, 128], [500, 82], [560, 38], [598, 84], [640, 112], [690, 150], [740, 196], [800, 214], [850, 168], [890, 196], [950, 240], [1010, 232], [1070, 190], [1130, 128], [1180, 84], [1215, 126], [1262, 150], [1300, 188], [1360, 226], [1440, 262]];
const MID = [[0, 286], [80, 270], [150, 232], [196, 168], [236, 206], [300, 228], [372, 250], [470, 264], [560, 246], [640, 214], [700, 222], [770, 180], [822, 132], [866, 176], [930, 204], [1000, 246], [1090, 272], [1180, 258], [1250, 226], [1300, 236], [1362, 264], [1440, 286]];

const far = fractal(FAR, 3, 0.13, Number(process.env.SEED_FAR || 7));
const mid = fractal(MID, 3, 0.1, Number(process.env.SEED_MID || 23));

// Near: rolling ground with a conifer line. Trees are narrow triangles of
// varied height in loose clusters; the ground closes the shape.
function treeline(seed) {
  const r = rng(seed);
  const ground = x => 318 + Math.sin((x / W) * Math.PI * 2) * 9 + Math.sin((x / W) * Math.PI * 6 + 1) * 5;
  let path = `M0 ${H}V${Math.round(ground(0))}`;
  for (let x = 120; x <= W; x += 120) path += `L${x} ${Math.round(ground(x))}`;
  path += `V${H}Z`;
  let x = 3;
  while (x < W - 3) {
    // stands: tall in the middle of a cluster, thinning to saplings and gaps at its edges
    const stand = Math.max(0, Math.sin((x / W) * Math.PI * 6 + 0.9) * 0.6 + Math.sin((x / W) * Math.PI * 14 + 2.1) * 0.4);
    const h = 22 + r() * 30 + stand * (40 + r() * 46);
    const w = 7 + h * 0.13 + r() * 4;
    const gx = Math.round(ground(x)) + 8;
    const tip = Math.round(gx - h);
    const cx = Math.round(x + (r() - 0.5) * 2);
    const l = Math.round(x - w / 2), rt = Math.round(x + w / 2);
    if (r() < 0.55) {
      // layered crown: one shoulder, placed irregularly
      const ny = Math.round(tip + h * (0.3 + r() * 0.25)), nw = w * (0.24 + r() * 0.12);
      path += `M${l} ${gx}L${Math.round(cx - nw * 0.5)} ${ny}L${Math.round(cx - nw)} ${ny}L${cx} ${tip}L${Math.round(cx + nw)} ${ny}L${Math.round(cx + nw * 0.5)} ${ny}L${rt} ${gx}Z`;
    } else {
      path += `M${l} ${gx}L${cx} ${tip}L${rt} ${gx}Z`;
    }
    x += 5 + r() * 10 + (stand < 0.08 && r() < 0.5 ? 14 + r() * 30 : 0);
  }
  return path;
}

const rel = dstr => dstr.replace(/M(-?d+) (-?d+)((?:L-?d+ -?d+)+)/g, (m, x0, y0, rest) => {
  let x = +x0, y = +y0, out = 'M' + x0 + ' ' + y0;
  for (const s of rest.slice(1).split('L')) {
    const [nx, ny] = s.split(' ').map(Number);
    const dx = nx - x, dy = ny - y;
    out += 'l' + dx + (dy < 0 ? '' : ' ') + dy;
    x = nx; y = ny;
  }
  return out;
});
const svg = body => `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}' preserveAspectRatio='none'><path d='${rel(body)}'/></svg>`;
const out = {
  far: svg(closed(far)),
  farLit: svg(facets(far, 26, 5, 0.42)),
  mid: svg(closed(mid)),
  midLit: svg(facets(mid, 18, 9, 0.5)),
  near: svg(treeline(Number(process.env.SEED_NEAR || 41))),
};
for (const [k, v] of Object.entries(out)) console.log(k, v.length);
if (far[0].y !== far[far.length - 1].y || mid[0].y !== mid[mid.length - 1].y) throw new Error('tile seam');

if (process.argv.includes('--write')) {
  require('./patch-file.cjs')('src/09-scenery.css', e => {
    const url = s => `url("data:image/svg+xml;utf8,${s}")`;
    const cur = [...e.text.matchAll(/mask-image: (url\("data:image\/svg\+xml;utf8,<svg[^"]*viewBox='0 0 1440 400'[^"]*"\));/g)].map(m => m[1]);
    if (cur.length === 3) {
      // first run: split the shared before/after rules so the lit faces get their own mask
      e.rep(`    .vitra-scenery-ridge-far::before,
    .vitra-scenery-ridge-far::after {
      mask-image: ${cur[0]};`, `    .vitra-scenery-ridge-far::before {
      mask-image: ${url(out.farLit)};
      mask-size: 50% 100%;
      mask-repeat: repeat-x;
    }

    .vitra-scenery-ridge-far::after {
      mask-image: ${url(out.far)};`);
      e.rep(`    .vitra-scenery-ridge-mid::before,
    .vitra-scenery-ridge-mid::after {
      mask-image: ${cur[1]};`, `    .vitra-scenery-ridge-mid::before {
      mask-image: ${url(out.midLit)};
      mask-size: 50% 100%;
      mask-repeat: repeat-x;
    }

    .vitra-scenery-ridge-mid::after {
      mask-image: ${url(out.mid)};`);
      e.rep(`mask-image: ${cur[2]};`, `mask-image: ${url(out.near)};`);
    } else if (cur.length === 5) {
      [out.farLit, out.far, out.midLit, out.mid, out.near].forEach((s, i) => e.rep(cur[i], url(s)));
    } else throw new Error('unexpected mask count ' + cur.length);
  });
  console.log('written');
}
