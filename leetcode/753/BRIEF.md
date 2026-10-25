# #753 Cracking the Safe — author brief

Reuse verdict: extend the existing bilingual LeetCode lesson, category `leetcode`, stage `university`. Audience: readers who know Python loops, lists and strings. Job: construct a shortest string containing every possible length-n password. Smallest useful outcome: explain overlap, predict an unused edge, reconstruct iterative Hierholzer, and run the official Python interface.

Approved product/design contract: `specs/reviews/leetcode-all-hard-design-review.md` and its dispatcher adjudication; reuse the shared five-section shell, locale, tokens, controls, local trace. No new layout/service. This is an author candidate, independent review pending.

## Official verification
2026-10-25: official page read through web; direct HTTP page returned 403, public GraphQL returned 200. Full response/query/time in `provenance/official.json`. Frontend ID 753 (internal questionId 754). Public, Hard. Inputs 1<=n<=4, 1<=k<=10, k^n<=4096. Digits 0..k-1, including leading zero; safe tests most recent n entered digits. Return ANY shortest universal string, not a fixed lexical answer. Examples (1,2):10; (2,2):01100. Official Python3 selector snippet: `class Solution: def crackSafe(self, n: int, k: int) -> str`. No empty inputs or unique-answer requirement. Python preferred and faithfully supported.

## Learning loop and sections (five required fields)
|Step|Already known|One question|Input → desired quantity|Action → visible observation|Conditions|
|---|---|---|---|---|---|
|0|Safe reads last n digits|How can five digits test four passwords?|n=2,k=2,00110 → windows|Move window forward/back; retained ledger grows/shrinks: 00,01,11,10|Window length n, alphabet k|
|1|Overlap saves digits|How can we guarantee no password is missed?|Same four passwords → edge graph and lower bound|Read explicit edge table and failed vertex rule|Complete alphabet graph; cycles and repeated vertices allowed|
|2|Edges encode passwords|When do we append to the final answer?|Five small presets → complete push/pop snapshots|Next/back/reset/end; used edge table, stack, reverse-finish ledger, final string|Simulation separate from Python; no operations omitted; presets reset trace only|
|3|Edge-use invariant|Can a visited suffix still have work?|Fresh n=3,k=2, suffix01,010 used,011 unused → legal next edge|Select then reveal; change clears feedback; locale preserves it|Only local next-edge decision, not a complete execution history|
|4|Overlap graph and finishing|How does this become a robust submission?|Official n,k → Python str|Open/copy/download exact source, fallback selection|Valid official domain; any shortest answer accepted|

## Concept dependency / first-use terms
Step0: window = most recent n digits; alphabet = allowed digits; length = typed characters. Step1: vertex = suffix of n-1 digits; directed edge = append one digit, shifting suffix; Euler circuit = closed walk using every edge once; de Bruijn string = shortest linear string containing all n-digit words. Step2 repeats vertex/edge, defines stack (unfinished exploration, rightmost top), next_digit (next unused digit per vertex), finished (incoming edge digits in pop order). Step3 repeats used edge versus revisited suffix. Step4 defines E=k^n, V=k^(n-1), integer base-k encoding and modulo.

Causal bridge: hand windows → concatenate-all baseline n*k^n digits → lower bound k^n+n-1 → length-(n-1) overlap state → edge, not vertex uniqueness → balanced connected graph → Euler construction → defer emission until no departure → reverse popped labels and prefix initial zeros. Concrete push/pop at suffix 0 includes revisit and sibling. No recursive call-stack dependency.

Baseline: concatenation is a correct coverage construction, not generally shortest. Independent BFS over suffix and covered-word bitmask finds actual shortest strings for tiny n,k. Additional independent product enumeration validates all legal pairs and random ones. Tests inspect intermediate snapshots and cursor/stack/finish conservation.

## Exact design token contract
Reuse all `../style.css` tokens: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. Existing step backdrop #0a0e14. Existing system font stack, title clamp(28px,5vw,46px), section max 952px, stage radius14px, control radius8px. Local controls min48px, border muted for control discoverability, disabled opacity1 with muted text, 3px accent2 focus offset4px. Spacing 8/12/16/20/24px. No custom palette, shadow or ambient animation.

## State and scope
All static, dynamic, accessibility and fallback text bilingual. Locale preserves window, preset, snapshot, radio, reveal and copy status. Initial/active/end, empty stack/finished, unselected/selected/revealed/changed/reset, copy pending/success/manual fallback checked in both languages. Loading/network/reconnect/server failure are inapplicable: static offline runtime. All source assets local. No code execution advertised by the trace. Full snapshots incur tutorial-only quadratic storage in E for fixed tiny presets; submission O(E+n) time and O(E+n) space including output, without recursion or input mutation.

Highest-return 20%: explicit four windows, edge-use table, deferred finishing, fresh wrong-rule exercise. P0: correct official source, causal bilingual flow, full reversible trace, parity, accessibility, reproducible self-checks. P1: retained history, exact local concept links, and a #332 step2 link contrasting the same finishing mechanism on ticket edges. P2: none. Deferred: large-input animation (snapshot cost/readability), arbitrary graph editor and animation framework (no teaching need), production/registration (dispatcher-owned), independent acceptance (separate run).
