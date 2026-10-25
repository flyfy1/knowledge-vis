# 818 author-handoff startup observation diagnosis

Preparation only. No Pi writes, dispatch, original Stage A changes, Stage B changes,
imports, reopens, or acceptance changes.

## Actual red loop

`python3 -B specs/reviews/818-author-handoff-startup-recovery-20261026/test_startup.py`

The test launches an actual campaign runner subprocess behind an explicit startup
gate, retaining the stopped prelaunch state. Its exact launched PID is live; the
saved state equals the prelaunch snapshot. Calling the frozen original operator's
`fresh_fix_record` fails at line389 with `Runner not active while arming author
handoff`. Original red output is preserved in `red.log` (1.302 seconds). The gate
removes scheduler timing from the reproduction. A fake CLI is used, never a real
agent. Temporary child processes and checkouts are local and isolated.

## Ranked falsifiable hypotheses (before testing the correction)

1. **Persisted startup snapshot race:** if the observer incorrectly rejects the
   unchanged stopped state before the launched process persists running, allowing
   only that exact snapshot while the exact launched PID is alive should let the
   real runner reach a fresh fix, arm STOP, finish ready, and stop before review.
2. **Launched process failure:** if the process died before startup, relaxing the
   state check should not make progress. A dead launched-PID control must refuse,
   including when the snapshot is unchanged.
3. **Foreign/drifted state or residual ownership:** if a changed stopped snapshot
   caused the fault, exact snapshot equality will reject it. Altered expected HEAD,
   history, status or current pointer must remain failures. The local real runner
   still acquires its normal checkout/state locks before a fresh agent run.

The first hypothesis and competing controls were communicated by root before
correction testing. This local seam proves observation behavior, not live recovery
readiness or the absence of remote residual processes. Successful recovery needs
separately pinned stopped state/STOP/HEAD/ledger and independent operator review.

## Confirmed result

H1 is confirmed in this seam: startup process liveness precedes persisted running
state. `STARTUP_OBSERVER=recovery python3 -B
specs/reviews/818-author-handoff-startup-recovery-20261026/test_startup.py` passes
all four cases in 1.290 seconds (`green.log`). The exact original red is retained.
A live gated runner progresses to one fresh #818 fix; STOP is armed while the fake
CLI waits; its ready result creates the ordinary candidate and stops review_pending
with zero review runs. Dead PID, drifted stopped history/HEAD/current, failed state
and premature review remain refused. This does not prove any live recovery run.
Suggested eventual commit explanation: **Fix the author-handoff startup race: the
launched runner can be alive before replacing its exact stopped state snapshot.**

## Narrow recovery preparation

`recover.py` is a new transaction with its own receipt/owner. It hash-checks and
reuses the original Stage A helper and pins, retaining its publication, historical
state, fresh native session, ordinary author delta and freeze checks. It invokes
none of the old import/reopen/adoption execute steps. Only the launch observation
uses `startup_observer.py`; it checks exact prelaunch snapshot equality and the
exact launched process liveness. Startup waiting is bounded to 60 seconds.

`pins.json` binds the archived actual failure snapshot: clean/saved/remote head
`f3347117f4e4370e8d83c77a1cf9e9f14ccae554`, original failed receipt, stopped progress,
release ledger, original owned STOP and unchanged pre-author lesson tree. The
operator rechecks actual locks/processes/policy/remote on dispatch and refuses
any changed input. It expects no registration prefix before #818; the actual
changed-digest publication upper bound remains below20. No state checkpoint,
extra maintenance history, acceptance change or repeated reopen is performed.

The old failed receipt is never modified. Only exact original STOP bytes may be
removed. A newly recorded #818 fix receives a distinct recovery handoff STOP,
referencing original and recovery lineage. Fresh run/session/turn/native-process
proof and normal launch flags are required; the ordinary runner completes only
that author stage. Frozen candidate/source/tree are pushed only after a clean
natural boundary with no new review, passing the original freeze helper. Success
writes a new waiting-for-Mac receipt. Stage B must later be reviewed with this
recovery receipt/owner binding; it must not relabel failed Stage A as successful.

On failure, preserve source, state, old/new receipts and ownership; restore the
last validated STOP bytes only if absent, never overwrite a foreign STOP or launch
a second worker. No active agent is signaled. Recovery remains preparation until
independent review and root's separate exact dispatch. No Pi writes occurred.

`test_recover.py` adds eight local guards over the archived actual snapshot and raw
STOP restoration. These complement the real-runner seam and inherited helper
coverage; they do not represent a live end-to-end recovery execution.

Guard-order review correction: verify the original helper and pins, observer bytes,
and all policy/importer bytes before executing their modules. Negative controls
prove a modified importer/observer cannot run side effects; a separate actual CLI
process proves observer code does not execute before the dispatch guard.
