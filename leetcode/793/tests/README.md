# Reproduce the author self-check

Run from repository root, using the existing preview server:

```sh
python3 -B leetcode/793/tests/check.py
node leetcode/793/tests/browser.cjs
node leetcode/793/tests/supplement.cjs
python3 -B scripts/register_leetcode_lesson.py 793 --validate-only
```

To keep the frozen candidate untouched, set `OUTPUT_DIR` to a separate writable
output directory for both test commands. `check.py` passes its generated fixture
path to `core.cjs`. The browser runner uses `NODE_PATH` and, when set,
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; optional `PREVIEW_ROOT` defaults to
http://127.0.0.1:18770. It launches an ephemeral headless browser, not a service.
Do not run the authoring inputs `build_html.py`/`write_copy.py` when reviewing a
frozen candidate; they regenerate this lesson's authored content only.

`check.py` executes the canonical Python callable against literal-factorial,
accumulated-factor and greedy-weight oracles. It also executes the displayed
baseline, validates unique translation keys and exact offline-source bytes.
`core.cjs` checks every trace frame against the digit-sum identity and checks
small zero counts by factoring individual integers.

`browser.cjs` exercises both locales, presets, each forward frame, endpoint
rewind/replay, reset/end, lab endpoints via keyboard, both independent prediction
questions and every option, changed feedback, locale preservation, native copy,
native manual fallback (fresh verified sentinel for each attempt), download,
offline display, blocked storage, anchors, 320/390/736/1440px and 200% CSS zoom.
The Chromium host is Linux here, so actual fallback uses Control+C. Clipboard
source strings and downloaded bytes include the canonical final newline.

Contrast uses the actual measurement helper calibrated against black, white,
primary colors and #747474 against black (4.492948… fails 4.5). It composites
solid ancestor backgrounds; the lesson has no text gradients/images. Native
closed select width reserves 32 CSS px for the arrow beyond actual padding.
Screenshots must also be visually inspected; the script alone cannot do that.

Evidence describes author checks only. Physical phone/browser-chrome zoom,
screen-reader output, novice outcomes, independent acceptance and public
publication are not established by these checks.

`supplement.cjs` checks full backwards traversal in both locales, final bound
labels, 48px control geometry, disabled computed styles and contrast, focus
geometry and contrast, forced colors, and keyboard scrolling of the source.
