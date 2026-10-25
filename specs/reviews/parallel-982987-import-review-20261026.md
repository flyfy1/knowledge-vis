# Independent exact review: import #982/#987 only

**Approved for the bounded one-time import/resume operation; no required findings.** Reviewed operator SHA-256 `e0e530655dd21c90a95c5a0b0baa7f6b4e84fa96ae359c6cd72da3e34d5798f6`; pins SHA-256 `0d9dec18554ed18154ac5b4137371b08382bd217c290149fd048a46987387a01`. Execution remains subject to fresh live guards and separate root dispatch. No operator execution occurred in this review.

## Independent checks

Read the complete wrapper, tests, frozen pins and raw accepted-lane archives; traced the actually reused helper `f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698` and direct importer ownership, provenance, merge and state-writing code. Only selected helper functions are reused: the older execute/adoption/reopening paths are not invoked. `REOPEN_IDS=()` and the wrapper has no fetch/apply/add/commit/policy-transition path. Importer commits and ordinary registration continuation remain necessary, expected operations.

Independently ran **16 local tests, all passed in 2.476s**: [test log](parallel-982987-import-review-evidence-20261026/tests.log). These include hash-before-import refusal, the actual disposable gated runner startup/normal registration tests, wrong/stopped agent checks, publication-bound failures, foreign STOP preservation, both queue-drift seams and preservation of the first import when the second fails. No live operator, agent, browser or clipboard test was executed.

Decompressed both archived progress snapshots and verified raw-state, complete entry, history and report hashes against pins. Then reran the inspected read-only capture on Pi using `python3 -B -`. At **2026-10-25 21:56:53 UTC / October 26 05:56:53 SGT**, its complete resulting pins equaled the reviewed pins exactly: [capture](parallel-982987-import-review-evidence-20261026/capture.json), [comparison](parallel-982987-import-review-evidence-20261026/identity-comparison.json), [stderr](parallel-982987-import-review-evidence-20261026/capture.stderr).

| Accepted lane | Candidate | Registration HEAD | Retained verdict |
| --- | --- | --- | --- |
| #982 | `71cac9c38ae78f8ec6a477ca05c7781ab9377fd2` | `1086f89c87cb74432d9222deba3414138d4e1b2f` | 95; no required findings |
| #987 | `bed2e3d724fb024efd46c65ad1ba52fc5fa20f9f` | `5e97917082c9c4b71bb26567617345a98d9171c8` | 92.5; no required findings |

The capture verifies completed/clean lanes, exited runners and no lane checkout process, full run/session/result correspondence, `_reviewed` acceptance, shared-tree equality and exact reservations. Optional prose-density/#987 panning advisories are unchanged. It also verifies all runtime/policy/launcher hashes before executing imported repository modules, including the transitive static-version dependency.

Central remained runner1696215 at `7fd4aa457c318f053d7dc722fd63b3012bccb838`, author `854-author-679ce856a357`, with the exact ordered 984 queue and neither incoming ID started. Release ledger SHA-256 is `163b32ba940e02a8f17c1ccaf5e9a9f6dfcd606491007d096faa9b971b45eda6`; a separate read-only check confirms **138 released identities**, pending=null and final successful release `84dfd908f5c94592918eb4ecb72eb87e` with 20 verified lessons. `_reviewed` presently yields zero eligible lessons; incoming982/987 gives **2 < 20**, no reopened IDs or registration prefix. The old 18+2 refusal remains historical evidence, not a waived bound.

## Safety and preservation assessment

- Exact current/head/runner and completed release identity are checked twice before exclusive owned STOP creation. Queue length and canonical hash are rechecked immediately before STOP and after the natural wait. No signal interrupts the live stage; checkout/state ownership requires a clean ordinary stopped boundary before imports.
- Lane identities are revalidated at the boundary and immediately before each import. The existing deep importer takes central/lane state and checkout locks, checks immutable acceptance/candidate fingerprints, preserves author/reviewer ancestry and exact lesson bytes/modes, and permits only lesson/report/evidence plus registration paths. The wrapper checks unrelated reservations, old campaign metadata/problems/runs/import history and ordered queue preservation. Original acceptance scores/history are copied, not reassigned.
- The release lock covers both imports and the stopped exact push. Ledger bytes must remain identical. Sub20 eligibility is recomputed before STOP, at the boundary, after imports and before resume, including possible ordinary registration prefixes; pending releases and same-digest pointer refresh refuse. There is no flush, reduced threshold or direct publication path.
- Exact merged HEAD must be pushed and remotely compared before owned STOP removal. The existing launcher resumes continuous/full984/max6; runtime arguments must retain every20. Startup tolerates only the unchanged stopped snapshot while the exact launched PID is live, then requires a fresh run/session/turn and native descendant. Ordinary registration commits and state effects are validated against the planned prefix; any resulting candidate HEAD is pushed exactly. Historical entries/runs and unrelated metadata remain intact. This is continuation proof, not a publication claim.

## Operational limits

The current #854 phase can advance before dispatch; frozen identity refusal must be honored, with explicit fresh preparation instead of silent repinning. The completed current stage may change the next phase at the natural boundary; the actual stopped plan determines ordinary registration/review continuation. Keep all sub20 and ownership checks unchanged.

Partial imports, merge commits, copied evidence, importer receipts, updated reservations and checkpoints are intentionally retained. Failure after a first import must not roll it back or blindly retry the pair. Existing operation receipts refuse re-entry. A caught post-launch failure restores a missing owned STOP without replacing a foreign STOP or signaling the worker. Hard process loss around spawn/STOP removal is not an atomic transaction; inspect actual PID/state/receipts before recovery. This review does not claim automated crash recovery.

Only local review artifacts were written. No Pi STOP, import, policy/source adoption, state mutation, commit, push, launch or publication was performed by this review.
