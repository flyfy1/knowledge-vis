# #132 Palindrome Partitioning II — author brief

Product verdict: reuse the approved LeetCode lesson route and five-section pattern.
Authority: specs/reviews/leetcode-all-hard-design-review.md (dispatcher adjudication),
WORKFLOW.md, UI-I18N-SPEC.md, explainer/trace/review-gate specifications, and
~/Documents/agent-skills/website-design/SKILL.md. Design approval is inherited for
this pattern only; lesson acceptance requires a separate run, still pending.
Category computing; stage university. Reader: knows strings, loops, and minimum.
Job: derive and implement minimum cuts, rather than list all partitions.
Learning loop: calculate aab → reuse inner palindrome checks → compare every last
piece → reversible trace → fresh prediction → executable Python.

## Official contract, observed 2026-10-18
https://leetcode.com/problems/palindrome-partitioning-ii/
Public GraphQL POST https://leetcode.com/graphql/ returned the complete statement,
examples, metadata and codeSnippets. Exact response: tests/evidence/official-graphql.json.
Python3 selector stub: class Solution: def minCut(self, s: str) -> int.
Python is canonical. No nondefault language contract is required.
Input: 1–2000 lowercase English letters. Output: minimum number of cuts between
nonempty contiguous palindrome pieces. Examples aab→1, a→0, ab→1. No modulus,
mutation, empty-string contract, or special exceptions. Empty input is not a UI preset.
Direct requests GET received 403; public GraphQL succeeded without authentication.

## Exact token contract
Reuse ../style.css and ../common.js. Colors: bg #0d1117, panel #161b22,
panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8,
accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93.
System font stack and shared sizes/spacing/radii remain exact. Local roles use
these variables only; 48px controls, 3px accent2 focus, opaque muted disabled text.
No ambient motion; semantic HTML tables with contained scroll at narrow widths.

## Sequence (five fields per step)
|Step|Already known|Single question|Input → requested quantity|Action → observation|Conditions|
|---|---|---|---|---|---|
|0 Cut by hand|String positions|What counts as one cut?|aab → minimum cuts|Read all four placements of cuts; compare 2 and 1 valid cuts|Contiguous nonempty pieces; palindrome means same forwards/backwards|
|1 Save two kinds of work|Valid partitions|Why can every final piece be compared cheaply?|aab → palindrome table P and prefix pieces dp|Follow aa, ab, aab and final b checks; see inner lookup and competing totals|Increasing right endpoint; dp[0]=0; no greedy choice|
|2 Reversible experiment|P and dp definitions|Which candidate changes the prefix minimum?|Seven fixed strings, lengths 1–6 → full snapshots|Forward/back/reset/end/range/preset; see retained P cells and candidate ledger, before/after dp|Simulation, not Python execution; all frames retained, unknown ≠ false|
|3 Transfer|Last-piece invariant|Which final piece gives aabab its best partition?|Fresh aabab → cuts|Select before reveal, change answer clears feedback; locale preserves it|Independent from experiment; three fixed-order choices|
|4 Code and proof|Candidate comparisons|Why is the answer globally minimal, and what does it cost?|s → Solution.minCut(s)|Inspect/copy/download exact canonical source; map aab final b to dp[3]|Nonempty lowercase input; O(n²) time/space, tutorial snapshots separate|

## First-use dependency table
|Term|First appearance|Definition and dependencies|
|Palindrome, substring, cut|0|Reads the same both ways; contiguous part; boundary splitting two pieces|
|Partition|0|All characters covered once in order by nonempty pieces|
|P[l][r]|1, repeated locally in 2/4|Whether inclusive substring l…r is palindrome; zero-based indices|
|Prefix, dp[k]|1, repeated locally in 2/4|First k characters; fewest palindrome pieces covering them|
|Cut mask|0|One 0/1 digit per gap records which gaps are cut|
|Dynamic programming|1|Store answers to smaller questions and reuse them|
|Invariant|4|A statement remaining true after each completed column|

## Mechanism and honesty
Baseline enumerates 2^(n−1) cut masks; checking pieces costs O(n) per mask,
O(n·2^n) time and O(n) auxiliary space with sequential enumeration. Independent
oracle uses masks, not the palindrome recurrence. Tempting longest-prefix greedy
fails aaba: aa|b|a (2 cuts) vs a|aba (1).
Canonical implementation uses bytearray palindrome rows and an integer dp array;
short substrings bypass the nonexistent inner cell; r increases, so older columns
and dp[l] are complete. Every possible last piece is tested; mismatched endpoints
and false interiors are excluded explicitly. dp counts pieces, answer subtracts one.
Tutorial stores snapshots for at most 6 letters, O(n^4) cells across O(n²) frames;
not the submission's O(n²) space. No omissions or sampled frames.

P0: truthful bilingual causal explanation, trace, fresh quiz, official Python,
source parity, boundaries, oracle/browser checks, metadata preflight.
Highest-return 20%: visible unknown/false/true P plus old/new prefix minima.
P1: full candidate ledger and related working anchors. P2: none.
Deferred: custom long input (snapshot cost), auto play (no need), runtime Python in
browser (unnecessary dependency), registry/concept-map edits and publication
(outside author ownership), independent acceptance (separate reviewer).
Applicable branches: initial/middle/final trace, disabled endpoints, each preset,
quiz unselected/selected/revealed/changed, copy success/denied fallback, storage
denied, source disclosure. Each has EN and zh. No fetch/loading/reconnect runtime.
Tests are author self-checks, not learner data or independent review.
