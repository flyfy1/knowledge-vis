# #810 Chalkboard XOR Game — author brief

Product verdict: reuse the approved collection lesson pattern. Design authority:
`specs/reviews/leetcode-all-hard-design-review.md`, dispatcher D3/D6/D8.
This is an author candidate, not independent acceptance. Category: leetcode;
stage: university. Reader: knows Python lists and boolean results, new to game proofs.
Smallest outcome: calculate a legal move, distinguish the two terminal rules,
prove the parity criterion, then implement and independently check Python.

Official evidence: provenance/official.json, fetched 2026-10-26 UTC from public
LeetCode GraphQL. Free Hard #810. nums length 1..1000, values 0..65535.
Examples [1,1,2] false, [0,1] true, [1,2,3] true. Python3 officially exposes
Solution.xorGame(self, nums: list[int]) -> bool. No input mutation requirement.
Empty board XOR=0 is a game convention, not an allowed initial input.

## Learning loop and sections

| Step | Already known | Single question | Input → desired quantity | Action → observation | Conditions |
|---|---|---|---|---|---|
| 0 | Two players alternate | Does making zero win? | [1,2], turn rules → winner | Predict then reveal hand calculation: 3→2→0; Bob loses | Optimal play; terminal check before move |
| 1 | XOR and loss rules | Which erasures are safe? | Seven small presets → each candidate child XOR | Erase a tile, rewind, reset, finish with safe moves; retained ledger shows before/after | Simulation only; tiny complete play path, not full game tree or submission execution |
| 2 | Child XOR = X xor a | Can search be avoided? | Nonzero XOR and board size → winner | Compare all candidate values in step 1, read even/odd proof | Zero checked first; even nonzero board always has safe move |
| 3 | Parity proof | Does rule transfer? | [4,4,4,7,7] → optimal winner | Select answer, reveal, change answer clears feedback; locale preserves state | Fresh exercise; independent from simulator resets |
| 4 | Winner rule | How does Python express it? | nums → bool | Inspect exact source, copy/fallback/download | 16-bit values; O(n) time/O(1) auxiliary; no mutation |

## First-use definitions

Step 0: XOR means each output bit is 1 iff the two input bits differ; folding all
values starts at zero. Define empty XOR, current player, immediate terminal win,
and losing erasure. Step 1 repeats XOR definition; safe means child XOR nonzero,
not necessarily a winning move. Step 2 repeats X, n, safe, parity (even/odd),
winning position (current player can force a win), and invariant (property retained
through safe transitions). Step 3 repeats parity/XOR summary. Step 4 repeats
accumulator (XOR of processed prefix), n and auxiliary storage.

## State and visual contract

Numeric tiles identify original positions (0-based), preserving duplicate identity.
Each tile shows child XOR and safe/loses text; current board and cumulative history
are simultaneous. Clicking removes exactly that original tile; previous restores a
snapshot, next replays a saved branch or chooses the first safe tile, end continues
the same policy. At a terminal state both forward controls disable. Branching after
rewind truncates only the future, retaining history. Preset change explicitly resets.
Starting-zero presets end immediately without an erasure. No automatic animation.
Locale updates labels without changing snapshots, answer, reveal, disclosures or focus.
Clipboard failure displays the full selected canonical source with manual guidance.
Storage failure falls back to memory. No network loading or reconnect state applies.

## Proof and costs

If X≠0, removing a makes X'=X xor a; the move loses iff a=X.
For even n, if all values were X their XOR would be zero, contradiction, so at least
one safe move exists. It reaches odd n with nonzero XOR. For odd n, every safe move
reaches an even nonzero position; an unsafe move loses immediately. Induction on n,
base n=1 nonzero loses, proves even/nonzero wins and odd/nonzero loses. X=0 wins
before any erasure, including odd [1,2,3]. A recursive branch search is correct but
has O(n*n!) time upper bound and O(n²) active sliced-list space without memoization;
Python replaces that search with one XOR fold and parity check. No measured speed
claims. Browser snapshots and UI storage are separate from submission space.
Tempting zero-making move fails on [1,1,2]: removing 2 loses immediately.

## Exact tokens / priorities

Reuse all ../style.css tokens exactly: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454,
good #7ee2a8, bad #ff7a93; system font stack and shared spacing/radius.
Local presentation uses these variables only. Controls 48px; 3px accent2 focus;
disabled opacity 1 with muted text/panel2; no decorative motion or new colors.
P0/highest-return slice: honest rules, causal proof, reversible board, bilingual
state clarity, canonical parity and computational/browser evidence. P1: related
reading to existing actual explanations. P2: none. Deferred: free input editor,
full game-tree graphic, automatic playback (unnecessary scope/runtime complexity).

## Verification boundary

Tests execute the canonical Python against recursive game search with independent
bit-column XOR, exhaustive and seeded inputs, maximum constraints; intermediate
browser state checked independently. Browser checks cover both locales/all presets,
branching, back/reset/end, predictions, copy and native manual fallback, downloaded
bytes, narrow/desktop/200% CSS zoom, keyboard/focus, forced colors, offline/storage
failure, local assets, and calibrated contrast. OUTPUT_DIR supports reviewer reruns.
Self-check evidence is not actual learner research, independent review, LeetCode
submission acceptance, native device testing, or production delivery.
