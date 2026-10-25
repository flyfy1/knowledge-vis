# Independent review: LeetCode 987

Candidate: bed2e3d724fb024efd46c65ad1ba52fc5fa20f9f. URL: http://127.0.0.1:18796/leetcode/987/. Review date: 2026-10-26. Target: basic Python, lists, loops, functions and elementary recursion. This run did not author the lesson. Model identity unavailable. This is a review, not publication or a human comprehension study.

Frozen interpretation: six dimensions weighted 15/20/20/20/15/10, each 0–4. Faithful Python is preferred. Correctness, a causal bridge, meaningful interaction, bilingual access and executable source evidence are required independently of scores.

## Cold browser walkthrough (saved before source audit)

Only the frozen rubric was read before opening the candidate in real headless Chromium through Playwright. No repository implementation, author notes, prior findings or tests had been opened. Rendered lesson disclosures were read as a learner would read them.

| Teaching step / question | Action | Observable result | Causal conclusion in my words |
| --- | --- | --- | --- |
| 1. What are rows, columns and the returned objects? | Read the tiny 8/4/6 tree and hand-calculate | Root (0,0), left (1,-1), right (1,1); [[4],[8],[6]], no placeholders | Edges establish location; output strips coordinates and scans columns left to right. Values do not determine column. |
| 2. Why not discovery order? | Predict swapping LR=9 and RL=2 will change discovery [8,9,2] to [8,2,9] but not required [8,2,9]; click swap | Precisely those before/after lists appear; root stays first despite 2 being smaller | Row priority beats value; value resolves only the row/column tie. Level traversal alone cannot order tied values. |
| 2. What work does sorting save? | Read repeated-minimum explanation and open baseline disclosure | Selection scans n, n-1, … candidates; loop removes the least triple | Sorting supplies the same total order without repeated whole-remainder searches. min/key syntax is advanced but the preceding prose explains its work. |
| 3. What must be collected? | Start Tie at event 0, then Next | 0/5, no records; event 1 appends root (0,0,8), explains right-before-left stack pushes | Stack stores each node's own coordinates; records reorder fields to express sorting priority. |
| 3. Does collection preserve previous work? | Next through events 2–5 | Append L=(-1,1,4), LR=(0,2,9), R=(1,1,6), RL=(0,2,2); prior entries persist; orange/current moves, collected stays | Each node is recorded once, and moving to another branch does not undo saved coordinates. Child rows add one and column changes with edge direction. |
| 3. Does sorting move the tree? | Before Next, predict L, root, RL, LR, R record order; advance to event 6 | Records acquire that order, grid positions unchanged, 5/5 retained | Ordering records is separate from geometry/highlighting; value breaks the row-2 tie. |
| 3. How do records become lists? | Advance to event 7, then Previous | Final [[4],[8,2,9],[6]]; rewind restores sorted records and “not grouped yet” | Same-column records are contiguous; grouping emits each exactly once. History is recoverable. |
| 4. Can the rule transfer? | Before reveal predict B=[10,3,8]: root row 0 first, then 3 before 8 at (2,0); choose B and Check | Correct feedback explicitly lists unsorted and sorted triples | New values require applying both row and value rules, not remembering [8,2,9]. |
| 5. How does Python express the transition and cost? | Open full solution and read accompanying explanation | node,row,col pop; records.append((col,row,node.val)); right then left push; sort; previous_col grouping | Event 2 corresponds to popping L and appending (-1,1,4). Tuple order encodes priorities, and no input child pointer is assigned. Three passes cost O(n log n), O(n) auxiliary space. |
| Bilingual meaning | Switch to 中 and read all five steps and open disclosures | Same coordinates, tie explanation, stack order, invariant, prediction and Python cost in Chinese | Reasoning remains equivalent, including the explicit simulation/submission distinction. |

Independent custom predictions, written before runtime checking: fresh tree root 6, left 4, right 9, left.right 7, right.left 1 should yield [[4],[6,1,7],[9]]. Counterexample to “sort each column by value”: root 9, left 4, left.right 1 should yield [[4],[9,1]], not [[4],[1,9]], because row 0 precedes row 2. UI is preset-only: these will be **code checks**, not custom browser experiments. Equal triples must keep both copies; single value 0 must return [[0]].

Cold observations: the explanation is reconstructable without author notes. Stack membership is prose rather than an animated stack, and sorting/grouping are each one phase; the small record list still makes their before/after semantics inspectable. No essential explanatory gap observed in this pass. Screenshots saved: cold-initial.png, cold-collected.png, cold-reveal.png. cold-collected.png inspected visually: distinct cards, current label and persistent records are readable on desktop; sticky navigation in full-page capture is a capture/scroll-position consideration, not evidence of text collision.

## Source audit and final assessment

Outcome: **accepted**, 92.5/100; scores **[4,4,4,3,4,3]**. No required open findings. Acceptance applies only to this candidate and the reviewed local build, not publication.

### Identity, official source and canonical contract

After saving the cold walkthrough, HEAD was confirmed as bed2e3d724fb024efd46c65ad1ba52fc5fa20f9f. The working tree had only this report and its new evidence directory; `git diff --exit-code` passed. Browser request bytes for all seven lesson runtime/source assets matched the checkout exactly; shared common.js and style.css also matched. Representative SHA-256 receipts:

- index.html: `48907f436467b14d82390ab7ce0c2903af33bd2966e2c086f0a46b9716a19e1d`
- solution.py: `007bd21d2f5d59252826a4ac45dd005d7ab0886f11f3705ccf0864cda90cc918`
- python-code.js: `80a3ebbfd8e8a03c6380abc93c6ff4871a9b23c940b869ba5e6030e33b945f04`
- app.js: `6e40926147c62a5ed8c10f3d6270a58820779b393fbdf6208171466964634dc1`
- core.js: `a732561687231cdb30554a5bb01f981caf59cd3a0c569715ee4d2505ec416d1c`
- copy.js: `fe89f63b17a0d8381461d766b51c0bc17881aaaceb47cdfa6c2df696db1b82ef`
- local style.css: `c5142fc00cbf17d3ff6955bba611a83f7ac057fed521c9e2a8b589c0658b852a`

Read the [official statement](https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/) normally through the web reader: root and child coordinates, column/row/tied-value order, all three examples, 1–1000 nodes and 0–1000 values agree. Direct Chromium navigation encountered Cloudflare security verification; no bypass attempted. The lesson-local saved official verification and full capture establish the Python3 stub `Solution.verticalTraversal(self, root: TreeNode | None) -> list[list[int]]`, matching the canonical callable. No non-Python contract or original-language exception applies. No successful online submission is claimed.

Read `LANGUAGE_FILES` in scripts/register_leetcode_lesson.py: Python maps to solution.py, python-code.js, PYTHON_SOURCE. This lesson uses that faithful canonical interface, not a conceptual analogy. The rendered UI labels the JS trace explicitly as a simulation.

Metadata complexity is the single nonempty string `O(n log n) time; O(n) auxiliary space and O(n) output space`. Root command `python3 -B scripts/register_leetcode_lesson.py 987 --validate-only` returned **exit 0, no stdout/stderr**, including a separate final rerun. No registration or asset generation was performed.

### Executed source and independent reasoning

The independently chosen code-check predictions recorded above passed when executing the actual canonical solution.py via importlib with a judge-equivalent TreeNode: fresh [[4],[6,1,7],[9]], row-before-value counterexample [[4],[9,1]], singleton zero [[0]], defensive None []. These are source executions, not custom UI experiments.

Collection invariant: the ledger contains exactly the nodes already popped and accepted, with their path-derived coordinates. Every existing child has one parent and is pushed once. Null entries are skipped. The finite stack therefore terminates without omitting or duplicating nodes. Sorting changes record order, not coordinates or membership; equal tuples remain duplicated. A new group on changed col is sufficient because sorted equal columns are contiguous. Event 3 appends `(0,2,9)` for LR while root/L remain; event 4 pops R with its own saved coordinates `(1,1)`, illustrating why no branch rollback is needed. The canonical code pushes None children, whereas trace collection events omit them; the text explicitly describes empty children being discarded.

The baseline's repeated scan costs n+(n-1)+…+1 candidate checks; list removal adds at most another quadratic amount. Sorting avoids those repeated searches. Canonical collection and grouping are linear; tuple keys have fixed three-field comparisons. Sorting is O(n log n), including O(n) sort workspace; the stack and records are O(n), output O(n). For n=1 work is constant as explained. A 1000-node chain uses no recursive Python calls. All child references are read, never assigned. Snapshot copying in the teaching simulation has a separate quadratic storage explanation and is not attributed to the submission.

Tests were inspected **before running**, including their output paths, actual assertions, oracle methods and clipboard shortcut. All generated artifacts were redirected to this run's exclusive evidence directory via `EVIDENCE_DIR=specs/reviews/987-evidence/987-review-1-0d4cbd13`:

- `python3 -B leetcode/987/tests/test_solution.py`: exit 0; actual canonical execution passed all official examples, exhaustive shapes through six nodes with 0/1 values, seeded trees, all-equal positional ties, values 0/1000, None and 1000-node left/right/zigzag boundaries. Identity/value/child-link fingerprints unchanged. 10,676 cases (numerical.json).
- `node leetcode/987/tests/test_core.cjs`: exit 0; independent breadth-first oracle, intermediate membership/coordinates, one append per collection, sorted order, multiplicity and independent history snapshots. 1,005 cases/63,036 frames (core.json). These counts support computational coverage, not teaching quality.
- `node leetcode/987/tests/browser.cjs`: exit 0; Chromium 156.0.8078.4 on Linux, ten preset/locale paths, sixteen viewport/zoom combinations, no page errors or failed assets (browser.json).
- `node leetcode/987/tests/accessibility.cjs`: exit 0; keyboard grid scrolling, source and control contrast in both locales (accessibility.json).

The generated JSON retains the frozen harness's “author self-check” labels. These files are fresh reviewer executions of inspected author tests; they are not additional independent reviewers. No original author results were overwritten. Existing author claims were read only after the cold walk and compared with observed reruns. No earlier independent review report for 987 was present; no inherited required finding is claimed closed.

### Rendered state, transfer, localization and accessibility

For every preset in each locale, final UI results independently agree: Tie [[4],[8,2,9],[6]], Ex.1 [[9],[3,15],[20],[7]], Node0 [[0]], Equal [[5],[5,5,5],[5]], Chain [[2],[4],[6],[8]]. Every event can be rewound to the exact initial text and replayed; reset clears collection; end restores the terminal state; next/end are disabled at the endpoint and previous/reset at the start. Preset changes restart the trace. The fixed prediction exercise is explicitly independent of preset selection, so keeping its answer when the experiment changes is consistent.

At Tie event 3, the diagram's LR9 current/collected marker is distinct from root/L collected and RL2 pending. The ledger has root `(0,0,8)`, L `(-1,1,4)`, LR `(0,2,9)`; three collected nodes agrees with 3/5. Grid `(row,col)` and ledger `(col,row,value)` are separately named. Rewind/replay and locale switching preserve the same state. Sort changes the ledger to L/root/RL/LR/R; grouping changes only the result from pending to [[4],[8,2,9],[6]]. There is no final answer mislabeled as an intermediate output.

All prediction choices produce meaningful feedback: A incorrectly prioritizes values, C incorrectly retains discovery, B applies row then value. Selecting another answer hides stale feedback; reveal explains actual before/after triples. A separate 320px zh→en→zh roundtrip preserved event 1/7, selected C and revealed rejection while updating both document title and H1 to the exact localized identity. The localized operation/explanation remains bound to LR9 `(2,0)` and its ledger record in both languages, not to clipboard status. All 77 COPY keys are unique; each is a two-nonempty-string pair consumed by common.js, and representative meaning was checked in the actual renderer rather than inferred from key presence.

Rendered `#code.textContent`, decoded offline mirror, successful native clipboard text and both downloads match canonical source exactly, including final newline/indentation. For **each** locale's manual fallback, the runner first wrote and verified a fresh distinct non-source sentinel, forced automatic write failure, invoked Copy, verified focused textarea and full source selection, sent Linux **Control+C**, and read back the canonical source from the native clipboard. This establishes actual fallback transfer, not textarea presence alone. Downloads stayed inside this review's directory. Offline/file opening and blocked localStorage checks passed.

Keyboard Enter advances events, Shift+Tab reaches Previous, and the visible focus outline is 3px. At 320px ArrowRight actually scrolls the focused grid (40px in each locale). Forced colors and reduced motion checks pass. Disabled controls retain full-opacity readable muted ink and dashed border, with actual native disabled semantics. The contrast helpers actually used by both frozen tests were independently extracted and calibrated against black/white, red=.2126, green=.7152, blue=.0722, and #747474 on black=4.492948073111701 (correctly below 4.5). Actual sampled main text minimum is 6.449407898769069; source/control samples exceed 13:1. Scope is sampled solid-color text/control pairs, not a universal contrast audit.

Bilingual labels for the related links match their destinations: #124 step1 explains parent/child one-arm information; #4 step1 explains ordering positions and partition cuts. Both sections were read on the served preview. Keyboard Enter navigation to both targets was verified in en/zh at 320px. An initial ad-hoc navigation probe read URL before waiting and later failed with “Not attached to an active page”; its result was not counted as a link pass. The corrected probe explicitly waited for each destination URL and succeeded. The same-lesson link targets the coordinate/value counterexample.

### Screenshot inspection and limitations

Evidence directory: `specs/reviews/987-evidence/987-review-1-0d4cbd13/`. Individually inspected cold-collected.png, en-320-z1-grid.png, zh-320-z2-controls.png, en-390-z2-prediction.png, zh-390-z1-grid.png, en-1440-z2-grid.png, zh-header.png, zh-320-chain.png, and both *-320-z2-tie-settled.png, plus the disabled-state capture. Text is readable, options wrap, the selected native preset labels fit the recorded font/width budget, and there is no reproduced text collision. Longest preset path LLL and its triple/readout wrap legibly.

At 320px/200% the inner grid is narrower than an entire node card, so seeing a full label can require panning. The grid is a focusable, explained horizontal-scroll region; the persistent ledger also shows node IDs/triples and current status. Current and collected meanings remain recoverable, but this is friction. Initial ad-hoc *-tie-detail.png captures landed at the header during unsettled scroll; their names do not establish a tie-state screenshot. The later *-tie-settled.png captures, with measured current-card box x=24,y≈405,width=272,height≈189, show the actual panning limitation. No defect is inferred from partially clipped cells at an arbitrary scroll offset. Zoom uses CSS body zoom=2, a reproducible content-zoom check; no physical-device, browser-chrome zoom, alternate-OS font, or real novice outcome is claimed.

### Scores and findings

| Dimension | Score | Observation/rationale |
| --- | --- | --- |
| Problem/terms/hand calculation (15) | 4 | Concrete three-node example before abstraction; coordinates, nonempty bounds, output values and duplicates explicit; manually reconstructed result. |
| Derivation/saved work (20) | 4 | Wrong discovery rule exposed by a positional tie; repeated-minimum baseline and its cost lead causally to sorting the three-field key. |
| Correctness/state (20) | 4 | Concrete child/branch/sibling stack sequence, preserved coordinates, exact collected membership, tie multiplicity, contiguous grouping and termination reconstructable and checked. |
| Interaction/visual meaning (20) | 3 | Predictions, records and reversible frames agree; current vs collected explicit. Sorting/grouping each advance as a whole phase and the pending stack remains prose, creating minor reconstruction friction. |
| Python/cost (15) | 4 | Exact faithful callable executed; fresh cases and depth boundaries pass; event-to-append and sort/group mapping explicit; costs and nonmutation justified. |
| Bilingual/device (10) | 3 | Equivalent reasoning and preserved state; readable keyboard controls at tested widths/zoom. Dense 320px/200% grid requires panning to see complete cards. |

Weighted total = 15+20+20+15+15+7.5 = **92.5/100**. Every dimension ≥3.

Required finding IDs: **none**. No earlier required finding was closed. Optional observation **987-OBS-01** (minor, open advisory): at Tie event3, en/zh, 320px/200% content zoom, scroll to the current card; expected easy association of full ID/coordinates/status, actual card requires panning within the grid. Evidence: settled tie screenshots and keyboard-scroll checks. This does not violate essential access because text remains reachable through the declared focusable scroll region and ledger. Next action, if desired: owner may improve narrow-grid density in a future candidate; no repair was made here.

Conclusion: **accepted for the identified candidate**, with complete scoped browser/source/execution evidence and no required open findings. No publication, deployment, LeetCode submission, or measured human learning claim follows from this review.
