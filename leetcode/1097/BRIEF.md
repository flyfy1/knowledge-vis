# #1097 · Game Play Analysis V — lesson brief

Built 2026-11-11 (Claude Code, claude-opus-5-5) from the prepared-but-blocked brief of 2026-10-27.
Author self-check only; independent review not performed. No LeetCode submission was made.

## Change from the prepared brief

The preparation pass stopped at the paywall (evidence kept in `tests/evidence/`). Public metadata
confirms ID 1097, Hard, paid-only, the Activity schema `(player_id int, device_id int, event_date date,
games_played int)`, schemas for MySQL, MS SQL Server, Oracle, PostgreSQL and a Pandas DataFrame, and a
sample Activity table. The owner asked on 2026-11-11 for remaining problems to be built, and the
dispatcher specified SQL for this database problem. The lesson is built on the problem's well-known
statement; the page labels its restatement as our own. The official sample table and its output are not
reproduced; all tables in the lesson are our own.

Problem as understood: (player_id, event_date) is the primary key. A player's install date is the
player's first login date. For each install date x, report install_dt, installs (players whose install
date is x) and Day1_retention = (installers of x with a row on x + 1 day) / installs, rounded to 2
decimals; any order.

Residual uncertainty: exact wording of the rounding sentence and the output column names could not be
read. The names `install_dt`, `installs`, `Day1_retention` and "round to 2 decimal places" are the
commonly reproduced ones; the official sample input gives 2016-03-01 → 2, 0.50 and 2017-06-25 → 1,
0.00 under this reading, which matches the commonly cited expected output.

Language: MySQL (`solution.sql`, `sql-code.js`, `language-contract.json`). Pandas is officially
supported too, so the repository's Python-first rule would normally choose Pandas; MySQL was chosen
because this build was explicitly asked for SQL, as in #1159. The contract records this and lists
Pandas as "Python (Pandas)", the same label #1159 uses (which is what lets the validator accept MySQL —
a reviewer should confirm that this is acceptable policy).

## Approach

Insight: each player affects the result through at most two rows (install row, next-day row), so shrink
to one row per player (GROUP BY player_id, MIN(event_date)), LEFT JOIN the row dated install_dt + 1 day
(at most one by the key), then GROUP BY install_dt with COUNT(*) and COUNT(a.player_id). Wrong turns
taught: counting everyone active on x; any later return; INNER JOIN (retention 1.00 / vanishing dates);
string date arithmetic. Baseline: correlated subqueries, O(n²) logically. Cost: O(n log n) time with the
primary-key index, O(p) intermediate space.

## Learning loop

| Step | Already known | One question | Input → output | Action → observation | Holds when |
|---|---|---|---|---|---|
| 1 Hand | definition | What do the two numbers count? | 10-row table → 0.33, 0.50 | reveal one player at a time | unsorted rows |
| 2 Mistakes + baseline | step 1 | Where do first ideas fail? | same table | 3 vs 2 installs; 0.67 vs 0.33; correlated query and its cost | — |
| 3 Useful rows (aha) | steps 1–2 | Which rows matter? | table → roles | guess, then mark: 5 install rows, 2 next-day rows, 3 irrelevant | key (player, date) |
| 4 Join | step 3 | Find the next day without losing anyone? | installs → joined | LEFT vs INNER, COUNT(*) vs COUNT(col), calendar arithmetic | at most one match per player |
| 5 Walk | 3–4 | How is each row handled? | presets, random table, row toggles, join toggle → three phases | next/back/reset/end; Activity roles, installs table with NULL/dropped, output groups; proof + boundaries | snapshot storage is tutorial-only |
| 6 Predict | all | 06-10 retention on a new table? | → 0.50 | distractors 0.33 (active ≠ installed), 1.00 (INNER JOIN) | changing choice clears feedback |
| 7 SQL | all | Which clause from which step; cost; dialects? | source | mapping, copy/fallback/download | — |

## Verification

SQLite 3 in memory is the only engine available. `solution.sql` is translated by asserted substitutions
(DATE_ADD → DATE(…, '+1 day'); `/` → `* 1.0 /`) and run on 3049 tables (the four lesson tables, edge
cases including empty, single row, leap/non-leap February, year end, and 3000 seeded random tables plus
40 large ones with 200–900 players); the step-2 baseline query is run the same way on 3009 tables.
Exact (date, installs, returned) are compared with a plain-Python oracle; SQLite's float ROUND is
compared separately and differs only at exact .xx5 ties (observed twice), a SQLite artefact. The oracle
also emulates MySQL's DECIMAL(…,4) division: it can differ from exact rounding by 0.01 only when more
than 100 players installed on one date (proved for m ≤ 100, example 1/201 kept as a test). Not
verified: execution on real MySQL; the official statement; a LeetCode submission; independent review.

## Cross-review 2026-11-11

Reviewer: Claude Code (claude-opus-5-5), first reader who did not build the lesson.

- **Statement.** Checked against doocs/leetcode (README_EN for 1097), the chiu-kuohsin Hive write-up and
  kamyu104/LeetCode-Solutions: Activity(player_id int, device_id int, event_date date, games_played int),
  primary key (player_id, event_date), install date = first login, output columns `install_dt`,
  `installs`, `Day1_retention`, "rounded to 2 decimal places", any order. The lesson matches; the column
  names and rounding wording are now confirmed by public mirrors (one practice site uses other names).
- **Independent check** (`/tmp/agent-tasks/leetcode/xreview-b/bf1097.py`): my own Python oracle vs
  `solution.sql` with my own SQLite translation, exact (date, installs, returned): 5000 random tables
  (some spanning a year, incl. leap day) + 3375 exhaustive tables (3 players × every non-empty subset of
  4 days across a year end): 8375 tables, all equal.
- **MySQL reading.** CTE needs MySQL 8 (LeetCode's engine); DATE_ADD on DATE returns DATE; the key
  allows at most one next-day row per player, so COUNT(*) is never inflated; NULLs from the LEFT JOIN are
  skipped by COUNT(a.player_id); ONLY_FULL_GROUP_BY is satisfied. No MySQL/MariaDB/docker is available
  here, so it was not run on MySQL.
- **Error found and fixed:** the page and test claimed MySQL may be 0.01 off exact rounding when more
  than 100 players install on a date (1/201 → 0.01). That was an artefact of modelling the division as a
  4-decimal value: 4 places is only the display scale; a MySQL developer states (bugs.mysql.com
  #103145, closed "not a bug") that decimal division is carried internally with 9 decimals, and that is
  what an enclosing ROUND receives. With 9 places ROUND(k/m, 2) equals exact half-up rounding unless
  m ≥ 10⁷ (proof in the test; exhaustive for m ≤ 3000). The dialect note (zh/en) and the test oracle are
  corrected; 1/201 now expects 0.00; the 4-place figure is kept only as what CAST-to-4-decimals would do.
- Other text recomputed by hand and code: 0.33/0.50, 3 vs 2 installs, 0.67, 150 row visits, 5/2/3 row
  roles, quiz 0.50 and both distractors. zh/en agree.
- Rubric: A3 B2 (step 3's question already says "at most two rows" before the reader marks them)
  C3 D3 E3 F3 G3 after the fix.
- Not verified: execution on real MySQL (the internal-precision point rests on the developer's statement,
  not a run); LeetCode submission; official wording.
