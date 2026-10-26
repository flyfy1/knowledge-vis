# Reproduce the author self-check

Run from the repository root; the already-running preview must serve this checkout at http://127.0.0.1:18770. No service is started by these tests. Node resolves Playwright and acorn using the environment's NODE_PATH. If supplied, PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is passed to Chromium.

```sh
export OUTPUT_DIR=/tmp/leetcode-924-check
python3 -B leetcode/924/tests/test_solution.py
node leetcode/924/tests/test_core.cjs
node leetcode/924/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 924 --validate-only
```

OUTPUT_DIR defaults to tests/evidence inside this lesson; set it when reviewing a frozen candidate. Python creates oracle-cases.json for the core check. PREVIEW_ROOT optionally overrides the preview origin. All generated screenshots/results/downloads go to OUTPUT_DIR. Tests do not change runtime source, metadata, registry, policy, or another lesson. The final command is read-only and has no output on success; check exit status 0.

Python: independent Floyd–Warshall reachability closure (not component counting) gives the final infected count for each removal. Exhaustive undirected graphs through n=5, every nonempty seed subset, reversed seed order; 180 seeded cases; official examples; connected and isolated n=300 single/all seed boundaries. Executes the actual canonical class and the displayed baseline; checks mutation and exact mirror bytes.

Core: Python-oracle fixtures, component coverage/edge closure/seed counts, every synchronous infection transition and terminal closure, every savings count and prefix best pair. Acorn catches duplicate dictionary keys before object evaluation; translation pair and interpolation shape checks follow.

Browser: every preset and removed seed in both languages, full spread/score traces, rewind/replay/reset/endpoints, fixed independent expected preset totals, prediction choices and invalidation, locale state preservation, exact visible/downloaded/automatic/manual clipboard source (two attempts per locale, fresh verified sentinel each fallback), keyboard activation/table scrolling, offline source, blocked storage, local-only asset responses, 320/390/736/1440 widths, 200% CSS zoom, title identity, select fit, calibrated actual color-pair contrast and forced colors. Clipboard shortcut uses the Linux browser host's Control+C. Tests use real Chromium, not a DOM emulator. CSS zoom is a browser layout stress test, not a claim of testing every operating-system zoom setting.

Read SELF-CHECK.md for observed results, screenshot inspection, limitations and the initial harness correction. Passing tests is author evidence, not independent lesson acceptance.
