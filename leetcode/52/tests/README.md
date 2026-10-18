# Reproduce the author checks

Run from repository root; Python 3 and Node with Playwright available via NODE_PATH are required. The preview must already be running. Do not start another service.

Use a fresh output directory so the candidate's evidence remains frozen:

```bash
LESSON_TEST_OUTPUT_DIR=/tmp/leetcode-52-review python3 leetcode/52/tests/algorithm.py
LESSON_TEST_OUTPUT_DIR=/tmp/leetcode-52-review node leetcode/52/tests/core.cjs
LESSON_TEST_OUTPUT_DIR=/tmp/leetcode-52-review node leetcode/52/tests/browser.cjs
LESSON_TEST_OUTPUT_DIR=/tmp/leetcode-52-review node leetcode/52/tests/browser-extra.cjs
```

Browser default URL: http://127.0.0.1:18770/leetcode/52/ . Override using LESSON_URL. If PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is set, both browser scripts use it as executablePath. All emitted JSON and screenshots use LESSON_TEST_OUTPUT_DIR (default tests/evidence). No tests alter implementation files; Python bytecode writing is disabled.

algorithm.py independently enumerates column permutations with pairwise diagonal distances and verifies all official n, exhaustive legal prefixes through n=6, 100 seeded prefix draws, hand calculations and exact embedded Python parity. core.cjs checks every frame's keys, legality, leaf counts, reject/place/undo transitions and deep-copy isolation against coordinate-distance enumeration. browser.cjs drives all trace buttons to both endpoints for all presets in both locales. browser-extra.cjs checks count timing, keyboard seek, symbol states, additional contrast pairs, landscape, focused screenshots, real download/clipboard and offline file operation.

Official contract response is tests/official.json. These are author checks with independent computational oracles; they do not constitute an independent lesson review or LeetCode submission.
