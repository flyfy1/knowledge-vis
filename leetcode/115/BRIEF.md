# #115 Distinct Subsequences — author brief

Product verdict: reuse the collection lesson, its shared locale, navigation and exact tokens. Audience: readers who know strings, loops and Python lists; category computing, stage university. Approved pattern: specs/reviews/leetcode-all-hard-design-review.md, dispatcher D1–D10. This author run does not reopen design or claim independent acceptance.

Official verification: 2026-10-18, https://leetcode.com/problems/distinct-subsequences/. Public GraphQL GET succeeded; full response and code selectors in tests/evidence/official-graphql.json. Python3 offers `class Solution: def numDistinct(self, s: str, t: str) -> int`. Hard, free; lengths 1…1000; English letters, case sensitive; final count fits signed 32 bits, no modulus. Examples rabbbit/rabbit=3 and babgbag/bag=5. Direct HTTP page received 403; browser-readable statement and public GraphQL were available normally. No submission acceptance claimed.

Learning loop: enumerate source positions → partition choices by last character → preserve old counts in reverse order → predict unseen count → implement official Python method. Five sections expose different causal obligations.

| Step | Already knows | Single question | Input → quantity | Action → observation | Conditions |
|---|---|---|---|---|---|
|0 Choose positions|Strings and increasing positions|What is counted?|aaa, aa → number of position lists|Inspect the three explicit pairs; compare greedy=one|Order retained; deletion allowed, no reuse|
|1 Split the count|Three valid pairs|Where do contributions come from?|Source prefix + target prefix → D(i,j)|Read all four rows and split final 3 into 1+2|Skip/use groups are disjoint and complete|
|2 Reversible experiment|Skip/use recurrence|How can one row replace the table?|Small presets/custom letters → every cell update|Next/back/reset/slider; prior rows and current dependency equation remain visible|Reverse j keeps source prefix i−1; max teaching input 10|
|3 Transfer|Old-row invariant|Can you count a new case without reuse?|ababa, aba → count|Select before reveal, change choice clears feedback|Choices are increasing indices, not unique text|
|4 Python and limits|Reverse dependency rule|Why does executable code preserve the count?|Official method → integer|Inspect/copy/download source and map j to table cells|O(mn) arithmetic operations, O(n) integer cells; arbitrary precision caveat|

Terminology at first use: subsequence (step0: delete positions without reordering); prefix (step1: first i/j characters); D(i,j) (step1: position selections from s[:i] spelling t[:j]); invariant (step2: statement preserved by updates); dp[j] (steps2/4: count for first j target letters). Definitions repeated locally for jump readers. No modulus; empty prefixes internal even though official strings nonempty. Empty custom strings are explicitly extension tests.

Simulation: local deterministic DP snapshots, not Python execution. Table is conceptual D; current row includes pending `?` cells. Array is mixed old/new during reverse sweep; current equation names old values. Completed rows retained; rewind uses deep snapshots. Python stores one row; tutorial stores O(m²n²) scalar cells across all snapshots (at most 100 updates for bounded inputs), plus rendered history. No truncated trace.

Exact token contract: inherited leetcode/style.css variables --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. No new palette. System font inherited, body 1rem/1.75, heading clamp inherited, local grid gap 8px, card radius 14px, controls radius 8px, 48px targets. No shadows or animations. Local overrides remove disabled opacity and use muted text. Focus inherited 3px accent2 +4px offset. Shared CSS + local <25000 bytes.

P0: complete causal prose, truthful table/rolling-array views, reversible controls, custom bounded cases, both locales, source parity, oracle/browser/contrast evidence. Highest-return 20%: three position pairs and old-row dependencies visible at every update. P1: related DP deep links. P2: none. Deferred: playback (manual changes expose dependencies), arbitrary large UI inputs (snapshot growth), execution backend/accounts (no need), registry changes (outside author ownership). No loading/reconnect state: all runtime assets local. Applicable states: start/end, mismatch/match, empty extension, invalid input, unrevealed/revealed/changed prediction, clipboard success/denial and storage denial in both locales.

Validation: independent combinatorial enumeration on small cases, recursive oracle for medium, closed-form repeated-letter counts, per-frame invariant audit and Python execution; browser actual controls/locales/widths/zoom/keyboard/denied APIs/source/download. All output tests accept OUTPUT_DIR. Screenshots manually inspected by author. Independent review and real learner teach-back remain pending. No production changes.
