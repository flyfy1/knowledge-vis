# Reproduce the author checks

Run from the repository root with the already-running preview. No service is started.
All result/screenshot emitters honor `OUTPUT_DIR`; set it to a new absolute directory to avoid changing frozen evidence. Browser checks use `NODE_PATH` and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` from the environment. Optional `LESSON_URL` overrides the default http://127.0.0.1:18782/leetcode/715/.

```sh
OUTPUT_DIR=/your/review/output python3 -B leetcode/715/tests/test_solution.py
OUTPUT_DIR=/your/review/output node leetcode/715/tests/test_core.cjs
OUTPUT_DIR=/your/review/output node leetcode/715/tests/browser.cjs
OUTPUT_DIR=/your/review/output node leetcode/715/tests/focus-and-disabled.cjs
OUTPUT_DIR=/your/review/output python3 -B leetcode/715/tests/contact_sheet.py
python3 -B scripts/register_leetcode_lesson.py 715 --validate-only
```

The Python suite executes `solution.py`; its oracles use unit-cell sets and elementary compressed coordinate segments, rather than endpoint parity. It exhausts all 32 coverage states in [1,6), every valid update and query, and checks intermediate representations. The JS core and browser suites use a separate elementary-segment oracle and compare each operation, not only terminal results. Browser checks exercise actual native clipboard transfer, including a distinct sentinel before denied-API manual fallback; Linux uses Control+C. The full report records browser/platform, scope, state/locale observations, actual formula strings, selected-label measurements, contrast and local requests.

`browser-focus-first-failure.json` preserves the first self-check's transient focus assertion failure. No runtime focus change was made to clear it. A small isolated reproduction passed; the full harness now enters focus with actual keyboard input before inspecting forced-colors focus. Both that full rerun and `focus-disabled-results.json` pass. The exact transient cause is not established. This is author test history, not an independent review finding or acceptance record.

For visual inspection, use original PNGs for detail and contact-*.png for coverage. Tall stage captures can include the live sticky nav at their top; clean comparison captures and actual clicked deep-link geometry checks distinguish capture overlays from content clipping. Source code has contained horizontal scrolling on narrow screens; the canonical download is exact. Zoom evidence uses 200% CSS zoom reflow, not browser chrome or physical-device scaling.
