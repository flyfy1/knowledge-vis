# Reproduce author checks

From the repository root, using the supplied running preview (no server is started):

```bash
python3 -B leetcode/730/tests/build_copy.py --check
python3 -B leetcode/730/tests/test_solution.py
node leetcode/730/tests/test_core.cjs
node leetcode/730/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 730 --validate-only
```

`NODE_PATH` must expose the installed Playwright package. The browser runner honors
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Default preview:
`http://127.0.0.1:18785/leetcode/730/`; override with `PREVIEW_URL`.

All result/screenshot-emitting tests accept `OUTPUT_DIR=/absolute/reviewer/path`.
Use the same output directory across commands. `browser.cjs` extracts the displayed
baseline there and invokes `test_rendered_baseline.py` to execute it. `--check`
validates copy generation without writing runtime files; duplicate keys fail at
the `add` call, before dictionary insertion could overwrite one. Tests neither
register nor alter any candidate source. Browser screenshots are evidence assets,
not page assets. Inspect them; output alone is not visual approval.

`test_solution.py` executes the canonical official Python callable against masks,
seeded cases, official examples and a separate endpoint-inclusion/exclusion
recurrence at n=1000. `test_core.cjs` uses a power-set expansion oracle to inspect
every completed cell and every outer-letter group. Neither oracle calls the
production recurrence. `browser.cjs` independently enumerates strings for every
visible transition and records localized semantic readings, real clipboard
transfers, source downloads, endpoints and layout evidence. Native fallback copy
uses the browser host shortcut (Linux: Control+C), with a non-source sentinel
before denial. CSS 200% zoom is recorded explicitly rather than represented as
browser-toolbar zoom or a physical device test.

Acceptance remains pending a separate reviewer. Author checks do not establish
LeetCode acceptance or measured learner understanding.
