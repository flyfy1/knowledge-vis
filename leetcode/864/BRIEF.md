# #864 — Shortest Path to Get All Keys

Author status: implemented and author self-checked; ready for separate review. Independent per-problem review: pending in a separate run. No submission, acceptance, registration or publication claimed.

## Approved contract and scope
Reuse the shared five-section lesson pattern approved in specs/reviews/leetcode-all-hard-design-review.md and its dispatcher adjudication. Apply WORKFLOW, UI-I18N-SPEC, explainer, Hard trace, review-gate and rendered-state supplements. Website-design skill read before implementation. Product fit: reuse one collection lesson, for a basic Python reader learning shortest paths with inventory. Category computing / collection leetcode; stage university. Own only this lesson. No new framework.

Highest-return slice: see why a returned square with a new key is a new state, then observe equal-distance layers. P0: official contract, bilingual causal teaching, exact source parity, reversible simulation, transfer question, oracle/browser evidence. P1: per-cell mask ledger and explicit rejected transitions. P2: no decorative additions. Deferred: arbitrary grid editor (validation scope); automatic playback (no learner need); actual in-browser Python execution (static-site boundary); independent teaching review and deployment (different authorized runs).

## Official contract
Verified public official GraphQL and official page on 2026-10-26; raw response and Python3 selector/stub in provenance/. Python3 `Solution.shortestPathAllKeys(self, grid: list[str]) -> int`. 1<=m,n<=30, 1<=k<=6 unique consecutive keys a.., one matching lock each, exactly one start. Four orthogonal unit moves, permanent keys, walls and unopened locks block movement. Return minimum moves collecting all keys or -1. No need to open every lock. Examples 8, 6, -1. No zero-key or empty input claimed. Canonical source uses the actual observed Python interface.

## Learning loop / five required fields per section
|Step|Already known|Single question|Input → requested quantity|Action → visible observation|Conditions|
|---|---|---|---|---|---|
|0|Grid symbols and basic loops|When can we stop walking?|@.aA → minimum moves|Reveal hand route: position0→1→2; key inventory changes only at2; stop before A|Four directions, permanent keys, unit cost|
|1|Hand route|Why is position alone insufficient?|b.A.@.aB → valid future moves|Compare @ empty at0 with @ holding a at4; baseline code disclosure|Same grid, different inventory changes legal lock entry|
|2|Position plus inventory|Why does the first completed layer give minimum moves?|Selected grid → complete distance-layer trace|Forward/back/reset/end; accumulated per-cell masks persist; all accepted/rejected attempts available|BFS of full states, first discovery, no weighted moves|
|3|Full-state invariant|Does revisiting @ invalidate a route?|Fresh bA@.aB → minimum distance|Choose -1/6/11 then reveal; change clears feedback; language preserves choice|Keys permanent, not consumed; goal keys not locks|
|4|Layer proof|How does Python preserve the same claim?|Grid → official integer return|Read/copy/download exact source; map mask, seen, deque to trace|Bounds and language bit operations stated; no browser execution claim|

## New terms / dependencies
Step0: key inventory = letters already collected, move = one orthogonal cell. Step1: state = row, column and inventory; baseline = correct slower reference; distance = moves since start. Step2 redefines state, queue (first inserted, first removed), BFS (expand equal-move layers), bit (0/1 flag), mask (integer encoding flags); bit a=1,b=2, OR adds, AND tests; frontier=states at current distance, visited=discovered full states. Step3 restates full-state equivalence. Step4 redefines m,n,k and mask/queue helpers locally. All vocabulary reintroduced near jumping points.

## Trace instant / token contract
Frames show a complete distance layer ready for expansion, or terminal detection of a goal in that layer. Going forward expands all current states, records all four attempted moves per state, and discovers the next layer. Terminal frame repeats the goal layer with final answer; no omitted transitions. Deep snapshots retain all discovered states and distances and the previous layer's attempts. A per-cell ledger lists mask:distance, with ★ on every frontier mask. Board border marks a cell with frontier states, not one physical traveler. Grid axes zero based. Coordinates and masks always accompany values. Source stops per dequeue; grouped layer simulator is explicitly not Python execution. Tutorial snapshots have greater storage than the submission.

Exact shared palette from ../style.css: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. Shared system font stack, body line-height1.75, heading clamp and shared spacing/radii. Local CSS reuses variables; 48px controls, visible disabled labels, focus3px accent2 offset4px; no motion/gradients. All shipped CSS combined below25KB. No external assets.

## States and evidence plan
Both locales: initial/middle/terminal-found/terminal-unreachable; all presets; rewind/replay; answer-unselected/selected/revealed-correct/revealed-wrong/changed/reset; source copy-success/manual-fallback; blocked storage. Locale preserves all teaching state and keyboard focus. No network/loading/auth states because runtime is static. Offline source mirror is exact. Tests accept LESSON_EVIDENCE_DIR. Numerical reference explicitly enumerates inventories with frozensets and relaxes all edges; canonical Python and JS trace independently checked, intermediate layers validated. Browser: 320/390/736/1440, 200% zoom, real clipboard and manual fallback, downloads, focus/deep links, console/network, contrast calibration and screenshots inspected. Limits: no real-device or novice results, no independent acceptance. Related links will target available #773 layer search and #126 full-path storage differences, with actual section meaning checked.

## Final author receipt

Runtime assets 864-r2. Author logic2,648 cases, browser all6 presets in both locales, focused semantic binding and source transfer checks passed; screenshots visually inspected. See SELF-CHECK.md and tests/evidence/. Metadata preflight `python3 -B scripts/register_leetcode_lesson.py 864 --validate-only`: exit0, no output, no mutations. Metadata shape stayed valid; final candidate is frozen for fresh review, not independently accepted. Exact hashes in candidate.json.
