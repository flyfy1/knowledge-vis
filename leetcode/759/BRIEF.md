# #759 · Employee Free Time — author brief (rebuilt 2026-11-11)

Status: author build and self-check complete; independent review pending. No LeetCode
submission, independent acceptance, registration or deployment is claimed.

## History of this brief

The 2026-10-25 preparation pass stopped at the source gate (subscriber-only; GraphQL `content`
and `codeSnippets` null, page 403; evidence in `tests/evidence/`, probe `tests/check_official_access.py`).
Re-run into scratch on 2026-11-11: still blocked. The owner asked on 2026-11-11 for the remaining
problems to be finished, so the lesson is built on the publicly circulated statement, labelled on the page.
The probe is kept as access evidence, not as a lesson test.

## Contract taught (not verified against the official page)

- `schedule`: list of employees, each a list of LeetCode `Interval` objects (`.start`, `.end`),
  `start < end`, each employee's list sorted and non-overlapping. The public metadata
  (`typescriptCustomType` defines `class Interval {start; end}`; sample input
  `[[[1,2],[5,6]],[[1,3]],[[4,10]]]`) is consistent with this.
- Output: list of `Interval`, finite, positive length, sorted, free for all employees.
  **Zero-length gaps (touching intervals) are excluded; the unbounded ends are excluded.**
- Assumed limits: 1 ≤ employees, intervals per employee ≤ 50; 0 ≤ start < end ≤ 10^8.
- Python interface assumed: `Solution.employeeFreeTime(self, schedule: '[[Interval]]') -> '[Interval]'`
  with `Interval(start, end)` constructible positionally. Uncertainty: whether touching intervals
  inside one employee occur (the solution handles them either way) and exact limits.

## Learning path

| Step | Question | Example / action |
|---|---|---|
| 1 Task | What counts as free? | A 1-3 9-10, B 3-5 12-14, C 2-4 6-7 on a time line → [5,6],[7,9],[10,12]; unbounded ends and zero-length gap at 3 excluded |
| 2 Brute force | Cost of checking every piece between endpoints | Live table: 11 endpoints, 10 pieces, ≤60 checks; at max shape ~1.25·10^7 checks, quadratic |
| 3 Key observation | What information is needed? | Two questions, answers in "think first" disclosures: (1) owner irrelevant → pool intervals; (2) only the furthest end `reach` matters. Then the classic wrong turn: previous end instead of reach (A 1-10, B 2-3 5-6 reports [3,5]) |
| 4 Sweep | How does reach change; where do gaps come from | Four cases (gap/touch/overlap/swallowed); reversible trace with presets, custom schedule input, slider, time line (reach line, merged row, free row, pending/current/done bars), sorted table with case labels, and a red comparison line at the step where the previous-end rule would misreport |
| 5 Proof + predict | Why no gap is missed or invented; why output is sorted | Invariant and proof tied to [6,7] with reach 5; boundary list; fresh prediction A 0-9, B 1-2 4-5, C 7-8 11-12 (distractors: previous-end result, unbounded end included, empty) |
| 6 Python | Line-to-step mapping and cost | Source first; O(N log N) vs 1.25·10^7; O(N) space; heap O(N log k) alternative |

## Verification (author)

- `tests/test_solution.py`: unit-cell oracle (independent) vs `solution.py` with LeetCode-style
  `Interval` objects — 127,550 exhaustive schedules (1–3 employees, 1–2 intervals each in [0,5],
  touching allowed), 5,000 seeded random, max shape 50×50 up to 10^8 against a compressed-piece
  oracle, named lesson cases, non-mutation, the previous-end counterexamples, mirror and copy keys.
  `test_core.cjs` checks every frame: reach = max processed end and monotone, covered = independent
  union, free = union holes and prefix of the answer, case classification, deep snapshots, parser errors.
- `tests/browser.cjs`: as for #727 (both locales, presets, rewind/replay, custom valid/invalid,
  prediction, locale switch, copy/fallback/download, keyboard, 1280/390/320, 48px, preset label width,
  reduced motion, blocked storage, offline).
- `python3 -B scripts/register_leetcode_lesson.py 759 --validate-only` exit 0.

## Cross-review 2026-11-11

Reviewer: Claude Code (claude-opus-5-5), first reader who did not build the lesson. Independent of the
author; no LeetCode submission.

- **Statement.** Checked against the doocs/leetcode README, the openset/leetcode mirror and the cnoodle
  write-up (via search). They agree: `schedule` of employees, each a sorted list of non-overlapping
  `Interval` objects (not lists); return finite, **positive-length** common free intervals in sorted order;
  `[5,5]`-style zero-length gaps are explicitly excluded; 1 ≤ schedule.length, schedule[i].length ≤ 50;
  0 ≤ start < end ≤ 10⁸; Python `employeeFreeTime(self, schedule: '[[Interval]]') -> '[Interval]'`.
  The lesson's contract matches on every point, including the limits it had marked as assumed.
- **Brute force.** My own oracle (half-unit sampling of every unit cell between the extreme endpoints),
  written before reading `tests/oracle.py`, agreed with `solution.py` on 35,550 schedules: every 1–2
  employee schedule with 1–2 intervals in [0,5] (touching allowed), 30,000 sampled 3–4 employee schedules
  from the same pool, 3,000 seeded random schedules up to 6 employees on [0,60], some with touching
  intervals inside one employee.
- **Text.** Recomputed: 11 endpoints / 10 pieces / ≤ 60 checks, 4,999 × 2,500 ≈ 1.25·10⁷, every preset
  answer, the previous-end counterexample, the prediction and all three distractors (the previous-end rule
  does give [2,4],[5,7],[8,11]), N log₂N ≈ 3·10⁴. Proof and ordering argument hold; zh/en match. No errors.
- **Browser.** zh/en at 1280/390/320 on main and swallow presets: no overflow, no console errors, targets
  ≥ 48 px; author `browser.cjs` passes. At 390/320 the time line is a focusable horizontal scroller
  (min-width 560 px), so later intervals sit off-screen until scrolled; acceptable, noted only.
- **Rubric.** A3 B3 C3 D3 E3 F3 G3. Both questions (drop the owner; what single number to keep) come
  before the sweep is named.
- **`sep` exemption.** Legitimate (sentence joiner, pinned to `['', ' ']`).
- **Changed.** Nothing in the lesson. My first test run omitted `OUTPUT_DIR` and regenerated
  `tests/evidence/numerical.json` and `oracle-fixtures.json` in place (same seeds).
- **Not verified.** The official page itself; a learner study.
