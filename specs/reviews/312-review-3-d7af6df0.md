# Independent review: 312 Burst Balloons

Candidate: `45acf761d4586604808e90171f14b3e13647904c`. URL: http://127.0.0.1:18770/leetcode/312/. Review date: 2026-10-25. Target: basic Python, lists, loops, functions and elementary recursion. Reviewer: this independent review run; exact model identity unavailable. Frozen rubric read first; weights 15/20/20/20/15/10. No brief, implementation, tests or earlier reviews were read before this record.

## Cold browser walkthrough (saved before source audit)

Real Chromium through Playwright, desktop 1365×1000. Screenshots: `312-evidence/312-review-3-d7af6df0/cold-initial.png` and `cold-frame4.png`. Initial screenshot inspected.

| Step/question | Action | Observable result | Causal conclusion in my own words |
|---|---|---|---|
| 01: What changes when a balloon disappears? | Read statement and manually follow [3,1,5]. | 1 first earns 15, then 3 earns 15, then 5 earns 5; total 35. 5 first has continuations totaling 11 or 9. | Neighbors mean surviving neighbors, so a balloon's original value alone cannot determine a good first choice. Input values, all-burst objective, sentinels and constraints are stated. |
| 01: Why avoid enumerating orders? | Read baseline after hand example. | n! orders and about O(n·n!) simulation cost; repeated remaining intervals described. | Many prefixes lead to repeated subproblems. The page asserts this briefly rather than illustrating two prefixes sharing one subproblem. |
| 02: What makes an interval reusable? | Read last-balloon recurrence and invariant. | Two sentinel 1s, open interval, three-term recurrence, fixed boundary explanation. | Keeping last alive separates the two sides; once both sides finish, its neighbors are the interval endpoints. Each possible last must be considered. “Open interval” is used without a separate numeric index demonstration here. |
| 03: What does a frame compute? | Select [3,1,5], click Next six times. | Saved cells appear: (0,2)=3; (1,3)=15; (2,4)=5; (0,3)=30; (1,4)=30; (0,4)=35. Frame 4 says candidate last 1, value 30; comparison k=1:30, k=2:8. Final candidates 33,9,35. | Shorter widths precede longer widths. I can reconstruct 30 as 0+15+1×3×5, but the frame itself does not display these operands or identify the padded values. The table shows completed maxima, not each candidate calculation. |
| 03: Are history and highlights meaningful? | Previous from final, then Reset. | Final Next disabled; Previous returns 5/6 and removes dp[0][4]=35 while earlier cells remain. Reset returns 0/6 and all zeros. | Rewind reconstructs the earlier table; orange denotes the current completed cell and blue saved nonzero values, not a new balloon. |
| 04: Can I transfer the neighbor rule? | Before Reveal, predict answer 1×2×1=2 for the stated [2,1,2] exercise; choose second radio and Reveal. Then choose first radio and Reveal. | Correct feedback explains endpoints values[0]=values[4]=1 and chosen values[3]=2. Changing choice hides prior feedback; wrong reveal explains why the removed left balloon must not remain a neighbor. | The product term is only the last gain, not the full DP optimum. The distractors expose stale-neighbor and wrong-index mistakes. |
| 05: How does the proof reach Python and cost? | Read proof and mapping; do not open source yet. | Padding, width starting at 2, answer cell and O(n³)/O(n²) are stated. | Two endpoint loops and a candidate loop suggest cubic work; the page gives the conclusion but does not count states/candidates. The proof's “every order ... two optimal subproblem solutions” is imprecise: arbitrary orders need not use optimal sides. The intended optimization argument is recoverable. |
| Bilingual meaning | Switch to Chinese after the wrong reveal. | Same worked arithmetic, invariant, table, selected wrong answer and explanatory feedback remain in Chinese. | Reasoning is equivalent on these observed paths; locale switching preserves the exercise state. |

Independent fresh input prediction, recorded before code execution: [2,3,1] should give 12. Order 1,2,3 (values) gives 3+6+3=12; 2 first gives 6 plus at most 6, also 12. Enumerating all six orders should verify the optimum. Fresh counterexample to largest-first: [2,3,4]; largest-first gives 12+6+2=20 at best, while 3 first then 2 then 4 gives 24+8+4=36. These are **code checks pending**, since the UI has only presets. Independent boundary predictions: [0]→0, [7]→7, [0,0]→0, [1,1]→2. No custom-input UI experiment is claimed.

Cold-walk limitation: the table's candidate totals are visible but the three actual addends and dependency cells are not explained numerically in the frame. Whether this meets the detailed teaching gate will be assessed against the rendered contract after this save. The author's verification paragraph is a claim observed on the page, not evidence adopted by this reviewer.

## Candidate identity and audit evidence

After the cold record was saved, `git rev-parse HEAD` returned the specified revision. HTTP response bytes matched local `index.html`, `copy.js`, `core.js`, `app.js`, `style.css`, `python-code.js`, and `solution.py`. Representative SHA-256 hashes: index `74ccb0c75aae4894803826d7b24fd45aa03900667b1ccde6f6df8de7da1ff48d`; copy `4306da3b208f6c4f61988391edf5b5049e370878cbecc113d4c42891c3ddaa2e`; solution `88ca4fde4d2a68279c8b41ef99e6e43229a98321885d4f5122c3d8d6fc5cfcf0`. Final Git status showed only this report and its exclusive evidence directory as untracked. No implementation or earlier evidence changed.

The [official statement](https://leetcode.com/problems/burst-balloons/) was read normally through the web tool and was accessible: original zero-based balloon indices, current-neighbor products, boundary 1s, examples 167 and 10, n≤300, values 0..100 agree with the lesson. The fetched statement does not expose editor selector/template contents. The local Python contract and saved `tests/evidence/official-contract.json` were inspected; Python is preferred, and `Solution.maxCoins(self, nums: List[int]) -> int` is the actual canonical source. Its rationale is faithful list-to-integer computation, without a conceptual-language substitution. Python and TypeScript are both present in supportedLanguages. No non-Python canonical submission is used, so the special independent non-Python selector audit is inapplicable; completeness of the entire official language selector was not independently established.

`LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py` specifies `solution.py`, `python-code.js`, `PYTHON_SOURCE` for Python. Exact source parity passed without trimming: browser `textContent`, embedded string, successful real clipboard copy, fallback textarea value and selected text, actual fallback Control+C/readback, and downloaded bytes all equal the canonical file, including final newline. Full source was expanded and visible. The clipboard failure was induced by a controlled rejected write; successful clipboard access used Chromium permissions.

Required non-mutating preflight, from repository root:

```
python3 -B scripts/register_leetcode_lesson.py 312 --validate-only
```

Result: exit 0, no output. Metadata complexity is exactly one nonempty string: `O(n^3) time; O(n^2) auxiliary space`.

### Executable correctness, transitions and boundaries

Executed the actual canonical Python through `runpy.run_path`, not the trace. A separate recursive oracle bursts each possible **first** balloon, removes it, and recurses; it does not reuse the interval recurrence. Results: [2,3,1]→12, [2,3,4]→36, [0]→0, [7]→7, [0,0]→0, [1,1]→2, [2,1,2]→10, [3,1,5]→35 and [3,1,5,8]→167. Original input lists stayed unchanged. Another 100 deterministic random cases, length 1..6 and values 0..5, matched this independent oracle. At official maximum n=300, all zeros→0, all ones→300 and all hundreds→298010100 (298×100³+100²+100) passed. Padding creates a new list, and table rows are distinct lists; the input is not mutated.

Correction to the cold counterexample prediction: repeatedly choosing the largest on [2,3,4] gives 20, but **the best continuation after choosing 4 first** gives 21 (burst 2 then 3). Either is below 36. The independently checked better order is 3,2,4: 24+8+4=36. The initial “at best 20” claim is withdrawn; the cold record is preserved above.

Visual-to-code mapping independently reconstructed for [3,1,5], padded [1,3,1,5,1]: frame 3→4 changes dp[0][3] from 0 to 30. For last=1, dp[0][1]+dp[1][3]+v[0]v[1]v[3]=0+15+15=30. For last=2 it is 3+0+5=8. These map directly to the `best=max(...)` loop and subsequent assignment. Shorter intervals already exist because both child widths are smaller; width=2 has only empty children. Increasing width terminates at the whole array. There are O(n²) intervals, O(n) last choices, and O(n²) table storage plus O(n) padding. The browser stores additional snapshots, separate from submission cost.

An independent JS audit inspected every trace frame on all four presets, the two fresh cases, [0], and [0,0]: completed count increases by one, no unrelated cell changes, every candidate equals its two previous-frame child cells plus product, bestK attains best, and final answer agrees with the first-burst oracle. Zero-valued completed cells can retain the same numeric value. This audit uncovered the preset label defect below: [0,4,2] actually returns **12**.

Tests were inspected before execution. `python3 -B leetcode/312/tests/test_core.py`, `node leetcode/312/tests/test_trace.js`, and `node leetcode/312/tests/browser-check.js` passed. The author's Python exhaustive small cases use a real first-burst oracle; its seeded-random loop compares the solution with itself, so that loop supplies no independent random correctness evidence. `core.js`'s function named `brute` is memoized interval DP, not an independent brute-force oracle. The separate reviewer oracle above supplies independent evidence. `reopened-index-check.js` was inspected but not executed because it writes to earlier author evidence; equivalent relevant paths were exercised independently with screenshots only in this run's directory.

### Rendered state, localization and access

Applied `leetcode-rendered-state-contract.md` after saving the cold walk. Both locales rendered the complete recurrence with the same operands and indices. Default frame 5 showed (0,3), best last 1, value 30, versus k=2 worth 8; previous/next replay restored identical table text. Locale switch preserved table, frame, selected option and revealed feedback. All three exercise options were independently checked in EN/ZH: only option 1 is correct; both wrong choices receive causal explanations, and changing a choice hides feedback. Preset change resets the trace, while the explicitly fixed fresh exercise retains its answer. Terminal Next and initial Previous/Reset are disabled. No browser page errors occurred.

Acorn AST inspection of COPY found no duplicate keys among 63 entries; all values are two-string pairs, matching the shared consumer. Semantic checks covered formula, current interval, candidates, progress/terminal, quiz index mapping, correct/incorrect feedback and clipboard fallback, rather than treating key existence as sufficient. The remaining proof and preset errors are shared by both locales.

At 320/390/1365 CSS pixels in both languages, document scrollWidth equaled viewport width. The table scrolls inside its wrapper at 320 (258px client / 334px content) and 390 (328/334); cells and labels remain associated. Keyboard Enter advanced the focused Next, Tab reached Reset then the scroll wrapper, and ArrowRight moved its scrollLeft from 0 to 40. Native radio/select and copy keyboard paths were exercised. Saved and inspected screenshots include `en-320-table.png`, `zh-390-table.png`, `en-320-exercise.png`, `zh-320-exercise.png`, `en-zoom200.png`, `zh-zoom200.png`, `zh-320-text200.png`, `en-320-disabled.png` and the cold captures. No actual label/value text collision was observed in the inspected states; cropped lower content in viewport captures is reachable by vertical scrolling.

200% was checked through a documented browser emulation: half-size CSS viewport 682×475 with deviceScaleFactor 2, equivalent to a 1364×950 display at 200% for layout and rasterization; no page overflow occurred. This is not a native browser menu zoom test. Additional 200% root text at 320 preserved all exercise legend/label/feedback widths within x=16..304, without local horizontal clipping. Sticky navigation is horizontally scrollable. Contrast computed from actual styles: muted text on panel2 6.45:1, regular text 13.40:1. Disabled Previous composites to approximately 3.30:1; visibly dim but readable in the inspected capture (inactive controls are contrast-exempt). No broad assistive-technology conformance claim is made.

## Required findings

### R312-PRESET-001 — Wrong advertised result for zero-containing preset

**Status open; severity medium; required.** Candidate `45acf761d4586604808e90171f14b3e13647904c`, section 03, EN and ZH, desktop 1365×1000; same static option at narrow widths. Reproduce: select `[0,4,2] · 8`, advance six intervals. Expected: advertised optimum agrees with completed dp[0][4]. Actual: selected option says 8 while terminal answer and highlighted table cell say 12; candidates are 8,12,10. Screenshots `en-zero-preset-mismatch.png` (inspected) and `zh-zero-preset-mismatch.png`. Independent hand calculation: burst 0 for 0, then 2 for 1×4×2=8, then 4 for 1×4×1=4, total 12; the exhaustive first-burst oracle also gives 12. Violates maintained-state correctness and consistent visual meaning. Owner/next action: lesson author should correct both localized option labels and add a check comparing every advertised preset result against an independent oracle. Fix revision and reviewer regression: pending. The canonical algorithm requires no change for this finding.

### R312-PROOF-001 — Proof assumes arbitrary orders already have optimal sides

**Status open; severity medium; required.** Same candidate, section 05, EN/ZH, all widths (captured at 1365×1000). Reproduce: read the proof paragraph. Actual English: “Every order corresponds to one final last plus two optimal subproblem solutions.” Chinese makes the same assertion. Expected: every order decomposes into two feasible side orders; each is bounded by its subproblem optimum. Conversely, joining optimal sides while keeping last alive attains the candidate total. Screenshots `en-proof.png` (inspected), `zh-proof.png`.

Concrete disproof using the lesson's own [3,1,5]: burst 3, then 1, then 5. Last is still padded index 3, but its left-side score is 3+5=8, below dp[0][3]=30. The whole order earns 13 instead of 35. Thus an arbitrary order does not contain optimal subproblem solutions. This is a mathematical error in the optimal-substructure bridge, even though the executable recurrence is correct. Violates the frozen gate's correct causal derivation/proof requirement. Owner/next action: lesson author should replace the assertion in both locales with the upper-bound and attainability argument, ideally showing the 8-versus-30 replacement explicitly. Fix revision and reviewer regression: pending.

## Earlier findings and teaching depth

Earlier reports were opened only after the saved cold record. Against this actual candidate:

- `OPEN-312-FORMULA`: **closed on recheck**. Full formula in EN/ZH, after interaction and locale switch, verified text and operands.
- `OPEN-312-TRACE-LABEL`: **closed on recheck**. Default frame 5 pairs last 1 with 30 rather than last 2; comparison 30 versus 8 and rewind/replay checked in both locales.
- `OPEN-312-QUIZ-PREDICTION`: **closed on recheck for its original option-ambiguity scope**. Options are distinct 4,2,1; all three feedback paths checked. Historical review reasoning about indices was unreliable and is not adopted here.
- `R312-INDEX-001`: **closed on recheck**. The current question explicitly declares padded values and zero-based padded index 3 = original nums[2]. Product 1×2×1=2, wrong-index product 1×1×1=1, and stale-neighbor product 2×2×1=4 were checked independently; all options, change-after-reveal, locale preservation and trace replay exercised. This does not erase historical reports or the two new required findings.

The candidate does provide a vivid tiny bursting sequence before abstraction and a meaningful transfer question about changed neighbors rather than recalling the optimum. Fixed-boundary reasoning, shorter dependencies and saved work can be reconstructed. Minor teaching friction remains: the main animation provides candidate totals without their numerical addends or a padded value row, “open interval” is not explicitly translated to included/excluded indices until later examples, and the complexity count is asserted. A worked dp[0][3] transition like the one above would improve transfer without relying on reviewer reconstruction. These observations inform scores, separate from the explicit required mathematical/preset errors.

## Scores and conclusion

| Dimension | Weight | Score /4 | Observation/rationale |
|---|---:|---:|---|
| Problem/terms/hand calculation | 15 | 4 | Complete surviving-neighbor arithmetic, constraints, objective and full greedy counterexample precede abstraction. |
| Derivation/saved work | 20 | 3 | Fixed last and reuse are reconstructable, but numeric DP substitution is left to the reader and proof needs the replacement argument. |
| Correctness/maintained state | 20 | 2 | Executable invariant and boundaries pass; wrong preset optimum and false optimal-substructure assertion make the teaching only partly reliable. |
| Interaction/visual meaning | 20 | 3 | History, reset, prediction and candidate identity behave correctly; selected preset and terminal answer contradict one another. |
| Python/cost | 15 | 4 | Actual canonical source executed independently, nonmutation and maximum boundaries checked, exact transfer parity and cubic/quadratic costs established. |
| Bilingual/device | 10 | 3 | Reasoning and state preserved, narrow/keyboard/zoom paths usable; small scrollable table and dim inactive labels cause minor friction. Shared content errors remain findings above. |

Weighted total **77.5/100**. Required open IDs: **R312-PRESET-001, R312-PROOF-001**. Outcome: **changes_required**. This revision fails the score threshold, correctness minimum and zero-required-findings gate despite passing executable and metadata checks. This is independent review of the identified candidate, separate from publication. No human learning measurement, successful LeetCode submission, deployment or publication is claimed. Limitations: official editor selector not independently exposed, zoom used emulation, and accessibility observations are scoped to Chromium and inspected states. Only this report and this run's screenshot directory were written.
