# Reproduce the author checks

From the repository root, with the existing preview already serving this checkout:

```sh
python3 -B leetcode/630/tests/test_solution.py
node leetcode/630/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 630 --validate-only
```

Both test runners honor `OUTPUT_DIR`; point it outside the candidate for a frozen
review rerun. Browser checks additionally accept `PREVIEW_ROOT` and use installed
Playwright through `NODE_PATH`. If set, `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` is
passed as Chromium's executablePath. No server is started. Screenshots require
human visual inspection after reruns. Python tests execute solution.py; the
browser's core.js is a separately tested teaching simulation.

The browser runner checks actual clipboard text under granted permissions and an
intentionally denied clipboard fallback with selected exact text. The download
is read from Playwright's temporary path. CSS zoom at 200% tests reflow and
magnified labels in real Chromium; physical mobile hardware and browser chrome
zoom gestures are not claimed. Forced-colors checks retain the focus outline.

Evidence is author self-check material, not independent acceptance. The reviewer
should conduct the cold walkthrough before reading BRIEF/source/test reports.
