# Independent review: 1092 Shortest Common Supersequence

Candidate: `3b35c3854f6b9346241e57c394619e19c4aa34d8`. URL: http://127.0.0.1:18770/leetcode/1092/. Review run: `1092-review-2-de6dcb3c`. No reviewer/model identity asserted. Target: basic Python, lists, loops, functions, elementary recursion. Frozen weights: 15/20/20/20/15/10. Canonical interpretation: faithful Python preferred. Publication is outside scope.

## Cold browser walkthrough (saved before source audit)

Only the frozen rubric was read before opening the candidate in Playwright Chromium. No BRIEF, source, tests, earlier review, or author evidence supplied these observations. Desktop viewport 1440×1000; initial English. Screenshots: `1092-evidence/1092-review-2-de6dcb3c/cold-initial.png` and `cold-complete.png`.

| Teaching step | Question | Action | Observable result | My causal paraphrase |
|---|---|---|---|---|
| 1: share a letter | What does the output contain, and why three letters? | Read subsequence definition, click Emit next letter three times | a → ab → abc; history retains each explanation; ab advances on b while ac waits for c | Sharing the initial a serves both ordered inputs; b and c are separately necessary, so three is attainable and a lower bound. acb also works. |
| 2: repeated questions | Why store suffix answers? | Read the rendered recursion explanation and greedy counterexample | Defines suffix and dp[i][j]; two orders b/c reach the empty pair; exponential recursive bound versus at most (m+1)(n+1) states; aab/baa greedy length 5 versus baab length 4 | Branching repeatedly asks about the same remaining positions. Current characters alone cannot determine the best mismatch choice; saved optimal remainder costs can. |
| 3: boundaries | What is known initially? | Inspect default ab/ac at event 0 | Last row 2,1,0 and last column 2,1,0; interior dots; no output | Once one input is exhausted, every remaining character of the other is necessary. Dots mean unknown, not zero. |
| 3: mismatch cells | Why these three new values? | Next events 1,2,3 | (1,1): 1+min(1,1)=2; (1,0): 1+min(2,2)=3; (0,1): 1+min(2,2)=3. Only the newly filled cell gains a star | Emitting either available first letter leaves a smaller suffix problem. Dependencies are completed before use; the smaller attainable remainder gives the optimum. |
| 3: match cell | Why share both a letters? | Next event 4 | (0,0): 1+dp[1][1]=3 | Both inputs can use the same first a, so pay once and advance both. The text explains that any earlier output before that a could be removed. |
| 3: phase boundary | Does filling already emit output? | Next event 5 | Complete table, start (0,0), no output; 0+3=3 | Computed costs guide a separate reconstruction; table values are lengths, not emitted text. |
| 3: reconstruction | How does each output choice retain optimality? | Next events 6,7,8 | a at (1,1): 1+2=3; b at (2,1): 2+1=3, down/right tie; c at (2,2): 3+0=3, str1 exhausted. Three path records retained | Each letter spends exactly one unit of the optimal remaining cost. At the empty pair the ordered inputs have both been consumed and output length equals the optimum. |
| 3: retained history | Is rewind a real earlier state? | Back once, then Complete | abc becomes ab, final c path entry disappears; complete restores abc and three entries | Output and path correspond to the current event, rather than highlighting a static final answer. |
| 4: transfer | Can I predict an unseen ordering case? | Before reveal predict length 4 for aba/bab: abab works; length 3 would have to equal both distinct inputs. Select “4 letters” and Check prediction | Correct prediction; reveal explains a + remaining bab costs 1+3 and rules out length 3 | This tests order and multiplicity, not distinct-character counting. |
| 5: code and limits | How does the mechanism become a string-returning Python method? | Read rendered prose (code disclosure still closed) | Maps equal a, tie b, trailing c to append/index changes; explains reverse range, independent rows, join, immutable inputs, full table costs and 1000² cells | Table fill avoids recomputation; retaining all cells enables reconstruction. Output list/join has linear cost beyond the table. |
| Bilingual read | Is the causal explanation equivalent? | Switch to 中 after the exercise | Chinese definitions, match/mismatch proof, invariant, cost, and correct exercise reasoning retain the same meaning; selected exercise and reveal remain | Locale changes presentation without invalidating the learner's answer. |

Fresh independent predictions recorded before code execution: `ba/ab` needs length 3 (bab or aba; length 2 cannot equal both). Counterexample `ab/b`: “always take str1 on mismatch” emits abb (3), while ab (2) already contains b; lower bound 2. UI is preset-only, so these will be **code checks**, not UI experiments. Visible transition to check against actual Python later: default (1,1), b/c mismatch with costs 1 and 1, should append b and increment only i.

Cold assessment: the hand example precedes suffix abstraction; suffix, prefixes, zero-based positions and invariant are explained. Both excluded and included first-letter cases have causal justification. Actual novice comprehension and successful LeetCode submission are not claimed.

## Post-cold audit and candidate identity

HEAD matched the requested revision before and after checks. All nine served runtime files (HTML, local/shared CSS, app, dictionary, core, mirror, canonical Python and common locale helper) matched checkout bytes; see `served-hashes.json` in this run's evidence directory. Only this report and its exclusive evidence directory were written. No candidate asset, previous evidence, service, registry, test or Git configuration was changed. The rendered-state supplement was read only after saving the cold walk.

The [official statement](https://leetcode.com/problems/shortest-common-supersequence/) was read normally through the web reader: return any shortest string containing both ordered inputs; lengths 1–1000, lowercase English letters. Both official examples agree with the lesson. No access bypass or online submission was performed. The saved official Python3 snippet has exactly the canonical `class Solution.shortestCommonSupersequence(self, str1: str, str2: str) -> str` interface. I inspected that lesson-local provenance after the cold walk; I did not operate the live official editor selector. Python is faithful and preferred, so a non-Python language-contract audit is inapplicable. This is actual string-returning Python, not a conceptual analogy.

`LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py` specifies `solution.py`, `python-code.js`, and `PYTHON_SOURCE`. The solution uses separately allocated rows, suffix-length boundaries, reverse interior traversal, and a reconstruction loop checking exhausted sides before indexing. At every iteration at least one position advances, so termination reaches (m,n). Equal letters consume both; mismatches choose the smaller remaining cost, with str1 on ties. Input strings are unchanged. The trace is explicitly labeled a JavaScript simulation; its complete table snapshots consume additional memory beyond the Python submission.

Opening the baseline and full-source disclosures in the browser confirmed readable code. The cold body-text extraction omitted closed code disclosures; that was not missing source. Mapping checked against actual Python: default table event 1 is lines 13–14 (b/c mismatch); event 4 is lines 11–12 (shared a); reconstruction event 6 is lines 24–27 (append a, increment both); event 7 is lines 28–30 (`<=`, append b, increment i only); event 8 is lines 18–20 (str1 exhausted, append c).

Cost is correctly scoped: boundary initialization O(m+n), mn interior cells, O(m+n) reconstruction and join, and (m+1)(n+1) integer cells plus output. Total time and space O(mn+m+n), equivalent to O(mn) over the official nonempty domain. The prose explains Python object overhead and why length-only rolling storage does not directly provide this reconstruction. The recursive baseline's O(2^(m+n)) upper time bound and O(m+n) stack bound are valid; it uses indices, avoiding suffix copies. Its empty/empty convergence illustration describes complete conceptual emission paths; the displayed length-only routine short-circuits when either suffix is empty. A concrete larger repeated nonterminal call would make that bridge more vivid, but the state-count and repeated-work reasoning are reconstructable.

## Independent calculations and execution

`independent-code.json` records actual canonical execution, separate from the simulation. Increasing-length enumeration of possible output strings verifies subsequence feasibility and minimum length on fresh `ba/ab → bab` (3), `ab/b → ab` (2), `aba/bab → abab` (4), repeated `aa/a → aa` (2), disjoint `ab/cd → abcd` (4), `a/a → a` (1), `a/b → ab` (2), and empty-side extensions. Empty inputs are outside the official domain and tested only as internal-boundary extensions.

**Reviewer prediction correction:** my cold claim that always-str1 produces `abb` for `ab/b` was wrong. That rule emits a, then shares b, giving optimal ab. The saved cold prediction remains above rather than being rewritten. The reviewer harness detected this before using it as evidence. The replacement independent counterexample is `a/ba`: greedy emits a, exhausts str1, then appends ba, producing aba (3); ba (2) contains both and the longer input gives a lower bound of 2. Actual canonical output was ba. This is a code check, not a custom browser input. The author's separate aab/baa counterexample also checks out: greedy aabaa (5), optimum baab (4).

Python line tracing on fresh ba/ab checked every final canonical table cell against the independent output-enumeration oracle and checked the invariant at each reconstruction loop head:

| i,j | out | Minimum remaining | Sum |
|---|---|---:|---:|
| 0,0 | empty | 3 | 3 |
| 1,0 | b | 2 | 3 |
| 2,1 | ba | 1 | 3 |
| 2,2 | bab | 0 | 3 |

Both consumed prefixes are subsequences of out at every row. This excludes a visually plausible transition that emits without consuming the correct prefix. Actual canonical maximum-boundary checks passed: identical a×1000 gives length 1000; a×1000/b×1000 gives 2000; a/b×1000 gives 1001.

A cold browser harness initially tried radio `value="4"`, confusing the label with its internal value. It timed out; inspection showed values 0/1/2, and selecting the visible 4-letter option (`value="2"`) completed the actual prediction check. This was a reviewer selector error, not a candidate interaction defect.

## Tests inspected before running; observed results

The test sources and their output controls were inspected before execution. All generated outputs were redirected to `specs/reviews/1092-evidence/1092-review-2-de6dcb3c/` or its named subdirectories. Commands ran from repository root; OUTPUT_DIR below means that absolute directory.

| Command | Actual result |
|---|---|
| `OUTPUT_DIR=… python3 -B leetcode/1092/tests/test_logic.py` | Exit 0; canonical callable versus 900 exhaustive binary pairs, 168 official/seeded/boundary cases, exact displayed baseline execution, mirror equality. `logic.json`. |
| `OUTPUT_DIR=… node leetcode/1092/tests/test_core.cjs` | Exit 0; 129 cases, 3096 frames; every known cell versus independently enumerated common subsequences, emitted-prefix feasibility, remaining-cost equality, independent snapshots, AST duplicate-key and translation-pair checks. `core.json`. |
| `OUTPUT_DIR=… node leetcode/1092/tests/browser.cjs` | Exit 0; Chromium 156.0.8078.4, Linux. Detailed observations in `browser-results.json`. |
| `OUTPUT_DIR=…/header-en node leetcode/1092/tests/header-fit-regression.cjs` | Exit 0; original narrow English state exposes every label line. |
| Same header command with `LOCALE=zh`, output `header-zh` | Exit 0; Chinese counterpart fully exposed. |
| Same header command with `BASELINE_REVISION=093440bf6df89b6a5dbc7a958ae3aef588b9acff`, output `header-original-red` | Expected exit 1: original stylesheet reproduces covered `8 ·` and fails unchanged text-exposure assertion. Only a browser response was substituted; checkout was not changed. |
| `OUTPUT_DIR=…/matrix node leetcode/1092/tests/header-fit-matrix.cjs` | Exit 0; 1296 header exposures across all presets, relevant initial/fill/ready/final states, both locales, 320/390/1440 widths and CSS zoom 1/2. All header text lines contained, column values aligned, sticky row labels exposed. Real keyboard scrolling and control restoration also passed. |
| **`python3 -B scripts/register_leetcode_lesson.py 1092 --validate-only`** | **Exit 0, no output.** Metadata complexity is exactly one nonempty string: `O(mn + m + n) time; O(mn + m + n) space, including output`. No registration performed. |

The test JSON's original “author self-check” scope strings are unchanged harness metadata, not a substitute for this review. Packages resolved through NODE_PATH; browser launch honored `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

Observed and interpreted browser behavior:

- All seven presets terminate in both locales with abc/3, cabac/5, aaaaaaaa/8, baab/4, abcd/4, a/1 and ab/2. Independent feasibility/minimum checks agree. Every event was rewound and replayed with exact table/event/progress/output/invariant/history restoration. Initial Back/Reset and terminal Next/Complete are disabled. Reset restores unknown interior cells; changing presets restarts as labeled. Hand history also rewinds to empty.
- The displayed fill state is **after** the assignment; the star identifies its newly computed cell. Reconstruction shows **after** emitting and moving, while text explicitly names both old and new coordinates. Unknown dots are not zeroes. Values remain in the table; underlines retain visited origins, while the current star moves to the next suffix. At terminal default state, three origins are underlined and (2,2) has `0 ★` without implying a fourth emitted letter. Both locales preserve these distinctions.
- Both complete formulas render exact indices, min operands, operators and empty boundaries. Semantic binding was checked for mismatch, equality, share, takeA/tie, takeB and both tails. On abac/cab, reconstruction starts by emitting c from (0,0) to (0,1): right cost 4 beats down cost 5. English says “right cost is smaller, take str2”; Chinese says `右方代价更小，取 str2`. The invariant changes 0+5 to 1+4, retaining 5. Dictionary AST checks reject duplicate keys and verify each consumed entry has two strings; actual explanations were also read, rather than accepting key presence as meaning.
- All prediction choices reveal the correctly reasoned four-letter answer with suitable correct/incorrect feedback. Changing the choice hides stale feedback; locale switches preserve selection and revealed meaning. Changing the trace preset does not invalidate this exercise because its aba/bab input is explicitly independent. H1, document title and formulas localize correctly.
- Exact untrimmed rendered `textContent`, decoded mirror, automatic clipboard result, fallback source and downloaded bytes match canonical Python including final newline. Four manual-transfer attempts (two per locale) each seeded and read back a distinct non-source sentinel before disabling automatic writes. Real Copy then focused and selected the complete fallback; Linux **Control+C** transferred it and native clipboard readback matched exactly. Each locale download matches the canonical 1118-byte file (`download-en.py`, `download-zh.py`). No clipboard newline normalization was needed.
- Enter activates Next with a 3px focus outline; focused table accepts ArrowRight/ArrowLeft. Controls and horizontal component scrolling remain usable at narrow sizes. Blocked localStorage does not stop the lesson. Offline file opening retains code and interaction startup. No page errors, failed local assets or external runtime requests were recorded.
- Browser layout coverage is EN/ZH at 320/390/736/1440 widths and CSS zoom 1/2. No page-wide overflow; selected preset labels fit the measured font/padding plus unchanged 20px arrow reserve. Header checks inspect actual text lines separately from container overlap. I viewed `cold-initial.png`, `en-1440-zoom1.png`, `en-320-zoom1.png`, `zh-390-zoom1.png`, `en-320-zoom2.png`, `reconstruction-en.png`, `reconstruction-zh.png`, `forced-colors.png`, and all three focused red/green header captures. Readable disabled controls, stars, underlines and retained histories were visible. Partly hidden neighboring columns while horizontally scrolling can be brought into view; they are not inaccessible states. Sticky navigation appearing mid-image in an element/full-page capture is a capture effect, not a finding.
- Contrast calculations use the actual calibrated function: black/white=21, primary luminances .2126/.7152/.0722, #747474/black=4.492948073111701 correctly fails 4.5. Rendered samples pass: disabled/unknown/muted 7.07885, current 8.93719, body 16.08699; disabled opacity is 1. Forced-colors capture retains current outline and star. These are sampled solid pairs, not a claim about every system palette.
- Related destinations were followed and their text read: #115 step0 explains increasing choices of positions, ordered subsequences, and disallowed reversal/reuse; #44 step2 names two prefix-length coordinates with text rows/pattern columns. These match the modest link promises in both locales. The self-link returns to the suffix proof. Keyboard activation respects sticky-navigation offsets. This is local preview navigation evidence, not public delivery.

## Required finding closure

### 1092-R1 — previously hidden English terminal column label

**Status: closed against candidate `3b35c3854f6b9346241e57c394619e19c4aa34d8` in this Linux Chromium environment.** Original severity: medium/required. Original report: [1092-review-1-206ef9e2.md](1092-review-1-206ef9e2.md). Original candidate `5cf73ee858d9a8938b55206c867233a8397d60f6` and failure evidence remain unchanged. Owner/next action: none required. Fix implementation: local CSS header-width/wrapping change, identified in the earlier focused report at `c3d5761514ebedd5e50297acd937c5380ba12fe0`; rechecked here against the actual requested candidate.

**Reproduction:** EN, 320×1000, CSS zoom 2, a×8/a×8 preset, Complete to event 73/73, table scrolled fully right, header settled below sticky navigation. Expected complete `8 · empty` identity with its column values and readable row association. Original stylesheet red run reproduces the missing `8 ·`: text starts x=161.84375 while the sticky corner ends x=188.84375. The unchanged header regression exits 1; `header-original-red/header-settled.png` visibly confirms occlusion.

**Actual candidate:** same actions, Linux Chromium 156.0.8078.4. Wrapper x=34…286, corner x=36…132, terminal header x=186…282; navigation bottom y=140, header top y=165.75. Terminal text lines are x=220.796875…247.203125 (`8 ·`), 204.296875…263.703125 (`empt`), and 227.875…240.125 (`y`). All lie beside the corner, inside the wrapper and their header height. Column values remain aligned. Chinese `8 · 空` is also complete. See `header-en/header-geometry.json`, `header-en/header-settled.png` and `header-zh/` counterparts. The 1296-exposure matrix additionally checks all columns and row association, not just the final cell. Rewind/reset/end and keyboard scrolling still work.

This closes the actual clipping requirement under frozen device accessibility and rendered-state label/association checks. It supplies the original Linux-platform regression evidence missing from the earlier macOS-focused review. That earlier review was read only after the cold walk and was not treated as this candidate's approval.

**Optional 1092-O1 (open advisory, low):** English `empty` wraps within the word as `empt` / `y` at narrow widths. Complete identity is readable, but whole-word wrapping would reduce friction. No required change; preserve the verified exposure if improved. No required findings remain open.

## Scores and conclusion

| Dimension | Weight | Score / 4 | Weighted | Observation and rationale |
|---|---:|---:|---:|---|
| Problem, terms, hand calculation | 15 | 4 | 15 | Concrete abc with input-position witnesses, nonunique answer, three-letter lower bound, domain and string output taught before abstraction. |
| Causal derivation and saved work | 20 | 4 | 20 | Defines suffix-pair work and state count; wrong greedy rule; matching first-occurrence argument; mismatch legal-case split, lower bound and attaining construction are reconstructable. |
| Maintained state and correctness | 20 | 4 | 20 | Dependencies, boundaries, actual canonical cell values, consumed prefixes, remaining-length invariant and terminating reconstruction independently checked. |
| Interaction and visual meaning | 20 | 4 | 20 | Predict/reveal/change works; after-event values and old/new positions agree; complete retained path, rewind/replay/reset/end and data/marker meanings observed. |
| Python and cost | 15 | 4 | 15 | Faithful executable Python, fresh enumerated examples and boundaries, actual invariant trace, exact transfers, correct costs and immutable inputs. |
| Bilingual and device access | 10 | 3 | 7.5 | Equivalent reasoning, state preservation, keyboard, contrast and repaired header exposure; narrow within-word wrapping adds minor friction. |
| **Total** | **100** | | **97.5/100** | Every dimension ≥3, no required open finding, evidence complete within stated local scope. |

**Conclusion: accepted** for this frozen candidate and this local independent review. Required IDs open: none. 1092-R1 is closed by explicit candidate-specific Linux regression evidence; 1092-O1 remains optional. Scores reflect the walkthrough and audited behavior, not screenshot or test counts alone.

Limitations: headless Chromium on Linux only. 200% coverage uses CSS zoom layout stress, not native browser-menu zoom or physical devices. No screen-reader session, real novice teach-back, successful LeetCode submission, publication decision or public deployment verification is claimed. Official statement access succeeded normally; the live official editor language selector was not operated. No implementation repair, registration, commit, push, deployment, agent spawning or schedule creation occurred.
