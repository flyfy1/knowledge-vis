# #546 Remove Boxes — author brief

Reuse verdict: extend the approved `/leetcode/<id>/` lesson pattern, under
`specs/reviews/leetcode-all-hard-design-review.md` and its dispatcher adjudication.
Website-design skill read; no new product/layout review is claimed. Category:
computing; stage: university. Reader: knows Python lists, recursion and squares.
Job: explain why an interval must remember boxes saved for its boundary, then
write the supported Python method. This is an author candidate, not acceptance.

Official source: https://leetcode.com/problems/remove-boxes/ accessed 2026-10-25.
Public GraphQL capture: `provenance/official-graphql.json`. Actual codeSnippets
include Python3 `Solution.removeBoxes(self, boxes: list[int]) -> int`, Python,
JavaScript and TypeScript. Choose Python. Colors are positive integers 1..100;
length 1..100. Remove any nonempty contiguous same-color group, gain its squared
length; maximize total until empty. No modulus, sorting, mutation or empty-input
submission requirement. Examples: [1,3,2,2,2,3,4,3,1]→23; [1,1,1]→9; [1]→1.
Authored Chinese title: 移除盒子. Capture retained for separate review.

## Causal sequence (five fields per step)
|Step|Known|Single question|Input → wanted|Action → observation|Conditions|
|---|---|---|---|---|---|
|0 Hand|Squares|Why wait to remove a box?|[1,2,1] → maximum score|Read two explicit orders, 3 versus 5|Only adjacent equal colors may leave together|
|1 Experiment + baseline|Move scoring|Can largest-first choose the wrong future?|Six bounded presets → legal order and total|Step/reverse/end; compare optimal and leftmost largest run; retain every removed original ID and score|Browser simulation, at most 9 boxes; preset/mode resets this experiment|
|2 State + proof|Joining helps|What information survives outside an interval?|Original l..r and k saved copies of boxes[r] → best score|Change carry k 0..2; enumerate root candidates and their child values; current vs best-so-far distinguished|Root comparison only, child searches summarized; independent from step1|
|3 Transfer|Boundary carry|Which score follows after a separator leaves?|Fresh [2,1,1,2,2] → maximum|Choose then reveal; changing choice clears feedback; locale retains it|Score entire array, not just separator or terminal block|
|4 Code|Recurrence|How does the invariant become a submission?|Official Python callable → int|Open, copy/fallback, download exact canonical source|No execution service, tests execute Python separately|

## First-use dependency table
- Step0: color = equal positive labels; move = one contiguous equal group; score = k² points.
- Step1: original ID = zero-based original position (survives compaction); baseline = enumerate every legal first group; greedy = leftmost largest current run; all redefined locally.
- Step2: interval = original inclusive positions l..r; carry k = extra boxes of boxes[r] reserved immediately on the right; dp = best score with that carry; memoization = reuse an identical (l,r,k) answer. These terms are redefined when used in step4.
- Step2 recurrence: immediate removal vs merge with m where boxes[m]==boxes[r]; empty interval yields 0; smaller original interval proves termination. k affects reward, so dropping k loses information.
- Step3: repeat carry interpretation and distinguish squared merged group from sum of squares.

Concrete recursive call: dp(0,2,0) on [1,2,1] first tests dp(0,1,0)+1=3;
then sibling m=0 clears dp(1,1,0)=1, receives dp(0,0,1)=4, returns 5.
Child's immutable integer arguments do not modify parent. Both candidates visible.
Proof includes feasibility bound and attainable construction; never says arbitrary
suborders are optimal. Adjacent equal boxes can be kept together: combining gains
2ab≥0 and removing their pieces together at an existing removal cannot hurt;
thus an optimum exists using whole same-color groups (baseline maximal runs).

## Contract and scope
Exact inherited tokens: --bg #0d1117, --panel #161b22, --panel2 #1c2330,
--line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff,
--accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. System font stack inherited.
Spacing 8/12/16/20/24/48/64px; card radius14px; control radius8px. Local CSS
only adapts layout, 48px targets, readable disabled controls and wrapping, using
existing tokens. No new palette, shadows or motion. Focus 3px --accent2 offset4px.
Highest-return 20%: visible merge, remembered carry, exact code mapping.
P0: full bilingual five-step path, snapshots, proof, source parity, tests/access.
P1: root candidate experiment with carry. P2: none. Deferred: animation, custom
input, full recursion tree, universal renderer (unnecessary complexity).

State matrix: both locales × initial/middle/end/rewind/reset × all presets;
both modes; all carry values; unselected/selected/revealed/changed quiz;
copy success/denial/manual selection; source closed/open; storage denied.
No network/loading/reconnect lifecycle exists. Locale never resets experiments,
quiz, disclosure or copy state. Presets and modes restart only removal trace;
carry restarts only root enumeration. Trace simulation is distinct from Python
execution; snapshots and reconstructed move lists are not submission memory.

Verification: exhaustive/seeded independent all-subgroup oracle against Python,
JS states/dependencies, legal reconstructed moves, maximum boundaries, browser
both locales/narrow/zoom, endpoint and reset states, keyboard/focus, source bytes,
clipboard/fallback, download, local assets, contrast and screenshot inspection.
Evidence paths and actual results are in tests/evidence/SELF-CHECK.md. Separate
review and release remain pending; no actual learner or judge result claimed.
