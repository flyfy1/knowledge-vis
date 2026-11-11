# Problem 233: interactive lesson brief

Category: `computing` (LeetCode algorithms) · Stage: `university` · Canonical language: Python3.

Product-fit verdict: build one focused lesson in the approved LeetCode collection pattern. The reader's job is to count every digit `1` through a positional invariant, and validation is a cold browser walk plus an independent oracle. Reuse shared dark tokens and controls; no universal visualization framework.

## Learning loop

Start with `n = 13`, hand-count six occurrences across `0..13`, then isolate one place value at a time. A factor `f` means the digit position with place value `f` (1, 10, 100, …). For each position, split `n` into higher/current/lower parts and predict the contribution before reveal. A small brute baseline exposes the repeated work; the invariant explains why full cycles contribute `f` ones and the partial cycle contributes `0`, `lower+1`, or `f`. A fresh prediction for `n=101` transfers the rule. The final step maps every symbol to the canonical `Solution.countDigitOne` code.

## Step outline

| Step | Known | One question | Input → output | Action → observation | Conditions |
|---|---|---|---|---|---|
| 0 | Decimal notation and equality | What exactly is counted? | `0..13` → 6 ones | Select a number and predict total, then reveal occurrences | Every occurrence counts; `0` is included; upper bound is inclusive |
| 1 | A digit position | Why can one position be counted independently? | `n=13`, `f=1/10` → per-position contributions | Change factor and inspect cycle strip | Fixed-width place cycles; leading zeroes are not counted as digit 1 |
| 2 | Higher/current/lower split | Why are the three current-digit cases different? | `n` and factor → formula contribution | Adjust `n`, reveal rows and cumulative history | Formula applies to non-negative n and each positive factor ≤ n |
| 3 | Positional formula | What baseline does the optimization replace? | small n → brute count | Step brute enumeration and compare totals | Baseline is correct but O(n log n) digit visits / O(n) numbers |
| 4 | Invariant and cases | Can you predict a fresh input? | `n=101` → 23 | Choose answer, reveal, change answer and retry | Same invariant; explanation follows reveal |
| 5 | All prior symbols | How does this become a submission? | official signature → Python class | Inspect mapping, copy/download source | Python3 interface from official GraphQL capture |

## First-definition table

| Term | First use | Plain definition |
|---|---|---|
| occurrence | step 0 | one displayed digit equal to 1; repeated positions count separately |
| place value / factor `f` | step 1 | 1, 10, 100… selecting one decimal position |
| cycle | step 1 | repeating block of `10f` numbers for one position |
| higher/current/lower | step 2 | digits left of, at, and right of factor `f` |
| invariant | step 2 | after processing a factor, the row equals the count of 1s at exactly that position in 0..n |
| full cycle / remainder | step 2 | complete `10f` block, and the unfinished suffix after it |

## Model limits

The visualization is a deterministic simulation of the positional derivation, not execution of the official submission. The hand strip uses `0..13`; the formula table uses the current `n` and factor; the brute step is an independent checker. No claim of LeetCode acceptance is made.

## Review-1 repair contract and author self-check (2026-10-24)

Adopted required finding **233-I1** from [the independent report](../../specs/reviews/233-review-1-27e57371.md). Preserve the existing lesson structure and tokens; the causal repair is a separate Step 4 reveal state so selecting a prediction does not expose its answer or contribution rows. The explicit Reveal answer action evaluates the selected choice and renders the table; changing the choice clears prior feedback. No independent acceptance is claimed.

Author self-check evidence and stable finding mapping: [tests/evidence/SELF-CHECK.md](tests/evidence/SELF-CHECK.md). The finding is **fixed awaiting independent re-review**; the original report and frozen rubric remain unchanged.

## Revision 2026-11-11

Review (range 1, rubric B=1): the three-case rule was asserted; no correctness argument; the baseline came after the formula.
Changed: sections reordered to hand count → baseline → one place → three cases → transfer → Python (ids, nav and kickers renumbered; copy keys follow position). The three-case step now opens with `s3hand1` (tens place for n=13: 10…13 = lower+1; n=23: full run of 10; n=105: only 10…19) and `s3hand2` (n=213: higher=2 complete runs plus 210…213 = 24) before `s3e` states the cases and `s3rule` the formula; `s3proof` adds the grouping-by-higher-part correctness argument. Related link to the fractions page (wrong topic) replaced by math/arithmetic/place-value. Fixed English transfer buttons that rendered the key "choice23" instead of "23".

Changed by Claude Code (claude-opus-5-5), 2026-11-11, working tree only (not committed).

Verified: test_solution.py (n=0..999 oracle), test_parity.py and browser.cjs passed on port 18921 (screenshots to scratch). Also opened zh/en at 1280 and 390: no overflow, console errors, empty copy or dead related links. Solution code unchanged.
