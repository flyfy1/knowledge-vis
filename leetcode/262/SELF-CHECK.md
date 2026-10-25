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
