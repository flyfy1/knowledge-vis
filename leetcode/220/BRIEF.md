# #220 Contains Duplicate III — author candidate

Product verdict: reuse the approved LeetCode lesson pattern, not a new product.
Audience: university-stage readers who know Python loops/dictionaries and integer
arithmetic. Category: computing; stage: university. Immediate job: reconstruct a
correct boolean search with both an index and a value bound. Smallest useful
outcome: calculate one pair, derive a window, derive buckets, predict an unseen
boundary, then map it to an executable official Python method.

Contract: WORKFLOW.md, UI-I18N-SPEC.md, specs/leetcode-explainers.md,
specs/leetcode-hard-traces.md, specs/leetcode-review-gates.md and the adopted
D1–D10/adjudication in specs/reviews/leetcode-all-hard-design-review.md.
Website-design skill applied; existing product/design approval is reused.
Independent per-lesson review is pending. This run is author self-check only.

## Verified official contract

Accessed 2026-10-18, https://leetcode.com/problems/contains-duplicate-iii/ and
public https://leetcode.com/graphql/ questionData, titleSlug contains-duplicate-iii.
Raw public response: tests/evidence/official-graphql.json. Request and interface
excerpts: tests/evidence/official-verification.md. Free, Hard, frontend ID 220.
Two distinct indices must simultaneously satisfy absolute index difference <=
indexDiff and absolute value difference <= valueDiff; return bool. No mutation
required. n=2..100000, values=-10^9..10^9, indexDiff=1..n,
valueDiff=0..10^9. Empty input is outside the official domain. Official examples:
[1,2,3,1],3,0 -> true; [1,5,9,1,5,9],2,3 -> false.
Python3 selector stub explicitly provides Solution.containsNearbyAlmostDuplicate
(self, nums: list[int], indexDiff: int, valueDiff: int) -> bool. Python is canonical;
no non-Python exception or adaptation needed. Inputs remain unchanged.

## Learning loop and five steps

| Step | Known | Single question | Input / desired quantity | Action / observation | Conditions |
|---|---|---|---|---|---|
| 0 Hand calculation | Array positions and subtraction | Which pair passes both tests? | [1,8,3], k=2,t=2 / boolean | Toggle k=2 to k=1; same value gap now fails index bound; all three pair calculations remain visible | Distinct positions, inclusive bounds |
| 1 Save comparisons | Pair tests | Which earlier positions can still matter? | Same array / candidate window | Read baseline and excluded-position example; then select expiry preset in step 2 | Scan left to right; never compare an item with itself |
| 2 Value buckets | Window of earlier indices | Can three lookups replace a scan? | Values, k,t / first witness or false | Step expiry, probe, insertion; rewind; compare map and cumulative event ledger; switch presets resets only trace | Integer values, width t+1, floor division including negatives, stop at first hit |
| 3 Transfer | Window and bucket rule | Does a close value still count after expiry? | Fresh [-5,8,-2],k=1,t=3 / boolean and reason | Predict before reveal; choose another answer to clear feedback; locale preserves choice/reveal | Expire before probing; adjacency alone insufficient |
| 4 Implementation | Derived rule | Why is the submitted method complete and efficient? | Official signature / executable Python | Inspect, copy/download exact source; map expiration/probe/insertion to code | Expected hash-table O(1), input-bounded integers; no submission acceptance claimed |

## First-use terminology and local definitions

Step 0: i,j are zero-based positions; k=indexDiff is an index-distance limit;
t=valueDiff is a value-distance limit; both tests inclusive. Step 1: sliding window
means preceding indices max(0,i-k)..i-1, a dictionary is a key-to-value table.
Step 2 repeats window definition; bucket b=floor(x/w) groups integers bw..bw+w-1;
w=t+1; candidate is a stored value that must pass the value test. Expiry means
removing an index too far behind. Steps 3/4 repeat these meanings locally.
No unintroduced algorithm shorthand is needed to read a jumping section.

Derivation: same bucket spans at most w-1=t, so same bucket is sufficient. With
one entire bucket between x and y their closest integer values differ w+1>t;
only own/adjacent bucket can qualify. Adjacent buckets require exact subtraction:
0 and 5 with t=3 are adjacent but fail. Negative floor example -1//4=-1 keeps
all buckets width four, unlike truncation toward zero. One representative per
bucket is safe only because a second one would return true immediately.

Invariant at every probe: dictionary contains exactly earlier live positions
max(0,i-k)..i-1, at most one per bucket on a continuing path. Expire i-k-1 first;
probe before insert ensures i!=j. After insertion current is included and up to
k+1 entries may exist until next expiry: label this timing explicitly. Induction
and the three-bucket distance argument prove completeness; exhausting i proves
false. Sorting values without indices loses the index test; [1,8,3],k=1,t=2 is a
counterexample. Checking only equality loses [1,8,3],k=2,t=2.

## Simulation, states and costs

Browser trace is a deterministic JavaScript simulation, never execution of
solution.py. Teaching presets have <=6 values, no omissions; each deep frame
records a completed expiry/probe/insertion, candidate lookup details and cumulative
history. A successful probe terminates before insertion. No timers or animation.
Python is independently executed offline against pair enumeration. Full teaching
snapshots including cumulative history use O(n²) memory, unlike submission O(min(n,k)) auxiliary space.
Baseline O(n min(n,k)) time/O(1) space; optimized expected O(n) time with Python
dict and O(min(n,k)) space (at most k+1 transient entries). Pathological hash
behavior can worsen time; no deterministic worst-case linear claim.

State matrix in both languages: initial, expired-none/expired-one, probe-empty,
probe-reject, probe-hit, insert, exhausted, disabled endpoints, prediction
unselected/selected/revealed/changed, copy-success/fallback. Local storage denied
falls back to shared locale memory. No loading/network/runtime error states since
all lesson data and source are embedded. Preset changes reset trace, not quiz.

## Exact design tokens and scope

Reuse ../style.css and ../common.js unchanged. Palette exactly shared --bg
#0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4,
--muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8,
--bad #ff7a93; existing alternate section #0a0e14. Shared system font, body 1rem,
line-height 1.75; title clamp(28px,5vw,46px), headings clamp(23px,3.5vw,32px).
Spacing reused 8/10/12/14/16/18/20/24/32/44/64px; card radius14px,
control8px, no shadow, no ambient motion. Local overrides only raise controls to
48px, remove disabled opacity (text --muted on --panel2), allow wrapping and give
fields --muted boundaries. Selected hand controls use --accent2 with --bg text; unselected controls use --panel2 with --text. Focus 3px --accent2 offset4px. Bucket lists reflow,
no canvas scaling; labeled values remain associated on phones. Contrast measured
in evidence. Local + shared shipped CSS below 25000 bytes.

P0/highest-return 20%: concrete example, truthful reversible window/bucket trace,
causal proof, bilingual and accessible controls, canonical source and independent
oracle/browser evidence. P1: extra official/negative/extreme/rejection presets and
history ledger. P2: none. Deferred: custom unbounded input (preset bounds keep
trace small), playback (no learner need), deployment/registration/independent
review (outside author scope). Related existing lessons link to actual anchors;
concept registration is supplied as lesson-entry.json only because shared writes
are prohibited by the owner.
