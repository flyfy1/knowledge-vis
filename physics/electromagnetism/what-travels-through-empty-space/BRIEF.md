# BRIEF — what-travels-through-empty-space

Author: Claude Code (claude-fable-5-2), 2026-11-18. Chinese only; `content.en.md` is a structural stub written by
`tools/en-stub.cjs` (page.json `"languages": {"en": "stub"}`). Status: unregistered draft (no `"status"` in page.json),
not translated, not independently reviewed. Queue entry: `specs/essay-briefs/QUEUE-DEEP2.md` §3.

Title: 信号穿过真空的时候，到底是什么在传 / What Is Actually Travelling When a Signal Crosses Empty Space.

## What the page is

13 chapters, 14 models (labs), 12 static diagrams (each a wide and a narrow inline SVG), 2 formula blocks.

1. Fields as real things; ε₀ and μ₀ as bench-top constants. No model. Links electric-fields, magnets, magnetic-force,
   electromagnetic-induction.
2. Maxwell's four laws in words; the displacement current. Fig 1 (four laws), Fig 2 (one loop, two surfaces).
   Lab: a charging capacitor — wire current, ε₀ dΦ/dt by finite difference, B on a loop in the gap and round the wire,
   with Maxwell's term switched off.
3. The wave equation from the two curl laws; c = 1/√(μ₀ε₀). Fig 3 (E, B, direction), Fig 4 (Yee grid).
   Lab: 1-D FDTD between metal walls; Courant number slider; measured speed, energy, blow-up above S = 1.
4. In a material v = c/n; Fresnel at normal incidence. Fig 5. Lab: the same grid with an index step.
5. Radiation from accelerating charges: the kink, Larmor, sin²θ, why atoms should collapse classically; dipoles.
   Fig 6. Lab: centre-fed dipole of any length (pattern, directivity, radiation resistance, beamwidth, lobes).
6. Poynting flux, inverse square, radiation pressure; polarisation and Malus. Fig 7.
   Labs: sunlight against distance from the Sun; polarisers inserted between a crossed pair.
7. One spectrum: λ, f, hf against kT; ionisation; the 2.45 GHz myth; infrared and greenhouse; phone exposure as the
   agencies state it. Fig 8. Labs: the whole spectrum; Debye water.
8. The atmosphere. Fig 9. Lab: ITU-R P.676-13 line-by-line absorption, 1–1000 GHz, at the ground or to zenith.
9. Carrying information: AM, FM, QAM, bandwidth; Friis. Fig 10.
   Labs: modulate a carrier and see the DFT spectrum; four link budgets (Wi-Fi, phone to tower, GPS, Voyager 1).
10. Fibre: total internal reflection, loss against wavelength, why 1550 nm. Fig 11. Lab: loss curve and span.
11. Diffraction limit and phased arrays. Fig 12. Labs: two Airy patterns; N-element array factor with steering.
12. Frontier as of November 2026, split into established / demonstrated / claimed-or-planned.
13. Four questions to ask of any link; reading list; sources.

Limits stated on the page: the FDTD is one-dimensional, lossless and non-dispersive; the dipole assumes a sinusoidal
current on a thin wire (real half-wave antennas are cut to about 0.47–0.48 λ); water is a single-relaxation Debye model
at 25 °C; the atmosphere is the mean reference atmosphere with gases only (no rain, cloud or ionosphere); link budgets
are free-space; fibre loss is Rayleigh + infrared edge only (no OH peak, no bending); the array is isotropic elements.

## Sources (opened 2026-11-18 unless noted)

Constants and textbook results
- CODATA 2022 (μ₀, ε₀, h, e, k, mₑ, a₀); SI 2019 exact values. From memory, cross-checked by c = 1/√(μ₀ε₀) to 1e-9.
- IAU 2015 Resolution B3: nominal solar luminosity 3.828e26 W, irradiance 1361 W/m². From memory.
- K. S. Yee, IEEE Trans. Antennas Propag. 14(3), 1966 (the grid). Not opened; the scheme is the textbook one.
- Balanis, Antenna Theory (dipole D, Rr, HPBW; uniform array HPBW); Griffiths, Electrodynamics (Larmor, classical atom
  lifetime); Born & Wolf (73.5% Rayleigh dip). Values typed into tests/models.cjs from memory of these books.
- ITU-R P.676-13 (08/2022), Annex 1 line-by-line. Line tables taken from the ITU-Rpy GitHub mirror, not from the ITU
  PDF; the implementation reproduces ITU's own validation rows (ITURP676-13_gamma.csv, 350 rows) to 1e-14. Ten of those
  rows are typed into the test. P.835 reference atmosphere constants are from memory.

Agencies and standards
- ICNIRP, https://www.icnirp.org/en/frequencies/radiofrequency/index.html — heating is the only substantiated effect.
  Limits 0.08 W/kg whole body, 2 W/kg head and torso over 10 g (ICNIRP 2020, Health Physics 118(5)): via secondary
  sources, the guideline PDF was not opened.
- FCC 1.6 W/kg over 1 g (47 CFR 1.1310): via search results; fcc.gov returned 403.
- WHO radiofrequency fact page — the Environmental Health Criteria monograph is still not published.
- IARC Monographs vol. 102 (2013; evaluation 2011): group 2B. From memory.
- Karipidis et al., Environment International 191, 108983 (2024). Abstract via search; criticism noted on the page.

Frontier (all in models.js `FRONTIER`)
- Voyager 1 one light-day on 2026-11-18, 173.14 au: https://earthsky.org/space/voyager-1-1-light-day-from-earth-november-17-18-2026/
  (dated 2026-11-17, attributing NASA). Transmitter 22–23 W (22.4 used), 3.7 m dish, 8.4 GHz, 160 bit/s: NASA Voyager
  pages via search.
- NICT 1.02 Pb/s, 1,808 km, 19 cores, 0.125 mm cladding: https://www.nict.go.jp/en/press/2025/05/29-1.html (2025-05-29).
- NICT/UCL 450 Tb/s, 39 km of installed fibre in London: https://www.eurekalert.org/news-releases/1130094 (2026-06-01;
  OFC 2026 postdeadline, 2026-03-19). The release says the signal "occupied 42.4 THz" and gives 1,264.0–1,617.8 nm,
  which is 51.9 THz edge to edge; the page states both and says the release does not explain the difference.
- Hollow-core fibre 0.091 dB/km at 1550 nm, < 0.2 dB/km over 66 THz: Petrovich et al., Nature Photonics 19, 1203–1208
  (2025), doi 10.1038/s41566-025-01747-5. Search summary only; the paper was not opened.
- 3GPP 6G timeline: https://www.ericsson.com/en/blog/2026/6/6g-standardization-key-milestones-and-ran-decisions
  (2026-06-12) — a vendor's account, not a 3GPP document.
- WRC-27 agenda item 1.7 bands (WRC-23 Resolution 256): via a CEPT brief in search results.
- IEEE 802.11be published 2025-07-22: IEEE SA record via search. 320 MHz and 4096-QAM: from memory.
- IEEE 802.11bn draft, approval forecast 2028: trade press.
- DOCOMO/NTT/NEC/Fujitsu 100 Gb/s at 100 and 300 GHz over 100 m (2024-04-11): reprints of the release.
- NASA DSOC: https://www.nasa.gov/missions/psyche-mission/nasas-deep-space-communications-demo-exceeds-project-expectations/
  (2025-09-18).
- Starlink direct-to-cell satellite count (> 650, October 2026): aggregator sites only.
- ASML EXE:5200B product page (NA 0.55, 8 nm). Deliveries, Intel acceptance (December 2025) and volume production
  2027–2028: trade press.
- LCLS-II first light September 2023; LCLS-II-HE 8 GeV, first light planned October 2027: SLAC material via search.

## Not verified from a primary source

- Debye parameters for water at 25 °C (ε_s 78.36, ε_∞ 5.2, τ 8.27 ps; Kaatze 1989). Search confirmed about 78.4 and
  8.2–8.3 ps only.
- Fibre infrared-absorption constants 7.81e11 · exp(−48.48/λ) dB/km (Keiser's textbook form), from memory.
- FR1/FR2 ranges (3GPP TS 38.104), GPS −158.5 dBW (IS-GPS-200) and the 25 W / 13.5 dBi GPS budget.
- ICNIRP and FCC limit values, the hollow-core paper, the Starlink count, the Wi-Fi 8 date, the high-NA schedule, the
  LCLS-II-HE date, the DOCOMO original release (see above).
- Solid-silica loss floor "0.14–0.2 dB/km" in ch12 (record pure-silica-core fibres are about 0.14 dB/km): from memory.
- The rain sentence in ch8 and "0.47–0.48 λ" in ch5 are textbook generalities, not checked against a source.

## Tuned, not sourced

- Fibre: Rayleigh coefficient 0.9 dB/km·µm⁴, core index 1.468, index step 0.36% (chosen so 1310/1550 nm land in the
  usual 0.32–0.35 / 0.18–0.20 dB/km bands).
- Link presets: Wi-Fi 0.1 W, 2 dBi, 10 m, 20 MHz, 6 dB noise figure; phone 0.2 W to a 17 dBi tower at 2 km, 10 MHz;
  GPS receiver 2 dB noise figure; Voyager antenna efficiencies 0.6 and 0.65, system temperature 20 K.
- Eye pupil 3 mm; ionisation threshold "about 10 eV" (a convention); band edges of the spectrum (conventions);
  water-vapour scale height 2 km; capacitor (9 V, 1 kΩ, 5 cm plates, 1 mm gap) and grid sizes (600 cells, 1 mm).

## Decisions

- The FDTD lab shows E and c·B on separate tracks so the reader sees that they move together and that only E flips at a
  metal wall. The update contains only μ₀, ε₀, dx and dt; c is measured from the pulse, not written in.
- "Blown up" means the field passed 1000 times the launch amplitude; the grid stops on that step.
- Fresnel validity is limited to n in [1, 3] in the lab: beyond that the pulse is too few cells wide in the dense side.
- Phone exposure: only what ICNIRP, WHO and IARC state, with the limits and the open WHO assessment; no verdict added.
- Essays named by title only (unregistered drafts): 《一根线到底能传多少信息》, 《芯片为什么越来越难做》.
- Bindings are language-neutral, so dates are written out in the prose and checked against `FRONTIER` in the test.

## Checked / not checked

Checked (2026-11-18): build of this directory; `tests/models.cjs`; `tests/browser.cjs` in Chinese at 1280/390/320
(overflow, clipping, 48 px targets, every live-sentence branch, keyboard, reduced motion, console errors);
`tests/canvas-text-overlap.cjs --sweep`; screenshots of all 12 diagrams and 14 labs at the three widths.

Not checked: English (stub); independent review; registration, atlas import, provenance label; real devices; screen
readers beyond aria-labels; items listed under "Not verified from a primary source".

## Facts that will go stale

Everything in ch12 and the Voyager distance (173.14 au on 2026-11-18, growing about 3.6 au a year), each with its URL
and date above. Most likely to change first: Starlink satellite count; 3GPP Release 20/21 dates and the WRC-27 outcome
(late 2027); IEEE 802.11bn approval; fibre capacity and hollow-core loss records; high-NA EUV production dates;
LCLS-II-HE first light; publication of the WHO radiofrequency monograph; any revision of ICNIRP or FCC limits;
ITU-R P.676 revisions (‑13 used).

## Site gaps noticed

No page on: decibels; complex permittivity / dielectrics; antennas; Shannon capacity (the information essay is an
unregistered draft); Bessel functions; the ionosphere.
