---
lang: en
---

::: strings
back: ← Knowledge Index
category: Physics & Circuits
stage: Primary
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Sound from Vibration · A Drum with Jumping Rice
tagline: Strike a drum and the drumhead vibrates, tossing the rice on it: sound is an object’s vibration carried through the air to your ear.
:::

## When the drum sounds, what is the drumhead doing? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Strike
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: STRIKE
:::

This step answers: what changes in an object that makes sound? Press “Strike”: the drumhead moves up and down, a **vibration** (a back-and-forth motion), and the rice on it is tossed again and again. The curve below records the head’s height over time. The picture is slowed down 40 times, and the rate of decay is illustrative. {#s0e .explain}

::: html step0-2
s0cv: Drumhead vibrating, rice tossed, with the head height against time below
strike: Strike
reset0: Reset
:::

::: strings
s0ro: {t} s elapsed (slow motion, about {real} ms real time), head height {y} (relative), rice thrown up to {g}.
s0roIdle: Not struck yet: the head is still and the rice rests. Press “Strike”.
:::

## Hit harder: what changes in the drumhead and the sound? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Hit and loudness
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: HIT AND LOUDNESS
:::

This step answers: how is **amplitude** (the largest distance the vibration moves from rest) related to loudness? Drag the amplitude: the higher the head swings, the higher the rice jumps. Sound intensity (energy arriving per second) is proportional to amplitude squared; loudness is often quoted in decibels (dB): every 10 times the intensity adds 10 dB. {#s1e .explain}

::: html step1-2
s1cv: Three vibration cycles: current amplitude and the reference
amp: Amplitude A (relative)
:::

::: strings
s1ro: Amplitude {a}: intensity is {i} times the reference (A = 1), which is {db} dB louder than the reference.
:::

## The head vibrates faster: what happens to the pitch? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Speed and pitch
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: SPEED AND PITCH
:::

This step answers: how is **frequency** (vibrations per second, in hertz, Hz) related to pitch? Drag the frequency: in a 20 ms (0.02 s) window the number of full vibrations on the curve = frequency × 0.02. Higher frequency means a higher note. “Listen” plays a quiet pure tone (only when you press, and it stops itself after 1.2 s). {#s2e .explain}

::: html step2-2
s2cv: The vibration curve over 20 ms
freq: Frequency f (hertz, Hz)
:::

::: strings
listen: Listen
stopTone: Stop
s2ro: {f} Hz: {n} full vibrations in 20 ms; nearest piano key {note} ({cents} cents).
noAudio: This browser cannot play sound; the curve alone shows it.
:::

## With no air, can sound still reach the ear? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Needs air
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: NEEDS AIR
:::

This step answers: what carries sound? An electric bell sits under a glass jar with its hammer going. Sound needs a surrounding substance (a **medium**, such as air) to pass the vibration on layer by layer. Drag the fraction of air left in the jar: the dots (air) thin out and the rings of sound weaken, and in a vacuum nothing is heard. The audibility cut-off (5%) is an illustrative value. {#s3e .explain}

::: html step3-2
s3cv: An electric bell in a glass jar, air being pumped out
air: Air left in the jar (%)
:::

::: strings
s3ro: Air in the jar {p}%: sound strength getting out about {s} (relative), {res}.
heard: audible
silent: inaudible (almost a vacuum)
:::

## How fast does the same sound travel in air, water and steel? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Speed
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: SPEED
:::

This step answers: how long does sound take to travel d metres? Time = distance ÷ speed. Three sounds start together: about 343 m/s in air, 1480 m/s in water and 5100 m/s in steel. Choose a distance and press “Start together”; the dots in the three lanes advance at the real speeds, so you can see who arrives first. {#s4e .explain}

::: html step4-2
s4cv: Sound starting together in three media
dist: Distance (m)
go: Start together
reset4: Back to the start
:::

::: strings
s4ro: Distance {d} m: air {ta} s, water {tw} s, steel {ts} s. Elapsed {t} s.
:::

## Shout at a cliff: how long until the echo comes back? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: how does the echo delay tell us the distance? The sound travels there and back, twice the distance, so distance = speed of sound in air × delay ÷ 2 (speed 343 m/s). Drag the delay before you hear the echo to see how far the cliff is. {#s5e .explain}

::: html step5-2
s5cv: A person, the sound going out and back, and the cliff
delay: Delay before the echo (s)
recapTitle: Recap
recap1: Sound comes from vibration; amplitude sets intensity and frequency sets pitch.
recap2: Sound needs a medium, so there is none in a vacuum; the speed differs from medium to medium.
recap3: Echo ranging: distance = speed × time ÷ 2.
modelTitle: Scope and limits of this model
modelText: The drumhead here is an illustrative decaying simple vibration (slowed 40 times). Loudness is only intensity and decibels, without the ear’s varying sensitivity by frequency; the “no sound in a vacuum” cut-off is illustrative. The speed of sound is 343 m/s for room-temperature air and changes with temperature. The listening part has not been checked by a person’s ear.
linkMusic: → Music Theory: how pitch and frequency form scales
linkStand: → Standing Waves: how vibration settles into stable patterns on a string
linkInt: → Wave Interference: what happens when two waves overlap
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5ro: Delay {t} s: the sound travelled {tot} m in all, so the cliff is {d} m away.
docTitle: Sound from Vibration · A Drum with Jumping Rice
:::
