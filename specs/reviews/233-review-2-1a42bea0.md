# Independent review — LeetCode 233

Revision: `9da20d77de868810a9e86e8b4f672238a880c10e`

## Cold walkthrough (before source/tests)

I read only `specs/leetcode-review-gates.md`, then opened the candidate at `http://127.0.0.1:18795/leetcode/233/` in Chromium at 1280×900. The following record was made before opening lesson source, tests, briefs, or the earlier report.

| Step | Question | Action | Observable result | Causal paraphrase |
|---|---|---|---|---|
| 0 Count by hand | How many 1s are inside 13? | Inspected the number cells, predicted 6, and clicked `6`. | The page marks 1, 10, 11, 12, 13 and reports contributions 1+1+2+1+1 = 6. | The requested unit is every displayed digit occurrence, including both digits of 11, rather than the count of numbers containing a 1. |
| 1 One place | Why can positions be added independently? | Moved the factor slider from 1 to 10. | The cycle length changes to 100 and the place display updates to the tens position with higher/current/lower values. | A fixed decimal place repeats every 10f, so its occurrences can be counted separately and summed. |
| 2 Three cases | Where does n cut the cycle? | Kept n=13 and f=1, then clicked `Reveal contribution`. | The display shows higher=1, current=3, lower=0, contribution 2, and history `f=1: 2`. | Full cycles contribute f; the unfinished tail contributes according to current being 0, 1, or at least 2. |
| 3 Baseline | Where does correctness come from before optimization? | Clicked `Next number` twice. | The baseline reads `0:0 1:1 2:0`, processed 3 numbers, accumulated 1. | Directly counting characters gives a simple correctness reference but visits every integer through n. |
| 4 Transfer | Does the three-case rule work on a new input? | Predicted 23 for n=101, selected `choice23`, then clicked `Reveal answer`. | Before reveal, feedback and rows were hidden; after reveal, the page reports 23 and lists 11, 10, and 2 for factors 1, 10, and 100. | Applying the same higher/current/lower invariant at each place transfers the method to a new input. |
| 5 Python submission | Does the implementation preserve the invariant? | Read the visible mapping and Python block. | The mapping connects modulo/floor-division expressions to higher/current/lower, three branches, factor multiplication, and total accumulation; the block has the official `Solution.countDigitOne` shape. | The displayed loop is an executable version of the derived invariant, rather than a separate analogy. |

Independent fresh check and counterexample: I predicted that n=11 has 4 occurrences (1, 10, and two in 11), while the tempting “numbers containing a 1” rule gives 3. The canonical Python execution returned 4. The UI's n control accepts custom values only up to 999, so this is recorded as a code check, not a UI experiment.

## Source, contract, and browser audit

The official statement was opened normally. It defines counting every digit `1` in all non-negative integers ≤ n, gives 13→6 and 0→0, and constrains n to 10⁹; the lesson states the same semantics and interface. `solution.py` returned 0, 1, 2, 4, 6, 20, 23, and 900000001 for n = 0, 1, 10, 11, 13, 99, 101, and 10⁹. Exhaustive comparison with string-counting for 0..999 passed. `python-code.js` decodes byte-for-byte to `solution.py`; the DOM source text also equals `window.PYTHON_SOURCE`.

`language-contract.json` identifies the official Python3 callable `Solution.countDigitOne(self, n: int) -> int`, gives a rationale and verification evidence, and lists the supported languages. Python is the preferred faithful interface; the six-problem JavaScript exception does not apply.

The required metadata preflight was run from the repository root:

`python3 -B scripts/register_leetcode_lesson.py 233 --validate-only` → exit 0.

The complexity metadata is one nonempty string, `O(log n) time; O(1) auxiliary space`, matching the loop over decimal factors and scalar state.

At 320, 390, and 1280 px in both English and Chinese, `scrollWidth == clientWidth` and screenshots show readable controls and diagrams. At 200% browser zoom, the page remained horizontally bounded; tab navigation reached the language buttons, reset, and step links. Reset clears the transfer rows, but a state-preservation defect remains (below). Source display parity was checked; copy/download controls are present. Chinese and English retain the same formulas, cases, and transfer explanation.

The earlier required transfer finding 233-I1 is closed against this revision: selecting `choice23` leaves feedback/table hidden, and only `Reveal answer` exposes the result, verified at desktop and in the saved screenshots.

## Required finding

**233-II1 (open, required; reset/state consistency).** After entering a custom n, Reset experiments resets the internal algorithm state but does not reset the visible number input. Reproduction at 1280×900: enter `11` in Step 2, then click `Reset experiments`. The input still displays `11`, while the formula readout is for internal n=13 (`higher=1, current=3, lower=0`) and the baseline has restarted at n=13. Expected: the visible control and all derived state return to the documented preset n=13. Actual: the control advertises 11 while the animation and baseline use 13, so subsequent edits/predictions can be interpreted against the wrong input. This violates the maintained-state and interaction requirements. Fix the reset handler/UI synchronization and re-review reset at both locales and supported widths.

## Scores and conclusion

1. Problem, terms, and hand calculation: **4/4** — explicit input/output meaning, occurrence units, and a complete 13 hand calculation.
2. Causal derivation and saved work: **4/4** — vivid cycle example precedes abstraction; baseline cost, three tail cases, history, and transfer explanation are visible.
3. Maintained state and correctness: **3/4** — invariant, boundaries, termination, and executable results are correct, but reset leaves a visible/internal state mismatch.
4. Interaction and visual meaning: **2/4** — prediction/reveal now behaves correctly, but the reset defect breaks reliable state interpretation.
5. Transfer to Python and cost: **4/4** — official callable, exact source parity, fresh executable check, and correct O(log n)/O(1) cost.
6. Bilingual and device access: **3/4** — equivalent English/Chinese reasoning, keyboard reachability, and 320/390/desktop/200% checks; reset defect is shared across locales.

Weighted total: **82.5/100**. Outcome: **changes_required**. Acceptance is blocked by open required finding 233-II1 and the score/interaction thresholds. This review makes no claim about measured novice comprehension or a successful LeetCode submission.

Screenshot evidence: `specs/reviews/233-evidence/233-review-2-1a42bea0/`.
