# Independent review: 564 — Find the Closest Palindrome

Candidate: `9dfc40e957acbc54f333b07d8d44fe2eb523c81b`. URL: http://127.0.0.1:18770/leetcode/564/. Target: basic Python, lists, loops, functions, elementary recursion. Reviewer: this independent review run; exact model identifier unavailable. No claim of human comprehension or successful LeetCode submission. Frozen weights: 15/20/20/20/15/10. Applicable interpretation: faithful Python submission and its actual cost.

## Cold browser walkthrough (saved before filesystem source, tests, author notes or previous reviews)

Read only `specs/leetcode-review-gates.md` before opening the candidate in real Chromium via Playwright, desktop 1280×900. The following observations came from the rendered lesson, including opening its displayed Python disclosure, rather than implementation files. No BRIEF or author evidence was used to fill gaps.

1. **Calculate one distance.** Question: what is input/output and what counts as closest? Action: read the first section and calculate 123→121. Observation: decimal-string input/output, palindrome definition, exclusion, smaller-on-tie, zero answer, bounds up to 18 digits; |121−123|=2 versus |131−123|=8. Paraphrase: reverse-equal digits determine eligibility; absolute distance orders eligible numbers, with smaller value breaking ties. This tiny example precedes abstraction.
2. **Why is mirroring insufficient?** Question: what search work is saved, and why is one mirror inadequate? Action: hand-follow outward search and the odd/even mirror examples. Observation: outward search repeatedly reverses d-digit numbers and may need 499999999 radii; prefix is defined before use; 12 becomes 121 or 1221 depending on length; 129 has nearer 131 than its mirror 121. Paraphrase: whole-number distance search repeats digit work, while a prefix describes a whole palindrome; moving that prefix can improve the distance and self-mirroring may be excluded.
3. **Test the complete candidate set.** Question: how does tested history establish the answer? Prediction before clicks: for 123, running best should be 111,121,121,121,121; only row 2 improves it after initialization. Action: click Test one row five times. Observation: exactly those best values; row distances 12,2,8,24,878; tested cards retain earlier distances while the current-frame arrow moves. Final answer 121, although last row is 1001. Undo restores 4/5 and hides only the last distance; restart returns to untested. Paraphrase: highlighting marks the current comparison, not the winner; best is the minimum (distance,value) over eligible tested rows, and remains valid when a worse row is appended. The written order proof explains why p−1/p/p+1 block more distant same-length prefixes and why only the two closest length boundaries matter. Width-changing prefixes are skipped.
   Additional predictions: 121 should exclude itself and choose 111 over 131 on a distance-10 tie; 99 should choose 101 across the length boundary. Action: select each preset and Test all rows. Observation: 121 is explicitly excluded despite distance zero; result 111. At 99, only four rows appear, result 101, distance 2; the invalid carry mirror is absent. Changing preset restarts this trace. Paraphrase: exclusion precedes minimization, tie order is numerical, and boundary candidates handle digit-width changes. UI accepts presets only.
4. **Predict a fresh boundary case.** Question: can the reader combine boundaries and ties on 1000? Prediction before reveal: 999 and 1001 are both one away; choose 999. Action: choose 999 and check. Observation: Correct feedback shows prefix 10, skipped 9, mirrors 1001/1111, boundaries 999/10001, and the tie. Change to 1001 clears feedback; check again gives boundary/tie correction. Paraphrase: nearest same-length mirror can tie a shorter palindrome and lose; changing a prediction invalidates the previous reveal.
5. **Turn the proof into Python.** Question: how do visible operations map to runnable code and cost? Action: read the mapping and expand the displayed submission. Observation: q loops over three prefixes, `s[:-1]` removes the odd center, reversal builds the tail, a set deduplicates, `discard(x)` excludes self, and tuple-key `min` matches the experiment. Explicit O(d) construction/storage claim is qualified by bounded integer arithmetic and official d≤18; unbounded conversion costs are acknowledged. Paraphrase: candidate generation and minimum selection implement the proof with a constant candidate count; trace snapshots are separate from submission storage. The browser explicitly says its BigInt simulation does not execute Python.

### Independently chosen examples — predictions recorded before code execution

The preset-only UI cannot run these; subsequent executions must be labeled **code checks**. Fresh small input `42`: predict `44`, distance 2, versus `33` distance 9 and `55` distance 13. All two-digit palindromes are 11,22,33,44,55,66,77,88,99, so none beats 44. Counterexample `19` to the tempting “mirror the current prefix only” rule: predict `22`, distance 3, whereas direct mirror 11 is distance 8 (0 and single digits are still farther). Invariant: best minimizes (distance,value) over tested eligible candidates; excluded case is input itself. These predictions precede canonical-source execution.

Cold screenshots: `564-evidence/564-review-1-f84c5fcb/cold-initial.png` and `cold-99.png`. Screenshots will be inspected in the audit; observations above are from direct browser operations and rendered text, not inferred scores from images.

## Post-cold audit

### Identity and scope

`git rev-parse HEAD` returned the exact requested revision. Working tree changes were only this report and its exclusive evidence directory. Browser-fetched bytes matched disk for index.html, app.js, copy.js, core.js, python-code.js, solution.py, lesson CSS, and shared style.css/common.js. Relevant SHA-256 identities:

- index.html: `ea0bdcd0669ad1dcdd4d2bdd7717abd034c09c3b321452c9dd74e5ac9887b34b`
- app.js: `686bbb35bffd6d884c5657293f12eab19fa28bad66831eb8b713e511b463fe0b`
- copy.js: `96c0272e063c96079796225aa9487ac1931148b971154ba3a24f06a5da3060dd`
- core.js: `5ab630bf381d7eaf88edce016aba7355cba36c7259f3cf3a077b97a22d4ee7ef`
- python-code.js: `6dcde1ff76386a707c174d41854c213c2f0843bef26b5a304673df94eb5e1f06`
- solution.py: `34f978039584941b6beb0aba2d840566ef207e062c0214792dfedbdb6179cbc8`
- lesson style.css: `5c5df32a2805371cd2f9e19b3c4b8c26476065f6395cd87d3a23014a301df27e`
- shared style.css: `6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27`
- shared common.js: `f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b`

After saving the cold walk, read the rendered-state contract, registration language table, canonical source, renderer/core, translations, HTML/CSS, locale consumer, and all three test programs before running them. No BRIEF or SELF-CHECK was needed. A post-cold search found no earlier review report for 564; no earlier required finding is being closed.

### Official statement and callable semantics

Read the [official statement](https://leetcode.com/problems/find-the-closest-palindrome/) normally through the web reader: input is a digit string, exclusion and smaller-value tie handling agree, examples are 123→121 and 1→0, and constraints match the lesson (length 1..18, no leading zeros, positive integer below 10^18). A separate normal Chromium visit encountered Cloudflare security verification; no bypass was attempted. That browser could not expose the official editor or language selector. Python is the canonical language, so the non-Python language-contract/supportedLanguages gate is inapplicable. The source exposes `Solution.nearestPalindromic(self, n: str) -> str` and returns a decimal string; it is a direct solution to the original problem, not a conceptual analogy. Live editor-stub verification is an access limitation, not claimed as completed.

`LANGUAGE_FILES` specifies Python → solution.py / python-code.js / PYTHON_SOURCE, exactly as used. No non-Python solution or additional supported-language contract is advertised.

### Correctness, state and transfer

Independent **code checks**, using the actual compiled-in-memory canonical Python file with bytecode writing disabled: freshly predicted 42→44 and 19→22 both matched. A separate brute enumeration of all reverse-equal integers through 200000, followed by adjacent-table lookup, checked 514 inputs (14 selected cases plus 500 deterministic random inputs below 100000). All matched; caller strings remained unchanged. This oracle does not generate the submission's five candidates. Selected observed outputs: 1→0, 10→9, 11→9, 99→101, 100→99, 1000→999, and 999999999999999999→1000000000000000001.

Canonical-source reasoning: a valid same-width prefix uniquely defines its palindrome; prefix ordering preserves numerical order. At most the immediate lower/identical/upper prefix can be nearest within that width. If a neighbor has invalid width, no valid same-length prefix on that side is lost; the closest other lengths are the all-9s lower boundary and 10^d+1 upper boundary. Initial boundary set ensures nonempty eligibility even at 1. `discard(x)` prevents self-selection; tuple ordering enforces the tie rule; three iterations and a finite minimum terminate. All state is local and the input string is immutable.

Concrete visual/code mapping: at 123, row 2 changes best from 111 (distance 12) to 121 (distance 2). Canonical q=12 gives s="12", odd tail="1", and candidate 121; the final `min(..., key=lambda y: (abs(y-x), y))` performs the same comparison over the set. The UI tests mirrors first and preserves duplicate rows, whereas Python inserts boundaries first and deduplicates; minimum is order-independent and duplicates cannot change it. The lesson explicitly explains the duplicate and simulation distinction. Initial best is absent; intermediate best covers only tested eligible rows; final best is called the answer only at completion. At 123 the final highlighted row is 1001 while the answer remains 121, correctly separating current candidate from best.

Actual submission storage is a constant number of O(d)-digit strings/integers. Construction/reversal and retained digit storage are O(d); the bounded-arithmetic qualification and warning about unbounded conversion costs make the stated cost appropriate to the official maximum. No recursion, mutation restoration, SQL, promises, or native-language contract applies.

### Inspected test executions and metadata gate

Read tests before executing. Every generating test was redirected with `OUTPUT_DIR=specs/reviews/564-evidence/564-review-1-f84c5fcb`; no tracked author assets were regenerated. Python used `-B`.

- `python3 -B scripts/register_leetcode_lesson.py 564 --validate-only`: exit 0, no stdout, run from repository root; repeated separately to confirm the exit status. lesson-entry.json complexity is exactly one nonempty string: `O(d) time; O(d) space for d ≤ 18 decimal digits (bounded integer arithmetic)`.
- `OUTPUT_DIR=... python3 -B leetcode/564/tests/numeric.py`: PASS, 21555 cases, including outward scans through 20000, length-1..19 palindrome-domain binary search, seeded large cases, decimal-power boundaries, and the baseline-distance example. Its large oracle has separately implemented construction, though it still uses palindrome ordering; the independent enumerated oracle above adds distinct evidence.
- `OUTPUT_DIR=... node leetcode/564/tests/core.cjs`: PASS, 128934 frames. Recomputed distances and eligible minima, checked reverse equality, endpoint answers, exact offline mirror, unique translation keys before evaluation, and two nonempty strings per translation entry.
- `OUTPUT_DIR=... node leetcode/564/tests/browser.cjs`: PASS in real Chromium using NODE_PATH and the environment-provided executable. Artifacts retain the test's literal “author self-check” label; here these are independently inspected and rerun tests, not a substituted author claim. Review scores also depend on the cold walk and independent checks.

### Interaction, localization and source fidelity

Both locales exercised all nine presets, every row, endpoints, rewind/replay, reset, range positions and all three quiz options. Completed results were 123→121, 129→131, 121→111, 1→0, 10→9, 99→101, 100→99, 1234→1221, maximum input→1000000000000000001. Previous row distances remain visible; rewinding returns later rows to untested. Preset changes reset only the lab; the fixed 1000 quiz correctly retains its answer. Changing quiz selection hides stale feedback.

Independently switched EN→ZH→EN at 123, k=2, with the correct 1000 quiz revealed. Both retained 2/5, best 121, the two tested distances 12/2, and the selected/revealed quiz. Rendered formulas retained all three mirrors, both power boundaries, y≠n and (|y−n|,y). The Chinese proof makes the same prefix-order and boundary argument. Chinese feedback explains skipped 9, 1001/1111, 999/10001, distance-1 tie, and exclusion, matching English; current-frame and self-exclusion messages bind to the correct cards rather than unrelated copy fallback text. Translation duplicate-key and pair-shape detection passed for the actual namespace consumed by common.js.

Keyboard checks: range ArrowRight advances one frame; End/Home independently reached complete/initial state; Enter on Next advanced 0→1. Enter opens the source disclosure; visible focus is a 3px solid outline. Locale button focus survives switching. Offline state interaction with denied local storage worked, and forced-color focus checks passed. No page errors, failed responses or external lesson requests were observed.

Exact, unnormalized source equality, including final newline, passed across canonical solution.py, decoded PYTHON_SOURCE, DOM `textContent`, successful clipboard payload, fallback textarea and downloaded bytes (`downloaded-solution.py`). Additionally, an independent browser context with clipboard permissions verified actual clipboard write/read equality. After forcing writeText failure, the full textarea selection was copied with keyboard Control+C and read back through the native browser clipboard: exact equality again. This checks usable manual copying, not just textarea presence.

### Device evidence inspected

The browser matrix exercised EN/ZH at 320,390,736,1440 pixels and 200% CSS zoom at 1440. No page overflow; cards stayed within their own width and controls measured at least 48px tall. State was retained across viewport changes. Inspected screenshots include cold-99, en-1440-states, en-390-states, zh-320-states, en-320-full-grid, zh-320-full-grid, zh-390-full-grid, both zoom200 images, en-copy-fallback, and en-prediction. At narrow widths and zoom, long 18/19-digit operands wrap over multiple lines, but values remain associated with their labels and no text intersection/clipping was observed. Full-grid screenshots temporarily hide the sticky navigation only for capture; ordinary viewport screenshots retain it. Vertical scrolling is required to see the entire tall grid. Navigation is horizontally scrollable. Disabled states remain readable and use dashed borders.

Measured contrast: normal body 16.09:1; hint 7.74:1; card text 13.40:1; card status and disabled Next 6.45:1; inactive locale 7.08:1. Inspected screenshots support the measurements. Zoom evidence uses documented CSS zoom=2 in headless Chromium, not a physical device or browser-menu zoom claim.

All generated artifacts are under `564-evidence/564-review-1-f84c5fcb/`, notably numeric-results.json, oracle-cases.json, core-results.json, browser-results.json, downloaded-solution.py and the PNGs. No earlier evidence changed.

## Findings and scores

Required findings: **none**. No prior required IDs found or closed.

Nonrequired polish observations:

- **564-R1-N1**, minor, Python section, both locales/desktop: sets, lambda keys and argmin are compressed into prose/code rather than separately unpacked for basic-Python readers. The concrete tuple comparison and worked prefix mapping make the algorithm reconstructable. Optional next action: add a short explanation of set insertion/removal and tuple-key syntax. Status: advisory; no fix revision claimed.
- **564-R1-N2**, minor, maximum-input state, EN/ZH 320/390 and zoom200: long decimal operands split across lines, increasing reading effort. Expected/actual numerical associations remain correct and readable; screenshots cited above show wrapping without intersections. Optional next action: improve digit grouping or line layout while preserving exact values. Status: advisory; no fix revision claimed.

| Dimension | Weight | Score /4 | Rationale |
| --- | ---: | ---: | --- |
| Problem/terms/hand calculation | 15 | 4 | Clear strings, distance, palindrome, exclusion/tie and bounds; tiny worked 123/1 calculations precede abstraction. |
| Derivation/saved work | 20 | 4 | Explicit outward-search cost, concrete mirror failure, neighboring-prefix ordering and both length-boundary arguments. |
| Maintained state/correctness | 20 | 4 | Invariant, valid-width filtering, self-exclusion, ties, duplicates, terminal condition and boundary outputs independently reconstructed. |
| Interaction/visual meaning | 20 | 4 | Predictions matched stepwise comparisons; retained history, current-versus-best, rewind/reset/endpoints and invalidated feedback are observable. |
| Python/cost | 15 | 3 | Actual source executed, fresh oracle, exact parity and qualified digit costs; minor syntax-teaching friction in N1. |
| Bilingual/device | 10 | 3 | Equivalent rendered reasoning and preserved state; keyboard, narrow layouts and zoom work, with long-digit reading friction in N2. |

Weighted result: **93.75/100**. Every dimension ≥3; zero required open findings.

## Conclusion and limitations

**Accepted** for candidate `9dfc40e957acbc54f333b07d8d44fe2eb523c81b` under the frozen rubric. This is lesson review acceptance, separate from publication. No implementation or shared files were edited, no registration was run, and no LeetCode submission was made. Browser walkthroughs were automated real Chromium observations; no human learner study or real-device test is claimed. Official statement access succeeded via normal web reading; the live browser editor/selector was blocked by security verification and was not bypassed. No acceptance claim is based solely on screenshot/test counts.

