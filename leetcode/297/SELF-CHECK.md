# Author self-check (not independent acceptance)

- Official evidence captured in `tests/evidence/official-capture.txt` on 2026-10-24.
- `python3 leetcode/297/tests/test_solution.py` passes empty, singleton, balanced, negative, and chains.
- `python3 -B scripts/register_leetcode_lesson.py 297 --validate-only` passes metadata and exact `window.PYTHON_SOURCE` parity.
- Real preview browser at `http://127.0.0.1:18770/leetcode/297/`: zh/en toggle, next/previous/reset, all five presets, custom token string, prediction→reveal→change, copy fallback controls, 390/320/1280 screenshots, and console/page errors checked. Screenshots are `tests/lesson-390.png`, `tests/lesson-320.png`, `tests/lesson-desktop.png`.
- CSS is 2,113 bytes (<25,000). Self-check does not claim independent review or learner results.
