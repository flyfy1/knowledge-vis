# Reproduce the author checks for #759

From the repository root, with a static server running (`python3 -m http.server 18901 --bind 127.0.0.1`):

```sh
OUTPUT_DIR=/tmp/759-check python3 -B leetcode/759/tests/test_solution.py      # also runs test_core.cjs
NODE_PATH=~/Documents/integ-life/integ-games/node_modules OUTPUT_DIR=/tmp/759-check \
  PREVIEW_ROOT=http://127.0.0.1:18770 node leetcode/759/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 759 --validate-only
```

- `oracle.py` holds the independent unit-cell oracle and a coordinate-compressed piece oracle for
  large times. Neither shares code with `solution.py` or `core.js`.
- Without `OUTPUT_DIR`, `test_solution.py` writes `numerical.json` and `oracle-fixtures.json` into `tests/evidence/`;
  `browser.cjs` writes its screenshots to `<tmpdir>/leetcode-759-browser/` (copy only `browser.json` into `tests/evidence/`).
- `check_official_access.py` and the files it wrote in `evidence/` are the 2026-10-25 access probe for the
  subscriber-only statement. It is not a lesson test; it reports `blocked` while the statement is not public.

These are author self-checks, not an independent review, a LeetCode submission or a learner study.
