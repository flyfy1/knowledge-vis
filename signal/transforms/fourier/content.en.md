---
lang: en
---

::: strings
docTitle: The Fourier Transform · One Interaction at a Time
backToIndex: ← Knowledge Index
docH1: The Fourier Transform
tagline: Any waveform, any drawing, can be broken down into a sum of rotating circles. Starting from a single sine wave, this page lets you build that idea up yourself, one step at a time.
navAria: Step navigation
footText: The Fourier transform, interactively · one interaction per step, from a sine wave to any shape.
:::

## A Chain of Rotating Circles Draws a Little Figure {#step0 h2=s0title}

::: strings
nav0: 0 The Hook
:::

Step 0 · The Punchline First {#s0kicker .step-kicker i18n=text}

::: html step0-1
s0explain: Skip the theory for a moment and just watch. Two chains of circles are turning — one along the top of the frame, one down the left side. The top chain controls the **horizontal (x) coordinate**, the left chain the **vertical (y) coordinate**, and where the two dashed projection lines cross is the pen tip, tracing the outline of a little figure. This is the Fourier transform at its most striking: **any shape at all can be taken apart into a set of rotating circles**. This page starts from a single sine wave and builds up exactly why that is true — and in the final step you can **draw a shape of your own** and let the circles draw it back.
labelN: Number of harmonics N
readoutError: reconstruction error
:::

Hands off for a moment: watch N climb on its own from 1 to 40 — the more circles, the smaller the error, the closer the likeness. Drag the slider whenever you want to take over (auto-play then stops). How the error is measured: the root-mean-square distance between the reconstructed points and the original outline points, divided by the size of the shape, × 100%. Written in mathematics, this scene is f(t) = Σ (a<sub>k</sub> cos kt + b<sub>k</sub> sin kt) — one such sum for the x coordinate and one for the y, each term corresponding to one circle. Those terms are called **harmonics**: sine components whose frequencies are whole-number multiples of the fundamental (1×, 2×, 3×, …) — and the N on the slider counts how many of them are in use. {#s0hint .hint}

::: html step0-2
s0start: Start exploring ↓
:::

## A Sine Wave Has Just Three Knobs {#step1 h2=s1title}

::: strings
nav1: 1 What Is a Wave?
:::

Step 1 · What Is a Wave? {#s1kicker .step-kicker i18n=text}

::: html step1-1
s1explain: The simplest wave of all is the sine wave, and it is completely described by three numbers: **frequency** sets how fast it oscillates, **amplitude** how high it swings, and **phase** where it starts. Drag the sliders and see — then press “Listen”: as the frequency rises, the pitch really does rise with it.
labelFreq: Frequency
labelAmp: Amplitude
labelPhase: Phase
s1sound: 🔊 Listen to this wave
s1freeze: ❄ Freeze the wave
:::

Fun fact: sound is a wave in air. The 1 Hz on screen is slowed right down so you can see the shape; real tones oscillate hundreds of times per second, so playback scales the frequency up into the audible range. To really see what phase is, press “Freeze the wave” first, then drag the phase slider: the whole wave slides left and right, and the orange dot on the t = 0 reference line sits at exactly sin(phase). {#s1hint .hint i18n=text}

::: strings
s1soundStop: ⏹ Stop the sound
s1unfreeze: ▶ Resume scrolling
:::

## Complex Waveform = Simple Waves Added Together {#step2 h2=s2title}

::: strings
nav2: 2 Adding Waves
:::

Step 2 · Waves Add Up {#s2kicker .step-kicker i18n=text}

::: html step2-1
s2explain: Stack a few sine waves — at each instant, simply add their heights — and a brand-new waveform appears. The three coloured waves below can each be tuned; the thick white curve is their sum. In the main plot, the components and the sum are drawn with **one and the same ruler**: pick any point and measure — the height of the sum is exactly the three component heights added together. (To keep the sum inside the frame the whole plot scales up or down, but the proportions never lie.) Try the “square-wave recipe”: use only the 1st, 3rd and 5th multiples of the base frequency, with amplitudes falling as 1, 1/3, 1/5 — and the outline of a square wave is already there.
s2presetSquare: Square-wave recipe (1 + 3 + 5)
s2presetRandom: Random set
:::

Now turn it around: if any complex waveform can be *built* by adding sine waves, can it also be *taken apart* back into them? That is exactly what the Fourier transform does. {#s2hint .hint i18n=text}

## A Sine Wave Is a Circle’s Shadow on the Wall {#step3 h2=s3title}

::: strings
nav3: 3 The Rotating Circle
:::

Step 3 · The Key Leap {#s3kicker .step-kicker i18n=text}

::: html step3-1
s3explain: A point travels around a circle at a steady speed. Now watch only its height in the **vertical** direction (the dashed line is its projection): join up that height at every instant and you get, exactly, a sine wave. **One full turn = one cycle of the wave; turning speed = frequency; radius = amplitude; starting angle = phase.** The three knobs from Step 1 have all become properties of a circle. Keep this picture in mind — everything from here on is built on it. <a class="fourier-link" href="../../../math/geometry/trigonometry/#step1">This circle, formally, lives on the trig page: sin is height, cos is position →</a>
s3angle: Angle
s3radProj: rad, projected height
s3speed: Spin speed
s3radius: Radius (amplitude)
s3pause: ⏸ Pause
:::

::: strings
s3resume: ▶ Resume
s3circleLabel: Circle: turning at a steady speed
s3waveLabel: Wave: projected height, unrolled over time →
:::

## A Relay of Circles Draws a Square Wave {#step4 h2=s4title}

::: strings
nav4: 4 Circles on Circles
:::

Step 4 · Circles on Circles {#s4kicker .step-kicker i18n=text}

::: html step4-1
s4explain: Now chain the circle from Step 3 to itself: a second circle rides on the tip of the first and turns three times as fast; a third turns five times as fast… Each circle contributes one sine wave (remember Step 2), and the height traced by the final tip is the sum of them all. Drag the slider to add more circles and watch the square wave take shape.
s4labelN: Number of circles N
s4overLabel: "Current overshoot: "
s4hint: Look at the little spike at each corner of the square wave: add as many circles as you like and it never disappears — it only gets narrower. This is the **Gibbs phenomenon**: the overshoot is about **9%** of the jump height (the jump from −1 to +1 is 2, and the spike reaches about 1.18). It is a constant built into the mathematics, not a limit of drawing precision.
:::

::: strings
s4overText: approx. {v}% (of the jump height; the larger N, the closer to 8.9%)
s4chainLabel: Circle chain: circles linked tip to tail
s4waveLabel: Waveform: pen-tip height, unrolled over time →
:::

## A Change of Viewpoint: From Waveform to Spectrum {#step5 h2=s5title}

::: strings
nav5: 5 The Spectrum
:::

Step 5 · The Transform Itself {#s5kicker .step-kicker i18n=text}

::: html step5-1
s5explain: For four steps we have been *building up*. The Fourier transform does the reverse — it *takes apart*: hand it any waveform and it tells you how strong the sine wave at each frequency is inside it. On the left is the waveform (the **time domain**); on the right is the result of the taking-apart (the **frequency domain**, known as the spectrum). Switch between the waveforms and compare: the square wave contains only odd-numbered frequencies, the triangle wave’s spectrum falls off far faster, and the sawtooth has a share of every frequency. <a class="fourier-link" href="../../systems/frequency-response/#step0">What a spectrum is for: watch a filter pick by frequency →</a>
s5square: Square wave
s5triangle: Triangle wave
s5saw: Sawtooth
s5ecg: Simulated ECG
s5timeTitle: Time domain: waveform x(t)
s5specTitle: Frequency domain: spectrum (strength of each frequency)
:::

Note: the bar heights on the right are **normalised to the strongest component of the current waveform** (the strongest bar reaches the top), so read them as proportions between components; the vertical scale changes when you switch waveforms — for absolute strengths, see the amplitudes in the readout below. The “simulated ECG” is a synthetic waveform drawn for teaching, not real cardiac data. Being pulse-like, it spreads its energy over many frequencies with no single dominant component, so every amplitude in its readout is small and the strongest is not at the fundamental frequency — that is a property of pulse-like waveforms, not a miscalculation. {#s5hint .hint}

::: html step5-2
s5formulaText: Don’t let it scare you — the formula says just one thing: **take a circle spinning at rate f, multiply it against the waveform point by point, and add it all up**, and you measure how much of frequency f the waveform contains, and with what phase. The e<sup>−2πift</sup> term is nothing mysterious — it is the point travelling around the unit circle from Step 3 (mathematicians write rotation in exponential form). Measure every f, and you have the whole spectrum. One bridging remark: everything demonstrated on this page is a **periodic** waveform. A periodic signal has components only at integer multiples of its fundamental frequency, so its spectrum is a row of separate bars — and that is exactly what the formula above becomes for periodic signals (mathematicians call it a Fourier series). For a non-periodic signal, the bars would pack together into a continuous curve.
:::

::: strings
s5chooseAria: Choose a waveform
s5topPrefix: "Strongest three components: "
s5topJoiner: ", "
s5topItem: frequency {k} (amplitude {m})
s5axisNote: frequency → (numbers on the axis = multiples of the fundamental)
:::

## Now Draw Anything You Like {#step6 h2=s6title}

::: strings
nav6: 6 Draw Your Own
:::

Step 6 · Finale {#s6kicker .step-kicker i18n=text}

::: html step6-1
s6explain: In the canvas below, use your mouse or finger to **draw a closed curve** (a heart, a star, the first letter of your name), or pick a preset shape. The page takes the points of the outline, splits them into their **x and y coordinates**, and runs a genuine discrete Fourier transform (DFT) on each: the chain of circles across the top handles the x coordinate, the chain down the left handles the y coordinate, and where the two dashed projection lines cross is the pen tip. Drag N and watch the error readout keep falling — **that is the Fourier transform: a curve, taken apart into a sum of rotations along two directions.**
:::

How the error is measured: the root-mean-square distance between the reconstructed points and the original outline points, divided by the size of the shape, × 100%. A larger N gives a smaller error, but the radii of high-frequency circles decay quickly, so each extra circle buys less than the one before. {#s6hint .hint i18n=text}

::: html step6-2
s6clear: Clear & redraw
s6heart: Preset: Heart
s6star: Preset: Star
s6person: Preset: Cartoon figure
finaleText: The audio equaliser in your phone, JPEG photo compression, noise-cancelling headphones, MRI imaging in hospitals — behind all of them is the same idea: **break a complex signal into simple waves, work on the pieces, then put them back together**. From a single sine wave to a chain of circles that can draw anything — that is the Fourier transform.
s6lkConv: The convolution theorem: convolution becomes pointwise multiplication →
s6lkMod: Multiply once and the spectrum moves house: modulation →
s6lkSamp: Sampling clones the whole spectrum: aliasing in the frequency domain →
:::

::: strings
s6statusHeart: Current preset: “Heart”. Drag N to watch the error change, or draw one of your own!
s6statusStar: Current preset: “Star”. Sharp corners need more high-frequency circles to come out crisp.
s6statusPerson: Current preset: “Cartoon figure” — the same one from the opening of Step 0.
s6statusCleared: Cleared. Try drawing a closed curve on the canvas!
s6statusDrew: That is your drawing! Drag N and watch the circles trace it more and more faithfully.
dcDrawHint: Release, and the circles will redraw your shape…
dcEmpty1: Press and draw a closed curve with your mouse (or finger)
dcEmpty2: or pick a preset shape
dcXLabel: x chain (horizontal)
dcYLabel: y chain (vertical)
:::
