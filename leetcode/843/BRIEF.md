# #843 Guess the Word — budget repair candidate r2

Author run: Codex; exact model identifier unavailable. Independent review: pending;
no acceptance, submission, publication or actual learner outcome claimed.
Category: computing / leetcode; stage: university. Reader: basic Python loops,
lists, functions. Product verdict: reuse approved collection lesson pattern from
specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication.
Scope: one static bilingual lesson, local controls and local evidence only.

Official source: https://leetcode.com/problems/guess-the-word/ verified 2026-10-26
via public GraphQL (raw capture tests/evidence/official-graphql.json). Python3
selector supplies Solution.findSecretWord(self, words: List[str], master: 'Master')
-> None. Master.guess returns positional matches, -1 for a non-list guess. One
must actually guess the secret within allowedGuesses, which is not an argument.
Unique lowercase words: n=1..100, length 6; secret in list; budget 10..30. Examples:
acckzz / [acckzz,ccbazz,eiowzz,abcczz], 10; hamada / [hamada,khaled], 10.

Learning loop: calculate six positional comparisons → retain consistent words →
compare reply groups → replay minimax choices → transfer invariant → code.
Outputs: visible comparison positions, reply buckets, cumulative guess ledger,
exact remaining candidates, prediction feedback, canonical Python source.

## Steps (five fields each)
0. Known: six letters and equality. Question: what does a reply count? Input:
acckzz/ccbazz; output 3 positions. Action: reveal/hide comparison; observe columns
2,5,6 only. Conditions: same positions, not shared letters or rearrangements.
1. Known: match score. Question: which secrets remain? Input: same four words,
guess ccbazz, reply 3. Output acckzz. Action: inspect fixed before/after values.
Conditions: secret belongs to list and replies are truthful. Baseline: scan original
list; compare 100 calls versus budget. Counterexample: equal score is required,
not score at least reply; common letters alone are insufficient.
2. Known: exact filtering. Question: which legal guess leaves least uncertainty
in its worst reply? Input: candidate set; output bucket counts, chosen probe and
filtered set. Action: presets restart; forward/back/end/reset show complete round
snapshots and retained history. Conditions: one-step minimax, fixed deterministic
ties, not an optimal decision tree or guaranteed ten-call solver for all lists.
3. Known: filter invariant. Question: which words survive a fresh reply? Input:
[aaaaaa,aaaabb,aabbbb,bbbbbb], guess aaaabb, reply 4. Output aaaaaa,aabbbb.
Action: predict then reveal; change selection clears feedback. Conditions: no
answer or derived highlighting before reveal; locale retains selection/reveal.
4. Known: buckets/filter. Question: how is this submitted and what does it cost?
Input: source; output None, Master calls. Action: source/copy/manual fallback/
download. Conditions: Python official API; browser trace simulates, never executes
Python; continue while candidates remain, succeed only on reply 6; no hidden
access to secret or budget. Failed probes strictly shrink C, so G≤n; no universal
case-budget guarantee is claimed.

## Term dependency table
Positional match: step0, equality at the same index. Candidate: step1, word
consistent with all replies. Invariant: step1, fact retained after every round.
Bucket: step2, candidate group sharing a reply to one probe. Worst bucket: step2,
largest non-success group. Minimax: step2, minimize that largest group.
Every step restates its needed terms locally. Related deep links: #4 step2 and
#37 step2 (existing lesson anchors), for elimination and candidate consistency.

## Design contract
Exact shared tokens from ../style.css: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454,
good #7ee2a8, bad #ff7a93. System fonts, shared size/spacing/radii. Local CSS
only raises hit areas to 48px, restores disabled legibility, wraps words/tables.
No new visual framework, external assets, ambient motion, service or timers.
P0/highest-return: causal numbers, exact filter, reversible buckets, bilingual
states, original Python tests and actual browser evidence. P1: source parity,
keyboard, clipboard recovery, constraints and adversarial limitation. P2: none.
Deferred: arbitrary word editing (input validity obscures core experiment), auto
play (manual rounds expose causality), global optimal strategy search (exponential).

## State/verification contract
Both locales: hand hidden/revealed; each of nine presets initial/middle/terminal;
known singleton before success, actual success and budget exhaustion; prev/next
disabled endpoints; prediction unselected/selected/revealed/changed; copy success/
manual recovery. Locale retains all algorithm and exercise state and focus.
Preset resets trace only; reset restores trace only; separate exercise reset.
No loading/network/reconnect state: runtime fully local. Tests accept OUTPUT_DIR.
Numerical checks use independent positional oracle, exhaustive small dictionaries,
seeded lists, official examples, intermediate candidate invariants, budget stress.
Browser checks include widths 320/390/736/1440, zoom, local requests, keyboard,
blocked storage, both copy paths with per-attempt sentinels and exact byte parity.
Self-check and candidate manifest will be stored locally. Independent cold review
is still required and is outside this author run.

## Author completion record
Author self-check complete; independent review pending. Evidence: SELF-CHECK.md,
tests/evidence/*-results.json and preflight.json. Candidate identity: candidate.json.
Metadata preflight `python3 -B scripts/register_leetcode_lesson.py 843 --validate-only`
passed with exit 0 and empty stdout/stderr. No registration, publication, commit,
agent delegation or independent acceptance occurred.

## 843-BUDGET-R1 repair boundary (2026-10-26)

Reuse the existing controls, layout, colors and locale state ownership. This is
a repair of the independently requested stopping/status behavior, not a new
layout or feature platform. The archived request supplies the defect/adjudication
boundary; fresh independent lesson review is pending. P0/highest-return: make
the missing actual call, retain exact history and probe choices, distinguish
known/success/exhausted in both locales, and preserve source transfer. P1:
paired-family preset evidence in the existing selector. P2: none. Deferred:
universal decision-tree optimization (exponential and outside this repair);
real hardware and actual judge submission (no such evidence is available).

New bounded input/output: 20/22/24 words formed as a/b plus five copies of
c…l / c…m / c…n. Every secret tested at budgets 10/11/30, observed maxima
10/11/12. The 22-word budget-10 control is deliberately infeasible for all
secrets, not an official-test claim. After ten calls bmmmmm is known; an
eleventh actual call is necessary. Show this before declaring success. Only
the teaching simulator receives disclosed budget data; the canonical official
Python callable remains (words, master) -> None. The source has no arbitrary
10/30 cap and reads no judge state. G≤n proves termination under truthful
replies, not feasibility for every hidden case budget or global minimax optimality.

The original r1 self-check below/elsewhere remains historical. New checks and
red/diagnostic/green evidence are in tests/evidence/budget-r2/; SELF-CHECK.md
appends the finding mapping. candidate.json freezes this new candidate, not a
change to the historical acceptance or report.


## 843-R2-SELECT01 repair boundary (2026-10-26)

Build verdict: reuse the reviewed scenario selector and existing hint typography.
The independent report `specs/reviews/843-review-2-4d2abc1d.md` explicitly permits
an adjacent wrapping selection readout. This is a bounded readability repair,
not a new experiment or layout. P0/highest-return: expose the complete selected
word count, budget and control purpose in both locales at 320/390px. P1: retain
locale/round state, source transfer and budget regression checks. P2: none.
Deferred: historical non-required advisory 843-R1-A01 (extreme-zoom fragmentation
in other readouts), physical-device and browser-chrome zoom verification.

`presetSelection` repeats the exact localized selected-option text immediately
after the native select. `aria-describedby` associates it with the control;
normal whitespace and overflow wrapping allow its height to grow. It derives
from the same preset index on every render and locale change. Existing `.hint`
font/color/spacing tokens apply; no new colors or type sizes. The native selected
text can remain clipped, but the full adjacent value remains available, as the
review requested. No option semantics or algorithm state changed. Tests and the
new frozen candidate are author evidence; independent closure remains pending.
