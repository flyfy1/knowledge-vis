# #174 Dungeon Game — author candidate

Product fit: reuse the approved LeetCode lesson surface, shared locale and exact
shared tokens. Contract: specs/reviews/leetcode-all-hard-design-review.md and its
dispatcher adjudication. No new layout family or design review is claimed.
Category computing; stage university. Reader knows loops and 2D lists.
Outcome: derive minimum entry health, predict an unseen grid, implement Python.
Verified 2026-10-18 using official public GraphQL; raw statement and complete
language snippets are tests/evidence/official.json. Python3 explicitly exposes
Solution.calculateMinimumHP(self, dungeon: list[list[int]]) -> int. Nonempty
rectangular m,n in 1..200, entries -1000..1000, right/down only; entrance and exit
both apply effects; health must remain >=1. No empty-input extension is claimed.
Official examples: [[-2,-3,3],[-5,-10,1],[10,30,-5]] =>7; [[0]]=>1.

## Learning loop and five fields per step
|Step|Already known|Single question|Input → wanted|Action → observation|Conditions|
|0|Integer addition|How much health survives one path?|2×2 rooms → least initial HP|Choose right/down path and adjust health; see every prefix and death|Effects applied on entry; dead knight cannot revive|
|1|Prefix health from step0|Why work backward instead of maximizing final sum?|Same grid → reusable entry need|Hand-calculate exit1, top-right4, bottom-left6, entrance6; inspect max-sum counterexample|Only right/down; brute force enumerates all paths|
|2|Need means minimum health before entry|How does a solved neighbor determine this cell?|Preset grid → complete needs table|Next/back/reset/end/range, change preset → restart; see cumulative cells and exact dependency equation|Small complete simulation; no omitted frames; immutable snapshots|
|3|Backward invariant|Can you transfer it to an unseen grid?|[[1,-4],[-2,-3]] → initial HP|Predict then reveal; change clears; locale preserves|Fresh case not in presets; all rooms count|
|4|Derived recurrence|Why is rolling storage faithful?|Full table → Python dp row|Inspect exact code, copy/fallback/download; compare one transition|Nonempty official contract, no input mutation|

## Terms on first use (repeated locally where needed)
Health: positive integer remaining life (0). Prefix: path rooms visited so far (0/1).
Need N[r,c]: minimum HP immediately before this room (1/2/4).
Dynamic programming: store answers for repeated suffix problems (1).
Invariant: statement true after every completed update (2/4).
Infinity: unavailable exit, never chosen when a real move exists (2/4).
Rolling row dp: one reusable list of needs (4). Rows/columns zero-based in lab.

## Exact tokens and UI contract
Use ../style.css palette without replacements: --bg #0d1117, --panel #161b22,
--panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8,
--accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93.
System font inherited; body line-height1.75; shared title clamp(28px,5vw,46px),
section clamp(23px,3.5vw,32px); shared 8/14px radii and 8/16/24px gaps.
Local rules only for honest matrix rendering, 48px controls, opacity1 disabled,
3px focus, component scroll and wrap. No animation. Highest-return slice is
causal health arithmetic + visible accumulated needs + fresh prediction.
P0 all content, bilingual states, source parity and computational/browser checks.
P1 related deep links. P2 none. Deferred: autoplay, arbitrary large editor,
execution backend, decoration (no need; bounded presets keep every event visible).

## State / verification boundary
Normal/start/end, trace rewind, preset reset, chosen/unrevealed/revealed/change,
copy success/denied fallback all bilingual. Locale preserves independent state.
No loading/reconnect needed: static local assets. JS-disabled message bilingual.
Full-table simulation is not execution of Python; tutorial snapshots O((mn)^2)
for bounded grids, unlike submission O(n) storage. Oracle enumerates paths and
searches initial HP independently; test intermediate entry needs and minimality.
Browser exercises both locales and widths including zoom, keyboard, storage denial,
clipboard denial, source/download parity, local errors and measured contrast.
Author checks are not independent review, novice evidence, or LeetCode acceptance.
