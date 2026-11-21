#!/usr/bin/env node
'use strict';
/* Compares models.js algorithms and constants directly against real React 19.3.1 / ReactDOM 19.3.1 / Scheduler 0.28.0.
   Usage: node computing/software/how-react-updates-the-dom/tools/crosscheck.cjs [/tmp/agent-tasks/software/how-react-updates-the-dom] */
const fs = require('fs');
const path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));

const installDir = path.resolve(process.argv[2] || '/tmp/agent-tasks/software/how-react-updates-the-dom');
const NM = path.join(installDir, 'node_modules');

let n = 0, bad = 0;
const rows = [];
function cmp(name, got, want) {
  n++;
  const g = typeof got === 'object' ? JSON.stringify(got) : got;
  const w = typeof want === 'object' ? JSON.stringify(want) : want;
  const ok = g === w;
  if (!ok) bad++;
  rows.push(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `  got=${g} want=${w}`}`);
}
function ok(name, cond, info) {
  n++;
  if (!cond) bad++;
  rows.push(`${cond ? 'ok  ' : 'FAIL'} ${name}${!cond && info ? '  (' + info + ')' : ''}`);
}

/* Minimal DOM environment in Node so real react-dom/client createRoot runs natively */
function makeDom() {
  const mkEl = (tag) => ({
    nodeType: 1, tagName: tag.toUpperCase(), nodeName: tag.toUpperCase(),
    children: [], childNodes: [], parentNode: null, style: {}, attributes: {}, listeners: {},
    get textContent() { return this.childNodes.map(c => c.nodeType === 3 ? c.nodeValue : c.textContent).join(''); },
    set textContent(v) {
      this.childNodes.forEach(c => { c.parentNode = null; });
      this.childNodes = [];
      this.children = [];
      if (v !== '' && v != null) this.appendChild(doc.createTextNode(String(v)));
    },
    get ownerDocument() { return doc; },
    get firstChild() { return this.childNodes[0] || null; },
    get nextSibling() {
      if (!this.parentNode) return null;
      const i = this.parentNode.childNodes.indexOf(this);
      return i >= 0 ? this.parentNode.childNodes[i + 1] || null : null;
    },
    appendChild(c) {
      if (c.parentNode) c.parentNode.removeChild(c);
      c.parentNode = this; this.childNodes.push(c);
      if (c.nodeType === 1) this.children.push(c);
      return c;
    },
    insertBefore(c, ref) {
      if (!ref) return this.appendChild(c);
      if (c.parentNode) c.parentNode.removeChild(c);
      c.parentNode = this;
      const i = this.childNodes.indexOf(ref);
      this.childNodes.splice(i >= 0 ? i : this.childNodes.length, 0, c);
      this.children = this.childNodes.filter(x => x.nodeType === 1);
      return c;
    },
    removeChild(c) {
      const i = this.childNodes.indexOf(c);
      if (i >= 0) this.childNodes.splice(i, 1);
      this.children = this.childNodes.filter(x => x.nodeType === 1);
      c.parentNode = null;
      return c;
    },
    setAttribute(k, v) { this.attributes[k] = String(v); },
    removeAttribute(k) { delete this.attributes[k]; },
    addEventListener(t, fn, cap) { (this.listeners[t] = this.listeners[t] || []).push({ fn, cap: !!cap }); },
    removeEventListener() {},
    contains(other) { let cur = other; while (cur) { if (cur === this) return true; cur = cur.parentNode; } return false; }
  });
  const doc = {
    nodeType: 9, documentElement: null, body: null, defaultView: null, activeElement: null,
    createElement: mkEl, createElementNS: (_, t) => mkEl(t),
    createTextNode: (txt) => ({
      nodeType: 3, nodeValue: String(txt), textContent: String(txt), parentNode: null,
      get ownerDocument() { return doc; },
      get nextSibling() {
        if (!this.parentNode) return null;
        const i = this.parentNode.childNodes.indexOf(this);
        return i >= 0 ? this.parentNode.childNodes[i + 1] || null : null;
      }
    }),
    createComment: (t) => ({ nodeType: 8, nodeValue: t, parentNode: null, get ownerDocument() { return doc; } }),
    addEventListener() {}
  };
  doc.documentElement = mkEl('html');
  doc.body = mkEl('body');
  doc.documentElement.appendChild(doc.body);
  return doc;
}

const doc = makeDom();
global.document = doc;
global.HTMLElement = function () {};
global.HTMLIFrameElement = function () {};
global.Element = function () {};
global.Node = function () {};
global.IS_REACT_ACT_ENVIRONMENT = true;
global.window = {
  document: doc, navigator: global.navigator,
  HTMLIFrameElement: global.HTMLIFrameElement,
  addEventListener() {}, removeEventListener() {}, event: undefined
};
doc.defaultView = global.window;

const React = require(path.join(NM, 'react'));
const ReactDOM = require(path.join(NM, 'react-dom'));
const { createRoot } = require(path.join(NM, 'react-dom/client'));
const JsxRuntime = require(path.join(NM, 'react/jsx-runtime'));
const CompilerRuntime = require(path.join(NM, 'react/compiler-runtime'));
const schPkg = JSON.parse(fs.readFileSync(path.join(NM, 'scheduler/package.json'), 'utf8'));
const rdSrc = fs.readFileSync(path.join(NM, 'react-dom/cjs/react-dom-client.development.js'), 'utf8');
const schSrc = fs.readFileSync(path.join(NM, 'scheduler/cjs/scheduler.development.js'), 'utf8');

(async () => {
  /* 1. Package versions & source constants */
  cmp('react version', React.version, M.PINNED.react);
  cmp('react-dom version', ReactDOM.version, M.PINNED.reactDom);
  cmp('scheduler version', schPkg.version, M.PINNED.scheduler);
  ok('React 19.3 exports Activity & ViewTransition', !!React.Activity && !!React.ViewTransition);
  ok('scheduler frameInterval = 5', /frameInterval\s*=\s*5\b/.test(schSrc));
  ok('scheduler uses MessageChannel', /MessageChannel/.test(schSrc));
  ok('react-dom source defines DiscreteEventPriority = 2', /DiscreteEventPriority\s*=\s*2\b/.test(rdSrc));
  ok('react-dom source defines ContinuousEventPriority = 8', /ContinuousEventPriority\s*=\s*8\b/.test(rdSrc));
  ok('react-dom source defines DefaultEventPriority = 32', /DefaultEventPriority\s*=\s*32\b/.test(rdSrc));
  ok('react-dom source defines IdleEventPriority = 268435456', /IdleEventPriority\s*=\s*268435456\b/.test(rdSrc));
  ok('react-dom source masks SyncDefaultMask (lanes & 127)', /\(lanes\s*&\s*127\)/.test(rdSrc));
  ok('react-dom source uses StaticMask 1206910976', /1206910976/.test(rdSrc));
  ok('react-dom source uses MutationMask 13878', /subtreeFlags\s*&\s*13878/.test(rdSrc));
  ok('react-dom source uses LayoutMask 8772', /subtreeFlags\s*&\s*8772/.test(rdSrc));
  ok('react-dom source uses PassiveMask 10256', /subtreeFlags\s*&\s*10256/.test(rdSrc));

  /* 2. ch2: JSX element object & deferred component call */
  {
    let calls = 0;
    function Counter(props) {
      calls++;
      return JsxRuntime.jsx('div', {
        className: 'box',
        children: [
          JsxRuntime.jsx('span', { children: String(props.initial) }, 's'),
          JsxRuntime.jsx('button', { children: '+1' }, 'b')
        ]
      });
    }
    const el = JsxRuntime.jsx(Counter, { initial: 1 });
    cmp('jsx $$typeof matches react.transitional.element', String(el.$$typeof), M.createElementSpec(Counter, {}).$$typeof);
    cmp('jsx() executes component 0 times (matches model)', calls, M.inspectElementAndFiber('counter', 'jsx').stats.fnCallsAtJsx);
    ok('jsx() freezes props in dev', Object.isFrozen(el.props));
    const rootEl = doc.createElement('div');
    const root = createRoot(rootEl);
    React.act(() => root.render(el));
    cmp('after reconcile: Counter called 1 time', calls, 1);
    const divEl = rootEl.childNodes[0];
    const fk = Object.keys(divEl).find(k => k.startsWith('__reactFiber$'));
    const divFiber = divEl[fk];
    const compFiber = divFiber.return;
    cmp('FunctionComponent tag === 0 & stateNode === null', [compFiber.tag, compFiber.stateNode], [M.WORK_TAGS.FunctionComponent, null]);
    cmp('HostComponent tag === 5 & stateNode === DOM', [divFiber.tag, divFiber.stateNode === divEl], [M.WORK_TAGS.HostComponent, true]);
    cmp('HostRoot tag === 3', compFiber.return.tag, M.WORK_TAGS.HostRoot);
  }

  /* 3. ch3: Fiber linked pointers & alternate double buffer */
  {
    let setN = null;
    function App() {
      const [n, s] = React.useState(1);
      setN = s;
      return JsxRuntime.jsx('main', {
        children: [
          JsxRuntime.jsx('h1', { children: String(n) }, 'h'),
          JsxRuntime.jsx('p', { children: 'ok' }, 'p')
        ]
      });
    }
    const rootEl = doc.createElement('div');
    const root = createRoot(rootEl);
    React.act(() => root.render(JsxRuntime.jsx(App, {})));
    const mainEl = rootEl.childNodes[0];
    const fk = Object.keys(mainEl).find(k => k.startsWith('__reactFiber$'));
    const mainFiber = mainEl[fk];
    const appFiber = mainFiber.return;
    ok('child / sibling / return pointers connect h1 -> p -> main -> App',
      mainFiber.child.type === 'h1' &&
      mainFiber.child.sibling.type === 'p' &&
      mainFiber.child.sibling.return === mainFiber &&
      mainFiber.return === appFiber);
    React.act(() => setN(2));
    const ck = Object.keys(rootEl).find(k => k.startsWith('__reactContainer$'));
    ok('update creates alternate twin on Fiber', !!rootEl[ck].child.alternate && rootEl[ck].child !== appFiber);
  }

  /* 4. ch4: O(n) reconciliation: id keys vs index keys state preservation */
  {
    function Row(props) {
      const [draft] = React.useState(() => (props.id === 'A' ? 'note-A' : props.id === 'C' ? 'note-C' : ''));
      return JsxRuntime.jsx('li', { 'data-id': props.id, 'data-draft': draft, children: props.id + ':' + draft });
    }
    function runReconcile(useIdxKey) {
      let setItems = null;
      function List() {
        const [items, s] = React.useState(['A', 'B', 'C', 'D']);
        setItems = s;
        return JsxRuntime.jsx('ul', {
          children: items.map((id, idx) => JsxRuntime.jsx(Row, { id }, useIdxKey ? idx : id))
        });
      }
      const c = doc.createElement('div');
      const r = createRoot(c);
      React.act(() => r.render(JsxRuntime.jsx(List, {})));
      const ul = c.childNodes[0];
      const origA = ul.childNodes[0];
      React.act(() => setItems(['X', 'A', 'B', 'C', 'D']));
      const rowsAfter = ul.childNodes.map(li => ({ id: li.attributes['data-id'], draft: li.attributes['data-draft'], sameDomAsA: li === origA }));
      return rowsAfter;
    }
    const byId = runReconcile(false);
    const byIdx = runReconcile(true);
    const modId = M.reconcileList('prepend', 'id');
    const modIdx = M.reconcileList('prepend', 'index');
    const mismatchesId = byId.filter(r => r.draft !== '' && !((r.id === 'A' && r.draft === 'note-A') || (r.id === 'C' && r.draft === 'note-C'))).length;
    const mismatchesIdx = byIdx.filter(r => r.draft !== '' && !((r.id === 'A' && r.draft === 'note-A') || (r.id === 'C' && r.draft === 'note-C'))).length;
    cmp('key=id preserves 0 state mismatches & reuses A DOM node', [mismatchesId, byId[1].sameDomAsA], [modId.stats.stateMismatches, true]);
    cmp('key=index causes 2 state mismatches (X gets note-A, B gets note-C)', [mismatchesIdx, byIdx[0].draft, byIdx[2].draft], [modIdx.stats.stateMismatches, 'note-A', 'note-C']);
  }

  /* 5. ch5: Hook linked list, functional queue ordering, and rule-of-hooks error */
  {
    let setC = null, hookErr = null;
    function HookDemo(props) {
      let c, s;
      if (!props.skipFirst) {
        [c, s] = React.useState(10);
        setC = s;
      } else {
        c = -1;
      }
      const [name] = React.useState('Ada');
      React.useEffect(() => {}, [c]);
      return JsxRuntime.jsx('div', { children: `${c}:${name}` });
    }
    const c = doc.createElement('div');
    const r = createRoot(c);
    React.act(() => r.render(JsxRuntime.jsx(HookDemo, { skipFirst: false })));
    const divEl = c.childNodes[0];
    const fk = Object.keys(divEl).find(k => k.startsWith('__reactFiber$'));
    const compFiber = divEl[fk].return;
    // Check 3-node memoizedState chain: 10 -> 'Ada' -> effect object
    cmp('Fiber.memoizedState hook 0 & 1 values', [compFiber.memoizedState.memoizedState, compFiber.memoizedState.next.memoizedState], [10, 'Ada']);
    ok('Fiber.memoizedState hook 2 is effect object', compFiber.memoizedState.next.next !== null && compFiber.memoizedState.next.next.next === null);

    // Enqueue +1 then *2 (same order as model default)
    React.act(() => { setC(x => x + 1); setC(x => x * 2); });
    cmp('functional queue +1 then *2 = 22 (matches model)', c.childNodes[0].textContent, `${M.simulateHooks({ actions: ['inc', 'double'] }).memoizedState}:Ada`);

    // Reverse: *2 then +1 from fresh mount = 21
    const c2 = doc.createElement('div');
    const r2 = createRoot(c2);
    let setC2 = null;
    function HookDemo2() {
      const [v, sv] = React.useState(10);
      setC2 = sv;
      return JsxRuntime.jsx('div', { children: String(v) });
    }
    React.act(() => r2.render(JsxRuntime.jsx(HookDemo2, {})));
    React.act(() => { setC2(x => x * 2); setC2(x => x + 1); });
    cmp('functional queue *2 then +1 = 21 (matches model)', c2.childNodes[0].textContent, String(M.simulateHooks({ actions: ['double', 'inc'] }).memoizedState));

    // Conditional skip with useEffect crashes reading Hook 1's useState object as an Effect (.deps undefined),
    // and skipping Hook 0 in a pure useState pair hits React's "Rendered fewer hooks" check!
    const origErr = console.error; console.error = () => {};
    try {
      React.act(() => r.render(JsxRuntime.jsx(HookDemo, { skipFirst: true })));
    } catch (e) {
      hookErr = e.message;
    } finally {
      console.error = origErr;
    }
    ok('skipping Hook 0 shifts useEffect onto Hook 1 state slot and crashes', /length|Rendered fewer hooks/.test(String(hookErr)), hookErr);

    let hookErr2 = null;
    function TwoStates(props) {
      if (!props.skipFirst) React.useState(10);
      const [name] = React.useState('Ada');
      return JsxRuntime.jsx('div', { children: name });
    }
    const c3 = doc.createElement('div');
    const r3 = createRoot(c3);
    React.act(() => r3.render(JsxRuntime.jsx(TwoStates, { skipFirst: false })));
    const origErr2 = console.error; console.error = () => {};
    try {
      React.act(() => r3.render(JsxRuntime.jsx(TwoStates, { skipFirst: true })));
    } catch (e) {
      hookErr2 = e.message;
    } finally {
      console.error = origErr2;
    }
    ok('skipping Hook 0 in TwoStates throws "Rendered fewer hooks"', /Rendered fewer hooks/.test(String(hookErr2)), hookErr2);
  }

  /* 6. ch7: Effect execution order: render -> useInsertionEffect -> useLayoutEffect -> useEffect */
  {
    const log = [];
    function EffComp() {
      log.push('render');
      React.useInsertionEffect(() => { log.push('insertion'); }, []);
      React.useLayoutEffect(() => { log.push('layout'); }, []);
      React.useEffect(() => { log.push('passive'); }, []);
      return JsxRuntime.jsx('div', {});
    }
    const c = doc.createElement('div');
    React.act(() => createRoot(c).render(JsxRuntime.jsx(EffComp, {})));
    cmp('commit/effect phase ordering matches ch7', log, ['render', 'insertion', 'layout', 'passive']);
  }

  /* 7. ch8: Delegated listeners, automatic batching & flushSync */
  {
    let renders = 0, s1, s2, s3;
    function BatchComp() {
      renders++;
      const [a, sa] = React.useState(0);
      const [b, sb] = React.useState(0);
      const [d, sd] = React.useState(0);
      s1 = sa; s2 = sb; s3 = sd;
      return JsxRuntime.jsx('button', { onClick: () => { sa(1); sb(1); sd(1); }, children: `${a + b + d}` });
    }
    const c = doc.createElement('div');
    React.act(() => createRoot(c).render(JsxRuntime.jsx(BatchComp, {})));
    ok('root container registers delegated click listener', Array.isArray(c.listeners.click) && c.listeners.click.length >= 1);
    ok('button does NOT hold native DOM addEventListener', !c.childNodes[0].listeners.click);

    renders = 0;
    React.act(() => { s1(1); s2(1); s3(1); });
    cmp('3 setState calls batch into 1 render (matches model)', renders, M.simulateEventsAndBatching({ triggerKind: 'setTimeout', setStateCalls: 3 }).commitCount);

    renders = 0;
    React.act(() => {
      ReactDOM.flushSync(() => s1(2));
      ReactDOM.flushSync(() => s2(2));
      ReactDOM.flushSync(() => s3(2));
    });
    cmp('3 flushSync calls force 3 separate renders (matches model)', renders, M.simulateEventsAndBatching({ triggerKind: 'flushSync', setStateCalls: 3 }).commitCount);
  }

  /* 8. ch9: startTransition sets ReactSharedInternals.T so transition lane != SyncLane */
  {
    let seenTransitionObj = false;
    React.startTransition(() => {
      seenTransitionObj = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.T !== null;
    });
    ok('startTransition sets internal T scope for TransitionLanes', seenTransitionObj);
    cmp('SyncLane (2) < TransitionLane1 (256) via lowestBit(258)', M.lowestBit(M.LANES.SyncLane | M.LANES.TransitionLane1), M.LANES.SyncLane);
  }

  /* 9. ch10: React Compiler c(size) / useMemoCache(4) in live React 19.3.1 */
  {
    let filterComputes = 0, childRenders = 0;
    const ChildMemo = function Child(props) { childRenders++; return JsxRuntime.jsx('span', { children: props.list.join(',') }); };
    let setParent = null;
    function CompiledParent() {
      const $ = CompilerRuntime.c(4);
      const [count, setCount] = React.useState(0);
      setParent = setCount;
      const items = React.useRef(['a', 'b']).current;
      const theme = 'dark';
      let t0;
      if ($[0] !== items) {
        filterComputes++;
        t0 = items.map(x => x.toUpperCase());
        $[0] = items;
        $[1] = t0;
      } else {
        t0 = $[1];
      }
      let t1;
      if ($[2] !== t0) {
        t1 = JsxRuntime.jsx(ChildMemo, { list: t0, theme });
        $[2] = t0;
        $[3] = t1;
      } else {
        t1 = $[3];
      }
      return JsxRuntime.jsx('div', { 'data-count': count, children: t1 });
    }
    const c = doc.createElement('div');
    React.act(() => createRoot(c).render(JsxRuntime.jsx(CompiledParent, {})));
    for (let k = 1; k <= 3; k++) React.act(() => setParent(k));
    const mod = M.simulateCompilerCache({ compiled: true, stepKind: 'parentOnly', renderCount: 4 });
    cmp('React Compiler c(4): 4 parent renders -> 1 filter compute, 1 child render', [filterComputes, childRenders], [mod.filterComputes, 1]);
  }

  console.log(rows.join('\n'));
  console.log(`${n - bad}/${n} crosschecks passed`);
  if (bad) process.exit(1);
})();
