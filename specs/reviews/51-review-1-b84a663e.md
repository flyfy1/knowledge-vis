# Independent review: 51 · N-Queens

Candidate: `2bc56140a9c4fb02af74ccce28cec60be8755d94`; URL: http://127.0.0.1:18770/leetcode/51/. Run: `51-review-1-b84a663e`, 2026-10-18. Reviewer: this independent agent run; exact model identifier unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen rubric read first; weights 15/20/20/20/15/10. No brief, source, tests or earlier review read before this cold walk.

## Cold walkthrough (recorded before source audit)

Interpretation frozen before evaluation: the six dimensions require an intelligible all-boards contract, causal pruning derivation, exact reversible constraints, predictive trace controls, executable Python with output costs, and equivalent accessible English/Chinese presentation.

Initial browser read: five numbered teaching sections, English default; n=4 event 0/79, empty board/sets/output. Browser: Playwright Chromium, actual rendered local page, 1280×900.

Predictions before reveal/operation:
- Step 1: manually choose fresh n=5 solution [0,2,4,1,3]. Its differences [0,-1,-2,2,1] and sums [0,3,6,4,7] are distinct; predict a valid board Q.... / ..Q.. / ....Q / .Q... / ...Q.. (code check later: UI only permits n=1…4).
- Step 2 counterexample: for n=4 prefix [0,2], row 2 has no legal column: 0,2 occupied, 1 has sum 3 shared with (1,2), 3 has difference -1 shared with (1,2). Local safety of [0,2] does not imply completion.
- Step 3: next event should place (0,0), with placement [0] and all three sets {0}; next attempts in row 1 at c=0 and c=1 should reject by column and difference respectively. Rejection must retain the queen and sets. Undo should remove all keys, while previously saved boards remain independent.
- Step 4: n=5 prefix [0,2] at r=2 leaves only c=4 (B): c=1 shares sum 3, c=3 shares difference -1, c=0/2 share columns. This is also a useful contrast with n=4's dead end.
- Step 5: expect append/add to mirror a placement, pop/remove to mirror undo, and fresh strings at a solution to survive later mutation.

Cold results, saved before any source inspection:

| Step / question | Action | Observable result | Causal conclusion in my words |
|---|---|---|---|
| 1: What is returned? | Read contract, manually convert [1,3,0,2] to strings and compare displayed example. | .Q../...Q/Q.../..Q.; reflected board also required; range 1…9 and empty results for 2/3 stated. | A solution is a whole board, not a count; row choice determines its string. |
| 2: Why reject early? | Calculate diagonal keys for the examples and the [0,2] dead end. | Both diagonal directions preserve difference/sum; text explicitly distinguishes local legality from completion. | An existing attack persists under added queens, so all extensions of that prefix are wasted. Permutations defer this check and generate doomed completions. |
| 3: How do events change state? | Next through 1–4; expand previous state and Python operation; use slider End, history, jump 32, previous to 31, next to 32. | Events 1–3 match predictions; event 4 shows [0,2], cols {0,2}, down {-1,0}, up {0,3}. Event 31 saves board [1,3,0,2]; event 32 shows [1,3,0], removes c=2/down=1/up=5 and marks ?; ledger retains solution. Event 79 has empty working state and both boards. History contains events 0…79. | The invariant is exact correspondence of the first r row choices and three occupied-key sets. A rejection changes only the marker. Undo reverses a choice, not saved output; rewind restores the historical ledger too. |
| 4: Can I predict? | Choose B, reveal; change to A and reveal again. | B correct with explicit exclusion reasons; changing clears feedback; A gets “Not quite” and the same key-based justification. | Columns alone miss diagonal attacks; an empty future is different from a legal immediate step. |
| 5: Can I transfer? | Open complete Python; compare event 1 with append/add block and event 32 with removals. | Code places then recurses and removes all four state components; r==n constructs fresh strings. Displayed cost includes visited prefixes, output and snapshot memory. | Row increases to terminate; every legal sequence is explored exactly once and saved output is detached from subsequent undo. |

Cold screenshot captures: `01-cold-desktop.png`, `02-cold-undo.png` in this run's evidence directory. Screenshot visual inspection follows in the audit. Fresh n=5 board and n=4 dead-end calculations above were written before revealing exercise feedback. Custom values beyond presets will be labeled code checks. Cold walk complete; source audit begins only after this saved record.

## Source, official contract, and independent checks

HEAD matched the requested revision. Served hashes matched filesystem hashes for all seven lesson assets and both shared assets. Key SHA-256 values:

| Asset | SHA-256 |
|---|---|
| index.html | aecb6a001fc0259b62bd638d7fae2ff9d3402bfdb1dc45f97119c0fea9425085 |
| app.js | 6ccba739fe28f9b1d4efe53d4a92544968a1ddd9045f95dcd5cf1b91828a131d |
| copy.js | 1f51ec1bfb4dbc397468818bfa6d3c1c8f70692313b26c3287adc64bf3dd843b |
| core.js | dbdb6b3ab9c0e140803417e2f5d5aa1258fd9dc8c39e0dc8ffbad86becea6747 |
| python-code.js | 1dddd310194b80086c00eb99d1c9c1e6afbd7ef8ff7353758a7fa1b2bb09035c |
| solution.py | 79fb37691e87f85208804459e37d3fa0b26627f64e3fc4c4ad21a95447f5fff5 |
| style.css | 6f20a16b33baeaedf098c0aca3afea5c85bb1988b6e0305fede27770b65e73cf |
| ../common.js | f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b |
| ../style.css | 6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27 |

Read [the official statement](https://leetcode.com/problems/n-queens/) normally using the web browser tool: publicly accessible statement confirmed all distinct boards, arbitrary order, Q/dot representation, n=4 and n=1 examples, and 1≤n≤9. No access bypass. Python class/method signature is compatible with the requested problem; no submission was attempted.

Audited app.js, core.js, copy.js, index.html, canonical Python/mirror, local and shared CSS, shared locale runtime, and the two lesson-specific test scripts. Author BRIEF/SELF-CHECK were available only after the saved cold walk. No explanation from those notes was needed to repair the cold derivation.

Tests were inspected before execution. `algorithm.py` disables bytecode and reads only; `browser.cjs` writes PNG/JSON to its configured output directory. Executed:

- `PYTHONDONTWRITEBYTECODE=1 python3 leetcode/51/tests/algorithm.py`: matched permutation/pairwise oracle for n=1…8; n=9 validity/uniqueness/count 352; all 120 trace snapshots, exact sets, place/reject/undo and output; source mirror parity passed.
- `LESSON_URL=http://127.0.0.1:18770/leetcode/51/ LESSON_TEST_OUTPUT_DIR=specs/reviews/51-evidence/51-review-1-b84a663e node leetcode/51/tests/browser.cjs`: 159 assertions, no page/HTTP errors. Generated evidence only in this exclusive directory. No candidate tests/assets or prior evidence regenerated.
- Independently wrote a pairwise-attack recursive oracle, without the candidate's sets or the author's permutations implementation. Complete output sets agreed for every n=1…9, counts 1,0,0,2,10,4,40,92,352. This independently strengthens n=9 completeness beyond the author's count-only maximum check.
- Fresh **code checks**, not custom-input UI experiments: n=5 contains [0,2,4,1,3]; n=4 prefix [0,2] has no continuation whereas n=5 allows c=4. Distinct result-list identities, modifying one returned board without changing others, and isolated repeat calls passed.

Reviewer correction, preserved transparently: the pre-reveal vector [0,2,4,1,3] was correct, but its last string was transcribed above as `...Q..` (six characters). The first custom-board assertion caught my typo; the correct five-character row is `...Q.`. The corrected expected board passed. This was a reviewer hand-transcription failure, not candidate behavior.

Invariant/source reasoning: `search(r)` starts with r legal row choices; the keys are exact projections of that prefix. A legal append creates the child's entry state. Since each key is absent before placement, removing it after the child returns cannot remove another queen's key. Rejection preserves state; solution constructs fresh strings; the loop continues after saving, covering reflected and other alternatives. r increases to n, and the finite column loop terminates. JS snapshots copy placement, sorted keys, and each saved board; render uses the selected snapshot for both board and ledger. Event 31→32 maps directly to `placement.pop()`, `cols.remove(2)`, `down.remove(1)`, `up.remove(5)` while retaining the saved board.

Cost is defensible: each incomplete legal prefix scans n candidates; each solution builds n strings of length n. V is bounded by partial permutations, whose sum is O(n!), so O(n·n! + S·n²) is a conservative upper bound. O(n) live recursive/key state excludes returned O(S·n²) output. F retained tutorial snapshots have their own stated bound. No polynomial-time or in-browser Python execution claim.

## Interaction, bilingual and visual audit

Independently operated the cold trace and subsequently inspected the executed browser suite's assertions and results, rather than inferring behavior from its count:

- Both languages: all n=1…4 forward events and rewind to zero, correct zero/one/two output ledgers, exact board/set replay, initial/end disabled states. Reset clears trace/ledger while preserving independent prediction feedback; changing preset restarts trace.
- All three prediction answers: hidden before reveal, correct/incorrect verdicts, explicit explanations, changed selection hides feedback. Switching to Chinese at event 32 retained event, A selection and revealed feedback; prior-state/source disclosures remained open in the suite. Chinese explains diagonal preservation, pruning, local versus global safety, restoration, completeness and output costs equivalently.
- Keyboard Enter advances; slider End reached 79 in the cold walk, with previous/back replay checked. Focus outlines measured 3px, forced-colors focus remained visible, reduced-motion exercised. Native table labels distinguish empty/queen/rejected/undone cells, beyond color alone.
- Displayed source, downloaded source and canonical file are exact. Clipboard API success was stubbed and checked for exact text; forced denial showed a focused textarea with full source selected. This tests fallback and API behavior, not OS clipboard integration. Storage denial still allowed language switching.
- Layout widths 320/390/736/1440 in both languages: no whole-page overflow; essential controls ≥48px. At normal 320px the board stacks above the state, and Q/×/? remain distinguishable. English axis heading wraps awkwardly (`Column` across lines), minor friction. Desktop shows readable side-by-side state. The step navigation is intentionally horizontally scrollable.
- Measured text contrast in both locales: body 16.09:1, explanation 12.62, hint 7.74, disabled terminal Next 13.10, Previous 13.40, board text 13.40, headings 7.08, incorrect feedback 6.35, active locale 13.10. Disabled controls use opacity 1 and remain readable. No color-only marker semantics.
- 200% CSS zoom at 640×1000 was explicitly exercised; page scrollWidth stayed 640. Visual inspection revealed the required finding below despite the automated no-overflow check passing.

Captured and visually inspected all PNGs in this run: `01-cold-desktop.png`, `02-cold-undo.png`, `03-zh-320-undo.png`, `04-zh-200-percent.png`, `05-zh-200-board.png`, `06-en-200-board.png`, `07-en-320-board.png`, and suite `en-mobile.png`, `zh-mobile.png`, `en-desktop.png`, `zh-desktop.png`. Full-page cold screenshots establish sequence context; viewport shots establish readable normal-size controls and the zoom defect. `browser-results.json` contains assertion names and computed contrast evidence.

## Findings and earlier closure

After the cold record, searched earlier review reports for this ID. No earlier lesson-specific review/finding report was present. Shared design/runner references to #51 are not earlier independent acceptance or required-finding closure. No previous finding is being closed.

### 51-R1 — open, required, medium: diagram cells collapse at 200% CSS zoom

- Candidate: `2bc56140a9c4fb02af74ccce28cec60be8755d94`; section 3; both English and Chinese; n=4, event 32; Chromium 640×1000 with body CSS zoom 2 (the candidate's own documented zoom-test technique).
- Reproduction: open /leetcode/51/; select n=4; jump range to 32; set viewport 640×1000; apply `document.body.style.zoom='2'`; scroll to the board; repeat after changing language. See `05-zh-200-board.png` and `06-en-200-board.png`, contrasted with normal 320px `07-en-320-board.png`.
- Expected: enlarged board markers and axis labels remain readable with enough horizontal space, using the available stacked layout when necessary.
- Actual: board and state remain in two columns. Board area is 206 rendered pixels wide; individual cells only about 31.6 rendered pixels wide while font scales to 32px. Queen glyphs lose their right edges against the following cells; English Row/Column breaks almost character by character. The no-page-overflow assertion passes despite this degradation. State and ledger are preserved; this is a layout failure, not incorrect search data.
- Cause visible in source: `.board-layout` switches to one column only in `@media(max-width:620px)`; CSS zoom at a 640px viewport does not activate that breakpoint. Fixed-layout board cells then shrink within one column of the already zoomed container.
- Violated requirement: frozen bilingual/device gate requires readable diagrams on supported widths and zoom; user's explicit 200% zoom check. Core glyph readability must be checked directly, not inferred from document scrollWidth.
- Owner/next action: lesson author; preserve readable cell widths and reflow board/state at enlarged layout, then add a visual/cell-fit regression assertion for both locales and rerun normal 320/390/desktop layouts. No implementation change made in review.
- Fix revision: none. Regression recheck: open; requires a new candidate. Evidence covers CSS zoom only; this does not assert a failure in every native browser/OS zoom implementation.

## Scores and conclusion

| Dimension | Score / 4 | Weight | Rationale |
|---|---:|---:|---|
| Problem / terms / hand calculation | 4 | 15 | All-board contract, indices, format, mirrors and boundaries reconstructable; hand conversion works. |
| Causal derivation / saved work | 4 | 20 | Permutation waste, preserved diagonal keys and irreparable-prefix rejection explained; dead end distinguished from local legality. |
| Maintained state / correctness | 4 | 20 | Exact constraints, full undo, solution ledger, exhaustive-path proof and independently checked boundaries. |
| Interaction / visual meaning | 4 | 20 | Prediction/change, full snapshots/history, replay and saved-output semantics observed, with explicit marker legend. |
| Python / cost | 4 | 15 | Event-to-code mapping, full-range independent oracle, output isolation/parity and honest cost accounting. |
| Bilingual / device | 3 | 10 | Equivalent reasoning, keyboard and normal-width controls work; zoom layout has a concrete required readability defect. |

Weighted score: **97.5/100**. Required open IDs: **51-R1**. Outcome: **changes_required**; the numeric threshold and dimension minima do not override an open required finding.

Limitations: independent agent review, not measured novice comprehension. Chromium desktop/mobile viewport simulation and CSS zoom, not physical devices or native OS zoom certification; clipboard success stubbed. No LeetCode submission, publication, deployment or acceptance of another revision claimed. Only this exact report and this run's evidence directory were written; candidate and earlier evidence remain unchanged.
