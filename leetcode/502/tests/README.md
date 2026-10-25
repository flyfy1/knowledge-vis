# Reproduce the author self-check

From the repository root, use the already-running preview at http://127.0.0.1:18770:

```bash
python3 -B leetcode/502/tests/check.py
node leetcode/502/tests/core.cjs
node leetcode/502/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 502 --validate-only
```

All three test programs accept `OUTPUT_DIR` (absolute or relative to the working directory) for emitted results/screenshots/downloads. For example, set `OUTPUT_DIR=/tmp/ipo-review` before each command to leave the frozen candidate untouched. Browser tests also accept `PREVIEW_ROOT`; Playwright/acorn are resolved through the available `NODE_PATH`. When set, `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` is passed as Chromium's executablePath. No service is started.

`check.py` executes the actual `Solution.findMaximizedCapital` against a reachable-subset oracle, not the greedy rule. A mask's capital is initial capital plus its selected profits; the oracle explores every eligible next subset up to k choices. It checks official, exhaustive, seeded, maximum-size and nonmutation cases, executes the baseline extracted from the page, and audits actual canonical heap operations at intermediate boundaries. The zero-project and k=0 cases are defensive extensions, not official inputs.

`core.cjs` compares the teaching simulation to an independent exhaustive-order search, audits every frame (eligibility, set conservation, heap parent order, maximum affordable profit, distinctness, capital and ledger), checks deep snapshot independence, and parses copy.js with Acorn to reject duplicate object keys before evaluation. It validates all locale pairs and placeholder sets.

`browser.cjs` operates actual Chromium in both locales: all presets and frames, full rewind/replay, endpoints/reset, hand choices, every prediction option and feedback invalidation, locale state preservation, copy and denied-copy fallback with actual Ctrl+C, byte-exact displayed/embedded/copied/downloaded source, offline and blocked storage, links, keyboard and forced-colors focus, controls ≥48px, local assets, contrast and CSS size. Screenshots cover 320/390/736/1440 widths and CSS zoom=2 at 780px, plus populated heaps, a real unlock with retained ledger, and all reading sections. The admission table deliberately scrolls horizontally with a localized hint and keyboard focus.

Evidence is author self-check only. CSS zoom models layout at 200%; physical devices, browser-toolbar zoom, screen-reader audio, novice comprehension, LeetCode submission acceptance, independent review and deployment are not established.
