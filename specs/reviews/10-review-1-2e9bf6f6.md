# Independent review: 10 — Regular Expression Matching

Candidate: `0db278d18ea45fd7a5c0b61628b852938e503b21`. URL: http://127.0.0.1:18770/leetcode/10/ . Review date: 2026-10-18. Reviewer: independent fresh-context agent run; exact model identity unavailable. Target reader: basic Python, lists, loops, functions, elementary recursion. Frozen rubric: `specs/leetcode-review-gates.md`; weights 15/20/20/20/15/10. Python is the applicable preferred canonical language. This is a review, separate from publication.

## Cold browser walkthrough — saved before source audit

Only the frozen rubric was read before opening the lesson with real Playwright Chromium. No brief, source files, tests, previous review, or author notes were opened. The following records my browser observations and reasoning before source inspection. Full-page captures: `cold-desktop.png`, `cold-endpoint.png`, `cold-expanded.png` in this run's exclusive evidence directory.

| Teaching step / question | Action | Observable result | My causal paraphrase |
| --- | --- | --- | --- |
| 01: What are we finding? | Read the statement and work the tiny example manually. | Whole-string matching; letters, dot, and preceding-atom star are distinguished. Lengths 1–20 and valid preceding atoms are stated. `aab/c*a*b` consumes zero c, two a, one b; `aa/a` fails. | The output is a Boolean about both complete strings, not substring search. Star permits zero copies and cannot change its atom. |
| 01: What baseline work can be saved? | Read the displayed recursive baseline and accompanying paragraph. | The code tries skipping an atom-star group or consuming a compatible character; text says paths revisit prefix combinations and slicing copies strings. | Branching revisits equivalent subproblems, so storing each pair can replace repeated search. No concrete pair of converging recursive paths is actually worked through here; the baseline processes suffixes whereas the table uses prefixes. |
| 02: Why these dependencies? | Read the DP definition, cases, and ordering. | Ordinary atom uses diagonal; star uses two-left or compatible-character plus above; keeping j permits repetition. Empty-prefix origin is true. | Partition by whether the final star group contributes zero characters or consumes the last character. These cases preserve complete-prefix matching; earlier rows and left cells are already known. Prefix lengths differ from character indices. |
| 03: What changes in one operation? | Predict `aab/c*a*b` true, then execute all 23 next operations individually. | One table cell becomes T/F each time; existing cells persist; cyan current and orange dependency border are separate from values. End is `dp[3][5]=T`, with Next disabled. | Each action establishes one complete-prefix result using already established dependencies. The completed table is accumulated data, while highlighting describes the current operation. |
| 03: What exactly was retained? | Seek event 17 and open Previous state, focused Python, and Recent operations. | Previous table has `dp[2][4]=·`; current has T. Above `(1,4)=T`, two-left `(2,2)=F`. Focused code is `dp[i][j] = dp[i][j - 2] or (matches and dp[i - 1][j])`; history lists events 12–17. | At s character a and pattern atom a, `F or (True and T)` establishes T. The previous snapshot is before this operation; retained log explains recent operations, rather than rerunning the input. |
| 04: Can I predict a new grouping? | Before reveal predict `ab/a*b*` true by one a and one b; select that reasoning and check. Then change to the first wrong choice and reveal again. | Correct feedback explicitly reaches `dp[2][4]`; changing choice restores unrevealed feedback; wrong feedback says zero, one, or more are allowed. | A group can consume exactly one; repetition does not require two. The other tempting answer, a* consuming ab, violates atom compatibility. |
| 05: How does this become Python? | Open complete solution and compare mapping table with event 17. | Python allocates separate rows, initializes empty-prefix matches, loops i then j, and returns bottom-right; O(mn) time/space stated. | i/j index prefix lengths, so character lookup uses i−1/j−1 and the star atom j−2. This is a bounded rectangular computation, and input strings are read rather than mutated. |
| Bilingual reasoning | Switch to Chinese after wrong prediction. | Statement, example, recurrence, feedback, controls, mapping, and cost are translated with equivalent mathematical meaning. | The Chinese explanation retains the same zero/positive-repeat partition, complete-match invariant, and atom-compatibility restriction. |

### Every computed operation in the cold trace

For each row below the question was “what does this prefix pair match?”, the action was one Next click (except initial event 0), and the observation was the new T/F at the given coordinate. My causal conclusions are recorded individually.

| Event | Visible cell/value | Causal conclusion |
| --- | --- | --- |
| 0 | (0,0) T | Empty matches empty. |
| 1 | (1,0) F | Nonempty a cannot match no pattern. |
| 2 | (2,0) F | Nonempty aa cannot match no pattern. |
| 3 | (3,0) F | Nonempty aab cannot match no pattern. |
| 4 | (0,1) F | Literal c cannot vanish. |
| 5 | (0,2) T | c* can vanish, inheriting origin. |
| 6 | (0,3) F | The final unstarred a cannot vanish. |
| 7 | (0,4) T | a* can vanish after c* vanishes. |
| 8 | (0,5) F | Final b cannot vanish. |
| 9 | (1,1) F | a is incompatible with c. |
| 10 | (1,2) F | Skipping c* leaves nonempty a; repeating c is incompatible. |
| 11 | (1,3) T | a matches a and the diagonal empty/c* is true. |
| 12 | (1,4) T | Compatible a can repeat from true empty/c*a*. |
| 13 | (1,5) F | a is incompatible with b. |
| 14 | (2,1) F | Final a is incompatible with c. |
| 15 | (2,2) F | c* cannot consume either a, nor can skipping it match aa. |
| 16 | (2,3) F | Compatibility alone is insufficient: diagonal a/c* is false. |
| 17 | (2,4) T | Repeat a from true a/c*a*, while zero-repeat branch is false. |
| 18 | (2,5) F | a is incompatible with b. |
| 19 | (3,1) F | b is incompatible with c. |
| 20 | (3,2) F | Neither skipping nor repeating c can finish aab. |
| 21 | (3,3) F | b is incompatible with a. |
| 22 | (3,4) F | b cannot repeat a; two-left is also false. |
| 23 | (3,5) T | b matches b and the diagonal aa/c*a* is true. |

### Independent predictions recorded before source execution

The UI offers four presets only; no custom input entry is available. These will therefore be **code checks**, not custom-input UI experiments:

- Fresh small input `s="ba", p="b*a"`: predict true. At final a, the diagonal b/b* must be true after one repeat of b; then a matches literally.
- Counterexample `s="ba", p="b*"`: predict false. A tempting rule that blindly inherits the cell above would return true; the final a is incompatible with b, and skipping b* leaves nonempty text. This excludes treating star as an arbitrary-string wildcard.

Cold walkthrough saved at this point, before opening implementation or earlier findings. Source audit and scored conclusion follow below.

## Post-cold source and executable audit

HEAD was exactly the candidate revision. `git status --short` showed only this report and this problem's evidence directory as untracked. Ten resources served by the preview were byte-identical to the checked-out files, including the HTML and every loaded script/style. No implementation, service, test, or prior evidence was changed.

Representative SHA-256 build identifiers:

| Resource | SHA-256 |
| --- | --- |
| `leetcode/10/index.html` | `e6618be70c2a0bb0be85c33b7d7a883097d19ff440fe12e930cc93195885dee0` |
| `leetcode/10/copy.js` | `21bedf515f09335d7d5bf6f517960eb628d516312ee308b4b532e309f2beace6` |
| `leetcode/10/solution.py` | `03b2bcca31b3c8e610c877a36cc5b99821f60c0c19fe0dc8a3f1bdd0ec71b1e8` |
| `leetcode/10/python-code.js` | `81a87a50ad14a91871b442ab3f29c39d7c0793d914902513792f8cadfdefbd4f` |
| `leetcode/hard-first-ten/core.js` | `342d7cbdf8c1e6f8527e6804ec286157e8fc63513a3c36c61d67c496bd08eeed` |
| `leetcode/hard-first-ten/lesson.js` | `18365da600d3a774aec9afb96deb377fa269fe894424ed6cef41ad9f929c9731` |

The [official statement](https://leetcode.com/problems/regular-expression-matching/) was read normally through the web tool. It confirms full-string Boolean matching, dot as one character, star as repetition of the preceding element, lengths 1–20, lowercase text, and a valid predecessor for each star. No access restriction was bypassed. The canonical callable is the faithful `Solution.isMatch(self, s: str, p: str) -> bool`. There is no non-Python language substitution or conceptual-only submission claim here; a non-Python language contract is not applicable.

Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python's exact names are `solution.py`, `python-code.js`, `PYTHON_SOURCE`. Parsed the mirror assignment and compared exact strings against canonical source. Browser textContent, successful clipboard readback, and the actual download stream all matched canonical bytes, including trailing newline. A file-URL offline page also displayed identical code and advanced its experiment.

Inspected the relevant portions of `leetcode/tests/test_hard_solutions.py`, `test_hard_core.cjs`, and `test_hard_browser.cjs` before executing any checks. These scripts combine ten lessons; their aggregate counts are author claims, not my review evidence. The Python script's regex coverage is exhaustive small cases plus a maximum-size case; randomized regex traces are present in the JS test. The browser script can write screenshots when configured. I did not execute those broad suites or regenerate their outputs. Instead I executed inline, lesson-10-only independent checks; screenshots were explicitly directed to this run's directory. An initial `python` invocation found no executable; all reported Python results came from the successful `python3` rerun with bytecode writing disabled.

### Independently observed computational results

- Executed the actual `leetcode/10/solution.py` using `runpy`, not the model or a copied replacement. All 8,029 combinations of binary strings of lengths 0–4 and patterns of 0–3 atoms from `{a,b,.,a*,b*,.*}` agreed with Python `re.fullmatch`. Empty strings here are extra recurrence robustness checks, not official input claims.
- The pre-recorded fresh code case `ba/b*a` returned **true**; the counterexample `ba/b*` returned **false**. For the latter, matching b establishes true above, but the next a makes `matches=False`; neither skipping nor repeating can finish. These were code checks because the UI is preset-only.
- Independently checked `a/ab*` true (zero trailing repeats), `a/.` true, `a/b` false, empty/empty true, empty/`a*b*` true, and `a`/empty false. At official maximum lengths, 20 a characters matched ten `a*` groups and twenty dots; 19 a plus b failed against ten `a*` groups, and twenty a failed against nineteen dots plus b.
- Traced the actual Python frame after the event-17 assignment: `dp[2][2]=False`, `dp[1][4]=True`, `dp[2][4]=True`. This independently confirms the visible `False or (True and True)` transition.
- Independently checked 88 JS model inputs, including the fresh cases and empty-prefix boundaries. Compared 6,062 already-computed prefix values to an independent anchored regex oracle. Every dependency was known before use, each successive frame changed exactly one matrix value, input arrays remained unchanged, and mutating the final snapshot left the initial snapshot intact when distinct frames existed.
- Invariant: each computed entry correctly describes full matching of `s[:i]` and `p[:j]`; uncomputed entries are null/·. Non-star transitions remove both final characters; zero repeats remove the final atom-star pair; positive repeats remove one compatible text character while retaining the group. All dependencies decrease a coordinate. Finite row-major loops terminate and return the complete-input entry.
- Canonical Python creates distinct list rows, never changes its immutable input strings, and does no recursive calls or slicing. It initializes `(m+1)(n+1)` entries, fills mn cells with constant-size comparisons, and uses O(mn) time and space for positive official lengths. JS recording stores whole matrices per frame and therefore has a higher visualization storage cost; the lesson's stated O(mn) refers to its canonical Python algorithm.
- Trace initialization emits pedagogical explicit false assignments for the first column and non-star empty-row entries that Python gets from allocation. This is semantically equivalent, although not a literal Python line-by-line execution. The UI explicitly says its browser model is JavaScript.

## Interaction, bilingual, and access observations

Real Chromium used `require('playwright')` through the environment's NODE_PATH and `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when set. No page errors occurred in the main audited browser page.

- Both locales and all four presets reached independently expected endpoints: `aab/c*a*b` true; `aa/a` false; `ab/.*` true; `ab/a*` false. Rewind/forward reproduced exact snapshots; reset restored the initial frame; preset change restarted at zero. Initial Previous and final Next were disabled. Before-state event 17 differed from current only at `(2,4)`, and recent history retained six operations.
- All three predictions in both languages hid stale feedback upon choice change and required explicit reveal. Wrong explanations distinguish mandatory repetition from atom incompatibility; the right explanation reaches the full-input cell. This is a small transfer exercise rather than a repeated answer from a preset.
- At event 17 with a revealed quiz, switching languages preserved the entire serialized lesson snapshot, including preset, frame, choice and reveal state, and focus stayed on the language toggle. Resizing preserved it too. Mathematical explanations in `copy.js` and frame captions were checked in both languages; no material translation difference found.
- Keyboard Home/End and ArrowRight operated the event range; Space rewound, Enter advanced. Native select/radio controls and expandable summaries are keyboard-operable. A settled 390px deep-link check put the heading at y=154.4 below the sticky nav bottom y=58.5; desktop heading was y=104.7. Some immediate captures were taken during scrolling and show a transient sticky overlap; the settled geometry was separately verified rather than treating the screenshot artifact as a defect.
- Both languages at 320, 390, and 1440 CSS pixels had page scroll widths exactly equal to viewport widths. DP values remained 13px; complete code has its own horizontal scrolling. The table fit even at 320px. Controls wrapped into readable rows; the horizontally scrollable step navigation retains its complete labels. Visual inspection covered `en-320.png`, `zh-390.png`, `cold-expanded.png`, `cold-endpoint.png`, and `en-200-percent.png`, plus native-size 390px endpoint/start captures.
- Tested 200% layout magnification with Chromium CSS root `zoom=2` at 1440px; the page retained width 1440 without document overflow, controls reflowed, and content remained available. This is actual doubled element/layout size, but not browser-menu zoom; that precise browser-UI mechanism was not exercised in headless Chromium. The dedicated 320/390 checks independently cover narrower reflow.
- Clipboard and local-storage denial did not prevent lesson operation. Copy failure exposed and focused a selectable textarea containing exact canonical source; its status and label translated to Chinese. Successful clipboard and actual download parity were checked separately.
- Measured muted body/table-header contrast on the stage at about **7.08:1**, and normal primary-button contrast at **13.10:1**. Computed disabled opacity is 0.4: composited primary text/background is about **3.11:1**, secondary about **3.30:1**. Native-size inspection found those disabled labels readable but visibly subdued. Treat this as minor friction; inactive controls are not being misreported as a normal-text WCAG failure. Current cyan and dependency orange borders are distinguishable, and T/F/· convey values independently of color.

Screenshot directory (exclusive to this run): `specs/reviews/10-evidence/10-review-1-2e9bf6f6/`. It includes the cold captures, both locales at all three requested widths, the 200% layout capture, manual-copy fallback, and focused/settled 390px captures. Earlier screenshots were neither overwritten nor regenerated.

## Required finding

### 10-DER-01 — Repeated-work optimization is asserted without a worked causal bridge

- **Status / severity:** open; medium; required teaching fix. No fix revision or closure evidence exists in this review.
- **Candidate / location:** `0db278d18ea45fd7a5c0b61628b852938e503b21`, sections 01–02, both English and Chinese; reproducible at 1440×1000 and 390×1000, default preset `aab/c*a*b`.
- **Reproduction:** Open the lesson, read the recursive baseline and its cost paragraph, then continue to “Why can we skip work?”. No other action or source reading is necessary.
- **Expected:** For the stated basic-Python reader, show at least one small concrete overlap: two branch paths reaching the same remaining-input pair, the work that is repeated, and why a single stored result suffices. Explain the change from the displayed baseline's suffix inputs to the prefix-table formulation before relying on that change as an optimization bridge.
- **Actual:** The tiny example correctly explains matching, but never hand-traces the recursive search. A single paragraph asserts repeated “prefix combinations”; the actual displayed recursion slices characters from the front and therefore recurses on suffixes. The next section directly gives prefix DP formulas. The interaction visualizes only the already-optimized table, so it cannot supply the missing duplicate-work demonstration.
- **Concrete missing example:** For `s="aa", p="a*a*b"` (false), skipping the first group then consuming one a reaches `("a","a*b")`; consuming one a with the first group then skipping it reaches the same pair. A small branch sketch could expose that duplicate and then separately derive the forward prefix version. This is a suggested repair, not an explanation currently visible in the lesson.
- **Evidence:** Cold walkthrough rows 01/02, `cold-desktop.png`, `cold-expanded.png`, and the audited baseline/cost/derive copy agree about what is actually present. Correct outputs and executable checks do not repair this instructional omission.
- **Violated requirement:** Frozen causal-derivation/saved-work dimension and the explicit requirement to explain the baseline's repeated work and every optimization bridge; depth must exceed section presence.
- **Owner / next action:** Lesson author: add a bilingual worked overlap and a clear suffix-to-prefix transition; recheck those sections cold against the revised candidate and preserve trace/source parity. Reviewer recheck pending.

Minor, non-required observation: improve disabled-label contrast while retaining an obvious disabled state. Current labels remained readable on inspected captures, so this does not independently block acceptance.

## Earlier-review handling

Only after the cold walkthrough was saved, read `specs/reviews/leetcode-first-ten-review.md`. It identifies itself as author self-review and records no earlier stable, required problem-10 finding ID. Its shared invariant-at-entry and prediction-state observations were independently rechecked here. No earlier independent finding is claimed closed, and aggregate self-test totals were not used to score this lesson. No earlier problem-10 independent report was found in the review-file listing.

## Scores and decision

| Dimension | Weight | Score (0–4) | Rationale |
| --- | --- | --- | --- |
| Problem / terms / hand calculation | 15 | 4 | Full-match Boolean, character rules, lengths, empty-prefix meaning, and a concrete zero/two/one hand calculation precede abstraction. |
| Causal derivation / saved work | 20 | 2 | Last-character partition and dependencies are explained, but repeated search work and the suffix-to-prefix bridge remain asserted; required 10-DER-01. |
| Maintained state / correctness | 20 | 4 | Prefix invariant, boundary table, guarded repeat, known dependencies, termination, and independent intermediate checks all support the reconstruction. |
| Interaction / visual meaning | 20 | 4 | Predictions, per-cell changes, retained values, before snapshot, code excerpt, history, rewind/reset/endpoints all operated consistently. |
| Python / actual cost | 15 | 4 | Faithful executable source; fresh and boundary cases; exact mirror/display/copy/download parity; actual Python transition and O(mn) accounting verified. |
| Bilingual / device access | 10 | 3 | Equivalent reasoning and preserved state at requested widths; keyboard and fallback work. Disabled labels have minor contrast friction; zoom evidence uses headless layout magnification with the mechanism limitation stated above. |

Weighted total: **87.5/100**. Required open IDs: **10-DER-01**. Outcome: **changes_required**. The total exceeds 85, but causal derivation is below 3 and a required finding is open, so the frozen acceptance conditions are not met.

Limits: this run reconstructs the lesson independently; it does not measure human novice comprehension or claim a successful LeetCode submission. It does not publish or authorize publication. Official statement access succeeded; browser-menu zoom itself was not exercised. Broader author suites were inspected but were not rerun; only the independent checks reported above were executed. All writes were confined to this exact report and this run's screenshot directory.
