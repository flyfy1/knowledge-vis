# #87 reproducible author checks

Run from repository root. Node resolves the installed Playwright package through
`NODE_PATH` when supplied. No server is started; the existing preview is used.
All test evidence can be redirected outside this frozen candidate:

```sh
OUTPUT_DIR=/tmp/lesson87-review python3 leetcode/87/tests/test_solution.py
OUTPUT_DIR=/tmp/lesson87-review node leetcode/87/tests/test_core.cjs
OUTPUT_DIR=/tmp/lesson87-review node leetcode/87/tests/browser.cjs
OUTPUT_DIR=/tmp/lesson87-review node leetcode/87/tests/visual.cjs
```

`PREVIEW_ROOT` defaults to `http://127.0.0.1:18776`.
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`, if set, is passed as `executablePath`.
Python tests use only the standard library. Tests import the actual official
`Solution.isScramble` method and capture its completed DP via profiling, rather
than testing a separate copy. The independent oracle generates all reachable
strings and checks set membership; it does not use the Boolean DP recurrence.
The browser model is checked separately, including every completed table cell,
unknown versus false, both split alignments and isolated snapshots.

Browser checks cover both locales, every preset, custom input and rejection,
forward/back/replay/reset/endpoints, native slider Home/End, all prediction
choices and changed-answer clearing, locale state/focus, source display,
real clipboard success, denied clipboard fallback, downloaded source equality,
320/390/736/1440px, desktop 200% CSS zoom, keyboard, forced colors, blocked
storage, file opening and local asset errors. CSS zoom is the automated zoom
mechanism; real-device pinch zoom and OS/browser chrome zoom are not claimed.

`visual.cjs` captures the actual great/rgeat root-cut pairings and retained
length layers at desktop and narrow widths, checks horizontal reachability of
the last table column, and measures exact token/focus contrasts. Table-only
screenshots temporarily hide the sticky navigation using Playwright's screenshot
style option so the capture itself does not cover the first table caption;
normal navigation behavior is tested without that style in browser.cjs.

`build_page.py` is a local-only shell rebuild helper, not a shared generator.
It writes only this lesson's index.html. It is not needed to run any check.
Official public GraphQL evidence is saved in evidence/official.json with its
query, access timestamp, complete statement and observed language templates.
No paywall access, credentials, actual submission or acceptance is involved.
