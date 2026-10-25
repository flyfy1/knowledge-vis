# Independent review: #803/#805 parallel launcher

Date: 2026-10-25. Reviewed
`specs/reviews/parallel-803805-evidence-20261025/launch.py`.
Final SHA-256:
`3743973d6b3479e930034e344454a314bd93e207aa43bb09964759f82091f6d9`.

**Approved for this one-time, dispatcher-supervised launch. Both required
findings from the initial revision are closed; no required findings remain.**
This source review does not execute the launcher or establish live startup.

## Initial findings and closure

Initial helper SHA-256:
`9e775d01f6f827cc9282ac7bad6a73caa0bd5ae0dc78e4e327b814c65fa29e2f`.

1. **PAR-01 — P2, startup observation race.** `Popen(nice …)` can return before
   the child has executed Python. Immediately counting Python campaign workers
   can therefore reject the valid first launch and leave a partial two-lane plan;
   the original last child was never observed. **Closed:** the revised helper
   saves the spawned PID, then observes that exact process for up to 45 seconds.
   It requires the expected script and repo/state/ID/port arguments, no publication
   arguments, niceness at least 10, and actual running single-ID progress with
   that current problem before marking it started or attempting the next lane.
   Timeout preserves the spawned receipt and explicitly forbids blind restart.
2. **PAR-02 — P2, destructive reservation update.** Reopening the prepared receipt
   with `w` after spawn could truncate the only reservation record during an
   interruption. **Closed:** updates now write an exclusive temporary file,
   fsync it, atomically replace the receipt, and fsync the parent directory.
   Initial exclusive receipt creation also fsyncs the parent directory. The
   durable spawned receipt contains the PID before startup observation.

## Isolation, resources and acceptance

The fixed base, current central HEAD/state, policy hash, active #782, full queue,
unstarted #803/#805, and lack of STOP are checked before mutations and again
before each lane. Existing recent reservations must already be imported. The
plan-specific lock prevents duplicate execution of this helper. Preflight rejects
existing lane paths, states, reservations, branches and occupied preview ports.

Each new branch/worktree starts from the immutable base, excluding central
uncommitted author work. States and preview ports are separate. The helper does
not write central source, progress or release ledger; Git worktree metadata,
new branches, new lane directories and reservation files are its intended outputs.
The old #248 stopped lane is neither adopted, restarted nor removed.

The process census requires only the central campaign initially and one additional
campaign before the second launch; the plan creates exactly two extra workers.
Both use niceness 10, which is verified after exec. Initial available memory must
exceed 1 GiB. These are a bounded worker-count/priority guard and memory preflight,
not a hard memory limit or a throughput guarantee. Resource usage still needs
ordinary dispatcher monitoring after launch.

Each lane invokes the existing `leetcode_campaign.py` with exactly one ID and
six review rounds. It uses the normal author/fresh independent reviewer/fix and
registration pipeline. No publication arguments are supplied, and observed argv
must also lack them; the existing campaign enables publication only with explicit
publication target arguments. Startup cannot create an accepted lesson or advance
central release counters.

## Coordination and recovery limits

The [launch plan](parallel-803805-launch-20261025.md) correctly states that central
does not interpret these reservations. The helper is not a distributed scheduler:
its lock is specific to this launch, not a global lock shared by every possible
operator. Approval assumes this is the sole lane launcher during the operation,
as stated in the supplied current context. The dispatcher must monitor central,
request its ordinary STOP before it begins either reserved ID, and import accepted
lanes only at the validated safe boundary with unchanged shared policy. If central
already starts an ID, do not force-import or rewrite state to hide that collision.

A crash can leave a prepared reservation before worktree creation, an incomplete
worktree/state setup, or a spawned worker before the durable PID update. In the
last window, the prepared record still identifies its unique repo/state: inspect
actual process argv, logs and state before any recovery action. After the first
worker starts, a changed central phase or failed second validation may deliberately
leave just that first worker running. Preserve it; do not rerun the whole helper,
delete its paths, or restart merely because an observation timed out.

The `runner.pid` file is convenient but the atomic spawned reservation and actual
process/state inspection are the recovery evidence. If a worker exits before
observation, the helper fails without marking it started. If it exits immediately
after observation, the saved started receipt is historical, not perpetual proof
of liveness. Verify actual handles after return and continue monitoring.

Reviewed the helper, launch narrative and actual campaign startup/phase contracts.
The dispatcher supplied separate local function-level self-check results; they
are supplemental and were not substituted for source review or live startup.
No Pi command, launcher execution, mutation, publication or commit was performed
by this reviewer. Only this review report was written.
