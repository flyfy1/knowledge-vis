'use strict';
// Unit tests for models, prose bindings, copy parity, language hygiene, partials, and REGISTRY.json.
// Run: node computing/software/how-nginx-handles-ten-thousand-connections/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const B = require(path.join(DIR, 'bindings.cjs'))(M);
const { unprefill } = require(path.join(DIR, '..', '..', '..', 'scripts', 'lib', 'prefill.cjs'));
const load = l => {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(DIR, `copy.${l}.js`), 'utf8'), ctx);
  return ctx.window.ESSAY_COPY[l];
};
const Z = load('zh'), E = load('en');
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`); } }
function ok(name, cond, info) { n++; if (!cond) { fails++; console.error(`FAIL ${name}${info ? ': ' + info : ''}`); } }
function near(name, got, want, tol) { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want} ± ${tol}`); } }

/* ── 1. C10K & Master-Worker reload ── */
{
  const c = M.c10kModel({ conns: 10000, workers: 4, activePct: 5, stackMiB: 8 });
  check('ch1 10k slots = 440B/conn -> 6.15 MiB w/ active pools', [M.CONST.CONN_TOTAL_BYTES, c.nginxRssMiB.toFixed(2)].join(), '440,6.15');
  check('ch1 10k thread virtual = 78.13 GiB, ctx 87.5%', [(c.threadVirtualMiB / 1024).toFixed(2), c.ctxCpuPct.toFixed(1)].join(), '78.13,87.5');

  const r = M.reloadSim({ timeMs: 1200, tailMs: 1200, workers: 4, mode: 'graceful' });
  check('ch2 graceful reload @ 1200ms: 2 old draining, 4 new live, 0 dropped', [r.oldWorkersAlive, r.newWorkersActive, r.dropped].join(), '2,4,0');
  const rh = M.reloadSim({ timeMs: 1200, tailMs: 1200, workers: 4, mode: 'hard' });
  check('ch2 hard restart @ 1200ms: 26 dropped', rh.dropped, 26);
}

/* ── 2. epoll & location precedence ── */
{
  const e = M.epollSim({ conns: 10000, active: 40, dispatch: 'reuseport' });
  check('ch3 10k/40 select vs epoll & ratio', [e.selectUs.toFixed(1), e.epollUs.toFixed(1), e.speedupRatio].join(), '160.8,10.8,250');

  check('ch4 exact = /', M.locationMatch({ uri: '/' }).matchKind, 'exact');
  check('ch4 ^~ /static/ halts regex', M.locationMatch({ uri: '/static/logo.png', hatStatic: true }).matchKind, 'prefix_halt');
  check('ch4 plain /static/ loses to regex', M.locationMatch({ uri: '/static/logo.png', hatStatic: false }).winner.id, 'regex_cs');
  check('ch4 longer plain /static/images/ loses ^~ shield', M.locationMatch({ uri: '/static/images/pic.jpg', hatStatic: true }).matchKind, 'regex');
  check('ch4 fallback /api/v1/users -> /', M.locationMatch({ uri: '/api/v1/users' }).winner.id, 'prefix_root');
}

/* ── 3. ngx_pool_t, SWRR, limit_req, RB-tree, sendfile ── */
{
  const p = M.poolAllocSim({ itemBytes: 512, count: 12, poolSize: 4096 });
  check('ch5 12x512 in 4KiB pool -> 2 blocks, 2 frees', [p.maxAlloc, p.blocksCount, p.freeCallsOnDestroy].join(), '4016,2,2');

  const s = M.swrrSim({ weights: [5, 1, 1], algo: 'swrr', failA: false });
  check('ch6 {5,1,1} sequence & max streak', [s.swrrSeq.join(', '), s.swrrMaxStreakA, s.naiveMaxStreakA].join('|'), 'A, A, B, A, C, A, A|2|5');

  const lq = M.limitReqSim({ rate: 5, burst: 4, spike: 8, nodelay: false });
  const ln = M.limitReqSim({ rate: 5, burst: 4, spike: 8, nodelay: true });
  check('ch7 queued 1/4/3 max 720ms; nodelay 5/0/3', [
    lq.immediateCount, lq.delayedCount, lq.rejectedCount, lq.maxDelayMs,
    ln.immediateCount, ln.delayedCount, ln.rejectedCount
  ].join(), '1,4,3,720,5,0,3');

  const t8 = M.rbtreeTimerSim({ count: 15, nowMs: 400, lazy: true });
  check('ch8 rbtree default 3 expired, 12 active, wait 53ms, depth <= 26 @10k', [
    t8.expiredCount, t8.activeCount, t8.epollTimeoutMs, t8.c10kMaxDepth, t8.lazySkippedPct
  ].join(), '3,12,53,26,85');
  ok('ch8 rbtree invariants valid', t8.tree.rootIsBlack && t8.tree.noRedRed && t8.tree.equalBlackHeight);

  const zS = M.zeroCopyProxySim({ scenario: 'static', optOn: true, sizeMiB: 16, clientMbps: 2 });
  const zR = M.zeroCopyProxySim({ scenario: 'static', optOn: false, sizeMiB: 16, clientMbps: 2 });
  check('ch9 sendfile vs read+write & proxy speedup', [zR.rwSyscalls, zR.rwCpuCopiedMiB, zS.sfSyscalls, zS.sfCpuCopiedMiB, zS.speedup].join(), '1024,32,8,0,500');
}

/* ── 4. bindings: every prose number ── */
{
  const want = {
    'ch1.connB': '232', 'ch1.evtB': '104', 'ch1.slotB': '440', 'ch1.stackMiB': '8',
    'ch1.virtGiB': '78.13', 'ch1.threadRss': '1,281', 'ch1.nginxMiB': '6.15', 'ch1.ramRatio': '208', 'ch1.ctxPct': '87.5',
    'ch2.oldAlive': '2', 'ch2.newAlive': '4', 'ch2.hardDrop': '26',
    'ch3.selectUs': '160.8', 'ch3.epollUs': '10.8', 'ch3.scanRatio': '250',
    'ch4.phases': '11',
    'ch5.hdrB': '80', 'ch5.maxSmall': '4,016', 'ch5.defPool': '16', 'ch5.blocks': '2', 'ch5.frees': '2',
    'ch6.seq': 'A, A, B, A, C, A, A', 'ch6.swrrMax': '2', 'ch6.naiveMax': '5',
    'ch7.scale': '1,000', 'ch7.qDelay': '4', 'ch7.qDrop': '3', 'ch7.qMaxMs': '720', 'ch7.nImm': '5',
    'ch8.lazyMs': '300', 'ch8.lazySkip': '85', 'ch8.c10kDepth': '26', 'ch8.timeout': '53',
    'ch9.rwSys': '1,024', 'ch9.rwCtx': '2,048', 'ch9.rwCopy': '32', 'ch9.sfSys': '8',
    'ch9.upMs': '134.2', 'ch9.cliSec': '67.1', 'ch9.speedup': '500'
  };
  check('binding names', Object.keys(B).sort().join(), Object.keys(want).sort().join());
  for (const k in want) check('binding ' + k, B[k], want[k]);
}

/* ── 5. copy, parity, language hygiene, partials ── */
{
  const keys = [...app.matchAll(/\bt\('([\w.]+)'/g)].map(m => m[1]).filter(k => !k.endsWith('.'));
  const missing = [...new Set(keys)].filter(k => Z[k] == null);
  check('every literal key app.js reads exists', missing.join(), '');
  const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'page.json'), 'utf8'));
  const dyn = Object.entries(PJ.dynamicKeys).flatMap(([p, vs]) => vs.map(v => p + '.' + v));
  check('dynamic keys exist', dyn.filter(k => Z[k] == null).join(), '');
  check('zh and en have identical key sets', Object.keys(Z).sort().join(), Object.keys(E).sort().join());
  const ph = s => (String(s).match(/\{[a-zA-Z_]\w*\}/g) || []).sort().join();
  check('runtime placeholders match in zh and en', Object.keys(Z).filter(k => ph(Z[k]) !== ph(E[k])).join(), '');
  check('English is native (no stub flag)', [String((PJ.languages || {}).en), /data-lang-en="stub"/.test(html)].join(), 'undefined,false');
  check('zero CJK in English copy', Object.keys(E).filter(k => /[\u3400-\u9fff]/.test(E[k])).join(), '');
  check('live page.json has status=live and omits title/desc', [PJ.status, PJ.title, PJ.desc].map(String).join(), 'live,undefined,undefined');

  let h = unprefill(html, Z)
    .replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '')
    .replace(/<div[^>]*id="langToggle"[\s\S]*?<\/div>/, '')
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta[^>]*>/g, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  const cjk = h.match(/[^\n]{0,30}[\u3400-\u9fff][^\n]{0,30}/g) || [];
  check('no CJK in index.html outside pre-filled copy', cjk.slice(0, 3).join(' | '), '');

  const figs = fs.readdirSync(path.join(DIR, 'figures'));
  for (const f of figs) {
    const s = fs.readFileSync(path.join(DIR, 'figures', f), 'utf8');
    ok(`figures/${f} has zero CJK`, !/[\u3400-\u9fff]/.test(s));
  }
  const dgFiles = figs.filter(f => f.startsWith('dg-'));
  check('9 diagrams present', dgFiles.length, 9);
  const dgRaw = dgFiles.map(f => fs.readFileSync(path.join(DIR, 'figures', f), 'utf8')).join('');
  const rawTexts = [...dgRaw.matchAll(/<text [^>]*>([^<]+)<\/text>/g)].map(m => m[1]);
  const neutral = s => /^(vs|W\d+|QUIT|FD=6|80B|32B|d\.next|pool->large|[ABC]|503|\d+|Disk|Page|User|NIC)$/.test(s);
  ok('literal diagram text only neutral symbols/codes', rawTexts.every(neutral), rawTexts.filter(s => !neutral(s)).join(' | '));
  ok('every diagram text has explicit x, y, font-size >= 14, no transform',
    [...dgRaw.matchAll(/<text ([^>]*)>/g)].every(m => /\bx="/.test(m[1]) && /\by="/.test(m[1]) && +(m[1].match(/font-size="([\d.]+)"/) || [0, 0])[1] >= 14 && !/transform=/.test(m[1])));
  ok('pinned release Nginx 1.28.0 mentioned in copy', /1\.28\.0/.test(Object.values(Z).join(' ')) && /1\.28\.0/.test(Object.values(E).join(' ')));
}

/* ── 6. registry & zero alias collision check ── */
{
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry zh title = zh hero', R.title.zh, Z['hero.title']);
  check('registry en title = en hero', R.title.en, E['hero.title']);
  check('registry zh desc = doc.desc', R.desc.zh, Z['doc.desc']);
  check('registry en desc = en doc.desc', R.desc.en, E['doc.desc']);
  check('registry path/category/subtopic', [R.category, R.subtopic, R.path].join(), 'computing,software,computing/software/how-nginx-handles-ten-thousand-connections/');
  ok('every concept id starts with nginx-', R.concepts.every(c => c.id.startsWith('nginx-')));
  for (const c of R.concepts) ok(`concept ${c.id} anchor ${c.anchor} exists`, html.includes(`id="${c.anchor.slice(1)}"`));

  const sq = s => String(s).normalize('NFKC').toLowerCase().replace(/[\s\-‐-―_·・'’]/gu, '');
  const selfAliases = R.concepts.flatMap(c => [...new Set([...c.aliases.zh, ...c.aliases.en].map(sq))]);
  check('no duplicate alias within this REGISTRY.json', selfAliases.filter((a, i) => selfAliases.indexOf(a) !== i).join(), '');

  // Check against all existing REGISTRY.json, atlas/graph/aliases.json, and atlas/data.js
  const rootDir = path.join(DIR, '..', '..', '..');
  const taken = new Set();
  const box = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(rootDir, 'atlas/data.js'), 'utf8'), box);
  for (const node of (box.window.KNOWLEDGE_ATLAS && box.window.KNOWLEDGE_ATLAS.nodes) || []) {
    if (node.id) taken.add(sq(node.id));
    if (node.title) { taken.add(sq(node.title.zh)); taken.add(sq(node.title.en)); }
    for (const a of [...((node.aliases && node.aliases.zh) || []), ...((node.aliases && node.aliases.en) || [])]) taken.add(sq(a));
  }
  const agAliases = JSON.parse(fs.readFileSync(path.join(rootDir, 'atlas/graph/aliases.json'), 'utf8'));
  for (const v of Object.values(agAliases)) {
    if (Array.isArray(v)) for (const a of v) taken.add(sq(a));
    else if (v && typeof v === 'object') for (const a of [...(v.zh || []), ...(v.en || [])]) taken.add(sq(a));
  }
  function walkReg(d) {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      if (['.git', 'node_modules', 'variants'].includes(ent.name)) continue;
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walkReg(p);
      else if (ent.name === 'REGISTRY.json' && path.resolve(p) !== path.resolve(path.join(DIR, 'REGISTRY.json'))) {
        const reg = JSON.parse(fs.readFileSync(p, 'utf8'));
        for (const c of reg.concepts || []) {
          taken.add(sq(c.id));
          if (c.title) { taken.add(sq(c.title.zh)); taken.add(sq(c.title.en)); }
          for (const a of [...((c.aliases && c.aliases.zh) || []), ...((c.aliases && c.aliases.en) || [])]) taken.add(sq(a));
        }
      }
    }
  }
  walkReg(rootDir);
  const collisions = selfAliases.filter(a => taken.has(a));
  check('zero alias collisions with existing site/atlas', collisions.join(), '');
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
