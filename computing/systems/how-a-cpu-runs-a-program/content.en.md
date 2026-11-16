---
lang: en
title: How a CPU Runs a Program · a long essay you can play with
desc: How does a line of code become clock-by-clock work inside a CPU, and why can the same program run several times faster with different code or a different CPU? Starting from the instruction set as a contract: RISC-V registers and its six instruction formats, hand-compiling a loop to machine code, the single-cycle datapath and its longest path, the five-stage pipeline, data hazards and forwarding, the cost of branches, the iron law of performance, how x86 splits instructions into micro-ops, and the 2026 frontier (RVA23, Armv9.8, APX). Every model is real: an assembler, an instruction interpreter and a cycle-by-cycle pipeline simulator.
---

::: strings
nav.back: ← Knowledge Index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.ps: {v} ps
u.ns: {v} ns
u.ghz: {v} GHz
u.x: {v}×
u.cyc: {v} cycles
u.B: {v} bytes
u.ins: {v} instructions
u.none: —
dg.single.aria: Schematic of the single-cycle RISC-V datapath: PC, instruction memory, register file, immediate generation, ALU, data memory, write-back multiplexer and control unit
dg.single.cap: Single-cycle datapath, simplified from the structure in chapter 4 of Patterson and Hennessy. Solid lines carry data; the control unit's seven control lines are indicated by one dashed stub, without their wiring. Within one cycle a signal travels the full path from the PC, and when the clock ticks the results are written to the register file, data memory and PC. Schematic, not to scale.
dg.sc.pc: PC
dg.sc.add4: +4
dg.sc.addB: + immediate
dg.sc.imem: Instruction memory
dg.sc.regs: Register file
dg.sc.imm: Immediate generation
dg.sc.alu: ALU
dg.sc.dmem: Data memory
dg.sc.mux: Mux
dg.sc.ctrl: Control unit
dg.sc.sig: RegWrite · ALUSrc · ALUOp · MemRead · MemWrite · MemtoReg · Branch
dg.sc.sigN: Seven control lines
dg.sc.pcsrc: Jump?
dg.sc.wb: Write-back
dg.sc.rs: rs1 rs2 rd
dg.pipe.aria: Schematic of the five-stage pipelined datapath, with four pipeline registers between stages
dg.pipe.cap: Five-stage pipeline: the same datapath cut into five stages, with four rows of pipeline registers between them that latch unfinished work at the end of each cycle. The result and destination register number return along the bottom line to the register file in the ID stage. Schematic, not to scale.
dg.pp.IF: IF fetch
dg.pp.ID: ID decode
dg.pp.EX: EX execute
dg.pp.MEM: MEM memory
dg.pp.WB: WB write
dg.pp.r1: IF/ID
dg.pp.r2: ID/EX
dg.pp.r3: EX/MEM
dg.pp.r4: MEM/WB
dg.pp.imem: Instruction memory
dg.pp.regs: Register file
dg.pp.alu: ALU
dg.pp.dmem: Data memory
dg.pp.mux: Mux
dg.pp.back: Result and rd back to register file
dg.pp.backS: Write back to register file
:::

# How a CPU Runs a Program {#hero}

::: strings
kicker: Computing · Systems · a long essay you can play with
:::

What becomes of the one line of code you write? How does it turn into a cycle-by-cycle sequence of actions inside the CPU?<br>Why can the same program run several times faster when it is written another way, or on another CPU? {.sub}

Follow one line of C, <code>sum += a[i];</code>, all the way down. First it becomes a few instructions defined by the instruction set, each one {xlen} bits of 0s and 1s. Then watch the simplest possible CPU finish one instruction in one clock cycle, and see why that is slow. Next, cut the work into five stages so that five instructions are in flight at once, and see how they get in each other's way and how the CPU works around it. Finally, use one formula to put the way the code is written and the chip it runs on into a single calculation. **The models on this page are real**: an assembler that encodes RISC-V as the specification describes, an interpreter that executes instructions one at a time, and a five-stage pipeline simulator that advances one cycle at a time. {.lead}

An AI wrote this page. The instruction encodings come from RISC-V International's official unprivileged ISA manual, and were checked one by one against an independent disassembler; the x86 bytes were produced by actually assembling the code. The datapath and pipeline are the classic teaching models from Patterson and Hennessy's textbook. **Real CPUs are far more complicated**, and each chapter ends by saying what its model leaves out. The component delays are textbook example numbers, not measurements of any chip. This page explains mechanisms only. It does **not judge which company's chips or instruction sets are better**. {.note}

## A contract: the instruction set {#ch1}

::: strings
toc: A contract: the instruction set
:::

Software and hardware share a contract called the instruction set. It defines which instructions exist, how each one is written as 0s and 1s, and what the registers and memory hold afterwards. Writing programs above the contract and building chips below it are separate jobs. {.law}

A wall socket is a good example. It fixes the shape of the holes, the voltage and the frequency. The kettle maker does not need to know which power station the electricity came from, and the power station does not need to know whether you plug in a kettle or a lamp. As long as both sides keep the agreement, any appliance fits any socket.

The CPU has a similar agreement, called the **instruction set architecture** (ISA). In <a href='../switches-that-compute/#ch9'>“How a Pile of Switches Learned to Do Arithmetic”, chapter 9</a>, we built a machine with only seven instructions: the top four bits said what to do, and the bottom four bits gave an address. Those seven instructions and their encodings were that machine's instruction set. A compiler reads only the contract and translates C code into the instructions it defines. A chip designer also reads only the contract, and may use as many transistors or pipeline stages as they like, provided every instruction leaves the registers and memory in the state the contract describes.

::: diagram dg-layers keys=dg.layers
cap: The instruction set is the middle line: the software above depends only on it, and every implementation below must honour it. The same machine code can run on any of the three CPUs on this page, with the same result but different speeds. Schematic, not to scale.
aria: Diagram: from C code through the compiler to the instruction set, then to different microarchitectures and circuits
c: C code  sum += a[i];
comp: Compiler
asm: Instruction  lw t2, 0(t1)
mc: Machine code  0x00032383
isa: Instruction set (contract)
isaS: Instruction set
isaEx: x86 · Arm · RISC-V
u1: Single-cycle
u2: Five-stage pipeline
u3: Out-of-order, multi-issue
u1s: Chapter 4
u2s: Chapter 6
u3s: Later essay
micro: Microarchitecture: how it is built, how fast
gates: Logic gates and transistors
sw: Software sees only the line above
hw: Hardware need only honour this line
:::

So x86, Arm and RISC-V are not three chips; they are three contracts. Intel and AMD maintain x86, which most Windows PCs and servers use. Arm licenses its contract, and phones and Apple's computers use it. The RISC-V contract is public, maintained by a non-profit foundation, and anyone can build to it for free. Under one contract there are many implementations: a watch chip and a server chip can run the same Arm machine code, and their speeds can differ by a factor of a thousand. This page uses RISC-V for its examples, because its contract is the shortest and most regular, and its whole specification can be read for free.

The contract also leaves things out. It says that after <code>add</code> the destination register holds the sum of the two inputs, but not how many cycles that takes. It says what a memory read returns, but not how long the read takes. **How fast is not in the contract**. It is decided by the layer beneath it, the **microarchitecture**. The second half of this page is about that layer.

This chapter has no model. From the next chapter on, every instruction can be encoded, decoded and executed on the page. {.take}

## 32 registers, six formats {#ch2}

::: strings
toc: 32 registers, six formats
:::

RV32I has only {nregs} registers, each {xlen} bits wide, and six instruction formats. Every instruction is exactly {xlen} bits long, and register numbers always sit in the same few bit positions, so the hardware can read registers before it has decoded the instruction. {.law}

A register is the CPU's scratch paper: a few dozen cells, each holding one number, read or written in a single cycle. RV32I has {nregs} of them, called x0 to x31, each {xlen} bits wide; a number from 0 to 31 needs only {regBits} bits to write down. x0 is special: it always holds 0, and anything written to it is discarded. That seems to waste a register, but it is convenient. “Set t0 to 0” can be written as “t0 = x0 + 0”, and “do nothing” as “x0 = x0 + 0”, so the contract needs no separate instructions for these. The other registers have conventional uses and names: x1 is called ra and holds a function's return address; x2 is sp, the stack pointer; a0 to a7 pass arguments and return values; t0 to t6 are temporaries.

An instruction has to say three things: which operation to perform, which registers to take the operands from, and where to put the result. RISC-V packs these into {xlen} bits in one of six layouts, called R, I, S, B, U and J formats. The rightmost {opBits} bits are the **opcode**, which says which broad class the instruction belongs to. funct3 and funct7 narrow it down, for example to addition or subtraction. rs1 and rs2 are the numbers of the two source registers, and rd is the destination register. The remaining bits hold an **immediate**, a constant written directly in the instruction.

::: diagram dg-fmt keys=dg.fmt
cap: The six RV32I formats, drawn to scale by bit width (bit 31 leftmost, bit 0 rightmost). rs1, rs2, rd and the sign bit of the immediate sit in the same positions in every format. On narrow screens, f7, f3 and op are short for funct7, funct3 and opcode. Bit fields from the RISC-V unprivileged ISA manual, v20260120.
aria: Bit-field layout of the six RV32I instruction formats
legend: f7 = funct7, f3 = funct3, op = opcode
:::

Look at the alignment in the figure: whatever the format, rs1 sits in bits 19 to 15, rs2 in bits 24 to 20, rd in bits 11 to 7, and the sign bit of the immediate is always bit 31. This is deliberate. When the hardware fetches an instruction, it does not yet know its format. It can send those bit positions to the register file straight away, and work out the opcode more slowly; if a register read turns out to be unneeded, the value is simply discarded. To keep this alignment, S-type splits its immediate into two parts, and B- and J-type scramble the order of the immediate bits. That looks odd, but it saves the hardware several multiplexers.

::: lab ch2-model
model.title: An assembler that is also a disassembler
model.how: Type one assembly instruction in the box (you can use names such as x5 or t0), or type an eight-digit hexadecimal number starting with 0x. The page splits it into fields, explains what each one means in the contract, and shows the full machine code. You can also press one of the six format buttons below to see an example of each.
ctl.in: Code or hex
ctl.ex: Format example
bits.aria: The fields of this instruction, split by format
read.hex: Machine code (hex)
read.fmt: Format
read.asm: Disassembled back
fmt.R: R-type: two-register operation
fmt.I: I-type: register and constant
fmt.S: S-type: store
fmt.B: B-type: conditional branch
fmt.U: U-type: upper 20-bit constant
fmt.J: J-type: jump
say.empty: Type an instruction in the box, or a machine-code number starting with 0x.
say.R: R-type: opcode {op} says this is an operation between two registers. funct3 = {f3} and funct7 = {f7} select *{name}*. It reads {rs1} and {rs2} and writes the result to {rd}.
say.I: I-type: opcode {op}, and funct3 = {f3} selects *{name}*. It reads {rs1}. The constant {imm} sits in the top 12 bits (negative numbers in two's complement), and the result is written to {rd}.
say.Ish: I-type shift: opcode {op}, and funct3 = {f3} selects *{name}*. The shift amount {imm} occupies only bits 24 to 20; the top 7 bits hold funct7 = {f7}, which tells a logical right shift from an arithmetic one. It reads {rs1} and writes the result to {rd}.
say.S: S-type: *{name}* has no destination register, so the 5 bits that would be rd hold the low 5 bits of the constant, and the high 7 bits sit where funct7 would be. The address is {rs1} + {imm}, and {rs2} is written there.
say.B: B-type: *{name}* compares {rs1} with {rs2}. If the condition holds, it jumps to “this instruction's address + {imm}”. The offset is always even, so the lowest bit is not stored: bit 12 goes in the top bit of the instruction, and bit 11 sits in bit 7.
say.U: U-type: *{name}* turns the 20-bit constant {imm} into a number whose top 20 bits are that constant and whose low 12 bits are 0. lui writes it straight into {rd}; auipc first adds the address of this instruction, then writes the sum into {rd}. Follow lui with an addi to supply the low 12 bits, and any 32-bit constant can be built.
say.J: J-type: *{name}* stores the address of the next instruction in {rd} (the return address that a function call records), then jumps to “this instruction's address + {imm}”.
say.err.op: Operation not recognised. The page knows: add sub and or xor slt sll srl sra, addi andi ori xori slti slli srli srai, lw sw, beq bne blt bge bltu bgeu, lui auipc jal jalr.
say.err.args: Wrong number or form of operands. For example <code>add a0, a0, t2</code>, <code>lw t2, 0(t1)</code>, <code>beq a0, a1, 16</code>.
say.err.reg: A register name was not recognised. Use x0 to x31, or zero ra sp gp tp t0–t6 s0–s11 a0–a7.
say.err.imm: Constants must be decimal, or hexadecimal starting with 0x.
say.err.range: The constant is outside the range this format can hold: I- and S-type take −2048 to 2047, shift amounts 0 to 31, B-type ±{brKiB} KiB, J-type ±{jalMiB} MiB.
say.err.align: Branch and jump offsets must be even: offsets are encoded in units of 2 bytes (leaving room for the 16-bit compressed-instruction extension), so the lowest bit is not stored. In plain RV32I, without that extension, instructions are 4-byte aligned, and a jump to an address that is not a multiple of 4 raises an exception.
say.err.hex: This number decodes to an instruction the page does not recognise (it knows only part of RV32I).
:::

Try a few things. Change <code>add</code> to <code>sub</code>: only bit 30 changes, from 0 to 1. Change <code>addi a0, a0, 1</code> to <code>addi a0, a0, -1</code>: the top 12 bits all become 1, because the two's complement of −1 is all ones. Enter <code>0x00000013</code>: it is <code>addi zero, zero, 0</code>, the contract's “do nothing” (NOP). Then enter <code>0x00008067</code>: <code>jalr zero, 0(ra)</code>, which jumps back to the address held in ra, that is, a function return.

The immediate has only {immI} bits, so what about larger constants? The U-type lui sets {immU} bits at once, and addi supplies the remaining {immI}. Branches are similar. B-type offsets reach only ±{brKiB} KiB and J-type ±{jalMiB} MiB, so a farther target needs its address computed into a register first, then a jump with jalr. **The contract is short, and the price is that some tasks take an extra instruction or two**. Chapter 10 shows the choice x86 made instead.

This assembler knows part of RV32I. It covers all {nFormats} formats, but not byte and halfword loads and stores, system instructions, or the shorthands li, mv and ret. Labels are used only in the programs of the next chapter. The encodings were checked one by one against an independent disassembler (Capstone), and the tests pin several dozen examples. {.take}

## Translating a loop into machine code {#ch3}

::: strings
toc: Translating a loop into machine code
:::

One line of C becomes several instructions. The same line can be translated in different ways, and it is not unusual for one version to have twice as many instructions as another. The CPU knows only the translated instructions. {.law}

To explain “add up the array” to someone who can do only the simplest things, you have to break it into small steps: work out where element i is, go there and read it, add it to the total, add one to i, and check whether there are more. The CPU is that kind of worker. The C code below is the example used from start to finish on this page:

::: html ch3-html
code.aria: The C loop that sums an array
code: "int sum = 0;\nfor (int i = 0; i < n; i++)\n    sum += a[i];\n\\*out = sum;"
:::

By the calling convention, the array's address is in a1, n is in a2, the result is written to the place a3 points to, and ra holds the return address. To keep the examples short, I assume n is at least 1; a real compiler would add a check first. **Version 1** is the most direct translation: i is kept in t0, and each pass computes a + 4i, multiplying by 4 with a left shift by two, since each int takes 4 bytes. **Version 2** is the kind of rewrite a compiler often makes: drop i altogether and let a pointer advance 4 bytes per pass until the end. It also moves <code>addi</code> between the load and the addition; chapter 7 explains why. **Version 3** unrolls the loop once, so each pass handles two elements, and it needs n to be even. All three are hand-written. None is the verbatim output of any compiler.

::: lab ch3-model
model.title: An instruction interpreter: running one instruction at a time
model.how: Choose a version and the number of elements n, then run one instruction at a time with “Step”, or run to the end with “Run”. On the left are each instruction's address and machine code (encoded by the assembler from the previous chapter); on the right, the count shows how many times each one has run. Below are the current values of some registers.
ctl.ver: Version
ver.v1: Version 1: index
ver.v2: Version 2: pointer
ver.v3: Version 3: unrolled
ctl.n: Number of elements n
btn.step: Step
btn.all: Run
btn.reset: Reset
list.aria: Program listing: address, machine code, assembly, execution count
list.addr: Address
list.hex: Machine code
list.asm: Assembly
list.cnt: Count
regs.aria: Current register values
read.done: Instructions executed
read.total: Total for this n
read.per: Instructions per element
read.sum: a0 (the sum)
say.start: Ready: the program counter points to address 0. The array holds 3, 1, 4, 1, 5, 9, 2, 6.
say.alu: Executing *{asm}*: {rd} becomes {val}.
say.load: Executing *{asm}*: reads {val} from address {addr} into {rd}.
say.store: Executing *{asm}*: writes {val} to address {addr}.
say.brT: Executing *{asm}*: the condition holds, so it jumps back to address {to} for another pass.
say.brN: Executing *{asm}*: the condition fails, so it does not jump and the loop ends.
say.ret: Executing *{asm}*: returns to the caller. In all, {total} instructions were executed, and the sum is {sum}.
:::

Count the loop body: version 1 has {loop1} instructions per element, version 2 has {loop2}, and version 3 has {loop3}. With n = {nIron}, the three versions execute {ic1}, {ic2} and {ic3} instructions respectively. The CPU has not changed, and the sum is the same, but **the work differs by a factor of two**. This is the first half of the answer: changing the way the code is written changes the number of instructions.

Note the <code>bne a1, t1, loop</code> in version 2: its offset is −12, so in machine code it is the scrambled B-type bit pattern from the previous chapter. The label <code>loop</code> exists only in the assembly text; the assembler replaces it with “12 bytes back”. The CPU sees only these {xlen}-bit numbers. That is not fundamentally different from the bytes the small machine in [[switches-that-compute#ch9|chapter 9 of “How a Pile of Switches Learned to Do Arithmetic”]] saw. They are just wider and more regular.

The interpreter tracks only what the registers and memory hold after each instruction, which is the part the contract defines. It does not say how many cycles each one takes. From the next chapter on, the same program runs on real hardware structures. {.take}

## Single cycle: one instruction per clock {#ch4}

::: strings
toc: Single cycle: one instruction per clock
:::

The simplest CPU completes each instruction within one clock cycle: fetch the instruction, read the registers, compute, read or write memory, and write back. A set of control signals decides which paths are switched on during that cycle. {.law}

Imagine a kitchen with one cook, who finishes each dish before starting the next: read the order, fetch the ingredients, chop, fry, plate. The small machine in [[switches-that-compute#ch9|chapter 9 of “How a Pile of Switches Learned to Do Arithmetic”]] worked like that kitchen: it finished one instruction before fetching the next. The **single-cycle** design goes further: every unit is laid out in a row, and an electrical signal starting at the program counter (PC) flows through the whole path in one cycle. When the clock ticks, the results are written at once to the registers, to memory and to the new PC.

The figure shows a single-cycle RISC-V that can run our program. The PC supplies an address, and the **instruction memory** outputs a {xlen}-bit instruction. The rs1 and rs2 fields go straight to the **register file**, which returns two values (the alignment from the previous chapter pays off here). The **immediate generator** reassembles the constant from the bits scattered through the instruction. The **ALU** performs additions, subtractions and comparisons. The **data memory** is used when data is read or written. Finally, a multiplexer selects whether the value written back to a register is the ALU result or the value read from memory. Separately, one adder computes PC + 4, and another computes the branch target, PC + immediate; the branch result then selects which of them becomes the next PC.

::: lab ch4-lab
:::

The **control unit** lets the same hardware execute different instructions. It looks only at the opcode and drives seven control lines: RegWrite (whether to write a register), ALUSrc (whether the ALU's second operand comes from a register or from the immediate), ALUOp (whether the ALU adds, compares, or looks further at funct3 and funct7), MemRead and MemWrite (whether to read or write data memory), MemtoReg (whether the value written back comes from memory or from the ALU), and Branch (whether this is a conditional branch).

::: lab ch4-model
model.title: Run the program through the single-cycle datapath, one signal at a time
model.how: This is the version 1 program from chapter 3, with n = 2. Press “Next” to step one instruction (one clock cycle) and see which units are in use, the values of the seven control lines, and the numbers entering and leaving the ALU. X means the value of that line does not matter.
btn.prev: Previous
btn.next: Next
btn.reset: Reset
units.aria: Units used in this cycle
sig.aria: Values of the seven control lines
read.ins: Instruction this cycle
read.pc: PC
read.alu: ALU: inputs → output
read.next: Next PC
u.pc: PC
u.imem: Instruction memory
u.regs: Register file
u.imm: Immediate generation
u.alu: ALU
u.dmem: Data memory
u.wb: Write-back
sig.x: X
op.0: Add (address)
op.1: Compare (branch)
op.2: Look at funct3/7
op.3: Look at funct3
say.R: *{asm}* is R-type: ALUSrc = 0, so both operands come from registers. The ALU operation is chosen by funct3 and funct7. RegWrite = 1 and MemtoReg = 0, so the result {val} is written back to {rd}. Data memory is idle.
say.I: *{asm}* is an I-type operation: ALUSrc = 1, so the second operand is the immediate {imm}. The result {val} is written back to {rd}. Data memory is idle.
say.load: *{asm}* is a load: the ALU computes the address {addr}, MemRead = 1 reads {val}, and MemtoReg = 1 sends it into register {rd}. **All five units are used**. This is the longest path.
say.store: *{asm}* is a store: the ALU computes the address {addr}, and MemWrite = 1 writes {val} there. RegWrite = 0, so no register is written and MemtoReg is X.
say.brT: *{asm}* is a branch: the ALU compares the two values and the condition holds. Branch = 1, together with this result, makes the next PC select the branch target {to} instead of PC + 4.
say.brN: *{asm}* is a branch: the condition fails, so the next PC is still PC + 4 = {to}. Data memory and write-back are both idle.
say.ret: *{asm}* is jalr: the ALU computes the jump target (ra + 0), and that becomes the next PC. There is no jalr row in the control table; I added it by the same reasoning.
:::

Stepping through a few instructions shows that **most instructions use only some of the units**: addition does not use data memory, a branch does not use write-back, and a store does not use write-back either. Only lw uses all of them. But the clock does not know what the next instruction will be, so every cycle must be long enough for the longest path. The next chapter works out the cost.

The R, lw, sw and branch rows of the control table come from chapter 4 of Patterson and Hennessy's RISC-V edition. The I-type operation and jalr rows are my additions, made by the same rules, and the ALUOp numbering is this page's own. Single-cycle designs are common in teaching and almost absent from products, for the reason in the next chapter. {.take}

## The slowest instruction sets the clock {#ch5}

::: strings
toc: The slowest instruction sets the clock
:::

The clock period of a single-cycle CPU must cover the full path of the slowest instruction. Fast instructions wait just as long, so part of almost every cycle is wasted. {.law}

A bus stops for five minutes at every stop, because the slowest passenger needs five minutes to board, though most passengers get on in half a minute. <a href='../switches-that-compute/#ch7'>Chapter 7 of “How a Pile of Switches Learned to Do Arithmetic”</a> explained that a cycle must cover the longest path between two stores, or the result is latched before it is ready. In a single-cycle CPU, “between two stores” means a whole instruction.

Using the textbook example delays: a memory read takes {latMem} ps, a register-file read or write takes {latReg} ps, and an ALU operation takes {latAlu} ps. These are round teaching numbers, not measurements of any chip. Adding up the units each class of instruction passes through: a load takes {tLoad} ps, a store {tStore}, arithmetic {tAlu} and a branch {tBr}. The clock must be set to the longest of these: {period} ps.

::: lab ch5-model
model.title: How long each class of instruction takes, and how long the clock must be
model.how: Drag the three sliders to change the memory, ALU and register-file delays. Each row shows the units one class of instruction passes through. The gold vertical line is the single-cycle clock. The cyan vertical line is the clock for each stage when the path is cut into five stages (next chapter).
model.aria: Bar chart of delays for four classes of instruction, marking the single-cycle clock and the clock of one pipeline stage
leg.imem: Fetch instruction
leg.reg: Register file
leg.alu: ALU
leg.dmem: Data memory
ctl.mem: Memory delay
ctl.alu: ALU delay
ctl.reg: Register-file delay
read.period: Single-cycle clock period
read.avg: Average real use per instruction, version 1
read.waste: Share of each cycle spent waiting
read.stage: Each stage, cut into five
read.ideal: Ideal speed-up
cls.load: Load lw
cls.store: Store sw
cls.alu: Arithmetic
cls.branch: Branch
cv.x: ps
cv.clk: Single-cycle clock
cv.stage: Clock per stage
say.mem: The clock is now {period}, set by lw. Version 1's instructions take {avg} on average, so {waste} of each cycle is spent waiting. Cut into five stages, the slowest stage is memory at {stage}, giving at most {ideal} faster, less than 5×: *the stages are not equal in length, so the longest one sets the pace*.
say.alu: Now the ALU is the slowest unit: clock {period}, each stage {stage}, at most {ideal} faster. The clock is still set by lw, because it passes through the most units.
say.balanced: Memory, ALU and register file are now equally fast: each stage {stage}, single-cycle clock {period}, exactly {ideal}. *Cutting into five stages gives a five-fold speed-up only when the five stages are equal in length*, and that is before counting the registers between stages.
:::

At the default values, version 1's instructions take {avg} ps on average, but the clock is set to {period}: in each cycle, {waste} of the time the circuits have already finished and are only waiting for the clock. The cause is lw, which makes up only {mLoadShare} of version 1's instructions but holds back all of them. Try setting memory to {latMemM} ps: the single-cycle clock becomes {periodM} ps.

This is the **critical path**: the longest path, not the average one, sets how fast the clock can run. There are two ways out. One is to let each instruction use only the time it needs, taking as many cycles as it requires; this is called a multi-cycle design. The other is to cut the long path into stages, with a row of registers between them, so that several instructions are in different stages at once. The second way is the pipeline. At the default values the longest stage is {stage} ps, so the ideal speed-up is {ideal}×; with memory at {latMemM} ps each stage takes {stageM}, and the ideal speed-up falls to {idealM}×.

The model counts only the delays of the units themselves. It leaves out multiplexers, wires and the setup time of registers, so real circuits would show larger numbers, and each stage would also pay the register overhead. The three delays are textbook examples, not measurements. This chapter's conclusions (the longest path sets the clock, and unequal stages give less than a five-fold speed-up) do not depend on the specific numbers. {.take}

## The five-stage pipeline {#ch6}

::: strings
toc: The five-stage pipeline
:::

Cut each instruction into five stages (fetch, decode, execute, memory access and write-back), with a row of registers between stages. Every stage works on a different instruction in each cycle, so five instructions are in flight at once, and ideally one finishes every cycle. {.law}

A laundry has a washing machine, a dryer and a table for folding. If one person washes, dries and folds a load before starting the next, two of the three machines sit idle. The clever way is to put the second load in the washer while the first is in the dryer. Each load takes the same time as before, but **the number of loads finished per hour** becomes three times as high.

The CPU borrows the same idea. The classic RISC pipeline has five stages: **IF** fetches the instruction, **ID** decodes it and reads the registers, **EX** computes in the ALU, **MEM** reads or writes data memory, and **WB** writes the result back to a register. The four rows of registers between the stages are called **pipeline registers**, named after the stages on either side: IF/ID, ID/EX, EX/MEM and MEM/WB. At the end of each cycle, every stage passes its unfinished work, together with whatever later stages still need (the destination register number, control signals), into the next row of registers.

::: lab ch6-lab
:::

<a href='../why-compute-waits-for-memory/#ch1'>Chapter 1 of “Why Compute Waits for Memory”</a> has already introduced these five stages and shown how a load waiting for memory blocks the instructions behind it. Here the viewpoint is different: our own program is run through a pipeline simulated cycle by cycle, and we look at the full timetable.

::: lab ch6-model
model.title: Pipeline simulator: each row is an instruction, each column a cycle
model.how: Choose a version and n. Press “Step” to watch the instructions move down and to the right one cycle at a time, or press “Run” to see the full table at once. The letter in each cell shows the stage the instruction is in during that cycle. Red hatching marks a stall, where an instruction waits, and a dark struck-through row is an instruction that was flushed (the last two chapters cover these). This chapter looks only at the overall picture: five instructions are in flight at once.
ctl.ver: Version
ctl.n: Number of elements n
btn.step: Step one cycle
btn.play: Play
btn.all: Run
btn.reset: Reset
model.aria: Pipeline timetable: one row per instruction, one column per clock cycle, cells marking the stage
read.cyc: Cycles for this program
read.ic: Instructions actually executed
read.single: Single-cycle machine ({period} ps per cycle)
read.pipe: Pipeline ({stage} ps per cycle)
btn.pause: Pause
leg.IF: IF fetch
leg.ID: ID decode
leg.EX: EX execute
leg.MEM: MEM memory
leg.WB: WB write-back
leg.stall: Stalled, waiting
leg.flush: Flushed
cv.cyc: Cycle
say.gaps: Cycle {c}. {ic} instructions took {cyc} cycles, not {ic} + 4: the gaps and flushed rows in between are the hazards the next two chapters cover.
:::

With version 1 and n = 2, this program has {p1ic} instructions and takes {p1cyc} cycles in the pipeline. The single-cycle machine needs {p1ic} × {period} ps = {p1single} ns. The pipeline takes a few more cycles, but each cycle is only {stage} ps long, so the total is {p1pipe} ns. **The pipeline does not make any single instruction faster**: each still passes through all five stages, and because every stage is paced by the slowest one, it may even be slower. What it improves is throughput, as in the laundry.

The table also shows two kinds of irregularity: some instructions stall for a cycle in ID, and some rows are struck through. An ideal pipeline completes one instruction per cycle, and these things lower that rate. They have a common name, **hazards**: the next instruction cannot advance in the cycle it should. There are three causes. Two instructions compete for one unit (a structural hazard; this model has separate instruction and data memories, as real chips have separate instruction and data caches, and it writes the register file in the first half of the cycle and reads it in the second half, so this never happens here). The next instruction needs a value that an earlier one has not yet produced (a data hazard, chapter 7). Or the next instruction to fetch is not yet known (a control hazard, chapter 8).

The simulator is a sequential, single-issue five-stage pipeline, the standard model in textbooks: at most one instruction is fetched and completed per cycle, and later instructions are never moved ahead. Real high-performance cores fetch several instructions per cycle and execute out of order; that is the subject of Chapters 6 and 7 of <a href='../how-a-cpu-guesses-ahead/#ch6'>“How a CPU Guesses Ahead”</a>. {.take}

## Data hazards: waiting for a result {#ch7}

::: strings
toc: Data hazards: waiting for a result
:::

The value the next instruction needs may not yet have been written back to a register. If a value just computed is passed directly from the pipeline register to the ALU's input, most of the waiting disappears. Only a value just read from memory still has to wait one cycle. {.law}

On an assembly line, a worker needs a screw that the previous station has not yet fitted. The clumsy solution is to stop, wait until the part reaches the last station and is logged into stock, and then fetch it from the stock. The clever solution is to hand the part over as soon as the previous station has fitted it.

In version 1, <code>add t1, a1, t1</code> needs the value of t1 just computed by <code>slli t1, t0, 2</code>. On the timetable, slli writes t1 into the register file in stage 5 (WB), but add reads it in stage 2 (ID), several cycles earlier. A read that must follow a write to the same register like this is a **data dependence** (RAW, read after write); when it stops the next instruction from moving on in the pipeline, it is called a **data hazard**. Without a remedy, add must stop in ID until slli reaches WB. The register file writes in the first half of the cycle and reads in the second half, so the minimum stall is two cycles.

But the value already exists: slli computed it at the end of EX and stored it in the EX/MEM register. So a multiplexer is placed in front of each ALU input, so that the inputs can take not only the value read from the register file but also the results held in the EX/MEM and MEM/WB registers. A small circuit, the forwarding unit, compares every cycle: is the register number that the instruction in EX/MEM will write equal to rs1 or rs2 of the instruction now in EX? If so, take the value from EX/MEM. If not, check MEM/WB. If both match, use the newer value from EX/MEM. Register x0 is excluded.

::: diagram dg-fwd keys=dg.fwd
cap: Three instructions from the version 1 loop, taken from the simulator with forwarding on. Upper arrow: slli computes t1 at the end of EX in cycle {c1}, and in the next cycle it is passed directly from EX/MEM into the EX of add. Lower: lw does not obtain t2 until the end of MEM in cycle {c2}, so add a0 must stall for one cycle in ID, then takes the value from MEM/WB.
aria: Pipeline timetable excerpt: one arrow forwarding from EX/MEM, a stall after a load, and an arrow forwarding from MEM/WB
stall: Stall
exmem: From EX/MEM
memwb: From MEM/WB
cyc: Cycle
:::

::: lab ch7-model
model.title: The same pipeline simulator, with forwarding on or off
model.how: This is still the simulator from chapter 6. Switch forwarding and the version, and watch how the stalled cells and the total cycle count change. The arrows on the diagram show forwarding: from which stage and which pipeline register the value is passed to EX.
ctl.fwd: Forwarding
fwd.off: Off: wait for write-back
fwd.on: On: pass the value directly
model.aria: Pipeline timetable, with arrows showing where data is forwarded to the execute stage
read.cyc: Cycles for this program
read.stall: Cycles stalled waiting for data
read.per: Cycles per element at n = {nIron}
read.cpi: Cycles per instruction (CPI) at n = {nIron}
say.nofwd: Without forwarding: every instruction that uses the result of the one just before must wait until that result is written back. This program stalls {stalls} cycles, and in a long loop each element takes {per} cycles.
say.loaduse: With forwarding: arithmetic results are passed on directly, and only a load followed at once by its use still stalls for one cycle. This program stalls {stalls} cycles; in a long loop each element takes {per} cycles.
say.clean: With forwarding, and with this version separating the load from the instruction that uses it: no stalls at all. In a long loop each element takes {per} cycles.
:::

Version 1, with n = {nIron} and no forwarding, takes {e1nf} cycles per element, and {e1nfStall} of those cycles are spent waiting for data, across its {loop1} instructions. With forwarding this falls to {e1f} cycles, leaving only {e1fStall} stall cycles, between <code>lw t2</code> and the <code>add a0, a0, t2</code> that follows. The load obtains its data only at the end of MEM, but the add needs it at the start of EX in the next cycle. Forwarding cannot close that gap in time, so one bubble has to be inserted. <a href='../why-compute-waits-for-memory/#ch1'>Chapter 1 of “Why Compute Waits for Memory”</a> covers this kind of stall, and how long it grows when memory is slow.

Version 2 avoids it: <code>addi a1, a1, 4</code> is moved between the lw and the add, so the cycle in which the add would wait has useful work to do. Version 2 therefore takes only {e2f} cycles per element ({loop2} instructions plus the cost of the branch, covered in the next chapter), with no stalls at all. This kind of rearrangement is **instruction scheduling**. Compilers do it, provided the two instructions do not depend on each other.

The model assumes that every load hits in the L1 cache and produces its result in one cycle. Real loads can wait tens or hundreds of cycles; see <a href='../why-compute-waits-for-memory/#ch1'>that chapter</a> and <a href='../how-cpu-caches-work/'>“How a CPU's Three Levels of Cache Work”</a> on caches. Stores are treated as needing their data in EX, as is standard in textbook treatments. {.take}

## Branches: flush what was wrong {#ch8}

::: strings
toc: Branches: flush what was wrong
:::

A branch instruction does not know whether it will jump until it reaches EX, and by then two more instructions have been fetched behind it. A correct guess costs nothing. A wrong guess means those two are flushed, wasting two cycles. A loop branches once per pass, so this cost is paid on every pass. {.law}

A hundred metres before a junction, the satnav has not yet decided whether you turn left or go straight, so you pick a lane and carry on. A correct pick gets you through smoothly; a wrong one means turning back. The pipeline faces this problem after every branch: IF must fetch the next instruction every cycle, but whether that is PC + 4 or the branch target is known only when the branch reaches EX and has been compared.

The simplest remedy is to stall: as soon as a branch is seen, stop fetching and wait for the result. Another remedy is almost as simple: **predict not taken**. Keep fetching PC + 4 and PC + 8 in order. If the branch really is not taken, nothing is wasted. If it is taken, the two half-processed instructions are **flushed**, meaning they are replaced by nop instructions, and fetching restarts at the target address. Flushing is safe because those instructions have not yet reached MEM or WB, so they have not changed any memory or register.

::: diagram dg-flush keys=dg.flush
cap: End of the first loop pass in version 1, taken from the simulator (predict not taken, branch resolved in EX). In cycle {c}, blt is resolved in EX and jumps back to loop. The sw and jalr fetched in order behind it are flushed, and from the next cycle the slli at loop is fetched; two cycles are empty.
aria: Pipeline timetable excerpt: a branch resolved in EX shows two wrongly fetched instructions being flushed
x: Flushed
redirect: Fetch loop
:::

::: lab ch8-model
model.title: The same pipeline simulator, with a different branch policy
model.how: Switch between “stall” and “predict not taken”, and choose the stage where the branch outcome is decided: EX (the default) or ID (which adds a comparator in the decode stage). Watch the struck-through rows, the empty cycles and the cycles per element. Forwarding stays on throughout.
ctl.pol: Branch policy
pol.stall: Stall until resolved
pol.nt: Predict not taken
ctl.res: Stage where the branch is resolved
res.EX: EX stage
res.ID: ID stage
model.aria: Pipeline timetable, with wrongly fetched instructions shown as struck-through rows
read.cyc: Cycles for this program
read.flush: Instructions flushed
read.bub: Empty cycles caused by branches
read.per: Cycles per element at n = {nIron}
say.stall: Stall: every branch leaves {bub2} empty cycles, whether or not it is taken. This program has {bub} empty cycles in all, and in a long loop each element takes {per} cycles.
say.nt: Predict not taken: the loop's branch is taken on every pass except the last, so almost every prediction is wrong and 2 instructions are flushed each time. This program flushes {flush} instructions; in a long loop each element takes {per} cycles, close to stalling.
say.id: Branch resolved in ID: a wrong guess flushes only 1 instruction. With this policy each element takes {per} cycles, {gain} cycles fewer than resolving the branch in EX.
say.idstall: Branch resolved in ID, but in this version the instruction just before the branch changes one of its operands, so the comparator cannot get the value in ID and must stall one more cycle. The cycle saved is given back: each element still takes {per} cycles.
:::

Version 1, with n = {nIron}: stalling takes {e1st} cycles per element, and predict-not-taken takes {e1f}. Version 2 takes {e2st} cycles with either policy. Predict not taken does not help much here, because the loop's branch is taken {nTaken} times out of {nIron}, so it is almost always mispredicted. That shows the limit of a static guess: it gives every branch the same answer. A common improvement is “predict backward branches taken and forward branches not taken”, because backward branches are usually loops. A better remedy is to let the hardware remember how each branch went last time. This is branch prediction, which <a href='../how-a-cpu-guesses-ahead/#ch2'>Chapter 2 of “How a CPU Guesses Ahead”</a> covers in more detail.

The other route is to get the result sooner: put a comparator that compares two registers in the ID stage, so that a wrong guess flushes only one instruction. Version 2 therefore drops from {e2f} to {e2id} cycles per element, and version 3 from {e3f} to {e3id}. But version 1 still takes {e1id} cycles: its <code>blt t0, a2, loop</code> comes straight after the <code>addi</code> that rewrites t0. When the comparator needs t0 in ID, the addi has only just reached EX, and forwarding cannot deliver the value in time, so one more cycle must be stalled. **The cycle the hardware saves is consumed by the way the code is written**.

Unrolling in version 3 also pays off here: the branch cost is paid once per two elements, so it takes only {e3f} cycles per element. Early MIPS used a different remedy, the delayed branch: the contract required the instruction after a branch to execute regardless, and left the compiler to fill that slot with useful work. This wrote the details of one pipeline into the contract, and when the pipeline changed, the contract became a burden. RISC-V did not adopt it.

The model assumes that the branch target and the comparison result are both known in the same stage. The first design in the textbook resolves the branch in MEM (flushing 3 instructions), and is then improved to ID. Real cores use a predictor to guess the target at fetch time, so a correct guess costs no cycles at all. But the cost of a wrong guess grows with pipeline depth: on modern cores a mispredict often costs a dozen or more cycles (an order of magnitude only). {.take}

## The iron law of performance {#ch9}

::: strings
toc: The iron law of performance
:::

Program run time = instructions executed × average cycles per instruction × length of each cycle. The way code is written, the compiler and the instruction set change the first term; the microarchitecture changes the second; circuits and the number of pipeline stages change the third. Looking at only one term often leads to the wrong conclusion. {.law}

The time a move takes depends on how many boxes there are, how many trips each box needs, and how long each trip takes. Packing boxes full means fewer boxes, but each one is heavier and may need an extra trip. The three quantities multiply to give the total, and changing just one often changes the other two.

The CPU version is called the **iron law of performance**: time = instruction count × CPI × clock period. CPI is cycles per instruction, the average number of cycles each instruction takes. The earlier chapters measured all three terms: chapter 3 counted the instructions, the simulators in chapters 6 to 8 gave the CPI, and chapter 5 computed the clock period. Now multiply them together.

::: diagram dg-iron keys=dg.iron
cap: The three terms of the iron law, and what can change each. Beneath the arrows are the examples from this page. The terms multiply, so an improvement in one multiplies with the others, and a setback in one cancels an improvement in another.
aria: Schematic of the iron law: time equals instruction count times cycles per instruction times clock period, with the factors that affect each term
time: Run time
ic: Instruction count
cpi: Cycles/instr. (CPI)
t: Cycle length
icBy: Code · compiler · ISA
cpiBy: Hazards · forwarding · prediction
tBy: Critical path · pipeline depth · process
icEx: Chapter 3: {loop1} / {loop2} / {loop3} instructions per element
cpiEx: Chapters 7 and 8: stalls and flushes
tEx: Chapter 5: {period} → {stage} ps
:::

::: lab ch9-model
model.title: Three versions × several machines: how long the same loop takes
model.how: Choose a version and a machine. All four machines run the same RISC-V machine code: single-cycle (each cycle {period} ps, every instruction one cycle); five-stage pipeline (each cycle {stage} ps); five-stage pipeline without forwarding; and five-stage pipeline with branches resolved in ID. The bars show how long each combination takes to process one element, with n = {nIron}.
ctl.ver: Version
ctl.mach: Machine
m.single: Single-cycle
m.pipe: Pipeline
m.pipeNoFwd: Pipeline, no forwarding
m.pipeBest: Pipeline, branch in ID
model.aria: Bar chart of the time per element for each version on each machine
read.ic: Instructions
read.cpi: CPI
read.t: Clock period (frequency)
read.time: Per element
read.x: Faster than version 1 on the single-cycle machine
bar: {v} · {m}
vs.v1: Version 1
vs.v2: Version 2
vs.v3: Version 3
ms.single: Single-cycle
ms.pipe: Pipeline
ms.pipeNoFwd: No forwarding
ms.pipeBest: Branch in ID
t: {ps} ({ghz})
say.base: This is the starting point: version 1 on the single-cycle machine, one cycle per instruction, but each cycle takes {ps}, so {per} per element.
say.singleFewer: On the single-cycle machine the CPI is always 1, so speed depends only on instruction count: this version takes {per} per element, {x} faster than version 1.
say.mid: CPI {cpi}, clock {ps}: {per} per element, {x} faster than the starting point.
say.fast: CPI {cpi}, clock {ps}: {per} per element, *{x}* faster than the starting point. The gains from the way the code is written and from the machine multiply together.
:::

From start to finish: version 1 on the single-cycle machine takes {t1s} ns per element. Running the same code on the pipeline raises the CPI from 1 to {cpi1p}, but the clock is {ideal} times faster ({ghzS} GHz to {ghzP} GHz), so each element takes {t1p} ns, a {x1s1p}× improvement. Switching to version 3 halves the number of instructions and brings the CPI down to {cpi3p}, giving {t3p} ns per element, a further {x1p3p}× improvement. The two steps multiply to {x1s3p}×; moving the branch resolution to ID gives {t3b} ns, which is {x1s3b}×. **That is the answer to the question at the start**: the same program runs several times faster because three terms each improve a little and multiply together.

The reverse also holds: looking at one term alone leads to mistakes. A low CPI does not mean a fast machine: the single-cycle machine has a CPI of 1, lower than any pipeline, yet it is the slowest. A high clock frequency does not mean a fast machine either: the pipeline without forwarding has the same clock as the full pipeline, and version 1 on it has a CPI of {cpi1n}, taking {t1n} ns per element. Version 2 has a CPI of {cpi2p}, the same as version 1, but it has a third fewer instructions, so it is faster. **When comparing two CPUs, clock frequency and how much work each cycle does are only terms of the equation**. What you should compare is the time the same program takes to run.

The four machines are variants of one textbook model, using the example delays from chapter 5. At n = {nIron}, the start-up and wind-down cycles of the program can be ignored. Real CPUs' CPI is affected by cache misses, branch prediction and how many instructions issue per cycle, and is often below 1; the iron law itself stays the same. {.take}

## CISC and RISC {#ch10}

::: strings
toc: CISC and RISC
:::

The x86 contract allows one instruction to read memory, compute and write back to memory, and its length varies from one byte to more than ten. Modern x86 chips split such an instruction at decode time into several RISC-like small operations, and the rest of the pipeline runs only those. {.law}

There are two kinds of recipe. One says “make kung pao chicken”; the other says “dice, sear, make the sauce, add to the wok, stir-fry”. The first is short, but the cook must already know the steps. The second is longer, but anyone can follow it, and it is easier to share among several people.

x86 dates from 1978, when memory was expensive, programs had to be short and compilers were weak, so one instruction could do a great deal: <code>add dword ptr [rdi + 4\*rcx + 16], 5</code> computes an address, reads memory, adds 5 and writes the result back, all in one instruction. This style came to be called **CISC** (complex instruction set computer). In the 1980s, researchers at Berkeley and Stanford found that compilers rarely used those complicated instructions, and that a simple, fixed-length contract, in which only loads and stores touch memory, was far easier to build into a pipeline. That was **RISC** (reduced instruction set computer). RISC-V is the fifth generation of the Berkeley line, and the V in its name comes from that.

::: diagram dg-uops keys=dg.uops
cap: One x86-64 instruction ({xSibLen} bytes, real encoding) is split in the decode stage into four steps: compute the address, read, add, write. The execution core sees only these small operations. The four steps are a split by meaning; which chip splits it into how many micro-operations, and whether it merges them, differs between vendors and generations. Schematic, not to scale.
aria: Schematic: an x86 instruction is split by the decoder into four micro-operations, which feed a RISC-like execution pipeline
bytes: 83 44 8f 10 05
asm: add dword ptr [rdi+4\*rcx+16], 5
dec: Decoder
u1: Address  rdi + 4·rcx + 16
u2: Read memory → temporary
u3: Temporary + 5
u4: Write to memory
back: RISC-like execution pipeline
:::

::: lab ch10-model
model.title: One x86 instruction, taken apart
model.how: Choose an x86-64 instruction. Above are its real machine-code bytes, from a real assembler; in the middle are the steps it breaks into by meaning; below are the equivalent RV32I instructions and their machine code (encoded by the chapter 2 assembler).
ctl.ins: x86 instruction
i.reg: Add registers
i.load: Add a value from memory
i.rmw: Add into memory
i.sib: Complex addressing
i.imm64: 64-bit constant
i.push: Push onto stack
lab.x86: x86-64 machine code
x86.aria: Machine-code bytes of the x86 instruction
lab.ops: Broken into steps
ops.aria: Steps it breaks into
lab.rv: RV32I form
rv.aria: Equivalent RV32I instructions
read.xlen: x86 bytes
read.rvlen: RV32I bytes
read.ops: Number of steps
read.rvn: RV32I instructions
op.agu: Compute address
op.load: Read memory
op.alu: Compute
op.store: Write memory
role.o: Opcode
role.c: ModRM: registers and addressing mode
role.r: SIB: scale, index, base
role.n: Displacement or immediate
role.v: REX prefix: 64-bit
say.one: *{asm}* does only one thing: x86 uses {len} bytes; RV32I uses {rvn} instruction(s), {rvlen} bytes.
say.many: *{asm}* contains {ops} steps. x86 needs {len} bytes to express it; RV32I needs {rvn} instructions, {rvlen} bytes. Inside the chip, the x86 decoder usually splits it up too, so the rest of the pipeline sees a stream of small operations (how many, and how they are merged, differs between vendors and generations).
:::

The model shows two things. The first is length. Among these, <code>push rbx</code> is only {xPushLen} bytes, the complex addressing instruction is {xSibLen} bytes, and loading a 64-bit constant takes {xImmLen} bytes (RV32I needs {xImmRv} instructions; see the note at the end of this chapter). Intel's Software Developer's Manual (volume 2, section 2.3.11) caps an x86 instruction at {xMax} bytes. Every RISC-V instruction is {insnBytes} bytes, so the start of the next instruction is obvious at a glance. x86 must decode the leading bytes before it knows how long an instruction is and where the next one begins, so x86 chips spend many transistors on guessing instruction boundaries in parallel. The second is count. For the complex addressing instruction, RV32I needs {xSibRv} instructions. **CISC has fewer instructions, and RISC has a lower CPI**. Back to the iron law: both sides appear in the product.

So how do x86 chips use pipelines? At decode, each x86 instruction is translated into one or more fixed-format **micro-operations** (micro-ops, often written µop). The execution core runs these micro-ops, which behave much like RISC instructions. Intel has done this since the Pentium Pro in 1995, and AMD too. Many cores also keep a cache of already-translated micro-ops, so that loops can skip the most costly decoding. Today's difference between CISC and RISC therefore lies mainly in the contract and the decoder, and the execution side looks much the same. How a given chip splits an x86 instruction into micro-ops, and whether it merges two into one, differs between vendors and generations. The four steps in the figure are a split by meaning, not what any particular chip actually does.

The model compares x86-64 with RV32I, whose register widths differ. Loading a 64-bit constant takes 4 RV32I instructions, and push subtracts only 4 bytes; both depend on register width. A comparison with RV64I would differ in some rows. The byte counts are real assembler output; the breakdown into steps is a semantic division. {.take}

## Where the frontier is (as of November 2026) {#ch11}

::: strings
toc: Where the frontier is
:::

Instruction sets are still changing, all in the same direction: letting software run unchanged on more chips, and giving compilers more registers and wider operations so that they can reduce the instruction count and CPI. {.law}

Below, the facts fall into three groups: those that are settled, those already built, and one party's claims. Each has a date; sources and the dates they were checked are in BRIEF.md.

### Settled: the contract itself {#h.est .sub3}

- The current version of RISC-V's unprivileged ISA manual is v20260120 (20 January 2026), and the RV32I base integer ISA is version 2.1. Every encoding on this page is taken from that version. Once the base ISA is frozen it does not change; new features are added as extensions. {#e1}
- x86, Arm and RISC-V are all expanding vector and matrix operations: one instruction handles a group of numbers at once, which directly reduces the first term of the iron law (see [[how-a-cpu-does-math#ch9|Chapters 9 to 12 of How a CPU Does Math]]). {#e2}

### Already built {#h.demo .sub3}

- **RVA23**: RISC-V International announced its approval of the RVA23 profile on 21 October 2024 (the profile document, version 1.0, is dated 17 October 2024). A profile bundles a set of extensions as mandatory, including the vector and virtualisation extensions, so a distribution need be compiled only once to run on every RVA23-compliant chip. Canonical has used RVA23 as the baseline for RISC-V since Ubuntu 25.10. On 5 February 2026, Canonical said that SpacemiT's K3 was one of the first platforms to comply with RVA23. {#d1}
- **Arm**: Arm publishes one annual update to its A-profile architecture. Armv9.7-A, published on 2 October 2025, adds more precise TLB invalidation broadcasts, and vector and matrix instructions for 6-bit floating-point types. Armv9.8-A, published on 5 October 2026, adds “conditional fault” instructions, which reduce the instructions and branches needed for the bounds and null-pointer checks of memory-safe languages such as Rust. {#d2}
- **x86 APX**: Intel's APX extension expands the general-purpose registers from {apxFrom} to {apxTo}, and lets ordinary integer instructions name a separate destination register (three operands), so that a source operand need not first be copied. RISC-V and Arm had both of these from the start. {#d3}

### One party's claims {#h.claim .sub3}

- Intel says that, in its simulation of the SPEC CPU 2017 integer benchmarks with a prototype, code compiled with APX has {apxLoads}% fewer loads, more than {apxStores}% fewer stores, and {apxInsns}% fewer instructions (Intel page updated 31 October 2024). This is a vendor's prediction from simulation, not an independent measurement; it concerns exactly the first term of the iron law. {#c1}
- According to a November 2025 report (Phoronix, relaying Intel's instruction set extensions programming reference), Intel's next desktop processor, Nova Lake, will support AVX10.2 and APX. I have not checked the original manual, only two press reports of it. {#c2}
- When RVA23 was released, Google said it was the baseline requirement for Android's RISC-V application binary interface. {#c3}

Taken together, RISC-V's profiles, Arm's annual versions, and x86's APX and AVX10 address two problems. One is compatibility: letting the same binary run on a large range of chips, which is the reason a contract exists. The other is the iron law: more registers mean fewer loads and stores, and wider vectors mean fewer instructions. Nobody is changing the five-stage pipeline idea itself; what changes is the two ends of it.

The facts in this chapter will go out of date. They are collected in the FRONTIER block of models.js and listed under “Facts that will go stale” in BRIEF.md, so they can be updated in one place. {.take}

## Closing: three questions about a program or a CPU {#ch12}

::: strings
toc: Closing: three questions
:::

Run time is the product of three terms. Given a piece of code that must run faster, or a CPU to compare, ask about each term in turn. {.law}

{.plain .qs}
1. **How many instructions will it become?** Compile the key loop and read the assembly (the compiler's <code>-S</code> option, <code>objdump -d</code>, or the online Compiler Explorer). Count the instructions in the loop body, as in chapter 3. Replacing indexing with pointers, unrolling, or using vector instructions can change the first term by a factor of several. {#q1}
2. **Where will it stall?** Look for uses right after a load, branches right after a comparison, and jumps paid for on every element (chapters 7 and 8). Real CPUs predict and execute out of order, so they can hide some of this; the part they cannot hide is the extra amount in the CPI. {#q2}
3. **When comparing two CPUs, compare how long the same program takes to run.** Clock frequency is only the third term, and “instructions per cycle” is only the reciprocal of the second. Two chips on the same instruction set can still differ greatly in microarchitecture (chapters 1 and 9). When you see a benchmark score, first ask what program it ran and which compiler built it. {#q3}

A line of code is first translated into several instructions of the *contract*, each {xlen} bits long. The hardware switches on the *datapath* according to those bits, and works through them one cycle at a time. Cutting the datapath into *five stages* puts five instructions in flight at once, and *forwarding* and *flushing* deal with the waiting and the wrong guesses they cause. Speed is *instructions × cycles per instruction × length of each cycle*: the way the code is written and the chip each control part of it. {#sum .sum tag=div}

Before this: <a href='../switches-that-compute/'>“How a Pile of Switches Learned to Do Arithmetic”</a>, which builds from switches to a small machine that runs programs. After this: <a href='../why-compute-waits-for-memory/'>“Why Compute Waits for Memory”</a>, on what the pipeline does while a load waits for memory; and <a href='../how-cpu-caches-work/'>“How a CPU's Three Levels of Cache Work”</a>, on how a cache saves those tens of cycles. Branch prediction and out-of-order execution are covered in <a href='../how-a-cpu-guesses-ahead/'>“How a CPU Guesses Ahead”</a>. How a CPU computes with real numbers, and with a row of them in one instruction, is in [[how-a-cpu-does-math|“How a CPU Does Math: Real Numbers, and Many at Once”]]. {#links style="margin-top:2em"}

::: footer
**Sources.** Instruction formats, opcodes and encodings: RISC-V International, The RISC-V Instruction Set Manual, Volume I: Unprivileged Architecture, docs.riscv.org, version v20260120 (RV32I 2.1); register ABI names: the calling convention of the RISC-V ELF psABI. Encodings were checked one by one with the Capstone disassembler; x86-64 bytes were produced by assembling with clang. Datapath, control table, pipelining, forwarding and hazard detection, and the iron law of performance: Patterson and Hennessy, Computer Organization and Design: The Hardware/Software Interface, RISC-V Edition, chapters 1 and 4. Sources and check dates for the frontier facts are in BRIEF.md.

**About the models.** The assembler and interpreter implement part of RV32I according to the specification. The pipeline is a sequential, single-issue teaching model with a cache that always hits; component delays are textbook examples, not measurements. The page was written by an AI; the model code and tests are in this page's directory.
:::
