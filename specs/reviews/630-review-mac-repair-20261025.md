# Dispatcher verification of the first #630 repair

Date: 2026-10-25. Frozen candidate:
`e63637783c92d6368918b15ecd9edd2b054e7770`.
This is a dispatcher platform check, not independent lesson acceptance.

## Original clipping reproduction

The unchanged original native Mac probe passes all 20 states (five presets,
EN/ZH, 320/390). The added control regression passes 45 states including 1440
and EN→ZH→EN. Native Mac Chromium is 151.0.7922.34; the browser suite also passes
with no runtime errors. The Git archive's 241 selected files were compared with
the exact candidate before execution and their hashes checked afterward.
No candidate bytes changed. The canonical Python, core, app and styles are
unchanged from the previous candidate; algorithm tests were not unnecessarily
repeated in this platform check.

Inspected the Mac closed controls for replacement, impossible and ties at 320,
plus the ordinary English narrow stage. The selected labels fit completely.
This supplies native-platform evidence for the clipping part of 630-MAC-001;
the independent reviewer retains responsibility for eventual closure. It does
not resolve the count-scope ambiguity below. The stage capture contains the
existing sticky navigation over the scrolled stage; it is not a claim that an
element screenshot shows every portion of that stage simultaneously.

## 630-MAC-002 — required: manual-copy assertion accepts stale clipboard data

The newly added assertion in `tests/browser.cjs` reads canonical source already
put in the clipboard by the preceding successful-copy test. It does not seed a
distinct sentinel before the fallback. On Mac it also presses Control+C despite
the local browser requiring Meta+C. The full test nevertheless passes.

The separate three-case probe records full focus and selection (0..424) in each
fresh browser context. With canonical source seeded and **no copy action at all**,
the equality assertion passes. With a distinct sentinel and Control+C, the
clipboard remains the sentinel and equality fails. With the same sentinel and
Meta+C, actual canonical transfer succeeds. Thus the failure is in the test's
ability to distinguish a transfer from old clipboard data, not in the lesson's
manual-copy functionality. This negative control is red-capable evidence of the
false positive; the source value is independently read from solution.py.

Required repair: seed a distinct non-source sentinel immediately before the
fallback scenario, retain full focus/selection and canonical equality assertions,
and use the local browser host's actual copy shortcut. Do not replace copying
with a test-written canonical value. Retain this first repair's historical
evidence and disclose the earlier assertion limitation; do not describe this
original passing browser run as proof of actual manual transfer. The existing
rendered-state contract section 4 already requires real copying; this finding
does not depend on the separately proposed clipboard clarification being active.

## 630-MAC-003 — required: English preset count scope remains unstated

At 320 the visible group says `Input preset` then `Replace: 2 courses`, while the
actual input has three courses. `Impossible: 0 courses` represents an input with
two courses. The number is the optimal selected-course count, but the English
selected label/group does not say that; Chinese explicitly says `可选`.
The width regression checks a number plus its unit, which cannot verify its
input-versus-output scope. This is the ambiguity that the original repair
request and rendered-state contract section 8 require shortening to preserve.

Required repair: state visibly in the localized selector label/group or selected
value that the number is the maximum selectable/retained course count, while
preserving preset identity, full visible input and 16px type. Keep every selected
label readable at the existing widths and locale roundtrip. Do not remove the
count, widen the page, change shared fonts or weaken the original probe. Update
the regression's semantic check to cover the actual visible scope, then rerun
the unchanged native Mac clipping probe for the new frozen candidate.

## Handoff and evidence

Required open work: 630-MAC-002 and 630-MAC-003; 630-MAC-001 awaits final independent
closure against the next repaired candidate. Run one scoped fix, freeze it, attach
the next Mac results, then obtain a separate full review. Historical accepted and
blocked results remain intact; this report does not restore acceptance.

Evidence: [mac-repair-e636377-20261025](630-evidence/mac-repair-e636377-20261025/).
The original probe and new negative-control source, results, candidate receipt,
control/browser results and inspected screenshots are retained there. Commands:
`node original-preset-probe.cjs`, `node leetcode/630/tests/preset-labels.cjs`,
`node leetcode/630/tests/browser.cjs`, and `node clipboard-negative-control.cjs`,
with the frozen archive served via PREVIEW_ROOT and OUTPUT_DIR outside it. The
negative-control probe runs from the frozen repository root and uses CANDIDATE
only for the evidence label. These are desktop browser checks with emulated
widths; no physical-device or public-delivery claim is made.
