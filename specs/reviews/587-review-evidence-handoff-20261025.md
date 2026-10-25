# Dispatcher evidence handoff for 587-MAC-001

The third independent review correctly left the native Mac evidence requirement
open because the separate dispatcher results were not yet available in its
frozen checkout. The subsequent Linux fix run preserved that limitation. Both
historical outcomes are retained unchanged.

Native Mac evidence is now attached in
[the repair verification](587-review-mac-verification-20261025.md), including the
unchanged original regression, 72 passed states, measurements and inspected
screenshots. It verifies c7cbe5d941ea468d521aa27a4c1320e21d69f503.
The follow-up candidate ff9809360318ddc2f63cbe6ea05f912a54955123 changes only
CANDIDATE.json, SELF-CHECK.md and tests/evidence within the lesson. Git comparison
confirms all runtime, source and regression test bytes are unchanged between
those revisions. No unrelated lesson or shared policy changed in this handoff.

The dispatcher has restored review_pending, preserving rounds, runs and prior
findings, so a fresh independent reviewer can assess this evidence and decide
whether 587-MAC-001 is closed. This document does not record acceptance. The
Mac test uses native desktop Chromium with emulated viewport widths; physical
phones and public delivery remain unverified.
