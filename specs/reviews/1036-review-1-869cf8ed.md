# Independent review: 1036 — Escape a Large Maze

Candidate: `5f0fb45c7e38251720a683978bf4ace6adcea8a0`. URL: http://127.0.0.1:18770/leetcode/1036/. Target: basic Python, lists, loops, functions, elementary recursion. Reviewer: independent agent run; exact model identity unavailable. Frozen weights: 15/20/20/20/15/10. This is a lesson review, not publication approval or measured human comprehension.

## Cold browser walkthrough (saved before source, tests, contract, or earlier reviews)

Read only `specs/leetcode-review-gates.md` before opening Chromium through Playwright. Interpretation frozen: official Python, six dimensions, no required gap may be compensated by score. Desktop 1365×900. Inspected `cold-desktop.png` visually; operated the actual page. Read the displayed final Python only by opening its browser disclosure.

| Teaching step / question | Action and prediction | Observable result | Causal conclusion in my words |
|---|---|---|---|
| 1. Can the corner move? | Read rules; manually count source (0,0), blockers (1,0),(0,1), target (0,2). Predict false. | Only start reachable; orthogonal moves blocked or outside 0..999999. | A free endpoint need not have a legal outgoing edge; diagonal movement cannot rescue it. |
| 2. Why stop before exploring a trillion cells? | Read FIFO baseline, then clear-line proof. Independently follow its counting argument. | Definitions of queue, tuple, set, component, clear row/column; O(W²) baseline; at most b blocked rows and columns, L=b². | Clear lines all meet within one connected region C. A cell outside C must occupy both a blocked row and column: at most b² possibilities. L+1 seen cells certify membership, not arrival. |
| 3. What state and evidence does each endpoint need? | A: predict first expansion removes source and adds nothing; click next, final, previous, reset. Then select B–F and inspect their final states. | A event 1 has seen={(0,0)}, pending empty; event 2 returns false. Back restores event 1; reset restores pending source. B false at reverse endpoint (event 5); C true via direct endpoint (event 6); D true via budget (event 8); E true with L=0 (event 3); F opposite corner false (event 2). | Seen records reachable cells and queue records unexpanded work. Empty queue proves the small component is exhausted. Both endpoints must qualify; a free source alone cannot establish reachability to a trapped target. |
| 4. Must the budget be exceeded? | Before reveal, predict true for the six-cell pocket: path (0,0)→(1,0)→(1,1). Select second explanation and reveal. | “Correct”; reveals that direct reach succeeds below L=16 and that moving once alone is insufficient. | Budget exceedance is sufficient, not necessary. A direct path is independently sufficient evidence. |
| 5. How does the proof map to Python? | Open code disclosure; map A's expansion to popleft, four neighbors, bounds/walls/seen checks. | All four neighbors fail, queue empties, len(seen)=1≤4 returns false; outer and skips reverse check. Cost text includes n input entries and b distinct blockers; trace-memory disclaimer explicit. | Marking seen on enqueue prevents duplicate work. Each expansion adds at most four; strict >L and the two checks implement the proof. Inputs are converted, not modified. |

Fresh independently chosen inputs, predictions recorded **before source execution** (UI is preset-only; these will be **code checks**, not custom UI experiments):

- Fresh small case: blockers [[1,0]], source [0,0], target [2,0]. Predict true: detour through y=1; source first expansion reaches (0,1), so seen=2>L=1; reverse endpoint also belongs to C.
- Counterexample to “able to move implies escape”: blockers [[0,2],[1,1],[2,0]], source [0,0], target [3,3]. Predict false: source can move, but its component is exactly {(0,0),(1,0),(0,1)}. Exhaustion occurs below L=9. Unlike preset A, it is not a singleton.

Cold screenshots: `1036-evidence/1036-review-1-869cf8ed/cold-desktop.png`, `cold-revealed.png`. The page explains each key term and the optimization before code, with a hand-worked tiny case preceding abstraction. No author notes were used to supply an explanation.

## Post-cold audit

### Identity, official contract, and scope

Checkout HEAD equals the requested candidate; working tree initially contained only this review and its evidence. Served bytes equal local candidate bytes for the seven lesson runtime/source assets and shared `style.css` / `common.js`. SHA256 receipts are in `independent-audit.json`; canonical Python SHA256 is `1074eb82b67764b1a702e8eb673e2d3a89ce4f0aa78ca825cf6c1be213bac35e`. No candidate files, author evidence, services, or shared files were changed.

After saving the cold walk, read the rendered-state supplement, canonical source, trace, UI, bilingual dictionary, styles, metadata, author brief, official capture, and tests. Search found no earlier review for 1036, so there are no prior required findings to close. The brief contains a stale section-4 description (“three-cell pocket”); the actual UI correctly uses six cells and L=16, so that author-note discrepancy does not affect the lesson.

Read the public [official statement](https://leetcode.com/problems/escape-a-large-maze/) normally using web access: million-square side, four orthogonal directions, 0–200 blocker entries, distinct unblocked endpoints, boolean reachability. Both official examples match. The lesson-local `tests/evidence/official.json` records the faithful Python3 `Solution.isEscapePossible(self, blocked: list[list[int]], source: list[int], target: list[int]) -> bool` interface, matching the actual callable. Python is the preferred available faithful language; no non-Python contract or conceptual substitution is involved. `LANGUAGE_FILES` in the registration script confirms `solution.py`, `python-code.js`, and `PYTHON_SOURCE` as the canonical/mirror/export triplet.

### Independent calculations and executable behavior

Executed the actual canonical file through `runpy.run_path`, instantiated `Solution`, and checked the predictions saved above: one-wall detour **true**; movable three-cell pocket to outside **false**. The latter exhausts exactly three cells, demonstrating why “can move once” fails. Also checked a reachable target inside that pocket, no blockers across opposite corners, reverse-direction trapped opposite corner, and 200 blockers away from a clear route.

Added 100 independent deterministic cases (seed 869): form a blocked ring at x/y=0 or 8, choose random interior blockers within 1..7, and use ordinary complete BFS inside that sealed 7×7 interior as the independent oracle. This avoids using the lesson's budget or coordinate-compression oracle as its own answer. All 106 canonical calls matched and preserved deep-copied inputs. These are code checks; the UI deliberately has only presets.

Independently checked all six preset meanings: A and F have no legal outgoing edge; B reverses A's trap; C has adjacent endpoints inside its three-cell pocket; D detours via (0,2),(1,2),(2,2) past its short wall; E has no obstacle. Expected results false/false/true/true/true/false agree with the completed rendered traces.

For a concrete intermediate nontrivial transition, B starts with seen={(4,4)} and queue=[(4,4)]. Expanding it in canonical direction order adds (5,4),(4,5),(3,4),(4,3): seen=5 and pending=4, L=4. The next decision certifies C, not final connectivity. Reverse initialization starts at (0,0), then exhausts, yielding false. The browser displayed these same counts and coordinates. This transition maps exactly to popleft, the four offsets, seen.add, and queue.append.

Invariant: every seen cell has a legal path from this endpoint; the pending queue is precisely discovered but unexpanded work. Seen-on-enqueue ensures uniqueness. A completed expansion removes one pending cell and adds all new legal neighbors. With seen≤L before expansion and at most four additions, storage is bounded by L+4; queue exhaustion enumerates the reachable component. Stopping above L instead certifies membership in the unique clear-line component. Two successful checks imply connectivity, including direct reach inside a pocket. The trace stores separate expansion and stop-decision snapshots and matches this timing. b=0 succeeds immediately at initialization; coordinates 0 and 999999 never wrap or cross the grid boundary.

The displayed baseline really performs full-grid BFS and has worst-case O(W²) time/space on this domain; the optimized source avoids almost all that work by changing the stopping condition. Constructing walls scans n entries with O(b) retained keys. Each endpoint processes O(b²+1) cells with expected constant-time set operations, so the displayed expected O(n+(b+1)²) time and O((b+1)²) space claims cover b=0, b=1, b=200 and duplicate entries. The two calls are sequential. Snapshot teaching memory is explicitly excluded. Duplicate entries are handled safely even though the official statement does not separately promise distinct blockers.

### Inspected and rerun checks

Inspected all four test programs before execution. They accept `OUTPUT_DIR`; no page builder or registration mutation was run. Commands below were run from repository root with `OUTPUT_DIR` set to this run's exclusive absolute evidence directory:

- `python3 -B leetcode/1036/tests/test_solution.py`: passed, 2,761 canonical cases and 2,626 finite theorem grids. Its compression oracle and theorem loops were inspected; these are reused author tests rerun here, separate from the 106 independently chosen canonical checks.
- `node leetcode/1036/tests/test_core.cjs`: passed, six presets / 32 snapshots; checks distinct seen/queue entries, in-bounds unblocked reachability, exact expansion dependencies, stop decisions, mirror equality, and duplicate dictionary keys before parsing (79 unique pairs).
- `node leetcode/1036/tests/browser.cjs`: passed, 12 locale/preset runs, 16 viewport/zoom layouts, four native fallback transfers. `browser.json` records the outcomes.
- `node leetcode/1036/tests/browser_extra.cjs`: passed, constrained selected-label fit, long-coordinate layouts, keyboard diagram scrolling, header captures. `browser-extra.json` records geometry.
- Required safe preflight: `python3 -B scripts/register_leetcode_lesson.py 1036 --validate-only` — **exit 0, no output**. `lesson-entry.json` complexity is exactly one nonempty string covering time and space.

The generated harness reports retain their original “author self-check” labels. Their execution here is independent rerunning of inspected tests, not proof of teaching quality or a relabeling of the author run.

### Browser interactions, bilingual meaning, source parity, and access

Chromium 156.0.8078.4, Linux host. Real browser page operated in both locales. Initial/terminal buttons disable correctly; next/previous restores complete snapshots, reset returns initialization, end reaches the true endpoint, and preset change restarts the selected search. Enter activates the next button with a visible 3px focus outline. All snapshots were replayed and rewound in each language. Current-source `[S v]` remains distinguishable from another discovered pending `v Q` cell by brackets, outline, and explicit Q marker (`overlap-en.png`, `overlap-zh.png`). The drawing is clearly labeled as an 8×8 crop rather than walls.

Prediction: all three options revealed the corresponding feedback; the second is correct, the other explanations are rejected for causal reasons. Changing the answer hides feedback until another reveal. Switching locale preserves choice, reveal, and search state while translating meaning. The question has its own fixed input, so changing the independent trace preset does not alter that exercise. Independent resize roundtrip 320→390→1440 and zh→en→zh at B's first expansion preserved seen=5/pending=4. Chinese formula includes the complete strict >L and C membership meaning. Chinese expansion, escape, exhausted-queue, direct-reach and prediction explanations agree with their English meanings. Both localized H1 and document title retain #1036 and the appropriate title, including the narrow zh/en/zh roundtrip.

Source parity is exact, including the final newline: decoded `PYTHON_SOURCE`, displayed `#code.textContent`, successful automatic clipboard text, native manual fallback transfers, and downloaded files match canonical `solution.py`. For every fallback attempt (twice per locale), a fresh distinct non-source sentinel was written and read back before automatic writes were disabled. The real Copy button focused and selected the full fallback textarea, Linux Control+C transferred it, and native clipboard readback equaled canonical source. No test-written source clipboard value substitutes for that transfer. No newline normalization was applied. `download-en.py` and `download-zh.py` preserve exact bytes.

Reviewed screenshots at desktop, 390 and 320 px, both locales, 100% and 200% **CSS zoom**; this is the harness's zoom method, not a claim about all browser chrome zoom implementations. No page-wide overflow or text intersection reproduced. At the narrowest enlarged view, readouts wrap into many lines and the diagram intentionally scrolls horizontally. Earlier partial-cell captures were scroll-position artifacts, not internal clipping: after ordinary repeated ArrowRight operation settled at scrollLeft=418, clientWidth=102, scrollWidth=520, `far-zh-200-keyboard-end.png` shows the entire final 999999 coordinate and `[S v]` marker readable. State remains unchanged. This is cumbersome but usable; coordinate text remains associated with its cell. Selected F fits with measured text width 8.304px versus a conservative 50px available at the most constrained zoom; the descriptive preset text is in the adjacent readout. CSS stack: PingFang SC, Microsoft YaHei, system-ui, sans-serif; exact resolved font not inferred.

Inspected cold-desktop/revealed, both overlap images, en-390, zh-320, en-320-200%, Chinese 200% header, far-coordinate and settled state screenshots. Disabled text retains opacity 1. Inspected the suite's actual contrast function, then calibrated that exact function against black/white, red/green/blue luminances, and #747474-on-black=4.492948073111701 (correctly below 4.5). Recorded solid-color ratios include normal text 16.087, hint/disabled 7.079, wall text 6.347, current 8.937, selected controls 13.101, focus/panel 9.809. This supports sampled states; it is not an exhaustive accessibility certification. No browser runtime or asset errors occurred; denied localStorage did not break operation.

Both related links were activated by keyboard and lead to the same served lesson's steps 2/3, which actually explain the promised clear-line bound and discovered-set/two-endpoint reasoning. Official link is exact. No off-lesson concept destination is claimed.

## Scores and findings

| Frozen dimension | Score / 4 | Weight | Rationale |
|---|---:|---:|---|
| Problem, terms, hand calculation | 4 | 15 | Explicit input/output, grid bounds, orientation and illegal diagonal; concrete one-cell hand count before abstraction. |
| Causal derivation and saved work | 4 | 20 | Correct baseline, defined FIFO/component terms, reconstructable clear-line proof and explicit trapped-target wrong rule. |
| Maintained state and correctness | 4 | 20 | Full seen/queue snapshots, precise expansion accounting, both endpoint phases, strict boundary/termination explanation and canonical execution. |
| Interaction and visual meaning | 3 | 20 | Predictions and reversible operations work; all state is available, though cropped narrow views require scrolling between cells and readouts. |
| Transfer to Python and cost | 4 | 15 | Faithful executable callable, explicit line mapping, independent fresh/counterexample execution, exact source parity, valid zero-blocker cost. |
| Bilingual and device access | 3 | 10 | Equivalent complete reasoning and preserved state; 320px/200% view remains usable but needs substantial vertical/horizontal navigation. |

Weighted total: **92.5/100**. Every dimension ≥3. Required open finding IDs: **none**. No prior required findings existed to adjudicate. Narrow-layout navigation friction is reflected in the two 3/4 scores; it did not conceal essential content or reproduce a required readability defect, so no required finding is assigned.

## Conclusion and limits

**Accepted for this candidate revision and inspected lesson scope.** Complete cold/browser/source/executable/preflight evidence is present. Teaching depth, causal correctness, source transfer, bilingual meaning and observed device behavior satisfy the frozen gates. This does not claim a real novice comprehended it, a successful LeetCode submission, public deployment, coverage of every assistive technology, or every browser/font platform. No implementation repair or publication action was performed.

