# BRIEF · a-secret-in-public 当着所有人的面约定一个秘密

- Built-By: Claude Code (claude-opus-5-5), deep-essay batch 2026-11-11
- Verified-By: self-check (node model test, browser smoke test, canvas text sweep at 1280/390/320, screenshots at 1280/390/320 and reduced motion); not independently reviewed (pending)
- category `computing`, subtopic `systems` (系统与安全 / Systems & Security, existing), stage `university`
- Format: one long interactive essay, deep track (ladder from first principles to a dated frontier). No `lesson-shell.js`, no provenance label (the integrator adds it once a commit exists).
- Files: `index.html` (markup + styles), `copy.zh.js` (all visible text), `models.js` (pure models, UMD, BigInt), `app.js` (wiring, drawing, i18n, IntersectionObserver gating), `tests/models.cjs`, `tests/browser.cjs`, `REGISTRY.json`. `copy.en.js` is loaded if present; every key falls back to zh.
- **Safety:** every operation is real arithmetic on toy parameters, with no padding, a seeded RNG and no constant-time code. The page says twice (hero, ch11) that it must never be used to protect anything.

## The one question

How can two strangers agree on a secret while everyone listens? The answer climbs a ladder:
1. a one-way door (modular exponentiation and the discrete log);
2. Diffie–Hellman, which gives a shared key but not an identity;
3. signatures and certificates, which supply the identity;
4. "how secure" as a number (bits of security);
5. what a quantum computer breaks;
6. the replacement door (lattices and LWE);
7. where the field stands in Nov 2026.

## Chapters (model · standard result it implements · toy vs real)

1. **钥匙送不出去 / The key-distribution problem** (`#ch1`).
   - Model and result: pairwise keys C(n,2) against one key pair per person. Ten people need 45 keys; 100,000 people need 4,999,950,000.
2. **单向的门 / One-way functions** (`#ch2`).
   - Square-and-multiply: left-to-right binary exponentiation (Knuth TAOCP 2 §4.6.3), traced step by step for 4ˣ mod 2039. x = 327 takes 8 squarings and 4 multiplications to reach 1027.
   - The race: forward exponentiation against brute force (live, resumable, 8 ms per frame) and baby-step giant-step (Shanks; HAC Alg. 3.56).
     - Safe primes p = 2q + 1, with p the largest one below 2^bits; g = 4 generates the order-q subgroup.
     - Sizes run from 8 to 40 bits. Seed 1: at 20 bits x = 420,965 and BSGS takes 1,305 steps; at 40 bits BSGS takes 1,471,313.
   - Real size: 2048-bit groups (RFC 7919).
3. **Diffie–Hellman** (`#ch3`).
   - DH 1976 on p = 2039. Defaults a = 327 and b = 519 give the shared key 294.
   - Eve recovers it by BSGS in 42 steps.
   - With Mallory as man in the middle (secrets 101, 202), Alice ends with 60 and Bob with 212.
   - Real size: 2048-bit p costs about 2^117 by the GNFS formula.
4. **RSA** (`#ch4`).
   - RSA 1978 on primes 101–997, defaults 241 × 233 = 56,153 with e = 257 and d = 5,633. m = 100 encrypts to 16,748; its signature is 12,763.
   - Malleability: c·2^e decrypts to 2m.
   - Trial division factors n in 116 divisions.
   - Cube-root attack: a 512-bit n with e = 3. "MEET AT NOON" is 95 bits and its cube 283 bits, so no reduction happens; random padding (stand-in for OAEP) makes the integer 488 bits.
   - Real size: n ≥ 2048 bits (617 digits).
5. **椭圆曲线 / Elliptic curves** (`#ch5`).
   - Chord-and-tangent law over ℝ on y² = x³ − 2x + 2.
   - Over F_p on y² = x³ + 2x + 3, p from 13 to 251, skipping p = 2 and p = 3, where the curve is singular.
     - Double-and-add, with the point of largest order as G. At p = 97: N = 100, G = (0, 10) of order 50, and 23G = (49, 34) in 8 operations.
     - Hasse range 79–117 (Silverman III, V).
   - NIST SP 800-57 Pt 1 Rev 5, Table 2.
6. **签名与证书 / Signatures and certificates** (`#ch6`).
   - SHA-256 implemented per FIPS 180-4 and checked against the "", "abc" and 448-bit vectors.
   - Hash-then-sign with textbook RSA on seeded 512-bit keys. Chain: root → intermediate → shop.example.
   - Five tamper modes (as issued, rename, swap key, swap key and re-sign, self-made root); only the honest chain verifies.
   - TLS 1.3 handshake (RFC 8446) in four steps.
7. **安全位数 / Bits of security** (`#ch7`).
   - GNFS L[1/3, (64/9)^(1/3)] with o(1) dropped: 512 → 63.9, 1024 → 86.8, 2048 → 116.9, 3072 → 138.7, 7680 → 203.0 and 15360 → 269.4 bits.
     - It runs 5–13 bits above the NIST table (gaps 6.8 / 4.9 / 10.7 / 11.0 / 13.4).
   - Pollard rho √(π n/4).
   - Records: RSA-768 (2009), DLP-795 (2019), RSA-250 (2020), RSA-260 (2026), RSA-896 (2026).
8. **量子 / The quantum threat** (`#ch8`).
   - Shor's classical reduction (Nielsen & Chuang ch. 5): order by classical search, then the gcds. N = 143 with a = 2 gives r = 60, y = 12 and 11 × 13; 76 % of a succeed.
     - Every N on the slider gives ≥ 50 %, and all four branches occur (lucky / odd / N−1 / ok).
   - Grover (π/4)·2^(k/2): about 2^63.65 iterations for 128-bit keys, and the NIST 2^170/MAXDEPTH note.
   - Mosca's inequality x + y > z; the default (10 + 8 > 15) leaves 3 years exposed.
9. **格 / Lattices and LWE** (`#ch9`).
   - Good basis [[7,1],[−2,6]] against bad bases from unimodular column operations (k = 1..4); the determinant stays 44.
     - Babai rounding (1986) against exact CVP by enumeration. Hadamard ratio 0.99 → 0.13.
     - Babai success over 2000 targets: good 92 %, then k = 1..4 give 55 / 22 / 11 / 6 %.
   - Regev 2005 LWE with centred-binomial noise η, m = 4n, decryption threshold q/4, and Gaussian elimination mod q for Eve.
     - Default (n = 8, q = 97, η = 12, seed 3): 8 failures in 2000.
     - Per-key prediction 0.48 %, a normal approximation conditional on the key: mean Σe/2, variance Σe²/4, wrap-around counted. Its worst |z| against simulation is 2.88 over 168 settings.
   - ML-KEM (FIPS 203): ek = 384k + 32 and ct = 32(k·du + dv) give 800/768, 1184/1088 and 1568/1568 bytes.
10. **前沿 / Frontier, as of Nov 2026** (`#ch10`).
    - The frontier block in models.js has 19 dated items in four groups: standards, deployment, attacks and demonstrated results, estimates and claims.
    - Then a figures-of-merit table, four open questions, and one paragraph on ZK proofs and FHE (not built here).
11. **四个问题 / Four questions for reading crypto news** (`#ch11`). No model.

## Tuned (not sourced) parameters

- p = 2039 (DH, ch2a).
- Race sizes 8–40 bits and seed 1.
- RSA primes 101–997 and default 241/233.
- The e = 3 key seed 20261111 and padding seed 7.
- Curves y² = x³ − 2x + 2 (ℝ) and y² = x³ + 2x + 3 (F_p).
- Certificate key seeds 101/202/303/404.
- Lattice basis [[7,1],[−2,6]] and bad-basis rule.
- LWE grid n 4–32, η 1–24, q ∈ {97, 257, 3329}, m = 4n, 2000 trials, seed 3.
- Mosca defaults 10/8/15 (stated in the prose as not a prediction).
- 10^18 ops/s (stated as a rounded assumption).
- The quantum curve in ch7 is only the shape n³.

## Sources (opened 2026-11-11 unless noted)

**Textbooks and papers for the models:**
- Knuth TAOCP vol. 2 §4.6.3.
- Menezes, van Oorschot & Vanstone, Handbook of Applied Cryptography, Alg. 3.56.
- Diffie & Hellman 1976; Rivest, Shamir & Adleman 1978.
- Silverman, The Arithmetic of Elliptic Curves.
- Lenstra & Lenstra 1993; Crandall & Pomerance, *Prime Numbers* §6.2.
- Pollard 1978; Shor 1997; Grover 1996.
- Nielsen & Chuang ch. 5; Mosca 2018.
- Babai 1986; Regev 2009.
- Sorenson & Webster 2015 (deterministic Miller–Rabin bases).

**NIST standards and publications:**
- FIPS 180-4.
- FIPS 203/204/205: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf (and .204, .205).
- Publication date 13 Aug 2024: the FIPS 203 PDF and Cloudflare's write-up https://blog.cloudflare.com/nists-first-post-quantum-standards/
- SP 800-57 Pt 1 Rev 5 Table 2: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-57pt1r5.pdf
- HQC, 11 Mar 2025: https://www.nist.gov/news-events/news/2025/03/nist-selects-hqc-fifth-algorithm-post-quantum-encryption
- FIPS 206 presentation, 25 Sep 2025: https://csrc.nist.gov/presentations/2025/fips-206-fn-dsa-falcon
- Additional signatures round 3 (14 May 2026, NIST IR 8610): https://csrc.nist.gov/projects/pqc-dig-sig/round-3-additional-signatures and https://content.govdelivery.com/accounts/USNIST/bulletins/4171a96
- NIST IR 8547 final, 27 Oct 2026 (read in full from the PDF): https://csrc.nist.gov/pubs/ir/8547/final and https://nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8547.pdf
- NIST security categories (2^170/MAXDEPTH): https://csrc.nist.gov/projects/post-quantum-cryptography

**IETF and implementations:**
- RFC 10024 (Aug 2026), plus the tracker for draft-ietf-tls-ecdhe-mlkem: https://datatracker.ietf.org/doc/draft-ietf-tls-ecdhe-mlkem/
- RFC 8446, RFC 8017, RFC 7919.
- draft-cfrg-schwabe-kyber-04, Table 4 (failure probabilities): https://www.ietf.org/archive/id/draft-cfrg-schwabe-kyber-04.html
- Go crypto/mlkem constants: https://raw.githubusercontent.com/golang/go/master/src/crypto/mlkem/mlkem.go

**Deployment:**
- Cloudflare, 29 Sep 2026: https://blog.cloudflare.com/post-quantum-visibility/
- Cloudflare dev docs (updated 24 Jun 2026): https://developers.cloudflare.com/ssl/post-quantum-cryptography/pqc-support/
- Cloudflare pq-2024 (5 Mar 2024; sizes and speeds): https://blog.cloudflare.com/pq-2024
- Google Security Blog, 13 Sep 2024: https://security.googleblog.com/2024/09/a-new-path-for-kyber-on-web.html
- Signal: https://signal.org/blog/pqxdh/ and https://signal.org/blog/spqr/
- Apple: https://security.apple.com/blog/imessage-pq3/ and https://support.apple.com/en-bh/122756
- OpenSSH 10.0: https://www.openssh.com/txt/release-10.0
- Microsoft, 18 Nov 2025: https://techcommunity.microsoft.com/blog/microsoft-security-blog/-/4469093

**Government timelines:**
- UK NCSC: https://www.ncsc.gov.uk/guidance/pqc-migration-timelines
- EU roadmap, 23 Jun 2025: https://digital-strategy.ec.europa.eu/en/library/coordinated-implementation-roadmap-transition-post-quantum-cryptography
- PQShield's summary of the EU roadmap: https://pqshield.com/eu-pqc-workstream-publishes-a-coordinated-implementation-roadmap-for-the-transition-to-post-quantum-cryptography/

**Attacks and records:**
- SIKE: https://eprint.iacr.org/2022/975
- Rainbow: https://eprint.iacr.org/2022/214
- Chen: https://eprint.iacr.org/2024/555
- RSA-250 and DLP-795: https://eprint.iacr.org/2020/697
- RSA-260: https://cognition.com/blog/factoring-rsa-260
- RSA-896: https://saweis.net/posts/rsa-896.html
- RSA challenge numbers: https://en.wikipedia.org/wiki/RSA_numbers (used only to check the factors).

**Estimates:**
- Gidney 2025: https://arxiv.org/abs/2505.15917
- Babbush et al. 2026: https://arxiv.org/abs/2603.28846
- GRI 2025 timeline report (published 9 Mar 2026): https://globalriskinstitute.org/publication/quantum-threat-timeline-report-2025b/
- Gutmann & Neuhaus: https://eprint.iacr.org/2025/1237

**Figures of merit:** liboqs algorithm datasheets (sizes cross-check).

## Facts that will go stale

All facts live in `FRONTIER` in models.js and `fx.*`, `ch7.rec.*`, `ch10.open*` and `merit.*` in the copy:

- Cloudflare's 70 % / 15 % shares.
- Browser versions.
- FIPS 206 and HQC status.
- The round-3 signature list.
- The factoring records.
- Quantum resource estimates.
- The GRI survey.
- The government deadlines.
- Cloudflare's 2024 speed figures.

## Checked / not checked

**Checked:**
- Every prose number against models.js (tests/models.cjs: 2168 checks).
- SHA-256 vectors.
- RSA-260 and RSA-896 factors multiply to the challenge numbers.
- ML-KEM sizes against Go's constants and FIPS 203 formulas.
- IR 8547 dates and text read from the PDF.
- Hasse bound for every curve.
- LWE prediction against simulation over 168 settings.

**Not checked from a primary source:**
- **NSA CNSA 2.0 FAQ and the ANSSI/BSI joint statement:** blocked, so not cited.
- **FIPS 206:** NIST's presentation only; there is no public draft (csrc /pubs/fips/206/ipd returns 404).
- **EU milestones:** taken from PQShield's summary of the roadmap PDF.
- **Signature speeds:** Cloudflare's 2024 table only (the source itself calls them rough).
- **iOS/macOS 26 defaults:** from Apple support and Cloudflare docs.
- **The figure of 30 GPU-years for RSA-896:** the author's own blog.

## Prerequisites the site lacks

- Modular arithmetic and Euler's theorem as a standalone page (only inside rsa-encryption).
- Groups (an abstract-algebra intro).
- Linear algebra mod q / Gaussian elimination.
- The normal approximation to sums of random variables.
