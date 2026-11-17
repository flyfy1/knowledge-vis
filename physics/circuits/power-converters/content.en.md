---
lang: en
---

::: strings
docTitle: Buck & Boost · Interactive Physics
back: ← Mathematics & Physics Atlas
eyebrow: PHYSICS / CIRCUITS
pageTitle: Change the voltage. Follow the energy.
intro: Start with the memory of inductors and capacitors, then step through every phase of buck and boost converters.
navLabel: Lesson steps
plotTime: time
footT: Go to the sources
footNote: Interactive models and numerical examples are original teaching implementations. These textbooks and manufacturer references support component laws, topology and continuous-conduction analysis.
srcInductor: OpenStax · Self-inductance and inductors
srcCapacitor: OpenStax · Capacitors and capacitance
srcBuckPdf: TI · Buck power-stage analysis (PDF)
srcBoostPdf: TI · Boost power-stage analysis (PDF)
:::

## Twice the voltage does not mean twice the energy {#step0 h2=s0t}

::: strings
nav0: 0 Voltage & power
:::

STEP 0 / 6 · Voltage & power {#s0k .step-kicker i18n=text}

::: html step0-1
s0q: At the same power, what happens to current when voltage rises?
:::

Voltage is energy per charge (1 V = 1 J/C). Current is charge per second (1 A = 1 C/s). Their product is energy transferred each second: power. {#s0lede .lede}

P = V · I　　Ideal steady state: Pin = Pout {#s0power .formula i18n=text}

With a fixed 12 W power budget, move the output from 6 V to 24 V and watch output current: {#s0budget}

::: html step0-2
outV: Output voltage
:::

This is a power budget, not yet a circuit simulation. A converter uses storage components and switches to redirect energy at different times. {#s0scope}

Two conservation rules for reading circuits {#s0h3 tag=h3 i18n=text}

Arrows show conventional current: the direction positive charge would move. Currents entering a node sum to currents leaving it (Kirchhoff’s current law, KCL). Signed voltage rises and drops around a closed loop sum to zero (Kirchhoff’s voltage law, KVL). {#s0kcl}

Below, iL is inductor current, Iout is load current, and iC flows into the capacitor. Vin is input voltage, Vout is output voltage, and vL is the inductor voltage drop. We introduce these components next. {#s0symbols .note}

Node: iL = Iout + iC<br>Loop example: Vin − vL − Vout = 0 {#s0laws .formula}

::: strings
outPower: Output power
outCurrent: Output current
relation: Relation
fbHigher: Higher voltage carries more energy per charge; at fixed power, current falls.
fbLower: Lower voltage carries less energy per charge; at fixed power, current rises.
fbEqual: At 12 V, fixed 12 W means 1 A.
:::

## Inductor: current cannot jump without cause {#step1 h2=s1t}

::: strings
nav1: 1 Inductor
:::

STEP 1 / 6 · Inductor {#s1k .step-kicker i18n=text}

::: html step1-1
s1q: Does inductor current vanish as soon as voltage becomes zero?
:::

An inductor stores energy in a magnetic field. Voltage sets how quickly current changes, not the current itself. {#s1store}

L is inductance in H (henry); 1 mH = 0.001 H. i is current and v is voltage across the component. di/dt means current change per second; Δ means a change over an interval. E is stored energy in J (joule). {#s1units .note}

::: html step1-2
:::

Try two positive pulses, a zero pulse, then a negative pulse. Does the curve instantly return to zero? {#tryPulses}

L = 10 mH · Δt = 0.5 ms · One interval per click; up to 16 intervals. {#s1setup .note}

::: html step1-3
s1plus: +2 V pulse
s1zero: 0 V pulse
s1minus: −2 V pulse
reset: Reset
:::

Sign convention: current enters the terminal marked +; v and i may be negative. Zero drive holds the present value. Reverse drive decreases it and can take it through zero. Negative p = vi means the component returns energy to the ideal source. {#signNote}

::: strings
current: Current
stored: Stored energy
dE: This interval ΔE
plotI: Current i
pulsesMore: {n}/16 pulses recorded. Zero drive also records a horizontal interval.
pulsesFull: {n}/16 pulses recorded. Reset to continue.
:::

## Capacitor: give voltage a memory {#step2 h2=s2t}

::: strings
nav2: 2 Capacitor
:::

STEP 2 / 6 · Capacitor {#s2k .step-kicker i18n=text}

::: html step2-1
s2q: Does capacitor voltage vanish when charge stops flowing in?
:::

A capacitor stores energy in an electric field. Current entering its positive terminal adds charge and raises its voltage; current leaving lowers it. {#s2store}

C is capacitance in F (farad); 1 µF = 0.000001 F. dv/dt means voltage change per second; Δv is the voltage change over this interval. E is stored energy. {#s2units .note}

::: html step2-2
:::

C = 100 µF · Δt = 0.5 ms · One interval per click; up to 16 intervals. {#s2setup .note}

::: html step2-3
s2plus: +20 mA pulse
s2zero: 0 mA pulse
s2minus: −20 mA pulse
:::

::: strings
voltage: Voltage
plotV: Voltage v
rateTitle: Enlarge the last interval: current is voltage slope × C
rateNone: No interval yet. Apply one pulse to create two endpoints; reset voltage 0 V is not an observed zero slope.
rateSummary: Voltage {start} → {end} V; relative change {delta} V over 0.5 ms; interior slope {slope} V/s, current {current} mA.
rateLocal: This local plot shows Δv relative to the interval start, not absolute voltage v. Fixed horizontal axis 0..0.5 ms, vertical axis −0.12..+0.12 V. Dashed run shows time; rise shows signed Δv.
rateNote: Current is constant within each segment, so its interval slope equals the interior derivative here. A finite secant of a general curve gives only an average rate. At a true current jump, voltage has no two-sided derivative; voltage itself stays continuous. Negative current lowers signed voltage, not necessarily stored energy.
rateLink: Place this rate back on the knowledge route →
:::

## Switches choose the path; timing sets the ratio {#step3 h2=s3t}

::: strings
nav3: 3 Switches & timing
:::

STEP 3 / 6 · Switches & timing {#s3k .step-kicker i18n=text}

::: html step3-1
s3q: Which path does current take, and for how long?
:::

An ideal closed switch acts as a wire; an open switch blocks current. An ideal diode allows current from anode A toward cathode K, with zero forward drop and no reverse current. This is a teaching approximation. {#s3ideal}

::: html step3-2
s3diode: Reverse diode
:::

This separate DC experiment has a 5 V source, a 1 kΩ resistor and a series diode, with a return wire to the negative source terminal. {#s3circuit .hint}

Pulse-width modulation (PWM) repeats switching every period T. Duty D is ON time divided by period; frequency f = 1/T. This lesson represents 20,000 cycles per second, but you can step through them slowly. {#s3pwm}

::: html step3-3
duty: Duty
s3more: Further reading: switching pulses also have a spectrum.
:::

::: strings
diodeOff: 5 V → K |◁ A → 1 kΩ → return: blocked, I = 0 mA
diodeOn: 5 V → A ▷| K → 1 kΩ → return: conducting, I = 5 mA
onTime: ON time
offTime: OFF time
switchPlot: Switch: 1 closed / 0 open
:::

## Buck: current still has a path when the source disconnects {#step4 h2=s4t}

::: strings
nav4: 4 Buck
:::

STEP 4 / 6 · Buck {#s4k .step-kicker i18n=text}

::: html step4-1
s4q: Why can buck current continue when the switch opens?
:::

Connect the source intermittently. The inductor maintains current; the output capacitor absorbs or supplies the instantaneous difference. {#buckLede .lede}

Play to follow the closed loops and magnetic energy. Pause, then adjust D: at the same time, the conducting route may switch. Change voltage to compare current width and stored energy. {#cvHint .hint}

::: html step4-2
vin: Input voltage
dutyD: Duty D
play: Play two cycles
cvNext: Advance half a switch phase →
cvReset: Reset two-cycle record
cvDiagram: Complete current loops
cvTiming: Cyan interval = ON; marker = time within cycle
seek: Inspect time
:::

Bright lines and arrows show conventional current; thicker lines mean more current. Moving dashes illustrate direction, not electron speed or energy packets. One displayed cycle takes about 4 seconds and represents 50 µs; pause freezes the view. Reduced motion retains static arrows only. {#cvDash .hint}

::: html step4-3
:::

Traces show the current steady-case analytic trajectory up to the inspected time; parameter edits recompute it, without an adjustment transient. Each cycle has two ON halves and two OFF halves; their durations differ when duty is not 50%. Boundary readings use the new switch state; current remains continuous. {#cvTraces .hint}

::: html step4-4
cvModelSum: Model & symbols (ideal steady state, no startup)
cvModel: Model: ideal components, continuous conduction (inductor current always > 0), periodic steady state. Small output ripple is neglected, so output voltage is treated as constant. Initial current is the steady-state valley, not startup.
cvSymbols: S is the switch; the triangle-and-bar symbol is the diode (A is anode, K is cathode). D = ON time / period; f is frequency, T is period, L is inductance and C is capacitance. iL flows left to right through the inductor; vL is its left-minus-right voltage. iC enters the capacitor’s positive terminal; Iout is load current.
cvParams: f = 20 kHz · T = 50 µs · L = 1 mH · C = 470 µF · Constant-current load = 1 A
cvDeriveSum: Derive output voltage from those slopes
areaT: Match signed voltage area to current change
areaIntro: Use the same inspect time above. The outline is a full two-period reference; fills accumulate only from 0 to the current time. Green + area raises current, orange − area lowers it. This is not an energy area.
areaOnEnd: Inspect ON end
areaPeriod: Inspect one period
areaAxes: Fixed axes: time 0..100 µs, inductor voltage vL −12..+12 V. vL is left terminal minus right; iL flows left to right. Here vL is voltage, not velocity. Readouts are rounded after calculation; net area uses unrounded terms.
areaNote: Area gives only current change; absolute current also needs an initial value. This case starts at a nonzero steady valley. Repeating current over a full period makes signed voltseconds cancel: zero average voltage does not mean zero current. Transients need not balance. This is not startup; D/Vin edits recompute another steady case at the same time.
areaBack: Return to integral and inductor route →
areaSource: Analog Devices · volt-second source
cvBalance: Steady state returns to the same current every cycle. Since Δi = vL Δt / L, positive and negative inductor-voltage areas must cancel (volt-second balance). Adding voltage rises and drops around each loop gives:
buckWhy: Output is input voltage times the ON fraction. The excess voltage is not burned in a resistor. Capacitor current is iC = iL − Iout: it charges above load current and discharges below it; charging is not simply tied to switch ON/OFF.
:::

::: strings
pause: Pause
replay: Replay two cycles
changed: Parameters changed: a new steady-state case at the same time; trajectory recomputed.
cyclesDone: Two cycles complete
energyUp: L: magnetic energy increases
energyDown: L: magnetic energy decreases
energyCaption: Stored {e} mJ · fixed full scale {max} mJ; E = ½Li².
capZero: C: zero net current now
capCharge: C: absorbs surplus current (charging)
capDischarge: C: supplies missing load current (discharging)
phaseOn: Current phase: ON, switch closed.
phaseOff: Current phase: OFF, switch open.
buckOnPath: Source + → closed switch → inductor → output node → load → return → source −. Diode is reverse-blocked.
buckOffPath: Return → diode A→K → inductor → output node → load → return. The source is disconnected; the inductor releases energy.
branchZero: Capacitor branch: zero net current now.
branchCharge: Capacitor branch: output node → capacitor + → capacitor − → return; charging.
branchDischarge: Capacitor branch: capacitor + → output node → load → return → capacitor −; discharging.
avgVout: Average Vout
avgIin: Average input current
instIL: Instantaneous iL
instVL: Instantaneous vL
instIC: Instantaneous iC
magEnergy: Magnetic energy
traceIL: Inductor current iL
traceVL: Inductor voltage vL
areaSummary: At {t} µs: positive area {pos} Vµs,negative area {neg} Vµs,net {net} Vµs; current change {di} A,current {i} A.
areaTime: Inspect time t
areaPos: Positive voltseconds +
areaNeg: Negative voltseconds −
areaNet: Net voltseconds ≈
areaI0: Initial current iL(0)
areaDi: Change Δi ≈
areaI: Current iL ≈
:::

## Boost: source and inductor push together {#step5 h2=s5t}

::: strings
nav5: 5 Boost
:::

STEP 5 / 6 · Boost {#s5k .step-kicker i18n=text}

::: html step5-1
s5q: How can a low-voltage input push current toward a higher voltage?
:::

First store energy in the inductor. Then connect the source and inductor toward the output together. While the switch connects to ground, the output capacitor alone supports the load. {#boostLede .lede}

::: html step5-2
boostWhy: During OFF, inductor current decreases and vL is negative: the right terminal is above the left, continuing to push current toward the higher output voltage. Voltage increases; energy is not created.
:::

::: strings
boostOnPath: Storage loop: source + → inductor → switch → return → source −. Separate supply loop: capacitor + → load → capacitor −. The diode isolates the output.
boostOffPath: Source + → inductor → diode A→K → output node → load / capacitor → return → source −. Both the inductor and source supply energy.
:::

## The price of boosting: more input current {#step6 h2=s6t}

::: strings
nav6: 6 Energy budget
:::

STEP 6 / 6 · Energy budget {#s6k .step-kicker i18n=text}

::: html step6-1
s6q: How much input current does a 5 V to 12 V boost need?
:::

Now use a power budget only: a 5 V input supplies a 12 V output at 1 A. Predict the ideal input current first: {#s6predict}

::: html step6-2
s6legend: Compared with the 1 A output
guessLess: Smaller
guessEqual: Equal
guessMore: Larger
reveal: Reveal and explore losses
quizReset: Predict again
s6eff: Efficiency η = output power / input power; the remainder becomes losses such as heat.
eta: Efficiency η
s6budgetNote: Efficiency is an independently specified power budget here. It does not modify the preceding ideal voltage formulas and is not a nonideal circuit solver.
:::

How does a real supply hold its output steady? {#s6h3 tag=h3 i18n=text}

We manually selected duty above: open-loop operation. Real regulators usually measure output, compare it with a target and adjust duty: this is [[inverted-pendulum#step2|feedback control]] . This lesson does not simulate a controller or startup. {#s6feedback}

As D approaches 1, the ideal boost formula diverges. Real circuits are limited by current, magnetic saturation, losses and voltage ratings. This lesson restricts parameters to positive inductor current. Light loads may enter discontinuous conduction, requiring a different analysis. {#s6limits}

::: html step6-3
s6map: Place these circuits on the knowledge map →
:::

::: strings
correct: Correct.
checkAgain: Check the power relation.
idealIn: Ideal input current is 12/5 = 2.4 A, greater than 1 A. Losses increase it further.
inCurrent: Input current
inPower: Input power
loss: Loss
:::
