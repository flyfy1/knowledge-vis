Author self-check (2026-10-27, Asia/Singapore):

- `python3 leetcode/1187/tests/test_solution.py` passed exhaustive arrays of lengths 1–6 over values 0..3 for every 3-value arr2, 500 seeded random cases, and the three official examples plus boundary checks.
- `node leetcode/1187/tests/test_core.cjs` passed deterministic trace/brute agreement for all four presets and every frame.
- Source parity: `python-code.js` is generated from the exact bytes of `solution.py`; preflight below checks it.
- Browser checks still required: Chromium at the provided preview URL, both locales, prediction/reveal/change, all presets and endpoints, copy fallback, widths/zoom/focus, and visual inspection. This record is author evidence only and does not claim independent review or acceptance.
- Real Chromium against `http://127.0.0.1:18770/leetcode/1187/` at 320, 390 and 1440 CSS px: both locales, all four presets, reset/next/end, prediction → reveal → changed prediction, no 4xx responses, no horizontal overflow; screenshots `/tmp/1187-390.png` and `/tmp/1187-1440.png` were visually inspected. Clipboard fallback branch is implemented; system clipboard permission denial was not forced in this run.
- Metadata gate: `python3 -B scripts/register_leetcode_lesson.py 1187 --validate-only` exited 0.
