# Independent review: 25 — Reverse Nodes in k-Group

Candidate revision: `8ed794b3f4ddb026bf5ed3a52c225b634822f7aa`. URL: http://127.0.0.1:18770/leetcode/25/. Review date: 2026-10-18. Reviewer: independent Codex run; exact model identity unavailable. Target: basic Python, lists, loops, functions, elementary recursion. No claim of human comprehension or LeetCode submission. Publication is outside this review.

## Frozen interpretation before opening

Read only `specs/leetcode-review-gates.md` before opening the candidate in Playwright Chromium. Six dimensions and weights: problem/terms 15; derivation 20; correctness 20; interaction 20; Python/cost 15; bilingual/device 10. Prefer faithful Python. Acceptance requires ≥85, each dimension ≥3 and no required open finding. Source, briefs, author evidence, tests and earlier reviews had not been opened when the following walkthrough was saved.

## Cold browser walkthrough (saved before source audit)

Desktop 1440×1000, English. Read all five teaching sections, used all nine Pairs transitions, opened the previous-state, code and history disclosures on Short suffix. Screenshots: `25-evidence/25-review-2-72a47e8f/cold-initial.png`, `cold-frame-{1,2,3,4,5,9}.png`, `cold-short-expanded.png`. Inspected the full-page frame-2 screenshot: node cards carry permanent IDs, explicit next destinations and a distinct highlighted changed node; the diagram is a reference ledger rather than a spatial chain.

| Teaching step / question | Action | Visible result | My causal reconstruction |
| --- | --- | --- | --- |
| 01: What is a node/reference and what output is requested? | Read the three-node introduction and hand calculation. | #0 has val=1,next=#1; changing #0.next to #2 makes traversal 1,3 without modifying values. [1,2,3,4,5],k=2 gives [2,1,4,3,5]; k=3 gives [3,2,1,4,5]. | A reference locates the same object; changing the edge can detach reachability while the object still exists. Only complete groups reverse. |
| 01: Why save before overwriting? | Follow the numbered concrete two-node rewiring. | Save #1, set #0.next=#2; save #2, set #1.next=#0; finally move entry to #1. | Saving the old successor preserves access to the unprocessed fragment; changing the entry is separate from reversing interior edges. |
| 01: What does a familiar baseline buy/cost? | Read displayed baseline. | Collect references, reverse full slices, reconnect each next; return a node. O(n) time and space. | The array stores object references, not replacement values. It solves the task but uses linear auxiliary memory. |
| 02: What work/storage can we avoid? | Read dummy/group_prev explanation using the same three nodes. | Walk k links, save group_next, start prev at the suffix, reverse locally, reconnect through group_prev.next and advance it to the old head. | Dummy unifies the first group's entry with later groups. The optimized saving is storage, not an asymptotic time reduction. A failed full-group scan must precede any mutation. |
| 03 event 0: What exists before operations? | Open experiment. | Event 0/9; entry #0; original next ledger; group_prev=-1. | IDs remain objects, and -1 is the extra predecessor rather than a data value. |
| 03 event 1: Is the first group complete? | Execute once. | kth=1, group_next=2, prev=2,curr=0; edges unchanged. | Suffix #2 is the initial reversed-fragment destination. |
| 03 event 2: What changes first? | Predict #0.next becomes #2, then execute. | #0.next=#2,prev=0,curr=1,nxt=1,changed=0; entry still #0. | Saved #1 preserves the temporarily detached node. |
| 03 event 3: Does reversing an edge also change entry? | Execute. | #1.next=#0,prev=1,curr=2; entry remains #0. | Reversal is complete locally, but the external entry still needs reconnection. |
| 03 event 4: How is the group attached? | Execute. | Entry becomes #1; group_prev=0; remaining edges unchanged. | The old group head becomes its tail and the next group's predecessor. |
| 03 event 5: Where is the next complete group? | Execute. | kth=3,group_next=4,prev=4,curr=2; no changed data edge. | The same mechanism applies after the first group. |
| 03 event 6: How is the second group's tail secured? | Execute. | #2.next=#4,prev=2,curr=3,nxt=3. | The suffix is attached before the rest of the group is reversed. |
| 03 event 7: How does its second edge reverse? | Execute. | #3.next=#2,prev=3,curr=4,nxt=4. | All nodes in this group have moved into the reversed fragment. |
| 03 event 8: What changes in the preceding group? | Execute. | #0.next=#3,group_prev=2. | Reconnecting the predecessor yields traversal #1,#0,#3,#2,#4. |
| 03 event 9: Why stop? | Execute. | Fewer than k remain, final [2,1,4,3,5], same edges as event 8. | A terminal scan changes neither the short suffix nor the completed prefix. |
| 03 counterexample: Why not reverse every final chunk? | Select Short suffix, predict [3,2,1,4,5] rather than [3,2,1,5,4], move slider to final event and expand previous/code/history. | Final [3,2,1,4,5], #3.next=#4 remains; previous ledger identical; code `if kth is None: return dummy.next`; all six events retained. | A two-node suffix with k=3 exposes the error that a one-node suffix hides. |
| 04: Do equal values imply unchanged objects? | Before reveal predict #1,#0,#2 for the fresh 8,8,9 question, choose third answer and check. Change to first answer, check again. | Correct feedback explains equal values but swapped objects; changing clears feedback; wrong feedback says #0 and #1 must swap. | Node order, not value sequence alone, proves the required mutation. This is transfer to identity rather than recall of a value answer. |
| 05: Which variables implement visible edges and what is the cost? | Read map/cost/boundaries and disclosure labels. | IDs versus val; group_prev/kth/group_next and prev/curr/nxt; O(n),O(1); each group scanned and reversed once; browser explicitly described as a JavaScript model. | Each node is processed a bounded number of times, while only a fixed number of references are live. The diagram is not Python execution. |

Fresh independently chosen prediction, recorded before source/execution: `[7,0,7,2,9], k=3` must return values `[7,0,7,2,9]` but object IDs `[2,1,0,3,4]`. Tempting wrong rule “reverse the short final group too” gives IDs `[2,1,0,4,3]` and values `[7,0,7,9,2]`. UI has presets only, so this will be a **code check**, not a custom UI experiment. Intermediate prediction: after first local mutation #0.next=#3, saved nxt=#1, curr=#1, prev=#0, while entry remains #0.

Cold-walk limitation: desktop English only at this saved checkpoint. Device, Chinese, executable-source and parity checks follow below; they do not retroactively supply the cold explanation.

## Source, official contract and build audit

Working-tree HEAD equals the requested revision. Only this report and its exclusive evidence directory are untracked; no candidate file was changed. Independently fetched ten served assets and compared their complete bytes to the local files. `browser-audit.json` records every SHA-256, including:

| Asset | SHA-256 |
| --- | --- |
| index.html | bca5f7c88b4f0bf4fcd4629773619962acbdc11262b8048cc51fe79f1f90cde5 |
| copy.js | f98bcccb2640e31762ba5ce86fa6a2cbfdb96b144ffb1efbc4ff3dda49e7cece |
| solution.py | f66bea0ffd8a6d0951fbee5abe59b13c9e363f0fa8e940ab9f3bfff7064fb999 |
| python-code.js | 96ad37b0b4d31a40be5b82319b3615e010b41e590b1694bc080fc819c9f7415c |
| hard-first-ten/core.js | 342d7cbdf8c1e6f8527e6804ec286157e8fc63513a3c36c61d67c496bd08eeed |
| hard-first-ten/lesson.js | 18365da600d3a774aec9afb96deb377fa269fe894424ed6cef41ad9f929c9731 |

Read the [official statement](https://leetcode.com/problems/reverse-nodes-in-k-group/) normally through the web tool, without bypassing access. It confirms a linked-list head as input, groups of positive k, unchanged final partial group, node-value preservation, n≤5000, values 0…1000 and the constant-space follow-up. The candidate agrees. Canonical `Solution.reverseKGroup(self, head, k)` returns a linked node, uses the judge-provided ListNode and changes actual next references. It is not an array-returning analogy. The quoted Optional[ListNode] annotations work with judge-supplied nodes. No non-Python canonical solution or language contract is present, so the non-Python selector/rationale/supportedLanguages requirements do not apply.

Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python maps to `solution.py`, `python-code.js`, `PYTHON_SOURCE`. Exact full-source parity passed between canonical file, decoded offline mirror, browser export, displayed code, copied clipboard contents, downloaded `solution.py` bytes and selected fallback textarea, in both languages. The offline file:// page also displayed exact source and advanced its trace. No submission was made.

Inspected `solution.py`, `python-code.js`, `index.html`, `copy.js`, `app.js`, the reverse model in shared core.js, shared lesson controls, locale code and relevant styles. No author note supplied an explanation missing from the cold page. The changed content relative to the earlier reviewed revision is concentrated in bilingual introduction/derivation and page ordering; canonical Python and shared algorithm runtime are unchanged. The diff also adds author tests/evidence. Earlier assets were neither regenerated nor modified.

## Executable checks and visual-to-code reconstruction

Read the shared hard Python/model/browser suites and all three lesson-local tests **before** executing tests. The local browser suite hardcodes `leetcode/25/evidence/review-1-fix`; I did not run it. Instead, independently operated Chromium and saved new results/screenshots exclusively under this run's directory. Ran the read-only local Python test with `python3 -B` (preventing bytecode files) and model test, redirecting stdout into this run's evidence. Their actual results were 3,597 Python cases and 300 model cases / 6,235 transitions. The Python suite includes binary-value exhaustive cases, identity/value/cycle checks, the tiny hand example, a fresh example, empty-list robustness and n=5000 with k=1,2,3,2499,2500,4999,5000. The local tests support their stated scope; shared aggregate claims were not adopted as independent teaching evidence.

Additional independent checks:

- **Actual canonical Python:** compiled and executed the exact file with a minimal judge-style ListNode supplied in its namespace. All 21,324 ternary-valued cases (values 0,7,1000; lengths 1–7; every legal k) matched an independently computed expected object order. Checked original values, exact object reuse, count and absence of cycles. Evidence: `independent-python.json`.
- **Fresh code check:** `[7,0,7,2,9],k=3` returned IDs `[2,1,0,3,4]` and values `[7,0,7,2,9]`, confirming the pre-recorded prediction. Original node #3 still points to #4 and #4 to None. A value-only checker could miss this reversal. Reversing the partial suffix would instead return `[7,0,7,9,2]`, disproving that tempting rule. This was not presented as custom UI input.
- **Independent model checks:** all legal k for n=1–30, 465 cases and 11,378 transitions; final identity order, unchanged input/values, saved old successor, post-operation prev/curr, exactly the intended next update, preserved entry during local reversal, unchanged terminal suffix scan and independent snapshots. Evidence: `independent-model.json`.
- **Fresh intermediate prediction:** model event 2 has links `[3,2,3,4,None]`, head #0, prev #0, curr #1 and nxt #1, exactly as predicted. This matches the actual Python sequence `nxt = curr.next; curr.next = prev; prev, curr = curr, nxt`: the old successor is read before the overwrite and the readout is after the advancement. The model is separately checked; it is not treated as executing Python.

Correctness reasoning reconstructed independently: before each group, the completed prefix is correctly attached and group_prev is its tail (dummy for the empty prefix). Walking k links proves a full group exists before mutation; failure returns without changing the remainder. During local reversal, prev leads the reversed fragment ending at group_next, curr locates unfinished work and nxt saves the old edge before it is overwritten. When curr is group_next, kth is the new group head and the old head is the new tail. Setting group_prev.next=kth restores reachability, then moving group_prev to old_head grows the completed prefix by k. Positive k guarantees progress, including k=1, and eventual preflight failure terminates. Duplicate values do not affect any identity comparison.

The baseline traverses/reconnects n nodes and reverses disjoint full slices: O(n) time, O(n) auxiliary storage (including slice copies). Canonical code scans and reverses each complete group once, plus at most one failed scan: O(n) time and O(1) auxiliary space, including one dummy node and a fixed number of references. It assigns no val field and allocates no replacement output nodes. Trace histories use extra memory but are explicitly labeled as a JavaScript model, not the Python implementation's space cost.

## Interaction, bilingual and device audit

`browser-audit.json` contains observed English/Chinese copy, all quiz feedback, served hashes, layout checks, parity and zero page errors. Both locales and all four presets were operated independently. End values were Pairs `[2,1,4,3,5]`, Short suffix `[3,2,1,4,5]`, Equal values `[2,2,3,3]` with reversed object IDs, and k=1 `[1,2]`. Initial rewind/terminal next were disabled. Next→rewind restored the exact start snapshot; advancing again restored the exact next snapshot. Terminal rewind/advance and reset also restored exact snapshots. Changing presets restarted position 0. All three prediction choices were checked in each locale, with causal feedback; changing choice cleared revealed feedback.

Preset, event position, exact frame, selected quiz answer and revealed state survived locale changes and viewport resizing. Expanded previous-state/source disclosures remained open. Language focus remained on the activated toggle. Snapshot data and previous-state edge values, rather than screenshot color alone, established state preservation and mutation meaning. The tiny diagram at the start and the later node ledger identify actual references; card positions are fixed object IDs, not output order. After first rewiring, previous #0.next=#1 and current #0.next=#2 make the change observable even though #1 is temporarily unreachable from entry.

Keyboard checks in both locales: range Home/ArrowRight/End, Previous with Space, Next with Enter, and actual Tab from Next to Reset. Reset displayed a 3px orange focus outline. At 320px, navigating to the experiment placed its heading at approximately y=154 while sticky navigation ended at y=58.5, leaving the heading accessible. Evidence: `browser-focused.json`.

Both locales were checked at 320/390/1280px, plus the 1440px cold desktop. No document overflow; controls wrap and node cards retain explicit IDs/links. Expanded source is horizontally scrollable, measured 286px container versus 717px content at 320px, and scrolling to the end worked. The Chinese focused source screenshot retains the horizontal offset intentionally left by the English check; this is scroll state, not missing source. Denying storage and clipboard access still loaded the lesson and exposed the exact fully selected source in a readonly textarea, with localized fallback messages.

200% enlargement was exercised using Chromium CSS `body.style.zoom='2'` in both locales; text reflowed, node cards wrapped, trace state stayed at event 2 and the document did not overflow. This is a layout-enlargement check, not a browser-chrome zoom-shortcut or OS magnification test. Visually inspected the enlarged English node ledger as well as both enlarged teaching views. No real mobile device or screen reader was used.

Read the Chinese node/reference introduction, concrete three-node calculation, dummy/group variable roles, transitions, invariant, costs, boundaries and feedback against English. The same causal explanation appears in both languages, including why overwriting next first loses access, why head must change separately, and why the final two nodes with k=3 stay unchanged. No material translation mismatch found.

Visually inspected focused screenshots for both 320px introductions/rewiring, both 390px trace headers/controls, both 1280px trace views, both disabled controls, both 200% teaching views, both 320px before/after diagrams and code views, enlarged English diagram, and copy fallback. Also inspected the cold frame-2 full-page screenshot. Full-page captures provide context; focused screenshots establish text/control readability.

Measured contrast from actual computed styles: text/background 16.09:1, explanation/background 12.62:1, muted text/panel 7.08:1. Disabled Rewind at opacity .4 composites to approximately 3.30:1. It remains decipherable in the inspected view but faint; this preserves the earlier optional readability concern. Evidence: `contrast.json`, `en-disabled.png`, `zh-disabled.png`. This is not asserted as an enabled-control WCAG violation.

## Stable findings and closure

### 25-R1 — required, high, now closed

Earlier report: `specs/reviews/25-review-1-e91d5f55.md`, revision `d0550319ff0380d29aad9f323a80b119c6e9cd98`. Read only after the cold walkthrough was saved. Original reproduction: fresh lesson, sections 01–02 in either locale, desktop 1280×900, initial Pairs. Expected a linked-node/reference prerequisite and a concrete tiny pointer calculation before generalized dummy/kth/prev/curr reasoning. Actual earlier report: only number-group results preceded pointer abstraction. Violated frozen terms/gradual-teaching/concrete-before-abstraction requirements. Owner: lesson author.

Closure against actual candidate `8ed794b3f4ddb026bf5ed3a52c225b634822f7aa`: cold step 01 independently introduced val, next, head, None, stable IDs, reference assignment versus list-slot assignment, temporarily lost reachability and saved successor. It then worked #0/#1 reversal and entry reconnection before the baseline and generalized section 02. It explicitly exposed the k=3 short-suffix counterexample. Repeated the affected sequence in Chinese, desktop and 320px, verified its DOM ordering in index.html and exact concrete transitions in source/model checks. Evidence: saved cold table; `browser-audit.json` English/Chinese rendered bridge; `en-320-basics.png`, `zh-320-basics.png`, `en-320-rewire.png`, `zh-320-rewire.png`; fresh actual-Python identity check and model transition regression. Expected causal bridge is now visible within this lesson. **Closed by this independent recheck**, not by the author's self-check or test counts.

### 25-N1 — optional, low, remains open

Candidate above, both locales, desktop and narrow widths, Pairs initial state. Reproduction: reset and inspect disabled Rewind. Expected improvement: keep the unavailable-state cue while making the label easier to read. Actual: opacity .4 yields about 3.30:1 effective text/button contrast; visibly fainter than enabled labels, still readable during inspection. Evidence: disabled screenshots and contrast calculation. Owner/next action: author may improve disabled text presentation. No fix revision. This is the earlier optional finding carried forward; it is not a required open fix.

No new required finding. Required open IDs: **none**.

## Scores and conclusion

| Dimension | Weight | Score / 4 | Observed rationale |
| --- | ---: | ---: | --- |
| Problem / terms / hand calculation | 15 | 4 | Node/reference prerequisites now precede a concrete three-node calculation; head, None, stable IDs, mutation limits and partial groups are explained. |
| Derivation / saved work | 20 | 4 | Baseline storage cost leads to constant-reference reversal; concrete saved-next, suffix attachment and dummy reconnection explain why each change is needed. The improvement is memory, not a false time-speedup claim. |
| State / correctness | 20 | 4 | Reconstructed prefix/local invariants and termination; checked exact intermediate edges, original identity/value preservation, suffixes and maximum boundaries with actual source. |
| Interaction / visual meaning | 20 | 4 | Prediction/reveal/change, before/after ledger, reversible frames, history, resets and endpoints work. Fixed card positions are distinguished from next-link traversal. |
| Python / cost | 15 | 4 | Faithful executable linked-node interface; fresh duplicate-valued case tests identity transfer; exact source parity and justified O(n)/O(1) behavior. |
| Bilingual / device | 10 | 3 | Equivalent reasoning, keyboard access and readable wrapped layouts across checked sizes/enlargement. Faint disabled text remains minor friction (25-N1). |

Weighted total: **97.5/100**. All dimensions ≥3; no required open finding; browser, source, execution and parity evidence complete for the stated scope. **Accepted** for this candidate revision. This does not approve publication or claim measured novice comprehension, a successful judge submission, exhaustive runtime correctness, real-device testing or assistive-technology certification.

All new evidence is in `specs/reviews/25-evidence/25-review-2-72a47e8f/`. Previous reports and author evidence were preserved. No implementation, shared file, test, Git configuration or service was changed.
