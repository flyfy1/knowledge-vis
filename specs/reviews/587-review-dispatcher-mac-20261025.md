# Reopened finding — #587 Mac preset clipping

Dispatcher integration audit, 2026-10-25. This is a focused rendered regression
finding, not an independent acceptance review. Preserve both previous reviews.
Affected lesson: candidate `f5816b88f3e7e280e4c89878a0e6490d1a3522e6`, imported
unchanged into central snapshot `6d4a162429acd096d6ebc8c706776077ff610963`.

## 587-MAC-001 — Keep the complete count scope visible at 320px

Required device/readability finding, open. On Mac Chromium 151.0.7922.34,
the existing `tests/preset-scope.cjs` fails its selected-text-fit assertion.
The minimal probe reproduces three English options at 320px: Official 1,
Official 2, and Two pops. Actual screenshots show clipped text, including
`Two pops · 3 boundary tre…` before the native arrow. Chinese and the inspected
wider viewports pass. This is not merely an overly conservative numerical check.

Evidence: [directory](587-evidence/mac-integration-20261025/).
`mac-results.json`, three `en-320-*.png` screenshots, `hypotheses.json`,
`pi-results.json`, both executable probes, and the original regression failure
are retained. No lesson source was modified during diagnosis.

The diagnosed cause is insufficient text room under platform-dependent font
metrics. Both machines produce a 260px control with 15px padding per side and
214px remaining after the test's 16px arrow allowance. The same three strings
measure 219.94/223.06/226.59px on Mac, versus 206.59/206.59/212.75px on Pi.
The CSS font stack is identical: 16px PingFang SC, Microsoft YaHei, system-ui,
sans-serif; actual available fonts and browser builds differ. We do not claim
the exact resolved fallback font on Pi was identified.

Ranked falsifiable hypotheses were stated before testing. The unchanged Mac
baseline fails; a font-only Arial override passes; a padding-only 8px override
passes; an EN→Chinese→EN roundtrip retains the same failures. Thus the label's
width budget, not stale locale state, explains the failure. These temporary DOM
overrides are diagnostic experiments, not a selected or shipped fix. Pi's same
probe passes on Chromium 156.0.8078.4, confirming why its prior checks missed it.
The first Pi probe attempt failed before launch because the harness did not yet
honor the installed Chromium path; it was corrected without installing software.

Fix only the lesson-local presentation/copy needed to keep every selected label
complete with reasonable width margin. Preserve explicit boundary-tree scope,
the number, all six preset identities, canonical code, trace behavior and Chinese
meaning. Do not remove the fit assertion, shrink essential text to make it fit,
or globally replace the shared font. Shorter unambiguous names or a better local
layout are acceptable. Test all six presets, both locales, 320/390/desktop,
locale switching after interaction and the existing count regression.

Read `~/Documents/agent-skills/diagnosing-bugs/SKILL.md` before fixing. Retain the
red reproduction and record the confirmed width-budget cause in the repair
evidence. A fresh independent review follows the new candidate. The dispatcher
must rerun the original Mac regression and inspect its rendered result before
declaring this integration fixed; Pi-only success is insufficient for that claim.
Keep #587 outside accepted publication eligibility until the repair cycle closes.
