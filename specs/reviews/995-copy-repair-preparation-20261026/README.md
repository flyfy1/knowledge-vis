# Disabled #995 queued copy-repair handoff

**Preparation only. `PINS_SHA=None`; the CLI refuses before opening pins/helper files or reaching runtime operations.** No Pi read/write, STOP, source adoption, reopen, worker launch, commit or push was performed in this preparation. Completed992/995 import identity and future central/ledger pins remain unresolved. This is not a dispatchable artifact.

## Corrected ordering expectation

Root explicitly selected **queued995 reopening with ordinary actual-next-agent resume**, preserving finite984queue order. This corrects the earlier immediate995fix expectation. The reviewed843 standalone operator could assume843 was the first unfinished ID;995 is index206, while862 is index174. The existing transition does not reprioritize.

[check-queue-order.py](check-queue-order.py) uses the real reviewed transition/resume-plan functions with an archived central state and the actual accepted995 entry. It leaves the queue unchanged, reopens995 and selects the earlier active854 from that historical snapshot. It reproduces the old immediate-fix gate's refusal. This is an ordering demonstration, not a claim about current live state or publication eligibility. [queue-order-evidence.json](queue-order-evidence.json) preserves the result.

The new disabled wrapper removes only that invalid immediate-target assumption: compute the actual stopped resume plan, allow its normal registration prefix, and prove its fresh expected agent. Starting995fix is not required for handoff completion.995 stays `changes_required`/`fix`, retaining its remaining rounds, until the normal queue reaches it; ordinary fresh independent review must later close995-COPY-R1/995-A01/A02. No priority scheduler, queue reordering or new lane is introduced.

## Bounded operation proposed

Reuse the approved843 request-adoption wrapper and unchanged helpers:

- Campaign helper `parallel-968972-import-818-search-preparation-20261026/operate.py`, SHA256 `f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698`.
- Accepted-entry/transition/document-tree helper `workflow-copy-repair-transition-preparation-20261026/reopen.py`, SHA256 `a268466fe6101841437c730e0e7448961be4637ee60d9fe4a760c0ea6fca3424`.

The exact future payload is **one file only**: `specs/reviews/995-teaching-copy-repair-request-20261026.md`. No acceptance archive, algorithm evidence tree, policy file or lesson runtime bytes is adopted. The request is self-contained about the two localization edits, original report/candidate hashes and validation scope; its source-archive links are historical references, not additional adoption paths. The final source commit/hash needs review before enabling.

Before exclusive owned STOP: verify exact completed992/995 import receipt and pushed-head ancestry, all policy/runtime/helper/launcher hashes, imported995 accepted entry/history/tree/report, retained round budget, ordered queue, no active lane reservations/processes and one central worker. Refuse pending releases or an already-released995. Recompute the existing digest-based conservative bound below20, retaining995 in the union before and after reopening. Existing queued/released history is not reset.

At the clean ordinary boundary under release/state/checkout gates, adopt the one new request document, enforce exact staged/committed path scope, archive the entire original95/100 accepted entry/current pointer in maintenance, and use the unchanged transition for995 only. Candidate, author/reviewer history and round count remain; active accepted_at/registration fields are archived, not falsely retained as new acceptance. Queue and all other entries stay unchanged. Push the exact adoption HEAD.

Remove only owned STOP, resume the unchanged continuous/every20/max6/full984 launcher, and verify the **actual next** agent with new native/session/thread/turn/output ownership plus ordinary registration-prefix state/commit proof. Push an additional normal registration continuation HEAD if required. Require ledger and reservations unchanged and995 still queued/publication-ineligible. Success status is `completed-resumed`, with `pushed_head`, actual fresh-agent identity, `queued_repair_id=995`, and preserved-queue evidence; success does not assert995 has already been fixed or accepted.

Failure preserves actual partial document commits, checkpoint, maintenance, receipts and owned STOP. No reset, retry, forced resume or agent interruption. Exact live guards and independent review remain mandatory after final pins exist.

## Pending pins and future lane BASE

`pending-pins.json` deliberately leaves null: committed request revision/digest, exact completed import receipt/owner/hash, imported995 entry and relocated central run history, central HEAD/current/runner/queue, release ledger and actual eligibility bound. Lane-local pre-import hashes cannot substitute for central imported run hashes because the importer records `source_directory` and relocates `directory`.

The request filename is included by the importer's shared-tree comparison (it is not a numeric `995-review-*` report). Therefore **future996/1000 launch BASE must come after this queued-repair handoff** and bind its real `completed-resumed` receipt/pushed_head and new shared tree. The preceding import-only receipt BASE is insufficient even though no shared policy file changed. No next-lane launch can be frozen from this pending proposal.

## Local validation

11 disposable tests pass: disabled-before-file-access gate; real history-preserving transition/actual-next planning; pending-registration-prefix selection; actual publisher `_reviewed` exclusion of queued995; already-published/pending-release refusal; scope/hash/path escape checks; exact stopped startup and wrong agent;20-bound refusal; real temporary Git one-document adoption with preserved lesson/ledger; commit-hook scope violation refusing before reopen. No real agent, SSH or publication is used. The historical ordering fixture also passes. See tests.log, queue-order-evidence.json and validation.json.
