# #793 · Preimage Size of Factorial Zeroes Function

Author candidate, independent lesson review pending. Reuses the approved pattern in
specs/reviews/leetcode-all-hard-design-review.md and its dispatcher adjudication.
Scope: leetcode/793 only; category computing/leetcode collection, stage university.
Reader: knows integer division, loops and elementary Python. Job: count all x with
exactly k trailing factorial zeroes; reconstruct two boundary searches. Smallest
useful outcome: explain why k=5 has no solution and implement the official callable.
Validation occasion: independent cold walkthrough and fresh prediction; author tests
are self-checks, not learner results or acceptance.

## Official contract and provenance
Official URL: https://leetcode.com/problems/preimage-size-of-factorial-zeroes-function/
Access: 2026-10-25 UTC, public GraphQL successful; full response and language stubs
in tests/evidence/official.json. Free Hard, k integer in [0,10^9]. f(x) counts
trailing zeroes of x! for nonnegative integer x; 0!=1. Return count of such x,
not x itself. Examples (0,5), (5,0), (3,5). Python3 stub explicitly observed:
class Solution: def preimageSizeFZF(self, k: int) -> int. No mutation, no modulus,
no empty input. Python preferred and faithful; non-Python exception inapplicable.

## Learning loop and section five-field contract
0. Known: factorial multiplication and decimal zeroes. Question: why does 25!
   jump from four to six zeroes? Input x=24/25, seek f(x). Action: move x from
   24 to 25 and back; see full multiples-of-5 and extra multiples-of-25 ledger.
   Conditions: nonnegative integer x; lab bounded 0..30, not the official range.
1. Known: f(x) counts factors of five. Question: how many x give one chosen k?
   Input same k=5; seek full preimage (all inputs producing that output).
   Action: inspect fixed five-input blocks and baseline code. Observe 20..24
   produce 4 and 25..29 produce 6. Conditions: x=5q+r, 0<=r<5; missing outputs
   possible, attained outputs always have five inputs. Counterexample to x=5k
   and to ignoring higher powers is k=5, x=25.
2. Known: f never decreases and may skip. Question: where do matches start/end?
   Input selectable k; seek L(k),L(k+1), where L(t)=first x with f(x)>=t.
   Action: Next comparison, rewind, reset, finish and presets; see old interval,
   tested midpoint, its zero count, new interval and retained decision ledger.
   Conditions: L(t) in closed [lo,hi]; x<lo fails; x>=hi succeeds. f(5(t+1))>=t+1
   supplies finite upper sentinel. Midpoint decisions preserve these facts.
3. Known: blocks and search boundary. Question: does a fresh k occur at all?
   Input independent k=29 or 31; seek count. Action: choose 0/5/1 then reveal;
   explanation uses f(124)=28, f(125)=31 and same five-block invariant. Change
   answer or exercise clears feedback; locale preserves selection/reveal.
   Conditions: fresh fixed exercises; trace controls never reset this exercise.
4. Known: both boundaries and invariant. Question: how does this become official
   Python? Input full valid k range; output integer. Action: inspect/copy/download
   exact source; match zeros, first_at_least, and subtraction to trace operations.
   Conditions: unit-cost integer arithmetic model stated; O(log²(k+2)) time,
   O(1) auxiliary integer cells; teaching snapshots have separate storage.

## First-use dependencies (redefined locally in each section)
Factorial x!: multiply 1..x, with 0!=1 (0). Trailing zero: decimal zero at right
edge (0). Factor: multiplicative ingredient; a 10 pairs a 2 and a 5 (0).
f(x): trailing-zero count (0..4). Floor / //: discard division remainder (0).
Preimage: all x yielding one k (1). Monotone: never decreasing (2).
L(t): first x with f(x)>=t (2). Sentinel hi: known sufficient bound (2).
Invariant: facts preserved after each comparison (2). lo/hi/mid correspond
literally to code; trace-only phase/history are not submission memory (2,4).

## Representation / lifecycle / exact tokens
Reuse ../style.css and ../common.js without edits. Exact shared palette:
--bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547,
--text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454,
--good #7ee2a8, --bad #ff7a93. Shared system font stack, 1.75 line height,
shared 8px controls / 14px stage radii, 952px content, standard spacing.
Local rules only layout/reflow and 48px controls, opaque legible disabled states,
3px focus with 4px offset. No new color literal, motion or automatic playback.
Native controls and DOM arithmetic ledger, not canvas or universal renderer.
Trace frames represent a completed comparison; show before and after distinctly.
Phase transition gets its own labeled frame; no omitted comparisons. Simulation
is explicitly separate from actual Python execution. Locale updates copy in place,
not controls. All assets local, source offline mirror exact including final newline.

## State matrix / scope
Both locales: lab x endpoints/middle, search initial/middle/end/phase change,
all presets (0,3,5,6,24,10^9), prediction unselected/selected/revealed/changed,
copy success/manual fallback and locale roundtrip. No account/network execution,
loading/reconnect/expiry states needed; only clipboard is asynchronous. Reset lab,
trace and exercise independently. No fabricated learner or LeetCode acceptance.
Related links: #4 step2 (partition binary-search direction) and #668 step2
(first sufficient value search); verify served targets and precise concept labels.

P0: exact problem, causal arithmetic, faithful reversible trace, complete bilingual
state, official source, oracle/browser/accessibility evidence and metadata preflight.
P1: retained decision history and second transfer question (included).
P2: decoration (omitted). Highest-return 20%: visible 24→25 jump, two boundary
values and reason for each discarded half. Deferred: autoplay and generalized
plotting (no teaching need); real-device/novice study and independent acceptance
(require separate people/hardware). Production publication outside author scope.

## 2026-10-26 copy revision — 793-COPY-R1

New candidate: `793-copy-r1-20261026`, frozen by `candidate-copy-r1.json`.
The historical accepted base is `59d0c9b1f395064dc3af7be66dadd6c18d92944d`;
its acceptance remains historical. This revision is fixed awaiting separate review.
The seven runtime files matched that base before editing. The only consumer of
`foot` was the footer element. Remove that element and its bilingual key; retain
all other dictionary entries exactly. Update the local generators accordingly
and bump only the changed copy asset query to `793-copy-r1`.

Design verdict: cut workflow filler within the existing lesson. Reader, learning
loop, approved tokens and layout stay as above. P0: preserve teaching, runtime,
source/interface and neighboring controls. P1/highest-return slice: remove the
bilingual footer with rendered proof and no residual gap. P2: none. Deferred:
combined 320px + 200% CSS zoom overflow is pre-existing (361px document width on
both base and repair); changing protected layout files exceeds this request.
The requested 320px and desktop 200% checks pass separately. No new component or
layout is introduced; the supplied copy-repair request is the review scope.

Self-check mapping, exact diff, before/after hashes, browser evidence and limits
are appended to SELF-CHECK.md and tests/evidence/copy-r1/. A fresh independent
reviewer must close 793-COPY-R1 against this new candidate; no closure or release
is asserted here.
