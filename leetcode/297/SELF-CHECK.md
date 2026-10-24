# Author self-check (not independent acceptance)

- Official evidence captured in `tests/evidence/official-capture.txt` on 2026-10-24.
- `python3 leetcode/297/tests/test_solution.py` passes empty, singleton, balanced, negative, and chains.
- `python3 -B scripts/register_leetcode_lesson.py 297 --validate-only` passes metadata and exact `window.PYTHON_SOURCE` parity.
- Real preview browser at `http://127.0.0.1:18770/leetcode/297/`: zh/en toggle, next/previous/reset, all five presets, custom token string, prediction→reveal→change, copy fallback controls, 390/320/1280 screenshots, and console/page errors checked. Screenshots are `tests/lesson-390.png`, `tests/lesson-320.png`, `tests/lesson-desktop.png`.
- CSS is 2,113 bytes (<25,000). Self-check does not claim independent review or learner results.

## Fix evidence — 297-C1

- Failing feedback loop before the fix: executing the prior canonical `solution.py` against a legal 10,000-node one-sided chain exited 1 with `RecursionError: maximum recursion depth exceeded`.
- Ranked hypotheses tested: (1) recursive call depth was the cause; the old-source reproduction confirmed it. (2) token ordering or null-marker handling caused the boundary failure; the iterative replacement preserved the same preorder output and round-trip oracle cases, so this was rejected. (3) an explicit pending-slot stack would remove the runtime boundary; the revised source passed the 10,000-node chain with 20,001 tokens and recovered values 0..9999.
- Fix mapping: **297-C1** → iterative `pending` stacks in `solution.py`, exact regenerated `python-code.js`, updated `copy.js` mapping/complexity, and the single-string `lesson-entry.json` complexity metadata.
- Regression commands and results: `python3 -B leetcode/297/tests/test_solution.py` → `round-trip oracle cases: ok` and `10,000-node one-sided chain: ok`; `python3 -B scripts/register_leetcode_lesson.py 297 --validate-only` → passed; `OUTPUT_DIR=leetcode/297/tests/evidence/fix-297-c1 node leetcode/297/tests/browser-check.js` → `errors:[]`, zh-CN title; a second Playwright check exercised both English and zh-CN complexity text, source visibility, and a preset trace → `errors:[]`.
- This is author evidence for separate re-review, not independent acceptance.
