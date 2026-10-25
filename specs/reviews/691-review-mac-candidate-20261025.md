# Dispatcher Mac verification — #691

Frozen candidate: `d567dd00bc05b3a4f86493dc28149d1fe3235660`.
Date: 2026-10-25. Supplemental platform checks, not independent acceptance.
All 143 selected exported files matched immutable Git bytes before and after
testing. Original tests were unchanged; every output stayed outside the archive.

## Passing checks and their boundaries

The original `check.py` passed 2,542 exhaustive cases, 350 seeded cases and eight
boundaries against a separate position-mask BFS oracle. It checked 52 traces,
1,822 events and 215 newly memoized states, including child count subtraction,
strict progress, unchanged parent arguments, completed-state oracle values and
candidate minima. It also executes the actually displayed baseline on 80 small
cases and checks exact offline source mirror and duplicate localization keys.

The original browser suite passed 14 full preset/locale traces and eight semantic
records, including hand clipping, prediction options, replay and locale state.
Original exact source display/copy/download/offline checks passed. An additional
probe covers native manual-copy fallback separately in English and Chinese:
seed a distinct non-source sentinel, force write rejection, verify the sentinel
still exists, assert focused full source selection, dispatch actual Mac Meta+C,
then read back exact canonical bytes. Both locales pass; no test-written source
substitutes for the actual keyboard transfer.

The original suite also passed keyboard/focus, forced colors, reduced motion,
local links, denied storage, local requests and source parity. Combined CSS is
11,725 bytes; minimum sampled contrast is 7.07885:1. The inspected English 320px
trace shows event 10/32, pending final answer, three active calls, only completed
F(empty)=0 in memo, and reuse of that completed entry in history. The Chinese
390px hand example clearly shows remaining a:2 and b:1 before clipping.

These broad checks do not establish complete native-label visibility. The
additional selected-label probe below is red and prevents device-readiness.

## Required native-label defect — 691-MAC-01 (open)

English preset 6: “Length-15 target, missing letters · −1”. Native Mac Chromium,
viewport 320×950, ordinary closed #preset. The unchanged geometry probe records
28 preset × locale × width observations. At 320px, this label measures
291.44561767578125px against 230px content width even before allowing native
arrow space. It exits 1 with this definite-overflow failure; the wrapper's
RuntimeError records the same red check. Inspected screenshot visibly loses the
end of “letters” and the result. At 390px the necessary zero-arrow width test
passes, but the inspected ordinary screenshot still truncates the final result
near the native arrow. A passing necessary width test is not visual acceptance.

Expected: complete selected description and result, without shrinking readable
type. Actual: clipped semantic text/result at the required narrow widths.
This violates rendered-state contract §8. Shorten the wording or reflow the
closed control while preserving the maximum-length case and impossible result.
Required regression: the original selected preset at 320/390, both locales and
locale roundtrip, actual-font records and inspected native screenshots. Keep
this red evidence and test any repair against the frozen source before closure.

Ranked falsifiable hypotheses for repair validation: (1) label length exceeds
native text space, so shortening only the label restores complete display;
(2) locale switching changes the label, so before/after text would differ;
(3) another surface obscures the control, so an isolated ordinary control capture
would restore the text. Current width evidence and isolated screenshots support
(1). No candidate mutation or repair has been performed by the dispatcher.
The separate reviewer is still active; its result is not preempted here. A STOP
requests the natural post-review boundary to attach this evidence before the
next fix/review stage. This report does not manufacture an independent score.

Evidence: `691-evidence/mac-candidate-d567dd0-20261025/`, including original
command log, receipts, probes, results and inspected screenshots. CSS zoom:2 and
emulated viewports are not physical-device or browser-chrome zoom evidence.
Tall component captures hide sticky navigation only while capturing; ordinary
control screenshots above do not. Public delivery and judge acceptance remain
outside this verification.
