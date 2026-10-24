# Independent review: LeetCode 312 Burst Balloons

- Candidate revision: `a69730b71547dd3237306a9b2a2ee07410160f43`
- Reviewer identity/model: unavailable (independent fresh run)
- Candidate URL: http://127.0.0.1:18770/leetcode/312/
- Rubric: `specs/leetcode-review-gates.md` (weights 15,20,20,20,15,10)

## Cold walkthrough (before source inspection)

I opened the candidate as a fresh reader at 1280x900 before reading any brief, source, tests, author claims, or previous review. The page loaded with five numbered sections.

| Step/question | Action | Observable result | Causal conclusion paraphrase |
|---|---|---|---|
| 01: What is being optimized and how do neighbors affect coins? | Read the statement and hand-worked `[3,1,5]` example. | It states outside values are 1; bursting 1 first gives 15+15+5=35, while bursting 5 first is summarized as 23. | A burst changes future neighbors, so order matters and “largest first” is unsafe. |
| 01: Why not try every order? | Read the baseline pseudocode and cost text. | It says enumerate every bursting order, simulate neighbors, and repeats the same remaining interval; about `O(n·n!)`. | Brute force is a small oracle but repeats interval work and cannot be the submission. |
| 02: How can an interval have fixed boundaries? | Read the sentinel/open-interval definition. | It adds 1 sentinels and defines `dp[left][right]` for the open interval `(left,right)`. | Fixed outside values let an interval be described independently of earlier burst order. |
| 02: Why choose the last burst? | Read the “last” paragraph and invariant. | The final balloon gain is shown as `values[left]×values[last]×values[right]`; left/right contributions are `dp[left][last]` and `dp[last][right]`. | Choosing the final remaining balloon makes its neighbors forced and splits the interval into disjoint shorter intervals. |
| 02: What tempting rule is rejected? | Read the wrong-rule callout. | `[3,1,5]` says bursting 5 first earns only 5 while bursting 1 first earns 15. | A current maximum has no fixed neighbors, so greedy choice is not justified. |
| 03: How are states accumulated? | Clicked `Next interval` twice from the initial preset. | The button is enabled and the page reports completed interval progress/table; the text says shorter intervals precede longer intervals and blue cells persist while orange marks the just-completed cell. | DP values are retained and reused as subproblems; highlighting is presented as emphasis rather than new data. |
| 03: Does rewind preserve/reset state? | Clicked `Reset`. | The progress/table returned to `Completed 0/10 intervals` with zero cells. | Reset clears the trace to its initial state. |
| 03: Can a different preset be selected? | Selected `[3,1,5] · 35`. | The preset label changed and the exercise/table context changed to the 3-element case. | The trace is preset-driven; no free-form input was visible. |
| 04: Can I predict before reveal? | Read the fresh case `nums=[2,1,2]`, selected the first answer mentally, then clicked `Reveal`. | The exercise offers three choices for the product term and a Reveal control; reveal exposes the expected answer. | The transfer prompt tests the three-factor term for a last burst, but it is a code/preset check rather than a custom UI input. |
| 05: How does the code connect to the invariant? | Read code-mapping bullets and cost statement. | It maps sentinels, width 2, last loop, and `dp[0][n-1]`; claims `O(n³)` time and `O(n²)` auxiliary space. | The implementation is intended to mirror the interval recurrence and table. |
| Access/locale check | Clicked `中`, then `EN`; resized to 320px. | Chinese locale rendered and returned to English; the page remained present at narrow width, with the same controls. | A bilingual path and narrow viewport exist, though detailed readability/keyboard checks remained for source audit. |

Cold fresh-case prediction (before source): for `[2,1,2]`, interval `(0,4)` with index 2 last should use boundary values `2` and `1`, so I predicted `2×2×1=4`; the reveal choices included 4, 2, and 4, making the distractors ambiguous by value. Independent arithmetic confirms the predicted product is 4. The page only exposed presets, so this is recorded as a code/preset check rather than a custom-input experiment.

Cold evidence screenshots: `specs/reviews/312-evidence/312-review-1-fcda139d/01-initial.png`, `02-next.png`, `03-next2.png`, `04-reset.png`, `05-preset.png`, `06-reveal.png`, `07-zh.png`, `08-mobile.png`.

## Source, contract, and independent checks

Canonical files inspected after the cold walk: `solution.py`, `python-code.js`, `core.js`, `app.js`, `copy.js`, `index.html`, `lesson-entry.json`, `language-contract.json`, and the three test files. The Python class is the faithful official `Solution.maxCoins(nums: List[int]) -> int`; a fresh direct runtime check returned `[2,1,2] -> 10`, `[] -> 0`, `[0] -> 0`, `[7] -> 7`, and `[3,1,5,8] -> 167`, with input lists unchanged. The recurrence and trace agree on the interval invariant. `python3 leetcode/312/tests/test_core.py`, `node leetcode/312/tests/test_trace.js`, and the provided browser check all passed. The non-mutating metadata preflight command `python3 -B scripts/register_leetcode_lesson.py 312 --validate-only` exited 0 (no output); complexity is the required single string `O(n^3) time; O(n^2) auxiliary space`.

`language-contract.json` identifies Python as preferred and records the official class method and evidence path; supportedLanguages includes Python, TypeScript, JavaScript, C++, Java, C#, Go, and Rust. No alternate source is advertised in the lesson, so Python is the canonical executable checked here. `python-code.js` contains the same source bytes as `solution.py` (checked via textContent after waiting for load); copy payload is the same string. The collapsed code's `innerText` is empty until opened, so parity must be checked from textContent, not visible innerText.

The official URL was requested normally but returned HTTP 403 from this environment; the lesson-local official-contract evidence records the statement, constraints, selector, and callable. This limits independent official-page confirmation.

## Findings

### OPEN-312-FORMULA (required, high)

- Candidate/revision: `a69730b71547dd3237306a9b2a2ee07410160f43`, EN and ZH, all widths.
- Reproduction: load the page and inspect section 02's formula box before/after switching locale.
- Expected: show the recurrence `dp[left][right] = max over last (...)` in both languages.
- Actual: the box visibly contains only `p` in English and `d` in Chinese. `COPY.formula` is a bare string while `LeetCodeLocale` assumes every value is a two-element `[zh,en]` array, so indexing returns the first two characters.
- Violated requirement: causal derivation and equivalent bilingual reasoning; essential explanation is absent/incorrect. Screenshot: `en-390-audit.png` (same visible defect in `zh-390-audit.png`).
- Owner/next action: fix the locale entry to provide both translations, then rerun the affected bilingual derivation and layout checks on a new candidate. Status: open.

### OPEN-312-TRACE-LABEL (required, medium)

- Candidate/revision: same, EN, default preset.
- Reproduction: click `Next interval` five times. At frame 5 the readout says `Current interval (0,3), candidate last 2, value 30`; the candidate comparison lists `k=1: 30 · k=2: 8`.
- Expected: the displayed last/value pair should identify the maximizing candidate, or explicitly label the shown candidate's own value.
- Actual: `last` is coded as `cur.parts.at(-1).k` (the final enumerated k=2) while `value` is `cur.best` (the maximum 30 at k=1). This contradicts the visual-to-code mapping and can teach the wrong transition even though the numeric DP cell is correct.
- Violated requirement: maintained-state correctness and interaction/visual meaning. Status: open.

### OPEN-312-QUIZ-PREDICTION (required, medium)

- Candidate/revision: same, EN/ZH, section 04.
- Reproduction: read the prompt, predict before clicking Reveal, then reveal. For `nums=[2,1,2]`, interval `(0,4)`, index 2 last, the fixed boundaries are sentinel 1s, so the correct product is `1×2×1=2` (option value 1). The page's visible choices include two different choices both numerically equal to 4 (`2×2×1` and `2×1×2`), and the first cold prediction was 4 until the boundary invariant was rechecked.
- Expected: a uniquely identifiable answer and a clear reveal that reinforces the sentinel-boundary calculation.
- Actual: duplicate numeric distractor values make the choice ambiguous; the reveal explanation correctly says 2, but the cold prompt can encourage selecting a 4 without distinguishing why both 4 choices are wrong.
- Violated requirement: prediction/reveal transfer and counterexample clarity. Status: open.

## Dimension scores (0–4)

1. Problem, terms, hand calculation: **3/4** — statement, units, constraints, and `[3,1,5]` arithmetic are reconstructable; formula defect weakens the central notation.
2. Causal derivation and saved work: **2/4** — last-burst and invariant prose is useful, but the displayed recurrence is missing in both locales.
3. Maintained state and correctness: **2/4** — executable Python and trace values are correct, but the frame readout pairs a non-best `last` with the best value.
4. Interaction and visual meaning: **2/4** — next/previous/reset, cumulative cells, locale, and reveal operate; trace labeling and ambiguous quiz choices impair meaning.
5. Python/cost: **4/4** — official Python interface, fresh runtime cases, nonmutation, source parity, and stated O(n³)/O(n²) cost checked.
6. Bilingual/device access: **2/4** — locale toggle, keyboard focus, 320/390/desktop paths and 200% screenshot were exercised; the formula is materially wrong in both languages and 200% at 320px requires horizontal overflow.

Weighted total: **58/100** (15×3/4 + 20×2/4 + 20×2/4 + 20×2/4 + 15×4/4 + 10×2/4).

## Limitations and conclusion

Evidence screenshots are limited to the exclusive directory `specs/reviews/312-evidence/312-review-1-fcda139d/`. I did not claim human comprehension or a successful LeetCode submission. Official-site access was blocked by HTTP 403, so the local official-contract record was used for interface/statement comparison. The candidate is **changes_required**: the three required findings above remain open, and the weighted score is below the 85-point threshold.
