# #185 Department Top Three Salaries — author candidate

Reuse verdict: extend the approved five-section LeetCode lesson pattern; design authority is specs/reviews/leetcode-all-hard-design-review.md and its dispatcher adjudication. Author self-check only; independent lesson review pending.
Category computing; stage university. Reader: basic Python, new to Pandas ranking. Job: identify all employees on the first three distinct salary levels within their own departments, explain ties, submit the verified Pandas interface.

Official verification: 2026-10-18; https://leetcode.com/problems/department-top-three-salaries/ and public GraphQL (tests/evidence/official-graphql.json). Selector includes Pandas, signature top_three_salaries(employee: pd.DataFrame, department: pd.DataFrame) -> pd.DataFrame. Other observed interfaces: MySQL, MS SQL Server, PostgreSQL, Oracle. Python preferred and faithful. Employee(id int PK, name varchar, salary int, departmentId int FK), Department(id int PK, name varchar). Only explicit constraint: no duplicate exact name/salary/department triple. No numeric bounds, null policy, or row-count bound is stated. Output Department, Employee, Salary; any order. Official example yields six employees, excludes Janet. Do not invent positivity, nonempty inputs or SQL-only constraints.

Learning loop: hand compute 90,90,80,70,60 → distinguish rows from levels → derive dense ranks → reversible row ledger → unseen prediction → map to executable Pandas.

|Step|Already known|Single question|Input → output|Action and visible observation|Conditions|
|---|---|---|---|---|---|
|0|Salary comparison|Who belongs in the output?|Five named employees → four qualifying rows|Toggle duplicate top salary → output count changes and the third level shifts from 70 to 80|Rank within one department; arbitrary illustrative units|
|1|Distinct salary levels|How do we avoid comparing each employee with everyone?|Baseline count of larger distinct salaries → shared ranks|Read explicit counterexample and hand calculation|Equal salary means same rank, no skipped rank|
|2|Rule from step 1|Why does each row get this rank?|Small sorted employee tables → complete retained rank ledger|Next/back/reset/end/presets show old rows plus current assignment|Browser simulation, not execution; rank restarts at department ID|
|3|Dense rank rule|Does a tie consume a level?|Fresh two-department case → prediction|Select, reveal, change answer; explanation clears on change|No answer before reveal; locale preserves state|
|4|Rank selection|How does the official code preserve every qualifying employee?|DataFrames → three result columns|Open/copy/download exact Python; map rank/filter/merge|No input mutation; expected hash join costs; no output ordering promise|

New terms: step0 distinct salary = a value counted once; step1 baseline = straightforward independent method, dense rank = 1 + number of larger distinct values; step2 processed prefix = rows already assigned, department key = ID not name; step4 DataFrame = labeled table, merge = match rows by key. Re-explain each term in its step. No universal diagram framework.

Tokens: exact shared leetcode/style.css palette --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Shared system fonts/type/spacing/radii; local 48px controls, disabled opacity 1, 3px separated focus. No added color literals. No motion or timers. Table has a 390px minimum width inside a keyboard-focusable horizontal scroll region; a bilingual caption explains scrolling. This avoids colliding headers at 320px and 200% zoom.

State matrix, both languages: initial/current/end, empty, preset restart, rewind/reset, unanswered/selected/revealed/changed, source disclosure, clipboard success/denial fallback, storage denied. Network/loading/reconnect inapplicable to static local lesson. Locale preserves state, source disclosure and focus. Trace and quiz independent. Tutorial snapshots are not submission memory.

P0: verified interface, bilingual causal teaching, real Pandas execution vs independent brute-force oracle, honest trace, all controls and source parity, browser/contrast/width checks. Highest-return slice: ties and per-ID grouping visible in ledger. P1: related conceptual anchors. P2/deferred: decoration, automatic animation, arbitrary table editor (bounded presets suffice), browser Python runtime (unnecessary dependency), learner outcome claims (no learner study). No external assets.
