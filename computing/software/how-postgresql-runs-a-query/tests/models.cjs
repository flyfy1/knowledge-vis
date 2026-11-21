'use strict';
// Pins all PostgreSQL 17.6 / 18.0 models, prose bindings ({=...}), copy keys, dynamic keys,
// language hygiene (unprefill, zero CJK in en, zero raw stray tags, zero HTML in textContent keys),
// SVG diagram structure, and REGISTRY.json uniqueness against atlas/data.js and siblings.
// Run: node computing/software/how-postgresql-runs-a-query/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const ROOT = path.resolve(DIR, '..', '..', '..');
const M = require(path.join(DIR, 'models.js'));
const B = require(path.join(DIR, 'bindings.cjs'))(M);
const { unprefill } = require(path.join(ROOT, 'scripts', 'lib', 'prefill.cjs'));

const load = l => {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(DIR, `copy.${l}.js`), 'utf8'), ctx);
  return ctx.window.ESSAY_COPY[l];
};
const Z = load('zh'), E = load('en');
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'page.json'), 'utf8'));

let n = 0, fails = 0;
function check(name, got, want) {
  n++;
  if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); }
}
function ok(name, cond, info) {
  n++;
  if (!cond) { fails++; console.error(`FAIL ${name}${info ? ': ' + info : ''}`); }
}
function near(name, got, want, tol) {
  n++;
  if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want} ± ${tol}`); }
}

/* ── 1. Core constants & binary page/tuple math ── */
{
  check('BLCKSZ = 8192', M.PG.BLCKSZ, 8192);
  check('PageHeaderData = 24 B', M.PG.PAGE_HEADER_SIZE, 24);
  check('ItemIdData = 4 B', M.PG.ITEM_ID_SIZE, 4);
  check('HeapTupleHeader fixed 23 B, aligned 24 B', [M.PG.HEAP_TUPLE_FIXED, M.PG.HEAP_TUPLE_ALIGNED].join(), '23,24');
  const hdr = M.packPageHeader({ lower: 44, upper: 7752, special: 8192, pruneXid: 103 });
  check('header bytes length = 24', hdr.length, 24);
  const up = M.unpackPageHeader(hdr);
  check('header unpack lower/upper/special/ver', [up.lower, up.upper, up.special, up.pagesize, up.layoutVersion].join(), '44,7752,8192,8192,4');
  const iid = M.packItemId(8104, 1, 88);
  const uid = M.unpackItemId(iid);
  check('ItemIdData roundtrip', [uid.lp_off, uid.lp_flags, uid.lp_len].join(), '8104,1,88');
}

/* ── 2. Ch2 planner costs ── */
{
  const c001 = M.plannerCosts({ selectivity: 0.001, randomPageCost: 4.0 });
  const c05 = M.plannerCosts({ selectivity: 0.05, randomPageCost: 4.0 });
  const c20 = M.plannerCosts({ selectivity: 0.20, randomPageCost: 4.0 });
  const cIos = M.plannerCosts({ selectivity: 0.05, randomPageCost: 4.0, allVisible: true });
  check('ch2 winners: 0.1% index, 5% bitmap, 20% seq, 5%+VM indexonly', [c001.winner, c05.winner, c20.winner, cIos.winner].join(), 'index,bitmap,seq,indexonly');
  near('ch2 seqCost = 15000', c001.seqCost, 15000, 1e-9);
  near('ch2 crossover rpc=4.0 at 10.0%', c05.crossSeqVsBitmap, 0.100, 1e-6);
  const cSsd = M.plannerCosts({ selectivity: 0.05, randomPageCost: 1.1 });
  near('ch2 crossover rpc=1.1 at 11.8%', cSsd.crossSeqVsBitmap, 0.118, 1e-6);
  const corr = M.correlationMismatch(false);
  check('ch2 correlation mismatch 4000 vs 38000 (9.5x)', [corr.estRows, corr.actualRows, corr.ratio.toFixed(1)].join(), '4000,38000,9.5');
}

/* ── 3. Ch3 slotted page & HOT ── */
{
  const pgHot = M.simulatePageSequence();
  check('ch3 default HOT mode', [pgHot.mode, pgHot.lower, pgHot.upper, pgHot.freeBytes, pgHot.hotUpdates, pgHot.indexWrites].join(), 'hot,44,7752,7708,2,3');
  const pgIdx = M.simulatePageSequence({ indexedChanged: true });
  check('ch3 indexed col breaks HOT', [pgIdx.mode, pgIdx.hotUpdates, pgIdx.indexWrites].join(), 'indexed_col,0,5');
  const pgFull = M.simulatePageSequence({ fillfactor: 50, payloadBytes: 512, ops: ['INSERT', 'INSERT', 'INSERT', 'INSERT', 'INSERT', 'INSERT', 'INSERT', 'INSERT', 'UPDATE'] });
  ok('ch3 overflow reports page_full', pgFull.mode === 'page_full' || pgFull.offPageCount > 0);
}

/* ── 4. Ch4 MVCC visibility & isolation ── */
{
  const rc1 = M.mvccScenario({ isolation: 'rc', step: 1 });
  const rc2 = M.mvccScenario({ isolation: 'rc', step: 2 });
  const rr2 = M.mvccScenario({ isolation: 'rr', step: 2 });
  const rr3 = M.mvccScenario({ isolation: 'rr', step: 3 });
  check('ch4 rc step 1 -> v1 (500), step 2 -> v2 (400)', [rc1.visibleId, rc1.visibleVal, rc2.visibleId, rc2.visibleVal].join(), 'v1,500,v2,400');
  check('ch4 rr stays v1 (500) at step 2 & 3', [rr2.visibleId, rr2.visibleVal, rr3.visibleId, rr3.visibleVal].join(), 'v1,500,v1,500');
}

/* ── 5. Ch5 VACUUM, FREEZE & 32-bit wraparound ── */
{
  check('ch5 wraparound precedes across 2^32 boundary', M.xidPrecedes(0xfffffff0, 20), true);
  check('ch5 wraparound reversed across half circle', M.xidPrecedes(20, 0xfffffff0), false);
  const s0 = M.vacuumWraparoundSim({ ageMillion: 0, vacuumMode: 'off' });
  const s250 = M.vacuumWraparoundSim({ ageMillion: 250, vacuumMode: 'off' });
  const s2145 = M.vacuumWraparoundSim({ ageMillion: 2145, vacuumMode: 'off' });
  const s2200 = M.vacuumWraparoundSim({ ageMillion: 2200, vacuumMode: 'off' });
  const s2200n = M.vacuumWraparoundSim({ ageMillion: 2200, vacuumMode: 'normal' });
  check('ch5 off progression: healthy -> antiwrap -> stoplimit -> wrapped', [s0.status, s250.status, s2145.status, s2200.status].join(), 'healthy,antiwrap,stoplimit,wrapped');
  check('ch5 normal autovacuum stays healthy at 2200M', s2200n.status, 'healthy');
}

/* ── 6. Ch6 Shared Buffers clock sweep ── */
{
  const oltp = M.clockSweepSim({ workload: 'oltp', step: 40 });
  const unp36 = M.clockSweepSim({ workload: 'seq_unprotected', step: 36 });
  const rng36 = M.clockSweepSim({ workload: 'seq_ring', step: 36 });
  check('ch6 oltp 90% hit rate', Math.round(oltp.hitRate * 100), 90);
  check('ch6 unprotected scan wipes hot pages -> 0/4 vs ring -> 4/4', [unp36.postHits, unp36.postTotal, rng36.postHits, rng36.postTotal].join(), '0,4,4,4');
}

/* ── 7. Ch7 nbtree splits & right-links ── */
{
  const seq = M.nbtreeSim({ orderMode: 'seq', insertCount: 24, maxKeys: 4 });
  const rnd = M.nbtreeSim({ orderMode: 'rand', insertCount: 24, maxKeys: 4 });
  check('ch7 seq 6 leaves 100% fill; rand 8 leaves 75% fill', [seq.leafCount, Math.round(seq.avgFillPct), rnd.leafCount, Math.round(rnd.avgFillPct)].join(), '6,100,8,75');
  const hop = M.nbtreeSim({ orderMode: 'seq', insertCount: 24, maxKeys: 4, searchKey: 240, concurrentSplit: true });
  check('ch7 concurrent split triggers right-link hop', hop.rightHops > 0 && hop.found, true);
}

/* ── 8. Ch8 Join algorithms & work_mem spill ── */
{
  const j4 = M.joinCostSim({ outerRows: 80000, innerRows: 400000, workMemMB: 4 });
  const j16 = M.joinCostSim({ outerRows: 80000, innerRows: 400000, workMemMB: 16 });
  const jTiny = M.joinCostSim({ outerRows: 1000, innerRows: 400000, workMemMB: 4, hasInnerIdx: true });
  check('ch8 4 MiB spills into 2 batches; 16 MiB runs in 1 batch', [j4.nbatch, j4.spilled, j16.nbatch, j16.spilled].join(), '2,true,1,false');
  check('ch8 tiny outer + inner index picks Nested Loop', jTiny.winner, 'nest');
}

/* ── 9. Ch9 WAL CRC-32C & Full-Page Writes ── */
{
  check('ch9 CRC-32C Castagnoli standard vector', M.crc32cHex('123456789'), '0xE3069283');
  const wr = M.walRecoverySim({ checkpointMin: 5, workload: 'rand', fpw: true });
  const ws = M.walRecoverySim({ checkpointMin: 5, workload: 'seq', fpw: true });
  const wOff = M.walRecoverySim({ checkpointMin: 5, workload: 'rand', fpw: false });
  check('ch9 FPW share rand 85.0% vs seq 7.8%', [wr.fpwSharePct.toFixed(1), ws.fpwSharePct.toFixed(1)].join(), '85.0,7.8');
  check('ch9 tornPageSafe flag matches fpw', [wr.tornPageSafe, wOff.tornPageSafe].join(), 'true,false');
  ok('ch9 torn CRC differs from expected CRC', wr.expectedCrc !== wr.tornCrc);
}

/* ── 10. Bindings pinned ── */
{
  const want = {
    'ch2.seqCost': '15,000',
    'ch2.idxLowCost': '1,592',
    'ch2.bmpMidCost': '13,044',
    'ch2.crossPct': '10.0%',
    'ch2.crossSsdPct': '11.8%',
    'ch2.corrEst': '4,000',
    'ch2.corrAct': '38,000',
    'ch2.corrRatio': '9.5',
    'ch3.blcksz': '8,192',
    'ch3.pageHdr': '24',
    'ch3.itemSz': '4',
    'ch3.tupFixed': '23',
    'ch3.tupAlign': '24',
    'ch3.defFree': '7,708',
    'ch3.defIdxWrites': '3',
    'ch3.idxChangedWrites': '5',
    'ch4.rcVal': '400',
    'ch4.rrVal': '500',
    'ch5.freezeAgeM': '200',
    'ch5.halfLimitM': '2,147.5',
    'ch5.stopAgeM': '2,144.5',
    'ch6.ringFrames': '32',
    'ch6.ringKiB': '256',
    'ch6.unprotPost': '0/4',
    'ch6.ringPost': '4/4',
    'ch7.btOpaque': '16',
    'ch7.seqLeaves': '6',
    'ch7.seqFill': '100%',
    'ch7.randLeaves': '8',
    'ch7.randFill': '75%',
    'ch8.hashSizeMiB': '7.3',
    'ch8.hash4Batch': '2',
    'ch8.hash4Spill': '16.5',
    'ch8.hash16Batch': '1',
    'ch9.crcTest': '0xE3069283',
    'ch9.randFpwPct': '85.0%',
    'ch9.seqFpwPct': '7.8%',
    'ch9.walSegMiB': '16'
  };
  check('binding names match exactly', Object.keys(B).sort().join(), Object.keys(want).sort().join());
  for (const k in want) check('binding ' + k, B[k], want[k]);
}

/* ── 11. Copy parity, guardrails & language hygiene ── */
{
  const keys = [...app.matchAll(/\bt\('([\w.]+)'/g)].map(m => m[1]).filter(k => !k.endsWith('.'));
  const missing = [...new Set(keys)].filter(k => Z[k] == null);
  check('every literal key app.js reads exists', missing.join(), '');

  const dyn = Object.entries(PJ.dynamicKeys).flatMap(([p, vs]) => vs.map(v => p + '.' + v));
  check('dynamic keys exist in Z', dyn.filter(k => Z[k] == null).join(), '');
  check('dynamic keys exist in E', dyn.filter(k => E[k] == null).join(), '');

  const prefixes = [...new Set([...app.matchAll(/\bt\('([\w.]+\.)'\s*\+/g)].map(m => m[1].slice(0, -1)))];
  check('all dynamic t(prefix + ...) declared in page.json', prefixes.filter(p => !PJ.dynamicKeys[p]).join(), '');

  check('zh and en have the exact same keys', Object.keys(Z).sort().join(), Object.keys(E).sort().join());
  const ph = s => (String(s).match(/\{[a-zA-Z_]\w*\}/g) || []).sort().join();
  check('runtime placeholders match in zh and en', Object.keys(Z).filter(k => ph(Z[k]) !== ph(E[k])).join(), '');
  check('English is complete, not a stub', [String((PJ.languages || {}).en), /data-lang-en="stub"/.test(html)].join(), 'undefined,false');
  check('no CJK in copy.en.js', Object.keys(E).filter(k => /[㐀-鿿]/.test(E[k])).join(), '');

  // Guardrail 1: no stray unescaped <tag> in copy values outside allowed formatting tags
  const allowedTag = /^<\/?(strong|em|code|br|a|span|p)\b/i;
  const badTags = [];
  for (const [langName, tbl] of [['zh', Z], ['en', E]]) {
    for (const [k, v] of Object.entries(tbl)) {
      if (k === 'ch1.code') continue;
      for (const m of String(v).matchAll(/<[^>]*>/g)) {
        if (!allowedTag.test(m[0])) badTags.push(`${langName}:${k}:${m[0]}`);
      }
    }
  }
  check('Guardrail #1: zero raw stray <...> tags in copy', badTags.join(' | '), '');

  // Guardrail 2: no HTML tags inside keys bound via data-i18n (textContent)
  const textKeys = [...html.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
  const badTextHtml = [];
  for (const k of new Set(textKeys)) {
    if (k.startsWith('site.')) continue;
    for (const [ln, tbl] of [['zh', Z], ['en', E]]) {
      if (tbl[k] && /<\/?(code|em|strong|br|a|span)\b/i.test(tbl[k])) {
        badTextHtml.push(`${ln}:${k}`);
      }
    }
  }
  check('Guardrail #2: zero HTML tags inside data-i18n textContent keys', badTextHtml.join(' | '), '');

  // Unprefill check for zero CJK in index.html outside pre-filled copy
  let h = unprefill(html, Z)
    .replace(/<div[^>]*id="langToggle"[\s\S]*?<\/div>/, '')
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta[^>]*>/g, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  const cjk = h.match(/[^\n]{0,30}[㐀-鿿][^\n]{0,30}/g) || [];
  check('zero CJK in index.html outside pre-filled copy', cjk.slice(0, 3).join(' | '), '');

  // Draft page.json checks (no status, no title/desc)
  check('page.json omits status, title, desc', [PJ.status, PJ.title, PJ.desc].map(String).join(), 'undefined,undefined,undefined');

  // Partials & SVG diagrams
  const figs = fs.readdirSync(path.join(DIR, 'figures'));
  for (const f of figs) {
    const s = fs.readFileSync(path.join(DIR, 'figures', f), 'utf8');
    ok(`figures/${f} has zero CJK`, !/[㐀-鿿]/.test(s));
  }
  const dgFiles = figs.filter(f => f.startsWith('dg-'));
  check('9 static SVG diagrams present', dgFiles.length, 9);
  const dgSvg = dgFiles.map(f => fs.readFileSync(path.join(DIR, 'figures', f), 'utf8')).join('');
  const rawTexts = [...dgSvg.matchAll(/<text [^>]*>([^<]+)<\/text>/g)].map(m => m[1]);
  const neutral = s => /^(0\.\.24|0 \.\. 8192 B|256 KiB|\[10, 20\]|\[30, 40\]|[0-9]+)$/.test(s);
  ok('SVG literal text is strictly language-neutral', rawTexts.every(neutral), rawTexts.filter(s => !neutral(s)).join(' | '));
  const textTags = [...dgSvg.matchAll(/<text ([^>]*)>/g)];
  ok('every SVG <text> has x, y, font-size >= 14 and NO transform', textTags.every(m => /\bx="/.test(m[1]) && /\by="/.test(m[1]) && !/\btransform=/.test(m[1]) && +(m[1].match(/font-size="([\d.]+)"/) || [0, 0])[1] >= 14));
}

/* ── 12. REGISTRY.json parity & global alias uniqueness ── */
{
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry title.zh === hero', R.title.zh, Z['hero.title']);
  check('registry title.en === hero', R.title.en, E['hero.title']);
  check('registry desc.zh === doc.desc', R.desc.zh, Z['doc.desc']);
  check('registry desc.en === doc.desc', R.desc.en, E['doc.desc']);
  check('registry path/category/subtopic', [R.category, R.subtopic, R.path].join(), 'computing,software,computing/software/how-postgresql-runs-a-query/');
  for (const c of R.concepts) {
    ok(`concept ${c.id} starts with pg-`, c.id.startsWith('pg-'));
    ok(`concept ${c.id} anchor ${c.anchor} exists`, html.includes(`id="${c.anchor.slice(1)}"`));
  }
  const sq = s => String(s).normalize('NFKC').toLowerCase().replace(/[\s\-‐-―_·・'’]/gu, '');
  const own = R.concepts.flatMap(c => [...new Set([...c.aliases.zh, ...c.aliases.en].map(sq))]);
  check('zero duplicate aliases within REGISTRY.json', own.filter((a, i) => own.indexOf(a) !== i).join(), '');

  // Check against atlas/data.js + aliases.json + sibling REGISTRY.json files
  const actx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'atlas', 'data.js'), 'utf8'), actx);
  const existing = new Set();
  for (const nd of (actx.window.ATLAS.nodes || [])) {
    if (nd.title) { existing.add(sq(nd.title.zh || '')); existing.add(sq(nd.title.en || '')); }
    if (Array.isArray(nd.aliases)) nd.aliases.forEach(a => existing.add(sq(a)));
    else if (nd.aliases) {
      (nd.aliases.zh || []).forEach(a => existing.add(sq(a)));
      (nd.aliases.en || []).forEach(a => existing.add(sq(a)));
    }
  }
  for (const d of fs.readdirSync(path.join(ROOT, 'computing', 'software'))) {
    if (d === 'how-postgresql-runs-a-query') continue;
    const rp = path.join(ROOT, 'computing', 'software', d, 'REGISTRY.json');
    if (!fs.existsSync(rp)) continue;
    const SR = JSON.parse(fs.readFileSync(rp, 'utf8'));
    for (const c of SR.concepts) {
      [c.title.zh, c.title.en, ...(c.aliases.zh || []), ...(c.aliases.en || [])].forEach(a => existing.add(sq(a)));
    }
  }
  const collisions = own.filter(a => existing.has(a));
  check('zero alias collision with atlas or siblings', collisions.join(' | '), '');
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
