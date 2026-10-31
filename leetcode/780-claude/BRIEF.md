# #780 Reaching Points — independent comparison draft (780-claude)

Written from the repo conventions (WORKFLOW, specs/leetcode-explainers.md, sibling
#782 file layout) without reading the existing `leetcode/780/` content. Not
registered in `problems.config.js`; no deployment; author self-check only.

Category leetcode · stage university · reader: knows loops and `%`, not Euclid.
Learning loop: forward guessing explodes → backward parent is unique → fold runs
with `%` → stop exactly when one coordinate equals its source → Python.

| Step | Already known | Single question | Action → expected observation | Holds when |
|---|---|---|---|---|
| 1 Walk forward | two move rules | which way to grow from (1,1) to (3,5)? | up/right/up lands on target; right-first overshoots; level chips double 1,2,4,8,16 | all values positive (coordinates only grow) |
| 2 Walk backward | moves only grow | which move produced (tx,ty)? | step back: larger − smaller each time; (6,9) ends at (3,3) missing (1,1) | positive values; diagonal has no parent |
| 3 Fold a run | unique chain | how to skip a run of equal subtractions? | tracer: loop count small, subtractions represented up to 999,999,999; (2,3)→(2,11) shows why loop stops at tx = sx | fold only while tx > sx and ty > sy |
| 4 Predict | fold + stop rule | can (3,2) reach (5,17)? | choose, check; wrong options explained by overshoot / "run must end at 0" | — |
| 5 Python | all above | which line is which idea? | map loop / `%=` / tail test; copy & download source | 1 ≤ values ≤ 10⁹ |

Terms first used: parent (step 2), diagonal x = y (step 2), run / fold (step 3), gap (step 3).
Related concept link: `../../division-remainder/#step2` (division as repeated jumps).

Self-checks (`tests/`): `python3 -B tests/check.py` — Solution vs forward DFS on all
sx,sy ≤ 12, tx,ty ≤ 30 plus random reachable walks and 10⁹ edge cases (132,600 PASS).
`node tests/core.cjs` — browser trace vs one-subtraction oracle, subtraction counts
and history snapshots (160,000 PASS). Browser: zh/en, all controls, 320px no overflow,
no console errors. No independent review, LeetCode submission or learner evidence.
