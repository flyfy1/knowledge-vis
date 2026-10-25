# Independent review: 834 — Sum of Distances in Tree

Candidate: `3dcefbc04619ae11869ea34581ea71c38daee06c`. URL: http://127.0.0.1:18770/leetcode/834/. Target: basic Python, lists, loops, functions, elementary recursion. Reviewer identity/model identifier unavailable; this report records this independent run only. Rubric: specs/leetcode-review-gates.md; weights 15/20/20/20/15/10, scores 0–4. Python is the applicable preferred canonical language. No submission or measured human-comprehension claim.

## Cold walkthrough (saved before source inspection)

Only the frozen rubric was read before opening the candidate with real headless Chromium through Playwright (1440×1000). No brief, source, tests, author claims outside the rendered lesson, or earlier review was consulted. Screenshot: `834-evidence/834-review-1-68508693/cold-desktop.png` (inspection follows).

| Teaching step/question | Action | Visible result | Causal conclusion in my words |
|---|---|---|---|
| 1. What does a distance sum count? | Read the tiny 0—1—2—3 example; select Start 1 then Start 0. | Start 1 table is [1,0,1,2], sum 4; original is [0,1,2,3], sum 6. | Distances count edges, including zero to self. Output has one sum per ID. Node position is not a coordinate axis. |
| 2. Why not count afresh? | Read baseline explanation and wrong-rule example. | Four searches produce [6,4,4,6]; moving 0→1 changes three distances down and one up; the suggested n−2 increment gives 8 instead of 4. | Independent searches repeat almost all traversal; a whole component changes together, not just the new start. BFS/deque and undiscovered −1 are explained. |
| 3. Across an edge, who gets closer? | Read definitions; advance all seven operations individually. | 3→2 gives size/down (2,1); 2→1 (3,3); 1→0 (4,6); root answer 6; then answers 1=4, 2=4, 3=6. Every operation appears in ledger and all nodes remain in table. | Add a completed child's local distances plus one for each child-side node. Child-before-parent completes summaries; root covers everyone. Moving across the cut subtracts the child component size and adds the complement. Fixed-root size never changes during propagation. |
| 3. Can history distinguish unknown from zero? | Previous from final frame, next, then reset. | Rewind changes only last full answer back to ?, replay restores 6; reset restores singleton summaries and unknown answers. | Highlighting denotes the current operation; stored computed values are independent. ? means uncomputed, not distance zero. |
| 4. Does the rule transfer to a branch? | Calculate child side {1,2}, outside {0,3,4}; select 7 and check. | Feedback says 6−2+3=7 and distances [1,0,1,2,3], with reasons for both distractors. | Both disjoint components exhaust the tree, so all five changes are counted. This calculation preceded clicking reveal, although the numeric prediction was not separately persisted before that click. |
| 5. Which Python values carry the proof? | Read the rendered code-transfer and costs section. | Explicit mapping of path merge to size[2]=1+1, down[2]=0+0+1; root seed and outward formula; iterative order avoids deep recursion. | Three linear passes and adjacency lists use linear time/space; lists appended during traversal establish parents before children and reversing them gives merge dependencies. |

Fresh independently chosen input, prediction recorded now **before code execution/reveal**: n=6, edges [[0,1],[1,2],[1,3],[3,4],[3,5]]. Expected answers [11,7,11,7,11,11]. From 0 distances [0,1,2,2,3,3] sum 11; crossing 0→1 has five closer, one farther: 11−5+1=7. Crossing 1→3 has three on each side, so stays 7. Counterexample to “moving always increases by n−2”: first move would predict 15, contradicted by directly counted 7. Independently chosen second counterexample: n=3, [[2,0],[2,1]], expected [3,3,2]; 0→2 gets two nodes closer, one farther, 3−2+1=2, whereas the wrong rule predicts 4. UI offers presets only: these are pending **code checks**, not custom UI experiments.

Cold-read judgment: the hand example precedes terms and abstraction; the two-component argument and actual before/after values supply the causal bridge without author notes. The proof paragraph is dense but reconstructable with the preceding merges. Source audit and device/access checks remain pending at this saved point.

## Post-cold audit and executable evidence

HEAD is the requested revision. HTTP response bytes matched local `index.html`, `style.css`, `copy.js`, `core.js`, `python-code.js`, and `app.js`. Observed SHA-256 receipts:

- index.html: 331705dd3051a46beeb005d51b48006212ac9dc2c32cc228fa59647f0d54a1f1
- style.css: ddcbee2f49e9dfe820566d45c6be3d0d96f498575984f828461be9a29b96c023
- copy.js: c57f4c9a828d69a31b9e72a5e5dfc2a4ef776b7dccc5ee4c904788183fdf1838
- core.js: 6f341973ea6dfce7dcaf9a8f2ad9b493f11d62173d7d7f9280b09ad0d8154fa1
- python-code.js: 1ac8654e9613b8ca5ee43082b0a1c548c7461226ca891093944fb98b1486cca2
- app.js: 556964412fd0563ccec3970fe98dade605ec8a1b01322da1fc89ec1c79c8761e

Read the rendered-state supplement only after saving the cold walk. Inspected canonical Python, metadata, core, app, bilingual dictionary, HTML, CSS, baseline, and all test scripts before running their corresponding commands. Did not run build_page.py or registration. No earlier 834 review report was present; no prior finding is being closed.

Read the [official statement](https://leetcode.com/problems/sum-of-distances-in-tree/) normally: connected undirected tree, n−1 edges, IDs 0 through n−1, output one distance sum per ID, n≤30000, and official examples [8,12,6,10,10,10], [0], [1,1] agree. Canonical `Solution.sumOfDistancesInTree(self, n, edges)` implements this original callable, with a real list of integers returned. Python is faithful, so a non-Python language contract/selector audit is inapplicable. Read LANGUAGE_FILES: Python maps exactly to solution.py / python-code.js / PYTHON_SOURCE.

Executed the actual canonical class using Python runpy, without compiling a substitute trace. Both pre-recorded fresh predictions passed: [11,7,11,7,11,11] and [3,3,2]. A separately written queue-based all-start BFS oracle matched another 200 trees (seed 68508693, n=1…64); the fresh explicit inputs remained unchanged. The valid-tree guarantee makes excluding the parent sufficient: no visited set is needed. Appending to order is safe Python list iteration; every child appears after its parent. Reversing that order completes each child before adding it to its parent. Disjoint child subtrees justify adding counts and distances without duplication. Each propagated full answer uses an already computed parent and fixed subtree size. The singleton root seed is its only operation; the algorithm terminates after finite linear traversals.

Baseline inspection confirms one complete BFS per starting node with a fresh O(n) distance array and queue; O(n²) total time and O(n) peak auxiliary memory, including n=1. Its “900000000 distances” refers to cumulative work, not simultaneous allocation. Optimized construction and three loops scan O(n) nodes/edges; all arrays, adjacency lists, result, and temporary slices are O(n). No recursion or mutation of input edges. Simulation snapshots are explicitly separate from this memory bound.

Commands run from repository root, with `OUTPUT_DIR="$PWD/specs/reviews/834-evidence/834-review-1-68508693"` for every generating test:

| Command | Observed result |
|---|---|
| python3 -B leetcode/834/tests/test_solution.py | Pass: 1742 small cases, all labeled trees through n=6 plus seeded trees; maximum 30000-node path and star. |
| node leetcode/834/tests/test_core.cjs | Pass: 43582 frames; independently checks partial merged-node sets, subtree distances, edge-cut per-node ±1 changes, every known answer, snapshot isolation, exact source mirror, unique dictionary keys and two-string copy pairs. |
| node leetcode/834/tests/browser.cjs | Pass, Chromium 156.0.8078.4 on Linux; no captured console/page/network errors. |
| node leetcode/834/tests/access.cjs | Pass: native select fit, keyboard scrolling, focus, sticky IDs, reduced-motion/forced-color checks. |
| node leetcode/834/tests/visual.cjs | Completed focused graph/table/header captures into this run's directory. |
| python3 -B scripts/register_leetcode_lesson.py 834 --validate-only | Exit 0, no output; run twice, no registration or generation. Metadata complexity is the single string “O(n) time; O(n) auxiliary space”. |

Generated JSON results and downloaded Python files are retained in this run's evidence directory. These results support specific audited behavior; counts alone did not determine scores.

## Rendered behavior, bilingual meaning, and device observations

The browser checks exercised all five presets in both locales, comparing final answers to independently known values: path [6,4,4,6], official [8,12,6,10,10,10], singleton [0], reversed edge [1,1], star [4,7,7,7,7]. Each initial and final endpoint, all forward/back operations, jump-to-end, reset, and replay were exercised. Operations total 2n−1, including the root seed. Frames describe states **after** operations. Cold path intermediate table/ledger values match Python merges and propagation. In branching cases the core test independently reconstructs the exact subset already incorporated, so partial down/size are not mislabeled as completed subtree results.

Both rendered formulas were complete: `answer[v] = answer[u] − size[v] + (n − size[v]) = answer[u] + n − 2 × size[v]`. Both locale readouts at operation 5 reported three closer/one farther and 6−3+1=4. An additional 320px zh→en→zh roundtrip at operation 1 preserved size/down arithmetic 1+1=2 and 0+0+1=1 and restored Chinese H1/document title `#834 · 树中距离之和`. Read both full dictionary explanations: parent/subtree definitions, fixed root, disjoint groups, child-completion invariant, root seed, baseline costs, wrong rule and prediction distractor causes have equivalent meanings. Duplicate keys are detected before evaluation in the applicable flat dictionary namespace.

Quiz checks covered all three selections, correct versus incorrect feedback, answer change clearing feedback, initial disabled reveal, and locale roundtrip retaining selection, trace data and feedback. The independent exercise is a different branching shape, not just repetition of the path answer. Preset changes reset only trace state (verified handler scope); hand and quiz state are separate. Rendered unknown answers use ?; highlighting selects a node, not a fabricated distance or changed input edge.

Exact parity passed without trim or whitespace normalization: canonical source = decoded mirror = code element textContent = successful clipboard = fallback clipboard = downloaded bytes, including final newline. Both languages' fallback attempts first wrote and read a fresh distinct sentinel, then disabled automatic writes, invoked Copy, verified focused full textarea selection, pressed **Control+C on actual Linux**, and read back the source. Downloads are download-en.py and download-zh.py. Offline source remained available with solution.py requests blocked and localStorage throwing. Baseline HTML source also matches the inspected executable baseline.

Inspected screenshots (not just their existence): cold-desktop; en-1440-trace; zh-1440-graph-focused; en-320-table-left; zh-320-graph-focused; en-320-select1; zh-320-select3; zh-320-header; en-390-quiz; en-390-table-right; zh-390-table-right; en-zoom200-table; zh-zoom200-graph. Graph IDs and edges are distinct; long selected labels are complete; Chinese identity is localized. At narrow widths the table intentionally scrolls: the sticky node ID remains associated with each full answer when scrolled right. Partial neighboring column text at the scroll boundary is clipping by the scroll viewport, not intersecting labels. Keyboard ArrowRight actually scrolls the focused table and focus outline is 3px. All preset labels pass the recorded width budget with 24px arrow allowance at 320px. CSS font stack is PingFang SC, Microsoft YaHei, system-ui, sans-serif; exact resolved fonts and other platforms are not established.

At 320/390/736/1440 widths in both locales the tested views had no page-wide overflow. Enter activated controls; Tab reached the table; related links activated by keyboard reach the rendered local sections explaining child summaries (#step2) and per-node distance sums (#step0), with translated labels. Some screenshot scroll positions put a heading or prose behind the sticky navigation; content remains available by ordinary scrolling, and keyboard link positioning was checked separately. This is not a demonstrated text collision defect.

200% was exercised as CSS zoom=2 with a 720px viewport and focused graph/table captures, a synthetic layout stress rather than native browser-menu or physical-device zoom. Graphs remain distinct and tables retain horizontal scrolling. This limitation is explicit. The reading experience on narrow screens requires scrolling a long proof section and table, accounting for minor device friction.

Contrast helper calibration exercised the actual function extracted from browser.cjs: black/white luminance 0/1, red .2126, green .7152, blue .0722, and #747474 on black 4.492948073111701 (correctly below 4.5). Recorded palette ratios are 6.4494 or greater for measured text roles/backgrounds. Disabled control style is opacity 1, rgb(154,167,184) text on rgb(22,27,34), ratio 7.07885; its label is readable. Solid palette checks and inspected screenshots do not establish every possible composited or physical display condition.

## Scores and decision

| Dimension | Score | Weight | Rationale |
|---|---:|---:|---|
| Problem/terms/hand calculation | 4 | 15 | Tiny path precedes abstraction; input, units, IDs, self-distance, and all-node output are explicit and manually checked. |
| Derivation/saved work | 4 | 20 | BFS repeated work, whole-component counterexample, two exhaustive groups, numeric derivation and child-summary merge bridge are reconstructable. |
| Maintained state/correctness | 4 | 20 | Fixed-root sizes, partial summaries, dependencies, induction and stopping rule match intermediate frames and executable canonical boundaries. |
| Interaction/visual meaning | 4 | 20 | Observable before/after arithmetic, retained ledger and all-node table, rewind/replay/reset, changed prediction and independent transfer exercise work. |
| Python/cost | 4 | 15 | Faithful iterative callable executes fresh cases and maximum boundaries; actual source parity, mutation and linear cost audited. |
| Bilingual/device access | 3 | 10 | Equivalent reasoning and state preservation verified; narrow scrolling and dense proof impose minor friction. Synthetic 200% coverage is identified rather than presented as native device evidence. |

Weighted score: **97.5/100**. Every dimension ≥3. Required open IDs: **none**. No required finding reproduced; no implementation changes requested. There are no prior findings to close. Limitations: one Linux Chromium environment, synthetic zoom rather than native device/browser-menu zoom, and no real novice comprehension measurement or LeetCode submission. This is independent lesson acceptance of the identified candidate, separate from publication.

**Conclusion: accepted.**
