# #940 · Distinct Subsequences II — author brief

Written before implementation. Category computing / LeetCode; stage university.
Audience: basic Python loops and sets. Outcome: count distinct strings rather than
position choices, derive the ending-letter invariant, implement the official callable.
Loop: hand-count aa → enumerate aba → group by ending → reversible trace → fresh
prediction → canonical code. Reuses approved lesson pattern, product/design review
and dispatcher adjudication in specs/reviews/leetcode-all-hard-design-review.md.
Follows WORKFLOW, UI-I18N-SPEC and all four lesson specifications. This author run
is not independent acceptance; no deployment or registry ownership.

## Official evidence
https://leetcode.com/problems/distinct-subsequences-ii/ accessed 2026-10-26.
Public page verified statement; public GraphQL GET verified codeSnippets/metaData.
Full capture: provenance/official.json. Python3 supported: class Solution,
distinctSubseqII(self, s: str) -> int. Count distinct nonempty subsequence strings,
order preserved, modulo 1,000,000,007. Lowercase English; 1 <= len(s) <= 2000.
Examples abc→7, aba→6, aaa→3. No empty official input, no mutation requirement.
No language exception. Empty prefix is internal state, not a legal test input.

## Exact token / state contract
Reuse ../style.css and ../common.js. Palette --bg #0d1117; --panel #161b22;
--panel2 #1c2330; --line #2b3547; --text #e8edf4; --muted #9aa7b8;
--accent #6ee7ff; --accent2 #ffb454; --good #7ee2a8; --bad #ff7a93.
System font, line-height 1.75, title clamp(28px,5vw,46px), 952px content,
24/16px gutters, 14px stage, 8px controls; 48px controls and solid disabled muted
text, 3px shared focus. No new palette, external assets or animation.
Initial/middle/end, hand hidden/shown, prediction pending/selected/revealed/changed,
copy success/manual fallback and locale preservation are applicable. Static page:
no loading/auth/reconnect. Highest-return 20% / P0: concrete causal set display and
reversible count ledger, proof and Python. P1: parity/accessibility evidence.
P2 none. Deferred arbitrary input (bounded six-preset teaching trace suffices),
automatic playback (no learning need), runtime Python service (unneeded complexity).

## Steps (five fields each)
|Step|Known|Single question|Input → sought|Action → observation|Conditions|
|---|---|---|---|---|---|
|0|String aa|Do two positions give two strings?|aa → distinct nonempty set|Reveal masks; two a choices collapse|Order preserved; equal strings count once|
|1|Subsequence definition|Why is enumeration costly?|aba → set baseline|Read 8 masks and 6 outputs, contrast wrong doubling|Tiny inputs only for exponential baseline|
|2|Concrete sets|What must be replaced on a repeated letter?|aba and five other presets → ending groups|Forward/back/reset/end show retained per-prefix ledger and exact sets|Small exact simulation, after each whole character|
|3|Ending-group invariant|Can it predict a new repeat?|abb then a → count|Select then reveal; choice change clears; locale preserves|Fresh case absent from presets|
|4|Derived recurrence|How to submit with bounded costs?|s → integer modulo M|Map total/ending/new to code; copy/download|Official lowercase length bounds|

## First-use concept dependencies
Step0 subsequence = delete positions without reordering; distinct = equal resulting
strings merged; modulo = remainder. Step1 mask = keep/delete choice at each position;
baseline = exhaustive correct comparison. Step2 prefix = processed initial segment;
ending[c] = number of distinct nonempty strings ending in c; total = sum of disjoint
groups; invariant = statement true after every processed character. Step3 restates
group and total locally; step4 restates variable meanings and modulus.

## Derivation and proof
For a: {a}. For ab: ending a={a}, b={b,ab}, total 3. Append a: candidates
{a,aa,ba,aba}, four distinct strings; old a={a} already lies inside these candidates.
Replace it, keep b, obtain 6. Injection: remove final c to recover a unique old
subsequence (including empty). Every old c-ending string is generated again because
its earlier part was a subsequence before this append. Other ending groups cannot
overlap. Thus new=total+1, total'=total-ending[c]+new; ending[c]=new.
Base empty prefix has all zero; induction and partition prove exact counts.
Wrong 2*total+1 on aa gives 3, but only {a,aa}: duplicated a. Baseline mask enumeration
O(n*2^n) time, O(n*2^n) stored characters worst case. Submission O(n) time,
O(26)=O(1) auxiliary modular integer cells, fixed modulus; snapshots/sets are tutorial
storage only and use O(n*2^n) characters across prefixes, restricted n<=4 here.
Modulo preserves addition/subtraction and Python % normalizes to [0,M).

## Evidence plan / limits
Independent mask oracle, per-prefix group invariants, exhaustive abc strings through
length 8, seeded random, maximum repeated and alternating inputs using separate
last-occurrence recurrence. Execute Solution callable. Browser exact source display,
native clipboard and per-attempt sentinel manual copy, download, all presets/locales,
endpoints/replay/prediction, storage denial/offline, native 200% zoom, 320/390/736/1440,
contrast, keyboard focus and related targets. Output paths via OUTPUT_DIR.
No real learner, independent review, LeetCode acceptance or public delivery claimed.
