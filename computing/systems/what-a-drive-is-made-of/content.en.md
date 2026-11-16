---
lang: en
title: What a Drive Is Made Of · a long essay you can play with
desc: A hard disk and a solid-state drive contain completely different things, yet the computer reads both the same way. Eight models you can push: numbered sectors, seek and rotation, shingled tracks, voltage levels in a flash cell, error correction and lifetime, the flash translation layer, a layered map of connectors and protocols, and where the time of one read goes.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
unit.us: µs
unit.ms: ms
unit.s: s
unit.KiB: KiB
unit.MiB: MiB
unit.GiB: GiB
cell.slc: SLC (1 bit per cell)
cell.mlc: MLC (2 bits per cell)
cell.tlc: TLC (3 bits per cell)
cell.qlc: QLC (4 bits per cell)
cell.plc: PLC (5 bits per cell)
cell.short.slc: SLC
cell.short.mlc: MLC
cell.short.tlc: TLC
cell.short.qlc: QLC
cell.short.plc: PLC
:::

# What a Drive Is Made Of {#hero}

::: strings
kicker: Computing and systems · a long essay you can play with
:::

A mechanical hard disk and a solid-state drive are both called “drives”, but they contain completely different things.<br>Why can the computer read both the same way? Where do the speed, the slowness and the failures of each one come from? {.sub}

A mechanical drive is a few metal platters spinning fast, with a read/write head hovering over them. An SSD is a handful of chips, and each chip holds hundreds of billions of tiny cells that trap electrons. Below, we first look at a drive the way the computer sees it, then take both kinds apart: why the head has to wait, why tracks get harder to change as they pack closer, how one flash cell holds several bits, why it wears out with writing, and why it cannot be rewritten in place. Then we place the names SATA, SAS, NVMe, M.2 and U.2 on one layered map. **Each model corresponds to a published result**. The numbers come from the papers, standards and product manuals listed at the end of the page. {.lead}

An AI wrote this page. The models are small-scale simplifications made to show the mechanisms. **Wherever a value is marked “tuned parameter”, I chose the number; it was not measured**, and the text says how far the conclusion moves if that value changes. Numbers in vendor manuals are what the vendor gives under its own test conditions. This page covers mechanisms and specifications only. **It does not compare brands and gives no buying advice**. {.note}

## A drive as the computer sees it: a row of numbered cells {#ch1}

::: strings
toc: A row of numbered cells
:::

Whether the inside is disks or chips, a drive says only one thing to the computer: I have this many cells, each 512 bytes or 4096 bytes, numbered from 0. Give me a number and I will read or write that cell. {.law}

A library shelf has dozens of levels and hundreds of columns, but a borrower needs only a call number. A drive works the same way. The operating system does not know or care which platter, which ring, or which page of which chip holds the data. It sees one long row of numbered cells, called **blocks** or **sectors**, and the numbers are called **logical block addresses (LBA)**. Reading a file means reading a run of numbers. How a number is turned into a physical location is the drive's own business.

This convention lets two very different kinds of storage sit in the same computer, and it leaves one historical problem. Early sectors were 512 bytes. Later, mechanical drives enlarged the physical sector to 4096 bytes (“Advanced Format”), because the error-correcting code takes up a smaller share of a large sector. To keep old systems working, many drives still report 512-byte logical sectors to the outside. These are called **512e** (e for emulation). Drives that report 4096 bytes to the outside are called **4Kn** (native). So one 4096-byte physical sector holds 8 numbered sectors.

::: diagram dg-lba keys=dg.lba
cap: Figure 1 · The same 4 KiB write with two partition starts (cells drawn in proportion to bytes). A 512e drive reports 512-byte cells, but inside every 8 cells form one 4096-byte physical sector. Starting at sector 63, the write straddles two physical sectors and only partly covers each, so both must be read, patched and written back whole. Starting at sector 2048, it fills exactly one.
aria: Diagram in proportion to bytes: two rows of 16 logical sectors of 512 bytes, every 8 forming one physical sector of 4096 bytes. With the partition starting at sector 63, a 4 KiB write lands on sectors 63 to 70, straddles two physical sectors, and both need a read-modify-write. Starting at sector 2048, it fills exactly one physical sector.
t: Partition starts at sector {a}
rmw: Read-modify-write
full: Written whole
idle: Untouched
wr: 4 KiB write = sectors {a}–{b}
note: One physical sector of {phys} bytes = {per} numbered sectors of {log} bytes
:::

::: lab ch1-model
model.title: Which physical sectors a 4 KiB write lands on (512e)
model.how: Drag the start of the partition (counted in 512-byte sectors). The top row is the numbering the outside sees; the row below it is the real 4096-byte sectors on the disk. Gold marks this write. Watch what happens when the start is not a multiple of 8.
model.aria: A row of logical sectors and the physical sectors below it, with the part covered by one 4 KiB write highlighted
ctl.off: Partition start (sector number)
read.touched: Physical sectors touched
read.read: Must be read first
read.wr: Actually written
read.ok: This start
unit.n: {v}
unit.kib: {v} KiB
st.ok: Aligned
st.bad: Not aligned
cv.log: Logical sector (512 B)
cv.phys: Physical sector (4096 B)
say.ok: Start {o} is a multiple of 8: each 4 KiB write covers exactly one physical sector, so the whole sector is overwritten and nothing has to be read first.
say.rmw: Start {o} is not a multiple of 8: each 4 KiB write crosses {t} physical sectors, and each of them is only partly changed. The drive must first read {r} KiB, change it, and write back {wr} KiB. On a 7,200 rpm mechanical drive, reading and then writing back to the same place costs one extra full turn, about {rev} ms (chapter 2).
:::

This is the **read-modify-write** cycle. The old DOS [[how-a-computer-boots#ch7|partition table]] placed the first partition at sector 63. Because 63 is not a multiple of 8, every 4 KiB write on such a drive had to become a read of 8 KiB followed by a write of 8 KiB. Current partitioning tools start at sector 2048 (1 MiB) by default, and the problem goes away. Flash pages inside an SSD are also much larger than 512 bytes (chapter 6), so alignment matters for them too.

Limits of the model: it counts only one 4 KiB write. A real drive has a write cache that gathers nearby small writes before writing them, which can hide part of the cost. A 4Kn drive presents 4096-byte sectors to the outside, so the system cannot write half a sector and the problem does not arise. {.take}

## Platters and heads: wait for the arm to move, then wait for the sector to come round {#ch2}

::: strings
toc: Platters and heads
:::

When a mechanical drive reads a small piece of data, most of the time goes to waiting, not reading: first the arm must swing to the right ring, then the wanted segment must turn under the head. {.law}

Picture finding one line of a song on a spinning vinyl record: you move the needle roughly to the right groove, then wait for that line to come round. A mechanical drive works the same way. Several platters sit on one spindle and spin at 5,400, 7,200 or more revolutions per minute. Each platter surface has a head, and all the heads are mounted on one swinging arm. The head flies a few nanometres above the surface. Lab reports give a flying height under 5 nm, and a tiny heater near the read/write element makes it bulge down until it is only a nanometre or two from the surface.

So a random read has three parts: **seek**, when the arm moves from its current ring to the target ring; **rotational latency**, on average half a turn of waiting; and **transfer**, when the data passes under the head. Seek time is not a straight line in distance. At short distances the arm accelerates and then decelerates, so the time grows with the **square root** of the distance. At long distances the arm reaches top speed and coasts, so the time grows **linearly** with distance. This is the disk model that Ruemmler and Wilkes published in 1994. They fitted both regimes to measurements on an HP 97560.

::: diagram dg-hdd keys=dg.hdd
cap: Figure 2 · A hard disk seen from above (schematic, not to scale; real tracks are far denser, only a few are drawn). The arm can only swing and the platter can only turn: first a seek brings the head to the right track, then the drive waits for the data to come round, half a turn on average.
aria: Structure diagram (schematic): one platter seen from above, with concentric tracks and the spindle at the centre. Outside the platter a voice-coil motor swings the arm, and the head at its tip sits over one track. To read, the arm first swings to that track (the seek), then the drive waits for the data to turn under the head (rotational latency).
platter: Platter: data on both sides
spindle: Spindle: keeps the platters turning
head: Head: reads and writes here
arm: Arm
vcm: Voice-coil motor: swings the arm
target: The data to read
rot: Rotation: wait half a turn on average
seek: Seek: the arm swings to the right track
:::

::: diagram dg-stack keys=dg.stack
cap: Figure 3 · Platters and heads from the side (schematic, not to scale; the number of platters varies by model). There is one head per surface, and all heads sit on one comb that swings as a unit, so they are always at the same radius.
aria: Structure diagram (schematic): from the side, three platters stacked on one spindle. On the right a voice-coil motor carries a comb-shaped arm; a head reaches each upper and lower surface, six heads in all, moving together.
spindle: Spindle
vcm: Voice-coil motor
fly: Each head flies less than 5 nm above its surface (a lab report's figure)
comb: All heads ride one comb and move together
count: {p} platters, a head on each surface: {h} heads
:::

::: lab ch2-model
model.title: A random 4 KB read: seek + rotational wait + transfer
model.how: Choose the rotation speed and drag “access span”, the fraction of the surface the data occupies. The top graph is seek time against distance. The light-blue band is the range where your data sits, and the dashed line is the average seek within that range. The bottom graph is the sequential read speed from sector 0 (the outermost ring) to the last sector. The seek curve does not depend on rotation speed. Changing the speed only changes the rotational wait and how much data passes under the head per turn.
model.aria: Seek time against seek distance: square-root growth at short distances, straight-line growth at long distances
model.aria2: Sequential read speed falling from the outer ring to the inner ring
ctl.rpm: Rotation speed
rpm.5400: 5,400 rpm
rpm.7200: 7,200 rpm
rpm.10000: 10,000 rpm
rpm.15000: 15,000 rpm
ctl.span: Access span
read.seek: Average seek
read.rot: Average rotational wait (half a turn)
read.t: One 4 KB random read
read.iops: Random reads per second (IOPS)
read.od: Sequential read, outermost ring
read.id: Sequential read, innermost ring
unit.ms: {v} ms
unit.mbs: {v} MB/s
unit.pct: {v}%
cv.x: Seek distance (fraction of full stroke)
cv.y: Seek time (ms)
cv.span: Your data: average seek
cv2.x: Read position (fraction of capacity)
cv2.y: Sequential read (MB/s)
say.full: Data fills the whole disk: average seek {s} ms and rotational wait {r} ms. One random read takes about {t} ms, so only about {i} reads per second. Seek is {sh}% of that time.
say.shortSeek: Data covers {span}% of the surface: average seek drops to {s} ms. One random read takes about {t} ms, or about {i} per second. Seek is still {sh}% of the time, so it is the main cost.
say.shortRot: Data covers {span}% of the surface: average seek drops to {s} ms, which is less than the {r} ms half-turn. Rotational wait is now the main cost. One random read takes about {t} ms, or about {i} per second. To go faster, the disk must spin faster.
:::

In the default state, a 7,200 rpm disk with data across the whole surface, the model gives: average seek 8.5 ms, average rotational wait 4.17 ms (the vendor manual says 4.16 ms), and under 0.1 ms of transfer. One 4 KB random read takes about 12.7 ms, about 79 per second, and seek is 67% of it. At 15,000 rpm the rotational wait halves, and the rate reaches only about 95 per second; at 5,400 rpm it is about 71. If you keep the data in the outer 10% of the surface only (this is called **short-stroking**), average seek drops to 3.1 ms and the rate rises to about 137 per second. [[why-nvme-is-fast#ch1|Chapter 1 of “Why NVMe Is So Fast”]] gives a mechanical drive's random read as 8,500 µs, the same size as this model's average seek alone; with the half-turn of rotational wait added, this model gives about 12.7 ms.

Sequential reading is different. The head does not move, and each turn of the disk carries a whole track under the head. On modern drives the **linear density** (bits per millimetre) is about the same on the outer and inner rings, but the outer ring is longer, so it holds more data per turn. This is called **zoned bit recording**. Sector 0 sits on the outermost ring, so a disk slows down as it fills. In the model, the outer ring reads at 249 MB/s, the inner ring at about 125 MB/s, and the whole disk averages about 187 MB/s.

Limits of the model: the seek curve is the shape of the HP 97560, scaled in time to today's drives. The two scale factors are **tuned parameters**. They were chosen so that the single-track seek is 1.0 ms and the average seek is 8.5 ms (Seagate Barracuda 7200.12 manual, a 2009 desktop drive). The 17.4 ms full-stroke time is derived by the model, not given by the manual. The inner-to-outer radius ratio of 0.5 is also a **tuned parameter**, since vendors do not publish it. With a ratio from 0.4 to 0.6, the whole-disk average lies between 174 and 199 MB/s, and the random read time barely changes. When the rotation speed changes, sequential speed is scaled linearly from the same platter, but real 15,000 rpm platters are smaller. Controller overhead, head switching and the internal cache are not modelled. {.take}

## Packing tracks closer: shingled recording {#ch3}

::: strings
toc: Packing tracks closer
:::

The write head is wider than the read head. If each new track overlaps part of the one before it, the drive holds more tracks. The cost: to change any one track, you must rewrite every track that overlaps it. {.law}

How much a disk can hold depends on its **areal density**: bits per millimetre along a track, times tracks per millimetre across the disk. The first factor depends on smaller magnetic grains and a closer head. The second is limited by the width of the write head, which must produce a magnetic field strong enough to write, so it cannot be made as narrow as the read head.

**Shingled magnetic recording (SMR)** works like roof shingles. Each new track is written over part of the previous one, leaving only the narrow strip the read head needs. There is no write-head-width gap between tracks, so the same head fits more tracks. Tracks are grouped into bands called **zones**, with a gap between one group and the next. The older approach is **CMR** (conventional magnetic recording), in which tracks do not overlap.

::: diagram dg-smr keys=dg.smr
cap: Figure 4 · Conventional and shingled tracks (schematic, not to scale; the track pitch is drawn at half the write-head width, and the model below lets you change it). Shingling packs tracks closer; the cost is that changing one track means rewriting every track in the band that overlaps it.
aria: Comparison (schematic): on the left, conventional recording, five tracks of equal width with gaps between them and a write head as wide as a track. On the right, shingled recording: each new track overlaps part of the previous one, leaving only a strip wide enough for the read head; six tracks form a band, with a gap between bands. Changing track 2 of a band means rewriting tracks 2 to 6.
cmr: Conventional (CMR): tracks never overlap
whead: Write head as wide as a track
gap1: Gap between tracks
cmrfix: Change one track, write only that track
smr: Shingled (SMR): each track overlaps the last
rstrip: The read head needs only the exposed strip
band: A band: written in order only
gap: Gap between bands
rewrite: Change track 2 → rewrite tracks 2 to 6
:::

::: lab ch3-model
model.title: A group of shingled tracks: capacity gain and the cost of rewriting one track
model.how: Drag the number of tracks per group and the track pitch after shingling, with the write-head width as 1. The gold curve is the capacity gain. The red curve is the average number of tracks you must rewrite to change one track at random. Watch which curve flattens first.
model.aria: Two curves against tracks per group: capacity gain saturates quickly, rewrite cost rises in a straight line
cv.g: Capacity gain
cv.c: Average tracks rewritten
ctl.B: Tracks per group
ctl.q: Track pitch after shingling
read.gain: More capacity than CMR
read.tr: Tracks rewritten per change
read.ms: Time per rewrite (7,200 rpm)
read.x: Relative to an in-place CMR rewrite
unit.pct: {v}%
unit.tr: {v} tracks
unit.ms: {v} ms
unit.x: {v}×
cv.x: Tracks per group
say.one: One track per group means no shingling: no capacity gain, and changing a track only rewrites itself (one turn to read and one turn to write, counted as two turns in the model).
say: {B} tracks per group: {g}% more capacity than CMR (the limit for this pitch is {gm}%). Changing one track at random means rewriting {tr} tracks on average, about {mb} MB, taking about {ms} ms. That is {x} times an in-place CMR rewrite.
say.sat: {B} tracks per group: {g}% more capacity, already close to the limit of {gm}% for this pitch, so adding tracks adds almost nothing. A random rewrite still means rewriting {tr} tracks on average, about {mb} MB, taking about {ms} ms. That is {x} times CMR, and the cost keeps rising in a straight line.
:::

The default is track pitch 0.8 and 10 tracks per group: 22% more capacity, with a limit of 25%. Changing one track at random means rewriting on average the following 5.5 tracks, about 11 MB in total using the 2.1 MB per track of the outer ring from chapter 2. That takes about 92 ms, which is 11 times the 8.3 ms of rewriting one turn in place. Raise the group to 100 tracks and capacity only reaches 25%, while the rewrite becomes 50.5 tracks and 842 ms, 101 times. **Capacity gain saturates quickly, but rewrite cost grows linearly with group size**. The formulas are B/((B−1)q+1) for capacity gain and (B+1)/2 for the average number of tracks rewritten.

So shingled drives suit data that is written once and rarely changed. Shingled drives sold to ordinary users keep a non-shingled cache area on the drive. They take random writes into that cache first and tidy them back into the shingled area when idle (**drive-managed**). When the cache fills, speed drops suddenly. Data-centre drives use **host-managed** shingling: the drive tells the operating system that each zone can only be written sequentially, and software makes sure writes are appended in order.

The other route to higher areal density is smaller, more stable magnetic grains. Smaller grains flip more easily under thermal agitation, so they need harder materials, and harder materials are too hard for an ordinary head to write. **Heat-assisted magnetic recording (HAMR)** uses a laser to heat one tiny spot at the moment of writing, making it briefly soft. **Microwave-assisted magnetic recording (MAMR)** uses microwave oscillation to help the flip. Chapter 9 looks at how far they have got.

Limits of the model: the track pitch and tracks per group are sliders and are **illustrative**. The real group size of a shingled drive is set by its firmware, and vendors do not publish it by model. Each rewrite is counted as one turn to read and one turn to write. Seek, the area taken by the gaps between groups, and the cache area are not modelled. {.take}

## A flash cell: one voltage window split into levels {#ch4}

::: strings
toc: Voltage levels in a flash cell
:::

A flash cell stores one thing: how many electrons are trapped inside. To store n bits per cell, the same voltage window must be split into 2ⁿ levels. The more levels, the narrower the gaps between them, and the greater the chance of a misread. {.law}

A flash cell is a transistor with, under its control gate, a layer that traps electrons (early designs used a floating gate; most now use a charge-trap layer). To write, a high voltage pushes electrons in by [[quantum-tunneling|tunnelling]]. The more electrons are trapped, the higher the voltage needed to switch the transistor on. This voltage is the **threshold voltage**. To read, the controller applies a reference voltage to the gate and checks whether the transistor conducts. That shows which side of the reference the threshold voltage lies on.

With only two levels, “many” and “few”, a cell stores 1 bit: this is SLC. Four levels store 2 bits (MLC), eight store 3 bits (TLC), sixteen store 4 bits (QLC), and thirty-two store 5 bits (PLC). The problem is that writing is never exact. Across thousands of cells written to the same level, the threshold voltages do not all match. They spread into a bell-shaped curve ([[binomial-normal|normal distribution]]). Once the bells of two neighbouring levels overlap, a cell that lands in the overlap is read as its neighbour.

::: diagram dg-cell keys=dg.cell
cap: Figure 5 · A flash cell in cross-section (schematic, not to scale). It is a transistor with one extra layer under the gate that can trap electrons. The more electrons trapped, the higher the gate voltage needed to turn the channel on (the threshold voltage); reading means finding which level that voltage falls in.
aria: Structure diagram (schematic): a flash cell in cross-section. At the top is the control gate on the word line; below it come a blocking insulator, the charge layer holding electrons, and a tunnel oxide a few nanometres thick; below that the silicon substrate, with the source and drain on either side and the channel between them. Programming uses a high voltage to make electrons tunnel from the channel into the charge layer.
gate: Control gate (word line)
src: Source
drn: Drain
ch: Channel
sub: Silicon substrate
block: Blocking insulator
store: Charge layer: a floating gate, or today usually a charge-trap layer
tunnel: Tunnel oxide, only a few nanometres thick
write: Programming: a high voltage makes electrons tunnel up from the channel
vth: More trapped electrons, higher threshold voltage
:::

::: lab ch4-model
model.title: 2ⁿ bells in one voltage window
model.how: Choose how many bits each cell stores and drag “program/erase cycles”. Each bell is one level. The vertical lines are the read reference voltages, and red marks the part that will be read wrongly. Watch what happens to the same bell width when you move from TLC to QLC and PLC.
model.aria: Threshold voltage distributions: several evenly spaced bells, with read reference voltages between neighbouring bells and overlaps in red
ctl.bits: Bits per cell
ctl.N: Program/erase cycles
read.L: Voltage levels
read.d: Spacing between neighbouring levels
read.s: Width of each level (standard deviation)
read.r: Raw bit error rate
unit.mv: {v} mV
unit.n: {v} levels
cv.x: Threshold voltage
cv.ref: Read reference voltage
say.ok: {n}: {L} levels, {mv} mV apart. After {N} erase cycles, the chance of a misread per bit is about {r}, below the {lim} that the default error correction can handle (chapter 5).
say.over: {n}: {L} levels, only {mv} mV apart. After {N} erase cycles, the chance of a misread per bit is about {r}, above the {lim} that the default error correction can handle (chapter 5). The data cannot be trusted.
say.mush: {n}: {L} levels packed together. After {N} erase cycles the bells have blurred into one. The chance of a misread per bit is about {r}, and no practical error-correcting code can recover the data.
:::

In the model the window width is fixed and every bell has the same width. TLC's neighbouring levels are 857 mV apart, and when new the chance of a misread per bit is about 7.1 × 10⁻¹⁶. QLC's spacing shrinks to 400 mV, and when new the chance is already 5.2 × 10⁻⁵. PLC has only 194 mV left, and when new the rate is 0.014, above the correction limit of 1.1 × 10⁻³ calculated in chapter 5. **Each extra bit doubles the number of levels and roughly halves the spacing. The chance of a misread falls with the tail of the bell, so halving the spacing does not merely double the errors; it changes them by many orders of magnitude.**

This is the flash **read margin**. The chance of a misread comes from bell overlap. A cell crosses the midpoint into a neighbouring level with probability Q(Δ/2σ), where Δ is the level spacing, σ is the bell width, and Q is the area in the right tail of the normal distribution. Neighbouring levels are coded so that they differ by one bit (Gray code), so a one-level error produces only one wrong bit. Treating flash as a communication channel with Gaussian noise is the standard model in the 2017 survey by Cai et al.

Limits of the model: real distributions are not perfectly symmetric bells, and the levels do not all have the same width; the erased level is the widest. The controller also moves the reference voltage based on measurements (read retry). The 6 V window width is **illustrative**. The speed at which the bells widen with erase cycles is a **tuned parameter**, see chapter 5. {.take}

## Why flash wears out: how long error correction can hold {#ch5}

::: strings
toc: Why flash wears out
:::

Flash does not fail suddenly. Each erase-and-program cycle damages the insulating layer that holds the electrons a little more, so the bells widen. When too many bits are wrong for the error-correcting code to fix, that block has reached the end of its life. {.law}

Pushing electrons in and pulling them out both mean passing them through an oxide layer only a few nanometres thick. Each pass leaves some traps that catch electrons. The more erase cycles, the more the threshold voltages spread, and the more trapped electrons slowly leak away. **Program/erase (P/E) cycles** are therefore the unit of flash life.

What keeps the flash usable is **error-correcting code (ECC)**. The controller writes each block of data (here 1 KiB) together with some check bits. On reading, it can find and correct up to t wrong bits. This is the same kind of technique as [[inside-a-phone|error correction in a phone's radio reception]]. BCH and LDPC codes are the common choices. As long as a block has no more than t wrong bits, the user sees no error. If it has more, that block cannot be read back.

::: diagram dg-cw keys=dg.cw
cap: Figure 6 · One chunk the controller writes to flash: data plus check bits (bar lengths in proportion to bits; error positions are illustrative). By default each 1 KiB of data gets 560 check bits, enough to correct 40 bit errors, a code rate of 93.6%. If a read has 40 errors or fewer, the user sees nothing; one more and the chunk is lost.
aria: Bar diagram in proportion: one codeword is 8,192 data bits plus 560 check bits, 8,752 bits in all. Two strips below sketch bit errors: up to 40, the controller fixes them all; more than 40, the chunk cannot be read back.
len: One codeword: {l} bits, code rate {r}%
data: Data: 1 KiB = {k} bits
par: Check bits: {m} × {t} = {p}
ok: Up to {t} bit errors: the controller fixes them all
bad: More than {t}: this chunk cannot be read back
:::

::: lab ch5-model
model.title: Correction capability → tolerable error rate → erase cycles per cell type
model.how: Drag t, the number of bits corrected per 1 KiB, and choose the consumer or enterprise error target. The bars show how many erase cycles each cell type can take (log scale). The error-correcting code gives the raw error rate each cell can tolerate. The bells from chapter 4 then show after how many erase cycles the error rate reaches that limit.
model.aria: Bar chart of the erase cycles each of five flash cell types can tolerate, log scale
ctl.t: Bits corrected per 1 KiB
ctl.cls: Error target
cls.client: Consumer (10⁻¹⁵)
cls.ent: Enterprise (10⁻¹⁶)
read.lim: Tolerable raw error rate
read.rate: Code rate (data share)
read.tlc: TLC erase cycles
read.qlc: QLC erase cycles
:::

The chance that the error-correcting code fails is the tail of a binomial distribution: the probability that a block of l bits contains more than t errors. By default, 40 bits per 1 KiB are corrected (a code rate of 93.6%). To keep the fraction of uncorrected errors below the consumer target of 10⁻¹⁵, the raw bit error rate can be at most about 1.1 × 10⁻³. That falls within the 10⁻³ to 10⁻² range that Cai et al. give as what today's controllers can handle. The enterprise target of 10⁻¹⁶ is ten times stricter, but the ceiling barely moves (it is still about 1.1 × 10⁻³), because the binomial tail is extremely steep.

Now take the bells from chapter 4. In the model the bell width grows linearly with erase cycles. The two coefficients are **tuned parameters**, chosen so that MLC just reaches 3,000 cycles and TLC reaches 1,000. Those are the figures Cai et al. give for planar 15–19 nm flash. The model then **derives**: SLC about 9,838 cycles, QLC about 179, and PLC 0. Halving the correction capability to 20 bits lowers QLC to about 83 cycles; doubling it to 80 bits raises QLC to about 292.

These absolute numbers must be taken with a pinch of salt. Halving or doubling either calibration number (keeping the other fixed) moves the QLC prediction from 0 to about 1,590 cycles. Today's 3D flash cells are larger than planar-era cells and less noisy, so real QLC does much better than this model. What the model supports is the ratio: **each extra bit per cell cuts the erase-cycle budget sharply**, while each extra bit of correction buys less and less life. PLC has no commercial product yet, and the reason is the excess misreads shown here (chapter 9).

::: lab ch5-lab
life.aria: Readings of the life calculation
life.title: From erase cycles to years in service
life.how: Choose the cell type and drag the daily writes (in whole-drive writes per day, DWPD) and the write amplification. The erase cycles come from the model above at the default correction. The last two readings show how much faster stored data leaks away when the drive is unpowered and a few degrees warmer.
ctl.cell: Cell type
ctl.dwpd: Daily writes (DWPD)
ctl.wa: Write amplification
ctl.ea: Activation energy (eV)
read.pe: Erase cycles
read.y: Service life
read.af40: Unpowered retention: 40 °C vs 30 °C
read.af55: Unpowered retention: 55 °C vs 30 °C
unit.pe: {v} cycles
unit.pct: {v}%
cv.y: Erase cycles
cv.zero: Not possible when new
say: Correcting {t} bits per 1 KiB, with check bits taking part of the space, gives a code rate of {rate}%. It tolerates a raw error rate of about {lim}. That corresponds to about {tlc} erase cycles for TLC and about {qlc} for QLC. PLC gets {plc} cycles, which means it fails even when new.
say.noQlc: Correcting only {t} bits per 1 KiB: the tolerable raw error rate is about {lim}. TLC gets about {tlc} erase cycles, while QLC and PLC fail even when new.
unit.y: {v} years
unit.x: {v}×
say.lifeLong: {n} takes about {pe} erase cycles. Writing the whole drive {d} times a day with write amplification {wa} gives about {y} years of service, more than five years.
say.lifeShort: {n} takes about {pe} erase cycles. Writing the whole drive {d} times a day with write amplification {wa} runs out in about {y} years.
say.life0: In this model {n} fails even when new, so it has no service life.
:::

The lifetime formula itself is simple. Full-drive writes possible = erase cycles × (1 + spare fraction) ÷ write amplification. Divide that by the full-drive writes per year to get years. **Write amplification** is the ratio of what the drive physically writes to flash to what you asked it to write. Chapter 6 explains where it comes from, and so does [[why-nvme-is-fast#ch6|chapter 6 of “Why NVMe Is So Fast”]]. The spare fraction here is 7.4% (the gap between 1 GiB and 1 GB; this is an assumption). A TLC drive with 1,000 erase cycles, 0.33 DWPD and write amplification 2 lasts about 4.5 years.

The endurance figures printed on drives come from this formula. **TBW** (terabytes written) is the total that may be written within the warranty, and **DWPD** is how many full-drive writes per day are allowed over the warranty period. The two can be converted into each other. The Samsung 870 EVO 1 TB is rated at 600 TBW with a 5-year warranty, which equals 0.33 DWPD, or 600 full-drive writes. This is a warranty term (“whichever comes first: the period or the TBW”), not the moment the drive breaks. By the formula above, many combinations of erase cycles and write amplification give 600.

There is another kind of failure that has nothing to do with how much is written: **data retention**. When a drive sits unpowered, the trapped electrons slowly leak away, and the warmer it is, the faster they leak. The rate follows the **Arrhenius relation**, which varies with exp(−Eₐ/kT). [[how-soy-sauce-gets-its-flavor#ch5|Chapter 5 of “How Soy Sauce Gets Its Flavor”]] uses the same relation to explain colour darkening. The JEDEC standards for SSDs grade retention by unpowered storage time. From a 2011 JEDEC presentation: consumer drives retain data for 1 year at 30 °C, and enterprise drives for 3 months at 40 °C. I have not verified the activation energy the standard uses against the original text, so here it is a slider. At the commonly cited 1.1 eV, 40 °C is about 3.8 times faster than 30 °C, and 55 °C is about 25 times faster. At 0.6 eV, the factors are about 2.1 and 5.8.

Limits of the model: errors are treated as independent. Real controllers also use read retry, soft-decision LDPC and cross-die parity, and can survive error rates higher than the ones here. The code length, and “one bit of correction for every 14 check bits”, are typical BCH choices, not the parameters of any particular controller. {.take}

## Flash cannot be rewritten in place: an address table that keeps changing {#ch6}

::: strings
toc: No rewriting in place
:::

Flash can be written one page at a time, but it can only be erased one whole block at a time, and a page must be erased before it can be written again. So an SSD never rewrites in place. It writes the new data somewhere else, then changes the one entry in the address table. {.law}

Think of a notebook that you can write in only with pencil, but whose pages can only be torn out a whole chapter at a time. To change one line, you cannot erase it. You rewrite it on a blank page further on and change its page number in the index. The old line is crossed out. When enough of a chapter is crossed out, you copy the few lines still in use into a new chapter and tear out the whole old one.

Inside an SSD, this is done by the **flash translation layer (FTL)** in the controller firmware. It keeps a table of which block and page each logical block is now in. Chapter 1 said the computer sees only a row of numbers; this table is what makes that work. Writes always go to the next free page of the block currently open for writing. The old copy is marked **invalid**. When free blocks run low, the controller picks a block with the most invalid pages, moves its still-valid pages elsewhere, and erases the whole block. This is called **garbage collection**.

::: diagram dg-ftl keys=dg.ftl
cap: Figure 7 · Writing logical block 5 again (schematic: 4 pages per block, as in the model below; real blocks and pages are much bigger). Flash cannot be changed in place, so the new data goes to the next empty page of the open block and the address table points to it; the old page is only marked invalid, and its space comes back when the whole block is erased. Addresses are written block.page, counting from 0.
aria: Before-and-after diagram (schematic): before, the address table points logical block 5 to page 1 of block 0; block 1 is the open block, with logical block 8 in page 0 and the rest empty. After logical block 5 is written again, the new data goes to page 1 of block 1, the table points there, and the old copy in block 0 is marked invalid.
before: Before
after: After writing logical block 5 again
map: Address table: logical block 5 → {a}
b0: Block 0
b1: Block 1 (open)
free: Empty
dead: {n} (invalid)
lba: Logical block {n}
nbefore: A page must be empty before it is written; erasing works on whole blocks only
nafter: The old page is marked invalid; the table points to the new one
:::

::: lab ch6-model
model.title: An SSD of 8 blocks × 4 pages: write it yourself and watch the address table change
model.how: Pick a logical block number and click “write”, or click a random-write button. Each cell is one page: gold is valid (the number is the logical block it stores), dark red is invalid, and empty means erased. The table below is the address table. The drive has 32 pages but presents only 24 logical blocks to the outside; the rest is spare space.
grid.aria: State of flash blocks and pages
ctl.lba: Logical block number
btn.write: Write this logical block
btn.r1: 1 random write
btn.r20: 20 random writes
btn.seq: Write all in sequence
btn.reset: Reset
read.host: Pages you wrote
read.nand: Pages actually written to flash
read.ratio: Ratio of the two
read.gc: Garbage collection runs
map.title: Address table: logical block → block.page
blk: Block {b}
blk.open: Block {b} (open)
erases: {v} erases
say.start: Starting state: the 24 logical blocks were written in order once, then 3 random rewrites were made, so 3 pages are invalid. You have not written anything yet. The counts start from here.
say.nogc: You wrote {h} pages and flash has written {n} pages. There are still free blocks, so each write goes straight into a fresh page, and old pages are only crossed out (now {inv} pages are invalid).
say.gc: You wrote {h} pages and flash actually wrote {n} pages, a ratio of {w}. Garbage collection has run {g} times, moving {m} still-valid pages to free up blank blocks.
:::

Starting from the default state and writing randomly, the ratio of flash writes to your writes is 2.05 over the first 20 writes. After 200 writes it settles at about 2.78. This ratio is the **write amplification** in the formula of chapter 5. Moving pages also wears out flash, so it eats directly into the drive's life. How large the ratio becomes at steady state, and how over-provisioning and TRIM reduce it, is covered by a dedicated model in [[why-nvme-is-fast#ch6|chapter 6 of “Why NVMe Is So Fast”]], so it is not repeated here. You can try sequential writing yourself: a whole block's pages become invalid together, so nothing has to be moved when they are reclaimed.

The address table has its own costs. A 1 TB drive with 4 KiB pages needs about 240 million entries. The controller usually has a DRAM chip dedicated to the table. Drives without DRAM borrow a small part of the computer's memory, or keep only the frequently used part inside the controller. The table serves another purpose too: the controller can quietly move frequently written data to blocks with few erase cycles, so that wear is spread evenly. This is called **wear levelling**.

Limits of the model: real blocks and pages are much larger than the ones here. The controller writes several chips at once ([[why-nvme-is-fast#ch5|“Why NVMe Is So Fast”, chapter 5]]). Garbage collection runs in the background, and choosing a block to reclaim also considers data hot or cold, and wear. Here there is only one open block and the simplest rule: pick the block with the fewest valid pages. {.take}

## A layered map: form factor, connector, link, protocol {#ch7}

::: strings
toc: A layered map
:::

“What interface is this drive?” is really five questions: what shape it is, what plug it has, what electrical signals run on the wire, what rules package the data, and what language the commands use. M.2 answers only the first two. {.law}

The most common confusion when buying a drive is “Is M.2 the same as NVMe?” It is not. M.2 is a **form factor and slot**, a shape like a socket. The signals in that slot can be SATA or PCIe, and the command language running over PCIe is usually NVMe. A SATA M.2 drive plugged into an M.2 slot that is wired only for PCIe will fit, but the computer will not recognise it.

Split a drive into five layers, from outside to inside: **form factor** (3.5-inch, 2.5-inch, M.2, E1.S…), **connector and keying** (the SATA data connector, the SAS connector, the M.2 B-key and M-key, the SFF-8639 used by U.2), **electrical signals and link** (SATA, SAS and PCIe lanes), **transport layer** (how data is packed into frames), and **command set** (ATA, SCSI, NVMe). Every layer must match at both ends before the drive can be used.

::: diagram dg-layers keys=dg.layers
cap: Figure 8 · “Which interface” split into five layers (schematic). The left and right drives share a form factor and part ways from the second layer down. For the middle one, “M.2” settles only the first two layers; the three below decide that it runs over PCIe and speaks NVMe. A drive works in a slot only if every layer matches, and the model below checks them one by one.
aria: Layer comparison: five layers (form factor, connector and keying, electrical signals and link, transport layer, command set) for three drives. The 2.5-inch SATA SSD is 2.5-inch, SATA, SATA, SATA, ATA. The M.2 NVMe SSD is M.2, M.2 M key, PCIe ×4, PCIe transaction layer, NVMe. The 2.5-inch SAS drive is 2.5-inch, SAS, SAS, SAS, SCSI.
ssd25: 2.5-inch SATA SSD
m2nvme: M.2 NVMe SSD
sas25: 2.5-inch SAS drive
note: Gold frames: “M.2” answers only the first two layers
:::

::: lab ch7-model
model.title: Will this drive work in this socket, and which layer blocks it?
model.how: Choose a drive and a slot or interface. The table compares the layers from outside to inside. Green means the layer matches. Red marks the first layer that does not match, and the layers below it are not checked.
ctl.d: Drive
ctl.s: Slot or interface
th.layer: Layer
th.drive: This drive
th.ok: Match?
d.hdd35: 3.5-inch SATA mechanical drive
d.ssd25: 2.5-inch SATA SSD
d.m2sata: M.2 SATA SSD
d.m2nvme: M.2 NVMe SSD
d.u2: 2.5-inch U.2 NVMe SSD
d.sas25: 2.5-inch SAS drive
d.e1s: E1.S NVMe SSD
s.sataPort: SATA port on the motherboard
s.m2pcie: M.2 slot wired for PCIe only
s.m2both: M.2 slot wired for PCIe and SATA
s.sasBay: SAS drive bay
s.u2bay: U.2 NVMe drive bay
s.usbSata: 2.5-inch USB enclosure (SATA bridge)
s.usbNvme: M.2 USB enclosure (NVMe bridge)
s.e1sBay: EDSFF E1.S bay
layer.ff: Form factor
layer.conn: Connector and keying
layer.lane: Electrical signals and link
layer.xport: Transport layer
layer.cmd: Command set
lay.ff: form factor
lay.conn: connector and keying
lay.lane: electrical signals and link
lay.xport: transport
lay.cmd: command set
ok.y: Match
ok.n: No match
ok.skip: Not checked
v.35: 3.5-inch
v.25: 2.5-inch
v.m2: M.2 (2280 etc.)
v.e1s: E1.S
v.sata: SATA
v.bm: M.2 B+M key
v.m: M.2 M key
v.sff8639: SFF-8639 (U.2)
v.sas: SAS
v.edsff: SFF-TA-1002 edge connector
v.pcie4: PCIe ×4
v.pcie: PCIe transaction layer
v.ata: ATA
v.scsi: SCSI
v.nvme: NVMe
say.ok: {d} in {s}: all five layers match. It works.
say.ok.stp: {d} in {s}: it works. SAS bays are deliberately built to accept SATA drives. A SAS controller can speak SATA to the drive directly; through an expander it wraps SATA inside SAS with a tunnelling protocol (STP), and the drive still receives ATA commands. The reverse does not work: a SAS drive does not fit a SATA port.
say.ok.bridge: {d} in {s}: the drive side matches. A bridge chip inside the enclosure translates it into a USB storage protocol, so the computer sees a USB device. Speed is set by the bridge chip and the USB link.
say.fail.ff: {d} and {s} do not match at the first layer: the {l} differs, so it cannot be fitted at all.
say.fail.conn: {d} and {s} stop at the {l} layer: the plug and socket are not the same standard, so they cannot be treated as matching.
say.fail.lane: {d} in {s}: it fits, but stops at the {l} layer. The signals wired to the slot are not the same electrical standard the drive uses, so the computer does not recognise the drive.
:::

A few combinations are worth remembering. A SATA M.2 drive in an M.2 slot wired only for PCIe fails at layer three: it fits, but it is not recognised. A SATA drive fits a SAS bay, but a SAS drive does not fit a SATA port. Whatever a USB enclosure holds, the computer sees USB, and a chip inside the enclosure translates between the two sides. U.2 shares the 2.5-inch form factor with SAS and SATA, and there are “tri-mode” backplanes that accept all three (U.3, SFF-TA-1001 specification). Which U.2 drives fit which U.3 bays is described differently in the secondary sources I read, so it is not in the model.

Later essays on this site will each follow one route on the map: [[how-sata-works|how SATA packs a read request onto the wire]], [[how-sas-works#ch7|why SAS can take SATA drives but not the reverse]], [[how-usb-drives-talk|why USB enclosures are often slower than advertised]], and [[storage-over-a-network|using a drive over a network]]. The [[how-pcie-works|PCIe]] and NVMe route is covered in [[why-nvme-is-fast]], and the speed ceiling of the SATA link is in [[why-nvme-is-fast#ch2|its chapter 2]].

Limits of the model: it only checks whether each layer matches. It ignores speed generations (a PCIe 4.0 drive in a PCIe 3.0 slot works, just more slowly), power, BIOS settings and M.2 lengths. The key and slot wiring of M.2 come from vendor and secondary sources; I did not read the original PCI-SIG M.2 specification. {.take}

## Where the speed comes from: where the time of one read goes {#ch8}

::: strings
toc: Where the speed comes from
:::

Time to read some data = time to find it + time to move it. A mechanical drive loses badly on the first term, by a factor of a hundred or more. On the second term the gap is only a few times to a few tens of times. {.law}

Fetching a screw from a warehouse and fetching a whole truckload of bricks take time in different places. For one screw, nearly all the time goes to finding it. For a truckload of bricks, most of the time goes to moving it. Storage works the same way. The first term is called **latency**, and the second is set by **bandwidth**. The latency of a mechanical drive comes from the seek and rotation of chapter 2. A solid-state drive has no moving parts, so its latency is the time to read a flash page, pass through the controller and interface, and then go through the operating system.

::: lab ch8-model
model.title: How long a read takes: mechanical drive, SATA SSD, NVMe SSD
model.how: Drag the size of this read. Each horizontal bar is the time one drive takes for this read (log scale). Gold is latency and blue is transfer. The mechanical drive uses the chapter 2 model at 7,200 rpm with the whole disk in use. The two SSDs use the single-queue random read and sequential read figures from their vendor manuals.
model.aria: Horizontal bar chart of read time for three drives, split into latency and transfer, log scale
leg.lat: Latency
leg.x: Transfer
ctl.size: Size of this read
dev.hdd: Mechanical drive (7,200 rpm)
dev.sata: SATA SSD
dev.nvme: NVMe SSD
cv.x: Time (log scale)
read.size: This read
unit.t: {v} {u}
unit.size: {v} {u}
say.lat: Reading {s} {su}: the mechanical drive spends nearly all its time waiting to reach the data (latency is {hl}% of the total). It is {x1} times slower than the SATA SSD and {x2} times slower than the NVMe SSD.
say.bw: Reading {s} {su}: the mechanical drive now spends most of its time moving data (latency is only {hl}% of the total). The gap narrows to {x1} times slower than the SATA SSD and {x2} times slower than the NVMe SSD.
:::

For a 4 KiB random read, the mechanical drive takes about 12.7 ms, the SATA SSD about 84 µs and the NVMe SSD about 46 µs. The mechanical drive is 151 and 276 times slower. For a 1 GiB read, the three take about 5.76 s, 1.92 s and 0.144 s, so the mechanical drive is only 3.0 and 40 times slower. **Why are SSDs faster than mechanical drives?** For small, scattered reads, because there are no moving parts, latency is two orders of magnitude lower. For large reads, only because bandwidth is higher, and the SATA SSD's bandwidth is capped by the SATA link.

The size at which latency equals transfer time is a drive's “dividing line”: about 2.3 MiB for the mechanical drive, about 42 KiB for the SATA SSD and about 331 KiB for the NVMe SSD. Reads smaller than the line are mostly waiting; larger ones are mostly moving. So mechanical drives suffer most from many small files. Among SSDs, small files are compared by latency and large files by bandwidth. How much of those tens of microseconds goes to the flash itself, to the protocol and to the driver is covered in [[why-nvme-is-fast#ch1|chapter 1 of “Why NVMe Is So Fast”]].

Limits of the model: the two SSD latencies are the reciprocals of the single-queue 4 KB random read rates in the Samsung 870 EVO (SATA) and 990 PRO 1 TB (PCIe 4.0 ×4 NVMe) manuals. Vendors measured them on their own test rigs, and they include operating-system overhead, so they are not the read time of the flash alone. Sequential figures are the maximum values the vendors state. Queuing of several requests at once is not modelled: the mechanical drive's queue can reorder requests, and an SSD can work in parallel. {.take}

## The frontier (as of November 2026) {#ch9}

::: strings
toc: The frontier
:::

Both paths are still moving forward. Mechanical drives add density by adding a laser to the head, and flash adds layers and puts one more bit in each cell. Their limits are the formulas from the earlier chapters. {.law}

Each item below is dated and labelled by its kind. <span class="tag h">established</span> means a standard or physics. <span class="tag m">shipped or demonstrated</span> means the company has announced it as delivered or shown it. <span class="tag l">roadmap or report</span> means a company plan or a press report that has not been independently confirmed. Sources are at the end of the page and in the BRIEF.

- <span class="tag m">shipped</span> **Heat-assisted magnetic drive (3 March 2026):** Seagate announced that its Mozaic 4+ platform, a HAMR drive of up to 44 TB, is shipping in volume to two hyperscale cloud providers, with more than 4 TB per platter. Its roadmap is 10 TB per platter and 100 TB per drive (<span class="tag l">roadmap</span>). {#f.seagate}
- <span class="tag m">reported shipping</span> **Western Digital (3 February and August 2026):** in February it said a 40 TB UltraSMR drive (shingled, not heat-assisted) was being qualified at two hyperscale customers, with volume production planned for the second half of 2026. In August, StorageReview reported that it had begun shipping this 40 TB drive in the quarter ending 3 July 2026. Its HAMR drive is also being qualified: in February it planned a ramp in 2027, and in August a 44 TB HAMR drive was reported for the first half of 2027. It states it will reach 100 TB in 2029 (<span class="tag l">roadmap</span>). {#f.wd}
- <span class="tag m">shipped</span> **Largest SSD (5 May 2026):** Micron announced that its 245 TB 6600 ION has begun shipping. It uses QLC flash, in U.2 and E3.L form factors. Kioxia also released a 245.76 TB model, the LC9, in July 2025. {#f.micron}
- <span class="tag m">shipping</span> **Flash layer count (25 August 2025):** SK hynix announced that its 321-layer QLC flash, at 2 Tb per die, had entered mass production. In April 2026 the first SSD using it (PQC21) began shipping to Dell. {#f.hynix}
- <span class="tag l">report</span> **Over 400 layers (August 2026):** Samsung showed a tenth-generation V-NAND with more than 400 layers at FMS 2026. Korean media say it is in mass production, while other reports put mass production in 2027. I cannot confirm either claim independently. {#f.samsung}
- <span class="tag l">not yet commercial</span> **Five bits per cell (PLC):** Solidigm showed a working PLC SSD in 2022. In December 2025, SK hynix presented at IEDM an approach that splits one cell into two halves to store 5 bits. As of November 2026, I have not found a shipping PLC product. {#f.plc}

Returning to the models above shows what the next step requires. The areal density of mechanical drives must double again. HAMR must heat a tiny spot on the platter at each write and then cool it quickly, and the laser and head must survive this repeated heating for years. That is one reason mass production is slow. The seek and rotation of chapter 2 have not changed at all, so the bigger the drive, the fewer random reads each terabyte gets. Adding layers does not change the physics of each cell. It stacks cells upward, and every layer must be made equally well. Putting one more bit in each cell runs straight into the read margins of chapters 4 and 5.

<span class="tag h">established</span> The physics and mathematics behind these judgements: random read latency is set by seek and the half-turn of rotation (chapter 2); the capacity gain of shingling is capped at 1/q (chapter 3); each doubling of levels roughly halves the spacing, and the error rate follows the tail of the normal distribution (chapter 4); uncorrected errors follow a binomial tail (chapter 5). New products do not change any of this.

## Given a drive, ask three questions {#ch10}

::: strings
toc: Given a drive, ask three questions
:::

Spec sheets list many names. Only a few numbers decide how fast a drive is and how long it lasts. {.law}

{.plain .qs}
1. **Does it spin or not?** If it spins, look at the rotation speed and whether it uses shingling. Random reads manage only tens to about a hundred per second (chapter 2), and shingled drives are poor at frequent rewriting (chapter 3). If it does not spin, look at the bits per cell. More bits are cheaper, but the erase-cycle budget is smaller (chapters 4 and 5). {#q1}
2. **What are its five layers?** Form factor, connector, electrical signals, transport and command set. Check each layer against your slot (chapter 7). M.2 is not the same as NVMe, and whatever is inside a USB enclosure, the computer sees only USB. {#q2}
3. **Are your reads and writes small and scattered, or large and continuous?** Small, scattered access depends on latency, where mechanical drives lose by a factor of a hundred or more. Large, continuous access depends on bandwidth, where the gap is only a few times to a few tens of times. The dividing line is roughly latency times bandwidth (chapter 8). If you write a lot, also look at TBW or DWPD, which come from erase cycles × (1 + spare fraction) ÷ write amplification (chapters 5 and 6). {#q3}

The computer sees a drive as *a row of numbered cells*, which is why it can use the same method for two very different things. A mechanical drive is *slow* because the head must move and the platter must turn. Its density rises by stacking tracks and, with laser heating, by pushing further, at the cost of harder rewriting. An SSD is *fast* because it has no moving parts. It *wears out* because its voltage levels narrow as the bits per cell increase, and each erase leaves damage that error correction must compensate for. Its *no in-place rewriting* is hidden by an address table. The names of interfaces are just the five layers of convention that connect these parts to the computer. {#sum .sum tag=div}

Related pages: [[why-nvme-is-fast]] · [[why-compute-waits-for-memory]] · [[switches-that-compute]] · [[quantum-tunneling]] · [[binomial-normal]] · [[inside-a-phone]] {#links style="margin-top:2em"}

::: footer
**Models and sources.** Chapter 1: 512e read-modify-write (Thomas-Krenn wiki; Dell white paper WP27). Chapter 2: Ruemmler &amp; Wilkes, “An introduction to disk drive modeling”, IEEE Computer 27(3), 1994 (seek coefficients for the HP 97560); Seagate Barracuda 7200.12 product manual 100529369 rev C (single-track seek 1.0 ms, average seek 8.5 ms, average rotational latency 4.16 ms); Seagate Enterprise Capacity 3.5 HDD datasheet DS1882 (8 TB, 249 MB/s); UC Berkeley Computer Mechanics Lab report (head flying height). Chapter 3: zonedstorage.io (shingling and zoning). Chapters 4 and 5: Cai, Ghose, Haratsch, Luo, Mutlu, “Error Characterization, Mitigation, and Recovery in Flash-Memory-Based Solid-State Drives”, Proc. IEEE 105(9), 2017 (Gaussian threshold-voltage model, error-correction failure formula, life formula, erase-cycle figures, tolerable error rates); Samsung 870 EVO datasheet rev 1.1 (600 TBW). Chapter 7: SATA-IO (SATA 6 Gb/s, 2009); SNIA SFF specification numbers (SFF-8639, SFF-TA-1001, SFF-TA-1002, SFF-TA-1006). Chapter 8: Samsung 870 EVO and 990 PRO datasheets. Chapter 9: press releases from Seagate (2026-03-03), Western Digital (2026-02-03), Micron (2026-05-05), SK hynix (2025-08-25, 2026-04-08); StorageReview (2026-08-06); TrendForce (2026-08-05).

**This page was written by an AI.** Values marked “tuned parameter” are chosen, not measured. Each model's limits are given at the end of its chapter.
:::
