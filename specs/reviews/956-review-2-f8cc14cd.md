# Independent review: 956 Tallest Billboard

Candidate: `1e06256b3358b705d303f62a698cf86c369dc029`. URL: http://127.0.0.1:18770/leetcode/956/. Target: basic Python, lists, loops, functions, elementary recursion. Review run: 956-review-2-f8cc14cd. No reviewer/model identity asserted.

## Frozen interpretation and cold walkthrough (before source audit)

Read only the frozen six-dimension rubric before opening the candidate using Playwright Chromium at 1360×900. Applicable language preference: faithful official Python. Weights: 15/20/20/20/15/10; acceptance requires ≥85, each score ≥3, no required gaps and complete evidence.

Initial visible reading: all five teaching sections render on one page. Initial screenshot: `956-evidence/956-review-2-f8cc14cd/cold-initial.png`. No repository source, tests, brief, or earlier review has been opened. The rendered Python listing is part of the lesson being cold-read.

Predictions recorded before operating reveals: the hand example [1,2,3] should give height 3, using 1+2 against 3 (not total steel 6). At d=2,h=1, x=1/2/3/5 should yield (1,2)/(0,3)/(1,3)/(3,3). After two trace rounds on [1,2,3], gap 1 should retain h=1, replacing h=0; the last rod should make gap 0 height 3. Exercise: the two actual support pairs are (2,5) and (5,8); adding 4 to their shorter sides produces (6,5) and (9,8), so select (1,8).

Independently chosen code-check predictions (UI only offers presets): [2,3,5,7] should return 7 (2+5 against 7; total 17 bounds height by 8 and no subset reaches 8). Counterexample to returning half the total: [2,3] returns 0 despite floor(total/2)=2. These will be checked against actual canonical Python after saving the cold walkthrough.

| Teaching step/question | Cold action | Observable result | Causal conclusion in my own words |
|---|---|---|---|
| 0: What is the height? | Read rods, predict 3, click hand calculation | Left 1+2=3, right 3; total/2 upper bound 3 | A construction reaching the steel upper bound proves optimality, and answer is one support. |
| 1: Why enumerate instead of greedily balancing? | Read the full recursive example and hand-check descending greedy sequence | Three calls per rod; skip-1 subtree returns 0, left-1 branch can reach (3,3); greedy finishes (11,10) while a legal construction gives 10 | Skip/left/right exhaust assignments. Locally narrowing a gap can consume rods needed for a better final partition. Separate integer call arguments explain why returning needs no undo. |
| 2a: What does shorter-side addition do? | Predict then select x=1,2,3,5 | Readouts give respectively (d,h)=(1,2),(0,3),(1,3),(3,3), with actual before/after heights | Crossing changes which side is shorter; h increases by min(d,x), rather than always by x. |
| 2b: Which same-gap arrangement survives? | Process twice; select gap 1 | Old map {0:0,1:0}; new {0:0,1:1,2:0,3:0}. Skip h=0 is marked dominated; shorter-side h=1 attains maximum; supports #0:1 and #1:2 | Equal gaps permit identical future increments, so keeping the higher shorter support preserves every promising continuation. Orange marks selection, not a new rod or a different value. |
| 2c: Why old/new maps and dp[0]? | Process third rod, inspect gap 0; undo and replay | Old gap 0 h=0 becomes new h=3 via old (3,0); supports #2:3 against #0:1+#1:2; history 0,0,0,3. Replay restores these values | A round uses each rod once; equal gap at the completed prefix is the requested answer. The map is a summary of legal constructions, not just highlighting. |
| 3: Can crossing and dominance transfer? | Predict (1,8), choose second option, reveal; change to first and reveal again | Correct explanation derives (1,5) and (1,8); changed choice hides verdict with “Selection saved”; wrong reveal explains why 9 is not shorter | Derive actual heights before selecting the maximum; a previous correct reveal does not certify a changed answer. |
| Trace boundaries and independence | Switch to [1,2], process to end, reset | Completed answer 0; reset returns processed 0/2 and only {0:0}; exercise answer/verdict survives | Preset change/reset concern trace state, independently of the exercise. Partial-prefix 0 is explicitly distinguished from the final answer. |
| 4: How does the invariant become Python? | Read the displayed submission and line mapping | `old=dp; dp=old.copy()` retains skips and prevents same-round reuse; `abs`, `min`, `max` implement the observed transition | From old (3,0) with x=3, `gap=0`, `short=3`, merge `dp[0]=3`. At most S+1 gaps and one constant-size transition per old entry explain expected O(nS)/O(S). |

Cold walkthrough saved before any source audit. All listed observations came from the rendered page and browser operations. No custom input UI exists; the independent inputs above remain explicitly pending code checks. The lesson introduces prefix and invariant in plain language, and uses numerical heights before the formula. Dictionary syntax may need a second reading for the target reader, but the displayed line-by-line mapping supplies its purpose.

## Post-cold source and evidence audit

### Identity, official semantics, and canonical files

`git rev-parse HEAD` returned the exact requested candidate. Initial `git status --short` contained only this review report and this run's new evidence directory. Independently fetched nine served assets and compared their bytes with the checkout: index.html, app.js, core.js, copy.js, style.css, solution.py, python-code.js, ../common.js and ../style.css. All matched. Hashes and independent browser observations are saved in `956-evidence/956-review-2-f8cc14cd/independent-browser.json`. In particular:

| Asset | SHA-256 |
|---|---|
| index.html | e5a0add8198360b9e3ae4655e82433c32fa5c896d56e7f651f62271959ab6cce |
| copy.js | 432e0ed9a3e671326f398bc3d225a0e5e38f666668259935457e030ff6885ec1 |
| solution.py | 87fc37cd8f9a07072d49ad9759cbfdf14f922e0ebdcf92f96d28df6504cd41ce |

Read the [official statement](https://leetcode.com/problems/tallest-billboard/) normally through the web reader. It confirms two disjoint subsets, equal support heights, largest single-support height or 0, examples 6/10/0 and constraints n=1…20, rods[i]=1…1000, S≤5000. The normal Chromium request returned HTTP 403 security verification (`official-access.png`); no bypass was attempted. Live editor/selector access is therefore unverified. The saved lesson-local official.json contains the exact Python3 signature `class Solution: def tallestBillboard(self, rods: list[int]) -> int:` and TypeScript among its snippets. This saved capture is supporting evidence, not a claim of independent live-selector access. Canonical Python matches that callable, returns an integer, and is faithful to the independently read problem semantics. There is no non-Python exception or conceptual substitute to validate here.

Read `LANGUAGE_FILES` in scripts/register_leetcode_lesson.py: Python maps to solution.py, python-code.js and PYTHON_SOURCE. Exact decoded offline mirror, rendered code via `textContent`, automatic clipboard contents, manual fallback clipboard contents, and downloaded bytes match canonical source, including its final newline; no trimming or normalization was used.

### Independent execution, intermediate state and cost

Executed actual canonical Python with `runpy.run_path`, rather than a rewritten recurrence. Fresh predictions were confirmed: [2,3,5,7]→7 and [2,3]→0. Every input remained unchanged. Also independently checked [1]→0, [1000]→0, five 1000s→2000, twenty 1s→10 and four 1000s plus four 250s→2500. These cover one rod, duplicate positions, unused rods, maximum n, maximum individual length and maximum total length.

Used Python line tracing at the outer-loop boundary to capture all five prefix maps for [2,3,5,7]. Each exactly matched independent enumeration of skip/left/right assignments. Prefix examples: after 2,3, gap 1 has h=2; after 2,3,5, gap 0 has h=5; after 7, gap 0 has h=7 but gap 1 has h=8. Thus taking the maximum h anywhere would incorrectly return 8: the output must specifically use gap 0. My first tracing harness counted both the final loop boundary and return-line snapshot and failed its expected-length assertion; restricting collection to the loop boundary removed that duplicate. No candidate change was involved.

Independently checked every complete rendered new map against enumeration for every prefix of all six presets in both locales, then selected every reachable gap and checked displayed shorter/taller heights: 248 selected-state checks. Completed outputs are respectively 3,6,10,0,0,2. Inspected core.js construction arrays: they contain distinct processed input positions and swap shorter/taller meaning correctly when crossing. The inspected core tests additionally verify witness sums, bounds, uniqueness, incoming candidate counts and maxima at every prefix.

A dense tie case is visible in `full/en-1440-witness.png` and `full/zh-390-witness.png`: [1,2,3,4,5,6], round 6, gap 1. Old (1,7) skip yields 7 and loses; old (5,5) shorter and old (7,4) shorter both yield 10 and are both labeled attaining the retained maximum, ties included. The witness has heights 10 and 11 while the final equal-height answer is separately 10; those quantities have distinct labels. Prefix equal-height history is 0,0,0,3,5,7,10.

Invariant: after a prefix, every reachable gap is present with its largest attainable shorter height. Initial {0:0} is constructible; skip/taller/shorter cover the assignments, and each candidate is constructible. At equal gaps, all later operations add the same amounts and induce the same gaps, so a smaller h cannot improve any continuation. Reading `old` while writing its copy prevents reusing the current position. For the cold gap-1 transition, old (1,0), x=2 executes `gap=abs(1-2)=1`, `short=0+min(1,2)=1`, then max beats skip h=0. After x=3, old (3,0) writes gap 0,h=3.

The baseline's ternary tree is O(3^n) time and O(n) stack; 3^20=3,486,784,401 leaves supports the stated warning. The submission keeps at most S+1 gaps, copies once per rod, and performs constant-size dictionary operations per old entry: expected O(nS) time, O(S) auxiliary storage. n≥1 and S≥1 eliminate a missing-base-work issue. `old=dp` followed by `dp=old.copy()` creates distinct read/write maps and does not mutate rods. Tutorial snapshots and O(n)-length witness arrays account for the separately stated O(nS) states and O(n²S) position records. These are not attributed to the submission.

### Inspected tests, execution commands, and safe preflight

Inspected test_solution.py, test_core.cjs, browser.cjs and copy-r1.cjs before running them. All generated files were redirected into this run's exclusive evidence directory. No tracked candidate assets, previous evidence, service, or registration output were regenerated.

| Command / execution | Observed result |
|---|---|
| `OUTPUT_DIR=specs/reviews/956-evidence/956-review-2-f8cc14cd/numeric python3 -B leetcode/956/tests/test_solution.py` | Exit 0: actual canonical Python, 1364 exhaustive and 100 seeded cases, boundaries including dense n=20 result 2495 checked by separate meet-in-the-middle oracle, exact mirror, duplicate-key detection, actual displayed baseline executed. |
| `OUTPUT_DIR=specs/reviews/956-evidence/956-review-2-f8cc14cd/numeric node leetcode/956/tests/test_core.cjs` | Exit 0: 1370 cases, 7761 prefix frames, intermediate map and witness assertions, 100 two-string translation pairs. |
| `OUTPUT_DIR=specs/reviews/956-evidence/956-review-2-f8cc14cd/copy node leetcode/956/tests/copy-r1.cjs` | Exit 0: exact bilingual footer correction, retained state/limitations, native source transfers, keyboard and footer geometry. |
| Browser suite through an in-memory preview-origin adapter (below) | Exit 0: eight width/locale combinations, 11 contrast pairs, exact clipboard and download transfers, endpoints/rewind/reset, prediction/change, storage-denied and offline paths. Results in `full/browser-results.json`. |
| `python3 -B scripts/register_leetcode_lesson.py 956 --validate-only` (repository root) | Exit 0, empty stdout/stderr. Metadata complexity is exactly one nonempty string: `O(nS) expected time; O(S) auxiliary space, S = sum(rods)`. |

The browser test has a hardcoded 18788 local-origin assertion as well as its configurable PREVIEW_URL. Before execution I adapted only that origin in memory to the supplied 18770 preview, keeping every behavioral assertion. Exact invocation used `OUTPUT_DIR=specs/reviews/956-evidence/956-review-2-f8cc14cd/full PREVIEW_URL=http://127.0.0.1:18770/leetcode/956/ node` with this stdin harness:

```js
const fs=require('fs'),Module=require('module'),path=require('path');
const file=path.resolve('leetcode/956/tests/browser.cjs');
const m=new Module(file,module);m.filename=file;
m.paths=Module._nodeModulePaths(path.dirname(file));
m._compile(fs.readFileSync(file,'utf8').replaceAll(
  'http://127.0.0.1:18788/','http://127.0.0.1:18770/'),file);
```

This is a preview-address adapter, not a candidate repair. All browser launches used NODE_PATH-resolved Playwright and the configured PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when present. Test counts establish bounded computational checks; the cold record and rendered inspection supply teaching evidence.

### Rendered bilingual behavior, device access, and source transfer

Chromium 156.0.8078.4 on Linux. Both languages retain prefix, gap, selected exercise and reveal state through locale roundtrips; preset changes reset only the trace. Initial undo/reset and terminal next/end are disabled, fully opaque and readable. Prediction reveal is disabled before selection, all three choices grade consistently, and changing a choice hides stale feedback. Native select keyboard arrows change the inspected gap; Enter advances rods and Tab reaches neighboring controls. `keyboard-settled-320.png` shows a distinct orange focus ring on Next alongside orange gap-selection borders, with clear text labels distinguishing focus and data.

Read rendered formula after zh→en→zh at width 320 and prefix 2,gap 1: all operands `|d−x|`, `h+min(d,x)` and the three cases remain complete. English old h=0→new h=1 corresponds to Chinese “旧表矮高 0 → 新表最佳矮高 1”; skip loses and shorter-side addition wins. The Chinese derivation, dominance proof, old-map warning, costs and exercise derive the same actual heights and quantities. Both visible H1 and document title are exactly #956 · Tallest Billboard / #956 · 最高的广告牌. The COPY namespace is checked for duplicate keys before evaluation, all 100 entries match the common.js two-string consumer, and representative dynamic bindings were checked for semantic meaning rather than presence alone.

Inspected captured screenshots: cold-gap1.png, full/en-320-trace.png, full/zh-320-trace.png, full/en-320-witness.png, full/zh-390-witness.png, full/en-1440-witness.png, full/en-zoom200.png, full/zh-zoom200-witness.png, copy/zh-footer-320.png, copy/en-footer-zoom200.png and keyboard-settled-320.png. Dense gap tokens, candidate values, actual support labels and long zero-based-index explanations wrap without text collisions. The longest closed preset [1,2,3,4,5,6] remains readable. At 320 its measured text is 86.88px plus 30px padding plus a conservative 24px arrow reserve within 252px. Font stack: PingFang SC, Microsoft YaHei, system-ui, sans-serif; resolved font and macOS rendering were not established. Widths 320,390,736,1440 and both locales passed overflow checks. The horizontal step navigation scrolls independently and remains keyboard reachable.

Zoom coverage is CSS body zoom=2 at width 640, giving effective content width 320, not a physical-device or OS-wide scale test. Solid-color contrast helper uses the correct 0.2126/0.7152/0.0722 coefficients and calibrates black/white=21, primaries and #747474 on black≈4.492948 below 4.5. Eleven actual text/background pairs exceed 4.5; muted text on panel≈7.079, selected orange on panel2≈8.937, and disabled-control checks exceed 4.5 with opacity 1. No blanket accessibility certification is inferred.

For each locale in each fallback suite, a fresh distinct non-source clipboard sentinel was written and read back immediately before automatic writes were denied. Real Copy focuses and fully selects the complete textarea; Linux Control+C transfers it, and native clipboard readback exactly matches canonical source. Automatic copying and downloaded bytes likewise match, including the trailing newline. Saved downloads and browser receipts are in `copy/` and `full/`; no DOM-only selection assertion was substituted for actual transfer. The suite recorded no local console errors or failed requests. File-URL source/trace and denied-localStorage interaction also passed.

Followed both related links in both languages and read step2 at the destinations: #805 teaches sums grouped by selected count and reading old sets; #920 teaches grouping playlist histories by used-song count. Labels accurately name those ideas. Keyboard Enter activates #805, and the longer last related link has a visible focus outline in the footer captures. This establishes local continuation availability, not publication of those destinations.

### Earlier records and explicit finding closure

Earlier review was opened only after the cold walkthrough was saved. It accepted base `61c1660d36c3e2b77aa2249c0daeeb60133cb0ae` with no required finding and optional advisory `956-A1` about dictionary syntax. That advisory remains optional/open: the current line mapping makes the mechanism reconstructable, but `items()` tuple unpacking and `get(key, default)` may still require a second reading. Owner: lesson author; optional next action: tiny dictionary syntax example in a later authorized revision. No historical report was edited or retrospectively rescored.

**956-COPY-R1 — closed against this candidate.** This stable follow-up request selected a narrow footer correction. Reproduction: at candidate revision 1e06256…, open lesson, advance [1,2,3] twice, select gap 1, reveal correct exercise; switch zh→en→zh; scroll to page end at 320 and CSS 200% zoom. Required expectation: retain the footer element/binding and exactly the interface limitation, omit transient author/review workflow wording, preserve nearby limitations and interaction state. Actual: one bound footer renders exactly `本地模拟，无上传、无在线提交。` / `Local simulation, no upload or online submission.` No replacement acceptance/submission claim or missing-key error appears. Prefix 2/3, gap 1, correct exercise and nearby sim/p4/boundaries meanings remain intact. Screenshots: copy/zh-footer-320.png, copy/en-footer-zoom200.png (both locales/widths are also saved); regression receipt: copy/browser-results.json. Severity of requested fix: required copy correction under the existing workflow; owner: lesson author; fix revision: requested candidate; independent recheck: passed; status: closed.

The actual Git runtime diff from the accepted base changes only the two `foot` strings. index.html, app.js, core.js, solution.py, python-code.js and style.css are byte-identical, independently asserted by the focused regression. The old copy.js SHA-256 was 872ece4bb291745e20d74708b0ece42a7ed4ef58ed3613dc01ba13e68e53fb5d; current is 432e0ed9a3e671326f398bc3d225a0e5e38f666668259935457e030ff6885ec1. The author's saved red/green material was inspected only post-cold; closure rests on this run's candidate-bound rendered checks and screenshots, not those claims.

## Scores and conclusion

| Frozen dimension | Score (0…4) | Observation-based rationale |
|---|---:|---|
| Problem/terms/hand calculation | 4 | Concrete welded heights, disjoint positions, optional unused rods, return units, bounds and attained upper bound precede abstraction. |
| Causal derivation/saved work | 4 | Three-choice recursion and greedy failure lead to same-gap dominance; actual heights explain crossing and excluded wrong updates. |
| Maintained state/correctness | 4 | Reachable-gap/max invariant, old-prefix dependency, constructive transitions, ties and termination checked against independent enumeration. |
| Interaction/visual meaning | 4 | Predicted transitions match old/new maps, candidates and constructions; retained prefix history, rewind/replay, reset and independent exercise behavior are visible. |
| Python/cost | 3 | Actual executable solution, exact transfers, fresh cases, mutation and expected cost pass; new dictionary syntax retains minor target-reader friction (956-A1). |
| Bilingual/device | 4 | Equivalent reasoning and preserved state, narrow dense-state readability, measured contrast, keyboard controls and inspected zoom/footer captures. |

Weighted total: **96.25/100**. Required open IDs: **none**. Outcome: **accepted** for this candidate and local review scope, with 956-COPY-R1 closed. This is separate from publication. Limitations: no real human comprehension measurement, successful LeetCode submission, live official editor-selector access, physical-device testing, non-Linux font equivalence or production delivery claim. Official statement evidence was obtained normally despite the separate Chromium security screen.

Final keyboard-navigation recheck: an initial capture (`keyboard-step4-320.png`) after only 700ms caught an ongoing long smooth scroll at step3; it is not a settled endpoint failure. Repeating native keyboard activation and waiting 2500ms placed step4 at y=89.8125 below the sticky navigation, URL ending `#step4`; `keyboard-step4-final-320.png` was captured and inspected. The selected step and heading are readable. Final working-tree check retained only this report and this run's evidence as new files.
