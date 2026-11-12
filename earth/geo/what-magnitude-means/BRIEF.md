# BRIEF · what-magnitude-means “7 级”到底是什么意思

- Built-By: Claude Code (claude-opus-5-5), essay batch 3, 2026-11-11
- Verified-By: self-check (node model test, browser test in zh at 1280/390/320 and reduced motion, canvas `--sweep`, screenshots at 1280/390/320 and reduced motion). Independent review: pending.
- category `earth`, subtopic `geo` (地理与地质 / Geography & Geology, existing), stage `senior`
- Format: one long interactive essay (no `lesson-shell.js`, no provenance label yet). Files: `index.html`, `copy.zh.js` (all visible text), `models.js` (UMD, `window.QuakeModels`), `app.js` (wiring, drawing, i18n, IntersectionObserver gating), `tests/models.cjs`, `tests/browser.cjs`. `copy.en.js` is loaded if present (`onerror` makes the 404 harmless) and every key falls back to zh. No `copy.en.js` yet.
- Language-aware: no Chinese in app.js/models.js (test-enforced); canvas labels, aria-labels and the document title come from copy; numbers via `toLocaleString` of the effective language; large counts use 万/亿 keys in zh, million/billion keys in en, else m × 10ⁿ; sentences are whole templates.

## The one question

新闻里的“7 级”到底量的是什么？为什么地震能算概率，却报不出日子？

Answer the essay builds: a fault stores strain slowly and releases it in seconds (ch1). Magnitude measures the released fault: rigidity × area × slip, on a log scale (ch2). Shaking (intensity) depends on distance, depth and ground, not only on magnitude (ch3). P and S arrival times locate the quake and give early warning seconds, but not near the epicentre (ch4). A sheet of coupled blocks driven uniformly produces quakes of all sizes (ch5), in the Gutenberg–Richter ratio (ch6); aftershocks decay as Omori's law (ch7). Long-run rates are stable, dates are not: on the sheet, a periodic rule is no better than chance (ch8). Ch9: three questions to read quake news.

## Chapters

Each: law · everyday case · model · discovery · limits.

1. **慢慢攒，一下子放** (`#ch1`). Law: elastic rebound / stick–slip. Case: brick on a rubber band. Model: spring–block with static/dynamic friction, slip D = 2(Fs − Fd)/k, recurrence T = D/v; slip duration 4 s (tuned, labelled). Controls: plate speed 1–15 cm/yr, slip 0.5–6 m. Clock fast-forwards 20 yr/s while sticking, slip plays in real time. Discover: 3 cm/yr, 2 m → every 67 years, 5.3 × 10⁸ ratio of loading to slipping time; 15 cm/yr → 13 yr; 1 cm/yr → 200 yr. Limits: one block, two friction numbers, no rupture propagation.
2. **“7 级”量的是断层** (`#ch2`). Law: moment magnitude. Model: M₀ = μAD, μ = 32 GPa; Mw = ⅔(log₁₀M₀ − 9.1); energy log₁₀E = 1.5Mw + 4.8 (cross-checked against USGS log E = 5.24 + 1.44Mw, < 5 % apart at 7). Controls: length, width, slip (log-spaced steps). Fault drawn to scale with the 40 × 20 km reference; energy ruler with 1 t TNT, Hiroshima, world annual energy. Discover: 40 × 20 km × 1.5 m = Mw 7.0; double slip +0.2; ten times area +0.67; 400 × 200 km × 15 m = 9; ch1's 2 m on that fault → 7.1; the default fault (6.99) ≈ 1.9 × 10¹⁵ J ≈ 31 Hiroshima bombs; 6 ≈ 1; 9 ≈ 0.3 % of world 2023 energy use.
3. **震级不是震感** (`#ch3`). Law: intensity attenuation. Model: Allen, Wald & Worden 2012 hypocentral IPE (active crust), coefficients from OpenQuake `AllenEtAl2012Rhypo`: I = c0 + c1M + c2 ln√(R² + Rm²) (+ c4 ln(R/50) beyond 50 km), Rm = m1 + m2e^(M−5), σ = 0.82 + 0.37/(1 + (R/22.9)²). Site: +3.47·log₁₀F (Wald et al. 1999 PGV–MMI slope), F = 1/2/4 are illustrative and labelled so. Labelled as an illustrative published equation, not a hazard map. Compare curve: M5.5 at 5 km depth. Discover: M7 h15 → VIII above, VI at 100 km; M5.5 shallow at 5 km → VII, stronger than the 7 at 100 km; depth 5 vs 40 km → VIII vs VII; ×2 amplitude +1.0, ×4 +2.1.
4. **先到的波报信** (`#ch4`). Law: S−P timing and early warning. Model A: uniform upper crust (IASP91 vP 5.8, vS 3.36 km/s) → 7.99 km per second of S−P; three stations, distance circles, draggable epicentre (pointer and arrow keys), wavefront playback. Model B: alert time = √(dnear² + h²)/vP + processing; warning = √(d² + h²)/vS − alert; blind radius √((vS·alert)² − h²) (none when that is negative). Discover (10 km station, 4 s, 10 km depth): alert 6.4 s, blind zone 19 km, 50/100/200 km → 9/23/53 s.
5. **一整片木块** (`#ch5`). Law: coupled stick–slip gives all sizes. Model: Olami–Feder–Christensen 1992 automaton (Burridge–Knopoff 1967 simplified), 32 × 32, open edges, α = 0.2 (slider 0.10–0.24), uniform loading, no randomness after the seeded initial state (mulberry32, seed 7, 30000-event burn-in). Size → magnitude: 2 × 2 km patches, circular crack M₀ = 16/(7π^1.5)·Δσ·A^1.5, Δσ = 3 MPa (Kanamori & Anderson 1975) → one block Mw 4.6, whole grid 7.6. 1 loading unit = 100 model years (tuned). Discover (20000 model years): per millennium ≥5: 2385, ≥5.5: 843, ≥6: 296 (each half unit ≈ 35 %); α = 0.1 never reaches 6.5 in 3000 years; largest 7.3.
6. **小震多，大震少** (`#ch6`). Law: Gutenberg–Richter. Data: USGS 2000–2021 annual counts per magnitude bin; least-squares on cumulative means: b = 1.05. Toggle to the ch5 sheet: b ≈ 0.9 between 5 and 6, falls below the line at 6.5 and to about a quarter of it at 7 (finite grid). Ranges per year (world, integer magnitudes) and per millennium (sheet) shown.
7. **余震越来越少** (`#ch7`). Law: modified Omori. Model: Reasenberg & Jones 1989, λ(t, M) = 10^(a + b(Mm − M))(t + c)^−p, generic California a −1.67, b 0.91, p 1.08, c 0.05 d; N = ∫λ, P = 1 − e^−N; a random sequence drawn by Poisson inversion with GR magnitudes (seeded, “再抽一次”). Check: M6 main shock, days 7–37, M ≥ 5 → 0.206, same as the USGS OFR 96-266 table. Discover: 6.5 main, 1–8 days → 60 %; first day 82 %; 10th day 4 %.
8. **猜猜下一次** (`#ch8`). Law: long-run probabilities are stable, dates are not. Model: the ch5 sheet. Game: a different history (seed 25, 700 model years, last M7 78 years ago); reader picks a window, reveals, or asks the periodic rule (last 7 + mean interval). Long run (20000 years, step 2): M7 every 100 years, CV 1.5 (clustered), any-moment 30-year window hits 27 %, periodic rule 26 %; on the single block the periodic rule always hits (test). Sourced case: Parkfield.
9. **看懂一条地震新闻** (`#ch9`). No model: three questions (how big a fault, how far/deep/what ground, what next), three conclusions, summary, links.

Links instead of repeats: plate tectonics `earth/geo/plate-tectonics/`, wave paths and the core `earth/geo/seismic-waves/` (ch4 links its step 1 for circle construction), logarithms `math/algebra/exponents-logarithms/#step2` (ch2).

## Changes from the plan

- The brief asked for a chain of blocks (Burridge–Knopoff). A 1D chain probe did not give a clean power law at affordable sizes, so the page uses the 2D OFC automaton, the standard simplification of Burridge–Knopoff; the prose says so.
- ch4 split into two figures (locating, then warning seconds and the blind zone).
- The USGS report's “day 2 has about half of day 1” statement was not used: the Reasenberg–Jones model with c = 0.05 d gives 0.19 for day 2 vs day 1, so only model numbers and one table cell are quoted.
- Added ch9 (reading the news) as the ending.

## Real-world figures and sources

All USGS pages returned 403 to direct fetch and were opened through the Wayback Machine (`web.archive.org/web/2025/<url>`), 2026-11-11. Copies: `/tmp/agent-tasks/essays/what-magnitude-means/src/`.

| Figure in the page | Source checked |
| --- | --- |
| Mw = ⅔(log M₀ − 9.1) form, ≈ 32× energy per unit, log E = 5.24 + 1.44Mw, Northridge (6.7, 5–18 km) vs Nisqually (6.8, 48–58 km), soft ground amplifies | USGS, “Earthquake Magnitude, Energy Release, and Shaking Intensity”, usgs.gov/programs/earthquake-hazards/earthquake-magnitude-energy-release-and-shaking-intensity |
| Crustal rigidity 32 GPa (mantle 75 GPa) | USGS image caption “Seismogenic zone” (usgs.gov media) |
| Plate speeds “about as fast as fingernails grow”, under 2.5 to over 15 cm/yr; San Andreas ≈ 5 cm/yr | USGS FAQ “How fast do tectonic plates move?”; USGS *This Dynamic Earth*, “Understanding plate motions” (pubs.usgs.gov/gip/dynamic/understanding.html) |
| Annual counts 2000–2021 per bin (5: mean 1613, 1201–2276; 6: 137, 104–185; 7: 14, 6–23; 8+: 1.2, 0–4) | USGS, “Lists, Maps, and Statistics” (usgs.gov/programs/earthquake-hazards/lists-maps-and-statistics), table copied into `models.js` `gr.COUNTS` |
| MMI descriptions I–XII | USGS, “The Modified Mercalli Intensity Scale” |
| IPE coefficients | Allen, Wald & Worden 2012, *J. Seismol.* 16:409–433, via OpenQuake `hazardlib/gsim/allen_2012_ipe.py` (`AllenEtAl2012Rhypo`), file read; test re-evaluates a point by hand |
| 3.47 MMI per decade of PGV | Wald et al. 1999, *Earthquake Spectra* 15:557–564 (USGS page copy) |
| Northridge site amplification 1 to > 7 at ~90 sites | USGS Open-File Report 96-263 (of96.pdf) |
| vP 5.8, vS 3.36 km/s (upper crust) | Kennett & Engdahl 1991, IASP91 (ObsPy model file) |
| ShakeAlert: seconds to tens of seconds; La Habra M5.1 alert within ~4 s; Napa M6.0, Berkeley users 5 s; dense stations, fast processing; actions | USGS Fact Sheet 2014–3083 (fs2014.pdf); USGS “Early Warning” page |
| Reasenberg–Jones generic parameters and probability table (0.206) | Jones & Reasenberg, USGS Open-File Report 96-266 |
| No one has predicted a major quake; a prediction needs date, place, magnitude; probabilities instead | USGS FAQ “Can you predict earthquakes?” |
| Parkfield: six M~6 events 1857–1966, ~22 yr; 1984 forecast for 1988 ± 5 yr; occurred 28 Sep 2004 (38 yr gap); one explanation: stress not reset | USGS publication page “Earthquake recurrence models fail when earthquakes fail to reset the stress field” (2012); NASA Earth Observatory Parkfield note |
| 1 t TNT = 4.184 × 10⁹ J | NIST SP 811 Appendix B.9 (nist.html) |
| Hiroshima ≈ 15 kt | DOE/OSTI Manhattan Project history |
| World primary energy 2023 ≈ 620 EJ | Energy Institute, Statistical Review of World Energy 2024 |

Not sourced, tuned (labelled in the page): slip duration 4 s (ch1); friction drop = half the slip (k = 1); ground factors ×1/×2/×4; processing delay default 4 s and station distance default 10 km; OFC patch 2 km, Δσ 3 MPa (a common scaling choice), 100 model years per loading unit, α = 0.2, grid 32; seeds 7 (sheet) and 25 (game).

## Checked / not checked

Checked:
- `node earth/geo/what-magnitude-means/tests/models.cjs` — 955 checks: every prose number is computed from `models.js`, formatted and asserted in `copy.zh.js` (no literal repeated); IPE equals a hand evaluation of the OpenQuake formula; S−P inverts; warning is zero at the blind radius; R–J table cells 0.206 and ≈ 0.66; simulated aftershock counts match the expectation; sheet deterministic; CV > 1; periodic rule ≤ chance on the sheet and perfect on one block; every say-template branch filled at control extremes with all placeholders supplied and no NaN/—; every say key exercised; every `t('…')` key in app.js exists; no Chinese in app.js/models.js; no “left/right figure”.
- `ESSAY_BASE_URL=http://127.0.0.1:18965 node …/tests/browser.cjs` — 94 checks: zh at 1280/390/320 (no overflow, no clipped text, targets ≥ 48 px, no console errors besides the expected copy.en.js 404), every slider driven to both ends with its sentence read back, ch2/ch4 branch sentences, radios/checkbox, wave playback, map arrow keys, ch6 model toggle, ch7 reroll, ch8 reveal and periodic guess with score, visible keyboard focus, language toggle with `copy.en.js` absent, reduced motion (sheet static at 500 years, step button, fast disabled, block sawtooth end state, immediate reveal).
- Canvas sweep `tests/canvas-text-overlap.cjs --sweep` (result in the report) and screenshots of every figure at 1280/390/320 and reduced motion.

Not checked:
- The IPE is used outside its fitted range at the slider ends (M4, depth 60 km, 300 km); the page says it is illustrative.
- Real Parkfield, ShakeAlert and Northridge numbers were taken from the pages listed, not re-derived.
- English copy does not exist yet; English layout untested.
- Whether OFC at α = 0.2 is truly critical (the prose flags the debate).
