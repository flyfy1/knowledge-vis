# Reproducible author checks

From the repository root (Python 3.9+, Node and installed Playwright):

```sh
python3 -B leetcode/1032/tests/test_solution.py
node leetcode/1032/tests/test_core.cjs
node leetcode/1032/tests/browser.cjs
node leetcode/1032/tests/browser_extra.cjs
node leetcode/1032/tests/contrast_calibration.cjs
python3 -B scripts/register_leetcode_lesson.py 1032 --validate-only
```

Every test that writes results/screenshots honors `OUTPUT_DIR`, e.g.
`OUTPUT_DIR=/tmp/1032-review node leetcode/1032/tests/browser.cjs`.
`PREVIEW_URL` overrides the default already-running lesson URL
`http://127.0.0.1:18770/leetcode/1032/`. No service is started.
Use the provided `NODE_PATH`. If present,
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` is passed to Chromium launch.
Browser clipboard checks use real Linux Control+C or host macOS Meta+C;
a fresh non-source sentinel is written and verified for EACH fallback attempt.
These checks require local clipboard permissions. Source is compared without
trimming; no LeetCode submission is made.

`test_solution.py` independently compares each character of every candidate suffix,
checks all persistent buffers, enumerates trie paths and terminal sets, and runs
maximum limits. `test_core.cjs` independently uses suffix predicates and checks
all intermediate reversed paths, missing edges, exhaustion, snapshot isolation
and deterministic replay. Browser checks exercise real controls in both locales,
all events of all presets, reversible navigation, fresh prediction and invalidation,
source transfer, blocked storage, file-open use, local assets, keyboard, links,
layout and computed opaque color pairs. Extra checks measure native selected-option
fit with text metrics and reserved arrow width, terminal disabled styling, and
keyboard continuation links. A conservative width budget is evidence of fit only
when measured text lies within it; all selected labels are single letters and
full bilingual preset descriptions appear immediately below the selector.

Evidence is author self-check evidence only. A separate reviewer must perform
its own cold walkthrough of the frozen candidate and verify the official capture,
calculations and teaching. No acceptance, public deployment or learner outcomes
are established by these scripts.
