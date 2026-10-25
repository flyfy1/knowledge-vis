# #493 Reverse Pairs — author brief

Product: reuse the approved single-lesson pattern under LeetCode; category computing, stage university. Audience: readers who know arrays and loops. Smallest outcome: reconstruct why counting qualifying sorted prefixes during merge sort counts each original pair exactly once. Design authority: specs/reviews/leetcode-all-hard-design-review.md dispatcher adjudication; no new product/layout review is claimed.

Official verification: provenance/official-graphql.json and README.md, accessed 2026-10-25. Public statement: count original i<j with nums[i]>2*nums[j]. n=1..50000, signed 32-bit values, examples [1,3,2,3,1]→2 and [2,4,3,5,1]→3. Python3 selector supplies Solution.reversePairs(nums: list[int])->int. No empty official input; empty extension is tested defensively. No mutation requirement; solution copies input.

Learning loop: enumerate → change threshold observation → count sorted prefixes → rewind recursive trace → predict a fresh cross count → read exact canonical code.

| Step | Already known | Single question | Input → quantity | Action → observation | Conditions |
|---|---|---|---|---|---|
|0|indices and multiplication|What is one pair?|[4,2,1] → count|next/back reveals all three comparisons, equality excluded|original i<j, strict >|
|1|pair definition|Why can one boundary count many pairs?|L=[3,5,8], R=[1,2,4] → cross count|select left value → prefix labels and boundary q change|both halves sorted; original left indices precede all right indices|
|2|prefix threshold|How does recursion preserve original order?|bounded presets → complete recursive count|next/back/reset/end → cumulative ledger and sorted merges|complete snapshots; no skipped operations; simulation, not Python execution|
|3|monotone boundary|Can the boundary move backwards?|fresh L=[-3,0,4], R=[-2,0,2] → cross count|select/reveal/change → invalidate feedback|strict comparison, duplicates/negative values valid|
|4|count/sort contract|How do frames map to submission?|canonical Python → integer|view/copy/download identical bytes|O(n log n) time, O(n) auxiliary space, bounded tutorial snapshots excluded|

First-use dependencies: step0 index=zero-based position; reverse pair=two ordered positions satisfying strict doubled test. Step1 prefix=first q right positions; boundary q=first failure or length, monotone=never moves left. Step2 recursion=solve smaller original contiguous blocks, merge=combine sorted halves in value order; invariant=statement maintained by every completed call. Each step locally restates needed definitions.

Trace instant: start; after testing one left value (q fully advanced and count added); after completed merge; terminal. All count events retained cumulatively, original half-open block boundaries shown. Cells carry sorted local offsets, not original indices. No automatic playback. Presets reset trace only; prediction is independent. Locale preserves all state and disclosures. No runtime fetch; empty/loading/reconnect inapplicable. Clipboard denial exposes selected exact source; storage denial falls back through common.js.

Tokens: exact shared --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Shared system font stack and sizing/radii retained; local controls 48px, disabled opacity 1, muted ink; field border muted, focus accent2 3px/4px. Local spacing uses shared 8/12/16/20/24px values; no decorative motion/shadows. CSS budget includes shared stylesheet.

P0: faithful contract, causal proof, complete reversible trace, bilingual states, source parity, numerical/browser self-checks. Highest-return slice: prefix visible alongside inequality and cumulative ledger. P1: related deep links. P2: no decoration needed. Deferred: arbitrary inputs (bounded complete presets avoid long UI computation), Python browser runtime (offline canonical tests suffice), automatic motion (no demonstrated need), mastery claims and release (separate reviewer/dispatcher responsibility).

Author self-check only; independent teaching review remains pending. No learner outcomes, LeetCode acceptance, deployment or independent approval claimed.
