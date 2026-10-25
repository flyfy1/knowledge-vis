# Dispatcher Mac verification — #679, first candidate

Candidate: `c368c0b018d41763af8de9d6ac36a323900bb4a3`.
Date: 2026-10-25. This is supplemental platform evidence, not lesson acceptance.
The independent review separately requires repair of the English selected label
at 320px (`679-R1`). These results do not close that finding or cover a later fix.

An isolated Git archive was verified against the candidate before testing and
its selected tracked files were hash-checked after every runner. Outputs stayed
outside the archive. The original numerical checks passed: 495 unordered hands,
200 seeded ordered hands, 6,258 observed canonical recursive calls, and 34
teaching frames. Combined lesson/shared CSS measured 11,056 bytes.

## Original browser failure and bounded diagnosis

The unchanged browser suite failed at `tests/browser.cjs:70`: after focusing
the native select and sending ArrowDown then Enter, its value remained `1`
instead of the asserted `2`. Earlier source/copy/download, both-locale presets,
rewind, predictions and viewport captures completed. The full original browser
suite did **not** pass; checks after the failure were not reached.

Ranked hypotheses before probing were native popup activation semantics,
application code resetting selection, and lost focus. A focused plain select
with no application handlers was added alongside the lesson select. Both kept
value `1` for ArrowDown/Enter, Space/ArrowDown/Enter, and two ArrowDowns/Enter.
Focus assertions passed. The same results held in the default headless shell,
full headless Chrome, and headed full Chrome, version 151.0.7922.34 on macOS.
The initial probe's predicted Space sequence failed; that red record is retained.

These observations rule out lesson-specific reset code and lost focus, and do
not support the simple first-key-opens-menu explanation or a headless-only
explanation. The exact underlying browser/automation limitation is unresolved.
No application repair is claimed, no assertion was weakened, and a programmatic
`selectOption` result is not substituted for native keyboard proof. Native Mac
select keyboard interaction remains an explicit verification gap.

## Independent supplemental checks

Both locales passed actual manual transfer using separate, distinct clipboard
sentinels. Before the action the clipboard differed from the canonical source;
the fallback owned focus and selected the entire source; actual Meta+C followed
by clipboard readback equaled the canonical source. The original test seeded
once before its two-locale loop; this supplement seeds each locale separately.

Actual browser zoom used an isolated extension's `chrome.tabs.setZoom(2)`.
Both locales recorded DPR 2, a 640px layout viewport from a 1280px window, empty
CSS zoom, and no document overflow. Temporary browser profiles were removed.
This is separate from the original suite's explicitly labeled CSS zoom captures.

Visually inspected the English 320px fractional intermediate state and Chinese
actual 200% zoom: the separate `8` and `1/3` groups, original-card provenance,
parent/child history, and controls are readable in those captures. This limited
inspection does not override the independent review's different-preset clipping
finding. Physical devices, online judge acceptance, human learning outcomes and
public deployment remain unverified.

Evidence: [first-candidate Mac records](679-evidence/mac-candidate-c368c0b-20261025/).
The receipt preserves commands, exit codes, candidate file hashes and browser
path. Original failure logs, diagnostic probes, supplemental scripts/results and
inspected screenshots are retained. Use the frozen archive as working directory,
an external OUTPUT_DIR, PREVIEW_URL pointing to its local server, and the
installed full Playwright Chromium executable for the zoom supplement.
