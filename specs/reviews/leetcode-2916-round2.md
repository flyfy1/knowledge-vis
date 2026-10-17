# LeetCode 2916 — independent novice review, round 2

Date: 2026-10-17. Reviewer: Astra. Frozen candidate: `c83fb52`, reviewed at `http://127.0.0.1:49253/leetcode/2916/`; public URL still served the baseline. Original rubric unchanged. **86.25/100: score threshold met; acceptance conditional on two small corrections below.** B1/B2/B3 teaching bridges are substantially closed. This remains expert assessment, not observed novice comprehension.

## Learner walk before source inspection

I reread the candidate in Chinese, operated the all-distinct range example, switched both partition targets, traversed all lazy frames, switched to English, and repeated changed controls at 390px. Source inspection followed the walk. No implementation-response document was needed.

- **Steps 0–1:** “Each slice contributes a squared distinct count; right endpoints partition the answer.” The baseline Python and 5,000,050,000-visit explanation are now visible. The problem is no longer framed as an unexplained need for a clever structure.
- **Step 2:** “Keeping d saves recomputation, but changing all affected d entries still takes 1+2+3+4=10 operations for four distinct inputs.” The new count showed 4 for the final round and 10 completed increments. Pending and completed totals have explicit scope.
- **Step 3:** “A block's new square sum needs its old S, old Q, length, and increment.” Unchanged correct algebra.
- **Step 4, partition:** “Boxes cover start indices, not input values. A full box stops; only a box crossed by a target boundary splits.” Switching [0,3] to [2,4] visibly changes whole blocks from [0,2]+[3,3] to [2,2]+[3,4]. Node IDs now make the subsequent code trace intelligible.
- **Step 4, lazy:** “At r=4 the request is [2,4]. The [0,2] node is partial, so its old tag must reach the children before modifying [2,2].” Frame 6 retains this request, shows parent S/Q unchanged, and children updated. The new counterexample explains stale 1 → incorrect 2 versus actual 2 → correct 3. This now teaches why push is necessary, not just that it exists.
- **Step 5:** “The request ql/qr stays fixed while left/right shrink with each recursive call; node selects a slot in the three arrays.” The outer scan, ID convention, table, concrete call trace and collapsed complete solution support reconstruction. The Chinese lazy row has one inaccurate word, detailed below.
- **Step 6:** Local r/p/F definitions now support jumping directly here. The paper-prediction instruction remains useful, though the displayed ledger itself reveals all answers.

## Closure of original findings

| Finding | Decision | Evidence |
|---|---|---|
| B1: no tree/decomposition bridge | **Closed structurally** | Interval-only primer defines root/leaf/node; whole versus partial boxes are visible; operation banners retain target range; push preserves actual values and explains an omitted-push error. |
| B2: no visual-to-Python bridge | **Closed structurally** | IDs match recursive call example, current bounds versus request bounds are distinguished, 4*n capacity is explained, and operation-specific snippets connect the diagram to apply/push/pull. Correct the Chinese lazy row before final acceptance. |
| B3: invisible workload/complexity motivation | **Closed** | Baseline is exposed; the all-distinct experiment counts plain-d work; the tree explanation distinguishes boundary descent from whole-block stopping. |

## Remaining issues and smallest changes

1. **Required correction — current node is not its parent.** `leetcode/2916/copy.js:72`, `mapLazy`: Chinese says “已计入父节点、尚未传给孩子的增加量”; English correctly says “included in the node.” Change 父节点 to 当前节点. A node's newly applied increment need not yet be reflected in its parent before pull; the existing trace explicitly demonstrates this. This is a precision error in the central invariant, not an algorithm defect.

2. **Required state-label correction — initial frame mixes completed and next requests.** `app.js:124`, `copy.js:59`: initial banner says r=2 is complete and the next request is [0,3], while the context beneath the tree calls r=2/[1,2] the current target. Both numbers are individually correct but their time labels are ambiguous. Label this initial context “completed round” or show the upcoming request consistently. Later frames are consistent.

3. **Highest-value final learning improvement — one real prediction before reveal.** `app.js:53–57` displays the exact update interval and changed-cell highlight while step 2 asks the reader to predict them; `app.js:79–98` instantly reveals each partition decomposition. These interactions teach through worked examples, but do not establish independent recall. Reuse the existing primer for one fresh target such as [1,3]: show neutral nodes, ask for a decomposition, then reveal/compare. Keep the worked examples available. This is a small assessment improvement, not a request for another section or quiz system.

4. **Density: stop adding prose.** Step 4 remains long at 390px (around 3,100px in the captured final state), but its two subheadings now separate partition from deferred update. Step 5 is easier to scan with the complete listing collapsed. The mechanism is no longer one undifferentiated paragraph. Keep operation snippets short or optionally collapsible; placing snippets before the actual-d row increases scrolling during before/after comparisons. No clipping or unusable control was observed. Table code tokens may wrap mid-identifier; this is legible but less fluent than a stacked mapping at mobile width. Optional polish, not a new blocker.

## Mathematical and implementation audit

- Submission `solution.py` and `python-code.js` have no diff from baseline; exhaustive Python tests were appropriately not repeated.
- Plain-d increment count r−p is correct; cumulative count includes only applied frames. All-distinct n(n+1)/2 growth is correct.
- Both displayed decompositions are exact disjoint covers. The new O(log n) explanation is valid: at most two partially intersected nodes continue at each level; other covered nodes stop. “About 17 levels” for 100000 is an acceptable approximate height statement (17 edges / up to 18 node levels); it is not used as an exact work count.
- The omitted-push counterexample and operation snippets match the real trace. Downward ID numbering and 4*n safe capacity are correct for this implementation.
- Both languages preserve the new mechanism and workload explanation except the Chinese lazy-definition error above. No browser page errors were observed. At 390px the document width stayed 390, targets remained operable, both trees fit, and the complete code disclosure worked. Code blocks scroll internally where needed.

Evidence files outside source control, under `/Users/songyy/.codex/visualizations/2026/10/17/01a1472a-f9ef-78a3-a4f9-32816fda17c7/`:
- `2916-r2-desktop-step4.png` — desktop push frame.
- `2916-r2-mobile-step4.png` — Chinese partition plus final lazy frame.
- `2916-r2-mobile-en-step4.png` — English changed area.
- `2916-r2-mobile-step5.png` — Chinese mapping and call trace.

Raw temporary learner transcript: `/tmp/2916-r2walk.txt`. Full-section screenshots can include the sticky navigation at the capture scroll position; this is not evidence that navigation is embedded in the content.

## Frozen-rubric score

| Outcome | Rating /4 | Weighted score |
|---|---:|---:|
| Problem/baseline | 4 | 10 /10 |
| Causal discovery | 4 | 20 /20 |
| Algebra/invariant | 4 | 15 /15 |
| Data structure/lazy | 3 | 15 /20 |
| Interaction/cognitive load | 3 | 11.25 /15 |
| Visual-to-Python/correctness | 3 | 11.25 /15 |
| Bilingual/device access | 3 | 3.75 /5 |
| **Total** | | **86.25 /100** |

The candidate clears the numerical threshold and minimum category scores, but the central lazy-definition error prevents unconditional acceptance. Correct items 1–2 and add the small prediction task in item 3, then perform a focused closure check of those exact changes; another broad review is unnecessary. Actual human teach-back remains unmeasured, and neither this score nor browser checks prove novice mastery.
