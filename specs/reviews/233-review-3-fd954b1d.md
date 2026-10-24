# Independent review — LeetCode 233

Revision reviewed: `48279428a3dded28f6b2b40effee46db0342377d`  
Candidate: `http://127.0.0.1:18795/leetcode/233/`  
Target reader: basic Python, lists, loops, functions, elementary recursion.

## Cold walkthrough (performed before source, tests, briefs, or previous reviews)

I read only `specs/leetcode-review-gates.md`, then opened the candidate in Chromium at 1280×900. The page showed the six numbered steps, Python badge, constraint `0 ≤ n ≤ 10⁹`, and the hand example. This record was written before opening any repository source or prior report.

| Step | Question | Action | Observable result | Causal paraphrase |
|---|---|---|---|---|
| 0 Count by hand | How many 1s are inside 13? | Read the grid, predicted 6, and clicked `6`. | The page identifies 1, 10, 11, 12, and 13 and gives `1+1+2+1+1 = 6`; both 1s in 11 are highlighted. | The unit is every displayed digit occurrence, including repeated digits, rather than the number of integers containing a 1. |
| 1 One place | Why can positions be counted independently? | Moved the factor control from 1 to 10. | The cycle changes to 100, the display labels factor 10, and the parts read `higher=0, current=1, lower=3` with contribution 4. | A decimal place repeats every `10f`, so its occurrences can be counted separately and added. |
| 2 Three cases | Where does n cut the cycle? | With n=13 and f=1, clicked `Reveal contribution`. | The readout shows `higher=1, current=3, lower=0 → 2`; history records `f=1: 2`. | Complete cycles contribute f; the unfinished part is determined by current being 0, 1, or at least 2. |
| 3 Baseline | Where does correctness come from before optimization? | Clicked `Next number` twice. | The strip becomes `0:0 1:1 2:0`; the readout says 3 numbers processed and 1 occurrence. | Direct character counting is a clear reference but visits every integer and its digits. |
| 4 Transfer | Does the rule transfer to a new input? | Predicted 23 for n=101, selected `choice23`, then clicked `Reveal answer`. | Feedback appears only after reveal and lists 11, 10, and 2 for factors 1, 10, 100, totaling 23. Changing the choice clears the rows. | Applying the same invariant independently at each decimal place produces the new total. |
| 5 Python submission | Does the implementation preserve the invariant? | Read the mapping and official source block. | The mapping shows modulo/floor-division expressions, the three branches, `factor *= 10`, and `total += contribution`; the block has `Solution.countDigitOne`. | The executable loop is the derived invariant in the official Python interface, rather than a separate analogy. |

### Fresh prediction and counterexample

Before source inspection I predicted that n=11 has 4 occurrences (1, 10, and two in 11). The tempting rule “count numbers containing a 1” predicts 3. The canonical Python execution later returned 4. The visible n input accepts values only through 999, so this is recorded as a code check, not a UI experiment. I also checked the tempting factor choice 2: the control reports cycle length 20 and `current=6` for n=13, which is not a decimal digit position; this became finding 233-III1 below.

Screenshots from the cold and interaction walks are in `specs/reviews/233-evidence/233-review-3-fd954b1d/`.

## Source, contract, and validation audit

The official statement was opened normally. It counts every digit `1` in integers 0 through n, including the examples 13→6 and 0→0, with `0 ≤ n ≤ 10⁹`; the lesson uses the same meaning and Python3 callable. `solution.py` independently returned 0, 1, 2, 4, 6, 20, 23, and 900000001 for n = 0, 1, 10, 11, 13, 99, 101, and 10⁹. Exhaustive string-counting comparison for 0..999 passed. The embedded `python-code.js` decodes byte-for-byte to `solution.py`; the displayed DOM source equals `window.PYTHON_SOURCE`.

`language-contract.json` selects the official Python3 `Solution.countDigitOne(self, n: int) -> int`, gives a rationale and verification evidence, and lists the supported languages. Python is the preferred faithful interface; the exact-six JavaScript exception does not apply. Copy/download controls are present; the browser source parity check passed. The previous transfer-reveal and reset regressions were independently rechecked in English and Chinese at 320, 390, and 1280 px and passed. Reset returns the visible n field and formula to 13.

The required non-mutating preflight was run from the repository root:

`python3 -B scripts/register_leetcode_lesson.py 233 --validate-only` → exit 0 (no output).

`lesson-entry.json` has one nonempty complexity string, `O(log n) time; O(1) auxiliary space`. The loop visits one factor per decimal digit and retains scalar totals, so that claim is accurate for the canonical solution; the direct baseline is correctly described as repeated work.

At 320, 390, and 1280 px, English and Chinese layouts remained horizontally bounded and controls were readable. At 200% browser zoom the page remained bounded (`scrollWidth == clientWidth` in the captured run). Keyboard focus reached language, reset, range/number controls, prediction, reveal, copy, and download buttons. These are browser checks only; no real-device or human-comprehension claim is made.

## Required finding

**233-III1 (open, required; conceptual correctness / interaction).** Step 1 presents `f` as a decimal place value (`1, 10, 100`) and says the blue mark repeats every `10f`, but `<input id="factor" type="range" min="1" max="10" step="1">` permits every integer 2–9. Reproduction: at any locale/width, set the range to 2. The page visibly reports `Place factor f2`, `Cycle length: 20`, and for n=13 shows `higher=0, current=6, lower=1` and a contribution based on `floor(13/2) % 10`; 2 is not a decimal place and 6 is not the digit at a decimal place. Expected: only valid place values (1, 10, 100, …) or an explicit control that maps choices to those values, with the displayed invariant remaining true. Actual: a novice can operate an enabled control and receive an invalid “current digit” and contribution while the prose claims a decimal-position invariant. This violates the maintained-state/correctness and interaction/visual-meaning requirements. Fix the control/value mapping or constrain it to decimal place values, then independently re-review the affected steps and boundaries.

## Scores and conclusion

Scores are 0–4 in rubric order (weights 15, 20, 20, 20, 15, 10):

1. Problem, terms, hand calculation: **4/4** — clear occurrence unit, inclusive range, and complete 13 calculation.
2. Causal derivation and saved work: **3/4** — vivid cycle and three-case derivation, baseline, history, and transfer are present; the invalid factor path weakens the derivation's reliability.
3. Maintained state and correctness: **2/4** — canonical Python and valid decimal factors are correct, but an enabled factor state violates the stated higher/current/lower invariant.
4. Interaction and visual meaning: **2/4** — prediction/reveal and reset now preserve state, yet the primary factor interaction can show a mathematically invalid state.
5. Python and cost: **4/4** — official callable, exact source parity, independent executable cases, and O(log n)/O(1) cost are verified.
6. Bilingual and device access: **3/4** — English/Chinese content is materially equivalent and 320/390/desktop/200% browser checks passed; the factor defect is shared across locales.

Weighted total: **72.5/100**. Outcome: **changes_required**. Acceptance requires closing 233-III1, a fresh review of the affected candidate, at least 85/100, and every dimension at least 3. This report does not claim measured novice comprehension, a real-device result, or a successful LeetCode submission.
