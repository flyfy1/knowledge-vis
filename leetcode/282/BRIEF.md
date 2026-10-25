# BRIEF — #282 Expression Add Operators

- **Category / stage:** algorithms / university. Target reader: a LeetCode learner who knows recursion and arithmetic precedence.
- **Product fit:** reuse the approved dark bilingual LeetCode lesson pattern; the page's job is to make one backtracking invariant visible and implementable.
- **Learning loop:** hand-calculate `123 → 6`, expose the branching tree, watch the `(value, last)` state repair multiplication precedence, predict a fresh `232 → 8` result, then map the canonical Python source and verify it against an independent oracle.
- **Expected output:** all expressions formed by inserting `+`, `-`, `*` between digits, with no leading-zero operands, that equal target.

## Steps

1. **Concrete quantity** — Known: digits stay in order; unknown: which cuts/operators reach target. Input `123`, target 6. Click a candidate expression and compare its evaluated value. Applies to legal digit strings and binary operators.
2. **Baseline tree** — Known: every gap can be cut or joined. Question: how many choices does the recursion explore, and where do leading zeros prune? Advance frames for `105`; observe `1*0+5` and `10-5` branches, while `05` never appears. Applies before optimization to n≤10.
3. **Invariant** — Known: ordinary `+`/`-` can use a running total. Question: what extra state lets `2+3*2` become 8? Change the selected operator in a small reversible experiment; observe `value` and `last`, and why `value-last+last*x` replaces the last term. Applies because multiplication has precedence over addition/subtraction and operands are positive digit substrings.
4. **Predict and reveal** — Known: state transition. Question: which expressions solve `232 → 8`? Choose before reveal, then inspect the exact paths and a wrong approach counterexample (`1+2*3` is 7 if multiplication is applied to the whole total). Applies to the same grammar.
5. **Canonical source and proof** — Known: DFS state and pruning. Question: how does each UI transition map to Python `Solution.addOperators`? Copy/download source, connect the 4^(n−1) join/operator paths to O(n·4^n) path work and the immutable expression prefixes that use O(n²) recursion auxiliary characters, then run verification rows. Applies to n≤10 and 32-bit target; Python integers avoid overflow during checking.

## Concept dependency table

| Term | First used | Local definition |
|---|---:|---|
| operand | 0 | one number made from a contiguous digit slice |
| cut / join | 1 | place an operator / extend the current number |
| backtracking | 1 | choose, recurse, then undo the choice |
| last | 2 | signed value of the most recent additive term |
| leading zero | 1 | a multi-digit operand beginning with `0`, forbidden |
| precedence repair | 2 | remove the previous term, multiply it, add it back |

Simulation is a trace, never execution of the official submission. The independent oracle enumerates operator/cut choices and evaluates with an AST-like stack; it is separate from the canonical solver.

## Updated official access evidence (2026-10-25)

A dispatcher independently opened the official page normally while logged out,
observed the statement, examples and constraints, and selected Python3 in the
visible language menu. See [the structured access record](provenance/official-access-20261025.json)
and [the inspected screenshot](provenance/official-python3-20261025.jpg).
The actual visible return annotation is `list[str]`; the canonical solution's
imported `List[str]` annotation is equivalent for this interface. This capture
supplements the older author notes and does not itself grant review acceptance.
The prior official-access finding requires a new independent reviewer decision.

## Review-4 correction contract (2026-10-25)

Reuse verdict: correct the existing five-step lesson and its existing trace/formula/
source regions. This work implements the independent review's required corrections
(L282-FORMULA-001, L282-STATE-001, L282-COPY-FALLBACK-001); it adds no new page or
layout. That review supplies the defect/design direction. A fresh independent
review of this candidate remains pending; no child-agent review is authorized.

P0 / highest-return scope: show each active recurrence with substituted arithmetic;
work through `105/5` using explicit child arguments, saved parents, returns,
leading-zero rejection and both terminal outcomes; provide exact manual source
copy. The trace counts displayed teaching frames only, labels skipped subtrees,
and highlights the next-slice index, including no highlight at `index=len(num)`.
A fresh `122/-3` multi-select asks about signed last and the completion test.
P1: repair mapping headings, label step 01 as a worked example, correct the
literal expression length to 2n−1, and improve primary-action contrast.
P2 / deferred: extra decoration and custom-input execution have no demonstrated
need for closing this review. Actual novice teach-back and native browser zoom
require a separate validation occasion; neither is claimed here.

Token correction: `--primary: #0b526b`, action foreground `--ink: #eaf5fb` explicitly
applied on `.btn.primary` to override the shared stylesheet's foreground. Existing
typography, spacing, surfaces and static layout remain the approved contract.
Fallback is a read-only, labeled textarea on the existing source surface, with
canonical LF-preserving value and native select/copy. Locale changes preserve
trace index, operator, quiz selections/reveal, verification preset and fallback.
This supersedes the original learning-loop/step-04 `232` exercise: `232` stays the
worked precedence example and verification preset; the retrieval exercise is now
`122/-3`. In Python, immutable child arguments leave parent state intact, so
returning needs no in-place string undo.
