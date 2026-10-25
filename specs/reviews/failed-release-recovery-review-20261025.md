# Independent review: failed release supersession

Date: 2026-10-25. Reviewed `/tmp/supersede-failed-release-20261025.py`
(50 lines at review time), `scripts/leetcode_publish.py`, and the implementations
of `ownership`, `validate_checkout`, and `save_state`. The recovery helper was
not executed, including its default mode. No Pi state or public content was
inspected or changed by this review.

## Verdict

**Changes required before applying the helper.** The basic recovery approach
preserves the publisher's acceptance and public-delivery gates. Two narrow gaps
remain in proving the intended replacement batch and durable recovery evidence.

## Required findings

### FRR-01 — P1: prove the next publisher selection is the failed batch

Helper lines 23–29 validate exactly the old pending IDs, but do not validate the
other currently accepted entries or derive the next publisher selection. The
publisher at lines 424–447 derives all prospective acceptances, removes receipts
with unchanged digests, and selects the first 100 eligible IDs in queue order.
The helper's `len(queue) == 984` and checkout validation do not prove that this
selection equals `pending['accepted']`.

For example, an earlier queued lesson newly accepted since the failed release
would displace one of the old 100, while the helper's current assertions still
pass. The publisher would then reverify a different batch. Because the old
batch's registry and lesson files are already materialized, a displaced lesson
can remain publicly discoverable without being included in that retry's browser
checks. This does not fabricate a successful receipt for the omitted lesson,
but contradicts the explicit recovery claim that all old 100 are restaged and
reverified together.

Before clearing pending, compute the original publisher's prospective and
eligible sets using the same `_reviewed` gate and digest rules, without mutating
the live ledger. Require that `eligible[:100]` has exactly the failed pending
membership, and bind the planned selection and repaired HEAD to the receipt.
If retaining old order is intended, validate that too. Keep the repair-and-retry
handoff pinned to that verified state; do not resume unrelated campaign work
between this check and the original publisher retry. A mismatch should stop for
inspection, not silently select a different batch or weaken the publisher.

### FRR-02 — P2: make backups durable before the prepared receipt

Helper lines 41–43 close the two exclusive backup files but never `fsync` their
contents. `save_state(receipt, ...)` subsequently fsyncs the receipt and parent
directory. Directory fsync does not substitute for flushing the backup files'
data. A power loss can therefore leave a durable `prepared` receipt referring
to incomplete backups after the ledger itself has been durably replaced.

Flush and fsync each completed backup before publishing the prepared receipt;
retain exclusive creation and verify or record their content hashes. Ensure the
directory entry durability follows those file flushes. This is a bounded fix
to the claimed recovery record, not a request for a new transaction framework.

## Invariants that are preserved

- The helper acquires the runner, checkout, and release locks. Checkout validation
  requires a clean isolated branch, the saved exact HEAD, unique queue IDs, and
  no running agent records. Additional assertions constrain the stopped state,
  expected failed release ID, target repo/root/URL, and original released IDs.
- `_reviewed` supplies the original independent review gate: accepted scores,
  no open required findings, completed separate reviewer sessions, tracked
  immutable report, candidate ancestry, whole-lesson tree equality, and exact
  reviewed registration metadata. The helper does not replace this with a title
  check or merely trust `accepted_local`.
- Listed repairs must have new accepted candidates. Other pending lessons must
  retain both their candidate and digest. Stage paths and production paths use
  the publisher's containment and symlink checks; every recorded staged/public
  hash is compared before mutation.
- Acknowledging the observed physical registry hash is consistent with the failed
  batch having already been applied. The helper neither writes production bytes
  nor marks them publicly verified. The old pending record is retained in full
  under `superseded_pending`, annotated as failed verification. `released` and
  successful release history are explicitly kept unchanged.
- The original publisher will stage from accepted candidates, apply files, verify
  public hashes, and execute its unchanged browser checks before recording a
  successful release. Supersession does not itself close the title findings,
  register acceptance, or establish delivery. Fresh independent repair reviews
  remain a prerequisite.

## Crash boundaries and operational handoff

Before the ledger replacement, a crash leaves the original pending batch active.
After the ledger replacement but before progress or completion-receipt updates,
pending is cleared and the physical registry baseline is updated, while the old
pending metadata remains in the new ledger. Neither boundary records successful
delivery. After both state writes, only the final receipt may remain `prepared`.

The helper is deliberately not automatically resumable: existing backup files
or `pending = None` cause a fresh invocation to fail. The original publisher
also does not inspect this maintenance receipt. Accordingly, a `prepared` receipt
must trigger a manual locked reconciliation of actual ledger/progress against
the backups and intended update before campaign restart. Document this handoff;
do not treat a nonzero helper exit as proof that nothing changed, blindly restore
the old ledger after a subsequent successful publish, or rerun the helper without
inspecting the boundary reached. The helper should only report supersession
complete after rereading its completed receipt and intended state.

The next original publisher call intentionally removes the superseded stage as
an orphan before staging new bytes. Its metadata/history survives in the ledger;
this agrees with the user's request not to retain old production content. The
helper's local-root hash checks establish physical materialization only. Public
delivery remains unproven until the original public gates pass.

## Verification limits

This was a source-level independent review, not a live-state audit or a dry-run
result. No acceptance rubric, publisher checks, runtime files, recovery script,
campaign state, production content, or Git history was modified. The two required
findings should be rechecked against the revised helper before application.

## Revision review and closure — 2026-10-25

Re-reviewed `/tmp/supersede-failed-release-20261025.py`, SHA-256:
`6cce12db06dc33c8485f7410a4beaf55d27a5de1130a481406132658814411c5`.
The helper was read, not executed. The earlier findings remain above as history.

**FRR-01 closed.** The helper now derives the original publisher's full
prospective set, invokes `_reviewed` for it, and derives eligible IDs using the
same queue-order and digest rules. It requires the entire eligible list to equal
the old pending dictionary's ordered 100 IDs. This is intentionally stricter than
checking only the next first 100: any additional eligible lesson also stops this
one-time recovery. It also requires the full queue to equal the saved failed-run
queue. The prepared receipt identifies the repaired HEAD and the durable ledger
backup retains the exact ordered pending selection. No unchanged-digest refresh
affects this eligibility calculation. Keep the previously stated pinned-state
handoff through publisher retry.

**FRR-02 closed.** Each exclusive backup is now flushed and fsynced while open;
the parent state directory is then fsynced before `save_state` publishes the
prepared receipt. That establishes the required ordering for backup data and
directory entries before the durable ledger replacement.

**Revised verdict: approved at the source-review level; no required findings
remain for this exact script hash.** Live preconditions and the independently
accepted lesson repairs still must be satisfied. The prepared-receipt crash
reconciliation and delivery limits above remain applicable. This approval neither
executes supersession nor certifies current Pi state or public delivery.
