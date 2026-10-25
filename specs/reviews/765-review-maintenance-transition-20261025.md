# Independent maintenance review — reopen #765 text margin

Date: 2026-10-25. Reviewed helper:
`specs/reviews/765-evidence/mac-margin-maintenance-20261025/reopen.py`.
SHA-256: `375cabb0e2eccb6d543029a99679cea9b81e5f4df6f469af00256f5a039c0e38`.

**Approved at the source-review level, with the interruption limits below.
No actionable required code changes found.** This does not establish that the
currently running #780 author has stopped or that live maintenance preconditions
are already satisfied. The helper was not executed by this reviewer.

## Guards and state preservation

Compared this helper with the previously reviewed #239 navigation-reopening
transition and re-read the actual ownership, checkout validation, state-save,
and campaign phase implementations. It uses the same bounded transition, adding
only the diagnosis evidence paths from the explicitly supplied source revision.
The initial `git ls-tree` is read-only. Restored paths are confined to the two
#765 reports and that diagnosis directory, and their exact changed-path set is
checked before committing; no lesson or shared-policy path is imported.

The helper acquires runner and checkout locks before mutation. Validation requires
a clean isolated checkout, saved exact HEAD, no running agent records, and a
unique queue. Additional guards require stopped status, the owned
`root-765-fit-20261025` STOP, a null or completed current run, #780 specifically
at `review_pending`/`review`, and #765 at its exact accepted candidate with one
historical review. The 984-entry queue is preserved by full equality, not rebuilt.

The release guard requires no pending batch, 103 released entries, and the
specified latest successful release. The helper never writes the ledger and
checks its complete bytes remain unchanged. It preserves every other problem
entry, including all of #780, and all runs. For #765 it retains candidate,
reviews, author runs and round count; prior acceptance time/registration are
moved into the maintenance history rather than discarded. The only lesson-state
change is reopening #765 as `changes_required`/`fix` with the new repair request.

The real runner handles `fix` through its ordinary author path, freezes a new
candidate, then invokes a separate review. It does not treat this maintenance
record as acceptance. #780 resumes its saved review phase when the earlier repair
has been processed. The original full queue and normal continuous launcher remain
in use; no replacement queue, direct acceptance or publication shortcut is added.

## Repair meaning and verification boundary

The [repair request](765-review-mac-margin-repair-request-20261025.md) accurately
preserves the diagnosis: the original label is visibly complete but exceeds the
existing conservative 24px-reserve assertion on Mac. It selects a shorter,
equivalent English label without lowering that assertion or changing font,
layout, algorithm or Chinese meaning. The request requires the unchanged full
Mac suite, checks after the original failure point, bilingual preset inspection,
and a fresh independent review. This maintenance approval closes none of those
future verification duties and does not label the old screenshot clipped.

## Interruption and retry limits

The exclusive progress backup is flushed/fsynced, then its directory is fsynced,
before the durable prepared receipt. STOP remains in place through report import,
Git commit, progress update, and completed receipt verification. Only the owned
STOP is removed before invoking the existing launcher outside the ownership lock.

This is intentionally a one-time helper, not an idempotent recovery command:

- An interruption before commit may leave imported/staged documentation. Inspect
  it and the prepared receipt under locks; do not blindly rerun.
- After commit but before progress save, Git HEAD and saved state can disagree.
  STOP remains and checkout validation prevents an ordinary restart from silently
  adopting that mismatch. Reconcile from the durable backup and receipt.
- After progress/completion but before launch, reopening can be complete even
  though execution has not resumed. Inspect that boundary and launch separately;
  do not roll back the valid state transition because the launch command failed.

The final launch result alone does not prove a live resumed worker. The dispatcher
must verify its actual process and saved phase after execution. This review did
not inspect the Pi process, confirm its STOP boundary, alter policy/state/runtime,
run browser checks, commit, or deploy. Only this review report was written.
