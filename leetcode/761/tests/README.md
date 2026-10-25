# Reproduce the author self-check

Run from the repository root with the existing preview at http://127.0.0.1:18770.
Do not start another server. Browser dependencies resolve through NODE_PATH.

```bash
LESSON_OUTPUT_DIR=/tmp/761-check python3 -B leetcode/761/tests/check.py
LESSON_OUTPUT_DIR=/tmp/761-check node leetcode/761/tests/browser.cjs
LESSON_OUTPUT_DIR=/tmp/761-check node leetcode/761/tests/prose-check.cjs
python3 -B scripts/register_leetcode_lesson.py 761 --validate-only
```

The numerical test executes `Solution.makeLargestSpecial` and independently
searches all legal moves. It checks all special strings through length 12,
100 seeded length-14 inputs, official examples, transfer input, length-50
boundaries, every simulated prefix balance, block reconstruction, sorted order,
and the optimality invariant at every return. It compares the exact offline
source mirror as well.

The browser test respects PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set. It uses
real Chromium, native clipboard read/write and the host's actual copy shortcut,
with a distinct sentinel for manual fallback. It tests static dictionary binding
and duplicate keys through an AST, all events/presets/locales and reversible
state, prediction choice/reveal/change, language preservation, downloads, blocked
storage, local file opening, keyboard navigation, deep links, forced colors,
reduced motion, control dimensions, local assets, contrast and 320/390/736/1440px
layouts. Zoom is CSS layout zoom at 200%, not a physical-device test.

Output paths are configurable; reruns need not mutate the frozen candidate.
Screenshots require visual inspection in addition to automated geometry checks.
The saved first-run record preserves author-discovered layout issues and repairs;
it is not an independent review. Independent teaching acceptance is pending.
