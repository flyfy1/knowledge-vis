# #675 author self-check — candidate author-r1

Status: complete author candidate, ready for a separate independent review. No independent acceptance, LeetCode submission, deployment, or real learner outcome is claimed. Only `leetcode/675/` is owned by this run. Author identity: Codex; exact model identifier unavailable. Reviewer and acceptance: pending. The frozen runtime/test/provenance identity is recorded in `tests/evidence/candidate.json`.

Official verification: public LeetCode GraphQL returned the complete statement, constraints, all three examples, and actual language-selector code snippets, including `Python3` with `class Solution: def cutOffTree(self, forest: list[list[int]]) -> int`. Raw response, exact query, URL and timezone-qualified capture date are in `provenance/official.json`. Python is the preferred supported canonical submission. This is public authorized access; no restricted content was needed.

Checks executed from the repository root:

- `python3 -B leetcode/675/tests/test_solution.py`: passed 649 independently expected small cases; canonical Python and visible HTML baseline executed. The primary oracle searches location plus cut-progress rather than adding shortest legs. All official examples give 6, -1, 6; fresh exercise gives 5. Maximum 50×50 row-major and shuffled-height open forests give 4900 and 83665 using separately calculated Manhattan expectations. Input is preserved. Raw localization pairs, duplicate definitions and exact source mirror pass.
- `node leetcode/675/tests/test_core.cjs`: passed 6,025 snapshots across the oracle cases. Every assigned distance, current layer, completed leg, cumulative total and deep snapshot independence was checked. Preset outcomes are 3, 10, -1, 0, 9, -1.
- `node leetcode/675/tests/browser.cjs`: real Chromium passed both locales and all six presets, full forward/back/replay/reset/end behavior, zero-step and already-terminal boundaries, predictions before reveal / all choices / reveal / changed choice, locale preservation, static formulas and rendered grid values, source display, actual clipboard write/read, downloaded exact bytes, sentinel-seeded manual fallback copied by the Linux host's Control+C and read back exactly. Storage-denied startup and offline file opening pass. Every local anchor exists. No runtime console errors, bad assets or external requests were observed.
- `node leetcode/675/tests/focused.cjs`: passed both-language prediction states, actual disabled-primary style, unclipped locale-container focus, contextual keyboard Enter/focus, and repaired 320px zoom headers. Screenshots supplement full browser evidence.
- `python3 -B scripts/register_leetcode_lesson.py 675 --validate-only`: passed, exit 0. Exact command, stdout/stderr and unchanged-file verification are retained in `tests/evidence/metadata-preflight.json`. Complexity is one nonempty time-and-space string. No registration was run.

Device matrix: English and Chinese at 320, 390, 736 and 1440 CSS px. 200% CSS layout zoom in Chromium at 320, 390 and 1440 px in both languages. Document and cell overflow checks pass. Cold desktop, both locale audit montages, focused narrow-grid/zoom captures, prediction before/reveal, fallback textarea and contextual keyboard outline were visually inspected. The grid retains readable original heights, discovered distances, walls and F/T/× markers; controls reflow without clipped labels. The primary diagram and ledger describe the same frame. The detour's frame 6/13 has target distance 6 but completed-leg total 0; only the following cut records those six moves. Unreachable final output -1 remains distinct from any already completed walking total.

Measured rendered contrast: body text 16.09:1, explanatory text 12.62:1, muted text on canvas 7.74:1, cell text 13.40:1, opaque disabled text on panel2 6.45:1, primary text 13.10:1, orange focus against panel2 8.94:1. All measured text meets AA and boundaries/focus exceed 3:1. Shared plus local shipped CSS is below 25,000 bytes (exact final count in browser-results.json). Colors are unchanged approved tokens. The disabled-primary specificity fix and zoom/header fixes are documented with original failure context in harness-note.txt.

Source fidelity: `solution.py`, decoded `python-code.js`, rendered `textContent`, successful copied text, manually copied fallback text, and downloaded bytes agree exactly including the final newline. The browser visualization is a separate deterministic simulation, grouping queue operations into full layers; it is never presented as execution of this Python. Snapshot retention is not claimed as submission space.

Evidence scope: automated and author visual checks only. CSS layout zoom does not establish browser-chrome zoom or real-phone behavior. Screen-reader hardware, physical devices, learner teach-back, independent rubric scoring, accepted LeetCode submission and public delivery remain unverified. A separate source-blind reviewer should use the frozen candidate and current six-dimension rubric before reading this report or BRIEF. Reproduction instructions are in tests/README.md. No shared registry, concept map, campaign records, services or Git configuration were changed.

## Repair candidate 675-r1-fix — 2026-10-25

**675-R1-01: fixed awaiting independent review.** Historical review
`specs/reviews/675-review-1-feae1887.md` remains changes_required for its original
candidate. The earlier self-check's blanket claim that controls had no clipped
labels was incorrect; the independent review and saved red reproduction supersede
that claim. No author check closes this finding or grants independent acceptance.

Cause and fix: native select text could wrap (`white-space:normal`) but the
control retained a single-line intrinsic height. `#preset{width:100%;field-sizing:content}`
in lesson-local style.css gives wrapped text its full height and preserves native
selection, arrow, keyboard behavior, option wording and font size. The stylesheet
query version is bumped in index.html. There are no algorithm, copy, metadata,
canonical Python or source mirror changes.

Evidence is exclusively under `tests/evidence/r1-before/` and `r1-fix/`. The same
selected-label regression fails against the original stylesheet (Playwright
interception, no runtime mutation) and passes against the fixed served candidate.
Commands from repository root:

- `STYLESHEET_UNDER_TEST="$PWD/leetcode/675/tests/evidence/r1-before/style.css" OUT_DIR="$PWD/leetcode/675/tests/evidence/r1-before" node leetcode/675/tests/selected-labels.cjs`: exit 1, expected red reproduction; original CSS is copied read-only from HEAD. Original required English 320px states clip vertically. `selected-labels.json` and `test-output.txt` retain the failure.
- `OUT_DIR="$PWD/leetcode/675/tests/evidence/r1-fix" node leetcode/675/tests/selected-labels.cjs`: exit 0, 48 closed-label checks, no horizontal/vertical clipping. All six presets × both locales × 320/390px × 100%/200% CSS layout zoom. Preset 4 includes EN→中→EN and the reverse roundtrip, preserving selection. Text may wrap; its entire label, count/unit and native arrow remain readable.
- Same `OUT_DIR` with `python3 -B leetcode/675/tests/test_solution.py`: exit 0, 649 cases, real canonical Python and rendered HTML baseline, official 6/-1/6, maximum-grid answers 4900 and 83665, input preservation, 83 paired localization entries with duplicate-key checks, exact source mirror.
- Same `OUT_DIR` with `node leetcode/675/tests/test_core.cjs`: exit 0, 6,025 snapshots, independent Floyd distances, ledger and cumulative totals, rewind isolation. All six preset results 3/10/-1/0/9/-1.
- Same `OUT_DIR` with `node leetcode/675/tests/browser.cjs`: exit 0, all frames/presets in both locales, prediction scope/change/reveal/locale retention, endpoints/rewind/replay, formula and rendered-state checks, exact canonical/rendered/embedded/copied/downloaded bytes, sentinel-seeded Linux Control+C fallback with actual clipboard readback, keyboard focus, denied storage, offline source, local links and no console/network errors. 320/390/736/1440px and existing CSS-zoom matrix pass. Combined CSS 11,680 bytes. Contrast values remain unchanged.
- Same `OUT_DIR` with `node leetcode/675/tests/focused.cjs`: exit 0, both-locale formula/prediction checks, disabled controls, 320px zoom headers and contextual keyboard focus.
- `python3 -B scripts/register_leetcode_lesson.py 675 --validate-only`: exit 0, empty stdout/stderr; safe non-mutating preflight. Receipt and file hashes are in `r1-fix/metadata-preflight.json`. Complexity remains exactly the nonempty string `O(Tmn + T log T) time; O(mn + T) auxiliary space`.

Language audit: read exact LANGUAGE_FILES in scripts/register_leetcode_lesson.py;
Python uses solution.py / python-code.js / PYTHON_SOURCE. Saved official selector
evidence in provenance/official.json supports faithful Python3 Solution.cutOffTree
and TypeScript cutOffTree. Python is already canonical and preferred; no non-Python
language contract or supportedLanguages exclusion exists. No regeneration is
needed because canonical source and decoded/displayed/copied/downloaded mirror
agree exactly, including terminal newline.

Candidate: `r1-fix/candidate.json` freezes lesson runtime, provenance, metadata,
documentation and regression files by SHA-256 plus base revision; no commit was
created. Separate re-review should inspect the original reproductions, revised
closed control and screenshots against those exact bytes. Native browser is Linux
Chromium 156.0.8078.4 with the recorded system-font stack (exact resolved font
unavailable). CSS zoom is not browser-chrome zoom; physical devices, other browser
engines and cross-platform font equivalence remain unverified. The field-sizing
repair is verified in this environment. No publication, independent closure or
real learner outcome is claimed.

Visual inspection for this repair: opened the original failing 320px English
example-2 context; opened fixed 320px English example-2 and revisits contexts,
English revisits at 200% and Chinese example-2 at 200%. Opened both derived
`en-selected-label-audit.png` and `zh-selected-label-audit.png`, covering all 16
reported-preset closed-control captures at 320/390px, 100%/200%, both locales.
Original control cuts off its second line; repaired controls contain every line
and arrow. At the tightest CSS zoom, long English words wrap across lines;
count and unit remain fully present in the same selected control. No font-size
reduction, ellipsis, hidden label or replacement result is used.
