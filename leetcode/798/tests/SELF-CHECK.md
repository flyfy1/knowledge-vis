# #798 author self-check

Status: **ready for independent review**, not independently accepted. Candidate: `3d4eb15375e75003fd87c6f97ca83549a2b71ef414bfe0e03d4d10085f7f9ca3`. Frozen file and shared dependency hashes: [evidence/candidate.json](evidence/candidate.json). Review/release remains pending. No LeetCode submission was made. Only this lesson folder was changed; no registry, campaign state or service was modified.

## Contract and executable checks

Official URL: https://leetcode.com/problems/smallest-rotation-with-highest-score/ . Public GraphQL returned the complete free statement and Python3 snippet `Solution.bestRotation(self, nums: list[int]) -> int`. Captures and access date are in ../provenance/. The internal questionId is 814; the public lesson ID is 798. Chinese wording is authored for this lesson.

- `python3 -B leetcode/798/tests/test_solution.py` — exit 0, **51,569** Python cases (all arrays for n=1..6 and 1,500 seed-798 random arrays). Input mutation checked. Separate slice-and-count oracle supplies expectations, not the optimized interval rule.
- Maximum-length n=100000: all zero, all n−1, increasing values — return 0 under closed-form expectations. The official examples are included in exhaustive cases and return 3 and 0.
- **6,500** browser-core inputs: compare every interval membership with `value > new_index`, every intermediate losing count and score with independent rotation scoring, and every best-so-far identity with the earliest maximum of the completed score prefix. This run predates only copy/navigation refinements; numerical source hashes remained unchanged.
- `node leetcode/798/tests/browser.cjs` — final exit 0. Chromium 156.0.8078.4 on Linux, real preview `http://127.0.0.1:18770/leetcode/798/`.
- `python3 -B scripts/register_leetcode_lesson.py 798 --validate-only` — run from repository root, **exit 0**, empty stdout/stderr. Recorded in [evidence/preflight.json](evidence/preflight.json). No registration was run. Complexity metadata is the single string `O(n) time; O(n) space`.

## Rendered state and interaction evidence

Both locales exercised all six presets; every forward/back/reset/end control, each selected original index, and every scan row. Singleton endpoints correctly disable forward/end. The scan starts with zero completed rotations and no best candidate. At official example 1's endpoint, current k=4 has score 3, while best scanned k=3 has score 4; these remain separate on rewind/replay. Official example 2 keeps earliest answer 0 on its full tie.

The losing-mask test compares each rendered `j` and the localized loses/scores label to direct modular movement. At n=5,i=0,v=2, rendered intervals are [4,4]+[0,0], with losing k=0 and k=4. The actual bilingual interval formula is asserted equal to the complete dictionary value, including endpoints and split condition. Localization pairs and duplicate keys are checked before parsing can silently discard duplicates.

Fresh quiz n=5,i=0,v=3 was exercised in both locales for all three choices. Feedback remains hidden until selection plus reveal, shows the derived {0,3,4}, explains both distractors, clears after changing choice, and preserves selection/reveal through a locale roundtrip. Quiz reset is independent of the shared experiment.

Rendered/copied/downloaded Python, offline mirror and canonical solution match exactly, including trailing newline. Real clipboard success is checked. Before each native manual-fallback attempt, a distinct sentinel is written and read back, automatic write is then rejected, full textarea focus/selection is verified, Linux Control+C is dispatched, and the actual clipboard is read back against canonical source. Blocked localStorage still permits initialization and locale changes. File-URL source display works without network fetches.

Both related links were keyboard-activated in both languages and the destination section was read:

- #689 step2: earliest maximum prefix/suffix candidates, with strict/non-strict tie comparisons. The final label promises preserving the earlier candidate on ties. An initial draft label about prefix sums was corrected before freezing because this destination teaches side maxima and sliding window sums instead.
- #732 step2: start/end net changes, prefix sweep and maximum active events. The label promises counting interval overlaps using endpoint events. Both lessons are in the existing registry and served by the preview. Target file hashes and rendered excerpts are retained; no public release status is inferred.

## Visual and accessibility inspection

Actual headless captures were visually inspected, including desktop EN/zh, 390px EN/zh, 320px EN/zh, 736px EN/zh, and 200% CSS zoom EN/zh. The final 320px scan headers are short enough to remain intact; their definitions remain in adjacent prose/readouts. Selected native option text has a measured width budget with 24px reserved for the arrow. No page overflow was observed. Interval cells stack on phones, with explicit new indices, points and loses/scores labels; the table retains labeled columns and readable values.

Representative inspected files: desktop-en-detail.png, desktop-zh-detail.png, phone320-en-detail.png, phone320-zh-detail.png, phone320-en-scan.png, phone320-zh-scan.png, phone390-en-detail.png, phone390-zh-scan.png, tablet-en-scan.png, tablet-zh-detail.png, and settled200-{en,zh}-step{2,3}.png. Full-page captures can show the sticky navigation over a section at the capture scroll position; settled viewport captures and real deep-link geometry were checked separately. These are author observations, not novice teach-back.

Keyboard Enter/Tab navigates and operates real controls; focus was measured while an enabled button actually held keyboard focus: solid 3px #ffb454 outline, contrast above 3 against the adjacent solid control surface. Forced colors and reduced motion were also exercised. All touched controls are at least 48px high, and the trace has no autoplay or animation.

Measured solid text pairs in browser.json: main text 16.087:1; explanation 12.616:1; hint on panel 7.079:1; disabled text on panel2 6.449:1; mask/source text 13.397:1; active navigation 13.101:1. No unsupported alpha-composite measurement is claimed. The same luminance helper is calibrated against black, white, RGB primaries and #747474/black≈4.492948 (correctly below 4.5). Shared + local CSS totals **10,635 bytes**. Runtime requests are local only; no console/page/asset errors.

Harness notes: a first pass attempted the intentionally disabled singleton End button; the runner now asserts that endpoint instead. A forced-colors check initially inspected programmatic focus after a mouse click, when :focus-visible correctly did not apply. The retained forced-colors-harness-failure.log records that assertion; the corrected runner first enters keyboard modality and checks actual keyboard focus. No runtime focus repair was needed. Final checks pass; these harness corrections do not represent independent review.

## Limits and next action

No independent teaching review, physical mobile device, browser UI/OS magnifier test, public deployment verification, accepted LeetCode submission or actual learner outcome is claimed. Zoom evidence uses browser CSS zoom=2. The next action is a separate reviewer run against this frozen candidate, using the repository's six-dimension rubric and fresh cold walkthrough. Reproduction commands accept OUTPUT_DIR so reviewer evidence need not overwrite the candidate.

## 2026-10-26 append — 798-COPY-R1 author fix evidence

Finding status: **fixed awaiting independent re-review**. The historical accepted candidate remains historical evidence. This is an author self-check, not independent closure or release authority.

Base: `cc3d785f667dd8e20edf6c6f326e8aebc018e888`; checkout HEAD at start: `6b1364e3d5960d3ae74e97b9b50e599f5628c5ba`. Read the supplied request, existing candidate/BRIEF, explainer and trace specs, review gates, rendered-state contract, website-design skill and registration source/mirror table. The report's narrow repair needs no algorithm or hard-bug changes. P0 preserves semantics; P1 removes the footer; P2 has no additions. Other refinements deferred per request.

### Finding-to-fix mapping and identity

`798-COPY-R1`: removed `<footer class="site-foot" data-i18n="foot"></footer>` and its only bilingual dictionary entry. A pre-edit consumer search found the HTML binding and dictionary declaration only; neither app nor core consumes `foot`. The copy script query changes from `798-r1` to `798-copy-r1`. All remaining copy pairs equal the base, including the full `sim` pair. No claim of acceptance replaces the removed text.

The exact bilingual diff is `evidence/copy-r1-after/runtime.diff`. Frozen runtime+metadata manifest: `evidence/copy-r1-after/candidate.json`, aggregate SHA-256 `9f310cc0390da9e5bc80464b7401ca9dff83238efe26b5e5f8f0bf0d37e3ffb0` (compact sorted filename-to-SHA256 JSON). New HTML SHA-256: `906707febd4b073b253352c1af285e3b36ebd1d20dc8021e54b702ce1dd56920`; new copy SHA-256: `0f79e1e46c6dac59d6087c9abdea7fe796b15374db833391d2a49d99db507365`.

Before/after hashes of the five explicitly protected files are equal in both `evidence/copy-r1-before/results.json` and `evidence/copy-r1-after/results.json`. Metadata is also unchanged; complexity remains the single string `O(n) time; O(n) space`. Python is the preferred official interface, corroborated by the lesson-local official GraphQL capture; it also lists TypeScript. No `supportedLanguages` contract exists to omit either interface, and no non-Python language contract is required. Canonical pair read from registration policy: `solution.py` / `python-code.js` / `PYTHON_SOURCE`.

### Reproduction and observed results

From repository root, with the existing preview and supplied browser environment:

```sh
OUTPUT_DIR=leetcode/798/tests/evidence/copy-r1-after node leetcode/798/tests/copy-r1.cjs
python3 -B leetcode/798/tests/copy-r1-python.py
python3 -B scripts/register_leetcode_lesson.py 798 --validate-only
```

- Pre-edit focused browser check failed on `798-COPY-R1: workflow footer must be absent`, after capturing zh→en→zh at 320px. `evidence/copy-r1-before/results.json` records footerCount=1 for each locale state, original runtime hashes, preserved state and no errors. The screenshots retain the old wording. No historical evidence was overwritten.
- Post-edit focused check passes on local Chromium 156.0.8078.4, Linux. Served bytes equal candidate hashes. Every static localization binding matches its exact locale string, there are no duplicate dictionary keys, and the footer/key are absent. All surviving dictionary pairs equal the base. Console, page and HTTP error list is empty.
- On official example 1 `[2,3,1,4,0]`, hand k=1 and scan through k=1 remain unchanged across zh→en→zh. Direct score checking yields 2 then 3; the scan ledger is `[k,event,bad,score,best-k] = [0,3,3,2,0]`, then `[1,-1,2,3,1]`. The readout says 2/5 rotations processed and distinguishes current/best scanned candidates; final result remains hidden. These are counts of rotations and losing entries, not a cumulative comparison counter. The complete losing-interval formula and after-event frame explanation remain intact.
- Independent quiz remains selected and revealed across the locale roundtrip: n=5, i=0, v=3 loses at k={0,3,4}, since new indices are {0,2,1}. Feedback retains `l=(0−3+1+5)%5=3`. Its scope remains this single value, separate from the preset and total score.
- In each locale, displayed `textContent`, embedded/offline source, automatic clipboard text, actual native manual-fallback copy and downloaded bytes equal canonical Python exactly, including the final newline. Each fallback attempt first writes and verifies its own distinct sentinel, then forces write rejection, checks textarea focus/full selection and presses Linux Control+C. Offline file loading also matches canonical source.
- Page-end captures at 320px and 1280px with CSS zoom=2 were visually inspected in both locales: `evidence/copy-r1-after/end-{zh,en}-320-zoom1.png` and `end-{zh,en}-1280-zoom2.png`. Related links wrap, focus outlines remain visible, and no footer gap survives. Document width equals viewport width; measured main-end gap is under one pixel. Real Shift+Tab/Tab reaches both neighboring links in order. No styles or tokens changed.
- Actual canonical Python executed on fresh `[3,0,1,2]`: physical rotations score `[3,4,1,2]`, so best k=1; return is 1 and input is unchanged. Exact offline mirror also passes. Recorded in `evidence/copy-r1-after/execution.json`. No broad numerical suites were rerun for this prose-only change, as requested.
- Mandatory safe preflight `python3 -B scripts/register_leetcode_lesson.py 798 --validate-only` returned **exit 0**, with empty stdout/stderr. Exact command/result recorded in `evidence/copy-r1-after/preflight.json`. No registration was run; no metadata fix was necessary.

Harness corrections are retained in `evidence/copy-r1-after/harness-notes.txt`: an incorrect initial handwritten smoke expectation and an immediate visibility assertion racing asynchronous clipboard completion. Only the assertions/wait were corrected; no runtime repair followed either harness issue.

Next action: a fresh reviewer must inspect this hash-bound candidate and independently close `798-COPY-R1` against the narrow report requirements. Physical devices, browser UI zoom, public delivery, learner outcomes and LeetCode submission acceptance remain unverified. This candidate is ready for that separate re-review only.
