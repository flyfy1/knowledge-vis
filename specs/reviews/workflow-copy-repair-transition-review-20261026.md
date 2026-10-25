# Independent review: nine workflow-copy repair transition

Date: 2026-10-26. **Approved for separately authorized exact dispatch; no required
changes found.** This reviews the one-off transition, not the repaired lessons,
their future acceptance, or publication.

- Operator SHA-256: `a268466fe6101841437c730e0e7448961be4637ee60d9fe4a760c0ea6fca3424`.
- Companion pins SHA-256: `d1feac5dc7c6e46b08ad90cb55877d4dae1332142154d19c6f408915c7d7b24d`.
- Fixed document source: `28efc3067c656f4cba8f5c90477b4506aa8eb6c4`.
- Scope: #780, #793, #798, #801, #815, #903, #920, #940 and #956.

The author confirmed these bytes frozen. The reviewer independently recomputed
both hashes, read the full operator and tests, and compared the relevant actual
campaign, importer and publisher behavior. No Pi command, dispatch, STOP/state
mutation, source repair or new agent launch was performed by this review.

## Boundary, adoption and preserved history

The operator requires completion of the preceding import/policy transaction and
its fresh-resume evidence, the exact adopted policy/runtime/launcher hashes,
accepted-entry/report/lesson/run pins, and all 984 queue IDs in their saved order.
It installs an exclusively created owned STOP and lets the active stage finish.
After exit it rejects surviving checkout processes (except itself), obtains the
existing state/checkout and release locks, and requires a clean saved Git HEAD,
completed previous current run, exact accepted targets and no pending release.
It does not signal or discard the current #818 review.

Only the ten fixed request documents are adopted, with exact path, byte, mode,
single-parent and post-hook checks. No lesson, registry, publisher or policy bytes
are included in this commit. The previous state is retained as metadata evidence;
no old runtime-content copy or deployment backup is created.

The state delta matches the #239 precedent: the nine entries become
`changes_required` / `fix`, with their request as `prior_report`. Prior acceptance
timestamps, registration commits and report pointers are retained in the new
maintenance record before removing the current-acceptance fields. Candidates,
reviews, rounds, author runs, other entry fields, all historical runs, every
non-target problem and the queue remain preserved. Only the completed current
pointer is cleared and recorded, expected HEAD advances to the request commit,
and normal update timestamps/maintenance metadata are added. No review budget is
reset and no new acceptance is asserted.

## Normal resume and publication

The real campaign's fix path reads the pinned request through `prior_report` and
then creates a distinct reviewer run. Because #780 is explicitly checked as the
first nonterminal entry and is in fix phase, it starts the new agent before any
later pending #818 registration. This avoids the registration-prefix assumption
that caused the earlier import/policy operator defect. Whatever phase #818
reaches at its natural boundary remains unchanged for ordinary later continuation.

Publication projection uses the actual publisher's candidate/digest validation,
not accepted-minus-released counts. Reopened entries are excluded from immediate
acceptance eligibility. The operation rejects pending releases, same-digest
pointer refreshes or an immediately due batch, then verifies unchanged ledger
bytes through fresh resume. A later changed, newly accepted #780 is eligible
again under ordinary every20 publication; old release history is retained.
No flush, direct public update or fabricated closure is introduced.

The request commit must be pushed exactly before resume. A single ordinary
continuous max6/every20 launch is followed by a new #780 fix run ID, new thread,
turn-start event, native Codex descendant and candidate-HEAD proof. Initial
reopened entries, historical runs, queue and ledger are rechecked. Fresh per-ID
review and explicit COPY-R1 closure remain subsequent requirements and must be
inspected against each new candidate; this transition does not itself prove them.

## Independent verification and limits

`python3 -B specs/reviews/workflow-copy-repair-transition-preparation-20261026/test_reopen.py`
passed all **10 tests** independently. They exercise exact nine-entry changes and
unrelated-history rejection; active-target/budget rejection; request-only tree
adoption and immutable source hashes; wrong-dispatch rejection; stale run/thread,
missing turn/native-child rejection; surviving process checks; changed-runtime
publication selection; and the actual runner entering #780 fix with the pinned
request while preserving the paused #818 entry. Hashes were rechecked afterward.

The suite uses local fixtures and mocked process/publication observations; it is
not a production execution test. Live pins, previous transaction completion,
process exit, locks, clean saved HEAD and launcher environment must still pass
at dispatch. A stage or identity change can safely refuse the operation.

Failure paths retain the receipt and owned STOP, restoring that STOP after a
failed launch if absent without overwriting foreign STOP content. A failure after
Git commit but before state save may leave HEAD/state disagreement, and a failure
after reopening/push preserves that completed work: both require inspection,
not automatic retry, reset or a second worker. No acceptance rollback or active
agent signal is used. The separate #818 resource observation is outside these
fixed request documents and remains a follow-up for its frozen independent review.

Root must authorize the exact reviewed operator and pins before dispatch and
inspect the resulting receipt/native fresh-run evidence before claiming success.
