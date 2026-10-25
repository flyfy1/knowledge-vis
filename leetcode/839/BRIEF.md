# #839 Similar String Groups — author brief

Status: author implementation run; independent lesson review pending. No acceptance,
submission, deployment or actual learner outcome is claimed. Design: reuse approved
pattern from specs/reviews/leetcode-all-hard-design-review.md and its dispatcher
adjudication; no new layout or shared service. Website-design skill applied.
Scope: leetcode/839 only. Category computing; stage university. Audience: readers
who know lists, loops and functions, but need graph and disjoint-set terms defined.
Smallest outcome: reconstruct why a chain joins words and implement the official
Python method. Learning loop: swap by hand → distinguish edge/path → accumulate
components → predict a fresh duplicate/chain case → map to source.

## Official contract
Verified 2026-10-26 using public official GraphQL, exact response and access timestamp
in tests/evidence/official.json; official URL https://leetcode.com/problems/similar-string-groups/.
Python3 selector provides `class Solution: def numSimilarGroups(self, strs: list[str]) -> int`.
Python is canonical; no non-Python fallback. All words are equal-length lowercase
anagrams; 1..300 words, length 1..300. Identical words are similar; a single swap
of distinct positions is permitted. No empty input in contract. Official examples:
[tars,rats,arts,star]→2; [omv,ovm]→1. Input need not be mutated.

## Exact design contract
Reuse ../style.css tokens verbatim: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. Shared system font, headings,
spacing, radii; local overrides only for 48px controls, readable disabled states,
solid sticky navigation, wrapping, group lists and mismatch markings. No ambient
motion. Native DOM words/groups rather than a general visualization framework.
P0 / highest-return slice: concrete swaps, pair ledger, component count and invariant,
bilingual state preservation and exact executable source. P1: reversible presets,
source fallback and related links. P2: none. Deferred: arbitrary input editor and
large trace playback (bounded examples make reasoning inspectable); no service,
accounts or remote code execution. Reconsider only for a demonstrated learning need.

## Five-field steps
|Step|Known|Single question|Input → desired output|Action → observation|Conditions|
|---|---|---|---|---|---|
|0|Characters and positions|Can two swaps connect words that need more than one direct swap?|tars, rats, arts → similarity vs group|Swap 0↔2 then 0↔1; undo/reset → actual word and mismatch positions change|Zero-based positions; original anagrams, intermediate words remain anagrams|
|1|One-swap relation|How do we count groups without confusing direct similarity and reachability?|Same words → explicit graph/BFS baseline|Read hand chain, inspect baseline → connected paths rather than cliques|All-pair direct tests; isolated vertices count|
|2|Edges/paths, graph baseline|What must a merge preserve?|Preset words → partition after each pair|Next/back/end/reset, change preset → groups, parent/size summaries, before/after counts and full history|After each completed pair; all pair events retained; synthetic JS trace, not Python execution|
|3|Processed-edge component invariant|Does a duplicate add a new group?|abc,bac,bca,bca → final groups|Choose before reveal; change answer clears feedback; locale preserves → chain and duplicate explanation|Fresh isolated exercise; no truth before explicit reveal|
|4|Invariant and pair scan|How does this become a submission?|Official Python source → callable result and costs|Open/copy/download/fallback → exact source|Official anagram guarantee; O(n²(L+log n)) conservative time, O(n) auxiliary space|

## First-use dependencies (redefined locally when needed)
Step 0: anagram = same character counts; similar = identical or one swap;
index = zero-based position. Step 1: vertex = input occurrence, edge = similar pair,
path = sequence of edges, component/group = all vertices joined by paths;
BFS = repeatedly visit unvisited neighbors. Step 2: disjoint-set = partition tracker;
parent = pointer toward a representative/root; size = members at a root;
find = follow parent pointers; merge/union = attach smaller root to larger;
invariant = claim preserved after every operation. Step 4 repeats these code meanings.

## Simulation and state contract
Hand experiment independent of trace and quiz. Preset changes visibly restart only
trace. Frame zero has singleton groups and no processed pairs; each later frame is
a completed comparison plus optional union. Duplicate occurrences retain IDs.
Full mismatch positions shown even though Python exits after its third mismatch;
parent/size trace follows canonical find/union. No omitted pair events. Snapshot
storage is teaching overhead, separate from O(n) submission auxiliary space.
Locale changes text only; controls/selection/focus/at/reveal remain. Copy success,
manual fallback, initial/middle/end/disabled, quiz unanswered/selected/revealed/changed
are bilingual; loading/network failure is inapplicable to local synchronous data.

## Validation and handoff
Independent computational oracle generates real one-swap strings and traverses
connectivity (does not use mismatch/DSU logic). Exhaustive/seeded/boundary/max tests,
intermediate snapshots and real-browser self-checks live in tests/. All result and
screenshot writers accept OUTPUT_DIR. Freeze candidate hashes after final checks.
Separate reviewer must cold-walk then audit the six weighted dimensions (15/20/20/
20/15/10), >=85 with each >=3 and zero required findings; do not infer acceptance
from author tests. Shared concept map/registry edits forbidden in this run;
lesson-entry.json offers anchors for authorized later registration.

## Author handoff — 839-author-r1
Implementation and author checks complete; see SELF-CHECK.md and tests/evidence/.
Final non-mutating metadata preflight: `python3 -B scripts/register_leetcode_lesson.py 839 --validate-only`, exit 0 with no output.
Candidate hashes: candidate.json. Independent reviewer/run and acceptance remain
pending; this author run does not perform or claim them. No release authorized
or performed by this run.
