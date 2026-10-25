# Independent review: import 960/964 and reopen 818/964

**Approved for separately authorized exact dispatch; no required changes found.**
This approves the prepared operation, not future lesson fixes, independent
acceptance of those fixes, or public delivery.

- Operator SHA-256: `600583b0d1f8e53310e4342cd1292805ba2b130eba4f38a67c8db503d7594af0`.
- Companion pins SHA-256: `41b1113194004167423e42f20ac9f2c4d2f8069709dc0187c5525c433e2f6d93`.
- Two #818 document source: `7236925f69c0e7183a313c02e123b5d68a8e91f6`.
- #964 request source: `ca4622c7af1d498ab4fa02dc76a40b44161d715f`.

The separate reviewer read the full operator, pins, README and tests, compared
actual campaign/importer/publisher semantics, independently ran all 12 focused
tests successfully (0.781 seconds), and rechecked both exact hashes afterward.
No SSH, production mutation, agent launch, STOP, state change or dispatch was
performed for this review.

## Imported and reopened history

Preflight pins each completed/exited lane's exact head, accepted entry, progress,
runs, report and reservation. The unchanged importer revalidates independent
review/run provenance, shared-source compatibility, permissible lane history,
central ownership and absence of collisions; it retains the lane parent and
copies original run evidence with its source directory recorded. Existing central
problems, queue, runs and import history are checked after both imports.

The only new Git adoption is the exact three numeric-review documents. Their
source mapping, hashes, paths, file modes, absence before adoption, single-parent
commit, post-hook bytes and clean checkout are verified. Numeric-review document
paths are already excluded by the importer's shared-file comparison; this does
not weaken shared policy or importer behavior.

Only #818 and #964 are reopened through ordinary `changes_required` / `fix` and
their new request pointers. Existing candidate, reviews, rounds, author runs and
all other problem fields remain. Prior accepted timestamps, registration commits
and report pointers are retained in maintenance metadata and a state-only backup.
The previous current pointer is recorded before clearing. #960 remains accepted;
#964's historical 92.5 acceptance and selected optional advisory remain historical,
not a fabricated new finding or acceptance. Review budgets are retained.

## Publication and natural registration

The publication guard uses the actual `_reviewed` acceptance/digest validation.
Its conservative set union includes changed-digest eligible IDs, incoming lanes,
all pending registrations and both reopened IDs, deduplicated and strictly below
20. It therefore counts a revised previously released #780 correctly, without
accepted-minus-released arithmetic. The guard runs before STOP, at the stopped
boundary, after import and before resume; a stage transition cannot silently
bypass the authoritative stopped-state check.

An existing pending release or a same-digest receipt-pointer refresh refuses the
operation. For already-released pending registrations, only a deep copy receives
an accepted-status projection; existing registry metadata and immutable review
identity must validate through unchanged `_reviewed`. Incompatible metadata
refuses instead of inventing future registry content. Neither projection nor
eligibility checking writes persistent state or ledger. Unreleased pending IDs
are conservatively counted without requiring premature registration.

Resume explicitly predicts deterministic registration prefixes before the next
agent. The real runner performs them. The operator verifies original review
metadata, exact permitted entry deltas, single-parent registration ancestry,
registration-only paths, subject/trailers, retained registry rows and the final
candidate/expected/actual HEAD. The new agent must start at that proven head.
Both the operation commit and any proven registration head are pushed by exact
hash, avoiding a moving-HEAD push while a new author works.

## Ownership, failure and evidence limits

One exclusively owned STOP requests an ordinary stage boundary; no active agent
is signaled. Existing state/checkout and release locks cover mutation. Surviving
checkout/native/preview processes, changed pins, inconsistent saved HEAD or a
foreign STOP fail closed. Resume requires a new run ID and thread, turn-start
event, native descendant, one central runner and exact max6/every20 flags. It
retains historical runs, ordinary metadata, imported entries, queue and unchanged
ledger bytes. Original active stages and subsequent repairs continue through the
existing runner; no extra queue or alternate worker is created.

The 12 tests cover reopening/history and budget guards, exact document scope,
changed released-digest selection, threshold/deduplication, projection immutability,
pointer/metadata refusal, stale session/native evidence and real ordinary
registration in an isolated Git repository. Publisher/process portions use mocks;
they establish guard behavior, not live production readiness. Actual pins,
processes, locks, source hashes and public-state conditions must still pass at
dispatch. Fresh per-ID reviewer closure remains subsequent work.

Partial imports, request commits or completed reopening are preserved on failure;
the receipt identifies inspection-required state. The owned STOP is retained or
restored if absent, without replacing foreign content. No automatic retry, reset,
acceptance rollback or second worker is permitted. Root must separately authorize
these exact reviewed bytes and inspect the completed receipt, exact pushed head
and fresh native-agent proof before reporting successful execution.
