# Independent review: 479 Largest Palindrome Product

Candidate: `423e8dba47ab18341b4dc5a984e863cd899129bd`. URL: http://127.0.0.1:18770/leetcode/479/. Target: basic Python, lists, loops, functions, elementary recursion. Review run: `479-review-1-0c35ad0a`; no claim of a human novice study or successful submission. Frozen rubric weights: 15/20/20/20/15/10. Python interface interpretation frozen before opening the page.

## Cold walkthrough (saved before source, tests, author notes, or earlier reviews)

Only the frozen rubric was read before launching Chromium through Playwright. Desktop viewport 1280×900. Read all five teaching sections in order and captured/inspected `cold-initial.png`.

|Step/question|Action|Observed result|Causal conclusion in my words|
|---|---|---|---|
|1. What input and output matter?|Read the n=2 hand calculation and baseline.|Factors 10…99; 9801 and 9702 fail reversal, 9009 succeeds; 9009−6×1337=987. Baseline enumerates triangular factor pairs.|Feasibility alone cannot prove maximality. Find the maximum original product before taking its remainder. Pair enumeration wastes palindrome checks on nonpalindromes.|
|2. How are candidates ordered and excluded?|Hand-work mirror 97→9779 and 98→9889; read the division and square calculation.|9889 exceeds 9801; 9779÷99 has remainder77; 98²=9604<9779.|A fixed-length prefix orders mirrored numbers. Search the larger factor only: once its square is too small no untested smaller factor can head a valid pair. Odd-length mirroring omits the center.|
|3. What does one operation mean?|Before clicking predicted remainder77 at99, then cutoff at98. Clicked Next twice.|First frame p9779,x99,x²9801 with division failure and one row; second p9779,x98,x²9604 with square cutoff, two retained rows, ledger Rejected.|Frames are completed operations, not upcoming instructions. A cutoff does not perform a division. Values, text and ledger status distinguish rejection from highlighting.|
|3 continued. Does history explain the maximum?|Predicted final 9009=99×91 and987. Show all, then Undo.|24/24, eight ledger candidates, seven rejected, 9009 Found; Undo restores23/24,p9119,x95 and removes success.|The retained failures justify the first success. Rewind reconstructs the prior completed state.|
|4. Can I transfer the square rule?|Before reveal predicted Stop at36 for1331 since1296<1331. Selected third answer and checked; changed to first answer, checked again.|Correct feedback explains both factors≤36 versus previously tested>36. Changing selection hides old feedback; wrong feedback identifies missed square bound.|Two-digit status is insufficient; the larger-factor invariant decides whether any untested pair remains.|
|3/4 independence|Changed preset to Probe9009, then reset.|Trace restarts0/1 with next9009,99; prediction remains selected/revealed.|Preset changes affect the experiment, not the separate exercise.|
|5. How does the proof become Python and cost?|Read proof, mapping, boundaries and cost before opening source.|Displayed prose connects prefix/tail, x*x≥p, remainder/quotient, n==1, final modulo, and strings versus stored browser history.|Descending exhaustive palindromes plus exhaustive legal larger factors makes first success maximal. Equality must remain inside the factor loop. Claimed integer-operation bound is exponential, with O(n) strings.|

The UI is preset-only. Fresh custom predictions for subsequent **code checks**, recorded before executing source: p=1221 has legal factors37×33, so descending larger-factor testing should first succeed at37; p=121 must test x=11 at equality (a tempting `>` cutoff would miss11×11). For the original callable, independently enumerate n=3 rather than trust the page's906609 claim; predicted remainder123. Counterexample prediction: descending factor rows may first find580085 although906609 is larger, so returning the first row-wise palindrome is invalid. These are not custom UI experiments. Initial/end screenshots are in the exclusive evidence directory.

## Source and verification audit

The audit began only after the preceding cold record had been written. `git rev-parse HEAD` returned the candidate revision, and `git diff --exit-code 423e8dba47ab18341b4dc5a984e863cd899129bd -- leetcode/479 leetcode/common.js leetcode/style.css` passed. Served bytes matched checkout bytes for index.html, app.js, core.js, copy.js, style.css, python-code.js and solution.py. SHA-256 identifiers: solution.py `8d7d39bb45693b43b5efa02506bf5c5b513265ed259df1e3e5a37de5b2bf812c`; app.js `df2c5e10ce3d640f423a730da8ff8075d550701fe867510460b8b26b02cd2597`; copy.js `ec6cc064ffd256b3ff51090e95777d2103e0827f07830f18e4b4f60dac4da482`; core.js `f90fc4e092c01e668256cbab392e5247cd4f259e253f97d07ad6f2c7e9eba334`.

Read the [official statement](https://leetcode.com/problems/largest-palindrome-product/) normally through the web tool: the integer input, maximum product, final modulo, examples and 1≤n≤8 constraint agree. No access bypass was used. The lesson-local provenance includes the Python3 `class Solution` / `largestPalindrome(self, n: int) -> int` template and integer→integer schema. The actual source implements that callable directly. Python is the preferred faithful language; there is no non-Python exception or conceptual submission analogy requiring a language contract. The independent web rendering exposed the statement, not an interactive language selector; no independent live selector claim is made.

Read `LANGUAGE_FILES` in scripts/register_leetcode_lesson.py: the Python tuple is solution.py / python-code.js / PYTHON_SOURCE. Independently decoded the mirror and compared it exactly with canonical text. Browser display, successful clipboard contents, download bytes and denied-clipboard textarea all matched the canonical 753-character source in both locales. Manual fallback focused and selected the complete source. No source-fetch dependency was needed for offline display.

### Executable and invariant checks

Inspected all four lesson tests before running them. Their output directory defaults would overwrite author evidence, so each run used `LESSON_OUTPUT_DIR` pointing into this run's exclusive directory. Python ran with `-B` to avoid bytecode writes. Commands from repository root:

- `LESSON_OUTPUT_DIR="$PWD/specs/reviews/479-evidence/479-review-1-0c35ad0a/test-output" python3 -B leetcode/479/tests/test_solution.py` — exit0.
- Same output override with `node leetcode/479/tests/test_core.cjs` — exit0.
- Same output override with `node leetcode/479/tests/test_browser.cjs` — exit0.
- `LESSON_OUTPUT_DIR="$PWD/specs/reviews/479-evidence/479-review-1-0c35ad0a/reading-output" node leetcode/479/tests/test_reading.cjs` — exit0.
- **Required non-mutating preflight:** `python3 -B scripts/register_leetcode_lesson.py 479 --validate-only` — exit0, no stdout. `lesson-entry.json` complexity is one nonempty time-and-space string, not an object. No registration ran.

Executed the actual solution.py, not just the simulation. The numerical test executes every n=1…8, compares n≤3 against exhaustive factor pairs, and certifies larger palindrome candidates using GNU `factor` divisors rather than the submission's trial loop. Inspected the oracle: repeated prime factors correctly extend the divisor set; each candidate is bounded above by hi²; a certified 2n-digit answer excludes all shorter lengths. Results: `[9, 987, 123, 597, 677, 1218, 877, 475]`. n=8 took about4.0 seconds locally; this is no claim about LeetCode's time limit or acceptance.

Separately ran my own descending triangular pair enumeration for n=3, taking the maximum regardless of traversal order: maximum906609, modulo123. The first row-wise palindrome was indeed995×583=580085, below993×913=906609. These calculations independently check the displayed tempting wrong rule rather than merely repeat the test's expected list.

**Custom-input code checks, not UI experiments:** predicted1221=37×33 was the first legal descending larger-factor success; independently checking all x=99 downward confirmed37. Predicted equality121=11² was found at11; the strict `x*x>p` variant would exclude this valid pair. Independently verified1331 reaches the cutoff at36 with1296, with no earlier legal factorization. The custom probe is an intermediate-state check; the original submission's only input remains n. The n=3 original callable execution matched the independently enumerated answer.

Canonical reasoning: prefixes decrease within each length, lengths decrease globally, and mirrored prefixes enumerate all palindromes of that length. Candidates above hi² cannot be products. For each remaining p, x descends from hi; every larger legal x has already failed. `x*x>=p` ensures any matching quotient≤x≤hi; `p//x>=lo` supplies the remaining bound. Thus exact division is sufficient; failing the square condition exhausts every possible larger factor. The n=1 special case is correct (9×1). Inputs are integers and no input mutation occurs. The finite loops terminate; the verified full domain has a success before the assertion.

Visual mapping: the first division frame p9779,x99,q98,r77 corresponds to the unsuccessful `p % x == 0` test, followed by `x -= 1`. The next displayed cutoff p9779,x98,square9604 corresponds to a failed while condition, not a performed division. The successful p9009,x99,q91 frame corresponds to the return guarded by exact division and lower quotient bound. Each rendered history row was checked by the browser test against core frames; independent arithmetic checked representative division/cutoff/success states.

The cost claim is a valid upper bound in its stated model: summing prefixes over all lengths gives O(10^n) candidates, construction costs O(n) per candidate, and each factor scan costs O(10^n) integer operations. Therefore O(10^(2n)+n·10^n) time, O(n) auxiliary strings; arbitrary-precision arithmetic is explicitly distinguished from this integer-operation count. Browser history is separate extra storage. This bound does not promise polynomial time.

### Interaction, translations, access and images

Both languages exercised all three presets forward and backward through every frame, reset, end, endpoint disabling, range arrows, button Enter activation, all prediction choices, reveal/change clearing, and language switching with frame, selected prediction and feedback preserved. Preset change restarts only the trace. Disabled states are readable and visibly distinct; focus outlines remain visible. A separate browser run checked the intermediate13/24 state: p9339,x97,square9409 and `9339=97×96+27`. English says the nonzero remainder rejects this factor; Chinese says `余数非零，当前因子失败`. Neither says the candidate is already rejected. At2/24 both locales describe exhaustion of larger factors; at24/24 both describe legal99×91 and987. Prediction feedback in both locales explains ≤36 and previously tested>36 cases. Fallback messages in both locales describe copying, not algorithm failure.

Source inspection plus duplicate-key detection found82 unique keys in the one flat copy namespace; all values have the corresponding Chinese/English pair. Read both sets of problem, construction, proof, invariant, boundaries and cost copy: reasoning is equivalent. Formula variables remain shared mathematical notation. The binding defect below is a link target, present in both locales.

Independent layout runs used320,390 and1280 CSS-pixel widths at state13/24 in each locale. State labels and values occupy distinct stacked lines: label-bottom equals value-top; scrollWidth equals clientWidth (256 at320,326 at390,293 per desktop card). Page widths equal viewports. No label/value clipping or intersection was observed in the inspected settled screenshots. History intentionally scrolls locally; focusing it and pressing arrows changed scrollLeft (40/262 at320 and80/192 at390 in the independent run). Reading the right-hand results was also checked through newly generated history-right screenshots. The automated browser suite additionally exercised736 and1440 widths, all section anchors, visible focus, forced colors/reduced motion, and storage denial.

200% was exercised as Chromium CSS layout zoom=2 at desktop widths, with captured and inspected English/Chinese views; state labels and values remain readable. This is layout-zoom evidence, not a physical device test or native browser-menu zoom claim. Screenshots can crop content outside the viewport and the sticky strip can cover the section heading while scrolling; these were not misreported as text collisions.

Inspected images: cold-initial.png, cold-end.png; en-320-intermediate.png, en-390-intermediate.png, zh-320-intermediate.png, zh-390-intermediate.png; en-zoom200.png and zh-zoom200.png; test-output/en-320-history-right.png and test-output/en-fallback.png; en-related-before.png and zh-related-after.png. Essential state text, factor association, ledger status and horizontal history access were readable. Selected palette contrasts measured by the inspected browser test include disabled text and state labels6.45:1, explanatory text12.62:1, active controls13.10:1, focus8.94:1 against panel background. No page errors were observed in the independent browser run.

The author browser suite's successful “related anchors” check requests hard-coded ../440/#step2 and ../60/#step2. It never follows or compares the actual #440-labeled link. Therefore its passing status does not establish the rendered navigation's correctness. Independent operation exposed the following defect.

## Findings and closure

### 479-R1-01 — #440 related idea navigates to this lesson (required, medium, open)

- Candidate:423e8dba47ab18341b4dc5a984e863cd899129bd; section05, Related ideas; English and Chinese; reproduced at1280×900; no preset dependence (full n=2 trace at initial state).
- Reproduction: open /leetcode/479/; scroll to Related ideas; click `#440: skip excluded ranges using an invariant` (Chinese: `#440：用不变式跳过已排除区间`).
- Expected: the advertised #440 lesson's relevant step, `/leetcode/440/#step2`, should open. Actual: URL becomes `/leetcode/479/#step2`, title remains #479 and its experiment appears. The HTML has `href="../479/#step2"` on the anchor bound to `related0`; the copy advertises #440.
- Evidence: independently recorded before/after URLs in both languages and checked title; en-related-before.png / en-related-after.png / zh-related-before.png / zh-related-after.png in this run's directory. The before image shows the #440 text; after image shows #479's experiment. This is a wrong destination rather than a clipping allegation.
- Violated requirement: observable interaction must agree with its visual meaning and bilingual navigation must provide the advertised content. The related-concept transfer route currently promises a different lesson but loops back to this one. It requires a narrow navigation correction even though the central algorithm is correct.
- Owner/next action: lesson maintainer should point the link to the actual #440 step and add a regression that checks the rendered label-to-href binding and follows that link in both locales. No candidate repair was made during review.
- Fix revision: none. Regression evidence for closure: pending a revised candidate. Reviewer recheck: reproduced on this candidate; status **open**.

No earlier report for479 was found under specs/reviews after the cold walkthrough. There are no earlier required findings to close; this run does not rewrite other evidence.

## Scores and conclusion

|Dimension|Weight|Score0…4|Observed rationale|
|---|---:|---:|---|
|Problem, terms, hand calculation|15|4|Defines palindrome, n-digit range, modulo, input/output and hand-computes9009→987 before abstraction.|
|Causal derivation and saved work|20|4|Concrete baseline cost, mirrored-prefix construction, failed division, square cutoff proof, and an independently checked wrong-order counterexample explain saved work.|
|Maintained state and correctness|20|4|Invariant, exhaustive coverage, quotient bounds, equality boundary and termination are reconstructable; actual source and full domain executed.|
|Interaction and visual meaning|20|3|Prediction, history, rewind and completed-operation semantics work; the #440-labeled navigation has the wrong observable destination.|
|Transfer to Python and cost|15|4|Faithful executable callable, concrete frame-to-loop mapping, independent custom probes/pair oracle, exact source parity and qualified time/space reasoning.|
|Bilingual and device access|10|3|Equivalent reasoning and usable keyboard/layout/contrast; the advertised related lesson is unreachable through its link in both locales.|

Weighted score: **92.5/100** (15+20+20+15+15+7.5), all dimensions≥3. Required open IDs: **479-R1-01**. Outcome: **changes_required** because acceptance requires zero required open findings. Numerical correctness and passing tests do not close the misleading navigation. No substantive causal teaching gap was observed in the central lesson; the required correction is bounded to the related-link binding and its regression coverage.

Limitations: independent agent review, not measured novice comprehension; headless Chromium only, no real mobile device/screen reader or native browser-menu zoom claim; no successful LeetCode submission claim; no publication action. All new report/evidence writes were restricted to the requested report and exclusive evidence directory. Candidate source and earlier evidence were preserved.
