# #460 LFU Cache — author candidate

Product-fit verdict: reuse the approved bilingual LeetCode lesson surface. Audience: a reader who knows Python dictionaries and wants to reconstruct constant-average-time LFU operations. Category: leetcode; stage: university. Reuse adjudication: specs/reviews/leetcode-all-hard-design-review.md. This author run supplies no independent acceptance.

Highest-return slice: show why the eviction choice needs both count and recency, then derive local frequency moves. P0: five causal sections, reversible paired snapshots and history, fresh retrieval question, exact Python source, both locales, browser/oracle evidence. P1: four focused presets and source fallback. P2: none. Deferred: custom input editor and automatic animation, since short controlled sequences expose all rules without new state machinery.

Official contract verified 2026-10-25 using public GraphQL and official page https://leetcode.com/problems/lfu-cache/. Full capture: provenance/official-graphql.json. Python3 selector snippet explicitly exposes LFUCache.__init__(capacity: int), get(key: int)->int, put(key: int,value:int)->None. Select Python. New insert starts at 1; successful get and existing-key put increment; misses do nothing; eviction minimizes frequency then recency. capacity 1..10000; key 0..100000; value 0..1000000000; at most 200000 calls. Zero capacity is a defensive extension, not an official constraint. Official example output: [null,null,null,1,null,-1,3,null,-1,3,4].

Learning loop: hand-compute two keys → scan baseline → derive ordered frequency buckets → step/reverse local moves → predict a new eviction → map to executed Python.

| Step | Already known | Single question | Input → sought value | Action → visible observation | Conditions |
|---|---|---|---|---|---|
|0|key maps to value|Which key leaves a two-slot cache?|put(1,10),put(2,20),get(1),put(3,30) → victim|reveal hand calculation → 2 has smaller count|successful uses count; resident lifetime only|
|1|counts and recency|Why isn't one global recency queue enough?|same operations plus wrong-rule case → correct comparison|read executable scan baseline and compare count/last-use pair|hash lookup average O(1); full scan O(C)|
|2|minimum pair chooses victim|How can one operation avoid scanning?|four preset streams → before/after buckets and min_freq|next/back/reset/end and preset restart → counts, oldest-first order and retained ledger|only f→f+1 moves, no arbitrary count decreases|
|3|ordered buckets and min pointer|Which key loses after an update?|fresh three-slot stream → predicted victim|choose then reveal; change clears feedback|put of existing key counts as use; tie oldest|
|4|local updates invariant|How does the diagram become Python?|source → _touch/get/put and costs|copy/download exact code; inspect mapping|Python OrderedDict pop/append average O(1)|

Terms defined locally: step0 cache (bounded key/value store), capacity (maximum live keys), frequency (successful resident uses), recency (last successful use). Step1 baseline (simple correct scan), lexicographic pair (count first, timestamp second). Step2 bucket (keys with one frequency, oldest to newest), min_freq (smallest live frequency), invariant (facts preserved after every operation). Step3 repeats frequency, oldest and update semantics. Step4 defines OrderedDict (dictionary with removable oldest entry). Every step repeats terms it uses when needed.

Token contract: exact shared --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Shared system font, 1.75 body line-height, shared heading clamp; local spacing 8/12/16/20/24 px; radius 8/14 px; 48px controls; focus 3px accent2 offset4. No motion or new colors. Source uses shared pre styling. Paired states collapse at 700px. CSS budget includes shared+local.

State matrix: empty/initial, intermediate, ended, all four presets, selected/unrevealed/revealed/changed answer, clipboard success/manual fallback, both locales. Locale preserves all state. No network operation or asynchronous algorithm runner: loading/reconnect/expiry are inapplicable. Render replaces diagram/history only, retains native input nodes/focus. No timer.

Simulation boundary: JavaScript trace models completed operations and retains full snapshots; it does not execute Python. Bucket sorting and snapshot/history storage are teaching overhead, excluded from Python complexity. Canonical Python is separately executed against a timestamp-scan oracle, with intermediate state invariants. Boundary tests: misses, updates, ties, reinsertion, single/zero capacity, maximum fields and 200000 operations. Evidence/test outputs accept OUTPUT_DIR; independent review and real learner results remain pending.
