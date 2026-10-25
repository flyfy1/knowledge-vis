# Independent review: 793

Candidate: `37a0404f4a9e796d8df3c2cfa9a188957fe835fe`. URL: http://127.0.0.1:18770/leetcode/793/. Review run: 793-review-2-6ee3ec7c. Reviewer/model identity not independently available. Target: basic Python, lists, loops, functions, elementary recursion. Frozen weights: 15/20/20/20/15/10. Interpretation fixed before opening: official Python preferred; reconstruct mechanism and actual executable cost, not merely trace output.

## Cold browser walkthrough (saved before source audit)

Read only the frozen rubric before opening Chromium through Playwright. No brief, implementation, tests, author claims or previous review was consulted. Initial viewport 1280×900; English. Screenshots: `793-evidence/793-review-2-6ee3ec7c/cold-initial.png` and `cold-complete.png`.

1. **Question:** Why does 25! add two zeroes? **Action:** Read the 10! hand calculation and the 24! ledger, then increase x once and decrease once. **Observed:** 24 gives four listed multiples of 5 and no multiple of 25; 25 gives five in the first layer and one in the second, total six; reversing restores four. **My conclusion:** zeroes count 2×5 pairs; 5 is limiting, and the same factor 25 legitimately contributes twice because it contains two 5s. The ledger represents factors, not factorial digits. The page defines factorial, floor division, and 0!=1 before using them.
2. **Question:** Why only five matches or none? **Action:** Read five-input cards and expand the scanning baseline. **Observed:** 20…24 maps to 4, 25…29 to 6; the text writes x=5q+r and f(x)=q+f(q), independent of r, and explains strict growth across blocks. Baseline scans range(5*(k+1)); the cost and sufficient endpoint are explained. **My conclusion:** a block has five inputs with one shared count; different blocks cannot share it. The tempting x=5k rule fails at k=5, since 25 has six zeroes. Counting matches differs from finding one witness.
3. **Question:** How does the search discard inputs safely? **Prediction recorded before clicking:** for k=5, [0,30] tests 15 with f=3, so lo becomes 16. **Action:** Next search operation, then finish both searches. **Observed:** first frame exactly [0,30] → mid=15, f=3 → [16,30]. Final frame 11/11 gives L(5)=L(6)=25 and zero matches; chronological history retains all ten comparisons and their before/after ranges. **My conclusion:** monotonicity excludes everything through an insufficient midpoint; a sufficient midpoint remains a possible first answer. L(t) stays inside the closed interval, x<lo is insufficient, x≥hi sufficient. Shrinking ends at one boundary; subtracting adjacent target boundaries counts only equality inputs. Current cards show updated bounds, history preserves prior values.
4. **Question:** Does the rule transfer to a larger jump? **Prediction recorded before reveal:** k=29 has no matches because f(120)=28 and f(125)=31; independently chosen k=7 should have five matches x=30…34 (to check in code because the search accepts presets only). **Action:** Select 0 inputs for k=29 and reveal; change answer; choose k=31, select five and reveal. **Observed:** feedback derives f(124)=24+4=28, f(125)=25+5+1=31, and coincident boundaries 125. Changing the choice removes feedback. k=31 feedback identifies 125…129 and boundary 130. **My conclusion:** consecutive factorial inputs need not produce consecutive counts; the power 125 skips two values. The new exercise requires applying the layers beyond 25.
5. **Question:** How does this become Python, and what is saved? **Action:** Read the visible Python explanation and complexity discussion. **Observed:** repeated x//=5 sums layers, first_at_least mirrors lo/hi/mid and both branches, and final subtraction is explained. It explicitly distinguishes right-boundary-first code from left-boundary-first trace. O(log²(k+2)) time and constant auxiliary integer cells are qualified by fixed-width arithmetic; history storage is separate. **My conclusion:** repeated division counts each extra factor layer without factorial construction; binary search avoids the baseline's linear scan. No missing explanation was supplied from source during this walk.

Cold-walk limitation: the first automation attempted a button locator for a radio label; that script timed out after the completed search. A separate browser pass used the actual radio labels and completed the exercise. This was a review-script locator error, not a lesson failure. Custom k=7 is a planned code check, not a claimed browser experiment.

## Post-walk audit

The following audit began only after the cold record above was saved. The rendered-state contract was then read and applied.

Additional independent counterexample prediction, recorded before its execution: k=11 should have no matches, since f(49)=9+1=10 and f(50)=10+2=12; the tempting first-layer-only rule would call x=55 a match although its second layer adds two. This is a code check because 11 is not a UI preset.

Execution confirmed k=11 returns 0. Its manually calculated jump excludes equality everywhere by monotonicity. The original k=7 prediction also passed actual canonical execution: exactly x=30…34 match, while the tempting x=5k=35 has eight zeroes. These are custom **code checks**, not UI input claims.

## Candidate, official interface and source audit

HEAD is exactly the requested candidate. The preview's raw HTTP bytes equal checkout bytes for all seven top-level runtime assets. Representative SHA-256:

| File | SHA-256 |
| --- | --- |
| index.html | `f180a067820462c881d39b6c294778c53aaa135b58bcf338d41f185090f4dc84` |
| copy.js | `459afe94ffb24dc70ed119bd9709d731c6034255a16fa08c5795fc944659ac5a` |
| solution.py | `7d899881c97a830cf9f8e91ffefaa9d9ce248e93fc3ad54532d0e4831e372e57` |
| core.js | `13c3e4c9a734a69400125683ddd2cd6d26a9a104a0dca71ee7a6ce8a3ceae86c` |

Read the [official statement](https://leetcode.com/problems/preimage-size-of-factorial-zeroes-function/) normally through web access after the cold walk. Nonnegative x, 0!=1, k in [0,10⁹], and official examples 0→5, 5→0, 3→5 agree with the lesson. No access bypass or submission was attempted. The lesson-local official response records the Python3 selector stub `class Solution: def preimageSizeFZF(self, k: int) -> int`; the actual source implements that exact callable and returns the requested integer count. Python is the faithful preferred interface; the conditional non-Python language-contract audit does not apply. The saved response also includes TypeScript and other languages; none is needed instead of Python.

Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python maps to `solution.py`, `python-code.js`, `PYTHON_SOURCE`. Audited canonical source, browser core/rendering, HTML, stylesheet, all bilingual copy, shared locale consumer, and each test before execution. The locale consumer uses index 0 for Chinese and 1 for English; the JSON object-pairs hook detects duplicate keys before they can be discarded, and all entries are two nonempty strings. Representative rendered semantic bindings were checked separately from key shape: complete layer and boundary formulas, insufficient/sufficient branch explanations, phase starts, final result, both quiz explanations, and distinct clipboard success/fallback text.

**Required metadata preflight:** `python3 -B scripts/register_leetcode_lesson.py 793 --validate-only`, from repository root, exited **0**, with no output. `complexity` is exactly the nonempty string `O(log²(k+2)) time; O(1) auxiliary space`, not an object. No registration or candidate repair was performed.

## Independent computational and invariant evidence

The actual canonical Python was executed with `exec(compile(...))`, without bytecode generation. An independently written literal-factorial frequency oracle checked k=0…149 against factorials for x=0…649; all passed. A second independent oracle inverted the strictly increasing five-input-block count using base-five digit sums, `q+f(q)=(5q−digit_sum_5(q))/4`; 210 fresh seeded/boundary inputs passed, including 999999998, 999999999 and 10⁹. Max k returns 5. Additional code check k=23 returns 0: f(99)=22 and f(100)=24 exclude it. The fresh k=7 and k=11 predictions are recorded above.

A Python line tracer on the actual canonical target=5 call observed loop bounds `(0,30), (16,30), (24,30), (24,27), (24,25), (25,25)`. Thus the cold first transition maps to `mid=(lo+hi)//2`, `zeros(15)=3`, and `lo=mid+1=16`. The right-boundary call executes first, matching the explicit lesson note about independent search ordering. Integer arguments are local immutable values; helper division does not mutate caller input. The solution constructs no factorial.

An independent browser pass read **250 DOM frames** across all presets in both locales, checking bounds with a separately written digit-sum oracle rather than FZFCore's expected trace. Every frame satisfied `lo≤hi`, `lo=0 or f(lo−1)<t`, and `f(hi)≥t`; within-phase intervals strictly shrank. Observed final boundary pairs, in both locales:

| k | L(k) | L(k+1) | Count |
| --- | --- | --- | --- |
| 0 | 0 | 5 | 5 |
| 3 | 15 | 20 | 5 |
| 5 | 25 | 25 | 0 |
| 6 | 25 | 30 | 5 |
| 24 | 100 | 105 | 5 |
| 1,000,000,000 | 4,000,000,015 | 4,000,000,020 | 5 |

For nonnegative candidates the invariant initially holds, including target zero. When lo<hi, floor midpoint is below hi; either update shrinks the interval. A sufficient mid must remain because it could be the first; an insufficient mid and all smaller values fail by monotonicity. At equality the invariant locates L(t). Subtracting the first ≥k and first ≥k+1 boundaries counts precisely equality; for skipped k it remains correct even though f(L(k)) is greater than k.

The baseline scans 5(k+1) candidates, each using logarithmically many divisions. Its displayed O((k+1)log(k+2)) time and constant auxiliary space cover k=0. The submission has two logarithmic searches, each repeatedly counting layers: O(log²(k+2)) time and O(1) integer cells in the stated arithmetic model. The maximum initial bound 5,000,000,010 accounts for target k+1. Python avoids overflow and JS trace integers remain exact here. The arbitrary-precision caveat and separate O(log²(k+2)) snapshot-history storage are accurate. These conclusions follow from actual loops, not test timing.

## Interaction, translations and accessibility

Full forward traversal, full backwards traversal, reset, finish, endpoint disabled controls, and rewind/replay passed for all six presets in both languages. Initial frames have no completed comparison. Phase two resets its own bounds while preserving completed first-phase history and the located left boundary. Current bound cards are post-comparison values; operation/history include pre-test values, midpoint and count. The last-row accent highlights the latest data, not a separate algorithm quantity. Input changes restart the trace as labeled.

Both exercise questions and all three answer choices were exercised, including correct/incorrect feedback, reveal disabled before selection, changing choice hiding feedback, question changes clearing answers, and reset. Chinese and English explain the same 125 jump and five-input block. zh→en→zh preserves x=25, search frame 1 with lo=16/hi=30/history length 1, selected k=29 answer, and revealed causal feedback. The trace and exercise remain independent. Both H1 and document title match localized metadata including #793; the exact official URL is retained.

Source parity passed without trimming or normalization, including final newline: canonical bytes, offline mirror, embedded string, rendered `textContent`, native successful clipboard copy, downloaded file, and manual fallback. Linux Chromium used **Control+C**. For each manual attempt (two per locale in the broad suite, one per locale in the focused suite), a fresh distinct non-source sentinel was written and read back before automatic writing was forced to fail; the real Copy control focused and selected the entire source, then native copy read back the exact canonical string. This tests transfer, not merely textarea visibility or stale clipboard contents. File-mode source and blocked-localStorage initialization also passed.

Browser environment: Linux, Chromium **156.0.8078.4**, launched through Playwright with NODE_PATH and `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Both locales were checked at 320/390/736/1440px, plus 200% CSS zoom at 1440px. Page width stayed within viewport. At 320px, the selected maximum-k label is complete (130.4003px measured text versus 194px available after padding and conservative 32px native-arrow reserve). CSS uses `"PingFang SC", "Microsoft YaHei", system-ui, sans-serif`; exact resolved font is not inferred. The long interval numbers wrap without colliding with their labels. Source has intentional horizontal scrolling, accessible by keyboard ArrowRight. The scrolling step navigation exposes later items through focus.

Keyboard Home/End operates hand-lab endpoints 0 and 30; minus/plus disable appropriately. Enter activates the five section anchors below the sticky bar, toggles source disclosure, and neighboring controls/links are reachable in order. Focus rings are visible 3px outlines, with no parent clipping. Controls checked are at least 48×48px. Disabled controls use opaque #9aa7b8 on #161b22, dashed borders, contrast **7.078851579**; focus contrast **10.73163705**. The inspected contrast helper uses correct coefficients and calibration including black/white=21, primary colors, and #747474 on black=4.4929480731 (fails 4.5 without rounding). The 98 measured solid/composited text pairs had minimum **6.449407899**. Forced colors and reduced motion passed. These numerical checks accompany visual inspection.

Personally inspected fresh captures: `cold-initial.png`, `en-final-mobile.png`, `en-320-operation.png`, `zh-320-trace.png`, `en-390-operation.png`, `zh-200percent.png`, `en-1440-trace.png`, `zh-320-heading.png`, `en-final-source.png`, `zh-final-prediction.png`, and all four `focused/*-end.png` images. They show readable headings, dense numerical state, feedback, enlarged controls, source panel and page ends. No actual essential-text intersection/clipping was observed. Content outside a scroll-position screenshot is not treated as missing content. Narrow screens require substantial scrolling between controls, bounds and history; this is minor interaction friction.

The browser suite followed both related destinations and retained their actual rendered section text in `browser.json`. Independently read those captures: #4/#step2 describes cut comparisons and search direction; #668/#step2 derives the first sufficient value from a monotone count with concrete 3×3 examples. These meanings match their bilingual continuation labels. This establishes preview availability, not public deployment.

## Earlier review and stable finding closure

Read the earlier 793 report only after saving the cold walk. It accepted base `59d0c9b1f395064dc3af7be66dadd6c18d92944d` with no required open findings. Historical acceptance remains attached to that base. Also read the subsequent repair request **793-COPY-R1**, which asks to remove workflow wording from the learner page.

`git diff` from that base to this candidate shows only: removal of the footer element, removal of the bilingual `foot` key, and copy.js query-version update from `793-r1` to `793-copy-r1`. `app.js`, `core.js`, `solution.py`, `python-code.js`, `style.css` and metadata are unchanged. All other copy pairs exactly equal the saved pre-repair dictionary. No acceptance badge or replacement claim was added.

**793-COPY-R1 — closed against this candidate.** Scope: learner-facing workflow footer; required follow-up copy repair, with no algorithm severity asserted. Reproduction/recheck: on candidate 37a0404, at 320×1000, set x=25, advance k=5 once, reveal k=29, switch zh→en→zh, then visit the page end at 320px and at 1440px/200% CSS zoom in both locales. Expected: old workflow text and its binding gone, meaningful simulation/source limitations preserved, state retained, neighboring controls/links reachable, no orphan gap or missing-key exception. Actual: no footer or `foot` property; both exact old strings absent; preserved `sim`, `s4e`, counting formulas and remaining dictionary unchanged; trace/quiz state and feedback preserved; no page/console/HTTP errors. End gap after main is within 0.46 CSS px and viewport width does not overflow. The four inspected focused screenshots show ordinary page-end spacing and readable related links. Keyboard order Copy→Download→source summary (Enter toggles)→related #4→related #668 passed, as did exact source transfers. Fix revision: requested candidate 37a0404. Regression evidence: `focused/browser.json` and its four screenshots. Owner/next action: none for this request. Independent recheck status: **closed**. No required open findings remain.

## Inspected test execution and evidence provenance

All outputs are confined to this run's exclusive evidence directory. No build/generation/registration operation was run. These are reviewer reruns of existing author programs; their JSON retains “author self-check” labels and does not supply the teaching verdict.

| Command | Result |
| --- | --- |
| `OUTPUT_DIR=specs/reviews/793-evidence/793-review-2-6ee3ec7c python3 -B leetcode/793/tests/check.py` | Exit 0; canonical factorial/accumulated-factor/large checks, displayed baseline, duplicate-key detection, mirror parity; 333385 intermediate trace frames checked |
| Same `OUTPUT_DIR`, `node leetcode/793/tests/browser.cjs` | Exit 0; 24 state records, 18 screenshots, 98 contrast pairs; no errors |
| Same `OUTPUT_DIR`, `node leetcode/793/tests/supplement.cjs` | Exit 0; 12 complete reverse traversals, focus/disabled/forced-color and source keyboard scroll checks |
| `python3 -B scripts/register_leetcode_lesson.py 793 --validate-only` | Exit 0, silent; non-mutating metadata gate |

The focused `copy-r1.cjs` hardcodes an author evidence destination, so it was **not run directly**. It was read, loaded into a Node `Module`, and compiled in memory with only `OUT=path.join(__dirname,'evidence/copy-r1')` replaced by this run's absolute `.../793-review-2-6ee3ec7c/focused` path; filename, imports, inputs and assertions were unchanged. The `node <<'JS'` adapter uses `fs.readFileSync`, that one `replace`, `new Module(file,module)`, `_nodeModulePaths`, and `_compile(code,file)`; it creates only the redirected directory. Result: exit 0, status passed, Linux native copy verified, no errors. This path adaptation is not a runtime or test-assertion repair. Earlier outputs were preserved.

Independent factorial/digit-sum canonical checks, line tracing and DOM-invariant traversal were executed separately as inline Python/Node scripts; observations are recorded above. Test totals support bounded correctness evidence only; teaching scores come from the cold reconstruction and rendered observations.

## Scores and conclusion

| Dimension | Weight | Score /4 | Rationale |
| --- | --- | --- | --- |
| Problem/terms/hand calculation | 15 | 4 | Count versus witness, input domain, factorial/floor/preimage and factor ledger are clear before abstraction. |
| Derivation/saved work | 20 | 4 | Small 24→25 example supports block proof, excluded skipped values, baseline cost, and two-boundary search. |
| Correctness/maintained state | 20 | 4 | Invariant, both transitions, sufficient endpoint and termination agree with hand work, DOM frames and canonical execution. |
| Interaction/visual meaning | 20 | 3 | Prediction, reversible history and state semantics are faithful; narrow-screen controls and long operations require substantial scrolling to compare. |
| Python/cost | 15 | 4 | Exact callable/source transfers, executed fresh examples, transition mapping and accurate qualified cost/mutation discussion. |
| Bilingual/device | 10 | 4 | Equivalent reasoning and state preservation; readable narrow/zoomed states, keyboard, contrast and source fallback verified. |

Weighted score: **95/100**. All dimensions ≥3. Required open IDs: **none**. Stable request 793-COPY-R1 is closed by the candidate-specific evidence above.

**Accepted for revision `37a0404f4a9e796d8df3c2cfa9a188957fe835fe`.** This review is separate from publication. Limitations: no measured human comprehension, successful LeetCode submission, physical device/browser-chrome zoom, screen-reader session, other browser engine or host-font environment, or public deployment is claimed. The 200% check is browser-rendered CSS zoom. Official Python stub corroboration uses saved lesson-local official evidence; the current statement was independently read, but a live selector interaction was not performed. No non-Python exception depends on that limitation.

Final scope check: `git diff --exit-code` passed; only this exact report and exclusive evidence directory are untracked. Candidate assets, earlier reports/evidence, services and repository configuration were not changed.
