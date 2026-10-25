# Dispatcher integration finding: 630-MAC-001

Date: 2026-10-25. Required finding; this is a dispatcher integration check,
not a new independent acceptance review. Preserve the historical 95/100 review.
Exact candidate: `199626458f9090c4679c9503603902211c977135`.
The integrated lesson tree matches it; runtime files were not changed.

## Reproduction and confirmed cause

The standard algorithm and browser suite passed on Mac, as did 137 collection
checks. Actual screenshot inspection then found the closed native preset label
clipped at 320px: the default replacement label omits its ending and output 2.
The dedicated probe reproduced 3 failing English labels out of 20 checks across
both languages, five presets and 320/390px. The CSS font is 16px with the shared
PingFang SC / Microsoft YaHei / system-ui / sans-serif stack. Mac Chromium
151.0.7922.34 has 214px available after the measured padding and this control's
16px arrow allowance. Label widths are 271.06px (replacement), 233.20px (all
impossible), and 259.62px (tied deadlines/durations). The archived control
screenshot confirms clipping, separately from the measurement heuristic.

A failing assertion was run before ranked hypotheses were stated and tested.
The hypotheses were label length, padding budget, then font metrics. Each DOM-only
experiment changed one factor. Shorter descriptive labels with explicit course
counts fit all three; zero padding alone still fails replacement and tied values;
Arial alone also leaves those two failures. Confirmed cause: overlong selected
labels exceed the narrow control's width budget, with arrays already available in
the separate input readout. This is not evidence that the algorithm is incorrect.
No runtime edits or permanent diagnostic instrumentation were made.

## Required repair and closure

Keep the preset identity, explicit course-count meaning, full input in its visible
readout, and readable 16px type. Shorten or locally reflow the selected value so
all presets are readable beside the arrow in both languages at 320/390 and desktop.
Do not remove or weaken the red probe, hide an essential result, or change the
shared font merely to pass. Add a regression at the rendered-control boundary;
the existing suite only tested outer geometry and missed selected-text clipping.

The original probe must be rerun on native Mac for the frozen repaired candidate,
with results and screenshots available to the independent reviewer before it
closes 630-MAC-001. The reviewer can assess the dispatcher platform evidence;
Linux-only or synthetic stress checks do not replace this particular reproduction.
Preserve previous reports/results; no acceptance is restored by this document.

Evidence: [mac-integration-20261025](630-evidence/mac-integration-20261025/).
`leetcode-630-preset-probe-20261025.cjs` uses installed Playwright plus PREVIEW_ROOT
and OUTPUT_DIR and returns nonzero for clipped selected text; its original run
completed in under a second. `hypotheses.json` records the one-factor experiments.
`candidate.json` records Git identity and hashes. Browser viewport emulation is
not a physical-phone test. No public-delivery claim is made.
