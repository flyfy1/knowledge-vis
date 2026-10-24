Run from the repository root (existing preview only; do not start a server):

```sh
python3 -B leetcode/354/tests/test_solution.py
node leetcode/354/tests/test_core.cjs
node leetcode/354/tests/browser.cjs
node leetcode/354/tests/contrast.cjs
python3 -B scripts/register_leetcode_lesson.py 354 --validate-only
```

All evidence-producing tests accept `OUTPUT_DIR=/absolute/path`; use a fresh output directory to preserve the frozen candidate. Browser imports Playwright through the environment's NODE_PATH and honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. PREVIEW_ROOT optionally overrides http://127.0.0.1:18770. Python requires no dependencies. Browser source display also tested using file://, without a server.

The Python oracle builds a strict-containment directed acyclic graph in original input order, without sorting or LIS. The core oracle enumerates all subsequences independently and computes exact attainable minimum endings for each length. Teaching snapshots are deep-checked. Maximum inputs run only in Python, not the tutorial trace. Random generators have fixed seeds.

Browser screenshots of tall trace elements hide only the sticky navigation during capture, using Playwright's screenshot-only style option; this prevents a stitching artifact. Desktop viewport images retain the ordinary navigation. Zoom captures use CSS zoom:2 at a 1440px viewport, exercising layout reflow and enlarged controls. Both locales additionally run at 320/390/736/1440 widths. No real phone, operating-system screen reader, production release, or learner experiment is claimed.

Historical harness corrections during authoring: skip clicking End when the one-envelope preset is already terminal; compare source textContent including trailing newline; account for EN and official-link positions in native keyboard order. These were test assumptions, not solution changes. Actual UI fixes: explicit empty favicon, and stronger local disabled-primary-button selector so disabled Next is visibly disabled. Final evidence is for the corrected candidate only.
