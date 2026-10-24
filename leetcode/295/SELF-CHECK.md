# Author self-check

- Official page verified 2026-10-24; evidence in `tests/evidence/official-2026-10-24.txt`.
- Python randomized oracle and source contract checks run locally.
- Browser checks required: both locales, all presets, forward/back/reset/endpoints, prediction reveal and change, copy fallback, widths 320/390/desktop, keyboard/focus, source parity.
- This is author evidence only; independent review remains pending.

- `node leetcode/295/tests/browser.cjs` passed against the running preview at 390px in both locales, with preset switching, next/undo/reset, prediction and reveal.
- Full-page 390px screenshot visually inspected: `tests/lesson-390.png`; CSS is 1,724 bytes.
- Embedded `python-code.js` JSON source equals `solution.py` byte-for-byte.
- Preflight: `python3 -B scripts/register_leetcode_lesson.py 295 --validate-only` exited 0.

## Revision self-check — DEV-295-01 fix (awaiting independent re-review)

- Stable finding mapped: `DEV-295-01` (320px / 200% zoom overflow of the essential preset control).
- Causal diagnosis and feedback loop: before the fix, a Playwright probe at 320px English measured `documentElement.scrollWidth=386` and `#preset` right edge `320px` from an intrinsic English `<select>` width of `357px`; the same probe was run after the edit and now passes. Ranked hypotheses were (1) intrinsic select width, (2) flex/grid child min-width, (3) unwrapped label; the measured intrinsic select width and the green post-fix probe support (1).
- Fix: `style.css` constrains the stage select to `width:100%; max-width:100%` and lets the header controls wrap, preventing the language toggle from creating document overflow at 200% zoom while retaining native controls and the existing horizontal step navigation.
- Regression command: `NODE_PATH=/home/songyy/projects/integ-games/node_modules node leetcode/295/tests/browser.cjs` passed. It checks English and Chinese at 320px, English and Chinese at 200% zoom, then runs the existing 390px preset/undo/reset/prediction/reveal flow.
- Keyboard evidence: a Playwright focus probe at 320px in both locales focused `#preset` and tabbed to `#next` (`en ... -> next`; `zh ... -> next`).
- Screenshots: `tests/evidence/295-en-320.png`, `295-zh-320.png`, `295-en-320-200zoom.png`, and `295-zh-320-200zoom.png` capture the repaired narrow and zoomed views.
- Other checks: `node leetcode/295/tests/test_core.js` passed; Python oracle passed 1,600 updates; `python3 -B scripts/register_leetcode_lesson.py 295 --validate-only` exited 0 with no output.
- Candidate fingerprint for this working-tree revision: `63e702747156a363f5d1bd37c971b4d715cb4bbc86c112b724107460f3f1a2dc` (diff SHA-256). This is author evidence only; independent review and closure of `DEV-295-01` remain pending.
