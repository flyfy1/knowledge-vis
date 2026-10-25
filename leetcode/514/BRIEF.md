# #514 Freedom Trail — author candidate v1

Product verdict: reuse the approved single-lesson pattern and shared controls/tokens.
Authority: specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication.
Skill: /home/songyy/Documents/agent-skills/website-design/SKILL.md.
Category algorithms/computing; stage university. Reader knows loops and dictionaries.
Immediate job: reconstruct minimum-cost spelling with repeated letters. Smallest
outcome: explain why one best cost per physical position suffices and implement it.
Learning loop: hand count → reject nearest-only → retain endpoint costs → rewind
all transitions → predict a fresh case → map to executable Python.

Official source: https://leetcode.com/problems/freedom-trail/, accessed 2026-10-25;
public GraphQL capture provenance/official.json includes full statement and actual
Python3 starter `Solution.findRotateSteps(self, ring: str, key: str) -> int`.
Verified: lengths 1..100, lowercase letters, key spellable; initial position 0;
rotation in either direction and each press cost one. Examples gd=4 and godding=13
on ring godding. No empty-input or missing-letter submissions in the contract.

## Exact tokens and scope
Use ../style.css and ../common.js unchanged. Colors: --bg #0d1117,
--panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4,
--muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8,
--bad #ff7a93. Existing system stack, body 1rem/1.75, inherited title clamp,
max content 952px, spacing 8/12/16/20/24/32/64px, card radius14/control8px.
No shadows or animation. Override inherited disabled opacity to 1, muted ink,
48px controls, 3px accent2 focus. No new palette. Table scroll is contained.
P0: causal bilingual content, exact endpoint ledger, prediction, source fidelity,
keyboard and mobile evidence. Highest-return slice: every candidate has its own
source/distance/press/cost, with complete prior rows retained. P1: ring schematic.
P2/Deferred: free-form input and autoplay (unnecessary state and validation burden),
platform work, registration and publication (outside author ownership).

## Step contract (each row supplies the five required fields)
|Step|Known|Single question|Input → output|Action → observation|Conditions|
|0|Characters, counting|What costs a step?|abc, ca → 4|Read the three-position wrap and hand ledger: 1+1+1+1|Both directions allowed; initial 0|
|1|Distance plus press|Why keep more than nearest?|abxxcbx, bc → 5|Compare b1 route6 versus b5 route5|Repeated letters; later targets depend on position|
|2|Distinct endpoints matter|Which history can be discarded?|Preset ring/key → full cost layers|Next completes one key character; back restores layer and candidates; compare same-endpoint paths|Only prefix length and endpoint affect future; shortest arcs suffice|
|3|Endpoint invariant|Can you transfer it?|Fresh abxxxcbxx, bc → predict total|Choose before reveal; changing choice clears feedback; locale preserves choice|Independent exercise, no lab answer reuse|
|4|Recurrence and induction|How does Python preserve it?|Code → exact source and cost|Copy/download/inspect mapped loops|Official nonempty spellable inputs|

First-use terms, repeated locally when needed: position=index fixed to ring character
(step0); circular distance=shorter arc (0); baseline=enumerate matching endpoint
sequences (1); state=prefix count and endpoint (2); DP=save cheapest cost per state
(2); invariant=claim true at each finished layer (2/4); rolling memory=replace old
layer only after new layer complete (4). m=key length,n=ring length at formula/cost.

Simulation: browser computes deterministic teaching DP snapshots, not Python execution.
Each frame is after an entire character's transitions finish; initial frame before
any press. Full layer ledger stays visible. Ring schematic fixes engraved positions
and marks possible alignments, not a physical animation or a single selected path.
Unknown cells are dash, never zero; initial zero at position 0 even before spelling.
Both locales cover initial/middle/final, disabled, correct/incorrect/revised answer,
copy success/fallback; loading/auth/empty are inapplicable to local static data.
Language preserves trace, selection, reveal and focus. Presets reset only the lab.
Canonical rolling DP O(m n²) time, O(n) auxiliary space; teaching history costs
O(m n²) with candidates, explicitly separate. Baseline O(n^m * m) upper bound,
O(m) recursion excluding input. Proof: cheaper same endpoint dominates, all matching
endpoints included, nonmatching excluded because press illegal, shorter arc dominates.

Validation: independent unit-operation BFS on (position,prefix), exhaustive binary
rings/keys, seeded ternary cases, all DP layers versus BFS, official and max bounds;
real Chromium in both languages at320/390/736/1440 and200% zoom; source parity,
clipboard/fallback, storage denial, keyboard, links, local network and contrast.
Self-check only; independent lesson review, real learners and LeetCode submission
acceptance remain unclaimed. No agents, registration, deployment or shared edits.
