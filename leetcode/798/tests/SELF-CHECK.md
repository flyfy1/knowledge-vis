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
