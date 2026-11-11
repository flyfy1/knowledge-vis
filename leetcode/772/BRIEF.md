# #772 · Basic Calculator III — author brief (rebuilt 2026-11-11)

Status: author build and self-check complete; independent review pending. No LeetCode
submission, independent acceptance, registration or deployment is claimed.

## History of this brief

The 2026-10-25 preparation pass stopped at the source gate (subscriber-only; GraphQL `content`
and `codeSnippets` null, page 403; evidence in `tests/evidence/`, probe `tests/check_official_access.py`,
metadata preflight then failed because `lesson-entry.json` did not exist). Re-run into scratch on
2026-11-11: still blocked, exit 2. The owner asked on 2026-11-11 for the remaining problems to be
finished, so the lesson is built on the publicly circulated statement, labelled on the page.
The probe is kept as access evidence, not as a lesson test.

## Contract taught (not verified against the official page)

- `s`: non-empty, digits, `+ - * /`, `(`, `)`, possibly spaces; always a valid expression.
  Public metadata agrees on the name `calculate(s) -> int` and on three raw sample inputs.
- **Division is integer division truncating toward zero** (−7/2 = −3). The page teaches this explicitly
  and shows why Python `//` would be wrong.
- **Parentheses nest arbitrarily.** Assumed |s| ≤ 10^4, so the solution uses an explicit stack, not recursion.
- **No unary minus** is taught (`-3`, `2*(-3)` are rejected by the lesson's input form). The Python
  solution happens to return the natural value for a leading `-` or `(-`, but this is untested contract.
- All intermediate results assumed to fit in 32-bit signed integers; no division by zero.

## Learning path

| Step | Question | Example / action |
|---|---|---|
| 1 Task | What does the calculator compute? | 14−3*(2+8)/4 = 7 by hand; truncation toward zero contrasted with floor |
| 2 Brute force | What breaks if we copy hand calculation? | Executable `flat` + `brute` rewrite text; 3-row walk of the main example; ≈2d² ≈ 1.25·10^7 copied characters at d = 2500; rewritten negatives "−5/2*3" break `flat` |
| 3 Precedence | Having read "14−3", what must be remembered? | Question before reveal; total / term / op; ledger of 14−3*10/4 generated from core.js; sign folded into term and why truncation keeps that safe |
| 4 Parentheses | Where does the outer state wait while "(…)" is computed? | Question before reveal → park (total, term, op) on a stack; reversible trace with presets, custom input with validation, slider, token strip, state, stack and calculation log |
| 5 Proof + predict | Why are three variables and one stack enough? | Invariant tied to the main example; sign commutes with × and truncated ÷; boundaries; fresh prediction 8−(3−9)/4*2 = 10 (distractors 6, 12 floor, 11 real division) |
| 6 Python | Line-to-step mapping and cost | Source first; O(n) time, O(depth) stack |

## Verification (author)

- `tests/test_solution.py`: independent oracle vs `solution.py` — 57,411 exhaustive valid expressions
  (every string over `037+-*/()` of length ≤ 7 that parses without division by zero), 6,000 seeded random
  expressions (multi-digit, nesting, spaces, 32-bit intermediates), named cases including the 32-bit edges,
  depth-2500 nesting at |s| ≈ 10^4 and two long flat inputs (< 1 s), the page's brute force (works on the
  main example, raises on rewritten negatives, copies 12,503,896 characters at d = 2500), mirror and copy keys.
  A floor-division mutant of the solution fails these tests.
- `test_core.cjs` (700 fixtures, 3,644 frames): answers; after every number or ")" the current level's
  total + term equals the oracle value of that level's prefix and each parked level equals the oracle
  value of its prefix; operator frames change nothing; "(" pushes and resets; ")" pops; deep snapshots;
  every validation error; truncDiv signs.
- `tests/browser.cjs`: both locales, every preset end-to-end with rewind/replay, main-example state checks,
  custom valid/invalid input, prediction, locale switch, copy/fallback/download, keyboard,
  1280/390/320 overflow, 48px targets, preset label width, reduced motion, blocked storage, offline.
- `python3 -B scripts/register_leetcode_lesson.py 772 --validate-only` exit 0.

## Cross-review 2026-11-11

Reviewer: Claude Code (claude-opus-5-5), first reader who did not build the lesson. Independent of the
author; no LeetCode submission.

- **Statement.** Checked against the doocs/leetcode README (current: non-negative integers, `+ - * /`,
  parentheses, valid expression, truncate toward zero, intermediates in 32-bit, 1 ≤ |s| ≤ 10⁴, no spaces
  listed) and the openset/leetcode mirror (older wording: same, plus "empty spaces"; examples with spaces).
  Neither says "no unary minus" in words; it follows from "non-negative integers" + "valid". The solution
  skips spaces and gives the right value on all public example inputs, including the spaced ones.
- **Brute force.** My own evaluator (shunting-yard to RPN, truncating division, rejects unary operators,
  division by zero and 32-bit overflow), written before reading `tests/oracle.py`, agreed with
  `solution.py` on 30,635 expressions: every valid string over `037+-*/()` up to length 6 (10,635) and
  20,000 seeded random grammar expressions with multi-digit numbers, nesting and spaces. Depth 4,999 in
  9,999 characters also runs. `2*-3` returns −1, so the no-unary reading matters.
- **Text.** Recomputed every preset, the 14−3*(2+8)/4 hand walk and ledger, (−30)÷4 vs //, the prediction
  8−(3−9)/4*2 = 10 and its distractors 6 / 12 / 11, the two ways the text-rewriting brute force breaks.
- **Errors found and fixed.**
  1. Layout: the step-3 ledger `<table class="ledger">` collided with the shared stylesheet's
     `.ledger{display:flex}`, so at every width the header row sat in a column beside the body rows.
     Renamed to `ledger-table` (index.html, style.css). Added a regression assertion to `tests/browser.cjs`
     (every table computes `display: table` and header cells line up over body cells); it fails on the old
     class. Also corrected the adjacent comment (step 3, 7 symbols, not "step-2, 8 symbols").
  2. `edge3` claimed nesting of "tens of thousands of characters", impossible with |s| ≤ 10⁴. Now: about
     5,000 levels fit in 10⁴ characters, beyond Python's default recursion limit of 1,000 (zh and en).
  3. `premium` presented "no unary minus" as part of the public statement. Now it says which rules come
     from the statement and that no-unary is the page's reading. `contract` now also says older statement
     versions allow spaces and the code skips them.
  4. `applyMinus` rendered "new term = −3 = −3"; now "−(3) = −3", which also reads well for "−(−6) = 6".
- **Browser.** zh/en at 1280/390/320, main and nested presets stepped: no overflow, no console errors,
  targets ≥ 48 px; author `browser.cjs` (with the new assertion) passes.
- **Rubric.** A3 B3 C3 D3 E3 F3; G2 before the fixes above, G3 after.
- **`sep` exemption.** Legitimate (sentence joiner, pinned to `['', ' ']`).
- **Not verified.** The official page and its hidden tests (in particular whether any contain unary minus);
  a learner study. My first test run omitted `OUTPUT_DIR` and regenerated `tests/evidence/numerical.json`
  and `oracle-fixtures.json` in place (same seeds).
