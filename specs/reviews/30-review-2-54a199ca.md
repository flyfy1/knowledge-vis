# Independent review: LeetCode 30

Candidate: `984e2131bb5bb1b2717cc377957b1684d9650cf0`. URL: http://127.0.0.1:18770/leetcode/30/. Review run: `30-review-2-54a199ca`; reviewer/model identity unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen weights: 15/20/20/20/15/10. Canonical-language interpretation: faithful Python preferred. This is an independent review, separate from publication.

## Cold walkthrough (saved before inspecting repository source, tests, author notes or earlier reviews)

Read only `specs/leetcode-review-gates.md`, then opened the candidate in real headless Chromium through Playwright. Inspected the rendered text and `cold-initial.png`. The page contains five teaching sections. All observations below came from the page, including its expanded complete-code disclosure, rather than repository source.

| Teaching question | Action | Observable result | My causal reconstruction |
|---|---|---|---|
| What are we finding? | Read statement and manually split barfoofoo into length-3 words. | Start 0 is bar+foo; start 3 is foo+foo. Indices are character indices; order unrestricted. | Membership does not preserve multiplicity; the second candidate overuses foo and lacks bar. |
| Why can we skip work? | Read baseline and track explanation; hand-shift bar+foo to foo+foo. | Baseline recounts k chunks per start; tracks 0/1/2 visit starts separated by 3. | Retain the shared foo, remove bar, add foo. Remainder partition covers every start once. Unknown chunks break any crossing match; quota restoration and k retained words imply exact equality. |
| What changes in one operation? | Execute all 22 events individually (table below). | Explicit counts, character positions, left/right/used and answers change separately. | Highlight represents the retained half-open interval, while count chips are actual data. An add can violate the invariant temporarily; shrinking restores it. |
| Predict before revealing | Predict full answer [0,1,2] by enumerating the three length-4 slices of aaaaaa. Deliberately select [0,2], reveal, change to [0,1,2], reveal again. | Wrong choice explains missing offset 1; changing choice clears feedback; correct choice explains the second track. | Tracks are needed even when every character is identical; overlapping answers are legal. |
| How does this become Python? | Read mapping, Counter primer, cost explanation and expand complete solution. | View right is Python right+width; event 6→7 explicitly maps foo 2→1, used 2→1, left 3→6. | Each shrink must change all three values. Each chunk is added/removed at most once; slicing/hashing contributes width to cost. |

### Every default experiment operation

For each row the action was one click on Execute next operation. The question and causal paraphrase are recorded explicitly; the initial state was event 0, no counts, no answer, left=right=used=0.

| Event | Question | Visible result | Causal conclusion |
|---|---|---|---|
|1|Which track starts?|offset 0, empty window|Chunk boundaries now advance by 3.|
|2|What does bar add?|bar:1, left0/right3/used1|One required chunk retained.|
|3|What does foo add?|bar:1 foo:1, right6/used2|Quotas and total size now match.|
|4|When record?|answer 0|Exact counts certify start 0.|
|5|How permit overlap?|foo:1, left3/right6/used1|Discard only first chunk, retain useful suffix.|
|6|What if foo repeats?|foo:2, left3/right9/used2|Addition can temporarily exceed quota.|
|7|How repair excess?|foo:1, left6/right9/used1|Removing left foo restores quota; no answer here.|
|8|Another foo?|foo:2, right12/used2|The same excess recurs.|
|9|How repair again?|foo:1, left9/right12/used1|Advance past excluded repeated chunk.|
|10|What if bar returns?|bar:1 foo:1, right15/used2|All required chunks are present.|
|11|Which second start?|answers 0,9|Current left is a valid index.|
|12|What is retained?|bar:1, left12/right15/used1|Keep suffix for possible overlap.|
|13|What about nonzero starts?|offset1, left=right=1, used0|New track resets window but preserves answers.|
|14|Can arf cross a match?|empty, left=right=4|Unknown chunk excludes every crossing window.|
|15|Can oof cross a match?|empty, left=right=7|Reset skips invalid crossing starts.|
|16|Next oof?|empty, left=right=10|Same exclusion applies.|
|17|Next oob?|empty, left=right=13|No track-1 match survives.|
|18|Last track?|offset2, left=right=2|All possible remainders are considered.|
|19|What about rfo?|empty, left=right=5|Unknown chunk excludes crossing starts.|
|20|What about ofo?|empty, left=right=8|No match across it.|
|21|Next ofo?|empty, left=right=11|Same reset rule.|
|22|What about oba / termination?|empty, left=right=14; final [0,9]|All complete chunks in all tracks exhausted.|

### Independent predictions before execution

UI offers only four presets, so these are **pending code checks, not UI custom-input experiments**. Fresh case: `s="xababab", words=["ab","ab"]` predicts `[1,3]` (length-4 substrings at odd starts). Counterexample to set membership: `s="ababab", words=["ab","ba"]` predicts `[]`; aligned pairs are either ab+ab or ba+ba, never one of each. Prediction recorded before any execution against canonical source.

Cold screenshots: `30-evidence/30-review-2-54a199ca/cold-initial.png`, `cold-end.png`. Initial full-page screenshot visually inspected; endpoint inspection and additional evidence follow below. A first automation attempt used a button locator for a radio choice and timed out; corrected to its actual radio label. This was a reviewer automation error, not a candidate defect.

## Candidate, official statement and canonical source audit

Source audit began after the cold record above was saved. `git rev-parse HEAD` returned the requested revision. Ten browser-served assets matched checkout bytes: lesson index, app, copy, Python bundle, solution, common.js, style.css, and hard-first-ten core.js/lesson.js/style.css. SHA-256 identifiers:

| Asset | SHA-256 |
|---|---|
|solution.py|34e0de81f4631c7bc830677f8f300b113d8703c2af8d95cad52c065c8ad80f58|
|python-code.js|8a6b6752d3114ad51dd7e2859310964c54008e93d2388e440c1b35483669fcc1|
|copy.js|6714b8686b0f0993e8cfb7efcb30453dbbd133046c56f295ee3680cf3c5a4ca4|
|index.html|fba251e09ca7befe27359ae111701ff4a3e438dbf399cd7c7692cd05ea370b7f|
|hard-first-ten/core.js|342d7cbdf8c1e6f8527e6804ec286157e8fc63513a3c36c61d67c496bd08eeed|
|hard-first-ten/lesson.js|18365da600d3a774aec9afb96deb377fa269fe894424ed6cef41ad9f929c9731|

The [official statement](https://leetcode.com/problems/substring-with-concatenation-of-all-words/) opened normally using the web reader. Its equal-width words, exact permutation multiplicities, arbitrary answer order, three examples and bounds agree with this lesson. Bounds: text length 1…10000, 1…5000 words, width 1…30, lowercase English letters. The lesson leaves the text-length lower bound implicit; this is minor and does not change its mechanism. No access bypass was used.

Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python requires `solution.py`, `python-code.js`, export `PYTHON_SOURCE`. This candidate uses actual Python `Solution.findSubstring(self, s: str, words: List[str]) -> List[int]`, returning integer start indices with arbitrary order. It is a faithful implementation of the original callable semantics. No conceptual analogy is presented as a submission. No non-Python language contract or supportedLanguages declaration applies; the requirement for live-selector and saved contract evidence for non-Python solutions is therefore inapplicable. The official interactive editor's language selector itself was not separately inspected.

Exact canonical-source parity passed for offline mirror, browser embedded constant, complete displayed code, successful clipboard readback, denied-clipboard fallback textarea, and actual downloaded stream in both languages. Offline file mode displayed the same source and advanced correctly with storage denied. All execution used actual canonical solution.py through importlib, with `python3 -B`, rather than executing the JS animation as proof of Python behavior.

### Correctness, boundaries and intermediate invariants

The two frozen independent predictions passed: xababab/[ab,ab] → [1,3]; ababab/[ab,ba] → []. These are **code checks** because the UI is preset-only. Additional independently chosen examples: aabb/[aa,bb,bb] → [], aabbaabb/[aa,bb] → [0,2,4], abbaba/[ab,ba] → [0]. In the last extra case, my first hand expectation incorrectly included 2; executing canonical Python exposed that error, and manual re-splitting showed the slice at 2 is ba+ba. Corrected the reviewer expectation to [0], then reran. No candidate change was made. The two predictions frozen during the cold phase were correct.

A separately seeded (542) independent oracle enumerated legal starts and compared exact chunk Counters for 2500 random small cases, widths 1…4, with unchanged input word lists: all passed. The inspected lesson-local Python suite additionally passed all three official examples, duplicate quotas, nonzero starts, one-character hit/miss, oversized concatenations, 10000 text characters with 5000 width-1 words (5001 answers), 5000 width-30 words (empty), and 333 width-30 words (11 answers). These results establish tested behavior, not submission acceptance.

Invariant reconstructed independently: for a fixed track, have counts exactly the chunks in the retained interval and used counts those chunks. After a known-word insertion only that word can newly exceed its quota. Removing from the left until it is within quota discards only starts whose windows still overuse it. A prior bounded state stays bounded for all other words. Once all counts are bounded and used equals the required total, every quota must be met exactly. Unknown chunks exclude crossing windows on that track. Recording left then removing one leftmost chunk retains useful suffixes for overlapping matches. All tracks cover every possible start, incomplete trailing chunks are never read, and forward-only boundaries terminate.

Visual-to-code mapping: default 6→7 changes foo:2→1, used:2→1 and left:3→6 while displayed right stays 9. Python's right is 6 (the newly read word start), so right+width gives the view's exclusive 9. The focused excerpt's three removal statements match this transition. Counts omit zero-valued Counter keys visually; that is semantically harmless. Before state at event 7 shows foo:2 and characters 3…8; current state shows foo:1 and characters 6…8. Output 0 is preserved.

An independent JS frame harness checked three fresh inputs, including both cold predictions and abb ac ac aab as the literal string `abbacacaab` with words [ab,ba,ca]. All **40 frames** matched used=(right-left)/width, exact substring chunk counts, highlight indices equal to [left,right), and unmutated initial output. The inspected trace suite independently checks 507 inputs/10314 frames; 773 frames temporarily exceed a quota and are immediately followed by further shrinking. The invariant is intentionally asserted after completed shrinking, not after every add or individual removal.

Cost checked against canonical code: need initialization costs O(kw) for k words of width w; across all tracks there are O(L) chunk reads, not O(Lw) reads. Slicing and hashing each costs O(w). Each retained chunk can be removed once; clearing is charged to previous insertions. Thus expected time O(Lw+kw), auxiliary space O(kw) plus output. Python's Counter can retain zero-count keys, but these still range over at most k distinct required words. Input strings are immutable, words is preserved, and answer is newly allocated. Teaching snapshot history is properly excluded from submission memory.

### Inspected tests and safe execution

Read all five lesson-local test files before running them. `solution_check.py`, `trace.cjs`, `legend.cjs` only read and print; browser.cjs/layout.cjs write author evidence by default. Ran the first three unchanged. For browser/layout tests, evaluated copies **in memory**, redirecting every screenshot path to this run's exclusive directory and replacing JSON file writes with console output. Original tests, author evidence and candidate assets were never regenerated or edited.

Observed commands/results:

- `python3 -B leetcode/30/tests/solution_check.py`: exit 0; 3013 cases, input preservation and exact mirror parity passed.
- `node leetcode/30/tests/trace.cjs`: exit 0; 507 inputs/10314 frames passed.
- `node leetcode/30/tests/legend.cjs`: exit 0; both retained-window legends passed.
- Adapted-in-memory browser.cjs: exit 0; both locales, all four endpoints, before/after diagrams, source parity, copy fallback, offline denied storage; errors [].
- Adapted-in-memory layout.cjs: exit 0; 736/1440 widths and transitions 2/5/7/12/14 in both locales, deep links at 320/1280 and served-byte parity passed.
- Independent canonical oracle: 2500 cases passed after correcting the reviewer's extra hand-case expectation as documented above.

Also inspected relevant shared test branches to assess the page's test claims. Shared tests contain exhaustive checks for other problems; inspected #30 branches use random/boundary oracles. No lesson-specific exhaustive corpus is claimed as independently executed here. The page's generic statement that test files cover random, exhaustive and boundary cases should be read at shared-suite scope; its wording could be made more precise. Counts alone did not determine any teaching score.

### Mandatory metadata gate

From repository root ran exactly `python3 -B scripts/register_leetcode_lesson.py 30 --validate-only`: **exit 0, no stdout** (also observed in the earlier combined run). No registration was run. `lesson-entry.json` complexity is exactly one nonempty string:

`O(Lw + kw) expected time; O(kw) auxiliary space plus output (L text characters, k words, w word width)`

Its shape and actual cost model both pass.

## Interaction, bilingual and device observations

Real Chromium via Playwright, NODE_PATH module resolution, and `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when set. Both languages were exercised at 320, 390 and 1280 widths, with additional 736/1440 checks. Document scroll width equaled viewport width. At narrow widths characters wrap with explicit indices, so a word may span rows but retains its identity. English/Chinese reasoning, quotas, remainder coverage, reset exclusions, quiz explanations, code mapping and cost are equivalent. Canonical variable names remain in English deliberately.

Both locales passed all presets: Excess word → [0,9], Nonzero start → [1], Repeated required word → [0,3], Text too short → [] at event 0/0. Preset changes reset the experiment; next disables at its endpoint, rewind disables at zero. Rewind then replay reproduced the same complete snapshot. Reset restored event zero. Previous-state disclosure and recent history retain the appropriate prior transitions; history at event 7 lists events 2…7. Locale changes preserved full snapshot including preset, event, choice and revealed status; open previous-state disclosure remained open. All three quiz selections required explicit reveal and cleared old feedback on change.

Keyboard checks: Tab from preset skips disabled rewind and lands on Next; Space runs Next; range ArrowRight advances, End reaches event 22 and Home returns to zero. Deep links to sections 02/03/05 place headings below the sticky navigation in tested mobile/desktop sizes. CSS focus styling is present. Clipboard denial exposes a focused/selectable exact-source textarea with equivalent bilingual instructions.

At 200% CSS zoom and 1280×900 in both languages, enlarged text and diagrams remained readable, wrapped and produced no document horizontal overflow. This is a CSS zoom/reflow check; native browser-menu zoom was not separately automated. The navigation strip scrolls horizontally; a partially clipped later item does not remove content. Ordinary scrolling can expose content that sits under sticky navigation after an automated scrollIntoView.

Screenshots actually opened and inspected: cold-initial, cold-end, independent-en-320, independent-zh-390, independent-en-1280, independent-en-zoom200, independent-zh-zoom200, disabled, en-320-step1-viewport and zh-1280-step4-viewport. All are under `30-evidence/30-review-2-54a199ca/`. The full-page endpoint capture includes the sticky navigation at capture scroll position; viewport captures supply clearer transition evidence. Screenshots corroborate direct interaction observations, not learner comprehension.

Actual CSS colors give muted-text/body contrast **7.74:1**. Disabled rewind opacity .4 yields approximately **3.30:1** composited label/background contrast. Its label is decipherable in the inspected close capture but noticeably dim; improving it is optional. No inactive-control WCAG violation or accessibility certification is asserted. Underlining and explicit counts support the color highlight. No page errors were reported by the full bilingual browser checks.

## Stable findings and closure on this revision

Earlier report `specs/reviews/30-review-1-f4f10635.md` was first inspected **after** saving this cold walkthrough. It reviewed c7ed6c7b6fac0370a11be31fd8bbf142ed85b5dd and required two fixes. Compared the old and current lesson diff: canonical solution/core unchanged; metadata added; bilingual legend, remainder explanation, Counter primer, event mapping and amortized-cost explanation updated. This fresh review covers the changed teaching and prerequisites as well as code regressions. The earlier revision was not accepted; there is no accepted base being inherited.

| Stable ID | Earlier reproduction and expected/actual | Severity / violated gate | Current regression evidence and disposition |
|---|---|---|---|
|30-R1-F01|Run validate-only; expected valid lesson metadata, actual old revision lacked lesson-entry.json.|High, required metadata gate.|Current candidate includes a string covering time/space; exact validate-only exits 0. **Closed** against 984e2131bb5bb1b2717cc377957b1684d9650cf0.|
|30-R1-F02|EN/ZH, Excess word, event 6→7 at 390/1280/200%: expected legend matching retained interval; old legend claimed touched positions but highlighted 6…8 while removing 3…5.|Medium, required visual-meaning consistency.|Current bilingual legend explicitly defines retained [left,right), before versus after and removal/reset semantics. Browser checks at add2, overlap-removal5/12, excess-removal7, reset14 verify current and previous hot indices; mobile/desktop/zoom screenshots confirm rendering. **Closed** against the actual current candidate.|

Owner for both historical fixes: lesson maintainer. Fix revision observed: current candidate. Independent reviewer recheck: this report, including direct browser regression, not author assertions. Earlier report/evidence preserved. No new required finding; **required open IDs: []**.

Optional observations: section 02 still presents several rules in dense prose; a fully enumerated multi-removal mini-example before abstraction would reduce reading effort. Disabled labels could be brighter. Test-coverage wording could specify shared versus lesson-local coverage. None supplies a missing essential causal bridge or contradicts the current algorithm.

## Scores and conclusion

| Dimension | Weight | Score / 4 | Observation-based rationale |
|---|---:|---:|---|
|Problem, terms, hand calculation|15|4|Tiny valid/invalid splits precede abstraction; character indices, equal widths, multiplicity and arbitrary output order are clear.|
|Causal derivation and saved work|20|3|Concrete retained foo, explicit remainder tracks and included/excluded rules permit reconstruction; several rules arrive in one dense passage and a multi-removal example is left to code checking.|
|Maintained state and correctness|20|4|All 22 default operations reconstruct counts and intervals; invariant phase is stated correctly; independent examples and frame checks support overlap, resets, boundaries and termination.|
|Interaction and visual meaning|20|4|Predict/reveal/change, before/after and retained history work; corrected legend accurately explains interval highlights; rewind/replay/reset/endpoints are reproducible.|
|Python and cost|15|4|Actual faithful canonical Python executes fresh inputs and boundaries; exact source parity passes; Counter primer and explicit 6→7 bridge match code; amortized time, string work, auxiliary/output memory and mutation behavior are justified.|
|Bilingual and device access|10|3|Equivalent translated reasoning and preserved state, keyboard controls and reflow pass; dim disabled labels and wrapped word groups cause minor friction. CSS zoom methodology is explicitly limited.|

Scores: **[4,3,4,4,4,3]**, weighted **92.5/100**. All dimensions ≥3, no required open finding, browser/source/executable/metadata evidence complete for the stated scope.

**Conclusion: accepted** for candidate 984e2131bb5bb1b2717cc377957b1684d9650cf0. This is separate from publication. No human-comprehension measurement, successful LeetCode submission, native-menu zoom verification or publication claim is made. Only this report and this run's screenshot evidence directory were written; implementation, prior evidence, tests and services were not changed.
