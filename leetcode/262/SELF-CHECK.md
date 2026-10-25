# Self-check evidence

- Official source capture: `provenance/official-capture.md`; GraphQL summary: `provenance/official-graphql.json`.
- Canonical oracle: `tests/test_solution.py` passed with `/tmp/venv262/bin/python` (sample, banned driver, date boundary).
- Browser: `tests/test_browser.cjs` passed against `http://127.0.0.1:18770/leetcode/262/` at 390px; tested locale switch, all forward steps, reset, prediction reveal/change, no page errors. Screenshot output is controlled by `OUTPUT_DIR`.
- Source parity: `python-code.js` JSON string equals `solution.py` byte-for-byte.
- Preflight: `python3 -B scripts/register_leetcode_lesson.py 262 --validate-only` → exit 0.

This is author self-check evidence, not independent review or acceptance.

## Revision self-check — FIND-262-001 fix

- Fix mapping: `FIND-262-001` is addressed in the bilingual `hand` and `task` copy. The opening explanation now works 2013-10-01 as `1 cancelled / 3 eligible = 0.33`, then names the requested one-row-per-day output and exact columns `Day` and `Cancellation Rate` before the trace abstraction.
- Browser regression: `OUTPUT_DIR=/tmp/lesson262-review-final node leetcode/262/tests/test_browser.cjs` → `browser checks passed`. The test asserts the worked example and output columns in English, switches to Chinese and asserts the equivalent meaning, then runs the full trace, reset, and prediction reveal/change path.
- Canonical execution: `/tmp/venv262/bin/python leetcode/262/tests/test_solution.py` → `oracle checks passed` (sample, banned-driver/date-boundary cases).
- Metadata preflight (from repository root, non-mutating): `python3 -B scripts/register_leetcode_lesson.py 262 --validate-only` → exit 0.
- Source parity remains unchanged: `python-code.js` is the exact embedded `solution.py` source mirror; the lesson continues to use the faithful Python/Pandas interface.

This remains author self-check evidence; `FIND-262-001` is fixed awaiting a fresh independent re-review of the new candidate.

## Revision self-check — FIND-262-002 fix

- Fix mapping: `FIND-262-002` was caused by binding the full `quiz` question to both a prose paragraph and the fieldset legend. The redundant paragraph was removed; the legend remains the single visible and accessible question label immediately before the choices in both locales.
- Red feedback loop before the edit: a Playwright assertion against the served page reported `{"count":2}` for `#step3 [data-i18n="quiz"]` in English, with the same question text twice.
- Focused browser regression after the edit: EN and zh each reported one `quiz` node, zero explanatory duplicates, and the expected localized legend; selecting the correct choice and revealing still displayed feedback. Command: `node - <<'NODE' ...` (390px Chromium check against `http://127.0.0.1:18770/leetcode/262/`) → one node in each locale.
- Full browser regression: `OUTPUT_DIR=/tmp/lesson262-review-final node leetcode/262/tests/test_browser.cjs` → `browser checks passed`.
- Canonical execution: `/tmp/venv262/bin/python leetcode/262/tests/test_solution.py` → `oracle checks passed`.
- Metadata preflight from repository root (non-mutating): `python3 -B scripts/register_leetcode_lesson.py 262 --validate-only` → exit 0.

This remains author self-check evidence; `FIND-262-002` is fixed awaiting a fresh independent re-review of this new candidate.


## Revision self-check — 262-PUB-R1 (2026-10-25)

Status: **fixed awaiting independent re-review**. Candidate identity is frozen in
`tests/evidence/public-title-20261025/candidate.json`. This is author evidence;
prior independent reports and acceptance history remain unchanged.

- Fix mapping: `262-PUB-R1` → Chinese `title` and `docTitle` in `copy.js` now
  identify `#262 · 行程与用户`. English identifies `#262 · Trips and Users`.
  `index.html` versions the changed copy asset. The exact official URL is preserved.
  The renderer, teaching sequence, Pandas implementation and source mirror are unchanged.
- Applied website-design skill from
  `/home/songyy/Documents/agent-skills/website-design/SKILL.md` to the existing UI.
  Product-fit verdict: reuse the established lesson and locale controls. P0/highest-return
  scope is correct localized identity and regression evidence. No new feature/layout,
  token or motion change; P1/P2 and decorative work are outside this repair.
- Red: `OUTPUT_DIR=leetcode/262/tests/evidence/public-title-20261025/red node leetcode/262/tests/test_browser.cjs`
  → exit 1 against original copy. `red/result.log` records expected Chinese H1
  `#262 · 行程与用户`, actual `#262 · Trips and Users`; `red/failure.png` retains
  the failing page. `red/initial-doc-title-result.log` also records the original
  document title lacking the problem ID. Original publication evidence in
  `specs/reviews/262-evidence/public-title-20261025/` was not modified.
- Green: `OUTPUT_DIR=leetcode/262/tests/evidence/public-title-20261025/green node leetcode/262/tests/test_browser.cjs`
  → exit 0; see `green-result.log`. Replaced the incorrect Chinese-H1-contains-Trips
  assertion with exact H1, document-title, document-language, pressed-locale and URL
  assertions. Preserved worked-example/output-column, full trace, reset and prediction
  checks. Added rewind/replay, hidden-feedback-on-choice-change, single prediction
  question, formula text, and state retention across locale roundtrips.
- Rendered-state regression: sample completion has daily rates 0.33, 0.00, 0.50;
  rewinding the last cancellation makes the final day 0.00, replay restores 0.50.
  Transfer prefix processes two rows but retains one eligible completed trip,
  giving 0/1 = 0.00. Switching EN → zh → EN preserves preset, processed row,
  row rates, daily counters, selected incorrect answer and revealed feedback.
  The prediction remains its separately specified two-row input; changing the
  trace preset does not reset it. Formula text retains all operands and operators.
- Both locales tested at 320/390/736/1440 CSS px with no page overflow or title
  text outside the viewport. Screenshots `green/{en,zh}-*-title.png` are retained;
  both 320 px title screenshots were visually inspected. Chromium on Linux uses
  the supplied executable environment setting. No shared CSS changes were needed.
- Harness diagnostics: initial added expectations used paraphrased rate/feedback
  labels; corrected them to the actual localized labels. A heading-height assertion
  mistook visible font ink extending 1 px past line-height for clipping (scrollHeight
  71/clientHeight 70; overflow visible). Replaced it with text-range viewport bounds
  and visible-overflow checks; diagnostic screenshot retained under `harness-diagnostics/`.
  These were test assumptions, not product defects.
- Exact source: decoded `python-code.js`, rendered `textContent`, successful clipboard,
  native manual-fallback copy and downloaded bytes all equal `solution.py`, including
  its final newline. Fallback seeded a distinct clipboard sentinel, forced writeText
  rejection, verified focus/full selection, used Linux Control+C, and read back the
  result. Both locales exercised. Already-rendered source remains exact with the
  browser offline; this is not a claim of offline navigation or a service-worker cache.
- Canonical execution: `/tmp/venv262/bin/python -B leetcode/262/tests/test_solution.py`
  → exit 0, `oracle checks passed` (sample, banned driver, date boundaries).
  Python/Pandas is the faithful preferred official interface documented in
  `provenance/official-capture.md` and `official-graphql.json`; no non-Python
  language contract or supportedLanguages list exists or needs changing.
- Required metadata preflight from repository root:
  `python3 -B scripts/register_leetcode_lesson.py 262 --validate-only`
  → exit 0, no output; receipt in `checks.json`. Existing complexity remains the
  single string `O(T + U) expected time; O(T + U) space`; metadata was not changed.

Limits: local Chromium and Pandas self-checks establish the tested behavior only.
No public deployment, independent acceptance, LeetCode submission, real-device or
novice-comprehension result is claimed. Next action: independently re-review the
frozen candidate against `262-PUB-R1` and the required complete review scope.

## Review-4 required-finding repair — 2026-10-25 (author self-check)

Candidate: `262-review4-fixes-20261025`, an uncommitted lesson-local snapshot on
base HEAD `f1f6e25eb6ed50a9d3ad7ecea2429dca6adeae7d`.
Exact candidate files and served-byte hashes are frozen in
`tests/evidence/review4-fixes/candidate.json`. No commit requested or made.
Prior report `specs/reviews/262-review-4-45c98297.md` remains historical evidence;
its findings are **fixed awaiting independent re-review**, not author-closed.

Fix mapping:

- **FIND-262-003:** section 3 defines T/U and a correct full-scan baseline:
  first four sample trips × three dates = 12 date checks, with two complete
  eight-user scans per trip = 64 user-row checks. Section 5 works the actual
  active one-column table `[1,3,4,10,11,12,13]`, renamed match keys, default
  inner-merge matching and surviving trip IDs after each merge. A banned-driver
  variant shows why the second merge matters; unique user keys explain why
  joins do not multiply trips. Date filtering/copy, status-to-integer conversion,
  `[0,0,1]`, grouping, sum=1/count=3, rounding and output columns all map to
  executable Pandas. The cost now names **two** merges, expected hash lookup,
  fixed three date groups, and intermediate-frame storage. A fresh 7→70/71 case
  transfers to 0.50 with an absent day and an outside-window exclusion. Both
  locales have the same causal values and conditions. Related links no longer
  advertise unrelated lessons #41/#135 as Pandas join/aggregation lessons.
- **FIND-262-004:** section 3 and its localized formula explicitly guard BOTH
  increments by eligibility. Excluded rows change neither counter. The worked
  transitions are #1 `(0,1)` → excluded cancelled #2 `(0,1)` → completed #3
  `(0,2)` → eligible cancelled #4 `(1,3)`. Initial state, processed prefix and
  termination are explained. The actual counter interaction was already correct.

Applied `/home/songyy/Documents/agent-skills/website-design/SKILL.md` to the
existing design, following the supplied independent repair direction; no new
feature/layout or styling tokens were introduced. P0/highest-return scope is
these two findings and their bilingual regressions. P1/P2 decoration is out of
scope. No required fix is deferred. Canonical Python, source mirror, renderer,
CSS and metadata are unchanged; only lesson-local teaching and evidence changed.

Feedback loop and commands (all from repository root):

- Red: `OUTPUT_DIR=leetcode/262/tests/evidence/review4-fixes/red node leetcode/262/tests/test_teaching.cjs`
  — exit 1 before product edits. `tests/red-review4-rerun.log` and red
  `observations.json` retain missing worked active IDs and excluded-row guard in
  both locales. The first attempt waited for a disabled Reset; the harness was
  changed to click only when enabled. No runtime fix was needed for that wait.
- Harness corrections after content edits: baseline's 64 checks belong to
  section 3, so the bridge assertion reads sections 3 and 5; the multi-element
  locator uses allTextContents joined with a newline. Failed logs
  `teaching-green.log` / `teaching-final.log` remain, clearly separate from the
  final passing run. These are harness failures, not extra product defects.
- Green: `OUTPUT_DIR=leetcode/262/tests/evidence/review4-fixes/green-final node leetcode/262/tests/test_teaching.cjs`
  — exit 0, `teaching-final-rerun.log`. Checks unique COPY keys, two-string
  locale-pair shape, rendered bridge/guard meanings, excluded #2 and replay in
  EN/zh at 320/390/1280. Captures both sections at CSS zoom 100% and 200%.
- `OUTPUT_DIR=leetcode/262/tests/evidence/review4-fixes/browser node leetcode/262/tests/test_browser.cjs`
  — exit 0, `browser.log`. Existing exact identity, interaction and no-overflow
  checks pass at 320/390/736/1440 in both languages. Source mirror, rendered
  textContent, real successful copy, downloaded bytes and manual fallback copy
  equal solution.py including final newline. Linux Control+C follows a distinct
  clipboard sentinel and forced writeText rejection, with actual readback.
  Locale changes retain preset, processed prefix, choices and revealed feedback;
  changing the prediction clears feedback. Offline already-rendered source works.
- `OUTPUT_DIR=leetcode/262/tests/evidence/review4-fixes/states node leetcode/262/tests/test_rendered_states.cjs`
  — exit 0, `states.log`. Independently specified count pairs match all 11
  initial/processed sample prefixes in each locale, including the excluded rows;
  final day rewinds `(1,2)` → `(0,1)` and replays exactly. Transfer ends with
  `(0,1)` and `(1,1)`. Guarded rendered formulas retain complete operands.
- `/tmp/venv262/bin/python -B leetcode/262/tests/test_solution.py`
  — exit 0, `oracle checks passed`.
- `/tmp/venv262/bin/python -B leetcode/262/tests/test_worked_bridge.py`
  — exit 0 under Pandas 3.1.0. Executes the taught intermediate tables, a banned
  driver counterexample, fresh transfer, 150 seeded cases against the separate
  loop/set oracle, empty/all-excluded dates and deep input nonmutation checks.
- **Metadata gate:** `python3 -B scripts/register_leetcode_lesson.py 262 --validate-only`
  — exit 0 with empty stdout/stderr. Receipt in `candidate.json`. Complexity is
  exactly the nonempty string `O(T + U) expected time; O(T + U) space`.
  No registration, metadata fix or campaign/acceptance alteration was performed.
- `git diff --check` — exit 0. Preview responses match the recorded local SHA-256
  hashes for HTML, copy, app, CSS, canonical Python, mirror, metadata and BRIEF.

Read the exact language/source pairs in `scripts/register_leetcode_lesson.py`:
Python uses solution.py / python-code.js / PYTHON_SOURCE. Retained the faithful
preferred Python/Pandas interface supported by existing local official evidence;
no non-Python contract or supportedLanguages list applies. Re-read the official
statement through normal web access on 2026-10-25 at
https://leetcode.com/problems/trips-and-users/ : keys, status enum, both-endpoint
rule, inclusive dates, rounding and sample agree. No live submission made.

Visual observations: inspected complete EN/zh 390px bridge captures and focused
390px driver-merge, grouping, formula and invariant screenshots in `states/`.
Text wraps, with no label/value collisions. Complete-element screenshots include
an in-image sticky-navigation capture artifact; settled viewport captures show
unobscured text below the navigation. Inspected EN 320px CSS-zoom-200% evidence:
large text remains reachable, with the existing narrow zoom layout requiring
horizontal panning. No claim of browser-menu zoom, real-device or resolved glyph
font verification. CSS/font stack is unchanged (PingFang SC, Microsoft YaHei,
system-ui, sans-serif); Chromium on Linux used the provided executable path.
No new color pairs or contrast measurement helper were introduced.

Evidence boundary: this is author verification, not independent closure, novice
comprehension testing, publication or LeetCode acceptance. Next action: separately
review this frozen candidate's affected teaching steps and prerequisites against
FIND-262-003 and FIND-262-004, retaining the report's historical result.
