# Independent review: 968 Binary Tree Cameras

Candidate: `fe87684237ab7c00f0b6c08692b9187691be8d3c`. URL: http://127.0.0.1:18791/leetcode/968/. Target: basic Python, lists, loops, functions, elementary recursion. Review run: exact report identifier 968-review-1-1fe9cf12; no invented reviewer/model identity. Frozen weights: 15,20,20,20,15,10. Interpretation frozen before opening: faithful Python preferred; all six dimensions require observed causal and executable evidence.

## Cold walkthrough (saved before source, tests, briefs or earlier reviews)

Only the frozen rubric was read before opening Chromium through Playwright. Initial desktop: 1280×900. Screenshots: `968-evidence/968-review-1-1fe9cf12/cold-initial.png`, `cold-completed.png`. Browser text was read in full, including all five teaching sections.

| Step/question | Action | Observable result | My causal paraphrase |
|---|---|---|---|
| 1. What is covered, and why does placement matter? | Read definition and constraints, toggle only A, remove A, toggle only B on the fixed A→B→C tree. | A: 1 camera, 2/3 covered, C missed. Empty: 0/3. B: 1 camera, 3/3 covered. | Coverage spans one edge only. Moving to B combines both incident edges. Zero cameras cannot cover a nonempty tree, so one is optimal. Letters are identities, not the zero-valued input. |
| 2. What information survives a subtree, and what work is saved? | Read baseline, three states, fork example and exchange argument before using the trace. | Baseline enumerates 2ⁿ subsets and checks n nodes. N/K/C distinguish waiting from supplying a camera; missing children are C. N takes priority over K. | All strict descendants are covered at return; only the subtree root may need help. A covered child cannot necessarily cover its parent. Resolving a deepest demand at its parent shares coverage without sacrificing deeper unresolved demands; this avoids subset enumeration. Root demand needs its own repair. The downward greedy A then C is a concrete wrong-rule example. |
| 3a. What happens at the first leaf? | Predict C returns N from absent children, press Next. | C:N, 1/4 decisions, 0 cameras, explicit C,C→N ledger. | No child supplies coverage; C delegates to its parent. Question marks denote unprocessed nodes. |
| 3b. Does the second leaf change the parent yet? | Press Next. | D:N, C:N retained, B still ?, 2/4, 0 cameras. | Both child results are available before B decides. |
| 3c. Why put the camera at B? | Predict one camera resolves both leaves, press Next. | B:K; C:N and D:N retained; 3/4, count 1; ledger N,N→K. | One installation satisfies both immediate child demands. Historical N does not mean they remain uncovered now. |
| 3d. What does A return; is the answer final? | Press Next, Previous, Complete. | A:C, count 1, positions B, all covered; Previous restores A:? and incomplete status while keeping B's camera; Complete restores final frame. | A receives K and absent C, so needs no camera. Rewind reconstructs the prior snapshot rather than deleting arbitrary data. |
| 4. Can I transfer to a fresh chain? | Before reveal predicted 3 for seven nodes: F, C, root A. Select “3 cameras” (radio value 2), Reveal. | Correct; G=N,F=K,E=C,D=N,C=K,B=C,A=N, root repair A; two cameras cover at most six chain nodes. | Repeated bottom-up triples leave one root demand. The lower bound independently rules out two. |
| 5. How does this become executable Python and what does it cost? | Read code/interface and stack explanation, open solution disclosure. | Official `Solution.minCameraCover(root)` interface described; two visits, states dictionary and root repair; O(n) time/O(n) space; no mutation; explicit stack avoids depth failures. | At B's second pop, both child states equal NEED, so increment count and store CAMERA. Each node is scheduled twice, not exponentially. Actual source and executable parity remain to audit after this saved walk. |

Independent pre-execution predictions: a five-node chain needs 2 (D and A from the leaf end); root A with left leaf B and right child C containing leaf D needs 2. In the latter, C=K cannot cover sibling B=N across two edges, so a tempting “K first means C” rule fails. The UI offers presets only; these independently chosen inputs will be **code checks**, not claimed custom UI experiments. At this point their executions have not been inspected.

Cold observation: tiny placement activity precedes named abstraction; definitions of parent/subtree/leaf/postorder and actual child return values make the optimization reconstructable. The exchange paragraph is denser than the hand example, but can be reconstructed using the deepest unresolved demand. No author notes were used to fill an explanation.

## Post-cold audit

### Candidate identity and official contract

`git rev-parse HEAD` returned the requested revision. `git status --short` showed only this report and its evidence directory as new files. HTTP response bytes for index.html, core.js, app.js, copy.js, solution.py, python-code.js and style.css exactly matched the checkout. Selected SHA-256 receipts:

- index.html: `372bb4f2f283eaa9ce5968c5331e199f9a93d48007954b32d69b4c17facbb596`
- app.js: `1b70bd1d9bcf2fa6be0a68e95fbc3225ac1a1f223a64b4daf4388eb148d687cf`
- solution.py: `b7428a60e1ab3b6f6180a8b8f4201b03d34e7a39857dd4091f62e85ffd7f9f31`
- style.css: `6b892cfb65e17a892c308c1a00eaffea91c7e1c93cab7f24ab6d2df7e30f6d49`

Read the [official statement](https://leetcode.com/problems/binary-tree-cameras/) normally through the web reader: root object input, minimum integer output, immediate adjacency coverage, examples 1 and 2, 1–1000 nodes, values zero. A separate normal Chromium visit encountered “Just a moment… Performing security verification”; no challenge was bypassed. The readable official statement supplies independent statement evidence. Lesson-local `tests/evidence/official-graphql.json` was inspected afterward as saved author evidence: its response identifies 968 and contains Python3's exact `Solution.minCameraCover(self, root: TreeNode | None) -> int` interface and TreeNode members. The canonical code uses that callable and object semantics. No non-Python fallback or language contract is applicable; faithful Python is present. Saved author evidence is corroboration, not an independently observed selector interaction.

Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python means solution.py, python-code.js, PYTHON_SOURCE. Read canonical implementation, offline mirror, HTML baseline, core, app, localization consumer and copy, styles, test source and test instructions only after saving the cold walk. No earlier 968 review report was present in the repository file search; no earlier finding is claimed closed. The rendered-state supplement was first read after the cold walk.

### Algorithm, intermediate invariants and executable transfer

The baseline actually enumerates masks and unions parent/immediate-child neighbors. Binary degree bounds each update; enumerating all n candidate positions per mask explains its stated O(n·2ⁿ) time and O(n) working storage. The optimized source reads tree links and stores summaries in a dictionary; no node attribute is assigned. Its explicit `(node, visited)` stack orders left, right, then parent by pushing parent revisit, right, left. At B's revisit in example 1, `left == NEED or right == NEED` sets CAMERA and increments 0→1; A then takes the CAMERA-child branch and stores COVERED. Root repair increments the count only if its stored state is NEED. The trace explicitly turns root N into K for the repair frame; canonical code need only increment the returned count, since states is local and never returned.

Every completed subtree has covered strict descendants; N alone permits its root to wait. Missing children are C with no physical camera. Children K,N require a parent camera even though one child supplies coverage: sibling distance is two. Boundaries terminate because each finite node is expanded once and revisited once. There are O(n) dictionary entries and at most O(n) pending tasks; ordinary dictionary access gives O(n) time and O(n) auxiliary space. Maximum chains do not consume Python call depth. Small teaching snapshots deliberately cost O(n²), clearly distinguished from canonical storage.

**Independent code checks, predicted before execution:** executed the actual solution.py with a supplied identity-hashable TreeNode, using `runpy.run_path`, and independently enumerated camera combinations and undirected edge coverage. Five-node chain: canonical 2, oracle 2; optimal placements by root-first index include (0,3), (1,3), (1,4), validating predicted A,D. Mixed fork A→B and A→C→D: canonical 2, oracle 2; (A,C) is optimal. Its child returns are B=N,C=K, exposing the incorrect K-before-N rule, which would leave B uncovered and return 1. Values, links and identities were unchanged. Independently executed singleton=1 and defensive empty=0. Empty is explicitly outside official constraints.

### Tests inspected before execution

All test output producers were inspected for their destination before running. Set `LESSON_EVIDENCE_DIR=specs/reviews/968-evidence/968-review-1-1fe9cf12` for each supplied test; no tracked candidate assets or earlier evidence were regenerated. JSON produced by supplied tests retains their literal “author self-check” label; the following are independently rerun checks, not a claim that their labels establish independent teaching review.

| Command (with the evidence environment above) | Observed result |
|---|---|
| `python3 -B leetcode/968/tests/test_solution.py` | Exit 0: actual canonical source agrees with independent set-cover oracle for all 2,056 binary shapes through n=8 including empty, 160 seeded cases; both 1,000-node chain directions return 334; official fixtures return 1,2; no link/value mutation. |
| `node leetcode/968/tests/test_core.cjs` | Exit 0: 630 cases, 4,931 frames; camera identities/counts, child operands, descendant coverage and final coverage checked against an independent subset oracle; exact mirror parity; unique bilingual keys and two-string shape. |
| `node leetcode/968/tests/browser.cjs` | Exit 0: both locales, all presets, every endpoint/rewind/reset, prediction changes, source transfers, desktop/mobile/zoom, keyboard/focus and storage denial. Zero captured console/page/HTTP errors; all lesson requests local. |
| `node leetcode/968/tests/offline.cjs` | Exit 0: file URL exact displayed source and 320px selected-label budget in both languages. |
| `node leetcode/968/tests/capture_focus.cjs` | Exit 0: focused screenshots; actual ArrowRight scroll of focusable tree viewport. |
| `python3 -B scripts/register_leetcode_lesson.py 968 --validate-only` (repository root) | Exit 0, no output. Metadata complexity is exactly the single nonempty string `O(n) time; O(n) auxiliary space`. No registration was run. |

Supplied browser checks verify final counts 1,2,1,2,2 against corresponding labels. Independently read their completed ledgers: default C:N,D:N,B:K,A:C with count 1; example 2 E:N,D:K,C:C,B:N,A:K count 2; singleton N then repair; chain4 D:N,C:K,B:C,A:N then repair; full tree leaves N, B/C cameras, A covered. No historical N is incorrectly treated as current uncovered status, and incomplete counts are labeled nonfinal.

### Interaction, localization, source transfer and access

Both language copies were read for state meanings, exchange proof, stack mapping, cost, boundaries, prediction and feedback. Actual rendered ledgers bind N to waiting, K to installation, C to child-camera coverage and root repair to N→K in both locales; no missing operands or stale translations were observed. The three prediction choices invalidate feedback on change and reveal matching seven-node reasoning; switching the tree preserves this separate exercise as promised. The supplied browser roundtrip preserves selection and revealed feedback. Additional zh→en→zh at width 320 preserved B:K and 3/4 decisions, and rendered exact headings `#968 · 监控二叉树` / `#968 · Binary Tree Cameras` with matching document titles. Camera toggles preserve the tree and accurately recompute coverage. Rewind/replay restores snapshots and ledger prefixes; endpoints disable the appropriate controls.

Embedded mirror, displayed `textContent`, automatic clipboard, manual fallback and downloaded bytes match canonical source **without trim or newline normalization**, in both locales. Fallback tests on this Linux host seed and read back a fresh distinct sentinel before each locale attempt, deny automatic writes, activate the real Copy control, verify textarea focus and entire selection, dispatch Control+C and read back exact source. Downloads are retained in this run's directory. Offline file URL source also matches.

Desktop, 320px and 390px layouts and 200% CSS zoom were exercised in real headless Chromium using NODE_PATH's Playwright and the supplied executablePath. Both locales reflow readable prose, ledger operands/counts, feedback and controls without page overflow. The 500px diagram uses a labeled, focusable horizontal viewport; independent ArrowRight moved scrollLeft 0→40 (maximum 216 at width 320), and right-side capture shows its other nodes. This is deliberate component scrolling, not clipped inaccessible content. At width 320, preset clientWidth=284, 15px padding each side; longest observed Chinese label measured 206.784px against the frozen test budget 232px. English maximum 136.272px. Font stack is `"PingFang SC", "Microsoft YaHei", system-ui, sans-serif`; exact resolved font is not asserted. Closed selected labels were inspected in screenshots.

Keyboard Enter advances a decision, Tab reaches Reset, focus outline is solid 3px; native select and radio controls are available. Disabled Previous at reset computes text rgb(154,167,184), background rgb(28,35,48), opacity 1: readable rather than faded out. Palette contrast helper from the actual browser test was extracted and calibrated: black=0, white=1, primaries .2126/.7152/.0722, black:white=21, #747474:black=4.492948073111701 (fails 4.5). Actual muted-on-panel2 ratio is 6.4494, normal text 13.3971, accent 10.9101, orange 8.9372. These are solid-color checks, not an assertion of universal contrast coverage. Forced colors, reduced motion and blocked storage checks pass.

Related links exist and were followed/read: #124 step2 teaches children-before-parent summaries with separate through/g values; #42 step1 explains how a known opposite bound permits local water settlement. Their labels truthfully describe those destinations. The local #step2 link revisits the coverage-demand derivation. Destination revision/publication status is outside this review; locally served sections were read, not merely their HTTP status.

Screenshots were captured **and inspected**, including cold-completed, en-current-camera, en-two-cameras-current, zh-trace-320, zh-ledger-320-final, en-settled-390-final, zh-tree-right-390, en/zh-exercise-zoom200 and en/zh-zoom-feedback-final. The full-page capture can place sticky navigation across a section during capture; this is not reported as a collision. Settled viewport captures establish the actual current-marker defect below. No text intersection defect was inferred merely from overlapping boxes.

## Required finding

### 968-R1 — Current-node highlight disappears on camera decisions

- **Status:** open, required. **Severity:** medium; contradictory teaching visual, not numerical algorithm failure. Candidate: fe87684237ab7c00f0b6c08692b9187691be8d3c. Section 3; both en and zh; reproduced at desktop 1280×900 and preserved across the width-320 locale roundtrip.
- **Reproduction:** open lesson, select Full tree (preset value 4), reset if necessary, press Process next node six times. The progress reads 6/7, camera count 2. B:K was processed earlier, C:K is the current sixth decision. Alternatively, default tree after three Next operations exhibits the missing orange B marker.
- **Expected:** the visible legend promises “A thick orange outline marks the node just processed” (Chinese equivalent present). C must retain an identifiable current marker distinct from the already installed B camera; camera identity and current operation must remain independently visible.
- **Actual:** both B and C have identical cyan 3px circle outlines; there is no orange current-node mark. Computed style for older B and current C is rgb(110,231,255), strokeWidth 3px. By comparison, first leaf decision computes orange rgb(255,180,84), 4px. The current C element has both `current` and `camera` classes. In lesson style.css the later `#tree .camera circle` rule overrides `#tree .current circle` for stroke and width. The ledger remains correct but cannot make the promised diagram marking truthful.
- **Evidence:** [English settled reproduction](968-evidence/968-review-1-1fe9cf12/en-two-cameras-current.png), [Chinese reproduction](968-evidence/968-review-1-1fe9cf12/zh-two-cameras-current.png), [default tree B installation](968-evidence/968-review-1-1fe9cf12/en-current-camera.png). The settled full-tree image includes the explicit legend and both visually identical camera nodes. This is independent of sticky/capture placement.
- **Violated requirement:** frozen rubric interaction/visual meaning; distinguish maintained data from highlighting; contradictory visuals are required fixes regardless of score. Rendered-state contract likewise requires highlight meaning to match the represented operation.
- **Owner/next action:** lesson maintainer should retain a separate current-node indicator when the node also has a camera and add a rendered regression covering an older camera alongside the current camera and root repair. Verify rewind/replay and both locales. **Fix revision:** none. **Regression/closure:** not performed; fresh candidate review required. Frozen implementation was not changed.

## Scores and conclusion

| Dimension | Score /4 | Weight | Weighted | Observational rationale |
|---|---:|---:|---:|---|
| Problem/terms/hand calculation | 4 | 15 | 15 | One-edge coverage, input/output/constraints/identities and the A-versus-B experiment establish a manually provable minimum before abstraction. |
| Derivation/saved work | 4 | 20 | 20 | Exponential baseline, fork sharing, failure of downward greedy, three summaries and deepest-demand exchange explain saved work and excluded cases. |
| Maintained state/correctness | 4 | 20 | 20 | Concrete child/sibling/return sequence, invariant, N-before-K, absent children, root repair and final coverage independently reconstructed and executed. |
| Interaction/visual meaning | 3 | 20 | 15 | Trace history, predictions, preserved exercise and rewind are reconstructable; required current-marker contradiction 968-R1 prevents full clarity. |
| Python/cost | 4 | 15 | 15 | Faithful executable Python, concrete branch mapping, fresh oracle examples, 1000-node boundaries, no mutation, accurate separated costs and exact source transfer. |
| Bilingual/device | 4 | 10 | 10 | Equivalent rendered reasoning, state-preserving language roundtrip, readable narrow ledger/controls, keyboard diagram scroll, 200% reflow and calibrated palette evidence. |
| **Total** | | **100** | **95** | Score threshold met; required-finding gate not met. |

**Conclusion: changes_required. Required open IDs: 968-R1.** No acceptance or publication approval is issued despite passing executable tests and a 95/100 score.

Limitations: review uses headless Chromium on Linux, emulated widths and CSS zoom, not physical phones or measured novice comprehension. No successful LeetCode submission is claimed. Official live browser selector access was challenged; the statement was independently readable via the web reader and saved Python interface evidence was inspected. Two reviewer scratch-driver attempts timed out due to harness mistakes (asking for nonexistent radio value 3 rather than displayed choice index 2; later trying to click already-disabled Complete on a preserved endpoint). Corrected runs exercised the intended actions; those timeouts are not candidate failures. Supplied tests pass but omit the CSS current/camera interaction that 968-R1 reproduces. Only this exact report and its exclusive evidence directory were written; earlier author/reviewer evidence is preserved.

