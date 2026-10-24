# BRIEF — #315 Count of Smaller Numbers After Self

- category: computing; stage: university; audience: readers who know arrays, loops, and prefix sums.
- product verdict: build one problem-local bilingual lesson using the approved LeetCode explainer pattern and shared tokens.
- target outcome: calculate the exact counts by hand, see why forward scanning repeats work, derive the right-to-left frequency invariant, and implement the official Python `Solution.countSmaller` interface.

## Five fields by step
1. **Already known:** array positions and strict comparison. **Question:** what does each answer count? **Input/output:** `[5,2,6,1]` → per-position counts. **Action/observation:** select a suffix and inspect each smaller witness. **Conditions:** “right” means larger index; equality is not smaller.
2. **Already known:** definition. **Question:** why does the direct scan repeat work? **Input/output:** one array → baseline counts and comparisons. **Action/observation:** advance the current index and watch the comparison ledger grow. **Conditions:** baseline is exact but O(n²) time.
3. **Already known:** right side is the relevant suffix. **Question:** what state is enough when walking right to left? **Input/output:** suffix → sorted values and rank of current value. **Action/observation:** reveal each insertion and count strictly smaller values; predict a fresh step before reveal. **Conditions:** duplicates occupy separate positions and use `<`.
4. **Already known:** rank query. **Question:** how can a frequency summary answer “how many values < x” quickly? **Input/output:** bounded value → prefix sum. **Action/observation:** compare a naive frequency scan with a Fenwick tree update/query trace. **Conditions:** coordinate compression preserves order; each update/query is O(log n).
5. **Already known:** invariant and data structure. **Question:** can the canonical code be reconstructed and checked? **Input/output:** Python callable → output list. **Action/observation:** map code lines to trace, copy/download source, run verification cases. **Conditions:** n≥1, strict inequality, output aligned with original indices.

## New terms
| term | first use | plain definition |
|---|---|---|
| suffix | step 0 | the part of an array beginning at an index and continuing to the end |
| strict smaller | step 0 | a value x with x < current value; equal values do not count |
| baseline | step 1 | a simple correct method used as an independent reference |
| invariant | step 2 | a condition that stays true after every processed item |
| coordinate compression | step 3 | replacing ordered values by consecutive ranks while preserving order |
| Fenwick tree | step 3 | an array structure for prefix sums with logarithmic update/query |

Simulation is a JavaScript trace, explicitly separate from executing the canonical Python submission. The independent oracle is the quadratic baseline.

## Review-fix candidate R2 — 2026-10-25

Applies the required actions in `specs/reviews/315-review-1-a478793f.md`;
that report remains historical and its findings are **fixed awaiting independent
re-review**, not closed by this author.

Product/design verdict: reuse the approved lesson, layout, shared tokens and
native controls. This is a correction of the reviewed behavior, not a new feature
or layout. The learner's immediate job is to count one position's strict-smaller
right-side witnesses and then reconstruct the query-before-insertion invariant.
Validation is the existing preview and the lesson-local regression evidence.

- P0 / highest-return scope: R315-1 binds prompt, choices 0–4, selected position,
  exact answer and witnesses; the answer is withheld until a guess and changing
  positions clears feedback. R315-2 uses the same cumulative comparisons in the
  metric and readout (3,5,6,6,6 including completion). R315-3 generates the JSON
  source mirror from canonical bytes with the registration-policy `PYTHON_SOURCE`
  export, retaining the final newline for display/copy/download/offline use.
- P1: correct the baseline's explanation: each index pair is checked once; the
  repeated work is starting a new suffix scan instead of reusing frequencies.
  Preserve the fresh-case before-state until explicit reveal, retain prediction
  across locale changes, and make manual-copy fallback actually select source.
- P2 / Deferred: no visual redesign or additional algorithm widgets; those need
  a demonstrated teaching need and separate design review. Real-device and
  learner-comprehension studies remain outside this browser self-check.

All experiments stay independent. Choosing a trace preset restarts that trace.
The fresh `[3,1,2,1]` check pauses on the second advance, before processing index
1: suffix `[1,2]`, answer `[?, ?, 1, 0]`. Reveal writes 0 at index 1, with the equal
1 excluded; finishing writes `[3,0,1,0]`. The first count is 3 (both occurrences
of 1 and the 2), not 2. Selecting another prediction clears old feedback;
reset clears its choice and reveal state. Locale switching preserves the state.

Python remains the preferred faithful official `Solution.countSmaller` interface;
no non-Python language contract or supportedLanguages list exists or is needed.
The exact source/mirror/export table in `scripts/register_leetcode_lesson.py` was
read. No canonical algorithm or metadata change is necessary; complexity remains
the single string `O(n log n) time; O(n) space`.

Self-check mapping, commands, candidate hashes and limits are recorded in
`tests/evidence/self-check.txt` and `tests/evidence/candidate-r2.json`.

## Review-fix candidate R3 — 2026-10-25

Design adjudication: adopt R315-4 and R315-5 from the separate review
`specs/reviews/315-review-2-1f0756d7.md` as the correction contract. Reuse the
five sections, stage, table, native button/radio/range patterns and shared tokens.
The review explicitly requests cell ranges/values, an old/new update and fresh
prediction; these repairs implement that reviewed teaching need. No new page or
layout. Independent acceptance of this revision remains pending.

P0 / highest-return slice: derive compression on the original [5,2,6,1], define
lowbit and interval summaries, show query partition and affected update cells,
then connect those operations to Python and time/space. Add a separate unspoiled
rank/query/update exercise on [9,-4,2,6,2]. Its answer is withheld until a choice
and explicit reveal; changing a choice clears feedback, reset clears selection,
and locale/resize preserve it. P1: localize the node readout. P2 / Deferred:
additional presets and decoration have no demonstrated need; real learner and
physical device studies need separate participants/devices.

The frequency experiment remains independent of the suffix presets. It starts
with ranks for [-2,-1,0,1,2], frequencies [1,2,1,0,1]. Apply adds one at rank 2
exactly once (disabled afterward); reset restores the original tree. Query rank
changes only the requested prefix, retaining the update. Every cell displays its
inclusive interval and before/current values; highlights indicate query reads,
not different stored data. The exercise shares no mutable state with this stage.

Token contract: reuse shared --bg #0d1117, --panel #161b22, --panel2 #1c2330,
--text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454 and --line
#2b3547; system body stack, inherited 1.75 line-height, shared table/control
spacing. Added local rules only ensure wrapping, 48px action targets, and full
opacity of disabled buttons using the existing muted/panel roles. No motion.
EN/zh states: initial, query endpoints, applied/reset, unanswered/selected,
wrong/correct revealed, changed answer and locale-preserved exercise. No network
loading/error/reconnect state exists in these synchronous local experiments.

Language: faithful official Python remains canonical; no supportedLanguages list
or non-Python contract is present. Read the exact registration source/mirror pair
(solution.py, python-code.js, PYTHON_SOURCE); no source regeneration is needed
unless canonical bytes change. Complexity remains one string covering time/space.
Self-check evidence is appended separately; fixes are awaiting independent review.
