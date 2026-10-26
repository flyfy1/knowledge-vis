# Independent review: LeetCode 964

Candidate: 269e26f169f3e47f69bac80998be16680c49b1d7. URL: http://127.0.0.1:18770/leetcode/964/. Reader: basic Python, lists, loops, functions, elementary recursion. Review identity: this independent review run; model identifier unavailable. Frozen weights: 15/20/20/20/15/10. Scope is review, not publication or a LeetCode submission.

## Cold walkthrough (saved before repository source, tests, author notes, or earlier reviews)

Read only specs/leetcode-review-gates.md first. Opened the candidate with Playwright Chromium in a real browser at desktop size. Read the rendered lesson from top to bottom. The browser-visible baseline disclosure is lesson content, not repository source inspection.

| Teaching step / question | Action | Observable result | My causal paraphrase |
| --- | --- | --- | --- |
| By hand: what is an operator, and how do four 3s make 8? | Read initial 8; choose hand target 7. | 3*3−3/3=8 has 3 operators; 7 changes to 3+3+3/3, 3 operators. | Count the connecting symbols, respect multiplication/division precedence; literals are not the cost. Bounds, rational division, no parentheses and no unary minus are explicit. |
| Two representations: why can adding toward the target lose? | Read 8 comparison and expand exhaustive baseline. | Direct addition costs 5; 9−1 costs 3. Baseline enumerates operator strings in increasing length using exact fractions. | First matching length is optimal but enumerating four choices per slot repeats work. Powers summarize repeated multiplication; charged terms include an artificial join, removed once. |
| How are the ledgers constructed by hand? | Follow the 8=2+2·3 explanation before the formulas. | Low digit has direct charge 4 and missing-one charge 2. High digit yields direct 5 and complement 2; final min(5,2+2)−1=3. | Keeping a complement that is cheap now can pay off after pricing the next power. Neither ledger alone is the final answer. |
| Digit lab: which costs survive each digit? | Predict low costs 4/2 and high costs 5/2 from the preceding arithmetic, then click next twice. | Row 0: k=0,r=2,S=2,p=4,n=2. Row 1 retains row 0 and shows old 4/2, new min(6,5)=5 and min(5,2)=2, S=8; final answer 3. | Both updates use old values. Data are the displayed numbers/identities, not merely a highlight. The complement is next power minus S, not a signed negative cost. |
| What is preserved on rewind/reset? | Undo once, then reset. | Undo restores the single low-digit row; reset removes rows and restores the initial prompt. | Trace position selects accumulated history, and the final result only belongs at the endpoint. |
| Why are two states sufficient? | Read fractional example and normalization argument. | Three 1/3 terms cost 9 charged versus 2 for one 1; same-sign units carry upward, opposite powers cancel. | An integer cannot leave an uncancelled denominator. After carrying, only direct/borrowed low boundaries need survive. Four identities construct these cases; all digits exhausted permits direct versus next-power completion. Dense but reconstructable. |
| Transfer exercise: base 4, target 15? | Before reveal predict 3: 4*4−4/4, versus direct ones. Select 3 and check; change to 5. | Initially check is disabled. Reveal confirms 3 with both ledger updates. Changing choice removes the explanation until checking again. | The complement pattern transfers to a new base; changing the prediction invalidates old feedback. |
| Python/cost: how does the trace become code? | Read visible Python introduction and cost text (did not inspect repository source). | divmod, simultaneous old-state updates, final −1, O(1+log_x target) time / O(1) submission storage versus retained tutorial rows are explained. | Quotient advances to the next digit; two integer costs summarize prior alternatives. Canonical-source execution remains to be audited. |

Fresh independent input prediction, recorded before any execution/reveal: x=3,target=5 should need 3 operators: 3+3−3/3. This is also a counterexample to always choosing direct positive digits / never exceeding target: 3+3/3+3/3 costs 4. No expression with 0, 1 or 2 operators should equal 5. The UI has presets only, so this will be a **code check**, not a custom-input UI experiment. A second independent boundary prediction is x=2,target=1 → 1 operator (2/2), and x=2,target=8 → 2 (2*2*2).

Cold screenshots: `964-evidence/964-review-2-de457eb5/cold-initial.png` and `cold-complete.png`. Captured full-page desktop states; inspected the complete screenshot. No prior findings supplied explanations during this walk. One automation attempted to click the intentionally disabled unselected prediction button and waited; a separate browser confirmed its disabled state and successfully exercised the selected path.

## Post-cold audit

Completed below after saving the cold walkthrough.

### Identity, official contract and source audit

HEAD is exactly the requested candidate. All nine runtime assets checked over HTTP match checkout bytes: index.html, solution.py, python-code.js, core.js, copy.js, app.js, local style.css, shared common.js and shared style.css. Important SHA-256 receipts: solution.py `93ea2b82ff8fb223e9f837d8fb26d24e1c941fd680d1a8d1035f0a46edcd3132`; copy.js `7358eef760b5e0cd0b10fcc50f63edf84884df8c0e3e405269e30d5212dddf47`; index.html `e9897f239ab00014dc13e77cf58262e92cc1c0e2efc3d0f87c30b7b490116f2d`; shared common.js `f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b`; shared style.css `6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27`.

Read the [official statement](https://leetcode.com/problems/least-operators-to-express-number/) normally through the web tool after the cold walk. Its rules, input bounds and outputs 5/8/3 match. The official page extraction exposes the statement rather than a usable live language selector; I do not claim fresh selector interaction. Lesson-local provenance/official.json contains Python3's `class Solution: def leastOpsExpressTarget(self, x: int, target: int) -> int`, matching the canonical source. Python is faithful and preferred; no non-Python fallback or conceptual comparison is present, so the non-Python language-contract/supportedLanguages requirements do not apply. Read LANGUAGE_FILES in scripts/register_leetcode_lesson.py: Python maps to solution.py / python-code.js / PYTHON_SOURCE, exactly the audited pair/export.

After saving the cold walk, read the rendered-state contract, actual Python, baseline, core, app, dictionary, HTML, styles, shared locale helper, metadata, test sources and prior review. No author note supplied a missing cold-walk explanation. The browser explicitly labels its JavaScript simulation separately from Python execution. `lesson-entry.json` complexity is exactly one nonempty string, `O(1 + log_x(target)) time; O(1) auxiliary space`.

**Required safe preflight:** `python3 -B scripts/register_leetcode_lesson.py 964 --validate-only` from repository root: exit 0, no stdout. No registration or repair was performed.

### Independent computations and invariant checks

Executed the actual canonical source via `exec(Path('leetcode/964/solution.py').read_text(), namespace)` and invoked its Solution method. A separate inline evaluator used Fraction and independently accumulated multiplication/division blocks with signed addition; it enumerated every operator tuple at each shorter length before accepting the first match. Results:

| x | target | Canonical result | Independent minimum / witness |
| ---: | ---: | ---: | --- |
| 3 | 5 | 3 | First enumerated match at 3; 3+3−3/3. Cold prediction confirmed. |
| 2 | 1 | 1 | First match at 1; 2/2. |
| 2 | 8 | 2 | First match at 2; 2*2*2. |
| 5 | 24 | 3 | First match at 3; 5*5−5/5. |
| 100 | 1 | 1 | First match at 1; 100/100. |
| 100 | 100 | 0 | Single literal. |
| 2 | 200000000 | 113 | Boundary execution; separate nearest-power recursion in inspected suite agrees. |
| 100 | 200000000 | 7 | Boundary execution; separate recursion agrees. |

These are code checks; the browser only offers presets. The `(3,5)` counterexample excludes all expressions of length <3 and shows why a direct positive-digit construction costing 4 is inferior. It tests the rule rather than merely recalling the lesson's 8.

Concrete visual-to-code mapping for `(3,8)`: `positive=4,negative=2`, then digit=2,k=1 gives `next_positive=min(4+2,2+3)=5` and `next_negative=min(4+1,2+0)=2`; both temporaries are computed before tuple assignment. At exit k=2, `min(5,2+2)-1=3`. This exactly matches the cold rendered rows. For `(5,501)`, independently inspected a zero-digit middle state in **both** locales: k=1,r=0,S=1; old p/n=2/8, new p=min(2,9)=2,n=min(7,12)=7. Complement changes from 4 to 24 despite unchanged S. Locale roundtrip preserved 2/4 progress and revealed prediction. This tests semantic binding rather than dictionary presence alone.

The invariant's processed-power restriction explains why cheap low complements cannot be returned early. Four identities construct both direct and borrowed boundaries; normalization removes opposite equal powers and carries groups upward. At the smallest remaining negative exponent, integer divisibility requires a multiple of x; carrying such groups reduces denominator depth without raising cost. The positive target ensures a positive term can lead, avoiding unary negation. Initial unit cost, zero digits, simultaneous old-state dependencies, and final next-power charge/one removed join are consistent. Quotients decrease to zero; no caller mutation occurs because only immutable local integers are rebound. The canonical loop keeps constant scalar state and runs once per base-x digit. Its stated bounded-integer time/space model is appropriate; retained tutorial rows deliberately use O(D) history. The baseline's exponentially many operator strings, exact precedence and rational-operation/bit-cost distinction are visible and agree with its implementation.

Fractional normalization independently recomputed: each `3/3/3` is 1/3; three sum to 1 and can become `3/3`. Charged old cost is three terms each with two divisions plus an artificial join: 9. New charged cost is one division plus one join: 2. Standalone whole-expression counts are instead 8 and 1. The text consistently uses charged 9→2 and removes the artificial first join once at the full-expression boundary. Both languages explicitly say this example illustrates reduction and retain the general argument.

### Inspected tests, execution and browser observations

Inspected check.py, copy-check.cjs and all of browser.cjs before running. They write through EVIDENCE_DIR; redirected all outputs into this run's exclusive directory. The browser harness hardcodes 18790: executed it via an in-memory Node Module compilation replacing **only** all occurrences of port 18790 with 18770, keeping its original filename/module resolution. No candidate/test file was changed. Exact invocation used `EVIDENCE_DIR=specs/reviews/964-evidence/964-review-2-de457eb5 node` with `m._compile(fs.readFileSync(filename,'utf8').replaceAll('18790','18770'),filename)` where filename resolves to leetcode/964/tests/browser.cjs.

- `EVIDENCE_DIR=specs/reviews/964-evidence/964-review-2-de457eb5 python3 -B leetcode/964/tests/check.py`: exit 0. numerical.json records 12,005 canonical/nearest-power-recursion comparisons, 199 independently enumerated expression optima, 3,636 intermediate signed-coefficient checks, and official outputs 5/8/3. Bases 2..100 test target 1, target x and legal exact powers. These support correctness, not teaching scores by themselves.
- Port-adapted browser.cjs: exit 0; browser.json records 16 width/zoom matrices, 12 locale/preset paths, 10 contrast pairs, and no page errors. Checked presets return 3,5,8,3,1,113 in each locale. Actual observations include forward/back replay equality, reset to zero, full endpoint disabled controls, retained old rows, and independent fixed exercise input. Changing an exercise choice hides feedback; both distractors and the correct choice reveal the same properly bound base-4 arithmetic.
- Duplicate-key AST detection in copy-check.cjs passes before dictionary evaluation; all consumed entries are nonempty two-string zh/en pairs. Visible formulas, state meaning, result and prediction feedback were also checked in both languages. The shared locale helper's lookup contract matches the pairs.

Exact Python mirror string, rendered code `textContent` (without trim), successful Copy and downloaded bytes all equal canonical source including final newline and indentation in both locales. Supplementary independent browser checks used the **real** clipboard API after fresh distinct sentinel resets, not only the harness's mocked success path. Native manual fallback was also exercised in both locales with a fresh verified sentinel for each attempt, forced automatic write rejection, full source selection, actual focus on fallbackSource and Linux Control+C, followed by exact clipboard readback. No newline normalization. This verifies the fallback transfer, not merely textarea visibility.

Keyboard tests activate controls with Enter, check Shift+Tab order and a visible solid 3px outline, and exercise section navigation; forced-colors/reduced-motion and blocked-storage/offline embedded-source checks pass. Widths 320/390/736/1440 at 100% and **CSS body zoom=2** were exercised; this is synthetic 200% layout zoom, not browser-chrome zoom or a physical device. Both localized H1s contain #964 and their metadata title, and localized document titles follow. State, exercise choice and revealed feedback survive locale changes. Closed selected Chinese `官方 501` remains complete at 320/200%; native-select width budgets passed for all options using computed fonts and a 16px arrow reserve in this browser. No resolved installed font is claimed.

Inspected screenshots: cold-complete.png; en-320-z2-trace.png; zh-390-z1-trace.png; zh-320-z2-controls.png; en-390-z2-predict.png; both independent-proof-320-z2.png and both proof-viewport.png. Rows and operands wrap without observed collisions or lost essential values; at 390 normal size all four 501 rows and final result fit legibly. At narrow 200% the proof and rows are tall and navigation scrolls horizontally. Element screenshots of the entire tall proof contain a sticky-navigation band crossing the capture; ordinary settled viewport screenshots confirm this is capture/scroll positioning, not missing proof text. Scrolling makes the content available.

Contrast implementation uses correct sRGB coefficients .2126/.7152/.0722 and tests black/white ratio 21, primary colors, and #747474-on-black ≈4.492948 (below 4.5). Computed foreground/background measurements include disabled controls, active locale and state text; all measured solid-color pairs pass 4.5 (range 7.7443462241265095–16.086987125379448). Readable disabled styling has opacity 1. These checks do not claim exhaustive accessibility or screen-reader testing.

Related-link browser records inspect the actual served #956 and #920 step2 text in both locales. The former groups equal height differences retaining the best shorter height; the latter groups playlist states by prefix length and used-song count. Those destination meanings support the visible labels. This is local-preview availability, not publication evidence or review acceptance of those other lessons.

### Earlier findings and closure against this candidate

Only after the cold walk read 964-review-1-4bf26931.md and the focused normalization request. Original acceptance (b01fe1e86156906cbbbede74941146920dedfcd5, 92.5) is historical and is not rewritten. The actual runtime diff changes only the proof copy pair and HTML copy-cache query; source/core/app/local styles/metadata remain unchanged, with additional lesson-local notes and author evidence. That restricted runtime diff was inspected directly.

- **964-R1-A1**, minor advisory, **closed** against 269e26f169f3e47f69bac80998be16680c49b1d7. Original reproduction: read step3 normalization prose in either locale, any width; it lacked a concrete fractional carry. Expected: reconstruct one legal carry and its accounting. Actual candidate now defines negative exponent, legally writes three thirds, computes charged 9→2, and distinguishes the full-expression removed join. Regression evidence: cold-read reconstruction before prior notes, independent Fraction/value/operator calculations, bilingual rendered proof text and independent-proof/viewport screenshots at 320/200%. The general argument remains present.
- **964-NORMALIZE-R1**, selected prospective improvement request, **closed** on the same candidate and evidence. Its requested concrete definition, carry and consistent cost accounting are satisfied. No required failure is retroactively invented for the original candidate.
- **964-R1-A2**, minor advisory, **open/deferred**: `(5,501)`, en/zh, 320px at CSS 200%, Process all, scroll rows/proof. Expected easier scanning; actual values remain readable but require extensive vertical scrolling and navigation horizontal scrolling. Evidence: en-320-z2-trace.png, zh-320-z2-controls.png and proof-viewport captures. Owner: lesson author if a future layout change is selected; no fix revision or closure claimed. This violates no required readability/accessibility gate in the observed browser.

No new required finding was reproduced. Required open IDs: **none**.

| Dimension | Weight | Score | Observation-based rationale |
| --- | ---: | ---: | --- |
| Problem/terms/hand calculation | 15 | 4 | Inputs, units, rational arithmetic, syntax rules and small counted expressions precede abstraction. |
| Derivation/saved work | 20 | 3 | Baseline, avoided repeated work, overshoot, charges, numeric ledgers and algebra are reconstructable. New carry is concrete; full normalization remains dense prose with minor rereading friction. |
| Maintained state/correctness | 20 | 4 | Restricted-power invariant, old-state dependencies, zero digit, boundaries, termination and final charge agree with independent enumeration/execution. |
| Interaction/visual meaning | 20 | 4 | Predictions confirmed; retained rows show operands and value meanings. Rewind/reset/endpoints and prediction-change semantics work. |
| Python/cost | 15 | 4 | Actual faithful canonical Python executed; fresh input, local rebinding, complexity and exact source-transfer paths verified. |
| Bilingual/device | 10 | 3 | Equivalent reasoning and state preservation, keyboard and measured contrast pass; narrow high-zoom scrolling remains cumbersome. |

Weighted score: **92.5/100**. Every dimension ≥3, no required open finding, executable/browser/source/metadata evidence complete within the stated local review scope. **Accepted** for candidate 269e26f169f3e47f69bac80998be16680c49b1d7, separately from publication.

Limitations: headless Chromium on Linux, emulated viewport widths, synthetic CSS 200% zoom; no physical-device, browser-chrome zoom, screen-reader study, measured human novice comprehension, successful LeetCode submission or deployed-public-delivery claim. Live official language selector was not exposed by the statement extraction; saved official Python interface and actual canonical execution support the contract. Harness outputs still identify themselves as author checks: their independent rerun is supporting evidence, not the basis of teaching judgment. No implementation, prior evidence, services or shared files were changed.
