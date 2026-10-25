# Independent review: 262 Trips and Users

Candidate: `02e853e82c8f874a772b55068c25addcdcf26fee`. URL: http://127.0.0.1:18770/leetcode/262/. Run: 262-review-5-ef47ed43. Target: basic Python, lists, loops, functions, elementary recursion. Reviewer/model identity unavailable; no invented identity. Frozen dimensions/weights: problem 15, derivation 20, correctness 20, interaction 20, executable code/cost 15, bilingual/device 10. Python/Pandas preference applies; no JavaScript exception.

## Cold walkthrough (saved before source, tests, author notes, previous reviews)

Read only the frozen rubric, then opened the actual candidate with Playwright Chromium. Inspected a full-page screenshot (`cold-desktop.png`). The source disclosure remained collapsed during this walkthrough.

| Teaching step | Question and action | Observable result | My causal paraphrase |
|---|---|---|---|
| 1 Eligibility | Read the tiny #1/#2 contrast and hand-compute 10-01. | Both endpoint flags must be No; #1/#3/#4 enter, #4 cancelled; 1/3 = .33. Input is Trips plus Users; output is Day/Cancellation Rate for qualifying days. | A banned endpoint removes the entire request from numerator and denominator, not just from cancellations. |
| 2 Daily trace | Before each Next predicted #1 (0,1), #2 unchanged (0,1), #3 (0,2), #4 (1,3)/.33. Advanced four rows. | Processed count advances; row contributions show 0/1, 0/0, 0/1, 1/1. The daily card shows cancelled 1, requests 3, rate .33. Earlier kept rows also show the current day's .33. Previous then Next restores .00 then .33. | Row columns are contributions, the daily card is the aggregate; highlight identifies the current row rather than changing eligibility. Replaying excluded #2 cannot increase either total. |
| 3 Invariant | Read definition of prefix, baseline counts and induction; compared to trace. | Text supplies (0,0), excluded/no-change, completed/denominator-only, cancelled/both, then termination. Baseline tiny example gives 12 trip-date checks and 64 user checks. | Each row contributes exactly once; repeated user scans are the avoidable cost, not the fixed three-day loop. |
| 4 Transfer | Predicted 0/1=.00 before choosing first answer and Reveal. Then changed to .50. | Correct feedback explains banned driver exclusion; changing choice hides feedback. Selected Transfer preset, ran to end and Reset. | The driver condition matters independently of client; final Transfer shows .00 on 10-02 and 1.00 on 10-03. Reset returns all contributions to zero. |
| 5 Submission bridge | Read all fixed worked intermediate values, leaving source collapsed. | active IDs, first and second merges, [0,0,1], sum 1/count 3, date exclusion, no-group/no-output, .copy(), and expected hash lookup cost are spelled out. | Both inner joins implement the two endpoint checks. Unique user IDs prevent multiplication, grouping counts distinct trip records even if payloads repeat. A boolean cancellation indicator reduces the rate to a sum/count ratio. |

Chinese switch after resetting Transfer preserves the selected dataset and gives equivalent definitions, baseline arithmetic, invariant and Pandas walkthrough. The UI exposes only Sample and Transfer presets; independent custom inputs below will be **code checks**, not UI experiments.

Fresh input chosen and prediction recorded now, before source/execution: active client 8 and driver 80, banned driver 81. On 10-01: completed 8→80 and two distinct cancelled_by_client 8→80 trips. On 10-02: cancelled_by_driver 8→81 only. On 09-30 and 10-04: eligible cancellations. Expect only 10-01 with 2/3 = .67. Counterexample to client-only filtering: it would additionally output 10-02 at 1.00. Boundary predictions: empty Trips or all banned gives an empty two-column result; eligible 10-03 cancellation gives 1.00 and eligible 10-01 completion gives .00. Inputs should remain unchanged.

## Audit boundary

The cold record above was saved before opening audit materials. The following sections were added after source and regression checks.

## Candidate identity and official contract

`git rev-parse HEAD` returned the requested revision. Final `git status --short` shows only this report and its exclusive evidence directory; `git diff --quiet` passed. Independently fetched the served index.html, app.js, copy.js, style.css, python-code.js and solution.py and compared their bytes with the checkout: all equal. SHA-256 receipts:

| Asset | SHA-256 |
|---|---|
| index.html | 434830dc4946e52ff40e785f8f6c4b4845c15dcdf77b51471a50e71f6ae0a5ec |
| app.js | b9c981b22100ce3adc2c2d28b1006da92a7d556ecf3a7682454e80c507fd8f63 |
| copy.js | 4f584898ec669908b5aeabc515e6e471b8c7cfbfab935962b0b6e85afa83ec0b |
| style.css | dca5f9842f568a58da772d12ae3a5b9678ed3b4f953569186194f8061e38b904 |
| python-code.js | a2bec0063d6f90c57caf9dfab3dfa021e1f99d7d54d1b7968190ab77a4a54979 |
| solution.py | 2d49b818d54bb4ad29aed89069637841ee259538fa47cc96bd8c76710bbab4c2 |

Read the [official statement](https://leetcode.com/problems/trips-and-users/) through normal web retrieval after the cold record. Unique trip/user primary keys, endpoint foreign keys, three status values, both-endpoint eligibility, inclusive dates, two-decimal rate and arbitrary result ordering agree with the lesson. No numeric row-count constraint appeared in the retrieved statement. Repeated payloads with different trip IDs remain distinct requests; duplicate user IDs violate the stated primary key. The statement does not establish a separate null-data extension; no invented null/unknown-status behavior was required.

A normal Chromium visit to the official submissions page with `?lang=pythondata` stopped at Cloudflare security verification; no bypass was attempted. Live selector/interface inspection is therefore unavailable. Pandas Schema on the retrieved statement and lesson-local `provenance/official-capture.md` corroborate `trips_and_users(trips: pd.DataFrame, users: pd.DataFrame) -> pd.DataFrame`. This is the preferred Python solution, not a conceptual analogy. Non-Python language-contract/supportedLanguages requirements are inapplicable. Read `LANGUAGE_FILES`: Python requires solution.py, python-code.js and PYTHON_SOURCE, which are the actual audited pair/export.

## Canonical execution, invariants and cost

Inspected all five test programs before running. Python tests load the canonical file, check expected intermediate values and use a loop oracle. Browser tests honor OUTPUT_DIR; none regenerate candidate assets. The teaching test's phrase assertions support regression coverage but cannot themselves establish teaching depth. The rendered-state test's expected prefix totals agree with my independent arithmetic:

`[]; [(0,1)]; [(0,1)]; [(0,2)]; [(1,3)]; [(1,3),(0,1)]; [(1,3),(0,1)]; [(1,3),(0,2)]; [(1,3),(0,2)]; [(1,3),(0,2),(0,1)]; [(1,3),(0,2),(1,2)]`.

The actual code builds allowed IDs, performs two inner merges, filters inclusive dates, creates a copied working frame and converts non-completed statuses to integer cancellation indicators. The first merge preserves #1/#3/#4; the second retains them only while their drivers are active. Unique Users IDs guarantee at most one matching user per endpoint. The resulting 10-01 values [0,0,1] aggregate to 1/3. This maps the visible #4 transition to `status.ne("completed").astype(int)` followed by sum/count. Excluded #2 never reaches that group. A day with no eligible request produces no group, avoiding zero division. Termination is a finite complete scan/aggregation. The trace stores preset eligibility booleans and explicitly labels itself a simulation; its counts are independently checked against actual canonical results rather than treated as execution evidence.

Fresh **code check**, declared above before execution: actual canonical source returned exactly `[{"Day":"2013-10-01","Cancellation Rate":0.67}]`. Distinct duplicate-payload cancellations both counted. 09-30 and 10-04 were excluded; 10-02's banned-driver-only group was absent, defeating the client-only wrong rule. Empty Trips and all-banned Users each returned empty Day/Cancellation Rate columns. Separate inclusive-boundary execution returned 10-01=.00 and 10-03=1.00. Deep frame equality confirmed both original input frames unchanged. A separately written list/set oracle with seed 525262 matched canonical outputs on 120 cases varying bans, both cancellation types, the five boundary/interior dates, repeated payloads and empty inputs. These are runtime checks, not custom-input UI experiments.

The baseline now defines T/U and computes 12 date checks plus 64 user-row checks on a tiny example before generalizing. Its O(T+TU) time and O(1) extra storage fit its stated full scans and fixed three-day counters. The canonical two hash joins, filtering and grouping have expected O(T+U) time and O(T+U) extra space: unique user keys bound intermediate rows by T; at most three date groups remain, so key sorting does not add a growing date-sort factor. T=0/U>0 still requires the active-user scan and is covered by the additive U term; empty input does not invalidate the cost claim. Extra frame/lookup storage is distinguished from teaching-trace storage. Mutation is confined to a copied working frame and derived result.

Commands, all from repository root:

- `python3 -B scripts/register_leetcode_lesson.py 262 --validate-only` — separately confirmed exit 0, no output. Metadata complexity is exactly one nonempty string: `O(T + U) expected time; O(T + U) space`.
- `/tmp/venv262/bin/python -B leetcode/262/tests/test_solution.py` — exit 0, `oracle checks passed`.
- `/tmp/venv262/bin/python -B leetcode/262/tests/test_worked_bridge.py` — exit 0; worked intermediate tables, driver-ban case, transfer, 150 seeded oracle cases and input nonmutation passed, pandas 3.1.0.
- `OUTPUT_DIR=specs/reviews/262-evidence/262-review-5-ef47ed43/browser node leetcode/262/tests/test_browser.cjs` — exit 0, localized identity/state, trace, prediction, layout, exact source/copy/fallback/download passed, host Linux.
- `OUTPUT_DIR=specs/reviews/262-evidence/262-review-5-ef47ed43/states node leetcode/262/tests/test_rendered_states.cjs` — exit 0, every sample prefix, rewind/replay, Transfer endpoint and guarded formula passed in both locales.
- `OUTPUT_DIR=specs/reviews/262-evidence/262-review-5-ef47ed43/teaching node leetcode/262/tests/test_teaching.cjs` — exit 0, both prior teaching regressions and 320/390/1280 CSS zoom captures passed.
- Independent inline Python/Playwright checks described here also completed with exit 0. Existing NODE_PATH resolved Playwright; every launch used `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when set.

## Rendered semantics, transfer and access

Applied the rendered-state contract only after saving the cold record. Chromium 156.0.8078.4 on Linux. Checked initial, all sample prefixes, final, rewind/replay and reset; Transfer ends at 10-02=(0,1) and 10-03=(1,1). Previous/Reset are initially disabled; Next is disabled at completion. Changing preset resets the prefix. Choosing a prediction enables Reveal; changing a revealed choice clears feedback; revealing the wrong choice explains the same banned-driver exclusion. The quiz has its own fixed input, so preserving its answer across preset changes is consistent. Locale/width changes preserve preset, prefix, answer and revealed state.

Row cancelled/request columns are per-row contributions; daily cards aggregate the processed prefix. Rate cells for processed eligible rows show the current daily aggregate, while excluded/future rows show a dash. The card and table agree at the same instant; step 4 gives 1/3 even on earlier processed rows. Current-row highlighting is independent of keep/drop text and contributions. Initial zero contributions are distinguished from computed values by processed count and absent daily cards.

Inspected localization consumer and dictionary checking: duplicate-key detection operates before JSON parsing, all COPY definitions are unique two-string pairs, matching the consumer's [zh,en] convention. Rendered semantic checks include (0,1) surviving banned row #2, guarded numerator/denominator updates, the full division formula, active IDs, driver-merge exclusion, grouped sum/count, quiz correct/wrong feedback and clipboard fallback in both languages. Chinese/English H1, document title, html lang and toggle pressed state agree; the official URL is preserved. The exercise appears once as the fieldset legend.

The 968-byte canonical source equals the decoded mirror, rendered code `textContent`, clipboard success readback, fallback textarea and downloaded bytes, including final newline. Browser tests performed both locales' copy/download/fallback checks. Independently repeated fallback: seeded `review5-distinct-non-source`, forced clipboard write rejection, confirmed textarea focus and full selection, pressed actual Linux Control+C, and read back the exact canonical source. The source was never written into the clipboard as a substitute for the copy action. Expanded the source disclosure and checked its exact text; offline state retains the embedded code.

Keyboard Enter on Next advances; mobile Tab after Reset focuses the overflowing table and ArrowRight moves scrollLeft to 40. At desktop the table fits, so Tab skips its non-overflowing wrapper and reaches a radio; no need to scroll that instance. Controls have visible focus outlines. Captured/inspected 320/390/1280 in both locales at 100% and 200% CSS zoom while preserving sample prefix 4/10. At normal size page scrollWidth equals viewport width and the table scrolls inside its wrapper. At zoom 2, narrow pages reach scrollWidth 453 versus viewport 320/390; content is reachable with horizontal panning, but reading is cumbersome. Desktop remains within 1280. This is CSS zoom evidence, not browser-menu zoom verification. Closed Sample and Transfer labels are readable at 320; font stack is PingFang SC, Microsoft YaHei, system-ui, sans-serif; actual resolved font was not independently identified. Disabled Previous/Reset/Next/Reveal are dimmed but readable in inspected initial/endpoint images.

Independent sRGB contrast code used .2126/.7152/.0722 and calibrated black/white=21, red/black=5.252, green/black=15.304, blue/black=2.444 and #747474/black=4.492948 (below 4.5 without rounding). Actual sampled hint #9aa7b8 on #0f1722 is 7.37038; keep #8be6b1 on highlighted #153347 is 8.80190; drop #ffab88 on #0f1722 is 9.80530. These pass 4.5. Disabled controls use .4 opacity and were visually assessed, not held to active-text thresholds. This is sampled solid-color evidence, not a comprehensive composited-color audit.

Screenshots inspected include cold-desktop.png, en-320-zoom1.png, zh-390-zoom1.png, en-320-zoom2.png, zh-320-counts.png, zh-320-transfer.png, counts-headers.png, endpoint.png, fallback.png, states/en-driver-merge.png, states/zh-invariant.png, states/en-formula.png and teaching/en-1280-complete-bridge.png. The last element capture includes a sticky-nav capture artifact; settled viewport images corroborate its text. Scrolling to a table edge naturally clips columns outside the wrapper; no actual text intersection was demonstrated. Counts/headers remain reachable together through component scrolling.

## Earlier finding closure against this candidate

Read reviews 1–4 and the public-title report only after saving the cold record. No prior score or acceptance supplied this review's conclusion. For all entries below, status is **closed**, rechecked against `02e853e82c8f874a772b55068c25addcdcf26fee`; no separate historical fix hash is inferred. Owner was lesson author; no further action is required for these reproductions.

| Stable ID | Previous required gap | Current regression evidence and conclusion |
|---|---|---|
| FIND-262-001 | Output shape and pre-abstraction hand calculation missing | Cold step 1 names Day/Cancellation Rate and computes 1/3=.33 in both locales before tracing. Closed. |
| FIND-262-002 | Duplicate transfer question | Cold step 4 and DOM contain one question/legend; both locales' browser assertions pass. Closed. |
| FIND-262-003 | Missing Pandas causal bridge and baseline work | Cold step 5 supplies active IDs, #1/#3/#4 after each merge, matching/inner semantics, [0,0,1]→sum 1/count 3, and ban-driver/no-group counterexamples. Baseline counts 12 and 64 and explains expected hash lookup savings. Canonical intermediate and fresh-case checks agree. Closed. |
| FIND-262-004 | Invariant increment omitted eligibility guard | Cold prose/formula explicitly says excluded row changes neither count and eligible cancelled row adds numerator. Both locales' sample #2 keeps (0,1), including rewind/replay; all prefixes checked. Closed. |
| 262-PUB-R1 | Chinese heading/document title stayed English | Exact localized identities and preserved state pass roundtrips at 320/390/736/1440; Chinese is 行程与用户. Closed for this identity defect, not a publication claim. |

No new required finding was reproduced. Minor limitation: 200% narrow layout requires page panning; this is reflected in device scoring.

## Scores and conclusion

| Dimension | Weight | Score / 4 | Observation supporting score |
|---|---:|---:|---|
| Problem/terms/hand calculation | 15 | 4 | Concrete endpoint contrast, defined denominator/numerator, inclusive window, output schema and complete tiny day calculation precede abstraction. |
| Derivation/saved work | 20 | 4 | Explicit full-scan baseline, worked repeated lookup counts, matching/inner-join bridge and expected hash lookup savings; excluded cases explained causally. |
| Maintained state/correctness | 20 | 4 | Guarded prefix invariant, initialization, each contribution, termination, all rendered prefixes and canonical boundaries/duplicates agree. |
| Interaction/visual meaning | 20 | 4 | Predict/operate/reveal/change, retained history, daily versus row accounting, rewind/reset/endpoints and independent highlighting are reconstructable. |
| Python/cost | 15 | 4 | Faithful actual Pandas source executes independently, worked merges/grouping connect to visible arithmetic, exact source transfer and actual expected cost/nonmutation checked. |
| Bilingual/device | 10 | 3 | Equivalent reasoning, keyboard and internal scrolling work; narrow 200% CSS zoom requires horizontal page panning. |

Weighted score: **97.5/100**. Every dimension is at least 3; required open IDs: **none**. Outcome: **accepted** for the requested revision under the frozen rubric. This review is separate from publication.

Limitations: live official submission selector/interface blocked by Cloudflare, with normally retrieved statement and saved Python interface corroboration as described above. Automated Chromium observation does not establish real human comprehension. No successful LeetCode submission, publication, exhaustive screen-reader assessment or browser-menu zoom verification is claimed. Only this exact report and its exclusive evidence directory were written; earlier reports/evidence, implementation, tests, shared files, services and Git configuration were preserved.
