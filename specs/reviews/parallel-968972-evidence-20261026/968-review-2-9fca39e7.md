# Independent review: 968 Binary Tree Cameras

Candidate: `611b194292b72d89d4e64b984256efce09f5ab4e`. URL: http://127.0.0.1:18791/leetcode/968/. Review run: 968-review-2-9fca39e7; no named reviewer/model identity asserted. Target: basic Python, lists, loops, functions and elementary recursion. Frozen weights: 15/20/20/20/15/10. Python interface is the applicable canonical-language preference.

## Cold walkthrough (saved before source, tests, prior reviews or author notes)

Only the frozen rubric was read before opening the candidate in Chromium via Playwright. Initial viewport 1280×900. The page is preset-only; independently chosen inputs below will be **code checks**, not custom UI experiments.

1. **Question:** what does one camera cover, and what is minimized? **Action:** read the three-node introduction; select A, remove A, select B. **Observed:** A gives 1 camera and 2/3 coverage, missing C; B gives 1 and 3/3 coverage. **Conclusion in my words:** reach is one edge, so selecting the middle node covers both directions; zero cameras cannot cover a nonempty tree. Letters name identities, not values. Input has 1–1000 zero-valued binary-tree nodes; output is a minimum integer.
2. **Question:** what information avoids enumerating every camera subset? **Action:** read “Summarize needs,” its fork example, wrong downward rule and exchange argument. **Observed:** baseline checks 2^n subsets at n cost each; N means only the subtree root awaits coverage, K supplies a camera, C supplies no camera. Missing children are C. Child N takes priority over K. **Conclusion:** strict descendants are already resolved; a parent can satisfy one or two child demands with one camera. Coverage alone cannot describe whether a child supplies a camera. The deepest-demand exchange explains why moving a remaining useful camera upward preserves an optimal completion; fixed cameras retain previously resolved coverage.
3. **Question:** how do child summaries cause parent decisions? **Prediction before action:** C and D wait, B installs, A is covered: one camera. **Action:** press Process next node four times. **Observed:** C: C,C→N (0); D: C,C→N (0); B: N,N→K (1); A: K,C→C (1), final positions B. Ledger accumulates all decisions; C/D retain N; orange outline identifies the latest event. **Conclusion:** N labels record earlier returns, not current physical coverage. Only processed-node highlighting changes focus; history survives. The first two frames show B still undecided before both children return.
4. **Question:** can I transfer the rule to a fresh chain? **Prediction saved before reveal:** seven nodes need 3, since G→N, F→K, E→C, D→N, C→K, B→C, A→N, then root repair. Two cameras cover at most six chain vertices. Pending action: choose 3 and reveal.
5. **Question:** how does this become Python and what does it cost? **Action:** read Code & limits explanation (not source). **Observed:** explicit (node, visited) tasks schedule children before parent; states[None]=COVERED; NEED checked first; root repaired last. **Conclusion:** B's visible N,N→K maps to the first conditional and one increment. Each node gets two task visits and one saved summary, giving O(n) time and O(n) auxiliary space; no link mutation is needed. Explicit tasks avoid a deep recursive call chain.

Independent input predictions, written before execution: (a) fresh asymmetric tree A with leaf B and child C whose only child is D: two cameras, at A and C is a valid placement; child summaries at A are N and K, so N must win. This is also a counterexample to checking CAMERA before NEED, which would wrongly report one while leaving B uncovered. (b) five-node right chain: two cameras, e.g. B and E; return pattern N,K,C,N,K. (c) singleton: one camera through root repair; empty defensive input: zero. Code checks will verify these after source access.

Screenshots captured: cold-initial.png, cold-complete.png (inspection pending at this saved checkpoint). No claim of human learner comprehension or successful LeetCode submission.

Cold continuation, still before source: selected 3 cameras and revealed; the UI matched the saved seven-chain prediction exactly, including F/C/A positions and the six-node upper bound for two cameras. Switched to Single root: first Next gives A:N, count 0, traversal incomplete (1/2); second Next explicitly repairs N→K, count 1, position A (2/2). Thus the final repair is a separate decision rather than an unexplained count change. Cold walkthrough complete.

## Post-cold source and official audit

Applied the rendered-state supplement only after the saved cold walk. HEAD equals the requested revision. Independently read the [official statement](https://leetcode.com/problems/binary-tree-cameras/) through the normal web reader: immediate adjacency coverage, minimum integer output, examples `[0,0,null,0,0]`→1 and `[0,0,null,0,null,0,null,null,0]`→2, 1–1000 nodes, values zero. No access bypass was used. Inspected lesson-local official-graphql.json afterward: its Python3 snippet supplies the same `TreeNode` members and `Solution.minCameraCover(self, root: TreeNode | None) -> int` callable as the canonical solution. Saved selector evidence corroborates the interface; this run did not independently interact with the live language selector. Python is faithful, so a non-Python language contract and supportedLanguages fallback audit do not apply.

Read LANGUAGE_FILES in scripts/register_leetcode_lesson.py: Python maps exactly to solution.py / python-code.js / PYTHON_SOURCE. Read canonical solution, mirror, baseline in HTML, trace core, app, bilingual copy and shared locale consumer, styles and test sources. No BRIEF supplied a missing causal explanation. HTTP bytes for all seven lesson runtime/source files matched the checkout. SHA-256 receipts:

| File | SHA-256 |
|---|---|
| index.html | fc5c421284e5b8c48595c84c658c6b03505507ff51460b80020a5a85ff3e6919 |
| core.js | f94b6dc09dfe5e79ec55193c565437361a29d9d646cddb773ef70be12aa1c5dc |
| app.js | 1b70bd1d9bcf2fa6be0a68e95fbc3225ac1a1f223a64b4daf4388eb148d687cf |
| copy.js | a9d5e6e4e32cf5a38c61d21456bb563ec1ebc0a7434745ed62e307d53f87039c |
| solution.py | b7428a60e1ab3b6f6180a8b8f4201b03d34e7a39857dd4091f62e85ffd7f9f31 |
| python-code.js | 972388daafc90cfa38c364a2e80235a3d92771fa0cabca9120cae81b6d1a0ed1 |
| style.css | 874b1ce27607a66d1f55ddee88d78b7e7d45ad203c2cb03f249f801057282684 |

### Actual algorithm and independent examples

The baseline really enumerates all masks and unions each camera's immediate neighbors. Binary-tree degree bounds each update; checking n candidate positions in each of 2^n masks explains O(n·2^n) time and O(n) working storage. The optimized source schedules `(node, True)` before right and left tasks, so LIFO supplies left/right states before the parent revisit. At B's revisit in the default example, `left == NEED or right == NEED` writes CAMERA and increments 0→1. At A, CAMERA/COVERED writes COVERED without increment. The root repair changes the returned count; its local dictionary need not be updated because it is never returned. The simulation explicitly changes root N→K to show the installed camera.

The maintained invariant is that all strict descendants are covered when a node returns. N permits only that root to remain uncovered. K provides coverage to its parent; C does not. Missing children have no demand. The first branch must handle N even beside K, because those sibling nodes are two edges apart. No child summary is read before it exists. Each finite node is expanded and revisited once; root repair terminates the remaining obligation. The explicit stack and n saved dictionary entries use O(n) space, with O(n) time under ordinary amortized dictionary access. No node fields are assigned. Teaching snapshots copy growing arrays, explaining their separately labeled O(n²) storage.

Executed actual solution.py with runpy and a supplied identity-hashable TreeNode, independently of the teaching core. A separate oracle enumerated combinations of camera nodes and covered undirected edges (no three-state recurrence). The predictions saved above all matched: mixed N/K tree=2, five-node right chain=2, singleton=1, defensive empty=0. Node identities, values and links remained unchanged. On the mixed tree, child B=N and C=K force another camera at A; returning C from a CAMERA-first rule would leave B uncovered and incorrectly return 1. This establishes the excluded case rather than merely repeating a preset. Empty is outside official constraints.

### Inspected tests, safe execution and metadata

Inspected test destinations and operations before running them. Every result producer used `LESSON_EVIDENCE_DIR=specs/reviews/968-evidence/968-review-2-9fca39e7`; no write_copy.py helper or registration was run. Existing evidence was preserved. Supplied JSON retains its literal “author self-check” label; these independently rerun computations support this review but are not a substitute for the cold teaching assessment.

| Command, run from repository root | Observed result |
|---|---|
| `python3 -B leetcode/968/tests/test_solution.py` | Exit 0: actual canonical Python matched independent set-cover enumeration on all 2,056 shapes through 8 nodes including empty and 160 seeded cases; official results 1/2; both 1,000-node chain directions=334; mutation checks passed. |
| `node leetcode/968/tests/test_core.cjs` | Exit 0: 630 cases / 4,931 frames; final subset-oracle agreement, every completed descendant invariant, child operands, camera counts/identities, exact mirror, duplicate-key and bilingual pair-shape checks passed. |
| `node leetcode/968/tests/browser.cjs` | Exit 0: both locales/all presets, endpoint/rewind/replay/reset, prediction/reveal/change, language preservation, exact source transfers, widths/zoom, keyboard/focus, storage denial and local requests; no page/console/HTTP errors. |
| `node leetcode/968/tests/current_marker.cjs` | Exit 0: current camera versus older camera, root repair, default installation, rewind/replay and locale roundtrip at 1280 and 320. |
| `node leetcode/968/tests/offline.cjs` | Exit 0: file URL displayed source exact; 320px selected-label measurements pass both locales. |
| `node leetcode/968/tests/capture_focus.cjs` | Exit 0: focused captures and actual keyboard ArrowRight scrolling of diagram viewport. |
| `python3 -B scripts/register_leetcode_lesson.py 968 --validate-only` | Exit 0, no output. Non-mutating preflight; complexity is exactly the single string `O(n) time; O(n) auxiliary space`. |

All five completed preset traces agree with independent coverage/oracle checks: default C:N,D:N,B:K,A:C gives 1; official example 2 E:N,D:K,C:C,B:N,A:K gives 2; singleton N then repair gives 1; chain4 D:N,C:K,B:C,A:N then repair gives 2; full tree cameras B/C and A:C gives 2. Preset labels match these answers. Initial frame has no completed decisions; intermediate counts explicitly say nonfinal. Root repair adds exactly one camera and one decision. Rewind restores the prior camera list, summaries and ledger prefix, and replay reproduces it.

### Rendered interaction, parity and access

Read full rendered Chinese text after interacting, including the invariant, exchange proof, child return rows, root repair, Python task scheduling, costs and exercise feedback. Its reasoning matches English. Actual N,N→K and K,K→C rows contain complete operands and correct counts; the root repair is N→K in both locales. Copy fallback text is separate from answer correctness feedback. Duplicate-key detection runs before evaluating the copy dictionary, and all consumed entries are two-string locale pairs.

Prediction choices clear old feedback on change; all three reveal paths were exercised in each locale. Seven-chain selection/revealed reasoning survives preset changes because this exercise is explicitly separate. A 320px zh→en→zh roundtrip after full-tree decision 6 preserves 6/7, two cameras, B:K and C:K; hand selection and revealed seven-chain answer also remain. H1/document titles match metadata in both languages: `#968 · 监控二叉树` / `968 · 监控二叉树`, and `#968 · Binary Tree Cameras` / `968 · Binary Tree Cameras`. Official link retains the exact problem URL.

Canonical source equals decoded mirror, displayed code via textContent, automatic clipboard, actual manual fallback transfer and downloaded bytes, in both locales, including final newline and indentation without trimming. Browser tests seed and read a fresh distinct non-source sentinel **before each locale's fallback attempt**, then deny automatic writing, activate the real Copy button, verify focus/full selection, send this Linux host's Control+C, and read back exact source. Downloads remain in this run's evidence directory. Offline display is also exact.

Browser is real headless Chromium on Linux using NODE_PATH Playwright and the supplied executablePath. Tested 320/390/736/1440 layouts and 200% CSS zoom, in both locales. Narrow prose, selected preset labels, ledger operands/counts, controls and feedback are readable; no document-wide overflow. The 500px tree intentionally scrolls inside a labeled focusable region, with a text ledger equivalent. Keyboard ArrowRight reveals hidden nodes. Current and older camera captures at both scroll ends retain clear identity/state text; no text collision was observed. At width 320, the full-tree Chinese selected count/scope is visibly complete. The offline test measures every preset label against available width. CSS font stack is PingFang SC, Microsoft YaHei, system-ui, sans-serif; exact resolved glyph font is not asserted.

Keyboard Enter advances Next, Tab moves to Reset, and focus is a solid 3px outline. Disabled Previous after Reset has foreground rgb(154,167,184), background rgb(28,35,48), opacity 1 in each locale. The actual browser test's contrast helper was independently extracted and calibrated: black/white luminance 0/1, primaries .2126/.7152/.0722, contrast black:white=21; #747474:black=4.492948073111701, correctly below 4.5. Recorded actual palette ratios on panel2 are text 13.3971, muted/disabled 6.4494, cyan 10.9101, orange 8.9372. This establishes the tested solid-color palette, not all possible rendering effects. Forced colors, reduced motion and blocked storage checks also passed.

Followed and read related destinations: #124/#step2 teaches completed child results and postorder through/g summaries; #42/#step1 teaches settling work using known opposite bounds. Their rendered labels in both languages accurately promise these ideas; local #step2 revisits coverage demands. Locally served destinations work; public deployment identity of these other lessons is outside this review.

Captured and visually inspected cold-complete, en-intro-390, zh-trace-320, en/zh-settled-ledger320, en/zh-exercise-zoom200, en/zh-settled-zoom-feedback, en-1280-current-camera, zh-320-current-camera, zh-320-older-camera and en-1280-root-repair. Settled captures show complete feedback and narrow ledgers. Full-page sticky navigation capture placement was not treated as a product collision; settled views were checked independently.

## Previous finding closure

Read prior report 968-review-1-1fe9cf12 only after completing/saving the cold walk. Its candidate was fe87684237ab7c00f0b6c08692b9187691be8d3c, and its required finding was **968-R1**.

**968-R1 — current camera loses the current-operation marker: CLOSED on 611b194292b72d89d4e64b984256efce09f5ab4e.** Original severity medium, required visual contradiction in section 3, both locales, desktop/narrow. Original reproduction: Full tree, six Next actions; older B:K and current C:K both appeared cyan 3px despite the orange-current legend. Expected distinct current marker; actual original CSS allowed the camera rule to override it. Violated frozen interaction/visual-meaning requirement. Original report/evidence remain unchanged.

This candidate moves the current-circle CSS rule after camera-circle and cache-busts the lesson stylesheet. Regression independently observed at width 320 after zh→en→zh: B is class camera, cyan rgb(110,231,255), 3px; C is current camera, orange rgb(255,180,84), 4px; progress 6/7, two cameras. Inspected [desktop evidence](968-evidence/968-review-2-9fca39e7/en-1280-current-camera.png) and [narrow current](968-evidence/968-review-2-9fca39e7/zh-320-current-camera.png) / [older camera](968-evidence/968-review-2-9fca39e7/zh-320-older-camera.png). Root repair shows orange A:K distinct from older cyan C:K. The current_marker regression passes unchanged assertions across both locales, 1280/320, rewind/replay, default installation and root repair; see current-marker-results.json. Ledger counts and K camera identities remain correct. Owner: lesson maintainer; fix revision: this candidate; reviewer recheck: this run; next action: none for this finding. No new required finding was observed.

## Scores and conclusion

| Dimension | Score /4 | Weight | Weighted | Rationale from observations |
|---|---:|---:|---:|---|
| Problem/terms/hand calculation | 4 | 15 | 15 | Three-node placement gives actual missed/covered names and a manually provable minimum before abstraction; input identities, constraints and output are explicit. |
| Derivation/saved work | 3 | 20 | 15 | Baseline, fork sharing, wrong downward rule and N-before-K explain saved work and exclusions. Deepest-demand exchange is reconstructable but introduces residual/fixed-camera reasoning in one dense paragraph, a minor pacing burden for this target. |
| Maintained state/correctness | 4 | 20 | 20 | Child/sibling/parent sequence, descendant invariant, missing children, historical N and root repair all agree with independent calculations and executable source. |
| Interaction/visual meaning | 4 | 20 | 20 | Prediction, retained ledger, rewind/reset/endpoints and state preservation work; current versus installed camera now visibly distinct. |
| Python/cost | 4 | 15 | 15 | Concrete transition maps to executable faithful Python; fresh oracle/counterexample and maximum chains checked; mutation and baseline/submission/snapshot costs agree; exact transfers verified. |
| Bilingual/device | 4 | 10 | 10 | Equivalent reasoning and localized identity, preserved state, readable narrow selected labels/ledger, keyboard scroll/focus, disabled contrast and 200% reflow observed. |
| **Total** | | **100** | **95** | Every dimension ≥3; complete applicable evidence; no required open finding. |

**Outcome: accepted for this candidate and review scope. Required open IDs: none.** This is an independent review, separate from publication approval.

Limitations: headless Chromium/Linux and emulated widths/CSS zoom, not physical-phone testing, native browser menu zoom or measured human comprehension. Saved official selector evidence was inspected but no live selector interaction was claimed. No successful LeetCode submission or public deployment was performed. A first scratch browser driver exited because stdin was not kept open; it was relaunched with a PTY before further actions, with no candidate defect inferred. Only this report and its exclusive evidence directory were written; git status showed those two new paths only. Frozen implementation, prior evidence and services were not changed.
