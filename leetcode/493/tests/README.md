# Reproduce the author checks

Run from the repository root, using the already-running preview at
http://127.0.0.1:18776/leetcode/493/ . No service start, registration or deployment.

```sh
OUTPUT_DIR=/tmp/493-review python3 -B leetcode/493/tests/check.py
OUTPUT_DIR=/tmp/493-review node leetcode/493/tests/core.cjs
OUTPUT_DIR=/tmp/493-review node leetcode/493/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 493 --validate-only
```

`OUTPUT_DIR` defaults to this folder's evidence directory. Browser imports
Playwright via the environment's NODE_PATH and honors
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. Output files (including downloaded Python)
are confined to OUTPUT_DIR. Numerical tests use the actual Solution class,
independently enumerate index pairs, enumerate all length 0..6 arrays over five
small values, use seed 493 for extremes/random cases, preserve caller input,
and check maximum-size arrays. JS tests independently verify every intermediate
prefix, original-block membership, merges and cumulative ledger accounting.
The browser trace is a teaching simulation; it does not execute Python.

Browser assertions cover both languages, every preset and complete trace,
rewind/replay and endpoints, hand-count resets, the three prefix choices,
every prediction option/reveal/change/reset, locale state preservation,
actual clipboard write/read, denied API with selected textarea and native
keyboard copy, rendered/embedded/downloaded source parity, blocked storage,
offline source disclosure, internal anchors, local asset responses, keyboard
focus, measured computed colors, 320/390/736/1440 widths and CSS zoom 2 at 780px.
CSS zoom is a layout emulation, not physical mobile or browser-chrome zoom.
Screenshots include populated halves, trace context and other teaching sections.

These are author self-checks, not an independent review, novice teach-back,
LeetCode submission result or deployed verification. See SELF-CHECK.md for the
frozen candidate's result and inspection boundary.
