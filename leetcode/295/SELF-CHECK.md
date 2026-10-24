# Author self-check

- Official page verified 2026-10-24; evidence in `tests/evidence/official-2026-10-24.txt`.
- Python randomized oracle and source contract checks run locally.
- Browser checks required: both locales, all presets, forward/back/reset/endpoints, prediction reveal and change, copy fallback, widths 320/390/desktop, keyboard/focus, source parity.
- This is author evidence only; independent review remains pending.

- `node leetcode/295/tests/browser.cjs` passed against the running preview at 390px in both locales, with preset switching, next/undo/reset, prediction and reveal.
- Full-page 390px screenshot visually inspected: `tests/lesson-390.png`; CSS is 1,724 bytes.
- Embedded `python-code.js` JSON source equals `solution.py` byte-for-byte.
- Preflight: `python3 -B scripts/register_leetcode_lesson.py 295 --validate-only` exited 0.
