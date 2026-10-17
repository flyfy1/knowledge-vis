# LeetCode 2916 — independent novice review, round 1

Date: 2026-10-17. Reviewer: Astra. Baseline: `20aaf3e`. Public lesson: https://visual.integ.life/leetcode/2916/. Verdict: **revision required, 73.75/100**. Mathematics and Python passed independent checks; the transition to a data structure remains too abrupt for the specified beginner.

## Method and evidence boundary

Created `leetcode-2916-rubric.md` before reading lesson source or BRIEF. Read repository UI policy, then operated the public lesson in Chinese, inspected its English rendering, and exercised desktop (1440px) and mobile (390px) controls before source inspection. Did not read BRIEF or prior implementation claims. Source locations below refer to baseline, not subsequent edits.

This is an expert reviewer simulating a novice's first-use path. Paraphrases and comprehension judgments are hypotheses about the target learner, **not observed human teach-back**. Automated checks support correctness and operability only.

Evidence images (outside source control):
- `/Users/songyy/.codex/visualizations/2026/10/17/01a1472a-f9ef-78a3-a4f9-32816fda17c7/2916-r1-tree-full.png`: desktop step 4, frame 6/10, actual lazy push.
- `/Users/songyy/.codex/visualizations/2026/10/17/01a1472a-f9ef-78a3-a4f9-32816fda17c7/2916-r1-mobile-full.png`: same operation at 390px.
- Raw interaction transcript retained at `/tmp/2916-walk.txt` for this session. Earlier viewport screenshots captured smooth-scroll transition positions; the two full-section images above are the authoritative visual evidence.

## First-use walk: what each interaction visibly teaches

| Step | Action and evidence | Novice paraphrase / remaining gap |
|---|---|---|
| 0 | Selected `[1,2]`; read two distinct values and contribution 4; tried 9 then 15. Six-cell matrix preserves positional identity. | “A repeated number counts once inside a subarray; each continuous slice contributes its distinct-count squared.” Clear. |
| 1 | Advanced r through 0,1,2. Rows and retained F history show 1,5,9 and total 15. Opened baseline details later. | “Group by the last position; add each group once.” Clear grouping, but the reason naive work is too large is hidden behind optional code. |
| 2 | Stepped all six frames for `[1,2,1]`, then selected all examples; mobile traversed every example forward and backward. Old gray bars remain beside current cyan bars. | “If my start is after the previous copy of x, this x is new to my slice; otherwise it is already present. At r=2 only starts 1 and 2 change: [2,1,0] becomes [2,2,1].” Good causal discovery. The pending highlight already gives away the answer, so prediction remains an instruction rather than an independent check. |
| 3 | Changed k from 1 to 3 and back. At k=3, individual increases 21,21,15 sum to 57; old Q=9 becomes 66 and S=5 becomes 14. | “The square increment depends on the old sum, so I need S as well as Q; k can combine repeated increments.” Algebra is correct and reconstruction is plausible. |
| 4 | Traversed all ten frames, including full cover, push and merge; reversed to initial state. Frame 6: parent [0,2] stays S=8,Q=22 while its tag clears; children change [0,1] 4→6 and 8→18, [2,2] 1→2 and 1→4; actual d stays [3,3,2,1,0]. | “The pending increment moves into children without changing actual counts.” This is visible in the table. But “why did we choose these nodes, and why push now?” cannot be reconstructed without mentally supplying the unseen requested interval and recursion decisions. The tree arrives already built with nonzero leaf tags. |
| 5 | Read full Python, compared symbolic mapping, clicked copy (clipboard write not independently verified). | “total is S, square is Q, lazy is t.” I cannot derive why children are 2*node and 2*node+1, why arrays are 4*n, or how left/right differ from ql/qr from the existing lesson alone. A basic Python learner receives too many new conventions at once. |
| 6 | Selected all four ledgers; opened final self-check. Long case F values 1,5,9,23,32 sum to 70. | “The last root is only the last group; answer adds every completed root.” Clear check of the recurrence, but this ledger does not independently teach or test lazy propagation. |

## Required improvements, ranked

### P1 / B1 — Teach interval decomposition before lazy propagation

Locations: `copy.js:41–47`, `index.html:59–61`, `app.js:72–98`, `core.js:63–75`.

Step 4 introduces node, root, leaf, child, recursive descent, full/partial coverage, stored versus actual values, lazy tags and upward merging together. The title uses “leaf” before explaining it. Initial frame already has leaf tags 2,2,1. The first action says full-cover [0,2], but no persistent display shows the requested [0,3] and its decomposition. Frame 6 says partial-cover [0,2], without displaying the new query [2,4]. The viewer must derive the missing request and traversal themselves.

Smallest effective fix: add a short interval-only primer with an initially zero tree; define each box as a summary for a range of d indices, root as all indices, leaves as single indices, children as the two halves. Show requests [0,3] and [2,4], highlight their exact whole-node decomposition, and explain “stop here because every index in this box must change; split only at the request's boundaries.” Keep r,x,p and requested range visible throughout the real lazy trace. At the push frame explicitly state that actual d and parent summary do not change: only where the pending increment is recorded changes. Include one concrete omitted-push consequence, such as [2,2] being updated from stale 1 instead of actual 2.

Acceptance: a reader predicts selected boxes for a fresh interval and explains why a full-cover action stops, while a partial action must descend. They can explain the parent-unchanged/children-changed push table.

### P1 / B2 — Connect the tree to Python's storage and recursive parameters

Locations: `copy.js:54–57`, `index.html:63–66`, `solution.py:8–10,21–42,46–50`.

The three array names map to S/Q/t, but the tree drawing has no node IDs. The solution jumps to recursive functions, heap numbering, 4*n capacity, interval comparisons, integer midpoint, and nested calls without showing one concrete call. “逐行落到代码 / become code” overpromises the current paragraph plus full listing.

Smallest effective fix: show the outer scan as a short annotated skeleton first; map d index versus tree node index; label root 1 and children 2i/2i+1; state left/right are the current box while ql/qr are the unchanged request. Explain recursion as repeating the same procedure on smaller boxes, with complete coverage as the stop condition. Tie one illustrated full-cover, push, and merge to their exact Python lines/snippets. Explain 4*n as safe storage capacity for the numbered tree, not four copies of d. Keep downloadable code intact.

Acceptance: reader traces `add(1,0,4,2,4)` through a partial node to a full-cover node and identifies the three line groups implementing apply/push/pull.

### P1 / B3 — Make the reason for optimization visible

Locations: `index.html:33–42`, `copy.js:25,27–28,57`.

The correct explanation that n=100000 implies 5,000,050,000 subarrays is hidden inside the baseline disclosure. After discovering the changed interval, the lesson never explicitly shows why looping over its d entries still costs 1+2+…+n on all-distinct data. The O(log n) claim cites tree height, but height alone does not prove that a branching traversal visits only logarithmically many nodes.

Smallest effective fix: expose the short baseline and its visit count; on the all-distinct interval experiment show how many entries change per round. Connect the block formula to saved visits. In the tree primer explain that interior whole boxes stop immediately and only the two interval boundaries continue downward; thus only a constant number of boxes per level need work. Define O(n²) and O(log n) locally in plain language before relying on the separate Big O link.

Acceptance: learner explains why preserving d alone is still quadratic, and why the tree avoids touching every affected entry without losing their summed contribution.

### P2 — Local symbol definitions and mobile working memory

Locations: `copy.js:42–44,61`, `index.html:70`. UI policy requires per-step definitions even for navigation jumps. Step 4 relies on d/F/r from other steps; step 6 displays p and F without a local reminder. Add concise local legends. At 390px, the tree, before/after table, and actual-d row span more than one screen; preserve the operation/request context near the evidence, and avoid lengthening the primer into another dense essay. This is a cognitive-load concern, not an overflow bug.

## Mathematics, implementation and UI audit

- Correct recurrence: p is last occurrence before r; exactly starts p+1…r gain one. Future slots stay zero, so the root Q after a completed update equals F(r).
- Correct aggregate update: Q'=Q+2kS+k²m uses old S, then S'=S+km. Tags accumulate increments already included in the node but not its children. Push updates children and clears parent; pull combines child summaries.
- Python's leaf safety is correct: the full-cover branch returns before `push` for a visited leaf. Modulo arithmetic is valid for sums/products; lazy tags need not be reduced for these bounds. O(n log n) time and O(n) memory claims are correct, although their teaching justification is incomplete.
- Independent Python exhaustive enumeration: **9,840 arrays** over values {1,2,3}, lengths 1 through 8, agree with a separate slice/set brute force. Additional length-100000 equal and distinct arrays agree with independent closed forms. These are not human-learning evidence and do not prove LeetCode runtime acceptance.
- Public `index.html`, `copy.js`, `app.js`, `core.js`, `solution.py`, and `python-code.js` byte-equal baseline local files. Rendered Python matches `solution.py`.
- Chinese and English teach equivalent mathematical claims and instructions; state remained when switching language. Both 390px locale sessions exercised group/tree forward/back endpoints, all range examples forward/back, all verification selections and slider limits. No page errors; document width stayed 390. Tree fits without clipping. No Canvas is used by this lesson; tree is SVG.
- `common.js` catches storage failures and applies browser-language fallback; this was source-inspected, not a separately injected storage-failure browser test.
- Verification ledger uses the O(n²) count recurrence (`rangeFrames`) against enumeration, not the Python tree. Current copy truthfully calls it recurrence verification; do not relabel it proof that the submission implementation is correct.

## Rubric score

| Outcome | Rating /4 | Weighted score |
|---|---:|---:|
| Problem and baseline | 4 | 10 /10 |
| Causal discovery | 3 | 15 /20 |
| Algebra/invariant | 4 | 15 /15 |
| Data structure/lazy | 2 | 10 /20 |
| Interaction/cognitive load | 3 | 11.25 /15 |
| Visual-to-Python/correctness | 2 | 7.5 /15 |
| Bilingual/device access | 4 | 5 /5 |
| **Total** | | **73.75 /100** |

The low structure/code ratings reflect missing reconstruction support, not faulty calculations. Current lesson fails the rubric's minimum 3/4 per outcome and three causal-bridge blockers.

## Next-round acceptance checklist

- [ ] Baseline workload and the remaining cost of a plain d loop are visible without opening optional content.
- [ ] Before lazy tags, learner sees and explains exact interval decomposition and the meaning of tree boxes.
- [ ] Every lazy event keeps the requested range visible; push visibly preserves actual values and explains the stale-child failure.
- [ ] A concrete recursive call connects node IDs, two kinds of bounds, apply/push/pull and Python lines.
- [ ] Chinese/English and 390px retain readable controls and evidence after additions.
- [ ] Re-score independently; no blocker, at least 85/100, and every category at least 3/4. Actual human teach-back remains uncollected.
