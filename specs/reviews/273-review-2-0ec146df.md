# Independent review: LeetCode 273

- Candidate revision: `0255bbf8aa3a7eebb7bf65e6db830607a6b121d9`
- Candidate URL: http://127.0.0.1:18770/leetcode/273/
- Reader: basic Python, lists, loops, functions, elementary recursion
- Reviewer identity/model: unavailable (fresh independent run)
- Frozen rubric: `specs/leetcode-review-gates.md`

## Cold walkthrough (recorded before source/tests/earlier review)

I opened the candidate in Playwright Chromium at 1280x900 before reading source, tests, author notes, or prior findings. I recorded screenshots in `specs/reviews/273-evidence/273-review-2-0ec146df/`.

### Step 0 — one concrete number

- Question: “Why does 12,345 become ‘Twelve Thousand…’?”
- Action: read the hand calculation and selected the `345` option in the chunk selector.
- Observable result: the page showed `012` and `345`, and the selected readout became `Group 1 = 345 → Three Hundred Forty Five; scale: No scale.` The default state labels group 0 (`012`) as Twelve with Thousand.
- Causal paraphrase: each three-digit block owns its local words, while the higher non-empty block receives the Thousand scale and is spoken first; the selector is a left-to-right visual grouping.

### Step 1 — independent groups and retained history

- Question: “Why render inside groups before joining left to right?”
- Prediction: adding groups should append only processed non-empty groups in English order; reversing/backtracking should preserve the earlier prefix and remove only the latest group.
- Action: clicked **Add next group** three times, observing each intermediate state, then used **Back one group** in a separate run.
- Observable result: progression was `0/3` → `1/3` (`Five Hundred Sixty Seven`) → `2/3` (`Two Hundred Thirty Four Million Five Hundred Sixty Seven`) → `3/3` (`One Billion Two Hundred Thirty Four Million Five Hundred Sixty Seven`). The labels showed `234` with `Million` and `1` with `Billion`. The text immediately above says the input is `1,234,567`.
- Causal paraphrase: the interaction intends to render low-to-high groups and reverse them for English order, but this visible state assigns the wrong scales: for `1,234,567`, `234` must be Thousand and `1` must be Million. The visual transition and joined result are mathematically false even though the later scan step is correct.

### Step 2 — prediction/reveal

- Question: “Where should zero appear?”
- Prediction before operating: for the hidden 1,005 example, `One Thousand Five`; an empty inner group should emit no words, while top-level zero should emit `Zero`.
- Action: clicked **Reveal**. The page contains no editable guess field despite saying “Write your guess before revealing.”
- Observable result: it revealed `Correct: One Thousand Five; the 005 group contributes Five and never says “Zero Hundred”, followed by boundary rows `0 → Zero`, `5 → Five`, `105 → One Hundred Five`, `1,000,000 → One Million`.
- Causal paraphrase: the sentinel rule is understandable and the reveal is correct, but the supposed write/predict interaction is only an unrecorded mental prediction; the UI cannot capture or compare a reader’s guess.

### Step 3 — invariant and scan

- Question: “What is guaranteed after each loop?”
- Prediction: each round should take the current last three digits, reduce the remaining number by integer division, retain a low-to-high group, and terminate after the final zero remainder.
- Action: clicked **Reset**, then **Run next round** four times.
- Observable result: rounds displayed 567, 234, 1, and an empty 0 chunk; completion showed `One Million Two Hundred Thirty Four Thousand Five Hundred Sixty Seven`, with `chunk = num % 1000`, `num //= 1000`, and reverse-join pseudocode. The page also explains a digit-by-digit baseline with repeated rebuilding and one remainder/division/local render per base-1000 round.
- Causal paraphrase: remainder extracts the low group, floor division peels it, empty groups are skipped, and reversing low-to-high stored groups gives the correct final order. This step contradicts the incorrect Step 1 scale labels rather than repairing that earlier visual.

### Step 4 — canonical Python and fresh check

- Question: “How do observations map to `Solution.numberToWords`?”
- Action: read the displayed submission, entered fresh input `1001`, and clicked **Check this number**.
- Observable result: both displayed paths returned `One Thousand One` and said `match`; the source displayed the official `Solution.numberToWords(self, num: int) -> str` interface. Downloaded `solution.py` matched the repository canonical file byte-for-byte in an independent check.
- Causal paraphrase: the canonical Python implementation uses `under_1000`, explicit top-level zero, base-1000 remainder/floor division, non-empty groups, and reverse joining; this runtime check transfers the algorithm for the fresh case, though it does not validate the erroneous Step 1 animation.

### Locale and device observations

I toggled Chinese after the cold walkthrough. Titles, explanations, controls, state labels, and the reveal were translated, and the same incorrect Step 1 `Million`/`Billion` scale mapping was present because the shared state is wrong. At widths 320, 390, and 1280 the settled page had no horizontal overflow (`scrollWidth == clientWidth`) and step cards fit. At 200% zoom the step cards remained within the tested viewport width, although the document required horizontal scrolling for the enlarged page. Disabled states were visibly distinct in the settled controls. Keyboard Enter advanced the group control, and Reset/Back returned state to the expected counters. Screenshots include desktop, each cold step, Chinese, and device widths.

## Source, metadata, and test audit (after cold walkthrough)

The official statement says to convert a non-negative integer to English words, with examples 123, 12345, and 1234567 and constraint `0 <= num <= 2^31 - 1`. The lesson metadata has the required single complexity string `O(log₁₀ num) time; O(log₁₀ num) space`, Python as the canonical language, and the official callable signature.

`leetcode/273/solution.py` is faithful Python and direct execution independently returned:

- `0` → `Zero`
- `105` → `One Hundred Five`
- `1001` → `One Thousand One`
- `1000000` → `One Million`
- `1000000100` → `One Billion One Hundred`
- `2147483647` → `Two Billion One Hundred Forty Seven Million Four Hundred Eighty Three Thousand Six Hundred Forty Seven`

The core test was inspected before execution and then passed: `500 seeded/random + boundaries + source parity: PASS`. The supplied browser check was inspected before execution and passed with `{"status":"3/3 groups joined: One Billion Two Hundred Thirty Four Million Five Hundred Sixty Seven","errors":[],"ok":true}`. It checks progression, reveal, scan completion, locale, keyboard, zoom layout, download parity, and 320/390/1280 overflow. These tests do not catch the Step 1 hard-coded scale error because the browser assertion only checks that the final string contains `One Billion`.

The required non-mutating preflight was run from the repository root:

```text
python3 -B scripts/register_leetcode_lesson.py 273 --validate-only
```

It exited with code 0 and no output. The displayed/copied/downloaded Python source was checked against `solution.py`; the repository source-parity test and downloaded file comparison passed. No non-Python language contract is required because faithful Python is supported and is the official interface.

## Required findings

### 273-R2-001 — Step 1 assigns incorrect scales and teaches a false result (open, critical)

- Problem/section: 273, Step 1 group ledger; candidate revision above; EN and ZH; any viewport; default `1,234,567` preset; click **Add next group** twice or three times.
- Expected: groups low-to-high are 567 (no scale), 234 (Thousand), and 1 (Million), joining to `One Million Two Hundred Thirty Four Thousand Five Hundred Sixty Seven`.
- Actual: the visible ledger labels 234 as `Million` and 1 as `Billion`, and at 3/3 displays `One Billion Two Hundred Thirty Four Million Five Hundred Sixty Seven`. Step 3 later displays the correct mapping, so the lesson contains contradictory algorithm states.
- Evidence: `cold-step1-2.png` and `cold-step1-3.png` in the exclusive evidence directory; source `leetcode/273/app.js` hard-codes `groupData=[{v:567,s:''},{v:234,s:'Million'},{v:1,s:'Billion'}]`.
- Violated requirement: frozen rubric correctness, maintained state, and visual-to-code mapping; a mathematical error and contradictory visual are required fixes regardless of tests.
- Owner/next action: correct the Step 1 scale data and bilingual rendered result, add a regression assertion for the exact expected phrase, then submit a new candidate for fresh review. Status: open.

### 273-R2-002 — “Write your guess” has no prediction input or recorded comparison (open, medium)

- Problem/section: 273, Step 2; candidate revision above; EN/ZH; any viewport; click **Reveal**.
- Expected: the stated prediction exercise should provide a field or another visible operation that records the reader’s guess before reveal and makes the comparison observable, or the copy should accurately describe a mental prediction.
- Actual: the page says “Write your guess before revealing” but contains only the Reveal button; DOM inspection found no textarea or prediction input. Reveal always emits the fixed answer `One Thousand Five`, so the reader’s prediction is neither captured nor compared.
- Evidence: `cold-step2.png`; cold DOM had only the separate Step 4 number input and no input/textarea in Step 2.
- Violated requirement: frozen rubric prediction/reveal/change interaction and depth-of-teaching requirement; the claimed write action cannot be performed.
- Owner/next action: add a Step 2 prediction control and visible comparison, or revise the instruction to a truthful mental prediction and provide a meaningful observable change. Status: open.

## Scores (0–4 observations)

1. Problem, terms, and hand calculation: **3/4** — the task, input/output, chunks, scales, and 12,345 hand calculation are clear, with only later contradictory scale labels causing friction.
2. Causal derivation and saved work: **3/4** — the revised baseline paragraph gives a concrete 12,345 repeated-work walk and accounts for one base-1000 operation per round; the false Step 1 scale narrative still undermines the saved derivation.
3. Maintained state and correctness: **1/4** — canonical Python and Step 3 are correct, but a central interactive state assigns wrong scales and shows a wrong result for the lesson’s main 1,234,567 example.
4. Interaction and visual meaning: **2/4** — progression, reversal, reset, endpoints, and keyboard work, but the core Step 1 visual is wrong and Step 2’s promised prediction operation is absent.
5. Transfer to Python and cost: **3/4** — official Python source, direct fresh cases, parity, and plausible bounded base-1000 cost pass; the in-page visual does not faithfully represent the same canonical state.
6. Bilingual and device access: **2/4** — EN/ZH controls and layouts are readable at 320/390/desktop and keyboard works, but both locales reproduce the material incorrect scale mapping; 200% zoom still creates page overflow requiring scrolling.

Weighted score: **57.5/100** (`15*3/4 + 20*3/4 + 20*1/4 + 20*2/4 + 15*3/4 + 10*2/4`).

## Limitations

This is an independent browser/source review, not a measured novice comprehension study and not a successful LeetCode submission. The candidate was served locally at the requested URL and the requested revision was confirmed with `git rev-parse HEAD`. Screenshots and checks are limited to the exclusive evidence directory. Clipboard permission was environment-dependent; download parity was independently confirmed. No claim is made about human comprehension or public deployment.

## Conclusion

**Changes required.** Required finding `273-R2-001` is a central mathematical contradiction and `273-R2-002` is an unfulfilled prediction interaction. The candidate does not meet the frozen acceptance threshold and requires a new corrected revision and fresh independent review.
