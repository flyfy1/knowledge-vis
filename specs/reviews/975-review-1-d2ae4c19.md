# Independent review: 975 Odd Even Jump

Candidate: bc00150bef56379abd88333f62211cf7b16146c9. URL: http://127.0.0.1:18793/leetcode/975/. Target: basic Python, lists, loops, functions, elementary recursion. Review run: 975-review-1-d2ae4c19. Exact reviewer/model identity unavailable; no human comprehension or successful submission claimed.

## Frozen interpretation and cold walkthrough (saved before repository source audit)

Read only specs/leetcode-review-gates.md before opening the real Chromium browser through Playwright. Weights: 15/20/20/20/15/10; faithful Python preferred. No brief, prior reviews, author tests or source files read. Displayed Python was inspected as the final teaching step, after walking earlier steps. Initial and completed full-page screenshots captured and the completed screenshot visually inspected.

1. **Question:** What constitutes a legal jump and a good start? **Action:** Read step 1 and predict the hand route before pressing Add: 0→1→2→3, then blocked. Pressed Add four times. **Observed:** Odd chooses 3 over 4; even chooses index 2 rather than 3 among equal 1s; next odd takes index 3; remaining 4 cannot satisfy ≤1. All previous decisions persist. Undo removes only the blocked decision (route still at 3); reset restores zero decisions and index 0. **Conclusion:** Value priority, leftmost ties and jump-number parity force a unique route; a failed route contributes no start. The endpoint counts without jumping.
2. **Question:** What repeated work can sorting avoid? **Action:** Read the slow suffix-scan example, nearest-index counterexample [2,5,3], sorted order, and stack explanation; advance sorted-item frames. **Observed:** odd order [2,3,0,1,4]; frame 2 assigns up[2]=3; frame 3 pushes 0 without resolving 3; frame 4 assigns up[0]=1; frame 5 assigns up[1]=4 and up[3]=4. Even order [4,1,0,2,3]; frame 9 assigns down[0]=down[1]=2; frame 10 assigns down[2]=3 and settles absent targets. **Conclusion:** The first processed eligible rightward index has optimal value, while ascending tie indices enforce leftmost choice. A decreasing stack blocks all lower entries when its top is right of j. Sorting replaces repeated suffix scans; each index is pushed/popped at most once. Reversing all odd order would break ties.
3. **Question:** Why two states and a backward pass? **Prediction before reveal:** up=[1,4,3,4,-1], down=[2,2,3,-1,-1], odd=[F,T,F,T,T], even=[F,F,F,F,T], count 3. **Action:** Advance all 15 operations, inspect retained rows, rewind once and finish again. **Observed:** Endpoint states become T/T; final rows are 0:F/F, 1:T/F, 2:F/T, 3:T/F, 4:T/T, count 3. Rewind restores row 0 to ?/? while rows 1–4 stay settled. **Correction to my prediction:** even[2] is T, because its even jump reaches 3 and reads odd[3]=T. **Conclusion:** Landing flips the next parity. Before computing i all j>i states are settled, so opposite-parity reads are valid. Unknown ?, absent -1, and false F are distinct; current-row highlighting is separate from data. The reader's initial parity mistake is exposed by visible dependencies.
4. **Question:** Can I transfer the rule to [4,2,3,1]? **Prediction before reveal:** I initially predicted only endpoint 3, answer 1. **Action:** Select 1 and reveal. **Observed:** The explanation identifies starts 1 and 3, answer 2, explicitly tracing 1→2→3. **Independent manual correction:** 2→3 is an even jump from value 3 to 1, so start 1 succeeds. Start 0 has no ≥4 target; start 2 has no ≥3 target. Change choice to 3; explanation disappears; reveal again and switch to Chinese. **Conclusion:** Feedback corrects a concrete next-parity misconception; changing a prediction invalidates stale feedback. Chinese preserves the trace and gives the same reasoning.
5. **Question:** How do the visual operations map to executable Python and cost? **Action:** Open “Inspect complete Python source” in the page and read the mapping. **Observed:** targets(order), stack[-1], pop(), tuple sorting, up/down, odd/even, and backward range appear together. Frame 4's up[0]=1 corresponds to nxt[stack.pop()]=j with j=1. Row 1 reads even[4] and odd[2] through guarded target indices. **Conclusion:** Code uses two sorted target passes and a right-to-left DP; O(n log n) time and O(n) auxiliary space, without sorting/mutating arr itself. The page explicitly separates the simulation's frame-copy O(n²) storage from submission space.

### Fresh independent inputs recorded before source audit

UI offers presets only: these are planned **code checks**, not custom-input browser experiments. Fresh [2,1,2]: predict starts 0 and 2, count 2 (equal odd landing at endpoint). Counterexample [2,4,3,1]: predict up[0]=2 rather than nearer 1, count 2 (starts 1 and 3); choosing nearest would illegally create a successful start 0 through 1→2→3. This tests value priority independently of the page's [2,5,3].

Cold walkthrough saved at this point. Source/official statement/contracts/tests and any earlier review inspection follow below.

## Post-cold source and contract audit

HEAD equals the requested revision. Before the audit only this report and this run's evidence directory were untracked. Seven served lesson assets matched checkout bytes exactly (index.html, app.js, core.js, copy.js, style.css, python-code.js, solution.py). Relevant SHA-256 receipts:

- index.html: beda3030b1a53ef4c1391f3cd81c272ba829550a45ac2c0f11f2995bde0b2064
- app.js: 41fad186157d4d14437a7faa8ba07297a0b56314ccc97210305ac9b2bd97880c
- core.js: b62f86c2ac765e3bf4bee14f81112e91b0e59e9967c3eb2a5ea16af6fcd5f29f
- solution.py: 90787ce70f745d0db62c28732886b435d6dc282babc9e1c30a74f77971a55d89
- shared common.js: f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b
- shared style.css: 6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27

Applied specs/leetcode-rendered-state-contract.md only after saving the cold walk. Read canonical solution, mirror, core, app, copy, HTML, local/shared CSS and locale consumer, metadata, and both test programs before running tests. No earlier report for 975 existed; no historical required findings were available to close. No brief or self-check explanation was used to supply teaching gaps.

Read the [official statement](https://leetcode.com/problems/odd-even-jump/) normally using the web reader. Rules, three examples (2,3,3), endpoint semantics and constraints match. A separate Chromium visit received Cloudflare security verification; did not bypass it. The saved lesson-local official.json includes Python3's `Solution.oddEvenJumps(self, arr: list[int]) -> int`, matching the canonical callable. Current interactive official selector was unavailable in that browser visit; the non-Python contract gate is inapplicable because this is faithful Python. No conceptual substitute or non-Python language contract is involved. Read LANGUAGE_FILES in scripts/register_leetcode_lesson.py: Python requires solution.py / python-code.js / PYTHON_SOURCE, as present.

### Independent execution and corrections to cold predictions

Executed the actual canonical file with Python `exec`, then called `Solution().oddEvenJumps` with fresh lists. A separately written oracle walks from **each** start, selects eligible suffix indices at every jump, chooses the extremal value, then the first tied index, flips parity, and stops on failure or endpoint. It shares neither sorted-stack preprocessing nor backward DP with the submission.

| Input | Prediction recorded cold | Independently checked actual |
| --- | --- | --- |
| [2,1,2] | 2, starts 0 and 2 | **3**, starts 0,1,2; start 1 also jumps directly to endpoint 2 |
| [2,4,3,1] | count 2, but incorrectly named starts 1,3 | **2**, starts 0,3; 0→2→3 succeeds, while start 1 has no odd target |
| [4,2,3,1] | initially 1 in UI | **2**, starts 1,3; matches revealed explanation |
| [0] / [99999] | endpoint rule gives 1 | 1 / 1 |
| [0,99999,0] | forced targets, endpoint rule | 2, starts 0,2 |
| [2,2,1,2] | checked equal-value behavior | 4 |

These are **code checks**, since the UI has no custom input. Cold predictions above are retained rather than silently corrected. For the fresh counterexample [2,4,3,1], correct up[0]=2 (value 3); the tempting nearest-index rule picks 1 (value 4). Correct route 0→2→3 succeeds; nearest-rule route 0→1→2 then blocks, demonstrating a real outcome difference. All legal jumps are strictly rightward, so forward walks terminate in at most n−1 jumps.

The independent direct-walk oracle checked all 5,460 nonempty arrays of lengths 1–6 over {0,1,3,99999}. All counts and input-preservation checks passed. Maximum n=20000 equal 99999 arrays returned 20000, rising returned 2, falling returned 1, all without mutation. Empty lists deliberately excluded by official constraints.

The canonical target invariant is decreasing unresolved indices; sorted order supplies value priority, with ascending index tie breaks in **both** passes. Each index is removed once, and cannot gain a better future target. DP reads only settled j>i opposite-parity states. Missing targets are guarded: Python never indexes -1 for a missing jump. The UI sometimes displays `odd[-1] = F` in a completed-row explanation, but immediately qualifies it as absent-target F without reading an array; the guards and formula make its meaning reconstructable. Single-cell base case has no backward iterations. Two O(n log n) sorts dominate O(n) stack/DP work; sorted indices, stack and four tables use O(n) auxiliary space. Baseline's suffix lists have O(n) peak memory and O(n²) total work; each pass has n(n−1)/2 suffix comparisons, 199990000 at n=20000. Simulation stores 3n+1 frame snapshots with length-n tables: O(n²) space, explicitly labeled separately.

## Re-executed candidate checks and rendered evidence

Tests were inspected first for output paths and side effects. Ran from repository root, directing **all generated JSON and screenshots into this run's exclusive directory**:

```sh
OUTPUT_DIR="$PWD/specs/reviews/975-evidence/975-review-1-d2ae4c19" python3 -B leetcode/975/tests/numerical.py
OUTPUT_DIR="$PWD/specs/reviews/975-evidence/975-review-1-d2ae4c19" node leetcode/975/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 975 --validate-only
```

Results: numerical exit 0, 3783 cases / 94920 snapshots; browser exit 0, “Browser checks passed”; safe metadata preflight exit 0, no stdout. The metadata cost is exactly one nonempty string, `O(n log n) time; O(n) auxiliary space`. No registration or asset regeneration was run. Generated numerical.json and browser.json retain the frozen harness's `kind: author self-check` label: these are rerun harness receipts, not an assertion of independent teaching review by those tests. Independent judgments are the cold walk and this report.

Numerical harness independently selects suffix targets and walks paths, executes canonical Python and displayed baseline, and checks settled trace entries, final tables and decreasing stack snapshots. Preset results independently recomputed and observed in both rendered languages: hand 3, official example 1 =2, example 3 =3, single 1, equal 3, rising 2, falling 1, bounds 2. Counts are good starts, not frame operations or route length.

Browser checks actually exercised hand undo/reset/endpoints, every preset's full trace and reverse/replay, prediction before reveal and all answer options, invalidation on answer change, independent trace reset versus retained exercise, and locale switches preserving preset/frame/selected answer/revealed explanation/open source. Both complete formulas render operands and indices correctly. Representative algorithm bindings inspected include odd frame 4 up[0]=1, even frame 9 down[0]=down[1]=2, base endpoint T/T, DP row 3's T/F, and final odd-only count. Raw duplicate-key detection precedes dictionary evaluation; the current copy namespace uses the covered literal pair-key syntax, and all values are nonempty two-string pairs consumed by the shared locale helper. Chinese and English explain the same target order, opposite-parity reads and sentinel behavior.

Exact fidelity: decoded mirror equals canonical bytes, DOM code textContent equals full source, successful clipboard text equals source, denied-write fallback contains/focuses/selects the full source, and downloaded bytes equal source, **including final newline and indentation**. On the actual Linux host each locale's manual fallback attempt first wrote and read a distinct non-source sentinel, disabled automatic writeText, clicked Copy, dispatched Control+C, then read back the exact canonical source. This exercises native transfer rather than merely checking selected text. Offline file:// source and storage-denied operation also passed.

### Layout, keyboard and visual inspection

Real Chromium on Linux, executable supplied by PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH; package resolved through NODE_PATH. Tested both locales at 320, 390, 736 and 1440 px, plus CSS root zoom 2 at 1440 (rendered 200% enlargement, not a claim of browser-toolbar zoom). No page-wide overflow; essential controls at least 48 px. Independently repeated 320 px zh→en→zh identity checks: H1 `#975 · 奇偶跳` / `#975 · Odd Even Jump`, document titles `975 · 奇偶跳` / `975 · Odd Even Jump`; exact official link retained.

Inspected cold-complete.png, both locales' 320-stack, 320-dp-right, 390-stage and zoom200-stage, en-1440-stage, and own settled 320 select/middle/right/header captures. In component captures a sticky navigation bar can cover content at the screenshot's top edge; independent settled viewport captures distinguish scroll/capture artifacts from inaccessible content. Controls and event/order prose remain readable under ordinary scrolling. At 320 px the table requires horizontal scrolling; focused ArrowRight scrolls 66 px over a 258 px viewport / 324 px table. Sticky index stays associated with down/odd/even. Partial columns and caption at the scrolling boundary can be recovered by scrolling; no settled text/value intersection found. At 390 and desktop all six columns fit. CSS font stack is PingFang SC, Microsoft YaHei, system-ui, sans-serif; no exact installed fallback font inferred. Closed longest numeric preset labels were visually complete; all options passed a 32 px arrow reserve, maximum English text about 164.12 px versus 194 px available.

Keyboard Enter activates reset and locale controls; Tab advances focus; the table accepts directional scrolling and has a visible 3 px focus outline. Forced-colors/reduced-motion rendering exercised. Enabled/disabled states differ by dashed border and label color while remaining readable. The tested solid foreground/background contrast pairs range from 7.07885:1 (disabled control) to 14.70458:1 (stage); hint 7.74435:1, readout 13.39707:1. Inspected the measurement helper's actual 0.2126/0.7152/0.0722 coefficients and its black/white/primary calibration, including #747474 on black =4.492948, below 4.5. These checks cover the recorded solid colors, not every composited pixel. No lesson page errors. A root favicon 404 arose while visiting a sibling lesson and is separately recorded in browser.json.

Both related links were followed via keyboard in both locales at narrow width. #329/#step2 shows dependency counts, ready queue and finalized path lengths; this supports the precise “reuse answers along directed paths” label. #32/#step1 teaches unmatched opening indices and uncrossable boundaries held by an index stack, matching its label. These local destinations worked; no public delivery or release-manifest verification is claimed.

## Scores and findings

| Frozen dimension | Score | Observation and rationale |
| --- | ---: | --- |
| Problem / terms / hand calculation (15) | 4 | Explicit input/output, jump-number parity, zero-based positions, endpoint and ties; four concrete decisions before abstraction. |
| Derivation / saved work (20) | 3 | Correct executable baseline, avoided suffix work, sorted-order proof and excluded-nearest rule; reconstructable, though dense tuple-order/stack prose requires rereading for this basic-Python audience. |
| Maintained state / correctness (20) | 4 | Defined unknown/absent/false values, decreasing stack and backward dependency invariant, retained rows, correct endpoint and guarded reads; independently executed. |
| Interaction / visual meaning (20) | 4 | Actual predictions, reveals, causal event changes and rewind/replay; preserved history and separate highlight versus state. |
| Python / cost (15) | 4 | Faithful executable interface; exact transfer parity, independent fresh cases, no mutation, baseline/submission/simulation costs distinguished. |
| Bilingual / device access (10) | 3 | Equivalent reasoning and preserved state, working keyboard and narrow/zoom access; 320 px horizontal table exploration and long wrapped readouts add minor friction. |

Weighted score: **92.5/100**. Every dimension ≥3. **Required open finding IDs: none.** No earlier finding closure is claimed. Minor density/scrolling observations above are advisory, not missing causal bridges or inaccessible essential content; no required fix was reproduced.

## Conclusion and limitations

**Accepted for the identified candidate and local review scope.** Evidence includes a source-blind cold browser walk saved before audit, independent executable checks, source parity including native manual copy, bilingual rendered-state checks, inspected screenshots and passing non-mutating preflight. This review is separate from publication.

No physical device, other browser engine, native macOS font/clipboard environment, public deployment, real human comprehension measurement or successful LeetCode submission was tested. Official interactive browser access stopped at security verification; the official statement was readable normally via the web reader, and saved Python interface evidence was inspected. The full candidate test harness's broad checks supplement the specific observations above; passing counts alone did not determine scores.
