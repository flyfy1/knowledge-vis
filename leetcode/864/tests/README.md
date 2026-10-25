Run from repository root, using the existing preview (no server is started):

```sh
python3 -B leetcode/864/tests/test_logic.py
node leetcode/864/tests/browser.cjs
node leetcode/864/tests/focused.cjs
python3 -B scripts/register_leetcode_lesson.py 864 --validate-only
```

All evidence-producing tests accept `LESSON_EVIDENCE_DIR=/absolute/new/directory` for a reviewer rerun that leaves the candidate unchanged. Browser uses installed Playwright via NODE_PATH and honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH; LESSON_PREVIEW_ROOT defaults to http://127.0.0.1:18770. Browser host is recorded and controls the native clipboard shortcut. No external fonts or assets are needed. Canonical Python is actually executed; oracle.py is an independent, explicit graph with frozenset inventories and synchronous edge relaxation (no production mask logic or BFS).

Logic cases: 960 exhaustive 2×3 one-key maps (all start/key/lock placements and wall choices), 1,440 exhaustive two-key maps, 240 seeded random maps, 8 declared fixtures. Also execute a closed-form 30×30 maximum-dimension six-key map. Compare every simulated layer and every cumulative shortest-distance record against the independent reference. Test source mirror bytes, displayed-baseline fidelity, copy pairs and duplicate keys.

Browser covers all frame sequences/presets in both locales, endpoints, reset, replay, prediction variants and changes, locale preservation, successful clipboard, manual fallback with fresh sentinel per attempt and native copy, download exactness, computed font select-fit budget, 320/390/736/1440, CSS 200% zoom with reflow, keyboard/focus, forced colors/reduced motion, file opening, blocked storage and related links. Contrast uses actual solid computed pairs and a calibrated sRGB implementation. CSS zoom is explicitly recorded rather than claimed as native browser chrome zoom. Stage screenshots may capture sticky navigation inside a long element screenshot; board-only captures document focused populated labels without that capture artifact. Contrast evidence does not claim an exhaustive audit of every ancestor-composited/translucent surface.

These are author self-checks. Independent review, real novice results, real devices, LeetCode submission acceptance and public deployment are not established.
