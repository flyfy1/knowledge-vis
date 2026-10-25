# Independent review: 765 Couples Holding Hands

Candidate: `7ec592bddf5642212cdcb3363510982354da780e`. URL: http://127.0.0.1:18770/leetcode/765/. Review date: 2026-10-25. Reviewer: this independent review run; no named human/model identity asserted. Target: basic Python, lists, loops, functions, elementary recursion. Frozen dimensions/weights: problem 15, derivation 20, correctness 20, interaction 20, Python/cost 15, bilingual/device 10. Python is preferred for this algorithms problem. Publication is outside scope.

## Cold walkthrough (saved before source, tests, author notes, contracts or earlier reviews)

Only the frozen rubric was read before opening the candidate in real headless Chromium via Playwright. Initial viewport 1280×900. This log records rendered explanations rather than reconstructed author intent.

1. **Question:** what are input/output and what may one swap change? **Action:** read step 1, mentally predict exchanging seats 1 and 2 in `[0,2|1,3]`, then press the swap button. **Observed:** initial two Pending blocks become `[0,1|2,3]`, each marked Fixed, and text states zero is insufficient and one sufficient. **Conclusion:** person IDs differ from seat indices; consecutive even/odd IDs form couples; arbitrary seats may exchange; either couple order is valid. Output is an integer minimum, here 1. Domain explicitly says 2–30 couples and a permutation of IDs.
2. **Question:** what work repeats and what does the shortcut save? **Action:** read the visible baseline and counterexample in step 2. **Observed:** baseline copies the row, uses `a.index(p)` per mismatched pair and swaps; even/odd partner and XOR are explained. Worst-case repeated scans give quadratic time. The four-bad-block example visibly lists three resulting rows. **Conclusion:** recording positions removes scans; the shortcut does not replace the greedy repair. Counting half the bad blocks only gives a lower bound, since a swap need not repair two blocks.
3. **Question:** how can a repair preserve earlier work? **Action:** predict the default first decision will put person 1 in seat 1 and person 2 in seat 2, increment count once, then press Process next pair. **Observed:** processed 1/2, swaps 1; before row `[0,2|1,3]`, after `[0,1|2,3]`, first block Fixed/just processed, second Pending; map becomes identity and history states both map writes. **Conclusion:** Fixed means committed prefix, not merely a couple that happens to sit together. The missing partner cannot occupy that prefix; both moved persons need updated positions. Initial map correctness plus prefix correctness is the invariant. One frame is one completed block decision, not an individual assignment.
4. **Question:** why is the count optimal? **Action:** read the cycle proof, derive exercise edges before selecting/revealing: `[4,1|2,7|0,5|6,3]` gives edges 2–0,1–3,0–2,3–1, hence two components and prediction **2 swaps**. Select C and reveal. **Observed:** Correct; two cycles `{0,2}` and `{1,3}`, `4−2=2`, swaps seats 1↔5 then 3↔7; one cannot add two components. Simulation proof counter changes from one component/one remaining swap to two/zero after the earlier decision. **Conclusion:** degree two makes components cycles; a swap increases components by at most one; greedy isolates a loop and adds exactly one, so n−c is both lower bound and achieved count. The text introduces vertex, edge, component and loop explicitly, though this is the densest conceptual step.
5. **Question:** which executable operations implement the visible repair? **Action:** open Show solution using official interface. **Observed:** Python `Solution.minSwapsCouples`, array position construction, pair loop, partner XOR, skip, tuple swap, two map writes, count/return. **Conclusion:** visible first repair maps to `i=0`, `j=2`, `displaced=2`, tuple exchange and `pos[1]=1; pos[2]=2`. Map construction and one constant-cost decision per pair give linear time/space. The caller's row mutates; copying preserves it. Snapshot history has separately disclosed quadratic space.

**Fresh predictions recorded before code audit/reveal:** UI offers presets only, so custom checks will be labeled code checks. Fresh input `[1,2,3,0,5,4]`: predict 1; repair first block by exchanging seats 1↔3, then skip remaining blocks. Fresh counterexample `[0,3,2,5,4,7,6,1]`: predict 3, contradicting the tempting `ceil(4 bad blocks/2)=2`; its labels form one four-cycle. Independent execution/oracle checks remain pending at this save.

Cold screenshot: `765-evidence/765-review-1-c03e66cb/cold-desktop.png` (captured after the first simulation decision). No source was opened to fill a teaching gap.

## Candidate and official-source audit

After saving the cold log, read the rendered-state supplement, canonical files, translation consumer and test implementations. `git rev-parse HEAD` returned the requested candidate exactly; initial `git status --short` showed only this report and evidence directory. Independently fetched all seven lesson assets plus shared `common.js` and `style.css`: each served byte sequence equaled the checkout. SHA-256 receipts are in `765-evidence/765-review-1-c03e66cb/independent-code.json`; canonical `solution.py` hash is `c359058093535eb91b174ca647cc7f607564e11672dcd63951fc93654968ddb7`.

Read the [official statement](https://leetcode.com/problems/couples-holding-hands/) normally through the web tool: arbitrary-person swaps, integer minimum, both examples, unique IDs, `2n` length, and `2 ≤ n ≤ 30` agree with the lesson. No access bypass or submission was attempted. Lesson-local `provenance/official.json` includes the matching official Python3 stub `Solution.minSwapsCouples(self, row: list[int]) -> int` and integer-array/integer-return schema. The implementation preserves that callable and returns an integer, with mutation accurately disclosed. Python is faithful and available, so a non-Python language contract is not applicable; this is not a conceptual analogy. `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py` specifies `solution.py`, `python-code.js`, `PYTHON_SOURCE`, matching the candidate.

**Metadata gate:** ran from repository root `python3 -B scripts/register_leetcode_lesson.py 765 --validate-only`; exit **0**, no stdout. Repeated alongside the core check with the same result. `lesson-entry.json` complexity is exactly the single nonempty string `O(n) time; O(n) auxiliary space, where n is the number of couples`, not an object. No registration or repair was performed.

No earlier review report for problem 765 existed in the repository when checked after the cold walk. There are no inherited required findings to close.

## Independent calculations, correctness and code transfer

The two pre-recorded fresh predictions were checked by executing the **actual canonical Python**, loaded with `exec`, and by a separately written shortest-path BFS exploring every possible pair of swapped seats until any paired arrangement is reached. These are **code checks**, not custom-input UI experiments:

| Input | Prediction / BFS / Python | Actual mutated row |
| --- | --- | --- |
| `[1,2,3,0,5,4]` | 1 / 1 / 1 | `[1,0,3,2,5,4]` |
| `[0,3,2,5,4,7,6,1]` | 3 / 3 / 3 | `[0,1,2,3,4,5,6,7]` |
| `[1,0,3,2]` | 0 / 0 / 0 | unchanged |
| `[3,1,2,0]` | 1 / 1 / 1 | `[3,2,1,0]` |
| exercise `[4,1,2,7,0,5,6,3]` | 2 / 2 / 2 | `[4,5,2,3,0,1,6,7]` |

The fresh counterexample's edges 0–1,1–2,2–3,3–0 form a single cycle: four bad blocks cannot necessarily be repaired in two exchanges. The exercise's advertised exchanges independently give `[4,5,2,7,0,1,6,3]`, then `[4,5,2,3,0,1,6,7]`, also valid in two swaps. Canonical Python may choose a different valid final row, consistent with returning a count rather than a sorted array. Maximum legal 30-couple cases returned 0 for identity and 29 for `[0,2,3,…,59,1]`; final arrangements contained only paired blocks. Empty/invalid inputs are explicitly outside the official domain.

Source inspection supports the invariant at assignment level: `pos` is built as an inverse permutation, the absent partner lies beyond the current block because the fixed prefix contains both members of every processed couple, tuple assignment exchanges exactly two people, and the two position writes restore the inverse map. Each decision fixes one more block, or skips a correct one, so the loop terminates with all blocks valid. Optimality is separate: one swap adds at most one cycle component and each non-skip greedy repair adds exactly one. The proof covers within-block exchanges, merging components and splitting a cycle, rather than assuming feasibility implies optimality.

Read the baseline and its costs independently: a copied array plus up to n linear `.index` searches gives O(n²) worst-case time/O(n) extra space. The canonical map allocates 2n cells; its initialization and n constant-time decisions give O(n) time/O(n) space. A tuple exchange only uses constant temporary state. The optional caller copy adds linear cost, as stated. Teaching trace snapshots have a separately disclosed O(n²) cost.

After inspecting tests for mutations and output locations, executed:

- `OUTPUT_DIR=$PWD/specs/reviews/765-evidence/765-review-1-c03e66cb python3 -B leetcode/765/tests/test_solution.py` — exit 0: 41,064 arrangements across 4/6/8 people checked against multi-source all-swap BFS; 1,000 seeded larger inputs checked separately using component counts; actual Python and baseline agreed, with permutation/pair postconditions.
- `OUTPUT_DIR=$PWD/specs/reviews/765-evidence/765-review-1-c03e66cb node leetcode/765/tests/test_core.cjs` — exit 0: 224 BFS fixtures, every frame's fixed prefix, full inverse map, before/after continuity, swap increment and component potential verified; mirror exact; 87 unique two-string localization keys detected before evaluation using the AST.
- `OUTPUT_DIR=$PWD/specs/reviews/765-evidence/765-review-1-c03e66cb node leetcode/765/tests/test_browser.cjs` — exit 0, “Browser checks passed.” Test outputs and screenshots were redirected here; author assets/evidence were not regenerated.

These results support the concrete reasoning above; counts alone did not determine the teaching scores.

## Rendered state, bilingual semantics and interaction

Browser: Chromium **156.0.8078.4**, headless, Linux; launched with `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` where set, Playwright supplied via NODE_PATH. Independent follow-up observations are saved in `independent-browser.json`, in addition to the inspected test's `browser-results.json`.

All five presets were advanced to their endpoints in both languages; expected minima independently follow from their cycle sizes: **1,0,2,3,2**. Every step was rewound and replayed, comparing progress, operation, before/after row, position map, ledger, final text and component readout. Reset returns to zero; input change restarts; initial previous/reset and final next/end are disabled. The hand swap/undo is separate and reversible. The final skip adds no exchange and still increases completed-pair count. Intermediate zero *remaining* swaps is correctly distinguished from processing completion.

For a full adversarial trace, preset 3 starts `[0,2|3,4|5,6|7,1]`, count 0, c=1. Decisions yield:

| Processed | After row | Cumulative / remaining | Causal observation |
| --- | --- | --- | --- |
| 1/4 | `[0,1|3,4|5,6|7,2]` | 1 / 2 | seats 1↔7; `pos[1]=1`, `pos[2]=7` |
| 2/4 | `[0,1|3,2|5,6|7,4]` | 2 / 1 | seats 3↔7; `pos[2]=3`, `pos[4]=7`; first block retained |
| 3/4 | `[0,1|3,2|5,4|7,6]` | 3 / 0 | seats 5↔7; `pos[4]=5`, `pos[6]=7` |
| 4/4 | same | 3 / 0 | final already-paired block skipped; final minimum 3 |

At 2/4, independently switched zh→en→zh: selected preset, rows, count, map, history and component partition `{0} {1} {2,3}` were preserved. Rendered Chinese says “交换座位 3↔7，把人 4 移到 7；pos[2]=3，pos[4]=7。本次 +1 次交换”, exactly matching the English operation and actual row. The rendered `n−c=1` remaining count retains operands and scope in both languages. Initial/skip/swap/final messages and wrong/correct prediction feedback bind to the intended states, independently of copy-error text.

The exercise is explicitly independent of the preset. All three answers can be selected and revealed; selecting a different answer hides the previous explanation until reveal, clearing disables reveal, and locale switches retain the selection and revealed reasoning. Choosing C shows the two cycles and construction; wrong choices ask for recounting and give the same correct explanation, not a mismatched input. The exercise tests a new grouping and lower-bound construction rather than repeating the first example's output.

`Fixed`/`Pending` labels mean processed-prefix status. A later block already containing a couple can still be Pending until visited. Green borders mark the fixed prefix; orange plus “just processed” identifies the current completed decision. Values and seat captions remain distinct; before and after panels show the same decision boundary. Cumulative history is genuine retained state, restored on rewind.

Keyboard checks used actual Enter activation on next/previous, all five step anchors and the source disclosure, with a 3px visible focus outline on the tested control. Related link activation reached `/leetcode/41/#step2`; its rendered explanation places x at x−1 with swaps and duplicate guards, matching the advertised target-position swapping concept. Internal links reach the prefix and optimality explanations. The test also read the target in Chinese. A favicon-only 404 on the ancillary #41 route is separately recorded and does not affect this lesson's content.

**Exact source transfer:** decoded offline mirror, rendered `textContent`, successful clipboard write/readback, fallback textarea, actual fallback keyboard copy/readback, and downloaded bytes all equaled canonical `solution.py` exactly, including final newline. For fallback the Linux browser's clipboard was first seeded with a distinct non-source sentinel, automatic write was deliberately rejected, full selection and focus were checked, then **Control+C** copied the selected source and readback was compared. Both locales passed; no source was test-written to impersonate fallback copying. File-URL source rendering also passed. The Python source remains English code with translated framing, not a differently behaving translated implementation.

## Device, contrast and screenshot inspection

Exercised 320/390/736/1440 CSS-pixel layouts in both languages and independently inspected 1280 desktop plus dense 2/4 states at 320/390. No page-wide horizontal overflow was observed. Sticky step navigation scrolls horizontally; keyboard anchor activation exposes each destination. At 320, seat blocks stack vertically; at 390 they form two columns, retaining seat captions, values, status and map associations. History wraps across lines rather than clipping. Scrolled screenshots may begin partway through a block under the sticky bar; rechecked content lower down and did not mistake viewport cropping for a label collision.

Native browser zoom used the inspected test-only extension, with `chrome.tabs.getZoom` returning **2**, DPR **2**, innerWidth **720** for a 1440 window. Both localized screenshots were inspected: state captions, values and fixed/current labels remain legible. This was browser zoom, not a CSS scale claim. Forced-colors/reduced-motion plus denied storage still permitted locale changes and next-step operation.

Closed selected-label measurement on Linux Chromium at 320: `8 people · counterexample` measures **199.78px**, inside a **260px** control, with 15px padding each side and a measured-test allowance of 24px for the native arrow (206px available). Chinese `8 人 · 反例` measures **73.92px**. The longest English preset is this counterexample; labels remain complete after roundtrip. CSS stack: `"PingFang SC", "Microsoft YaHei", system-ui, sans-serif`; no claim about exact resolved fonts or other hosts is made.

The inspected contrast helper uses correct 0.2126/0.7152/0.0722 luminance coefficients and calibrates black/white=21, RGB primaries and the just-failing #747474-on-black case (~4.492948). Tested solid foreground/background combinations exceed 4.5; muted disabled text #9aa7b8 on #1c2330 has ratio **6.4494**, opacity **1**, and a dashed border. Computed enabled button colors and 48px minimum height agree with CSS. Screenshot inspection confirms readable disabled reveal text. This supports the observed solid-color palette, not an unperformed full assistive-technology audit.

Inspected screenshots in this run's exclusive directory:

- `cold-desktop.png`: complete cold page, hand result and first repair.
- `header-320-en.png`, `header-320-zh.png`: correct localized #765 H1, official link, readable narrow problem explanation.
- `trace-320-en.png`, `trace-390-zh.png`: first repair, distinct labels/values, map and prefix status.
- `middle-320-en.png`, `middle-390-en.png`, `middle-1280-zh.png`: dense two-decision history and displaced-person map updates, no visible text intersection.
- `quiz-320-zh.png`: two-cycle explanation and readable disabled reveal control.
- `zoom200-en.png`, `zoom200-zh.png`: native zoom state rendering.
- `endpoint-desktop.png`: four complete history entries, final skip and minimum 3.

Additional generated screenshots remain available in the same directory; they were not all manually inspected, and screenshot count is not used as acceptance evidence.

## Findings and scores

**Required open findings: none.** No earlier 765 required IDs were found. All acceptance evidence requested for this Python candidate was obtained.

**765-A1 — optional teaching refinement (low, open advisory):** step 4, both locales, all viewports. Reading from the simple seat repair into the proof introduces graph vocabulary and endpoint rewiring in two dense paragraphs. The reasoning is reconstructable and each term has a definition, but a concrete pictured edge split before the general argument would ease this transition for the target reader. Expected improvement: illustrate one cycle becoming a loop plus the remaining cycle using the already-worked row. Actual: concrete edge lists, definitions and the causal split argument are present as prose, with live component groups but no edge drawing. Evidence: cold step 4 and rendered proof. This is minor teaching friction under derivation, not a missing causal bridge or required correctness fix. Owner/next action: author may consider it in a future revision; no fix revision or closure claimed.

| Dimension | Weight | Score | Observed rationale |
| --- | --- | --- | --- |
| Problem/terms/hand calculation | 15 | 4 | Explicit IDs versus seats, arbitrary swaps, legal domain, reversed-couple example and one-swap lower/upper hand calculation before abstraction. |
| Causal derivation/saved work | 20 | 3 | Repeated search, direct lookup and false bad-block rule are causally explained; graph lower bound is complete but comparatively dense for the stated reader (765-A1). |
| Maintained state/correctness | 20 | 4 | Prefix plus exact inverse-map invariant; both writes visible; independent intermediate trace, skips, boundaries, termination and separate optimality proof agree. |
| Interaction/visual meaning | 20 | 4 | Prediction/reveal/change, complete before/after decisions, retained/reversible history, correct scopes, reset/endpoints and keyboard controls observed. |
| Python/cost | 15 | 4 | Faithful executable source, fresh BFS checks and maximum boundaries, exact transfer including fallback, explicit mutation and justified baseline/submission/snapshot costs. |
| Bilingual/device | 10 | 4 | Equivalent rendered state/proof/feedback meaning; localized identity and retained state; narrow/desktop/native zoom, labels, keyboard focus and readable disabled states checked. |

Weighted total: **95/100** (`15 + 15 + 20 + 20 + 15 + 10`). Every dimension is at least 3; no required finding remains open.

**Conclusion: accepted** for candidate `7ec592bddf5642212cdcb3363510982354da780e` and this reviewed scope. This is independent reconstruction and technical evidence, not measured human comprehension, a successful LeetCode submission or publication approval. Browser/device evidence is Linux Chromium only; other browser engines, host fonts and assistive technologies were not tested. Author evidence and implementation were preserved; only the exact authorized report and this run's evidence directory were written.
