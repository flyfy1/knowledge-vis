---
lang: en
---

::: strings
back: ← Knowledge Index
category: Mathematical Foundations
stage: Junior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Similarity & Scaling · Lengths, Areas and Volumes Each Change Differently
tagline: A projector enlarges a picture k times: lengths grow k times, areas k² times, volumes k³ times, while shape and angles stay the same.
:::

## Enlarge a triangle k times: what happens to its sides and angles? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Same shape
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: SAME SHAPE
:::

This step answers: what changes and what does not when we enlarge? Taking the lower-left corner as the centre, multiply every point’s distance from the centre by k (k is the **scale factor**). Drag k: all three sides become k times as long but the three angles do not change at all, so the enlarged shape is **similar** to the original (same shape, different size). {#s0e .explain}

::: html step0-2
s0cv: The original triangle (dashed) and the enlarged one
kk: Enlargement factor k
:::

::: strings
s0ro: k = {k}: sides {a}, {b}, {c} (were {a0}, {b0}, {c0}), each {k} times the original; angles {x}°, {y}°, {z}° as before.
:::

## Make the side k times longer: how many times larger is the area? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Area k²
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: AREA k²
:::

This step answers: how does area scale with side length? A small square of side 1 has area 1. A square of side k needs k rows of k tiles, k × k = k² tiles. Drag k: the side is only k times as long, but the area is k² times as large. {#s1e .explain}

::: html step1-2
s1cv: A square of side k tiled with unit squares
kInt: Side k (whole number)
:::

::: strings
s1ro: Side {k}: {n} unit tiles cover it, so the area is {n} = {k}² times the original (1); the perimeter is {k} times as long.
:::

## Make the edge k times longer: how many times larger is the volume? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Volume k³
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: VOLUME k³
:::

This step answers: by what factor does volume grow? A small cube of edge 1 has volume 1. A big cube of edge k needs k layers of k × k blocks, k³ blocks. Covering its surface takes 6 faces of k² squares each, 6k² squares in all, still k² times the area. {#s2e .explain}

::: html step2-2
s2cv: A big cube of edge k made from unit cubes
kCube: Edge k (whole number)
:::

::: strings
s2ro: Edge {k}: volume {v} = {k}³ unit cubes ({v} times the original); surface {s} = 6 × {k}² unit faces.
:::

## How can we measure a tree without climbing it? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Shadow height
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: SHADOW HEIGHT
:::

This step answers: how do similar triangles help us measure height? At one moment sunlight rays are parallel, so a vertical stick and a tree each form a right triangle with their shadows, and the two triangles are **similar**: corresponding sides are in proportion, tree height ÷ tree shadow = stick height ÷ stick shadow. The stick is 1.5 m tall; drag the two shadow lengths and the tree height is worked out. {#s3e .explain}

::: html step3-2
s3cv: The stick, the tree and their shadows
sh1: Stick’s shadow (m)
sh2: Tree’s shadow (m)
:::

::: strings
s3ro: Stick 1.5 m, stick shadow {s} m: ratio {r}; tree shadow {S} m, so tree height = {S} × {r} = {H} m.
:::

## 3 cm on the map: how far is that really? And the area? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Map scale
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: MAP SCALE
:::

This step answers: how does a map scale convert lengths and areas? A scale of 1 : N means 1 cm on the map stands for N cm in reality. Lengths convert by a factor of N; areas by N²: 1 square centimetre on the map stands for N × N square centimetres on the ground. Choose a scale and drag the map side. {#s4e .explain}

::: html step4-2
s4cv: A square on the map and the real size it stands for
den: Scale denominator N
len4: Side on the map (cm)
:::

::: strings
s4ro: 1 : {N}, map side {L} cm: real side {R} km; map area {A} cm², real area {AR} km² ({N}² times the map area).
:::

## Why can’t giants stand up? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: why can’t everything just be scaled up as it is? Enlarge a creature k times: height ×k, bone cross-section ×k², weight (proportional to volume) ×k³. The weight each square centimetre of bone must carry = weight ÷ cross-section, which becomes ×k. Treat “bone breaks when its load reaches 3 times the original” as an illustrative threshold and drag k. {#s5e .explain}

::: html step5-2
s5cv: Length, area, volume and the load on the bones
kG: Enlargement factor k
recapTitle: Recap
recap1: Similar: same shape, equal corresponding angles, the same ratio of corresponding sides; that ratio is the scale factor k.
recap2: Length ×k, area ×k², volume ×k³.
recap3: Because area and volume grow at different rates, enlarged things face different stresses: this is why giants and elephants need thicker legs.
modelTitle: Scope and limits of this model
modelText: This is ideal geometric enlargement: material, shape and proportions never change. “Bone strength proportional to cross-section, weight proportional to volume, breaks at 3×” is an illustrative simplification; real skeletons and body shapes change with size. Map-scale conversion also ignores terrain and projection distortion.
linkArea: → Multiplication as Area: how area is counted in squares
linkPin: → Pinhole Camera: light in straight lines, images scaled in proportion
linkPer: → Perimeter vs Area: perimeter and area are different things
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5ro: k = {k}: length ×{k}, cross-section ×{a}, weight ×{v}; load per square centimetre of bone ×{st}. {res}
okRes: Still holds.
failRes: Past the illustrative 3× threshold: the bones fail.
docTitle: Similarity & Scaling · Lengths, Areas and Volumes Each Change Differently
:::
