# Reproduce the author self-check

From the repository root:

```bash
OUTPUT_DIR=/tmp/lesson-124-check python3 leetcode/124/tests/test_solution.py
OUTPUT_DIR=/tmp/lesson-124-check node leetcode/124/tests/browser.cjs
```

The browser script uses the already-running preview at http://127.0.0.1:18779/leetcode/124/ (override with LESSON_URL). It resolves Playwright through the supplied NODE_PATH and honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. Neither test starts a server or modifies the shipped lesson. All emitted reports, screenshots, and download captures go into OUTPUT_DIR; default is tests/evidence/. test_core.cjs is invoked by the Python test with independently calculated fixtures on stdin.

The oracle enumerates every route from every starting node using undirected adjacency, without the optimized gain recurrence. Paths are classified by their highest node to independently verify through; downward paths independently verify gain. All binary tree shapes through five nodes with values {-2,0,3} are enumerated; random fixtures use seed 124. Large chain and balanced cases execute the canonical Python callable with LeetCode-compatible node objects. Input values and child identities are checked for mutation.

Browser evidence covers the two locales, all presets, every completed-node rewind, source/display/clipboard/download parity, denied clipboard manual selection, denied storage, offline display, quiz reveal/change and preservation, root-value limits, trace slider, keyboard activation/focus and horizontal table scrolling, sticky deep anchors, related targets, local asset failures, measured rendered contrast, and 320/390/736/1440 CSS-pixel widths. 200% is CSS zoom in Chromium, recorded explicitly rather than claiming physical-device or browser-toolbar testing.

Official provenance: evidence/official.json is a successful ordinary public GraphQL POST on 2026-10-18, containing the statement, examples, constraints, metadata, and actual selector code snippets. A direct browser request encountered a security challenge (official-page.html); no challenge bypass or authenticated access was attempted. The normal GraphQL POST succeeded and verified the Python3 submission signature. These captures are review evidence and are not loaded at runtime.

All results are author self-checks. Independent teaching review, actual novice outcomes, LeetCode submission acceptance, and public deployment remain unverified.
