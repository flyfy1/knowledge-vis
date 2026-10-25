Run from the repository root against the already-running preview:

```bash
python3 -B leetcode/675/tests/test_solution.py
node leetcode/675/tests/test_core.cjs
node leetcode/675/tests/browser.cjs
node leetcode/675/tests/focused.cjs
python3 -B scripts/register_leetcode_lesson.py 675 --validate-only
```

All result/screenshot emitters accept `OUT_DIR`. Use the same directory for the first two commands: the Python test emits independent fixtures consumed by the JS core test. For example prefix each command with `OUT_DIR=/tmp/675-review-run` to leave the candidate untouched. Browser scripts honor `PREVIEW_URL` (origin, default http://127.0.0.1:18782), `NODE_PATH`, and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. They launch transient headless Chromium, use the existing preview, and do not start a service.

`test_solution.py` executes canonical Python and the baseline extracted from the actual lesson HTML. Its primary oracle searches the full (location, cutting-progress) state space; its separate Floyd–Warshall implementation generates per-cell expected distances. It exhausts valid 2×2 forests over 0..4 with distinct heights, then adds seeded and explicit cases and two maximum-size open forests. It detects raw-copy duplicate keys before JSON construction can hide them, checks the authoring helper AST, and checks exact mirror parity.

`test_core.cjs` checks every discovered distance and ledger entry against those independent fixtures, not just final answers. `browser.cjs` checks the real renderer, both locales, all presets and frames, endpoints/rewind/replay, independent prediction lifecycle, source display/copy/download, actual native clipboard fallback transfer from a distinct sentinel, layout, contrast, keyboard, links, forced colors, denied storage, and local-file opening. `focused.cjs` adds readable prediction, repaired zoom-header and contextual focus captures. The browser host copy shortcut is selected using Node's actual host platform, not emulated mobile metadata.

Zoom evidence uses CSS `zoom:2` in real Chromium. Browser-chrome zoom and physical device checks remain unverified. The initial harness assumptions and actual visual repairs are retained in `evidence/harness-note.txt`; failed/obsolete visual evidence is identified there. Audit montages are derived from the individual screenshots and are not runtime assets.

`build_copy.py` is a narrowly scoped authoring helper, not a reviewer check; it writes only `../copy.js`. Do not run it to test a frozen candidate. All review checks above are read-only with respect to runtime files.

Required-finding regression (675-R1-01):

```bash
OUT_DIR="$PWD/leetcode/675/tests/evidence/r1-fix" node leetcode/675/tests/selected-labels.cjs
```

Checks all six closed labels in both locales at 320/390px and 100%/200% CSS zoom,
including the preset-4 locale roundtrip. Records actual font, text/padding/control
geometry, vertical and horizontal clipping, native content sizing, and screenshots
for the two reported presets. Inspect screenshots as well as geometry. A wrapped
label can legitimately be wider than one line; it must have sufficient height.
The 24px arrow allowance is a conservative observation for this Linux Chromium
control, not a universal browser constant. `STYLESHEET_UNDER_TEST` optionally
serves a saved stylesheet through Playwright request interception to repeat this
same check against the original CSS without mutating the runtime or service.
`evidence/r1-before/` retains that red reproduction; it is not repaired evidence.
