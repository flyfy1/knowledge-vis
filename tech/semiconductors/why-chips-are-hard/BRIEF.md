# BRIEF · why-chips-are-hard 芯片为什么越来越难做

- Built-By: Claude Code (claude-opus-5-5), deep-track essay batch 2026-11-11
- Verified-By: self-check (node model test, browser smoke test in zh at 1280/390/320, canvas text sweep, screenshots at 1280/390/320 and reduced motion, read through top to bottom in the browser); independent review pending
- Finishing pass 2026-11-18, Claude Code (claude-fable-5-2), self-check only: the eight unverified parameters checked against sources opened that day (table below), models re-derived by an independent script, live sentences driven through their branches, eleven static diagrams added (STANDARD §4a), tests extended. Chinese only; `copy.en.js` still to be written; independent review still pending.
- Independent review 2026-11-18, Claude Code (claude-fable-5-2), **incomplete, stopped on request before any fix was applied**: read in zh and en at 1280 as rendered, `models.js` and `app.js` read, most model numbers re-derived by hand, about twenty facts checked against opened sources, alias overlaps listed. Not done: 390/320 layout, English browser tests, canvas sweep, keyboard and reduced-motion checks, and all thirteen fixes it lists. Findings, sources and the fix list: `specs/reviews/why-chips-are-hard-review-20261118.md`. At that point: not ready to register until those fixes are made and the browser tests are run in English (done 2026-11-19, next line).
- Independent review completed 2026-11-19, Claude Code (claude-fable-5-2), completion pass by a second reviewer who did not write the page: the first reviewer's thirteen fixes applied in both languages (with one changed: the "first" backside-power claim was removed rather than attributed), English layout fixes at 390/320, `tests/browser.cjs` extended (English live sentences and dates, every control by keyboard with a focus ring, reduced motion), `tests/models.cjs` extended (English prose pins, key and placeholder parity). Scope: every diagram and model looked at in screenshots at 1280/390/320 in zh and en; model, browser and canvas-sweep tests run after the last edit. Not re-verified: the facts and re-derivations the first reviewer recorded. Details: "Completion pass" in `specs/reviews/why-chips-are-hard-review-20261118.md`.
- category `tech`, subtopic `semiconductors` (半导体 / Semiconductors, new), stage `university`
- Format: one long interactive essay (deep track: first principles to the state of the art). No `lesson-shell.js`, no provenance label (the integrator adds it once a commit exists).
- Files: `index.html` (markup and styles), `copy.zh.js` (all visible text; the frontier sentences are the `fr.*` keys), `models.js` (pure models, UMD, `window.ChipModels`; the frontier data block is `FRONTIER`), `app.js` (wiring, drawing, i18n, IntersectionObserver gating, and the static diagrams: `DG.<name>` specs drawn as inline SVG into `<figure class="dia" data-dg="<name>">`, labels from the `dg.*` keys), `tests/models.cjs`, `tests/browser.cjs`. `copy.en.js` is loaded if present; every key falls back to zh.

## The one question

Why is it so hard to make a faster chip? The answer the essay builds: everything that used to be free now has to be paid for. Voltage is pinned by heat (kT/q, ch2–4), line width by light (ch5–6), density by pitches rather than names (ch7) and by how well the gate holds the channel (ch8), wires by the electron mean free path (ch9), and area by random defects (ch10). Ch11 dates where industry stands; ch12 turns the four figures of merit into questions to ask of any announcement.

Figures of merit: transistor density (MTr/mm²), performance per watt, cost per good die, lithographic resolution (k₁λ/NA, plus stochastics).

## Chapters

Each: model · standard result and source · reader controls · what to discover · limits.

1. **硅什么时候导电** (`#ch1`). nᵢ = √(NcNv)·e^(−Eg/2kT), Nc, Nv ∝ T^1.5 (Sze & Ng, *Physics of Semiconductor Devices*, 3rd ed., ch. 1), Eg(T) Varshni form with Thurmond parameters; full ionisation n = N/2 + √(N²/4 + nᵢ²); E_F − E_i = kT·ln(n/nᵢ); Caughey–Thomas mobility at 300 K; intrinsic temperature by bisection. Nc, Nv = 2.86e19, 2.66e19 (Sze & Lee, *Semiconductor Devices: Physics and Technology*, 3rd ed.; changed from 2.8 / 2.65 on 2026-11-19, see "Checked"). Controls T, N, n/p. Discover: nᵢ(300 K) = 9.9×10⁹ (literature 9.65×10⁹–1.0×10¹⁰; the same book tabulates 9.65×10⁹); 1e16 P lowers ρ ~6×10⁵ times; doped silicon goes intrinsic at 649 K.
2. **pn 结** (`#ch2`). Vbi = kT ln(NaNd/nᵢ²); abrupt-junction depletion width; ideal Shockley diode with Is = qA nᵢ²(Dn/LnNa + Dp/LpNd) (Sze & Ng ch. 2). Discover 59.5 mV per decade at 300 K, 69.4 at 350 K.
3. **晶体管** (`#ch3`). EKV interpolation Id = 2nβφt²[ln(1 + e^((Vg−Vt)/2nφt))]² (Enz, Krummenacher, Vittoz 1995); S = n·φt·ln10. β is an illustrative scale (stated on the page). Discover: lowering V_DD costs speed (0.75 → 0.45 V: I_on to under an eighth, gate delay C·V/I about 5×), lowering V_t costs leakage; for 1 nA/µm V_t ≥ 0.30 V (n = 1.2), ≥ 0.25 V even at n = 1.
4. **缩小曾经是免费的** (`#ch4`). Dennard et al. 1974 constant-field table, κ = √2 per generation; dynamic C·V²·f·density plus subthreshold leakage from ch3 with I_spec ∝ Cox. Modes: Dennard, fixed V, "stop at 1 V / 0.3 V" (schematic). The live sentence is chosen by `dennard.sayKey` (eight cases, all evaluated in the node test). Real clock data: K. Rupp, *50 Years of Microprocessor Trend Data* (CC BY 4.0). Generation-0 values (1 µm, 5 V, 0.75 V, 25 MHz, n 1.4, activity 0.1) are tuned round numbers, stated as such on the page.
5. **用光印出比光还细的线** (`#ch5`). Scalar thin-mask Abbe imaging of a 1:1 line/space grating, partially coherent 1D source (conventional σ ≤ 0.6, dipole 0.7–0.95, both in `litho.SIGMA` and stated on the page as the author's choice; 200 points per pole so the limit no longer moves with the sampling); printable when contrast ≥ 0.3 (my threshold, stated). With several exposures each one keeps a line one target half-pitch wide. Rayleigh k₁ = hp·NA/λ, floor λ/(2NA), DOF ∝ λ/NA². Discover ArFi dipole hp 37.9 nm (k₁ 0.265), consistent with ASML NXT:2150i "≤ 38 nm" (the 2026-11-11 draft said 38.0 / 0.266: that was the 20-point source sampling; the agreement is not an independent check because the threshold is mine); 24 nm pitch needs 4 ArFi exposures; EUV 21.7 nm pitch, high-NA hp 6.5 nm, DOF 36%.
6. **EUV** (`#ch6`). E = hc/λ; transmission R^m; light-limited seconds per wafer = dose·706.9 cm²/(P·R^m); photons per pixel, shot noise 1/√N (Poisson). 11 reflections is my illustrative count: collector 1, illuminator 3, mask 1, projection optics 6 (`euv.PATH`; sources give six projection mirrors and at least two illuminator mirrors). Live 10×10 pixel Poisson draw.
7. **“3 纳米”里没有 3 纳米** (`#ch7`). NAND2 area = 3·CPP × tracks·MMP, density = 4·tiers/area. Checked against Intel 10 nm (CPP 54, 272 nm cell, published 90.78 MTr/mm² NAND2): model 90.8. IRDS 2022 G48M24/G45M20/G42M16/G40M16T2; track counts 6/6/5/5 are my assumption (stated).
8. **晶体管换形状** (`#ch8`). Natural length λ = √(ε_si t_si t_ox/(N ε_ox)) with N = 1/3/4 (Colinge 2004, multi-gate natural length); short-channel factor θ = e^(−L/2λ) + 2e^(−L/λ) (Liu et al., IEEE TED 1993, the BSIM form); DIBL = θ (coefficient 1), S = S_long/(1 − 2θ): my assembly of the two published pieces, said so on the page. Discover: planar 20 nm S 135, DIBL 213; FinFET 16 nm S 64; GAA 12 nm S 65.
9. **导线变成了瓶颈** (`#ch9`). Mayadas–Shatzkes grain-boundary plus Fuchs–Sondheimer surface term in the Steinhögl et al. (2005) combined approximation, R = 0.4, p = 0, C = 1.2, with the conductor's own width and aspect ratio (the draft used the nominal aspect ratio 2 inside the barrier; fixed 2026-11-18: Cu at 24 nm pitch 845 → 816 Ω/µm, 100 µm delay 643 → 620 ps, crossover 40 → 39 nm); Cu ρ0 1.68 µΩ·cm, mfp 39.9 nm; Ru 7.1 µΩ·cm, mfp 6.6 nm, no barrier; c = 0.2 fF/µm; 50 % delay of a distributed RC line 0.38rcL² (not the Elmore value 0.5; reproduced by a finite-difference run, 0.379). Barrier is a reader control because the crossover depends mostly on it (2 nm → 39 nm pitch, 0 nm → 11 nm); one opened source (SemiEngineering 2025-08-21) puts it at 17 nm line width or less; the earlier "10–17 nm" range was not supported and is off the page.
10. **良率和成本** (`#ch10`). Dies per wafer πd²/4A − πd/√(2A); Poisson e^(−AD₀) and Murphy ((1 − e^(−AD₀))/AD₀)²; CSET wafer prices (Khan & Mann 2020, Table 9); chiplets with 10% area overhead and 99% per bond (my assumptions, stated). Seeded wafer-map Monte Carlo agrees with Poisson (0.813 vs 0.819 at 100 mm², D₀ 0.2).
11. **前沿在哪里** (`#ch11`). Dated list built from `FRONTIER` + `fr.*`, filterable by 已量产 / 已演示 / 公司声称. Open problems paragraph and "what would have to be true".
12. **怎么读一则芯片新闻** (`#ch12`). The four figures of merit, four questions, summary.

## Diagrams (STANDARD §4a, added 2026-11-18)

Eleven static inline-SVG diagrams, one before each model in ch1–10 and one in ch11. Built in `app.js` (`DG.*`), two layouts (viewBox 720 wide at ≥ 600 px, 340 wide below; label text 14 units, so ≥ 11.8 px at 320), every label, caption and aria-label a `dg.*` key in `copy.zh.js`.

| Fig | Name | Chapter | Scale |
|---|---|---|---|
| 1 | `lattice` | ch1 | schematic (lattice flattened), said in caption |
| 2 | `junction` | ch2 | depletion widths xp : xn from `junction.width(1e17, 1e16, 0)` (30 and 302 nm, pinned); the rest schematic |
| 3 | `mosfet` | ch3 | schematic |
| 4 | `scaling` | ch4 | the two devices at 1/κ = 0.71 from `dennard.kappa(1)` (pinned); oxide exaggerated, said in caption |
| 5 | `abbe` | ch5 | schematic, angles not to scale |
| 6 | `euvpath` | ch6 | schematic; 11 reflections and 70 / 24 / 17 / 2.0 % from `euv.PATH`, `euv.DEFAULTS` (pinned) |
| 7 | `cell` | ch7 | to scale from `cells.NODES.g48m24` (144 × 144 nm, pinned) |
| 8 | `shapes` | ch8 | schematic |
| 9 | `wires` | ch9 | stack schematic; cross-section to scale from `wires.geom('cu', 24, 2)`, conducting share 61 % (pinned) |
| 10 | `package` | ch10 | schematic |
| 11 | `bspdn` | ch11 | schematic |

`tests/browser.cjs` checks at 1280/390/320: present, role and aria-label, caption, labels non-empty and not raw keys, each label inside the viewBox, no two labels overlapping, rendered size ≥ 11 px, wide layout at 1280 and narrow at 390/320, diagram before model in ch1–10. A second diagram for ch6 (the Mo/Si multilayer cross-section) was considered and not drawn.

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
| TSMC CFET inverter at 48 nm gate pitch (IEDM 2024) | eeNews Europe 2024-10-11 https://www.eenewseurope.com/en/iedm-cfets-make-progress-at-5nm-and-7angstrom/ (the IEEE Spectrum 2024-12-12 entry was removed 2026-11-19: its URL is 404) |
| imec 16 nm pitch Ru lines, 656 Ω/µm, ≥90% yield at 18–22 nm | imec 2025-06-03 https://www.imec-int.com/en/press/imec-demonstrates-16nm-pitch-ru-lines-record-low-resistance-obtained-using-semi-damascene |
| Cu mfp 39.9 nm, ρ0 1.68; Ru 7.1 µΩ·cm; barrier 3–4 nm | Moon et al., *Advanced Science* 2023 |
| Kirin 9030 on SMIC N+3 | TechInsights, December 2025 https://www.techinsights.com/blog/smic-n3-confirmed-kirin-9030-analysis-reveals-how-close-smic-5nm |
| Rapidus 2 nm prototyping, 2027 target | The Register 2025-07-18 https://www.theregister.com/on-prem/2025/07/18/japans-rapidus-says-2nm-chip-tech-on-track-for-2027/1407362 |
| Fab cost (hero, ch10.p1): additional US$100 billion for three fabs, two packaging plants and an R&D centre; total US investment US$165 billion | TSMC press release 2025-03-04 https://pr.tsmc.com/english/news/3210 (opened by the first reviewer 2026-11-18) |
| Nc 2.86e19, Nv 2.66e19, nᵢ 9.65e9 for Si at 300 K | Sze & Lee, *Semiconductor Devices: Physics and Technology*, 3rd ed. (text and appendix; opened by the first reviewer 2026-11-18) |
| Ru beats Cu at line CD ≤ 17 nm | SemiEngineering 2025-08-21 (opened by the first reviewer 2026-11-18) |
| ASML expects the EXE platform to start supporting high-volume manufacturing in 2027 | ASML 2025 annual report (same URL as above) |
| Clock-frequency data | https://github.com/karlrupp/microprocessor-trend-data (CC BY 4.0) |

## Sources opened 2026-11-18 (finishing pass)

| Fact | Source and what it says |
|---|---|
| Ru mean free path 6.6 nm; Ru ρ0 7.1 µΩ·cm (random polycrystal; 7.6 in-plane); Ru grain-boundary R 0.40–0.45; Cu on TaN p 0.05, R 0.22, λ 40.6 nm, ρ0 1.7 | Dutta et al. (imec), "Finite size effects in highly scaled ruthenium interconnects", https://arxiv.org/pdf/1712.03859v1 (fit-parameter table) |
| Steinhögl's Cu wires (230 nm high, 40–800 nm wide) are fitted equally well by (p = 1, R = 0.53), (0.6, 0.5), (0, 0.43); Cu mfp 39 nm | Chawla, Gstrein, O'Brien, Clarke, Gall, PRB 84, 235423 (2011), accepted manuscript https://link.aps.org/accepted/10.1103/PhysRevB.84.235423 |
| Another Cu fit: p = 0, R = 0.25, mfp 39 nm (Plombon et al.), with grain size = line width | https://arxiv.org/pdf/0906.3747 |
| Wire capacitance "about 0.2 fF/µm of total capacitance" as a rule of thumb | D. Harris, High Speed CMOS VLSI Design, Lecture 4: Interconnect RC (1997), https://pages.hmc.edu/harris/class/hal/lect4.pdf, §3.0 |
| Caughey–Thomas: μn = 65 + 1265/(1 + (N/8.5e16)^0.72), μp = 48 + 447/(1 + (N/6.3e16)^0.76) | https://en.wikipedia.org/wiki/Electron_mobility (reproduces and cites Caughey & Thomas, Proc. IEEE 55, 2192, 1967; the paper itself is behind a paywall) |
| Si: Nc 3.2e19, Nv 1.8e19, nᵢ 1e10, intrinsic resistivity 3.2e5 Ω·cm, Eg = 1.17 − 4.73e-4 T²/(T + 636) | Ioffe NSM archive https://www.ioffe.ru/SVA/NSM/Semicond/Si/bandstr.html (fetched with certificate checking off: the site's certificate chain is self-signed) |
| Water n = 1.44 at 193 nm; 1.35 NA immersion tools | https://en.wikipedia.org/wiki/Immersion_lithography (cites Smith et al., SPIE 2003). The NIST record of Burnett & Kaplan's measurement was found but its full text was not opened |
| Mo/Si: 70.0 % at 13.5 nm with 50 bilayers and B4C interfaces; best standard Mo/Si 68.2 %; "an EUV optical system with 9 reflective surfaces" | Bajt et al. (LLNL), "Improved reflectance and stability of Mo/Si multilayers", UCRL-JC-145925 (2001), https://digital.library.unt.edu/ark:/67531/metadc733828/m2/1/high_res_d/802924.pdf |
| "At least two condenser multilayer mirrors, six projection multilayer mirrors and a multilayer object (mask)"; theoretical Mo/Si limit ~75 %; ~25 µm tin droplets, ~50 kHz | https://en.wikipedia.org/wiki/Extreme_ultraviolet_lithography (secondary; the 75 % figure is given on the page as "常被引为", often quoted) |
| Intel Tri-Gate: press release dated 2011-05-04, "the world's first 3-D transistors … in a production technology", 22 nm Ivy Bridge "slated for high-volume production readiness by the end of this year" | Intel press release as reproduced by Engadget https://www.engadget.com/2011/05/04/intel-will-mass-produce-22nm-3d-transistors-for-all-future-cpus/ |
| High-NA status: 10 systems at 4 customers, 3 more shipping or installing; EXE:5200B 135 wph in acceptance testing; availability 84 % in July, target 90 % in Q4 2026 | Bits&Chips 2026-09-02 (ASML's Greet Storms at Semicon Taiwan) https://bits-chips.com/article/asml-expects-high-na-euv-to-reach-production-grade-availability-by-year-end/ |
| N2 "has started volume production in 4Q25 as planned", first-generation nanosheet | TSMC 2nm page, reopened |
| EXE:5200B: 0.55 NA, 8 nm, dose 50 mJ/cm² | ASML product page, reopened (the wafers-per-hour digits did not render in the fetch; 175 is the 2026-11-11 reading) |

Seen only as search-result quotations, full text not opened: Altermatt et al. 2003 (nᵢ = 9.65e9 at 300 K) and Sproul & Green 1991 (1.00e10); C = 1.2 for a rectangular cross-section in Steinhögl's formula (quoted from a 2005 IEEE TED interconnect paper and a DTIC report); TSMC Arizona, US$65 billion for three fabs (the basis of the hero's "上百亿美元"); Intel 10 nm cobalt at M0/M1 (WikiChip, Chipworks coverage of IEDM 2017).

## Facts that will go stale

All live in `models.js` `FRONTIER` (id, kind, asOf, src, url) with the sentence in `copy.zh.js` `fr.<id>`: n2, i18a, sf3, sf2, hna, hnaprod, src1kw, bspdn, a16, a14, a13, cfet, cowos, blackwell, ru, smic, rapidus. Also in prose: ch6.p4 (1,000 W source), ch5.p4 (IRDS 2025 note on 24 nm), ch9.p4 (imec Ru), ch10 wafer prices (2020 estimates, labelled), ch11.title "截至 2026 年 11 月"; fr.hna now also carries the September 2026 status (10 systems at 4 customers).

## Checked / not checked

- Checked against a primary source by the builder (2026-11-11): every row of the first table; Intel 10 nm NAND2 density reproduced to 0.02 MTr/mm².
- The eight items the draft listed as unverified, and what happened on 2026-11-18:
  1. **Nc, Nv (Sze & Ng).** (Superseded 2026-11-19: the model now uses Sze & Lee's 2.86e19 / 2.66e19 and nᵢ is 9.9e9.) Not verified: the book could not be opened. An opened source (Ioffe) gives a different pair, and references disagree on Nv from 1.0e19 to 3.1e19. The model's pair is kept because it puts nᵢ(300 K) at 9.8e9, inside the measured 9.65e9–1.0e10; the page no longer attributes the pair to Sze & Ng, says references disagree, and gives the Ioffe pair's result (8.6e9, pinned).
  2. **Caughey–Thomas parameters.** Confirmed (65/1330/8.5e16/0.72 and 47.7/495/6.3e16/0.76) against a secondary reproduction citing the 1967 paper. The code comment attributed them to Pierret; corrected.
  3. **Steinhögl's R, p, C.** R and p: confirmed as within the published fits and shown to be non-unique (table above); the page now gives the range 0.22–0.5 for Cu and 0.40–0.45 for Ru and says the crossover is an order of magnitude. C = 1.2: search-result quotations only.
  4. **0.2 fF/µm.** Confirmed as a rule of thumb (Harris 1997). The draft's attribution to Ho, Mai & Horowitz was not found in that paper's text and was removed.
  5. **Water n ≈ 1.44 at 193 nm.** Confirmed from a secondary source.
  6. **Ru mean free path 6.6 nm.** Confirmed (Dutta et al.); Gall 2016 itself not opened.
  7. **Mo/Si 70 % / 75 %, "8–12 mirrors".** 70 % confirmed and now given as 68–70 % measured; 75 % kept as "often quoted" (secondary); the mirror count is replaced by an explicit split, 1 + 3 + 1 + 6, with what the sources say (six projection mirrors, at least two illuminator mirrors).
  8. **Intel 22 nm tri-gate, 2011.** Confirmed as the announcement date (May 2011) with production readiness planned for the end of 2011; the sentence now says that rather than "2011 年开始用".
- Models re-derived 2026-11-18 by an independent script (Python, no shared code): nᵢ, intrinsic and doped resistivity, intrinsic temperature, V_bi and W, mV/decade, EKV currents and ratios, the four Dennard states quoted in prose, Abbe contrast around each printing limit, photon counts, cell densities, natural length and short-channel factors, wire resistance, the 0.38 RC delay (finite differences), gross dies, yields and costs. All agree with models.js.
- Still not verified from a primary source: items 1 and 3 (C) above; the 75 % theoretical reflectance; the literature range "线宽 10 到 17 纳米" for the Cu/Ru crossover and the Moon et al. values (builder's reading, not reopened); Intel 10 nm cobalt and the fab cost in the hero (search-result level); every frontier row other than N2 and the high-NA rows was not reopened on 2026-11-18. Samsung yields deliberately omitted.

- Independent review 2026-11-18 (incomplete; details in `specs/reviews/why-chips-are-hard-review-20261118.md`). No file of the page was changed.
  - Now confirmed from opened sources: Steinhögl's C = 1.2 (Steinhögl et al., SISPAD 2003); EXE:5200B ≥ 175 wph at 50 mJ/cm² (ASML page source and 2025 annual report); nᵢ = 9.65×10⁹ in Sze, Li & Ng 4th ed. ch. 1; Nc = 2.86×10¹⁹, Nv = 2.66×10¹⁹ in Sze & Lee 3rd ed. (the page's 2.8 / 2.65 is that pair rounded and is still unconfirmed in Sze & Ng); the frontier rows n2, hna, src1kw, a16, a14, a13, cowos, sf2, blackwell, ru, smic.
  - Found wrong or unsupported at that time (**all fixed in the completion pass of 2026-11-19, below**): fr.i18a ("首个型号在 2025 年底出货" is a plan in the cited release), fr.bspdn ("第一个" is not in the cited source), fr.cfet (the IEEE Spectrum clause; its URL is 404), fr.rapidus (the president's caution is not in the cited article), ch9.p4 (only 17 nm of "10 到 17 纳米" is supported), ch1.limit (provenance of the Nc/Nv pair), `ch5.illum.on` 正入射 (the model's source is conventional σ ≤ 0.6, not normal incidence), the ch5 slider label against the half-pitch tile (80 nm vs 40.2 nm), `ch5.split.note1` empty, seven English wording slips.
  - Not checked: layout at 390/320, English in the browser beyond a 1280 text read, `tests/browser.cjs` (not run, not extended), canvas sweep, keyboard, reduced motion, live sentences at extremes, water n = 1.44, Mo/Si 75 %, Caughey–Thomas from the paper, Samsung 3 nm release, IRDS 2025 (encrypted PDF).

- Completion pass 2026-11-19 (second reviewer; details in the review record).
  - Fixed on the page: Nc/Nv now 2.86e19 / 2.66e19 (Sze & Lee), nᵢ 9.9e9, V_bi 0.774 V, and `ch1.limit` states the provenance; fr.i18a, fr.bspdn, fr.cfet, fr.rapidus reduced to what their sources say; fr.hnaprod adds ASML's own 2027 expectation; ch9.p4 gives only the supported 17 nm figure; ch5 button and prose say conventional illumination (σ ≤ 0.6) and `ch5.limit` states both source extents; the ch5 pitch is rounded to its label; ch10.p1 carries the fab-cost sentence the hero promises; `ch5.split.note1` removed; English wording and dates; English labels that broke the layout (ch1 band diagram, ch5 threshold legend, Figures 6 and 9), and the 12/20 tick collision in the ch9 plot at narrow widths.
  - Checked: layout of all eleven diagrams and ten models at 1280/390/320 in both languages (screenshots looked at); keyboard reach, focus ring and key response of every control in both languages; reduced motion; language toggle redrawing canvas text; canvas text sweep.
  - Still open: fr.i18a keeps the tag 已量产 on the strength of The Register's January 2026 report that laptops were about to go on sale; no source opened says a unit shipped in 2025. Not verified from a primary source: Nc/Nv in Sze & Ng itself (no longer used), water n = 1.44, Mo/Si 75 %, Caughey–Thomas from the 1967 paper, the Samsung 3 nm release, IRDS 2025 (encrypted PDF: "first production use 2027" and "46 nm pitch + double patterning" rest on the builder's reading), Moon et al. 2023 (Cu/Ru bulk values, 3–4 nm barrier). Not recomputed independently by either reviewer: the eight ch4 live-sentence cases and the 2.7× / 63 % / 10.9× / 256× / 10.7× figures, ch8 swing / DIBL / leakage, the ch9 crossover 39 / 11 nm, ch5 convergence in source sampling (each is pinned to models.js by the node test, and the builder's finishing pass re-derived them with its own script). Live sentences were read at defaults and at the states the browser test drives, not at every extreme. Alias overlaps with live pages are listed in the review record for the registrar.

## Tuned or assumed parameters (all stated on the page)

β in ch3; generation-0 process in ch4; contrast threshold 0.3 and source extents (σ ≤ 0.6; 0.7–0.95) in ch5; 11 reflections in ch6; IRDS track counts and Intel 14 nm cell width in ch7; n_long = 1.3 planar in ch8; R = 0.4, p = 0, C = 1.2, line height = 2 × width and 0.2 fF/µm in ch9; the 1 + 3 + 1 + 6 split of the reflections in ch6; chiplet overhead 10% and bond yield 99% in ch10.

## Prerequisites the site lacks

Band theory and crystals; Fermi–Dirac statistics; semiconductor and pn-junction physics; Poisson's equation / electrostatics in matter; Fourier optics (diffraction orders, partial coherence); RC transients and distributed lines.

## Tests

- `node tech/semiconductors/why-chips-are-hard/tests/models.cjs` pins every prose number and every number drawn on a diagram to the models, checks the prose says it, evaluates every ch4 live-sentence case, and checks that no Chinese is produced in `app.js`, `models.js` or the page body.
- `ESSAY_BASE_URL=http://127.0.0.1:19011 NODE_PATH=~/fast/integ-life/integ-games/node_modules node tech/semiconductors/why-chips-are-hard/tests/browser.cjs` (adds the English checks automatically once `copy.en.js` exists).
- `CANVAS_BASE_URL=http://127.0.0.1:19011 node tests/canvas-text-overlap.cjs --sweep tech/semiconductors/why-chips-are-hard/`.

## Registration (2026-11-18)

- Registrar change on the team lead's decision: the Intel 18A frontier entry (`fr.i18a`) moves from 已量产 / "In production"
  to 声称 / 计划 / "Claim / plan" (`kind: 'claim'` in `models.js`), because no opened source says a unit shipped in 2025.
  Recorded in `specs/reviews/why-chips-are-hard-review-20261118.md`, "Registrar change".
- Scripts load with `?v=20261118`. REGISTRY.json title and desc now equal `doc.title` (before " · ") and `doc.desc` in both
  languages (the English title was "Why Faster Chips Keep Getting Harder").
