# Reproduce author checks

Run from the repository root. Python 3.9+ and Node are required; Playwright is
available through the environment's NODE_PATH. The browser test uses the running
preview and respects PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set. It starts no
server. Choose an external output directory to leave the frozen candidate intact:

```bash
export LESSON_TEST_OUTPUT_DIR=/path/to/reviewer-output/330
python3 -B leetcode/330/tests/test_solution.py
node leetcode/330/tests/test_core.cjs
node leetcode/330/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 330 --validate-only
```

All result/screenshot writers honor LESSON_TEST_OUTPUT_DIR. Run in that order:
the Python test emits independent oracle fixtures used by the JS core test.
LESSON_PREVIEW_URL optionally overrides the browser URL. The default is
http://127.0.0.1:18770/leetcode/330/. Without the output variable, evidence is
written to this lesson's tests/evidence/ directory.

The Python oracle uses breadth-first search on complete reachable-sum sets and
tries every patch in 1..n, without a greedy frontier. Exhaustive inputs: sorted
arrays of lengths 1..4 with values 1..6, targets 1..10; 300 seeded random cases.
Original Python is executed, not parsed or replaced by the browser simulation.
JS independently enumerates intermediate subset sums and checks every frame.

The browser test exercises both locales, every hand patch and interval candidate,
all presets and trace frames, undo/replay/reset/end, all prediction choices,
change-after-reveal, locale preservation, clipboard success/denial, display/copy/
download equality, local-file offline operation, storage denial, native keyboard
controls, forced colors, reduced motion, local assets, links/anchors, responsive
widths and CSS 200% zoom (320/390/1280px viewports with body zoom=2). CSS zoom exercises
layout at doubled rendering scale; this is not a physical-device test.

Focused screenshots use a temporarily taller viewport so the complete stage fits
below the sticky navigation; styles/data are not changed for capture. Mobile
ledger scrolling is deliberate, labeled and keyboard focusable. The visible
left side of a narrow screenshot does not contain the rightmost table columns;
the test explicitly scrolls to those columns. Text contrast is computed from
rendered colors, including alpha composition. Additional focus, field border and
disabled colors are recorded in role-colors.json; see SELF-CHECK.md for ratios.

Official evidence is the dated, complete public GraphQL response in
`evidence/official.json`, including the observed language snippets and metadata.
It is not a runtime dependency. No paid content or credentials were used.

These are author self-checks. Separate cold teaching review, LeetCode submission,
real devices, production delivery and actual learner outcomes remain unverified.
