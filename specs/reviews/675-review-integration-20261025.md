# Integration receipt — #675

Central accepted import: `5e2bb78e3a88902b59356b8dd5ff4e1e51e01d4d`.
Independent accepted candidate: `af7c8d8e84333cc98dc76ad60e7dde8b4e9796ab`.
Round-two report `675-review-2-c1211895.md` accepts at 95/100 with no required
open findings. It independently assesses the preserved native Mac repair proof.
The central acceptance count after import is 93.

The first import attempt rejected a pre-created pending entry before any merge
or import receipt. Verified under the existing ownership lock: zero central 675
runs, default pending/author fields only, no lesson directory, current ID 660,
clean source, and unchanged expected HEAD `1db52b8`. The full state was backed up
as `before-empty-675-placeholder-normalization-20261025.json` outside source.
Only that never-started placeholder was removed, with its complete value recorded
in maintenance history. Queue, runs, other entries and HEAD stayed unchanged.
The unchanged importer then validated both independent reviews and historical
fingerprints before completing the import. No acceptance or review outcome was
manufactured by the normalization.

Local integration preserves all 155 files under `leetcode/675/` byte-for-byte
from Mac-verified repair `7dec91fc5955f310f1b864e65af2d8be3b0bccfe`.
Only #675 is added to the registry; all 93 prior registered entries are unchanged.
Registered-entry count is distinct from campaign acceptance count. Existing
main-only evidence and unrelated untracked user pages are preserved.

The collection browser suite passes 137 checks, including bilingual filtering,
search/navigation and bounded 100/984-entry fixtures. Whitespace checks pass.
Result and reproduction runner are in `675-evidence/mac-integration-20261025/`.
No algorithm or lesson browser checks were repeated during this merge because
all candidate bytes matched the already tested and independently reviewed source.

This is local integration, not a public release. Publication remains governed by
100 additional accepted unreleased lessons and public delivery verification.
