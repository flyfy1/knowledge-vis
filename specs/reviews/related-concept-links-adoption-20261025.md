# Related-concept guidance: adoption evidence

The [document review](related-concept-links-spec-review-20261025.md) approved
section 12 and the dispatcher adopted both bounded recommendations. Source commit:
`e40e6260e7ecfd6693f70442a306acf5416cf9b4`. The
[adoption request](related-concept-links-adoption-request-20261025.md) preserves
the already frozen #239/#736 reviews and requires an idle boundary.

## Separate maintenance-helper review

The independent `clipboard_policy_review` agent approved the one-time helper at
SHA-256 `15bc57293d4388ad371cbff81680bb4afab18b3b24d7e6ef9c5ab591cca16456`.
It confirmed the runner's phase contract: after a completed review, acceptance
leaves `register`, while a first-round required repair leaves `fix`; STOP is
checked before either next action. Locks, clean saved HEAD, completed run, exact
candidates, owned STOP and release conditions establish the intended boundary.

The pinned source's full-file and section hashes match independent document
approval. Existing policy text is preserved apart from terminal whitespace.
All problem entries, runs, the full 984-item queue and release-ledger bytes must
remain unchanged. Clearing the completed `current` pointer preserves #736's phase.

The initial helper draft used #736's author commit as its candidate precondition.
Live state and runner source showed review startup freezes the then-current HEAD:
`fd5760e3a18bdc79f365db1aa62bea9e38b2671f`. The one-line correction was separately
rechecked and is included in the exact approved hash above. The original author
commit remains in history; no lesson bytes or review result were changed.

Interruption limitations: a crash after Git commit but before progress save leaves
a deliberate HEAD mismatch and STOP, requiring reconciliation under locks. A
completed receipt followed by launcher failure means adoption succeeded but the
runner may not have resumed. Do not blindly rerun this one-time helper. Actual
process verification is separate from the receipt. The reviewer did not execute
the helper or inspect live Pi state; live identity checks belong to the dispatcher.

## Completed adoption and resumed queue

After #736's reviewer accepted at 96.25/100, the runner stopped normally before
registration at HEAD `78ba6f113e8c744b93e7abc24af7eeefe5d601f5`. Neither runner nor
reviewer process remained. Executed the exact reviewed helper at 2026-10-25
07:30:47 UTC. It adopted source `e40e6260e7ecfd6693f70442a306acf5416cf9b4` as central
commit `008d48d81165f5db9a2708ca1ff889ede614d1b6`.

[Completed receipt](related-links-policy-evidence-20261025/adoption-receipt.json)
records prior/next HEAD, the completed #736 review, all paths, backup location,
full-file hash `226a94fb0cd222398b710718253d7ed46cd77f986ed61eef7e25c14213845dcc`
and section hash `27c57059efa5186e8e9f48be316f9adb63c95fe18c377e82de4c1359f814fa2f`.
The [exact helper](related-links-policy-evidence-20261025/adopt.py) is archived for
audit and must not be blindly rerun.

The completed receipt was reread, the owned STOP removed, and the original full
continuous launcher resumed. Subsequent state and process checks confirmed runner
PID 883425 and #741 author child PID 883675 live. #736 registered successfully at
`05e85a09f9bd4d796aa133ea9710dd9812d45b1e`. The full 984-item queue now has 104
accepted campaign lessons and 36 blocked; #741 is authoring under the adopted
guidance. All historical review/problem/run data was preserved during adoption.
Released count remains 103, pending release is null and STOP is absent.
[Post-adoption snapshot](related-links-policy-evidence-20261025/campaign-after.json).

No release or public-content backup was made. The current published collection
remains the earlier 104 lessons (including its legacy lesson); the repaired #239
candidate and new #736 await the original next 100-eligible publication batch.
