# BRIEF · why-chips-are-hard 芯片为什么越来越难做

- Built-By: Claude Code (claude-opus-5-5), deep-track essay batch 2026-11-11
- Verified-By: self-check (node model test, browser smoke test in zh at 1280/390/320, canvas text sweep, screenshots at 1280/390/320 and reduced motion, read through top to bottom in the browser); independent review pending
- category `tech`, subtopic `semiconductors` (半导体 / Semiconductors, new), stage `university`
- Format: one long interactive essay (deep track: first principles to the state of the art). No `lesson-shell.js`, no provenance label (the integrator adds it once a commit exists).
- Files: `index.html` (markup and styles), `copy.zh.js` (all visible text; the frontier sentences are the `fr.*` keys), `models.js` (pure models, UMD, `window.ChipModels`; the frontier data block is `FRONTIER`), `app.js` (wiring, drawing, i18n, IntersectionObserver gating), `tests/models.cjs`, `tests/browser.cjs`. `copy.en.js` is loaded if present; every key falls back to zh.

## The one question

Why is it so hard to make a faster chip? The answer the essay builds: everything that used to be free now has to be paid for. Voltage is pinned by heat (kT/q, ch2–4), line width by light (ch5–6), density by pitches rather than names (ch7) and by how well the gate holds the channel (ch8), wires by the electron mean free path (ch9), and area by random defects (ch10). Ch11 dates where industry stands; ch12 turns the four figures of merit into questions to ask of any announcement.

Figures of merit: transistor density (MTr/mm²), performance per watt, cost per good die, lithographic resolution (k₁λ/NA, plus stochastics).

## Chapters

Each: model · standard result and source · reader controls · what to discover · limits.

1. **硅什么时候导电** (`#ch1`). nᵢ = √(NcNv)·e^(−Eg/2kT), Nc, Nv ∝ T^1.5 (Sze & Ng, *Physics of Semiconductor Devices*, 3rd ed., ch. 1), Eg(T) Varshni form with Thurmond parameters; full ionisation n = N/2 + √(N²/4 + nᵢ²); E_F − E_i = kT·ln(n/nᵢ); Caughey–Thomas mobility at 300 K; intrinsic temperature by bisection. Controls T, N, n/p. Discover: nᵢ(300 K) = 9.8×10⁹ (literature 9.65×10⁹–1.0×10¹⁰); 1e16 P lowers ρ ~6×10⁵ times; doped silicon goes intrinsic at 649 K.
2. **pn 结** (`#ch2`). Vbi = kT ln(NaNd/nᵢ²); abrupt-junction depletion width; ideal Shockley diode with Is = qA nᵢ²(Dn/LnNa + Dp/LpNd) (Sze & Ng ch. 2). Discover 59.5 mV per decade at 300 K, 69.4 at 350 K.
3. **晶体管** (`#ch3`). EKV interpolation Id = 2nβφt²[ln(1 + e^((Vg−Vt)/2nφt))]² (Enz, Krummenacher, Vittoz 1995); S = n·φt·ln10. β is an illustrative scale (stated on the page). Discover: lowering V_DD costs speed, lowering V_t costs leakage; for 1 nA/µm V_t ≥ 0.30 V (n = 1.2), ≥ 0.25 V even at n = 1.
4. **缩小曾经是免费的** (`#ch4`). Dennard et al. 1974 constant-field table, κ = √2 per generation; dynamic C·V²·f·density plus subthreshold leakage from ch3 with I_spec ∝ Cox. Modes: Dennard, fixed V, "stop at 1 V / 0.3 V" (schematic). Real clock data: K. Rupp, *50 Years of Microprocessor Trend Data* (CC BY 4.0). Generation-0 values (1 µm, 5 V, 0.75 V, 25 MHz, n 1.4, activity 0.1) are tuned round numbers, stated as such on the page.
5. **用光印出比光还细的线** (`#ch5`). Scalar thin-mask Abbe imaging of a 1:1 line/space grating, partially coherent 1D source (conventional σ ≤ 0.6, dipole 0.7–0.95); printable when contrast ≥ 0.3 (my threshold, stated). Rayleigh k₁ = hp·NA/λ, floor λ/(2NA), DOF ∝ λ/NA². Discover ArFi dipole hp 38.0 nm (k₁ 0.266) matches ASML NXT:2150i "≤ 38 nm"; 24 nm pitch needs 4 ArFi exposures; EUV 21.7 nm pitch, high-NA hp 6.5 nm, DOF 36%.
6. **EUV** (`#ch6`). E = hc/λ; transmission R^m; light-limited seconds per wafer = dose·706.9 cm²/(P·R^m); photons per pixel, shot noise 1/√N (Poisson). 11 reflections is my illustrative count (literature 8–12 mirrors plus mask). Live 10×10 pixel Poisson draw.
7. **“3 纳米”里没有 3 纳米** (`#ch7`). NAND2 area = 3·CPP × tracks·MMP, density = 4·tiers/area. Checked against Intel 10 nm (CPP 54, 272 nm cell, published 90.78 MTr/mm² NAND2): model 90.8. IRDS 2022 G48M24/G45M20/G42M16/G40M16T2; track counts 6/6/5/5 are my assumption (stated).
8. **晶体管换形状** (`#ch8`). Natural length λ = √(ε_si t_si t_ox/(N ε_ox)) with N = 1/3/4 (Colinge 2004, multi-gate natural length); short-channel factor θ = e^(−L/2λ) + 2e^(−L/λ) (Liu et al., IEEE TED 1993, the BSIM form); DIBL = θ, S = S_long/(1 − 2θ). Discover: planar 20 nm S 135, DIBL 213; FinFET 16 nm S 64; GAA 12 nm S 65.
9. **导线变成了瓶颈** (`#ch9`). Mayadas–Shatzkes grain-boundary plus Fuchs–Sondheimer surface term in the Steinhögl et al. (2005) combined approximation, R = 0.4, p = 0; Cu ρ0 1.68 µΩ·cm, mfp 39.9 nm; Ru 7.1 µΩ·cm, mfp 6.6 nm, no barrier; c = 0.2 fF/µm; Elmore distributed delay 0.38rcL². Barrier is a reader control because the crossover depends mostly on it (2 nm → 40 nm pitch, 0 nm → 11 nm); literature puts the crossover at 10–17 nm line width.
10. **良率和成本** (`#ch10`). Dies per wafer πd²/4A − πd/√(2A); Poisson e^(−AD₀) and Murphy ((1 − e^(−AD₀))/AD₀)²; CSET wafer prices (Khan & Mann 2020, Table 9); chiplets with 10% area overhead and 99% per bond (my assumptions, stated). Seeded wafer-map Monte Carlo agrees with Poisson (0.813 vs 0.819 at 100 mm², D₀ 0.2).
11. **前沿在哪里** (`#ch11`). Dated list built from `FRONTIER` + `fr.*`, filterable by 已量产 / 已演示 / 公司声称. Open problems paragraph and "what would have to be true".
12. **怎么读一则芯片新闻** (`#ch12`). The four figures of merit, four questions, summary.

## Sources (opened 2026-11-11)

| Fact | Source |
|---|---|
| N2 volume production 4Q25 | TSMC 2nm page https://www.tsmc.com/english/dedicatedFoundry/technology/logic/l_2nm |
| >20 N2 tape-outs; A16 shown in 2027; CoWoS 5.5 reticles | SemiEngineering 2026-04-27 https://semiengineering.com/tsmc-tech-symposium-2026-by-the-numbers/ |
| A13/A12 in 2029, 14-reticle CoWoS in 2028 | TSMC press release 2026-04-23 https://pr.tsmc.com/english/news/3302 |
| A14 in 2028, +15% speed / −30% power, >20% density | TSMC press release 2025-04-23 https://pr.tsmc.com/english/news/3228 |
| Intel 18A, RibbonFET + PowerVia, +15% perf/W, +30% density vs Intel 3 | Intel newsroom 2025-10-09 https://www.intel.com/content/www/us/en/newsroom/news/client-computing/intel-unveils-panther-lake-architecture-first-ai-pc-platform-built-on-18a.html |
| Samsung 3 nm GAA production 2022-06-30 | https://news.samsung.com/global/samsung-begins-chip-production-using-3nm-process-technology-with-gaa-architecture |
| Exynos 2600 on 2 nm GAA | https://semiconductor.samsung.com/processor/mobile-processor/exynos-2600/ |
| EXE:5200B 0.55 NA, 8 nm, ≥175 wph at 50 mJ | https://www.asml.com/en/products/euv-lithography-systems/twinscan-exe-5200b |
| NXE:3800E ≥220 wph at 30 mJ; NXE:3400C ≥170 wph at 20 mJ; NXT:2150i ≤38 nm, NA 1.35 | ASML product pages (asml.com/en/products) |
| 1,000 W EUV source demonstrated April 2025; first EXE:5200B shipped; revenue for four 0.55 NA systems | ASML 2025 annual report (SEC) https://www.sec.gov/Archives/edgar/data/937966/000162828026011377/asml-2025xannualxreportx.htm |
| Tin droplets 25 µm, 50,000/s; ~200,000 °C plasma; multilayer mirrors | ASML light-source page; ZEISS SMT EUV pages |
| High-NA delivered from end 2023, first production use projected 2027; half field; G48M24 via 46 nm pitch + double patterning; stochastics harder than resolution | IRDS 2025 Lithography https://irds.ieee.org/images/files/pdf/2025/2025IRDS_LITHO.pdf |
| G48M24 / G45M20 / G42M16 / G40M16T2 | IRDS 2022 Lithography tables |
| Intel 10 nm 100.8 MTr/mm² (weighted), 90.78 NAND2, 36 nm MMP, CPP 54, 272 nm cell | IEEE Spectrum 2017-03-30; WikiChip / TechInsights |
| Wafer prices n28 2,891, n16 3,984, n7 9,346, n5 16,988 USD; 600 mm² chip | CSET, Khan & Mann, *AI Chips: What They Are and Why They Matter* (2020) |
| Blackwell 208 B transistors, two reticle-limit dies, 10 TB/s, 4NP | NVIDIA newsroom 2024-03-18 https://nvidianews.nvidia.com/news/nvidia-blackwell-platform-arrives-to-power-a-new-era-of-computing |
| TSMC CFET inverter at 48 nm gate pitch (IEDM 2024) | eeNews Europe 2024-10-11 https://www.eenewseurope.com/en/iedm-cfets-make-progress-at-5nm-and-7angstrom/ ; IEEE Spectrum 2024-12-12 |
| imec 16 nm pitch Ru lines, 656 Ω/µm, ≥90% yield at 18–22 nm | imec 2025-06-03 https://www.imec-int.com/en/press/imec-demonstrates-16nm-pitch-ru-lines-record-low-resistance-obtained-using-semi-damascene |
| Cu mfp 39.9 nm, ρ0 1.68; Ru 7.1 µΩ·cm; barrier 3–4 nm | Moon et al., *Advanced Science* 2023 |
| Kirin 9030 on SMIC N+3 | TechInsights, December 2025 https://www.techinsights.com/blog/smic-n3-confirmed-kirin-9030-analysis-reveals-how-close-smic-5nm |
| Rapidus 2 nm prototyping, 2027 target | The Register 2025-07-18 https://www.theregister.com/on-prem/2025/07/18/japans-rapidus-says-2nm-chip-tech-on-track-for-2027/1407362 |
| Clock-frequency data | https://github.com/karlrupp/microprocessor-trend-data (CC BY 4.0) |

## Facts that will go stale

All live in `models.js` `FRONTIER` (id, kind, asOf, src, url) with the sentence in `copy.zh.js` `fr.<id>`: n2, i18a, sf3, sf2, hna, hnaprod, src1kw, bspdn, a16, a14, a13, cfet, cowos, blackwell, ru, smic, rapidus. Also in prose: ch6.p4 (1,000 W source), ch5.p4 (IRDS 2025 note on 24 nm), ch9.p4 (imec Ru), ch10 wafer prices (2020 estimates, labelled), ch11.title "截至 2026 年 11 月".

## Checked / not checked

- Checked against a primary source: every row of the table above; Intel 10 nm NAND2 density reproduced to 0.02 MTr/mm²; ArFi limit reproduces ASML's 38 nm.
- Not verified from a primary source: Sze's Nc/Nv values and Caughey–Thomas parameters (from the textbook as I remember it); Steinhögl's R/p/C; the 0.2 fF/µm rule; water n ≈ 1.44 at 193 nm; Ru mfp 6.6 nm (Gall 2016, seen only in excerpts); Mo/Si 70% / 75% and "8–12 mirrors" (search excerpts); Intel 22 nm tri-gate 2011 (secondary reproductions of the press release). Samsung yields deliberately omitted.

## Tuned or assumed parameters (all stated on the page)

β in ch3; generation-0 process in ch4; contrast threshold 0.3 and source shapes in ch5; 11 reflections in ch6; IRDS track counts and Intel 14 nm cell width in ch7; n_long = 1.3 planar in ch8; R = 0.4, p = 0, C = 1.2, AR = 2 and 0.2 fF/µm in ch9; chiplet overhead 10% and bond yield 99% in ch10.

## Prerequisites the site lacks

Band theory and crystals; Fermi–Dirac statistics; semiconductor and pn-junction physics; Poisson's equation / electrostatics in matter; Fourier optics (diffraction orders, partial coherence); RC transients and distributed lines.

## Tests

- `node tech/semiconductors/why-chips-are-hard/tests/models.cjs` pins every prose number to the models and checks the prose says it.
- `ESSAY_BASE_URL=http://127.0.0.1:18981 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node tech/semiconductors/why-chips-are-hard/tests/browser.cjs` (adds the English checks automatically once `copy.en.js` exists).
- `CANVAS_BASE_URL=http://127.0.0.1:18981 node tests/canvas-text-overlap.cjs --sweep tech/semiconductors/why-chips-are-hard/`.
