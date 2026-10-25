# Independent review: LeetCode 552

Candidate: `62db2f09dc5ece8b7073e3e4e7b327b546a15eaa`. URL: http://127.0.0.1:18778/leetcode/552/. Date: 2026-10-25. Reviewer: this independent review run; exact model identifier unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen weights: 15/20/20/20/15/10. Canonical interpretation frozen before opening: prefer official Python.

## Cold browser walkthrough — saved before source audit

Read only the frozen rubric before opening the lesson with real Playwright Chromium at 1280×900. No BRIEF, source, tests, prior report, or author notes were read beforehand. The following are browser observations and my reconstruction, not measured human comprehension.

| Teaching step/question | Action | Visible result | My causal conclusion |
|---|---|---|---|
| 01: what is being counted? | Read the two-day branching example and eight record chips. | PP, PL, PA, LP, LL, LA, AP, AL; AA excluded; domain and modulus stated. | Each complete string is a distinct outcome; two As fail. Three first-day branches give 3+3+2=8. |
| 02: what must tomorrow remember? | Read LL versus PL, then LLP versus LPL, baseline and LP/PP grouping. | The page distinguishes A used from trailing L, explains prefix, and contrasts enumerating 3^n strings with six groups. | Prefixes with the same A count and trailing run have identical legal continuations. Counting them together avoids extending every individual prefix. Total L alone loses relevant order. |
| 03: where do new counts come from? | Before clicking, predicted day1 [1,1,0,1,0,0], total3; day2 [2,1,1,3,1,0], total8. Appended twice. | Both predictions matched. Cards show old→new, explicit labeled incoming terms and sums; history contains totals 1→3→8. (1,0) receives 1+1+0+1+0+0=3. | P resets the trailing run, A resets it and uses the absence, L extends it only below two. Fresh nxt prevents extending a day twice. Removing the last mark gives a unique predecessor, so the disjoint cases count each record exactly once. |
| 03: are frames data or emphasis? | Rewound one day and appended again. | Same six day-two counts and retained history recovered. Initial frame clearly labels the empty record. | Frames represent completed days, not partial inner-loop writes; history is teaching storage distinct from constant-space submission storage. |
| 04: can I transfer the rule? | Before reveal predicted five suffixes for PLL: PP, PL, PA, AP, AL. Selected five and checked. | Correct feedback explains 3+2 and rejects LP/LA because they immediately make LLL; AA/LL also excluded. | Existing trailing context constrains the first appended mark, so counting free two-day strings is wrong. |
| 05: how does this map to Python? | Read code map, boundaries and cost explanation in rendered lesson. | dp[0][0]=1, range(n), guarded A/L additions, fresh nxt and final sum mapped explicitly; modulo law and O(n)/O(1) explained. | Day-two new (1,0)=old (1,0) via P plus the three old a=0 groups via A. Six bounded-size cells per array suffice; chart history is extra UI memory. Actual source execution deferred until after this saved coldwalk. |
| Bilingual reasoning | Switched to Chinese after reveal. | Day2 values, selected answer and revealed explanation persisted; Chinese gives equivalent invariant, exclusion and code/cost reasoning. | Language changes presentation, not experiment state. |

Fresh independently chosen input prediction, recorded before source/reveal: n=5 should give 94 (hand recurrence totals n3=19,n4=43,n5=94). UI offers only 1,2,3,4,6,10, so n=5 will be a **code check**, not a custom UI experiment. Independent counterexample prediction: LLP permits another L but PLL does not, despite equal total L and A counts; independently enumerate this after source access.

Cold screenshots: `552-evidence/552-review-1-eefe193e/cold-desktop.png` and `cold-zh.png`. Desktop full-page screenshot inspected; further device crops and audits follow below. Coldwalk saved before opening any candidate source.

## Candidate identity and official/source audit

HEAD is the requested revision. `git diff --exit-code 62db2f09dc5ece8b7073e3e4e7b327b546a15eaa -- leetcode/552 leetcode/common.js leetcode/style.css` exited 0. Browser-requested bytes matched checkout bytes for index.html, solution.py, python-code.js, app.js, core.js, copy.js and style.css. No candidate files were modified.

SHA-256 identity anchors:

| File | SHA-256 |
|---|---|
| solution.py | `7672c9d89729e8ea6d2c0d2c581e5e2b56f38ea63baf142100a2c0f752fbb50f` |
| python-code.js | `fb23d86d29deafb27a983a5c7ddadab34d56c89f9d4406feb771568fad3d9290` |
| core.js | `44c62f27d91fef2e5dafcbde88767039b0fefe441005380a0a2733583af05ec2` |
| app.js | `129e423d6a3ba068fa86c75e3db0a46e6626dd02807cfcbd9d69418bda4b45b4` |
| copy.js | `ba452d0aabfb9b734e57899bbd6597a3bad186ed53e3fb9d7306d4b75c2c4927` |
| index.html | `8056bb47b487e42f1d85315b460fcb69055258343a8f0f1f80c25a8962750cdf` |
| style.css | `006983a523a4e78591cd3507bba52708978f6c0c61b2e3df3fc3f419276b973e` |
| ../common.js | `f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b` |
| ../style.css | `6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27` |

After saving the coldwalk, read the rendered-state contract, canonical source, renderer, translations, styles, metadata, source-name mapping and tests. The [official statement](https://leetcode.com/problems/student-attendance-record-ii/) was available through the normal web reader: fewer than two As, no three consecutive Ls, length n, modulus 10^9+7, domain 1..100000 and all three examples agree. A direct Chromium visit displayed Cloudflare security verification; no bypass was attempted. Lesson-local saved official GraphQL evidence contains the faithful Python3 `Solution.checkRecord(self, n: int) -> int` snippet. Fresh browser verification of the official language selector was unavailable. This is an ordinary Python lesson, with no non-Python language-contract exception to audit; I do not claim a freshly verified selector or submission.

`LANGUAGE_FILES` identifies solution.py / python-code.js / PYTHON_SOURCE. The actual canonical Python was executed, not the JavaScript trace. The source uses independent three-cell rows (no shared-row alias), a newly allocated nxt on every iteration, reads only dp during that iteration, and replaces dp after all six states. The input integer is not mutated; repeated calls have no retained mutable state. All additions reduce modulo M. Six groups × at most three additions per day gives O(n) time and O(1) auxiliary storage with bounded integer sizes. The brute baseline's O(n·3^n)/O(n) claims are consistent with generating and examining one length-n tuple/string at a time. Trace snapshots store all days, explicitly a separate O(n) teaching cost; the UI caps n at 10, so lack of modulus in core.js does not misrepresent any displayed count.

## Independent calculations, invariants and execution

Fresh n=5 **code check**: direct product enumeration with literal attendance predicates gave 94, matching the prediction and canonical Python. Independently enumerated totals for lengths 0..8 were 1,3,8,19,43,94,200,418,861. Day 0 is an internal base, not an official test input. Independent counterexample check gave legal next marks P/L/A after LLP versus only P/A after PLL. Thus the tempting total-L rule genuinely loses necessary information.

For larger independent cases I counted no-A P/L records by f[0..2]=1,2,4 and f[k]=f[k-1]+f[k-2]+f[k-3], then added all f[i]·f[n-1-i] possibilities around the unique A. This decomposition uses the unique absence position rather than six-state transitions. Canonical results matched for n=17 (407167), 31 (640450355), 127 (740846651), 10101 (183236316), 99999 (816671055), and 100000 (749184020).

The six-state invariant is sufficient because legality of each appended mark depends only on a and trailing l. Removing that mark reconstructs a unique predecessor; the three final-mark cases are disjoint and the two guards exclude exactly the forbidden extensions. The base has one empty record, and n completed iterations cover length n. For the full short n=3 trace, day-two [2,1,1,3,1,0] becomes [4,2,1,8,3,1], total19. New (1,0)=2+1+1 via A plus 3+1+0 via P =8. New (0,2)=old (0,1)=1; old (0,2) cannot feed an L extension. These are completed-day values, not partially accumulated values. Browser labels and equations agreed in both languages, including locale switch at day3/6: Chinese showed old2→new4, old1→new2, old1→new1, old3→new8, old1→new3, old0→new1.

Inspected all three test scripts and their write destinations before running them. Every generating invocation used `OUTPUT_DIR="$PWD/specs/reviews/552-evidence/552-review-1-eefe193e"`; no tracked author assets were regenerated. Commands and outcomes:

- `python3 -B leetcode/552/tests/test_solution.py`: exit0, PASS; exhaustive grouped enumeration through 10, seeded cases, official examples and maximum-domain checks. Results and oracle buckets saved in this run's directory.
- `node leetcode/552/tests/test_core.cjs`: exit0, PASS; all intermediate groups and incoming counts through n10, snapshot independence, exact source mirror, unique bilingual keys and two-string pair shapes.
- `node leetcode/552/tests/browser.cjs`: exit0, PASS; browser-results.json records actual coverage and contrasts. These are rerun test results, not independent learner-comprehension evidence.
- **Required metadata preflight:** `python3 -B scripts/register_leetcode_lesson.py 552 --validate-only`, run from repository root: exit0, no stdout. lesson-entry.json complexity is exactly the nonempty string `O(n) time; O(1) auxiliary space`. No registration was run.

## Browser, localization, source transfer and visual access

Both EN and Chinese were exercised at every preset (1,2,3,4,6,10), every completed day, rewind/replay, reset, complete remaining days, and slider endpoints. Group counts and ledger totals matched independently enumerated buckets. Completed totals were respectively 3,8,19,43,200,3536. Initial controls disable rewind/reset; final controls disable append/end. Replaying restores the same six values. Changing presets restarts at day0, preserving the separate quiz exactly as the lesson promises.

All three prediction options were checked in both locales. Choice changes hide stale feedback; reveal responds to the selected option; locale changes preserve selection and revealed meaning. For PLL, both feedback translations explain 3+2=5, name all five suffixes, and identify why LP/LA create LLL. Formula, dynamic state label, old/new counts, incoming terms, pending/final summary, quiz feedback and clipboard-failure paths were inspected for semantic binding. The consumer expects [zh,en] pairs; the 67 keys were checked for duplicates before evaluation, and all pairs are complete. This includes the actual rendered formula operands and guards, not just key presence. No materially different translation was found.

Source transfer was checked without trimming: mirror-decoded string, DOM `textContent`, copied string and downloaded bytes equal all 830 canonical source characters, including final newline. In addition to the rerun's clipboard success stub, a browser context granted clipboard permissions and actual `navigator.clipboard.readText()` matched solution.py after Copy. After intentionally rejecting writeText, manual fallback focused and selected the full textarea; pressing Ctrl+C and reading the real clipboard again matched all 830 characters. Fallback status was checked in both locales and was distinct from incorrect-prediction feedback.

Keyboard checks covered Enter on append, source disclosure and reveal; Space/arrow selection in the quiz; range arrows/Home/End; focus outline; and horizontal table access. At 320px the focusable labeled ledger was 258px wide with 580px content; repeated ArrowRight scrolled it 322px, exposing later columns while retaining table headers and row associations. (End alone did not scroll horizontally; ArrowRight did.) Controls have at least 48px height. The source remains exact despite soft wrapping.

Layout checks used 320,390,736,1440px in both locales and desktop coldwalk at1280px. No page overflow or state-card content clipping occurred. Inspected the 320/390 full-grid captures in both locales, desktop populated cards, cold screenshot, both CSS-zoom screenshots and narrow source screenshot. Dense n10 (1,0) cards show old861→new1753 and the complete sum 149+81+44+861+418+200=1753; terms and labels remain separated. Full-grid element captures briefly hide sticky navigation to remove a capture overlay; ordinary viewport screenshots retain navigation. A sticky bar covering the top edge of already scrolled content is not a state-label collision.

200% checks include CSS zoom=2 at1440px in both locales, plus independent effective-reflow viewports720×550 (the CSS viewport corresponding to a1440×1100 window at200%) showing two-column cards and no page overflow. These are headless layout simulations, not an operating-system browser-zoom UI or physical-device claim. Counts and equations remained legible. Core text measured contrast16.09:1, hints7.74:1, state labels10.91:1, disabled text6.45:1 against its actual solid background. Disabled buttons retain readable text and dashed borders. Sticky navigation's translucent background contrast calculation in the test does not composite alpha, so I do not claim its reported number as an exact composited measurement; screenshot inspection found its muted labels readable. Forced colors, reduced motion, storage denial and post-load offline interaction were also exercised without browser errors.

## Findings and earlier-review closure

No earlier 552 review report was found under specs/reviews (only this new report). No inherited finding is claimed closed. **Required open IDs: none.** No correctness, causal-bridge, core interaction, translation or source-fidelity defect was observed.

Two optional refinements explain the minor-friction scores; neither removes an essential explanation:

| ID/status | Reproduction and expected/actual | Severity, rubric connection and next action |
|---|---|---|
| 552-N1 / advisory | EN or Chinese, section02, desktop, read brute code after baseline prose. Expected an easily followed baseline for a loops/lists reader; actual implementation uses itertools.product and nested comprehensions without syntax explanation. The surrounding prose independently explains enumeration, rejection and saved work. | Minor teaching friction, derivation dimension. Future author may expand the baseline into simple loops or explain product; no required fix, fix revision/recheck not applicable. |
| 552-N2 / advisory | Both locales,320px, open source disclosure. Expected easy visual following of Python blocks; actual soft wraps split signature, loops and additions, while preserving all characters and access. Screenshot: independent-en-320-code.png. | Minor code-reading friction, device dimension. Future author may offer a horizontal code view or line wrapping toggle. No clipping or loss of essential algorithm explanation; no required fix, fix revision/recheck not applicable. |

## Scores and conclusion

| Dimension | Weight | Score /4 | Observation supporting score |
|---|---:|---:|---|
| Problem/terms/hand calculation |15|4|Concrete two-day branching precedes abstraction; input/output, modulus, domain and internal day0 clearly distinguished. |
| Derivation/saved work |20|3|Same-future grouping, avoided enumeration and tempting wrong state choices are causally explained; compact unfamiliar brute syntax adds minor friction (552-N1). |
| Maintained state/correctness |20|4|Invariant, unique predecessor, disjoint cases, fresh storage, guards, modulo and termination are explicit and matched independent intermediate/boundary checks. |
| Interaction/visual meaning |20|4|Predictions preceded actions; old/new terms, completed-day units, retained history, rewind and quiz state/change behavior agreed. |
| Python/cost |15|4|Actual canonical execution, exact transfer parity, transition mapping, independent cases, no input mutation and correct bounded-memory/time costs. |
| Bilingual/device access |10|3|Equivalent causal translations, keyboard access, preserved state, readable cards and disabled controls across widths/zoom; narrow Python wrapping adds minor friction (552-N2). |

Weighted total: **92.5/100** =15+15+20+20+15+7.5. Every dimension≥3. Required open findings: **none**. Outcome: **accepted for this candidate revision and reviewed scope**. This is separate from publication.

Limitations: no novice participant, measured human comprehension, LeetCode submission, physical device test or browser-chrome zoom claim. Official statement was accessible normally via web reader; direct Chromium official selector access was challenged as described above. Browser trace is explicitly a mathematical simulation; canonical Python execution supplies separate runtime evidence. No author claim or screenshot count substituted for teaching judgment. Only this report and files in this run's exclusive evidence directory were written; prior evidence and candidate assets were preserved.
