# #1092 header-fit diagnosis and author repair check

Status: isolated author repair complete; fresh independent acceptance pending.
Isolated base `093440bf6df89b6a5dbc7a958ae3aef588b9acff`.
Applied website-design and diagnosing-bugs skills. No Pi/state change.

## Red-capable loop before hypotheses

Command (local preview served at19892):
`NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node leetcode/1092/tests/header-fit-regression.cjs`.
It selects English,320x1000, CSS zoom2, eight a/eight a, Complete trace, max table
scroll, and positions the header below real sticky navigation. The actual DOM Range
must expose complete `8 · empty` beside the corner. It failed with exit1 in0.48s.
The baseline screenshot visibly shows only `mpty`; original review used Linux while
this Mac Chromium151 reproduction has larger text metrics. Geometry is precise:
wrapper34…286, corner right207.109, header text149.109…266.063, nav bottom140,
header top165.938. This is real glyph occlusion, not screenshot/nav overlap.
Original red log/geometry/screenshot are retained under tests/header-fit-evidence.

## Ranked falsifiable hypotheses, recorded before probes

1. The sticky corner overlays the header independently of body row labels. If only
   that corner is nonsticky, the last column identity should become fully exposable
   while sticky tbody row labels remain available beside values.
2. Intrinsic single-line corner/header sizing consumes too much of the narrow
   table viewport. Constraining headers to existing52/48px geometry and permitting
   complete wrapping should create a usable visible column strip.
3. Insufficient trailing scroll space alone prevents exposure. More rightward
   scroll would help only if the visible strip can fit the text; the current79px
   strip versus117px text predicts that scrolling alone cannot solve it.

No acceptance or hypothesis confirmation is inferred before the probes below.

## Probe results and chosen repair

H1 was confirmed diagnostically: making only the corner nonsticky exposed the
label, but this alternative was not adopted because the approved contract retains
the opaque sticky corner. H2 passed with the approved header-only CSS constraint:
52px width/max-width,48px below600px, normal whitespace and anywhere wrapping.
Header height remains automatic and full localized text is retained. The final
implementation uses H2, not the diagnostic nonsticky probe. H3 is rejected by the
measured strip/text inequality; no trailing spacer was introduced.

**Confirmed hypothesis for the eventual commit message:** unconstrained intrinsic
header width plus the sticky corner left too little visible text area at narrow
zoom; bounded header wrapping restores the complete identity while retaining row
association. Runtime changes are limited to three local CSS lines (including a
comment) and the existing stylesheet URL's cache token. No header markup or app
logic changes were needed. Font sizes, padding, colors, row/column scope and all
existing state/controls remain unchanged.

## Green verification and limits

The same fast regression fails against the093440 baseline stylesheet served only
inside the test browser (`BASELINE_REVISION`), and passes against current actual
served CSS. Red and green logs/screenshots/geometry are separate. Green EN320/CSS2
corner spans36…132; last-header text spans204.203…263.797 inside the34…286 wrapper.
The original full `8 · empty` is visible, wrapping across lines rather than being
abbreviated. ZH `8 · 空` is also fully visible. This remains horizontal component
scrolling, not page-wide overflow. Header placement is explicitly below navigation
and captures wait two animation frames for the rendered state to settle.

`header-fit-matrix.cjs` passed1,296 actual column text-line checks: both locales,
320/390/1440 widths, CSS zoom1/2, seven presets, and initial/fill/reconstruction-ready/
end states. It positions each column at a reachable offset, checks each actual DOM
Range line against the visible strip with0.5px subpixel tolerance, verifies corner
and row-label lines, and compares corresponding cell/header boundaries. It tests
locale roundtrips with equal table/frame/output state. Dense coverage positions
existing frame state directly without changing the model; separate real-button
checks validate Next/Previous/Reset/Complete semantics and endpoints. Keyboard
ArrowRight/Left scrolls the focused region with3px focus. Forced colors/reduced
motion preserve full terminal identity. Raw records are gzip-compressed; the JSON
summary records exact browser/platform, coverage and screenshot placement.

Visually inspected settled EN/ZH320 CSS200% and EN1440 normal screenshots: full
column identity and row labels are readable. English `empty` can wrap within the
word at the tightest width; no characters are removed or shrunk. Earlier baseline
screenshot demonstrates the actual missing text. No real-phone, native browser-menu
zoom, screen-reader or human-comprehension claim is made. Verification used local
macOS Chromium151.0.7922.34; the original Linux Chromium156 environment has not been
rechecked by this author, and fresh independent candidate review remains required.

The existing browser suite passed14 locale/preset checks and16 layout checks,
all events rewind/replay, formulas/predictions, source render/mirror/download and
four distinct-sentinel native Meta+C fallback transfers. Its recorded contrast
pairs remain7.07885 or higher; shared+local CSS is11,623 bytes. No runtime, failed
asset or external-request errors. Existing core test passed129 cases/3,096 frames.
Its first attempt failed because local Acorn was absent; preserved diagnostic log,
then installed Acorn8.15.0 only in `/tmp/leetcode-1092-header-test-deps` and reran.
No repository dependency or runtime source was added. The unchanged Python numeric
suite was not repeated solely for CSS; source parity and immutable-file receipts
are separate evidence. Nonmutating registration validation is recorded separately.

No debug instrumentation remains in runtime source. Diagnostic probes exist only
in test artifacts; `PROBE_CSS` is an explicit ephemeral browser-only test hook.
No Pi files, campaign state, publication or historical review were changed. This
is author evidence, not closure of1092-R1 or a new acceptance.
