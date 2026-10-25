# #829 Consecutive Numbers Sum — author brief

Author run: Codex, exact model identifier unavailable. Candidate 829-r5 (supersedes author drafts r1–r4).
Author status: implementation planned; self-check pending. Independent lesson
review: pending, separate run required. No independent acceptance or deployment.
Approved reused product/layout: specs/reviews/leetcode-all-hard-design-review.md
and dispatcher adjudication; no new layout or universal renderer. Website-design
skill read at /home/songyy/Documents/agent-skills/website-design/SKILL.md.

Product verdict: reuse /leetcode/<id>/ lesson, collection navigation, shared locale,
source controls and five-section shell. User: basic Python reader with integer
arithmetic. Job: reconstruct a length-based counting algorithm and prove no missing
sequences. Category computing; stage university. Highest-return slice: one visible
staircase calculation, cumulative candidate ledger, and fresh transfer question.
P0: bilingual mechanism, exact tokens, faithful Python, all states, tests. P1:
reversible ledger and source fallback. P2: none. Deferred: arbitrary large-input
animation (would obscure the short derivation); backend execution, extra framework,
publication and registry changes (outside author scope).

Official contract verified 2026-10-26 via public LeetCode GraphQL; raw capture in
`tests/evidence/official-graphql.json`. Positive consecutive integers, singleton
allowed, return number of representations. n in [1, 10^9]. Examples 5→2, 9→3,
15→4. No zero/negative terms, empty sequences, modulus, or order permutations.
Python3 official snippet: class Solution, consecutiveNumbersSum(self, n: int) -> int.
Python, TypeScript, JavaScript and other interfaces observed in complete capture;
Python preferred. Internal questionId 856 differs from frontendId 829.

Learning loop: compute n=5 by hand → see baseline repeated sums → remove offsets
0…k−1 → test positive equal remainder → retain counted lengths → transfer n=18,
k=4 → map invariant to executable Python.

## Step contract (each has all five fields)

| Step | Already known | Single question | Input → desired quantity | Action → expected observation | Conditions |
|---|---|---|---|---|---|
|0|Addition|How many ways make 5?|n=5, candidate lengths 1,2,3 → valid sequences|Choose k; equal-base and offset boxes expose 5, 2+3, minimum 6|positive integer terms; length counts singletons|
|1|Worked sequences|Why not try every start and end?|n → count|Inspect baseline loops and exact n(n+1)/2 additions|baseline deliberately visits all endpoints; no early stopping|
|2|Length and offsets|When does one length work?|n,k → remaining R, start a, accepted count|Next/back/reset/end; change presets restarts trace; keep all tested candidates|guard k(k+1)/2<=n; divisibility plus positivity gives unique a|
|3|Invariant and guard|Does length 4 work for 18?|n=18,k=4 → decision and a|Choose, explicitly reveal, change choice to clear feedback|fresh independent exercise; answer hidden until reveal|
|4|Candidate rule|How does the submission implement it?|n → integer count|View/copy/download exact Python; manual fallback selects full source|integer-only arithmetic, official range; browser trace is simulation|

## Terms and dependencies

Step 0: consecutive = each next term one larger; positive = at least 1;
k = number of terms; a = first term; offsets = extra 0,1,… above a.
Step 1: start/end = smallest/largest chosen integer, running sum = accumulated
terms; baseline = straightforward correct reference. Depends only on addition.
Step 2 repeats k,a and defines T=k(k−1)/2 offsets, R=n−T remaining units;
remainder (%) = units left after equal sharing; invariant = count includes exactly
valid tested lengths. Guard minimum k(k+1)/2 defined locally. No undefined jargon.
Step 3 repeats remainder and variables. Step 4 repeats code-variable meanings,
integer // and %, time/space costs.

Simulation: presets 5,9,15,1,8,16,45, full traces including final failed guard.
Each frame is after one candidate test, or after the terminal guard check. No
sampling. Ledger is cumulative; back reconstructs all counts. Highlight only marks
current candidate; equations carry actual values. Ledger snapshots cost O(sqrt n)
in tutorial; canonical counters O(1). No timers. Locale changes text only, keeping
preset/frame/choice/reveal/focus. Feedback: unchosen, chosen unrevealed, correct,
incorrect, changed-after-reveal, reset. Copy: idle/success/manual fallback. No
loading/reconnect/async research states applicable in local static lesson.

Exact token contract: reuse ../style.css :root bg #0d1117, panel #161b22,
panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. Existing step alternating background
#0a0e14. Existing system font, 1.75 line-height, 952px content, 14px card radius,
8px controls, 24/16px gutters. Local overrides use these exact variables, 48px
controls, fully opaque disabled labels, 3px focus. No animation or extra colors.

Correctness: for k positive terms starting a, total = ka+k(k−1)/2. Each tested
length has at most one a. Guard ensures R>=k, so integer R/k is positive. Before
testing k, answer counts exactly valid lengths below k. Divisible remainder adds
exactly one; increasing minimum sum eventually excludes all later k. Wrong rule:
only odd lengths misses 4+5 for 9; divisibility alone accepts zero-start 0+1+2 for
3 at k=3. Boundaries: 1, powers of 2, triangular numbers, 10^9.

Validation planned: independent start/end oracle exhaustive small n; odd-divisor
identity independently for large seeded n; intermediate trace invariants and full
ledger reconciliation; canonical source/mirror/display/copy/download bytes; both
locales, every preset/control/choice, storage-denied, offline, real clipboard and
native fallback with fresh sentinel each time; widths 320/390/736/1440 and CSS
200% zoom, focus, reduced motion, forced colors, local network, contrast. All test
outputs accept OUTPUT_DIR so reviewers do not modify frozen evidence. Screenshots
will be inspected. Metadata preflight required before readiness. Independent
cold review, real novice results, real devices, native browser chrome zoom,
LeetCode submission acceptance and public publication remain unverified.

## Author completion — candidate 829-r5

Author status: implemented and self-checked, ready for a separate independent run.
Independent lesson reviewer/run: pending. Independent acceptance: not claimed.
No LeetCode submission, registration, commit, publication or deployment performed.

Implemented all five steps and seven presets. Canonical Python and exact mirror
match; locale changes preserve all experiments and the source is available offline.
Author checks passed: Python exhaustive 1..1000, 290 large/seeded/boundary cases;
exact baseline shown in HTML 1..100; JS trace all frames 1..1000; real Chromium
both locales, every preset and control, quiz combinations, copy success and four
native manual fallback transfers, offline/storage-denied, keyboard/focus/forced
colors, local requests, 14 locale/layout/zoom combinations, active navigation,
and measured contrast including disabled/correct/incorrect states. Reproducible
commands and evidence boundaries are in tests/README.md and tests/evidence/SELF-CHECK.md.

Self-check iterations corrected narrow nav pill compression, long-word heading
clipping at 200%, the official link's inherited 44px target, cramped nested zoom
padding, and a stale nav marker when returning to the header. Initial/second
browser failures are retained as historical author checks; these are not external
review findings or claims of reviewer closure. Final candidate identity is frozen
in tests/evidence/candidate.json. Screenshots were visually inspected, including
the revised 320px/200% event and stable header navigation marker.

Metadata gate: from repository root ran
`python3 -B scripts/register_leetcode_lesson.py 829 --validate-only`.
Result: PASS, exit 0, no stdout/stderr. Full command and result in
`tests/evidence/preflight.txt` and `preflight.json`. No registry/campaign changes.

Residual validation boundary: separate cold lesson review is required next.
Actual novice learning, real devices, native browser chrome zoom, public delivery
and LeetCode acceptance remain unverified. Review status lives only in these
records, never in the learner UI.
