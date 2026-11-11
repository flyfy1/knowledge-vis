# Reproduce the #1127 checks

From the repository root. Browser checks need a server already running from the repo root
(`python3 -m http.server 18904 --bind 127.0.0.1`) and Playwright via
`NODE_PATH=~/Documents/integ-life/integ-games/node_modules`. Every runner writes to `OUTPUT_DIR`
(default `leetcode/1127/tests/evidence`); use a scratch directory to avoid touching the frozen evidence.

```sh
OUTPUT_DIR=/tmp/1127-check python3 -B leetcode/1127/tests/test_solution.py   # SQL (SQLite) vs Python oracle; runs test_core.cjs
python3 -B leetcode/1127/tests/test_copy.py
python3 -B leetcode/1127/tests/test_xreview_oracle.py   # cross-review: independent definition oracle (SQLite)
OUTPUT_DIR=/tmp/1127-check PREVIEW_ROOT=http://127.0.0.1:18770 node leetcode/1127/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 1127 --validate-only
```

`probe_official.py` and the files under `evidence/` named `graphql-*`, `access-result.json` and
`official-access.md` are the 2026-10-27 access record from the preparation pass (network probe; it overwrites
those files unless OUTPUT_DIR is set). They show the subscription gate and the public `mysqlSchemas`.
