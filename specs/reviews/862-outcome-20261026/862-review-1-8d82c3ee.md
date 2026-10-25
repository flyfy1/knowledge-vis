# Independent review: 862

Candidate: `389ccb02cf5ad864707de3460180d6dfd0f08a78`. URL: http://127.0.0.1:18770/leetcode/862/. Target: basic Python reader. Reviewer: this independent review run; exact model identifier unavailable. Frozen rubric read first; weights 15/20/20/20/15/10, Python interpretation. No source, tests, briefs, author claims or prior reviews opened before this record.

## Cold browser walkthrough (saved before source audit)

Real Chromium via Playwright, desktop 1280×900, English. Each row records question, action, observation, and reconstructed cause.

| Step/question | Action and observable result | My causal paraphrase |
| --- | --- | --- |
| 1: What counts as a subarray and its length? | Read contiguous/nonempty definition; clicked adjacent then whole after initial singleton. Values changed from sum 2/length 1, to sum 1/length 2, to sum 3/length 3 and shortest 3. | Cannot skip −1 to join the 2s; no singleton or adjacent pair qualifies. |
| 2: Why change the baseline? | Opened baseline disclosure. Saw nested loops accumulating 0→2→1→3 for start 0, n(n+1)/2 checks, prefix [0,2,1,3], and negative-window counterexample [1,−1,3]. | Prefix subtraction saves repeated additions but still leaves quadratic pairs. Removing a negative can raise a sum, so a window that stops shrinking at insufficiency can miss [3]. |
| 3: Which starts remain useful? | Read definitions and operated Next seven times on A. Initial empty; append 0 gives [0:0]; append 1 gives [0:0,1:2]; j=2 removes back 1 because 1≤2, giving [0:0]; append 2 gives [0:0,2:1]; j=3 settles [0,3), best 3 and removes 0; append 3 gives [2:1,3:3]; final answer 3. Every prior operation stays in cumulative history. | Later start 2 has a smaller subtracted prefix and shorter future interval than 1. Once 0 qualifies at its earliest feasible end, later ends cannot improve its length. Increasing prefix values make an infeasible front exclude all later candidates. Invariant applies after append, not to each removal frame. |
| 4: Can I combine rules? | Before reveal, independently calculate displayed exercise [3,−2,5], k=5: prefixes [0,3,1,6]; remove 1 at j=2, then settle 0 (length 3) and 2 (length 1) at j=3; predict deque [3], best 1. | Both feasible front entries must be removed before appending; stopping after the first misses the shorter answer. Reveal check follows below. |
| 5: How do Python and cost match? | Read visible prose explaining enumerate, popleft, pop, append, empty guard, unchanged nums, and O(n) time/space. Displayed example maps j=2 pop(1) and append(2) to [0,2]; j=3 updates min(n+1,3−0). | Each prefix enters once and is removed at most once; this bounds total loop work, rather than multiplying loop counts. deque is needed instead of list.pop(0). |

Independent fresh-input prediction before execution: `[2,-3,4,1]`, k=5 → 2, interval [2,4), prefixes [0,2,−1,3,4]. j=2 removes both earlier starts; j=4 settles index 2. Independent counterexample to ordinary sliding window: `[2,-2,4]`, k=4 → 1, but shrinking full sum 4 after removing 2 leaves 2 and stops, missing [4]. These are code checks because the UI has presets only; not custom-input browser experiments.

Cold desktop full-page capture: `862-evidence/862-review-1-8d82c3ee/cold-desktop.png`. Remaining interaction observations and source audit will be appended after this saved cold record.

## Cold interaction completion and subsequent audit

The exercise prediction was revealed as correct: deque [3], length 1, with explicit arithmetic for both front removals. Previous returned A from operation 7 to 6 with the same deque and best interval. Opening the **displayed** complete Python source showed the promised deque operations. These UI observations completed the cold sequence; repository source was opened only after the preceding cold record was saved.

### Candidate identity and official contract

`git rev-parse HEAD` returned exactly the candidate revision. Initial/final tracked worktree stayed unchanged; only this report and its exclusive evidence directory were created. Browser test independently compared all eight lesson runtime/metadata files served by the preview with local bytes. Their SHA-256 receipts are in `862-evidence/862-review-1-8d82c3ee/browser-results.json`; notably `solution.py` is `45ca24b284d6e3e836a9374f494c8401523c63f667c6cf166c72671bbddf3e95`, and `app.js` is `fe6cea98bdcef83e51a5fd12afbd3ff500b2cf5b24e44199ec9a4edbbb24f4ea`.

Read the [official statement](https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/) normally through web access: nonempty contiguous interval, minimum element count, −1 when absent; examples 1/−1/3 and all three bounds match the lesson. No access bypass or submission was attempted. Canonical source is a faithful Python `Solution.shortestSubarray(self, nums: list[int], k: int) -> int`; saved lesson-local official snippet evidence agrees. This is Python, so the non-Python language-contract/selector gate does not apply. Read `LANGUAGE_FILES` in registration script: canonical `solution.py`, mirror `python-code.js`, global `PYTHON_SOURCE`; export points directly to `solution.py`.

No earlier review report for 862 exists in this checkout; no earlier finding is claimed closed. The rendered-state supplement was read only after the saved cold walk. BRIEF and self-review claims were not used to fill teaching gaps.

### Teaching and correctness observations

The opening example is small, hand-worked and precedes abstraction. Prefix, excluded end, domination, deque and invariant all receive definitions. The causal bridges are present: quadratic enumeration → cached additions → still-quadratic prefix pairs → safe candidate elimination. The negative-value counterexample explains the failure of a tempting rule through actual intermediate sums. The transfer exercise changes the values and requires combining two removals, rather than recalling a displayed answer.

The canonical prefix construction and the two guarded while loops match the visible trace. At A operation 3, `[0,1] → [0]` because P[2]=1≤P[1]=2; operation 4 appends 2. At operation 5, best changes from absent to 3 and the attaining interval becomes [0,3) while deque becomes [2]. Indices and values, operations and completed rounds, current and retained candidate, and best interval and currently processed endpoint are distinguished. Each prefix is appended once and removed at most once; O(n) time and O(n) auxiliary space are justified for actual Python. Input mutation checks passed. The teaching trace uses snapshots and JavaScript array front removal, but is explicitly labeled a simulation whose history is excluded from submission cost; it does not advertise simulation cost as Python cost.

Fresh **code checks**, following the saved predictions:

- `[2,-3,4,1]`, k=5 returned 2, interval [2,4); simulation prefixes [0,2,−1,3,4] and final deque [3,4].
- `[2,-2,4]`, k=4 returned 1, interval [2,3), contradicting the tempting sliding-window rule as predicted.
- `[5,-10,1]`, k=5 kept best 1 with attaining interval [0,1) even at final j=3 and deque [2,3]. This checks that best's identity is retained independently of the current endpoint.
- `[0,0,1]`, k=1 returned 1; `[-100000]`, k=1 returned −1; `[100000]`, k=100000 returned 1; 100000 copies of 100000 with k=10⁹ returned 10000, exercising totals beyond signed 32-bit range. All Python inputs remained unchanged.
- A separately chosen exhaustive oracle using values [−3,−1,1,4], lengths 1..5 and k in {1,4,7} checked 4,092 cases against independent enumeration of every nonempty slice. All passed using the actual canonical Python.

In the browser, independently selected E at operation 3 shows P[2]=0 removing index 1; the next removal deletes equal-prefix index 0 and append leaves [2:0]. Complete yields best 1, [4,5). A zh→en→zh roundtrip at width 320 retains E operation 12/12 and that result. Visible formula remains complete in both locales: `P[j] − P[i] ≥ k`, length `j − i`, `0 ≤ i < j ≤ n`. Chinese explanations preserve both removal proofs, the negative-value obstacle, cost and boundaries. AST checks independently executed against the actual lookup object detect duplicate keys, malformed bilingual pairs and placeholder mismatches; representative rendered bindings were checked separately.

Prediction changes after a reveal hide the previous answer, show “Prediction selected; reveal to check it”, and allow another reveal. Wrong choice 0 gets “Recheck both removal rules” with the full correct derivation; clearing returns hidden/pending feedback and disables Reveal. The exercise has its own fixed input, so changing the separate simulation preset correctly leaves its answer intact. Locale changes preserve chosen answer, reveal state, hand selection and trace state. Preset changes restart the simulation as labeled.

### Browser, visual access and parity

Real headless Chromium 156.0.8078.4 on Linux, using NODE_PATH Playwright and `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Inspected the cold full-page capture and focused screenshots `independent-zh-320-middle.png`, `independent-en-390-end.png`, `en-1440-zoom1-trace.png`, `zh-operation4.png`, `en-320-zoom2-trace.png`, `zh-390-zoom2-controls.png`, and `independent-copy-fallback.png`, all under the exclusive directory.

The narrow middle screenshot shows separate index/value lines and markers with no intersection: at width 320, the three first-row cells span x=25..109, 117..201, 209..293, each with content fitting its client width. English E endpoint shows “current · candidate” together and the correct best [4,5); Chinese A operation 4 shows current/candidate on index 2 while index 0 remains candidate-only. Amber border and explicit marker text retain both meanings. Rewind/replay preserves these states. Disabled endpoint controls are visibly readable, not faded into the background.

The inspected test exercised both locales at widths 320/390/736/1440 and zoom 1/2, with no page overflow or essential state-text overflow. Preset's closed value is a short letter, with its full input and answer separately visible below; measured text plus padding and a 24px arrow reserve fits. CSS font stack is `"PingFang SC", "Microsoft YaHei", system-ui, sans-serif`; actual resolved font was not asserted. At 200% CSS zoom, text reflows into a long vertical reading path; it stays readable, but scrolling increases and navigation requires horizontal movement. This is minor device friction, not lost content. Real browser-chrome zoom and physical devices were not tested.

Keyboard Enter advances Next; Tab moves to Reset; focus has a 3px amber outline, also retained in forced colors. The actual code pre is keyboard-focusable; eight ArrowRight presses at width 320 moved its horizontal scroll to 266px (294px client, 560px content), exposing the long source lines. Step links position their heading below sticky navigation. Related links were keyboard-activated in both languages at width 320: #327 step1 explains subtracting the first i elements from P[j], and #239 step2 explains discarding dominated maximum candidates in a deque. Their recorded destination text and hashes substantiate their labels.

Contrast helper was inspected before trusting results: correct sRGB weights 0.2126/0.7152/0.0722, tested primaries, black/white=21, and #747474 on black=4.492948073111701 (fails 4.5). Measured solid-color text ratios include body 16.09, hints 7.74, explanation 12.62, candidates 10.91 and disabled Next 6.45; focus against the panel is 8.94. These are representative solid-color checks, not an exhaustive accessibility certification.

Exact source parity passed without trimming: canonical bytes/string (including final newline), decoded offline mirror, rendered `textContent`, successful clipboard copy and downloaded file. Both locales also passed two **native manual fallback** transfers each. Every attempt wrote and read a distinct non-source sentinel before disabling automatic write; the real button focused and selected the entire textarea, Linux Control+C replaced the sentinel with exactly the canonical source, and real clipboard readback verified it. My separate screenshot inspected the visible fallback; transfer evidence comes from the separately run sentinel/readback checks. Local file opening and denied localStorage also worked.

### Inspected tests and commands

Inspected `tests/check.py`, `trace.cjs`, `copy.cjs`, `browser.cjs`, baseline and README before execution. They accept `OUTPUT_DIR`; all generated results and screenshots went exclusively to this run's directory. Existing author evidence was not regenerated. These are independent executions of candidate-provided checks, supplemented by the fresh walkthrough, examples and oracle above; their output's built-in “author self-check” labels do not establish independent teaching acceptance on their own.

Commands run from repository root:

```sh
OUTPUT_DIR=specs/reviews/862-evidence/862-review-1-8d82c3ee python3 -B leetcode/862/tests/check.py
node leetcode/862/tests/copy.cjs
OUTPUT_DIR=specs/reviews/862-evidence/862-review-1-8d82c3ee node leetcode/862/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 862 --validate-only
```

Results: algorithm checks passed 5,574 small cases, 1,700 intermediate traces and four size-100000 boundaries; AST/bilingual checks passed; browser checks passed 16 layout states, all eight presets in both locales with every rewind/replay and endpoint, and 18 trace/copy records. Browser results record no lesson errors, failed lesson assets or external runtime requests. One explicitly scoped warning is the related #239 page requesting a missing `/favicon.ico`; it does not affect lesson content or operation. Metadata preflight exited 0 with empty stdout/stderr, independently repeated through a subprocess receipt. `complexity` is exactly the nonempty string `O(n) time; O(n) auxiliary space`, covering both costs. Registration was never run.

## Findings and score

Required open IDs: **none**. No required finding or earlier closure is asserted. Optional friction: dense prose and extra scrolling at 200% zoom make a narrow-device session slower, while content and controls remain available.

| Dimension | Weight | Score /4 | Observation supporting score |
| --- | ---: | ---: | --- |
| Problem/terms/hand calculation | 15 | 4 | Contiguous/nonempty, units, bounds and tiny 2→1→3 example independently reconstructable. |
| Causal derivation/saved work | 20 | 4 | Baseline work, prefix caching, remaining pair cost and both safe-discard reasons are explicit. |
| Maintained state/correctness | 20 | 4 | Increasing indices/prefix values, two deletion proofs, before-append nonemptiness, boundary behavior and best-interval identity checked. |
| Interaction/visual meaning | 20 | 4 | Predicted before reveal; exact intermediate updates, retained history, replay, reset, endpoints and distinct markers observed. |
| Python/cost | 15 | 4 | Faithful executable source, fresh independent cases/oracle, exact transfer parity, mutation and amortized cost verified. |
| Bilingual/device | 10 | 3 | Equivalent reasoning and state preservation, keyboard and narrow text work; 200% narrow view has long reflow and scrolling friction. |

Weighted total: **97.5/100**. Every dimension ≥3; complete applicable browser/source/executable evidence; no required open finding. **Accepted for this candidate and reviewed local scope.** This is independent review acceptance, separate from publication. No claim of real human comprehension, screen-reader testing, physical-device testing, browser-chrome zoom testing or successful LeetCode submission is made.
