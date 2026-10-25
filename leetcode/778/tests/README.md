# Reproduce the author checks

From repository root (no server startup; use the supplied preview):

```sh
export OUTPUT_DIR=/tmp/leetcode-778-check
python3 -B leetcode/778/tests/test_solution.py
node leetcode/778/tests/test_core.cjs
node leetcode/778/tests/browser.cjs
node leetcode/778/tests/supplement.cjs
python3 -B scripts/register_leetcode_lesson.py 778 --validate-only
```

`OUTPUT_DIR` defaults to this folder's `evidence/`. Python first emits the
independently derived threshold-flood fixtures consumed by the JS invariant test.
Browser packages are resolved using NODE_PATH; Chromium uses
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH if set. PREVIEW_URL may override the supplied
http://127.0.0.1:18770/leetcode/778/ URL. No source file is modified by tests.

Browser checks cover all five presets/all completed frames in both locales,
rewind/replay and endpoints, fresh prediction options/reveal/change, locale
roundtrip, hand disclosure, exact source display/copy/download (final newline
included), automatic-copy denial with a distinct sentinel and real Linux
Control+C/readback, offline file opening, denied storage, local link targets,
Tab/Enter focus, forced colors and reduced motion, 48px controls, measured and
calibrated solid-color contrast. Captures cover 320/390/736/1440px plus 200% CSS
layout zoom at 390/1440px. CSS layout zoom is not native browser zoom or a
physical-device check. Inspect the captures as well as the automated results.

Independent review, novice teach-back, native mobile/screen-reader audio,
LeetCode submission acceptance and public deployment remain outside author
self-check evidence.
