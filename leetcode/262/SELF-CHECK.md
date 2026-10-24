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
