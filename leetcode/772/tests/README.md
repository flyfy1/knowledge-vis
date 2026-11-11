# Reproduce the author checks for #772

From the repository root, with a static server running (`python3 -m http.server 18901 --bind 127.0.0.1`):

```sh
OUTPUT_DIR=/tmp/772-check python3 -B leetcode/772/tests/test_solution.py      # also runs test_core.cjs
NODE_PATH=~/Documents/integ-life/integ-games/node_modules OUTPUT_DIR=/tmp/772-check \
  PREVIEW_ROOT=http://127.0.0.1:18770 node leetcode/772/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 772 --validate-only
```

- `oracle.py` is an independent recursive-descent evaluator (grammar expr/term/factor, division by
  `int(Fraction(a, b))`). It shares no code with `solution.py` or `core.js`.
- `test_solution.py` also executes the brute force printed in step 2 of the page, straight from `index.html`.
- Without `OUTPUT_DIR`, `test_solution.py` writes `numerical.json` and `oracle-fixtures.json` into `tests/evidence/`;
  `browser.cjs` writes its screenshots to `<tmpdir>/leetcode-772-browser/` (copy only `browser.json` into `tests/evidence/`).
- `check_official_access.py` and the files it wrote in `evidence/` are the 2026-10-25 access probe for the
  subscriber-only statement. It is not a lesson test; it reports `blocked` (exit 2) while the statement is not public.

These are author self-checks, not an independent review, a LeetCode submission or a learner study.
