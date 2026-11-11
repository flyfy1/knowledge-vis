# Reproduce the #1097 checks

From the repository root, with a static server running (`python3 -m http.server 18903 --bind 127.0.0.1`):

```sh
export EVIDENCE_DIR=/tmp/1097-check            # default: leetcode/1097/tests/evidence/run
python3 -B leetcode/1097/tests/test_solution.py # solution.sql + baseline on SQLite vs Python oracle; writes fixtures
node leetcode/1097/tests/test_core.cjs          # simulation vs fixtures (run after test_solution.py)
PREVIEW_ROOT=http://127.0.0.1:18770 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node leetcode/1097/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 1097 --validate-only
```

`build_copy.py` regenerates `copy.js`. `check_official_access.py` and the files directly in `evidence/`
are the preparation pass's official-access records, kept as-is. No MySQL server was available: the SQL
was executed on SQLite after the dialect substitutions described in `test_solution.py`.
