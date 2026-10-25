# Independent review: 843 — Guess the Word

Candidate: `617cb7c7e49f533b46c66dc9a53e7c6cefd71cbf`.
URL: http://127.0.0.1:18770/leetcode/843/. Target: basic Python, lists, loops, functions, elementary recursion. Review run: `843-review-1-7f018940`; no invented reviewer/model identity. Frozen weights: 15/20/20/20/15/10. Python interface interpretation applies.

## Cold walkthrough (saved before any source, tests, brief or earlier review)

Only the frozen rubric was read before opening the candidate with Playwright Chromium. Desktop 1280×900. The following records describe rendered content and actions, not author notes.

| Step / question | Action | Observable result | Causal paraphrase |
|---|---|---|---|
| 1. What does one reply count? | Read the two fixed words, show position comparison. | Six columns show acckzz above ccbazz; ✓ at 2,5,6, × elsewhere; reply 3. | Count equality at the same index, not common letters. abcdef/fedcba exposes the tempting letter-set rule. |
| 2. After reply 3, which words remain? | Read and hand-check ccbazz against the four listed words; expand baseline later during audit. | Rendered scores [3,6,2,2]; only acckzz agrees. The text explicitly still requires guessing that survivor. | Equality to the actual reply is necessary: a score greater than 3 is contradictory too. Prior replies remain satisfied because each filter acts on the already consistent set. |
| 3. Which guess saves calls? | Inspect initial table, advance once, then again. | Initial acckzz worst bucket 1 vs ccbazz 2, eiowzz 3, abcczz 2. First call acckzz →2 changes C from four words to eiowzz; ledger retains before/after sizes. Next comparison marks eiowzz chosen (worst 0), acckzz used. Second call eiowzz →6 ends successfully. | A bucket means possible secrets yielding the same reply. Minimize largest unsuccessful bucket; successful 6 is excluded. A singleton is knowledge, not a completed successful call. Highlighting indicates chosen/used probes; candidate chips are actual retained data. |
| 4. Can the equality rule transfer? | Select “aaaaaa and aabbbb”, check, change to “Only aaaabb”, check again. | Correct explanation gives [4,6,4,2]. Changing choice hides prior explanation; wrong reveal says check equality, with the same explicit scores. | Reply 4 preserves both score-4 words, not the guess itself. The answer does not determine which survivor is the secret. |
| 5. How does it map to Python? | Read rendered implementation explanation and costs, without opening source yet. | Names matches, buckets, key, used and equality comprehension are explicitly connected to table/probe/filter behavior; signature describes Master, None and absent budget parameter. | Cached pair scores implement the columns; bucket counts implement table cells; equality filtering implements 4→1. The quadratic cache replaces repeated letter comparisons. Actual executable parity remains for audit. |

Teaching order: concrete columns → four-word filtering and wrong rule → buckets and minimax → a different-word exercise → implementation. Candidate, invariant, bucket and minimax are explained before formal notation. The text distinguishes strict progress without a cap from an unproved ten-call guarantee, and gives 26 repeated-letter words as a failure family. Initial actions above were exploratory; no pre-reveal prediction record is claimed for them.

Cold screenshots: `843-evidence/843-review-1-7f018940/cold-count.png`, `cold-round2.png` (full-page browser captures; inspection pending at this save).

### Predictions recorded before subsequent reveals / executable checks

- UI: choose “One word”, then advance. Prediction: initial C has one word, zero calls; one call returns 6, ends, ledger 1→1. Back should restore zero calls and the same singleton; final should reproduce one successful call.
- Fresh independent custom **code check**, since the UI has only presets: words [abcdef, abcdeg, abzzzz], secret abcdeg. Predicted scores for probe abcdef: [6,5,2]; worst size 1 ties abcdeg, so original order chooses abcdef, reply 5 leaves abcdeg, next call abcdeg returns 6. Input list should remain unchanged.
- Fresh counterexample **code check**: same words, guess abcdef, observed reply 5. “At least the reply” incorrectly retains abcdef (score 6); exact equality retains only abcdeg. Permutation abcdef/fedcba must score zero despite identical letter sets.

No source or earlier review has been opened at this checkpoint.

## Audit after the saved cold walkthrough

### Candidate identity and official contract

`git rev-parse HEAD` returned the requested revision. `git diff --exit-code` passed; the only untracked paths were this report and its evidence directory. Every fetched lesson runtime/source asset matched its checkout bytes, including shared `../style.css` and `../common.js`. SHA-256 identity anchors:

- index.html: `2524ec96f51a866fc617b9cf7a8e19144680e54138344f5f43bc50b54feab914`
- app.js: `14ef08de056e92377ebe3d5fa5f90f27737c21305653a7165000960be486f3fd`
- core.js: `9c29aa7e40e2fb6e81dd8f4ed3e6db2b25a82977f97e80cc4984df99ae7a18b6`
- copy.js: `a513cb37bf9ddf2557daa8027a740c9ca0777ce80eae5be49498c77610448262`
- solution.py: `dc0d1552f34cc429efa9f3ff12daf0c9c42f6ca5604d97ae64dc42aa2b7bff30`
- python-code.js: `03c550d385d7d1a4699357bd15c75dc66b1749a93246683461c584b79537c95d`
- shared style.css: `6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27`
- shared common.js: `f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b`

Read the [official statement](https://leetcode.com/problems/guess-the-word/) through normal web access: unique six-letter lowercase words; n=1..100; secret in words; exact positional reply, illegal guesses −1; 10..30 calls; must actually guess the secret. The generated-case qualification is accurately described. Direct Chromium navigation encountered Cloudflare security verification; no bypass was attempted. The normally accessible statement supplied independent statement/constraint evidence. The lesson-local saved `tests/evidence/official-graphql.json` and `official-verification.md` contain the Python3 selector stub: `Solution.findSecretWord(self, words: List[str], master: 'Master') -> None`, with judge-supplied `Master.guess(word: str) -> int`. That stub matches canonical code. This saved interface capture is author evidence, distinguished from my independent statement read. No non-Python contract or conceptual substitution is involved; the additional non-Python selector audit is inapplicable.

Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python requires `solution.py`, `python-code.js`, export `PYTHON_SOURCE`. These are the actual files audited. No earlier review report for 843 was found after the cold walk, so there are no earlier finding IDs to close.

### Independent predictions, transitions and correctness

The recorded singleton UI prediction passed: zero calls/one candidate initially; one actual call aaaaaa→6, ledger 1→1, next/end disabled; back restored zero calls; end reproduced the successful frame.

Executed the actual canonical `solution.py` with an independent judge on the fresh list [abcdef, abcdeg, abzzzz]. The exact predicted call sequence occurred: [(abcdef,5),(abcdeg,6)], return None, input list unchanged. Independently calculated scores [6,5,2]. Exact-equality survivors for reply 5 were [abcdeg]; the tempting ≥5 rule incorrectly also retained abcdef. Independently checked abcdef/fedcba=0. These are **code checks**, not invented custom-input browser experiments.

An additional independently written browser oracle (no import of core.js, no use of its trace/formatter) recomputed every candidate partition and tie selection from raw words. It compared all seven bucket counts and the chosen probe before each call. All 13 rendered calls across all five presets agreed:

| Preset / secret | Independently checked complete calls |
|---|---|
| Four words / eiowzz | acckzz→2, eiowzz→6 |
| Two words / khaled | hamada→0, khaled→6 |
| One word / aaaaaa | aaaaaa→6 |
| Six disjoint / ffffff | aaaaaa→0, bbbbbb→0, cccccc→0, dddddd→0, eeeeee→0, ffffff→6 |
| Bucket ties / aabbbb | aaaaaa→2, aabbbb→6 |

The maintained invariant is exact agreement with **all** history. Each new filter starts from prior survivors; equality cannot delete the truthful secret and inequality proves inconsistency. In the four-word intermediate frame, all readouts agree: one completed call, singleton eiowzz, previous guess acckzz used, eiowzz chosen with worst unsuccessful bucket 0, ledger 4→1. Final frame retains that singleton, records two calls and reply 6, and removes the next-probe table. Candidate identity and values refer to the same frame. A failed call excludes its own probe; an unused candidate remains available, giving a worst-bucket bound of c−1. Thus strict progress and an uncapped n-call bound follow; a universal ten-call bound does not.

The 26 repeated-letter stress case stopped after ten unsuccessful calls as advertised. This checks the expressly stated heuristic limitation, not an assertion of success on arbitrary lists. No successful online submission is claimed.

### Visual-to-code mapping and costs

Actual source precomputes matches[i][j] using equal-index zip pairs; the four-word first frame's score 2 is matches[0][2]. Current candidate indices initially [0,1,2,3]; the equality comprehension after reply 2 produces [2], whose chip is eiowzz. For the next choice, the eiowzz probe has no score-0..5 candidates, so max(buckets)=0; tuple ordering selects it. The final reply 6 returns before another filtering pass. The visual's seven reply columns include success, while Python deliberately allocates six **unsuccessful** buckets and guards score<6. Those representations agree, rather than being an off-by-one defect.

Precomputation performs n² comparisons of L=6 positions and allocates n² scores. Each round scans n probes and at most n candidates; linear membership `probe not in candidates` per probe adds O(n²), already within the stated bound. Candidates, used, buckets and keys add O(n) or constant storage beyond the matrix. Therefore O(n²L+Gn²) time and O(n²) auxiliary space are valid, including n=1 and early success. No mutation of words occurs. The displayed baseline loops over the existing input and uses constant extra space, up to n judge calls; it really fails the budget for the 26-word last-secret example. Browser snapshot storage is expressly separate from submission memory.

### Tests inspected before execution

Read test_solution.py, test_core.cjs, browser.cjs and focused.cjs before running any of them. The Python/core/browser/focused runners support OUTPUT_DIR; all generated output was redirected to this run's exclusive evidence directory. Build scripts were not run. Author assets/evidence were not regenerated. The rerun JSON retains the harness's literal “author self-check” labels; these are independently rerun author tests, not an invented second reviewer or comprehension study.

Commands from repository root:

```sh
OUTPUT_DIR="$PWD/specs/reviews/843-evidence/843-review-1-7f018940" python3 -B leetcode/843/tests/test_solution.py
OUTPUT_DIR="$PWD/specs/reviews/843-evidence/843-review-1-7f018940" node leetcode/843/tests/test_core.cjs
OUTPUT_DIR="$PWD/specs/reviews/843-evidence/843-review-1-7f018940" node leetcode/843/tests/browser.cjs
OUTPUT_DIR="$PWD/specs/reviews/843-evidence/843-review-1-7f018940" node leetcode/843/tests/focused.cjs
python3 -B scripts/register_leetcode_lesson.py 843 --validate-only
```

All exited 0. Preflight was silent on success, was run twice, and made no candidate changes. `lesson-entry.json` complexity is exactly the single nonempty string `O(n²L + Gn²) time; O(n²) auxiliary space, L=6 and G≤10`.

Computational harness observations: 1,211 canonical Python cases, including every secret in every nonempty subset of an eight-word pool, official examples, n=100 samples and budget stress; 3,068 core frames with exact history consistency and independently recomputed buckets. These support runtime checks, not the teaching scores by themselves. Separate fresh predictions and the independent rendered oracle above supplied additional reviewer-selected checks.

### Interaction, localization, source transfer and accessibility

Chromium 156.0.8078.4 on Linux, executable selected through PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set. No page errors, missing assets or external runtime requests were observed in the browser suite. Offline file opening and denied-localStorage initialization also worked.

Both locales: checked initial/middle/final states, every preset, back/forward replay, reset/end, disabled endpoints, show/hide comparison, all three prediction options, explanation invalidation after changing choice, prediction reset, and locale switches after reveal. Changing the scenario resets that experiment while preserving the independent prediction, exactly as its adjacent text promises. Rendered formula in each locale contains complete `C_new`, `C_old`, `match(guess,w)=reply` and max over B₀..B₅; hand scores agree. Chinese explanation retains the positional rather than letter-set distinction, exact equality rather than ≥, actual terminal call, invariant, tie rules, unsuccessful buckets, progress/ten-call distinction, and code costs. No materially different translation was found. Duplicate-key detection covered all 80 COPY keys before parsing, and every consumed value was a two-string locale pair; semantic feedback/state binding was also checked visibly, not inferred from keys.

Added explicit full H1/document-title checks through zh→en→zh at 320, 390 and 1280 widths, with an intermediate round and revealed prediction retained. Exact H1s: `#843 · 猜猜这个单词` / `#843 · Guess the Word`; exact document titles: `#843 猜猜这个单词` / `#843 Guess the Word`. Source remains code in Python in either locale, with translated surrounding explanations.

Exact source parity passed without trimming: canonical UTF-8 source equals decoded mirror/export, rendered `textContent`, downloaded bytes and successful clipboard text, including final newline. Each locale's manual fallback attempt first wrote and read back its own distinct non-source sentinel, then disabled automatic clipboard writes, invoked the actual Copy control, confirmed textarea focus/full selection, pressed Linux **Control+C**, and read back the exact full source through the native clipboard. The clipboard was not test-seeded with source. Both transfers passed.

Widths 320/390/desktop were exercised in both languages; screenshots were captured and inspected, including ordinary and dense intermediate states, terminal disabled controls, top/title, prediction, selected preset and horizontally scrolled table. CSS font stack is PingFang SC, Microsoft YaHei, system-ui, sans-serif; exact installed glyph fallback was not independently identified. At 320 the long four-word selected label remains complete in the closed control in both locales. Candidate chips remain whole at normal zoom. The table intentionally has a 600px minimum width, with a nearby scroll instruction. Its left and right portions remain associated through column headings. Keyboard focus and ArrowRight scrolling were independently exercised (scrollLeft 0→40); Enter advances, Tab reaches reset, and focus outline is visible, including forced colors. Touch-target checks passed at 390px.

At 200% **CSS zoom** in real Chromium (320/390/1440 viewports), no page-wide overflow was reported. Desktop remains clear; 320px readouts break long English words across lines and require extensive vertical scrolling. This is visible friction, not lost or contradictory state; words/counts remain accessible through scrolling. It is the reason for the bilingual/device score of 3. Browser-chrome zoom and physical mobile devices were not exercised; CSS zoom is the recorded approximation, not a claim about every zoom implementation.

Disabled controls use readable muted text rather than reduced opacity. Measured ordinary body contrast 16.087:1, hint 7.744:1, disabled previous button 7.079:1, active table cells 12.298:1; focus against panel 8.937:1. Before relying on these numbers, extracted and exercised the **actual** lum/ratio helper used by browser.cjs: black 0, white 1, primary red/green/blue .2126/.7152/.0722, black/white 21, and #747474 on black 4.492948073111701 (<4.5). Coefficients/calibration passed. Solid and composited panel colors are covered; this is not a claim of exhaustive perceptual accessibility testing.

Both related links resolve in the served collection: `../4/#step2` discusses preserving a valid binary-search cut while excluding a wrong direction; `../37/#step2` discusses sets matching the board and retaining consistent candidates during backtracking. These support their labels. The bilingual labels were read; this is local navigation evidence, not publication verification.

### Inspected screenshot evidence

All paths below are relative to `specs/reviews/843-evidence/843-review-1-7f018940/`:

- Cold full pages: cold-count.png, cold-round2.png.
- Dense state: en-320-trace.png, zh-390-trace.png.
- 200% approximation: en-320-zoom200.png, en-390-zoom200.png, zh-1440-zoom200.png.
- Identity/closed select: en-390-top.png, zh-390-top.png, zh-320-identity.png, en-320-select.png, zh-320-select.png.
- Right table/terminal/prediction: en-table-right.png, zh-terminal.png, zh-prediction.png, en-320-table-right-settled.png, zh-320-table-right-settled.png.

Additional suite captures and JSON results remain in the same exclusive directory. No earlier evidence was changed.

## Findings and score rationale

No required finding was reproduced. Required open IDs: **none**. No earlier finding was closed by inference.

Non-required observation `843-R1-A01` (minor usability friction; open advisory): at EN/320px/CSS zoom 2, select preset 3, advance once, scroll to frameRead. Expected: accessible state with manageable line flow. Actual: all state remains available, but narrow padding forces fragments such as “complet / ed” and “candidat / es”; see en-320-zoom200.png. This affects polish/reading effort, not correctness or essential access. Suggested owner action: consider reducing nested padding at extreme zoom; no candidate repair was performed or required for this review.

| Dimension | Score /4 | Weight | Observation supporting score |
|---|---:|---:|---|
| Problem, terms, hand calculation | 4 | 15 | Six explicit positional columns, hand-computed reply 3, legal inputs/interface and actual-success semantics explained. |
| Causal derivation and saved work | 4 | 20 | Baseline call cost, equality counterexample, concrete competing bucket sizes, minimax bridge and honest ten-call limitation are reconstructable. |
| Maintained state and correctness | 4 | 20 | History-consistency invariant, inclusion/exclusion proof, strict progress, singleton success and full intermediate/endpoint checks agree. |
| Interaction and visual meaning | 4 | 20 | Recorded singleton prediction verified; table, chips and ledger have distinct meanings; replay, reveal/change and locale retention pass. |
| Python/cost | 4 | 15 | Actual faithful source executed on independently chosen input; explicit table-to-index mapping, parity/native copy, mutation and actual loop/space costs checked. |
| Bilingual/device | 3 | 10 | Equivalent reasoning and keyboard access at narrow/desktop widths; extreme CSS zoom introduces visible reading friction, with no essential loss. |

Weighted total: **97.5/100**. Every dimension is at least 3; no required finding remains.

## Conclusion and limits

**Accepted** for this frozen candidate and local independent-review scope. This is separate from publication. Evidence establishes the observed explanation, interactions, executable behavior and source fidelity; it does not establish real human comprehension, a successful LeetCode submission, or universal ten-call success. Official direct-browser security verification, author-origin saved selector evidence, CSS rather than browser-chrome zoom, and lack of physical-device testing are explicitly bounded above. Candidate implementation, tests, shared files, services and prior evidence were not modified.
