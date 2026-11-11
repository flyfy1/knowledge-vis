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

## Linux follow-up — 2026-10-26, current task self-check

**1092-R1: fixed awaiting separate review.** The starting checkout already contains
adopted repair `b1c876fa`; this run retained its header-only CSS and cache token.
Against historical reviewed candidate `5cf73ee858d9a8938b55206c867233a8397d60f6`,
the runtime delta remains bounded wrapping at 52px / 48px, with automatic height
and sticky row/corner labels. No algorithm, teaching, canonical source or metadata
repair was necessary. This run strengthens the focused regression to assert every
actual text line and header placement below navigation, and corrects both focused
tests' default preview to the supplied port 18770. No prior report is modified.

Applied website-design and diagnosing-bugs skills; reused the archived independent
design contract. Before probing, reproduced the original exact clipping and ranked
three predictions: bounded wrapping restores fit; nonsticky corner confirms the
overlay; trailing scroll space alone cannot fix a strip narrower than the text.
All probes use browser-only CSS and the old stylesheet, without changing files or
services. Wrapping passed; removing corner stickiness passed diagnostically but
was rejected as a repair because row/corner association must remain; adding 60px
trailing margin failed. Probe geometry/screenshots are preserved in the new run.

Evidence root: `tests/evidence/r1-linux-20261026/`. All commands below ran from the
repository root with `OUTPUT_DIR="$PWD/leetcode/1092/tests/evidence/r1-linux-20261026/<subdir>"`.
Browser tests resolve packages via NODE_PATH and honor the configured Chromium
executable. Preview was `http://127.0.0.1:18770/leetcode/1092/`.

| Command / subdirectory | Observed result |
| --- | --- |
| `BASELINE_REVISION=5cf73ee858d9a8938b55206c867233a8397d60f6 node leetcode/1092/tests/header-fit-regression.cjs` / `red-lines` | Expected exit 1: actual text line begins at x161.84 behind corner right188.84. Screenshot reproduces missing `8 ·`. |
| `LOCALE=en node leetcode/1092/tests/header-fit-regression.cjs` / `green-en` | Exit 0: full `8 · empty`, three actual text lines x204.30..263.70 overall, corner right132, wrapper34..286, header top165.75 > nav bottom140. |
| `LOCALE=zh node leetcode/1092/tests/header-fit-regression.cjs` / `green-zh` | Exit 0: full `8 · 空`, text x205.67..262.31, corner right132; header below navigation. |
| `node leetcode/1092/tests/header-fit-matrix.cjs` / `matrix` | Exit 0: 1,296 column text-line checks; both locales, 320/390/1440, CSS zoom1/2, every preset, initial/fill/ready/end; real controls, keyboard/focus and forced colors pass. |
| `python3 -B leetcode/1092/tests/test_logic.py` / `checks` | Exit 0: actual canonical Python, 900 exhaustive pairs +168 official/seeded/boundary cases; baseline executed; source mirror exact. |
| `node leetcode/1092/tests/test_core.cjs` / `checks` | Exit 0:129 cases /3,096 frames, all branches and invariants; deep snapshots and translation keys. |
| `node leetcode/1092/tests/browser.cjs` / `browser` | Exit 0:14 bilingual preset runs;16 layouts across320/390/736/1440 and body CSS zoom1/2; formulas/frame/readout meaning, prediction selection/reveal/change and locale retention, rewind/reset/end, keyboard, contrast, links, clipboard/offline/download checks pass. |
| `python3 -B scripts/register_leetcode_lesson.py 1092 --validate-only` | Exit 0, no output. Non-mutating metadata preflight; complexity remains exactly one nonempty time/space string. No registration run. |
| `git diff --check` | Exit 0. |

Visually inspected `red-lines/header-settled.png`, `green-en/header-settled.png`
and `green-zh/header-settled.png` on actual Linux Chromium156.0.8078.4. The red
screenshot loses the coordinate; repaired English exposes all characters as
`8 ·` / `empt` / `y` with natural wrapping, Chinese exposes `8 · 空`. Row labels
remain readable and aligned with values. The matrix checks each reachable column
position with0.5px tolerance, including first/middle/terminal columns. Its dense
state coverage sets existing frame indices; separate real-button tests verify
interaction semantics. Browser source transfers compare exact untrimmed text and
bytes, including final newline; four manual clipboard attempts each reset/read a
fresh sentinel then perform actual Control+C. Seven served lesson assets match
checkout byte-for-byte (`served-hashes.json`).

Python remains the faithful preferred official interface; inspected the saved
Python3 and TypeScript snippets. There is no non-Python language contract or
supportedLanguages list to omit Python/TypeScript. Read exact registration mapping:
Python `solution.py` / `python-code.js` / `PYTHON_SOURCE`. No regeneration needed.
The formula, frame timing, cumulative output/remaining invariant and independent
aba/bab prediction scope checks from the rendered-state contract pass unchanged.

New candidate identity is recorded in this run's `candidate.json` with exact file
hashes and shared-policy hashes. Original evidence/candidate records are retained.
Limits: Linux headless Chromium and CSS zoom layout stress; native browser-menu
zoom and physical phones untested. No independent closure, acceptance, successful
LeetCode submission, commit, deployment or production verification is claimed.
Next action: separate reviewer inspects this frozen candidate and closes or keeps
open1092-R1 against the preserved original report.
