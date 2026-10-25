# Import #982 / #987 only — preparation, no dispatch

This one-off wrapper is frozen for independent review. It has **not** been transferred or executed on Pi. An exact dispatch token and matching hashes are required; root has not authorized this prepared operator. No STOP, import, policy adoption, reopen, push or resume was performed during preparation.

Operator SHA256 `e0e530655dd21c90a95c5a0b0baa7f6b4e84fa96ae359c6cd72da3e34d5798f6`; pins `0d9dec18554ed18154ac5b4137371b08382bd217c290149fd048a46987387a01`; unchanged968/972 helper `f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698`. Owner `import982987-only-20261026-891ce2d4`; eventual token `root-reviewed-import982987-only-20261026`. Arguments are `--dispatch`, `--pins`, `--helper`. Existing receipt means inspect, never retry.

## Frozen evidence

The read-only capture at **2026-10-25 21:53:24 UTC** verified completed, clean, independently accepted lanes, exited runner PIDs and no checkout processes; full run validation, publisher acceptance proof, and unchanged shared policy passed. Complete state snapshots/reports are archived here; exact entries, run-history/state/report hashes, reservation bytes and registration heads are pinned.

| ID | Candidate | Registered lane HEAD | Review |
|---|---|---|---|
|982|`71cac9c38ae78f8ec6a477ca05c7781ab9377fd2`|`1086f89c87cb74432d9222deba3414138d4e1b2f`|95/100; `982-review-1-94eb2c64.md`|
|987|`bed2e3d724fb024efd46c65ad1ba52fc5fa20f9f`|`5e97917082c9c4b71bb26567617345a98d9171c8`|92.5/100; `987-review-1-0d4cbd13.md`|

Both have zero required-open findings. #982 retains optional prose-density advice; #987 retains optional987-OBS-01 narrow-grid panning friction. Neither historical acceptance is rewritten or upgraded by import.

Central is pinned to runner1696215, HEAD `7fd4aa457c318f053d7dc722fd63b3012bccb838`, and `854-author-679ce856a357` started21:51:41.189020UTC. Before STOP, any changed current/head/runner refuses for fresh preparation. The natural boundary may advance to review or registration and is planned from actual stopped state; it is not assumed to retain the original author candidate.

Completed public release `84dfd908f5c94592918eb4ecb72eb87e` and full ledger SHA256 `163b32ba940e02a8f17c1ccaf5e9a9f6dfcd606491007d096faa9b971b45eda6` are pinned. Actual `_reviewed` returned **0 eligible**, no pending registration/release or same-digest pointer refresh; incoming982/987 gives conservative upper bound **2**, below20. The earlier18+2 refusal is retained in [readiness-note.md](readiness-note.md) and readiness.json as historical evidence.

## Narrow control flow

The wrapper reuses the approved975/980 import/resume flow and unchanged968/972 helper. It removes all patch-fetch/apply/commit and policy-adoption code. `REOPEN_IDS=()`; no old Stage A execute, reopen or Mac handoff path is called. The importer remains the only lesson import mechanism; normal runner registration remains the only registration continuation mechanism.

It rechecks policy/runtime hashes before module execution, accepted/exited lane identities, shared tree, reservations, finite984queue, central identity and completed ledger. It recomputes the strict sub20 bound before the unique owned STOP, after natural stage completion and before resume. Release/state/checkout ownership gates and metadata/history preservation remain unchanged. After two imports it pushes the exact merged head, removes only owned STOP and launches the existing continuous/every20/max6 command. Delayed startup tolerates only an unchanged stopped snapshot with the exact live launched PID; success requires a fresh native/thread/turn/output identity and exact ordinary registration-prefix proof. Any extra continuation registration head is also pushed exactly. Failure preserves actual partial commits/import receipts/reservations/state/owned STOP; no reset, retry or signal to active agents.

## Validation and next action

**16 local tests pass**, using temporary Git fixtures and fake agent processes, with no real agents/network/runtime writes. Coverage includes: no policy/reopen mutation path; initial central/release identity and pending-release refusal; source/hash guards before importer execution; exact delayed startup and wrong-agent refusal; real normal registration and unchanged review-history proof; 18+2 and17+2+registration publication refusals; STOP ownership; queue reread before STOP/after wait; and preserved first import on second-import failure. See tests.log and validation.json.

Root and an independent agent must review these exact bytes before any explicit dispatch. Re-read live guards at dispatch; if central854 advances, do not bypass the frozen identity or blindly edit pins. No prospective policy proposal, #843 repair, catalog expansion, additional lane, or automatic publication is included.
