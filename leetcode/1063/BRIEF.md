# #1063 · Number of Valid Subarrays — author brief

Status (2026-11-11): lesson built and author self-checked by Claude Code (claude-opus-5-5).
Independent review pending; no LeetCode submission, acceptance or deployment claimed.
Category: algorithms (collection) / computing; stage: university. Reader: basic Python
loops, lists and indexing; has not necessarily met a monotonic stack.

## History of this brief

The preparation pass (Codex, 2026-10-26) stopped at an official-access blocker: the problem
is subscriber-only and public GraphQL returns `content: null`, `codeSnippets: null`
(evidence kept unchanged in `tests/evidence/`; the access probe
`tests/check_official_access.py` is kept but not rerun — it makes network requests and
rewrites that evidence). Its plan (hand calculation → derivation → reversible simulation →
fresh prediction → source mapping) is what this pass implements. On 2026-11-11 the owner
asked for the remaining problems to be finished, so the lesson is built on the commonly
cited statement and labels that in its header.

## Problem as built (statement uncertainty stated)

Given an integer array `nums`, return the number of non-empty contiguous subarrays whose
leftmost element is not larger than any other element of the subarray (ties allowed).
Commonly cited limits: `1 <= n <= 5*10^4`, `0 <= nums[i] <= 10^5`.

Verified from public data: frontend ID 1063, `validSubarrays(nums: integer[]) -> integer`,
and the three sample inputs `[1,4,2,5,3]`, `[3,2,1]`, `[2,2,2]`. Their outputs (11, 3, 6) are
computed here from the definition, not copied. The tie rule ("not larger", so `[2,2,2]` → 6
rather than 3) rests on recall of the published statement; the sample `[2,2,2]` exists
precisely to pin it, and the lesson teaches the `>=` variant as the classic slip. If the
official rule were strict, the only change would be `>` → `>=` in the pop condition.

## Learning loop (five fields per step)

| Step | Reader already knows | One question | Input → wanted | Action → observation | Holds when |
|---|---|---|---|---|---|
| 0 | statement | What counts? | [1,4,2,5,3] → 11 | tap squares of the start×end triangle; breaker named; show all → 11 of 15 | ties valid; positions counted separately |
| 1 | definition | How much work is checking? | n → n(n+1)/2 | baseline with early break (8 vs 10 comparisons); non-decreasing input never breaks | counting one subarray at a time costs as much as the answer (1.25e9) |
| 2 | triangle | What shape do the ✓ make? | rows, then columns | row select: run ends at first smaller (5+1+3+1+1); column select: alive starts, killed start outlined; question before naming | alive values non-decreasing ⇒ killed ones are the last; death is permanent |
| 3 | alive list | What does an arrival do? | presets / own array, rule > or ≥ | step/rewind; array states, stack, triangle column filling, per-j ledger; definition count at the end | invariant: stack = alive starts; ≥ rule undercounts [2,2,2] (3 vs 6) |
| 4 | stack rule | Fresh [3,1,2,2,0], index 3 | → starts 1,2,3 → 3 | choose/reveal; distractors pop-on-tie, revived start, only-newest | total 8 |
| 5 | algorithm | Which line, what cost? | source | mapping; amortised push/pop ≤ 2n | O(n) time, O(n) space |

Terms defined at first use: subarray, start/end, valid, alive start, dies, stack/pop/push,
monotonic stack, invariant.

## Correctness (as taught)

Row view: if `nums[k] < nums[i]` for some `k > i`, every subarray `i..j` with `j >= k`
contains it, so start i is valid exactly for ends `i..next_smaller(i)-1`. Column view:
starts alive at j have non-decreasing values (a larger earlier start would have been killed
by the later smaller alive start), so a new value v kills exactly a top segment of the stack;
popping while `top > v` maintains "stack = alive starts". Each column contributes its
stack size; summing columns equals summing rows.

## Visual / state contract

One frame per arriving element (plus start/stop), deep-copied; the triangle keeps all filled
columns; current column, just-arrived element (★) and dead starts (✗ j=…, struck value) are
distinguished by text as well as colour. Under the ≥ rule, squares where the rule disagrees
with the definition are marked `✗!`. JS simulation ≠ Python.

## Checks run (author)

`python3 -B leetcode/1063/tests/test_solution.py` (also runs `test_core.cjs`),
`tests/browser.cjs` against a local preview, and
`python3 -B scripts/register_leetcode_lesson.py 1063 --validate-only` (exit 0). Results in
`tests/evidence/numerical.json`, `core.json`, `browser.json`. Not done: page-provenance
label (shared file outside this folder), registration, independent review, real submission.
Triangle squares in step 0 are 48px high but about 43px wide at 320px viewport width.

## Cross-review 2026-11-11

Reviewer: Claude Code (claude-opus-5-5), first reader who did not build the lesson.

- **Statement.** Checked against doocs/leetcode `README_EN.md` for 1063 and the mirrors found
  by search (lzl124631x, algo.monster, talentd): "leftmost element not larger than other
  elements", `1 <= n <= 5*10^4`, `0 <= nums[i] <= 10^5`, and the three samples with [2,2,2] → 6.
  The tie rule and limits as built are the published ones.
- **Independent brute force** (definition, written before reading the builder's tests):
  every array over {0,1,2} of length 1–7 (3,279) plus 3,000 seeded random arrays up to
  length 60 with small and large value ranges: 6,279 cases, all equal.
- **Error found and fixed.** Step 1 said the displayed baseline makes "8 comparisons instead
  of 10" on [1,4,2,5,3]. The code shown starts `j` at `i`, so it makes 13 comparisons with the
  early break and 15 without (the count for `j` from `i+1` would be 8/10). Corrected in zh and
  en, and pinned in `tests/test_solution.py` by counting the displayed loop's comparisons and
  checking the copy quotes 13 and 15.
- **Layout fixed.** Step-0 squares are buttons and were ~43–45px wide at 320px. `#grid0` now
  uses `minmax(48px,1fr)` columns, and at ≤360px its stage (`.tri-stage`) gives up side
  padding and the row-header column shrinks to 18px: measured 49px at 320, 53 at 340, 57 at
  360, ≥52 above; no horizontal overflow. Cache version bumped to `1063-2`.
- **Other text recomputed:** row counts 5+1+3+1+1, column counts 1+2+2+3+3 = 11, ≥ rule on
  [2,2,2] → 3, prediction [3,1,2,2,0] index 3 → 3 and total 8, 1,250,025,000. Correct.
- **Rubric:** A3 B3 C3 D3 E3 F3 G3 after the fix (G2 before).
- **Tests after review:** test_solution.py exit 0 (25,967 comparisons, core 805 cases /
  4,057 frames), browser.cjs 189 checks passed, register `--validate-only` exit 0.
- **Not verified:** official judge (no subscriber access); no submission.

## Integration 2026-11-11

Changed by Claude Code (claude-opus-5-5), the LeetCode integration step (see `specs/leetcode-review-2026-11-11.md`).

Generated evidence labelled its run "author … self-check; independent review pending". The label is set in `tests/test_solution.py` and `tests/browser.cjs`; it now reads "self-check (not independent review)" and the evidence was regenerated.
