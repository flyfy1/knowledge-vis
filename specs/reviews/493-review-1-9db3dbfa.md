# Independent review: 493 Reverse Pairs

Candidate: `2e4e59163e24274fab59545d98ac6af58d395a31`. URL: http://127.0.0.1:18776/leetcode/493/. Review date: 2026-10-25. Target: basic Python, lists, loops, functions, elementary recursion. Reviewer: this independent review run; model identifier unavailable. Frozen dimensions and weights: problem/terms 15, derivation 20, correctness 20, interaction 20, Python/cost 15, bilingual/device 10. Python preference applies.

## Cold walkthrough (recorded before source, tests, author notes, or earlier reviews)

Read only the frozen rubric, then opened the candidate in Playwright Chromium at 1280×900. The following predictions precede operating the corresponding reveal controls.

- Hand experiment prediction: [4,2,1] yields false, true, false for (0,1),(0,2),(1,2), hence running totals 0,1,1.
- Prefix prediction: L=[3,5,8], R=[1,2,4] yields q=1,2,2 and total 5; equality 8=2×4 remains excluded.
- Recursive trace prediction: child [2,1] counts zero and merges to [1,2]; parent [4] crosses only with 1, counts one, then merges to [1,2,4].
- Exercise prediction: L=[−3,0,4], R=[−2,0,2] has prefix lengths 1,1,2, total 4. Larger x cannot invalidate earlier successes even with negatives.
- Fresh independently chosen input: [5,1,2], predicted pairs (0,1),(0,2), total 2. The UI accepts presets only; this will be a **code check**, not a custom UI experiment.
- Fresh counterexample: [−2,−1], predicted zero because −2=2×−1, despite the tempting non-strict comparison accepting it. Also [−1,−1] predicts one despite equal values. These are likewise reserved code checks.

### Observed teaching steps

1. **Question:** Which original-position pairs qualify? **Action:** clicked “Check next pair” three times. **Observed:** rows (0,1):4>4 Exclude; (0,2):4>2 Count; (1,2):2>2 Exclude, final 1. **Conclusion:** strict doubling, not a plain decrease, determines inclusion; indices distinguish candidates. A concrete three-comparison example precedes the optimization; the visible baseline explains the quadratic cost.
2. **Question:** Why can one boundary replace many tests? **Action:** selected x=5, then x=8. **Observed:** right cells 1 and 2 count; 4 is excluded in both states; q=2, +2. **Conclusion:** sorted right values make a prefix; nondecreasing left values preserve prior successes. The text explains “prefix” and “monotone boundary” in ordinary terms, including negative values. Earlier x=3 had q=1.
3. **Question:** How does sorting respect original i<j? **Action:** advanced all five operations, rewound once and replayed. **Observed:** child count +0, child merge [1,2], parent count +1 (4>2 true, 4>4 false), parent merge [1,2,4], final answer 1. The ledger retained the two contributions; replay restored the same endpoint. **Conclusion:** the original index split guarantees cross-pair order; disjoint left/internal, right/internal and cross classes prevent double counting. Sorted local L/R offsets are explicitly distinguished from original indices. Count frames are expressly after scanning one x, not individual pointer increments. The invariant joins “counted exactly once” with “sorted on return.” The text's [3,1] global-sort counterexample and [2,1] ordinary-inversion counterexample explain excluded approaches without source help.
4. **Question:** Does the mechanism transfer to negatives? **Action:** selected 4 and checked. **Observed:** “Correct prediction”; full explanation q=1,1,2, equality failures at 0 and 4, total 4. **Conclusion:** multiplication by positive 2 preserves right-side ordering; no sign-based exception is needed. This changes the values and sign regime rather than repeating the tiny example.
5. **Question:** Where is the proof implemented? **Action:** expanded the full Python source in the browser. **Observed:** copy of nums, two recursive calls, q initialized once, strict while, q-mid contribution, temp merge and slice writeback. **Conclusion:** parent frame x=4 maps to q moving from mid=1 to 2, adding 2−1=1; the merge changes the internal copy, preserving caller input. The page explains recursion, half-open blocks, merging, level costs, stack and temporary slices.
6. **Question:** Is the explanation retained in Chinese? **Action:** switched EN→中 after completion with source open and answer revealed. **Observed:** hand rows, x=8, final trace/ledger, selected exercise and full source stayed visible. Chinese explanations preserved the strict comparison, original-block argument, invariant and cost. **Conclusion:** language switching changes explanation labels while preserving experimental state.

Cold screenshots: `493-evidence/493-review-1-9db3dbfa/cold-desktop.png` and `cold-zh.png`. Cold walkthrough saved before any repository source or test audit. No custom-input browser claim: the independent fresh arrays above remain code checks.

## Post-cold source and official-statement audit

Only after saving the walkthrough above, read the rendered-state supplement, canonical source, app/core, localized copy, markup/CSS, saved official provenance and test programs. No earlier review for 493 was present (the matching report was this report); no historical required finding was available to close. No BRIEF or SELF-CHECK claims were used to supply teaching explanations.

The [official statement](https://leetcode.com/problems/reverse-pairs/) opened normally through the web tool. It confirms original ordered indices, strict doubling, example results 2 and 3, length 1..50000 and signed 32-bit values. Lesson-local `provenance/official-graphql.json` retains the Python3 snippet `Solution.reversePairs(self, nums: list[int]) -> int`, matching the actual callable. The canonical preference is therefore satisfied with executable Python; the conditional non-Python language-contract audit is inapplicable. No claim of a successful submission is made.

`LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py` identifies Python's canonical `solution.py`, offline `python-code.js` and export `PYTHON_SOURCE`. Audited those names and the app's direct textContent assignment. Exact source parity, including final newline, passed for decoded mirror, DOM textContent, successful clipboard write/read, denied-API fallback textarea, native Control+C from its full selection, and downloaded bytes in both locales. The fallback restores clipboard contents to canonical source after a sentinel, so the native-copy check verifies more than just selection. Downloads remain in this run's evidence directory. No normalization was used.

### Candidate identity and integrity

`git rev-parse HEAD` returned the requested revision. The initial status contained only this review's report and evidence. Independent browser requests compared all nine lesson/shared served files byte-for-byte to the checkout; all matched. Hash receipts are in `independent-browser.json`. Important SHA-256 values:

- `solution.py`: `d1af2500b2a7d3c53add7bf5910a7afbac4be92f862d0a39d2a7d1d2eba6de2e`
- `index.html`: `bae3d061ca4fd70d4e269eb27ed60100a001dd752131cdd4d0bc1748fb7c1494`
- `app.js`: `f0b82273804ce4d47c837bcf3ad6f4d23c0f5a7f2747183bd16353d088300a8b`
- `core.js`: `6c48bd94118e698133f30c5ad39eab58d855e4b8e71d741c6682882d1e3bf79b`
- `copy.js`: `192edd7d4ed790e8d6ec0afe9e520080b6c661272fe035973a8df38a8d0f0d89`

### Independent executable and invariant checks

Executed the actual canonical source with Python `exec(compile(...))`, not its JavaScript simulation. The fresh predictions recorded before reveal passed: [5,1,2]→2; [−2,−1]→0; [−1,−1]→1. Additional hand cases passed: [7,3,1,0]→6, [−2147483648,−2147483648]→1, [2147483647,−2147483648]→1, [0]→0 and [0,0]→0. Caller arrays remained identical. For transparency, an initial auxiliary expectation of 5 for [7,3,1,0] was a reviewer arithmetic mistake: enumerating all six original pairs confirms 6, which the candidate returned. It is not a candidate finding.

A Python trace hook observed every actual `sort_count` return for [5,1,2]: singleton sorted blocks/count 0; [1,3) returns [1,2]/0; [0,3) returns [1,2,5]/2. All returned segments were sorted. At the parent, original left position 0 precedes both right positions; 5>2 and 5>4 include both, so q reaches hi=3 and contributes q−mid=2. The excluded-equality counterexample independently checks the opposite boundary. See `independent-code.json`.

The loop initializes q once per block, and both halves are sorted by child returns. Each q advancement preserves “all preceding right positions qualify”; at exit q is either hi or fails the strict test. Increasing left values preserves the previous prefix. The three original-block classes are disjoint and exhaustive, so summing child counts and cross prefixes counts each original pair once. Merge consumes one value at a time, including equal values via <=; remaining tails and slice writeback restore sorted order for the caller. Shrinking half-open blocks terminate at length ≤1. Empty input also terminates, although it is outside official constraints.

The canonical implementation scans and merges linearly per block; q does not restart per left value. At each level total block length is n, over O(log n) levels: O(n log n) time. The copied array, shared temp and peak slice temporary are O(n), stack O(log n), hence O(n) auxiliary space. The browser uses numeric `.sort()` for its illustrative merge; its retained frame history is separately labeled and is not the submission implementation or cost claim.

### Inspected tests and safely rerun checks

Read `tests/check.py`, `tests/core.cjs`, `tests/browser.cjs` and README before executing. Their default output would overwrite author evidence, so every run explicitly set `OUTPUT_DIR=specs/reviews/493-evidence/493-review-1-9db3dbfa`. Python ran with `-B`. No author asset/evidence was regenerated.

| Command from repository root | Result observed |
| --- | --- |
| `OUTPUT_DIR=specs/reviews/493-evidence/493-review-1-9db3dbfa python3 -B leetcode/493/tests/check.py` | Exit 0: 20,236 Python/oracle cases including three large fixtures; mirror parity and duplicate-key rejection passed. |
| `OUTPUT_DIR=specs/reviews/493-evidence/493-review-1-9db3dbfa node leetcode/493/tests/core.cjs` | Exit 0: 1,099 traces checked against independent enumeration and per-frame prefix/merge/ledger invariants. |
| `OUTPUT_DIR=specs/reviews/493-evidence/493-review-1-9db3dbfa node leetcode/493/tests/browser.cjs` | Exit 0: “browser pass; records: 20”. |
| `python3 -B scripts/register_leetcode_lesson.py 493 --validate-only` | Exit 0, no output. Complexity is exactly the nonempty string `O(n log n) time; O(n) auxiliary space`. |

These are reviewer reruns of inspected author programs, supplemented by the independent cold actions and fresh executable checks; their generated JSON retains the programs' original `kind: author self-check` labels. Test counts alone do not establish teaching quality. Large canonical cases include 50,000 negative ones returning 1,249,975,000, increasing nonnegative values returning zero, and all zeros returning zero.

## Rendered behavior, translations and access

- **Accounting and before/after semantics:** independently traversed the entire [4,2,1] trace during the cold walk. At frame 1 the child contribution is 0; at frame 2 the child merge adds 0; at frame 3 parent contribution is 1 and cumulative is 1; at frames 4 and 5 the same cumulative count remains. Initial state explicitly has no comparisons/merges; only completion calls it final. Contributions remain in the ledger and rewind removes later contributions. Cells label concrete L/R values and Count/Exclude, rather than relying on highlighting alone. The orange left border identifies the active x; cyan right borders identify its valid prefix.
- **Adversarial extremes:** independently operated the 32-bit extremes preset in both locales at 320 px. At parent frame 3/5, x=2147483647, q moves 0→2, contribution +2, cumulative 2. Right cells visibly show 2147483647>−4294967296 and 2147483647>0, both Count. Child x=−2147483648 contributes zero against 0. Rewind twice from completion reconstructs this exact parent state. `independent-browser.json` retains all five operations in both locales plus text geometry.
- **Controls and preservation:** both locales/all six presets reached final counts 2,3,1,1,0,2. Back/next replay restored readout, ledger and operation text; reset and preset changes returned to initial state. Start/end buttons disabled appropriately. All three prediction choices were revealed; changing the choice hid prior feedback, reset cleared choice and feedback, and language changes preserved selection/reveal, trace position and open source. Fresh keyboard checks used native select Home/ArrowDown/Enter, radio Space/ArrowRight and reveal Enter; the expected preset and answer appeared. Browser rerun also confirmed Tab/Shift+Tab navigation and a 3 px amber focus outline.
- **Localization binding:** duplicate-key-rejecting JSON parsing checked all 87 copy keys; every consumed entry is a nonempty [zh,en] pair matching the shared locale consumer. Independently read rendered EN/ZH strict-equality decisions, x=3/q=1 middle state, extreme doubled operand −4294967296, merge +0, and prediction answer q=1,1,2. Both translations express the same original-block guarantee, first-failing boundary and count unit. Prediction-mismatch feedback (“Revisit the strict test” / “再看严格比较”) explains the algorithm; clipboard fallback gives a separate selected-source instruction. Neither path substitutes for the other.
- **Layouts and screenshots:** browser checks exercised 320,390,736 and1440 widths in both locales, plus 780 px at CSS zoom 2. No page-wide horizontal overflow. Inspected desktop trace, English/Chinese 320 px halves, 390 px trace, both zoom captures, English hand-count and Chinese incorrect-prediction captures, and both 320 px extreme-value captures. Original number/index/test associations remain visible; long extremes wrap within individual cards without colliding with headers. The 390 px hand-table header “Decision” wraps awkwardly but remains readable. Sticky step navigation scrolls horizontally. The initial clipped-looking Chinese element capture was rechecked in a settled full viewport (`zh-320-settled.png`): the full R[0], R[1], R[2] labels are readable; this is not a reproducible text-clipping finding.
- **Contrast/disabled states:** computed contrast was 12.62 for explanation text, 13.40 for values/readouts, 13.10 for primary controls, and 6.45 for the disabled trace-back text against its panel. Disabled buttons retain full opacity and dashed borders. Focus and disabled semantics are observable and readable. Core meaning also appears as text, without a color-only dependency.
- **Operational robustness:** inspected browser rerun recorded no console/page errors or failed assets. Blocked storage and offline embedded-source disclosure worked. The lesson's JavaScript simulation is expressly distinguished from executing Python.

Evidence directory: `493-evidence/493-review-1-9db3dbfa/`. Concrete image examples are `cold-desktop.png`, `en-1440-trace.png`, `en-320-halves.png`, `zh-320-settled.png`, `en-320-extremes.png`, `zh-320-extremes.png`, `en-zoom200.png`, and `zh-zoom200.png`. Machine receipts: `independent-code.json`, `independent-browser.json`, `numerical.json`, `trace.json`, `browser.json`, and exact downloaded `download-en.py`/`download-zh.py`.

## Scores and findings

| Frozen dimension | Score /4 | Weight | Weighted points | Observation supporting score |
| --- | --- | --- | --- | --- |
| Problem/terms/hand calculation | 4 | 15 | 15 | Tiny three-pair hand count defines original positions and strict doubling before abstraction. |
| Causal derivation/saved work | 4 | 20 | 20 | Prefix and monotone-boundary reasoning explain included/excluded cases, avoid restarting scans, and preserve index validity through original blocks. |
| Maintained state/correctness | 4 | 20 | 20 | Explicit sorted-and-counted invariant, disjoint classes, visible cumulative ledger and independently checked transition/base/extreme cases. |
| Interaction/visual meaning | 3 | 20 | 15 | Prediction, replay, resets and retained contributions work; scan-complete frames require mentally reconstructing individual q comparisons, a minor granularity limitation. |
| Python/cost | 4 | 15 | 15 | Faithful executable source, exact transfer parity, fresh cases, input preservation and accurate cost derivation. |
| Bilingual/device | 3 | 10 | 7.5 | Equivalent reasoning and readable tested states with keyboard access; narrow layouts have long wrapped cards, split table heading and horizontally scrolling step navigation. |
| **Total** | | **100** | **92.5** | Every dimension ≥3. |

Required finding IDs: **none**. Required open findings: **none**. No earlier finding is claimed closed. The granularity and narrow-layout friction above are minor observations, not missing causal explanations, contradictory visuals or inaccessible essential content.

## Limitations and conclusion

This is an independent agent walkthrough and executable/browser audit, not a measured human novice comprehension study. Chromium was headless; width/device checks use desktop emulation, and 200% uses CSS layout zoom rather than physical device or browser-chrome zoom. Screenshots are supporting evidence for inspected states, not proof of every possible view. Official statement access succeeded; no login restriction was bypassed. No LeetCode submission, publication or deployment was performed or claimed. No candidate, shared file, author evidence, service or Git configuration was changed.

**Accepted for revision `2e4e59163e24274fab59545d98ac6af58d395a31`: 92.5/100, all dimensions at least 3, no required open finding, with browser/source/executable/parity and metadata evidence complete within the stated scope.** This review is separate from publication.
