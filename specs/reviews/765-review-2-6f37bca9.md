# Independent review: 765 — Couples Holding Hands

Candidate requested: `8d44249808b43d9d56ad26592d276443a9994649`.
URL: http://127.0.0.1:18770/leetcode/765/ . Review date: 2026-10-25.
Target: basic Python, lists, loops, functions, elementary recursion. Reviewer: this independent review run; no named human/model identity asserted.
Frozen scoring interpretation: six dimensions weighted 15/20/20/20/15/10, 0–4 each; faithful official Python preferred. Acceptance needs ≥85, all ≥3, no required open findings and complete evidence.

## Cold walkthrough (saved before repository source, tests, author notes or previous reviews)

Only the frozen rubric was read before opening the candidate in Chromium through Playwright. Initial desktop screenshot: `765-evidence/765-review-2-6f37bca9/cold-desktop.png` (captured and inspected). The page is a five-section document with preset-only simulation.

| Step and question | Action / prediction before reveal | Observed result | My causal reconstruction |
| --- | --- | --- | --- |
| 1: What can one swap change? | Read person IDs versus seat indices, arbitrary swaps, fixed seat blocks. Predicted swapping seats 1 and 2 of [0,2,1,3] gives [0,1,2,3], answer 1. Clicked swap then undo. | Both blocks become fixed; text explicitly excludes zero and attains one. Undo restores initial values. | The task returns an integer minimum, not a sorted row; ID partners differ in the low bit. One physical swap can repair two blocks. |
| 2: What work does direct search repeat? | Read baseline and worked four-block wrong-rule example; manually followed 1↔7, 3↔7, 5↔7. | Baseline scans for each missing partner; row values after each exchange are explicitly printed. Four bad blocks require three repairs, not ceil(4/2). | Retaining the left person already gives a valid construction. Replacing repeated linear searches by current seat records saves the repeated work; counting bad blocks only supplies a weak bound. |
| 3: Why does each repair preserve earlier work? | Predicted first decision gives map[1]=1,map[2]=2 and count 1, then second decision skips. Operated next twice, previous once. Selected counterexample, predicted three repairs then skip, processed all four decisions. | First example shows exact before/after values, map, one history item; second decision retains values and adds a skip. Rewind restores one history item and count 1. Counterexample produces [0,1,3,4,5,6,7,2], [0,1,3,2,5,6,7,4], [0,1,3,2,5,4,7,6], then skips; counts 1,2,3,3. | Fixed means processed prefix, not every accidentally paired block. Unique partners exclude the prefix from future exchanges. Both moved persons need map updates. Frames represent complete decisions, not partial assignments. |
| 4: Why is the construction minimum? | Read graph definitions; independently predicted exercise [4,1,2,7,0,5,6,3] has edges 2–0,1–3,0–2,3–1, two components, answer 2. Selected C then revealed. | Correct feedback prints those edges and two cycles, 4−2=2, with swaps 1↔5 and 3↔7. Live proof reports remaining rather than cumulative minimum. | Each swap increases cycle count by at most one, while each actual greedy repair isolates a loop, increasing it by one. This attains the necessary n−c bound. Terms are defined but the endpoint argument is relatively dense prose. |
| 5: Which Python lines implement the repair? | Opened the visible official-interface disclosure and matched first repair to i=0, partner=1,j=2,displaced=2. | Displayed class Solution/minSwapsCouples, tuple swap, both map assignments and integer return. Copy/download controls present. | Array pos is indexed by person, row by seat; constant lookup replaces index search. Code mutates the supplied list; construction and n decisions use O(n) time/space. Snapshot rewind space is separately labeled O(n²). |

Fresh independently chosen input, prediction recorded now before execution: `[1,2,0,3,5,4]` should need 1 swap, producing `[1,0,2,3,5,4]`; later two blocks skip. Fresh wrong-rule counterexample: `[1,0,3,2]` needs 0 despite being unsorted, refuting “sort IDs to determine swaps.” These are **code checks**, since the UI accepts presets only. Independent manual checks: partners are (1,0),(2,3),(5,4); exchange seats 1 and 2 fixes both first blocks. Every pair of the counterexample is already a couple. The author's separate four-bad-block counterexample was also exercised above, not presented as independently selected.

Cold evidence also captured `cold-counter-end.png`; no source or prior-review explanation supplied missing teaching in this walkthrough.

## Candidate, official contract and metadata audit

After saving the cold walkthrough, read the rendered-state supplement, canonical source, renderer, translation dictionary/consumer, styles, tests and earlier review/repair records. `git rev-parse HEAD` equals the requested revision. Independently fetched seven lesson assets plus shared `common.js`/`style.css`; all served bytes equal the checkout. Hashes are retained in `independent-code.json`; canonical Python SHA-256 is `c359058093535eb91b174ca647cc7f607564e11672dcd63951fc93654968ddb7`. Final working-tree status contains only this run's report and exclusive evidence directory.

Read the [official statement](https://leetcode.com/problems/couples-holding-hands/) normally through the web tool. It confirms arbitrary-person swaps, integer minimum, both examples, unique IDs, length 2n and 2 ≤ n ≤ 30. No access bypass occurred. Lesson-local `provenance/official.json` records the Python3 stub `Solution.minSwapsCouples(self, row: list[int]) -> int` and integer-array/integer-return schema. Canonical source preserves that callable and semantics, with mutation explicitly disclosed. Python is faithful; non-Python language-contract/supportedLanguages verification is inapplicable. `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py` names `solution.py`, `python-code.js`, `PYTHON_SOURCE`, exactly matching the implementation and source export.

**Required preflight:** from repository root ran `python3 -B scripts/register_leetcode_lesson.py 765 --validate-only`. Exit **0**, no stdout. Complexity is exactly the single nonempty string `O(n) time; O(n) auxiliary space, where n is the number of couples`. No registration, repair or candidate-asset regeneration was performed.

## Independent execution and correctness

Executed actual canonical Python through `exec`, independently of the browser trace. A separately written shortest-path BFS explored every pair of seats until reaching any arrangement with paired blocks; it supplied the small-case oracle.

| Input | Pre-recorded prediction / BFS / canonical result | Canonical row after call |
| --- | --- | --- |
| Fresh `[1,2,0,3,5,4]` | 1 / 1 / 1 | `[1,0,2,3,5,4]` |
| Fresh unsorted counterexample `[1,0,3,2]` | 0 / 0 / 0 | unchanged |
| Additional boundary `[3,1,2,0]` | 1 / 1 / 1 | `[3,2,1,0]` |
| Exercise `[4,1,2,7,0,5,6,3]` | 2 / 2 / 2 | `[4,5,2,3,0,1,6,7]` |

These custom inputs were **code checks**, not UI experiments. At the maximum legal 30 couples, identity returns 0; `[0,2,3,…,59,1]` returns 29 and produces valid paired blocks. The exercise's proposed swaps 1↔5 and 3↔7 independently produce a valid arrangement in two swaps. Invalid permutations and empty input are outside the official domain, as the page states.

The invariant is reconstructable at assignment level: pos starts as the inverse permutation; the prefix contains complete couples; a missing partner cannot already be in that prefix. The swap therefore touches only unprocessed seats. Tuple assignment exchanges the two values, and both pos writes restore the inverse relation. Skips retain state while extending the fixed prefix. Each decision processes one block, giving termination with every block paired. Feasibility alone is not used as proof of optimality: the separate cycle argument bounds component increase by one and shows greedy attains that increase on each actual exchange.

The visible first transition maps directly to `partner=row[0]^1=1`, `j=pos[1]=2`, `displaced=2`, the tuple assignment, `pos[1]=1`, `pos[2]=2`, and incrementing swaps. The four-block trace independently checked above has cumulative swaps 0,1,2,3,3 and remaining minimum 3,2,1,0,0. The last frame is a skip; zero remaining swaps can precede the final processed block. Before panels are previous values and after panels are completed-decision values, not two inconsistent instants.

Cost audit: baseline makes a linear copy and up to n linear `.index` searches, so O(n²) worst-case time/O(n) extra space. Canonical pos allocates 2n cells; initialization and n constant-cost decisions give O(n) time/O(n) space. Tuple exchange uses constant temporary storage. Calling with row.copy() adds linear copy cost. O(n) simulation frames each retaining O(n) arrays give the separately disclosed O(n²) history space. No submission/runtime performance claim is inferred from the small constraints.

## Inspected tests and observed browser checks

Read test implementations before running them. All generated outputs were redirected using `OUTPUT_DIR="$PWD/specs/reviews/765-evidence/765-review-2-6f37bca9"`; no tracked author evidence was regenerated. Commands, all exit **0**:

- `python3 -B leetcode/765/tests/test_solution.py`: actual Python and baseline checked against independent multi-source all-swap BFS over 41,064 permutations (4/6/8 people), plus 1,000 seeded larger cases against DSU counts and explicit maximum boundaries. Mutation/permutation/pair postconditions passed.
- `node leetcode/765/tests/test_core.cjs`: 224 BFS fixtures; each frame's inverse map, fixed prefix, retained prefix, before/after continuity, swap increment and component potential passed. Canonical/mirror exact. AST checks found 87 unique bilingual dictionary keys, each with two strings, before evaluation could discard duplicates.
- `node leetcode/765/tests/test_browser.cjs`: “Browser checks passed.”
- `node leetcode/765/tests/test_margin.cjs`: 30 preset/locale/width checks passed with the original 24px arrow allowance.
- `node leetcode/765/tests/test_rendered_contract.cjs`: both locales passed the independently specified four-couple trace, rendered formula/counts and prediction-scope/replay assertions.

Browser: Linux Chromium **156.0.8078.4**, Playwright via NODE_PATH and `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. All five presets were processed to expected minima **1,0,2,3,2** in both languages. Every decision was rewound/replayed with complete readout comparison. Reset, preset restart and end buttons work; endpoint controls disable correctly. Hand swap and undo are independently reversible. History grows by decisions including skips, and rewinding restores the prior history rather than leaving future entries.

Prediction checks exercised every answer, correct and incorrect feedback, reveal/clear, and answer changes after reveal. A changed answer hides the old reasoning; reveal is disabled until an answer is selected. Preset changes preserve the explicitly independent exercise; this is correct scope, not stale simulation feedback. Locale changes retain answer, reveal state, preset, simulation row/count/map/history and open source disclosure.

For an independent dense-state follow-up, processed the counterexample to 2/4 at 320/390/1440 in both locales. Both show row `[0,1,3,2,5,6,7,4]`, map `2→3,4→7`, count 2, groups `{0} {1} {2,3}` and remaining `n−c=1`. Chinese operation says “交换座位 3↔7，把人 4 移到 7；pos[2]=3，pos[4]=7。本次 +1 次交换”, agreeing with English and the actual before/after values. This verifies algorithm meaning separately from clipboard messages. Initial, swap, skip and final bindings are consistent with their frames. Shared consumer uses `[zh,en]` pairs and interpolates full operands; visible n−c formulas retain both operands after locale switches.

Fixed/Pending denotes processing status, not whether a later pair happens already to be a couple. Green plus text marks retained prefix; orange plus “just processed” marks the current completed decision. Seat indices, person values and map directions remain distinct. The bilingual explanations agree on arbitrary swaps, partner XOR, both map updates, the lower bound, mutation and all three cost scopes.

**Exact source transfer:** decoded mirror, embedded source, displayed code `textContent`, successful clipboard readback and downloaded bytes equal canonical `solution.py` exactly, including final newline. For denied automatic copy, seeded a distinct non-source clipboard sentinel, verified fallback focus/full selection, used actual **Control+C** on the Linux browser host, then read back the canonical string exactly. Both locales passed. No test-written source was substituted for native fallback copying. File-URL offline rendering also matches canonical source.

Keyboard Enter activates next/previous and each step anchor with visible 3px focus outline; anchors expose their destinations. Related links resolve and the #41 target explains placement at x−1 in both languages. No lesson page errors were recorded. The ancillary #41 route's favicon-only 404 is separately scoped in browser results. Denied storage, reduced motion and forced colors still allow locale switching and processing.

## Layout, contrast and inspected screenshots

Exercised 320/390/736/1440 CSS-pixel layouts in both locales; no page-wide overflow. At 320 blocks stack, while 390 uses two columns; captions/values/status/map retain their association. Dense history wraps. Sticky navigation scrolls horizontally and remains keyboard usable. Scrolled captures can begin beneath a sticky bar; the inspected settled state shows no actual text intersection or clipped state label/value. Native 200% browser zoom was verified with `chrome.tabs.getZoom=2`, DPR 2 and innerWidth 720 for a 1440 window; this was not merely CSS scaling.

Inspected this run's `cold-desktop.png`, `trace-320-en.png`, `trace-390-zh.png`, `middle-320-en.png`, `middle-390-zh.png`, `header-320-zh.png`, `quiz-320-zh.png` and `zoom200-en.png`. They show distinct seat/person labels, preserved prefix, readable dense map/history, localized identity, prediction explanation and disabled text. Other generated screenshots remain available but are not all claimed manually inspected.

The closed counterexample label at 320 measures **195.6164px** by canvas / **195.625px** DOM on Linux, within **206px** available after 15px padding each side and the unchanged 24px native-arrow allowance in a 260px control. Chinese measures **73.9201px**. All five presets passed at 320/390/1440 in both locales after roundtrip. Font stack is `"PingFang SC", "Microsoft YaHei", system-ui, sans-serif`; this does not identify the exact resolved font.

Inspected contrast helper uses 0.2126/0.7152/0.0722 coefficients and calibrates black/white=21, RGB primaries and #747474 on black≈4.492948 (correctly below 4.5). Recorded solid text/background pairs exceed 4.5. Disabled text #9aa7b8 on #1c2330 has ratio **6.4494**, opacity 1 and a dashed border; computed colors match CSS. Tested controls have 48px minimum height. This is evidence for the observed solid palette, not a complete assistive-technology audit.

## Earlier findings and explicit closure

Earlier review `765-review-1-c03e66cb.md` accepted `7ec592bddf5642212cdcb3363510982354da780e` with optional **765-A1** (graph proof is dense; an illustrated edge split could help). This run independently observed the same minor friction. **765-A1 remains open advisory**, low severity, author may improve in a future revision; no required causal bridge is missing.

**765-MAC-MARGIN-01 — required, now closed for this candidate.** Original reproduction: old accepted candidate, English preset 3, 320px native Mac Chromium; unchanged browser test's 24px-reserve fit assertion fails with about 209.44px text versus 206px budget. Expected: full concise identity fits the original budget; actual historical failure was conservative margin, not proven visible clipping. Requirement: readable native selected labels and affected-host regression evidence. Owner/action: author adopted `8 people: counterexample`, retaining eight-person/counterexample meaning without font/layout/assertion weakening.

Closure evidence: saved `specs/reviews/765-evidence/mac-repaired-candidate-20261025/` records native **darwin Chromium 151.0.7922.34**, repaired revision `3193aec4bdbbb13e094664e0de79cac6039f538a`, and successful unchanged full `node leetcode/765/tests/test_browser.cjs`, plus preflight/Python/core/margin/rendered-contract checks (all exit 0). Its original-test identity receipt hashes the unchanged browser test as `addc2e5f5c8f97a2fd31bcdd854caaf425dbf745f4e014ca0af877c777fb0e48`. Candidate parity records 219 unchanged files and no additions during that run. Independently matched all **21** relevant lesson/test/shared files in its hash receipt to this candidate; `git diff 3193aec… HEAD -- leetcode/765 leetcode/common.js leetcode/style.css` is empty. This binds the native Mac regression to actual current content, without pretending this run owns a Mac browser.

Mac margin evidence records counterexample label **200.01598px** (DOM **200.03125px**) versus **206px** budget at 320, both locale roundtrip and all-preset coverage passing. Inspected its existing `765/select-320-en-3.png`: complete label and arrow visible; inspected `765/zoom200-zh.png`: state labels/values remain readable. Current Linux full-suite, all-preset margin and dense-state checks independently pass. Therefore the specified host regression and unchanged-suite condition are met; no earlier evidence was altered. New `mac-closure-receipt.json` records current hash matching. Closure is a reviewer assessment of saved native-host evidence plus actual candidate parity, not a new native Mac execution claim.

## Scores and conclusion

| Dimension | Weight | Score | Observation/rationale |
| --- | --- | --- | --- |
| Problem/terms/hand calculation | 15 | 4 | Clear input/output, seats versus people, domain, unsorted valid example, and tiny one-swap necessity/sufficiency before abstraction. |
| Causal derivation/saved work | 20 | 3 | Baseline repeated work, lookup bridge and bad-block counterexample explicit; complete cycle bound is reconstructable but dense prose for the target reader (765-A1). |
| Maintained state/correctness | 20 | 4 | Prefix/inverse-map invariant, exclusion of fixed seats, both updates, boundaries, termination and separate optimality checked against concrete states and execution. |
| Interaction/visual meaning | 20 | 4 | Completed-decision before/after meaning, real retained history, correct cumulative/remaining scopes, reversible controls and transfer prediction all observed. |
| Python/cost | 15 | 4 | Faithful canonical executable, fresh independent BFS checks, mutation and actual costs explained; exact source transfer including native fallback verified. |
| Bilingual/device | 10 | 4 | Equivalent state/proof/feedback; preserved state, narrow/desktop/native zoom, keyboard, contrast, disabled readability and affected Mac regression assessed. |

Weighted total **95/100**. Every dimension ≥3. **Required open IDs: none.**

**Accepted** for revision `8d44249808b43d9d56ad26592d276443a9994649`, separate from publication. No measured human comprehension, successful LeetCode submission or deployment is claimed. New browser execution is Linux Chromium only; Mac closure relies on explicitly identified saved evidence with verified candidate parity. Other browser engines, untested host fonts and screen readers remain outside this review. Only the authorized report and exclusive evidence directory were written.
