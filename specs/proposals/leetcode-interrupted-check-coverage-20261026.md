# Interrupted browser checks: explicit coverage reconciliation

Status: proposed clarification, not adopted into the active review contract.
No lesson acceptance, prior report or runtime policy is changed by this document.

## Observed case

The frozen #980 candidate `a440fe53769a1831f8e2f8f4f4bbd0195ff0906c`
received an independent review that correctly retained a browser-harness exit 1
and used a separate successful audit. That replacement covered many interactions
and source-transfer paths, but did not exercise the original harness's late
unavailable-storage, file-opening and request-allowlist checks. Its completion
summary was broader than the checks captured by that replacement command.

The dispatcher subsequently commissioned focused supplemental checks against the
same frozen lesson, rather than treating the interrupted command as successful.
Keep the original report and failed execution intact; attribute supplemental
results to their own run. This is an evidence-coverage issue, not proof that the
lesson itself was defective or that the unexplained browser closure had a known
cause. See the #980 report and supplemental records in
`../reviews/parallel-975980-evidence-20261026/`.

## Proposed addition to the review gate's incomplete-evidence section

When a required check is interrupted, retain its exit status and completed
evidence. Before claiming coverage complete, reconcile the affected requirements
with the checks that actually finished. A replacement command's exit 0 proves
only the checks it executed. Identify remaining gaps explicitly and close them
with qualifying existing evidence or focused checks on the same frozen candidate,
or leave the corresponding
gate pending. Do not infer that a replacement covers the interrupted command's
later cases merely because both are described as browser tests.

Name the evidence source for each recovered area, including whether it is an
inspected author result, an independent reviewer run, or later supplemental
verification, consistent with the existing independence requirements. Preserve
failed and incomplete receipts; do not relabel them as passes. A compact mapping
of affected requirement, completed evidence and remaining gap is enough. This
does not require rerunning unrelated checks or introduce a new scoring dimension.

## Adoption boundary

Review this wording separately before changing the active contract. Do not add
it to the already reviewed #975/#980 import and overlapping-state patch scope.
Existing accepted lessons are not automatically reopened. Any future adoption
must preserve historical candidate policy identities and current agent boundaries.

Independent wording review by the campaign-review agent found no required
correction after comparing the active contracts, original #980 report, replacement
command and supplemental results. The final wording incorporates its clarification
that qualifying existing evidence may close a gap; focused reruns are not mandatory
when that evidence already satisfies the existing requirement. This wording review
does not adopt the proposal or confer additional lesson acceptance.
