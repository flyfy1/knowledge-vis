# BRIEF — how-a-cpu-does-math

Author: Claude Code (claude-opus-5-5), 2026-11-16. English (content.en.md) by Haiku. Status: registered 2026-11-16 (live);
independently reviewed 2026-11-16 (specs/reviews/how-a-cpu-does-math-review-20261116.md).
This is the first essay written natively in the site template (content.zh.md → build-pages.cjs). content.en.md is now
a full translation. Since the template follow-up (2026-11-16) English pending is declared in page.json (`"languages"`;
the build marks a stub with `data-lang-en="stub"` on `<html>`, which app.js reads); the page-wide `meta.en` string it
replaced is gone.

## What the page is

14 chapters, 14 models (labs), 13 static diagrams (each a wide and a narrow SVG) and 1 static table.

1. Bits of binary32 (encode any decimal or fraction exactly; flip bits). Fig 1: f32 fields.
2. ulp (sawtooth of relative spacing; +1; float clock). Fig 2: grid of a 3-bit format.
3. Rounding (five modes accumulating; stagnation). Fig 3: guard/round/sticky.
4. Subnormals, NaN, inf (1.7·2^-k toward zero, FTZ). Fig 4: exponent cases and the gap.
5. Cancellation (variance three ways) and summation (naive, pairwise, Kahan). Fig 5: decimal cancellation.
6. FMA (x·x − x·x; dot product). Fig 6: mul+add vs fused.
7. FP16, BF16, FP8 (Gaussian into a format) plus a static format table. Fig 7: bit layouts.
8. INT8 and block scaling (seven schemes, outliers). Fig 8: tensor scale vs MX blocks.
9. SIMD and masks (lanes, mask hex, tail mask). Fig 9: lanes and a masked add.
10. Auto-vectorisation (lane-split sums). Fig 10: tail mask and gather.
11. Latency and throughput (FMA issue simulation) and frequency licences (µs simulation). Fig 11: 1 vs 8 accumulators (the model's own trace).
12. SVE, SME, AMX (VLA predicates, outer product). Figs 12–13.
13. Frontier as of November 2026, split into established, demonstrated and claimed.
14. Closing: three questions.

## Sources (opened 2026-11-15/16 unless noted)

- OCP Microscaling Formats (MX) v1.0, Sep 2023 (PDF, text extracted). Used: §6.3 conversion (scale = 2^(floor(log2 amax) − emax_elem); the elements are clamped), the FP6/FP4/INT8 element tables and E8M0. The tables in the PDF are images, so Table 1 (k = 32, E8M0) was cross-checked in arXiv 2310.10537v3.
- Micikevicius et al., FP8 Formats for Deep Learning, arXiv 2209.05433 (E4M3/E5M2 table). OCP OFP8 v1.0, June 2023.
- Intel AVX10.2 Architecture Specification, 361050-007US, rev 7.0, April 2026 (PDF, text extracted). Used: AVX10/512 converged on all Intel processors including E-cores (128/256/512 bits; earlier VL enumeration bits reserved at 1); FP8 conversions per OFP8; BF16 arithmetic; VCVTBIASPH2[B,H]F8[S] with an 8-bit bias for software stochastic rounding.
- Agner Fog, Instruction tables (updated 2025-09-20): FMA latency 4 and two per cycle on Skylake and Zen 5; Zen 4 does one zmm FMA per cycle.
- Travis Downs, "Gathering Intel on Intel AVX-512 Transitions", 2020-01-17. Xeon W-2104: 3.2/2.8/2.4 GHz; about 10 µs halted per transition; about 680 µs to relax.
- Chips and Cheese, "Zen 5's AVX-512 Frequency Behavior", 2025-02-28. Ryzen 9 9900X: a register-only 512-bit FMA test held 5.7 GHz; a heavy load/store sequence dipped to about 4.7 GHz for about a dozen ms.
- Remke & Breuer, "Hello SME!", arXiv 2409.18779. M4: SVL 512; FP32 FMOPA reaches 2009 GFLOPS with 4 tiles and about 502 with 1.
- Arm Lumex / C1 announcement, 2025-09-10 (SME2; "up to 5x" is Arm's claim). Arm developer blog, SME introduction.
- Intel AMX: clang amxintrin.h and Intel's figure (via Wikipedia) of 1024 BF16 or 2048 INT8 ops per core per cycle.
- AVX-512 history (Wikipedia). SSE 1999, AVX 2011, Haswell 2013 (web search, consistent sources). A64FX is the first SVE CPU (Fujitsu and Arm pages). RVA23 ratified Oct 2024.
- IEEE P3109: PAR 2023-02-15; still a draft. Fitzgibbon et al., arXiv 2606.04028 (2026-06, revised 2026-10).
- NVIDIA NVFP4 blog, 2025-06 (block 16, E4M3 scale, FP32 per-tensor scale; the ≤1% DeepSeek-R1-0528 accuracy claim is attributed to NVIDIA).
- Cited but not reopened for this page: IEEE 754-2019 (format parameters are well established, and tests pin them against Float32Array and Number.MAX_VALUE/MIN_VALUE/EPSILON), Goldberg 1991, Higham 2002, Kahan 1965, Welford 1962.

## Decisions

- The models compute every number; bindings.cjs carries 106 of them into the prose and diagrams, and tests/models.cjs re-derives the key ones by an independent route (Math.fround loops, a hand-written BF16 rounder, Float32Array).
- Two rounding engines. An exact BigInt rational engine handles encoding. A fast double + TwoSum engine runs the simulations, including the power-of-two binade edge for directed modes. The test checks the fast engine against the exact one on 108,000 seeded operations: + and × and FMA, 4 modes, 6 formats.
- Variance and SQNR measure only the ordinary values. A whole-vector SQNR is dominated by the outliers' own energy.
- Finding kept honest: FMA barely improves a dot product. It is more accurate in only 45% of 1,000 seeds, and the mean error is 4.33e-6 vs 4.19e-6.
- Finding: under OCP MX §6.3, an outlier of 1000 in MXFP8 has scale 2 and is clamped from 500 to 448, so it is stored as 896. That is a 10% error on the block maximum, and it is the specified behaviour.
- The licence model assumes 256-bit code needs no licence (light AVX2). Downs measured heavy 256-bit code at 2.8 GHz; this is stated in the chapter's limit paragraph.
- ch11 FMA model: both cores are given 2 × 512-bit loads per cycle, which is Zen 5's figure (C&C), and the text says so. Zen 4's load width is not modelled.
- Prefill is ON. index.html carries Chinese only inside data-i18n* elements, aria-labels and title/meta; tests/models.cjs checks this.
- The frontier essay what-a-frontier-model-takes is an unregistered draft, so it is named in plain text rather than linked.

## Checked / not checked

- Checked by tests: format tables; encodings vs platform; engine equivalence; bindings; branches of every live sentence (driven in the browser); diagrams at 1280/390/320 (visible variant, ≥11 px, in bounds, no overlap); 48 px targets; overflow; reduced motion; keyboard.
- Reviewer: Claude Code (claude-opus-5-5), independent review 2026-11-16. Scope: every factual claim in zh and en
  read against the sources below; spot-checked against primary sources opened that day: OCP MX v1.0 PDF (§5.3 FP8
  must support SAT and OVF; FP6/FP4/INT8 must support clamping; §6.3 clamping; the seven contributors), arXiv
  2310.10537v3 Algorithm 1 (shared_exp = floor(log2 amax) − emax_elem; so 1000 → scale 2 → 448 → 896, as the test
  pins), Remke & Breuer (2009 GFLOPS 4 tiles / 502 with ZA0, single thread; the abstract's >2.3 TFLOPS is 2338
  GFLOPS aggregate over several threads; the paper infers M4 has two shared SME units, so the page no longer says
  "one core's matrix unit"), Downs 2020-01 (W-2104 3.2/2.8/2.4 GHz, ~10 µs halt (8–11), ~680 µs relax; light 256-bit
  causes no licence change), Downs 2020-08 Ice Lake (i5-1035G4: 3.7 → 3.6 GHz single core only; added to ch11),
  Chips and Cheese Zen 5 (9900X; register-only FMA ~5.7 GHz; heavy load/store dips to 4.7 GHz for ~a dozen ms; no
  fixed offsets). Bindings re-derived by hand: 0x3DCCCCCD, 2^17 s = 36.4 h with 15.625 ms steps, BF16 RU sum 14,848,
  0.1f×10⁴ = 999.9029, k = 140 → 10 bits, 150/127 halvings, E4M3 span 17.8, AMX 8,192 MACs, SME 256 MACs.
  Browser tests in zh and en at 1280/390/320, canvas sweep in both languages, and screenshots of all 13 diagrams and
  14 labs at 1280/320 in both languages, looked at by eye.
- Not verified from a primary source: the AVX10.2 rev 7.0 text (PDF not machine-readable here; the unverifiable quote
  "will be supported by all future processors" was removed); P3109 arXiv 2606.04028; Zen 5's 2×512-bit loads per
  cycle (Chips and Cheese only); Intel's 1,024 BF16 / 2,048 INT8 AMX ops per cycle (via Wikipedia). SVG label widths were budgeted for Chinese, and the narrow SVGs are 360 units wide, so the translator must keep diagram labels short (roughly ≤ 40 Latin characters on the narrow variants).
- The canvas sweep and the screenshots were reviewed by eye. Gaps: no independent reviewer; Zen 5's AVX-512 load width is taken from C&C without a second source; the M4 abstract says ">2.3 FP32 TFLOPS" while the body's single-core FMOPA figure, 2009 GFLOPS, is the one used. I did not reconcile which configuration the abstract means.

## Facts that will go stale

Agner table dates; the AVX10.2 revision (rev 7.0, April 2026) and which shipping chips support it; Lumex devices on the market; P3109 status; NVFP4 claims; RVA23 adoption; "Zen 5 has no fixed licence"; M4/SME figures. All sit in ch11 to ch13 and in models.js SRC.

## Template friction (first native essay)

1. No first-class "English pending" flag. The generated copy.en.js has no enStub, so a page-wide `meta.en: stub` string plus app.js logic stands in for one.
2. `[[slug]]` refs only resolve to live pages, so a sibling draft cannot be linked even as "coming soon".
3. Shape (b) static SVG cannot adapt to label length per language. Wide and narrow variants and a generator script (tools/diagrams.cjs) were needed, and label width budgets are invisible to the translator.
4. The build does not check keys that only app.js uses (`t('ch4.say.' + cls)`); tests/models.cjs does it instead.
5. Literal language-neutral text in partials (format names such as "FP32", "AVX-512" on radio labels; digits in SVG) is a grey area; the test whitelists it explicitly.
6. A table of numbers has to be either one key per cell or a generated partial. It is a generated static partial (figures/fmt-table.html, written by tools/diagrams-more.cjs from models.js).
7. Two labs in one chapter collide on `chN.model.title`, so `keys=chN.x` has to be used. That works, but nothing warns until a duplicate-key error.
8. `{.sum}` on a paragraph fails with "needs {#key}"; only .law/.take are implicit.
9. Very long numbers in prose (the 55-digit exact 0.1) overflow at 390 px unless the page sets overflow-wrap; this is a layout CSS concern.

Status after the template follow-up (2026-11-16, d54606f9; specs/site-template.md §3a, §7, §9a): 1 is page.json
`languages` (this page migrated); 3 is a build check of label room plus `--print-budgets` (the wide/narrow variants
stay page code); 4 is page.json `dynamicKeys` (declared here); 6 is page.json `generators` (tools/diagrams.cjs writes a
GENERATED header and `--check` reruns it). 2, 5, 7, 8 and 9 are written into §9a as guidance; the reviewer's
`--print-bindings` and REGISTRY-vs-front-matter items are build features too.

## Registration (2026-11-16)

- Essay commit b6dcadc4 (authored; English by Haiku). Registered in computing/systems after how-cores-share-memory in
  KNOWLEDGE_ESSAYS. Atlas: 13 concepts in the computing region, 21 hand-written edges (12 between chapters, 9 to or from
  the siblings the text links).
- One word, one owner: bare 浮点数 / floating point / IEEE 754 moved here (#ch1) from switches-that-compute #ch10, which keeps
  0.1 + 0.2, 浮点误差, rounding error and double vs float; #ch1 also takes 浮点, 浮点数格式 / floating point format; #ch3 四舍五入;
  #ch7 bare FP8, E4M3, E5M2; #ch8 bare FP4. how-a-gpu-computes #ch8 keeps "FP8 E4M3 E5M2", "FP4 格式", "FP8 formats".
  量化 still ties with where-money-comes-from #ch2 (量化宽松) and was left alone.
- Siblings now link here: how-a-gpu-computes ch1 (#ch9) and its ch8 take (#ch7, #ch8), how-a-cpu-runs-a-program ch11.e2 (#ch9)
  and ch12.links (page top), switches-that-compute ch10.see (#ch1).
- tests/models.cjs: exactly one provenance label (it is bilingual, so only that block is exempt from the no-Chinese check);
  #ch1 must own 浮点数 / IEEE 754 / floating point and switches must not.
- The frontier essay what-a-frontier-model-takes is still a draft; ch14 names it in plain text until it is registered.
