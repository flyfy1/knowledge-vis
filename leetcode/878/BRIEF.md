# #878 Nth Magical Number — author brief

Author run: Codex, exact model identifier unavailable. Candidate 878-author-v1.
Status: author self-checked; independent lesson review pending, no acceptance
or submission claim. Scope only leetcode/878. No registration or publication.

## Approved product and design contract
Reuse the collection lesson pattern approved/adjudicated in
specs/reviews/leetcode-all-hard-design-review.md; apply the website-design skill
(/home/songyy/Documents/agent-skills/website-design/SKILL.md). No new layout or
product. Category computing; stage university. Reader: basic Python, integer
arithmetic; no prior binary search or number theory assumed. Useful outcome:
count a union of multiples, reconstruct a first-true search, and implement Python.
Learning loop: enumerate 2,3,4,6 → remove double counting → observe a retained
answer interval → predict a new transition → map it to canonical Python.

## Official contract
Verified 2026-10-26 using official page and public GraphQL question/codeSnippets.
URL https://leetcode.com/problems/nth-magical-number/ . Positive integers divisible
by a OR b, ranked from 1, no duplicates, return rank n modulo 1,000,000,007.
Constraints n=1..10^9; a,b=2..40000. Examples (1,2,3)→2; (4,2,3)→6.
No empty/zero/negative inputs permitted; a=b and one dividing the other permitted.
Python3 selector: class Solution, nthMagicalNumber(self,n:int,a:int,b:int)->int.
Use Python (preferred faithful interface). Capture: tests/evidence/official.json.
Chinese title is an authored translation. No category/language inference used.

## Sections: five fields each
|Step|Already known|One question|Inputs → desired quantity|Action → visible observation|Conditions|
|---|---|---|---|---|---|
|0|Divisibility|Which number occupies rank 4?|n=4,a=2,b=3 → 6|Read marked integers 1..6 and distinct ranks|Positive integers, OR, rank starts at 1|
|1|Distinct list and slow scan|Can we count without listing?|x,a,b → count up to x|Move x slider; see each multiple and 3 count terms change|Inclusive x, subtract common multiples once|
|2|Exact count and monotonicity|Which half can be discarded?|n,a,b,lo,hi → smallest x with C(x)>=n|Preset restarts; step/back/end/reset; before/test/after and full history retain decisions|All inputs valid; full trace, no truncation|
|3|Interval invariant|What if C(mid)=n at a nonmagical mid?|Fresh n=7,a=3,b=5 → retained interval|Choose, reveal, change; explanation clears on change|Fresh independent quiz, locale preserves choice and reveal|
|4|Count and first-true proof|How does the trace become Python?|Official signature → residue|Open exact source; copy/download/manual fallback|Modulo only after search; bounded integer operation cost model|

## Terms / dependency / first use
Magical / positive divisible by a or b / step0. Rank / position starting at 1 / step0.
Floor x//a / number of whole multiples through x / step1.
LCM L / smallest positive common multiple / step1; GCD / largest shared divisor /
step1 (local reminder step4); L=(a//gcd(a,b))*b follows by removing shared factors.
C(x) / distinct magical integers <=x / step1, locally step2 and step3.
Monotone / C never decreases as x increases / step2.
Invariant / answer remains in inclusive [lo,hi] / step2 and step3.
Binary search / repeatedly discard a proved irrelevant half / step2.
Modulo / division remainder / step0, step4. Euclidean GCD / remainder loop /
step4. Every jump target repeats the terms needed locally.

## Mathematics and independent checks
Baseline scans positive integers and uses OR once per integer, O(n*min(a,b))
time upper bound, O(1) integer cells. Count floors then subtract floor(x/L).
Wrong sum double-counts 6 for 2,3; wrong L=a*b fails for 2,4 at x=4.
Let U=n*min(a,b). The n multiples of the smaller divisor prove answer<=U;
answer>=1. C(mid)<n excludes <=mid; otherwise answer<=mid, but mid need not
be magical. With lo<hi, mid<hi, both updates strictly shrink while retaining
answer. At equality the sole candidate is the first threshold crossing, hence
magical and rank n. Never return early merely because C(mid)=n.
Python uses math.gcd and integer floor division. O(log(min(a,b))+log U) integer
operations, O(1) integer cells; values <=4e13 under official bounds. Big-int bit
costs are not claimed constant for unbounded input. Browser uses safe JS integers.
Teaching snapshot history O(log U) records, separate from submission O(1) cells.
Oracle: direct enumeration for small inputs; independently merge two multiple
streams for seeded bigger inputs; periodic block construction for maximum n.
Check every trace frame against enumerated answer/counts, not only endpoint.

## Exact tokens and states
Use ../style.css and ../common.js. Exact colors: --bg #0d1117, --panel #161b22,
--panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8,
--accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93.
Shared system type and radii (8/14px), spacing (8/12/16/20/24px); local 48px
controls, opacity 1 for disabled, 3px accent2 focus. No new palette, no motion.
Branches: count slider endpoints/interior; search initial/too-few/enough/terminal;
quiz unselected/selected/revealed/changed; clipboard copied/manual; storage denied.
Both languages for all branches, locale preserves all experiment and disclosure
state. Simulation explicitly separate from Python execution; no runtime fetch.
No loading/account/reconnect states applicable. P0/highest-return 20%: count
causality, retained interval/history, exact code, bilingual state and evidence.
P1: related concept anchors. P2: none. Deferred: arbitrary-input editor (presets
isolate conditions), autoplay (no benefit), Python runtime (static model sufficient).

## Validation and review boundary
Author tests execute canonical Python, independent oracles, small exhaustive and
seeded cases, boundaries, intermediate trace invariants; real Chromium both
locales, presets, reversible controls, quiz, copy/manual transfer, source/download,
320/390/736/1440, 200% magnification, keyboard/focus, local assets, contrast.
Tests accept OUTPUT_DIR. Screenshots must be opened for visual inspection.
Self-check is not separate review, real novice evidence, public release verification
or LeetCode acceptance. Separate reviewer must cold-walk frozen candidate under
six-dimension rubric (>=85, each>=3, zero required fixes) before release.

## Final author record
Candidate: 878-author-v1 (first frozen author candidate). During unfrozen authoring,
a long closed-select label clipped at 320px; the preserved red capture and diagnosis
are tests/evidence/draft-fit-failure.json and draft-select-320-en.png. Short labels
retain the complete numeric inputs, and the unchanged fit predicate now passes.
No prior independent review or acceptance exists to rewrite. Metadata required no
repair; complexity is a single string. Full evidence: tests/evidence/SELF-CHECK.md.
Canonical Python passed 8,198 checks. Core passed 8,350 traces, 67,317 frame checks
and 29,596 direct-count comparisons. Browser and focused accessibility checks cover
both locales; screenshot inspection is an author visual check, not learner data.
Root command `python3 -B scripts/register_leetcode_lesson.py 878 --validate-only`
returned exit 0, stdout/stderr empty; receipt: tests/evidence/preflight.json.
Candidate hashes: tests/evidence/candidate-sha256.json. Independent reviewer/run:
pending, no independent score assigned. Deployment/public verification: not done.
Next action belongs to the dispatcher: a separate cold review of this exact
candidate under the frozen six-dimension rubric; fixes become a new candidate.

## Review repair candidate — 878-r1-fix-v2

The historical review specs/reviews/878-review-1-e7e2fb2d.md requires 878-R1:
step 5's three code-transfer bullets were incorrectly bound to input labels in
both locales. Restore the existing mappings within the approved layout: derive
lcm and [1,8], map the failing mid4/count3 to lo=5, then map the sufficient
mid6/count4 to hi=6, preserving mid and explaining termination and final modulo.
This is a P0 teaching correction; reuse the existing tokens and layout. No new
feature, layout, canonical source, algorithm or language choice. P1/P2: none.
Deferred: existing arbitrary-input editor and autoplay decisions remain as above.

878-R1 is **fixed awaiting independent review**, not independently closed.
Focused regression rejects the old rendered preset labels and passes the restored
EN/zh explanations and hand-calculated transitions. New self-check evidence and
candidate hashes live in tests/evidence/r1-fix/. The original author evidence and
review result remain historical. No registration, publication or acceptance claim.
