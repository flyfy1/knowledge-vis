# Reproduce author checks

Run from the repository root, using the existing preview on port 18774. No
server, registration, deployment, or independent review is started here.

```bash
OUTPUT_DIR=/tmp/freedom-trail-author-check python3 -B leetcode/514/tests/test_solution.py
OUTPUT_DIR=/tmp/freedom-trail-author-check node leetcode/514/tests/browser.cjs
OUTPUT_DIR=/tmp/freedom-trail-author-check node leetcode/514/tests/accessibility.cjs
python3 -B scripts/register_leetcode_lesson.py 514 --validate-only
```

Use the environment's NODE_PATH for Playwright and
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH for its installed Chromium. Both browser
checks honor the latter. Every results/screenshot emitter honors OUTPUT_DIR;
reviewers can leave the candidate evidence unchanged. The solution test executes
the actual Solution.findRotateSteps callable. Its oracle uses breadth-first
search on (physical position, letters entered) with only unit rotations and
legal button presses, independently of the shortest-arc DP. It compares every
matching-endpoint layer as well as the final answer. Random seed is 514.

The browser suite checks locale semantics, complete/partial totals, every preset,
rewind/replay, endpoints, range control, all prediction choices and stale-feedback
clearing, preserved locale state, copy success and denied-copy selection, source
and downloaded-byte equality, denied localStorage, file:// offline use, local
requests, deep-link existence, widths 320/390/736/1440 and CSS zoom 100%/200%.
Accessibility checks additionally use the actual browser clipboard, keyboard
horizontal table scrolling, control heights, forced colors, reduced motion,
focus contrast, navigation target geometry, and an effective half-width desktop
viewport for 200% zoom layout. Real OS/browser-chrome zoom and real phones were
not measured; the zoom checks are headless layout simulations.

Screenshot names encode locale, width and layout state. `*-ring.png` and
`*-candidates.png` inspect the populated numerical view; narrow candidate tables
are intentionally scrollable, and the keyboard test verifies access to their
right-hand columns. Captures alone do not demonstrate learner comprehension.
