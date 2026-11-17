#!/usr/bin/env node
/*
 * measure-motion.cjs - idle cost of each animated kitchen-sink section,
 * in Chromium and Firefox, against an empty page.
 *
 * Usage (run `npm run build` first; the sink loads dist/):
 *   node scripts/measure-motion.cjs [--label antes|despues] [--runs 3]
 *        [--sections progress,ring] [--engines chromium,firefox]
 *        [--seconds 4] [--settle 3] [--base http://localhost:4173]
 *     -> scratch/motion-<label>.json (+ a table on stdout)
 *   node scripts/measure-motion.cjs --ab scratch/old --label ab --runs 3
 *     -> interleaved before/after in one session: scratch/old/vitra.min.css
 *        and .js (e.g. `git show <rev>:dist/vitra.min.css`) are served in
 *        place of dist/ for the "antes" side; preferred for Firefox, whose
 *        headless frame clock can change between sessions
 *   node scripts/measure-motion.cjs --shots --label antes
 *     -> scratch/shots-<label>/<engine>-<section>-<theme>.png, every
 *        infinite animation paused at the same currentTime, finite ones
 *        finished, so two builds can be compared frame for frame
 *   node scripts/measure-motion.cjs --compare antes,despues
 *     -> per-image pixel diff of scratch/shots-antes vs scratch/shots-despues
 *
 * Without --base a small static server for the repo root is started on a
 * free port and stopped at the end.
 *
 * Metrics, per section (`tests/kitchen-sink.html?only=<section>`; `empty`
 * hides every section and is the baseline):
 *   Chromium (CDP): paintsPerSec (trace `Paint`), styleRecalcsPerSec
 *     (trace `UpdateLayoutTree`), drawFramesPerSec (trace `DrawFrame`,
 *     compositor), mainThreadMsPerSec (Performance.getMetrics TaskDuration).
 *   Firefox: rafFps and framesOver25ms over the window, measured with
 *     requestAnimationFrame inside the page, plus p95/max frame interval and
 *     tickMsPerSec: main-thread time each refresh tick spends after its rAF
 *     callbacks (style, layout, display list, main-thread raster), timed
 *     with a message posted from the callback.
 * Headless engines render in software: compare before/after and against
 * `empty`, never read the absolute numbers as a real machine's.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium, firefox } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'scratch');
const SECTIONS = ['empty', 'progress', 'ring', 'noise', 'rotate', 'border-glow', 'spinner', 'scenery'];
const SHOT_THEMES = ['dark', 'light', 'pastel'];
const VIEWPORT = { width: 1600, height: 900 };
const SHOT_TIME = 1234; // ms: currentTime every infinite animation is parked at

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf('--' + name);
  if (i === -1) return def;
  const v = args[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
};
const label = opt('label', 'run');
const runs = Number(opt('runs', 1));
const seconds = Number(opt('seconds', 4));
const settle = Number(opt('settle', 3));
const sections = String(opt('sections', SECTIONS.join(','))).split(',');
const engines = String(opt('engines', 'chromium,firefox')).split(',');

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.map': 'application/json',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };

function startServer() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    let file = path.join(ROOT, p);
    if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html';
    fs.readFile(file, (err, body) => {
      if (err) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      res.end(body);
    });
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () =>
    resolve({ server, base: `http://127.0.0.1:${server.address().port}` })));
}

const sinkUrl = (base, section, theme = 'dark') =>
  `${base}/tests/kitchen-sink.html?theme=${theme}&only=${section}`;

async function open(page, url) {
  await page.goto(url);
  await page.waitForFunction(() => typeof window.Vitra !== 'undefined' && document.readyState === 'complete');
}

async function measureChromium(page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  const events = [];
  cdp.on('Tracing.dataCollected', (e) => events.push(...e.value));
  const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
  await cdp.send('Tracing.start', {
    categories: 'devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.frame',
    transferMode: 'ReportEvents',
  });
  const m0 = await metrics();
  const t0 = Date.now();
  await new Promise((r) => setTimeout(r, seconds * 1000));
  const m1 = await metrics();
  const elapsed = (Date.now() - t0) / 1000;
  const done = new Promise((r) => cdp.once('Tracing.tracingComplete', r));
  await cdp.send('Tracing.end');
  await done;
  await cdp.detach();
  const count = (name) => events.filter((e) => e.name === name && e.ph !== 'E').length;
  const per = (n) => +(n / elapsed).toFixed(1);
  return {
    paintsPerSec: per(count('Paint')),
    styleRecalcsPerSec: per(count('UpdateLayoutTree')),
    drawFramesPerSec: per(count('DrawFrame')),
    mainThreadMsPerSec: +(((m1.TaskDuration - m0.TaskDuration) * 1000) / elapsed).toFixed(1),
    scriptMsPerSec: +(((m1.ScriptDuration - m0.ScriptDuration) * 1000) / elapsed).toFixed(1),
    recalcStyleCountPerSec: per(m1.RecalcStyleCount - m0.RecalcStyleCount),
    layoutsPerSec: per(m1.LayoutCount - m0.LayoutCount),
  };
}

async function measureFirefox(page) {
  return page.evaluate((ms) => new Promise((resolve) => {
    const deltas = [];
    let last = 0;
    let start = 0;
    // Main-thread signal: a message posted from inside the rAF callback runs
    // after the rest of that refresh tick (style, layout, paint/display list,
    // and any main-thread raster), so its delay is the tick's own work.
    let tickWork = 0;
    let posted = 0;
    const ch = new MessageChannel();
    ch.port1.onmessage = () => { tickWork += performance.now() - posted; };
    const tick = (t) => {
      if (!start) { start = last = t; requestAnimationFrame(tick); return; }
      deltas.push(t - last);
      last = t;
      if (t - start < ms) {
        requestAnimationFrame(tick);
        posted = performance.now();
        ch.port2.postMessage(0);
        return;
      }
      const sorted = [...deltas].sort((a, b) => a - b);
      resolve({
        rafFps: +((deltas.length * 1000) / (t - start)).toFixed(1),
        framesOver25ms: deltas.filter((d) => d > 25).length,
        p95FrameMs: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1),
        maxFrameMs: +sorted[sorted.length - 1].toFixed(1),
        tickMsPerSec: +((tickWork * 1000) / (t - start)).toFixed(1),
      });
    };
    requestAnimationFrame(tick);
  }), seconds * 1000);
}

const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : +((s[m - 1] + s[m]) / 2).toFixed(1); };

// --ab <dir>: interleaved before/after. <dir> holds an older vitra.min.css and
// vitra.min.js, served in place of dist/ for the "antes" side; each run
// measures antes then despues back to back, so both sides share the
// machine's state (Firefox's frame clock can change mid-session).
async function runMetrics(base) {
  const abDir = opt('ab', null);
  const sides = abDir ? ['antes', 'despues'] : [label];
  const result = { label, date: new Date().toISOString(), seconds, runs, viewport: VIEWPORT, interleaved: !!abDir };
  for (const side of sides) result[side] = { chromium: {}, firefox: {} };
  for (const engine of engines) {
    const browser = await (engine === 'chromium' ? chromium : firefox).launch();
    for (const section of sections) {
      const samples = Object.fromEntries(sides.map((s) => [s, []]));
      for (let i = 0; i < runs; i++) {
        for (const side of sides) {
          const context = await browser.newContext({ viewport: VIEWPORT });
          if (abDir && side === 'antes') {
            for (const f of ['vitra.min.css', 'vitra.min.js']) {
              await context.route('**/dist/' + f, (r) => r.fulfill({ path: path.resolve(ROOT, abDir, f) }));
            }
          }
          const page = await context.newPage();
          await open(page, sinkUrl(base, section));
          await page.waitForTimeout(settle * 1000);
          const m = engine === 'chromium' ? await measureChromium(page) : await measureFirefox(page);
          if (m.rafFps) m.tickMsPerFrame = +(m.tickMsPerSec / m.rafFps).toFixed(3);
          samples[side].push(m);
          await context.close();
        }
      }
      for (const side of sides) {
        const keys = Object.keys(samples[side][0]);
        const row = Object.fromEntries(keys.map((k) => [k, median(samples[side].map((s) => s[k]))]));
        result[side][engine][section] = runs > 1 ? { ...row, samples: samples[side] } : row;
        console.log(side.padEnd(8), engine.padEnd(9), section.padEnd(12), JSON.stringify(row));
      }
    }
    await browser.close();
  }
  fs.mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, `motion-${label}.json`);
  fs.writeFileSync(file, JSON.stringify(abDir ? result : { ...result, ...result[label] }, null, 2));
  console.log('->', path.relative(ROOT, file));
}

async function runShots(base) {
  const dir = path.join(OUT, `shots-${label}`);
  fs.mkdirSync(dir, { recursive: true });
  for (const engine of engines) {
    const browser = await (engine === 'chromium' ? chromium : firefox).launch();
    for (const section of sections.filter((s) => s !== 'empty')) {
      for (const theme of SHOT_THEMES) {
        const context = await browser.newContext({ viewport: VIEWPORT });
        const page = await context.newPage();
        await open(page, sinkUrl(base, section, theme));
        await page.waitForTimeout(500);
        await page.evaluate((t) => {
          for (const a of document.getAnimations()) {
            if (a.timeline !== document.timeline) continue;
            if (a.effect.getComputedTiming().iterations === Infinity) { a.pause(); a.currentTime = t; } else a.finish();
          }
        }, SHOT_TIME);
        await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
        await page.screenshot({ path: path.join(dir, `${engine}-${section}-${theme}.png`), caret: 'hide' });
        await context.close();
      }
    }
    await browser.close();
  }
  console.log('->', path.relative(ROOT, dir));
}

async function runCompare(pair) {
  const [a, b] = pair.split(',');
  const da = path.join(OUT, `shots-${a}`);
  const db = path.join(OUT, `shots-${b}`);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const out = {};
  for (const name of fs.readdirSync(da).filter((f) => f.endsWith('.png'))) {
    if (!fs.existsSync(path.join(db, name))) { out[name] = 'missing in ' + b; continue; }
    const [x, y] = [da, db].map((d) => fs.readFileSync(path.join(d, name)).toString('base64'));
    out[name] = await page.evaluate(async ([x, y]) => {
      const load = async (s) => {
        const bmp = await createImageBitmap(await (await fetch('data:image/png;base64,' + s)).blob());
        const c = new OffscreenCanvas(bmp.width, bmp.height);
        const g = c.getContext('2d');
        g.drawImage(bmp, 0, 0);
        return g.getImageData(0, 0, bmp.width, bmp.height);
      };
      const [p, q] = [await load(x), await load(y)];
      if (p.width !== q.width || p.height !== q.height) return { sizeMismatch: true };
      let differing = 0; let over8 = 0; let max = 0;
      for (let i = 0; i < p.data.length; i += 4) {
        let d = 0;
        for (let k = 0; k < 3; k++) d = Math.max(d, Math.abs(p.data[i + k] - q.data[i + k]));
        if (d) differing++;
        if (d > 8) over8++;
        if (d > max) max = d;
      }
      return { identical: differing === 0, differingPx: differing, over8Px: over8, maxChannelDiff: max };
    }, [x, y]);
    console.log(name.padEnd(40), JSON.stringify(out[name]));
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, `compare-${a}-${b}.json`), JSON.stringify(out, null, 2));
}

(async () => {
  const compare = opt('compare', null);
  if (compare) { await runCompare(compare); return; }
  let srv = null;
  let base = opt('base', null);
  if (!base) { srv = await startServer(); base = srv.base; }
  try {
    if (opt('shots', false)) await runShots(base);
    else await runMetrics(base);
  } finally {
    if (srv) srv.server.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
