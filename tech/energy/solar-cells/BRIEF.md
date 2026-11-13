# BRIEF · solar-cells 光伏：一个光子能换多少电

- Built-By: Antigravity (gemini-4-hydrogen)
- Verified-By: self-check (`node tech/energy/solar-cells/tests/models.cjs` — all equation checks, prose numbers, `.say` branches, zh/en parity, `REGISTRY.json` schema, and zero unintended CJK verified). Browser/Playwright check pending phase wrap-up queue.
- category `tech`, subtopic `energy` (能源与电网 / Energy & the Grid), stage `university`
- Format: deep-track interactive essay (9 chapters, 7 live models + dated Nov 2026 frontier + figures-of-merit reader checklist). No `.page-provenance` label pre-commit; `copy.zh.js` and `copy.en.js` both complete and verified for parity.

## The one question

When a thousand watts of sunlight fall on a square metre of ground at noon, why does even the best commercial silicon solar panel deliver roughly 200 to 250 watts of electricity — and what physics, circuits, grid matching and manufacturing scale govern the ceiling?

## Chapters, models and standard results

| # | Chapter | Model (`models.js`) | Standard result / benchmark |
|---|---------|---------------------|-----------------------------|
| 1 | 太阳光不是一种颜色 | `spectrum` | 5778 K Planck blackbody (1361 W/m² AM0 total; 1319 W/m² in 280–4000 nm) + atmospheric transmittance normalized to AM1.5G = 1000.0 W/m² (~4.46×10²¹ photons/m²·s) |
| 2 | 禁带的左右为难 | `bandgap` | Step absorptance cutoff λ_g = hc/E_g; Trivich–Flinn band-edge energy partition (Si 1.12 eV → 1107 nm, 20.0% below-gap, 31.6% thermalization, 48.3% band-edge, J_sc,max = 43.2 mA/cm²) |
| 3 | 肖克利–奎伊瑟极限 | `sq` | Detailed-balance radiative dark current J_{0,rad}(E_g, T) at 300 K + ERE + concentration X (peaks at 33.4% near 1.34 eV under this smooth AM1.5G curve; Si 33.0% ideal, vs Rühle 2016 ASTM G173-03 33.7% peak & Richter 2013 Si Auger limit 29.4%) |
| 4 | 真实电池的伏安曲线 | `iv` | Single-diode equation J = J_L − J_0(exp(q(V+J·R_s)/nkT)−1) − (V+J·R_s)/R_{sh} via bracketed Newton–Raphson + Varshni E_g(T) (STC 24.2%, V_oc 0.735 V, dV_oc/dT −2.47 mV/K, −0.40%/K) |
| 5 | 叠罗汉破极限 | `tandem` | 2-junction SQ detailed balance comparing series 2T vs independent 4T across AM1.5G and red-shifted AM3.0 (1.55 eV/1.12 eV: 42.9% 4T vs 32.7% 2T; 1.73 eV/1.12 eV: 44.4% 2T & 4T) |
| 6 | 光伏并上电网 | `grid` | CAISO 2024-04-14 hourly demand/solar/wind + 3.0 GW must-run floor + 4-hour LFP bisected peak shaving (1×: 7.3% curt; 2× no battery: 44.9% curt, 20.0 GW evening peak; 2× + 40 GWh @ 85%: 26.3% curt, 14.1 GW peak) |
| 7 | 斯旺森定律与 BOS | `learning` | Wright's / Swanson's Law P(Q) = P_0 (Q/Q_0)^{-b} at LR = 22% (0.001 GW → $42.8/W; 2974 GW → $0.20/W) + 65% area-scaled BOS ($0.42/W at 22.7% eff → $0.62/W total, 33% module share; 30% eff → $0.56/W) |
| 8 | 前沿在哪里（2026-11） | `frontier` | Filterable dated cards separating Commercial/Fact, Certified Lab Record, and Claim/Open Hurdle |
| 9 | 怎么读一则光伏新闻 | (figures of merit & 4 questions) | η (cell vs module), γ_{Pmp} (%/°C), system $/W_p & storage-adjusted LCOE, annual degradation %/yr & IEC 61215 |

## Numbers in the prose (all pinned in `tests/models.cjs`)

- ch1: AM0 total 1361 W/m² (280–4000 nm model band 1319 W/m²); AM1.5G = 1000 W/m², 52% visible (380–780 nm), 44% IR (>780 nm), 4.2% UV, flux 4.46×10²¹ /m²·s.
- ch2: Si 1.12 eV → cutoff 1107 nm, below-gap 20.0%, thermalization 31.6%, band-edge 48.3%, max J_sc 43.2 mA/cm². Ge 0.67 eV → below-gap 6.0%, therm 54.5%, edge 39.5%. GaAs 1.42 eV → edge 44.9%.
- ch3: model SQ peak 33.4% at 1.34 eV (V_oc ~1.08 V); Si 1.12 eV ideal 33.0%, V_oc 0.878 V, FF 87.0%, radiative+Carnot share 15.4%; ERE 1% → 28.0%, V_oc 0.759 V.
- ch4: STC (1000 W/m², 25 °C) → V_oc 0.735 V, J_sc 41.2 mA/cm², FF 80.1%, η 24.2%; 65 °C → V_oc 0.636 V (−2.47 mV/K), η 20.3% (−0.40%/K rel); R_s = 4.0 → FF 63.5%, η 19.2%; R_{sh} = 100 → η 20.6%; G = 200 W/m² → η 22.6%.
- ch5: 1.55 / 1.12 eV → 4T 42.9%, 2T 32.7% (J₁ = 26.5, J₂ = 16.6 mA/cm²); 1.73 / 1.12 eV → J₁ = 21.3, J₂ = 21.9 mA/cm², 2T & 4T both 44.4%; at AM 3.0 → 2T drops to 42.9%, 4T stays 44.2%.
- ch6: 1× no battery → 126.2 GWh potential, 7.3% curtailed, 20.0 GW evening peak; 2× no battery → 113.5 GWh curtailed (44.9%), 20.0 GW peak; 2× + 40 GWh (85%) → 26.3% curtailed (66.4 GWh), 14.1 GW peak.
- ch7: LR 22% → 1976 (0.001 GW) $42.8/W, 2025 (2974 GW) $0.20/W; with $0.45/W baseline BOS @ 20% eff, at 22.7% eff BOS = $0.42/W, total = $0.62/W (33% module share); at 30% eff total = $0.56/W.

## Sources & verification (checked 2026-11-13)

1. **IEA PVPS**, *Snapshot of Global PV Markets 2026* (Apr–May 2026), https://iea-pvps.org/snapshot-reports/snapshot-2026/ (HTTP 200 fetched 2026-11-13): ~2.97 TW (nearly 3 TW) cumulative PV by end of 2025, ~698 GW added in 2025; China ~60% of 2025 additions (~1,464 GW cumulative), EU27 406 GW, US ~268 GW, India ~180 GW.
2. **Fraunhofer ISE**, *Photovoltaics Report*, https://www.ise.fraunhofer.de/en/publications/studies/photovoltaics-report.html (HTTP 200 fetched 2026-11-13): weighted-average c-Si commercial module efficiency 22.7% (2024 shipments, range 18.9%–24.8%); n-type TOPCon & HJT displacing p-type PERC.
3. **NREL / NLR**, *Best Research-Cell Efficiency Chart*, https://www.nlr.gov/pv/cell-efficiency (HTTP 200 checked 2026-11-13): single-junction perovskites ~27.3%–28%, all-perovskite tandems >30%, hybrid tandem tracking; also ASTM G173-03 AM1.5G reference 1000 W/m².
4. **LONGi & independent certifiers (ISFH / ESTI)**: LONGi news & press releases (https://www.longi.com/en/news/, HTTP 200 checked 2026-11-13; verified via search summaries): 28.29% c-Si HIBC certified by ISFH (2026); 35.5% 2T c-Si/perovskite tandem certified by ESTI (July 2026), following 34.85% NREL (Apr 2025) and 35.2% UNSW tables (mid-2025).
5. **Green et al.**, *Solar Cell Efficiency Tables* (Version 67 & Version 68, *Progress in Photovoltaics*, 2026): independent peer-reviewed compilation of certified records.
6. **Shockley & Queisser (1961)**, *J. Appl. Phys.* 32, 510; **S. Rühle (2016)**, *Solar Energy* 130, 139–147 (tabulated SQ limit 33.7% at 1.34 eV under ASTM G173-03 AM1.5G); **A. Richter et al. (2013)**, *IEEE J. Photovoltaics* 3(4), 1184–1191 (29.4% silicon Auger practical limit).
7. **CAISO Today's Outlook**, 2024-04-14 hourly demand, solar and wind series (inherited from `tech/energy/how-electricity-reaches-you/models.js`, sourced from `https://www.caiso.com/outlook/history/`).
8. **IEC 61215 / TÜV Rheinland & perovskite reliability literature**: damp heat 85 °C/85% RH 1000 h, 200 thermal cycles; peer-reviewed literature noting chamber qualification does not yet guarantee 25-year field durability (ion migration, thermomechanical delamination, lead encapsulation).

## Facts that will go stale (Ch. 8 & Ch. 7 frontier markers)

- Global cumulative PV (~2.97 TW at end-2025) and 2025 annual installations (698 GW).
- Commercial weighted-average c-Si module efficiency (22.7%) and spot module price floor (<$0.15–$0.20/W).
- Single-junction c-Si world record (28.29% ISFH), perovskite–silicon 2T tandem record (35.5% ESTI), single-junction perovskite (~27.3%–28%) and all-perovskite tandem (>30%).
- Perovskite–silicon tandem IEC 61215 commercialization & outdoor durability status.

## Prerequisites lacking from the site

- None strictly blocking; `blackbody-radiation`, `photoelectric-effect`, `why-chips-are-hard`, `how-electricity-reaches-you`, and `ohms-law` are all live and linked. A dedicated grid-battery chemistry/storage essay (`why-batteries-hold-so-little`) does not exist yet on the site (`tech/devices/inside-a-phone/#battery` covers Li-ion internal resistance at cell scale).

## Tuned / illustrative parameters (labelled on the page)

- Ch. 1: Smooth analytical Rayleigh/O₃/aerosol/H₂O transmittance over 5778 K Planck rather than the 2002-row ASTM G173-03 table (gives 33.4% SQ peak vs 33.7% tabulated).
- Ch. 4: Baseline STC diode J_{sc0} = 41.2 mA/cm², n = 1.15, J_0(25 °C) = 6.5×10⁻¹⁰ mA/cm² (yields realistic 24.2% commercial c-Si cell).
- Ch. 6: 3.0 GW CAISO must-run floor (matching `how-electricity-reaches-you`) and 4-hour battery ratio P_{max} = E_{max}/4 with perfect daily foresight.
- Ch. 7: Historical milestones are representative real-dollar benchmarks; BOS split assumes 65% area-scaled and 35% power-scaled around a $0.45/W @ 20% efficiency baseline.
