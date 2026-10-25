# Reproduce author self-checks

From repository root, using the existing preview server (default http://127.0.0.1:18770):

```sh
OUTPUT_DIR=/tmp/828-review python3 -B leetcode/828/tests/test_solution.py
OUTPUT_DIR=/tmp/828-review node leetcode/828/tests/test_core.cjs
OUTPUT_DIR=/tmp/828-review node leetcode/828/tests/browser.cjs
OUTPUT_DIR=/tmp/828-review node leetcode/828/tests/states.cjs
python3 -B scripts/register_leetcode_lesson.py 828 --validate-only
```

The browser uses `NODE_PATH` for Playwright and honors `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. `PREVIEW_ROOT` optionally changes the existing preview origin. No server is started. OUTPUT_DIR defaults to tests/evidence; reviewers should set it to avoid changing candidate evidence. The browser uses Chromium and a Linux-host Control+C native clipboard path (Meta+C if run on macOS), fresh verified clipboard sentinels before each fallback transfer, and captures screenshots for manual inspection. Zoom is CSS zoom 2, an effective-layout stress check, not real-device or browser-chrome zoom evidence. Contrast helper is calibrated against black, white, RGB primaries, 21:1, and #747474/black below 4.5. Its measurements cover solid colors; transparent navigation inherits dark opaque backing whose remaining compositing is checked visually.

Python oracle enumerates all substrings and uses Counter; browser/core oracle separately enumerates substrings and assigns each frequency-one occurrence. Neither oracle uses nearest equal boundaries. Tests do not perform a LeetCode submission, independent teaching review or novice study.

`official.json` is a public GraphQL capture, including full statement and codeSnippets language-selector interfaces. Source is review material, never loaded at runtime. Browser evidence contains exact localized state explanations, source transfer boundaries, link label/destination observations, numerical layouts and contrast ratios. Final hashes live in candidate-sha256.json; no registry or deployment is modified.
