# #600 author brief — candidate 1

Product verdict: reuse `/leetcode/<id>/` and the approved five-section lesson shell,
shared locale and exact tokens. This is one algorithm lesson, not a framework.
Audience: reader who knows Python loops and binary place values. Job: count valid
integers through n without enumerating a billion candidates. Smallest outcome:
reconstruct the suffix count and first-different-bit partition, predict an unseen
stop, and implement the official Python interface.
Category: computing / collection LeetCode; stage: university.
Contract: specs/reviews/leetcode-all-hard-design-review.md and its dispatcher
adjudication already approve reuse. No new layout review or acceptance is claimed.

## Official source
Verified 2026-10-25 via official problem page and public GraphQL; full observed
statement and language snippets in provenance/official.json. Positive integer n,
1 <= n <= 10^9; count integers in inclusive [0,n] with no adjacent binary ones.
Examples (5,5), (1,2), (2,3). Python3 snippet: class Solution,
findIntegers(self, n: int) -> int. No mutation or special runtime types. Zero is
included in the count; n=0 is outside official inputs, tested as an extension.

## Learning loop / five fields per step
| Step | Already known | Single question | Input → desired quantity | Action → observation | Conditions |
|---|---|---|---|---|---|
|0|Binary digits represent integers|What exactly is counted through 5?|0…5 → five valid integers|Read six labeled binary cards; compare 3 with 5|Inclusive range; zero counts|
|1|Reject any 11|How many valid k-bit suffixes exist?|k → f[k]|Choose k=0…5; see every valid padded string and 0/10 split counts|Leading zeros allowed; preceding bit is zero or absent|
|2|f[k] counts a free suffix|How can a 1-bit count a whole smaller branch?|n → prefix partition and running count|Presets restart; next/back/range/reset/end expose retained bit ledger and before/after sum|Equal prefix remains valid; add branch before stopping on 11|
|3|First-different-bit partition|For unseen 13, where must counting stop?|1101 → count|Choose 5/6/8, reveal, change; explain omitted or overcounted states|Independent quiz; unrelated trace controls preserve it|
|4|Scan invariant|How does the proof become submit-ready code?|official int → int|View/copy/download exact Python; compare named variables with trace|Unit-cost ≤30-bit arithmetic; no LeetCode acceptance claim|

## Terminology dependency / first use
Step 0: binary = base-two digits, adjacent = neighboring digits, baseline = test
every candidate. Step 1: suffix = remaining rightmost digits; f[k] = count of
valid length-k strings including leading zeros, empty string f[0]=1; recurrence
= count from shorter lengths. Step 2 redefines prefix (left digits already read),
suffix and f[i] locally; tight/equal path = same digits as n so far; invariant =
claim preserved after each scan operation. Step 3 repeats first-difference rule.
Step 4 redefines bits, f, total, prev and code mapping; local cost conventions.

## Mechanism and examples
n=5: 000,001,010,100,101 accepted; 011 rejected. f0=1, f1=2,
f2=3; k>=2 splits into 0 + valid k-1 and 10 + valid k-2. Wrong shortcut:
f[bit_length(4)]=5 includes 101=5 beyond bound 100=4. Trace default n=5:
bit2=1 add3, bit1=0 add0, bit0=1 add1, then add n itself ->5.
Adversarial n=6: add3 at bit2 then add2 at bit1 BEFORE stop on 11 ->5.
Fresh exercise n=13: 0??? contributes5, 10?? contributes3, 11 invalid ->8.
Invariant: counted branches are valid, disjoint, strictly less than n; any valid
unaccounted number must match processed prefix. First different bit partitions
all smaller values. On 11 no valid equality continuation remains, but the newly
smaller zero branch is still valid. End without stop adds n exactly once.

## Visual/state contract
Simulation only, not execution of solution.py. Deterministic complete traces,
at most 32 frames; frame means one bit operation just completed (plus explicit
initial and finish events). Full history retained up to frame; backward restores
snapshot, not inverse computation. Binary bit labels run high to low; row gives
place i, bit, smaller branch pattern, added count and running sum. Pending output
is never called final. Suffix experiment is independent. Preset changes restart
only scan. Language retains all state and focus; prediction changes hide feedback.
States: initial / normal / early-stop / finish / disabled endpoints / unrevealed /
correct / incorrect / changed choice / copied / manual fallback × both locales.
No timers, loading, remote execution, auth, reconnect or async data state applies.

## Exact tokens and layout
Use ../style.css unchanged: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93; even section #0a0e14.
System font stack, base 16px/1.75, shared clamp h1/h2; 1000px header,
952px content; section spacing 64/24 (phone 44/16), stage 20 (phone14),
control radius8, stage radius14, gaps8/12/16/24. No shadow or motion.
Local overrides: controls >=48px; disabled opacity1 muted on panel2 dashed;
field border muted; focus accent2 3px offset4. All color literals reuse tokens.
Tables may scroll in labeled keyboard-focusable regions; long text wraps.

## Scope and validation
P0 / highest-return 20%: causal split + exact ledger + source + both locales and
accessible states. P1: suffix enumeration and misconception feedback. P2: none.
Deferred: custom arbitrary input (presets cover mechanisms and max); autoplay,
universal visualizer and decorative assets (no learning need). No shared edits.
Run independent string enumeration small oracle; independent digit recursion
large oracle; suffix/branch invariants for every trace; official boundaries and
seeded cases; real browser all presets/endpoints/replay, quiz all answers,
locale after interaction, source/copy/fallback/download, blocked storage,
320/390/736/1440 and 200% zoom, keyboard/focus/deep links/local requests,
contrast measurements and visual screenshot inspection. Output tests accept
OUTPUT_DIR. Run non-mutating metadata preflight. Record author self-check only;
independent reviewer and learner outcomes remain pending.
