# Independent review: 850 — Rectangle Area II

Candidate: c3a389dcbaad4d2a2a5eb330772b9366dd3c426e. URL: http://127.0.0.1:18770/leetcode/850/. Review run: 850-review-1-ba13eaa4. Reviewer: independent Codex session; exact model identifier unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen rubric read first; weights 15/20/20/20/15/10. Canonical-language interpretation frozen as faithful official Python preferred.

## Cold browser walkthrough (saved before source audit)

Used real headless Chromium through Playwright at 1440×1000. No brief, implementation, test output, author evidence, or prior review was read before this record. Read the rendered lesson from top to bottom; screenshots cold-desktop.png, cold-end.png, cold-gap.png are in this run's exclusive evidence directory.

| Teaching step / question | Action | Observable result | My causal conclusion |
| --- | --- | --- | --- |
| 1. What is counted? | Read input/output and tiny A/B example; toggle B off, then on. | Coordinates define lower-left/upper-right corners; nonzero rectangles, n≤200, coordinates≤10^9; union modulo 1,000,000,007. A alone shows four unit cells and area 4; B present shows five covered cells and area 5. | Adding B contributes only its one previously uncovered square. Summing rectangle areas would give 6 and double-count overlap. |
| 1. Why improve the baseline? | Read displayed compressed-cell baseline and its explanation. | Unique x/y edges create O(n²) cells; scanning n rectangles per cell is O(n³); actual edge distances remain in products. Set, sort, zip and break are explained. | Coordinate compression avoids enormous raw grids but still repeats rectangle scans for every y cell. |
| 2. Why strips and merged intervals? | Hand-follow [0,1), [1,2), [2,3) and the sorted-interval explanation. | Strip contributions 2,2,1; half-open notation and zero-area boundaries explained. height/end example advances 0→1→2 and −1→1→2. | No x boundary lies inside a strip, so active membership stays fixed. Sorted starts make only a new suffix beyond end count; nested intervals add zero and gaps are excluded. |
| 2. What tempting wrong rules fail? | Independently predict y intervals [0,1),[3,4) have length 2, not span 4; then inspect Gaps in y preset. | Width 2, two separate merged ranges, height 2, area 4. | Taking max end minus min start incorrectly includes the uncovered middle. Adding active lengths instead also fails on overlap. |
| 3. What changes and what stays? | On A+B click next three times; undo once. | Completed strips 1/3,2/3,3/3; before→after prefixes 0→2,2→4,4→5. Sorted active intervals and merged ranges shown; ledger grows each time. Undo restores two completed strips. | Each strip adds width×union-height to the previous prefix. Filled cells are coverage data, orange outline is current-strip emphasis, and ledger retains history. |
| 3. How are empty strips treated? | Select Gaps in x and advance to end. | Ledger [0,1):1; [1,3):0; [3,4):1; final 2. | A strip with no active rectangles contributes zero without bridging the gap. Preset change restarts the experiment. |
| 4. Can I transfer the merge rule? | Before reveal predict 8 for width 2 with [0,2),[1,3),[5,6): union [0,3) plus [5,6) has height 4. Select 8 and reveal; change to 12, then reveal. | Correct feedback explains additions 2,1,1 and area 8. Changing selection clears prior feedback. Wrong feedback explains why 12 includes a gap and 10 counts overlap twice. | New contribution depends on uncovered suffix or separate interval; neither total span nor raw sum is reliable. |
| 5. Why does Python return the total? | Read correctness, code mapping, actual cost and boundaries. | Active selection x1≤left and right≤x2, sorted y intervals, height/end and area accumulation mapped explicitly. Cost O(n² log n), O(n); large example remainder 49; input unmodified. | The merge invariant establishes each height; disjoint strips partition the union. Accumulation becomes the total only at the final strip. |

Fresh independently selected input prediction, recorded before code/reveal: `[[0,0,2,1],[1,0,3,2]]` should return **5** (areas 2+4−overlap 1). Fresh counterexample prediction: `[[0,0,2,1],[0,3,2,4]]` has **4**, whereas taking the whole y span gives 8. The latter happens to match a preset when selected; the former is not a preset. The UI is preset-only, so the custom case will be labeled a **code check**, not a UI experiment. No source has yet been opened.

## Audit and final assessment

The following audit was performed only after the cold record above was saved. The rendered-state contract was then read and applied as clarification of the frozen six dimensions.

Supplemental independent counterexample prediction, before execution: `[[1,1,3,2],[1,4,3,6]]` should return **6** (width 2 times lengths 1+2), whereas the tempting span rule gives **10**. This is a post-cold source-audit code check; the earlier cold gap example matched a rendered example/preset.

### Identity, official contract and source

`git rev-parse HEAD` returned the requested candidate exactly. Initial and final `git status --short` showed only this report and this review's evidence directory untracked; implementation and earlier evidence were unchanged. No previous 850 review report was found, so there are no earlier required IDs to close. BRIEF and author self-review were not needed to establish the explanation.

Read the [official statement](https://leetcode.com/problems/rectangle-area-ii/) using normal web access: union, modulo, the two examples (6 and 49), 1≤n≤200, nonnegative coordinates up to 10^9 and nonzero area agree with the lesson. Direct Chromium navigation to the official page showed security verification; no bypass attempted. The normal web reader supplied the statement. The canonical `Solution.rectangleArea(self, rectangles: list[list[int]]) -> int` preserves the original matrix-to-integer callable semantics, rather than a conceptual analogy. No non-Python language contract applies. This review makes no claim of seeing the authenticated editor's Python stub or submitting to LeetCode.

Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python is `solution.py`, `python-code.js`, `PYTHON_SOURCE`. Audited these files, index, app, core, copy, CSS, metadata and the tests. Local files and HTTP-served bytes matched exactly, including shared `common.js` and `style.css`. SHA-256 receipts:

| Asset | SHA-256 |
| --- | --- |
| index.html | 44c0b952ccfcc7d11a677e635086324d572638e9e6f6c2382df53f7af20cc753 |
| solution.py | 2a20b4eb16dc4bffe95affc932c5d8e1937249b720a136ec8e1f5090b295051a |
| python-code.js | 6dc071dc71f3c7157b1299cff4c9a752affc2699466e5b8868164e074801e1fa |
| core.js | 002589f7b412861c3070a3150fb4690ed1e432f6f58571d058a0c94a2effe88a |
| app.js | bb7360395d915644820580f62b0a60c5e3d90038c5e736ba71762baf65683e5b |
| copy.js | b18a62fcb3b4ea6b6fe5910258970bf8c9a043e96cdc831dded02dce8849f271 |
| lesson style.css | c551dab6bb8095ce55a2c1a4855ef63ffe41098fa0dffa095fd6902c4966fa41 |
| shared common.js | f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b |
| shared style.css | 6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27 |

### Correctness, executable transfer and cost

Executed the actual canonical Python through importlib, independently of the JS trace. The fresh overlap prediction returned 5, offset-gap counterexample returned 6, unit rectangle returned 1, nesting `[[0,0,4,4],[1,1,2,2]]` returned 16, corner touching returned 2, maximum-coordinate rectangle returned 49, and 200 disjoint width-one rectangles of height 10^9 returned 999998607. Input equality before/after was checked. The displayed baseline was independently extracted, HTML-decoded and executed: fresh overlap 5, offset gaps 6, maximum-coordinate rectangle 49.

Concrete visual-to-code mapping: official preset strip [1,2) displays sorted [0,1),[0,2),[0,3), merged [0,3), width 1, height 3, prefix 2→5. Canonical active-selection condition includes all three rectangles for that entire strip. Its loop starts height=0,end=−1; first interval gives 1,1, second extends to 2,2, third to 3,3. `area += (right-left)*height` changes 2 to 5. A nested interval cannot pass `hi>end`; a gap instead adds its whole own length. The nonnegative-coordinate constraint justifies sentinel −1. Empty active lists leave height zero. Consecutive unique edges give positive widths, partition all covered x positions, and finite iteration establishes termination. Intermediate prefix is never mislabeled final total.

The baseline holds two O(n) edge arrays and processes O(n²) compressed cells, scanning n rectangles per cell: O(n³) time/O(n) auxiliary space. Canonical code creates O(n) x edges, at most 2n−1 strips, and scans/sorts O(n) intervals per strip: O(n² log n) time/O(n) auxiliary space under the stated integer-coordinate limits (the n=1 case performs constant work). Sorting changes only a fresh intervals list. Python exact integers safely cover 10^18 before the final modulus. The tutorial's retained snapshots are explicitly outside submission-space accounting.

Inspected every test file before executing. All reruns used `LESSON_OUTPUT_DIR="$PWD/specs/reviews/850-evidence/850-review-1-ba13eaa4"`; no author assets were regenerated:

- `python3 -B leetcode/850/tests/test_solution.py`: exit 0; 2169 canonical checks, exhaustive tiny multisets, seeded raster/inclusion-exclusion, large coordinates, maximum n/unique edges, immutability and exact offline mirror.
- `node leetcode/850/tests/test_core.cjs`: exit 0; 1006 cases/3860 frames against a unit-cell oracle, including each delta/prefix, disjoint merged ranges and snapshot ledger length. All six preset totals independently supported: **5,6,4,4,4,2**; strip additions **[2,2,1], [2,3,1], [4], [4], [2,2], [1,0,1]**.
- `node leetcode/850/tests/browser.cjs`: exit 0; 52 forward/back transitions and the checks described below. These are supporting evidence, not scores derived from assertion counts.
- **Required preflight:** `python3 -B scripts/register_leetcode_lesson.py 850 --validate-only` from repository root: **exit 0**, no output. `lesson-entry.json` complexity is exactly the single nonempty string `O(n² log n) time; O(n) auxiliary space`.

### Interaction, bilingual meaning and access

Browser receipt: Chromium 156.0.8078.4, Linux, Playwright, executablePath honored from `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when set; package resolution used the environment's NODE_PATH. No browser console/page errors, failed assets or external lesson requests were observed by the test.

Both locales exercised all presets, start/middle/end, undo/replay exact ledger restoration, reset and slider. Next is disabled at end and previous at start; controls remain readable. Keyboard Enter advances, Tab reaches reset with a 3px focus outline, slider Home/End reaches endpoints. Preset changes intentionally reset the strip experiment; the prediction is explicitly independent of presets. Changing prediction invalidates feedback; all three choices yield the corresponding correct/incorrect explanation. Switching locale retains selected preset, strip index, prediction, feedback visibility and source-details open state.

Independent 320px zh→en→zh roundtrip at official preset strip 2 retained index 2 and correct selected answer. Actual H1 and document titles were `#850 · 矩形面积 II` / `#850 · Rectangle Area II`; the official href remained exact. Both rendered metrics explain width 1×height 3=added 3, cumulative 2→5; active and merged ranges agree. Chinese and English teach the same union, half-open boundary, sorted-prefix invariant, gap exclusion, proof and cost. Independently parsed copy.js with Acorn: 78 unique object keys; tests verify every consumed value is a nonempty two-string pair. Semantic checks cover actual state and prediction text, not just key presence.

Exact canonical parity includes final newline: decoded offline mirror, rendered `textContent`, successful native clipboard readback and downloaded bytes all equal solution.py. For **each locale separately**, browser tests wrote and read back a distinct non-source clipboard sentinel, then denied automatic write, invoked actual Copy, verified textarea focus/full selection and dispatched Linux **Control+C**. Native clipboard readback equaled the complete source. Fallback textarea scrolling shows only a portion on screen but contains/selects the full source; no source value was written directly as a substitute transfer. File-open initialization and interaction also passed without a server; denied localStorage did not break locale selection.

Layouts tested at 320,390,736,1440px in both locales, plus CSS zoom 2 at 1280px (640px effective layout). Inspected actual screenshots including cold-desktop, en-320-diagram, zh-390-diagram, en-1440-diagram, en-390-prediction, zh-320-prediction, en/zh-zoom200-ledger, en-fallback and zh-320-identity. Dense official strip 2 shows B/AB/ABC labels readable inside cyan coverage and a separate dashed orange outline; the outline does not replace coverage. No observed glyph intersection or essential clipping. Narrow ledgers can scroll as a focusable named region; prose and formulas wrap. Horizontally scrolling step navigation is intentional. Closed preset labels fit the recorded computed-font width budgets with padding plus 24px native-arrow allowance; screenshots confirm readable selected labels. Font measurement is platform-specific, not proof about other installed fonts.

Calibrated the browser test's actual luminance/contrast helper independently: black/white 21; red/black 5.252; green/black 15.304; blue/black 2.444; #747474/black 4.492948073111701 (correctly below 4.5). Recorded solid-color text ratios range from 7.07885 (including disabled previous) to 16.08699. Diagram dark labels on cyan use the high-contrast primary pair; focus contrast exceeds 3. Forced-colors mode preserves diagram and keyboard focus. These tests do not establish contrast for arbitrary unmeasured compositing or platforms.

Related links were inspected in both locales at 320px and activated with keyboard Enter. The browser loaded destination #84/#step1: its worked [2,1,2] example explains width×height and excluded rectangle boundaries. #42/#step1 explains accumulating each settled position's water contribution once. Both destinations' content supports their modest link labels. This verifies local availability/content, not production release identity.

### Findings, scores and conclusion

**Required open IDs: none.** No mathematical, causal, state, translation, source-parity or core-access failure reproduced. No prior required finding was silently closed. Minor friction: interactions step entire strips rather than the inner interval merge, and accept presets only; the concrete merge updates in prose and transfer exercise still make the mechanism reconstructable. This is reflected in interaction score 3, not a required fix.

| Dimension | Weight | Score (0–4) | Observation/rationale |
| --- | ---: | ---: | --- |
| Problem/terms/hand calculation | 15 | 4 | Unit-square toggle makes 4+2−1=5 concrete before notation and compressed cells; bounds/output/modulo stated. |
| Derivation/saved work | 20 | 4 | Raw-grid limit → compressed-cell repeated scans → stable strip membership → merge once; overlap and gap wrong rules explicitly fail. |
| Maintained state/correctness | 20 | 4 | Sorted-prefix height/end invariant, concrete updates, disjoint partition, boundaries and final-only total reconstructable and independently checked. |
| Interaction/visual meaning | 20 | 3 | Predict/reveal/change, reversible snapshots and persistent ledger work; inner merge remains prose rather than an individually stepped visual. |
| Python/cost | 15 | 4 | Faithful actual canonical callable executed on fresh cases/bounds; visual transition maps exactly; parity, immutability and stated costs checked. |
| Bilingual/device access | 10 | 4 | Equivalent causal explanation and rendered formulas, narrow identity roundtrip, preserved state, keyboard, readable layouts/disabled text and copy fallback. |

Weighted total: **95/100**. Every dimension ≥3, zero required open findings, and browser/source/executable/metadata evidence complete for the stated scope. **Accepted for candidate c3a389dcbaad4d2a2a5eb330772b9366dd3c426e.** This is independent review, separate from publication.

Limitations: no real human comprehension measurement, real mobile hardware, physical browser zoom gesture, production delivery or successful LeetCode submission is claimed. Zoom evidence is CSS zoom. Direct official Chromium editor access was security-gated; the official statement was normally readable through the web tool. The generated browser JSON retains its reusable test-template phrase “No independent review”; it describes what that test alone proves, not the independently performed walkthrough and audit in this report. Custom-input examples are code checks, not UI experiments. Earlier evidence was preserved; only this report and this run's exclusive evidence directory were written.
