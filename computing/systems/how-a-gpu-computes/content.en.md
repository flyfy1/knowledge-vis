---
lang: en
title: How a GPU Computes · a long essay you can play with
desc: A GPU has tens of thousands of "cores", each far simpler than a CPU core. How does it split an image or a matrix multiply across so many of them at once? Why can the same code run several times slower on a GPU after a small change in how it is written? Ten hands-on models: caches versus more threads as two ways to hide latency, mapping an image onto a grid of blocks and warps, a cycle-by-cycle warp scheduler, how many warps one H100 SM can hold, branch divergence, memory coalescing, shared-memory bank conflicts, two roofs for a tiled matrix multiply, tensor-core peaks across number formats, and rasterising a triangle into 2×2 pixel quads.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.cyc: {v} cycles
u.tf: {v} TFLOPS
u.tbs: {v} TB/s
u.kb: {v} KB
u.none: —
u.flopb: {v} FLOP/byte
:::

# How a GPU Computes {#hero}

::: strings
kicker: Computing · Systems · a long essay you can play with
:::

A GPU has tens of thousands of “cores”, each far simpler than a CPU core.<br>How does it split an image or a matrix multiply across all of them at once? {.sub}

A second question follows: **why can the same code run several times slower after a small change in how it is written?** First we look at where a GPU spends its transistors, then at how an image is split into two million threads, handed out in groups of 32. Next, how the scheduler hides waits of hundreds of cycles by keeping many warps around, how many warps one SM can hold, and the three things that make code slow: a warp that takes two paths, addresses that are not next to each other, and bank conflicts in shared memory. Last, how matrix multiply is tiled, how a tensor core computes a small block in one instruction, how drawing a frame runs on the same machine, and the frontier. **Every model is a real rule run at small scale**: thread numbering and warp grouping from the CUDA Programming Guide, a cycle-by-cycle warp scheduler, H100 resource limits from NVIDIA's tuning guide, memory access counted in 32-byte sectors and 32 banks, and the roofline model. {.lead}

An AI wrote this page. Hardware parameters come from NVIDIA's CUDA Programming Guide, Best Practices Guide, Hopper Tuning Guide and product pages, AMD's HIP documentation, and public measurements (Luo et al.'s Hopper microbenchmarks, Chips and Cheese). Each gives its source and date. **Values marked “tuned parameter” were chosen so the models could compute, not measured.** Vendor peaks are theoretical ceilings, not benchmark scores. This page covers mechanisms only and **does not compare which card is better or worth buying**. {.note}

## Two ways to spend transistors {#ch1}

::: strings
toc: Two ways to spend transistors
:::

A CPU spends its area on making one thread wait less: big caches, branch prediction, out-of-order execution. A GPU spends its area on keeping many threads alive at once: when one thread waits, another takes over. {.law}

One person washing a large basin of bowls is only as fast as their hands, and while waiting for hot water they can only stand there. What they can do is move the kettle closer, or start boiling the next pot early. Ten people washing together do not mind who is waiting for water, because someone always has a bowl in hand. The first is the CPU's approach, the second is the GPU's.

An NVIDIA H100 (SXM5) has {h100sm} **SMs** (streaming multiprocessors). Each SM has {h100lanes} 32-bit floating-point lanes, {h100cores} in total, which the vendor calls “CUDA cores”. That is where the “tens of thousands of cores” comes from. But they are not CPU cores: a lane has no fetch or decode unit of its own, no branch prediction, and no out-of-order execution. It is one slot in a wide vector. What corresponds to a CPU core is the SM: it fetches, decodes and schedules, and each of its {scheds} partitions runs one instruction across 32 lanes every cycle. Each SM has a {regKB} KB register file, as large as its L1 and shared memory together ({l1KB} KB). That does not mean a GPU thread gets more registers; the opposite is true. A program on x86-64 sees about {cpuRegKB} KB of registers ({x86gpr} 64-bit general-purpose registers and {x86vec} {x86vecBits}-bit vector registers), while a CUDA thread may use at most {maxRegs} 32-bit registers, about {gpuRegMaxB} bytes, and when an SM is full with {thrSm} threads each gets only {gpuRegFull}, or {gpuRegFullB} bytes. (Both figures count the registers a program can name; a CPU core also has physical registers for out-of-order execution that programs never see, which this comparison leaves out.) The GPU's register file is large because it holds thousands of threads at once, and every one of them keeps its registers on chip the whole time.

::: diagram dg-die keys=dg.die
cap: Where the area goes. On the left, one CPU core: large caches, branch prediction and out-of-order scheduling, a few very wide execution units. On the right, one GPU SM: four identical partitions, each with a scheduler, a large block of registers and 32 execution lanes. Schematic, not to scale.
aria: Diagram: most of a CPU core's area is cache and control logic; most of a GPU SM is arithmetic lanes and register file
cpu: CPU core
gpu: One GPU SM
cache: L2 / L3 cache
ooo: Out-of-order · reorder buffer
bp: Branch prediction
fe: Fetch · decode
alu: Execution units
l1: L1
sch: Scheduler
rf: Register file
lanes: 32 lanes
smem: L1 / shared memory
note1: One thread, running fast
note2: Thousands of threads, together
:::

The model below puts both approaches side by side. One thread repeats the same job: compute for c cycles, then read memory once. A memory read waits {hL} cycles. That is the global-memory latency Luo et al. measured in 2024 on the Hopper-based H800 (478.8 cycles). The CPU-style machine has one thread but a cache: a hit returns the data in {hLhit} cycles (the L1 of AMD's Zen 5; see <a href='../how-cpu-caches-work/#ch1'>Chapter 1 of How a CPU's Three Levels of Cache Work</a>), and only a miss waits for memory. The GPU-style machine has no cache, but it has N threads: while one waits, it switches to the next.

::: lab ch1-model
model.title: Hiding the wait: a cache, or more threads
model.how: Drag “CPU cache hit rate” to see how busy the CPU-style machine is, and drag “GPU threads” for the GPU-style one. Then change “cycles of compute between reads” to see what each side has to pay. The curve is the GPU-style machine's busy level against thread count; the flat line is the CPU-style machine.
model.aria: Line chart: the GPU-style machine's busy level rises with thread count; the CPU-style machine's busy level is a flat line that changes with hit rate
cv.gpu: GPU-style
cv.cpu: CPU-style
ctl.c: Cycles of compute between reads
ctl.h: CPU cache hit rate
ctl.n: GPU threads
read.amat: CPU average per memory access
read.cpu: CPU-style busy
read.gpu: GPU-style busy
read.need: Threads needed to fill the GPU
cv.x: Threads
cv.y: Busy level
say.cpuahead: At a hit rate of *{h}*, the CPU-style machine is busy {cpu}. The GPU-style machine with {n} threads is only busy {gpu}: too few threads, so most of the time every thread is waiting for memory.
say.gpuahead: With {n} threads, the GPU-style machine is already busy *{gpu}*, more than the CPU-style machine at a {h} hit rate ({cpu}). More threads mean more reads in flight at the same moment.
say.gpufull: {n} threads is enough: the GPU-style machine has *a thread ready to run on every cycle*, and the waits for memory are covered by other threads' computation. At a {h} hit rate the CPU-style machine is busy {cpu}.
:::

At a 95% hit rate, the CPU-style machine averages {hAmat95} cycles per memory access and is busy {hU95}; at 99% it is {hAmat99} cycles and {hU99}. Even with every access hitting it reaches only {hU1}, because each read still takes {hLhit} cycles and only {hc} cycles of computation happen between reads. Without a cache it is only {hU0}. GPU-style: 8 threads give {hG8}, 32 threads give {hG32}, and {hNfull} threads fill it. There is a simple way to estimate how many threads you need: the reads in flight at once equal the latency times the reads issued per cycle. That is **Little's law** in this setting (for the general queueing form, see <a href='../why-compute-waits-for-memory/#ch4'>Chapter 4 of Why Compute Waits for Memory</a>).

Real CPUs do not simply wait the way the model does. Through out-of-order execution they keep working for hundreds of instructions after a miss, and let several misses be in flight together (<a href='../how-a-cpu-guesses-ahead/#ch9'>Chapter 9 of How a CPU Guesses Ahead</a>). But that needs a reorder buffer of hundreds of entries and very accurate prediction, and each core is expensive. The GPU takes another route: it does not guess, it just keeps enough threads alive at once. The cost is that each thread is slow, and the program has to split into pieces: if there is only one thing to do, the GPU cannot help.

The model has only one read in flight at a time, with no out-of-order execution and no bandwidth limit. Both machines use the same latency so that only the approach is compared. Real GPU threads are not free: each thread's registers take up space, and Chapter 3 works out how many threads fit. More threads help nothing when every thread is waiting on bandwidth rather than latency (Chapters 5 and 7). The {hc} cycles of compute between reads is a tuned parameter; the {hLhit}-cycle hit comes from Zen 5's L1. {.take}

## How an image is split into two million threads {#ch2}

::: strings
toc: How an image is split into two million threads
:::

A GPU programmer writes only how to compute one pixel, and then says how many such threads to start. The hardware hands the threads out to the SMs by block, and each block is cut into warps of 32 by thread number. The 32 threads in a warp run the same instruction at each step. {.law}

An exam has over two million papers to mark. No one hires two million teachers to mark one each. The papers go to classrooms, a few per room, and within a room the teacher seats the students in rows of 32 and marks one row at a time. The classroom is a **thread block** (block), a row is a **warp**, one paper is a **thread**, and all the classrooms together are the **grid**.

In CUDA, the program that brightens each pixel of an image W wide and H high looks like this:

::: html ch2-html
code: "__global__ void brighten(float \\*img, int W, int H) {\n  int x = blockIdx.x \\* blockDim.x + threadIdx.x;\n  int y = blockIdx.y \\* blockDim.y + threadIdx.y;\n  if (x < W && y < H) img[y \\* W + x] \\*= 1.2f;\n}\n// Launch: 16×16 threads per block, block count rounded up\nbrighten<<<dim3((W+15)/16, (H+15)/16), dim3(16,16)>>>(img, W, H);"
:::

The function body says only what one thread does: using its block number <code>blockIdx</code>, the block size <code>blockDim</code> and its own number inside the block <code>threadIdx</code>, it works out which pixel it is responsible for. A block has at most 1024 threads. Threads of the same block run on the same SM and can share that SM's shared memory. The CUDA Programming Guide spells out how the threads of a block are grouped into warps: in a 2D block (Dx, Dy), the thread at (x, y) has number x + y·Dx; each warp is 32 consecutive numbers, and the first warp starts at 0. So in a 16×16 block, warp 0 covers rows 0 and 1. AMD calls its equivalent a wavefront: the data-center CDNA architecture groups {waveC} threads, and the gaming RDNA architecture groups {waveR} (AMD HIP documentation).

::: diagram dg-hier keys=dg.hier
cap: From grid to thread. The image is covered by 16×16 blocks. A block's 256 threads are numbered x + y·16, and every 32 of them form a warp, so one warp is two adjacent rows of the image, 16 pixels each. A block is assigned to one SM; the warp is the unit the SM schedules. Schematic, not to scale.
aria: Diagram: a grid is made of thread blocks; within a block, threads are grouped into warps of 32 by number; one warp corresponds to two rows of 16 pixels in the image
grid: Grid: blocks in 2D
block: One 16×16 thread block
warp0: Warp 0: rows 0–1
warp1: Warp 1: rows 2–3
warps: … 8 warps in all
thread: One thread = one pixel
sm: Whole block to one SM
id: Number = x + y·16
:::

::: lab ch2-model
model.title: Laying a grid over an image
model.how: Pick the image size and the block shape to see how many blocks and threads there are, and how many threads fall off the image and do nothing. Then drag the two sliders to pick a pixel and see which block it falls in, which thread number it is inside the block, and which warp and lane it lands on.
ctl.img: Image size
img.fhd: 1920×1080
img.sq: 1000×1000
img.k4: 3840×2160
ctl.blk: Block shape
model.aria: An image covered by a grid of thread blocks; the selected block is shown enlarged, its warps are colored differently, and the selected pixel is marked in gold
ctl.px: Pixel x
ctl.py: Pixel y
read.grid: Grid (blocks)
read.threads: Threads launched
read.idle: Threads off the image
read.block: This pixel is in block
read.thread: Thread number in block
read.warp: Warp · lane
v.grid: {gx} × {gy} = {b}
v.idle: {n} ({p})
v.block: ({x}, {y})
v.thread: ({x}, {y}) → {id}
v.warp: warp {w} · lane {l}
cv.zoom: Zoom: selected block
say.exact: A {w}×{h} image covered by {bx}×{by} blocks fits exactly: {b} blocks, *no thread is wasted*.
say.idle: A {w}×{h} image covered by {bx}×{by} blocks needs {gx}×{gy} blocks; the blocks along the right column or the bottom row stick out past the image. *{n}* threads ({p}) start and do nothing, because of the <code>if</code> check.
say.pxrows: Pixel ({px}, {py}) is thread {id} of block ({bx}, {by}), lane {l} of warp {w}. The block is {bw} wide, so one warp covers {rows} rows of the image, {ww} pixels in each.
say.pxrow: Pixel ({px}, {py}) is thread {id} of block ({bx}, {by}), lane {l} of warp {w}. The block is {bw} wide, so one warp is exactly 32 consecutive pixels in the same row.
:::

A {imgW}×{imgH} image has {pixels} pixels. With 16×16 blocks it needs {g16x}×{g16y} = {g16b} blocks, {g16t} threads and {g16w} warps. 1080 is not a multiple of 16, so the bottom row of blocks sticks out: {g16idle} threads ({g16share}) run for nothing, which is why the line <code>if (x &lt; W &amp;&amp; y &lt; H)</code> cannot be dropped. With 32×8 blocks the grid is exactly {g328x}×{g328y}, and the wasted threads are {g328idle}; 32×32 gives {g32idle} again. With 16×16 on a 1000×1000 image, {sqIdle} threads ({sqShare}) are wasted.

Wasted threads are a small share. The block shape matters for a different reason: **the shape a warp covers on the image**. With block width 32, one warp is 32 consecutive pixels of a row; with width 16 it is 16 pixels in each of two rows; with width 8 it is 8 pixels in each of four rows. Warp threads read memory together, and the shape they cover decides how close together the addresses they read are. Chapter 5 works this out.

The order in which blocks run, and the SM each one runs on, is not under the program's control, and you cannot count on it. Blocks cannot wait for each other in the middle of one launch (Hopper added thread block clusters, whose blocks can access each other's shared memory, but a cluster holds only a few blocks). Real programs often have one thread handle several pixels; here each thread handles one. {.take}

## Warp scheduling and occupancy {#ch3}

::: strings
toc: Warp scheduling and occupancy
:::

Each SM keeps dozens of warps alive at once, and every cycle it picks one ready warp to issue an instruction; warps waiting on memory step aside. To hide waits of hundreds of cycles you need enough warps resident, and each warp needs enough independent work between its reads. {.law}

A service window has a dozen people queued, and each person's errand has several steps, one of which means going home for materials and coming back much later. The window does not wait for that person; it serves the next one. As long as the queue is long enough, the window always has work. The window is the **warp scheduler**, and the people in the queue are **warps**.

An H100 SM is split into {scheds} identical partitions. Each partition has one scheduler, one register file, 32 FP32 lanes, and one tensor core (Chapter 8). Every cycle, each scheduler picks, from the warps assigned to it, one whose next instruction is ready, and issues it to its 32 lanes. An SM holds at most {maxWarps} warps at once, {perSched} per scheduler. Switching warps is free. In the words of the CUDA Programming Guide, each warp's execution context (program counters, registers and so on) stays on chip for the warp's whole life, so “switching between warps incurs no cost.”

::: diagram dg-sm keys=dg.sm
cap: The structure of one Hopper SM. Each of the four partitions has a scheduler (issuing one instruction per cycle to one warp), a register file and 32 FP32 lanes, and a tensor core; all four share a 256 KB L1 plus shared memory. Schematic, not to scale; the partition breakdown follows the SM block diagram in NVIDIA's technical blog post on the Hopper architecture.
aria: Diagram: an SM split into four partitions, each with a warp scheduler, a register file, 32 FP32 lanes and a tensor core; the four partitions share L1 and shared memory
title: One SM (H100)
part: Partition {n}
sch: Warp scheduler
rf: Register file 64 KB
fp32: 32 FP32 lanes
tc: Tensor core
ldst: Load/store units
l1: L1 data cache + shared memory: 256 KB
out: To L2 and device memory
:::

How long must they hide? Luo et al. measured latency on Hopper (H800) in 2024: shared memory {lShared} cycles, L1 {lL1}, L2 {lL2}, device memory {lGlobal}. The model below is one scheduler: N warps, each repeatedly executing k instructions, the last of which is a memory read; after the read is issued, that warp must wait L cycles before its next instruction.

::: diagram dg-tl keys=dg.tl
cap: Hiding the wait. Each row is one warp: lit cells are when it issues an instruction, dark bars are when it waits for data to return. The scheduler issues only one warp per cycle; as long as some warp is not waiting, that cycle is not wasted. Schematic, not to scale.
aria: Diagram: a timeline of four warps. After a warp issues a read it waits, and the scheduler issues instructions from other warps; the waiting spans are offset from one another
w: Warp {n}
issue: Issuing
wait: Waiting for data
sched: Scheduler's pick this cycle
time: Time →
:::

::: lab ch3-model
model.title: One scheduler, N warps
model.how: Drag the warp count and the number of instructions between reads, and choose which memory level is read, to see how busy the scheduler is. Each row above is one warp over the first few hundred cycles: lit cells issue instructions, dark bars wait. Finally, try switching the scheduling policy to round-robin.
model.aria: Timeline: each row is one warp; lit cells mean issuing an instruction, dark bars mean waiting for memory
ctl.n: Warps
ctl.k: Instructions between reads
ctl.l: Reads from
l.shared: Shared memory
l.l1: L1
l.l2: L2
l.global: Device memory
ctl.pol: Scheduling policy
pol.gto: Stay on one until it stalls
pol.rr: Round-robin, switch every cycle
read.busy: Scheduler busy (simulated)
read.closed: Formula min(1, N·k/(k+L))
read.need: Warps needed to fill it
read.lat: Each read waits
:::

With 20 instructions between reads and device-memory reads: 8 warps are busy {s820}; 16 (the limit for one scheduler) only {s1620}; {n20g} warps would be needed to fill it, which does not fit. With 40 instructions between reads, {n40g} warps are enough, and 16 warps are busy {s1640}. With reads from L2, 8 warps are busy {s820l2} and {n20l2} warps fill it. This is the formula from Chapter 1, except that each scheduler has a limit on warps: **when latency is too long, more warps are not enough, and each warp has to do more work**. The tiling in Chapter 7 does exactly that. The scheduling policy matters too: with the same 16 warps and 40 instructions per round, round-robin, switching every cycle, is busy only {rr1640}, because they all reach the read at the same time. NVIDIA does not publish its scheduling policy; schedulers in the research literature tend to push one warp ahead, and the two-level scheduling of Narasiman et al. (2011) was designed against exactly this round-robin convoy. Volkov's 2016 PhD thesis studied how GPUs hide latency, and one conclusion is that warp count is not the only way: independent instructions within the same warp (instruction-level parallelism) can do the job too.

### How many warps one SM can hold {#h.occ .sub3}

For a warp to live on an SM, its registers and shared memory must fit there. According to NVIDIA's Hopper Tuning Guide, an H100 SM holds at most {maxWarps} warps and {maxBlocks} thread blocks, has {regsSm} 32-bit registers (each thread can use up to {maxRegs}), up to {smemSm} KB of shared memory, at most {smemBlk} KB per block, and each block also reserves {smemRes} KB of its own. The ratio of resident warps to the maximum is called **occupancy**.

::: lab ch3-lab
model2.title: How many blocks fit on one H100 SM
model2.how: Choose the threads per block, drag the registers per thread and the shared memory per block, and see how many blocks each of the four limits allows and which one binds first. Press the button to send the resulting “warps per scheduler” to the scheduler above.
ctl.tpb: Threads per block
ctl.regs: Registers per thread
ctl.smem: Shared memory per block
btn.send: Send to the scheduler above
model2.aria: Bar chart: the number of blocks allowed by the warp limit, registers, shared memory and block-count limit; the shortest bar sets the result
read.blocks: Blocks resident
read.warps: Warps resident
read.occ: Occupancy
read.ps: Per scheduler
read.limit: Binding limit
cv.x: Cycles
say.full: {n} warps, {k} instructions between reads, {l} cycles of wait: the scheduler has an instruction to issue *{busy}* of the time, and the waits are fully hidden.
say.more: The scheduler is only busy *{busy}*. To cover a wait of {l} cycles, one round of each warp is {k} instructions plus {l} cycles, so {need} warps must take turns; there are only {n} now.
say.never: The scheduler is only busy *{busy}*, and more warps would not be enough: {need} would be needed to fill it, but one scheduler holds at most {max}. Each warp has to do more work between its reads.
say.rr: With the same {n} warps, round-robin scheduling is busy only *{busy}* (the formula gives {closed}): each cycle switches warp, so they all advance together, reach the read at nearly the same moment, and wait together.
lim.warps: Warp limit
lim.regs: Registers
lim.smem: Shared memory
lim.blocks: Block limit
bar.warps: Warp limit 64
bar.regs: Registers 65536
bar.smem: Shared memory 228 KB
bar.blocks: Block limit 32
bar.v: {v} blocks
say.occ.warps: Each block has {tpb} threads, which is {wpb} warps; the warp limit binds first: {blocks} blocks and {warps} warps resident, *occupancy {occ}*.
say.occ.regs: Each thread uses {regs} registers, so a block needs {rb}; the registers run out first: only {blocks} blocks and {warps} warps fit, *occupancy {occ}*.
say.occ.smem: Each block needs {smem} KB of shared memory (plus 1 KB extra); shared memory runs out first: only {blocks} blocks and {warps} warps fit, *occupancy {occ}*.
say.occ.blocks: The blocks are too small: an SM holds at most 32 blocks, and each block has only {wpb} warps, so only {warps} warps fit, *occupancy {occ}*.
say.occ.bad.regsBlock: A block of {tpb} threads at {regs} registers each needs {rb} registers, more than the 65536 in an SM: *this block cannot launch at all*.
:::

With 256 threads per block: at 32 registers per thread, {o32w} warps fit, occupancy {o32}; at 64 registers, {o64w} warps, {o64}; at 128 registers, {o128w} warps, {o128}. At 32 registers per thread but 100 KB of shared memory per block, only {oSb} blocks fit, giving {oSw} warps ({oS}). With 32 threads per block, the limit of 32 blocks per SM binds, so only {o1w} warps ({o1}). The default setting (256 threads, 64 registers, 16 KB) holds {oDefW} warps, {oDefPs} per scheduler: press the button to send it to the scheduler above, and see how busy the scheduler is when reads go to device memory.

High occupancy is not the same as fast: a thread that uses more registers can often keep more intermediate results and read memory fewer times, and Volkov's GTC 2010 talk “Better Performance at Lower Occupancy” gave examples of kernels that ran faster at lower occupancy by giving each thread several independent pieces of work. The model ignores the granularity in which registers and shared memory are allocated (real hardware allocates in fixed chunks, so it sometimes fits slightly fewer blocks than shown here). In the scheduler model each warp has only one read in flight at a time, and every instruction issues in a single cycle. {.take}

## A warp takes two paths {#ch4}

::: strings
toc: A warp takes two paths
:::

A warp has only one instruction stream. When its 32 threads split at an if, the hardware runs both paths: on each path it runs, the threads that are not on it sit idle. {.law}

A tour guide leads a group of 32 to a fork in the road. Some want the museum and some want the park. The group cannot split, so the guide takes everyone to the museum first, and those who do not want it wait at the door. After the museum the whole group goes to the park, and now the other half waits. As long as one person wants the museum, the whole group makes that trip.

The CUDA Programming Guide describes it this way: when the threads of a warp split at a branch, “the warp executes each branch path taken, disabling threads that are not on that path,” and “full efficiency is realized when all 32 threads of a warp agree on their execution path.” The disabled threads are tracked by an **active mask**, and this is called **branch divergence**. From compute capability 7.0 (Volta), each thread has its own program counter, so the two paths can interleave, but in any one cycle a warp still executes only one of them. Divergence happens inside a warp only; different warps go their own way and do not affect each other.

::: diagram dg-mask keys=dg.mask
cap: The active mask. The 32 lanes first run the condition together, then the if branch (lanes whose condition holds are lit, the rest are off), then the else branch (the reverse), and finally rejoin. Across the two branches, each lane is doing useful work in only one of them. Schematic; the mask is one drawn example.
aria: Diagram: a warp's 32 lanes execute the if and else; during the if only some lanes are lit, during the else the other ones are
cond: Condition
if: if branch
else: else branch
join: Rejoin
lanes: 32 lanes
on: Working
off: Off, waiting
:::

::: lab ch4-model
model.title: How many threads take the if branch
model.how: Drag “share taking the if” to see one warp's efficiency. “Length of the if” is the instruction count of the if branch; the else branch is fixed at 10 instructions. With “each thread decides for itself”, each thread takes the if independently with this share; with “the whole warp decides together”, the condition depends only on the warp number. The row of 32 cells below is one warp drawn at random; press “Resample” for another.
ctl.p: Share taking the if
ctl.a: Length of the if
ctl.mode: The condition depends on
mode.lane: Each thread decides for itself
mode.warp: The whole warp decides together
btn.resample: Resample a warp
lanes.aria: A sampled warp: 32 lanes, gold ones take the if, cyan ones take the else
model.aria: Line chart: warp efficiency against the share taking the if; lowest in the middle, 100% at both ends
read.cyc: Average cycles per warp
read.eff: Average efficiency
read.nA: Lanes in this warp taking the if
read.this: Cycles for this warp
v.nA: {n} / 32
cv.x: Share taking the if
cv.y: Efficiency
say.split: With {p} of threads taking the if, a warp takes *{cyc}* cycles on average, and only {eff} of that is useful. If even one of the 32 takes one path, all of them have to wait through it.
say.none: All threads take the same path: no divergence, efficiency *{eff}*.
say.warp: The condition depends only on the warp number: each warp takes one path as a whole, *efficiency {eff}*, even if half the warps take the if and half take the else.
:::

With two paths of equal length (10 instructions each), when half the threads take the if the efficiency is {d50}. When only 5% take the if you might think there is almost no cost, but the efficiency is {d05}: with 32 threads, the chance that at least one takes the if is high, so a warp takes {dCyc05} cycles on average instead of 10. If the if path were four times longer, 5% would drag efficiency down to {d05b}; even 1% still leaves {d01}. If the condition depends only on the warp number (or the data is sorted so that threads taking the same path sit next to each other), efficiency returns to 100%. This is the first way code becomes slow after a small rewrite: the same if can run several times faster or slower depending on whether its condition looks at the warp number or at each thread's own data.

Compilers turn very short branches into “compute both sides, then select the result”. That avoids jumps, but both sides' work is done. The model assumes each thread decides independently; real data often has large blocks of identical results, which helps. Nested branches split the masks into smaller and smaller pieces. {.take}

## 32 addresses, how many reads {#ch5}

::: strings
toc: 32 addresses, how many reads
:::

A warp's 32 reads are fetched by the hardware in 32-byte segments. If the 32 addresses sit next to each other, four segments are enough; if they are spread out, 32 segments must be fetched, and seven-eighths of the data moved is wasted. {.law}

Say you are shopping for 32 items. If they are all on one shelf, one trip with the cart gets them all. If they are spread across 32 shelves, you make 32 trips, each time putting only one item into a cart that could hold a whole load.

The CUDA Best Practices Guide puts it directly: the loads a warp issues together are coalesced into 32-byte transactions, as many as there are 32-byte segments under the threads' addresses. When thread k reads the k-th 4-byte word of an aligned array, “four coalesced 32-byte transactions will service that memory access”; contiguous but misaligned, five segments are requested; at stride 2, half of every transaction goes unused and load/store efficiency is 50%. This is called **memory coalescing**.

::: diagram dg-coal keys=dg.coal
cap: Coalesced and uncoalesced. Above, each thread reads an adjacent 4-byte word, so the 32 threads fall into exactly 4 segments of 32 bytes. Below, with stride 2, the same 32 reads must fetch 8 segments, each half used. Schematic, only 8 threads drawn.
aria: Diagram: the 32 threads above read consecutive addresses that fall into 4 segments of 32 bytes; the 32 threads below read every other word and fall into 8 segments, each half used
a: Contiguous: thread k reads word k
b: Stride 2: thread k reads word 2k
seg: 32-byte segment
use: Bytes used
waste: Bytes wasted
t: Thread
:::

::: lab ch5-model
model.title: One warp reads 32 four-byte values
model.how: Choose the access pattern, then drag the sliders for offset or stride to see how many 32-byte segments the 32 addresses fall into, and how many of the bytes moved are actually used. “Two rows of 16” is what a warp reading an image in the 16×16 block of Chapter 2 looks like.
ctl.pat: Access pattern
pat.seq: Contiguous
pat.offset: Contiguous but shifted
pat.stride: Strided
pat.rows: Two rows of 16
pat.random: Random
ctl.param: Offset or stride
model.aria: Address strip: the 32 threads' addresses drawn as vertical lines, the 32-byte segments they fall into drawn as boxes, the used part marked in gold
read.sec: 32-byte segments fetched
read.lines: 128-byte lines touched
read.eff: Bytes moved that are used
read.bw: Effective bandwidth on H100
param.offset: Shifted by {v} words
param.stride: Stride {v} words
param.seed: Random address set {v}
param.none: No adjustment
cv.addr: Address (bytes)
say.full: The 32 addresses fall in *{s}* segments, and not one byte moved is wasted: effective bandwidth is the device memory's full {bw}.
say.part: The 32 addresses fall in *{s}* segments: {moved} bytes moved, of which only 128 bytes are used ({eff}), dropping effective bandwidth to {bw}.
say.worst: Each thread takes its own segment: *{s}* segments of 32 bytes for 128 bytes of data, only {eff} used, leaving effective bandwidth of just {bw}.
:::

Contiguous reads: {csS} segments, all used. Shifted by one word: {co1S} segments, {co1E}. Stride 2: {c2S} segments, {c2E}; stride 4: {c4S} segments. Once the stride reaches 8, every thread takes its own segment: {c8S} segments, only {c8E} used, so the H100's {hbm} TB/s of device memory gives only {c8bw} TB/s of effective bandwidth, {c8x} times slower. Random addresses take {crS} segments too. This is the most common cause of the several-times slowdown after a small rewrite from the opening. Images stored row by row: a warp reading along a row is contiguous, but reading down a column means a stride equal to the image width, the worst case. In the 16×16 block of Chapter 2, a warp reading two rows of 16 pixels still takes {crowS} segments, just split across {crowL} places, which is not wasted.

There are usually three fixes: have neighboring threads process neighboring data; change one struct per element (an array of structs) to one array per field (a struct of arrays), so that a given field sits contiguously in memory; and where you really must read by column, first read a block into shared memory row by row, then read it by column from shared memory (next chapter).

The model counts only 32-byte segments and ignores caches: if a segment is read again soon, L1 or L2 may still hold it, which costs less. Effective bandwidth is calculated assuming device memory is the bottleneck. Hopper's TMA unit can move a whole multidimensional block at once, which is a different mechanism. {.take}

## The 32 banks of shared memory {#ch6}

::: strings
toc: The 32 banks of shared memory
:::

Shared memory is split into 32 banks, and each bank can hand out only one 4-byte word per cycle. If the 32 threads want words that fall in 32 different banks, one cycle is enough; if they pile into the same bank, they queue up one after another. {.law}

A supermarket has 32 checkout lanes, and each customer goes to the lane matching their member number modulo 32. If the 32 member numbers are consecutive, each goes to a different lane and everyone is done in one round. If all 32 numbers are multiples of 32, they all go to lane 0 and form a single queue.

Shared memory is a fast block of storage on each SM that the program manages itself; all threads in a thread block can read and write it, and Chapter 7 uses it for tiling. According to the CUDA Best Practices Guide: it is divided into equally sized banks that can be accessed simultaneously; each bank delivers 32 bits per cycle; when several threads in one warp read the same address it is a broadcast; when several different addresses fall into the same bank, the accesses are serialized. Word w lives in bank w mod 32. An SM hands out at most 32 × 4 = {bankBW} bytes per cycle. When threads read words at stride s, the degree of conflict is the greatest common divisor of s and 32, called a **bank conflict**.

::: diagram dg-banks keys=dg.banks
cap: A bank conflict, drawn at reduced scale with 8 banks and 8 threads. Top, stride 1: each thread lands in its own bank, and the read finishes in one cycle. Bottom, stride 2: threads 0 and 4 both land in bank 0, threads 1 and 5 both land in bank 2, and the odd-numbered banks sit empty; each bank must hand out two words, so the whole read takes two cycles. On real hardware with 32 banks and 32 threads, stride 2 makes threads 0 and 16 collide.
aria: Diagram: 32 banks in a row. At stride 1 each thread falls into a different bank; at stride 2 two threads fall into the same bank, a two-way conflict
s1: Stride 1: one cycle
s2: Stride 2: two cycles (2-way conflict)
bank: Bank
t: Thread
idle: Idle
:::

::: lab ch6-model
model.title: 32 threads reading shared memory
model.how: Drag the stride: thread i reads word i × stride. Each column is a bank; the taller the column, the longer the queue of words that bank has to serve. The tallest column sets how many cycles the read takes. The switch below reads a 32×32 tile by column, so you can see what padding one extra column does.
ctl.mode: How to read
mode.stride: Thread i reads word i × stride
mode.tile: 32×32 tile, read by column
ctl.s: Stride (words)
ctl.pad: Pad each row by one word (33 columns)
model.aria: Bar chart: how many distinct words each of the 32 banks has to serve; the tallest column sets the number of cycles
read.deg: Most crowded bank
read.cyc: This read takes
read.bw: Delivered per cycle
v.deg: {v} distinct words
v.bw: {v} bytes
cv.x: Bank number
cv.y: Words queued
say.free: Stride {s}: the 32 words fall in 32 different banks, *done in one cycle*. All odd strides behave this way.
say.bcast: Stride 0: all 32 threads read the same word, a *broadcast*, done in one cycle.
say.conflict: Stride {s}: only {used} banks are used, and each has to hand out {d} different words, a *{d}-way conflict*; this read takes {d} cycles.
say.worst: Stride {s}: all 32 words are in one bank, a *32-way conflict*, stretching the read to 32 cycles.
say.tileconf: Reading a 32×32 tile by column: two neighbors in a column are 32 words apart, so they all fall in the same bank, a *{d}-way conflict*.
say.tilefree: After padding each row by one word, two neighbors in a column are 33 words apart, so the 32 values fall in 32 different banks: *no conflict*.
:::

Stride 1 has no conflict; stride 2 is a {b2d}-way conflict; stride 32 is {b32d}-way, stretching a read to 32 cycles; stride 33 is back to {b33d}, and any odd stride (such as 3) is {b3d}. The read by column from Chapter 5, when done in shared memory, runs straight into this: a 32×32 tile read by column is a {tc0d}-way conflict; padding each row with one unused word makes it 32×33 and the conflict disappears ({tc1d}). The matrix example in the Best Practices Guide uses this same trick: the stride goes from w to w+1 banks.

This only counts 4-byte reads; for 8-byte or 16-byte reads the hardware splits the access into several passes, with different rules. AMD calls its shared memory LDS; CDNA 4 and RDNA 2 through 4 have {ldsC4} banks (HIP documentation). A method commonly used since Hopper is to scramble addresses by XOR (swizzling), which avoids wasting a column. {.take}

## Tiled matrix multiply {#ch7}

::: strings
toc: Tiled matrix multiply
:::

Every number in a matrix multiply is used many times. Load a tile into shared memory first, then move a small piece into registers and reuse it: the work done per byte fetched from device memory rises from a quarter of an operation to dozens, and the same card runs dozens of times faster. {.law}

Say you are making a hundred sandwiches. If each one needs a trip to the fridge for a slice of bread and a slice of ham, the time goes to walking. Carry a tray of ingredients to the counter at once and grab a handful at a time, and the trips to the fridge drop sharply. The fridge is device memory, the counter is shared memory, and the hands are registers. The same logic on CPUs is in <a href='../why-compute-waits-for-memory/#ch3'>Chapter 3 of Why Compute Waits for Memory</a>; here it is applied to a GPU's two levels of storage.

C = A × B, where all three are N×N single-precision matrices. Without tiling, each thread computes one element of C, and every multiply-add reads one element of A and one of B from device memory: 2 operations per 8 bytes, or 0.25 operations per byte. With tiling, a thread block computes a T×T tile of C: at each step it reads a T×32 strip of A and a 32×T strip of B into shared memory. Every element in the block is used T times, so each byte fetched from device memory supports T/4 operations. There is more: threads reading from shared memory also need bandwidth. If each thread computes a small r×r block in registers, every 2r words read yield 2r² operations, which is r/4 operations per byte of shared memory. How fast a card runs is the smallest of three figures: peak compute, device-memory bandwidth times T/4, and shared-memory bandwidth times r/4. This is the <a href='../why-compute-waits-for-memory/#ch7'>roofline model</a>, except that it has two roofs.

The H100's single-precision CUDA-core peak is {fp32TF} TFLOPS, and its device memory is {hbm} TB/s. Shared-memory bandwidth is 132 SMs × 32 banks × 4 bytes × clock. The product page does not give the clock, so working back from the peak gives {clk} GHz (67 TFLOPS ÷ 132 ÷ 128 ÷ 2), and the total shared-memory bandwidth is {smemTB} TB/s.

::: diagram dg-tile keys=dg.tile
cap: Tiling. The gold tile of C is the product of a row strip of A and a column strip of B. Each time, only one piece of each strip (T×32 and 32×T) moves into shared memory; each thread in the block reads from shared memory and accumulates its own r×r block in registers. Schematic, not to scale.
aria: Diagram: a tile of matrix C is computed from a row strip of A and a column strip of B; the strips move into shared memory in pieces, and each thread computes a small block in registers
a: A
b: B
c: C
cblk: This T×T tile
astrip: Row strip
bstrip: Column strip
smem: Shared: T×32 of A, 32×T of B
reg: Each thread: r×r in registers
hbm: Device memory
:::

::: lab ch7-model
model.title: Single-precision matrix multiply on H100
model.how: Choose the tile size T (1 means no tiling) and the small block r each thread computes, and see the ceiling of each of the three levels and which one binds. If the tile is too big or r too small, a block needs more than 1024 threads, and the model will tell you.
ctl.t: Tile size T
t.1: No tiling
ctl.r: Small block per thread r
model.aria: Bar chart: the peak compute, the device-memory roof, the shared-memory roof, and the speed actually reached
read.att: Reached
read.ig: Device memory: ops per byte
read.is: Shared memory: ops per byte
read.blk: Threads per block · shared memory
bar.peak: Peak compute
bar.hbm: Device-memory roof
bar.smem: Shared-memory roof
bar.att: Reached
v.blk: {t} threads · {kb} KB
v.inf: No shared memory
say.naive: No tiling: each multiply-add reads two numbers from device memory, 0.25 operations per byte, so it reaches only *{att}*, {share} of peak.
say.hbm: T = {t}: the device-memory level gives {ig} operations per byte, which holds it at *{att}*; a bigger tile is needed to get over the device-memory roof.
say.smem: T = {t}, r = {r}: the device-memory level allows {hbm}, but shared memory can only supply *{att}*. Tiling just moved the queue from device memory to shared memory; each thread must compute more in registers.
say.peak: T = {t}, r = {r}: both levels can keep up, reaching peak *{att}*, which is {x} times the untiled speed.
say.bad.threads: T = {t}, r = {r}: a block needs {th} threads, over the 1024 limit. Increase r.
say.bad.tiny: T = {t}, r = {r}: a block has only {th} threads, not even enough for one warp.
:::

Without tiling, the kernel reaches only {mmNaive} TFLOPS. At T = 32, r = 1, the device-memory level is already at {mm32hbm}, but shared memory can only supply {mm32}: tiling only moved the queue from device memory to shared memory. Giving each thread a 4×4 block (T = 64) reaches {mm64}; T = 128 with r = 4 is {mm128r4}; at r = 8 both levels can keep up, reaching peak {mm128}, which is {mmX} times the untiled speed. The device-memory knee is at {mmRidge} operations per byte, which corresponds to T = {mmRidgeT}. A block with T = 128 and r = 8 uses {mm128smem} KB of shared memory and {mm128thr} threads, and each thread computes 64 values. Most library matrix-multiply kernels have this tiles-within-tiles structure, and the point from Chapter 3 that a warp should do more work between reads is played here by r.

The model ignores caches: an untiled program on a real machine gets some repeated reads absorbed by L1 and L2, so it runs faster than shown here, but still far behind tiling. It also does not count the time threads wait while a tile is loaded into shared memory (real programs use double buffering: while computing one piece, they load the next). The K step of 32 (a tuned parameter) only determines how much shared memory is used; it does not change operations per byte. {.take}

## Tensor cores and number formats {#ch8}

::: strings
toc: Tensor cores and number formats
:::

A tensor core is not just more multipliers; one instruction has the whole warp compute a small matrix multiply-add together. Each time the number of bits halves, the same circuit does roughly twice as many multiply-adds per cycle, but that speed only shows up when the matrices are big enough and data keeps arriving. {.law}

To total a spreadsheet, you can punch in one cell at a time on a calculator, or feed the whole sheet into a machine that does a whole block in one go. The second is much faster, but only if the sheet is big enough and someone keeps feeding the machine.

A normal multiply-add instruction does 32 operations per warp (one per thread). PTX <code>mma.sync.m16n8k16</code> has the warp compute a 16×16 times 16×8 matrix multiply-add together: one instruction does {macs} multiply-adds, which is {macsX} times a normal multiply-add, and the parts of the matrices are spread across the registers of the 32 threads. Hopper adds <code>wgmma</code>, which has four warps (a warpgroup) compute a larger block together, reading B (and optionally A) straight from shared memory. The number formats tensor cores support keep getting narrower: FP16 and BF16 (16 bits), TF32 (a 32-bit format with 19 significant bits), Hopper's two 8-bit floating-point formats E4M3 and E5M2 (4 exponent and 3 mantissa bits, or 5 exponent and 2 mantissa bits), and Blackwell added the 4-bit FP4.

::: diagram dg-mma keys=dg.mma
cap: One m16n8k16 matrix multiply-add: D = A × B + C. A is 16×16, B is 16×8, and C and D are 16×8. The numbers are spread across the registers of a warp's 32 threads, which together issue one instruction doing 2,048 multiply-adds. Schematic: the PTX manual specifies which values each thread holds; that is not drawn here.
aria: Diagram: one warp uses one mma instruction to multiply a 16×16 block of A by a 16×8 block of B and add it to a 16×8 block of C; the blocks are spread across the registers of 32 threads
a: A: 16 × 16
b: B: 16 × 8
c: C / D: 16 × 8
warp: One warp, one instruction
macs: 16 × 8 × 16 = 2,048 multiply-adds
fma: Ordinary multiply-add: 32 per instruction
:::

Peaks depend on the format. The H100 (SXM) product page figures include sparsity; halve them for dense: TF32 {tf32}, FP16/BF16 {fp16}, FP8 {fp8} TFLOPS. For comparison, single precision without tensor cores is only {fp32TF}, and FP64 tensor cores reach {fp64tc}. B200 per card (one eighth of the HGX B200 eight-GPU figures, also halved to remove sparsity): FP16/BF16 {bFp16}, FP8 {bFp8}, FP4 {bFp4} TFLOPS, and device memory {bBw} TB/s.

::: lab ch8-model
model.title: How fast an N×N matrix multiply runs in each format
model.how: Choose a card and drag the matrix size N. Each bar is one format: the dark bar is the vendor's peak, and the bright bar is what this size can reach (matrices read and written once each: the roofline). Click a format to see its detailed readings.
ctl.gpu: Card
gpu.h100: H100
gpu.b200: B200
ctl.fmt: Format
fmt.fp32: FP32 (no tensor cores)
fmt.tf32: TF32
fmt.fp16: FP16 / BF16
fmt.fp8: FP8
fmt.fp4: FP4
ctl.n: Matrix size N
model.aria: Bar chart: the peak of each number format and the speed reachable at the current matrix size
read.i: Operations per byte
read.att: Reached
read.share: Share of peak
read.nfull: Minimum N to reach peak
bar.na: None
say.mem: N = {n}, {f}: {i} operations per byte; device memory can only supply *{att}*, {share} of peak. The matrix must reach about N = {nf} before it is fully fed.
say.compute: N = {n}, {f}: {i} operations per byte, which is enough, and it reaches *peak {att}*.
say.none: This card's tensor cores do not support this format (or the product page gives no figure for it).
:::

From N = 1024 up, every format is fully fed on both cards. Smaller sizes differ: on H100, an FP8 multiply at N = 256 has {g256i} operations per byte and reaches only {g256} TFLOPS, {g256s} of peak; FP16 at the same size reaches only {h16_256} of peak. The absolute speeds differ by a factor of two, but both are stuck on device memory. B200's FP4 at N = 512 is {b512s} of peak, and at N = 1024 it is {b1024s}. The fewer the bits, the faster the peak grows relative to bytes, so the bigger the matrix must be to keep it fed. For the knee of each card's roofline and why large-model inference uses only a small fraction of compute, see <a href='../why-compute-waits-for-memory/#ch7'>Chapter 7 of Why Compute Waits for Memory</a> and <a href='../why-compute-waits-for-memory/#ch8'>Chapter 8</a>; for the relation between tensor cores and systolic arrays, see <a href='../why-compute-waits-for-memory/#ch6'>Chapter 6 of that essay</a>.

Peaks are the vendor's theoretical numbers at boosted clocks; real matrix multiplies usually fall short of them. The model assumes all three matrices use one format and are each read and written once; real programs often accumulate in a wider format, and the output matrix is often 16- or 32-bit. Fewer bits also means less precision: FP8 and FP4 need scaling factors, and whether they can be used, and in which layers, is a numerical question this page does not answer. {.take}

## Drawing a frame runs on the same machine {#ch9}

::: strings
toc: Drawing a frame runs on the same machine
:::

Drawing a frame uses the same machine: vertices and pixels become threads, grouped by 32 onto SMs. Pixels are shaded in 2×2 quads, so very small triangles leave most of their threads doing nothing useful. {.law}

Laying a mosaic wall, workers go in groups of four, each group responsible for a 2×2 block of tiles. A group on the outline of the picture may find that only one tile belongs to the picture, but all four workers still have to show up; the other three are just there to keep the group together.

A 3D frame is drawn like this. **The vertex shader** transforms each vertex from its position in the model to a position on screen. **Rasterization** is fixed-function hardware that decides which pixels each triangle covers: for each pixel center it evaluates the three edge functions, and if all three have the same sign the pixel is inside (Pineda, 1988). **The fragment (pixel) shader** computes a color for each covered pixel, sampling textures and computing lighting. Finally the ROP does depth testing and blending and writes to the framebuffer (how the picture in the framebuffer reaches the screen: see <a href='../how-pixels-reach-a-screen/#ch1'>How Pixels Reach a Screen</a>). The vertex and pixel shaders are programs, and since the unified shader architecture of 2006 they run on the same SMs as CUDA programs, executing in the same warps. Pixels are shaded in 2×2 quads: texture sampling needs to know how fast coordinates change between neighboring pixels (screen-space derivatives), so the four pixels must be computed together, even if some of them fall outside the triangle. For how vertices are transformed, how lines are drawn and how lighting is computed, see <a href='../../graphics/computer-graphics/'>Computer Graphics: From Coordinates to Light</a>; here we only look at how this work lands on the SMs.

::: diagram dg-pipe keys=dg.pipe
cap: The graphics pipeline. The two cyan stages are programs running on SMs, executed in warps like CUDA threads; the two gray stages are fixed-function hardware. Rasterization turns triangles into groups of 2×2 pixels, and eight groups fill one warp. Schematic.
aria: Diagram: vertex data passes through the vertex shader, rasterizer, pixel shader and ROP into the framebuffer; the two shader stages run on SMs
v: Vertex data
vs: Vertex shader
ras: Rasterizer
fs: Pixel shader
rop: ROP: depth, blend
fb: Framebuffer
sm: Runs on SMs, 32 per warp
fixed: Fixed hardware
quad: 2×2 quads, 8 per warp
:::

::: lab ch9-model
model.title: Rasterizing a triangle
model.how: Drag “triangle size” (roughly the longest edge, in pixels). Gold cells are the pixels the triangle covers; boxes are the 2×2 quads to be shaded. Quad cells not covered by the triangle still run a thread; the result is simply discarded.
model.aria: A pixel grid with a triangle drawn on it; covered pixels are gold, and the 2×2 quads to be shaded are boxed
ctl.s: Triangle size
read.cov: Pixels covered
read.quads: 2×2 quads · threads
read.eff: Useful threads
read.warps: Warps
v.s: {v} px
v.quads: {q} quads · {l} threads
say.big: Large triangle: covers {c} pixels, runs {l} threads, *{e}* of them useful; the waste is the ring along the edges.
say.small: Small triangle: covers only {c} pixels yet runs {l} threads, *only {e}* useful.
:::

A triangle whose longest edge is 2 pixels covers {r2c} pixels but runs {r2l} threads: only {r2e} are useful. At 4 pixels it is {r4e}; at 8 pixels {r8e}; at 32 pixels it covers {r32c} with {r32e} useful, needing {r32w} warps. These figures also depend on where the triangle falls on the pixel grid: averaging over 100 placements inside a pixel, a 2-pixel triangle averages {r2avg}, ranging from {r2lo} to {r2hi}; the 32-pixel average is {r32avg}. As models get finer and triangles smaller, this matters more: Fatahalian et al.'s 2010 paper is about combining 2×2 quads from neighboring small triangles to waste less. Some engines simply rasterize small triangles themselves with compute shaders, bypassing the fixed hardware.

The model looks only at a single triangle and pixel centers. It ignores early depth testing (occluded pixels may skip shading), multisample antialiasing, and the tile-based rendering used on mobile GPUs. It does not cover dedicated ray-tracing units. The shape of the triangle and its position on the pixel grid are tuned parameters, which is why the text gives averages and ranges over 100 positions. {.take}

## The GPU memory hierarchy, and the coherence it skips {#ch10}

::: strings
toc: The GPU memory hierarchy, and the coherence it skips
:::

GPU memory levels are built for throughput: each SM has its own registers and L1/shared memory, the whole chip shares one L2, and beyond that is HBM or GDDR device memory. The L1s of over a hundred SMs are not kept coherent in hardware. The shared meeting point is L2, and passing data between thread blocks needs atomic operations and fences that the program spells out. {.law}

A school in which each classroom has its own blackboard, and the school has one notice board. What a teacher changes on their own classroom board is invisible to other rooms. To let the whole school know, you have to write it on the notice board, and people have to go to the notice board to read it, not copy the old version from their own blackboard.

From the inside out: each thread's registers (each SM holds {regKB} KB of them on H100); each SM's L1 plus shared memory ({l1KB} KB, split between the two in a configurable way); the L2 shared across the chip (H100 {l2MB} MB, B200 {bL2} MB, both split into two halves, where reading from the far half is slower); and outermost, device memory. Data-center cards use HBM stacked next to the chip (H100 80 GB, {hbm} TB/s; why HBM is expensive and how it is packaged is in <a href='../why-compute-waits-for-memory/#ch9'>Chapter 9 of Why Compute Waits for Memory</a>). Gaming cards use GDDR soldered around the chip (how GDDR7 signals travel is in <a href='../how-memory-talks/#ch9'>Chapter 9 of How Memory Talks to the CPU</a>). Chapter 3 gave the latency at each level: shared memory {lShared} cycles, L1 {lL1}, L2 {lL2}, device memory {lGlobal}. The graphics card talks to the CPU over PCIe (<a href='../how-pcie-works/'>Why PCIe Keeps Doubling</a>).

::: diagram dg-mem keys=dg.mem
cap: The GPU memory hierarchy. Each SM has its own registers and L1/shared memory, connected through an on-chip crossbar to the L2 shared across the chip (split into two halves), with device memory behind the L2. No wires connect the SMs' L1s to notify each other: the point they agree on is L2. Schematic, not to scale.
aria: Diagram: several SMs each have registers and L1/shared memory, connected through an on-chip network to an L2 split into two halves, which connects to device memory; there are no coherence wires between the L1s
sm: SM {n}
rf: Registers
l1: L1 / shared
xbar: On-chip crossbar
l2a: Half of L2
l2b: Other half of L2
dram: Device memory: HBM or GDDR
nocoh: No L1-to-L1 coherence
point: Where all agree
:::

A CPU with a few to dozens of cores keeps each cache's copies consistent with snooping or a directory (<a href='../how-cores-share-memory/#ch3'>Chapter 3 of How Cores Share Memory</a>, <a href='../how-cores-share-memory/#ch4'>Chapter 4</a>). Doing that on a GPU would mean that every write from over a hundred SMs and hundreds of thousands of threads invalidates copies elsewhere. Yet most GPU programs, within one launch, have different thread blocks writing different data, so most of that cost would be wasted. So the GPU lets each L1 cache only its own SM, and L2 is the one copy shared across the chip. CUDA's memory model gives programs a few tools: atomic operations (atomics on device memory are carried out in the shared L2, so every SM sees the same result; in the Guide's table of memory scopes, L2 is the point of coherence for the whole device), fences with a scope (<code>__threadfence_block</code> covers only one block, <code>__threadfence</code> the whole device, <code>__threadfence_system</code> even the CPU), and the simplest one: when a launch ends and the next one begins, everything written before is visible to all. For whether and how CPU and GPU stay coherent, see <a href='../coherent-interconnects/#ch11'>Chapter 11 of How Chips Share Memory</a> (Grace Hopper and MI300A).

How each level writes back exactly, and whether an L1 write goes straight through to device memory or invalidates its own copy, NVIDIA has not fully published; it also differs across generations. This page covers only what programs can depend on: atomic operations, fences, and launch boundaries. Latencies come from measurements on the H800; other cards and clocks will differ. {.take}

## Where the frontier is (November 2026) {#ch11}

::: strings
toc: Where the frontier is (November 2026)
:::

In recent years GPUs have changed in three ways: tensor cores support narrower and narrower formats with higher peaks; device-memory bandwidth grows wider but cannot keep up with compute; and a card is split into two or more chips packaged together. The rules of warps, occupancy and coalescing have not changed. {.law}

Below are three groups: principles already settled, products already built and available (who, and when), and vendors' claims.

### Settled {#h.est .sub3}

- SIMT: NVIDIA warps have always been 32 threads; AMD's CDNA uses {waveC} and RDNA uses {waveR} (CUDA Programming Guide 13.5; AMD HIP documentation). {#e1}
- How much concurrency multithreading needs to hide latency is set by Little's law; instruction-level parallelism and warp count can stand in for each other (Volkov, 2016 PhD thesis). {#e2}
- Tiling makes operations per byte grow with the block's edge length, and whether a kernel reaches peak depends on whether it has crossed the knee of the roofline (Williams, Waterman and Patterson, 2009). {#e3}

### Built {#h.demo .sub3}

- NVIDIA H100 (Hopper): {h100sm} SMs, {l2MB} MB L2, 80 GB HBM3, {hbm} TB/s; FP8 tensor cores (NVIDIA product page and tuning guide). {#d1}
- NVIDIA B200 (Blackwell): two chips packaged together, {bSm} SMs in total, {bL2} MB L2 (Chips and Cheese, 15 December 2025); per card {bMem} GB HBM3e, {bBw} TB/s, and FP4 without sparsity {bFp4} TFLOPS (NVIDIA DGX B200 and HGX pages, one eighth of the eight-GPU figure). {#d2}
- B300 made different trade-offs. On the HGX page, per-card FP4 without sparsity is {b300fp4} TFLOPS, while FP64 fell from B200's {b200fp64} TFLOPS to {b300fp64}; the eight-GPU INT8 went from {b200int8} POPS to {b300int8} POPS (with sparsity). Silicon moved from the formats science uses to the formats large models use. {#d3}
- AMD Instinct MI355X (CDNA 4): {miCu} compute units, {miMem} GB HBM3E, {miBw} TB/s, FP4 without sparsity about {miFp4} PFLOPS (AMD figures as reported by media such as Tom's Hardware at the June 2025 launch; the AMD product page did not open this time). {#d4}
- Gaming card: NVIDIA RTX 5090 (Blackwell) has {r5c} CUDA cores, which at 128 per SM is {r5sm} SMs, with {r5mem} GB GDDR7 on a {r5bus}-bit bus (NVIDIA product page). {#d5}
- Software: CUDA Programming Guide 13.5, updated 31 October 2026; AMD's ROCm 7.2.4 stable release was published 29 May 2026, and the 7.14.1 technical preview on 2 September 2026. Triton lets people write GPU kernels in Python, with the compiler handling tiling, coalescing and shared memory, and it works on both NVIDIA and AMD cards. {#d6}

### Claims {#h.claim .sub3}

- NVIDIA's HGX page gives Rubin per card as {rbInf} PFLOPS NVFP4 inference and {rbTr} PFLOPS training, {rbMem} GB HBM4 and {rbBw} TB/s, and says Vera Rubin is “in full production” (viewed 15 November 2026). NVIDIA does not say whether the 50 PFLOPS assumes sparsity; some press reports list it as a sparse figure, and if so it cannot be set directly beside the dense peaks of Chapter 8. These are vendor specifications and have not been independently measured. {#c1}
- AMD Instinct MI455X (CDNA 5): in ServeTheHome's introduction of 12 August 2026, {mi4St} stacks of {mi4Gb} GB HBM4, {mi4Mem} GB in total at about {mi4Bw} TB/s, FP4 without sparsity “slightly above {mi4Fp4} PFLOPS”; the compute die uses TSMC N2, and the compute units have been changed to a 32-wide design like RDNA's. The figures come from AMD and have not been independently measured. {#c2}

Still unsolved: device-memory bandwidth grows more slowly than peak compute, and the higher the FP4 peak, the more often the matrix-too-small problem of Chapter 8 appears; a card's power draw has reached over a kilowatt (how that much power gets in: <a href='../how-power-reaches-the-cpu/#ch10'>Chapter 10 of How Power Reaches the CPU</a>); and programs keep getting harder to write. Running tensor cores at full speed on Hopper and Blackwell takes asynchronous copies (TMA) and warpgroup instructions, though most people use libraries and compilers like Triton. How multiple cards are connected and made to compute together is in <a href='../coherent-interconnects/#ch8'>Chapter 8 of How Chips Share Memory</a> (NVLink) and Chapter 9 (all-reduce).

Models, dates and peaks go out of date. The numbers in this chapter are gathered in SRC and FRONTIER in models.js, with their dates, to make updates easier. {.take}

## Wrap-up: three questions before writing GPU code {#ch12}

::: strings
toc: Wrap-up: three questions before writing GPU code
:::

GPUs are fast for programs that can be split apart, move in step, read nearby data, and reuse what they read. {.law}

{.plain .qs}
1. **Do the 32 threads of a warp do the same thing and read adjacent addresses?** If a branch depends on the data, try to put threads that take the same path together (Chapter 4). Let neighboring threads read neighboring words, and do not have a warp read down a column (Chapter 5). If you must change direction, go through shared memory, and pad a column to avoid bank conflicts (Chapter 6). {#q1}
2. **How many operations do you get for each byte fetched from device memory?** If you are below the roof, tile, and tile at two levels: shared memory and registers (Chapter 7). Try narrower formats where you can, but the matrices have to be big enough (Chapter 8). {#q2}
3. **How many warps are waiting to take over on each SM, and what limits them?** Calculate occupancy, and see whether registers, shared memory or block size is the limit (Chapter 3). But occupancy is not the goal; hiding latency is. {#q3}

A GPU has tens of thousands of “cores”, which are really a hundred-odd SMs, each split into four partitions that run one instruction across 32 lanes every cycle. The way it splits an image or a matrix multiply is this: the program writes only what one thread does, and the hardware divides the work into *grids, thread blocks and warps*, keeps thousands of threads alive at once, and *whoever waits for memory gets swapped out*. Code slows down after a small rewrite because this split has preconditions: the threads of a warp must *take the same path* (divergence), *read adjacent addresses* (coalescing), *not pile into the same bank* (bank conflicts), and every byte must be *used enough times* (tiling). {#sum .sum tag=div}

Related essays: <a href='../why-compute-waits-for-memory/'>Why Compute Waits for Memory</a> (the roofline, large-model inference, HBM); <a href='../how-a-cpu-guesses-ahead/'>How a CPU Guesses Ahead</a> (the CPU's route: prediction and out-of-order execution); <a href='../how-cpu-caches-work/'>How a CPU's Three Levels of Cache Work</a>; <a href='../how-cores-share-memory/'>How Cores Share Memory</a> (the coherence a GPU does not do); <a href='../how-pcie-works/'>Why PCIe Keeps Doubling</a>; <a href='../how-memory-talks/'>How Memory Talks to the CPU</a> (how DRAM is read and written, GDDR7); <a href='../coherent-interconnects/'>How Chips Share Memory</a> (NVLink and multi-card interconnects). {#links style="margin-top:2em"}

::: footer wrap=none
How a GPU Computes · a long essay you can play with. Models: average memory access time and Little's law (Hennessy and Patterson; Volkov 2016); CUDA thread numbering and warp grouping (CUDA Programming Guide 13.5); a cycle-by-cycle warp scheduler (greedy and round-robin policies); H100 residency limits (Hopper Tuning Guide); branch divergence with active masks; 32-byte sectors and 32 banks (CUDA Best Practices Guide); tiled matrix multiply under a two-level roofline (Williams, Waterman and Patterson 2009); per-format tensor-core peaks and roofs; edge-function rasterization and 2×2 pixel quads (Pineda 1988; Fatahalian et al. 2010). Latencies are from Luo et al.'s measurements on the Hopper H800 (arXiv 2402.13499). Vendor peaks are from NVIDIA product pages (sparsity figures halved). Written by an AI; sources and unverified points are in BRIEF.md in the same directory.
:::
