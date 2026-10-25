# Reproduce author self-checks

Run from the repository root, with the existing preview already serving this checkout:

```sh
python3 -B leetcode/689/tests/test_solution.py
node leetcode/689/tests/test_core.cjs
node leetcode/689/tests/browser.cjs
node leetcode/689/tests/focused.cjs
python3 -B scripts/register_leetcode_lesson.py 689 --validate-only
```

`OUTPUT_DIR=/absolute/path` redirects all result JSON and screenshots from numerical/browser tests. `PREVIEW_URL` overrides http://127.0.0.1:18783. Browser tests use Playwright through the existing NODE_PATH and honor PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. No server is started. The test reads the browser host platform for native clipboard shortcut selection and seeds a non-source sentinel before fallback copying.

`write_copy.py` and `build_html.py` are optional local authoring helpers, not checks; do not run them against a frozen review candidate. They never write outside this lesson. The source mirror is generated directly from solution.py and JSON-encoded without normalization. Review reruns need only the five check commands above.

Python reference directly enumerates legal triples and sums original elements, independently of side-summary logic. Exhaustive values 1..3, lengths3..9, all valid k; 700 seeded random cases; official examples; maximal n and values. Numerical JS checks every filled summary and each fixed-middle candidate as well as final oracle equality, for exhaustive binary-valued arrays and seeded cases. Browser checks every preset frame, rewind/replay, both locales, all answer options, exact source transfer, disabled endpoints, widths320/390/736/1440, CSS zoom2, keyboard/focus, forced colors, offline open and denied storage. Browser expected frames come from the model already checked against a separate oracle, not a claim of independent review.

Evidence is author self-check only. Independent reviewer, actual novice outcomes, LeetCode acceptance, browser-chrome zoom, physical devices and public release remain unverified.
