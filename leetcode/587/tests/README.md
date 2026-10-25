Run from the repository root, using the existing preview service:

```sh
python3 -B leetcode/587/tests/check_algorithm.py
node leetcode/587/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 587 --validate-only
```

`NODE_PATH` must expose Playwright. If provided, `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` is used. `PREVIEW_URL` overrides the default http://127.0.0.1:18779. No server is started.

Both output-producing entry points support `EVIDENCE_DIR=/absolute/reviewer/output` so a reviewer can rerun without changing this candidate. `check_core.cjs` is invoked by the Python check with independently calculated expectations on stdin; it writes only stdout. Test cases are deterministic (seed 587).

The Python test executes the canonical official callable, preserves input, checks no duplicate outputs, and compares with an independent line-equation supporting-line oracle. It covers every nonempty subset of a 3x3 grid, 400 seeded cases, all lesson presets, explicit extremes, and a 3000-tree grid with a closed-form expected rim. The Node check validates every trace, edge support and collinear retention after append, signed comparisons and exact pop identity, snapshot reproducibility, unique localization keys before parsing, bilingual pair shape, and canonical/offline source parity.

The browser test covers both locales, every preset to completion, each transition, middle-state rewind/replay, endpoints, reset/jump, all three prediction choices and reveal/change/reset, language preservation, all turn settings, the tiny overlay, native clipboard success and denied-copy manual fallback including actual Control+C, byte-exact download/source parity, keyboard activation/focus, blocked storage, file:// offline display, local asset errors, related anchors, contrast and responsive states. Zoom evidence uses CSS zoom=2 at a 720x500 viewport as a 200% layout stress test; it is not a hardware-device or browser-toolbar zoom observation. Plots intentionally retain 500px intrinsic width with keyboard-focusable horizontal scrolling on phones. Focused left/right screenshots make both ends inspectable.

Evidence is an author self-check, not independent review or an actual LeetCode submission. After test success, inspect the screenshots visually. SELF-CHECK.md records the author's observations. CANDIDATE.json identifies frozen sources; output evidence is separate so rerunning tests elsewhere does not change source identity.
