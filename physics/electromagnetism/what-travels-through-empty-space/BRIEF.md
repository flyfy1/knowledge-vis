# BRIEF · what-travels-through-empty-space 真空里究竟有什么在传播

- Author: Antigravity (gemini-4-hydrogen)
- Built-By: Antigravity (gemini-4-hydrogen), deep-track wave 2 batch 1 (2026-11-13)
- Verified-By: self-check (`tests/models.cjs` pinned to prose; browser & canvas sweep handed to `@verifier` on port `19004`)
- category `physics`, subtopic `electromagnetism` (`电磁 / Electromagnetism`), stage `university`
- Format: long-form deep interactive essay (`specs/essays.md`, `specs/essay-briefs/BRIEF-DEEP.md`, `QUEUE-DEEP2.md` §3). Chinese copy only (`copy.zh.js`); `copy.en.js` is omitted in this authoring pass and falls back gracefully to Chinese. No `page-provenance` label yet (added by integrator after commit).
- Files: `index.html`, `copy.zh.js`, `models.js` (UMD `window.EmptySpaceModels`), `app.js`, `REGISTRY.json`, `BRIEF.md`, `tests/models.cjs`, `tests/browser.cjs` (default port `19004` / `PORT` / `ESSAY_BASE_URL`, `SHOTS_DIR` screenshot support).

## The one question

**信号穿过真空的时候，到底是什么在传？** (*What is actually travelling when a signal crosses empty space?*)

Every chapter climbs one rung of the ladder:
1. `#ch1` — **Fields & causal delay**: static $E_r \propto 1/r^2$ vs Purcell/Thomson kink $E_\perp = \frac{q a \sin\theta}{4\pi\varepsilon_0 c^2 r} \propto 1/r$.
2. `#ch2` — **Faraday + displacement current & Maxwell integral equations**: $I_d = \varepsilon_0 \varepsilon_r \frac{d\Phi_E}{dt} \equiv I_{\text{cond}}$, closing the loop across vacuum; perturbative $(kR)^2/4$ Faraday wave correction at high frequency.
3. `#ch3` — **1-D wave equation & Yee FDTD**: $\partial^2 E_y/\partial t^2 = (1/\mu_0\varepsilon_0)\partial^2 E_y/\partial x^2$, $c = 1/\sqrt{\mu_0\varepsilon_0} = 299{,}792{,}458\text{ m/s}$, $v = c/n$, normal-incidence Fresnel $R = ((n-1)/(n+1))^2$, $T = 4n/(n+1)^2$, Courant stability $S = c\Delta t/\Delta x \le 1$.
4. `#ch4` — **Accelerating charge radiation**: reuses ch1's kink to derive Larmor $P = q^2 a^2 / (6\pi\varepsilon_0 c^3)$, $f^4$ Rayleigh link, and center-fed linear dipole pattern ($R_{\text{rad}} = 73.1\,\Omega$, $D = 1.64 / 2.15\text{ dBi}$, $\text{HPBW} = 78.5^\circ$ at $\lambda/2$).
5. `#ch5` — **What a wave carries**: reuses ch4's power into Poynting $S = P/(4\pi r^2)$, solar sail radiation pressure $(1+R)S/c$ at 1 AU ($4.54 / 9.08\,\mu\text{Pa}$), and transverse polarisation / 3-polariser Malus's law ($12.5\%$ at $45^\circ$).
6. `#ch6` — **One spectrum & classical-to-photon boundary**: $10^4\text{–}10^{20}\text{ Hz}$, thermal $k_B T_{300\text{K}} \approx 0.0259\text{ eV}$ ($6.25\text{ THz}$) crossover, $E = hf$, $\sim 10\text{ eV}$ ionisation threshold, 25 °C liquid water Debye loss peak ($19.6\text{ GHz}$) vs 2.45 GHz microwave oven ($1.9\text{ cm}$ penetration depth), and phone RF safety limits (ICNIRP 2020 / FCC / WHO 2024 Karipidis review + ICBE-EMF critique).
7. `#ch7` — **Atmospheric windows**: sourced zenith transmission across ionosphere $f_0F_2$ (3–12 MHz), radio window (10 GHz $\approx 99.6\%$), H₂O (22.235 / 183.31 GHz) & O₂ (60 GHz $\approx 4\%$), MWIR/LWIR windows (3–5 μm, 8–14 μm), visible (0.38–0.75 μm), and ozone UV cutoff (< 300 nm).
8. `#ch8` — **Carrying information & Friis link budget**: AM / FM / 16-QAM waveforms, Shannon $C = B\log_2(1 + \text{SNR})$, and Friis equation across Wi-Fi (5 GHz, 10 m), Cell (1.8 GHz, 1 km), GPS L1 (1575.42 MHz, 20,200 km, $-127.2\text{ dBm}$, 18.3 dB below noise), and Voyager 1 (8.415 GHz, 173 AU, 319.2 dB FSPL, $+8.4\text{ dB}$ SNR with 70 m DSN dish & 160 Hz BW).
9. `#ch9` — **Guiding & shaping**: silica SMF-28 TIR ($\theta_c = 85.13^\circ$, $\text{NA} = 0.125$) and G.652.D attenuation curve (1550 nm minimum $\approx 0.19\text{ dB/km}$), diffraction limit $1.22\lambda/D$ (DSN 70 m $0.036^\circ$, JWST 6.5 m $0.077''$, High-NA EUV), and 2-D phased-array beam steering & grating-lobe threshold.
10. `#ch10` — **Frontier (as of Nov 2026) & 3-question check**: hollow-core fibre (0.091 dB/km), NICT 450 Tbps / 1.02 Pbps, NASA DSOC (267 Mbps / 494M km), Wi-Fi 7 (46 Gbps), T-Satellite D2C / AST BlueBird, 3GPP Rel-20 6G (FR3 7.125–24.25 GHz, sub-THz 100–300 GHz), High-NA EUV (0.55 NA, 8 nm), THz gap (0.1–10 THz) & metasurfaces.

## Key quantitative claims pinned by `tests/models.cjs`

- Constants: $1/\sqrt{\mu_0\varepsilon_0} = 299{,}792{,}458\text{ m/s}$ (rel err $< 10^{-9}$), $Z_0 = 376.73\,\Omega$.
- Ch1: $\beta = 0.20, \tau = 1.0, r = 10 c\tau_0, \theta = 90^\circ \implies E_\perp / E_r = 2.00$.
- Ch2: $R = 5\text{ cm}, d = 5\text{ mm}, V_0 = 100\text{ V}, \varepsilon_r = 1 \implies C = 13.9\text{ pF}$; at 10 MHz $I_c = I_d = 0.087\text{ A}$, $(kR)^2/4 = 0.003\%$; at 1000 MHz $I_c = I_d = 8.74\text{ A}$, $(kR)^2/4 = 27.5\%$.
- Ch3: FDTD vacuum speed at $S = 1.00$ advances exactly 100 cells in 100 steps with energy conservation $1.000000$; at $n = 1.5, S = 0.98$, Fresnel $R = 4.0\%$ / $T = 96.0\%$ match FDTD pulse energy split within $0.5\%$ and total energy conserved to $> 99.99\%$; $S = 1.04$ triggers exponential Courant blowup ($|E|_{\max} > 10^6$).
- Ch4: $0.1\lambda$ short dipole $R_{\text{rad,max}} = 0.19\,\Omega$; $0.5\lambda$ half-wave dipole $R_{\text{rad}} = 73.1\,\Omega$, $D = 1.64$ ($2.15\text{ dBi}$), $\text{HPBW} = 78.5^\circ$; $1.0\lambda$ full-wave $\text{HPBW} = 48.0^\circ$.
- Ch5: 1 AU solar sail ($1361\text{ W/m}^2$): $P_{\text{abs}} = 4.54\,\mu\text{Pa}$, $P_{\text{ref}} = 9.08\,\mu\text{Pa}$, 100 m × 100 m 50 kg sail $\Delta v = 156.9\text{ m/s/day}$; 3 polarisers with P2 at $45^\circ \implies 12.5\%$, without P2 $\implies 0\%$.
- Ch6: $k_B T_{300\text{K}} = 0.0259\text{ eV}$ ($6.25\text{ THz}$); 13.5 nm EUV $= 91.8\text{ eV}$; 1.8 GHz $= 7.4\,\mu\text{eV}$; 25 °C water Debye peak $19.6\text{ GHz}$ ($\delta_p = 0.46\text{ mm}$) vs 2.45 GHz ($\delta_p = 1.9\text{ cm}$).
- Ch7: 10 GHz zenith transmission $> 99\%$, 60 GHz O₂ $\approx 4\%$, 250 nm ozone $< 0.01\%$.
- Ch8: GPS L1 $P_{\text{rx}} = -127.2\text{ dBm}$ ($-157.2\text{ dBW}$, SNR $-18.3\text{ dB}$); Voyager 1 at 173 AU (22.4 W = 43.5 dBm) $\text{FSPL} = 319.2\text{ dB}$, $P_{\text{rx}} = -155.1\text{ dBm}$, SNR $+8.4\text{ dB}$.
- Ch9: $\theta_c = 85.13^\circ$, $\text{NA} = 0.125$, 1550 nm loss $\approx 0.19\text{ dB/km}$, DSN 70 m @ 8.415 GHz $0.036^\circ$, JWST 6.5 m @ 2 μm $0.077''$.
- Ch10: Hollow-core 0.091 dB/km vs silica 0.14 dB/km floor & ~32% latency saving.

## Tuned or assumed parameters (stated in prose / boundaries)

- Ch2: Peak drive voltage $V_0 = 100\text{ V}$, plate gap $d = 5\text{ mm}$ (illustrative lab capacitor).
- Ch5: Solar sail area $100\text{ m}\times 100\text{ m}$ and areal density $5\text{ g/m}^2$ ($50\text{ kg}$ total, representative gossamer sail class).
- Ch7: Atmospheric transmission curve combines ITU-R P.676 anchored O₂/H₂O line centres & zenith attenuation with smooth parameterized mid-latitude IR/ozone/ionosphere bands for interactive humidity & $f_0F_2$ sweeps (does not replace full line-by-line HITRAN radiative transfer).
- Ch8: Urban cell clutter loss $15\text{ dB}$; Voyager 3.7 m and DSN 70 m dish aperture efficiency assumed $55\%$.
- Ch9: Phased array uses uniform isotropic weights; silica fibre uses parameterized Rayleigh + 1383/1244 nm OH⁻ + IR multiphonon curve fitted to G.652.D typical specs.

## Sources (opened 2026-11-13)

- Physics & constants: E. M. Purcell & D. J. Morin, *Electricity and Magnetism* (3rd ed., Ch. 5 kink derivation); D. J. Griffiths, *Introduction to Electrodynamics* (4th ed., Ch. 7–11); A. Taflove & S. C. Hagness, *Computational Electrodynamics: The Finite-Difference Time-Domain Method* (Yee 1-D leapfrog & Mur ABC); C. A. Balanis, *Antenna Theory* (4th ed., Ch. 4 linear dipoles, Ch. 6 phased arrays); CODATA 2022 / SI 2019 values (`c`, `h`, `e`, `kB`, `mu0`, `eps0`).
- Water Debye model: U. Kaatze, *J. Chem. Eng. Data* / H. J. Liebe et al., 25 °C liquid water $\varepsilon_s = 78.36, \varepsilon_\infty = 5.2, f_r \approx 19.6\text{ GHz}$; vapor line 22.235 GHz (ITU-R P.676).
- RF exposure & WHO 2024 review: ICNIRP (2020) Guidelines (*Health Physics*, 2.0 W/kg over 10 g); FCC OET Bulletin 65 (1.6 W/kg over 1 g); K. Karipidis et al. (Sep 2024), WHO-commissioned systematic review, *Environment International* (`https://www.who.int/` / `https://www.arpansa.gov.au/`); COSMOS cohort (2024); ICBE-EMF critique (`https://icbe-emf.org/`).
- Atmosphere: ITU-R Recommendation P.676 (`https://www.itu.int/rec/R-REC-P.676/`) sea-level standard atmosphere ($1013.25\text{ hPa}, 15^\circ\text{C}, \rho_w = 7.5\text{ g/m}^3$): 10 GHz ~0.01 dB, 22.2 GHz ~0.27 dB, 60 GHz ~12–15 dB, 94 GHz ~0.15–0.20 dB, 183 GHz ~20–30 dB.
- Voyager 1 & GPS L1: NASA/JPL Voyager status (`~173 AU`, `22.4 W`, `3.7 m` dish, `8.415 GHz`, DSN `70 m`); GPS.gov / IS-GPS-200 L1 (`1575.42 MHz`, `20,200 km`, `-158.5 dBW` minimum received power).

## Facts that will go stale (all in `FRONTIER` block of `models.js`, as of `2026-11`)

- Hollow-core fibre attenuation record: **0.091 dB/km** at 1550 nm — University of Southampton / Microsoft Azure Fiber DNANF (*Nature Photonics*, 2025; `soton.ac.uk`, `microsoft.com`, opened 2026-11-13).
- Optical capacity records: NICT **450 Tbps** over 39 km field legacy SMF (2026) and **1.02 Pbps** over 1,808 km 19-core fibre (2025–2026; `nict.go.jp`, opened 2026-11-13).
- Deep-space FSO: NASA DSOC *Psyche* **267 Mbps** at 31M km (Dec 2023), **25 Mbps** at 226M km (Apr 2024), **494M km** max distance (Dec 2024; operations concluded Sep 2, 2025; `nasa.gov`, opened 2026-11-13).
- Voyager 1 distance: **~173 AU** (~25.9B km, ~1 light-day) as of late 2026 (`earthsky.org` / `orbitalradar.com`, opened 2026-11-13).
- Wi-Fi 7 (IEEE 802.11be): 320 MHz, 4096-QAM, up to ~46 Gbps PHY.
- Direct-to-Cell LEO: Starlink / T-Mobile **T-Satellite** commercial launch **July 23, 2025** (`t-mobile.com`, `starlink.com`); AST SpaceMobile Block 2 **BlueBird** (~2,400 sq ft / 223 m² arrays, multi-satellite launches 2026; `ast-science.com`, opened 2026-11-13).
- 6G roadmap: 3GPP Release 19/20 (Rel-20 6G study mid-2025), WRC-23 FR3 **7.125–24.25 GHz** & sub-THz **100–300 GHz** (`qualcomm.com`, `rohde-schwarz.com`, opened 2026-11-13).
- High-NA EUV: ASML Twinscan **EXE:5000 / EXE:5200B**, **13.5 nm**, **0.55 NA**, **8 nm** half-pitch entering volume manufacturing 2025–2026 (`asml.com`, `trendforce.com`, opened 2026-11-13).

## Checked / not checked

- Checked: every numerical claim in `copy.zh.js` pinned against `models.js` in `tests/models.cjs`; FDTD speed, energy conservation, Fresnel R/T, and Courant instability verified analytically and numerically; every `.say` template branch evaluated at extremes.
- Handed to `@verifier`: Playwright browser smoke test across 1280/390/320 px, reduced motion, 48 px target audit, `canvas-text-overlap.cjs --sweep`, and visual screenshot inspection.
- Not checked in this pass: English copy (`copy.en.js` omitted per authoring brief; left for translation pass) and independent cross-session physics review.
