# BRIEF · why-the-planet-warms 一点点二氧化碳

- Built-By: Claude Code (claude-opus-5-5), essay batch 2026-11-11
- Verified-By: self-check (node model test, browser test, canvas sweep at 1280/390/320, screenshots at 1280/390/320 and reduced motion, every control driven to its ends with the live sentences read)
- Verified-By: Claude Code (claude-opus-5-5), independent review 2026-11-11: physics re-derived without the page's code (255 K, grey and N-layer surface temperatures, 5.35 ln, ΔT0, feedback sum and ECS, Roe & Baker quantiles, ocean box τ and T70), band model's log-linearity over 180–1120 ppm, sources re-opened (AR6 WG1 ch7 PDF: Table 7.4, §7.3.2.1, Table 7.10, §7.4.2.1 Planck, cloud likely range, §7.5.1.1 process ECS, SPM-level ECS/TCR text, 91 %, 0.79 W/m², solar cycle, albedo 0.29; Romps et al. 2022 PDF; NOAA GML co2_annmean_gl.txt; NASA Earth Fact Sheet; NOAA Ocean Service), English copy and English layout at 1280/390/320, tone of ch8
- category `earth` (地球与太空 / Earth & Space), subtopic `climate` (大气与气候 / Atmosphere & Climate), stage `senior`. Both already exist in `pages.config.js`; nothing new to register there except the page.
- Format: one long interactive essay in the style of `demos/scarcity-moves`. Not a step page: no `lesson-shell.js`, no provenance label (the integrator adds it once a commit exists).
- Files: `index.html` (markup + styles), `copy.zh.js` (all visible text, including canvas labels and aria-labels), `models.js` (pure models, UMD, `window.ClimateModels`), `app.js` (wiring, drawing, i18n, IntersectionObserver gating), `tests/models.cjs`, `tests/browser.cjs`, `REGISTRY.json`. `copy.en.js` is loaded if present (onerror ignored) and every key falls back to zh. Numbers are formatted per language with `toLocaleString`, a true minus sign, and no 万/亿/成.

## The one question

Only about four in every ten thousand air molecules are CO₂. How can that warm a whole planet?

The answer the essay builds: (1) a planet settles where absorbed sunlight equals emitted infrared, and that gives 255 K, not the observed 288 K (ch1). (2) Air that passes sunlight but absorbs infrared makes the ground warmer (ch2), and what sets the warming is the height and temperature of the layer that radiates to space (ch3). (3) CO₂'s band is "saturated" only at its centre; its wings keep darkening, so each doubling blocks about the same amount (ch4). (4) Feedbacks amplify the direct ~1.2 K to ~3 K (ch5), and because sensitivity is 1/(1 − f), a symmetric uncertainty in f becomes a long high tail (ch6). (5) The ocean delays the response by years to centuries (ch7). Ch8: three questions to ask of any claim.

## Chapters

Each: law · everyday case · model · limits. Tags in the prose: 模型 (model output, cyan), 评估 (assessed, gold), 观测 (observed, green).

1. **进来多少，出去多少** (`#ch1`). Pot on a stove. `C dT/dt = S(1−α)/4 − σT⁴`, 50 m mixed layer; sliders S 1100–1600, α 0–0.9; live sim. Te = 255.48 K, absorbed 241.6 W/m². Limits: zero-dimensional, uniform planet.
2. **一层只挡红外的毯子** (`#ch2`). One grey layer, absorptivity ε 0–1, time-stepped; Ts = Te(2/(2−ε))^¼, ε = 0.7615 gives 288 K, ε = 1 gives 303.8 K. Limits: real air is not grey, layer temperature is not one number.
3. **越高越冷，从高处散热** (`#ch3`). N black layers 0–8; Ts = Te(N+1)^¼, top layer always Te. Then the US Standard Atmosphere profile (6.49 K/km) for the real emission height. Limits: pure radiative, no convection; overstates surface warming for large N.
4. **“已经饱和了”** (`#ch4`). 15 µm band after Romps, Seeley & Edman 2022: Romps' sorted spectrum κ = 8.4e−15·e^{0.04ν̃} m²/mol on 467–867 cm⁻¹, folded symmetric about 667 cm⁻¹ (peak 8.4e−15·e^{0.04·867}, one e-fold per l = 12.5 cm⁻¹ each side); Schwarzschild integral over 260 log-p levels on the standard-atmosphere temperature profile. Slider 4–4096 ppm (23 stops), exp vs box band, log/linear axis. Outputs: 4.70 W/m² for 280→560, 2.84 W/m² for 280→425.62, centre τ ≈ 1200 today, trench widens 2·l·ln2 = 17.3 cm⁻¹ per doubling (8.7 each side); box band of equal centre saturates (0.005 W/m² per doubling at 280). Compared with Myhre 5.35 ln(C/C0) = 3.71 per doubling and AR6 ERF 3.93 ± 0.47. Limits: one gas, no overlap with water vapour, no stratospheric adjustment, so it overshoots AR6.
5. **反馈：一度变三度** (`#ch5`). Linear feedback with AR6 Table 7.10 central values (Planck 3.22, WV+LR 1.30, albedo 0.35, cloud 0.42 adjustable −0.10 to 0.94, other −0.01). ΔT0 = 3.93/3.22 = 1.22 K, f = 0.64, ECS = 3.39 K; round-by-round animation. Limits: linear, feedbacks treated as constant.
6. **为什么区间这么宽** (`#ch6`). Roe & Baker 2007: f ~ N(μ, σ), ECS = ΔT0/(1−f); exact quantiles plus a seeded 2000-draw histogram. AR6 net feedback gives μ 0.64, σ 0.123 → median 3.39, 5–95 % 2.17–7.74 K (AR6 process-only line: 3.4, 2.1–7.7). Half σ: 2.64–4.73. Upper bound above 20 K or f ≥ 1 is reported as the linear model breaking, not as a number.
7. **海洋拖住了脚步** (`#ch7`). One box: C dT/dt = F − λT, C = ρc·h·0.7, λ = 3.93/ECS; +1 %/yr ramp (doubles at year 69.7) or a step. Depth 10–2000 m, ECS 1.5–6. 100 m: τ 7.8 yr, T70 3.03 K, imbalance 0.42 W/m². 500 m: T70 1.82 K (near AR6 TCR 1.8) but τ 39 yr. Limits: one box cannot have both; AR6 uses two layers.
8. **听到一种说法时，先问三个问题** (`#ch8`). Forcing? Feedback? Lag? Plus what the models do not say. No policy.

## Changes from the brief

- `earth` and `climate` already existed; the page sits beside climate-energy, climate-feedback and carbon-cycle and links to them instead of repeating them.
- The N-layer chapter uses black layers (closed form) after the one-layer grey chapter. A grey N-layer model would add a second slider without a new idea.
- The "saturated" chapter uses a spectral band model rather than only the 5.35 ln formula, so the reader can see why it is logarithmic. The box band is the counterfactual where "saturated" would be true.
- The log test starts at 8 ppm: at 4 ppm the band centre is barely opaque and the per-doubling forcing drops (Romps et al. give ~4–4096 ppm as the rough range). This is a new test, not a loosened one.

## Sources (opened and checked)

| Figure | Value used | Source |
|---|---|---|
| Solar irradiance | 1361 W/m² | NASA Earth Fact Sheet, https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html (also lists Bond albedo 0.294, black-body T 254.0 K, mean surface 288 K, N₂ 78.08 %, O₂ 20.95 %) |
| Albedo | 0.29 | IPCC AR6 WG1 ch7 §7.3.4.4 / §7.2, https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_Chapter07.pdf |
| Solar-cycle swing | ~1 W/m² | AR6 ch7 §7.3.4.4 |
| Surface temperature | 288 K (15 ℃) | NASA Earth Fact Sheet; NASA Glenn standard atmosphere 15.04 ℃ |
| Lapse rate, tropopause | 6.49 K/km, 216.65 K | NASA Glenn, https://www.grc.nasa.gov/www/k-12/airplane/atmosmet.html |
| CO₂ today | 425.62 ppm (2025 global annual mean) | NOAA GML, https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_gl.txt |
| CO₂ 1750 / 2019 | 278.3 / 409.9 ppm | AR6 ch7 Table 7.5 |
| CO₂ ERF 2019 | 2.16 [1.90–2.41] W/m² | AR6 ch7 Table 7.5 |
| Total ERF 2019 | 2.72 [1.96–3.48] W/m² | AR6 SPM A.4.1, https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_SPM.pdf |
| 2×CO₂ ERF | 3.93 ± 0.47 W/m² (5–95 %) | AR6 ch7 Table 7.4 / §7.3.2.1 |
| Myhre formula | 3.71 W/m² per doubling | AR5 value as listed in AR6 Table 7.4 (Myhre et al. 1998 itself not opened) |
| Feedbacks | Planck −3.22 (very likely −3.4 to −3.0), WV+LR 1.30, albedo 0.35, cloud 0.42 (likely 0.12–0.72, very likely −0.10–0.94), other −0.01, net −1.16 [−1.81, −0.51] W/m²/K | AR6 ch7 Table 7.10 |
| ECS, process line | 3.4, 2.1–7.7 ℃ | AR6 ch7 §7.5.1.1 |
| ECS assessed | best 3, likely 2.5–4, very likely 2–5 ℃ | AR6 SPM A.4.4 |
| TCR | 1.8 [1.4–2.2] ℃ | AR6 ch7 §7.5.5 / SPM A.4.4 |
| Warming 2011–2020 | 1.09 [0.95–1.20] ℃ | AR6 SPM A.1.2 |
| Energy imbalance 2006–2018 | 0.79 [0.52–1.06] W/m² | AR6 SPM A.4.2 |
| Ocean share of heat | 91 % | AR6 SPM A.4.2 |
| Two-layer timescales | years and centuries | AR6 ch7 §7.5 / Box 7.1 |
| Ocean cover | more than 70 % | NOAA Ocean Service, https://oceanservice.noaa.gov/facts/oceanwater.html |
| Band model | κ0, l, log range ~4–4096 ppm | Romps, Seeley & Edman 2022, J. Climate 35(13), doi 10.1175/JCLI-D-21-0275.1, https://escholarship.org/content/qt127352f5/qt127352f5.pdf |
| Feedback-sensitivity skew | ECS = ΔT0/(1−f) | Roe & Baker 2007, Science 318:629, https://www.atmosp.physics.utoronto.ca/~dbj/PHY392/roe_and_baker2007_clim_sen.pdf |

## Checked / not checked

- Checked: every number in the prose is pinned in `tests/models.cjs` to a model output or to the `SOURCED`/`EARTH` tables in `models.js`; the test fails on any unpinned digit in non-sentence copy. Live sentences driven at control extremes in `tests/browser.cjs` and compared to `window.ClimateModels`.
- Not checked: Myhre et al. 1998 (not opened, only via AR6 Table 7.4); the English copy (there is none yet); no independent reviewer; the band model is a teaching model and its 4.70 W/m² overshoots AR6's 3.93 (the prose says so).

### Review 2026-11-11 (Claude Code, claude-opus-5-5)

Verified, each against a source opened in this review or an independent script (`/tmp/agent-tasks/essays/review-why-the-planet-warms/indep.cjs`):
- Te = 255.48 K needs albedo 0.29 (0.294 gives 255.1, 0.30 gives 254.6). One layer ε = 0.76 → 287.9 K, ε = 1 → 303.8 K; N layers 304/336/382/443 K. 5.35 ln 2 = 3.708; 1750→2025 = 2.273 W/m².
- AR6 ch7: 2×CO₂ ERF "3.93 ± 0.47 W m–2 (high confidence)" (§7.3.2.1; Table 7.4 gives ±12 % as 5–95 %; note §7.5.1.1 calls the same ± one standard deviation, an inconsistency inside AR6; the page uses 5–95 % as Table 7.4 does). Table 7.10: Planck −3.22 (very likely −3.4 to −3.0, likely −3.3 to −3.1, high confidence), WV+LR 1.30, albedo 0.35, clouds 0.42 (likely 0.12–0.72, very likely −0.10–0.94), biogeophysical/non-CO₂ −0.01, net −1.16 (−1.81 to −0.51): the five terms sum to −1.16. ECS = 3.93/1.16 = 3.39; ΔT0 = 3.93/3.22 = 1.22. Process-based ECS median 3.4, very likely 2.1–7.7 (§7.5.1.1); assessed ECS 3, likely 2.5–4, very likely 2–5; TCR 1.8, likely 1.4–2.2; "virtually certain that the net climate feedback is negative" (§7.4.2.7); two-layer timescales "several years and several centuries".
- Romps, Seeley & Edman 2022: κ0 = 8.4×10⁻¹⁵ m² mol⁻¹ and b = 0.04 cm over ν̃ = 467–867 cm⁻¹ (absolute wavenumber, so the code's peak κ ≈ 9.8 m² mol⁻¹ is right; the old comment saying κ0 sits at the band edges was wrong and is fixed); their simple model gives F2× "around 4–5 W m⁻²" for CO₂ alone with no clouds or other gases, so the page's 4.70 is consistent; log range 4–4096 ppmv. They also show the "lapse-rate theory" does not explain the *logarithm*; the page attributes the logarithm to the band wings (ch4) and uses the emission-height picture only for why added CO₂ warms (ch3), which is consistent.
- The band model is logarithmic to within 0.014 W/m² over 180–1120 ppm (R² 0.999997; per doubling 4.72 from 180, 4.70 from 280, 4.68 from 560). Now pinned in the node test. The centre "optical depth ≈ 1200" includes the diffusivity factor 5/3 (vertical ≈ 720); kept, since it is labelled a model value.
- NOAA GML global annual mean: 2025 = 425.62 ppm (latest complete year on 2026-11-11). NASA Earth Fact Sheet: 1361.0 W/m², 288 K, N₂ 78.08 %, O₂ 20.95 %. NOAA Ocean Service: "more than 70 percent".
- Ocean box: C(100 m) = 9.07 W·yr m⁻² K⁻¹, τ = 7.85 yr, T70 = 3.03 K; 500 m: τ = 39.2 yr, T70 = 1.82 K.

Changed in review: ch4.p5 now says 4.7 is the band model's output, why it is higher, that it is an instantaneous forcing (not ERF), and Romps' 4–5; "high confidence" added to 3.93; "annual mean" for NOAA's 2025 value. ch5.p3 discloses the always-on −0.01 term and puts AR6's assessed 3 ℃ (2.5–4) beside the 3.39 arithmetic. ch5.p4: likely/very likely described as probabilities, not "confidence" (a different IPCC term). ch6.p3 says 2.17–7.74 follows from the assumed spread and is not an assessment; ch6.p4 no longer reads as contradicting its own halving demo. ch7.p4 says the 500 m match was chosen, not a validation. ch8.q1–q3 now catch overstatements in both directions. ch4 "real shape" renamed "exponential shape". Code: ch3 start sentence (was "0 W/m² more … cooling" while warming), ch2/ch3 settled flux shows the steady-state 242 instead of 241, en singular "1 layer", ch5 r95 sentence, y-axis label kept inside narrow canvases, slider labels wrap at ≤420 px.

Not checked in review: Myhre et al. 1998 itself; Roe & Baker 2007 beyond its abstract-level claim and the formula; AR6 SPM PDF itself (2.72 [1.96–3.48], 91 % and 0.79 [0.52–1.06] were matched in ch7; the warming 1.09 [0.95–1.20] ℃ for 2011–2020 is from SPM A.1.2 and was not re-opened); screen-reader output.
