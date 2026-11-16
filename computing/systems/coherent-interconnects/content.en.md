---
lang: en
title: How Chips Share Memory · a long essay you can play with
desc: A server's CPU, GPUs, accelerators and memory-expansion cards each have their own memory. Why do they all want to share one, how is a cache kept coherent across a PCIe wire, and how are dozens of GPUs joined into one machine? Nine hands-on models: copy or share, the slot accounting of CXL flits, the messages of the three device types, memory expansion and hot/cold tiering, memory pooling, back-invalidate, ring all-reduce step by step, how long an all-reduce takes, and scale-up versus scale-out; plus an NVLink table and coherence inside one package.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.ns: {v} ns
u.us: {v} µs
u.ms: {v} ms
u.s: {v} s
u.GBps: {v} GB/s
u.TBps: {v} TB/s
u.B: {v} bytes
u.KiB: {v} KiB
u.MiB: {v} MiB
u.GiB: {v} GiB
u.GB: {v} GB
u.x: {v} times
u.per1k: {v} items
u.none: —
:::

# How Chips Share Memory {#hero}

::: strings
kicker: Computing · Systems · a long essay you can play with
:::

The CPU, GPU, accelerator and memory-expansion card in one server each have their own memory.<br>Why is everyone now trying to make them “share one”? {.sub}

Two more questions follow. How is a cache kept coherent across a single PCIe wire? And how are the dozens or hundreds of GPUs that train a large model joined into “one machine”? The essay starts with the plainest answer: copy the whole buffer across. Then it shows how CXL adds two new protocols to the PCIe wire, so that a device can cache host memory and the host can read and write device memory; how much slower a memory-expansion card is, and how to use one; how several machines share one pool of memory, and who tells whom when they share the same line; then, on the GPU side, how NVLink and NVSwitch join 72 cards into one domain, how gradients are added up across them, and how domains connect to each other; and last, the practice of packaging a CPU and a GPU together. **Each model is the real mechanism at a smaller scale**: Little's law, the slot accounting of CXL flits, the names of the protocol messages, and Patarasuk and Yuan's ring all-reduce. Each can be checked against the paper or the specification. {.lead}

This page was written by an AI. The CXL protocol details and latency estimates come from the survey by CXL designer Das Sharma and co-authors; the measured latency of memory-expansion cards comes from Liu et al.'s 2024 measurements; the memory pool comes from Microsoft's Pond paper; and the NVLink, Grace Hopper, MI300A and UALink figures come from the vendors' and consortium's published material. Each source and date is given where it is used. **Values marked “tuned parameter” were chosen so the model can be computed, not measured**; the text says how far a conclusion moves when one is doubled. This page explains mechanisms only and **does not judge which vendor's products are worth buying**. {.note}

## Copy across, or share {#ch1}

::: strings
toc: Copy across, or share
:::

When a device needs data in CPU memory, the old way is to copy the whole block across. The new way is to let the device read each line as a CPU core would, only the lines it uses, with caches kept consistent. Which is faster depends on how big the buffer is, and on how much of it is really used. {.law}

Two people co-write a report. One way is to copy the whole file onto a USB stick and hand it over; the other person edits it and copies it back. The other way is to put the file in a shared folder, where the other person opens only the pages they need. For a small file of which they read a page or two, sharing is easier. For a large file that they must read from start to finish, one copy is quicker, because a copy moves everything in one go, whereas opening the file page by page means a wait for every page.

Most GPUs, network cards and accelerators that plug into PCIe today use the first way. The driver has the device start a DMA that moves a buffer from host memory into the device's own memory (<a href='../how-pcie-works/#ch7'>Chapter 7 of “Why PCIe Keeps Doubling”</a>), and the device copies the results back when it has finished. Each copy has a fixed cost: calling the driver, writing the descriptor, waiting for the completion interrupt. The model takes {dma} µs (**tuned parameter**), then moves bytes at {pcie16} GB/s per direction for PCIe 5.0 ×16 (figure 1, left).

The second way needs the device to issue ordinary read requests straight to host memory, one 64-byte line at a time, and the value it reads must always be the latest, even when that line is sitting in some CPU core's cache. The CXL.cache protocol does exactly this (chapter 3). How long does each round trip take? The CXL designers estimate about {cLat} ns. Waiting for one line at a time is too slow, so the device keeps several requests in flight at once. The bandwidth reached is the number of requests in flight times the bytes per request, divided by the round-trip time. This is Little's law (<a href='../why-compute-waits-for-memory/#ch4'>Chapter 4 of “Why Compute Waits for Memory”</a>). With {mlp} requests in flight, it comes to {little64} GB/s (figure 1, right).

::: diagram dg-copy keys=dg.copy
cap: Figure 1. Copy and share (schematic, not to scale). Copy: the whole block is moved across, the device works on its own copy, and keeping the two in step is left to software. Share: the device reads only the lines it uses, and hardware keeps them coherent.
aria: Diagram: on the left, copy. A buffer in host memory is moved by DMA over PCIe, as one block, into device memory. On the right, share: the device reads the few lines it uses directly from host memory over CXL, and the host keeps them coherent.
titleL: Copy
titleR: Share
host: Host
dev: Device
hmem: Host memory
dmem: Device memory
buf: Buffer
copy: Copy
dma: DMA block move
back: Copy back when done
lines: Lines used only
coh: Host keeps coherent
cache: Device cache
:::

::: lab ch1-model
model.title: Model 1 · Copy a buffer, or read only the lines used
model.how: Drag the **buffer size**, choose how much of it the device really uses, and how many requests it can have in flight. Watch where the two lines cross: to the left of the crossing, sharing is faster; to the right, copying is.
model.aria: Two curves: the horizontal axis is buffer size (log), the vertical axis is the time for the device to get its data (log). One curve is copying the whole block; the other is reading only the lines used.
leg.copy: Whole-block copy
leg.share: Only the lines used
ctl.size: Buffer size
ctl.frac: Share used by the device
frac.1: All
frac.0.25: A quarter
frac.0.05: 5%
frac.0.01: 1%
ctl.mlp: Requests in flight
read.copy: Whole-block copy (fixed cost + bytes ÷ bandwidth)
read.share: Only the lines used (one round trip + lines × 64 bytes ÷ bandwidth)
read.bw: Effective bandwidth when sharing
read.x: Size at which the two methods tie
cv.x: Buffer size
cv.y: Time (µs)
say.share: A {S} buffer, of which {f} is used: reading only the lines used takes *{tShare}*, faster than copying ({tCopy}). With {M} requests in flight, the effective bandwidth is {bw}, {bound}. At this share, copying only becomes faster once the buffer exceeds {x}.
say.copy: A {S} buffer, of which {f} is used: a whole-block copy takes *{tCopy}*, faster than reading line by line ({tShare}). The fixed cost of copying is already spread out, and the copy's bandwidth of {bdma} is higher than the {bw} of sharing. Only buffers smaller than {x} are faster to share.
say.alwaysShare: With only {f} used, reading just the lines used is faster however big the buffer: now {S} takes *{tShare}*, and copying takes {tCopy}. Because so few bytes need to move, sharing's lower bandwidth ({bw}) still keeps pace with a whole-block copy.
bound.little: limited by Little's law (too few requests)
bound.link: limited by the link's own bandwidth
:::

The default is a 1 MiB buffer with 5% used by the device: a whole-block copy takes {c1copy} µs, while reading only the lines used takes {c1share} µs. But if the device reads from start to finish, sharing takes {c1fshare} µs and copying wins. With everything used, the two lines cross at {x100} KiB: below that, the fixed cost of copying dominates and sharing wins; above it, the copy's single large burst of bandwidth wins. When the share used is below {fStar} (sharing's effective bandwidth divided by the copy bandwidth), the two lines never cross, and sharing wins at every buffer size. Raise the requests in flight to 256, and sharing is no longer limited by Little's law but by the link itself: the crossing moves to {x100m256} MiB, and the threshold rises to {fStar256}.

This is the appeal of sharing one memory: the device can follow a pointer into a data structure in host memory and touch only the part it uses, with no copy first and no need to track which copy has been changed, and by whom. The approach is usually called **zero-copy** or **coherent shared memory**. CXL does it over a PCIe wire; NVIDIA's Grace Hopper and AMD's MI300A do it inside one package (chapter 11). The cost: someone has to make sure every cached copy of a line matches, and that someone is now on the far side of a wire.

This is a very rough model. The fixed copy cost of {dma} µs is tuned: halved, the crossing with everything used moves to {x100h} KiB; doubled, to {x100d} KiB; the shape of the result does not change. It leaves out copying the result back, pinning the pages before the copy, shared reads pulling the host's cache along with them, and other traffic on the link. The {cLat} ns is an estimate for the specification's target; chapter 5 shows that the first real devices are slower. {.take}

## Coherence across one wire {#ch2}

::: strings
toc: Coherence across one wire
:::

Inside one chip, the cores' caches are kept consistent by one protocol. A device that joins over a wire becomes one more cache in that protocol. CXL is asymmetric: the host decides, and the device only answers. {.law}

First, a paragraph recapping coherence itself (for the detail, see <a href='../how-cores-share-memory/#ch1'>“How Cores Share Memory”</a>). Each core has its own cache, and several of them can hold copies of the same line at once. The rule: at any moment, either only one cache may write the line, or several may hold it for reading only; a read always returns the last value written. There are two ways to enforce it: everyone listens to every request on the bus (snooping, <a href='../how-cores-share-memory/#ch3'>Chapter 3</a>), or each line has a home that records who holds it (a directory, <a href='../how-cores-share-memory/#ch4'>Chapter 4</a>). The state of each line is one of the letters of MESI (<a href='../how-cpu-caches-work/#ch9'>Chapter 9 of “How a CPU's Three Levels of Cache Work”</a>).

Once a device is attached over PCIe, each line of host memory is still managed by the **home agent** in the host. The device's cache becomes one more cache that the home agent looks after. When the device wants to read or write a line, it asks the home first; when a core on the host is about to write a line that the device holds, the home tells the device to invalidate it (figure 2). So that it need not ask the device every time, the host keeps a table of which lines the device may be caching. The size of this table sets how much host memory the device can cache at most; the size of the device's own cache does not matter.

::: diagram dg-ha keys=dg.ha
cap: Figure 2. A device's cache joins the host's coherence (schematic). The home agent manages each line of host memory. When the device reads or writes, it asks the home first (solid lines). When a host core is about to write a line the device holds, the home tells the device to invalidate it (dashed lines).
aria: Diagram: the host has several cores, a last-level cache, a home agent and a table that records which lines the device caches, with host memory (DDR) below. A CXL link connects to the device, which has its own cache, accelerator units and device memory.
host: Host (CPU)
cores: Cores and their caches
llc: Last-level cache
home: Home agent
sf: Table of device lines
mem: Host memory (DDR)
link: CXL link
dev: Device
dcache: Device cache
acc: Accelerator units
dmem: Device memory
req: Read / write requests
snp: Invalidate notice
:::

How much time does it take to cross a wire? The CXL designers measured on Intel Sapphire Rapids: data from the pins, through the CXL layers and back to the pins, takes {portLo} to {portHi} ns for a round trip, once at each end. The specification sets itself a target: from the host pins, one access to device memory takes no more than {pinMem} ns, and answering one snoop takes no more than {pinSnoop} ns. Swapping a line between cores on one chip takes tens of nanoseconds (<a href='../how-cores-share-memory/#ch7'>Chapter 7 of “How Cores Share Memory”</a>).

Why is CXL asymmetric? The links between CPUs (Intel's UPI and AMD's Infinity Fabric, <a href='../how-a-computer-is-wired/#ch4'>Chapter 4 of “How the Parts of a Computer Are Wired Together”</a>) are symmetric: each end holds a full home agent, and the protocols differ between vendors and do not interoperate. CXL aims to let any vendor's device plug into any vendor's CPU, so it keeps the complicated parts in the host: the device need not know the host's internal protocol, only how to answer a few standard requests. In CXL 3.0, one root port can carry up to {cacheIdN} devices with caches (the messages carry a {cacheIdBits}-bit identifier).

This chapter has no model. The step-by-step working of the coherence protocol is in the interactive version in “How Cores Share Memory”, and chapter 4 walks through the same steps on CXL messages. The latency figures are measurements on a CXL 1.1 implementation and targets from the specification; they are not a guarantee for any product. {.take}

## Three protocols on one PCIe wire {#ch3}

::: strings
toc: Three protocols on one PCIe wire
:::

CXL lays no new wire. It borrows PCIe's physical layer and sends three protocols in turn, packed into fixed-size frames: one is PCIe itself, and the other two carry cache and memory traffic. {.law}

Think of a motorway with three kinds of vehicle: coaches, lorries and ambulances. They are all loaded into containers of the same size, and they take turns on the road. It is the same road; only the toll booths can read the labels on the containers and know which department each one must go to.

The three kinds are as follows (figure 3). **CXL.io** is the transaction layer of PCIe itself: enumeration, configuration, DMA and interrupts, using PCIe's TLP packets (<a href='../how-pcie-works/#ch3'>Chapter 3 of “Why PCIe Keeps Doubling”</a>); every CXL device must support it. **CXL.cache** lets a device cache host memory: the device sends requests, the host returns data, and the host can also snoop the device. **CXL.mem** works the other way: it lets the host read and write memory on the device as if it were its own memory modules. When the link trains, the two ends first agree, in PCIe's way, that they speak CXL; after that the physical layer carries CXL frames.

::: diagram dg-stack keys=dg.stack
cap: Figure 3. The CXL protocol stack and the 68-byte frame (schematic). CXL.io has its own set; the cache and memory protocols share one. The arbiter alternates the two sets on the same PCIe physical layer. The byte counts come from section 3.2 of Das Sharma et al.'s survey.
aria: Diagram: three protocols, CXL.io, CXL.cache and CXL.mem, each with its transaction and link layers, pass through an arbiter and multiplexer down to PCIe's physical layer. Below, a 68-byte frame: a 2-byte protocol ID, four 16-byte slots and a 2-byte CRC.
io: CXL.io
cache: CXL.cache
mem: CXL.mem
ioSub: PCIe itself: config, DMA, interrupts
cmSub: Cache and memory: low-latency set
arb: Arbitration and mux
phy: PCIe physical layer (32 GT/s; 64 GT/s from CXL 3.0, PAM4)
flit: One 68-byte frame
pid: Protocol ID {pid} B
slot: Slot {i} · 16 B
crc: CRC {crc} B
:::

The CXL 1.1 and 2.0 frame is {flitB} bytes: {flitPid} bytes of protocol ID, saying which protocol the frame carries; {flitPay} bytes of content; and {flitCrc} bytes of CRC check. The content is cut into 4 “slots” of 16 bytes each: request and response headers take up slots, and a 64-byte line of data fills 4 slots. At 64 GT/s, CXL 3.0 switches to PCIe 6.0's 256-byte frame (<a href='../how-pcie-works/#ch10'>Chapter 10 of the same essay</a>), with 16 slots per frame. The cache and memory protocols share one frame format because both need low latency; CXL.io is a separate set, which alternates on the link with the cache and memory set under an arbiter.

::: lab ch3-model
model.title: Model 2 · How many bytes a CXL link can really move
model.how: Choose the **traffic**, the **frame format** and the **number of lanes**. The strip above shows what each slot in a run of frames carries: gold is data, cyan is header, grey is the frame's own overhead. The numbers below are worked out from the slot accounting of Das Sharma et al.
model.aria: A run of CXL data frames: each slot is coloured by whether it carries data, a header or overhead, and the colours change with the traffic and frame format chosen.
cv.data: Data
cv.hdr: Header
cv.oh: Overhead
ctl.kind: Traffic
kind.memRd: Host reads device memory (CXL.mem)
kind.cacheRd: Device reads host memory (CXL.cache)
kind.cacheWr: Device writes host memory (CXL.cache)
ctl.mode: Frame format
mode.68: 68-byte frame · 32 GT/s
mode.256: 256-byte frame · 64 GT/s
ctl.w: Lanes
read.raw: Raw line rate (per direction)
read.real: Data it can really move (per direction)
read.eff: Efficiency
read.ddr: Equivalent to this many DDR5-4800 channels
say.read: Of every {slots} slots, {data} carry data; with the efficiency of the frame and the link, {le}, applied, the real rate is *{eff}* of line speed: {real}, roughly {ddr} DDR5-4800 channels.
say.write: Writes cost more: when a device writes a line it must first take ownership, then send the dirty data back. Three message headers take two slots, so only {data} of {slots} slots carry data; the real rate is *{eff}* of line speed: {real}.
say.derived: The survey gives no figure for this cell. Here the 68-byte frame's ratio of two data slots to one header slot is used, multiplied by the 256-byte frame's efficiency of 15/16, giving *{real}*. This is this page's own calculation, not a figure from the paper.
:::

A ×16 link at 32 GT/s has a raw rate of {raw16} GB/s per direction. When the host reads device memory it can really move {fm16} GB/s; device reads of host memory reach {fc16} GB/s; device writes of host memory manage only {fw16} GB/s, because each line written needs three headers. A ×8 memory-expansion card reads at {fm8} GB/s, and one DDR5-4800 channel gives {ddr5} GB/s, so a ×16 link is roughly as much as {fmDdr} memory channels, with far fewer pins (on the memory-module side, see <a href='../how-memory-talks/#ch5'>“How Memory Talks to the CPU”, Chapter 5</a> in this series). At 256-byte frames and 64 GT/s, device reads reach {fc256} GB/s and writes {fw256} GB/s.

These are the ceilings under full load, with only one kind of traffic and CXL.io not using the line, from the slot accounting in the survey. The measured devices in chapter 5 fall well short of them. The 256-byte figure for host reads of device memory is this page's own calculation, and the model marks it as such. {.take}

## Three device types, and what each one speaks {#ch4}

::: strings
toc: Three device types, and what each one speaks
:::

A device speaks only the protocols it needs: one that only caches host memory speaks io and cache; one with its own memory that also caches host memory speaks all three; one that is itself a memory speaks io and mem. {.law}

The CXL specification divides devices into three types by need (figure 4). **Type 1** has no memory of its own but wants to cache host memory, as a smart NIC does: to handle a packet it reads queues and descriptors in host memory. **Type 2** is an accelerator with its own memory, such as a GPU or an FPGA: it must cache host memory and also open its own memory to the host. **Type 3** is a memory-expansion card: a controller plus some memory, which the host uses as extra memory. It does no computing itself, so it need not cache anyone else's data.

::: diagram dg-types keys=dg.types
cap: Figure 4. The three CXL device types (schematic). CXL.io is in every type; only a device with a cache speaks CXL.cache, and only one with memory to open to the host speaks CXL.mem. Examples follow figure 3 of Das Sharma et al.'s survey.
aria: Diagram: three columns. Type 1 device (cache, no memory of its own, speaks io and cache); Type 2 (cache plus device memory, speaks all three); Type 3 (memory only, speaks io and mem). Each column connects to the host above.
host: Host
t1: Type 1
t2: Type 2
t3: Type 3
e1: Smart NIC
e2: GPU, FPGA
e3: Memory expander
cache: Cache
mem: Device memory
ctrl: Memory controller
:::

Device memory that is mapped into the host's address space, with coherence managed by the host, is called **HDM** (host-managed device memory). The trouble with a Type 2 device is that its memory may also be cached by the host, so when the device changes a line it must first have the host invalidate its copy. Before CXL 3.0, each block of memory had a “bias”, and switching the bias handed over the whole block at once. CXL 3.0 changed this to **back-invalidate**: the device sends an invalidate request straight to the host, and the host, once it has invalidated, replies with a confirmation. The specification calls this “enhanced coherency”.

::: lab ch4-model
model.title: Model 3 · Two lines, and which messages each device type sends
model.how: Choose the **device type**, then press the action buttons. Line X is in host memory; line Y is in device memory. After each step, see the state of each line in each cache, and the messages that crossed the link. Buttons go grey when that device type cannot do the action.
ctl.type: Device type
type.1: Type 1 · smart NIC
type.2: Type 2 · GPU / FPGA
type.3: Type 3 · memory expander
act.cfg: Host reads a configuration register
act.devRdX: Device reads X
act.devWrX: Device writes X
act.cpuRdX: CPU reads X
act.cpuWrX: CPU writes X
act.cpuRdY: CPU reads Y
act.devWrY: Device rewrites Y
btn.reset: Clear
log.aria: Messages that crossed the link
speaks: This type speaks: {list}
st.hX: X in CPU cache
st.dX: X in device cache
st.hY: Y in CPU cache
log.empty: No messages yet. Press an action.
dir.h2d: Host → device
dir.d2h: Device → host
say.start: Neither line is cached by anyone yet. Press “Device reads X” to see how the device asks the host for a line.
say.no: “{act}” is not possible for this device type: it does not speak {need}.
say.quiet: “{act}” sent no messages over the link: either the line was already held locally, or the other side had no copy, so the change is local.
say.msgs: “{act}” sent *{n} messages* over the link. The host always decides: when a device wants a line, it must first ask the host, and the host deals with the line on its side before handing it over.
say.snoop: “{act}”: the device holds this line, so the host first snoops it, which took *{n} messages*. The device's copy {gone}.
say.bi: “{act}”: the host caches this line in device memory, so the device must first send a back-invalidate and wait for the host to hand the line back or invalidate its copy: *{n} messages* in all. This is new in CXL 3.0.
gone.inval: was invalidated
gone.shared: was downgraded to shared
:::

A few presses show CXL's character. When a device reads a line it does not have, it first sends <code>D2H Req RdShared</code>, and the host replies “go ahead” with the data attached. When a CPU wants to write a line the device holds, the host sends <code>H2D Req SnpInv</code> to invalidate the device's copy. A device never deals with the CPU's cache directly: everything goes through the host. A host read of device memory is simply a request and a response (<code>M2S Req MemRd</code> and <code>S2M DRS MemData</code>), because the host still manages the coherence of that memory. A Type 3 device has no CXL.cache, so the read X and write X buttons are grey.

This is a simplified state machine: one CPU cache, no simultaneous requests, no internal snoop step among the host's other cores, and no bias switching from before CXL 3.0. Message names follow the survey's spelling; real flows have more variants. {.take}

## Memory-expansion cards: a slower tier of memory {#ch5}

::: strings
toc: Memory-expansion cards: a slower tier of memory
:::

A Type 3 device is just memory, with a controller and a PCIe wire in between: latency is roughly twice that of local memory, and bandwidth equals one or two memory channels. If cold pages are moved there while hot ones stay local, on average it hardly looks slower at all. {.law}

A bookshelf on your desk holds the books you use often; the store-room downstairs holds the ones you rarely use. However big the store-room, nobody wants to go downstairs for every word; but if a book you consult once a year is kept there, the store-room costs almost nothing, and the desk has room to spare.

Why do servers want memory-expansion cards? A CPU can attach only a limited number of memory channels, and each channel needs around two hundred pins; there is no room for more. Cloud providers have also found that, once the cores are rented out, part of the memory often sits unused (chapter 6). A memory card on a PCIe slot adds capacity and bandwidth, and can use cheaper memory modules, or even an older generation.

How much slower is it? Two kinds of figure. **Estimates**: the CXL designers, using the specification's targets, put a CPU read of a directly attached expansion card at about {estDirect} ns; Microsoft's Pond paper estimates it at {pondLo} to {pondHi} ns more than local memory on the same node (they measured the local figure at {pondLocal} ns). **Measurements**: in 2024, Liu et al. measured four CXL 1.1 expansion cards on an Intel server with MLC. Local memory was {locLat} ns and {locBw} GB/s per socket. Three ASIC-based cards took {aLat}, {dLat} and {bLat} ns; two ×8 cards reached {aBw} and {bBw} GB/s; a ×16 card reached {dBw} GB/s. An FPGA-based card took {cLatDev} ns. The first products are a good deal slower than the specification's estimates. Before real devices existed, researchers used another socket's memory to stand in for CXL; comparing against real devices, Sun et al. found that true CXL memory can have up to {sunEmu}% lower latency than this emulation, so conclusions from emulated experiments do not carry over directly.

::: diagram dg-exp keys=dg.exp
cap: Figure 5. Memory-expansion card and hot/cold tiering (schematic, not to scale). The latency and bandwidth are card D and local memory as measured by Liu et al. in 2024 (chapter 5 text).
aria: Diagram: the CPU is connected to several local DDR memory channels, and by a CXL ×16 link to a memory-expansion card with a controller and several memory channels. On the right, pages are arranged by heat: hot ones stay local, cold ones move to CXL.
cpu: CPU
ddr: Local DDR5
ddrLat: {lat} ns · {bw} GB/s
link: CXL ×16
card: Memory expander (Type 3)
ctrl: CXL memory controller
dimm: DDR5
cardLat: {lat} ns · {bw} GB/s
pages: Pages ranked by heat
hot: Hot pages: stay local
cold: Cold pages: move to CXL
:::

How is this slower memory used? The operating system treats it as a remote memory node with no CPU, and when reclaiming memory it demotes cold pages there instead of swapping them to disk (<a href='../how-virtual-memory-works/#ch12'>Chapter 12 of “How Virtual Memory Works”</a>). Hardware can take over too: the “flat memory mode” of Intel Xeon 6 pairs local memory and CXL memory one to one, and a hot line moves to local memory automatically (chapter 12). The key point is that page heat is usually very uneven: a few pages carry most of the accesses.

::: lab ch5-model
model.title: Model 4 · How many pages on CXL before the average starts to slow
model.how: Drag the **share of pages placed on CXL**, choose how uneven page heat is and which card to use, then switch between “cold pages first” and “random”. Watch the share of accesses that land on CXL, the average latency, and the bandwidth when both tiers are used together.
model.aria: The horizontal axis is the share of pages placed on CXL; the vertical axis on the left is average idle latency. One line is cold pages placed first, the other is random placement. A small second chart shows the maximum bandwidth when both tiers are used together.
leg.hot: Cold pages first
leg.rand: Random
leg.bw: Maximum bandwidth
ctl.p: Pages on CXL
ctl.s: Unevenness of heat (Zipf exponent)
ctl.place: Placement
place.hot: Cold pages first
place.random: Random
ctl.dev: Expansion card
dev.a: Card A · ×8 DDR4 (measured)
dev.b: Card B · ×8 DDR5 (measured)
dev.d: Card D · ×16 DDR5 (measured)
dev.sw: Pool via switch (estimate)
read.q: Accesses landing on CXL
read.lat: Average idle latency
read.slow: Slower than all-local by
read.bw: Maximum bandwidth with both tiers
cv.x: Share of pages on CXL
cv.y: Average latency (ns)
cv.bw: Maximum bandwidth (GB/s)
say.none: All pages local: latency {lat}, bandwidth {bw}. Drag right to see how many pages can move before latency changes.
say.all: All pages on the expansion card: every access takes {lat}, and bandwidth is only this card's {bw}. Nobody would use it that way.
say.cheap: {p} of the pages are on CXL, but only *{q}* of the accesses land there: average latency is {lat}, only {slow} slower than all-local. Cold pages are hardly accessed, so where they sit makes little difference.
say.costly: {p} of the pages are on CXL, and {q} of the accesses land there: average latency is *{lat}*, {slow} slower than all-local. {why}
why.hot: Hot pages are now being pushed over too.
why.random: With random placement, the share of accesses equals the share of pages, so the unevenness of heat does not help.
:::

The default heat exponent is {zipfS} (**tuned parameter**), with {pages} pages in all. When the coldest half sits on card D, only {t50q} of the accesses land there, average latency is {t50lat} ns, and {t50slow} slower than all-local. Placing the same half at random sends {t50rq} of accesses there, at {t50rlat} ns. At 80%, the accesses landing on CXL are {t80q}, {t80slow} slower: by then the pages being moved are hot. The coldest {reach5} pages can move with latency rising by only 5%; if the unevenness of heat is halved, only {reach5h} can, and with the exponent at 1.2, {reach5s}.

Bandwidth is a separate account. If a program is limited by memory bandwidth, sending some accesses to an expansion card can be faster, because both tiers work at once: with 20% of the pages moved across, {tqq} of accesses go over CXL, and together the two tiers deliver at most {tqbw} GB/s, more than local alone. The best split sends {qBest} of the traffic over CXL, for a total of {bwBest} GB/s. The pool of chapter 6 adds one more switch hop (the designers estimate {estSwitch} ns for one read); choose “pool via switch” to see it: with the coldest half moved across, latency is {tSwSlow} higher.

The heat exponent is tuned; real programs' page heat changes over time. The latencies in the model are idle latencies; under load both tiers slow down. A rise in latency does not mean the program slows by the same amount, since out-of-order execution hides part of it. Pond measured performance within 1% to 5% of local-only on real cloud workloads (chapter 6). The bandwidth account assumes the program can split its accesses between the tiers in any ratio. {.take}

## Memory pooling and switches {#ch6}

::: strings
toc: Memory pooling and switches
:::

Put one large pool of memory between several machines, and give it to whichever machine needs it at the moment, so that each machine does not keep a spare for its own worst case. The price is an extra hop: a few tens of nanoseconds more if directly attached, and tens more through a switch. {.law}

In a neighbourhood where every household owns a car, each buys one for its own busiest day. Share a car pool, and the pool needs only enough cars for the busiest day of the whole neighbourhood, because the households' busiest days differ. The less the households' busy days are correlated, the more cars are saved; if everyone goes out on the same day, the pool saves not one car.

On cloud servers, memory is one of the most expensive parts and the easiest to strand: the cores are all rented out, and the memory left over cannot be rented. The Pond paper found, in Microsoft's production clusters, that {strandLo}% to {strandHi}% of memory sits idle this way when measured at the 95th percentile.

CXL 2.0 introduced memory pooling (figure 6). One expansion card can be divided into up to {mldMax} logical devices, given to different hosts; this is called multi-logical-device (MLD). A switch may sit between them, and from CXL 3.0 there may be several levels. The switch takes time: the designers estimate that a round trip is {swLo} to {swHi} ns more, and Pond says at least {pondSw} ns; a pool at rack scale adds more than {pondRack} ns over local memory.

::: diagram dg-pool keys=dg.pool
cap: Figure 6. CXL switch and memory pool (schematic). Pool memory is carved out for each host as needed and reclaimed after use; at any moment each block belongs to only one host. Latency is Das Sharma et al.'s estimate.
aria: Diagram: a row of four hosts at the top, each connected to a CXL switch in the middle. Under the switch, a memory pool is divided into blocks given to different hosts, with one block free.
host: Host {i}
sw: CXL switch
swLat: +{lo}–{hi} ns (round trip)
dev: Memory pool (multi-logical device)
ld: To host {i}
free: Free
:::

::: lab ch6-model
model.title: Model 5 · How much memory a set of hosts saves by sharing a pool
model.how: Drag the **number of hosts** and the **correlation of their demands**. Each host's demand fluctuates at random. Without sharing, each host provisions memory for its own 99th percentile. With sharing, each host provisions only the average; the excess comes from the pool, which is sized to the 99th percentile of the hosts' combined overflow.
model.aria: Two bars: total memory to provision without sharing, and local plus pool memory with sharing. Another line shows which extra-latency tier applies.
ctl.n: Number of hosts
ctl.rho: Correlation of demands
read.saved: Memory saved
read.pool: Pool size (multiple of one host's average demand)
read.own: One host's 99th percentile
read.add: Extra latency over local
cv.without: Each host provisions its own
cv.with: Local + pool
add.none: None
add.mld: about {v} ns (direct-attached)
add.switch: about {v} ns (via switch)
say.one: With one host there is nothing to share: it must provision to its own 99th percentile, {own} times its average demand.
say.mld: {N} hosts sharing one directly attached multi-logical-device: *{saved}* less memory provisioned in total, with the pool {pool} times one host's average demand. Each access to the pool costs about {add} ns more.
say.switch: {N} hosts exceed the {max} logical devices of one multi-logical-device, so they must go through a switch: *{saved}* saved, but each access to the pool costs about {add} ns more. Beyond this point, adding hosts saves less and less, while the cost jumps a step.
:::

The fluctuation of each host's demand is taken with a coefficient of variation of {poolCv}, and a correlation between hosts of {poolRho}; both are **tuned parameters**. Sharing among 8 hosts saves {p8}, among 16 {p16}, among 64 {p64}. The savings soon stop growing with the number of hosts, because the fluctuation the hosts have in common cannot be pooled away. If the hosts are completely uncorrelated, 16 of them save {p16i}; if they rise and fall together, nothing is saved ({p16c}). With the fluctuation halved, 16 hosts save {p16h}; doubled, {p16d}.

Real figures are much smaller. Pond, on Microsoft's workloads, found that sharing among 16 to 32 sockets cuts memory demand by {pondSave}%. With a scheduler that chooses carefully when to use the pool, memory cost falls by {pondCost}%, and performance stays within {perfLo}% to {perfHi}% of all-local memory. Where does the model differ? Virtual machines come in fixed sizes, not as smooth random numbers; and cloud providers do not, in any case, give each machine a worst-case allowance. But the shape matches: a few hosts sharing already gets most of the benefit, which is why Pond argues for small pools of 8 to 16 sockets, without a switch. Choosing “pool via switch” in the chapter 5 model shows the cost of the extra hop.

Memory outside the chassis, with cables to several machines, also raises security. CXL 2.0 added link encryption and integrity protection (IDE, integrity and data encryption): frames of CXL.cache and CXL.mem are encrypted on the link and carry a check code, while CXL.io uses PCIe's own scheme. It defends against eavesdropping and tampering on the wire, not against the device itself.

The demand distribution, the correlation and the rule “provision the local tier at the average” are chosen for ease of computation; the pool is sized to the 99th percentile; fragmentation and allocation granularity are not counted; latency takes only the midpoint of the estimate range. {.take}

## Several hosts, one line: back-invalidate {#ch7}

::: strings
toc: Several hosts, one line: back-invalidate
:::

A memory pool gives each host its own block to use alone; shared memory lets several hosts cache the same line. Then someone has to record who holds it, and when a write happens, tell the others to invalidate. CXL 3.0 lets the memory device do the recording and the notifying itself. {.law}

When a group shares one notebook, each person copies a page onto their own desk. If someone changes a page, everyone who copied that page must be told to discard their copy. The more copies and the more often the changes, the more notices. If the page is only read and never changed, it does not matter how many copies there are.

CXL 3.0's approach is to let the memory device keep a directory, recording for each line who is sharing it and who has it exclusively. This is the same idea as the directory protocol within one chip (<a href='../how-cores-share-memory/#ch4'>Chapter 4 of “How Cores Share Memory”</a>, which has the bookkeeping of how many bits the list takes). The difference is that the “cores” this time are separate hosts, and to notify them it uses two new channels added to CXL.mem: the device sends <code>BISnp</code>, and the host replies <code>BIRsp</code>. The survey's example (figure 7): hosts 1 and 3 both share line X, and host 4 wants it exclusively. The device first sends a back-invalidate to each of hosts 1 and 3, waits until both confirmations have come back, and only then hands X to host 4.

::: diagram dg-bi keys=dg.bi
cap: Figure 7. One back-invalidate hand-over (schematic, after figure 17b of Das Sharma et al.'s survey). The directory on the device records that X is shared by hosts 1 and 3. Host 4 wants it exclusively, so the device invalidates the two copies first, then hands over the data.
aria: Diagram: a sequence chart with four vertical lines: host 1, host 3, the memory device and host 4. Host 4 asks the device for X exclusively. The device sends a back-invalidate to host 1 and to host 3; they reply with confirmations; the device updates its directory and then hands the data to host 4.
h1: Host 1
h3: Host 3
dev: Memory device (directory)
h4: Host 4
req: ① Want X exclusively
snp: ② BISnp invalidate
rsp: ③ BIRsp confirm
data: ④ Data + exclusive
dirA: Directory: X shared by hosts 1, 3
dirB: Directory: X exclusive to host 4
:::

How large can it grow? CXL 3.0 added port-based routing with a {pbrBits}-bit identifier, so one network can hold up to {gfd} nodes. A kind of device called Global Fabric-Attached Memory (GFAM) can let that many nodes access it at once, whereas multi-logical devices reach only {mldNodes}. Being able to access is one thing; hardware guaranteeing that they all stay coherent is another, and the model below looks at that cost.

::: lab ch7-model
model.title: Model 6 · The back-invalidates a shared memory device's directory must send
model.how: Choose the **number of hosts**, the **share of accesses that are writes**, and the **directory size** (relative to the number of lines in the shared region). Each access is a random host reading or writing a random line in the shared region. The directory sends invalidations by the rules; when it is full, it evicts the least recently used entry and invalidates all of that entry's holders.
model.aria: Bar chart: per 1,000 accesses, the back-invalidates sent, split into three parts by cause: writes, reads of lines held exclusively, and a full directory.
cv.write: Caused by writes
cv.read: Caused by reads of exclusive lines
cv.cap: Caused by a full directory
ctl.h: Number of hosts
ctl.w: Share of writes
ctl.cap: Directory size
cap.0.25: A quarter
cap.0.5: Half
cap.1: Exactly
cap.2: Twice
read.bi: Back-invalidates per 1,000 accesses
read.fan: Average hosts notified per invalidation
read.wait: Writes that wait for invalidations
read.cap: Of which caused by a full directory
say.alone: With only one host there is no one else to notify: no back-invalidate is needed.
say.ro: Read only: all {H} hosts cache the same lines, and no back-invalidate is needed (if the directory is large enough). For data that is read far more often than written, hardware coherence is good value.
say.write: {H} hosts, with {w} of accesses being writes: per 1,000 accesses, *{bi} back-invalidates* must be sent. {wait} of the writes must wait for others to invalidate first, and each invalidation notifies {fan} hosts on average.
say.cap: The directory is too small: even with no writes, per 1,000 accesses *{capbi} back-invalidates* are sent because old entries get evicted (out of {bi} in all), and each evicted line must be fetched again next time.
:::

With read only and a large enough directory, 16 hosts send {dRO} back-invalidates per 1,000 accesses: none at all. That is why read-heavy data suits hardware coherence, as the survey also says. With writes at 5%, 16 hosts must send {dW5}, notifying {dW5fan} hosts on average per invalidation; 4 hosts give {dW5h4} and {dW5h4fan}. At 20% writes, it is {dW20}, and {dW20share} of the writes must wait for others to invalidate. With a directory only half the needed size, even read-only traffic sends {dCap}, all caused by evicting old entries.

So cross-machine hardware coherence suits data that many read and few write: the indexes of large databases, logs, model parameters. Data that is changed often and shared is better kept in one machine, or synchronised by software (as UALink in chapter 10 and RDMA between machines both do).

Accesses are spread evenly over the shared region, hosts do not drop lines on their own, and latency is not counted; the {dirW}-line shared region and the directory organisation are chosen for ease of computation. A real device might track by page and use coarser lists, at the cost of sending more invalidations. {.take}

## NVLink and NVSwitch: 72 GPUs working as one {#ch8}

::: strings
toc: NVLink and NVSwitch
:::

GPUs need to exchange far more data than PCIe can carry, so NVIDIA built its own wider link, NVLink, and uses NVSwitch to connect every GPU in a rack to every other. {.law}

One GPU cannot hold a large model, so during training dozens or hundreds of cards must keep exchanging data (chapter 9). PCIe 5.0 ×16 moves {pcie16} GB/s per direction, which is too narrow for GPUs. NVIDIA's NVLink is its own point-to-point link, and one GPU has many of them. Vendors publish figures that add both directions together; this page converts them to per-direction figures, and says so, in the table.

::: html ch8-html
th.gen: Gen
th.arch: GPU architecture
th.bidir: Per GPU, both ways
th.links: Links
th.perLink: Per link, each way
th.domain: Max GPUs per domain
:::

NVLink 4 (Hopper, H100) gives one GPU {nv4} GB/s (both directions), over {nv4l} links, {nv4pl} GB/s per link per direction. NVLink 5 (Blackwell) gives {nv5} GB/s, again over {nv4l} links, {nv5pl} GB/s per link per direction. NVLink 6 (Rubin, which the vendor marks as preliminary specifications) gives {nv6} GB/s over {nv6l} links; NVIDIA does not publish a per-link rate, and dividing the total by the number of links gives about {nv6pl} GB/s per link per direction on average. NVLink 5 gives {nv5d} GB/s per direction, which is {nvVsPcie} times PCIe 5.0 ×16.

A wide link is not enough: every card must also talk to every other at full speed. NVSwitch is a dedicated switch chip, placed in the switch trays in the middle of the rack, and each NVLink of each GPU connects to one of these switch chips (figure 8). A GB200 NVL72 rack holds 72 Blackwell GPUs, all connected to each other. NVIDIA's published total bandwidth is {agg5} TB/s, which is exactly 72 times 1.8 TB/s per GPU ({agg5c}); the Vera Rubin NVL72 is {agg6} TB/s ({agg6c}). These 72 cards form one “NVLink domain”. NVIDIA's Grace Hopper architecture article says NVLink lets one GPU use ordinary reads, writes and atomic operations directly on another GPU's memory; software must first map the other GPU's memory into its own address space.

::: diagram dg-nvl keys=dg.nvl
cap: Figure 8. An NVL72-style scale-up domain, and the scale-out network between racks (schematic, not to scale; only a few trays are drawn). Each GPU in the domain sends {nv5d} GB/s per direction; out of the domain, through its NIC, {nic400}–{nic800} GB/s per GPU.
aria: Diagram: on the left, one rack. Its 72 GPUs sit in compute trays, each connected to a central NVLink switch tray; this is the scale-up domain. On the right, several such racks are joined through network cards and Ethernet or InfiniBand switches; this is scale-out.
rack: One rack = one NVLink domain
tray: Compute tray
gpu: GPU
sw: NVLink switch tray
up: Scale-up: {bw} GB/s per GPU each way
out: Scale-out: {lo}–{hi} GB/s per GPU each way
net: Ethernet / InfiniBand switch
nic: NIC
more: More racks
:::

The cost of moving data off the chip, and why HBM is packaged with the GPU, is covered in <a href='../why-compute-waits-for-memory/#ch9'>Chapter 9 of “Why Compute Waits for Memory”</a>. Here remember just one number: inside the domain, one GPU can send {nv5d} GB/s per direction; out of the domain, through its NIC, only {nic400} to {nic800} GB/s remain (chapter 10).

The table gives vendors' peak figures; the NVLink 6 figures are preliminary specifications, and NVIDIA's regional web pages do not yet agree on them (chapter 12). The largest domain is as NVIDIA's NVLink page gives it; for the Hopper generation NVIDIA also described an NVLink Switch System that joined 256 Grace Hopper superchips in one NVLink domain (Grace Hopper architecture article). NVLink's protocol details are not public, so this page does not describe its on-wire format. {.take}

::: strings
gen: NVLink {g}
genPre: NVLink {g} (preliminary)
approx: ≈ {v}
domain: {n} GPUs
:::

## All-reduce: how gradients are added up across dozens of GPUs {#ch9}

::: strings
toc: All-reduce: how gradients are added up
:::

Each step of data-parallel training requires every GPU to add its gradients to everyone else's and end up with a copy of the sum. A ring all-reduce has each GPU send only about twice the gradient data, however many GPUs there are; so the time taken depends on each GPU's bandwidth, not on the number of GPUs. {.law}

Several people each keep their own ledger, and everyone needs the total. The clumsiest way is to hand everything to one person to add up, whose desk is then buried. A smarter way: each person splits their ledger into sections and they sit in a ring; each person passes one section to the right, and the person on the right adds their own section and passes it on. After a round and a half, every section has been summed and has reached everyone, and each person has sent out about two ledgers' worth.

This is the bandwidth-optimal all-reduce that Patarasuk and Yuan proved in 2009 (figure 9). N GPUs each cut their data into N chunks. **First, reduce-scatter**: N − 1 steps, in each of which every GPU sends one chunk to the next, which adds it to its own chunk of the same index; afterwards each GPU holds one chunk that is fully summed. **Then all-gather**: another N − 1 steps pass the summed chunks along the ring. Each GPU sends 2(N − 1) chunks in all, each 1/N of the data. They proved that any all-reduce algorithm must have at least one GPU send this much data.

::: diagram dg-ring keys=dg.ring
cap: Figure 9. Ring all-reduce with 4 GPUs (schematic). The first panel is reduce-scatter: after 3 steps each GPU holds one fully summed chunk. The second is all-gather: 3 more steps put a copy in everyone's hands. Each GPU sends 6 chunks in all, each a quarter of the data.
aria: Diagram: four GPUs form a ring, each holding four chunks of data. The top half shows the first step of reduce-scatter, where each GPU sends a chunk to the next to be added. The bottom half is all-gather, where the summed chunks keep moving on.
gpu: GPU {g}
rs: Reduce-scatter: send, neighbour adds
ag: All-gather: send, neighbour copies
chunk: Chunk
sum: Summed
:::

::: lab ch9-model
model.title: Model 7 · Step through a ring all-reduce
model.how: Choose the **number of GPUs**, then press **Next step**. Each row of the table is a GPU, and each cell is one chunk it holds. Gold cells were just received in this step; cyan cells are fully summed.
ctl.n: Number of GPUs
btn.step: Next step
btn.all: Run to end
btn.reset: Restart
table.aria: The value of each chunk held by each GPU
read.step: Steps taken
read.sent: Sent by each GPU (as a share of the total data)
read.phase: Phase
:::

With {ringN} GPUs, the ring takes {ringSteps} steps. With more GPUs, the total each one sends is 2(N − 1)/N times the data, getting ever closer to two; but the number of steps grows with the GPU count, so the fixed cost of each step (start-up, synchronisation) becomes more noticeable.

::: lab ch9-lab
model2.title: Model 8 · How long one gradient all-reduce takes
model2.how: Choose the **model size** and the **number of GPUs**. Each bar is the time the same all-reduce takes on a different link, computed as 2(N − 1)/N × data ÷ per-direction bandwidth, plus the fixed cost of 2(N − 1) steps.
model2.aria: Horizontal bar chart: the time for the same all-reduce over PCIe 5.0, NVLink 4, 5 and 6, and 400 and 800 Gb/s networks.
ctl.params: Model size
p.1e9: 1 billion parameters
p.8e9: 8 billion parameters
p.70e9: 70 billion parameters
p.405e9: 405 billion parameters
ctl.ar.n: Number of GPUs
read.S: Gradients (BF16, 2 bytes per parameter)
read.per: Each GPU sends
read.nv5: On NVLink 5
read.net: On a 400 Gb/s network
gpu: GPU {g}
chunk: Chunk {c}
phase.start: Start
phase.rs: Reduce-scatter
phase.ag: All-gather
phase.done: Done
say.start: Each GPU holds {N} chunks of data. Press “Next step”: every GPU sends one chunk to the next at the same time.
say.rs: Reduce-scatter step {k}: each GPU adds its chunk into the same chunk of the next GPU. Each GPU has now sent {sent} of the total data.
say.rsdone: Reduce-scatter is complete: each GPU now holds one chunk that is the sum of all {N} GPUs (cyan). Next, the summed chunks are passed along.
say.ag: All-gather step {k}: the summed chunks have moved one more place along the ring. Each GPU has now sent {sent} of the total data.
say.done: Done: every chunk on every GPU is the total {total}. Each GPU has sent {steps} chunks in all, which is {sent} of the total data.
fab.pcie5: PCIe 5.0 ×16
fab.nv4: NVLink 4
fab.nv5: NVLink 5
fab.nv6: NVLink 6
fab.ib400: Network 400 Gb/s
fab.ib800: Network 800 Gb/s
say.bw: {params}, {N} GPUs: each GPU sends {per}. On NVLink 5 it takes *{nv5}*; on the 400 Gb/s network, {net}, a ratio of {ratio} times. Almost all of the time is spent moving bytes, and the fixed cost is only a small part.
:::

For an 8-billion-parameter model, the BF16 gradients are {arS} GB. An all-reduce over 72 GPUs has each GPU send {arPer} GB: {arNv5} ms on NVLink 5, {arNv6} ms on NVLink 6. Over PCIe 5.0 ×16 it would take {arPc} ms, and over a 400 Gb/s network per GPU, {arIb} ms. An 8-H100 box on NVLink 4 takes {ar8nv4} ms. For a 70-billion-parameter model over 72 GPUs: {ar70} ms on NVLink 5, and {ar70ib} s over the network.

The fixed cost per step is a **tuned parameter**: NVLink {alphaNv} µs, PCIe {alphaPc} µs, network {alphaNet} µs. For large models it hardly matters: for 70 billion parameters over the network, the fixed costs total {ar70lat} ms, and doubling them would not show. Even for 1 billion parameters on 8 GPUs, moving the bytes on NVLink 5 takes {a1bw} ms, while the fixed costs are only {a1lat} ms. The size at which the two are equal is “GPUs × fixed cost per step × bandwidth”: for 72 GPUs on NVLink 5 that is {arEq} MB. For messages smaller than this, the fixed cost of 2(N − 1) steps dominates, and a method with fewer steps is better; letting the switch do the adding, described below, is one such method. NVSwitch can also do the adding itself: NVIDIA's NVLink page says each switch chip has a SHARP engine that performs reduction and multicast inside the network. The switch does the adding for everyone, so each GPU sends one copy and receives one back, and the data moved is roughly halved.

In real training, the exchange of gradients overlaps with computation, and many training runs also shard the model and optimiser state across GPUs (then reduce-scatter and all-gather are used; the byte counts are the same). The model assumes the ring uses each GPU's full bandwidth; the PCIe row assumes each GPU has a ×16 to itself and no detour through host memory. {.take}

## Scale-up, scale-out and UALink {#ch10}

::: strings
toc: Scale-up, scale-out and UALink
:::

Inside one domain, GPUs talk by reading and writing each other's memory, at several hundred to over a thousand GB/s per GPU in each direction. Between domains, network cards send messages, at around 100 GB/s per GPU. The good design keeps most bytes inside the domain and hands only a small part to the network. {.law}

**Scale-up** means making many chips into one “machine”: inside one NVLink domain, a GPU can read and write another GPU's memory directly, across one switch hop. **Scale-out** means linking many such machines with a network, InfiniBand or Ethernet, where network cards write data straight into the other side's memory with RDMA (<a href='../storage-over-a-network/#ch6'>Chapter 6 of “Drives Across a Wire”</a>). But that is a series of messages, not a stream of reads and writes, and it does not guarantee cache coherence.

The bandwidth of the two layers differs by an order of magnitude, so the all-reduce is done in two layers. First, reduce-scatter inside each domain, so that each GPU holds one chunk summed within its domain. Then the GPUs in different domains that hold the same chunk run a ring all-reduce on it across the network. Finally, all-gather inside each domain. The bytes that leave a domain are only 1/G of the original, where G is the number of GPUs in a domain. This is still the formula of chapter 9, applied twice.

::: lab ch10-model
model.title: Model 9 · Two-level all-reduce: the bigger the domain, the fewer bytes on the network
model.how: Choose the **total number of GPUs**, the **GPUs per domain**, the **NIC speed** and the **model size**. The bars split the time into inside-domain (NVLink 5) and across-domain (network). The bottom bar is a flat ring with no layering, all over the network.
model.aria: Horizontal bar chart: the inside-domain time, the across-domain time of the two-level all-reduce, and the time of a flat ring that goes entirely over the network.
cv.up: Inside domain, NVLink
cv.out: Across domains, network
ctl.total: Total GPUs
ctl.g: GPUs per domain
ctl.nic: NIC per GPU
ctl.params: Model size
read.t: Two-level all-reduce
read.up: of which inside the domain
read.out: of which across domains
read.flat: Flat, all over the network
g: {n} GPUs
cv.flat: All over the network
cv.hier: Two-level
cv.hierG: Two-level · {g} GPUs per domain
say.up: {N} GPUs in {R} domains of {G}: in total *{t}*, most of it inside the domains ({up}), with only {out} on the network. That is {x} times faster than all over the network ({flat}).
say.out: {N} GPUs in {R} domains of {G}: in total *{t}*, and the network part ({out}) is longer than the inside-domain part ({up}). The domains are too small, so many bytes still leave them. All over the network it is {flat}.
:::

9,216 GPUs, 70 billion parameters, a 400 Gb/s NIC per GPU: with 72-GPU domains the two-level all-reduce takes {h1} s, of which {hUp1} s is inside the domains and only {hOut1} s on the network; with 8-GPU domains it takes {h8} s; a flat ring over the network takes {hFlat} s, {hSpeed} times slower. This is why everyone wants bigger scale-up domains: NVL72 went from 8 GPUs per domain to 72, and UALink aims for 1,024.

**UALink** is an open standard, developed by a consortium that includes AMD, Intel, Google, Microsoft and Meta, to rival NVLink. Version 1.0 was released on 8 April 2025: {ualLane} GT/s per lane (on the wire, {ualSig} GT/s, the extra being the error-correction coding of the Ethernet physical layer); links of 1, 2 or 4 lanes, and a group of 4 lanes gives {ualSt} GB/s per direction; one domain holds up to {ualMax} accelerators, each with a {ualBits}-bit identifier. The transaction layer's {ualTl}-byte frames are carried in the data link layer's {ualDl}-byte frames, and the physical layer borrows Ethernet. The protocol is direct reads, writes and atomic operations; its white paper and press release do not mention cache coherence of the kind that CXL.cache provides.

The division of labour is now clear. CXL is centred on the CPU, runs on PCIe's physical layer, and the host keeps coherence. NVLink is NVIDIA's own link between accelerators. UALink is an open link between accelerators, running on Ethernet's physical layer. Between racks, scale-out uses InfiniBand, or Ultra Ethernet, which is Ethernet redesigned for AI (<a href='../storage-over-a-network/#ch10'>Chapter 10 of “Drives Across a Wire”</a>).

The model assumes both levels are rings, NVLink 5 inside the domain, one NIC per GPU, and no network congestion (how flows are spread over many paths and why they collide: <a href='../how-a-nic-moves-packets/#ch12'>Chapter 12 of “How a Network Card Moves Packets”</a>). Real collective libraries choose trees, rings or in-switch reduction depending on the topology. The fixed costs are the values tuned in chapter 9. {.take}

## Coherence inside a package: MI300A and Grace Hopper {#ch11}

::: strings
toc: Coherence inside a package
:::

The shortest wire is the one inside the package. Packaging a CPU and a GPU together lets them connect far more widely than PCIe does; taken to the extreme, the two share one physical memory, and the copy of chapter 1 never has to happen. {.law}

AMD's MI300A goes furthest (figure 10, right). {miCores} Zen 4 CPU cores are spread over {miCcd} CPU chiplets, and {miXcd} GPU compute chiplets carry {miCu} compute units each, {miCus} in all. Underneath is a base die with {miIc} MB of Infinity Cache, and around it sit {miHbm} GB of HBM3, with a peak of {miTb} TB/s. The CPU and GPU share these {miHbm} GB coherently: there is only one copy of the memory, and nothing has to be moved from one to the other. For how the chiplets are wired together, see <a href='../how-a-computer-is-wired/#ch7'>Chapter 7 of “How the Parts of a Computer Are Wired Together”</a>.

NVIDIA's Grace Hopper takes another approach (figure 10, left). The Grace CPU carries up to {ghLp} GB of LPDDR5X (up to {ghLpBw} GB/s), and the Hopper GPU up to {ghHbm} GB of HBM3 (up to {ghHbmBw} GB/s). The two chips are joined by NVLink-C2C, {ghC2c} GB/s in total, or {ghC2cDir} GB/s per direction, which is {ghVs} times the two directions of PCIe 5.0 ×16 combined (NVIDIA says 7 times). This link is hardware coherent: the CPU can cache the GPU's memory line by line, the CPU and GPU share one page table, and GPU threads can use a pointer returned by malloc directly. At {ghPj} pJ per bit, running at full speed in both directions, it draws about {ghW} W.

::: diagram dg-pkg keys=dg.pkg
cap: Figure 10. Two kinds of coherence inside a package (schematic, not to scale). Grace Hopper: two chips, each with its own memory, joined by one coherent NVLink-C2C link. MI300A: the CPU and GPU chiplets share the same HBM3. The figures come from NVIDIA's and AMD's published material (chapter 11 text).
aria: Diagram: on the left, Grace Hopper. The Grace CPU is connected to LPDDR5X, the Hopper GPU to HBM3, and an NVLink-C2C link joins the two. On the right, MI300A: three CPU chiplets and six GPU chiplets sit in one package, on a base die with Infinity Cache, with shared HBM3 around the edges.
gh: Grace Hopper
grace: Grace CPU
hopper: Hopper GPU
lp: LPDDR5X {gb} GB
hbm: HBM3 {gb} GB
c2c: NVLink-C2C {bw} GB/s (total)
mi: MI300A
ccd: CPU chiplet
xcd: GPU chiplet
base: Base die · Infinity Cache {mb} MB
shared: Shared HBM3 {gb} GB · {tb} TB/s
:::

The two designs answer the same question: the “copy or share” curve of chapter 1. The wider the link and the shorter the round trip, the further right the crossing moves, and the wider the range where sharing wins; with one physical memory there is no crossing at all. The price is flexibility: the CPU-to-GPU ratio is fixed at packaging time, and memory cannot be added separately.

The Grace Hopper figures come from NVIDIA's architecture article of November 2022; memory specifications have changed in later versions. No public figure has been found for the round-trip latency of NVLink-C2C, so the model in chapter 1 has no option for it. {.take}

## Where the frontier is (November 2026) {#ch12}

::: strings
toc: Where the frontier is (November 2026)
:::

The specifications are ahead of the products. CXL has reached 4.0, while servers on the market use 2.0 memory expansion. On the GPU side, scale-up domains keep growing; the open standard UALink has two versions of its specification, but the products are still on their way. {.law}

What follows is in three groups: principles and specifications that are settled; things that have shipped or been publicly demonstrated (who, and when); and vendors' plans and claims.

::: html ch12-html
h.est: Settled
:::

- Ring all-reduce is bandwidth-optimal: each GPU must send at least 2(N − 1)/N times the data (Patarasuk and Yuan, 2009). {#e1}
- The CXL 3.0 specification (August 2022) defined back-invalidate, multi-level switching and networks of up to {gfd} nodes. CXL 2.0 (November 2020) defined memory pooling and link encryption. {#e2}

::: html ch12-html-2
h.demo: Shipped or demonstrated
:::

- Intel Xeon 6 supports adding memory with CXL Type 3 devices, and offers a hardware-managed “flat memory mode”: local memory and CXL memory are paired one to one, and hot lines move to local memory automatically (Intel technical paper). {#d1}
- The measured latency of the first CXL 1.1 memory-expansion cards is {aLat} to {cLatDev} ns, against {locLat} ns for local memory (Liu et al., 22 September 2024). {#d2}
- The ConnectX-8 network card ({cx8} Gb/s each) is in volume production, fitted to GB300 NVL72 and HGX B300 systems (NVIDIA, 18 May 2025). {#d3}
- Vera Rubin NVL72: 72 Rubin GPUs, each with {rubHbm} GB of HBM4, NVLink 6 at {rubGpu} GB/s per GPU, and {rubAgg} TB/s for the rack (marked preliminary; these are the figures on NVIDIA's US NVLink and product pages, while the UK and European versions of the same NVLink page still give {rubGpuOld} GB/s and {rubAggOld} TB/s). NVIDIA's product page says it is “ramping into full production”, and Taiwanese server makers have begun shipping to customers (checked 15 November 2026). {#d4}

::: html ch12-html-3
h.claim: Plans and claims
:::

- The CXL 4.0 specification was published on 18 November 2025: {cxl4gts} GT/s (built on PCIe 7.0), several ports bundled into one logical port, and up to {cxl4ret} retimers. At the time of checking, no shipping CXL 4.0 product had been found. {#c1}
- The UALink 2.0 specification was published on 7 April 2026, adding in-network computing and chiplet specifications. The consortium chair says products are expected in 2027; on its earnings call of 5 May 2026, Astera Labs said it plans to deploy its UALink switch chips from 2027. At the time of checking, no UALink product had shipped. {#c2}
- Co-packaged optics: on 18 March 2025 NVIDIA announced Quantum-X Photonics (InfiniBand switches with {cpoPorts} ports of {cpoGbps} Gb/s, then described as “later this year”) and Spectrum-X Photonics (Ethernet, 2026), claiming 3.5 times the energy efficiency. Whether they shipped on schedule has not been checked for this page. {#c3}

For the next step to happen, several things must hold. CXL memory must be cheap enough to justify one more hop. Operating-system and hardware hot/cold tiering must be accurate enough. Hardware coherence across machines must find data that is read often, written seldom, and worth sharing. And as scale-up domains keep growing, the distance and power of copper must be solved, which is what co-packaged optics aims to do. For newer HBM and compute-in-memory, see <a href='../why-compute-waits-for-memory/#ch10'>Chapter 10 of “Why Compute Waits for Memory”</a>.

Dates and product status go out of date. This chapter's figures are gathered in SRC and FRONTIER in models.js, with dates given, to make updating easier. {.take}

## Three questions for any interconnect {#ch13}

::: strings
toc: Three questions for any interconnect
:::

The next time you read about a new chip, a new interconnect or a new “supernode”, ask these three questions. {.law}

{.plain .qs}
1. **What is shared?** Is it data copied across (DMA), a line-by-line read and write that stays coherent (CXL.cache, NVLink-C2C), or simply the same physical memory (MI300A)? This decides whether the curve of chapter 1 has a crossing at all. {#q1}
2. **How many GB/s per chip in each direction, and how many nanoseconds for a round trip?** Check whether the vendor's figure adds both directions together. Bandwidth decides how long an all-reduce takes (chapter 9); round-trip time decides how long a line-by-line read takes (chapters 1 and 5). {#q2}
3. **Who is responsible for coherence?** The host's home agent (CXL), a directory on the device (shared memory in CXL 3.0), or no hardware coherence at all, with software doing the synchronisation (UALink, RDMA)? Whoever is responsible must keep the list and send the invalidations, and the more writes there are, the more it costs (chapter 7). {#q3}

Related essays: <a href='../how-cores-share-memory/'>“How Cores Share Memory”</a> (coherence within one chip), <a href='../how-pcie-works/'>“Why PCIe Keeps Doubling”</a> (the wire under CXL), <a href='../how-memory-talks/'>“How Memory Talks to the CPU”</a> (the DDR module side), <a href='../how-a-computer-is-wired/'>“How the Parts of a Computer Are Wired Together”</a> (NUMA, chiplets), <a href='../why-compute-waits-for-memory/'>“Why Compute Waits for Memory”</a> (HBM and the energy of moving data), <a href='../how-virtual-memory-works/'>“How Virtual Memory Works”</a> (demoting cold pages). {#links style="margin-top:2em"}

::: footer
**Sources.** D. Das Sharma, R. Blankenship and D. S. Berger, An Introduction to the Compute Express Link (CXL) Interconnect (arXiv 2306.11227, 2023; ACM Computing Surveys 2024): protocols, frames, device types and back-invalidate in sections 3–5, latency in section 6.1, the estimates in table 2, and bandwidth in section 6.3. CXL Consortium, CXL 3.0 white paper and webinar slides, and CXL 4.0 white paper (November 2025). J. Liu, H. Hadian, H. Xu, D. S. Berger and H. Li, Dissecting CXL Memory Performance at Scale (arXiv 2409.14317, 2024), table 1. H. Li et al., Pond: CXL-Based Memory Pooling Systems for Cloud Platforms (ASPLOS 2023). Y. Sun et al., Demystifying CXL Memory with Genuine CXL-Ready Systems and Devices (MICRO 2023). Intel, The Advantages of Managing the CXL Memory Tier in Hardware (Xeon 6 flat memory mode). NVIDIA: the NVLink and NVLink Switch product page, the Vera Rubin NVL72 product page, the Grace Hopper architecture article (November 2022), the ConnectX-8 article (May 2025), and the Spectrum-X / Quantum-X Photonics press release (March 2025). AMD, Instinct MI300A data sheet. UALink Consortium, 1.0 specification press release and white paper (April 2025), and 2.0 specification news (April 2026). P. Patarasuk and X. Yuan, Bandwidth Optimal All-reduce Algorithms for Clusters of Workstations (J. Parallel Distrib. Comput. 69, 2009). The URL and access date for each item are in BRIEF.md in this directory.

This page was written by an AI (Claude) as part of the bus series. The models are real mechanisms at a smaller scale; values marked “tuned parameter” were chosen so the models can be computed. This page explains mechanisms only and does not judge products.
:::
