# Independent review: LeetCode 329

Candidate: `8e0567de7cfa8b27eb3c4985dc993311ce148850`. URL: http://127.0.0.1:18770/leetcode/329/. Review date: 2026-10-25. Reviewer: independent fresh-reader run; exact model identity unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen weights: 15/20/20/20/15/10. Interpretation fixed before browsing: faithful official Python submission and actual executable cost. Publication is separate.

## Cold browser walkthrough (saved before source inspection)

Only the frozen rubric was read before opening the candidate in real headless Chromium through Playwright (environment browser executable, NODE_PATH package). No BRIEF, tests, author files, or prior review was consulted. Candidate page copy itself was visible, including its self-check footer, which was not used as evidence. Initial viewport 1280×900.

| Step | Question | Action | Observable result | My causal paraphrase |
|---|---|---|---|---|
| 1: hand calculation | What is counted and which moves count? | Read the tiny 2×2 diagram; predict four cells, then reveal. | `1→2→3→4`: three moves, four cells. Input limits, orthogonal adjacency, strictly larger, arbitrary start, no wrap/equality are explicit. | All four cells are visited legally, so four is both attained and an upper bound. |
| 2: reused suffix | Why save work, and why wait? | Read baseline and reconstruct L(4)=1, L(3)=2, L(2)=3, L(1)=4. Compare the shown greedy branches. | Both starts 1 and 2 revisit 3→4; recurrence chooses maximum suffix. Greedy 1→9→10 has 3 versus 1→2→3→4→10 having 5. | A high next value does not ensure a long remaining route. Increasing values prohibit cycles; larger-neighbor results must be settled before the smaller dependent cell. Last dependency round plus one computes max, not min. |
| 3: waiting lab | What changes each round and what remains invariant? | Predict peaks leave first; click next four times on the four-cell preset. | Initial out values 2,1,0,1. Round 1 fixes 4 with L=1, changes 1's out 2→1 and 3's 1→0. Round 2 fixes 3 with L=2 and readies 2. Round 3 fixes 2 with L=3 and readies 1. Round 4 fixes 1 with L=4. Ledger retains every change. | out counts only larger neighbors still present. Ready marks next round, not an immediate chain reaction. Finalized L is round number; original values remain visible. |
| 3: history/presets | Does control history represent real prior state? | Back once at endpoint, reset, choose greedy preset, remove to end. | Back restores round 3, ready 1 and three fixed cells; reset restores original counts and empty ledger. Greedy ends at 5 rounds with L(1)=5, L(9)=2, L(10)=1, L(2)=4, L(3)=3, L(4)=2, retaining five rounds. | Whole-round snapshots preserve both data and dependency history; preset change intentionally restarts this experiment. |
| 4: transfer | At a fork, which dependency determines L(1)? | Before reveal predict 5 via 1→2→3→4→7 in [[1,2,7],[6,3,4]]. Exercise disabled until selection. Intentionally choose 2, reveal, change to 5 and reveal. | Wrong feedback explains both branches and nonadjacent 4/6; changing choice hides explanation; correct feedback gives L(1)=1+max(4,1)=5. | Removing early peak 6 cannot settle 1 while 2 remains. This tests the dependency maximum in a different matrix, beyond recalling the initial snake. |
| 5: implementation | How does Python preserve round boundaries? | Read displayed Python beside the concrete first-round explanation. | `range(len(queue))` freezes batch size; decrement smaller neighbors, append only at zero; bounds, time, space, mutation and stack behavior explained. | Removing (1,0)=4 changes out(1,1) 1→0 and out(0,0) 2→1. These are the decrement statement and conditional enqueue; newly ready 3 waits until round 2. |
| Both languages | Does Chinese explain the same mechanism? | Switch to Chinese after exercise reveal. | Correct prediction and selected answer persist; equivalent terms, recurrence, baseline cost, induction, first-round changes, boundaries, and code explanation visible. | Translation preserves why waiting implements maximum suffix length, rather than just translating headings. |

Independent predictions recorded before any canonical execution: fresh input [[1,2],[2,3]] returns 3 (either equal-valued 2 can be used, never both); counterexample [[1,9],[9,2]] returns 2, not four sorted cells, since 1 and 2 are diagonal and equal 9s cannot connect. The UI accepts presets only: these will be **code checks**, not custom-input UI experiments. The initial exercise-reveal click timed out because disabled; rerun explicitly confirmed disabled state and then exercised enabled choices successfully.

Cold screenshots: `329-evidence/329-review-1-7a3ca81c/cold-initial.png`, `cold-end.png`, `cold-zh.png`. Capture is evidence of rendering, not proof of comprehension. Source audit and final assessment follow below after this saved record.

## Source, official contract, and independent execution

HEAD equals the candidate revision. Served bytes were independently compared with checkout bytes for index.html, app.js, core.js, copy.js, local.css, python-code.js, solution.py, ../common.js and ../style.css: all exact matches. Identifying SHA-256 values: index.html `82b08cb05098919e12ff602cd18867a0ba7341f302f47bcedcdc71e995c4421e`; app.js `fae7c55a4f0cf5250aa773b793d5106ae61fc2fb0864c2853e2330794d51c752`; core.js `9170171f054708e37ea766bc16fc941392a7016dcb5ff965ddca0bb480cbda00`; solution.py `fe7fd540a00fb30a79e0e441755f146e699d228d16e7f9ddc8e6d96871a2be18`.

Read the [official statement](https://leetcode.com/problems/longest-increasing-path-in-a-matrix/) normally through web access. Orthogonal movement, no wrap/diagonals, the three examples (4,4,1), dimensions 1…200, and values 0…2³¹−1 agree. A normal public `https://leetcode.com/graphql/` question/codeSnippets query independently returned questionId 329 and Python3 starter:

```python
class Solution:
    def longestIncreasingPath(self, matrix: list[list[int]]) -> int:
```

This is exactly the canonical callable, not an analogy. No non-Python solution or language-contract exception applies. `LANGUAGE_FILES` in scripts/register_leetcode_lesson.py specifies `solution.py`, `python-code.js`, `PYTHON_SOURCE` for Python; these exact names and export were checked. Mirror string, displayed code, successful clipboard payload, selected manual-copy fallback, and downloaded file equal the complete canonical source, including whitespace. Clipboard success/rejection were deterministic API substitutions exercising the actual click handler, not proof of OS clipboard permissions.

Executed the actual solution.py using importlib under `python3 -B`, independently of core.js. The two pre-recorded fresh predictions passed: [[1,2],[2,3]]→3; [[1,9],[9,2]]→2. Additional independently selected cases: [[0]]→1; [[2147483647]]→1; [[3,3,3]]→1; [[4,1,3,2]]→2; [[0],[2147483647],[0]]→2. All preserved input values. An independent explicit route enumerator checked all 729 3×2 matrices over {0,1,2147483647} against canonical Python successfully. These are code checks; no custom-input UI is claimed.

Correctness reconstruction: strict ascent prevents revisiting a cell and ensures every finite remaining graph has a peak. Initially out is each cell's count of larger orthogonal neighbors. Removing a batch decrements exactly the smaller neighbors' remaining dependencies. A remaining cell becomes ready only after its last larger neighbor disappears. Its round is one plus the largest successor round, exactly the longest-suffix recurrence. Initial peaks have suffix length one. Frozen queue size prevents a newly ready node from entering the same round, and strict inequalities exclude equal values. Each cell enqueues once, so termination removes all cells; the largest round is the global longest path. core.js stores deep round snapshots with matching semantics; Python does not retain these snapshots or per-cell L. This distinction is stated on the page. The submission's two four-direction scans per cell give O(mn) time; out plus queue give O(mn) auxiliary space, without recursion or input mutation.

## Inspected tests and observed interactions

Inspected test_algorithm.py and browser.cjs before execution, including output-directory handling and all writes. Generated outputs went only beneath this run's exclusive directory, preserving candidate/author evidence. The JSONs retain their programs' original `kind: author self-check` labels; they are rerun outputs, not independent teaching judgments.

Commands from repository root:

- `OUTPUT_DIR=specs/reviews/329-evidence/329-review-1-7a3ca81c/algorithm python3 -B leetcode/329/tests/test_algorithm.py` — exit 0, 1,095 small cases, 3,845 checked intermediate frames; 200×200 snake→40,000, 200×200 equal→1, long row/column→200; parity and mutation checks passed.
- `OUTPUT_DIR=specs/reviews/329-evidence/329-review-1-7a3ca81c/browser node leetcode/329/tests/browser.cjs` — exit 0, no recorded browser/asset errors. All six presets forward/back/reset/end and all three predictions exercised in both locales. Keyboard Enter advanced; Tab reached reset; Enter reset; focus outline was 3px. Disabled endpoint controls were correct.
- `python3 -B scripts/register_leetcode_lesson.py 329 --validate-only` — exit 0, no output. Metadata complexity is exactly the nonempty string `O(mn) time; O(mn) auxiliary space`. No registration performed.

The rerun checks locale changes preserve preset, round, radio and revealed feedback; changing a prediction hides its explanation; lab reset preserves the independent exercise selection. Hand reveal/hide works. Source remains available with blocked storage and offline after initial load. Download matches source. Duplicate-key detection scans the actual COPY object definitions before evaluation, rather than merely checking the overwritten result; all entries have two nonempty strings. Reviewed common.js locale construction and app.js dynamic bindings: no separate competing translation namespace is introduced.

Representative semantic bindings were checked as rendered, independently of mere key presence: four-cell round 1 says 2→1 for (0,0), 1→0 for (1,1), ready versus fixed state labels identify the correct cells; greedy round 2 lists removal of 4 and 9 and two decrements of 3's count; exercise feedback distinguishes shorter branch and invalid adjacency in both locales. These match actual dependencies. Copy failure text refers to selected source and system copy, separately from incorrect-prediction feedback.

Browser suite exercised widths 320, 390, 736 and 1440 in both locales, plus 200% CSS zoom at 1280. It checked document overflow, each cell's internal dimensions, minimum 48px controls and focus geometry. Computed muted text contrast is at least 6.45:1 across used dark panels; other tested text roles exceed this. Disabled controls retain opacity 1 and readable muted text. No interaction depends solely on color: readiness and finalized L also have text/checkmarks.

Captured and visually inspected cold-initial.png, browser/en-320-board.png, browser/zh-320-board.png, browser/en-1440-board.png, browser/en-zoom-200-board.png, browser/zh-zoom-200-board.png, browser/zh-390.png, settled-en-390.png and settled-zh-390.png. The dense official-example round 2 includes fixed L=1/2, pending out=1 and ready out=0 simultaneously; coordinate/value/state associations remain readable without text collisions in either locale. At 320 English state text wraps to another line but remains inside its cell. The 390 settled English viewport begins partway through the board because of current scroll position; focused board images explicitly place the full grid beneath navigation, so this capture crop is not treated as clipping. Full-page screenshots likewise are not the sole basis for layout conclusions.

## Findings, scoring, and conclusion

No earlier 329 review report was found under specs/reviews after the cold walkthrough; there are no prior required finding IDs to close. No required defect found in this candidate. Required open IDs: **none**.

Optional improvement `329-R1-N1` (low, open, not required): step 5 introduces deque construction, generator comprehensions and popleft together. A basic-Python reader can reconstruct queue purpose and frozen batches from the explanation, but a brief concrete queue before/after example and definition of popleft would reduce syntax friction. Observed in English/Chinese, desktop and mobile, four-cell example; expected enhancement is easier syntax transfer, actual algorithm explanation remains correct and executable. Owner: lesson author; no fix revision or closure claimed.

| Dimension | Score | Weight | Rationale |
|---|---:|---:|---|
| Problem/terms/hand calculation | 4 | 15 | Tiny legal path precedes abstraction; clear cell units, bounds, adjacency and manual upper bound. |
| Derivation/saved work | 4 | 20 | Explicit repeated suffix, baseline bound, recurrence, acyclicity, counterexample and last-dependency causal bridge. |
| Maintained state/correctness | 4 | 20 | Exact before/after counts, round invariant, induction, strict inequalities, endpoints and independent intermediate/execution checks. |
| Interaction/visual meaning | 4 | 20 | Predict/reveal/change, retained ledger, exact rewind/reset, preset semantics and value/state distinction observed. |
| Python/cost | 3 | 15 | Actual official source executed; parity, mutation and costs verified; deque/comprehension syntax is minor friction for the stated reader. |
| Bilingual/device | 4 | 10 | Equivalent causal text/state bindings, keyboard/focus, readable dense cells across required widths and zoom, contrast and fallback checked. |

Weighted score: **96.25/100**. Every dimension is at least 3, zero required open findings, and browser/source/executable/preflight evidence is complete for this scope. **Accepted** for candidate `8e0567de7cfa8b27eb3c4985dc993311ce148850`.

Limitations: headless Chromium with emulated viewports and CSS 200% layout/text zoom, not a physical device or browser-chrome zoom test. No real human comprehension study, successful LeetCode submission, publication or deployment is claimed. Official access succeeded normally. No implementation, shared files, services, tests, Git configuration or earlier evidence was changed. This report and this run's evidence are the only review writes.
