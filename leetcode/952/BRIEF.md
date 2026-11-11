# #952 author brief — candidate 1

Author: Codex, exact model identifier unavailable. Author self-check only; independent review pending. No acceptance, submission or publication claimed. Scope: leetcode/952 only.

Product: reuse the approved LeetCode lesson pattern, as adjudicated in specs/reviews/leetcode-all-hard-design-review.md. Website-design skill applied. Category leetcode / computing; stage university. Reader knows Python loops, dictionaries and elementary divisibility. Smallest outcome: reconstruct why prime-factor representatives preserve graph connectivity, then implement union-find over input indices.

Official source: https://leetcode.com/problems/largest-component-size-by-common-factor/ ; public GraphQL captured with timestamp in provenance/official.json on 2026-10-26. Free, unique positive nums, n=1..20000, values=1..100000. Examples yield 4, 2, 8. Python3 selector supplies Solution.largestComponentSize(self, nums: list[int]) -> int. Python preferred and used; no mutation requirement, input left unchanged. No extra exceptions or empty-array contract.

Learning loop: hand-compute chain → compare all pairs → discover prime representatives → reversible union ledger → predict fresh bridging case → map to Python. Five sections reflect these dependencies.

| Step | Already known | Single question | Input / desired quantity | Action / visible observation | Conditions |
|---|---|---|---|---|---|
|0|Divisibility|Can endpoints connect without sharing a factor?|[4,6,15,35] / component size|Read edge list and chain, calculate four nodes|Edges require gcd>1; paths may use several edges|
|1|Edges and paths|What does a direct baseline repeat?|same array / all components|Inspect pair table and baseline code, compare six gcd calls|Unique positive values; quadratic pair enumeration|
|2|Prime decomposition|How can one remembered index replace many pairs?|preset array / component partition|Next association retains groups, prime owners and full applied history; back/reset/end restore snapshots|Every distinct prime processed once per input; 1 has none|
|3|Connectivity invariant|Will a new number bridge existing groups?|[14,25,35,11] / largest size|Choose before reveal; change choice clears feedback|Independent exercise; language preserves choice/reveal|
|4|Union rules|How does the code realize each transition?|nums / integer largest size|Source, copy with manual fallback, download|Official Python3 interface; simulation is not Python execution|

Terms at first use, redefined locally where needed: factor/gcd, undirected edge/path/component (0); visited traversal and baseline (1); prime, distinct prime factor, owner index, union-find, root, path halving, size (2 and 4). Indices zero-based; visual group labels show input values, not new factor nodes. Numeric cost variables n and M defined in step4. No factor nodes are counted.

Invariant derived: initially singleton input nodes; a prime's first index represents all processed occurrences. Adding a later occurrence connects it to that representative. Every added link is a genuine edge; all original edges share at least one prime and therefore have an owner path once processed. Redundant unions do not add size. Exclusion: 1 stays singleton. Counterexamples: global gcd [6,10,15]=1 yet component=3; one-prime-only misses 6→15 via 3; largest prime bucket misses chain of four.

Simulation: local JS emits one frame after a distinct (input index, prime) association; includes all associations, omits internal trial divisions and parent compression. Initial frame already contains all input singleton nodes. Counts are current known connectivity, final only at endpoint. Stores snapshots/history for pedagogy, unlike submission space. No auto-play, timers, external assets or API execution.

Exact shared tokens: --bg #0d1117; --panel #161b22; --panel2 #1c2330; --line #2b3547; --text #e8edf4; --muted #9aa7b8; --accent #6ee7ff; --accent2 #ffb454; --good #7ee2a8; --bad #ff7a93. Reuse system font stack, shared spacing, 8/14px radii, no shadows or ambient motion. Local overrides provide 48px controls, opaque readable disabled states, 3px focus. Groups wrap rather than shrink. Tables deliberately scroll with keyboard access.

P0 / highest-return slice: truthful prime-owner transitions and cumulative groups, bilingual explanation, source parity and tested accessible controls. P1: related deep links and multiple boundary presets. P2: none. Deferred: custom input and animation (not needed for bounded reversible experiment); shared registry/concept-map updates (outside author ownership). Parent collection remains unchanged.

State matrix: initial/middle/final/rewind/preset-reset; unchosen/selected/revealed/changed prediction; successful/manual copy; source open/closed; storage blocked; all in zh/en. Loading, reconnect and auth do not apply to static local computation. Preset restarts only the trace, not the exercise. Locale preserves trace, focus and exercise.

Verification plan: independent gcd-graph oracle, exhaustive subsets, seeded random arrays, official examples, maximum n/M, factor and connectivity invariants per event, no mutation, exact source mirror/display/copy/download; real Chromium both locales, all presets/endpoints, native clipboard fallback with per-attempt sentinel, 320/390/736/1440 and 200% zoom, focus/keyboard, local requests, measured contrast, screenshots visually inspected. Output-directory override required. Freeze hashes after checks; safe validate-only preflight. Independent reviewer remains required.

## Final author status — candidate 4

Implementation and author checks complete; independent review pending. See SELF-CHECK.md and tests/evidence/candidate-manifest.json for exact scope and candidate identity. Python 17,196 cases passed; JS 4,183 inputs / 36,858 intermediate frames passed; final Chromium suite passed both languages, all seven presets, fourteen viewport/zoom combinations and actual source transfers. Candidate 4 contains local wrapping/select-width repairs from author checks. Safe non-mutating preflight `python3 -B scripts/register_leetcode_lesson.py 952 --validate-only` exited 0. Metadata complexity remains exactly one nonempty time/space string. This candidate supersedes unreviewed author drafts, not any historical review outcome. No separate reviewer, registration, release or submission acceptance is implied.
