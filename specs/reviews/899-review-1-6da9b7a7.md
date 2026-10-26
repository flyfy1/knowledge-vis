# Independent review: 899 Orderly Queue

Candidate: `0e635f825c8db7c709544d7cad035efe583336d8`. URL: http://127.0.0.1:18770/leetcode/899/. Review run: `899-review-1-6da9b7a7`; reviewer identity/model not independently supplied. Target: basic Python, lists, loops, functions, elementary recursion. Frozen weights: 15/20/20/20/15/10.

## Cold browser walkthrough (saved before source access)

Read only the frozen rubric before opening Chromium through Playwright, desktop 1280×900. No BRIEF, source, test output, prior reviews or author notes read. The following observations come from the rendered lesson and interactions.

1. **Move one letter card.** Question: what move is allowed and what answer is requested? Action: read the card example and manually follow `cba`, k=1. Observation: only the first card can move; `cba → bac → acb → cba`. Positions are explicitly one-based, bounds and lexicographic comparison explained. Conclusion: `acb` is the smallest reachable answer, although `abc` would be smaller if reachable. Removing a card preserves the order of the others.
2. **What survives a rotation?** Question: why are these all the candidates, and what work is saved? Action: read the displayed BFS and rotation argument, enumerate the three cuts. Observation: BFS stores distinct strings and tries each of k legal removals; the lesson explains factorial growth, string copying/hashing, suffix/prefix slices, circular order, modulo n and repeated-letter duplicates. Conclusion: k=1 cannot change circular order, and every move count equals one of n cuts; retaining only the best avoids the set of all arrangements. Sorting always is disproved by cba; insisting each move decrease is disproved by bca.
3. **Can one extra choice enable swaps?** Question: why does k=2 change reachability? Action: hand-follow `abc → acb → cba → bac`; predict cba k=1 will show bac, acb, cba, then click next three times. Observation: before/after cards and complete history match those predictions; final current cba is explicitly distinguished from minimum acb. Select cba k=2 and go to end, then rewind. Observation: `cba → cab` removes position 2, then `cab → abc` removes position 1. Conclusion: choosing the second card breaks circular order; moving y from xyR and rotating produces yxR, and rotating a later pair to the front and restoring the cut enables every adjacent swap. Bringing successive smallest letters forward reaches sorted order, which is minimal among all arrangements of preserved counts.
4. **Predict, then reveal.** Question: can the invariant transfer? Prediction BEFORE reveal: bdac has cuts bdac,dacb,acbd,cbda, so acbd wins; abcd is illegal for k=1. Action: choose acbd and check. Observation: feedback lists those cuts, rejects sorting and explains k=2 would permit abcd. Action: select bca k=1 and advance once. Observation: cab is larger while best remains bca. Conclusion: temporary increases are necessary; the optimum is a property of the reachable set, not monotone intermediate improvement.
5. **Turn the proof into Python.** Question: how does the invariant become a direct answer? Action: read rendered mapping and costs. Observation: cut i maps to `s[i:] + s[:i]`, best starts at zero-move s and retains the minimum over tested cuts; k≥2 joins sorted letters. Conclusion: cba cut 1 creates bac and cut 2 creates acb, with O(n²) time/O(n) space for rotations and O(n log n)/O(n) for sorting. String input is not modified. Complete submission is initially behind a disclosure; execution/parity remains for the source audit.

Independent fresh input prediction, recorded before code execution: `dcab`, k=1 → `abdc` (cuts dcab,cabd,abdc,bdca), whereas tempting sorting gives unreachable `abcd`. For k=2 predict `abcd`. UI offers only six presets; these custom checks will be **code checks**, not UI experiments. Boundary predictions: z/1 → z; repeated aaaa/1 → aaaa; baab/1 → aabb; baab/4 → aabb.

Cold screenshots: `899-evidence/899-review-1-6da9b7a7/cold-initial.png`, `cold-swap.png`, `cold-reveal.png`. Later sections will record screenshot inspection, source and interaction audit separately.

## Candidate identity and source audit

`git rev-parse HEAD` matched the requested revision. `git status --short` showed only this run's report/evidence as untracked, with no candidate changes. Independently fetched served assets and compared raw bytes to the checkout. Hashes (SHA-256):

| File | SHA-256 |
| --- | --- |
| index.html | d248be24889051bc4e8914f17ed75babe3788e109c29f7ebdc1db2276af284ba |
| style.css | 3f2fc4eaaf7e6d39e0edae9210b93262f1da8664eaffdac5de31980b89581139 |
| core.js | 8675568a9312d90d2fb739f87f112881712c9be5b22c9df94244555bb892c19e |
| app.js | 0964c8a94c98486fae36494cb0808e29c64aa2d7eaa1fc1878b2971019b64a93 |
| copy.js | c001900ca620e3e2a1d3605b118f98b49c158b92f0b8dafda66afcb16f1e4c97 |
| python-code.js | 9d3ec49bdf9ab462b7d1ed0ca4ef1b5a8d7f2c6dffe6dd30b7939fb8ba9f4a05 |
| solution.py | 7f450d6ea014e42f3a8bcde7e396d36353344a08eef3ba9bb43c1391902833f4 |
| ../style.css | 6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27 |
| ../common.js | f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b |

Read the [official statement](https://leetcode.com/problems/orderly-queue/) normally through the web tool, without bypass: move rule, both examples, lowercase alphabet and `1 ≤ k ≤ len(s) ≤ 1000` match the lesson. Inspected lesson-local `provenance/official.json`, including the Python3 snippet `class Solution: def orderlyQueue(self, s: str, k: int) -> str`. The canonical implementation faithfully uses that callable and returns a string. Python is the preferred actual submission, not an analogy; non-Python language-contract verification is inapplicable. No live language-selector verification or actual submission is claimed.

Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python names are `solution.py`, `python-code.js`, `PYTHON_SOURCE`. The mirror is exactly the JSON-encoded canonical text, including its final newline. Browser checks compare `textContent`, successful clipboard reads, native manual clipboard reads and downloaded bytes against that same source without trimming. Offline file loading also renders the exact source.

The canonical loop initializes best to s, covering zero moves, then enumerates cuts 1 through n−1. Each slice concatenation is the state after i first-letter moves. Comparing only to best preserves the minimum over cuts 0..i. Termination exhausts all distinct cut positions, even if some values repeat. Sorting is used only where the constructive adjacent-swap proof applies. Strings are immutable and the function performs no input mutation. Python slicing/concatenation and worst-case comparison give O(n²) time for k=1, with O(n) simultaneously live string storage. `sorted` plus `join` gives O(n log n) worst-case time and O(n) auxiliary storage for k≥2. The BFS baseline's O(k·n·n!) / O(n·n!) bounds are valid upper bounds (loose for k=1); copying/hash costs are accounted for, and k,n cannot be zero in the valid domain.

Inspected `core.js`, `app.js`, dictionary and styles. Trace frames store the actual previous string and zero-based chosen j; rendered operations correctly convert to one-based positions. Current cards, before cards, progress count and history refer to the same completed-move frame. Minimum is recomputed only over the displayed prefix, so rewind does not leak future minima. At cba/1 end, current=cba and optimum=acb remain correctly distinguished. The simulator is explicitly labeled as a separate teaching path, with omitted BFS branches stated; it does not falsely advertise itself as Python execution. Adjacent-swap construction was independently checked with rotate/move/restore operations, including n=2 and interior pairs.

No earlier 899 review report was found after the cold walk (`rg --files specs/reviews` filtered for 899 Markdown showed only this report). There are no earlier required finding IDs to close. No author BRIEF or prior author screenshot supplied missing cold explanations.

## Executed checks and observations

Inspected all three test scripts before executing. Their output routing was checked first: only `check.py` and `browser.cjs` generate artifacts, both honor OUTPUT_DIR; `copy-check.cjs` prints only. All generated files went into this run's exclusive evidence directory, leaving frozen candidate evidence untouched. The suite's JSON `kind` fields retain its original author-self-check labels; these reruns are supporting measurements, not independent comprehension claims.

Commands, from repository root:

- `OUTPUT_DIR=specs/reviews/899-evidence/899-review-1-6da9b7a7 python3 -B leetcode/899/tests/check.py` — exit 0. Canonical Python, displayed BFS, independent graph closure, intermediate best invariant, 6 preset traces, 21 constructive swaps, 6,015 exhaustive input/k cases and 160 seeded cases passed. See `logic-result.json`.
- `node leetcode/899/tests/copy-check.cjs` — exit 0. Acorn AST detects duplicate dictionary keys before evaluation; bilingual two-string arrays and placeholder parity passed.
- `OUTPUT_DIR=specs/reviews/899-evidence/899-review-1-6da9b7a7 node leetcode/899/tests/browser.cjs` — exit 0. Chromium 156.0.8078.4, Linux. See `browser-result.json` and `asset-diagnostics.json`.
- **Required safe preflight:** `python3 -B scripts/register_leetcode_lesson.py 899 --validate-only` — exit 0, no stdout (also rerun separately with the same result). No registration performed. Metadata complexity is one nonempty string: `k = 1: O(n²) time; k ≥ 2: O(n log n) time; O(n) auxiliary space in both cases`.

Separate reviewer-authored code checks executed the actual canonical Python via `runpy`, with an independent list-pop/append reachability oracle. Predictions saved in the cold walk were confirmed:

| Input | k | Predicted and actual | Distinct reachable states |
| --- | --- | --- | --- |
| dcab | 1 | abdc | 4 |
| dcab | 2 | abcd | 24 |
| z | 1 | z | 1 |
| aaaa | 1 | aaaa | 1 |
| baab | 1 | aabb | 4 |
| baab | 4 | aabb | 6 |
| ba | 2 | ab | 2 |

`abcd` is a concrete counterexample to “always sort” for dcab/1: absent from all four reachable states. For dcab the loop's candidate/best pairs are cabd/cabd, abdc/abdc, bdca/abdc; a later candidate does not overwrite the optimum. At n=1000, independently checked `z*999 + a` for k=1,2,1000, all returning `a + z*999`. These are code checks, not custom UI experiments.

Browser observations beyond raw pass counts:

- In both locales, traversed all six presets, every next move and rewind/replay; reset returns to one history entry, and endpoint disables next/end while start disables previous/reset. Slider endpoints and a separate ArrowRight keyboard operation work. Prefix history, operation, before/after and move count agree. Preset endpoints are acb, abc, aaabc, abc, aaaa, z respectively.
- At baaca/3 move 1, operation says remove b at position 1, current=aacab, before=baaca, minimum-so-far=aacab. Locale en→zh→en roundtrip preserves preset, completed frame, checked prediction, revealed feedback and open source disclosure. A separate zh roundtrip kept the incorrect-choice feedback and translated the concrete move correctly.
- Tested all three prediction choices. Selecting a new choice hides old feedback; reveal grades the chosen value and explains all four rotations and the k=2 contrast in both languages. Changing simulation preset preserves this separate fixed bdac exercise, consistent with “restarts only this experiment.”
- Source copy succeeds twice per locale. Manual fallback succeeds twice per locale after a **fresh verified non-source sentinel before each attempt**, forced clipboard-write rejection, focused/full textarea selection and actual Linux `Control+c`; readback equals canonical source including final newline. Download bytes match in both locales. No clipboard source was injected by the test to fake a transfer.
- Bilingual H1/document titles exactly match `#899 · Orderly Queue` / `#899 · 有序队列`. Read both rendered explanations: bounds, circular-order and count invariants, xyR→xRy→yxR construction, rotate/restore, sorting optimality, formula operands, Python mapping, costs and counterexamples have equivalent meaning. Duplicate-key checks are complemented by these rendered semantic observations.
- Keyboard Enter rewinds, range ArrowRight advances, and focus outline is 3px. At 320 px, keyboard focus scrolls the horizontal navigation to its last link and Enter settles #step4 at about 90 px below the viewport top in both locales. Immediate pre-settlement coordinates during smooth navigation were not treated as defects.
- Tests exercise 320/390/736/1440 px, both locales, storage denial, reduced motion, forced colors and local offline loading. At 320 px, `baaca · k=3` text measures 83.904 px inside 206 px available after padding and a 20 px arrow reserve (256 px control); screenshot confirms its closed label is complete. Font stack is `"PingFang SC", "Microsoft YaHei", system-ui, sans-serif`; actual resolved fonts on other hosts are unverified.
- Calibrated contrast helper uses .2126/.7152/.0722, black/white=21, primary channels and the just-failing #747474/black=4.492948 case. Actual sampled solid-color text minimum was **6.449407898769069**, including readable disabled next text, fg [154,167,184] on bg [28,35,48], opacity 1; focus pairs exceed 3. No product contrast defect inferred from screenshots alone.
- Keyboard-followed related links in both languages. #41/#step1 actually explains x→x−1 placement and permanent correct slots; #871/#step2 actually explains maximum-fuel exchange safety. Local destinations were available and the labels match their reasoning. Target release revisions were not established. Only diagnostic console error was a legacy #41 favicon request; no 899 runtime error or lesson asset failure observed.

## Screenshot inspection

Personally inspected this run's `cold-swap.png` (full-page overview), `state-320-en.png`, `controls-320-zh.png`, `state-390-zh.png`, `state-1440-en.png`, `zoom-200-en.png`, `zoom-200-zh.png`, and additional reviewer captures `dense-320-en.png` / `dense-320-zh.png`. The latter show baaca/3 after one move: five numbered cards wrap as four plus one, retain their association and do not overlap text. Actual card geometry is 48×66.75 px with scrollWidth=clientWidth=48. Before/after labels, values, position numbers and current-history marker remain legible. The current marker uses explicit text and weight as well as cyan, distinct from keyboard outline; letters, not color, convey the string.

Sticky navigation clips offscreen horizontally and some screenshots begin mid-paragraph because the state was scrolled into view. These are viewport/capture boundaries, not text collisions: ordinary vertical scrolling exposes the paragraphs; keyboard focus exposes later navigation links. Desktop cards are side by side; narrow cards stack by snapshot and wrap within each string. Dense five-letter strings therefore require following numbered rows, a minor access friction. The control screenshot shows disabled buttons still readable. Zoom screenshots use Chromium CSS zoom=2 at 1440 px, with no page-wide overflow and readable state; native browser-chrome zoom and physical-device testing are not claimed.

## Scores and findings

| Dimension | Weight | Score /4 | Observation and rationale |
| --- | --- | --- | --- |
| Problem/terms/hand calculation | 15 | 4 | Defined move, lexicographic goal, bounds and indices; tiny cba calculation precedes formal invariants. |
| Derivation/saved work | 20 | 4 | Explicit executable baseline and factorial repeated work; complete rotation argument and constructive adjacent-swap bridge justify avoiding search. |
| Maintained state/correctness | 20 | 4 | Circular order and letter counts, exhaustive cuts, adjacent-swap reachability/optimality, best-prefix invariant, termination and boundaries independently reconstructable and checked. |
| Interaction/visual meaning | 20 | 4 | Predict/reveal/change, replay/history, before/after, current versus optimum and independently labeled simulator all match observed values. |
| Python/cost | 15 | 4 | Actual faithful callable executed on fresh inputs and boundaries; exact source transfers; transition mapping, immutable input and separate submission/simulation costs clear. |
| Bilingual/device | 10 | 3 | Equivalent reasoning, good contrast and working keyboard/state preservation; narrow five-letter wrapping and horizontal navigation add minor reading/navigation friction. |

**Weighted score: 97.5/100. Required open finding IDs: none.** No mathematical, causal, source-parity, interaction or essential-readability defect was reproduced. No finding closure is inferred from test counts.

## Conclusion and limits

**Accepted** for candidate `0e635f825c8db7c709544d7cad035efe583336d8`, within this independent browser/source review. All dimensions ≥3, score ≥85, required preflight passed, and no required findings remain. This is separate from publication authorization or public delivery verification.

Review established reconstructability by this run and computational/browser behavior under the recorded checks. It does not establish real novice comprehension, a successful LeetCode submission, physical-device/native zoom behavior, every host font environment, or production availability. Only this report and this run's exclusive evidence directory were written; implementation, tests, author evidence, services and Git configuration were left unchanged.
