# Reproduce the #1153 checks

From the repository root. Browser checks need a server already running from the repo root
(`python3 -m http.server 18904 --bind 127.0.0.1`) and Playwright via
`NODE_PATH=~/Documents/integ-life/integ-games/node_modules`. Every runner writes to `OUTPUT_DIR`
(default `leetcode/1153/tests/evidence`).

```sh
OUTPUT_DIR=/tmp/1153-check python3 -B leetcode/1153/tests/test_solution.py   # BFS brute force vs solution.py; runs test_core.cjs
python3 -B leetcode/1153/tests/test_copy.py
python3 -B leetcode/1153/tests/test_xreview_bfs.py       # cross-review: BFS over the real 26 letters vs solution.py
OUTPUT_DIR=/tmp/1153-check PREVIEW_ROOT=http://127.0.0.1:18770 node leetcode/1153/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 1153 --validate-only
```

`check_official_access.py` and the `official-*`, `graphql-request.json`, `access-summary.json` and
`preflight.json` evidence are the 2026-10-27 access record from the preparation pass (network probe; it
overwrites those files unless OUTPUT_DIR is set).
