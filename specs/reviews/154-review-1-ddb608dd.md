# Independent review: LeetCode 154

Candidate: `51654e51015ccfce12bff20a06e56cce8129d368`. URL: http://127.0.0.1:18786/leetcode/154/. Review date: 2026-10-18. Reviewer: this independent review run; exact model identity unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen rubric read first; weights 15/20/20/20/15/10, faithful Python interpretation. No source, tests, BRIEF, author notes or prior reviews opened before the following browser walkthrough.

## Cold walkthrough (recorded before source inspection)

Real Chromium through Playwright, desktop 1280×900. Read the rendered English page from top to bottom.

1. **Find 0 by hand.** Question: what does the input mean and what is returned? Action: read the worked rotation, ledger and baseline. Observation: `[2,2,2,0,1]` comes from three last-to-front rotations of `[0,1,2,2,2]`; ledger minima are `2,2,2,0,0`; output is value 0, not index 3. Conclusion: remembering the smallest seen value proves a linear baseline; duplicates and unchanged sorted arrays are allowed, empty arrays are excluded. Bounds and zero-based indices are explicit.
2. **What can we discard?** Question: why can a comparison save scanning? Action: follow both strict branches on the same example and read the paired equality counterexamples. Observation: `2>1` changes `[0,4]` to `[3,4]`; `0<1` changes it to `[3,3]`. Equality at m=2 in `[1,0,1,1,1]` and `[1,1,1,0,1]` conceals opposite minimum locations. Conclusion: greater proves a drop to the right; smaller retains m; equality can discard only the duplicate endpoint, since m substitutes for it. At least one global minimum must remain, not every copy.
3. **Watch the range shrink.** Question: what changes versus stays fixed? Action: read controls and cell legend before operating. Observation: original values and indices are data; kept/excluded status shows search range; old m is promised in history, not mislabeled as current state. Prediction before clicking: first comparison must retain `[3,4]`, exclude indices 0–2 without changing values; second must retain `[3,3]`, answer 0. UI is preset-only, so independently selected custom inputs will be code checks.
4. **Predict before revealing.** Question: does equality reveal direction? Action: read the fresh `[3,1,3,3,3,3,3]` question, before selecting/revealing. Prediction: choose removal of index 6, new r=5; m=3 duplicates its value. Returning 3 or moving l=4 loses the hidden 1. This is a reason-choice exercise, not a request to recall an answer.
5. **Proof and Python.** Question: why terminate, and what cost is actually promised? Action: read proof, code mapping, bounds and cost. Observation: l≤m<r whenever l<r, all three updates strictly shorten a nonempty interval; n−1 equality steps are possible. Conclusion: singleton plus invariant yields the minimum; worst-case O(n) time, O(1) extra space, no mutation. Strict halving alone supports the conditional logarithmic claim. Code area had no visible code in the first immediate text extraction; loading/visibility will be checked after interaction.

Independent fresh-case prediction, written before execution: `[4,4,-2,0,4]` should retain `[0,3]` by equality, then `[2,3]` by greater, then `[2,2]` by smaller, returning −2. Tempting-rule counterexample: `[2,0,2,2,2]` has middle=right=2; moving l=m+1 would remove the unique 0, while r−=1 preserves it. These are custom **code checks**, not UI custom-input experiments.

### Cold browser operations and results (still before source)

Applied each predicted hand-example comparison. Actual old/new ranges, compared values and history exactly matched both predictions: `[0,4]`, m=2, `2>1` → `[3,4]`; then m=3, `0<1` → `[3,3]`, displayed `return nums[3]=0`. Excluded cells retained their original values; history accumulated both transitions. Undo restored comparison 1. Switching to Chinese preserved comparison 1 and its range/history; Chinese explanations supplied the same rotation, three branch reasons, substitution invariant, termination and worst-case caveat. Switching back retained progress. Reset returned comparison 0.

Selected predicted reason B and revealed: feedback confirmed safe `[0,5]`, duplicate at m=3, unique minimum 1 lost by A, and incorrect early return by C. Changing to A cleared the old feedback immediately. Thus prediction, reveal and change were actually exercised. The code appeared after loading and showed the complete `Solution.findMin(self, nums: list[int]) -> int` with all three predicted updates, confirming the earlier missing text was a loading observation rather than absent code. Screenshot: `154-evidence/154-review-1-ddb608dd/cold-desktop.png`.

Cold walkthrough saved before beginning source/claims audit. No conclusion here claims actual novice comprehension.

## Independent source and execution audit

HEAD equals the requested revision. No earlier review for 154 was found under `specs/reviews`; no previous finding is being closed. Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python maps to `solution.py`, `python-code.js`, `PYTHON_SOURCE`. Those are the actual files here. Python is the preferred faithful language; the non-Python contract requirement does not apply. The saved lesson-local official response contains the Python3 `Solution.findMin(self, nums: list[int]) -> int` stub, matching the canonical source. Independently opened the [official statement](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array-ii/) normally: minimum element, duplicates, rotation definition, n=1..5000, values −5000..5000 and both examples agree. No access bypass or submission was attempted.

### Fresh predictions checked against actual canonical Python

The original fresh-case **answer prediction was correct but my predicted path was wrong**. Executing `solution.py` with Python line tracing showed `[4,4,-2,0,4]` starts with m=2, `−2<4`, so `[0,4] → [0,2]`; next m=1, `4>−2`, gives `[2,2]`. Answer −2. My earlier equality prediction confused the middle value with 4. This is reviewer arithmetic corrected by independent execution, not a candidate defect. Original prediction above is preserved.

The chosen wrong-rule counterexample `[2,0,2,2,2]` executed as `[0,4] → [0,3] → [0,1] → [1,1]`, answer 0; the first equality removes only r. The wrong `l=m+1` would immediately exclude index 1. Additional `[3,1,2]` returned 1 and demonstrates why the smaller branch must retain m rather than set r=m−1. Independently executed singleton `[-5000]` (zero comparisons), `[5000,-5000]`, `[0,0,1,2,0]` (minimum at both ends), 5000 identical −5000s (4999 comparisons), and length 5000 with one hidden −5000 among 5000s (76 comparisons). All matched independent `min`, preserved input contents and retained a global minimum at every precomparison interval.

Additional prediction before execution: for `[4,4,4,-2,0,4]`, expect equality `[0,5] → [0,4]`, then greater `[3,4]`, then smaller `[3,3]`, answer −2. This custom case is also a code check.

Additional equality-case execution matched the predicted −2 answer in canonical Python, and the independently asserted JS trace ranges were exactly `[[0,5],[0,4],[3,4],[3,3]]`.

### Visual-to-code and invariant reconstruction

The first visible hand-example transition uses the **old** bounds l=0,r=4. Python computes `m=(l+r)//2=2`, reads `nums[2]=2` and `nums[4]=1`, enters `if nums[m] > nums[r]`, and sets `l=m+1=3`; r stays 4. The renderer marks precisely indices 3 and 4 kept and logs old m=2 separately. The next smaller branch sets `r=m=3` without dropping m. Equality removes old r while m<r remains available as its equal-valued replacement. Each frame uses values from the unchanged original array, not from the newly retained interval's reindexed copy.

The maintained statement is existential: at least one global minimum stays in the inclusive interval. Strict branch exclusions follow the two ordered runs of a rotated nondecreasing sequence; equality carries no directional information. Starting with the entire nonempty array establishes the invariant; each update shrinks its positive length, and singleton termination identifies the output value. Repeated minima need not all survive. Python uses only bounds and a midpoint, so constant auxiliary space is accurate; UI frames/history are explicitly separate. All-equal length 5000 took 4999 iterations, substantiating worst-case linear time. No input assignments occur, and mutation checks agreed.

### Tests inspected before execution; independently rerun safely

Read `tests/check.py`, `trace.cjs`, `browser.cjs` and README before running them. `check.py` executes the actual canonical `Solution.findMin`, uses a linear oracle, small sorted multiset rotations, seeded cases and extremes, then invokes trace assertions. Browser tests check the actual DOM, controls and source bytes, not merely screenshots. Output paths are overrideable; the trace child writes only stdout. No candidate assets or earlier evidence were regenerated.

From the repository root:

- `OUTPUT_DIR=specs/reviews/154-evidence/154-review-1-ddb608dd python3 -B leetcode/154/tests/check.py` — exit 0; 10,086 executed Python cases, unchanged inputs; 45,340 intermediate trace transitions checked. Mirror bytes and translation placeholders matched. Saved `algorithm.json`.
- `OUTPUT_DIR=specs/reviews/154-evidence/154-review-1-ddb608dd node leetcode/154/tests/browser.cjs` — exit 0, “Browser self-check passed.” Saved browser measurements and screenshots in this run's exclusive directory. This is a reviewer rerun of inspected author tests, additional to the independent cold operations and fresh cases.
- `python3 -B scripts/register_leetcode_lesson.py 154 --validate-only` — exit 0, no stdout. `lesson-entry.json` complexity is the single nonempty string `O(n) worst-case time; O(1) auxiliary space`. No registration was run.

Browser assertions covered both locales, nine presets, every forward/back state, reset/finish, scrub endpoints, singleton disabled endpoints, all three predictions, explicit reveal and feedback clearing on change. Locale toggles preserved trace, selected answer, revealed feedback and open source disclosure. Displayed code, successful clipboard copy, denied-clipboard fallback text and selected length, downloaded source, offline mirror and canonical source matched exactly. Denied clipboard focused and selected the full read-only textarea; the status translated correctly. Offline controls/code and denied storage remained usable. No console/page/HTTP errors were observed.

Keyboard Enter advanced once, range Home/End reached boundaries, Space activated the locale control and kept focus; visible focus outline measured 3px. Independently exercised native Tab from Undo to Next. At 320px, focused history plus ArrowRight changed horizontal scrollLeft from 0 to 40, making the clipped final column reachable without whole-page overflow.

### Device, translation and screenshot inspection

Read rendered Chinese alongside English, including strict-branch explanations, equality counterexamples, invariant, cost, exercise feedback and control labels. No material reasoning difference found. Both provide a concrete scan before notation; inclusive bounds and “invariant” are defined before proof. Both preserve values while labels/borders/strikethrough distinguish kept and excluded positions.

Measured 320/390/736/1440 CSS-pixel widths in both languages: document scrollWidth equaled viewport width. Minimum cell widths at 320 and 390 were 124 and about 102.66px. Native controls met tested 48px dimensions. History intentionally scrolls inside its focusable region at 320, with explanatory text and verified keyboard access. Contrast samples ranged from 6.45:1 for excluded values to 13.40:1 for retained labels; disabled Next text against its actual background measured 7.08:1. Disabled states use opaque readable text and native disabled behavior.

Captured and visually opened `focused-en-320.png`, `focused-en-390.png`, `focused-zh-320.png`, `focused-zh-390.png`, `focused-en-1440.png`, `zoom200-en.png`, `zoom200-zh.png`, `independent-zoom200-zh.png`, and `independent-keyboard-320.png`. Observed wrapping indexed cells, readable kept/excluded labels, unchanged values, scrollable narrow history and a clear orange keyboard focus ring. The initial Chinese zoom screenshot was captured at a scroll offset that hid most of the cells above the viewport; an independently captured stable reduced-motion zoom screenshot shows all five cells and the history clearly. This is viewport positioning, not absent content. The 200% checks use document CSS zoom at desktop 1440×1000, not OS display scaling or a physical device. Both languages reflowed without document overflow; navigation can scroll horizontally.

### Candidate identity and served bytes

Compared served bytes with local candidate files for HTML, source, mirror, app, core, translations, lesson stylesheet and both shared assets; all identical. `git status --short` after test execution showed only this report and its evidence directory as untracked. Relevant SHA-256 identifiers:

| Asset | SHA-256 |
| --- | --- |
| index.html | bc311d54599d47ede9d6c7e8d68b553e93e52d363f630b36579fa7c16b58a84f |
| solution.py | 18c0d4e4406595b5673025068deb95ebebb28ba0d17c65e99dba13057bd69ea1 |
| python-code.js | 4a006da5545dc7ea8eac2a555f4a8b8540a1ff7b4f81da7aaa20a0bb08767379 |
| app.js | eb218ca37e45511f111842d028f53c015b8361e442ea8b0fc62fb656c1f0cdce |
| core.js | 5a7bb980837915fbf353d7242fdb6f4cd8e0d3bc3217c1cd3dc73dbdeb094661 |
| copy.js | c49b80f6cab3b2ae88d973f1a6903450449055889f6556dd808a55c6f244c932 |
| style.css | 4f9053cc40a464bae9ca59ce5b6fc4d11a11740fd76e011c8bb2709ee7c44766 |
| ../common.js | f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b |
| ../style.css | 6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27 |

## Findings and scores

Required open IDs: **none**. No earlier required findings exist in the inspected review directory for this ID; no closure is claimed.

**154-R1-01 — low, advisory, open (not required):** Proof and Python, both locales, candidate above, desktop/mobile. Reproduction: open the complete-source disclosure as a reader whose Python knowledge covers functions but not classes. Expected polish: briefly identify `class Solution`/`self`/type annotations as the official wrapper and `//` as floor division. Actual: the algorithm lines are mapped explicitly, while that wrapper syntax is left implicit. This is minor friction in the Python-transfer dimension, not a broken causal algorithm bridge or an invalid submission interface. Owner/next action: lesson author may add a short wrapper note in a future revision. Fix revision/regression/closure: none, not claimed. Supporting evidence: canonical source and source disclosure; rubric target-reader and transfer clarity.

| Dimension | Weight | Score | Observation supporting score |
| --- | ---: | ---: | --- |
| Problem/terms/hand calculation | 15 | 4 | Correct value-versus-index distinction, rotation and nondecreasing definitions, complete tiny scan ledger and official bounds before abstraction. |
| Derivation/saved work | 20 | 4 | Baseline comparisons and ignored order explained; strict branches reason about the rotation drop; paired opposite-side equality counterexamples expose both unsafe directional rules. |
| Maintained state/correctness | 20 | 4 | Inclusive existential invariant, substitution argument, strict shrink, singleton and boundaries reconstructable; independently executed canonical source and intermediate checks agree. |
| Interaction/visual meaning | 20 | 4 | Predictions matched visible before/after transitions and persistent history; unchanged values separated from search status; rewind/reset/finish/scrub and fresh exercise reveal/change work. |
| Python/cost | 15 | 3 | Faithful executable interface and exact source parity, fresh cases and mutation checks pass; worst-case and auxiliary space justified. Official class wrapper syntax remains implicit for the stated beginner. |
| Bilingual/device | 10 | 4 | Equivalent causal reasoning in both locales; state survives locale changes, mobile cells and accessible history scroll work, keyboard focus and disabled text remain readable, 200% CSS zoom inspected. |

Weighted total: **96.25/100** (`15+20+20+20+11.25+10`). Every dimension ≥3; no required open finding. Scores derive from observed reasoning and operations, not test or screenshot counts alone.

## Limitations and conclusion

Headless Chromium with real rendered pages and native controls; no physical-device, screen-reader, OS-scale or real novice teach-back study. Official Python selector stub was checked in saved lesson-local official evidence; the independently opened public statement did not expose an interactive editor selector in its extracted text. Custom inputs were executed as code checks because the UI offers presets only. No successful LeetCode submission, learner comprehension, publication or deployment approval is claimed.

**Accepted** for candidate `51654e51015ccfce12bff20a06e56cce8129d368` and the local review scope. Publication remains a separate action. Only this exact report and its exclusive screenshot/evidence directory were written.
