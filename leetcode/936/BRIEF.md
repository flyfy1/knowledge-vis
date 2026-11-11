# #936 Stamping The Sequence — author brief

Candidate 936-r1; author Codex (exact model identifier unavailable); independent
review pending, no independent acceptance, publication or LeetCode submission.
Only leetcode/936/ is owned. Build verdict: reuse approved bilingual five-section
lesson pattern under specs/reviews/leetcode-all-hard-design-review.md and its
adjudication. Website-design skill read at
/home/songyy/Documents/agent-skills/website-design/SKILL.md. No new design gate
needed for this reused pattern. Category computing / algorithms; stage university.
Reader: basic Python loops, strings, lists. Job: construct and justify a stamping
sequence. Learning loop: overwrite by hand → erase backwards → count blockers →
predict a new legal erase → reconstruct Python.

## Verified official contract
Public GraphQL accessed 2026-10-26; full response, query and timestamp retained in
provenance/official.json. Exact official URL:
https://leetcode.com/problems/stamping-the-sequence/ . Public Hard, frontend 936,
internal 973. Initially n question marks; a turn overwrites m consecutive cells
with stamp, entirely within length n. Return zero-based start indices, any valid
sequence of at most 10n turns, or [] if impossible. Lowercase English letters;
1 <= m <= n <= 1000. Empty input is outside contract. Official examples:
abc / ababc → [0,2] (also [1,0,2]); abca / aabcaca → [3,0,1].
Observed Python3 selector snippet: Solution.movesToStamp(self, stamp: str,
target: str) -> list[int]. Python canonical, no language fallback. All observed
selectors are saved. Inputs are immutable strings; no mutation requirement.

## Five steps: known / unique question / input and output / action and observation / scope
0. Known: string positions. Question: can overwriting help? Input ab and aab;
   output [0,1]. Move forward/back through ??? → ab? → aab. Stamped interval
   marked with brackets in the retained history. Fully contained windows only.
1. Known: forward overwrite. Question: which last stamp can be peeled away?
   Same input; inspect aab, a??, ??? and starts 0/1. Read per-character comparison,
   mismatch and new-letter counts. aab at 0 blocked, at 1 legal; a?? at 0 legal;
   all-erased window makes no progress. Baseline repeatedly rescans windows,
   O(n²m) time/O(n) space; code included. Erased ? is an unconstrained letter,
   not a literal character required by the original target. Case ab/aba refutes
   “erase whenever even one letter matches.”
2. Known: compatible erases. Question: how can one erase unlock the next?
   Presets; output blocker counts, queue, erased cells, productive starts and
   final reversed answer. Step/back/reset/end retain all history. Frame 0 is after
   dependency setup; each following frame completes one queue pop and all its
   erasures/decrements. Counts are current remaining original mismatches, not
   all currently unerased letters. Explain dependencies numerically for aab.
   Proof: erase only matching visible letters; removing constraints cannot
   disable an eligible window; queue exhaustion with letters remaining implies
   no possible last stamp. Every productive pop erases >=1 new cell, <=n moves.
3. Known: legality and progress. Question: in fresh aba / ab??? what is useful?
   Starts 0,1,2: 0 legal/productive, 1 blocked at position 1, 2 no progress.
   Choose before reveal; all answers explained after reveal. Change clears
   feedback; locale preserves state. Independent from trace presets.
4. Known: proof and counters. Question: which Python lines implement the rule?
   Exact source/copy/download with locally explained deque, enumerate, reverse
   slice. Costs O(nm) time/O(nm) auxiliary, O(n) output; simulation retains
   snapshots separately. Boundaries m=1, m=n, impossible and all repeated letters.

## Terms at first use (repeated locally when needed)
Window (0): fully contained m-cell interval starting at i. Erase (1): replace a
visible letter by unconstrained ?. Productive (1): removes at least one letter.
Baseline (1): repeated full compatibility scans. Blocker (2): original mismatching
position still visible for a window. waiting[p] (2): windows blocked by position
p; todo[i] (2): remaining blocker count. Queue (2): first-in first-out list of
ready windows. done[p] (2): whether position was erased. Invariant (2): visible
letters match the original target and todo counts exactly unerased mismatches.

## Exact token and state contract
Reuse ../style.css exactly: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. Existing alternate #0a0e14
and code #090e16; shared system font stack, 952/1000px widths, 8/14px radii.
Spacing 8/12/16/20/24/32/64; minimum controls 48px, disabled opacity 1,
3px focus outline. No animation or new palette. Windows table is keyboard
scrollable; letter cells wrap without squeezing text. Current operation is
text-labeled separately from erased-state ?. Locale does not rebuild controls.
Shared sticky navigation highlights active section; real deep targets exist.
No runtime network, loading, reconnect, server execution or autoplay states.
Simulation in browser does not execute Python. Small complete presets only.
Storage failure uses memory; clipboard failure selects exact text for native copy.

P0/highest-return slice: hand overwrite, legal-erase check, blocker update trace,
proof, bilingual transfer exercise, source parity, independent forward-search oracle.
P1: related local anchors and existing #815 queue explanation. P2: none.
Deferred: custom large input and autoplay (obscure causal task), browser Python
runtime (no demonstrated need), registration/concept-map (outside ownership).

## Verification plan and boundaries
Execute Python against independent forward reachable-state BFS, exhaustive binary
small inputs, seeded forward constructions/impossible cases and length-1000 cases.
Verify simulation counters, queue, snapshots and returned forward reconstruction.
Browser both locales/all presets/endpoints/rewind/reset, prediction/reveal/change,
clipboard success and per-attempt fresh-sentinel native fallback, download parity,
blocked storage, 320/390/736/1440 and 200% CSS zoom, focus/keyboard, contrast,
local assets, links. Tests accept OUTPUT_DIR. Visual inspection is author self-check,
not novice teach-back, independent acceptance, actual mobile testing or submission.
Freeze hashes and metadata after checks; preflight is validate-only, no registration.

## Completed author checks — frozen 936-r1

`python3 -B leetcode/936/tests/run.py` exited 0. Its exact five commands,
stdout/stderr and results are retained in tests/evidence/commands.json. This
includes the required root command:
`python3 -B scripts/register_leetcode_lesson.py 936 --validate-only`
which exited 0 with empty stdout/stderr. No registration was performed.
Metadata is part of this newly frozen author candidate; no previous independent
review result was altered. Canonical Python3 interface was observed directly,
not inferred from the algorithms category. Chinese title is an authored translation.

Python: 7340 exhaustive binary inputs against independent forward-state BFS,
300 seeded ternary inputs, 500 seeded forward constructions, both official
examples, fresh transfer input and six length-1000 boundaries. The reverse-scan
baseline independently agrees on exhaustive cases. Browser core: 7640 cases,
23081 frames; setup/erase/skip/success/stuck, exact remaining conflicts, unique
queue items, new-erasure counts, per-dependency updates, deep snapshot isolation,
forward reconstruction, source mirror parity and 106 unique bilingual copy keys.

Real headless Chromium: both locales, all eight presets/all endpoints, rewind and
replay, all six reverse-lab combinations, hand overwrite/undo/reset, all quiz
answers and changed-answer clearing, locale-after-interaction preservation,
source disclosure and exact displayed/copied/downloaded bytes. Native Linux
Control+C fallback succeeded after a newly written and verified distinct sentinel
for EACH locale; automatic writes alone were denied. Both clipboard paths retain
canonical final newline. Blocked storage, loaded-source offline availability,
keyboard activation/focus, forced-colors focus outline, internal/related deep
links, selected-label budgets and local request/error logs passed.

All widths 320/390/736/1440 and both locales captured, plus 200% CSS zoom and
no-op/current-window overlap. Final screenshots were visually inspected: letters
and positions wrap at full size; current outlines and text remain distinct from
other erased cells; blocker identities remain paired with counts; update histories
remain readable. Sticky navigation can overlap an element screenshot at the
capture scroll position; focused board/readout screenshots show the actual core
state. No diagram clipping or document horizontal overflow was observed. Native
select labels retain full input and preset role at 320px.

Measured text contrast minimum 7.07885:1; focus/background minimum 8.93719:1;
control boundaries >=3:1, controls >=48x48 CSS px. Shared plus local shipped CSS:
11712 bytes. Initial inherited 44px button finding and initial browser receipt
are preserved under tests/evidence/initial-selfcheck/; the local override is
verified by the final complete suite. No open author self-check defect remains.

Candidate identity and evidence hashes: candidate.json. Author status:
self-checked, ready for separate review. Reviewer identity/run: pending; rubric
scores: unassigned; independent acceptance: pending; publication: not performed.
These checks are not actual novice learning, physical-device checks, OS/browser
menu zoom evidence or LeetCode acceptance. No shared files, registry, service,
Git settings, schedules or credentials were changed. Next action: designated
fresh reviewer cold-walks the frozen candidate under tests/REVIEW-CONTRACT.md.
