# #1121 · Divide Array Into Increasing Sequences — lesson brief

Built 2026-11-11 (Claude Code, claude-opus-5-5) from the prepared-but-blocked brief of 2026-10-26.
Author self-check only; independent review not performed. No LeetCode submission was made.

## Change from the prepared brief

The preparation pass stopped because the official statement is subscriber-only (evidence kept in
`tests/evidence/`: GraphQL `content: null`, `codeSnippets: null`; frontend ID 1121, paid-only, example
inputs `[1,2,2,3,3,4,4], 3` and `[5,6,6,7,8], 3`). The owner asked on 2026-11-11 for the remaining
problems to be built, so this lesson uses the problem's well-known definition, stated below; the page
says its restatement is our own and that the official page is authoritative. No statement text or
official example is reproduced; all lesson examples are our own.

Problem as understood: given a non-decreasing integer array `nums` and an integer `k`, decide whether
`nums` can be partitioned into one or more disjoint subsequences, each strictly increasing and of length
at least `k`. Bounds 1 ≤ k ≤ nums.length ≤ 10⁵, 1 ≤ nums[i] ≤ 10⁵.

Residual uncertainty: the exact wording and constraint line could not be read. Under this reading the
two official example inputs give true and false, which matches the commonly cited expected outputs.
The Python interface `Solution.canDivideIntoSubsequences(self, nums: List[int], k: int) -> bool` is the
commonly reproduced signature; the public metadata no longer exposes it, so it is unverified (the page
says so in step 7). Python is the default language; no language contract needed.

## Approach (replaces the prepared brief's empty plan)

Let f be the largest multiplicity in `nums`. Answer: f · k ≤ n.
Necessary: the f copies of one value need f different sequences, each with ≥ k elements.
Sufficient: deal `nums` in order round-robin onto f piles. Equal values occupy ≤ f consecutive
positions, so they land on different piles; each pile therefore receives a strictly increasing run; the
smallest pile has ⌊n/f⌋ ≥ k elements. Since `nums` is sorted, f is the longest run of equal neighbours:
O(n) time, O(1) extra space.

## Learning loop (five fields per step)

| Step | Already known | One question | Input → output | Action → observation | Holds when |
|---|---|---|---|---|---|
| 1 Split by hand | the definition | What does a valid split look like? | [1,1,2,2,3,4], k=3 → [1,2,3] + [1,2,4] | try, then open the answer | the two 1s must be apart |
| 2 Baseline | step 1 | Why do search and greedy fail? | — | search: Bell(6)=203, Bell(20) > 5·10¹³; greedy longest chain gives [1,2,3,4]+[1,2] → wrong false | greedy shown wrong on step 1's example |
| 3 Necessity (aha) | step 2's "length can be shared" | What forces failure? | [1,1,1,2,3,4,5,6], k=3 → false (9 > 8) | predict, open; frequency bars of the current input | — |
| 4 Sufficiency | step 3's bound | Is f·k ≤ n enough? | [1,2,2,2,3,3,4,5,6], k=3 → piles [1,2,4],[2,3,5],[2,3,6] | read the dealing, proof of both properties | nums sorted |
| 5 Run it | steps 3–4 | How do counting, comparing and dealing proceed on any input? | ≤ 24 values 1–99, k → frames | input/presets; next/back/reset/end; cells show run length then pile; piles with short ones marked; greedy comparison; boundaries | snapshots are teaching storage only |
| 6 Predict | all | [1,2,2,3,3,3,4,5,6,7], k=3? | → true | choose, reveal; distractors "n not a multiple of 3" and "greedy leftover not increasing" | changing the choice clears feedback |
| 7 Python | all | Which line comes from which step; cost? | source | mapping, cost, copy/fallback/download | — |

Terms at first use: maximum multiplicity f (step 3), necessary / sufficient condition (steps 3–4),
round-robin dealing (step 4).

## Verification

`tests/README.md` lists the commands. Python solution vs an independent exhaustive split search (places
each element on an earlier sequence ending lower or on a new one, memoised; never uses the formula):
every non-decreasing array of length 1–9 over values 1–4 with every k (5148 cases), 3000 seeded random
arrays up to length 14 with values up to 12, 8 lesson examples, 5 maximum-size inputs checked against a
`Counter` computation under 0.5 s; Bell numbers recomputed; source mirror and copy keys checked. JS core
vs 608 search-oracle fixtures: frame order, run/most accounting, bound, pile index i mod f, piles strictly
increasing with shortest ⌊n/f⌋, greedy chains partition the input, snapshot isolation, input validation.
Browser: both locales, all six presets to both ends with rewind/replay equality and final piles equal
to the core, custom input incl. five invalid kinds keeping the display, prediction, locale switch state,
source/download/clipboard/fallback parity, keyboard, 48px controls and no overflow at 1280/390/320 with
the longest input, reduced motion, blocked storage, file:// opening.

Not verified: an actual LeetCode submission; the official statement text and method name; real
devices; independent teaching review.

## Cross-review 2026-11-11

Reviewer: Claude Code (claude-opus-5-5), first reader who did not build the lesson.

- **Statement.** Checked against doocs/leetcode (README_EN for 1121) and walkccc.me: sorted
  non-decreasing `nums`, divide into one or more disjoint increasing subsequences of length ≥ k,
  1 ≤ k ≤ n ≤ 10⁵, 1 ≤ nums[i] ≤ 10⁵, method `canDivideIntoSubsequences(nums, k) -> bool`. "Increasing"
  must mean strictly and "divide" must mean every element is used: under either other reading the second
  public example would be true, not false. The lesson's restatement matches.
- **Independent brute force** (`/tmp/agent-tasks/leetcode/xreview-b/bf1121.py`, memoised search over
  open sequences, no formula): all sorted arrays of length 1–9 over 1–4 with every k plus 3000 seeded
  random arrays up to length 13: 8148 comparisons, all equal; 10⁵-element input in 3 ms.
- **Text recomputed:** Bell(6) = 203, Bell(20) ≈ 5.17·10¹³; greedy leaves [1, 2] on step 1's input; the
  dealing examples of steps 4 and 6 and the greedy leftover [2, 3, 3]; the sufficiency proof (equal values
  occupy ≤ f consecutive positions → distinct residues; smallest pile ⌊n/f⌋ ≥ k) checked, no
  counterexample. zh/en agree.
- **Changed:** step-7 interface note now says the method name matches two public repositories.
- Rubric: A3 B3 C3 D3 E3 F2 G3.
- Not verified: LeetCode submission; official wording.
