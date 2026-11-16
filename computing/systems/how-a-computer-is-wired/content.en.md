---
lang: en
title: How the Parts of a Computer Are Wired Together · a long essay you can play with
desc: Which path do the CPU, memory, graphics card, drives and USB ports each take? Why were early computers built around one bus everyone shared, and why is today's machine a web of point-to-point links? Eight models you can drag and eight structure diagrams: the PCI bus's time budget, reflected waves and loading, the northbridge as a meeting point, near and far memory in a two-socket server, the chipset uplink, rings and meshes on a die, energy between chiplets, and I²C pull-up resistors.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.us: {v} µs
u.ns: {v} ns
u.MHz: {v} MHz
u.pF: {v} pF
u.MBps: {v} MB/s
u.GBps: {v} GB/s
u.TBps: {v} TB/s
u.W: {v} W
u.mW: {v} mW
u.mm: {v} mm
u.pj: {v} pJ/bit
u.ohm: {v} Ω
u.kohm: {v} kΩ
u.x: ×{v}
u.none: —
:::

# How the Parts of a Computer Are Wired Together {#hero}

::: strings
kicker: Computing · Systems · a long essay you can play with
:::

Which path do the CPU, memory, graphics card, drives and USB ports each take?<br>Why were early computers built around one bus everyone shared, and why is today’s machine a web of point-to-point links? {.sub}

This essay follows thirty years of change: a set of wires taken in turn (PCI), why that set could not run faster, the years when all traffic met in the northbridge, the “near and far” memory that appeared once the memory controller moved into the CPU, the difference between a CPU link and a chipset link on today’s motherboard, the rings and meshes inside a chip, the several chiplets in one package, and finally I²C, the bus that still shares two wires today. Each chapter starts with a structure diagram, then gives a model you can drag. {.lead}

**A note first:** this essay was written by AI (Claude). Each model is a scaled-down version of something real: the PCI spec’s own time budget, reflections on a transmission line, max-min fair sharing of link bandwidth, Little’s law, hop counts on an on-chip network, and the pull-up resistor formula from the I²C spec. The text says which numbers the models compute and which come from datasheets or papers. Tuned parameters are marked beside their model, with an account of how the conclusion changes if they are halved or doubled. {.note}

## One set of wires everyone shares {#ch1}

::: strings
toc: One set of wires everyone shares
:::

A bus is a set of wires that every device hangs off: only one can talk at a time, so bandwidth is split among everyone. The more devices, the less each gets, and the longer each waits. {.law}

Picture an office with one telephone. While few people need it, anyone can call whenever they like. When many do, they queue, and someone has to decide who is next. The **PCI bus**, fixed in 1992, is that telephone: a set of wires runs across the motherboard, and the graphics card, network card and disk controller all hang off it in parallel. The spec gives 32 bits wide at 33 MHz, a peak of **{pciPeak} MB/s** (33 MHz × 4 bytes; the 133 MB/s you often see quoted counts the clock as 33.33 MHz). The older ISA bus was shared too, only slower.

Sharing has three consequences. First, **addresses and data use the same wires**: PCI sends an address on AD[31:0] in one clock and data on the clocks that follow, a scheme called **multiplexing**. Second, there must be an **arbiter**: each device that wants to talk pulls its own REQ# line, and the arbiter answers on GNT# to say “your turn”. Third, every transfer carries a fixed overhead: the address goes out, the target has to get ready (the spec’s example takes {initLat} clocks for the “target initial latency”), and only then do four bytes a clock start to flow.

::: diagram dg1 keys=dg1
cap: Shared bus and point-to-point. Schematic, not to scale.
aria: Structure diagram: on the left, every device hangs off one shared set of wires; on the right, each device has a wire of its own
a.title: Shared bus (PCI, 1992)
b.title: Point-to-point (today’s approach)
host: Host bridge (CPU side)
root: Root (CPU side)
bus: Shared wires
d1: Graphics card
d2: Network card
d3: Disk
d4: Sound card
a.note: Arbiter decides who uses it now · {pciPeak} MB/s shared
b.note: Each device has its own wire, no sharing
:::

The PCI spec works this out itself. Its Table 3-5 lists a typical machine: graphics card 50 MB/s, network card 4, disk 5, ISA bridge 4, and 9 reserved for PCI bridges behind it, {t35need} MB/s in all. Assuming each transfer costs {initLat} clocks of overhead, and counting how many transfers each device makes and how many clocks each one takes, the spec finds how long the bus is busy in every {sliceUs} µs: **{t35used} µs**. The model below uses the same rule, and it recomputes the table row by row.

::: lab ch1-model
model.title: One PCI bus over 10 µs
model.how: Drag the number of devices, the bandwidth each one wants, and the length of each transfer (in data phases). The top bar shows how the shared bus spends 10 µs: red is the fixed overhead of each transfer, and anything that does not fit is marked. Below it, one bar per device, as if each had a wire of its own.
model.aria: How one PCI bus spends 10 µs, and a comparison with each device on its own wire
leg.data: Data
leg.oh: Address and wait (fixed per transfer)
leg.idle: Idle
ctl.n: Devices
ctl.d: Bandwidth each one wants
ctl.burst: Data phases per transfer
read.eff: Left for data after overhead
read.each: Each device gets on the shared bus
read.p2p: Each device with its own wire
read.wait: Longest wait for its turn
u.phases: {v} phases
cv.shared: Shared bus: who uses the 10 µs
cv.p2p: Point-to-point: one wire each
cv.x: Time → 10 µs
cv.missed: {n} of {all} transfers do not fit in these 10 µs
cv.allin: All {n} transfers fit
say.one: With one device nobody competes with it: each transfer is {D} phases, and it gets *{each}*, which is all of the line’s rate after overhead.
say.fits: {n} devices each want {d}. The bus is busy for {u}, so everyone gets what they want. But before its turn comes, each one may wait as long as *{wait}*.
say.full: {n} devices each want {d}, which adds up to more than the {eff} left after overhead, so each gets only *{each}*. With each device on its own identical wire, each would get {p2p}, {tot} in all.
:::

The default is 6 devices at 30 MB/s each, with 16 phases per transfer. Overhead eats a third, so the bus can deliver only **{eff16} MB/s**, and each device gets **{s1each} MB/s**, less than half of what it wants. With a wire per device, each would get {s1p2p} MB/s, {s1tot} MB/s in all. Stretch each transfer to 64 phases and the overhead is spread thin: each device gets {s1bEach} MB/s, but the longest wait rises from {s1wait} µs to {s1bWait} µs. **Long transfers trade for bandwidth, short ones for response time**; a shared bus cannot give both at once. With one phase per transfer, the bus is left with only {eff1} MB/s.

This is the basic problem of the **shared bus**: total bandwidth is fixed, so the more devices attached, the less each one gets. Everything that came after was an attempt to give each device its own wire, a **point-to-point link**. The price is more wires, and they need a hub that can take many of them at once (below, it is called the root, the northbridge or the chipset).

**What the model leaves out:** it assumes fair round-robin arbitration with a fixed overhead of {initLat} clocks, as in the spec’s Table 3-5 example. Real devices wait different amounts of time, and the arbiter can also give some devices priority. The “point-to-point” column is only an imagined comparison that gives each device the same wires; it is not a real interface. The real point-to-point interface is the subject of [[how-pcie-works#ch1|“Why PCIe Keeps Doubling”]]. {.take}

## Why parallel buses can’t go faster {#ch2}

::: strings
toc: Why parallel buses can’t go faster
:::

The more devices on a wire and the longer it runs, the longer a signal takes to make its round trip. At a fast clock, that trip no longer fits in one cycle. {.law}

Flick one end of a long rope and the wave runs along it, then bounces back from the loose end. Long traces on a circuit board behave the same way: a signal travels at a finite speed, and at an unloaded end it **reflects**. PCI puts this to use in what it calls **reflected-wave switching**: the driver pushes the voltage only halfway, the wave runs to the open end and reflects back, and the reflection adds to the first half to reach a full level. The spec itself says this propagation takes at most {tp33} ns, a third of one 33 MHz cycle.

Every device attached adds a small capacitance across the line. The spec allows at most {cin} pF per pin, card traces up to {stub} inches, and slots {slot} inches apart. More capacitance lowers the line’s **characteristic impedance** and slows the wave. This is the bind of a parallel bus: the more devices you attach, the slower the signal makes its round trips, and the faster the clock, the less time there is for them. (Skew between the wires is the other enemy of parallel buses. [[how-sata-works#ch2|Chapter 2 of “Why SATA Has Lasted Over Twenty Years”]] works through that bill, so it is not repeated here.)

::: diagram dg2 keys=dg2
cap: Reflected-wave switching: the driver pushes only halfway, the open end reflects the wave, and the sum reaches the full level. The voltage step heights come from this chapter’s default settings; the time axis is schematic.
aria: Structure diagram: a wire with several loads, and the voltage steps over time at the near and far ends
a.title: A wire with loads
drv: Driver
a.end: Open end: the wave reflects here
a.load: About {cload} pF per load, {slot} inches apart
a.spec: PCI spec: {tp33} ns left for the wire at 33 MHz
b.title: Voltage on the wire
b.vih: 50% threshold
b.near: Near end: first only {v1}
b.far: Far end: {v1x2} after reflection
b.x: Time → τ = one-way delay
:::

The PCI spec splits each clock cycle into four parts: driver output Tval, propagation along the wire Tprop, clock skew Tskew and receiver setup time Tsu. The four must fit inside the cycle. At 33 MHz the cycle is 30 ns, leaving the wire **{tp33} ns**. Parts at 66 MHz are faster, but the cycle is only 15 ns, leaving the wire just **{tp66} ns**. The model below sets this timing budget against a wire loaded with devices.

::: lab ch2-model
model.title: How fast a bus can run with this many devices
model.how: Choose a part grade, then drag the clock, the number of loads and the capacitance of each load. The red line is the time the spec leaves for propagation along the wire; the gold dashed line is the round-trip time this wire needs. Where the two cross is the fastest clock the wire can run.
model.aria: Propagation time budget against clock speed, and the round-trip time a loaded wire needs
leg.budget: Time the spec leaves for the wire, Tprop
leg.need: Round-trip time this wire needs
ctl.comp: Part grade
comp.33: 33 MHz class
comp.66: 66 MHz class
ctl.f: Clock
ctl.n: Number of loads
ctl.c: Capacitance per load
read.budget: Time left for the wire
read.need: Round-trip time needed
read.max: Most loads at this clock
read.step: Level after one reflection (needs ≥ 50%)
cv.x: Clock (MHz) →
cv.y: ns
cv.fmax: Top speed about {f} MHz
say.ok: {n} loads at {f} MHz: one round trip takes {need}, and the spec leaves {T}, so it fits. This wire can run up to about *{fmax} MHz*, and at this clock it can carry at most {nmax} loads.
say.ok2: Each load’s capacitance is so large that one reflection only reaches {step}, short of 50%, so the wire needs {k} round trips. Even so, {need} still fits in {T}. Top speed about *{fmax} MHz*.
say.late: {n} loads at {f} MHz: one round trip takes {need}, but the spec leaves only {T}, so it *does not fit*. Either drop to about {fmax} MHz, or cut the loads to {nmax}.
say.late2: One reflection only reaches {step}, so the wire needs {k} round trips, {need} in all, more than the {T} left for it. It *does not fit*. The top speed is about {fmax} MHz, and at this clock at most {nmax} loads.
say.nobudget: At this clock, the part’s own Tval, Tsu and skew already use up the whole cycle, leaving the wire not one nanosecond: *no number of loads works*.
:::

By default each load counts as {cload} pF (the pin’s {cin} pF plus {stub} inches of card trace). Loading slows the wire to **{tps} ps per inch** and drops its impedance to about **{zl} Ω**. The weakest driver the spec allows acts like a {rs} Ω source resistance: its first step is only {v1}, and after one reflection it reaches {v1x2}, just past the 50% threshold, so one round trip is enough. Counting propagation alone, 33 MHz can take at most **{n33}** loads and 66 MHz only **{n66}**: double the clock and the devices you can attach halve. Raise each load to 20 pF and one reflection reaches only {v1b}, so an extra round trip is needed, and at 33 MHz only {n33b} loads fit.

Later, PCI-X pushed the clock higher, at the cost of fewer slots per bus segment, until a segment held only one slot. At that point “shared” exists in name only. If each segment carries just one device, why not give each device its own serial point-to-point link, with the clock embedded in the data and no shared wire to reflect in? That path is PCIe. For how it doubles from one generation to the next, see [[how-pcie-works#ch2|“Why PCIe Keeps Doubling”]].

**What the model leaves out:** it counts only propagation and reflection, not edge rise time, ringing or the parasitics of each connector, so its numbers are upper bounds. The model says 33 MHz can take {n33} loads, but the spec’s driver V/I curves were targeted at 6 loads on the system board plus 2 add-in card connectors, or 2 loads plus 4 connectors. The line speed of {tpd} ps per inch and the impedance of {z0} Ω are my settings: the spec sets 150–190 ps per inch and 60–100 Ω only for traces on add-in cards and gives no impedance for the system board, so I took the middle of the speed range and the bottom of the impedance range (the end most favourable to the bus). At 190 ps per inch the 33 MHz limit is {n33t190} loads; at 100 Ω it is {n33z100}. The driver sits at one end of the wire. Placed in the middle, it pushes both ways at once, and its first step is smaller. {.take}

## Northbridge and southbridge {#ch3}

::: strings
toc: Northbridge and southbridge
:::

In the northbridge era, data from the CPU, graphics card, disk and network card all ended up at one memory controller in the northbridge. The wires had become point-to-point, but the meeting point was still shared. {.law}

Once the shared bus could no longer keep up, motherboards made a compromise: take the fastest devices off the shared bus and give each its own wire to one chip. That chip, drawn at the top of motherboard diagrams, is the **northbridge** (Intel called it the MCH, memory controller hub). Slower interfaces went to a second chip, drawn lower down: the **southbridge** (ICH, I/O controller hub).

Take Intel’s 875P, from its 2004 datasheet, as an example. The CPU connects to the northbridge over a 64-bit **front-side bus**, peaking at {fsbG} GB/s. The northbridge drives two DDR400 memory channels, {memG} GB/s together. The graphics card uses a dedicated AGP 8X slot at {agpG} GB/s, and a gigabit network port uses a dedicated CSA link at {csaM} MB/s. The southbridge hangs below the northbridge on a **{hiM} MB/s** Hub Interface. It handles two SATA ports, IDE, {usbPorts} USB 2.0 ports, PCI slots and the flash chip that stores the BIOS.

::: diagram dg3 keys=dg3
cap: Intel 875P chipset (datasheet 252525-002, February 2004, Figure 1). Link bandwidths are the datasheet peaks; positions are schematic.
aria: Structure diagram of the Intel 875P platform. The CPU connects over the front-side bus to the northbridge, which connects to two memory channels, the AGP graphics card, a gigabit network port and the southbridge. The southbridge leads to SATA, USB, PCI and BIOS flash
cpu: Pentium 4 processor
fsb: Front-side bus {fsbG} GB/s
memA: Memory A
memB: Memory B
mch: Northbridge MCH
mch.sub: Memory controller
mem: Two DDR400 channels, {memG} GB/s total
gpu: AGP graphics card
gbe: Gigabit network card
agp: AGP 8X {agpG} GB/s
csa: CSA {csaM} MB/s
hi: Hub Interface {hiM} MB/s
ich: Southbridge ICH5
ich.sub: Slower interfaces
sata: SATA ×2
usb: USB 2.0 ×{usbPorts}
pci: PCI slots
bios: BIOS flash
:::

The most important part of this diagram is the northbridge: anyone who reads or writes memory has to go through its memory controller. The model below hands each traffic source’s demand to these links, and shares bandwidth by **max-min fairness**. Each link splits its capacity as evenly as it can among the flows crossing it, and whatever a flow does not need is passed on to the others.

::: lab ch3-model
model.title: How memory bandwidth is shared on a 2004 PC
model.how: Drag the memory bandwidth that the CPU, the graphics card and the southbridge devices each want, and tick the network card if it is receiving. Each row shows how busy one link is: grey is what is wanted, colour is what is actually delivered.
model.aria: Load on each link of the 875P platform: front-side bus, memory, AGP, Hub Interface and CSA
ctl.cpu: CPU wants
ctl.gpu: Graphics card wants
ctl.sb: Southbridge devices want
ctl.gbe: Gigabit network card receiving
read.cpu: CPU actually gets
read.gpu: Graphics card actually gets
read.sb: Southbridge devices actually get
read.mem: Memory controller busy at
bar.fsb: Front-side bus
bar.mem: Memory (northbridge)
bar.agp: AGP
bar.hi: Hub Interface
bar.csa: CSA network port
bar.fmt: {u} / {cap}
say.full: The CPU wants {want} and gets *{cpu}*. The memory controller delivers {mem} in all, and it is not yet full.
say.short: The CPU wants {want} but gets only *{cpu}*. The front-side bus is wide enough; what is full is the memory controller in the northbridge, with {cap} to share among everyone.
say.nocpu: The CPU is not reading memory right now, so the memory controller carries only device traffic, {mem} in all.
:::

By default the CPU wants all {fsbG} GB/s, the graphics card wants {agpG}, and the southbridge and network card want a little more. The CPU actually gets only **{nbCpu} GB/s**; alone it could take {nbCpuAlone}. The front-side bus is not full. The memory controller in the northbridge is. The southbridge side is narrower still: two SATA ports at up to 150 MB/s each (the interface limit; the hard disks of the day could not reach it) add up to {sata2} MB/s, already more than the southbridge’s {hiM} MB/s uplink, so in the model the southbridge devices get at most {nbSb} MB/s, however much they ask for.

Most northbridge-era links were already point-to-point (AGP, Hub Interface and CSA are all one-to-one), but all the traffic still has to squeeze into one meeting point. The pattern did not disappear; the meeting point kept moving. In the next chapter it moved into the CPU, and in chapter 5 it became the chipset’s uplink.

**What the model leaves out:** link capacities are the datasheet peaks. Real usable bandwidth is lower, since DDR bank switching and front-side bus turnaround both take time, and the front-side bus is itself a shared set of parallel wires. The model shares bandwidth only and ignores latency: every CPU memory access must cross the front-side bus and then the northbridge, a journey the next chapter takes apart. Here, the AGP link and the CSA port carry only traffic flowing to memory. {.take}

## Moving the memory controller into the CPU {#ch4}

::: strings
toc: Moving the memory controller into the CPU
:::

Once the memory controller moved into the CPU, each CPU had its own memory. Put several CPUs in one machine and memory acquires near and far parts, so a program’s speed depends on where its data sits. {.law}

The northbridge’s problem was that every CPU memory read took a detour: out of the CPU, across the front-side bus, into the northbridge, then on to the memory. In the 2000s, AMD and Intel in turn moved the **memory controller onto the CPU**. CPUs began to talk to each other, and to other chips, over point-to-point serial links: AMD’s HyperTransport and later Infinity Fabric, Intel’s QPI and later UPI. The rest of the northbridge gradually moved into the CPU too.

A server often has two CPUs, each in its own socket with its own memory, joined by a socket-to-socket link. If CPU 0 wants memory attached to CPU 1, it must ask CPU 1 to fetch it. A layout where all memory can be reached, but at different distances, is called **NUMA** (non-uniform memory access). AMD’s first-generation EPYC, in 2017, went further: one socket held four dies, each with two memory channels. The figures AMD gave at ISSCC 2018 were about **{zLoc} ns** to read memory on the same die, about **{zp} ns** to read a different die in the same socket, and about **{zr} ns** to read the other socket.

::: diagram dg4 keys=dg4
cap: Two AMD EPYC 7001 processors: four dies per socket, each die with two memory channels. Latencies come from AMD’s ISSCC 2018 presentation; the layout is schematic.
aria: Structure diagram: two CPUs, each in its own socket with four dies. Dies inside a socket are linked, the two sockets share one link, and each socket has its own memory
link: Socket-to-socket link
s0: Socket 0
s1: Socket 1
die: Die
mem: Memory (2 channels per die)
lat1: Local die {zLoc} ns · same-socket die {zp} ns
lat2: Other socket {zr} ns
:::

How slow the average is depends on where the data sits: how much is local, how much is on another die in the same socket, and how much is across sockets. High latency also cuts bandwidth. A core can have only so many memory requests in flight at once, and under [[why-compute-waits-for-memory#ch4|Little’s law]], bandwidth = requests in flight × 64 bytes ÷ latency.

::: lab ch4-model
model.title: Where the data sits decides how long a memory read takes
model.how: Drag the share of accesses that land on another die in the same socket and on the other socket; the rest land on the local die. Or use the three buttons below. The number of requests in flight is my own setting: drag it to see how bandwidth follows.
model.aria: Latency and share of local, same-socket and cross-socket memory accesses, and the average latency
btn.local: All local
btn.il: Spread evenly over both sockets
btn.far: All on the other socket
ctl.pkg: On another die in the same socket
ctl.remote: On the other socket
ctl.mlp: Requests in flight per core (my setting)
read.lat: Average latency
read.x: times the all-local figure
read.bw: Bandwidth per core (Little’s law)
read.local: On the local die
bar.local: Local die
bar.pkg: Other die, same socket
bar.remote: Other socket
bar.avg: Average
bar.fmt: {lat} · share {s}
say.local: All the data sits in memory on the local die: each access takes *{lat}*, and each core can pull {bw}.
say.mix: {local} of accesses land on the local die, so the average is *{lat}*, {x} times the all-local figure. With {m} requests in flight per core, a core can pull only {bw}.
say.far: {remote} of accesses cross sockets. The average is *{lat}*, {x} times the all-local figure, and per-core bandwidth drops to {bw}.
:::

The default assumes memory is interleaved evenly over the eight dies in the two sockets (as when NUMA is switched off in the BIOS; Linux normally allocates from the local node first). Only one-eighth lands on the local die, {ilPkg} on another die in the same socket and {ilRemote} on the other socket. The average latency is **{ilLat} ns**, **{ilX} times** the all-local figure, and with 10 requests in flight per core, bandwidth falls from {bwLocal} GB/s to {bwIl} GB/s. That is why databases and virtual machines try to pin each thread to the node that holds its memory. Linux’s numactl and first-touch allocation both exist for this.

Today’s two-socket servers keep the same structure, only with bigger numbers. Intel’s 2025 Xeon 6767P gives each socket {xch} channels of DDR5-6400, a peak of {sockBW} GB/s per socket. Two sockets are joined by {upiLinks} UPI links at {upiGT} GT/s each. However fast the socket-to-socket link, it cannot match a local memory controller, so NUMA distance remains. For what happens when many cores fight over the same memory channels, see [[why-compute-waits-for-memory#ch5|chapter 5 of “Why Compute Waits for Memory”]].

**What the model leaves out:** the three latencies are AMD’s idle figures (2.4 GHz cores, DDR4-2667). Under load the cross-socket path queues first, and the gap grows. Cross-socket access also needs a cache-coherence check, which is not modelled separately. The 10 requests in flight per core are my own choice. Bandwidth is proportional to them, so halving them halves the bandwidth: in the all-local case, half of {bwLocal} GB/s. Today’s CPUs have different numbers, but the same structure. {.take}

## Today’s motherboard {#ch5}

::: strings
toc: Today’s motherboard
:::

On today’s motherboard, the graphics card and the fastest SSDs connect directly to the CPU. The other devices hang off the chipset, which shares one uplink to the CPU. {.law}

With the northbridge now fully inside the CPU, the chip that remains on the board is the old southbridge, now called the **chipset** (Intel calls it the PCH). Take Intel’s Core Ultra 200S and Z890 chipset from late 2024 (figures from Intel’s product pages and chipset brief). The CPU itself provides {cpuGen5} PCIe 5.0 lanes, which can be split into one ×16 plus one ×4 (or two ×8 plus one ×4, or one ×8 plus three ×4), another 4 PCIe 4.0 lanes, and two DDR5 memory channels. Between the CPU and the chipset runs one **DMI 4.0 ×{dmiLanes}** link.

Below the chipset, up to {pchLanes} PCIe 4.0 lanes branch out, along with up to {sataPorts} SATA ports, more than ten USB ports, networking, Wi-Fi and a small interface called eSPI (which connects to the BIOS flash and the board’s management chip). These ports do not each have their own wires. The chipset has only {hsio} high-speed lanes in all, shared among PCIe, USB 3 and SATA, so using one takes away from another. That is why motherboard manuals often say that once a certain M.2 drive is installed, two particular SATA ports stop working.

::: diagram dg5 keys=dg5
cap: Intel Core Ultra 200S with Z890 (Intel product pages and 800-series chipset brief, consulted November 2026). Which slot connects where is decided by the motherboard maker; positions are schematic.
aria: Structure diagram of a 2024 desktop. The CPU connects directly to memory, the graphics slot and two M.2 slots, and to the Z890 chipset over DMI 4.0 ×8. The chipset leads to M.2, USB, SATA, network, Wi-Fi and eSPI
mem: DDR5 ×2 channels
cpu: CPU
cpu.sub: Core Ultra 200S
gpu: Graphics slot
gpu.sub: PCIe 5.0 ×16
m2a: M.2 SSD
m2a.sub: PCIe 5.0 ×4
m2b: M.2 SSD
m2b.sub: PCIe 4.0 ×4
dmi: DMI 4.0 ×{dmiLanes}
dmi.bw: {dmi} GB/s each way
pch: Chipset Z890
pch.sub: {pchLanes} PCIe 4.0 lanes
c1: M.2 SSD
c1.sub: PCIe 4.0 ×4
c2: USB ports
c2.sub: Up to 20Gbps
c3: SATA
c3.sub: Up to {sataPorts}
c4: Network
c4.sub: PCIe ×1
c5: Wi-Fi
c5.sub: Built in
c6: eSPI
c6.sub: BIOS flash
hsio: The chipset’s {hsio} high-speed lanes are shared by PCIe, USB 3 and SATA
:::

However many devices sit under the chipset, anything that deals with the CPU and memory goes over that one uplink. DMI 4.0 runs 16 GT/s per lane with PCIe 4.0 encoding, so ×{dmiLanes} gives about **{dmi} GB/s** in each direction. It is full duplex: data read from devices toward memory and data written to devices travel on separate paths. On the AMD side, the Ryzen 9000 has {amdTotal} PCIe lanes in all, {amdUsable} of them usable, and the other 4 go to the chipset. At PCIe 4.0 ×4, that is about **{amdLink} GB/s** in each direction. This is the sharing from chapter 1, only moved from one set of wires to one uplink.

::: lab ch5-model
model.title: Devices under the chipset, all busy at once
model.how: Choose a platform, then have the two M.2 SSDs under the chipset read or write. Tick the USB portable drive and the two SATA SSDs, and tick an SSD on the CPU for comparison. The top two rows are the uplink and downlink. Below them, one row per device: grey is what it wants, colour is what it actually gets.
model.aria: Load on the chipset’s uplink and downlink, and what each device wants and actually gets
leg.rate: Actually gets
leg.want: Wants
ctl.plat: Platform
plat.intel: Intel Z890 (DMI 4.0 ×8)
plat.amd: AMD AM5 (×4 link)
ctl.ssd1: Chipset M.2 SSD 1
op.idle: Idle
op.read: Read
ctl.ssd2: Chipset M.2 SSD 2
op.write: Write
ctl.usb: USB 20Gbps portable drive reading
ctl.sata: Two SATA SSDs reading
ctl.cpu: CPU-attached M.2 SSD reading
read.up: Uplink load
read.dn: Downlink load
read.over: Wanted ÷ link capacity
read.slow: Worst-off device gets
bar.up: Uplink (to memory)
bar.dn: Downlink (to devices)
bar.fmt: {v} / {cap}
dev.ssd1: M.2 SSD 1
dev.ssd2: M.2 SSD 2
dev.usb: USB portable drive
dev.sataA: SATA SSD A
dev.sataB: SATA SSD B
dev.cpuSsd: CPU-attached M.2
dev.none: No device is busy
say.idle: Every device under the chipset is idle, so the uplink carries no load.
say.cpuonly: Only the SSD attached to the CPU is reading. It uses the CPU’s own lanes and *takes nothing from the chipset uplink*.
say.fits: Uplink {up}, downlink {dn}, both under {U}: every device gets what it wants.
say.duplex: Uplink {up}, downlink {dn}: reading and writing at once, each direction on its own lanes, *both fit*. On a full-duplex link, a disk-to-disk copy does not compete with itself.
say.over: Devices under the chipset want {over} times the link’s capacity, and {U} has to be shared. The worst-off device gets only *{slow}* of what it wants.
:::

The default has two chipset-attached SSDs reading at once (each wants {nvme} GB/s, the sequential read figure on a PCIe 4.0 SSD datasheet), plus a USB portable drive ({usb20} GB/s). Together they want {bdWant} GB/s upstream, a little more than DMI’s {dmi} GB/s, so the USB drive gets what it asks for and each SSD gets **{bdSsd} GB/s**. Move to AMD’s ×4 link and the same mix leaves each SSD only **{bdaSsd} GB/s**. But if you copy from SSD 1 to SSD 2, reading and writing use the two directions separately, and both platforms can run the full {copyI} GB/s. The SSD attached to the CPU never touches this link.

So “is this M.2 slot wired to the CPU or to the chipset?” is worth asking; the motherboard manual’s block diagram shows it. A single drive on its own shows no difference. The difference appears only when several devices are busy at once. How much a ×16 slot gains over ×8 is a question about PCIe itself: see [[how-pcie-works#ch2|“Why PCIe Keeps Doubling”]].

**What the model leaves out:** links are counted at their peak rate in each direction, with protocol overhead ignored. SSDs are assumed to hold their datasheet sequential speeds, while real use is usually short bursts. Switching inside the chipset and the USB controller’s own limit are not modelled. The AMD link is counted as PCIe 4.0 ×4; that generation figure comes from review material, not from AMD’s product pages, which give only {amdTotal} / {amdUsable} lanes. On X870E boards two chipsets are actually chained, with the second routed through the first. The model does not draw that. {.take}

## Roads inside the chip {#ch6}

::: strings
toc: Roads inside the chip
:::

The dozens of cores inside one CPU also have to be connected. With few cores, a single ring is enough. With many, the average distance around the ring grows in step with the core count, so the design switches to a mesh. {.law}

At this level, the connections have moved from the motherboard into the chip. Each core, each shared cache slice, the memory controller and the I/O are all stops on an on-chip network. The simplest design is a **ring**: all the stops sit in a circle, and data passes from stop to stop in either direction. A ring is simple, since each stop links only to its two neighbours.

The drawback is that with more stops, the average number of stops a message must pass (its **hop count**) grows, and all the traffic bunches onto the same few segments of wire. In 2017, Intel replaced the ring with a **mesh** on its Skylake-SP server chips. Stops are laid out in rows and columns, each crossing has a router, and data finishes one direction before turning into the other (Intel’s mesh goes vertical first). Both ring and mesh are networks of point-to-point links, the opposite of the shared bus in chapter 1.

::: diagram dg6 keys=dg6
cap: Ring and mesh; C0, C1 … are cores. The farthest hop counts come from this chapter’s model; the layout is schematic.
aria: Structure diagram: on the left, 8 cores in a bidirectional ring; on the right, 16 cores in a 4×4 mesh
a.title: Ring: 8 stops
b.title: Mesh: 4×4
core: C{n}
a.note: Only neighbours are linked; farthest is {r8max} hops
b.note: Along rows and columns; farthest {m16max} hops
:::

Two quantities matter. One is the average number of hops between two stops, which sets latency. The other is how congested the busiest segment becomes when every stop sends to others evenly at once, which caps how fast each stop can send. This is the saturation throughput of network theory, and it is bounded by the **bisection bandwidth**: cut the network in half, and the more links the cut severs, the better. The model below lists every pair of stops and counts them directly.

::: lab ch6-model
model.title: Ring and mesh: the average number of hops
model.how: Choose the core count. The chart shows the average hop count of the two layouts against core count, and the dot marks the current count. The mesh is laid out in the rows and columns closest to a square.
model.aria: Average hop count of a bidirectional ring and a two-dimensional mesh against core count
leg.ring: Bidirectional ring
leg.mesh: 2D mesh
ctl.n: Cores
read.ring: Ring: average hops
read.mesh: Mesh: average hops
read.max: Farthest (ring / mesh)
read.th: Mesh per-stop throughput as a multiple of the ring’s
meshfmt: {v} ({a}×{b})
maxfmt: {r} / {m} hops
cv.x: Cores →
cv.y: Average hops
say.mesh: {n} stops: a ring averages {r} hops, while a {a}×{b} mesh needs only *{m}*. When every stop sends at once, each mesh stop can send {ratio} times as much as a ring stop.
say.tie: At {n} stops, the ring averages {r} hops and the {a}×{b} mesh {m}: *about the same*. With few cores, the ring is simpler.
:::

A ring of 8 stops averages {r8} hops. A 4×4 mesh of 16 stops averages {m16}, while a ring of 16 stops is already at {r16}. The gap widens at 64 stops: the ring averages **{r64}** hops with a farthest pair of {r64max}, and the 8×8 mesh averages **{m64}** hops with a farthest pair of {m64max}. Throughput differs even more. When everyone sends to random stops at once, each ring stop can use at most {thR64} of a link’s capacity, against {thM64} for the mesh: **{thRatio64} times** as much. The ring’s average hop count grows in step with the number of stops; the mesh’s grows only with its square root.

That is why server chips with many cores use meshes, while desktop chips with fewer cores often still use rings. At a few stops the two are close, and the ring is cheaper to wire. Beyond that, one die cannot hold so many cores, so it is split into several pieces. That is the next chapter.

**What the model leaves out:** this counts hops only, not nanoseconds. Each hop passes a router and a stretch of wire, and how many clocks that takes varies by chip. Not every stop on a real chip is a core (there are also cache slices, memory controllers and I/O), and their positions are not evenly spaced. A mesh has more routers and wires than a ring, so it takes more area and power. Throughput is computed for uniform random traffic, whereas real traffic often bunches up on the stops that lead to the memory controllers. {.take}

## Between chiplets {#ch7}

::: strings
toc: Between chiplets
:::

A single die cannot grow that big, so it is split into several pieces packaged together. The joins must be wired back up, and the shorter and denser the wires, the less energy each bit costs. {.law}

The larger a die, the likelier it is to hit a manufacturing defect, and the cost of good dies rises faster than their area. This sum is worked through in chapter 10 of “Why Faster Chips Keep Getting Harder”. So today’s large chips are often several small dies, called **chiplets**, in one package. The 2017 EPYC did this, with the four dies of the previous chapter, and later Ryzen parts split the CPU cores and the I/O onto different dies.

Once split, the pieces must be wired back together. Wires inside a die are thin and short, often only tens of micrometres between neighbouring circuits; leaving the die over the package substrate takes millimetres; reaching the motherboard takes centimetres. The longer the wire, the more capacitance each bit must charge and discharge, and the more energy it costs. AMD’s ISSCC 2018 report puts the on-package link at about **{ifopPj} pJ** per bit. In 2022, Intel, AMD, Arm, TSMC and others launched **UCIe**, an open standard for links between chiplets, in two grades: a standard package on an organic substrate (reach up to {reach2} mm), and a silicon bridge or silicon interposer for advanced packaging (reach up to {reach25} mm, with bump pitches down to tens of micrometres).

::: diagram dg7 keys=dg7
cap: Two ways of packaging chiplets. Energy and maximum distance come from UCIe’s key figures (UCIe Consortium report, 2025). Sizes are schematic.
aria: Structure diagram: on the left, two CPU chiplets and an I/O chiplet side by side on an organic substrate. On the right, two dies sit on a silicon bridge or interposer, with the substrate below
a.title: Standard package: organic substrate
a.sub: Organic substrate
ccd: CPU chiplet
iod: I/O chiplet
a.link: UCIe standard package: {pj2} pJ/bit
a.reach: Up to {reach2} mm
b.title: Advanced package: silicon bridge or interposer
b.sub: Substrate
b.bridge: Silicon bridge / interposer
die1: Compute chiplet
die2: HBM or another chiplet
b.link: UCIe advanced package: {pj25} pJ/bit
b.reach: Up to {reach25} mm, denser wiring
:::

A chiplet link is judged on two numbers: **energy per bit** (pJ/bit; multiply by bandwidth to get power), and **how much bandwidth fits along each millimetre of die edge** (GB/s/mm, called shoreline density). A die has only four edges, and once they are used up, no more wires can leave. The model below compares several kinds of link.

::: lab ch7-model
model.title: How much power it takes to move this much data between chiplets
model.how: Drag the bandwidth to move between two chiplets, and choose a link type. Each row shows the power that link needs at this bandwidth. The two UCIe grades also show how much die edge they need.
model.aria: Power of several chip-to-chip links at a given bandwidth
ctl.bw: Bandwidth between chiplets
ctl.kind: Link type
k.d3: UCIe 3D stacking (9 µm pitch)
k.d25: UCIe advanced package
k.d2: UCIe standard package
k.hbm3: HBM3 memory interface (measured)
k.ifop: EPYC 7001 on-package link
k.lp5: LPDDR5 memory interface (measured)
read.w: Power
read.edge: Die edge needed
read.pj: Energy per bit
say.edge: Moving {bw} with {k}: power *{w}*, needing at least {edge} of die edge.
say.noedge: Moving {bw} with {k}: power *{w}*. This kind of link has no comparable shoreline density figure.
:::

Moving 1 TB/s between two chiplets (a figure common between today’s large dies) takes about **{w25} W** over UCIe advanced packaging, using only {e25} mm of die edge. Over the standard package it takes about {w2} W and {e2} mm. The 2017 EPYC on-package link needs **{wIfop} W**. If you treat it as a memory interface, at LPDDR5’s measured energy, it needs {wLp5} W. A desktop CPU draws only one or two hundred watts in all, so how wide a chiplet link can be is often limited by the power bill and the die edge, not by speed.

That is also why high-bandwidth memory (HBM) sits beside the compute die on the same silicon interposer (see [[why-compute-waits-for-memory#ch9|chapter 9 of “Why Compute Waits for Memory”]]), and why the next step is stacking dies directly. 3D stacking has wires so short they barely count, and UCIe’s target there is {d3pj} pJ/bit or below.

**What the model leaves out:** these energy figures come from different sources and years. UCIe’s are the spec’s stated targets (taking the grade above 16 GT/s). HBM3 and LPDDR5 are measured values from a UCIe Consortium report, and the EPYC figure is AMD’s from 2018. They broadly cover only the physical layer, not the protocol and link logic at either end. Power assumes the link runs flat out at all times. UCIe’s round-trip latency is about {ucieRt} ns, which the model does not include. {.take}

## The small bus that is still shared {#ch8}

::: strings
toc: The small bus that is still shared
:::

Temperature sensors, the small chip on a memory module and the fan controller still share two wires today. They need so little bandwidth that saving wires matters most. What limits them is the capacitance on the line and the pull-up resistor. {.law}

The first seven chapters traced a path of ever finer division. But one kind of connection on the motherboard has barely changed in forty years: **I²C**. Philips (now NXP) introduced it in {i2cFirst}. It has just two wires, a data line, SDA, and a clock line, SCL. One pair of wires can carry dozens of devices, each with a 7-bit address. The small chip on a memory module that records its model, the temperature and voltage sensors on the board, and the chip that tells the computer a monitor’s resolution all use I²C or its close relative, SMBus.

I²C is a shared bus, but it decides who talks in a different way from PCI. Every device has an **open-drain** output, so it can only pull the line low, never drive it high. The line is normally held up to the supply by a **pull-up resistor**. Whoever pulls low makes the line low, and only when everyone lets go does the line rise slowly back to high. Two devices talking at once cannot short-circuit each other, which keeps arbitration very simple.

::: diagram dg8 keys=dg8
cap: I²C bus (after NXP UM10204, edition 7). Schematic, not to scale.
aria: Structure diagram of an I²C bus. Power feeds the SDA and SCL wires through two pull-up resistors, and the controller and two devices all connect to both wires
vdd: Supply VDD
rp: Pull-up Rp
sda: SDA data line
scl: SCL clock line
ctl: Controller
t1: Temperature sensor
t2: EEPROM
cb: Capacitance Cb
note1: Each device can only pull the line low
note2: When all let go, Rp pulls the line high
:::

The price is in “rise slowly”. The pull-up resistor Rp charges the line’s capacitance Cb, so the voltage climbs as V(t) = VDD(1 − e<sup>−t/RC</sup>). The spec defines rise time as the time from 30% to 70%, which works out to **{i2cK} × Rp × Cb**. It sets at most 1000 ns for standard mode (100 kHz), 300 ns for fast mode (400 kHz), and 120 ns for fast-mode plus (1 MHz). A resistor that is too large rises too slowly; one that is too small cannot be pulled down by the devices. The spec requires a device to sink at least 3 mA at 0.4 V, or 20 mA in the plus grade. The model below uses the two formulas from section 7.1 of the spec.

::: lab ch8-model
model.title: What size of pull-up resistor to choose
model.how: Choose the speed grade and supply voltage, then drag the line’s capacitance and the pull-up resistor (stepped through common E12 values). Gold is the line voltage after release. The shaded band is the 30% to 70% rise, and the red line is the latest moment the spec allows.
model.aria: Voltage rise on an I²C line charged through a pull-up resistor, and the rise time the spec allows
leg.v: Line voltage
leg.max: Rise time the spec allows
leg.th: 30% and 70% thresholds
ctl.mode: Speed grade
mode.sm: Standard 100 kHz
mode.fm: Fast 400 kHz
mode.fmp: Fast-mode plus 1 MHz
ctl.vdd: Supply
vdd.33: 3.3 V
vdd.5: 5 V
ctl.cb: Line capacitance Cb
ctl.rp: Pull-up resistor Rp
read.tr: Rise time
read.trmax: Spec allows
read.win: Usable range for Rp
read.dev: Equivalent number of pins (10 pF each)
winfmt: {lo} – {hi}
cv.x: ns →
cv.y: Voltage / VDD
say.ok: Rp = {rp}, Cb = {cb}: rise time *{tr}*, within the {max} allowed. Rp can be anywhere from {lo} to {hi}.
say.slow: Rise time *{tr}* exceeds the {max} allowed at this grade. The resistor is too large, or the line carries too much capacitance. With this much capacitance, Rp must not exceed {hi}.
say.weak: The rise is fast enough ({tr}), but Rp = {rp} is too small: at 0.4 V the devices cannot sink this much current. Rp must be at least {lo}.
say.nowin: With this much capacitance, Rp must be below {hi} to rise fast enough, but above {lo} for the devices to pull it down. *No single resistor satisfies both*. You have to slow the bus, use stronger drivers, or split the bus into segments with buffers.
say.cb: The line capacitance {cb} is already above the {cbmax} this grade allows. The spec does not permit it; the bus must be split with buffers.
:::

The default 4.7 kΩ is the most common pull-up on an I²C bus. With 200 pF on the line (roughly {i2cDev} pins’ worth of capacitance, at up to {i2cCi} pF per pin, plus the traces), the rise time is **{i2cTr} ns**. That meets the 1000 ns of standard mode easily, but misses the 300 ns of fast mode. To run at 400 kHz, Rp must lie between **{i2cLo} Ω and {i2cHi} Ω**. Raise the capacitance to 400 pF and the rise time doubles, to {i2cTr400} ns. So “use a smaller pull-up” is the most common fix when I²C does not work, and the more devices and the longer the wires, the narrower the range of choice.

Other small buses on the motherboard include **SPI**, which uses four push-pull lines and is much faster; the [[how-a-computer-boots#ch3|BIOS flash]] often hangs on SPI or a variant of it. **UART** is the serial port: two wires, one for each direction, and no clock line. **SMBus** is Intel’s version of I²C with added rules, used on PCs to read memory-module information and sensors. The eSPI port on the Z890 chipset has {espi} chip selects, connecting to the BIOS flash and the board’s management chip. Their addressing, clock stretching and baud-rate tolerances may get a separate essay in this series at some later point.

**What the model leaves out:** it treats the pull-up as an ideal resistor and the line as one lumped capacitance, exactly as in the spec’s section 7.1 algorithm. A real line has length, and each device’s input threshold differs. Supplies are limited to 3.3 V and 5 V; below 2 V the spec switches to a low level of 0.2 VDD with 2 mA, which is not implemented here. Fall time, glitch filtering and clock stretching are outside the model. {.take}

## The frontier (as of November 2026) {#ch9}

::: strings
toc: The frontier
:::

The frontier of connections has moved inside the package. How short, dense and energy-efficient the wires between chiplets can be is starting to decide how large a chip can be. {.law}

Below, three kinds of claim are kept apart: what is settled, what has been built, and what vendors or leaked reports say. Dates are given after each.

### Settled {#h.est .sub3}

- On the paths in a personal computer that need bandwidth, the shared parallel bus is gone. Graphics cards, SSDs and network cards each have a point-to-point link of their own. Sharing survives only at meeting points such as the chipset uplink, and in the small buses of chapter 8. {#e1}
- Chiplet packaging is now standard practice in mainstream products. From the first-generation EPYC in 2017, both server and desktop CPUs have shipped multi-die models. {#e2}
- The UCIe 3.0 specification was published on 5 August 2025. It adds two grades, {ucie3a} and {ucie3b} GT/s, above 32 GT/s, and stays backward compatible with 1.0 and 2.0 (UCIe Consortium press release). On 12 November 2026 the consortium released UCIe 4.0. Its focus is not speed: it standardises the link between compute dies and memory chiplets and adds more power-efficient link profiles (UCIe Consortium specification page and press release). The other UCIe figures on this page come from versions before 4.0. {#e3}

### Built {#h.demo .sub3}

- At Computex in June 2026, Intel announced that the Xeon 6+ (codename Clearwater Forest) was on the market: up to {x6pCores} efficiency cores, with the compute dies bonded directly on top of base dies by Foveros Direct hybrid bonding. This is 3D stacking entering high-volume server chips. For dates I have checked only the summaries in Intel’s press release and product page. Reports differ somewhat, with a public reveal at MWC in March and availability announced in June. {#d1}
- The CXL 4.0 specification was published on 18 November 2025. It runs at {cxl4GT} GT/s on the PCIe 7.0 physical layer (CXL Consortium press release). CXL carries memory and cache-coherence protocols over PCIe’s wires; see [[coherent-interconnects#ch3|“How Chips Share Memory”]]. PCIe 7.0 itself is covered in [[how-pcie-works#ch11|“Why PCIe Keeps Doubling”]]. {#d2}

### Claims and leaks {#h.claim .sub3}

- A parameter table for Intel’s 900-series chipsets, leaked in 2026 and matching the next-generation Nova Lake desktops, says the uplink will move to DMI 5.0: ×4 on high-end models and ×2 on low-end ones. This is a spreadsheet that circulated online, not a figure Intel has published, and reports disagree on the launch timing. {#c1}
- The UCIe Consortium’s target for 3D stacking is 0.01 to {d3pj} pJ per bit (bump pitch 1 to 9 µm). This is the spec’s target, not a value measured on any product. {#c2}

Looking further ahead, the problem is likely to be less “how fast can a wire run” and more “how many wires can the edge of a chip carry, and how much energy does each bit cost”: the two numbers from chapter 7. If the cost of 3D stacking comes down, links between chiplets will increasingly resemble the wires inside a chip, and the line between “one chip” and “one package” will blur. This sentence is my own speculation.

**Content that will date:** every item in this chapter carries a date. Sources and access dates are listed in the BRIEF.md for this page. {.take}

## Three questions for any machine {#ch10}

::: strings
toc: Three questions for any machine
:::

Next time you read a motherboard block diagram, a server spec or an introduction to a new chip, ask these three questions and you will know where its bottleneck may lie. {.law}

{.plain .qs}
1. **What is this device attached to?** Directly to the CPU, or to the chipset? Graphics cards and the fastest SSDs usually connect to the CPU; the rest share the chipset’s uplink (chapter 5). The motherboard manual’s block diagram shows it. {#q1}
2. **What path does it share with others?** How wide is that path, and is it full duplex? When several things are busy at once, add up what they want and compare the total with the path’s capacity (the same model as in chapters 1, 3 and 5). {#q2}
3. **How many boundaries does the data cross on its way to memory?** Between chiplets, between sockets, or a number of hops on the chip. Each one adds a stretch of latency and costs more energy (chapters 4, 6 and 7). {#q3}

Over thirty years, connections went from *one set of wires everyone shares* to *a point-to-point link for each device*, and then retreated into the chip and the package. Sharing did not disappear; it moved. It is now the memory controller in the northbridge, the chipset’s uplink, and the wire between sockets. To understand a machine is to find where these meeting points are. {#sum .sum tag=div}

Related essays: [[how-pcie-works|“Why PCIe Keeps Doubling”]] covers the point-to-point link itself; [[how-thunderbolt-works|“How Thunderbolt Works”]] covers the tunnels inside one USB-C cable; [[why-compute-waits-for-memory|“Why Compute Waits for Memory”]] covers the memory hierarchy and the bandwidth wall; [[why-nvme-is-fast|“Why NVMe Is So Fast”]] covers how SSDs use PCIe; [[how-sata-works|“Why SATA Has Lasted Over Twenty Years”]] covers serial replacing parallel; [[how-usb-drives-talk|“Why a USB Drive Never Hits Its Label”]] covers USB and the PCIe tunnels over Thunderbolt; [[what-a-drive-is-made-of#ch7|chapter 7 of “What a Drive Is Made Of”]] covers the layers of a drive interface. {#links style="margin-top:2em"}

::: footer
This essay was written by AI (Claude). Its models are scaled-down versions of real rules, not measurements. Main sources: PCI Local Bus Specification 3.0 (PCI-SIG, 2004), Table 3-5, Table 7-7 and chapter 4; Intel 875P chipset datasheet (252525-002, 2004); AMD “Zeppelin” ISSCC 2018 report; Intel product pages (Z890, Core Ultra 7 265F, Xeon 6767P) and the 800-series chipset brief; AMD Ryzen 9 9950X and AM5 chipset product pages; UCIe Consortium 2025 report and press releases; NXP UM10204, edition 7 (2021); Dally and Towles, “Principles and Practices of Interconnection Networks”; Bertsekas and Gallager, “Data Networks”, on max-min fair allocation. The full list, with access dates, is in the BRIEF.md in this page’s directory.
:::
