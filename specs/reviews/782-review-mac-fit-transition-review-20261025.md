# Independent transition review: #782 Mac selected-label repair

Date: 2026-10-25. Reviewed helper:
`specs/reviews/782-evidence/mac-fit-reopen-20261025/reopen.py`.
Exact SHA-256:
`c485d551beb13d395e9ca9318f635cd574d073da5461679c255b43689a98fa74`.

**Approved at the source-review level; no actionable required code changes
found.** This approval does not establish that the currently running review has
finished. Execution must wait for the actual stopped boundary and successful
guards. No helper execution or Pi inspection was performed by this reviewer.

## Review completion and repair scope

The helper holds the central checkout and runner locks, validates the clean saved
HEAD and full unique queue, and requires stopped status with the owned
`root-782-mac-fit-20261025` STOP. It identifies the exact completed
`782-review-85be323f7d0c` run, candidate
`0e53a2131353accc11a5ef746c5eba164efb14e4`, first review/round, and original
report path. It allows only accepted/register or changes_required/fix, matching
the actual campaign phase transitions. The runner checks STOP before its next
registration or fix step. A blocked or unexpected result fails these guards.

The source import is confined to the three named #782 reports and two dedicated
#782 evidence directories. All must be absent in central, and the exact changed
path set is checked before commit. No lesson implementation, shared policy,
registry, or unrelated report is imported. The supplied source revision is
explicit operator input and is retained in the receipt.

The [repair request](782-review-mac-margin-repair-request-20261025.md) explicitly
supplements every required finding in the original independent report; the helper
checks that reference and finding ID before changing `prior_report`. It does not
replace the historical report or pretend that the Mac issue was its only finding.
The accepted or changes-required outcome, scores, candidate, round count and all
review/author records remain intact. The complete previous entry is additionally
recorded in maintenance history.

The selected repair preserves the original width predicate, font/layout, meaning
and impossible-result value, with concise `Four-corner failure: −1` copy. Unlike
the earlier #765 conservative-margin case, the supplied independent diagnosis
records an incomplete visible `−1` in the closed control. This transition review
read that diagnosis but does not claim a fresh browser reproduction of it.

## State, lanes and publication

Only #782's status, phase and next report pointer change to
changes_required/fix/the combined repair request. The full 984-entry queue, all
runs and all other problem entries remain equal to their saved values. The
completed current pointer is cleared and the new documentation commit becomes
the saved HEAD. Normal continuous execution then creates a new fix candidate
and invokes a fresh separate review; this helper neither accepts nor registers it.

The ledger must have no pending release and 103 released entries. It is never
written, and full-byte equality is checked before progress save. The #803/#805
reservation records must identify started, nonpublishing lanes with neither ID
started centrally; their bytes are also preserved. The helper does not acquire
their worktree locks, edit their files, or stop/restart their processes.
Reservation status is a historical guard, not fresh evidence of lane liveness.
The dispatcher still monitors their actual handles and central queue approach.

Pi author self-tests are explicitly distinguished from pending Mac verification.
The request requires a repaired-candidate full Mac recheck and fresh independent
closure before dispatcher closure or main import. This helper provides no such
proof itself. Attach exact repaired-candidate Mac evidence before treating the
finding as closed; never require the Pi author to claim a host it did not test.
The unchanged every-100 publication gate remains in force.

## Interruption and recovery

The exclusive progress backup and directory are fsynced before the prepared
receipt. The owned STOP is retained through import, commit, progress save and
completed-receipt verification. It is removed only before invoking the original
launcher outside the ownership lock.

An interrupted import can leave staged documentation; a committed import before
progress save can leave HEAD/state disagreement; a saved transition before launch
can leave valid repair state with no resumed process. Reconcile Git, progress,
backup, receipt and actual handles under locks instead of blindly rerunning this
one-time helper or rolling back because launch failed. Preserve the independent
lanes throughout that recovery. Verify the actual resumed central process and
its #782 fix phase after execution.

Only this review report was written. No shared policy, implementation, state,
Git history or production content was changed by this reviewer.

## Dispatcher execution receipt

The separately reviewed helper was executed only after the exact original review
completed, central state was stopped, and both original runner/reviewer processes
were absent. Source `8529e08052e4cc3b7cd8cfa3fc3290d3a387d89d` was imported from
central review HEAD `b517b762f7e31a0d701f3ab5879bca14229c381f`, producing
`cbd91d8e377c8d994e1f2e87044530115304d80c` at 2026-10-25T12:33:06Z.
The [completed durable receipt](782-evidence/mac-fit-reopen-20261025/reopen-receipt.json)
retains the original 96.25/100 accepted review, unchanged histories and queue.

Observed actual resumed runner PID 1099190 and fix-author child PID 1099481;
current run `782-fix-c54aaacb630f` started at 12:33:10.701760Z. The owned STOP is
absent. Existing #803 and #805 runners remained live and reached independent
review runs `803-review-627c02c2a810` and `805-review-094f101326af` respectively.
This records executed handoff and live repair work, not completed repair, Mac
closure, lane acceptance/import or public publication. Shared policy was unchanged.
