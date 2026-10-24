# Independent review: 407 — Trapping Rain Water II

Candidate: `9fe7b8340f7ac2a6b8fb49c778363a74967a1f07`. URL: http://127.0.0.1:18770/leetcode/407/. Review run: `407-review-1-a4a3f21a`; exact reviewer/model identity unavailable. Target: basic Python, lists, loops, functions and elementary recursion. Frozen rubric: `specs/leetcode-review-gates.md`, weights 15/20/20/20/15/10. Applicable language preference: faithful official Python first. No author/source/prior-review material was opened before this browser walkthrough. Browser: actual Chromium via Playwright, desktop 1365×1000.

## Cold walkthrough (saved before source audit)

| Step / question | Action | Observable result | Causal conclusion in my words |
|---|---|---|---|
| 0: What is the input/output, and how much fits? | Read nine-cell example, open calculation. | Rectangular integer ground, unit cell area, four-neighbor flow, open exterior; center 1, boundary 3. Reveal says surface 3, depth 2, boundary depth 0, total 2. | Depth measures the gap above ground, not height itself; a surface above 3 can escape. |
| 1: Can four straight walls determine retention? | Read turning route and baseline. | Four straight maxima are 5, yet the four low cells connect around a bend to boundary 2 and retain 1 each. Path includes starting cell; bottleneck is max ground; escape level minimizes across paths. Layer baseline searches outside-connected cells separately at each z. | One low bent escape route defeats straight-wall maxima. Layer scans repeat almost identical connectivity work; fixing one escape level per cell avoids that repetition. |
| 2: Why smallest frontier, and what changes per operation? | Advance tiny bowl once, then twice; inspect grid, frontier and history. | Round 1 removes (0,0), adds zero, center stays unknown. Round 2 removes (0,1), adds center L=3/W=2; fixed 9/9, removals 2/9, sum 2. History retains both rounds; center appears in frontier at 3. | Removal highlight is an operation marker; discovering a neighbor is what adds water. Its level is max(known path level, ground), not raw ground. A lower route cannot cross a frontier whose minimum is already at least the removed level. |
| 2 continued: Do turns actually propagate? | Select turning corridor and finish. | 25/25 removals, total 4. History starts outlet (2,4) at 2 → (2,3) → (2,2) → (1,2) → (1,1); all four low cells L=2/W=1. High neighbors get L=5/W=0. | Known path barriers propagate around bends while high ground raises its own propagated barrier. |
| 3: Does one outlet impose the same level everywhere? | Before reveal, select total 5: right zero needs 2; left zero must cross 3, so needs 3. Reveal. | Correct; visible explanation gives left depth 3, right depth 2, intermediate ground-3 depth 0. | Outlet height alone is insufficient: internal bottlenecks can separate retained levels. This is transfer beyond the earlier all-height-1 corridor. |
| 4: Which Python operation implements the picture? | Read displayed submission and explicit second-removal mapping. | `heappop` gives (3,0,1), center ground 1 adds 2, insertion is (3,1,1); seen is set before insertion. Cost text distinguishes submission O(mn) auxiliary space from snapshot O((mn)^2). | Each cell is counted once on discovery, including zero-depth cells; keeping effective level prevents later neighbors draining through fictitious raw-ground barriers. |

Cold screenshot: `407-evidence/407-review-1-a4a3f21a/cold-tiny-round2.png` (captured during the actual round-2 view). The UI supplies presets plus an outlet slider, not arbitrary matrix entry.

### Independent predictions saved before code checks

These are **code checks**, not custom-input browser experiments. Fresh input A: `[[6,6,6,6],[6,0,2,3],[6,6,6,6]]`: predict total 4, with interior levels 3 and 3 and depths 3 and 1. Counterexample B to “all interior cells use the lowest boundary height”: `[[7,7,7,7,7],[7,0,5,0,1],[7,7,7,7,7]]`: predict total 6, left depth 5, separating ground-5 depth 0, right depth 1. The left cell must cross 5 despite outlet 1. Flat/one-row/one-column/all-boundary grids predict zero. Maximum bowl predicts 198²×20000 = 784080000.

Source audit, checks, findings and scores follow below; no acceptance is asserted by this initial saved record.

## Candidate, official contract and source audit

`git rev-parse HEAD` returned exactly the requested revision. `git diff --name-only` was empty; status showed only this run's new report/evidence. The served bytes matched local `index.html`, `app.js`, `copy.js`, `core.js`, `python-code.js`, `solution.py` and `style.css`. SHA-256 identification:

| Asset | SHA-256 |
|---|---|
| index.html | bb025d801f93c026e560cb1cd34152cb6544d1e8a9193fc6822de26a6d472a0c |
| app.js | 50a238aa3693d1a1a83172bfe887f9e3afad4630297edcd6989a39b672970c2c |
| copy.js | 923eb2d6beb8eb3d4aad81d23ed77d35cb691ebe9e925bd67e4d6ce21e614927 |
| core.js | d68924979f74b4dd9a8d643dcb11eb5d9fe6e5c9520bb0c760926a72c533035e |
| python-code.js | 00f39fd9d890b282df4187e2c37f8b1da16148ee52d65f3ea5df5e27e050355f |
| solution.py | b6930ae8841eac5a6a84b96871e5afee35253ba53046b82473e5e010c3b16b3e |
| style.css | 9ca6c8976c04541bcf31326ab54dc13d897e1f7a24051d1a0b42976bdc9586ff |

Read the [official statement](https://leetcode.com/problems/trapping-rain-water-ii/) through normal web access: it supplies the unit-cell volume task, official outputs 4/10, nonempty rectangular dimensions 1…200 and heights 0…20000. No access bypass. Its readable page did not expose language-selector controls; lesson-local `provenance/official.json` includes Python3's exact `Solution.trapRainWater(self, heightMap: list[list[int]]) -> int` signature. Canonical source implements that interface, returning the original requested integer volume, with no conceptual analogy substituted. Python is the preferred language; there is no non-Python language contract to audit. No `supportedLanguages` contract omits a preferred option.

Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python maps to `solution.py`, `python-code.js`, `PYTHON_SOURCE`. The JS mirror is exactly the JSON-encoded canonical source. Browser display, successful copy, denied-copy textarea, downloaded bytes and directly fetched source all equal the canonical file, including whitespace. The loaded mirror remains usable offline. `app.js` explicitly distinguishes its separate JavaScript trace from executing Python; `core.js` uses the same four-neighbor order, boundary initialization and row/column tie-breaking. The frontier display sorts entries for readability and explicitly disclaims internal heap-array order.

The canonical implementation seeds each boundary once, marks seen at discovery, adds `max(0,level-ground)`, and pushes `max(level,ground)`. It never assigns into input rows. The grid displays the fixed level rather than raw heap ground; H remains unchanged and unknown L/W use `?`, not zero. Invariant: every discovered cell has its final minimum escape level, total equals the depths of discovered cells, and fixed-count equals removals plus frontier size. The frontier separates the still-unknown region from boundary routes; minimum-frontier expansion and the neighbor's ground jointly rule out a lower candidate. High ground raises the candidate even when it adds zero water. Every cell enters/leaves once; the finite heap empties after mn removals. Thin maps correctly consist entirely of seeds. Costs O(mn log(mn)) time and O(mn) auxiliary space describe this actual code; initial repeated pushes remain within that bound. Snapshot storage is correctly excluded and separately described as quadratic teaching overhead.

## Executed checks and independent observations

Tests were inspected before execution, including output paths and filesystem writes. All output was redirected to this run's exclusive evidence directory. No author evidence was regenerated. Commands run from repository root:

```
OUTPUT_DIR=specs/reviews/407-evidence/407-review-1-a4a3f21a python3 -B leetcode/407/tests/test_solution.py
OUTPUT_DIR=specs/reviews/407-evidence/407-review-1-a4a3f21a node leetcode/407/tests/browser.cjs
OUTPUT_DIR=specs/reviews/407-evidence/407-review-1-a4a3f21a node leetcode/407/tests/accessibility.cjs
python3 -B scripts/register_leetcode_lesson.py 407 --validate-only
```

All four exited 0. The preflight emitted no stdout/stderr. `lesson-entry.json` complexity is exactly the nonempty string `O(mn log(mn)) time; O(mn) auxiliary space`. No registration was run.

- Numerical rerun: actual canonical Python, 20,142 layer-oracle cases, including all 19,683 ternary 3×3 maps, 450 deterministic rectangles, official examples, slider heights and transfer exercise. Five larger/thin closed forms include the maximum bowl, flat and all-zero maps. Mutation checks passed. Trace checks inspected 202,344 frames, not just terminal sums: final levels on discovery, cumulative depths, unique frontier/removals, monotone removed levels, first-discovery adjacency and snapshot independence. Acorn duplicate-key detection and localization interpolation parity passed. These are computational checks, not claims of reader comprehension.
- Independently executed `solution.py` through its actual class callable on the two previously recorded fresh inputs: A returned 4; B returned 6, with inputs unchanged. Also independently checked 1×1 zero, single row, single column, two rows, two columns and flat 4×4, all returning predicted zero without mutation. No out-of-contract empty/ragged input requirement was imposed.
- Independently constructed an all-pairs minimax oracle (Floyd recurrence, separate from heap and layer flood), then checked every known level and cumulative water in the fresh examples' JS frames. A's middle-row levels were `[6,3,3,3]`, total 4, 13 frames. B's were `[7,5,5,1,1]`, total 6, 16 frames. This independently excludes the tempting lowest-outlet-only rule and checks intermediate state, rather than trusting trace/canonical agreement alone.
- Browser rerun: both locales × all six presets, every forward/back/forward round, exact restored terrain/progress/frontier, initial disabled undo/reset, terminal disabled advance/finish, reset and finish. Official final totals were 4/10. All gate heights 0…5 matched their expected totals. Choice changes hide the revealed reasoning; reveal supplies the right explanation for all three choices. Locale switching preserves preset, outlet, endpoint, chosen answer, revealed feedback and hand disclosure; resetting the trace preserves the independent exercise. No page errors, failed assets or external runtime requests were observed.
- Direct additional prediction experiment, announced before operating: outlet 2→0 should yield no water and low-cell levels 1. Changing the slider reset to 0/25 removals and 16/25 fixed seeds; finishing gave total 0. First history transition was outlet L=0 to ground 1, `max(0,1)=1`, depth 0. Restoring outlet 2 and finishing returned total 4. Changing the input therefore changes actual ground/path values, rather than only highlighting.
- Actual Chromium clipboard read/write passed; deliberately denied clipboard produced localized fallback text and a selected read-only field with exact source. Download and served source parity passed. Denied localStorage still allowed locale changes, and already-loaded source worked offline.
- Native Tab/Enter, slider Home/End/ArrowLeft, table ArrowRight, focus outlines, navigation anchors, forced colors and reduced motion were exercised. Narrow table ArrowRight produced nonzero horizontal scroll; direct settled right-edge inspection also verified row-header geometry (all row headings at x=34, width 28, sticky left 0). Wide tables disclose scrolling, retain row labels and keep H/L/W together. The first End-key capture moved the page to the footer; it was a capture/keyboard-scrolling artifact, not evidence of grid corruption. `independent-settled-en-320.png` is the subsequent settled table view.

## Bilingual, geometry and visual review

Read the full EN/中文 copy after the coldwalk. The route, bottleneck minimum/maximum explanation, first-discovery proof, cost and transfer exercise carry equivalent reasoning. Representative semantic binding is specifically algorithmic: tiny bowl second removal displays EN `Remove (0,1), L=3. Discover (1,1): max(3,1)=3; add W=3−1=2.` and 中文 `取出 (0,1)，L=3。 发现 (1,1)：max(3,1)=3，新增 W=3−1=2。` These messages are correctly separate from clipboard-fallback text. Correct and incorrect choices both reveal the 3+0+2=5 derivation in the appropriate locale. Source identifiers/comments remain canonical Python in both locales.

Captured browser renders cover both locales at 320/390/736/1440 px, 736×414 landscape and 200% CSS layout zoom at 1440×1000. Opened and inspected `trace-en-320.png`, `trace-zh-320.png`, `trace-en-1440.png`, `tiny-positive-en-390.png`, `corridor-complete-zh-390.png`, both `zoom200-*.png`, `prediction-zh-390.png`, `fallback-zh-320.png`, `landscape-zh-736.png`, both extra right-edge captures and the settled English table capture. The 390 tiny center visibly shows H=1/L=3/W=2 while the orange removed boundary shows W=0. Dense official/corridor grids keep numbers distinct; narrow status labels wrap and the table scrolls. Screenshot-edge truncation and sticky-nav capture positions are not evidence of text intersection. The settled views showed no required label/value collision. The fallback text wraps aggressively at 320 but its complete selected source is available and exact. Prediction controls and full Chinese causal feedback remain readable.

Measured rendered text contrast minimum was 6.4494:1 (including disabled undo/reset); body text 16.087:1. Disabled buttons use readable text rather than reduced opacity. Visible buttons/selects measured at least 48×48 px; focus and active/disabled states remain distinguishable. Page-wide overflow assertions were supplemented by the actual screenshots and component scrolling/geometry checks above.

## Findings and scores

No earlier review report for 407 was found in `specs/reviews` after the coldwalk; there are no inherited required findings to close. Required open IDs: **none**. No fix revision or closure is being inferred from an author's claim.

Minor friction, optional `407-O1`: in step 1 and step 4, the baseline uses set comprehensions/set subtraction, and canonical code uses tuple unpacking/heap tuples, beyond the stated reader's basic list/loop background. The prose and concrete second-removal mapping still make the algorithm reconstructable; a short syntax gloss would make literal code reading easier. Severity low; owner: lesson author; optional next action: explain those Python forms on a future revision. Status: optional, not a required correctness/causal gap.

| Dimension | Score | Weight | Rationale |
|---|---:|---:|---|
| Problem/terms/hand calculation | 4 | 15 | Concrete tiny bowl precedes abstraction; area, volume, heights/depths, four-neighbor flow, open boundary and indices are explicit. Reveal confirms 2 by hand. |
| Derivation/saved work | 4 | 20 | Bent route defeats straight walls; layer-search baseline identifies repeated connectivity work; max-extension bridge and lowest-frontier exclusion argument explain the optimization. |
| Correctness/state | 4 | 20 | Final-on-discovery invariant, frontier crossing proof, boundary seeds, duplicate avoidance and termination are reconstructable and match independently checked intermediate states. |
| Interaction/visual meaning | 4 | 20 | Round-2 before/after has unknown→L3/W2, distinct operation highlight, preserved values/history; reversible real outlet experiment, rewind, endpoints and prediction transfer all work. |
| Python/cost | 3 | 15 | Exact faithful executable source, transition mapping, fresh checks, input preservation and actual complexity pass; advanced Python syntax has the minor friction above. |
| Bilingual/device | 4 | 10 | Equivalent causal reasoning, correct semantic binding, preserved state, readable narrow/zoom renders, keyboard scrolling, contrast and exact fallback source verified. |

Weighted total: **96.25/100**. Every dimension is at least 3; zero required open findings.

## Limitations and conclusion

This is one independent automated-agent review of this revision, not measured novice learning, a human comprehension study, an actual LeetCode submission or publication approval. The browser was headless desktop Chromium; viewports emulate device sizes, not physical devices. The 200% check uses CSS layout zoom, not native browser-chrome zoom or an OS magnifier. Official statement access succeeded normally; the live language selector was not exposed in the readable official page, and the Python signature was cross-checked against saved lesson-local official evidence. Custom arbitrary grids were code checks because the UI is preset-only apart from its outlet slider.

**Accepted for the reviewed candidate and scope.** Browser walkthrough, canonical execution, parity, metadata preflight, bilingual/device observations and independent examples are complete. Implementation, author evidence, shared files, services and publication state were not changed. All new artifacts belong only to this report and `specs/reviews/407-evidence/407-review-1-a4a3f21a/`.
