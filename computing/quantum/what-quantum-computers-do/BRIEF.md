# What quantum computers can actually do (量子计算机到底能做什么)

- Built-By: Claude Code (claude-opus-5-5)
- Verified-By: self-check (node and browser tests, canvas sweep, screenshots at 1280/390/320, zh; English copy not written)
- Path: `computing/quantum/what-quantum-computers-do/`. Category `computing`, new subtopic `quantum` (量子计算 / Quantum Computing). Stage: university.
- Files: `index.html`, `models.js` (simulator and every model, no DOM), `app.js` (wiring and drawing), `copy.zh.js` (all text). `copy.en.js` is not written; the page falls back to Chinese.

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
    - Limits: A = 0.1 and p_th = 1% are textbook-style round numbers (Fowler et al. 2012), not fitted to a device.
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
- Advantage claims:
  - Sycamore
  - Willow RCS
  - Quantum Echoes
  - D-Wave
- Resource estimates:
  - RSA 2019, 2025 and 2026
  - ECC 2026
  - FeMoco 2020 and 2025
- Cryptography standards: FIPS 203–205, HQC, IR 8547.

The prose also states "today's best machines have about a hundred high-quality physical qubits" (ch11, ch12) and "browsers have defaulted to hybrid post-quantum key exchange since 2024" (ch12). Re-check these yearly.

## Checked / not checked

- **Checked:**
  - `tests/models.cjs`: 329 checks. It pins every number in the prose to the model and checks that copy.zh.js still states each number. It also checks the simulator identities, that every frontier card placeholder is filled from data, and that every Shor failure branch is reachable.
  - `tests/browser.cjs`:
    - zh/en at 1280, 390 and 320: no overflow or clipped text; all targets ≥ 48 px;
    - the language toggle, including the case with no copy.en.js;
    - every model driven to the numbers the prose quotes;
    - reduced motion.
  - Canvas text sweep.
  - Screenshots looked at in zh at 1280/390/320, plus reduced motion.
- **Not checked:**
  - English copy, which does not exist yet.
  - The sources listed above as "from memory", "trade press only" or "press release only".
  - Willow's spec-sheet T1 (the PDF fonts were unreadable; the blog figure is used instead).

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
