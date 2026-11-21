'use strict';
// Unit & parity checks for how-v8-runs-javascript (dependency-free).
// Run: node computing/software/how-v8-runs-javascript/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const ROOT = path.join(DIR, '..', '..', '..');
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
function check(name, got, want) {
  n++;
  if (got !== want) { fails++; console.error(`FAIL ${name}: got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`); }
}
function ok(name, cond, info) {
  n++;
  if (!cond) { fails++; console.error(`FAIL ${name}${info ? ': ' + info : ''}`); }
}

/* ── 1. Pipeline model (ch1) ── */
{
  const cold = M.simPipeline({ calls: 5, bytecodeBytes: 120, lazyPreparse: true });
  check('ch1 cold tier is ignition', cold.tier, 'ignition');
  check('ch1 cold mode', cold.mode, 'cold');
  ok('ch1 cold tiered faster than upfront TurboFan', cold.tieredMs < cold.alwaysTurboMs);
  ok('ch1 lazy preparse saves > 50%', cold.parseSavedPct >= 70);

  const warm = M.simPipeline({ calls: 50, bytecodeBytes: 121, lazyPreparse: true });
  check('ch1 50 calls reaches sparkplug', [warm.tier, warm.mode].join(), 'sparkplug,warm');

  const hot = M.simPipeline({ calls: 450, bytecodeBytes: 121, lazyPreparse: true });
  check('ch1 450 calls reaches maglev', [hot.tier, hot.mode].join(), 'maglev,hot');

  const top = M.simPipeline({ calls: 3500, bytecodeBytes: 121, lazyPreparse: true });
  check('ch1 3500 calls reaches turbofan', [top.tier, top.mode].join(), 'turbofan,top');
  ok('ch1 top tiered beats ignitionOnly', top.tieredMs < top.ignitionOnlyMs);
}

/* ── 2. Pointer tagging & Smi boundaries (ch2) ── */
{
  const c1 = M.inspectValue(1073741823, 'compressed');
  const c2 = M.inspectValue(1073741824, 'compressed');
  check('ch2 compressed 2^30-1 is Smi', [c1.isSmi, c1.tagBit, c1.heapBytes, c1.obj2Bytes].join(), 'true,0,0,20');
  check('ch2 compressed 2^30 boxes HeapNumber', [c2.isSmi, c2.tagBit, c2.heapBytes, c2.sayKey].join(), 'false,1,12,heap');

  const f1 = M.inspectValue(2147483647, 'full64');
  const f2 = M.inspectValue(2147483648, 'full64');
  const fHalf = M.inspectValue(0.5, 'full64');
  check('ch2 full64 2^31-1 is Smi', [f1.isSmi, f1.tagBit, f1.heapBytes, f1.obj2Bytes].join(), 'true,0,0,40');
  check('ch2 full64 2^31 boxes HeapNumber (16 B)', [f2.isSmi, f2.tagBit, f2.heapBytes].join(), 'false,1,16');
  check('ch2 full64 0.5 boxes HeapNumber', [fHalf.isSmi, fHalf.kind, fHalf.heapBytes].join(), 'false,HeapNumber,16');
}

/* ── 3. Hidden Classes (Map), Slack & Dictionary (ch3) ── */
{
  const same = M.simMapScenario('same_order');
  const reord = M.simMapScenario('reordered');
  const sl1 = M.simMapScenario('slack_early');
  const sl7 = M.simMapScenario('slack_done');
  const dict = M.simMapScenario('delete_dict');
  check('ch3 same order shares Map', [same.sameMap, same.activeMapId, same.sayKey].join(), 'true,M2,fast');
  check('ch3 reordered forks Map', [reord.sameMap, reord.activeMapId, reord.sayKey].join(), 'false,M4,forked');
  check('ch3 slack tracking shrinks 104->40 B', `${sl1.instanceSize64}/${sl1.inObjectSlots}->${sl7.instanceSize64}/${sl7.inObjectSlots}`, '104/10->40/2');
  check('ch3 delete drops to dictionary', [dict.mode, dict.instanceSize64, dict.sayKey].join(), 'dict,24,dict');
}

/* ── 4. Inline Cache (ch4) ── */
{
  const m = M.simIC(1, 200000), p = M.simIC(4, 200000), g = M.simIC(5, 200000);
  check('ch4 1 shape is MONOMORPHIC', [m.state, m.sayKey].join(), 'MONOMORPHIC,mono');
  check('ch4 4 shapes is POLYMORPHIC', [p.state, p.sayKey, p.slotEntries.length].join(), 'POLYMORPHIC,poly,4');
  check('ch4 5 shapes is MEGAMORPHIC', [g.state, g.sayKey, g.megamorphicFallback].join(), 'MEGAMORPHIC,mega,true');
  ok('ch4 megamorphic slower than monomorphic', g.nsPerAccess > m.nsPerAccess * 1.8);
}

/* ── 5. Ignition bytecode stepper (ch5) ── */
{
  for (const mode of ['smi', 'double', 'string']) {
    let st = M.createBytecodeState(mode);
    check(`ch5 ${mode} starts at pc 0`, [st.pcIdx, st.done, st.sayKey].join(), '0,false,run');
    for (let i = 0; i < 5; i++) st = M.stepBytecodeState(st);
    check(`ch5 ${mode} finishes in 5 steps`, [st.done, st.sayKey].join(), 'true,done');
  }
  let sSmi = M.createBytecodeState('smi');
  for (let i = 0; i < 5; i++) sSmi = M.stepBytecodeState(sSmi);
  check('ch5 smi result 7 and SignedSmall', [sSmi.acc, sSmi.fbv[0]].join(), '7,SignedSmall');
  let sStr = M.createBytecodeState('string');
  for (let i = 0; i < 5; i++) sStr = M.stepBytecodeState(sStr);
  check('ch5 string concat "34"', [sStr.acc, sStr.fbv[0]].join(), '"34",Any (StringConcat)');
}

/* ── 6. Deoptimization tracer (ch6) ── */
{
  const cl = M.simDeoptTrace('clean', true);
  const lt = M.simDeoptTrace('late_map', true);
  const st = M.simDeoptTrace('poly_storm', true);
  const noMag = M.simDeoptTrace('clean', false);
  check('ch6 clean 0 deopts', [cl.deoptCount, cl.sayKey, cl.finalTier].join(), '0,clean,turbofan');
  check('ch6 late_map 1 wrong_map deopt', [lt.deoptCount, lt.bailoutReason, lt.sayKey].join(), '1,wrong_map,deopt');
  check('ch6 poly_storm disables opt', [st.guardStoppedOpt, st.bailoutReason, st.sayKey].join(), 'true,deopt_loop,thrash');
  ok('ch6 disabling Maglev raises clean total time', noMag.totalMs > cl.totalMs);
}

/* ── 7. ElementsKind one-way lattice (ch7) ── */
{
  let s = M.createArrayState();
  check('ch7 init PACKED_SMI', [s.kind, s.packed, s.sayKey].join(), 'PACKED_SMI_ELEMENTS,true,smi');
  s = M.applyArrayOp(s, 'push_double');
  check('ch7 push_double -> PACKED_DOUBLE', [s.kind, s.sayKey].join(), 'PACKED_DOUBLE_ELEMENTS,double');
  s = M.applyArrayOp(s, 'make_hole');
  check('ch7 make_hole -> HOLEY_DOUBLE', [s.kind, s.packed, s.sayKey].join(), 'HOLEY_DOUBLE_ELEMENTS,false,holey');
  s = M.applyArrayOp(s, 'push_string');
  check('ch7 push_string -> HOLEY_ELEMENTS', [s.kind, s.sayKey].join(), 'HOLEY_ELEMENTS,tagged');
  s = M.applyArrayOp(s, 'shrink_len');
  check('ch7 shrink_len NEVER reverts', [s.kind, s.regressedAttempt, s.sayKey].join(), 'HOLEY_ELEMENTS,true,stuck');
  s = M.applyArrayOp(s, 'make_sparse');
  check('ch7 make_sparse -> DICTIONARY', [s.kind, s.dict, s.sayKey].join(), 'DICTIONARY_ELEMENTS,true,dict');
}

/* ── 8. Orinoco GC (ch8) ── */
{
  let g = M.createGCState({ allocRateKiB: 96, survivalPct: 25, youngMode: 'scavenger' });
  for (let i = 0; i < 10; i++) g = M.stepGC(g, {});
  ok('ch8 scavenge triggered in 10 ticks', g.scavengeCount >= 1);
  const gm = M.stepGC(g, { forceMajor: true });
  check('ch8 force major triggers Major MC', [gm.lastEvent, gm.sayKey].join(), 'major,major');
  ok('ch8 major pause much larger than typical scavenge', gm.lastPauseMs > 5);
}

/* ── 9. Event loop & microtasks (ch9) ── */
{
  const std = M.runLoopAll('standard', 1);
  check('ch9 standard exact execution order', std.executed.join(' > '), 'main.js (sync) > nextTick > Promise.then > queueMicrotask > setImmediate > setTimeout(0)');
  check('ch9 standard done', [std.done, std.starved, std.sayKey].join(), 'true,false,done');
  const stv = M.runLoopAll('starve', 2);
  check('ch9 starve locks inside MicrotaskCheckpoint', [stv.starved, stv.phase, stv.sayKey].join(), 'true,starved,starved');
}

/* ── 10. Prose bindings ── */
{
  ok('bindings object populated', Object.keys(B).length >= 35);
  check('pinned V8 version binding', B['v8.ver'], '14.6.202.34-node.40');
  check('pinned Node version binding', B['node.ver'], '26.12.1');
  check('ch1 maglev threshold binding', B['ch1.magThresh'], '400');
  check('ch1 turbofan threshold binding', B['ch1.tfThresh'], '3,000');
  check('ch2 smi31Max binding', B['ch2.smi31Max'], '1,073,741,823');
  check('ch2 smi32Max binding', B['ch2.smi32Max'], '2,147,483,647');
  check('ch3 slack done size', B['ch3.slackDoneB'], '40');
  check('ch4 max polymorphic', B['ch4.maxPoly'], '4');
}

/* ── 11. Copy parity, dynamicKeys, guardrails & registry ── */
{
  const keys = [...app.matchAll(/\bt\('([\w.]+)'/g)].map(m => m[1]).filter(k => !k.endsWith('.'));
  const missing = [...new Set(keys)].filter(k => Z[k] == null);
  check('every literal key app.js reads exists in zh', missing.join(), '');
  const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'page.json'), 'utf8'));
  const dyn = Object.entries(PJ.dynamicKeys).flatMap(([p, vs]) => vs.map(v => p + '.' + v));
  check('all dynamicKeys exist in zh', dyn.filter(k => Z[k] == null).join(), '');
  check('all dynamicKeys exist in en', dyn.filter(k => E[k] == null).join(), '');
  check('zh and en have identical keys', Object.keys(Z).sort().join(), Object.keys(E).sort().join());
  const ph = s => (String(s).match(/\{[a-zA-Z_]\w*\}/g) || []).sort().join();
  check('runtime placeholders match in zh and en', Object.keys(Z).filter(k => ph(Z[k]) !== ph(E[k])).join(), '');
  check('English is not stubbed', [String((PJ.languages || {}).en), /data-lang-en="stub"/.test(html)].join(), 'undefined,false');
  check('no CJK in copy.en.js', Object.keys(E).filter(k => /[\u3400-\u9fff]/.test(E[k])).join(), '');

  // Guardrail #2: no HTML tags inside data-i18n plain-text elements
  const plainKeys = [...html.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
  const badHtmlInPlain = plainKeys.filter(k => /<\/?[a-z]+[^>]*>/i.test(Z[k] || '') || /<\/?[a-z]+[^>]*>/i.test(E[k] || ''));
  check('Guardrail #2: zero HTML tags inside data-i18n keys', badHtmlInPlain.join(), '');

  // Unprefill CJK hygiene check on index.html and figures/*.html
  let h = unprefill(html, Z)
    .replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '')
    .replace(/<div[^>]*id="langToggle"[\s\S]*?<\/div>/, '')
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta[^>]*>/g, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  const cjk = h.match(/[^\n]{0,30}[\u3400-\u9fff][^\n]{0,30}/g) || [];
  check('no CJK in index.html outside pre-filled copy', cjk.slice(0, 3).join(' | '), '');
  for (const f of fs.readdirSync(path.join(DIR, 'figures'))) {
    const s = fs.readFileSync(path.join(DIR, 'figures', f), 'utf8');
    ok(`figures/${f} has no CJK`, !/[\u3400-\u9fff]/.test(s));
  }
  check('nine static diagrams', fs.readdirSync(path.join(DIR, 'figures')).filter(f => f.startsWith('dg-')).length, 9);

  // REGISTRY.json parity & collision checks
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry title.zh = hero.title', R.title.zh, Z['hero.title']);
  check('registry title.en = en hero.title', R.title.en, E['hero.title']);
  check('registry desc.zh = doc.desc', R.desc.zh, Z['doc.desc']);
  check('registry desc.en = en doc.desc', R.desc.en, E['doc.desc']);
  for (const c of R.concepts) {
    ok(`concept ${c.id} starts with v8-`, c.id.startsWith('v8-'));
    ok(`concept ${c.id} anchor ${c.anchor} exists`, html.includes(`id="${c.anchor.slice(1)}"`));
  }
  const sq = s => s.normalize('NFKC').toLowerCase().replace(/[\s\-‐-―_·・'’]/gu, '');
  const mine = R.concepts.flatMap(c => [...new Set([...c.aliases.zh, ...c.aliases.en].map(sq))]);
  check('no duplicate aliases inside this REGISTRY', mine.filter((a, i) => mine.indexOf(a) !== i).join(), '');
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
