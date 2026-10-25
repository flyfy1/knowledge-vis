# Independent transition review: repeated-copy and fit evidence

Date: 2026-10-25. Reviewed
`specs/reviews/repeat-copy-fit-policy-evidence-20261025/adopt.py`.
Exact helper SHA-256:
`44b290106461702e932a06e65ffffd5b2c4932dccd75eef92d23d4225d8b10e6`.

**Approved at the source-review level; no actionable required code changes
found.** Approval is conditional on the helper's live guards succeeding after
the currently frozen review finishes. This report does not establish that the
running #780 review has completed or that policy has been adopted centrally.

## Exact policy scope

The source revision is pinned to
`0c2cd7c6c676acb19fdb23d87f15eefc1f60089d`. Independently read that revision's
policy bytes and compared them with the previous approved policy. The diff is:
the reviewed section 4 per-attempt clipboard sentinel replacement; the reviewed
section 8 distinction between a failed width budget and observed clipping; and
an appended provenance/adoption-status note. No scoring, acceptance threshold,
runtime, publisher, or unrelated policy requirement changes.

Verified source identities:

- Previous full contract:
  `226a94fb0cd222398b710718253d7ed46cd77f986ed61eef7e25c14213845dcc`.
- New full contract:
  `d861a659f42607defb40f46505b02d0283be48a533127b40efa8c6bf543c4faa`.
- Proposal:
  `8997483ee9a81fcf5492362826c7eed901dd548d651a9a86738ebd8732291509`.

These match the helper and the [independent proposal review](repeat-copy-and-fit-spec-review-20261025.md).
The four imported paths are explicitly limited to contract, proposal, independent
review, and dispatcher adoption-status documents. Exact changed-path validation
prevents incidental runtime or other documentation edits from entering this commit.

## Safe boundary and preserved state

The transition retains the approved related-links adoption pattern. Ownership
locks and checkout validation require a clean isolated branch at its saved HEAD,
with no running agent records. The helper additionally requires stopped status,
the owned `root-repeat-copy-fit-policy-20261025` STOP, the exact completed
`780-review-754e7a8c5af5` run, the expected frozen candidate and first review, and
the specific accepted repaired #765 candidate.

The allowed #780 outcomes match the campaign's actual phase contract:
`accepted` leaves `phase=register`, while a nonterminal `changes_required`
review leaves `phase=fix`. The loop checks STOP before executing that next phase.
A blocked result or unexpected phase fails these guards instead of being silently
converted into a supported outcome.

The helper preserves the full 984-entry queue, every problem entry and every run
by equality checks. It only updates the saved HEAD, clears the completed current
pointer, and appends the maintenance receipt. Thus #780 registration/fix resumes
normally; no old review, candidate, score, or #765 acceptance is rewritten. It
requires no pending release and the expected historical release, never writes
the ledger, and checks its complete bytes remain unchanged.

The original continuous launcher is invoked after releasing ownership. This
helper neither reconciles nor starts an older stopped lane. Any later reuse of
such a lane needs its own shared-policy identity check; this central adoption
does not imply compatibility with an older frozen lane.

## Crash and operational limits

The exclusive backup and its directory are fsynced before the durable prepared
receipt. The owned STOP remains through import, commit, progress save, and verified
completed receipt; it is removed only immediately before returning to the normal
launcher. No live review is edited in place.

An interruption can leave imported/staged documents before commit, or a committed
HEAD ahead of progress before its save. Keep STOP and reconcile the backup,
receipt, Git and actual state under locks. After progress is saved, a prepared
receipt or failed launch does not mean adoption was rolled back. This one-time
helper is not blindly retryable; inspect the reached boundary and resume only the
remaining operation.

After execution, the dispatcher must verify the actual resumed process and record
the first subsequent work using the adopted policy. A completed adoption receipt
is not evidence that launch or a new author/fix run actually began. If #780 was
accepted, its pending registration still belongs to the previously frozen review;
if changes were requested, its subsequent new fix candidate can use the new
guidance. Neither branch retroactively changes the completed review's policy.

No helper execution, Pi inspection, source-policy adoption, campaign mutation,
commit or deployment was performed by this reviewer. Only this review was written.
