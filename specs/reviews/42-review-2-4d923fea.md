# Independent review: 42 — Trapping Rain Water

Candidate: `62402c285c6e108a342131aad00231c3db53560a`. URL: http://127.0.0.1:18770/leetcode/42/. Review run: `42-review-2-4d923fea`; exact reviewer/model identity unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen rubric read first: `specs/leetcode-review-gates.md`; weights 15/20/20/20/15/10. Python is the preferred applicable canonical language. Review is separate from publication.

## Cold browser walkthrough (saved before source, tests, author notes, or earlier reviews)

Used real Chromium through Playwright, 1280×900. Opened the candidate after reading only the rubric. Captured and inspected `42-evidence/42-review-2-4d923fea/cold-initial.png`. The following conclusions came from rendered lesson content and operation, not source.

| Teaching step / question | Action | Observable result | My causal reconstruction |
| --- | --- | --- | --- |
| 01: What are we finding? | Read input constraints and hand calculation for [3,0,2,0,4]. Independently add depths. | Unit-width nonnegative bars; depths 0,3,1,3,0 give 7. Middle height 2 is subtracted from level 3. | Water must be held on both sides, so the smaller highest wall limits the level; occupied bar height cannot be counted as water. The example explicitly excludes the tempting taller-wall rule and confusing level with depth. |
| 01 baseline: what work repeats? | Read displayed baseline, compare its slices across positions. | Each index rescans left and right; text states O(n²) time, O(n) temporary slice space, then O(n) prefix/suffix arrays. | Repeated maximum scans can be saved. Full arrays keep each side's maxima, whereas two running maxima can suffice if one side is already decidable. |
| 02: Why can we skip work? | Read the side-choice argument and unsettled-region legend. | Current endpoints must enter maxima before comparison; lower left maximum has an already-known right wall at least as high. Outside pointers is settled once; cyan is confirmed water. | An unseen taller right wall cannot increase the smaller left bound. The other case is symmetric. Absence of cyan in an unsettled cell is lack of a decision, not a dry result. |
| 03: What changes in one operation? | Before next: predicted index 0 adds 0, maxima 3/4, left becomes 1; next adds 3; final total 7. Click next six times. | Events 1–5 settle indices 0–4 with increments 0,3,1,3,0; left becomes 1,2,3,4,5; right remains 4. Maxima are 3/4 until final cell refreshes left_max to 4. Totals 0,3,4,7,7. Event 6 displays final result 7. | Each transition settles exactly one cell, retains earlier cyan, and advances its pointer. Maxima refer to processed comparison endpoints, and refresh next operation. Termination follows left passing right; final event returns the sum. |
| 03: What is retained? | Open Previous state, focused Python, and recent operations at endpoint. | Previous final-settlement diagram matches terminal diagram; focused excerpt is `return water`; six operations remain listed. Captured `cold-end.png`. | The terminal event changes return status without changing water. History records operations separately from the current diagram. |
| 04: Can I transfer the rule? | Before reveal, predicted 2 for [4,1,3]. Select 2 and check. | Feedback: lower wall 3 minus bar 1 gives 2. | The taller 4 cannot hold water above the opposite 3; depth differs from level. This is a fresh height pattern but a small transfer task. |
| 05: How does this become Python? | Open complete solution, read variable mapping and cost. | `Solution.trap`, current endpoint maxima refreshed before branch, lower side adds depth and pointer advances. Code retains only scalars and input list. | Visible event 2 corresponds to max(3,0)=3 and max(4,4)=4; add 3−0 to water, then left 1→2. At most n iterations and constant auxiliary storage; per-cell diagram depths belong to teaching UI only. |

Independently chosen input, prediction recorded before source/runtime reveal: `[2,0,1,0,3]` → depths `[0,2,1,2,0]`, total **5**. Independent counterexample to using the taller wall: `[3,0,1]` → **1**, not 3. UI offers four presets only, so these are reserved for **code checks**, not claimed as custom-input UI experiments. The visible worked example already demonstrates the wrong taller-wall rule. No author material supplied missing causal explanations.

## Subsequent audit

The cold record above was saved before opening source, tests, author claims or earlier reviews. Subsequently read canonical Python, offline mirror, page, bilingual `copy.js`, `app.js`, shared `core.js`, `lesson.js`, locale handling and styles. Inspected `leetcode/tests/test_hard_solutions.py`, `test_hard_core.cjs` and `test_hard_browser.cjs` before executing checks. Relevant supplied claims include exhaustive small Python arrays, random trace oracles, maximum bounds, persistent settled depths, clipboard/offline access and device controls. Did not run their all-lesson browser suite or regenerate author assets; ran independent inline checks scoped to this lesson instead.

`git rev-parse HEAD` returned the requested candidate. Fetched all ten served assets below and compared their bytes with the checkout. All matched. `git status --short` showed only this report and this run's evidence directory as untracked; no tracked changes.

| Asset relative to leetcode/ | SHA-256 |
| --- | --- |
| 42/index.html | b23b8735477b6732966ebba7a56be1a97d2ad13e27809af7235dc8843bbf783d |
| 42/solution.py | 445df8f0630dea83e727adc566328b482162b8f3f4c60eed02fa8358111ff7e5 |
| 42/python-code.js | a804a4248f276b91b39a4111cce000c0ab5320791b26c135a65390564c8f95ec |
| 42/copy.js | f2abcfce607340e0ea9d990e1f5cd99131c4e90eb57a8eaa9c3a1f41c9dcf9ab |
| 42/app.js | ff88781bdd473fb647b740dd4f450be58195b85a8ad7dba04e24779adaf7cca7 |
| common.js | f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b |
| style.css | 6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27 |
| hard-first-ten/core.js | 342d7cbdf8c1e6f8527e6804ec286157e8fc63513a3c36c61d67c496bd08eeed |
| hard-first-ten/lesson.js | 18365da600d3a774aec9afb96deb377fa269fe894424ed6cef41ad9f929c9731 |
| hard-first-ten/style.css | 09ebfd4c560ceee4b5c4e15442f37e21e8a9115525f20c74c1a34491af6a48b1 |

Read the [official statement](https://leetcode.com/problems/trapping-rain-water/) normally through the web tool, without bypassing access. It specifies nonnegative unit-width heights, n from 1 to 20000 and height at most 100000; examples return 6 and 9. Lesson constraints and scalar-output semantics agree. The actual callable is faithful Python `Solution.trap(self, height: List[int]) -> int`, returning a number without mutating height. No non-Python contract or conceptual-only analogy applies. Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python requires `solution.py`, `python-code.js`, export `PYTHON_SOURCE`; these are present.

### Independent execution and correctness

- Executed actual canonical `solution.py` with inline `python3 -B`, `compile` and `exec`. Exhaustively checked heights 0..3 for lengths 1..7, 500 seeded random arrays (seed 421024, lengths 1..80, heights 0..100000), and eleven chosen/boundary fixtures: **22,355 cases passed**. The oracle independently sums each column's minimum of left/right maxima minus height; maximum arrays use closed-form expected answers. Input equality was asserted on every call.
- Fresh predicted `[2,0,1,0,3]` returned **5**; counterexample `[3,0,1]` returned **1**. These are **code checks**, because UI is preset-only. Official second example returned 9; `[0]`, `[1,1]`, descending heights and flat zeros returned 0; `[1,0,1]` returned 1. Length-20000 maximum basin returned **1,999,800,000**; flat 100000 and flat zero boundaries returned 0.
- Independently required the actual shared JavaScript rain model and checked all 0..2 arrays of lengths 1..7 plus the fresh input, counterexample and official second example: **3,282 inputs / 27,902 frames** passed. Each settled depth equals the independent column oracle; water equals sum of settled depths; every position outside pointers is settled; each settlement moves exactly one pointer by one and increases settled count by one. Input arrays remain unchanged. The recorder deep-copies frames; later operations retain earlier observations.
- Numeric mapping: default event 1→2 starts left=1/right=4, water=0. Refreshed maxima remain 3/4. `water += left_max - height[left]` adds 3−0; `left += 1` produces left=2, water=3. The browser's expanded previous diagram has only index 0 settled, while current diagram adds +3 at index 1. Focused code matches those operations. Event 4→5 refreshes left_max from 3 to 4 before settling height 4 with zero depth.
- Correctness: after maxima refresh, the smaller known side maximum limits that side exactly because a sufficient opposite wall already exists. Unseen interior walls cannot remove this opposite wall or raise the smaller limiting side. The symmetric right branch is exercised by the official preset. Equality can choose left. Updating before subtraction prevents negative depth. Each iteration shortens the unsettled region by one; `left <= right` handles the final cell, then crossing terminates without another array read. One bar settles dry once, then returns.
- Actual code uses O(n) time and O(1) auxiliary space, leaves input unchanged, and stores no per-column depths. The baseline's slices/rescans use O(n²) time and O(n) peak temporary space. Prefix/suffix arrays are an optional named intermediate approach; the direct two-pointer justification is supplied separately. Teaching snapshots deliberately retain more data than the submission.

### Source parity and metadata

Decoded `python-code.js` as JSON and compared the entire string with canonical Python, including final newline: exact. Both locales' displayed DOM code, successful clipboard content and downloaded solution bytes matched the same canonical source. Served solution also matched. Forced clipboard rejection exposed the same source in the readonly textarea, focused and selected it; both feedback translations were correct. Offline `file://` loading still displayed exact source and advanced the experiment.

Ran from repository root, after inspecting the validation implementation:

`python3 -B scripts/register_leetcode_lesson.py 42 --validate-only`

Result: **exit 0**, no stdout/stderr. Repeated standalone invocation also exited 0. `lesson-entry.json` complexity is exactly the single nonempty string **"O(n) time; O(1) auxiliary space"**. No registration or repair performed.

### Browser, bilingual and device checks

Real Chromium via Playwright, resolved using supplied NODE_PATH and launched with `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Main browser checks produced no page errors. Screenshots were saved only under `42-evidence/42-review-2-4d923fea/`.

- In EN and Chinese, all four presets reached expected totals **7/6/0/0**. Compared snapshot state for next→rewind→next and restart for each preset. Initial Prev and terminal Next were disabled. Slider reached endpoints; final result appeared. Changing preset restarted the trace. Language switching preserved preset, frame, selected prediction and revealed status. Details remained under user control.
- Tested all three quiz choices in both languages: correct depth 2, water-level confusion 3, and mistaken dryness 0 receive their respective causal feedback. Changing choice cleared stale revealed feedback. This tests a new height pattern, though it is still a one-number exercise rather than a request to explain the invariant.
- Actual keyboard: ArrowRight on range advanced 0→1; Enter on Next advanced 1→2; Space on Prev rewound 2→1; Enter on Reset returned to 0. Focus outlines are defined. Clipboard/storage denial did not prevent the lesson operating. Internal collection, lesson and cross-lesson fragment links resolved to existing targets.
- Dense official preset event 8, both locales, at **320/390/1280px**: captured full pages and focused state screenshots. Inspected `en-320-trace.png`, `zh-390-trace.png`, and all six `*-state.png` screenshots at their actual screenshot resolution. Index/depth associations remain distinct for all twelve columns; variable labels and values do not clip or intersect. Text-range geometry independently confirmed no label/value intersections for all five state pairs at all six locale/width combinations. No page overflow. Narrow controls wrap and source excerpts scroll horizontally.
- Captured and inspected **200% CSS zoom** at 1280px in `en-zoom200-diagram.png` and `zh-zoom200-controls.png`: enlarged chart labels and controls remain readable; no page overflow. Equivalent captures are retained for the other locale/component. This exercises CSS layout enlargement; native toolbar zoom is not separately verified. Sticky navigation visible across some full-page/scroll captures is a capture-position artifact, not a state-label collision.
- `event2-before-after.png`, the DOM readings and explicit previous-state expansion establish persistent gray bars versus newly confirmed cyan water. A dry active column has transparent background and zero water blocks; highlighting does not create false water. `disabled-initial.png` shows disabled Prev still readable.
- Calculated contrast from rendered colors: muted #9aa7b8 on panel #161b22 **7.08:1**; regular #e8edf4 on #1c2330 **13.40:1**. Disabled button opacity .4 gives approximately **3.30:1** composited label contrast on the stage. The disabled state is dim but distinguishable; this is not an unsupported WCAG certification. The 11px mobile chart labels and dim disabled controls create minor reading friction.
- Independently read both translations: numeric hand derivation, spill reason, level versus depth, maxima refresh timing, post-operation pointers, unsettled versus dry, lower-bound exclusion argument, baseline/cost and Python mapping agree. Shared Python identifiers stay unchanged. Chinese adds no missing English explanation.

## Earlier required findings and closure

Read `specs/reviews/42-review-1-c31e1a0d.md` only after saving the cold walkthrough. It reviewed candidate `e8db40883f410333b53431d80aeaedc7fab566fb`. This review preserves its stable IDs and does not rewrite the earlier report.

| Stable ID / original severity | Original reproduction and expected/actual | Current candidate regression evidence | Status / next action |
| --- | --- | --- | --- |
| **42-META-01**, required high | Root validation command failed with missing `leetcode/42/lesson-entry.json`; valid metadata and one-string cost were required. Locale/width/input N/A. | Candidate 62402c2 contains metadata, exact one-string cost, and the prescribed safe preflight exits 0. | **Closed** against 62402c285c6e108a342131aad00231c3db53560a. Author's metadata action is satisfied; no further action. |
| **42-TEACH-01**, required medium | Step 01 in both locales, default [3,0,2,0,4], desktop/mobile: earlier hand text stated depths and total without numeric wall/minimum/subtraction reasoning before abstraction. | This run's source-blind cold walkthrough observed min(3,4)=3, 3−2=1, two 3−0 depths, explicit sum 7, left-wall spill exclusion and distinction between level/depth **before** baseline. Current bilingual source and inspected initial screenshot confirm the same sequence. | **Closed** against 62402c285c6e108a342131aad00231c3db53560a. Author's hand-calculation action is satisfied; no further action. |

The earlier report also recorded historical pointer and false-cyan concerns (`42-HIST-POINTER`, `42-HIST-CYAN`); current per-frame pointer checks and transparent dry-active-column browser check confirm no recurrence. These were not open required findings in that report.

## Scores and conclusion

| Dimension | Weight | Score /4 | Observed rationale |
| --- | ---: | ---: | --- |
| Problem, terms, hand calculation | 15 | **4** | Explicit input/output/units/constraints; actual wall, level, subtraction and total worked before abstraction; tempting wrong rules excluded. |
| Derivation and saved work | 20 | **4** | Repeated side scans identified; running maxima retain that work; known opposite wall explains why unseen heights cannot affect the chosen endpoint. |
| Maintained state and correctness | 20 | **4** | Settled-once invariant, refresh timing, numeric transition, both branches, equality, one bar and termination match actual source and frames. |
| Interaction and visual meaning | 20 | **4** | Prediction/reveal/change, before/current diagrams, retained cyan/history, rewind/reset/endpoints and locale preservation observed directly. |
| Python and cost | 15 | **4** | Faithful actual executable callable, exact source channels, independently predicted cases, maximum boundary, nonmutation and justified cost. |
| Bilingual and device access | 10 | **3** | Equivalent reasoning, usable keyboard and narrow/enlarged layouts; small mobile labels and dim disabled text add minor friction. |

Weighted score: **97.5/100**. Every dimension is at least 3; **no required open findings**. Outcome: **accepted for this candidate and reviewed scope**, independently of publication.

Limitations: preset-only UI means fresh custom arrays were code checks. Browser execution models Python rather than interpreting it; canonical Python was executed separately. Enlargement evidence uses CSS zoom, not native toolbar zoom. No real human learning/comprehension measurement or successful LeetCode submission is claimed. Scores reflect independent reconstruction and bounded observed checks, not test counts or screenshots alone.

Only this exact report and this run's exclusive screenshot directory were written as review artifacts. No implementation/shared files, tests, author evidence, earlier reports, Git configuration or services changed. No agents, commits, registration, push, deployment or schedules.

