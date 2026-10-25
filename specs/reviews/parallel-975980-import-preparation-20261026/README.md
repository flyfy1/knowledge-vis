# Pending #975/#980 import and prospective policy adoption

**Frozen for independent final review; no dispatch performed.** `pins.json` now
contains actual completed acceptance identities captured read-only. #975 scored
92.5 and #98095, with no required findings. The operator binds the exact pins SHA
and still requires root's separate explicit dispatch. Historical `pending-pins.json`
retains null lane entries; disabled-entry behavior remains tested with a `None`
fixture. No STOP, Pi write, commit, push, import, policy adoption or resume was
performed by this preparation.

The one-off interface is exact future accepted pins, the hash-checked proven helper
file, and root's explicit dispatch. The existing `import_leetcode_lane.import_lane`
module owns the deep import operation: locks, candidate/review/run fingerprints,
source scope, shared-policy agreement, registry merge and acceptance provenance.
This adapter does not reproduce those internals or create a maintenance framework.

## Fixed scope and sequence

1. Independently accepted, completed and exited lanes #975/#980 are revalidated
   under their original shared policy. Final pins require the observed lane HEAD,
   exact accepted entry and hash, runs/progress/report hashes, and reservation.
   The original lane base is `2b1cd8cfe14432d1e8d78433f080b1bdaeaf32ba`; the policy
   is `d861a659f42607defb40f46505b02d0283be48a533127b40efa8c6bf543c4faa`.
   No central run may have started either reserved ID. The entire 984-ID queue and
   original runtime/launcher hashes must match. The importer, publisher and its
   transitive static-version module are hashed before runtime Python imports.
2. Write one exclusive owned STOP only after both accepted-lane and publication
   checks pass. Let the current central stage end naturally; never signal an
   author/reviewer. Wait at most the established 6000-second stage budget. Recheck
   clean saved HEAD, no checkout/native worker, both lane identities and reservations.
3. Import each through the established importer. Preserve all prior problems,
   reviews, runs, queue, lane-import history and release ledger. Update only each
   imported reservation's status/import head/import receipt. Preserve all unrelated
   reservations byte-for-byte. A second-import failure leaves the first import and
   receipt durable, STOP retained, and requires inspection; it does not roll back
   acceptance or retry the pair.
4. **Separately sequenced policy step, still stopped:** only after both imports,
   no active/pending reservations and no lane checkout processes, apply the reviewed
   two-paragraph patch from exact source commit
   `1f3740bedb184cb9544a912ce2112e62a0fc72db`. Patch SHA256 is
   `3133b56b6d7e0cd60ad5d3af13a26d3c264831ea428491fff3f4325c433f1605`.
   Only `specs/leetcode-rendered-state-contract.md` may change, from the old hash
   above to `816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c`.
   Check actual Git parents, changed paths, mode and bytes after commit hooks.
   Checkpoint changes **only expected_head**. Existing acceptance and candidate
   policy identities stay historical; nothing is reopened or re-reviewed by fiat.
5. Push the exact adoption HEAD, then remove only the exact owned STOP and launch
   ordinary continuous/max6/every20/full984 processing. The startup observer allows
   an unchanged stopped prelaunch snapshot only while the exact launched PID is
   alive. It is bounded to60seconds and still rejects drift/failure/dead PID. Prove
   a fresh run, thread, turn and native descendant, exact options and preserved
   imported/history/ledger data. The proven helper validates any normal registration
   prefix and candidate refresh; push the exact resulting registration HEAD if any.

Policy adoption is not performed earlier merely because both lane processes have
ended: their accepted work must first be imported under the old frozen policy.
This transaction has distinct `importing-old-policy` and
`adopting-reviewed-policy-only` phases. No separate STOP/resume interval or new
operator framework is needed between them. Any failed condition leaves actual
partial progress intact for inspection; it never converts failure into success.

## Reused guards and publication limit

The helper is the unchanged, independently reviewed
`parallel-968972-import-818-search-preparation-20261026/operate.py`, SHA256
`f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698`.
Only its guard/helper functions are invoked, never its old `execute`, request
adoption or reopen functions. At initialization its IDs become975/980 and
`REOPEN_IDS=()`; no historical #818 behavior is enabled.

Its existing changed-digest publication guard remains unchanged and runs before
STOP, after the natural boundary, after imports, and before resume. Incoming IDs
and pending registrations count in the conservative union; same-digest receipt
refresh and pending release are refused. Fifteen eligible plus two incoming gives
17; eighteen plus two reaches20 and **must refuse before STOP**. This operator
never waives the threshold or publishes independently. New live counts must be
checked when final accepted pins are prepared.

The static-version module is explicitly pinned to the approved SHA256
`f92eca0575bfcf74a4b68b9d011470e99415f12b671328bba1cebf035ddfd12e`;
missing, wrong or changed bytes are refused before runtime imports.

## Local verification and remaining gates

Sixteen local checks cover disabled entry, pending/unaccepted/missing policy
pins, changed importer/transitive module refusal before execution, reservation
preservation, exact stopped startup/dead PID/wrong agent, actual gated runner with
fake CLI, partial second-import failure, exact patch/expected-head-only change,
changed base, active extra lane, out-of-scope commit hook, STOP preservation and
17-versus20 publication projection. The expensive lesson suites were not rerun for
this prose patch. The fake CLI starts no real agents and all Git changes occur in
disposable local fixtures.

Final runtime capture at2026-10-25T20:51:36UTC found central #843 review,
full984 queue and changed-digest eligibility15 plus incoming2 =17. Exact completed
lane states, reports, runs/sessions, reservations, unchanged shared policy and
exited lane processes were validated; see `accepted-pair-readonly-observation.json`.
This observation never waives the repeated dispatch/boundary publication checks.
The queue fix now checks exact length/hash immediately before STOP and again
before imports, with original red and corrected green cases retained.

The separate #980 checks are bound in `acceptance-evidence-binding.json` and
[the acceptance audit](../parallel-975980-evidence-20261026/acceptance-audit.md).
They close unavailable-storage, file-source and request/error coverage on the
unchanged candidate; they do not relabel the interrupted original harness as
passing or rewrite the review/state. Final independent exact operator/pins review,
root commit/push and separate explicit dispatch remain required.
