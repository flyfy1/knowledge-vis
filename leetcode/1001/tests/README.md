# Reproduce the author checks

From the repository root (Python 3 and Node with installed Playwright):

```bash
OUTPUT_DIR=/tmp/1001-review python3 -B leetcode/1001/tests/test_solution.py
OUTPUT_DIR=/tmp/1001-review node leetcode/1001/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 1001 --validate-only
```

`OUTPUT_DIR` redirects every emitted test result, download and screenshot; default is tests/evidence. Browser uses the existing preview at http://127.0.0.1:18770/leetcode/1001/ (override PREVIEW_URL), NODE_PATH, and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. It starts no web server. Native clipboard tests run on the browser host, Linux here: Control+C. Each locale's manual-copy attempt first writes and reads a fresh sentinel through the real clipboard, disables only automatic writes, invokes the actual Copy control, checks selection/focus, performs the native shortcut, and reads the full original source including final newline.

The Python callable is executed against a direct geometry scan, exhaustive n=1,2 lamp subsets and ordered query sequences of length 0…3, 1500 seeded random cases, official/fresh examples and two 20000-entry large-coordinate fixtures. `sys.settrace` checks count equality with the actual active set at each query boundary and return. The oracle does not use four count maps or the nine-offset deletion loop. Node receives independent oracle fixtures, checks all snapshots, reads and source mirror fidelity. Unique copy keys are checked before evaluating the dictionary, then every value must be a pair of nonempty strings.

The real Chromium checks both locales, all eight presets, every forward/back/replay transition and endpoints, all hand frames, prediction/reveal/change and locale preservation, exact formulas, original source/copy/fallback/download, keyboard navigation and horizontal diagram scrolling, focus, denied storage, file:// opening, local asset failures, related targets, measured foreground/background contrast, 320/390/736/1440 CSS px and 100/200% CSS layout zoom. Screenshots are author-inspected separately; geometry checks alone are insufficient. CSS zoom is a layout stress test, not physical-device or operating-system zoom evidence.

`tests/evidence/official-graphql.json` is the dated official statement and interface capture, not a runtime asset. The manifest identifies the final author candidate. These tests are author self-checks and independent computational oracles, not an independent lesson review, public deployment verification, actual learner measurement, or LeetCode submission acceptance.
