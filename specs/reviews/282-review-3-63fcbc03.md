# Independent review: #282 Expression Add Operators

- Candidate revision: `d1cbf3912a67824dc15efc3b388443a828ed9af3`
- Candidate URL: `http://127.0.0.1:18770/leetcode/282/`
- Target reader: basic Python, lists, loops, functions, elementary recursion
- Rubric: `specs/leetcode-review-gates.md` (15, 20, 20, 20, 15, 10)
- Reviewer identity/model: unavailable; independent fresh run

## Cold walkthrough (recorded before source, tests, or prior reports)

I opened a fresh English browser context at 390×844. Screenshots are in `specs/reviews/282-evidence/282-review-3-63fcbc03/`.

1. **Question:** What is an operand and how is a result formed? **Action:** Read step 01, predicted that `1+2+3` and `1*2*3` hit 6 while `12-3` misses, then clicked each card. **Observable result:** The readout showed 6, 6, and 9 against target 6, with digit order unchanged. **Causal conclusion:** Each gap joins digits or receives an operator; operands are contiguous slices and normal expression evaluation determines the result.
2. **Question:** What does the search enumerate and reject? **Action:** Read the `105` explanation and advanced Next through all seven frames, then used Reset. **Observable result:** The ledger retained `Start: choose 1`, `1+0`, `1+0+5 = 6`, `1+0-5 = −4`, `1+0*5 = 1`, the leading-zero prune, and `10-5 = 5`; the counter reached 7/7 and Reset returned 1/7. **Causal conclusion:** Backtracking explores each cut/operator choice and immediately excludes operands such as `05` because leading zeros are illegal.
3. **Question:** Why is a running total insufficient for multiplication? **Action:** Switched the operator control through `+`, `−`, and `×`. **Observable result:** With value 5, last 3, and x 2, next values were 7, 3, and 8; multiplication displayed `value − last + last × x` and new last 6. **Causal conclusion:** Retaining the signed most-recent additive term permits replacing that term with its product and preserves precedence.
4. **Question:** Which expressions for `232 → 8` are hits? **Action:** Before reveal predicted `2*3+2` and `2+3*2`, rejected `2+3+2`, selected the first two, and clicked Reveal. **Observable result:** The page reported 8, 8, and 7 and warned that multiplying the whole running total would incorrectly produce 10. **Causal conclusion:** The invariant transfers to a new input and distinguishes operator precedence from a tempting wrong rule.
5. **Question:** How does the visual state map to executable Python? **Action:** Read the mapping table, opened the source disclosure, and inspected the selector checks. **Observable result:** `index`, `expression`, `value`, and `last` map to `Solution.addOperators(num, target)` parameters; the page labels the trace as a teaching trace and shows canonical/oracle checks. **Causal conclusion:** The displayed state has a direct correspondence to the official Python DFS interface.

The UI has preset examples only. Independent code checks (therefore explicitly not UI experiments) were predicted before execution: `34`, target 12 should return only `3*4`; `105`, target 5 should exclude leading-zero forms; and `2+3*2` must be 8 rather than 10. The canonical executable returned `['3*4']`, `['1*0+5', '10-5']`, and the expected 8-valued expressions.

## Source, contract, and evidence audit

- `leetcode/282/solution.py` is a faithful Python `Solution.addOperators(self, num: str, target: int) -> List[str]`. It was executed directly on `34/12`, `105/5`, `232/8`, `00/0`, `1/0`, and the official no-solution case `3456237490/9191`.
- `python-code.js`, displayed `#code`, copied clipboard text, downloaded `solution.py`, and the canonical file were all 1036-byte exact matches. Copy succeeded (`Full source copied.`); an injected clipboard failure produced the visible manual-copy fallback.
- `python3 leetcode/282/tests/test_solution.py` passed 8 fixed plus seeded random oracle cases. `python3 leetcode/282/tests/test_parity.py` passed embedded/download parity.
- Required preflight: `python3 -B scripts/register_leetcode_lesson.py 282 --validate-only` → exit 0. `lesson-entry.json` uses one nonempty complexity string: `O(n·4ⁿ) time; O(n²) recursion auxiliary space for immutable expression prefixes, plus output space`.
- Keyboard Enter advanced the frame, reset it, and activated the `+` control. Previous/Next endpoints, Reset, operator changes, quiz prediction/reveal, and retained frame history were checked. Language switching to Chinese preserved `2 / 7` state and translated the reasoning; Chinese text contains the same 4²=16 baseline, pruning, saved-state, and O(n²) explanation.
- At 320, 390, and desktop (1280 CSS px), `scrollWidth - clientWidth` was 0. A 200% zoom capture remained scrollable and readable; disabled endpoint styling and focus-visible controls were visible in the inspected captures. No page errors occurred.
- Prior required findings `L282-DERIVATION-001` and `L282-COST-001` are closed for this candidate: the revised derivation visibly counts 16/13 paths and explains avoided reparsing; the revised complexity matches immutable expression-string retention and the executable source.

The supplied official URL was opened normally after the cold walk but returned a Cloudflare “Just a moment” security page in this environment. I did not bypass it. A repository capture records the statement and interface, but it is not a fresh direct official-page read.

## Findings

### L282-OFFICIAL-ACCESS-001 (required, open)

- **Location:** official-statement/interface audit for revision `d1cbf3912a67824dc15efc3b388443a828ed9af3`.
- **Reproduction:** Open `https://leetcode.com/problems/expression-add-operators/` in the review browser. It serves Cloudflare security verification instead of the problem statement/code selector.
- **Expected:** The review gate requires the official statement to be read normally and access evidence to be available.
- **Actual:** Direct access was blocked; only the repository’s prior capture could be inspected.
- **Severity/reason:** Required evidence gap under the review instruction that missing browser/source/access evidence cannot pass.
- **Owner/next action:** Re-run the independent review when the official page is normally accessible, or provide an independently captured official statement/interface in a new candidate review.

## Scores (0–4, rubric order)

1. **Problem, terms, hand calculation: 3/4.** Inputs, target, contiguous slices, legal operators, bounds, and several computed values are clear; arithmetic is concise rather than fully expanded.
2. **Causal derivation and saved work: 4/4.** The 105 hand count, excluded leading-zero paths, repeated-prefix explanation, maintained fields, and O(n·4ⁿ)/O(n²) bridge are explicit in both locales.
3. **Maintained state and correctness: 4/4.** The signed-last invariant, multiplication repair, leading-zero boundary, frame endpoints, executable checks, and oracle agree.
4. **Interaction and visual meaning: 4/4.** Prediction/reveal, retained history, reset, endpoints, operator changes, selection versus value, keyboard activation, and copy fallback behaved as labeled.
5. **Transfer to Python and cost: 4/4.** The official callable, actual canonical execution, independent fresh cases, exact source parity, mutation behavior, and corrected immutable-string space claim are supported.
6. **Bilingual and device access: 3/4.** English/Chinese reasoning is equivalent and 320/390/desktop/200% plus keyboard and disabled states were checked; the official-access gap limits the evidence record.

Weighted score: **90/100**. The open required access finding prevents acceptance despite the numerical score.

## Limitations and conclusion

This review does not claim measured novice comprehension, a successful LeetCode submission, or public deployment verification. The local preview and preset-only UI limit arbitrary-input interaction to code checks. Outcome: **changes_required** pending closure of `L282-OFFICIAL-ACCESS-001` with direct official-page evidence in a fresh candidate review.
