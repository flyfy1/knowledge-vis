Author self-check suite; not independent acceptance.

Run from repository root, with installed Playwright and Acorn available through NODE_PATH:

```sh
OUTPUT_DIR=/tmp/757-checks python3 -B leetcode/757/tests/test_solution.py
OUTPUT_DIR=/tmp/757-checks node leetcode/757/tests/test_core.cjs
OUTPUT_DIR=/tmp/757-checks node leetcode/757/tests/browser.cjs
OUTPUT_DIR=/tmp/757-checks python3 -B leetcode/757/tests/contact_sheet.py
python3 -B scripts/register_leetcode_lesson.py 757 --validate-only
```

Python writes the independently enumerated oracle fixtures, then the JS core test consumes those fixtures. No greedy code is used by the oracle. Browser uses PREVIEW_ROOT (default http://127.0.0.1:18770), and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH if present. It does not start a server. It uses the host platform for the native clipboard shortcut and a distinct clipboard sentinel before fallback. Exact source assertions include the final newline. Tests default to tests/evidence if OUTPUT_DIR is absent. The stylesheet budget counts both shared and lesson CSS.

Coverage: all multisets of 1..4 intervals from endpoints 0..4 (1000 inputs), 700 seeded small cases; three official examples; 3000 identical full-span intervals and 3000 disjoint intervals. Every JS frame checks prefix feasibility, unique choices, two-largest summary and size accounting. Browser asserts all preset outputs, full rewind/replay, all quiz options, locale roundtrips, exact visible formula and localized H1, clipboard success and native manual-copy fallback, download parity, unavailable storage, file:// offline source/trace, links, keyboard focus, forced colors, 48px controls, all closed preset label widths, and contrast.

Browser viewport widths: 320, 390, 736 and 1440 CSS pixels in both locales. Zoom evidence uses CSS zoom=2 at width 780 (390 effective layout pixels) in headless Chromium; it is a browser rendering stress check, not a physical-device or browser-menu zoom claim. The populated trace, visible ledger scroll region and both horizontal edges are captured. Screenshots must also be visually inspected; passing geometry assertions alone does not establish readability.

Historical diagnostics retained: browser-initial-harness-failure.json tested programmatic focus without entering keyboard modality; a keyboard Tab corrected the harness, without changing runtime focus rules. browser-label-failure.json identified that the English Zero & duplicate label lacked arrow clearance at 320px; the product label was shortened to Zero/repeat · minimum 2, and the unchanged width assertion passed on rerun. browser-failure.json, when present after an unsuccessful rerun, is a diagnostic, not the final result. Final successful outcome is browser-results.json.
