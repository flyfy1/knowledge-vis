# Reproduce the author checks

From the repository root (the provided preview must already be running):

```sh
python3 -B leetcode/882/tests/test_solution.py
node leetcode/882/tests/browser.cjs
node leetcode/882/tests/select-fit.cjs
node leetcode/882/tests/accessibility.cjs
python3 -B scripts/register_leetcode_lesson.py 882 --validate-only
```

Every result/screenshot-producing runner honors `OUTPUT_DIR`; set it to a fresh absolute directory to rerun without altering the frozen evidence. `PREVIEW_ROOT` optionally replaces the default http://127.0.0.1:18770 . Browser runners use `NODE_PATH` for the available Playwright package and honor `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. No server is started. No installation or network calls are needed for solution or browser tests. Public official-source evidence is a retained capture, not fetched by these runners.

`test_solution.py` executes the actual official Python callable against independent expanded BFS, exhaustive n≤4 graph configurations (each pair absent or cnt=0,1,2), budgets 0..6, 600 seeded cases, official examples, overlap/transfer fixtures and maximum constraints. Browser-model intermediate states are separately checked using Floyd–Warshall and direct inserted-position reachability.

`browser.cjs` checks every preset and endpoint, forward/back/replay, all prediction choices/reveal/change and locale preservation, hand range boundaries, actual keyboard actions, denied storage, local-file source display, exact mirror/rendered/clipboard/download/manual clipboard transfer (fresh per-attempt sentinel, Linux Control+C), 320/390/736/1440 widths and CSS layout zoom 200%. Text and canvas fitting checks reserve 16px for this native Chromium select arrow; the reserve is not a cross-platform guarantee. Contrast uses the same calibrated luminance function for nominal and actual computed rendered color pairs. `accessibility.cjs` checks keyboard-activated deep-link geometry and forced-color focus. CSS sizes include shared CSS.

These are author self-checks. A fresh reviewer must independently cold-walk this candidate; no independent acceptance or learner study is implied.
