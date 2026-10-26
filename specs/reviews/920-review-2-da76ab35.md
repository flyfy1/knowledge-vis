# Independent review: 920 — Number of Music Playlists

Candidate: `cd465de001aaf048ec55ecae29e4cd6832137676`. URL: http://127.0.0.1:18770/leetcode/920/. Target: basic Python, lists, loops, functions, elementary recursion. Review run: `920-review-2-da76ab35`; no named reviewer/model identity asserted. Frozen weights: 15/20/20/20/15/10. Python canonical-language interpretation applies. This is a review, not publication or a LeetCode submission.

## Cold walkthrough (saved before source, tests, contract, or previous reviews)

Only the frozen rubric was read before opening the candidate in Playwright Chromium, desktop 1280×900. All five teaching sections were read in rendered English, then rendered Chinese. The browser is a real headless Chromium instance.

| Step / question | Action | Observable result | Causal conclusion in my words |
|---|---|---|---|
| 0: What is counted? | Read inputs, bounds, and hand example; open eight-candidate filter | AAA/BBB fail coverage and adjacency; AAB/ABB/BAA/BBA fail adjacency; ABA/BAB survive, answer 2 | Ordered plays may repeat; using every identity and keeping a gap are separate requirements. n is available songs, goal plays, k intervening plays; output is a count modulo 1,000,000,007. |
| 1: Why stop enumerating? | Read baseline and wrong-rule counterexample | Streams n^goal tuples, filters coverage then recent k; 100^100 candidates at upper bounds. n=2,goal=3,k=0 gives six mixed lists rather than eight | Even no cooldown does not remove coverage. Grouping prefix counts avoids repeatedly checking full sequences. Set/product notation is briefly explained, though richer Python than the target's starting knowledge. |
| 2: What information suffices? | Read AB/BA derivation and advance all six default cells | Completed targets (1,1)=2, (1,2)=0, (2,1)=0, (2,2)=2, (3,1)=0, (3,2)=2. Each frame shows N/R sources, source counts, choice multipliers, and total | dp counts labeled prefixes, not arrangements of anonymous song types. Legal recent plays are distinct, so blocked identity count depends only on k. New/replay classes uniquely partition by last play. |
| 2: What does a transition mean? | At (2,2), inspect N/R; advance to (3,2) | (2,2): 2×1+0×1=2. (3,2): 0×1+2×1=2; final coverage message appears only at end | Each frame is after one cell computation; earlier counts remain data. ◆/N/R identify target/dependencies; '?' differs from known zero. Empty-prefix 1 seeds all counts; impossible states are zero. |
| 2: Does history rewind and changing k change the mechanism? | Undo final cell; select k=0; complete table | Undo returns to (3,1) and hides final cell as '?'. Preset change resets history. Final k=0 target is 2×1+2×2=6 | Undo restores an earlier table, not just highlighting. Removing cooldown changes replay multiplier and prior row counts, while coverage remains enforced. |
| 3: Can I transfer the rule? | Independently calculate 6×1+6×2=18, select 18, reveal; change to 12 and reveal | Correct answer 18 with two contributions. Changing selection hides explanation; 12 receives mismatch explanation identifying omitted two-song prefixes | Need both predecessor classes. Neither always one replay choice nor keeping only already-covered prefixes works. |
| 4: How does this become Python? | Read displayed complete Solution method and cost/boundaries | Separate dp/nxt lists; loop i then j; new uses dp[j−1], replay dp[j]; row assignment after inner loop; O(goal·n) time/O(n) cells | At (3,2), prior row [0,0,2] gives new=0,replay=2,nxt[2]=2. New row prevents contaminated dependencies. Full-table snapshots are explicitly simulation overhead, not submission space. |
| Both languages | Switch to 中 after completed k=0 table and wrong-answer reveal | Chinese retains table 6/6, k=0, answer 6, and mismatch result; gives same hand example, cooldown proof, two sources, code mapping and costs | Locale changes preserve the experiment and reasoning; labels correspond to the same state. |

Cold predictions before any custom-case execution: choose **(n=3,goal=5,k=0)**, not a UI preset. Inclusion/exclusion gives 3^5−3·2^5+3=150. This will be a **code check**, not a custom-input browser experiment. Fresh wrong-rule counterexample **(3,4,2)**: after ordering ABC (6 possibilities), only A may follow; total 6, whereas treating every position as n−k choices gives 1. Also (2,2,0) must give AB/BA=2, excluding AA/BB despite their legal cooldown. The UI is preset-only.

Cold evidence captured: `cold-desktop.png`, `cold-complete.png` in this run's exclusive evidence directory. Source audit and screenshot inspection follow below; no author explanation supplied a missing cold-walk inference.

## Candidate, official statement, and canonical audit

After saving the cold walk, `git rev-parse HEAD` returned the requested candidate exactly. The working tree showed only this report and its evidence directory as untracked. Runtime HTTP bytes equaled checkout bytes for index.html, app.js, copy.js, core.js, python-code.js, solution.py, local style.css, shared common.js, and shared style.css. Important SHA-256 receipts:

| File | SHA-256 |
|---|---|
| index.html | e44c2fdca0ca51477ef2c301279e8bcc69fbd2e9895a2896425cea633400bf13 |
| copy.js | 60c0ab77ca0eed5e2e645b85f5d9407ad10ff1964c0c9c5ac03821a3a1bb62aa |
| app.js | 7847defb25d347b8c9be0e96a1b044b4716a21bb38c0f596ad64d7a9b44380dc |
| core.js | 12131467654a98b37b2ab1d1f8b2a43edced299de23dfba61e437add198593c6 |
| solution.py | 8fd74a4f83be601714d3a7c7ce99b198d81bf688085a66122e32b70e220c0994 |
| python-code.js | 14233afdd46e0881d4c5d243c0a7d070f8ff636ffdbf6726132d9334074e7176 |
| style.css | 0059fe199944716f16c00ee316c33c7b07c8c7b9c3b31bb51cce33af99bcc836 |

Read the [official statement](https://leetcode.com/problems/number-of-music-playlists/) normally through the web tool, without bypass. Its coverage rule, repeat gap, modulus, examples 6/6/2 and bounds `0 <= k < n <= goal <= 100` agree. The official page text did not expose a live language selector. Saved lesson-local `provenance/official.json` contains the official Python3 snippet `Solution.numMusicPlaylists(self, n: int, goal: int, k: int) -> int`; canonical source matches that interface and returns an integer. No non-Python contract is needed. Read `LANGUAGE_FILES` in the registration script: Python maps exactly to solution.py / python-code.js / PYTHON_SOURCE. There is no conceptual analogy advertised as a submission.

Read canonical Python, JS core/rendering, locale consumer, HTML, CSS and localization pairs after the cold walk. Correctness reconstruction: for each cell, deleting the final song uniquely determines the predecessor and new/replay class. There are n−j+1 unused identities for a predecessor using j−1 songs. A legal predecessor using j songs blocks its last min(k,length) distinct identities; if shorter than k all used songs are blocked, otherwise j−k remain. Therefore max(j−k,0) is correct, and no actual identity history is needed to count choices. Both append classes are legal and disjoint. Base dp[0][0]=1 and zero impossible states start induction; final dp[goal][n] enforces coverage. Finite i/j loops terminate.

Visual-to-code mapping: the full teaching table computes even impossible j>i cells as zero, while Python skips them. N at (3,2) reads previous-row dp[1], R reads dp[2]; for the default case these are 0 and 2, with both multipliers 1. Python writes nxt[2]=2, then changes dp only after the row. This preserves every dependency; arguments are immutable integers and no caller data is mutated. Remainders commute with the two operations. Time O(goal·n) modular operations and space O(n) live integer cells match the actual loops, fresh row allocation and fixed modulus. Teaching full-table snapshots use O((goal·n)^2) cells separately. Baseline streams candidates with O(goal·n^goal) expected set-operation time/O(goal+n) auxiliary space; valid inputs are nonempty, so no omitted zero-length cost. Its k=0 removal leaves no spurious cooldown restriction.

## Executed verification

Inspected both test files **before running**, especially their writes, clipboard sentinels, contrast calculation, zoom profile lifecycle, and output configuration. Ran from repository root:

```sh
OUTPUT_DIR="$PWD/specs/reviews/920-evidence/920-review-2-da76ab35" python3 -B leetcode/920/tests/test_solution.py
OUTPUT_DIR="$PWD/specs/reviews/920-evidence/920-review-2-da76ab35" PREVIEW_ROOT=http://127.0.0.1:18770 node leetcode/920/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 920 --validate-only
```

All exited 0; preflight produced no stdout/stderr. Metadata complexity is exactly the nonempty string `O(goal * n) time; O(n) auxiliary space`. No registration/generation command ran. The focused author `copy-r1.cjs` has a hardcoded author-evidence output directory, so it was read but **not run**. An independent inline Playwright check instead wrote only this run's `closure-end-320-en.png` and `closure-end-320-zh.png`.

Numerical rerun recorded 435 canonical checks and 62 trace snapshots; these counts support, but do not replace, the observations. It independently enumerates prefix buckets by last-occurrence distance, checks every known intermediate cell, future-cell nulls, both contributions, the displayed baseline, seeded larger cases via inclusion/exclusion, and factorial boundaries. Duplicate keys are rejected before parsing can discard them; all 72 localization entries are nonempty two-string pairs. `common.js` consumes these as [zh,en].

Separately executed the **actual canonical Python** with an independently written tuple enumerator that checks full coverage and sliced last-k windows, without calling the trace recurrence:

| Input (n,goal,k) | Independent expected | Actual |
|---|---:|---:|
| (3,5,0), fresh nonpreset code check | 150 | 150 |
| (3,4,2), fresh wrong-rule counterexample | 6 | 6 |
| (2,2,0), coverage exclusion | 2 | 2 |
| (4,6,2), additional nonpreset code check | 168 | 168 |
| (1,100,0) | 1 | 1 |
| (100,100,0), factorial mod M | 437918130 | 437918130 |
| (100,100,99), factorial mod M | 437918130 | 437918130 |
| (2,100,0), (2^100−2) mod M | 976371283 | 976371283 |

The fresh predictions saved before execution were confirmed. UI preset terminal counts are independently supported by enumeration: 2,6,6,6,1,24. The browser suite observed these actual displayed results in both languages, initial/middle/end and rewind/replay/reset, all options' feedback, formula text, and source markers. For dense preset (4,4,0), frame (3,3) is N=12×2 plus R=0×3, target 24, with retained neighboring count (3,2)=36 and explicit “not full answer” readout. Unknown cells remain '?'. This validates displayed state and mathematical meaning together.

Browser rerun: 38 recorded states, 20 screenshots, no page/console/asset errors. JSON artifacts retain the scripts' literal author-self-check labels; this report's independent cold reading and calculations supply the review judgment. Evidence: [numerical.json](920-evidence/920-review-2-da76ab35/numerical.json), [browser.json](920-evidence/920-review-2-da76ab35/browser.json).

## Interaction, localization, device and source fidelity

- English and Chinese render the complete recurrence and matching source/target calculations, not truncated key fragments. Both explain the distinct-last-k reason, new/replay partition, unique deletion proof, empty-prefix base and rolling rows. Cold switch after a completed k=0 table retains count 6 and the wrong-answer explanation. H1/document titles identify #920 with the appropriate localized metadata title; official URL is exact.
- Initial undo/reset and unchosen reveal are disabled; endpoint next/end are disabled. Both locales pass exact snapshots for forward/undo/replay/reset; preset changes restart the table. Radio changes hide previous feedback until reveal. Locale switches preserve selection/reveal; reset of the explicitly independent trace does not erase the exercise. No stale preset-dependent quiz grading is implied.
- Canonical UTF-8 source, decoded PYTHON_SOURCE mirror, displayed textContent, successful clipboard write, and both downloaded files match exactly, including final newline and indentation. Four manual-fallback transfers (two per locale) each seed/read back a fresh distinct non-source sentinel **before** rejecting automatic writes. The real Copy button focuses/selects the entire fallback textarea, Linux Control+C transfers it, and clipboard readback equals canonical source without normalization. Offline file rendering and blocked localStorage also work.
- Enter on the focused next button advances; Tab reaches reset; visible focus is a solid 3px outline. The independent closure check confirms copy→download→#629→#552 keyboard order at 320px. Native labels/radios/select, table row/column headers and focusable code/table regions support operation. Disabled controls retain full-opacity muted readable labels.
- Tested en/zh widths 320,390,736,1440; native browser tabs.setZoom(2) gives outerWidth 1280, innerWidth 640, DPR 2. Inspected actual screenshots: cold complete, trace-en-320, table-zh-320, trace-en/zh-390, table-en-1440, zoom200-en/zh, closure-end-320-en/zh, page-end-zoom200-en/zh. Numeric text and ◆/N/R occupy separate lines without intersections. Narrow controls stack, captions/readouts wrap, and the table retains associations. Some viewport captures end partway down the table; the table-element capture supplies the rest. The full-page cold screenshot's sticky-nav band is a capture-position artifact, supplemented by settled captures. Code has intentional horizontal component scrolling at narrow widths, rather than page overflow.
- At 320px, the dense English selected label measures 162.1923px, Chinese 110.6882px, within a 256px control with 30px padding and the test's 24px native-arrow reserve. Closed values visibly fit. CSS stack: PingFang SC/Microsoft YaHei/system-ui/sans-serif; exact resolved fonts on other hosts are not inferred.
- The actual contrast helper is calibrated with black/white=21, primary luminances .2126/.7152/.0722 and #747474 on black≈4.492948, below 4.5. Actual solid colors are bg #0d1117, panel #161b22, panel2 #1c2330, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8. Minimum tested text contrast is 6.449407898769069:1. Source markers and disabled text are readable. This covers solid roles, not arbitrary compositing.
- Actual related links were keyboard-followed at 320px in both languages; destination text retained in browser.json was read. #629 step2 counts permutation states and reuses neighboring sums; #552 step2 counts legal attendance prefixes in six states. Labels truthfully describe these served preview destinations. Their own acceptance/publication is outside this review.

## Findings and closure

Required open IDs: **none**.

**920-COPY-R1 — closed against cd465de001aaf048ec55ecae29e4cd6832137676.** Scoped copy-repair request from `specs/reviews/workflow-copy-repair-requests-20261026/920.md`; low-severity learner-copy/workflow separation issue, required for that requested revision. Historical base is e1dfa23199ec290c1e795f870689ce075e3d79f8, previously accepted in 920-review-1-62e8ca13.md. That earlier review was inspected only after saving this cold walk.

Original reproduction: either locale, read the page-end footer; generic author-self-check/review-pending/no-submission/no-learner-outcome wording appears in the learner flow. Expected: remove that footer and unused `foot` binding while preserving meaningful simulation/interface/boundary explanations and all core behavior. Exact new diff: remove footer element, remove bilingual `foot` pair, bump copy.js query v=1→v=2. There is no replacement acceptance claim. Source comparison confirms app.js/core.js/solution.py/python-code.js/style.css byte-identical to the accepted base; every other copy entry is identical.

Independent regression actions: at 320px, advance default trace four cells to (2,2), choose/reveal 18, switch zh→en→zh. Observed: identical table, selected correct option and revealed explanation retained; old footer sentences absent; no footer/orphan binding; `sim`, `p4`, `boundaries` equal their base localized values. Copy/download/related links remain in keyboard order. Page end has main/body bottoms equal within 1px, with no empty footer gap. No page errors. Both 320px page ends and both native 200% page ends were visually inspected (files above), confirming readable neighboring content and removal. Owner next action: no repair remains for this ID; release authority remains separate. This closes the requested change only against the actual candidate; historical acceptance is not rewritten.

**920-N01 — low-severity optional teaching advisory remains open.** Stable ID retained from prior review; section 1, both locales, all widths. Reproduction: read the baseline as a basic-Python learner. Expected ease: newly used APIs are explained. Actual: product/tuples and sets/add/remove receive only brief explanation; the recent-window removal operation could use a sentence and concrete window. Every essential algorithmic predicate and the DP derivation remain reconstructable without these APIs, and canonical submission uses ordinary lists/loops. This is minor friction, not a required gap. Suggested future owner action: explain a set as distinct identities and removal as advancing the last-k window. No fix or closure is claimed.

## Scores and conclusion

| Dimension | Score /4 | Weight | Weighted points | Evidence and rationale |
|---|---:|---:|---:|---|
| Problem/terms/hand calculation | 4 | 15 | 15 | Concrete eight-way filter precedes abstraction; units, order, bounds, coverage and modulus explicit. |
| Causal derivation | 4 | 20 | 20 | AB/BA prefixes bridge enumeration to grouping; both multipliers and excluded cases explained; counterexample and transfer require reasoning. |
| Correctness/state | 4 | 20 | 20 | Invariant, disjoint deletion proof, base/impossible states, previous-row dependency and full-coverage endpoint agree with independent execution and intermediate buckets. |
| Interaction | 4 | 20 | 20 | Source markers and retained numbers communicate completed-cell semantics; reversible steps and prediction/reveal/change operate correctly. |
| Python/cost | 3 | 15 | 11.25 | Actual canonical source executes and transfers exactly, row storage/cost are justified; baseline APIs create minor target-reader friction (920-N01). |
| Bilingual/device | 4 | 10 | 10 | Equivalent causal reasoning, preserved state, readable narrow/desktop/native zoom, keyboard, solid contrast and actual clipboard fallback transfer. |
| **Total** | | **100** | **96.25** | All six >=3; no required open finding. |

**Accepted** for this candidate and reviewed local preview. 920-COPY-R1 is closed with explicit regression evidence. Review is separate from publication. Browser: Chromium 156.0.8078.4, Linux. Limitations: no physical-device or other-engine/font-host testing, no live official language-selector verification (saved official Python snippet audited instead), no human learner-comprehension measurement, no actual LeetCode submission, and no deployment verification. No implementation, shared file, test, earlier evidence, Git configuration or service was changed; all generated artifacts stayed in this exact report and its exclusive evidence directory.
