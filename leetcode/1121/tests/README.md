# Reproduce the #1121 checks

From the repository root, with a static server running (`python3 -m http.server 18903 --bind 127.0.0.1`):

```sh
export EVIDENCE_DIR=/tmp/1121-check            # default: leetcode/1121/tests/evidence/run
python3 -B leetcode/1121/tests/test_solution.py # solution.py vs exhaustive split search; writes fixtures (~16 s)
node leetcode/1121/tests/test_core.cjs          # simulation vs fixtures (run after test_solution.py)
PREVIEW_ROOT=http://127.0.0.1:18770 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node leetcode/1121/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 1121 --validate-only
```

`build_copy.py` regenerates `copy.js`. `check_access.py` and the files directly in `evidence/` are the
preparation pass's official-access records, kept as-is.
