---
lang: en
title: How React Updates the DOM · A Hands-on Essay
desc: Clicking a button and calling setCount(c => c + 1) does not edit a single DOM node right away. Following the React 19.3.1 source, this essay unpacks that line: immutable JSX element objects, the Fiber linked list and double buffering, two-pass O(n) list diffing and keys, hooks as a call-ordered linked list, subtreeFlags bubbling, the three commit phases and effect timing, root event delegation and microtask batching, 31-bit Lane scheduling, and the November 2026 frontier across React Compiler, Server Components, Activity, and View Transitions. Nine hands-on models implement the same algorithms and check them against React 19.3.1 itself.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.ms: {v} ms
u.none: none
u.calls: {v} calls
u.nodes: {v} nodes
ch2.col.node: Node
ch2.col.tag: Fiber tag
ch2.col.state: stateNode
ch2.col.props: Props summary
ch2.tag.0: Function (0)
ch2.tag.3: HostRoot (3)
ch2.tag.5: Host (5)
ch2.tag.6: Text (6)
:::

# How React Updates the DOM {#hero}

::: strings
kicker: Computing · Software principles · A hands-on long essay
:::

You click a button and your code runs `setCount(c =&gt; c + 1)`.<br>Between calling that function and seeing a new number on screen, what does React actually do? {.sub}

Anyone who builds interfaces with React calls a state setter almost every day. The screen changes quickly, yet rarely do we stop to ask: why does writing `&lt;Counter /&gt;` not run the function right away? Why does React maintain its own linked list of nodes instead of editing the DOM directly? Why can `useState` never live inside an `if`? And why does leaving out a list `key` make an input's typed text jump to the wrong row? This essay traces one path from end to end: **every data structure and algorithm between `setCount(c =&gt; c + 1)` and the browser painting new pixels on screen.** {.lead}

Every internal structure here matches **React {=react.ver}** (`react@{=react.ver}`, `react-dom@{=react.ver}`, `scheduler@{=sch.ver}`, released 14 October 2026). Bitmasks, field names and time-slicing thresholds come from that build; later releases may adjust them. The page loads no React bundle. Nine interactive models reimplement the underlying algorithms in a few dozen to two hundred lines, and a script cross-checks them against real `react@{=react.ver}` on identical inputs. For what happens after the browser paints a frame, see [[how-pixels-reach-a-screen#ch3|How Pixels Reach a Screen, chapter 3]]; for another library scheduling work against a browser frame budget, see [[how-threejs-draws-a-scene#ch1|How Three.js Draws a Scene]]. This essay was written by an AI; the closing note of each chapter states what its model leaves out. {.note}

## Two trees, two phases {#ch1}

::: strings
toc: Two trees, two phases
:::

At the moment you call `setState`, not a single DOM node on the page moves. React splits every update in two: an interruptible first half that computes without editing the screen, and a synchronous second half that commits DOM changes all at once. {.law}

Look at this minimal counter. When you click the button, `onClick` invokes `setCount(c =&gt; c + 1)`. If React tried to mutate the DOM text inside `&lt;span&gt;` immediately as it walked components, then a slow subtree of two thousand nodes would freeze typing and scrolling halfway through—you cannot pause or roll back a half-edited DOM.

::: html ch1-code
code.aria: A minimal React 19 counter program
code: "import { useState } from 'react';\nimport { createRoot } from 'react-dom/client';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;\n}\n\ncreateRoot(document.getElementById('root')).render(<Counter />);"
:::

React avoids half-baked screens with **two trees** and **two phases**. The tree currently visible on screen is `current`. Whenever an update arrives, React builds a draft tree in memory called `workInProgress` (wip). The **render phase** runs your component functions, diffs children, and sets flags only on that draft tree, touching zero DOM nodes—so it can pause every {=sch.slice} ms to yield the main thread back to the browser. Only once the entire draft tree finishes does React enter the **commit phase**: synchronous and uninterruptible, applying DOM mutations in one sweep and flipping the root pointer `root.current` to the new tree.

::: diagram dg-phases keys=dg.phases
cap: Figure 1. The five stages triggered by setCount(c => c + 1). Only Commit mutates the DOM, and Passive Effects wait until after the browser paints.
aria: Diagram: setCount queues a microtask, passes through the interruptible Render phase, synchronous Commit phase, browser paint, and finally asynchronous useEffect
s1: 1. Trigger & enqueue
s1s: setCount queues update & microtask
s2: 2. Render phase (interruptible)
s2s: Walks wip tree & sets dirty flags
s3: 3. Commit phase (synchronous)
s3s: Edits DOM, flips root, layout effect
s4: 4. Browser layout & paint
s4s: Computes layout & draws pixels
s5: 5. Passive effects
s5s: Runs useEffect cleanup & mount later
:::

Separating draft computation from DOM mutation unlocks everything that follows. Only because `workInProgress` lives off-screen can React pause mid-render, discard stale work, or let an urgent keystroke cut ahead of a slow list filter. The next eight chapters walk that pipeline in order: what JSX returns (chapter 2), why the tree became a linked list (chapter 3), how lists diff by key (chapter 4), where hooks live (chapter 5), how dirty bits bubble upward (chapter 6), and how commits, events and priority lanes coordinate with the browser (chapters 7–9).

This chapter is only the map. How many microseconds each phase takes depends on tree depth and component work; there is no single universal timing number. {.take}

## JSX is objects, not HTML {#ch2}

::: strings
toc: JSX is objects, not HTML
:::

Writing `&lt;Counter initial={1} /&gt;` neither runs `Counter` nor creates a single tag in the browser. JSX compiles down to a plain function call that hands back a lightweight, read-only description object. {.law}

The compiler turns JSX into calls to `jsx(type, props, maybeKey)` from `react/jsx-runtime`. Each call returns a small plain object (a React Element) with {=ch2.elemKeys} core fields: `$$typeof`, `type`, `key`, and `props`. In React {=react.ver}, `$$typeof` is `Symbol.for('react.transitional.element')`, guarding against spoofed JSON injected from untrusted data. For native tags such as `'div'`, `type` is the string `'div'`; for `&lt;Counter /&gt;`, `type` is just a function reference pointing to `Counter`.

This clears up a lasting misconception: components **never own DOM nodes directly**. What `Counter` returns is a nested tree of descriptions containing {=ch2.jsxDom} DOM nodes, and child component functions have run {=ch2.jsxCalls} times. Only later, when the reconciler walks that description during the render phase, does React create matching Fiber nodes and attach real DOM instances onto host fibers via `fiber.stateNode` inside `completeWork`.

::: diagram dg-element keys=dg.element
cap: Figure 2. Left: the immutable Element returned by JSX. Right: the mutable Fiber unit paired with it during reconciliation, where host nodes attach DOM elements on stateNode.
aria: Diagram: comparing the four fields of a React Element against a Fiber node's tag, stateNode, memoizedState, and linked-list pointers
el: React Element
e1: $$typeof: Symbol
e2: type: Counter
e3: key: null
e4: props: {...}
e5: read-only spec
fib: Fiber node
f1: tag: 0 / 5 / 6
f2: stateNode: DOM
f3: memoizedState
f4: child / sibling
f5: mutable unit
:::

In development builds, React even freezes element props against accidental mutation. An Element is disposable per render; the long-lived structure that persists across updates, holds hook state, and tracks DOM references is the **Fiber node** on the right. For a tiny `&lt;Counter /&gt;` tree, the initial JSX call creates one top element and {=ch2.jsxDom} DOM nodes; after reconciliation, that tree becomes {=ch2.fibers} Fiber nodes owning {=ch2.doms} real DOM nodes.

::: lab ch2-model
model.title: Element descriptors vs. Fiber nodes
model.how: Pick a JSX snippet and toggle between right after jsx() runs and after reconciliation builds Fibers. Watch how many objects exist, when component functions actually execute, and which Fibers hold DOM nodes.
ctl.preset: JSX snippet
pre.counter: <Counter initial={1} />
pre.card: <Card><Badge /></Card>
pre.native: <section><p>Hello</p></section>
ctl.stage: Snapshot timing
st.jsx: Right after jsx()
st.rec: After Fiber reconciliation
cv.aria: Diagram mapping Element descriptors to Fiber work units and real DOM nodes
cv.colEl: Element spec
cv.colFib: Fiber node
cv.colDom: Real DOM
cv.nodom: no DOM yet
cv.nofib: no Fiber yet
read.el: Top JSX objects
read.fib: Fiber nodes
read.dom: DOM nodes allocated
read.fn: Component calls run
say.jsx: Right after <code>jsx()</code> runs: React holds <em>{el}</em> lightweight descriptor, component functions ran <em>{fn}</em> times, and <em>0</em> DOM nodes exist in the browser.
say.reconciled: After reconciliation walks the tree, <em>{fib}</em> Fiber nodes stand in memory (running {fn} component functions); only host Fibers allocate {dom} real DOM nodes in <code>stateNode</code>.
:::

Switch the preset to `&lt;Card&gt;&lt;Badge /&gt;&lt;/Card&gt;` and inspect the `stateNode` column: `Card` and `Badge` (`tag = 0`, `FunctionComponent`) have `stateNode = null`. Function components have no container node in the browser DOM; only host tags like `'article'` and `'strong'` (`tag = 5`, `HostComponent`) back real elements.

The model omits: the `ref` field, how React 19 keeps `key` out of `props`, `_owner` / `_debugStack` dev diagnostics, and lazy or promise elements streamed from Server Components. {.take}

## The Fiber linked list and double buffering {#ch3}

::: strings
toc: The Fiber linked list and double buffering
:::

If rendering were ordinary JavaScript recursion, you could not pause halfway through a deep tree until every call returned from the stack. React flattened recursion into three explicit pointers and two alternating trees so it can stop every 5 ms. {.law}

Before React 16, rendering walked the element tree with plain recursive calls—once started, a thousand components blocked the main thread until the stack unwound. **Fiber** replaces the call stack with three hand-maintained pointers on each node: `child` (first child), `sibling` (next sibling), and `return` (parent). A single loop variable `workInProgress` marches iteratively through `while (workInProgress !== null && !shouldYield())`: descend along `child` via `beginWork`, finish a leaf with `completeWork`, step across to `sibling`, or climb back up via `return`.

Before advancing to each next Fiber, the scheduler (`scheduler@{=sch.ver}`) checks whether elapsed slice time has reached **{=sch.slice} ms** (`frameInterval = 5`). When the budget runs out, the loop simply breaks, posts a macrotask over `MessageChannel`, and hands the main thread back to the browser for input and painting. Next slice, React resumes from the exact `workInProgress` pointer still sitting in memory.

::: diagram dg-fiber keys=dg.fiber
cap: Figure 3. Fibers wire the tree via child (cyan), sibling (gold), and return (violet dashed) pointers so traversal can pause anywhere. current and wip point to each other via alternate for double buffering.
aria: Diagram: five Fiber nodes linked by child, sibling, and return pointers, plus current and workInProgress double-buffered trees linked by alternate
n0: HostRoot
n1: App
n2: Header
n3: Footer
n4: Logo
cur: current (A)
wip: wip (B)
lc: child
ls: sibling
lr: return
:::

Pausing alone is not enough—what if higher-priority work interrupts an unfinished draft? React borrows **double buffering** from graphics pipelines. Every Fiber carries an `alternate` pointer linking the node on `current` (what is live on screen) to its twin on `workInProgress`. While `createWorkInProgress` reuses `current.alternate` objects without fresh allocations, `current` never moves. If a higher-priority update preempts or cancels the draft, React simply drops `workInProgress` and the live screen remains intact.

::: lab ch3-model
model.title: The Fiber workLoop and 5 ms time slicing
model.how: Click Step Unit or Run One Slice, or scrub the progress and budget sliders (default 5 ms). Enable the step-4 preemption toggle to see how discarding a half-built wip tree leaves the live current tree untouched.
ctl.units: Work units done
ctl.budget: Slice budget
ctl.preempt: Preempt at unit 4
btn.step: Step 1 unit
btn.slice: Run 1 slice
btn.reset: Reset
cv.aria: Live current tree on the left, draft workInProgress tree on the right, and time-slice budget bar
cv.left: current tree (live)
cv.right: workInProgress (draft)
cv.slice: Slice
read.cursor: Active cursor
read.yields: Main-thread yields
read.alt: Reused alternates
read.dom: Live DOM tree
say.start: Render has not started. The browser displays the intact <code>current</code> tree (A) with {total} nodes waiting.
say.running: Rendering slice {slice} on the draft tree, having just run <code>{phase}</code> on <code>{cursor}</code> ({yields} yields so far, {alt} alternates reused). The screen still shows intact tree A.
say.done: All {total} units finished across {slice} slices with <em>{yields}</em> main-thread yields. <code>root.current</code> flips to tree B and the DOM updates atomically.
say.preempt: An urgent update cut in at unit 4! React threw away the unfinished draft while the live <code>current</code> tree (A) remained <em>completely intact</em> with zero torn DOM.
:::

At the model's default 1.6 ms per node and a {=sch.slice} ms budget across {=ch3.nodes} nodes, React splits work into {=ch3.slices} slices and yields {=ch3.yields} times. Watch the live DOM indicator: until the very last unit completes, `root.current` stays pinned to tree A.

The model omits: initial mount allocation when `alternate === null`, subtree bailouts when props and lanes are clean (chapter 6), and real browser `MessageChannel` callback queuing. {.take}

## Reconciliation and why keys matter {#ch4}

::: strings
toc: Reconciliation and why keys matter
:::

Finding the minimum edit distance between two arbitrary trees takes O(n³) time—a billion steps for a thousand nodes. React cuts that to a single-level O(n) scan in two passes, leaning on element type and developer-supplied keys to recognize identity. {.law}

React trims complexity to O(n) with three heuristics: differing `type` values replace the whole subtree rather than matching deeper inside; comparisons only run sibling-to-sibling at the same parent depth; and `key` identifies which old sibling corresponds to which new element across reorders.

Look at how `reconcileChildrenArray` in React {=react.ver} walks a list across **two passes**:
- **Pass 1 (positional match)**: Starting at `newIdx = 0`, React pairs old Fibers with new Elements slot by slot. While `key` and `type` match, it reuses the Fiber in place. The instant a `key` differs, **Pass 1 breaks immediately**. {#r1}
- **Pass 2 (Map lookup)**: If both old Fibers and new Elements remain, React dumps remaining old Fibers into a `Map` (`existingChildren`, keyed by `oldFiber.key`, falling back to `oldFiber.index` when omitted). For each remaining new element, it looks up `existingChildren.get(key)`, clones its Fiber, and compares `oldIndex` against `lastPlacedIndex` inside `placeChild`: if `oldIndex &lt; lastPlacedIndex`, the DOM node must move right (`Placement` flag); otherwise it stays put and `lastPlacedIndex` advances to `oldIndex`. {#r2}

::: diagram dg-reconcile keys=dg.reconcile
cap: Figure 4. Prepending X before [A, B, C]. With key = item.id, Pass 1 breaks at index 0 and reuses A, B, and C without moving DOM. With array indices as keys, slots 0..2 match blindly and attach A's state to X.
aria: Diagram: comparing id keys vs array-index keys when prepending a new item X to [A, B, C]
old: Before
byId: key = item.id
idRes: Mount X; reuse A, B, C with 0 DOM moves
byIdx: key = index
idxRes: Slots 0..2 match blindly: A state leaks to X
:::

That explains why using **array indices as keys** (`key = index`) silently corrupts state on prepends or reorders: turning `[A, B, C, D]` into `[X, A, B, C, D]` with index keys gives both lists keys `"0", "1", "2", "3"` at the first four slots. Pass 1 never breaks! Slot 0's old Fiber—still holding whatever draft text `'note-A'` the user typed into row A—gets paired with new data `X`.

::: lab ch4-model
model.title: Two-pass list diffing and key identity
model.how: Pick a list edit such as Prepend X and switch between key=item.id and key=index. Watch the local state badges held on Fibers A and C leak onto the wrong rows under index keys.
ctl.sc: List change
sc.prepend: Prepend X
sc.reverse: Reverse order
sc.swap: Swap B and C
sc.deleteB: Delete B
ctl.key: Key choice
key.id: key = item.id
key.index: key = index
cv.aria: Pairing lines between four old Fibers and the new Element list, showing moves, mounts, and misplaced state drafts
cv.old: Old Fibers
cv.new: New Elements
read.reused: Fibers reused
read.moves: DOM moves needed
read.mounts: New mounts
read.bug: State mismatches
say.clean: Pass 1 or Pass 2 matched {reused} existing Fibers by identity ({mounts} new mount, 0 DOM moves) with <em>0</em> state mismatches across rows.
say.moves: Matched {reused} Fibers by <code>id</code>; by the <code>lastPlacedIndex</code> rule, <em>{moves}</em> older Fibers fell behind the cursor and need DOM moves, while every row's state stayed intact.
say.mismatch: Look closely: with index keys, React blindly reused {reused} Fibers by position, causing <em>{bug} local component states</em> from other rows to stick onto the wrong items—with zero console warnings.
:::

Check the default Prepend X case: with `key = item.id`, Pass 1 halts on index 0 (`'X'` vs `'A'`), Pass 2 recovers all {=ch4.idReused} existing Fibers, mounts {=ch4.idMounts} new `X`, and performs **{=ch4.idMoves}** DOM moves on `A/B/C/D` (just inserting `X` at the front). Switch to index keys, and all {=ch4.idxReused} old Fibers match positionally, leaving **{=ch4.idxMismatch}** row states stranded on the wrong items.

The model omits: replacing an entire subtree when element `type` changes (such as `&lt;div&gt;` becoming `&lt;span&gt;`), `reconcileSingleElement` for single-child parents, and raw string/number text children. {.take}

## Hooks live on a linked list {#ch5}

::: strings
toc: Hooks live on a linked list
:::

A function component re-runs from top to bottom on every update, throwing away local variables each time. React stores no hook names at runtime—it hangs every hook sequentially on a singly-linked list attached to `fiber.memoizedState`. {.law}

Inspect `mountWorkInProgressHook` in React {=react.ver}: each hook is a five-field object (`memoizedState`, `baseState`, `baseQueue`, `queue`, and `next`). On first render, the first `useState` allocates node 0, the second `useState` links onto node 0's `.next`, and `useEffect` links onto node 1's `.next`. Nowhere in memory does React record `"count"` or `"name"`.

On every subsequent render, `updateWorkInProgressHook` simply marches two cursors (`currentHook` and `workInProgressHook`) forward one `.next` step per call. Because identity depends strictly on call index, wrapping hook 0 in an `if` that skips it later shifts `useState(name)` into call #0—reading the integer `10` stored in slot 0—and shifts `useEffect` into slot 1, ending with `"Rendered fewer hooks than during the previous render"`.

Where do multiple `setCount(c =&gt; c + 1)` calls in one handler queue up? Each state hook's `queue.pending` holds a **circular singly-linked list**: `pending` always points to the *last* enqueued update, whose `.next` wraps right back to the *first* update so enqueueing takes O(1) time. Next render, `updateReducer` breaks the ring (`first = last.next; last.next = null`) and replays updates sequentially from `baseState` ({=ch5.prev}). Any lower-priority update skipped in that pass—along with every update queued behind it—is copied into `baseQueue` so later passes preserve exact ordering.

::: diagram dg-hooks keys=dg.hooks
cap: Figure 5. Fiber.memoizedState chains Hooks in strict call order; Hook 0 owns a circular queue.pending ring where last.next wraps around to first.
aria: Diagram: Fiber.memoizedState linked list of Hook 0, Hook 1, and Hook 2, with a circular pending update ring attached below Hook 0
fib: Fiber
h0: Hook 0
h1: Hook 1
h2: Hook 2
q: pending
u1: u1
u2: u2
ring: last.next wraps to first for O(1) append
:::

::: lab ch5-model
model.title: Hook cursor list and circular update queue
model.how: Pick a queued update sequence and watch the circular ring unwrap from tail.next to compute the new state. Toggle skipping Hook 0 inside an if to watch the cursor misalign, or mark update #1 low priority to watch baseQueue preserve it.
ctl.q: Queued updates
q.incDouble: +1 then ×2
q.doubleInc: ×2 then +1
q.setInc: set 5 then +1
ctl.skip: Skip Hook 0 in if()
ctl.low: Update #1 is Transition
cv.aria: Singly-linked Fiber.memoizedState cursor mapping and circular queue.pending ring below Hook 0
cv.list: memoizedState list
cv.ring: Circular queue.pending
read.prev: Initial baseState
read.next: Computed state
read.base: Saved in baseQueue
read.cursor: Cursor status
st.ok: 3/3 aligned
st.err: Mismatch error
say.normal: Cursors stepped cleanly 0→1→2. Breaking the circular ring at <code>tail.next</code> replayed updates from {prev} to produce <em>{next}</em> with an empty <code>baseQueue</code>.
say.skipped: Update #1 (TransitionLane) was skipped for low priority, so it and every update after it copied into <em>baseQueue</em> ({base} saved) while <code>baseState</code> stayed at {bstate} to prevent state drift.
say.error: Cursor mismatch! Skipping Hook 0 shifted <code>useState('Ada')</code> onto slot 0 (reading <em>{next}</em>) and threw off the remaining count—triggering React's hook-order error.
:::

With the default `+1 then ×2` queue starting from {=ch5.prev}, `(10 + 1) × 2` lands on **{=ch5.next}**. Flip the order to `×2 then +1`, and replaying the same two updaters yields `21`—which is why functional updaters always receive the previous updater's output rather than a stale render snapshot.

The model omits: `useState`'s eager-state fast path (bailing out before scheduling when `Object.is(eagerState, currentState)`), React dev-mode double invocation of components/reducers, and `fiber.updateQueue` storing passive/layout effect rings separately. {.take}

## beginWork, completeWork, and subtreeFlags {#ch6}

::: strings
toc: beginWork, completeWork, and subtreeFlags
:::

When one leaf changes inside ten thousand components, walking the entire tree again during commit would waste most of your frame budget. React bubbles dirty bits upward with bitwise OR inside `completeWork` so commit touches only flagged branches. {.law}

Every node visited during render passes through two steps: `beginWork` on the way down—calling component functions and diffing children, or bailing out early (`attemptEarlyBailoutIfNoScheduledUpdate`) when props and lanes are clean—followed by `completeWork` on the way back up.

For host tags like `&lt;div&gt;`, `completeWork` allocates new DOM elements (`createInstance`) and appends child DOM nodes (`appendAllChildren`) off-screen on mount, or computes prop diffs on updates. Then `bubbleProperties` runs on every completed Fiber, bitwise-ORing each child's `flags | subtreeFlags` into the parent's `subtreeFlags` (and `lanes | childLanes` into `childLanes`).

::: diagram dg-flags keys=dg.flags
cap: Figure 6. completeWork bubbles flags upward via bitwise OR into subtreeFlags. Any branch whose subtreeFlags bitmask is 0 gets skipped outright during commit.
aria: Diagram: left branch leaf carries flag 0x04 bubbling up to Main and Root subtreeFlags, while clean right branch Nav has subtreeFlags 0x00 and is skipped
root: Root sub:0x04
left: Main sub:0x04
clean: Nav sub:0x00
leaf: Item flag:0x04
bub: completeWork bubbles: flags | subtreeFlags
skip: Mask 0: skip branch
:::

Once commit starts from the root, it checks `(child.subtreeFlags & CommitMask) !== 0` before descending. Clean subtrees are never even entered. In our {=ch6.total}-node tree, updating one deep leaf (`Post2`) sets `Update` (`0x0004`), lets render bail out of untouched siblings, and leaves commit visiting only {=ch6.commitVis} ancestor nodes while skipping **{=ch6.commitSkip}** clean nodes (**{=ch6.skipPct}** skipped).

::: lab ch6-model
model.title: Traversal and subtreeFlags skip counter
model.how: Pick an update preset or click any node directly on the canvas to mark it dirty. Watch flags bubble up to the root in hex and compare Render visits against Commit skips.
ctl.preset: Dirty scenario
pre.leaf: One deep leaf update
pre.two: Two leaves (Update + Placement)
pre.del: Nav ChildDeletion
pre.shell: Multi-branch Shell update
cv.aria: 15-node component tree highlighting Render visits, bubbled hex subtreeFlags, and clean branches skipped in Commit
cv.legVis: Render visited
cv.legCom: Commit entered
cv.legSkip: Clean skipped
read.render: Render visited
read.commit: Commit entered
read.skip: Commit skipped
read.mask: Root subtreeFlags
say: Root collected <code>subtreeFlags = {mask}</code>. Out of {total} nodes, Render visited {render} (bailing out of clean subtrees), and synchronous Commit entered just <em>{commit}</em> nodes while skipping <em>{skip}</em> clean nodes ({pct} skipped).
:::

Compare a single leaf update against a high-level `Shell` update: the clean `Nav`, `Sidebar`, and `Footer` subtrees remain completely untouched during commit. React 19 also preserves static flags across renders using `StaticMask` (`0x47f00000`, or `1206910976`) instead of wiping them on every alternate reuse.

The model omits: Suspense error unwinding via `unwindUnitOfWork`, context dependency propagation (`didReceiveUpdate`), and the exact bit differences across `MutationMask` (`13878`), `LayoutMask` (`8772`), and `PassiveMask` (`10256`). {.take}

## Commit phases and when Effects run {#ch7}

::: strings
toc: Commit phases and when Effects run
:::

Render can pause whenever time runs out, but commit cannot pause for a millisecond—showing half-inserted nodes would break layout on screen. React runs three synchronous commit sub-phases, lets the browser paint, and schedules `useEffect` into a separate task afterward. {.law}

In `commitRootImpl` (React {=react.ver}), once `workInProgress` finishes, React executes a strict sequence on the main thread:
1. **BeforeMutation**: Reads pre-mutation DOM metrics (for class `getSnapshotBeforeUpdate`) while `current` is still live. {#s1}
2. **Mutation**: Walks subtrees matching `MutationMask` to append, insert, remove, and update DOM nodes, and runs `useInsertionEffect` plus previous `useLayoutEffect` cleanups. {#s2}
3. **The pointer flip (`root.current = finishedWork`)**: One assignment swaps the live tree reference to the newly committed Fibers. {#s3}
4. **Layout (still before paint!)**: Walks `LayoutMask` to attach `ref`s and run **`useLayoutEffect`** synchronously. The DOM is already updated, yet **no pixels have been painted yet**—measuring `getBoundingClientRect()` and calling `setState` inside `useLayoutEffect` triggers a synchronous re-render and DOM update before the frame hits the glass, preventing visual flicker at the price of delaying paint. {#s4}
5. **Browser Layout & Paint**: React yields the main thread; the browser lays out CSS, rasterizes, and sends the frame toward the {=frame.ms} ms refresh budget ([[how-pixels-reach-a-screen#ch3|How Pixels Reach a Screen, chapter 3]]). {#s5}
6. **Passive (`flushPassiveEffects`)**: Scheduled earlier via Scheduler `NormalPriority` (`MessageChannel`), running `useEffect` cleanups and callbacks *after* the browser has painted. {#s6}

::: diagram dg-commit keys=dg.commit
cap: Figure 7. Main-thread timeline from Render through useEffect. Gold and red commit phases block Browser Paint directly; violet useEffect runs in a later task without delaying the first frame.
aria: Diagram: main-thread order of Render, Mutation, LayoutEffect (useLayoutEffect), Browser Paint, and asynchronous PassiveEffect (useEffect)
sync: Synchronous Commit (never yields)
b1: Render
b2: Mutate
b3: Layout
b4: Paint
b5: Effect
p1: root.current = wip after Mutate
p2: useLayoutEffect runs before Paint
p3: useEffect runs later after Paint
:::

::: lab ch7-model
model.title: Frame timeline: useLayoutEffect vs. useEffect
model.how: Drag the Render, useLayoutEffect, and useEffect sliders, and toggle whether tooltip repositioning runs in useLayoutEffect or useEffect. Watch the 16.67 ms 60 Hz frame line and the flicker indicator.
ctl.render: Render time
ctl.layout: useLayoutEffect time
ctl.passive: useEffect time
ctl.hook: Measure tooltip inside
hk.layout: useLayoutEffect (pre-paint)
hk.passive: useEffect (post-paint)
cv.aria: Main-thread horizontal timeline showing Render, Commit phases, the 16.67 ms frame deadline, Browser Paint, and Passive Effects
cv.x: Main-thread time (ms)
cv.budget: 16.67 ms budget
cv.paintAt: Painted at
read.paint: Time to first paint
read.total: Total incl. Effects
read.drop: Dropped 60 Hz frames
read.flash: First-frame flicker
val.yes: 1-frame flash
val.no: No flicker
say.layoutOk: <code>useLayoutEffect</code> measured and repositioned the tooltip synchronously before paint (first paint at <em>{paint} ms</em>), beating the {budget} ms frame deadline with <em>zero flicker</em>.
say.layoutSlow: Using <code>useLayoutEffect</code> prevented position flicker, but blocking the main thread pushed first paint out to <em>{paint} ms</em>—dropping <em>{drop} frame(s)</em> on a 60 Hz display.
say.passiveFlash: First paint finished cleanly at <em>{paint} ms</em> without blocking, but because <code>useEffect</code> measured dimensions and called <code>setState</code> after paint, users see the tooltip <em>flash for 1 frame</em> at the wrong spot first.
:::

With default 4 ms Render, 1.5 ms Mutation, and 6 ms `useLayoutEffect`, synchronous pre-paint re-measurement hits the glass in **{=ch7.paintLayout} ms** inside one frame; moving that adjustment into `useEffect` paints earlier at **{=ch7.paintPassive} ms** but flashes one wrong frame first. The trade-off is simple: keep side effects in `useEffect` unless avoiding a visible one-frame layout jump requires `useLayoutEffect`.

The model omits: variable browser style/layout cost on complex CSS (modeled as a fixed 2.0 ms paint parameter), `useInsertionEffect` style injection during Mutation, and `flushSync` forcing pending passive effects to flush early. {.take}

## Event delegation and automatic batching {#ch8}

::: strings
toc: Event delegation and automatic batching
:::

Even with ten thousand `&lt;button onClick={...}&gt;` elements on a page, React never calls `addEventListener` ten thousand times. It attaches one listener per event type on the root container, maps the target DOM node back to its Fiber, walks `return` pointers to simulate capture and bubble, and batches every `setState` in that turn inside one microtask. {.law}

When `createRoot(container)` mounts, `listenToAllSupportedEvents(container)` attaches **{=ch8.listeners}** delegated root listener pair per supported event type (capture and bubble). Meanwhile, React tags every managed DOM node with a hidden property `__reactFiber$&lt;random&gt;` pointing straight to its host Fiber.

When you click a nested `&lt;button&gt;`, the native browser event bubbles up to the root container. React's `dispatchEvent` grabs `nativeEvent.target`, resolves the button's Fiber in O(1), and walks `fiber.return` upward to the root—collecting every `onClickCapture` (replayed top-down) and `onClick` (replayed bottom-up). Calling `e.stopPropagation()` inside a React `onClick` halts React's synthetic walk along `return` pointers, though remember the native event already bubbled to `#root` before React ran.

Just as important is what happens when your handler updates multiple states in a row. Inside React 19's `ensureRootIsScheduled`, whether `setState` runs inside a React `onClick`, a `setTimeout`, or a `Promise.then`, every update enters a queue and schedules one microtask (`processRootScheduleInMicrotask`). Once synchronous code finishes, **{=ch8.calls}** consecutive `setState` calls coalesce into **{=ch8.commits}** render and commit—unless you wrap each update in `ReactDOM.flushSync`, forcing **{=ch8.syncCommits}** immediate synchronous commits.

::: diagram dg-events keys=dg.events
cap: Figure 8. A click bubbles natively to #root's single delegated listener. React locates the button Fiber via __reactFiber$, walks return pointers for capture (cyan) and bubble (violet), and batches updates at the microtask checkpoint.
aria: Diagram: native event bubbling from button to div#root, synthetic capture and bubble along Fiber return pointers, and microtask batching
root: div#root (1 native listener)
card: section.card
btn: button.btn (clicked target)
nat: Native bubble to #root
syn: Synthetic capture → bubble via Fiber
bat: Batched into 1 microtask commit
:::

::: lab ch8-model
model.title: Event delegation and microtask batching
model.how: Switch between a React onClick, a setTimeout/Promise callback, and per-call flushSync, adjust how many setState calls run in a row, and test stopPropagation on the middle card layer.
ctl.trig: Update context
tr.click: React onClick
tr.async: setTimeout / Promise
tr.flush: Per-call flushSync
ctl.calls: Consecutive setState calls
ctl.stop: Call stopPropagation on card
cv.aria: Native bubbling to root, synthetic capture and bubble paths across four layers, and microtask batch count
cv.nat: Native bubble
cv.cap: Synthetic capture
cv.bub: Synthetic bubble
read.native: Root listeners attached
read.handlers: Synthetic handlers run
read.lane: Assigned Lane
read.commits: Total commits
say.batched: With {native} delegated root listener, synthetic dispatch ran {handlers} handlers. All {calls} <code>setState</code> calls batched into <em>1</em> render & commit at the microtask boundary ({lane}).
say.flush: Wrapping each update in <code>flushSync</code> bypassed microtask batching—forcing {calls} <code>setState</code> calls into <em>{commits} separate</em> synchronous commits.
:::

The event system also assigns update urgency at entry: `click`, `keydown`, and `input` map to `SyncLane` (`2`); continuous events like `mousemove` and `scroll` map to `InputContinuousLane` (`8`); and `setTimeout` or network callbacks default to `DefaultLane` (`32`). How those lanes preempt each other comes next.

The model omits: non-bubbling events like `scroll` or `focus` attached directly at target elements, cross-browser synthetic event field normalization, and React 16's legacy delegation onto `document` instead of the root container. {.take}

## Lanes and concurrent scheduling {#ch9}

::: strings
toc: Lanes and concurrent scheduling
:::

React does not track a single current priority number; it packs urgency into a 31-bit integer bitmask (`Lanes`) on the root so urgent typing can preempt an in-progress transition filter without losing the older render. {.law}

Why a bitmask instead of a single priority field? Because multiple updates of different urgency often sit on the same Fiber simultaneously. React {=react.ver} allocates **{=ch9.totalLanes}** lanes (bits 0..30): bit 1 is **`SyncLane = {=ch9.syncLane}`** (discrete clicks and typing), bit 3 is **`InputContinuousLane = 8`** (drag and scroll), bit 5 is **`DefaultLane = 32`** (timers and promises), and bits 8..21 hold **`TransitionLane1 = {=ch9.transLane}`** onward (`startTransition` and `useDeferredValue`).

When `root.pendingLanes` holds two pending bits at once—say `256 | 2 = 258` (`0b0100000010`)—`getNextLanes` picks the highest-priority lane in one bit trick: `lanes & -lanes` isolates the lowest set bit (`2`, i.e., `SyncLane`), beating `256`.

Crucially, look at `performWorkOnRoot` in React 19.3.1: `shouldTimeSlice = (!forceSync && 0 === (lanes & 127) && 0 === (lanes & root.expiredLanes))`. Notice **`127`** (`0b01111111`, covering Sync, InputContinuous, and Default lanes): ordinary clicks and `setTimeout` updates do **not** time-slice once started, avoiding partial-state tearing. Only updates routed to bit 8 or higher via **`startTransition`** or **`useDeferredValue`** satisfy `(lanes & 127) === 0`, enabling `renderRootConcurrent` to yield every {=sch.slice} ms!

::: diagram dg-lanes keys=dg.lanes
cap: Figure 9. React 19.3.1's 31-bit Lane bitmask (higher bit numbers mean lower urgency). lanes & -lanes extracts the rightmost set bit to decide which task runs next.
aria: Diagram: positions of SyncLane, InputContinuousLane, DefaultLane, TransitionLanes, and IdleLane in a 31-bit mask plus lanes & -lanes extraction
hdr: 31-bit priority lanes (bits 0..30)
l0: Sync
l1: Input
l2: Default
l3: Transition
l4: Idle
pick: lanes & -lanes → picks lowest bit
slice: Only bits ≥ 8 (Transition) slice at 5 ms
:::

Suppose a slow 21 ms `startTransition` list filter starts at `t = 0`, and you press a key at `t = 7 ms` (`SyncLane`). At the end of the current 5 ms slice, `getNextLanes` sees `SyncLane` waiting, pauses or discards the transition draft, renders and commits your keystroke immediately, and later resumes the transition cleanly over `baseQueue` so both states stay consistent. Should an external mutable store change mid-slice and risk **tearing** across yields, React 19 calls `isRenderConsistentWithExternalStores` before commit (or `useSyncExternalStore` forces a synchronous fallback).

::: lab ch9-model
model.title: 31-bit Lane scheduler and preemption trace
model.how: Keep startTransition checked to watch a slow 14-node list yield every 5 ms and step aside for a keystroke arriving at 7 ms. Uncheck startTransition to compare non-interruptible blocking latency.
ctl.trans: Wrap list filter in startTransition
ctl.nodes: Slow list nodes
ctl.keyat: Keystroke arrives at
cv.aria: Millisecond timeline comparing 5 ms transition slices and urgent SyncLane preemption against blocking synchronous rendering
cv.x: Time (ms)
cv.wait: Wait latency
read.bits: Contested pendingLanes
read.yields: Time-slice yields
read.lat: Input latency
read.list: List committed at
say.concurrent: Running on <code>TransitionLane1 (256)</code> (<code>lanes & 127 === 0</code>) enables 5 ms slices. When the keystroke arrives at {at} ms, <code>lanes & -lanes</code> picks <em>SyncLane (2)</em> to preempt immediately—committing input in <em>{lat} ms</em> without dropping a frame before finishing the list.
say.blocked: Without <code>startTransition</code>, the list runs on <code>DefaultLane (32)</code> (<code>lanes & 127 !== 0</code>) with no time slicing! The keystroke at {at} ms waits until every node renders and commits, spiking latency to <em>{lat} ms</em> (missing the 16.7 ms frame budget).
:::

In the default 14-node scenario, `startTransition` keeps keystroke latency down at **{=ch9.transLat} ms**, well inside a frame, whereas an un-transitioned `setState` blocks the main thread until **{=ch9.syncLat} ms**—blowing right past the 16.67 ms refresh deadline (see [[how-pixels-reach-a-screen#ch11|How Pixels Reach a Screen, chapter 11]] for the hardware leg after React finishes).

The model omits: rotation across multiple `TransitionLanes` (`256..2097152`), `expirationTimes` starvation promotion forcing overdue transitions synchronous, and `RetryLanes` when concurrent renders suspend. {.take}

## Where the frontier is (November 2026) {#ch10}

::: strings
toc: Where the frontier is
:::

Across recent releases, React's engine has pushed along two complementary tracks: static compile-time caching that eliminates manual `useMemo` calls, and moving non-interactive subtrees onto the server as a streamed tree protocol. {.law}

### Established {#h.est .sub3}

- Double-buffered Fibers, two-pass O(n) key reconciliation, call-ordered `memoizedState` hook linked lists with circular `queue.pending`, 31-bit Lane bitmasks, and delegated root events with microtask batching form the settled architecture of React 18–19. {#e1}
- Browser scheduling constraints—roughly 16.67 ms per 60 Hz frame, 50 ms long-task thresholds, and yielding via `MessageChannel` so Layout and Paint can run—are fixed by the Web platform. {#e2}

### Already built {#h.demo .sub3}

- **React 19.0** (released 5 December 2024): introduced `Symbol.for('react.transitional.element')`, stabilized Actions (`useActionState`, `useOptimistic`), `use()`, and **React Server Components (RSC)** streaming UI trees over the line-delimited **Flight wire protocol** (chunks like `0:"text"` and `["$","div",null,{...}]`). {#d1}
- **React 19.2** (released 1 October 2025): shipped **`&lt;Activity mode="visible" | "hidden"&gt;`** (`Symbol.for('react.activity')`) and `useEffectEvent`. A hidden `&lt;Activity&gt;` hides DOM via `display: none`, unmounts its Effects, and defers updates to idle priority while **preserving internal state and inputs**. {#d2}
- **React Compiler 1.0** (released 7 October 2025): a build-time Babel compiler that analyzes reactive data flow and rewrites components to call `c(size)` from `react/compiler-runtime` (`useMemoCache(size)` backed by `fiber.updateQueue.memoCache`), automating `useMemo`, `useCallback`, and `React.memo`. {#d3}
- **React 19.3 and 19.3.1** (released 9 September and 14 October 2026—our pinned build): graduated **`&lt;ViewTransition&gt;`** (animating enter, exit, update, and shared elements automatically inside `startTransition`, `&lt;Suspense&gt;`, or `useDeferredValue`), Fragment Refs, `addTransitionType`, and `react-dom.browser`, alongside Flight decoder hardening following CVE-2025-55182 ("React2Shell", December 2025) and 2026 parser fixes. {#d4}

::: lab ch10-model
model.title: React Compiler's useMemoCache slot model
model.how: Toggle React Compiler on and off across repeated renders. Change only an unrelated parent counter (parentOnly) to watch c(4) cache slots skip recomputing filtered lists and reuse child JSX identity without React.memo.
ctl.comp: Enable React Compiler (c(4))
ctl.what: What changes per render
w.parent: Unrelated parent state only
w.theme: Toggle theme each render
w.items: New items array each render
ctl.renders: Consecutive renders
cv.aria: Four useMemoCache slots showing cache hits, recomputations, and automatic child JSX bailouts across renders
cv.slot: Cache slot
read.slots: Fiber cache slots
read.hits: Cache slot hits
read.calc: Filter recomputations
read.bail: Child bailouts
say.hit: The compiler allocated {slots} <code>memoCache</code> slots. Across {renders} parent renders, dependencies matched cached slots <em>{hits} times</em>, computing the expensive filter only {calc} time and triggering {bail} child bailouts with zero manual <code>React.memo</code>.
say.recompute: Because <code>{what}</code> changed every render, <code>$[k] !== dep</code> missed on that scope and recomputed {calc} times—while the untouched scope still hit its slot ({hits} total hits).
say.uncompiled: With the compiler off and no manual memoization, all {renders} renders recomputed the filter <em>{calc} times</em> and allocated {calc} fresh JSX objects, forcing child reconciliation every single time.
:::

In this {=ch10.slots}-slot model (storing `[dep, value]` for two reactive scopes), changing only unrelated parent state across 4 renders hits cache slots **{=ch10.hits} times** and runs the filter once, whereas the uncompiled component without manual memoization runs it **{=ch10.offRuns} times**.

### Boundaries, plans and open questions {#h.claim .sub3}

- **Compiler assumptions**: React Compiler relies on code following the Rules of React (pure render, no mutating props or external state after JSX creation); components that violate those rules are skipped by the compiler and fall back to unmemoized execution, making `eslint-plugin-react-hooks` checks part of standard adoption. {#c1}
- **RSC trust boundaries & tooling coupling**: Because the Flight wire protocol deserializes element trees and Server Action payloads across the network boundary, parser strictness is a direct security boundary (highlighted by CVE-2025-55182 and 2026 hardening releases); full-stack RSC workflows also remain closely tied to bundler and framework integrations. {#c2}
- **Browser View Transition parity**: `&lt;ViewTransition&gt;` wraps the browser's View Transition API, so complex concurrent Suspense reveals and multi-browser rendering still require testing across browser engines as of November 2026. {#c3}

Release dates, advisories, and compiler tooling evolve quickly; every frontier claim in this chapter carries its November 2026 date, so check current release notes before relying on it. {.take}

## Wrap-up: when React is slow or wrong, ask three questions first {#ch11}

::: strings
toc: Wrap-up: ask three questions
:::

You do not need to memorize 31 bit positions or every internal helper. Next time a React screen stutters, drops keystrokes, or mixes up state, ask these three questions: {.law}

{.qs}
- **Did render run too often, or was a single render too heavy?** Separate unrelated parent state dragging clean subtrees into repeated work (chapter 6: preserve prop identity via React Compiler or composition so bailouts fire) from genuinely heavy list updates hogging synchronous lanes (chapter 9: move non-urgent work into `startTransition` or `useDeferredValue` so `SyncLane` keystrokes preempt cleanly). {#q1}
- **Did Reconciliation lose Fiber identity or Hook call order?** Typing state jumping rows when items prepend or sort points straight to array-index keys (`key = index`) or unstable keys (chapter 4: switch to stable item IDs); hook count errors or scrambled values point to conditional or looped Hook calls shifting the `memoizedState` cursor (chapter 5). {#q2}
- **Are you reading or editing the DOM in the wrong phase?** A tooltip flashing at the old position for one frame means measurement happened post-paint in `useEffect` (chapter 7: move that layout read-write to `useLayoutEffect`); conversely, blank frames or jank often stem from heavy work inside blocking `useLayoutEffect` or `flushSync` breaking microtask batching (chapters 7–8). {#q3}

In one sentence: calling `setState` does not edit the webpage—it appends a lane-tagged update to a Fiber node so React can compute a draft tree in time-sliced chunks, bubble dirty bitmasks upward, flip `root.current` and mutate DOM nodes in one synchronous sweep, and run passive effects after the browser paints. {#sum .sum}

Related essays: [[how-pixels-reach-a-screen#ch3|How Pixels Reach a Screen]] (what happens after React hands frames to the browser compositor and display pipeline) and [[how-threejs-draws-a-scene#ch1|How Three.js Draws a Scene]] (another browser engine translating a retained object tree into low-level commands inside the same 16.67 ms frame budget). {#links}

::: footer
**Sources.** React 19.3.1 source & npm packages (`react@19.3.1`, `react-dom@19.3.1`, `scheduler@0.28.0`, released 14 October 2026): `react/cjs/react.development.js`, `react/cjs/react-jsx-runtime.development.js`, `react/cjs/react-compiler-runtime.development.js`, `react-dom/cjs/react-dom-client.development.js` (`FiberNode`, `createWorkInProgress`, `reconcileChildrenArray`, `mountWorkInProgressHook`, `updateWorkInProgressHook`, `useMemoCache`, `beginWork`, `completeWork`, `bubbleProperties`, `workLoopConcurrentByScheduler`, `commitRootImpl`, `flushLayoutEffects`, `flushPassiveEffects`, `dispatchEvent`, `processRootScheduleInMicrotask`, `getHighestPriorityLanes`, `getNextLanes`, `performWorkOnRoot`), and `scheduler/cjs/scheduler.development.js` (`frameInterval = 5`, `MessageChannel`). File and line references are recorded in `BRIEF.md`.

Official React release notes and advisories (react.dev, verified November 2026): React v19 (2024-12-05), React v19.2 (2025-10-01, `&lt;Activity&gt;` and `useEffectEvent`), React Compiler v1.0 (2025-10-07), React v19.3 (2026-09-09, `&lt;ViewTransition&gt;` and Fragment Refs), and CVE-2025-55182 (disclosed December 2025) with subsequent Flight protocol decoder hardening.

**The model.** The page loads no React package. Element construction, iterative Fiber pointers, two-pass key reconciliation with `lastPlacedIndex`, hook cursors and circular `queue.pending`, bitwise `subtreeFlags` bubbling, Commit/Paint phase ordering, root delegation and microtask batching, 31-bit Lane preemption, and `useMemoCache` slot hits are rewritten from the React 19.3.1 source. `tools/crosscheck.cjs` checks them directly against installed `react@19.3.1`, `react-dom@19.3.1`, and `scheduler@0.28.0` on matching inputs (recorded in `BRIEF.md`). Browser paint timing uses a parameterized cost model rather than live style/layout measurement. This essay was written with Antigravity AI.
:::
