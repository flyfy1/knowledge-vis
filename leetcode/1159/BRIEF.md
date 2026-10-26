# #1159 Market Analysis II — author brief

Author run only. Independent review and LeetCode acceptance are pending; this file records the workflow state, not learner-facing copy. Candidate owns only `leetcode/1159`.

Product fit: one bilingual lesson in the existing LeetCode collection. Category: database; stage: university. Reader knows rows, joins, and chronological order. Smallest useful outcome: hand-calculate a seller's second sale, derive a per-seller ranking invariant, and map it to the original MySQL query.

Official source: `https://leetcode.com/problems/market-analysis-ii/`. Normal page access on 2026-10-27 showed the premium gate. Authorized public GraphQL exposed `questionId=1269`, `isPaidOnly=true`, `mysqlSchemas` for Users/Orders/Items and matching `dataSchemas` for Pandas, but returned `content:null` and `codeSnippets:null`. This is recorded in `provenance/official-graphql.json`; no paywall bypass was attempted. Full statement/constraints/selector copy remain a reviewer verification blocker.

## Five-step teaching brief

| Step | Known | Single question | Input → desired output | Action → observation | Conditions |
|---|---|---|---|---|---|
| 1 | A seller has dated sales and a favorite brand | Which row is the second sale? | Seller 9: Apple on Jan 1, Samsung on Jan 3 → yes | Reveal first row, then second; the second row controls the comparison | Dates are ordered and the target asks for the second sale |
| 2 | SQL can number rows | How can “second” be stable per seller? | Orders → `ROW_NUMBER` partitioned by seller and ordered by date | Read the partition and ordering clauses; compare with the wrong Orders-only start | One rank sequence per seller; one sale per date is assumed by public problem mirrors |
| 3 | Rank 2 identifies the item | How do missing second sales remain visible? | Ranked rows + Users + Items → one result per user | Advance frames: ranking accumulates, then rank 2 is joined from Users; no-sale user remains no | LEFT JOIN from Users; missing item brand falls into ELSE no |
| 4 | The invariant says only rank 2 is compared | Can you predict before seeing the result? | Fresh seller 9 scenario → yes/no choice | Select, reveal, change choice; feedback clears on change | Prediction uses the same fixed input |
| 5 | Intermediate tables become a CTE | What exact text can be submitted? | MySQL schema → SQL query | Inspect/copy/download exact `solution.sql`; browser simulation is not execution | MySQL 8 window functions and the observed table schema |

## Terms first used

- **Seller / seller_id**: the user who made an order; the partition key.
- **Window function**: a calculation over related rows that keeps each row visible.
- **Partition**: one seller's group, ranked independently.
- **ROW_NUMBER**: a 1-based position assigned after ordering.
- **LEFT JOIN**: keeps every row from its left table even without a match.
- **CTE**: a named query block (`WITH ...`) used as an intermediate table.
- **Invariant**: a fact preserved across every trace frame: rank 2 is the only candidate compared for each seller.

## Correctness and costs

For each seller, sorting by `order_date` gives a total order under the stated no-same-day-per-seller guarantee. `ROW_NUMBER` labels the second row exactly 2. The join predicate `sale_rank = 2` admits at most that row; starting at Users preserves sellers with fewer than two rows. `CASE` returns yes iff the joined brand equals `favorite_brand`; a null joined brand takes ELSE no. Sorting all m orders costs typically O(m log m) time and O(m) intermediate space; the query scans and joins the three tables. A repeated per-user sort repeats the sorting work.

Simulation state is separate from SQL execution. The lesson keeps ranked rows and joined output in JavaScript solely to make causal accumulation visible. It does not claim to run MySQL in the browser.

## Author checks planned / status

Run independent Python oracle checks over small fixtures (including zero, one, two, and three sales), source mirror parity, and browser checks for both locales, presets, endpoints, reset/replay, prediction reveal/change, copy fallback, 320/390/desktop widths, keyboard focus, contrast and local assets. Record results in `tests/evidence/`. This is self-check evidence only and cannot substitute for the requested separate review.
