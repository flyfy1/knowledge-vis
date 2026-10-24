# Independent review — LeetCode 233

- Candidate revision: `51186ddf7527e13e133da64139d3992a728cb637`
- Candidate URL: http://127.0.0.1:18795/leetcode/233/
- Reviewer identity/run: independent fresh browser run; exact model identity unavailable.
- Target reader: basic Python, lists, loops, functions, elementary recursion.
- Frozen rubric: `specs/leetcode-review-gates.md`.

## Cold walkthrough (recorded before source/test/brief inspection)

I opened the candidate in Chromium at 1280×900 and read the rendered page in order. The page presents six steps simultaneously with step navigation; the following records each teaching step's question, action, visible result, and my causal paraphrase.

1. **Define the quantity.** Question: “How many 1s are inside 13?” Action: inspect the 0–13 table and predict by clicking answer `6` (fresh hand check: 1, 10, 11, 12, 13 contribute 1+1+2+1+1). Visible result: the table highlights each actual `1`, and the answer area says `Number 1: 1 Occurrences` with choices 5/6/7. Causal conclusion: the unit is each digit occurrence, so 11 counts twice; the worked sum is 6.
2. **Fix one place value.** Question: why can ones and tens be added independently? Action: inspect the factor control (initial `f=1`, n=13) and cycle strip. I attempted to change to 10; no visible state change was produced by that click path, so the cold run only directly observed the initial factor. Visible result: “Cycle length: 10 · Contribution at this place: 2,” with higher=1, current=3, lower=0. Causal conclusion: the position repeats every `10f`, but this run did not independently verify the second factor state.
3. **Derive the three cases.** Question: where does n cut the cycle? Action: independently changed the number input from 13 to 25 and clicked “Reveal contribution.” Before reveal I predicted current=5 (>1), hence the ones-place contribution should be 3 (1, 11, 21). Visible result: higher=2, current=5, lower=0; reveal says `Contribution at this place: 3`, `f=1: 3`. Causal conclusion: splitting higher/current/lower and treating current>1 as a completed extra block matches the hand count.
4. **Keep a correct baseline.** Question: where does correctness come from before optimization? Action: clicked “Next number” once. Visible result changed baseline from `0:0` and “processed 1 numbers; accumulated 0 occurrences” to `0:0 1:1` and “processed 2 numbers; accumulated 1 occurrences.” Causal conclusion: direct enumeration is transparent and preserves a running total, but visits every number.
5. **Transfer the invariant.** Question: for n=101, can you predict 23? Action: selected `choice23` before reveal, then clicked “Reveal answer.” Visible result: “Correct … 23: 11 ones, 10 tens, and 2 hundreds,” with rows (1→11, 10→10, 100→2). Causal conclusion: summing independent place contributions transfers the rule to a new input; the table exposes each place's dependency.
6. **Map to the official interface.** Question: does the implementation preserve the same invariant? Action: inspected the displayed Python3 `Solution.countDigitOne(self, n: int) -> int`, formula mapping, copy/download controls, and stated cost. Visible result: rows map higher/current/lower to Python expressions, cases to `if`, next place to `factor *= 10`, answer to `total += contribution`; source is shown as submittable and boundary n=0 is stated. Causal conclusion: the visual state is intended as a simulation of the official loop, with O(log n) time and O(1) extra space.

Cold screenshots saved in `specs/reviews/233-evidence/233-review-5-fbacaf0c/cold-home.png` and `cold-end.png`.

## Source and evidence audit

The official statement was opened normally at the LeetCode URL. It defines counting every digit `1` in all non-negative integers through `n`, examples 13→6 and 0→0, and `0 ≤ n ≤ 10^9`; the lesson matches this meaning and Python interface.

`solution.py` was executed directly for fresh cases: `0→0`, `1→1`, `10→2`, `11→4`, `13→6`, `20→12`, `99→20`, `101→23`, and `10^9→900000001` (saved in `fresh-cases.txt`). Exhaustive oracle comparison for 0..999 passed (`test_solution.txt`). The decoded `python-code.js` mirror equals `solution.py` (`test_parity.txt`); rendered source, copied clipboard text, and downloaded `solution.py` each equal the same 501-byte source (`download-parity.txt`).

`language-contract.json` selects the official Python3 `Solution.countDigitOne(self, n: int) -> int`, includes rationale and verification evidence, and lists the complete official selector languages. The six-problem JavaScript exception does not apply. The canonical executable, rather than the animation, was used for runtime checks. The metadata complexity is exactly one nonempty string, `O(log n) time; O(1) auxiliary space`, and the required non-mutating preflight was run from the repository root:

`python3 -B scripts/register_leetcode_lesson.py 233 --validate-only` → exit 0 (saved in `preflight.txt`).

Browser regression evidence is in `specs/reviews/233-evidence/233-review-5-fbacaf0c/browser-results.json` and screenshots. At English and Chinese, 320, 390, and 1280 px, selecting factor 10 displays the valid tens state; selecting transfer choice 23 leaves feedback and rows hidden until Reveal, then shows three rows and 23. Entering custom n=11 in the UI and revealing gives ones-place contribution 2; because the control is capped at 999 this is a code/UI check, not a full-domain UI experiment. Reset returns n=13, factor=1, clears reveal rows and case result. Keyboard Tab reaches reset, step links, and controls. Copy and download parity passed. A 200% zoom capture at effective 640px had equal document/client widths and readable controls/diagrams. Chinese strings preserve the same causal sequence and formulas. Disabled-state contrast and ordinary focus were inspected in these captures.

Earlier required IDs were rechecked against this exact candidate and are closed with the evidence above: **233-I1** (transfer must stay hidden before Reveal), **233-II1** (reset must synchronize visible n/state), and **233-III1** (factor control must expose only decimal place values). No required finding remains open. The only scope limitation is the lesson's pedagogical n input max of 999 despite the official 10^9 domain; canonical code and boundary cases cover the larger domain.

## Scores and rationale

Scores are 0–4 in rubric order (weights 15, 20, 20, 20, 15, 10):

1. Problem, terms, and hand calculation: **4/4** — the requested unit, inclusive range, occurrence-vs-number distinction, and complete 13 hand sum are visible.
2. Causal derivation and saved work: **4/4** — the concrete 13 example precedes cycles and higher/current/lower; full-cycle and tail causes, baseline cost, per-factor history, and 101 transfer are explicit.
3. Maintained state and correctness: **4/4** — valid decimal factors, invariant values, branch boundaries, factor termination, reset, and reveal state agree with the executable; fresh and exhaustive checks pass.
4. Interaction and visual meaning: **4/4** — prediction stays unrevealed, Reveal creates the table, changing state clears dependent output, occurrence highlighting is distinct from counts, and baseline/history transitions are observable.
5. Python and cost: **4/4** — official callable, direct execution, fresh cases including n=0 and 10^9, exact display/copy/download parity, and correct O(log n)/O(1) cost.
6. Bilingual and device access: **3/4** — English and Chinese reasoning is materially equivalent; keyboard, 320/390/desktop, and 200% zoom browser checks pass. This remains browser evidence, without a real-device or learner-comprehension claim.

Weighted score: **92.5/100**. Every dimension is at least 3 and all required IDs are closed against the reviewed revision.

## Conclusion

Outcome: **accepted** for revision `51186ddf7527e13e133da64139d3992a728cb637`. This is an independent lesson review only; it does not claim a successful LeetCode submission, measured novice comprehension, or real-device behavior.
