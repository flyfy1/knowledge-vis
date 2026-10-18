# #126 Word Ladder II — author brief

Reuse verdict: build one problem-local lesson in the approved collection pattern. Audience: readers who know lists, sets, and loops; category computing/algorithms, stage university. Immediate job: reconstruct all shortest word transformations without dropping equal-length alternatives. Approved design: specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication; no new layout or framework. Independent lesson review remains pending.

Official contract verified 2026-10-18 from public GraphQL and official page; complete capture: provenance/official.json, including Python3 selector snippet `Solution.findLadders(self, beginWord: str, endWord: str, wordList: list[str]) -> list[list[str]]`. Python is preferred and supported. Words lowercase, equal width 1–5; 1–500 unique dictionary words; distinct endpoints; start need not be listed, end must be. Official examples: hit/cog yields two five-word paths, missing cog yields []. Official output bound wording: “sum of all shortest transformation sequences” ≤100000. No input mutation requirement; implementation preserves the list. Return order is immaterial; paths must all be shortest.

Learning loop: hand-count aa→bb, inspect BFS parent accumulation, predict a fresh convergence, map to executable Python. Output: complete word lists, not a length or one path.

| Step | Already known | Single question | Input → quantity | Action → visible observation | Conditions |
|---|---|---|---|---|---|
|0|Single-letter replacement|What counts as an answer?|aa,bb,[ab,ba,bb] → both shortest paths|Read the two explicit paths and reject direct aa→bb|Only listed words after start; exactly one changed letter|
|1|Worked paths|What can we safely share?|Same words → distances and parent sets|Compare both routes into bb and the one-parent failure|Unweighted edges; all shortest answers required|
|2|Distance and parent rule|When must another parent be retained?|Preset graph → queue snapshots|Expand word, rewind, finish; retained layer cards and parent ledger show bb gains ba after ab|Simulation of canonical mechanism, no source execution; snapshots complete, no omitted events|
|3|Equal-distance parent invariant|Can you transfer the rule?|red→tax dictionary → parent choice|Predict, reveal, change choice; explanation reveals both parents|Independent exercise; locale preserves selection/reveal|
|4|Layered shortest graph|Why does reconstruction give exactly the answers?|Parent graph → Python output|Inspect/copy/download exact canonical source|Costs include string creation and output; boundaries stated|

First-use dependencies (also redefined locally): transformation = one changed letter (0); edge = legal one-letter pair (1); BFS = expand in increasing number of changes (1); distance = minimum changes from start (1,2); parent = preceding word on a shortest route (1,2); queue = first-in-first-out pending expansions (2); invariant = maintained fact (1); backtracking = follow parent choices toward start then reverse (4). DAG explained without requiring acronym: each backward step reduces distance, so no cycles.

Simulation: small exact word graphs; each frame is after expanding one whole queue word, terminal frame performs reconstruction; initial absence of end terminates immediately. Parent and distance data persist visibly. Snapshots consume more memory than submission. No timers or execution service. Preset changes reset trace only. Correct/incorrect/hidden/reselected prediction and copy success/manual fallback are localized. No loading/reconnect states because all assets are local.

Tokens: exact shared leetcode/style.css palette --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454; system font stack and existing typography/radius/layout. Local controls minimum 48px, disabled text opaque muted, focus 3px accent2 + 4px offset. No additional colors or motion.

P0: complete bilingual causal lesson, reversible snapshots, canonical source, meaningful oracle/browser checks, measured contrast. Highest-return slice: visible multiple parents and same-layer stop. P1: retained expansion history and clear queue readout. P2: none. Deferred: automatic animation, arbitrary input editor, graph framework (no concrete need); deployment/registry changes (outside author scope), learner efficacy claims (no observed learners). Related existing anchors are verified; shared concept-map edit deferred to dispatcher due to ownership boundary.

Validation: exhaustive small dictionaries, seeded oracle comparisons, intermediate distances/parents, official/boundary/max-size cases; real browser both locales/all controls/presets/source parity/copy denial/storage denial/320–1440/zoom. Evidence is author self-check only, not independent acceptance or LeetCode submission.
