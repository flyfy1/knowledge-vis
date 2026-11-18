# What quantum computers can actually do (量子计算机到底能做什么)

- Built-By: Claude Code (claude-opus-5-5)
- Verified-By: self-check (node and browser tests, canvas sweep, screenshots at 1280/390/320, zh; English copy not written)
- Finishing pass 2026-11-18: Claude Code (claude-fable-5-2), self-check only: sources re-opened, models re-derived by an independent script, ten static diagrams added, tests extended. Still needs translation and an independent review. See "Finishing pass (2026-11-18)" below; where that section and the older text disagree, that section is right.
- Verified-By: Claude Code (claude-fable-5-2), independent review 2026-11-18, INTERRUPTED before completion (budget). Scope actually covered: Chinese page read top to bottom as rendered at 1280; all models re-derived with independent scripts, including an exact density-matrix noisy Grover; primary sources opened for the facts listed in `specs/reviews/what-quantum-computers-do-review-20261118.md`; English copy read in full and corrected in the copy file; `tests/models.cjs` passing (462 checks). NOT covered: the English page in a browser after the fixes, six English diagram label overlaps the browser test reports, layout at 390/320, keyboard/focus/reduced motion, the canvas sweep. See "Independent review (2026-11-18)" below.
- Path: `computing/quantum/what-quantum-computers-do/`. Category `computing`, new subtopic `quantum` (量子计算 / Quantum Computing). Stage: university.
- Files: `index.html`, `models.js` (simulator and every model, no DOM), `app.js` (wiring, drawing and the static diagrams), `copy.zh.js` (all text, including `dg.*` diagram labels). `copy.en.js` is not written; the page falls back to Chinese.

## The one question

What can a quantum computer do that an ordinary one cannot? The answer the page builds: it uses interference to collect amplitude on right answers. That gives exponential speed-ups only on a few structured problems: factoring and discrete logarithms, and simulating quantum systems. Search gets a quadratic speed-up, which rarely pays off in practice. Nothing is known to give a general speed-up on NP-complete problems. None of the useful algorithms run until error correction turns about 10⁻³ physical errors into about 10⁻¹² logical ones.

## The simulator (`models.js` → `QCModels.sim`)

- State vector with complex amplitudes (two Float64Arrays), up to 10 qubits, little-endian qubit order.
- Gates: single-qubit 2×2 gates, controlled gates via a control mask, CNOT, controlled phase, SWAP, multi-controlled Z, and permutations for reversible oracles.
- QFT and inverse QFT built from H and controlled phases.
- Born-rule measurement and sampling.
- Noise is Monte Carlo quantum trajectories: random Pauli errors (depolarising) or Z errors (dephasing), with a seeded mulberry32 RNG.
- Checked against:
  - the DFT matrix (error < 1e-12);
  - norm conservation;
  - HZH = X;
  - the Bell state;
  - the depolarising and dephasing channels' closed forms (20 000 trajectories, ±0.02).

## Chapters: law, model, standard result, limits

1. **One qubit.**
   - Model: Bloch sphere; measure along Z, X or Y; shots.
   - Result: Born rule, P(0) = cos²(θ/2) (75% at θ = 60°); the phase φ is invisible to Z.
   - Limits: pure states only, no mixed states.
2. **Interference.**
   - Model: Mach–Zehnder interferometer with phase φ and a "peek" probability.
   - Result: P(D0) = cos²(φ/2); visibility = 1 − peek; a full peek gives 50/50 at every φ.
   - Limits: the peek is modelled as dephasing, not a specific detector.
3. **Entanglement.**
   - Model: CHSH game on a Bell pair with four angle sliders; a classical mode plays the best deterministic strategy.
   - Result: the classical optimum is 0.75 (all 16 deterministic strategies enumerated); the quantum optimum is cos²(π/8) = 85.4%, so S = 2√2; Bob's marginal is exactly 50% (no-signalling).
   - Limits: ideal pair, no detector loopholes.
4. **2ⁿ amplitudes.**
   - Model: memory of 16·2ⁿ bytes; a random 10-qubit state measured once.
   - Result: Holevo bound (n qubits yield at most n classical bits).
   - Limits: memory is counted for a dense double-precision state vector only (no tensor-network tricks); this is said in the text.
5. **Deutsch–Jozsa.**
   - Model: n = 3 with six promise functions, shown stage by stage, plus a classical query grid.
   - Result: one query decides; the classical worst case is 2ⁿ⁻¹ + 1 = 5.
   - Limits: an oracle problem, with no practical use (said in the text).
6. **Grover.**
   - Model: n = 2 to 10, any marked item, step or run.
   - Result: P = sin²((2k+1)θ) with sin θ = 1/√N; k_opt = ⌊π/(4θ)⌋. The simulator matches the formula to 1e-10 for n = 3, 6, 8 and 10.
   - Limits: one marked item.
7. **Shor.**
   - Model: N = 15 or 21, every coprime a, counting register t up to 10 qubits in total. Uses the real modular-exponentiation permutation, the inverse QFT, then continued fractions and a gcd.
   - Results:
     - N = 15, a = 7, t = 4: r = 4, success 50% per run.
     - N = 21, a = 2, t = 5: r = 6, success 23%.
     - GNFS L[1/3, (64/9)^{1/3}] scaled from RSA-250 gives about 6×10¹⁴ core-years for RSA-2048.
   - Limits:
     - toy sizes;
     - the GNFS extrapolation ignores the o(1) term (said in the text);
     - every failure branch (y = 0, no period found, odd r, a^{r/2} ≡ −1, trivial factor) is reachable and has its own sentence.
8. **Complexity.**
   - Model: Grover vs brute force with step rates R_c and R_q.
   - Result: √N* = (π/4)·R_c/R_q and t* = (π/4)²·R_c/R_q² (Babbush et al. 2021). Defaults give N* ≈ 6×10¹³ and about 17 h.
   - Limits: the default rates are illustrative (tuned); BQP vs NP is stated as belief, not proof.
9. **Noise.**
   - Model: Grover with per-qubit, per-layer depolarising or dephasing noise, 200 trajectories, seed 1, n = 3 to 8, p = 0 to 3%.
   - Result: expected errors ≈ n(1 + 6k)p. At n = 6 and p = 0.5%: 1.1 errors, best success about 47% at k = 5 (ideal 99.7% at k = 6).
   - Limits: uniform error per qubit per layer; the multi-controlled Z counts as one layer (it would decompose into many gates); T1/T2 are discussed, not simulated separately.
10. **Error correction.**
    - Models:
      - A: 3-qubit bit-flip code with X or Z errors, syndrome and correction, on the simulator.
      - B: logical error rate 3p² − 2p³ against a 2000-round Monte Carlo (seed 7); break-even at 50%.
      - C: surface-code scaling p_L = 0.1·(p/p_th)^{(d+1)/2} with p_th = 1% and 2d² − 1 qubits.
    - Results: 10% becomes 2.8%; reaching 10⁻¹² needs d = 23 (1057 qubits) at p = 0.1%, or d = 11 (241 qubits) at 0.01%.
    - Limits: A = 0.1 and p_th = 1% are the round numbers resource estimates use (form: Fowler et al. 2012), not fitted to a device.
11. **Frontier.**
    - Model: Λ extrapolation from Willow's measured d = 7 point, ε_d = ε₇ / Λ^{(d−7)/2}.
    - Results:
      - ε₇ = 0.143%/cycle and Λ = 2.14: 10⁻⁶ needs d = 27 (1457 qubits); 10⁻¹² needs d = 63 (7937).
      - Λ = 4 gives d = 39.
    - Dated cards follow, sorted into demonstrated / claimed / contested / estimate / standard.
    - Limits: assumes Λ stays constant with d; Google notes that correlated errors may set a floor.
12. **Ending.** Five questions for reading quantum news, and what to do about post-quantum migration now.

Figures of merit used throughout: physical qubit count, two-qubit gate error, coherence time (T1/T2), logical error per cycle, the suppression factor Λ, and the physical-per-logical overhead (2d² − 1).

## Sources (opened 2026-11-11 unless marked; blog and press-release URLs are not recorded, only their publisher and date)

### Textbook results

- Nielsen & Chuang, *Quantum Computation and Quantum Information*, ch. 1, 4, 5, 6, 8 and 10 (from memory).
- Clauser–Horne–Shimony–Holt 1969.
- Deutsch–Jozsa 1992.
- Grover 1996; Bennett et al. 1997.
- Shor 1994.
- Fowler et al., PRA 86, 032324 (2012).
- Babbush et al., PRX Quantum 2, 010103 (2021) — https://arxiv.org/abs/2011.04149

### Frontier

- Willow (Google Quantum AI):
  - https://arxiv.org/abs/2408.13687 (Nature 638, 920, 2025)
  - Google blog post of 2024-12-09 (T1 "approaching 100 µs"; RCS 5 min vs 10²⁵ years)
- Helios (Ransford et al.): https://arxiv.org/abs/2511.05465. Its Nature publication was seen only in trade press.
- IonQ press release, 2025-10-21 (99.99% two-qubit fidelity): ionq.com news page. No paper.
- Caltech 6100-atom array (Manetsch et al.): https://arxiv.org/abs/2403.12021 (Nature 647, 60, 2025).
- Harvard/QuEra (Bluvstein et al.): https://arxiv.org/abs/2506.20661
- Quantinuum press release, 2026-10-19: quantinuum.com news page. Press release only.
- Microsoft Majorana 1 (Nature 638, 651, 2025) and its editorial note: seen via https://physics.aps.org/articles/v18/68 and secondary reports.
- IBM Starling roadmap, 2025-06-10: IBM Quantum blog
- Sycamore (Arute et al., Nature 574, 505, 2019); the rebuttals by Pednault et al. (arXiv:1910.09534) and Pan, Chen & Zhang (PRL 129, 090502, 2022) are from memory.
- Quantum Echoes, Google blog 2025-10-22: Google blog post
- D-Wave:
  - King et al., Science 388, 199 (2025);
  - rebuttal by Tindall et al.: https://arxiv.org/abs/2503.05693 (Science 392, 868, 2026).
- RSA resource estimates:
  - Gidney & Ekerå, Quantum 5, 433 (2021): https://arxiv.org/abs/1905.09749
  - Gidney 2025: https://arxiv.org/abs/2505.15917
  - Webster et al. (Pinnacle, preprint): https://arxiv.org/abs/2602.11457
  - Babbush et al. 2026 (ECC): https://arxiv.org/abs/2603.28846
- FeMoco: Lee et al., PRX Quantum 2, 030305 (https://arxiv.org/abs/2011.03494); Low et al. https://arxiv.org/abs/2502.15882
- NIST:
  - FIPS 203/204/205 (2024-08);
  - HQC selection (2025-03);
  - IR 8547 final (2026-10; deprecate 2030, disallow 2035): https://csrc.nist.gov/pubs/ir/8547/final (PDF text checked).
- RSA-250 (Boudot et al., 2020-02, about 2700 core-years) and Häner & Steiger SC17 (45 qubits, 0.5 PB) are from memory.

## Facts that will go stale

Everything in `FRONTIER` in `models.js` (marked `reviewed: '2026-11'`). Each item carries its own `asOf` month and is rendered on a card with that date:

- Hardware:
  - Willow
  - Helios
  - IonQ
  - Caltech array
  - Harvard/QuEra
  - Quantinuum logical-qubit claim
  - Majorana
  - IBM 2029 roadmap
- Classical records quoted in ch4 and ch7: `sim45`, `sim50` (50-qubit simulation), `rsa250`, `rsa260`.
- Advantage claims:
  - Sycamore
  - Willow RCS
  - Quantum Echoes
  - D-Wave
- Resource estimates:
  - RSA 2019, 2025 and 2026 (Pinnacle), and the 2026 cat-qubit estimate
  - ECC 2026
  - FeMoco 2020 and 2025
- Cryptography standards: FIPS 203–205, HQC, IR 8547.

The prose also states "today's best machines have about a hundred high-quality physical qubits" (ch11, ch12) and "browsers have defaulted to hybrid post-quantum key exchange since 2024" (ch12). Re-check these yearly.

## Finishing pass (2026-11-18)

All URLs below were opened on 2026-11-18 unless marked "search result only" (seen in a web-search summary, page not opened).

### The three numbers written from memory, and the other "from memory" items

| Item | Outcome | Source |
|---|---|---|
| RSA-250: 829 bits, Feb 2020, about 2700 core-years | Confirmed, but it is **no longer the record**. RSA-260 (862 bits) was reported factored on GPUs on 2026-09-03 (Cognition blog, no paper). The page now calls RSA-250 "the largest factorisation with a full paper and cost accounting", keeps it as the anchor of the GNFS extrapolation, and adds one sentence on RSA-260 (2.6× harder by the same formula, pinned). RSA-896 (reported 2026-09-19) is left off the page: secondary reports only. | RSA-250 figures: search results quoting Boudot et al. and https://members.loria.fr/PZimmermann/records/factor.html (lists RSA-250 as the latest; page not updated for 2026). RSA-260: https://cognition.com/blog/factoring-rsa-260 (search result only), Wikipedia "Integer factorization records", postquantum.com. |
| Häner & Steiger: 45 qubits, 0.5 PB (SC17) | Confirmed as a 2017 result, but the page was **wrong to call it the largest**. Record: 50 qubits on JUPITER, each amplitude compressed to 2 bytes (about 2 PB instead of 18 PB); the previous record was 48 qubits (2019). ch4 prose, the live sentence (three branches: ≤ 29, ≤ 50, > 50) and the chart label were rewritten; `FRONTIER.sim50` added. | https://arxiv.org/abs/2511.03359 (search result: abstract and press coverage; FZ Jülich press release 2026-05-11) |
| Sycamore rebuttals: IBM 2.5 days; 512 GPUs, 15 hours | Confirmed. | Pan, Chen, Zhang: https://arxiv.org/abs/2111.03011 (PRL 129, 090502; "512 GPUs", "15 hours", 53 qubits, 20 cycles). Pednault et al. arXiv:1910.09534 not re-opened (2.5 days is the abstract's well-known figure). |
| Nielsen & Chuang chapters | Not opened. The models were re-derived instead (next section). | |

### Press-release-only and trade-press-only items

| Item | Outcome | Source |
|---|---|---|
| Willow T1 "approaching 100 µs" (blog) | **Corrected.** Spec sheet: the QEC chip has mean T1 = 68 µs and CZ error 0.33%; 98 µs belongs to the RCS chip. Card now gives 68 µs and 0.33% and says the distance-7 code used 101 of the 105 qubits. | Abstract: https://arxiv.org/abs/2408.13687 (Λ = 2.14 ± 0.02, 0.143% ± 0.003%, 101 qubits, 2.4 ± 0.3, 1.1 µs). Spec sheet https://quantumai.google/static/site-assets/downloads/willow-spec-sheet.pdf: search result only. |
| Helios in Nature | Confirmed: Nature, 2026-06-17, doi:10.1038/s41586-026-10676-4. Figures match the arXiv abstract. | https://arxiv.org/abs/2511.05465 ; Nature Asia press release and The Quantum Insider 2026-06-18 (search results) |
| IonQ 99.99% (press release, "no paper") | **Corrected.** There is a preprint (arXiv:2510.17286, IonQ and Oxford Ionics authors): estimated error 8.4(7)×10⁻⁵. No journal version found. Card stays "厂商声称", now says it is a single-gate figure and not a whole-machine average. | https://arxiv.org/abs/2510.17286 and APS meeting abstracts (search results) |
| Caltech 6100 atoms, 12.6 s | Confirmed; the abstract reports no two-qubit gates. | https://arxiv.org/abs/2403.12021 (Nature 647, 60–67) |
| Harvard/QuEra, 448 atoms, 2.14 | Confirmed: "2.14(13)x below-threshold performance". The draft's reading "from distance 3 to 5" was not checked against the full text (the PDF is too large to fetch), so the card now only says "the paper's suppression factor is 2.14 ± 0.13" and notes that the match with Willow's Λ is a coincidence. Published in Nature (doi:10.1038/s41586-025-09848-5). | https://arxiv.org/abs/2506.20661 |
| Quantinuum 2026-10-19 logical fidelity | Still a vendor claim; no paper found. Card now adds the factor 12 per distance step, the company's "100× better than other platforms" as its claim, and that press coverage describes it as a logical-memory result. | https://thequantuminsider.com/2026/10/19/quantinuum-reports-a-10x-reduction-in-logical-error-rate-on-helios/ ; eWeek and HPCwire (search results). The company page was not opened. |
| Majorana 1 editorial note | Confirmed through APS Physics and news reports; the Nature page itself was not opened. Added: June 2026 Matters Arising (Legg) and Microsoft's reply, from news reports only. | https://physics.aps.org/articles/v18/68 and Computerworld (search results) |
| IBM Starling 2029 | Not re-opened at ibm.com; IEEE Spectrum and The Quantum Insider (2025-06-10) agree on 2029, 200 logical qubits, 10⁸ gates. Whether Kookaburra (planned for 2026) was delivered: not found. | search results only |
| Quantum Echoes | **Corrected**: 65 of Willow's 105 qubits were used (the card said 105). Relabelled from "有争议" to "厂商声称": no successful classical reproduction was found; the one 2026 preprint on the classical side (arXiv:2604.15427, with Google authors: Villalonga's affiliation is from memory) argues an untested tensor-network method also fails. The draft's "rebuttal and counter-rebuttal preprints" could not be found and was removed. | https://research.google/blog/a-verifiable-quantum-advantage/ (search result), https://arxiv.org/abs/2604.15427 |
| D-Wave / Tindall et al. | Confirmed: Science 392, 868–872 (2026), doi:10.1126/science.adx2728. Added D-Wave's reply (2026-05-26, via Quantum Computing Report, search result). | https://arxiv.org/abs/2503.05693 |

### Other frontier facts re-checked

- Gidney 2025 (arXiv:2505.15917), Pinnacle (arXiv:2602.11457, v2 2026-05-05; assumes p = 10⁻³, 1 µs cycle, 10 µs reaction), Babbush et al. ECC (arXiv:2603.28846, v2 2026-04-15): abstracts opened, numbers confirmed.
- Low et al. (arXiv:2502.15882) is now published: PRX 15, 041016 (2025). "4 to 195 times" confirmed. The card no longer calls it a preprint.
- New card `rsaCat`: Alice & Bob, IACR ePrint 2026/2665 (2026-10-28), 22 593 cat qubits, 3.14 days, phase-flip 5×10⁻⁴, bit-flip time about 100 years. https://eprint.iacr.org/2026/2665 . Labelled as a vendor's preprint with much stronger assumptions.
- NIST IR 8547 final: https://csrc.nist.gov/pubs/ir/8547/final (final, 2026-10-27). PDF text extracted: "deprecate ... after 2030 and disallow its use under NIST standards and guidelines after 2035".
- Not re-opened: Gidney & Ekerå 2021, Lee et al. 2021 (FeMoco), Babbush et al. 2021, FIPS 203–205, HQC selection, King et al. 2025, Arute et al. 2019, the Chrome/Firefox hybrid key-exchange dates, Smolin–Smith–Vargo 2013, Bennett et al. 1997, Lloyd 1996.

### Model re-derivation

An independent Python script (direct formulas and a direct amplitude sum for Shor, no shared code) reproduced: Grover P(64, 6) = 0.99659, P(1024, 25) = 0.99946, P(1024, 50) = 0.00023; CHSH 0.85355 and 2√2; Shor peaks and success 0.5 (N = 15, a = 7, t = 4) and 0.2295 (N = 21, a = 2, t = 5); GNFS ratio 2.33×10¹¹ and 6.3×10¹⁴ core-years; 3p² − 2p³ = 0.028; surface d = 23 / 1057 and d = 11 / 241; Λ extrapolation d = 27, 63, 39; crossover 6.17×10¹³ and 17.1 h; memory 17.18 GB, 0.563 PB, 18.4 EB. No model was wrong. The noisy-Grover Monte Carlo was not re-implemented (the node test compares it with a larger independent seed).

One attribution was wrong: p_L = 0.1·(p/1%)^((d+1)/2) was credited to Fowler et al. 2012 alone. That paper gives the form; the constants 0.1 and 1% are the round values used in resource estimates (Fowler & Gidney, arXiv:1808.06709; Gidney & Ekerå). Footer, `models.js` comment and the model's "how" line changed ("资源估计里常用的近似"). The Fowler–Gidney attribution is from memory.

### Other changes

- Years in cards were printed with thousands separators ("2,029 年", "2,030 年后"): year values in `FRONTIER` are now strings; node and browser tests check it.
- "10<sup>19.3</sup> 字节" (a format the brief forbids) is now "1.8×10<sup>19</sup> 字节".
- ch8: quantum simulation was tagged "已确立" over a sentence that only said "there is reason to believe"; it now states what is established (efficient simulation of general quantum dynamics, Lloyd 1996) and what is open. "唐乙宁" replaced by "Ewin Tang" and 2019 by 2018 (the Chinese name could not be confirmed).
- ch9: "整个电路就只能有几百步" → operations summed over all qubits.
- ch11: ion-trap gate time "微秒量级" → "几十到几百微秒"; dilution-fridge temperature reworded; "两比特门错误率千分之一以下（几种平台已经做到）" → trapped ions have, superconducting and neutral-atom machines are at a few per thousand (Willow CZ 0.33%; the neutral-atom figure is from memory).
- ch10 model B: the two curve labels sat on the curves at 320 px; moved to empty parts of the chart.
- Live sentences that were wrong at extreme or awkward settings (found by driving every control; each now has a test):
  - ch1: θ = 1° was reported as "every shot gives 0" (threshold 0.9995); the "certain" branch now needs an exact pole.
  - ch2: φ = 5° and 175° were reported as "all photons land on one detector"; that branch now needs exact cancellation.
  - ch3: a sample of 75.5% at a 75.0% setting was described as "did not exceed 75%"; the sentence now speaks about the theoretical rate and sampling noise.
  - ch8: equal step rates gave "they break even at N ≈ 0.62"; new branch `ch8.say.always` for a crossover below N = 2.
  - ch9: at n = 3, p = 3% a best success of 48.3% against a 12.5% guess was called "about the same as guessing"; the "washed out" branch now needs best < 3/N and < 10%.
  - ch10 B: p = 49% read "1/1.0 of the unencoded rate"; new branch `ch10.say.B.near`.
- Ten static diagrams (STANDARD §4a), drawn by `app.js` from `DG.<name>` specs into `<figure class="dia" data-dg="…">`, labels from `dg.*` keys, wide (720) and narrow (340) layouts:
  1. `bloch` (ch1) Bloch sphere with θ and φ; schematic.
  2. `mz` (ch2) interferometer and its H–P(φ)–H circuit; schematic.
  3. `chsh` (ch3) who sends what in the CHSH game; schematic.
  4. `amps` (ch4) 3 bits against 8 amplitudes; arrows are `memory.randomState(3, 4)`.
  5. `dj` (ch5) Deutsch–Jozsa circuit with the slider's stages 0–3.
  6. `grover` (ch6) rotation picture to scale for N = 64 (θ = 7.2°, 6 rounds, 93.3°; pinned).
  7. `shor` (ch7) classical / quantum / classical pipeline with the two registers; schematic.
  8. `noise` (ch9) error locations in one Grover round, 3 × 7 = 21 (pinned to `grover.LAYERS`).
  9. `surface` (ch10, inside the model card before model C) rotated surface codes d = 3 and d = 5, 17 and 49 qubits (pinned to `surface.qubits`).
  10. `gap` (ch11) physical-qubit counts on a log axis, values read from `FRONTIER`.
  ch8 and ch12 introduce no structure.

## Checked / not checked

- **Checked (2026-11-18):**
  - `tests/models.cjs`: 409 checks (was 329): the new prose numbers, the diagram numbers, that every `dg.*` key used in `app.js` exists, that `app.js` and `models.js` contain no Chinese.
  - `tests/browser.cjs`: as before, plus the diagram check from the live essays (role, aria-label, caption, labels non-empty, inside the drawing, no two labels overlapping, ≥ 11 px, wide layout at 1280 and narrow at 390/320, each diagram before its model), no year with a thousands separator, and the ch4 sentence at 50 and 51 qubits. `SHOT_DIR=…` writes a screenshot of every diagram and model card.
  - Canvas text sweep.
  - Screenshots of all ten diagrams and all eleven model cards looked at in zh at 1280/390/320.
  - Every live sentence read with each control at its extremes and at awkward middle values (script in the scratch directory, not kept in the repo).
- **Not checked:**
  - English copy, which does not exist yet. The `en` passes of the browser test run on the Chinese fallback.
  - Everything listed above as "search result only", "from memory" or "not re-opened".
  - The diagrams in English: label lengths were chosen with room to spare, but wrapping and overlap must be re-run once `copy.en.js` exists.

## Tuned (unsourced) parameters

- ch8 default rates: R_c = 10⁹/s, R_q = 10²/s.
- ch10 surface-code prefactor A = 0.1 and threshold p_th = 1%.
- ch9 noise model:
  - uniform per-qubit, per-layer errors;
  - the multi-controlled Z counts as one layer;
  - 200 trajectories with seed 1. The page's numbers are checked against an independent 2000-trajectory run, ±0.03.
- ch10 Monte Carlo: 2000 rounds, seed 7.
- Opening states: ch7 seed 702 (gives y = 4, a success); ch3 pre-plays 1000 rounds.

## Prerequisites the site lacks

- Tensor products and multi-qubit linear algebra.
- Bell inequalities.
- Modular arithmetic, gcd and Euclid.
- Continued fractions.
- Complexity classes (P, NP, BQP).
- Elliptic-curve cryptography.
- A public-key cryptography essay (`computing/systems/a-secret-in-public/` is in progress but not registered, so it is not linked).

## Independent review (2026-11-18, interrupted)

Full notes: `specs/reviews/what-quantum-computers-do-review-20261118.md`. Where this section and older text disagree, this section is right.

- **Model error fixed.** `surface.distanceFor` compared floating-point powers; at p = 0.1% every power-of-ten target is an exact tie, and 0.1·0.1^11 = 1.0000000000000006e-12 pushed the answer up one step. Reaching 10⁻¹² at p = 0.1% needs d = 21 (881 qubits), not d = 23 (1057). Model now compares in log10; ch10.p3, ch10.p4 ("a thousand physical qubits are just enough for one logical qubit"), both tests and both languages updated. Results lines above that say d = 23 / 1057 are superseded.
- **Noisy Grover re-implemented** exactly (density matrix, in `tests/models.cjs`): 48.2% at k = 5, 84.4%, 18.0% against the page's 200-trajectory 47%, 88%, 18%. ch9.limit now states the sampling error and the exact values.
- **Factoring records** now agree with `computing/systems/a-secret-in-public/`: RSA-260 (862 bits, 3 Sep 2026, Eric Lu, Cognition, with Devin), RSA-896 (896 bits, 19 Sep 2026, Stephen Weis, Anthropic, with Claude; the largest), RSA-270 (895 bits, 12 Nov 2026; not a record), compute self-reported, with the same disclosure sentence. Opened: saweis.net/posts/rsa-896.html, cognition.com/blog/factoring-rsa-260 (post dated 2026-09-09), en.wikipedia.org/wiki/RSA_numbers. `FRONTIER.rsa896`, `rsa270` added.
- **Quantum Echoes** relabelled `demo`: Google's published experiment; no independent replication, classical reproduction or published rebuttal found as of November 2026; the 13,000× figure is Google's estimate.
- **Other fact fixes:** `fr.ecc2026` author is Dan Boneh (arXiv:2603.28846 author list), circuits unpublished (zero-knowledge proof); Majorana statement is in the peer-review file, comment by Henry Legg; Quantinuum result has a company preprint (not opened); browsers sentence now names Chrome 124 and Firefox 132; ch5 law no longer says inputs go through "at once"; ch6 law says "on average".
- **Confirmed from sources opened today:** Lee et al. (4 million, under 4 days, 0.1%), Gidney–Ekerå, Gidney 2025, Pinnacle, ePrint 2026/2665, Willow abstract, Helios abstract and Nature publication, Bluvstein 448 / 2.14(13), IonQ 8.4(7)×10⁻⁵, Häner–Steiger, 50-qubit JUQCS (2 bytes per amplitude, 48-qubit predecessor), IBM gross code 288 and Starling blog, Tindall et al. in Science and D-Wave's reply, Fowler–Gidney Sec. XV formula p_L = 0.1(100p)^((d+1)/2), IR 8547 final status.
- **Not checked / not done:** see the review file. In short: the browser test currently FAILS on English diagram label overlaps (mz, chsh, shor, noise, gap); nothing after that run was verified in a browser; canvas sweep not run; IBM "2.5 days", the Willow spec sheet (68 µs, 0.33%), the IR 8547 2030/2035 wording, Lloyd 1996, Tang 2018 and the Firefox date were not confirmed from a primary source.
