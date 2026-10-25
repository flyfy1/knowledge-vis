# Independent review: #818 author startup recovery

## Initial frozen revision: changes required

Reviewed recovery SHA256 `13595746393cef5898b90a90ddbfe9158344593447710aa6953d11c4500206ca` with pins `70db45a389f137b558aa7d368bedc71866fc4016c6e3c6b347a61ef0031dbaa7`. No dispatch approval applies to this revision.

Required finding RECOVERY-GUARD-ORDER: `startup_observer` executes at module import before its pinned hash is checked, and `import_leetcode_lane` is imported in main before `op.hashes_unchanged()` verifies runtime bytes. A changed helper could execute before the guard rejects it. The original Stage A explicitly checked runtime hashes before importing its helper. Move verification before module execution and retain negative controls proving modified observer/importer code does not execute. Root and this independent reviewer identified the same gap; the author is correcting the local preparation only.

Other inspected paths preserve the intended narrow scope: exact failed snapshot and original STOP bytes, a distinct receipt/owner, no repeated import/reopen/adoption, ordinary launcher only, unchanged stopped-state waiting only while the exact launched PID is live, refusal of drift/failed/premature-review states, fresh native/session proof, and the inherited ready-author freeze with owned STOP retained. Final approval remains pending corrected exact bytes and independent test execution.

No Pi writes, restart, STOP mutation, actual author, measurement or publication occurred during this review.

## Corrected frozen revision: approved for separately authorized recovery

Exact recovery SHA256: `1745fe1d3425a21f0a72b3f5a8dbc9d21a7dec827ed80acb523dbb0d180aa0bd`.
Pins SHA256: `70db45a389f137b558aa7d368bedc71866fc4016c6e3c6b347a61ef0031dbaa7`.
Startup observer SHA256: `3b884fbc94e584a3894374a4156895e44f7aa53a616afc757f955c32664680e5`.
Recovery tests SHA256: `9ccd6f54386fdbfbbd2fb17bf8cb940463b1746ce62ae15ab5c51f5918f2a930`.

RECOVERY-GUARD-ORDER is closed: the observer is no longer imported at module load. Main checks dispatch, exact pins/helper bytes and observer hash, loads only the verified Stage A helper, supplies its verified pins, calls its runtime/policy hash guard, and only then executes observer/importer modules. Negative controls show modified observer/importer side effects do not run before refusal.

I independently verified the exact hashes and reran the deterministic original red, corrected green and recovery guards. Original observation fails as expected with the same RuntimeError while an actual delayed runner PID is alive and its exact persisted prelaunch snapshot is still stopped. Corrected startup tests pass4/4; recovery guards pass8/8. [Independent logs and validation](818-author-handoff-startup-recovery-review-evidence-20261026/validation.json) retain the red failure and both green runs. These use real local runner processes with a fake CLI and temporary Git checkouts, not actual agents or remote state.

The correction only tolerates the exact unchanged stopped prelaunch snapshot while the exact launched PID is alive, for a bounded60-second observation window. It does not tolerate a changed stopped state, failed state, dead PID or premature reviewer. Once the ordinary runner records a fresh818 fix, the inherited active-stage, thread/turn/native-child, exact state/history delta and author-freeze gates still apply. The real-runner control ends with ready author output, a committed candidate, clean stopped review_pending state, and zero reviewer runs.

The operator binds the archived actual failed snapshot, full history, old failure receipt, original STOP bytes, ledger and exact remote head. It invokes no import, document adoption, reopening or old execute path. Only exact owned STOP bytes can be removed; failure restoration cannot overwrite foreign ownership. Successful recovery receives a new receipt/owner and intentionally ends waiting-for-Mac with its distinct handoff STOP. The old failed receipt remains immutable and Stage B must bind the new successful recovery lineage rather than relabeling Stage A.

**No required findings remain for these exact bytes.** This approval covers the narrow launch/arm/freeze recovery only. Root's separate dispatch is still required; Mac measurements, Stage B evidence adoption, fresh independent review, acceptance and publication are not authorized or established by this review. The observed-success polling limitation remains explicit. No Pi/runtime/state changes were made during independent review.
