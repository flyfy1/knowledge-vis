Run from the repository root against the already-running preview at http://127.0.0.1:18792. Do not start a server or run registration.

```sh
export OUTPUT_DIR=/tmp/leetcode-972-review
python3 -B leetcode/972/tests/numerical.py
node leetcode/972/tests/core.cjs
node leetcode/972/tests/browser.cjs
node leetcode/972/tests/visual.cjs
python3 -B scripts/register_leetcode_lesson.py 972 --validate-only
```

OUTPUT_DIR defaults to tests/evidence. numerical.py writes fixtures consumed by core.cjs, so run in this order. Browser dependencies are the environment's NODE_PATH packages (playwright and acorn); PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is used if supplied. The browser must support actual clipboard read/write. Tests seed and verify a fresh sentinel separately for each locale's manual-copy attempt, deny the automatic writer, then press the Linux/Windows Control+C or macOS Meta+C host shortcut. Failure is a gap, not permission to weaken parity.

browser.cjs runs normal-motion interactions, two locales, every preset, rewind/replay/reset/endpoints, every prediction option, language preservation, successful copy/manual copy/download/source parity, 320/390/736/1440 layouts, CSS root zoom 2, forced colors, keyboard, storage denial, file:// source, local request/error checks, calibrated solid-color contrast, and both served related destinations via keyboard. visual.cjs adds settled reduced-motion viewport captures and deep-link geometry, avoiding element-crop sticky-header artifacts. The zoom record is CSS zoom in real Chromium, not a physical-device browser test.

Self-check output is computational/browser evidence only. Independent lesson review, learner outcomes, LeetCode acceptance and public deployment remain outside these tests.
