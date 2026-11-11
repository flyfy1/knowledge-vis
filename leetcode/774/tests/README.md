# Reproduce the #774 author checks

From the repository root, with a preview server running
(`python3 -m http.server 18902 --bind 127.0.0.1`):

```sh
python3 -B leetcode/774/tests/test_solution.py          # oracle comparisons; also runs test_core.cjs
NODE_PATH=~/Documents/integ-life/integ-games/node_modules \
  PREVIEW_ROOT=http://127.0.0.1:18770 EVIDENCE_DIR=/tmp/774-evidence \
  node leetcode/774/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 774 --validate-only
```

`EVIDENCE_DIR` redirects generated files. `test_solution.py` compares the canonical
solution with exact `Fraction` optima: exhaustive allocation search (every station set in
0..10 with 2–4 stations, k = 1..6), an exact greedy on 2,500 seeded random roads, the two
public sample inputs, boundary cases, and 25 maximum-size roads (n = 2000, positions up to
1e8, k up to 1e6) certified by `need(D*) <= k < Σ floor(g/D*)`. It also runs the baseline
shown in step 1 against the exhaustive oracle, checks the offline source mirror and
duplicate copy keys, and writes fixtures that `test_core.cjs` uses to check every frame of
the browser trace (invariant lo < D* <= hi, per-gap need recomputed independently).

`capture_official.py` is the preparation pass's access probe; it performs network requests
and rewrites `evidence/` captures, so it is not part of the regular check.
