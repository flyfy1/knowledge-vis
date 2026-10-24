# Independent review: 391 Perfect Rectangle

Candidate: f237aaafb129caf67d9f1517ebf7ce4cd24c203b. URL: http://127.0.0.1:18770/leetcode/391/. Run: 391-review-1-7fc2e43f. Reviewer: this independent agent run; exact model identifier unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen rubric: specs/leetcode-review-gates.md; weights 15/20/20/20/15/10. Python interface interpretation applies.

## Cold walkthrough (saved before source audit)

Only the frozen rubric was read before opening Chromium through Playwright. No brief, implementation files, tests, prior findings or author notes were read. All five teaching sections and the visible code were read in the browser.

| Step / question | Action and prior prediction | Observable result | My causal reconstruction |
|---|---|---|---|
| 1: What does exact cover mean? | Read input/axis definitions, inspect four unit cells; calculate 2+1+1=4 and predict true, then reveal hand calculation. | Four counts are 1. Reveal assigns the left cells to A and right cells to B/C and says true. | Shared edges are harmless; each interior cell belongs to exactly one tile. Area alone has not yet proved coverage. |
| 2: Can area alone work? | Read baseline cell loop and work the stated duplicate-left, empty-middle example. Predict counts 2,0,1 in both rows, total 6 matching the box but false. | Text gives those counts; select Area trap in section 3 and process all: counts 2,0,1, area pass, corner fail, result false. | Duplicate area can compensate for a gap. Cell scanning is correct but revisits every tile for each of WH cells. |
| 3: What state replaces the cells? | Start Three-tile cover at zero; add each tile separately. Predict after A area 2/four corners; after B area 3 with (1,0) removed; after C area 4 and only outer corners. | Empty state explicit; A adds four points; B removes (1,0) and adds three, both prefix checks fail; C removes (1,1),(1,2),(2,1), adds (2,2), both checks pass and true. All preceding area/corner frames remain in history. | Area sums, prefix bounds and the odd-occurrence set are maintained separately. Dots are odd corners, cell numbers are coverage, and prefix failures are not premature final verdicts. |
| 3 proof / excluded rule | Read southwest-corner parity argument; select Triple coverage and process all, predicting area 3 vs box 1, four corners still matching, false. | Cell count 3, area fail, corner pass, false. | A tile contributes an odd southwest count exactly inside it. Matching box markers forces odd positive coverage everywhere inside; equal area excludes extra layers. Conversely adjacent-cell parity differences recover markers. Triple duplicates show why corners alone are insufficient. |
| 4: Can I transfer the checks? | Calculate the displayed four-tile exercise: area 3+1+1+1=6, duplicate upper-left cancels its corners, upper-middle stays empty. Predict only corner check fails; choose that answer then reveal. | Correct prediction; six odd coordinates {(0,0),(0,1),(2,1),(2,2),(3,0),(3,2)}, area passes, false. | Equal area can hide compensating defects; compare the entire coordinate set to the expected box, not just its size. |
| 5: How does the visual become Python? | Read displayed Solution.isRectangleCover and map B's (1,0) to membership/remove and (2,1) to add. Inspect the return and cost paragraph. | Source toggles four tuples per tile; compares area AND exact set; explains expected hash-set O(n) time/O(n) space, no mutation and exact large Python integers. | The browser's retained cells/history are additional teaching state, not submission storage. Each rectangle requires constant expected work; up to 4n odd corners remain. |

The UI offers presets only. Independent custom inputs below will therefore be **code checks**, not UI experiments. Predictions recorded before executing canonical source:

- Fresh true input [[-2,1,0,2],[0,1,1,2]]: areas 2+1=3; shared (0,1),(0,2) cancel; outer set {(-2,1),(-2,2),(1,1),(1,2)}; true.
- Fresh counterexample [[0,0,1,1],[1,1,2,2]]: corner contact is insufficient. Area 2 vs box 4, shared (1,1) cancels leaving six corners; false.
- Boundary prediction: one rectangle spanning [-100000,-100000,100000,100000] is true with area 40000000000, without 32-bit overflow.

Cold screenshot: 391-evidence/391-review-1-7fc2e43f/cold-desktop.png (three-tile prefix after B). Audit and final assessment follow below.

## Candidate and official-source audit

`git rev-parse HEAD` equals the requested revision. Initial and final tracked diff were empty; only this report and its exclusive evidence directory were added. Browser responses were byte-compared with checkout files: index.html, core.js, app.js, copy.js, local.css, python-code.js, solution.py and shared common.js/style.css all matched. No candidate files, author evidence, shared files or services were modified. No prior review report for 391 was found after the cold walk, so there are no earlier required IDs to close.

Build identifiers (SHA-256):

- index.html: aa55a68f0ec41267bc393cc060d2604127996b210de117ba7b743cbc8dd00c0f
- core.js: 5300905a474b7b51a42ee8f92f3f84b71405da39f87931bd59ca605739ea1fd0
- app.js: eff4bcec39e86c45e597d6e516ca304730fe2763b8172ad626eae47542a71c24
- copy.js: e76483dd4846674fc4b79751199c2357bd8ca40cf45b171d0cea0ccdc16aa9d6
- solution.py: 16e0bc3b9f27f03ecf277cdd18f782e391ecaf20c1e0ac4185d3c169a4f54865

Read the [official statement](https://leetcode.com/problems/perfect-rectangle/) normally through the web reader. It supplies axis-aligned rectangles, an exact rectangular cover boolean, all three examples, 1..20000 tiles and integer coordinates bounded by ±100000 with positive dimensions, matching the lesson. Direct Chromium access to that external URL showed Cloudflare security verification; no bypass was attempted. The saved lesson-local official.json contains Python3's `class Solution` / `isRectangleCover(self, rectangles: list[list[int]]) -> bool` stub, matching the canonical interface. This is a faithful Python implementation, so the non-Python language-contract and supportedLanguages audit is not applicable; no conceptual analogy is advertised as an original submission.

Read `LANGUAGE_FILES` in scripts/register_leetcode_lesson.py: Python maps to solution.py / python-code.js / PYTHON_SOURCE. Inspected actual solution.py, mirror, core.js, app.js, copy.js, HTML, local/shared CSS and common locale runtime. The displayed text exactly equals solution.py; the mirror exports the same bytes. Both locales' copy success, selected manual-copy fallback, and downloaded solution.py match those exact bytes, including final newline. Offline file opening also preserves the displayed implementation.

The submission loops once through rectangles, updates four extrema and an exact integer area, toggles all four tuples, and returns the conjunction of area equality and exact set equality. Nothing mutates the input. Bounds are initialized with infinities but become input integers on the first tile under the nonempty contract. There is no premature rejection of an incomplete prefix, no loss of duplicate contributions, no modulus or float area conversion. At most 4n tuple entries and fixed extra scalars support expected O(n) time and O(n) auxiliary space under the stated hash-set model. The JS trace deliberately retains more state, recalculates prefix bounds and counts unit cells; its cost is explicitly distinguished from submission cost.

The correctness argument is sound: interior q has odd southwest marker count iff the covering layer count is odd. Four box markers forbid uncovered positive-area cells. Equal area then rules out all odd counts above one. Conversely the mixed difference of the four adjacent cell parities recovers each corner marker. Shared boundary lines are excluded from positive-area-cell reasoning. T-junction cancellation is specifically explained with actual corner identities. The proof of necessity is somewhat compressed for the target reader, but all essential implications can be reconstructed from the page.

## Executed evidence and independent checks

All test scripts were inspected before execution. `tests/build_copy.py` was identified as an authoring generator and was **not run**. Test outputs and screenshots were redirected with `OUTPUT_DIR=$PWD/specs/reviews/391-evidence/391-review-1-7fc2e43f`; author evidence was not regenerated. Python was invoked with `-B`.

| Command / check | Actual result |
|---|---|
| `python3 -B scripts/register_leetcode_lesson.py 391 --validate-only` from repository root | Exit 0, no stdout/stderr. Metadata complexity is the single nonempty string `O(n) expected time; O(n) auxiliary space`. No registration performed. |
| `OUTPUT_DIR=… python3 -B leetcode/391/tests/test_solution.py` | Exit 0: 3508 cases agree with coordinate-partition midpoint oracle; unchanged input; three official examples; maximum n=20000 tiling true then duplicate/missing tile false; maximum coordinate area true. See python-results.json and oracle-cases.json. |
| `OUTPUT_DIR=… node leetcode/391/tests/test_core.cjs` | Exit 0: same 3508 results, 19442 prefix invariant checks, isolated snapshots, mirror parity, 98 localization keys. See core-results.json. |
| Independent canonical Python execution with `runpy.run_path` | All three cold-recorded custom predictions confirmed, input unchanged. Exhaustively checked 7314 multisets of 1..4 rectangles with x edges -1..2 and y edges 0..2 against an independently written integer-unit-cell oracle. See independent-code.json. These are code checks, not custom-input UI experiments. |
| `OUTPUT_DIR=… node leetcode/391/tests/browser.cjs` using NODE_PATH and the environment executablePath when provided | Exit 0, “Browser checks passed”; browser-results.json. Both languages, all six presets and every tile transition, forward/back replay, reset/endpoints, history lengths, all prediction choices/change/reveal, keyboard, state preservation, clipboard/fallback/download, offline display and denied storage. No console/page/asset errors or remote lesson asset requests. |

Independent manual interaction supplements the harness: at 320px Chinese, switching language retained prefix 2/3, the open hand calculation, selected correct prediction and revealed feedback. Focusing the diagram and pressing ArrowRight changed scrollLeft from 0 to 40, exposing clipped right-hand labels. At 390px English, changing the prediction hid its answer; keyboard Enter revealed corrective feedback. Undo restored A's four-corner set at area 2; replay restored B's six-corner set at area 3. Reset disabled undo/reset, and process-all disabled next/end. These are observed state transitions, not conclusions inferred from test counts.

Localization JSON was parsed with duplicate-key rejection before assignment could overwrite a key; all 98 pairs have nonempty strings. common.js constructs one namespace per locale from those pairs. Separately checked semantic binding at Three-tile cover/B: both languages say area 2→3, remove (1,0), add (1,1)/(2,0)/(2,1), prefix area 3 vs box 4 and both checks fail. After A both checks pass; after C both pass with final true. Area trap has area pass/corner fail and triple coverage reverses those conditions. Chinese proof and Python/cost paragraphs preserve the English reasoning, including the T-junction and exact-set warning. All three exercise choices bind to the same area-equals-six explanation with correct versus corrective feedback; clipboard denial has its own accurately bound manual-copy message.

## Visual and access observations

Captured screenshots were opened and visually inspected, including cold-desktop.png, manual-zh-320.png, manual-zh-320-ledger.png, en-320-trace.png, zh-390-trace.png, en-intermediate-grid.png, en-intermediate-ledger.png, zh-source-mapping.png, en-prediction.png, zh-hand.png and both en/zh-zoom200-grid.png. Evidence lives only in `391-evidence/391-review-1-7fc2e43f/`.

At desktop the legend, controls and state labels are clear. The dense six-corner B state keeps coordinates separated from coverage values; before/after sets wrap without losing association, and toggle rows state both the operation and reason. At 320px the 360px minimum SVG is intentionally clipped inside its own scroll region with instructions and keyboard focus, rather than shrinking labels. At 390px the three-column official final grid is readable; disabled endpoint buttons use dashed outlines and readable muted text. No reproducible label/value intersection was observed. Sticky navigation can cover the already scrolled-off top of a large diagram; the separate full-grid captures reveal no underlying collision. The harness hides the sticky nav only during dedicated full-grid captures; ordinary viewport captures retain it.

Widths 320/390/736/1440 were exercised in both languages, plus the independent 1280px cold walk. 200% was CSS document zoom at desktop and 390px, not browser-chrome zoom. Layout checks found no page-wide overflow; nav, diagrams and source may scroll locally. Actual Enter/Tab activation and a solid 3px focus outline were checked. Controls measured at least 48px on each axis; radio labels supply a 48px high clickable row. Contrast measured from rendered theme tokens: ordinary text/background 16.09:1, text/panel 14.70:1, disabled muted/panel2 6.45:1, gap number/panel2 6.35:1, corner label/panel2 8.94:1. Disabled labels remain opacity 1. Numbers and coordinates carry meaning independently of color. Forced-colors/reduced-motion paths also ran.

## Findings and scores

Required open finding IDs: **none**. No earlier review finding was closed or rewritten.

Optional improvement **391-R1-N1** (minor, open, non-required; owner: lesson author): in step 3's necessity paragraph, both locales and all widths, read “XOR those four values.” The statement is correct, but a target reader must reconstruct the four-cell cancellation themselves. A numerical parity mini-example would reduce friction. This is an optional illustration, not a missing correctness bridge: the preceding southwest-count explanation defines parity, and its local cancellation can be independently reconstructed. Fix revision/regression: none; no candidate change requested for acceptance.

| Dimension | Score | Weighted | Observation and rationale |
|---|---:|---:|---|
| Problem/terms/hand calculation | 4 | 15 | Coordinate order, axes, boolean, legal shared boundaries and limits precede a vivid four-cell hand calculation and reveal. |
| Causal derivation/saved work | 3 | 15 | Correct independent cell baseline and cost, explicit repeated work avoided, two distinct wrong-rule counterexamples, worked corner transitions and sufficient/necessary proof. Four-cell XOR recovery is compact, causing minor target-reader friction. |
| Maintained state/correctness | 4 | 20 | Explicit three-part invariant; accurate actual before/after values; prefix versus final semantics; duplicate, contact, negative, maximum and endpoint checks; sound termination and conjunction. |
| Interaction/visual meaning | 4 | 20 | Predictions precede reveal, wrong choices explain the cause, change hides feedback, every whole-tile frame and history retained, rewind/reset/preset semantics work, data marks explicitly defined. |
| Python/cost | 4 | 15 | Exact executable canonical source across all delivery paths; concrete B toggle mapping, fresh checks and independent oracle; faithful interface, no mutation, actual expected time/space justified. |
| Bilingual/device access | 4 | 10 | Equivalent algorithm reasoning and feedback in both languages; state survives language/viewport changes; readable wrapping and disabled controls, working focus/keyboard scrolling at narrow widths and CSS 200% zoom. |
| **Total** | | **95/100** | Every dimension ≥3; no required open findings. |

## Conclusion and limitations

**Accepted** for independent lesson review at f237aaafb129caf67d9f1517ebf7ce4cd24c203b: 95/100, scores [4,3,4,4,4,4]. This is separate from publication. Browser, source, executable, visual inspection and non-mutating preflight evidence are complete for the stated scope.

No real human comprehension, successful LeetCode submission, production deployment, screen-reader session, physical mobile device or browser-chrome zoom result is claimed. Direct official Chromium access remained at security verification; the official statement was independently readable through normal web access, and the Python stub was checked against the saved lesson-local official response. Test counts supplement the recorded teaching reconstruction and actual interaction evidence; they do not establish learner outcomes.
