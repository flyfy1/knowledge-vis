# BRIEF · eye-vision 眼睛与眼镜

category `physics`, stage `junior`. Built-By: Claude Sonnet 5.5 (via Mini Claude Code, batch r1); template: mean-median-mode skeleton (shared r1 generator); Verified-By: self-probe only, no independent review. Visible identifier: bilingual footer credit (no provenance rule for Claude editions; uncertainty noted).
Dedup: lens covers convex-lens image formation, pinhole-camera covers pinhole images; neither covers the eye, accommodation, myopia/hyperopia, glasses power or depth of field (<30% overlap).

## Steps
**0 Eye as camera.** Knows: lens image. Question: where does a near object's image fall? Input object distance (9 positions 25 cm–∞); seek v = 1000/(58.8 − 1/u), blur-spot diameter. Control: slider; blur disc turns green when below 10 µm.
**1 Accommodation.** Knows: step 0. Question: how does the eye refocus? Inputs distance, amplitude A (0–14 D); seek required add 1/u, near point 1/A. Controls: sliders; need > A → blurred.
**2 Myopia.** Knows: focus. Question: what does axial length do? Input L (15–20 mm); seek SE = 1000/L − 58.8 D, far point 1/|SE|.
**3 Glasses.** Knows: SE. Question: which lens fixes it? Inputs L, P (−6..+4 D); seek residual blur; best P = SE.
**4 Pupil.** Knows: blur circle. Question: why does a small pupil help? Inputs pupil (1.5–8 mm), focus distance; seek depth-of-field range where blur < 10 µm.
**5 Who needs what.** Knows: all. Question: sharp range for four eyes? Buttons: normal, myope, hyperope, presbyope; seek sharp range for P=0 and P=SE. Links: lens#step2, pinhole-camera#step0, reflection-refraction#step2.

## First-appearance terms
Retina, reduced eye (0), accommodation, diopter, near point (1), myopia, hyperopia, far point, axial length (2), refractive error (3), depth of field (4), presbyopia (5).

## Simulation vs reality
Thin lens, vertex distance ignored, aberrations and diffraction ignored; 10 µm blur threshold is an approximate teaching value; the drawn ray spread before the lens is schematic; not medical advice.
