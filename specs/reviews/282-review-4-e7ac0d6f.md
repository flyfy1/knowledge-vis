# Independent review: Expression Add Operators (#282)

Candidate: `547ad67b2e33ef5a50b4f0969af14f7f0acafba0`. URL: http://127.0.0.1:18770/leetcode/282/. Target reader: basic Python and elementary recursion. Reviewer: this independent review run; exact model identifier unavailable. Frozen rubric read before browser access; weights 15/20/20/20/15/10. Python is the applicable preferred canonical language. No source, brief, tests, author notes, or previous reports were opened before this cold walkthrough was saved.

## Cold walkthrough (saved before source audit)

Real Chromium via Playwright, desktop 1280×900. Screenshots `01-cold-desktop.png` and `02-cold-operated.png` in this run's exclusive evidence directory. Inspected the initial full-page screenshot.

| Teaching step / question | Action | Observable result | My causal reconstruction |
| --- | --- | --- | --- |
| 01: What expressions are legal and what is requested? | Read digit-slice definition and bounds; click `12-3`. | Cards already display 6, 6, 9 before clicking; feedback becomes “Value 9; target 6.” | Preserve order, optionally join adjacent digits, insert only three operators. `12−3=9` is legal but misses 6. `1+2+3` and `1*2*3` hit 6. No actual hidden prediction in this first widget. |
| 02: What branches are explored or excluded? | Advance all six next-frame transitions. | 1: choose 1; 2: `1+0`; 3: `1+0+5=6`; 4: `1+0-5=−4`; 5: `1+0*5=1`; 6: `1-05` pruned; 7: `10-5=5`. History accumulates. Digits and indices remain the same. | Zero itself is legal, but extending an operand beginning with zero is illegal. A different cut yields 10 then 5. Text explains 16 baseline gap paths minus three illegal ones and carrying prefix evaluation instead of reparsing leaves. The frames do not show index/value/last or an explicit recursion return/undo. |
| 02 controls: Can I recover earlier states? | Previous from frame 7, then Reset. | Frame 6 with history through six; reset returns frame 1 and a single history item. | Rewind truncates the shown history; reset clears the trace position. |
| 03: Why is total alone insufficient? | Predict multiplication of prefix `2+3` by next 2 should produce 8, then select +, −, ×. | Before values stay value=5,last=3; after values are 7,last=2; 3,last=−2; 8,last=6. Formula remains `value′ = value − last + last × x` under every operator. | Multiplication replaces the signed terminal additive term; `5−3+6=8`. Addition and subtraction create a fresh signed term. Persistent multiplication formula contradicts the selected +/− transition unless the reader infers it is scoped only to ×. |
| 04: Can I apply precedence? | Predict first two expressions hit 8 and third yields 7; select first two and reveal. Then select third and reveal again. | Correct feedback explains 8,8,7. Changing selection first clears prior feedback to “Choose before revealing”; revealing all three gives “Not yet. Multiplication has precedence.” | Both multiplication placements hit; summing all three does not. This tests precedence but repeats exactly the preceding `2+3*2` counterexample. |
| 05: What is the Python mapping and cost? | Read mapping without opening full source; select verification presets 105,232,00. | Mapping defines index/expression/value/last, but every column heading says Python. Python interface and O(n·4ⁿ) time / O(n²) retained immutable-prefix space are stated. Only a fixed preset selector is available. | `last` is the term replaced by multiplication; deep recursion retains increasingly long strings. This table names state but does not itself demonstrate a recursive call or base case. Source audit will be necessary. |

Fresh independent predictions recorded BEFORE source execution: `122 → 5` should return exactly `1+2+2`. Counterexample: `1−2*2` evaluates to −3, requiring signed last=−2; storing +2 would repair the wrong term. UI has no custom input, so these will be **code checks**, not UI experiments. Additional boundary prediction: `0 → 0` gives only `0`; `00 → 0` gives `0+0`, `0-0`, `0*0`, excluding `00`.

Cold assessment: clear tiny arithmetic before abstraction, a useful explicit precedence counterexample, but baseline tree is a sparse selected-path tour rather than a maintained-state walkthrough. Essential return/branch/base-case reasoning is not visible in the seven frames. No author explanation has been used to fill this gap.

## Candidate identity and official contract

`git rev-parse HEAD` returned the requested revision. Working tree initially had only this run's report/evidence as untracked files. HTTP response bytes matched local candidate bytes for index.html, app.js, copy.js, core.js, python-code.js, and solution.py. SHA-256 receipts:

| Asset | SHA-256 |
| --- | --- |
| index.html | `45e53393b0d4521bf72781c2d8bc7041ca867e5af9f457aad697a70835090a58` |
| app.js | `3bb51128956af5630cf203ea61fdde1bba6877c11842de70bf9739c949912fbe` |
| copy.js | `b8150f902c45059fea0cad9dbf6b521c2ca7b302665c0878bdb54b7c4a0afb1a` |
| core.js | `500308449b58a76981af9e9d7d2c416b60def61e01e49d241a856e22a0e1ebec` |
| python-code.js | `5092f63ded411d48d2925b624392f823445422a0f623d9a8a6b064efebeef6d4` |
| solution.py | `0bc7dbf2d90c12e1087da6aafc8694a5fe5eea1ab1712ce85329c4ea9aedb84b` |

After the cold walk, the web tool opened the [official statement](https://leetcode.com/problems/expression-add-operators/) normally and returned its statement, three examples, and constraints. They match the lesson's digit-order, binary-operator, concatenation, leading-zero, length, and target rules. A separate normal Chromium navigation encountered Cloudflare verification; no bypass was attempted. The web response did not expose the language menu/template. I therefore inspected the candidate-local dispatcher capture `provenance/official-python3-20261025.jpg` and its JSON: the image visibly shows selected Python3 and `class Solution: def addOperators(self, num: str, target: int) -> list[str]`. Its SHA-256 independently matches `ed66a6394160f9c9d517c2b16c9baf764f493c97403bfee3bfb1c868ba710bbd`. The saved menu evidence includes Python3/Python and TypeScript. This is a faithful preferred Python implementation; `typing.List[str]` preserves the original callable/return semantics. No non-Python language-contract exception is applicable or necessary.

The lesson-local diff from review 3's candidate touches BRIEF and provenance only; runtime/source/cost files are unchanged. I did not use the BRIEF to supply teaching explanations. Prior report scores are not evidence for this review's scores.

## Executable correctness, cost, tests, and source transfer

Tests were read before execution. `test_solution.py` reads/imports the canonical file and checks eight fixed plus 400 seeded small randomized cases against a separate precedence evaluator. `test_parity.py` only compares the decoded mirror to the source; its message “embedded/download source parity passed” overstates its scope because it makes no HTTP request or download. `browser-check.mjs` can write screenshots and only checks broad interactions/readout presence. I did not execute that script or regenerate any author evidence. My own CommonJS Playwright audit used NODE_PATH resolution and `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

Commands run from repository root:

- `python3 -B scripts/register_leetcode_lesson.py 282 --validate-only` → exit 0, no output (repeated after audit, same result).
- `python3 -B leetcode/282/tests/test_solution.py` → exit 0, “282 canonical/oracle checks passed: 8 fixed + random cases”.
- `python3 -B leetcode/282/tests/test_parity.py` → exit 0, parity message above.

Metadata complexity is exactly one nonempty string: `O(n·4^n) time; O(n²) recursion auxiliary space for immutable expression prefixes, plus output space`.

Independent execution used `exec(compile(actual solution.py bytes,...))`, not the browser's JS simulation. A second oracle enumerated all four choices in every gap with `itertools.product`, rejected zero-prefixed tokens, and used Python arithmetic evaluation. Results:

| Code check | Actual sorted result / observation |
| --- | --- |
| Fresh `122 / 5` | `['1+2*2', '1+2+2']`. **My cold prediction was incomplete**: I overlooked `1+2*2`. Both canonical and independent enumeration agree. This is not a candidate defect. |
| Counterexample `122 / -3` | `['1-2*2', '1-2-2']`; the former independently evaluates to −3. |
| `0 / 0`, `0 / 1` | `['0']`, `[]`. |
| `00 / 0` | `['0*0','0+0','0-0']`; joined `00` excluded. |
| `000 / 0` | All nine two-operator expressions, no zero-prefixed multi-digit operands. |
| `9999999999 / 2147483647`, `/ -2147483648` | Both empty; length and both target endpoints exercised. |
| `1000000000 / 1000000000` | `['1000000000']`, confirming a whole-string operand is allowed. |
| Official `3456237490 / 9191` | `[]`. |
| 150 new seeded cases | Full digits 0–9, lengths 1–5, targets −40..40: all agree with the separate gap-product oracle. |

An initial reviewer-only result-isolation assertion reused my incorrect one-answer prediction and failed; it was corrected to the independently verified two-answer set. The corrected check confirms separate calls return separate answer lists; mutating one returned list does not contaminate later calls. Inputs are immutable, and no caller-owned mutable object is changed.

Actual `sys.settrace` call evidence for `122/-3`: `(index,expression,value,last)` is `(1,'1',1,1)`, then `(2,'1-2',-1,-2)`, then `(3,'1-2*2',-3,-4)`. Thus −1−(−2)+(−2)×2=−3. A full additional trace of `1023/-5` checked all **71 calls / 52 leaves**: expression digits equal the consumed input prefix, value equals independent expression evaluation, and last equals the signed final multiplication term. Results are `1+0-2*3`, `1-0-2*3`, `1*0-2-3`.

Correctness reconstruction from source: index strictly advances to end+1; every possible next slice and operator is visited once; the initial token has no unary operator; the leading-zero break excludes only illegal extensions; addition/subtraction create signed terminal terms; multiplication replaces the previous terminal product. At index==len(num), only target matches are appended, then recursion returns. For the visible multiplication widget, source lines 22–23 map `(index=2,expression='2+3',value=5,last=3,current=2)` to `(3,'2+3*2',8,6)`. This mapping is independently correct, but the lesson does not work through that recursive-call bridge itself.

Four choices per gap give at most 4^(n−1) leaves. String construction and slicing give the stated conservative O(n·4^n) time. Retained immutable prefixes along one active recursion chain consume O(n²) characters, with output separate; arithmetic operands are bounded by the ten-digit input domain. The derivation's literal “each expression can contain n characters” is imprecise: operators allow up to 2n−1 characters, though the O(n) factor and final asymptotic bound remain correct.

`LANGUAGE_FILES` specifies `solution.py`, `python-code.js`, `PYTHON_SOURCE`. Canonical source is 1,036 UTF-8 bytes including the final LF. Exact equality passed for decoded embedded constant, rendered `#code.textContent`, served source bytes, real download stream, and actual successful clipboard readback. No trimming or whitespace normalization was used. Forced clipboard rejection shows the correct localized fallback message. Opening the disclosure allows selecting and copying the code, but native selection and Control+C produce **1,035 bytes**, missing the final LF; this was reproduced after a settled disclosure. This is a trailing-newline omission, not CRLF conversion, and is not silently counted as exact parity (see finding below).

## Interaction, localization, and device observations

All browser evidence in this run's exclusive directory; no earlier screenshots/reports were changed. Initial/operated desktop, formula in both locales, 320/390/1280 in both locales, 200% desktop zoom, manual copy, contrast view, narrow zoom, frame 3, and mapping captures were saved. I inspected the initial desktop, operated formula, 320/390 bilingual full pages, zoom captures, frame-3, mapping, and contrast images. No numerical label/value collision is alleged: the issue is meaning, not intersecting boxes.

- Enter advances and rewinds frames; Space also advances. At settled frame 7/7 Next is disabled; rewind/replay restores `10-5=5`. Keyboard Reset returns 1/7 with Previous disabled. History retains prior frames and truncates on rewind. A first rapid force-click probe did not reach the endpoint reliably; normal settled clicks verified it, so that probe is not treated as a product failure.
- Locale switches preserve frame 2/7 (`1+0`), subtraction state `(5,3)→(3,−2)`, quiz selection/revealed wrong answer, `00/0` verification selection/results, and selected `12-3=9`. Chinese feedback and English feedback both explain precedence and zero pruning. Changing quiz selections invalidates the prior reveal before regrading.
- Acorn parsed localization property keys before object evaluation: no duplicate keys. Most entries are proper two-string pairs. `mapping` incorrectly contains six strings and is consumed as a locale pair: English headings are **Python / Python / Python**, Chinese **量 / Python / 量**. `mapRows` is also not a pair but is unused. The third heading should identify the role/meaning, not Python or quantity. This is a real binding defect; body descriptions remain understandable. Metric variable names stay English in Chinese, including `next value`; core explanatory text is translated.
- Preset verification returns matching canonical/oracle sets, including `105/5`, `232/8`, `00/0`. The UI “canonical” is a JS reimplementation, not execution of the actual Python source; separate Python execution above supplies that evidence.
- At 320, 390, and 1280 CSS pixels, document scrollWidth equals viewport width in both locales. Dense frame-7 histories and variable labels remain readable; narrow cards stack; long mapping identifiers wrap across lines. Code uses its own scrolling region, and step navigation scrolls horizontally. No essential text overlap was observed.
- At desktop 1280 with CSS zoom=2, scrollWidth remains 1280 and the lesson remains readable. Additional 320px/200% capture has document scrollWidth 466 and very narrow wrapping; horizontal panning is necessary. This was a CSS zoom emulation, not browser-chrome zoom, and is not claimed as perfect narrow-screen reflow or native zoom evidence.
- Focus rings and Tab movement are visible; after Reset, Tab reaches the + operator. Disabled endpoints remain identifiable but faint (opacity .4). Computed contrast: body 17.45:1; muted text 9.11:1; primary action foreground `rgb(13,17,23)` against `rgb(22,121,155)` is **3.82:1**, at 16px bold. This falls below the usual 4.5:1 normal-text benchmark; improve it. I record this as an accessibility weakness, without inventing a new frozen-rubric threshold or claiming essential content was unreadable.
- No lesson page JavaScript errors occurred in the audit. Successful normal copy, download, and fallback behavior were actually exercised, with the exact fallback limitation above.

## Prior required finding closure

| Stable ID | This candidate's regression evidence | Status |
| --- | --- | --- |
| L282-DERIVATION-001 | Cold-read section 02 now visibly counts 16 raw paths, removes the three `05` paths to leave 13, and explains repeated leaf prefix parsing versus maintained value/last, in both locales. | **Closed** for its original baseline/repeated-work scope. Separate recursive teaching gap below is newly observed. |
| L282-COST-001 | Metadata and both locale paragraphs state O(n²) retained immutable-prefix space; source still concatenates child strings; actual execution and source inspection support that cost. | **Closed**. |
| L282-OFFICIAL-ACCESS-001 | Official statement freshly read normally through web tool; independent saved Python3 interface capture inspected and hash checked. Normal Chromium access still challenges, explicitly disclosed above. Prior finding allowed independently captured interface evidence in a new review. | **Closed** for this evidence-bearing candidate; no live selector claim. |

## Required findings on this candidate

All findings below concern revision `547ad67b2e33ef5a50b4f0969af14f7f0acafba0`; owner/next action is the lesson maintainer, with a new frozen candidate and independent regression review required. Fix revision: none. Final status: **open**.

### L282-FORMULA-001 — selected operator and formula disagree (required, medium)

Reproduce in section 03 at 1280×900, EN or Chinese: select − (or +), then inspect all simultaneous state readouts. Before values are 5 and 3; x is 2 from the fixed 232 example; selected − yields next value 3/new last −2, but the displayed unqualified formula still computes `5−3+3×2=8`. With + the numeric result is 7 while the formula still yields 8. Screenshots `03-formula-en.png` and `03-formula-zh.png` show the subtraction case.

Expected: formula corresponds to the selected transition, or is explicitly labeled as an ×-only reference separated from the active transition. Actual: `renderState` changes numeric state while `.formula` is static. The preceding prose scopes its explanation to multiplication, but the interactive after-value/formula presentation does not retain that distinction. This violates the frozen correctness/visual-meaning requirement and rendered-state contract §1/§3. Show the active +/−/* recurrence and its actual substituted values. Regression must verify all three operators in both locales after switching, with matching before/after values.

### L282-STATE-001 — recursive-state teaching bridge is missing (required, high)

Reproduce in sections 02 and 05, EN or Chinese, desktop or narrow: advance all seven frames, then read the mapping before opening full source. Frame 3 `1+0+5=6` moves straight to `1+0−5=−4`, then `1+0*5=1`; frame 6 jumps to a pruned path, and frame 7 to `10−5=5`. No frame shows index, current token, value, last, saved parent state, a return, or the completion test. `core.js` has value/last fields, but `renderFrame` does not display them. Digit highlighting is driven by frame ordinal capped at 2, rather than an explained algorithm-state quantity. Screenshot `10-frame3.png` and the cold table record the behavior.

Expected: one tiny worked recursive branch demonstrates the state before/after, the next-slice boundary, how returning restores a sibling's prefix, and why reaching the end emits only target matches. Actual: a terse definition of backtracking, static names table, and sample expression values leave those essential steps for the reader to infer from raw Python. The seven snapshots are correctly labeled a teaching trace, but that label does not supply the missing explanation. The transfer question repeats `2+3*2` immediately after teaching it and does not probe these branching/termination decisions. This violates frozen maintained-state/correctness and visual-to-Python teaching requirements; executable correctness does not close it. Add a worked call/return/sibling sequence with explicit values and a fresh exercise involving signed last or a zero-prefix boundary. Regression must reconstruct it in the rendered lesson without using author notes/source to fill gaps.

### L282-COPY-FALLBACK-001 — fallback copy loses final source newline (required, low, fidelity)

Reproduce at desktop EN: force `navigator.clipboard.writeText` to reject, click Copy, expand Show full source, select all `#code` contents using a DOM Range, press Control+C, and read clipboard. Source/displayed textContent are 1,036 bytes; selection and clipboard are 1,035 bytes, ending `return answer` instead of `return answer\n`. A settled rerun reproduced it. `06-manual-copy.png` records the fallback view; byte comparison, rather than the screenshot, establishes the mismatch.

Expected: exact canonical-source fallback copy including final LF under the requested fidelity gate. Actual: native rendered selection omits that LF. This does not change Python execution and normal automatic copy/download pass; nevertheless, it fails the explicit final-newline parity requirement for the fallback path. Supply an exact selectable fallback value (for example a textarea retaining the LF), then independently compare its selected/copied text with source without normalization in both locales.

Minor observations, not additional required IDs: mapping headings are semantically misbound; step 01 asks for a prediction while already displaying the answers; one derivation sentence undercounts literal expression characters; primary-action contrast is 3.82:1; extremely narrow 200% CSS zoom needs panning. These affect the score and should be considered with the required fixes.

## Scores and conclusion

| Dimension | Weight | Score / 4 | Observation-based rationale |
| --- | ---: | ---: | --- |
| Problem, terms, hand calculation | 15 | 3 | Operands, order, operators, bounds, legal joins and tiny arithmetic are clear; output as a collection of every matching expression is conveyed by examples/interface more than a direct return-value explanation. |
| Causal derivation and saved work | 20 | 3 | Explicit 16/13 enumeration and saved parsing work now provide the baseline bridge; the dense paragraph and sampled trace do not gradually work through the recursive mechanism. |
| Maintained state and correctness | 20 | 2 | Actual Python and independent invariants pass; a local signed-last definition helps, but the selected formula contradiction and missing worked return/base-case bridge remain required gaps. |
| Interaction and visual meaning | 20 | 2 | History, rewind/reset/endpoints, quiz invalidation and preservation work; active formula does not match the selected transition and ordinal highlighting has no explained state meaning. |
| Transfer to Python and cost | 15 | 3 | Faithful executable Python, independent examples, correct cost and normal exact source transfer; visual-to-call teaching and fallback exactness prevent a higher score. |
| Bilingual and device access | 10 | 3 | Equivalent main reasoning and preserved state at tested widths; heading binding, low primary-action contrast, and narrow zoom friction remain. |

Weighted total: **65/100** (11.25 + 15 + 10 + 10 + 11.25 + 7.5).

Outcome: **changes_required**. Required open IDs: **L282-FORMULA-001, L282-STATE-001, L282-COPY-FALLBACK-001**. The score is below 85, two dimensions are below 3, and required gaps remain. Passing numerical tests and the closed historical findings do not establish acceptance.

Limitations: preset-only UI; fresh custom cases are code checks. Normal browser official access still faces Cloudflare, while the web statement read and inspected saved interface supply the declared official evidence. Zoom used CSS emulation. No actual novice comprehension, successful LeetCode submission, live language-menu interaction in this run, publication, or deployment verification is claimed. No implementation, tests, prior evidence, shared files, services, Git configuration, or workflow was changed.
