# Independent review: 51 — N-Queens

Candidate: `95a02f2a7cbe73044d6bbf0dfc8053999f17815d`; URL: http://127.0.0.1:18770/leetcode/51/. Review date: 2026-10-18. Target: basic Python, lists, loops, functions, elementary recursion. Reviewer: this independent review run; exact model identifier unavailable. No authorship, novice comprehension, submission, or publication claim.

## Frozen interpretation and cold browser walkthrough (saved before source audit)

Read only `specs/leetcode-review-gates.md` before opening the candidate in headless real Chromium through Playwright. Six weights: 15/20/20/20/15/10. Interpret dimensions as: reconstruct board output and attacks; derive prefix pruning from full permutations; maintain exact placement/constraint sets and undo; understand snapshots/output history and prediction; transfer to executable Python and honest cost; equivalent Chinese/English and accessible device controls. Acceptance requires >=85, all dimensions >=3, complete evidence, no required open fixes.

At first load (1365×900, English), the five teaching steps and their explanatory prose were visible; no source, brief, tests, earlier review, or author notes had been opened. Initial full-page screenshot: `51-evidence/51-review-2-edd9687d/01-cold.png` (inspected).

### Predictions recorded before operating/revealing

- Trace n=4: first place (0,0), then row 1 column 0 should be rejected for column collision and column 1 for diagonal collision. Column 2 is locally legal but prefix [0,2] must fail at row 2. Undo must restore sets, without removing already saved answers.
- Visible quiz n=5, prefix [0,2]: predict B, legal columns {4}. For row 2, c=0/2 collide with columns, c=1 has sum 3 already occupied, c=3 has difference -1 already occupied; c=4 has three unused keys.
- Independently chosen custom case (UI is preset-only, so later verification will be a **code check**): n=6, prefix [1,3], row 2 should allow {0,5}. Current columns {1,3}, differences {-1,-2}, sums {1,4}. Counterexample to checking columns alone: c=4 has unused column but difference -2, attacking (1,3). Rejecting it is necessary even though a column-only filter accepts it.

### Step 1 — What must we return?

Question: what is a solution and what counts separately? Action: read board contract and manually expand vector [1,3,0,2]. Observation: row strings .Q.. / ...Q / Q... / ..Q.; reflection [2,0,3,1] also counts; n=1 returns [["Q"]], n=2/3 empty. Causal conclusion: one queen in each of n rows is forced by n nonattacking queens; row strings preserve actual positions and every distinct safe vector needs its own saved board. Baseline prose and displayed baseline Python explain generating column permutations then checking pairs; this was page-visible teaching content, not repository inspection.

### Step 2 — When can a branch stop?

Question: why can we reject before completing a board? Action: calculate the two displayed diagonal examples and inspect invariant prose. Observation: (0,1)/(1,2) share difference -1; (0,3)/(1,2) share sum 3; legal [0,2] still has no continuation at n=4. Causal conclusion: existing attacks persist regardless of future rows; early rejection saves all completions of a bad prefix. Three unused keys establish local safety, not a guarantee of a solution. Sets must describe exactly the current prefix, and undo must remove every added key.

### Steps 3–5: operation observations pending below

### Step 3 — Place, reject, and undo (completed cold)

Question: what changes on place/reject/undo/save, and what does rewind mean? Action: open previous snapshot, Python operation, and full history; advance events 1–12; return to event 9, previous, next; jump to endpoint 79; use slider Home then 40 ArrowRight presses. Observation: 1 places [0] with all keys 0; 2 rejects (1,0) for cols and 3 rejects (1,1) for down, changing only ×. Event 4 places [0,2], sets {0,2}/{-1,0}/{0,3}; events 5–8 reject all row-2 columns, including c=1 for up and c=3 for down. Event 9 removes row 1's queen and keys, leaves [0], marks ?; its previous board still shows [0,2]. Rewind/forward reproduces event 9's entire rendered section exactly. At 79 both saved boards remain while placement and every set are empty. At 40, working placement [2] coexists with the first saved board [1,3,0,2]. History enumerates each event through the selected time.

Paraphrase: rejection is a tried-square marker, not an extra queen or state mutation; undo changes the working prefix and constraints, not accumulated answers. Rewinding time restores the output count at that point, distinct from algorithmic undo. The trace supports the predicted dead-end behavior without needing author notes.

### Step 4 — Predict, then verify (completed cold)

Question: do diagonal constraints really exclude otherwise free columns? Action: select B only after recording the calculation above, then Check my prediction. Observation: correct prediction; explanation enumerates excluded c=0,1,2,3 and legal c=4 with keys (4,-2,6), and explains both wrong choices. Paraphrase: column freedom alone is insufficient; all three occupied-key tests must fail before a safe extension exists. Screenshot `04-cold-prediction.png` records revealed feedback. The fresh custom n=6 case remains reserved for code verification, since only n=1…4 presets are available in the simulator.

### Step 5 — Transfer to Python (completed cold)

Question: why does exhaustive backtracking return every distinct board safely, and what does the visual operation execute? Action: read correctness/cost and mapping table, expand page-visible complete submission code and compare event 4/9 operation snippets. Observation: event 4's four append/add calls are followed by search(r+1); event 9 has pop and three removals. Base case constructs a fresh row-string list, appends it, and returns. Paraphrase: each safe row choice defines one unique path; none of a safe board's prefixes is pruned. Recursion ends after at most n placements. Newly created row strings/list detach output from subsequent working-state pops. Cost distinguishes n scanned columns per incomplete prefix, quadratic board materialization per solution, O(n) working state, and separate tutorial snapshot storage. The precise V-based bound is accurate but requires reading several new symbols; it is explained in prose.

Cold walkthrough complete and saved before repository/source/test/prior-report inspection. Cold screenshot `03-cold-save.png` shows a saved solution surviving a new root placement. `02-cold-undo.png` was captured at event 12 (despite its filename); event 9 undo observations are recorded above, with a focused regression screenshot to follow. These observations are reviewer reconstruction, not a measured novice teach-back.

## Candidate identity, official statement, and source audit

HEAD equals the requested candidate. All nine fetched lesson/shared assets matched filesystem bytes. Read the [official statement](https://leetcode.com/problems/n-queens/) through normal public web access: distinct boards in any order, Q/dot representation, n=4/n=1 examples, and 1≤n≤9 agree. No access bypass or submission attempted.

| Asset | SHA-256 of served and local bytes |
|---|---|
| index.html | 93615703c08334e2afd8590a1fd8677b598e22eb339c56e3b6a7c7bda8da8c0b |
| style.css | 19c80a7949cb1f9e7e253d015c08b77460760ba2959f667daf23767e93ae155a |
| app.js | 6ccba739fe28f9b1d4efe53d4a92544968a1ddd9045f95dcd5cf1b91828a131d |
| core.js | dbdb6b3ab9c0e140803417e2f5d5aa1258fd9dc8c39e0dc8ffbad86becea6747 |
| copy.js | 1f51ec1bfb4dbc397468818bfa6d3c1c8f70692313b26c3287adc64bf3dd843b |
| python-code.js | 1dddd310194b80086c00eb99d1c9c1e6afbd7ef8ff7353758a7fa1b2bb09035c |
| solution.py | 79fb37691e87f85208804459e37d3fa0b26627f64e3fc4c4ad21a95447f5fff5 |
| ../common.js | f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b |
| ../style.css | 6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27 |

Audited canonical Python, mirror, simulation, rendering, bilingual copy, HTML, local/shared CSS, locale runtime, and lesson-specific algorithm/browser/zoom tests. Repository source and earlier review were opened only after the saved cold record. No BRIEF or SELF-CHECK explanation was used to supply a missing causal bridge.

The recursion matches the invariant: before a placement, all three keys are absent; adding them creates the next legal prefix. A child's complete exploration restores its own state, so the parent can remove exactly its four additions without removing any other queen's keys. Rejection changes no keys. Each complete board has a unique sequence of row choices; its legal prefixes cannot be pruned. Finite column loops and strictly increasing r ensure termination. At r==n a new list of new immutable strings is saved. JS deep snapshots copy placement, all sets, and each board; selecting a historical frame restores its corresponding historical ledger.

Concrete post-cold visual-to-Python check at n=4 event 31→32: before placement [1,3,0,2], after [1,3,0], remove column 2, difference 1, sum 5; first saved board remains unchanged. The ? at (3,2) represents that removed choice. This is `placement.pop(); cols.remove(2); down.remove(1); up.remove(5)`, after the completed child returns.

Complexity follows the actual loops: V incomplete legal prefixes each scan n columns; S solutions each construct n strings of length n, so O(n·V+S·n²). Distinct columns bound V by the sum of partial permutations, O(n!), yielding the stated conservative O(n·n!+S·n²). Live recursion, placement, and occupied keys use O(n); output uses O(S·n²). Deep tutorial snapshots have additional F-dependent storage. The baseline's O(n²·n!+S·n²) upper bound is valid even with early pair-check termination. Neither explanation implies polynomial search or Python execution inside the browser.

## Independent computations and inspected test execution

Inspected tests before running. `algorithm.py` suppresses bytecode and reads candidate files; browser/zoom scripts generate images/JSON in configurable output directories. Generic first-ten tests were also read during discovery but were not run or credited for #51. All generated results were redirected into this exclusive evidence directory; no tracked evidence or candidate assets were regenerated.

Commands executed:

- `PYTHONDONTWRITEBYTECODE=1 python3 leetcode/51/tests/algorithm.py`: n=1…8 complete board sets agree with permutation/pairwise oracle; n=9 has 352 valid unique boards. All 120 snapshots across n=1…4 satisfy exact-set and transition checks. Mirror parity passes.
- `LESSON_URL=http://127.0.0.1:18770/leetcode/51/ LESSON_TEST_OUTPUT_DIR=specs/reviews/51-evidence/51-review-2-edd9687d node leetcode/51/tests/browser.cjs`: 159 named assertions, no page/HTTP errors. Assertion contents and relevant observations are described below; their count alone is not teaching evidence.
- Same environment with `node leetcode/51/tests/zoom-layout.cjs`: 10 locale/layout cases, zero failures; checks actual word/glyph bounds in both current and previous boards, equal column widths, stacking, no page overflow, retained event 32/[1,3,0]/one saved solution.

Separately executed a reviewer-written recursive oracle using pairwise row/column distances, without the candidate's diagonal sets or the author's permutations implementation. Complete output sets agree for **every n=1…9**, counts **1,0,0,2,10,4,40,92,352**, including completeness at the official maximum. Verified distinct returned list identities, changing one returned board leaves its sibling unchanged, and another solve call returns the original boards.

**Fresh custom-input code check (not a UI experiment):** n=6 prefix [1,3] has next legal columns [0,5], matching the pre-reveal prediction. c=4 is unoccupied but shares difference -2 with (1,3), disproving the column-only rule. Pairwise enumeration gives exactly one full solution extending this prefix, [1,3,5,0,2,4]; its six strings occur in canonical Python output. The legal c=0 branch has no completion, further distinguishing local legality from eventual success. No extra presets or input capability are claimed.

## Interaction, language, device, and accessibility observations

- Both languages: browser suite operated every forward event and rewound every event for all four presets, with output counts 1/0/0/2 at the end and zero at the start. Initial Previous/Reset and terminal Next are disabled. Forward/back reproduced board and key DOM exactly. Reset clears trace/output and retains independent quiz state; changing size restarts the trace.
- Quiz: all three selections begin with feedback hidden, reveal correct/incorrect verdicts with exclusion reasons, and changing selection hides stale feedback. In the cold walk B was predicted and then confirmed; suite independently checks A/B/C behavior in both locales.
- Switched English→Chinese at event 32 with B selected/revealed and previous-state/source disclosures open: position, selection, feedback, disclosure, placement and saved board were preserved. Read rendered Chinese derivation, invariant, correctness, cost, and feedback against English. The same diagonal-preservation/pruning/restoration/completeness reasoning is present. The Chinese phrase “同行沿对角线移动” is slightly awkward, but the explicit coordinate changes and examples make the intended diagonal step clear; no materially different algorithm is taught.
- Keyboard: native slider Home and 40 ArrowRight presses reached event 40 during cold interaction. Suite used Enter to advance with a measured 3px focus outline; forced-colors focus remained present. Controls use native buttons/select/range/radios/details, associated labels and table headers; Q/×/? have textual meaning and per-cell accessible labels. Reduced-motion styling is present and exercised by the browser suite.
- Copy/display/download: displayed code and HTTP-downloaded solution.py equal the canonical file exactly; mirror parity also checked. Stubbed successful clipboard write received the exact full source. Forced clipboard failure exposed the exact-source textarea, focused it and selected the full text, in both languages. Storage denial still allowed locale switching. These are API/fallback checks, not OS clipboard integration certification.
- Independent viewport checks at 320/390/1365 and 640×1000 with body CSS zoom 2, both languages, retained event 32, B feedback and the saved solution. All page scrollWidths equaled viewport width. At 320/390 the board stacks above state; at desktop it is side by side. Board cells measured 40.25/57.75/77 rendered px respectively. At 200% CSS zoom the board is 460 rendered px wide with 59px cells and 32px rendered text; board/state stack. English Row/Column breaks naturally around '/', with each word intact. Step navigation scrolls horizontally to reach every step. Suite additionally covers 736/1440 and controls at least 48px high.
- Contrast computed in each locale: body 16.09:1, explanatory prose 12.62, hints 7.74, terminal disabled Next 13.10, board text 13.40, board headers 7.08, incorrect feedback 6.35, active language 13.10. Disabled controls retain opacity 1. Markers use shape/text as well as color. These measurements and screenshot inspection support readability within this tested scope.

Captured screenshots only under `specs/reviews/51-evidence/51-review-2-edd9687d/`. Visually inspected initial cold page, cold saved-output and prediction captures; all eight independent `en/zh-{320,390,1365,640}-review.png` viewport captures; settled `en/zh-zoom-board-settled.png`; focused suite `en/zh-640-zoom2.png`; suite `en-desktop.png` and `zh-mobile.png`. The wide cold section capture can include the sticky navigation across the captured element; viewport and settled board captures resolve actual readability. Some early Chinese resize captures omitted painted column numerals transiently; settled board captures show all four numerals, and fresh-context zoom regression captures also show them. No persistent missing-header defect was reproduced. Other generated screenshots are supplemental captures, not a claim of separate human inspection of every file.

## Earlier required finding and closure

Read `specs/reviews/51-review-1-b84a663e.md` only after saving the cold walkthrough. It reviewed `2bc56140a9c4fb02af74ccce28cec60be8755d94` and left one required finding. That base was **changes_required**, not accepted. Relevant production diff to this candidate: CSS changes the fixed two-column board layout to an auto-fit grid with an 18rem minimum, prevents axis-word breaking and reserves a 5.5em row-label column; index updates the local CSS cache token. Remaining diff adds author documentation, test/evidence files. No search/Python/rendering/translation/shared-runtime implementation diff was present. This run nevertheless performed a full fresh lesson review.

### 51-R1 — closed against 95a02f2a7cbe73044d6bbf0dfc8053999f17815d

Original severity: required, medium. Requirement: readable diagrams at supported widths/200% zoom; frozen bilingual/device gate and explicit user zoom check. Original reproduction: n=4, event 32, English or Chinese, 640×1000, `document.body.style.zoom='2'`, scroll to current/previous board. Earlier actual: two-column layout squeezed cells to about 31.6 rendered px for 32px text; Q glyphs lost edges and English axis words broke almost character by character. Expected: enlarged markers and axis words fit, with stacked board/state where needed. Original evidence remains in the earlier run's directory, linked through its unchanged report; it was not overwritten.

Fix revision reviewed here: `95a02f2a7cbe73044d6bbf0dfc8053999f17815d` (the actual candidate includes the CSS changes above). Regression evidence: repeated the same event/locale/viewport/zoom actions independently; observed single-column grid, 460px board, 59px cells, intact Q/? and axis words; state [1,3,0] and ledger count 1 preserved. Explicit screenshot evidence: `en-zoom-board-settled.png`, `zh-zoom-board-settled.png`, `en-640-zoom2.png`, `zh-640-zoom2.png`. Inspected focused test checks glyph/word range bounds in both current and previous tables; 10 cases cover both languages at 320/390/736/1440 normal and 640 at zoom 2, with zero failures. Normal-width independent viewport screenshots show no regression. Owner/next action: none for this finding; reviewer recheck complete, **closed**. This closure covers the reported CSS-zoom scenario, not every OS/native-browser zoom implementation.

No new required findings. Required open IDs: **none**.

## Scores and conclusion

| Dimension | Score / 4 | Weight | Rationale from this review |
|---|---:|---:|---|
| Problem / terms / hand calculation | 4 | 15 | Clear all-board contract, zero-based indices, mirror distinction and hand-converted board; official range verified. |
| Causal derivation / saved work | 4 | 20 | Full-permutation waste versus rejecting an irreparable prefix reconstructed; both diagonal directions and local/global legality independently checked. |
| Maintained state / correctness | 4 | 20 | Exact key projections, rejection, undo, detached saved boards, exhaustive unique paths, boundaries and termination supported by trace/source/oracle. |
| Interaction / visual meaning | 4 | 20 | Predictions checked, markers distinguished from queens, prior states/history and output preserved under undo/replay; quiz changes and reset behave coherently. |
| Python / cost | 3 | 15 | Exact operation mapping, executable solution, fresh case/full-range oracle and accurate costs; minor friction for this basic-Python target from dense nested comprehension/all/set syntax and V/factorial notation without a slower syntax walkthrough. Semantics remain reconstructable from prose and event snippets. |
| Bilingual / device | 4 | 10 | Equivalent causal explanation, retained state, keyboard/fallback/contrast checks and readable current/previous diagrams across tested normal widths and 200% CSS zoom; earlier required defect explicitly closed. |

Weighted score: **96.25/100**. Every dimension ≥3; required open IDs **[]**. Outcome: **accepted** for the specified candidate and reviewed scope. This is an independent lesson review, separate from publication.

Limitations: headless Chromium/Playwright using NODE_PATH and the configured executable, simulated viewport sizes and CSS zoom; no physical-device or native OS zoom certification. Clipboard success stubbed; fallback behavior actually exercised. No measured human novice comprehension, successful LeetCode submission, deployment or publication claim. Author tests supplement the independent cold and computational checks. Only this report and its exclusive evidence directory were written; earlier reports/evidence and implementation were preserved.
