Run from the repository root using the already-running preview:

```bash
python3 -B leetcode/517/tests/test_solution.py
node leetcode/517/tests/test_core.cjs
node leetcode/517/tests/browser.cjs
node leetcode/517/tests/accessibility.cjs
python3 -B scripts/register_leetcode_lesson.py 517 --validate-only
```

`NODE_PATH` must expose the installed Playwright package. Browser launch honors `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when set. Set `LESSON_OUTPUT_DIR` to an absolute writable directory for all four tests to redirect generated JSON and PNG files; run Python first because the core test consumes its independently computed oracle cases. `LESSON_URL` can select another preview of this lesson. No test starts a service. `build_copy.py` is an optional authoring utility that regenerates copy.js, not a verification command.

Python executes the actual official `Solution.findMinMoves` contract. The oracle explores legal simultaneous sends, without using prefix sums or the optimized answer formula. It also executes the visible BFS baseline extracted from index.html and checks legal hand-schedule transitions. Core checks compare final results with the independent oracle and every intermediate prefix/maximum against direct arithmetic.

Browser tests use real Chromium, actual clipboard readback, a forced clipboard rejection with full selection verification, and downloaded bytes. All six presets, scan/history endpoints, range input, rewind/replay, quiz choices, feedback clearing, locale preservation, denied storage, internal anchors, keyboard focus, local-only assets and palette contrast are exercised. Screenshots cover English and Chinese at 320, 390, 736 and 1440 CSS px, plus 200% CSS layout zoom. Component screenshots temporarily hide the sticky navigation to prevent an element-capture overlay; header screenshots retain real navigation. The table intentionally scrolls horizontally and has a visible instruction and a keyboard focus target. The author visually inspected screenshots; their existence alone is not independent review.

The accessibility supplement checks the rendered 48px target dimensions in both locales, actual keyboard-triggered forced-colors focus, and reduced-motion scrolling. It stores its own JSON and a forced-colors screenshot in the same output directory.
