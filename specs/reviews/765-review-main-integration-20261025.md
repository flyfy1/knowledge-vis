# #765 accepted repair integrated into main

Imported all 152 lesson files from accepted candidate
`8d44249808b43d9d56ad26592d276443a9994649`, as registered at snapshot
`c214c6549b53618d96782b6f827a5018c4c7f6e4`. Every imported lesson byte matches the
accepted tree. Original reports and both review rounds are preserved.
[Integration receipt](765-evidence/main-integration-20261025/integration.json).

The [separate second review](765-review-2-6f37bca9.md) accepted 95/100 with no
required findings. It explicitly closed `765-MAC-MARGIN-01` using the exact
Mac evidence and independently checked current file hashes. The dense graph-proof
passage remains an optional advisory, not silently reported as repaired.

The prior Mac run tested the same lesson bytes: six checks passed, including
the original full browser suite and all 30 preset/locale/width combinations.
The evidence-only handoff did not change runtime or tests; the reviewer verified
that parity before closure. [Mac report](765-review-mac-repaired-candidate-20261025.md).
The incomplete first preview and the original red margin test remain recorded.
No redundant replay of already passing identical code was used to replace them.

The deterministic registrar adds only #765. The collection registry and index
now match the frozen central snapshot; its concept block matches as well.
Pre-existing working-tree concept-map content, root homepage, pages.config.js,
shared runtime/styles and collection code are preserved. Unrelated concurrent
Frozen Bubble changes are excluded from this integration commit.

This is accepted local integration, not a new public release. The central
every-100 publisher still governs course publication. Real learner comprehension,
physical-phone behavior and a successful LeetCode submission are not established
by these tests or reviews.
