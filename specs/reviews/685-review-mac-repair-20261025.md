# Native Mac repair verification — #685

Frozen repair: `481337f54b1ba4f0d64f0f1a036d275e3e3d245a`.
Original: `cfba14ba99348ea5d37d88f770b9ae595e3b7c4c`.
Required finding: 685-R1-001; independent closure remains pending.

Confirmed cause: the original English selected label exceeds the native control's
available text space at 320px. The minimal runtime repair changes only that
label to “Answer before last row” and its copy-asset query. Its input-order
meaning remains intact. Canonical Python, core simulation, application handlers,
CSS and shared files are unchanged. No font shrinking or layout change occurred.

The dispatcher ran the same original Mac probe against the frozen repair:
20 preset × locale × width records now pass, versus the preserved original's
one definite-overflow failure. English preset 3 at 320 measures 179.64796447753906px
instead of 230.12794494628906px against unchanged 230px content width. The probe
reserves zero arrow width and is only a necessary fit check; ordinary inspected
control screenshots establish complete text and visible arrow clearance here.
The 390px capture also retains the whole label.

The repair's focused regression passed all six 320/390 EN→ZH→EN observations,
retaining preset 3 and frame 0/8. Inspected the 320px English roundtrip and Chinese
viewport captures: full labels, native arrow and 48px control height are visible.
The focused test's literal 16px allowance was documented for its original Linux
control; it is not treated as a universal native-arrow measurement on this Mac.
Both numerical records and actual inspected screenshots support the result.

The unchanged broad browser suite also passed 26 semantic observations and ten
layouts, exact source transfers including native Meta+C fallback, bilingual
states, keyboard/focus, offline/denied storage, links and CSS zoom. Minimum
sampled contrast remains 7.07885:1 and shipped CSS remains 11,778 bytes. Numeric
algorithm suites were not repeated because their canonical/core bytes were
unchanged from the previously passing frozen candidate.

All 183 exported tracked files match immutable Git bytes before and after the
checks; output directories are outside the frozen archive. The runner, command
log, receipts, original probe, results and inspected screenshots are preserved
under `685-evidence/mac-repair-481337f-20261025/`. Original red evidence remains
in `mac-native-clipping-20261025/`; no assertion or original failure was removed.
No physical-device, actual browser-chrome zoom, judge submission or public
release claim follows from these Mac Chromium checks. A fresh independent
review must assess the candidate and close the required finding.
