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

## Independent review and revision — 2026-11-11

The record above is the authoring run's (Codex, `Built-By: gpt-6.1-sol (1159-author-4f61fd201efd)`, candidate `5ebb51771a9ce07a3a229cff9e6ca5cb3c8c7a91`) and is left unchanged.

```
Verified-By: Claude Code (claude-opus-5-5); independent review of Codex candidate 5ebb5177 — learner read-through scored on REVIEW-RUBRIC A–G, solution.sql executed in SQLite against a plain-Python definition, link check, browser check zh/en at 1280/390/320. The revisions listed below are self-checked only; a fresh independent review of the revised lesson is pending. Not reviewed by a human.
```

**Rubric before → after (0–3):** A 1→3, B 1→3, C 1→3, D 1→2, E 1→3, F 1→3, G 2→3.
Before: no restatement of the three tables; ROW_NUMBER announced in step 2 with no example motivating it; preset dropdown labelled with unrelated trace strings; duplicate copy key `rank` made the trace title read "rank"; a hard-coded English hand readout in the zh page; the worked preset copied LeetCode's example; related links pointed to #1095 (binary search) and #2916 (interval DP), both unrelated; a footer announced workflow status in the learner UI (against specs/leetcode-explainers.md).

**Correctness (unchanged SQL):** solution.sql run in SQLite 3.54 against a plain-Python definition: 14,400 exhaustive markets (2 users × 0–3 sales each × 3 brands, storage order shuffled) and 2,000 seeded random markets (incl. sellers absent from Users, buyers who never sell); the correlated-subquery baseline agrees on all; the page's simulated pipeline equals real SQL for all 8 query variants on 28 datasets (224 runs). Dialect gap: MySQL's default case-insensitive collation vs SQLite; data uses one capitalisation. Not run on MySQL itself; not submitted to LeetCode (premium; statement reconstructed from the GraphQL schema plus public knowledge of the problem — the "no seller sells twice on one day" guarantee is assumed as stated in public mirrors).

**Changed:** rewrote copy.js (now the bilingual strings; the old clipboard helper moved into app.js), index.html, app.js, core.js, style.css, lesson-entry.json. New sequence: own small market with a storage-order trap (user 3) → GROUP BY cannot name "the second row", correlated baseline and its u·m cost → the positions written by hand become ROW_NUMBER → LEFT JOIN from Users, with `sale_rank = 2` in ON vs WHERE → switchable query variants (order key, join type, filter place) and editable favourite brands, each compared with the correct answer → fresh prediction → SQL mapping, cost, MySQL notes. Links now: `../185/#step1` (ranking inside groups), `../262/#step0` (eligible rows after a join). Workflow footer removed.
**Tests added:** tests/test_sql.py, tests/test_core.cjs, tests/browser.cjs. tests/test_core.py kept. Files in tests/evidence/ and SELF-CHECK.md describe the earlier candidate.

## Cross-review 2026-11-11

Reviewer: Claude Code (claude-opus-5-5); treated as a new lesson, working tree only (not committed).
Statement: confirmed from two public sources (doocs mirror; talentd.in): the three schemas, "no seller sells more than one item on the same day", fewer than two sales → no, columns seller_id and 2nd_item_fav_brand, any order; the official example gives 1 no, 2 yes, 3 yes, 4 no.
Brute force: own plain-Python definition vs solution.sql executed in SQLite 3.54 on the official example and 20,000 seeded random markets (1–4 users, NULL favourite brands, sellers missing from Users, shuffled storage order, distinct days per seller): all agree; the column names and the ORDER BY are checked too. Lesson tests test_sql.py, test_core.cjs, test_core.py and browser.cjs pass.
Read as MySQL: CTE + ROW_NUMBER() OVER (PARTITION BY … ORDER BY order_date) needs MySQL 8.0+ (or MariaDB 10.2+); order dates never tie within a seller, so the numbering is deterministic; `sale_rank = 2` in ON keeps every user; the NULL brand of a missing second sale falls to ELSE 'no'; a NULL favourite brand also gives no. I expect it to run unchanged on MySQL 8 / MariaDB ≥ 10.2. Not actually run: no MySQL or MariaDB server is available here (no docker, no client).
Examples recomputed by hand: market seller 1 → Lumo = Lumo yes; seller 2 one sale; seller 3 stored second row Kiwi vs date-second Nova (yes); seller 4 none; 4 × 6 = 24 reads; 10⁴ × 10⁵ = 10⁹; the predict case (user 7: Apr 2 Kiwi, Apr 5 Nova, Apr 8 Kiwi → no) and both wrong-option explanations; ON vs WHERE effect; links #185/#262 exist with anchors.
Found and fixed: `map5` said a column name starting with a digit must be quoted in MySQL. MySQL accepts unquoted identifiers that begin with a digit (only all-digit names need quoting). The text now says backticks are the portable choice and SQLite (used by the tests) needs them (checked: SQLite rejects `AS 2nd_x`). Both languages.
Browser: zh/en at 1280/390/320: no overflow, no empty copy, no console errors; read in full as a learner at 1280. Rubric: A3 B3 C3 D2 E3 F3, G3 after the fix.
