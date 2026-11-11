# Independent review: 895 Maximum Frequency Stack

Candidate: `36b2c1682db653507069256a099fcc34c0c20e9c`. Preview: http://127.0.0.1:18770/leetcode/895/. Target: basic Python, lists, loops, functions, elementary recursion. Rubric read first: `specs/leetcode-review-gates.md`; weights 15/20/20/20/15/10. Review run identifier: 895-review-1-e34cb27e; exact model identity unavailable. No authorship or human comprehension claim.

## Cold walkthrough (before source, claims, tests, or prior reviews)

Initial real Chromium browser render at 1440×1000 was read top to bottom; full-page screenshot `895-evidence/895-review-1-e34cb27e/cold-initial.png` was captured and visually inspected.

1. **Question:** What does pop choose? **Action:** Read “Two copies beat the newest item” and manually remove items from [2,2,9]. **Observation:** The page defines frequency, remaining copies, right-end top, and tie priority; gives 2,9,2 and remaining [2,9] after first removal. **Causal paraphrase:** Count beats recency, and recency resolves equal surviving counts. Bounds and valid nonempty pop are explicit.
2. **Question:** How does the simple algorithm decide? **Action:** Read and hand-follow Counter plus backward scan on [2,2,9], then [8,3]. **Observation:** Count 2 wins first; backward scan returns 3 in the distinct case. The page describes counting, scanning, and interior deletion, O(n) per removal and quadratic repeated rescanning. **Causal paraphrase:** A recount is correct but forgets useful order; largest numeric value and ordinary-stack rules each fail.
3. **Question:** Why do frequency levels save the scan? **Action:** Read the worked three pushes and the invariant before using controls. **Observation:** group[1]=[2,9], group[2]=[2]; removal from level 2 leaves level 1 intact. **Causal paraphrase:** Each surviving occurrence has a chronological position at its frequency level. Re-appending the demoted 2 would falsely make its older occurrence newer than 9. The highest occupied level gives count priority and its right edge gives recency. Lower level existence explains decrement by exactly one.
4. **Question:** After the provided transfer setup, what are the next two returns? **Prediction before reveal:** 6, then 3: after removing the second 8, 6 still has two copies; after removing its second copy the newest of the single copies is 3. Selection/reveal observations will follow below.
5. **Question:** Which Python operations implement this? **Action:** Read the visible “From invariant to Python” explanation. **Observation:** It explains defaultdict defaults, append/pop at right end, count decrement, empty level deletion, maxfreq change, expected/amortized constant time and retained zero-count keys. **Causal paraphrase:** A call touches only the new or removed occurrence, while older order remains stored. The full implementation is initially collapsed and will be opened in the cold browser check.

**Independent input prediction, recorded before execution:** push 4,1,4,1,9; pop four times should return 1,4,9,1, leaving [4]. This differs from all read presets/examples. Counterexample to re-appending a demoted item: push 4,4,1; first pop is 4, second must be 1, not 4. The preset selector appears to offer only A/B/C, so these custom checks will be labeled code checks rather than UI experiments.

### Cold browser operations and conclusions (saved before source audit)

- Step 3 question/action: predict pushes then click Next three times. Observed counts 2:1→2:2 and level-2 [2], followed by level-1 [2,9] with level-2 unchanged. Next (call 4) visibly changes remaining [2,2,9]→[2,9], count 2:2→1, deletes level 2 and keeps group[1]=[2,9]. This verifies that a level is occurrence history rather than a bucket of exactly-current counts. `cold-pop.png` captures this state.
- Rewind gives position 3; replay restores call 4. End gives completed 6/6, returns [2,9,2], empty after-state and maxfreq=0; Reset gives position 0. Complete call history grows one entry per call and rewinds with the frame; before and after panels are literal labeled data, not color-only signals.
- Step 4 action: selected “6, then 3” and revealed. Observed “Correct” with group[2]=[6], group[1]=[6,8,3], then explanation that 6 empties level 2 and 3 is the latest remaining singleton. This matches the recorded prediction; it explains both distractors causally.
- Step 5 action: opened the complete implementation disclosure. Observed actual class FreqStack with constructor, push and pop; call-4 visual maps to `group[maxfreq].pop()`, `freq[val] -= 1`, deletion and decrement. No lower-level append appears. The slow list depiction is a teaching view, not an additional list in the optimized implementation.

Cold walkthrough is complete and recorded. Subsequent sections are source/contract/verification audit, not cold-read observations.

## Candidate, official contract, and source audit

`git rev-parse HEAD` returned the requested revision. The working tree had only this run's new report/evidence; `git diff --exit-code` passed at completion. Every served runtime file was compared byte-for-byte with its checkout counterpart: index.html, app.js, core.js, copy.js, local style.css, python-code.js, solution.py, shared common.js and shared style.css. Representative SHA-256 receipts:

| File | SHA-256 |
| --- | --- |
| index.html | 3a8f3ac84418e79931925fd177695569ef0be0cce2909a00b36a0f13751c8f8a |
| app.js | 39c3d6c1f325de35a1eada871d15cffac6e9b24c1fd7450bf1431ee6d1692d8a |
| core.js | b32b0c8e5d41299addc04d84abf4a9f8d758450babacde0536c630aa1f69e525 |
| copy.js | 28190c5840660dc82e388d01e14c190dd624a5d6be1c3610559e7181e08cf435 |
| solution.py | 4736d2a0e8af4fa56446f3d38a7e8e14a37f35102d81bb6f23554ed5d88f8872 |

After saving the cold walk, read the rendered-state supplement, actual canonical Python, mirror, HTML, simulator, localization copy, renderer, local CSS, shared locale implementation, and test programs before running them. No earlier review for #895 was found; there are no inherited required findings to close.

The [official statement](https://leetcode.com/problems/maximum-frequency-stack/) was read through normal web access. It was accessible without bypass: constructor FreqStack(), push integer, pop returns/removes highest frequency with nearest-top ties; values 0…10⁹, at most 20000 combined calls, nonempty pop guarantee. The lesson and actual class implement that original contract. Official sample returns 5,7,5,4. `LANGUAGE_FILES` in scripts/register_leetcode_lesson.py specifies Python → solution.py / python-code.js / PYTHON_SOURCE, which this lesson follows. This is faithful executable Python, so the additional non-Python language-contract gate is inapplicable.

### Independent calculations and execution

These are **code checks**, since the UI is preset-only. Predictions were written above before execution. Executed the actual solution.py using Python `exec(compile(...))`, instantiated FreqStack, and independently maintained a physical remaining list. For each pop, Counter plus a right-to-left search selected the expected element; reconstructed each frequency level by scanning surviving occurrences and counting their ranks, then compared all groups, positive counts, and maxfreq after every pop.

| Input / action | Predicted and observed result |
| --- | --- |
| Push 4,1,4,1,9; four pops | 1,4,9,1; remaining [4], group[1]=[4], maxfreq=1 |
| Push 4,4,1; two pops | 4,1; remaining [4]. Excludes the false rule that demotion makes 4 newest. |
| Single 0; single 10⁹ | Each returns itself, empty group, maxfreq=0 |
| Push 3,3,3; drain | 3,3,3, descending levels |
| Push 2,7,1; drain | 1,7,2, ordinary-stack behavior for distinct values |
| Push 6,8,6,8,3; drain | 8,6,3,8,6, independently confirms transfer feedback |
| After each complete drain, push 10⁹ then pop | Returns 10⁹; same object reusable, maxfreq returns to 0 |

Also executed core.trace on both independent inputs: outputs and remaining state match the table. This is separate from the browser simulation and does not claim the UI accepts custom input. The unchanged canonical source does not maintain the displayed physical list. It mutates its own dictionaries and level lists; push returns None, pop returns the chosen integer. Empty pops are outside the official contract and no invented empty-result API is advertised.

The invariant is sufficient: a push creates the latest occurrence at the next rank; the highest rank contains only maximum-frequency values; its latest member is the latest eligible surviving occurrence. A pop removes that value's last occurrence, preserving the original times of all its lower occurrences. If level f empties, f−1 exists for the removed value unless f=1; thus decrement by one is valid. There is no loop requiring an additional termination argument inside pop. A sequence terminates after its finite calls.

Cost audit: dictionaries give expected constant operations; list append is amortized constant; right-end list removal gives constant/amortized constant work under ordinary Python list accounting. Hence expected amortized O(1) per call and O(q) across q calls. Every surviving occurrence contributes exactly one group entry, while freq may keep up to q distinct seen keys even after draining. O(q) space is valid for both all-equal and all-distinct boundaries. The baseline recount/scan/interior removal is O(n) time and O(n) space and can sum to O(q²). The simulator's copied full snapshots and histories explain its separate O(q²) memory claim.

### Inspected suites, execution, and preflight

Inspected all three test programs before execution; their OUTPUT_DIR defaults would overwrite author evidence, so redirected every generated result/screenshot into this run's exclusive evidence directory. No author assets were regenerated. Commands run from repository root:

```sh
OUTPUT_DIR="$PWD/specs/reviews/895-evidence/895-review-1-e34cb27e" python3 -B leetcode/895/tests/check.py
OUTPUT_DIR="$PWD/specs/reviews/895-evidence/895-review-1-e34cb27e" node leetcode/895/tests/core.cjs
OUTPUT_DIR="$PWD/specs/reviews/895-evidence/895-review-1-e34cb27e" NODE_PATH=$NODE_PATH node leetcode/895/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 895 --validate-only
```

All exited 0; preflight produced no stdout and was repeated successfully at the end. Metadata complexity is exactly the nonempty string `O(1) expected amortized time per push/pop; O(q) space for q calls`.

The inspected Python suite checks an independent physical-list/rank oracle across exhaustive short valid prefixes and seeded mixed calls, plus 20000-call equal/distinct/max-push boundaries; rerun reports 79680 checked operations and 1265 fixtures. The core suite compared 16298 intermediate states and found 76 unique, nonempty bilingual pairs. These counts corroborate execution, not teaching quality. Test result JSON retains the original suite's self-check scope text; rerunning it here does not relabel its authorship. Files: python-results.json, fixtures.json, core-results.json, browser-results.json in this run's directory.

## Browser, localization, source transfer, and visual evidence

Used real headless Playwright Chromium on Linux with NODE_PATH and the configured PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when present. Browser suite passed both locales, all three presets and every call, literal after-state levels/list/maxfreq/output against a physical-list oracle, endpoint disabling, rewind/replay, reset and range navigation. Presets finish with A=[2,9,2], B=[5,7,5,4], C=[0,0,0,1000000000]. Call counts include pushes and pops, not just output count; frames are explicitly after complete calls. Before-state is the preceding snapshot, as verified on cold call 4 and official call 7.

Independently switched EN→ZH at tiny frame 3 after a correct reveal: position remained 3 and Chinese explanation retained the selected correct answer and exact groups [6] and [6,8,3]. Range ArrowRight advanced to 4. On a separate 390px run, changing the answer hid feedback until reveal; wrong feedback explained both distractors. Changing preset reset the experiment to 0 and retained the separately labeled independent exercise, which is appropriate. Boundary End and ZH→EN→ZH retained frame 8 and the localized #895 title in both H1 and document title. Chinese prose was read through all five teaching steps: frequency priority, chronology, no demotion append, decrement rationale, code mapping and cost agree with English, including zero-count retention and simulation cost. Duplicate-key/shape checks agree with the consumed [zh,en] representation; observed push/pop/group/feedback bindings have complete operands and correct meanings.

A supplementary browser script initially stopped because `input[value="0"]` matched both the range and a radio; no product failure was inferred. Repeated it using `input[name=prediction][value="0"]`, and all intended change/preset/boundary checks completed. No implementation or test was edited.

Source fidelity was checked without trimming: canonical solution.py, decoded offline PYTHON_SOURCE, textContent of rendered code, downloaded bytes, automatically copied clipboard text, and manually transferred fallback clipboard text are equal including the final newline. In each locale the browser suite seeded a fresh distinct non-source clipboard sentinel and verified readback before disabling clipboard writes, invoked Copy, verified focus/full selection, dispatched Linux Control+C, and read back exact canonical source. The later fallback screenshot is a separate appearance check; it is not the transfer evidence. Offline after initial asset load still displayed full source and advanced simulation; blocked storage did not prevent locale changes.

Keyboard: independently focused Next and pressed Enter at 320px (0→1), inspected its orange focus ring; the suite exercised Prev via Enter and related links via keyboard, and the range ArrowRight was independently exercised. Disabled start controls have actual disabled semantics, opacity 1, muted rgb(154,167,184), dashed borders and readable labels. Their appearance was inspected in disabled-start.png; keyboard-next.png and both quiz-focus screenshots show focus separated from algorithm state.

Visual matrix was captured at 320,390,736,1440px, each at 100% and CSS zoom 200%, in both languages. Inspected cold-initial.png and cold-pop.png plus en/zh-320-zoom1.png, en/zh-320-zoom2-after.png, en/zh-390-zoom1-after.png, en/zh-390-zoom2-after.png, en-1440-zoom1.png, zh-1440-zoom2-preset.png, independent-boundary.png, en-quiz-focus.png, disabled-start.png, fallback-selection.png and keyboard-next.png. At narrow widths panels stack, group labels and values wrap without intersecting other text, and selected B remains a complete short code with the full preset description in the adjacent wrapping readout. The 10⁹ value is fully readable at 390px. At 200% the page requires substantial vertical scrolling and navigation scrolls horizontally; observed partial content at screenshot edges/sticky navigation is viewport clipping, not lost state text. No essential label/value collision was observed. Full-width overflow assertions passed; screenshot inspection supplies the additional component-level evidence.

Contrast code uses correct sRGB linearization and 0.2126/0.7152/0.0722 weights and calibrates black/white=21, identical=1, red/black=5.252. All tested solid text/muted/accent pairs on the three backgrounds exceed 4.5; the minimum recorded ratio is 6.449407898769069 (muted on panel2). Scope is the actual opaque local palette, not a universal audit of gradients, physical devices or assistive technologies.

Related links were followed by keyboard in both locales: /leetcode/32/#step1 explains unmatched-opening and invalid-boundary stack indices; /leetcode/84/#step1 explains waiting for a shorter bar and settling pending taller bars. Their actual content supports their specific rendered labels. #895 had no console/page/asset errors. A separate destination #32 favicon.ico 404 is recorded in browser-results.json; it does not obstruct either lesson's teaching content. This is local-preview navigation evidence, not production delivery verification.

## Findings and scores

No required finding is open. No earlier #895 report was available to close against this candidate.

**895-A01 — optional, minor code-scaffolding friction.** Candidate above; section 05, both locales, any viewport; open the full source after the prose. Expected for the stated basic-Python reader: a short orientation to class instances and `self`. Actual: the constructor and method interface are named and operations mapped well, but class/self syntax is assumed. All algorithmic transitions are reconstructable; this is an optional pedagogical improvement, not a missing mechanism or invalid callable. Suggested next action: author may add a brief class/self gloss in a future revision. Status: advisory open; no fix revision or closure claimed.

| Dimension (weight) | Score /4 | Observed rationale |
| --- | --- | --- |
| Problem/terms (15) | 4 | Explicit remaining copies, right-end top, tie rule, valid inputs, tiny complete manual drain before abstraction. |
| Derivation (20) | 4 | Concrete slow method and repeated work, two wrong-rule counterexamples, occurrence-by-occurrence level construction and explicit reason not to re-append. |
| Correctness (20) | 4 | Sufficient chronological-rank invariant, concrete before/after values, f−1 decrement argument, independently reconstructed states, boundaries and reuse. |
| Interaction (20) | 4 | Predict/reveal/change, complete call history, real before/after snapshots, rewind/reset/endpoints and keyboard behavior observed and checked. |
| Python/cost (15) | 3 | Executed faithful canonical class, exact transfer parity and fresh input/invariants; costs distinguish submission/simulator and retained keys. Minor class/self orientation friction for this target. |
| Bilingual/device (10) | 4 | Equivalent causal reasoning and localized identity; retained frame/choice; inspected narrow, desktop and enlarged states, readable disabled controls and focus. |

Weighted score: **96.25/100**. Scores in required order: **[4,4,4,4,3,4]**. Required IDs: **none**.

## Conclusion and limitations

**Accepted** for independent lesson review of revision 36b2c1682db653507069256a099fcc34c0c20e9c: threshold met, every dimension at least 3, no required open finding, browser/source/executable/preflight evidence complete. This is separate from publication. No claim of a successful LeetCode submission, real novice comprehension, physical-device testing, exhaustive screen-reader testing or public deployment. Zoom coverage uses CSS zoom 2 in Chromium rather than browser-chrome zoom. Only this report and this run's exclusive evidence directory were written; no tracked candidate, shared file, service, author evidence or earlier review was changed.
