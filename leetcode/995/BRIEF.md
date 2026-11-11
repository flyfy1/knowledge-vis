# #995 author brief — candidate 1

Author run only; independent review pending. No submission, acceptance, publication or learner outcome claimed. Scope: leetcode/995 only. Reuse verdict: existing LeetCode collection and five-section lesson shell, under specs/reviews/leetcode-all-hard-design-review.md and its dispatcher adjudication; website-design skill read. No new product/layout/platform. Category computing / algorithms; stage university. Reader knows basic Python loops/lists and 0/1 toggling. Job: reconstruct why the leftmost unresolved bit forces a window, then implement that decision without rewriting k cells.

Official URL: https://leetcode.com/problems/minimum-number-of-k-consecutive-bit-flips/ . Access 2026-10-26 via web page and public GraphQL GET with trailing slash. Plain urllib page and first GraphQL URL returned403; normal public trailing-slash GraphQL succeeded. Raw official content and all codeSnippets saved in tests/evidence/official.json. Python3 selector observed: class Solution, minKBitFlips(self, nums: list[int], k: int) -> int. Canonical Python preferred. Binary nums, n1..100000, k1..n. Flip exactly k contiguous positions, both0→1 and1→0. Min flips to all1, impossible−1. Official examples ([0,1,0],1)→2; ([1,1,0],2)→−1; ([0,0,0,1,0,1,1,0],3)→3. No paid restriction or extra mutation requirement; solution preserves input. Empty/invalid k outside official contract.

Learning loop: hand flip [0,1,0],k2 twice → expose forced choice and direct baseline → carry exactly the same decisions with parity and expiry in a reversible ledger → fresh prediction involving expiry → map to canonical Python and costs.

|Step|Known|Single question|Input → output|Action → observation|Conditions|
|---|---|---|---|---|---|
|1|Bit0/1|What does one length2 flip change?|010,k2 →111 in2 flips|Advance/rewind hand snapshots; original1 becomes0|Exact-length contiguous flips, zero-based indices|
|2|Leftmost0 and hand states|Why is the choice forced?|Fixed prefix + next bit → unique start decision|Read direct baseline and counterexample; compare zero count with actual2|Earlier start decisions fixed, duplicate starts cancel in pairs|
|3|Forced scan|How do we avoid k writes per flip?|Same010 and boundary presets → parity/expiry ledger|Next/back/reset/end, preset restarts; values, before/after parity, expiry and accumulated starts visible|Complete simulations n≤8, no actual Python execution|
|4|Parity as odd/even active flips|Can expiry change a later decision?|Fresh [0,1,1,0],k2 → minimum|Predict before reveal; all distractors explained; change clears feedback|Independent of trace; language preserves choice/reveal|
|5|Invariant/expiry|How does this become a submission?|Exact canonical source → callable and costs|Source/copy/manual fallback/download|O(n) time,O(n) auxiliary, input unchanged; simulation snapshots separate|

First-use terms: step1 bit=binary entry; subarray=contiguous run; window=exactly k adjacent entries; index=zero-based position. Step2 prefix=positions before scan; greedy=fix leftmost unresolved position now; baseline=directly toggle each cell. Step3 parity=0 even/1 odd active flips; XOR ^= toggle for bits, 1^1=0; expiry=end exclusive i+k, scheduled toggle removal before testing that position; invariant=prefix all1 and parity represents earlier windows still covering current i. Step4 redefine parity locally. Step5 n=len(nums), expire=list of toggles indexed by exclusive endpoints, n sentinel not scanned. Terms repeated locally per step.

Proof: flipping same start twice cancels, operations commute. Restrict each start to0/1. At i, earlier starts already fixed; later starts cannot cover i. Therefore bit0 forces start i, bit1 forbids it. If i+k>n and0, impossible. Inductively all legal solutions have these same start choices; successful greedy is minimum. Direct baseline writes k cells for every chosen start: O(nk) time,O(n) copy. Two toggles cancel; replace rewriting with parity ^=1 and expiry[i+k] ^=1. Remove expiry[i] before inspecting i. Hand main at i1 has original1, active parity1 →effective0, start second flip makes parity0; i2 removes first flip, parity0→1, original0→effective1. O(n) expire list, constant scan work; no measured speed claim.

Visual contract: frame0 before scan; each later frame completes expiry removal and decision at one zero-based i, or reports failure without changing bit. Cell row shows effective array AFTER that decision. Text marks just checked current plus fixed prefix, avoiding color-only overlap; prior events accumulate in ledger. Ledger old→expired→new parity; decision uses expired parity. Deep snapshots permit exact rewind; no omitted events, no autoplay. Diagram values reconstructed from chosen starts for pedagogy; not submission memory/work. Presets n≤8, official constraints larger. Prediction separate from trace resets.

Tokens exactly shared ../style.css: bg#0d1117,panel#161b22,panel2#1c2330,line#2b3547,text#e8edf4,muted#9aa7b8,accent#6ee7ff,accent2#ffb454,good#7ee2a8,bad#ff7a93. Shared font stack,line-height1.75,spacing8/12/16/20/24/64,radii8/14; local48px controls, disabled opacity1,3px accent2 focus offset4; no new color/motion. Cards wrap at narrow width; ledger semantic table scrolls with focus and headers. CSS budget shared+local<25000 bytes.

State × locale matrix: hand0/1/2; trace initial/skip/flip/expiry/failure/success; each preset/start/end/back/reset; prediction empty/selected/correct/wrong/changed; copy success/fallback; guarded storage. Static loading/reconnect/auth inapplicable. Source disclosure and controls retain focus/state on locale change. P0/highest-return20%: forced-choice proof, visible expiry, executable canonical parity, bilingual access and actual browser/oracle checks. P1 related deep links; P2 none. Deferred editor/autoplay/shared registration (bounded example suffices, no demonstrated need/outside ownership). No new review gate required: approved reused pattern applies; independent per-lesson teaching review remains next.

Frozen rubric: standard six dimensions15/20/20/20/15/10, threshold85,each≥3,no open required fixes. Evidence must reconstruct hand2; causal forced choice plus saved k writes; invariant and expiry boundaries; reversible current/fixed marks; actual Python mapping and costs; both locales/devices. Author assigns no independent score.

## Final author status — frozen candidate 1

Implementation and author self-check complete, independent review pending. See tests/evidence/SELF-CHECK.md, numerical.json, core.json, browser.json, visual.json, official.json, preflight.json and candidate-manifest.json. Python validated against18,434 exhaustive BFS-oracle cases,1,000 seeded cases and9 official/fresh/max cases; simulation8,194 inputs/58,416 frames. Actual browser passed both locales/all8 presets,16 viewport/zoom combinations, native copy/fallback/download exact parity, keyboard, locale preservation, offline/storage-denied and measured contrast. CSS11,431bytes; min tested text contrast6.4494:1, AA passes, some exact shared muted pairs below preferred7:1. Screenshot inspection and author fixes/capture limitations are recorded in SELF-CHECK.md.

From repository root, `python3 -B scripts/register_leetcode_lesson.py 995 --validate-only` passed exit0, empty stdout/stderr. Metadata complexity is one nonempty string; canonical language Python verified. All metadata and runtime files frozen together as candidate1 for separate independent review. No registration, other-lesson/shared edits, commits, deploys, service changes, credential access or agent spawning. Reviewer identity/run/report, independently accepted revision, deployed revision and actual learner evidence remain pending/unverified.

## Copy revision — 995-COPY-R1, self-checked awaiting independent review

Owner's current repair instruction authorizes the narrow revision described in
`specs/reviews/995-teaching-copy-repair-request-20261026.md`. Historical review,
acceptance, and candidate-1 records above remain historical. This revision has no
independent acceptance yet. The original advisories retain IDs 995-A01/995-A02.

P0/highest-return slice: describe #330's actual coverage experiment in link2 and
explain order independence in everyday English in proof[1]. Only these dictionary
entries changed; index.html changes copy.js?v=1 to v=2 for cache invalidation.
Chinese proof, English induction and impossibility/minimality argument, canonical
Python, mirror, numerical core, renderer, CSS and metadata remain byte-identical.
Existing tokens/layout and all interaction ownership are reused. P1/P2: none.
Deferred: diagrams, destination edits and shared changes, outside this correction.

See tests/evidence/copy-r1/SELF-CHECK.md and candidate-manifest.json for the exact
candidate, finding mapping, commands, results and evidence limits. Both findings
are fixed awaiting independent review, with no author-assigned score or closure.
The non-mutating metadata preflight passed exit 0; complexity remains the single
string `O(n) time; O(n) auxiliary space`. No registration was run.
