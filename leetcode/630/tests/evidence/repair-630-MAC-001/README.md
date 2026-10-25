# 630-MAC-001 repair handoff (author self-check)

Candidate: `sha256:31dc083dd1377c2bbed7c14094ea966b541ef784124e7f2fa024a8b91c96a9eb`.
Manifest hashes all lesson runtime files, metadata, tests and author documentation
outside evidence. No commit was made. This candidate does not inherit acceptance.
See candidate.json and candidate.sha256; historical reports and evidence are intact.

Implemented: shorter bilingual preset identities with explicit output course counts,
full input arrays still visible, 16px native control and shared fonts preserved.
Finding status: fixed in candidate, awaiting native Mac evidence and independent
assessment; not closed. Metadata was already valid and is unchanged.

Evidence index:

- before/results.json and before/en-320-{0,3,4}.png: real failing Linux feedback loop.
- hypotheses.json: ranked one-factor diagnosis, before runtime repair.
- after/results.json: 45 passing normal-font control measurements, all five presets,
  320/390/1440, EN→ZH→EN; corresponding control screenshots.
- stress-20px/results.json and PNGs: 45 passing synthetic font-size checks only.
- validation/algorithm-results.json: actual Python and independent oracles.
- validation/browser-results.json and PNGs: bilingual interaction, rendered arithmetic,
  source parity including actual manual fallback copying, viewport, zoom and contrast.
- linux-original-probe/results.json: unchanged original assertions, Linux only.
- original-probe-receipt.json: exact equality and SHA-256 of original incident probe.
- preflight.json: required non-mutating metadata preflight, exit 0, empty output.

Native Mac is required by the dispatcher report and rendered-state contract §8.
Neither Linux nor the 20px stress run replaces it. This workspace is Linux aarch64
and has no authorized Mac execution channel. The next owner should transfer this
frozen candidate to native Mac, serve it using the established preview, and run
from the repository root (choose a new OUTPUT_DIR; preserve all prior evidence):

```sh
shasum -a 256 -c leetcode/630/tests/evidence/repair-630-MAC-001/candidate.sha256
PREVIEW_ROOT=http://127.0.0.1:18770 OUTPUT_DIR="$PWD/leetcode/630/tests/evidence/repair-630-MAC-001/native-mac-original" node leetcode/630/tests/preset-probe-original.cjs
PREVIEW_ROOT=http://127.0.0.1:18770 OUTPUT_DIR="$PWD/leetcode/630/tests/evidence/repair-630-MAC-001/native-mac-controls" node leetcode/630/tests/preset-labels.cjs
```

The first probe is an exact byte copy of the incident's original script, not a
weakened replacement. It requires the default installed Playwright Chromium on
Mac. The second script additionally captures every control and a locale roundtrip;
it honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH if provided. Record Mac OS/browser,
candidate manifest verification, commands and results. Inspect closed controls in
both languages at 320/390 and desktop, attach screenshots/results for the separate
reviewer, and verify the preview serves those frozen bytes. The original script
captures only failures, so use the second script for passing control screenshots.
The reviewer must assess that evidence before closing 630-MAC-001. Do not alter
reports or campaign state merely to clear this pending check.

Linux-only original-probe rerun used this launch-only wrapper because the script's
default headless-shell installation was absent; the probe file remained unchanged:

```sh
PREVIEW_ROOT=http://127.0.0.1:18770 OUTPUT_DIR="$PWD/leetcode/630/tests/evidence/repair-630-MAC-001/linux-original-probe" node - <<'JS'
const {chromium}=require('playwright');
const launch=chromium.launch.bind(chromium);
chromium.launch=options=>launch({...options,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
require('./leetcode/630/tests/preset-probe-original.cjs');
JS
```
