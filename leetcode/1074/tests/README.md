# Reproduce the author checks

Run from the repository root. The preview at `http://127.0.0.1:18770` must already
be running. No command below registers, deploys, or starts a persistent server.

```bash
OUTPUT_DIR=/tmp/1074-review python3 -B leetcode/1074/tests/test_solution.py
OUTPUT_DIR=/tmp/1074-review node leetcode/1074/tests/test_core.cjs
OUTPUT_DIR=/tmp/1074-review node leetcode/1074/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 1074 --validate-only
```

The browser runner uses the installed `playwright` package through `NODE_PATH`
and passes `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when set. `PREVIEW_ROOT` can
replace the origin. Both test scripts which emit artifacts accept `OUTPUT_DIR`;
no output must be written into a frozen candidate when rerunning externally.
The Python runner disables bytecode with `-B`.

`test_solution.py` runs the actual canonical callable against a direct-cell
rectangle oracle, checks no mutation, exhaustive/seeded/maximal cases, executes
the displayed baseline, rejects duplicate copy keys, validates bilingual pair
shapes, and compares the mirror without trimming.

`test_core.cjs` checks every snapshot's compressed columns, old/new frequency
maps, matches against actual rectangle cells, per-band/global counts and ledger,
plus deep snapshot independence. It does not use Python as its expected result.

`browser.cjs` exercises the real served page, all frames for all seven presets
in both locales, endpoints, rewind/replay, reset, changing prediction after
reveal, language after reveal, successful and denied automatic copying, native
manual clipboard transfer with a fresh verified sentinel per locale, downloads,
blocked storage, local assets, related destinations and keyboard navigation.
It measures 320/390/736/1440 layouts, actual control/cell geometry, rendered color
pairs, shared+local CSS bytes, forced colors, reduced motion, and 200% CSS zoom.
CSS zoom is explicitly recorded; physical browser UI zoom and real devices are
not claimed. Element screenshots of large sections may include a sticky-nav
capture overlay; focused board captures position the complete diagram below the
sticky nav. Viewport/focus captures supplement long section captures.

`evidence/browser-failure.txt` preserves the first harness failure: a 200ms sample
was taken during smooth navigation. The final harness waits for the destination's
settled 68–100px top position. No runtime fix was needed for that assertion.
The first run also had a redundant disabled-button trial; this was removed from
the harness. See `evidence/SELF-CHECK.md` for actual outcomes and visual inspection.

Author self-checks do not establish independent teaching acceptance, novice
learning, production publication, or a LeetCode accepted submission.
