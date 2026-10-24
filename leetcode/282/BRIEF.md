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
5. **Canonical source and proof** — Known: DFS state and pruning. Question: how does each UI transition map to Python `Solution.addOperators`? Copy/download source, connect the 4^(n−1) join/operator paths to O(n·4^n) path work and O(n) recursion depth, then run verification rows. Applies to n≤10 and 32-bit target; Python integers avoid overflow during checking.

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
