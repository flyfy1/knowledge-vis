# Author checks for #940

Run from repository root with the already running preview at port 18787:

```sh
python3 -B leetcode/940/tests/numerical.py
node leetcode/940/tests/core.cjs
node leetcode/940/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 940 --validate-only
```

All emitting tests honor `OUTPUT_DIR=/absolute/reviewer/output` so the candidate
can remain frozen. Browser honors `PREVIEW_ROOT`, `NODE_PATH` and
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Requires installed Playwright/Chromium.
Browser uses a temporary extension inside OUTPUT_DIR to set real Chromium 200%
zoom, verifies DPR=2/innerWidth=640, captures through CDP, then removes its profile.
Clipboard tests run on the recorded browser host platform (Linux here), use a
fresh verified sentinel for every manual transfer and dispatch actual Control+C.

Numerical checks execute the original Solution callable, compare to position
combinations through length 8 and seeded cases, and use a separate last-occurrence
recurrence at length 2000. The baseline extracted from the displayed HTML is
executed on all abc strings through length 5. Core checks independently enumerate
position masks for each prefix and verify exact ending sets and recurrence.

Browser checks both languages, six presets, every prefix count, rewind/replay,
endpoints, reset, all prediction choices and changed choices, state across locale,
source display/copy/native manual fallback/download equality including newline,
keyboard focus, forced-colors focus, related-link keyboard activation and actual
section meaning, denied storage, offline file source, selected-label budgets,
320/390/736/1440 widths, native zoom and solid token contrast. Static CSS has no
translucent text surfaces; contrast measurement does not certify arbitrary overlays.

Development corrections before freezing: the first harness tried clicking End
after the single-letter preset was already terminal; it now respects that endpoint.
A malformed test expression and an intended 2000-character fixture of length 1980
were corrected. Screenshot inspection caught primary styling overriding disabled
styling; local CSS now restores solid muted/panel2 disabled roles and the browser
asserts them. Inspection also motivated fitting the four-column history table at
320px, so its total column and caption remain visible without sideways scrolling.
These are author development checks, not independent findings or acceptance.

Evidence is author self-check only. No LeetCode submission, real learner study,
independent teaching acceptance, production deployment or physical-device claim.
