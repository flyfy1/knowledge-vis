# Proposal: verify manual source copying with the browser host's shortcut

Status: independently reviewed and adopted at the boundary recorded in
[the adoption receipt](../reviews/clipboard-policy-adoption-20261025.md).
Applies to future candidate tests. Existing frozen candidates and historical
reports remain unchanged.

## Observed failure and purpose

The #639 Mac verification found a test harness assumption, not a lesson runtime
failure. In native Mac Chromium, the fallback retained focus and selected all 764
source characters, but the test's Linux Control+c shortcut left the clipboard
sentinel unchanged. Meta+c copied the exact canonical source. Adding a 200ms delay
to Control+c still failed. The original suite's Mac failure and the separate
key-only adapter's success are both retained in
[the verification report](../reviews/639-review-mac-candidate-20261025.md) and
[the three-case probe](../reviews/639-evidence/mac-candidate-b96c90a-20261025/clipboard-probe.json).

The existing rendered-state contract already requires actual manual copying and
exact source comparison. Clarify its test boundary so an incorrect shortcut is
not mistaken for broken lesson behavior, and a visible selection is not mistaken
for a successful clipboard transfer.

## Proposed addition to rendered-state contract section 4

For the manual-copy fallback, use the copy shortcut of the operating system
hosting the browser: Meta+C on macOS, Control+C on Linux/Windows. A page's locale,
mobile viewport, or user-agent emulation does not establish that host platform.
For a local browser, the runner host can supply it; record it explicitly when
the browser runs remotely. Do not infer a remote browser's shortcut solely from
the test client's platform.

Check the fallback's focus and full selection, dispatch the actual copy action,
and read back the clipboard for comparison with the canonical source. Start with
a distinct sentinel so stale clipboard contents cannot satisfy the assertion.
Do not replace this path with a test-written canonical clipboard value, DOM-only
selection checks, or weakened equality. Preserve the existing explicit newline
conversion and exact download/mirror requirements.

When an original frozen test uses the wrong host shortcut, preserve its failure
and diagnose it before assigning a runtime defect. A separate, documented
platform adapter may change only the shortcut needed by that host; retain the
original assertions and bind both versions and results to the same candidate.
Name which original or adapted command passed. If clipboard readback is unavailable
in that environment, record that verification gap instead of claiming transfer
success. A harness correction alone is not a runtime repair or lesson acceptance.

## Scope and adoption

P0 and highest-return change: add the clarification above to the existing source
parity gate. The application source, UI, algorithm, scoring rubric, and review
workflow do not change. The separate reviewer should verify that the proposal
matches the retained red/green evidence and does not weaken exact-source checks.

P1: apply the native shortcut when writing or changing a relevant future browser
test. P2: none. Deferred: a shared clipboard abstraction, a new test framework,
an exhaustive operating-system/browser matrix, and retroactive edits to all
accepted lessons. None is justified by this one test assumption.

Adopt only after active independent lanes have been imported at a safe boundary;
their current shared-policy fingerprints must not be changed during review.
No acceptance is conferred by this proposal or its review.
