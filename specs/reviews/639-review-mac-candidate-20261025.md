# Dispatcher Mac candidate verification — #639

Exact candidate: b96c90a99bc3eb8b09b07e14e977fe380053df98. This is a dispatcher
platform check while independent review is running, not an acceptance report.
All archived tracked lesson and shared runtime bytes were compared with that
Git revision. No live lane or production files were changed.

Canonical Python passed 2,568 digit-expansion/cut-mask oracle inputs and the
length-100,000 boundaries; the browser model passed 11,881 intermediate states.
Native Mac Chromium 151.0.7922.34 then exposed a test-platform mismatch: the
original browser script hardcodes Control+c for manual fallback copying. Its
assertion read the untouched sentinel. The original full script did not pass Mac.

The red-capable probe tested three hypotheses in fresh contexts. Focus and the
complete 764-character selection were present in every case. Control+c left the
sentinel unchanged, including after a 200ms read delay; Meta+c copied the exact
source. Confirmed cause: a Linux copy shortcut in the test, not loss of selection
or failed source transfer in the lesson. The archived original remains unchanged.

A separate Mac adapter changes only that key to Meta+c on darwin. All original
assertions remain. With that explicit adaptation, the full browser suite passed:
both locales, presets, coefficient and trace interactions, prediction changes,
keyboard controls, actual native clipboard success and selected manual fallback,
exact source download/mirror/display parity, blocked storage, offline display,
local assets, selected-label geometry and 320/390/736/1440px and CSS zoom checks.
There were no runtime errors; combined CSS is 12,035 bytes. Its report has 26
observations. The test's local-request assertion also hardcodes port 18783, so this
check served the frozen archive on that port instead of claiming arbitrary-origin
portability. These are harness limits, not newly found lesson runtime defects.

Inspected English title/link at 320px, English trace at 320px, Chinese prefix
ledger at 320px and Chinese 200% CSS zoom. Prefix values, indices and completed /
current labels remain legible; the narrow ledger stacks vertically. This verifies
sampled states on desktop Chromium with emulated widths, not a physical phone,
human teach-back or public delivery. Independent review still determines acceptance.

Evidence: [mac-candidate-b96c90a-20261025](639-evidence/mac-candidate-b96c90a-20261025/).
The receipt binds Git identity, original and adapted tests. The probe retains red
and green shortcut cases. Temporary PREVIEW_ROOT and OUTPUT_DIR served/exercised
only the archive and redirected outputs. Future harness revisions should use the
platform copy shortcut and derive request-origin checks from their preview option;
no frozen lesson or test was silently amended for acceptance here.
