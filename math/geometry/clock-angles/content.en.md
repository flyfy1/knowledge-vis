---
lang: en
---

::: strings
back: ← Knowledge Index
category: Mathematical Foundations
stage: Primary
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Clocks & Angles · A Race Between Two Hands
tagline: The hour hand is slow and the minute hand is fast: know how fast each turns and you can find the angle between them at any time, and when they overlap.
:::

## How many degrees does each hand turn per minute? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Who is faster
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: WHO IS FASTER
:::

This step answers: how fast does each hand turn? A full dial is 360°. Drag the slider to let time pass (minutes after 12:00): the minute hand turns once in 60 minutes, so 360° ÷ 60 = 6° per minute; the hour hand turns once in 12 hours = 720 minutes, so 360° ÷ 720 = 0.5° per minute. The arcs show how far each hand has turned from the 12 position. {#s0e .explain}

::: html step0-2
s0cv: Clock face and the angle each hand has turned
elapsed: Minutes after 12:00
:::

::: strings
s0ro: Time {time} ({t} minutes in): the minute hand is {mb}° from 12 (6° × {t}, minus whole turns); the hour hand is {hb}° (0.5° × {t}).
:::

## At h:m, how many degrees lie between the hands? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Read the angle
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: READ THE ANGLE
:::

This step answers: for h hours and m minutes, what is the angle between the hands? Hour-hand angle = 30° × h + 0.5° × m (30° per hour, plus a slow creep with the minutes); minute-hand angle = 6° × m. The angle between is their difference; if that is over 180°, subtract it from 360° (we take the smaller angle). {#s1e .explain}

::: html step1-2
s1cv: The clock at one moment and the angle between hands
hour: Hour
minute: Minute
:::

::: strings
s1ro: {time}: hour hand {hb}°, minute hand {mb}°, difference {raw}°, so the smaller angle = {ang}°.
:::

## In 12 hours, how many times do the hands form a right angle? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Right angles
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: RIGHT ANGLES
:::

This step answers: how does the angle change with time, and when is it exactly 90°? In the chart the x-axis is time (0–12 h) and the y-axis is the angle between the hands (0°–180°). The minute hand gains 5.5° per minute on the hour hand, so the angle rises and falls in a sawtooth. Drag the slider, watch the dot ride the curve, and count how often it crosses the dashed 90° line. {#s2e .explain}

::: html step2-2
s2cv: Angle between the hands against time
tAll: Time (minutes)
:::

::: strings
s2ro: Now {time}, angle {ang}°. In 12 hours the angle is exactly 90° {n} times; the next is at {next}.
:::

## The minute hand catches the hour hand: how many times in 12 hours? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Overlaps
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: OVERLAPS
:::

This step answers: when do the hands lie on top of each other? The minute hand gains 5.5° per minute, so closing a full 360° gap takes 360 ÷ 5.5 ≈ 65.45 minutes; overlaps are not on the hour. Press Play to let time run: each overlap lights its mark on the timeline below and adds to the count. Or use the slider to jump to the k-th overlap. {#s3e .explain}

::: html step3-2
s3cv: Clock face and overlap marks on a 12-hour timeline
play: Play
reset3: Reset to 12:00
jump: Jump to the k-th overlap
:::

::: strings
pause: Pause
s3ro: {time}: angle {ang}°; {c} of {tot} overlaps passed.
:::

## Given the angle, what time in that hour? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Time from angle
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: TIME FROM ANGLE
:::

This step answers: for a wanted angle, what time should I look at? Choose an hour h and a target angle θ: (minute hand − hour hand) = 5.5° × m − 30° × h (plus whole turns) must equal ±θ (or ±θ plus 360°). Solve for m and keep only solutions inside that hour (0 ≤ m < 60). The clock shows the first solution. {#s4e .explain}

::: html step4-2
s4cv: Times that give the target angle
hourSel: Which hour
theta: Target angle θ (degrees)
:::

::: strings
s4ro: In the {h} o’clock hour, the angle is {th}° at: {list}.
s4roNone: In the {h} o’clock hour the hands never make {th}°.
:::

## Try it: estimate, then compute {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: can you find the angle without a formula in front of you? The page shows a time; enter the smaller angle you worked out (degrees, decimals allowed), then check. {#s5e .explain}

::: html step5-2
s5cv: Challenge clock
guess: Your answer (degrees)
check: Check answer
next: Another time
recapTitle: Recap
recap1: The minute hand turns 6° per minute, the hour hand 0.5° per minute, so one gains 5.5° per minute on the other.
recap2: Angle = |30h + 0.5m − 6m|, and above 180° subtract from 360°.
recap3: Overlaps and right angles happen when the relative turn reaches a target, so they mostly fall between the hour marks.
modelTitle: Scope and limits of this model
modelText: This is an ideal continuous clock: hands turn smoothly and minutes may be fractional. Some real clocks tick in whole steps, and a second hand nudges nothing here. On a 12-hour dial the hands overlap 11 times and form a right angle 22 times.
linkRot: → Symmetry & Rotation: turning through an angle until a shape matches itself
linkCirc: → Inscribed Angles: how angles are measured on a circle
linkLin: → Linear Functions: why steady turning plots as a straight line
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5roAsk: This clock shows {time}. What is the smaller angle between the hands, in degrees?
s5roOk: Correct: at {time} the angle is {ang}°.
s5roNo: Not yet: at {time} the hour hand is at {hb}° and the minute hand at {mb}°; take the difference, then the smaller angle. You entered {g}°.
docTitle: Clocks & Angles · A Race Between Two Hands
:::
