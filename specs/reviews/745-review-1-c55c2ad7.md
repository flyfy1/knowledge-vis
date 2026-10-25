# Independent review: 745 — Prefix and Suffix Search

Candidate: `4a3d34fb6f4093b5e73a614d16d9a4bcf59107ca`. URL: http://127.0.0.1:18770/leetcode/745/. Review run: `745-review-1-c55c2ad7`. Target: basic Python, lists, loops, functions, elementary recursion. Reviewer/model identity: no additional identity asserted.

Frozen interpretation: six dimensions weighted 15/20/20/20/15/10, each 0–4; faithful Python preferred. Acceptance requires ≥85, all dimensions ≥3, complete evidence, no required open findings.

## Cold browser walkthrough (saved before repository source audit)

Only the frozen rubric was read before opening Chromium through Playwright. No brief, implementation files, tests, previous review, or author report was read. Page content and the user-facing expandable Python listing were observed as a reader. Desktop viewport 1365×900; screenshots in `745-evidence/745-review-1-c55c2ad7/`.

| Teaching step/question | Action | Observable result | Causal conclusion in my words |
|---|---|---|---|
| 01: Which original word passes both ends, and which index wins? | Read ape/apple/ape table, switch ap/e to app/e and z/e | ap/e shows indices 0,1,2 and answer 2; app/e shows only 1; z/e shows none and −1 | One word must satisfy both predicates. Duplicates have separate zero-based positions; choose the latest qualifying position. Prefix/suffix and bounds are explicitly defined. |
| 02: Why preprocess paired ends? | Read reverse-scan baseline and independently calculate its example | Reverse scan returns the first qualifying word from the right; separate prefix/suffix maxima on ab/ac/db yield minimum 1 although index 1 fails suffix b | Repeated scans redo word checks. A paired key preserves the same-word requirement lost by separate maxima; first-write-only loses later duplicates. |
| 03: What state is maintained and why overwrite? | Predict ap/e as absent→0→1→2; press Next three times | 9/34/43 cumulative writes; 9/32/32 distinct keys; selected values 0/1/2; retained history includes old→new at every word | Every row-prefix and column-suffix combination matches the processed word. Increasing indices make overwriting safe; other pairs remain unchanged. A frame completes a whole word, not one cell. |
| 03: Do excluded words change a key? | At end switch observation to ap/pe; undo once, then reset | History −1→0, 0→0 for apple, 0→2 for final ape; undo gives 0 after 2 words; reset returns empty state and disabled Undo | Overlapping ends are legal. Apple does not end in pe, so its processing retains the earlier answer. Rewind reconstructs the earlier map, rather than just changing highlighting. |
| 04: Can the invariant transfer to a new dictionary? | Before reveal predicted 2 for aba/aba on ababa/aba/ababa/axa; choose 2 and reveal | Correct explanation shows 0→1→2; axa cannot overwrite | Last word alone is insufficient: the last qualifying word wins, including overlapping whole-word ends. |
| 05: Which Python operations implement the grid? | Read prose, expand complete Python listing | Nested nonempty length loops slice prefixes/suffixes; assignment writes index; f uses get with −1 | Cell (ap,e) at apple corresponds to p=2,s=1 and assignment of 1. Constructor stores query-independent pairs. Query reads do not change the map. Character slicing/hash costs explain cubic preprocessing bound rather than counting writes alone. |

Independent custom predictions recorded before source execution: words `["bat","boat","bat","cat"]`: b/at→2, bo/at→1, b/zz→−1. Fresh wrong-rule counterexample `["ax","ay","bx"]`, a/x→0; separate maxima 1 and 2 would wrongly give 1. These will be **code checks**, because the UI offers presets rather than arbitrary input. The first three words in the exercise qualify; the fourth fails. Initial empty map invariant: after k words, each key stores the greatest matching index below k; every current-word pair is included and no nonmatching pair is generated.

Cold screenshots: `cold-initial.png`, `cold-end.png`, `cold-reveal.png`. Cold walkthrough establishes reconstructability by this reviewer, not actual novice comprehension or a successful LeetCode submission.

## Audit after cold walkthrough

Outcome: **accepted**, 97.5/100. Required open IDs: **none**. One optional wording advisory is recorded below.

### Candidate and official contract

`git rev-parse HEAD` returned the requested revision; `git diff --exit-code` passed. Served bytes exactly matched checkout files for index, app, core, translations, styles, canonical source, offline mirror, and shared runtime/styles. SHA-256 receipt: `745-evidence/745-review-1-c55c2ad7/independent-checks.json`. Canonical Python SHA-256 is `f1e4b4da6652b7a25b26648e9765054a683600c3db5c7ad038c36597dea1a259`.

Read the [official statement](https://leetcode.com/problems/prefix-and-suffix-search/) normally after the cold walk. It specifies construction from words and repeated f(pref,suff), the greatest original index or −1, 1…10000 words/calls, nonempty lowercase ends/words of length at most 7. The displayed constraints and example agree. Python WordFilter.__init__/f faithfully implement this original interface; this is executable submission code, not a conceptual analogy. No non-Python language exception applies. Read LANGUAGE_FILES in `scripts/register_leetcode_lesson.py`: Python maps to solution.py, python-code.js, PYTHON_SOURCE. No earlier review for this ID was present in specs/reviews; no historical required finding is being closed. No brief or author self-review was needed to fill a teaching gap.

### Independent correctness and teaching audit

Executed the actual canonical solution with exec/compile, using the predictions recorded above. On bat/boat/bat/cat, b/at returned 2, bo/at returned 1, b/zz returned −1. Independent intermediate checks of all five constructor prefixes gave map sizes 0,9,23,23,32 and b/at values −1,0,1,2,2. Checks used direct startswith/endswith matches, not the production pair formatter. ax/ay/bx with a/x returned 0, refuting separate maxima/minimum. These are code checks, not custom UI experiments.

Also executed one-letter a/a, whole seven-letter abcdefg/abcdefg, overlap aba/aba on ababa/x (winner 0 despite final x), query longer than every word, absent keys, duplicates, repeated calls, input preservation and map preservation under a failed lookup. All passed. The original callable semantics and absence of input mutation were checked directly.

The source enumerates exactly all nonempty end-length combinations and stores immutable string-pair keys. After each processed word, soundness, completeness and increasing index order justify overwrite. Termination follows finite word/length loops. A selected query is an observation of that map; orange cells mark the observed pair only when written by the current word. They do not assert that other cells are absent. The 2-word apple frame has 25 current writes, 34 cumulative writes, 32 distinct keys; the duplicate final ape adds 9 writes and no new keys. This distinguishes work from stored state and output. For app/le the earlier ape remains absent and apple changes −1→1. Rewind/replay restores the full state/history.

The explanation proceeds from a tiny hand calculation to a repeated-scan baseline, two wrong rules, the complete pair grid, a concrete overwrite sequence, the invariant/proof, and an overlapping-end transfer exercise. Both included pairs and excluded words receive causal explanations. New key/hash-map/invariant terms are explained. The exercise combines overlap, duplicate positions and a failing last word; it tests use of the rule rather than copying the opening answer.

Python mapping checked explicitly: apple at index 1, p=2,s=1 writes self.best[("ap","e")]=1; p=3,s=2 writes ("app","le")=1. Python slicing and string hashing make up to L² writes per word cost O(L) each: expected O(nL³) construction, O(nL³) stored characters, expected O(K) query for total query length K. The O(nL²) entry bound and input O(nL) storage are distinguished. L=1 still does one write; L=7 does 49. Full bound test uses 10000 seven-letter duplicate words and 10000 repeated queries. Teaching snapshot copies are correctly excluded from submission space. Baseline reverse scan is O(nL) per query and constant additional space; its early exit is correct because indices decrease.

### Inspected tests and reproduced checks

Inspected all three test files and their output handling before running. Commands from repository root:

- `LESSON_TEST_OUTPUT_DIR=specs/reviews/745-evidence/745-review-1-c55c2ad7 python3 -B leetcode/745/tests/test_solution.py` — exit 0; canonical execution and scanning oracle passed, including exhaustive short dictionaries, seeded cases and official-size duplicate stress.
- `LESSON_TEST_OUTPUT_DIR=specs/reviews/745-evidence/745-review-1-c55c2ad7 node leetcode/745/tests/test_core.cjs` — exit 0; 14 preset frames checked against separate scanning expectations; snapshot independence passed; Acorn found 87 translation keys and no duplicate keys; each value has two nonempty strings.
- `LESSON_TEST_OUTPUT_DIR=specs/reviews/745-evidence/745-review-1-c55c2ad7 node leetcode/745/tests/browser.cjs` — exit 0, browser checks passed. Results saved here, never to candidate author evidence.
- `python3 -B scripts/register_leetcode_lesson.py 745 --validate-only` — **exit 0, no stdout/stderr**. Metadata complexity is exactly one nonempty string: “Expected O(nL³) construction time; O(nL³) space; O(|pref|+|suff|) time per query”. No registration performed.

The tests are supporting evidence; scores below also rest on the cold reconstruction, independent calculations, source inspection, browser actions and inspected screenshots.

### Interaction, localization, device and transfer evidence

Both locales exercised all presets, frames and selectable queries, initial/end disabled states, undo/replay/reset, query changes, preset restart and all prediction options. Answer changes conceal feedback until reveal; language changes preserve selected answer and feedback. The fixed exercise is independent of experiment reset/preset changes. Locale switching preserves processed-word position, query, map disclosure, source disclosure and active language focus. A separate 320px zh→en→zh roundtrip verified exact translated #745 H1 and retained 1/3 state. Document titles were also checked. Denied localStorage did not break interaction.

Semantic binding checked against values, not just keys: ap/pe on apple retains 0→0; app/le changes −1→1; initial −1 is provisional absence, final −1 means no full-dictionary match; write counts and completed-word counts retain their units in Chinese. Quiz feedback in both languages explains 0→1→2 and excluded axa. Chinese proof, cost, overlap and duplicate explanations agree with English. One ambiguous English phrase is noted below.

Chromium on Linux (version saved in dense-checks.json), widths 320/390/736/1440 in both languages, plus CSS zoom 2 at 1440 (720 effective CSS layout width). No page-wide overflow. Inspected desktop trace, both narrow languages, both zoom screenshots, forced colors and independent five-by-five apple frames at left/right horizontal endpoints. Narrow cells wrap and the component scrolls; the sticky prefix column preserves row association. Partly visible edge cells while scrolled are viewport clipping, not a text-label collision. Each column can be brought into view; no permanent essential clipping or overlapping text was observed. Dense state is readable with some friction from wrapped pairs. Settled capture and geometry: dense-checks.json and dense-*.png.

Native selected preset labels were measured in their actual CSS font stack (`16px "PingFang SC", "Microsoft YaHei", system-ui, sans-serif`) and the longest English/Chinese selected labels inspected at 320px. English Independent maxima measured 162.08px against 163px available under the test's 20px arrow allowance. It fits this Chromium/Linux environment; this is not a cross-platform font guarantee. Controls remain readable and operable; keyboard Enter advances/resets, visible focus exists, and focused grid responds to ArrowRight. Disabled controls retain opacity 1 and legible muted text.

Contrast helper inspected and calibrated: black 0, white 1, RGB primaries .2126/.7152/.0722; #747474 on black gives 4.492948 and fails 4.5. Actual recorded solid-color pairs include muted/disabled #9aa7b8 on #1c2330 at 6.4494, primary at 13.1007, observed orange at 8.9372. This supports the solid palette, not arbitrary gradient/composited colors.

Exact source parity verified without trim/normalization: canonical bytes, decoded offline PYTHON_SOURCE, displayed textContent including final newline, successful clipboard and downloaded bytes in both locales. Manual fallback independently repeated with a distinct non-source sentinel for **each** locale, denied writeText, focused/full selection, actual Linux Control+C, and clipboard readback equal to canonical. See independent-native-copy.json. No source was written into the clipboard by the test as a substitute for the manual copy action.

Related links activated by keyboard at 320px in both locales. The served #336 step1 explains reverse trie paths matching outside letters; #472 step2 explains cuts reaching complete prefix boundaries. These agree with the link labels; both destinations and fragments loaded. This does not constitute independent acceptance of those other lessons. Browser run recorded no page/console errors, failed local responses or external runtime requests.

Inspected screenshot evidence includes cold-end.png, trace-en-1440.png, trace-en-320.png, trace-zh-390.png, zoom200-en.png, zoom200-zh.png, forced-colors.png, dense-en-320-left/right.png, dense-zh-320-left/right.png, dense-zh-390-left/right.png, controls-en/zh-320.png and long-label-en/zh-320.png. All evidence is under this run's exclusive directory.

### Findings

**745-A1 — optional English negation clarity, open advisory (not a required fix).** Candidate as above; section 03, English, desktop/320px, preset ape/apple/ape. Process two words, select ap/pe; ledger for apple says “both ends do not match; keep the old value” with 0→0. Expected unambiguous wording: “not both ends match” or “at least one end fails”. Apple matches prefix ap but fails suffix pe. Current wording can be read as neither end matching. The surrounding same-word explanation and correct retained value resolve the intended meaning, so this is minor language friction rather than a missing causal bridge or materially different algorithm. Evidence: cold walkthrough history, trace-en-1440/zoom200-en and copy.js untouched binding. Requirement: precise bilingual causal explanation. Suggested owner action: wording clarification in a future candidate; fix revision/regression/recheck: not applicable, no repair made. No required finding is open.

### Scores and conclusion

| Dimension | Weight | Score | Observation supporting score |
|---|---:|---:|---|
| Problem/terms/hand calculation | 15 | 4 | Concrete opening table and query changes establish both ends, original indices, duplicates and −1 before abstraction. |
| Derivation/saved work | 20 | 4 | Reverse baseline, actual cost, pair-grid derivation and wrong-rule counterexamples explain which repeated scans are avoided and why paired keys are necessary. |
| Maintained state/correctness | 20 | 4 | Complete pair generation, increasing-index overwrite, untouched keys, empty base and final lookup justify the invariant; independently checked intermediate maps and boundaries. |
| Interaction/visual meaning | 20 | 4 | Predicted then operated; before/after values, full history, count units and frame semantics agree; rewind, endpoints, resets and exercise invalidation behave as stated. |
| Python/cost | 15 | 4 | Actual canonical class executed, fresh transfer and mutation checks passed; grid→slices→assignment→get correspondence and character-aware cost are explicit; exact transfer parity passed. |
| Bilingual/device | 10 | 3 | Equivalent reasoning and state preservation, keyboard, narrow/zoom and contrast checks passed; dense wrapped cells and advisory English negation create minor friction. |

Weighted total: 15+20+20+20+15+7.5 = **97.5/100**. Every dimension is ≥3. **Accepted for this frozen candidate and observed scope; required_open=[]**. This is an independent lesson review, separate from publication.

Limitations: Chromium/Linux only; 200% verification uses rendered CSS zoom rather than browser-chrome/OS zoom. Custom arbitrary inputs were canonical Python checks because the UI is preset-only. No actual novice participants, assistive-technology user study, production publication verification, or successful LeetCode submission is claimed. No implementation, shared file, test, service or earlier evidence was changed.
