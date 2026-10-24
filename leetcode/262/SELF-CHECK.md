# Self-check evidence

- Official source capture: `provenance/official-capture.md`; GraphQL summary: `provenance/official-graphql.json`.
- Canonical oracle: `tests/test_solution.py` passed with `/tmp/venv262/bin/python` (sample, banned driver, date boundary).
- Browser: `tests/test_browser.cjs` passed against `http://127.0.0.1:18770/leetcode/262/` at 390px; tested locale switch, all forward steps, reset, prediction reveal/change, no page errors. Screenshot output is controlled by `OUTPUT_DIR`.
- Source parity: `python-code.js` JSON string equals `solution.py` byte-for-byte.
- Preflight: `python3 -B scripts/register_leetcode_lesson.py 262 --validate-only` → exit 0.

This is author self-check evidence, not independent review or acceptance.
