# Reproduce the author checks

From repository root, using the already-running preview:

```
python3 -B leetcode/632/tests/test_core.py
node leetcode/632/tests/browser.cjs
node leetcode/632/tests/accessibility.cjs
python3 -B scripts/register_leetcode_lesson.py 632 --validate-only
```

Browser scripts require `playwright` via the existing `NODE_PATH`; they honor
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when set. `PREVIEW_ROOT` can override
`http://127.0.0.1:18782`. No test starts a service. All evidence-producing tests
accept `OUTPUT_DIR` (absolute directory recommended). Set it for independent
reruns to preserve the candidate's evidence. Python is invoked with `-B` so it
does not write imported source bytecode.

`test_core.py`: canonical Python and JS simulation versus independent Cartesian
choice enumeration, exhaustive sorted rows, seeded randomness, every-frame
pointer/coverage/best/discard dominance checks, maximum-size fixtures, source
mirror and duplicate localization key checks.

`browser.cjs`: real Chromium against local preview, bilingual controls, all
presets and every trace transition with rewind/replay, all prediction choices,
reveal/change/reset, locale preservation, keyboard, native clipboard write/read,
deterministic clipboard-denial fallback and payload interception, exact DOM/
source/download parity, file:// offline initialization, storage denial, internal
links, local assets, contrast, 320/390/736/1440 widths, desktop 200% CSS zoom,
forced colors and reduced motion. Browser screenshots include independent
component captures to avoid mistaking sticky navigation overlays in a tall
viewport capture for diagram clipping.

`accessibility.cjs`: every closed select label at 320px, measured control sizes,
actual computed foreground/background contrasts, 390px plus 200% CSS zoom and
individual row/readout screenshots. CSS zoom is a synthetic Chromium layout
check; real device/browser toolbar zoom and assistive technology are unverified.

The output reports are author self-checks, not separate review or learner tests.
