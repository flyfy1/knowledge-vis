# Native clipboard policy adoption boundary

Date: 2026-10-25. The separate proposal review approved the clarification with no
required changes; dispatcher adjudication deferred activation until active lanes
completed. That boundary is now established: #664 and #668 each completed their
independent reviews and were imported, respectively at
`bc8be0e2069737cf5743e4dfbf64e62f997e097a` and
`832fdc60fe62a07352fad272bcaaf4a4d2cd9bc4`.

The central runner is stopped after the second #630 fix, with no running agent
in its state. The owned stop marker is `root-630-native-proof-r2-20261025`.
The pre-adoption central snapshot is `832fdc60fe62a07352fad272bcaaf4a4d2cd9bc4`;
the previous rendered-state contract SHA-256 is
`6140a541d7bff2802bdfce8f0d5f349aa787cde4a6c8874f28b97119f5e5b5da`.

Section 4 now clarifies actual browser-host shortcuts, distinct sentinel seeding,
real readback, preserved equality/newline requirements, explicit test adapters,
and unavailable-readback limits. This is the reviewed proposal's scope; no
runtime, algorithm, UI, scoring or historical acceptance changes are introduced.
The campaign maintenance receipt records the applied commit and new policy hash.

Native platform evidence for #630, #664 and #668 is attached at the same boundary.
Only #630 returns to review_pending for a fresh full assessment of its three
findings. Earlier reviews and author results remain intact. New #675/#679 work
starts from the post-adoption commit; completed lane reviews are not rewritten
as if they had used this later clarification.
