# Reproduce author checks

From repository root, using the provided NODE_PATH and browser installation:

```bash
python3 -B leetcode/745/tests/test_solution.py
node leetcode/745/tests/test_core.cjs
node leetcode/745/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 745 --validate-only
```

Tests default to `leetcode/745/tests/evidence`. Set `LESSON_TEST_OUTPUT_DIR` to a separate directory for all result, download and screenshot outputs; the numerical and browser tests read the frozen candidate without modifying its source. Example: `LESSON_TEST_OUTPUT_DIR=leetcode/745/tests/recheck node leetcode/745/tests/browser.cjs`. Browser base can be changed with LESSON_PREVIEW_URL (full lesson URL). This author used the already-running http://127.0.0.1:18770/leetcode/745/ service and did not start a server.

Browser dependencies: installed playwright and acorn accessible through NODE_PATH. The browser uses PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when supplied. Clipboard fallback tests use the Linux host's actual Control+C, not mobile/user-agent inference. The zoom test uses Chromium rendering at CSS zoom=2 and a 1440px viewport, giving 720 CSS px of effective layout width; it is not OS display scaling. Screenshots require human visual inspection after rerunning.

Python uses a forward-scan oracle, independently of the pair-key implementation. It checks the original constructor/repeated f interface, duplicates, overlap, absent queries, full-word ends, input preservation, exhaustive short binary dictionaries, seed 745, and maximum word/call bounds. Core tests independently inspect all 14 reachable preset snapshots, soundness/completeness and maximum-index invariants, write counts and snapshot independence. Acorn detects duplicate localization keys before evaluation.

Browser checks every preset/frame/query in both locales, rewind/replay, start/end/reset, all exercise options and answer invalidation, preserved locale/experiment/exercise/disclosure state, source display/copy/download bytes including final newline, successful clipboard and native manual fallback, unavailable storage, keyboard controls and grid scrolling, deep links and destination content, 320/390/736/1440 widths and 200% rendered zoom, native selected-label font measurements, forced colors/reduced motion, local assets and contrast calibrated against known values. These are author self-checks; independent teaching review and public release verification are separate.
