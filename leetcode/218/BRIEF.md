# #218 The Skyline Problem — author brief

## Contract and product fit
Reuse the approved collection lesson contract in specs/reviews/leetcode-all-hard-design-review.md,
including dispatcher D1–D10, and the website-design skill. Category computing;
stage university; audience knows Python lists, loops and maximum. Useful outcome:
calculate a skyline, explain endpoint grouping and lazy heap removal, predict a
new overlap, then implement getSkyline. This author run is not independent review.
Own only this folder; shared registry and concept-map changes belong to dispatcher.

Official URL: https://leetcode.com/problems/the-skyline-problem/
Verified 2026-10-18 from public page and public GraphQL question.codeSnippets.
Python3 selector: class Solution: def getSkyline(self, buildings: list[list[int]]) -> list[list[int]].
Exact capture saved in tests/evidence/official.json, with timestamp and query.
1..10000 buildings, 0 <= left < right <= 2^31-1, 1 <= height <= 2^31-1;
nondecreasing left. Output sorted key points; final height zero; include gaps;
merge adjacent equal heights. No mutation requirement. Empty input is outside
constraints, handled as a defensive extension. Both official examples tested.

## Learning loop and five fields per section
|Step|Already known|Single question|Input → sought output|Action → observation|Conditions|
|---|---|---|---|---|---|
|0|Rectangles on ground|Where does visible height change?|A=[1,5,3], B=[2,4,5] → points|Read four endpoint calculations; inspect skyline|Right endpoint excluded; maximum visible roof|
|1|Hand maximum|What work is repeated?|All endpoints → baseline answer|Compare scans and same-x counterexample|Only endpoints change membership; n input rectangles|
|2|Endpoint scans|How can we retain the tallest candidate?|Sorted endpoints, sorted buildings → retained heap/output|Forward/back/end/reset, six presets; watch skyline path, live/expired heap rows and event ledger|Each frame is after all pushes and top cleanup at one unique x; no omitted events|
|3|Post-cleanup invariant|Does a hidden roof reappear at a shared edge?|Fresh three-building input → points at x=3,4|Choose then reveal; change clears feedback; locale preserves it|No transient zero or equal-height output|
|4|Sweep and prediction|Why is the code correct and affordable?|Submission Python → proof/cost/boundaries|Inspect/copy/download exact source|Heap entries use (-height,right); each building pushed/popped at most once|

## Local term dependency table
Step0 skyline=visible upper contour; key point=[x,new height] beginning horizontal
segment; building covers [left,right), right excluded. Step1 endpoint=left or
right edge; baseline=scan every building at every endpoint. Step2 sweep=visit
unique endpoints left to right; active means left<=x<right; heap=partially ordered
array with smallest tuple at root; negative height makes highest roof smallest;
lazy removal=discard expired entries only when they reach root. Invariant repeated
near trace and proof. Pointer i is count of inserted buildings, not a diagram ID.
Step3 repeats active/endpoint meaning. Step4 repeats heap/root/expiration locally.

## Exact tokens and layout
Use ../style.css and ../common.js without edits. Exact palette: bg #0d1117,
panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8,
accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. No added colors.
Shared font stack, line-height 1.75, h1 clamp(28px,5vw,46px), h2
clamp(23px,3.5vw,32px); shared radius 8/14px and spacing 8/12/16/20/24/32/64px.
Content max 952px. Controls >=48px; disabled opaque muted; 3px accent2 focus
with 4px offset. Fixed minimum diagram width with explicitly named keyboard
scroll region preserves coordinates at 320px. Text alternative in event ledger.
No animations, shadows, decorative imagery or external assets. CSS <25000 bytes.

## State contract and priorities
Highest-return 20%: hand max, retained old/new heights, same-x grouping,
expired hidden heap entries and exact source mapping. P0 includes both locales,
all reversible controls, fresh prediction, Python/oracle tests, per-frame invariants,
real-browser interaction, asset/source parity, geometry and measured contrast.
P1: offline, denied storage/clipboard, forced-colors and reduced-motion checks.
P2: none. Deferred: arbitrary input editor, playback, backend, universal renderer,
registration and deployment (scope; no concrete benefit to this learning loop).

All presets reset only the lab (announced in label); independent quiz persists.
Initial empty heap/output, completed endpoint frames, terminal frame; no skips.
Language preserves preset/index/answer/reveal/disclosure/focus. Empty heap uses
height zero, not a fake building. Diagram buildings are original data; cyan path
is accumulated output; orange vertical line is current coordinate, not a wall.
Raw heap array lists storage positions and distinguishes expired entries; these
are not all active buildings. Frame operations list completed pushes/pops; sifting
is explained in prose, not animated. Snapshot histories are teaching storage,
not solution space. Browser JS simulation is explicitly not executing Python.
Clipboard has success/manual fallback; no runtime fetch/loading/reconnect states.

## Verification boundary
Tests emit to OUTPUT_DIR when provided. Independent endpoint scanning and integer
cell oracle, exhaustive/seeded/boundary/maximum cases; Python executed directly.
Trace checked at every endpoint, heap order and coverage, rewind deterministic.
Browser: both languages, all presets/endpoints, prediction all answers/change,
copy/fallback, source/download, 320/390/736/1440 and 200% zoom, focus/keyboard,
contrast, local requests/errors, screenshots visually inspected. Preflight from
root recorded. No LeetCode submission, novice results, independent acceptance,
real phone or public deployment claims.
