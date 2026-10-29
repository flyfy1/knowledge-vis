# BRIEF · atmospheric-circulation 大气环流与季风

category `earth`, stage `senior`. Built-By: Claude Sonnet 5.5 (via Mini Claude Code, batch r1); template: mean-median-mode skeleton (shared r1 generator); Verified-By: self-probe only, no independent review. Visible identifier: bilingual footer credit line (provenance spec gives no rule for Claude editions; uncertainty noted).
Dedup: seasons-orbit covers tilt and the overhead Sun; climate-energy covers the surface energy budget; neither teaches circulation cells, Coriolis wind belts or monsoons (<80% overlap).

## Steps
**0 Uneven heating.** Knows: sunlight hits the ground. Question: how does latitude set heat per area? Input latitude; seek cos φ and beam spread 1/cos φ. Control: slider; beam widens, point slides down the curve. Holds: annual-mean-like cos φ, ignores tilt, atmosphere, clouds.
**1 One-cell loop.** Knows: heating differs. Question: what flow can a contrast drive? Input contrast ΔT; seek toy speed 0.35√(ΔT/30). Control: slider thickens arrows, Play moves parcels, Reset restores 30 K. ΔT=0 stops the flow. Holds: toy relation, no rotation.
**2 Coriolis.** Knows: moving air. Question: why not a straight wind? Input latitude; seek f = 2Ω sin φ and direction. Control: slider flips the deflection side across the equator and scales the bend. Holds: qualitative; real balance involves friction and pressure gradients.
**3 Three cells.** Knows: deflection. Question: which way is the wind in each band? Input latitude; seek belt, zonal direction, vertical motion. Control: slider moves the line through bands. Holds: idealised 3-cell mean state.
**4 Monsoon.** Knows: air rises where hot. Question: why does a coastal wind reverse? Input month; seek land−sea ΔT = 10cos(2π(m−7)/12), sign gives direction. Control: slider turns and rescales arrows. Holds: toy sinusoid; real monsoons also involve moisture and rain-belt shifts.
**5 Wet and dry.** Knows: rising/sinking belts. Question: where does it rain? Inputs latitude, shift; seek schematic wetness 0.5+0.5cos(6(φ−s)). Control: sliders move the marker and shift the curve (faint curve = unshifted). Holds: schematic only. Links: seasons-orbit#step2, climate-energy#step0, latitude-longitude#step0.

## First-appearance terms
Beam spread (0), convection loop (1), Coriolis deflection and f (2), Hadley, Ferrel and polar cells, trade winds, westerlies, polar easterlies (3), monsoon (4), rain belt and wetness index (5).

## Simulation vs reality
No continents, no moisture or latent heat, no jet streams; the 1/cos spread and cos φ heating ignore axial tilt; the toy loop speed and sinusoidal monsoon difference are teaching devices, not data; the wetness index is a cosine, not rainfall.
