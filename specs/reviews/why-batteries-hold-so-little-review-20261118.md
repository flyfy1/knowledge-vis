# Review: chemistry/reactions/why-batteries-hold-so-little/ (2026-11-18)

Reviewer: Claude Code sub-agent (claude-fable-5-2), independent of the builders.
**Status: interrupted by the team lead (token budget) before any fix was applied.** The essay's files are
unchanged by this review. Everything below is findings; the "to fix" list is the work that remains.

Verdict so far: **ready after listed fixes** (not ready to register as it stands: one frontier entry rests on a
standard number and date that a second source contradicts, one English sentence is wrong by a factor of ~140,
and the English page has visible formatting defects).

## What was done

- REVIEW-COMMON step 1: read the Chinese page top to bottom in a browser at 1280 (text dump plus screenshots of
  ch1–ch2 only; the remaining screenshots were taken but not looked at).
- Step 2: independent re-derivation of every model (scripts in
  `/tmp/agent-tasks/essays/review-why-batteries-hold-so-little/`: `rederive.cjs`, `spm.cjs`), several sources opened.
- Step 3: read the whole English text as rendered (text dump at 1280). No screenshots of the English page were looked at.
- Steps 4–7 (layout at 1280/390/320, fixes, extending `tests/browser.cjs`, canvas sweep, diagram screenshots): **not done**.

## First-read notes (Chinese, 1280)

1. The argument holds its thread: one question, each chapter needed by the next, limits stated after each model.
2. ch6: the prose example "烘箱 127 °C 时电芯最高只到 188 °C" sits 0.01 °C below the model's critical temperature
   (127.01 °C). The peak there depends on the integrator: the page's Euler stepper gives 188.1 °C, my RK4 gives
   186.5 °C. The number is fragile. 126 °C (157.8 °C in both integrators) would be a robust example.
3. ch8: "累计产量翻了 10.5 倍" reads as "grew 10.5-fold"; the model's number is 10.5 doublings (about 1,460-fold).
   Should be "翻了 10.5 番" / "翻倍了 10.5 次".
4. ch4: the card is titled as charging a particle, but the NMC811 particle is filled with lithium, which is what
   happens to a cathode on discharge (`PARTICLES.nmc`, comment "filled on discharge"). The page should say so in one clause.
5. ch7: the default state (25 °C) is outside the fit range, so the first thing the reader sees is an extrapolation.
   The page says so; a 35 °C default would be cleaner. Design choice, not an error.
6. ch9: "290 千吨" and "37 百万吨" are not natural Chinese (29 万吨, 3700 万吨).
7. ch2: the comparison "model shares vs teardown shares" is partly circular for electrolyte and packaging (those two
   are taken from the teardown); the electrode-coating and foil agreement is independent. The limit paragraph already
   says the two figures come from one 2170 cell and a consultancy report; it does not yet say "one design, one year (2018)".

## Re-derivations (independent code, not the page's functions)

| item | page | independent | result |
|---|---|---|---|
| Capacities Li / C6 / Si(Li15Si4) / LCO / NMC811 / LFP, mAh/g | 3862 / 372 / 3579 / 274 / 276 / 170 | 3861.9 / 371.9 / 3578.6 / 273.8 / 275.5 / 169.9 | agree |
| Lithium among metals | "higher than any anode material in practical use" | Be 5948 > Li 3862 > Al 2980 > Mg 2205 mAh/g | reworded sentence is correct (zh and en) |
| Cell voltages, ΔG | 1.10 V/106 kJ, 2.04 V, 3.90 V/376 kJ, 3.69 V/356 kJ | same by hand | agree |
| Stack-up NMC/graphite 5 mAh/cm² | 585 → 267 Wh/kg | 584.6 → 266.5 | agree (inside Frith 245–270) |
| LFP/graphite | 373 → 207 | 372.8 → 206.6 | agree |
| Areal 1 / 8 mAh/cm² | 169 / 282 | 168.6 / 281.9 | agree |
| NMC/Li, NMC/Si | 363, 325 | 363.3, 324.9 | agree |
| Volumetric density | not modelled (page says so); M50 740 Wh/L is a quoted spec | 18.2 Wh / 24.3 cm³ ≈ 749 Wh/L | consistent |
| Lattice gas | 10.3 mV per 10 % at w=0; 5.1 at w=1; binodal 0.071–0.929 at w=3 | by hand | agree |
| Sphere, constant flux (analytic series, 200 roots) | graphite 10C 92 %, NMC 2C 89 %, 4C 68 %; τ 17 min / 1.9 h / 7 min | 92.0 / 89.1 / 67.9 %; 17.3 min / 1.89 h / 7.1 min | agree |
| SPM CC-CV (own finite-difference, explicit, 30 nodes) | 1C: 66 %, 53 min, 103 min; 2C 36 min; 6C 3 %, 31 min; R×¼ 25 min; 0 °C 2C 74 min; −10 °C plating | 67.0 %, 52.5, 101.5; 35.7; 3.4 %, 31.3; 25.1; 73.6; φ = −3.7 mV | agree within 1–2 % |
| SPM parameters vs Chen 2020 (from memory of the PyBaMM set, not re-opened) | area, thicknesses, radii, D, cmax, k, Ea, windows | match | plausible; not re-opened |
| Thermal runaway (own RK4) | critical 127.0 °C; 128 °C: 62 min, 734 °C; ×4 cooling 135.5; +2 W 105 | 127.01; 61.9 min, 733.8; 135.49; 105.00 | agree; 127 °C peak differs (see note 2) |
| Thermal runaway parameters vs the paper (accepted manuscript, Warwick WRAP, text extracted) | m 68.74 g, ε 0.8, A/E stage I 1.124e14 / 1.351e5, stage II 6.387e11 / 1.316e5, n 7.5, T1 88, T2 143, Tmax 762.1 °C, critical 127–128 °C | all found in the paper | verified. The 1.136 factor and cp 928 were not located in context |
| Ageing (Schmalstieg form, own integration) | 61 %; calendar 14.1 %, cycle 25.0 %; 3.2 y; 35 °C 45 %; SoC 10/100 %: 8.4/24.8 %; storage 17 y | 60.9 %; 14.1 / 25.0; 3.16 y; 44.9 %; 8.4 / 24.8; 17.1 y | agree |
| Ageing coefficients vs the paper | α = (7.543 V − 23.75)·10⁶·e^(−6976/T), β = 7.348e-3 (V − 3.667)² + 7.6e-4 + 4.081e-3 ΔDoD, t^0.75, √Q | match my recollection of the paper | **paper not opened** (no accessible copy searched for before the stop); the 70 % floor stays an assumption |
| Wright (OLS in natural logs) | 19.5 % (1991), 29.1 %, R² 0.97, $94, $67, 10.5 doublings | 19.52 %, 29.08 %, 0.971, 94.4, 66.9, 10.51 | agree |
| Hero "about 1 % of 1991" | | 111 / 9210 = 1.2 % (2023) | agree |
| Lithium floor | 0.070 kg/kWh, 3.6 TWh, 529 TWh | 0.0700, 3.65, 529 | agree |

No model error found.

## Facts spot-checked (opened 2026-11-18)

| fact | source opened | result |
|---|---|---|
| USGS: 290,000 t (2025, excl. US), reserves 37 Mt, batteries 88 % | https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-lithium.pdf (PDF read) | verified |
| BNEF 2025: pack $108, LFP 81, NMC 128, stationary 70 | BNEF release, 9 Dec 2025 | verified. The "$105 in 2026" figure was not in the summary returned: **not confirmed** |
| IEA GEVO 2026: 1.2 TWh, LFP > 55 %, > 4 TWh, cathode 40–50 % / 25–30 % (China, 2024), Toyota 2028, BYD 2027/2030, 175 Wh/kg sodium-ion, ~15-year lag | iea.org report page | verified. IEA says solid-state stays in premium segments "until the first half of the 2030s"; it does not name Naxtra |
| Ricardo teardown masses | pdfcoffee.com copy (the same third-party copy; report dated August 2018, © Ricardo 2018) | numbers verified against that copy. **Not found at the publisher. No second mass breakdown obtained** (MDPI blocked; one KIT PDF opened was a different paper) |
| Chen H. et al. 2021 thermal-runaway paper | Warwick WRAP accepted manuscript; J. Electrochem. Soc. 168 (2021) 010502 | verified (table above) |
| Nature 2026 lab cell | Europe PMC record; Nankai University release; trade press. Paper itself is behind a paywall | Nature 651, 383–389, online 25 Feb 2026, "Hydrofluorocarbon electrolytes for energy-dense and low-temperature batteries"; lithium-metal pouch cells > 700 Wh/kg at room temperature (press: 707 peak), ~400 at −50 °C; electrolyte < 0.5 g/Ah (university release). **Cell capacity and cycle life not found in anything opened** |
| QuantumScape 844 Wh/L | search only | company's own figure (21.6 Wh at C/5, 25 °C, per its blog). **No third-party test data found** |
| China solid-state classification standard | all-about-industries (15 Jul 2026), metal.com, Securities Daily via stcn/10jqka (18 Sep 2026), Jiemian (3 Jan 2026, on the draft) | **CONFLICT.** Trade press: "GB/T 43568-2026, in force 1 July 2026". Securities Daily, citing the national standards platform: **GB/T 48093.1-2026, published 28 Aug 2026, in force 1 Jan 2028**. A 2026 standard numbered 43568 is implausible (that number range was issued in 2023). The 0.5 % / 120 °C / 6 h test is confirmed for the draft (Jiemian); the 20 % / 5 % thresholds only by trade press. The official platform could not be opened |

Not checked: CATL Naxtra deliveries, Shenxing 3, Blade 2.0, Amprius, Form Energy, ProLogium, EU regulation, Frith, Ank, Ohneseit, OWID data, EVTank.

## Decisions a–d

- (a) Ricardo teardown: **not applied.** To do: say in `ch2.p3` and `ch2.limit` (both languages) that it is one measured cell of
  one design and year (2018), not all cells; record in BRIEF.md that it was read only from the pdfcoffee.com copy and that
  no publisher copy or second breakdown was found.
- (b) ProLogium: already a labelled company claim; left. Its sentence quotes "GB/T 43568-2026": drop the number (see above).
- (c) QuantumScape: no third-party data found, so it **should move to "claimed"** (`FRONTIER` status `claim`, text
  attributing 844 Wh/L to the company's own measurement). **Not applied.**
- (d) ch8–10 diagrams: none of the three introduces a structure; no diagram needed. Diagram screenshots were not reviewed.

## To fix (none applied)

Content, both languages:
1. `ft.ssStandard`, `ft.prologium`, footer sources, `FRONTIER` ssStandard `asOf`: the standard's number and date are
   contested. State the title, give both reported numbers/dates with attribution, or remove number and date.
2. QuantumScape to "claimed" (decision c).
3. ch6.p3: use 126 °C (158 °C) instead of 127 °C (188 °C); pin it in `tests/models.cjs` alongside the existing checks.
4. ch8.p2: "翻了 10.5 倍" → 10.5 doublings. **English says "cumulative output grew 10.5 times", which is false.**
5. ch4: one clause that the NMC particle is being filled as on discharge.
6. `ft.lab700`: add title/pages; say cycle life is not reported in the sources read.
7. ch9: 29 万吨 / 3700 万吨; ch2 one-cell wording (decision a).

English only:
8. Frontier dates print "As of 12/2025" and, in the picker sentence, "(as of As of 9/2026)". Needs a language-aware
   month formatter ("December 2025") and one "as of".
9. "108 $/kWh" → "$108/kWh"; "290 thousand tonnes" → "290,000 tonnes"; "identified reserves" → "reserves".
10. ch7 tile "1 times" and "Cycling 1 times a day"; missing space between concatenated live sentences in ch7 and ch8
    ("…14.1%).25 °C…", "…window.If this line…").
11. "until before the first half of the 2030s" → "until the first half of the 2030s" (IEA's wording); "Starting years give…" →
    "Different starting years give…"; "first ask five numbers"; ch4 button "Recharge" → "Charge again";
    "one-third cheaper" (81 vs 128 is 37 %).
12. Diagram labels read "Ions goinside", "acceptselectrons", "theanode coating" in the text dump: probably line-break
    tspans without a space (invisible on screen, wrong for screen readers and copy). Not confirmed visually.

## Tests

- `node chemistry/reactions/why-batteries-hold-so-little/tests/models.cjs` →
  `PASS: 1266 model and prose checks (every prose number derived from models.js; every live-sentence branch evaluated)`
- `copy.zh.js` / `copy.en.js`: 474 keys each, identical order.
- English text dump at 1280: no visible CJK except the 中 toggle; no console errors in either language.
- `tests/browser.cjs`: **not run, not extended.** Canvas `--sweep`: **not run.**

## Not checked

Screenshots beyond ch1–ch2 (zh, 1280); everything at 390 and 320; the English page visually; chart and diagram label
fit; target sizes, keyboard, focus, reduced motion; live sentences at control extremes; link texts against
`pages.config.js`; the Schmalstieg paper; the facts listed as not checked above. Server on port 19027 is stopped.
Scratch files are left in `/tmp/agent-tasks/essays/review-why-batteries-hold-so-little/`.

## Completion pass

Second reviewer: Claude Code sub-agent (claude-fable-5-2), 2026-11-18, independent of the builders. Nothing the
record above lists as done was redone. Verdict: **ready to register.**

### Fixed (both languages unless marked)

Content:
1. Solid-state standard (`ft.ssStandard`, `ft.prologium`, footer, `FRONTIER` asOf → 2026-09). One look at the official
   source: `std.samr.gov.cn` answered 503 with a maintenance notice and `openstd.samr.gov.cn` timed out (2026-11-18), so
   the conflict is **not settled**. The entry now states what is certain (a 2026 recommended national standard with that
   title; three classes as reported), gives both reported numbers and dates with their sources (trade press: GB/T 43568-2026,
   1 July 2026; Securities Daily citing the national platform: GB/T 48093.1-2026, published 28 Aug 2026, in force
   1 Jan 2028), says the platform could not be opened, and says which thresholds rest on which reports. The ProLogium
   sentence and the footer no longer quote a number. Pinned in `tests/models.cjs`.
2. QuantumScape: `FRONTIER` status `claim`; text attributes 844 Wh/L to the company's own measurement and says no
   third-party test was found. Pinned in both tests (lists are now 9 established / 3 demonstrated / 8 claimed).
3. ch6.p3: 126 °C → 158 °C. `tests/models.cjs` derives it from `trRun(126)`, checks it is at least 1 °C under the critical
   value, and carries the reason in a comment.
4. ch8.p2: "翻了 10.5 番（翻倍 10.5 次，约 1500 倍）" / "doubled 10.5 times (about 1,500-fold)"; both numbers derived in the test.
   English "Different starting years give…".
5. ch4 how-line: graphite fills when the cell charges; NMC811 and LFP are cathode materials and fill on discharge, so for
   them the calculation is a discharge at the same rate. The button reads 重新播放 / Replay instead of "charge again".
6. `ft.lab700`: Nature 651, 383–389; cycle life and cell capacity not given in what was read; full paper not read.
7. ch2.p3, ch2.limit, footer: one weighed cell of one design and year (2018), read from a third-party copy of the Ricardo
   report, not found at the publisher, no second weighing; the electrolyte and housing agreement is circular.
8. USGS entry: 29 万吨 / 3,700 万吨; English "290,000 tonnes", "reserves". ch9.p2: "more than a third cheaper" (37 %).
9. BNEF 2026 outlook ($105): confirmed in energy-storage.news's report of the 9 Dec 2025 release ("just under US$105/kWh").

English only: month names ("as of December 2025") through a language-aware formatter in `app.js`, one "as of";
"$108/kWh" style; "1 per day" and "Cycles per day: 1, each 50% deep…"; a space between joined live sentences (ch7 in
`app.js`, ch8 in copy); "until the first half of the 2030s"; "first ask for five numbers".

Layout (all found by looking at English screenshots or by `tests/browser.cjs` in English; Chinese had none):
- 320: page overflowed 58 px because of the ch8 slider label → "Extrapolate output to".
- Figure 2: the wrapped note ran below the drawing at all widths. `renderDiagrams` now grows the viewBox to fit its text.
- Figure 7: "Solvent slowly seeps in" was clipped by the aged panel's box at all widths → "Solvent seeps in".
- Figure 1, narrow layout: "Cathode" was wider than its box and the electron label touched the load box; boxes widened, label moved.
- ch1 canvas at 320: axis title and the lead-dioxide label were cut off → "Potential vs hydrogen electrode (V)", "PbO₂/PbSO₄".
- ch5 canvas at 320: the two axis titles touched → "Charge %".
- ch9 chart at 320: tick labels ran together → four ticks when the plot is under 260 px wide.

Not applied: item 12 (wrapped SVG labels lose the space between lines in `textContent`). A trailing space in each
tspan pushed end-anchored labels outside the drawing, so it was reverted. Each figure has `role="img"` and an
`aria-label`, so screen readers are not affected; only copied text is.

### Looked at

A screenshot of each of the 7 diagrams and 11 model figures, zh and en, at 1280 / 390 / 320 (108 figures on 38 contact
sheets, reduced motion, default state; the changed ones re-shot and looked at again). `tests/browser.cjs` now also
checks the English date, currency, tonnage, "1 times" and sentence-spacing formats.

### Test output (after the last page edit)

- `node chemistry/reactions/why-batteries-hold-so-little/tests/models.cjs` →
  `PASS: 1274 model and prose checks (every prose number derived from models.js; every live-sentence branch evaluated)`
- `ESSAY_BASE_URL=http://127.0.0.1:19047 node …/tests/browser.cjs` →
  `PASS: browser smoke test (zh and en at 1280/390/320: overflow, clipped text, 48px targets; seven static diagrams (role, aria, caption, labels inside, no overlap, ≥ 11 px, wide/narrow layout, before the model); keyboard; all ten models; reduced motion)`
- `CANVAS_BASE_URL=http://127.0.0.1:19047 node tests/canvas-text-overlap.cjs --sweep chemistry/reactions/why-batteries-hold-so-little/` →
  `PASS: 1612 canvas states across 1 pages × 1280/390/320 × zh/en (with slider/button sweep) have no colliding or clipped text`
  (scroll-aware mode in all 6 runs)
- `copy.zh.js` / `copy.en.js`: 474 keys each, same order. Two keys differ in placeholders on purpose
  (`ch9.month`: `{m}` vs `{mn}`; `ft.usgs2026`: 万吨 vs tonnes).

### Still open or unverified

- The standard's number and start date (official platform unreachable); the 20 % / 5 % thresholds rest on trade press only.
- Ricardo teardown: third-party copy only, one cell, no second mass breakdown.
- Nature 2026 cell: paper not read; cycle life and capacity unknown.
- Schmalstieg 2014 paper not opened; the 70 % fit floor stays an assumption (said on the page).
- Not checked by either reviewer: Naxtra deliveries, Shenxing 3, Blade 2.0, Amprius, Form Energy, ProLogium, EU regulation
  text, Frith, Ank, Ohneseit, OWID data, EVTank; link titles against `pages.config.js`; live sentences at control
  extremes in English (the Chinese branches are covered by `tests/models.cjs`).
- In headless Chromium the page's CJK-first font stack draws "°" full-width ("25 ° C") in both languages; not checked in
  a desktop browser. The stack is the site's shared one and was not changed.
- Design choice left as is: ch7 opens at 25 °C, outside the fit range (the page says so).

Server on port 19047 stopped. Scratch: `/tmp/agent-tasks/essays/review2-why-batteries-hold-so-little/`.
