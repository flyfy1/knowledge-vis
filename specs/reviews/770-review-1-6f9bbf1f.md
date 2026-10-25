# Independent review: 770 Basic Calculator IV

Candidate: `b042f446318bd53113f6d784d8d5fde41110aa30`. URL: http://127.0.0.1:18770/leetcode/770/. Review date: 2026-10-25. Reviewer: this independent review run; exact model identifier unavailable. Target: basic Python, lists, loops, functions and elementary recursion. Frozen dimensions and weights: problem/terms 15, derivation 20, correctness 20, interaction 20, Python/cost 15, bilingual/device 10. Python is the preferred faithful executable interface for this algorithm problem.

## Cold walkthrough (saved before opening source, tests, briefs or earlier reviews)

Only the frozen rubric was read before opening Chromium through Playwright. Initial viewport 1440×1000. All observations below came from the rendered page. Source disclosures remained closed. No author notes supplied an explanation.

| Teaching step/question | Action | Visible result | My causal conclusion |
|---|---|---|---|
| 01: What is the requested output? | Read the tiny hand example before advancing | `(a + 2)*(a - 1)` expands to `a*a-a+2*a-2`; output includes coefficient 1 | Unknown names survive; only identical variable products combine. Constants have degree zero and repeated variables count toward degree. |
| 02: What work is saved? | Read cancellation and wrong-key examples | Baseline produces ab, ac, -ab, -ac for `(a-a)*(b+c)`; early combination empties the left map | Combining before multiplication avoids pairs that would cancel later. Sorted tuples identify ba with ab, while preserving repeated a in aab. |
| 03: What does a parser return? | Read grammar, map invariant and group-return narrative | expr/term/atom are defined; dictionaries denote completed subexpressions, keys sorted and coefficients nonzero | Child calls return algebraic values, not final strings; term resolves multiplication before expr handles sums. |
| Initial trace: is anything complete? | Inspect event 0 | 0/10, interval [0,0), no completed map; final pending | No consumed expression must not be confused with zero polynomial. |
| Event 1: how is unknown a represented? | Next | [1,2), `(a):1`, nested stack down to atom at 1 | An unsubstituted name produces one symbolic term. |
| Event 2: how is constant 2 represented? | Next | [3,4), `():2`; previous a event retained in history | Empty tuple is a constant key, and the current map is only this atom. |
| Event 3: what does a+2 return? | Next | [1,4); left a:1, right ():2, result has both | Unlike keys coexist; no multiplication is implied. |
| Event 4: what does closing a group change? | Next | [0,5), same two-row map; stack returns to outer atom | Parentheses alter parse extent, not the polynomial value. |
| Event 5: does sibling parsing reuse the left map? | Next | [7,8), current a:1; stack enters second group | The displayed current value belongs to the right child, while prior completed events remain. |
| Event 6: what is the right constant before subtraction? | Next | [9,10), ():1 | The atom is positive one; the subtraction operation supplies its sign later. |
| Event 7: how does subtraction affect coefficients? | Next | [7,10), operands a:1 and ():1; result a:1, ():-1 | Subtraction negates right coefficients rather than changing variable keys. |
| Event 8: how does right group return? | Next | [6,11), unchanged a:1, ():-1; outer atom stack | The group hands the map to the outer multiplication after consuming its closing parenthesis. |
| Event 9: where do the four products go? | Next | [0,11), both operand maps, four explicit pair rows: aa:1, a:-1, a:2, ():-2; combined map aa:1,a:1,():-2 | Every left/right pair contributes; -1+2 is accumulated under the same a key. Operand panels are before values, result panel is after. |
| Event 10: when is final formatting valid? | Next | 10/10; final `["1*a*a","1*a","-2"]`; ten history entries | Sorting and formatting happen after the whole expression completes; degree orders the three terms. |
| 04: will the mixed term survive? | Predict B for `(x+y)*(x-y)+y*x`, select B, reveal | Correct feedback expands four products, cancels mixed pair, then retains extra xy | The extra product prevents total mixed cancellation; lexicographic canonicalization changes y*x to x*y. |
| Can an answer be changed honestly? | Change B to A | Previous explanation disappears | A changed prediction requires another reveal. |
| Does the tempting key rule fail? | Select Equal keys & repeats, go to final | `b*a+a*b-a*a*b` yields `["-1*a*a*b","2*a*b"]`, 14 retained events | Order of variables does not distinguish keys, but multiplicity and degree do. |
| 05: what connects trace and Python? | Read visible prose, leave source closed | Specific (a)×() coefficient -1, then ()×(a) coefficient 2; zero deletion, `(-len(k),k)` ordering and size-sensitive cost explained | Accumulating contributions and sorting keys implement the visual operation; exponential distinct output cannot be optimized away. |

Independent predictions, made before executing any code: fresh `(b + 1) * (a - b)` must return `["1*a*b","-1*b*b","1*a","-1*b"]`. Counterexample `a*a + a` must retain `["1*a*a","1*a"]`; converting variables to a set would incorrectly conflate them. The interface offers only eight presets, so these will be **code checks**, not custom-input browser experiments. Default hand result and quiz prediction were confirmed in the browser. Screenshot saved: `770-evidence/770-review-1-6f9bbf1f/cold-final-desktop.png`.

Cold conclusion: I can reconstruct distributivity, canonical keys, group return, precedence, zero removal, output ordering and the size-dependent cost from the lesson alone. Tuple/dictionary vocabulary is introduced in prose; the full source audit remains pending at this save point.

## Subsequent audit

The rendered-state contract was read only after saving the cold walkthrough above. No earlier 770 review report was present (the filename search found only this report), so there are no earlier required findings to close.

### Identity and official contract

`git rev-parse HEAD` returned exactly the requested revision. The initial and final Git status showed only this report and its new evidence tree; `git diff --stat` was empty. Every file hash in `candidate-manifest.json` matched the checkout. Browser-requested bytes for index.html, style.css, copy.js, core.js, app.js, both code mirrors, solution.py, ../common.js and ../style.css all returned HTTP 200 and exactly matched their checkout files. Representative SHA-256 receipts:

- index.html: `234dfc8b2d212c236b525fec77255fef47035c281537ab82918c17ddcc09f707`
- solution.py: `2ad2f65964e748413ff9533765df74d7cef8cf1dae23b3cd74174acf5102ff86`
- core.js: `34901091c2baeaaf8a671fc9e3f79f5c5c3de0967deb7c39d626d3e7a590d20c`
- copy.js: `904005d2d16b437f23f16a07f721f8b6dbd385c13fa96cbda689a033e5dd0c49`

Read the [official statement](https://leetcode.com/problems/basic-calculator-iv/) through the normal web reader during this run; it was accessible without bypass. Confirmed precedence, valid-input guarantee, no unary/implicit multiplication, multi-letter names, repeated variable occurrences, nonzero terms, coefficient 1, output sorting, all three examples, and the stated constraints. The lesson accurately paraphrases these rules. Its 1–20 name-length bound is attached to substitutions, not all expression variable tokens.

Read lesson-local official provenance after the cold walk. The saved GraphQL response identifies #770, non-paid status, method `basicCalculatorIV`, parameters `expression:string`, `evalvars:string[]`, `evalints:integer[]`, and string-list return. Its Python3 snippet is the same `class Solution`/method/type-signature contract used by solution.py. The current normal statement access independently corroborates the callable's semantics; the saved selector snippet supplies the exact interface. No non-Python solution or language exception is used, so no non-Python language-contract verification is applicable. `LANGUAGE_FILES` in the registration script specifies solution.py / python-code.js / PYTHON_SOURCE, which are the files checked here.

### Independent calculations and actual code

Executed the actual canonical source using `python3 -B` and importlib, invoking `Solution().basicCalculatorIV(...)`, not the JavaScript simulation. Both input lists were compared with pre-call copies. Independent fresh-input **code checks** (the UI has no custom-expression field):

| Input and substitutions | Prediction/independent calculation | Observed canonical result |
|---|---|---|
| `(b + 1) * (a - b)`, none | ab − b² + a − b; degree-two keys ab then bb | `["1*a*b","-1*b*b","1*a","-1*b"]` |
| `a*a + a`, none | Multiplicity distinguishes degree two from one; set keys would lose this distinction | `["1*a*a","1*a"]` |
| `9 - (4 - 2)`, none | Inner 2; outer 9−2=7 | `["7"]` |
| `(aa + b) * (aa - b)`, aa=-2 | aa is one name; substituted square is 4, cross terms cancel | `["-1*b*b","4"]` |
| `0`; `a - a` | Zero retains no terms | `[]` in both cases |
| One 250-character lowercase name | One symbolic name, not 250 factors | One `1*<entire name>` term |
| 124 enclosing parentheses around `ab`, length 250 | Matched groups preserve one atom | `["1*ab"]` |

All eight checks matched, and neither eval list changed. The fresh small-input and multiplicity-counterexample predictions were written before execution in the cold record. At a=3,b=2, the fresh expansion evaluates to 3, matching (2+1)(3−2); the symbolic coefficients and order also match the hand expansion, not merely one numeric evaluation.

Visual-to-Python mapping: event 9's left `(a):1, ():2` and right `(a):1, ():-1` enter `multiply` at solution.py:19. Lines 21–24 enumerate four pairs, concatenate/sort their tuple keys, and accumulate coefficients. The two a-key updates are 0−1=−1 and −1+2=1. Lines 25–26 remove a key at zero. The previous maps are not mutated: multiply creates a fresh dictionary; combine copies left at line 12. Event 7 corresponds to combine with sign=-1 at line 56. The group event corresponds to the child `expr()` and subsequent closing-parenthesis consumption at lines 33–36. No undo is implemented in the submission; rewind restores JavaScript snapshots, as labeled.

Correctness reconstruction: atoms denote one substituted number, unknown name or completed group. Combine preserves each key's coefficient sum/difference. Multiplication enumerates every pair required by distributivity, and sorted tuples make equal products share a key without discarding multiplicity. Removing zero coefficients preserves the polynomial and its sparse representation. The term loop resolves multiplication before the expr loop resolves sums; subtraction proceeds left to right. A group's child stops at `)`, and its atom consumes that delimiter exactly once. Finite valid tokens and atom consumption establish termination. Final `(-len(k), k)` sorting enforces degree then variable-sequence order. Initial pending data, intermediate subexpression data and final output are separately labeled.

Cost audit: the baseline genuinely postpones coefficient combination to the root. Its `(a-a)*(b+c)` four contributions are avoidable in the canonical code because the left map becomes empty before multiplication. The stated r*s bound is a count of contributions, with additional variable-key sorting costs implicit in their construction; it is not advertised as total constant-time processing per product. Canonical multiplication sorts/hashes tuples for every p*q pair; combine copies/scans maps, and final sorting compares variable sequences. The displayed n/E/P/D bound is conservative and explicitly counts name comparisons as key operations, with character-length caveats. For `0`, P=D=0 still leaves O(E+n) processing in the bound; for `(a+2)*(a-1)`, P=3,D=2, four multiplication pairs and three output terms fit it. Retained recursive maps, token strings and temporary tuples fit the stated conservative auxiliary bound, with output strings and teaching snapshots separately identified. Distinct polynomial terms can grow exponentially. The code does not claim linear cost from the 250-character input cap.

### Tests inspected before execution

Inspected check.py, browser.cjs and inspect.cjs before running them, including all output paths. The OUTPUT_DIR override redirects their generated artifacts into this exclusive review directory. Commands from the repository root:

```text
OUTPUT_DIR=specs/reviews/770-evidence/770-review-1-6f9bbf1f python3 -B leetcode/770/tests/check.py
OUTPUT_DIR=specs/reviews/770-evidence/770-review-1-6f9bbf1f node leetcode/770/tests/browser.cjs
OUTPUT_DIR=specs/reviews/770-evidence/770-review-1-6f9bbf1f node leetcode/770/tests/inspect.cjs
python3 -B scripts/register_leetcode_lesson.py 770 --validate-only
```

All exited 0. Preflight produced no stdout or stderr. lesson-entry.json complexity is exactly one nonempty string describing time/key operations and auxiliary space. No registration or candidate repair was performed.

Algorithm rerun: 1,569 canonical Python cases, 3,138 numeric assignment checks, 1,569 JavaScript trace cases and 13,708 intermediate frames passed. I inspected the independent AST/raw-contribution oracle, direct arithmetic evaluation, sorted/nonzero/unique-key checks and pair accounting. It covers the official examples, precedence, subtraction association, cancellation, negatives, zero, 100 substitutions, expression-length and nesting boundaries. These are supporting computational observations, not evidence of human learning. Generated JSON retains the original scripts' `kind: author self-check` label; these files are fresh reviewer rerun outputs in this directory, not a relabeling of prior author evidence.

### Browser interactions, localization and source transfer

Browser: headless Chromium 156.0.8078.4 on Linux; Playwright loaded using supplied NODE_PATH and `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Both locales exercised. No page/console/request errors were reported.

All eight preset results were checked against independently understandable expectations: default aa+a−2; official -a+14; e²−64; -a²b+2ab; empty cancellation; numeric 7; empty negative/zero substitution result; and `(a+b)^2` with a=2 giving b²+4b+4. Initial previous/reset and final next/end buttons disable at the appropriate endpoints. Back/next reproduces the same stage text at the first event and endpoint. Reset returns to event 0; preset changes restart only the trace. Default full traversal retains all ten events. Locale roundtrips preserve preset, event, checked answer, revealed feedback, open source disclosure and language-button focus. Storage denial still permits language changes and trace advancement.

The three prediction choices were each revealed in both languages. B is correct; A omits the extra xy, C leaves variables unsorted. Feedback explains the same four-product cancellation and extra retained product in English and Chinese. Changing a choice hides old feedback; resetting or changing an unrelated experiment preserves the independent prediction as promised. Chinese rendered prose was read across all five sections, not merely checked for nonempty keys. It preserves the hand calculation, tuple multiplicity, recursive child/return/sibling story, invariant, zero distinction, precedence, boundaries and cost caveats. Localization object duplicate-key detection parsed every object before evaluation; every consumed entry is a nonempty [zh,en] string pair. Representative event/group/operation, pending, zero, feedback and clipboard-fallback bindings have the intended distinct meanings.

H1 and document titles are `#770 · Basic Calculator IV` / `#770 · 基本计算器 IV`, including zh→en→zh at 320 px. The official href is exact. Enter advances the focused Next control; keyboard Home/End on the native select chooses preset 7; related links activate with Enter. Focus has a visible 3px amber outline. Native controls and prediction labels have generous target sizes. All section anchors land below the sticky navigation. Horizontal navigation can scroll to its remaining items.

Source fidelity was checked without trimming/normalization: canonical 2,114-byte solution.py, decoded PYTHON_SOURCE, rendered `#pythonCode.textContent`, successful clipboard text and downloaded bytes match, including final newline and indentation. Baseline mirror/display likewise match baseline.py. Forced clipboard API denial seeds a distinct non-source sentinel, opens and focuses the full selected textarea, uses native **Control+C** on the Linux browser host, and reads the actual canonical text back from the clipboard in both locales. The test did not seed source into the clipboard during fallback. The lesson remains operational via file:// with exact source available. No LeetCode submission was attempted or claimed.

Related navigation was followed in both languages at 320 px with keyboard activation. ../224/#step2 explains preserving outer totals/signs while computing groups; ../726/#step2 explains name-to-count dictionaries and merging multiplied child counts while retaining the parent. Those meanings support the actual link labels; the latter is not claimed to teach polynomial multiplication. Both destinations were available on this preview, and target hashes/observed sections are in additional-browser-results.json. This establishes preview navigation, not a future production release manifest.

### Layout, screenshots and contrast

Generated evidence is confined to `specs/reviews/770-evidence/770-review-1-6f9bbf1f/`; no prior evidence was changed. Browser checks used 320, 390, 736 and 1440 widths, plus 200% CSS zoom at a 780px viewport (390px effective content width). Essential operands, pair contributions and coefficient tables reflow without page-wide overflow. Native selected-label checks cover all eight presets in both languages. On this Linux browser, the 320px select is 260px wide with 15px left/right padding. The English selected label “Product after substitution” measures 193.14px, fitting the test's 206px content allowance after a 24px native-arrow reserve. CSS font is `16px "PingFang SC", "Microsoft YaHei", system-ui, sans-serif`; the exact resolved installed face was not inferred from that stack.

I opened and inspected the screenshot images, including: en/zh-320-products, en-390-result, zh-390-controls, en/zh-1440-products, en/zh-zoom200, en-320-controls, zh-320-heading, en/zh-prediction, zh-manual-copy, en-zero, and the independently captured en/zh-320-long-intermediate and repeat-intermediate states. Narrow product rows wrap but retain operand/coefficient association; result columns remain distinct. The long `temperature`/`pressure` input and substitution JSON wrap visibly without clipping. Event 12 for repeated keys displays `(a,a)` times `(b)` producing `(a,a,b):1`, separately from the pending final expression. One Chinese capture appeared to omit its contribution row during scrolling. I retained it and rechecked the live DOM plus a settled, scrolled screenshot (`zh-320-repeat-recheck.png`): the full contribution row is visibly present; computed display/visibility were list-item/visible, with its 238×72px box inside the viewport. This was a capture-state artifact, not a reproduced missing-data finding.

The contrast helper was inspected for the correct sRGB linearization and weights 0.2126/0.7152/0.0722, then its executed calibration checked black/white=21, primaries and #747474-on-black=4.492948073111701 (correctly below 4.5). Resolved rendered text contrast minimum was 6.449407898769069. Disabled final Next/End use rgb(154,167,184) on rgb(28,35,48), ratio 6.4494, with opacity 1; they remain readable and are actually disabled. Focus outline survives forced-colors mode. Measurements cover this solid/composited-background implementation and inspected states; they do not claim a universal assistive-technology audit.

## Findings and scores

Required open finding IDs: **none**. No mathematical, causal-teaching, interaction, source-parity, metadata or material bilingual/device defect was reproduced. No previous required finding was closed by inference.

| Frozen dimension | Score /4 | Weighted points | Observation and rationale |
|---|---:|---:|---|
| Problem, terms, hand calculation | 4 | 15 | Concrete four-product calculation precedes abstraction; terms, coefficients, degree, substitution and output order are reconstructable. |
| Causal derivation and saved work | 4 | 20 | Raw expansion versus early cancellation identifies specific saved pairs. Commutativity and repeated-variable counterexamples justify included/excluded keys. |
| Maintained state and correctness | 4 | 20 | Concrete child/return/sibling sequence, operand/result maps, token intervals and full history support the invariant, precedence, boundaries and termination. |
| Interaction and visual meaning | 4 | 20 | Prediction/reveal/change, before operands versus after result, retained history and pending versus final output were directly exercised and meaningful. |
| Transfer to Python and cost | 3 | 11.25 | Actual official Python ran correctly; exact source transfer and mutation checks pass. Specific key accumulation maps to code. Minor friction remains for this target reader: tuple/dictionary idioms and the dense multi-parameter bound require careful reading of the complete code rather than a separate beginner syntax exercise; this does not prevent reconstructing the taught mechanism. |
| Bilingual and device access | 4 | 10 | Both locales communicate equivalent reasoning; controls/state persist, narrow and zoomed rows remain readable, native keyboard and clipboard fallback work. |
| **Total** | | **96.25 / 100** | Every dimension ≥3, total ≥85, complete scoped evidence and no required open finding. |

Conclusion: **accepted** for the identified candidate and this preview review scope. This is independent lesson review, separate from publication. Limitations: headless Chromium/Linux only; zoom evidence uses CSS zoom rather than browser-chrome zoom; no measured novice comprehension, actual LeetCode submission, public delivery verification, native Safari/Firefox or screen-reader study. Custom expressions were code checks, not browser-input experiments. None of these limitations is presented as successful evidence beyond what was performed.
