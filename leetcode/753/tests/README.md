# Reproduce the author self-check

Run from the repository root. The already-running preview must serve this checkout.

```sh
python3 -B leetcode/753/tests/test_solution.py
node leetcode/753/tests/test_core.cjs
node leetcode/753/tests/browser.cjs
node leetcode/753/tests/layout.cjs
python3 -B leetcode/753/tests/contact_sheet.py
python3 -B scripts/register_leetcode_lesson.py 753 --validate-only
```

Set `OUTPUT_DIR=/absolute/writable/path` on all evidence-producing test commands to avoid writing into a frozen candidate. Browser also accepts `PREVIEW_ROOT` (default http://127.0.0.1:18770). It uses installed Playwright via NODE_PATH, and honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. Pillow is used only for evidence contact sheets.

Python executes the official callable against independent product-enumeration coverage and a BFS shortest-string oracle for tiny inputs; all 38 valid parameter pairs, maximum boundary and seeded repetitions are checked. JS inspects every transition for 16 small parameter pairs without using the Python traversal as an oracle. Copy pairs are parsed with duplicate-key rejection.

Browser checks actual interactions in zh/en, every preset to both endpoints, complete reverse snapshot identity, locale preservation, fresh prediction options, exact displayed/copied/downloaded source, native Linux Control+C manual fallback from a distinct clipboard sentinel, unavailable storage, local-file opening, 320/390/736/1440 widths, keyboard/focus, links and solid-color contrast. Zoom evidence uses actual Chromium CSS zoom=2 at 780px (390px effective layout), not a claim about a physical device or a browser toolbar. Focused element screenshots hide only the sticky nav during capture to avoid its element-capture overlay artifact; interactions and target-geometry assertions use the unmodified nav.

Contrast helper calibration includes black/white, RGB primary luminances, and #747474 on black (4.492948…, fails 4.5). Recorded ratios use actual computed solid colors; no gradient/alpha contrast inference. Runtime backgrounds are solid.

Historical harness issues are retained in SELF-CHECK.md and interrupted-run evidence. Neither is an independent lesson review. Do not infer LeetCode submission acceptance, production delivery, or measured learner understanding from these tests.
