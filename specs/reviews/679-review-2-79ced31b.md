# Independent review: 679 · 24 Game

Candidate: bd886cc20fd3a3b3ed37f85605e1d15df1faf627. URL: http://127.0.0.1:18783/leetcode/679/. Review run: 679-review-2-79ced31b; no invented reviewer/model identity. Target: basic Python, lists, loops, functions, elementary recursion. Frozen rubric: specs/leetcode-review-gates.md; weights 15/20/20/20/15/10. Python interpretation applies.

## Cold browser walkthrough (saved before source, tests, briefs, or prior reviews)

Read only the frozen rubric first. Opened the candidate in Chromium through Playwright at 1365×900. This is an independent reconstruction, not measured novice comprehension. Initial and conclusion screenshots are in this run's exclusive evidence directory.

| Teaching step and question | Action | Visible observation | My causal conclusion |
| --- | --- | --- | --- |
| 01: What input/output and operations are allowed? | Read statement; advance all three hand operations. | Exactly four 1–9 cards, Boolean output, binary arithmetic with real division; boxes go [4,1,8,7] → [1,7,4] → [4,6] → [24]. Expressions and A–D card identities accompany values; history accumulates. | 8−4=4 and 7−1=6 use disjoint pairs; their product uses all four cards once. Parentheses permit independently evaluated groups, not just left-to-right arithmetic. |
| 02: What search is complete, and why keep fractions? | Read five shapes and hand-work the fraction example. | 24 orders × 64 operator triples × five groupings = 7680 candidates. [3,3,8,8] gives 8/(3−8/3)=24. The page explains 1+3, 2+2, 3+1 root splits. | Enumerating orders/operators alone misses grouping. Removing fractional intermediates removes a valid successful path. Pair reduction unifies shapes; the page does not claim a dramatic speedup. |
| 03: Why is a pair reduction legal and complete? | Advance each of seven search states from default. | State 1 shows [8,7,5] from 4+1. State 2 retains rejected child and says descendants omitted. State 3 restores [4,1,8,7]. States 4–6 show [1,7,4], [4,6], [24]. State 7 explicitly returns true. History retains failed child, return, sibling, success. | Each value owns a disjoint card group; their union remains A–D. A child shortens the list; return reuses the unchanged parent. A failed child need not reject a parent. Inner expression operations can be reduced in a legal order, so considering every pair/direction covers any expression. Omitted descendant failure is a stated computation to verify later, not a hand proof visible here. |
| 04: Does an unsuccessful branch imply an unsuccessful hand? | Before revealing, predicted failure for [−1,−1]: sums −2, products/quotients 1, differences 0. Selected second option, checked. | Correct feedback lists exactly −2,0,1, says negative values legal, and gives another parent path (7+8−3)×2=24. | Exhausting one final pair only rejects that child. Card ownership prevents borrowing an extra card. This tests transfer to a new negative-valued branch. |
| 05: How does a transition map to Python and cost? | Read prose, without opening source. | Explains current-list indices, rest excludes i/j, deduplicated candidates, new child list; [1,7,4] at positions 0/1 yields [4,6]. Four-card O(1), generalized bound and rational bit-cost caveat visible. | Parent preservation comes from constructing a new list, so no undo mutation is needed. Exact fractions make equality meaningful. Code and cost claims remain to be independently audited. |

Independent predictions recorded before any code execution: custom [2,2,2,3] should be true via (2+2)×2×3; custom [1,1,1,2] should be false (tempting wrong rule: any small positive hand can be arranged into 24). These are **code checks**, since the UI accepts only presets. The tentative maximum-6 hand argument is not an exhaustive proof with division; an independent exact oracle will settle it. Page counterexample [3,3,8,8] independently evaluates to 24 since 3−8/3=1/3; it defeats integer-only pruning. No author notes supplied explanations for this walkthrough.

Cold-walk limitations: source unopened; bilingual, keyboard, narrow-device, zoom, copy/download and runtime checks still pending. The page's self-check paragraph was encountered as rendered lesson content but was not treated as evidence.

## Post-cold source and official-contract audit

**Outcome: accepted for the identified candidate, 100/100; no required findings remain open.** This is a lesson review, separate from publication.

HEAD equals the requested revision. The served index, local CSS, copy, core, app, Python mirror, canonical Python, and shared common.js/style.css were compared byte-for-byte with checkout files; the seven lesson runtime/source files were also compared with immutable candidate Git bytes. No implementation changes were made. Representative SHA-256 receipts observed:

| Asset | SHA-256 |
| --- | --- |
| index.html | 617a75a8dbe1ac53712b60784774e9fc40e1159471bf548e7da78729f159a79a |
| copy.js | e31b0a2f73c43ec7b67e2cf59f58061d86586120b0d15f2cb4e38f92377cf980 |
| core.js | 7c840e142e867cf48fed959039513eaaadf71eb7f400bca5c6f3c32bf90b1d48 |
| solution.py | 53ee8883ad3f38573f124b67834e57bbbdd7a066fd7b686dc657950f142b53c8 |
| python-code.js | 46a64b77b26e902ed11197d1b7299054a08824f942e48302fe6809574d23df95 |

Read the [official statement](https://leetcode.com/problems/24-game/) normally after saving the cold walk. It confirms four bounded cards, real division, binary operators, no concatenation, Boolean result, and the two advertised examples. No access bypass or submission was attempted. The lesson-local official provenance includes the Python3 `Solution.judgePoint24(self, cards: list[int]) -> bool` snippet; the actual canonical file implements that callable. The normal statement page did not expose a live language selector in the text retrieval. This is a faithful Python lesson, so the additional non-Python language-contract/selector and supportedLanguages requirements are inapplicable. No conceptual analogy replaces the original executable interface.

Read `LANGUAGE_FILES` in scripts/register_leetcode_lesson.py: Python maps exactly to solution.py, python-code.js, PYTHON_SOURCE. All three match this lesson. The metadata complexity is one nonempty string: `O(1) time and O(1) auxiliary space for exactly four bounded cards`.

Required safe preflight, run from repository root:

`python3 -B scripts/register_leetcode_lesson.py 679 --validate-only`

Result: **exit 0, no stdout/stderr** (also rerun standalone to confirm the exit status). No registration or repair was performed.

## Executable behavior, invariant, and teaching depth

The hand calculation comes before generalization, and the progression is concrete pair values → five-shape baseline → fraction counterexample → state/ownership → child/return/sibling → transfer exercise → code. Terms such as state, invariant, fraction, child and parent are defined near use. The baseline's 7680 candidates include duplicates; the claimed improvement is replacing separate grouping-evaluation cases with a single rule, not an unsupported asymptotic acceleration. Commutative reversal and duplicate candidate values can be skipped because only reachability of 24 matters; subtraction/division retain both directions. A left-to-right accumulator loses grouping freedom. The small [3,3,8,8] example exposes an actual lost solution under integer-only pruning.

The partition invariant is explicit and visible through original-card labels. Every displayed state's identities partition A–D, including equal-valued cards; the new merged expression owns the union of its two inputs. `rest` excludes two **current positions**, so an original card cannot accidentally be reused. The actual Python retains caller lists by creating `rest + [value]`, rather than mutating and undoing them. The default rejected child [8,7,5] and unchanged restored parent are separately labeled, avoiding a before/after ambiguity. Failure endpoints show the original parent list and explicitly say all other branches are omitted. Intermediate 24 is not advertised as success while extra cards remain. Length decreases to one after three reductions, ensuring termination; singleton exact equality is the acceptance condition. Completeness follows by reducing a legal expression's available inner operations in order; soundness follows because all generated operations are legal and all cards stay represented exactly once.

Concrete code mapping: in values [1,7,4], i=0/j=1 give a=1,b=7, rest=[4], and b−a=6 is a candidate; recursive child [4,6] matches the visible transition. Caller [1,7,4] remains available after return. Fraction converts original integers into exact rationals; each denominator stays nonzero and normalized, with independent guards on the two division directions. Equal numbers are distinct positions even though identical resulting values can be deduplicated.

I separately wrote and ran a five-explicit-shape oracle using permutations and all operator triples with exact Fraction arithmetic. It does not use the submission's arbitrary-pair recurrence or production formatter. The actual canonical solution.py was imported and executed, not a browser analogy. Results:

| Input | Independently expected | Oracle / canonical | Check |
| --- | --- | --- | --- |
| [2,2,2,3] | true; (2+2)×2×3 | true / true | Fresh pre-recorded prediction; UI is preset-only, so code check |
| [1,1,1,2] | false | false / false | Fresh pre-recorded counterexample; exhaustive oracle settles the hand argument |
| [1,1,1,1] | false | false / false | Lowest values, duplicates, zero intermediates |
| [9,9,9,9] | false | false / false | Upper card boundary and duplicates |
| [1,9,8,3] | true; 9×8÷3×1=24 | true / true | Independently chosen mixed boundary case; Boolean agreement is the assertion |
| [3,3,8,8] | true; 8/(3−8/3) | true / true | Fractional grouping |
| [1,5,5,5] | true; (5−1/5)×5 | true / true | Intermediate below one |
| [4,1,8,7] | true | true / true | Official success |
| [1,2,1,2] | false | false / false | Official failure |

All inputs remained unchanged. Independently exhausted both three-leaf shapes/operators/orders for [8,7,5], confirming the default omitted subtree really fails. Traced 783 actual canonical search calls for [3,3,8,8]: every child had one fewer value, and each frame's list equaled its saved entry snapshot on return. This checks preserved caller state in executed code. Zero-divisor skipping, permitted zero dividends, negative and fractional paths, reverse subtraction/division and singleton termination were also inspected in source and the trace checks.

For fixed four bounded cards the search domain, depth, and fraction sizes are bounded: O(1) time/auxiliary space is appropriate. In the generalized explanation the branching product is at most ∏(m=2..n)6·C(m,2)=3^(n−1)·n!·(n−1)!; multiplying by O(n) copying bounds the stated time. Retained lists along one recursion chain sum to O(n²). The lesson explicitly excludes unbounded rational bit cost and separates stored teaching snapshots from submission space. No memoization or stronger speed claim is invented.

## Inspected tests and independent browser observations

Read every executed test before running it, checking that output locations were configurable. All generated outputs/screenshots were redirected into this run's exclusive directory. Existing results retain the scripts' literal `kind: author self-check` label; they are reviewer reruns of those inspected harnesses, not a substitute for the cold reconstruction or independent cases above.

Commands (repository root; each with `OUTPUT_DIR=specs/reviews/679-evidence/679-review-2-79ced31b`):

- `python3 -B leetcode/679/tests/test_solution.py`: PASS, actual canonical solver versus an independently structured interval-expression oracle for all 495 unordered hands (404 solvable) plus 200 seeded ordered cases; 6258 monitored calls.
- `node leetcode/679/tests/test_core.cjs`: PASS, 34 teaching frames, expression/value/card-identity agreement, rejected children, restored parent, immutable snapshots, zero rules, unique bilingual keys and exact source mirror.
- `node leetcode/679/tests/browser.cjs`: PASS, both languages, five presets, controls, source transfer, fallback, keyboard, layout/zoom and contrast.
- `node leetcode/679/tests/rendered-contract.cjs`: PASS, concrete bilingual fraction frame, card provenance, counts, rewind/replay and prediction scope.
- `node leetcode/679/tests/selected-label.cjs`: PASS, 320/390 closed p4 label before/after locale roundtrip.

The browser suite genuinely clicks through all five presets in both locales. Rewind/replay returns the exact previous state; reset returns to initial state, and preset changes reset only that experiment. At endpoints Previous/Reset or Next/Jump disable appropriately. Hand operation counts and history lengths agree from 0 to 3. Trace progress counts displayed **excerpt states**, not total search work. The final result appears only at the conclusion; reaching a singleton in the prior frame does not prematurely change the progress status. Values, expressions, card groups, event text and history agree at initial, middle, final and replayed frames. Highlighted navigation denotes the section; current history emphasis denotes the latest displayed event, not another numerical state.

At fraction frame 5/7, both locales render values [8,1/3], expressions `8` and `(3 − (8 ÷ 3))`, provenance D and A/B/C, and the same event equality. This matches the independent calculation and remains intact through language roundtrips. Key checks detect duplicate COPY entries before evaluating the object, and each consumed translation is a two-string pair. Chinese proof, terminal/return meanings, zero rules, cost and exercise feedback agree with English; keys existing alone were not considered sufficient.

All three prediction answers produce feedback for the **same** [−1,−1] child. Choosing another answer hides old feedback; revealing again recomputes it. Changing the unrelated trace preset deliberately preserves this independent exercise, as nearby text promises. Locale switching preserves selected/revealed answer, trace position/preset, hand state and source disclosure. The negative-value distractor is explicitly corrected, and the valid parent witness (7+8−3)×2=24 prevents confusing child failure with whole-hand failure.

Exact decoded offline mirror, rendered #pythonCode.textContent, successful copy readback and downloaded solution.py match canonical source, including indentation and final newline (860 characters). I additionally repeated fallback independently in **each** locale with a fresh distinct non-source sentinel, denied programmatic write, checked textarea focus and selection [0,860], pressed the actual Linux **Control+C**, and read back all 860 canonical characters. No source was test-written to the clipboard to simulate success. Fallback screenshots show the selected source and visible focus. Long source lines can be horizontally scrolled in the disclosed code region; keyboard ArrowRight moved it 40px (646px content / 356px viewport). Keyboard-only radio Space/ArrowDown and Enter revealed correct feedback; Enter opened the source disclosure. The suite additionally checked native select ArrowDown/Enter, Tab skipping disabled Previous, Enter advancing Next, 3px focus outlines, forced-colors/reduced-motion focus and blocked localStorage. No browser page errors or failed local requests were observed.

Captured both languages at 320, 390, 736 and 1440px and desktop 200% **CSS layout zoom**, not DPR scaling. Inspected en-320-stage, zh-320-stage, en-390-stage, zh-390-stage, en-1440-stage, both zoom200-viewport images, selected-label and locale-roundtrip captures, both manual-fallback captures and cold-initial overview. Dense fraction state values/formula/provenance remain readable, stacking at 320 and sitting side by side at 390. Text wraps without intersections. The sticky navigation can overlay the top of tall element captures because of the captured scroll position; ordinary settled viewports confirm that the essential state itself remains readable. Navigation scrolls horizontally. Disabled buttons visibly use muted opaque text and dashed borders rather than disappearing. Measured contrast ratios: body 16.09, stage 14.70, muted 6.45, disabled 7.08, selected 13.10, focus 9.81.

## Earlier required finding and explicit closure

Earlier report was opened only after the saved cold walkthrough. Preserve its original failure and evidence unchanged.

**679-R1 — selected preset description clipped at 320px. Status: CLOSED on bd886cc20fd3a3b3ed37f85605e1d15df1faf627.** Original severity: medium, required device-access fix. Original candidate c368c0b018d41763af8de9d6ac36a323900bb4a3; section 03, EN, 320×950, p4 [1,5,5,5], state 0/7. Reproduce by choosing the preset, leaving the select closed, scrolling fully into view and repeating after a locale roundtrip. Expected complete input and “below one” distinction; actual old “intermediate below one” label was clipped. This violated frozen bilingual/device readability, clarified by rendered-state §8. Owner/next action was lesson author to shorten/reflow the label and rerun the unchanged narrow reproduction.

The repair first appears in bc79795d3b2b0b151533594f9f3b95af2d64f526; the current lesson subtree has no diff against that repair. Current label `[1,5,5,5] · intermediate < 1` retains the meaning. Fresh local regression at Chromium 156.0.8078.4/Linux shows 196.38px text within a 214px budget including a recorded 16px native-arrow allowance, 262px outer control, 15px left/right padding. At 390 it has 284px available. Chinese is 184.61px. Computed stack: 16px `"PingFang SC", "Microsoft YaHei", system-ui, sans-serif`; no uniquely resolved font is inferred. Inspected en-320-selected.png and zh-320-roundtrip-selected.png: complete labels are visibly clear of the arrow. Both languages/widths and roundtrips pass; no page-overflow assertion was substituted for label inspection.

Also assessed [the archived Mac repair evidence](679-review-mac-repair-20261025.md), its receipt, original probe and results. Receipt hashes for index/copy/core/app/styles/canonical Python/mirror/shared assets and selected-label test equal current candidate bytes. The archived red and green dispatcher preset-probe files are byte-identical. On recorded Mac Chromium 151.0.7922.34, the unchanged probe reports all 20 selected-label observations fitting; p4 English is 205.10px against 230px content space. I inspected the archived en-320-4.png: full `< 1` label and native-arrow clearance are visible. This is inspected external-platform regression evidence bound to identical current assets, not a claim that I ran Mac locally. Local and Mac evidence together close the original concrete reproduction. No broader Mac full-suite acceptance is inferred from that focused check.

Required open IDs: **none**. No new required finding was observed. The original report and all earlier screenshots/results remain unchanged.

## Scores, limitations, and conclusion

| Dimension | Weight | Score 0–4 | Observation-based rationale |
| --- | ---: | ---: | --- |
| Problem, terms, hand calculation | 15 | 4 | Explicit Boolean contract and rules; three visible concrete merges consume every original card once, before abstraction. |
| Causal derivation and saved work | 20 | 4 | Five shapes derived from root splits; fraction counterexample defeats wrong pruning; one pair rule replaces separate evaluation cases; direction/dedup rationale is explicit. |
| Maintained state and correctness | 20 | 4 | Visible identity partition, concrete rejected child/unchanged parent/sibling, exact terminal condition and soundness/completeness explanation agree with executed source. |
| Interaction and visual meaning | 20 | 4 | Predicted before reveal; observable group changes and retained history; labeled omitted branches, consistent endpoints/replay and independent exercise scope. |
| Transfer to Python and cost | 15 | 4 | Exact executable original interface, current-position mapping, fresh code checks, preserved parents/input and justified bounded/generalized costs; exact source transfer including fallback. |
| Bilingual and device access | 10 | 4 | Equivalent concrete meanings, keyboard controls/focus, readable dense state and disabled controls, 320/390/desktop/200% layout checks; prior selected-label defect explicitly closed. |

Weighted score: 15+20+20+20+15+10 = **100/100**. All six dimensions are at least 3 and no required finding remains open. **Accept this candidate for independent lesson review.**

Limitations: local execution is headless Chromium/Linux, not physical-device testing, a full assistive-technology audit, or native browser-toolbar zoom. Local 200% evidence uses CSS layout zoom. The focused Mac label evidence is archived and hash-bound, not a fresh local Mac run. The official statement was accessible, while a live language-selector interaction was not independently exercised; the canonical language is Python, with matching saved official callable evidence. Custom inputs are code checks because the lesson is preset-only. The complete search is intentionally sampled in the teaching UI; omitted results were computationally checked. No real human comprehension, successful LeetCode submission, production delivery, or publication is claimed.

Only this report and its exclusive evidence directory were written. Final Git status showed only those new review paths, with no tracked candidate changes.
