# Independent structural review: #975/#980 import and marker-policy adoption

Date: 2026-10-26. Initial verdict: **one required guard correction before structural approval; dispatch remains disabled**. Reviewed operator SHA-256: `84f546ad3a118ae0fc9972f6ae4a552b89911ef99f511233d0f0b7e88e0bea01`. This review does not freeze acceptance pins or approve live execution. `PINS_SHA=None` and both pending lane pins are null.

## Required finding

**975980-R1 — Revalidate the pinned queue at the actual stop/import boundary.** In the reviewed operator, lines 152–153 check the 984-item ordered queue only at initial preflight. The source fetch and natural-stage wait follow; lines 169–172 then accept a new stopped baseline without comparing its queue to the pinned identity. `validate_checkout` checks uniqueness, not the expected order/membership. `resume_plan` accepts that baseline, and `import_metadata_preserved` deliberately preserves it. A changed queue can therefore receive both imports and policy adoption before ordinary startup rejects its mismatch with the catalog-derived queue.

Required correction: repeat the exact length/hash guard on the latest pre-STOP state and on the stopped checkpoint before the first import; preserve that checked identity through subsequent transitions. Add a negative fixture for drift after fetch and during the natural-stop wait. Refuse before new STOP in the former case; retain owned STOP and refuse before import in the latter. Do not repair/reorder the queue automatically.

Independent [guard probe](parallel-975980-import-review-evidence-20261026/queue-drift-check.py) uses an actual disposable Git checkout and 984 unique IDs with the first two reordered. [Recorded result](parallel-975980-import-review-evidence-20261026/queue-drift-red.json) confirms that the existing checkout validator, resume planner and baseline-preservation helper all accept the drift. This is not execution of the operator or a claim that live state drifted. The probe's initial attempt hit macOS `/var` versus `/private/var` path identity; resolving the fixture paths allowed the intended check.

## Controls inspected

Read the operator, pending pins, README and tests; traced actual APIs into the proven helper and `import_leetcode_lane`, campaign, publisher, registry and registration modules. Hashes matched the declared helper `f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698`, importer `8642a573383d052ce6e227bd8c2374f9c50f2fc1e8e9b312a6186607015344e0`, and transitive static-version module `f92eca0575bfcf74a4b68b9d011470e99415f12b671328bba1cebf035ddfd12e`.

- The disabled main entry refuses before reading pins/runtime. The future entry pins helper bytes and checks importer/publisher/static-version/runtime hashes before importing runtime Python. Both lanes must be completed, independently accepted, unchanged, exited and free of checkout processes. The importer revalidates review thresholds, immutable fingerprints, exact review ancestry/evidence, run/session histories, shared policy and path scope under checkout/state locks.
- STOP is exclusive and owned; the central stage ends naturally with a bounded wait. No author/reviewer signal is sent. Both imports precede the separate marker-policy step. Prior problems, runs and import history are preserved; accepted lane entries are not rewritten. Imported reservation changes are limited to status/head/receipt; other reservations retain bytes. Release ledger bytes are compared under the release lock and before/after resume.
- Policy adoption requires no active/pending reservations or lane checkout processes, exact stopped HEAD and patch/base/result hashes. The patch is precisely the reviewed two paragraphs. Commit parents, sole changed path, regular mode and committed bytes are checked, including hook effects. Only `expected_head` changes in the progress checkpoint; original candidate policy identities remain historical.
- The unchanged publication guard refuses pending release and same-digest pointer refresh. Its conservative eligible/incoming/registering union must remain below 20; 15+2 passes and 18+2 refuses. This bounds startup publication, not future authorized publication after continued work reaches the normal cadence.
- The exact adopted HEAD is pushed and remotely compared before removing owned STOP. Startup may briefly retain the exact stopped snapshot only while the launched PID exists. Fresh run/thread/turn/native-descendant evidence, worker options, registration ancestry/scope, historical metadata and exact continuation push are checked before success.

## Independent checks and limits

The inspected preparation suite ran independently: **14 tests passed in 2.019s**, [log](parallel-975980-import-review-evidence-20261026/tests.log). It includes changed runtime/transitive-module rejection before import execution, publication-bound negatives, reservation drift, live/dead/wrong startup identity, actual runner with gated fake CLI, second-import failure, exact policy patch, wrong base, extra active reservation and out-of-scope commit hook. All writes were in disposable local fixtures; no real agent or SSH action was launched.

The queue probe is deliberately narrower than a full simulated operator transaction. No live accepted pair, remote lock availability, process inventory, branch/ledger/queue boundary, push or publication was verified in this review. Final accepted pins and operator bytes require a separate exact review after they exist.

Crash boundaries are inspectable rather than rolled back: importer receipts preserve an unfinished merge or completed first import; policy commit/checkpoint/push failures retain actual state and owned STOP; a second import or reservation-write failure must be reconciled manually. The top-level receipt refuses retry. A caught failure after STOP removal restores it when absent without overwriting another owner's STOP. Abrupt process/host loss around STOP removal and launch is not an atomic transaction; inspect receipt, actual STOP, worker and state before any recovery, never launch a duplicate. This is an explicit operational limit, not permission to bypass checks.

No operator execution, active policy/runtime edits, STOP, commit, push or Pi mutation was performed by this review. The author and dispatcher received 975980-R1 before final disposition.

Additional dependency verification: **six existing importer interface tests passed in 5.616s**, [log](parallel-975980-import-review-evidence-20261026/importer-six-checks.log): preservation of registry/state/ledger/ancestry, held checkout lock, mutated accepted candidate, shared runtime drift, failing required review dimension, and inspectable merge/prepared receipt after injected registration failure. These exercised the real importer in disposable worktrees; they do not supply live lane acceptance proof.

## Queue guard closure and structural verdict

**975980-R1 CLOSED; structural approval for the still-disabled preparation only.** Revised operator SHA-256: `3e35d1eda9296a070886848e47bc355f70fd6a5fc3aedd205e6f9a7cd303eb77`. Inspected the added exact length/hash checks immediately before STOP and on the stopped baseline before imports. The queue is never repaired or rewritten by the checks.

Independently reran the updated suite: **16 tests passed in 2.159s**, [log](parallel-975980-import-review-evidence-20261026/tests-queue-fix.log), test-file SHA-256 `6839ec59c2402b4f9686eb2f02ab1fd7080f663fca09f253c0d766525fb324fe`. The two new execute-seam negatives use disposable state, fake process/fetch observations and a mocked importer; no Pi operator runs. Drift after fetch now refuses with no STOP written; drift during the natural-stop wait retains owned STOP and refuses with zero importer calls. Inspected the author's retained two-case red output, which reached the sentinel import failure before the fix, and its diagnosis. Original failure and independent guard evidence remain preserved.

No required structural findings remain at these exact bytes. `PINS_SHA` is still `None`; pending acceptance entries remain null. Actual accepted-pair capture and any enabled operator/pin revision are **not covered by this approval** and require final exact review plus live preconditions and explicit root dispatch. This conclusion authorizes neither STOP nor import/adoption/resume and does not establish publication or acceptance of either lesson.

## Final exact operator and accepted-pin review

**Approved for the exact reviewed operator/pins, subject to its live guards and separate explicit root dispatch. No required findings remain.**

- Operator SHA-256: `eb6170ea50e323ed3cb6d8d0a74e0d684b73c5329c2138d5e6b8d8570f51f447`.
- `pins.json` SHA-256: `f2efffc1e76e6729098db43dcb2e7c50458ea0bb87185c640d978c714f862139`.

Replaced only the final `PINS_SHA` line in memory with its reviewed disabled form; the reconstructed bytes hash exactly to `3e35d1eda9296a070886848e47bc355f70fd6a5fc3aedd205e6f9a7cd303eb77`. Thus the pin constant/comment are the entire operator delta. Both queue-boundary guards and all previously reviewed behavior are unchanged. The test delta similarly reconstructs the previously independently run test hash: it only restores `PINS_SHA=None` inside the disabled-entry test. The author's final 16-test log and every final validation-manifest hash match. No duplicate suite rerun was needed for these constant/fixture-only changes.

| ID | Exact registered lane HEAD | Frozen accepted candidate | Review outcome |
| --- | --- | --- | --- |
| 975 | `d1e5c03e4f58203b7b08f4a5b858a563b245e375` | `bc00150bef56379abd88333f62211cf7b16146c9` | 92.5; accepted; required open IDs empty |
| 980 | `d95031d1b9d90fa9e1cc578c000caef0c6756510` | `a440fe53769a1831f8e2f8f4f4bbd0195ff0906c` | 95; accepted; required open IDs empty |

Independently compared pins against archived raw completed-progress files: exact progress-byte hashes, complete problem-entry values/canonical hashes, run-history hashes, registered HEADs, completed/current-null/single-ID scope, report-byte hashes and original reservation objects all match. All pinned local runtime/policy file hashes match, including importer and the transitive static-version module. Read the read-only capture implementation: it hashes these modules before import, verifies real lane runs/reports and publisher eligibility, checks shared policy, runner/process exit and reservations, and refuses a central/ledger change during capture. These recorded observations are evidence of that capture, not a substitute for execution-time guards.

Inspected #980's supplemental script, results and audit. The original interrupted harness remains failed/incomplete, not relabeled as passing. Separate successful checks cover denied storage, offline exact source, local-only network/error handling and unchanged candidate/registration asset identity, in both locales. All supplemental binding and acceptance-manifest hashes matched actual files. The bound files also match commit `c72ca342a26723c543e1b70ba0c61fa3831cf912`; a read-only `git ls-remote` confirmed that commit as origin main during this review. This verifies archived supplemental closure, not a new whole-lesson acceptance or a public lesson deployment.

The frozen read-only observation at `2026-10-25T20:51:36.671786Z` records central #843 review, exact 984 queue, 15 eligible IDs plus incoming #975/#980 = **17**, and no lane checkout processes. Eligibility and process state can change after that observation. The operator must still revalidate them before owned STOP, at the natural boundary and before resume; reaching 20, stale pins, another lane/owner or any other failed guard requires refusal. This approval does not waive those guards, authorize a new publication path, establish a completed import/adoption/push/resume, or permit replay after a partial failure.

No live operator, STOP, runtime/policy mutation, commit, push or Pi write was performed by this final review. Prior structural evidence and the original queue failure remain preserved.

## Root disposition

Root read the adapter and relevant proven helper/importer interfaces, the exact
queue-guard correction and final pin-only diff, both lesson acceptance reports
and #980 supplemental coverage. Root independently ran the final 16 preparation
tests successfully (2.163s). The exact enabled operator and pins approved above
are approved for one separately dispatched execution after fresh live gates.
Keep both imports under the old policy before the separately sequenced exact
marker clarification, preserve every prior review and failed check, and retain
actual partial receipts/owned STOP on failure without blind retry. The captured
17-version projection is dated; the existing live below-20 gate remains required.
The interrupted-check coverage proposal is outside this adoption scope.
