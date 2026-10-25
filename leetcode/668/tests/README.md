# Reproduce the author self-check

Run from repository root, with the existing preview serving this checkout. No server is started by these tests.

```bash
python3 -B leetcode/668/tests/test_solution.py
node leetcode/668/tests/test_core.cjs
node leetcode/668/tests/browser.cjs
node leetcode/668/tests/layout-audit.cjs
python3 -B scripts/register_leetcode_lesson.py 668 --validate-only
```

Set `OUTPUT_DIR` to a writable output directory to preserve a frozen candidate, e.g. `OUTPUT_DIR=/tmp/668-review node leetcode/668/tests/browser.cjs`. All four test programs honor it. `PREVIEW_URL` may override the lesson URL. Browser programs use `NODE_PATH` as supplied and honor `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when set.

Python runs the actual `Solution.findKthNumber` interface against explicit sorted-product enumeration, including exhaustive/seeded/large closed-form cases. JavaScript checks every trace invariant against independent cell enumeration. The browser checks rendered values separately, exact source transfer including final newline, native clipboard/manual copying, both locales, presets, keyboard, offline opening, inaccessible storage, links and responsive geometry. The layout audit checks every closed preset label at 320/390 and large/terminal grids, keyboard scrolling, and synthetic Latin/CJK wrapping. This synthetic stress does not establish behavior on another physical platform or its fonts.

The main browser test enables true 200% tab zoom with an ephemeral local extension (`chrome.tabs.setZoom`), verifies zoom=2, devicePixelRatio=2 and layout viewport=720 for a 1440px browser viewport, then removes the temporary extension/profile. Native zoom capture uses CDP `Page.captureScreenshot` with `fromSurface:false`: the default headless surface capture produced blank images at scroll offsets even while DOM geometry was correct. Inspect the saved native screen captures. CSS zoom is not substituted.

Results in `tests/evidence/` are author evidence. Separate review, real learner outcomes, official submission acceptance, physical devices and production delivery remain unverified.
