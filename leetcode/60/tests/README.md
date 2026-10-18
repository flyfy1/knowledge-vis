# Reproduce author checks

From the repository root, with Python 3.9+, Node and the provided Playwright package:

```sh
OUTPUT_DIR=/tmp/lesson60-check python3 leetcode/60/tests/test_solution.py
OUTPUT_DIR=/tmp/lesson60-check node leetcode/60/tests/test_core.js
OUTPUT_DIR=/tmp/lesson60-check node leetcode/60/tests/browser.cjs
OUTPUT_DIR=/tmp/lesson60-check node leetcode/60/tests/capture.cjs
```

The scripts respect `OUTPUT_DIR` for all reports and screenshots. Python bytecode writing is disabled. Tests do not rewrite the candidate. If needed, preserve the environment's `NODE_PATH`; browser launch respects `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. `PREVIEW_ROOT` overrides the existing default `http://127.0.0.1:18770`. Do not start a service to run the tests if the supplied preview is available.

`test_solution.py`: exhaustive independent itertools enumeration through n=7, seed 60018 cases at n=8/9 using inversion ranking, all endpoint sizes, official examples, exact source mirror.

`test_core.js`: separately implemented recursive permutation enumeration; independent inversion rank; all frame invariants, prefix/unused conservation, before/after consistency, quotient/remainder equations, deterministic replay, invalid inputs, seed 6018 and exact block boundaries.

`browser.cjs`: actual headless Chromium with --disable-gpu for reproducible raster capture, all six presets in both locales, every frame and reversible endpoint, custom max/invalid inputs, native keyboard controls and ledger scrolling, all prediction choices/reveal/change/language, native clipboard plus injected denial fallback, exact displayed/copied/downloaded Python, local asset/console checks, anchors, storage denial, file/offline operation, 48px controls, computed contrast, forced colors, reduced motion. Screenshots cover 320/390/736/1440 widths and 200% CSS content zoom (640px viewport, 320px equivalent content width). This is browser content zoom, not a claim about OS scaling or a physical phone.

`capture.cjs`: final isolated-session screenshots for visual inspection. Run after browser.cjs; each image uses a fresh Chromium process to avoid this ARM build's retained raster artifacts across captures. Includes the same widths/zoom plus 736×414 landscape and forced colors.

`build_local.py` is an explicit maintenance utility, not a verification test: it refreshes only this lesson's `python-code.js` from `solution.py`. Do not run it as part of reviewing a frozen candidate.

`official-contract.json` is the public GraphQL response captured 2026-10-18. The statement was also opened at the linked official URL. No login or restricted access was used.

Reports in `evidence/` are author self-checks. Independent review, real novice teach-back, accepted LeetCode submission, physical devices and public deployment are not established by these tests.
