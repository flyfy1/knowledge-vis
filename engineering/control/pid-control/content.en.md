---
lang: en
---

::: strings
pageTitle: Feedback Control · Measure the gap, then choose the push
back: ← Knowledge index
navLabel: Feedback control steps
tagline: The setpoint is what you want; the output is what you have. Feedback turns their error into action. Tuning decides how fast it chases, how early it brakes, and how long it remembers.
nav0: 0 Setpoint & error
nav1: 1 P: now
nav2: 2 I: memory
nav3: 3 D: trend
nav4: 4 Stability check
nav5: 5 Wrap-up
foot: visual.integ.life · Feedback Control
settleNA: not settled
seconds: " s"
:::

## The setpoint is not the output — error is the controller’s doorway {#step0 h2=s0t}

Step 0 · Define the problem {#s0k .step-kicker i18n=text}

Drag the target **setpoint r** from 0.5 to 4.0. The plant output y starts at 0; the controller first asks one question at every step: **how far off are we?** That is the error e = r − y. A new setpoint changes the error instantly; the output cannot teleport, so it has to chase through control action. {#s0e .explain}

::: html step0-1
setpoint: Setpoint r
:::

Move the setpoint: the error jumps first, then the output catches up. The controller always acts on error. {#s0note .hint i18n=text}

::: strings
output: Current output y
error: Error e = r − y
setpointVal: {v}
outputVal: {v}
errorVal: {v}
s0readout: r={r} · y={y} · e={e}
:::

## P: the farther off, the harder it pushes {#step1 h2=s1t}

Step 1 · Look at now {#s1k .step-kicker i18n=text}

Proportional control sees only the present error: **u = Kp·e**. Small Kp chases slowly; larger Kp chases faster but is more likely to cross the target. Notice the gap left at the end: P alone usually needs some error to keep producing force, so a **steady-state error** remains. {#s1e .explain}

::: html step1-1
kp: Proportional gain Kp
reset: Reset
compareP: Show P baseline
:::

Before moving Kp high, predict whether the curve will speed up or start to sway. {#s1hint .hint i18n=text}

::: strings
run: Run
pause: Pause
s1metrics: Kp={kp} · steady error {error} · overshoot {overshoot}% · settle {settling}
:::

## I: keep an account of leftover error {#step2 h2=s2t}

Step 2 · Add the past {#s2k .step-kicker i18n=text}

The integral term adds past error: **u = Kp·e + Ki·∫e dt**. A slope, friction or load can hold the output away from target; I keeps adding that account until the error is paid off. If it records too aggressively, integral windup leaves a backlog after the output crosses the target, so it swings back slowly. {#s2e .explain}

::: html step2-1
ki: Integral gain Ki
disturbanceOff: Disturbance: off
:::

Set Ki to 0 first, then raise it step by step. Compare the final error, not just the first second. {#s2hint .hint i18n=text}

::: strings
disturbance: Add a disturbance at 5 s
s2metrics: Ki={ki} · final mean error {error} · max control {control} · {state}
disturbanceOn: Disturbance: on
stable: settled
unstable: still swaying
:::

## D: brake before you arrive {#step3 h2=s3t}

Step 3 · Brake from the trend {#s3k .step-kicker i18n=text}

The derivative term watches how fast the error changes: **u = Kp·e + Kd·de/dt**. When the output rushes toward target, D applies an early counter-action to reduce overshoot and ringing. Its cost is just as clear: noise is also “change”, so a large Kd can turn measurement speckles into twitchy control. {#s3e .explain}

::: html step3-1
kd: Derivative gain Kd
:::

Hold Kp and Ki fixed; change only Kd. Cyan is the current PID, dashed is the no-D baseline. {#s3hint .hint i18n=text}

::: strings
s3metrics: Kd={kd} · peak overshoot {overshoot}% · settle {settling} · error reversals {crossings}
:::

## Stable does not mean “as fast as possible”: check three misconceptions {#step4 h2=s4t}

Step 4 · Tuning lab {#s4k .step-kicker i18n=text}

Now tune Kp, Ki and Kd together. Read the response, control effort and metrics, then answer the check below. Each option is a real engineering trade-off: speed, overshoot, noise and saturation cannot all improve without limit. {#s4e .explain}

::: html step4-1
setpointShort: Setpoint
presetSoft: Gentle
presetBalanced: Balanced
presetFast: Aggressive
runAgain: Run again
quizPrompt: Which statement is most accurate?
quizA: Higher Kp is always better; it must be more stable.
quizB: Kd can reduce overshoot, but too much amplifies noise.
quizC: Ki only affects the first second; steady-state error is unrelated.
check: Check
:::

::: strings
correct: Correct: D suppresses trend, but also amplifies measurement noise; tuning is a trade-off.
wrong: Look again: each term watches a different time scale, and raising one changes the other costs.
s4metrics: Current: Kp={kp} · Ki={ki} · Kd={kd} · overshoot {overshoot}% · final error {error}
:::

## One loop, three time scales {#step5 h2=s5t}

Step 5 · Wrap-up {#s5k .step-kicker i18n=text}

P sees how far off **now**, I remembers the debt from the **past**, and D watches the **future trend** so the response does not shoot past. Setpoint, error, control and response must agree; if the curve looks good but you cannot say which term is acting, you have not read the loop yet. {#s5e .explain}

::: html step5-1
formula: e = r − y　　u = Kp·e + Ki·∫e dt + Kd·de/dt
boundary: Model boundary: this lesson uses a second-order plant with inertia, damping and a spring-like pull, integrated at a fixed step. Real systems add sampling delay, saturation, noise and nonlinearities.
:::
