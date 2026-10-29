# BRIEF · gravitational-lensing 引力透镜

category `earth` (Earth & Space; the registered closest id for astronomy, as orbital-motion and cosmology-expansion use), stage `university`. Built-By: Claude Sonnet 5.5 (via Mini Claude Code, batch r1); template: mean-median-mode skeleton (shared r1 generator); Verified-By: self-probe only, no independent review. Visible identifier: bilingual footer credit (no provenance rule for Claude editions; uncertainty noted).
Dedup: lens teaches the ordinary convex lens; cosmology-expansion teaches redshift and the expanding universe; neither covers light deflection by mass, Einstein rings, microlensing or lens mass (<25% overlap).

## Steps
**0 Bending of light.** Knows: gravity. Question: how much does grazing light bend? Inputs log M (0–4), b (1–50 R☉); seek α = 4GM/(c²b); Sun limb ≈ 1.75″. Drawing angle exaggerated (stated).
**1 Two images.** Knows: α. Question: why two images? Input β (0–3 θE); seek θ± = (β ± √(β²+4))/2, μ±. Controls: slider; β≈0 makes a ring.
**2 Ring size.** Knows: lens eq. Question: how big is θE? Buttons: star/galaxy/cluster; inputs log M, D_l/D_s; seek θE = √(4GM D_ls/(c² D_l D_s)); compare with resolution.
**3 Microlensing.** Knows: μ. Question: how do we see unresolved lensing? Inputs u₀, t; seek A(u) = (u²+2)/(u√(u²+4)).
**4 Arcs and rings.** Knows: images. Question: why arcs? Inputs β, ρ; seek mapped boundary of an extended circular source.
**5 Weighing.** Knows: all. Question: mass from ring? Inputs θE (0.5–3″), D_l (200–2000 Mpc), D_s/D_l (1.2–5); seek M = c²θE²D_lD_s/(4G D_ls). Links: lens#step2, cosmology-expansion#step0, reflection-refraction#step0.

## First-appearance terms
Deflection angle (0), lens equation, Einstein ring (1), Einstein radius, mas (2), magnification, microlensing (3), arc (4), lens mass (5).

## Simulation vs reality
Point-mass thin lens, weak field, Euclidean distance subtraction (not cosmological angular-diameter distances), no shear or ellipticity, no source structure beyond a circle.
