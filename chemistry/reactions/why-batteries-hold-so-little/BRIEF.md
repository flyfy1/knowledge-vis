# BRIEF · why-batteries-hold-so-little 电池为什么就是装不下更多电

- Built-By: Claude Code (claude-opus-5-5), deep-track essay batch 2026-11-11
- Verified-By: self-check only (node model test, browser smoke test, canvas sweep, screenshots at 1280/390/320 and reduced motion); independent review pending
- category `chemistry`, subtopic `reactions` (化学反应 / Chemical Reactions, existing), stage `university`
- Format: one long interactive essay (deep track). No `lesson-shell.js`, no provenance label. Files: `index.html`, `copy.zh.js` (all visible text), `models.js` (UMD, `window.BatteryModels`), `app.js`, `tests/models.cjs`, `tests/browser.cjs` (base URL from `ESSAY_BASE_URL`). `copy.en.js` is not written; the page loads it if present and falls back to zh key by key.
- If a dedicated subtopic is preferred later: `electrochemistry` 电化学 / Electrochemistry (would also hold `chemistry/reactions/electrochemistry/`).

## The one question

Why has the energy a lithium-ion cell stores per kilogram only roughly doubled in 35 years (Sony 1991 ≈ 120 Wh/kg, today ≥ 270 Wh/kg, Frith et al. 2023) while the cell price fell to about 1 % of its 1991 value? The ladder: chemistry sets the ceiling (ch1–3), diffusion and resistance set the speed (ch4–5), heat and side reactions set safety and life (ch6–7), production volume sets the price (ch8), then the 2026 frontier (ch9) and how to read battery news (ch10).

## Figures of merit

Specific energy (Wh/kg), energy density (Wh/L), power / C-rate (time to 80 %), cycle and calendar life (time to 80 % capacity), cost ($/kWh, cell and pack), safety (self-heating onset, thermal-runaway onset, critical oven temperature).

## Chapters and models (each model names its standard result)

1. **电子被逼着绕远路** `#ch1`. Electrochemical series and ΔG = −nFE; water stability window at pH 7 (−0.414 to +0.815 V vs SHE). Model: potential ladder; two selects; readouts E, ΔG per mol e⁻, eV per electron, relation to water. Insertion electrodes placed at their mean OCV (from ch3 fits) converted with Li⁺/Li = −3.04 V.
2. **为什么是锂，以及那些不干活的质量** `#ch2`. Q = nF/(3.6M); 1/Q_cell = 1/Q_c + 1/Q_a; waterfall theory → usable → binder → N/P excess → foils → separator → electrolyte → housing, the method of Frith et al. 2023 Suppl. Note 1. Controls: cathode, anode, areal capacity 1–8 mAh/cm².
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

## Sources (all opened 2026-11-11)

- OpenStax Chemistry 2e, Appendix L: https://openstax.org/books/chemistry-2e/pages/l-standard-electrode-half-cell-potentials
- Chen C.-H. et al., J. Electrochem. Soc. 167 (2020) 080534, via PyBaMM parameter sets: https://raw.githubusercontent.com/pybamm-team/PyBaMM/develop/src/pybamm/input/parameters/lithium_ion/Chen2020.py (also OKane2022.py, Prada2013.py, Ecker2015.py in the same folder)
- Afshar, Morris, Khajepour 2017, arXiv:1709.03970 (LFP OCV)
- Frith, Lacey, Ulissi, Nat. Commun. 14 (2023) 420 and Supplementary Note 1: https://pmc.ncbi.nlm.nih.gov/articles/PMC9879955/
- Manthiram, Nat. Commun. 11 (2020) 1550 (LCO ≈ 140 mAh/g): https://pmc.ncbi.nlm.nih.gov/articles/PMC7096394/
- Micromachines 16 (2025) 1075 (NMC811 175–205, LFP 145–163 mAh/g): https://pmc.ncbi.nlm.nih.gov/articles/PMC12566406/
- Ank et al., J. Electrochem. Soc. 170 (2023) 120536 (Tesla 4680 teardown): https://iopscience.iop.org/article/10.1149/1945-7111/ad14d0/meta
- LG M50 data: https://www.batterydesign.net/lg-21700-m50/ ; Sandia ECN https://ecn.sandia.gov/battery-safety/21700-m50lt/
- Chen H., Buston, Gill, Howard, Williams, Read, Abaza, Cooper, Wen, "A simplified mathematical model for heating-induced thermal runaway of lithium-ion batteries", J. Electrochem. Soc. (2021), accepted manuscript: https://wrap.warwick.ac.uk/id/eprint/146838/
- Ohneseit et al., Batteries 9 (2023) 237 (open-access PDF read from mdpi-res.com; journal page URL not recorded)
- Schmalstieg et al., J. Power Sources 257 (2014) 325, doi:10.1016/j.jpowsour.2014.02.012; implementation: NREL BLAST-Lite on GitHub (`blast/models/nmc111_gr_Sanyo2Ah_2014.py`)
- Ziegler & Trancik, Energy Environ. Sci. 14 (2021) 1635: https://pubs.rsc.org/en/content/articlelanding/2021/EE/D0EE02681F ; OWID data: https://ourworldindata.org/battery-price-decline

## Facts that will go stale (all in `models.js` FRONTIER; text in `copy.zh.js` `ft.*`)

| id | status | fact | as of | source |
|---|---|---|---|---|
| pack2025 | est | pack $108/kWh; LFP 81, NMC 128, stationary 70 | 2025-12 | BNEF press release https://about.bnef.com/insights/clean-transport/lithium-ion-battery-pack-prices-fall-to-108-per-kilowatt-hour-despite-rising-metal-prices-bloombergnef/ |
| bnef2026 | claim | ~$105/kWh expected 2026 | 2025-12 | same BNEF release (forecast) |
| iea2026 | est | EV batteries ≈1.2 TWh in 2025, LFP >55 %, capacity >4 TWh; cathode share of cell cost 40–50 % NMC / 25–30 % LFP (China) | 2026 | https://www.iea.org/reports/global-ev-outlook-2026/electric-vehicle-batteries |
| tesla4680 | est | 232.5 Wh/kg, 622.4 Wh/L | 2023-12 | Ank et al. 2023 |
| m50 | est | 267 Wh/kg, 740 Wh/L | spec | batterydesign.net / LG datasheet |
| ctpLfp | est | LFP CTP cell ≈160 Wh/kg, 330 Wh/L; pack 135, 210 | 2023-01 | Frith et al. 2023 |
| lfpSafety | est | ARC, SOC 100: onset 124.4 vs 85.5 °C; TR 256.3 vs 198.0 °C | 2023-04 | Ohneseit et al. 2023 |
| usgs2026 | est | Li production ≈290 kt (2025, excl. US), reserves 37 Mt, batteries 88 % | 2026-02 | https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-lithium.pdf |
| euReg | est | Li recovery 50 % by end-2027, 80 % by end-2031 | 2023-07 | Regulation (EU) 2023/1542, https://eur-lex.europa.eu/EN/legal-content/summary/sustainability-rules-for-batteries-and-waste-batteries.html |
| prologium | demo | Gen 3.5: 381 Wh/kg, 903 Wh/L, TÜV-inspected, 0.5 GWh line | 2026-09 | https://carnewschina.com/2026/09/06/mercedes-backed-prologium-starts-381-wh-kg-solid-state-production-as-carmakers-watch-from-sidelines/ |
| qs | demo | Eagle Line inaugurated, QSE-5 B-samples 844 Wh/L | 2026-02 | https://electrek.co/2026/02/05/quantumscape-inaugurates-eagle-line-pilot-solid-state-battery-production/ |
| amprius450 | demo | shipping SiCore cells, 450 Wh/kg (company) | 2025-07 | https://www.businesswire.com/news/home/20250722309461/en/ |
| form | demo | Great River Energy 1.5 MW / 150 MWh iron-air, not yet in commercial operation; target end-2026 or 2027 | 2026-10 | https://econdev.greatriverenergy.com/news/p/item/66011/latitude-media-forms-first-100hour-batteries-are-hitting-the-grid |
| shenxing3 | claim | 10→98 % in 6 min 27 s (CATL) | 2026-04 | https://electrek.co/2026/04/21/catl-one-ups-byd-new-lfp-ev-battery-charges-in-6-mins/ ; https://carnewschina.com/2026/04/21/catl-unveils-3rd-gen-shenxing-lfp-battery/ |
| blade2 | claim | 10→97 % in 9 min at 1500 kW (BYD) | 2026-03 | https://carnewschina.com/2026/03/05/byd-unveils-blade-battery-2-0/ |
| amprius500 | claim | SiCore 500 Wh/kg, Q4 2026 | 2026-09 | https://secure.businesswire.com/news/home/20260902319547/en/ |
| naxtra | claim | CATL sodium-ion 175 Wh/kg | 2025-04 | https://battery-tech.net/battery-markets-news/catl-to-deploy-sodium-ion-batteries-at-scale-in-2026/ |
| ssbPlans | claim | Toyota all-solid-state before 2028; BYD demo 2027, scale ~2030; China draft classification "hybrid solid–liquid" | 2026 | IEA GEVO 2026; https://autonews.gasgoo.com/articles/ev/2007818283636232193 |

Record claims cross-checked in two places: Shenxing 3 (electrek, carnewschina), Blade 2.0 (carnewschina, autotrader.co.nz/eepower), ProLogium (carnewschina; company release not opened), QuantumScape (electrek, rallies.ai). BNEF's $74 cell average appears only in trade press, so it is not on the page.

## Numbers pinned by tests (tests/models.cjs derives each; none repeated as a literal)

Daniell 1.10 V, −106 kJ; lead–acid 2.04 V; Li/LCO 3.90 V, −376 kJ. Capacities Li 3862, C₆ 372, Si 3579, LCO 274, NMC811 276, LFP 170 mAh/g. NMC/graphite 585 → 270 Wh/kg (46 %, 58 % active mass); LFP 373 → 209; areal 1 → 169, 8 → 286; NMC/Li 371. Lattice gas mid slope 10.3 mV per 10 % at w = 0, binodal 0.071–0.929 at w = 3. OCV slope at 50 %: NMC 8.9, LFP 0.47 mV/%; 5 mV → ±0.6 % vs ±10.6 %. τ graphite 17 min, NMC 1.9 h, LFP nano 7 min; fills graphite 10C 92 %, NMC 2C 89 %, 4C 68 %. SPM 25 °C: 1C switch 66 %, 53 min to 80 %, 103 min to C/20; 2C 36 min; 6C switch 3 %, 31 min; R×¼ 25 min; 0 °C 2C 74 min; I²R 0.5 W (1C) vs 8.0 W (4C). Thermal runaway: critical 127 °C (paper 127–128), 127 °C peak 188 °C, 128 °C runaway at 62 min peak 734 °C, cooling ×4 → 135.5 °C, +2 W → 105 °C. Ageing default: 61 % at 10 y (calendar 14 %, cycle 25 %), 3.2 y to 80 %, 35 °C → 45 %, calendar at SoC 10 % / 100 %: 8.4 % / 24.8 %, storage only 17 y. Wright: 1991-start LR 19.5 % (Ziegler & Trancik ≈ 20 %), 1998-start 29.1 %, R² 0.97, 10.5 doublings.

## Tuned rather than sourced

Housing share 20 % of cell mass (tuned so NMC/graphite lands at the top of Frith's 245–270 Wh/kg); active fraction 96 %; N/P 2 for lithium metal; silicon mean potential 0.4 V; SPM lumped ohmic resistance 0.020 Ω and its activation energy 17 kJ/mol; SPM positive volume fraction rescaled 0.665 → 0.6035 so both published stoichiometry windows hold the same charge; ageing "fit floor" 70 %; lattice-gas w on a slider (no literature value used).

## Checked / not checked

Checked: the thermal-runaway model reproduces the paper's 127–128 °C critical oven temperature; the full-series Wright fit reproduces Ziegler & Trancik's ≈ 20 %; NMC/graphite ladder lands in Frith's range; finite-volume diffusion conserves mass; SPM never exceeds 4.2 V and ends at C/20 near full.
Not checked: the exact capacity at which Schmalstieg's tests ended (the 70 % dashed threshold is an assumption); Wh/L of the LFP cells on the scatter beyond Frith's figure; ProLogium's figures in an independent test report; Naxtra vehicle deliveries; the effective date of China's solid-state classification standard; the IEA cathode cost shares beyond the summary page.
