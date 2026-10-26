# Reproduce the author checks

From the repository root, with installed browser packages available via NODE_PATH:

```sh
OUTPUT_DIR=/tmp/leetcode-936-review python3 -B leetcode/936/tests/run.py
```

PREVIEW_ROOT defaults to http://127.0.0.1:18770; use the existing preview service.
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is passed as Chromium executablePath if set.
No service is started. All generated fixtures, logs and screenshots go to OUTPUT_DIR.
The runner does not regenerate or repair candidate files. build_copy.py is the
explicit authoring source for copy.js; it is deliberately excluded from checks.

The Python test uses independent forward-state BFS for all binary stamps up to
length 4 and targets up to length 7, plus seeded ternary inputs and constructions,
and six length-1000 boundaries. It also runs the slower reverse-scan baseline.
The JavaScript core audit checks all snapshots against literal mismatch counts,
forward reconstruction, queue uniqueness, accounting, snapshot isolation and
exact source mirrors. Browser tests exercise both locales, all eight presets,
all reverse-lab combinations, endpoints, reversible history, prediction changes,
locale preservation, automatic copy and native Control+C fallback on Linux,
exact download bytes, blocked storage, offline loaded source, keyboard/focus,
forced colors, local assets, related links and selected-label width budgets.
Screenshots cover 320/390/736/1440 widths and 200% CSS zoom; visual inspection is
separate from assertions. contrast.cjs measures rendered text backgrounds, focus,
control boundaries and 48px controls; total shipped shared+local CSS is measured.

Author records are self-checks. They do not establish independent review,
novice understanding, LeetCode acceptance or public delivery. No physical mobile
or browser-menu/OS zoom verification was performed; CSS zoom and narrow reflow
are explicitly the tested zoom approximation.
