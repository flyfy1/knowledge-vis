# Independent review: 224 Basic Calculator

Candidate: `449c5500ac3ebfd5b45b8069cb153c680c5d767d`. URL: http://127.0.0.1:18794/leetcode/224/. Run: 224-review-1-8fb0a08f. Reviewer: independent Codex session; exact model identity unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen rubric read first: specs/leetcode-review-gates.md; weights 15/20/20/20/15/10. Python canonical interpretation applies.

## Cold browser walkthrough (saved before source audit)

Used real Playwright Chromium, desktop 1440×1000, without reading implementation, briefs, tests, previous reviews or author evidence. Screenshots: `224-evidence/224-review-1-8fb0a08f/cold-initial.png`, `cold-completed.png`; initial screenshot inspected visually. Read the rendered lesson in English, then Chinese. The page itself includes an author self-check claim; that supplied no missing reasoning and is not treated as evidence.

| Step/question | Action | Observable result | My causal conclusion |
|---|---|---|---|
| 01: What expression is evaluated? | Read tiny calculation and bounds | 3−1=2, then 8−2=6; deleting parentheses yields 4 | A subtraction applies to the whole group, not merely its first number. The string contains data, not executable Python. |
| 02: What survives entering a group? | Follow the hand-worked `(8,-1)` example | Inner computation starts at `(0,+1)`; saved sign changes 8+2=10 into 8−2=6 | Both subtotal and next-group multiplier must survive. Last saved is restored first because parentheses nest. Baseline scans/slices repeatedly; the one-pass stack avoids those rescans and recursive calls. |
| 03: What changes after each item? | Click Next seven times on 8-(3-1), then Undo and Next | States `(total,sign,depth)`: `(8,1,0)`, `(8,-1,0)`, `(0,1,1)`, `(3,1,1)`, `(3,-1,1)`, `(2,-1,1)`, `(6,-1,0)`; ledger grows one row per operation; saved `(8,-1)` remains through the inner calculation. Undo returns to operation 6. | Minus changes the multiplier without changing total; opening saves/reset; closing computes 8+(-1)×2. The retained sign at the end is unused. Solid/dotted character borders indicate consumed/pending data; they are not additional stack entries. |
| 04: Can signs be transferred to a new nested expression? | Select C, then reveal | Correct explanation: 2−6=−4; middle negation yields 4; outer 5−4=1 | Every enclosing context must apply exactly once. C was selected before revealing; a separately timestamped written prediction for this quiz was not saved, so I do not count this as the independently recorded prediction check. |
| 05: Why does final total equal the answer, and how does this become Python? | Read proof, mapping bullets and cost | Number adds sign×number; open appends pair/reset; close pops and merges; matching groups leave empty stack. O(n) time/O(d) auxiliary space; ledger snapshots separate | Current subtotal accounts for completed current-level terms. Pop makes the whole inner sum one outer term; each input character advances once. The number-loop continue avoids dropping the following symbol. |

Additional prediction recorded in commentary before operating: `1-(-2)` should produce 3, since the saved outer minus negates the inner negative. Selected this preset and advanced to the endpoint: total=3, stack empty, merge `1+(-1)×-2=3`, confirming the prediction. Chinese switch retained operation 6/6 and the same state and ledger; Chinese explanations include the same invariant and merge reasoning.

Fresh independent input prediction saved before checking canonical code: `7-(2-(3+1)) = 9`: inner=4, middle=−2, outer=9. Counterexample to deleting parentheses: `7-2-3+1=3`, differing from 9. UI accepts presets only; these custom-input verifications will be labeled **code checks**, not browser experiments.

The invariant reconstructed cold: total is the sum of completed terms at the current level; stack holds suspended outer subtotal/sign pairs in nesting order; sign is relevant when a new term starts. I could reconstruct all five steps from rendered explanations. Baseline asymptotics are explained in prose rather than demonstrated with concrete slice counts, a minor pedagogical friction to assess later.

## Source audit and final assessment

Outcome: **accepted**, weighted score **95/100**, scores **4,3,4,4,4,4**. Required open finding IDs: **none**. This conclusion applies only to the reviewed revision and local preview; it is separate from publication.

### Candidate identity, official problem, and canonical source

`git rev-parse HEAD` returned the requested revision. After the coldwalk, fetched the served HTML, app.js, copy.js, core.js, python-code.js, solution.py, lesson stylesheet and both shared assets and compared every byte with the checkout: all equal. Served SHA-256 identifiers:

| Asset | SHA-256 |
|---|---|
| index.html | fec079c55b40f9b0595b5e5c432d16f3fc295baf9163882681001ad8d4a05f77 |
| app.js | 511f72f07cd40812c64a9941733d067be6ada32b60dab63b6e34472d8243575f |
| copy.js | 4fcb440966044020f79cbdfa145112904d35d608f5e91cd62517ae95a013a5fe |
| core.js | f6c0e27048c6da01464e0ed7389accb9ad16007b3c25426b9b5cdc35fe255ff6 |
| python-code.js | e3ac9db2c64324f9b3e83a62ce26fdcc34d36ae04ea5f341f8b1200d1047dc03 |
| solution.py | 6247140a2dc7e46758b03350342799d22d54a9360c1a2677100673e122c31100 |
| style.css | e99e908a8389a221e7895f4280fa3b2eb9b8b974a538db29e4360a52cfb8b125 |
| ../common.js | f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b |
| ../style.css | 6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27 |

Read the [official statement](https://leetcode.com/problems/basic-calculator/) normally using the web tool after coldwalk. Its examples, character set, length limit, valid-input guarantee, unary rules and signed-32-bit running-calculation bound agree with the lesson. No access bypass was attempted. The lesson-local saved official evidence contains a Python3 `class Solution: def calculate(self, s: str) -> int` interface; canonical code preserves that callable and returns an integer. Python is faithful here; no non-Python contract or conceptual-analogy exception applies.

Read `LANGUAGE_FILES` in scripts/register_leetcode_lesson.py: Python maps to `solution.py`, `python-code.js`, `PYTHON_SOURCE`. The offline assignment decodes exactly to canonical source; actual browser code text, clipboard write/read, denial fallback textarea and downloaded bytes all equal that source. No trace-only execution was substituted for canonical Python execution. The displayed baseline matches tests/baseline.py and is expressly labeled small-input/non-submission.

### Independent numerical and correctness checks

Executed the actual canonical class using Python `runpy`, not a transcription. **Custom-input code checks** confirmed the prediction `7-(2-(3+1)) → 9` and counterexample `7-2-3+1 → 3`. Additional independently selected cases passed:

| Input | Predicted/observed |
|---|---|
| ` 10 - ( 2 - (3 - 4) ) ` | 7 |
| `-(0-(8-11))` | -3 |
| `(0)`, `0`, `-0` | 0 each |
| `10-2+3` | 11 |
| `1-(2)-3` | -4 |
| `2147483647` | 2147483647 |
| `-2147483648` | -2147483648 |
| `2147483647-(2147483647)` | 0 |

Three independent exact-length-300000 cases passed: 149999 enclosing pairs around 1 plus one space → 1; 149999 repetitions of `0+` followed by `0 ` → 0; 299999 spaces followed by 1 → 1. These probe recursion avoidance, flat chains and skipped spaces. Input strings remained equal after calls; the implementation stores only local stack/state and never mutates input.

Used Python line tracing on the fresh nested example to inspect real intermediate state: after first opening, `(total,sign,stack)=(0,1,[(7,-1)])`; after second opening, `(0,1,[(7,-1),(2,-1)])`; inner sum reaches 4, then closing merges to -2 with only `(7,-1)` saved, then final closing yields 9 with empty stack. This checks both nearest-parent restoration and excluded outer work while an inner group is being accumulated.

One explicit browser-to-code mapping: on `8-(3-1)`, frame 3 changes `(8,-1,[])` to `(0,1,[(8,-1)])`, exactly `stack.append((total, sign)); total, sign = 0, 1` in canonical Python. Closing frame changes `(2,-1,[(8,-1)])` to `(6,-1,[])`, exactly the pop and `outer_total + outer_sign * total` lines. Ledger before/after numbers agree. The sign can remain stale after close because valid syntax requires an intervening operator before any next term. The number loop advances to the following symbol and `continue` ensures it is processed, rather than skipped. Empty initial sum, unary minus, digit aggregation, matching-parenthesis pop safety, empty final stack and termination all follow from the invariant and valid-input contract.

Each character advances once, with constant-size bounded integer arithmetic and at most one push/pop per parenthesis: O(n) time, O(d) auxiliary context space (more precisely O(d+1) including constant state), O(n) worst case. The baseline retains progressively shorter slices and rescans; long chains or nesting give quadratic cumulative scan/copy work and potentially quadratic simultaneously retained slices. The teaching trace additionally copies stacks into snapshots; its O(n·d) statement is an upper-bound explanation for growing nesting, distinct from submission cost.

### Inspected test claims and safely reproduced checks

Read tests/test_solution.py, tests/browser.cjs, tests/baseline.py and tests/README.md **before execution**. Verified output-path behavior and browser executable handling. All generated results/screenshots were redirected to this run's exclusive evidence directory; prior author evidence and tracked candidate assets were not regenerated.

Commands from repository root:

- `OUTPUT_DIR=specs/reviews/224-evidence/224-review-1-8fb0a08f python3 -B leetcode/224/tests/test_solution.py` — exit 0; 3034 small cases, 3 large cases, 103524 intermediate-state assertions. AST arithmetic oracle and separate recursive baseline both agree with canonical source; intermediate checks reconstruct current subtotal and each saved context from consumed prefixes.
- `OUTPUT_DIR=specs/reviews/224-evidence/224-review-1-8fb0a08f node leetcode/224/tests/browser.cjs` — exit 0, “Browser self-check PASS.” This is a reviewer rerun of author tests, supplementary to the cold walkthrough and independent checks.
- **Required metadata preflight:** `python3 -B scripts/register_leetcode_lesson.py 224 --validate-only` — exit 0, no output. `lesson-entry.json` complexity is exactly the nonempty string `O(n) time; O(d) auxiliary space, d is maximum parenthesis depth`; it covers both costs. No registration was run.

Results: [algorithm-results.json](224-evidence/224-review-1-8fb0a08f/algorithm-results.json), [browser-results.json](224-evidence/224-review-1-8fb0a08f/browser-results.json). Counts establish the checked computational coverage, not teaching comprehension.

### Interaction, language and device observations

Both languages: operated all eight presets to their endpoints (results 6,-5,3,23,3,0,3,2), checked disabled start/end buttons, rewind/replay equality, reset clearing ledger, slider Home/End, Next via Enter and Tab focus. Quiz feedback is initially hidden, reveal requires selection, changing any answer hides old feedback, and both correct and incorrect choices show causal explanations. Locale switching preserves selected answer, feedback visibility, preset and operation. Additional independent resize checks preserved operation 7 and state across 320/390/1440 widths and both locales. Preset change deliberately restarts the trace, as its label states.

Inspected screenshots of initial lesson, operation 10 merge, operation 7 two-context stack, 320/390/1440 widths and both languages. No state label/value text intersection or clipping was observed. `total`, `sign`, saved pair values and causal equations wrap legibly. Narrow ledger is deliberately horizontally scrollable; focused it and pressed ArrowRight, confirming scroll movement and access to offscreen columns. At 320, expanded source can be reached by Tab from its summary: focus enters PRE and ArrowRight scrolls it (scrollLeft 0→40). Source cropping in the screenshot is scroll-position clipping, not lost content. The fallback is visible, focused and fully selected after injected clipboard denial. Its exact text remains canonical.

Directly inspected `trace-en-320.png`, `trace-zh-320.png`, `trace-en-390.png`, `trace-zh-390.png`, `trace-en-1440.png`, `trace-zh-1440.png`, `dense-en-320.png`, `dense-zh-320.png`, `source-en-320.png`, `fallback-en-320.png`, both `css-zoom-200-*.png`, and both `zoom-200-*.png`. Screenshots show distinct pending/consumed/current borders; contextual state values are data, and the accent border is a marker. Zoom evidence uses actual CSS 200% zoom plus a 720-CSS-pixel viewport at deviceScaleFactor 2 as the desktop zoom-layout equivalent. Both retain readable totals, equations and saved context. Sticky navigation is horizontally scrollable, and tested deep-link heading remains below it.

Computed foreground/background contrast checks: body 16.09:1, hint 7.08:1, readout 13.40:1, disabled button text 6.45:1, current token 11.97:1, incorrect feedback 6.35:1. Disabled controls remain opaque and readable. Focus outline is 3px, including forced-colors mode; reduced-motion and blocked storage do not prevent control use. No page/console/HTTP errors occurred in the rerun; the lesson made no external requests. Runtime controls and code text remained usable after network access was disabled. Translations preserve the definitions, wrong-rule example, invariant, temporary stale sign caveat, proof, quiz reasons and cost distinction.

### Scores and findings

| Dimension | Weight | Score | Observation/rationale |
|---|---:|---:|---|
| Problem/terms/hand calculation | 15 | 4 | Concrete 8−(3−1) precedes abstraction; input/output, bounds, unary rules and zero-based offsets are explained. |
| Causal derivation/saved work | 20 | 3 | Lost-sign counterexample and nested LIFO reason are clear; baseline repeated scans/slices explain saved work, but lack a tiny counted cost walkthrough. |
| Maintained state/correctness | 20 | 4 | Before/after values, saved pairs, full invariant, stale-sign caveat, merge reasoning and endpoint proof agree with executed source. |
| Interaction/visual meaning | 20 | 4 | Prediction, reversible item states, explicit ledger history, reset and causal border legend behave coherently. |
| Python/cost | 15 | 4 | Faithful executable interface, exact source exports and fresh canonical cases; transition mapping and O(n)/O(d) reasoning hold. |
| Bilingual/device | 10 | 4 | Equivalent causal explanations; narrow and zoomed essential state readable, keyboard scrolling/focus and retained state checked. |

Weighted total: 15+15+20+20+15+10 = **95/100**. Every dimension is at least 3.

**224-O1 — optional teaching enhancement (minor; open, not required).** Revision above; Step 02; EN/ZH; desktop and narrow views; read the baseline-cost paragraph. Expected enhancement: show a tiny chain such as `1+2+3` with successively rescanned/sliced substrings to make quadratic work more concrete. Actual: prose correctly identifies repeated scans/slices and their cost, and executable baseline is expandable, but no counted tiny cost example appears. The required causal bridge is present; this is friction behind the 3/4 derivation score, not a missing essential explanation. Owner/next action: lesson author, optional future revision. Fix revision/regression closure: not applicable.

No required findings were identified. Post-coldwalk search found no earlier review report for ID 224, so no inherited finding was closed or overwritten.

### Limitations and conclusion

This is one independent agent review, not measured comprehension by human novices. No LeetCode submission was made or claimed. Device coverage is desktop Chromium emulation, not physical phones; zoom coverage is CSS zoom and equivalent layout/device scale, not an operating-system zoom shortcut. Clipboard success was observed within Chromium permissions; denial was deterministic injection. Browser accepts presets only, so custom inputs are explicitly canonical-code checks. No non-Python contract was needed. No source, test, shared file, service, Git configuration or previous evidence was changed; final Git status showed only this report and this run's evidence directory as untracked additions.

**Accept this frozen candidate for the independent-review gate.** Publication remains a separate action. Evidence supports reconstructability under the frozen rubric, without claiming universal learner success.

