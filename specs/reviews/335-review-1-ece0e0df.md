# Independent review: 335 Self Crossing

Candidate: `f0be3f827263a60b0a0cff8ebc34cc71c15f1007`. URL: http://127.0.0.1:18770/leetcode/335/. Date: 2026-10-25. Reviewer: independent review run; exact model identity unavailable. Target: basic Python/lists/loops/functions/elementary recursion. Frozen dimensions interpreted as problem/terms, geometric derivation, simple-prefix invariant, meaningful interaction, executable Python/cost, bilingual/device access; weights 15/20/20/20/15/10.

## Cold walkthrough (saved before source or previous reviews)

Only the frozen rubric was read before opening the real Chromium browser. Screenshots: `335-evidence/335-review-1-ece0e0df/cold-desktop.png` and `cold-c.png`. Initial locale English, viewport 1280×900. Read all five steps in rendered page order.

| Step / question | Action | Observable result | My causal paraphrase |
| --- | --- | --- | --- |
| 1: What counts as crossing? | Read the worked [2,1,1,2] endpoints; predict fourth move hits segment 0 at (0,1). Draw four moves individually. | Coordinates progress (0,2), (-1,2), (-1,1), (1,1). At i=3, A displays `2≥1 ∧ 1≤2`, true; segment 0 is identified as contacted. | A crossing concerns closed nonadjacent segments, including touching/overlap; adjacent ordinary corners are excluded. Positive lengths and left turns fix orientations. |
| 2: Why only three comparisons? | Read baseline and rotated coordinate derivation; manually reconstruct vertical line x=d and y-span [e-c,e]. Read B/C examples before using lab. | A requires f≥d and e≤c; B aligns e=c and requires f+b≥d; C brackets x=d-b in [0,f] and 0 in [e-c,e-c+a]. Simple-prefix and boundary-barrier discussion excludes older sides. | Each condition is a coordinate inclusion; constant comparisons replace quadratic segment-pair enumeration. Safety is claimed only before the first collision, so immediate return matters. Expansion then inward movement gives the barrier argument; this paragraph is denser than the tiny examples but understandable with them. |
| 3: Which length changes a comparison? | Run every preset to first crossing/end. Rewind A from 4 to 3 moves, then forward. Change final length on the seven-move preset to 2. | A 3/0; outward false; B 4/0; C 5/0; shortest false; official third example stops at 4/5 moves with A 3/0; seven moves false. Rewind removes only last move and restores unavailable tests; forward restores contact. Length change restarts at origin with updated input. | Completed coordinates are data, cyan current/orange dashed contacted segment are annotations. Early stop avoids claiming later prefixes remain simple. Preset/input changes start a new experiment. |
| 4: Can I transfer to a new case? | Before reveal, predict [1,1,3,2,2,1] endpoints (0,1),(-1,1),(-1,-2),(1,-2),(1,0),(0,0), hence C 5/0. Choose C and reveal. | Correct prediction; reveal gives those coordinates and four C inequalities, explains A fails and equality counts. | Missing i−3 is insufficient: the inward segment can reach i−5. Counterexample [1,1,2,1,1] was predicted B 4/0 before selecting its preset; observed A false/B true. |
| 5: How does geometry become Python? | Open complete solution and map A lab transition to indexed code. Read cost and guards. | At i=3, x[3]=2≥x[1]=1 and x[2]=1≤x[0]=2 returns True. B guarded i≥4; C i≥5. x aliases input; no assignment into it. | Per-index fixed work and early return maintain a simple earlier prefix; fewer than four moves returns False. O(n) time/O(1) extra submission space differs from browser snapshot storage. |

Fresh independently selected arrays, predictions recorded before source/execution: `[2,2,3,2,1]` should touch at 4/0 (B); `[2,2,3,2,2]` should overlap at 4/0 (B); `[2,3,4,5]` should be false. UI has only presets/final-length selector, so these will be **code checks**, not custom-input UI experiments. First fresh endpoints are (0,2),(-2,2),(-2,-1),(0,-1),(0,0), confirming endpoint contact by hand. The overlap variant ends at (0,1). False case ends at (2,-2), with its last horizontal segment below segment 0.

Cold limitation: one automation call attempted to click an already-disabled endpoint button and timed out; subsequent separate browser run completed all presets. This is an automation mistake, not a lesson failure. No source, BRIEF, author test output, or earlier report supplied any of the above explanations.

## Source and interaction audit

HEAD equals the specified candidate. HTTP bytes matched checkout bytes for index.html, app.js, copy.js, core.js, local.css, python-code.js, solution.py, ../common.js and ../style.css. Relevant SHA-256 identifiers:

- index.html: `961e617af18f1049025b2695bab1fc997657a4815e71edac81a070bed9e22dac`
- app.js: `bf7eade2ac03b5796da095dee6f5533daf9474cca067ba75cc8a357ace309834`
- copy.js: `883f4af1ccc6d0454a27d9d9af127021ad0941aad611fea9c5f92ac3ac50af25`
- core.js: `d4029628ebcd4bae05b1ef7695756f16c54b0979ffd6c9f6a1b1884c1cf9e431`
- solution.py: `01b65441fd9ff807f84c8a36283fde21edd810223c603fe432902fda7cc95a60`
- python-code.js: `3989a01616b9a46872cf3f37779bc2c76cda7e2af09e4071d7401a02a4bb045e`
- local.css: `bdba825949edf895b5da9407b9267037ab1df4c629c9fc0a44bafce9433acda3`
- common.js: `f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b`
- style.css: `6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27`

Read the [official statement](https://leetcode.com/problems/self-crossing/) normally after the cold report was saved. Its three examples, counterclockwise directions, units, boolean output, and constraints match the lesson. Inspected lesson-local `provenance/official.json`: Python3 snippet is `Solution.isSelfCrossing(self, distance: list[int]) -> bool`, matching the canonical solution. Python is preferred and faithful; non-Python contract verification is inapplicable. Read `LANGUAGE_FILES` in the registration script: Python maps to solution.py / python-code.js / PYTHON_SOURCE. No conceptual analogy is advertised as a submission.

Ran from repository root: `python3 -B scripts/register_leetcode_lesson.py 335 --validate-only`. Exit **0**, no stdout. lesson-entry.json complexity is the single nonempty string `O(n) time; O(1) auxiliary space`.

### Executable checks and claims

Inspected check.py, core.cjs, browser.cjs and visual.cjs before running them. All accept redirected output; no registration or candidate regeneration was run. Executed:

- `OUTPUT_DIR="$PWD/specs/reviews/335-evidence/335-review-1-ece0e0df" python3 -B leetcode/335/tests/check.py`
- `OUTPUT_DIR="$PWD/specs/reviews/335-evidence/335-review-1-ece0e0df" node leetcode/335/tests/browser.cjs`
- `OUTPUT_DIR="$PWD/specs/reviews/335-evidence/335-review-1-ece0e0df" node leetcode/335/tests/visual.cjs`

All exited 0. These scripts retain their authored “author self-check” output labels; this report records an independent rerun, not a new author identity. Numeric results: 34,531 cases, lengths 1..9 over {1,2,3}, 5,000 seeded cases, maximum size, all offsets 3/4/5, unchanged input, exact offline mirror, independent-coordinate comparison. core.cjs additionally checks every frame’s coordinates, snapshot independence and first-event timing. Inspected the baseline’s box/orientation calculation: it does not duplicate A/B/C, handles collinear contacts and excludes only the adjacent segment.

Separately executed the actual canonical solution via Python `exec` of solution.py, against a newly written axis-aligned coordinate-box oracle, rather than the lesson trace. For axis-aligned segments overlapping both coordinate intervals is exactly intersection; positive lengths avoid degenerate stationary moves. Exhausted lengths 1..7 over {1,2,3,4} plus 2,000 seed-925335 arrays of lengths 4..30 over {1..8}: **23,844 cases**, all agreement and no mutation. For each first hit i, the prefix before i returned false and the prefix including i returned true. Independently selected predicted cases returned:

| Input (code check) | Expected / actual | Independent pair |
| --- | --- | --- |
| [2,2,3,2,1] | true / true; endpoint touch | 4/0 |
| [2,2,3,2,2] | true / true; overlap | 4/0 |
| [2,3,4,5] | false / false | none |
| [2,2,3,2,3] | true / true; longer overlap | 4/0 |
| [1], [1,1], [1,1,1] | false / false | none |
| [1,1,1,1] | true / true; closed return to origin | 3/0 |
| [100000,100000,100000,100000] | true / true | 3/0 |
| [1,2,...,100000] | false / false; expanding spiral | none |

Source inspection confirms guards precede negative-index dependencies, three bounded comparisons per loop, no coordinate allocation, no input mutation, and early termination on first detection. A index-to-visual mapping is in the coldwalk. B at i=4 on fresh input uses x[3]=x[1]=2 and x[4]+x[0]=1+2≥x[2]=3. The invariant excludes prior crossings; this is essential to completeness of the local comparison set. Both derivation and code use inclusive boundaries.

### Interaction, localization and access

Chromium used NODE_PATH-installed Playwright and `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Browser rerun exercised 84 locale/preset/final-length combinations (2×7×6), individual next moves, exact previous/next round trips, reset, jump-to-end, and disabled endpoints. No page errors, asset errors, or external lesson requests were observed. Locale switches preserved frame, selected prediction, reveal and open source disclosure. Storage-denied startup still supported the trace and language switch. Browser trace is explicitly labeled simulation, and actual Python was executed separately above.

Independently repeated the outward preset with final length 1 then 2 in both languages. Before: A `1≥2 ∧ 3≤1`, no match; after restarting and advancing: `2≥2 ∧ 3≤1`, still no match. This correctly shows that flipping one inequality does not satisfy a conjunction. Wrong exercise choice revealed the same coordinate reasoning with corrective feedback; changing the choice hid the answer; clearing disabled reveal. Named A/B/C contact text, numeric formulas and table roles agree in both languages. Chinese `不成立` corresponds to “does not match”; `相交旧段` identifies the old contact rather than the current move. At C i=5, both locales show old segment 0, A/B false and C true. Read both copy arrays: invariant, geometric spans, counterexample, boundary proof, Python mapping and costs preserve the same reasoning. Duplicate-key check covered the single root lookup namespace, including multiple keys on one line; zero duplicate keys. Shared locale utility derives zh/en dictionaries from that namespace and parameter substitutions agree with rendered state.

Exact parity passed between canonical bytes, window.PYTHON_SOURCE, displayed #pythonCode, real clipboard text, downloaded solution.py, and selected readonly manual-copy fallback. Clipboard rejection in each locale opens the full source, focuses/selects it, and gives appropriate translated manual-copy guidance; this is distinct from wrong-prediction feedback. Python source stayed available when solution.py network requests were blocked because the offline mirror supplies it. Canonical solution was executed, not merely copied or traced.

Desktop 1280 coldwalk and 1440 rerun; 320/390/736 widths in both locales; CSS `zoom=2` at all four rerun widths. No page-wide overflow. Inspected new screenshots, including cold-desktop, plot-A-en, plot-C-en, coordinates-C-en, trace-en-320, trace-zh-320, trace-zh-390, zoom200-en, zoom200-zh, keyboard-focus, forced-plot, independent-seven-en-320 and independent-conditions-en-320-200. Current and contacted line identities, individual indices, formulas and exact coordinate table remained readable. Seven-move dense plot keeps segment labels distinguishable. Narrow 200% conditions wrap vertically; plot has intentional local horizontal scrolling with the coordinate table as an equivalent exact representation. Focusing the plot and pressing ArrowRight moved scrollLeft above 0 after the browser scroll settled (3 px at the sampled instant; 98 px frame, 240 px content). Immediate pre-settle sampling initially returned 0; this was rechecked after waiting for actual movement.

Keyboard checks covered Enter for move/reset, Tab/Shift+Tab focus, radio ArrowDown, 3 px visible focus outline, and section-navigation targets clear of the sticky navigation. Buttons are at least 48 px tall. Disabled Previous text contrast measured 6.45:1, body 16.09:1, muted text 7.74:1, readout 13.40:1, primary text 13.10:1, correct-feedback text 10.00:1. Forced-color plot preserves solid/dashed distinction and coordinate labels. These measured pairs and screenshot inspection supplement, rather than replace, causal teaching assessment.

Screenshot artifacts are all under this run’s exclusive evidence directory. Tall element captures can include a sticky-navigation band partway through a stitched image; ordinary viewport captures were also inspected, so this capture artifact is not reported as text clipping. No observed label/value intersection requires a collision finding.

### Findings and earlier closure

No earlier review report for problem 335 was present in specs/reviews when searched after saving the coldwalk. There are no inherited required IDs to close, and no required open finding in this candidate.

Optional **335-O1** (low, open; owner: lesson author): section 2’s boundary-barrier paragraph is significantly denser than the preceding hand calculation. Reproduce in either locale at desktop by reading from the B/C tiny examples through “Why not an even older line?” Expected ideal: expansion/inward/older-side exclusion can be followed as gradually as the coordinate tests. Actual: the bridge is present and reconstructable but needs rereading and a mental drawing. A labeled normalized diagram or staged expansion-to-inward example would reduce friction. This is a pedagogical refinement, not a missing proof bridge; no fix revision or regression evidence applies.

Optional **335-O2** (low, open; owner: lesson author): section 3’s available final lengths do not change the final boolean for any preset. Reproduce each preset over final lengths 1..6 (both locales; 320/390/desktop): A/B/C stay true, outward/shortest/seven stay false, and official example 3 already stops before the final move. Individual inequalities do flip, as independently observed for outward length 1→2, so the stated inequality task works. A preset with a true/false contact threshold would broaden exploration. No required behavior is broken; no fix revision or regression evidence applies.

## Scores and conclusion

| Dimension | Weight | Score / 4 | Observation-based rationale |
| --- | --- | --- | --- |
| Problem, terms, hand calculation | 15 | 4 | Input/output, meters, axes, left turns, zero-based segments and closed contacts are explicit; the four-move tiny example is calculated before abstraction. |
| Causal derivation and saved work | 20 | 3 | Quadratic pair work and replacement by three local spans are explained; B/C counterexamples reject insufficient rules. The older-boundary argument is reconstructable with rereading (335-O1). |
| Maintained state and correctness | 20 | 4 | Simple-prefix invariant, excluded neighboring segments, guards, inclusive contacts, immediate return and termination agree with visible transitions and canonical execution. |
| Interaction and visual meaning | 20 | 3 | Prediction/reveal/change, exact coordinates, retained history and distinct current/contact annotation work. Final-length experiments flip component comparisons but lack a final-result threshold (335-O2). |
| Python and cost | 15 | 4 | Faithful callable, explicit alias/no-mutation statement, actual source execution, fresh cases, exact source parity and correct submission versus simulation storage distinction. |
| Bilingual and device access | 10 | 4 | Equivalent reasoning and representative semantic bindings; readable narrow/dense states, keyboard operation, local scrolling, contrast, fallback and state preservation observed. |

Weighted score: **90/100**. Every dimension is at least 3. **Accepted** for this candidate and reviewed scope; required open IDs: **none**. Optional refinements do not block acceptance.

Limitations: this is an independent technical/teaching reconstruction, not measured novice comprehension. No LeetCode submission was attempted or claimed. Official live statement was read; Python signature was cross-checked against lesson-local saved official response, rather than independently extracting a live editor selector. Zoom evidence uses CSS layout zoom at 200%, not operating-system magnification or browser UI zoom. Automated checks and screenshots support the observations but do not establish human learning outcomes. Acceptance is separate from publication; no publication action was performed. Only this report and this run’s evidence directory were written; implementation, tests, services and prior evidence were left unchanged.

