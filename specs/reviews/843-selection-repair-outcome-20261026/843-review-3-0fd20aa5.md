# Independent review: 843 — Guess the Word

Candidate: `1997af1228f21cd85a3c7506928dc2587a0a7a9f`. URL: http://127.0.0.1:18770/leetcode/843/. Date: 2026-10-26. Reviewer: this independent review run; exact model identifier unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen rubric: `specs/leetcode-review-gates.md`; weights 15/20/20/20/15/10. Canonical interpretation frozen before opening: prefer faithful Python, otherwise verify original language contract. No submission or human comprehension claim.

## Cold browser walkthrough — saved before source, tests, contract, or earlier reviews

Read only the frozen rubric, then opened the URL in real Playwright Chromium at 1280×900. This section records the initial browser observations, not author evidence. The browser only offers presets, so the independently chosen input below will be a **code check**, not a UI experiment.

1. **Count: what does the reply count?** Before reveal I predicted `acckzz` versus `ccbazz` gives 3. Clicked “Show / hide position comparison.” Six fixed columns appeared, with ✓ at positions 2, 5, 6 and × elsewhere; visible reply 3. My causal paraphrase: equality must hold in the same column; letter membership alone is insufficient. The page supplies `abcdef` / `fedcba` scoring 0 as a small wrong-rule counterexample. The input is unique lowercase six-letter words, secret in list, and the required action is an actual successful Master call, not returning a deduced word.
2. **Eliminate: why equality rather than at least the reply?** Read the four explicit scores `[3,6,2,2]` for probe `ccbazz` and reply 3, and manually checked them. Only `acckzz` survives. The guess itself cannot survive: it would produce 6. This is a static worked step, with no separate filter control here. My causal paraphrase: retain exactly those possible secrets that reproduce every observed reply; a larger score is still contradictory. The baseline may use n calls, exceeding a small allowance; offline scoring does not spend calls.
3. **Choose: what will the next guess leave?** Before operating, predicted the initial selected `acckzz` against preset secret `eiowzz` would reply 2 and leave only `eiowzz`. Initial table showed its four singleton buckets (2,3,4,6), worst 1; `ccbazz` worst 2. Clicked “Guess and filter one round”: count became 1, candidates became `eiowzz`, and ledger showed `acckzz → 2; 4 → 1`. New table chose `eiowzz`, worst 0, and marked prior probe Used. The visible warning explicitly said another call was necessary. Clicked again: count 2, ledger retained both rounds, and success appeared only with reply 6. “Back one round” restored count 1, singleton and unfinished status. My paraphrase: smallest largest failure bucket limits the next worst remaining set; reply 6 is success rather than a continuing bucket. History represents completed calls; comparison table is the next call's state. The text proves strict shrinking via the available candidate guess, but explicitly does not prove compliance with every budget.
4. **Predict: transfer to different words.** Before reveal predicted probe `aaaabb`, reply 4 keeps `aaaaaa` and `aabbbb`; scores manually `[4,6,4,2]`. Selected that answer and clicked “Check and explain.” Observed “Correct,” these exact scores, both survivors and the reason self-score 6 contradicts 4. This checks filtering rather than just copying the earlier word. The tempting “at least 4” rule would incorrectly retain `aaaabb`.
5. **Implement: how does this become Python?** Opened the rendered “View Python submission source.” The explanation links word indices to the score matrix, buckets, tuple tie rule and equality comprehension. My mapping: the first round's visible `4 → 1` corresponds to `candidates = [i for i in candidates if matches[probe][i] == reply]`; only index 2 has cached score 2 for probe index 0. `master.guess` alone spends a call; matrix construction does not. The source continues with a singleton, returning only at reply 6. The page states O(n²L + Gn²) time and O(n²) auxiliary space, G≤n, and distinguishes this from a budget guarantee. Tuple ordering, matrix construction and comprehensions introduce some Python syntax beyond the declared target, but prose explains their roles.

**Independently chosen check, prediction fixed before source audit:** words `[aaaaaa, aaaaba, bbbbaa]`, secret `bbbbaa`. Predicted score row for first probe `[6,5,2]`, all probes worst 1 and index tie picks `aaaaaa`; reply 2 retains only `bbbbaa`, then an actual second call scores 6. Also predict no mutation of the input list. Independent counterexample: `abcdef` / `badcfe` share all letters but have zero positional matches; a shared-letter rule would wrongly score six. Additional equality counterexample: reply 5 to `aaaaaa` in the fresh list must retain only `aaaaba`, excluding the self-score 6.

Cold screenshot: `843-evidence/843-review-3-0fd20aa5/cold-round1.png` (captured after round 1). Source audit and further evidence follow below; this cold record was saved first.

## Post-cold audit: identity and official contract

HEAD equals the requested candidate. `git diff --exit-code` exited 0; `git status --short` showed only this report and this run's exclusive evidence directory. Independently fetched all nine lesson/shared runtime and source assets from the preview and compared their bytes with the checkout. Full hashes are in `independent-code.json`. Identity anchors:

- index.html: `2dd447c803f8ee243df54ae0221267a4ca0e95afa0825a7e12d1a3dccedce2c7`
- app.js: `aab7eb9dcdb24a55a0d1c265bccb59fc97b5c21236455ece987378dbab07526e`
- style.css: `82daf852ce99603d981dc6be831d1567a659d4a23c15f1f3d290c178acb9b89a`
- solution.py: `51f9e29c91ca3ffe6238f13dfa0f0b632081274be4747ac67cfbf627b986dc05`
- python-code.js: `3d3287def904402b4390f999cf8b67e49e28b086c64cab63410059b80aa663b2`

After saving the cold record, read the rendered-state contract, canonical source, baseline, core, renderer, localization, CSS, relevant tests, and earlier 843 reviews. Read the [official statement](https://leetcode.com/problems/guess-the-word/) through normal web access, without bypass. Its exact-position semantics, actual successful call requirement, list membership, uniqueness, six lowercase letters, n=1..100, and 10..30 allowed calls match the lesson. The generated-case qualification does not itself prove a universal budget guarantee for this particular heuristic; the lesson explicitly makes that distinction.

Inspected the actual Python3 snippet in saved lesson-local `tests/evidence/official-graphql.json`, and its accompanying verification note. It specifies `Solution.findSecretWord(self, words: List[str], master: 'Master') -> None`, with judge-supplied `Master.guess(word: str) -> int`. Canonical Python follows this callable: no secret or budget argument, no budget getter, no returned secret. Saved selector evidence is author-origin evidence; live statement access was independent. This is faithful Python, so the additional non-Python language-contract/supportedLanguages audit is inapplicable. There is no analogy advertised as an original submission. Read `LANGUAGE_FILES`: Python maps exactly to `solution.py`, `python-code.js`, `PYTHON_SOURCE`.

## Independent executable and visual checks

Executed the actual canonical Python with an independent fake Master on the pre-recorded fresh input `[aaaaaa, aaaaba, bbbbaa]`, secret `bbbbaa`. Observed exactly `aaaaaa → 2`, `bbbbaa → 6`, return None, and no input mutation. The first score row was `[6,5,2]`. Independently reconstructed the full-history-consistent candidates at each actual call and compared them with the submission's local index list. The equality counterexample also passed: reply 5 keeps only `aaaaba`, while the tempting >= rule incorrectly keeps `aaaaaa` too. `abcdef` / `badcfe` scored 0 despite sharing all letters. These are **code checks**, not custom-input UI experiments. Results: `independent-code.json`.

An independently written browser oracle used raw preset lists and its own positional comparison; it did not import core.js or use its formatter/trace as the expected answer. For all nine presets and all 56 completed calls, it enumerated all seven reply groups, computed the largest failure bucket, ranked unused probes by worst size/candidate membership/original order, and compared every rendered row and chosen probe before advancing. It checked candidate words and ledger counts after each call. All agreed. The first five complete call sequences were: four words `acckzz→2, eiowzz→6`; two words `hamada→0, khaled→6`; singleton `aaaaaa→6`; disjoint `aaaaaa…eeeeee→0, ffffff→6`; ties `aaaaaa→2, aabbbb→6`. The larger success scenarios required 10/11/12 actual calls, and the budget-10 negative control stopped unsuccessfully. Results: `independent-browser.json`.

The invariant is exact agreement with all previous replies. Filtering the already consistent set by a new equality preserves all earlier constraints; truthfulness keeps the secret; any unequal score contradicts the new reply. At a failure with c candidates, an unused candidate guess leaves at most c−1, so minimax cannot choose a larger worst failure group. Previously failed probes cannot remain candidates. A singleton has worst failure size zero and wins candidate preference, so an actual successful call follows. Thus G≤n and termination hold; G≤allowedGuesses does not follow. Illegal replies −1 cannot arise with this implementation's original-list probes. Dishonest replies are outside that invariant's premise.

The initial visual `4 → 1` corresponds to original indices `[0,1,2,3]`, probe 0, cached `matches[0][2]=2`, and the equality comprehension retaining `[2]`. The next table pairs `eiowzz` with worst 0 and chosen status; the old probe is explicitly Used. There is no candidate/value identity mismatch. The UI includes a seventh success column; Python counts only six failure buckets with `if score < 6`, correctly excluding successful completion from unresolved work. The simulator filters a final snapshot to the singleton on reply 6; Python returns immediately before another filter. That pedagogical final snapshot does not claim another executed Python filtering step.

The baseline loops through the original input until 6: at most n Master calls and O(1) auxiliary storage. Canonical precomputation stores n² scores and compares L=6 positions per pair. Each round scans n probes against at most n candidates. The linear candidate-membership test in the tuple key adds O(n²) per round, within the stated bound. Thus O(n²L+Gn²) time, worst O(n³+n²L), O(n²) auxiliary space are valid, including n=1. Candidate/used lists add O(n); words are unchanged. Browser history is separately disclosed teaching storage.

## Tests inspected and rerun safely

Read test_solution.py, test_budget.py, test_core.cjs, browser.cjs, budget_browser.cjs, focused.cjs and selection_browser.cjs before running them. Their result/screenshot writes use OUTPUT_DIR or explicit --output. Build scripts were not run. All results went inside this run's exclusive directory; the harness's literal “author self-check” labels describe the reused harness, not a second independent reviewer.

Commands from repository root (D below is `/home/songyy/projects/leetcode-hard-campaign-20261018/specs/reviews/843-evidence/843-review-3-0fd20aa5`):

```sh
python3 -B leetcode/843/tests/test_budget.py --output "$D/green.json"
OUTPUT_DIR="$D" python3 -B leetcode/843/tests/test_solution.py
OUTPUT_DIR="$D" node leetcode/843/tests/test_core.cjs
OUTPUT_DIR="$D" node leetcode/843/tests/browser.cjs
OUTPUT_DIR="$D" node leetcode/843/tests/selection_browser.cjs
OUTPUT_DIR="$D" node leetcode/843/tests/budget_browser.cjs
OUTPUT_DIR="$D" node leetcode/843/tests/focused.cjs
python3 -B scripts/register_leetcode_lesson.py 843 --validate-only
```

All exited 0. The exact preflight command above was silent and successful. Metadata complexity is exactly one nonempty string: `O(n²L + Gn²) time; O(n²) auxiliary space, L=6 and G≤n (worst-case O(n³+n²L) time)`. No registration or metadata repair occurred.

Canonical execution covered 1,211 cases, all secrets of all nonempty subsets of eight words, n=100 random samples, both official lists, singleton, zero replies, and the 26-call disjoint stress under budget 30. The budget spy verified all-secret actual successes for 20/22/24 words under budgets 10/11/30, with maxima 10/11/12; it checked legal nonrepeated guesses, exact minimax tie choice, history consistency, strict progress, no mutation and None return. Core checks covered 3,068 intermediate frames, exact mirror bytes, and 87 unique localization key pairs. Browser comparisons that reuse core expectations are supplemented by the independent raw-list oracle above. Neither counts nor screenshots alone determine teaching scores.

## Interaction, bilingual and device observations

Real Chromium 156.0.8078.4 on Linux through Playwright; executable selected using PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH and packages through NODE_PATH. Both languages exercised all presets, next/back/replay, reset/end, initial and disabled terminal endpoints. The budget browser checks (EN/ZH × 320/1440) observed ten completed calls with known-but-unguessed `bmmmmm`, then an enabled eleventh call returning 6; rewind/replay restored both states exactly. The budget-10 control showed exhausted/not successful with a singleton and disabled next/end. This is an explicitly infeasible control, not evidence that deductions satisfy the official call requirement.

All three prediction options were revealed in each locale. Changing the choice invalidated old feedback; reset cleared selection and disabled reveal. Changing the scenario reset rounds while preserving the separate prediction, as promised. Locale switches preserved candidate words, ledger, scenario, answer and revealed meaning. The independent zh→en→zh check at 320 verified exact H1 `#843 · 猜猜这个单词` / `#843 · Guess the Word` and document titles, retained singleton and complete formula. Both rendered formulas retain C_new/C_old, equality operands and max over B₀..B₅. Chinese explanation preserves positional matches, exclusion by inequality, history invariant, competing buckets, tie rules, actual final guess, budget caveat and cost meaning. No material translation mismatch was observed. Duplicate-key detection before parsing and pair-shape checks were supplemented by reading actual feedback/state paths.

Exact parity passed, without trim/normalization, for canonical UTF-8, decoded mirror, embedded export, displayed textContent, downloaded bytes, successful clipboard text, and manual fallback transfer, including final newline. Before **each** locale's fallback attempt the browser wrote/read a fresh distinct non-source sentinel. After disabling automatic writes, actual Copy focused and fully selected the source textarea; Linux Control+C replaced the sentinel with exact canonical text, verified by native clipboard readback. Both attempts passed. These tests did not put source into the clipboard directly.

Keyboard Enter advanced a round; Tab reached reset; the focused control had a visible 3px outline including forced colors. Independently focused the reply table and used ArrowRight: scrollLeft became 40. Its keyboard focus is distinct from chosen-row tint, and textual Used/Chosen next/Available labels carry state without relying on color. Focusable horizontal table scrolling is necessary at narrow widths and explicitly explained nearby. Touch-target checks passed at 390. Denied-localStorage initialization, offline loading, local links, missing-asset/page-error checks also passed.

Inspected captures at 320/390 and desktop, both locales, ordinary and CSS zoom 2, including dense intermediate tables and terminal disabled states. The selected-label repair exposes the entire option immediately below the native select via wrapping `#presetSelection`, associated with aria-describedby. At 320 the native English option still visibly clips, but the adjacent readout fully shows `22 words · infeasible budget-10 control`; at 390 and desktop it likewise preserves budget and purpose. At CSS zoom 2 the same full readout wraps across multiple lines without dropping text. The 36-case selected-label regression covers presets 6/8 × 320/390/1280 × zoom1/2 × zh→en→zh, with complete selection text, association, geometry and retained one-round state.

The narrow CSS zoom view still breaks English readout words into fragments such as “complet / ed” and “candidat / es”. All content remains reachable by scrolling; this is the earlier non-required reading-friction advisory, not a new correctness loss. CSS zoom 2 is the tested approximation to 200%; browser-chrome zoom and physical devices are unverified. CSS font stack is PingFang SC, Microsoft YaHei, system-ui, sans-serif; exact resolved installed glyph fonts were not identified.

Disabled controls use muted readable text with opacity 1. Extracted and exercised the **actual** browser test lum/ratio helper against black=0, white=1, RGB primaries=.2126/.7152/.0722, black/white=21, and #747474/black=4.492948073111701 (<4.5); calibration passed (`contrast-calibration.json`). Recorded contrast: body 16.087:1, hints 7.744:1, disabled previous 7.079:1, table cells 12.298:1, focus/panel 8.937:1. This covers recorded solid/composited colors rather than every perceptual condition.

Related rendered bilingual labels link to `../4/#step2` (binary-search exclusion) and `../37/#step2` (consistent Sudoku candidates). Followed both destinations and read their sections: valid-cut interval and excluded search direction; sets matching the board at recursive entry. These support the labels. Local availability is verified; publication is outside scope.

## Screenshot inspection record

All filenames here are inside `843-evidence/843-review-3-0fd20aa5/`:

- `cold-round1.png`: six-position hand explanation and four-to-one intermediate state, full page.
- `en-320-zoom1-preset8-4.png`, `en-390-zoom1-preset8-16.png`, `en-1280-zoom1-preset8-28.png`: native clipping versus complete adjacent scenario label at narrow/desktop widths.
- `zh-390-zoom1-preset6-12.png`, `en-320-zoom2-preset8-10.png`: Chinese complete selection and wrapped full English budget/control readout at zoom 2.
- `en-320-found11.png`, `zh-320-exhausted10.png`: actual success versus exhaustion, singleton, completed-call units, readable disabled controls and ledger.
- `en-1440-trace.png`, `independent-zh320-table.png`: chosen/used/available rows, candidate data and keyboard-focused horizontally scrolled comparison.
- `en-320-zoom200.png`: retained extreme narrow zoom reading friction.

Additional dense captures were made in both locales. Initial `en-320-dense-left.png` was captured during a scroll transition and does not establish settled table geometry; it is preserved, not used as a collision claim. Follow-up `*-dense-*-settled.png` captures use instant scrolling for inspection. No collision was inferred merely from overlapping boxes or an offscreen crop.

## Findings and earlier-finding closure

Earlier reports were opened only after saving the cold record. Prior outcomes do not set this candidate's score. Comparing runtime source from reviewed base `f6e2500dc87fe0a50a3258af80bf46d761ca1be8` to this candidate shows the selected-label readout, binding, wrapping style and cache-version changes; canonical Python/core/localization/shared assets retain the behavior independently checked here.

**843-R2-SELECT01 — closed against 1997af1228f21cd85a3c7506928dc2587a0a7a9f.** Original required medium finding: EN section 3, 320/390 normal size, selecting scenario 8 hid budget/control wording in the closed native select; scenario 6 hid part of the secret at 320. Expected: complete selected scenario, including budget/purpose, available beside the control. Current reproduction: load candidate, select EN/preset 8, close and inspect at 320, repeat at 390/1280 and zh→en→zh; repeat preset 6 and zoom2. Actual: native clipping remains, but full matching text is immediately adjacent and associated to the control, wrapping at zoom2. Owner's requested alternative of a complete wrapping adjacent readout is satisfied. Regression: all 36 selection checks passed against this exact candidate; inspected the narrow English, Chinese, desktop and zoom captures above. State and ledger remain unchanged across locale switches. Status: **closed**, no follow-up required for this finding.

**843-BUDGET-R1 — remains closed, independently rechecked on this candidate.** Original required defect was an artificial ten-call loop returning before a feasible eleventh successful call. Current canonical uses `while candidates`, all-secret exact-source family20/22/24 tests pass with real final calls, and known10/found11/exhausted10 browser regressions pass in both locales/narrow and desktop with rewind. No budget/secret access was added to the submission. Closure concerns that concrete truncation defect, not a universal budget guarantee.

**843-R1-A01 — open advisory, non-required.** EN/320/CSS zoom2, preset 3 after one call: readout words fragment across lines while state remains accessible. Evidence `en-320-zoom200.png`. Minor reading friction; owner may improve nested padding at extreme zoom. No fix revision or closure claimed. It accounts for the device score below.

Required open IDs: **none**. No new required defect was reproduced.

## Scores and conclusion

| Dimension | Weight | Score /4 | Observation-based rationale |
| --- | ---: | ---: | --- |
| Problem, terms, hand calculation | 15 | 4 | Concrete same-position columns and hand result precede abstraction; legal input and actual-call output are explicit. |
| Causal derivation and saved work | 20 | 4 | Baseline call expense, equality counterexample, competing bucket sizes and immediate minimax benefit explain included/excluded cases and saved calls. |
| Maintained state and correctness | 20 | 4 | History invariant, strict progress, truthful-secret inclusion, singleton and actual termination are reconstructable and agree with intermediate values. |
| Interaction and visual meaning | 20 | 4 | Pre-reveal predictions, next-round versus completed-ledger semantics, replay and prediction invalidation work; data and state markers are distinguishable. |
| Python and cost | 15 | 4 | Faithful canonical code executed on fresh input; index mapping, cache/bucket/filter behavior, mutation, exact source transfer and actual costs checked. |
| Bilingual/device | 10 | 3 | Equivalent reasoning, complete repaired selection, keyboard and narrow-layout access pass; extreme narrow zoom retains reading friction. |

Weighted total: **97.5/100**. All dimensions ≥3; no required finding remains. **Accepted** for this frozen revision and local review scope, separate from publication.

Limitations: no real human comprehension measurement, successful LeetCode submission, universal budget proof, physical-device testing, browser-chrome zoom or publication verification. Live official statement access succeeded; Python selector verification uses saved lesson-local evidence. Only the requested report and exclusive evidence directory were written. Implementation, tests, shared assets, services, prior reports and prior screenshots were preserved.

Final evidence check: inspected all four settled dense-table captures and `zh-prediction.png`. The 22-row left view shows candidate identifiers and reply counts; scrolling right exposes separate Used/Available/Chosen next states, with `bddddd` selected at the same row in both locales. Chinese right view shows worst 9 on that row versus used `accccc` worst 10. English's wider state column requires an intermediate horizontal offset to read some numeric columns; this is contained component scrolling, not lost content. The earlier unsettled captures are retained only as capture history. Final `git diff --exit-code` passed; status still contains only the two authorized output paths. All six rerun result files report pass.
