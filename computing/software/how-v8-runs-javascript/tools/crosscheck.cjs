#!/usr/bin/env node
'use strict';
/* Live crosscheck against host /opt/homebrew/bin/node (V8 14.6.202.34-node.40, Node v26.12.1).
   Executes real V8 probes in /tmp/agent-tasks/software/how-v8-runs-javascript/ and compares
   thresholds, Smi boundaries, byte sizes, Map transitions, IC states, bytecode opcodes,
   deoptimization bailout, ElementsKind transitions, GC heap stats, and microtask ordering
   against models.js. Never modifies anything inside the repository. */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const M = require('../models.js');

const NODE_BIN = '/opt/homebrew/bin/node';
const SCRATCH = '/tmp/agent-tasks/software/how-v8-runs-javascript';
fs.mkdirSync(SCRATCH, { recursive: true });

let n = 0, fails = 0;
function check(name, got, want) {
  n++;
  if (got !== want) {
    fails++;
    console.error(`FAIL ${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  }
}
function ok(name, cond, info) {
  n++;
  if (!cond) {
    fails++;
    console.error(`FAIL ${name}${info ? ': ' + info : ''}`);
  }
}

function runNode(args, code) {
  return execFileSync(NODE_BIN, [...args, '-e', code], { encoding: 'utf8', cwd: SCRATCH });
}

// 1. Version & compile config
{
  const out = runNode([], 'console.log(JSON.stringify({ v: process.versions, cfg: process.config.variables }))');
  const parsed = JSON.parse(out.trim());
  check('V8 version matches pinned release', parsed.v.v8, M.V8_RELEASE.v8);
  check('Node version matches pinned release', parsed.v.node, M.V8_RELEASE.node);
  check('Host Node disables pointer compression (full64)', parsed.cfg.v8_enable_pointer_compression, 0);
  check('Host Node enables Maglev', parsed.cfg.v8_enable_maglev, 1);
}

// 2. CLI default thresholds match TIER_THRESHOLDS
{
  const help = execFileSync(NODE_BIN, ['--help', '--v8-options'], { encoding: 'utf8', cwd: SCRATCH });
  const getDefault = flag => {
    const rx = new RegExp(`--${flag}=[0-9]+`);
    const m = help.match(rx);
    return m ? Number(m[0].split('=')[1]) : null;
  };
  check('feedback allocation threshold', getDefault('invocation-count-for-feedback-allocation'), M.TIER_THRESHOLDS.feedbackAlloc);
  check('maglev OSR threshold', getDefault('invocation-count-for-maglev-osr'), M.TIER_THRESHOLDS.maglevOsr);
  check('maglev threshold', getDefault('invocation-count-for-maglev'), M.TIER_THRESHOLDS.maglev);
  check('turbofan OSR threshold', getDefault('invocation-count-for-osr'), M.TIER_THRESHOLDS.turbofanOsr);
  check('turbofan threshold', getDefault('invocation-count-for-turbofan'), M.TIER_THRESHOLDS.turbofan);
  ok('JSPI WebAssembly.Suspending shipped', /function/.test(runNode([], 'console.log(typeof WebAssembly.Suspending)')));
  ok('--turboshaft enabled by default', /default:\s*--turboshaft\b/.test(help));
}

// 3. Smi boundaries & HeapNumber size (ch2)
{
  const smiOut = runNode(['--allow-natives-syntax'], `
    console.log(JSON.stringify({
      s30Max: %IsSmi(1073741823),
      s30Over: %IsSmi(1073741824),
      s31Max: %IsSmi(2147483647),
      s31Over: %IsSmi(2147483648),
      s31Min: %IsSmi(-2147483648),
      s31Under: %IsSmi(-2147483649),
      half: %IsSmi(0.5)
    }));
  `);
  const s = JSON.parse(smiOut.trim());
  check('full64 IsSmi(2^30-1)', s.s30Max, M.inspectValue(1073741823, 'full64').isSmi);
  check('full64 IsSmi(2^30)', s.s30Over, M.inspectValue(1073741824, 'full64').isSmi);
  check('full64 IsSmi(2^31-1)', s.s31Max, M.inspectValue(2147483647, 'full64').isSmi);
  check('full64 IsSmi(2^31)', s.s31Over, M.inspectValue(2147483648, 'full64').isSmi);
  check('full64 IsSmi(-2^31)', s.s31Min, M.inspectValue(-2147483648, 'full64').isSmi);
  check('full64 IsSmi(-2^31-1)', s.s31Under, M.inspectValue(-2147483649, 'full64').isSmi);
  check('IsSmi(0.5)', s.half, M.inspectValue(0.5, 'full64').isSmi);

  const dbgHalf = runNode(['--allow-natives-syntax'], '%DebugPrint(0.5);');
  ok('HeapNumber instance size 16 on 64-bit', /instance size:\s*16\b/.test(dbgHalf));
}

// 4. Hidden Classes (Map), Slack tracking, Dictionary fallback (ch3)
{
  const mapOut = runNode(['--allow-natives-syntax'], `
    const a1 = { x: 1, y: 2 }, a2 = { x: 10, y: 20 }, b1 = { y: 2, x: 1 };
    const same = %HaveSameMap(a1, a2), diff = %HaveSameMap(a1, b1);
    const d = { a: 1, b: 2, c: 3 };
    const fastBefore = %HasFastProperties(d);
    delete d.b;
    const fastAfter = %HasFastProperties(d);
    console.log(JSON.stringify({ same, diff, fastBefore, fastAfter }));
  `);
  const m = JSON.parse(mapOut.trim());
  check('same key order shares Map', m.same, M.simMapScenario('same_order').sameMap);
  check('reversed key order forks Map', m.diff, M.simMapScenario('reordered').sameMap);
  check('before delete is fast properties', m.fastBefore, true);
  check('after delete falls back to dictionary', m.fastAfter, false);

  const slackDbg = runNode(['--allow-natives-syntax'], `
    function Point(x, y) { this.x = x; this.y = y; }
    const p1 = new Point(1, 2);
    %DebugPrint(p1);
    for (let i = 2; i <= 6; i++) new Point(i, i);
    const p7 = new Point(7, 7);
    %DebugPrint(p7);
  `);
  const sizes = [...slackDbg.matchAll(/instance size:\s*(\d+)/g)].map(x => Number(x[1]));
  const inObj = [...slackDbg.matchAll(/inobject properties:\s*(\d+)/g)].map(x => Number(x[1]));
  check('slack call 1 instance size matches model', sizes[0], M.simMapScenario('slack_early').instanceSize64);
  check('slack call 7 instance size shrinks to model', sizes[sizes.length - 1], M.simMapScenario('slack_done').instanceSize64);
  check('slack call 1 -> 7 inobject slots', `${inObj[0]}->${inObj[inObj.length - 1]}`, `${M.simMapScenario('slack_early').inObjectSlots}->${M.simMapScenario('slack_done').inObjectSlots}`);
}

// 5. LoadIC states (ch4)
{
  const icDbg = runNode(['--allow-natives-syntax'], `
    function getX(o) { return o.x; }
    %EnsureFeedbackVectorForFunction(getX);
    getX({ x: 1 });
    %DebugPrint(getX);
    getX({ x: 1, a: 1 }); getX({ x: 1, b: 1 }); getX({ x: 1, c: 1 });
    %DebugPrint(getX);
    getX({ x: 1, d: 1 });
    %DebugPrint(getX);
  `);
  const states = [...icDbg.matchAll(/slot #0 LoadProperty (\w+)/g)].map(x => x[1]);
  check('IC state 1 shape', states[0], M.simIC(1, 100000).state);
  check('IC state 4 shapes', states[1], M.simIC(4, 100000).state);
  check('IC state 5 shapes', states[2], M.simIC(5, 100000).state);
}

// 6. Ignition bytecode for addXY (ch5)
{
  const bcOut = runNode(['--print-bytecode', '--print-bytecode-filter=addXY'], `
    function addXY(p) { return p.x + p.y; }
    addXY({ x: 3, y: 4 });
  `);
  ok('addXY bytecode length 13', /Bytecode length:\s*13\b/.test(bcOut));
  for (const ins of M.ADDXY_BYTECODE) {
    const token = ins.op.split(' ')[0];
    ok(`bytecode contains ${token}`, bcOut.includes(token), ins.op);
  }
}

// 7. Deoptimization trace (ch6)
{
  const deoptOut = runNode(['--trace-opt', '--trace-deopt'], `
    function f(o) { return o.x + 1; }
    const g = { x: 1 }, bad = { y: 1, x: 2 };
    let s = 0;
    for (let i = 0; i < 50000; i++) {
      s += f(g);
      if (i === 40000) s += f(bad);
    }
    console.log("sum", s);
  `);
  ok('Maglev optimization logged', /target MAGLEV/.test(deoptOut));
  ok('deopt-eager wrong map logged', /bailout \(kind: deopt-eager, reason: wrong map\)/.test(deoptOut));
}

// 8. ElementsKind one-way lattice (ch7)
{
  const elOut = runNode(['--allow-natives-syntax'], `
    const a = [1, 2, 3];
    const s0 = [%HasSmiElements(a), %HasDoubleElements(a), %HasHoleyElements(a), %HasFastPackedElements(a)];
    a.push(1.5);
    const s1 = [%HasSmiElements(a), %HasDoubleElements(a), %HasHoleyElements(a), %HasFastPackedElements(a)];
    a[5] = 2.5;
    const s2 = [%HasSmiElements(a), %HasDoubleElements(a), %HasHoleyElements(a), %HasFastPackedElements(a)];
    a.push('hi');
    const s3 = [%HasSmiElements(a), %HasDoubleElements(a), %HasHoleyElements(a), %HasFastPackedElements(a)];
    a.length = 3; a[0] = 1; a[1] = 2; a[2] = 3;
    const s4 = [%HasSmiElements(a), %HasDoubleElements(a), %HasHoleyElements(a), %HasFastPackedElements(a)];
    console.log(JSON.stringify({ s0, s1, s2, s3, s4 }));
  `);
  const e = JSON.parse(elOut.trim());
  let m = M.createArrayState();
  check('arr init PACKED_SMI', e.s0.join(), [m.smi, m.double, m.holey, m.packed].join());
  m = M.applyArrayOp(m, 'push_double');
  check('arr push(1.5) PACKED_DOUBLE', e.s1.join(), [m.smi, m.double, m.holey, m.packed].join());
  m = M.applyArrayOp(m, 'make_hole');
  check('arr [5]=2.5 HOLEY_DOUBLE', e.s2.join(), [m.smi, m.double, m.holey, m.packed].join());
  m = M.applyArrayOp(m, 'push_string');
  check('arr push("hi") HOLEY_ELEMENTS', e.s3.join(), [m.smi, m.double, m.holey, m.packed].join());
  m = M.applyArrayOp(m, 'shrink_len');
  check('arr shrink does NOT revert', e.s4.join(), [m.smi, m.double, m.holey, m.packed].join());
}

// 9. Heap statistics & microtask turn order (ch8 & ch9)
{
  const heapOut = runNode([], 'const v8 = require("v8"); console.log(JSON.stringify({ h: v8.getHeapStatistics(), s: v8.getHeapSpaceStatistics() }));');
  const hp = JSON.parse(heapOut.trim());
  const newSp = hp.s.find(x => x.space_name === 'new_space');
  ok('fresh new_space ~512 KiB', newSp && newSp.space_size === 524288);
  ok('heap_size_limit ~4.09 GiB', hp.h.heap_size_limit > 4e9 && hp.h.heap_size_limit < 4.5e9);

  const loopOut = runNode([], `
    const log = [];
    setTimeout(() => log.push('setTimeout(0)'), 0);
    setImmediate(() => log.push('setImmediate'));
    Promise.resolve().then(() => { log.push('Promise.then'); queueMicrotask(() => log.push('queueMicrotask')); });
    process.nextTick(() => log.push('nextTick'));
    log.push('main.js (sync)');
    setTimeout(() => console.log(log.join(' > ')), 20);
  `);
  const modelLoop = M.runLoopAll('nested', 1).executed;
  ok('sync runs before nextTick', loopOut.trim().startsWith('main.js (sync) > nextTick > Promise.then > queueMicrotask'));
  check('model standard order starts sync -> nextTick -> Promise.then -> queueMicrotask', M.runLoopAll('standard', 1).executed.slice(0, 4).join(' > '), 'main.js (sync) > nextTick > Promise.then > queueMicrotask');
  check('model macrotask phases finish all 6 steps', modelLoop.length, 7);
}

console.log(`${n - fails}/${n} crosschecks passed against ${NODE_BIN} (V8 ${M.V8_RELEASE.v8})`);
if (fails) process.exit(1);
