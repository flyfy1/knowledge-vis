# Independent review: 591 Tag Validator

Candidate: `5db0780714661c1a294249e261b4fa2d7d7b8394`; URL: http://127.0.0.1:18780/leetcode/591/. Review date: 2026-10-25. Reviewer: this independent review run; exact model identifier unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen six dimensions and weights: 15/20/20/20/15/10. Applicable language preference: faithful official Python. No publication or human-comprehension claim.

## Cold walkthrough (recorded before source, tests, contracts, or previous reviews)

Only the frozen rubric was read before opening the candidate in headless Chromium through Playwright (real browser, desktop 1280×900). The page offers presets, not a custom string editor.

| Teaching step | Question and action | Observable result | Independent causal paraphrase |
|---|---|---|---|
| 01, pair of tags | What are input/output and validity? Read the tiny hand calculation `<A><B>x</B></A>`. | Boolean output; names 1–9 uppercase letters; one pair surrounds everything; A then B pending, B closes before A; empty content legal. | The next closing name is dictated by nesting, not merely the set of names. I calculate true. |
| 02, counts | Could equal counts suffice? Read `<A><B></A></B>` and the baseline explanation. | Counts match but B must close before A. Recursive parsing remembers unfinished outer calls; a stack replaces that ordered call chain. | A list preserves the unfinished nesting path; there is no asymptotic speedup over the already linear recursive baseline. The saved resource is dependence on recursive calls. |
| 03, pending path | What changes at each span? Press Process next span six times. | Frames: i=0, [] → i=3,[A] → i=6,[A,B] → i=7,[A,B] → i=11,[A] → i=15,[] → true at i=15. Full history grows each time. Before/after names and consumed underline are separately identified. | Opening pushes, text preserves, matching close pops. The end frame explicitly checks exhaustion and no unfinished tags. Cursor denotes next unconsumed character; highlights identify processed spans, not extra input. |
| 03, CDATA rule | What exempts apparent tags from parsing? Read the opaque-content example and invariant. | First `]]>` terminates CDATA; inside tags only; text/CDATA preserve the pending stack. | Apparent `</B><x>` inside CDATA cannot affect nesting. Once the root closes, any further character must fail. |
| 04, transfer prediction | Before revealing, predict `<R><![CDATA[</R>]]><S></S></R>`. | Prediction recorded here before clicking: **valid**, because the apparent root close is opaque; S then R close normally. | Tests transfer of the CDATA exception combined with ordinary nesting. Reveal result pending below. |
| 05, Python/cost | Read visible mapping and boundary/cost prose (source disclosure left closed). | `stack[-1]`, pop, CDATA-first matching, root-ended guard, and end check map to visible operations. O(n) time; O(d) valid-stack space; invalid oversized slice may use O(n). | Frame 4's `[A,B] → [A]` should execute a top equality check then pop. `find` avoids repeated scans by jumping beyond its result. Source audit remains pending. |

Fresh independently chosen code-check predictions, recorded before execution (no custom UI): `<Q><![CDATA[<Z>]]><T></T></Q>` should be true; changing the final closing to `</T>` should be false because Q remains top. Counterexample to “empty stack alone means valid”: `<Q></Q> ` should be false because a trailing space is outside the single root. Boundaries to verify include length-9 names, length-10 names, and maximum legal nesting under length 500.

Cold desktop screenshot: `591-evidence/591-review-1-c95c3e2e/cold-desktop.png`.

Cold continuation, still before source: chose the second prediction and revealed; UI confirmed true with `[R] → [R] → [R,S] → [R] → []` and explained where parsing resumes. Selected Crossed closes and jumped to verdict: frame 3/3, consumed 6/14, false, before/after `[A,B]` unchanged, rejected span `[6,10)` is `</A>`, message says top requires B and do not pop. Thus a rejection neither consumes nor corrupts pending state. Previous returned to frame 2; Reset returned to frame 0. This completes the cold browser walkthrough. All subsequent inspections are post-cold audit.

## Candidate identity and official contract

`git rev-parse HEAD` returned the requested revision. `git status --short` showed only this review report and this run's evidence directory as untracked. All nine fetched lesson/shared assets were byte-equal to the checkout. No implementation, author evidence, or earlier review was changed. No earlier 591 review report was present in the repository search.

| Asset | SHA-256 |
|---|---|
| index.html | 8017ceea765753296d8e0417cda12db964967190fc8ec62cae963f7d5e745a0b |
| app.js | 993e8cf0257acda8c016b4ccc1c0083361542c5679e645bee13929e360b1b3d0 |
| core.js | ca3b32823109600b909a6908e9e2b8f48ae12e2c58405c850e5692c431ba5567 |
| copy.js | 46360b29b8d0e265739f02b5c595d6a2c9661b9319ed1126009d676e2fe6515d |
| style.css | c7a51a6f4ae427b788302a624e1310178ab0b509614217396dcf555632a109c5 |
| solution.py | 7b444cc6a83ff75443f85cb89631be65ba718ee2d0cecd24e61e0b80b711f61a |
| python-code.js | 19f33317960e6a0ff890977a7eb7a46fc12a707191abfa735dfa5c3f46a4eff2 |
| ../common.js | f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b |
| ../style.css | 6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27 |

After the cold walk, read the [official statement](https://leetcode.com/problems/tag-validator/) through the web reader without bypassing access controls. It confirmed the single enclosing root, bounded uppercase names, nesting rules, first CDATA terminator, length 1–500, and permitted characters. Its three example verdicts are true/true/false. A separate normal Chromium visit encountered security verification; no bypass was attempted. The live language selector was therefore not available in that visit. Saved lesson-local `provenance/official.json` includes the Python3 stub `class Solution: def isValid(self, code: str) -> bool`, matching the canonical solution. The canonical language is faithful Python; no non-Python language contract or conceptual substitution applies. `LANGUAGE_FILES` was inspected: Python requires `solution.py`, `python-code.js`, and `PYTHON_SOURCE`.

`python3 -B scripts/register_leetcode_lesson.py 591 --validate-only` ran from the repository root and exited **0**, with no output. `lesson-entry.json` complexity is exactly one nonempty string: `O(n) time; O(n) auxiliary space worst case, O(d) stack for valid input`.

## Canonical code, correctness, and teaching observations

The explicit list invariant is sufficient: its names are precisely the unmatched openings, in nesting order. Every valid tag advances to the character after `>`; CDATA advances to after its first `]]>`; ordinary content advances by one character in Python. These transitions always increase i. A mismatch returns before pop. The root-ended guard rejects every suffix, including a space or a second root. Empty initial stack does not authorize arbitrary content: CDATA/text and unmatched closes reject independently. Exhaustion with pending names rejects. The defensive empty-string result is false and is clearly outside official constraints.

The cold frame for `</B>` maps directly to the canonical closing-tag branch: compare `stack[-1]` with `name`, then `stack.pop()`. i changes from 7 to 11 after that branch; `[A,B]` becomes `[A]`. The browser groups only ordinary text, as disclosed. Its `before` state is copied from the preceding frame, and its result stays undecided until an explicit acceptance/rejection frame. In the two-root preset, the first root's closing frame is allowed to show an empty stack before the next frame rejects the remaining characters; this agrees with the nearby explanation rather than contradicting the invariant.

The solution does not mutate its input string or retain state between calls. Each successful search skips its searched span, fixed prefixes cost O(1), bounded valid names require O(1) checking per tag, and at most one failing final search/slice occurs: O(n) time. Valid-stack storage is O(d), since each name has at most nine characters. An invalid unbounded name slice can temporarily use O(n), so the stated worst-case auxiliary bound is accurate. Teaching history is separately excluded from submission cost.

The teaching progression begins with actual pending names and values before introducing the stack. It defines top, push/pop, zero-based cursor, half-open intervals, and consumed versus rejected spans. The crossed-close counterexample exposes the tempting counting rule. The recursive baseline is honestly linear already; the explicit stack avoids interpreter call depth rather than claiming a nonexistent asymptotic speedup. Minor teaching friction: that baseline's call/return sequence is prose rather than a second concrete trace with parent/child cursor values. It does not prevent reconstruction of the canonical iterative mechanism. The fixed fresh exercise combines CDATA with a sibling child and tests transfer rather than simply repeating the default trace.

### Independently selected executed cases

Executed the actual `solution.py` through `importlib` with `python3 -B`, not a translated trace. All 18 independently selected expectations passed. They included the three predictions recorded before execution above; legal nine-letter and illegal ten-letter names; a 500-character string with 71 nested A tags and three text characters; a 500-character root with 493 text characters; first-terminator handling with `]]>` left as ordinary content; a second root after CDATA; malformed CDATA prefix; two sibling B tags; empty input; unfinished root; leading text; missing closing `>`; lowercase child; self-closing syntax; and malformed closing name. Every call returned the expected Boolean, input strings remained equal to their saved values, and interleaved calls on the same Solution instance still accepted `<A></A>`.

Independently computed preset expectations and browser endpoints agreed in both locales:

| Preset | Expected result and reason |
|---|---|
| Nested tags | true: B then A close |
| Crossed closes | false: A cannot close while B is top |
| CDATA hides tags | true: apparent tags are opaque |
| Two roots | false: suffix remains after root |
| Unterminated CDATA | false: no terminator |
| Ten-letter name | false: exceeds 9 |
| Ordinary > content | true: `>` alone is ordinary content |
| Unclosed tag | false: A remains pending at exhaustion |
| Empty content | true: matching empty pair |
| CDATA outside root | false: no enclosing tag |

## Browser, localization, device, and source evidence

Inspected all three test entrypoints and the core helper **before** running them. Every generated output was redirected with `LESSON_EVIDENCE_DIR="$PWD/specs/reviews/591-evidence/591-review-1-c95c3e2e"`; no tracked candidate evidence was regenerated. Commands and observed results:

- `python3 -B leetcode/591/tests/check.py`: exit 0; canonical Python versus structurally different recursive grammar parser, 26,177 cases, 70,202 JS snapshots, 21 named boundaries and three official examples. Intermediate assertions check copied before-state, pushes/pops, rejection cursor retention, first CDATA terminator, and endpoint exhaustion. These are rerun author tests, supplementary to the independent hand checks, not inferred teaching scores.
- `node leetcode/591/tests/browser.cjs`: exit 0; 78 rendered frames across both languages, 10 presets each; no page/console/request errors; rewind/replay, reset/endpoints, range Home/End/arrows, radio/reveal keyboard actions, locale/preset preservation, source disclosure, clipboard success/failure, downloads, links, blocked storage and offline source display passed.
- `node leetcode/591/tests/accessibility.cjs`: exit 0; focused operation-table horizontal arrow scrolling, 48px controls, both locale invariant bindings, and 200% CSS zoom at 320/390/1440 widths passed.

The script-generated JSON files retain their original `author self-check` labels: they are fresh outputs of those scripts, not imported author evidence or claims of a separate reviewer. The fresh source audit and observations in this report establish this review's judgment.

Additional independent browser checks verified:

- At Crossed closes frame 3, switching EN → Chinese preserved preset, cursor, both `[A,B]` values, selected prediction and feedback. The Chinese mismatch message explicitly says closing A requires B and does not pop. The full formula rendered ordered pending names plus `i = 0` or nonempty stack, equivalent to English.
- Switching a revealed answer to another radio hid stale feedback. Revealing the wrong answer rendered the incorrect-prediction message followed by the correct CDATA reasoning in Chinese. Changing the trace preset retained that separate fixed-input quiz, exactly as the visible instruction promises.
- At CDATA frame 2/4, i=22/26 and `[A] → [A]`; the Chinese message says skip through the first terminator, with no stack change. Switching to English preserved frame 2 and the equivalent explanation.
- Keyboard range arrows reached default frame 2 with `[A] → [A,B]`. Reset/end/previous disabled states match endpoints. Disabled controls have solid readable muted text and dashed borders, not opacity-faded essential labels.
- Exact canonical parity holds for decoded mirror, displayed `textContent`, successful clipboard, fallback textarea, and downloaded bytes, including final newline. Independently forced clipboard write failure in each locale and pressed **Ctrl+C** on the automatically selected textarea; native clipboard readback equaled all **1,313 characters**. This verifies usable manual copy, beyond merely showing a textarea.
- `copy.js` was checked before object parsing for duplicate definition keys; all 91 unique keys have two strings. `common.js` consumes `[zh,en]`. Representative algorithm messages and quiz feedback were checked semantically, separately from copy-fallback status text.

Captured and visually inspected 320/390 phone-width and desktop screenshots in both locales, plus 200% zoom views, ten-letter identifiers, dense mismatch history, and nonempty intermediate stacks. Representative evidence: `en-320-trace.png`, `zh-320-trace.png`, `en-390-trace.png`, `zh-390-trace.png`, `en-1440-trace.png`, `en-mismatch-ledger.png`, `zh-mismatch-ledger.png`, `independent-zh-cdata-390.png`, `en-320-long-name.png`, `zh-390-long-name.png`, `en-zoom200.png`, `zh-zoom200.png`, `en-320-zoom200-header.png`, `zh-390-zoom200-header.png`, and both `*-320-zoom200-middle.png` / `*-320-ledger-right.png` files.

The screenshots show wrapped source/input and before/after labels without intersecting text. Narrow tables intentionally scroll horizontally and identify that behavior immediately above them; keyboard scrolling reached the rightmost stack column (600px table, 258px visible width at 320). This requires some horizontal navigation to associate a history row's three columns, a minor device friction. The main before/after state remains available above the table. At 200% zoom the nonempty before/after values reflow vertically and remain legible; ordinary vertical scrolling reveals surrounding headings. Viewport-edge truncation of the scrollable navigation/table is not a label/value collision. Tested palette text/background combinations have minimum contrast 6.34:1; disabled muted text on its panel is 6.45:1. Focus outlines, forced colors and reduced motion were exercised.

## Findings, scores, and conclusion

Required findings: **none**. Required open IDs: **none**. There are no earlier required findings to close for 591. The two minor frictions above are score rationale, not missing essential causal explanations or inaccessible content.

| Dimension | Score | Weight | Rationale |
|---|---:|---:|---|
| Problem/terms/hand calculation | 4 | 15 | Tiny nested calculation precedes abstraction; input, Boolean result, names, root and content rules are concrete. |
| Derivation/saved work | 3 | 20 | Counting counterexample and call-chain-to-list bridge reconstructable; recursive baseline has prose rather than concrete cursor/call-return values. |
| Maintained state/correctness | 4 | 20 | Explicit pending-path invariant; actual before/after states, rejection retention, root boundary and termination independently checked. |
| Interaction/visual meaning | 4 | 20 | Prediction/reveal/change, history, controls and highlighting behave consistently with stated snapshot semantics. |
| Python/cost | 4 | 15 | Faithful callable executed on fresh cases; transition mapping, mutation behavior, accurate costs and exact source parity checked. |
| Bilingual/device | 3 | 10 | Equivalent rendered reasoning and preserved state; keyboard/phone/zoom readable, with horizontal history navigation friction. |

Weighted score: **92.5/100**. All dimensions are at least 3, no required fix is open, and the applicable evidence is complete. **Accepted for this frozen revision and review scope.** This does not authorize or establish publication.

Limitations: headless desktop Chromium with emulated viewport widths and Chromium CSS zoom at 200%, not physical phones or OS/native browser-menu zoom; no real novice teach-back, LeetCode execution/submission, production deployment, or screen-reader study. Official statement was accessible through the web reader, but the separate live Chromium language-selector visit was security-blocked; saved official Python stub evidence and executable source were inspected. No access bypass, author-note substitution, or non-Python exception was used.
