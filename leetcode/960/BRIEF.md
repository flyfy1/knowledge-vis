# #960 author brief — candidate 1

Written before implementation. Category computing / LeetCode; stage university.
Reader: basic Python loops and lists. Job: reconstruct a common-column longest
chain, predict a new case, and implement minDeletionSize. Reuse approved product
pattern and dispatcher adjudication in specs/reviews/leetcode-all-hard-design-review.md;
website-design skill applied. No new layout or shared framework. Author run only;
independent lesson review pending, no acceptance, submission or deployment claimed.

## Official contract
Official URL https://leetcode.com/problems/delete-columns-to-make-sorted-iii/
accessed 2026-10-26; public GraphQL GET capture provenance/official.json includes
statement, complete codeSnippets and metaData. Python3 selector explicitly offers
Solution.minDeletionSize(self, strs: list[str]) -> int. Choose Python by preference.
Rows have equal positive length, 1..100 rows and columns, lowercase English.
Delete identical indices in every row, preserve order, allow equal neighbors.
Each row must be nondecreasing; rows need not be sorted against one another.
Examples [babca,bbazb] ->3, [edcba]->4, [ghi,def,abc]->0. Empty input excluded;
no mutation required. Python, TypeScript and JavaScript interfaces observed (plus
native options retained in capture); no exception or language-contract required.

## Product, tokens and priorities
Highest-return 20%: pair-by-pair row evidence, retained DP ledger, causal proof.
P0: five-step bilingual learning loop, exact canonical Python, reversible simulation,
fresh prediction, source transfer, device/accessibility checks. P1: oracle/evidence.
P2: none. Deferred arbitrary input (small complete presets suffice), animation and
runtime Python service (no demonstrated need). Static page has no auth/loading/
reconnect states. Applicable branches: initial/middle/end, disclosure hidden/shown,
prediction unselected/selected/revealed/changed, copy success/manual and locale.
Use ../style.css and ../common.js. Exact tokens: bg #0d1117, panel #161b22,
panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. System font and 1.75 line-height;
952px content, 24/16px gutters, stage radius14px/control8px, shared title clamp;
48px actions, solid muted disabled, 3px orange focus. No new palette/motion/assets.

## Step contract
|Step|Known|One question|Input → sought|Action → observation|Conditions|
|---|---|---|---|---|---|
|0|Two short rows|Which shared column can be deleted?|bac,abc → min deletions|Reveal: keep 0,2 gives bc/ac|Same indices, each row nondecreasing|
|1|Keep/delete choices|Why keep the earliest legal column fails?|cab,abc → alternatives|Read masks baseline and greedy counterexample|Exhaustive tiny baseline only|
|2|Column compatibility|What best chain ends at each column?|six presets → dp ledger|Forward/back/reset/end: row comparisons and old→new updates|Frame after whole column, no omitted pairs|
|3|Ending-column invariant|Can it solve a fresh conflict?|azbc,abcd → deletions|Choose then reveal; change clears; locale preserves|Independent of trace controls|
|4|Derived recurrence|How does the official callable implement it?|strs → integer|Map dp, loops, guard, return; copy/download|Official bounds; no mutation|

## First use / proof
Step0 column index is zero-based; nondecreasing means each next character >= prior.
Step1 baseline = enumerate all shared keep/delete choices; subsequence = keep in
original order. Step2 compatible i→j means i<j and strs[r][i]<=strs[r][j] in every
row r. dp[j] is longest valid kept chain ending at j; invariant = statement true
after completing that column. Every chain ending j is singleton or has predecessor
i; its earlier length <=dp[i]. Conversely append j to an optimal compatible chain
ending i, attaining dp[i]+1. Max over all such i and singleton gives exact dp[j].
Earlier columns finalized before use. Longest length L=max(dp); delete m-L. Empty
chain cannot beat singleton with positive m. All comparisons allow equality.
No need to compare all kept pairs since <= is transitive within each row.
Baseline O(n*m*2^m) time, O(m*2^m) stored indices; submission O(n*m^2), O(m) auxiliary.
Simulation retains snapshots and candidate comparisons, distinct from submission
storage/execution. No truncation on six bounded presets. Keep indices tied to chars.

## Verification boundary
Run independent subset oracle, exhaustive binary matrices, seeded random, official
examples/maxima, every ending-column invariant, Python execution and JS trace parity.
Real browser both languages, all presets/frames, rewind/endpoints, predictions,
clipboard fresh sentinel native fallback, exact source/download, 320/390/736/1440,
200% native zoom, focus, local links/assets, storage denial/offline and contrast.
Evidence and tests live here and accept OUTPUT_DIR. Freeze candidate hashes after
checks. Separate reviewer still required; no novice outcomes/public validation.

## Candidate 1 author completion
Complete author candidate, self-checked on 2026-10-26. Python: 7064 cases;
trace: 4102 cases with intermediate invariants; browser: 36 recorded state groups,
38 screenshots, both locales/all six presets, native copy/fallback and 200% zoom.
Combined shipped CSS 11308 bytes; minimum measured normal text contrast 6.449:1.
Official selector/callable evidence is captured. Metadata preflight
`python3 -B scripts/register_leetcode_lesson.py 960 --validate-only` passed (exit 0).
Frozen runtime/test/provenance identities are in tests/evidence/candidate-sha256.json.
Separate lesson review: pending. Independent reviewer identity/run: unavailable
in this author-only run. No independent acceptance, registration or deployment.
