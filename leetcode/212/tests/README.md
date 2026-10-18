# Reproduce the author checks

Run from the repository root. Python 3 and Node are required. Browser packages are provided through NODE_PATH; the browser runner honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. Use the already running preview server; the tests start no service.

```sh
EVIDENCE_DIR=/tmp/lesson-212-check python3 -B leetcode/212/tests/test_solution.py
EVIDENCE_DIR=/tmp/lesson-212-check node leetcode/212/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 212 --validate-only
```

`LESSON_URL` can override the default http://127.0.0.1:18791/leetcode/212/. Set EVIDENCE_DIR to keep outputs outside the frozen candidate. No runtime browser fetch is required for source display. The file:// check deliberately denies storage.

The per-word oracle is independent of the trie implementation. Python cases cover all binary boards of sizes 1×1, 1×2, 2×1, 2×2, 2×3 with every binary word of length 1..5, 200 seeded cases, both official examples, the fresh transfer example, maximum dimensions, a dense repeated-letter maximum board, and 30000 distinct length-10 words. Input restoration and unique output are checked. Trace frames are checked independently for path adjacency, no reuse, prefix equality, terminal markers and results.

The browser runner exercises every forward/back operation for all presets in both locales, endpoints, reset, replay, slider, prediction/reveal/change, state-preserving locale changes, source/copy/download parity, clipboard success/failure, keyboard focus and slider keys, internal links and a clicked sticky deep link, denied storage and offline display, console/network errors, local-only assets, widths 320/390/736/1440, CSS zoom 200% and a 640 CSS-pixel/DPR2 reflow. It measures rendered text/background contrast. Screenshots temporarily hide the sticky nav only during capture to avoid capture-dependent overlay; the live navigation is exercised normally. Automated screenshots require visual inspection, recorded separately in SELF-CHECK.md.

These checks are author evidence. They are not an independent lesson review or a LeetCode submission/acceptance.
