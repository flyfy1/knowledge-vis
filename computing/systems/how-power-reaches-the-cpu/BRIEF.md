# BRIEF — 电是怎么送进 CPU 的 (How Power Reaches the CPU)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots of every model and diagram at 1280/390/320 and reduced motion); Claude Code (claude-opus-5-5), independent review 2026-11-15: claims in both languages against sources (list below), model logic by hand, node and browser tests zh+en, canvas sweep, screenshots of all 10 diagrams and 8 models at 1280/390/320 zh+en and reduced motion (specs/reviews/how-power-reaches-the-cpu-review-20261115.md)
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: computer architecture series (`specs/essay-briefs/TASK-arch-series.md`, queued "how power reaches the CPU")
Format: long interactive essay. zh written by the builder; `copy.en.js` translated (Haiku), corrected by the reviewer; same keys, no `enStub`.
Files: index.html, copy.zh.js, copy.en.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs
No page-provenance label and no page-provenance.css link (the registrar adds both).

## The one question

一颗 CPU 只用一伏左右的电压，却能吃下两三百瓦，也就是两百安上下的电流，负载还会在几纳秒里猛跳。电是怎么从墙上的插座一路送进芯片的？芯片为什么会自己降频？

Refined from the task: 「两三百安」→「两百安上下」 (the model gives 199 A at 253 W), 「微秒之间」→「十来纳秒里」 (the PDN step rises 100 A in 10 ns, `PDN.rise`, pinned; the VRM answers in microseconds, which is the point of ch5). The reviewer changed the builder's 「几纳秒」 to 「十来纳秒」 so the prose matches the model's ramp; a 2 ns ramp sinks 183 mV (ch5.limit, `sFast`).

## Ladder (final, 12 chapters, 8 models)

1. 从插座到晶粒：一路降压 — model: wall → PSU → 12 V cable → VRM → package, loss and current per stage
2. 为什么只用一伏左右 — model: power vs frequency, cores and temperature on the alpha-power V/f curve (dynamic + leakage)
3. 电源：交流变成 12 伏 — model: 80 PLUS efficiency vs load (PFC, isolation, ATX 3 excursions, 12V-2x6 in prose)
4. 主板上的降压：多相稳压 — model: phase-shifted ripple, cancellation (TI eq. 2), efficiency vs phases / fsw / L / load
5. 负载一跳：负载线与去耦 — model: droop after a load step (log time) and |Z(f)| against the target / load line
6. 几百安怎么进到晶粒里 — no model: pins and bumps, electromigration, FIVR, power gating, per-cluster rails
7. 调频调压，以及冲刺再睡 — model: energy of a fixed task vs frequency (race to idle), schedutil
8. 空闲的时候睡多深 — model: menu-style governor over intel_idle's Skylake table
9. 热：功率墙与温度墙 — model: PL1 / PL2 / Tau with a thermal RC chain and Tj max (animated)
10. 数据中心：一千瓦一颗 — no model: DGX B200, 48 V, 800 V DC, vertical power, liquid cooling
11. 前沿在哪（2026 年 11 月） — established / demonstrated / claimed
12. 电脑降频时问的三件事 — closing

Changes from the starting list: "current density, pins, electromigration" and "on-die regulation, power gating" merged into ch6 (neither has a model; both answer "how do hundreds of amps get into the die"). Backside power and vertical power moved from the data-centre chapter into the frontier chapter (dated items); ch10 keeps the rack arithmetic. PPT/TDC/EDC and PROCHOT are prose in ch9; Apple/Arm per-cluster rails are one sentence in ch6 (no vendor detail opened).

## Models, results, tuned parameters

All numbers the prose quotes come from `prose()` in models.js and are pinned in tests/models.cjs (`want`); literal numbers in the prose are checked against SRC / FRONTIER / the TUNED constants.

- Chain (253 W, 850 W gold): wall 401 W, CPU share 63 %, 68 W heat on the path (PSU 39.9, VRM 14.5, package 9.9, cable 3.4); core 1.27 V / 199 A, 12 V 23.1 A, wall 2.02 A. TUNED: package 0.25 mΩ, cable 0.6 m of 4+4 × 18 AWG, rest of PC 80 W. Doubling the package resistance doubles that stage, total moves under 3 % (tested).
- Chip (TUNED, schematic 8-core): Vt 0.30 V, α 1.4, 0.70–1.45 V, 6.0 GHz top, 3 nF per core, leakage 1 A per core at 1 V 50 °C, ×e per 0.5 V, ×2 per 30 °C. Knee 2.8 GHz; 5.6 GHz 278 W at 1.33 V vs 4.8 GHz 164 W (17 % more clock, 69 % more power).
- PSU: loss L = a + bx + cx² through the 20/50/100 % points of each tier (exact, tested). Gold 66 % at 5 %, 90 % at 50 %. The base 80 PLUS level gets no curve (its three equal points pin no idle loss). Titanium's fit gives 84.7 % at 10 % against the 90 % requirement — said in ch3.tuned.
- VRM: ΔI = (Vin − Vo)·D/(L·f); TI SLVA882B eq. 2 checked against a brute-force sum (±0.004). 12 phases, 500 kHz, 220 nH, 200 A: 16.7 A per phase, ripple 9.8 → 1.45 A (k 0.148), 94.5 % (one phase 78.8 %, 1 MHz 91.5 %, 30 A 85.5 %). TUNED: 1.5 mΩ per phase, 3 ns transitions, 0.8 µJ per switching event, 0.5 W controller; doubling rPh costs about 5 W at 200 A.
- PDN (TUNED orders of magnitude): VID 1.25 V, 0.8 nH for the VRM loop (≈ 200 kHz with 1 mΩ), 10 × 560 µF, 30 × 22 µF, 20 µF package, 2 µF die, 10 ns rise. 100 A step with 1 mΩ load line: droop 152 mV, static 123 mV, 29 mV below the final value; peak |Z| 4.86 mΩ at 44 MHz; without package caps 436 mV and 42.4 mΩ at 17 MHz. Target 1.25 V × 5 % / 100 A = 0.625 mΩ.
- Race to idle (one core, 60 °C, 1 s window): C6 best 2.8 GHz (1.66 J) vs 7.07 J flat out; C1 (leaks at the floor) best is the slowest. TUNED C6 0.02 W; doubling it keeps the best frequency.
- C-states (seeded exponential idles, mean 300 µs): menu saves 41 % vs C1 with 44 % of idles too short; oracle 44 %; at mean 20 µs menu costs 16 % more than C1. TUNED per-state power C1 1.2 … C10 0.02 W, wake 2.5 W; scaling all of them keeps the saving.
- Thermal (TUNED 4 / 40 / 300 J/K, Rjc 0.12, Rch 0.05 K/W, 25 °C, 20 W idle): Intel defaults with 0.15 K/W: 36 s at PL2 (closed form 34 s), 5.6 → 4.4 GHz, Tj 66 °C at the end; 0.08 K/W same 4.4 GHz (power-limited). Unlimited at 0.20 K/W: Tj max after 77 s, 5.0 GHz; at 0.08 K/W 5.4 GHz.
- Racks: 1 kW is 83 A at 12 V, 20.8 A at 48 V, loss ratio 16; 1 MW is 18.5 kA at 54 V, 1250 A at 800 V.

## Diagrams (10; layout 'w' at a prose column of 600 px or more, 'n' below)

chain (numbers from the model), vf (curve and P-states from the model), psu (schematic), vrm (circuit schematic; waveform from `vrmWave(4, 1.2 V, 220 nH, 500 kHz, 200 A)`), pdn (schematic, frequency bands order-of-magnitude), die (cross-section, schematic), cst (intel_idle Skylake numbers, tested), therm (model resistances at 253 W), pl (closed form at 125 / 253 / 56 s), bspd (frontside vs backside, schematic).

## Sources (opened 2026-11-15)

- Intel, ATX Version 3 Multi Rail Desktop Power Supply Design Guide rev 2.1a (doc 336521): https://cdrdv2-public.intel.com/336521/336521_Rev2p1a.pdf — Table 3-3 excursions, §2.2.1 12V-2x6 (16 AWG, 9.2 A/pin, 600 W), Table 4-2 +12 V range, Table 2-1 CPU 12V2 currents, Table 4-14 efficiency.
- CLEAResult 80 PLUS: https://www.clearesult.com/80plus/manufacturers/115V-internal , https://www.clearesult.com/80plus/program-details (115 V internal levels incl. Ruby, power factor).
- Intel ark i9-14900K: https://www.intel.com/content/www/us/en/products/sku/236773/intel-core-i9-processor-14900k-36m-cache-up-to-6-00-ghz/specifications.html
- Intel Core Series 3 datasheet vol. 1, Package Power Control: https://edc.intel.com/content/www/us/en/design/platforms/core-processor-series-3-datasheet-volume-1-of-2/package-power-control/
- Tom's Hardware on the 10th-gen datasheet (PL1 125 / PL2 250 / Tau 56 s): https://www.tomshardware.com/news/intel-pl1-pl2-tau-10th-gen-comet-lake-processors
- Linux docs: https://docs.kernel.org/scheduler/schedutil.html , https://docs.kernel.org/admin-guide/pm/cpuidle.html ; intel_idle.c: https://raw.githubusercontent.com/torvalds/linux/master/drivers/idle/intel_idle.c (skl_cstates)
- TI SLVA882B, Multiphase Buck Design From Start to Finish: https://www.ti.com/lit/an/slva882b/slva882b.pdf (eq. 2)
- Burton et al., FIVR, APEC 2014: https://xdevs.com/doc/_Metrology/burton2014.pdf
- NVIDIA DGX B200 user guide: https://docs.nvidia.com/dgx/dgxb200-user-guide/introduction-to-dgxb200.html
- NVIDIA 800 V HVDC blog (2025-05-20): https://developer.nvidia.com/blog/nvidia-800-v-hvdc-architecture-will-power-the-next-generation-of-ai-factories/
- Intel PowerVia newsroom (2023-06-05): https://www.intel.com/content/www/us/en/newsroom/news/powervia-intel-achieves-chipmaking-breakthrough.html
- Google Cloud blog, joining OCP with 48 V (2016-03-09): https://cloud.google.com/blog/products/compute/google-joins-open-compute-project-to-drive-standards-in-it-infrastructure
- OCP Open Rack V3 IT-gear input connector: https://www.opencompute.org/documents/ocp-open-rack-v3-it-gear-input-connector-rev01-6-220929-pdf/
- eeNews Europe, Infineon quad-phase module (2025-03-10): https://www.eenewseurope.com/en/quad-phase-power-module-for-ai-vertical-power-delivery
- The Register, TSMC A16 (2024-04-25): https://www.theregister.com/2024/04/25/tsmc_first_16nm_chips/
- TechSpot, Intel drops 20A (2024-09): https://www.techspot.com/news/104587-intel-cancels-20a-process-node-arrow-lake-shifts.html ; GamingOnLinux on Panther Lake shipping January 2026: https://www.gamingonlinux.com/2025/10/intel-details-panther-lake-architecture-expected-to-start-shipping-january-2026
- PCPer, Ryzen 7000 PPT 230 W: https://pcper.com/2022/05/amd-has-officially-corrected-ryzen-7000-power-limit-230w/

## Checked by the reviewer (2026-11-15)

- Intel ATX rev 2.1a PDF read: Table 3-3 excursions 200/180/160/120 % for 100 µs/1 ms/10 ms/100 ms; +12 V +5 %/−7 % (11.20–12.60 V); Table 2-1 125 W CPU 26 A / 39 A and the "close to 1 minute" note; §2.2.1 600 W, 16 AWG, 9.2 A/pin; Table 4-14 required efficiency 70 % full / 72 % typical / 65 % light (the prose had the order reversed; fixed).
- 80 PLUS 115 V internal tiers incl. Ruby 85/91/93/95/91 (Wikipedia table, CLEAResult page now 404; Ruby 5 %/10 % also in press).
- Intel PowerVia newsroom (opens; ">90% cell density", ">5% frequency", 20A in 2024).
- Google 2016 blog ("at least 30% more energy efficient"; prose softened from 省电 30%).
- NVIDIA 800 V blog (200 kg, 85 %, up to 5 %, 2027 Kyber).
- AMD Ryzen Master user guide (docs.amd.com 68886): PPT total socket power, TDC sustained current limit, EDC peak current limit.
- Intel 14900K profiles (hwbusters table: Performance 125/253 W, ICCmax 307 A; Baseline 125/188; no Tau listed): ICCmax name confirmed; Tau for 14th gen not found, so ch9 now says the 56 s is the 10th-gen value borrowed for the model.
- TSMC A16: volume production planned H2 2026 (AnandTech/Tom's 2024); no report found of it having started.
- By hand: SLVA882B eq. 2 at N = 12, D = 0.1 gives 0.148; 12-phase loss 5.1 + 3.6 + 5.3 W = 14.0 W (94.5 %); static droop 1.23 mΩ × 100 A = 123 mV; boost 56·ln(233/128) = 33.5 s; unlimited at 0.20 K/W steady Tj 119 °C > 100, at 0.08 K/W 88 °C.

## Not verified from a primary source

- The 230 W PPT for 170 W Ryzen 7000 parts (PCPer); the definitions are now checked against AMD's Ryzen Master guide.
- Smith et al. 1999 target impedance: seen only through US patent 6532439 and an MPS note, not the paper (reviewer did not open it either).
- Alpha-power law (Sakurai & Newton 1990) and Black's equation: named, papers not opened.
- Intel dropping 20A and Panther Lake availability: press (TechSpot, GamingOnLinux).
- TSMC A16 production in 2026: The Register's report of the symposium; no TSMC release opened.
- "Many boards set PL1 = PL2": press reports (Igor's Lab, ComputerBase), not a vendor statement.
- PROCHOT as a bidirectional pin that the VRM can assert (general datasheet knowledge, not re-opened). ICCmax as a name: secondary (hwbusters/Igor's Lab tables of Intel's profiles).
- The 14900K's Tau: no current datasheet opened; the page quotes the 10th-gen 56 s and says so in ch9.p2.
- Per-cluster voltage rails on phone and laptop chips: general description, no vendor document.

## Facts that will go stale

FRONTIER in models.js (asOf 2026-11): Panther Lake availability, A16 production, NVIDIA 800 V from 2027 with Kyber, Infineon module figures, 80 PLUS Ruby, ATX 3 rev 2.1a.

## Registrar notes

- Titles: zh 《电是怎么送进 CPU 的》, en "How Power Reaches the CPU" (registry). Concepts #ch1–#ch12, one per chapter.
- Plain-text drafts to link when live: 《芯片为什么越来越难做》 / “Why Faster Chips Keep Getting Harder” (ch2.p1, ch12.links) and 《按下开关的那一刻，电是从哪儿来的》 / “Where the Power Comes From the Instant You Flip the Switch” (ch1.p1, ch12.links); English titles now match those drafts' REGISTRY titles, so site-nav will auto-link them.
- Alias change by the reviewer: `LLC` (reads as last-level cache in a computing search) replaced by `防掉压`.
- Words left to siblings (reserved in tests/models.cjs): 漏电 / leakage current / 功率密度 / 背面供电 / backside power delivery / 登纳德缩放 / 暗硅 (why-chips-are-hard draft); AI data center power (frontier-model draft); CPU 频率 / 主频为什么有上限 (switches-that-compute #ch7); Dennard scaling (why-compute-waits-for-memory #ch5); USB PD words (Thunderbolt); power sequencing / PWR_OK / S3 S4 S0ix (boot); buck / boost (power-converters); Ohm's law.
- Scripts carry `?v=20261115`; models.js, app.js and both copy files changed in review, so bump the key at registration if this version was ever served.
