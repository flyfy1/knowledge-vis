# Independent review: 84 — Largest Rectangle in Histogram

Candidate: `1132236cc1404cffd7430961af07a7b4ab0ff53c`. URL: http://127.0.0.1:18774/leetcode/84/. Review run: `84-review-1-2a16fbe7`; exact reviewer/model identity unavailable. Frozen rubric read first. Interpretation frozen: six weights 15/20/20/20/15/10, faithful Python interface preferred. No source, tests, author notes or prior review read before this cold walkthrough.

## Cold walkthrough (recorded before source audit)

Initial browser: Chromium via Playwright, desktop 1280×900, English. Full-page screenshot `84-evidence/84-review-1-2a16fbe7/cold-initial.png` captured and inspected. The page has five teaching steps. Text and diagrams are visible; source disclosures remain closed.

Predictions written before operating/revealing:

- Hand interval [0,0] should yield 2×1=2; [0,2] should yield 1×3=3. The shorter middle bar excludes height 2 across all three.
- Trace [2,1,2] should push index 0, pop it at i=1 for area 2, push 1 then 2, pop 2 at final i=3 for area 2, pop 1 for area 3, then finish. Best should remain 2 until the last pop.
- Exercise [1,4,5,3]: second pop at i=3 leaves index 0, so width=3−0−1=2, area=8. Width 3 wrongly includes height 1.
- Independently selected fresh input [3,1,3,2]: expected maximum 4 (height 1 across four, or height 2 across final two); pop index 2 at i=3 has left=1, width=1, area=3; final pop of index 3 has left=1, width=2, area=4. UI appears preset-only, so this will be a **code check**, not a custom UI experiment.
- Independent wrong-rule counterexample [3,3]: popping one equal bar must not discard the pair's area 6; tallest-single-bar rule yields only 3. Also a **code check**.

Initial reading by step:

1. **Question:** What rectangle and units are requested? **Action:** Read statement and [2,1,2] picture. **Observation:** Heights above bars, indices below, unit widths, orange interval [0,2] with area 3. **Causal conclusion:** An interval's shortest bar fixes height; extending width can increase area even when height falls. Baseline enumerates every inclusive interval, retaining its minimum; n(n+1)/2 repeated checks motivate settling a height once.
2. **Question:** When is a right boundary known? **Action:** Read the tiny example before abstraction. **Observation:** Height 1 ends index 0's height-2 rectangle; end marker settles remaining bars; stack/pop and monotonic are explicitly defined. **Causal conclusion:** A shorter bar excludes further extension; recent taller bars must be removed first. Width excludes current i and new top left. Ties retain an older owner for the full span.
3. **Question:** What does each operation establish? **Action:** Read simulator labels and initial state. **Observation:** Operation 0/7, empty before/after stacks, best 0, empty ledger; highlighting described as data-independent. **Causal conclusion:** Best tracks settled rectangles only; pending bars have unresolved right limits. Operation results to be recorded below.
4. **Question:** Can the boundary rule transfer? **Action:** Read fresh exercise without revealing. **Observation:** Explicit second pop in [1,4,5,3] and three width/area choices. **Causal conclusion/prediction:** New top after pop, rather than popped index or whole prefix, fixes width 2 and area 8.
5. **Question:** Why is no optimum missed and what is the cost? **Action:** Read proof, mapping bullets and costs with full source closed. **Observation:** Leftmost minimum of an optimal interval owns a covering candidate; each bar pushed/popped once; simulator snapshots distinguished from submission cost. **Causal conclusion:** Valid candidates cannot overestimate and a covering candidate prevents underestimation. O(n) time, O(n) stack, unchanged input; final −1 settles zeros too. Visible pop maps to pop j, then read left, compute i−left−1, update best.

Cold operations completed before source access:

- Step 1: changed right endpoint to 0, observed `[0,0]`, minimum 2, width 1, area 2; restored right to 2, area 3. This matched the prior prediction and makes the height/width tradeoff concrete.
- Step 3: clicked Next seven times. Observed, in order: push 0 (best 0); pop 0 at i=1, left=−1, width 1, area/best 2; push 1; push 2; pop 2 at i=3, left=1, width 1, area 2/best 2; pop 1 at i=3, left=−1, width 3, area/best 3; finished with empty stack, three ledger rows and best 3. Every before/after stack agreed with prediction. Pop text explicitly keeps i fixed; ledger persists through pushes and finish. Clicking Undo returned to operation 6; Reset returned to 0. Causal conclusion: popping settles one pending candidate, while the same shorter bar can settle several; finish adds no input bar. Captured `cold-end.png`.
- Step 4: selected width 2/area 8 then revealed. Observed “Correct”, surviving index 0, excluded height 3, and explanation that popped height 5 still supports height 4. Changing to width 3/area 12 cleared the explanation. This independently confirms included taller bars remain usable after popping, while the shorter boundaries are excluded.

Cold walkthrough saved here before any source/test/prior-report audit. No explanation required author notes to reconstruct. Presets only: fresh custom cases remain explicitly code checks.

## Source, official contract and build audit

After saving the cold walkthrough, inspected `solution.py`, `python-code.js`, `core.js`, `app.js`, `copy.js`, HTML, styles, shared locale helper, the three lesson test scripts and their README. Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python canonical is `solution.py`, offline mirror `python-code.js`, export `PYTHON_SOURCE`. This candidate follows that convention; there is no non-Python contract requiring an exception audit.

Read the [official statement](https://leetcode.com/problems/largest-rectangle-in-histogram/) normally through the web reader. Its two examples, unit bar width, integer area return and bounds agree with the lesson. A separate ordinary Chromium navigation encountered “Performing security verification”; no bypass attempted. The lesson-local `evidence/official-graphql.json` includes the Python3 stub `Solution.largestRectangleArea(self, heights: list[int]) -> int`, matching the actual submission. That stub evidence is author-saved, not a fresh live selector observation. Python is a faithful original callable here, not a conceptual analogy; no TypeScript/native-language preference exception applies. No LeetCode submission was performed.

`git rev-parse HEAD` matched the requested candidate. All nine served files below returned HTTP 200 and were byte-equal to the local candidate during the review:

| File (relative to lesson) | SHA-256 |
| --- | --- |
| index.html | 5d0a10c4a5a149ca42de0b9ba900287c4f51925789e4e99dc39cc5e6c5620f1d |
| core.js | e993c3dd008840a623ca768a92a2532e2661ca519da087aff26dab26d4d3e445 |
| app.js | 37de4bb816356e23b8f0a2fa1156c874c604cf2fa2f1db97c3825f054ebd23ab |
| copy.js | c76d524f5ef1185e178b8bfb0d8282ca1d20695dffb491d961a689937a312a20 |
| python-code.js | 0bee8b68c7718427e34be8c77fe2b3d2c9d8717ec9ad16ac038fb18e06c1bc2a |
| solution.py | 103fcb990b50989371a18eaccc2ae216eb60a4552fda50a977a934bac6be6609 |
| style.css | f9d2e1ec40bf4112ec8efe29fbc2a2acec28b1d326cc4c0b9907a7880842cf8a |
| ../common.js | f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b |
| ../style.css | 6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27 |

## Independent computational and causal checks

Executed the actual canonical file using `runpy`, with bytecode writes disabled. Results and unchanged input verified independently:

| Input | Prediction / independent expected | Actual |
| --- | --- | --- |
| [3,1,3,2] (fresh) | 4 | 4 |
| [3,3] (counterexample) | 6, rather than tallest-single-bar area 3 | 6 |
| [0,4,0,4,4] | 8; zero separates runs | 8 |
| [5,2,5,2,5] | 10; height 2 across five | 10 |
| [0] | 0 | 0 |
| [10000] | 10000 | 10000 |
| [] (outside official contract) | defensive 0 | 0 |
| 100000 bars of height 10000 | 1000000000 | 1000000000 |

Also passed 600 independently generated cases (seed 8412026, lengths 1–19, heights 0–8), compared against fresh interval/minimum enumeration. These are **code checks**, not custom UI experiments.

The fresh trace matched the advance prediction: at i=3, index 2 pops with left=1, width=1, area=3; at final i=4, index 3 pops with left=1, width=2, area=4. The older height 1 then spans all four for area 4. For [3,3], index 1 receives width 1/area 3, then index 0 width 2/area 6. The equal left boundary is not incorrectly described as strictly shorter; it is a temporary excluded boundary for one candidate, with the earlier equal bar owning the wider span.

Used `sys.settrace` on the actual Python file at each while comparison for [3,1,3,2]. Observed `(i, stack, best)`:

```
(0, [], 0), (1, [0], 0), (1, [], 3), (2, [1], 3),
(3, [1,2], 3), (3, [1], 3), (4, [1,3], 3),
(4, [1], 4), (4, [], 4)
```

Checked increasing indices, nondecreasing stack heights, and that every pending index has no shorter bar through i−1 at each observation. This checks intermediate state in the executable submission as well as the simulator.

Visual-to-code mapping: official preset operation 7 shows before `1(1), 2(5)` and after `1(1)`, i=4/current=2. `j=stack.pop()` removes 2; `left=stack[-1]` reads 1 **after** removal; width `4−1−1=2`, area `5×2=10`; best becomes 10. The orange outline covers indices 2 and 3, with height 6 visibly protruding above height 5. The prior popped height-6 bar remains in the input and supports the new rectangle. `if i<n` prevents pushing the final marker. Rewind restores historical ledger/best rather than retaining the final answer.

The correctness argument is sufficient: every candidate fits; choose the leftmost minimum in any optimal interval, whose surviving left boundary precedes the interval and whose first shorter right boundary follows it. Its candidate covers that interval. The final negative marker pops even zero heights, so termination leaves no unresolved candidate. Baseline enumerates all n(n+1)/2 intervals with a running minimum; stack code avoids repeated settling, pushes/pops each index once, and uses O(n) time/O(n) auxiliary space. The code never appends to or edits `heights`. Simulator snapshot storage is separately and correctly identified as O(n²).

## Inspected test claims and rerun evidence

Read tests **before** running. All outputs redirected with `LESSON_OUTPUT_DIR` to this run's exclusive evidence directory; no tracked author evidence regenerated. Their JSON retains the harness label `author self-check`: these files record my rerun of those scripts, not a separately authored pedagogical verdict.

- Python harness passed 22,845 exhaustive/seeded cases plus nine fixtures, including maximum-size constants, monotone cases, and zero split. Exact offline source mirror and nonmutation assertions passed.
- Core harness passed 5,869 cases / 78,854 frames. Inspected its independent height-threshold run oracle, stack order/pending conditions, pop boundaries, candidate validity, running maxima, push/pop counts, flush, deterministic replay and deep-snapshot checks. Browser expectations use this core, so browser agreement alone is not an independent algorithm oracle; actual Python and independent calculations above supply that evidence.
- Browser harness passed 244 primary navigation operations over nine presets in both locales, all forward/back endpoints, reset/replay and slider changes. All three prediction options were checked; feedback clears after changing answers. Source disclosure, selection, feedback, preset and cursor survive locale changes. Denied storage and direct local-file execution passed. No console/page or asset errors and no external runtime requests were observed.
- Exact displayed code, clipboard bytes, denied-clipboard selected fallback textarea and downloaded solution all matched canonical Python. The embedded mirror matched exactly too.

Evidence: `python-results.json`, `core-results.json`, `browser-results.json` under `84-evidence/84-review-1-2a16fbe7/`.

## Bilingual, keyboard and visual audit

Read both locale renderings and translation pairs. The statement, baseline, first-shorter derivation, width exclusions, equal-height ownership, proof, costs and exercise feedback express equivalent reasoning. No essential causal explanation is present in only one locale.

Independently exercised keyboard range End→13 (Next disabled), Home→0, ArrowRight→1, then focused Next and pressed Space→2. Harness also verified Enter, Tab, a 3px visible focus outline and forced-colors focus. Resizing 390→320 retained the populated stack. Locale switch retained operation 7 and revealed answer; changing preset restarted the trace at 0 while preserving the exercise feedback as promised. Crossing hand endpoints keeps the interval valid.

Captured and visually inspected all screenshots in this run's directory: cold initial/end; both locale headers, hand/baseline sections, derivation sections, proof/source/fallback sections, prediction and reveal; populated trace at 320/390/736/1440; 390px before/after stack views; both 200% CSS layout zoom views; additional settled Chinese zoom and English 320px derivation viewport. The rectangle, its dark separator, labels, retained stacks and best values are legible. At 320px the chart is 262px wide with equal ~43.66px columns; at 390px it is 332px wide. Chart height labels are 14px. Long English buttons wrap, and reading diagram, state and ledger requires vertical scrolling; navigation, ledger and code use contained horizontal scrolling. This is minor access friction, not loss of content.

Element/full-page captures can show sticky navigation across an interior part of the captured section. Checked the actual viewport separately: clicking the derivation anchor at 320px put its heading at y≈173, below the sticky navigation (`derivation-en-320-viewport.png`). The additional settled 200% Chinese screenshot confirms readable stack/best/pop text. No content obstruction was reproduced during normal navigation.

Measured contrast in the rerun: prose 12.62:1; hints 7.74:1; chart heights 14.70:1; indices/table headings 7.08:1; disabled controls 6.45:1; incorrect feedback 6.35:1; primary controls 13.10:1; focus against surface 8.94:1; orange rectangle against dark separator 10.73:1. Disabled controls remain readable and agree with start/end positions.

## Findings and prior closure

Required open IDs: **none**. No mathematical, causal, visual, translation, source-parity or core-interaction defect reproduced. No earlier review report for problem 84 was found in `specs/reviews` after the cold walkthrough; no prior finding is claimed closed. Minor device friction is reflected in the score below and does not require a fix under this rubric. No implementation or shared file was edited.

## Scores and decision

| Dimension | Weight | Score / 4 | Observation-based rationale |
| --- | ---: | ---: | --- |
| Problem / terms / hand calculation | 15 | 4 | Unit widths, inclusive indices, area output and shortest-height rule are explicit; operated 2→3 area tradeoff. |
| Derivation / saved work | 20 | 4 | Tiny boards precede stack abstraction; baseline repeated intervals lead to waiting for the first shorter bar; ties and tempting tallest-bar rules are addressed causally. |
| Correctness / maintained state | 20 | 4 | Visible and executable transitions agree; pending invariant, equal heights, excluded boundaries, valid candidates, optimal coverage and final flush reconstruct independently. |
| Interaction / visual meaning | 20 | 4 | Predicted then operated all hand-example operations; before/after stacks and retained ledger distinguish settled state from input; rewind/reset/reveal/change behave consistently. |
| Python / cost | 15 | 4 | Faithful executable interface; independent cases and oracle pass; exact source parity, actual transition mapping, nonmutation and amortized costs verified. |
| Bilingual / device | 10 | 3 | Equivalent causal reasoning and readable tested layouts/zoom/focus/disabled states; narrow layouts require extra scrolling among controls, chart, state and ledger. |

Weighted score: **97.5/100**. Every dimension ≥3; zero required open findings. **Accepted for this candidate revision and this independent lesson-review scope.** This decision is separate from publication.

Limitations: headless real Chromium rather than physical mobile devices; 200% uses CSS layout zoom, not desktop toolbar zoom. No assistive-technology user session, actual novice comprehension measurement, public deployment verification or successful LeetCode submission claimed. Live official selector was unavailable in Chromium; official statement was independently readable, and Python interface was checked against saved lesson-local stub evidence and executed directly. Final worktree status showed only this new report and its exclusive evidence directory as untracked additions; tracked candidate assets remained unchanged.
