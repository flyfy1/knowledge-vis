# #483 Smallest Good Base — author candidate

Reuse verdict: one lesson within the approved collection pattern; design authority is specs/reviews/leetcode-all-hard-design-review.md and its dispatcher adjudication. No new layout/platform. Website-design skill applied. Category computing; stage university. Reader knows positional notation and loops, but not this search. Outcome: derive, prove and implement exact integer search from a hand calculation.

Official contract: verified 2026-10-25 via public official GraphQL; full response and code selectors in tests/evidence/official.json. Input decimal string, 3 ≤ n ≤ 10^18, no leading zeros; output smallest base ≥2 as a string. Examples 13→3, 4681→8, 10^18→999999999999999999. Python3 selector explicitly offers Solution.smallestGoodBase(self, n: str) -> str. Python is canonical. No special interface exceptions.

Learning loop: compute 13 as 1+3+9; notice 31 has both 11111 base 2 and 111 base 5; replace scanning bases with descending digit counts and exact binary search; predict a new discard; map to Python.

## Steps (five fields each)
|Step|Already known|Single question|Input → wanted|Action → observation|Conditions|
|---|---|---|---|---|---|
|0|Place value|What does a good base mean?|13 → minimum base|Read explicit base 2,3,12 decompositions|k≥2, all digits 1|
|1|Repeated division|Why change search order?|31 → candidate lengths|Compare 2 and 5, inspect baseline|Positive powers; fixed n|
|2|Increasing sums|Which candidates can be discarded?|n,m,lo,hi → surviving bases|Read 13 transitions and proof|m≥2, integer k≥2|
|3|Search invariant|What does each exact comparison remove?|Preset → reversible search trace|Next/back/reset/end/slider; retained trial ledger and before/after bounds|Simulation uses BigInt, not Python execution|
|4|Interval invariant|Where does a fresh search go?|40,m=3,[2,8],k=5 → next interval|Choose, reveal, change; explain all choices|S(5)=156; monotonicity|
|5|Proof and trace|How is it submitted and what does it cost?|Verified signature → executable Python|Inspect/copy/download exact source|L=bit length; arithmetic-operation cost separate from bit cost|

## First-use dependencies (repeated locally for jumps)
Base k = place-value multiplier (step0); good base = all digits one (0); m = highest exponent, so m+1 digits (1,2,3); S_m(k) = sum 1 through k^m (2,3); monotone = increasing k increases sum (2); invariant = every untested solution is inside current inclusive bounds (2,3); L = N.bit_length (5). Binary search linked to #410 step2, positional counting to #233 step0 (verify anchors).

## Tokens and UI contract
Exact inherited variables from ../style.css: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. Existing system font, body line-height 1.75; controls/card radii 8/14px; content 952px; spacing 8/12/16/20/24/64px. Local overrides only for ≥48px controls, readable disabled state, wrapping and focus. No motion or added palette.

P0/highest-return slice: hand arithmetic, proof, exact reversible ledger, fresh quiz, canonical source, bilingual state and accessibility. P1: official upper-bound preset and downloadable source. P2: none. Deferred: free input/editor and autoplay (unnecessary state/error surface); no service or generic visualization framework.

State matrix: initial/search/equal/exhausted/fallback terminal × both locales; prev/next endpoint disabled; quiz unselected/selected/revealed/changed; clipboard success/manual fallback; storage unavailable. Locale preserves all state. Preset resets only trace, explicitly labeled. No network loading, accounts, reconnect, or async computation states apply. No actual learner result, independent review, submission acceptance or production verification is claimed.

Simulation stores all trial snapshots and cumulative history; submission keeps scalar integers only. Both use exact integers, but browser simulation does not execute solution.py. Source remains available offline. Tests must independently execute Python and compare browser arithmetic with repeated-division oracle. Freeze candidate via hashes after checks, independent review pending.
