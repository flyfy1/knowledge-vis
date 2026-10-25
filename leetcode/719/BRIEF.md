# #719 · Find K-th Smallest Pair Distance

Author candidate; independent review pending. Category computing / algorithms; stage university.
Reuse approved lesson pattern, per specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication. Apply WORKFLOW, UI-I18N-SPEC, explainer, trace, rendered-state and review-gate documents and website-design skill. Reader knows arrays and Python loops; immediate job: reconstruct counting and binary search from pair distances. No new layout/platform or shared edits.

P0 / highest-return slice: concrete pairs → contiguous eligible left endpoints → threshold count → safe interval update; bilingual reversible experiments, fresh prediction, exact Python source and reproducible checks. P1: boundary presets and related deep links. P2: none. Deferred: arbitrary huge visual arrays (readability), animation (unnecessary), browser Python (simulation labeled), registration/release and independent review (outside author run).

## Official contract
Observed 2026-10-25, https://leetcode.com/problems/find-k-th-smallest-pair-distance/ and public GraphQL. Captures in provenance/. Return kth absolute difference across all index pairs i<j, including duplicate distances. n=2…10000, values=0…1000000, k=1…n(n−1)/2. Official examples [1,3,1],1→0; [1,1,1],2→0; [1,6,1],3→5. Python3 selector provides class Solution.smallestDistancePair(self, nums: list[int], k: int) -> int. Python is faithful and preferred. No empty input, invalid-k behavior or required mutation. Use sorted copy to preserve caller input.

## Exact tokens
Unchanged shared style.css/common.js. --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Local rules only reuse variables; inherited system font, 1.75 line height, 952px content, 24/16px gutters, 14px stage and 8px control radius. Min controls 48px; disabled opacity 1 with muted text and dashed border; focus 3px accent2 +4px offset. Static render with no automatic motion.

## Five fields per step
|Step|Already known|One question|Input → output|Action → observation|Conditions|
|---|---|---|---|---|---|
|0|absolute differences|Which distance occupies rank k?|[1,3,1],k=2→2|Inspect all three position pairs and sorted distances|duplicates retain separate ranks|
|1|sorted order|How do we count distances ≤d?|[1,1,3,6],d=2→3 pairs|Change d, see eligible pairs and each right-endpoint contribution; scan slider exposes completed right endpoints|sorted values; smallest valid left pointer; each pair counted once|
|2|count C(d)|Which thresholds can be removed?|preset array,k→answer interval|Next/back/reset/end/scrub; persistent ledger compares old/test/new bounds|C(lo−1)<k≤C(hi), C(−1)=0|
|3|bound invariant restated|What if count equals k?|fresh [0,2,2,7],k=3,mid=3|Predict then reveal; change selection hides feedback; locale preserves state|first sufficient threshold, not equality|
|4|both invariants|Why does the code return kth distance?|official Python signature→integer|View/copy/download exact canonical source; map count and search loops|valid official inputs; integer arithmetic|

## First-use terms, also local per section
Step0: pair means two different positions; distance absolute difference; rank counts repeated distances. Step1: a sorted copy a; threshold d is tested maximum distance; right r and left l are zero-based sorted positions; C(d) counts all pairs ≤d. Step2: lo/hi inclusive candidate bounds, mid floored average; invariant means fact preserved after every update. Step4: auxiliary space is working storage beyond input/output.

## Causality and state
All hand pairs shown. Adjacent-only wrong for [1,2,4], k=3: misses distance 3. Equality wrong for [1,1,3],k=2: counts jump 1→3. For counting [1,1,3,6] at d=2, r=2 accepts l=0 and adds 2; r=3 rejects 0,1,2 then l=3 and adds 0. Sortedness makes all l…r−1 valid and all earlier invalid; advancing r cannot move l left. Pair's unique right endpoint prevents double count. Raising d cannot lose pairs. Thus first C≥k lies in [0,max−min]; preserve insufficient lower exterior and sufficient upper bound, strictly shrink, equal bounds terminate.

Count experiment and search presets are independent. Count slider selects threshold and scan progress chooses last completed r; ledger retains earlier contributions. Search frame is initial or one completed full count and bound update, retaining last tested d separately from updated bounds. No rounds omitted. Presets restart search only; quiz independent. Source is Python; browser is a JS simulation. Tutorial history storage is outside submission complexity.

## Verification and state matrix
Both locales: initial/middle/final/back/replay/reset/preset/scrub; all-equal terminal, two-element boundary, duplicates and max distance; quiz unselected/selected/revealed/changed; copy success/manual fallback; source/download; storage failure; keyboard/focus; 320/390/736/1440 and 200% zoom. No loading/reconnect/async computation states apply. Oracle enumerates all i<j distances independently; exhaustive and seeded tests execute canonical Python, verify intermediate count and search invariants. Browser tests accept OUTPUT_DIR. Screenshots require visual inspection and contrast is measured. No actual learner outcomes, official submission acceptance, production or physical-device validation claimed.
