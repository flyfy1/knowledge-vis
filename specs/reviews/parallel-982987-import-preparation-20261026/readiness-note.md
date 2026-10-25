# #982 / #987 import readiness — preparation only

No executable operator or dispatch pins are prepared. No STOP, import, publication, launch, policy adoption, or runtime mutation occurred. [readiness.json](readiness.json) is a read-only observation, not an acceptance or dispatch authorization.

At **2026-10-25 21:41:47 UTC**, both lanes were still in their original author runs: #982 runner1700254/run982-author-4532e76a05c3; #987 runner1700716/run987-author-a21aea0fbd64. Both HEADs remain launch base `854d1bdc83efc13ae49716190ba8db858e4dd0fc`. Existing importer `same_shared` passed against current central `1997af1228f21cd85a3c7506928dc2587a0a7a9f` (#843 review455d52b6e77c). Both IDs remain unstarted centrally and reserved for their original lanes. These observations do not establish either lane's eventual acceptance.

The unchanged publisher `_reviewed` API returned **18 digest-qualified eligible lessons**, excluding843; no pending registration, pending release, or same-digest pointer refresh was present. Ledger SHA256 remains `1b05df6e7c7249e29adfb20b0b712865ff6fea54aeef042d04bf33857738b89b` (119 released). Adding deduplicated incoming982/987 already gives **20**, which fails the existing strictly-below20 import/resume bound. Do not request a maintenance STOP at this snapshot. Wait for an actual normal release/ledger transition and recompute eligibility; acceptance of corrected843 and then850 may trigger the normal batch, but neither acceptance nor successful publication is assumed.

## Smallest reuse path

Use the unchanged deep importer `scripts/import_leetcode_lane.py` and the approved968/972 helper (`parallel-968972-import-818-search-preparation-20261026/operate.py`, SHA256 `f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698`) for lane preflight, provenance/state preservation, publication bound, ordinary registration-prefix planning, and resumed-agent verification. Set incoming IDs982/987 and no reopened IDs in the eventual wrapper; never call the helper's old Stage A execute/reopen/author-handoff path.

The most recent975/980 wrapper already supplies accepted-pair import, reservation preservation, graceful ownership, delayed-start observation, and exact push/resume handling. Its policy-adoption branch must be omitted for this import-only scope; the older903/920 import-only script predates the registration/startup safeguards. Therefore this is not a safe parameters-only executable adaptation today. No disabled Python copy is added merely to look ready. Once acceptance pins exist, prepare the narrow import-only wrapper for exact independent review without changing runtime importer or expanding scope.

Retain the existing sequence: verify completed accepted lanes and exited workers; unchanged shared policy and unstarted central IDs; hash guards before module execution; sub20 digest bound before STOP, at natural boundary, and before resume; unique owned STOP; release/state/checkout gates; unchanged importer and exact reservation updates; preserve queue, runs, acceptance histories and ledger; exact push; normal continuous/every20/max6 resume with actual registration-prefix proof and a fresh distinct native/session/output binding. Partial failure remains inspectable with owned STOP and receipts; no blind retry.

## Pins still required before freezing

- Both final lane HEADs, clean checkout/state bytes, accepted entries, immutable candidates/lesson trees/source fingerprints, complete author/review run histories, actual reports/evidence/scores/zero required-open findings, registration commits, and worker/process absence.
- Exact final reservation bytes, original shared-policy identity, central queue identity and live policy/importer/runner/publisher/launcher hashes; both IDs must still be unstarted centrally.
- Fresh release ledger with pending=null, actual `_reviewed` eligibility and deduplicated incoming/registration upper bound below20; same-digest pointer refresh and incompatible registration projections still refuse.
- A current ordinary boundary plan (including any pending registration prefix and actual next agent), unique owner/receipt/token, fixed wrapper/pins hashes, focused safety tests, independent approval and explicit root dispatch.

The missing acceptance and publication-bound evidence blocks freezing this preparation only. All three campaign workers continue their normal work; this is not a claim that the runtime campaign is blocked.
