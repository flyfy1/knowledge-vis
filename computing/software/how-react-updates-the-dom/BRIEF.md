# BRIEF — how-react-updates-the-dom

Author: Antigravity (gemini-flash-worker-agy, thinking: on, effort unavailable; planner: gemini-pro-orchestrator-neon, thinking: effort=1.00), 2026-11-21. Task: W3 of the Software Core Principles series (`computing/software/how-react-updates-the-dom/`).
Status: unregistered draft (`page.json` omits `"status"` and `"order"`, expecting the draft build warning). Full bilingual essay (`content.zh.md` and `content.en.md` authored together; no `"languages": {"en": "stub"}`).

## Essay question

What actually happens between calling `setCount(c => c + 1)` and seeing new pixels on screen — why JSX isn't HTML, how the Fiber tree pauses without blowing the call stack, how lists diff in O(n), where hooks live, why commit runs synchronously before paint while `useEffect` waits until after, how delegated events batch updates, and how 31-bit Lanes preempt slow work?

## Pinned release

- **React 19.3.1**: `react@19.3.1`, `react-dom@19.3.1` (released `2026-10-14T16:47:15Z`), `scheduler@0.28.0`.
- Installed for reading and live crosscheck in `/tmp/agent-tasks/software/how-react-updates-the-dom/node_modules/` (scratch only, never committed into the repository).

## Chapter outline & models

11 chapters (`#ch1`..`#ch11`), 9 interactive canvas models (`ch2`..`ch10`), 9 static inline-SVG diagrams (`dg-*`), 1 minimal code block (`ch1-code`), and 3 closing diagnostic questions (`.qs`):

1. **Two trees, two phases (`#ch1`)** — Law: calling `setState` does not edit DOM nodes; render computes an off-screen `workInProgress` tree and commit flips `root.current` synchronously. Diagram: `dg-phases`. Code: `ch1-code`.
2. **JSX is objects, not HTML (`#ch2`)** — Law: JSX lowers to `jsx()` returning immutable `{ $$typeof, type, key, props }` objects (`Symbol.for('react.transitional.element')`); components do not hold DOM nodes until Reconciliation pairs Fibers. Diagram: `dg-element`. Model (`ch2-model`): `inspectElementAndFiber`, toggles JSX snippet (`counter`/`card`/`native`) and stage (`jsx`/`reconciled`). Limits: omits `ref`, `_owner`/`_debugStack`, and Server lazy elements.
3. **The Fiber linked list and double buffering (`#ch3`)** — Law: flattening tree traversal into explicit `child`, `sibling`, `return`, and `alternate` pointers lets `workLoopConcurrentByScheduler` pause every `frameInterval = 5 ms` via `MessageChannel` and discard half-built drafts without touching `current`. Diagram: `dg-fiber`. Model (`ch3-model`): `simulateWorkLoop`, interactive unit/slice step buttons, budget slider (default 5 ms), step-4 preemption toggle. Limits: omits `alternate === null` initial allocation, bailouts (ch6), and live `MessageChannel` queuing.
4. **Reconciliation and why keys matter (`#ch4`)** — Law: O(n) single-level two-pass diffing (`reconcileChildrenArray` + `placeChild` / `lastPlacedIndex`), showing why index keys mispair component local state on prepends/reorders. Diagram: `dg-reconcile`. Model (`ch4-model`): `reconcileList`, 4 list edits (`prepend`, `reverse`, `swap`, `deleteB`) × key strategy (`id` vs `index`), tracking reused fibers, DOM moves, mounts, and stranded state drafts. Limits: omits element `type` replacement and raw text child shortcuts.
5. **Hooks live on a linked list (`#ch5`)** — Law: hooks have no runtime names and chain sequentially on `fiber.memoizedState`, while updates append to circular `queue.pending` in O(1) (`tail.next = head`) and rebase skipped low-priority updates into `baseQueue`. Diagram: `dg-hooks`. Model (`ch5-model`): `simulateHooks`, selects update queue (`+1 then ×2`, `×2 then +1`, `set 5 then +1`), conditional Hook-0 skip toggle, and low-priority Transition skip toggle. Limits: omits `eagerState` fast path, StrictMode dev double-invocation, and `fiber.updateQueue` effect rings.
6. **`beginWork`, `completeWork`, and `subtreeFlags` (`#ch6`)** — Law: `completeWork` bubbles child `flags | subtreeFlags` upward via bitwise OR (`bubbleProperties`) so commit skips clean subtrees in O(changed). Diagram: `dg-flags`. Model (`ch6-model`): `traverseAndBubble`, clickable 15-node indented Fiber tree + 4 dirty presets showing `renderVisited` vs `commitVisited` vs `commitSkipped` and hex `subtreeFlags`. Limits: omits Suspense unwinding (`unwindUnitOfWork`), context consumers, and exact per-phase mask differences (`MutationMask = 13878`, `LayoutMask = 8772`, `PassiveMask = 10256`).
7. **Commit phases and when Effects run (`#ch7`)** — Law: `commitRootImpl` runs `beforeMutation`, `mutation`, flips `root.current = finishedWork`, and runs `layout` (`useLayoutEffect`) synchronously before browser paint, while `useEffect` runs asynchronously after paint (`flushPassiveEffects`). Diagram: `dg-commit`. Model (`ch7-model`): `simulateCommitTimeline`, controls for Render / `useLayoutEffect` / `useEffect` ms and tooltip re-measurement hook (`layout` vs `passive`) plotted against `16.67 ms` 60 Hz frame budget. Limits: parameterized 2.0 ms browser paint overhead; omits `useInsertionEffect` style insertion and `flushSync` passive flushing.
8. **Event delegation and automatic batching (`#ch8`)** — Law: one root container listener per event type maps DOM targets back to Fibers via `__reactFiber$`, walks `return` pointers for capture/bubble, and coalesces updates in `processRootScheduleInMicrotask` unless forced via `flushSync`. Diagram: `dg-events`. Model (`ch8-model`): `simulateEventsAndBatching`, selects context (`click`, `setTimeout/Promise`, `flushSync`), consecutive `setState` count (1–5), and `stopPropagation` on middle `section.card`. Limits: omits non-bubbling events (`scroll`/`focus`), synthetic field normalization, and React 16 `document` delegation.
9. **31-bit Lanes and concurrent scheduling (`#ch9`)** — Law: React packs mixed-urgency updates into a 31-bit Lane bitmask (`lanes & -lanes` picks lowest set bit), slicing only updates outside `SyncDefaultMask` (`127`, i.e., `TransitionLane1 = 256+`) so urgent typing (`SyncLane = 2`) preempts slow list filters cleanly. Diagram: `dg-lanes`. Model (`ch9-model`): `simulateLanesScheduler`, toggles `startTransition`, adjusts list node count (6–24) and keystroke arrival ms (2–16 ms). Limits: omits transition lane rotation (`256..2097152`), `expirationTimes` starvation promotion, and `RetryLanes`.
10. **Where the frontier is (November 2026) (`#ch10`)** — Separates Established (Fiber, 31-bit Lanes, O(n) reconciliation, Web Event Loop), Already Built (React 19.0 Actions/RSC Flight `2024-12-05`, React 19.2 `<Activity>`/`useEffectEvent` `2025-10-01`, React Compiler 1.0 `2025-10-07`, React 19.3/19.3.1 `<ViewTransition>`/Fragment Refs/Flight security hardening `2026-09-09` & `2026-10-14`), and Boundaries/Open Questions (Rules of React bailout rules, RSC Flight security boundary following CVE-2025-55182, cross-browser View Transition parity). Model (`ch10-model`): `simulateCompilerCache`, models `useMemoCache(4)` (`c(4)`) slot hits/recomputes/bailouts vs uncompiled renders.
11. **Wrap-up: ask three questions first (`#ch11`)** — 3 actionable debugging questions (`.qs`), `.sum`, and live cross-links to `[[how-pixels-reach-a-screen#ch3]]` and `[[how-threejs-draws-a-scene#ch1]]`.

## Verified React 19.3.1 source references (installed `node_modules`)

- `react/cjs/react.development.js`:
  - line 687: `REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element")`
  - lines 699–700: `REACT_ACTIVITY_TYPE = Symbol.for("react.activity")`, `REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition")`
  - line 1325: `exports.version = "19.3.1"`
- `react/cjs/react-jsx-runtime.development.js`:
  - lines 155–175: `ReactElement(type, key, props, ...)`
- `react/cjs/react-compiler-runtime.development.js`:
  - `exports.c = function (size) { ... return dispatcher.useMemoCache(size); }`
- `scheduler/cjs/scheduler.development.js`:
  - lines 214–226: `frameInterval = 5`, `MessageChannel` (`port.postMessage(null)`)
  - lines 231–236: `ImmediatePriority = 1`, `UserBlockingPriority = 2`, `NormalPriority = 3`, `LowPriority = 4`, `IdlePriority = 5`
- `react-dom/cjs/react-dom-client.development.js`:
  - lines 1150–1249: `getHighestPriorityLanes`, `getNextLanes` (`lanes & 42`, `lanes & -lanes`, `4194048`)
  - lines 1485–1509: `lanesToEventPriority`, `resolveUpdatePriority`
  - line 4885: `markUpdateLaneFromFiberToRoot`
  - lines 5064–5130: `FiberNode`, `createWorkInProgress` (`StaticMask = 1206910976`)
  - lines 6533–6583: `deleteChild` (`flags |= 16`), `placeChild` (`flags |= 2`, `lastPlacedIndex`)
  - lines 6979–7075: `reconcileChildrenArray` two-pass traversal
  - lines 8192–8450: `mountWorkInProgressHook`, `updateWorkInProgressHook`, `useMemoCache`, `updateReducer`
  - lines 9506–9545: `dispatchSetState`
  - lines 12052–12115: `beginWork`
  - lines 12823–12925: `bubbleProperties`, `completeWork`
  - lines 15029–15831: `commitLayoutEffectOnFiber`, `commitMutationEffectsOnFiber`
  - lines 16864–17126: `commitPassiveMountOnFiber` (`PassiveMask = 10256`)
  - lines 17824–18055: `requestUpdateLane`, `performWorkOnRoot` (`shouldTimeSlice`: `0 === (lanes & 127)`, `isRenderConsistentWithExternalStores`)
  - lines 19168–19342: `workLoopConcurrentByScheduler`, `performUnitOfWork`, `completeUnitOfWork`
  - lines 19522–20096: `commitRoot`, `root.current = finishedWork`, `flushLayoutEffects` (`LayoutMask = 8772`), `flushPassiveEffects`
  - lines 20472–20580: `ensureRootIsScheduled`, `processRootScheduleInMicrotask`, `scheduleTaskForRootDuringMicrotask`
  - lines 20897–20945 & 26133–26854: `listenToAllSupportedEvents`, `dispatchEvent`, `getEventPriority`, `DiscreteEventPriority = 2`, `ContinuousEventPriority = 8`, `DefaultEventPriority = 32`, `IdleEventPriority = 268435456`, `__reactFiber$`

## Crosscheck against real React 19.3.1 (`tools/crosscheck.cjs`)

Run on 2026-11-21 against `/tmp/agent-tasks/software/how-react-updates-the-dom` (`react@19.3.1`, `react-dom@19.3.1`, `scheduler@0.28.0`) using a minimal Node DOM shim so real `createRoot` / `React.act` / `flushSync` / `CompilerRuntime.c` execute natively: **40/40 checks passed**.

- Verified package versions (`19.3.1` / `0.28.0`), `Activity` & `ViewTransition` exports, `frameInterval = 5`, `MessageChannel`, event priority constants (`2`, `8`, `32`, `268435456`), `lanes & 127` time-slice mask, and Fiber flag masks (`1206910976`, `13878`, `8772`, `10256`).
- Verified `jsx()` returns `Symbol(react.transitional.element)`, freezes `props` in dev, invokes component `0` times prior to reconciliation, and produces `tag = 0` (`stateNode = null`) vs `tag = 5` (`stateNode = DOM`).
- Verified live `child`/`sibling`/`return` pointers and `alternate` twin creation on update.
- Verified live `[A,B,C,D]` -> `[X,A,B,C,D]` prepend reconciliation: `key = id` preserves DOM identity and yields `0` state mismatches; `key = index` causes `2` state mismatches (`X` receives `note-A`, `B` receives `note-C`).
- Verified live `Fiber.memoizedState` chain, `+1 then *2` (`22`) vs `*2 then +1` (`21`), and skipping Hook 0 (`useEffect` crash on Hook 1's state slot and `TwoStates` throwing `"Rendered fewer hooks"`).
- Verified live `render -> insertion -> layout -> passive` effect order, delegated root `click` listener (zero native listener on `<button>`), `3` updates batching to `1` render vs `3` `flushSync` renders, `startTransition` internal `T` scope, and `CompilerRuntime.c(4)` computing `1` filter across `4` parent updates with `1` child render.

## Tuned parameters

- `ch3`: `unitMs = 1.6`, default `budgetMs = 5` (pinned to `scheduler` `frameInterval = 5`).
- `ch4`: 4 initial items (`A` with `'note-A'`, `C` with `'note-C'`).
- `ch6`: 15-node tree (`Root`..`Footer`), default dirty leaf `Post2` (`id = 10`).
- `ch7`: default `renderMs = 4.0`, `mutationMs = 1.5`, `layoutEffectMs = 6.0`, `passiveEffectMs = 5.0`, `SyncReCommit = 1.8`, parameterized `browserPaintMs = 2.0`, `frameBudgetMs = 1000 / 60`.
- `ch9`: `listNodes = 14`, `nodeCostMs = 1.5`, `keystrokeAtMs = 7.0`, `keyRenderMs = 1.5`, `commitOverheadMs = 1.0`.

## Frontier sources & dates (Facts that will go stale)

- **npm `react` release timestamps** (queried `npm view react time` on 2026-11-21): `19.0.0` (`2024-12-05`), `19.1.0` (`2025-03-28`), `19.2.0` (`2025-10-01`), `19.3.0` (`2026-09-09`), `19.3.1` (`2026-10-14`).
- **React Compiler 1.0** (`2025-10-07`), **`<Activity>`** (`19.2`), **`<ViewTransition>`** (`19.3`, `2026-09-09`): verified via `react.dev` search summaries (accessed `2026-11-21`) and live package exports on `react@19.3.1`.
- **Flight wire protocol & CVE-2025-55182** ("React2Shell", disclosed December 2025) & 2026 Flight parser/DoS hardening: verified via security advisories & `react.dev` search summaries (accessed `2026-11-21`).

## Checked / not checked

- **Checked**: `tools/diagrams.cjs` (9 SVGs generated); `build-pages.cjs --print-budgets` (all SVG labels <= 87% across zh and en); `build-pages.cjs` & `--check` (392 keys/lang, 11 chapters, 37 bound numbers, zero drift); `tools/crosscheck.cjs` (40/40 against live `react@19.3.1`); `tests/models.cjs` (119/119 checks incl. `unprefill`, zero CJK in `copy.en.js` & `figures/`, zero alias collisions against `atlas/data.js` & `atlas/graph/aliases.json`).
- **Not checked in this subagent run**: `tests/browser.cjs` and `tests/canvas-text-overlap.cjs --sweep` (Playwright browser checks are run serially by the coordinator after builder agents complete). Real browser `MessageChannel` / `performance.now()` paint timings across varying CSS tree complexities (modeled with parameterized 2.0 ms paint cost).
