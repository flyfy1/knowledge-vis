---
lang: en
---

::: strings
docTitle: Particles & States of Matter · One Interaction per Step
back: ← Knowledge Index
pageTitle: Particles & States of Matter
tagline: Ice, water, and steam are the same stuff in three guises. Zoom in past what the eye can see, and watch one crowd of particles hold three different formations — heating just makes them wilder.
foot: Particles & States of Matter · One Interaction per Step
navLabel: Step navigation
nav0: 0 Particles in a solid
nav1: 1 Heating: wilder
nav2: 2 Melting: formation breaks
nav3: 3 Evaporation: escapes
nav4: 4 Boiling & condensing
nav5: 5 Quiz & finale
:::

## Look at a crowd of particles: in a solid they jiggle in place {#step0 h2=s0t h2part=1}

::: html step0-1
s0k: Step 0
s0e: This step answers one question: zoomed down to particle scale, what are the particles inside a “solid” actually doing? The dots are **particles** — the tiny units matter is made of, far too small to see, drawn here as little discs. They stand in a neat formation, touching each other: that is the **state of matter** (the general word for the solid, liquid, and gas forms) called solid. Press ▶ Play: every particle **jiggles around its own seat** — the picture is computed frame by frame by a real simulation, not a frozen poster; pause and the picture stops on the current frame. Click a particle to track it with a highlight: it can neither leave nor return to its seat — it can only fuss in place. The takeaway: **a solid = particles in formation, vibrating in place**; the shape stays fixed because the formation stays fixed.
canvasLabel: Particle simulation canvas; see the instructions above
pause: ⏸ Pause
reset: Reset: back to the solid start
s0hint: Click a particle to track it and watch it trapped by the formation; click empty space to untrack.
:::

::: strings
play: ▶ Play
s0ro: State: {state}; particles in total {n}; the tracked particle is now {d} (model units) from its seat.
s0roPlain: State: {state}; particles in total {n} (the same crowd from start to finish — none added, none lost).
:::

## Heating = wilder: temperature reads the particles' average kinetic energy {#step1 h2=s1t h2part=1}

::: html step1-1
s1k: Step 1
s1e: This step answers one question: what does heating change about the particles? Drag the **temperature slider** (this page's only heat source) upward and watch the particles themselves: the same crowd of solid particles jiggles visibly wider and faster, and their **kinetic energy** (the wilder the motion, the more kinetic energy — used qualitatively on this page, no formula) grows with it. The readout's **temperature (indicative)** is not copied from the slider: it is computed from the particles' average speed and mapped onto an indicative 0–120 scale; the “average speed” below is a second reading of the same speeds — the two numbers rise and fall together because they measure the same thing. **Temperature**, here, is a reading of how wild the particles are on average. Drag the slider back down and the jiggling calms — reversible. The takeaway (qualitative only): **the higher the temperature, the greater the particles' average kinetic energy** — provided it is the same crowd and no change of state has happened yet.
heatLab: Heating (temperature slider)
s1hint: The slider changes the model's thermal-agitation strength (a model parameter), not the picture — the temperature reading always comes out of the particles' speeds.
:::

::: strings
s1ro: Temperature (indicative) {t}; average particle speed {v} (model units, computed from every particle's velocity); state: {state}.
:::

## Melting: the formation breaks up — and the temperature pauses {#step2 h2=s2t h2part=1}

::: html step2-1
s2k: Step 2
s2e: This step answers one question: keep heating, and why does the solid “melt”? Push the slider further right, past the melting point (indicative reading ≈ 33): the particles jiggle free of their seats, start sliding past each other, the neat formation falls apart, and the spacing grows a little — that is **melting**, and the crowd is now a liquid (still bunched together, able to flow, hugging the bottom of the vessel). The key phenomenon: partway through there is a stretch where “the slider moves but the temperature reading stands still” — a plateau: the heat energy is spent first on breaking the formation, and the readout names it. Not one particle is lost; the count readout is right there. The takeaway: **melting = the formation falls apart and particles can slide**; melting absorbs heat while the temperature stays put (real crystals obey the same rule). One honest note: the plateau is the model diverting the heating into “breaking the formation” by design — the finale's “Model boundaries” section says so openly.
s2hint: Only after the slider crosses the whole plateau does the reading climb again — once the formation is broken, the energy can go back into making particles faster.
:::

::: strings
s2ro: Heat input (slider) {pct}% → temperature (indicative) {t}{plateau}; state: {state}; particles in total {n}.
s2plateau: " (plateau: energy is going into breaking the formation)"
:::

## Evaporation: the wildest particles escape from the surface {#step3 h2=s3t h2part=1}

::: html step3-1
s3k: Step 3
s3e: This step answers one question: a cup of water slowly dries up without ever boiling — where do the particles go? The crowd is a liquid now (slider around the middle). Watch the surface: now and then, one of the wildest particles breaks free of its neighbours' pull and flies into the space above the liquid — that is **evaporation**: it happens only at the surface, and at any temperature. The readout gives three counts — in the liquid / in the air / in total — and the total never changes. Tick “Put the lid on”: escapees bounce off the lid and come back, so the air count climbs to a level and stops — escaping and returning have reached a balance (a qualitative glimpse). The takeaway: drying up is not disappearing — the particles moved into the air; **evaporation = the wildest surface particles escaping**. Escaping carries energy away, too: a wet hand feels colder in a breeze — evaporative cooling.
lidLab: Put the lid on
s3hint: When the air count levels off, escaping and returning run at the same rate — evaporation hasn't stopped; it has balanced out.
:::

::: strings
stateSolid: solid
stateLiquid: liquid
stateGas: gas
s3ro: In liquid {liq} / in air {air} / total {n}; temperature (indicative) {t}; state: {state}.
:::

## Boiling into gas, then cooling back: one crowd, full cycle {#step4 h2=s4t h2part=1}

::: html step4-1
s4k: Step 4
s4e: This step answers one question: when a whole pot boils away, how is that different from evaporation — and what happens on cooling? Push the slider past the boiling point (indicative reading ≈ 71): every particle breaks free of the others' pull, they fly all over the vessel, and the spacing opens wide into a gas — **boiling** is a whole-crowd event, happening throughout the liquid; set it beside Step 3: evaporation was a few surface escapees. Then drag the slider back down: the same crowd slows, gathers back into a liquid first — that process is called **condensation** (a gas cooling back into a liquid) — and on further cooling lines up into formation as a solid again. One full cycle: solid → liquid → gas → liquid → solid, and the particles are the same crowd throughout — none added, none lost. The takeaway: **solid, liquid, and gas are three formations of the same particles**; changes of state are reversible and the particles themselves do not change — that is the dividing line between physical and chemical change (a later “[[molecules-atoms]]” page will pick this up; noted here in text only).
s4hint: After cooling through a full cycle, check the total: exactly where it started — only the formation and the spacing changed.
:::

::: strings
s4ro: In liquid {liq} / in air {air} / total {n}; state: {state}; temperature (indicative) {t}.
:::

## Quiz: four questions, all answered by the phenomena above {#step5 h2=s5t h2part=1}

::: html step5-1
s5k: Step 5
s5e: This step gathers the phenomena into four questions. Every question comes from the page's actual readouts and phenomena — if you're unsure, go back to the step and look again instead of guessing from memory.
q1q: Q1 · During the melting plateau, the slider is still moving right (still heating), yet the temperature reading stands still. Why?
q1o0: The thermometer got knocked by a particle and the reading is stuck
q1o1: The heat energy goes into breaking the formation first; the particles aren't getting faster yet
q1o2: During the plateau, all the particles suddenly stop moving
q2q: Q2 · What is the difference between evaporation and boiling?
q2o0: Evaporation happens throughout the liquid; boiling only at the surface
q2o1: Evaporation is a few of the wildest surface particles escaping; boiling is every particle in the liquid breaking free at once
q2o2: There is no difference — just two names for the same thing
q3q: Q3 · True or false: “Water turns into steam because the particles got bigger.”
q3o0: True
q3o1: False
q4q: Q4 · A gas cooling back into a liquid — what is that process called?
q4o0: Melting
q4o1: Condensation
q4o2: Evaporation
resetQuiz: Redo the quiz
card1t: One crowd, three formations
card1: Solid = lined up, jiggling in place; liquid = sliding past each other, formation gone but still bunched; gas = flying everywhere, far apart. Three states of matter are not three different stuffs.
card2t: Heating = wilder motion
card2: The temperature (indicative) reading is computed from the particles' average speed; the higher the temperature, the greater the average kinetic energy. This page keeps that qualitative.
card3t: Changes of state leave particles unchanged
card3: Run the full cycle solid → liquid → gas → liquid → solid and not one particle is added or lost; changes of state are reversible — what changes is the formation and the spacing.
modelTitle: This page's model boundaries (stated honestly)
modelBoundary: This page is a teaching model with three simplifications, stated openly: ① **Two-dimensional** — the particles are equal discs on a plane, not molecules in 3D space; formations and spacings hold only in 2D. ② **Collisions are schematic** — particles and walls use a simplified elastic-collision treatment, and the “bunching” of solids and liquids is approximated by a short-range constraint, not a real intermolecular force curve. ③ **The temperature is an indicative scale** — the reading maps the simulated particles' average speed onto 0–120, guaranteeing only monotonic, qualitatively correct behaviour, not an exact correspondence with real degrees Celsius; the melting and boiling points are set values on this indicative scale, and the plateau is the model diverting the heating into “breaking the formation” by design, not something that emerges spontaneously from the simulation.
finNote1: Coming later (not yet built — a text note only, no link): “Temperature & Heat” will take up heat, specific heat capacity, and heat transfer as the next stop on this thread.
finNote2: The site's existing velocity page covers the velocity–time graphs of macroscopic objects; its landing point doesn't fit this page's microscopic particle speeds, so no link is made here — this page's “fast and slow” is just the average speed in model units.
:::

::: strings
q1ok: Right — the energy breaks the formation first; the average speed doesn't rise, so a temperature read off the speeds doesn't move.
q1no: Not quite. Ask instead: while the reading is stuck, are the particles spreading out of formation or getting faster? Look at Step 2's plateau again.
q2ok: Right — one is a surface event, the other a whole-crowd event. Steps 3 and 4 put them side by side.
q2no: No: one happens only at the surface, the other throughout the liquid. Compare Steps 3 and 4.
q3ok: Right, it's false — the particles don't change; the spacing and formation do. Switch to any state and check with the counts and single-particle tracking yourself.
q3no: Think again: does heating change the particles themselves, or their formation and spacing?
q4ok: Right — condensation, the counterpart of melting (one is solid→liquid, the other gas→liquid).
q4no: No — melting is solid→liquid; gas→liquid is its counterpart at the other end.
score: {k} / 4 correct
hintHead: All four correct · Wrap-up hint
hintBody: During melting, the energy breaks the formation first — hence the temperature plateau (Step 2); evaporation is a few surface escapees while boiling is the whole crowd breaking free (compare Steps 3 and 4); the particles themselves never change — only the spacing and formation do; gas→liquid is condensation. Through every change of state the particles are the same crowd — that is the dividing line between physical and chemical change, and the doorway to the next thread.
:::
