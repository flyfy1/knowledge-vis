# Lesson version choice: five lessons with a Claude Code twin (2026-11-17)

- Author: Claude Code (claude-opus-5-5), designated committer of site-template Phase 3 batch C. Self-check; independent
  review pending.
- Instruction (Yangyu, 2026-11-17): 「请你把他们分别手工处理一下 而且多agent写同一篇的话 默认用更好的那个版本。做完直接部署上线」.
  The five are the lessons Phase 3 batch B skipped; each has a Claude Code parallel edition under
  `variants/claude-code/<slug>/` (written 2026-11-09/10 by Claude Code (claude-opus-5-5), self-checked only, see
  specs/claude-code-editions.md).
- Baseline: HEAD 5173122d (served from a `git archive` copy) for the canonical pages; the working tree for the variants.

## How they were compared

As a reader is served, per pair:

1. **Science and maths**: every quantitative claim on the page read and spot-checked by hand (listed per page).
2. **Depth**: steps, what each step asks and lets the reader do.
3. **Interaction**: what the controls change, whether readouts come from a model, whether charts are readable at load.
4. **Bilingual**: page text in zh and en at 1280/390/320 (Playwright, reduced motion): CJK characters left in the English
   page, overflow, console errors.
5. **Own tests**: each version's `tests/*.cjs`.
6. **Canvas sweep**: `tests/canvas-text-overlap.cjs --sweep` at 1280/390/320 zh/en.
7. **Screenshots**: full page at 1280 zh for both versions, looked at.
8. **BRIEF / spec known defects**.
9. **Site integration** (links into the page from other pages and from the atlas) — a reader arriving from a link must
   land on the step the link describes.
10. Convertibility to the site template only as a tiebreaker.

Numbers (zh / en body text length, characters; CJK left in English; overflow at 390/320; console errors):

| page | version | steps | zh len | en len | CJK in en | overflow | errors | own tests | canvas sweep |
|---|---|---|---|---|---|---|---|---|---|
| kepler-orbits | canonical | 1 (+ wrap card) | 489 | 1168 | 1 (the 中 button) | 0 | one 404 | core ok | **FAIL: 23 findings** at 320 ("行星"/"planet" outside the canvas), 204 states |
| | variant | 7 | 5004 | 12723 | 1 | 0 | none | core 9735 checks | PASS 7776 states |
| acid-base-equilibrium | canonical | 5 | 1036 | 2423 | 1 | 0 | none | core ok | PASS 1260 states |
| | variant | 6 | 5106 | 13001 | 1 | 0 | none | core 5287 checks | PASS 450 states (scroll-aware) |
| bayes-diagnostics | canonical | 4 cards | 1256 | 2975 | 1 | 0 | one 404 | core + static ok | no canvas |
| | variant | 7 | 4315 | 12273 | 1 | 0 | none | core 469460 checks | PASS 3276 states |
| photosynthesis | canonical | 6 | 2033 | 5639 | 1 | 0 | none | browser.cjs 9 configs pass | PASS 558 states |
| | variant | 7 | 4094 | 11510 | 1 | 0 | none | core 7566 checks | PASS 2006 states (scroll-aware) |
| power-converters | canonical | 7 + sources | 4402 | 10422 | 1 | 0 | none | model 3660; browser, flow-browser 240 cases, flow-lifecycle, review-accessibility, review-matrix 1160 pass | no canvas (SVG) |
| | variant | 8 | 4806 | 12026 | 1 | 0 | none | core 6835 checks | PASS 10020 states |

## kepler-orbits — variant wins (promoted)

- **Canonical** (2026-10-29 `9c0fcb64`, no `Built-By`, unattributed): one step with three sliders (e, phase,
  inclination), one canvas, a readout and a one-paragraph wrap. The orbit is drawn larger than its canvas at 1280 (the
  ellipse is clipped top and bottom), the zh page shows the phase name in English (「当前位置：approaching periapsis」),
  the step kicker is English on the zh page («STEP 0 · ORBITAL MOTION»), the "speed" is a relative factor with no
  units, and the canvas sweep fails at 320 (planet label outside the canvas, 23 findings). Its tag line is a sentence; the
  lesson teaches no law by name except in passing.
- **Variant**: seven steps — ellipse and foci (r = a(1 − e cos E), Kepler's equation solved numerically), equal areas,
  vis-viva speed and the perihelion/aphelion ratio (1 + e)/(1 − e), T² ∝ a³ with the planets and Halley on log axes,
  transit depth (Rp/R★)² and duration, transit probability ≈ (R★ + Rp)/a (≈ 0.5 % for 1 AU, checked: R☉/1 AU =
  0.00465), and a wrap with the formulas. Real units, bodies with real data, all numbers from `model.js` and pinned by
  `tests/core.cjs`.
- Incoming links: none to a step (the atlas node links to the page top). Nothing to retarget.
- **Decision: the variant**, by every criterion. Commit 408201ac; page.json desc rewritten (it described "one draggable
  causal map"), title kept.

## acid-base-equilibrium — variant wins (promoted)

- **Canonical** (2026-10-29 `95552271`, no `Built-By`; Codex added the common-ion chart): five short steps. The
  particle canvas is the same illustration in every step (32 dots in four types, a seeded random "forward/reverse"
  counter, e.g. 「正向 0 次 / 逆向 5 次」 at load); moving Ka, C or the common ion changes the numbers printed in the canvas
  corner but not visibly the particles, so the picture does not carry the lesson. The quadratic `equilibrium()` is
  right (Ka 0.01, C 1 → x 0.095, pH 1.02). The step 1 slider reads `Ka 0.0001` at load.
- **Variant**: six steps — 200 molecules splitting and rejoining with rates from the model (dynamic equilibrium
  emerges: forward and reverse rates meet, α settles), Ka/pKa across real acids at 0.10 mol/L (HCl … HCN, checked: HCN
  Ka 6.2×10⁻¹⁰ → [H⁺] 7.9×10⁻⁶, pH 5.1), dilution of acetic acid (pH rises by ~1 per 100×, not 2, with a prediction
  question), the common-ion effect in the same particle model, "Ka large = fast?" (rate constants vs equilibrium
  constant: kf/kr), and a wrap. Quantitative readouts all from `model.js`; `tests/core.cjs` pins them, including water
  autoionisation error 0.117 %.
- Incoming links: `#step0` (dynamic equilibrium: enzymes, ph-scale, titration-curves, chemical-equilibrium) and
  `#step1` (Ka: buffer-capacity, atlas `weak-acid-equilibrium`) mean the same thing in the variant. Nothing to
  retarget.
- **Decision: the variant.** Commit b383c6dc.

## bayes-diagnostics — variant wins (promoted)

- **Canonical** (2026-10-29 `9c0fcb64`, unattributed): four cards — prior bar, sensitivity/specificity sliders with a
  2×2 count, posterior with a frequency tree, a one-question quiz. Correct (1 %/90 %/91 % → PPV 9/98 = 9.2 %, NPV
  99.9 %) and clear, but short. Its runtime does not apply `data-i18n-html`, its step ids are `step-prior` …, its
  kickers are English on the zh page (「STEP 1 · START WITH THE POPULATION」), and its links are unstyled (the batch B
  blockers).
- **Variant**: seven steps — a hook (the report says positive: how likely ill?), the prior as 1000 dots, the test
  splitting ill and healthy (expected vs one random draw), the denominator of a positive (PPV), the inverse-conditional
  confusion as its own step, a second positive test (posterior becomes the new prior), and a wrap. Default 2 %/90 %/95 %
  → PPV 26.9 % (checked: 0.018 / (0.018 + 0.049)). 469 460 checks in `tests/core.cjs`.
- Incoming links: `#step-posterior` (atlas `positive-predictive-value` node, its edge from `bayes`, its question) and
  `#step-likelihood` (edge to signal-detection) would break; numbers-lie ch6 links `#step-prior` and calls the page "a
  frequency tree of a thousand people". Moved in the same commit to `#step3`, `#step2` and `#step1`, and the
  numbers-lie wording to "a thousand dots standing for a thousand people" (its label repointed in 1eec3614).
- **Decision: the variant.** Commit a3a44e7d.

## photosynthesis — variant wins (promoted)

- **Canonical** (Codex revised edition `codex-scroll-20261026`; Codex created it, Alberto completed it, Codex and
  Claude Code fixed it): six steps — bubbles with a bet on which gas, the equation as clickable terms with an atom
  ledger, a light-intensity curve, a CO₂ curve (limiting factor), two scenario questions, a wrap. Correct (O₂ comes
  from water, the net equation with 12 H₂O is noted), with careful mobile/no-JS/DPR work (SCROLL-SPEC.md, its
  browser.cjs passes all nine configurations). Weak points: the rate model is in relative units with no CO₂ unit
  ("二氧化碳浓度（相对值）60"), respiration is absent (so the night scenario is told, not shown), and the step 0 canvas
  shows only a plant until "start bubbling" is pressed.
- **Variant**: seven steps — the classic pondweed-and-lamp experiment with inverse-square light from lamp distance and
  a glowing-splint test, balancing the equation with three coefficient sliders and per-atom columns (unique 6/6/6), where
  the mass comes from (van Helmont's willow; 93.3 % of glucose's mass from CO₂, checked: (72 + 96)/180), gross/net
  photosynthesis with respiration and the compensation point, Blackman's limiting factor with CO₂ in ppm (the light
  limit takes over at 672 ppm at 80 % light), and a whole-day budget integrated from the same model (sunny 36.3,
  overcast 3.5, sunny + CO₂ 67.7; overcast + CO₂ = overcast, the light-limited case). Every number pinned by
  `tests/core.cjs`.
- What the variant does not have: the Codex edition's no-JS fallback text (the site template's pre-fill now supplies
  readable zh text without JavaScript) and its nine-configuration mobile test (the variant passed the editions'
  overflow/console/sweep checks and the sweep above; the canonical page's own test targeted its own element ids and is
  removed with it).
- Incoming links: `#step1` (atlas node, food-web) is the equation/atom ledger in both. `#step2` (cell-structure:
  "how chloroplasts turn light into organic matter", energy-pyramid: "how producers fix light energy into organic
  matter", carbon-cycle: "how plants turn CO₂ into sugar") lands on "how much of the sugar's weight comes from the air"
  in the variant: still the step about making organic matter from CO₂, so the links were left as they are.
- **Decision: the variant**: more science (respiration, compensation point, the mass budget, a day's net), real units,
  every number model-derived. The replaced edition was Codex's with mixed history; its label moves to `previousSourceRevision`
  (70d9f2e1) and its documents stay in history. Commit 5f94f8bc.

## power-converters — canonical kept (Codex)

- **Canonical** (Codex revised edition `codex-power-converters-volt-second-20261026`; Codex created it; several Codex
  revisions with independent acceptance reviews, `specs/reviews/power-converters-*`): seven steps — voltage and power
  with KCL/KVL, an inductor pulse experiment (v = L di/dt, E = ½Li²), a capacitor pulse experiment with a zoomed
  slope (i = C dv/dt), switches, diode and PWM, buck and boost as animated SVG circuits with the conducting loop and
  each element's state per half phase, signed inductor-voltage area (volt-second balance), and an input-current budget
  with losses; then a list of primary sources (Analog Devices, TI). Ideal steady state only; it says so.
- **Variant**: eight steps — linear regulator vs switching converter, inductor slope, buck volt-second balance with a
  guessed output voltage, start-up transient from 0 V (RK4, LC ringing; checked: f₀ = 1/(2π√(47 µH·100 µF)) = 2322 Hz,
  ζ = (1/2R)√(L/C) = 0.057 at 6 Ω), boost, ripple and DCM (L_crit = (1 − D)RT/2 = 15 µH at 6 Ω, checked), efficiency.
  Also correct and strong; it covers start-up and DCM, which the canonical page names but does not simulate.
- Why the canonical page stays: the two are of comparable quality and the variant is not clearly better as a lesson
  (it has no capacitor step, no KCL/KVL step, no conducting-loop circuit animation, no sources list, and only
  self-checks), while the canonical page is the hub of the atlas `circuits` region: about twenty atlas concepts,
  edges and questions point at its specific steps (`#step1` inductor, `#step2` capacitor rate, `#step4` buck volt-second,
  `#step5` boost), the atlas's capacitor-rate and volt-second bridges (atlas/tests/capacitor-rate-*.cjs,
  volt-second-*.cjs) are built on its step 2 and step 4, and its back link returns to `atlas/?node=buck`. Promoting the
  variant would send those readers to steps that teach something else (the variant's step 2 is the buck, its capacitor
  appears only inside start-up). With no clear winner, the integrated, reviewed page stays; the edition-compare link to
  the variant stays (the variant is a real alternative).
- **Not converted to the site template.** It has no string table: `app.js` (43 KB) builds every step's markup at run
  time from 162 inline `tr(zh, en)` pairs and re-renders on a language switch; `flow.js` and `voltage-area.js` do the
  same. A conversion would be a rewrite of a Codex-reviewed page (new static markup, a key table, a changed app.js and
  its seven tests), not a conversion with a byte-for-byte gate. That rewrite is left for a separate, reviewed task (see
  HANDOFF 1f).

## Lineage and attribution of the promoted pages

- Promotion commits (408201ac, b383c6dc, a3a44e7d, 5f94f8bc) copy the variant's files and adapt them (no compare link
  to itself, footer without "parallel edition", site-nav includes, test adjustments, BRIEF change note). They are
  declared `Authorship-Impact: authored` with `Built-By: Claude Code (claude-opus-5-5)`: the text is that agent and
  model's own writing (the variants' Built-By), and `Derived-From` cannot be used because these paths already exist
  (AUTHORSHIP.md §4: the new file must first appear in that commit). A mechanical declaration would have left the
  replaced pages' authors (unattributed; Codex) as primary of every promoted file. `node scripts/authorship.cjs` now
  gives `primary: claude-code` for app.js, i18n.js, index.html, style.css, model.js and tests of all four; `created`
  still names the old file's first commit (the path's history is not rewritten).
- Conversion commits (c95ef919, 5ac22d79, 0e474801, c95ff8f9) are mechanical with `Derived-From` from the promoted
  files, so content.*.md, layout.html, figures/ and i18n.shell.js inherit `primary: claude-code`.
- Labels: page-provenance.json `kepler-orbits`, `acid-base-equilibrium`, `bayes-diagnostics` are new Claude Code ·
  original entries; `photosynthesis` changed from Codex · revised to Claude Code · original with the old
  sourceRevision 70d9f2e1 kept as previousSourceRevision (then repointed as the pages changed). No
  originalSourceRevision is set: the edition's creation commits touched only `variants/`, and
  `tests/page-provenance-core.cjs` requires that field to be a commit that touched the page and to differ from
  sourceRevision; the creation commits are named in `originalAuthorship`.
- The canonical pages no longer show the "对照 Claude Code 版 →" link: the variant is now the same lesson, so the link
  would compare the page with itself. `variants/claude-code/<slug>/` is untouched (frozen); its own compare link and the
  `variants/claude-code/` index still point at the canonical URL, which now shows the same lesson.
