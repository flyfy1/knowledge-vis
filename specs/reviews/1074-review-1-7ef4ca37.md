# Independent review: 1074

Candidate: `7c189d84805e3159bf116487ae530f1ff328cd7f`. URL: http://127.0.0.1:18770/leetcode/1074/. Date: 2026-10-26. Reviewer: independent review run; exact model identifier unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen rubric weights: 15/20/20/20/15/10. Canonical interpretation frozen before walkthrough: prefer faithful official Python, evaluate executable code and actual cost. No source, brief, tests, prior reports or author evidence read before this saved cold walkthrough.

## Cold walkthrough (saved before source audit)

Real Chromium browser via Playwright, desktop 1280×900. Read rendered English page and operated its controls. Evidence: `1074-evidence/1074-review-1-7ef4ca37/cold-initial.png`, `cold-reveal.png`. Screenshot inspection follows in audit; observations here come from rendered browser text and interaction.

| Teaching step / question | Action | Observable result | Causal conclusion in my words |
|---|---|---|---|
| 1. What is counted? | Read definition, manually add cells, click Next rectangle four times | Five selected rectangles: two horizontal strips, two vertical strips, whole board. Each expression adds to zero; all four singleton cells fail | Boundaries identify rectangles even when sums coincide. There are nine candidates and exactly five matches. Input cells remain ±1; borders identify selection. |
| 2. What do fixed rows save? | Read the worked compression and baseline | Row 0 gives [1,-1]; extending bottom adds [-1,1] and gives [0,0]. Contributions 1+3+1=5. Baseline chooses four edges and repeatedly adds cells; even a prefix table leaves four-edge enumeration | Fixing a row band converts each rectangle to one column interval, and extending bottom reuses earlier column sums. Negative recovery [2,-2] explains why discarding an excessive sum can lose a later match. |
| 3. What state counts left edges? | Predict [0,0] contributes 1 then 2; advance all eight operations | Op1 s=1, need=1, add0, seen {0:1,1:1}; op2 s=0 add1, seen {0:2,1:1}; op3 band [0,1] resets seen {0:1}, keeps total1; op4 s=0 add1 total2; op5 s=0 add2 total4, seen {0:3}; op6 band [1,1] resets dictionary, total4; op7 s=-1 add0; op8 s=0 add1 total5 | Each prior boundary with value s-target supplies a distinct nonempty interval ending here. Repeated values require frequencies. The current boundary must be inserted afterward to exclude empty intervals. Band resets prevent matching across unrelated row bands. History retains earlier contributions. |
| 3. Can I recover prior state? | Previous at final, then Reset | Op7 returns subtotal0,total4; reset returns op0,total0 | Navigation restores snapshots, including answer, rather than merely moving a highlight. |
| 4. Can I transfer the rule? | Before reveal predict option 2: final prefix0 has earlier zero prefixes at boundaries0 and2. Select and reveal | Correct prediction; explanation gives intervals [0,3] and [2,3], distinguishes whole-row total4, set mistake1, self-pair mistake3 | A contribution belongs to one right endpoint, and multiplicity counts legal earlier boundaries rather than distinct prefix values. |
| 5. How does this become code and cost? | Read rendered explanation (code disclosure not yet opened) | It maps second zero in band [0,1] to adding seen[0]=2 before raising its count2→3, states unchanged input, expected O(m²n) time/O(n) space | The query and insertion order implements the boundary invariant. Row-band count times linear scans gives the cost; historical snapshots belong to visualization rather than submission storage. |

Independent input predictions, recorded before execution/reveal: for `[[1,2],[-1,-2]]`, target0, predict **3** rectangles: only the two-row band can match, and its compressed [0,0] has intervals [0,0], [1,1], [0,1]. Counterexample `[[0,0,0]]`, target0: predict **6**, increments1,2,3; membership-only counting gives3 and insertion-first counting gives9. This excludes both tempting wrong rules. UI accepts presets only, so these will be **code checks**, not custom UI experiments. Fresh trace invariant: before third zero query, seen={0:3}; query contributes3, insertion makes{0:4}.

Cold-read limitation: no real novice comprehension or LeetCode submission is claimed. I reconstructed the explanation as a reviewer. Source and test audit begins only after this record was written.

## Source, statement, and candidate audit

HEAD equals the requested revision. Working tree initially contained only this run's new report/evidence. Served bytes equal checkout bytes for index, app, core, copy, local CSS, solution, source mirror, shared common.js and shared CSS. This ties the browser to this candidate; it is not a publication verification.

SHA-256 receipts:

| Asset | SHA-256 |
|---|---|
| index.html | 130d0f277c827505a9b9b36f5fe1689f050d80ffd5ca8552fb93e02f1450a307 |
| app.js | 3d7634b08256c0a62c45130964362f47c763cd824fc7fdacb9b3c8ea964e39d6 |
| core.js | 195cf303cbfaeec0fab131b547e66cc445f8b2f8f90196956473887a713ec83d |
| copy.js | 0ef535541276d9d03f85ee80c32641497d791c05738e13b8d06ead7382f21081 |
| style.css | 070fa20d11e00c33df25dc306979c96de62f8a4aeca547adc590809ac9f4fe69 |
| solution.py | 0b2028199f8a04760a53f19794e42fa6135d6d70209d4f0a124ddf9b73dfe62e |
| python-code.js | 097ce9f192c24bb3cc047d6cf22a12659a1ac71b89bd3ab8e67d6625d46e8727 |
| ../common.js | f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b |
| ../style.css | 6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27 |

Read the [official statement](https://leetcode.com/problems/number-of-submatrices-that-sum-to-target/) normally through web access after the cold walk. Its nonempty inclusive-coordinate definition, distinct-boundary semantics, examples 4/5/0, and limits (dimensions1…100, entries±1000, target±10⁸) agree with the lesson. No access workaround or submission was used. The canonical interface is `Solution.numSubmatrixSumTarget(self, matrix: list[list[int]], target: int) -> int`; it returns the original requested integer count. It is executable Python, not an analogy. Non-Python language-contract requirements are inapplicable. Read `LANGUAGE_FILES` in the registration script: Python's exact names are `solution.py`, `python-code.js`, `PYTHON_SOURCE`; all agree here, with download name `solution.py`.

Read canonical Python, core simulation, renderer, localization pairs/consumer, markup/CSS and all three test files before running them. Applied the rendered-state contract only after the saved cold walk. No earlier 1074 review report existed in the review directory, so no inherited finding was closed.

The Python loops maintain cols as the sum of rows top…bottom at each column. For each top, zeroing cols removes the old top's contribution; increasing bottom adds only one new row. Each band restarts its empty prefix and dictionary. For each value the prefix is extended, old frequencies are queried, and the new prefix is inserted. Every valid rectangle maps uniquely to (top,bottom,right,left), and positive frequency counts distinct earlier left boundaries. Loop endpoints include single-cell/single-row/single-column rectangles and terminate after every band/right endpoint. The input is read only.

The displayed independent direct baseline really has four boundary loops and two summation loops, giving O(m³n³) time and O(1) auxiliary state for m,n≥1. The optimized implementation uses m(m+1)/2 bands and two linear passes per band: expected O(m²n), O(n) auxiliary space under the stated average dictionary-operation model. For n=1 the band work remains O(m²); for m=1 it is O(n). There are at most n+1 distinct prefixes. It does not transpose, and explicitly says so. The 100×100 counts 505,000 queries and 25,502,500 possible rectangles are correct. Rectangle sums have magnitude at most10⁷, so ±10⁸ targets cannot match. Python's integer behavior and no-modulus result are appropriate. Trace snapshots and full history are explicitly excluded from the submission's storage claim.

## Independent calculations and executable checks

Executed the actual imported `solution.py` using Python3 with `-B` and deep-copy mutation checks:

| Input | Target | Prediction / actual |
|---|---:|---|
| [[1,2],[-1,-2]] (fresh) | 0 | 3 / 3 |
| [[0,0,0]] (fresh counterexample) | 0 | 6 / 6 |
| [[3,-1,2]] | 2 | 2 / 2 (singleton2 and interval3−1) |
| [[-1000]] | -1000 | 1 / 1 |
| 100×100 zeros | 0 | 25,502,500 / 25,502,500 |
| 100×100 values1000 | 10⁸ | 0 / 0 |

Every checked matrix remained unchanged. The first two are code checks because the UI is preset-only. For three zeros the legal prefixes before each query have frequencies1,2,3, summing6; replacing counts with membership loses three rectangles, while inserting first adds one empty interval per column and produces9. These predictions were recorded before executing source.

Inspected tests first, confirmed their `OUTPUT_DIR` redirection, and ran from repository root:

- `OUTPUT_DIR=specs/reviews/1074-evidence/1074-review-1-7ef4ca37 python3 -B leetcode/1074/tests/test_solution.py`: exit0; 11,435 cases, direct-cell oracle, input preservation, full-size boundaries, displayed baseline execution, duplicate-key rejection for all100 localization keys, pair-shape and mirror equality.
- `OUTPUT_DIR=specs/reviews/1074-evidence/1074-review-1-7ef4ca37 node leetcode/1074/tests/test_core.cjs`: exit0; 3,902 cases /45,170 frames. Independently summed cells validate compressed columns, legal left lists, old/new dictionaries, prefix/need, subtotal/cumulative history and snapshot independence.
- `OUTPUT_DIR=specs/reviews/1074-evidence/1074-review-1-7ef4ca37 node leetcode/1074/tests/browser.cjs`: exit0;22 grouped checks, no console/page errors or failed network responses. Linux Chromium executable came from `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; packages used environment NODE_PATH.
- **Required safe preflight:** `python3 -B scripts/register_leetcode_lesson.py 1074 --validate-only`: exit0, no stdout. Repeated directly to confirm the result. Metadata complexity is exactly one nonempty string: `O(m²n) expected time; O(n) auxiliary space, for m rows and n columns`.

Generated JSON retains the harness's original `author self-check` labels; these are independent reruns of inspected author tests, not a claim those labels supply an independent teaching judgment. The cold walkthrough, manual predictions and source reconstruction supply that judgment. All generated outputs went to this run's exclusive evidence directory. No candidate asset, old evidence, test or service was modified.

## Rendered interaction, bilingual and access observations

Browser checked every frame of all seven presets in **both** locales, including reverse/replay, reset, and jump/end disabled states. Independently expected totals were5,4,0,3,1,1,3: zero corners count only four zero singleton cells; [0,0] has three intervals; [2,-2] has one; [5] target5 has one; column[1,-1,0] has three zero-sum row intervals. Midtrace band [0,1] operation5 on cancellation has before{0:2}, after{0:3}, lefts[0,1], subtotal3 and cumulative4; the final band brings cumulative5. Initialization frames explicitly say no query yet, retain earlier contributions and clear the dictionary. The final-result label appears only at completion.

The selected band and just-processed column retain original matrix values. Targeted rendered-style checks at320px observed cyan borders rgb(110,231,255) on the other band column and orange rgb(255,180,84) on both cells of the processed column, with separate compressed-column selection. The two selected-column cells still clearly belong to the row band through the event/band coordinates and legend. Dense screenshots show cells/labels separated; no text collision or clipping of essential values was observed. Keyboard focus is a separate orange ring on Next, not a change to matrix data.

Both locales render the complete formula `P[c+1] − P[left] = target ⇔ P[left] = s − target`. Independently read both translations of definition, compression arithmetic, negative-window counterexample, old-prefix multiplicity, query-before-insert invariant, code mapping, cost and prediction feedback. Chinese and English give the same operands, boundary meanings and reasons. At320px, zh→en→zh preserved operation5 and the two old-boundary matches; H1 and document title exactly matched localized metadata including1074. All three prediction options produce the correct matching feedback; changing a choice hides old feedback. A locale roundtrip preserves the selected choice, revealed explanation, trace frame and preset. Trace preset changes reset the trace as promised; prediction is an explicitly separate fixed exercise, so it appropriately remains about [2,-2,2,-2]. Incorrect-prediction copy is distinct from clipboard-fallback copy.

Exact source parity was verified without trimming: canonical bytes → decoded mirror → embedded string → rendered `textContent` → successful clipboard readback → downloaded file, including indentation and final LF. Download filename is `solution.py`. For **each locale**, the browser wrote and read a fresh distinct non-source clipboard sentinel, then disabled automatic writes, invoked the real Copy button, verified full focused textarea selection, dispatched Linux **Control+C**, and read back the exact canonical source. Thus fallback was actually copied, not just displayed, and could not reuse the previous source clipboard. Screenshot `fallback-en.png` shows selected code and distinct fallback instructions. Source remains available offline; blocked localStorage still permits switching locales without losing trace state.

Layouts exercised320/390/736/1440px in both locales, plus 200% **CSS zoom** at desktop. Independent320px keyboard test focused the ledger region and pressed ArrowRight: scrollLeft changed0→40, clientWidth256, scrollWidth600, focus retained. Horizontal component scrolling is necessary but exposes the complete history through keyboard; no document overflow was measured. Controls are at least48px high, matrix cells42px wide at320px and48px tall, and current/old dictionary text wraps rather than colliding. Enter advances, Tab follows to Reset, focus outline is3px, and keyboard deep-section navigation reaches the intended settled section.

Closed-select fit was checked in actual Chromium/Linux fonts at320px, including locale roundtrip. Stack: `"PingFang SC", "Microsoft YaHei", system-ui, sans-serif` (resolved font not asserted). Longest English label is `Example 2 · 2×2 cancellation`: measured211.78px, control264px, horizontal padding30px, borders2px; allowing16px for the native arrow leaves about4.2px spare. Chinese labels measure at most121.93px in a174px control with the same padding/border/arrow allowance. Inspected the selected English label and Chinese selector screenshots; labels remain complete. No other platform/font claim is made.

Calibrated the **actual browser-test contrast helper**, extracted and evaluated unchanged, against black0, white1, RGB-primary luminances0.2126/0.7152/0.0722, black/white21, and #747474/black=4.492948073111701 (correctly below4.5). Actual solid rendered text pairs range from disabled #prev `#9aa7b8` on `#1c2330` **6.45:1** to13.4:1; hint7.08:1 and primary button13.1:1. Disabled controls retain full opacity and readable text; screenshots and semantic disabled assertions agree. Forced-color and reduced-motion checks passed, with visible focus. This is solid-color text evidence, not an exhaustive compositing or assistive-technology audit.

Followed the related links by keyboard in both languages. Served `/leetcode/327/#step1` actually explains range sums as P[j]−P[i] and boundary indexing; `/leetcode/363/#step1` actually compresses rows[1,0,1] and[0,-2,3] into[1,-2,4] and explains extending bottom. Their visible link labels promise exactly these concepts. This establishes local preview availability/meaning; no public-release status of those other lessons is inferred.

### Screenshot inspection

Captured screenshots in this run's evidence directory and personally inspected `cold-reveal.png`, `dense-en-320.png`, `dense-zh-320.png`, `stage-en-390.png`, `stage-zh-390.png`, `board-zh-320.png`, `board-en-1440.png`, both `zoom200` captures, `keyboard-focus.png`, `fallback-en.png`, and `forced-colors.png`. Dense screenshots show original values, column association and both dictionary states legibly. Desktop and zoom captures retain the board/state association. Stage/full-page screenshots sometimes place the sticky navigation across a captured section; focused board and ordinary viewport captures establish this as capture/scroll positioning, not a persistent text intersection. No score is inferred merely from screenshot existence or assertion counts.

## Findings and score rationale

Required open IDs: **none**. No prior finding closure claimed. No reproduced mathematical, causal, interaction, localization or source-parity defect requires an ID/fix on this candidate.

| Frozen dimension | Score0…4 | Weight | Observation / rationale |
|---|---:|---:|---|
| Problem, terms, hand calculation | 4 | 15 | Nonempty contiguous inclusive rectangles, zero-based indices, boundary-distinct count, five manually checkable matches before abstraction; limits accurate. |
| Derivation and saved work | 4 | 20 | Concrete row addition precedes compression, baseline repetition quantified, prefix subtraction derived, negative-window and repeated-prefix counterexamples explain excluded rules. |
| Maintained state / correctness | 4 | 20 | Full initial/middle/final trace reconstructs legal old boundaries, query/insertion ordering and band resets; uniqueness and termination reason given; source and independent checks agree. |
| Interaction / visual meaning | 4 | 20 | Predict/reveal/change, all preset frames and reverse/reset/endpoints work; before/after maps, history, input values and selection have distinct meanings. |
| Python / cost | 4 | 15 | Actual faithful callable executed, exact source transfer verified, fresh cases/nonmutation/boundaries pass, mapping and true O(m²n)/O(n) explained. |
| Bilingual / device | 3 | 10 | Equivalent reasoning, identities and state preservation verified; narrow devices need horizontal history navigation and considerable vertical scrolling, a minor access friction rather than lost content. Keyboard and readable disabled controls verified. |

Weighted score: **97.5/100**. Every dimension≥3, total≥85, complete scoped evidence, no required open finding. **Accepted for the reviewed candidate and local-preview scope; separate from publication.**

Limitations: automated headless Chromium/Linux, no physical mobile hardware, other browser/font environments, physical browser-UI zoom, screen-reader session, novice teach-back, public deployment or successful LeetCode submission. The 200% check is CSS zoom rather than browser chrome zoom. Custom matrices are code checks because the lesson is preset-only. These limits are not silently relabeled as broader evidence.
