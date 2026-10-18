# Hard-problem visualization and trace specification

Status: derived from implementation and author self-review of the first ten
numeric-ID Hard lessons on 2026-10-17. Independent teaching review remains
pending. Review gates clarified 2026-10-18. Complements [the explainer contract](leetcode-explainers.md) and
[site UI policy](../UI-I18N-SPEC.md). Review evidence is in
[the batch review](reviews/leetcode-first-ten-review.md).

## Scope and sources

“First ten” must name its ordering. This batch uses ascending LeetCode frontend
ID, filtered to Hard: 4, 10, 23, 25, 30, 32, 37, 41, 42, 44. It is not a popularity,
recency, acceptance-rate, or interview-frequency ranking. Verify the official
statement and record the date, URL, constraints, mutation requirements, and
empty-input policy in each BRIEF. Do not infer difficulty from an old list.
Keep the existing collection entries and any established lesson paths.

## A trace frame is an algorithm contract

1. State which operation just completed. Every variable, diagram edge, result,
   and highlighted position must describe the same instant. When the view
   retains a just-tested cut alongside an updated search range, explicitly
   distinguish those roles. Do not silently display old pointers with new sums.
2. Store deep snapshots, including nested arrays, maps, sets, and pointers.
   Rewind restores every quantity; it does not run a partial inverse operation.
   Forward → backward → forward must reproduce the exact original snapshot.
3. Keep cumulative evidence in the primary diagram: DP cells, emitted nodes,
   placed values, settled water, or current links. Provide the previous state
   and recent operations when the transition itself is the teaching target.
4. Give completed, current, pending, and final quantities different names.
   `candidates_at_entry` is the candidate set before a Sudoku attempt, not the
   candidates remaining after assignment. A transient overfull window is not
   falsely labeled as satisfying the post-shrink invariant.
5. Trace limits must be visible. The Sudoku view retains the first 180 events
   and the terminal board, and explicitly labels the jump. Do not animate a
   skipped search as a single ordinary transition. Heap frames show completed
   pop/push operations; prose explains sifting and its cost.
6. Tutorial snapshot storage is not submission auxiliary space. A full DP
   teaching table can accompany rolling-row Python only if the difference is
   explained next to the diagram and complexity claim.

## Visual meaning must survive every state

- Active-state styling must not fabricate data. In a rain diagram, filling the
  entire active column cyan falsely depicts water in the air above a dry bar.
  Mark activity outside quantitative regions, and test a zero-water column.
- Distinguish data values, permanent object identities, storage positions,
  prefix lengths, character indices, and sentinel boundaries. Hide meaningless
  generic indices beneath frequency dictionaries and stack values.
- Linked-list traces retain all nodes during temporary disconnection. Show each
  node's immutable identity and value plus its actual next target. Duplicate
  values must not hide failed rewiring. Explain the dummy and null sentinels.
- DP needs an explicit unknown state, distinct from false. Show source cells,
  row/column prefix definitions, and the branch's character guard. Color alone
  must not communicate true/false or node identity.
- Keep labels readable at 320px. Reflow arrays and controls; contained scrolling
  is acceptable for genuinely two-dimensional tables, with headers retained.
  Verify sticky deep links with an actual navigation click. A long element
  screenshot can contain a sticky overlay at a capture-dependent position;
  verify target geometry and capture the focused diagram separately.
- State variable headings must cover diagram-only coordinates rather than
  falsely claiming every displayed name exists literally in Python.

## Mechanism-specific obligations

| Problem | Required causal bridge | Required counterexample / boundary |
| --- | --- | --- |
| 4 | Fixed left count; two cross comparisons; monotone cut direction; infinite sentinels | Empty shorter array, even median, duplicates, negative values |
| 10 | Atom-plus-star skips two pattern positions; repeat keeps pattern position and checks character | `ab` vs `a*` is false; zero repetitions; full rather than partial match |
| 23 | Only current heads can be globally smallest; heap parent order; replace only popped source | Empty lists, equal-valued nodes, identity conservation and no cycles |
| 25 | Preflight complete group; save successor before overwrite; reconnect prefix and suffix | Short suffix, k=1, all-node group, equal values with different identities |
| 30 | All word-width offsets; counts rather than membership; repeated shrinking; overlaps | Start at offset 1, duplicate required words, excess words, too-short text |
| 32 | Unmatched indices and excluded boundary; reset on unmatched close | Empty text, leading close, nested and adjacent pairs, separated valid fragments |
| 37 | Candidate exclusion; local validity versus solvability; undo board and all three sets | A failed branch with a visible undo, one remaining cell, solved board |
| 41 | Answer in 1…n+1; x belongs at x−1; every useful swap fixes a slot | Duplicate cycle, negative/zero/oversized values, full 1…n, chained swaps |
| 42 | Opposite known wall proves lower running maximum sufficient | Zero water, single bar, monotonic input, subtract bar height from water level |
| 44 | Standalone star skips one pattern position; rolling rows preserve dependencies | Empty text/pattern, repeated stars, `ab` vs `a*` true unlike regex |

## Prediction and experiment isolation

Use a fresh case that is not answered by the default worked trace. Hide derived
feedback until a selection and explicit verification. Changing an answer clears
feedback; changing language preserves answer, reveal, preset, and trace index.
Use plausible misconception-based distractors and explain their missing or extra
states. Do not put every correct answer in the same option position. Fix each
question's order so language switching cannot move a selected answer.

Presets restart their experiment and say so beside the control. An empty input
may already be terminal; disabled Next is valid. Tests must not mistake that
legitimate endpoint for initialization failure. Independent prediction exercises
are not reset by unrelated trace controls.

## Python and cost claims

`solution.py` is canonical. Regenerate `python-code.js` from its exact bytes;
compare displayed and downloaded sources. Explain LeetCode-provided types such
as ListNode. Use baseline Python with an explicitly stated return contract: a
value-sequence oracle does not itself satisfy a linked-list return contract.

Include real costs: Python word slices and hashes scale with word width; the
heap initialization scans empty list entries; empty DP inputs still need base
row work. Row/column constraint sets improve Sudoku checks but do not remove
exponential search. Distinguish asymptotic proof from measured runtime.

## Acceptance gates

1. Apply the mandatory [review and release gates](leetcode-review-gates.md).
   Freeze criteria, run a separate review in fresh context, and walk each lesson
   before reading its BRIEF or source. Self-checks cannot satisfy this gate.
   Preserve finding IDs, fix revisions, and reviewer closure; continue until
   required fixes are closed rather than stopping at a fixed number of rounds.
2. Use independent oracles, exhaustive small inputs where feasible, seeded
   random inputs, official examples, closed-form maxima, and mutation/identity
   tests. Check intermediate invariants, not only final answers.
3. Exercise both endpoints, replay, rewind, preset changes, every prediction
   option, language-after-interaction, actual keyboard actions, copy fallback,
   blocked storage, offline source display, and source/download parity.
4. Test English and Chinese at 320, 390, 736, and 1440px; inspect focused visual
   states, not only document overflow. Cover a star dependency, changed pointer,
   overfull word count, Sudoku undo, duplicate stop, and positive/zero water.
5. Verify all internal links and deep targets. Bump changed asset references.
   Independent acceptance must precede publication of new or materially revised
   lessons. After authorized publication, verify candidate bytes on the served origin
   and repeat browser checks there. Git push alone is not deployment evidence.
6. Record remaining evidence limits: computational and browser checks are not
   actual novice teach-back, an independent teaching audit, or an accepted
   LeetCode submission.
