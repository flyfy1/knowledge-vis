# Reproduce author self-checks

From repository root:

```sh
OUTPUT_DIR=/tmp/992-numeric python3 -B leetcode/992/tests/numerical.py
OUTPUT_DIR=/tmp/992-browser node leetcode/992/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 992 --validate-only
```

Browser uses the already-running preview at http://127.0.0.1:18797 (override PREVIEW_ROOT), resolves Playwright through NODE_PATH when configured, and honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. No service is started. Every emitted JSON/PNG respects OUTPUT_DIR. Python -B avoids bytecode writes in the candidate. Browser tests require a Linux/Windows or macOS host clipboard and use its native shortcut; all four fallback attempts first seed and read back distinct sentinels. Source equality includes the final newline.

Numerical oracle materializes every candidate interval and uses a set independently of the sliding-window algorithm. It checks the official callable, non-mutation, official examples, exhaustive valid arrays through length 6 over up to three values, seed 992, maximum-size formulas, browser-model intermediate earliest legal starts, positive frequencies, removals and all contributions. JSON duplicate-key detection precedes copy parsing.

Browser verifies real rendered per-round cells against its own interval oracle, complete hand count, seven presets and both endpoints, rewind/replay, reset, every prediction choice and invalidation, language state preservation, offline source, storage denial, exact source/mirror/copy/download, 320/390/736/1440 widths, 200% CSS zoom, focused keyboard controls and horizontal table, locale roundtrip heading/title identity, official URL, all navigation anchors and two served related lessons, measured actual colors with calibrated luminance helper, native-select fit budget and local requests/errors. Focused tall-element PNG captures hide sticky nav only during screenshot capture; page PNGs and navigation geometry tests retain it. Zoom is Chromium CSS root zoom, not a physical-device or browser-chrome zoom claim.

Evidence is author self-check only. Independent cold review, novice outcomes, LeetCode submission and public release are outside this author run. Official raw GraphQL capture includes timestamp, statement and complete language snippets. Shared navigation and link destination files are read, never edited. Final manifest binds candidate and shared runtime hashes for separate review.

Known preview-sibling issue: following #2916 requests a missing root favicon.ico. A separate Chromium reproduction confirms console location /favicon.ico on /leetcode/2916/#step1. This exact icon-only warning is retained as siblingWarnings; all other runtime and asset errors still fail. #992 has an inline data favicon. The sibling is outside author ownership.
