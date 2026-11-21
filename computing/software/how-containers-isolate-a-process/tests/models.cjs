'use strict';
// Dependency-free unit & hygiene tests for "How Containers Isolate a Process".
// Verifies all 9 models, all 43 bound numbers in bindings.cjs, every literal and dynamic key
// read by app.js, zh/en parity, unprefill(html, Z) zero-CJK hygiene, zero CJK in copy.en.js
// and figures/, SVG text rules, and REGISTRY.json uniqueness against atlas & sibling registries.
// Run: node computing/software/how-containers-isolate-a-process/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm'), crypto = require('crypto');
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

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); } }
function ok(name, cond, info) { n++; if (!cond) { fails++; console.error(`FAIL ${name}${info ? ': ' + info : ''}`); } }
function near(name, got, want, tol) { n++; if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want} ± ${tol}`); } }

/* ── 1. FIPS 180-4 SHA-256 & OCI ChainID ── */
{
  check('sha256("")', M.sha256Hex(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  check('sha256("abc")', M.sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  check('sha256 matches node crypto', M.sha256Hex('容器-λ-2026'), crypto.createHash('sha256').update('容器-λ-2026', 'utf8').digest('hex'));
  const o2 = M.ociLayersModel({ mutate: 'none', replicas: 2 });
  check('ch2 default: 199 MiB shared, 201 stored, 400 naive, 3/4 hits', [o2.sharedMiB, o2.storedMiB, o2.naiveMiB, o2.cacheHits].join(), '199,201,400,3');
  const o10 = M.ociLayersModel({ mutate: 'none', replicas: 10 });
  check('ch2 10 replicas: 199 shared, 209 stored, 2000 naive', [o10.sharedMiB, o10.storedMiB, o10.naiveMiB].join(), '199,209,2000');
  const oL1 = M.ociLayersModel({ mutate: 'L1', replicas: 2 });
  check('ch2 L1 mutation: only L0 (124 MiB) shared, 1/4 hits', [oL1.sharedMiB, oL1.storedMiB, oL1.cacheHits].join(), '124,276,1');
  for (const mut of ['none', 'L1', 'L2', 'L3']) {
    const r = M.ociLayersModel({ mutate: mut, replicas: 3 });
    ok(`ch2 sayKey ${r.sayKey} exists`, Z[r.sayKey] != null && E[r.sayKey] != null);
  }
}

/* ── 2. Isolation profiles (ch1) ── */
{
  for (const mode of ['process', 'container', 'microvm', 'vm']) {
    const p = M.isolationProfile(mode, 8);
    ok(`ch1 ${mode} sayKey exists`, Z[p.sayKey] != null && E[p.sayKey] != null);
  }
  const c8 = M.isolationProfile('container', 8), v8 = M.isolationProfile('vm', 8);
  near('ch1 8 containers = 329.6 MiB', c8.totalMb, 329.6, 1e-6);
  near('ch1 8 VMs = 1584 MiB', v8.totalMb, 1584, 1e-6);
  check('ch1 container vs VM boot', [c8.bootMs, v8.bootMs].join(), '15,1800');
}

/* ── 3. OverlayFS (ch3) ── */
{
  for (const op of M.OVERLAY_OPS) {
    const r = M.overlayfsModel(op);
    ok(`ch3 ${op} sayKey exists`, Z[r.sayKey] != null && E[r.sayKey] != null);
  }
  const sp = M.overlayfsModel('rm-split'), sm = M.overlayfsModel('rm-same');
  near('ch3 rm-split total = 185.204 MiB', sp.totalStoredMiB, 185.204, 1e-6);
  near('ch3 rm-same total = 105.204 MiB', sm.totalStoredMiB, 105.204, 1e-6);
  check('ch3 append copy-up = 100 MiB', M.overlayfsModel('append').copyUpMiB, 100);
  check('ch3 chmod copy-up = 100 MiB', M.overlayfsModel('chmod').copyUpMiB, 100);
}

/* ── 4. Namespaces (ch4) ── */
{
  const d = M.namespaceModel({});
  check('ch4 default rootful: PID 1/4821, UID 0->0, procs 2', [d.insidePid, d.hostPid, d.uidInside, d.uidOutside, d.visibleProcs].join(), '1,4821,0,0,2');
  const rl = M.namespaceModel({ userNs: true });
  check('ch4 rootless: UID 0->100000, isolated 7/8', [rl.uidInside, rl.uidOutside, rl.isolatedCount].join(), '0,100000,7');
  const pl = M.namespaceModel({ pidNs: true, procRemount: false });
  check('ch4 proc leak shows 142 procs', [pl.sayKey, pl.visibleProcs].join(), 'ch4.say.proc-leak,142');
  for (const cfg of [{}, { userNs: true }, { procRemount: false }, { pidNs: false }, { mntNs: false }]) {
    const r = M.namespaceModel(cfg);
    ok(`ch4 ${r.sayKey} exists`, Z[r.sayKey] != null && E[r.sayKey] != null);
  }
}

/* ── 5. Container networking (ch5) ── */
{
  for (const mode of M.NET_MODES) {
    const r = M.networkModel({ mode, payloadBytes: 1200, vxlan: false });
    ok(`ch5 ${r.sayKey} exists`, Z[r.sayKey] != null && E[r.sayKey] != null);
  }
  const f = M.networkModel({ mode: 'bridge-nat', payloadBytes: 1460, vxlan: true });
  check('ch5 vxlan fragmentation check', [f.vxlanOverhead, f.mtuLimit, f.ipPayload, f.fragmented, f.sayKey].join(), '50,1450,1500,true,ch5.say.frag');
}

/* ── 6. cgroups v2 CPU throttling (ch6) ── */
{
  const c4 = M.cfsThrottleModel({ cpus: 0.5, periodMs: 100, threads: 4 });
  check('ch6 default 0.5 CPU / 4 thr / 100 ms', [c4.quotaMs, c4.burnMs, c4.freezeMs, c4.singleBurstRpcMs, c4.nrThrottled].join(), '50,12.5,87.5,107.5,2');
  const c10 = M.cfsThrottleModel({ cpus: 0.5, periodMs: 10, threads: 4 });
  check('ch6 10 ms period reduces freeze to 8.75 ms', [c10.freezeMs, c10.singleBurstRpcMs].join(), '8.75,28.75');
  const c1 = M.cfsThrottleModel({ cpus: 0.5, periodMs: 100, threads: 1 });
  check('ch6 1 thread with 1 CPU is smooth', [M.cfsThrottleModel({ cpus: 1, periodMs: 100, threads: 1 }).throttled, c1.throttled].join(), 'false,true');
}

/* ── 7. cgroups v2 Memory (ch7) ── */
{
  const mh = M.cgroupMemoryModel({ anonMiB: 180, pageCacheMiB: 100, tmpfsMiB: 0, memMaxMiB: 512 });
  const mr = M.cgroupMemoryModel({ anonMiB: 240, pageCacheMiB: 220, tmpfsMiB: 0, memMaxMiB: 512 });
  const mt = M.cgroupMemoryModel({ anonMiB: 440, pageCacheMiB: 60, tmpfsMiB: 0, memMaxMiB: 512 });
  const mo = M.cgroupMemoryModel({ anonMiB: 240, pageCacheMiB: 220, tmpfsMiB: 300, memMaxMiB: 512 });
  check('ch7 statuses cover all 4 states', [mh.status, mr.status, mt.status, mo.status].join(), 'healthy,reclaim,thrash,oom');
  check('ch7 default reclaim 50 MiB, psi 8.4%', [mr.memHighMiB, mr.reclaimedCacheMiB, mr.psiPct].join(), '410,50,8.4');
}

/* ── 8. Security perimeter (ch8) ── */
{
  const a = M.seccompCapModel({ probe: 'read_write' });
  const s = M.seccompCapModel({ probe: 'mount_fs' });
  const c = M.seccompCapModel({ probe: 'raw_ping', capNetRaw: false });
  const l = M.seccompCapModel({ probe: 'mount_fs', seccomp: false, capSysAdmin: true, lsm: true });
  check('ch8 all 4 sayKeys covered', [a.sayKey, s.sayKey, c.sayKey, l.sayKey].join(), 'ch8.say.allow,ch8.say.seccomp,ch8.say.caps,ch8.say.lsm');
}

/* ── 9. PID 1 signal & zombie reaping (ch9) ── */
{
  const pRun = M.pid1SignalModel({ mode: 'shell', timeSec: 4, spawnRate: 3, sendStop: true });
  const pHang = M.pid1SignalModel({ mode: 'shell', timeSec: 10, spawnRate: 3, sendStop: true });
  const pKill = M.pid1SignalModel({ mode: 'shell', timeSec: 15, spawnRate: 3, sendStop: true });
  const pExec = M.pid1SignalModel({ mode: 'exec', timeSec: 15, spawnRate: 3, sendStop: true });
  const pInit = M.pid1SignalModel({ mode: 'init', timeSec: 15, spawnRate: 3, sendStop: true });
  check('ch9 all 5 sayKeys covered', [pRun.sayKey, pHang.sayKey, pKill.sayKey, pExec.sayKey, pInit.sayKey].join(), 'ch9.say.run,ch9.say.hang,ch9.say.sigkill,ch9.say.exec,ch9.say.init');
  check('ch9 zombies at 5s = 15', M.pid1SignalModel({ mode: 'shell', timeSec: 5, spawnRate: 3, sendStop: false }).peakZombies, 15);
}

/* ── 10. bindings: every prose number ── */
{
  const want = {
    'ch1.cBoot': '15', 'ch1.mBoot': '115', 'ch1.vmBoot': '1,800', 'ch1.cTotal8': '329.6', 'ch1.vmTotal8': '1,584',
    'ch2.img': '200', 'ch2.shared': '199', 'ch2.stored2': '201', 'ch2.naive2': '400',
    'ch2.tenShared': '199', 'ch2.tenStored': '209', 'ch2.tenNaive': '2,000',
    'ch3.modelSize': '100', 'ch3.pkgSize': '80', 'ch3.splitTotal': '185.2', 'ch3.sameTotal': '105.2',
    'ch4.nsTotal': '8', 'ch4.hostPid': '4821', 'ch4.uidBase': '100000', 'ch4.hostProcs': '142', 'ch4.ctProcs': '2',
    'ch5.vxlan': '50', 'ch5.mtu': '1450', 'ch5.bridgeNs': '1,850', 'ch5.ebpfNs': '780',
    'ch6.quota': '50', 'ch6.period': '100', 'ch6.burn4': '12.5', 'ch6.freeze4': '87.5', 'ch6.rpc4': '107.5', 'ch6.freeze10': '8.75',
    'ch7.max': '512', 'ch7.high': '410', 'ch7.reclaimed': '50', 'ch7.psi': '8.4%',
    'ch8.totalSys': '374', 'ch8.allowedSys': '330', 'ch8.blockedSys': '44',
    'ch9.grace': '10', 'ch9.exitKill': '137', 'ch9.zombies5': '15',
    'ch10.fcMem': '5', 'ch10.fcBoot': '125'
  };
  check('binding names match', Object.keys(B).sort().join(), Object.keys(want).sort().join());
  for (const k in want) check('binding ' + k, B[k], want[k]);
}

/* ── 11. copy, parity, dynamicKeys & language hygiene ── */
{
  const keys = [...app.matchAll(/\bt\('([\w.]+)'/g)].map(m => m[1]).filter(k => !k.endsWith('.'));
  const missing = [...new Set(keys)].filter(k => Z[k] == null);
  check('every literal key app.js reads exists', missing.join(), '');
  const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'page.json'), 'utf8'));
  const dyn = Object.entries(PJ.dynamicKeys || {}).flatMap(([p, vs]) => vs.map(v => p + '.' + v));
  check('all dynamic keys exist in zh & en', dyn.filter(k => Z[k] == null || E[k] == null).join(), '');
  check('zh and en have identical keys', Object.keys(Z).sort().join(), Object.keys(E).sort().join());
  const ph = s => (String(s).match(/\{[a-zA-Z_]\w*\}/g) || []).sort().join();
  check('runtime placeholders match in zh and en', Object.keys(Z).filter(k => ph(Z[k]) !== ph(E[k])).join(), '');
  check('English is native (no stub flag)', [String((PJ.languages || {}).en), /data-lang-en="stub"/.test(html)].join(), 'undefined,false');
  check('zero CJK in copy.en.js', Object.keys(E).filter(k => /[㐀-鿿]/.test(E[k])).join(), '');
  let h = unprefill(html, Z)
    .replace(/<div[^>]*id="langToggle"[\s\S]*?<\/div>/, '')
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta[^>]*>/g, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  const cjk = h.match(/[^\n]{0,30}[㐀-鿿][^\n]{0,30}/g) || [];
  check('no CJK in index.html outside prefilled copy', cjk.slice(0, 3).join(' | '), '');
  for (const f of fs.readdirSync(path.join(DIR, 'figures'))) {
    const s = fs.readFileSync(path.join(DIR, 'figures', f), 'utf8');
    ok(`figures/${f} has zero CJK`, !/[㐀-鿿]/.test(s));
  }
  const raw = [...fs.readdirSync(path.join(DIR, 'figures')).filter(f => f.startsWith('dg-')).map(f => fs.readFileSync(path.join(DIR, 'figures', f), 'utf8')).join('').matchAll(/<text [^>]*>([^<]+)<\/text>/g)].map(m => m[1]);
  ok('no {placeholder} in SVG literal text', raw.every(s => !/\{.*\}/.test(s)), raw.join(' | '));
  ok('every diagram text has x, y, font-size >= 14', [...fs.readdirSync(path.join(DIR, 'figures')).filter(f => f.startsWith('dg-')).map(f => fs.readFileSync(path.join(DIR, 'figures', f), 'utf8')).join('').matchAll(/<text ([^>]*)>/g)].every(m => /\bx="/.test(m[1]) && /\by="/.test(m[1]) && +(m[1].match(/font-size="([\d.]+)"/) || [0, 0])[1] >= 14));
  check('9 diagrams', fs.readdirSync(path.join(DIR, 'figures')).filter(f => f.startsWith('dg-')).length, 9);
}

/* ── 12. REGISTRY.json parity & zero alias/ID collisions ── */
{
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry title.zh = hero.title', R.title.zh, Z['hero.title']);
  check('registry title.en = hero.title', R.title.en, E['hero.title']);
  check('registry desc.zh = doc.desc', R.desc.zh, Z['doc.desc']);
  check('registry desc.en = doc.desc', R.desc.en, E['doc.desc']);
  check('all concept IDs start with container-', R.concepts.every(c => c.id.startsWith('container-')), true);
  for (const c of R.concepts) ok(`concept ${c.id} anchor ${c.anchor} exists`, html.includes(`id="${c.anchor.slice(1)}"`));

  const sq = s => String(s).normalize('NFKC').toLowerCase().replace(/[\s\-‐-―_·・'’]/gu, '');
  const ownAliases = R.concepts.flatMap(c => [...new Set([...c.aliases.zh, ...c.aliases.en].map(sq))]);
  check('no duplicate aliases inside this page', ownAliases.filter((a, i) => ownAliases.indexOf(a) !== i).join(), '');

  // Check against existing search chunks & sibling REGISTRY.json
  const extAliases = new Set();
  const box = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'search', 'manifest.js'), 'utf8'), box);
  for (const ref of box.window.KNOWLEDGE_CONCEPTS.chunks) {
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, ref.split('?')[0]), 'utf8'), box);
  }
  for (const c of box.window.KNOWLEDGE_CONCEPTS.concepts) {
    for (const a of [c[3], c[4], ...c[5], ...c[6]]) extAliases.add(sq(a));
  }
  const core = JSON.parse(fs.readFileSync(path.join(ROOT, 'atlas', 'graph', 'core.json'), 'utf8'));
  const lesDir = path.join(ROOT, 'atlas', 'graph', 'lessons');
  const lesNodes = fs.readdirSync(lesDir).flatMap(f => JSON.parse(fs.readFileSync(path.join(lesDir, f), 'utf8')).nodes || []);
  const extIds = new Set([...core.nodes, ...lesNodes].map(x => x.id));
  check('zero concept ID collision with atlas', R.concepts.filter(c => extIds.has(c.id)).map(c => c.id).join(), '');
  for (const d of fs.readdirSync(path.join(ROOT, 'computing', 'software'))) {
    if (d === 'how-containers-isolate-a-process') continue;
    const rp = path.join(ROOT, 'computing', 'software', d, 'REGISTRY.json');
    if (!fs.existsSync(rp)) continue;
    const sr = JSON.parse(fs.readFileSync(rp, 'utf8'));
    for (const c of sr.concepts) for (const a of [c.title.zh, c.title.en, ...c.aliases.zh, ...c.aliases.en]) extAliases.add(sq(a));
  }
  check('zero alias collision with existing site or siblings', ownAliases.filter(a => extAliases.has(a)).join(), '');
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
