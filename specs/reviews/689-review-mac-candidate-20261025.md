# Dispatcher Mac verification — #689

Frozen candidate: `8c07f191c65decdd2e58c7c8b5be9b35d8b8c5d2`.
Date: 2026-10-25. Supplemental platform verification, not independent lesson
acceptance. The isolated archive's 160 selected tracked files matched immutable
Git bytes before and after testing. Outputs stayed outside the candidate.

All four original checks passed without adapters: `test_solution.py`,
`test_core.cjs`, `browser.cjs` and `focused.cjs`. Python passed 79,058 exhaustive,
seeded and boundary cases against direct enumeration of legal triples, including
official examples and maximum-size/maximum-value cases. The core passed 2,793
cases and 62,132 snapshots: every populated earliest side maximum, legal
fixed-middle triple, component sum, best-so-far value and final oracle result.

The browser suite passed 10 complete preset/locale traces, 20 recorded semantic
bindings and 14 layout observations. These include suffix equality replacing the
later index with the earlier one, current-candidate identities/totals, independent
prediction feedback, rewind/replay/reset/endpoints and locale preservation.
Exact canonical source display, offline mirror, copy and download passed. The
focused suite separately seeds a non-source clipboard sentinel in each locale,
denies programmatic write and uses actual Mac Meta+C before exact readback; the
main suite additionally asserts fallback focus and full selection. No canonical
source was test-written to simulate fallback success.

Keyboard focus, forced colors, denied storage, local-file opening, related links,
contrast and local-asset checks passed. Combined shared/local CSS measured 11,803
bytes in this candidate. These current results supersede any earlier self-check
byte count; no source file was changed during the dispatcher run.

Visually inspected English 320px controls, Chinese 390px intermediate trace,
English enlarged header and the keyboard-scrolled suffix table. The Chinese
trace shows tested middle j=3, legal left/right ranges and candidate [0,3,5]
with component sum 3+8+12=23. The table retains its right-summary heading while
scrolled, and uncomputed cells are explicitly pending. The title displays #689
and a separate official link; at 320px plus 200% CSS zoom it remains complete
but long English words break across lines. Narrow navigation is a horizontal
component. Its appearance over an element capture is not treated as numerical
state evidence or proof of a runtime overlap defect.

Zoom here is explicitly CSS zoom:2 in native Mac Chromium, not browser-chrome
zoom or a physical-device test. No online judge submission, public delivery or
human-learning outcome is claimed. The separate reviewer still must judge the
complete lesson and any required findings.

Evidence: [Mac candidate records](689-evidence/mac-candidate-8c07f19-20261025/).
The receipt, original command log, results, inspected screenshots and runner are
preserved with SHA-256 hashes. Original result labels say “author self-check”;
these archived copies were rerun by the dispatcher on Mac against the frozen
candidate. Use the included runner with its frozen archive and external output
directory to reproduce without editing any candidate file.
