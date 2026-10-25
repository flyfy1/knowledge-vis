# Independent review: 668

Candidate: `35361f0d0b2d73579b8c4b03ad9328b4fb0a2ca6`. URL: http://127.0.0.1:18783/leetcode/668/. Target: basic Python, lists, loops, functions, elementary recursion. Reviewer: this independent review run; no named human or exact model identity asserted. Frozen weights: 15/20/20/20/15/10; canonical interpretation: faithful Python submission.

## Cold browser walkthrough (saved before source inspection)

Read only the frozen rubric before opening Chromium with Playwright, desktop 1440×1000. Read the rendered lesson, operated the controls, expanded the displayed submission, and captured cold-initial.png and cold-operated.png; inspected cold-operated.png before opening source (cold-initial.png was inspected later during audit). No BRIEF, implementation file, test output, prior review or author evidence was opened. Displayed submission text is part of the lesson, not a source-file audit.

| Step | Question | Action | Observable result | Causal conclusion in my words |
|---|---|---|---|---|
| 1 Count cells first | What exactly is ranked? | Read the 3×3 table and manually sort its nine entries | 1,2,2,3,3,4,6,6,9; fifth outlined item is 3 | Every position contributes a rank, including equal-valued positions. The output is a value, not coordinates. Row order gives 4 and deduplication gives 6, exposing two wrong rules. |
| 2 Row contribution | How can a threshold be counted without sorting? | Read x=3; move threshold to 4 then 5 | Contributions change 3+1+1=5 to 3+2+1=6; x=5 keeps the same six marked cells | In row i, qualifying columns satisfy j≤floor(x/i), clipped to n. Increasing x can leave the count unchanged because no product occurs at the new threshold. Marks denote eligibility, not changed cell values. |
| 3 Eliminate values | Which side is safe to discard? | Complete all three rounds; go back once | [1,9]→[1,5] at 5→6; [1,5]→[1,3] at 3→5; [1,3]→[3,3] at 2→3. Back restores round 2 and two history rows | Too few qualifying positions excludes mid and everything below it. Enough positions keeps mid as a possible first sufficient value. History records completed rounds. Final marks remain for tested 2 while the answer is 3, explicitly labeled separately. |
| 4 Predict/reveal | Is a sufficient mid the final answer? | Independently count 3×4 at x=6 as 4+3+2=9; select C and check | Feedback explains hi=6, interval [1,6], and why A's count/early return and B's direction fail | Sufficiency supplies an upper bound; duplicate ranks mean count may exceed k, so convergence is still necessary. |
| 5 Proof/Python | Why does this terminate, and which statements implement it? | Read proof and cost; expand Python | Inclusive bounds, C(lo−1)<k≤C(hi), strict shrinking, return lo; displayed loop and count match the experiment | The first sufficient value stays enclosed. A sufficient midpoint must be retained. At equality of bounds that sole candidate is the answer. Per round only the shorter dimension is scanned after the symmetry swap. |

The lesson grows from a nine-cell hand calculation through floor/clipping and monotonicity to interval search; floor, sigma, threshold, invariant, and binary search are explained locally. Baseline storage of 900 million products motivates avoiding materialization. The transfer exercise changes dimensions and requires a clipped count and branch choice rather than repeating the default trace.

### Fresh predictions recorded before independent execution

UI offers presets only, so the following will be **code checks**, not custom browser experiments. Fresh input (m,n,k)=(2,4,5): products sorted are [1,2,2,3,4,4,6,8], predicted answer 4. Expected rounds: [1,8], mid4 count6→[1,4]; mid2 count3→[3,4]; mid3 count4→[4,4]. Invariant C(lo−1)<5≤C(hi) must hold after each update.

Fresh counterexample to “find C(x)=k / return any sufficient mid”: (2,4,4), predicted answer 3; C(4)=6 is sufficient but 4 is not the fourth value. For k=5, counts jump from C(3)=4 to C(4)=6, so equality to 5 never occurs. This independently tests why the condition is ≥ and why sufficiency alone does not justify immediate return. These predictions precede source/runtime checks below.

Cold walk saved. Source, contracts, official statement and tests may now be inspected.

## Source, official contract and computational audit

HEAD equals the requested revision. Served index, core, app, localization copy, local CSS, offline mirror and Python bytes equal the checkout; shared common.js and style.css also match served bytes. Canonical solution SHA-256: `1a23f6713520b655db64d0daf66ac8536aa523b8f19c3fc459b522f4599e4daa`; index: `c877b645547d5d8d6a1a5beb5ff9f18d202981ba63d107943c4556e4272aea31`; core: `b158ee4c2b7ac484c0dd116914ee9e2dfb69802e9b30eaebdaf0a4816543f9c9`; app: `cb0f4db3ebd93a515749f790b6e5900f5e3294d7a7272af1f7206f1f50ecfb2e`.

Read the [official statement](https://leetcode.com/problems/kth-smallest-number-in-multiplication-table/) normally through the web tool: it specifies 1-indexed i*j cells, integer m/n/k, both advertised examples and bounds 1≤m,n≤30000, 1≤k≤m*n. Lesson agrees. A normal independent public GraphQL GET returned 403; no retry or bypass. Saved lesson-local official-graphql.json contains Python3 `Solution.findKthNumber(self, m: int, n: int, k: int) -> int` and metadata specifying three integer parameters and an integer result. The actual canonical callable matches that interface and problem semantics. This is Python, so the non-Python language-contract/selector exception gate does not apply; no conceptual analogy is advertised as submission code.

Read `LANGUAGE_FILES` in scripts/register_leetcode_lesson.py: Python maps to solution.py / python-code.js / PYTHON_SOURCE. Read canonical solution, mirror, core, app, copy, index, shared locale helper and shared/local CSS. Count is reset on each round, scans all rows of the shorter dimension, clips each row, and retains the sufficient mid. Symmetry swap changes only local integer bindings, preserving multiplicities; no caller-owned mutable collection exists. No table or trace history is allocated in the submission. Thus O(min(m,n) log(mn)) time and O(1) auxiliary space under the stated unit-cost arithmetic model are justified; the baseline really materializes and sorts mn entries. Simulation history cost is explicitly separated.

Executed **the actual solution.py** using runpy and Solution().findKthNumber, not an analogy. The recorded fresh predictions matched: (2,4,5)=4, (2,4,4)=3, transposed (4,2,5)=4. Independent direct product enumeration checked all 2475 ranks for dimensions m=1..9, n=1..10. Boundaries independently executed: (1,1,1)=1, (1,11,7)=(11,1,7)=7, (30000,30000,1)=1 and (30000,30000,900000000)=900000000. Independently computed fresh rounds were [1,8] at mid4/count6→[1,4], mid2/count3→[3,4], mid3/count4→[4,4]; direct cell enumeration verified C(lo−1)<5≤C(hi) after each transition. Fresh core.trace(2,4,k) code checks for k=4 and 5 agree with the same products and Python results. These are code checks because the UI is preset-only.

Visual-to-code correspondence: default second completed round marks 3+1+1 cells at mid3 and displays count5; Python's count += min(n, mid // i) sums those exact row prefixes, then count>=k retains hi=3, transforming [1,5] into [1,3]. The final round marks at tested mid2/count3 while reporting updated [3,3]; this is deliberately before/after information, with explicit labels and explanations, not a mismatch. Initial frames count nothing; the 1×1 preset correctly converges without any count round.

## Inspected tests and reviewer execution

Read test_solution.py, test_core.cjs, browser.cjs, layout-audit.cjs and tests/README.md **before running them**. All four honor OUTPUT_DIR. Ran them with OUTPUT_DIR pointing only to this run's exclusive evidence directory; no tracked candidate or author evidence was regenerated. Generated receipts retain their original “author self-check” labels because these are reruns of author-written tests, not independent teaching judgments.

- `python3 -B leetcode/668/tests/test_solution.py`: exit 0, 6892 canonical-Python cases, exact mirror and duplicate-key checks passed. All 97 localization entries are unique nonempty two-string pairs with matching interpolation placeholders.
- `node leetcode/668/tests/test_core.cjs`: exit 0, 6390 cases / 44642 frames / 6516 threshold checks, including brute-force cell-count, invariant, shrinking and replay checks.
- `node leetcode/668/tests/browser.cjs`: exit 0, 44 rendered states, 10 layout observations, no recorded browser errors; exercises all six presets and all frames in both locales against enumerated products, rewind/replay, reset and jump endpoints.
- `node leetcode/668/tests/layout-audit.cjs`: exit 0, 28 supplementary checks; every selected preset label at 320/390, terminal grids and keyboard history scrolling.
- Required safe root preflight: `python3 -B scripts/register_leetcode_lesson.py 668 --validate-only`: exit 0, no diagnostic output. Read lesson-entry.json: complexity is exactly the single nonempty string `O(min(m,n) log(mn)) time; O(1) auxiliary space`.

No prior review report for 668 was found in specs/reviews other than this run's newly created report. No prior finding closure is claimed.

## Rendered semantics, source transfer and access observations

Applied the rendered-state supplement only after saving the cold walk. Read bilingual copy and inspected recorded rendered branches: initial/no-test, enough, too-few, convergence, formula and prediction explanations. EN and ZH default round3 both mean old [1,3], tested mid2/count3<5, exclude mid, updated [3,3]; the second round in both means retain sufficient mid3/count5 and hi3. Formula renders full `C(x) = Σᵢ₌₁ᵐ min(n, ⌊x/i⌋)` in both locales. No duplicate-key or array-shape discrepancy was found. Chinese and English both explain row clipping, skipped count, inclusivity, termination and symmetry with equivalent causal meaning.

Prediction reveal gives 4+3+2=9 and [1,6] for each option, with correct/incorrect status appropriate to selection. Changing choice hides old feedback; locale roundtrip retains selected choice, revealed feedback, trace position, open source and manual-copy state. Preset change resets only the search experiment; threshold and independent exercise remain unchanged as promised. Real keyboard Enter operates next and locale buttons, ArrowRight operates the round slider, and focused history scrolls horizontally to its reason column. Rewind/replay restores the complete snapshot, not only the answer. Both endpoint button states and initially converged 1×1 are consistent.

In both locales, browser `textContent`, the decoded offline mirror, successful Clipboard API copy, downloaded bytes and manual fallback all equal the canonical **419-character** source, including indentation and final newline, with no trimming. After simulated clipboard denial, textarea selects [0,419]; real Ctrl+C replaces a sentinel with that full exact source. Merely rendering the textarea was not treated as success. Storage denial and offline file opening still permit locale/trace operation; local links resolve and anchors exist.

Browser: headless Chromium 156.0.8078.4 on this Linux environment. Inspected screenshots include cold-operated, cold-initial (the latter inspected during audit), en-320-controls, zh-320-lab, en-390-lab, zh-1440-lab, en-copy-fallback, en-320-preset4-end, zh-320-preset5-end, en-320-history-right, zh-320-prediction, forced-colors, en-zoom200 and zh-zoom200-controls. Evidence is in [this run's directory](668-evidence/668-review-1-01c0aa5e/).

At 320/390 and desktop widths the essential matrix entries, labels and state values remain readable without intersection. At 320 history intentionally scrolls within its labeled focusable region; inspected right-edge screenshot exposes the update reason. Closed selected labels fit: largest measured label “3×3 · k=4 · Skipped count” is 186.59px, within a 262px control with 30px padding and the test's 16px Chromium arrow allowance. CSS font stack is PingFang SC, Microsoft YaHei, system-ui, sans-serif; this does not establish the exact resolved font or another platform's rendering. Controls wrap legibly. Real tab zoom was set through chrome.tabs.setZoom(2), verified DPR2 and innerWidth720 at outerWidth1440; inspected captures show readable controls and counted cells. No page overflow recorded.

Measured text contrast includes prose 12.62:1, hint 7.74:1, formula 13.40:1, counted cells/action button 13.10:1 and disabled back button 6.45:1 with opacity1. Disabled states are readable with dashed borders. Focus outlines are visible in inspected normal fallback/history and forced-color captures. Counts also use a literal ≤ marker, so color is not the sole meaning carrier.

## Findings, scores and conclusion

Required open findings: **none**. No implementation fixes made or requested. No earlier findings were closed without evidence.

| Frozen dimension | Score | Weighted points | Observation supporting score |
|---|---:|---:|---|
| Problem / terms / hand calculation | 4 | 15 | Nine concrete sorted cells establish duplicate ranks, 1-based coordinates/rank and value output before abstraction. |
| Derivation / saved work | 4 | 20 | Materialization baseline motivates row counting; floor/clipping and monotonicity justify both excluded and retained candidates, with skipped-count and wrong-rule counterexamples. |
| State / correctness | 4 | 20 | Full small trace, invariant, initial bounds, both branches, strict shrink and absent-product termination argument are reconstructable and agree with independent checks. |
| Interaction / visual meaning | 4 | 20 | Actual threshold and search actions expose meaningful values and retained history; tested midpoint and updated bounds have distinct semantics; prediction/change and replay work. |
| Python / cost | 4 | 15 | Faithful executable Python, exact transfer, fresh cases and boundaries verified; visible row prefixes map directly to code; symmetry and submission versus simulation storage are explained. |
| Bilingual / device | 4 | 10 | Equivalent rendered branch reasoning and formula; preserved state, keyboard access, scoped scrolling, readable narrow/zoom layouts and contrast checked. |
| **Total** | | **100/100** | All six dimensions ≥3; no required open finding. |

**Accepted for this candidate revision and review scope.** This is an independent lesson review, separate from publication. Limitations: no real novice comprehension study, physical-device or cross-platform font certification, or successful LeetCode submission is claimed. Live GraphQL/interface-selector access was unavailable (403); official statement was readable normally, and the saved official Python snippet plus executed callable establish the Python interface used here. Source/runtime, browser, parity, preflight and pedagogical observations support acceptance independently of author test counts.
