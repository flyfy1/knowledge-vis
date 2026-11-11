# Reproduce the #1183 checks

From the repository root. Browser checks need a server already running from the repo root
(`python3 -m http.server 18904 --bind 127.0.0.1`) and Playwright via
`NODE_PATH=~/Documents/integ-life/integ-games/node_modules`. Every runner writes to `OUTPUT_DIR`
(default `leetcode/1183/tests/evidence`).

```sh
OUTPUT_DIR=/tmp/1183-check python3 -B leetcode/1183/tests/test_solution.py   # brute force + proof certificates; runs test_core.cjs (~20 s)
python3 -B leetcode/1183/tests/test_copy.py
python3 -B leetcode/1183/tests/test_row_dp.py            # cross-review: exact row DP, s = 3, 4 non-divisible (~60 s)
OUTPUT_DIR=/tmp/1183-check PREVIEW_ROOT=http://127.0.0.1:18770 node leetcode/1183/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 1183 --validate-only
```

`probe_official.py` and the `official-*`, `graphql-*`, `access-summary.json`, `preflight-*`, `probe-output.txt`
and `review-blocker.md` evidence are the 2026-10-27 access record from the preparation pass (network probe; it
overwrites those files unless OUTPUT_DIR is set).
