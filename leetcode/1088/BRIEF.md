# #1088 · Confusing Number II — lesson brief

Built 2026-11-11 (Claude Code, claude-opus-5-5) from the prepared-but-blocked brief of 2026-10-26.
Author self-check only; independent review not performed. No LeetCode submission was made.

## Change from the prepared brief

The preparation pass stopped because the official statement is subscriber-only (evidence kept in
`tests/evidence/`: GraphQL `content: null`, `codeSnippets: null`; metadata confirms frontend ID 1088,
Hard, paid-only, function `confusingNumberII(n: integer) -> integer`, example inputs `20` and `100`).
The owner asked on 2026-11-11 for the remaining problems to be built. This lesson is therefore built on
the problem's well-known definition, stated below; the page says that its restatement is our own and
that the official page is authoritative. Neither statement text nor official examples are reproduced;
all lesson examples are our own (70, 6189, 8250, 200, …).

Problem as understood: digits 0, 1, 8 turn into themselves, 6 ↔ 9, and 2, 3, 4, 5, 7 are invalid after
a 180° rotation. Turning a number turns every digit and reverses their order; leading zeros of the
result are ignored. A confusing number is one whose digits are all valid and whose turned value differs
from it. Return the count of confusing numbers in [1, n], 1 ≤ n ≤ 10⁹.

Residual uncertainty: the exact wording and constraint line could not be read. The definition and bound
agree with the public metadata (single integer parameter, integer result) and the widely reproduced
statement; the official example inputs 20 and 100 give 6 and 19 under this reading, which matches the
commonly cited expected outputs. Python interface assumed `Solution.confusingNumberII(self, n: int) -> int`
from the metadata name (Python is the default language; no language contract needed).

## Approach (replaces the prepared brief's empty plan)

The prepared brief proposed no algorithm. The common accepted approach is a DFS that generates every
number made only of 0/1/6/8/9 (about 1.95 million at n = 10⁹) and checks each. This lesson teaches it
as the intermediate improvement and then goes further:

confusing(n) = turnable(n) − unchanged(n), where turnable(n) is counted digit by digit (shorter lengths
4·5^(l−1); same length grouped by first position below n; stop at an invalid digit of n; +1 for n if all
its digits turn), and unchanged (strobogrammatic) numbers are built from both ends with pairs
(0,0),(1,1),(6,9),(8,8),(9,6) and a middle 0/1/8. Cost O(d·5^(d/2)), d ≤ 10 digits: 7805 strings built
at most, versus ~2·10⁶ for DFS and ~10¹⁰ digit operations for brute force.

## Learning loop (five fields per step)

| Step | Already known | One question | Input → output | Action → observation | Holds when |
|---|---|---|---|---|---|
| 1 Turning | digits | What does a number become? | x → turned value | type/tap 16, 10, 69, 66, 25, 8916; tiles show reversal and mapping; hand count n=70 → 10 | leading zeros dropped |
| 2 Brute force | step 1 | How much work is direct checking? | n → count | read brute and DFS code; 70 checks vs 14 turnable; 10¹⁰ vs 1.95·10⁶ | n ≤ 10⁹ |
| 3 Split (aha) | turnable numbers | Which turnable numbers are not confusing? | grid 1..N → classes | predict, then reveal ↺ marks: 1, 8, 11, 69; wrong turn 66 vs 69 | every turnable number is in exactly one class |
| 4 Count turnable | step 3 identity | How many turnable ≤ n without listing? | n → turnable(n) | n=70 observation (first digit 1 or 6 only), rule, stop, 6189 → 294, base-5 view | first differing position unique |
| 5 Build unchanged | turning reverses | How to list only unchanged numbers? | length → list | pairs and middle digits; length 3 → 12 numbers; sizes 1500/2500 | first digit ≠ 0 |
| 6 Run it | steps 3–5 | How do the parts combine on any n? | n (1..10⁹) → frames | next/back/reset/end; digit tiles ▲/✓/✕, metrics, sampled groups with omission notes, append-only ledger; proof + boundaries | snapshots are teaching storage only |
| 7 Predict | all | n = 200? | → 40 | choose, reveal; distractors 49 (no subtraction), 36 (palindromes), 41 (missed 69/96) | changing the choice clears feedback |
| 8 Python | all | Which line comes from which step; cost? | source | mapping list, copy/fallback/download | — |

Terms at first use: turnable number (step 2), unchanged number (step 3), complement counting (named in
step 3 after the observation), first differing position (step 4), strobogrammatic (named at the end of
step 5).

## Verification

`tests/README.md` lists the commands. Python solution vs independent oracles: exhaustive 1..20000 by a
running count, every turnable number ≤ 10⁹ enumerated with `itertools.product` and bisected for 4000
seeded random n plus ±1 around 520 unchanged numbers and powers of ten; intermediate turnable/unchanged
counts captured with `sys.settrace`; displayed baseline code executed and checked. JS core vs oracle
fixtures with frame accounting and snapshot isolation. Browser: both locales, every preset to both ends,
rewind/replay equality, invalid input, locale switch state, source/download/clipboard/fallback parity,
48px controls at 1280/390/320, reduced motion, blocked storage, file:// opening.

Not verified: an actual LeetCode submission; the official statement text; real devices; independent
teaching review.

## Cross-review 2026-11-11

Reviewer: Claude Code (claude-opus-5-5), first reader who did not build the lesson.

- **Statement.** Checked against doocs/leetcode (README_EN for 1088) and walkccc.me plus search
  summaries of grandyang/jaywin write-ups: rotation map 0/1/6/8/9 → 0/1/9/8/6, other digits invalid,
  leading zeros ignored, count confusing numbers in [1, n], 1 ≤ n ≤ 10⁹, method
  `confusingNumberII(self, n: int) -> int`. The lesson's restatement matches; the method name is now
  confirmed by two public repositories (not by the official page).
- **Independent brute force** (written before reading the builder's oracle,
  `/tmp/agent-tasks/leetcode/xreview-b/bf1088.py`): running count for every n in 1..30000 plus my own DFS
  of all 1,953,125 turnable numbers ≤ 10⁹ bisected for 3000 random n and ±1 around 1000 turnable
  numbers: 36,012 comparisons, all equal.
- **Text recomputed by code:** 70 → 10 (14 turnable, 4 unchanged, 56 not turnable), 6189 → 294 turnable,
  200 → 49 − 9 = 40, 13 turnable palindromes ≤ 200, 9 unchanged ≤ 300, length-9/10 counts 1500/2500,
  4998 unchanged ≤ 10 digits, 6248 final strings, boundaries 1/10/69/10⁹. All correct. The claim that
  every turnable number is either unchanged or confusing holds by definition (no counterexample exists).
- **Error found and fixed:** `solution.py` wrote `for mid in build(length - 2)` inside the
  comprehension, which Python re-evaluates once per pair: build was called 5× per level and made 33,593
  strings at d = 10, not the 7805 the cost paragraph claims (still O(d·5^(d/2)) asymptotically, but the
  stated figure was false for the shown code). Now `inner = build(length - 2)` is built once (matching
  core.js); `python-code.js` regenerated; step-8 map and cost text say so. New test in
  `test_solution.py` traces build() returns inside the real solution and pins 7805 strings / 35 calls.
- Rubric: A3 B3 C3 D3 E2 F3 G3 after the fix.
- Not verified: LeetCode submission; official wording.
