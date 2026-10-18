# Independent review: 85 Maximal Rectangle

Candidate: `9c5097550a3f3ac7911531300c0f4fdbf841192c`.
URL: http://127.0.0.1:18775/leetcode/85/ . Target: basic Python reader.
Reviewer: independent review run; exact model identifier unavailable. No learner study or LeetCode submission claimed.

## Frozen interpretation and cold walkthrough (before source)

Weights: problem/terms 15, derivation 20, correctness 20, interaction 20, Python/cost 15, bilingual/device 10. Python is preferred for this algorithm problem. Acceptance requires >=85, all dimensions >=3 and no required gaps.

Only the rubric was read before opening Chromium. Initial desktop screenshot: `85-evidence/85-review-1-d660bb72/cold-desktop.png`.

1. Question: what qualifies as a rectangle? Action: read six-cell example 101/111 and manually enumerate. Observation: bottom row area 3 versus columns area 2; all six include zero, five ones are not rectangular. Conclusion: consecutive rows/columns and no holes are essential; output counts cells, not ones anywhere.
2. Question: what repeated work is saved? Action: follow baseline and heights derivation. Observation: six nested loops recheck interiors, while [1,0,1] becomes [2,1,2]. Conclusion: a fixed bottom row reuses vertical runs; the minimum column height limits a horizontal span. Any rectangle has such a bottom row.
3. Question: why pop and why subtract one? Action: hand-compute [2,1,2] at i=1 and sentinel i=3. Observation: j=0 yields width 1; final j=1 yields width 3 and area 3. Conclusion: shorter bars exclude endpoints, stack holds nondecreasing unresolved heights, equal bars remain until a shorter bar closes their spans. Sentinel finishes positive bars.

Pre-reveal predictions: exercise [2,4,3,1], stack [-1,0,2], i=3: pop j=2, L=0, width 2, area 6; pop j=0, L=-1, width 3, area 6. Expected answer: 6 then 6.
Fresh independent matrix prediction: 11/10/11 -> 3 (left column); reset at middle-right zero prevents a spurious area 6. Counterexample to choosing tallest alone: 111/101 -> 3 from top row, while tallest bars give 2. Preset-only selector means these will be code checks, not custom UI experiments.

4. Question: what does each operation establish? Action: clicked Next 18 times from operation 0, reading each visible frame. Observation/conclusion by position:

| Position | Visible result | Causal conclusion |
|---|---|---|
|0|heights [0,0,0], stack [-1], best 0|No processed row yet.|
|1|row 0 heights [1,0,1]|One extends a vertical run; zero resets.|
|2|push 0 -> [-1,0]|Height 1 awaits a right blocker.|
|3|pop 0, L=-1,i=1, area 1, best 1, one checked cell|Zero blocks height 1; only column 0 fits.|
|4|push 1 -> [-1,1]|Zero boundary remains pending.|
|5|push 2 -> [-1,1,2]|Height 1 can still extend.|
|6|pop 2, L=1,i=3, area 1, best stays 1|Sentinel finishes the rightmost bar; non-record candidate still enters ledger.|
|7|push sentinel 3 -> [-1,1,3]|Zero bars need not be removed.|
|8|row complete, best 1|All positive heights settled; global answer retained.|
|9|row 1 heights [2,1,2], stack [-1]|Height work reused, pending stack restarted.|
|10|push 0|Height 2 awaits a blocker.|
|11|pop 0, area 2, best 2; two left cells checked|Current height 1 excludes column 1 from height-2 rectangle.|
|12|push 1|Shorter bar can support a wider rectangle later.|
|13|push 2|Nondecreasing heights remain pending.|
|14|pop 2, L=1,i=3, area 2, best unchanged|Right column closes at sentinel.|
|15|pop 1, L=-1,i=3, area 3, best 3; bottom three checked|The shorter middle bar spans all three columns.|
|16|push sentinel|All positive pending heights gone.|
|17|row complete, best 3|No further positive rectangle in this row remains.|
|18|complete, answer 3|Every possible bottom row has been considered.|

5. Question: can the rule transfer to another histogram? Action: selected predicted “6, then 6” and revealed. Observation: feedback independently matched both pops, excluded column 3, and explained why 9/8 and 4 fail. Conclusion: width uses the new stack top after each pop, not the old top or tallest bar alone.
6. Question: why is the code linear and complete? Action: read proof/code mapping prose (source disclosure remained closed). Observation: earliest equal bar covers full supporting span; all candidates are valid; each index pushed once/popped at most once. Conclusion: bottom-row reduction plus amortized stack scanning is O(rows×cols), O(cols), does not mutate input. Snapshots are explicitly separate tutorial overhead.
7. Question: does Chinese retain reasoning? Action: switched to 中 and read all five sections and revealed exercise. Observation: same tiny example, baseline, height updates, equal-height behavior, sentinel, exclusion formula, proof and cost; selected/revealed answer remained. Conclusion: the causal teaching is equivalent in the two languages.

Cold walkthrough saved before opening any implementation, tests, author notes, or prior reports. Fresh custom matrix checks remain pending code audit.

## Candidate, official contract, and source audit

HEAD equals the requested revision. `git status` initially showed only this review and its evidence directory as untracked. Served bytes equal local candidate bytes for index, canonical Python, offline mirror, copy, core, app, local CSS and shared common/CSS. Exact SHA-256 values are in `85-evidence/85-review-1-d660bb72/independent-checks.json`; canonical Python SHA-256 is `dfc63308417c1fa5b4896b1487631c9f752657e044eeeecb2f4e9ffe4878ff26`.

Read [the official statement](https://leetcode.com/problems/maximal-rectangle/) normally through the web tool: integer area of an all-one rectangle; examples 6/0/1; character entries; dimensions 1..200. No access bypass or submission. The saved lesson-local `official.json` and `OFFICIAL-VERIFICATION.md` contain Python3 selector/template evidence and callable metadata: `Solution.maximalRectangle(matrix: list[list[str]]) -> int`. The actual source implements that original callable and return semantics. This is faithful Python, not a conceptual analogy. No non-Python fallback or language-contract audit applies. `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py` explicitly maps Python to `solution.py`, `python-code.js`, `PYTHON_SOURCE`; all three agree. No earlier independent report for 85 was present under `specs/reviews`, so there are no earlier finding IDs to close. Author notes were read only after the cold walkthrough had been saved.

Reviewed core.js, app.js, copy.js, index.html, local/shared CSS, common.js, canonical Python, source mirror, and tests before running their generators. All generated outputs were redirected into this run's exclusive evidence directory; candidate assets and earlier author evidence were preserved.

### Independent examples and intermediate invariants

These are **code checks**, since the UI accepts seven presets, not arbitrary matrices.

- Pre-recorded fresh `11/10/11` prediction 3 matched canonical execution and an independent all-cells rectangle oracle. Heights are [1,1] -> [2,0] -> [3,1]; the middle zero prevents joining the right column across rows. The best is the left three-cell column.
- Pre-recorded tallest-only counterexample `111/101` prediction 3 matched execution and oracle. First-row width 3 beats the final height-2 single columns. Choosing tallest bars alone returns 2 incorrectly.
- Fresh boundaries: `1111/1111` -> 8; `0000` -> 0; `1/1/0/1` -> 2; `10101` -> 1; `010/111/010` -> 3. Inputs stayed unchanged.
- Independently enumerated **all 4,096 binary 3×4 matrices**, comparing the actual canonical Solution method to direct boundary enumeration and cell checks: all agreed. This oracle does not use heights or stacks.
- Reran inspected supplied checks: 1,192 canonical cases, 40 executed slow-baseline cases, including official examples, 200×200 all-one/zero/checkerboard and long single row/column. All passed; source mirror exact. Trace checks: 1,090 matrices / 29,139 snapshots, actual heights independently counted upward, sentinel zero, increasing indices/nondecreasing heights, valid pop regions, width formula, ledger maximum, row completion, deep snapshots, unchanged input. Reports: `python-results.json`, `core-results.json`, `independent-checks.json`.

Visual-to-Python mapping independently reconstructed: default operation 15 has heights [2,1,2,0], i=3 and stack [-1,1]. `j=stack.pop()` gives 1, then `left=stack[-1]` gives -1, `width=3-(-1)-1=3`, and `best=max(2,1*3)=3`. Screenshot `independent-pop390.png` shows precisely the three bottom-row cells checked. Height updates correspond to the assignment inside the column loop; push follows all required pops. The sentinel is allocated as an extra zero and never updated by the real-column loop.

The correct invariant has two parts: heights count consecutive ones ending at the current bottom row; unresolved indices increase and their heights do not decrease, with the intervening scanned support at least as high as the bar being popped. A shorter current bar fixes the right boundary; the new top determines the excluded left boundary. Equal-height L can limit a narrower candidate without being strictly shorter: the earliest retained equal bar later recovers the full span. Independently inspected equal-height preset `111/111`: row-1 pops give areas 2,4,6 with L=1,0,-1, confirming that narrower equal candidates do not lose the optimum. All settled regions are valid and every optimum is covered at its bottom row. The sentinel settles all positive bars; remaining zeros cannot improve the result. Each index is pushed once and popped at most once per row, so actual Python is O(RC) time and O(C) auxiliary space, with no input writes. Simulation snapshots/ledger have separate, explicitly disclosed overhead.

## Browser interaction and visual audit

Real headless Chromium via Playwright, resolved through NODE_PATH and the environment executable override when present. The cold walkthrough used ordinary visible-control clicks. The first broad, unmodified browser-suite attempt terminated with “Target page, context or browser has been closed” during the initial loop, without a completed result; cause not established. It produced no suite screenshots. The completed rerun loaded the same inspected test in memory and replaced `.click()` with `.click({force:true})` to avoid repeated scroll/stability waits; no test or candidate file was edited. This limits that batch's pointer hit-testing evidence, while cold clicks and separate normal-control interactions establish ordinary operation. Its fresh output is `results.json` and screenshots in this evidence directory.

Observed completed checks:

- Both locales, all seven presets: 244 forward operations, full backward walks, matching backward/forward snapshots, start/end disabling, reset, and preset restart. The ledger retains non-record pops and rewinding restores the previous ledger exactly.
- All three prediction choices revealed; correct/incorrect feedback explains both exclusions. Changing selection hides old feedback. Locale switches preserve preset, operation, selected answer, reveal, code disclosure and language-button focus. Independent operation-15 language switch at 390 -> 320 also retained the operation and translated the same values.
- Real keyboard Home/ArrowRight/End on operation slider; Enter on Reset; Tab produced a 3px orange outline. On the 320px ledger, focus + ArrowRight moved its horizontal scroll from 0 to 40px (client 262px, content 380px). Navigation is intentionally horizontally scrollable, rather than page overflow.
- Exact displayed code, offline exported source, clipboard text in both languages, downloaded solution.py, and denied-clipboard fallback textarea all equal canonical source. Fallback selected the complete text and focused the textarea; Chinese fallback screenshot was inspected. Blocking Python fetch still left exact offline source visible. Storage denial did not break language switching.
- No page/console/HTTP asset errors in completed suite. Local links and deep anchors resolved. Reduced-motion and forced-colors exercised.
- EN and Chinese at 320/390/736/1440 CSS px: no document overflow. At 320, five-column official matrix cells are 43.5px, six histogram bars about 40.33px. At 390 they are 55.16px and 52px. Both languages at 200% Chromium **CSS layout zoom**, 1280px viewport, remained within page width with readable matrix/legend. This is not browser-chrome zoom or physical-device testing.
- Computed styles: disabled text 6.45:1 on its surface, primary button text 13.10:1, successful feedback 10.00:1, incorrect feedback 6.35:1; orange focus against adjacent dark surfaces >=8.94:1. The offset separates focus from cyan controls. Buttons/select/summary/answer labels measured >=48px high. Unit geometry remained equal at height 4, including an actively outlined bar.

Actually opened and inspected screenshots: `cold-desktop.png`, `independent-pop390.png`, `independent-zh320.png`, `en-320-histogram.png`, `zh-390.png`, `en-1440-histogram.png`, `en-zoom200.png`, `zh-zoom200.png`, `zh-copy-fallback.png`, `en-quiz-320.png`, `zh-quiz-320.png`, `forced-colors.png`. Filled units match numerical heights, ✓ marks actual one-cells, orange row borders identify the bottom row, and the outlined sentinel remains visibly unfilled. Text wraps without losing formulas. The ledger requires its contained scroll on phones, confirmed operable by keyboard. Screenshots establish observed rendering, not novice comprehension.

## Scores and findings

| Dimension | Weight | Score | Observation/rationale |
|---|---:|---:|---|
|Problem, terms, hand calculation|15|4|Six-cell calculation precedes abstraction; characters, area units, consecutive bounds and zero-based axes are clear.|
|Causal derivation and saved work|20|3|Baseline repeated cell checks, reused heights and one-pop settlement are reconstructable. Minor friction: the supporting-interval argument and equal-height extension are compact prose; the equal-height preset ledger makes them concrete when operated. No missing essential bridge found.|
|Maintained state and correctness|20|4|Both invariants, new-top width, equal bars, zero reset, sentinel and cross-row best align with every inspected transition and independent oracle results.|
|Interaction and visual meaning|20|4|Prediction/reveal/change, full rewind, retained ledger, before/after values, and data versus highlighting have observable, consistent semantics.|
|Python and cost|15|4|Actual official callable executes independently, exact display/copy/download parity, concrete operation-15 mapping, correct amortized cost and no mutation.|
|Bilingual/device access|10|4|Equivalent reasoning and feedback, state-preserving locale switch, readable phone/desktop/layout-zoom views, keyboard and clipboard fallback verified.|

Weighted score: **95/100**. Required open finding IDs: **none**. No required mathematical, causal, interaction, translation or access defect was reproduced. The compact derivation observation is optional teaching polish, not a required finding or a prior closure.

## Conclusion and limitations

**Accepted** for this candidate revision and reviewed scope; independent lesson acceptance is separate from publication. Evidence supports reconstruction by this reviewer, not real human comprehension or a successful LeetCode submission. No deployment/public-delivery claim is made. Physical devices, screen-reader use, browser-chrome zoom and broader assistive-technology coverage were not tested. Custom matrices were executed against canonical Python and an independent oracle, not entered into the preset-only UI. The interrupted broad browser attempt and forced-click rerun are recorded above rather than hidden as a clean unmodified suite pass.
