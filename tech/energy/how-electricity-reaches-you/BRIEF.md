# BRIEF · how-electricity-reaches-you 按下开关的那一刻，电是从哪儿来的

- Built-By: Claude Code (claude-opus-5-5), essay batch 3, 2026-11-11
- Verified-By: self-check (node model test, browser test in zh at 1280/390/320, canvas sweep, screenshots at 1280/390/320 with reduced motion, top-to-bottom re-read of copy.zh.js). No independent review yet.
- category `tech`, subtopic `energy` (new: 能源与电网 / Energy & the Grid), stage `senior`
- Format: one long interactive essay (11 sections, 10 models). No provenance label yet; the integrator adds it once a commit exists.
- Files: `index.html` (markup and styles; Chinese static `<title>` and meta description), `copy.zh.js` (all visible text), `models.js` (pure models, UMD, `window.GridModels`), `app.js` (wiring, drawing, i18n, IntersectionObserver gating), `tests/models.cjs`, `tests/browser.cjs`, `REGISTRY.json`. `copy.en.js` does not exist yet; the page loads it if present and every key falls back to zh.

## The one question

When you flip a switch, nobody knew you would and nothing stored that energy for you. Where does that extra power come from in the first second, the first minute and the first hour, and how does it travel to your socket?

## Chapters, models and the standard result each implements

| # | Chapter | Model | Standard result |
|---|---------|-------|-----------------|
| 1 | 电线里没有仓库 | Single-bus frequency after a generation loss, no control | Swing equation 2H·dω/dt = Pm − Pe − D·ω (Kundur ch. 11) |
| 2 | 调速器 | Same bus + droop governor, reheat turbine, reserve limit, optional AGC | Droop R, reheat-turbine block (Tg 0.2 s, Trh 7 s, Fhp 0.3; Kundur typical values), frequency-biased integral AGC |
| 3 | 当一天调度员 | Quasi-steady game: generation with a ramp limit against the CAISO load of 2024-07-16 (or the net load of 2024-04-14) | Steady-state frequency deviation Δf = 50·ΔP/(S(D + 1/R)) inside governor headroom; damping only beyond it |
| 4 | 高压输电 | Three-phase line, resistive only | Loss share = P·R/V², I = P/(√3·V) |
| 5 | 变压器 | Ideal transformer, AC or DC source | V₂/V₁ = N₂/N₁, I₁/I₂ = N₂/N₁; flux stops changing under DC so V₂ = 0 |
| 6 | 三相电 | Three sinusoids with adjustable spacing | Σsin² = 3/2 and Σsin = 0 at 120°; line/phase ratio 2·sin(φ/2) = √3 |
| 7 | 优先顺序 | Toy market: six plant blocks, nuclear must-run | Merit order with a uniform clearing price set by the marginal unit |
| 8 | 鸭子曲线 | Net load = demand − k·solar − wind (CAISO 2024-04-14), floor 3 GW | Net load and duck curve; curtailment below a must-run floor |
| 9 | 储能 | Peak shaving and valley filling with power, energy and round-trip efficiency η | Charge from the trough, discharge to a flat cap, both found by bisection; Eout = η·Ein |
| 10 | 大停电 | Six-bus network: DC power flow, islands, one swing equation per island, UFLS stages, line trips after 4 s overload, generator trip at 47.5 Hz | DC power-flow approximation + single-bus frequency per island; N−1 security |
| 11 | 下次再按开关 | (summary, no model) | |

## Numbers in the prose (all pinned in `tests/models.cjs`)

- ch1 (1000 MW lost, 30 GW, H 4): RoCoF 0.21 Hz/s, 48.8 Hz reached at 10.2 s (5.1 s at H 2), settles at 48.33, stored energy 120,000 MJ, a 2 kW kettle about 4 × 10⁻⁷ Hz/s. RK4 matches the closed form at 10 s to 6 decimals.
- ch2: nadir 49.75 Hz at 3.9 s, settles at 49.92, governors add 952 MW; droop 10% → 49.85; reserve 250 MW → 48.75; AGC back to 49.99 at about 85 s.
- ch3: July demand 24.8–36.9 GW, steepest 1.9 GW/h; auto at 2 GW/h → 0 min out of band, at 1.5 → 66 min; net load steepest 6.9 GW/h, auto at 4 → 150 min, at 6 → 0 min.
- ch4 (500 MW, 100 km): 110 kV ≈ 33%, 220 kV ≈ 8.3%, 500 kV ≈ 1.6%; at 1000 km 500 kV ≈ 16%, 1000 kV ≈ 4%.
- ch5: 26:1 → about 385 V, 10 A primary, 260 A secondary at 100 kW.
- ch6: ripple 0% at 120°, 200% single-phase; √3 ≈ 1.732; 220 × 1.732 ≈ 381.
- ch7 (gas $3): night 35 (coal), midday 24 (CCGT), 19–22 h 36.5 (peaker); gas $6: evening 68, daytime 35; switch-overs at about $4.6 and $2.9.
- ch8 (×1, wind removed): minimum 0.63 GW at 14:00, peak 20.0 at 20:00, 3-hour ramp 16.1 from 16:00; ×0 ramp 4.8; ×2 minimum −12.4, ramp 27.4; curtailment 9.2 GWh.
- ch9 (5 GW / 20 GWh / 80%): peak 20.0 → 15.8, ramp 16.1 → 12.6, in 25, lost 5; at 60%, in 33.3, lost 13.3, same peak.
- ch10: load 1800 MW is N−1 secure; gen A trip → minimum 48.80, 90 MW shed; ×1.1 + line B–X → B–Y and X–Y trip together at 4 s, 495 MW shed, then all 1980 MW dark; ×1.2 + gen A → 216 MW shed with UFLS, all dark without.

## Sources (checked)

- P. Denholm et al., *Inertia and the Power Grid: A Guide Without the Spin*, NREL/TP-6A20-73856 (2020), https://www.nrel.gov/docs/fy20osti/73856.pdf: H 2–7 s; load damping 1–2% per 1% frequency; US UFLS from 59.5 Hz, ERCOT 59.3 Hz. PDF read.
- NERC, 2019 Frequency Response Survey FAQ, https://www.nerc.com/comm/OC/RS_GOP_Survey_DL/2019_Frequency_Response_Survey_FAQ.pdf, and the NERC Primary Frequency Control reliability guideline: 5% droop. The FAQ PDF was read; the guideline only via search summary (marked as such on the page).
- Ofgem, *9 August 2019 power outage report* (Jan 2020), https://www.ofgem.gov.uk/system/files/docs/2020/01/9_august_2019_power_outage_report.pdf: >1,130 MW lost within about 1 s; below 48.8 Hz; LFDD stage 1, about 5% of demand, 892 MW net; 1.15 million customers; 50 Hz within 5 min; restored within 45 min. PDF read.
- EIA FAQ, T&D losses about 5% (2018–2022), https://www.eia.gov/tools/faqs/faq.php?id=105&t=3
- EIA Today in Energy, round-trip efficiency 82% batteries and 79% pumped hydro (2019 data), https://www.eia.gov/todayinenergy/detail.php?id=46756
- EIA Today in Energy (21 June 2023), California batteries 0.2 GW (2018) → 4.9 GW (April 2023), https://www.eia.gov/todayinenergy/detail.php?id=56880
- US DOE, *The War of the Currents: AC vs. DC Power*, https://www.energy.gov/articles/war-currents-ac-vs-dc-power: DC hard to convert to higher or lower voltage; 1893 Chicago World's Fair; Niagara lighting Buffalo on 16 Nov 1896; HVDC used today.
- Southwire overhead conductor spec sheets (795 kcmil class, e.g. Drake), https://cabletechsupport.southwire.com/tile/23/spec/80116/?country=US (also 80113 and 80110): DC resistance at 20 °C about 0.066–0.068 Ω/km, AC at 75 °C about 0.082 Ω/km. Model uses 0.08 Ω/km.
- Wikipedia, Electric power transmission, https://en.wikipedia.org/wiki/Electric_power_transmission: transmission is usually 110 kV and above; long distance 115–1200 kV.
- CAISO Today's Outlook history, https://www.caiso.com/outlook/history/ (demand, net demand and fuel-source CSVs for 2024-07-16 and 2024-04-14): 5-minute values averaged per hour, embedded in `models.js`.
- GB/T 15945-2008 (frequency deviation ±0.2 Hz, ±0.5 Hz for small systems) and GB/T 156-2017 (220/380 V): only via standards-site summaries, marked as such on the page.
- Model background: P. Kundur, *Power System Stability and Control* (1994), chapters 9 and 11; Bergen & Vittal, *Power Systems Analysis*.

## Tuned parameters (labelled on the page)

- ch1–2: system size 30 GW and D = 1 (D is within the NREL 1–2 range). The AGC gain Ki = 0.02 is mine; the page says real AGC usually takes minutes.
- ch3: system size 35 GW, reserve 1 GW, ±0.2 Hz band and the ramp-rate slider. The day compresses to 96 s.
- ch7: all plant capacities and costs, heat rates 7 and 10.5 MMBtu/MWh, and nuclear as must-run.
- ch8: output floor of 3 GW, the same as the toy nuclear block.
- ch9: the slider ends of 60% and 95% exist only to show sensitivity, not as a sourced range. The schedule charges 8–16 h and assumes perfect foresight.
- ch10:
  - every bus and line parameter;
  - line limits set so the grid is N−1 secure at load ×1.05;
  - lines trip after 4 s over their limit (real protection takes tens of seconds to minutes);
  - UFLS stages below the first one (every 0.2 Hz, 5% each);
  - generator trip at 47.5 Hz;
  - governor lag Tg 6 s.

## Checked / not checked

- **Checked:**
  - `node tests/models.cjs`: 548/548. It derives every number in the prose from `models.js`, makes sure each one appears in `copy.zh.js`, and checks that every sentence branch is reachable at the control extremes.
  - `tests/browser.cjs` in zh at 1280/390/320, covering:
    - layout: no overflow, no clipped text, 48 px targets, no raw keys;
    - the toggle with `copy.en.js` absent;
    - keyboard and focus;
    - models driven at full motion and with reduced motion;
    - every slider, radio and checkbox at both ends, with every live sentence free of `{`, NaN and undefined.
  - Canvas sweep: 1984 states, all pass.
  - Screenshots at all three widths.
- **Fixed after looking:**
  - ch10: a cascade the reader had started froze on "第 1 秒" when the canvases scrolled off-screen, because the gating paused it. A started run now keeps stepping and only drawing waits for the canvas to be on screen.
  - ch7: the label on the clipped oil bar collided with the "用电" label at 320 px.
  - ch1: unsourced rotor tonnage removed.
- **Not checked:**
  - English: there is no `copy.en.js` yet.
  - The NERC guideline and the two GB/T standards were seen only through summaries.
  - Whether the CAISO demand series includes battery charging.
  - No real-grid validation of any toy parameter.
