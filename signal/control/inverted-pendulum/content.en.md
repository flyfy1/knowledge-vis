---
lang: en
---

::: strings
docTitle: Feedback & Control · One Interaction at a Time
back: ← Knowledge Index
pageTitle: Feedback & Control
tagline: A two-wheeled robot is born unable to stand. What keeps it up is not a bigger motor but a loop spinning hundreds of times a second: measure, compute, push. This page takes that loop apart, layer by layer — and first, it lets you be the controller.
foot: visual.integ.life · Feedback & Control — one interaction at a time
rTheta: Tilt θ
rOmega: Angular velocity
rMotor: Motor output
rState: State
stStanding: Standing
stWobbling: Standing (swaying)
stFallen: Fallen
stOsc: Oscillating
stJitter: High-frequency jitter
stConverged: Settled
stOffset: Settled with offset
stRunning: Running
:::

## Push it — it won’t fall {#step0 h2=s0t}

::: strings
nav0: 0 Hook
:::

Step 0 · The trick first {#s0k .step-kicker i18n=text}

This two-wheeled robot has no stand and no hidden gimmick under the floor. It just stands there — **give it a push** and it wobbles twice and rights itself. Now switch “Control” off and push again: same robot, down instantly. The whole difference lives inside one invisible loop: a sensor measures the tilt hundreds of times a second, a controller computes how hard to push back, and the motor obeys at once. This page takes that loop apart. One bit of bookkeeping for the readouts below: the “motor output” percentage is the current push as a share of the motor’s **maximum push (its thrust limit)** — 100% means it is already pushing as hard as it can. {#s0e .explain}

::: html step0-1
btnPush: Give it a push
btnStand: Stand it up
s0ctrl: Control
s0on: On
s0off: Off
:::

You can also grab the body, drag it sideways and let go to watch it rescue itself — with control on, it will even wrestle your hand. {#s0hint .hint i18n=text}

::: html step0-2
start: Start exploring ↓
:::

::: strings
btnReset: Reset
cFallen: Down it goes!
cDrag: Drag the body sideways, let go, watch it recover
:::

## Let it fall first — then save it yourself {#step1 h2=s1t}

::: strings
nav1: 1 No feedback
:::

Step 1 · A world without feedback {#s1k .step-kicker i18n=text}

On the left, the robot with control off. Set a starting angle and let go — it does not topple “slowly”: it falls **faster and faster**, the tilt growing exponentially like a snowball, while the timer tells you how long it lived. On the right, a swing (a hanging pendulum): the same pendulum equation, except one balance point sits on a hilltop and the other in a valley. Poke the valley one and it merely sways; the hilltop one treats a breath as a disturbance. {#s1e .explain}

::: html step1-1
s1ang: Starting angle
s1inv: Inverted pendulum (control off)
s1hang: Hanging pendulum (swing)
s1hangNote: The swing keeps a constant amplitude — no growth, no decay (the model has no friction).
s1release: Let go!
:::

Your turn to be the controller {#s1mt .sub-h tag=h3 i18n=text}

Now you close the loop: use the **◀ ▶** arrow keys (or hold the buttons) to speed up and slow down the wheels, pushing the body back to vertical before it falls. Goal: **survive 10 seconds**. Fair warning — you probably won’t last a few: not because your hands are slow, but because a human feedback loop runs at only about 5–10 Hz (seeing, deciding and pressing takes a hundred milliseconds or two), while this rod’s tilt **doubles roughly every 0.16 s**. The machine’s loop runs 480 times a second. That, more than anything, is why it can stand. {#s1me .explain}

::: html step1-2
s1start: Start the challenge
:::

Arrow keys ◀ ▶, or hold the buttons — the longer you hold, the harder it pushes. {#s1keys .hint i18n=text}

::: strings
s1invIdle: Set an angle, then press “Let go!”
s1alive: Survived
s1aliveBest: Best this round
s1again: Try again
s1score: You survived
s1best: Best
s1idle: Press “Start the challenge” — you begin from a gentle 3° lean.
:::

## Sensor → controller → motor → back to sensor {#step2 h2=s2t}

::: strings
nav2: 2 Closing the loop
:::

Step 2 · Closing the loop {#s2k .step-kicker i18n=text}

Watch the loop diagram above: the signal runs around the ring — the sensor measures the tilt, the controller computes how much force is needed, the motor drives the wheels, the tilt changes, and the sensor measures again… forever. The robot below runs exactly this loop, with the simplest rule a controller can have: **lean one way, drive that way; the harder the lean, the harder the drive.** Drag the gain and get it standing first (swaying is expected). <a class="fourier-link" href="../../systems/lti-systems/#step2">Every box in the loop has its own h: start with the answer to one impulse →</a> {#s2e .explain}

::: html step2-1
s2gain: Rule gain K
s2reveal: Time to name it: a rule that pushes in proportion to the error is called **proportional control — P**. Written out: u = Kp·e, where e = target angle − current angle (the target is upright, 0°). Lean right and e goes negative, u goes negative, and the wheels accelerate rightwards, chasing the fall — the sign of the error steers automatically; the Kp you just dragged decides how hard it chases. Over the next three steps we bolt on D, then I.
:::

::: strings
cSensor: Angle sensor
cError: Error e
cCtrl: Controller
cMotor: Motor
cPlant: Body · tilt θ
:::

## P: too soft it falls, too hard it shakes {#step3 h2=s3t}

::: strings
nav3: 3 P only
:::

Step 3 · P only {#s3k .step-kicker i18n=text}

Now P is all you get. Sweep Kp from small to large: **too small** — the motor can’t outrun gravity and the robot sinks in slow motion; **about right** — it stands, but sways back and forth forever (watch the θ(t) strip below: a constant-amplitude wave that never dies); **too large** — corrections come so violently fast that it buzzes at high frequency. P’s flaw in one line: it only asks “how far off am I now?”, never “which way am I falling, and how fast?” — so it overshoots, forever, in both directions. {#s3e .explain}

::: html step3-1
s3kp: Kp
s3mSoft: Too soft Kp=8
s3mMid: About right Kp=20
s3mHard: Too hard Kp=70
:::

This page’s model has no friction, so a pure-P sway is genuinely constant-amplitude — it is not drawn wrong. On a real robot, a whisper of friction would let it die out eventually, at a pace left to luck. {#s3note .hint i18n=text}

::: strings
s3peak: Peak tilt (last 3 s)
:::

## D: braking before you arrive {#step4 h2=s4t}

::: strings
nav4: 4 Adding D
:::

Step 4 · Adding D {#s4k .step-kicker i18n=text}

Give the controller a second eye, one that watches the trend: **the D term is proportional to the rate of change of the tilt** — the faster it is falling, the harder it brakes. In the strip below, the grey dashed curve is P alone; the cyan curve is the same robot, same Kp, with Kd added. Press “Disturb” to kick both robots at once, then drag Kd and watch the cyan curve lie flat within seconds. {#s4e .explain}

::: html step4-1
s4kp: Kp (shared by both)
s4kd: Kd
s4disturb: Disturb (kick both robots)
:::

Kd is not “the bigger the better” either: it is hypersensitive to change, and the tiniest sensor noise gets amplified into twitching — step 6 will cash that cheque. For now, slam Kd to the top here: the body turns nervously rigid, slamming the brakes at every breeze. {#s4note .hint i18n=text}

::: strings
s4settlePD: PD settling time
s4settleP: P settling time
s4notYet: not settled yet
cPonly: P only
cPD: P + D
:::

## Standing is not enough — it must stand straight {#step5 h2=s5t}

::: strings
nav5: 5 I & disturbances
:::

Step 5 · Adding I, and a disturbance {#s5k .step-kicker i18n=text}

Drive the robot onto a slope: PD keeps it up, but forever **leaning at one fixed angle** — steady-state error. P only pushes as hard as the leftover error demands, the way a spring only pushes while it stays compressed. Now switch on **Ki**: it keeps a running ledger of the error, and once the ledger grows, it pushes that extra bit until the error is eaten and the robot stands truly vertical. But crank Ki too far (try past 250) and it over-corrects: the ledger overflows, and the body sinks into a slow, wide, endless sway. {#s5e .explain}

::: html step5-1
s5slope: Slope
s5kp: Kp
s5ki: Ki
s5kd: Kd
:::

Measured presets (figures from a 3° slope + kick test run) {#s5presetT .stage-title i18n=text}

::: html step5-2
pSteady: Gentle
pSteadyM: Peak 3.7° · settles ≈4.6 s · error 0.0°
pBalanced: Balanced
pBalancedM: Peak 5.2° · settles ≈2.6 s · error −0.1°
pSport: Sport
pSportM: Peak 5.9° · settles ≈0.7 s · error −0.3°
btnKick: Kick it
:::

These presets were not guessed: each was run in the exact simulation this page uses, and the measured figures are printed right under the buttons. Touch any parameter afterwards and the guarantee is void — that is everyday tuning life. {#s5note .hint i18n=text}

::: html step5-3
s5formulaNote: The full law: u = Kp·e + Ki·∫e dt + Kd·de/dt, with e = target angle − current angle. The integral carries an anti-windup clamp: once the motor is at its limit, the integral stops piling up.
:::

::: strings
s5ss: Steady-state error (mean tilt, last 2.5 s)
:::

## The real world, picking on your tuned parameters {#step6 h2=s6t}

::: strings
nav6: 6 The real world
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

The parameters from step 5 are nicely tuned now. Time to open the three traps of the real world, one at a time — each of them specialises in humiliating “lab-tuned” parameters. {#s6e .explain}

Parameters in use: the Balanced preset {30, 6, 6}, on flat ground {#s6base .readout i18n=text}

::: html step6-1
s6delay: ① Sensor delay
s6noise: ② Measurement noise
s6sat: ③ Motor force limit
:::

Late signals mean the controller keeps correcting a posture that has already changed: past roughly 100 ms it starts oscillating on its own, and by 150 ms it falls. The milliseconds here are honest: delay steps × the simulation step of 1/480 s. In engineering: predict with a model, and keep phase margin in reserve. {#s6delayNote .hint}

A gritty angle reading hits D first — D watches change, and noise is nothing but fake change: the motor output grows fur and the body shivers at high frequency. In engineering: filter, or let D watch a model-estimated rate instead of the raw sensor. {#s6noiseNote .hint}

Drag the force limit down near 4 and kick it: the controller knows exactly what to do — the motor simply cannot do it. No algorithm can conjure force. In engineering: keep headroom, and freeze the integral near saturation (anti-windup). {#s6satNote .hint}

::: html step6-2
s6demo: One-click demo: survive 30 s of random shoves
:::

The demo first switches all three traps off, then lets the Balanced preset take randomly aimed shoves. {#s6demoNote .hint i18n=text}

::: html step6-3
s6fin: To close: **the same loop is spinning elsewhere** — your body temperature (hypothalamus as sensor, sweat glands and blood vessels as actuators), air conditioning, a hovering drone, cruise control, a landing rocket — all share this page’s skeleton: measure, compute, push. The three letters you tuned by hand, P, I and D, are their common language.
s6lkLap: Tuning moves poles: pole locations are the system’s character →
s6lkKal: Estimate first, then act: LQG, where Kalman meets control →
s6lkLti: The two axioms this machine obeys: linearity and time-invariance →
s6assumpT: This page’s simplified model (stated honestly)
s6assump: The body is a point mass on a rod of length L = 0.5 m; no friction, no wheel slip; the base acceleration is supplied directly by the motor (motor and wheel dynamics ignored); a slope is modelled as gravity tilting inside the robot’s frame; controller and simulation both run at 480 Hz, the derivative passes a 12 ms low-pass filter and the integral has an anti-windup clamp; the simulation uses a fixed 1/480 s step with semi-implicit Euler, independent of your screen’s refresh rate. The base sliding left and right on screen only visualises the output — it does not feed back into the tilt dynamics.
:::

::: strings
s6demoRun: Demo running… {t} s / 30 s
s6demoDone: Demo complete: 30 seconds, never fell.
:::
