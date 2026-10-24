# #432 author brief — candidate 1

Reuse verdict: build one lesson within the approved collection and five-section shell.
Design authority: specs/reviews/leetcode-all-hard-design-review.md and dispatcher
adjudication. Website-design skill read; no new layout or independent approval claimed.
Category computing; stage university. Reader knows Python dictionaries and references.
Job: reconstruct average constant-time count updates and extreme-key queries.
Learning loop: count two words → reject scanning/cached extremes → move between
neighboring nonempty count groups → predict bucket deletion → map to Python.

Official verification: tests/evidence/official.json, public LeetCode GraphQL capture
2026-10-25 (timestamp in capture). Python3 selector supplies AllOne(), inc(key: str)
-> None, dec(key: str) -> None, getMaxKey()/getMinKey() -> str. Empty queries
return ""; any tied key allowed; dec only existing keys; lowercase length 1..10;
at most 50,000 calls. Official hello/leet example preserved in tests.

## Step contract (five fields each)
|Step|Already known|Single question|Input → desired output|Action → visible observation|Conditions|
|0|Counting words|What do extrema return?|inc tea, inc tea, inc bun → counts and keys|Reveal hand answer → tea:2, bun:1|Any tie accepted; empty returns empty string|
|1|Dictionary counts|Why not scan or cache only two keys?|same counts → cost and failed update|Read explicit a:1,b:3,c:5 counterexample|Average O(1) updates do not make O(n) scans constant|
|2|Counts and extrema|Why is a neighboring group enough?|bounded operation presets → before/after groups and key locations|Next/back/reset/end/preset → create, reuse, delete groups with retained ledger|One-count updates only; diagram is simulation with full snapshots|
|3|Sorted nonempty groups|Which links survive a fresh deletion?|ant:1,bee:3,cat:3; dec ant → remaining groups|Choose then reveal; change clears feedback|Remove zero key and empty group; do not invent count 2|
|4|Group movement|How does code preserve the invariant at honest cost?|official Python source → implementation|Copy/download/fallback → exact canonical bytes|Expected hashing; bounded key length; O(n) live space; no scan in getters|

## Terms at first use
Step 0: count = stored positive occurrence number; extrema = least/greatest count.
Step 1: dictionary = key-to-value lookup; baseline = simple correct reference.
Step 2: bucket = one positive count and all keys with that count; doubly linked =
previous and next references; sentinel = empty boundary node, never a real count;
invariant = a property preserved after each completed operation; map = key to entry.
Step 4 repeats terms near code. Entry = one key's node; attach/detach = local link edits.
Within each bucket keys are themselves linked, giving an explicit constant-time
representative without relying on scanning a sparse Python set iterator.

## Exact tokens / UI contract
Use ../style.css tokens verbatim: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. Existing system fonts, sizes,
spacing, radii and static styling; local overrides only 48px controls, readable
disabled opacity 1, wrapping and bucket layout. No new color literals.
Snapshot columns stack below 700px. Each group explicitly lists count, keys and
bidirectional links; endpoint labels identify sentinel boundaries. No ambient motion.

State matrix: both locales cover initial/partial/end, empty/tied/gapped groups,
all presets, selected/unrevealed/revealed/changed predictions, copied/fallback,
blocked storage. No loading/network data flow; reconnect and async execution N/A.
Locale preserves all state. Preset explicitly resets only trace. No hidden truncation.

P0: accurate causal lesson, linked state, bilingual reversible experiment, source
parity, canonical execution, browser and contrast checks. Highest-return 20%:
neighbor-only proof plus visible before/after bucket removal.
P1: local related anchors and explanatory operation ledger included.
P2/deferred: animation, arbitrary input editor, live Python runner; no demonstrated
need, and would expand the approved bounded static experiment.

Simulation limits: browser snapshots are teaching simulation, not execution of
solution.py. Python tests execute the canonical source separately. Snapshot
storage is not submission space. No LeetCode acceptance, actual novice outcomes,
independent review or deployment claimed. Candidate awaits separate review.
