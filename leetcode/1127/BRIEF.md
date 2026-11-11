# #1127 · User Purchase Platform — lesson brief

Category computing / LeetCode collection; stage university. Reader knows SELECT, WHERE, GROUP BY and basic joins.
Outcome: given a spending log, the reader can explain why "both" needs a first grouping by (date, user), why zero
rows need a fixed output grid plus LEFT JOIN, avoid the COUNT(*) trap, and write the MySQL query.

## Revision of the preparation brief (2026-11-11)

The preparation pass (2026-10-27) stopped at the subscription gate: the public GraphQL response has
`content: null` and `codeSnippets: null`, but does expose `mysqlSchemas` (table definition and sample rows); see
`tests/evidence/`. That blocker record is kept. This build proceeds on the following reading of the problem,
which is the widely known statement and is consistent with the public schema and sample input:

- `Spending(user_id int, spend_date date, platform ENUM('desktop','mobile'), amount int)`; primary key
  (user_id, spend_date, platform).
- For each date, report the total number of users and total amount for users who used mobile only, desktop
  only, and both on that date. Columns `spend_date, platform, total_amount, total_users`, platform values
  `desktop`, `mobile`, `both`.
- Every date present in Spending gets all three rows; a group with nobody is printed with 0 and 0 (the
  sample's second date has no "both" user and the expected output shows `both | 0 | 0`). Any order.

Uncertain, not verifiable without a subscription: the exact wording; whether a date absent from Spending could be
expected (no: there is no calendar table, so dates come only from Spending); the output row order (believed to be
"any order"; the query adds a deterministic ORDER BY that is harmless either way). Language: MySQL per the
dispatcher's instruction and the evidence (only mysqlSchemas is exposed); a Pandas variant exists in the catalog
but its signature is not public — recorded in `language-contract.json`.

## Learning loop (each step: known → question → input/output → action/observation → conditions)

| Step | Already known | Question | Input → output | Action → observation | Holds when |
|---|---|---|---|---|---|
| 1 Hand | rows, dates | What does one output row count? | worked 6-row table → 6 output rows | label person-days one at a time; answer cells fill; March 2 "both" stays ? then becomes 0/0 | labels are per (date, user) |
| 2 Obvious query | GROUP BY | Why not GROUP BY date, platform? | same table → naive vs required side by side | read diff rows: 70/2 vs 30/1, 75/2 vs 50/1, both rows missing; question "can one row tell you user 1 is both?" → reveal | any user with two platforms on a day |
| 3 First grouping | the aha | How to give each person-day one label? | Spending → user_day | read user_day; conservation 145 = 145 | PK; COUNT(DISTINCT) robust anyway |
| 4 Zero rows | user_day | Where does an empty group come from? | user_day → 5 rows (one missing) | question → reveal grid + LEFT JOIN; table contrasts COUNT(*)=1 with COUNT(u.user_id)=0 | dates only from Spending |
| 5 Walk | both stages | Does the invariant hold on any input? | 12 toggleable purchases + 5 presets → full trace | toggle user 1's desktop: label flips mobile↔both, money moves, day total constant; empty a day: its rows vanish | 2 dates × 3 users × 2 platforms teaching grid |
| 6 Predict | all | Fresh day (Apr 7) → three rows | choose, reveal; options = naive result, purchase-row counting, correct | feedback hidden until reveal; cleared on change |
| 7 Code | all | Where is each idea in SQL; what does it cost? | solution.sql | mapping list; cost; dialect note; copy/download | MySQL 8 |

Terms at first use: person-day (step 1, repeated in 3/5), label, user_day, grid, CROSS JOIN, LEFT JOIN, NULL,
COALESCE (step 4), invariant (step 3). Trace frame = after reading one Spending row (stage a) or after filling one
output cell (stage b); frame 0 has done nothing. Snapshots are deep copies.

Correctness: stage (a) gives each (date, user) exactly one row and one label and preserves the day's money and
head-count; stage (b) enumerates the fixed 3·D cells, the LEFT JOIN keeps each, COUNT of a right-hand column
ignores the NULL row, COALESCE turns the empty sum into 0. Cost O(n log n) (expected O(n) hashed), O(n) space; the
per-cell rescan baseline reads 3·D·n rows.

## Verification (author self-check, not independent review)

- `tests/test_solution.py`: runs `solution.sql` in in-memory SQLite against a plain-Python definition oracle:
  all 4096 subsets of the lesson's 12 toggle rows, 3000 seeded random tables (≤12 dates, ≤30 users/date, amounts
  0..10^6, shuffled order), edge tables (empty, zero amounts, single row, 84-row month), a 16,660-row table; asserts
  the naive, no-grid and COUNT(*) variants fail as the lesson says; exact row order; mirror parity. It then feeds
  the 4096 fixtures to `tests/test_core.cjs` (browser model: result, final frame, per-frame conservation and
  head-count invariants, frame count, deep snapshots, preset claims).
- `tests/test_copy.py`, `tests/browser.cjs` (see tests/README.md).
- Not verified: execution on real MySQL (none available locally), a LeetCode submission, the exact official
  statement text, real-device rendering, independent teaching review.

## Cross-review 2026-11-11

Reviewer: Claude Code (claude-opus-5-5). First reader who did not build the lesson.

**Problem statement.** Checked against public sources: doocs/leetcode `1127.User Purchase Platform/README_EN.md`
(full statement, schema, sample) and walkccc.me/LeetCode/problems/1127 (MySQL solution), plus search snippets from
other mirrors. They agree with this lesson on every point the builder listed as uncertain: table and column names;
output columns `spend_date, platform, total_amount, total_users`; platform values `desktop`, `mobile`, `both`; every
date gets all three rows, with 0/0 for empty groups (the public sample's 2019-07-02 `both | 0 | 0`); and "any
order". The page now says these points agree with the public sites. No statement text or official example was copied.

**Solution.** My own definition oracle (`tests/test_xreview_oracle.py`, written before reading the builder's) runs
solution.sql in SQLite on 9,561 tables: every subset of 2 users × 2 dates × 2 platforms with amounts {0, 7}, 3,000
seeded random tables, and the public sample. All match. I also read the query as MySQL 8 would execute it:
- under ONLY_FULL_GROUP_BY every selected expression is grouped or aggregated, including the CASE in ORDER BY;
- `MAX(platform)` on an ENUM compares string values, which is harmless because the group then holds one value;
- the CTEs, the derived UNION ALL table, the CROSS JOIN and COALESCE are all valid MySQL 8.

The query has the same shape as the public MySQL solutions. **No MySQL or MariaDB is available locally**
(`which mysql mariadb mysqld docker podman` all empty), so it has not been run on MySQL.

**Language contract.** `"Python (Pandas, interface not exposed publicly)"` was not a language label, and it was
inconsistent with #1159 (`"Python (Pandas)"`). The validator accepts `["MySQL"]` alone, so the label was not needed to
pass it. The catalog lists 1127 under database + pandas, so I changed the label to `"Python (Pandas)"` and moved the
caveat into `rationale`: the signature was never captured because the probe did not request dataSchemas.

**Text.** Recomputed by hand and against core.js: naive 70/2 and 75/2; 145 = 145; 3·D·n = 36; about 1.1 × 10⁹; April 7
= desktop 6/1, mobile 20/2, both 40/1, total 66. All correct, and zh and en agree. Fixed:
- zh step 4 said 下表 ("the table below") for a table that sits above the text; en now says "the table above";
- the trace's simulation note claimed the SQL "is executed against a real database"; it now says SQLite, not MySQL.

**Layout.** At 1280 px in en, the user_day trace table was clipped (489 px of content in a 445 px box), hiding the
amount column the conservation invariant is about. I tightened cell padding in `.trio` and shortened the column header
("platforms that day" / 当天的平台). At 390 and 320 px the wide tables scroll inside focusable regions, as in other
lessons in the collection.

**One-frame preset.** The empty-table preset does not hide a defect: app.js disables prev/reset at frame 0 and
next/end at the last frame, so all four are disabled. The test's `else` branch now asserts all four explicitly instead
of only reset.

**Rubric** (0–3): A 3, B 3, C 3, D 3, E 3, F 3; G correct after the two text fixes.
Not verified: execution on real MySQL, a LeetCode submission, the official wording, the Pandas signature.
