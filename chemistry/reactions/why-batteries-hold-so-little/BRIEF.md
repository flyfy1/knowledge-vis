# BRIEF · why-batteries-hold-so-little 电池为什么就是装不下更多电

- Built-By: Claude Code (claude-opus-5-5), deep-track essay batch 2026-11-11
- Finishing pass 2026-11-18 (Claude Code sub-agent, exact model id unavailable to it): facts re-sourced, ch2 mass ladder rebuilt on a weighed teardown, ch9 re-sorted, seven static diagrams added, live sentences swept. Details in "Finishing pass 2026-11-18" below.
- Verified-By: self-check only (node model test, browser smoke test, canvas sweep, screenshots at 1280/390/320 and reduced motion, an independent Python re-derivation of the closed-form results); independent review pending
- category `chemistry`, subtopic `reactions` (化学反应 / Chemical Reactions, existing), stage `university`
- Format: one long interactive essay (deep track). No `lesson-shell.js`, no provenance label. Files: `index.html`, `copy.zh.js` (all visible text), `models.js` (UMD, `window.BatteryModels`), `app.js`, `tests/models.cjs`, `tests/browser.cjs` (base URL from `ESSAY_BASE_URL`). `copy.en.js` is not written; the page loads it if present and falls back to zh key by key.
- If a dedicated subtopic is preferred later: `electrochemistry` 电化学 / Electrochemistry (would also hold `chemistry/reactions/electrochemistry/`).

## The one question

Why has the energy a lithium-ion cell stores per kilogram only roughly doubled in 35 years (Sony 1991 ≈ 120 Wh/kg, today 245–270 Wh/kg for small NMC/NCA cylindrical cells, Frith et al. 2023) while the cell price fell to about 1 % of its 1991 value? The ladder: chemistry sets the ceiling (ch1–3), diffusion and resistance set the speed (ch4–5), heat and side reactions set safety and life (ch6–7), production volume sets the price (ch8), then the 2026 frontier (ch9) and how to read battery news (ch10).

## Figures of merit

Specific energy (Wh/kg), energy density (Wh/L), power / C-rate (time to 80 %), cycle and calendar life (time to 80 % capacity), cost ($/kWh, cell and pack), safety (self-heating onset, thermal-runaway onset, critical oven temperature).

## Chapters and models (each model names its standard result)

1. **电子被逼着绕远路** `#ch1`. Electrochemical series and ΔG = −nFE; water stability window at pH 7 (−0.414 to +0.815 V vs SHE). Model: potential ladder; two selects; readouts E, ΔG per mol e⁻, eV per electron, relation to water. Insertion electrodes placed at their mean OCV (from ch3 fits) converted with Li⁺/Li = −3.04 V.
2. **为什么是锂，以及那些不干活的质量** `#ch2`. Q = nF/(3.6M); 1/Q_cell = 1/Q_c + 1/Q_a; waterfall theory → usable → binder → N/P excess → foils → separator → electrolyte → housing, the method of Frith et al. 2023 Suppl. Note 1; electrolyte per Ah and the can/cap/insulation share come from one weighed teardown (`TEARDOWN`, Ricardo, 2018 Tesla Model 3 2170). Diagram `stack` (layer thicknesses to scale, LG M50, Chen 2020). Controls: cathode, anode, areal capacity 1–8 mAh/cm².
3. **电压曲线：平的还是斜的** `#ch3`. Regular-solution lattice gas E = E⁰ − (RT/F)[ln(x/(1−x)) + w(1−2x)], Maxwell plateau for w > 2 (binodal from ln(x/(1−x)) + w(1−2x) = 0). Real OCV fits: NMC811/graphite (Chen 2020), LFP (Afshar 2017; PyBaMM Prada2013 balance); SoC error = σ/|dV/dSoC|.
4. **锂离子挤不进去：扩散** `#ch4`. Fick's second law in a sphere, finite volume + backward Euler + Thomas solver; constant surface flux until the surface reaches x = 1; τ = R²/D. Graphite and NMC from Chen 2020, LFP nanoparticles from PyBaMM Prada2013.
5. **为什么最后 20% 那么慢** `#ch5`. Single particle model (SPM) of the LG M50 (Chen 2020 parameters), symmetric Butler–Volmer, Arrhenius on j₀, D and the ohmic term; CC-CV to 4.2 V, cut-off C/20; plating indicator φ_N = U_n − η_n < 0.
6. **热失控：放热跑赢了散热** `#ch6`. Lumped two-stage Arrhenius model of Chen H. et al. 2021 (21700, 5 Ah): stage I (SEI/anode) first order, stage II (cathode/electrolyte) (1−α)^7.5; laminar natural convection + radiation (ε 0.8). Semenov diagram drawn at the run's current reactant state.
7. **电池为什么会变老** `#ch7`. Schmalstieg et al. 2014 holistic model as implemented in NREL BLAST-Lite (`nmc111_gr_Sanyo2Ah_2014.py`): q = 1 − α(V,T)·t^0.75 − β(V_rms, DoD)·√Ah. √t SEI explained in prose.
8. **便宜下来的那条线** `#ch8`. Wright's law by OLS in log-log on OWID data (Way 2026, after Ziegler & Trancik 2021); LR = 1 − 2^b; conditional extrapolation only.
9. **前沿在哪里** `#ch9`. Strip chart of Wh/kg by status (established / demonstrated / claimed / model); FRONTIER data block in `models.js` with dated sentences in `copy.zh.js` (`ft.*`, placeholders filled from the data block). Lithium floor = 3.6e6/(V·F)·M_Li kg/kWh.
10. **下次读到电池新闻时** `#ch10`. Five questions; no model.

Prerequisites linked: `electrochemistry` #step0, #step2; `activation-energy` #step2; `ohms-law` #step4; `inside-a-phone` #battery; `membrane-transport`; `reaction-rates`, `chemical-equilibrium`, `thermodynamics`, `exponents-logarithms`.
Prerequisites the site lacks: Fick's laws / diffusion equation (physics), Gibbs free energy and chemical potential, entropy of mixing / regular solution and phase diagrams, heat transfer (convection, radiation), log-log regression / power laws, electrode kinetics (Butler–Volmer, overpotential).

## Sources (opened 2026-11-11; those marked † opened or re-opened 2026-11-18)

- OpenStax Chemistry 2e, Appendix L: https://openstax.org/books/chemistry-2e/pages/l-standard-electrode-half-cell-potentials
- Chen C.-H. et al., J. Electrochem. Soc. 167 (2020) 080534, via PyBaMM parameter sets: https://raw.githubusercontent.com/pybamm-team/PyBaMM/develop/src/pybamm/input/parameters/lithium_ion/Chen2020.py (also OKane2022.py, Prada2013.py, Ecker2015.py in the same folder)
- Afshar, Morris, Khajepour 2017, arXiv:1709.03970 (LFP OCV)
- Frith, Lacey, Ulissi, Nat. Commun. 14 (2023) 420: https://www.nature.com/articles/s41467-023-35933-2 (full text read through Europe PMC, https://www.ebi.ac.uk/europepmc/webservices/rest/PMC9879955/fullTextXML) †; Supplementary Note 1 and tables: https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-023-35933-2/MediaObjects/41467_2023_35933_MOESM1_ESM.pdf † (small cylindrical NMC/NCA 245–270 Wh/kg; LFP cells 160–200 Wh/kg, 350–400 Wh/L)
- Ricardo, "Battery cell teardown analysis" (2018MY Tesla Model 3, Panasonic 2170): weighed component masses of one cell. Read from a third-party copy, https://pdfcoffee.com/battery-cell-teardown-analysis-pdf-free.html † . A consultancy report, not peer reviewed, one cell; the page says so in `ch2.limit`.
- Manthiram, Nat. Commun. 11 (2020) 1550 (LCO ≈ 140 mAh/g): https://pmc.ncbi.nlm.nih.gov/articles/PMC7096394/
- Micromachines 16 (2025) 1075 (NMC811 175–205, LFP 145–163 mAh/g): https://pmc.ncbi.nlm.nih.gov/articles/PMC12566406/
- Ank et al., J. Electrochem. Soc. 170 (2023) 120536 (Tesla 4680 teardown): https://iopscience.iop.org/article/10.1149/1945-7111/ad14d0/pdf † (232.5 Wh/kg, 622.4 Wh/L, 355.9 g, 0.5 mm can wall, about 13 % of the can volume empty)
- LG M50 data: https://www.batterydesign.net/lg-21700-m50/ ; Sandia ECN https://ecn.sandia.gov/battery-safety/21700-m50lt/
- Chen H., Buston, Gill, Howard, Williams, Read, Abaza, Cooper, Wen, "A simplified mathematical model for heating-induced thermal runaway of lithium-ion batteries", J. Electrochem. Soc. (2021), accepted manuscript: https://wrap.warwick.ac.uk/id/eprint/146838/
- Ohneseit et al., Batteries 9 (2023) 237: https://www.mdpi.com/2313-0105/9/5/237 † (PDF read from mdpi-res.com). SOC 100 averages: NMC onset 85.5, TR onset 198.0, maximum 591.6 °C; LFP 124.4, 256.3, 498.6 °C.
- Baazouzi et al., Batteries 9 (2023) 309 (design of 18650/21700 cells; used only to cross-check the can mass): https://www.mdpi.com/2313-0105/9/6/309 †
- Schmalstieg et al., J. Power Sources 257 (2014) 325, doi:10.1016/j.jpowsour.2014.02.012; implementation: https://raw.githubusercontent.com/NREL/BLAST-Lite/main/blast/models/nmc111_gr_Sanyo2Ah_2014.py † (coefficients and exponents compared line by line with `AGE` in models.js; the paper itself is paywalled and was not read)
- Ziegler & Trancik, Energy Environ. Sci. 14 (2021) 1635: https://pubs.rsc.org/en/content/articlelanding/2021/EE/D0EE02681F ; OWID data: https://ourworldindata.org/battery-price-decline

## Facts that will go stale (all in `models.js` FRONTIER; text in `copy.zh.js` `ft.*`)

| id | status | fact | as of | source |
|---|---|---|---|---|
| pack2025 | est | pack $108/kWh; LFP 81, NMC 128, stationary 70 | 2025-12 | BNEF press release https://about.bnef.com/insights/clean-transport/lithium-ion-battery-pack-prices-fall-to-108-per-kilowatt-hour-despite-rising-metal-prices-bloombergnef/ |
| bnef2026 | claim | ~$105/kWh expected 2026 | 2025-12 | same BNEF release (forecast) |
| iea2026 | est | EV batteries ≈1.2 TWh in 2025, LFP >55 %, capacity >4 TWh; cathode share of the average cell production cost in China in 2024: 40–50 % NMC / 25–30 % LFP | 2026 | https://www.iea.org/reports/global-ev-outlook-2026/electric-vehicle-batteries |
| tesla4680 | est | 232.5 Wh/kg, 622.4 Wh/L | 2023-12 | Ank et al. 2023 |
| m50 | est | 267 Wh/kg, 740 Wh/L | spec | batterydesign.net / LG datasheet |
| ctpLfp | est | LFP CTP cell ≈160 Wh/kg, 330 Wh/L; pack 135, 210; LFP cell range 160–200 Wh/kg | 2023-01 | Frith et al. 2023 and its supplement |
| lfpSafety | est | ARC, SOC 100: onset 124.4 vs 85.5 °C; TR 256.3 vs 198.0 °C; maximum 498.6 vs 591.6 °C | 2023-04 | Ohneseit et al. 2023 |
| ssStandard | est | **Number and start date contested (2026-11-18): trade press says GB/T 43568-2026, in force 2026-07-01; Securities Daily (2026-09-18, via stcn.com / 10jqka, citing the national standards platform) says GB/T 48093.1-2026, published 2026-08-28, in force 2028-01-01. The official platform (std.samr.gov.cn, openstd.samr.gov.cn) was under maintenance / timing out on 2026-11-18, so neither is confirmed and the page gives both, attributed.** Content as reported: liquid electrolyte > 20 % of cell mass = liquid, 5–20 % = hybrid solid–liquid, < 5 % and ≤ 0.5 % mass loss after 6 h at 120 °C in vacuum = all-solid-state | 2026-09 | secondary only: https://stcn.com/article/detail/4189847.html ; https://news.10jqka.com.cn/20260918/c680031444.shtml ; https://www.jiemian.com/article/13836695.html (draft; the 0.5 % / 120 °C / 6 h test) ; https://www.batterydesign.net/legislation-rules-and-regulations/gb-t-43568-2026/ ; https://carnewschina.com/2026/06/23/catl-and-byd-lines-solid-state-standard-exposes-8-73-billion-usd-equipment-illusion/ ; https://news.metal.com/newscontent/104001660- . The standard text was not read; the page says so. |
| lab700 | demo | Li-metal pouch cell with a fluorinated-hydrocarbon solvent electrolyte, > 700 Wh/kg at room temperature, ≈ 400 Wh/kg at −50 °C (Nankai University, Shanghai Institute of Space Power-Sources; Nature 651 (2026) 383) | 2026-02 | secondary only: https://carnewschina.com/2026/02/26/new-breakthrough-in-lithium-battery-technology-enables-700-wh-kg-energy-density/ and one more press report; the paper was not read |
| usgs2026 | est | Li production ≈290 kt (2025, excl. US), reserves 37 Mt, batteries 88 % | 2026-02 | https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-lithium.pdf |
| euReg | est | Li recovery 50 % by end-2027, 80 % by end-2031 | 2023-07 | Regulation (EU) 2023/1542, https://eur-lex.europa.eu/EN/legal-content/summary/sustainability-rules-for-batteries-and-waste-batteries.html |
| qs | claim (was demo until 2026-11-18) | Eagle Line inaugurated, QSE-5 B-samples; 844 Wh/L is the company's own measurement, no third-party test found | 2026-02 | https://electrek.co/2026/02/05/quantumscape-inaugurates-eagle-line-pilot-solid-state-battery-production/ |
| amprius450 | demo | shipping SiCore cells, 450 Wh/kg (company) | 2025-07 | https://www.businesswire.com/news/home/20250722309461/en/ |
| form | demo | Great River Energy 1.5 MW / 150 MWh iron-air, not yet in commercial operation; target end-2026 or 2027 | 2026-10 | https://econdev.greatriverenergy.com/news/p/item/66011/latitude-media-forms-first-100hour-batteries-are-hitting-the-grid |
| shenxing3 | claim | 10→98 % in 6 min 27 s (CATL) | 2026-04 | https://electrek.co/2026/04/21/catl-one-ups-byd-new-lfp-ev-battery-charges-in-6-mins/ ; https://carnewschina.com/2026/04/21/catl-unveils-3rd-gen-shenxing-lfp-battery/ |
| blade2 | claim | 10→97 % in 9 min at 1500 kW (BYD) | 2026-03 | https://carnewschina.com/2026/03/05/byd-unveils-blade-battery-2-0/ |
| amprius500 | claim | SiCore 500 Wh/kg, Q4 2026 | 2026-09 | https://secure.businesswire.com/news/home/20260902319547/en/ |
| prologium | claim (was demo) | Gen 3.5: 185.4 Ah cell, 381 Wh/kg, 903 Wh/L, initial 0.5 GWh at Taoyuan; company says TÜV Rheinland checked the energy figures and UL Solutions measured < 0.05 % mass loss under the Chinese classification standard (the page no longer quotes a standard number, see ssStandard); neither report is public | 2026-09 | https://carnewschina.com/2026/09/06/mercedes-backed-prologium-starts-381-wh-kg-solid-state-production-as-carmakers-watch-from-sidelines/ ; https://electrive.com/2026/09/07/prologium-begins-series-production-of-next-generation-solid-state-batteries-in-taiwan (electrive gives the plant's planned capacity as 3 GWh) |
| naxtra | claim | CATL sodium-ion 175 Wh/kg; Changan Nevo A06 with a sodium pack announced Feb 2026; CATL expects 10,000–20,000 sodium cars in 2026; no independent delivery count found | 2026-06 | https://battery-tech.net/battery-markets-news/catl-to-deploy-sodium-ion-batteries-at-scale-in-2026/ ; https://newatlas.com/automotive/catl-naxtra-sodium-ion-changan-nevo-a06/ ; https://carnewschina.com/2026/06/25/catl-expects-up-to-20000-evs-to-be-euipped-with-sodium-ion-batteries-in-2026/ ; https://battery-tech.net/why-sodium-ion-won-2026-and-all-solid-state-is-still-a-2027-bet/ |
| ssbPlans | claim | Toyota all-solid-state no later than 2028; BYD first sales 2027, volume from 2030 (the classification standard moved to its own entry, ssStandard) | 2026 | IEA GEVO 2026; https://autonews.gasgoo.com/articles/ev/2007818283636232193 |

Record claims cross-checked in two places: Shenxing 3 (electrek, carnewschina), Blade 2.0 (carnewschina, autotrader.co.nz/eepower), ProLogium (carnewschina, electrive; company release not opened), QuantumScape (electrek, rallies.ai). BNEF's $74 cell average appears only in trade press, so it is not on the page.

## Numbers pinned by tests (tests/models.cjs derives each; none repeated as a literal)

Daniell 1.10 V, −106 kJ; lead–acid 2.04 V; Li/LCO 3.90 V, −376 kJ. Capacities Li 3862, C₆ 372, Si 3579, LCO 274, NMC811 276, LFP 170 mAh/g. NMC/graphite 585 → 267 Wh/kg (46 %, 57 % active mass); LFP 373 → 207; areal 1 → 169, 8 → 282; NMC/Li 363, NMC/Si 325. Teardown: packaging 13.1 g of 68.6 g = 19.1 %, electrolyte 6.13 g / 4.78 Ah = 1.28 g/Ah; every model mass share within 2 points of the teardown's. Diagram numbers: stack thicknesses 16 / 75.6 / 12 / 85.2 / 12 µm; ch6 temperatures 85.5 / 198.0 / 591.6 and 124.4 / 256.3 / 498.6 °C (LFP maximum 93 K lower). Lattice gas mid slope 10.3 mV per 10 % at w = 0, binodal 0.071–0.929 at w = 3. OCV slope at 50 %: NMC 8.9, LFP 0.47 mV/%; 5 mV → ±0.6 % vs ±10.6 %. τ graphite 17 min, NMC 1.9 h, LFP nano 7 min; fills graphite 10C 92 %, NMC 2C 89 %, 4C 68 %. SPM 25 °C: 1C switch 66 %, 53 min to 80 %, 103 min to C/20; 2C 36 min; 6C switch 3 %, 31 min; R×¼ 25 min; 0 °C 2C 74 min; I²R 0.5 W (1C) vs 8.0 W (4C). Thermal runaway: critical 127 °C (paper 127–128), 126 °C peak 158 °C (the prose example since 2026-11-18; 127 °C is 0.01 °C under the critical value and its peak depends on the integrator), 128 °C runaway at 62 min peak 734 °C, cooling ×4 → 135.5 °C, +2 W → 105 °C. Ageing default: 61 % at 10 y (calendar 14 %, cycle 25 %), 3.2 y to 80 %, 35 °C → 45 %, calendar at SoC 10 % / 100 %: 8.4 % / 24.8 %, storage only 17 y. Wright: 1991-start LR 19.5 % (Ziegler & Trancik ≈ 20 %), 1998-start 29.1 %, R² 0.97, 10.5 doublings (about 1,500-fold).

## Tuned rather than sourced

Active fraction 96 %; N/P 2 for lithium metal; silicon mean potential 0.4 V; SPM lumped ohmic resistance 0.020 Ω and its activation energy 17 kJ/mol; SPM positive volume fraction rescaled 0.665 → 0.6035 so both published stoichiometry windows hold the same charge; ageing "fit floor" 70 %; lattice-gas w on a slider (no literature value used).

No longer tuned: the housing share. It was 20 %, chosen so the default landed at the top of Frith's range. It is now `TEARDOWN.packaging / TEARDOWN.cell` = 19.09 % (can 12.01 g + cap 0.90 g + insulation 0.19 g of 68.63 g), and electrolyte is the same teardown's 1.28 g/Ah (was a round 1.0). With both taken from the weighed cell and nothing adjusted, the default comes out at 267 Wh/kg, inside 245–270, and the model's mass shares agree with the teardown's (cathode coating 37.6 vs 38.1 %, anode coating 22.3 vs 22.2 %, Al 3.1 vs 3.2 %, Cu 7.8 vs 6.2 %, separator 0.9 vs 1.8 %, electrolyte 9.3 vs 8.9 %). The LFP default (207 Wh/kg) sits just above Frith's 160–200 band, because a 2170 can's share is applied to a chemistry that ships mostly as large prismatic cells; `ch2.limit` says so.

## Diagrams (STANDARD §4a)

Seven static SVG figures, built in `app.js` (`DG.*`, wide layout from 600 px of figure width, narrow below), every string from `dg.*` keys in `copy.zh.js`, each before its chapter's model.

| figure | chapter | what it shows | scale |
|---|---|---|---|
| `cell` | 1 | two electrodes, separator, electrolyte, load; electron path outside, ion path inside | schematic |
| `stack` | 2 | Al foil, cathode coating, separator, anode coating, Cu foil | thicknesses to scale, from `SPM` (Chen 2020), pinned |
| `host` | 3 | half-filled lattice as a solid solution and as two phases | schematic; both panels hold exactly half |
| `particle` | 4 | cut particle during fast charge: full surface shell, empty core, radius R | schematic |
| `volt` | 5 | terminal voltage = open-circuit voltage + overpotential + I·R | schematic |
| `temps` | 6 | self-heating onset, runaway onset, maximum for NMC and LFP | on a temperature axis, from `FRONTIER` lfpSafety, pinned |
| `sei` | 7 | graphite, SEI, electrolyte; new and aged | schematic (caption: real films are nanometres) |

Chapters 8–10 introduce no structure (a regression, a list of dated facts, five questions) and have no diagram.

## Finishing pass 2026-11-18

Corrected on the page:
- ch2: housing and electrolyte re-sourced (above); all ladder numbers changed (270 → 267, 209 → 207, 286 → 282, 371 → 363). "Lithium has the highest specific capacity of all metals" was false (beryllium is higher) and now reads "higher than any anode material in practical use". 4680 note now gives the teardown's own reasons (0.5 mm wall, about 13 % empty volume).
- ch1: the water window is drawn at pH 7 while the H₂ and O₂ couples in the table are standard-state (acid) values; the how-line and the limit paragraph now say so. A reversed pair is judged against the water window in the roles it would really take.
- ch3: an error above 50 % was printed as "±>50%"; it now reads "超过 ±50%".
- ch4: stray space before 短 / 后 / 还长 after a time with a unit.
- ch6: Semenov's thermal-explosion work dated to the late 1920s; maximum temperatures added from Ohneseit. Two new live-sentence branches: exactly at the critical temperature ("离临界只差 0.0 °C" before), and extra heating so large that the critical temperature is below the 80 °C search floor ("高于临界值 ≤ 80 °C" before).
- ch7: at 50 °C and 100 % mean charge the fitted calendar loss exceeds 100 % ("151.3%" on a tile); loss readouts are capped at 100 %. A mixed case where calendar loss was only slightly larger was described as "mainly calendar, cycling only …"; reworded to a plain comparison.
- ch8: the "all the data, about 20 %, agrees with Ziegler & Trancik" sentence also fired for 1992 and 1993 starts (21.9 %, 24.2 %); now only for 1991. Cathode cost shares dated: China, 2024.
- ch9: three categories redefined (established = measured by a third party or official statistics/regulation; demonstrated = shipped or published measurement; claimed = company statement or plan). ProLogium moved from demonstrated to claimed and labelled 公司数据. New entries: GB/T 43568-2026 and the Nature 2026 lab cell. Naxtra and solid-state plans rewritten with dates. The LG M50 entry showed "截至 产品规格书"; it now uses its own label. Axis extended to 750 Wh/kg.
- Layout: on a 320 px screen the ch9 picker ran 14 px past its card; fixed and tested.

Verified against the source this pass: Frith ranges (incl. LFP Wh/L, in the supplement); Ank 4680 figures; Ohneseit temperatures; IEA GEVO 2026 figures and the wording of the cathode cost shares; BNEF 2025 survey is still the latest (the 2026 survey was not out on 2026-11-18); Amprius SiCore 500 not yet shipping; Form Energy still not in commercial operation; BLAST-Lite coefficients equal `AGE`.

Re-derived independently (Python, closed forms, not the page's code): capacities 3862 / 372 / 3579 / 274 / 276 / 170 mAh/g; Daniell 1.10 V and −106 kJ; lead–acid 2.04 V; water window; lattice-gas mid slope 10.28 mV per 10 %; binodal 0.0707 / 0.9293 at w = 3; lithium floor 0.0700 kg/kWh at 3.7 V; τ = R²/D 17.3 min, 1.9 h, 7.1 min; analytic series solution for the sphere at constant flux gives fills 92.0 / 89.1 / 67.9 %. The SPM, the thermal-runaway integration, the ageing fit and the Wright regression were not re-implemented; they rest on the checks in `tests/models.cjs` (paper's 127–128 °C, Ziegler & Trancik's ≈ 20 %, BLAST-Lite coefficients).

Every control was driven to its ends and to awkward middles (about 170 states) and each live sentence read; the defects found are the ones listed above.

## Checked / not checked

Checked: the thermal-runaway model reproduces the paper's 127–128 °C critical oven temperature; the full-series Wright fit reproduces Ziegler & Trancik's ≈ 20 %; NMC/graphite ladder lands in Frith's range without a tuned parameter and its mass shares match a weighed cell; finite-volume diffusion conserves mass and matches the analytic series; SPM never exceeds 4.2 V and ends at C/20 near full.

Still not verified:
- The capacity at which Schmalstieg's tests ended. The 70 % dashed threshold stays an assumption (listed under "tuned"); the paper is paywalled. BLAST-Lite notes that the fit has no knee point; `ch7.limit` says so.
- China's solid-state classification standard: number and start date contested between secondary sources (see the ssStandard row); the official platform could not be opened on 2026-11-18. The 20 % / 5 % thresholds only from trade press. The page states this and gives both versions.
- The Nature 2026 > 700 Wh/kg cell (Nature 651, 383–389): Europe PMC record, university release and press; the paper itself not read; cycle life and cell capacity not found. Stated on the page.
- Naxtra deliveries: only CATL's own expectation (10,000–20,000 cars). Stated on the page.
- QuantumScape's 844 Wh/L: company figure, no third-party test found; listed under claimed since 2026-11-18.
- The Ricardo teardown: read only from a third-party copy (pdfcoffee.com) of a 2018 consultancy report; not found at the publisher; no second mass breakdown obtained; one cell of one design and year. `ch2.p3`, `ch2.limit` and the footer say so.
- ProLogium: no public test report; kept as a labelled company claim.
- English: written and checked in the completion pass below.

## Independent review 2026-11-18 (interrupted; no page file changed)

- Verified-By: Claude Code sub-agent (claude-fable-5-2); scope: Chinese first read at 1280 (text, ch1–ch2 screenshots), independent re-derivation of all models, English text read as rendered at 1280, part of the facts. Stopped by the team lead for token budget before fixes, layout checks and browser tests. Full notes and the fix list: `specs/reviews/why-batteries-hold-so-little-review-20261118.md`.
- Checked and agreeing with the page: capacities, cell voltages, the mass stack-up (267 / 207 / 169 / 282 / 363 / 325 Wh/kg), lattice gas, sphere diffusion against the analytic series, the single-particle CC-CV model against an independent finite-difference implementation, thermal runaway against an RK4 integration and against the parameter values in the paper's accepted manuscript, the ageing fit, the Wright regression, the lithium floor. USGS, BNEF 2025 prices, IEA GEVO 2026 figures and the Ricardo masses (same pdfcoffee.com copy) re-opened and matching.
- Found, NOT yet fixed:
  - The solid-state standard's number and date are contested: trade press says GB/T 43568-2026 in force 2026-07-01; Securities Daily, citing the national standards platform, says GB/T 48093.1-2026, published 2026-08-28, in force 2028-01-01. The entry, the ProLogium sentence and the footer must not state 43568 / 1 July as fact.
  - QuantumScape 844 Wh/L: no third-party data found; move to "claimed".
  - ch8 English "cumulative output grew 10.5 times" is false (10.5 doublings); the Chinese "翻了 10.5 倍" is ambiguous.
  - ch6 "127 °C → 188 °C" is 0.01 °C from the critical point and integrator-dependent (186.5 °C with RK4); use 126 °C.
  - ch4 does not say the NMC particle is filled as on discharge. ch2 does not yet say "one cell of one design and year".
  - English formatting: "As of 12/2025", "(as of As of 9/2026)", "108 $/kWh", "1 times", missing spaces between live sentences, and smaller wording items.
- NOT checked: layout at 1280/390/320 in either language, English page visually, diagrams, target sizes, keyboard, reduced motion, `tests/browser.cjs` (not run, not extended), canvas sweep, link titles against `pages.config.js`, the Schmalstieg paper, Nature paper full text (cycle life unknown), a second published mass breakdown, BNEF's $105 forecast, Naxtra and the other company entries.

## Completion pass 2026-11-18 (second reviewer; fixes applied)

- Verified-By: Claude Code sub-agent (claude-fable-5-2); scope: applied the first reviewer's fix list in both languages; one look for the solid-state standard at the official platform (unreachable); BNEF "just under $105/kWh in 2026" confirmed in energy-storage.news's report of the BNEF release; whole English copy read; a screenshot of every diagram and every model looked at in zh and en at 1280 / 390 / 320 (reduced motion, default state); `tests/models.cjs`, `tests/browser.cjs` (zh and en) and the canvas sweep run after the last edit. Not re-verified: anything the first review records as done. Details and test output: `specs/reviews/why-batteries-hold-so-little-review-20261118.md`, "Completion pass".
- Content changed: standard entry / ProLogium sentence / footer (no standard number stated as fact; both reported versions attributed); QuantumScape moved to claimed; ch6 example 126 °C → 158 °C (pinned, with the reason in the test); ch8 "翻了 10.5 番（翻倍 10.5 次，约 1500 倍）" / "doubled 10.5 times (about 1,500-fold)" (both pinned); ch4 how-line says graphite fills on charge, NMC811 and LFP on discharge, and the button reads 重新播放 / Replay; ch2 one-cell, one-design, one-year, third-party-copy wording and the note that the electrolyte and housing agreement is circular; lab cell entry gives volume and pages and says cycle life and capacity were not found; 29 万吨 / 3,700 万吨; "便宜三分之一以上" (81 vs 128 is 37 %).
- English: month names and a single "as of"; "$108/kWh"; "290,000 tonnes", "reserves"; "1 per day"; spaces between joined live sentences; IEA wording; smaller items from the record.
- Layout fixes (all found in English): 320 px horizontal overflow from the ch8 slider label; Figure 2's note ran past the drawing (the drawing now grows to fit its text); Figure 7's "Solvent slowly seeps in" was clipped in the aged panel; Figure 1's narrow layout had "Cathode" wider than its box; ch1 canvas axis title and the lead-dioxide label were cut off at 320; ch5 canvas titles touched at 320; ch9 chart ticks ran together at 320 (four ticks below 260 px of plot width).
- Still open: see the review record.
