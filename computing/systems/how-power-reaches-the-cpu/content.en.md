---
lang: en
title: How Power Reaches the CPU · a long essay you can play with
desc: A CPU runs on about one volt, yet it can draw 200 to 300 watts, roughly 200 amps, and its load can jump by a hundred amps in about ten nanoseconds. How does power get from the wall socket into the chip, and why does the chip slow itself down? Eight hands-on models: how much each stage from the wall to the die loses, how power grows with voltage and frequency, at what load a power supply is most efficient, how a multiphase regulator cancels its ripple, how far the voltage sags when the load jumps, which clock finishes a job on the least energy, how deep to sleep when idle, and how power limits and the cooler together set the clock.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.W: {v} W
u.A: {v} A
u.V: {v} V
u.mV: {v} mV
u.GHz: {v} GHz
u.kHz: {v} kHz
u.MHz: {v} MHz
u.nH: {v} nH
u.mohm: {v} mΩ
u.pct: {v}%
u.us: {v} µs
u.ms: {v} ms
u.ns: {v} ns
u.s: {v} s
u.C: {v} °C
u.J: {v} J
u.KW: {v} K/W
u.gcyc: {v} × 10⁹ cycles
u.ph: {v} phases
u.cores: {v} cores
u.none: —
:::

# How Power Reaches the CPU {#hero}

::: strings
kicker: Computing · Systems · a long essay you can play with
:::

A CPU runs on about one volt, yet it can draw 200 to 300 watts, roughly 200 amps, and its load can jump from tens of amps to over 100 amps in about ten nanoseconds.<br>How does electricity get from the wall socket to the chip? And why does the chip slow itself down? {.sub}

We follow the current from start to finish. First the whole chain: the power supply turns the AC from the socket into 12 V, then the voltage regulator module on the motherboard brings it down to about one volt, and every stage loses a little, all of it turned into heat. Next, why it is about one volt and not more: power goes with the square of the voltage. Then we take the chain apart piece by piece: what is inside the power supply, why the row of inductors on the motherboard has a dozen or so of them, what holds the voltage up during the ten or so nanoseconds when the load jumps, and how hundreds of amps pass through the socket and the bumps under the chip. Last come the chip's own ways of saving power (scaling frequency and voltage, and sleeping), how the heat leaves, how the power wall and the temperature wall make it slow down, and how a chip drawing a kilowatt is powered in a data center. **Every model is a scaled-down version of something real**: dynamic power C·V²·f, the efficiency points in the 80 PLUS certification table, the multiphase ripple formula in a Texas Instruments application note, a capacitor network from the regulator to the die, the idle-state table in the Linux kernel's intel_idle driver, and the definitions of PL1, PL2 and Tau in Intel's manual. {.lead}

An AI wrote this page. The rules come from primary sources (Intel's ATX Version 3 Power Supply Design Guide, revision 2.1a; CLEAResult's 80 PLUS certification tables; the power control section of Intel's datasheet; the Linux kernel's schedutil and cpuidle documentation and the intel_idle source; Texas Instruments SLVA882B; Intel's FIVR paper at APEC 2014). The frontier parts come from vendor announcements and technical blogs, with the source and date given for each. **The chip in the models is illustrative**, not any one product. Values marked “tuned parameter” were chosen so the models could compute; the text says how far the conclusion moves when each one doubles. {.note}

## From socket to die: stepping down all the way {#ch1}

::: strings
toc: From socket to die: stepping down all the way
:::

Electricity changes form four times on its way from the socket to the die: 220 V AC, about 400 V DC, 12 V DC, and about one volt DC. Each drop in voltage raises the current, and each stage loses a few percent of the power as heat. {.law}

A water utility does not send water at tap pressure: the main pipes run at high pressure, and the pressure is reduced once at the neighborhood entrance and again at the building. Electricity is stepped down in stages the same way. The socket delivers 220 V, 50 Hz AC (how electricity reaches the socket is covered in a draft essay, “Where the Power Comes From the Instant You Flip the Switch”). The computer's power supply turns it into 12 V DC; the ring of inductors and chips next to the CPU socket on the motherboard, called the **voltage regulator module** (VRM), turns the 12 V into the roughly one volt the CPU needs.

::: diagram dg-chain keys=dg.chain
cap: Electricity runs from the socket to the core, with the voltage stepping down at each stage and the current rising. The numbers are what the model computes under the defaults (a 253 W CPU, an 850 W gold power supply).
aria: Diagram: from the 220 V socket through the power supply, the 12 V cable and the voltage regulator module to the CPU core, with the voltage and current at each step
wall: Socket
wallv: 220 V AC
psu: Power supply
psuv: AC → 12 V DC
vrm: Voltage regulator
vrmv: 12 V → {c253V} V
cpu: CPU core
cpuv: {c253V} V
a1: {c253iw} A
a2: {c253i12} A
a3: {c253I} A
heat: Whatever is lost at each step turns into heat
:::

At a lower voltage the same power needs a larger current, because power equals voltage times current. In the model below, the illustrative chip draws 253 W at {c253f} GHz and {c253V} V, and its core current is about {c253I} A. The same power on the 12 V segment needs only {c253i12} A, and at 220 V on the wall it is only about {c253iw} A. The power lost in wires and contacts is the square of the current times the resistance (for Ohm's law, see <a href='../../../physics/circuits/ohms-law/'>“Ohm’s Law · Current You Tune by Hand”</a>), so the high-current stretches must be short and thick: the one-volt stretch is only the few centimeters between the motherboard and the chip.

::: lab ch1-model
model.title: From socket to die, how much is lost at each step
model.how: Choose how many watts the CPU draws, which certification tier the power supply has, and its rated wattage. The bars show the power turned into heat at each step; the readings below give the voltage and current at each step.
model.aria: Bar chart of the loss at each step from the power supply to the chip package
ctl.cpu: CPU power
ctl.tier: Certification tier
ctl.rated: Power supply rated power
read.wall: Power drawn from the wall
read.iw: Current from the wall
read.i12: Current on the 12 V segment
read.vc: Core voltage
read.ic: Core current
read.share: Share of the wall power that reaches the CPU
read.heat: Turned into heat along the way
tuned: **Tuned parameters**: the resistance of the socket and package is {rPkg} mΩ; the 12 V cable is the 8-pin EPS cable's four 18 AWG positive wires and four ground wires, {cableM} m long (18 AWG copper is 20.95 mΩ per meter); the rest of the system draws a fixed {restW} W; the voltage regulator module is the 12-phase, 500 kHz design from chapter 4. Doubling the package resistance doubles the loss in that box, but the total changes by less than 3%.
st.psu: PSU (AC → 12 V)
st.cable: 12 V cable
st.vrm: VRM (12 V → core)
st.pkg: Socket and package
say.big: The CPU draws {p}, with a core current of {ic}: {wall} is drawn from the wall, {share} of it reaches the CPU, {heat} turns into heat along the way, and the largest share of that is at the step: {top}.
say.mid: The CPU draws {p}, and the core needs only {vc} and {ic}. {wall} is drawn from the wall, {heat} is lost along the way, and the largest share of that is at the step: {top}.
say.light: The power supply is running at only {x} of its rating: at a load this light its efficiency drops to {eta}, and most of the loss is inside the power supply.
say.full: The power supply is already running at {x} of its rating, past the load where efficiency peaks, and its efficiency drops to {eta}. A power supply should keep some headroom above the system's maximum power, as chapter 3 explains.
:::

The default is a 253 W CPU with an 850 W gold-rated power supply. The wall must supply about {c253wall} W, and the CPU gets {c253share}; {c253heat} W turns into heat along the way: {c253psu} W in the power supply, {c253vrm} W in the voltage regulator module (efficiency {c253vrmEff}), {c253pkg} W in the socket and package under the chip, and {c253cab} W in the 12 V cable. With a titanium power supply, the wall needs to supply only {c253tWall} W. Cut the CPU to 125 W, and the voltage is still {c125V} V with {c125I} A of current; cut it to 65 W and the current is still {c65I} A. Voltage falls more slowly than power, so the current stays large. Intel's ATX design guide sets its power supply rules on this basis: for a processor rated at 125 W, the 12 V CPU rail must supply {atx125c} A continuously, with a peak of {atx125p} A.

The model treats each step as a single efficiency number and does not count the power supply's fan, the other regulators on the motherboard, or the memory's power. The core voltage comes from the illustrative chip in chapter 2; a real chip's voltage differs at the same power. The power supply efficiencies are from the 80 PLUS 115 V table; on 220 V a real supply usually does a point or two better. {.take}

## Why only about one volt {#ch2}

::: strings
toc: Why only about one volt
:::

Every time a transistor on the chip switches, it charges and then discharges a tiny bit of capacitance, and the energy spent is proportional to the square of the voltage. A higher frequency needs a higher voltage, so power rises roughly with the cube of the frequency: the last few hundred megahertz are the most expensive. {.law}

Filling a small bucket with water and then emptying it: the higher the bucket is (the higher the voltage), the more effort each fill takes, and the effort grows with the square of the height, so half of the water is poured in at the top. The gates of the billions of wires and transistors on a chip are these small buckets. The number of switchings per second is the frequency f, the fraction of buckets that actually switch each time is written α, and the total capacitance is C, so **dynamic power** is P = α·C·V²·f. The other part is **static power**: when a transistor is off, a little current still leaks through, and the higher the voltage and temperature, the more it leaks. (Why transistors leak is covered in a draft essay, “Why Faster Chips Keep Getting Harder”.)

Why does a higher frequency need a higher voltage? A transistor switches as fast as the current it can push out to charge the next stage, and a higher voltage pushes harder. A common approximation is f ∝ (V − Vt)^α / V, where Vt is the threshold voltage. Turned around: to run at a given frequency there is a lowest voltage, and below it the circuit cannot finish its work within one clock cycle (for clocks and critical paths, see chapter 7 of <a href='../switches-that-compute/#ch7'>“How a Pile of Switches Learned to Do Arithmetic”</a>). This curve is called the **V/f curve**; every chip is measured at the factory, and the curve is stored in the chip.

::: diagram dg-vf keys=dg.vf
cap: The V/f curve of the illustrative chip from chapter 2 (values from the model). The dots are a few fixed operating points, called P-states; the operating system chooses among them (chapter 7). The flat floor on the left is the lowest voltage, and the curve gets steeper to the right.
aria: Diagram: the V/f curve, with the voltage held at its lowest value over the low frequencies and rising steeply at high frequencies, with seven P-state operating points marked on the curve
x: Frequency (GHz)
y: Voltage (V)
floor: Floor {vmin} V
steep: Steeper toward the top
ps: P-state
:::

::: lab ch2-model
model.title: Power of an illustrative chip against frequency, core count and temperature
model.how: Drag the frequency to see how the voltage rises with it and how power rises faster than frequency; then change the number of cores that are on and the temperature. Gold is dynamic power, red is leakage.
model.aria: Curve of power against frequency, split into dynamic power and leakage
cv.dyn: Dynamic
cv.leak: Leakage
ctl.f: Frequency
ctl.n: Cores on
ctl.t: Chip temperature
read.v: Voltage needed
read.p: Total power
read.leak: Of which leakage
read.i: Current
read.pf: Power per GHz
tuned: **Tuned parameters**: this is an illustrative 8-core chip, not any real product. Vt = 0.30 V, α = 1.4, lowest voltage {vmin} V, and {fTop} GHz at {vmax} V; capacitance of 3 nF per core; leakage of 1 A per core at 1 V and 50 °C, multiplied by e for every 0.5 V of voltage increase, and doubling for every 30 °C of temperature rise. Doubling the capacitance doubles the dynamic power and leaves the shape of the curve unchanged.
cv.x: Frequency (GHz)
cv.y: Power (W)
say.floor: {f} is still on the flat floor of the curve: the voltage has already dropped to its lowest, {v}, so lowering the frequency only saves dynamic power, and power is proportional to frequency.
say.mid: {f} needs {v}. With {n} on, the total is {p}, of which leakage is {leak}.
say.top: {f} needs {v}: each extra 100 MHz in this range needs a higher voltage. With {n} on, they draw {p}, which is {pf} per GHz. The last bit of frequency is the most expensive.
:::

The default has 8 cores. Below {fKnee} GHz the voltage stays at its lowest value of {vmin} V, and in that range power is proportional to frequency: 2.4 GHz draws {p24} W. Going from 1.2 GHz to 2.4 GHz, dynamic power exactly doubles while leakage stays put, so total power grows {r2412p}-fold. Above that, the voltage starts to climb: 4.0 GHz draws {p40} W, 4.8 GHz needs {v48} V and draws {p48} W, and 5.6 GHz needs {v56} V and draws {p56} W. From 4.8 to 5.6 GHz, the frequency grows only {r5648f}-fold, while the power grows {r5648p}-fold. That is why laptops and servers are happy to run the chip in the middle of the curve, while desktop makers push it to the top of the curve for the last few percent of benchmark score.

This also answers the question at the start: why not feed the chip 5 V or 12 V directly? Early chips ran at 5 V: their transistors were large and few, so the power stayed manageable. Each generation of smaller transistors had to lower the voltage too, or power would have climbed with its square and the ever-thinner gate insulation could not have withstood it. But the threshold voltage could not keep falling (lowering it makes leakage explode), so for nearly twenty years the voltage has stayed at about one volt while the transistors kept getting packed in. Power per unit area keeps climbing; this is the end of Dennard scaling (see chapter 5 of <a href='../why-compute-waits-for-memory/#ch5'>“Why Compute Waits for Memory”</a>). Out-of-order execution has to track hundreds of instructions at once (<a href='../how-a-cpu-guesses-ahead/'>“How a CPU Guesses Ahead”</a>), and large caches stay powered all the time (<a href='../how-cpu-caches-work/'>“How a CPU's Three Levels of Cache Work”</a>). Both are the C in C·V²·f.

The model folds α into C and treats all cores as running at full load; real programs differ by several times in α (floating-point vector instructions consume the most). Leakage accounts for {leak24} at 2.4 GHz and {leak56} at 5.6 GHz; these shares depend on the process and temperature and can differ a great deal between real chips. {.take}

## The power supply: AC into 12 V {#ch3}

::: strings
toc: The power supply: AC into 12 V
:::

A computer power supply has three jobs: rectify AC into DC, make the current drawn from the socket follow the shape of the voltage waveform (power factor correction), and step the high voltage down to 12 V across a transformer. It is most efficient near half load, and loses a few more percent when very lightly or very heavily loaded. {.law}

A phone charger gets a little warm, and that is the few percent it loses. A computer power supply works on the same principle, just dozens of times bigger. The AC first passes through a filter and a rectifier bridge and becomes a lumpy DC. Next comes **power factor correction** (PFC), a boost circuit that raises the voltage to about 400 V and at the same time controls the current drawn from the grid, so that it follows the sine wave of the voltage like a resistor would, instead of taking a big gulp only at the peaks. Then a high-frequency switching circuit chops the 400 V into a square wave at tens to hundreds of kilohertz and feeds it into a transformer. There is no wire connecting the two sides of the transformer, only magnetic coupling; this is called **isolation**, so a fault on the socket side does not bring high voltage into the case. The transformer's secondary side is rectified to 12 V. Today the 5 V and 3.3 V rails are mostly stepped down from 12 V.

::: diagram dg-psu keys=dg.psu
cap: The internal order of a typical ATX power supply. The dashed line is the isolation: there is no wire between the two sides of the transformer. Schematic, not to scale.
aria: Diagram: inside a computer power supply, from AC input through filtering, rectification, power factor correction, high-frequency switching and the isolation transformer, to rectification on the secondary side and the 12 V output
ac: 220 V AC
emi: Filter
rect: Rectifier bridge
pfc: Power factor correction (boost)
bus: About 400 V DC
sw: High-frequency switching
xf: Transformer
sr: Synchronous rectification
out: 12 V
dc: Step down to 5 V, 3.3 V
iso: Isolation
pri: Primary (high voltage)
sec: Secondary (safe low voltage)
:::

How is efficiency rated? The 80 PLUS certification (now run by CLEAResult) measures efficiency at three load points: 20%, 50% and 100%. For 115 V desktop power supplies the thresholds are: Bronze 82/85/82%, Gold 87/90/87%, Platinum 90/92/89%, and Titanium 90/92/94/90% (Titanium has one extra load point, at 10%). The newest Ruby tier is higher still at 91/93/95/91%, plus an extra 5% load point at 85%. Intel's ATX design guide itself requires only 65/72/70% at 20, 50 and 100% load.

::: lab ch3-model
model.title: Power supply efficiency against load
model.how: Choose a certification tier and drag the load as a share of the rated power. The curve is the loss curve drawn through the 20%, 50% and 100% points of the certification table; look at how far efficiency falls at very light loads.
model.aria: Curves of power supply efficiency against load for several certification tiers
ctl.tier: Certification tier
t.bronze: Bronze
t.silver: Silver
t.gold: Gold
t.platinum: Platinum
t.titanium: Titanium
t.ruby: Ruby
ctl.load: Load as share of rating
read.eff: Efficiency
read.out: Output of the 850 W power supply
read.loss: Turned into heat in the power supply
read.wall: Drawn from the wall
tuned: The efficiency points come from the CLEAResult certification table (115 V, non-redundant). The curve is fitted in this essay: loss = a + b·load + c·load², passing exactly through the 20%, 50% and 100% points, where a is the fixed loss and c is the conduction loss, which grows with the square of the current. Titanium has its own threshold of 90% at 10% load, and the three-point fit gives only {ti10fit} there: a real titanium power supply does better than this curve at light loads.
cv.x: Load as share of rated power
cv.y: Efficiency
say.idle: Only {x} of rating: the power supply's fixed losses (control circuits, switch drivers, fan) make up most of the loss, and efficiency is only {eff}.
say.ok: {x} of rating, efficiency {eff}; at an output of {out}, the power turned into heat inside the power supply is {loss}.
say.sweet: {x} of rating, in the stretch of best efficiency: {eff}.
say.over: Above the rated power. ATX 3.1 lets the power supply briefly withstand higher peaks, but it cannot be run like this for long.
:::

A gold power supply is {gold50} efficient at half load, drops to {gold10} at 10% load and {gold5} at 5%. A computer on standby drawing 60 W with an 850 W gold power supply has an efficiency of about {goldIdle}. The default from chapter 1 ({c253wall} W from the wall) uses {c253x} of the rating, right where the curve is flattest. So “bigger is better” is wrong: a bigger supply spends most of its time on the steep slope on the left of the curve.

Why keep headroom at all? Because the power of the graphics card and the CPU can jump within microseconds. Intel's ATX Version 3 power supply design guide (revision 2.1a, November 2023) requires that power supplies above 450 W with a 12V-2x6 connector withstand peaks of {excA}% of rated power for {excT} microseconds, {exc2}% for one millisecond, {exc3}% for ten milliseconds, and {exc4}% for one hundred milliseconds. The 12V-2x6 is the newer graphics card connector, with 12 power pins and 4 sense pins, rated at {connW} W and requiring {awg} AWG wire and {pinA} A per pin: {pins} 12 V pins carry {pinW} W in total, so the margin is not large. When the connector is not fully seated, the contact resistance rises and the heat concentrates on one or two pins. The +12 V rail is allowed to range from {v12lo} to {v12hi} V. For how the voltages come up in order after the power button is pressed, see chapter 1 of <a href='../how-a-computer-boots/#ch1'>“How a Computer Boots”</a>; for power negotiation over a USB-C cable, see chapter 7 of <a href='../how-thunderbolt-works/#ch7'>“How Thunderbolt Works”</a>.

Certification measures steady-state efficiency at a few fixed load points at about 23 °C; it does not measure transients, or efficiency after the power supply has aged. The power factor correction stage has its own loss of a percent or two, which is already included in the efficiency. {.take}

## Stepping down on the motherboard: multiphase regulation {#ch4}

::: strings
toc: Stepping down on the motherboard: multiphase regulation
:::

Getting from 12 V to one volt is done by a buck converter: a switch opens and closes hundreds of thousands of times a second, and an inductor smooths the pulses out. A single inductor cannot handle 200 A, so a dozen or so are placed side by side and switch in turn, so that their ripples cancel each other. {.law}

One person pours water into a bucket through a hose, turning the flow on and off, and the water level bobs up and down. Twelve people, each with a hose, turned on at staggered times, keep the level much steadier, and each has an easier job. The motherboard's voltage regulator module works this way. Each **phase** is a buck converter: a pair of switches (today usually a “power stage” that packages two MOSFETs with their driver), an inductor, and the outputs of all the phases connected together, with a large bank of capacitors. The fraction of time the switch is on is called the duty cycle D, and ideally the output voltage = D × input voltage: stepping 12 V down to 1.2 V needs a D of only {v1D}. For why a buck converter works this way and what the inductor and capacitor each do, see <a href='../../../physics/circuits/power-converters/'>“Buck & Boost · Follow the Energy”</a>; it is not derived again here.

The current in the inductor climbs while the switch is on and falls while it is off, going up and down once per cycle. This up-and-down is the **ripple**, of size ΔI = (V_in − V_out)·D / (L·f). For one phase, at 220 nH and 500 kHz, the ripple is {v1dI} A. With several phases, the controller staggers the switching of each phase by 1/N of a cycle, so that while one phase is climbing another is falling, and the sum has much smaller ripple. At duty cycles that equal exactly 1/N, 2/N and so on, it cancels completely.

::: diagram dg-vrm keys=dg.vrm
cap: A four-phase buck converter. The controller gives each phase a switching signal offset by 90°. The waveforms alongside are computed by the model (four phases, 200 A): the four thin lines each rise and fall, and the thick line of the sum rises and falls less, at four times the single-phase frequency. The circuit is schematic and not to scale.
aria: Diagram: a four-phase buck converter with 12 V input; each phase has a switch pair and an inductor, with outputs joined to the capacitors and the CPU. On the right, the staggered current waveforms of the four phases and their sum
vin: 12 V
ctl: Controller
ph: Phase
cout: Output capacitors
cpu: CPU
sum: Total current
each: Current per phase
shift: Offset by 1/4 cycle
:::

::: lab ch4-model
model.title: How smooth the summed current is when N phases switch in turn
model.how: Change the number of phases, the switching frequency, the inductance and the load current. The thin lines above are the current of each phase, and the thick line is their sum (scale on the right). See how the ripple of the sum shrinks as the phase count rises, and how efficiency falls when the switching frequency goes up.
model.aria: Waveforms of the current in each phase and the total current over time in a multiphase buck converter
ctl.n: Phases
ctl.f: Switching frequency
ctl.l: Inductance per phase
ctl.i: Load current
read.ph: Average current per phase
read.dI: Ripple per phase
read.sum: Ripple of the total current
read.k: Remaining after cancellation
read.eff: Voltage regulator module efficiency
read.loss: Turned into heat
tuned: The ripple and the cancellation come from the formulas in Texas Instruments application note SLVA882B (2017, revised 2021); the total current in the figure is the sum of N real triangular waves and agrees with the formula. **Tuned parameters**: the on-resistance of each phase (switch plus the DC resistance of the inductor) is 1.5 mΩ, switching transitions take 3 ns, each switching event costs a fixed 0.8 µJ per phase, and the controller uses 0.5 W. Doubling the on-resistance adds about 5 W of loss at 200 A.
cv.x: Time (µs)
cv.y: Current per phase (A)
cv.y2: Total current (A)
say.one: Only one phase: the whole ripple, {dI}, falls on the output capacitors; all {i} goes through one inductor and one pair of switches, and the loss is {loss}.
say.ok: {n} switching in turn: the ripple per phase is {dI}, and the sum is only {sum} (that is {k} of one phase's ripple). Each phase carries {ph}, and efficiency is {eff}.
say.hot: Each phase has to carry {ph}; the conduction loss grows with the square of the current, and efficiency falls to {eff}. At this point, add phases.
:::

The default is 12 phases, 500 kHz, 200 A: each phase averages {v12ph} A, the ripple of a single phase is {v1dI} A, and the sum is only {v12sum} A, which is {v12k} of a single phase. Efficiency is {v12eff}, and the power turned into heat is {v12loss} W. With the same 200 A on one phase only, efficiency is only {v1eff}, and the {v1loss} W falls entirely on one inductor and one pair of switches; with 6 phases it is {v6eff}. Raising the switching frequency to 1 MHz halves the ripple, but each switching event costs something, so efficiency drops to {v12feff}. At a 30 A load with all 12 phases on, the fixed losses dominate and efficiency is {v12leff}, which is why the controller **sheds phases** at light load, keeping only one or two running. Of the “20+2 phase” counts advertised on motherboards, many are one controller channel driving two power stages in parallel, which does not mean 20 independent phases.

The model assumes the current is shared exactly equally among phases, and does not count the core losses of the inductors or the rise in switch resistance with temperature. A real controller also keeps adjusting the duty cycle to follow the load, which is the subject of the next chapter. {.take}

## When the load jumps: the load line and decoupling {#ch5}

::: strings
toc: When the load jumps: the load line and decoupling
:::

The core current can jump by over 100 A in about ten nanoseconds, while the regulator on the motherboard takes microseconds to respond. The gap is covered by layers of capacitors: the ones closer to the chip are smaller and faster. The regulator also deliberately makes the voltage slope down with the current, called the load line, so that the sag can be calculated in advance. {.law}

You are on a bus; when it brakes, your body lurches forward and then settles after a moment. The chip's voltage does the same. When a program suddenly switches from waiting on memory to full-speed computing, millions of transistors start switching at once and the current climbs within about ten nanoseconds. The voltage has to pass through the inductance of the wires and the socket, and inductance resists sudden changes in current (V = L·di/dt), so the voltage on the chip first sinks; this is called **droop**. If it sinks too deep, the slowest circuits cannot finish within one clock cycle at that moment, and they give wrong results, which shows up as a crash or a blue screen.

The remedy is to place buckets along the way. Below a few tens of kilohertz the regulator keeps up by itself. Furthest from the chip are large electrolytic or polymer capacitors on the motherboard, thousands of microfarads, which handle tens of kilohertz up to about a megahertz. The back of the socket and its surroundings have dozens of ceramic capacitors (MLCCs), which handle hundreds of kilohertz to a few megahertz. The package has a ring of small capacitors, which handle a few to tens of megahertz, and the fastest are the capacitors inside the die, which handle everything above that. Each layer only works within its own band, because each capacitor has a little series inductance (ESL). Taken together, the impedance |Z| looking back from the chip against frequency is called the **power delivery network** (PDN). The design rule comes from a 1999 paper by Larry Smith and colleagues: keep the impedance below the **target impedance** at all frequencies, Z = ΔV / ΔI, the allowed voltage swing divided by the current step. A 1.25 V rail that allows a 5% swing with a 100 A current step gives a target of {zT} mΩ.

::: diagram dg-pdn keys=dg.pdn
cap: Five layers of the power delivery network. The closer to the die, the smaller the capacitor and the higher the frequency it handles; each segment of wire has resistance and inductance. The bands are orders of magnitude. Schematic, not to scale.
aria: Diagram: the power delivery network from the regulator to the die, passing through large capacitors, ceramic capacitors, the socket, package capacitors, bumps and die capacitors, with the frequency band each layer handles labeled below
vrm: Regulator
bulk: Bulk capacitors
mlcc: Ceramic capacitors
sock: Socket
pkg: Package capacitors
bump: Bumps
die: Die capacitors
load: Die
f1: DC to about 200 kHz
f2: About 10 kHz–1 MHz
f3: About 100 kHz–10 MHz
f4: About 1–100 MHz
f5: Above about 10 MHz
rl: R + L
:::

Intel goes a step further with a **load line**, also called adaptive voltage positioning. The regulator does not pin the voltage at one value; it makes the voltage slope down linearly with the current: V = VID − R_LL × I. When the load is light, the voltage is high; when the load suddenly jumps, the voltage was going to drop anyway, so most of the sag falls inside room set aside in advance, and when the load suddenly lightens, the upward kick stays below the light-load level. So the target impedance equals R_LL: as long as |Z| is flat and equal to R_LL at all frequencies, the sag for any step is R_LL × ΔI, which can be calculated in advance.

::: lab ch5-model
model.title: Voltage on the die after a current step ΔI
model.how: Change the load line and the size of the current step, and remove the ceramic or package capacitors. The upper plot shows the voltage after the jump (time on a log scale, from nanoseconds to tens of microseconds), with the dashed line marking the voltage it finally settles at. The lower plot shows the impedance looking back from the die through the same network, with the dashed line the target.
model.aria: Curve of die voltage over time after a load jump, and the curve of power delivery network impedance against frequency
model.aria2: Curve of power delivery network impedance against frequency, and the target impedance
ctl.ll: Load line
ctl.di: Current step
ctl.mlcc: Ceramic capacitors around the socket
ctl.pkg: Capacitors on the package
ctl.die: Die capacitance cut to 1/4
read.v0: Before the jump
read.min: Lowest point
read.droop: Deepest sag
read.static: Final drop
read.over: Below the final voltage
read.zpk: Impedance peak
tuned: **Tuned parameters**: VID 1.25 V; the regulator's response speed is stood in for by a 0.8 nH inductor (roughly a control bandwidth of 200 kHz); ten 560 µF polymer capacitors, thirty 22 µF ceramic capacitors, 20 µF of package capacitance and 2 µF of die capacitance; and the resistances and inductances along the way (magnitudes taken from common designs, not from any particular motherboard). The current ramps up by 100 A within 10 ns (the size and speed of this step are orders of magnitude, not a measurement of any chip). Doubling the ramp time makes the first sink shallower.
cv.x: Time after the jump (log)
cv.y: Die voltage (V)
cv.final: Final settling
cv.zx: Frequency (log)
cv.zy: |Z| (mΩ, log)
cv.goal: Target
say.ok: Current step {di}: the voltage sinks by up to {droop}; it will settle {st} lower (the load line and resistance, calculated in advance), and the lowest point is only {over} below that.
say.dip: Current step {di}: the voltage first sinks to {min}, which is {over} below the final voltage, and the impedance peak {zpk} (at {fpk}) exceeds the target.
say.noll: No load line: the steady state sags only {st}, but the jump still sags {droop} at that moment, {over} below the final voltage. The load line does not change that first sink; it changes where the voltage settles.
say.missing: One layer of capacitors missing: the impedance rises to a peak of {zpk} near {fpk}, and the voltage sinks to {min}, {over} below the final voltage.
:::

The default load line is {llDef} mΩ and the current step is {dIdef} A: from {sV0} V the voltage sinks by up to {sDroop} mV; it will finally settle {sStatic} mV lower than where it started (the load line plus the resistance along the way, which it has to lose sooner or later), so the lowest point is only {sOver} mV below the final voltage. Remove the ceramic capacitors around the socket, and the second wave of sag appears and the voltage sinks by up to {sNoM} mV. Remove the package capacitors, and the die capacitance resonates with the socket inductance near {zNoPF} MHz; the impedance peaks at {zNoP} mΩ, and the voltage sinks by up to {sNoP} mV. This chip would miscalculate. Set the load line to 0, and the steady state sags only {sLL0s} mV, but the initial sink is still {sLL0} mV, more than a hundred mV below the final voltage, so the voltage needs extra room for that sink. Overclockers lower the load line (called LLC, load-line calibration, in motherboard BIOS) to get a higher full-load voltage; the price is that the sink no longer falls inside room set aside in advance, and when the load suddenly lightens the voltage overshoots upward.

The model is a lumped ladder network, while a real power delivery network is distributed: capacitors have physical positions on the board, and the sag differs across the die. The regulator's control loop is also approximated by a single inductor and does not model its own overshoot. The default network has a {zPk} mΩ peak near {zPkF} MHz, higher than the load line; the 10 ns ramp excites it only partly (that is the extra few tens of mV), and with a {riseFast} ns ramp the same 100 A step sinks {sFast} mV. {.take}

## How hundreds of amps reach the die {#ch6}

::: strings
toc: How hundreds of amps reach the die
:::

Two hundred amps cannot pass through a single pin, so the current is split among hundreds of them: many of the socket's contacts are power and ground, and several thousand bumps under the package spread the current across the whole die. Where the current is too concentrated, electrons push the metal atoms away one by one, which is called electromigration. {.law}

Each pin in the socket and each solder ball under the package can carry only a limited current. As noted earlier, the 12V-2x6 connector is rated at {pinA} A per pin, and the contacts under the chip are much smaller. So a large part of the more than a thousand contacts on a desktop CPU socket are power and ground. Current enters the package from the motherboard through its multilayer substrate, then reaches the die through the several thousand to tens of thousands of bumps on the face of the die (chips are flip-chip mounted, with the transistor side facing down), spreads out through the few thick metal layers closest to the bumps (called the top metal in process jargon), and finally works its way layer by layer to the transistors. Every layer has resistance and inductance; these are the “R + L” of the previous chapter.

::: diagram dg-die keys=dg.die
cap: Cross-section from the motherboard to the transistors (drawn upside down, with the die at the top). Current rises from the motherboard, through the socket contacts, the power planes in the package and the bumps, into the die. Schematic, not to scale.
aria: Diagram: current flows from the motherboard through the socket contacts, the package substrate and the bumps into the die; in front of each core on the die is a row of power-gating switches, and some chips also do a second stage of regulation on the die
board: Board (VRM output)
sock: Socket: power and ground
sub: Substrate: power planes
bump: Bumps (thousands)
die: Die
fivr: On-die regulator (FIVR)
gate: Power-gating switch
core: Core
off: Core off
up: Current
:::

High current density also causes a slow problem: **electromigration**. The electron flow hits the metal atoms and pushes them in one direction over the years, emptying one end of a wire until it breaks and piling up hillocks at the other end that touch the neighboring wire. Its lifetime falls steeply with current density and temperature (described by an empirical formula called Black's equation), which is one reason chip makers set a maximum current for each chip (Intel calls it ICCmax): the regulator is designed to it, and the chip limits its current to it. Sustained overvoltage and overcurrent from overclocking shorten a chip's life, and this is one of the reasons.

Since getting current into the chip is so hard, why not move the last stage of step-down into the chip itself, delivering power at a higher voltage and lower current? Intel did this in its fourth-generation Core (Haswell) in 2013, with a **fully integrated voltage regulator** (FIVR). According to Intel's paper at APEC 2014, a first stage on the motherboard steps 12 to 20 V down to about {fvVin} V and sends it to the die, where there are {fvLo} to {fvHi} FIVRs. Each is a buck converter with a switching frequency of {fvMhz} MHz and up to {fvPh} phases, with the switches and high-frequency capacitors on the die and the inductors built into the package. Its peak efficiency is about {fvEff}%, and it delivers {fvAmm} A per square millimeter. The benefit is that each core and graphics unit can have its own voltage and run independently; the cost is that the losses in this stage turn into heat on the die.

Another tool is **power gating**: a row of large switches between a core and the power supply shuts the whole core off when it is unused, so there is no leakage at all. The cost is that waking up requires powering it back on and restoring its state, which takes tens of microseconds (this is the deep C-state of chapter 8). Many phone and laptop chips group cores into clusters with one voltage per cluster, and the cores in a cluster share a frequency. This is also why, when one core in a cluster needs a high frequency, the others have to raise their voltage too.

There is no model in this chapter: the pin count, the number of bumps and the rated current per contact vary from product to product, and this essay has no public figures that can be checked item by item. {.take}

## Scaling frequency and voltage, and race to idle {#ch7}

::: strings
toc: Scaling frequency and voltage, and race to idle
:::

The chip does not run at its top frequency all the time: the operating system chooses among P-states, and frequency and voltage change together. To finish a fixed amount of work, going too slowly wastes energy on leakage, while going too fast costs voltage squared. The most energy-efficient frequency is usually near the knee where the V/f curve starts to turn up. {.law}

A car's accelerator is not floored all the time, nor left idling: you press harder going uphill and ease off on the flat. A CPU's frequency is also always changing, called **dynamic voltage and frequency scaling** (DVFS). Each operating point (a frequency with its matching voltage) is called a P-state, and they are the dots on the chart in chapter 2. A change takes tens of microseconds: raise the voltage first and then the frequency, or lower the frequency first and then the voltage.

Who chooses? In Linux this is the cpufreq governor, and the default now is **schedutil**. The rule written in the kernel documentation is: target frequency = min(maximum frequency, {shHead} × utilization × maximum frequency). Utilization is computed by the scheduler from recent run time, with more recent time weighted more heavily: the most recent {pelt} ms account for half of the value. The multiplier {shHead} leaves headroom: at a utilization of {shU}, a chip whose maximum is {shMax} GHz is asked to run at {shF} GHz. Newer Intel and AMD chips hand this job to the hardware itself (Intel calls it HWP), and the operating system only supplies a preference. Turbo Boost (or Precision Boost) lets a few cores run briefly at the top of the V/f curve when power and temperature have room.

So which frequency uses the least energy to finish a fixed amount of work? This is the question of race to idle versus running slowly.

::: lab ch7-model
model.title: Finishing one task in one second: which frequency uses the least energy
model.how: A core must finish a task within one second (you set how many cycles it takes), then goes to sleep. Choose the depth of sleep and the power of the rest of the chip while it is awake, and see where the total-energy curve against frequency is lowest.
model.aria: Curve of total energy against frequency for finishing a fixed amount of work
cv.run: Run
cv.sleep: Sleep
ctl.idle: After finishing
i.c1: Light sleep (clock stopped only)
i.c6: Deep sleep (fully powered off)
ctl.work: Amount of work
ctl.plat: Power of the rest of the chip while awake
read.best: Most efficient frequency
read.eb: Energy at that point
read.es: Slowest, just finishing in time
read.ef: Fastest, then sleep
tuned: The core power is that of one core of the illustrative chip from chapter 2, at a fixed temperature of 60 °C. **Tuned parameters**: in deep sleep each core still draws 0.02 W; in light sleep the core's voltage stays at its lowest value, so only dynamic power is saved and leakage remains. Doubling the deep-sleep power leaves the conclusion unchanged.
cv.x: Frequency (GHz)
cv.y: Total energy (J)
say.knee: The most efficient is {best}, right near the knee where the voltage starts to climb. Slower, and leakage drags on longer; faster, and the square of the voltage rises more steeply. Running at top speed takes {ef}, which is {more} more than the lowest point.
say.slow: The most efficient is {best}, which just finishes within one second: the work is so large that the core cannot slow down.
say.c1: In light sleep the core stays powered and keeps leaking, so below the knee it hardly matters which frequency is used ({es} against {eknee}); above the knee, the faster it runs the more it costs, up to {ef} at top speed.
:::

The default is deep sleep, 1 billion cycles, with the rest of the chip not counted. The most efficient frequency is {rC6best} GHz, right at the knee of the curve in chapter 2, using {rC6E} J; the slowest that finishes in exactly one second needs {rC6slow} J, and running at full speed and then sleeping needs {rC6fast} J. With light sleep, every frequency below the knee is the same ({rC1slow} J, and {rC1knee} J at the knee), and full speed needs {rC1fast} J. Raise the power of the rest of the chip while awake to 6 W, and the best frequency moves only to {rC6pbest} GHz. So the answer is neither “faster is better” nor “slower is better”, but **run up to the knee, then sleep deeply**. The model in this chapter is the **race to idle** model, and chapter 9 reuses the same chip.

The model assumes the amount of work does not depend on frequency. Real programs often wait on memory, and at a higher frequency they wait more cycles, so the best frequency is lower. It also does not count the time and energy of switching P-states themselves. {.take}

## How deep to sleep when idle {#ch8}

::: strings
toc: How deep to sleep when idle
:::

An idle core can doze lightly or sleep deeply. The deeper it sleeps, the less power it uses, but the slower it wakes, and it pays off only if the core stays idle long enough. Every time, the operating system must guess how long this idle period will last, and if it guesses wrong it either wastes power or makes the program wait. {.law}

Taking a ten-minute nap is not worth changing into pajamas and getting into bed; eight hours at night is. A CPU's idle states are called **C-states**. C0 is working; C1 stops the clock and wakes almost immediately; the deeper the state, the more is shut off: C6 turns off the core's voltage, with its state saved elsewhere, and the deeper states also turn off the shared cache and more components. Each state has two numbers: the **exit latency** (the longest time from waking it to being able to execute the next instruction) and the **target residency** (the minimum time it must sleep before it saves more power than the shallower state).

::: diagram dg-cst keys=dg.cst
cap: The Skylake C-state ladder (exit latency / target residency, in µs, from the Linux intel_idle driver; the table's C7s and C9 are left out). The deeper it goes, the more is switched off.
aria: Diagram: the C-state ladder from C0 to C10; the deeper it goes, the less power is used, and the longer the exit latency and target residency
c0: C0: running
c1: C1: clock stopped
c1e: C1E: clock off, low voltage
c3: C3: cache flushed, off
c6: C6: core powered off
c8: C8: more parts off
c10: C10: almost all off
col1: Exit / residency
deeper: Deeper saves more, wakes more slowly
n1: 2 / 2
n1e: 10 / 20
n3: 70 / 100
n6: 85 / 200
n8: 200 / 800
n10: 890 / 5000
:::

The Linux intel_idle driver contains this table for each generation of Intel chips. Taking Skylake as an example: C1 has an exit latency of 2 µs and a target residency of 2 µs; C1E 10 and 20; C3 70 and 100; C6 85 and 200; the deeper C8 200 and 800, and C10 890 and 5000 µs. The menu governor in cpuidle guesses an idle duration before each idle period, then picks the deepest state whose target residency does not exceed the guess. If a program asks for low latency (PM QoS), states whose exit latency exceeds the limit cannot be used. Sleep and hibernation (S3, S4, S0ix) are states of the whole machine; see chapter 5 of <a href='../how-a-computer-boots/#ch5'>“How a Computer Boots”</a>.

::: lab ch8-model
model.title: 3000 idle periods of one core: how good is the guess
model.how: Change the average idle length, the way a state is chosen, and the exit-latency limit. The bars show how often each state was chosen; the readings give the average power, the saving compared with always using C1, and the average wait each time the core wakes.
model.aria: Bar chart of how often each idle state was chosen
ctl.mean: Average idle length
ctl.pol: How the state is chosen
p.c1: Always C1
p.menu: Guessed from the average of the last 8
p.oracle: Known in advance (ideal)
ctl.lat: Limit on exit latency
lat.0: No limit
read.pw: Average power (per core)
read.save: Saving against always using C1
read.lat: Average wait on each wake-up
read.miss: Idle periods shorter than the target residency
tuned: Exit latencies and target residencies come from the skl_cstates table in drivers/idle/intel_idle.c of the Linux kernel. **Tuned parameters**: power per core in each state (C1 1.2 W, C1E 0.8, C3 0.35, C6 0.08, down to 0.02 W for C10); the wake-up time is counted at 2.5 W; idle lengths are drawn at random from an exponential distribution (fixed seed). Doubling the power of all states together leaves the proportion of savings unchanged.
say.c1: Always C1: the fastest to wake ({lat}), but the average power per core is still {pw}.
say.short: Each idle lasts about {mean} on average. The deeper states are woken before they reach their target residency, so guessing by the average ends up {saveword} {save} compared with always using C1.
say.menu: Guessing from the average of the last 8 saves {save} against always using C1, at an average extra wait of {lat} per wake-up; {miss} of the idle periods are shorter than the target residency.
say.miss: Idle lengths vary widely, so the average guess is often wrong: {miss} of the idle periods are too short, but it still saves {save} against always using C1.
say.oracle: Knowing in advance how long each idle period will last (impossible in practice): it saves {save}, the upper bound for any governor.
saveword.more: spending an extra
saveword.less: saving
:::

By default the average idle is 300 µs, guessed by the average: it saves {cMenuSave} against always using C1, while the ideal would save {cOrSave}. The average wait on each wake-up is {cMenuLat} µs, and {cMenuMiss} of the idle periods are shorter than their target residency (exponentially distributed idle lengths are hard to guess in the first place). When idle is very short (average 20 µs), this kind of guessing actually costs {cMenu20Save} more than always using C1. Linux also has another governor, teo, which guesses from the history of which range the idle length has fallen into, rather than simply taking the average. With an average idle of 3 ms, deep sleep saves {cDeepSave}, but the average wait on each wake-up is {cDeepLat} µs; limit the exit latency to 100 µs, and it still saves {cLatSave}. Latency-sensitive servers often simply turn off the deep C-states, trading electricity for response time.

The model looks at only one core, and “guess from the average” is a simplification of menu, which also looks at when the next timer is due. On a real chip, shared components (caches, memory controllers) can enter deeper package-level states only once all cores are asleep. The power figures are tuned, and the latencies in the table are for the Skylake generation; newer chips differ. {.take}

## Heat: the power wall and the temperature wall {#ch9}

::: strings
toc: Heat: the power wall and the temperature wall
:::

Half the reason a chip slows down is the power wall: Intel lets it sprint at PL2 for a while, with the average power governed by PL1 and the time constant Tau. The other half is the temperature wall: the thermal resistance from die to air is too large, so when the junction temperature reaches its limit, the chip is forced to slow down. {.law}

A kettle plugged in does not reach a hundred degrees at once: first the base heats up, then the water. A chip is the same. The die is small with little heat capacity, so it warms up within milliseconds; the heat has to pass through the thermal interface material to the lid (the IHS), through the thermal paste to the heatsink, and finally is carried away by air or water. Each stage has a **thermal resistance** (how many degrees it rises per watt) and a heat capacity. In steady state, junction temperature = ambient temperature + power × the sum of the thermal resistances of each stage. The die's upper limit is called Tj max, which is {tjMax} °C for the Core i9-14900K.

::: diagram dg-therm keys=dg.therm
cap: The thermal path is like a chain of resistors: power is the current, and temperature difference is the voltage. The numbers are the tuned values from the chapter 9 model, showing each stage's temperature rise at 253 W.
aria: Diagram: heat flows from the die through the thermal interface material, the lid, the thermal paste and the heatsink to the air, with one thermal resistance per stage
die: Die (Tj)
ihs: Lid (IHS)
hs: Heatsink
air: Air {thAmb} °C
r1: {rjc} K/W: +{thD1} °C
r2: {rch} K/W: +{thD2} °C
r3: {ra15} K/W: +{thD3} °C
tim: TIM
paste: Thermal paste
q: 253 W
:::

The power wall is three numbers written in Intel's datasheet. **PL1** is the limit on average power, recommended to equal the processor's base power. **PL2** is the limit for a short sprint. **Tau** is the time constant used to compute the average power: the chip computes the recent power as an exponentially weighted moving average (EWMA), and as long as the average is below PL1, it may run at PL2. The i9-14900K has a base power of 125 W and a maximum turbo power of 253 W. Its Tau is not in any document this essay could open; what can be checked is an earlier generation's datasheet: the one for the 10th-generation Core i9-10900K gives a Tau of {tau10} s. The model below borrows that {tau10} s and pairs it with 125 and 253 W; the combination is illustrative, not any chip's factory setting. Starting from an idle of {idleW} W and sprinting at 253 W, the average reaches 125 W after about {boost} s. Tau is {tau10} s, yet the sprint does not even last {tau10} s. AMD's equivalents are PPT (total package power), TDC (the current the regulator can supply continuously) and EDC (short-term peak current); the Ryzen 7000 model rated at 170 W has a PPT of 230 W.

::: diagram dg-pl keys=dg.pl
cap: How PL1, PL2 and Tau work together. The solid gold line is the actual power; the dashed line is the average power computed with Tau. The moment the average reaches PL1 is given by t = Tau·ln((PL2 − start) / (PL2 − PL1)).
aria: Diagram: after full load starts, power first holds at PL2, the average power climbs according to Tau, and when it reaches PL1 the power drops to PL1
pl2: PL2 253 W
pl1: PL1 125 W
avg: Average power (EWMA)
t: About {boost} s
x: Time
start: Full load starts
:::

Intel's ATX power supply guide also covers this: desktop processors can stay at PL2 for many seconds, sometimes close to a minute. According to press tests, many motherboards set PL1 by default to the same value as PL2, which in effect removes the power wall; then only the temperature wall is left to restrain the chip. On Intel chips the temperature wall is called PROCHOT: when the temperature sensor on the die reaches its limit, it makes the chip slow down. It is also a pin, which the regulator on the motherboard can pull when it overheats, so that the CPU slows down first.

::: lab ch9-model
model.title: Three minutes at full load: power, frequency and junction temperature
model.how: Choose a set of power limits, change the thermal resistance from the heatsink to the air (smaller is better), then press “Run again”. In the upper plot, gold is power and cyan is frequency; in the lower plot, red is junction temperature, and the dashed line is Tj max.
model.aria: Curves of power, frequency and junction temperature over time at full load
cv.p: Power (W)
cv.f: Frequency (GHz)
cv.tj: Junction temperature (°C)
ctl.preset: Power limits
pr.intel: PL1 125 / PL2 253 / Tau 56 s
pr.unlim: PL1 = PL2 = 253 (no power wall)
pr.low: PL1 65 / PL2 125 / Tau 28 s
ctl.ra: Heatsink-to-air thermal resistance
ctl.replay: Run again
read.pk: Peak frequency
read.pl2: Sprint lasted
read.fend: Final frequency
read.pend: Final power
read.tj: Peak junction temperature
read.hot: Hit the temperature wall
tuned: The chip is the one from chapter 2, with leakage varying with junction temperature. **Tuned parameters**: die to lid {rjc} K/W, lid to heatsink {rch} K/W, heat capacities of 4, 40 and 300 J/K respectively, ambient 25 °C, idle at 20 W, and full load starting at the 5th second; the temperature wall lowers or raises the frequency by 100 MHz every 0.05 s. Doubling the heat capacity of the heatsink roughly doubles the time before the temperature wall is hit, and the final frequency barely changes.
cv.x: Time (s)
cv.tjmax: Tj max
say.ok: After a sprint of {pl2}, the average power reaches PL1, and the frequency falls from {pk} to {fend}, with a peak junction temperature of {tj}. This chip is governed by the power wall, and a better heatsink will not change its frequency.
say.hotU: No power wall: the chip runs at 253 W throughout. After {hot}, the junction temperature reaches {tjmax} and it starts to slow down, finally settling at {fend} and {pend}. Now the heatsink decides the frequency.
say.flat: No power wall, and a good enough heatsink: the peak junction temperature is {tj} and the frequency holds at {fend}. Note that as the junction temperature rises, leakage grows, so the same power buys less frequency.
:::

By default PL1 is 125, PL2 is 253, Tau is 56 s, with a heatsink of {ra15} K/W: the sprint lasts {th15pl2} s (a little longer than the {boost} s from the formula above, because the model picks the frequency in 100 MHz steps, so the sprint power sits a little under 253 W), peaks at {th15peak} GHz, then falls to {th15f} GHz, and the junction temperature ends at {th15tj} °C. With a larger heatsink at {ra08} K/W, the final frequency is still {th08f} GHz: it is governed by the power wall, and the heatsink cannot help. Remove the power wall, with a heatsink at {ra20} K/W: after {thUhot} s the junction temperature hits 100 °C, and the frequency is pressed down to {thUf} GHz; only with a heatsink at {ra08} K/W can it hold steady at {thU08f} GHz. Computing with 253 W and a total thermal resistance of {rTot15} K/W, the junction temperature must be {dT253} °C above ambient. This is where “the i9 hits 100 degrees on air cooling as soon as it runs” comes from.

The model's thermal path is a one-dimensional three-stage chain. A real die has hot spots, with a dozen or so degrees of difference between cores, and Intel's PL1 algorithm and AMD's PPT/TDC/EDC details are more complex than what is shown here. The specific values of PL1, PL2 and Tau are set by motherboard makers, and the same chip can behave very differently on different motherboards. {.take}

## Data centers: a kilowatt per chip {#ch10}

::: strings
toc: Data centers: a kilowatt per chip
:::

An AI accelerator already draws over a kilowatt, and a rack of them can exceed 100 kW. Push the same logic to the limit: the voltage inside the rack has to be higher (48 V, and moving toward 800 V DC), the last stage of step-down has to sit as close to the chip as possible, and heat can only be carried away by liquid. {.law}

The user manual for the NVIDIA DGX B200 says: one machine has {dgxN} B200 GPUs, a maximum power draw of {dgxKw} kW, six 3.3 kW power supplies (5+1 redundant), and each GPU is rated up to {gpuW} W. One kilowatt at 12 V is {a12} A, and at 48 V it is {a48} A. The same wire, with 4 times the voltage, carries 4 times less current, so the loss is {lr} times smaller. That is why Google, when it joined the Open Compute Project (OCP) in 2016, contributed its 48 V rack design and said that in its evaluation 48 V was at least {g48}% more energy efficient than its earlier 12 V design (Google's own claim, which does not say which losses it counts). The OCP Open Rack V3 uses a 46 to 52 V busbar. For how a GPU uses this power, see chapter 11 of <a href='../how-a-gpu-computes/#ch11'>“How a GPU Computes”</a>.

Above the rack level, 48 V is no longer enough. NVIDIA's technical blog of May 20, 2025 says: if a 1 MW rack used 54 V, its busbars would need as much as {cu} kg of copper; 1 MW at 54 V is {mwA} kA, and at 800 V it is only {mw800} A. NVIDIA plans to supply racks with 800 V DC from {nvYear} onward (this is NVIDIA's plan, discussed in the next chapter).

The part closest to the chip is changing too. On the motherboard the regulator sits beside the chip (lateral delivery), so the high current has to travel several centimeters across the board. With the regulator placed directly under the chip, on the back of the board (**vertical power delivery**), the current goes straight up through the board, along a path only a few millimeters long. Heat has also reached the limit of air cooling: on top of each 1 kW chip sits a cold plate, with water or coolant flowing inside it, carrying the heat to heat exchangers outside the rack.

This chapter has no model. The numbers are computed as power = voltage × current, or taken from vendor material; rack-level losses also depend on busbar cross-section, length and temperature. {.take}

## Where the frontier is (November 2026) {#ch11}

::: strings
toc: Where the frontier is (November 2026)
:::

The bottleneck of power delivery is moving inside the chip: power lines are starting to reach the transistors from the back of the wafer, regulators are being placed under the chip, and racks are switching to high-voltage DC. The physical rules have not changed: a lower voltage means a larger current, and the path must be short. {.law}

What follows falls into three groups: what has already been written into specifications and products, what has been demonstrated or has happened, and what a party with a stake in the matter has said. Dates are given throughout.

### Already in specifications and products {#h.est .sub3}

- Intel's ATX Version 3 Power Supply Design Guide, revision 2.1a (November 2023), sets the transient capability of power supplies and the 600 W 12V-2x6 connector. The 80 PLUS certification table already has a tier above Titanium: Ruby (91% at 10% load, 95% at 50% load). {#e1}
- Backside power delivery has reached products: Intel dropped its 20A process in September 2024, keeping PowerVia for 18A. Panther Lake (Core Ultra 3rd generation), made on 18A, went on broad sale in January 2026 (per Intel's October 2025 statement; this essay did not open Intel's original press release and cites it from press reports). {#e2}
- The 48 V busbar (46 to 52 V) of the OCP Open Rack V3 is a public specification. {#e3}

::: diagram dg-bspd keys=dg.bspd
cap: Cross-sections of front-side and backside power delivery (PowerVia, Super Power Rail). With front-side power, the current must pass through more than a dozen thin metal layers from the top to reach the transistors; with backside power, the power layers are at the back and the signal layers at the front, each on its own side, and the bumps move to the back as well. Schematic, not to scale.
aria: Diagram: on the left, conventional front-side power delivery, with power and signal lines squeezed into the same metal stack above the transistors; on the right, backside power delivery, with power lines reaching the transistors from the back of the wafer
front: Front-side power
back: Backside power (PowerVia)
bumps: Bumps (power and signal)
mix: Metal: signal + power
sig: Metal: signal only
tr: Transistors
pwr: Backside metal: power only
pbumps: Bumps (power and signal)
carrier: Carrier wafer
drop: Thin layers: big drop
short: Short, thick power path
:::

### Already demonstrated or happened {#h.demo .sub3}

- Intel press release of June 5, 2023: the test chip Blue Sky Creek used PowerVia, with cell density above {pvUtil}% and a frequency improvement above {pvFreq}%. At the time, PowerVia was said to go into production with 20A in 2024, but 20A was later canceled. {#d1}
- eeNews Europe, March 10, 2025: Infineon launched the TDM2454xx, a four-phase module for vertical power delivery to AI accelerators, delivering {ifAmm} A per square millimeter and a maximum of {ifAmp} A. {#d2}

### What a party with a stake has said {#h.claim .sub3}

- TSMC announced the A16 process in April 2024, with backside power delivery called “Super Power Rail”. It says A16 is {a16lo}% to {a16hi}% faster than N2P, and plans volume production in the second half of 2026 (reported by The Register on April 25, 2024). As of the writing of this essay, no independent confirmation of volume production had been found. {#c1}
- NVIDIA's blog of May 20, 2025 says 800 V DC can carry {nv85}% more power through the same gauge of wire, and that end-to-end efficiency can be up to {nv5}% higher than the current 54 V system. It plans full adoption in {nvYear} with its Kyber rack. This is the vendor's plan, and progress will be seen later. {#c2}

What to watch: once backside power delivery is in volume production across more processes, how much the chip's voltage sag and frequency actually improve; whether vertical power modules can withstand the heat of chips above one kilowatt; and, once 800 V DC enters racks, whether safety standards and the power supply ecosystem can keep up.

These facts will go out of date; the sources and access dates are in BRIEF.md in this directory. This essay does not judge which company's approach is better. {.take}

## Three questions when a computer slows down {#ch12}

::: strings
toc: Three questions when a computer slows down
:::

Electricity from the socket to the die passes through a limit at each stage: the power supply, the voltage regulator module, capacitors, contacts, thermal resistance and the power wall. When a computer cannot run at full speed, first find which stage hits its limit first. {.law}

{.plain .qs}
1. **The power wall, or the temperature wall?** In the monitoring software, look at package power and junction temperature. If power sits flat at a round number (125 W, 253 W) and the temperature is not high, it is the power wall (chapter 9): a better heatsink will not help, and what needs to change are PL1 and PL2 in the motherboard. If the temperature is pinned at Tj max while power is falling, it is the temperature wall, and the heatsink, the thermal paste and the case airflow are what matter. {#q1}
2. **Is the voltage set too high?** Power rises with the square of the voltage (chapter 2). For stability, many motherboards default to a higher voltage and a smaller load line. An appropriate undervolt keeps the frequency the same and lowers the voltage by 5%, which cuts dynamic power by about {uv}, and the temperature falls with it. Undervolt too far, though, and the initial sink when the load jumps (chapter 5) can crash the program. {#q2}
3. **Are the power supply and the voltage regulator module big enough?** Choose a power supply by the maximum power of the CPU and graphics card plus some headroom, but not much more (chapter 3). If the motherboard's voltage regulator module is too weak, it overheats and limits current, which shows up as the frequency jumping up and down at full load (chapter 4). A laptop that draws high power at idle is most likely a device keeping the chip from sleeping deeply (chapter 8). {#q3}

Back to the question at the start. About one volt, because *power goes with the square of the voltage*, and a transistor, however fast, needs only about one volt. Two hundred amps, because power equals voltage times current. So the electricity is first turned into 12 V in the *power supply*, goes through short thick wires to the *voltage regulator module*, where a dozen or so phases take turns stepping it down to one volt. When the load jumps, the *load line* and layers of *decoupling capacitors* hold up the voltage, and hundreds of contacts and thousands of bumps spread the current into the die. The chip itself scales its frequency and voltage with *P-states* and sleeps with *C-states*; whether it slows down in the end is decided by the power wall set by *PL1 and PL2* and by the *thermal resistance* of the heatsink. {#sum .sum tag=div}

Related essays: <a href='../how-a-computer-boots/#ch1'>“How a Computer Boots”</a> (how the voltages come up in order), <a href='../../../physics/circuits/power-converters/'>“Buck & Boost · Follow the Energy”</a> (the buck converter itself), <a href='../how-thunderbolt-works/#ch7'>“How Thunderbolt Works”</a> (power negotiation over USB-C), <a href='../how-a-gpu-computes/'>“How a GPU Computes”</a>, and <a href='../why-compute-waits-for-memory/'>“Why Compute Waits for Memory”</a> (the energy cost of moving data). Still being written: “Why Faster Chips Keep Getting Harder” (transistors, leakage and backside power delivery), and “Where the Power Comes From the Instant You Flip the Switch” (the grid). {#links style="margin-top:2em"}

::: footer wrap=none
How Power Reaches the CPU · a long essay you can play with. Rules and data: Intel's ATX Version 3 Multi-Rail Desktop Platform Power Supply Design Guide, revision 2.1a (November 2023); CLEAResult 80 PLUS certification tables; Intel Core i9-14900K product specifications, and Intel's Core 3rd-generation datasheet, “Package Power Control”; Linux kernel documentation for schedutil and cpuidle, and drivers/idle/intel_idle.c; Texas Instruments SLVA882B, “Multiphase Buck Design From Start to Finish”; Burton et al., FIVR, APEC 2014; Smith et al., IEEE Trans. Advanced Packaging, 1999 (target impedance); NVIDIA DGX B200 user manual. Frontier: announcements and blogs from Intel, TSMC, NVIDIA, Google and Infineon, with dates in the text. The chip, regulator, power delivery network and thermal path parameters in the models are illustrative.
:::
