# Reproduce the author self-check

Run from the repository root with Python 3 and the installed Playwright package:

```bash
OUT_DIR=/tmp/lesson-126-check python3 leetcode/126/tests/test_solution.py
OUT_DIR=/tmp/lesson-126-check node leetcode/126/tests/browser.cjs
```

The browser test uses the already-running preview at
`http://127.0.0.1:18780/leetcode/126/`. Override its full lesson URL with
`PREVIEW_URL`. It uses `NODE_PATH` and
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` from the environment. No service is started.
All generated JSON and screenshots go to `OUT_DIR`; the default is
`tests/evidence/`. Set it when reviewing a frozen candidate.

`test_solution.py` executes the real Python class/method against independently
enumerated simple paths, tests the displayed whole-path BFS baseline, and runs
the JavaScript simulation for the same cases. It checks intermediate distances,
edge legality, no duplicate parents, retained parents and complete terminal parent
sets. It also verifies input preservation, official examples, maximum dictionary
size and width, and a five-dimensional binary cube with 120 shortest routes.
The source mirror is compared byte-for-byte with `solution.py`.

`browser.cjs` exercises every preset in both locales, all trace endpoints, replay,
rewind, reset, range input, prediction choices/reveal/change, locale preservation,
clipboard success/denial, downloaded source, keyboard Enter/Tab/focus, every local
link/anchor, storage denial and offline interaction. Screenshots cover both
languages at 320, 390, 736 and 1440px; 200% CSS zoom and a 720px reflow viewport
exercise enlarged rendering. These are Chromium desktop emulations, not physical
phone or browser UI zoom measurements. The test measures rendered text/background
contrast, shared palette pairs, focus outline and control target sizes; it also
checks runtime errors, HTTP failures and CSS bytes.

`OUT_DIR=/tmp/lesson-126-check node leetcode/126/tests/inspect.cjs` regenerates
focused enlarged layer and narrow header captures. Sticky navigation is hidden
only while capturing the tall zoom element, to avoid a screenshot stitching
overlay; the real navigation remains tested by `browser.cjs`.

Inspect the screenshots rather than treating screenshot production as a visual
pass. The author records their inspection in SELF-CHECK.md. None of these checks
is an independent lesson review, actual learner research, public deployment
verification, or a LeetCode submission result.

`build_page.py` only rebuilds this lesson's static HTML from its local skeleton.
It never reads or writes another lesson. It is unnecessary for running tests.
