'use strict';
// Unit tests for models, bindings, copy parity, language hygiene, partials, and REGISTRY.json.
// Run: node computing/software/how-redis-answers-in-microseconds/tests/models.cjs
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
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); } }
function ok(name, cond, info) { n++; if (!cond) { fails++; console.error(`FAIL ${name}${info ? ': ' + info : ''}`); } }
function near(name, got, want, tol) { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want} ± ${tol}`); } }

/* ── 1. ch1: event loop vs locks ── */
{
  const el = M.eventLoopModel({ threads: 4, hotPct: 50, slowCmd: false });
  near('ch1 loop kops', el.loopKops, 500, 1e-9);
  ok('ch1 4 threads @ 50% contention slower than 1 lock-free loop', el.lockKops < el.loopKops);
  const el0 = M.eventLoopModel({ threads: 4, hotPct: 0, slowCmd: false });
  ok('ch1 4 threads @ 0% contention scales above 1 loop', el0.lockKops > el0.loopKops);
  const elS = M.eventLoopModel({ threads: 4, hotPct: 50, slowCmd: true });
  check('ch1 2ms slow cmd blocks 17 requests', elS.blockedCount, 17);
  near('ch1 2ms slow cmd p99 = 2000 us', elS.p99Us, 2000, 1e-9);
}

/* ── 2. ch2: RESP & pipelining ── */
{
  const s = M.pipelineStats({ n: 20, rttUs: 200, proto: 'resp2', mode: 'seq' });
  const p = M.pipelineStats({ n: 20, rttUs: 200, proto: 'resp2', mode: 'pipe' });
  check('ch2 SET user:42 alice = 37 bytes', s.sample.reqBytes, 37);
  check('ch2 20 reqs = 740 B = 1 TCP segment', [s.wireBytes, s.tcpPackets].join(), '740,1');
  check('ch2 seq 4024 us vs pipe 224 us', [s.seqTotalUs, p.pipeTotalUs].join(), '4024,224');
  check('ch2 RESP3 map header %2', M.respSample('resp3').repEscaped.startsWith('%2\\r\\n'), true);
}

/* ── 3. ch3: redisObject, embstr 44 B, listpack ── */
{
  check('ch3 44 B embstr = 64 B / 1 malloc', [M.stringMemory(44, false).encoding, M.stringMemory(44, false).allocBytes, M.stringMemory(44, false).mallocs].join(), 'embstr,64,1');
  check('ch3 45 B raw = 80 B / 2 mallocs', [M.stringMemory(45, false).encoding, M.stringMemory(45, false).allocBytes, M.stringMemory(45, false).mallocs].join(), 'raw,80,2');
  check('ch3 shared int 42 = 0 B / 0 mallocs', [M.stringMemory(2, true, 42).encoding, M.stringMemory(2, true, 42).allocBytes, M.stringMemory(2, true, 42).mallocs].join(), 'int,0,0');
  const h64 = M.hashMemory(64, 44), h513 = M.hashMemory(513, 44), hBig = M.hashMemory(8, 65);
  check('ch3 64 entries @44B is listpack 4096 B vs ht 6200 B', [h64.encoding, h64.lpAlloc, h64.htTotal].join(), 'listpack,4096,6200');
  check('ch3 513 entries triggers hashtable', h513.encoding, 'hashtable');
  check('ch3 65B val triggers hashtable', hBig.encoding, 'hashtable');
}

/* ── 4. ch4: dict progressive rehash ── */
{
  const r0 = M.rehashSim({ numKeys: 10, step: 0, mode: 'prog' });
  const r3 = M.rehashSim({ numKeys: 10, step: 3, mode: 'prog' });
  const r8 = M.rehashSim({ numKeys: 10, step: 8, mode: 'prog' });
  const rs = M.rehashSim({ numKeys: 10, step: 3, mode: 'stw' });
  check('ch4 rehash idx progression 0 -> 3 -> -1', [r0.rehashidx, r3.rehashidx, r8.rehashidx].join(), '0,3,-1');
  check('ch4 key count preserved at step 3', r3.h0Count + r3.h1Count, 10);
  check('ch4 stw stall 380000 us', rs.spikeUs, 380000);
}

/* ── 5. ch5: ZSET skiplist ── */
{
  const z = M.buildSkiplist(12, 3);
  const q = M.zslQueryRank(z, 9);
  check('ch5 default seed 3 rank 9 hops = 4, span = 9', [q.hops, q.rank, q.target.score].join(), '4,9,90');
  check('ch5 constants P=0.25, MAXLEVEL=32', [M.CONST.ZSKIPLIST_P, M.CONST.ZSKIPLIST_MAXLEVEL].join(), '0.25,32');
}

/* ── 6. ch6: Redis 8 io-threads ── */
{
  const s1 = M.ioThreadModel({ ioThreads: 1 });
  const s4 = M.ioThreadModel({ ioThreads: 4 });
  const s8 = M.ioThreadModel({ ioThreads: 8 });
  const tls = M.ioThreadModel({ ioThreads: 4, tls: true });
  ok('ch6 4 threads faster than 1 thread', s4.kops > s1.kops);
  ok('ch6 8 threads hits core bottleneck', s8.bottleneck === 'core');
  ok('ch6 TLS keeps I/O as bottleneck @ 4 threads', tls.bottleneck === 'io');
}

/* ── 7. ch7: BGSAVE CoW & AOF ── */
{
  const u = M.cowSim({ writePct: 50, skew: false });
  const sk = M.cowSim({ writePct: 50, skew: true });
  near('ch7 50% uniform RAM mult', u.ramMult, 1.59, 0.01);
  near('ch7 50% skew RAM mult', sk.ramMult, 1.19, 0.01);
  check('ch7 0% write RAM mult', M.cowSim({ writePct: 0 }).ramMult, 1);
}

/* ── 8. ch8: Approx LRU, Morris LFU, Active Expire ── */
{
  near('ch8 approx LRU 5 samples err', M.approxLruSim(5).meanErrPct, 8.1, 0.1);
  check('ch8 Morris LFU factor=10 1k / 100k', [M.morrisExpectedCounter(1000, 10), M.morrisExpectedCounter(100000, 10)].join(), '19,146');
  const ae = M.activeExpireSim(40, 1);
  check('ch8e effort=1 keysPerLoop=20 acceptableStale=10', [ae.keysPerLoop, ae.acceptableStale, ae.loops, ae.freed].join(), '20,10,15,96');
}

/* ── 9. ch9: Cluster hash slots & reverse-binary SCAN ── */
{
  check('ch9 CRC16 test vector 123456789 -> 12739', M.keyHashSlot('123456789').slot, 12739);
  check('ch9 {42} hash tag -> 8000', [M.keyHashSlot('user:{42}:cart').slot, M.keyHashSlot('user:{42}:orders').slot].join(), '8000,8000');
  check('ch9 SCAN zero missed keys across none/double/shrink', [
    M.simulateScan({ resize: 'none', step: 16 }).missedOnFull,
    M.simulateScan({ resize: 'double', step: 16 }).missedOnFull,
    M.simulateScan({ resize: 'shrink', step: 16 }).missedOnFull
  ].join(), '0,0,0');
}

/* ── 10. bindings: every prose number ── */
{
  const want = {
    'ch1.loopKops': '500', 'ch1.lock4Kops': '313', 'ch1.slowP99': '2.00', 'ch1.blocked': '17',
    'ch2.reqBytes': '37', 'ch2.seqMs': '4.02', 'ch2.pipeUs': '224', 'ch2.speedup': '18.0',
    'ch3.robjB': '16', 'ch3.sds8B': '3', 'ch3.embLimit': '44', 'ch3.emb44Alloc': '64', 'ch3.raw45Alloc': '80',
    'ch3.lp64Bytes': '4,096', 'ch3.ht64Bytes': '6,200', 'ch3.lpMaxEntries': '512',
    'ch4.htInit': '4', 'ch4.forceRatio': '5',
    'ch5.maxLvl': '32', 'ch5.zslP': '0.25', 'ch5.seed3Hops': '4',
    'ch6.kops1': '357', 'ch6.kops4': '713',
    'ch7.pageKiB': '4', 'ch7.cowUnif': '1.59', 'ch7.cowSkew': '1.19',
    'ch8.expKeys': '20', 'ch8.expStale': '10', 'ch8.lruSamp': '5', 'ch8.lruPool': '16', 'ch8.lru5Err': '8.1',
    'ch8.lfuInit': '5', 'ch8.lfuFactor': '10', 'ch8.lfu1k': '19', 'ch8.lfu100k': '146',
    'ch9.slots': '16,384', 'ch9.crcTestSlot': '12,739', 'ch9.tagSlot': '8,000'
  };
  check('binding names', Object.keys(B).sort().join(), Object.keys(want).sort().join());
  for (const k in want) check('binding ' + k, B[k], want[k]);
}

/* ── 11. copy, parity, language hygiene, partials ── */
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
  check('draft page.json has no status/title/desc', [PJ.status, PJ.title, PJ.desc].map(String).join(), 'undefined,undefined,undefined');

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
  const dgs = figs.filter(f => f.startsWith('dg-'));
  check('at least 8 static diagrams (9 built)', dgs.length, 9);
  const dgText = dgs.map(f => fs.readFileSync(path.join(DIR, 'figures', f), 'utf8')).join('');
  ok('every diagram text has explicit x, y, font-size >= 14 and no transform', !/\btransform=/.test(dgText) && [...dgText.matchAll(/<text ([^>]*)>/g)].every(m => /\bx="/.test(m[1]) && /\by="/.test(m[1]) && +(m[1].match(/font-size="([\d.]+)"/) || [0, 0])[1] >= 14));
  ok('pinned Redis 8.0 release mentioned', /Redis 8\.0/.test(Object.values(Z).join(' ')) && /Redis 8\.0/.test(Object.values(E).join(' ')));
}

/* ── 12. REGISTRY.json parity & unique aliases ── */
{
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry title.zh = hero.title', R.title.zh, Z['hero.title']);
  check('registry title.en = en hero.title', R.title.en, E['hero.title']);
  check('registry desc.zh = doc.desc', R.desc.zh, Z['doc.desc']);
  check('registry desc.en = en doc.desc', R.desc.en, E['doc.desc']);
  check('registry location', [R.category, R.subtopic, R.path].join(), 'computing,software,computing/software/how-redis-answers-in-microseconds/');
  ok('10-14 concepts and all start with redis-', R.concepts.length >= 10 && R.concepts.length <= 14 && R.concepts.every(c => c.id.startsWith('redis-')));
  for (const c of R.concepts) ok(`concept ${c.id} anchor ${c.anchor} exists`, html.includes(`id="${c.anchor.slice(1)}"`));
  const sq = s => s.normalize('NFKC').toLowerCase().replace(/[\s\-‐-―_·・'’]/gu, '');
  const allAliases = R.concepts.flatMap(c => [...new Set([...c.aliases.zh, ...c.aliases.en].map(sq))]);
  check('no duplicate aliases within this essay', allAliases.filter((a, i) => allAliases.indexOf(a) !== i).join(), '');
  const forbiddenOwned = ['缓存', 'cache', '写时复制', 'copyonwrite', 'lru', 'epoll', 'io_uring', 'pipelining', 'hashing'];
  check('no bare aliases owned by sibling pages', allAliases.filter(a => forbiddenOwned.map(sq).includes(a)).join(), '');
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
