# Author self-check evidence

Run on 2026-10-24:

- `python3 leetcode/239/tests/test_solution.py` — solution agrees with direct-scan oracle on official examples, edge cases, and seeded random arrays.
- `node leetcode/239/tests/test_core.js` — every trace output agrees with direct maxima and every frame preserves increasing indices/decreasing values.
- `node leetcode/239/tests/browser-check.js` — preview URL exercised at 320, 390, and 1280 px in both locale state and interactive paths; no page errors or horizontal overflow; screenshots saved in this folder.
- `python3 -B scripts/register_leetcode_lesson.py 239 --validate-only` — passed metadata and exact source parity.

This is author self-check evidence only. Independent review, actual learner outcomes, and LeetCode acceptance are pending/not claimed.

## 2026-10-25 — title repair candidate

Finding **239-PUB-R1: fixed awaiting independent review**. Both `title` locale
entries now include `#239 · `, which the existing H1 consumer renders directly.
`index.html` versions the changed copy asset. The exact official link is retained.
No algorithm, interaction, source, metadata, shared asset or registry change was
needed. The existing Python contract includes both Python and TypeScript and its
lesson-local official interface evidence supports the preferred Python choice.
The canonical pair is `solution.py` / `python-code.js` (`PYTHON_SOURCE`), as read
from `scripts/register_leetcode_lesson.py`.

Evidence is in [title-repair-20261025](tests/evidence/title-repair-20261025/):

- `node leetcode/239/tests/title-regression.js` against
  `http://127.0.0.1:18770`: `red.txt` reproduces the original actual H1
  `滑动窗口最大值` versus required `#239 · 滑动窗口最大值` at zh/320.
  `green.txt` and `results.json` record the repaired run. Both locales pass at
  320/390/736/1440px through zh → en → zh after interaction, with exact official
  href, H1 bounds, no page overflow/errors, and retained preset, trace, window,
  prediction selection and revealed feedback. EN/zh 320px screenshots were
  inspected: the full heading wraps naturally and the official link is readable.
- The same regression checks the hand-calculated formula `[1,3,-1] → 3`,
  completed insertion frames for `[9,1,2,3], k=2` (queue `0:9 → 1:1`, then
  `2:2`, cumulative emitted output `[9,2]`, terminal `[9,2,3]`), rewind/replay,
  fresh prediction feedback and feedback invalidation on choice change.
  Prediction input is fixed and independent of the trace preset; no work-count
  metric or optimization recurrence is introduced by this repair.
- Exact equality, including final newline, passed for canonical Python, decoded
  mirror, rendered `textContent`, successful clipboard copy, downloaded bytes,
  and offline file rendering. Forced fallback first seeds a distinct clipboard
  sentinel, verifies focused full selection, dispatches the native Linux
  `Control+C`, and reads the canonical source back. Host and browser are recorded
  in `results.json`; no newline normalization is used.
- `OUTPUT_DIR=leetcode/239/tests/evidence/title-repair-20261025/legacy PREVIEW_URL=http://127.0.0.1:18770 node leetcode/239/tests/browser-check.js`
  passed (`legacy.txt`). Only preview URL configuration changed in the older
  harness; its assertions remain intact and prior evidence is preserved.
- `python3 -B leetcode/239/tests/test_solution.py` passed the executable Python
  against the direct-scan oracle (`python.txt`).
- `node leetcode/239/tests/test_core.js` passed (`core.txt`).
- From the repository root,
  `python3 -B scripts/register_leetcode_lesson.py 239 --validate-only` passed
  with exit code 0 (`preflight.txt`). Complexity remains the valid single string
  `O(n) time; O(k) auxiliary space`. No registration was run.

The first new heading-fit assertion compared integer scroll height with line-box
height and reported a one-pixel difference under visible overflow. Inspection
showed complete text with no clipping. The final assertion checks actual text
bounds and overflow/ellipsis behavior; no runtime styling was changed for this
measurement issue.

The frozen candidate is identified by `candidate-sha256.json` in the evidence
directory, including unchanged canonical sources and shared-policy hashes.
P0/highest-return scope is the required bilingual heading and focused regression;
P1/P2 additions are unnecessary. Layout redesign and publication are deferred
because they are outside this repair. This is author self-check evidence only:
separate independent re-review of this candidate and public delivery verification
remain pending. Historical review results and release evidence are unchanged.
