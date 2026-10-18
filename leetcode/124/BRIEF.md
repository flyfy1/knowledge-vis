# #124 Binary Tree Maximum Path Sum — author brief

Build/reuse verdict: reuse the approved lesson shell and local tree renderer; no new layout/product contract. Approval basis: specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication. Author self-check only; independent review pending.
Category computing; stage university. Reader: understands tree edges and sums, learning bottom-up reasoning. Outcome: reconstruct two different summaries, explain why branching cannot be passed upward, implement the verified Python interface.

Official contract: https://leetcode.com/problems/binary-tree-maximum-path-sum/ verified 2026-10-18 through public GraphQL POST. Capture tests/evidence/official.json includes statement, actual Python3 selector snippet, all observed languages. Nonempty simple path, no repeated nodes, any endpoints, need not include root. 1..30000 nodes; values -1000..1000. Examples [1,2,3]→6 and [-10,9,20,null,null,15,7]→42. Empty tree outside contract. No mutation requirement; implementation preserves input.

## Learning loop and five fields per step
| Step | Already knows | Single question | Input → output | Operation → visible observation | Conditions |
|---|---|---|---|---|---|
|0 hand/baseline|sum, edge|Which nodes may one path contain?|three-node tree → 6|Read three candidate sums; compare root-only restriction|nonempty tree; no revisit|
|1 derive|path rule|What may a child send upward?|fork with parent → one arm versus completed fork|Follow 4,2,3,10 arithmetic; see illegal degree-three fork|simple tree path|
|2 lab|one-arm summary|How do child answers form parent answers?|presets and root value → full bottom-up ledger|Next/back/end/reset and root slider; see g, through and running best accumulate|small complete simulations ≤7 nodes; changing input restarts|
|3 transfer|one-arm vs two-arm|Which branches can coexist?|fresh tree → predicted maximum|choose before reveal; changing selection clears feedback|same path rules; independent of lab|
|4 code/proof|derived recurrence|Why does this cover every path?|canonical source → proof and real costs|expand, copy/download exact source; map node completion to code|official nonempty trees, iterative stack avoids recursion depth|

## Terms at first use (also restated locally)
Path: adjacent distinct nodes (step0). Root: given starting node of tree representation (0). Baseline: try every start and follow all unique routes (0). Arm/gain g: best downward path starting at this node (1,2,4). Through: best path whose highest node is current node (1,2,4). Postorder: children completed before parent (2,4). Best: maximum through value among completed nodes (2,4). Stack: pending work with revisit flag (4).

## Exact token contract
Reuse all :root tokens from ../style.css unchanged: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. Shared typography/system font and spacing/radii retained. Local controls ≥48px, disabled opacity 1, focus 3px accent2 +4px offset. No motion. Local SVG uses token fills and labeled statuses; ledger is textual equivalent. Total CSS must remain <25000 bytes.

State matrix: start/completing/end × both locales; preset/root changes reset trace only; quiz unselected/selected/revealed/changed; copy success/denied manual selection; storage denied memory fallback. No remote runtime, loading/reconnect inapplicable. Locale preserves all state and focus. No automatic animation. All presets complete; no omitted events. Simulation is not Python execution. Python O(n) time/O(n) auxiliary (dictionary plus explicit stack); tutorial stores O(n²) snapshots for n≤7.

P0 / highest-return slice: causal hand derivation, honest tree/ledger, reversible input experiments, fresh transfer quiz, exact canonical Python, bilingual/accessibility and numerical/browser checks. P1: related concept anchors and source workflow. P2: none. Deferred: custom large trees (unnecessary UI complexity), animation (no demonstrated need), platform abstraction, submission service and mastery claims.

Self-check plan: independent all-start path oracle, exhaustive small shapes/values and seeded trees, per-frame one-arm/through/best invariants, official examples, all-negative/zero/depth30000/maxsum; actual Chromium locales/presets/navigation/quiz/copy fallback/storage denial/320/390/736/1440/zoom/keyboard/asset/link/source parity/contrast. Evidence is author self-check, not independent acceptance or learner study.
