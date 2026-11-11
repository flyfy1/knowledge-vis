# BRIEF · why-the-sky-is-blue 天为什么是蓝的

- Built-By: Claude Code (claude-opus-5-5), essay batch 2026-11-11
- Verified-By: self-check (node model test, browser test, scroll-aware canvas sweep, screenshots at 1280/390/320 and reduced motion, a full read-through in the browser); Claude Code (claude-opus-5-5), independent review 2026-11-11: physics re-derived with independent code (Bodhaine τ, Lorentz ratio, Planck×λ⁻⁴ shares, colorimetry against the tabulated CIE 1931 2° functions, Kasten–Young/Beer–Lambert, single-scattering sky by numerical integration, Mie via miepython, multiple-scattering Monte Carlo with 10⁶ photons); six sources opened; English copy and layout at 1280/390/320; canvas sweep zh/en
- category `physics`, subtopic `optics` (光学 / Optics), stage `senior`
- Format: one long interactive essay in the style of `biology/body/body-in-balance/` (quality bar `/tmp/agent-tasks/standard/STANDARD.md`). It is not a step page: no `lesson-shell.js`, and no provenance label yet (the integrator adds one once a commit exists).
- Files:
  - `index.html`: markup and styles.
  - `copy.zh.js`: all visible text. `copy.en.js` (translation, reviewed 2026-11-11) has the same keys; every missing key falls back to zh.
  - `models.js`: pure models, UMD (`window.SkyModels`).
  - `app.js`: wiring, drawing, i18n, IntersectionObserver gating.
  - `tests/models.cjs` and `tests/browser.cjs`.
- Language-aware:
  - no Chinese in code;
  - canvas labels and aria-labels come from the copy;
  - `fmt` uses plain digits, grouping only at ≥ 10,000, with no 万/成;
  - the toggle reads 中 | EN.
  - `tests/browser.cjs` runs zh and the real en at 1280/390/320, checks that no CJK appears in English mode (DOM, aria-label, title, canvas `fillText`), also with a stand-in Latin `copy.en.js`, and a 404 fallback to zh.
  - English uses a Latin-first font stack (`html[lang=en]`), so ° and dashes are not drawn with full-width CJK glyphs.

## The one question

Where does the colour of the sky come from? It is blue by day, orange-red at sunset, white in clouds and butterscotch on Mars.

The answer the essay builds uses three things:
1. **Particle size against the wavelength.** Small particles follow 1/λ⁴, large ones are grey, and in between the scattering oscillates (ch1, ch2, ch7).
2. **Path length.** A long path removes blue from the direct beam, and along long lines of sight it removes blue from the scattered light too (ch5, ch6).
3. **What the eye does with a broad spectrum.** Three cones turn it into a whitish blue rather than violet (ch3, ch4).

Ch8 reuses all three for Mars. Ch9 says what the single-scattering picture leaves out. Ch10 turns the three into questions.

## Chapters

Each chapter gives the law, the everyday case, the model and its limits. Every number in the prose is derived and pinned in `tests/models.cjs`.

1. **天空的光从哪里来 / Where skylight comes from** (`#ch1`).
   - Law: skylight is sunlight scattered by air; the scattered share is 1 − e^{−τ}.
   - Case: a dusty sunbeam, and the black lunar sky.
   - Model: Monte Carlo photons at 450/550/650 nm in a plane-parallel slab, sun overhead, Rayleigh phase function, seeded xorshift RNG, no ground reflection.
     - τ(λ) comes from Bodhaine et al. 1999 Eq. 30 × the reader's air amount (0–4×).
     - Exact readouts give the scattered share; an animated tally counts scattered photons that reach the ground.
     - Reduced motion shows a still set of finished paths.
   - Discover: blue 20% vs red 4.8% (4.1×); at 4× air 59% / 18% (3.3×). Saturation shrinks the ratio.
   - Limits: three wavelengths, a flat slab, black ground.
2. **短的波更容易被拐走 / Short waves scatter more** (`#ch2`).
   - Law: Rayleigh 1/λ⁴.
   - Case: shaking a rope.
   - Model: a Lorentz oscillator with scattered power ∝ ω⁴/(ω₀² − ω²)². The resonance is λr = 1000/√146 ≈ 82.8 nm, the pole of the Edlén term in Bodhaine Eq. 1. The page says this is an effective single-oscillator fit to the visible refractive index, not a real absorption line.
     - The reader moves the wavelength (380–780 nm) and the resonance (60–300 nm).
     - The effective exponent is fitted between 450 and 700 nm.
   - Discover: 450 vs 700 nm gives 6.1× against a pure 5.9×; exponent 4.09 (oscillator) vs 4.08 (Bodhaine formula); halving the wavelength gives 16×.
   - Limits: classical; no King factor (≈ 1.05) and no polarisation.
3. **天空光的光谱 / The skylight spectrum** (`#ch3`).
   - Model: Planck B(λ, T) × λ⁻⁴; the reader sets T (2500–12000 K, default 5772 K).
   - Discover:
     - the sun peaks at 502 nm ("about 500");
     - the sky spectrum peaks at 277 nm, in the UV;
     - in the visible, violet (380–450 nm) holds 44% of skylight energy against 18% for blue (450–495 nm);
     - sunlight itself has 18% in violet.
   - Limits: a blackbody sun. The real spectrum, with its absorption lines (densest in the violet), was not used; the page says the 277 nm peak exists only in the model (ground-level sunlight below ~300 nm is removed by ozone). Band shares are of energy in 380–780 nm.
4. **为什么不是紫色 / Why not violet** (`#ch4`).
   - Model: spectrum = Planck(5772) × λ⁻ⁿ with an optional cut below a wavelength.
     - Colour matching uses the CIE 1931 functions (Wyman–Sloan–Shirley 2013 multi-lobe fit).
     - The xy chromaticity is reported as dominant wavelength and purity relative to the sun's white point.
     - Swatches use sRGB, white-balanced to sunlight.
     - The reader moves n (0–8) and the cut (380–470 nm).
   - Discover:
     - dominant wavelength 476 nm at 41% purity;
     - violet (380–450 nm) has 44% of the 380–780 nm energy but 1.3% of the luminance Y;
     - the prose gives the three usual reasons (less solar violet, high-altitude absorption, the eye) and uses the cut slider to weigh the first two; ozone absorbs mainly below ~340 nm;
     - cutting at 420 nm moves it to 477 nm, at 440 nm to 484 nm;
     - n = 8 gives 470 nm.
   - Limits: the standard observer only; the screen colour is approximate.
5. **落日为什么是红的 / Red sunsets** (`#ch5`).
   - Model: Kasten–Young 1989 air mass and Beer–Lambert transmission e^{−τ(λ)m}. The reader moves the sun's elevation (0–90°) or plays a sunset.
   - Discover:
     - overhead, 80% of blue and 95% of red get through;
     - air mass 2.0 / 5.6 / 10.3 / 38 at 30° / 10° / 5° / 0°;
     - blue is halved at 18°, red at 3.3°;
     - at the horizon 0.02% of blue and 15% of red remain, giving a dominant wavelength of 594 nm (orange, not blood red).
   - Limits: no refraction, ozone, water vapour or aerosol, which is why real sunsets are redder.
6. **头顶最蓝，地平线发白 / Blue overhead, white at the horizon** (`#ch6`).
   - Model: a plane-parallel single-scattering sky, L = F·τωP/(4πτ)·m(e^{−τm₀} − e^{−τm})/(m − m₀), evaluated per wavelength on the GRID.
     - It is drawn as a 120×36 panorama; exposure is auto-scaled from cells more than 20° from the sun.
     - The "horizon" readout looks 2° above the horizon, away from the sun.
   - Discover:
     - at 30°, the zenith is 478 nm at 35% and the horizon has 3% purity;
     - the horizon is 12× brighter than the zenith;
     - at sunset the zenith purity falls from 37% (sun at 60°) to 4%, which is the model's failure (see ch9).
     - Ch10 adds a mountain-top case: half the air gives 53% brightness, and purity rises from 37% to 39%.
   - Limits: flat atmosphere, single scattering, no ozone, black ground.
7. **云为什么是白的 / White clouds** (`#ch7`).
   - Model: Mie scattering (the Bohren–Huffman BHMIE algorithm) for water spheres with m = 1.33, averaged over a log-normal size spread (σ_ln 0.15, 7 points). The reader sets the radius from 0.01 to 20 µm on a log scale.
   - Discover:
     - at 0.01 µm, blue/red = 4.35 = (650/450)⁴;
     - around 0.6 µm the ratio flips to 0.69, and the sun seen through such drops turns bluish; the prose says this is rare in nature (Krakatoa 1883, Canadian fires 1950; Wullenweber et al. 2021);
     - at 10 µm the ratio is 1.00 and Q_ext = 2.07, the extinction paradox.
   - Limits: perfect spheres, a narrow size distribution, no absorption.
8. **另一颗行星的天空 / Another planet's sky** (`#ch8`).
   - Model: the ch6 sky with Mars air (Earth's Rayleigh spectral shape scaled so τ(440) = 0.01) plus dust:
     - BHMIE spheres, r 1.5 µm, log-normal σ_ln 0.4, 9 points, n = 1.5 + i·k(λ);
     - k(λ) = 0.0015 + 0.010·e^{−(λ−380)/70}, illustrative, or k = 0 when "absorbs blue" is off;
     - Mie phase function, single scattering.
     - The reader picks Mars or Earth, the dust τ(550) from 0 to 2, absorption on/off, and the sun's elevation from 0 to 60°.
   - Discover:
     - at default dust 0.5 and the sun at 30°, the zenith is 576 nm at 14% (tan);
     - 3° above the sun the sky is bluish, 483 nm at 5%;
     - a clear Mars sky is blue but only 4.8% as bright as a clear Earth sky in the same sunlight;
     - without absorption the dust sky is near-white (6%);
     - with the sun at 2°, the near-sun blue is stronger: 484 nm at 9%;
     - Earth with the same absorbing dust falls below 2% purity.
   - Limits: illustrative absorption; spheres; single scattering; brightness compared in equal sunlight.
9. **简单模型漏掉了什么 / What the simple model misses** (`#ch9`).
   - Model: the ch1 photon slab, 200,000 photons per colour (raised from 20,000 in review), seed 7. It counts the scattering order of diffuse photons reaching the ground. The reader sets the elevation (5–90°) and the air amount (0.5–4×).
   - Discover: with the sun overhead, about 25% of blue skylight and 8% of red has been scattered more than once (blue/red skylight 4.1×); at 10° the blue share is about 30%. Converged values from 10⁶–4×10⁶ photons with an independent code: 24.5%, 8.1%, 4.09×, 30.1%. The old 20k-photon draw gave 24%, 7% and 3.8×; the 7% and 3.8× were seed noise.
   - The prose also covers:
     - ozone's Chappuis band: Hulburt 1953's ⅔ (quoted second-hand from Lange et al. 2023 and marked so), and Lange et al. 2023's 66% for the sun on the horizon (39–76% for 100–500 DU) and about 3% for a high sun; the page says their "contribution" is a chromaticity-distance metric;
     - polarisation, sphericity, ground albedo and aerosols.
   - Limits: Monte Carlo noise under one percentage point (pinned in the test against a 10× run).
10. **下次抬头时，问三个问题 / Three questions** (`#ch10`). There is no model.
    - The three questions are particle size, path length, and what the eye receives.
    - Five worked consequences follow, plus one synthesis sentence.
    - Related pages: blackbody-radiation, eye-vision, interference, climate-energy.

## Live sentences

`models.js` exports `say.chN`, which picks a sentence key from the model state.
- `tests/models.cjs` sweeps every control over its full range and checks that each sentence's claim holds wherever it is chosen; for example, "near-white" is only said when purity < 15%.
- `tests/browser.cjs` drives every slider to both extremes, pairs of sliders at their four corners, and every checkbox and radio both ways. It checks that every sentence and readout stays filled, with no NaN, Infinity, undefined or unfilled placeholder.

## Real-world figures and sources (checked 2026-11-11, each opened by me)

| Figure in the essay | Source | What I checked |
|---|---|---|
| Rayleigh τ(λ) formula; τ(450) 0.22, τ(650) 0.049; 4.08 exponent | Bodhaine, Wood, Dutton, Slusser 1999, *J. Atmos. Oceanic Technol.* 16:1854, PDF at reef.atmos.colostate.edu/~odell/at721/resources/rayleighOpticalDepth.pdf | Eq. 30 coefficients; Table 3 τ(550) = 9.7069E-02, which the test reproduces (0.09707) |
| Edlén resonance 1000/√146 nm; King factor ≈ 1.05 | same paper, Eq. 1 and §2 | the 146 µm⁻² pole; F(air) about 1.05 in the visible |
| Sun 5772 K | IAU 2015 Resolution B3, ar5iv.labs.arxiv.org/html/1510.07674 | nominal T_eff = 5772 K |
| CIE 1931 matching functions | Wyman, Sloan, Shirley 2013, JCGT 2(2), jcgt.org/published/0002/02/01/paper.pdf | multi-lobe coefficients (Listing 1) |
| sRGB matrix | en.wikipedia.org/wiki/SRGB | XYZ→linear sRGB matrix and transfer function |
| Air mass formula, ≈ 38 at the horizon | Kasten & Young 1989, *Appl. Opt.* 28:4735, via en.wikipedia.org/wiki/Air_mass_(astronomy) | coefficients 0.50572, 6.07995°, 1.6364; horizon value about 38 |
| Cloud drops 4–17 µm | Fu et al. 2019, *JGR Atmospheres*, pmc.ncbi.nlm.nih.gov/articles/PMC6988446/ | monthly mean liquid effective radius range over ocean |
| Mars pressure ~6 hPa (6.36 mb), 95% CO₂, sunlight 43% of Earth's (586.2 / 1361 W m⁻²) | NASA Mars fact sheet, nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html | surface pressure, composition, solar irradiance |
| Mars Rayleigh τ ≈ 0.01 at 440 nm; dust τ "a few tenths", far higher in storms | Lemmon et al. 2024, arXiv 2309.07378 (PDF read) | the "almost 0.01 at 440 nm" sentence is an estimate removed from the data; the abstract says gas optical depth is "too small to measure" (review: the page had said Curiosity *measured* 0.01; now "estimate") |
| Mars dust effective radius 0.8–1.5 µm | Chen-Chen et al. 2019, *Icarus*, arXiv 1905.01073 | r_eff range from Curiosity sky images |
| Mars blue sunset and its explanation | NASA/JPL PIA19400, jpl.nasa.gov/images/pia19400-sunset-in-mars-gale-crater/ | "fine dust permits blue light to penetrate more efficiently…" |
| Dust absorbs blue; the sky would be whitish without it | webexhibits.org/causesofcolor/14C.html | qualitative statement only, used to frame the "absorbs blue" toggle |
| Ozone: Hulburt 1953 ⅔; 66% (300 DU) with the sun at the horizon; ~3% for a high sun | Lange, Rozanov, von Savigny 2023, *ACP* 23:14829, acp.copernicus.org/articles/23/14829/2023/ | abstract quotes Hulburt's ⅓ / ⅔; results for SZA 10–90° |
| Chappuis band 400–650 nm | en.wikipedia.org/wiki/Chappuis_absorption | wavelength range |
| Blue sun/moon needs narrow size distributions of radius ~400–700 nm; seen after Krakatoa 1883 and the 1950 Canadian fires; rare | Wullenweber, Lange, Rozanov, von Savigny 2021, *Clim. Past* 17:969, cp.copernicus.org/articles/17/969/2021/ | opened in review |

## Checked / not checked

**Checked**
- Every number in the prose is computed by `models.js` and pinned by `tests/models.cjs` (2067 checks).
- The Bodhaine τ(550) value is reproduced from Table 3.
- The BHMIE code matches the Bohren–Huffman test case (Q_ext 3.105).
- The Rayleigh and Mie phase functions integrate to 1.
- The dominant wavelength of a 410 nm source is recovered.
- All sentence claims hold across their full control ranges.
- The layout is clean at 1280/390/320: no overflow, all targets ≥ 48 px, keyboard operation, reduced motion, no console errors.
- The canvas sweep reports no colliding or clipped labels (1422 states).

**Independent review (Claude Code, claude-opus-5-5, 2026-11-11)**
- Re-derived without the page's code: Bodhaine τ(450/550/650) = 0.221/0.0971/0.0492, scattered 19.8%/4.8%, ratio 4.13, exponent 4.08–4.09; Lorentz 6.10× and exponent 4.09; Planck×λ⁻⁴ peak 277 nm, shares 43.8%/18.2%, sun violet 17.8%; with the tabulated CIE 1931 2° functions: 476.0 nm / 41.0%, violet Y 1.30%, cut 420 → 477.5, n 8 → 470.3; Kasten–Young m(0) = 37.9, sun at horizon 593.6 nm, half-points 18.4° / 3.33°; single-scattering sky (numerical depth integration): zenith 478 nm / 34%, horizon 3%, 12.1×, mountain 0.53 and 36→39%; miepython agrees with the page's BHMIE (BH case Qext 3.1054), Qext(10 µm) 2.07, first Qext maximum of water at ρ = 2x(m−1) ≈ 4.3.
- Sources opened: Lange et al. 2023 abstract, Lemmon et al. 2024 (PDF text), Chen-Chen et al. 2019 (PDF text: r_eff 0.80–1.50 µm), JPL PIA19400, Wullenweber et al. 2021.
- Fixed: Monte Carlo photon count (7% → 8%, 3.8× → 4.1×), "Curiosity measured" → estimate, Hulburt marked second-hand, Lange metric stated, "exactly explains" softened, UV peak and real solar spectrum caveats, three-part account of "why not violet" with weights, band and Y definitions, blue-sun rarity, invented Mars absorption flagged inside the how-line in both languages, English ("bent" → "scattered", colorimetry, mistranslations, overflowing labels, panorama labels, Latin font stack).
- Design left as is: the 拐 / "scattered aside" metaphor; ch8's zenith readouts depend on the invented absorption, which the page now says.

**Not checked or illustrative**
- The Mars dust absorption k(λ) is invented to express "absorbs short waves more". It is not fitted to measurements.
- The sun is a blackbody, not the measured solar spectrum.
- Mars air reuses Earth's Rayleigh spectral shape, scaled to τ(440) = 0.01.
- The location of the ozone absorption peak is deliberately not claimed.
- The Hulburt 1953 paper itself was not opened; its ⅓ / ⅔ result is quoted as reported in the Lange et al. 2023 abstract.
- On-screen colours depend on the display.
- Reviewer did not open: the NASA fact sheet, IAU B3, Fu et al. 2019, Kasten–Young 1989, webexhibits; Hulburt 1953.
- The page's colorimetry uses the Wyman fit on a 5 nm grid; against the tabulated CIE 1931 functions at 1 nm the cut-440 dominant wavelength is 486 nm (page 484); every other ch4 figure agrees to the precision quoted.
