# Independent review: 42 — Trapping Rain Water

Candidate: `e8db40883f410333b53431d80aeaedc7fab566fb`. URL: http://127.0.0.1:18770/leetcode/42/. Target: basic Python, lists, loops, functions, elementary recursion. Reviewer: this independent review run; model identity unavailable. Rubric: frozen `specs/leetcode-review-gates.md`, weights 15/20/20/20/15/10. Interpretation frozen before browser: faithful Python solution, causal derivation, invariant, observable transitions, executable transfer, bilingual/device access.

## Cold walkthrough (saved before source, tests, briefs or earlier reviews)

Read only the frozen rubric before launching real Chromium through Playwright. Initial desktop 1280×900, English. Captured and visually inspected `cold-mid.png`; also captured `cold-initial.png`. No implementation materials supplied the following explanations.

| Teaching step/question | Action and prediction | Observable result | Causal conclusion in my words |
|---|---|---|---|
| 01 What are we finding? | Read input, constraints and hand example; manually calculate [3,0,2,0,4]. | Nonnegative unit-width bars; depths 3,1,3 and total 7. Baseline explicitly rescans left/right maxima. | Each column's water is capped by its shorter enclosing wall; bars occupy volume and are subtracted. |
| 02 Why can we skip work? | Read maxima comparison and invariant, predict left endpoint settles first. | Text says refresh both maxima before comparison; left_max≤right_max guarantees an adequate opposite wall. | Unseen taller interior walls cannot raise the smaller limiting bound at this endpoint. Running maxima retain repeated searches. |
| 03 What changes in one operation? | Click next six times; predict first depths 0,3,1,3,0 and final total 7. | Events 1–5 show exactly those depths; water totals 0,3,4,7,7; left advances 1,2,3,4,5, right stays 4. Event 6 returns 7. Cyan persists, dots identify unsettled cells. | Every move settles exactly one position. Pointer labels describe the next position, maxima describe the last operation until refreshed. Final pointer crossing exhausts the range. |
| 03 Before/after and mapping | Restart in a fresh browser, advance twice, expand Previous state, Python operation and Recent operations. | Previous diagram has only column 0 settled; current adds +3 at column 1; excerpt is `water += left_max - height[left]`, then `left += 1`; history includes events 0–2. | Before: left=1, water=0; subtract height 0 from bound 3, then left=2 and water=3. Data blocks persist independently of current focus. |
| 04 Predict before revealing | Predict depth 2 for [4,1,3], select 2 then reveal; change choice to 3. | Explanation says lower wall 3 minus bar 1 is 2; changing choice clears feedback. | Right wall excludes the tempting depth 3; both walls matter. This is a fresh transfer from the worked example, though only one scalar question. |
| 05 How does this become Python? | Open complete solution and read variable table/cost. | Official-style `Solution.trap`, maxima updated before comparison, one endpoint moved each loop, return total. Python uses no per-column depths. | Trace stores extra teaching data; actual algorithm has only a fixed number of counters and scans once. |
| Boundary demonstration | Select Increasing heights, predict 0, advance to endpoint. | [1,2,3,4] finishes at event 5/5 with all +0 and total 0. | A higher wall on only one side does not form a basin. |

Fresh independent input prediction, recorded before execution: `[2,0,1,0,3]` has depths `[0,2,1,2,0]`, total **5**. Independent counterexample prediction: `[3,0,1]` holds **1**, not 3; using only the left maximum fails because the right wall leaks above height 1. The UI has only four presets, so these will be **code checks**, not custom-input browser experiments. The on-page quiz prediction was also made before reveal.

Cold observations: terminology is mostly introduced in place. The worked example gives depths without a drawn hand calculation before abstraction; the later blocks make it reconstructable. Prefix/suffix maxima are mentioned without being developed, but the direct baseline-to-running-bound argument is present. Maxima labels initially sounded inclusive of current pointers, clarified explicitly by the refresh timing paragraph. No human comprehension or LeetCode submission is claimed.

## Source and regression audit

The cold record above was written before any source/test/prior-report inspection. `git rev-parse HEAD` returned the requested revision. All ten served assets listed below matched checkout bytes exactly; tracked files remained unchanged.

| Asset | SHA-256 |
|---|---|
| 42/index.html | f1ccb9ccdb29b1d421f805c7e2abbcd97b9279ac95f815461f715eaace5d7724 |
| 42/solution.py | 445df8f0630dea83e727adc566328b482162b8f3f4c60eed02fa8358111ff7e5 |
| 42/python-code.js | a804a4248f276b91b39a4111cce000c0ab5320791b26c135a65390564c8f95ec |
| 42/copy.js | cef324f199894c4908e53fc1f7192006e2a517f5b305f310d122d1feb2cf5881 |
| 42/app.js | ff88781bdd473fb647b740dd4f450be58195b85a8ad7dba04e24779adaf7cca7 |
| common.js | f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b |
| style.css | 6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27 |
| hard-first-ten/core.js | 342d7cbdf8c1e6f8527e6804ec286157e8fc63513a3c36c61d67c496bd08eeed |
| hard-first-ten/lesson.js | 18365da600d3a774aec9afb96deb377fa269fe894424ed6cef41ad9f929c9731 |
| hard-first-ten/style.css | 09ebfd4c560ceee4b5c4e15442f37e21e8a9115525f20c74c1a34491af6a48b1 |

Read the [official statement](https://leetcode.com/problems/trapping-rain-water/) normally through the web tool: nonnegative unit-width heights, n=1..20000, height≤100000, examples yielding 6 and 9. No access bypass. The lesson matches these constraints and output semantics. The callable is faithful Python `Solution.trap(self, height: List[int]) -> int`, returning a scalar without mutation; no native-language exception or conceptual analogy applies. Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python canonical/mirror/export are exactly `solution.py`, `python-code.js`, `PYTHON_SOURCE`.

Inspected canonical solution, offline mirror, page, bilingual copy, shared recorder/rain model, controls, locale handler and styles. Inspected shared test sources `test_hard_solutions.py`, `test_hard_core.cjs`, `test_hard_browser.cjs` **before executing any tests**. Their relevant claims include exhaustive Python heights 0..2 for lengths 1..7, random JS model checks, settled-depth and pointer assertions, official maximum basin, parity, locales, clipboard and offline controls. The supplied browser runner covers ten lessons and has its own optional screenshot output; I did not run it or overwrite author evidence. Instead used independent inline Python/Node/Playwright checks, with screenshots exclusively in this run's directory. No author test totals are treated as teaching evidence.

### Independent executable checks

- Inline `python3 -B` loaded and executed the actual `solution.py` using `compile`/`exec`, not the JavaScript trace. Compared against a separate per-column left/right-max oracle for all heights 0..3, lengths 1..7; 500 seeded random arrays (seed 421031, lengths 1..79, heights 0..100000); nine chosen fixtures; and three length-20000 boundaries. **22,356 cases passed**, input equality checked throughout the oracle cases. Maximum basin returned 1,999,800,000; all-flat zero/100000 arrays returned zero. `[4,2,0,3,2,5]` returned 9. Fresh `[2,0,1,0,3]` returned predicted 5; counterexample `[3,0,1]` returned predicted 1. These are code checks, not UI custom-input checks.
- Exact JSON-decoded mirror equality with canonical Python passed. Both locales' DOM source, successful clipboard content, downloaded bytes, fallback textarea, and served solution matched the same complete canonical source including final newline.
- Inline Node required the actual shared rain model. All 0..2 heights, lengths 1..7, plus the two fresh cases and official second example: **3,282 inputs / 27,902 frames** checked. Every settled depth matched the oracle; sum of settled depths equaled water; positions outside pointers were settled; exactly one pointer moved by one on every settlement; input remained unchanged.
- Transition audited independently: default event 1→2 has old left=1/right=4, maxima 3/4, water 0; processing height[1]=0 adds 3, then left=2, water=3. Event 4→5 refreshes left_max from 3 to 4 before adding 0 at height[4]=4. Official preset includes right-side operations as well. Equality chooses left safely. A one-bar input settles once then returns; pointer crossing excludes further array reads.
- Correctness argument: at a settlement compare refreshed side maxima. If left is lower, an already observed opposite wall supplies the required bound and the left-side maximum is exact for that index. Interior unknown heights cannot lower the known opposite wall or raise the limiting left bound. The symmetric case handles right. Each step reduces the unsettled region by one, so all cells are counted once. `while left <= right` includes the last cell. O(n) time, O(1) auxiliary Python space are accurate; no mutation. Baseline slices and rescans cost O(n²) time / O(n) peak temporary space. Teaching snapshots intentionally use additional storage.

### Browser and access observations

Real headless Chromium via Playwright, honoring `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when set; package resolved through supplied NODE_PATH. No browser page errors during the main checks.

- Both EN and Chinese: all four preset endpoints yielded 7/6/0/0. Compared exact snapshot state through next→back→next and reset for each preset; initial Prev and terminal Next disabled correctly; slider reaches terminal result. Locale switching preserved frame, preset, choice and revealed state. Details remained user-controlled. All three quiz choices produced distinct causal feedback; changing choice removed stale reveal.
- Keyboard: range ArrowRight advanced event 0→1, Enter on Next advanced to 2, Space on Prev rewound to 1, Enter on Reset restored 0. Focus styles are supplied for controls, links and summaries. Clipboard denial exposed/focused/selected the exact source textarea in both locales; feedback translated correctly.
- Captured and inspected EN/ZH official-preset event 8 at 320/390/1280px: all twelve column indices/depth labels remained separately readable; state labels/values wrapped without intersections; controls wrap to rows; no page overflow. Narrow code excerpts use horizontal scrolling. `en-320-trace.png`, `en-390-trace.png`, `en-1280-trace.png` and corresponding `zh-*` captures retain these states. Tiny 11px mobile diagram labels are a minor readability concern, not evidence of clipping.
- 200% CSS zoom was exercised at desktop in both locales: controls reflow and chart remains visible, with no page overflow. Captured controls and focused diagram separately (`*-zoom200.png`, `*-zoom200-diagram.png`); an additional settled Chinese capture was made after reduced-motion and waits. This is CSS zoom evidence, not native browser toolbar zoom; native browser zoom remains unverified. Full-section screenshots contain the sticky navigation at the screenshot's scrolling position; these capture artifacts are not counted as content collisions.
- Gray bars and cyan settled depths persist independently of the active underline. Explicitly verified the initial dry active column's background is transparent and has zero cyan blocks, so highlighting does not invent water.
- Rendered styles: muted text #9aa7b8 on panel #161b22 has approximately 7.08:1 contrast; normal text #e8edf4 on #1c2330 has 13.40:1. Disabled controls use opacity .4 (approximately 3.30:1 composited text), distinguishable and legible but substantially dimmer. No disabled-label disappearance observed. Native disabled controls are not being assigned an unsupported WCAG pass claim.
- Both translations retain lower-bound proof, refresh timing, post-operation pointers, unsettled versus dry distinction, baseline/cost, code mapping and quiz reasoning. Chinese variable identifiers intentionally stay Python identifiers.

### Earlier findings checked only after the cold record

No earlier per-ID independent report was found. Read the relevant rows of `specs/reviews/leetcode-first-ten-review.md` after source audit began; it is author/self-check history, not prior independent acceptance. Those rows have no stable original IDs. For cross-reference only, this review calls them `42-HIST-POINTER` and `42-HIST-CYAN`: post-operation pointer mismatch and false cyan active background. Current candidate independently passes pointer-by-one frame assertions and the browser transparent-dry-column regression above. These historical concerns are verified resolved for this candidate; no earlier required independent finding is silently closed. The old report also notes sticky screenshot artifacts, consistent with the current captures.

## Required findings

### 42-META-01 — Missing required lesson metadata (required, high, open)

Scope: problem 42, candidate e8db40883f410333b53431d80aeaedc7fab566fb; metadata gate; locale/viewport/input not applicable.

Reproduce from repository root: `python3 -B scripts/register_leetcode_lesson.py 42 --validate-only`.

Expected: non-mutating preflight succeeds, with `lesson-entry.json` complexity exactly one nonempty string covering time and space. Actual: exit **2**, `Metadata validation failed: [Errno 2] No such file or directory: '/home/songyy/projects/leetcode-hard-campaign-20261018/leetcode/42/lesson-entry.json'`. Listing the lesson confirmed the file is absent. The complexity field therefore cannot satisfy the required gate. Violates frozen rubric non-mutating metadata preflight and the user's explicit metadata gate. Owner/next action: lesson author provides valid metadata in a new candidate; reviewer reruns preflight. Fix revision: none. Regression/closure: pending; no candidate repair or registration performed.

### 42-TEACH-01 — Hand example states depths without working them out (required, medium, open)

Scope: problem 42, same candidate, step 01, both locales, default input `[3,0,2,0,4]`, reproducible at desktop 1280px and mobile 320/390px. Reproduce: open the page and read Work one example by hand before proceeding to baseline or step 02.

Expected: a concrete hand calculation before abstraction that identifies the two limiting wall heights, selects the smaller, subtracts an actual bar height and totals the depths. Actual: the hand section only asserts depths `3,1,3` and total `7`; it never shows `min(3,4) - 2 = 1`, or equivalent actual-number reasoning. The first minimum/subtraction computation is symbolic Python in the following baseline. A reader must supply this missing bridge, or wait until the later algorithm experiment/quiz. Evidence: cold walkthrough and `cold-initial.png` / `cold-mid.png`, plus matching EN/ZH hand strings in copy.js. This violates the requested detailed hand-worked tiny example before abstraction; presence of a hand-example heading and a correct result does not fulfill it. The later experiment is useful but does not repair that sequence. Owner/next action: lesson author adds explicit numeric wall/level/depth reasoning before baseline in both locales; new-candidate cold recheck required. Fix revision: none. Regression/closure: pending.

## Scores and conclusion

| Dimension | Weight | Score /4 | Observation/rationale |
|---|---:|---:|---|
| Problem/terms/hand calculation | 15 | 3 | Input, units, constraints and correct tiny result are explicit; numeric hand derivation is missing (42-TEACH-01). |
| Derivation/saved work | 20 | 3 | Baseline rescan cost and lower-bound exclusion argument are reconstructable; prefix/suffix option is only named and the concrete bridge arrives late. |
| Maintained state/correctness | 20 | 4 | Settled invariant, refreshed maxima, one-position transition, equality, single bar and termination match canonical execution and independent per-frame checks. |
| Interaction/visual meaning | 20 | 4 | Prediction/reveal/change, persistent water, prior frame, recent history, rewind/reset/endpoints and language preservation observed directly. |
| Python/cost | 15 | 4 | Faithful executable source, numeric transition mapping, actual source parity, nonmutation, fresh and maximum-size checks; costs distinguish teaching storage. |
| Bilingual/device access | 10 | 3 | Equivalent reasoning and tested mobile/desktop layouts/keyboard; small diagram labels and dim disabled controls add friction; native toolbar zoom not verified. |

Weighted score: **88.75/100**. Required open: **42-META-01, 42-TEACH-01**. Outcome: **changes_required**. Passing executable checks and score do not override required findings. Native browser toolbar zoom is an additional evidence limitation; only CSS 200% enlargement was exercised. This is an independent reconstruction and bounded technical review, not measured novice comprehension or a successful LeetCode submission, and it does not authorize publication.

Only this exact report and the exclusive evidence directory were written. No implementation, tracked assets, author evidence, tests, services, Git configuration or earlier reviews were changed. No agents spawned, registration, commits, deployment or schedules performed.
