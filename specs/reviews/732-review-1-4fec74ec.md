# Independent review — My Calendar III (#732)

Candidate: `5307111adcf48808992cac7f3f242bc9f5728ffa`. URL: http://127.0.0.1:18786/leetcode/732/. Review date: 2026-10-25. Reviewer: this independent review run; exact model identifier unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen weights: 15/20/20/20/15/10.

## Cold walkthrough (saved before opening source, tests, briefs, or earlier reviews)

Only the frozen rubric was read before the real Chromium browser walkthrough. Browser navigation and rendered DOM text supplied the observations below. No author notes supplied explanations.

| Teaching step / question | Action | Observable result | My causal conclusion |
|---|---|---|---|
| 01: Which instant is busiest? | Read three labeled interval rows; inspect time 4 initially, then click 5 and 6. | Counts change from `1+1+0=2` to `0+1+1=2` to `0+1+0=1`. Filled starts/open ends and exact labels distinguish endpoints. | End time is excluded; exchanging an ending event for a starting event cannot create a third overlap. Returns count simultaneous events, not pairs. |
| 02: Why keep only endpoints? | Read the small-domain cell loop, then manually add the printed deltas. | Baseline scans a width U; sorted changes for two events give 1,2,1,0. Adding [5,6) changes delta[5] −1→0 and delta[6] 0→−1; totals become 1,2,2,1,0. | Counts are constant between coordinates, so retaining changes saves the billion-cell scan. Grouping equal coordinates excludes the false transient peak. The explanation defines sweep, prefix sum and invariant and proves each interval contributes exactly its active status. |
| 03: How does one booking become a return value? | Click Next through all 14 operations, inspecting each row and history. | Operations 1–3 add [2,5), then process 2 (active/best 1/1), 5 (0/1), return 1. Operations 4–8 add [4,7), process 2,4,5,7 with active 1,2,1,0 and best 1,2,2,2, return 2. Operations 9–14 add [5,6), visibly change delta[5] −1→0 and delta[6] 0→−1, reset sweep; process 2,4,5,6,7 with active 1,2,2,1,0 and best 1,2,2,2,2, return 2. Pending rows have dashes, scanned rows numbers; completed-call history persists. | Adding an event mutates the accumulated dictionary, but each call restarts active/best. Best during an incomplete sweep is provisional; the final active=0 is not the answer. Zero-delta row 5 correctly leaves active unchanged. |
| 04: Can a shared endpoint inflate the count? | Predict 2 for adding [2,6) after [1,4),[4,8), select 2, then reveal. | Feedback says correct, gives deltas 1:+1,2:+1,4:0,6:−1,8:−1 and sums 1,2,2,1,0; explains both wrong choices. | New event overlaps each old event but never both at once; processing starts before ends would invent 3. The exercise transfers the invariant to different values, though repeats the same endpoint trap. |
| 05: How does state survive calls? | Read code explanation and expand complete Python source. | Constructor stores delta; book uses get(...,0), sorts keys, accumulates active and best, returns after loop. Printed costs distinguish per-call, total, Python storage, and browser snapshots. | Operation 12 maps to `active += self.delta[time]` with 2+0=2, then `best=max(best,active)`=2. Dictionary persists across calls; temporary sweep variables do not. |

Fresh independent prediction, recorded in commentary before execution/reveal: `[2,4),[4,6),[3,5),[4,5)` should return **1,1,2,3**. Counterexample `[0,1),[1,2)` should return **1,1**, defeating an inclusive-end rule. The UI offers presets only, so these will be **code checks**, not custom UI experiments. At coordinate 4 in the fresh example, net change is +1 and active goes 2→3; zero at 6 terminates the sweep. No code check has yet been used to fill a cold-walk explanation.

Cold screenshot captured: `732-evidence/732-review-1-4fec74ec/cold-desktop.png`. Screenshot inspection and subsequent audits follow below. One attempted radio selection used the button role and timed out; the corrected label click successfully revealed the answer. No product failure is inferred from that automation mistake.

## Post-cold source and official-contract audit

Read `specs/leetcode-rendered-state-contract.md` only after saving the cold walkthrough. Audited `solution.py`, `python-code.js`, `core.js`, `app.js`, `copy.js`, `index.html`, local CSS, shared locale consumer, metadata, registration language table, and test implementations before running them. Subsequently read the author self-check and official provenance to evaluate their claims; neither supplied missing cold-walk reasoning. No earlier review for #732 was found under `specs/reviews`; no earlier required finding is being closed by this report.

HEAD matched the requested revision. Initial git status contained only this run's report/evidence additions. The served bytes of index.html, app.js, core.js, copy.js, style.css, solution.py and python-code.js matched checkout bytes individually. Key SHA-256 receipts:

| Asset | SHA-256 |
|---|---|
| index.html | `7b908042a7c69b97eef01bb4a7b4a06b0e64dada82b85bffc039d562e681a5bc` |
| app.js | `52446d0bd297956bc18134bfeed6acf1100191253d9751ac97c656ab1a4f2ec4` |
| core.js | `f1341f0328082ee2a427fbb53c5fd54f6158d3b0d2d538c2e1153961632ef1c5` |
| copy.js | `87c407f30b27c71828a9966f9aee6650108b36fe2a76f339c59b643a0c736fa1` |
| solution.py | `39cc22bb510a97d7e8328e5a1178b2b4ae5c5c621c8c8559e486b9f12e058c8c` |
| python-code.js | `219ee53d5d7921b8c7c33ffa32a53a9a6e03f9a1b7ba9e749766c3614cf62d70` |

Opened the [official statement](https://leetcode.com/problems/my-calendar-iii/) normally with web browsing. Its visible statement confirms nonempty common intersection, half-open input, persistent calendar, integer result after every booking, bounds 0 through 10^9, at most 400 calls, and example returns 1,1,2,3,3,3. No access bypass was used. The lesson-local saved official Python3 snippet has precisely `MyCalendarThree.__init__` and `book(self, startTime: int, endTime: int) -> int`. The canonical implementation is faithful Python, so a non-Python language-contract/supportedLanguages audit is inapplicable. The registration script's `LANGUAGE_FILES` explicitly specifies `solution.py`, `python-code.js`, `PYTHON_SOURCE`; these exact assets were checked. No conceptual analogy is advertised as original code.

The canonical code groups additions and subtractions into the same dictionary entry, retains that dictionary, and resets only active/best. Sorted traversal covers all constant-count regions; after the final endpoint active=0 and best records the peak from earlier coordinates. It accepts duplicates and conflicts, uses no return-history side effects, and does not mutate a caller-owned booking list. Two average O(1) dictionary updates plus sorting u≤2b keys and a linear scan justify O(b log b) per call, O(b) auxiliary/persistent space, and O(B² log B) total worst-case sorting work. Browser deep-copy snapshots are separately identified; O(B³) snapshot storage is plausible because O(B²) frames each retain O(B) data. That cost is not charged to Python.

### Independent execution and tests

Executed actual canonical bytes using Python `compile`/`exec`, not the browser trace. Fresh predicted case returned **[1,1,2,3]**; independent counterexample returned **[1,1]**. At coordinate 4 in the fresh case, contributions are 0+1+1+1=3, matching its prefix total. Additional independent checks:

- 400 copies of [0,10^9) return 1 through 400.
- [0,1), [999999999,10^9), [1,999999999) return 1,1,1; touching at either boundary adds no overlap.
- 50 independently seeded sequences of 40 intervals from coordinates 0..30: 2,000 calls checked against direct unit-cell membership counts. At every stored endpoint, sum of deltas through that coordinate equaled direct event membership; total delta remained zero. Input sequences were unchanged and separate instances had independent dictionaries.
- No output is required before any booking, and the empty constructor state is an empty dictionary. Positive-length integer intervals are the stated contract; invalid or zero-length bookings need not be supported.

All inspected tests were run from the repository root with `OUTPUT_DIR="$PWD/specs/reviews/732-evidence/732-review-1-4fec74ec"` for evidence-producing tests, and Python bytecode disabled. Commands/results:

| Command | Observed result |
|---|---|
| `python3 -B leetcode/732/tests/test_solution.py` | PASS: 1,314 sequences, 7,034 calls; actual canonical Python, direct membership and tiny-domain cell checks, invariants and mirror equality |
| `node leetcode/732/tests/test_core.cjs` | PASS: 13,210 frames; direct membership independently verifies prefix state and completed history |
| `python3 -B leetcode/732/tests/test_copy.py` | PASS: 86 unique bilingual pairs; duplicate detection occurs while parsing, before duplicate keys can disappear |
| `node leetcode/732/tests/browser.cjs` | PASS: 212 state checks, 17 screenshots; actual browser interactions and source transfer |
| `node leetcode/732/tests/capture.cjs` | PASS: final ledger, right-side columns and headers captured in both languages |
| `python3 -B scripts/register_leetcode_lesson.py 732 --validate-only` | Exit 0, no output. Ran the safe non-mutating preflight; no registration performed. |

`lesson-entry.json` complexity is exactly one nonempty string: `O(b log b) time per book; O(b) space; O(B² log B) time for B calls`. Its time/space claim matches the audited code. Generated JSON retains the harness's own `scope: author self-check` label; here it records this independent run's rerun of that harness, not a separate reviewer identity. Author counts were reproduced, but acceptance is based on the causal walkthrough and independent observations as well as these computations.

## Rendered-state, access and transfer observations

Browser: Playwright Chromium 156.0.8078.4, Linux, executable from `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`, packages resolved through NODE_PATH. The full frame sequences of all five presets were exercised in English and Chinese. Final histories agreed with independent direct-membership expectations: hand 1,2,2; official 1,1,2,3,3,3; touching 1,1; duplicates 1,2,3; large times 1,2,3. Back/replay restored ledger/history; reset restored empty state; finish reached the last operation. Back is disabled initially; next/finish are disabled at the end. Completed-scan text says best is the return value, while intermediate scans explicitly say provisional. There is no identity/maximum mismatch: the last hand endpoint 7 has active 0, best 2, and book(5,6) returns 2.

Prediction reveal starts disabled, each choice has appropriate correct/incorrect feedback, and changing a choice clears prior feedback. Locale switching preserves selected answer and revealed reasoning; trace reset leaves the independent quiz intact, as described. Changing preset resets only the experiment. Keyboard Enter and Space advance steps; Enter opens/closes source disclosure; locale button focus is retained. Focused table ArrowRight, after allowing scrolling to settle, moved scrollLeft from 0 to 40px in both locales. A first immediate sample before animation settled was 0; this was rechecked rather than reported as failure. Scroll and focus do not alter algorithm state. Deep links settle below sticky navigation.

Independent dense-state check: large-times preset, operation 12/15, 320px, both locales. Coordinate 3 visibly gives active=2+1=3 and best=max(2,3)=3; rows 0,1,3 are scanned with 1,2,3 and rows 4,999999999,1000000000 remain pending. Prior returns remain 1,2. Locale switching retains all numerical state and correctly translates pending/scanned and provisional wording. Formula renders complete `Σ(t ≤ x) delta[t]` in both languages, and the interval-contribution proof has the same three cases. Hand counts at 4/5/6 and all quiz options were checked semantically, not just for key presence. Source parsing confirms all 86 localized values are nonempty two-string pairs consumed as [zh,en].

Widths 320,390,736,1440 and desktop cold width 1280 were exercised. Both locales were checked at 200% CSS zoom at 1280px, with reflow/overflow checks; this is explicitly CSS zoom, not browser-chrome zoom or physical-device proof. No page-wide horizontal overflow was found. Table scroll is intentional: headers and row values remain aligned, and keyboard scrolling exposes the right-hand best/status columns. The large-coordinate event [3,4) is subpixel on the billion-unit plot; its exact label and ledger provide the readable values, and the plot announces one proportional scale. At 320px selected labels are complete, including `Large times · 3 events` (measured 163.49px versus 202px available after padding and 24px arrow allowance). CSS font stack is 16px PingFang SC, Microsoft YaHei, system-ui, sans-serif; an exact resolved native font is not asserted. No platform-specific earlier finding required closure.

Disabled controls retain opacity 1 and readable muted foreground. Measured minimum text contrast was 7.165:1, focus contrast 9.015:1, border contrast 6.520:1. Controls tested at least 48px high; keyboard focus uses a visible 3px outline, including forced colors. The automated contrast sampler treats a nearly opaque nav surface as its RGB color; independently checking the disabled foreground #9aa7b8 on #1c2330 gives 6.52:1, still readable. No actual text intersections or clipped essential state values were observed in inspected settled screenshots.

Exact source fidelity passed without trimming: canonical file, decoded offline mirror, DOM `textContent`, actual clipboard API readback, and downloaded bytes, including final newline. Forced clipboard write rejection exposed the entire readonly fallback; it was focused and fully selected. A distinct non-source sentinel was seeded in each locale, Linux **Control+C** dispatched, and actual clipboard readback equaled the canonical source. Source disclosure was separately keyboard-operated. Local file source rendering and blocked-localStorage behavior passed. Browser suite reported no page/console/network errors.

### Screenshots captured and actually inspected

All paths below are within this run's exclusive evidence directory `732-evidence/732-review-1-4fec74ec/`:

- `cold-desktop.png`: full teaching progression and completed hand trace.
- `en-390-trace.png`: updated delta −1→0 and new −1, controls and interval labels.
- `independent-en-320-large.png`, `independent-zh-320-large.png`: dense intermediate operation and selected preset.
- `independent-en-320-large-left.png`, `independent-zh-320-large-left.png`: full long endpoint identifiers and scanned/pending numbers.
- `independent-en-320-large-right.png`: retained row associations, best and status with focused scroll region.
- `en-320-final-ledger.png`, `zh-320-ledger-right.png`: final active 0, best 2 and complete return history.
- `zh-1440-trace.png`: desktop grouping explanation, update state and interval geometry.
- `en-zoom200.png`, `zh-zoom200.png`: enlarged, wrapping intermediate scan readouts.
- `en-fallback.png`: full selected canonical source, including last return line.
- `zh-prediction.png`: incorrect-choice explanation, full delta/prefix chain and excluded endpoint reason.

Other generated captures and JSON are retained in the same directory, but are not claimed as individually inspected. The cold full-page image's sticky-nav location depends on capture scroll position; ordinary viewport captures and deep-link geometry establish actual navigation behavior.

## Findings and scoring

Required finding IDs: **none**. Required open findings: **none**. No prior findings are closed or rewritten. No candidate file or author evidence was modified.

Minor observation `732-R1-N1` (advisory, low severity, open suggestion): Step 05, candidate above, EN/ZH, any viewport, expand complete source after the functions-level explanation. `self`, `__init__`, type annotations and a dictionary-backed object arrive quickly for the stated reader. The text explains constructor persistence, get(...,0), sorting, and the exact transition, so the mechanism remains reconstructable; a short syntax gloss would reduce friction. This is not an unfilled causal bridge or a required violation. Suggested owner action: lesson author may add a brief class/object gloss in a later revision. No fix revision or regression closure is claimed.

| Dimension | Weight | Score (0..4) | Observation-based rationale |
|---|---:|---:|---|
| Problem/terms/hand calculation | 15 | 4 | Tiny three-event picture precedes abstraction; included/excluded endpoints, simultaneous count, accepted conflicts, bounds and manual counts are concrete. |
| Causal derivation/saved work | 20 | 4 | Unit cells explain continuous time with integer endpoints; billion-cell cost motivates changes; two-event calculation then a zero-change endpoint provides a gradual bridge; shared-endpoint and pair-count mistakes have concrete counterexamples. |
| Maintained state/correctness | 20 | 4 | Explicit invariant and per-interval proof cover included/excluded cases, zero deltas, sorted traversal and termination; complete intermediate ledger distinguishes persistent booking state from reset scan variables. Independent cases verify all these claims. |
| Interaction/visual meaning | 20 | 4 | All 14 cold operations were reconstructable; update before/after values, pending dashes, provisional best and retained completed-call history agree. Prediction/reveal/change and reversible controls behaved as described. Numeric state is not inferred from decorative focus. |
| Python/cost | 15 | 3 | Executable canonical interface, exact source transfer, concrete operation mapping, mutation behavior and accurate per-call/total/space costs pass. Minor class/dictionary syntax friction remains for the stated functions-level reader (N1). |
| Bilingual/device access | 10 | 4 | Reasoning, proof, counts and feedback agree across locales; state survives locale switches; narrow selected labels, long endpoint identifiers, keyboard table access, disabled text and enlarged layout were observed readable. |

Weighted total: **96.25/100** = 15 + 20 + 20 + 20 + 11.25 + 10. Every dimension is at least 3. **Accepted** for the identified candidate and this review scope, with zero required open findings. This is separate from publication.

Limitations: headless Chromium on Linux only; no real-phone, other-OS/font, screen-reader, browser-chrome zoom, or production-delivery claim. This is an independent reconstruction, not measured human comprehension. No LeetCode submission was made or claimed. The browser trace is a simulation, and actual Python was tested separately. No implementation, shared files, tests, services, earlier reviews/evidence, Git configuration, or registry were changed.
