# BRIEF · a-secret-in-public 当着所有人的面约定一个秘密

- Built-By: Claude Code (claude-opus-5-5), deep-essay batch 2026-11-11
- Finishing pass 2026-11-18: Claude Code subagent (claude-fable-5-2): open issues resolved against primary sources, models re-derived, modular-arithmetic rung and eleven static diagrams added (details in "Finishing pass" below)
- Verified-By: self-check by the builder and by the finishing agent (node model test, browser test at 1280/390/320 zh + reduced motion, canvas text sweep, screenshots of every diagram and model at 1280/390/320); not independently reviewed (pending).
- English: `copy.en.js` by a translation subagent (claude-haiku-5-5), mechanical checks only.
- Verified-By: Claude Code subagent (claude-fable-5-2), independent review 2026-11-18, **incomplete** (stopped for budget): models re-derived, sources re-opened, disclosure wording, English text read and corrected, browser test extended to English. Not done: English diagram layout fixes, canvas sweep, screenshots. Details: `specs/reviews/a-secret-in-public-review-20261118.md`.
- Verified-By: Claude Code (claude-fable-5-2), second independent reviewer, completion pass 2026-11-18: English diagram layout fixed and every diagram and model screenshot looked at (1280/390/320, zh + en); English page text re-read; keyboard and focus checks added to `tests/browser.cjs` and passing in both languages; English parity checks added to `tests/models.cjs`; canvas text sweep passes (1,631 states, zh + en). Facts and models were not re-verified in this pass (first reviewer's record stands).
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
   - **Modular arithmetic and finite fields** (`#mod`, first half of the chapter; the site has no standalone page for this rung). Model `modRing(n, a)`, n = 3…17: the row a·x mod n, the inverse (exists iff gcd(a, n) = 1), the powers of a, their order, φ(n); six sentence branches (generator / prime non-generator / unit of a composite / zero divisor / a = 1 prime / a = 1 composite). Standard results: Fermat's little theorem, Euler's theorem, F_p is a field. Default n = 7, a = 3: inverse 5, order 6, a generator. The test checks every (n, a) on the sliders against independent definitions.
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
     - Double-and-add, with the point of largest order as G. At p = 97: N = 100, G = (0, 10) of order 50, and 23G = (49, 34) in 7 group operations (4 doublings + 3 additions; the draft counted 8 because it counted the free first copy; naive is 22).
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
   - Records: RSA-768 (2009), DLP-795 (2019), RSA-250 (2020), RSA-260 (3 Sep 2026), RSA-896 (19 Sep 2026, still the largest), RSA-270 (12 Nov 2026, 895 bits, not a record).
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
    - The frontier block in models.js has 19 dated items (records item now dated 2026-11) in four groups: standards, deployment, attacks and demonstrated results, estimates and claims.
    - Then a figures-of-merit table, four open questions, and one paragraph on ZK proofs and FHE (not built here).
11. **四个问题 / Four questions for reading crypto news** (`#ch11`). No model.

## Static diagrams (STANDARD §4a), eleven

Built in `app.js` (`DG.*`) from small specs, two layouts (viewBox 720 / 340, swapped at a 600 px figure), labels from `dg.*` copy keys. Colours: Alice/browser cyan, Bob/server green, attacker red, secrets gold, quantum/post-quantum violet.

| id | chapter | what | numbers |
|---|---|---|---|
| `channel` | 1 | public wire, eavesdropper, the key with no safe path | schematic |
| `clock` | 2 `#mod` | mod 7 clock with the powers of 3 | `modRing(7, 3)`, pinned |
| `dh` | 3 | DH message sequence | `dh(327, 519)`: 1,027 / 265 / 294, pinned |
| `mitm` | 3 | man in the middle | `mitm`: 534 / 1,735 / 60 / 212, pinned |
| `rsa` | 4 | private half, public half, encrypt vs sign | default key, pinned |
| `ladder` | 5 | double-and-add for 23G at p = 97 | `ecMul(...).steps`, pinned |
| `chain` | 6 | trust store → root → intermediate → site | names from `chain('none')`; schematic |
| `tls` | 6 | TLS 1.3 handshake sequence (RFC 8446 §2) | schematic |
| `shor` | 8 | flow: one quantum step in a classical loop | schematic |
| `lwe` | 9 | b = A·s + e as blocks | schematic, caption says not to scale |
| `hybrid` | 10 | bytes X25519MLKEM768 adds to a handshake | to scale; `hybridShares()` 1,216 / 1,120, pinned; order per RFC 10024 |

Chapter 7 (an argument over numbers) and chapter 11 have none.

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
- NSA, "CNSA Suite 2.0 and Quantum Computing FAQ", Ver. 2.2, October 2026 (PP-26-3194). media.defense.gov and nsa.gov return 403 to scripted clients; read in full from the Wayback Machine capture of the agency's own PDF: https://web.archive.org/web/20261116044243id_/https://media.defense.gov/2022/Sep/07/2003071836/-1/-1/0/CSI_CNSA_2.0_FAQ_.PDF (opened 2026-11-18). Used: ML-KEM-1024 / ML-DSA-87; 1 Jan 2027 new acquisitions; 31 Dec 2030 phase-out; 31 Dec 2031 mandated; "FN-DSA is not available yet"; NSA "will not require NSS developers to use hybrid certified products for security purposes"; EO 14412 sets 2031 for FCEB high value assets.
- BSI/ANSSI and partners from 18 EU member states, "Securing Tomorrow, Today: Transitioning to Post-Quantum Cryptography", 27 Nov 2024: https://www.bsi.bund.de/SharedDocs/Downloads/EN/BSI/Crypto/PQC-joint-statement.pdf?__blob=publicationFile&v=3 (PDF read 2026-11-18). Used: most sensitive use cases protected against store-now-decrypt-later "latest by the end of 2030"; "strongly recommend to deploy PQC in hybrid solutions for most use-cases".
- EU PQC Workstream (NIS Cooperation Group), "A Coordinated Implementation Roadmap for the Transition to Post-Quantum Cryptography", Part 1, Version 1.1, 11 June 2025 (PDF linked from the Commission page below, read 2026-11-18): https://ec.europa.eu/newsroom/dae/redirection/document/117507 . Milestones quoted from §4.1: 31.12.2026 / 31.12.2030 / 31.12.2035.
- NIST IR 8547 final (PDF re-read 2026-11-18): the 2030/2031 dates apply to high value assets and high impact systems under EO 14412 / OMB M-26-15; deprecate after 2030, disallow after 2035; hybrid §3.2.
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
- RSA challenge numbers: https://en.wikipedia.org/wiki/RSA_numbers (wikitext fetched 2026-11-18): second source for RSA-260 (3 Sep 2026, Eric Lu, Cognition) and RSA-896 (19 Sep 2026, Stephen A. Weis, with Claude); only reachable source for RSA-270 (12 Nov 2026, Eric Lu), which cites https://www.mersenneforum.org/node/1125296/page3#post1130660 (403 to me). Also https://en.wikipedia.org/wiki/RSA_Factoring_Challenge (table, same dates) and https://en.wikipedia.org/wiki/Integer_factorization_records (RSA-260 only).
- RSA-896 third-party report: https://postquantum.com/security-pqc/rsa-896-factored-claude-gpus/ (same date, GPUs and GPU-years as the author's post; it reports no third-party recomputation).
- Discrete-log record: https://en.wikipedia.org/wiki/Discrete_logarithm_records (nothing newer than 2 Dec 2019 for a prime field; the page itself is flagged as possibly out of date).
- Additional signatures round 3 page (updated 13 Oct 2026; HAWK withdrawn by its team): https://csrc.nist.gov/projects/pqc-dig-sig/round-3-additional-signatures
- RFC 10024 (share layout and sizes for X25519MLKEM768): https://www.rfc-editor.org/rfc/rfc10024.html

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

**Checked by the builder (2026-11-11):**
- Every prose number against models.js; SHA-256 vectors; ML-KEM sizes against Go's constants and FIPS 203 formulas; IR 8547 read from the PDF; Hasse bound for every curve; LWE prediction against simulation over 168 settings.

**Finishing pass (2026-11-18) — formerly open items and their outcome:**
- **RSA-260 / RSA-896 dates and attribution:** confirmed in two places each (author's post + Wikipedia; RSA-896 also postquantum.com). Factors re-checked independently: for RSA-250/260/270/896 both published factors pass Miller–Rabin and multiply to the challenge number. Compute figures (4,900 GPU-days; up to 2,048 GPUs, ~30 GPU-years) are the authors' own and the page now says so. The page also discloses that it is written by Claude and one record comes from an Anthropic employee using Claude.
- **New since the draft:** RSA-270 (895 bits) factored 12 Nov 2026. Added to the table and the frontier item, labelled as not a record and as sourced from Wikipedia citing a forum post I could not open; the factors themselves verify.
- **NSA CNSA 2.0:** primary document read (FAQ v2.2, Oct 2026, via Wayback); added to `fx.gov`, `fx.fndsa`, `ch10.open3`.
- **ANSSI/BSI joint statement:** primary PDF read; added to `fx.gov` and `ch10.open3` (it is 18 member states, dated 27 Nov 2024).
- **EU milestones:** now from the roadmap PDF itself (v1.1, 11 June 2025); wording corrected (2035: medium-risk complete, low-risk as far as feasible). PQShield no longer cited on the page.
- **US deadlines:** `ch8.limit` said the 2030/2031 dates were the federal deadline; they apply to high value / high impact systems. Corrected.
- **FIPS 206:** still no public draft (csrc /pubs/fips/206/ipd and /final return 404 on 2026-11-18; NSA's Oct 2026 FAQ says FN-DSA "is not available yet"). FIPS for HQC: still "under development" (IR 8547; /pubs/fips/207/ipd 404).
- **Round-3 signatures:** HAWK has been withdrawn (NIST page updated 13 Oct 2026); added.
- **iOS/macOS 26:** Apple support page 122756 (published 18 June 2026) re-read: ClientHello includes X25519MLKEM768. Unchanged.
- **Cloudflare 70 % / 15 %, RFC 10024, GRI survey, arXiv 2603.28846, NCSC dates:** re-opened, all as stated.
- **Models re-derived** with an independent Python script: 4^327 mod 2039, safe primes, DH 294, MITM 60/212, RSA d/c/s and the 116 trial divisions, the curve at p = 97 (N, order, 23G), the real-curve sum, GNFS values at 12 sizes, rho, Grover, Shor N = 143, ML-KEM sizes. All agreed except the double-and-add count (8 → 7, fixed in the model, prose, readout and test; the naive count is now k − 1 as in chapter 2).
- **Prose corrections:** ch9 called LWE "an equivalent statement" of the good-basis/bad-basis picture; it now says a different lattice problem with Regev's (quantum) worst-case reduction. ch7.p4 rewritten for three factorizations and to mark the 1024-bit statement as the author's inference. The digit count of long integers now says decimal. New k = 1 sentence in ch5.
- Every control driven to its extremes; every live sentence read (script in the scratch dir).

**Still not verified:**
- The mersenneforum post announcing RSA-270 (403); date and attribution rest on Wikipedia.
- The GPU-day / GPU-year figures of all three 2026 factorizations: authors' own statements, no third-party recomputation found.
- Signature speeds: Cloudflare's 2024 table only (the source calls them rough); the page says so.
- Whether a prime-field discrete-log record newer than Dec 2019 exists: not found; the page says "the newest I could find".
- EO 14412 and OMB M-26-15 themselves were not opened; their content is taken from NIST IR 8547 and the NSA FAQ, which quote them.
- Microsoft's 18 Nov 2025 GA post, the Signal and OpenSSH items and the SIKE/Rainbow/Chen papers were not re-opened in this pass (builder's check stands).
- OMB M-26-15 was not found; the page says so. EO 14412 was read in the Federal Register (2026-12909).

**Independent review (2026-11-18, claude-fable-5-2; stopped early) — see `specs/reviews/a-secret-in-public-review-20261118.md`:**
- Done: every model re-derived with an independent script (LWE failure rate also computed exactly); records, EO 14412, IR 8547, NSA FAQ, BSI statement, EU roadmap, HAWK, Microsoft, Signal, OpenSSH, SIKE/Rainbow/Chen and the Cloudflare speed table re-opened; factors multiplied back.
- Fixed: records wording and the self-interest disclosure (the author's post does not state his employer; the page now says only what the post says); RSA-270 marked as resting on Wikipedia only (mersenneforum still 403) with no method claimed; LWE reduction wording; EO 14412 scope; ch3 paragraph and caption; English mistranslations; English dates ("August 2024"); `<cite>` for titles of works.
- Links to `how-a-web-page-arrives` and `what-quantum-computers-do` are plain text in both languages until those pages are registered. **The registrar must turn them back into links** (`ch3.p4`, `ch8.p1`, `ch11.links`) and re-check the English titles against the registered ones.
- The items this review left open were closed by the completion pass below, except the FIPS 203 check of 2^−164.

**Completion pass (2026-11-18, Claude Code (claude-fable-5-2), second reviewer) — record §8:**
- Fixed: English labels outside the drawing at 390/320 in `clock`, `rsa`, `ladder`, `chain`, `shor` and the `shor` overlap at 1280 (wrap widths, column position, and the drawing now grows downwards when a label wraps); `lwe` narrow line pitch; two English strings (`dg.shor.check`, `ch2.say.running`).
- Checked: screenshots of all 11 diagrams and 15 models at 1280/390/320 in both languages looked at; English text read once more; keyboard (arrows, Home/End, Space, Enter), focus ring and both extremes of every slider, in both languages, now in `tests/browser.cjs`; key / placeholder / tag / number parity of `copy.en.js` against `copy.zh.js` now in `tests/models.cjs`; `tests/canvas-text-overlap.cjs --sweep` passes in both languages.
- **Not checked:** ML-KEM-768's 2^−164 against the FIPS 203 text; the mersenneforum post (403); OMB M-26-15; Tab order control by control; a screen reader; keyboard at 390/320 (run at 1280 only); REGISTRY.json. Cosmetic items left are listed in the record.

## Prerequisites the site lacks

- Modular arithmetic and finite fields: now taught in chapter 2 (`#mod`) with its own model, diagram and REGISTRY concept `modular-arithmetic-finite-fields`, so this essay can serve as that rung until a standalone page exists. Aliases 欧拉定理 / 费马小定理 / 模运算 may collide with rsa-encryption's at registration; the registrar decides.
- Groups (an abstract-algebra intro).
- Linear algebra mod q / Gaussian elimination.
- The normal approximation to sums of random variables.
