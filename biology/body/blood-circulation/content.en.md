---
lang: en
---

::: strings
languageLabel: Language
back: ← Knowledge Index
navLabel: Step navigation
catBadge: Biology
stageBadge: Junior High
foot: Blood Circulation · Built by Claude Sonnet via Mini Claude Code · static bilingual page
docTitle: Blood Circulation · A Drop of Blood and Its Double Loop
pageTitle: Blood Circulation
tagline: A drop of blood leaves the left ventricle, visits the whole body, returns to the heart, then goes to the lungs — two loops on one heart, with red and blue showing only oxygen content.
:::

## After leaving the left ventricle, which two loops does a drop of blood travel before it is back where it started? {#step0 h2=s0t}

::: strings
nav0: 0 One drop’s route
:::

Step 0 · One drop’s route {#s0k .step-kicker i18n=text}

This step asks: what route does blood take through the body? Human circulation is **two loops**: the **systemic loop** — the left ventricle pumps blood out through arteries to capillaries all over the body, where it gives up oxygen, and veins return it to the right atrium; and the **pulmonary loop** — the right ventricle pumps blood to the lungs, where capillaries take up oxygen, and pulmonary veins return it to the left atrium. Colour shows oxygen content: red = rich, blue-purple = poor — that is only a drawing convention, real blood is always red. Press “Play” and watch the dot make a full circuit and where its colour changes. {#s0e .explain}

::: html step0-1
s0stage: Route diagram (not to scale): the top loop passes through the lungs, the bottom loop through the body; the dot is one drop of blood, its colour its oxygen content right now
s0canvas: Circulation diagram: a drop leaves the left ventricle, goes through the body to the right atrium, then through the lungs to the left atrium, changing colour in the capillaries
s0hr: Heart rate
s0play: Play
s0next: Skip to next section
s0reset: Back to the start
:::

Takeaway: blood passes through the systemic and pulmonary loops and a circuit ends back at the left ventricle; the colour changes at two capillary beds — blue in the body (tissues take the oxygen), red in the lungs (oxygen taken up). Holds for this schematic; a real circuit takes about a minute (sped up roughly 10× here), and “pulmonary artery carries oxygen-poor blood” follows from naming by flow direction. {#s0result .readout i18n=text}

::: strings
s0pause: Pause
s0ro: Now: {seg}; blood oxygen about {sat}% ({col}); {loops} full circuits done (systemic + pulmonary = 1 circuit).
s0red: oxygen-rich, drawn red
s0blue: oxygen-poor, drawn blue-purple
s0mid: exchanging oxygen, colour changing
:::

## Why is the heart split into four chambers with valves? {#step1 h2=s1t}

::: strings
nav1: 1 Four chambers
:::

Step 1 · Four chambers {#s1k .step-kicker i18n=text}

This step asks: in one heartbeat cycle, what do the four chambers and the valves do in turn? The top two are **atria** (they receive blood), the bottom two are **ventricles** (they pump); **valves** between atria and ventricles and between ventricles and arteries act like one-way doors. Drag “cycle progress” or press play: first the atria squeeze blood into the ventricles, then the ventricles squeeze it into the arteries, then everything relaxes and refills. A faster rate pumps more per minute: cardiac output = stroke volume × heart rate. {#s1e .explain}

::: html step1-1
s1stage: Heart sketch: the left half is the right heart (receives body blood), the right half is the left heart (receives lung blood); a smaller chamber means squeezing, green valves are open, red ones closed; playback is slowed about 4×
s1canvas: A four-chamber heart sketch: atria then ventricles squeeze in turn and valves open one way as the cycle advances
s1hr: Heart rate
s1ph: Cycle progress
s1play: Play
:::

Takeaway: valves force one-way flow and atria and ventricles squeeze in relay; cardiac output = stroke volume × heart rate. Holds with stroke volume 70 mL; the three phases are drawn as about 1/8, 3/8 and 4/8 of the cycle, while real timing shifts with heart rate. {#s1result .readout i18n=text}

::: strings
s1pause: Pause
s1ro: Cycle {ph}%: {state}; heart rate {hr} beats/min, about {T} s per cycle; cardiac output = {sv} mL × {hr} = {co} L/min.
s1st0: atria squeeze, pushing blood into the ventricles (valves between them open, artery valves shut)
s1st1: ventricles squeeze, shooting blood into the arteries (valves between chambers shut, artery valves open)
s1st2: everything relaxes and blood refills atria and ventricles (valves between chambers open, artery valves shut)
:::

## Why does blood flow slowest in the capillaries? {#step2 h2=s2t}

::: strings
nav2: 2 Three vessels
:::

Step 2 · Three vessels {#s2k .step-kicker i18n=text}

This step asks: for the same stream of blood, how does speed change from vessel to vessel? The flow Q (blood per minute) is the same all around the circuit, and the more **total cross-section** A the vessels add up to, the lower the speed v = Q ÷ A. From aorta to capillaries the vessels branch so much that the total area grows more than a thousand times, so capillary flow is slowest — leaving time to exchange material. Pick a vessel segment, drag the cardiac output, and watch the speeds. {#s2e .explain}

::: html step2-1
s2stage: Top: total cross-sectional area of each segment (log scale); bottom: blood speed in each (log scale); the orange highlight is the chosen segment
s2canvas: Total cross-sectional area and blood speed per segment: the bigger the area, the slower the flow, slowest in capillaries
s2seg: Pick a vessel type
s2q: Cardiac output Q
:::

Takeaway: speed is inversely proportional to total cross-sectional area (the continuity equation); capillaries have the biggest total area and the slowest flow. Areas are approximate textbook values; blood is treated as an incompressible fluid and the pulsing is ignored. {#s2result .readout i18n=text}

::: strings
s2ro: {name}: total cross-section about {a} cm², Q = {q} L/min = {qs} cm³/s, speed v = Q ÷ A ≈ {v} cm/s.
:::

## How do the heart and the vessels together set blood pressure? {#step3 h2=s3t}

::: strings
nav3: 3 Where pressure comes from
:::

Step 3 · Where pressure comes from {#s3k .step-kicker i18n=text}

This step asks: what decides how high blood pressure is? **Blood pressure** is the pressure of blood on vessel walls (in mmHg). The more blood the heart pumps per minute (cardiac output, CO) and the more the small vessels resist flow (resistance R), the higher the average pressure: mean arterial pressure ≈ CO × R. With each beat the pressure rises to the **systolic** value and falls to the **diastolic** one. Change the heart rate, stroke volume and resistance to see the waveform and the numbers move. {#s3e .explain}

::: html step3-1
s3stage: Blood pressure waveform (teaching sketch): x time (2 s), y pressure (mmHg); the top is systolic, the bottom diastolic, the dashed line is mean arterial pressure
s3canvas: Arterial pressure waveform changing with heart rate, stroke volume and vessel resistance
s3hr: Heart rate
s3sv: Stroke volume
s3r: Peripheral resistance R
:::

Takeaway: raise CO or R and pressure rises; a larger stroke volume widens the pulse pressure (systolic − diastolic). Holds in this teaching model with arterial compliance 1.5 mL/mmHg and R in mmHg·min/L; it is for understanding principles, not for judging anyone’s health. {#s3result .readout i18n=text}

::: strings
s3ro: Cardiac output CO = {sv} mL × {hr} = {co} L/min; mean arterial pressure MAP = CO × R = {co} × {r} = {map} mmHg; systolic / diastolic ≈ {sys} / {dia} mmHg.
:::

## When you run, where does the extra blood from the heart go? {#step4 h2=s4t}

::: strings
nav4: 4 During exercise
:::

Step 4 · During exercise {#s4k .step-kicker i18n=text}

This step asks: how is the extra cardiac output shared among organs during exercise? At rest 5 L/min is divided roughly among brain, heart, muscle, gut, kidneys and skin; in exercise the heart rate and stroke volume rise, the total can reach about 20 L/min, and most of it is redirected to skeletal muscle while gut and kidney flow actually drops. Drag the exercise intensity and watch each organ’s flow (L/min). {#s4e .explain}

::: html step4-1
s4stage: Blood flow to each organ (L/min): the bar is the current value, the tick is the resting value; the readout gives heart rate and stroke volume
s4canvas: How exercise intensity changes each organ’s share of blood flow: muscle rises sharply, gut and kidneys fall
:::

Takeaway: exercise raises total flow and redistributes it to the muscles that need oxygen. Holds with approximate textbook values interpolated linearly with intensity; individuals differ a lot and this page cannot assess anyone’s fitness. {#s4result .readout i18n=text}

::: strings
s4e2: Exercise intensity
s4ro: Intensity {e}%: heart rate {hr} beats/min, cardiac output {co} L/min (stroke volume {sv} mL); skeletal muscle gets {mu} L/min ({pct}%), versus {mu0} L/min at rest.
:::

## Explain blood circulation to a friend {#step5 h2=s5t h2part=1}

::: strings
nav5: 5 Recap
:::

::: html step5-1
s5k: Step 5 · Recap
s5e: The heart is a pump: the left ventricle drives the systemic loop, the right ventricle the pulmonary loop, and valves keep the blood going one way.
f1t: The route
f1b: The systemic loop delivers oxygen, the pulmonary loop collects it; two loops share one heart (step 0).
f2t: Pump and pipes
f2b: Valves enforce one-way flow; total vessel area sets speed; CO × R sets pressure (steps 1–3).
f3t: Sharing
f3b: In exercise total flow rises and is redirected to muscle (step 4).
modelT: Honest model notes
model1: The route map, chambers and valves are sketches; colour shows oxygen content only — real blood is always red.
model2: Numbers (areas, flow shares, compliance) are approximate textbook values and vary widely between people.
model3: The pressure waveform is a teaching curve; this page is not a medical tool and cannot judge anyone’s health.
nextT: Keep going (on this site)
l1: Pressure · step 0: blood pressure is just p = F ÷ S on the vessel wall
l2: Pressure · step 2: pressure inside a liquid grows with depth (p = ρgh)
l3: Cell Structure · step 0: where the oxygen finally goes — the cells
:::

::: strings
unitBpm: beats/min
unitMl: mL
unitLmin: L/min
unitMmHg: mmHg
unitS: s
unitCm2: cm²
unitCms: cm/s
lblArt: to artery
lblVeinIn: from veins
lblHeart: Heart
lblLungs: Lungs
lblBody: Body
chRA: Right atrium
chRV: Right ventricle
chLA: Left atrium
chLV: Left ventricle
s2areaLbl: Total cross-section A (cm²)
s2velLbl: Speed v (cm/s)
seg0: Left ventricle → aorta
seg1: Arteries
seg2: Body capillaries (oxygen exchange)
seg3: Veins
seg4: Venae cavae
seg5: Right atrium → right ventricle
seg6: Pulmonary artery
seg7: On the way to the lungs
seg8: Lung capillaries (gas exchange)
seg9: Pulmonary veins
seg10: Left atrium → left ventricle
vAorta: Aorta
vArt: Arteries
vArtl: Arterioles
vCap: Capillaries
vVenl: Venules
vVein: Veins
vVc: Venae cavae
organBrain: Brain
organHeart: Heart
organMuscle: Skeletal muscle
organGut: Gut
organKidney: Kidneys
organSkin: Skin & other
:::
