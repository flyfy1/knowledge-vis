'use strict';
// Dependency-free unit test pinning every model, prose binding, copy key, zh/en parity,
// zero-CJK hygiene in copy.en.js / figures / index.html, and REGISTRY.json uniqueness.
// Run: node computing/software/how-react-updates-the-dom/tests/models.cjs
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
  const g = typeof got === 'object' ? JSON.stringify(got) : got;
  const w = typeof want === 'object' ? JSON.stringify(want) : want;
  if (g !== w) { fails++; console.error(`FAIL ${name}: got ${g}, expected ${w}`); }
}
function ok(name, cond, info) {
  n++;
  if (!cond) { fails++; console.error(`FAIL ${name}${info ? ': ' + info : ''}`); }
}

/* ── 1. ch2: JSX Element vs Fiber ── */
{
  const j = M.inspectElementAndFiber('counter', 'jsx');
  check('ch2 jsx stage: 0 DOM nodes, 0 component calls', [j.stats.domNodesAllocated, j.stats.fnCallsNow, j.stats.fiberCount], [0, 0, 0]);
  check('ch2 Element $$typeof', j.topElement.$$typeof, 'Symbol(react.transitional.element)');
  const r = M.inspectElementAndFiber('counter', 'reconciled');
  check('ch2 reconciled counter: 6 fibers, 4 DOM nodes, 1 fn call', [r.stats.fiberCount, r.stats.domNodesAllocated, r.stats.fnCallsNow], [6, 4, 1]);
  const card = M.inspectElementAndFiber('card', 'reconciled');
  check('ch2 card has 2 FunctionComponents (null stateNode) & 2 DOM nodes', [card.stats.fnCallsNow, card.stats.domNodesAllocated], [2, 2]);
}

/* ── 2. ch3: Fiber workLoop & double buffer ── */
{
  const s0 = M.simulateWorkLoop({ unitMs: 1.6, budgetMs: 5, unitsDone: 0 });
  check('ch3 initial: 0 yields, current live', [s0.yieldCount, s0.finished, s0.rootCurrentId], [0, false, 'A (live)']);
  const s5 = M.simulateWorkLoop({ unitMs: 1.6, budgetMs: 5, unitsDone: 5 });
  check('ch3 unit 5: slice 2, 1 yield, not finished', [s5.sliceIdx, s5.yieldCount, s5.finished, s5.domMutated], [2, 1, false, false]);
  const s11 = M.simulateWorkLoop({ unitMs: 1.6, budgetMs: 5, unitsDone: 11 });
  check('ch3 unit 11: 4 slices, 3 yields, flipped to B', [s11.sliceIdx, s11.yieldCount, s11.finished, s11.rootCurrentId], [4, 3, true, 'B (new)']);
  const sp = M.simulateWorkLoop({ unitMs: 1.6, budgetMs: 5, unitsDone: 8, preempt: true });
  check('ch3 preempt at unit 4 discards draft, keeps A live', [sp.discarded, sp.finished, sp.domMutated, sp.rootCurrentId], [true, false, false, 'A (live)']);
  check('ch3 workLoop DFS visits all 11 beginWork + 11 completeWork = 22 events', M.WORKLOOP_EVENTS.length, 22);
}

/* ── 3. ch4: O(n) Two-pass key reconciliation ── */
{
  const idPre = M.reconcileList('prepend', 'id');
  check('ch4 prepend key=id: 4 reused, 0 moves, 1 mount, 0 state mismatch', [idPre.stats.reusedCount, idPre.stats.moveCount, idPre.stats.mountCount, idPre.stats.stateMismatches], [4, 0, 1, 0]);
  const idxPre = M.reconcileList('prepend', 'index');
  check('ch4 prepend key=index: Pass 1 reuses all 4, 2 state mismatches', [idxPre.stats.pass1Reused, idxPre.stats.reusedCount, idxPre.stats.stateMismatches], [4, 4, 2]);
  const revId = M.reconcileList('reverse', 'id');
  check('ch4 reverse key=id: 4 reused, 3 moves (D stays, C/B/A move), 0 mismatch', [revId.stats.reusedCount, revId.stats.moveCount, revId.stats.stateMismatches], [4, 3, 0]);
  const swapId = M.reconcileList('swap', 'id');
  check('ch4 swap B/C key=id: 1 move (B moves after C), 0 mismatch', [swapId.stats.moveCount, swapId.stats.stateMismatches], [1, 0]);
  const delId = M.reconcileList('deleteB', 'id');
  check('ch4 delete B key=id: 3 reused, 1 deleted, 0 mismatch', [delId.stats.reusedCount, delId.stats.deleteCount, delId.stats.stateMismatches], [3, 1, 0]);
}

/* ── 4. ch5: Hooks linked list & circular pending queue ── */
{
  const h1 = M.simulateHooks({ actions: ['inc', 'double'] });
  check('ch5 +1 then *2: 10 -> 22', [h1.prevCount, h1.memoizedState, h1.hookError], [10, 22, false]);
  const h2 = M.simulateHooks({ actions: ['double', 'inc'] });
  check('ch5 *2 then +1: 10 -> 21', h2.memoizedState, 21);
  const hSkip = M.simulateHooks({ actions: ['inc', 'double'], skipLowPrio: true });
  check('ch5 low-prio skipped: baseState 10, baseQueueLen 2, Sync result 20', [hSkip.baseState, hSkip.baseQueueLen, hSkip.memoizedState], [10, 2, 20]);
  const hErr = M.simulateHooks({ actions: ['inc', 'double'], conditionalSkip: true });
  check('ch5 conditional skip flags hookError', [hErr.hookError, hErr.cursorMappings[0].readSlot], [true, 0]);
}

/* ── 5. ch6: subtreeFlags bubbling & commit skips ── */
{
  const b1 = M.traverseAndBubble('singleLeaf', 10);
  check('ch6 single leaf (Post2): 9 render-checked (4 bailed siblings), 5 commit-entered, 10 skipped, mask 0x0004', [b1.stats.renderVisited, b1.stats.renderBailed, b1.stats.commitVisited, b1.stats.commitSkipped, b1.stats.rootSubtreeHex], [9, 4, 5, 10, '0x0004']);
  const b2 = M.traverseAndBubble('twoLeaves');
  check('ch6 two leaves (Update+Placement): root subtreeFlags 0x0006', [b2.stats.rootSubtreeHex, b2.stats.commitVisited], ['0x0006', 8]);
  const b3 = M.traverseAndBubble('navDelete');
  check('ch6 nav ChildDeletion: root subtreeFlags 0x0010', [b3.stats.rootSubtreeHex, b3.stats.commitVisited], ['0x0010', 4]);
}

/* ── 6. ch7: Commit phases & useLayoutEffect vs useEffect ── */
{
  const tlL = M.simulateCommitTimeline({ renderMs: 4, mutationMs: 1.5, layoutEffectMs: 6, passiveEffectMs: 5, tooltipMode: 'layout' });
  check('ch7 layout default: paint at 15.6 ms, 0 dropped, no flash', [tlL.timeToPaintMs, tlL.droppedFrames, tlL.visualFlash], [15.6, 0, false]);
  const tlP = M.simulateCommitTimeline({ renderMs: 4, mutationMs: 1.5, layoutEffectMs: 6, passiveEffectMs: 5, tooltipMode: 'passive' });
  check('ch7 passive default: paint at 13.8 ms, 0 dropped, 1-frame flash', [tlP.timeToPaintMs, tlP.droppedFrames, tlP.visualFlash], [13.8, 0, true]);
  const tlSlow = M.simulateCommitTimeline({ renderMs: 8, mutationMs: 1.5, layoutEffectMs: 10, passiveEffectMs: 5, tooltipMode: 'layout' });
  ok('ch7 heavy layoutEffect misses 16.67 ms budget', tlSlow.timeToPaintMs > 16.67 && tlSlow.droppedFrames >= 1);
}

/* ── 7. ch8: Event delegation & batching ── */
{
  const eClick = M.simulateEventsAndBatching({ triggerKind: 'click', setStateCalls: 3, stopAtCard: false });
  check('ch8 click unstopped: 1 root listener, 4 capture + 4 bubble = 8 handlers, 1 commit', [eClick.nativeListenersAttached, eClick.totalHandlersRun, eClick.commitCount, eClick.assignedLane], [1, 8, 1, 2]);
  const eStop = M.simulateEventsAndBatching({ triggerKind: 'setTimeout', setStateCalls: 4, stopAtCard: true });
  check('ch8 setTimeout stopped at card: 6 handlers, DefaultLane (32), 1 commit', [eStop.totalHandlersRun, eStop.assignedLane, eStop.commitCount], [6, 32, 1]);
  const eFlush = M.simulateEventsAndBatching({ triggerKind: 'flushSync', setStateCalls: 4 });
  check('ch8 flushSync 4 calls -> 4 commits', eFlush.commitCount, 4);
}

/* ── 8. ch9: 31-bit Lanes & preemption scheduler ── */
{
  const lc = M.simulateLanesScheduler({ useTransition: true, listNodes: 14, nodeCostMs: 1.5, keystrokeAtMs: 7 });
  check('ch9 transition: slices 5 ms, yields, preempts, latency 5.5 ms', [lc.canTimeSlice, lc.pickedLaneAtKeystroke, lc.preemptions, lc.inputLatencyMs, lc.droppedInputFrame], [true, 2, 1, 5.5, false]);
  const lb = M.simulateLanesScheduler({ useTransition: false, listNodes: 14, nodeCostMs: 1.5, keystrokeAtMs: 7 });
  check('ch9 DefaultLane blocked: no slice, latency 17.5 ms, drops frame', [lb.canTimeSlice, lb.yieldCount, lb.inputLatencyMs, lb.droppedInputFrame], [false, 0, 17.5, true]);
  check('ch9 lowestBit(258) = 2', M.lowestBit(256 | 2), 2);
}

/* ── 9. ch10: React Compiler useMemoCache(4) ── */
{
  const cOn = M.simulateCompilerCache({ compiled: true, stepKind: 'parentOnly', renderCount: 4 });
  check('ch10 compiled parentOnly 4 renders: 4 slots, 6 hits, 1 calc, 3 bailouts', [cOn.cacheSize, cOn.slotHits, cOn.filterComputes, cOn.childBailedOut], [4, 6, 1, 3]);
  const cItems = M.simulateCompilerCache({ compiled: true, stepKind: 'items', renderCount: 4 });
  check('ch10 compiled items change: 3 hits on theme scope, 4 calcs, 0 bailouts', [cItems.slotHits, cItems.filterComputes, cItems.childBailedOut], [3, 4, 0]);
  const cOff = M.simulateCompilerCache({ compiled: false, stepKind: 'parentOnly', renderCount: 4 });
  check('ch10 uncompiled: 0 slots, 0 hits, 4 calcs', [cOff.cacheSize, cOff.slotHits, cOff.filterComputes], [0, 0, 4]);
}

/* ── 10. bindings: every prose number ── */
{
  const want = {
    'react.ver': '19.3.1', 'sch.ver': '0.28.0', 'sch.slice': '5', 'frame.ms': '16.67',
    'ch2.elemKeys': '4', 'ch2.jsxDom': '0', 'ch2.jsxCalls': '0', 'ch2.fibers': '6', 'ch2.doms': '4',
    'ch3.nodes': '11', 'ch3.yields': '3', 'ch3.slices': '4',
    'ch4.idReused': '4', 'ch4.idMoves': '0', 'ch4.idMounts': '1', 'ch4.idxReused': '4', 'ch4.idxMismatch': '2',
    'ch5.prev': '10', 'ch5.next': '22',
    'ch6.total': '15', 'ch6.commitVis': '5', 'ch6.commitSkip': '10', 'ch6.skipPct': '67%',
    'ch7.paintLayout': '15.6', 'ch7.paintPassive': '13.8',
    'ch8.listeners': '1', 'ch8.calls': '3', 'ch8.commits': '1', 'ch8.syncCommits': '3',
    'ch9.transLat': '5.5', 'ch9.syncLat': '17.5', 'ch9.totalLanes': '31', 'ch9.syncLane': '2', 'ch9.transLane': '256',
    'ch10.slots': '4', 'ch10.hits': '6', 'ch10.offRuns': '4'
  };
  check('binding names', Object.keys(B).sort().join(), Object.keys(want).sort().join());
  for (const k in want) check('binding ' + k, B[k], want[k]);
}

/* ── 11. copy, parity, language hygiene ── */
{
  const keys = [...app.matchAll(/\bt\('([\w.]+)'/g)].map(m => m[1]).filter(k => !k.endsWith('.'));
  const missing = [...new Set(keys)].filter(k => Z[k] == null);
  check('every literal key app.js reads exists', missing.join(), '');
  const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'page.json'), 'utf8'));
  const dyn = Object.entries(PJ.dynamicKeys).flatMap(([p, vs]) => vs.map(v => p + '.' + v));
  check('dynamic keys exist in copy.zh.js', dyn.filter(k => Z[k] == null).join(), '');
  check('zh and en have identical keys', Object.keys(Z).sort().join(), Object.keys(E).sort().join());
  const ph = s => (String(s).match(/\{[a-zA-Z_]\w*\}/g) || []).sort().join();
  check('runtime placeholders match in zh and en', Object.keys(Z).filter(k => ph(Z[k]) !== ph(E[k])).join(), '');
  check('English is full native copy (not stub)', [String((PJ.languages || {}).en), /data-lang-en="stub"/.test(html)].join(), 'undefined,false');
  check('no CJK in copy.en.js', Object.keys(E).filter(k => /[㐀-鿿]/.test(E[k])).join(), '');

  const h = unprefill(html, Z)
    .replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '')
    .replace(/<div[^>]*id="langToggle"[\s\S]*?<\/div>/, '')
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta[^>]*>/g, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  const cjk = h.match(/[^\n]{0,30}[㐀-鿿][^\n]{0,30}/g) || [];
  check('no CJK in index.html outside pre-filled copy', cjk.slice(0, 3).join(' | '), '');

  for (const f of fs.readdirSync(path.join(DIR, 'figures'))) {
    const s = fs.readFileSync(path.join(DIR, 'figures', f), 'utf8');
    ok(`figures/${f} has no CJK`, !/[㐀-鿿]/.test(s));
  }
  const dgFiles = fs.readdirSync(path.join(DIR, 'figures')).filter(f => f.startsWith('dg-'));
  check('9 static SVG diagrams', dgFiles.length, 9);
  const raw = [...dgFiles.map(f => fs.readFileSync(path.join(DIR, 'figures', f), 'utf8')).join('').matchAll(/<text [^>]*>([^<]+)<\/text>/g)].map(m => m[1]);
  const neutral = s => /^[0-9.+\-^a-zA-Z]+$/.test(s);
  ok('literal diagram text is only language-neutral tokens', raw.every(neutral), raw.filter(s => !neutral(s)).join(' | '));
  ok('every diagram <text> has x, y, font-size >= 14 and no transform',
    [...dgFiles.map(f => fs.readFileSync(path.join(DIR, 'figures', f), 'utf8')).join('').matchAll(/<text ([^>]*)>/g)]
      .every(m => /\bx="/.test(m[1]) && /\by="/.test(m[1]) && !/\btransform=/.test(m[1]) && +(m[1].match(/font-size="([\d.]+)"/) || [0, 0])[1] >= 14));
  ok('pinned React 19.3.1 mentioned on page', /19\.3\.1/.test(Z['hero.note'] || '') && /scheduler@0\.28\.0/.test(Z['hero.note'] || ''));
}

/* ── 12. REGISTRY.json parity & global uniqueness ── */
{
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry zh title = hero', R.title.zh, 'React 如何更新网页');
  check('registry en title = hero', R.title.en, 'How React Updates the DOM');
  check('registry zh desc = doc.desc', R.desc.zh, Z['doc.desc']);
  check('registry en desc = doc.desc', R.desc.en, E['doc.desc']);
  check('registry path/cat/sub', [R.category, R.subtopic, R.path].join(), 'computing,software,computing/software/how-react-updates-the-dom/');
  ok('all concept IDs prefixed with react-', R.concepts.every(c => c.id.startsWith('react-')));
  for (const c of R.concepts) ok(`concept ${c.id} anchor ${c.anchor} exists`, html.includes(`id="${c.anchor.slice(1)}"`));

  const sq = s => String(s).normalize('NFKC').toLowerCase().replace(/[\s\-‐-―_·・'’]/gu, '');
  const mine = R.concepts.flatMap(c => [...new Set([...c.aliases.zh, ...c.aliases.en].map(sq))]);
  check('no duplicate aliases within REGISTRY.json', mine.filter((a, i) => mine.indexOf(a) !== i).join(), '');

  // Verify zero collisions against atlas/data.js and atlas/graph/aliases.json
  const box = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'atlas/data.js'), 'utf8'), box);
  const taken = new Set();
  for (const node of (box.window.ATLAS.nodes || [])) {
    if ((node.lessons || []).some(l => l.slug === 'how-react-updates-the-dom')) continue;
    [node.title && node.title.zh, node.title && node.title.en, ...(node.aliases && node.aliases.zh || []), ...(node.aliases && node.aliases.en || [])]
      .filter(Boolean).forEach(x => taken.add(sq(x)));
  }
  const aj = JSON.parse(fs.readFileSync(path.join(ROOT, 'atlas/graph/aliases.json'), 'utf8'));
  for (const v of Object.values(aj)) {
    [...(v.zh || []), ...(v.en || [])].forEach(x => taken.add(sq(x)));
  }
  check('no alias collides with existing atlas nodes', mine.filter(a => taken.has(a)).join(), '');
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
