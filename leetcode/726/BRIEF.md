# #726 Number of Atoms — author brief

Product verdict: reuse the approved bilingual LeetCode lesson surface, shared navigation,
controls, and tokens. Audience: a reader comfortable with loops and dictionaries; category
computing, stage university. Smallest outcome: reconstruct a nested formula parser and
justify why a closing multiplier affects the whole group but not its parent prefix.
Design authority: specs/reviews/leetcode-all-hard-design-review.md and dispatcher
adjudication. This author run does not reopen the approved layout or claim review acceptance.

Official contract verified 2026-10-25 through public official GraphQL and official page.
Raw statement and all code snippets: tests/evidence/official.json. Python3 offers
Solution.countOfAtoms(self, formula: str) -> str. Input is valid, length 1..1000;
uppercase + lowercase names, optional counts greater than one, nested parentheses,
concatenation, output counts fit signed 32-bit integers. Sort names, omit count one.
No empty-input or invalid-input handling is required; no chemistry validation or mutation.

Learning loop: hand-count Mg(OH)2 → expand a small group → keep one dictionary per
open group → step and rewind complete snapshots → predict a fresh nested result → code.

## Exact token contract
Reuse ../style.css without changing it: --bg #0d1117, --panel #161b22,
--panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8,
--accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93.
Local overrides use these variables only. Body uses shared PingFang SC / Microsoft YaHei /
system-ui / sans-serif, line-height 1.75. Shared heading scale, 8px control radius,
14px panel radius, 16/24px gutters; controls >=48px, disabled opacity 1 with muted ink,
3px orange focus outline. No added shadows, images, motion, or runtime dependencies.

## Steps (five required fields each)
| Step | Already knows | Single question | Input → desired quantity | Action → visible observation | Conditions |
|---|---|---|---|---|---|
|0|Counting objects|What does Mg(OH)2 count?|Formula → per-name counts|Compare hand ledger with the later simulation|Valid grammar; names case-sensitive|
|1|Group count two|Why avoid expanding every atom?|Same formula → compressed counts|Read expansion and H1000000000 counterexample|Expansion baseline only for small totals|
|2|Dictionary holds one count per name|What must survive a nested group?|Selected formula → stack and output|Next/back/reset/end, presets restart; before/after maps and cumulative history remain visible|Each event completes one token or close+multiplier; no omitted events|
|3|Child count excludes parent prefix|Which atoms receive two multipliers?|Na(He2O)3H → canonical output|Choose then reveal; change clears feedback|Fresh case independent of trace; locale preserves choice/reveal|
|4|Stack transitions|How does the proof become submission code?|Python interface → sorted answer|Open/copy/download exact code|Valid official inputs, expected dictionary-operation costs|

## First-use dependencies
Atom name: uppercase and subsequent lowercase letters (step0).
Multiplier: count following atom/group, default one (step0, repeated step2).
Dictionary: name-to-count table (step1, repeated step2/4).
Stack: ordered group tables, last table is innermost group (step2/4).
Invariant: fact preserved after every complete operation (step2).
n: input character length; k: different names; L: longest name (step4).

## State and rendering
Trace is JS simulation, not Python execution. Frames are deep snapshots after whole
operations; initial frame precedes input, final frame sorts the base map. Stack cards
are outermost to innermost, explicit depth and before/after labels. History retains
all processed operations. No truncation. Presets include three official examples,
single atom, adjacent groups, multi-digit counts, repeated names and nested defaults.
Prediction normal/unselected/selected/revealed/changed states are bilingual; source
normal/copied/manual fallback states are bilingual. No loading/server/reconnect state:
all lesson data and canonical source are static. Storage failures degrade through shared locale.

Proof: table at each open level counts completed units in that level, excluding unfinished
children and any outside multiplier. Atom adds its entire count; opening preserves parent;
closing multiplies each child entry and merges exactly once, leaving parent-prefix counts
unmultiplied. Matching parentheses ensure one base table at EOF. Sorting affects order only.
Baseline expands individual atom occurrences; it can require billions of entries even on
short valid input. Compressed tables avoid expansion, but repeated nested merges may still
be quadratic in n. We do not claim linear parsing time for this implementation.

P0: causal explanation, source, reversible trace, fresh prediction, bilingual accessibility,
independent oracle and browser self-checks. Highest-return slice: expose the child-to-parent
merge with exact values. P1: focused screenshots and reproducible evidence. P2: none.
Deferred: arbitrary formula editor (would need grammar/error UI), playback (adds no learning
value), shared framework and registration (outside authorized scope).

Validation: numerical oracle, exhaustive/seeded generated valid expressions, maximum-depth/
length, intermediate snapshot invariant, browser both locales and all presets/endpoints,
prediction/copy/fallback/download, responsive/zoom/keyboard/contrast. Separate reviewer is
pending; no LeetCode submission, learner outcome, real-device, or public-deployment claim.

## Review R1 correction — candidate 726-r1-fix-20261025

Required finding 726-R1 is fixed awaiting separate review. Step 02 now defines
n as input character length, A as fully expanded atom occurrences, and d as maximum
parenthesis depth (zero without parentheses). Its expansion baseline bound is
O(n + A·(d+1)) time and O(n + A) space before sorting. The base-level build and
tally account for A even at d=0; each enclosing group may copy entries again.
The added (H2O)3 example has child length 3, expanded A=9, d=1.
This reuses the existing reviewed teaching surface and tokens; no new layout.
P0 is the bilingual cost correction and regression; P1 is frozen evidence;
P2 none. Existing deferred features remain deferred.
