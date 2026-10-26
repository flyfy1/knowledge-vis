# Reproduce author checks

Run from repository root, using the already-running preview. No service start is required.

```
OUTPUT_DIR=/tmp/1012-numeric python3 -B leetcode/1012/tests/test_solution.py
OUTPUT_DIR=/tmp/1012-browser node leetcode/1012/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 1012 --validate-only
```

`NODE_PATH` supplies Playwright; `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`, when set, is passed as executablePath. Optional PREVIEW_URL overrides the complete lesson URL. The Python test executes the canonical callable, exhaustive bounds 1..5000 against cumulative direct scanning, seeded large cases against a separately derived repeated-digit DP, and instrumented intermediate invariants. It passes oracle fixtures to test_core.cjs, which independently enumerates each small block and checks every frame and mirror. The DP counts repeated digits directly using a mask and leading-zero flag; it does not use permutation blocks or complement subtraction.

Browser tests assert real native clipboard transfer with a distinct verified sentinel before each manual fallback; on this Linux host the shortcut is Control+C. Both locales have separate attempts. Source textContent, clipboard and saved download equal the complete source, including final newline. They exercise all presets, exact rewind/replay, start/end/reset, independent quiz changes, locale preservation, keyboard, storage denial, file:// offline rendering, layouts, contrast calibration and related destinations. OUTPUT_DIR redirects all generated evidence, leaving the candidate unchanged. Screenshots require human/author visual inspection as well as automatic assertions.

build_copy.py and build_html.py are local authoring helpers, not verification. They regenerate their one runtime file; set OUTPUT_DIR to generate into a temporary directory for comparison. The copy builder asserts tuple-key uniqueness before constructing its dictionary. The JS check also checks tuple definitions before evaluating copy.js, pair shape, and exact source mirroring.

Evidence is author self-check only. Independent cold teaching review, real learner results, LeetCode submission acceptance and public release are not established.

Focused screenshot regeneration (avoids sticky overlays on tall element captures):

```
OUTPUT_DIR=/tmp/1012-visuals node leetcode/1012/tests/visuals.cjs
```

The browser suite uses CSS body zoom=2 as a reproducible 200% layout stress. It does not claim a physical mobile device, a different OS font environment, or native browser-menu zoom measurements. Related-link keyboard activation is checked in the preview at 320px; public deployment remains a separate gate.
