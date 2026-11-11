# Reproduce the #1088 checks

From the repository root, with a static server running (`python3 -m http.server 18903 --bind 127.0.0.1`):

```sh
export EVIDENCE_DIR=/tmp/1088-check            # default: leetcode/1088/tests/evidence/run
python3 -B leetcode/1088/tests/test_solution.py # oracles, intermediate counts, baseline code, mirror, copy keys; writes fixtures
node leetcode/1088/tests/test_core.cjs          # simulation vs fixtures (run after test_solution.py)
PREVIEW_ROOT=http://127.0.0.1:18770 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node leetcode/1088/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 1088 --validate-only
```

`build_copy.py` regenerates `copy.js` from its bilingual pairs (rejecting duplicate keys).
`check_official_access.py` and `evidence/` are the preparation pass's official-access records, kept as-is.
These are author self-checks, not independent review or a LeetCode submission.
