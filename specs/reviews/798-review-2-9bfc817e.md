# Independent review: 798

Candidate: f1f2ef5f4dea85495b1f343e529e87e69b00685a. URL: http://127.0.0.1:18770/leetcode/798/. Reviewer: this independent review run; exact model identifier unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen weights: 15/20/20/20/15/10; Python canonical interpretation. No source, author notes, tests, or earlier reviews were opened before this cold walkthrough was saved.

## Cold browser walkthrough (saved before source audit)

Real Chromium via Playwright, 1440×1000. Initial and completed full-page screenshots captured in this run's exclusive evidence directory.

1. **Score question:** What earns a point and what is returned? Read the opening and ledger, then predicted k=1 gives [0,2,1], score 2; k=2 gives [2,1,0], score 2, hence answer 0. Clicked Inspect next k and Go to last k. Observed those arrays, explicit ≤ versus > comparisons, and history 0:2,1:2,2:2. Conclusion: equality counts, and k is the rotation count, not the score or new index. Tiny arithmetic precedes the interval abstraction.
2. **Baseline question:** What repeated work is saved? Read baseline explanation and counterexamples. It states n comparisons for each of n rotations, 10 billion at n=100000. Plateau example scores 2,3,3,4,3; tie example remains score 3. Conclusion: neither an early plateau nor an equal-best overwrite is justified; all rotations matter. The baseline code disclosure was initially collapsed.
3. **Losing interval question:** Where does one original entry fail? Read j=(i−k+n)%n and j<v, with modulo explained as wrapping. Initial i=0,v=1 showed losing [0,0], new indices 0,2,1. Switched shared input to [2,3,1,4,0] after the tiny walkthrough: i=0,v=2 showed [4,4]+[0,0], indices 0,4,3,2,1 with losses only at k=0,4. Combined diff became +3,−1,0,−1,+1,−2. Conclusion: the losing arc contains v positions, and crossing zero requires two inclusive pieces. Endpoint +1 and r+1 −1 mark entering/leaving rather than updating every cell; zero values have no losing interval.
4. **Scan question:** How do events give scores? Predicted tiny bad stays 1 after the first event, score stays 2, earliest best remains 0. Clicked Complete scan. Observed rows (k,diff,bad,score,best)=(0,1,1,2,0),(1,0,1,2,0),(2,0,1,2,0), with final answer only at completion. Conclusion: after applying diff[k], bad counts intervals started but not ended; score=n−bad. Display explicitly distinguishes after-event state and scanned-prefix best.
5. **Transfer question:** For n=5,i=0,v=3, predict losing rotations. Before reveal predicted {0,3,4}, from new indices 0,4,3,2,1. Selected that option and revealed. Observed correct feedback, split [3,4]+[0,0], and explanation of both distractors. Conclusion: k must be distinguished from j and k=0 must not be dropped at wrap.
6. **Implementation question:** What code maintains this state? Opened the rendered complete Python submission (part of lesson, not implementation files). Observed add(left,right) endpoint writes, zero skip, split branches, bad += diff[k], strict bad < least_bad. Conclusion: diff[0]=1 changes bad 0→1 for tiny k=0; strict comparison keeps k=0 on ties. n entries each produce ≤2 intervals, then n scan steps: O(n) time and O(n) extra memory, no input mutation. Teaching-history memory is explicitly separated.

**Independent predictions before code checks:** UI offers presets only. Chose fresh [0,2,1,3]; initial scratch prediction was scores [3,2,3,2], answer 0 (to be independently checked, not assumed correct). Chose [2,2,2] as counterexample to replacing on ties: predict every score 1 and answer 0 rather than 2. Custom input execution will be labeled a code check. The lesson's transfer exercise checks a fresh interval rather than mere preset recall.

Cold conclusion: causal chain is reconstructable from rendered explanations alone. Remaining audit covers intermediate stepping, rewind, accessibility/layout, both locales, exact source parity and independent execution. No human comprehension or successful LeetCode submission is claimed.

## Post-cold source and official audit

HEAD was independently checked and equals the requested candidate. Initial status showed only this report and this run's evidence directory. Read the rendered-state supplement only after saving the cold walk. Read canonical solution.py, core.js, app.js, index.html, copy.js, style.css, lesson-entry.json and tests. LANGUAGE_FILES in scripts/register_leetcode_lesson.py specifies `solution.py`, `python-code.js`, `PYTHON_SOURCE` for Python. Independently decoded mirror equals canonical source exactly, including its terminal newline.

The [official statement](https://leetcode.com/problems/smallest-rotation-with-highest-score/) was accessed normally and confirms rotation direction, scoring, smallest tied index and constraints. Saved lesson-local official GraphQL evidence supplies the Python3 snippet `Solution.bestRotation(self, nums: list[int]) -> int`, matching the actual canonical callable. Python is faithful; non-Python language-contract requirements do not apply. Live selector UI was not operated, and no submission was attempted.

The focused browser runner compared all eight served lesson files to the checkout by SHA-256. Candidate identity receipts are in `copy-r1/results.json` under this evidence directory. In particular:

| File | Candidate SHA-256 |
| --- | --- |
| index.html | 906707febd4b073b253352c1af285e3b36ebd1d20dc8021e54b702ce1dd56920 |
| copy.js | 0f79e1e46c6dac59d6087c9abdea7fe796b15374db833391d2a49d99db507365 |
| solution.py | f1b2add3552b878bfb2dafe6138a6dda5e8f002ea4648d4d65a49e5dd0ec368b |
| app.js | 5900fc1266ae6be61a87da057dee1ea68567030b0ae24452b9fff6b25c3d9d25 |
| core.js | 980a6b2d358d07d2c3fa29f160be7e13b857dc7c2e27a52a09b9d4cd0c26d4db |

### Commands and independent execution

Inspected tests before running. `test_solution.py` physically rotates lists for its oracle and checks nonmutation, actual canonical execution, core interval coverage, prefix counts and best identity. Both browser runners support OUTPUT_DIR and write their results only there. The fixed-output `copy-r1-python.py` was inspected but **not run**, because it writes tracked author evidence. Existing evidence was neither regenerated nor edited. The inherited JSON field `authorSelfCheck:true` describes the author's harness; the new results here are executions performed during this independent review.

From repository root:

- `python3 -B scripts/register_leetcode_lesson.py 798 --validate-only`: exit 0, no output. Metadata `complexity` is exactly the string `O(n) time; O(n) space`. No registration or repair performed.
- `OUTPUT_DIR=specs/reviews/798-evidence/798-review-2-9bfc817e python3 -B leetcode/798/tests/test_solution.py`: exit 0; 51,569 actual Python cases, all intermediate invariants passed. Includes 6,500 core cases and n=100000 zero, maximum-value and ascending boundaries. Result: numerical.json.
- `OUTPUT_DIR=specs/reviews/798-evidence/798-review-2-9bfc817e node leetcode/798/tests/browser.cjs`: exit 0; browser checks passed. Result: browser.json and viewport screenshots.
- `OUTPUT_DIR=specs/reviews/798-evidence/798-review-2-9bfc817e/copy-r1 node leetcode/798/tests/copy-r1.cjs`: exit 0; focused browser checks passed. Result: copy-r1/results.json and page-end/roundtrip screenshots.

**Independent fresh code check and prediction correction:** My pre-execution scratch score sequence for [0,2,1,3] was mistaken. Independently forming the physical rotations yields [0,2,1,3], [2,1,3,0], [1,3,0,2], [3,0,2,1], scores **[3,2,2,3]**, earliest best 0. The actual canonical function returned 0 without mutating the list. A Python line tracer at the comparison after the prefix update observed `(k,bad)=(0,1),(1,2),(2,2),(3,1)` and diff `[1,1,0,-1,-1]`, consistent with those scores. This is a code check, not a custom UI experiment. The independently selected tie counterexample [2,2,2] scores [1,1,1], actual return 0; overwriting on equality would return 2. Also checked [0], nine zeros, nine eights, ascending length nine, and both official examples against physical rotations; all outputs matched and inputs remained unchanged.

Correctness argument: a positive value loses exactly at new indices 0…v−1. Solving j=(i−k+n)%n gives v consecutive circular rotations. The split into two linear intervals covers each losing k once; v=0 covers none. A prefix sum of +1 at l and −1 at r+1 counts the interval precisely on [l,r]. Summing contributions makes bad the number of losing entries after processing diff[k]. Minimizing it maximizes n−bad; n+1 admits the first candidate, and strict improvement preserves the earliest tie. All n legal k are scanned; sentinel n is not a rotation. The actual implementation has ≤4 endpoint writes per input entry and n scan steps, n+1 difference cells and constant scalar/closure state: O(n) time/O(n) extra space. No input writes or rotated-list allocations occur. The baseline generator performs n² comparisons with O(1) extra space. Teaching model snapshots retain O(n²) rotated/display data, separately disclosed in both locales.

## Rendered behavior, bilingual semantics and access

Both locales exercised all six presets, every rotation, every original-entry selection, every scan row, initial/final disabled controls, rewind/replay, hand reset/end and scan reset/complete. All prediction options were revealed and graded appropriately; changing an option cleared feedback, and quiz reset disabled reveal. Hand history contains the current prefix. Scan rows are explicitly after processing the indicated event. On official example 1, terminal current k=4 has bad=2/score=3 while best k=3 has score=4; these identities remain distinct. Undo removes the final row and final answer; replay restores them.

Additional independent mixed-state operation at 390 px: preset [2,3,1,4,0], hand k=1, selected i=3,v=4, two processed scan rows, wrong option revealed. zh→en→zh retained selected entry, hand array, rows, radio and feedback meaning. Actual Chinese and English readouts both reported current k=1,bad=2,score=3 and best k=1,score=3. Heading and document title became `#798 · 得分最高的最小轮调` / `#798 · Smallest Rotation with Highest Score`. Changing shared input resets hand/entry/scan as labeled. The independent quiz always specifies n=5,i=0,v=3, so retaining its answer on preset change is appropriate.

Read both locale explanations for modulo, losing inequality, zero exclusion, inclusive endpoints, wrap splitting, prefix cancellation, tie proof, costs and distractors. They express equivalent reasoning. The tests detect duplicate flat LESSON_COPY keys before parsing and validate two-string pairs. Actual rendered interval formula, scan status and feedback were checked against arithmetic, beyond merely testing key presence. A selected entry changes inspection only; aggregate diff remains for all entries. Loss/success have explicit words and point values as well as colored borders; navigation highlighting means page section, not algorithm state.

Chromium 156.0.8078.4 on Linux; viewport captures at desktop 1440, tablet 736, phones 320/390 and 1280-wide CSS zoom 2. Inspected cold-end.png, desktop-en-detail.png, phone320-en-scan.png, phone320-zh-detail.png, phone390-en-scan.png, phone390-zh-detail.png, settled200-en-step2.png, settled200-zh-step3.png and all four copy-r1/end-* images. At 320, controls wrap and all five scan columns remain readable. At 200%, operands and values wrap without intersection. Text above the scrolled viewport is a capture boundary, not missing content. No orphan footer gap appears at page end. The sticky step navigation scrolls horizontally at narrow widths; essential lesson controls and neighboring related links remain keyboard reachable. Closed select values are short and readable; measured preset text 73.45 px + padding 30 px + conservative arrow reserve 24 px fits the 260 px control at 320. CSS stack is PingFang SC, Microsoft YaHei, system-ui, sans-serif; no exact resolved physical font is asserted.

Keyboard checks: Enter on scan Reset clears rows; Tab reaches Complete scan and Enter completes five rows. Focus outline is solid 3 px. Related links retain focus at page end in both languages. Forced-colors/reduced-motion focus and blocked-storage initialization were exercised successfully. No page/console/response errors were recorded. The related destinations ../689/#step2 and ../732/#step2 were keyboard activated in both locales; their captured excerpts explain earliest maxima on ties and net endpoint changes/running counts, respectively, matching the labels. Public target release identities were not audited.

Contrast helper uses correct linearization and luminance weights 0.2126/0.7152/0.0722. Its own calibration asserts black/white=21, primary colors, and #747474 on black≈4.492948 below 4.5. Recorded ratios include body 16.087, explanation 12.616, hint 7.079, disabled control 6.449, mask/textarea 13.397 and active navigation 13.101. Disabled opacity is 1 and labels are visibly readable. This establishes the sampled solid-color paths, not every rendering effect.

Exact transfer: decoded offline mirror, window.PYTHON_SOURCE, rendered code textContent, clipboard success and downloaded bytes equal canonical source including final newline, without trimming. Offline file rendering also matches. For each fallback attempt in each locale, runners wrote/read a fresh distinct non-source sentinel, then rejected automatic writeText, invoked the real Copy button, verified focused full textarea selection, dispatched Linux Control+C and read back canonical source exactly. No newline normalization was needed. Both locales passed, including repeated focused-suite attempts.

## Earlier review and closure

Only after cold-walk save, read specs/reviews/798-review-1-4a15ff20.md. Its accepted base is cc3d785f667dd8e20edf6c6f326e8aebc018e888, with no required open finding and optional **798-A1**. Also read the later copy repair request **798-COPY-R1**. Historical scores/receipts remain unchanged.

**798-COPY-R1 — closed against f1f2ef5f4dea85495b1f343e529e87e69b00685a.** Section: page-end workflow copy, both locales, 320 and 200% zoom. Reproduction of original request: open accepted base, switch zh/en and reach page end; its footer announced author self-check/pending independent review. Expected current candidate: remove that footer and unused `foot` key, preserve nearby simulation limitation, add no acceptance claim, retain neighboring layout/keyboard/state. Actual diff removes exactly the footer/key and updates the copy.js cache query to `798-copy-r1`; app.js, core.js, solution.py, python-code.js and style.css are byte-identical to base (hash receipts in copy-r1/results.json). All remaining copy pairs, including `sim`, equal base. New browser zh→en→zh check finds zero footer elements, absent old wording, preserved simulation paragraph, matching formulas and two-row trace/quiz state. No replacement approval text, missing-key errors, or orphan end spacing. Keyboard related links work. Relevant captures: copy-r1/roundtrip-1-zh-320.png, roundtrip-2-en-320.png, roundtrip-3-zh-320.png, end-zh-320-zoom1.png, end-en-320-zoom1.png, end-zh-1280-zoom2.png, end-en-1280-zoom2.png. Owner: lesson author; fix revision: reviewed candidate; reviewer recheck: passed; required status: closed. This closes the requested learner-copy correction under the existing bilingual/interaction requirements, not a publication step.

**798-A1 — optional minor advisory retained open.** At section 3, tiny [1,0,2], choose i=2,v=2 in either locale: its losing interval [1,2] is visible, while combined diff is [1,0,0,-1]. A per-entry endpoint ledger could show +1 at 1/−1 at 3 before combining with i=0's +1 at 0/−1 at 1. Existing endpoint and prefix explanations already establish why contributions cancel; the cold walkthrough reconstructed this without author notes. This is presentation friction, not a required missing causal bridge. Owner: lesson author; no fix requested for acceptance, no fix revision or closure claimed.

No new required defect reproduced. Required-open IDs: **none**.

## Scores and conclusion

| Dimension | Weight | Score (0–4) | Rationale |
| --- | ---: | ---: | --- |
| Problem/terms/hand calculation | 15 | 4 | Tiny ledger before abstraction; rotation, equality, index and smallest-k output explicit and manually checked. |
| Derivation/saved work | 20 | 3 | Baseline repeats n² work; losing arcs, excluded zero and endpoint savings are reconstructable. Combining individual events takes extra hand addition (798-A1). |
| Correctness/state | 20 | 4 | Active-interval invariant, after-event semantics, wrap/sentinel/ties and full scan justified; actual fresh Python states independently checked. |
| Interaction | 20 | 4 | Meaningful predict/reveal and hand/interval/scan controls; correct current/best pairs, state preservation and rewind/reset/endpoints. |
| Python/cost | 15 | 4 | Faithful canonical callable, exact transfer, execution/nonmutation, fresh counterexample and valid O(n) bounds. |
| Bilingual/device | 10 | 4 | Equivalent causal explanations and feedback, preserved mixed state, readable inspected layouts and keyboard/native copy access. |

Weighted score: **95/100**. Every dimension ≥3; no required open finding. **Accepted** for the specified candidate and reviewed scope. 798-COPY-R1 is independently closed; optional 798-A1 remains advisory.

Limitations: automated Chromium on Linux with emulated viewport widths and CSS zoom:2, not physical devices or browser-chrome zoom. Live official language selector was not operated; saved official Python snippet and normally accessed official statement establish the applicable interface. No real novice comprehension, successful LeetCode submission, public deployment verification or publication authorization is claimed. Only this report and this run's exclusive evidence directory were written.
