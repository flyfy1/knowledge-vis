---
lang: en
---

::: strings
docTitle: Reflection & Refraction · How Light Turns at a Surface — One Interaction at a Time
back: ← Knowledge Index
pageTitle: Reflection & Refraction
tagline: Light travels straight inside one medium, but at a boundary it turns: it bounces off a mirror with the angle of reflection equal to the angle of incidence, bends as it enters water, and — at too steep an angle — reflects entirely back. Every ray on this page is computed from the real laws before it is drawn. Drag, measure, and see what light actually obeys.
foot: Reflection & Refraction · One Interaction at a Time
navLabel: Step navigation
nav0: 0 Mirror bounce
nav1: 1 Diffuse reflection
nav2: 2 Bending into water
nav3: 3 Total reflection
nav4: 4 The fooled eye
:::

## Mirror bounce: angle in equals angle out {#step0 h2=s0t h2part=1}

::: html step0-1
s0k: Step 0
s0e: Question: when light hits a mirror, which way does it go? Two terms first: the **normal** is the imaginary line perpendicular to the mirror at the point of incidence (the dashed line in the diagram); the **angle of incidence** is measured between the incoming ray and the normal, and the **angle of reflection** between the reflected ray and the normal — both are measured from the normal, never from the mirror surface. Drag the light source in the diagram (or use the slider) and watch the two arc readings: however you drag, the angle of reflection always equals the angle of incidence. This holds for smooth, mirror-like surfaces.
canvasLabel: Interactive ray diagram for this step; instructions appear above
s0angLab: Angle of incidence (or drag the source in the diagram)
s0p0: Incidence 0° (head-on)
s0p60: Incidence 60°
reset: Reset this step
s0hint: Note: angles are measured from the normal. Measured from the mirror surface you would get 90° minus this value — textbooks always use the normal as the reference.
:::

::: strings
s0ro: Angle of incidence = {i}, angle of reflection = {r} — equal.
s0zero: The ray now hits the mirror head-on (incidence 0°) and returns along its own path.
cNormal: normal
cMirror: mirror
cIn: in
cRefl: out
cRefr: bent
cAir: air
cWater: water
cTIR: total internal reflection
:::

## Rough surfaces: diffuse reflection obeys the same law {#step1 h2=s1t h2part=1}

::: html step1-1
s1k: Step 1
s1e: Question: paper is not smooth, so why can we read it — yet never see our face in it? Zoomed in, a rough surface is a crowd of tiny facets tilted every which way, each with its own **normal** (the imaginary line perpendicular to that facet). A parallel beam lands on them; each ray still reflects with angle out equal to angle in at its own facet — this is **diffuse reflection**: the law does not fail; the normals point in different directions, so the reflected light scatters. Switch between the three views to compare.
s1bMirror: Mirror
s1bRough: Rough surface
s1bBoth: Side by side
s1hint: We can see non-luminous objects at all because diffuse reflection sends some of the light into our eyes from almost any viewing position.
:::

::: strings
s1roMirror: Mirror: the normal points the same way everywhere, so parallel incoming rays stay parallel after reflecting — that is why a mirror forms a sharp image.
s1roRough: Rough surface: the three rays land on three differently tilted facets; each obeys the law but heads off in its own direction — the light spreads out, no image forms, yet the surface is visible from almost anywhere.
s1roBoth: Side by side: an orderly reflection on the left, a scattered one on the right. Only the directions of the normals differ — the law itself is unchanged.
cBeam: parallel beam
:::

## Bending into water: refraction turns toward the normal {#step2 h2=s2t h2part=1}

::: html step2-1
s2k: Step 2
s2e: Question: how does an oblique ray change angle when it enters water from air? The **normal** is perpendicular to the surface at the hit point. Incidence θ₁ and refraction θ₂ are measured from the normal on their respective sides. Drag the source or use the slider with the media fixed. At oblique incidence, the smaller refraction angle turns the ray toward the normal; at normal incidence both angles are0°. Expand the sine relation below to check this same ray.
s2angLab: Angle of incidence, air side (or drag the source)
s2p0: Incidence 0° (straight in)
s2hint: The refractive index n=c/v is vacuum light speed c divided by the phase speed v in the medium; it is dimensionless. This ideal model fixes air at1.00 and water at1.33, with homogeneous, non-absorbing media and no dispersion. It computes ray directions, not travel times or reflected/transmitted energy fractions.
snellTitle: Math connection: can a real refraction angle exist?
snellIntro: Given indices n₁,n₂ and incidence θ₁ measured from the normal, find refraction θ₂. Snell’s relation is n₁sinθ₁=n₂sinθ₂. First compute s=(n₁/n₂)sinθ₁; only0≤s≤1 gives a real angle from0° to90°. arcsin means the inverse sine function, not1/sin. The values below share the ray diagram’s state.
snellExplain: sinθ is a coordinate on the unit circle, or opposite side divided by hypotenuse in a right triangle. Here θ starts at the normal, so sinθ gives the component along the interface, not an angle measured from the water surface.
snellAirPredict: Check yourself: air→water at0° does not bend. At30°, sinθ₂=0.5/1.33, so refraction should be below30°. Verify with the original slider, then use step3 to see why the reverse direction may have no real angle.
snellMathLink: Review the unit circle: coordinates define sin and cos →
snellReturn: Return to this ray and its original controls ↑
snellSource: Model source: OpenStax · refraction and Snell’s law ↗
snellCriticalSource: Critical-angle conditions and limiting case · OpenStax ↗
:::

::: strings
s2ro: Angle of incidence = {i}, angle of refraction ≈ {r} (computed from Snell's law); the ray bent by {d} at the surface.
s2ro2: Refraction angle < incidence angle: entering water, the ray leans toward the normal.
s2zero: At 0° there is no bend — the ray goes straight through. What changes is the speed: light travels slower in water than in air (this page leaves it at that).
snellValue: n₁={n1}, n₂={n2}; θ₁≈{i}; sinθ₂=s≈{s} → θ₂≈{out}.
snellNone: n₁={n1}, n₂={n2}; θ₁≈{i}; s≈{s} (rounded); unrounded s>1: no real refraction angle. No arcsin or propagating refracted ray is drawn.
snellCritical: n₁={n1}, n₂={n2}; θ₁≈{i}; exactly critical s=1 → θ₂=90° (limiting ray).
s3rounding: θc≈{detail} (extra digits are still approximate). The critical preset keeps the computed value; manual48.8° is above it. Equal rounded48.8° labels do not mean equal states.
:::

## The other way: water to air, and total internal reflection {#step3 h2=s3t h2part=1}

::: html step3-1
s3k: Step 3
s3e: Question: when can light in water no longer propagate into air? Both angles are again measured from the **normal**, perpendicular to the surface. Below the critical angle, oblique rays bend away from the normal; at normal incidence both angles are0°. The incidence that gives refraction90°, the limiting ray along the surface, is the **critical angle**. Strictly above it, there is no propagating refracted ray in air: the ideal interface totally reflects the light inside water. Try30°, the exact critical preset and60°; predict whether a refracted ray exists before checking.
s3bridge: Try 30°, the critical angle and 60°: the refracted ray approaches the surface, runs along it at critical, then disappears above critical while reflection remains.
s3angLab: Angle of incidence, water side (or drag the source)
s3p30: Incidence 30°
s3p60: Incidence 60°
s3hint: This critical angle requires higher incident index n₁ and lower exit index n₂: θc=arcsin(n₂/n₁). Here n₁=1.33 and n₂=1.00. The displayed48.8° is rounded; the preset uses the unrounded value. Arrow keys change0.1°; Home/End select0°/80°; dragging is continuous. Below critical, the faint orange ray is ordinary reflection. Line thickness and colour do not encode energy fractions.
snellPredict: Check yourself: keep the water-to-air indices fixed. At30°, s=1.33×sin30°=0.665, so a refracted ray exists. At60°, s≈1.152>1, so total internal reflection occurs. Verify with the original presets. The critical preset does not re-enter the rounded48.8° display.
:::

::: strings
s3pCrit: Critical preset (unrounded)≈{crit}
s3roRefr: Angle of incidence = {i}, angle of refraction ≈ {r} — larger than the incidence angle; the ray leans away from the normal.
s3roCrit: Exact critical preset/boundary: incidence≈{crit}, refraction90°. This is the limiting ray along the surface, not the strictly supercritical branch.
s3roTIR: Total internal reflection: unrounded incidence exceeds critical. Displayed incidence≈{i}, critical≈{crit} (both rounded). No propagating refracted ray or real angle; the orange ray still obeys reflection.
s3ro2: The critical angle is ≈ {crit} (computed from arcsin(1/1.33)) — drag past it and see.
:::

## The fooled eye: the fish is not where it looks {#step4 h2=s4t h2part=1}

::: html step4-1
s4k: Step 4
s4e: Question: how deep does the fish appear if we trace the ray reaching the eye backward? Light from the fish refracts at the water surface. This diagram **extends the outgoing ray backward** to the vertical reference line through the real fish and marks an apparent depth there. Move the eye or its slider to compare depths on that line. This explains a shallower appearance; it is not a full multi-ray virtual-image solution.
s4bridge: Follow one ray out of the water, then extend it backward: the eye traces the last segment back and places the fish higher.
s4eyeLab: Eye position, left–right (or drag the eye in the diagram)
s4hint: The apparent point stays on the vertical reference line through the fish; only depth is compared, not lateral image motion. Near the overhead, paraxial limit, apparent depth≈real depth/1.33. That ratio is not used at large viewing angles.
q1t: Quiz 1 · A ray hits a mirror at an incidence angle of 40°. What is the angle of reflection? (Measured from the normal.)
q1o0: 40°
q1o1: 50°
q1o2: 80°
q2t: Quiz 2 · Light enters water from air at 50°. The angle of refraction is —
q2o0: smaller (bent toward the normal)
q2o1: larger (bent away from the normal)
q2o2: the same — no bend
q3o0: It refracts out, with a larger angle
q3o1: The refracted ray skims along the surface
q3o2: Total internal reflection — all of it reflects back
finK: Finale
finT: Wrap-up: three rules at a boundary
fc1t: Reflection: equal angles out
fc1b: Angle of reflection = angle of incidence, both measured from the normal. The smoother the surface, the tidier the reflection; a rough surface only scrambles the normals, not the law.
fc2t: Refraction: a new medium may change direction
fc2b: Oblique air-to-water rays bend toward the normal; water-to-air rays bend away below critical. Normal incidence does not bend. Snell’s n₁sinθ₁=n₂sinθ₂ sets direction; n=c/v is dimensionless.
fc3t: Virtual images: the eye looks back wrongly
fc3b: The outgoing ray is extended backward to the fish’s vertical line to compare apparent depth. This reference-line illustration is not a full virtual-image solution.
opticsAtlas: See the atlas: unit circle → Snell and total reflection →
nextLens: Continue the existing lens lesson: why focus separates real and virtual images →
finNote: The existing thin-lens lesson adds a focal-length relation. It is distinct from this plane-interface model and from pinhole imaging.
:::

::: strings
s4ro: Real depth {real} units; it looks like only ≈{app} units — the fish is lifted by about {diff} units.
cEye: eye
cFish: real fish
cFishV: virtual image
q1why: Angle of reflection = angle of incidence = 40°, both measured from the normal. 50° is the value measured from the mirror surface — the classic wrong reference.
q2why: From air into water the ray bends toward the normal: the refraction angle is ≈ 35.2°, smaller than 50° (drag Step 2 to 50° and check).
q3t: Quiz 3 · A source under water shines at the surface with an incidence angle of 60° (critical angle ≈{crit}). What happens?
q3why: 60° is beyond the critical angle ≈{crit}, so no refracted ray exists; all the light reflects back into the water — the state you dragged to in Step 3.
fbRight: Correct.
fbWrong: Not quite — think again; you can go back and test it in the earlier steps.
score: Quiz progress: {k}/3 correct, {f} of them on the first try.
scoreIdle: Quiz progress: not started yet.
s3zero: Incidence0°, refraction0°: no directional bend, including water to air. Ordinary reflection may still occur; that is not total internal reflection.
:::
