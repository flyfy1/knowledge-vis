# Reproduce the #1067 author checks

From the repository root, with a preview server running
(`python3 -m http.server 18902 --bind 127.0.0.1`):

```sh
python3 -B leetcode/1067/tests/test_solution.py          # oracle comparisons; also runs test_core.cjs
NODE_PATH=~/Documents/integ-life/integ-games/node_modules \
  PREVIEW_ROOT=http://127.0.0.1:18770 EVIDENCE_DIR=/tmp/1067-evidence \
  node leetcode/1067/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 1067 --validate-only
```

`test_solution.py` compares the canonical solution with two oracles that share no code with
it — literal string counting (`str(x).count(str(d))` over the range) and a digit DP over
(position, tight, started) — on every d and every `1 <= low <= high <= 400` (802,000 cases),
2,500 seeded short ranges anywhere up to 2·10⁸ (both oracles), 2,500 seeded long ranges
(digit DP), the extremes (`1..2·10⁸`, `2·10⁸..2·10⁸`, ranges crossing 10⁸) for every d, the
public sample inputs, d = 0 cases (1…100 = 11, 1…105 = 16, 1…9 = 0, 100 = 2, 1000 = 3) and
the closed form `k·10^(k−1)` for digits 1–9 over `1..10^k − 1`. Answers are exact integers,
so no tolerance is involved. It also runs the baseline displayed in step 1, checks the
offline source mirror and duplicate copy keys, and writes fixtures that `test_core.cjs` uses
to check every frame of the browser trace: each place row splits n exactly, its contribution
equals the count found by reading digits (n ≤ 3000), the naive rule gives 122 vs 11 for
d = 0 over 1…100, and the number-wall formula equals the marks on the wall for every
N ≤ 199, d 1–9 and place 1/10/100.

`check_official_access.py` is the preparation pass's access probe; it performs network
requests and rewrites `evidence/` captures, so it is not part of the regular check.
