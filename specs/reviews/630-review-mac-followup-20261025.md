# Dispatcher native Mac verification of the second #630 repair

Date: 2026-10-25. Frozen candidate:
`a8c3514e2f4ea426d27e1a44aa852ef47ce7d664`.
This supplies platform evidence for a fresh independent review, not acceptance.
The previous accepted review, first repair failure records and required findings
remain unchanged.

The unchanged original clipping probe passes all 20 states on native Mac
Chromium 151.0.7922.34. The candidate's expanded control regression passes all
45 states: five presets, 320/390/1440, EN→ZH→EN, full visible input arrays, explicit
count scope and selected-label geometry. The original candidate browser suite
also passes; no adapter or assertion weakening was used for this second repair.

Inspected the English replacement and impossible selector groups and the Chinese
replacement group at 320px. The English label now states `Input preset · maximum
courses`; the selected 2/0 course counts are clearly scoped, full and readable.
Chinese states the equivalent maximum selectable-course meaning. The 16px native
selected type and shared font/layout contract remain unchanged. This addresses
the observed clipping and visible-scope portions of 630-MAC-001/003 against this
candidate, subject to the separate reviewer's final assessment.

The browser source-parity check now seeds and verifies a distinct non-source
sentinel before invoking the actual host copy shortcut, retaining full focus,
selection and canonical equality checks. Its native Mac result records Meta+C
and exact transfer. The additional original `clipboard-transfer.cjs` passes all
six EN/ZH negative-control cases: historical stale-source/no-action equality
still reproduces the old false positive; sentinel/no-action fails equality;
sentinel/host-copy replaces the sentinel with the complete 424-character source.
Thus merely selecting the fallback cannot satisfy the repaired assertion. This
is evidence for 630-MAC-002 closure, not a claim that the original flawed test
proved copying. No application copy implementation was changed.

The isolated Git archive's 297 selected tracked files matched the exact candidate
before and after both test runs. Canonical Python, core algorithm and application
behavior remain unchanged; their numerical suite was already verified and was
not needlessly repeated for these copy/test changes. All outputs went outside
the archive. The host shortcut uses the unmodified browser platform value in
this locally launched browser; no emulated or remote-host claim is made.

Evidence: [mac-repair-a8c3514-20261025](630-evidence/mac-repair-a8c3514-20261025/).
Receipt, original-probe results, control/browser results, clipboard regression
source/results and inspected screenshots are retained. Reproduction uses the
frozen candidate's tests/preset-labels.cjs, tests/browser.cjs and
tests/clipboard-transfer.cjs plus the unchanged archived original clipping
probe, with PREVIEW_ROOT set to its local server and OUTPUT_DIR outside the
candidate. The original probe's hash is in the receipt. Browser viewport widths
are emulated; physical-device and public-delivery results remain unverified.

Dispatcher next action: attach this evidence before a new full independent review
of all three findings. No required implementation defect remains observed by
these scoped checks; only that independent review can restore acceptance.
