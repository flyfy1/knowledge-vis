# Independent review: 715 — Range Module

Candidate: `74be86455bbaa280a8d86559c32361b782969961`. URL: http://127.0.0.1:18782/leetcode/715/. Review date: 2026-10-25. Reviewer: this independent review run; model identifier unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen weights: 15/20/20/20/15/10; canonical Python interpretation applies.

## Cold browser walkthrough (saved before source inspection)

Only the frozen rubric was read before opening Chromium through Playwright. These are browser-rendered observations, not source-derived explanations. No brief, prior review, tests or implementation was opened.

| Teaching step / question | Action | Observable result | My causal conclusion |
| --- | --- | --- | --- |
| 01: Which numbers survive a cut? | Read the tiny add [2,8), remove [4,6) example; probe 4, 5.5, 6. | Two bands [2,4), [6,8); 4 and 5.5 uncovered, 6 covered; explanatory sentences change. | Removal includes its left edge and excludes its right edge. This is continuous coverage, not isolated integer points. The figure explains filled/hollow endpoint meanings and height has no quantity. |
| 02: Why store only changes? | Read cell baseline, walk across boundaries [2,4,6,8], manually count switches for query [3,7). | Baseline iterates unit cells, potentially almost a billion; odd counts mean inside; endpoint-only query is explicitly refuted by gap at 5. | Integer endpoints let whole unit cells stand for real coverage. Boundaries compress long runs; equal odd start/end counts exclude every internal switch. Definitions explain parity, bisect counts and slices before the update rule. |
| 02: How preserve outside coverage? | Hand-follow remove [4,6) from [2,8], then add it back. | i=j=1 inserts [4,6]; reverse add uses i=1,j=3 and replaces [4,6] with nothing. | Each edge is retained only when its two sides differ. Replacing interior switches assigns a uniform state while preserving outside coverage. Strict increasing paired endpoints are the invariant. |
| 03: What changes after each call? | Apply all five Official example operations one at a time. | Add(10,20): []→[10,20], i=j=0. Remove(14,16): [10,20]→[10,14,16,20], i=j=1. Queries [10,14), [13,15), [16,17) report respectively (a,b)=(1,1),(1,2),(3,3), results true,false,true; before/after coverage identical on queries. Cumulative history retains every call. | Each frame represents a completed public method, not one binary-search iteration. The slice and replacement visibly explain the coverage change; query results are distinct from stored coverage. |
| 03: Does a bridge remove switches? | Reset, select Touch and bridge; apply all five calls. Predict [3,7) false before filling and true after. | Adds [2,4),[6,8) produce [2,4,6,8]; query false with a=1,b=3. Add [4,6) deletes slice [1:3]=[4,6], inserts [], giving [2,8]; query true with a=b=1. | A filled gap makes its old exit/entry redundant. Both query endpoints being covered is insufficient before filling. |
| 03: Can history rewind? | Undo final Official query, then reset; change preset. | Undo shows 4/5 calls and the previous false query; reset displays empty arrays and no history; changing sequence starts empty. | History represents actual chosen operations; rewind restores the earlier frame. Forward replay/state fidelity will receive additional audit. |
| 04: Can I transfer the rule? | Before reveal predict C: [3,5)∪[6,11), query [6,11) true; [5,6) remains absent. Select C and check. | Correct-prediction explanation gives [3,5,9,11]→[3,5,6,11], i=2,j=3, a=b=3. Explains why A fills a missing cell and B wrongly retains the touching boundary. | A partial refill does not restore the whole original interval; touching covered ranges coalesce. |
| 05: How does a switch become Python and what costs remain? | Read visible mapping and cost prose. | Concrete self.points[1:1]=[4,6] cut; bisect_left/right definitions; O(k) update, O(log(k+1)) query, O(k) storage, O(q²) total worst case. | Binary search avoids scanning coordinates, but list shifts still cost linear endpoint work. The visualization is explicitly a simulation, not Python execution or submission evidence. |

Cold screenshots: `715-evidence/715-review-1-f5c8d0e4/cold-official.png`, `cold-prediction.png`. Their visual inspection follows below.

Fresh independently chosen code-check predictions, recorded before opening source or executing: start empty; add [1,7), remove [3,5), add [4,5) → endpoints [1,3,4,7]. Query [2,6) must be false despite 2 and 6 both being covered; query [4,7) true; query [3,4) false. Remove [7,9) should preserve the state; add [3,4) should merge everything into [1,7); removing [1,7) should empty it. This is a **code check**, since the lab offers presets only. Invariant: sorted distinct endpoints paired into disjoint, non-touching half-open covered intervals. Tempting wrong rule excluded: check just the endpoints.

## Post-cold audit

### Identity, official contract and source

`git rev-parse HEAD` returned the candidate revision above. `git status --short` showed only this review report and its new evidence directory. Browser HTTP bodies of all seven lesson HTML/CSS/JS/Python assets and the shared `common.js` / `style.css` matched checkout bytes exactly. No candidate file was edited.

Read the [official statement](https://leetcode.com/problems/range-module/) through normal web access: real-number half-open coverage; constructor, union/add, universal query, difference/remove; bounds 1 ≤ left < right ≤ 10⁹ and at most 10⁴ total calls. The official example returns true/false/true. Lesson prose and actual callable semantics agree. Python is the preferred faithful implementation, with `RangeModule`, instance-owned `points`, exact method names and arguments, None-returning updates and boolean queries. Saved lesson-local `provenance/official.json` includes the corresponding Python3 class template. No non-Python exception or conceptual-only submission is used, so a non-Python `language-contract.json` / supportedLanguages audit is inapplicable.

Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python maps to `solution.py`, `python-code.js`, `PYTHON_SOURCE`. Reviewed the actual canonical Python, mirror, HTML, localization dictionary, renderer/core, shared locale consumer and styles. `bisect_left` counts strict-less boundaries and `bisect_right` counts less-or-equal boundaries. For updates, both indices come from the old list before in-place slice assignment. Replacement has at most two items; no caller arguments mutate. Queries leave the stored list unchanged. Each instance begins with its own empty list.

Correctness reconstruction: the state is even-length, strictly increasing, paired covered intervals with touching coverage merged. The update slice removes exactly the old switches on [left,right]. Inserting an edge iff outside and assigned inside states differ preserves outside coverage and introduces no interior switch. Query's odd `a` establishes covered left; `a == b` excludes all switches strictly inside the query. A switch at right is correctly excluded. Empty initialization, per-call preservation and shrinking binary searches establish the stated invariant and termination. No recursion mechanism applies.

Source transfer: independently reran inspected browser assertions using DOM `textContent`, not trimmed text. Decoded mirror, embedded string, displayed complete code, successful native clipboard readback and downloaded bytes equal canonical source including final newline. Forced clipboard API denial in each locale used a distinct non-source sentinel, focused/full-selected fallback textarea, actual Linux **Control+C**, then native clipboard readback. Both matched exactly. Keyboard Enter opens/closes the full-source disclosure. Narrow code is contained horizontally and the exact download remains available.

### Executable checks and test-claim audit

Inspected each test before running it. All generated results and screenshots were redirected using `OUTPUT_DIR` to this run's exclusive evidence directory; the candidate's tests/evidence assets were untouched. Commands were run from the repository root:

- `OUTPUT_DIR=<absolute exclusive evidence directory> python3 -B leetcode/715/tests/test_solution.py` — exit 0. Executes actual `solution.py`; exhaustive 32 unit-cell coverage states, every valid update/query on its small domain, intermediate invariant checks, 10,000 seeded sequential calls, 3,000 compressed large-coordinate calls and a separate maximum-call-count scenario. 41,800 reported oracle checks. The unit-cell and elementary-segment oracles do not repeat endpoint-parity logic.
- `OUTPUT_DIR=<absolute exclusive evidence directory> node leetcode/715/tests/test_core.cjs` — exit 0; 10,025 frames against elementary-segment coverage, including all five presets. These validate the teaching simulation separately from Python.
- `OUTPUT_DIR=<absolute exclusive evidence directory> node leetcode/715/tests/browser.cjs` — exit 0; 362 state checks, 25 screenshots, source transfers, both locales and state controls, no browser/page/HTTP errors. Chromium 156.0.8078.4 on Linux. Result files retain their original “author self-check” schema labels; these are independently rerun supplied harnesses, not a claim that test counts establish teaching quality.
- `OUTPUT_DIR=<absolute exclusive evidence directory> node leetcode/715/tests/focus-and-disabled.cjs` — exit 0; disabled endpoints, actual Tab/Shift+Tab forced-colors focus and 736×390 landscape.
- **`python3 -B scripts/register_leetcode_lesson.py 715 --validate-only` — exit 0, no stdout.** Metadata complexity is exactly one nonempty string: `O(k) time per update, O(log(k+1)) per query; O(k) space for k endpoints`. No registration or repair ran.

Independent additional checks executed canonical source directly with Python `exec(compile(...))`, with bytecode disabled. Every fresh prediction saved above matched: []→[1,7]→[1,3,5,7]→[1,3,4,7]; queries false/true/false, outside removal unchanged, bridge gives [1,7], full removal gives []. This is code evidence, not custom-input UI evidence. Also enumerated all 64 coverage states on nonuniform coordinates `[1,2,4,9,17,999999999,1000000000]`, each valid add/remove and all queries after each transition: **56,448 independent query checks**, exact expected endpoints after every update, and query nonmutation all passed. Expected coverage came from boolean elementary spans rather than binary search/parity.

Preset promises independently checked via those elementary-span oracles and rendered intermediate/final states: Official retains [10,14)∪[16,20), true/false/true; Touch and bridge changes gap query false→true and ends [2,8); Repeated & nested ends [2,9), query true; Empty & erased ends empty, both queries false; Billion boundary retains [999999995,999999997)∪[999999999,1000000000), right-edge query true and gap-crossing query false. Readouts consistently count completed calls and current endpoints, not search iterations or accumulated work.

Cost claim is correct for the canonical list implementation: searches O(log(k+1)); slice deletion/movement can cost O(k); update worst-case O(k), query O(log(k+1)), retained and transient storage O(k), with k ≤ 2q and O(q²) total worst-case time. This does not imply balanced-tree update costs or judge acceptance. The set baseline's width dependence and the integer-cell representation of continuous ranges are explicitly explained.

### Rendered states, bilingual meaning and access

The rendered-state supplement was read only after the saved cold walk. All presets were stepped at 320/390/736/1440 px in both locales, including initial, dense middle, terminal, undo/forward, reset and jump-to-end. Before/after arrays and history matched the same completed-call frame. Buttons disable at endpoints; rewinding/replaying reproduces state. Changing a preset restarts its lab; it does not change the independent prediction exercise. Locale roundtrips preserve preset/frame, selected answer, reveal status and probe.

Representative semantic bindings checked beyond dictionary existence: Chinese bridge frame 4 visibly says `i = 1（< 4），j = 3（≤ 6）`, deletes `points[1:3] = [4,6]`, inserts `[]`, with resulting `[2,8]`; English displays the same counts and replacement. The Chinese formula renders complete `a = bisect_right(points,left)；b = bisect_left(points,right)；答案 = (a == b 且 a % 2 == 1)`, with equivalent English operands. Both locales' gap frame uses a=1,b=3 and false; probe 5.5 explains real coverage, while probe 6 explains the excluded removal edge. Both prediction feedback versions explain the exact same [3,5,6,11] result and reject both wrong alternatives. Choosing a different answer hides previous feedback; reset clears selection/reveal; a locale roundtrip retains the selected/revealed meaning. Localization JSON duplicate-key detection occurs before parsing overwrites keys, and all 97 values satisfy the consumer's two-string-pair contract. No mismatched algorithm-state/fallback-message binding observed.

Inspected screenshots from this run: cold official/prediction; en/zh 320 cut and billion diagrams; en 390 cut, zh 390 hand/prediction; en 1440 cut and zh 1440 hand; both 200% zoom views; fallback and full-source disclosure. Long billion endpoints wrap at commas into readable arrays without losing association with their before/after headings; chips remain readable. Single-column narrow diagrams preserve the same shared coordinate scale and explicit numeric range labels. Cyan bands encode coverage, filled/hollow dots encode inclusion; orange probe borders and cyan current-history text are control/history emphasis, not extra coverage.

Additionally captured and inspected `en-320-long-selected.png` and `zh-320-long-selected.png`: closed labels “Repeated & nested” and “空状态与清空” are complete. Measured English longest label ~142.70px and Chinese longest ~96.00px versus 206px available after padding and this runner's conservative 24px arrow allowance. Stack: `16px "PingFang SC", "Microsoft YaHei", system-ui, sans-serif`; exact resolved font is not asserted. Measurements establish this Linux browser environment, not every OS font installation.

At 320px controls reflow, navigation has contained horizontal scrolling, and diagrams stack. No page-wide horizontal overflow was found at tested widths or 200% CSS zoom. Sticky navigation visible at the top of tall element screenshots is a capture/scroll-position overlay: ordinary settled deep-link navigation put the section at y=95.875 below nav bottom y=70. It does not establish a label/value collision. The 200% screenshots show reflow and readable state prose; zoom is CSS zoom at 1280px, not physical-device or browser-chrome zoom evidence.

Keyboard Enter/Space advances, Tab moves between controls, disclosure toggles, and native fallback copying works. Focus remains on the locale control after switching. Forced colors retains a solid 3px focus outline. Interactive controls measured at least 48px high. Disabled controls use full opacity, dashed borders and readable muted text; measured disabled foreground/background contrast is 6.45:1, measured sampled text pairs all ≥4.5:1 and focus pairs ≥3:1. Offline `file://` source availability, blocked localStorage, related internal anchors and deep links also passed supplied browser checks. These do not constitute screen-reader or real-device user testing.

### Findings and prior-review closure

No earlier 715 review report was present when searched after the cold walk; no earlier required IDs were closed by assumption. **Required open IDs: none.** No algorithm, core interaction, source-transfer, bilingual or essential readability defect was observed.

Optional observation `715-R1-O1` (low, open suggestion, not a required fix): step 02 presents the baseline, boundary invariant, query proof and four update parity cases in a long prose sequence before the operation lab. Reproduction: candidate revision above, English/Chinese, desktop or 320px, read step 02 top to bottom. Expected improvement: a compact intermediate worked-count table could reduce rereading. Actual: the concrete cut and bridge values and causal outside-state explanation are present and reconstructable, but require careful rereading. This is pacing friction, not an absent causal bridge or violated mandatory requirement. Owner/next action: optional author improvement in a future revision; no fix revision or closure claimed.

### Scores and conclusion

| Dimension | Weight | Score 0–4 | Observation/rationale |
| --- | ---: | ---: | --- |
| Problem/terms/hand calculation | 15 | 4 | Real coverage, exact methods, half-open endpoints, bounds and tiny cut precede abstraction; probes and manual outcomes agree. |
| Derivation/saved work | 20 | 3 | Width-cost baseline leads to boundary compression, query exclusion and outside-state parity rules. All bridges reconstructable; long step 02 prose creates minor pacing friction (O1). |
| Correctness/state | 20 | 4 | Explicit alternating invariant, preserved outside coverage, boundary-inclusive searches and query nonmutation agree with independent exhaustive cases and visible transitions. |
| Interaction/visual meaning | 20 | 4 | Predictions, visible slices and before/after coverage, retained history, rewind/reset/endpoints and change-after-reveal operate consistently. |
| Python/cost | 15 | 4 | Actual canonical class executed; fresh counterexample, exact source transfer, mutation and list movement costs verified. |
| Bilingual/device | 10 | 4 | Equivalent formulas/feedback, preserved state, readable narrow arrays/selected labels, keyboard/fallback and contrast checks observed. |

**Weighted total: 95/100. Outcome: accepted for the identified candidate and reviewed scope.** Every dimension ≥3, no required open finding, metadata gate passes, and browser/source/executable evidence is complete for this review. This is independent reconstruction, not evidence of real novice comprehension, a successful LeetCode submission, publication authorization or production deployment. Limitations: local Chromium/Linux preview; CSS 200% zoom; no real device, OS/font matrix or assistive-technology user study. No identity/model claim beyond this review run.

Evidence directory: `specs/reviews/715-evidence/715-review-1-f5c8d0e4/`. Result JSON files and screenshots belong exclusively to this run; earlier evidence was not regenerated.

### Candidate asset receipt

HTTP response bodies matched these checkout SHA-256 hashes during this review:

| Asset | SHA-256 |
| --- | --- |

| `leetcode/715/index.html` | `4b01eecffb5a41f68dfc14d0ea1ca6a984bce79f856195eb4abd467c4ac40335` |
| `leetcode/715/style.css` | `4e74e2b14b9cc47da2ce3b68fca5765c26b99d9c9b1e4a561cc064ebab64d9d2` |
| `leetcode/715/app.js` | `357e742bb5e52222bd64786c0af76f3e998997d55275ebcefa10f47f898324f3` |
| `leetcode/715/core.js` | `6c8d2b8c3126902311890a6f030893dd52d9bb2bd4bab02aa1b4dd1e38cb3da3` |
| `leetcode/715/copy.js` | `051e41b7195537c22d71047d06c60bdfc920e5b8e115e30655d47491d2550b26` |
| `leetcode/715/python-code.js` | `5d862cf5a44dd659b6e7d547b18ecba5cdd2def4a4ff33c6c0976b980f64c98e` |
| `leetcode/715/solution.py` | `bb10d430c7b6f4bf1ab382414e5fe7abd72093bf55d10920071049201ce2838e` |
| `leetcode/715/../common.js` | `f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b` |
| `leetcode/715/../style.css` | `6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27` |
