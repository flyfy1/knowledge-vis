# Independent review: LeetCode 315

Candidate: `4a1c5ac1df6aa0d421d35fe25c4b25cd87ebb273`. URL: http://127.0.0.1:18770/leetcode/315/. Review date: 2026-10-25. Reviewer: this independent review run; exact model identifier unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen rubric read first: `specs/leetcode-review-gates.md`; weights 15/20/20/20/15/10. Interpretation frozen before opening: faithful Python, causal derivation and block invariant, strict duplicates, executable canonical parity, bilingual/device access.

## Cold walkthrough — recorded before repository source, tests, claims or prior reviews

Real Chromium through Playwright, desktop 1280×900. Only rubric and rendered candidate read. Screenshots: `315-evidence/315-review-3-d972db1d/cold-desktop.png`, `cold-operated.png`. Initial full-page screenshot inspected. All five teaching steps are present simultaneously. The UI permits presets, not custom arrays.

1. **Definition.** Question: which right-side elements count? Before clicking I predicted 2 for index 0 of [5,2,6,1], witnessed by 2 and 1. Action: choose answer 2. Result: count 2, witnesses 2,1 and correct feedback. Change position to 2: result clears, asks again for suffix [1]. Conclusion: count positions to the right with smaller values, not equality or numeric distance; changing input invalidates a prediction.
2. **Baseline.** Question: what repeated work grows? Prediction: advancing to i=1 gives cumulative 5 comparisons and count 1; final cumulative 6. Actions: Next, Next, Next; Previous; Reset. Results: i=1/5/1; i=3/6/0; rewind i=2/6/1. Conclusion: suffix lengths 3+2+1+0 yield quadratic comparisons, although each index pair is compared once. The fixed array makes changing focus distinct from data mutation.
3. **Suffix invariant.** Question: what reusable state replaces rescanning? Prediction for [3,1,2,1], i=1: suffix [2,1] has zero values smaller than 1; including equality would incorrectly return 1. Actions: change example, Next twice, choose 0, Reveal. Result before reveal: ordered processed suffix [1,2], partial answers [?,?,1,0]; after reveal [1,1,2], [?,0,1,0], explicit exclusion of equal 1. Advance: [3,0,1,0]; rewind returns to unrevealed i=1; reset. Conclusion: query the already processed suffix before inserting the current value. Minor observed anomaly: final Next label says “Baseline complete…” in this optimized conceptual trace.
4. **Fenwick blocks.** Question: how does a frequency sum avoid reading every rank? Prediction: insertion at rank 2 changes bit[2] 3→4, bit[4] 4→5; prefix(2) becomes 4. Actions: insert, move query rank to 5, reset. Results: exact predicted old/new cells; other cells unchanged; rank 5 queries prefix(4)=5 using bit[4] alone. Conclusion: each cell covers [k−lowbit(k)+1,k]; queries combine disjoint adjacent blocks; insertion must update all containing blocks. The prose hand-builds [5,2,6,1] from zero before the explicitly separate slider experiment. Lowbit, rank compression, two’s complement, and excluded cell 3 are explained in rendered prose.
5. **Python/transfer.** Question: can the invariant select actual code operations on a different case? Prediction: exercise [9,-4,2,6,2] at i=2 uses rank 2, prefix(1)=0, then cells 2 and 4. Action: select A, Reveal. Result: correct, bit becomes [0,2,1,3], answer[2]=0. Change to B clears feedback; reveal explicitly says B includes the equal 2. Select verification [2,2]: optimized and baseline both [0,0]. Open rendered canonical Python: mapping is `answer[position] = prefix(rank - 1)` followed by `add(rank)`. Conclusion: query first; insert establishes the next iteration’s suffix; output positions retain original indices. Complexity prose includes sorting, dictionary/tree/output space, and why sorted-list insertion is not fast.

Fresh independently chosen **code-check predictions** (UI has no custom input), saved before execution: [4,-2,4,0] → [2,0,1,0]. At first 4, suffix [-2,4,0] contributes -2 and 0, excludes equal 4. Counterexample to querying the current rank: [7,7] → [0,0], whereas prefix(rank) at the first 7 would count the equal right-hand 7 and return 1. Invariant: before each query tree frequencies equal exactly the right suffix, including multiplicity; positive compressed ranks and rank−1 handle minimum and equality. Independent execution remains to be audited below.

Cold walkthrough saved at this point; subsequent sections are source/audit evidence.

## Candidate identity, statement and source audit

`git rev-parse HEAD` matched the requested revision exactly. Initial status contained only this new report and evidence directory. Browser requests independently compared served index, app, core, copy, review-fixes CSS, canonical Python and mirror bytes with the checkout; additional requests matched shared `leetcode/style.css`, `leetcode/common.js`, and lesson metadata. Identifying SHA-256 values:

| Asset | SHA-256 |
|---|---|
| index.html | 9f160d7bb47a243d0e8bbdfd4f3a097e3f8ed7a4101cc91c5e823bdf29b396c8 |
| app.js | 13aaab61bfb3e8d51269cdab8edcb3076cd7604836b4a5e7df8893bfaa473609 |
| copy.js | 32ad677bc04228a9ade3029c202fb1632eca612193cce4ce17c57129aaa480b5 |
| core.js | 86a2f4ec08400395f131616f71ef37581a82789e48b5201b5f1c311d70af6cb6 |
| solution.py | 6c0831c71d0d58f0dbba394dfc6525c2efe8074ba202e41c547ce0f60847da9a |
| python-code.js | 1f1e43ba41786b9285912c3135c9d13197c062a346c5333f56be15f1fb929fb6 |
| review-fixes.css | b2ed357c56c533c48c85eb19f3793c4fb28245c733fc20f46fab35cc67b8d608 |

After saving the cold record, read the [official statement](https://leetcode.com/problems/count-of-smaller-numbers-after-self/) normally. It confirms smaller-to-right counts, examples [5,2,6,1], [-1], [-1,-1], n from 1 to 100000 and values −10000 to 10000. No bypass or submission. Official text access succeeded; its fetched view did not expose a language selector. Canonical `Solution.countSmaller(self, nums: List[int]) -> List[int]` is a faithful Python interface for the original array problem. This lesson is not a non-Python exception; no language-contract.json is present or required. `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py` specifies `solution.py`, `python-code.js`, `PYTHON_SOURCE` for Python, which are exactly the audited source, mirror and export. No conceptual analogy is presented as the original submission.

Read canonical Python, core, app, localization, HTML and loaded styles after the cold walk. Author BRIEF was not needed to reconstruct the explanation. The canonical Python actually executes the shown algorithm. Rank compression uses a new sorted set and dictionary; nums remains unchanged. Queries take disjoint intervals ending at a descending index; updates visit containing intervals with increasing positive indices; neither loop can be stuck at 0. `prefix(rank-1)` excludes every equal value, while repeated adds preserve multiplicity. An empty tree handles the rightmost position and `prefix(0)` handles the minimum rank. Empty input is an extra defensive behavior outside official constraints.

For the independently predicted [4,−2,4,0], actual canonical Python returned [2,0,1,0]; for independently chosen equality counterexample [7,7], [0,0]. Inputs remained unchanged. Additional independent boundaries: [−10000] → [0]; [−10000,10000,−10000] → [0,1,0]. These are **code checks**, not custom-input UI experiments.

Python line tracing at line 27, immediately after writing the answer and before `add(rank)`, observed:

| position | rank | partial answer (unwritten slots initialized to 0) | bit before insertion |
|---:|---:|---|---|
| 3 | 2 | [0,0,0,0] | [0,0,0,0] |
| 2 | 3 | [0,0,1,0] | [0,0,1,0] |
| 1 | 1 | [0,0,1,0] | [0,0,1,1] |
| 0 | 3 | [2,0,1,0] | [0,1,2,1] |

Here ranks are −2→1, 0→2, 4→3. At i=0, prefix(2) reads bit[2]=2, representing −2 and 0; the right-side 4 is excluded. Adding rank 3 then increases bit[3] 1→2. This maps the visible query/write/insert transition to actual Python, rather than only to the sorted-suffix animation. Independently checked every Fenwick cell in every JS `bitTrace` frame for this input against the post-insertion suffix and the interval `[k-lowbit(k)+1,k]`; all agreed. UI `trace` is a sorted-list conceptual simulation, explicitly distinguished by the lesson from executable Fenwick cost.

Actual bounds agree with lesson: at most n distinct ranks; sorting dominates at O(n log n), n prefix/update pairs take O(n log m) with m distinct values; rank dictionary, tree, answer and temporary set/sort consume O(n) extra space. Query removes a binary 1 each time; update lowbit at least doubles. A sorted list would incur shifting on insertion, which the lesson now explicitly warns can total O(n²).

## Inspected tests, safe execution and parity

Read `tests/test_solution.py`, `test_core.js`, `browser.cjs`, `review-regression.cjs`, and `fenwick-review-r3.cjs` before executing tests. No test was allowed to regenerate candidate or earlier evidence. The simple browser smoke script was inspected but not run because it adds little to the exercised regressions.

- From repository root, **`python3 -B scripts/register_leetcode_lesson.py 315 --validate-only`**: exit **0**, no output. Repeated independently with the same result. `lesson-entry.json` complexity is exactly the nonempty string **`O(n log n) time; O(n) space`**. No registration or repair was performed.
- With bytecode disabled, loaded the inspected Python test module with runpy and directly executed all five `test_*` functions: examples, boundaries, seeded, exhaustive/mutation and maximum closed forms passed. This ran actual canonical `Solution`. Maximum cases have 100000 equal elements and valid descending blocks of five; the latter has independently specified counts accounting for equal blocks.
- `node leetcode/315/tests/test_core.js`: exit 0; final outputs and intermediate suffix/Fenwick answer checks passed, exhaustive over −1,0,1 through length six.
- `OUTPUT_DIR="$PWD/specs/reviews/315-evidence/315-review-3-d972db1d" node leetcode/315/tests/review-regression.cjs`: exit 0. Output covers original finding regressions, both languages, all baseline states, prediction gating/change, preset endpoints, clipboard/download/fallback, keyboard, layouts and offline/blocked-storage initialization.
- Executed inspected `fenwick-review-r3.cjs` through an in-memory Node Module with only its hardcoded evidence destination replaced by this run's exclusive directory. File itself unchanged. Exit 0: cell ranges, before/current insertion values, rank endpoints, wrong/correct transfer choices, change/reset, retained state on locale/resize, keyboard and served-byte comparisons passed. No page errors.

Browser results `review-browser-r2.json` and `browser-r3.json` are outputs of these newly executed scripts in this run's directory. Their embedded author/self-check status strings are script boilerplate, not this review's verdict. Assertions and screenshots support the independent observations; test totals alone do not establish teaching quality.

Exact 811-byte source equality passed across canonical file, evaluated JSON mirror, DOM code, successful clipboard write, downloaded bytes, and selected fallback followed by Control+C, including final newline. Clipboard rejection was deliberately induced and produced localized manual-copy guidance and exact source selection. Offline `file://` initialization with inaccessible localStorage retained canonical display in both locales. No tracked exports, source, tests or author evidence were rewritten.

## Interaction, bilingual binding and access observations

Both EN and Chinese were operated in real Chromium, using NODE_PATH package resolution and `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. The regression tested all positions/guesses (correct counts 2,1,1,0), change-clears-feedback, baseline totals 3,5,6,6,6 through completion and reverse/reset, all trace preset endpoints and rewind/reset. Trace reset returns to the first **post-insertion** frame; the readout explicitly says Insert. Rewind to the challenge restores its pre-insertion state and clears the prediction. Changing a revealed prediction also restores pending state and disables Next until reveal. Locale changes preserve selected positions/answers, prediction and reveal state. The tree insertion stays applied across locale changes; reset restores bit[2]=3 and bit[4]=4, preserving selected query rank. Transfer reset clears selection/feedback and disables reveal; changing options clears feedback. Resize retains revealed transfer state.

Meaning bindings checked independently against arithmetic, rather than only matching keys:

- Both locales: i=1 of [3,1,2,1] displays suffix [1,2] before reveal and [1,1,2] afterward; count 0 and feedback explicitly exclude equal 1.
- Query rank 4: bit[3] (3..3)=1 plus bit[2] (1..2)=3. After insertion these become 1+4=5; skipped cell 3 is unchanged. Chinese readout uses 树状数组格子, English Fenwick nodes.
- Transfer A is correct; B includes equality, C misses containing block [1,4], D assigns the wrong rank. All four feedback paths in each language give the same correct bit result [0,2,1,3]. These meanings match the visible state and actual code.
- Localization AST duplicate detection checked initial object keys and later assignments within each zh/en namespace, plus equal namespace key sets. No duplicates found. This is separate from the observed semantic checks above.

Captured and inspected screenshots in this run's directory include desktop cold page, EN 320 tree and table-right, ZH 390 tree, ZH 320 transfer, EN/ZH zoom tree/transfer, EN 390 lowbit/worked-build, ZH 390 cost, EN/ZH 320 suffix, EN 320 baseline, ZH 320 hand, and the settled zoom viewport. No essential text/value intersection was observed in these states. Counts, indices and current markers remain separate at 320/390/desktop; prose wraps readably. Fenwick table intentionally has a 520px minimum and scrolls within its own focusable region. At 390px it had clientWidth 328 and scrollWidth 520; focusing it and pressing ArrowRight moved scrollLeft from 0 to 40. Right-edge capture confirms current values and query-read status are reachable. Main page overflow checks passed. Long rank dictionary code is legible in the mapping table; full Python has component scrolling.

At 200% **CSS zoom** and 1280×900, both locales retained controls/state and readable text. This covers magnification/reflow, not native browser-menu zoom. Some element screenshots include sticky navigation across the element because of capture scroll position; ordinary viewport screenshots and scrolling show the underlying rows. No collision finding is inferred from that screenshot artifact. Keyboard Tab/Enter selects guesses; Enter activates insertion and reveal; range ArrowRight changes 4→5; table ArrowRight scrolls. Visible focus uses the orange outline.

Computed contrast against loaded dark colors: main text about 16.09:1; muted label text on panel about 7.08:1. Baseline disabled Previous remains decipherable but dim: opacity .4 gives about 3.30:1 composited text/background contrast. Tree/transfer disabled controls use local opacity 1 and muted text, visibly readable in inspected images. Disabled baseline controls are a usability friction, not a required contrast failure for inactive UI. No comprehensive assistive-technology conformance claim.

## Stable findings and closure against this revision

Earlier reports were opened only after saving the cold walkthrough. The first report had R315-1..3; the second closed these and introduced R315-4..5. I independently rechecked all five against **4a1c5ac1df6aa0d421d35fe25c4b25cd87ebb273**. Earlier evidence remains intact.

| Stable ID / original severity | Explicit regression evidence on this candidate | Status |
|---|---|---|
| R315-1 / required high: incorrect per-position guess | Every guess 0..4 at each position in both locales; correct only for 2,1,1,0; witnesses and selection agree; locale retention and position-change reset pass. Cold step 1; new hand screenshots and regression JSON. | Closed |
| R315-2 / required medium: cumulative metric contradiction | Baseline readout and metric agree at 3,5,6,6,6; reverse/reset agree. Cold step 2; EN 320 baseline screenshot, regression JSON. | Closed |
| R315-3 / required medium: source newline parity | Exact canonical/mirror/display/copied/downloaded/manual-fallback bytes verified including trailing newline. | Closed |
| R315-4 / required high: missing Fenwick causal bridge | Cold steps 4–5 independently reconstruct compression, lowbit, cell intervals, disjoint query partition, containing-block update, explicit old→new values and full build from zero; source and interval oracle agree. New EN 390 lowbit/worked-build and tree screenshots; both locale assertions. | Closed |
| R315-5 / required medium: no transfer exercise | New [9,−4,2,6,2] challenge asks rank/query/updated cells before reveal; I predicted A before reveal. B/C/D causal feedback correct; selection-change/reset/locale/resize/keyboard checked in both languages. ZH 320 transfer and EN/ZH transfer screenshots. | Closed |

For all closures: fix revision assessed is this requested candidate; reviewer recheck is this run; no owner work remains required. Diff from the second review's candidate adds the prose derivation, tree table/update experiment, transfer exercise and associated styles/tests; this review covers those paths fresh and regresses earlier fixes rather than relying on author claims.

### R315-6 — Optional endpoint wording polish

**Minor / optional / open; not a required fix.** Candidate as above; section 3 suffix trace; EN and Chinese; desktop (same binding at every width); preset [3,1,2,1]. Reproduce: select preset, advance twice, select 0 and reveal, advance to i=0. Expected: disabled endpoint label describes completion of this suffix trace. Actual: `#traceNext` displays “Baseline complete: same answer as the optimized method, but comparison work grows quadratically.” Chinese similarly calls it the baseline scan. Readout/answers correctly show [3,0,1,0], so this does not block reconstruction, but the shared `baselineDone` binding misnames this conceptual stage. Evidence: cold action record and app.js traceRender binding. Violated intent: accurate stage labeling/interaction meaning. Owner: lesson author, use a dedicated localized completion label when next editing. Fix revision: none; regression pending for this optional polish.

## Scores and conclusion

| Dimension | Score | Weighted points | Observation/rationale |
|---|---:|---:|---|
| Problem, terms, hand calculation | 4/4 | 15 | Right-side indices, strict inequality, witnesses and output positions are concrete; manual predictions agree. |
| Derivation and saved work | 3/4 | 15 | Baseline sum, suffix reuse, compression and block query/update are reconstructable. Step 4 compresses many new concepts into consecutive paragraphs before the full tree build, so progression still has minor friction for basic Python. No essential bridge is missing. |
| Maintained state and correctness | 4/4 | 20 | Pre/post suffix and frequency invariants, included/excluded cases, cell dependencies, termination and boundary handling are explicit and independently verified. |
| Interaction and visual meaning | 3/4 | 15 | Prediction/reveal/change, old/new cells, rewind/reset/endpoints and retained state work. The slider is a separate fixed-frequency experiment, and the suffix endpoint has optional misleading completion wording. |
| Python and cost | 4/4 | 15 | Faithful canonical execution, exact parity, independent fresh case/mutation checks, visible code mapping and actual time/space derivation all pass. |
| Bilingual and device access | 3/4 | 7.5 | Equivalent causal content and feedback; keyboard and narrow-screen component scrolling work; CSS 200% magnification readable. Dim baseline disabled controls and wide-table scrolling add minor friction. |

**Total: 87.5/100. Outcome: accepted for this candidate and review scope.** Every dimension is at least 3; required open IDs: **none**. R315-1 through R315-5 are closed with this run's evidence. R315-6 is optional wording polish and does not change numerical behavior or prevent reconstruction.

Limitations: this is an independent reconstruction review, not measured human comprehension, successful LeetCode submission, publication authorization or production delivery verification. Native browser-menu zoom and full assistive technology testing were not performed; 200% CSS zoom was exercised explicitly. The statement was accessible, but no claim of official selector inspection is made for this Python lesson. Only the exact requested report and this run's exclusive evidence directory were written; implementation, shared files, services, tests and earlier evidence were preserved.
