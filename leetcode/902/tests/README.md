# Reproduce the author self-check

From repository root, using the existing preview (no server is started):

```bash
OUTPUT_DIR=/tmp/902-review-core python3 -B leetcode/902/tests/test_core.py
OUTPUT_DIR=/tmp/902-review-browser node leetcode/902/tests/browser.cjs
OUTPUT_DIR=/tmp/902-review-browser node leetcode/902/tests/capture.cjs
python3 -B scripts/register_leetcode_lesson.py 902 --validate-only
```

Node resolves Playwright through the supplied NODE_PATH. The runners use PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set. PREVIEW_ROOT defaults to http://127.0.0.1:18770. Keep OUTPUT_DIR outside the candidate for independent reruns; all result/screenshot/download paths honor it. `build_copy.py` is an authoring utility, not a test: it regenerates local runtime files and must not be run against a frozen review candidate.

Core checks execute the original Python3 class method. Direct integer enumeration and a recursive digit-DP oracle are independent of the power-block implementation. Intermediate trace blocks are checked against actual valid integers, including per-candidate contributions and disjointness. Large seeded and maximum cases use the recursive oracle. Mirror and dictionary shape/duplicate keys are checked separately.

Browser checks use actual Chromium, all seven presets and both locales, every trace operation forward/back, reset/end/range, all prediction choices, locale preservation, real clipboard success, two sentinel-reset native fallback copy attempts per locale, exact source download, storage-denied offline files, keyboard/focus, internal links, selected-label font budgets, contrast, requests and errors. Phone/tablet/desktop layouts and 200% CSS layout zoom are captured. CSS zoom is stated explicitly; it is not a test of native browser toolbar zoom.

`capture.cjs` records additional semantic states and header/first-difference/stop/prediction screenshots. Inspect screenshots manually; passing assertions alone do not establish diagram readability or teaching clarity.
