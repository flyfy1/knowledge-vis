Run from the repository root:

```sh
python3 -B leetcode/850/tests/test_solution.py
node leetcode/850/tests/test_core.cjs
node leetcode/850/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 850 --validate-only
```

All result-emitting tests accept `LESSON_OUTPUT_DIR=/absolute/output/path`.
Use that variable for review reruns to preserve the candidate evidence.
The browser uses the already-running preview at http://127.0.0.1:18770;
`LESSON_PREVIEW_ROOT` can change the origin. It honors `NODE_PATH` and
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. No service is started. The clipboard
checks use the browser host shortcut (Control+C on this Linux host), reset and
verify a distinct sentinel before each locale's fallback, then read the actual
native clipboard. Tests compare source including its final newline.

Python: exhaustive multisets of 1..4 rectangles on coordinates 0..2; seeded
raster and independent inclusion-exclusion cases; big coordinates, official
examples, duplicate maximum n, maximum unique x boundaries, fresh transfer,
input immutability and exact offline mirror. No LeetCode submission is made.
JS: unit-cell oracle checks every prefix, delta and merged disjointness across
all presets and 1,000 seeded cases. Browser: both languages, presets, literal
hand-derived contributions, endpoints, keyboard, source/copy/download parity,
locale/answer state, storage denial, file-open offline initialization, contrasts,
selector width budgets, 320/390/736/1440 layouts, 200% CSS zoom and forced colors.

Evidence is author self-check only. Screenshot inspection notes and limitations
are in evidence/SELF-CHECK.md. Independent review is pending.
