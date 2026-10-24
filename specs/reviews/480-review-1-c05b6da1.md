# Independent review: 480 — Sliding Window Median

Candidate: `1764b547117cd082afc4a8eacb701baf6b1f5671`. URL: http://127.0.0.1:18770/leetcode/480/. Review date: 2026-10-25. Reviewer: independent agent run; exact model identity unavailable. Target: basic Python, lists, loops, functions and elementary recursion. Frozen rubric read before browser; no source, brief, tests or prior review read before this cold record. Weights: 15/20/20/20/15/10. Applicable interpretation: faithful Python, actual executable source, full interaction and bilingual/device evidence.

## Cold walkthrough (saved before source audit)

Real Chromium via Playwright; initial viewport 1280×900. Screenshot `480-evidence/480-review-1-c05b6da1/01-cold.png` captured and inspected.

1. **Question:** What is the input/output and what does median count? **Action:** Read section 01 and hand-sort both displayed windows. **Observed:** [4,1,4] sorts to [1,4,4], rank 2 is 4; removing one 4 and adding 9 yields [1,4,9], rank 2 still 4. Even windows average two middle occurrences; bounds and 1-based ranks are explicit. **Conclusion:** A median is an ordered occurrence, including duplicates; emit n−k+1 answers in slide order.
2. **Question:** What work is saved? **Action:** Read baseline and independently compute the wrong-rule example. **Observed:** Sorting overlapping windows repeats ordering; [1,2,100]→[2,100,3] has median 3, whereas previous-median +2/3 is 2⅔. Compression maps [1,4,9] to ordered positions, and counts [1,2,0] preserve two copies of 4. **Conclusion:** Changes in the mean cannot locate an ordered middle; counts retain multiplicity and avoid sorting every window.
3. **Question:** How does a count tree locate an occurrence? **Action:** Follow rank 2 in counts [1,2,0,0]. **Observed:** Root's left count is 3, so rank 2 stays left; value 1 contributes one occurrence, so seek rank 1 in value 4. Equality stays left. Parent totals, padding and local-rank invariant are defined. **Conclusion:** Left totals delimit exactly which occurrences can be skipped; subtract only when going right. Updating a leaf repairs just its ancestors.
4. **Question:** What changes at each event, and when may output be emitted? **Action planned:** Advance all duplicate-preset events, inspect route and history, then rewind. **Prediction before operation:** Insert 4,1,4 gives [1,2,0] and median 4; removing one 4 gives [1,1,0], total 2, with no new median; inserting 9 gives [1,1,1], total 3, and the next query appends 4. Rewind should restore the earlier output prefix.
5. **Question:** Can I transfer the rank rule? **Action planned:** Select the second quiz answer then reveal. **Prediction before reveal:** New sorted window [2,5,8,8,9,11] needs ranks 3 and 4, both 8; left count 2 excludes rank 3 so go right with local rank 1; median 8. A wrong answer retaining rank 3 should be rejected. Changing the choice should invalidate the previous reveal.
6. **Question:** How does the proof become Python and what costs are counted? **Action:** Read explanatory text in section 06, leaving the collapsed canonical source unopened during cold walk. **Observed:** `tree[size+rank[value]]` identifies a frequency, `add` repairs ancestors, `select` uses the same local rank and left count. Costs explicitly include global preprocessing, O(n) auxiliary storage and separate outputs; nums is said to remain unchanged. k=1, k=n, all equal and extreme integers are discussed. **Conclusion:** The visual state maps to an iterative array tree; O(k) streaming space is not claimed. Actual code verification remains for the audit.

**Independent input prediction before code:** UI offers only presets. Fresh code-check input [3,-1,3,2,8], k=4 should return [2.5,2.5]. Sorted windows are [-1,2,3,3] and [-1,2,3,8]. Counterexample to discarding multiplicity: [1,1,9], k=3 must yield 1, not the distinct-set median 5. These will be code checks, not custom UI experiments.

**Cold operation results (still before source):** Events 0–7 were read individually. Events 1/2/3 added 4/1/4, with root totals 1/2/3. Event 4 emitted 4; route r=2,c=3 went left, then r=2,c=1 went right to value 4. Event 5 removed one 4, showed [1,4], root 2, retained only Window 1:4 and emitted nothing. Event 6 added 9; event 7 used equality r=c=2 to go left and emitted the second 4. Previous restored event 6 and removed the second output from history. This verifies that counts are data, query routes are explanatory state, and history is the output prefix at the selected event. End screenshot `02-end.png` captured. Quiz correct selection revealed median 8 with the expected local-rank explanation; changing to the first option hid the explanation, then reveal said “Recheck the counts” and explained the same causal correction. Switching to Chinese retained event 6, the wrong choice and its revealed feedback, translating all six sections including occurrence multiplicity, equality-left, padding, costs and source mapping. The cold results support the predictions above. No source or author notes supplied a missing explanation.

Cold walkthrough record complete. Source audit starts below.

## Candidate identity and official contract

`git rev-parse HEAD` returned the requested revision. The initial status showed only this report and its evidence directory as untracked; no candidate edits were present. HTTP bytes equalled local bytes for all seven lesson runtime/source files and both shared runtime assets. SHA-256:

| Asset | SHA-256 |
|---|---|
| index.html | 7ec8cffbffd5e4b8e5e5013bd3c2ce20b84a5faf4ac1e1ab18450806b44d963f |
| solution.py | 0977036fce427a8066084c55a94f191f7e0462d7d67d9330a2468fc35912a74a |
| python-code.js | d8e789b4f833c476ca0e0f1c3ddd0a972e1e5eba98017cfa68c13bd2eedf2c5b |
| copy.js | 33ab0de0d951412c5ad061984ff0652adfa020c69f55f8c1a9f2630c2af533e5 |
| core.js | 4a06e623a53c986afe590759c3a5f2de68cc2af3f7c399cd1fb101f1c11235ac |
| app.js | 682f5966d3ea20261577a3abe37a6ff84da091664186565e7c9b7d095fad4647 |
| local style.css | 4014c4e2b2630b2fe07c48b04ee0603a43b12dc2f88271327d2d8a0d9cbdb0ee |
| shared common.js | f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b |
| shared style.css | 6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27 |

Read the [official statement](https://leetcode.com/problems/sliding-window-median/) normally through the web reader after the cold walk. It was accessible: ordinary/even median definitions, left-to-right windows, tolerance 10⁻⁵, both examples and bounds match the lesson. No access bypass was attempted. The saved lesson-local official selector response/documentation lists Python3 and the `Solution.medianSlidingWindow(self, nums: list[int], k: int) -> list[float]` interface. The actual canonical class/method uses equivalent imported `typing.List` annotations and returns a list of floats. This is an original callable implementation, not a conceptual analogy. Python is the preferred language, so no non-Python contract exception or supportedLanguages exclusion audit applies. I independently read the statement; the selector evidence is saved candidate evidence rather than a newly operated official selector.

Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python requires `solution.py`, `python-code.js`, `PYTHON_SOURCE`. Exact mirror parity passed. Browser checks also compared displayed code, actual clipboard contents, download bytes and manual fallback value to the canonical source in both locales. File-URL offline display and simulation passed.

Metadata complexity is exactly the nonempty string `O(n log n) time; O(n) auxiliary space plus O(n-k+1) output`. Ran from repository root:

```text
python3 -B scripts/register_leetcode_lesson.py 480 --validate-only
exit 0; no output
```

No registration or candidate repair was performed. No earlier report for problem 480 existed in `specs/reviews`; there are no earlier required findings to close.

## Source, executable and invariant audit

Read canonical Python, mirror, HTML, application, core, bilingual copy, shared locale helper and relevant styles. Inspected all four test scripts before execution. Their output paths honor `LESSON_OUTPUT_DIR`; every rerun used this run's exclusive evidence directory. Python used `-B` to avoid bytecode writes. No author screenshots/results were regenerated or replaced.

The actual Python creates a sorted distinct value list and value-to-rank dictionary, pads tree leaves to a power of two, and maintains integer counts. `add` changes one leaf then recomputes each parent, preserving parent=sum(children). `select` starts at node 1 and preserves a valid rank inside the chosen subtree; r≤left_count includes equality, otherwise subtracting left_count excludes exactly the skipped occurrences. Each loop moves down one level, terminating at a real occupied value: zero-count padding cannot contain a positive valid rank. The outer loop removes `nums[i-k]` only once a previous window exists, inserts the incoming value, and emits only once i≥k−1. Odd k uses equal ranks; even k uses adjacent middle ranks. This establishes boundaries and output order.

**Concrete visual-to-code mapping:** The duplicate preset's event 5 is the actual `add(nums[i-k], -1)` at i=3: tree leaf 4's count changes 2→1; parent and root change 3→2; other leaves stay [1,0]. Event 6 is `add(9,1)`: leaf 9 changes 0→1, its parent 0→1, root 2→3. In the final query, root left_count=2 and r=2 uses the left branch, then left_count=1 causes right descent with r=1. `values[node-size]` returns 4. I instrumented returns from the actual Python `add` using `sys.settrace`, asserted every parent sum and nonnegative count, and observed root totals [1,2,3,2,3] and leaf arrays [1,1,0,0] after removal / [1,1,1,0] after insertion. These match the browser, including the intentional intermediate k−1 state.

**Independent predicted code checks:** Executed `Solution` from the actual `solution.py` via `runpy`, not JS or a translated analogy. Results:

| nums | k | predicted = observed |
|---|---:|---|
| [3,-1,3,2,8] | 4 | [2.5,2.5] |
| [1,1,9] | 3 | [1.0] |
| [1,2,100,3] | 3 | [2.0,3.0] |
| [-2147483648,2147483647] | 2 | [-0.5] |
| [9] | 1 | [9.0] |
| [5,5,5,5] | 2 | [5.0,5.0,5.0] |

The first two predictions were saved before source/reveal. All six preserved the input. They check fresh even windows, duplicate multiplicity, the mean-update counterexample, extreme sums, k=1, k=n and no-descent equal-value trees. These are explicitly **code checks** because the UI is preset-only.

Reran inspected tests with `LESSON_OUTPUT_DIR="$PWD/specs/reviews/480-evidence/480-review-1-c05b6da1"`:

- `python3 -B leetcode/480/tests/test_solution.py`: exit 0, four test methods; 22,426 sorting-oracle cases, official examples, all small windows, deterministic random cases, nonmutation and n=100000 monotone/constant boundaries. Sorting oracle is algorithmically independent of tree descent.
- `node leetcode/480/tests/test_core.cjs`: exit 0; 90,766 frames checked for frequencies, nonnegative counts, padding, parent sums, active count, requested ranks, output prefixes and independent snapshots. AST copy-key duplicate detection runs before evaluation; a duplicate-key fixture verifies detector behavior. All 88 bilingual key pairs exist and are unique in the one COPY lookup namespace.
- `node leetcode/480/tests/test_browser.cjs`: exit 0, ten check groups and 18 screenshots; details in `browser-results.json`.
- `node leetcode/480/tests/test_reading.cjs`: exit 0; bilingual representative meaning bindings and file-URL simulation/source, recorded in `reading-results.json`.

Counts corroborate the mechanism; scores below are based on the reconstructed explanation and operated states. Preprocessing is O(n log n) upper-bound time, updates/selections O(log(m+1)) each. `size < 2m` for m>1, so tree, dictionary and value list occupy O(n) auxiliary space, with separate O(n−k+1) output. nums is never assigned into or sorted in place. Python integer sums avoid overflow, and 32-bit integer pair averages are exactly representable here. UI snapshots and `active.shift()` belong to the explicitly labeled teaching simulation, not the submitted algorithm's cost. No unsupported O(k) memory claim exists.

## Interaction, language and device observations

Both locales were exercised through every event of all five presets, forwards and backwards. Leaf frequencies, tree node counts, selection route count, output values and history prefixes matched independently oracle-checked core states. Previous/reset disable at start; Next/end disable at finish. Last reaches the final snapshot, Reset restores the initial state, and changing presets restarts only the experiment. The separate quiz remains selected/revealed across preset changes as expected for its fixed independent question. Range ArrowLeft/ArrowRight and button Enter work. A supplemental keyboard check used Space on the correct radio and Enter to reveal.

All three quiz answers were revealed in both locales; wrong answers explain the violated rank invariant, rather than merely flagging an error. Changing a choice hides feedback. Locale changes retain experiment position, active data, choice, feedback, open source and manual-copy disclosure. Supplemental checks retained the official preset at event 7, correct quiz selection and revealed feedback through 320/390 resizing and 200% CSS zoom.

Meaning bindings were independently compared to the arithmetic: start means all zero; add 4 changes its frequency/ancestors; query names occurrences 2 and 2 with value 4; removal names one outgoing 4, shows [1,4], k−1 and retains one earlier output. Chinese text carries the same reasoning, including `r←r−c`, equality-left, zero padding, separate full-window query and cost limits. Clipboard fallback says automatic copy is unavailable and offers selected canonical text; it is distinct from wrong-prediction feedback. No algorithmic translation mismatch observed.

Clipboard permission success copied exact source; forced `writeText` rejection displayed a readable textarea, focused it, selected all source characters, and retained the fallback after locale changes. Downloaded bytes and collapsed-source disclosure contents exactly matched canonical Python. Storage denial still allowed locale switching and trace operation. Browser suite observed no page/console errors or failed/external runtime requests.

Inspected captured screenshots directly, not just automated overflow checks: initial full lesson; EN 1440 trace; EN 320 extreme tree and 200% zoom tree; ZH 320/390 extreme trees, 320 trace and 200% zoom; EN 390 removal; ZH 390 wrong-answer exercise; EN selected manual source; both 390 introductions; EN 320 and ZH 390 dense official intermediate trees. Supplemental dense-state captures exist for both locales at both 320/390 widths. At official event 7, all 15 nodes retained labels, covered values, counts and wrapping within their boxes; geometry also confirmed scrollWidth≤clientWidth. Terminal geometry for all five presets passed at 320/390/736/1440. No actual label/value intersection was observed. Captures sometimes begin below a section heading or include sticky navigation at the top; that reflects scroll/capture position, not a reproduced collision. The narrow navigation scrolls horizontally; section anchors and related targets were keyboard/geometry checked.

Colors are readable: body text 16.09:1, tree text 13.40:1, representative disabled text 7.08:1, focus outline 8.94:1. Disabled labels remain visible; native disabled controls do not operate. Visible buttons/selects have at least 48px dimensions. Forced-colors keyboard focus and reduced-motion modes were exercised. Node route highlighting adds a border; every essential value and the full route remain textual. Tree levels wrap into rows on phones, increasing vertical reading work, but node numbers, covered values and local-rank route text retain the association.

## Findings and score rationale

No required open finding. No earlier required findings exist for closure. Two optional refinements are recorded with stable IDs; neither prevents reconstructing the mechanism:

| ID | Severity/status | Reproduction and expected/actual | Requirement/next action |
|---|---|---|---|
| 480-R1-O1 | Minor, optional | Candidate EN/ZH, duplicate preset, event 3→4, desktop/phone: one Next reveals both complete selection routes at once. A learner can inspect every rank/count, but cannot advance one descent decision at a time. | Interaction minor friction; optionally offer per-descent stepping. No fix revision or regression closure claimed. |
| 480-R1-O2 | Minor, optional | Candidate section 06, either locale, expand canonical source: set/dictionary comprehensions and enumerate appear in setup. The prose defines their resulting values/ranks but does not unpack this Python syntax. | Target-reader transfer minor friction; optionally show the equivalent simple-loop setup. No fix revision or regression closure claimed. |

| Dimension | Weight | Score /4 | Observed rationale |
|---|---:|---:|---|
| Problem/terms/hand calculation | 15 | 4 | Tiny duplicated window precedes abstraction; median, even case, occurrences, rank indexing, output order and constraints are explicit and independently hand-checked. |
| Causal derivation/saved work | 20 | 4 | Repeated ordering motivates retained frequencies; compression preserves order; concrete counts derive grouping and rank subtraction; tempting mean rule and deduplication fail visibly. |
| Maintained state/correctness | 20 | 4 | Parent sums, multiplicity, valid local rank and padding exclusion justify both branches. Actual Python update states, full-window query timing and boundary outputs match the proof. |
| Interaction/visual meaning | 20 | 3 | Prediction/reveal, rewind/history and endpoint controls work; values and textual routes explain the highlighted nodes. Whole-route reveal rather than per-descent stepping introduces minor reading friction (O1). |
| Python/cost | 15 | 3 | Actual faithful Python executed; source parity, fresh transfer cases, exact costs and nonmutation verified. Setup syntax has minor friction for the stated basic-Python reader (O2). |
| Bilingual/device access | 10 | 4 | Equivalent causal reasoning and state feedback in both languages; preserved state, keyboard, readable 320/390/desktop and zoom layouts, contrast and copy fallback checked. |

Weighted result: **91.25/100** = 15 + 20 + 20 + 15 + 11.25 + 10. Every dimension ≥3; required-open IDs: **[]**.

## Limitations and conclusion

This is an independent reconstructed teaching review, not measured human novice comprehension. Browser evidence is headless Chromium on the local candidate; phone widths are emulated and 200% uses rendered CSS layout zoom, not physical devices or browser toolbar zoom. No screen-reader study, successful LeetCode submission or public deployment is claimed. The official statement was independently read normally; saved selector evidence was inspected rather than newly interacting with the official language selector. Custom-input experiments were canonical code checks because the lesson exposes only presets.

**Accepted for this candidate and review scope.** The frozen weighted threshold, minimum scores, required-finding gate, executable/source parity, browser evidence and metadata preflight are satisfied. This review is separate from publication. Evidence is confined to `specs/reviews/480-evidence/480-review-1-c05b6da1/`; earlier evidence remains untouched.
