# BRIEF — 内存是怎么和 CPU 说话的 (How Memory Talks to the CPU)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots of every model and diagram at 1280/390/320); Claude Code (claude-opus-5-5), separate session, independent review 2026-11-15: zh and en read in full, models re-derived, sources spot-checked (see Review)
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: buses series B3 (`specs/essay-briefs/TASK-bus-series.md`)
Format: long interactive essay. Chinese written in full; `copy.en.js` translated (no `enStub`), reviewed 2026-11-15.
Files: index.html, copy.zh.js, copy.en.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs

## The one question

内存条上写着 DDR5-6400、CL32——频率越高，延迟那个数反而越大，它到底快了没有？CPU 想要一个字节，内存条里到底发生了哪些事？为什么内存条这么多年还在用一大排并行的线？

## Changes from the starting list (task message)

- The order follows the list. tRRD and tFAW are introduced in ch3 but modelled in ch6 with bank groups. They only
  bind when every read opens a new row, so they belong with the bank-group model.
- Ranks are not a chapter of their own:
  - The address model is single-rank, and its rank field has 0 bits. ch2.limit says a dual-rank module adds a bit.
  - ch7 uses AMD's 1R/2R × 1DPC/2DPC table.
  - ch9 covers MRDIMM, which interleaves two ranks.
- ch7 does not model signal integrity, which is B2's subject. Its model is fly-by clock skew against the bit time.
  That is what forces training, and it is computable from a trace delay and a chip pitch.
- LPDDR5X, CAMM2, MRDIMM and GDDR7 are merged into ch9 with two diagrams: package-on-package, and the PAM3 symbol
  pairs.
- MCR DIMM is not named separately: MRDIMM is the JEDEC form.
- HBM and Little's law appear only as links (why-compute-waits-for-memory #ch9, #ch4).
- CXL appears only as plain text pointing to B4.

## Chapters, models, results, tuned parameters

All traces come from seeded generators in models.js. ch3, ch5 and ch6 run one command-level simulator: one command
per cycle, FR-FCFS after Rixner et al. 2000, and every timing rule listed in models.js. tests/models.cjs replays
each command log and checks every rule.

1. **Refresh.** Busy share = tRFC ÷ tREFI. Extra wait for a random read = busy × tRFC / 2. DDR5 16 Gb:
   - all-bank 7.6 % busy, +11.2 ns;
   - fine-granularity (FGR) 8.2 %, +6.6 ns;
   - same-bank 6.7 %, +4.3 ns;
   - above 85 °C, 15.1 % busy.
2. **Address split** (row-first or bank-group-first). Example address 0x23A5C9E48 → channel 1, subchannel 0, bank group 2, bank 2, row 18,251, column 30.
   35 bits = 2 × 16 GB.
3. **Simulator** on DDR5-6400B, 48 reads.
   - Idle bank, by hand: hit 18.75 ns, miss 35.0 ns, conflict 51.25 ns.
   - Simulated averages:

     | Trace | Open page | Close page |
     |---|---|---|
     | Stream | 21.5 ns | — |
     | Random | 43.1 ns | 35.3 ns |
     | Ping-pong (same bank) | 50.9 ns | 48.2 ns (bound by tRC) |

   - With seeds 1–12, close page beats open page on the random trace every time (tested).
4. **CL in nanoseconds:** cycles × 2000 ÷ MT/s.
   - DDR5-6400 CL32 = DDR4-3200 CL16 = 10.0 ns.
   - JEDEC bins: 13.75–16.67 ns.
   - Miss (tRCD + CL): 22.2 ns vs 21.25 ns.
5. **Bandwidth,** 400 queued reads on one subchannel (peak 25.6 GB/s).

   | Banks | Same-row share | Achieved | Share of peak |
   |---|---|---|---|
   | 1 | 0 | 1.3 GB/s | — |
   | 32 | 0 | 21.9 GB/s | 86 % |
   | 8 | 0.9 | — | 93 % |
   | 1 | 1 | — | 49 % (tCCD_L) |

6. **Bank groups.**
   - One group: 98 % of the bus at 3200, 49 % at 6400, 36 % at 8800. Two groups at 6400: 95 %.
   - New row on every read at 6400: x8 95 %, x16 77 % (tFAW binds at 40 nCK).
7. **Fly-by skew.**
   - 5 chips, pitch 14 mm (**TUNED**), 170 ps/in (the value how-a-computer-is-wired uses).
   - At 6400: 375 ps across the module = 2.4 bit times. DDR-400: 0.15 bit times.
   - Pitch halved → 1.2 UI; doubled → 4.8 UI. Training is needed either way.
8. **ECC,** exact enumeration over textbook Hamming codes.
   - (136,128) SEC, two errors: 88 % silent and 12 % detected, over 9,180 patterns.
   - (72,64) SECDED: detects 100 % of two-bit errors, but 76 % of three-bit errors are silent.
   - Counts are checked against an independent xor count.
9. **NRZ / PAM3 / PAM4 eye** with linear loss. The loss slope k = 1.2 dB/GHz is **TUNED**.
   - Crossovers: 60·log10 2 = 18.1 dB and 120·log10 1.5 = 21.1 dB, so PAM3 wins between 30 and 35 Gb/s.
   - k halved → the window starts at 60 Gb/s; doubled → 15 Gb/s. The order NRZ → PAM3 → PAM4 is kept.
10. **Row hammer,** one bank over two refresh windows; 75 ACTs per tREFI = floor((3900 − 295) / 48).
    - No defence, double-sided: 614,400 ACTs.
    - TRR as a Misra–Gries table with k = 8 (**TUNED**):
      - 2 aggressors: 75;
      - 10 aggressors: 122,880, with 5 victims over 10,000;
      - k = 16 at 10 aggressors: 136;
      - k = 4 at 10 aggressors: 122,880, no better than no defence (both stated in ch10.p4).
    - PRAC alert at a quarter of the threshold (**TUNED**): at 4,800 the worst victim is 2,399, with 1,010 alerts.
      Halved (1/8) or doubled (1/2), there are still no flips at any listed threshold (stated in ch10.limit).
11. Frontier (no model). 12. Closing (no model).

## Diagrams (STANDARD §4a, inline SVG from app.js, labels from copy, layouts 720/340 units)

There are eleven:
- cell: 1T1C and sense amplifier;
- bank: decoder, array, row buffer, column select;
- addr: 35-bit split with bit numbers;
- timing: PRE→ACT→RD→data, to scale in cycles from `timing('ddr5-6400b')`;
- dimm: two subchannels, ECC chips, PMIC, SPD hub;
- bg: 8 groups × 4 banks, tCCD_L/S from the model;
- dpc: 1DPC vs 2DPC, fly-by, stub;
- ecc: on-die vs side-band coverage;
- pop: socketed module vs package-on-package;
- pam3: 3×3 symbol pairs, 8 used;
- hammer: single- vs double-sided.

## Sources (opened by me on 2026-11-15 unless marked)

- Micron 16Gb DDR5 SDRAM die rev D addendum, rev F (04/2024): https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/7969/16gb-ddr5-sdram-dierevd.pdf
  - organisation (banks, groups, rows, columns, page);
  - speed bins -64B 52-52-52 and -56B 46-45-45;
  - tAA 16 ns.
- Micron DDR5 SODIMM core, rev F (05/2023): https://www.farnell.com/datasheets/4530576.pdf
  - two 32/36-bit subchannels;
  - PMIC, 5 V input to VDD 1.1 V;
  - BL16 wording, fly-by topology;
  - 4800B CL40.
- SK hynix 16Gb DDR5 H5CG48AGBDX018N rev 1.0 (Jul 2022): https://atta.szlcsc.com/upload/public/pdf/source/20260310/4BFD91D0A9E0136810A4E47B630224DF.pdf
  - Table 67: tREFI, tRFC1/2/sb; ×2 refresh rate above 85 °C;
  - AC tables: tCCD, tRRD, tFAW, tRTP, tRAS, tRC;
  - §4.36 on-die ECC (128 + 8, DUE, no write-back on reads, ECS);
  - 5600B 46-45-45.
- SK hynix 8Gb DDR4 H5AN8G8NCJR rev 1.5 (Mar 2019): https://atta.szlcsc.com/upload/public/pdf/source/20251031/07854BBB9FF97A51698A82BD877F2E9B.pdf
  - tREFI 7.8 µs, tRFC1 by density, nRFC at 3200;
  - 3200AA 22-22-22;
  - nRAS/nRC/nFAW, tCCD_S/L.
- SQRAM (Advantech) SQR-RD5N32G4K8SZZB DDR5-4800 RDIMM rev 1.1 (Dec 2022): https://advdownload.advantech.com/productfile/Downloadfile4/1-2BIYHUB/Advantech%20SQR-RD5N32G4K8SZZB.pdf
  - 8 Gb tRFC 195/130/115 ns (24/32 Gb TBD);
  - 40-39-39.
- Kim et al., "Flipping Bits in Memory Without Accessing Them", ISCA 2014: https://users.ece.cmu.edu/~yoonguk/papers/kim-isca14.pdf
  - 129 modules, 110 vulnerable;
  - 139K activations;
  - 64 ms, tRC ≈ 50 ns.
- Kim et al., "Revisiting RowHammer", ISCA 2020: https://arxiv.org/abs/2005.13121 (abstract: 1,580 chips, 9.6K / 4.8K per side).
- Frigo et al., "TRRespass", IEEE S&P 2020: https://arxiv.org/abs/2004.01807 (abstract: 42 modules, 13 vulnerable, up to 19 aggressors per the paper's summary).
- AMD Ryzen 9 9950X product page: https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9950x.html
  - 2 channels;
  - 2×1R/2R DDR5-5600, 4×1R/2R DDR5-3600.
- Intel Core Ultra 200S Plus quick reference guide: https://cdrdv2-public.intel.com/874112/intel-core-ultra-200s-plus-series-processors-quick-reference-guide-ph2-public.pdf (test memory DDR5-7200 34-45-45-45-115).
- DDR5 timings (JESD79-5C, PRAC, DDR5-8800), via reprints because jedec.org returned 403:
  - TechPowerUp, https://www.techpowerup.com/321808/ (2024-04);
  - Gigazine, https://gigazine.net/gsc_news/en/20240423-jedec-ddr5-standard-update.
- JEDEC MRDIMM press release of 2026-04-30 (JESD82-552, gen-2 MRDIMM 12,800 MT/s "nearing completion"), via StorageNewsletter: https://www.storagenewsletter.com/2026/07/01/jedec-advances-ddr5-mrdimm-ecosystem-with-new-memory-interface-logic-and-expanded-mrdimm-roadmap/. BusinessWire returned 403.
- DDR5 overclocking record, Duck-IT Tech News (2026-07-03): https://www.duckittech.com/news/saltycroissant-breaks-ddr5-world-record-at-13606-mts-on-gigabyte-z890-aorus-tachyon-duo-x-ice (13,606 MT/s, 24 GB module; the article text gives the previous record as 13,556 MT/s, announced by Gigabyte at Computex 2026).
- Classic results cited by name, not reopened:
  - Rixner et al. 2000 (FR-FCFS);
  - Hamming 1950;
  - Misra & Gries 1982;
  - Jacob, Ng, Wang, *Memory Systems* (2008).

## Not verified from a primary source

- **JEDEC documents.** No JEDEC standard or jedec.org page was opened (403):
  - JESD79-5C date and content (PRAC, DDR5-8800);
  - JESD239 (GDDR7, 2024-03-05, 48 Gb/s, 192 GB/s per device);
  - JESD318 (CAMM2, 2023-12-05, 8–128 GB);
  - JESD209-6 (LPDDR6, 2025-07-09, 10,667–14,400 MT/s, 12-DQ subchannels).

  These come from reprints of the JEDEC press releases (TechPowerUp, Gigazine, TechSpot, Notebookcheck, Tom's Hardware) seen in search results; only the TechPowerUp and Gigazine pages were opened.
- **Product figures from search-result summaries only:**
  - Samsung LPDDR5X 10.7 Gb/s (2024-04-17): The Register, Tom's Hardware;
  - RTX 5090 28 Gb/s × 512 bits: several retailer and press pages;
  - Corsair CMK16GX4M2B3200C16 16-18-18-36 1.35 V: retailer listings;
  - G.SKILL F5-6400J3239G16GX2 32-39-39-102 1.40 V: PC Gamer review and listings;
  - Intel Xeon 6 MRDIMM speeds (6900P 8800, 6700P/6500P 8000): Tom's Hardware and Intel support article 000098737.
- **The PAM3 mapping** in diagram pam3 is illustrative; the caption says GDDR7's own mapping was not seen.
- **DDR6 8,800–17,600 MT/s:** press reports only. No JEDEC publication found; listed as 「说法」.
- **The record.** HWBOT was not checked directly. (Review: the page said 13,556.8; the Duck-IT article text says 13,556, now used.) The earlier figure is reported by HotHardware/Gigabyte
  (those pages returned 403; the number is quoted in the Duck-IT article).
- **Micron's DDR5 white paper** (refresh, ECC background) was rejected or redirected; not used.
- **Board trace delay of 170 ps/inch** is the value TUNED in how-a-computer-is-wired, not measured here.

## Facts that will go stale

FRONTIER.asOf = 2026-11:
- DDR5 overclocking record;
- DDR6 status;
- MRDIMM gen 2;
- LPDDR6 products;
- top JESD79-5 speed bin;
- GDDR7 pin rates in shipping cards.

## Checked / not checked

Checked:
- Every prose number is a prose() value pinned in tests/models.cjs. Literals in the prose (85 °C, 13–17 ns, 1 万,
  13.9 万, 4800, 16 行, 10 个, 32 Gb/s, 2000, dates) are checked against models.js.
- Datasheet figures are retyped in the test.
- Hand checks:
  - refresh arithmetic;
  - address split, bit by bit;
  - simulator hit/miss/conflict = closed forms;
  - every timing rule replayed on 60+ simulator runs;
  - Hamming counts;
  - PAM3 crossovers equal-eye;
  - row-hammer arithmetic.
- Every live-sentence branch is reached.
- Browser test at 1280/390/320:
  - overflow, clipping, 48 px targets;
  - eleven diagrams: aria, labels inside, no overlap, ≥ 11 px;
  - every model driven;
  - reduced motion.
- Canvas text sweep.
- Screenshots viewed:
  - all eleven diagrams at 1280 and 320, and timing and addr at 390;
  - all ten models at 1280, and ch2, ch3, ch4, ch6 and ch10 at 320;
  - ch4 and ch7 at 390;
  - a slice of the reduced-motion page at 390. Its canvases are blank in a full-page shot because they draw only on screen; the browser test checks the reduced-motion canvas while it is in view.
- Canvas sweep: 918 states, 0 findings.

Not checked:
- English: translated afterwards; checked by the independent review (see Review).
- Writes and read/write turnaround (not modelled).
- Real controllers' address hashing.
- Real TRR algorithms (secret).

## For the translator

- Keep placeholders.
- `ch2.say.map` uses {step} (bytes to the next line in the same subchannel).
- Diagram labels in the narrow layout are 340 units wide: keep `dg.addr.*`, `dg.bg.*` and `dg.pam3.*` short.
- 「调出来的参数」 = "tuned parameter".
- 「面」 = rank, 「子通道」 = subchannel, 「行锤」 = row hammer.

## Registrar notes

- Title: zh 「内存是怎么和 CPU 说话的」, en "How Memory Talks to the CPU". Concepts: 12, #ch1–#ch12.
- No alias collides with any REGISTRY.json on the site; the test scans every one.
- Words left with their owners:
  - ECC / ecc memory / 内存纠错ECC (how-much-a-wire-can-carry, a-secret-in-public);
  - 内存控制器 / NUMA (how-a-computer-is-wired);
  - 内存墙, 延迟与带宽的区别, 内存带宽瓶颈, HBM, CXL 内存池 (why-compute-waits-for-memory);
  - PAM3 是什么 (how-thunderbolt-works);
  - PAM4 / NRZ (how-pcie-works);
  - 为什么并行总线被串行取代 (how-sata-works);
  - 内存怎么存一位 (switches-that-compute).

  This page takes the DDR-specific forms instead: 「DDR5 自带 ECC 吗」「片上 ECC」「GDDR7 为什么用 PAM3」.
- For B4: CXL / 内存扩展 words are untouched; ch11.c3 mentions CXL in plain text only.
- No provenance label, and no edits to pages.config, atlas or search.

## Review

- Reviewer: Claude Code (claude-opus-5-5), separate session; did not build the page. Date 2026-11-15.
- Scope: zh and en read in full (every key of copy.zh.js and copy.en.js). Models driven by the browser test in zh at
  1280 and (new) in en at 320; screenshots of every model in en at 1280 and 320. All eleven diagrams looked at in en
  screenshots at 1280 and 320, and in zh at 320; ecc, hammer and addr again after the fixes.

### Checks (independent script in /tmp/agent-tasks/buses/review-b3/check.cjs)
- Refresh: tRFC/tREFI by hand. DDR5 16 Gb: all-bank 295/3900 = 7.6 % (+11.2 ns); FGR 160/1950 = 8.2 % (+6.6 ns);
  REFsb 130/1950 = 6.7 % (+4.3 ns); >85 °C 15.1 %. DDR4 tRFC1 160/260/350/550 ns at 2/4/8/16 Gb, tREFI 7.8 µs:
  the JEDEC values. 8,192 REF in 32 ms = 3.9 µs.
- Address split of 0x23A5C9E48 bit by bit (off 8, ch 1, sub 0, col 30, BG 2, bank 2, row 18,251; 35 bits = 32 GiB).
- Simulator: a separate checker replays the command log of 105 runs (5 bins × 3 traces × open/close × chain/flood,
  plus the ch5 and ch6 traces) against tRCD, tRAS, tRP, tRC, tRTP, tCCD_S/L, tRRD_S/L, tFAW (any 5 ACTs span ≥ tFAW),
  one command per cycle, no data-bus overlap, BL16 → 8 clocks → 64 B on a 32-bit subchannel. 0 violations.
  Idle hit/miss/conflict = 60/112/164 nCK × 0.3125 ns = 18.75/35.00/51.25 ns. DDR5-6400B = 52-52-52 (JEDEC 6400B;
  Micron -64B), DDR4-3200AA 22-22-22, DDR5-4800B 40-39-39, 5600B 46-45-45: real JEDEC bins. Miss row uses each bin's
  own tRCD: (39 + 32) × 0.3125 = 22.19 ns vs (18 + 16) × 0.625 = 21.25 ns; both XMP kits' timings match their
  listings (32-39-39-102 / 16-18-18-36).
- 86 % with 32 banks (tFAW 32 nCK = 4 bursts does not bind; tRRD_L 16 does a little), 49 % one bank / one group
  (8/16 minus startup). 36 % at 8800 = 8/22.
- Fly-by: 14 mm × 170 ps/in ÷ 25.4 = 93.7 ps/step, 4 steps = 375 ps = 2.40 UI at 156.25 ps; halved 1.2, doubled 4.8.
- ECC: exact enumeration recounted by a separate xor count: (136,128) textbook SEC, double errors 88.3 % silent /
  11.7 % DUE over 9,180 pairs; (72,64) SECDED 100 % DUE for 2, 76.0 % silent for 3. **Construction:** the model's code
  is the positional Hamming code, columns 1…136, check bits at powers of two. The 88 % is a property of that layout:
  random choices of 136 columns give about 53 %, and an odd-weight-first layout gives 17 %. JEDEC's DDR5 matrix was not
  seen.
- PAM: crossovers 60·log10 2 = 18.06 dB and 120·log10 1.5 = 21.13 dB derived from equal eyes; 30.1–35.2 Gb/s at
  1.2 dB/GHz; halved/doubled slope moves the window to 60/15 Gb/s. GDDR7 3 bits per 2 symbols, 8 of 9 pairs.
- Row hammer: floor((3900 − 295)/48) = 75 ACT per tREFI; 614,400 per window; PRAC with 1/8 and 1/2 alert ratios
  gives no flips at any listed threshold for 1–20 aggressors.

### Sources upgraded or spot-checked (opened 2026-11-15)
- JESD79-5C, 2024-04-17, PRAC, timing parameters to 8800 Mbps: JEDEC release reprinted verbatim by Design & Reuse,
  https://us.design-reuse.com/news/56080/jedec-jesd79-5c-ddr5-sdram-standard.html (says "from 6800 Mbps to 8800").
- GDDR7 JESD239, 2024-03-05, "up to 192 GB/s per device", 4 channels per device, PAM3: JEDEC release via Design &
  Reuse, https://us.design-reuse.com/news/55819/jedec-gddr7-graphics-memory-standard.html. 48 Gb/s per pin is still
  only from secondary reports (192 GB/s ÷ 32 bits gives it).
- CAMM2 JESD318, 2023-12-05: JEDEC release via Design & Reuse, https://us.design-reuse.com/news/55355/jedec-camm2-memory-module-standard.html.
  The 8–128 GB range is not in that text; still search summaries only (TechSpot; Gigazine confirms 128 GB only).
- LPDDR6 JESD209-6: 2 subchannels × 12 DQ per die, StorageNewsletter reprint (2025-07-10) of the JEDEC release
  (BusinessWire URL dated 2025-07-09); 10,667–14,400 MT/s from Notebookcheck (2025-07-11).
- Samsung LPDDR5X 10.7 Gb/s, 2024-04-17: Samsung Semiconductor newsroom,
  https://news.samsungsemiconductor.com/global/samsung-develops-industrys-fastest-10-7gbps-lpddr5x-dram-optimized-for-ai-applications/
- RTX 5090: NVIDIA product page gives 32 GB GDDR7, 512-bit (https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/);
  28 Gb/s and 1,792 GB/s not on that page, from Tom's Hardware/TechPowerUp listings via search.
- MRDIMM: JEDEC release of 2026-04-30 (BusinessWire URL 20260430…, 403); content checked on StorageNewsletter: JESD82-552
  published, Gen2 "nearing completion", 12,800 MT/s target.
- DDR5 record: Duck-IT article text (13,606; previous 13,556, Gigabyte, Computex 2026).
- jedec.org, BusinessWire, TechPowerUp, TechSpot all returned 403 to me as well.

### Changes
- Layout: `label.txt` had `min-width:auto`, so its span and input could not shrink; now it wraps (`flex-wrap`,
  `min-width:0`, input `flex:1 1 11em`). English labels restored: "Physical address" (was "Hex"); ch4 headers
  "CL in nanoseconds", "Row miss (tRCD + CL)", "Peak per 64-bit channel". The narrow-table `thead` (visually hidden)
  now collapses its cells too, which the longer headers needed (they stuck out of the viewport at 390/320).
- ECC (zh + en): ch8.p4 now says the 88 % belongs to the textbook layout and gives the odd-weight layout's 17 %
  (new `secColumns`/`secDouble` in models.js, `e2silOdd` pinned, recounted in the test by parity classes); ch8.limit
  and ch8.model.how name the construction. Diagram ecc: "旁路 ECC：编码、检查" / "Side-band ECC logic" inside the
  controller box (the old "extra chip" label sat in the controller and overflowed in English).
- Record previous figure 13,556.8 → 13,556 (FRONTIER, test, BRIEF); "announced by Gigabyte at Computex".
- ch7.p4: DDR-400 figure is the same wiring at that speed; modules of that era did not use fly-by (DDR3 introduced it).
- ch5.p2: the 5 V PMIC input is said of desktop and laptop modules.
- ch10.p4: "same as no defence" now refers to the worst victim's count (flip counts differ: 5 vs 11).
- English: ch6.model.how mistranslation ("rounded to whole 16 ns steps" → 16 ns rounded up to whole cycles);
  ch5.limit conditional restored; ch8.p2 "does not make the computer more reliable" → "its purpose is not…";
  CAMM2 "module standard"; "datasheet"; dg.addr legend expanded; ch8 canvas "1 bits flipped" → "1-bit error";
  ch8 example sentence grammar; ch10 canvas y label shortened (it overlapped the threshold legend at 320).
- app.js: hammer legend spacing (en overlap at 1280); ch10 y-label room accounts for the swatch; ch3 idle readout
  2 decimals so it matches the prose (18.75 / 35.00 / 51.25).
- tests/browser.cjs: an English drive at 320 (labels, table headers, input width, number formats, canvas label,
  ch8 odd-weight share).

### Not changed, noted
- The ch9 eye model overlaps how-pcie-works #ch9 in kind (PAM4 vs NRZ eye); this page adds PAM3 and the crossover
  window and links #ch9, so I left it.
- "5 chips" on the fly-by clock line is a choice (it would fit 4 data + 1 ECC chips per subchannel), not marked TUNED; conclusions hold
  for 4.

### Unverified
- ch7.p4's new remark that fly-by routing arrived with DDR3 (DDR-400 modules did not use it) is textbook knowledge,
  not reopened.
- The ecc diagram no longer names the extra ECC chip on the module; the caption and ch8.p3 do.
- JEDEC documents themselves (403). JESD79-5 24/32 Gb tRFC1/2/sb: a search summary of an SQRAM 24 GB SODIMM
  datasheet gives 410/220/190 ns, but the PDF's table did not extract for me, so ch1 still leaves those densities out.
- GDDR7 48 Gb/s per pin, CAMM2 8–128 GB, LPDDR6 rate range, RTX 5090 28 Gb/s, XMP kit and Xeon 6 MRDIMM speeds:
  secondary sources only. GDDR7's PAM3 code table: search summaries of AnandTech/Cadence say (0,0) is the unused pair,
  as in diagram pam3; the other assignments remain illustrative.


## Registrar (2026-11-15)

- Essay commit d165655d (this tree as reviewed, on drafts/buses-20261115 as 9921fda8). Registered with B4 in one batch.
- Links: ch11.c3 links B4 #ch5 (memory expansion) and ch12.links B4's page top, zh and en, where the page said a later essay
  would cover CXL. Siblings now link here: B4 ch3.p4 (#ch5, under this page's title; it quoted the task file's working title)
  and ch13.links; how-cpu-caches-work ch12.links; why-compute-waits-for-memory ch5.p2 (#ch5, "DDR 内存通道"). tests/models.cjs
  requires the B4 links (it used to forbid them) and checks B4's quoted title.
- Aliases: one-click additions #ch4 CL 值越高越慢吗, #ch7 插四根内存为什么降频, #ch8 ECC 内存 (zh; unowned on the live site).
  Generic ECC / ecc memory / 内存纠错ECC stay reserved: plain ECC is the elliptic-curve alias of the unregistered draft
  a-secret-in-public, ecc memory / 内存纠错ECC sit on the Hamming-code chapter of the unregistered draft how-much-a-wire-can-carry;
  whoever registers those drafts decides (this page's #ch8 is the better landing for "ECC memory"). pages.config.js tags add
  内存条 / Memory Modules, so 内存条 and 内存条是怎么工作的 open the page top. CXL words are on B4.
- Scripts move to `?v=20261115r` (never deployed under any key).
