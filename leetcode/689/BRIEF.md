# #689 · Maximum Sum of 3 Non-Overlapping Subarrays

Author candidate, independent review pending. Reuse the approved lesson pattern and dispatcher adjudication in specs/reviews/leetcode-all-hard-design-review.md. Website-design skill read; no new layout or platform. Category computing; stage university. Reader knows loops, arrays and Python. Job: reconstruct a linear-time solution and its tie rules. Learning loop: calculate → hold the middle fixed → reuse best side windows → predict a fresh tie → map to Python.

## Verified official contract

Source: https://leetcode.com/problems/maximum-sum-of-3-non-overlapping-subarrays/ . Public GraphQL response, access timestamp, statement and complete observed selectors/templates saved in provenance/official.json. Python3 template is `Solution.maxSumOfThreeSubarrays(self, nums: list[int], k: int) -> list[int]`. Canonical language Python, preferred faithfully supported interface. Exactly three length-k contiguous intervals; return ascending zero-based starting indices maximizing their total. Equal sums require lexicographically smallest triple (compare first differing index). n ≤ 20000, positive nums[i] < 65536, 1 ≤ k ≤ floor(n/3), hence n ≥ 3 in valid inputs. Official examples: [1,2,1,2,6,7,5,1],2 → [0,3,5]; [1,2,1,2,1,2,1,2,1],2 → [0,2,4]. Empty input and insufficient space are outside contract. No mutation required; submission preserves input. HTML request returned 403, public GraphQL returned 200 without authentication; no paywall access used.

## Five fields per step

|Step|Known|Single question|Input → requested quantity|Action → visible observation|Conditions|
|---|---|---|---|---|---|
|0|Addition, positions|Which three windows win?|[2,1,4,1,3], k=1 → starts and sum|Hand reveal toggles explicit 2+4+3=9|Exactly three, non-overlap, zero-based, tie rule defined|
|1|A legal triple|What work can fixing the middle remove?|Same tiny array → best left and right choices|Read full three-row calculation, baseline source, greedy counterexample|All window lengths equal k; left/right feasible sets independent for fixed middle|
|2|Window sums|How can one best index summarize a whole side?|Presets → window sums, prefix best L, suffix best R, candidate ledger|Forward/back/end/reset and preset restart → retained summary rows then middle ledger|Post-operation snapshots; earliest equal maxima; all small frames retained|
|3|Best-side invariant restated|Which equal-sum right choice is legal and earliest?|Fresh [2,1,3,1,2,2,1,3], k=2, fixed middle j=2 → triple|Choose then reveal; change clears; reset independent|This asks fixed middle, not global optimum; locale preserves all state|
|4|Side maxima and middle scan|How does the proof become Python?|Canonical source → signature, arrays, conditions and costs|Open source, copy/fallback, download|Simulation is not execution; source exact offline mirror|

## Dependencies and terms at first use

0: subarray = consecutive positions; k = each window length; start = zero-based first position; non-overlap = no shared element; lexicographic = compare first differing start. 1: W[i] = sum of k values starting at i; middle j = second window start; baseline = enumerate all legal triples; greedy = choose largest individual window first. 2: m=n-k+1 window count; L[i] = earliest maximum start among 0..i; R[i] = earliest maximum start among i..m-1; invariant = fact preserved after each scan update; candidate = triple for one fixed j. 3 repeats W and fixed middle, suffix interval and lexicographic ties. 4 repeats summary arrays, sliding sum (remove outgoing value, add incoming), n and m. Locally define meanings again for jump readers.

## Causal bridge / proof

Same hand case W=[2,1,4,1,3]: j=1 → [0,1,2],7; j=2 → [0,2,4],9; j=3 → [2,3,4],8. Holding j fixes legal left starts ≤j-k and legal right starts ≥j+k. Any legal triple's side sums are bounded by these side maxima; choosing both maxima attains that bound and is legal. Scan all j=k..m-k-1. Reusing L/R avoids repeated side scans. L scans ascending with strict >; R scans descending with >=, both retaining earliest equal maxima. Compare whole candidate triples when totals tie, since earliest j alone is not the proof for first-index ties. Greedy counterexample official example: W[4]=13 forces [0,4,6],22, while [0,3,5] scores23.

## Exact tokens / lifecycle

Reuse ../style.css exact --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Same system font, body line-height1.75, title clamp(28px,5vw,46px), spacing8/12/16/20/24/64px, radius8/14px; no new colors, shadows or animation. Local controls48px, opaque disabled text, 3px orange focus offset4px, field border muted. Small window cards wrap, table has explicit focusable horizontal scrolling. No external assets. CSS budget shared+local <25000 bytes.

Snapshots after init, one L assignment, one R assignment, one middle comparison; no omitted steps. W visible from initialization, built via sliding sums explained next to it. Partial L/R entries marked pending, not zero. Candidate identity and value separate from best-so-far and final result. Trace tutorial stores snapshots and a ledger; submission uses O(n) cells. No autoplay. Preset change resets trace only, says so; question/hand/source remain independent. Language relabels existing state, preserves focus and disclosure. Branch matrix in both locales: init/L/R/middle/final/endpoints; hand hidden/revealed; prediction unselected/selected/revealed/change/reset; copy success/denial/manual fallback; blocked storage. Loading, reconnect, expiry inapplicable: all local static data, no async experiment.

## Priorities and scope

P0: hand calculation, fixed-middle causal proof, tie-sensitive reversible summary trace, fresh exercise, bilingual state, canonical source parity, independent oracle and real-browser checks. Highest-return20%: equal suffix maxima and fixed-middle ledger make both the optimization and tie rule visible. P1: related existing concept anchors and reproducible evidence. P2: none. Deferred arbitrary editor, autoplay, universal rendering, browser Python runtime and decoration: no learning need for added state. No registry/concept-map/shared edits; metadata proposes anchors for later authorized registration. No deployment, accepted submission, independent acceptance or actual novice claim.

## Author layout correction before freeze

First browser run found a long English H1 overflowing at 320px with CSS zoom 2 (document width366px). Retained zoom-before-fix.png. Apply existing overflow-wrap:anywhere to the header and allow window-card columns to fall to one when less than104px is available. Exact existing tokens unchanged. Full browser checks rerun on the corrected candidate; this is author self-check, not independent finding closure.
