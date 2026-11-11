# #1183 · Maximum Number of Ones — lesson brief

Category computing / LeetCode collection; stage university. Reader knows Python loops, integer division and
sorting. Outcome: the reader can explain why cells with the same (row mod s, column mod s) are interchangeable,
why every s×s window holds exactly one cell of each class, why the k largest classes are optimal (not just
feasible), compute a class size by hand, and write the O(s² log s) solution.

## Revision of the preparation brief (2026-11-11)

The preparation pass (2026-10-27) stopped at the subscription gate (`content: null`, `codeSnippets: null`); its
access record stays in `tests/`. Public metadata: title, slug, Hard, four hints (residue classes, "choose the
cells with max frequency"), and example inputs `3 3 2 1` and `3 3 2 2`. This build uses the widely known
statement, consistent with that metadata:

- A matrix of `width` columns and `height` rows holds 0/1 values. Every square sub-matrix of side
  `sideLength` may contain at most `maxOnes` ones. Return the largest possible number of ones.
- Constraints (as widely reported): 1 ≤ width, height ≤ 100; 1 ≤ sideLength ≤ width, height;
  0 ≤ maxOnes ≤ sideLength².
- Python interface `Solution.maximumNumberOfOnes(self, width: int, height: int, sideLength: int, maxOnes: int) -> int`.
  The parameter order is taken from the four-line example testcases and the hints; the official Python
  snippet is not public. The examples give 4 and 6 (checked in tests).

Uncertain without a subscription: exact wording, the exact constraint bounds, and the parameter order (the
answer is symmetric in width/height, so swapping those two would not change results). The backend
`questionId` is 1152 while the frontend number is 1183; the catalog uses 1183.

## Learning loop

| Step | Already known | Question | Input → output | Action → observation | Holds when |
|---|---|---|---|---|---|
| 1 Sandbox | problem | How many ones fit in 5×4, s=2, k=2? | click cells | over-full windows turn red; "load greedy" shows 10 | any small grid |
| 2 Brute force | step 1 | Correct direct method, why slow / why greedy fails? | 2²⁰ grids; row-major greedy | greedy rows 0, 2 = 10 vs columns 0, 2, 4 = 12 | — |
| 3 Classes | a better grid exists | Which cells can share a fate? | 5×4, s=2 | move the window: it always covers one A, B, C, D; "fill A" never overfills; reveal answer | every window position |
| 4 Count | classes | How big is each class? | ⌈(h−a)/s⌉·⌈(w−b)/s⌉ | sizes 6, 4, 6, 4 → top two = 12 | — |
| 5 Proof | feasibility | Could a non-class grid beat it? | window weights 1/3, 1/6, 1/6, 1/3 | each cell covered with probability 1 / class size → Σ ≤ top-k sum | any valid grid |
| 6 Walk | all | Does the formula hold on my input? | presets / ± steppers (≤12) | count each class, sort, pick k; grid + movable window shows max ones per window ≤ k | page limit 12 |
| 7 Predict | all | 7×4, s=3, k=2? | choose, reveal; distractors 12, 4 | hidden until reveal; answer 10 | — |
| 8 Code | all | which idea → which line; cost | solution.py | mapping; O(s² log s) time, O(s²) space | — |

Trace frame = after one class is counted, after the sort, or after one class is picked. Frame 0 does nothing.

Proof sketch (step 5): pick the window start x in one dimension with P(start ≤ x) = (⌊x/s⌋+1)/cnt(x mod s), where
cnt(r) is the number of positions with remainder r. A cell at x is covered with probability exactly 1/cnt(x mod s);
in two dimensions, 1/class size. A valid grid has ≤ k ones in every window, so Σ over its ones of 1/size(class) ≤ k;
per class the ones contribute (ones in class)/size ≤ 1, a fractional knapsack whose optimum is the k largest
classes.

## Verification (author self-check, not independent review)

- `tests/test_solution.py`: branch-and-bound brute force over all grids with W, H ≤ 6 and W·H ≤ 25 (434 cases);
  1,500 seeded random cases where the construction (fill the chosen classes) is checked window by window with
  prefix sums; 14 extremes including the two public examples; exact `Fraction` certificates for the 1-D window
  distribution for every n ≤ 100 and s ≤ n (5,050). Fixtures (1,948) go to `tests/test_core.cjs`, which checks
  the browser model, every trace frame (33,398), and that the row-major greedy is never better (worse in 60 of
  456 checked cases).
- `tests/test_copy.py`, `tests/browser.cjs` (tests/README.md).
- Not verified: a LeetCode submission, the official statement text, real devices, independent teaching review.

## Cross-review 2026-11-11

Reviewer: Claude Code (claude-opus-5-5). First reader who did not build the lesson.

**Problem statement.** Checked against three public sources:
- doocs/leetcode `1183.Maximum Number of Ones/README_EN.md`: constraints 1 ≤ width, height ≤ 100;
  1 ≤ sideLength ≤ min(width, height); 0 ≤ maxOnes ≤ sideLength²; examples 3 3 2 1 → 4 and 3 3 2 2 → 6;
- leetcode.ca: the same constraints and examples;
- walkccc.me/LeetCode/problems/1183: signature `maximumNumberOfOnes(width, height, sideLength, maxOnes)`.

The lesson's parameter order and bounds match. The official text does not say whether width counts rows or columns.
The page now states its convention (width = columns) and that swapping the two does not change the answer.

**Solution.** I wrote an independent exact solver, a DP over rows with the last s−1 rows as the state, without reading
the builder's brute force:
- in C (scratch: `/tmp/agent-tasks/leetcode/xreview-e/ones_dp.c`) it agrees with the formula on 1,425 cases: s = 1…5,
  up to 7 × 11 at s = 3, 6 × 10 at s = 4 and 5 × 9 at s = 5, every k. Of these, 817 have s ≥ 3 and a dimension not
  divisible by s;
- the DP itself was validated against plain enumeration on 134 grids of at most 16 cells;
- a Python port is now `tests/test_row_dp.py` (670 cases, 396 non-divisible with s ≥ 3, about 60 s; it checks both
  argument orders).
solution.py also agrees with the closed formula on 168,510 parameter sets up to 40 × 40.

**Proof.** Checked step by step. The window-start distribution P(start ≤ x) = (⌊x/s⌋+1)/cnt(x mod s) holds in
general:
- it is non-decreasing because a block index t ≤ q−1 gives (t+2)/(q+1) ≥ (t+1)/q;
- it equals 1 from x = n−s onward;
- the coverage of x is F(x) − F(x−s) = 1/cnt.
I verified this with exact fractions for every n ≤ 150. Each window holds at most k ones, so Σ f_X ≤ k. The total
Σ f_X · size_X is a fractional knapsack whose optimum is the k largest sizes. The page now states the general
formula instead of only citing the tests.

**Text.** Recomputed: greedy 10 versus 12 on 5×4 (s = 2, k = 2); class sizes 6, 4, 6, 4; the 1-D probabilities
1/3, 1/6, 1/6, 1/3 and coverages; height 4 using 1/2, 0, 1/2; "3×2 greedy gets only 3" (optimum 4); predict 7×4,
s = 3, k = 2 → 10. All correct, and zh and en agree.

**Teaching.** Step 3 announced the (r mod s, c mod s) labels before showing why they matter (rubric B = 2). It now
starts from step 2's 12-one grid: the ones repeat every 2 columns, and a window shifted by s sees the same pattern,
so cells s apart are "the same spot". Only then are the labels named.

**Rubric** (0–3): A 3, B 3 (after the rewrite), C 3, D 3, E 3, F 3; G correct.
Not verified: a LeetCode submission, the official wording, exact optimality on grids larger than the DP reaches (that
rests on the proof).
