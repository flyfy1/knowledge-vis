# Reproduce author checks

From repository root, with the existing preview running at 127.0.0.1:18788:

```bash
OUTPUT_DIR=/tmp/956-review python3 -B leetcode/956/tests/test_solution.py
OUTPUT_DIR=/tmp/956-review node leetcode/956/tests/test_core.cjs
OUTPUT_DIR=/tmp/956-review node leetcode/956/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 956 --validate-only
```

All artifact-producing tests accept OUTPUT_DIR (default: tests/evidence beside
these scripts). They never write runtime sources. Browser uses installed
Playwright via NODE_PATH and honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.
PREVIEW_URL may override the lesson URL; local-origin assertion intentionally
expects the specified preview host/port. No service is started by these tests.

`test_solution.py`: canonical Python against independently enumerated left/right/
unused assignments, seeded cases, boundaries and a signed-difference / total-used
meet-in-the-middle oracle for a near-maximal dense input. Also executes the exact
rendered baseline extracted from HTML and checks source-mirror bytes and duplicate
translation keys before evaluation.

`test_core.cjs`: every prefix map and retained witness against direct enumeration;
checks rod-position uniqueness, heights, all incoming merges and copy pair shapes.

`browser.cjs`: real Chromium, both locales, all presets and branch choices,
rewind/replay/end/reset, all prediction choices then reveal/change, locale state
preservation and narrow heading roundtrip, exact rendered/downloaded/copy source,
real host shortcut clipboard fallback with a distinct verified sentinel before
each attempt, 320/390/736/1440px, 200% CSS zoom at 640px (effective width 320),
keyboard controls and related-link activation, focus, forced colors, reduced
motion, calibrated solid-color contrast, disabled legibility, selector width
budget, local asset errors, denied storage, and file:// source/trace behavior.
Read SELF-CHECK.md for visual inspection and limitations; automated checks do not
establish independent review or learner comprehension.
