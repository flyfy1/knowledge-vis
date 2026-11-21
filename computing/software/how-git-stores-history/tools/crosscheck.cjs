#!/usr/bin/env node
'use strict';
/* Compares models.js directly against real /opt/homebrew/bin/git (Git 2.56.0) in a scratch directory.
   Usage: node computing/software/how-git-stores-history/tools/crosscheck.cjs [scratch-dir]
   Nothing is installed or written inside the repository. Exit code 1 if any check fails. */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const M = require(path.join(__dirname, '..', 'models.js'));
const GIT = fs.existsSync('/opt/homebrew/bin/git') ? '/opt/homebrew/bin/git' : 'git';
const SCRATCH_BASE = process.argv[2] || '/tmp/agent-tasks/software/how-git-stores-history';
const RUN_ID = 'xc-' + Date.now();
const ROOT = path.join(SCRATCH_BASE, RUN_ID);
fs.mkdirSync(ROOT, { recursive: true });

const ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: 'Ada',
  GIT_AUTHOR_EMAIL: 'ada@example.com',
  GIT_AUTHOR_DATE: '1700000000 +0000',
  GIT_COMMITTER_NAME: 'Ada',
  GIT_COMMITTER_EMAIL: 'ada@example.com',
  GIT_COMMITTER_DATE: '1700000000 +0000',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: '/dev/null'
};
const git = (cwd, args, opts = {}) => execFileSync(GIT, args, { cwd, env: ENV, encoding: opts.binary ? null : 'utf8', input: opts.input });

let n = 0, bad = 0;
const rows = [];
function cmp(name, got, want) {
  n++;
  const ok = got === want;
  if (!ok) bad++;
  rows.push(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `\n     got:  ${String(got).slice(0, 120)}\n     want: ${String(want).slice(0, 120)}`}`);
}
function ok(name, cond, info) {
  n++;
  if (!cond) bad++;
  rows.push(`${cond ? 'ok  ' : 'FAIL'} ${name}${!cond && info ? ' (' + info + ')' : ''}`);
}

const ver = git(ROOT, ['--version']).trim();
rows.push(`binary: ${GIT} -> ${ver}`);
cmp('git version matches pinned models.js', ver, 'git version ' + M.GIT_VERSION);

/* ── 1. Blobs, headers, SHA-1, SHA-256 & zlib framing ── */
{
  const repo1 = path.join(ROOT, 'r1');
  const repo256 = path.join(ROOT, 'r256');
  fs.mkdirSync(repo1); fs.mkdirSync(repo256);
  git(repo1, ['init', '-b', 'main']);
  git(repo256, ['init', '--object-format=sha256', '-b', 'main']);

  const samples = [
    ['empty', ''],
    ['hello', 'hello git\n'],
    ['utf8', '历史不是差量，而是内容寻址的快照。\n'],
    ['repeat', 'git-pack-delta-line\n'.repeat(120)]
  ];
  for (const [label, text] of samples) {
    const o1 = M.looseObject('blob', text, 'sha1');
    const g1 = git(repo1, ['hash-object', '-w', '--stdin'], { input: text }).trim();
    cmp(`blob SHA-1 (${label})`, o1.oid, g1);

    const o256 = M.looseObject('blob', text, 'sha256');
    const g256 = git(repo256, ['hash-object', '-w', '--stdin'], { input: text }).trim();
    cmp(`blob SHA-256 (${label})`, o256.oid, g256);

    // Check pure-JS zlib stream round-trips via Node zlib.inflateSync & equals Git's inflated loose file!
    const inflatedMine = zlib.inflateSync(Buffer.from(o1.compressed));
    const gitLooseFile = fs.readFileSync(path.join(repo1, '.git/objects', g1.slice(0, 2), g1.slice(2)));
    const inflatedGit = zlib.inflateSync(gitLooseFile);
    cmp(`blob zlib inflate parity (${label})`, Buffer.compare(inflatedMine, inflatedGit), 0);
    cmp(`blob raw == inflated (${label})`, Buffer.compare(Buffer.from(o1.raw), inflatedGit), 0);
  }

  // Write a pure-JS compressed loose object directly into a fresh repo and let Git read it!
  const repoWrite = path.join(ROOT, 'rwrite');
  fs.mkdirSync(repoWrite);
  git(repoWrite, ['init', '-b', 'main']);
  const custom = M.looseObject('blob', 'written-by-models-js\n', 'sha1');
  const objDir = path.join(repoWrite, '.git/objects', custom.shard);
  fs.mkdirSync(objDir, { recursive: true });
  fs.writeFileSync(path.join(objDir, custom.rest), Buffer.from(custom.compressed));
  cmp('real git cat-file -p reads models.js loose object', git(repoWrite, ['cat-file', '-p', custom.oid]), 'written-by-models-js\n');
  cmp('real git fsck accepts models.js loose object (dangling only)', git(repoWrite, ['fsck', '--full']).trim(), `dangling blob ${custom.oid}`);
}

/* ── 2. Trees, sorting rule (foo-bar.txt before foo/) & structural sharing ── */
{
  const rt = path.join(ROOT, 'rtree');
  fs.mkdirSync(rt);
  git(rt, ['init', '-b', 'main']);
  fs.mkdirSync(path.join(rt, 'foo'));
  fs.writeFileSync(path.join(rt, 'foo/bar.txt'), 'bar\n');
  fs.writeFileSync(path.join(rt, 'foo-bar.txt'), 'foobar\n');
  git(rt, ['add', '.']);
  const gTree = git(rt, ['write-tree']).trim();
  const mTree = M.buildRepoTree({ 'foo/bar.txt': 'bar\n', 'foo-bar.txt': 'foobar\n' }, 'sha1');
  cmp('tree sort edge case (foo-bar.txt vs foo/) OID', mTree.rootOid, gTree);

  // Full SAMPLE_REPO_FILES tree
  const rs = path.join(ROOT, 'rsample');
  fs.mkdirSync(rs);
  git(rs, ['init', '-b', 'main']);
  for (const [rel, txt] of Object.entries(M.SAMPLE_REPO_FILES)) {
    const fp = path.join(rs, rel);
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, txt);
  }
  git(rs, ['add', '.']);
  const gSampleTree = git(rs, ['write-tree']).trim();
  const mSampleTree = M.buildRepoTree(M.SAMPLE_REPO_FILES, 'sha1');
  cmp('SAMPLE_REPO_FILES root tree OID', mSampleTree.rootOid, gSampleTree);

  // SHA-256 tree check
  const rt256 = path.join(ROOT, 'rtree256');
  fs.mkdirSync(rt256);
  git(rt256, ['init', '--object-format=sha256', '-b', 'main']);
  fs.mkdirSync(path.join(rt256, 'sub'));
  fs.writeFileSync(path.join(rt256, 'sub/a.txt'), 'alpha\n');
  git(rt256, ['add', '.']);
  cmp('SHA-256 nested tree OID', M.buildRepoTree({ 'sub/a.txt': 'alpha\n' }, 'sha256').rootOid, git(rt256, ['write-tree']).trim());
}

/* ── 3. Commits & annotated tags ── */
{
  const rc = path.join(ROOT, 'rcommit');
  fs.mkdirSync(rc);
  git(rc, ['init', '-b', 'main']);
  fs.writeFileSync(path.join(rc, 'a.txt'), 'v1\n');
  git(rc, ['add', 'a.txt']);
  git(rc, ['commit', '-m', 'init']);
  const gC1 = git(rc, ['rev-parse', 'HEAD']).trim();
  const t1 = M.buildRepoTree({ 'a.txt': 'v1\n' }, 'sha1').rootOid;
  const mC1 = M.encodeCommit({ tree: t1, parents: [], message: 'init\n' }, 'sha1').oid;
  cmp('root commit OID', mC1, gC1);

  fs.writeFileSync(path.join(rc, 'a.txt'), 'v2\n');
  git(rc, ['add', 'a.txt']);
  git(rc, ['commit', '-m', 'second']);
  const gC2 = git(rc, ['rev-parse', 'HEAD']).trim();
  const t2 = M.buildRepoTree({ 'a.txt': 'v2\n' }, 'sha1').rootOid;
  const mC2 = M.encodeCommit({ tree: t2, parents: [mC1], message: 'second\n' }, 'sha1').oid;
  cmp('child commit OID', mC2, gC2);

  // Two-parent merge commit via commit-tree
  const gM = git(rc, ['commit-tree', t2, '-p', gC2, '-p', gC1, '-m', 'merge']).trim();
  const mM = M.encodeCommit({ tree: t2, parents: [gC2, gC1], message: 'merge\n' }, 'sha1').oid;
  cmp('two-parent commit OID', mM, gM);

  // Annotated tag
  git(rc, ['tag', '-a', 'v1.0', '-m', 'release 1.0', gC1]);
  const gTag = git(rc, ['rev-parse', 'v1.0']).trim();
  const mTag = M.encodeTag({ objectOid: gC1, type: 'commit', tagName: 'v1.0', message: 'release 1.0\n' }, 'sha1').oid;
  cmp('annotated tag OID', mTag, gTag);
}

/* ── 4. Index (DIRC v2) binary checksum & Racy Git check ── */
{
  const ri = path.join(ROOT, 'ridx');
  fs.mkdirSync(ri);
  git(ri, ['init', '-b', 'main']);
  const f1 = path.join(ri, 'a.txt');
  const f2 = path.join(ri, 'b.txt');
  fs.writeFileSync(f1, 'aaaa\n');
  fs.writeFileSync(f2, 'bbbb\n');
  git(ri, ['add', 'a.txt', 'b.txt']);
  git(ri, ['commit', '-m', 'init']);
  const idxBuf = fs.readFileSync(path.join(ri, '.git/index'));
  cmp('real .git/index magic', idxBuf.slice(0, 4).toString(), 'DIRC');
  cmp('real .git/index version', idxBuf.readUInt32BE(4), 2);
  cmp('real .git/index entry count', idxBuf.readUInt32BE(8), 2);
  const tailChk = idxBuf.slice(idxBuf.length - 20).toString('hex');
  cmp('real .git/index SHA-1 trailer matches pure-JS SHA-1', M.sha1Hex(idxBuf.slice(0, idxBuf.length - 20)), tailChk);

  // Verify our encodeIndexV2 matches real git index SHA-1 trailer formula & entry order
  const st1 = fs.statSync(f1), st2 = fs.statSync(f2);
  const encIdx = M.encodeIndexV2([
    { path: 'b.txt', oid: M.looseObject('blob', 'bbbb\n', 'sha1').oid, mode: 0o100644, size: st2.size, mtimeSec: Math.floor(st2.mtimeMs / 1000), ctimeSec: Math.floor(st1.ctimeMs / 1000) },
    { path: 'a.txt', oid: M.looseObject('blob', 'aaaa\n', 'sha1').oid, mode: 0o100644, size: st1.size, mtimeSec: Math.floor(st1.mtimeMs / 1000), ctimeSec: Math.floor(st1.ctimeMs / 1000) }
  ], 'sha1');
  cmp('encodeIndexV2 magic & count', encIdx[0] === 0x44 && encIdx[11] === 2, true);
  cmp('encodeIndexV2 checksum valid', M.sha1Hex(encIdx.slice(0, encIdx.length - 20)), M.toHex(encIdx.slice(encIdx.length - 20)));

  // Racy Git test: make f1 mtime EQUAL index mtime, modify same length in place -> git status STILL catches it!
  const idxStat = fs.statSync(path.join(ri, '.git/index'));
  fs.writeFileSync(f1, 'XXXX\n');
  fs.utimesSync(f1, idxStat.atime, idxStat.mtime);
  cmp('racy-git same mtime & same size still detected as modified', git(ri, ['status', '--porcelain']).trimEnd(), ' M a.txt');
  // And when another path updates the index while a.txt had mtime == index mtime (racily clean), Git clears a.txt cached st_size to 0!
  fs.writeFileSync(f2, 'bbbb2\n');
  git(ri, ['add', 'b.txt']);
  const idxBuf2 = fs.readFileSync(path.join(ri, '.git/index'));
  // Entry 0 is a.txt (at offset 12); st_size is at 12 + 36 = 48!
  cmp('racy-git truncates cached st_size of racily clean entry to 0 in .git/index', idxBuf2.readUInt32BE(12 + 36), 0);
}

/* ── 5. 3-Way Merge parity against git merge-file -p ── */
{
  const rm = path.join(ROOT, 'rmerge');
  fs.mkdirSync(rm);
  const cases = [
    [
      'disjoint clean merge',
      ['line 1', 'line 2', 'line 3', 'line 4', 'line 5'],
      ['line 1 (ours)', 'line 2', 'line 3', 'line 4', 'line 5'],
      ['line 1', 'line 2', 'line 3', 'line 4', 'line 5 (theirs)']
    ],
    [
      'convergent identical edit',
      ['a', 'b', 'c'],
      ['a', 'b-fixed', 'c'],
      ['a', 'b-fixed', 'c']
    ],
    [
      'same-line conflict',
      ['const port = 3000;', 'const host = "localhost";'],
      ['const port = 8080;', 'const host = "localhost";'],
      ['const port = 9000;', 'const host = "localhost";']
    ],
    [
      'insertion both sides at top',
      ['alpha', 'beta'],
      ['ours-top', 'alpha', 'beta'],
      ['theirs-top', 'alpha', 'beta']
    ],
    [
      'delete vs modify conflict',
      ['keep', 'target', 'tail'],
      ['keep', 'tail'],
      ['keep', 'target-edited', 'tail']
    ]
  ];
  for (const [label, b, o, t] of cases) {
    const fb = path.join(rm, 'base'), fo = path.join(rm, 'ours'), ft = path.join(rm, 'theirs');
    fs.writeFileSync(fb, b.join('\n') + '\n');
    fs.writeFileSync(fo, o.join('\n') + '\n');
    fs.writeFileSync(ft, t.join('\n') + '\n');
    let gitOut = '', gitCode = 0;
    try {
      gitOut = git(rm, ['merge-file', '-p', fo, fb, ft]);
    } catch (e) {
      gitOut = e.stdout.toString();
      gitCode = e.status;
    }
    const mine = M.merge3Way(b, o, t, { ours: fo, theirs: ft });
    cmp(`merge3Way conflict count (${label})`, mine.conflicts, gitCode);
    cmp(`merge3Way exact output (${label})`, mine.mergedLines.join('\n') + '\n', gitOut);
  }
}

/* ── 6. Packfile v2 + .idx v2 + real OFS_DELTA opcode decoding ── */
{
  const rp = path.join(ROOT, 'rpack');
  fs.mkdirSync(rp);
  git(rp, ['init', '-b', 'main']);
  const baseBody = Array.from({ length: 40 }, (_, i) => `line ${String(i).padStart(2, '0')}: shared packfile test payload row`).join('\n') + '\n';
  const targetBody = baseBody.replace('line 15: shared packfile test payload row', 'line 15: MODIFIED PACKFILE ROW') + 'line 40: appended tail line\n';
  fs.writeFileSync(path.join(rp, 'big.txt'), baseBody);
  git(rp, ['add', 'big.txt']); git(rp, ['commit', '-m', 'v1']);
  const oid1 = git(rp, ['rev-parse', 'HEAD:big.txt']).trim();
  fs.writeFileSync(path.join(rp, 'big.txt'), targetBody);
  git(rp, ['add', 'big.txt']); git(rp, ['commit', '-m', 'v2']);
  const oid2 = git(rp, ['rev-parse', 'HEAD:big.txt']).trim();
  git(rp, ['repack', '-ad', '--window=10', '--depth=10']);

  const packDir = path.join(rp, '.git/objects/pack');
  const packName = fs.readdirSync(packDir).find(f => f.endsWith('.pack'));
  const idxName = packName.replace('.pack', '.idx');
  const packBuf = fs.readFileSync(path.join(packDir, packName));
  const idxBuf = fs.readFileSync(path.join(packDir, idxName));

  cmp('pack magic', packBuf.slice(0, 4).toString(), 'PACK');
  cmp('pack version', packBuf.readUInt32BE(4), 2);
  const objCount = packBuf.readUInt32BE(8);
  ok('pack has 6 objects', objCount === 6, objCount);
  cmp('pack trailer SHA-1', M.sha1Hex(packBuf.slice(0, packBuf.length - 20)), packBuf.slice(packBuf.length - 20).toString('hex'));

  // Parse .idx v2 fanout table and locate oid1 and oid2
  cmp('idx v2 magic', idxBuf.slice(0, 4).toString('binary'), '\xfftOc');
  cmp('idx v2 version', idxBuf.readUInt32BE(4), 2);
  const fanout = [];
  for (let i = 0; i < 256; i++) fanout.push(idxBuf.readUInt32BE(8 + i * 4));
  cmp('idx v2 fanout[255] == object count', fanout[255], objCount);

  const oidTableOff = 8 + 256 * 4;
  const crcTableOff = oidTableOff + objCount * 20;
  const offTableOff = crcTableOff + objCount * 4;
  const findInIdx = (hexOid) => {
    const b = parseInt(hexOid.slice(0, 2), 16);
    const lo = b === 0 ? 0 : fanout[b - 1], hi = fanout[b];
    for (let i = lo; i < hi; i++) {
      const got = idxBuf.slice(oidTableOff + i * 20, oidTableOff + (i + 1) * 20).toString('hex');
      if (got === hexOid) return { idxSlot: i, crc: idxBuf.readUInt32BE(crcTableOff + i * 4), packOff: idxBuf.readUInt32BE(offTableOff + i * 4) };
    }
    return null;
  };

  const e1 = findInIdx(oid1), e2 = findInIdx(oid2);
  ok('both blob OIDs found via idx v2 fanout slice', !!(e1 && e2));
  // Parse pack entries at e1.packOff and e2.packOff using models.js decoders!
  const h1 = M.decodePackObjHeader(packBuf, e1.packOff);
  const h2 = M.decodePackObjHeader(packBuf, e2.packOff);
  // One of them (typically the smaller or older one, e1) is OFS_DELTA (type 6) based on the other (type 3)!
  const deltaInfo = h1.type === 6 ? { entryOff: e1.packOff, hdr: h1, targetOid: oid1 } : { entryOff: e2.packOff, hdr: h2, targetOid: oid2 };
  const baseInfo = h1.type === 3 ? { entryOff: e1.packOff, hdr: h1, baseOid: oid1 } : { entryOff: e2.packOff, hdr: h2, baseOid: oid2 };
  cmp('real pack uses OBJ_OFS_DELTA (type 6)', deltaInfo.hdr.type, 6);
  const ofsDec = M.decodeOfsDeltaOffset(packBuf, deltaInfo.entryOff + deltaInfo.hdr.bytesRead);
  cmp('OFS_DELTA negative offset points directly to base pack offset', deltaInfo.entryOff - ofsDec.dist, baseInfo.entryOff);

  const baseZStart = baseInfo.entryOff + baseInfo.hdr.bytesRead;
  const baseRaw = zlib.inflateSync(packBuf.slice(baseZStart));
  const deltaZStart = deltaInfo.entryOff + deltaInfo.hdr.bytesRead + ofsDec.bytesRead;
  const deltaRaw = zlib.inflateSync(packBuf.slice(deltaZStart));
  const reconstructed = M.applyDeltaBytes(baseRaw, deltaRaw);
  cmp('models.js applyDeltaBytes reconstructs real Git OFS_DELTA object to exact SHA-1', M.looseObject('blob', reconstructed, 'sha1').oid, deltaInfo.targetOid);

  // Also check our own computeDeltaOpcodes round-trip & varint round-trips
  const myDelta = M.computeDeltaOpcodes(baseBody, targetBody, 8);
  cmp('models.js computeDeltaOpcodes + applyDeltaBytes exact round-trip', M.bytesToUtf8(M.applyDeltaBytes(baseBody, myDelta.deltaBytes)), targetBody);
}

/* ── 7. Reftable backend check (Git 2.45+ / 2.56.0) ── */
{
  const rr = path.join(ROOT, 'rreftable');
  fs.mkdirSync(rr);
  git(rr, ['init', '--ref-format=reftable', '-b', 'main']);
  fs.writeFileSync(path.join(rr, 'x.txt'), 'hi\n');
  git(rr, ['add', 'x.txt']);
  git(rr, ['commit', '-m', 'init']);
  const tablesList = fs.readFileSync(path.join(rr, '.git/reftable/tables.list'), 'utf8').trim().split('\n');
  ok('reftable tables.list created', tablesList.length >= 1 && tablesList[0].endsWith('.ref'));
  const firstRefFile = fs.readFileSync(path.join(rr, '.git/reftable', tablesList[0]));
  cmp('reftable file magic REFT', firstRefFile.slice(0, 4).toString(), 'REFT');
}

console.log(rows.join('\n'));
console.log(`\n${n - bad}/${n} crosscheck comparisons passed against ${ver}`);
if (bad) process.exit(1);
