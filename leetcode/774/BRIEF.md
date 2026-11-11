# #774 · Minimize Max Distance to Gas Station — author brief

Status (2026-11-11): lesson built and author self-checked by Claude Code (claude-opus-5-5).
Independent review pending; no LeetCode submission, acceptance or deployment claimed.
Category: algorithms (collection) / computing; stage: university. Reader: knows Python
lists and loops and has met binary search on a sorted array.

## History of this brief

The preparation pass (Codex, 2026-10-25) stopped at an official-access blocker: the
problem is subscriber-only, and public GraphQL returns `content: null` and
`codeSnippets: null` (evidence kept unchanged in `tests/evidence/`; the access probe
`tests/capture_official.py` is kept but was not rerun — it makes network requests and
rewrites that evidence). On 2026-11-11 the owner asked for the remaining problems to be
finished, so this pass builds the lesson on the commonly cited statement, labelled as such
in the lesson header, and checks everything that can be checked without the official text.

## Problem as built (statement uncertainty stated)

Stations are strictly increasing integer positions on a line; add `k` new stations at any
real positions; return the smallest possible maximum distance between adjacent stations.
Return type `double`; answers within `1e-6` of the true value are accepted.
Commonly cited limits: `10 <= len(stations) <= 2000`, `0 <= stations[i] <= 1e8`,
`1 <= k <= 1e6`.

What is verified from public data: frontend ID 774, function name `minmaxGasDist`,
parameters `stations: integer[]`, `k: integer`, return `double`, and the two sample inputs
`[1..10], k=9` and `[23,24,36,39,46,56,57,65,84,98], k=1`. Their outputs (0.5 and 14)
are computed here by the exact oracle, not copied. What rests on recall of the
widely published statement: the wording, the limits and the 1e-6 tolerance (absolute).
If the official checker were relative rather than absolute, answers below 1 (possible:
1/(k+1) for a unit gap) would need a tighter stop than `hi - lo <= 1e-6`; the lesson and
tests follow the absolute reading. If the limits differ, the cost paragraph changes but not
the algorithm. The lesson's teaching inputs accept 2–12
stations (the solution itself works for any n >= 2).

## What "correct" means and how tests compare

D* is always a rational `g/(c+1)`. The tests compute D* exactly with `fractions.Fraction`
and assert `|answer - D*| <= 1e-6` in exact arithmetic — the statement's own tolerance,
neither loosened nor tightened. Exact optimality is certified independently of the
solution by `need(D*) <= k < need(D*⁻)`, where `need(x⁻) = Σ floor(g/x)`.

## Learning loop (five fields per step)

| Step | Reader already knows | One question | Input → wanted | Action → observation | Holds when |
|---|---|---|---|---|---|
| 0 | the statement | What are we minimising? | [0,4,10], k=3 → best worst gap | ± stations per gap; ledger of the 4 splits; worst piece ▲ | even spacing inside a gap is optimal (pigeonhole), spare stations never hurt |
| 1 | only counts per gap matter | Why not try every split? | counts → C(k+n−2, n−2) | read baseline; halving trap on one gap of 6 (3 vs 2) | greedy repair is correct but costs k rounds |
| 2 | counts | Can a promised D be met? | D → need(D)=Σ(⌈g/D⌉−1) vs k | drag D; staircase of 12 bars, ✓/✗, k line; question asked before naming binary search | need is non-increasing in D, one switch point |
| 3 | monotone test | How to find the switch point? | presets / own road → rounds | step/rewind; bracket (lo,hi] with ◆ D*; per-gap need table; full history | invariant lo < D* ≤ hi; stop at width ≤ 1e-6 |
| 4 | invariant | Fresh case [0,7,10], k=2 | → 3 | choose, reveal; distractors 2.5 (moves fixed station), 7/3 (forgets untouched gap), 3.5 (one per gap) | answer ≥ longest untouched gap |
| 5 | search | Which line does what, what does it cost? | source → mapping | copy/download; cost O(n log(W/1e-6)) independent of k | float rounding only moves hi a hair below D* |

Terms defined at first use in each step: worst gap, gap, piece, split, ceiling ⌈x⌉,
need(D), lo/hi/mid, invariant, tolerance, D*.

## Proof sketch (as taught)

Pigeonhole: c stations in gap g leave a piece ≥ g/(c+1); even spacing attains it. need(D) is
the minimum stations for limit D and is non-increasing; hence the feasible set is [D*, ∞).
Binary search keeps lo infeasible and hi feasible. Float note: rounding of g/mid is monotone
and integers are exact, so a truly feasible mid is never judged infeasible; a truly
infeasible mid can be judged feasible only within ~1e-16 relative of a threshold.

## Visual / state contract

Every frame is one completed round (or start/stop); deep-copied snapshots; history keeps all
rounds; current row marked ★ in text, not only colour. D* is displayed for checking and is
computed by the separate exact greedy, never by the search. JS simulation ≠ Python.

## Checks run (author)

`python3 -B leetcode/774/tests/test_solution.py` (also runs `test_core.cjs`),
`tests/browser.cjs` against a local preview, and
`python3 -B scripts/register_leetcode_lesson.py 774 --validate-only` (exit 0). Results in
`tests/evidence/numerical.json`, `core.json`, `browser.json`. Not done: page-provenance
label (shared file outside this folder), registration, independent review, real submission.

## Cross-review 2026-11-11

Reviewer: Claude Code (claude-opus-5-5), first reader who did not build the lesson.

- **Statement.** Checked against doocs/leetcode `README_EN.md` for 0774 (mirror of the official
  text) and the Vultr/algo.monster/walkccc write-ups found by search: `10 <= n <= 2000`,
  `0 <= stations[i] <= 1e8`, strictly increasing, `1 <= k <= 1e6`, return the smallest
  possible maximum distance, "answers within 1e-6 of the actual answer" accepted. Matches the
  lesson; the absolute 1e-6 reading is the published wording (walkccc's reference solution
  also stops at `r - l > 1e-6`). One search snippet quoted n ≤ 20000; doocs gives 2000.
- **Independent brute force** (written before reading the builder's tests): every allocation
  of k among the gaps in exact Fractions for 2–5 stations (1,600 cases), plus an exact
  Fraction bisection-and-snap oracle on 1,500 seeded random roads up to n = 2000, positions
  up to 1e8, k up to 1e6, and adversarial roads [0,1e8], [0,1,1e8], [0,1e8−1,1e8]:
  3,115 cases, all within 1e-6; largest observed error 9.8e-7 (inside the tolerance).
- **Float/stop rule.** ulp(1e8) ≈ 1.5e-8, so `hi − lo <= 1e-6` is reachable at the largest
  coordinates; measured 47 rounds for W = 1e8 (= ⌈log₂ 1e14⌉), 23 for W = 6, 20 for W = 1.
  The "truly feasible mid never judged infeasible" argument holds (correctly rounded division
  of an exact integer quotient is exact).
- **Text recomputed:** hand example splits (6, 3, 2, 4 → best 1+2 = 2), C(17,8) = 24,310,
  C(1001998,1998) has 6,260 digits, halving trap 3 vs 2, sample 2 answer 14, prediction
  distractors (need(2.5) = 3, 3.5, 7/3 vs untouched 3), cost 2000 × 47. All correct, zh = en.
- **Browser** (zh/en, 1280/390/320, reduced motion): stepped custom roads [0,7,10] k=2,
  [0,1000] k=40, [0,1,2] k=1, [5,6] k=1 forward/back/end; no console errors, no overflow.
  The history/need tables scroll sideways at 320/390 inside `role=region` wrappers with
  captions, reachable by Tab and scrolled by arrow keys (checked).
- **Rubric:** A3 B3 C3 D3 E3 F3 G3. **Changes:** none needed.
- **Tests after review:** test_solution.py exit 0 (6,170 comparisons, core 298 cases /
  7,661 frames), browser.cjs 205 checks passed, register `--validate-only` exit 0.
- **Not verified:** the official checker itself (no subscriber access); no submission.

## Integration 2026-11-11

Changed by Claude Code (claude-opus-5-5), the LeetCode integration step (see `specs/leetcode-review-2026-11-11.md`).

Generated evidence labelled its run "author … self-check; independent review pending". The label is set in `tests/test_solution.py` and `tests/browser.cjs`; it now reads "self-check (not independent review)" and the evidence was regenerated.
