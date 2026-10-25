# Independent structural review: disabled #854 adoption template

Reviewed in the original main checkout on2026-10-26. **Changes required before
structural approval: one narrow fresh-stage guard (854-ADOPT-R1).** The template
remains disabled; this is not final pin approval or dispatch authorization. No Pi
access, remote query, live operation, STOP, state mutation, activation or commit
was performed. Only disposable local Git fixture writes occurred during tests.

## Exact scope and identities

- `operate.py`: `dcc3b49b36850a0fca4e31d480b692c1d5f57c8fe57561896b592d64a425c1a1`.
- `test_preparation.py`: `3e22603ac6fd4f1168ff60c8f9d7db038ea3c9ea5e6aaf9e2d349fec1d69c4b7`.
- `pending-pins.json`: `6cba37cf0901b7cce8534a17390af84414851aa8bea98bddd7557308eb5f8f08`.
- Manifest: `35cb72e2f7e5003a9c33865d57ec678a190f61392c36f2ebd95962e64e53535d`.
- Immutable source/base: `27b9930daf25f9fb1651038bff1605969cb27f01` /
  `cf1a31fc75c66ca79e54513e050b7e0ba31b6e70`.
- Focused source-review reference: `47d97f6bf07dd1f4b8c7e1ca493ca3d21b3b9c7b`;
  this structural review is not a second lesson acceptance or proof of a remote push.

Read DESIGN, README, adaptation diff, complete operator, manifest, pending pins,
source-review reference, test implementation and validation receipts. Traced the
pinned campaign helper's save/publication/registration/native-evidence interfaces,
the reopened-entry transition and accepted guard, and importer ownership/checkout
validation. Used the codebase-design vocabulary: this is one local payload adapter
at existing helper interfaces; their ordering/failure semantics are part of the
interface. No broader framework is necessary for the finding below.

## Required finding 854-ADOPT-R1

`operate.py:175–178` enforces the fresh current problem ID and equality between
`run.role` and `current.stage`, but **does not enforce fix** or match the run's own
problem ID. A fresh current stage `review` with run role `review` passes. The reused
`verify_registered_resume` checks preserved problem records and candidate/history,
but does not close this gap: it accepts a preserved854 entry with phase=fix while
the current/fresh run says review. The operator can therefore report its required
ordinary854fix proof without establishing that stage. This is a guard-completeness
finding, not a claim the ordinary runner currently emits such an inconsistent state.

Independent local negative control (no process/network launch): constructed a
stopped `before` state with854 changes_required/phase=fix, then a running copy with
one fresh854 review run, same expected candidate, current854/stage=review, old IDs
empty, and exact-launch-alive=True. Actual `startup` returned that review run.
With the actual pinned registration helper, no registration prefix, and fixture
Git tree/head adapters, `verify_registered_resume` then returned:

```text
{'registration_commits': [],
 'agent_candidate': 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
 'prior_reviews_and_runs_preserved': True}
```

Minimal correction: in this adapter require current.stage=`fix`, fresh run.role=
`fix`, and fresh run.problem_id=expected, before counting the fresh run as startup
proof. Retain exact unchanged stopped-snapshot/live-launched-PID behavior and the
native/session/turn/history checks. Add negative fresh-review, fresh-author and
mismatched run-ID cases plus a valid fresh-fix case. Do not weaken the helper or
reinterpret the external source review as campaign acceptance. Author and root
were notified before this report. Status: open at the exact hash above.

## Verified safeguards and test evidence

Independently executed:

```sh
python3 -B specs/reviews/854-bridge-adoption-preparation-20261026/test_preparation.py
```

All **11 tests passed in1.972s**, including real disposable-Git adoption of the
actual payload. The extra negative control above is beyond those supplied tests.
No full live-dispatch simulation or actual runtime readiness is claimed.

The immutable source diff is exactly32 paths,25 under854 plus7 explicit supporting
documents, with no deletion. Old/new byte hashes, regular Git modes and protected
solution.py/python-code.js/core.js/lesson-entry.json match. Target checking requires
the entire854 subtree to equal its source base and exact old bytes/addition absence;
symlink/escape checks precede replacement. A single-parent commit must equal the
whole old tree with only the32 manifest replacements, preserving unrelated paths.
The focused review receipt binds candidate, accepted verdict, closed request IDs,
report hash and referenced evidence hashes. Review evidence is checked separately,
not silently expanded into the payload. Final remote identity remains pending.

Old accepted_guard runs before lesson writes. The durable prepared receipt records
old HEAD and complete old progress/ledger text before the first overwrite. Per-file
replacements and Git/state writes are not one atomic transaction; failures retain
partial files, actual state, receipt and owned STOP for inspection, and the existing
receipt forbids automatic retry. No rollback/reset or active-agent signaling occurs.
The expected-head transition preserves the prior accepted entry in maintenance,
all historical reviews/runs/rounds/candidate, exact984queue and other entries such
as995. Only854 is reopened to changes_required/fix; acceptance is never synthesized.
The actual publisher selection excludes that reopened status.

Completed996/1000 import receipt must have both completed IDs, exact receipt hash,
prior pushed ancestry and ledger preservation. Reservations must be imported or
cancelled and no lane checkout process may remain; these are rechecked at the locked
stopped stage. Queue/accepted identities are checked before STOP and after natural
completion. Publication must be pending-null,854 unreleased, and conservative
projected eligible/registration/reopen count below20. Before the first payload
write, the ordinary plan must choose854fix; no queue reprioritization is performed.

PINS_SHA and PREVIOUS_OWNER remain None; main refuses before reading inputs/helper
modules. Final source-review/push/previous-import/current-run/accepted/release pins
are null. Helper hashes precede execution; runtime/transitive static-module pins
are checked before importer imports. Owned STOP removal and ordinary continuous
restart retain exact startup PID, new thread/turn/native descendant, single worker,
max6/every20, queue984, state/ledger/reservation and exact push checks. The fresh-stage
gap above must be corrected without removing any of these checks.

Final enablement still requires actual post-import census and pins, exact reviewed
source push, stable ledger/acceptance/queue, a new exact-byte independent review,
and separate root authorization. Structural approval alone cannot supply any of
those facts or authorize dispatch.

## Independent follow-up: 854-ADOPT-R1 closed

**Revised disabled template structurally approved; no required findings remain.**
This replaces the initial verdict only for the exact revised operator below; all
pending-runtime/final-review/dispatch limitations still apply.

- Revised operator SHA-256:
  `0c8f5fcded88f98920cb3e128509889c580082e9fa80c2375bbde3433769728f`.
- Revised tests SHA-256:
  `d47a91518e98a88305dba6efeb6b41c27b60cfed519cb0ca04b3f1182d0ede87`.
- Pending pins and32-path payload manifest retain the hashes above; both
  PINS_SHA and PREVIOUS_OWNER remain None.

The only operator changes are the two startup guard lines. I reconstructed the
old bytes by reversing those two substitutions and obtained exactly the original
`dcc3b49b…` hash, so payload, history, ledger, locks, source-review, failure and
restart evidence machinery did not change. Startup now requires expected/current
problem854, current.stage=fix, run.role=fix and run.problem_id854. Thus the earlier
fresh-review counterexample is rejected before the generic resume helper could
accept it. Exact prelaunch stopped-state equality and launched-PID-alive guard
remain intact.

Read the preserved focused red log: the test fails on the original bytes for
fresh author, fresh review, wrong run problem and wrong expected problem; the
already-protected wrong current problem is also retained as a negative control.
The corrected test includes all five refusals plus valid fix and unchanged stopped
startup positives. Independently reran the complete supplied suite on the revised
bytes: **12 tests passed in1.901s**, including disposable-Git exact adoption and
history preservation. Reverified every file hash in the updated preparation
validation manifest. No Pi access or enabled invocation occurred.

854-ADOPT-R1 is closed for this revised disabled template. The final source push,
post996/1000 completion, live central854 acceptance/queue/ledger/reservations and
exact enabled pin bytes have not been supplied or reviewed. They must be captured
and independently checked before root separately authorizes a single dispatch.
