# Independent review: 996 — Number of Squareful Arrays

Candidate: `0cd4cc9fd8de9a9e349a8d9c74313cb7c3ec3b38`. URL: http://127.0.0.1:18799/leetcode/996/. Target: basic Python, lists, loops, functions and elementary recursion. Reviewer: this independent review run; model identity unavailable. Frozen weights: 15,20,20,20,15,10. No publication or submission claim.

## Cold walkthrough (saved before source, contracts, tests or prior reviews)

Only the frozen rubric was read before opening the candidate in Chromium through Playwright. Desktop viewport 1440×1000. Screenshots: `996-evidence/996-review-2-f1f3e97e/cold-desktop.png`, `cold-finished.png`.

| Teaching step / question | Action | Observable result | My causal conclusion |
| --- | --- | --- | --- |
| 00: Which reorderings qualify? | Read definitions; predict 8 must be in the middle, two orders; click reveal | All six orders and their sums appear; two pass, four contain 18 | Every adjacent pair must pass, so 8 separates 1 and 17; reversing changes positions and is counted |
| 01: Why not count copies? | Read baseline, hand-enumerate labeled versus value permutations of [2,2,2] | Baseline uses permutations, set, all and zip with each explained; six labeled copies yield one sequence | Choosing labels overcounts; a set of remaining values instead loses multiplicity. Counts retain exactly the needed information. Early rejection avoids completing illegal prefixes |
| 02: How build every order once? | Advance eight events from initial state | Choose 1: counts (0,1,1); choose 8: (0,0,1); choose 17: all zero; separate accept event adds [1,8,17]; undo 17 then 8 returns prefix [1]; reject 17 reports sum 18 without changing counts; undo 1 restores initial counts | Prefix legality and original-count-minus-usage are preserved. Acceptance adds once; undo restores availability for sibling branches; rejection must not consume anything |
| 02: What does history mean? | Previous from event 8; then Finish | Event 7 restores prefix [1] and counts (0,1,1); final event 25 has empty prefix, initial counts and exactly [1,8,17], [17,8,1] in ledger | Backward navigation replays snapshots; ledger records accepted complete orders rather than current prefix. End is restored search state, not the last solution |
| 03: Can equal values recur? | Predict 1 for [0,1,1] before checking; select answer 1 and check; change to 0 and check | Correct feedback identifies [1,0,1], sums 1 and 1; changing clears feedback; wrong check explains reuse versus duplicate identities | Reuse is allowed while count remains; endpoints containing adjacent 1s fail. This tests a new arrangement, not recall of the first answer |
| 04: How does this become Python? | Read displayed code and mapping; map event 2 | With sorted values [1,8,17], j=1 decrements counts[1], calls dfs(1,left−1), then increments it on return; code omits the pedagogical prefix | last indexes the prior value and left measures progress; zero left returns 1. Positive counts and compatibility guard choices. Finite decreasing left terminates; independent branches sum without duplicates |
| Bilingual reasoning | Switch EN → 中 after wrong feedback | Definitions, copy counterexample, invariant, snapshots, prediction explanation, implementation mapping and costs all appear in Chinese; selected prediction and feedback persist | Both texts explain the same causal chain, including snapshot-after-operation semantics and the simulator/Python distinction |

Independent fresh predictions recorded before execution: **[2,2,7] → 3**, since all three distinct value sequences have only sums 4 or 9. Counterexample to “repeated values cannot be reused”: **[1,1,3] → 1**, only [1,3,1]; other orders have sum 2. Neither is a preset: later execution is explicitly a **code check**, not a custom-input UI experiment. Invariant: remaining counts equal original multiplicities less prefix use, and prefix pairs are square. Excluded adjacent [1,1] cannot become legal by adding a suffix.

Cold-read assessment: the page itself supplies the definitions, concrete before/after counts, baseline cost, optimization bridge, duplicate argument and termination argument. No author notes were used to supply explanations.

## Source and official-contract audit

After saving the cold walkthrough, read the rendered-state contract, canonical Python, mirror, HTML, renderer, simulator, bilingual dictionary and locale consumer, CSS, test programs and the earlier 996 review. `git rev-parse HEAD` returned the requested candidate. Nine served runtime/source assets matched checkout bytes; SHA-256 receipts are in `996-evidence/996-review-2-f1f3e97e/independent-checks.json`. Canonical Python SHA-256: `0075faaa73aef51ec54192dffbaa04987f05100aafe84a4f9f062d9411c4086f`.

Read the [official statement](https://leetcode.com/problems/number-of-squareful-arrays/) normally through the web tool. It confirms square adjacent sums, distinctness by values at positions, examples returning 2 and 1, and bounds n=1…12, values 0…10⁹. No access bypass was used. The lesson-local saved official response supplies the Python3 interface `Solution.numSquarefulPerms(self, nums: list[int]) -> int`, matching the canonical callable. This is faithful Python, not an analogy. No non-Python language contract is needed; no live language-selector inspection is claimed. `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py` specifies `solution.py`, `python-code.js`, `PYTHON_SOURCE`, which are the actual source/mirror/export used here.

The canonical code constructs its own Counter and counts list, leaving nums unchanged. It precomputes exact integer-square compatibility. Each call represents a legal prefix implicitly by last and remaining counts. Every child consumes one available copy, reduces left, and restores the shared count after return. The caller's integer arguments remain unchanged. Zero left accepts once. Each distinct next value partitions legal orders uniquely, so summing children neither omits an order nor counts copy identities. A failed pair never descends. The compatibility matrix handles self-pairs (including zero), rather than banning equal neighbors indiscriminately.

Cost audit: Counter requires O(n), sorting O(k log k), matrix O(k²); k≥1 permits O(n+k²) preprocessing. At most the labeled permutation tree's number of prefixes is explored, with at most n candidates scanned per node, so O(n·n!) is a conservative search bound. Matrix/counts plus depth n use O(n+k²) auxiliary space. The baseline really materializes length-n tuples and stores a set: O(n·n!) worst-case time and space are justified. Snapshot/ledger storage is explicitly additional simulation memory. Both localized paragraphs distinguish these costs.

## Verification and observations

Inspected all six executable test programs before running them. Every listed test command used `EVIDENCE_DIR=$PWD/specs/reviews/996-evidence/996-review-2-f1f3e97e`, except the non-mutating preflight. No builder or registration command was run. Python used `-B`. Results marked `author self-check` are the frozen author's harness executed during this review; their labels are not independent teaching judgments.

| Command from repository root | Observed result |
| --- | --- |
| `python3 -B scripts/register_leetcode_lesson.py 996 --validate-only` | Exit 0, no stdout. Metadata complexity is exactly one nonempty string covering time and space |
| `python3 -B leetcode/996/tests/check.py` | Exit 0; 629 independent permutation-oracle cases, four length-12 boundaries, exact mirror and duplicate builder-key checks |
| `node leetcode/996/tests/core.cjs` | Exit 0; 369 traces, 16,608 event-invariant checks |
| `python3 -B leetcode/996/tests/cost.py` | Exit 0; fixed k=1 reads 1/6/12 input entries; both localized preprocessing claims checked |
| `python3 -B leetcode/996/tests/contrast.py` | Exit 0; minimum tested opaque palette ratio 6.449 |
| `node leetcode/996/tests/browser.cjs` | Exit 0; 202 rendered events, both locales, six presets, all prediction choices, endpoints, rewind/reset, clipboard and downloads, offline mirror and denied storage |
| `node leetcode/996/tests/supplement.cjs` | Exit 0; dense states, selected-label budgets, keyboard continuation links, forced-colors focus |

Independent checks in `independent-checks.json` executed the actual canonical source via runpy and compared small cases with deduplicated permutations. Cold predictions held: [2,2,7]→3 and [1,1,3]→1. Additional cases: [0]→1, [10⁹]→1, [0,0]→1; 1+999950883=31622² gives two orders, increasing the second number by one gives zero. At length 12, all zeros and all twos each give 1, all 10⁹ give 0, and six 1s plus six 8s give 7 (place the six 1s in six of seven gaps around the 8s). Inputs were unchanged. These are code checks, not UI custom-input experiments.

Independent browser checks in `independent-browser.json` confirmed event 4→3 removes the accepted ledger row while retaining the full prefix; replay restores the row. Keyboard Space selected the prediction and Enter revealed it. Changing preset reset the trace to event 0 while retaining exercise feedback as promised. Locale changes preserved the dense [1,8,1,8] prefix, zero remaining counts and one ledger row. At event 6 of [1,1,8,8], both languages explicitly say acceptance adds a ledger entry and returns to the parent. This matches the accounting boundary rather than treating the earlier completed-prefix frame as already accepted. Reject text binds to its actual nonsquare sum; undo text binds to the restored copy. The independent oracle preset totals are 2,1,3,3,1,0, matching rendered endpoints.

The production dictionary itself was parsed with duplicate-key rejection before evaluation: 77 unique keys, all zh/en string pairs. The consumer indexes those pairs correctly. Both rendered invariant formulas retain all operands and causal explanations. A zh→en→zh roundtrip at 320px checked exact localized H1 and document title including #996. Copy fallback, incorrect prediction, and algorithm operation messages were inspected as separate semantic paths.

Source parity: canonical bytes, decoded mirror, rendered `textContent`, copied clipboard text and downloaded bytes match exactly including the final newline in both locales. Successful automatic copy used the browser clipboard. Before **each** manual fallback attempt the harness wrote a distinct sentinel and verified readback, then injected automatic-write denial, invoked the real Copy control, checked focus/full selection and dispatched Linux **Control+C**. Readback exactly matched canonical source. No trimming, newline normalization, test-written source replacement or DOM-only transfer claim was used.

## Device, screenshot and accessibility inspection

Browser: real Chromium 156.0.8078.4, Linux. NODE_PATH was inherited; launch used `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Checked 320, 390, 736 and 1440px widths, with 100% and 200% **CSS layout zoom**. This is reproducible layout stress, not evidence of native browser-chrome zoom or physical phone pinch zoom. State remained available through resizing/zoom. Code is component-scrollable and keyboard focusable. Section navigation scrolls horizontally within its own component. Prefix tiles and count badges wrap with their labels; dense ledger remains legible. Narrow 200% views require considerable vertical scrolling but retain essential words and values. Disabled controls keep opacity 1 with muted text; keyboard focus is a solid 3px outline with offset. No lesson page errors or failed local assets were reported.

Captured and inspected the full-page cold desktop image, English 320 dense state, settled Chinese 320 state/control/header images, English 320/200% cost paragraph, Chinese 390/200% dense state, and both desktop 200% dense states. An initial Chinese dense screenshot omitted tile paint despite its DOM state; a fresh independent settled capture, `settled-zh-320-state.png`, visibly shows all four tiles and their correct labels. This capture anomaly was retained, not classified as a reproduced product defect. `settled-zh-320-controls.png` shows the complete selected [1,1,8,8] label and all four control labels at 320px. Budget at 320/200%: 100px select client width versus 52.50px measured text +16px padding +20px arrow reserve. Font stack: PingFang SC, Microsoft YaHei, system-ui, sans-serif at 14px; no exact resolved font assertion is made. No text collision or persistent essential-content clipping was established.

Calibrated the actual contrast helper against black/white and primary-color luminances .2126/.7152/.0722. Its #747474-on-black ratio is 4.492948, correctly below 4.5. Opaque palette measurements agree with the CSS; readable disabled states use muted-on-panel rather than faded opacity. This does not establish exhaustive compositing or screen-reader accessibility.

Followed both continuation links with keyboard in both locales. Saved destination excerpts in `supplement-results.json` show #51 step2 teaching undo/restoring constraints for siblings, and #940 step2 teaching removal of duplicate strings by ending group. Labels accurately identify the relevant concepts. Both destinations are served locally; production-release availability is outside this review.

## Earlier finding closure

**996-R1-COST-01 — closed; medium severity; required cost correction.** Original candidate `f3eec8c23092990d0309b8f227d5e2a2cf233d1d`; step 04, EN/ZH, any input, reproduced previously at 390px. Original action: scroll below Copy Python and read the unqualified O(k²) preprocessing claim. Expected O(n+k²), including Counter's O(n) scan; actual old text omitted it. Violated frozen Python/actual-cost requirement and rendered-state contract §9. Original report and evidence remain preserved in `996-review-1-1d9a6502.md` and its own evidence directory.

Fix candidate: **0cd4cc9fd8de9a9e349a8d9c74313cb7c3ec3b38**. The diff changes the two cost strings, their served cache version, and adds the cost regression and browser checks; canonical algorithm and other teaching mechanics are unchanged. Current cold read, served-copy/source inspection, fixed-k instrumentation (n=1/6/12, k=1, visits 1/6/12), corrected rendered paragraphs in both locales, and passing `cost.py` establish closure against this candidate. Evidence here: `cost-results.json`, `browser-results.json`, `en-390-zoom1-cost.png`, `zh-390-zoom1-cost.png`, and 320/200% cost captures. Reviewer recheck: complete in this run. Owner's required next action: none for this finding. No other inherited required finding was identified.

## Scores and conclusion

| Frozen dimension | Score /4 | Observation and rationale |
| --- | ---: | --- |
| Problem/terms/hand calculation | 4 | Tiny six-order worked example precedes abstraction; all adjacent sums, duplicate identity, singleton and bounds explained |
| Causal derivation/saved work | 4 | Explicit factorial baseline, pruning at first bad pair, labeled-copy counterexample, and counts-versus-set bridge |
| State/correctness | 4 | Reconstructable call→child→return→sibling sequence, concrete counts, invariant, uniqueness/completeness and decreasing-left termination |
| Interaction/visual meaning | 4 | Choose/accept/undo/reject snapshots and ledger boundary observable; prediction/reveal/change, rewind/reset/endpoints and retained state checked |
| Python/cost | 4 | Faithful executable callable, fresh code checks and mutation evidence; exact source transfer; corrected cost justified at fixed-k boundary |
| Bilingual/device | 4 | Equivalent causal reasoning and localized identity; keyboard, narrow/zoom layouts, readable disabled states and calibrated contrast checked |

Weighted score: **100/100**. Outcome: **accepted** for this frozen local candidate. Required open IDs: **none**. The earlier cost finding is closed on explicit current-candidate regression evidence, not on author claims or aggregate test counts. This is independent lesson review, separate from publication.

Limitations: no real-human comprehension study, online LeetCode submission, production delivery, live official language-selector inspection, other-browser/OS/font proof, native browser-chrome zoom, or exhaustive assistive-technology audit is claimed.

Process deviation: during additional contrast-helper calibration, `runpy.run_path` executed the helper without EVIDENCE_DIR set. It rewrote `leetcode/996/tests/evidence/contrast.json` with **identical bytes**, contrary to the instruction not to regenerate author evidence. The explicit byte comparison against HEAD passed, with receipt in `independent-checks.json`; no tracked content changed. This is a review-process error, not a lesson defect. All other generated review files are in the exclusive evidence directory and this report. Final `git status --short` showed only these two new review paths; no implementation/shared/test/Git/service changes, commits, deployments, agents or schedules were made.
