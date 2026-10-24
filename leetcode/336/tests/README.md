# Reproducing the author checks

Run from the repository root, using the already-running preview server:

```sh
python3 -B leetcode/336/tests/test_solution.py
node leetcode/336/tests/test_core.cjs
node leetcode/336/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 336 --validate-only
```

All three test runners accept `LESSON_OUTPUT_DIR` to redirect generated evidence without changing the frozen candidate. Browser tests additionally accept `LESSON_PREVIEW_URL` (default `http://127.0.0.1:18770/leetcode/336/`). They use `NODE_PATH` for installed Playwright/acorn and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when set. They start no server. Example isolated evidence rerun:

```sh
LESSON_OUTPUT_DIR=/tmp/lesson336-review python3 -B leetcode/336/tests/test_solution.py
LESSON_OUTPUT_DIR=/tmp/lesson336-review node leetcode/336/tests/test_core.cjs
LESSON_OUTPUT_DIR=/tmp/lesson336-review node leetcode/336/tests/browser.cjs
```

Python runs the real official `Solution().palindromePairs(words)` interface. Its independent oracle compares virtual concatenations with two pointers. An instrumented Node subclass observes the real submission trie without changing its implementation; every small-case node is checked against independently enumerated remaining prefixes. Every prefix/suffix flag is compared against direct reversal. Exhaustive unique word subsets, deterministic random cases, three official examples, empty/no-pair/dense-pair cases, 300-character radii, and 5000 words of length 300 are included. Outputs are compared as sets with duplicate rejection, and input immutability is checked.

The JS tests exercise the visualization separately: candidate membership at every trie node, matched-path invariant, all intermediate emission deltas, and final output against another all-pairs oracle. This simulator deliberately uses direct palindrome checks, unlike Python's linear preprocessing.

Browser tests execute the actual served page in Chromium: both locales, every preset and forward event, rewind/replay/reset/endpoints, keyboard focus and range input, all prediction choices, reveal/change/locale preservation, source/copy/download parity, real clipboard read-back plus denied-clipboard fallback, unavailable storage, local-file source display, deep-link targets, no asset/console errors, width and zoom layout, and computed contrast. Localization properties are parsed with acorn before evaluation to detect duplicate keys. Screenshot inspection is an author task in addition to assertions.

Zoom evidence uses CSS zoom 200% on a 780px viewport, a 390px effective layout, with a resize event to exercise layout-change behavior. This is browser-rendered zoom coverage, not a claim about an OS accessibility configuration or a physical phone. Tables deliberately scroll horizontally at narrow widths; labels and headers stay attached to values, and active rows are kept vertically visible. Horizontal table scroll has separate 320px screenshots.

These checks are author self-checks only. No independent reviewer, actual learner study, LeetCode acceptance, registration, or deployment is implied.
