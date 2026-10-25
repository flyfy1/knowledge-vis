# Independent review: 843 Guess the Word

Candidate: f6e2500dc87fe0a50a3258af80bf46d761ca1be8. URL: http://127.0.0.1:18770/leetcode/843/. Date: 2026-10-26. Reviewer: this independent review run; exact model identifier unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Rubric: specs/leetcode-review-gates.md; weights 15/20/20/20/15/10. Python is the expected canonical language. No author notes, source files, tests or previous reviews were opened before this record.

## Cold browser walkthrough (saved before repository source audit)

Real Chromium via Playwright, desktop 1280×900. Read the entire rendered page and inspected cold-start.png. This is reviewer reconstruction, not evidence of human learner comprehension.

| Teaching step/question | Action and prediction before reveal | Observable result | My causal paraphrase |
| --- | --- | --- | --- |
| 1: What does one reply count? | Predicted positions 2,5,6, hence 3, for acckzz / ccbazz; clicked Show/hide comparison. | Six columns mark ×,✓,×,×,✓,✓, and reply 3. | Letters count only at equal positions; shared letters alone do not count. Input is a unique six-letter list and a hidden secret; output is an actual successful oracle call, not a returned word. |
| 2: After reply 3, which remain? | Hand-computed scores for ccbazz against [acckzz,ccbazz,eiowzz,abcczz]: [3,6,2,2]. Read the four-word hand example and baseline disclosure. | Rendered explanation retains only acckzz and says it still must be guessed. >= would wrongly retain ccbazz. | A survivor must reproduce exactly the observed reply. Repeating filtering intersects all historical constraints and retains the true secret. Offline comparisons save paid oracle calls relative to guessing every original word. |
| 3: How many could the next guess leave? | Predicted acckzz has worst failure bucket 1, gets reply 2 for eiowzz, leaving eiowzz; clicked one round. Predicted the next call succeeds, then clicked again, then Back. | First round: 4→1, ledger acckzz→2; table is now next-round state, eiowzz chosen with worst 0, used acckzz marked. Second round shows success after the actual eiowzz call. Back restores the one-call state and retained ledger. | Minimax compares sizes of possible failure groups; 6 is success, not unresolved work. Table shows before the NEXT call while ledger describes completed calls. Singleton knowledge differs from success. Termination at ≤n is explicitly distinguished from meeting the case budget. |
| 4: Which candidates agree with reply 4? | Before clicking, calculated aaaabb against [aaaaaa,aaaabb,aabbbb,bbbbbb] = [4,6,4,2]; selected aaaaaa and aabbbb, checked; changed to Only aaaabb and checked again. | Explanation confirms the two survivors; wrong selection shows “Check the equality condition” and explains why 6 contradicts 4. | Both survivors fit, so the reply does not identify the secret. The tempting >= rule fails on the guess itself. This exercise transfers equality filtering, though it repeats the same style of rule. |
| 5: How does this become Python? | Read the interface/cost explanation and opened the rendered submission disclosure as a learner-facing teaching step. | Official findSecretWord(words,master), None result, cached pair matches, six failure buckets, tuple tie key, and equality comprehension are visible. | The visible 4→1 transition corresponds to keeping original indices i with matches[probe][i] == reply. Pair precomputation saves repeated positional counting; each round scans probes × candidates. Tuple ordering and list comprehensions require some additional Python familiarity, explained in prose. |

The UI offers presets only. Independently chosen **future code check**, prediction recorded before source execution: words [abcdef,abcdeg,zzzzzz], secret abcdeg: first abcdef has failure worst 1 (ties resolved by original order), reply 5 leaves abcdeg, then abcdeg→6; two calls. Fresh counterexample: guess abcdef, reply 0, same list: scores [6,5,0], so only zzzzzz survives; >=0 incorrectly keeps all three. These are code checks, not custom UI experiments.

Cold screenshots: 843-evidence/843-review-2-4d2abc1d/cold-start.png and cold-round.png. Cold record ends here. Subsequent evidence and findings will be appended after source audit.

## Post-cold audit: identity, official contract and source

HEAD equals the requested candidate. `git diff --exit-code` passed; only this report and its exclusive evidence directory were untracked. Independently fetched index.html, solution.py, python-code.js, core.js, app.js, copy.js, local style.css, shared style.css and common.js from the preview and compared every byte with the checkout. Identity anchors (SHA-256):

- solution.py: `51f9e29c91ca3ffe6238f13dfa0f0b632081274be4747ac67cfbf627b986dc05`
- index.html: `4cbe9ed7c17a5e3d00d069cdff13db960be42f98379b8ed0375e4c1d1e774092`
- core.js: `dd5ae115a5988c71164432995a8def755283b95fedf53318aed186b4f48f5ecb`
- copy.js: `7811c587179f85366346a0ef77fad46b4735428b17613522cb730f0fdcb7d053`
- python-code.js: `3d3287def904402b4390f999cf8b67e49e28b086c64cab63410059b80aa663b2`

After the saved cold record, read the rendered-state supplement and the actual canonical source, UI/core/localization files and baseline code. Read the [official statement](https://leetcode.com/problems/guess-the-word/) through normal web access, without bypass: exact positional matches, unique six-letter lowercase words, n=1..100, secret in list, listed guesses, 10..30 call allowance, and an actual successful call required. The generated-case qualification says a reasonable strategy can succeed; it does not prove this particular minimax heuristic universally meets the allowance. The lesson correctly limits its claims.

The lesson-local official-graphql.json and official-verification.md record the Python3 selector stub `Solution.findSecretWord(self, words: List[str], master: 'Master') -> None` and judge-supplied `Master.guess(word: str) -> int`. Inspected the saved stub itself. This is saved author-origin interface evidence, distinguished from the independently read live statement. The canonical callable matches it: words/master only; no budget getter or secret argument. No conceptual analogy substitutes for Python. A non-Python language-contract audit is inapplicable because faithful Python is supplied. Read LANGUAGE_FILES in scripts/register_leetcode_lesson.py: the exact Python names are solution.py, python-code.js, PYTHON_SOURCE.

## Independent execution, state and costs

Executed the actual canonical Python with a fresh judge for the pre-recorded list [abcdef,abcdeg,zzzzzz]. Observed exactly [(abcdef,5),(abcdeg,6)], None return, unchanged input. Independently reconstructed all-history candidates at each actual call using the caller frame and a separate equal-position calculation. The fresh counterexample scores are [6,5,0]: equality to reply 0 keeps only zzzzzz, whereas >=0 keeps all three. These remain **code checks**, since no custom-input UI exists.

A separately written browser oracle did not import core.js or its formatter. From raw lists it enumerated all seven groups, computed largest failure bucket, ranked by candidate membership/input order, and compared each rendered bucket and selected probe before advancing. All 13 calls across the original five presets agreed: four words acckzz→2,eiowzz→6; two words hamada→0,khaled→6; singleton aaaaaa→6; disjoint aaaaaa through ffffff with five zero replies then 6; ties aaaaaa→2,aabbbb→6.

The invariant is exact consistency with every prior reply. Filtering the already consistent list by another equality preserves earlier constraints; the true secret reproduces the new reply and remains; an unequal score contradicts that reply. Initially all words qualify. With c candidates, an unused candidate probe has at most c−1 survivors on failure, so minimax can do no worse. Used failed probes cannot remain candidates. At a singleton the candidate has worst failure bucket zero and wins the membership tie rule, ensuring an actual successful call. Thus G≤n follows, while G≤allowedGuesses does not follow. Reply −1 cannot occur with the legal probes used here; dishonest feedback is outside the premise.

Concrete mapping: initial candidate indices [0,1,2,3], probe index 0, `matches[0][2]=2`; after reply 2 the equality comprehension keeps [2], displayed as eiowzz. The next probe index 2 has all six failure buckets zero and succeeds with reply 6. The table includes a seventh success column; Python deliberately excludes success from max by allocating six buckets and guarding score<6. This agrees with the visual meaning. The UI filters the terminal frame to the successful singleton; Python returns immediately upon 6. This final pedagogical snapshot does not imply a further Python filtering operation.

The baseline actually loops through the existing input until 6: up to n oracle calls and O(1) extra space. Precomputation in the canonical solution does n² length-L comparisons and stores n² scores. Each round scans n probes and at most n candidates; the linear membership test in the tie key also totals O(n²), within the stated bound. Candidates and used add O(n) storage, six buckets constant storage. Thus O(n²L+Gn²) time, worst O(n³+n²L), and O(n²) auxiliary space are justified, including n=1. Input words are not mutated. Browser history snapshots have a separately disclosed storage role.

## Inspected tests and reruns

Read test_solution.py, test_budget.py, test_core.cjs, browser.cjs, focused.cjs and budget_browser.cjs before executing them. Their writes support OUTPUT_DIR or explicit --output. No build/generation script was run. All rerun output was redirected inside this review's exclusive directory; earlier evidence was untouched. Literal “author self-check” labels inside harness output identify the harness, not an additional independent reviewer.

Commands executed from repository root, all exit 0:

```sh
OUTPUT_DIR="$PWD/specs/reviews/843-evidence/843-review-2-4d2abc1d" python3 -B leetcode/843/tests/test_solution.py
python3 -B leetcode/843/tests/test_budget.py --output specs/reviews/843-evidence/843-review-2-4d2abc1d/green.json
OUTPUT_DIR="$PWD/specs/reviews/843-evidence/843-review-2-4d2abc1d" node leetcode/843/tests/test_core.cjs
OUTPUT_DIR="$PWD/specs/reviews/843-evidence/843-review-2-4d2abc1d" node leetcode/843/tests/browser.cjs
OUTPUT_DIR="$PWD/specs/reviews/843-evidence/843-review-2-4d2abc1d" node leetcode/843/tests/focused.cjs
OUTPUT_DIR="$PWD/specs/reviews/843-evidence/843-review-2-4d2abc1d" node leetcode/843/tests/budget_browser.cjs
python3 -B scripts/register_leetcode_lesson.py 843 --validate-only
```

The last command was silent and exited 0. Metadata complexity is exactly one nonempty string: `O(n²L + Gn²) time; O(n²) auxiliary space, L=6 and G≤n (worst-case O(n³+n²L) time)`. No registration was run.

Observed runtime coverage: 1,211 canonical Python cases including n=100 samples, all secrets of all nonempty subsets of eight words, official examples, singleton, zero replies, no input mutation and a 26-call disjoint stress fixture under budget 30. Core checks cover 3,068 intermediate frames and 87 unique localization pairs. The budget spy runs the exact source hash above, checks legal nonrepeated calls, strict budget accounting, minimax ordering, full-history consistency, strict shrinkage, final success, None and no mutation. All secrets succeed: 20-word family 20/20, max10; 22-word family 22/22, max11; 24-word family 24/24, max12; official lists 4/4 and 2/2, max2; singleton 1/1, max1. These are computational evidence, not inferred teaching scores or hidden-test claims.

## Interaction, bilingual access and source transfer

Chromium 156.0.8078.4 on Linux, launched through Playwright using NODE_PATH and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. Both locales exercised all nine presets, initial/middle/final frames, next/back/replay, reset/end and disabled endpoints. Four additional budget walkthroughs (EN/ZH × 320/1440) observed: 22 words and ten completed calls → one known but unguessed bmmmmm; next enabled → eleventh actual call returns 6; back/replay restores exact state. Budget-10 control ends exhausted, explicitly unsuccessful, with singleton still displayed and next/end disabled. The simulator openly receives budget and disclosed secret while Python does not.

All prediction choices were checked. Changing choice hides prior feedback; reveal recomputes correct/wrong equality feedback. Prediction reset clears selection and disables reveal. Scenario changes reset only the round experiment and retain the independent prediction as promised. Locale roundtrips preserve round, candidate set, ledger, choice and revealed meaning. At 320, zh→en→zh H1s and document titles matched the metadata: #843 and the correct Chinese/English title.

Rendered formulas in both locales contain the complete C_new/C_old equality and max over B₀..B₅. Both languages explain positional matches, equality rather than >=, history consistency, largest failure bucket, tie order, actual singleton guess, termination versus budget guarantees, and the same costs. Bound messages distinguish known/found/exhausted; no semantic locale mismatch was observed. Duplicate-key detection happens before evaluating COPY, with two-string pair shape checked; actual feedback/state paths were separately read.

Exact canonical parity passed for decoded mirror, embedded export, displayed textContent, downloaded bytes and successful clipboard text, including the final newline without trim or normalization. Each locale's manual fallback test wrote/read a fresh distinct non-source sentinel before disabling automatic writes. Invoking Copy focused and fully selected the entire source textarea. Linux Control+C then replaced the sentinel with the exact canonical source through real clipboard readback. Both attempts passed; tests did not seed source into the clipboard.

Keyboard Enter advanced a round; Tab reached reset; a visible 3px focus outline remained under forced colors. The focusable table scrolls with ArrowRight (observed offsets 40 and 80 after operation), distinct from chosen-row highlighting. Touch-target checks passed at 390. Candidate chips, table labels and ledger are actual state; the chosen-row tint has an explicit textual “Chosen next”/Chinese state, and used rows are separately labeled. Dense 22-word tables retain headings through horizontal scrolling; page overflow checks do not replace this inspection.

320/390/desktop layouts and both locales were captured; inspected screenshots include cold-start, cold-round, en-320-known10, zh-320-exhausted10, en-1440-found11, zh-390-trace, zh-prediction, en/zh long-select, en-320-preset6-settled, en-390-preset8-settled, en-1280-preset8-settled, and en/zh-320-table-*-settled. All names refer to this run's exclusive evidence directory. Initial dense-table captures scrolled too early; they are preserved but the later *-settled captures establish actual table visibility. No text collision was inferred from container bounds.

At CSS zoom 2 on 320/390/1440, no page-wide overflow was observed, but EN/320 readouts wrap into fragments (“complet / ed”, “candidat / es”). The inspected en-320-zoom200 and zh-1440-zoom200 captures show this contrast in reading effort. CSS zoom in Chromium is an approximation; browser-chrome zoom and physical devices were not exercised.

Disabled states use readable muted text rather than opacity reduction. Independently extracted and exercised the actual lum/ratio helper from browser.cjs against black=0, white=1, red/green/blue=.2126/.7152/.0722, black/white=21 and #747474 on black=4.492948073111701 (<4.5). Calibration passed. Measured body 16.087:1, hint 7.744:1, disabled previous 7.079:1, table data 12.298:1, focus/panel 8.937:1. These cover the recorded solid/composited colors, not every perceptual condition.

Related bilingual labels resolve locally to ../4/#step2 (binary-search valid-cut interval and excluded direction) and ../37/#step2 (board-consistent candidate sets/backtracking). Read those destination sections through browser navigation; their content supports the advertised concepts. No public delivery or publication assertion is made.

## Earlier required finding closure

Only after the cold record, read 843-review-1-7f018940.md and 843-review-budget-request-20261026.md. Historical acceptance remains historical; it does not determine this score.

**843-BUDGET-R1 — closed against f6e2500dc87fe0a50a3258af80bf46d761ca1be8.** Original defect: ten-call truncation returned with an unguessed singleton on feasible budget-11 structured inputs. Source diff from prior candidate 617cb7c7 shows replacement of range(10) with while candidates, updated core stopping, budget-aware simulator/exhaustion, and G≤n costs. Current canonical SHA-256 is recorded above. Exact-source all-secret regression in green.json proves actual success at max10/11/12 for the requested 20/22/24 families under 10/11/30 budgets. Browser budget-browser-results.json and inspected known10/found11/exhausted10 screenshots show changed states in both locales at narrow and desktop widths, with rewind/locale preservation. Mirror/render/download/native-copy parity passed. No budget field is exposed to the submission. This closes the artificial truncation finding with executable evidence, rather than a disclaimer alone. It does not establish universal success for every feasible case or hidden-test membership; both locale explanations retain that limitation.

Historical advisory 843-R1-A01 (extreme narrow zoom word fragmentation) remains observable, non-required, and is not claimed closed.

## Required open finding

**843-R2-SELECT01 — open; medium severity; required.** Section 3 scenario control; candidate f6e2500dc87fe0a50a3258af80bf46d761ca1be8; EN; Chromium/Linux; 320×1000 at normal zoom, also truncated at 390. Reproduce: load lesson, choose EN, choose “22 words · infeasible budget-10 control”, close select, scroll control fully into view. Repeat zh→en→zh to compare. Expected: selected label exposes the scenario's word count, budget and control purpose without clipping. Actual at 320: text ends around “22 words · infeasible budge”, hiding the budget value 10 and control label. At 390 the final control word is still truncated. Another new label, “22 words · budget 11 · bmmmmm”, truncates the secret at 320. Chinese control label and desktop English label remain complete.

Evidence: en-320-long-select.png, en-320-preset8-settled.png, en-390-preset8-settled.png, en-320-preset6-settled.png; controls zh-320-long-select.png and en-1280-preset8-settled.png. Measured EN selected text width 292.529 CSS px versus select client width 256, with 15px left/right padding before the native arrow; even without reserving arrow space it cannot fit. Chinese text width 189.696 fits the same control. CSS font is 16px, stack “PingFang SC”, “Microsoft YaHei”, system-ui, sans-serif; exact installed font resolution was not identified. Screenshots confirm actual text loss, independently of numerical measurement. This is a settled closed-control capture, not a page-edge or scroll artifact.

Violated requirement: frozen rubric bilingual/device essential readable controls; rendered-state contract §8 makes selected-label inspection concrete. Here the missing budget is central to distinguishing the new success and exhaustion experiment. Surrounding prose and a readable opened option do not repair the selected value. Owner/next action: lesson author should shorten equivalent bilingual labels or expose the complete selection in a wrapping adjacent readout, retaining word count, budget and purpose. Fix revision: none. Regression/recheck: pending a new candidate at 320/390 and locale roundtrip; no implementation was changed during review.

## Scores and conclusion

| Dimension | Weight | Score /4 | Rationale from observed teaching |
| --- | ---: | ---: | --- |
| Problem, terms and hand calculation | 15 | 4 | Concrete equal-position columns and a correct hand result precede candidate abstraction; actual-call success and legal inputs are explicit. |
| Causal derivation and saved work | 20 | 4 | Four-word equality exclusions and competing bucket sizes explain saved oracle calls; baseline and minimax limits are explicit. |
| Maintained state and correctness | 20 | 4 | History invariant, true-secret inclusion, unequal-score exclusion, strict progress and final actual guess are reconstructable and match intermediate values. |
| Interaction and visual meaning | 20 | 4 | Pre-reveal predictions matched observed transition/ledger; next-round table semantics, replay and independent prediction state are clear. |
| Python and cost | 15 | 4 | Faithful executed Python, concrete index transition, exact transfer parity, mutation behavior and actual loop/memory costs checked. |
| Bilingual and device | 10 | 3 | Equivalent reasoning and keyboard access remain usable; new selected-label clipping requires repair and extreme narrow zoom adds reading friction. |

Weighted total: **97.5/100**. Every dimension is at least 3, but required open ID **843-R2-SELECT01** prevents acceptance. Outcome: **changes_required**. 843-BUDGET-R1 is closed only for the documented defect and regressions; no universal budget guarantee is asserted.

Limitations: no real human comprehension study, successful online submission, physical-device testing, browser-chrome zoom test or publication verification. Live official statement access succeeded; Python selector evidence is the saved lesson-local capture. No missing explanation was supplied from author notes during the cold walk. Only the requested report and exclusive evidence directory were written; implementation, tests, shared files, services, earlier reports and evidence were preserved.
