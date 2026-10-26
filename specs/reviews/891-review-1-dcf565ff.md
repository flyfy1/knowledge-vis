# Independent review: 891 — Sum of Subsequence Widths

Candidate: `0793086f7763ed855457033072313bc8af8eb427`. URL: http://127.0.0.1:18770/leetcode/891/. Review run: `891-review-1-dcf565ff`; reviewer is the current independent agent run (exact model identity unavailable). Target: basic Python, lists, loops, functions, elementary recursion. Frozen dimensions/weights: problem/terms 15, derivation 20, correctness 20, interaction 20, Python/cost 15, bilingual/device 10. Python canonical interpretation applies.

## Cold walkthrough — saved before any source, tests, author notes or earlier reviews

Only the frozen rubric was read before opening the live candidate with Chromium through Playwright. Initial desktop viewport 1280×900. Screenshots: `891-evidence/891-review-1-dcf565ff/cold-initial.png` and `cold-complete.png`.

1. **Question:** What counts, and what is a width? **Action:** Read step 1; independently predict widths for the seven displayed selections before revealing: 0,0,0,1,1,2,2, total 6. Click all seven cards. **Observed:** revealed 7/7, sum 6, and the explicit seven-term sum; full-range-only misses 4. **Causal paraphrase:** each nonempty choice of positions contributes max minus min, including nonadjacent choices, while singletons contribute zero. Bounds, modulus and distinct duplicate positions are explained before counting.
2. **Question:** Why abandon enumeration? **Action:** Read and hand-follow the baseline with 2 then 1. **Observed:** empty choice splits into keep/drop on each position; the page shows [[],[2]], then adds [1] and [2,1]. **Causal paraphrase:** copied lists and extrema scans repeat across exponentially many selections, costing O(n·2^n) time and storage. The [1,1,3] counterexample visibly explains why deduplication destroys choices (6 versus 2).
3. **Question:** What replaces enumeration, including ties? **Action:** Read the worked value-2 example, predict contributions −3,0,9 and totals −3,−3,6; press Next three times. **Observed:** first frame lists max {0}, min {0},{0,1},{0,2},{0,1,2}, before 0, term −3, after −3. Second lists two roles on each side and adds zero. Third lists four maximum roles and one minimum role, adds 9, final 6. Previous ledger rows remain. **Causal paraphrase:** one fixed owner is compulsory, earlier/later positions are independently optional, and the opposite side is excluded to preserve ownership. Unique rightmost maximum/leftmost minimum ownership handles ties. The invariant is the sum of contributions for processed sorted positions; negative partial values are unfinished accounting, not negative widths.
4. **Question:** Do rewind and duplicate positions preserve meaning? **Action:** Undo from the endpoint; change preset to [1,1,3], then finish. **Observed:** undo restores two processed positions, current i=1 groups and the first two ledger rows. New preset begins a separate trace; finish produces −3,0,9 and 6, with separate {0,2} and {1,2} rows both valued [1,3]. **Causal paraphrase:** equal values retain distinct positional selections; highlighting identifies the newly processed position while the ledger stores actual contributions.
5. **Question:** Does “middle means zero” transfer? **Action:** Before reveal independently calculate 2×(2−4)=−4 for [1,2,2,4], i=1. Deliberately select 0 and reveal, then change to −4 and reveal again. **Observed:** wrong feedback explains unequal optional-side counts and ties; changing choice hides the previous answer; correct feedback confirms −4 with the same reasoning. **Causal paraphrase:** cancellation requires equal role counts, not a vague middle location.
6. **Question:** How does this become Python? **Action:** Read step 5 and map the first visible transition to the displayed loop. **Observed:** `power[i] - power[n-1-i]` is 1−4 at i=0, `value=1`, and `ans` becomes 1000000004 instead of the browser's −3; adding 9 later returns 6. **Causal paraphrase:** reduction preserves the remainder class, sorted copy preserves caller input, linear count construction replaces expanded role groups. The page explicitly distinguishes the simulation from submission execution and states O(n log n) time/O(n) auxiliary space.

### Independent predictions recorded before code checks

The UI offers presets only. Fresh custom-input checks will therefore be **code checks**, not UI experiments. For [3,1,4], singletons contribute 0; pairs contribute 2,1,3; triple contributes 3: predicted total **9**. Sorted [1,3,4] gives −3+0+12=9. Fresh counterexample [2,2,5]: three selections containing 5 and at least one 2 each have width 3, so predicted **9**; deduplication incorrectly gives **3**. Boundary predictions: [100000]→0; [7,7,7,7]→0. These predictions precede source execution.

Cold reading conclusion: I could reconstruct the optimization and tie ownership from the page alone. This records reviewer reconstruction, not real human comprehension or a successful LeetCode submission. Source, official-statement, contract, executable, access and device audits remain pending at this checkpoint.

## Post-cold source, contract and execution audit

The rendered-state contract was read only after the cold walkthrough above was saved. `git rev-parse HEAD` returned the exact candidate revision. The only untracked changes during review were this report and its exclusive evidence directory. No earlier 891 review report was present, so there are no historical finding closures to claim.

### Official problem and canonical interface

Read the official statement normally at [LeetCode 891](https://leetcode.com/problems/sum-of-subsequence-widths/) through the web reader. Independently confirmed max-minus-min width, all nonempty position subsequences, modulus 10^9+7, examples [2,1,3]→6 and [2]→0, and both bounds 1…100000. A separate direct Chromium visit reached Cloudflare security verification; no bypass was attempted. The statement was accessible through the normal web reader, but the live language selector was not independently accessible in Chromium.

The local saved official response, `leetcode/891/provenance/official.json`, contains Python3's `class Solution` / `sumSubseqWidths(self, nums: list[int]) -> int` interface, matching the canonical file. Python is the preferred faithful language here, not a conceptual analogy. There is no non-Python language-contract exception to audit. Read `LANGUAGE_FILES` in the registration script: Python maps to `solution.py`, `python-code.js`, `PYTHON_SOURCE`.

### Candidate/source identity

Compared served bytes with checkout bytes for index.html, local style.css, app.js, copy.js, core.js, solution.py, python-code.js, shared ../style.css and ../common.js: all equal. Representative SHA-256 receipts:

| File | SHA-256 |
| --- | --- |
| index.html | e6b6ef4ad1a3b2cb80164600ddf1cb150af2a5c404488659ed7e59c2858c1599 |
| app.js | 617fa8ad3c965d0097e412f6df02b6e01c07209662b7494b536bb72ccaeb0cf8 |
| copy.js | 6ce0a747c35d8a153d0ee8796f82051aa143bea63030acfebc93196a0c090143 |
| solution.py | bff3b66679f6c62dec059328ad3aa5696be2af992cbef329bfb570103b1ee0eb |
| python-code.js | 30afac08add9bab7ecdda848232f1951109a7cd773c024d9451c3d1e332f16c9 |
| ../style.css | 6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27 |
| ../common.js | f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b |

The actual canonical file was imported and executed with Python, rather than treating the JavaScript simulator as execution evidence. For the pre-recorded independent code checks:

| Input | Prior prediction | Position-combination oracle | Canonical result | Input preserved |
| --- | ---: | ---: | ---: | --- |
| [3,1,4] | 9 | 9 | 9 | yes |
| [2,2,5] | 9 | 9 | 9 | yes |
| [2,5] (incorrect deduplication comparison) | 3 | 3 | 3 | yes |
| [100000] | 0 | 0 | 0 | yes |
| [7,7,7,7] | 0 | 0 | 0 | yes |

These are **code checks**, because arbitrary custom input is not exposed by the UI. The oracle enumerated combinations of positions and summed their actual extrema, independent of the contribution formula. The counterexample excludes the tempting deduplication rule without relying on an author's preset.

Read all four test implementations and their README before running. All emitters honor OUTPUT_DIR; none was run with its tracked default evidence destination. Commands run from repository root:

```bash
OUTPUT_DIR="$PWD/specs/reviews/891-evidence/891-review-1-dcf565ff" python3 -B leetcode/891/tests/test_solution.py
OUTPUT_DIR="$PWD/specs/reviews/891-evidence/891-review-1-dcf565ff" node leetcode/891/tests/test_core.cjs
OUTPUT_DIR="$PWD/specs/reviews/891-evidence/891-review-1-dcf565ff" node leetcode/891/tests/browser.cjs
OUTPUT_DIR="$PWD/specs/reviews/891-evidence/891-review-1-dcf565ff" node leetcode/891/tests/access.cjs
python3 -B scripts/register_leetcode_lesson.py 891 --validate-only
```

All exited 0. Metadata preflight produced no stdout. `lesson-entry.json` complexity is exactly the nonempty string `O(n log n) time; O(n) space`, not an object. No registration was run.

The canonical suite passed 3638 cases: exhaustive n=1…7 over values 1…3, 350 seeded cases up to n=11, examples/presets and four n=100000 checks. The large-case oracle counts selections crossing each adjacent sorted gap, independently of ownership contributions. Ascending and descending 1…100000 both returned 528504053; all 100000s returned 0; two equal-sized blocks of 1 and 100000 returned 690107415. The displayed baseline was also extracted and executed. Core tests separately enumerated extrema/owners and checked 3385 traces, 21848 frames and 687610 expanded role groups. Counts support correctness; the cold reconstruction supplies the teaching evidence.

### Correctness and cost reasoning

Sorting is a permutation of distinguishable positions: each selected position set corresponds to exactly one original-order subsequence. For any selected set, its greatest sorted index uniquely owns the maximum and its least sorted index uniquely owns the minimum. This remains true for ties, so excluding later positions for a maximum owner does not discard any selection globally; that selection belongs to its later owner instead. For i, exactly i earlier positions are optional in maximum roles and n−1−i later positions in minimum roles. Hence the net term and all ownership counts follow.

The simulator's frames are after adding one entire position term. At processed count k, ledger rows are exactly indices 0…k−1 and total is their sum. The two group lists describe k−1, not a later position. Independent dense-state check: [1,2,4,5], first three terms −7,−4,8, cumulative −7,−11,−3; the third frame renders `i=2, a[i]=4`, `Before -11 + this term (8) = after -3`, four maximum groups and two minimum groups. Final fourth term is 35, giving 32. Full rendered preset endpoints, in selector order, are 6,6,0,0,6,32, independently checked by subset extrema.

Canonical Python has the same processed-position invariant modulo mod. The power table's previous entry is initialized before use, n≥1 makes both boundary lookups valid, and the scan terminates after n terms. A singleton has both counts 1; equal-value arrays cancel; descending input sorts identically. `sorted(nums)` leaves the caller's list unchanged. Sorting is O(n log n), power construction and accumulation O(n); sorted copy, power table and sorting workspace use O(n) auxiliary space. Modular reduction keeps arithmetic bounded for the official domain. The displayed baseline genuinely stores O(n·2^n) elements and scans/copies that much work; its bound is valid for n≥1. Browser expanded groups/history are explicitly labeled extra teaching work, not charged to the canonical submission.

## Browser, bilingual and access observations

Browser: Chromium 156.0.8078.4, Linux host, Playwright through the available NODE_PATH; launch honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. All evidence below belongs to this candidate and this run, under `891-evidence/891-review-1-dcf565ff/`.

- **Control lifecycle:** both locales, every preset, every forward frame, undo/replay and endpoint. Initial Back disabled, endpoint Next/End disabled; undo restores the same groups, current position, retained rows and total. Reset removes ledger/groups and restores initial state. Preset change resets only the trace. Hand reveals/reset and prediction/reset operate independently. Disabled controls remain readable and do not advance state.
- **Prediction semantics:** all three options checked in both locales. The prompt and feedback concern only i=1's contribution in [1,2,2,4], never the whole-array total. Wrong zero explains asymmetry; wrong +4 explains the reversed sign; correct −4 confirms two maximum versus four minimum roles. Choosing another option clears the revealed answer. Locale switch preserves choice and revealed meaning. Reset clears choice and disables reveal.
- **Bilingual binding:** the copy dictionary is parsed with duplicate-key rejection before JavaScript evaluation; all 83 entries are nonempty two-string pairs. Read the actual Chinese and English reasoning, not just keys. Bounds, baseline, sort correspondence, role counts/exclusions, ties, partial negative totals, modular mapping and costs convey equivalent reasoning. Rendered formulas retain the full `a[i] × (2ⁱ − 2ⁿ⁻¹⁻ⁱ)` and sum limits. At 320px an independent zh→en→zh roundtrip with preset [1,2,4,5], k=2 and the revealed +4 distractor retained the −11 ledger and sign-error explanation; H1 and document title exactly matched each locale's metadata, including #891.
- **State versus emphasis:** done cells have text “Done” and green bottom edges, current done cell has “Just added · Done” plus cyan outline, pending cells explicitly say “Pending”. The Chinese equivalents remain distinct. The current ledger row is separately marked. Checked duplicate-value state k=2 at 320px and magnification, plus rewind/replay; equal numeric values do not erase positional/current labels. Keyboard focus has its own orange outline rather than changing algorithm state.
- **Keyboard:** Tab reaches Next from Back; Enter undoes/replays one position, with the expected row count. Step navigation and related links activate by keyboard. Focus outlines are 3px and tested controls have at least 48px hit heights. Native radio controls have full clickable labels. Source pre elements are focusable and horizontally scrollable where needed. Locale changes via the test's programmatic activation preserve an already focused lesson control.
- **Device/layout:** checked 320, 390, 736 and 1440 CSS-pixel widths in both locales, plus initial 1280px cold view. No page overflow or measured overflow inside position/group/ledger text. Inspected screenshots include `roles-320-en.png`, `roles-320-zh.png`, `ledger-390-en.png`, `quiz-320-zh.png`, `trace-320-en.png`, `trace-320-zh.png`, `zoom-200-en.png`, `zoom-200-zh.png` and `independent-roundtrip-320-zh.png`, along with the cold full-page capture. Wrapped labels/position sets remain associated with their values; no reproduced text collision. Sticky navigation is horizontally scrollable on narrow screens, and ordinary anchored navigation keeps section starts below it.
- **Selected-value fit:** all six closed preset labels tested at all four widths in both locales, with a 20px native-arrow reserve. Minimum measured spare text budget is approximately 146px; inspected 320px closed [1,2,4,5] is fully visible. CSS font stack is `"PingFang SC", "Microsoft YaHei", system-ui, sans-serif`; exact resolved glyph fonts are not claimed.
- **200%:** CSS root zoom=2 at 1440px, both locales; screenshot inspection shows readable current/done/pending positions, input, counts and role headings, without page-wide overflow. Active navigation remains step 3 while reading its trace. This tests 200% magnification/reflow; native browser-chrome zoom and physical mobile devices were not measured.
- **Contrast:** calibrated each test's actual `lum` helper, extracted from the frozen test source, against black, white and all RGB primaries. White/black=21; green weight=.7152; #747474/black=4.492948073111701 correctly fails 4.5 without rounding. Actual solid-color pairs passed: muted position labels 6.4494, explanatory text 12.6156, body text 16.0870; disabled endpoint Next 13.1007 at opacity 1. Focus outline against tested backgrounds ranges 8.9372…10.7316. This is representative rendered solid-color evidence, not an exhaustive transparency/gradient or screen-reader audit. Forced-colors focus and reduced-motion paths also pass.
- **Exact source transfer:** canonical bytes equal decoded mirror, window export and rendered code `textContent`, successful clipboard readback, and downloaded solution.py, including final newline and indentation. Each English and Chinese manual fallback attempt first writes and reads back a distinct sentinel (`891-fallback-en-1792975955482`, `891-fallback-zh-1792975960646`), then forces automatic write failure, invokes Copy, verifies focus/full selection/source, and uses actual Linux **Control+C**. Clipboard readback equals canonical source exactly. Locale switching preserves visible fallback content; successful retry hides it. No whitespace trimming or newline normalization is used.
- **Related links:** keyboard-followed in both locales at narrow width. #828 → `/leetcode/828/#step2` actually teaches contribution by a character occurrence with neighboring equal-character boundaries; #940 → `/leetcode/940/#step0` explains merging the two positional “a” choices in “aa” into one distinct string. Both served destinations match their labels. No publication or target-lesson acceptance is inferred.
- **Runtime paths:** no page errors, failed assets or external runtime requests. Denied localStorage still permits locale switch and trace operation. File/offline view loads full source and advances the trace.

Machine-readable rerun evidence: `solution-result.json`, `core-result.json`, `browser-result.json`, `access-result.json`, `asset-diagnostics.json` and `focus-measurement.json` in this run's exclusive directory. Screenshot inspection and independent reasoning above are separate from their pass flags.

## Findings and scores

No required finding was reproduced. Required open IDs: **none**. No earlier finding was closed or overwritten. There is no repair owner/fix revision to assign because this review requests no changes.

| Dimension | Weight | Score (0…4) | Observation supporting score |
| --- | ---: | ---: | --- |
| Problem, terms, hand calculation | 15 | 4 | Seven concrete selections precede abstraction; width, positions, nonadjacency, duplicate multiplicity, modulus and bounds are explicit; independently predicted/revealed total 6. |
| Causal derivation and saved work | 20 | 4 | Executable enumeration exposes copied/scanned lists, then a fixed-value example derives optional/excluded sides; unique tie owners explain exactly what replaces repeated enumeration. |
| Maintained state and correctness | 20 | 4 | Initialized invariant, after-step boundary, simultaneous before/term/after values, group counts and termination all reconstruct; fresh code cases, duplicate groups and n=100000 boundaries agree. |
| Interaction and visual meaning | 20 | 4 | Predict/reveal/change, per-position forward/undo, retained ledger, independent resets and explicit status text make data and emphasis intelligible; endpoint results match independent extrema sums. |
| Transfer to Python and cost | 15 | 4 | Actual canonical Python executed; visible first transition maps to the modular loop, powers and sorted copy; input preservation, full source parity and both baseline/optimized costs verified. |
| Bilingual and device access | 10 | 4 | Equivalent causal explanations and feedback, complete rendered formula/identity, state-preserving locale roundtrip, keyboard operation, readable narrow/magnified states and calibrated contrast checks. |

Weighted score: **100/100** (`Σ weight × score/4`). Every dimension is ≥3, no required finding remains, and browser/source/execution/metadata evidence is complete for this review's declared scope.

## Conclusion and limitations

**Accepted** for independent lesson review at candidate `0793086f7763ed855457033072313bc8af8eb427`. This is separate from publication. The custom-input experiments were canonical code checks, not UI experiments. Direct Chromium access to the official page was challenged; normal web-reader statement access succeeded, and the saved Python interface matches the executed canonical implementation. Physical devices, other browser engines, native browser-chrome zoom and real novice comprehension were not tested. No successful LeetCode submission is claimed. No implementation, tracked author evidence, service, shared file or earlier review was changed.
