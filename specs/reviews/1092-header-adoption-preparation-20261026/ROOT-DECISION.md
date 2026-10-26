# Dispatcher decision for one bounded adoption

Root read the independent operator review, inspected the adapter and its
dependencies, verified the frozen validation hashes, and reran all 13 scratch
fixtures successfully (`root-tests.log`). The reviewed source candidate is
`c3d5761514ebedd5e50297acd937c5380ba12fe0`; its independent local review and
provenance are at pushed revision `5f02a2943d9b6e4194bfa23ca7f9703e03a29784`.

Root generated `adopt-enabled.py` from the archived disabled adapter by replacing
only the one `PINS_SHA = None` literal with the final pins hash. Its SHA-256 is
`10445c4e33fe64f479ddb3d0089c63e44043fb744a5903260bfb11db28aaeee3`, matching the
independently reviewed derivative. The original adapter/validation remain intact.

Under the user's existing campaign authorization, root authorizes one guarded
adoption by `/root/campaign_runner`. This includes a separately recorded fetch of
the exact pushed source branch into the campaign Git object database and transfer
of the exact reviewed operator/inputs into an exclusive external preparation
directory. It does not authorize checkout/merge/reset, silent repinning or replay.
All live stopped-state, process, lock, file, source, policy, queue and eligibility
guards remain mandatory. A failed guard stops the operation.

The authorized transaction preserves all 19 failed experiment files before
removing their originals, adopts only the reviewed 94-path payload, and changes
only `expected_head` in campaign state. Original failure history, open R1 and
release ledger remain unchanged. Partial failures require inspection; no automatic
retry or rollback is authorized. Root requires the execution receipt and exact
post-state/tree checks before any later step.

This authorization excludes native recovery, Git push, production writes and
publication. Those steps remain separate. This document is an execution decision,
not evidence that adoption has already succeeded or that central review passed.

Built by Codex root; exact model identifier unavailable. Independent operator
review by `/root/review_854_bridge`; source review by `/root/review_1092_header`.
