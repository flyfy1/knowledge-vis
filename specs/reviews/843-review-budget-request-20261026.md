# Required new-candidate request: 843-BUDGET-R1

Status: **confirmed diagnosis; repair and fresh independent review required**.
This is a new finding/request, not a rewrite of the earlier accepted review.
No queue reopen, STOP, lesson change or publication action is performed by this file.
Any runtime adoption must use a later separately authorized safe boundary after
the already-running import operation; this request must not interfere with it.

## Immutable affected identity

- Lesson: #843 Guess the Word.
- Candidate: `617cb7c7e49f533b46c66dc9a53e7c6cefd71cbf`.
- Canonical SHA-256: `dc0d1552f34cc429efa9f3ff12daf0c9c42f6ca5604d97ae64dc42aa2b7bff30`.
- Prior report: `specs/reviews/843-review-1-7f018940.md`, review commit
  `3cf37ae3fabd1e6c1cc8da54015b3569d085df75`, report SHA-256
  `909b409ecfceeef96c8d6c2ddbe75a5bad0b9c1a54fa81f7c96f8be7e93c6847`.
- Historical registration: `ad547b9105dd0b1164cb2774de27c65a4898e5c9`.
- Diagnosis and exact executed reproducer: [843-budget-evidence-20261026/README.md](843-budget-evidence-20261026/README.md).

## Required defect and bounded evidence

For the 22 unique six-letter words `group + c*5`, group in `a,b` and suffix in
`c..m`, with `allowedGuesses=11`, the actual canonical callable finds only 20 of
22 possible secrets. For `ammmmm` / `bmmmmm` it exits after ten calls with a known
singleton but without the required successful `Master.guess` call. Changing only
the loop bound to 11 in a **diagnostic** version finds every secret within 11 calls.
The 20-word adjacent pair family passes within ten; the larger 24-word family at
budget 30 takes at most 12 with the unchanged strategy when artificial truncation
is removed diagnostically. Full-history consistency, positional replies, legal
guesses and actual minimax choices are independently asserted.

The official generated-case qualification is retained. A no-information repeated
letter example alone is not claimed to be an official test. The structured family
has informative feedback and an all-secrets, within-budget minimax witness; this
is stronger finite evidence, without claiming actual hidden-test membership or a
universal minimax bound. Prior candid disclosure of ten-call limitations does not
close this original-task completion defect.

There is also a family-specific optimality argument: every first legal probe
partitions the 22 words into 10/10/1/1. In either remaining ten-word bucket, every
legal probe distinguishes at most one member from the rest. A worst branch needs
ten additional actual guesses, so eleven total is both necessary and sufficient.
The archive independently checks every first probe and all 968 relevant follow-up
partitions. This makes budget 11 an appropriate positive regression for this
structured feedback family; budget 10 is not a feasible all-secrets requirement
for that family. The 20-word paired family is the feasible budget-10 control.

## Scope of the requested new candidate

1. Repair the actual canonical strategy/termination behavior while preserving the
   official `findSecretWord(words, master) -> None` callable and documented
   `Master.guess` interaction. Support the original 10–30 case-budget contract;
   do not invent an `allowedGuesses` argument, read private judge data, or assume
   a non-documented budget getter. Manual GraphQL testcase metadata is not the
   submission signature. Do not present a blind `range(30)` edit as proven safe
   for ten-call cases. Explain the actual strategy's established limits.
2. Preserve the true-secret/history invariant, legal listed guesses, no input
   mutation and actual-success semantics: knowing one survivor is not a successful
   call. A budget/exhaustion state must never masquerade as found. Align canonical
   source, exact offline mirror, source/copy/download surfaces and visual trace.
3. Correct bound bilingual explanations and costs where behavior changes:
   `copy.js` keys `limit`, `map3`, `cost`; the `core.js` ten-turn loop; metadata's
   `G≤10`; and any rendered stopping/status text. Preserve meaningful warnings
   about heuristic/non-universal guarantees. Show why the chosen stop is faithful,
   rather than deleting caveats or claiming universal success without proof.
4. Add regressions at the real callable/spy-Master seam before the final fix:
   all secrets in the 20/22/24 paired families; legal ten-call fixtures and
   supported 11/30-budget fixtures; exact successful-call detection, counted calls,
   truthful feedback, candidate retention, singleton final guess, no mutation and
   illegal-guess rejection. Keep the original red result and one-variable
   diagnostic comparison as history; diagnostic variants are not canonical fixes.

Limit authored changes to the new #843 lesson candidate and its own tests/evidence
under existing campaign rules. Do not edit shared policy, other lessons, historic
reports, prior evidence, accepted entries or release records to make the finding
disappear. This request does not authorize a new framework or altered judge API.

## Fresh independent review and closure evidence

A fresh reviewer must inspect the new frozen candidate under the normal cold
walkthrough and full review gates, including official contract/interface access,
independent budget-sensitive canonical execution and algorithm/trace/locale/source
parity. It must close **843-BUDGET-R1** explicitly against the new candidate/source
hash and preserve the earlier 97.5 score/report as historical. Do not count the
diagnostic single-bound edit, unchanged filtering correctness, or a prose-only
disclaimer as closure. Record which budget/strategy guarantees are demonstrated
and what is not established; distinguish successful calls, inferred secrets and
budget exhaustion in both teaching and executable behavior. Normal UI/device
verification remains required for changed rendered states.

Until that review and authorized guarded adoption occur, the earlier local
acceptance alone is not sufficient evidence of corrected publication readiness.
