---
lang: en
title: How Thunderbolt Works · a long essay you can play with
desc: Why can one USB-C cable carry a monitor, a network adapter, a drive and charging at once, and chain one device after another? How do Thunderbolt and USB4 relate? Eight models you can drag: the CC divider, the 4-byte header with its check, how one link is shared among tunnels, the daisy chain, PAM3 and the 3+1 split, what a monitor needs, how PD negotiates 140 W, and the IOMMU's page-sized doors.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.us: {v} µs
u.ms: {v} ms
u.MBps: {v} MB/s
u.Gbps: {v} Gb/s
u.GHz: {v} GHz
u.B: {v} bytes
u.KiB: {v} KiB
u.V: {v} V
u.A: {v} A
u.W: {v} W
u.m: {v} m
u.none: —
dg1.aria: USB Type-C socket: layout of the 24 pins
dg1.rowA: Row A
dg1.rowB: Row B (facing row A)
dg1.hs: High-speed pairs
dg1.usb2: USB 2.0
dg1.cc: CC
dg1.sbu: SBU sideband
dg1.pwr: VBUS
dg1.gnd: Ground
dg2.aria: Three tunnels between two USB4 routers
dg2.src.dp: GPU DP output
dg2.src.usb: Host USB 3 controller
dg2.src.pcie: Host PCIe port
dg2.host: Host router
dg2.ad.dpin: DP IN adapter
dg2.ad.dpout: DP OUT adapter
dg2.ad.usb3: USB3 adapter
dg2.ad.pcie: PCIe adapter
dg2.transport: Transport: 4-byte header, HopID
dg2.transport2: Transport: routes, unpack
dg2.lanes: Lane adapter: encode, TX/RX
dg2.link: One USB-C cable: two lanes, three packet types
dg2.dev: Device router (in dock)
dg2.snk.dp: Monitor
dg2.snk.usb: USB 3 hub
dg2.snk.pcie: PCIe switch chip
dg3.aria: Fields of the USB4 transport-layer header
dg3.pdf: PDF
dg3.supp: S
dg3.rsvd: Reserved
dg3.hop: HopID
dg3.len: Length
dg3.hec: HEC
dg3.payload: Payload: 1–256 bytes
dg3.padding: Padding
dg3.note: HEC = CRC-8 (polynomial 07h, initial value 00h, XOR 55h), covering bits 31–8.
dg4.aria: Schematic of the topology inside a dock
dg4.host: Computer’s USB4 / Thunderbolt port
dg4.cable: One cable
dg4.dock: Dock
dg4.router: USB4 router
dg4.ad.pcie: PCIe adapter
dg4.ad.usb3: USB3 adapter
dg4.ad.dp: DP OUT adapter
dg4.ad.usb4: USB4 port (out)
dg4.pcieSw: PCIe switch chip
dg4.usbHub: USB 3 hub
dg4.dpPorts: DP / HDMI ports
dg4.down: To next device
dg4.nic: Network card, card reader
dg4.usbA: USB-A ports
dg4.usb2: USB 2.0 hub (uses the D+/D− pair in the cable, bypasses the router)
dg5.aria: Daisy chain and the load on each link
dg5.host: Computer
dg5.dock: Dock
dg5.driveA: Drive enclosure A
dg5.driveB: Drive enclosure B
dg5.mon: Monitor
dg5.depth: Layer {d}
dg5.l1: Link 1: dock + drive A + drive B + monitor
dg5.l2: Link 2: drive A + drive B + monitor
dg5.l3: Link 3: drive B + monitor
dg5.l4: Link 4: monitor
dg5.note: USB4 goes to layer 5; with Thunderbolt 3 compatibility, to layer 6.
dg6.aria: Lane directions in symmetric and asymmetric modes
dg6.sym: Symmetric: down {d}, up {u}
dg6.asym: Asymmetric: down {d}, up {u}
dg6.host: Host
dg6.dev: Device
dg6.down: Downstream (host → device)
dg6.up: Upstream (device → host)
dg7.aria: Allocation of the four high-speed pairs under DP Alt Mode and USB4
dg7.c: DP Alt Mode, pin assignment C: four DP lanes
dg7.d: DP Alt Mode, pin assignment D: two DP lanes + USB 3
dg7.u: USB4: two bidirectional lanes, DP inside a tunnel
dg7.dp: DP
dg7.usb3: USB 3
dg7.usb4: USB4
dg7.aux: DP AUX
dg7.sb: USB4 sideband
dg8.aria: PD message sequence for entering EPR
dg8.cable: Cable chip
dg8.src: Charger
dg8.snk: Computer
dg8.emark: Reply: 50 V / 5 A, EPR capable
dg8.spr: Standard range (SPR) agreed: up to 20 V
dg8.epr: Extended range (EPR): 28, 36 or 48 V
dg9.aria: Schematic of IOMMU page-level mapping
dg9.dev: External device (over PCIe tunnel)
dg9.req: DMA read/write
dg9.iommu: IOMMU: admits only mapped pages
dg9.page: Page {i}
dg9.mine: Device’s buffer
dg9.exposed: Other data on the same page
dg9.hidden: Unmapped
:::

# How Thunderbolt Works {#hero}

::: strings
kicker: Computing · Systems · a long essay you can play with
:::

Why can one USB-C cable carry a monitor, a network adapter, a drive and charging at once, and chain one device after another?<br>How do Thunderbolt and USB4 relate? {.sub}

The answer has three layers. At the bottom are a 24-pin socket and a CC wire that works out which way round the plug is. In the middle is a kind of “router” that cuts display signals, USB and PCIe into small packets with 4-byte headers and sends them in turn over the same pair of wires. At the top is a “Connection Manager” that decides how much bandwidth each tunnel gets and how many devices can be chained. Power takes a separate path: the VBUS pins of the socket, with the voltage agreed in a short exchange over the CC wire. **Each model is a rule, a table or a textbook result from the specification, scaled down to run in a web page**. {.lead}

An AI wrote this page. The numbers come from the USB Type-C 2.5 specification, USB4 2.0 and its Connection Manager Guide, USB PD 3.3, VESA’s public material and Intel’s Thunderbolt technology brief. **Where a value is marked “tuned parameter”, it was chosen so the model can be computed, not measured**; the text says how far the conclusion moves when that value is halved or doubled. This page covers mechanisms and specifications only, and **does not rate which cable or dock is worth buying**. {.note}

## 24 pins and one CC wire {#ch1}

::: strings
toc: 24 pins and one CC wire
:::

The USB-C socket has 24 pins in two mirror-image rows, so the plug goes in either way up. But the cable has only one CC wire: whichever CC pin shows a voltage divider tells you which way the plug is turned, and how much current the other end is willing to supply. {.law}

Table 3-4 in Chapter 3 of the Type-C specification lays out the socket’s 24 pins in two rows: A1 to A12, and B1 to B12. Four high-speed differential pairs (TX1, RX1, TX2, RX2) take two pins each, 8 in all. USB 2.0’s D+ and D− appear once in each row, 4 pins in all (the plug connects only one pair, and the circuit board often joins the two). Each row also has two VBUS pins, two ground pins, one CC pin and one SBU pin. The two rows are rotationally symmetric about the centre, so when the plug is turned over, the A-row pins land exactly on the B-row positions.

Plugging it in either way works because both ends watch CC. The supplying end (Source) puts a pull-up resistor Rp on CC, and the consuming end (Sink) puts a pull-down resistor Rd = 5.1 kΩ on it. The cable has only one CC wire, so only the CC pin that is actually connected forms a divider; the other one floats. The computer only has to see which pin carries a voltage to know whether to use TX1/RX1 or TX2/RX2, and then switch the high-speed signals to that set.

::: html ch1-html
dgPin.cap: The socket’s 24 pins (Type-C R2.5, Table 3-4). Row B is laid out backwards inside the socket, so B12 faces A1. Turn the plug 180°, and the contact that was on A1 lands on B1, and A2 lands on B2. So pins with the same number in the two rows have matching functions: TX1 to TX2, CC1 to CC2, VBUS and ground unchanged. Colours mark functional groups.
:::

The same divider carries a second message: the size of Rp is the Source’s promise. Table 4-27 gives three levels: 56 kΩ means “default USB current”, 22 kΩ means 1.5 A, and 10 kΩ means 3 A, all pulled up to 4.75–5.5 V. At nominal values the Sink reads {cc0} V, {cc15} V or {cc30} V on CC, and Table 4-36 gives the Sink three voltage windows to tell them apart. Push every resistor and pull-up tolerance to the same side, and the 3 A level falls between {cc30lo} V at the lowest and {cc30hi} V at the highest; that highest value sits exactly on the upper edge of its window. The default level lies between {cc0lo} and {cc0hi} V, and its upper edge also sits right on the window boundary. In other words, each window’s upper edge is the voltage of the worst combination of tolerances (rounded to the millivolt in the table). The lower edges leave a margin: the default window, for example, starts at 0.277 V, below even the worst combination.

::: lab ch1-model
model.title: Model 1 · the voltage divider on CC
model.how: Choose the Rp the Source has and the plug orientation. The three coloured bands at the top are the three voltage windows of Table 4-36; the red triangle is the voltage the Sink reads; the white line is the range the voltage can land in with the worst-case tolerance. Choose “all low” or “all high” to push the tolerance to one side.
model.aria: CC voltage against the three recognition windows
ctl.rp: Source Rp
rp.usb: 56 kΩ (default)
rp.a15: 22 kΩ (1.5 A)
rp.a30: 10 kΩ (3 A)
ctl.o: Plug orientation
o.n: Normal
o.f: Flipped
ctl.corner: Tolerance
k.nom: Nominal
k.lo: All low
k.hi: All high
ctl.emark: E-marked cable (has Ra)
read.cc1: Voltage on CC1
read.cc2: Voltage on CC2
read.amps: Current the Sink recognises
read.pairs: High-speed pairs in use
cv.usb: Default USB
cv.a15: 1.5 A
cv.a30: 3 A
cv.range: CC voltage
open: Floating
amps.usb: Default USB current
amps.a15: 1.5 A
amps.a30: 3 A
say.norm: The divider appears on <b>{pin}</b>, at {v}, inside the window for “{amps}”. The plug is the right way up, so the computer connects the high-speed signals to {tx}/{rx}. {vconn}
say.flip: The divider appears on <b>{pin}</b>, at {v}, inside the window for “{amps}”. The plug is flipped, so the computer switches the high-speed signals to {tx}/{rx} to match; the user does nothing. {vconn}
say.bad: {v} falls in a gap between windows, so the Sink cannot tell which level it is. The windows are drawn for the worst combination of tolerances, so real resistors never reach this. If you see it, the model’s parameters have gone outside Table 4-27.
say.vconn: The other pin, {other}, is pulled low by the Ra in the cable, and the Source supplies VCONN on it to power the cable chip.
say.novconn: The other CC pin floats: this cable has no e-marker, so the Source can only treat it as 3 A.
:::

If the cable is e-marked (5 A cables and all Thunderbolt cables are), it contains a small chip, which puts a 0.8–1.2 kΩ Ra on the CC pin at the far side of the plug. When the Source sees that pin pulled low by Ra, it supplies VCONN on that pin to power the cable chip, and then asks the chip, with PD messages, how much current and what speed it can carry (Chapter 7).

The model covers only the resistor pull-up. The specification also allows the Source to use current sources (80 µA / 180 µA / 330 µA) in place of Rp, with the same windows. The Dual-Role port switching between Rp and Rd, and state machines such as Try.SRC, are not modelled. The two D+/D− pairs of USB 2.0 are usually joined on the circuit board (the specification allows this, or a switch), so USB 2.0 does not need to know the orientation. {.take}

## Routers and tunnels {#ch2}

::: strings
toc: Routers and tunnels
:::

USB4 and Thunderbolt do not run three protocols on the wire at once. Each port has a “router”: display signals, USB 3 and PCIe each feed their own adapter, are cut into packets with a 4-byte header, and are forwarded one hop at a time by the HopID in that header. The wire carries only one thing: USB4 packets. {.law}

The USB4 specification calls this a “tunnel”. The host-side router has several protocol adapters. The DP IN adapter takes the DisplayPort main link sent from the graphics card; the USB3 adapter connects to the USB 3 controller in the host; and the PCIe adapter connects to a PCIe downstream port. Each puts its data into transport-layer packets and hands them to a Lane adapter, which sends them out on the wire. The router at the other end unpacks them, hands them to the DP OUT, USB3 or PCIe adapter, and rebuilds the original signal.

::: html ch2-html
dgRouter.cap: A USB4 link has a router at each end. Three protocols each feed an adapter, become the same kind of transport-layer packet, and take turns on the same lanes; at the other end they are unpacked again (schematic, after USB4 2.0 Chapters 2 and 5).
:::

Each packet header is only 4 bytes (Table 5-2). A 4-bit protocol-defined field (PDF) says which protocol the packet belongs to; a 7-bit HopID says which path it follows; an 8-bit Length gives the payload length; and the last 8 bits, the HEC, are a CRC-8 computed over the first 3 bytes. A HopID is only 7 bits, so its largest value is {hopMax}. Values 0 to 7 are kept for control packets and the link’s own uses, and tunnel paths are numbered from 8 (§5.2), so one port can carry at most {hopPaths} tunnel paths, depending also on the largest HopID the adapter supports. It is also not a fixed address for the whole route: at each router, the router looks up that port’s routing table to decide which port to send the packet out of, and swaps in the HopID for the next segment.

::: html ch2-html-2
dgHdr.cap: The 32 bits of the transport-layer header (USB4 2.0 Table 5-2), with bits 31–16 on the top row and 15–0 below. The payload is 1 to 256 bytes, padded to a multiple of 4.
:::

HEC uses the generator polynomial 07h, an initial value of 00h, and a final XOR with 55h. Appendix A of the specification gives three worked examples, and the code here reproduces all three (the tests pin them down). This CRC gives a different syndrome for every single-bit flip in the 32 bits, so a router can not only spot a header with one wrong bit, but also name the bit and flip it back. The payload is not covered by HEC; each protocol checks its own.

::: lab ch2-model
model.title: Model 2 · building a header
model.how: Drag PDF, HopID and payload length to see the 4 bytes assembled, with their HEC below. Then drag “flip one bit” to simulate a bit error on the wire: the syndrome the receiver computes points to the bit that went wrong. The curve shows efficiency against packet length.
model.aria: Curve of transfer efficiency against payload length
ctl.pdf: PDF (protocol)
ctl.hop: HopID
ctl.len: Payload length
ctl.err: Flip one bit
hex.aria: The header’s binary fields and hexadecimal
read.hdr: 4-byte header
read.hec: HEC
read.pad: Padding bytes
read.eff: Efficiency
err.none: No flip
err.bit: Bit {b}
hex.fields: Fields (most significant first)
hex.sent: Sent
hex.recv: Received
hex.syn: Syndrome {s} → bit {b} flipped; corrected back
hex.clean: Syndrome 0: header intact
cv.x: Payload length
field.pdf: Protocol-defined field
field.supp: Supplementary ID
field.rsvd: Reserved bits
field.hop: HopID
field.len: Length field
field.hec: HEC itself
say.ok: A payload of {n} bytes is already a multiple of 4, so no padding is needed. The whole packet is {tot} bytes, with efficiency {eff}.
say.pad: A payload of {n} bytes needs {pad} bytes of padding to reach a multiple of 4. The whole packet is {tot} bytes, with efficiency {eff}.
say.fix: The bit flipped on the wire is bit {b} (in the {field}). The receiver recomputes the HEC over the first 3 bytes and compares it with the HEC it received. The difference points to just this bit, so it is flipped back and the packet is forwarded as usual.
:::

A 4-byte header keeps the overhead small. A full 256-byte payload packet has an efficiency of {eff256}; a 64-byte packet, {eff64}. If you carry only 5 bytes, you must pad 3 bytes and add the 4-byte header, leaving just {eff5}. That is why display data and large PCIe writes both try to fill their packets.

The model shows only the correction of a single-bit error. For errors it cannot correct, the specification requires the packet to be dropped, an HEC error to be recorded, and the link to be retrained (link recovery at Gen 4). HopID 0 is reserved for control packets; data paths through a Lane adapter use HopIDs of 8 or above (§5.2), which the model’s slider does not distinguish. Control packets (configuration reads and writes between routers) have their own format and CRC and are not shown. {.take}

## How one link is shared {#ch3}

::: strings
toc: How one link is shared
:::

Display data cannot wait, so its bandwidth is reserved first. The rest is shared between USB and PCIe, and sent in turn in proportion to weight. A reservation only counts when there is contention: if one tunnel is not using its share, another can use it. {.law}

One USB4 link often carries several tunnels at once, and the allocation is done in software by the Connection Manager on the host (usually an operating-system driver). Chapter 6 of the USB4 Connection Manager Guide 2.0 gives the algorithm. Keep 10% in reserve, so only 90% of the raw bandwidth is allocatable. Serve isochronous requests first, in priority order, with the DP main link at the top. Guarantee every USB3 and PCIe path at least 1.5 Gb/s. Then share what is left equally among these bulk paths. The Guide works through an 80 Gb/s example itself: {ex80avail} Gb/s is allocatable, one DP needs 36, several USB3 paths need 10 or 5 each, and in the end each bulk path gets {ex80bulk} Gb/s.

The allocated numbers become weights for the scheduler. The scheduling rule in USB4 §5.3.3 is this: priority groups are served strictly in order; within a group, weighted round robin applies (weights 1 to 15); and the scheduler does not idle. If one queue is empty, the next in line sends straight away. So the figure the Connection Manager gives to PCIe is not a ceiling. It is the least you can get when everyone is competing.

::: html ch3-html
dgDock.cap: What a dock typically holds (schematic, after the USB4 2.0 requirements for hubs: one USB4 port upstream, an internal PCIe switch chip, a DP adapter and downstream ports). A network adapter or card reader usually hangs off PCIe or USB 3; which one is decided by the product.
:::

Connect a 4K 60 Hz monitor, a USB 3 device and an NVMe SSD (over a PCIe tunnel) to the same Thunderbolt 4 link. After encoding and headers, each direction has {sCap4} Gb/s usable. The monitor takes {s0dp} Gb/s and the USB device takes {s0usb} Gb/s, so writes to the drive are left at about {s0drive} MB/s. Unplug the monitor and writes rise to {sNoDrive} MB/s; unplug the USB device as well and you reach the Thunderbolt 4 PCIe tunnel’s ceiling of 32 Gb/s, which is {sNoUsbDrive} MB/s.

::: lab ch3-model
model.title: Model 3 · three tunnels on one link
model.how: Choose the link, the monitor and the drive’s direction. The two bars are the two directions, downstream (computer to device) and upstream. Purple is display, cyan is USB 3, gold is the drive over the PCIe tunnel, and grey is unused.
model.aria: Bandwidth used by display, USB and PCIe in each direction
ctl.link: Link
link.tb4: Thunderbolt 4 (40)
link.tb5: Thunderbolt 5 (80)
link.tb5bb: Thunderbolt 5 Boost (120/40)
ctl.disp: Monitor
disp.none: None
disp.uhd60: One 4K60
disp.uhd60x2: Two 4K60
disp.k6_60: One 6K60
disp.k6_60x2: Two 6K60
ctl.drive: Drive
drive.write: Writing
drive.read: Reading
ctl.usb: A USB 3 device is also connected
leg.dp: Display
leg.usb: USB 3
leg.pcie: PCIe (drive)
leg.idle: Unused
read.drive: Drive speed
read.dp: Display share
read.usb: USB 3 actual
read.w: Scheduler weight USB : PCIe
wfmt: {u} : {p}
cv.down: Downstream
cv.up: Upstream
cv.cap: {v} available
say.nodp: This monitor setup does not fit. It needs {need}, but one DP link carries at most {stream}, or the Connection Manager cannot reserve that much. The screen drops resolution or stays dark; the drive still gets {X}.
say.read: Reading from the drive goes upstream, where there is no display data, so the drive gets {X}. The display’s {dp} downstream does not affect it.
say.pciecap: The drive gets {X}, already at the ceiling of {pcie} for the PCIe tunnel itself. The link has spare capacity, so the bottleneck is the tunnel, not the wire.
say.alone: With no monitor, the drive and the USB device share this direction’s {cap} by weight: the USB device gets {usb}, and the drive gets {X}.
say.shared: The monitor takes {dp} first, since it cannot wait. The rest is shared between USB ({usb}) and the drive, which writes at {X}. Unplug the monitor and the drive gets faster.
:::

One thing shows up clearly when you drag: **display signals travel only one way**, from the computer to the screen. Reading data from the drive travels the other way, where there is no monitor, so reading the drive while the monitor is connected still gets {sReadDrive} MB/s. Thunderbolt 5’s Bandwidth Boost turns the 4 wire pairs into 3 sending downstream and 1 upstream. With two 6K monitors and a drive, writes rise from {s5w} MB/s to {s5bbw} MB/s, but reads fall from {s5r} MB/s to {s5bbr} MB/s, because only one pair is left going upstream.

The storage essay’s <a href='../how-usb-drives-talk/#ch8'>Chapter 8</a> works out how fast a drive runs alone on a Thunderbolt PCIe tunnel. Here we look at what happens when it shares the link with other traffic. For how PCIe doubles from one generation to the next, see <a href='../how-pcie-works/#ch2'>“Why PCIe Keeps Doubling”</a> in this series.

The model treats the USB 3 device and the drive as always having data to send. In practice they often come in bursts, and other traffic can use the gaps. The PCIe tunnel ceilings use the 32 Gb/s for Thunderbolt 4 and 64 Gb/s for Thunderbolt 5 published by Intel; the drive’s own ceiling is not modelled. Protocol overhead beyond encoding and headers (PCIe TLP headers, USB 3 acknowledgement packets) is not counted, so real figures will be a little lower. {.take}

## One device after another {#ch4}

::: strings
toc: One device after another
:::

Thunderbolt devices can be chained because each device has a router inside, and its downstream port is the next link. But the link nearest the computer has to carry the traffic of every device below it, and the depth of a chain is capped: USB4 allows 5 levels, and 6 when compatible with Thunderbolt 3. {.law}

USB4 organises all routers into a tree (§6.1), with the host’s router at layer 0. A dock connected to the host is at layer 1; a drive connected to the dock’s downstream port is at layer 2, and so on. The specification gives each router a “route string” recording which ports you pass through from the host to reach it. The depth is limited to 5; under the Thunderbolt 3 compatibility mode, 6 is allowed for older devices.

::: html ch4-html
dgChain.cap: A daisy chain. Each link carries the traffic of every device below it, so link 1 is the most crowded (schematic).
:::

PCIe leaves the host through the one PCIe downstream adapter that belongs to this port (USB4 §11: one per downstream port) and runs down the chain. The PCIe switch chip in each device shares it between that device and the next. So several drives in a chain share one PCIe tunnel. On Thunderbolt 4, a single drive alone gets at most the tunnel ceiling of {ch1each} MB/s (measured figures are lower, because of PCIe’s own overhead; see <a href='../how-usb-drives-talk/#ch8'>Chapter 8 of the storage essay</a>). Three drives writing at once get {ch3each} MB/s each. Add a 4K monitor on the link and each gets only {chdEach} MB/s. It makes no difference which layer the monitor is on: its traffic crosses every link above it.

::: lab ch4-model
model.title: Model 4 · a daisy chain
model.how: Drag the number of drives on the chain and the latency per hop, and choose the link and compatibility mode. Each bar is the downstream traffic on one link: gold is a drive, purple is the monitor. Grey marks a device that has not been allocated.
model.aria: Load on each link of the daisy chain
ctl.n: Drives on the chain
ctl.hop: Latency per hop (tuned parameter)
ctl.depth: Depth limit
depth.usb4: USB4 (5 levels)
depth.tbt3: Thunderbolt 3 compatible (6 levels)
ctl.disp: A 4K60 monitor is also on the chain
read.each: Each drive
read.live: Devices recognised
read.rtt: Added round-trip latency
read.share: Share of one read
livefmt: {a} / {b}
cv.link: Link {k}
cv.none: Device {k} unallocated
say.one: Only one drive, which has the PCIe tunnel to itself: {X}. The round trip is {rtt} longer, a share of {share} of one read.
say.many: {n} drives share one {tot} PCIe tunnel, each getting {X}. Link 1 is the most crowded, since it carries every device below it. The round trip is {rtt} longer, {share} of a read.
say.deep: {n} devices are chained, the depth limit is {max}, so the last {drop} will not be enumerated and do not appear in the system. The {live} that are alive each get {X}.
:::

Chaining also adds a little latency, because each router a packet passes through queues it and forwards it. The specification gives no figure, so this page takes 1 microsecond per hop as a tuned parameter. Three layers deep, a read command’s round trip is {chRtt} microseconds longer; set against the roughly 50 microseconds of read wait in flash, that is {chRttShare} of it. Halve the figure and the share is {chRttH}; double it and it is {chRttD}. Depth makes the latency visible, but bandwidth is the wall you hit first.

A device connected beyond the depth limit is never enumerated by the Connection Manager, so it does not appear in the system. In this model 6 devices are chained: {ch6live} are alive in USB4 mode, and {ch6tlive} in Thunderbolt 3 compatibility mode. One of Intel’s requirements for Thunderbolt 4 is that an accessory (a dock) can have four Thunderbolt ports, usually one to the computer and three going down, so besides chaining, you can also branch.

The 1 microsecond per hop and the 50 microseconds of flash read wait are tuned parameters, used only to compare sizes. The model assumes the drives share the PCIe tunnel equally; in practice this depends on arbitration in the PCIe switch chip in each device. The model counts only the downstream (write) direction. {.take}

## Faster wires: PAM3 and 3+1 {#ch5}

::: strings
toc: Faster wires: PAM3 and 3+1
:::

From 40 to 80 Gb/s the wires are still the same pairs. USB4 2.0 lets each symbol carry more information: three voltage levels (PAM3) pack 11 bits into every 7 symbols. Going further, it changes the four wire pairs from “two out, two back” to “three out, one back”. {.law}

A USB4 link uses the two TX pairs and two RX pairs of Type-C to form two bidirectional lanes. Thunderbolt 3 runs each lane at 20.625 Gb/s, which after line encoding (2 bits of overhead in every 66) comes to exactly {tbt3coded} Gb/s. USB4 Gen 3 runs each lane at 20 Gb/s, and two lanes in one direction come to {g3coded} Gb/s after 128b/132b encoding. That is the figure behind “40Gbps”.

Gen 4 no longer treats each symbol as one bit. It uses three levels, and every 7 symbols (3⁷ = 2,187 combinations) carry 11 bits (2¹¹ = 2,048). At a symbol rate of 25.6 GBd, each lane carries {g4lane} Gb/s. Reed–Solomon forward error correction then leaves 480 data symbols out of every 504, an efficiency of {g4fec}. Two lanes in one direction give {g4down} Gb/s, which the Connection Manager accounts for as 80.

::: html ch5-html
dgLanes.cap: In symmetric mode, two wire pairs send downstream and two upstream. In asymmetric mode, three send downstream and one upstream (USB4 2.0 Figures 2-3 and 2-4). At Gen 4 each pair is counted as 40 Gb/s.
:::

Why three levels and not four? The more levels there are, the closer neighbouring levels sit. With the same swing, the eye opening of PAM3 is half that of two-level signalling ({pam3db} dB), while PAM4 has only a third ({pam4db} dB). PAM3 needs a symbol rate {pam3baud} times that of two-level signalling (Intel’s brief gives about 0.63). Its highest frequency component rises only from {nyq3} GHz at Gen 3 to {nyq4} GHz, which the same wire can still carry.

::: lab ch5-model
model.title: Model 5 · line rate, encoding and direction
model.how: Choose a link mode. The two bars are the two directions. The outer frame is the total bit rate on the wire; cyan is what remains after encoding and error correction; the gold tick marks the figure the Connection Manager accounts for.
model.aria: Line rate and rate after encoding in each direction
ctl.mode: Mode
mode.tbt3: Thunderbolt 3
mode.g2x2: Gen 2 ×2
mode.g3x2: Gen 3 ×2
mode.g4: Gen 4
mode.g4asym: Gen 4 asymmetric
leg.line: Line rate
leg.coded: After encoding
leg.cm: Connection Manager accounting
read.down: Downstream
read.up: Upstream
read.nyq: Highest frequency component
read.cable: Reference length of passive cable
cv.cm: Accounted {v}
say.nrz: {lanes} lanes, one bit per symbol. Downstream line rate {line}; after encoding {coded}; the Connection Manager accounts for it as {cm}.
say.tbt3: Thunderbolt 3 raises the line rate to 20.625 Gb/s, and after line encoding (2 bits in every 66) the result is a whole number: downstream {coded}, accounted as {cm}.
say.pam3: Three levels, 11 bits per 7 symbols, then forward error correction: downstream {coded}, upstream {up}, accounted as {cm}. Reference length of the passive cable: {len}.
say.asym: Three lanes downstream, one upstream: downstream {coded}, upstream only {up}. The Connection Manager accounts for it as {cm} / {cmu}.
:::

Asymmetric mode exists only from Gen 4. The two ends agree to turn one RX pair into TX, giving three lanes downstream and one upstream. That is {g4asymDown} Gb/s downstream and {g4asymUp} Gb/s upstream, accounted for by the Connection Manager as 120/40. Thunderbolt 5 calls this “Bandwidth Boost” and uses it for high-resolution monitors. As Chapter 3 showed, it slows drive reads.

Cables matter too. Table 3-1 of the Type-C specification gives passive cables at USB4 Gen 3 and above a reference length of about 0.8 metres. The specification really constrains insertion loss, not length. A longer cable must either use lower-loss conductors or add repeater chips inside (retimers or linear redrivers; that is an active cable).

Eye height is calculated from ideal level spacing only; equalisation, crosstalk and noise are not included. The cable length is the reference value from Type-C Table 3-1; the specification defines cables by insertion loss, not directly by length. The RS(198,194) error correction of Gen 2 and Gen 3 is switched on only if both ends agree; the model leaves it off. With it on, each direction loses about another {g3fecLoss} (192 data bytes in every 198). {.take}

## How many monitors {#ch6}

::: strings
toc: How many monitors
:::

A monitor’s bandwidth = pixels per second (including blanking) × bits per pixel. It can take the socket’s high-speed wires directly (DP Alt Mode), or ride a USB4 tunnel. In the latter case, how the Connection Manager reserves bandwidth decides whether a second screen lights up. {.law}

Using the CVT Reduced Blanking v2 formula from VESA, a 4K 60 Hz monitor has 3840 active pixels per line plus 80 blanking pixels, {htot4k} in all. It has 2160 lines per frame plus at least 460 microseconds of vertical blanking, {vtot4k} lines in all, and the pixel clock is {pclk4k} MHz. At 24 bits per pixel it needs {n4k} Gb/s. 5K 60 Hz needs {n5k} Gb/s; 6K 60 Hz needs {n6k24} at 24 bits and {n6k30} at 30 bits; 8K 60 Hz at 30 bits needs {n8k30} Gb/s. Where the pixel clock and blanking come from: see <a href='../how-pixels-reach-a-screen/#ch2'>Chapter 2 of “How Pixels Reach a Screen”</a>.

The first route bypasses the tunnel: DP Alt Mode. Once Type-C has agreed the terms with PD messages, it hands the socket’s four high-speed pairs directly to DisplayPort. Pin assignment C is four DP lanes; D is two DP lanes plus one USB 3 path. DP 1.4’s HBR3 gives 25.92 Gb/s over four lanes and 12.96 Gb/s over two. A 4K 60 Hz monitor fits exactly on two lanes, and 5K needs four. DP 2.0’s UHBR20 carries 20 Gb/s per lane, so four lanes give 77.37 Gb/s, and three 4K 90 Hz monitors at 30 bits add up to {n4k90x3} Gb/s, which fits.

::: html ch6-html
dgAlt.cap: Who gets the four high-speed pairs (DP Alt Mode pin assignments C and D, and a USB4 link). In DP mode the two SBU pins carry the AUX channel; under USB4 they carry sideband signals.
:::

The second route is the tunnel. An 8b/10b DP link uses the “maximum link bandwidth” method by default: the DP IN adapter reserves for the highest DP link rate and lane count the graphics card and screen can reach, whatever the picture actually needs. The Guide’s example: a 40 Gb/s link allows 36. The first monitor can reach HBR3 over four lanes and reserves {tb4first} Gb/s. What remains is enough only for a second monitor agreeing on HBR2 over two lanes, {tb4second} Gb/s, which cannot carry a 4K 60 Hz picture, so only {scTb4fit} monitor lights up. If both monitors top out at HBR2 over four lanes, each reserves {tb4h2each} Gb/s, the sum stays within 36, and {tb4h2fit} light up. With the “DP bandwidth allocation mode” instead (the host and graphics card must both support it), which reserves according to what the picture needs, {scTb4bwfit} 4K monitors light up too. Intel promises two 4K monitors on Thunderbolt 4; which of these routes a given product uses, this page has not checked.

::: lab ch6-model
model.title: Model 6 · does the screen fit
model.how: Choose the monitor, the number of monitors, the colour depth and the connection method. Each bar is one monitor: gold is what it needs, purple is what the tunnel reserves extra for it. The bottom bar is the whole connection. The reservation method applies only to tunnels.
model.aria: Need, reservation and total connection capacity for each monitor
ctl.mode: Monitor
mode.fhd60: 1080p 60
mode.qhd144: 1440p 144
mode.uhd60: 4K 60
mode.uhd144: 4K 144
mode.k5_60: 5K 60
mode.k6_60: 6K 60
mode.k8_60: 8K 60
ctl.count: Count
ctl.bpp: Per pixel
bpp.24: 24 bits
bpp.30: 30 bits
bpp.12: DSC 12 bits
ctl.conn: Connection
conn.alt2: Alt Mode 2 lanes
conn.alt4: Alt Mode 4 lanes
conn.alt21: Alt Mode UHBR20
conn.tb4: Thunderbolt 4 tunnel
conn.tb5: Thunderbolt 5 tunnel
conn.tb5bb: Thunderbolt 5 Boost
ctl.method: Reservation method
method.maxlink: Maximum link bandwidth
method.bwalloc: Allocation on demand
leg.need: Needed
leg.res: Reserved extra
read.need: Each monitor needs
read.fit: Monitors that light up
read.used: Used / allocatable (Gb/s)
read.dsc: DSC compression needed
fitfmt: {a} / {b}
usedfmt: {u} / {c}
bppfmt: Compressed to {v} bits per pixel
nodsc: Not needed
cfgfmt: {rate} ×{l} ({bw})
cv.disp: Monitor {i}
cv.nofit: Does not fit
cv.cap: Whole connection
cv.capnote: allocatable {v}
say.altok: Each needs {need}, and all {n} fit on the {cap} DP link.
say.altno: Each needs {need}, but the {cap} DP link carries only {fit} of the {n}.
say.maxlink: Each needs only {need}, but the first monitor reserves the whole DP link, and the second only agrees on {res2}, which is not enough. Only {fit} lights up. Try “allocation on demand”.
say.tunok: Each needs {need}, and all {n} fit within the {cap} the tunnel can allocate.
say.tunno: Each needs {need}. The tunnel can allocate {cap} and carries only {fit} of the {n}. Either lower the colour depth and use DSC, or enable Bandwidth Boost.
:::

Thunderbolt 5 reserves on demand, with 72 Gb/s allocatable. Two 6K 60 Hz monitors at 24 bits (each {n6k24}) fit {sc6k24}; at 30 bits only {sc6k30} fit, and enabling Bandwidth Boost (108 Gb/s allocatable downstream) lets {sc6k30bb} fit. 8K 60 Hz at 30 bits needs {n8k30} Gb/s, more than one DP 1.4 link can carry, so it works only with DSC compression (how DSC compresses and whether it loses anything: see <a href='../how-pixels-reach-a-screen/#ch7'>Chapter 7 of “How Pixels Reach a Screen”</a>). DP 1.4 is an 8b/10b link, and DSC on such a link requires FEC error correction as well, which takes {fecPct}% and leaves HBR3 over four lanes {hbr3fec} Gb/s. Compressed to {dsc8k} bits per pixel (roughly {dscRatio8k} times smaller), it fits (leaving out FEC would give {dsc8kNoFec} bits).

So there is no fixed answer to “how many screens can this port drive”. It depends on resolution and colour depth; whether the port uses Alt Mode or a tunnel; which reservation method the Connection Manager uses; and how many DP outputs the graphics card has. Intel’s promise for Thunderbolt 4 is two 4K monitors or one 8K, and for Thunderbolt 5, two 6K.

The CVT Reduced Blanking formula is taken from a published description of the algorithm; this page did not open the original VESA CVT specification. Many screens use their own timings, so the figures can differ by a few per cent. The 12-bit DSC setting is an example given by this page, not the setting of any particular screen; on 8b/10b links (HBR3 in Alt Mode, DP 1.4 in a Thunderbolt 4 tunnel) the model deducts FEC’s {fecPct}% from a DSC stream, while UHBR’s 77.37 already includes FEC. The model does not count how many DP outputs the graphics card has, nor the overhead of an MST hub. {.take}

## The wattage that gets agreed {#ch7}

::: strings
toc: The wattage that gets agreed
:::

When a plug goes in, VBUS carries only 5 V. Higher voltages must be agreed over the CC wire: the charger lists the levels it can supply, the device picks one, and the charger adjusts its voltage and says “ready”. The cable also has a say: a 3 A cable is limited to 60 W, and a cable without an EPR marking to 100 W. {.law}

USB Power Delivery messages travel over the CC wire at 300 kbps, using biphase mark coding (BMC). Each message begins with a 64-bit preamble and ends with a CRC, and the receiving side answers with a GoodCRC. The first message is the charger’s Source_Capabilities, listing a number of Power Data Objects (PDOs), each a voltage and a maximum current. The device replies with a Request to choose one, the charger replies with Accept, raises its voltage, and then sends PS_RDY.

Which levels are listed depends on the charger’s power rating (PDP), as Tables 3.1 and 3.2 specify. 5 V, 9 V and 15 V each allow up to 3 A, or less if the power rating is lower, with power divided by voltage. The 20 V level appears only above 45 W, and its current is the smaller of the cable’s current rating and the power divided by 20. So a 65 W charger with an ordinary 3 A cable can negotiate at most 20 V × 3 A = {pd65w} W. A 100 W charger with a 3 A cable is also {pd100c3} W.

::: html ch7-html
dgPd.cap: The sequence to enter EPR (following USB PD r3.3 §7.30.1; the GoodCRC after each message is not drawn). The dashed lines are the three parties’ own timelines: cable, charger and computer.
:::

To go above 100 W you need the Extended Power Range (EPR): three levels at 28 V, 36 V and 48 V, up to 5 A, for a maximum of 240 W (Table 3.6). Entering EPR takes an extra step. The device sends EPR_Mode (Enter); the charger confirms; then it asks the cable (Discover Identity) whether it is an EPR cable rated 50 V / 5 A. Once that is confirmed, the charger sends EPR_Source_Capabilities. A 140 W charger, an EPR cable and a laptop that needs 140 W negotiate 28 V × 5 A = {pd140c5} W. With an ordinary 3 A cable on the same charger, only {pd140c3} W. The 240 W level is 48 V × {pd240a} A.

::: lab ch7-model
model.title: Model 7 · one negotiation
model.how: Choose the charger, the cable and the device being charged. The table shows the levels the charger offers this time; the highlighted row is the one selected. Below are the messages actually exchanged this time, with the EPR stage marked in gold.
ctl.charger: Charger (PDP)
ctl.cable: Cable
cable.c3: 3 A ordinary cable
cable.c5: 5 A EPR cable
ctl.sink: Device
sink.phone: Phone (25 W)
sink.l65: Laptop 65 W
sink.l100: Laptop 100 W
sink.l140: Laptop 140 W (EPR capable)
sink.l240: Workstation 240 W (EPR capable)
th.v: Voltage
th.a: Maximum current
th.w: Power
msgs.title: Messages exchanged
read.w: Agreed
read.va: Voltage × current
read.present: Levels this cable lets the charger offer
read.wire: Time on the wire for messages
vafmt: {v} V × {a} A
say.full: The device needs {need}, and the charger’s levels are enough: {v} V × {a} A, {w}.
say.epr: The charger, cable and device all support EPR, so the Extended Power Range is entered: {v} V × {a} A, {w}.
say.short.charger: The device needs {need}, but a {pdp} charger gives at most {w} ({v} V × {a} A). The device will charge slowly, or drain while in use.
say.short.cable: The charger can supply {pdp}, but this cable does not support higher current or EPR. The charger can only offer {present}, so the result is {w}. The bottleneck is the cable, not the charger.
:::

The messages themselves are short. Counting the bits in each message at 300 kbps, plus the GoodCRC for each, a full EPR negotiation (including the cable’s identity reply, with the EPR capabilities sent in chunks) takes only {pdWire} ms on the wire, and a standard-range-only negotiation {pdWireSpr} ms. The real time goes on the charger adjusting its voltage and on the various waits the specification requires; those are not in this figure.

Thunderbolt adds its own charging requirements. Intel’s Thunderbolt 4 requires that at least one port on a laptop can charge a computer needing up to 100 W. Thunderbolt 5 raises this to 140 W, and allows up to 240 W (the brief says EPR is supported but not required). Both require at least 15 W at the port for accessories. These are rules layered on top of USB PD; the protocol is the same.

The model includes only fixed-voltage PDOs; the PPS (Programmable Power Supply) and AVS (Adjustable Voltage Supply) levels are not included. The rule the device uses to choose a level is a simplification used on this page: when the power suffices, the higher voltage is picked. Message durations count only bits on the wire, not voltage ramp-up or the timers the specification defines. The EPR capabilities are counted in the “chunked” format (a little shorter when both ends support unchunked messages). {.take}

## A door straight into memory {#ch8}

::: strings
toc: A door straight into memory
:::

The PCIe tunnel brings external devices onto the computer’s memory bus: they can read and write memory themselves (DMA), without going through the CPU. Standing in the way is the IOMMU, which opens doors page by page, 4 KiB at a time, so a device can always see other things on the same page as its buffer. {.law}

NVMe drives are fast because they fetch commands from memory themselves and write data straight back into memory (see <a href='../why-nvme-is-fast/#ch4'>Chapter 4 of “Why NVMe Is So Fast”</a>). Network cards work the same way. Once PCIe can come in from an external cable, anything plugged in can do this too. The 2019 Thunderclap research (Markettos et al., NDSS 2019) used an FPGA board pretending to be an Intel network card (the 82574L), and read memory it should not have reached on macOS, FreeBSD, Linux and Windows, several of which had the IOMMU switched on.

The defence is the IOMMU (Intel calls it VT-d): addresses a device sends are translated through it, and only pages the driver has mapped can be reached (how a driver maps them: see <a href='../how-the-os-talks-to-hardware/#ch8'>Chapter 8 of “How the OS Talks to Hardware”</a>). But it works in pages of 4,096 bytes. If a network card’s receive buffer is 1,536 bytes, two fit in one page, and the leftover space holds other things from the kernel. Those are mapped along with the buffer. This is the kind of problem the Thunderclap authors point to: operating systems put sensitive data in the same memory regions used to talk to peripherals, so the IOMMU being on does not stop it.

::: html ch8-html
dgIommu.cap: The IOMMU admits whole pages (schematic). The device should touch only the gold buffer, but the red parts of the same page are mapped too; pages with no buffer stay shut.
:::

In this page’s model, 64 buffers of 1,536 bytes are scattered at random over a pool of 64 pages (two fit in a page). The buffers come to {ioBuf} KiB in all. On average {ioPagesE} pages hold at least one buffer, so the mapped pages add up to about {ioMappedE} KiB and about {ioExposedE} KiB is exposed extra. The layout the model first draws uses {ioPages7} pages; shuffle it and the count moves around the average. With the IOMMU off, the device can reach all {ioOff} KiB of the pool. Make the buffers 2 KiB and two fit exactly in a page, but about {io2kE} KiB is still exposed on average, because the other half of the page may belong to someone else. Make them whole 4 KiB pages and the exposure is {io4k}. Another approach is “bounce buffering”: the device touches only dedicated pages, and the system copies the data across, at the cost of one extra copy.

::: lab ch8-model
model.title: Model 8 · the IOMMU opens by the page
model.how: Each square is a page, and the bars inside are its slots. Gold is the device’s buffer, red is someone else’s data mapped with it on the same page, grey is shut, and the cyan frame marks a mapped page. Change the buffer size, the count and the protection, or press the button to shuffle the layout.
model.aria: Memory pages and what the device can reach
ctl.size: Buffer size
ctl.n: Number of buffers
ctl.mode: Protection
mode.off: IOMMU off
mode.iommu: IOMMU per page
mode.bounce: Bounce buffer
btn.seed: Shuffle the layout
leg.mine: Device’s buffer
leg.exposed: Exposed alongside
leg.hidden: Shut
read.buf: Total buffer
read.mapped: Device can reach
read.exposed: Extra exposed
read.expect: Mapped pages / expected
expfmt: {a} / {e}
cv.note: Memory pool of {p} pages, 4 KiB each
cv.bounce: Bounce buffer: the device touches only dedicated pages, and none of the pool’s {p} pages are mapped
say.off: With no IOMMU, the device can reach the whole pool of {mapped}, while its buffers total only {buf}.
say.iommu: {s} bytes of buffer are scattered over {pages} pages. The IOMMU maps by page, so the device can reach {mapped}, which is {exposed} more than the {buf} of buffer.
say.bounce: The device touches only its dedicated {mapped}, which shares no page with other kernel data, so {exposed} is exposed extra. The cost is one extra copy each time.
:::

Thunderspy (Ruytenberg, 2020) took another route. It targeted the security settings of Thunderbolt 1 to 3 controllers and listed seven vulnerabilities. With about five minutes of physical access, an attacker could rewrite the controller’s firmware and bypass authorisation. Computers shipped with Thunderbolt 3 or earlier from 2011 to 2020 are affected, and Windows’ Kernel DMA Protection mitigates it only in part. The author also says the same design flaws affect USB4 and Thunderbolt 4; that is the author’s claim, which this page has not checked separately.

Windows’ Kernel DMA Protection uses the IOMMU. External devices whose drivers do not support DMA remapping are not allowed to perform DMA until the user has logged in or unlocked the machine. It does not protect the boot process. Intel has made VT-d DMA protection a mandatory requirement for Thunderbolt 4 and Thunderbolt 5.

The pool size and the random placement of buffers are chosen for this demonstration. A real kernel allocator puts similar objects together, so what gets exposed depends on the driver. The Thunderclap paper was read only at the level of its abstract and public pages. The details that Linux 5.0 enables the IOMMU by default for Thunderbolt, and disables ATS, come from secondary sources. {.take}

## Thunderbolt and USB4: how they relate {#ch9}

::: strings
toc: Thunderbolt and USB4: how they relate
:::

USB4 is a public specification written on the Thunderbolt protocol that Intel contributed. Thunderbolt 4 and Thunderbolt 5 are Intel’s checklists of things that must all be supported on top of USB4, plus certification. Many things that USB4 leaves optional become mandatory in Thunderbolt. {.law}

On 4 March 2019 the USB Promoters announced that USB4 was “based on the Thunderbolt protocol specification recently contributed by Intel”. USB4 1.0 was released in August 2019 and 2.0 in October 2022; this page reads the consolidated version of November 2025. So the routers, tunnels, packet headers and Connection Manager described in Chapters 2 to 5 are largely the same across Thunderbolt 3, USB4, Thunderbolt 4 and Thunderbolt 5.

The difference lies in how much must be supported. The USB4 specification requires a host to support USB 3 tunnels, DP tunnels and host-to-host communication; PCIe tunnels are optional. It requires a USB4 hub (dock) to support PCIe tunnels, and to be compatible with Thunderbolt 3 on its downstream ports. Intel’s Thunderbolt 4 makes PCIe tunnels, 40 Gb/s, two 4K monitors, charging and DMA protection all mandatory, and requires certification.

::: html ch9-html
th.item: Item
th.usb4: USB4 (host)
th.tb4: Thunderbolt 4
th.tb5: Thunderbolt 5
r.usb3: USB 3 tunnel
r.usb3.usb4: Mandatory
r.usb3.tb4: Mandatory, 10 Gb/s
r.usb3.tb5: Mandatory, 10 Gb/s (up to 20)
r.dp: DP tunnel
r.dp.usb4: Mandatory
r.dp.tb4: Mandatory
r.dp.tb5: Mandatory
r.pcie: PCIe tunnel
r.pcie.usb4: <b>Optional</b> (mandatory for hubs)
r.pcie.tb4: Mandatory
r.pcie.tb5: Mandatory
r.h2h: Host-to-host
r.h2h.usb4: Mandatory
r.h2h.tb4: Included
r.h2h.tb5: Included
r.tbt3: Thunderbolt 3 compatible
r.tbt3.usb4: <b>Optional</b> (mandatory on hub downstream ports)
r.tbt3.tb4: Mandatory
r.tbt3.tb5: Mandatory
r.speed: Link speed
r.speed.usb4: From 20 Gb/s; 40 and 80 optional
r.speed.tb4: 40 Gb/s
r.speed.tb5: 80 Gb/s, Boost 120
r.pcieMin: PCIe tunnel bandwidth
r.pcieMin.usb4: Not specified
r.pcieMin.tb4: 32 Gb/s
r.pcieMin.tb5: 64 Gb/s
r.video: Display
r.video.usb4: At least one
r.video.tb4: Two 4K or one 8K
r.video.tb5: Two 6K
r.charge: Laptop charging
r.charge.usb4: Per USB PD; no wattage stated
r.charge.tb4: At least one port, up to 100 W
r.charge.tb5: At least one port, up to 140 W; 240 W allowed
r.dma: DMA protection
r.dma.usb4: Platform-dependent
r.dma.tb4: Mandatory (VT-d)
r.dma.tb5: Mandatory (VT-d)
r.cert: Certification
r.cert.usb4: USB-IF compliance testing
r.cert.tb4: Intel certification
r.cert.tb5: Intel certification
:::

So the answer to “what is the difference between USB4 and Thunderbolt?” is that the protocol is nearly identical; the difference is in what is guaranteed. A port marked USB4 may have no PCIe tunnel, so when a Thunderbolt drive enclosure is plugged in, the drive can only fall back to the USB route (the storage essay’s <a href='../how-usb-drives-talk/#ch3'>Chapter 3</a> covers USB’s names and line rates). A Thunderbolt 4 port must have a PCIe tunnel, and at least 32 Gb/s of it.

Conversely, Thunderbolt 5’s 80 Gb/s uses USB4 2.0’s Gen 4 and asymmetric mode, the set covered in Chapter 5. A “USB4 80Gbps” port and a Thunderbolt 5 port carry the same signalling on the wire. The difference is still the list of mandatory items.

In the table, the Thunderbolt column comes from Intel’s public briefs and press releases, and the USB4 column from the USB4 2.0 specification’s requirements for hosts. Requirements for hubs differ, and are noted in brackets. This page did not find the original text on USB4’s treatment of DMA protection; “platform-dependent” in the table is a conservative reading. {.take}

## Where the frontier is {#ch10}

::: strings
toc: Where the frontier is
:::

As of November 2026, the 80 Gb/s specification is finished and products are shipping. The next step is not faster wires, but more devices making it standard, plus tighter rules for charging and security. {.law}

Below, the items fall into three groups: “already a standard”, “demonstrated or shipping”, and “only the vendor’s claim”. The dates are those of the versions this page read.

### Already a standard {#h.est .sub3}

- USB4 2.0: Gen 4 (PAM3, 40 Gb/s per lane) and the 3+1 asymmetric mode, released October 2022. This page reads the consolidated version of 19 November 2025. {#e1}
- USB Type-C 2.5 (March 2026) and USB PD 3.3 Version 1.0 (16 October 2026): EPR 48 V × 5 A = 240 W is the current ceiling. {#e2}
- DisplayPort 2.0 (released 26 June 2019): UHBR20 at 20 Gb/s per lane is the DP ceiling inside a tunnel. {#e3}

### Demonstrated or shipping {#h.demo .sub3}

- Thunderbolt 5: Intel published its technology brief in September 2023 (80/120 Gb/s, PCIe 64 Gb/s, charging required up to 140 W and allowed up to 240 W). {#d1}
- Apple’s M4 Pro and M4 Max models, announced on 30 October 2024, have Thunderbolt 5 ports (Apple press release). {#d2}
- Windows’ Kernel DMA Protection documentation was still being updated on 8 October 2026. Since Thunderclap, it is the main defence on the Windows side. {#d3}

### Vendor claim or not verified {#h.claim .sub3}

- Intel’s Panther Lake processors (Core Ultra Series 3), announced January 2026: Intel’s own quick reference guide lists four integrated Thunderbolt 4 ports, with a separate Thunderbolt 5 controller supported on some models; reports from ServeTheHome and TechSpot agree. {#c1}
- Intel’s brief gives PAM3 as “symbol rate 0.63, noise margin 0.5”. These are relative figures, with no conditions stated. Chapter 5 recalculates from ideal levels to 0.64 and −6 dB, which agrees in direction but may not be the same definition. {#c2}
- Marketing for “one cable for everything” docks often assumes the on-demand reservation of Chapter 6 and the spare bandwidth of Chapter 3. How many monitors really work must be worked out from those two chapters. {#c3}

Two things are worth watching. First, whether graphics cards and operating systems widely support the DP bandwidth allocation mode; the two 4K monitors in Chapter 6 depend on it. Second, the default IOMMU policy for external PCIe devices (Chapter 8).

Product information on the frontier changes quickly. This page records only the dates of the versions it read, and has not checked each vendor’s model numbers. {.take}

## Three questions when you plug in {#ch11}

::: strings
toc: Three questions when you plug in
:::

How much one USB-C cable can carry depends on three layers: what the socket and cable can handle, what the routers have agreed between them, and how the Connection Manager divides things up. {.law}

{.plain .qs}
1. <b>Does this port have a PCIe tunnel?</b> A port marked Thunderbolt always does; a port marked only USB4 may not (Chapter 9). Without one, a Thunderbolt drive enclosure or an external graphics card falls back to USB, or does not work at all. {#q1}
2. <b>Who else is on the same cable?</b> A monitor takes what it needs first, and it uses only the downstream direction (Chapter 3). Devices in a chain share the top link and the same PCIe tunnel (Chapter 4). {#q2}
3. <b>Is the cable e-marked, and how much current can it carry?</b> A 3 A cable is limited to 60 W, and one without an EPR marking to 100 W (Chapter 7). The length over which the high-speed signals work is also set by the cable (Chapter 5). {#q3}

<p>In one sentence: the USB-C socket gives 24 pins, and the CC wire lets the plug go in either way and agree on a voltage. USB4’s routers pack display, USB and PCIe into packets with the same 4-byte header, and send them in turn over one set of wires. The Connection Manager reserves for the monitor first, then divides the rest by weight. Thunderbolt 4 and Thunderbolt 5 are mandatory checklists added on top of this public protocol.</p> {#sum .sum tag=div}

Related pages: <a href='../how-usb-drives-talk/#ch3'>Why a USB Drive Never Hits Its Label · the numbers on the box</a>, <a href='../how-usb-drives-talk/#ch8'>same essay · Thunderbolt and USB4: the route with no translation</a>, <a href='../why-nvme-is-fast/#ch2'>Why NVMe Is So Fast · the bus lanes</a>, <a href='../why-nvme-is-fast/#ch4'>same essay · the ring queue and the doorbell</a>. For PCIe itself, see <a href='../how-pcie-works/'>“Why PCIe Keeps Doubling”</a> in this series. {#links style="margin-top:2em"}

::: footer
Sources: USB Type-C Cable and Connector Specification Release 2.5 (March 2026): Tables 3-1 and 3-4, §2.3, Tables 4-27, 4-28, 4-29 and 4-36. USB4 Specification Version 2.0 (consolidated version of 19 November 2025): Chapter 2, §3.2, §4.3, §5.1.2, Table 5-2, §5.2, §5.3.3, §6.1, §11, §13.4, Appendix A. USB4 Connection Manager Guide 2.0: Chapter 6, Tables 6-1, 6-2 and 6-3. USB Power Delivery Specification Revision 3.3 Version 1.0 (2026-10-16): Tables 3.1, 3.2, 3.3 and 3.6, §3.2.2, §5.8, §7.30. USB Promoters developer update (2019-03-04). Intel: Thunderbolt 5 technology brief (September 2023); Thunderbolt 4 press release (2020-07-08); Core Ultra Series 3 quick reference guide. VESA: DisplayPort 2.0 press release (2019-06-26); DP Alt Mode presentation at USB DevDays 2019; the CVT Reduced Blanking v2 formula (original text not read). A. T. Markettos et al., Thunderclap, NDSS 2019. B. Ruytenberg, Thunderspy (2020). Microsoft Kernel DMA Protection documentation (version of 2026-10-08). Apple press release (2024-10-30). All links and access dates are in BRIEF.md.

Written by an AI. The models are simplified, and the text marks which parameters are tuned. This is not a buying guide.
:::
