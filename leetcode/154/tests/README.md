# Reproduce author checks

From the repository root, using the existing preview server:

```sh
OUTPUT_DIR=/tmp/lesson154-check python3 -B leetcode/154/tests/check.py
OUTPUT_DIR=/tmp/lesson154-browser node leetcode/154/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 154 --validate-only
```

`NODE_PATH` is honored by Node; `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`, if supplied,
is passed to Chromium launch. `PREVIEW_URL` may override the full lesson URL.
Both evidence-producing tests accept `OUTPUT_DIR`; they do not rewrite lesson
sources. The JS trace checker is invoked by the Python test and writes JSON to
stdout. No service is started. Python must support the official list[int] stub.

Algorithm checks use sorted multisets and every rotation, independent linear
minimum computation, seeded random inputs, singleton/two-item/negative/repeated
minima, full-sized all-equal and extreme values. They execute Solution.findMin,
verify no mutation, and compare every simulated interval to the independent
oracle. Trace bounds, midpoint, before/after correspondence, strict shrink,
snapshot independence, source mirror and translation placeholders are checked.

Browser checks use both locales and all nine presets. They cover full forward
and backward replay, reset/end/scrub, every prediction option, feedback clearing,
locale state, code display/copy/download parity, clipboard denial/manual selection,
storage denial, offline source and trace, native keyboard controls, focus outline,
48px controls, links, sticky targets, reduced motion, forced colors, 320/390/736/
1440 layouts, and 200% CSS zoom reflow. The latter is an in-page zoom test, not
OS display scaling. Local assets, console errors and rendered contrast are saved
in browser.json. Screenshot inspection is documented in SELF-CHECK.md.

These are author checks. Independent teaching review, real device testing,
novice learning measurements, submission acceptance and public deployment are
not claimed.
