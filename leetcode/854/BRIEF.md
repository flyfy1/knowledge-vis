# #854 K-Similar Strings — author brief, candidate r1

Author implementation and self-check only; independent lesson review pending. No submission acceptance or learner results claimed. Reuse verdict: existing collection/page shell, approved by specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication; no new product/layout. Category leetcode/computing; stage university. Reader knows Python loops, strings and sets.

Official verification: 2026-10-26 public statement and GraphQL question/codeSnippets captured in tests/evidence/official.json. Python3 callable `class Solution: def kSimilarity(self, s1: str, s2: str) -> int` observed. Two anagrams, equal lengths 1..20, alphabet a..f, arbitrary-position swaps, minimum nonnegative count. Examples ab→ba=1, abc→bca=2. Empty/non-anagram inputs outside contract. No premium access used.

Learning loop: hand-swap abc to bca; compare all-swap BFS with first-mismatch branching; inspect complete small breadth layers; predict a fresh branch set; map to canonical Python. Browser is a simulation, not Python execution. No trace truncation: presets intentionally tiny, complete frontier/history retained.

| Step | Known | Single question | Input / wanted | Action / visible observation | Conditions |
|---|---|---|---|---|---|
|0|Letters and swapping|What does minimum k count?|abc,bca / swaps|Apply (0,1), then (1,2); undo/reset; retain history|Arbitrary swaps, anagrams|
|1|One swap costs 1|Why keep alternatives?|aabbcc,abcabc / minimum|Read greedy 3 vs optimal 2 and baseline code|Repeated letters can give different suffixes|
|2|Baseline explores layers|Which swaps can we safely retain?|Preset strings / complete BFS frontier|Next layer/back/reset/end; inspect every parent, candidates and generated child with visited flag|Anagrams, first mismatch, no disturbing matched prefix|
|3|Candidate invariant|Which candidates remain on a fresh input?|abcb→bbca / j set|Choose before reveal; changing answer clears explanation|Indices zero based; exclude correctly placed source|
|4|BFS and pruning|How does this become a submission?|Canonical source / result and cost|Source/copy/manual fallback/download|Python supported; factorial upper bound remains|

Terms on first use and locally repeated: swap (exchange two positions, step0); anagram (same character counts, step0); state (whole current string, step1/2); BFS (process all states at d swaps before d+1, step1/2); frontier (current depth's strings, step2); first mismatch i (leftmost differing index, step2/3); visited set (strings already enqueued, step2/4); invariant (an optimal route survives and fixed prefix stays fixed, step2/3); occurrence cycle (tag duplicate letters and follow their destinations, step2 proof).

Exact shared tokens: --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Shared system stack, 1.75 line height, 14px stages, 8px controls, inherited spacing. Local geometry uses same tokens. Disabled controls opaque; 48px targets; 3px orange focus. No motion or ambient timers.

P0/highest-return 20%: concrete swap history, full causal candidate rows, proof, bilingual feedback/state fidelity and executed oracle checks. P1: source transfer and related BFS/graph lessons. P2: none. Deferred custom input and autoplay: would distract from small fully displayed layers and require extra recovery states. Network/loading/reconnect states inapplicable to local synchronous simulation; clipboard denial has manual recovery. Boundary equal strings starts terminal. Presets reset only trace; locale preserves all state, quiz independent.

Validation plan: independent unrestricted swap oracle, exhaustive small anagrams, seeded tests, n=20 boundaries, intermediate prefix/candidate/layer invariants; real Chromium both locales and presets, replay/endpoints, quiz, native clipboard success/fallback with per-attempt sentinel, source parity, mobile/zoom geometry, focus, contrast, local requests, screenshots visually inspected. Tests accept EVIDENCE_DIR. Reviewer registration/concept-map edits reserved for dispatcher. Candidate hashes and measured results recorded after tests.

## Frozen author outcome

Implementation and author self-check complete. Independent review pending. Numerical results: 4,926 oracle comparisons plus 8 fixtures; 7 preset and 180 seeded complete core traces. Real Chromium: both locales, all presets, 16 width/zoom layouts, source transfer, native fallback, local/offline/blocked storage, focus/keyboard and destination links passed. Shared+local CSS 11,817 bytes. `python3 -B scripts/register_leetcode_lesson.py 854 --validate-only` from repository root exited 0; see tests/evidence/preflight.json. See SELF-CHECK.md and candidate.json for bounded evidence and file identity. This author run neither registers nor publishes the lesson.

## Approved proof bridge revision — 854-BRIDGE-R1

This isolated candidate implements the dispatcher brief from
`specs/reviews/854-tagged-cycle-revision-request-20261026.md` and separate
`cycle_design_review` design review `854-tagged-cycle-design-review-20261026.md`
(source documents in the root repository). All four P0 recommendations are adopted;
no overrides. Existing accepted algorithm/core and canonical source are unchanged.
The historical author outcome above remains a record of r1, not acceptance of this
revision. A fresh independent lesson review remains required.

Reuse verdict: one four-snapshot example between `proof` and `proof2` in section03
(`#step2`). The high-return transition changes only two destination assignments,
leaving letters and actual-swap count unchanged. Complete EN/ZH explanations
contrast that zero-cost relabeling with two physical swaps. The original answer is
2 throughout; the first assignment's3 is not its lower bound. The general proof
and all-eligible-j requirement remain explicit. No second scored quiz is added.

One `bridgeRow` index drives the fixed data, counters, explanation and endpoint
controls. It is independent of hand swaps, BFS frames/preset, prediction and copy
state. Locale rerender preserves it. Controls retain their DOM identities; only
snapshot contents are replaced, with no animation or automatic transitions.
A rhetorical prompt is derived from row0; row1 supplies its answer. There is no
pending/network/error/reconnect state for this synchronous example.

Exact palette/type/control tokens above are reused. Geometry uses the existing
8/12/16px spacing values, 8px control radius, 1px boundaries and 3px double changed
boundary. Tokens/counter numerals use26px, matching the shared `.metric b` scale;
no new type scale is introduced. The existing560px breakpoint changes four token
columns to two and stacks the counters. Four position cards have minmax(0,1fr)
columns with wrapping; they never shrink text to make a single narrow row. 48px
control targets and3px orange focus remain. Changed destinations/tokens have
visible text labels as well as a double border; no meaning relies on color.

P0: all four snapshots, complete bilingual causal text, separate counters and
state preservation, keyboard/native disabled semantics, and narrow/magnified
readability. P1/P2: none. Deferred arbitrary inputs, animation, all-row comparison
mode and general permutation machinery have no demonstrated need for this small
proof bridge. Validate the rendered mappings and transitions, old interaction
state, clipboard/source parity and layout; do not rerun the unchanged solver's
large numeric suite simply for this explanatory widget.

## Re-review freeze — 854-bridge-r2-20261026

The starting checkout `048d217b1313ec068fbf41fe3703f5f3e83dcc90` already includes
the adopted proof bridge. This revision preserves its runtime bytes and replaces
the stale r1 candidate manifest with a current hash-bound review candidate.
Historical candidate metadata is retained in
`tests/revision-evidence/prior-candidate.json`. No metadata shape repair is needed:
complexity is already one string covering time and space. Canonical Python is
the preferred faithful interface in the saved official snippets; no non-Python
exception or supportedLanguages list is used or needed.

The focused test now checks complete bilingual actions, target/current labels
and both counter labels as well as mappings and numbers. The new revision audit
independently checks assignment costs and source/generator parity and executes
eight Python/oracle fixtures. Current Chromium evidence and stable-finding
mapping are appended to BRIDGE-SELF-CHECK.md. This is self-check evidence only;
`854-BRIDGE-R1` / `854-A01` await a separate reviewer, with the frozen rubric and
historical review/acceptance preserved.
