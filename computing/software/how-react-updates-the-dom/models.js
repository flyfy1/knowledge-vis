(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ReactDomModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* Pinned release constants verified against react@19.3.1, react-dom@19.3.1, scheduler@0.28.0 */
  const PINNED = Object.freeze({
    react: '19.3.1',
    reactDom: '19.3.1',
    scheduler: '0.28.0',
    releaseDate: '2026-10-14',
    frameIntervalMs: 5,
    frameBudgetMs: 1000 / 60
  });

  const WORK_TAGS = Object.freeze({
    FunctionComponent: 0,
    ClassComponent: 1,
    HostRoot: 3,
    HostComponent: 5,
    HostText: 6,
    Fragment: 7,
    MemoComponent: 14,
    SimpleMemoComponent: 15,
    OffscreenComponent: 22
  });

  const FIBER_FLAGS = Object.freeze({
    NoFlags: 0,
    PerformedWork: 1,
    Placement: 2,
    Update: 4,
    ChildDeletion: 16,
    ContentReset: 32,
    Callback: 64,
    Ref: 512,
    Snapshot: 1024,
    Passive: 2048,
    Visibility: 8192,
    MutationMask: 13878,
    LayoutMask: 8772,
    PassiveMask: 10256,
    StaticMask: 1206910976
  });

  const HOOK_FLAGS = Object.freeze({
    NoFlags: 0,
    HasEffect: 1,
    Insertion: 2,
    Layout: 4,
    Passive: 8
  });

  const LANES = Object.freeze({
    TotalLanes: 31,
    NoLanes: 0,
    SyncHydrationLane: 1,
    SyncLane: 2,
    InputContinuousHydrationLane: 4,
    InputContinuousLane: 8,
    DefaultHydrationLane: 16,
    DefaultLane: 32,
    TransitionLane1: 256,
    TransitionMask: 261888,
    TransitionAllMask: 4194048,
    IdleLane: 268435456,
    OffscreenLane: 536870912,
    SyncDefaultMask: 127
  });

  function fmt(x, d, locale) {
    if (!isFinite(x)) return '∞';
    const n = Number(x);
    const fixed = d == null ? String(n) : n.toFixed(d);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    void locale;
    return parts.join('.');
  }

  function bits31(n) {
    const v = (n >>> 0) & 0x7fffffff;
    return '0b' + v.toString(2).padStart(10, '0');
  }

  function hexFlag(f) {
    return '0x' + (f >>> 0).toString(16).padStart(4, '0');
  }

  function lowestBit(lanes) {
    return lanes & -lanes;
  }

  /* ═════════ ch2: JSX Elements vs Fiber Nodes ═════════ */
  function createElementSpec(type, props, key) {
    return {
      $$typeof: 'Symbol(react.transitional.element)',
      type: type,
      key: key == null ? null : String(key),
      props: props || {}
    };
  }

  const ELEMENT_PRESETS = {
    counter: {
      rootType: 'Counter',
      rootProps: { initial: 1 },
      expanded: [
        { id: 0, parent: -1, tag: WORK_TAGS.HostRoot, tagName: 'HostRoot', typeLabel: 'HostRoot', key: null, propsSummary: 'children: <Counter />', stateNodeKind: 'FiberRoot', fromJsx: false },
        { id: 1, parent: 0, tag: WORK_TAGS.FunctionComponent, tagName: 'FunctionComponent', typeLabel: 'fn Counter', key: null, propsSummary: '{ initial: 1 }', stateNodeKind: 'null', fromJsx: true, isComponent: true },
        { id: 2, parent: 1, tag: WORK_TAGS.HostComponent, tagName: 'HostComponent', typeLabel: "'div'", key: null, propsSummary: '{ className: "box", children: [2] }', stateNodeKind: 'HTMLDivElement', fromJsx: false },
        { id: 3, parent: 2, tag: WORK_TAGS.HostComponent, tagName: 'HostComponent', typeLabel: "'span'", key: null, propsSummary: '{ children: "1" }', stateNodeKind: 'HTMLSpanElement', fromJsx: false },
        { id: 4, parent: 3, tag: WORK_TAGS.HostText, tagName: 'HostText', typeLabel: '#text', key: null, propsSummary: '"1"', stateNodeKind: 'Text("1")', fromJsx: false },
        { id: 5, parent: 2, tag: WORK_TAGS.HostComponent, tagName: 'HostComponent', typeLabel: "'button'", key: null, propsSummary: '{ onClick: fn }', stateNodeKind: 'HTMLButtonElement', fromJsx: false }
      ]
    },
    card: {
      rootType: 'Card',
      rootProps: { title: 'Fiber' },
      expanded: [
        { id: 0, parent: -1, tag: WORK_TAGS.HostRoot, tagName: 'HostRoot', typeLabel: 'HostRoot', key: null, propsSummary: 'children: <Card />', stateNodeKind: 'FiberRoot', fromJsx: false },
        { id: 1, parent: 0, tag: WORK_TAGS.FunctionComponent, tagName: 'FunctionComponent', typeLabel: 'fn Card', key: null, propsSummary: '{ title: "Fiber" }', stateNodeKind: 'null', fromJsx: true, isComponent: true },
        { id: 2, parent: 1, tag: WORK_TAGS.HostComponent, tagName: 'HostComponent', typeLabel: "'article'", key: null, propsSummary: '{ children: [2] }', stateNodeKind: 'HTMLElement', fromJsx: false },
        { id: 3, parent: 2, tag: WORK_TAGS.FunctionComponent, tagName: 'FunctionComponent', typeLabel: 'fn Badge', key: null, propsSummary: '{ count: 3 }', stateNodeKind: 'null', fromJsx: false, isComponent: true },
        { id: 4, parent: 3, tag: WORK_TAGS.HostComponent, tagName: 'HostComponent', typeLabel: "'strong'", key: null, propsSummary: '{ children: "3" }', stateNodeKind: 'HTMLElement', fromJsx: false }
      ]
    },
    native: {
      rootType: 'section',
      rootProps: { className: 'box' },
      expanded: [
        { id: 0, parent: -1, tag: WORK_TAGS.HostRoot, tagName: 'HostRoot', typeLabel: 'HostRoot', key: null, propsSummary: 'children: <section />', stateNodeKind: 'FiberRoot', fromJsx: false },
        { id: 1, parent: 0, tag: WORK_TAGS.HostComponent, tagName: 'HostComponent', typeLabel: "'section'", key: null, propsSummary: '{ className: "box" }', stateNodeKind: 'HTMLElement', fromJsx: true },
        { id: 2, parent: 1, tag: WORK_TAGS.HostComponent, tagName: 'HostComponent', typeLabel: "'p'", key: null, propsSummary: '{ children: "Hello" }', stateNodeKind: 'HTMLParagraphElement', fromJsx: true },
        { id: 3, parent: 2, tag: WORK_TAGS.HostText, tagName: 'HostText', typeLabel: '#text', key: null, propsSummary: '"Hello"', stateNodeKind: 'Text("Hello")', fromJsx: false }
      ]
    }
  };

  function inspectElementAndFiber(preset, stage) {
    const P = ELEMENT_PRESETS[preset] || ELEMENT_PRESETS.counter;
    const st = stage === 'reconciled' ? 'reconciled' : 'jsx';
    const topElement = createElementSpec(P.rootType, P.rootProps, null);
    const jsxElements = P.expanded.filter(n => n.fromJsx);
    const fnCallsAtJsx = 0;
    const fnCallsAtRender = P.expanded.filter(n => n.isComponent).length;
    const domNodesAllocated = st === 'jsx' ? 0 : P.expanded.filter(n => n.tag === WORK_TAGS.HostComponent || n.tag === WORK_TAGS.HostText).length;
    const activeNodes = st === 'jsx' ? jsxElements : P.expanded;
    return {
      preset: preset in ELEMENT_PRESETS ? preset : 'counter',
      stage: st,
      topElement,
      nodes: activeNodes,
      allNodes: P.expanded,
      stats: {
        jsxObjectsAtCall: jsxElements.length,
        fiberCount: st === 'jsx' ? 0 : P.expanded.length,
        domNodesAllocated,
        fnCallsNow: st === 'jsx' ? fnCallsAtJsx : fnCallsAtRender,
        fnCallsAtJsx,
        fnCallsAtRender,
        elementCoreKeys: 4, // $$typeof, type, key, props
        fiberCoreKeys: 20
      }
    };
  }

  /* ═════════ ch3: Fiber linked list & double-buffered workLoop ═════════ */
  const WORKLOOP_TREE = [
    { id: 0, label: 'Root', tag: WORK_TAGS.HostRoot, child: 1, sibling: -1, return: -1, x: 0.50, y: 0.12 },
    { id: 1, label: 'App', tag: WORK_TAGS.FunctionComponent, child: 2, sibling: -1, return: 0, x: 0.50, y: 0.34 },
    { id: 2, label: 'Header', tag: WORK_TAGS.FunctionComponent, child: 3, sibling: 5, return: 1, x: 0.24, y: 0.58 },
    { id: 3, label: 'Logo', tag: WORK_TAGS.HostComponent, child: -1, sibling: 4, return: 2, x: 0.12, y: 0.84 },
    { id: 4, label: 'Nav', tag: WORK_TAGS.HostComponent, child: -1, sibling: -1, return: 2, x: 0.34, y: 0.84 },
    { id: 5, label: 'Main', tag: WORK_TAGS.FunctionComponent, child: 6, sibling: 10, return: 1, x: 0.62, y: 0.58 },
    { id: 6, label: 'List', tag: WORK_TAGS.FunctionComponent, child: 7, sibling: -1, return: 5, x: 0.62, y: 0.72 },
    { id: 7, label: 'Item0', tag: WORK_TAGS.HostComponent, child: -1, sibling: 8, return: 6, x: 0.48, y: 0.88 },
    { id: 8, label: 'Item1', tag: WORK_TAGS.HostComponent, child: -1, sibling: 9, return: 6, x: 0.62, y: 0.88 },
    { id: 9, label: 'Item2', tag: WORK_TAGS.HostComponent, child: -1, sibling: -1, return: 6, x: 0.76, y: 0.88 },
    { id: 10, label: 'Footer', tag: WORK_TAGS.HostComponent, child: -1, sibling: -1, return: 1, x: 0.88, y: 0.58 }
  ];

  // Iterative DFS performUnitOfWork schedule following React's exact child -> sibling -> return rule
  function buildWorkUnitOrder() {
    const order = [];
    let wip = 0;
    while (wip !== -1) {
      const node = WORKLOOP_TREE[wip];
      order.push({ id: wip, phase: 'beginWork', label: node.label });
      if (node.child !== -1) {
        wip = node.child;
      } else {
        let cur = wip;
        wip = -1;
        while (cur !== -1) {
          order.push({ id: cur, phase: 'completeWork', label: WORKLOOP_TREE[cur].label });
          if (WORKLOOP_TREE[cur].sibling !== -1) {
            wip = WORKLOOP_TREE[cur].sibling;
            break;
          }
          cur = WORKLOOP_TREE[cur].return;
        }
      }
    }
    return order;
  }
  const WORKLOOP_EVENTS = buildWorkUnitOrder(); // 11 nodes * 2 = 22 events

  function simulateWorkLoop(opts) {
    const o = opts || {};
    const unitMs = Math.max(0.4, Math.min(4.0, o.unitMs != null ? Number(o.unitMs) : 1.6));
    const budgetMs = Math.max(2.0, Math.min(12.0, o.budgetMs != null ? Number(o.budgetMs) : PINNED.frameIntervalMs));
    const hasAlt = o.hasAlternate !== false; // false = initial mount, true = update reusing alternates
    const maxBeginSteps = WORKLOOP_TREE.length; // 11 beginWork steps
    const targetUnits = Math.max(0, Math.min(maxBeginSteps, Math.round(o.unitsDone != null ? Number(o.unitsDone) : 5)));
    const preemptAt = o.preempt ? 4 : 0; // if preempted mid-render before finishing

    let sliceMs = 0;
    let sliceIdx = 1;
    let yieldCount = 0;
    let beginCount = 0;
    let reused = 0;
    let allocated = 0;
    let cursorId = 0;
    let cursorPhase = 'ready';
    const begun = new Set();
    const completed = new Set();
    const sliceOfNode = {};
    let discarded = false;

    for (let i = 0; i < WORKLOOP_EVENTS.length && beginCount < targetUnits; i++) {
      const ev = WORKLOOP_EVENTS[i];
      if (ev.phase === 'beginWork') {
        if (sliceMs + unitMs > budgetMs + 1e-9 && sliceMs > 0) {
          yieldCount++;
          sliceIdx++;
          sliceMs = 0;
        }
        sliceMs += unitMs;
        beginCount++;
        begun.add(ev.id);
        sliceOfNode[ev.id] = sliceIdx;
        if (hasAlt) reused++;
        else allocated++;
        cursorId = ev.id;
        cursorPhase = 'beginWork';

        // Advance any immediate completeWork events up to the next beginWork if this is a leaf
        let j = i + 1;
        while (j < WORKLOOP_EVENTS.length && WORKLOOP_EVENTS[j].phase === 'completeWork') {
          completed.add(WORKLOOP_EVENTS[j].id);
          cursorId = WORKLOOP_EVENTS[j].id;
          cursorPhase = 'completeWork';
          j++;
        }
        i = j - 1;

        if (preemptAt > 0 && beginCount === preemptAt) {
          discarded = true;
          break;
        }
      }
    }

    const finished = !discarded && beginCount === maxBeginSteps;
    const activeTree = finished ? 'wip->current' : 'current';
    return {
      tree: WORKLOOP_TREE,
      unitMs,
      budgetMs,
      targetUnits,
      beginCount,
      totalNodes: maxBeginSteps,
      sliceIdx,
      sliceMs: Number(sliceMs.toFixed(2)),
      yieldCount,
      reused,
      allocated,
      begun: Array.from(begun),
      completed: Array.from(completed),
      sliceOfNode,
      cursorId: targetUnits === 0 ? -1 : cursorId,
      cursorPhase,
      finished,
      discarded,
      activeTree,
      domMutated: finished,
      rootCurrentId: finished ? 'B (new)' : 'A (live)'
    };
  }

  /* ═════════ ch4: O(n) Two-pass key reconciliation ═════════ */
  const INITIAL_LIST = [
    { id: 'A', label: 'A', draft: 'note-A' },
    { id: 'B', label: 'B', draft: '' },
    { id: 'C', label: 'C', draft: 'note-C' },
    { id: 'D', label: 'D', draft: '' }
  ];

  const RECONCILE_SCENARIOS = {
    prepend: [
      { id: 'X', label: 'X' },
      { id: 'A', label: 'A' },
      { id: 'B', label: 'B' },
      { id: 'C', label: 'C' },
      { id: 'D', label: 'D' }
    ],
    reverse: [
      { id: 'D', label: 'D' },
      { id: 'C', label: 'C' },
      { id: 'B', label: 'B' },
      { id: 'A', label: 'A' }
    ],
    swap: [
      { id: 'A', label: 'A' },
      { id: 'C', label: 'C' },
      { id: 'B', label: 'B' },
      { id: 'D', label: 'D' }
    ],
    deleteB: [
      { id: 'A', label: 'A' },
      { id: 'C', label: 'C' },
      { id: 'D', label: 'D' }
    ]
  };

  function reconcileList(scenario, keyMode) {
    const sc = scenario in RECONCILE_SCENARIOS ? scenario : 'prepend';
    const km = keyMode === 'index' ? 'index' : 'id';
    const oldList = INITIAL_LIST.map((item, idx) => ({
      id: item.id,
      label: item.label,
      draft: item.draft,
      index: idx,
      key: km === 'id' ? item.id : String(idx)
    }));
    const newList = RECONCILE_SCENARIOS[sc].map((item, idx) => ({
      id: item.id,
      label: item.label,
      index: idx,
      key: km === 'id' ? item.id : String(idx)
    }));

    let lastPlacedIndex = 0;
    let pass1Reused = 0;
    let pass2Lookups = 0;
    let reusedCount = 0;
    let moveCount = 0;
    let mountCount = 0;
    let deleteCount = 0;
    let stateMismatches = 0;
    const results = [];

    // Pass 1: positional walk matching key
    let newIdx = 0;
    let oldIdx = 0;
    for (; oldIdx < oldList.length && newIdx < newList.length; newIdx++) {
      const oldFiber = oldList[oldIdx];
      const newEl = newList[newIdx];
      if (oldFiber.key !== newEl.key) break;
      pass1Reused++;
      reusedCount++;
      lastPlacedIndex = oldFiber.index; // placeChild: oldIndex >= lastPlacedIndex (stay)
      const mismatch = oldFiber.id !== newEl.id && oldFiber.draft !== '';
      if (mismatch) stateMismatches++;
      results.push({
        newIdx,
        newId: newEl.id,
        newKey: newEl.key,
        matchedOldIdx: oldFiber.index,
        matchedOldId: oldFiber.id,
        carriedDraft: oldFiber.draft,
        action: 'stay',
        flag: oldFiber.id === newEl.id ? 'NoFlags' : 'Update',
        lastPlacedAfter: lastPlacedIndex,
        pass: 1,
        stateMismatch: mismatch
      });
      oldIdx++;
    }

    // Check remaining cases matching React's reconcileChildrenArray
    if (newIdx === newList.length) {
      // Remaining old fibers deleted
      for (let k = oldIdx; k < oldList.length; k++) deleteCount++;
    } else if (oldIdx === oldList.length) {
      // Remaining new elements mounted fresh
      for (; newIdx < newList.length; newIdx++) {
        const newEl = newList[newIdx];
        mountCount++;
        results.push({
          newIdx,
          newId: newEl.id,
          newKey: newEl.key,
          matchedOldIdx: -1,
          matchedOldId: null,
          carriedDraft: '',
          action: 'mount',
          flag: 'Placement',
          lastPlacedAfter: lastPlacedIndex,
          pass: 1,
          stateMismatch: false
        });
      }
    } else {
      // Pass 2: mapRemainingChildren into existingChildren Map
      const existingChildren = new Map();
      for (let k = oldIdx; k < oldList.length; k++) {
        existingChildren.set(oldList[k].key, oldList[k]);
      }
      for (; newIdx < newList.length; newIdx++) {
        const newEl = newList[newIdx];
        pass2Lookups++;
        const matched = existingChildren.get(newEl.key);
        if (matched) {
          existingChildren.delete(newEl.key);
          reusedCount++;
          let action = 'stay';
          let flag = matched.id === newEl.id ? 'NoFlags' : 'Update';
          if (matched.index < lastPlacedIndex) {
            action = 'move';
            flag = 'Placement';
            moveCount++;
          } else {
            lastPlacedIndex = matched.index;
          }
          const mismatch = matched.id !== newEl.id && matched.draft !== '';
          if (mismatch) stateMismatches++;
          results.push({
            newIdx,
            newId: newEl.id,
            newKey: newEl.key,
            matchedOldIdx: matched.index,
            matchedOldId: matched.id,
            carriedDraft: matched.draft,
            action,
            flag,
            lastPlacedAfter: lastPlacedIndex,
            pass: 2,
            stateMismatch: mismatch
          });
        } else {
          mountCount++;
          results.push({
            newIdx,
            newId: newEl.id,
            newKey: newEl.key,
            matchedOldIdx: -1,
            matchedOldId: null,
            carriedDraft: '',
            action: 'mount',
            flag: 'Placement',
            lastPlacedAfter: lastPlacedIndex,
            pass: 2,
            stateMismatch: false
          });
        }
      }
      deleteCount += existingChildren.size;
    }

    const deletedIds = oldList
      .filter(o => !results.some(r => r.matchedOldIdx === o.index))
      .map(o => o.id);

    return {
      scenario: sc,
      keyMode: km,
      oldList,
      newList,
      results,
      deletedIds,
      stats: {
        reusedCount,
        moveCount,
        mountCount,
        deleteCount,
        pass1Reused,
        pass2Lookups,
        lastPlacedIndex,
        stateMismatches
      }
    };
  }

  /* ═════════ ch5: Hooks as a singly-linked list + circular pending queue ═════════ */
  function simulateHooks(opts) {
    const o = opts || {};
    const queueActions = Array.isArray(o.actions) && o.actions.length ? o.actions.slice(0, 4) : ['inc', 'double'];
    const conditionalSkip = !!o.conditionalSkip;
    const skipLowPrio = !!o.skipLowPrio; // simulate a transition update skipped during SyncLane render

    const baseHooks = [
      { idx: 0, kind: 'useState', label: 'count', memoizedState: 10 },
      { idx: 1, kind: 'useState', label: 'name', memoizedState: 'Ada' },
      { idx: 2, kind: 'useEffect', label: 'effect', memoizedState: 'deps:[10]' }
    ];

    // Circular queue: tail = pending, tail.next = first
    const queueNodes = queueActions.map((op, i) => {
      const lane = skipLowPrio && i === 0 ? LANES.TransitionLane1 : LANES.SyncLane;
      const text = op === 'inc' ? 'c => c + 1' : op === 'double' ? 'c => c * 2' : '5';
      return { idx: i, op, text, lane, nextIdx: (i + 1) % queueActions.length };
    });

    const renderLanes = skipLowPrio ? LANES.SyncLane : (LANES.SyncLane | LANES.TransitionLane1);
    let baseState = 10;
    let newState = baseState;
    let firstSkipped = false;
    let baseQueueLen = 0;
    const appliedTrace = [];

    for (const u of queueNodes) {
      const matches = (renderLanes & u.lane) === u.lane;
      if (!matches) {
        if (!firstSkipped) {
          firstSkipped = true;
          baseState = newState;
        }
        baseQueueLen++;
        appliedTrace.push({ idx: u.idx, text: u.text, status: 'skipped->baseQueue', stateAfter: newState });
      } else {
        if (u.op === 'inc') newState = newState + 1;
        else if (u.op === 'double') newState = newState * 2;
        else newState = 5;
        if (firstSkipped) baseQueueLen++;
        appliedTrace.push({ idx: u.idx, text: u.text, status: 'applied', stateAfter: newState });
      }
    }
    if (!firstSkipped) baseState = newState;

    // Cursor pairing
    let cursorMappings;
    let hookError = false;
    if (!conditionalSkip) {
      cursorMappings = [
        { callOrder: 0, hookName: 'useState(count)', readSlot: 0, readVal: String(newState), ok: true },
        { callOrder: 1, hookName: 'useState(name)', readSlot: 1, readVal: "'Ada'", ok: true },
        { callOrder: 2, hookName: 'useEffect(fn)', readSlot: 2, readVal: 'deps:[' + newState + ']', ok: true }
      ];
    } else {
      hookError = true;
      cursorMappings = [
        { callOrder: 0, hookName: 'useState(name)', readSlot: 0, readVal: '10 (count!)', ok: false },
        { callOrder: 1, hookName: 'useEffect(fn)', readSlot: 1, readVal: "'Ada' (wrong type!)", ok: false },
        { callOrder: -1, hookName: '(missing call #2)', readSlot: 2, readVal: 'unvisited -> Error', ok: false }
      ];
    }

    return {
      baseHooks,
      queueNodes,
      appliedTrace,
      conditionalSkip,
      skipLowPrio,
      hookError,
      cursorMappings,
      prevCount: 10,
      baseState,
      memoizedState: newState,
      baseQueueLen,
      tailIdx: queueNodes.length - 1,
      headIdx: 0
    };
  }

  /* ═════════ ch6: beginWork / completeWork & subtreeFlags bubbling ═════════ */
  const BUBBLE_TREE = [
    { id: 0, label: 'Root', parent: -1, children: [1], x: 0.50, y: 0.11 },
    { id: 1, label: 'Shell', parent: 0, children: [2, 7, 14], x: 0.50, y: 0.30 },
    { id: 2, label: 'Nav', parent: 1, children: [3, 4], x: 0.22, y: 0.50 },
    { id: 3, label: 'Logo', parent: 2, children: [], x: 0.10, y: 0.72 },
    { id: 4, label: 'Menu', parent: 2, children: [5, 6], x: 0.30, y: 0.72 },
    { id: 5, label: 'ItemA', parent: 4, children: [], x: 0.22, y: 0.90 },
    { id: 6, label: 'ItemB', parent: 4, children: [], x: 0.38, y: 0.90 },
    { id: 7, label: 'Main', parent: 1, children: [8, 11], x: 0.62, y: 0.50 },
    { id: 8, label: 'Feed', parent: 7, children: [9, 10], x: 0.54, y: 0.72 },
    { id: 9, label: 'Post1', parent: 8, children: [], x: 0.48, y: 0.90 },
    { id: 10, label: 'Post2', parent: 8, children: [], x: 0.60, y: 0.90 },
    { id: 11, label: 'Sidebar', parent: 7, children: [12, 13], x: 0.78, y: 0.72 },
    { id: 12, label: 'Stats', parent: 11, children: [], x: 0.72, y: 0.90 },
    { id: 13, label: 'Help', parent: 11, children: [], x: 0.86, y: 0.90 },
    { id: 14, label: 'Footer', parent: 1, children: [], x: 0.88, y: 0.50 }
  ];

  function traverseAndBubble(preset, customId) {
    let dirtyTargets;
    if (preset === 'twoLeaves') dirtyTargets = [{ id: 10, flag: FIBER_FLAGS.Update }, { id: 5, flag: FIBER_FLAGS.Placement }];
    else if (preset === 'navDelete') dirtyTargets = [{ id: 4, flag: FIBER_FLAGS.ChildDeletion }];
    else if (preset === 'shellDirty') dirtyTargets = [{ id: 1, flag: FIBER_FLAGS.Update }, { id: 9, flag: FIBER_FLAGS.Update }, { id: 12, flag: FIBER_FLAGS.Passive }];
    else {
      const tid = customId != null && customId >= 0 && customId < BUBBLE_TREE.length ? Number(customId) : 10;
      dirtyTargets = [{ id: tid, flag: FIBER_FLAGS.Update }];
    }

    const flags = Array(BUBBLE_TREE.length).fill(0);
    const subtreeFlags = Array(BUBBLE_TREE.length).fill(0);
    const childLanes = Array(BUBBLE_TREE.length).fill(0);
    const ownLanes = Array(BUBBLE_TREE.length).fill(0);

    for (const dt of dirtyTargets) {
      flags[dt.id] |= dt.flag;
      ownLanes[dt.id] |= LANES.SyncLane;
      let p = BUBBLE_TREE[dt.id].parent;
      while (p !== -1) {
        childLanes[p] |= LANES.SyncLane;
        p = BUBBLE_TREE[p].parent;
      }
    }

    const renderVisited = new Set();
    const renderBailed = new Set();

    // beginWork / completeWork DFS honoring childLanes bailout
    function walkRender(id) {
      renderVisited.add(id);
      const node = BUBBLE_TREE[id];
      const hasWork = (ownLanes[id] | childLanes[id]) !== 0;
      if (!hasWork) {
        renderBailed.add(id);
        return;
      }
      if (childLanes[id] !== 0) {
        for (const ch of node.children) walkRender(ch);
      } else {
        // own update on node without dirty descendants: children bail out if memoized
        for (const ch of node.children) {
          renderVisited.add(ch);
          renderBailed.add(ch);
        }
      }
      // completeWork -> bubbleProperties
      let sub = 0;
      for (const ch of node.children) {
        sub |= flags[ch] | subtreeFlags[ch];
      }
      subtreeFlags[id] = sub;
    }
    walkRender(0);

    // Commit walk pruned by subtreeFlags & CommitMask (MutationMask | PassiveMask)
    const commitMask = FIBER_FLAGS.MutationMask | FIBER_FLAGS.PassiveMask;
    const commitVisited = new Set();
    function walkCommit(id) {
      commitVisited.add(id);
      if ((subtreeFlags[id] & commitMask) !== 0) {
        for (const ch of BUBBLE_TREE[id].children) {
          if ((flags[ch] & commitMask) !== 0 || (subtreeFlags[ch] & commitMask) !== 0) {
            walkCommit(ch);
          }
        }
      }
    }
    walkCommit(0);

    const nodes = BUBBLE_TREE.map(n => ({
      id: n.id,
      label: n.label,
      parent: n.parent,
      children: n.children,
      x: n.x,
      y: n.y,
      flags: flags[n.id],
      subtreeFlags: subtreeFlags[n.id],
      renderVisited: renderVisited.has(n.id),
      renderBailed: renderBailed.has(n.id),
      commitVisited: commitVisited.has(n.id)
    }));

    return {
      preset: preset || 'singleLeaf',
      nodes,
      stats: {
        totalNodes: BUBBLE_TREE.length,
        renderVisited: renderVisited.size,
        renderBailed: renderBailed.size,
        commitVisited: commitVisited.size,
        commitSkipped: BUBBLE_TREE.length - commitVisited.size,
        rootSubtreeFlags: subtreeFlags[0],
        rootSubtreeHex: hexFlag(subtreeFlags[0])
      }
    };
  }

  /* ═════════ ch7: Commit phases & useLayoutEffect vs useEffect ═════════ */
  function simulateCommitTimeline(opts) {
    const o = opts || {};
    const renderMs = Math.max(1, Math.min(12, o.renderMs != null ? Number(o.renderMs) : 4.0));
    const mutationMs = Math.max(0.5, Math.min(6, o.mutationMs != null ? Number(o.mutationMs) : 1.5));
    const layoutEffectMs = Math.max(0, Math.min(15, o.layoutEffectMs != null ? Number(o.layoutEffectMs) : 6.0));
    const passiveEffectMs = Math.max(0, Math.min(15, o.passiveEffectMs != null ? Number(o.passiveEffectMs) : 5.0));
    const tooltipMode = o.tooltipMode === 'passive' ? 'passive' : 'layout';
    const beforeMutationMs = 0.3;
    const browserPaintMs = 2.0; // parameterized browser layout + paint cost
    const frameBudgetMs = PINNED.frameBudgetMs;

    const segments = [];
    let t = 0;
    const pushSeg = (name, dur, phase) => {
      if (dur <= 0) return;
      segments.push({ name, start: Number(t.toFixed(2)), end: Number((t + dur).toFixed(2)), dur: Number(dur.toFixed(2)), phase });
      t += dur;
    };

    pushSeg('Render', renderMs, 'render');
    pushSeg('BeforeMutation', beforeMutationMs, 'beforeMutation');
    pushSeg('Mutation', mutationMs, 'mutation');
    const flipAtMs = Number(t.toFixed(2));
    pushSeg('LayoutEffect', layoutEffectMs, 'layout');

    // If tooltip measures DOM & synchronously calls setState inside useLayoutEffect, React re-renders & commits BEFORE paint
    const extraSyncMs = tooltipMode === 'layout' && layoutEffectMs > 0 ? 1.8 : 0;
    if (extraSyncMs > 0) pushSeg('SyncReCommit', extraSyncMs, 'syncReCommit');

    const paintStartMs = Number(t.toFixed(2));
    pushSeg('BrowserPaint', browserPaintMs, 'paint');
    const timeToPaintMs = Number(t.toFixed(2));

    // Passive useEffect runs in a scheduled task AFTER paint
    pushSeg('PassiveEffect', passiveEffectMs, 'passive');
    const totalTaskMs = Number(t.toFixed(2));

    const visualFlash = tooltipMode === 'passive';
    const droppedFrames = Math.floor(timeToPaintMs / frameBudgetMs);

    return {
      renderMs,
      beforeMutationMs,
      mutationMs,
      layoutEffectMs,
      passiveEffectMs,
      tooltipMode,
      browserPaintMs,
      frameBudgetMs,
      flipAtMs,
      paintStartMs,
      timeToPaintMs,
      totalTaskMs,
      droppedFrames,
      visualFlash,
      blocksPaint: layoutEffectMs > 0,
      segments
    };
  }

  /* ═════════ ch8: Event delegation & Microtask batching ═════════ */
  const EVENT_TREE = [
    { id: 0, name: 'div#root', hasCapture: true, hasBubble: true, isContainer: true },
    { id: 1, name: 'div.layout', hasCapture: true, hasBubble: true, isContainer: false },
    { id: 2, name: 'section.card', hasCapture: true, hasBubble: true, isContainer: false },
    { id: 3, name: 'button.btn', hasCapture: true, hasBubble: true, isContainer: false }
  ];

  function simulateEventsAndBatching(opts) {
    const o = opts || {};
    const stopAtCard = !!o.stopAtCard;
    const triggerKind = o.triggerKind === 'setTimeout' || o.triggerKind === 'flushSync' ? o.triggerKind : 'click';
    const setStateCalls = Math.max(1, Math.min(5, Math.round(o.setStateCalls != null ? Number(o.setStateCalls) : 3)));

    const captureVisited = EVENT_TREE.map(n => n.name);
    const bubbleVisited = [];
    for (let i = EVENT_TREE.length - 1; i >= 0; i--) {
      bubbleVisited.push(EVENT_TREE[i].name);
      if (stopAtCard && i === 2) break;
    }

    const assignedLane = triggerKind === 'setTimeout' ? LANES.DefaultLane : LANES.SyncLane;
    const commitCount = triggerKind === 'flushSync' ? setStateCalls : 1;
    const batchedUpdates = triggerKind === 'flushSync' ? 0 : setStateCalls;

    return {
      tree: EVENT_TREE,
      stopAtCard,
      triggerKind,
      setStateCalls,
      nativeListenersAttached: 1,
      captureVisited,
      bubbleVisited,
      totalHandlersRun: captureVisited.length + bubbleVisited.length,
      assignedLane,
      assignedLaneName: triggerKind === 'setTimeout' ? 'DefaultLane (32)' : 'SyncLane (2)',
      commitCount,
      batchedUpdates,
      microtaskFlush: triggerKind !== 'flushSync'
    };
  }

  /* ═════════ ch9: 31-bit Lanes & Concurrent Preemption Scheduler ═════════ */
  function simulateLanesScheduler(opts) {
    const o = opts || {};
    const useTransition = o.useTransition !== false;
    const listNodes = Math.max(6, Math.min(24, Math.round(o.listNodes != null ? Number(o.listNodes) : 14)));
    const nodeCostMs = Math.max(0.5, Math.min(3.0, o.nodeCostMs != null ? Number(o.nodeCostMs) : 1.5));
    const keystrokeAtMs = Math.max(1, Math.min(20, o.keystrokeAtMs != null ? Number(o.keystrokeAtMs) : 7.0));
    const sliceBudgetMs = PINNED.frameIntervalMs; // 5 ms
    const keyRenderMs = 1.5;
    const commitOverheadMs = 1.0;

    const listLane = useTransition ? LANES.TransitionLane1 : LANES.DefaultLane;
    const canTimeSlice = (listLane & LANES.SyncDefaultMask) === 0; // React 19: 0 === (lanes & 127)
    const pendingMaskAtKeystroke = listLane | LANES.SyncLane;
    const pickedLaneAtKeystroke = lowestBit(pendingMaskAtKeystroke);

    const timeline = [];
    let t = 0;
    let remaining = listNodes;
    let yieldCount = 0;
    let preemptions = 0;
    let keyHandled = false;
    let keyCommitMs = 0;
    let listCommitMs = 0;

    if (!canTimeSlice) {
      // Non-interruptible renderRootSync: must render all listNodes + commit before keystroke
      const fullDur = Number((listNodes * nodeCostMs).toFixed(2));
      timeline.push({ kind: 'list', label: 'Sync/Default Render', start: 0, end: fullDur, nodes: listNodes, lane: listLane });
      t = fullDur;
      timeline.push({ kind: 'commit', label: 'Commit List', start: t, end: Number((t + commitOverheadMs).toFixed(2)), lane: listLane });
      t += commitOverheadMs;
      listCommitMs = Number(t.toFixed(2));

      const kStart = Math.max(t, keystrokeAtMs);
      const kEnd = Number((kStart + keyRenderMs + commitOverheadMs).toFixed(2));
      timeline.push({ kind: 'urgent', label: 'SyncLane Input', start: Number(kStart.toFixed(2)), end: kEnd, nodes: 1, lane: LANES.SyncLane });
      keyCommitMs = kEnd;
      t = kEnd;
    } else {
      // Concurrent time slicing at 5 ms slices + urgent SyncLane preemption
      while (remaining > 0) {
        if (!keyHandled && t >= keystrokeAtMs) {
          keyHandled = true;
          preemptions++;
          const uEnd = Number((t + keyRenderMs + commitOverheadMs).toFixed(2));
          timeline.push({ kind: 'urgent', label: 'SyncLane Input', start: Number(t.toFixed(2)), end: uEnd, nodes: 1, lane: LANES.SyncLane });
          keyCommitMs = uEnd;
          t = uEnd;
          continue;
        }
        const nodesInSlice = Math.max(1, Math.min(remaining, Math.floor(sliceBudgetMs / nodeCostMs)));
        const dur = Number((nodesInSlice * nodeCostMs).toFixed(2));
        timeline.push({ kind: 'transition', label: 'Transition Slice', start: Number(t.toFixed(2)), end: Number((t + dur).toFixed(2)), nodes: nodesInSlice, lane: listLane });
        t += dur;
        remaining -= nodesInSlice;
        if (remaining > 0) {
          yieldCount++;
          // Scheduler yields to browser event loop briefly (0.5 ms turnaround modeled)
          t += 0.5;
        }
      }
      timeline.push({ kind: 'commit', label: 'Commit List', start: Number(t.toFixed(2)), end: Number((t + commitOverheadMs).toFixed(2)), lane: listLane });
      t += commitOverheadMs;
      listCommitMs = Number(t.toFixed(2));

      if (!keyHandled) {
        const kStart = Math.max(t, keystrokeAtMs);
        const kEnd = Number((kStart + keyRenderMs + commitOverheadMs).toFixed(2));
        timeline.push({ kind: 'urgent', label: 'SyncLane Input', start: Number(kStart.toFixed(2)), end: kEnd, nodes: 1, lane: LANES.SyncLane });
        keyCommitMs = kEnd;
        t = kEnd;
      }
    }

    const inputLatencyMs = Number((keyCommitMs - keystrokeAtMs).toFixed(2));
    const droppedInputFrame = inputLatencyMs > PINNED.frameBudgetMs;

    return {
      useTransition,
      canTimeSlice,
      listLane,
      listLaneBits: bits31(listLane),
      pendingMaskAtKeystroke,
      pendingMaskBits: bits31(pendingMaskAtKeystroke),
      pickedLaneAtKeystroke,
      sliceBudgetMs,
      listNodes,
      nodeCostMs,
      keystrokeAtMs,
      keyCommitMs,
      listCommitMs,
      totalTimeMs: Number(t.toFixed(2)),
      inputLatencyMs,
      droppedInputFrame,
      yieldCount,
      preemptions,
      timeline
    };
  }

  /* ═════════ ch10: React Compiler 1.0 useMemoCache(size) slot model ═════════ */
  function simulateCompilerCache(opts) {
    const o = opts || {};
    const compiled = o.compiled !== false;
    const stepKind = o.stepKind === 'items' || o.stepKind === 'theme' ? o.stepKind : 'parentOnly';
    const renderCount = Math.max(1, Math.min(8, Math.round(o.renderCount != null ? Number(o.renderCount) : 4)));

    // Simulate render 1 (mount) + (renderCount - 1) subsequent updates of kind `stepKind`
    // Scope 0: $[0] = items, $[1] = filteredList (expensive work = 10 ops)
    // Scope 1: $[2] = theme, $[3] = <Header style /> JSX object
    let slots = Array(4).fill('SENTINEL');
    let filterComputes = 0;
    let jsxAllocs = 0;
    let slotHits = 0;
    let slotMisses = 0;
    let childBailedOut = 0;
    const trace = [];

    for (let r = 1; r <= renderCount; r++) {
      const itemsToken = stepKind === 'items' ? 'items@v' + r : 'items@v1';
      const themeToken = stepKind === 'theme' ? (r % 2 === 0 ? 'light' : 'dark') : 'dark';
      let s0Hit = false;
      let s1Hit = false;

      if (compiled) {
        if (slots[0] === itemsToken) {
          s0Hit = true;
          slotHits++;
        } else {
          slots[0] = itemsToken;
          slots[1] = 'filtered(' + itemsToken + ')';
          filterComputes++;
          slotMisses++;
        }
        if (slots[2] === themeToken) {
          s1Hit = true;
          slotHits++;
        } else {
          slots[2] = themeToken;
          slots[3] = '<Header ' + themeToken + '/>';
          jsxAllocs++;
          slotMisses++;
        }
        if (r > 1 && s0Hit && s1Hit) childBailedOut++;
      } else {
        filterComputes++;
        jsxAllocs++;
        slotMisses += 2;
      }

      trace.push({
        render: r,
        itemsToken,
        themeToken,
        scope0Hit: s0Hit,
        scope1Hit: s1Hit,
        childReused: compiled && r > 1 && s0Hit && s1Hit
      });
    }

    return {
      compiled,
      stepKind,
      renderCount,
      cacheSize: compiled ? 4 : 0,
      filterComputes,
      jsxAllocs,
      slotHits,
      slotMisses,
      childBailedOut,
      trace
    };
  }

  return {
    PINNED,
    WORK_TAGS,
    FIBER_FLAGS,
    HOOK_FLAGS,
    LANES,
    fmt,
    bits31,
    hexFlag,
    lowestBit,
    createElementSpec,
    inspectElementAndFiber,
    WORKLOOP_TREE,
    WORKLOOP_EVENTS,
    simulateWorkLoop,
    INITIAL_LIST,
    RECONCILE_SCENARIOS,
    reconcileList,
    simulateHooks,
    BUBBLE_TREE,
    traverseAndBubble,
    simulateCommitTimeline,
    EVENT_TREE,
    simulateEventsAndBatching,
    simulateLanesScheduler,
    simulateCompilerCache
  };
});
