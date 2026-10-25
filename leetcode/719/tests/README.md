# Reproduce author checks

Run from the repository root. Use the already-running preview; do not start a server.

```sh
python3 -B leetcode/719/tests/test_solution.py
node leetcode/719/tests/test_core.cjs
node leetcode/719/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 719 --validate-only
```

Every test that writes results or screenshots honors `OUTPUT_DIR`; point it at a new absolute directory to leave the frozen candidate intact. Browser tests use `NODE_PATH` for the installed Playwright package, `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when set, and optional `PREVIEW_URL` (default http://127.0.0.1:18783/leetcode/719/). They create and remove a temporary Chromium profile/extension under the output directory solely to exercise native 200% tab zoom. No persistent service is started.

`test_solution.py` executes the official Python callable, with an independent enumeration/sort oracle, every ordered array of length 2…6 over four values and every rank, 300 seeded arrays, official examples, and closed-form maximum-size cases; it also checks input preservation, duplicate copy keys, and byte-exact source mirror. `test_core.cjs` checks exact intermediate counts, pointer boundaries/monotonicity, unique-right-endpoint accounting, search invariant, strict shrink and final output against enumerated distances. These are independent oracles, not independent reviewers.

`browser.cjs` operates Chromium in both locales through every preset and round, replay/reset/end/scrub, every threshold and scan-progress combination, all prediction choices and changed-answer invalidation, locale retention, keyboard/focus, source/copy/download equality including final newline, real manual Ctrl+C clipboard transfer on the Linux host, storage denial and file opening, local link targets, rendered contrast, forced colors, reduced motion, all runtime resource errors, 320/390/736/1440px and native 200% zoom. Screenshots and JSON are receipts for the author self-check. Physical devices, actual novice learning, independent teaching review, official submission acceptance, and public deployment are unverified.

Earlier failed runs are preserved as `browser-initial-target-size-failure.json`, `browser-harness-selector-failure.json`, and `browser-implicit-favicon-failure.json`. They respectively found the 44px language-button width (fixed locally), a test selector pointing to a tbody instead of column headers (harness correction), and Chromium's implicit missing root favicon (fixed with a lesson-local icon). Visual inspection additionally found the primary-button selector overriding disabled colors; the local disabled selector now has sufficient specificity. These iterations are author work, not independent findings or acceptance.
