# Independent review: First Missing Positive (#41)

Candidate: `6893c023668cd819ce39ffcfc6fddf379e39fec7`. URL: http://127.0.0.1:18770/leetcode/41/. Review run: `41-review-2-cd5a4ebc`; exact reviewer/model identity unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen rubric read first; weights 15/20/20/20/15/10; canonical Python interpretation. No brief, source, tests, author notes, or previous reviews read before this browser walk.

## Cold walkthrough (recorded before source audit)

Real Chromium via Playwright, 1280×900. Initial full-page capture: `41-evidence/41-review-2-cd5a4ebc/cold-initial.png`.

1. **Question:** What input/output and constraints apply? **Action:** Read section 01. **Observation:** Unsorted signed integers, positive starts at 1, return smallest absent positive; input may be rearranged; n=1…100000, signed 32-bit. Hand example [3,4,-1,1] returns 2. **Conclusion:** Ignore nonpositive integers; answer is a value, not an index or minimum array member.
2. **Question:** What baseline work can be saved? **Action:** Read baseline and section 02, manually swap [2,1]. **Observation:** Set membership costs expected linear time and linear storage. Swapping 2 into index 1 yields [1,2], answer 3. n entries cannot cover n+1 candidates. **Conclusion:** Existing array positions encode presence for 1…n, removing the set's extra storage; x maps to x−1.
3. **Question:** Why do swaps terminate and excluded values cause no harm? **Action:** Read guards and permanent-slot explanation. **Observation:** Only 1≤x≤n with a different destination value can swap; incoming value must be rechecked. A correct slot cannot be displaced; extra copies add no new destination. **Conclusion:** Every useful swap fills a permanent slot, bounding total swaps by n; skipping a duplicate prevents cycling.
4. **Question:** What do the visual rows and operation markers mean? **Action:** Inspect initial experiment. **Observation:** Upper [3,4,-1,1], lower [1,2,3,4], indices 0…3. op_i and swap_to initially ∅; prose explicitly distinguishes markers from saved Python target. **Conclusion:** Lower row is the goal, highlighting identifies the current operation rather than changing the data by itself.

Predictions written before operating/reveal: default first swap should produce [-1,4,3,1] (3 belongs at index 2); next skip -1 at i=0 should leave data unchanged. Quiz [2,2,1]: first 2 must not swap with identical 2; moving 1 later produces [1,2,2], answer 3. Independently selected [2,3,1] should finish [1,2,3], answer 4; counterexample [1,1] defeats 'always swap every in-range value' because identical-value swaps never progress, answer 2. UI offers presets only: these two independent inputs will be labeled code checks, not UI experiments.

5. **Question:** Does the predicted transition happen? **Action:** Execute next twice. **Observation:** Frame 1 [-1,4,3,1], op_i=0, swap_to=2; frame 2 unchanged, op_i=0, swap_to=∅. **Conclusion:** Placement is a swap, then guard rejection, not automatic index advance after one swap. Python target remains 2 despite the absent operation marker.
6. **Question:** Must an incoming valid value be processed? **Action:** Advance through frames 3–4. **Observation:** [-1,1,3,4] then [1,-1,3,4], both op_i=1; destinations 3 then 0. **Conclusion:** The same loop position can perform multiple swaps, placing 4 and then incoming 1.
7. **Question:** How does completion identify the answer? **Action:** Advance frames 5–8. **Observation:** Data stays [1,-1,3,4]; skips at i=1,2,3, then both markers ∅ and final result 2. **Conclusion:** A first mismatched slot at index 1 witnesses missing value 2; already-correct slots require no swap.
8. **Question:** Does the duplicate guard transfer? **Action:** Choose quiz 'Do not swap; 3 is missing', then reveal. **Observation:** Correct reasoning feedback says target already contains 2, then 1 moves to slot 0 and third slot lacks 3. **Conclusion:** Presence, not multiplicity, determines the result; a duplicate must not trigger endless swaps.
9. **Question:** Can operation history be revisited? **Action:** Rewind endpoint once, restart. **Observation:** Position 8→7→0 with original data restored. **Conclusion:** Controls navigate retained frames and restore the initial experiment.
10. **Question:** How does the diagram become executable code/cost? **Action:** Read section 05 and complete rendered Python. **Observation:** Guard precedes saved target and tuple swap; final enumerate scan returns i+1 or n+1. Text explains negative indices, mutated input, total rather than per-index swap bound. **Conclusion:** Frame 1 maps to target=3−1=2 and simultaneous swap of indices 0/2. At most n placements plus n guard exits and a linear scan give O(n) time, constant auxiliary variables.
11. **Question:** Does Chinese preserve the explanation and experiment? **Action:** Switch to 中 after reset and quiz reveal. **Observation:** Same hand swap, guard, permanent-slot argument, target-vs-marker warning, constraints and revealed quiz reasoning in Chinese; event remains 0, quiz remains revealed. **Conclusion:** Translation carries the causal content and retains state.

Cold walkthrough saved before opening source. Screenshot inspected: current/expected rows are distinct; state and operation markers visibly labeled; detailed device inspection follows. Initial text extraction raced code rendering; subsequent settled browser pre elements contained complete Python, not missing code. Minor friction: generic skip message combines out-of-range and duplicate/correct-slot reasons, requiring the reader to use current values to distinguish them. No missing causal explanation was supplied by author materials.

## Post-cold source and official-statement audit

HEAD equals the specified candidate. `git diff --quiet 6893c023668cd819ce39ffcfc6fddf379e39fec7 -- leetcode scripts specs/leetcode-review-gates.md` succeeded at the end. Only this report and its exclusive screenshots are untracked. No registration, implementation edit, shared-file edit, test edit, service change, commit or publication occurred.

Read the [official statement](https://leetcode.com/problems/first-missing-positive/) normally after the coldwalk. Its missing-positive definition, O(n) time/O(1) auxiliary-space requirement, length 1…100000 and signed 32-bit bounds match the lesson. Python is a faithful original callable: `Solution.firstMissingPositive(self, nums: List[int]) -> int`, returning an integer and rearranging the caller's list. No non-Python canonical solution or conceptual analogy is advertised, so the non-Python language-contract/selector gate does not apply.

Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python names are `solution.py`, `python-code.js`, `PYTHON_SOURCE`. Audited those, `index.html`, `app.js`, `copy.js`, lesson-local CSS, shared `common.js`, `hard-first-ten/core.js`, `hard-first-ten/lesson.js`, and shared styles. The canonical implementation uses the guarded target assignment and tuple swap, not a growing set or trace snapshots. The browser makes a separate copied-array JavaScript model; its allocations are not claimed as Python's constant auxiliary space. `app.js` only renames display state to operation markers and filters inactive highlight indices. Shared recorder deep snapshots prevent rewinding from changing prior frames.

Served bytes independently matched local bytes for all 11 checked files: lesson HTML, app, copy, local style, Python mirror, canonical Python, shared common/style/core/lesson/style. Selected SHA-256 build identifiers:

| Asset | SHA-256 |
| --- | --- |
| 41/index.html | 1b10a05385a4b3962c0eaaa890287216d6308ea5994e2b76054535a2b8cfc0cd |
| 41/app.js | e825c2e01d5019e48af04b379274fbaf1203b1f73e7d8c52b90c1ca304f33d9c |
| 41/copy.js | 3ee8de0a474aab78c04df47ae1b5ba5ed19cd1c8e110b9921ec9dc64f9931460 |
| 41/style.css | 791040323b6545d98ce46105c6346ebc848643d63311563cf64870d67a639568 |
| 41/python-code.js | 3dd24b80d2a57d814e1beec5b3461b5be83bb26e8b341e56f8c028b3002105e4 |
| 41/solution.py | f7ca1a5e26b83ae2be3d7b498992a1eaa5eb8d98460b1b6db8bf2ebf12237d77 |
| hard-first-ten/core.js | 342d7cbdf8c1e6f8527e6804ec286157e8fc63513a3c36c61d67c496bd08eeed |
| hard-first-ten/lesson.js | 18365da600d3a774aec9afb96deb377fa269fe894424ed6cef41ad9f929c9731 |

### Executable checks and cost

Inspected all four lesson-local test files before running. The algorithm, trace and review regression scripts do not write candidate assets. The browser script normally writes author screenshots and browser.json; executed an in-memory adaptation with screenshots redirected to this review's exclusive directory and JSON results sent to stdout. No tracked script was rewritten. Its browser launch honors `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; Node resolved Playwright through the supplied NODE_PATH.

Commands/results:

- `python3 -B scripts/register_leetcode_lesson.py 41 --validate-only`: **exit 0**, empty stdout/stderr, independently repeated using subprocess to retain explicit exit status. `lesson-entry.json` complexity is the single nonempty string **"O(n) time; O(1) auxiliary space"**.
- `python3 -B leetcode/41/tests/algorithm-regression.py`: **56994 canonical Python cases passed**, exact offline mirror parity passed. Includes exhaustive lengths1…6 over {-2,0,1,2,3,7}, 1000 seeded random cases, singleton coverage within exhaustive cases, signed integer extremes and four length100000 cases. Checks independently computed membership answer, multiset preservation and final placement of every present in-range value.
- `node leetcode/41/tests/trace-regression.cjs`: **9330 trace cases passed**. Every frame preserves the multiset and previously fixed slots. Swap destinations use the previous value, and the after-array is exactly the previous array with those two positions exchanged. Renaming markers changes no array transitions, messages or focused operations.
- `node leetcode/41/tests/review-regression.cjs`: both locales passed marker semantics/legend and **8.17:1** highlighted-index contrast; no failures or page errors.
- Adapted browser script: **8 check groups**, eight locale/width layouts, zero page/network errors. See detailed observations below. The initial adaptation used a VM context and failed at deepStrictEqual on structurally equal objects from different JavaScript realms; this was a reviewer harness failure. Reran with an ordinary Function wrapper in the same realm; the complete suite passed. Initial partial captures remain preserved, while complete rerun captures have the `verified-` prefix.

Independent predictions and actual canonical execution (code checks, not custom UI experiments): [2,3,1]→[1,2,3], answer4; [1,1] unchanged, answer2. The independently chosen first input coincidentally matches the hidden Complete1…n preset, discovered after the coldwalk. Added a distinct fresh input after source access, writing its prediction before execution: **[3,1,1]→[1,1,3], answer2**; actual canonical execution matched. [0], [1], [2] returned1,2,1; [-2147483648,2147483647] returned1 without invalid indexing.

Independent `sys.settrace` execution of canonical Python confirmed that at the outer-loop line immediately after the first i=0 skip, data is [-1,4,3,1] and saved target remains2. This matches the new visible legend while swap_to is ∅. Frame1's visual transition maps directly to target=3−1=2 and tuple swapping indices0/2. Frame3→4 reuses i=1, first placing4 then incoming1; advancing i immediately after the first swap would lose this work.

The invariant is permanent placement of each processed valid value x at x−1. A swap cannot displace a different already-correct value because that destination would have to be correct for x itself; equality then prevents the swap. Invalid values are excluded before indexing, extra copies stop, and all present valid values finish at their destinations. Thus a mismatch implies the expected value is absent; no mismatch implies n+1. At most n swaps plus n outer-loop exits and the final scan give O(n) time. Actual canonical storage is a fixed number of scalar variables, O(1) auxiliary space, with input mutation disclosed. This argument, not assertion counts, establishes the cost interpretation.

### Browser, interaction, and accessibility observations

Both English and Chinese were exercised for all four presets. Endpoints returned2,3,1,4 for chain, duplicate, out-of-range and complete respectively, agreeing with hand membership calculations. Initial rewind disabled; first→rewind→first reproduced snapshots; slider endpoint disabled Next; rewind hid the result and Next restored it; Reset restored position0 and original data; preset changes restarted. Before-state disclosure showed the immediately preceding array; focused code reflected the swap or guard; history retained up to six events. Locale changes preserved experiment, position, chosen prediction and revealed status. Resizing retained the current experiment.

All three quiz choices in both locales produced distinct causal feedback. Changing a choice cleared stale feedback; reveal required an explicit action. The correct option explains why1 is later recovered; the equal-swap wrong option explains nontermination. This is transfer from the tiny distinct-value example to duplicate presence, not merely repeating its answer.

Keyboard checks: slider ArrowRight advances one frame; rewind Space and Next Enter work; disclosure Space toggles; radio ArrowRight selects the next answer; reveal Enter produces feedback. Keyboard Next has a visible orange3px outline (`keyboard-focus.png`). Disabled rewind at position0 has opacity0.4 and remains readable (`disabled-and-focus.png`); endpoint controls actually reject further movement. Active index foreground is rgb(232,237,244) on rgb(22,75,89), luminance ratio8.17:1 in current and previous rows across both locales/widths. Muted ordinary labels use the shared readable dark-theme token. Disabled text has lower contrast by design (approximately3.3:1 composited on the panel), distinguishable from enabled controls.

Exact source parity checked for canonical bytes, decoded offline mirror, displayed complete source, successful clipboard capture, denied-clipboard textarea, actual browser download and HTTP source body. Both locale fallback textareas were visible, focused and fully selected, containing every canonical byte. Complete source also matched when opened directly by file URL. Denied localStorage still allowed initialization, switching language and Next.

Layouts exercised at320,390,736,1440px in both locales; cold desktop was1280px. Opened before-state/code/history in dense event4 and inspected screenshot evidence, including `verified-{en,zh}-320-diagram.png`, `verified-en-390-diagram.png`, `verified-zh-1440-diagram.png`, `settled-{en,zh}-{320,390}-state.png`, and `settled-en-1440-state.png`. Current/expected rows and associated index labels remain distinct. No page-wide overflow; cells are at least33px. At320, labels span x31…112.33 and values x126.33…289; at390, labels x31…135.66 and values x149.66…359. No label/value intersection or essential-text clipping. Long shared identifiers op_i/swap_to fit. Code excerpts deliberately scroll horizontally rather than losing source text. Both languages retain equivalent causal reasoning, constraints, exclusion guards and cost/mutation explanation.

200% CSS zoom at1440px was exercised in both locales with Next/Previous still working, state preserved and no page overflow. Inspected `visible-en-200.png` and `visible-zh-200.png`: marker explanation, values and focused swap remain readable. This is CSS zoom/reflow, not native browser-toolbar zoom. Native toolbar zoom is outside this browser automation coverage and no native-zoom claim is made.

Some immediate Chinese captures omitted recently repainted marker glyphs despite present, visible DOM text; desktop scrollIntoView also placed some state under sticky navigation. These are insufficient collision evidence. Rechecked using explicit settled scroll and an800ms delay: `zh-skip-settled-delay.png` and `zh-state-detail.png` visibly show op_i=0 and swap_to=∅, with the full legend above. DOM computed visibility and text agree. Ordinary operation and delayed settled view do not reproduce missing state. Earlier imperfect captures are preserved, not substituted as proof of a lesson defect.

## Earlier required findings: closure against this candidate

Only after the coldwalk was saved did I read `specs/reviews/41-review-1-1c260097.md`. It reviewed candidate10a3b4f6fccfdc0f35bc6735bd75fe70024430e7 and left41-R1…R3 open. Its original record and evidence are unchanged. All following closure rechecks concern current candidate6893c023668cd819ce39ffcfc6fddf379e39fec7; no author claim alone closes a finding.

| Stable ID / original severity | Reproduction and expected/actual recheck | Regression evidence / status |
| --- | --- | --- |
| **41-R1**, high: absent metadata | Run validate-only from repository root. Expected valid metadata and scalar time/space string. Actual metadata exists, complexity is the required string, preflight exits0. | Explicit repeated preflight; fix present in current candidate; reviewer **closed**. Owner follow-up: none. |
| **41-R2**, medium: target sentinel misrepresents Python state | Both locales, chain, Reset→Next→Next at390px. Expected display marker distinguished from saved Python target. Actual op_i=0, swap_to=∅, legend says no applicable marker, target remains2; mapping repeats distinction. Endpoint markers are explained too. | Independent canonical sys.settrace retains2; review regression passes; `verified-en-skip-state.png`, `zh-skip-settled-delay.png`, `zh-state-detail.png`; reviewer **closed** at current candidate. Owner follow-up: none. |
| **41-R3**, medium: essential highlighted indices low contrast | Both locales, chain events1/4,320/390/desktop; expected readable essential index labels. Local CSS now sets active small text to body token; measured8.17:1, including previous-state active indices. | Both regression locales and eight layouts pass; inspected narrow active-cell screenshots; reviewer **closed** at current candidate. Owner follow-up: none. |

No new required finding. Optional **41-O1** (low, open, nonblocking): both locales, chain event2 and already-correct events6/7 use the same combined skip caption. A more specific caption naming the actual rejected condition would reduce inference effort. Expected improvement: '−1 is outside1…4' versus '3 is already in slot2'. Actual caption lists out-of-range and equal-destination reasons together, while the visible value, guard excerpt and surrounding explanation still allow reconstruction. Owner: lesson author, optional future revision; no fix revision requested. This is minor interaction friction, not a missing causal bridge.

## Scores, limitations and conclusion

| Dimension | Weight | Score /4 | Observed rationale |
| --- | --- | --- | --- |
| Problem/terms/hand calculation |15|4|Definition, constraints, positive-vs-index distinction and manually computed2 are explicit. |
| Derivation/saved work |20|4|Explained set membership/storage, two-cell hand swap before generalization, answer range, permanent placements, ignored cases and duplicate counterexample. |
| Maintained state/correctness |20|4|Canonical execution, intermediate swap/permutation/fixed-slot invariants, range guards, scan boundary and saved-target/marker distinction agree. |
| Interaction/visual meaning |20|3|Predictions, before/after, history, replay, reset and feedback work; generic skip captions leave minor friction (41-O1). |
| Python/cost |15|4|Faithful executable class, fresh canonical input, source parity, mutation and global linear-swap/constant-storage reasoning verified. |
| Bilingual/device |10|4|Equivalent reasoning, keyboard and fallback,320/390/desktop, settled state geometry, readable active indices and200% CSS reflow verified. |

Weighted score: **95/100** =15+20+20+15+15+10. **Accepted** for this candidate and review scope: every dimension≥3, no required open findings, browser/source/runtime/preflight evidence complete. Required open IDs: **none**. Publication is a separate decision.

Limitations: headless Chromium only;200% verification uses CSS zoom, not native toolbar zoom; no screen-reader audit, real novice comprehension study, LeetCode submission, production-delivery review or measured learning-effectiveness claim. No fabricated reviewer/model identity. Only this exact report and PNGs inside `specs/reviews/41-evidence/41-review-2-cd5a4ebc/` were written as review artifacts; previous evidence was preserved.
