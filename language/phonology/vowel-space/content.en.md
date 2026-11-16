---
lang: en
---

::: strings
pageTitle: Vowel Space · Placing Vowels by Two Formants
back: ← Knowledge index
navLabel: Vowel space steps
tagline: When a man, a woman and a child say “heed”, the absolute frequencies differ a lot, yet we hear the same vowel. Using the 1520 vowels Peterson and Barney measured in 1952, this page shows how vowels spread out on a plane of two formants, and why you have to rescale by speaker before they line up.
nav0: 0 Formants
nav1: 1 F1–F2 plane
nav2: 2 Three speaker groups
nav3: 3 Recognise with men’s template
nav4: 4 Rescale
nav5: 5 Wrap-up
foot: visual.integ.life · Vowel Space
:::

## F0 sets the pitch; the formants set the vowel {#step0 h2=s0t}

Step 0 · What is inside a vowel {#s0k .step-kicker i18n=text}

This step asks: which numbers in the sound of a vowel decide which vowel it is? A voiced sound repeats F0 times a second; this **fundamental frequency F0** is heard as pitch. The sound also contains **harmonics** at F0, 2F0, 3F0, … (vertical lines; <a class="xlink" href="../../../signal/transforms/fourier/#step5">→ Fourier, step 5: from waveform to spectrum</a>). The vocal tract from larynx to lips acts as a set of resonators that boost harmonics near certain frequencies; these boosted peaks are the **formants**, numbered F1, F2, F3 from low to high (<a class="xlink" href="../../../physics/waves/resonance/#step3">→ Resonance, step 3: the resonance curve</a>). Pick a word and a speaker group and look at where the harmonics and peaks are. {#s0e .explain}

::: html step0-1
:::

What to do: keep “heed” and switch between men and children — the spacing of the lines (harmonics) widens from about 136 Hz to about 270 Hz and the peaks shift right. Then keep men and switch between “heed” and “hod”: the harmonic spacing only changes from 136 to 124 Hz, but the peaks change place. The peak shape is this page’s schematic drawing; only F0 and the positions of F1–F3 are data. {#s0hint .hint i18n=text}

::: strings
s0readout: {word} /{ipa}/ · {group} average: F0 {f0} Hz · F1 {f1} · F2 {f2} · F3 {f3} Hz (mean of {n} recordings)
freqAxis: frequency Hz
ampAxis: relative level (schematic)
:::

## Draw each vowel as a point on the F1–F2 plane {#step1 h2=s1t}

Step 1 · Two numbers, one point {#s1k .step-kicker i18n=text}

This step asks: using only the first two formants, can the ten vowels be told apart? Each point is the average (F1, F2) of one vowel over the 33 men. On the **F1–F2 plane** the horizontal axis is F2 and the vertical axis is F1. This page chooses to let F2 increase from right to left and F1 increase downwards, and uses a **log scale** on both axes (equal distances mean equal ratios; <a class="xlink" href="../../../math/algebra/exponents-logarithms/#step3">→ Exponents & logarithms, step 3: logs turn multiplication into addition</a>). Click a word to see where it sits. {#s1e .explain}

::: html step1-1
:::

You can read straight off the data: “heed” and “who’d” have the lowest F1, “had” and “hod” the highest; “heed” has the highest F2 and “hawed” the lowest. A course handout (<a class="xlink" href="https://courses.grainger.illinois.edu/ece590sip/sp2018/spectrograms4_vowels.html" rel="noopener">UIUC ECE590SIP 2018, lecture 4</a>) summarises Peterson and Barney as showing that, except for /ɝ/, the *perception* of American English vowels can largely be explained by F1 and F2, with a little overlap at the boundaries between neighbouring vowels. These are averages; single recordings scatter around each point. {#s1hint .hint}

::: strings
s1readout: {word} /{ipa}/: F1 {f1} Hz · F2 {f2} Hz · F3 {f3} Hz
s1er: Note that the F3 of “heard” /ɝ/ is only {f3} Hz, clearly below the other nine vowels (all ≥ {min} Hz): the handout below only says /ɝ/ is the exception to “F1 and F2 explain the vowels” and does not mention F3; linking the two is this page’s inference.
:::

## The same vowel lands in different places for three speaker groups {#step2 h2=s2t}

Step 2 · Someone else says it {#s2k .step-kicker i18n=text}

This step asks: when a man, a woman and a child say the same word, do the points coincide? Turn on the three **speaker groups**: 33 men, 28 women and 15 children (8 of them girls; the children have only 30 recordings per vowel). Each group’s seven outer vowels are joined into a loop (“hud”, “hood” and “heard” sit inside and are drawn as dots only). {#s2e .explain}

::: html step2-1
show: Show
gm: Men
gw: Women
gc: Children
:::

What to do: with all three groups on, see that the three loops have a similar shape but the women’s and children’s loops sit further down and left (higher F1 and F2). Try a few words and read the “children ÷ men” ratios: most are between 1.2 and 1.5, but they are not all the same. Note that the children’s group mixes boys and girls and is the smallest. {#s2hint .hint i18n=text}

::: strings
s2readout: {word} /{ipa}/ F1 / F2 (Hz): men {m1} / {m2} · women {w1} / {w2} · children {c1} / {c2}　→ children ÷ men: F1 ×{r1}, F2 ×{r2}
:::

## Use the men’s ten points as templates to recognise other speakers’ vowels {#step3 h2=s3t}

Step 3 · Absolute frequency only {#s3k .step-kicker i18n=text}

This step asks: if you label a point as whichever vowel is closest by absolute frequency, what happens? Treat the men’s ten average points as **templates**. For each of the women’s or children’s vowel averages, find the **nearest men’s template** (straight-line distance on the log F1–F2 plane; F1 and F2 are the first and second formants, the two lowest peaks the vocal tract amplifies); the arrow points to it. Green means recognised correctly, red means wrong. {#s3e .explain}

::: html step3-1
:::

For children only 3 of 10 are right; for example the children’s “hid” lands next to the men’s “head”. So the number “F1 = 530 Hz” on its own does not tell you which vowel it is — you also need to know who is speaking. {#s3hint .hint i18n=text}

::: strings
s3readout: {group}’s ten vowel averages: {ok} correct, {bad} wrong{list}
asWord: as
:::

## Rescale each group by its own overall level and the loops overlap {#step4 h2=s4t}

Step 4 · Look at the speaker as a whole first {#s4k .step-kicker i18n=text}

This step asks: how can you remove the effect of who is speaking? This page uses a simple **normalisation**: for each speaker group, compute the **geometric mean** of its ten F1 values (first formant) (multiply them and take the 10th root), then scale all that group’s F1 values by “men’s geometric mean ÷ this group’s geometric mean”; F2 (second formant) likewise. On a log scale this just slides the whole loop. The slider λ goes from 0 (no rescaling) to 1 (full rescaling). {#s4e .explain}

::: html step4-1
lambda: Rescaling λ
:::

What to do: drag λ slowly from 0 to 1 and watch the women’s and children’s loops slide onto the men’s and the red arrows turn green one by one: at λ = 1 both groups are 10/10. Distances are in log units; 0.1 is roughly a 10% difference. {#s4hint .hint i18n=text}

::: strings
s4readout: λ = {l} · women: mean distance to the men’s same vowel {dw}, correct {okw}/10 · children: mean distance {dc}, correct {okc}/10
:::

## A vowel is a position on a plane — after calibrating for the speaker {#step5 h2=s5t}

Wrap-up {#s5k .step-kicker i18n=text}

::: html step5-1
s5fin: A vowel’s pitch is set by the **fundamental frequency**; the vowel itself is mainly told apart by the positions of the **first two formants**, and on the F1–F2 plane the ten vowels form a loop. Different speakers’ loops sit at different overall levels, so absolute frequency alone misleads; rescale by the speaker’s overall level first, then compare positions, and the three groups’ averages line up.
formula: rescaled F = F × (men’s geometric mean ÷ this group’s geometric mean), separately for F1 and F2
boundary: Model limits: the page uses each group’s ten vowel averages, not single recordings, and real recordings overlap; the normalisation uses all ten vowels of a group, whereas a real listener has not necessarily heard a speaker say every vowel. The data are American recordings from 1952 of hVd words; the page has no audio and does not address how listeners actually do this.
quizPrompt: The children’s average for “hid” is recognised by the men’s templates as “head”. What is the best explanation?
quizA: The children mispronounced “hid”.
quizB: All of the children’s F1 and F2 values are higher overall, so by absolute frequency they land near a different men’s vowel; after rescaling by the group’s overall level they are recognised correctly.
quizC: Vowels are told apart mainly by F3, so F1 and F2 alone must fail.
check: Check
lk1: ↗ Speech sounds, step 0: consonants are told apart by articulation
lk2: ↗ Speech sounds, step 1: minimal pairs — “heed” and “hid” differ in one vowel
lk3: ↗ Resonance, step 3: why only some frequencies are boosted
lk4: ↗ Fourier, step 5: splitting a sound into its spectrum
:::

::: strings
correct: Right: the problem is not removing “who is speaking” first, not a mispronunciation.
wrong: Look at step 4 again: at λ = 1, where does the children’s “hid” point?
:::
