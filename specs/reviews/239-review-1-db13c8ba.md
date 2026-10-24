# Independent review — #239 Sliding Window Maximum

Revision: `7d818876f54bd37ec891fda55f24e9cd0281cd29`  
Candidate: http://127.0.0.1:18796/leetcode/239/  
Reviewer identity/model: unavailable (independent fresh run)

## Cold walkthrough (recorded before source/test/author-material inspection)

I opened the candidate in a desktop Chromium viewport (1280×900) and read the page as a basic-Python reader. The page loaded with English selected, a language toggle, five numbered steps, and interactive controls.

1. **See the window.** Question: “what does each window ask for?” Action: read the worked array `[1,3,-1,-3,5,3,6,7]`, `k=3`, then clicked `Next step` twice to advance the window. Observable result: the current-window label changed from `[1, 3, -1] → 3` to `[3, -1, -3] → 3`, then to `[-1, -3, 5] → 5`; the displayed array/index cells stayed visible. Causal paraphrase: moving one position drops the left value and adds the next value, and the output is the maximum for each left endpoint.

2. **Baseline.** Question: why not scan each window directly? Action: read the baseline explanation and the explicit `[9,1,2,3], k=2` tempting rule example. Observable result: it states each window scans all `k`, adjacent windows reread `k−1`, and the stale previous maximum `9` expires so the next answer is `2`. Causal paraphrase: the direct algorithm is correct but repeats work; remembering only the prior maximum fails when that index leaves the window.

3. **Deque discovery.** Question: which old indices remain worth keeping? Action: read the deque definition/invariant and the trace controls (`Preset`, `Previous`, `Next step`, `Reset`, `Complete trace`); inspected the initial trace state. Observable result: the initial state said `Processed index —; output empty`, `Deque (front → back) empty`; text instructs expiration removal, dominated-value removal, append, then emit after a full window. Causal paraphrase: the state stores indices in increasing order while their values decrease, so the front can represent the current maximum.

4. **Prediction.** Question: after processing `i=2` (value `3`) for fresh `[2,1,3,0]`, `k=2`, what is the deque? Action: before revealing, I predicted `[2]`: index 1/value 1 is dominated by newer index 2/value 3 and cannot win before index 2 leaves. (The page presents choices `[1,2]`, `[2]`, and `[0,1,2]`.) Observable result before reveal: choices and `Reveal answer and reasoning` were visible; no answer was exposed. Causal paraphrase: this tests whether domination, rather than mere recency/history, explains deletion. I did not use an author-provided result as my prediction.

5. **Proof/Python.** Question: why is this short deque sufficient? Action: read the proof, code map, boundaries and cost claims. Observable result: it maps four operations to Python (`q[0] <= i-k`, tail domination, append, and `i >= k-1` emission), states amortized `O(n)` time and `O(k)` deque space, and lists `k=1`, `k=n`, all-negative, and equal-value cases. Causal paraphrase: every index is appended once and removed at most once; expired or dominated indices cannot later be a maximum, so the front is correct.

Cold independent check: for fresh `[2,1,3,0]`, `k=2`, I predicted deque `[2]` after `i=2` before reveal. Direct reasoning: the active window is indices 1..2, and value 1 is dominated by newer 3, so `[2]` is the only candidate. This is a code/algorithm check if the preset-only UI cannot accept arbitrary input.

Cold walkthrough screenshots: `specs/reviews/239-evidence/239-review-1-db13c8ba/cold-desktop.png` (page at initial/advanced states).

## Source, contract, and independent audit

- Official statement was opened normally through the LeetCode page: it defines a size-`k` window moving right, asks for each maximum, gives `[1,3,-1,-3,5,3,6,7], k=3 → [3,3,5,5,6,7]`, `[1],1 → [1]`, and the stated constraints. A direct Chromium attempt encountered Cloudflare, so the browser access limitation is recorded; the normal page text was available through the official page reader.
- `lesson-entry.json` uses the required single nonempty complexity string: `O(n) time; O(k) auxiliary space`. `python3 -B scripts/register_leetcode_lesson.py 239 --validate-only` exited 0 (captured in `test-output/metadata.txt`).
- `language-contract.json` names Python’s faithful official callable (`class Solution`, `maxSlidingWindow(nums, k) -> list[int]`), gives a rationale, and lists the official selector languages. Python is supported and is the preferred canonical language; no conceptual-only Python claim is used.
- `solution.py` executes the canonical deque algorithm. Independent fresh runtime checks produced `[2,3,3]` for `[2,1,3,0],2`, `[9,2,3]` for `[9,1,2,3],2`, `[-2,-2]` for all-negative `[-5,-2,-7],2`, and `[4,4,4]` for `[4,4,2,4,1],3`. The solution does not mutate `nums`.
- Displayed source `#sourceCode`, `window.PYTHON_SOURCE`/copy payload, and `solution.py` matched byte-for-byte when read as text content. The download target is the same `solution.py`.
- `core.js` traces preserve prior output on rewind and reach the complete output at `i=7`; selected trace frames show both `expired` and `dominated` removals and maintain increasing indices/decreasing values. Independent `test_core.js` checked all presets against direct maxima and the invariant.
- Tests were inspected before execution and redirected only to `specs/reviews/239-evidence/239-review-1-db13c8ba/test-output/`. `test_solution.py`, `test_core.js`, and `browser-check.js` all passed. These are computational/self-check evidence, not a LeetCode submission claim.
- Browser checks at 320, 390, and 1280 CSS px reported no horizontal overflow; screenshots are `320.png`, `390-correct.png`, `desktop.png`, and `zoom200.png`. The 200% synthetic zoom check retained layout within the viewport. Tab traversal reached links, language buttons, all trace/prediction/copy controls, and the download link. Disabled controls had readable text and visible reduced opacity; focus-visible styling is present in CSS. English/Chinese switching preserved trace endpoint state `[3,3,5,5,6,7]`, and the prediction reveal returned the expected explanation. The page’s visual distinction is via highlighted current-window cells and readouts; the text labels identify the semantic role of those highlights.
- Copy fallback is implemented: on clipboard failure it exposes a selected readonly textarea and status text. I did not claim an actual OS clipboard write in headless review.

## Findings

No required finding IDs are open for this candidate. Minor limitation: the 320 px capture makes the dense lesson text small, although it remains within the viewport and controls retain 44px minimum heights; the 200% capture and keyboard traversal provided additional readability/access evidence. Official Chromium navigation itself was Cloudflare-gated, but the official statement was read through the official page reader and the candidate’s saved official-source evidence was consistent.

## Scores (0–4; weights 15,20,20,20,15,10)

1. Problem, terms, hand calculation — **4/4**: identifies `nums`, contiguous `k`, left-endpoint outputs, constraints, and computes several windows visibly.
2. Causal derivation and saved work — **4/4**: baseline `O(nk)` repetition, stale-max counterexample, expiration/domination bridge, and amortized argument are explicit.
3. Maintained state and correctness — **4/4**: deque invariant, operation order, boundaries, trace frames, and termination are independently checkable.
4. Interaction and visual meaning — **3/4**: prediction-before-reveal, rewind/reset/endpoints, presets, and retained output work; semantic highlighting is clear from labels, with only modest friction in dense 320px presentation.
5. Transfer to Python and cost — **4/4**: every transition maps to executable Python, fresh cases and boundaries pass, and actual `O(n)`/`O(k)` cost and no-mutation behavior agree.
6. Bilingual and device access — **3/4**: English/Chinese reasoning is materially equivalent; keyboard, focus, disabled states, 320/390/desktop and zoom checks pass, with dense small text at 320px.

Weighted total: **92.5/100**.

## Conclusion

**Accepted for this frozen candidate** under the six-gate rubric: 92.5/100, every dimension ≥3, and no required open finding. This is independent lesson review evidence, not a claim of novice comprehension or a successful LeetCode submission. Deployed revision was not separately verified.
