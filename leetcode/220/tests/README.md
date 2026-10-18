# Reproduce the author checks

Run from the repository root. These scripts use the existing preview service;
they do not launch a server, register a lesson or claim independent review.
Python 3.9+ is required for the officially observed list[int] interface.
Playwright is available through NODE_PATH. The browser scripts honor
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set.

Send every generated report and screenshot to a different output directory to
leave the candidate unchanged:

    TEST_OUTPUT_DIR=/tmp/lc220-review python3 -B leetcode/220/tests/test_solution.py
    TEST_OUTPUT_DIR=/tmp/lc220-review node leetcode/220/tests/test_core.cjs
    TEST_OUTPUT_DIR=/tmp/lc220-review node leetcode/220/tests/browser.cjs
    TEST_OUTPUT_DIR=/tmp/lc220-review node leetcode/220/tests/browser-extra.cjs
    python3 -B scripts/register_leetcode_lesson.py 220 --validate-only

Browser scripts optionally accept PREVIEW_ROOT (default http://127.0.0.1:18793).
Reports describe author self-checks only. The independent oracle is a nested
enumeration of distinct position pairs; it does not use the bucket algorithm.
The Python test executes the actual official-interface method, verifies no input
mutation and inspects its local dictionary at probe entry using sys.settrace.
The model test separately inspects completed frames, including expiry and deep
snapshot isolation. Source parity uses exact UTF-8 contents.

browser.cjs checks both locales, all action endpoints of all eight presets,
back/forward identity, quiz reveal/change and locale preservation, native browser
clipboard write/read, forced clipboard rejection/manual selection, actual source
download, local links/anchors, storage denial, keyboard, forced colors, reduced
motion, runtime requests/errors, measured contrast, widths 320/390/736/1440,
and 200% CSS zoom at 1280. browser-extra.cjs checks all preset final layouts at
320/390 in both locales, native 48px controls, range keyboard endpoints and
true file:// offline initialization/source/interaction.

The screenshot set shows populated official-example states, narrow headers and
extreme integer values. The author visually inspected the emitted images.
Desktop Chromium emulation and CSS zoom do not establish physical phone,
assistive-technology or native browser-menu zoom behavior. No deployment,
LeetCode submission, real learner study or independent teaching acceptance was
performed. A fresh independent review of the frozen hashes is the next gate.
