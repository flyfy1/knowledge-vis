'use strict';
// Unit tests for models.js, bindings.cjs, copy parity, language hygiene, SVG structure, and REGISTRY.json.
// Numbers pinned against live Apple Clang 21.0.0 (/usr/bin/clang) via tools/crosscheck.cjs.
// Run: node computing/software/how-llvm-compiles-your-code/tests/models.cjs
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
function check(name, got, want) {
  n++;
  if (got !== want) { fails++; console.error(`FAIL ${name}: got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`); }
}
function ok(name, cond, info) {
  n++;
  if (!cond) { fails++; console.error(`FAIL ${name}${info ? ': ' + info : ''}`); }
}

/* ── 1. Host release & ch1 3-phase architecture ── */
{
  check('host release is LLVM 21 / Apple clang 21.0.0', M.HOST_RELEASE.llvmBase, 'LLVM 21');
  const a = M.archScale({ frontends: 6, backends: 5, passes: 10 });
  check('6x5 monolithic pairs = 30 vs LLVM 11', [a.monoPairs, a.llvmEdges].join(), '30,11');
  check('monolithic components = 330 vs LLVM 21', [a.monoComponents, a.llvmComponents].join(), '330,21');
  check('1x1 edge case: 1 pair vs 2 edges', [M.archScale({ frontends: 1, backends: 1, passes: 1 }).monoComponents, M.archScale({ frontends: 1, backends: 1, passes: 1 }).llvmComponents].join(), '2,3');
}

/* ── 2. Ch2: -O0 alloca stack vs -O2 registers ── */
{
  const s0 = M.simAlloca({ snippet: 'sum_array', iters: 8, promoted: false });
  const s2 = M.simAlloca({ snippet: 'sum_array', iters: 8, promoted: true });
  check('sum_array -O0 allocas & stack bytes', [s0.allocas, s0.stackBytes].join(), '4,20');
  check('sum_array -O0 8 iters total mem ops = 79 (71 stack + 8 array)', [s0.stackMemOps, s0.arrayLoads, s0.totalMemOps].join(), '71,8,79');
  check('sum_array -O2 8 iters total mem ops = 8', [s2.allocas, s2.stackMemOps, s2.totalMemOps].join(), '0,0,8');
  const p0 = M.simAlloca({ snippet: 'pick_phi', iters: 8, promoted: false });
  check('pick_phi ignores loop iter slider (stays 1)', p0.iters, 1);
}

/* ── 3. Ch3: SSA & Dominance Frontier phi engine ── */
{
  const d = M.runMem2Reg({ preset: 'diamond', runPass: true });
  check('diamond DF = [B3], 1 phi, 0 stack mem ops', [d.phiBlocks.join(','), d.phiCount, d.afterMemOps].join('|'), 'B3|1|0');
  const lp = M.runMem2Reg({ preset: 'loop', runPass: true });
  check('loop DF of B2 = [B1] (header)', [lp.phiBlocks.join(','), lp.phiCount].join('|'), 'B1|1');
  const off = M.runMem2Reg({ preset: 'diamond', runPass: false });
  check('mem2reg disabled retains stack ops & 0 phis', [off.phiCount, off.afterMemOps].join(), '0,7');
}

/* ── 4. Ch4: Fixed-point pass pipeline ── */
{
  const r0 = M.stepPipeline({ preset: 'dead_branch', round: 0 });
  const rEnd = M.stepPipeline({ preset: 'dead_branch', round: 3 });
  check('dead_branch shrinks 11 -> 3 ops in 3 rounds', [r0.currentOps, rEnd.currentOps, rEnd.fixedPoint].join(), '11,3,true');
  const inl = M.stepPipeline({ preset: 'inline_fold', round: 2 });
  check('inline_fold converges to ret i32 42 (1 op)', [inl.currentOps, inl.lines[0].text, inl.fixedPoint].join('|'), '1|ret i32 42|true');
}

/* ── 5. Ch5: LICM + aliasing + SIMD vectorization ── */
{
  const rest = M.loopOptSim({ n: 20, aliasMode: 'restrict', vf: 4, licm: true });
  check('restrict n=20 vf=4: 5 vec iters, 0 tail, 0 reloads, 17 ops', [rest.vecIters, rest.tailIters, rest.invariantReloadsInLoop, rest.totalOps, rest.needsRuntimeCheck].join(), '5,0,0,17,false');
  const unk = M.loopOptSim({ n: 21, aliasMode: 'unknown', vf: 4, licm: true, aliasOverlap: false });
  check('unknown alias needs guard, 5 vec + 1 tail', [unk.needsRuntimeCheck, unk.vecIters, unk.tailIters, unk.totalOps].join(), 'true,5,1,22');
  const fb = M.loopOptSim({ n: 20, aliasMode: 'unknown', vf: 4, licm: true, aliasOverlap: true });
  check('runtime overlap falls back to scalar 20 reloads & 102 ops', [fb.runtimeFallsBack, fb.vectorized, fb.invariantReloadsInLoop, fb.totalOps].join(), 'true,false,20,102');
}

/* ── 6. Ch6: UB nsw poison vs wrapv ── */
{
  const bug = M.ubSim({ scenario: 'overflow', mode: 'nsw', opt: 'O2', x: M.INT32_MAX });
  check('INT_MAX + 1 hw wraps to INT_MIN (0), -O2 nsw returns 1 (diverges)', [bug.hwWrapped, bug.hwResult, bug.compiledResult, bug.mismatch, bug.poison].join(), `${M.INT32_MIN},0,1,true,true`);
  const wrap = M.ubSim({ scenario: 'overflow', mode: 'wrapv', opt: 'O2', x: M.INT32_MAX });
  check('-O2 -fwrapv matches hardware wrap (0) via icmp ne', [wrap.compiledResult, wrap.mismatch, wrap.o2Ir.includes('icmp ne i32 %x, 2147483647')].join(), '0,false,true');
  const nullBug = M.ubSim({ scenario: 'null', mode: 'nsw', opt: 'O2', pIsNull: true });
  check('deref before null check eliminates guard and diverges on NULL', [nullBug.branchEliminated, nullBug.mismatch].join(), 'true,true');
}

/* ── 7. Ch7: Instruction Selection (ARM64 vs x86_64) ── */
{
  check('ARM64 FMA fused = 1 op (madd) vs unfused = 2', [M.iselSim({ preset: 'fma', arch: 'arm64', fuse: true }).insnCount, M.iselSim({ preset: 'fma', arch: 'arm64', fuse: false }).insnCount].join(), '1,2');
  check('x86_64 FMA fused = 2 ops (imull + leal)', M.iselSim({ preset: 'fma', arch: 'x86_64', fuse: true }).insnCount, 2);
  check('x86_64 scaleConst fused = 1 op (leal)', M.iselSim({ preset: 'scaleConst', arch: 'x86_64', fuse: true }).insnCount, 1);
  check('ARM64 shiftAdd fused = 1 op (add lsl #2)', M.iselSim({ preset: 'shiftAdd', arch: 'arm64', fuse: true }).insnCount, 1);
}

/* ── 8. Ch8: Register Allocation (Chaitin-Briggs vs Linear Scan) ── */
{
  const c3 = M.regAllocSim({ scenario: 'chain', K: 3, algo: 'graph' });
  const c4 = M.regAllocSim({ scenario: 'chain', K: 4, algo: 'graph' });
  check('chain maxLive = 4: K=4 zero spills, K=3 spills > 0', [c4.maxLive, c4.spillCount, c3.spillCount > 0].join(), '4,0,true');
  const p2 = M.regAllocSim({ scenario: 'pressure', K: 2, algo: 'linear' });
  check('pressure K=2 linear scan has multiple spills and >0 spill insns', [p2.spillCount > 0, p2.spillInsns > p2.spillCount].join(), 'true,true');
}

/* ── 9. Ch9: ThinLTO vs Full LTO vs Separate ── */
{
  const none = M.ltoSim({ mode: 'none', tus: 16, threshold: 30, pgo: true });
  const thin = M.ltoSim({ mode: 'thin', tus: 16, threshold: 30, pgo: true });
  const full = M.ltoSim({ mode: 'full', tus: 16, threshold: 30, pgo: true });
  check('separate -O2 inlines 0 of 80 cross-TU calls', [none.inlinedSites, none.remainingCalls, none.foldedConst42].join(), '0,80,false');
  check('ThinLTO 16 TUs uses 8 workers, folds 42, low memory vs Full LTO', [thin.workers, thin.foldedConst42, thin.peakMemPerWorkerMB < 5, full.workers, full.peakMemPerWorkerMB].join(), '8,true,true,1,28.8');
}

/* ── 10. Bindings: every prose number ── */
{
  const want = {
    'ch1.frontends': '6', 'ch1.backends': '5', 'ch1.monoPairs': '30', 'ch1.llvmEdges': '11',
    'ch1.monoPasses': '300', 'ch1.llvmPasses': '10',
    'ch2.allocas': '4', 'ch2.stackBytes': '20', 'ch2.o0Mem': '79', 'ch2.o2Mem': '8', 'ch2.savedMem': '71',
    'ch3.beforeMem': '7', 'ch3.afterMem': '0', 'ch3.phiCount': '1',
    'ch4.startOps': '11', 'ch4.endOps': '3', 'ch4.rounds': '3',
    'ch5.unoptOps': '100', 'ch5.vecOps': '17', 'ch5.vecIters': '5',
    'ch6.intMax': '2,147,483,647', 'ch6.intMin': '−2,147,483,648',
    'ch7.armFma': '1', 'ch7.x86Fma': '2',
    'ch8.maxLive': '4', 'ch8.spillsK3': '1', 'ch8.spillsK4': '0', 'ch8.spillInsnsK3': '5',
    'ch9.noLtoCalls': '80', 'ch9.thinMem': '2.5', 'ch9.fullMem': '28.8', 'ch9.noLtoMain': '3', 'ch9.thinLtoMain': '2',
  };
  check('binding names match exact set', Object.keys(B).sort().join(), Object.keys(want).sort().join());
  for (const k in want) check('binding ' + k, B[k], want[k]);
}

/* ── 11. Copy, parity, dynamic keys & language hygiene ── */
{
  const keys = [...app.matchAll(/\bt\('([\w.]+)'/g)].map(m => m[1]).filter(k => !k.endsWith('.'));
  const missing = [...new Set(keys)].filter(k => Z[k] == null);
  check('every literal key app.js reads exists in copy.zh.js', missing.join(), '');
  const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'page.json'), 'utf8'));
  const dyn = Object.entries(PJ.dynamicKeys).flatMap(([p, vs]) => vs.map(v => p + '.' + v));
  check('all dynamic keys exist in copy.zh.js', dyn.filter(k => Z[k] == null).join(), '');
  check('all dynamic keys exist in copy.en.js', dyn.filter(k => E[k] == null).join(), '');
  check('zh and en have identical keys', Object.keys(Z).sort().join(), Object.keys(E).sort().join());
  const ph = s => (String(s).match(/\{[a-zA-Z_]\w*\}/g) || []).sort().join();
  check('runtime placeholders match in zh and en', Object.keys(Z).filter(k => ph(Z[k]) !== ph(E[k])).join(), '');
  check('English is complete (no stub flag)', [String((PJ.languages || {}).en), /data-lang-en="stub"/.test(html)].join(), 'undefined,false');
  check('no CJK in copy.en.js', Object.keys(E).filter(k => /[㐀-鿿]/.test(E[k])).join(), '');
  check('page.json draft has no status field yet', String(PJ.status), 'undefined');

  const h = unprefill(html, Z)
    .replace(/<div[^>]*id="langToggle"[\s\S]*?<\/div>/, '')
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta[^>]*>/g, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  const cjk = h.match(/[^\n]{0,30}[㐀-鿿][^\n]{0,30}/g) || [];
  check('no CJK in index.html outside pre-filled copy', cjk.slice(0, 3).join(' | '), '');

  for (const f of fs.readdirSync(path.join(DIR, 'figures'))) {
    const s = fs.readFileSync(path.join(DIR, 'figures', f), 'utf8');
    ok(`figures/${f} has zero CJK`, !/[㐀-鿿]/.test(s));
  }
  const dgs = fs.readdirSync(path.join(DIR, 'figures')).filter(f => f.startsWith('dg-'));
  check('nine static SVG diagrams', dgs.length, 9);
  const svgTexts = [...dgs.map(f => fs.readFileSync(path.join(DIR, 'figures', f), 'utf8')).join('').matchAll(/<text ([^>]*)>([^<]*)<\/text>/g)];
  ok('every SVG <text> has x, y, font-size >= 14, no transform, and no {placeholder}', svgTexts.every(m => /\bx="/.test(m[1]) && /\by="/.test(m[1]) && +(m[1].match(/font-size="([\d.]+)"/) || [0, 0])[1] >= 14 && !/transform=/.test(m[1]) && !/\{\w+\}/.test(m[2])));
  ok('pinned compiler version in page copy', /21\.0\.0/.test(Object.values(Z).join(' ')) && /LLVM 21/.test(Object.values(Z).join(' ')));
}

/* ── 12. REGISTRY.json parity & alias uniqueness ── */
{
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry title.zh = hero.title', R.title.zh, Z['hero.title']);
  check('registry title.en = en hero.title', R.title.en, E['hero.title']);
  check('registry desc.zh = doc.desc', R.desc.zh, Z['doc.desc']);
  check('registry desc.en = en doc.desc', R.desc.en, E['doc.desc']);
  check('category/subtopic/path', [R.category, R.subtopic, R.path].join(), 'computing,software,computing/software/how-llvm-compiles-your-code/');
  for (const c of R.concepts) {
    ok(`concept ${c.id} prefixed llvm-`, c.id.startsWith('llvm-'));
    ok(`concept ${c.id} anchor ${c.anchor} exists`, html.includes(`id="${c.anchor.slice(1)}"`));
  }
  const sq = s => s.normalize('NFKC').toLowerCase().replace(/[\s\-‐-―_·・'’]/gu, '');
  const all = R.concepts.flatMap(c => [...new Set([...c.aliases.zh, ...c.aliases.en].map(sq))]);
  check('no duplicate aliases within REGISTRY.json', all.filter((a, i) => all.indexOf(a) !== i).join(), '');
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
