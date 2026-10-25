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

R1 preset-count regression (587-R1-F1):

```sh
EVIDENCE_DIR=leetcode/587/tests/evidence/r1-fix node leetcode/587/tests/preset-scope.cjs
```

This reads rendered selected options in both locales at 1365/320/390px, compares hand-calculated input/boundary counts, tests initial/event-4/final states and language-switch preservation, and checks selected text fits beside the native arrow. Screenshots cover Garden and Two pops. It uses a test-only instant-scroll style to avoid animation delays between the selector and locale buttons. The pre-fix red result is retained separately in `tests/evidence/r1-fix-before/`; later author results never close the independent finding.

Mac integration repair regression (587-MAC-001):

```sh
PREVIEW_URL=http://127.0.0.1:18770 EVIDENCE_DIR=leetcode/587/tests/evidence/mac-fix node leetcode/587/tests/width-budget.cjs
PREVIEW_URL=http://127.0.0.1:18770 EVIDENCE_DIR=leetcode/587/tests/evidence/mac-fix node leetcode/587/tests/preset-scope.cjs
```

`width-budget.cjs` records native selected-text measurements and a synthetic 17.6px (+10%) font-size sensitivity check in both locales for all six options at 320px, padding-only variation, and locale roundtrip. The stress checks leave at least 8px spare after reserving 16px for the native arrow. This is additional author regression coverage, not emulation of the actual Mac font. The original `preset-scope.cjs` fit assertion remains intact and covers 320/390/1365. Red baseline and original dispatcher Mac measurements are retained in `evidence/mac-fix-before/`; the insufficient initial padding attempt is retained in `evidence/mac-fix-intermediate/`. Final evidence goes in `evidence/mac-fix/`. Dispatcher must rerun the original native Mac regression and inspect rendering before closing the integration finding.
