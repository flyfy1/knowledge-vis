# #732 · My Calendar III — author brief

Product: reuse the approved LeetCode lesson pattern (specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication). Category computing / algorithms; stage university. Reader knows loops and dictionaries. Job: implement a persistent calendar returning maximum simultaneous events. Smallest loop: calculate overlap → record endpoint changes → scan → predict a fresh case → map to Python. Design gate is inherited, independent lesson review pending.

Official verification: 2026-10-25, https://leetcode.com/problems/my-calendar-iii/ and public GraphQL; full observed content and language snippets in provenance/official.json. Free Hard. Python3 explicitly supports MyCalendarThree.__init__ and book(self,startTime:int,endTime:int)->int. All bookings accepted; half-open real-time intervals, integer endpoints 0 <= startTime < endTime <= 10^9; at most 400 calls. Official example returns 1,1,2,3,3,3. Python selected by preference. No submission/acceptance claimed.

## Steps: five fields each

| Step | Already known | Single question | Input → quantity | Action → observation | Conditions |
|---|---|---|---|---|---|
|0|Intervals with left included/right excluded|How many events share one instant?|[2,5),[4,7),[5,6) → count at 4,5,6|Select time → membership equation and bars retained|Integer endpoints, real continuous intervals|
|1|Hand counts change only at endpoints|What state avoids scanning a billion units?|Same bookings → delta and running active count|Read hand ledger and baseline → derive active=prefix sum|Group every change at the same coordinate before measuring|
|2|Delta and prefix invariant|How does one booking change all future return values?|Five bounded presets → update/scan snapshots and history|Advance, back, reset/end, change preset explicitly restarts → current scan ledger and accumulated bookings|Simulation only; complete trace, no omitted events|
|3|Grouped endpoint prefix sum|Can a shared endpoint falsely create triple overlap?|Fresh [1,4),[4,8), then [2,6) → new return|Choose before reveal; change clears feedback; locale preserves|Independent from trace experiment|
|4|Mechanism understood|How does the official class maintain this state?|Persistent delta dict → book output|Open/copy/download exact Python; map update/sort/scan; inspect boundaries|400 calls, O(b log b) per call, O(b) space|

## First-use terms / dependencies

Half-open interval (step0): includes start, excludes end. k-booking (step0): k events sharing one time, not number of pairwise collisions. Delta (step1, repeated step2): net count change at a coordinate. Prefix sum (step1, repeated step2/3): running total of changes through current time. Sweep (step1): visit coordinates in increasing order. Invariant (step1): statement preserved after every processed coordinate. b (step4): number of calls so far, u: distinct endpoints <=2b.

## Visual and state contract

Bars are horizontal time intervals with filled left/open right endpoint, one row per booking. Numeric textual interval list is the accessible equivalent. Endpoint table shows time, net delta, active after this coordinate, maximum so far, and scanned/pending status. Initial empty frame; each booking has an endpoint-update frame followed by one scan frame per distinct endpoint. Final scan commits return and history. All values refer to after the displayed operation. Maximum during scan is provisional until all coordinates processed. History and prior intervals remain visible. Rewind deterministic deep snapshots. No automatic motion. Static locale text and dynamic feedback use paired dictionary. Locale preserves input, frame, prediction, disclosure and focus. Clipboard sending/success/manual fallback states; storage denial falls back through common.js. No runtime network/loading/reconnect state applies.

Baseline uses small integer unit cells: each real interval's coverage is constant on [x,x+1). O(U) per booking and O(U) space over fixed domain width U, unsuitable for U=10^9. Endpoint sweep costs are honestly O(b log b) per call, O(B² log B) total across B calls; no claim of optimality or mandatory segment tree. Tutorial retained snapshots have O(B³) worst-case storage, bounded to six bookings here; distinct from O(b) submission space.

## Exact design tokens

Use shared ../style.css unchanged: --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Font PingFang SC, Microsoft YaHei, system-ui, sans-serif; body 1rem /1.75. Shared 1000/952px layout, 24/16px gutters, 14px stage radius, 8px controls, spacing 8/12/16/20/24/64px. Local controls >=48px, disabled opacity 1 with muted text, 3px accent2 focus +4px offset. No shadows, new colors, ambient motion or assets. Shared CSS plus local CSS <25000 bytes.

P0: causal derivation, truthful reversible trace, bilingual feedback, Python parity and browser/oracle checks. Highest-return 20%: grouped ties and active prefix ledger. P1: fresh retrieval exercise and related step links. P2: none. Deferred: large-input animation and segment-tree lesson (not needed for 400 calls); accounts/learner mastery claims (no evidence). No shared files or registry edited; dispatcher handles concept-map registration. Separate independent review and production/real-device/novice checks remain outside author scope.
