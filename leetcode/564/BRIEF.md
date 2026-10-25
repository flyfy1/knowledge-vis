# #564 author brief

Reuse verdict: build one lesson within the approved collection, reusing the exact shared tokens and five-step shell. Product/design review and dispatcher adjudication: specs/reviews/leetcode-all-hard-design-review.md. No new layout or shared framework. Audience: university-stage computing reader who knows decimal notation, strings and loops. Smallest outcome: reconstruct why five candidate families suffice, then implement the official Python method. Validation occasion: a fresh boundary/tie prediction and source mapping.

Official contract verified via public GraphQL on 2026-10-25; full statement and all observed code snippets are in tests/evidence/official.json. Python3 exposes Solution.nearestPalindromic(self, n: str) -> str. n is a positive decimal string, no leading zero, 1–18 digits, at most 10^18−1. Exclude itself; absolute difference; smaller wins ties. Official examples 123→121 and 1→0. No paywall or special runtime types.

## Learning loop and step contract
|Step|Already known|Single question|Input → requested quantity|Action → observation|Scope|
|---|---|---|---|---|---|
|0|decimal subtraction|What does closest mean?|123 → other palindrome|hand compare 121/131, 1→0 tie|positive official input, output may be zero|
|1|distance, palindrome|Why does copying the left half fail?|123 and 129 → nearest|read 129→121 distance 8 vs 131 distance 2|baseline outward scan correct, too slow at 18 digits|
|2|left half determines palindrome|Which candidates are sufficient?|preset → candidate distances and running best|next/back/reset/end/range; retain tested cards, see exclusion/ties|fixed-width prefix monotonicity plus shorter/longer boundaries|
|3|candidate completeness|Can you transfer the boundary rule?|1000 → closest other palindrome|choose then reveal; change clears feedback; language preserves state|independent from trace, answer not pre-revealed|
|4|candidate scan invariant|How does this become executable Python?|official string → result string|open/copy/download exact source|Python execution tested separately from browser simulation|

Terms at first use: palindrome (step0, same digits read in reverse); distance (step0, absolute numeric difference); prefix and mirror (step1, first ceil(d/2) digits and reflection excluding odd center); candidate (step2, possible answer); invariant (step2, best tested eligible value by distance then value). Symbols d,p,q defined locally in step2; Python h is prefix width. Related links use existing #step anchors.

Trace instant: after testing exactly k rows, k=0 means none tested. Cards preserve history, explicitly label pending/tested/excluded and best-so-far; final answer label only at endpoint. Input presets restart only the trace. UI uses BigInt for all numeric candidates, never floating point. Candidate prefixes that change width or begin with zero for multi-digit inputs are skipped; two boundary candidates cover these gaps. Single-digit zero is valid. No generated diagram claims Python execution.

Exact tokens inherited: --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Body system font, line-height 1.75; shared heading scale and section gutters. Local card radius 8px, gap 16px, padding 16px; 48px controls; focus 3px --accent2 with 4px offset; disabled opacity 1 with dashed border. No shadows or motion. Layout 3 columns → 1 at 800px, minmax(0,1fr); all digits wrap. Total shared+local CSS below 25KB.

State × locale contract: initial/intermediate/terminal, every preset, every prediction choice unrevealed/revealed/changed, copy success/fallback, blocked storage/offline all bilingual. Locale keeps trace, choice, reveal, disclosure, focus and copy state. Loading/reconnect/expiry inapplicable to static local assets. No automatic effects or timers.

P0/highest return: concrete 129 counterexample, completeness argument, reversible candidate ledger, exact official code, both locales and accessible boundary states with actual checks. P1: range seeking and related deep links. P2: none. Deferred: arbitrary-input editor and animation (presets suffice for bounded observation); online execution and accounts (no product need); learner outcome claims and publication (require separate evidence/authorization).

Verification: independently enumerate palindromes for small cases and binary-search a separately generated complete sorted palindrome set for seeded large cases; verify running-best snapshots, source parity, real browser layout and contrast. Author self-check only; independent review pending. Real devices and actual LeetCode submission not tested.
