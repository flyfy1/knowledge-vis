# #927 Three Equal Parts — author brief

Status: author self-checked candidate 927-r2; separate independent review pending. No acceptance,
publication, novice outcomes or LeetCode submission claimed. Author: Codex, exact
model identifier unavailable. Scope: only leetcode/927/. Reuse verdict: existing
five-step lesson shell, shared locale, exact shared tokens and controls; no new
product or universal visualization framework. Approved product/design contract:
../../specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication.
Skill: /home/songyy/Documents/agent-skills/website-design/SKILL.md.

Category computing / algorithms; stage university. Reader knows Python loops,
array indexing and elementary place values. Learning loop: calculate binary
values → try cuts → find forced starts → compare aligned suffixes → predict
an unseen cut → map to executable Python. Five sections fit five distinct questions.

## Official contract
Verified 2026-10-26 via public official GraphQL; raw statement, examples and all
observed codeSnippets retained in provenance/official.json. Official frontend ID
927 (internal question ID 963). Public Hard. Binary array length 3..30000.
Return any [i,j] dividing [0..i], [i+1..j-1], [j..n-1], i+1<j;
all parts nonempty, entire parts used, leading zeros allowed, no solution [-1,-1].
Examples 10101 → [0,3]; 11011 → [-1,-1]; 11001 → [0,2].
Python3 official interface: Solution.threeEqualParts(self, arr: list[int]) -> list[int].
Python is canonical; no language fallback needed. No mutation requirement;
our solution preserves input. Empty arrays outside contract.

## Steps (known / question / input-output / action-observation / conditions)
0. Known: binary digits. Question: equal value or equal length? Input 10101,
   choose [i,j]; output three decimal values. Move the cut selectors and see
   literal slices and weighted values: 1|01|01 = 1 each. Applies to nonempty
   contiguous pieces; zeros on left are ignored, zeros on right multiply by two.
1. Known: legal cuts and values. Question: what does exhaustive search repeat?
   Input same five bits; output every cut and its three values. Complete ledger
   of six pairs, visibly one valid pair. Baseline scans all bits per pair,
   O(n^3) small-integer bit operations, O(n) sliced digits and integer bits; not a large-input algorithm. Concrete Python baseline included.
2. Known: canonical binary strings start at first 1. Question: which starts and
   cuts are forced? Input presets; output count, start positions, length, each
   aligned bit comparison and result. Forward/back/reset/end preserve comparison
   ledger. Count divisible by three is necessary, not sufficient. Third first-1
   suffix forces common significant length. Gap bound prevents overlap, equal
   prefixes invariant permits next comparison. No skipped events; small presets.
3. Known: suffix length and gap bound. Question: does a fresh leading-zero case
   admit equal parts? Select before reveal; show explanation only after reveal;
   change answer clears feedback, language preserves it. Fixed fresh input,
   misconception distractors equal widths and arbitrary trailing-zero ignoring.
4. Known: proof and trace. Question: how does each check become Python? Source
   mapping, exact copy/download, complexity and boundaries. Canonical code uses
   constant many pointers; O(n) time, O(1) auxiliary machine words. Tutorial
   stores full comparison history, separately from submission memory.

## Terms and dependencies, defined locally again when needed
Binary value (step0): reading left to right, double previous value then add bit.
Leading/trailing zero (0): before first 1 / after last 1.
Cut indices i,j (0): first part end / third part start, zero based.
Baseline (1): enumerate every legal pair, independent from optimized reasoning.
Significant string (2): first 1 through end, no leading zeros.
s1,s2,s3 (2): first 1 in each group of k ones. L (2): n-s3, fixed suffix length.
Offset d (2): number of aligned columns already checked. Invariant (2): all
previous columns match; ordinary-language statement precedes code use.

## State and simulation contract
Hand cuts and optimized presets are independent; preset changes restart only
optimized trace. Prediction is independent. Each trace frame is after count,
start/gap check, or one bit comparison. Initial frame says which check completed.
Data digits are never changed by highlighting. Kept rows show compared columns;
current row additionally has a text marker. No autoplay, loading or server states.
Count rejection, all-zero success, gap failure, bit mismatch, success all covered.
Language preserves all selections, frame, feedback, disclosure and source focus.
Unavailable clipboard uses selectable exact source; unavailable storage stays in
memory. Simulation is browser logic, does not execute displayed Python; local
Python tests execute actual canonical method. UI teaches supported bounds using
small complete presets, not a 30000-cell trace.

## Exact design contract
Reuse ../style.css tokens: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. Shared alternate section #0a0e14
and code surface #090e16 retained. System font stack, shared 952/1000px widths,
8/14px control/panel radii; spacing 8,12,16,20,24,32,64px. No decoration or
ambient motion. Local 48px controls, opaque disabled text, 3px accent2 focus
outline. Table horizontal scroll has label and keyboard focus; arrays wrap.

P0 / highest-return slice: valid cuts, forced-suffix proof, reversible complete
trace, bilingual prediction and canonical source with independent checks.
P1: related links to local derivation and concrete existing #410 partition
baseline. P2: none. Deferred: custom large arrays (unnecessary input validation),
autoplay and browser Python runtime (no demonstrated need), registry/concept-map
updates (dispatcher-owned, outside this run). New metadata advertises our anchors.

## Validation and freeze
Run independent numeric-value oracle, exhaustive binary arrays, seeded cases,
maximal arrays, intermediate frame checks; source parity and duplicate copy keys.
Browser: all presets and endpoints, both locales, prediction change, storage
failure, real clipboard and per-attempt fresh-sentinel manual transfer, download,
320/390/736/1440 and 200% zoom, keyboard/focus, links, local assets and contrast.
Evidence files record self-check only. Freeze runtime hashes after actual checks;
run metadata validate-only from root. Reviewer receives frozen candidate separately.


## Completed author checks — 2026-10-26
All commands in tests/evidence/commands.json exited 0, including the required
root preflight `python3 -B scripts/register_leetcode_lesson.py 927 --validate-only`
(no stdout, exit 0). No registration was performed. Metadata is frozen as part
of 927-r2; no prior review or acceptance result exists for this author candidate.

Canonical Python: 8184 exhaustive inputs (lengths 3..12), 800 seeded inputs,
three official cases plus fresh prediction, four length-30000 boundaries and
100 printed-baseline cases. Browser model: 8192 arrays / 19340 frames, all eight
branches, starts and aligned-prefix checks. Browser: every preset and endpoint
in both locales, reverse/replay and reset, six hand cuts, all quiz options,
locale roundtrip with revealed answer, clipboard success/native fallback,
source/download exact parity, denied storage, loaded-source offline access,
320/390/736/1440 screenshots and 200% CSS zoom. No console or asset errors.
Text contrast minimum 6.4494:1; focus/background 8.9372:1; all measured text
passes 4.5:1 AA. Total shipped CSS 11448 bytes (shared plus local).

Visually inspected headless captures: headers and hand parts at 320, full
comparison ledgers in both languages, 320/390/736/1440 populated traces,
200% mismatch states, closed selects and source scrolling. Digits/indices,
current-check marker and prior equal rows remain separately readable. Initial
clipped label and harness failures are preserved in evidence/initial-selfcheck/;
they were repaired before final commands and frozen receipt.

Related links were keyboard-followed in both locales: local suffix proof and
fresh prediction; served #410 step1 actually explains cut enumeration before
its greedy cap test. Target/shared hashes are retained in candidate.json.
Publication availability and acceptance of another lesson are not inferred.

Independent reviewer/run: pending; independent rubric score: not assigned;
publication: not performed. Exact runtime and metadata hashes: candidate.json.
These checks are not novice teach-back or LeetCode acceptance. Native browser
UI zoom and physical devices remain unverified; 200% uses actual CSS zoom in
Chromium plus narrower reflow checks. No services, shared files, credentials,
Git settings, registry or campaign records were changed.
