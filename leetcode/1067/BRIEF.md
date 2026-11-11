# #1067 · Digit Count in Range — author brief

Status (2026-11-11): lesson built and author self-checked by Claude Code (claude-opus-5-5).
Independent review pending; no LeetCode submission, acceptance or deployment claimed.
Category: algorithms (collection) / computing; stage: university. Reader: basic Python
integer arithmetic (`//`, `%`) and loops; has not necessarily seen digit counting.

## History of this brief

The preparation pass (Codex, 2026-10-26) stopped at an official-access blocker: the problem
is subscriber-only, the page returned HTTP 403 and public GraphQL returned `content: null`,
`codeSnippets: null` (evidence kept unchanged in `tests/evidence/`; the access probe
`tests/check_official_access.py` is kept but not rerun — it makes network requests and
rewrites that evidence). Its plan (hand calculation → derivation → reversible simulation →
fresh prediction → source mapping) is what this pass implements. On 2026-11-11 the owner
asked for the remaining problems to be finished, so the lesson is built on the commonly
cited statement and labels that in its header.

## Problem as built (statement uncertainty stated)

Given a digit `d` (0–9) and integers `low <= high`, return how many times `d` is written
when every integer in `low..high` is written out in ordinary decimal (occurrences, so 11
counts two 1s). Commonly cited limits: `0 <= d <= 9`, `1 <= low <= high <= 2*10^8`.

Verified from public data: frontend ID 1067, `digitsCount(d: integer, low: integer,
high: integer) -> integer`, and the two sample inputs `(1, 1, 13)` and `(3, 100, 250)`.
Their outputs (6 and 35) are computed here by writing every number out, not copied.

Rests on recall, not on the official text:
- the limits above; in particular `low >= 1`, so the number 0 is never in range (if 0 were
  allowed, "0" would have to count as one zero for d = 0 — the solution would need
  `+1` when `low == 0` and `d == 0`; the tests do not cover low = 0);
- that numbers are written without leading zeros (the only reading under which the
  occurrence count is well defined; 100 holds two zeros, 7 holds none).

## Learning loop (five fields per step)

| Step | Reader already knows | One question | Input → wanted | Action → observation | Holds when |
|---|---|---|---|---|---|
| 0 | statement | What is counted? | d=1, 1…13 → 6 | edit d/low/high (≤ 999, ≤ 200 numbers); every occurrence boxed; d=0 over 1…100 → 11 zeros in 10 numbers | occurrences, not numbers; no leading zeros |
| 1 | definition | How much work is writing everything? | 2·10⁸ numbers × 9 digits | baseline; question: reduce low…high to 1…n | f(high) − f(low−1), f(0) = 0 |
| 2 | prefix count | Where do the d's sit at one place? | number wall 0…N, d 1–9, place 1/10/100 | ones = one column, tens = band of 10 every 100; readout splits N into blocks + last block; question before formula | left·p + {p, right+1, 0} |
| 3 | place formula | How do places combine; what changes for d = 0? | presets / own input, rule correct or naive | one frame per place for f(high), f(low−1), subtraction; table of places; brute check ≤ 200,000 numbers | d=0 naive gives 122 vs 11 (111 = 100+10+1 leading zeros); (left−1)·p, stop at left = 0 |
| 4 | zero rule | Fresh d=0, 1…105 | → 16 | choose/reveal; distractors 15 (numbers not occurrences), 20 (full tens block), 127 (naive) | 10 + 6 |
| 5 | algorithm | Which line, what cost? | source | mapping; ≤ 9 passes per call | O(log₁₀ high) time, O(1) space |

Terms defined at first use: occurrence, leading zero, place value p, left/cur/right split,
complete block, prefix count f(n).

## Correctness (as taught)

Every occurrence sits at exactly one place of one number, so place counts add. At place p,
the numbers in 1…n with d there are: all with left part < `left` (p each), plus, when the
left part equals `left`, all p if `cur > d`, the first `right + 1` if `cur = d`, none if
`cur < d`. For d = 0 a zero needs a nonzero digit to its left, so left parts start at 1:
`(left − 1)·p`, and no place with `left = 0` holds a zero. The naive rule over-counts by
exactly the padded leading zeros plus the number 0 (111 for n = 100).

## Visual / state contract

One frame per place (no skipping), deep-copied; current table row starred (★) and in accent
colour; leading-zero stop named in text. The wall boxes the chosen place and underlines
other places with a dashed line, so the distinction is not colour-only. JS simulation ≠ Python.

## Checks run (author)

`python3 -B leetcode/1067/tests/test_solution.py` (also runs `test_core.cjs`),
`tests/browser.cjs` against a local preview, and
`python3 -B scripts/register_leetcode_lesson.py 1067 --validate-only` (exit 0). Results in
`tests/evidence/numerical.json`, `core.json`, `browser.json`. Not done: page-provenance
label (shared file outside this folder), registration, independent review, real submission.
At 320px the places table scrolls horizontally inside a focusable region.

## Cross-review 2026-11-11

Reviewer: Claude Code (claude-opus-5-5), first reader who did not build the lesson.

- **Statement.** Checked against doocs/leetcode `README_EN.md` for 1067 and talentd /
  search-indexed mirrors: `0 <= d <= 9`, `1 <= low <= high <= 2*10^8`, count occurrences of d
  as a digit over [low, high]; samples (1,1,13) → 6 and (3,100,250) → 35. So `low >= 1` is the
  published constraint and the low = 0 doubt does not arise (the solution would return 1
  instead of 2 for d=0, low=0, high=10 — outside the problem's domain).
- **Independent brute force** (`str(x).count`): every d in 0–9 and every 1 ≤ low ≤ high ≤ 300
  (451,500 cases) plus 3,000 seeded random windows of up to 20,000 numbers, half of them near
  2·10⁸: 454,500 cases, all equal.
- **Text recomputed:** 1…13 → 6; d=0 over 1…100 → 11 in 10 numbers; naive 122 with
  extra 111 = 100 + 10 + 1; f(250) = 55, f(99) = 20, 35; prediction 1…105 → 16 with
  distractors 15, 20, 127; d=2 over 1…2·10⁸ = 160,000,001; ≤ 9 places. All correct, zh = en.
- **Fixed (wording):** en readouts said "all 1 numbers with 3 there" and "Writing out all
  1 numbers" when p or the count is 1; reworded in `copy.js` (zh adjusted to match). Cache
  version bumped to `1067-2`.
- **Browser** (zh/en, 1280/390/320, reduced motion): stepped d=0 1…105, d=0 1…100 naive,
  d=7 70…77, d=0 10…10, d=9 199999990…200000000; no console errors, no page overflow.
  The places table scrolls sideways at 320 inside a captioned `role=region`, reachable by Tab
  and scrolled by arrow keys (checked) — acceptable.
- **Rubric:** A3 B3 C3 D3 E3 F3 G3.
- **Tests after review:** test_solution.py exit 0 (808,020 comparisons, core 776 cases /
  10,409 frames), browser.cjs 243 checks passed, register `--validate-only` exit 0.
- **Not verified:** official judge (no subscriber access); no submission.

## Integration 2026-11-11

Changed by Claude Code (claude-opus-5-5), the LeetCode integration step (see `specs/leetcode-review-2026-11-11.md`).

Generated evidence labelled its run "author … self-check; independent review pending". The label is set in `tests/test_solution.py` and `tests/browser.cjs`; it now reads "self-check (not independent review)" and the evidence was regenerated.
