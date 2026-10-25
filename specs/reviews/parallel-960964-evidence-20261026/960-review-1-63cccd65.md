# Independent review: LeetCode 960

Candidate: a85f8ad95c969aae56e1c9f698c21c175c7464cb. URL: http://127.0.0.1:18789/leetcode/960/. Target: basic Python, lists, loops, functions, elementary recursion. Reviewer: this independent review run; exact model identifier unavailable. Frozen weights: 15/20/20/20/15/10. Python interpretation applies. No author/source/tests/prior reports read before the following browser walkthrough.

## Cold walkthrough (recorded before source audit)

Initial browser: Chromium via Playwright, 1440×1000. Inspected full-page screenshot `960-evidence/960-review-1-63cccd65/cold-initial.png` and rendered text. Five teaching steps are visible; no custom-input field is offered.

Predictions recorded before operating reveal/trace:
- Worked ["bac","abc"]: delete one shared column (0 or 1); dp lengths should be [1,1,2]. Column 1 fails after 0 in row 0; column 2 can follow either.
- Exercise ["azbc","abcd"]: one deletion, removing column 1, retains [0,2,3] → "abc"/"acd". z blocks later b/c.
- Independently chosen fresh input ["bdac","aceb"]: only [0,1] or [2] or [3] can form best endings; predict dp [1,2,1,1], answer 2. In particular 0→3 fails in row 1 (a≤b passes actually), so revise BEFORE execution: 0→3 passes b≤c/a≤b; dp [1,2,1,2], answer 2. 1→3 fails d>c and c>b; 2→3 fails e>b. This will be a code check because the UI offers presets only.
- Independently chosen counterexample ["ab","ba"]: predict answer 1, although checking row 0 alone would keep both. A compatible link must pass every row. This also will be a code check.

Initial observations by step:
1. Question: where should the shared cut go? Action: read the indexed two-row example and definition. Result: 0-based column indices, equality allowed, each row internally sorted, rows not compared to each other. Conclusion: deleting a column is one shared positional operation, not independently editing strings.
2. Question: why not keep the first legal column? Action: read baseline enumeration and the two traps. Result: eight subsets for three columns, exponential cost, cab/abc defeats first-column greedy, abc/cba defeats first-row-only testing. Conclusion: each possible ending must remain available because an early choice can obstruct later growth.
3. Question: why does the last kept column summarize the past? Action: read the tiny worked transitions, recurrence, invariant, then inspect initial simulation. Result: uncomputed cells are em dashes; completed columns 0/3, no answer reported. Conclusion: the ledger represents optimal lengths for endings, not deletions or a sorted copy of input. Transitivity permits only checking the preceding column; every predecessor must be considered.
4. Question: how many cuts for azbc/abcd? Action: read prompt, withhold reveal, predict above. Result: three unselected choices, derivation hidden. Conclusion: this asks transfer using the obstructing z, independently of trace state.
5. Question: how does this become Python? Action: read rendered official-style Solution.minDeletionSize and explanation. Result: nested j/i/r loops, > rejection, max update, m−max(dp), cost O(nm²)/O(m), input not mutated. Conclusion: trace i=0,j=2 corresponds to compatible row checks and dp[2]=max(1,dp[0]+1)=2; equality and singletons explain boundaries.

Further cold browser operations and results follow before any source audit.

Cold operations completed:
- Step 1 reveal: clicking Show/hide exposes "bc"/"ac" after deleting column 1, and proves zero fails via b>a. My predicted minimum 1 is confirmed; ordering whole rows is irrelevant.
- Step 3: click Next three times. At 1/3, dp[0]=1 and other values remain —; at 2/3, candidate 0→1 explicitly shows b>a fail and a≤b pass, dp[1] 1→1. At 3/3, both 0→2 and 1→2 show both row comparisons; updates are 1→2 and 2→2. Ledger [1,1,2], chain [0,2], resulting "bc"/"ac", final 3−2=1. Conclusion: compatibility is conjunction across rows, ties are retained without inflating the length; the highlight marks the processed column, not a deleted column. Screenshot `cold-complete.png` captured.
- Undo at endpoint returns to 2/3 and Reset returns 0/3. Conclusion: the visible history is reversible completed-column state, not input mutation.
- Step 4: choose 1 column and reveal: Correct, dp=[1,2,2,3], explicit blocking z and surviving [0,2,3]. Changing choice to 0 hides the derivation and asks for a new check. Conclusion: prediction precedes feedback and changing a prediction invalidates prior feedback.

Cold walkthrough saved at this point, before opening implementation or contract. No missing explanation was supplied by source. Custom fresh inputs remain pending code checks, not UI experiments.

## Source, official statement, and candidate audit

HEAD is exactly the requested a85f8ad95c969aae56e1c9f698c21c175c7464cb. HTTP bytes were independently compared with disk for index.html, core.js, app.js, copy.js, python-code.js, solution.py and style.css; all match. Identity anchors (SHA-256):

- index.html: `76000742f3148b438ddcdea12aef20fe7d0ccad4f3fc6d36ea3420e2bfe5cf92`
- core.js: `6c55e1aa31283a65420c25d5d241bbc6f3103653a49049545711d46c10376493`
- app.js: `1f9b27e03fc2ca20d94ff86aae89658165d8e10052203dbfbf72e58ea7b55442`
- copy.js: `60781b9e2bc2cccf787968b99753410c6fefcaa45ec5f9c4bc41974dec5b089c`
- python-code.js: `3172ec6abd3548cbc5ac07aa0f4a6cebe33e0ef5d82f8fea56492f122ce4ca24`
- solution.py: `3799b28e3f572097135d0afe25d50366b6f89825c4ca7efbd5e9bf14ad2e56ac`
- style.css: `5a1a7f93562b4020d8f4021d9cc9b3bcae55b99464b4a1ef68510aa3a081d6e5`

Read the [official statement](https://leetcode.com/problems/delete-columns-to-make-sorted-iii/) normally through the web reader, without bypass: shared deletion indices, independently nondecreasing rows, examples 3/4/0, 1–100 rows and columns, equal length and lowercase letters match the lesson. Saved local official provenance includes Python3 `Solution.minDeletionSize(self, strs: list[str]) -> int`; the canonical source faithfully implements it. Official live editor selector was not independently exercised; no non-Python language contract applies. Read LANGUAGE_FILES in scripts/register_leetcode_lesson.py: Python maps to solution.py / python-code.js / PYTHON_SOURCE, exactly as used here. No conceptual analogy substitutes for the callable.

Source reasoning: Python creates its own dp list and only reads strs. For every j, the singleton 1 is feasible. Every longer valid chain ends with some i<j; removing j bounds its length by dp[i], and compatibility permits attaining dp[i]+1. Max over all such candidates is exact. j order completes dependencies before use. The best ending across all j is the longest jointly valid subsequence, whose complement is the minimum deletion set. Rejection uses >, preserving equal characters. At m=1, loops do no pair work and the final result is 0. At n=m=100, 4950 pairs × 100 rows = 495000 comparisons is the advertised maximum. Initialization/max cost O(m) is absorbed by O(nm²) on the official positive domain. Python auxiliary space is O(m); the JS snapshots and paths use additional teaching memory, explicitly separated. The baseline actually enumerates and stores subsets, explaining its O(nm·2^m) time and O(m·2^m) space.

The simulation evaluates all rows even when Python short-circuits after a failure; this supplies comparison evidence, produces the same compatibility decision, and is explicitly labeled a simulation. Its frame is after an entire column, with each predecessor's old/candidate/new value retained. Earlier completed dp values are preserved; uncomputed em dashes are distinguished from zero. A candidate's own value is not confused with the retained maximum or representative path. Ties preserve the first chain and are labeled as one optimum.

## Executed verification

Tests were read before running. OUTPUT_DIR was set to this run's exclusive evidence directory, preserving author evidence. Commands run from the repository root:

- `OUTPUT_DIR=specs/reviews/960-evidence/960-review-1-63cccd65 python3 -B leetcode/960/tests/numerical.py` — exit 0; 7064 cases, canonical Python executed, baseline also checked on 500 seeded cases. Independent enumeration builds resulting strings and compares to sorted copies. Exhaustive binary matrices and valid maximum boundaries pass. Input mutation checks pass. Duplicate localization keys rejected before parsing; all 86 entries are nonempty two-string pairs; mirror exactly matches canonical source.
- `OUTPUT_DIR=specs/reviews/960-evidence/960-review-1-63cccd65 node leetcode/960/tests/core.cjs` — exit 0; 4102 cases. Every completed ending length, predecessor old/new value, candidate count and representative path checked against a subset oracle.
- `OUTPUT_DIR=specs/reviews/960-evidence/960-review-1-63cccd65 PREVIEW_ROOT=http://127.0.0.1:18789 node leetcode/960/tests/browser.cjs` — exit 0; 36 recorded states, 38 screenshots, no browser errors. These are inspected existing test programs rerun by this review, not independent teaching judgment inferred from counts.
- `python3 -B scripts/register_leetcode_lesson.py 960 --validate-only` — exit 0, no output. Metadata complexity is exactly the nonempty string `O(nm²) time; O(m) auxiliary space`. No registration or repair performed.

Separate reviewer-selected canonical-source code checks executed through runpy with -B: ["bdac","aceb"] returns 2 as predicted after the explicitly recorded pre-execution correction; ["ab","ba"] returns 1, excluding the tempting first-row-only rule. Also ["q"]→0, ["aa","zz"]→0, ["abc","cba"]→2, and 100 identical length-100 all-a rows→0. Inputs remained unchanged. These custom cases are **code checks**, not UI experiments. The fresh example's compatible links 0→1 and 0→3 give dp [1,2,1,2]; 1→3 and 2→3 fail, so no length-3 chain exists.

Browser evidence in `browser.json` and inspected screenshots establishes:

- Both locales: all six preset endpoints [1,3,4,0,0,1]; each intermediate ending length compared with exhaustive subsets. Initial/endpoint disabled controls, rewind/replay, rewind to start, reset, and preset changes behave as labeled. Locale roundtrips retain the ledger and progress. Simulation resets do not erase the independent prediction.
- All three predictions: choice precedes reveal; wrong choices receive corrective reasoning; changing a choice hides old feedback. Locale roundtrip retains the chosen answer and equivalent feedback. Separate reviewer browser read in Chinese at 390 px after two advances and correct reveal retained 2/3, j=1, [1,1,—], failed b>a and successful a≤b, and correct exercise derivation. The formula includes full indices, singleton, compatibility and subtraction in both locales. Chinese proof preserves the upper-bound/construction directions, not an unsupported optimal-substructure assumption.
- Exact untrimmed canonical source equals decoded offline mirror, DOM textContent, successful clipboard write, native manual fallback readback, and downloaded bytes in each locale, including final newline. Two fallback attempts per locale each seed and verify a distinct non-source sentinel before automatic writes are rejected; focus/full selection and Linux Control+C transfer are checked. This prevents stale clipboard content from passing. Downloaded copies remain in this evidence directory.
- Chromium 156.0.8078.4 on Linux. Keyboard Enter advances, Tab moves to reset, visible focus is 3px solid rgb(255,180,84). Both related links activated by keyboard in both languages and reach actual sections. Independently read #115 step0: position choices and aaa→aa; #801 step2: retained optimum for each ending state and concrete transitions. Labels accurately describe these continuations. Forced-colors focus and denied-storage fallback also pass.
- Widths 320/390/736/1440, both locales: no page overflow, ledger fits, candidate paragraphs wrap; native selected labels fit with the recorded 24px arrow reserve. At 320, select client width 256, horizontal padding 30, measured English label 184.064px and Chinese 163.520px. Font stack is PingFang SC / Microsoft YaHei / system-ui / sans-serif; exact resolved font was not inferred.
- Native Chromium tabs.setZoom(2), outerWidth=1280, innerWidth=640, DPR=2. Both zoom captures inspected: table and candidate calculations remain readable, no text intersections. Navigation remains horizontally scrollable.
- Contrast helper was inspected and calibrated on black/white, primaries and the 4.492948 near-threshold gray case. Solid role-pair minimum text contrast is 6.449407898769069:1. Disabled text remains rgb(154,167,184) on rgb(28,35,48), opacity 1; inspected mobile screenshot shows legible disabled controls. This measurement covers the tested solid colors, not arbitrary gradients or every platform.

Images actually opened and inspected in this review: cold-initial.png; pairs-en-320.png; table-zh-320.png; trace-en-390.png; zoom200-en.png; zoom200-zh.png; preset-en-320.png; preset-zh-320.png; pairs-zh-390.png; table-en-320.png. Their visible text confirms association, wrapping and state readability; screenshot counts alone were not used to score.

## Findings and scores

No earlier review report for #960 was present when searched after the cold walkthrough. No earlier finding is claimed closed. Required finding IDs: none. Required open: none. No candidate files changed; git status shows only this report and this run's evidence as new review artifacts.

| Dimension | Weight | Score (0–4) | Observation supporting score |
| --- | ---: | ---: | --- |
| Problem/terms/hand calculation | 15 | 4 | Shared indexed cuts, equality, row-vs-array ordering, and explicit bc/ac lower-and-upper-bound hand calculation precede abstraction. |
| Derivation/saved work | 20 | 4 | Executable exhaustive baseline and cost lead through concrete greedy failure to last-column sufficiency and transitivity; included and rejected links both explained. |
| State/correctness | 20 | 4 | Defined dp ending invariant, singleton, dependency order, bound/construction proof, endpoint conversion and equality/one-column boundaries reconstructed and checked. |
| Interaction/visual meaning | 20 | 4 | Prediction matched three visible transitions; input remains fixed, ledger and candidate old/new values distinguish data from highlight, rewind/reset and feedback invalidation work. |
| Python/cost | 15 | 4 | Faithful executable callable, concrete i=0,j=2 mapping, independent fresh/counterexample checks, exact source parity and justified actual time/space/mutation semantics. |
| Bilingual/device | 10 | 4 | Equivalent causal reasoning and live state labels, state-preserving locale switches, readable narrow/zoom captures, keyboard, contrast and native source fallback verified. |

Weighted total: 100/100. All dimensions ≥3; zero required open findings; required evidence complete for the reviewed environment. **Accepted** for this candidate revision and review scope, separate from publication.

Limitations: preset-only browser; custom inputs checked in canonical Python. This is an independent reconstruction and executable/browser audit, not observed novice comprehension, a successful LeetCode submission, deployment verification, or proof for every browser/font/assistive-technology environment. Official statement was directly accessible; live official editor selector was not separately exercised. No non-Python contract audit is needed because a faithful Python interface is supplied.
