# Frozen #854 bridge adoption proposal after #996/#1000 import

**Proposal only: independent final review and separate root dispatch required.** No adoption operator, STOP, checkout/state transition or campaign worker launch was executed. The original disabled preparation remains unchanged. This folder's operator differs only in `PINS_SHA`, `PREVIOUS_OWNER` and their comments; `enable-only.diff` reverses to structurally approved `0c8f5fcded88f98920cb3e128509889c580082e9fa80c2375bbde3433769728f`.

| Artifact | SHA-256 |
| --- | --- |
| Final operator | `fd96d5d9398f967863166d56f3c904bf78c81e6046cf367a7e832a1b7c7025b0` |
| Final pins | `94098e2f6d632acbd189d59fb3b522968ce80a914285c213ce478a59bc2a05ff` |
| Exact32-path payload manifest | `35cb72e2f7e5003a9c33865d57ec678a190f61392c36f2ebd95962e64e53535d` |
| Completed prior import receipt | `483b6b7723bd84fa174afe8f7e58051653ebe56b2e793ad1694f5f4a4f7e9cbe` |
| Full capture | `1bc12db2304b05c40c4f41d94bda8c775ce5a92fec0382bd39a69992e7e56053` |

## Actual completion and separately authorized object acquisition

Waiting observations preserve operator1904720 and partial import progress without calling it complete. At23:52:27UTC, observation confirmed that the exact owner `import9961000-only-20261026-641c280f` had completed-resumed with both imports completed, ledger preserved and the operator exited. The raw-equivalent receipt archive's hash matches the actual bytes captured remotely. Its pushed continuation HEAD is `453476e12d04ae75d14b149fa26e3446cdb088ca`.

Source review commit47d was absent from the Pi object store. After the completed/exited checks, performed the **one explicitly authorized** `git fetch --no-tags origin 47d97f6bf07dd1f4b8c7e1ca493ca3d21b3b9c7b` at23:52:38UTC. `source-object-fetch.json` explicitly has read_only=false: this writes Git objects/FETCH_HEAD. It is not described as a read-only operation. HEAD remained453476e1 before/after; no checkout/state/STOP mutation command ran. The subsequent capture performs no fetch: the source guard's fetch seam is replaced solely with an existing-object check, while retaining actual remote-ref, ancestry, tree, report/evidence and payload validation.

## Immutable source and actual current capture

The read-only capture finished **2026-10-25 23:52:58.954UTC / October26 07:52:58 SGT**. Source candidate `27b9930daf25f9fb1651038bff1605969cb27f01`, base `cf1a31fc75c66ca79e54513e050b7e0ba31b6e70`, focused review revision/pushed branch head `47d97f6bf07dd1f4b8c7e1ca493ca3d21b3b9c7b` match. Actual report and root-review receipt bind the candidate, required_open=[], closures854-BRIDGE-R1/854-A01 and unchanged reviewed runtime; every receipt-referenced evidence blob hashes correctly. Canonical four files remain unchanged. Exact32-path source diff and each current before-byte/mode match; no source payload expansion was performed.

The source review is a focused97.5 acceptance, not a campaign state acceptance. Its clipboard API payload parity and empty IAB OS readback limitation remain distinct from author OS fallback evidence. Only the original32 lesson/support files are adopted by the eventual operator; the separate review evidence is verified, not silently inserted into that payload.

Actual central/saved/remote HEAD: `453476e12d04ae75d14b149fa26e3446cdb088ca`; current `879-review-f819a846b820`, started23:51:55UTC. Runner1965599, native1965929, session `01a1757a-5dad-7a63-ab9f-51fad99ac40f`. Current run/thread/turn/native ancestry/cwd/output and exact prompt-owned dirty paths passed. One central runner, no active lane checkout processes, all reservations imported/cancelled, STOP absent, full984queue unchanged. Progress/HEAD, receipt, ledger and reservations stayed stable through capture.

Original854 remains accepted_local/done, candidate `1be3c657ef0c1ef3152f8abced78df2e278f09da`,92.5, round1. Actual completed historical runs/finals/events, review report, candidate eligibility via `_reviewed`, every tracked runtime byte and lesson tree were checked before recording its pins. No score or original review was rewritten. Queued995 remains changes_required/fix; its observed entry/history are retained in the capture, not treated as a new executable scheduler.

Ledger SHA `163b32ba940e02a8f17c1ccaf5e9a9f6dfcd606491007d096faa9b971b45eda6`,138 released, pending=null,854 unpublished. Actual eligible11; projected854reopen excludes it and leaves10, with conservative retained854 bound11<20. The projected ordinary next agent is **854fix**, without changing queue order. The final adapter retains the independently closed exact-fix guard: stagefix, rolefix and run/current problem854 are required. Review/author cannot substitute for it.

## Checks and remaining operational limits

**17 local tests passed in1.484s:** unchanged12-test preparation suite plus5 final identity/receipt/source/history/startup/object-fetch checks. They include the disposable exact-payload Git adoption, rejected wrong old bytes/symlinks/extra paths, preserved history/queue/995, actual publisher exclusion and negative fresh-review versus requiredfix. No live operator or browser suite was run. Original red startup evidence and fixture-error history remain in the parent preparation.

Unlike the dynamic995 handoff, this adapter pins the current central HEAD/current/runner and ledger. Any natural advancement before dispatch must refuse and receive a separately reviewed observation refresh, not silent repinning. The operator then waits for a natural stopped phase, locks checkout/release ownership, rechecks all constraints, and computes the actual ordinary854fix plan before writing. A pending release, already published854, unexpected earlier unfinished item, active lane, changed payload or bound20 refuses. Failure retains actual files, history, receipts and owned STOP; do not reset or automatically retry.

For an independent fresh **read-only** capture with a new local evidence path:

```sh
python3 -B specs/reviews/854-bridge-adoption-preparation-20261026/final-ready/run-capture-local.py --output /tmp/854-fresh-review-capture.json
```

This does not authorize invoking operate.py. Root must inspect the independently reviewed exact proposal, recheck fresh executable pins, commit/push the intended preparation and separately authorize one guarded dispatch.
