# Independent review: #765 native Mac evidence handoff

Date: 2026-10-25. Reviewed one-time helper:
`specs/reviews/765-evidence/mac-candidate-handoff-20261025/handoff.py`.
Initial SHA-256:
`babc0611e669a6c2c37230ef6714af636e3d3bb364031faf590da4481a540adc`.

**Initial verdict: one narrow required guard correction before execution.**
The state transition itself follows the previously reviewed reopening pattern.
This review did not execute the helper, inspect live Pi state, or accept the
repaired lesson. The complete evidence report was not yet present at initial
source review, so its contents are not certified here.

## 765-HANDOFF-01 — P2: bind the six results to their intended checks

The helper currently requires six rows with `id == 765` and `exit_code == 0`.
That accepts duplicated rows or six unrelated successful checks and therefore
does not establish the intended original browser suite and supplemental margin
checks ran. The complete Mac runner defines these exact six identities:

- `preflight`: `python3 -B scripts/register_leetcode_lesson.py 765 --validate-only`.
- `test_solution.py`: `python3 -B leetcode/765/tests/test_solution.py`.
- `test_core.cjs`: `node leetcode/765/tests/test_core.cjs`.
- `test_browser.cjs`: `node leetcode/765/tests/test_browser.cjs`.
- `test_margin.cjs`: `node leetcode/765/tests/test_margin.cjs`.
- `test_rendered_contract.cjs`: `node leetcode/765/tests/test_rendered_contract.cjs`.

Require those unique names and recorded command vectors alongside the existing
zero exits and ID checks. This is a bounded identity guard for the stated six
checks; it introduces no new test, scoring rule, acceptance gate or infrastructure.

## State safety and preservation

The helper holds the runner and checkout ownership locks and validates a clean
isolated checkout at the saved exact HEAD with no running run records. Additional
guards require stopped status, the owned STOP, completed specific #765 fix run,
the exact pending #780 candidate and phase, and #765 blocked/done at the supplied
expected candidate. It checks the original historical review and author-run tail.

Manifest and parity receipts must name that same candidate, show no changed or
added fixture files, and cover 219 files. Every manifested digest is compared
with the stopped checkout using a resolved path constrained inside the repo.
Evidence imports are limited to the named report and its dedicated review
directory; changed paths are checked exactly. This does not import runtime or
shared policy changes.

The helper preserves all runs, the entire 984-entry queue and every other problem
entry, including #780's pending review. For #765 it retains all fields except
status/phase and the prior blocked detail; that detail is retained in maintenance
history. It changes blocked/done to review_pending/review and clears only the
completed current pointer. The original campaign then performs a fresh separate
review rather than inferring acceptance from Mac test results.

The release ledger must have no pending batch and 103 released entries. It is
never written by the helper, and its complete bytes are compared before saving
progress. Existing release and review history is not rewritten. The incomplete
212-file fixture failure remains historical evidence; importing a complete
same-candidate fixture does not justify calling that earlier run successful.

## Crash boundaries and handoff limits

The exclusive progress backup is flushed/fsynced and its directory fsynced before
the prepared receipt. The owned STOP stays present through evidence import, Git
commit, progress save, and completed receipt verification. It is removed only
afterward; the unchanged continuous launcher is called outside the ownership lock.

An interruption before commit may leave imported/staged evidence. An interruption
after commit but before progress save leaves a HEAD/state mismatch and STOP.
An interruption after progress save may leave a prepared receipt or an unstarted
launcher even though the state transition succeeded. Reconcile actual state,
backup, receipt and Git under locks; do not blindly rerun this one-time helper or
infer rollback from a launch failure. Verify the actual resumed process separately.

This helper review is not a review of the complete Mac result report, a claim
that its screenshots were inspected, or proof of successful independent lesson
review/publication. No helper, implementation, policy, state, commit or deployment
was changed by this reviewer. Only this report was written.

## Revision review and closure

Re-reviewed helper SHA-256:
`13b185451d9168ac6361279809df77efd54e42efb6a94fb1ad70551af2f4f410`.

**765-HANDOFF-01 closed. Revised verdict: approved for this exact helper hash;
no required findings remain.** The helper now requires exactly six records,
their name set to equal the six expected identities, and every recorded command
vector to equal that identity's intended invocation. Together, set equality and
the exact record count reject duplicate/missing names. The original lesson-ID
and zero-exit requirements remain.

The additional import consists only of the named missing-dependency diagnosis
report and its dedicated evidence directory. Both remain within review-document
scope and the exact changed-path assertion. This supplies the separate reviewer
with the retained incomplete-fixture diagnosis without changing runtime, policy,
candidate state history or acceptance criteria.

Read the completed local `checks.json`: all six intended names and exact commands
have exit 0. Its `candidate-parity.json` reports candidate
`3193aec4bdbbb13e094664e0de79cac6039f538a`, 219 checked files, and no changed or
added files. These observations support the handoff preconditions; this review
did not independently rerun those tests, inspect the full visual evidence, or
execute the helper. The main evidence report is assembled separately. The live
guards, interruption reconciliation and fresh-review obligations above still
apply; no lesson acceptance or public-delivery claim follows from this approval.

## Dispatcher execution

Executed the exact approved helper at the stopped candidate boundary on
2026-10-25. Source `9c5ad2c3a87c913ee806900381e64776d443f635` supplied only the
named reports/evidence. The [completed receipt](765-evidence/mac-candidate-handoff-20261025/handoff-receipt.json)
records central documentation commit `8d44249808b43d9d56ad26592d276443a9994649`,
the preserved author platform limitation and the progress backup. The 219-file
manifest and six exact successful commands passed the live helper guards before
state was changed. No served-content backup was created.

The dispatcher then confirmed PID 1063557 and its separate reviewer child 1063993
were live. Saved run `765-review-c582106ff628` is reviewing the candidate with the
Mac evidence attached; all 984 queue entries remain, #780 remains pending review,
STOP is absent, the ledger still contains 103 released entries and no pending
release. The central rendered-state contract is byte-identical to its pre-handoff
revision: the separately prepared local spec clarification has not been adopted
into this frozen review. Independent lesson acceptance remains pending.
