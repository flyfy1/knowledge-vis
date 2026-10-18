# Independent review: Word Ladder II (#126)

Candidate: `52c3faf0983d504d0b44bc5d5c9db4486f4bf42a`.
URL: http://127.0.0.1:18780/leetcode/126/
Date: 2026-10-18. Reviewer: this independent review run; exact model identifier unavailable. Target: basic Python, loops, lists, functions, elementary recursion.
Frozen rubric read first: `specs/leetcode-review-gates.md`; weights 15/20/20/20/15/10. Interpretation frozen before opening: faithful Python, hand calculation, shared BFS distances with all shortest parents, backward reconstruction, actual output-sensitive cost.

## Cold walkthrough (saved before opening source, tests, briefs, or earlier reviews)

Real Chromium browser via Playwright, desktop 1440×1000. Read the rendered lesson in order; no author notes supplied missing explanation.

| Step | Question | Action | Observable result | My causal paraphrase |
|---|---|---|---|---|
| 01 Two shortest routes | What is requested and what counts as one move? | Read statement and hand-worked aa/bb dictionary | aa→bb is illegal; aa→ab→bb and aa→ba→bb each have 2 replacements and 3 words | Each position must change, so two moves is a lower bound met by both paths; return paths, not distance |
| 01 baseline | What work is repeated? | Read whole-path queue explanation | Shared prefixes get copied; same word expanded for separate paths; a factorial upper bound is stated | Keeping whole histories duplicates work; shortest distance can be shared while route choices remain separate |
| 02 parents | Why retain an already seen word? | Read explicit first and second arrivals at bb | ba first supplies distance 2; ab later supplies another parent at 2 | A first arrival fixes minimum distance, not a unique route; equal-depth arrivals must survive |
| 02 boundary | When may expansion stop? | Read target-depth explanation | All depth D−1 words finish; depth D need not expand | Another word in the preceding layer may still supply a shortest target parent; deeper expansions cannot help |
| 03 initial | What is retained? | Open preset Tiny | Snapshot 0/4: queue aa, distance 0, no parents, answers hidden | This is discovered search state; it is not yet a completed path |
| 03 expansion | What will each operation add? | Prediction before clicks: aa discovers ba and ab at 1; ba discovers bb at 2; ab adds a second parent; final two routes. Advance three times | 1/4: aa→ba and aa→ab, queue ba→ab. 2/4: ba→bb, queue ab→bb. 3/4: ab→bb, bb parents ba,ab, queue bb. Expansion history accumulates | Queue order and distance layers explain discovery; the second arrival changes parent data without inserting bb again |
| 03 final/rewind | How are routes recovered, and does history persist? | Jump to answers, then Previous | 4/4 shows aa→ba→bb and aa→ab→bb; rewind returns range to 3 | Both choices stored at bb produce different shortest paths. Final queue becomes empty even though preceding frame had unexpanded bb; target-layer work is intentionally skipped |
| 04 prediction | Which words can precede tax? | Before reveal predict B: tad and tex differ once from tax; ted differs twice. Select B and Check | Correct feedback; tex has parents ted and rex, giving three complete answers | A parent needs both adjacency and distance +1; discovery order alone cannot establish the edge |
| 05 proof/code/cost | Why complete, acyclic, and output-sensitive? | Read rendered proof, code mapping, cost and boundary prose | First-discovery argument; edges increase distance; backwards choices decrease distance; Python mapping names append/pop/reverse; O(26NL²+M), O(NL+E+M) | Strictly decreasing distances guarantee termination, all shortest edges guarantee completeness, and emitting every answer costs its total word entries |

The first attempt to click a fourth button named “Expand next word” waited because the label correctly changes to “Reconstruct complete answers”; subsequent browser operation used Jump. No candidate failure inferred from that locator mistake.

Fresh independent input prediction, recorded before source/runtime reveal (UI is preset-only, therefore subsequent checks are **code checks**): start `aaa`, end `bbb`, dictionary `[aab, aba, abb, bbb]` should yield exactly `[aaa,aab,abb,bbb]` and `[aaa,aba,abb,bbb]`. Counterexample to “visited means discard”: abb must retain aab and aba. Counterexample to “every legal edge is a parent”: with `[aab,abb,bbb,aba]`, abb→aba is legal but goes backward from distance 2 to 1 and must be excluded. Adjacent `a`→`b` with dictionary `[b,c]` should return only `[a,b]`, excluding the longer legal detour via c.

Cold evidence: `cold-initial.png`, `cold-final-prediction.png` in this run's exclusive evidence directory. This is a reconstruction by the reviewer, not a claim about observed human novice comprehension.

## Post-cold audit

Completed after the cold walkthrough above was saved.

### Candidate identity and official contract

`git rev-parse HEAD` equals the requested revision. Independently fetched served index, app, translations, core, CSS, Python, and mirror bytes equal the corresponding working-tree bytes. SHA-256 values and the independent counterexample trace are saved in `served-and-counterexample.json`; canonical Python SHA-256 is `5f45dac606fcc4740fdc19de2296c78ade31311ce3702828703ec1258679ead4`. There were no tracked changes at review completion.

Read the [official statement](https://leetcode.com/problems/word-ladder-ii/) normally after the cold walkthrough. Its adjacency rule, endpoint membership, both examples, distinct endpoints, lengths 1–5, dictionary size 1–500, uniqueness, lowercase contract, and output-bound wording agree with the lesson. No access bypass was used. Official return ordering is unspecified, so comparisons normalize outer order only. Read lesson-local `provenance/official.json` and README: saved Python3 snippet supplies `Solution.findLadders(beginWord, endWord, wordList)` with list-of-lists return. The canonical source implements that faithful interface, not a conceptual analogy. No non-Python language contract or supported-language exception applies.

Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: the Python pair is `solution.py` / `python-code.js`, exported as `PYTHON_SOURCE`. The mirror is exact. The browser suite verified displayed source, clipboard success payload, fallback textarea, and actual downloaded bytes against canonical Python. Independently granted browser clipboard permission and read back the real clipboard after clicking Copy: exact source parity also passed, beyond the suite's success-path stub. Source disclosure and download include the entire executable class.

### Source, independent calculations, and executable evidence

Inspected `solution.py`, `core.js`, `app.js`, `copy.js`, `index.html`, local CSS, tests and their output paths before executing tests. Did not run the page builder. All generated results were redirected to this run's exclusive evidence directory; candidate assets and author evidence were not regenerated.

Executed the actual canonical Python class using Python 3 (`python` is unavailable; reran with `python3`). Independently chosen merge example produced exactly the two predicted routes, in the opposite outer order, which is allowed. Direct a→b excluded the c detour. Missing end, present/disconnected end, and listed-start cases matched predictions without mutating input lists. A separate coordinate-permutation oracle checked all 56 ordered distinct endpoint pairs of the full three-dimensional binary cube; every shortest route changes each differing coordinate exactly once. Evidence: `independent-code.json`.

For the fresh merge input, inspected the browser core's complete frames as a **code check**, not an editable UI experiment. aba and aab enter at distance 1; abb at distance 2 keeps both as parents; bbb at distance 3 keeps abb. The legal backward edge abb→aba is absent from parents[aba]. `served-and-counterexample.json` retains each intermediate snapshot. Thus both tempting rules—discard all revisits, or retain all legal neighbors—are independently contradicted.

Re-ran the inspected candidate numerical suite: 499 simple-path-oracle cases passed, along with 500-word/length-5 boundary, five-dimensional cube's 120 routes, input preservation, baseline execution and exact source/mirror parity. Its frame assertions check independently relaxed shortest distances, adjacency, increasing-distance parent edges, no duplicates, monotonic parent retention, and complete terminal parent sets. Evidence: `numerical.json`. Test counts support computational observations; they are not the teaching score.

Visible-to-code mapping: between tiny snapshots 2 and 3, `word='ab'`, `depth=1`, `neighbor='bb'`, and `distance['bb']=2` already exist. The new-word branch is skipped, so bb is not queued again; `distance[neighbor] == depth + 1` passes, so `parents['bb'].append('ab')` changes `[ba]` to `[ba,ab]`. Earlier parent ba remains. Current-card orange border indicates the expanded word; distance headings and parent lists are actual retained data. Arrows are textual edge/event notation, not a separate drawn graph.

Reconstruction audited directly: path begins `[bb]`; choosing ba appends to `[bb,ba]`, choosing aa gives `[bb,ba,aa]`; the base case copies the reverse `[aa,ba,bb]`. Each pop restores the previous path so the ab branch emits `[aa,ab,bb]` without corrupting the first answer. The final browser frame shows the completed routes at once rather than animating each recursive append/pop. This is minor transfer friction, not an unexplained search transition.

Correctness: BFS first discovery fixes the shortest distance because all smaller-distance predecessors are processed first. Only next-layer edges survive. Completing depth D−1 preserves all target parents; stopping at depth D cannot remove a shortest answer. Backward distance decreases make cycles impossible. Missing target returns early, unreachable target returns after exhaustion, a listed start has distance zero and cannot receive a forward parent. The official contract excludes equal endpoints. The simulator agrees with these semantics, but remains explicitly labeled as a simulation.

Cost independently checked against the loops: at most N dictionary words plus the start are expanded, each tries 25L substitutions, each creates/hashes O(L) characters. O(26NL² + M) time and O(NL+E+M) space are sound upper bounds, including answers; recursion has at most N+1 words. Python dictionaries/sets use expected lookup behavior; the lesson could make that assumption explicit. Strings are immutable; `set(wordList)` does not mutate the caller. Backtracking mutates only its private path and copies each output. Baseline factorial bound is loose but valid; its repeated whole-path copying and repeated expansions are explained. Snapshot storage is expressly excluded from submission cost.

### Interaction, translation, and visual inspection

The inspected browser suite completed successfully (`browser.json`), with both locales and every preset: forward/back replay, reset, jump, slider endpoints, initially disabled controls, final disabled controls, all three prediction choices, reveal, changed prediction hiding stale feedback, and language changes preserving trace/choice/reveal/disclosure. Native preset changes intentionally reset the search; experiment reset rewinds the search while the separate exercise remains independent. No runtime console/page errors or HTTP failures were reported. Local anchors resolve and land below the sticky navigation. Blocked-storage/offline interaction and forced-colors/reduced-motion checks passed.

Independently held snapshot 2, selected/revealed B, opened source, then resized 1440→320→390→1440 and switched English→Chinese→English. Position, discovered words, choice, feedback visibility and disclosure remained unchanged. Keyboard Home/End/Left/Right on the slider produced positions 0/4/3/4; the suite also exercised Enter activation and Tab/Shift+Tab focus with a visible 3px outline. Evidence: `independent-interactions.json`. Essential controls have native labels and usable keyboard semantics. Readable disabled buttons use opacity 1; measured disabled text contrast is 6.449:1. Rendered explanatory prose is 12.616:1, hints 7.744:1, and word/readout text 13.397:1.

Read both rendered locales and the translation pairs. The critical adjacency rule, first-versus-equal discovery, preceding-layer completion, backwards termination, boundaries, complexity, and exercise explanation agree. Chinese does not omit an essential causal step. Technical identifiers remain Python identifiers in both.

Captured and personally inspected this run's `cold-final-prediction.png`, `independent-390-intermediate.png`, `en-320-layers.png`, `zh-390-layers.png`, `zh-1440-layers.png`, `zoom-reflow.png`, both `header-320-*.png`, and both `zoom-200-*-layers.png`. At 320px cards stack, with complete parent names visible; at 390px and desktop, paired cards retain layer grouping. Both enlarged cog cards show dog and log. Narrow headers fit and language controls stay visible. Intermediate controls wrap to multiple lines without losing their labels. Navigation scrolls horizontally by design, independently of the page; the suite found no document overflow at 320/390/736/1440px. Code has its own scrollable, focusable region.

200% evidence uses CSS zoom 2 plus a 720px desktop reflow viewport, in both languages. Enlarged layer screenshots hide sticky navigation only during the tall element capture to avoid stitching overlays; ordinary navigation and anchor geometry were checked separately. This is desktop Chromium emulation, not a physical-phone or browser-toolbar-zoom claim.

### Findings and earlier-review closure

No earlier report for problem 126 was found in `specs/reviews` after saving the cold walkthrough. No earlier required finding was closed or silently carried forward.

Required finding IDs: **none**. Required open IDs: **[]**.

Optional finding **126-R1-O1** (minor, open suggestion): at revision above, English and Chinese section 05, desktop/320px, open the complete Python code after the tiny trace. Expected for a score of 4 in Python transfer: a novice can connect collection syntax and each backtracking operation to concrete values with little translation effort. Actual: the mapping names `append/pop` and reversal but does not step through their values; `deque`, `defaultdict(list)`, and dictionary/set lookup assumptions receive limited introduction. The executable code and visible search transitions remain reconstructable. Suggested owner action: lesson author may add a compact collection glossary and the `[bb] → [bb,ba] → [bb,ba,aa]` walk with undo. Requirement basis: sixth-table dimension “Transfer to Python and cost,” minor friction rather than a missing essential algorithmic bridge. Fix revision/regression recheck: not applicable; no acceptance-blocking change requested.

### Scores and conclusion

| Dimension | Weight | Score / 4 | Observation supporting score |
|---|---:|---:|---|
| Problem/terms/hand calculation | 15 | 4 | Tiny two-route example precedes graph vocabulary; moves versus word count and illegal double replacement are concrete |
| Causal derivation/saved work | 20 | 4 | Baseline repeats histories; shared distances retain equal-depth parents; immediate return and seen-only filtering visibly lose a route |
| Maintained state/correctness | 20 | 4 | Queue, layers, parent lists and retained history expose the invariant; target-depth stop, backward termination and fresh counterexample agree with actual code |
| Interaction/visual meaning | 20 | 4 | Prediction/reveal/change, before/after parents, rewind, endpoints, reset and persistent state worked; highlighting is distinguishable from data |
| Python/cost | 15 | 3 | Canonical code, fresh runtime cases, mutation and output cost verified; collection syntax and recursive undo would benefit from one concrete walkthrough |
| Bilingual/device | 10 | 4 | Equivalent reasoning in both locales, readable narrow/enlarged views, keyboard controls, contrast and state preservation checked |

Weighted total: **96.25/100**. Every dimension is at least 3; zero required open findings; browser, executable-source, official-statement and parity evidence are present. **Accepted for this candidate revision and review scope.** Acceptance is separate from publication.

Limitations: no physical device, browser-toolbar zoom, human novice study, successful LeetCode submission, or public deployment verification is claimed. The page's fixed exercise checks parent selection on a new graph rather than asking the learner to implement the entire algorithm. Preset-only UI means independent custom inputs are explicitly code checks. Only this report and files under `specs/reviews/126-evidence/126-review-1-033ff9db/` were written.
