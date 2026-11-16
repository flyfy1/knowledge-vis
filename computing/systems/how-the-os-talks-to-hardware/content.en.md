---
lang: en
title: How the OS Talks to Hardware · a long essay you can play with
desc: A read() in your program brings data back from a disk or a network card within microseconds, yet a user program cannot touch any hardware. How does that one line cross the wall, find the right driver and device, and bring the result back? Nine hands-on models: which instruction traps at which privilege level, the system-call register convention, the cycles of one kernel crossing, why reading a device register is expensive, the CPU cost of interrupts, polling and NAPI, how large a descriptor ring must be not to drop packets, how drivers bind to devices, where one read() spends its time layer by layer, and how many system calls epoll and io_uring make per I/O.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.us: {v} µs
u.ns: {v} ns
u.ms: {v} ms
u.cyc: {v} cycles
u.pct: {v}%
u.x: {v}×
u.pps: {v} pkt/s
u.kpps: {v} kpkt/s
u.mpps: {v} Mpkt/s
u.kiops: {v}k IOPS
u.persec: {v}/s
u.slots: {v} slots
u.none: —
:::

# How the OS Talks to Hardware {#hero}

::: strings
kicker: Computing · Systems · a long essay you can play with
:::

A single read() or printf() in your program, and within microseconds the data arrives from the disk, the network card or the keyboard.<br>Yet a user program cannot touch any hardware. How does that one call get through the wall, find the right driver and the right device, and bring the result back? {.sub}

We follow one file read from start to finish. First the wall itself: the CPU's privilege levels, the one door a user program may use (the system call), and how many cycles a trip through that door costs. Then the view from the kernel's side of the wall, where a device is just a row of registers. How a device calls the CPU (interrupts), and what to do when it calls too often (polling and NAPI). How data reaches memory without passing through the CPU (DMA and descriptor rings), and how the device is kept from writing where it should not (the IOMMU). Then how the kernel recognizes a new device and gives it a driver, how long each layer takes when one read() passes through the file system, the page cache, the block layer and the driver, and finally how to use fewer trips through the door (epoll, io_uring) or skip the kernel altogether (DPDK, SPDK, virtualization). **Every model is a scaled-down version of something real**: privilege checks written to the Intel manual, register values filled in from the Linux system call table, driver matching rules taken from the kernel source, a time-stepped simulation of interrupts and polling, and per-layer costs measured in the papers. {.lead}

An AI wrote this page. The rules come from primary sources (the descriptions of SYSCALL, IN and HLT in Intel's Software Developer's Manual, Linux kernel documentation and source, the syscall(2) man page, and Arm's trusted firmware documentation). The measurements come from several papers (FlexSC, OSDI 2010; Arrakis, OSDI 2014; Neugebauer et al., SIGCOMM 2018; Ren et al., SOSP 2019; Lee et al., USENIX ATC 2019; Haas and Leis, VLDB 2023) and from notes by the io_uring author, with the source and date given for each. **Measurements from different years and different machines can only be compared by order of magnitude**. Values marked “tuned parameter” were chosen so the models could compute; the text says how far the conclusion moves when each one doubles. {.note}

## The wall: privilege levels {#ch1}

::: strings
toc: The wall: privilege levels
:::

A user program cannot touch hardware not because it does not know where the hardware is, but because the CPU checks “who are you right now?” on every instruction. At the lowest privilege level, an instruction that reads or writes a device register, turns off interrupts or switches page tables is stopped by the hardware the moment it runs, and handed to the kernel. {.law}

A building's power room is locked, and even a resident who knows electricity well cannot get in; to fix the wiring, you call the building manager. The CPU has a similar gate. On x86, the CPU has a current privilege level (CPL) at every moment, with four levels from 0 to 3, and the operating system uses only two: the kernel runs at level 0 (ring 0) and applications at level 3 (ring 3). Arm calls them exception levels: applications run at EL0, the kernel at EL1, the hypervisor at EL2, and the secure monitor firmware at the very bottom, EL3. (The trusted firmware documentation says it runs at EL3 from the reset vector onward; see <a href='../how-a-computer-boots/#ch12'>“How a Computer Boots,” chapter 12</a>.)

::: diagram dg-rings keys=dg.rings
cap: On the left, x86: the operating system uses only ring 0 and ring 3. On the right, Arm: EL2 runs the hypervisor and EL3 runs the secure monitor firmware. The downward arrow is a system call, and the upward arrow is the return. Schematic, not to scale.
aria: Diagram: the four x86 privilege rings and the four Arm exception levels; the system call is the door from the application level into the kernel level
x86: x86-64
arm: Arm (AArch64)
r3: ring 3: applications
r12: rings 1, 2: hardly used
r0: ring 0: kernel, drivers
el0: EL0: applications
el1: EL1: kernel, drivers
el2: EL2: hypervisor
el3: EL3: secure monitor firmware
down: syscall / svc
up: sysret / eret
wall: Device registers, page tables, interrupt switches: only this kernel level can reach them
:::

The gate checks three kinds of things. The first is **privileged instructions**: on x86, HLT (which stops the core) and writing a new page-table address to CR3. If CPL is not 0, the manual says the result is #GP(0), a general protection fault. The second is **port I/O**: the IN and OUT instructions, when CPL is greater than IOPL, also check an I/O permission bitmap in the task state segment; if the bit for the port is 1, the result is #GP. Linux gives user programs an IOPL of 0 and a fully blocked bitmap. The third is **memory**: each page-table entry has a “user accessible” bit. The kernel's own pages, and the addresses where device registers sit, are either unmapped or have this bit at 0 for user mode, so touching one raises a page fault (for page tables, see <a href='../how-virtual-memory-works/#ch3'>“How Virtual Memory Works,” chapter 3</a>).

What happens after the block? The CPU does not simply report an error and quit. It treats the event as an exception: it stops the current pipeline, switches to level 0, and jumps to a handler the kernel registered in advance. When Linux sees that a user program has crossed the line, it sends the program a signal. #GP and page faults become SIGSEGV, and on Arm an unknown instruction becomes SIGILL. The program usually ends there.

::: lab ch1-model
model.title: Which level stops one instruction
model.how: Pick a CPU, then an instruction and the current privilege level. The table shows how the hardware responds at the two privilege levels, and one sentence below says why. Tick “the kernel opened the gate” to see how the kernel can deliberately hand a port, or a range of device registers, to a user program.
ctl.arch: CPU
a.x86: x86-64
a.arm: Arm (AArch64)
ctl.op: Instruction
op.load: Read your own variable
op.kload: Read kernel memory
op.in: IN: read keyboard port 0x60
op.mmio: Write the network card's doorbell register
op.hlt: HLT: stop the core
op.cr3: Write CR3: switch page tables
op.msr: Write TTBR0_EL1: switch page tables
op.sys: System call (syscall / svc)
ctl.level: Current privilege level
lv.r3: ring 3 (application)
lv.r0: ring 0 (kernel)
lv.el0: EL0 (application)
lv.el1: EL1 (kernel)
ctl.grant: The kernel opened the gate (ioperm opens a port, or UIO / VFIO maps the registers into this program)
tbl.aria: What each instruction does at the application and kernel privilege levels
read.res: Hardware response
read.sig: Signal Linux sends the program
th.op: Instruction
th.user: Application
th.kern: Kernel
res.ok: Runs
res.gp: #GP
res.pf: Page fault
res.abort: Data abort
res.undef: Undefined instruction
res.enter: Enters kernel
res.kernel: Not needed
res.na: Not available
sig.none: None
say.x86.load.ok: Reading your own variable runs at either level: its page is visible to user code.
say.x86.kload.pf: This page's “user accessible” bit is 0. Touching it at ring 3 raises a page fault in the hardware, and Linux sends SIGSEGV. The same instruction runs at ring 0.
say.x86.kload.ok: At ring 0, the kernel's own memory can of course be read.
say.x86.in.gp: CPL is 3, which is greater than IOPL 0, so the I/O permission bitmap is checked. The bit for 0x60 is 1, so the result is #GP(0), and Linux sends SIGSEGV. The keyboard controller only listens to the kernel.
say.x86.in.granted: The kernel used ioperm() to clear the bit for 0x60 to 0, so the bitmap allows it and the IN at ring 3 can run. The kernel opened this door on purpose: who it is opened for, and which port, are recorded in this process's bitmap.
say.x86.in.ok: At ring 0, CPL is not greater than IOPL, so IN runs directly without checking the bitmap.
say.x86.mmio.pf: The network card's registers sit in a range of physical addresses, but the user program's page table does not map them. Writing this address is a page fault, and Linux sends SIGSEGV.
say.x86.mmio.granted: The kernel mapped this range of registers into this process's page table through UIO or VFIO, so writes reach the network card directly. This is how user-space drivers work (chapter 12).
say.x86.mmio.ok: At ring 0, the kernel mapped these registers with ioremap(), so writes reach the network card directly.
say.x86.hlt.gp: HLT requires CPL 0, otherwise #GP(0). Stopping the core is something only the kernel's idle loop may do.
say.x86.hlt.ok: At ring 0, HLT stops the core until the next interrupt wakes it.
say.x86.cr3.gp: Writing CR3 replaces the entire page table. If a user program could do this, it could see other programs' memory. When CPL is not 0, the result is #GP(0).
say.x86.cr3.ok: At ring 0, the kernel writes CR3 every time it switches processes.
say.x86.sys.enter: This is the only door in the wall. syscall is not blocked: the CPU switches to ring 0 by itself and jumps to the entry point the kernel registered. The next chapter opens it up.
say.x86.sys.kernel: When the kernel itself needs to do something, it calls its own functions directly and does not use this door.
say.arm.load.ok: Reading your own variable runs at either level.
say.arm.kload.abort: Reading a kernel page at EL0 fails the permission check during translation, so the hardware raises a data abort, and Linux sends SIGSEGV.
say.arm.kload.ok: At EL1, the kernel's memory can of course be read.
say.arm.mmio.abort: Arm has no port I/O: device registers are all memory addresses. This address is not in the user page table, so writing it is a data abort, and Linux sends SIGSEGV.
say.arm.mmio.granted: The kernel mapped these registers to this process, so writes reach the device directly.
say.arm.mmio.ok: At EL1, the kernel mapped these registers, so writes reach the device directly.
say.arm.msr.undef: TTBR0_EL1 is a system register for EL1. Writing it at EL0 is an undefined instruction, and Linux sends SIGILL.
say.arm.msr.ok: At EL1, the kernel writes this register whenever it switches processes.
say.arm.sys.enter: svc #0 is not blocked: it is itself an exception that requests entry into EL1, and the CPU jumps to the kernel's exception vector table.
say.arm.sys.kernel: When the kernel itself needs to do something, it calls its own functions directly.
:::

Read the table from top to bottom. In the application column, the only things that can run are reading and writing your own memory and making system calls; every other cell is an exception. This is not a rule the operating system's software enforces. The hardware makes the check on every instruction, so it cannot be bypassed. Tick “the kernel opened the gate” and the port and device-register rows become runnable. The key to the gate always stays with the kernel, which can hand it out per process, per port or per address range. This mechanism is called a **privilege level**, also known as a protection ring.

The table lists only seven operations. Real rules have more branches: on x86, CLI and STI are controlled by IOPL, and on Arm, instructions such as WFI can be configured to trap at EL0. On CPUs with the Meltdown flaw, speculative execution once got past the check in the kernel-memory row (see <a href='../how-a-cpu-guesses-ahead/#ch10'>“How a CPU Guesses Ahead,” chapter 10</a>). The uses of the Arm exception levels come from Arm and trusted-firmware documentation; this essay does not check every EL0 system-register write line by line against the Arm architecture manual. {.take}

## The one door in the wall: the system call {#ch2}

::: strings
toc: The one door in the wall: the system call
:::

A system call is an exception that the program triggers on purpose. It writes “what I want to do” into agreed registers and executes a syscall instruction (svc on Arm). The CPU switches to the kernel by itself and jumps to a fixed entry point, and the kernel looks up the function in a table using the number in a register. {.law}

At a bank counter you cannot walk into the vault yourself. You fill in a slip and pass it through the window: the slip carries a transaction code and an amount, and the teller acts on the code. A system call's slip is a few registers. The Linux syscall(2) man page lists the convention for each CPU. On x86-64, the number goes in rax, the six arguments go in rdi, rsi, rdx, r10, r8 and r9 in that order, and the result comes back in rax. On arm64, the number goes in x8, the arguments in x0 to x5, and the result returns in x0.

The number indexes a table inside the kernel. In the x86-64 table, read is number {nrRead} and io_uring_enter is number {nrUring}, and the largest number in Linux 7.4-rc2 is {sysMax}. arm64 and later architectures share a different table, where read is number {nrReadA}. Once a number is assigned it never changes, so a program compiled a decade ago still runs today. The read() function in the C library is only a few lines of assembly: it moves the arguments into registers, executes syscall, and takes the result back from rax.

::: diagram dg-sys keys=dg.sys
cap: One read(3, buf, 4096) on x86-64. On the left is user mode, on the right kernel mode; the numbers give the order. Registers follow the convention in syscall(2), and the instruction actions follow the Intel manual. Schematic.
aria: Diagram: the six steps of a read system call going from user mode into the kernel and back, and the registers each step uses
user: User mode (ring 3)
kern: Kernel mode (ring 0)
s1: rax = 0 (read), rdi = 3, rsi = buf, rdx = 4096
s2: syscall: RCX ← RIP, R11 ← RFLAGS, RIP ← IA32_LSTAR, CPL ← 0
s3: Entry: switch to kernel stack, save pt_regs
s4: sys_call_table[rax] → read's implementation
s5: Return value → rax
s6: sysret: RIP ← RCX, back to ring 3
:::

The syscall instruction itself does very little. According to the Intel manual, it stores the address of the next instruction in RCX, stores the flags register in R11, loads the entry address from a model-specific register called IA32_LSTAR into RIP, sets CPL to 0, and clears some flag bits (such as the interrupt-enable bit) according to IA32_FMASK. It **does not save the stack pointer**, so the first thing the kernel entry does is switch to its own stack. The entry address is written into IA32_LSTAR when the kernel boots (for the handoff, see <a href='../how-a-computer-boots/#ch11'>“How a Computer Boots,” chapter 11</a>). A user program can walk through the door, but it cannot choose where the door leads.

::: lab ch2-model
model.title: One system call: what sits in the registers
model.how: Pick a CPU and a system call, and see what each register holds before the call, which number is used for the lookup, and which steps the hardware and kernel take when the instruction runs.
ctl.arch: CPU
a.x86: x86-64
a.arm: arm64
ctl.call: System call
regs.aria: Register values before the call
steps.aria: The steps the hardware and kernel take when this instruction runs
read.nr: Number used for the lookup
read.insn: The instruction that goes through the door
read.ret: Result goes in
read.n: Number of arguments
reg.nr: System call number
step.x86.1: CPU: RCX ← address of the next instruction, R11 ← RFLAGS
step.x86.2: CPU: RIP ← IA32_LSTAR, CPL ← 0, RFLAGS bits cleared per IA32_FMASK
step.x86.3: Kernel entry: switch to the kernel stack, save the user registers as a pt_regs
step.x86.4: Look up rax in the system call table and call the matching function
step.x86.5: The function's return value goes into rax (on error, a negative error code)
step.x86.6: sysret: RIP ← RCX, RFLAGS ← R11, back to ring 3
step.arm.1: CPU: ELR_EL1 ← return address, SPSR_EL1 ← current state
step.arm.2: CPU: switch to EL1 and jump to the “synchronous exception from a lower level” entry in the table at VBAR_EL1
step.arm.3: Kernel entry: read ESR_EL1, see that the cause is SVC, save the user registers
step.arm.4: Look up x8 in the system call table and call the matching function
step.arm.5: The function's return value goes into x0
step.arm.6: eret: restore from ELR_EL1 and SPSR_EL1, back to EL0
say.x86: On x86-64, {call} is number {nr}: the number goes into rax, {n} arguments are placed in rdi, rsi, rdx, r10, r8 and r9 in that order, and then syscall runs. The fourth argument uses r10 rather than rcx as in the usual function calling convention, because syscall uses rcx to save the return address.
say.arm: On arm64, {call} is number {nr}: the number goes into x8, {n} arguments go into registers starting at x0, and then svc #0 runs. The return value overwrites x0.
:::

Switch the CPU and look at the same call: the numbers and registers differ, but the shape is the same. Number and arguments go into registers, one instruction goes through the door, the hardware records the return address, and the kernel looks up the table. Compare the fourth argument on x86: an ordinary function call puts it in rcx, but a system call puts it in r10, because the syscall instruction uses rcx. This agreement between a program and the kernel about registers is called the **system call ABI**, and the table is called the **system call table**.

Some system calls never enter the kernel. Reading the current time, for example, only reads, so Linux maps a small piece of code and data into every process (the vDSO), and the call finishes in user mode. The table numbers come from the source of Linux 7.4-rc2. The vector table offsets and ESR details in the arm64 steps have not been checked line by line against the Arm architecture manual. {.take}

## How many cycles one trip through the door costs {#ch3}

::: strings
toc: How many cycles one trip through the door costs
:::

A single trip into and out of the kernel takes only one or two hundred cycles, less than one cache miss. The expense is in what comes with it: the patches for CPU flaws add hundreds of cycles to every trip, and the kernel stirs up the caches and the TLB. So there is only one way to pay less for the door: carry more on each trip. {.law}

At the counter, the queue can take longer than the business itself; if you do ten things in one visit, you queue only once. System calls work the same way. In 2010, the FlexSC authors measured on a Core i7 (Nehalem) a system call that does nothing but return a timestamp: {fxIn} cycles to enter the kernel and {fxOut} cycles to come back, {fxTot} cycles in all, which is shorter than the {fxMiss} cycles of one cache miss on that same machine. But they then found that after one pwrite, the program needed as many as {fxRec} more cycles before its instructions per cycle recovered to the old level. The code and data the kernel used had pushed some of the cache, the TLB and the branch predictor out.

After 2018, this door got expensive again. The Meltdown flaw made it possible for user programs to read kernel memory through speculative execution, so Linux's KPTI patch has user mode run with a page table that contains almost no kernel memory, and every trip into and out of the kernel must write CR3 to switch back (for the mechanism, see <a href='../how-virtual-memory-works/#ch10'>“How Virtual Memory Works,” chapter 10</a>). Ren et al. measured in 2019 on a Xeon E5-2630 v3 (2.4 GHz): without KPTI, one trip took less than {rBase} cycles; with KPTI, the fixed cost was {rK0} to {rK1} cycles, of which one CR3 write took about {rCr3} cycles. On a CPU without PCID, each page-table switch also has to flush the TLB, so a small read test spent {rTlb} extra cycles on TLB misses, and with PCID only {rTlbP} more. Their shortest read test ({rReadNs} ns) was {rSlowN}% slower without PCID and {rSlowP}% slower with it; across all tests the average slowdown was {rAvg}%. Another patch, retpoline, slowed the poll and epoll tests by {rPoll}% and {rEpoll}% respectively.

::: lab ch3-model
model.title: Each job brings one trip through the kernel: how much of the time is the gate
model.how: Pick a patch situation, then drag “the work in each job” and “how many jobs share one trip through the gate”. The curve shows the average time per job as the batch size changes, with one line for each patch situation. Watch for the point where the cost of the gate is spread thin enough to ignore.
model.aria: Three curves of average time per job against batch size
pr.none: No KPTI
pr.pcid: KPTI, with PCID
pr.nopcid: KPTI, without PCID
ctl.prof: Patch situation
ctl.work: Work in each job
ctl.batch: Jobs per trip through the gate
read.c: One trip into and out of the kernel
read.ns: Average time per job
read.share: Share spent at the gate
read.fn: Slower than an ordinary function call by
tuned: The cycle count per trip is taken from Ren et al.'s Xeon: without KPTI it is recorded as {rBase} cycles (they wrote “less than”), and with KPTI it is the midpoint of 400 to 500, plus the extra cycles from TLB misses. An ordinary function call is recorded as 5 cycles. This is a **tuned parameter**; doubling it only changes the cell for “how many times slower than a function call”.
cv.x: Jobs per trip through the gate (log scale)
cv.y: Average time per job (ns)
say.most: Each job has only {work} of work but pays {c} at the gate: {share} of its time goes to entering and leaving the kernel, which is {fn} slower than writing the same work as an ordinary function call.
say.mostBatch: With {batch} jobs per trip, the gate's cost still takes {share} of the total: each job's work of {work} is too small.
say.some: The gate takes {share}. It is visible, but no longer the main cost. On average each job takes {ns}.
say.little: The gate takes only {share}, and each job averages {ns}: with enough work or a large enough batch, entering the kernel costs almost nothing.
:::

The default is KPTI with PCID, at {cPcid} cycles per trip (about {cPcidNs} ns). When each job has only 200 cycles of work, {c1Share} of the time goes to the gate, which makes it {c1Fn} times slower than writing the same work as an ordinary function call, at {c1Ns} ns per job. Without KPTI the figure is {c0Ns} ns per job; without PCID, each trip is {cNo} cycles and each job takes {cNNs} ns. Raise the batch to 32, and with PCID the gate's share falls to {c32Share}. This is the idea that recurs in the chapters that follow: **amortization**. The driver handles a batch of packets at a time (chapter 6), the network card moves a batch of descriptors at once (chapter 7), and io_uring submits a batch of requests at once (chapter 11). The model in this chapter is called the **system call overhead** model, and chapters 11 and 12 use it again.

The model counts only the ticket price of the gate itself and leaves out the indirect cost that FlexSC measured (recovery after the cache and TLB are pushed out), so the real gap is larger. The two sets of measurements come from two generations of CPUs almost ten years apart, so their cycle counts cannot be subtracted from each other directly. KPTI is needed only on CPUs affected by Meltdown. {.take}

## A device in the kernel's eyes: a row of registers {#ch4}

::: strings
toc: A device in the kernel's eyes: a row of registers
:::

To the kernel, a network card or a disk is a small piece of “fake memory” at physical addresses. Writing a number to an address is giving a command; reading a number from an address is asking for status. Writes can be sent and forgotten, but a read has to wait for the device to answer across PCIe, so a good driver tries not to read the device. {.law}

The OSTEP textbook, when it discusses I/O devices, uses a “canonical device” with three registers: a status, a command and a data register. The driver keeps reading the status until the device is not busy, writes the data into the data register, writes the command into the command register, and then keeps reading the status until the device finishes. Old IDE disks worked this way; their combined command and status register sits at port 0x1F7.

Registers come in two arrangements. **Port I/O** is a separate address space that exists only on x86, accessed with two dedicated instructions, IN and OUT: the keyboard controller is at 0x60, the first serial port at 0x3F8, and the old PCI configuration mechanism at 0xCF8 and 0xCFC. **Memory-mapped I/O** (MMIO) puts the registers at ordinary physical addresses: at boot, firmware or the kernel gives each PCIe device a range of addresses (declared by the device's BAR; see <a href='../how-pcie-works/#ch6'>“Why PCIe Keeps Doubling,” chapter 6</a>), and the CPU reaches it with ordinary read and write instructions. Nearly all devices today use MMIO. Linux's documentation says port access is generally not as fast as memory-mapped access, and on other architectures the port functions are translated into memory accesses anyway.

::: diagram dg-map keys=dg.map
cap: Physical addresses grow from bottom to top. Below 4 GiB is a region set aside for devices: the register windows of PCIe devices (declared by BARs), the I/O APIC, the local APIC and the boot flash. The rest of memory sits above 4 GiB. Port I/O is a separate space with only 64 Ki addresses. Schematic, not to scale.
aria: Diagram: where memory and device registers sit in the physical address space of an x86 machine, and the separate I/O port space
low: Memory
bars: PCIe device register windows (BARs): network card, NVMe drive…
ioapic: I/O APIC 0xFEC00000
lapic: Local APIC 0xFEE00000 (MSIs write here)
flash: Boot flash (top of 4 GiB)
high: Memory above 4 GiB
g4: 4 GiB
zero: 0
ports: I/O port space (64 Ki ports)
p60: 0x60 keyboard controller
p3f8: 0x3F8 serial port
pcf8: 0xCF8/CFC legacy PCI config
p1f7: 0x1F7 IDE command/status
uc: Uncached: every read and write goes straight to the device
:::

If they are addresses, why aren't they cached like memory? Because reading a status register asks for the device's current state, so a stale value in the cache is useless, and a command write must really reach the device. So when the kernel maps registers with ioremap(), it uses **uncached** mapping, and every read and write goes straight to the device. (For why caches usually save time, see <a href='../how-cpu-caches-work/'>“How a CPU's Three Levels of Cache Work”</a>.) The Linux documentation also says that on buses like PCI, writes are “posted”: they count as done once sent, without waiting for a reply. To confirm that a write has arrived, the driver must read back from the same device.

::: lab ch4-lab
model.title: Handing {mN} commands to a device: how long the CPU waits on registers
model.how: Three ways to hand off work: write the command register once per command and keep reading the status; after writing a command, wait for an interrupt, then read a “cause” register once and write an acknowledgment; or write commands into a queue in memory, batch them, and ring the doorbell once. Drag “status reads per command” and “commands per doorbell ring”, and watch how long the CPU waits per command (log scale).
model.aria: CPU wait time per command under three hand-off methods, log scale
ctl.k: Status reads per command
ctl.b: Commands per doorbell ring
read.poll: Keep reading status: per command
read.irq: Read once in the interrupt: per command
read.ring: Queue + doorbell: per command
read.reads: Device register reads (three methods)
tuned: One device register read is recorded as {pcieMed} ns, the median of a 64-byte DMA read measured by Neugebauer et al. in 2018 on a Xeon E5 (the device reads host memory, the opposite direction, but it is still one PCIe round trip). One write to an uncached register is recorded as 20 ns, and one write to cached memory as 1 ns. Both are **tuned parameters**. Doubling them does not change the order of the three methods, because the gap comes almost entirely from reads.
bar.poll: Command + poll status
bar.irq: Command + interrupt
bar.ring: Memory queue + doorbell
say.ok: With {k} status reads per command, the CPU waits {poll}. The interrupt method reads the cause register only once and waits {irq}. The queue plus doorbell never reads the device at all, and with {b} commands per doorbell ring, each command costs only {ring}. The difference comes almost entirely from those reads: each one has to wait a round trip of {r}.
say.b1: If each command rings the doorbell separately, that only adds a few writes that need no waiting: each command costs {ring}, still far less than the {poll} of constantly reading status. Doorbells are cheap because writes do not have to wait.
:::

By default, the method of constantly reading status costs {mPoll} µs per command, the interrupt method {mIrq} ns, and the queue plus doorbell only {mRing} ns, so the first is {mRatio} times the third. The {pcieMed} ns round trip is a measurement: fastest {pcieMin} ns, slowest {pcieMax} ns. This is why nearly all devices today use the third method: the commands and results sit in host memory, the device moves them itself (chapter 7), and the CPU writes only to a **doorbell register**. The NVMe submission and completion queues are designed exactly this way; see <a href='../why-nvme-is-fast/#ch4'>“Why NVMe Is So Fast,” chapter 4</a>.

The model counts every read as the same length of round trip. Real timing depends on how many switch chips lie between the device and the CPU and whether the link is busy. It also does not count the memory barriers drivers add to keep writes in order. {.take}

## How a device calls the CPU: the path of an interrupt {#ch5}

::: strings
toc: How a device calls the CPU: the path of an interrupt
:::

When a device finishes its work, it writes an agreed value to an agreed address. That write is delivered to the interrupt controller of one core and becomes a vector number from 0 to 255. The core stops the instructions in hand, looks up the vector in a table, and jumps into the driver's handler. The handler does only the most urgent part and defers the rest. {.law}

The courier rings the doorbell. You put down what you were doing to open the door, sign for the parcel, set it aside, and unpack it when you have a break. An interrupt is that doorbell, and this is the route it takes. On the device side: a PCIe device no longer has a dedicated interrupt line. It sends an **MSI**, which is an ordinary memory write: on x86 the address starts with FEE, and the data holds the vector number. For how each byte of the address and data is laid out, see <a href='../how-pcie-works/#ch7'>“Why PCIe Keeps Doubling,” chapter 7</a>. The root complex sees this address and hands it to the **local APIC** of the target core (on Arm it is called the GIC).

On the core's side: the local APIC interrupts the core between two instructions. The core looks up the vector in the **interrupt descriptor table** (IDT). Vectors 0 to 31 are reserved for exceptions (a page fault is 14, #GP is 13), and device interrupts use 32 and above. If the interrupted code was a user program, the CPU first switches to ring 0, moves to the kernel stack and saves the context, then jumps into the kernel's interrupt entry, which dispatches to the handler the driver registered. When it finishes, the handler writes an end of interrupt (EOI) to the APIC, and only then does the APIC deliver the next interrupt at the same level.

::: diagram dg-irq keys=dg.irq
cap: From top left to bottom right, in time order. The top half should be short; the real work is done in the bottom half (a softirq or an interrupt thread). Schematic.
aria: Diagram: the path of an interrupt after a device finishes its work, from the MSI write through the local APIC and the interrupt descriptor table to the top and bottom halves
dev: Device: work done
msi: MSI: writes a value to 0xFEE… (containing the vector number)
rc: Root complex: hands to the target core
apic: Local APIC: interrupts the core between two instructions
idt: IDT[vector]: switch to ring 0, save context
top: Top half: confirm, mask device interrupt, register bottom half
eoi: Write EOI, return
bottom: Bottom half: softirq / interrupt thread, process data
wake: Wake the waiting process
:::

The handler is called the **top half** (Linux calls it the hard interrupt). While it runs, other interrupts on the same core are often blocked, so it must be short: confirm that the interrupt belongs to its device, turn off the device's interrupt, record the real work, and return. The real work is done in the **bottom half**. Network packet reception runs in a **softirq**, which runs when the hard interrupt returns or in a ksoftirqd thread, one per core. Many drivers instead use **threaded interrupts**, which put the bottom half into an ordinary kernel thread that can sleep and can be scheduled.

The benefit of interrupts is that the CPU does not have to keep watching the device. The cost is that every interrupt must interrupt, save and restore, and the interruption disturbs the caches. The more often a device calls, the uglier this bill looks. The next chapter works out that bill.

This covers only the rough path of x86 MSI and the local APIC. Interrupt remapping (part of the IOMMU), APIC priorities, and Arm GIC details such as groups and SPI/LPI are not explained. {.take}

## Interrupts, polling, and what lies between {#ch6}

::: strings
toc: Interrupts, polling, and what lies between
:::

When packets arrive sparsely, interrupts are cheapest: the CPU is woken only when there is work. When packets arrive densely, one interrupt per packet spends the whole CPU on being woken, and fewer and fewer packets get finished. The Linux network driver's answer is in between: the first packet wakes the CPU with an interrupt, after which interrupts are turned off and the queue is polled in batches until it is empty, and only then are interrupts turned back on. {.law}

When a restaurant has only one or two tables, a waiter who comes when called is most efficient. When the room is full, a waiter who runs over each time a bell rings wears out on the way and never gets the dishes out. Then it is better to stand in the hall and check the tables one by one. In 1997, Mogul and Ramakrishnan named this phenomenon **receive livelock**: packets arrive so fast that the CPU spends all its time in interrupts, programs above it cannot run at all, and fewer packets get finished. The I/O chapter of OSTEP uses the same example and suggests a mixed approach for devices whose traffic varies: poll for a while, then switch to interrupts.

The mixed approach in the Linux network driver is called **NAPI**. The rules in the kernel documentation are: when an interrupt arrives, the driver turns off the device's interrupt and schedules a poll; each poll handles at most a budget of packets (net.core.dev_weight defaults to {weight}); if packets remain when the budget runs out, it returns and polls again later; when all are done, it calls napi_complete_done(), and only then can interrupts be turned back on.

::: lab ch6-model
model.title: One core receiving packets: interrupts, polling, NAPI
model.how: Pick a method, then drag the packets arriving per second and the wait of interrupt coalescing (after the first packet arrives, the NIC waits this long before raising an interrupt). The curves show the fraction of this core each of the three methods occupies as the packet rate changes. The readouts give the simulation result at this point: CPU share, interrupts per second, packets carried per interrupt, average latency and the slowest 1% latency.
model.aria: Curves of CPU share against packet rate for interrupts, polling and NAPI
m.irq: One interrupt per packet
m.poll: Constant polling
m.napi: NAPI
ctl.mode: Method
ctl.rate: Packets arriving per second
ctl.coal: Interrupt coalescing: wait
read.cpu: CPU share
read.irqs: Interrupts per second
read.per: Packets per interrupt
read.mean: Average latency
read.p99: Slowest 1% latency
read.livelock: Packet rate at which pure interrupts livelock
tuned: The protocol processing of each packet is recorded as {pP} µs, taken from the network-stack time for Linux receive in table 1 of the Arrakis paper. The cost of each interrupt and wake-up is recorded as {pH} µs, taken from the extra 2.2 µs the receiving process spends idle, in the same table. One empty poll is recorded as 0.1 µs. These three numbers are **tuned parameters** chosen from the measurements. If the cost of being woken doubles, pure interrupts start to livelock at about six-tenths of the packet rate; if the cost of an empty poll doubles, the average latency of polling rises by only 0.05 µs. Packets arrive as a Poisson process, with a fixed random seed.
cv.x: Packets arriving per second (log scale)
cv.y: Fraction of this core occupied
cv.live: livelock
say.irq: One interrupt per packet: CPU share {cpu}, average latency {mean}. When packets arrive sparsely, this is the cheapest method.
say.irqBusy: One interrupt per packet, and the core is already {cpu} occupied; average latency rises to {mean}. There is no breathing room between packets, and each one still pays the cost of being woken.
say.irqLive: Livelock: each packet costs {h} to wake and {p} to process, so at {rate} the work per second exceeds one second. The queue only grows and never drains, latency climbs to {mean}, and other programs on this core get no time at all.
say.irqCoal: The NIC waits {coal} after the first packet arrives before raising an interrupt: interrupts drop to {irqs}, each one carries {per} packets, and the price is an average latency of {mean}.
say.poll: Constant polling: this core spins at 100% whether or not packets arrive. In exchange it has the shortest latency, averaging {mean}, with the slowest 1% at {p99}.
say.pollFull: At a high packet rate, polling loses the least: it already keeps one core full, and the interrupt method has long since livelocked. Average latency {mean}.
say.napi: NAPI: packets arrive sparsely, so nearly every packet still takes an interrupt (carrying {per} each), much like pure interrupts, with CPU share {cpu}.
say.napiBatch: NAPI: each interrupt carries {per} packets, so the cost of being woken is spread out: CPU share {cpu}, average latency {mean}. At the same packet rate, pure interrupts would already need {irqcpu}.
say.napiFull: The packet rate is close to this core's processing limit. NAPI carries {per} packets per interrupt and has almost turned into constant polling: CPU share {cpu}, but no livelock.
:::

The default is 200,000 packets per second. With one interrupt per packet, the core is {pIcpu} occupied, with average latency {pIlat} µs. With NAPI, each interrupt carries {pNper} packets, CPU share drops to {pNcpu}, and average latency is {pNlat} µs. Constant polling has an average latency of {pPlat} µs, but the core spins at 100%. Drop the rate to 10,000 per second, and NAPI takes {pN1cpu} while pure interrupts take {pI1cpu}: no difference. Raise it to 300,000 per second, and pure interrupts cross the livelock threshold (about {pLive} thousand packets per second), with average latency still climbing to {pI3lat} ms, while NAPI takes only {pN3cpu}.

The other knob is the NIC's own **interrupt coalescing**: after the first packet arrives, it waits a little and gathers several before raising an interrupt. At 10,000 packets per second with a 50 µs wait, interrupts per second drop from {pI1irq} to {pCirq}, but average latency rises from {pI1lat} µs to {pClat} µs. The default mode of the Intel e1000e driver makes this trade-off: under heavy traffic it allows at most {itrB} interrupts per second, and for low-latency traffic the limit is {itrL}. Storage faces the same choice; for NVMe polling, see <a href='../why-nvme-is-fast/#ch7'>“Why NVMe Is So Fast,” chapter 7</a>.

The simulation has one core and one queue, and each packet's processing time is fixed. It does not model packets spread across several queues and cores (RSS; see <a href='../how-a-nic-moves-packets/#ch5'>“How a Network Card Moves Packets,” chapter 5</a>), nor the step where the softirq hands work to the ksoftirqd thread when it gets too busy. In the model, waking and processing are queued per packet and done one after the other, so past the threshold the queue keeps growing and latency diverges while throughput stays at the threshold. In a real livelock, interrupts have higher priority and steal time from protocol processing, so the number of packets finished actually falls; the model does not include that step. {.take}

## DMA and descriptor rings {#ch7}

::: strings
toc: DMA and descriptor rings
:::

Data bypasses the CPU. The driver lays out a ring of “descriptors” in memory, each slot holding the address of an empty buffer. When the network card receives a packet, it writes the data into the next buffer itself and marks that slot as used. Each side has a counter that only moves forward; when the producer catches up with the consumer the ring is full, and packets arriving after that can only be dropped. {.law}

On a conveyor-belt sushi bar, a ring of plates goes round: the chef puts sushi on empty plates, customers take them from the other end, and empty plates return to the chef. The number of plates on the belt is fixed. Once customers stop, the plates fill up quickly and the chef has to stop. A network card's receive ring works exactly the same way. The driver allocates a batch of buffers in advance and writes their physical addresses (more precisely, the addresses the device can use; see chapter 8) into a ring of descriptors. Each descriptor is small: the e1000 card's documentation gives {descB} bytes each, with a default of {rxDef} and a maximum of {rxMax}.

The network card is the **producer**. For each packet it receives, it uses DMA (direct memory access) to write the data into the buffer the next descriptor points to, writes back that descriptor's status, and moves one slot forward. The driver is the **consumer**: during an interrupt or a poll it sees used descriptors, hands the packets to the protocol stack, puts fresh empty buffers in their place, and writes “I have refilled up to here” to a register on the card. This is the doorbell from the last chapter, a write that needs no waiting. On Intel cards, the two positions are called head and tail: the hardware advances head, and the driver writes tail.

::: diagram dg-ring keys=dg.ring
cap: An eight-slot ring. Filled slots hold packets the card has written; hollow slots point to empty buffers the driver will refill. Both counters only count upward, and the index is the count modulo 8. When the producer has gone a full lap ahead of the consumer, the ring is full. Schematic.
aria: Diagram: a ring of receive descriptors in memory, filled by the network card and emptied by the driver, with two counters and a doorbell
prod: Network card (producer): DMA writes into a buffer, advances head
cons: Driver (consumer): takes the packet, refills a new buffer, writes tail (doorbell)
full: Packet present
empty: Empty buffer
rule: index = count & (N − 1); packets in ring = produced − consumed; equal to N means full
buf: Each slot points to a buffer
:::

How do the two positions tell full from empty? One clean method is to let both counters count upward and never wrap manually, taking the remainder by the ring size only when indexing: index = count &amp; (N − 1), so N must be a power of two. The difference between the two counts is the number of packets in the ring, and a difference equal to N means full. A 32-bit counter wraps to 0 naturally when it overflows, and the subtraction still gives the right answer. The io_uring author describes its ring counters the same way: they are “free flowing 32-bit integers, and rely on natural wrapping”. In the model below, both counters deliberately start close to 2<sup>32</sup>, so you can see them wrap around.

::: lab ch7-model
model.title: How large the receive ring must be to avoid drops
model.how: Drag the size of the ring, the average packets arriving per second, and how long the core is occupied by other work (within every {gPeriod} ms, this much time is one stretch when the driver cannot run at all). The curve shows the number of packets backlogged in the ring over 20 ms; the horizontal line is the ring's capacity, and reaching it means packets start to drop. The readouts give the drop rate, the final values of the two counters, and their indexes in the ring.
model.aria: Curve of packets backlogged in the receive ring over time, with a line for the ring's capacity
ctl.n: Ring size
ctl.rate: Average arrivals per second
ctl.stall: Core occupied
read.drop: Dropped
read.max: Peak backlog
read.mean: Average wait
read.need: Slots needed to ride out one stall
read.ctr: Producer / consumer counters (hex)
read.idx: Their indexes in the ring
read.bell: Doorbell share per packet
tuned: The driver spends 1.26 µs on each packet (as in chapter 6), the interrupt starts processing {gD} µs after the first packet arrives, and “occupied” happens once every {gPeriod} ms. These three are **tuned parameters**. The rule can be computed directly: to ride out one stall you need about packets per second × (stall + interrupt delay) slots, and over the long run the core's processing rate must exceed the arrival rate. Doubling the interrupt delay adds only 10 more slots needed under the defaults.
cv.x: Time (ms)
cv.y: Packets backlogged in the ring
cv.cap: capacity {n}
say.ok: The backlog in the ring peaked at {max} packets, far from the {n}-slot capacity, so not a single packet was dropped.
say.close: The backlog reached {max} slots, more than half the ring. A slightly larger burst or a slightly longer stall would drop packets.
say.drop: During the {stall} stall, when the core is occupied, packets keep arriving at {rate}, and roughly {need} slots are needed to ride it out, but the ring has only {n}: {drop} dropped. Enlarge the ring to hold the stall and nothing drops.
say.over: This is no longer a question of ring size. In every {period} ms, the core can receive packets for only part of the time, and it handles at most {cap} on average, fewer than the {rate} arriving. A bigger ring only fills later; {drop} is dropped.
:::

The default is a ring of {rxDef} slots, 500,000 packets per second, and the core occupied for 500 µs out of every {gPeriod} ms. To ride out that stall you need about {g0need} slots, a little more than the ring, so {g0drop} of packets are dropped; enlarging the ring to 512 slots makes the drop {g1drop}. Without any stall, the ring's backlog never exceeds {g2occ} packets: the ring's size is not for average traffic, it is for **bursts** and **stalls**. Stretch the stall to 1 ms, and the core can process on average only {gCap} million packets per second, fewer than the 0.5 million arriving. The backlog grows higher each round, and a bigger ring only fills later and drops later. What you need then is more cores or less work, not a bigger ring. Nor is a ring better the bigger it is: the more it backs up, the longer the packets at the back wait.

The same structure is everywhere: the NVMe submission and completion queues (see <a href='../why-nvme-is-fast/#ch4'>“Why NVMe Is So Fast,” chapter 4</a>), GPU command queues, and io_uring in chapter 11. The producer and consumer sit on two different processors (one is the CPU, one is the network card), so the order of writing descriptors and advancing counters matters. That is why the driver puts a memory barrier before ringing the doorbell, to make sure the descriptors arrive first. For why the barrier is needed, see <a href='../how-cores-share-memory/#ch9'>“How Cores Share Memory,” chapter 9</a>.

The model has just one receive ring and one core, with fixed packet sizes, and packets arrive as a Poisson process. Real traffic is burstier, and the card may split one large packet across several buffers. Descriptor formats differ between card makers; only their role is drawn here. How the card fetches descriptors ahead and writes them back: <a href='../how-a-nic-moves-packets/#ch3'>“How a Network Card Moves Packets,” chapter 3</a>. {.take}

## A page table for devices too: the IOMMU {#ch8}

::: strings
toc: A page table for devices too: the IOMMU
:::

The addresses a device uses for DMA should not be raw physical addresses it can write to freely. The IOMMU sits between the device and memory and, like the CPU's MMU, translates the addresses the device gives through a page table. Each device sees only the few pages the kernel mapped for it, and a write outside them is blocked and reported. {.law}

In the last chapter the network card wrote into memory on its own, and where it wrote was decided by the addresses in its descriptors. If the driver has a bug, or the device's firmware has been modified, it could write over the kernel's code. An external device plugged into a Thunderbolt port can also do DMA, which is why people have used one to read another computer's memory. For the attacks and the defenses, see <a href='../how-thunderbolt-works/#ch8'>“How Thunderbolt Works,” chapter 8</a>.

The remedy is the same as for protecting processes: add a translation layer. The device is given not a physical address but an **I/O virtual address** (IOVA). Every read and write the device makes passes through the IOMMU (Intel calls it VT-d, AMD calls it AMD-Vi, and Arm calls it SMMU). It finds that device's own I/O page table from the device's identifier and translates the IOVA into a physical address. An address with no entry in the page table is blocked, and an error is logged. The translations are also cached in an IOTLB, the same idea as the CPU's TLB (see <a href='../how-virtual-memory-works/#ch4'>“How Virtual Memory Works,” chapter 4</a>).

::: diagram dg-iommu keys=dg.iommu
cap: Two routes to memory. The CPU's address is translated by the MMU using the process's page table. The I/O virtual address the device gives is translated by the IOMMU using this device's page table, and unmapped addresses are blocked. Schematic.
aria: Diagram: the CPU reaches memory through the MMU and the device through the IOMMU, each with its own page table
cpu: CPU: virtual address
mmu: MMU: process page table, TLB
dev: Device: I/O virtual address (IOVA)
iommu: IOMMU: this device's I/O page table, IOTLB
ram: Physical memory
ok: Pages that are mapped
block: Not mapped: blocked, error logged
:::

Drivers do not manipulate this page table directly. Linux gives drivers a DMA mapping interface: the driver says “this buffer is for the device”, the kernel allocates an IOVA range, registers it in the I/O page table, and hands the IOVA to the driver to write into a descriptor. When the transfer is done, the mapping is removed. In the measurements of chapter 10, one read involves one mapping ({leeMap} µs) and one unmapping ({leeUnmap} µs). Unmapping must also invalidate the old translation in the IOTLB, so the kernel offers “strict” and “lazy” invalidation, a trade-off between safety and speed.

The IOMMU also makes another thing possible: handing a whole device, or part of one, directly to a virtual machine or a user program, without worrying that it will use DMA to reach past its bounds, since its page table maps only that virtual machine's or program's memory. The user-space drivers in chapter 12 and SR-IOV both rest on this.

This chapter has no model. The IOMMU's overhead depends on mapping granularity, invalidation policy and IOTLB hit rate, and there is no single set of numbers to copy. Interrupt remapping, PASID (one device using several page tables) and ATS (a device caching translations itself) are not covered. {.take}

## How a driver recognizes a device {#ch9}

::: strings
toc: How a driver recognizes a device
:::

The kernel does not know any particular device. What it knows is a description: a PCI device reports a vendor ID, a device ID and a class code, and an embedded board's device tree has a compatible string. Each driver carries a table of “the devices I can manage”. The bus compares each device against each table entry, and when one matches, it calls the driver's probe(). {.law}

When new students register, the school does not know each person. It looks at the major code on the admission letter and assigns them to a department, and the department checks the paperwork and arranges housing. The kernel divides the work the same way. Step one is **discovery**: the PCI bus is enumerated at boot, and each device's configuration space holds a vendor ID, a device ID and a three-byte class code (for enumeration, see <a href='../how-pcie-works/#ch6'>“Why PCIe Keeps Doubling,” chapter 6</a>). Devices on the motherboard that are not on PCI are described by ACPI tables (see <a href='../how-a-computer-boots/#ch6'>“How a Computer Boots,” chapter 6</a>), and Arm boards are described by device trees. Each device found is registered on its bus as a device.

Step two is **matching**. The Linux driver model documentation puts it plainly: when a device or a driver is registered on the bus, the bus's match() compares the device's identifiers with the identifiers the driver supports, and if they match, the device is given to that driver and its probe() is called. The PCI comparison is written in the kernel source, pci_match_one_id(): four fields, vendor, device, subvendor and subdevice, must each either be equal or be the wildcard PCI_ANY_ID that the driver wrote. The class code is first ANDed with the driver's mask and then compared. So the NVMe driver does not need to list every maker's disks. It writes a single entry, “class code 0x010802, mask 0xFFFFFF”, and any device claiming to be an NVMe controller belongs to it. The device-tree comparison is in __of_device_is_compatible(): the earlier a string in the node's compatible list matches, the higher the score. A board can list its specific model first and then a generic compatible model.

::: diagram dg-probe keys=dg.probe
cap: The path of a device in the Linux driver model, from discovery to binding. Either the device or the driver may register first; whichever arrives second triggers the match. Schematic.
aria: Diagram: a device being discovered, registered on the bus, matched against a driver, probed, and its three possible outcomes
disc: Discovery: PCI enumeration / ACPI tables / device tree
reg: Register a device on the bus
drv: Driver registers, with its ID table
match: bus->match(): does the ID table match?
probe: drv->probe()
ok: Returns 0: bound, sysfs link created
defer: -EPROBE_DEFER: goes on the deferred list
retry: Retried after any successful bind
fail: Other error: not bound
:::

Step three is **probe**. The driver checks that the hardware really works, maps the registers, requests the interrupt and allocates queues. On success it returns 0, the device is now **bound**, and a link between driver and device appears in sysfs. Probe can also say “not yet”: if the power supply, clock or GPIO it depends on has no driver yet, it returns -EPROBE_DEFER, and the driver core puts the device on a deferred list. In the kernel source's driver_bound(), each time a device binds successfully, driver_deferred_probe_trigger() is called once, which retries all the devices on the deferred list.

::: lab ch9-model
model.title: Five devices, four drivers: who pairs with whom
model.how: Tick which drivers are loaded, and choose the order they register in. Below, each step the driver core takes is listed in time order (register, match, probe, defer, retry), and the last column gives each device's outcome. Try registering the SD card controller's driver first, or leaving out the driver that provides power.
ctl.drv: Loaded drivers
drv.igb: igb (Intel network card)
drv.nvme: nvme
drv.dwmmc: dw_mmc (SD card controller)
drv.regfixed: reg-fixed-voltage (fixed-voltage supply)
ctl.order: Registration order
o.regfirst: Power first, then SD card
o.mmcfirst: SD card first, then power
log.aria: Each step the driver core takes, in time order
dev.aria: Each device's outcome
read.bound: Bound devices
read.def: Stuck on the deferred list
read.retry: Retries
dev.nic: Network card PCI 8086:1533, class 0x020000
dev.nvme: Solid-state drive PCI 144D:A80A, class 0x010802
dev.gpu: Graphics card PCI 10DE:2684, class 0x030000
dev.mmc: SD card controller (device tree) compatible = "acme,soc-dwmmc", "snps,dw-mshc", needs the vmmc supply
dev.reg: Fixed-voltage supply (device tree) compatible = "regulator-fixed"
ev.register: Driver {drv} registers on the bus
ev.match: {drv}'s table matches {dev}, calling probe()
ev.bound: probe() returns 0: {dev} bound to {drv}
ev.defer: probe() returns -EPROBE_DEFER: the power {dev} needs has no driver yet, so it goes on the deferred list
ev.retry: A device has just bound successfully, so retry {dev} on the deferred list
ev.nodrv: No driver's table matches {dev}, so it is left alone
st.bound: Bound: {drv}
st.deferred: Stuck on the deferred list
st.none: No driver
why.nvme: Class code comparison: (0x010802 ^ 0x010802) & 0xFFFFFF = 0
why.mmc: Compatible string no. {i} matches (the earlier, the better)
say.ok: The power driver registered first, so when the SD card controller probed, the power was already there, and it succeeded the first time. {bound} devices bound. The graphics card has no matching driver and stays put until someone loads one.
say.retry: The SD card controller probed first, but the power it needs is not there yet, so it returns -EPROBE_DEFER. As soon as the power driver binds, the driver core retries automatically, and this time it succeeds. In the end the same {bound} devices bind; the retry counter reads {retries}.
say.stuck: The power driver is not loaded, so the SD card controller stays stuck on the deferred list forever. The boot log shows a “deferred probe pending” line. This is one of the most common reasons a device “does not come up” on an embedded board.
say.missing: {n} devices have no driver. They are on the bus, and the kernel can see them, but nobody manages them, so they cannot be used.
:::

In the default order, four drivers bind {b1bound} devices, and the graphics card sits idle because no driver for it is loaded. Switch to registering the SD card controller's driver first: it is deferred on its first probe, then retried as soon as the power binds (retries: {b2retry}), with the same result. This is the point of deferred probing: the drivers can load in any order, and the dependencies are resolved by retrying. The whole mechanism is Linux's **device driver model**: three things, bus, device and driver, plus three actions, match, probe and bind.

After binding, the driver registers the device as one of three kinds, depending on what it is: a **character device** (read and written as a byte stream, such as a serial port or a keyboard under /dev/input), a **block device** (read and written at random in fixed-size blocks, such as /dev/nvme0n1), or a **network device** (not in /dev at all; it is called eth0 or enp3s0 and sends and receives packets). Programs see these three kinds of interfaces and never see the PCI number. The next chapter follows one read() from a file all the way down to a block device.

The model has only two kinds of bus, PCI and device tree, and one dependency. Real matching also has driver_override, IDs added at runtime, ACPI _HID and _CID, and probe can run asynchronously. The graphics driver's ID table is deliberately left unloaded here, which does not mean the driver does not exist. {.take}

## Every layer one read() passes through {#ch10}

::: strings
toc: Every layer one read() passes through
:::

When the data is already in the page cache in memory, a 4 KB read() takes under a microsecond: look it up, copy it, return. When it is not there, the read passes through the file system, the block layer and the driver, waits for the device, and is woken again by an interrupt. Those software steps alone take several microseconds. On the fastest disks, the software already takes as long as the hardware. {.law}

Borrowing a book from a library: if it is on the return cart at the front desk, you reach out and take it; if not, you look up the call number, go into the stacks, climb the stairs and search the shelves. Linux's read path is layered this way. At the top is the **VFS** (virtual file system): whatever lies beneath, whether ext4, XFS or a network file system, read() first arrives here, and finds the file and its inode from the file descriptor. Next is the **page cache**: the kernel keeps the contents of files it has read in memory, page by page, and looks them up by “file + offset”. If the page is found, it is copied straight into the user's buffer, and the job is done.

::: diagram dg-stack keys=dg.stack
cap: A read() goes down through the layers and comes back up. On a page-cache hit it turns back at the second layer. Schematic; the height of each layer does not indicate time spent.
aria: Diagram: the layers a Linux file read passes through: VFS, page cache, file system, block layer, driver, device
app: Application: read(fd, buf, 4096)
vfs: VFS: file descriptor → file → inode
pc: Page cache: look up the page by “file + offset”
hit: Hit: copy, return
fs: File system (ext4, XFS): file block → block on disk
blk: Block layer: bio → request, per-core queues
drv: Driver (nvme): DMA mapping, submission queue, doorbell
dev: Device: read flash, DMA write back to memory
back: Interrupt → completion → wake the process
user: User mode
kern: Kernel
:::

If it is not found, the kernel allocates a page of memory, has the **file system** translate “the file's nth block” into “the nth block on disk” (a logical block number; see <a href='../what-a-drive-is-made-of/#ch1'>“What a Drive Is Made Of,” chapter 1</a>), inserts the page into the page cache, and passes the request to the **block layer**. The block layer packages it as a bio, turns it into a request, and places it in a queue per core. Finally the **driver**: the NVMe driver DMA-maps the buffer (chapter 8), fills a submission-queue entry, and rings the doorbell (chapter 4). When the device finishes, it sends an MSI interrupt (chapter 5). The completion function removes the mapping and wakes the sleeping process, which then copies the data to the user. Lee et al. traced this path step by step in 2019 on an Optane solid-state drive: a 4 KB random read took {leeTot} µs in total, of which the device itself took {leeDev} µs, block-layer submission {leeBio} µs, the context switch that wakes the process {leeCtx} µs, and the copy to the user {leeCopy} µs.

::: lab ch10-model
model.title: One 4 KB read(): how long each step takes
model.how: Pick whether this read hits the page cache, misses it, bypasses it with O_DIRECT, or uses polling instead of interrupts on top of O_DIRECT; then pick the kind of disk. The top bar is the timeline of the whole read, to scale, and the bottom bar magnifies only the software part. Drag “page cache hit rate” to see the average time per read.
model.aria: Time spent at each layer of a read, shown as two timelines: the whole read and software alone
ctl.mode: This read
m.hit: In the page cache
m.miss: Not in the page cache
m.direct: O_DIRECT
m.polled: O_DIRECT + polling
ctl.dev: Disk
d.optane: Optane solid-state drive
d.nand: Ordinary flash solid-state drive
d.hdd: Hard disk drive
ctl.hit: Page cache hit rate
steps.aria: Each step this read passes through, with its time
read.total: This read
read.soft: Share that is software
read.cpu: Time the CPU is busy
read.avg: Average per read at this hit rate
tuned: The time for each step is read from figure 4(a) of Lee et al.'s paper (Optane disk, 4 KB random read). The steps shown in the figure add up to {leeRest} µs less than the total of {leeTot} µs, and this essay records that gap as the step “interrupt and the rest”; the polled read drops that whole step along with the wake-up, which is a simplification. The 0.10 µs each for entering and leaving the kernel comes from table 1 of the Arrakis paper (a different machine) and is added on top of the figure's total; if that total already includes the crossings, about 0.2 µs is counted twice. The device time for an ordinary flash disk is recorded as 80 µs and for a hard disk as 4 ms; these are orders of magnitude only (for why hard disks are so slow, see <a href='../what-a-drive-is-made-of/#ch2'>“What a Drive Is Made Of,” chapter 2</a>). The cost of pinning the user's buffer in memory for O_DIRECT is not counted.
cv.all: Whole read
cv.soft: Software only
st.enter: Enter kernel
st.lookup: Look up page cache
st.alloc: Allocate a page
st.lba: File system: find block on disk
st.insert: Insert into page cache
st.bio: Block layer: submit bio
st.dmamap: Driver: DMA map
st.submit: Driver: fill queue, ring doorbell
st.device: Device
st.rest: Interrupt and the rest
st.complete: Block layer: complete request
st.dmaunmap: Driver: unmap
st.ctx: Wake process
st.copy: Copy to user
st.ret: Return to user mode
say.hit: In the page cache: enter the kernel, look up, copy 4 KB, return. Total {total}, and the disk is never touched.
say.miss: Not in the page cache: total {total}, of which the device takes {device}. The other {soft} is software: paging, inserting into the cache, submitting, mapping, the interrupt, the wake-up, copying.
say.direct: O_DIRECT skips the page cache: no page allocation, no cache insertion, no copy; the data is DMA'd straight into the user's buffer. Total {total}. The cost is that reading the same block again means another trip to the disk.
say.polled: Polling: the process does not sleep but watches the completion queue, saving the interrupt and the wake-up. Total {total}; during this time the CPU stays busy, {cpu} of it.
:::

A read that hits the page cache takes {rHit} µs, and one that misses takes {rMiss} µs, a ratio of {rRatio}×. In the miss, software takes {rSoft}. On an ordinary flash disk, software takes only {rNsoft}: a slow disk hides the software cost, and a fast disk exposes it. This is why the kernel's I/O stack has been slimming down in recent years. At a 90% hit rate, the average read takes {r90} µs. Bypassing the page cache with O_DIRECT makes a missed read take {rDirect} µs; replacing interrupts with polling makes it {rPolled} µs, at the price of the CPU spinning for the whole time the device works (the trade-off from chapter 6).

The page cache also handles writes. A write() under **buffered I/O** only copies data into the page cache, marks the page dirty and returns; the kernel writes dirty pages back to disk later. Anything not written back before a power loss is lost, which is why databases use fsync() to force it out. **Direct I/O** (O_DIRECT) goes to the disk every time. It suits programs that manage their own caching, such as databases, which do not want the kernel caching a second copy. For sequential reads, the page cache also does **readahead**: if it sees you reading in order, it brings the next few pages in early.

The figures for each step come from a 2019 Optane disk and the kernel of that time; today's numbers will differ. This essay looks only at one 4 KB read, not at large reads, readahead or write-back. {.take}

## Fewer trips through the door: epoll and io_uring {#ch11}

::: strings
toc: Fewer trips through the door: epoll and io_uring
:::

A server holding tens of thousands of connections at once, with one thread per connection and one system call per read, would spend most of its CPU on gate fees and context switches. epoll lets one call tell you which connections have data now. io_uring goes further, placing two shared rings between program and kernel, with requests and results written into the rings, so one call can submit a batch, collect a batch, or even make no call at all. {.law}

The traditional style is the blocking read(): when there is no data, the thread sleeps, and when data arrives it is woken, so each I/O costs one system call and one wake-up. Tens of thousands of connections mean tens of thousands of threads. **epoll** asks the question differently: first register the file descriptors you care about with epoll_ctl, then call epoll_wait once. The kernel returns all the ones that are ready, and you read each one. Each I/O still needs one read, but the waiting has been merged.

**io_uring** (added to Linux in 2019) merges the reads themselves too. The program calls io_uring_setup to create a pair of rings, mapped into its address space with mmap. The submission queue (SQ) is written by the program and read by the kernel, and each entry is a 64-byte request (which file, which offset, where to put the data). The completion queue (CQ) is written by the kernel and read by the program, and each entry is a 16-byte result. Like the descriptor ring in chapter 7, each side advances its own counter. The program writes a batch of requests and submits them with one io_uring_enter call, and the same call can also wait for several completions. If SQPOLL is requested when the ring is created, the kernel starts a thread that watches the submission queue full time, and the program does not even need to call io_uring_enter.

::: diagram dg-uring keys=dg.uring
cap: Both rings are in memory shared by the program and the kernel. The submission queue is written at its tail by the program and read at its head by the kernel; the completion queue works the other way round. io_uring_enter is used to notify and to wait, and can be skipped when SQPOLL is on. Schematic.
aria: Diagram: io_uring's submission and completion queues are shared between program and kernel, each with head and tail counters
app: Program
kern: Kernel
sq: Submission queue SQ: 64-byte request per entry
cq: Completion queue CQ: 16-byte result per entry
sqtail: Program writes tail
sqhead: Kernel reads head
cqtail: Kernel writes tail
cqhead: Program reads head
enter: io_uring_enter: submit a batch, wait for a batch (optional)
sqpoll: SQPOLL: kernel thread watches the SQ, no call needed
shared: Shared memory (mmap)
:::

::: lab ch11-model
model.title: How many system calls per I/O
model.how: Pick a style, then drag “I/Os per call” (for epoll, how many ready connections one call returns; for io_uring, how many are submitted per batch), and pick the patch situation (reusing the system call overhead model from chapter 3). The bars show how many I/Os per second each of the four styles can do on one core. The readouts give the system calls per I/O and the share spent at the gate and on switches.
model.aria: I/Os per second that four styles can do
ctl.api: Style
a.block: Blocking read()
a.epoll: epoll + read()
a.uring: io_uring
a.sqpoll: io_uring + SQPOLL
ctl.k: I/Os per call
ctl.prof: Patch situation
read.sys: System calls per I/O
read.iops: I/Os per second on one core
read.over: Spent at the gate and on switches
read.cores: Cores used
tuned: The work of each I/O is recorded as 1.26 µs (as in chapter 6), and one wake-up as 0.95 µs (the context switch measured by Lee et al.). Both are **tuned parameters** chosen from the measurements. The model counts only gate fees and wake-ups; it does not simulate the device.
say.block: Blocking read(): one system call and one wake-up per I/O, and {over} of the time is not doing work. One core can do {iops}.
say.epoll: epoll: one epoll_wait returns {k} ready connections, each of which is then read once, so system calls per I/O come down to {sys}. The wake-ups are spread out, but the gate fees have barely dropped. It can do {iops}.
say.uring: io_uring: {k} requests are submitted with one io_uring_enter and collected together. System calls per I/O come down to {sys}, and it can do {iops}.
say.sqpoll: SQPOLL: the program makes no system calls at all and can do {iops}. But the kernel side has a thread spinning all the time, so counting it as two cores, each core yields {percore}.
:::

With 32 I/Os per batch and KPTI with PCID, the blocking read() makes {aBsys} system calls per I/O, and one core does {aBiops} thousand per second. epoll makes {aEsys} per I/O, more rather than fewer, since it saves wake-ups, not gate fees. io_uring makes only {aUsys} per I/O and does {aUiops} thousand per second. SQPOLL brings system calls to zero and does {aSiops} thousand per second, but that is the output of two cores, so each core yields only {aScore} thousand. It suits machines where a core can be set aside for it.

Axboe, the io_uring author, reported measurements in his 2019 notes. On his test machine, one core doing 4 KB random reads managed about {axPoll} million per second in polling mode and about {axIrq} million with interrupts, while the old libaio topped out at {axAio} thousand. No-op operations reached {axNopLo} to {axNopHi} million per second, results he called “mostly bound by the number of system calls that have to be performed”. At that time a ring held at most {axMax} entries, which had to be a power of two. It has one more benefit that is easy to overlook: when the data is already in the page cache, the request completes on the spot inside the submitting call, without a pointless round trip. The model in this chapter is called the **system calls per I/O** model.

The model assumes each ready connection has exactly one I/O and every batch is full. In a real server, batch sizes vary with load, and epoll has modes such as edge-triggered operation that allow fewer reads. io_uring now supports far more than reads and writes, including network send and receive, opening files and timeouts. {.take}

## Skipping the kernel, and devices inside a virtual machine {#ch12}

::: strings
toc: Skipping the kernel, and devices inside a virtual machine
:::

Since the gate fees, copies and wake-ups together take longer than the device itself, the most thorough remedy is to not enter the kernel at all: map the network card's or the SSD's queues directly to a user program, which polls them on a dedicated core. The cost is that this core is always 100% busy, and everything the operating system would have done for you, such as the protocol stack, the file system and isolation, you must now do yourself. {.law}

The Arrakis paper of 2014 broke down the time for Linux to send and receive one UDP packet (on a Xeon E5-2430 with a 10 Gb card). A round trip took {arTot} µs in total. Of that, the network stack for receiving took {arStack} µs, and the rest was the sending network stack, scheduling, copying and two kernel crossings. When the receiving process is asleep, the total rises to {arIdle} µs. When they handed the network card's queues straight to the application, the POSIX-compatible interface took {arP} µs, and their own native interface only {arN} µs.

Today's approaches have three names. **DPDK** handles network cards, and **SPDK** handles solid-state drives. The kernel sets things up once, and through VFIO it hands the device's registers and DMA mappings to the user program (the “kernel opened the gate” idea from chapter 1, with the IOMMU from chapter 8 ensuring it cannot reach out of bounds). After that, sending and receiving all happen in user mode: a poll-mode driver watches the completion queue on a dedicated core, with no interrupts, no system calls and no copies. The SPDK documentation calls the bedrock of SPDK “a user space, polled-mode, asynchronous, lockless NVMe driver”. **RDMA** goes further: the network card reads and writes memory registered on another machine directly, and that machine's CPU does not take part at all.

::: diagram dg-bypass keys=dg.bypass
cap: Left: the ordinary path, where every packet goes through the kernel. Middle: DPDK / SPDK, where the kernel only sets things up and the data path runs in user mode. Right: SR-IOV, where a virtual function split off a network card is handed to a virtual machine with the help of the IOMMU. Schematic.
aria: Diagram: three data paths: the ordinary path through the kernel, the user-mode driver that bypasses the kernel, and direct assignment to a virtual machine
a: Through the kernel
b: User-mode driver
c: Direct to a virtual machine
app: Application
sys: System call
stack: Kernel protocol stack / file system
kdrv: Kernel driver
pmd: Application + poll-mode driver (dedicated core)
vfio: Kernel: VFIO set up once only
vm: Driver inside the virtual machine
vf: Virtual function (VF)
dev: Device
iommu: IOMMU blocks out-of-bounds access
:::

Is it worth it? Look at it with the **interrupts, polling and NAPI** model from chapter 6: when packet rates are low, constant polling wastes a core; when the rate is high enough that interrupts would livelock, polling is the cheapest. Look at it with the **system call overhead** model from chapter 3: the less work each job carries, the larger the gate's share, and the bigger the gain from skipping the kernel. Haas and Leis tested this in 2023 with eight solid-state drives. Together they can do {haasIops} million random reads per second, and by their CPU's arithmetic each I/O has a budget of only {haasBud} cycles. SPDK saturated them with {haasSpdk} threads, and io_uring in polling mode needed about {haasPoll}; libaio and io_uring using interrupts reached only {haasIrq} million per second even with {haasIrqT} threads. Their conclusion is that without SPDK, about half the cores are simply submitting and collecting I/O. But they also write that user-space I/O has a large effect on users and on program design: there is no page cache and no file system, and several programs cannot share one disk.

Devices inside a virtual machine are the other side of the same problem. The operating system in the guest believes it is talking to real hardware. The slowest approach is to have the hypervisor emulate every register of an old network card, so each time the guest touches a register it traps into the hypervisor. **virtio** takes a paravirtualized approach: the guest knows it is in a virtual machine, and it exchanges requests with the host through rings in shared memory (called virtqueues, the same idea as the descriptor ring in chapter 7), ringing a doorbell only when needed. The virtio specification is maintained by OASIS, and version 1.2 became a committee specification in July 2022. **SR-IOV** lets one physical network card or SSD split on PCIe into many “virtual functions”, each with its own queues and registers. Each is handed directly to a virtual machine with the IOMMU's help, so the data path does not touch the host's software at all.

This chapter has no new model. The Arrakis figures and the Haas and Leis figures come from different years, machines and workloads, and cannot be compared with each other. RDMA details and compromise approaches such as vhost and vDPA are not covered. {.take}

## Where the frontier is (November 2026) {#ch13}

::: strings
toc: Where the frontier is (November 2026)
:::

The wall is still in place; what has changed is the door in it. io_uring lets one system call do hundreds of things, but because it is so large and so new, it became the part of the kernel most often exploited in Google's kernel bug bounty. Drivers are starting to be written in Rust. More and more device logic is moving into user mode, with the kernel only handing out the keys. {.law}

Below, the claims fall into three groups: what has already been written into specifications and source code, what has already happened, and what the parties with a stake have said. Dates are given throughout.

### Already written into specifications and source code {#h.est .sub3}

- As of mid-November 2026, the Linux mainline version is 7.4-rc2 (the top-level Makefile of the kernel source), and the latest stable release is 7.3.4 (kernel.org, released 10 November 2026). In the kernel documentation, the sysctl io_uring_disabled can be set to 0 (the default: anyone may create an io_uring), 1 (only privileged processes, or processes in a designated group, may create one) or 2 (no one may create one). {#e1}
- Zero-copy receive for io_uring is already in the kernel documentation. The network card splits headers from data at the layer 4 boundary, so the headers go through the kernel's TCP stack as usual, and the data lands directly in user memory. The card's flow-steering rules have to be configured by the user with ethtool. {#e2}
- ublk lets block-device logic be implemented in user mode: requests on /dev/ublkb\* are passed through io_uring's passthrough commands to a user-mode service program, and the results go back through io_uring too. The NAPI documentation also has an irq-suspend-timeout: when an application drives packet reception with epoll, the device's interrupts can be fully suspended for this period. {#e3}

### Already happened {#h.demo .sub3}

- Google security blog, 14 June 2023: over the past year, {gShare}% of the submissions to its kernel vulnerability reward program (kCTF VRP) exploited the io_uring component of the Linux kernel, and Google paid out around 1 million dollars for io_uring bugs alone. As a result, ChromeOS disabled io_uring, Android uses a seccomp-bpf filter to keep it unreachable to apps, and it is disabled on Google's production servers. {#d1}
- At the Kernel Maintainers Summit on 10 December 2025, the consensus among the assembled developers was that “Rust in the kernel is no longer experimental” (LWN). An Android Binder driver rewritten in Rust entered the mainline in Linux 6.18. By 7.4-rc2, the old C version of Binder has been removed from the mainline, and only the Rust version remains under drivers/android (checked against git.kernel.org for this essay). {#d2}
- virtio 1.2 became an OASIS committee specification in July 2022. A draft of the committee specification for version 1.3 was published for public comment in October 2023; this essay has not found whether it was later finalized. {#d3}

### What the parties with a stake have said {#h.claim .sub3}

- In the same post Google grants that io_uring “brings performance benefits, and promptly reacts to security issues”, but calls it “a fairly new part of the kernel” that is still affected by severe vulnerabilities, so it restricts io_uring for now while it explores ways to sandbox it. That is the judgement of one large user; restricting it and fixing it are both still going on. {#c1}
- The patch removing the C version of Binder comes from Carlos Llamas, a Google engineer. As Hardware Busters reported on 19 September 2026, paraphrasing the patch, he wrote that after fifteen years of accumulated complexity the C driver had become very painful to maintain, and that adding features to it kept running into vulnerabilities. Rust's supporters argue that it rules out a whole class of memory errors at compile time. These are the parties' own statements, not independent statistics. {#c2}

What to watch next: whether io_uring can be locked down with finer permissions without giving up performance, so that distributions no longer have to switch it off wholesale; whether more drivers, for graphics and network cards, follow into Rust; and whether the boundary between user-space and kernel drivers keeps moving toward user space.

These facts will go out of date. The sources and access dates are in BRIEF.md in this directory. This essay does not judge which approach is better. {.take}

## Three questions when a program is stuck on I/O {#ch14}

::: strings
toc: Three questions when a program is stuck on I/O
:::

An I/O is a chain: a system call, the kernel's layers, the driver, the device, the interrupt, the wake-up. When it is slow, first ask which link in the chain the time is spent on, and then decide whether to change the disk, the way the program does I/O, or the architecture. {.law}

{.plain .qs}
1. **Is it waiting on the device, or on software?** When device time is far larger than software time (random reads on hard disks and ordinary flash), optimizing the software does little; you need cache hits and concurrency. When the device is fast enough to take only microseconds, the few microseconds of software become the main cost (chapter 10), and only then is it worth considering O_DIRECT, polling and io_uring. {#q1}
2. **How many system calls and wake-ups does each job take?** When small requests are sent one by one, gate fees and wake-ups can eat most of the time (chapters 3 and 11), so first try submitting them in a batch. The share of CPU time spent in system mode is the fastest clue. {#q2}
3. **Are there too many interrupts, or too few?** When packets or requests are dense, too many interrupts can drown the core in being woken (chapter 6): turn on interrupt coalescing, or have the driver poll more. When requests are sparse and latency matters, coalescing only makes each request wait longer. When packets are dropped, also check whether the ring is large enough to ride out a stall (chapter 7). {#q3}

Back to the opening question. A program cannot touch hardware because the CPU checks the *privilege level* on every instruction. Its only door is the *system call*: one instruction, a few registers, and a table. On the other side of the door, a device is just a row of *registers*. The kernel rings the doorbell and gives commands, the device calls out with an *interrupt* when it is done, and the data itself is moved into memory by *DMA* along a *descriptor ring*, with the *IOMMU* controlling where it may write. The kernel pairs devices with *drivers* through an ID table. One read() passes through the VFS, the *page cache*, the file system, the block layer and the driver, and is then called back by an interrupt. The rest of the engineering is about using that door less: carry more on each trip, or skip the door altogether. {#sum .sum tag=div}

Related essays: <a href='../how-pcie-works/#ch7'>“Why PCIe Keeps Doubling,” chapter 7</a> (the bytes of MSI interrupts), <a href='../why-nvme-is-fast/#ch4'>“Why NVMe Is So Fast”</a> (submission and completion queues, and polling), <a href='../how-virtual-memory-works/#ch10'>“How Virtual Memory Works”</a> (page tables and KPTI), <a href='../how-thunderbolt-works/#ch8'>“How Thunderbolt Works,” chapter 8</a> (DMA attacks and the IOMMU), <a href='../how-a-computer-boots/#ch11'>“How a Computer Boots”</a> (how the kernel is brought in), <a href='../how-cores-share-memory/#ch9'>“How Cores Share Memory”</a> (memory barriers), <a href='../coherent-interconnects/#ch3'>“How Chips Share Memory”</a> (CXL, another way for devices and CPUs to share memory), and <a href='../how-a-cpu-runs-a-program/#ch8'>“How a CPU Runs a Program”</a> (exceptions and pipeline flushes). The not-yet-live essay “How a Web Page Reaches Your Phone” covers how packets travel through the network. {#links style="margin-top:2em"}

::: footer wrap=none
How the OS Talks to Hardware · a long essay you can play with. Rules: Intel 64 and IA-32 Architectures Software Developer's Manual (the descriptions of SYSCALL, IN and HLT), the Arm trusted firmware design documentation, the syscall(2) man page and the system call table of Linux 7.4-rc2, Linux kernel documentation (driver model, device I/O, NAPI, sysctl, e1000/e1000e, io_uring zero-copy receive, ublk), the kernel source for pci_match_one_id(), __of_device_is_compatible() and driver_bound(); OSTEP chapter 36, I/O Devices. Measurements: Soares and Stumm, FlexSC, OSDI 2010; Peter et al., Arrakis, OSDI 2014; Neugebauer et al., SIGCOMM 2018; Ren et al., SOSP 2019; Lee et al., USENIX ATC 2019; Haas and Leis, VLDB 2023; Axboe, “Efficient IO with io_uring”, v0.4, 2019. Models: receive livelock and NAPI (Mogul and Ramakrishnan 1997; the kernel NAPI documentation). Sources, dates, and points not verified are in BRIEF.md in this directory.
:::
