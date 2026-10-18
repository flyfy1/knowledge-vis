# Reproduce the author self-check

From the repository root, with the existing preview server running:

```sh
python3 leetcode/84/tests/test_solution.py
node leetcode/84/tests/test_core.cjs
node leetcode/84/tests/browser.cjs
```

`NODE_PATH` must expose the installed `playwright` package. The browser test uses
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when provided. It never starts a server.
The default preview root is `http://127.0.0.1:18774`; override with
`LESSON_PREVIEW_ROOT` if reviewing elsewhere.

All three scripts accept `LESSON_OUTPUT_DIR`. Point it at a separate output
folder to preserve the candidate and its archived evidence, for example:

```sh
LESSON_OUTPUT_DIR=/tmp/review-84 python3 leetcode/84/tests/test_solution.py
LESSON_OUTPUT_DIR=/tmp/review-84 node leetcode/84/tests/test_core.cjs
LESSON_OUTPUT_DIR=/tmp/review-84 node leetcode/84/tests/browser.cjs
```

Python disables bytecode writes. The tests do not edit lesson source files.
The Python oracle enumerates intervals and recomputes minima. The JavaScript
oracle independently tests contiguous runs at every distinct candidate height.
Intermediate tests verify stack order, pending-height conditions, excluded
boundaries, valid rectangle heights, candidate area, accumulated maxima, complete
push/pop counts, snapshot independence, and deterministic replay.

Browser checks operate real controls in Chromium, test all nine presets in both
locales, inspect every endpoint, rewind/replay, preserved locale state, all three
prediction answers, feedback clearing after changes, keyboard/focus, forced colors,
clipboard success and denial, exact source/display/copy/download parity, denied
storage, direct local-file opening, related anchors, local network errors,
320/390/736/1440px layout, and 200% CSS layout zoom. The latter exercises browser
layout and readable scaled geometry, not the desktop Chrome toolbar zoom control.
Screenshots require human visual inspection after rerunning.

These checks are computational/browser author evidence. They do not constitute an
independent review, an observed novice learning outcome, or an accepted LeetCode
submission. See `../evidence/SELF-CHECK.md` for the frozen candidate's observations.
