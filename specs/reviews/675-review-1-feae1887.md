# Independent review of 675

Candidate: `c2e54cf8211dc0ca8ccff212e4863ecee2a8dd04`. URL: http://127.0.0.1:18782/leetcode/675/. Review date: 2026-10-25. Fresh review run; no author materials or earlier reviews read before this cold walkthrough. Exact reviewer/model identity unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen weights: 15/20/20/20/15/10; faithful Python is the applicable canonical-language interpretation.

## Cold browser walkthrough — saved before source audit

Read only the frozen rubric, then opened Chromium through Playwright at 1280×900. The following observations came from rendered content and operations, including the user-facing code disclosure, not implementation files.

| Step and question | Action | Observable result | Causal conclusion in my words |
|---|---|---|---|
| 1: Why walk past a taller tree? | Worked out [1,3,2], then opened “Show the three-move route”. | Columns 0→1→2 (cut 2)→1 (cut 3); lower bounds 2 and 1 are shown. | Crossing a tree is permitted without cutting it. Moves count edges, not cuts; the answer is 3. Inputs, zero-based coordinates, walls and four directions are defined before abstraction. |
| 2: Why add shortest legs? | Read the fixed-leg argument and manually followed the wall example. | Cutting preserves positive-cell walkability; fixed endpoints yield a lower bound, attained by concatenation. Wall example requires 6 then 4, total 10. Floyd–Warshall recurrence and its cubic cost are introduced. | Earlier routing cannot improve a later map, because the map never changes. Coordinate differences ignore walls. Computing all pairs wastes distances we never ask for. The baseline is a substantial jump in notation, but its variables and graph interpretation are explained. |
| 3: Why is each distance shortest? | Advanced [1,3,2] twice. Changed to detour preset and advanced layer by layer 0 through 6; went to end, then back once. | Tiny map shows d=0,1,2 and F/T markers; no ledger entries until cutting. Detour layers successively run down and around the wall; target still undiscovered at d=2, discovered at d=6. End frame 13/13 has 6+4=10 and two ledger entries. Back to 12/13 removes the second cut and restores total 6, while retaining first-leg history. | Each unseen positive neighbor receives predecessor distance +1. FIFO layers exclude a shorter unseen path. Per-leg distances reset, while completed cuts and cumulative walking total persist. Original heights are data; F/T/× annotate frontier, target and completed cuts. |
| 4: Can the idea transfer? | Independently computed exercise [[1,5,2],[0,0,3]] as 2+1+2=5 before selecting 5 and revealing. | Correct feedback gives that route and explains 3 and 7 as wrong choices. | Visiting 5 early does not cut it; returning after 3 is necessary. The new geometry requires applying the rule rather than recalling the first answer. |
| 5: How does it become Python? | Opened complete solution disclosure and read the rendered mapping and costs. | Official-interface `Solution.cutOffTree` uses sorted targets, deque, seen-on-enqueue and an outer total. Text distinguishes dequeue termination from the simulation’s discovery layer. States O(Tmn+T log T) time and O(mn+T) auxiliary space, and preservation of input. | The visible start-to-distance-1 transition maps to appending a legal unseen neighbor with steps+1. Each cell is discovered at most once per leg; T fresh searches and sorting explain cost. A × does not imply Python mutation. |

Cold screenshots: `675-evidence/675-review-1-feae1887/cold-desktop.png`, `cold-detour.png`. They were captured in the real browser; visual inspection follows below. The UI offers presets only, so independently chosen custom inputs below are **code checks**, not UI experiments.

### Predictions recorded before independent execution

Fresh small input: `[[1,4],[2,3]]`. Predict 4: down to 2 (1), right to 3 (1), up to 4 (1) actually totals **3**; corrected hand calculation before execution: 1+1+1=3. No return to start is required. Input must remain unchanged.

Fresh counterexample to Manhattan-only distances: `[[1,0,2],[1,1,1]]`. Predict **4**, walking down/right/right/up; coordinate distance 2 is impossible through the wall. Fresh unreachable variant `[[1,0,2],[1,0,1]]`: predict **-1**. Single-cell `[[9]]`: predict **0**; blocked start `[[0,2]]`: predict **-1**. These predictions precede source audit and execution.

## Post-cold audit

### Candidate identity and official contract

`git rev-parse HEAD` equals the requested revision. `git status --short` showed only this report and its exclusive evidence directory as untracked; no candidate changes were made. HTTP-served bytes equaled checkout bytes for all seven local runtime/source files. SHA-256 receipts:

| File | SHA-256 |
|---|---|
| index.html | ce4a2617a25ccb7fdc8e4cddeee83226d6a3b25a2737f72f7d3046200f75b261 |
| app.js | e3b69957fc701a44965e51462459b5ab5ac75c74898dbe898b68b000801f70a7 |
| core.js | 74e6427739bc4c79ad48ad6a2046351c3acc3ee1ce74e90182b7549b6b5913ed |
| copy.js | 1684a911361ee78a0227233a4740d1da952092dcb772a4107616db7aa761a1fe |
| style.css | 6bbb99a45b0d58725b204587a48a6984f285ebd862eb032cb15ddb00ac4f7605 |
| python-code.js | 83694248553f0188ca2f8a93a7ee380abbf956f2a191f2f8b8f0342d48ced3cd |
| solution.py | e1d11de493ddaf7750324264beb673c9bdd8d0ba3338573f4bd61066e3255f5b |

Read the [official statement](https://leetcode.com/problems/cut-off-trees-for-golf-event/) normally using browser web access after saving the cold walkthrough. It confirms four-way movement, walkable uncut trees, ascending distinct heights, start (0,0), zero-cost cutting, at least one tree, 1≤m,n≤50, values 0..10^9, and examples 6/-1/6. No access restriction was bypassed. Inspected lesson-local `provenance/official.json`: saved Python3 selector snippet has exactly `Solution.cutOffTree(self, forest: list[list[int]]) -> int`. Canonical source matches that callable, with an added deque import. The fetched statement did not expose a live language selector; the saved selector evidence supports the Python interface. No non-Python exception or language-contract.json is needed. Read LANGUAGE_FILES in `scripts/register_leetcode_lesson.py`: Python maps to `solution.py`, `python-code.js`, `PYTHON_SOURCE`.

### Source, independently chosen cases, invariants and costs

Executed the actual canonical Python through `runpy.run_path`, not the browser trace. Results for the pre-recorded independent inputs were 3, 4, -1, 0, -1 respectively, with exact input preservation. Additional single-column `[[1],[1000000000]]` returns 1; a 50-cell open row ending in tree 2 returns 49. All passed. The fresh detour excludes the tempting coordinate-distance answer 2 because (0,1) is blocked.

Independently read the implementation: all positive heights remain walkable; sorting fixes each next endpoint. `seen` is populated before enqueue, so a cell enters once per BFS. FIFO distances increase by one; an already-discovered node cannot receive a shorter later path. A target at the start returns 0 on its first dequeue. Queue exhaustion returns -1, immediately propagated rather than added. Each next leg starts at the preceding target, independent of the path used. No mutation is required because cutting does not change connectivity. The lower-bound/attainment proof in both locales is valid. `total_before + leg_distance = total_after` and ledger length = cut count hold. Snapshots deep-copy state, enabling correct rewind.

Concrete visual-to-code correspondence: tiny frame 0 has (0,0) distance 0; advancing produces (0,1) distance 1 via the positive, in-bounds, unseen check, `seen.add`, and `queue.append((nr,nc,steps+1))`. Detour frame 6/13 shows target distance 6 with completed total 0; the next cut adds 6 to the ledger. At final 13/13, ledger 6+4=10 agrees with the answer. Rewind to 12/13 retains the first ledger row and restores total 6, with the last target uncut. The Python returns on dequeue while the trace groups an entire discovery layer; this difference is explicitly explained, so the simulation is faithful at the stated boundary.

Canonical auxiliary memory is O(mn+T), with queue and seen bounded by the grid and a sorted T-tree list. Time O(mn + T log T + Tmn), simplified to O(Tmn+T log T) since T≥1 officially. The stated ~6.25 million dequeues and 25 million neighbor checks are valid upper bounds at 2500 cells/trees, not runtime measurements. Baseline Floyd code is valid for legal inputs, O(V³)/O(V²); the lesson explains both the unchanged-map reduction and the avoided unnecessary all-pairs distances. Minor teaching friction: the Floyd recurrence arrives in a dense paragraph without a numerical intermediate-k update; the tiny endpoint example and subsequent BFS layers still make the essential derivation reconstructable.

### Inspected tests and executed commands

Read README and each test before running. Did not run `build_copy.py`, registration, or any service command. Result emitters were redirected into this run's directory, keeping tracked candidate/author evidence untouched. Commands from repository root:

- `OUT_DIR="$PWD/specs/reviews/675-evidence/675-review-1-feae1887/rerun" python3 -B leetcode/675/tests/test_solution.py` — exit 0. 649 small cases compare canonical Python and actual HTML baseline with a full (position, cutting-progress) oracle; official outputs 6/-1/6; maximum 50×50 row-major 4900 and shuffled 83665. Exact mirror, raw duplicate-key detection, 83 two-string locale pairs and author-helper dictionary AST checks pass.
- Same OUT_DIR with `node leetcode/675/tests/test_core.cjs` — exit 0. 6025 snapshots checked against independently generated Floyd distances, including each discovered value, frontier depth, every ledger entry, cumulative sum, deep-copy isolation and input preservation. All six preset totals independently agree: 3,10,-1,0,9,-1.
- Same OUT_DIR with `node leetcode/675/tests/browser.cjs` — exit 0. Both locales, every frame of every preset, backward/replay/reset/endpoints, prediction lifecycle, parity and layout checks pass. Its renderer checks use core snapshots, so those alone are not independent algorithm evidence; the preceding global-state/Floyd checks and hand checks supply that independence. The test's layout assertions miss the selected-label defect below.
- `OUT_DIR="$PWD/specs/reviews/675-evidence/675-review-1-feae1887/focused" node leetcode/675/tests/focused.cjs` — exit 0. Prediction before/incorrect reveal/change/correct reveal, zoomed header and contextual keyboard focus checks pass.
- **`python3 -B scripts/register_leetcode_lesson.py 675 --validate-only` — exit 0, no stdout/stderr.** Metadata complexity is exactly one nonempty string, `O(Tmn + T log T) time; O(mn + T) auxiliary space`. This was validation only.

Generated JSONs retain the tests' original “author self-check” labels. Here they are independently rerun computational evidence, not author score claims or novice-comprehension measurements. No previous report for 675 was present besides this new report; no earlier findings were closed.

### Browser behavior, localization and visual inspection

Environment: Linux, headless real Chromium 156.0.8078.4, Playwright found through NODE_PATH, executablePath taken from PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. Captured screenshots were actually opened and inspected using the image viewer. Inspected cold desktop, narrow trace views, selected-control detail/context, prediction feedback, fallback, keyboard context, zoom grid and header captures. The evidence lives exclusively under `675-evidence/675-review-1-feae1887/`.

- In both locales, the detour at frame 6/13 means target height 2 at (0,2), distance layer 6, one frontier cell, completed total 0. Chinese rendered “已完成距离 6 层…已完成路段的行走总数：0 步”; English gives the equivalent complete quantities. Grid cell 2 shows d6 and F T, not a cut. Original heights stay visible after × is added, and the legend explains their separate meanings.
- Independently inspected multiple-legs frame 13/14 in both languages: target 4 at (0,1), layer 3, two frontier cells, total 6; ledger legs are 2 and 4. The following cut gives final 9. Both languages retain the same operands, target identity and accounting scope. No state/value collision was observed.
- Wrong prediction 3 reveals the actual 2+1+2=5 route and causal error in both languages. Selecting 5 after a reveal clears old feedback before checking. All 3/5/7 choices, reset disabling reveal, locale switches retaining selection/feedback, and trace-input changes preserving the explicitly independent exercise passed. Formula rendering uses complete paired strings with no duplicate definitions detected.
- All forward/back/replay/reset/end states passed. Initial Back is disabled; terminal Next and End are disabled; blocked-start preset is already terminal. Keyboard Enter advances, Tab moves to Reset; focus outline is 3px and visible in context. Forced-colors focus, denied-storage startup, offline source availability and local link targets passed. No console errors, bad assets or external runtime requests were observed.
- Browser layout matrix covered both locales at 320/390/736/1440px. Inspected intermediate grids retain numeric distances, walls and marker associations; buttons reflow. 200% testing used CSS `zoom:2` at 320/390/1440px in real Chromium, including header captures. No page-wide or grid-cell overflow was detected, but the native select clips its text at 320px as recorded below. Horizontal step navigation is a scrollable component; screenshot edge truncation there is not a text-collision finding.
- Measured rendered contrast ratios: body 16.09, explanatory text 12.62, muted hints 7.74, grid text 13.40, disabled text 6.45, primary text 13.10. Disabled controls remain readable and visibly distinct. Borders/focus exceed 3:1. Screenshots support these checks rather than substitute for interaction/semantic inspection.
- Exact source equality includes final newline and indentation: canonical bytes, decoded offline mirror, rendered `textContent`, window export, successful clipboard write/read and downloaded bytes. Fallback test seeded a distinct non-source sentinel, forced write failure, verified textarea focus and selection 0..source.length, dispatched Linux **Control+C**, then read the actual clipboard back equal to canonical source. No whitespace normalization or test-written source clipboard substitution was used.

## Required finding

### 675-R1-01 — selected English preset labels clip at 320px

**Status: open. Severity: medium, required.** Problem 675, candidate `c2e54cf8211dc0ca8ccff212e4863ecee2a8dd04`, step 3 / “Distance layers”, English, Linux Chromium 156.0.8078.4, 320×1000 CSS px at 100%.

Reproduce: load lesson; select “Official example 2 · unreachable” or “Multiple legs & revisits · 9 moves”; scroll until the closed select is fully visible. Also select the latter, switch EN→中→EN, and revisit the closed control. Expected: complete selected label, keeping the count and “moves” scope together, with the native arrow unobstructed. Actual: example 2 visibly stops after “Official example 2 ·”, with clipped remnants of its wrapped second line; multiple-legs stops after “9”, omitting “moves”. The full duplicate label below remains readable, mitigating but not removing the selected-control defect.

Concrete geometry: select x=29, y=150.28125, width=262, height=48, clientWidth=260; left/right padding 15px each. CSS font is `16px "PingFang SC", "Microsoft YaHei", system-ui, sans-serif` (exact resolved font not independently identified). Canvas measurement using that computed font: 240.320px for example 2 and 243.808px for multiple-legs, exceeding the 230px inner content width even before native arrow room. Native arrow remains visibly inside the right side. `white-space:normal` permits wrapping while the native control's fixed height clips the second line. This finding relies on visible clipping, not overlapping container boxes or page overflow.

Evidence: [example 2 settled context](675-evidence/675-review-1-feae1887/en320-select-2.png), [multiple-legs control detail](675-evidence/675-review-1-feae1887/en320-select-4-detail.png), [locale-roundtrip reproduction](675-evidence/675-review-1-feae1887/en320-select-roundtrip.png). At 390px the select is 296px wide and the full label fits: [comparison](675-evidence/675-review-1-feae1887/en390-select.png). Chinese at 320px remains readable: [comparison](675-evidence/675-review-1-feae1887/zh-selected320.png).

Violated requirements: frozen rubric bilingual/device readability, plus rendered-state contract §8 requiring the complete closed selected label and number/scope together. Owner/next action: lesson author should shorten labels while preserving scope or provide a local layout that fits the actual native control. Fix revision: none reviewed. Regression needed: unchanged reproductions at 320px on this environment, both locales and roundtrip, plus 390px and zoom, with inspected settled screenshots and measured text space. No candidate repair was made; finding cannot be closed against this revision.

## Scores and decision

| Dimension | Weight | Score /4 | Observation and rationale |
|---|---:|---:|---|
| Problem/terms/hand calculation | 15 | 4 | Tiny three-move walk precedes abstraction; move/cut units, coordinates and walkability are explicit. |
| Causal derivation/saved work | 20 | 3 | Valid fixed-leg lower bound and attaining construction; wall counterexample and avoided all-pairs work explained. Dense Floyd notation causes minor friction for the target reader. |
| Maintained state/correctness | 20 | 4 | BFS invariant and contradiction proof, every layer, ledger accounting, boundaries and termination reconstruct correctly; canonical/global-state checks agree. |
| Interaction/visual meaning | 20 | 4 | Predict/reveal/change, full rewind/replay and endpoints work; distances, cuts and completed totals retain separate meanings. |
| Python/cost | 15 | 4 | Actual canonical execution, fresh inputs, faithful interface, exact source transfer, no mutation and justified time/space. |
| Bilingual/device access | 10 | 3 | Equivalent causal explanations, readable grid/disabled/focus states and responsive controls; selected-label clipping at 320px remains a required local defect. |

Weighted total: **92.5/100**. Outcome: **changes_required** because **675-R1-01 remains open**, regardless of the passing numerical score and automated checks. This is an independent review of this candidate, separate from publication.

Limitations: no real human teach-back or measured learner comprehension, no LeetCode submission, no physical-device or assistive-technology hardware test. Zoom evidence is CSS layout zoom, not browser-chrome zoom. Live selector was not independently available in the fetched official statement; local saved selector evidence was inspected. No cross-platform font claim is made. These limits do not erase the directly reproduced required defect.
