# Author checks for #488

Run from repository root; use the already-running preview server:

```sh
python3 -B leetcode/488/tests/test_solution.py
python3 -B leetcode/488/tests/test_contract.py
node leetcode/488/tests/test_core.cjs
node leetcode/488/tests/browser.cjs
node leetcode/488/tests/zoom.cjs
python3 -B scripts/register_leetcode_lesson.py 488 --validate-only
```

All emitting test scripts accept `OUTPUT_DIR=/absolute/reviewer/output` to avoid
writing into the frozen candidate. Browser scripts also accept `PREVIEW_ROOT`.
They honor `NODE_PATH` for the installed Playwright package and
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when present. No server is started.
Python runs with `-B` to avoid creating bytecode in the candidate.

`test_solution.py` executes the original `Solution.findMinStep` against an
independently derived, unpruned breadth-first oracle. Regex normalization differs
from production's scan and splice. Exhaustive boards exclude forbidden initial
runs; internal empty states are separately tested. Runtime tracing observes the
actual Python solver's stable-state, sorted-hand and depth invariants.
`test_contract.py` detects duplicate translation keys before dictionary parsing
can overwrite them, validates pair shapes and static bindings, executes the
visible baseline and checks its exact HTML bytes against `baseline.py`.

`browser.cjs` uses native clipboard reads/writes and keyboard copying for the
manual fallback. It asserts canonical displayed/embedded/copied/downloaded
parity, both locales, all presets at all widths, keyboard scrolling of long rows,
reversible events, complete state captions, quiz/reveal/change isolation, local
asset requests, blocked storage, offline source, focus, forced colors and contrast.
Its CSS-zoom check supplements, rather than substitutes for, `zoom.cjs`.

`zoom.cjs` launches a clean temporary browser profile and a test-only extension
that calls `chrome.tabs.setZoom(id, 2)`. It asserts `getZoom() === 2`, device pixel
ratio 2, and half-width CSS layout. Captures use CDP `Page.captureScreenshot` with
`fromSurface: true`; ordinary Playwright viewport captures were blank under actual
tab zoom in this installed build. The temporary profile is removed in `finally`.
The extension is never loaded by the lesson or requested by its page.

Evidence is author self-check material. It is not independent acceptance,
LeetCode submission evidence, novice teach-back, real phone testing or deployment.
