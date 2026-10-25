# Independent final #996/#1000 launch review

**Approved for the exact proposal, conditional on freshly matching launch eligibility at dispatch. No required findings.** This is review approval, not evidence that either lane has launched.

- Launcher SHA-256: `75c880000eb7f66eff3c2758e84e045294e5a04a279dcbcfd6a7a0382f5088f8`.
- Read-only preflight SHA-256: `d14d4e15b4fa53ff8a384b01e8a351d7e178af328bf5291cfdc7458c4c7e09be`.
- Completed #995 queued-handoff receipt SHA-256: `86159f93f1a918035f10c47c6bbda09409b8a914c0320dfee40551b305eed343`.
- External #995 pins SHA-256: `b8daf2ba46ff675f5cc14f6ddca7e1816d14348b3438b228f13c4e6fa60ff93c`.

Reviewed the actual final folder `parallel-9961000-evidence-20261026`, its reversible parameter map/diffs, preceding disabled adaptation and source launcher/preflight. All five artifact hashes in the parameter map and all24 final manifest file hashes matched; manifest SHA-256 `16f69b36f4861e78e2708623c8642a3f16809899d11943f11dfe265096d3a055`. Read the final README and confirmed its proposal/dispatch distinction. Final enablement removes only the deliberate disabled-entry line and resolves six launcher parameters/four preflight placeholders. No unresolved placeholders remain. Independent local runs passed **8 final tests (0.009s)** and **10 adaptation tests (0.013s)**, including exact reversal and adversarial receipt-schema cases. Logs are in [review evidence](parallel-9961000-launch-review-evidence-20261026/).

The queued-handoff schema adaptation is necessary and correct: exact receipt bytes and owner precede parsing/use; status completed-resumed, queued_repair_id995, queue_preserved and ledger_preserved must match. Actual `resume_proof.agent_candidate` and pushed_head both bind BASE `6c68b23cc306067de5a912195a3c7edeebc2a0be`; the completed receipt is dated23:07:06UTC. The earlier pair-import receipt cannot substitute for this later shared-request adoption. Actual external pins location comes from the completed dispatch, not a guessed transfer path. Since those pins have no lane_base, the static-builder guard correctly uses receipt-bound BASE, verifies the existing Git commit/blob and current bytes against the same approved digest, and performs no fetch. Policy/runtime hashes are checked before importing the importer, followed by same_shared(BASE,current_HEAD).

## Independent read-only live check

Executed only the inspected preflight via SSH stdin with Python `-B`. At **2026-10-25 23:08:14.897UTC / October26 07:08:14 SGT**, output exactly matched the frozen final proposal:

- BASE, current HEAD and saved HEAD: `6c68b23cc306067de5a912195a3c7edeebc2a0be`.
- Current `871-review-5c5479d608a1`, session `01a17551-4500-7f91-b832-4d15fa2f15fa`.
- Central runner1865819, native1866040, exact ancestry/cwd/output binding; running thread/turn and no completed/failed turn.
- One campaign worker; all41 reservations imported; STOP absent; 984 queue;1,962,428KiB available memory.
- #996/#1000 have no existing problem/run/state/checkout/branch/reservation; ports18799/18800 have no listener and pass temporary bind checks.
- Actual reviewer-owned untracked report/evidence paths derive from the current prompt; no broader worktree allowance or author-context injection.

[Fresh preflight](parallel-9961000-launch-review-evidence-20261026/preflight.json), [explicit frozen-identity comparison](parallel-9961000-launch-review-evidence-20261026/comparison.json), [stderr](parallel-9961000-launch-review-evidence-20261026/preflight.stderr). These are dated observations. Unlike the dynamic #995 maintenance wrapper, this launcher deliberately pins its current HEAD/run/problem/stage/session. Natural advancement must refuse dispatch; do not silently repin.

## Preserved operating limits

The launcher retains separate single-ID worktrees/states, nice10, max-rounds6, no publication arguments and no central source/progress writes. It validates worker counts and frozen central state before each spawn, durably records prepared/spawned/started identities, and observes the exact child before proceeding. A partial launch must be handled through its recorded PID/receipt; never blindly rerun. The preflight is a separate read-only gate: root must run it freshly and explicitly compare the output with the frozen proposal before launching, then verify actual lane/native identities afterward. Tests and preflight do not prove successful startup.

Central does not interpret lane reservations as scheduling locks. Dispatcher must monitor before central reaches either target and import only independently accepted results at an owned stopped boundary. Existing old lanes remain untouched. No operator execution, transfer, reservation, STOP, state/source edit, commit/push or publication was performed by this reviewer; only local review artifacts were written.
