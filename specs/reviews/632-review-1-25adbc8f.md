# Independent review: 632

Candidate: f9bf187027ca6851735c3b337e2ef39c8fee5545. Preview: http://127.0.0.1:18782/leetcode/632/. Reviewer: this independent review run; exact model identity unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen dimensions/weights: problem 15, derivation 20, correctness 20, interaction 20, Python/cost 15, bilingual/device 10. Python is the preferred canonical interface for this algorithms problem. No source, brief, tests, previous review or author notes were opened before this record.

## Cold browser walkthrough (saved before source audit)

Real Chromium via Playwright, desktop 1440×1000. Initial browser read included the entire rendered English lesson. Author self-check footer is a claim, not review evidence.

| Step/question | Action | Observable result | Causal conclusion in my words |
|---|---|---|---|
| 01: what constitutes coverage? | Read the time-list analogy and click Inspect [4,6] after initial [1,4]. | Initial chooses 1,2,4 with width 3; alternative chooses A=5,B=6,C=4 with width 2. Bounds, inclusive endpoints, tie rule and k are explicit. | Values need not be equal: each row needs a representative between the endpoints. Width is endpoint subtraction. |
| 02: why move the minimum? | Read enumeration, concrete replacements, wrong-maximum example and invariant. | Holding 1 while moving 2→6 or 4→7 widens the candidate; moving 1→5 gives [2,5], tied with [1,4]. | Sorted successors cannot lower the maximum while the minimum is held. An already evaluated interval dominates these alternatives, allowing a row prefix to be discarded. Exhaustion ends the search after evaluating that candidate. |
| 03: what changes together? | Click Advance and compare three times; then Previous comparison. | Selections 1,2,4 → 5,2,4 → 5,6,4 → 5,6,7; candidates [1,4],[2,5],[4,6],[5,7]; best [1,4],[1,4],[4,6],[4,6]. History grows one line per comparison. End explicitly identifies exhausted list 1. Back restores frame 3 and its truncated history. | Only the current minimum's row advances. Best is historical, not necessarily the currently highlighted selection. Borders and “selected” mark values; the rows are not heap storage. |
| 04: can the rule transfer? | Read fresh exercise without reveal. Prediction recorded now: [8,10]. | Choices [2,6],[8,10],[9,10], hidden derivation. | Hand trace predicts [2,6]→[4,8]→[6,9]→[8,10], then A exhausts; [9,10] lacks A. Reveal will be checked after this saved record. |
| 05: how does this become Python? | Read interface, pop/evaluate/push example, cost and boundaries; source disclosure still closed. | Text maps pop (1,0,0), compare [1,4], successor 5 raises maximum 4→5, push (5,0,1); next pop B=2. It explains heap property/path repair and zero-/one-based indexing. | The visible next frame combines a successor insertion with the next candidate evaluation. Heap avoids rescanning all k values; current_max remains valid because successors are nondecreasing. |

Independently chosen input, prediction BEFORE execution: [[0,7],[3,8],[5,9]] returns [7,9]. Hand candidates [0,5] width5, [3,7] width4, [5,8] width3, [7,9] width2; then first row exhausts. Counterexample to advancing the maximum: same input moves C 5→9 while retaining 0 and 3, yields [0,9] then exhausts C, missing [7,9]. This is a preset-only UI; these custom-input verifications will be **code checks**, not custom UI experiments.

Cold screenshot: `632-evidence/632-review-1-25adbc8f/cold-desktop.png` (full page, frame 3). Cold record saved before opening canonical source. No claim of measured novice comprehension or official submission success.

## Post-cold source and executable audit

HEAD equals the nominated revision. Served bytes for index.html, app.js, core.js, copy.js, solution.py, python-code.js and style.css were independently compared with checkout bytes (all equal); SHA-256 receipts are in `632-evidence/632-review-1-25adbc8f/independent.json`. Canonical solution SHA-256: `202791263e07f33a17695ec93a2daa11777bb0ccf6a26e606fd1555a3e42977f`. No implementation changes occurred. The rendered-state contract was first read after the cold record was saved.

Read the [official statement](https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/) normally through web browsing. It exposed the sorted/nonempty contract, inclusive coverage, width/left tie ordering, both examples and all bounds, matching the lesson. No access bypass was used. The lesson-local official GraphQL receipt contains the Python3 `Solution.smallestRange(self, nums: list[list[int]]) -> list[int]` skeleton and integer-array return metadata; the actual canonical code uses that interface. Python is faithful here; no non-Python language contract or JavaScript-category exception applies. `LANGUAGE_FILES` in the registration script specifies solution.py / python-code.js / PYTHON_SOURCE, which are the audited files. No analogy is presented as a submission.

Source reasoning: the heap initially contains exactly one tuple per row. Popping removes the minimum of the complete selection; current_max still names that selection's maximum, so comparison occurs before exhaustion or successor insertion. A successor is at least the removed minimum. For k>1, an old maximum remains unless all selected values equal the popped value; in that case any successor is at least that maximum. For k=1 the successor itself is the new maximum. Thus max(old maximum, successor) remains exact. Tuple comparison handles width then left endpoint, and row/index heap ties affect only visitation order. Comparing before returning handles singleton rows and the final candidate. Prefix-discard dominance excludes all unseen improvements at exhaustion. Input is read only.

Heapify is O(k); at most N pops and N−k pushes cost O(log(k+1)) each, including the constant-cost k=1 case. O(N log(k+1)) time and O(k) auxiliary space are valid upper bounds. The actual k=1 code scans the row even though its answer is the first value, as the lesson explicitly says. The baseline product pools cost O(N), one selection costs O(k), yielding O(kP) time and O(N+k) auxiliary space. Replay snapshots/history are explicitly distinguished from submission memory.

Independent **code checks** executed the actual solution.py using runpy with Python `-B`, comparing with Cartesian enumeration and checking unchanged input:

| Input | Predicted/oracle endpoints | Actual |
|---|---|---|
| [[0,7],[3,8],[5,9]] (cold prediction) | [7,9] | [7,9] |
| [[-9,-2],[-8,-1]] | [-9,-8] (earlier tie) | [-9,-8] |
| [[-100000],[100000]] | [-100000,100000] | [-100000,100000] |
| [[2,2,9]] | [2,2] | [2,2] |
| [[1,4],[2,5],[3,6]] | [1,3] | [1,3] |
| [[0,0],[0],[0,1]] | [0,0] | [0,0] |

All preserved their input. The custom wrong-maximum counterexample is independently confirmed by the first result and the hand calculation recorded above. It was not entered into the preset-only browser UI.

Inspected tests/README.md, test_core.py, browser.cjs and accessibility.cjs **before running them**. Verified their output paths honor OUTPUT_DIR; every run used `OUTPUT_DIR="$PWD/specs/reviews/632-evidence/632-review-1-25adbc8f"`. Executed:

- `python3 -B leetcode/632/tests/test_core.py`: passed 7,239 exhaustive inputs, 1,500 seeded random inputs, 8,744 total cases, 31,729 intermediate frames, maximum 3500×50 fixtures, canonical input immutability, mirror equality, zero duplicate localization keys and complete translation pairs. Its independent oracle enumerates selections rather than reproducing heap advancement; frame checks include pointers, best, exhaustion and discarded-prefix dominance.
- `node leetcode/632/tests/browser.cjs`: passed 32 recorded state/control checks, 28 screenshots, no browser errors. Both locales, every preset/frame and rewind/replay, reset/endpoints, prediction options, keyboard, clipboard, offline source, source download, links and layout paths were exercised.
- `node leetcode/632/tests/accessibility.cjs`: passed actual computed contrast/control geometry, all selected preset labels at 320px, and 390px with synthetic 200% CSS zoom.
- Required root preflight: `python3 -B scripts/register_leetcode_lesson.py 632 --validate-only`: exit 0, no stdout, on both invocations. Metadata complexity is the single nonempty string `O(N log(k+1)) time; O(k) auxiliary space, where N is the total number of elements`.

Generated results live only in this review's evidence directory: core.json, browser.json, accessibility.json, independent.json and associated captures/downloads. No tracked candidate assets or previous evidence were regenerated. Counts corroborate numerical behavior; they do not supply the teaching scores.

## Rendered interactions, language and accessibility observations

Independent browser recheck used Chromium 156.0.8078.4 on Linux. Cold exercise prediction [8,10] was selected and revealed: feedback showed all four selections, widths 4,4,3,2 and A's exhaustion, agreeing with the recorded prediction. Changing to [9,10] hid the derivation before the next reveal; revealing explained that A was uncovered. Reset cleared selection and disabled reveal. This is transfer to different values, including coverage and premature-stop distractors, rather than recall of the trace's answer.

At tiny frame 2, switching EN→中 displayed `刚完成：清单 1 的 1 → 5，其余选值不变；再比较候选。`, current `[2,5]` width 3, best `[1,4]` width 3, and next minimum 2 from row 2. Returning to EN restored identical stage text and frame. Chinese proof, baseline, heap explanation, mapping, complexity and feedback pairs convey the same causal claims as English. Lookup entries are two-string pairs; duplicate-key and parser checks pass. These are semantic checks in addition to key presence.

Tiny endpoint independently showed current `[5,7]` width 2 versus best `[4,6]` width 2, with explicit compare-before-stop explanation. Previous→next reconstructed `[4,6]` then `[5,7]` and matching history. All preset endpoints in both languages were checked: tiny [4,6], official [20,24], duplicates [1,1], negatives/ties [-5,-4], one list [-2,-2], singleton rows [1,20]. Changing presets resets comparison/history, while changing viewport through 320/390/1440 preserves the selected frame and stage text exactly. Keyboard radio ArrowDown, Enter reveal, Tab to Last comparison and Enter advance work; focus outline is visibly 3px. Initial Previous and terminal Next/Last are disabled appropriately.

Exact canonical parity was verified without trim/whitespace normalization across mirror string, code element textContent, successful clipboard payload/readback, fallback textarea, and downloaded bytes, including the final newline. Beyond the provided fallback-selection test, independently denied writeText, clicked Copy, pressed Control+C on the automatically selected textarea, and read the native clipboard back: exact canonical equality. The manual fallback is usable, not just present.

Inspected captures directly using image viewing: en-320-rows.png, en-320-select.png, zh-320-select.png, en-320-bestRead.png, zh-390-zoom200-row1.png, zh-390-zoom200-values.png, en-zoom200.png, en-fallback.png, en-prediction.png, and independent-terminal-desktop.png. At 320px official rows wrap cells while retaining row association and full “selected” labels; no essential text collision was observed. At 390px/200% Chinese state readouts wrap complete candidate/best values into separate boxes. Desktop 200% screenshot truncation at the viewport bottom is scrolling, not clipped content. The sticky nav overlays the top edge of the tall terminal component screenshot at that scroll position; separate select captures show complete labels, and ordinary navigation positioning passed. No container overlap was treated as proof of text collision.

Closed select width at 320px is 260 client pixels: longest measured English label is about 146.11px, and longest Chinese label about 80px; each also passed the script's 48px combined padding/arrow allowance. CSS font stack is PingFang SC, Microsoft YaHei, system-ui, sans-serif; actual resolved font is not asserted. On this Linux environment both selected labels are visually complete. Disabled text contrast is 6.45:1 with opacity 1 and a dashed border; state text 13.40:1, selected values 10.91:1. Their actual screenshots remain readable. Forced-color focus and reduced-motion behavior also pass.

## Findings and scores

No earlier 632 review report exists in this checkout; there are no inherited finding IDs to close. No required finding was identified. Required open IDs: **none**.

Optional observation **632-O1** (low, open, non-blocking): section 05 uses tuple ordering and a heap-building comprehension, while the baseline uses product/generator/lambda syntax. For a basic-Python reader the state mapping is clear but reading these compact expressions takes some extra effort. Expected improvement: a brief plain-loop equivalent or syntax gloss. Actual behavior is correct and the concrete pop/compare/push example supplies the essential algorithm bridge. Applies to both locales at this revision, all viewports; owner: lesson author, optional follow-up. No frozen requirement is violated.

| Dimension | Score /4 | Weight | Observation/rationale |
|---|---:|---:|---|
| Problem/terms/hand calculation | 4 | 15 | Inclusive coverage, units, indices, tie rule and valid input are explicit; switched [1,4]→[4,6] computes real representatives before abstraction. |
| Causal derivation/saved work | 4 | 20 | Enumeration completeness and exponential repeated work lead through actual wider replacements to safe discard; wrong-maximum rule is concretely refuted. |
| Maintained state/correctness | 4 | 20 | Defined invariant, preserved maximum, prefix dominance, tie ordering and compare-before-exhaustion are reconstructable and independently checked. |
| Interaction/visual meaning | 4 | 20 | Each comparison updates selected row/candidate/best/history consistently; rewind restores them; prediction/change/reset and distinct current/best identities work. |
| Python/cost | 3 | 15 | Executable faithful solution and fresh examples pass; concrete tuple transition and costs are explained, with minor compact-Python syntax friction (632-O1). |
| Bilingual/device | 4 | 10 | Equivalent causal copy and live state labels; locale/resize preserve state, keyboard/focus and readable 320/390/desktop/zoom views checked. |

Weighted score: **96.25/100**. All dimensions ≥3; zero required open findings; browser, source, executable and preflight evidence complete within the stated scope.

## Limitations and conclusion

Zoom evidence uses Chromium CSS zoom at 200%, including 390px combined stress, rather than a physical device or OS/browser-toolbar zoom. Native Mac/Windows fonts, screen readers and real novice comprehension were not measured. The official live code-selector UI was not independently exercised; Python's faithful callable is supported by the saved official skeleton and direct canonical execution. No successful LeetCode submission is claimed. This is a lesson review, not publication or deployment approval.

**Accepted** for candidate f9bf187027ca6851735c3b337e2ef39c8fee5545 under the frozen six-dimension rubric. Evidence is confined to `specs/reviews/632-evidence/632-review-1-25adbc8f/`; the only report written is this exact requested path.
