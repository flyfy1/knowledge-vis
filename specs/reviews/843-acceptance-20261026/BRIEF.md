# #843 Guess the Word — author candidate r1

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
Python; ten-call conservative cap, no hidden access to secret or budget.

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
Both locales: hand hidden/revealed; each preset initial/middle/terminal; prev/next
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
