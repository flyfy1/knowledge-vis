# Independent review: 68 Text Justification

Candidate: `9cb2e5e32c75cde4be6eec1ee9e4f6a65e144c76`. URL: http://127.0.0.1:18772/leetcode/68/. Review date: 2026-10-18. Reviewer: this independent review run; exact model identifier unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen weights: 15/20/20/20/15/10; canonical Python interpretation. No implementation, brief, tests, author notes or prior reviews were opened before this saved cold record.

## Cold browser walkthrough (saved before source audit)

Real Chromium through Playwright; desktop 1440×1000. Read visible English page in order. Screenshots: `68-evidence/68-review-1-ce6dec0e/cold-desktop.png`, `cold-end-reveal.png` (captured; inspected). Each row records question → action → observed result → causal paraphrase.

| Teaching step/question | Action and visible observation | My causal conclusion |
|---|---|---|
| 01: What goes on the first line? | Read the tiny a/bb/c/dddd width-8 hand calculation before formulas. Minimum widths 1,4,6,11; result a··bb··c and dddd····. | Greedy chooses the longest consecutive fitting prefix; spaces count toward width, order and whole words are preserved. |
| 02: Where do leftover spaces go? | Read aa/b/cc at width 8: L=5, g=2, S=3, q=1,r=1; aa··b·cc. Compared explicitly with the wrong right-heavy alternative and final a·b·····. | Divide spaces across gaps; remainder goes left. Final and singleton lines are separate cases, avoiding division by zero. The baseline assigns spaces individually; direct gap counts remove bookkeeping, not output-writing cost. |
| 03 / operation 0: What state starts the trace? | Saw empty current group, L=0, no test/output. | No word is accepted or emitted yet. |
| operation 1: Will a fit? | Next: candidate a, needed 0+1+0=1, group still empty. | Testing precedes mutation. |
| operation 2: What changes on acceptance? | Next: a passed, group a, L=1, no output. | Acceptance updates letters and group, not result. |
| operation 3: Will bb fit? | Next: candidate bb, needed 1+2+1=4, group a. | New word needs one gap per already accepted word. |
| operation 4: What is retained? | Next: a/bb, L=3, no output. | Accepted letters accumulate; output waits until grouping finishes. |
| operation 5: Will c fit? | Next: candidate c, needed 3+1+2=6. | Two minimum gaps allow this third word. |
| operation 6: What does acceptance preserve? | Next: a/bb/c, L=4. | Consecutive words remain in order and minimum width 6≤8. |
| operation 7: Why reject dddd? | Next: needed 4+4+3=11>8, group unchanged. | Adding more words cannot rescue overflow; stop before this word. |
| operation 8: How is the line emitted? | Next: L=4,g=2,S=4,q=2,r=0; retained a··bb··c, length 8. | Both gaps receive 2 spaces and the completed output is retained. |
| operation 9: Is the rejected word lost? | Next: candidate dddd, empty group, needed 4; first line retained. | Rejected word becomes the next line's first word. |
| operation 10: What is accepted next? | Next: group dddd,L=4; first line unchanged. | Acceptance operates on the new group only. |
| operation 11: How does final-line spacing differ? | Next: final g=0,S=4; dddd···· added to output. | Final line pads right, no division by zero. |
| operation 12: Why stop? | Next: empty group, both output lines retained, Done. | Every input word has been consumed exactly once. |
| Width comparison | Before change I predict width 7 keeps the same grouping, gaps 2 and 1, final padding 3. Set width 7 (reset), scrub to end: a··bb·c / dddd···. Reveal and selected exercise choice persisted. | Width affects grouping test and gap allocation; it resets the trace but preserves the separate exercise. |
| 04: Transfer prediction | Before clicking reveal: predict C, red··a·bb / cc·······. First group letters 6 and 2 gaps fit 8; four words need 11>9; 3 spaces split 2/1. Select C, reveal: visible correct explanation matches calculation and rejects trailing/internal and right-heavy mistakes. | The exercise requires combining maximal prefix with remainder allocation rather than recalling the tiny example. |
| 05: Why correct and what does Python mean? | Read invariant proof, i/j/letters mapping, quotient identity and cost paragraph; expanded code reserved for later audit. | j points beyond accepted words; i=j consumes a nonempty group; result matches retained history. O(n+mW) includes writing all output; snapshots have separate costs. |

Fresh independently chosen code-check predictions (UI offers presets only): words=["ab","c","d","efg"], W=7 → ["ab  c d","efg    "]. Wrong rule counterexample: words=["ab","c"], W=7 must be ["ab c   "], not ["ab    c"]: the final line does not fully distribute spaces. Predictions recorded here before execution/reveal of these inputs. Later checks must be labelled code checks.

Cold inference: the page itself supplies the causal explanation; no author notes were needed. Visible trace differentiates candidate testing, group mutation and output emission. No human-comprehension or online-submission claim is made.

## Source and interaction audit

The following audit was performed after saving the cold record above.

### Candidate identity and official contract

`git rev-parse HEAD` equals the requested revision. Tracked working tree is clean; only this report and its exclusive evidence directory were added. Served bytes for index.html, app.js, core.js, copy.js, python-code.js, solution.py, local style.css, ../common.js and ../style.css exactly equal the checkout. Representative SHA-256: index `4a1926046e4ddb4513219e9b122f1d7ea3dbf05f650cfbb824b231dc91471c69`; core `52d21310509cf35d285669f9b44847f46bf8b4fa29cbc2f535ac2ce76af779a8`; Python `700458b2fe8abbed3ffef25e562bb8612a5f89878d03f0d41eccf80c9c22bbf1`; source mirror `5d167e6676140f634e67b442f0ab6aae8a33c04960bda874350e64d76b7ffddd`.

Read the [official statement](https://leetcode.com/problems/text-justification/) normally with the web reader after the cold record; it was accessible. Confirmed greedy packing, even spacing with left preference, final-line exception, nonempty words and array, and all numerical constraints against the lesson. Read the local official GraphQL evidence: its Python3 snippet declares `Solution.fullJustify(self, words: list[str], maxWidth: int) -> list[str]`, identical to canonical callable shape. No non-Python contract or conceptual analogy is used; `language-contract.json` exception audit is inapplicable. `LANGUAGE_FILES` in scripts/register_leetcode_lesson.py identifies solution.py / python-code.js / PYTHON_SOURCE, all checked here. No claim of live selector inspection is made for Python.

No earlier review report for problem 68 was found in specs/reviews after the cold walkthrough, so there are no earlier required findings to close. Author SELF-CHECK was read only afterward and treated as claims to verify.

### Executed code, semantics and boundaries

Inspected test_solution.py, test_core.cjs, browser.cjs, supplement.cjs and capture.cjs before running. They write artifacts; every execution used `LESSON_TEST_OUTPUT_DIR=$PWD/specs/reviews/68-evidence/68-review-1-ce6dec0e`. Python bytecode writes were disabled. No tracked author assets/evidence were regenerated. Tests use canonical solution.py directly, not merely the simulation. Reused browser result JSON retains its script's author-self-check note; this report attributes only the actual executions and independent observations made in this review.

- Canonical suite passed 2,753 cases: three exact official examples; exhaustive small length/width combinations; seeded random and upper-bound cases. Checked the enumerating oracle implementation before running: it enumerates legal endpoints and positive gap compositions, then minimizes spread and prefers larger left gaps. Larger inputs use per-space allocation. Those are meaningfully different from quotient/remainder construction.
- Independent fresh **code checks**, not UI experiments: both pre-recorded predictions matched exactly: `["ab  c d", "efg    "]` at width 7 and `["ab c   "]` for the final-line counterexample. Additional direct expectations passed for exact-width singleton nonfinal lines (`abc/def`, width 3), `a/b/c/d` at width 4 → `["a  b","c d "]`, and `!` at width 1.
- Independently executed another 1,200 random valid cases, seed 681897, with 1–300 words and widths 1–100. Rather than reproducing divmod, checked output width, original word sequence, maximal next-word exclusion, final/singleton right padding, nonfinal absence of edge padding, positive gaps in descending order differing by at most one. Input list equality before/after held. These constraints uniquely specify the required output.
- Core suite passed 240,632 snapshots across 2,760 runs against executed Python fixtures. Inspected checks establish exact letter sum over [i,j), accepted-group width bound, test arithmetic, emitted-line maximality, quotient identity and remainder bounds, retained-output prefix, and replay determinism. Tests cover width 1, width 100, 300 words and 20-character words. Invalid empty/oversized words are outside the official contract, not acceptance gaps.

Specific visible-to-code mapping: operation 5 has i=0,j=2,letters=3; the loop condition computes 3+len("c")+2=6≤8 while retaining group a/bb. Executing the loop body adds 1 and increments j to 3 (operation 6, letters=4). The next test computes 4+4+3=11 and fails without consuming dddd. `gaps=2`, `divmod(8-4,2)=(2,0)`, and pieces/join create `a  bb  c` (operation 8). `i=j=3` starts the next group, preserving result. The browser has an explicit test snapshot separate from acceptance; Python's condition/body supply the same before/after semantics without a stored test frame. At trace end the simulation's j=i=4, letters=0, empty group matches its Done presentation; historical passed labels refer to accepted input, not current group membership.

Correctness: each group starts with a guaranteed fitting word; successful tests preserve consecutive order and minimum-width fit. The first failing next word proves maximality since every extension increases needed width. The two emission branches cover final/one-word and nonfinal multiword groups, use exactly W characters, and distribute extras only to leftmost gaps. `i=j>old_i` proves progress and termination. No input mutation occurs; slices and strings are new values.

Cost audit: at most one successful test per word and one failing test per nonfinal line; slices/pieces/join and padding write O(W) per output line. Hence O(n+mW) time, O(mW) returned characters, O(W) peak temporary storage excluding output (word references, gap strings and line construction are bounded by line width). The space-assignment baseline avoids no output-writing lower bound; the page correctly limits its improvement claim to direct allocation bookkeeping. The simulation's copied output history has greater storage/time costs and is explicitly distinguished.

### Browser, language and access observations

The inspected browser suite completed 33 grouped checks with zero page errors or failed asset responses. Both locales and all seven presets were traversed forward and backward, with full message/history equality after replay. Start disables Previous and Restart; end disables Next. Reset and keyboard Home/End reach endpoints. Changing width/preset restarts the trace. Additional independent replay of emit operation 8 → Previous removed output → Next restored the exact same retained line. English-to-Chinese switching preserved position 8; Chinese emission stated L=4,g=2,S=4,q=2,r=0. Keyboard Enter advanced a focused Next button in a separate check.

All three prediction choices were revealed in each language; changed choice cleared feedback before reveal. Selected choice and revealed state survived locale switches. Width change after the cold C reveal preserved that selection and explanation. Source details remain usable in Chinese. Read bilingual copy for problem, baseline, invariant, final/singleton exceptions, proof, cost and feedback: the same causal reasoning and quantities are present; no material translation difference found. Key/placeholder equality was additionally executed, but is not the basis of the reasoning-equivalence judgment.

Source parity: local mirror decoded exactly equals solution.py; displayed code, successful copied text, denied-clipboard fallback textarea (full text selected and focused), and actual downloaded bytes all equal it. Supplemental run exercised native browser clipboard permissions/readback, width-100 output containment in both locales, and source display with solution.py requests blocked. The downloadable file remains real Python and the page clearly labels its trace as simulation.

Device checks: EN/ZH at 320,390,736,1440 CSS pixels had no document overflow; navigation scrolls within its own row. Width-100 output scrolls in a focusable, labelled local region rather than widening the document. Keyboard Enter, slider Home/End and 3px focus outlines worked. Tested blocked localStorage, reduced motion and forced colors. Measured buttons/selects were at least 48×48 CSS px. Both languages at 780px with 200% CSS zoom remained contained. Contrast measured from rendered styles: body 16.09:1, hints 7.08:1, readout 13.40:1, primary/selected 13.10:1, disabled Previous 6.45:1; focus orange against panel 8.94:1. Disabled controls remained legible; candidate/passed also have text labels, so color is not the sole encoding.

Captured and visually inspected cold desktop/end-reveal, focused-en-390.png, focused-zh-320.png, focused-en-zoom200.png, focused-zh-zoom200.png and source-zh-390.png. Text and arithmetic wrap legibly; chips remain distinct; remainder output aa··b·cc is readable at zoom. Mobile source wraps long lines, with normal indentation retained. The navigation is horizontally clipped by design with scrolling, not lost essential lesson text. Additional suite screenshots and JSON results are in this run's exclusive directory. Related links and target anchors resolved; step navigation clears the sticky bar.

### Findings and scores

Required open finding IDs: **none**. No mathematical, causal, visual, interaction, translation or executable-evidence blocker was observed.

Optional stable observation **68-N1** (low; open suggestion, not required): at revision above, both locales, section 05 expanded Python, any viewport/input, inspect `q + (k - i < r)`. Expected for maximum novice clarity: say that Python treats True as 1 and False as 0 here. Actual: the page explains the remainder comparison but leaves its numeric conversion implicit. Source and all remainder tests establish correctness. Owner/next action: lesson author may add one sentence; no fix revision or closure claimed. This is minor transfer friction under dimension five, not a missing algorithmic causal bridge.

| Dimension | Score | Weight | Observation/rationale |
|---|---:|---:|---|
| Problem/terms/hand calculation | 4 | 15 | Concrete tiny example precedes abstraction; all input/output units, contract boundaries and a full manual result are reconstructable. |
| Derivation/saved work | 4 | 20 | Packing exclusion, quotient/remainder distribution and left preference have numerical reasons; direct allocation's savings and output lower bound are honestly stated. |
| State/correctness | 4 | 20 | Test-before-mutation trace, retained output, maximality invariant, separate exceptions and progress argument agree with executable source. |
| Interaction/visual meaning | 4 | 20 | Prediction/reveal/change, all operations and replay/endpoints work; labels distinguish candidate/accepted data and retained output; fresh exercise tests transfer. |
| Python/cost | 3 | 15 | Faithful executable Python, exact source parity, fresh cases, mutation and real cost verified; boolean arithmetic deserves a small novice explanation (68-N1). |
| Bilingual/device | 4 | 10 | Equivalent reasoning in EN/ZH; narrow/desktop/zoom layouts, keyboard, source fallback, focus and readable disabled states checked. |

Weighted total: **96.25/100**. Every dimension ≥3, no required open findings, and browser/source/execution evidence complete for this scope. **Accepted** for candidate `9cb2e5e32c75cde4be6eec1ee9e4f6a65e144c76` as an independent lesson review, separate from publication.

Limitations: synthetic Chromium viewports and CSS zoom, no physical device or browser-toolbar zoom observation; no measured novice learning, human teach-back, screen-reader session, production delivery check or successful LeetCode submission. Official statement was read live; Python interface corroborated with saved official snippet rather than a live editor selector. No model/verifier identity beyond this run is asserted. Only this exact report and exclusive evidence directory were written.
