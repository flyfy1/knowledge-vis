# #891 · Sum of Subsequence Widths — author brief

Author run: Codex, exact model identifier unavailable. Candidate 891-author-v1.
Status: authoring; independent lesson review pending. No acceptance or deployment.
Scope: only leetcode/891/. Reuse approved product/design pattern and dispatcher
adjudication in specs/reviews/leetcode-all-hard-design-review.md; no new layout gate.
Read WORKFLOW, UI-I18N-SPEC, explainer, Hard traces, review gates, rendered-state
contract and website-design SKILL before implementation. User scope overrides shared
registration/concept-map editing and delegation. Separate review is dispatcher work.

## Product and learning loop
Reuse the collection lesson, category computing (collection leetcode), stage university.
Reader: basic Python lists/loops, elementary arithmetic; no combinatorics assumed.
Job: compute widths by hand → see repeated enumeration → count extremum roles →
rewind a signed contribution ledger → predict a fresh contribution → map to Python.
Five sections fit this causal chain; no data structure narrative is needed.
Chinese title is an authored translation. Official source/access: public GraphQL and
https://leetcode.com/problems/sum-of-subsequence-widths/, accessed 2026-10-26.
provenance/official.json retains full statement, examples and observed codeSnippets.
Official frontend ID 891, internal ID 927; Hard, not paid. nums length 1..100000,
values 1..100000. Every nonempty position subsequence counts; return integer mod
1000000007. Examples [2,1,3] ->6 and [2]->0. Python3 interface observed:
Solution.sumSubseqWidths(self, nums: list[int]) -> int. Python is preferred and
faithful. No empty input, negatives, or mutation requirement in official statement.
Canonical uses sorted copy, preserving caller input. All official language snippets
are saved; no inferred interface or paywall access.

## Exact design contract
Use ../style.css and ../common.js unchanged. Exact palette: --bg #0d1117,
--panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4,
--muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8,
--bad #ff7a93. Shared system font, body line height 1.75, shared sizes and radius
8/14px. Local spacing only 8/12/16/20/24px. Reuse shared border/control roles;
raise controls to 48px, opacity 1 disabled text, 3px accent2 focus. No new colors,
shadows, motion, fonts or external runtime assets. Cards use shared panel2 and line.

## Steps (five required fields)
|Step|Already knows|Single question|Input / desired output|Action / visible observation|Conditions|
|---|---|---|---|---|---|
|0|max minus min|What exactly is being added?|[2,1,3] / seven widths|Reveal individual subsequences, reset / retained cards show 0+0+0+1+1+2+2=6|Nonempty position choices, order kept|
|1|seven widths|Why not enumerate everything?|same input / correct baseline|Read concrete choices and baseline / n binary keep/drop choices explain 2^n−1 and O(n2^n)|Tiny oracle only, n<=100000 rules it out|
|2|width=max−min|How many times does one position play each role?|sorted same array, then duplicates / signed per-position terms|Advance/back/reset/end, select preset restarts / completed ledger retained, current optional-position groups and before+term=after|Order does not affect extrema; ties owned by rightmost max and leftmost min|
|3|role counts|Can the rule transfer to a middle duplicate?|fresh [1,2,2,4], sorted index1 / net contribution|Choose then reveal, change clears / wrong rule explained|Question is one position, not total widths; independent of trace|
|4|partial contribution invariant|How does this become a faithful submission?|same [1,2,3] / executable Python|Inspect/copy/download exact canonical source / manual selection on copy failure|Modulo per operation, actual Python sorted/power storage costs|

## First-use dependency table
Subsequence / step0: delete positions without reordering; not necessarily contiguous.
Width / step0: max−min, singleton zero. Modulo / step0: remainder after division.
Baseline choices / step1: binary keep/drop per position; helper builds all subsets.
Sorted position i, n, a / step2: zero-based index in ascending copy, length, its value.
Optional choice, power 2^k / step2: k independent keep/drop decisions give 2^k subsets.
Role owner / step2: rightmost chosen sorted index for max, leftmost for min (ties too).
Contribution / step2: max-role value sum minus min-role value sum, may be negative.
Invariant / step2: after k positions ans is sum of first k signed contributions.
Step3 restates sorted index and role count; step4 restates a, power, ans and modulo.
Related links: #828 step2 counts roles of a character; #940 step0 contrasts distinct
value strings versus choices of positions. Inspect actual targets in both languages.

## Proof and simulation
Sorting permutes labeled positions. Subsets before/after sorting are in bijection;
restoring original order gives the original subsequence, preserving max and min.
Every subset has one largest sorted index i and one smallest sorted index j,
even when values tie. Fix i as maximum owner, choose arbitrary earlier positions:
2^i possibilities; later positions excluded. Minimum owner: 2^(n−1−i).
Therefore a[i]*(2^i−2^(n−1−i)); sum counts each width once. Prefix induction gives
invariant and termination at n. Hand [1,2,3]: −3,0,+9 -> partial −3,−3,6.
Wrong full-range-only rule gives 2, missing four units. Deduplicating [1,1,3]
gives 2 instead of 6; identical values at different positions remain separate.
Fresh quiz i=1 in [1,2,2,4]: 2*(2−4)=−4. Distractors 0 (middle cancels),
+4 (swap roles). Answer hidden until choice + reveal.
Simulation is local JS, not execution of displayed Python. Tiny complete traces,
no omitted transitions, exact small signed arithmetic, final modulo; Python keeps
residues throughout. Snapshot ledger is tutorial memory, not submission memory.
Python O(n log n) time; O(n) space for sorted copy, powers, sorting workspace.

## Priorities and branches
Highest-return 20%: visible role counts and retained signed ledger with bilingual
reasoning. P0: all five steps, complete Python, exact sources, tests, accessibility.
P1: related conceptual links. P2: none. Deferred: arbitrary input editor (presets
isolate one complication), animation (no added causal evidence), browser Python
runtime (static simulation adequate). No loading/network/account states in this
local lesson. Applicable states: initial/middle/end, duplicate/all-equal/singleton,
quiz unchosen/chosen/revealed/changed, copy success/manual fallback, storage denied,
locale changed with state preserved. Verify both languages in each.

## Validation boundary
Canonical Python vs independently enumerated oracle, exhaustive/seeded tests,
large boundaries; JS frame counts vs enumerated subset owners, source parity.
Real Chromium at 320/390/736/1440 and 200% zoom, all controls, presets, native
clipboard success/manual fallback with per-attempt sentinel, keyboard, focus,
blocked storage, offline assets, measured contrast, screenshots opened visually.
Tests emit only to OUTPUT_DIR when supplied. Self-check is not a separate review,
novice evidence, accepted submission, deployment or public verification. Freeze
candidate hashes and record root validate-only preflight before ready.

## Final author record (891-author-v1)
Authored and self-checked 2026-10-26, Codex author run (exact model ID unavailable).
Canonical Python: 3,638 cases, exhaustive/seeded and four maximum-length checks;
JS model: 3,385 traces, 21,848 intermediate frames checked against direct subsets.
Real Chromium browser and focused access tests passed both locales; all screenshots
were opened for visual author inspection. Combined CSS 11,720 bytes. Exact source,
automatic/native-fallback clipboard, download, offline and denied-storage checks
passed. See tests/evidence/SELF-CHECK.md and machine-readable result records.
Root `python3 -B scripts/register_leetcode_lesson.py 891 --validate-only` passed,
exit0, no output; receipt tests/evidence/preflight.json. Metadata complexity is one
string; no metadata correction or post-review mutation occurred. Source identity:
tests/evidence/candidate-sha256.json. Independent reviewer/run: pending; score none;
no learner trial, LeetCode acceptance, registration, public deployment or release.
This is one complete author candidate, ready only for a separate independent review.
