'use strict';
// Dependency-free unit & hygiene tests for how-git-stores-history.
// Run: node computing/software/how-git-stores-history/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm'), zlib = require('zlib');
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

/* ── 1. SHA-1, SHA-256, CRC32 & zlib framing ── */
{
  // RFC 3174 & NIST FIPS 180-4 standard vectors
  check('SHA-1 empty', M.sha1Hex(''), 'da39a3ee5e6b4b0d3255bfef95601890afd80709');
  check('SHA-1 "abc"', M.sha1Hex('abc'), 'a9993e364706816aba3e25717850c26c9cd0d89d');
  check('SHA-256 empty', M.sha256Hex(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  check('SHA-256 "abc"', M.sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');

  // Git 2.56.0 loose blob objects & zlib roundtrip
  const hello = M.looseObject('blob', 'hello git\n', 'sha1');
  check('hello git\\n raw size', hello.rawSize, 18);
  check('hello git\\n SHA-1 (pinned vs git 2.56.0)', hello.oid, '8d0e41234f24b6da002d962a26c2495ea16a425f');
  check('hello git\\n shard path', hello.objectPath, '.git/objects/8d/0e41234f24b6da002d962a26c2495ea16a425f');
  const hello256 = M.looseObject('blob', 'hello git\n', 'sha256');
  check('hello git\\n SHA-256 length', hello256.oid.length, 64);
  check('empty tree SHA-256 (gitformat-loose vector)', M.encodeTree([], 'sha256').oid, '6ef19b41225c5369f1c104d45d8d85efa9b057b53b14b4b9b939dd74decc5321');
  const rep = M.looseObject('blob', 'repeat-line\n'.repeat(40), 'sha1');
  ok('pure-JS DEFLATE compresses repetitive text', rep.zlibSize < rep.rawSize * 0.4, `${rep.zlibSize} vs ${rep.rawSize}`);
  check('Node zlib.inflateSync round-trips pure-JS DEFLATE', Buffer.compare(zlib.inflateSync(Buffer.from(rep.compressed)), Buffer.from(rep.raw)), 0);

  // Bit flip avalanche
  const fl = M.flipPayloadBit('hello git\n', 0, 'sha1');
  ok('1-bit flip flips ~half of 160 bits and changes shard', fl.bitDiff > 50 && fl.bitDiff < 110 && fl.base.shard !== fl.flipped.shard);
}

/* ── 2. Tree sorting & structural sharing ── */
{
  const sorted = M.sortTreeEntries([
    { mode: '40000', name: 'foo', oid: '0'.repeat(40) },
    { mode: '100644', name: 'foo-bar.txt', oid: '1'.repeat(40) }
  ]);
  check('tree sort places foo-bar.txt before foo/ (0x2d < 0x2f)', sorted.map(e => e.name).join(','), 'foo-bar.txt,foo');
  const rootEdit = M.compareTreeSnapshotEdit('README.md', 50, 1000);
  const deepEdit = M.compareTreeSnapshotEdit('src/core/hash.js', 50, 1000);
  check('editing README.md creates 2 new objects (1 blob + 1 root tree)', rootEdit.newCount, 2);
  check('editing src/core/hash.js creates 4 new objects (1 blob + 3 trees)', [deepEdit.newCount, deepEdit.sharedCount, deepEdit.nextObjects.size].join(), '4,11,15');
  check('50 commits on 1000 files: naive 50,000 vs Git 1,049', [deepEdit.naiveBlobsTotal, deepEdit.gitBlobsTotal].join(), '50000,1049');
}

/* ── 3. Commit DAG & rewrite immutability ── */
{
  const d0 = M.createDagScenario([]);
  check('initial DAG has 4 commits, 0 orphaned', [d0.totalCount, d0.reachableCount, d0.orphanedCount].join(), '4,4,0');
  const da = M.createDagScenario(['amend-main']);
  check('after amend: 5 commits total, 1 orphaned C2', [da.totalCount, da.reachableCount, da.orphanedCount].join(), '5,4,1');
  ok('amended node has brand-new OID', da.headNode.oid !== d0.nodes[2].oid);
  const dr = M.createDagScenario(['rebase-feat']);
  check('after rebase: 5 commits total, 1 orphaned F1', [dr.totalCount, dr.reachableCount, dr.orphanedCount].join(), '5,4,1');
  const dm = M.createDagScenario(['merge-feat']);
  check('after merge: 5 commits total, 0 orphaned, 2 parents', [dm.totalCount, dm.orphanedCount, dm.headNode.parents.length].join(), '5,0,2');
}

/* ── 4. Index DIRC v2 & Racy Git ── */
{
  const enc = M.encodeIndexV2([
    { path: 'z.txt', oid: '1'.repeat(40), mode: 0o100644, size: 10 },
    { path: 'a.txt', oid: '2'.repeat(40), mode: 0o100644, size: 5 }
  ], 'sha1');
  check('DIRC magic & version 2', [String.fromCharCode(...enc.slice(0, 4)), enc[7], enc[11]].join(), 'DIRC,2,2');
  const idxNorm = M.evalIndexStatCache({ totalFiles: 2000, modifiedFiles: 3, touchedOnlyFiles: 5, racySameTick: false });
  check('stat cache skips 1,992 of 2,000 files', [idxNorm.skippedByStat, idxNorm.contentHashed, idxNorm.racyChecked].join(), '1992,8,0');
  const idxRacy = M.evalIndexStatCache({ totalFiles: 2000, modifiedFiles: 3, touchedOnlyFiles: 5, racySameTick: true });
  ok('racySameTick zeroes src/racy.cfg idxSize and forces rehash', idxRacy.racyChecked > 0 && idxRacy.sample.find(s => s.path === 'src/racy.cfg').idxSize === 0);
}

/* ── 5. Refs, HEAD & reflog GC ── */
{
  const r1 = M.simulateReflogGC({ resetPerformed: true, daysElapsed: 10, gcExpiredDays: 30, gcNow: false });
  check('branch file 41 B, HEAD file 21 B', [r1.branchFileBytes, r1.headBytes].join(), '41,21');
  check('at day 10 (< 30d limit): C4/C5/D1 protected by reflog', [r1.reachableCount, r1.reflogCount, r1.danglingCount, r1.prunedCount].join(), '3,3,0,0');
  const r2 = M.simulateReflogGC({ resetPerformed: true, daysElapsed: 40, gcExpiredDays: 30, gcNow: false });
  check('at day 40 (> 30d limit, no gc): C4/C5/D1 dangling', [r2.reachableCount, r2.reflogCount, r2.danglingCount, r2.prunedCount].join(), '3,0,3,0');
  const r3 = M.simulateReflogGC({ resetPerformed: true, daysElapsed: 40, gcExpiredDays: 30, gcNow: true });
  check('after gc --prune=now: 3 pruned', [r3.reachableCount, r3.reflogCount, r3.danglingCount, r3.prunedCount].join(), '3,0,0,3');
}

/* ── 6. Myers Diff & 3-Way Merge ── */
{
  const md = M.myersDiff(['a', 'b', 'c'], ['a', 'x', 'c', 'd']);
  check('myersDiff edit distance', md.dist, 3);
  const clean = M.merge3Way(['a', 'b', 'c'], ['A', 'b', 'c'], ['a', 'b', 'C']);
  check('disjoint 3-way merge clean', [clean.conflicts, clean.mergedLines.join('/')].join(), '0,A/b/C');
  const same = M.merge3Way(['a', 'b', 'c'], ['a', 'X', 'c'], ['a', 'X', 'c']);
  check('convergent identical edit clean', [same.conflicts, same.mergedLines.join('/')].join(), '0,a/X/c');
  const cfl = M.merge3Way(['a', 'b', 'c'], ['a', 'X', 'c'], ['a', 'Y', 'c']);
  check('same-line differing edit yields 1 conflict', [cfl.conflicts, cfl.hasConflictMarkers].join(), '1,true');
}

/* ── 7. Packfile varints, OFS_DELTA, delta opcodes & .idx v2 ── */
{
  for (const [type, sz] of [[3, 18], [6, 512], [1, 131079]]) {
    const enc = M.encodePackObjHeader(type, sz);
    const dec = M.decodePackObjHeader(enc, 0);
    check(`pack header varint roundtrip (${type}, ${sz})`, `${dec.type},${dec.size}`, `${type},${sz}`);
  }
  for (const dist of [12, 127, 128, 16512, 1000000]) {
    const enc = M.encodeOfsDeltaOffset(dist);
    const dec = M.decodeOfsDeltaOffset(enc, 0);
    check(`OFS_DELTA negative offset varint (${dist})`, dec.dist, dist);
  }
  const base = 'const x = 1;\nconst y = 2;\nshared shared shared payload block\n';
  const target = base.replace('const y = 2;', 'const y = 99;') + 'tail\n';
  const dl = M.computeDeltaOpcodes(base, target, 8);
  check('delta bytecode roundtrip', M.bytesToUtf8(M.applyDeltaBytes(base, dl.deltaBytes)), target);

  const pkSorted = M.simulatePackWindow({ windowSize: 4, sortByHeuristic: true, queryIdxSlot: 3 });
  const pkUnsorted = M.simulatePackWindow({ windowSize: 4, sortByHeuristic: false, queryIdxSlot: 3 });
  ok('heuristic sort achieves >= 6 OFS_DELTA and shrinks pack vs loose', pkSorted.deltaCount >= 6 && pkSorted.packTotalBytes < pkSorted.looseTotalBytes * 0.6);
  ok('sorted pack beats unsorted OID order', pkSorted.packTotalBytes < pkUnsorted.packTotalBytes);
  check('idx lookup locates target object', pkSorted.lookup.found.oid, pkSorted.target.oid);
}

/* ── 8. Clone modes & Frontier scaling ── */
{
  const cf = M.simulateCloneMode({ mode: 'full', commits: 200, shallowDepth: 1, binaryAssetsMB: 12 });
  const cb = M.simulateCloneMode({ mode: 'blobless', commits: 200, shallowDepth: 1, binaryAssetsMB: 12 });
  const cs = M.simulateCloneMode({ mode: 'shallow', commits: 200, shallowDepth: 1, binaryAssetsMB: 12 });
  ok('blobless saves > 80% over full clone with binary history', cb.wireBytes < cf.wireBytes * 0.2 && cb.historyAvailable === true);
  check('shallow depth=1 lacks full history', cs.historyAvailable, false);

  const rb = M.simulateRefBackends({ numRefs: 866000, opsCount: 1 });
  near('reftable 866k matches technical/reftable.adoc (~36.1 MiB)', rb.reftableTotalBytes / (1024 * 1024), 36.1, 0.5);
  near('packed-refs 866k matches technical/reftable.adoc (~62.2 MiB)', rb.packedFileBytes / (1024 * 1024), 62.2, 0.5);
  ok('reftable cold lookup < 50 us vs packed-refs > 300,000 us', rb.reftableColdLookupUs < 50 && rb.packedColdLookupUs > 300000);

  const sp = M.simulateSparseIndex({ totalFiles: 100000, totalTopDirs: 20, activeDirs: 2 });
  check('sparse index 2/20 active dirs -> 10,018 entries', sp.sparseEntries, 10018);
}

/* ── 9. Bindings parity ── */
{
  const wantKeys = [
    'ch2.helloRaw', 'ch2.helloOid', 'ch2.helloShard', 'ch2.hello256', 'ch2.emptyTree256',
    'ch3.treeTotal', 'ch3.treeNew', 'ch3.treeShared', 'ch3.naive50', 'ch3.git50',
    'ch4.c0Oid', 'ch4.c2Oid', 'ch4.c2pOid',
    'ch5.idxSkip', 'ch5.idxBytes',
    'ch6.branchBytes', 'ch6.headBytes',
    'ch8.looseTot', 'ch8.packTot', 'ch8.packSave',
    'ch9.fullMB', 'ch9.bloblessMB', 'ch9.bloblessPct',
    'ch10.packed100k', 'ch10.reftable100k', 'ch10.sparseEntries'
  ];
  check('binding key set', Object.keys(B).sort().join(), wantKeys.slice().sort().join());
  check('ch2.helloRaw', B['ch2.helloRaw'], '18');
  check('ch2.helloOid', B['ch2.helloOid'], '8d0e4123');
  check('ch2.helloShard', B['ch2.helloShard'], '8d');
  check('ch3.naive50 / ch3.git50', `${B['ch3.naive50']} / ${B['ch3.git50']}`, '50,000 / 1,049');
  check('ch5.idxSkip', B['ch5.idxSkip'], '1,992');
  check('ch6.branchBytes / headBytes', `${B['ch6.branchBytes']} / ${B['ch6.headBytes']}`, '41 / 21');
  check('ch10.sparseEntries', B['ch10.sparseEntries'], '10,018');
}

/* ── 10. Copy, parity, SVG & language hygiene ── */
{
  const keys = [...app.matchAll(/\bt\('([\w.]+)'/g)].map(m => m[1]).filter(k => !k.endsWith('.'));
  const missing = [...new Set(keys)].filter(k => Z[k] == null);
  check('every literal key app.js reads exists in zh', missing.join(), '');
  const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'page.json'), 'utf8'));
  const dyn = Object.entries(PJ.dynamicKeys).flatMap(([p, vs]) => vs.map(v => p + '.' + v));
  check('every dynamic key exists in zh', dyn.filter(k => Z[k] == null).join(), '');
  check('zh and en have identical keys', Object.keys(Z).sort().join(), Object.keys(E).sort().join());
  const ph = s => (String(s).match(/\{[a-zA-Z_]\w*\}/g) || []).sort().join();
  check('runtime placeholders match in zh and en', Object.keys(Z).filter(k => ph(Z[k]) !== ph(E[k])).join(), '');
  check('English is complete (no stub)', [String((PJ.languages || {}).en), /data-lang-en="stub"/.test(html)].join(), 'undefined,false');
  check('zero CJK in English copy', Object.keys(E).filter(k => /[㐀-鿿]/.test(E[k])).join(), '');
  check('draft page.json has no status field yet', String(PJ.status), 'undefined');
  check('page.json layout/category/subtopic/stage', [PJ.layout, PJ.category, PJ.subtopic, PJ.stage].join(), 'essay,computing,software,university');

  let h = unprefill(html, Z)
    .replace(/<div[^>]*id="langToggle"[\s\S]*?<\/div>/, '')
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta[^>]*>/g, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  const cjk = h.match(/[^\n]{0,30}[㐀-鿿][^\n]{0,30}/g) || [];
  check('no CJK in index.html outside prefilled copy', cjk.slice(0, 3).join(' | '), '');

  const figs = fs.readdirSync(path.join(DIR, 'figures'));
  for (const f of figs) {
    const s = fs.readFileSync(path.join(DIR, 'figures', f), 'utf8');
    ok(`figures/${f} has zero CJK`, !/[㐀-鿿]/.test(s));
  }
  const dgFiles = figs.filter(f => f.startsWith('dg-'));
  check('ten static SVG diagrams', dgFiles.length, 10);
  const dgSvg = dgFiles.map(f => fs.readFileSync(path.join(DIR, 'figures', f), 'utf8')).join('');
  const raw = [...dgSvg.matchAll(/<text [^>]*>([^<]+)<\/text>/g)].map(m => m[1]);
  const neutral = s => /^(C\d'?)$/.test(s);
  ok('literal diagram text is only neutral node IDs C0..C4', raw.every(neutral), raw.filter(s => !neutral(s)).join(' | '));
  ok('every diagram <text> has explicit x, y, font-size >= 14, no transform',
    [...dgSvg.matchAll(/<text ([^>]*)>/g)].every(m => /\bx="/.test(m[1]) && /\by="/.test(m[1]) && !/\btransform=/.test(m[1]) && +(m[1].match(/font-size="([\d.]+)"/) || [0, 0])[1] >= 14));
  ok('pinned Git 2.56.0 appears in hero note', /2\.56\.0/.test(Z['hero.note']) && /2\.56\.0/.test(E['hero.note']));
}

/* ── 11. REGISTRY.json parity & collision checks ── */
{
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry title.zh = hero.title', R.title.zh, Z['hero.title']);
  check('registry title.en = en hero.title', R.title.en, E['hero.title']);
  check('registry desc.zh = doc.desc', R.desc.zh, Z['doc.desc']);
  check('registry desc.en = en doc.desc', R.desc.en, E['doc.desc']);
  check('registry path/category/subtopic', [R.category, R.subtopic, R.path].join(), 'computing,software,computing/software/how-git-stores-history/');
  for (const c of R.concepts) {
    ok(`concept ${c.id} starts with git-`, c.id.startsWith('git-'));
    ok(`concept ${c.id} anchor ${c.anchor} exists`, html.includes(`id="${c.anchor.slice(1)}"`));
  }
  const sq = s => s.normalize('NFKC').toLowerCase().replace(/[\s\-‐-―_·・'’]/gu, '');
  const all = R.concepts.flatMap(c => [...new Set([...c.aliases.zh, ...c.aliases.en].map(sq))]);
  check('no alias shared across two concepts on this page', all.filter((a, i) => all.indexOf(a) !== i).join(), '');
  check('no reserved bare sibling keywords in aliases', all.filter(a => ['哈希', 'hashfunction', 'git'].includes(a)).join(), '');
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
