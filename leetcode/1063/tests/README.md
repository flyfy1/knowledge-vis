# Reproduce the #1063 author checks

From the repository root, with a preview server running
(`python3 -m http.server 18902 --bind 127.0.0.1`):

```sh
python3 -B leetcode/1063/tests/test_solution.py          # oracle comparisons; also runs test_core.cjs
NODE_PATH=~/Documents/integ-life/integ-games/node_modules \
  PREVIEW_ROOT=http://127.0.0.1:18770 EVIDENCE_DIR=/tmp/1063-evidence \
  node leetcode/1063/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 1063 --validate-only
```

`test_solution.py` compares the canonical solution with two oracles that share no code with
it — the literal definition (`nums[i] <= min(nums[i:j+1])` for every subarray) and a
next-smaller-element count built by pointer jumping — on every array of length 1–7 over
values 0–3, 3,000 seeded random arrays, the public sample inputs, and maximum-size arrays
(n = 5·10⁴: non-decreasing, all equal, strictly decreasing, alternating, 20 random). It also
runs the baseline displayed in step 1, checks the offline source mirror and duplicate copy
keys, and writes fixtures that `test_core.cjs` uses to check every frame of the browser
trace: the stack equals the set of starts alive by definition, popped starts were on top and
die exactly at their first smaller element, and the running total adds the stack size.

`check_official_access.py` is the preparation pass's access probe; it performs network
requests and rewrites `evidence/` captures, so it is not part of the regular check.
