# power-converters string-table refactor (2026-11-17): Codex revised edition, text moved into a key table by Claude Code

Evidence note for the provenance repoint of `physics/circuits/power-converters/` (AGENTS.md, specs/visual-page-provenance.md
"Cross-developer repoint"). The page is the **Codex** revised edition (`codex-power-converters-volt-second-20261026`,
kept in batch C, specs/reviews/lesson-version-choice-20261117.md). Claude Code (claude-opus-5-5) changed files in its
directory for site template Phase 3 batch D. That work is a restructuring with no change a reader can see, so the
label keeps `developer: Codex`, `kind: revised`, the edition id and the scope; only `sourceRevision` moves (old value
to `previousSourceRevision`). `originalSourceRevision` stays unset: the original flow source 24a3d727 named in the label
is not in this repository's history, and the field is never filled with a guess.

## What the commits changed

- **Table** (mechanical, `Derived-From: app.js -> i18n.js`): `i18n.js` with `STR = { zh, en }`, 180 keys. A script
  checked every value against the parent's `app.js`: 145 are one `tr(zh, en)` / `btn(…, zh, en)` literal pair, 32 are
  what the old template composed from those literals (step kickers, nav items, formula lines around one translated
  word, source-link prefixes, the step-6 feedback sentence with its link, status fragments), 3 are template literals
  with `${…}` turned into `{placeholders}`. No wording changed.
- **Refactor** (authored): `index.html` holds the seven steps, step nav and footer as static markup with `data-i18n*`
  keys; `i18n.js` gains `t()` / `applyLang()`; `app.js` takes its strings from `t()` and no longer builds markup for
  the steps, nav or footer. Ids, `#step0`…`#step6`, classes, initial control values, model, playback and plots are
  unchanged. `app.js` and `i18n.js` load with `?v=20261117`. BRIEF.md "Change 2026-11-17" records it.

## Equivalence with the parent

Method (scratch scripts in /tmp/agent-tasks/phase3d/): the parent tree (`git archive`) and the working tree were
served side by side; Playwright (Chrome, reduced motion, device scale 1) loaded each in zh and en at 1280, 390 and 320
wide and walked the same 35 control states: initial; output voltage 6/24/12 V; inductor pulses +,+,0,− and on to the
16-pulse limit; capacitor rate with no interval, after +, after +,−,0; diode reversed; PWM 20 %/75 %; Buck advanced
three half-phases, D 75 %, Vin 5 V, seek 37.5 µs, derivation opened, area presets "ON end" and "one period", reset and
advanced to two-cycle completion; Boost advanced, D 20 %, Vin 7 V, seek 80 and 0 µs; prediction "smaller", reveal,
η 80 %; language switched and back; prediction reset, "larger" and reveal; inductor and capacitor reset; Buck play,
pause and reset. In each state it recorded the page title, `<html lang>`, header, nav (text and aria-label), footer,
each step's `innerText`, every button/input/label/output/legend/summary/link/heading/aria-labelled element (text,
value, checked, disabled, aria-pressed, aria-label, href, visibility), the `outerHTML` of every SVG in `<main>` (all
plots and both circuit diagrams), which `<details>` were open, the document width, and the `<body>` DOM with the
`data-i18n*` attributes removed and bare keyed `<span>`s unwrapped. Nine states per run were also captured as
full-page screenshots.

Results (6 runs × 35 states):

- Title, lang, header, nav, footer, step text, all controls, all SVGs, open details and widths: **equal in every state**
  (30,840 comparisons, 0 differences).
- Body DOM: equal in every state up to the language switch. In the 7 states from the switch on, the only differences
  are attributes of `<input>` elements: the old page rebuilt its inputs on a language switch, writing the current state
  into their `value` / `checked` attributes, while the new page keeps the same elements, whose state lives in the
  properties (compared equal above). `style=""` on inputs the test driver had filled shows on the new page for the same
  reason. Nothing renders differently.
- Screenshots: 52 of 54 pixel-identical; the other 2 (zh 390 and zh 320 after two-cycle completion) differ by about
  900–1,000 anti-aliased pixels (largest channel difference 53, about 400 rows). The parent page alone shows the same
  two alternative renderings of these screenshots between its own runs (zh 320 two-cycle completion and en 390 Boost
  seek 80 µs in its second run; repeated zh 390 runs of both trees all gave the same image), so this is capture noise,
  not a change. One earlier draft keyed only the word 理想稳态 inside the step-0 formula; the extra text run changed the
  colon's anti-aliasing (16 pixels), so the whole formula line became one key (`s0power`, listed in `enCjk` by the
  converter because its English keeps the original U+3000 spaces).
- Live `SiteNav.report()`: no runtime auto-links on either version, zh or en; breadcrumb text and aria-label equal.
- Page tests on the refactored tree, unchanged: model (3660 checks), browser (zh/en × 320/390/768/1440), flow-browser
  (240 cases), flow-lifecycle, review-accessibility, review-matrix (1160 numerical assertions), review-responsive
  (output directed to scratch).

## Consequences outside the page

The static `id="stepN"` lets `scripts/build-atlas-data.cjs` verify the atlas's deep links: the seven concepts it had
listed under `legacyStepAnchors` (power #step0, inductor #step1, capacitor #step2, switch-diode and pwm #step3, buck
#step4, boost #step5) now carry those steps in the atlas data, the registry and CONCEPT-MAP. The two in-page links that
were only built at run time (fourier #step5, inverted-pendulum #step2) are now seen by the registry, so those two
template pages gain a generated linked-from row. Both are regenerated in a separate mechanical commit.
