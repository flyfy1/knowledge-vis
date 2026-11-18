# BRIEF · how-much-a-wire-can-carry 一根线到底能传多少信息

- Built-By: Claude Code (claude-opus-5-5), essay batch 2026-11-11 (deep track)
- Verified-By: self-check (node model test, browser test at 1280/390/320 with every live-sentence branch, canvas sweep, screenshots at 1280/390/320, re-read top to bottom); no independent review yet (pending)
- category `tech`, subtopic `networks` (网络与通信 / Networks & Communication; proposed, to match the sibling essay `tech/networks/how-a-web-page-arrives/`), stage `university`
- Format: one long interactive essay (`/tmp/agent-tasks/standard/STANDARD.md`, deep track). No `lesson-shell.js`, no provenance label (the integrator adds it once a commit exists).
- Files: `index.html` (markup + styles), `copy.zh.js` (all visible text, plus the `frontier` data block), `models.js` (pure models, UMD, `window.WireModels`), `corpus.js` (the text corpus), `app.js` (wiring, drawing, i18n, IntersectionObserver gating, time-sliced work), `tests/models.cjs`, `tests/browser.cjs`. `copy.en.js` is loaded if it exists; a 404 is harmless and every key falls back to zh.

## The one question

How many bits per second can a wire (a cable, a fibre, the air between a phone and a mast) carry, is there a limit nobody can pass, and how did we get so close to it? Shannon's answer: there is a limit (the capacity), it can be computed, and below it errors can be made as rare as you like. The essay climbs from "how many bits is a surprise" to the codes and antennas in 5G, Wi-Fi 7 and fibre records.

## Chapters (law · model · standard result implemented)

Part 1 — information
1. **意外有多少比特** `#ch1`. −log₂p and entropy. Models: Shannon's guessing game (reader guesses letters; Shannon 1951 upper/lower bounds from the rank distribution, eqs. 17–18) against a machine guesser (order-4 Witten–Bell model trained on 85 % of the book); n-gram ladder 0–6 with held-out cross-entropy vs in-sample conditional entropy and a training-size slider.
2. **压缩有一个底** `#ch2`. Source coding theorem H ≤ L̄ < H + 1. Models: Huffman on the reader's own text (any Unicode), integer arithmetic coder (Witten–Neal–Cleary 1987) with a round-trip check; biased coin: block Huffman vs arithmetic coding of 2000 seeded flips.
3. **压缩就是预测** `#ch3`. Code length = cross-entropy. Models: adaptive order-k Witten–Bell model driving the arithmetic coder, cold vs pre-trained, on 10,000 letters of English or of seeded random letters (encode + decode every bar); pigeonhole counting bound.

Part 2 — channels
4. **噪声会翻转比特** `#ch4`. BSC: I(X;Y) = H(Y) − H(p), C = 1 − H(p). Seeded 64-bit batches.
5. **带宽和信噪比** `#ch5`. Shannon–Hartley; power-limited limit P/(N₀ ln 2). Friis link budget with the Voyager 2 1996 design control table (DESCANSO vol. 4, table 5-3): Pr/N₀ and (P/N₀)/ln 2 versus distance.
6. **香农定理最惊人的那半句** `#ch6`. Repetition codes (exact binomial tail + 20,000-trial simulation) and Hamming (7,4) against C; Eb/N₀ ≥ (2^η − 1)/η → −1.59 dB, with uncoded square QAM at BER 10⁻⁵ and the page's own codes from ch9.

Part 3 — codes
7. **汉明码** `#ch7`. Parity-check matrix with columns 1…7, syndrome decoding, d = 3, perfect code.
8. **里德–所罗门** `#ch8`. GF(16) with x⁴ + x + 1; RS(15, 9) as an evaluation code; erasures + errors decoded by Berlekamp–Welch (linear system over GF(16)); 2e + s ≤ 6.
9. **逼近极限** `#ch9`. LLRs, Tanner graph, sum-product belief propagation (32-bit demo, step by step, plus a 1024-bit trace); seeded Monte Carlo BER waterfall: uncoded BPSK, K = 7 (171,133) convolutional code with soft Viterbi, rate-1/2 LDPC (n = 256/1024/4096) with BP; BI-AWGN limit 0.187 dB.
10. **极化码** `#ch10`. Arıkan polarisation on the BEC, z → 2z − z², z².

Part 4 — putting bits on waves
11. **调制** `#ch11`. Square M-QAM, simulated and exact SER; adaptive modulation and coding on a Clarke/Jakes Rayleigh channel with the 3GPP TS 38.214 CQI table 4 and outer-loop link adaptation (OLLA) holding BLER at 10 %.
12. **多根天线** `#ch12`. MIMO capacity log₂det(I + SNR/nₜ·HHᴴ), i.i.d. Rayleigh H, eigenvalues by Jacobi on the real 2n embedding, 200 seeded draws.
13. **前沿在哪里** `#ch13`. Gap-to-capacity bars (Chung et al. 2001, Turbo 1993, this page's runs) and the dated frontier list, each item tagged 已确立 / 已演示 / 说法 / 未解决.
14. **读懂一张规格表** `#ch14`. Shannon-bound checker for any (bandwidth, streams, SNR, claimed rate) with three presets.

## Models: tuned rather than sourced

- AMC gap Γ = 2 dB above Shannon per CQI entry (the standard only requires BLER ≤ 10 %); OLLA step +0.5 dB on failure, −0.5·0.1/0.9 dB on success; threshold block-error model (fails iff SNR < requirement); 0.5 ms slots, 3.5 GHz, 24 Jakes sinusoids.
- LDPC construction: k = m, info columns of weight 3 placed at random (seed 2026) avoiding 4-cycles; parity part = one weight-3 column (rows 0, m/2, m−1) + dual diagonal (802.11n / NR-like). No degree optimisation.
- Corpus split 85 % / 15 % at a word boundary; n-gram smoothing Witten–Bell; machine guesser order 4.
- BER plan: stop at 40 frame errors or 10⁶ information bits; points after the first zero-error point are skipped; 1e-4 crossing by log-linear interpolation (a zero-error point counts as 1/bits).
- All seeds are in `models.js` (`SEEDS`, `berPlan`).

## Numbers pinned by tests (tests/models.cjs derives each from models.js and checks the prose says it)

H(default 306 letters) 3.955 / Huffman 4.000; coin p = 0.1: 0.469 / 1.000 / 0.468 (936 bits); best n-gram 2.00 (order 4), 2.67 at 10 % (order 3); adaptive k = 3 2.599 cold / 2.007 warm; C(0.1) = 0.531; 20 MHz at 20 dB 133.16 / 153.02 / 226.90 Mbit/s; Voyager 1996 39.86 dB·Hz, 13.97 kbit/s; 173 AU 1.10 kbit/s; repetition 2.8 %, 1.6×10⁻⁷; QPSK gap 7.83 dB; Hamming 8.7×10⁻⁴; LDPC n = 1024: 1.5×10⁻³ at 2 dB, 9.3×10⁻⁵ at 2.5 dB, 10⁻⁴ at 2.49 dB (2.30 dB from the limit); n = 4096 3.0×10⁻⁴ at 1.75 dB; conv 3.2×10⁻⁴ at 3 dB, 10⁻⁴ at 3.42 dB; uncoded 8.40 dB; polar 37.3 % / 48.1 %; QAM 10.3 / 24.0 / 36.1 / 42.2 dB; AMC 4.25 vs 5.77, 2.61 at 30 km/h; MIMO 21.98 / 5.86, +3.72 / +0.97 per 3 dB; spec bounds 64.6 Gbit/s, 27.1 / 36.1 dB.
Statistical checks (4 standard errors from the trial count): uncoded BER vs Q(√(2Eb/N₀)) at every point; convolutional BER under the union bound (d = 10…18 spectrum 36, 211, 1404, 11633, 77433); LDPC frame error rate from two independent seeds; repetition and QAM simulations vs exact.

## Sources (opened 2026-11-11 unless stated)

| What | Source |
| --- | --- |
| Corpus | Project Gutenberg #11, https://www.gutenberg.org/cache/epub/11/pg11.txt |
| Shannon 1951 bounds | https://sites.socsci.uci.edu/~rfutrell/teaching/itl-davis/readings/shannon1951prediction.pdf (BSTJ 30:50–64) |
| Voyager link budget | Ludwig & Taylor, DESCANSO vol. 4, https://descanso.jpl.nasa.gov/DPSummary/Descanso4--Voyager_new.pdf (table 5-3) |
| Voyager 1 at one light-day | EarthSky, https://earthsky.org/space/voyager-1-1-light-day-from-earth-november-17-18-2026/ (secondary; NASA page not opened) |
| 5G NR coding, CQI table | 3GPP TS 38.212 V19.4.0 and TS 38.214 V19.5.0 via https://www.etsi.org/deliver/etsi_ts/138200_138299/ (PDFs read) |
| Wi-Fi 7 | arXiv:2309.15951 v3; https://www.wi-fi.org/discover-wi-fi/wi-fi-certified-7; HPE Aruba rate tables https://arubanetworking.hpe.com/techdocs/aos/wifi-design-deploy/generations/wifi7/feature-benefit/ ; IEEE 802.11 list https://grouper.ieee.org/groups/802/11/email/stds-802-11-tgbh/msg00847.html |
| 4096-QAM EVM −38 dB | Rohde & Schwarz https://rohde-schwarz.com/fi/_56279-1432384.html ; rfwireless-world (search results; not opened in full) |
| DVB-S2 0.7–1 dB | https://en.wikipedia.org/wiki/DVB-S2 and R&S (secondary; EN 302 307-1 text not opened) |
| Coherent optics | https://gazettabyte.com/tag/wavelogic-6-extreme ; https://fierce-network.com/telecom/ciena-packs-16tbps-wavelogic-6-coherent-optics (Ciena blog returned 403) |
| Fibre records | NICT https://www.nict.go.jp/en/press/2023/11/30-1.html , https://www.nict.go.jp/en/press/2025/05/29-1.html , https://origin-www.nict.go.jp/en/press/2026/06/01-1.html |
| Nonlinear Shannon limit | Essiambre et al. 2010 (ADS https://ui.adsabs.harvard.edu/abs/2010JLwT...28..662E ); Kramer, Yousefi, Kschischang https://arxiv.org/abs/1503.07652 |
| IMT-2030 | https://techblog.comsoc.org/2024/07/06/itu-r-imt-2030-6g-backgrounder-and-envisioned-capabilities/ ; ISPreview (ITU PDF download failed) |
| 6G Release 21 | https://www.ericsson.com/en/blog/2026/6/6g-standardization-key-milestones-and-ran-decisions ; Qualcomm https://www.qualcomm.com/news/onq/2026/06/6g-standardization-release-21-milestones (search result) |
| Wi-Fi 8 | https://techblog.comsoc.org/2026/10/30/intel-and-broadcom-demonstrate-ieee-802-11bn-wi-fi-8-interoperability/ (search result); Samsung Research blog |
| LLM compression | https://arxiv.org/abs/2309.10668 |
| Hutter Prize | http://prize.hutter1.net/ (certificate expired; fetched with curl -k) |
| JPEG AI | https://www.iso.org/standard/88911.html ; https://jpeg.org/items/20230822_press.html |
| SoundStream | https://arxiv.org/abs/2107.03312 |
| DNA Fountain | Science 355:950 (Europe PMC record for PMID 28254941); https://www.sciencedaily.com/releases/2017/03/170302143947.htm |
| Biomemory | https://www.techradar.com/pro/we-intend-to-launch-our-first-end-to-end-commercial-dna-data-storage-solutions-before-the-end-of-2026-biomemory-outlines-its-dna-storage-roadmap-after-catalog-deal (headline seen in search) |
| Chung et al. 2001, Berrou 1993 | EPFL record https://infoscience.epfl.ch/record/95797 ; TU Berlin LNTwww and JPL TDA 42-120 summaries (secondary) |

## Facts that will go stale

Every item in the `frontier` array of `copy.zh.js` (19 items), with the sources above: NR coding (TS 38.212 V19.4.0, 2026-07), CQI table 4 (TS 38.214 V19.5.0, 2026-09), Wi-Fi 7 rates and dates, EVM, DVB-S2, coherent optics, fibre records (22.9 Pb/s 2023; 1.02 Pb/s × 1808 km 2025; 450 Tb/s over deployed SMF 2026), nonlinear limit, IMT-2030, Release 21 timeline, Wi-Fi 8 status, LLM compression, Hutter Prize record (as of 2026-07-24), JPEG AI, SoundStream, DNA Fountain, Biomemory. Also in prose: Voyager 1 reaches one light-day about 2026-11-18 (ch5.p5).

## Checked / not checked

- Checked against primary sources: TS 38.212/38.214 tables, the Voyager DCT, Shannon 1951 (0.6–1.3 bits at N = 100), NICT press releases, arXiv papers (LLM compression, Wi-Fi 7 overview, SoundStream, Kramer et al.), Hutter Prize page.
- Secondary only (labelled as such above): ITU-R M.2160 numbers, DVB-S2 gap, EVM limits, IEEE approval/publication dates, Chung 2001 and Berrou 1993 figures, Qualcomm/Wi-Fi 8/Biomemory items, Voyager light-day date.
- Not used because not verifiable from a primary source: a Chinese 3.2 Pb/s fibre claim; a DVB-S2X 256APSK gap figure; a coherent-optics gap in dB (only Ciena's "couple of dB" quote is given, as a claim).
- Not checked: the essay in English (no copy.en.js yet); performance on a real phone (desktop Chromium: the full BER run takes about 11 s on screen).

## Prerequisites the site lacks

Finite fields / modular arithmetic (ch8 introduces GF(16) in a paragraph); decibels and link budgets; mutual information and KL divergence beyond the entropy page's step 5; SVD (ch12 uses eigenvalues of HHᴴ); Gaussian noise and Q-function; fading channels.
