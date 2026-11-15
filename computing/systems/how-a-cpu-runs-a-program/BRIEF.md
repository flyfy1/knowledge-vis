# BRIEF — CPU 是怎么运行一个程序的 (How a CPU Runs a Program)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test; browser test zh at 1280/390/320 and reduced motion; canvas sweep on the final app.js; screenshots of every diagram at 1280/390/320, every model at 1280 and 320, most at 390, and the ch5-ch9 canvases scrolled into view under reduced motion at 390); independent review pending
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: computer architecture series A1 (`specs/essay-briefs/TASK-arch-series.md`)
Format: long interactive essay, zh and en (copy.en.js translated; enStub removed; English reviewed 2026-11-15, see Review).
Files: index.html, copy.zh.js, copy.en.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs
Tests: `node computing/systems/how-a-cpu-runs-a-program/tests/models.cjs`;
`ESSAY_BASE_URL=http://127.0.0.1:18943 NODE_PATH=~/fast/integ-life/integ-games/node_modules node computing/systems/how-a-cpu-runs-a-program/tests/browser.cjs`
(optional `SHOT_DIR=/tmp/...`).

## The one question

你写的一行代码，最后怎么变成 CPU 里一拍一拍的动作？为什么同一个程序，换一种写法、换一颗 CPU，速度能差好几倍？

The answer the page builds: code is translated into instructions of a contract (the ISA); hardware executes them along a
datapath; pipelining overlaps five instructions and handles their waiting with forwarding and flushing; time = instructions ×
cycles per instruction × clock period, and code (first factor) and chip (second and third) multiply. One C loop
(`sum += a[i]`) runs through every model, in three hand-written RV32I versions (index, pointer + scheduled, unrolled ×2).

## Changes from the ladder in the task

- Kept the order. Merged "what an ISA is" into a short ch1 without a model (a diagram instead): a model there would be decoration.
- "Data hazards and forwarding" (ch7) teaches where the forwarding multiplexers are and when the forwarding unit fires
  (EX/MEM over MEM/WB, x0 excluded) and instruction scheduling; it links the memory essay #ch1 for the load-use stall and for
  what happens when the load misses, and takes none of that chapter's alias words.
- Control hazards (ch8) model two static policies (stall, predict not-taken) and two resolution stages (EX, ID). BTFN is
  described in prose only; branch prediction is left to A4 (named in plain text, not linked).
- The iron law (ch9) compares three compiled versions on four machines (single-cycle 1.25 GHz; five-stage 5 GHz with forwarding,
  without forwarding, and with ID-stage branches) — the "two clock speeds" are the single-cycle and pipelined clocks, both
  derived from the same component latencies in ch5.
- CISC vs RISC (ch10) is a decoder model over six real x86-64 encodings, not a micro-op count of any particular core.

## Chapters, models, sources

1. **ISA as a contract.** Diagram only (layers). Links switches-that-compute #ch9.
2. **RV32I registers and the six formats.** Model: an assembler/disassembler for 29 RV32I instructions (no sltiu/sltu, byte/halfword loads, fence, system) (all six formats).
   Field layouts, opcodes, funct3/funct7 typed from the spec listing; ABI names from the psABI. Verified: 26 corpus lines plus the
   three programs encoded here and disassembled by Capstone 5 (pip, into /tmp scratch, 2026-11-15) — all agree; the hex strings are
   pinned in tests/models.cjs. Range and alignment errors tested at ±1 past every boundary.
3. **Hand-compiling a loop.** Model: an RV32I interpreter (registers, word memory) running v1/v2/v3 for n = 2…8. Discovery:
   6 / 4 / 3 instructions per element; 6,004 / 4,005 / 3,005 at n = 1,000. The three versions are hand-written, not compiler output
   (stated on the page).
4. **Single-cycle datapath.** Model: step v1 (n = 2) and see units used, seven control signals, ALU in/out, next PC.
   Control table rows R / lw / sw / beq from Patterson & Hennessy, RISC-V edition, ch. 4 (main control table); the I-arith and jalr
   rows and the ALUOp numbering are the page's extension (stated on the page).
5. **The slowest instruction sets the clock.** Model: per-class path latency (lw > sw > ALU > branch) with three sliders;
   single-cycle period, average useful time on v1's dynamic mix, pipelined stage time, ideal speed-up = period / slowest stage.
   **TUNED / textbook example:** memory 200 ps, register file 100 ps, ALU 200 ps (P&H ch. 4's example latencies, from memory of
   the textbook — see Not checked). Conclusions (lw sets the clock; speed-up < 5 unless stages balance) do not depend on them.
6. **Five-stage pipeline.** Model: cycle-accurate in-order single-issue pipeline (IF ID EX MEM WB), drawn as a pipeline diagram
   (rows = instructions, columns = cycles), step / play / all. Register file write-first-half, read-second-half. n = 2 v1:
   16 instructions, 24 cycles; 12.8 ns single-cycle vs 4.8 ns pipelined.
7. **Data hazards and forwarding.** Same simulator; forwarding on/off; arrows show EX/MEM (gold) and MEM/WB (green) forwards.
   Rules (P&H §4.7): consumer needs value at start of EX; ALU producer → available next cycle; load → one bubble; no forwarding →
   consumer's ID no earlier than producer's WB. Per element (n = 1,000): v1 16 → 9 cycles; v2 6, no stall.
8. **Control hazards.** Same simulator; stall vs predict-not-taken; resolve in EX (2 wrong-path fetches flushed) or ID (1; the ID
   comparator needs operands one cycle earlier: one extra stall after an ALU producer, two after a load). Per element: v1 9 in every
   combination (ID-resolution's saved cycle is lost to the `addi`→`blt` stall); v2 6 → 5; v3 4 → 3.5. The sentence for ID mode
   compares against EX-resolution measured on the model, not by version name.
9. **Iron law.** IC from the interpreter, CPI from the simulator (n = 1,000), period from ch5. v1 single-cycle 4.80 ns/element →
   v1 pipelined 1.80 (×2.7) → v3 pipelined 0.80 (×6.0) → v3 with ID branches 0.70 (×6.8). Single-cycle has the lowest CPI and is
   slowest; v2 has v1's CPI (1.50) and is faster.
10. **CISC vs RISC.** Six x86-64 instructions, bytes assembled with Apple clang 21 (`--target=x86_64-apple-macos`, Intel syntax) and
    disassembled with objdump on 2026-11-15; byte roles (opcode / ModRM / SIB / displacement-immediate / REX) by the standard x86
    encoding. "Steps" are the semantic split (address, load, ALU, store); how a given core forms micro-ops is not modelled (stated).
    The comparison is x86-64 against RV32I; the 64-bit-constant and push rows depend on register width (stated in the limit).
11. **Frontier (as of November 2026).** See below.
12. **Closing.** Three questions (instruction count, where it stalls, same-program time).

Diagrams (8, inline SVG from app.js, labels from copy, wide and portrait layouts): `layers` (ISA contract, ch1), `fmt` (six
formats to bit width, ch2), `single` (single-cycle datapath with control, ch4), `pipe` (five stages, four pipeline registers,
writeback path, ch6), `fwd` (pipeline-diagram snippet from the simulator with an EX/MEM forward, a load stall and a MEM/WB forward,
ch7), `flush` (taken branch, two flushed fetches, from the simulator, ch8), `iron` (the three factors and what moves each, ch9),
`uops` (one x86 instruction decoded into four steps, ch10). `fwd` and `flush` and their captions' cycle numbers are generated from
`M.pipeline('v1', 2)`; `fmt` from `M.FORMATS`; the rest are schematic and say so.

## Sources (opened 2026-11-15 unless stated)

- RISC-V International, *The RISC-V Instruction Set Manual, Volume I: Unprivileged Architecture*, isa v20260120:
  https://docs.riscv.org/reference/isa/v20260120/unpriv/rv32.html (RV32I 2.1: 32 × 32-bit x registers, x0 hardwired to 0, fixed
  32-bit instructions, register fields in fixed positions, sign bit at 31, NOP = ADDI x0,x0,0, B offsets in multiples of 2, branch
  range ±4 KiB, JAL ±1 MiB) and https://docs.riscv.org/reference/isa/v20260120/unpriv/rv-32-64g.html (RV32I listing: opcode /
  funct3 / funct7 for every instruction used).
- RISC-V psABI, calling convention: https://github.com/riscv-non-isa/riscv-elf-psabi-doc/blob/master/riscv-cc.adoc (ABI names).
- RVA23 ratification: https://riscv.org/blog/risc-v-announces-ratification-of-the-rva23-profile-standard/ (post 2024-10-21; vector
  and hypervisor mandatory; Google: baseline for the Android RISC-V ABI). Profile document v1.0 dated 2024-10-17 (seen via the search
  result for https://developer.riscv.org/pdf/rva23-profile.pdf; PDF not opened).
- Canonical, 2026-02-05: https://canonical.com/blog/2026/02/05/spacemit-announces-availability-of-ubuntu-on-k3-k1-series/ (Ubuntu
  25.10 adopted RVA23 as the RISC-V baseline; K3 "one of the first RVA23 compliant platforms available today").
- Arm, "Arm A-Profile Architecture Developments 2025" (Martin Weidmann, 2025-10-02):
  https://developer.arm.com/community/arm-community-blogs/b/architectures-and-processors-blog/posts/arm-a-profile-architecture-developments-2025
  and "…2026" (2026-10-05): https://developer.arm.com/community/arm-community-blogs/b/architectures-and-processors-blog/posts/arm-a-profile-architecture-developments-2026
- Intel, "Intel Advanced Performance Extensions (Intel APX)" (updated 2024-10-31):
  https://intel.com/content/www/us/en/developer/articles/technical/advanced-performance-extensions-apx.html (16 → 32 GPRs, three-operand
  forms, "10% fewer loads and more than 20% fewer stores", "10% fewer instructions", from a prototype simulation of SPEC CPU 2017 Integer).
- Patterson & Hennessy, *Computer Organization and Design, RISC-V Edition* (ch. 1 iron law; ch. 4 datapath, control, pipeline,
  hazards, forwarding, branch handling). Not re-opened for this page; used from knowledge (see Not checked).

## Facts that will go stale (all in `FRONTIER` in models.js and ch11 of copy.zh.js)

ISA manual version v20260120; RVA23 ratified 2024-10-21; Ubuntu 25.10 baseline; K3 "one of the first" (2026-02-05); Armv9.7-A
(2025-10-02) and Armv9.8-A (2026-10-05) features; APX figures (Intel page 2024-10-31); Nova Lake AVX10.2 + APX (reported 2025-11).
Labelled on the page as established / demonstrated / claimed.

## Tuned parameters

Component latencies 200 / 100 / 200 ps (textbook example; sliders let the reader change them; ch5's conclusions hold at every
slider position, tested at the extremes). n = 1,000 for steady-state per-element costs (fill and drain negligible; per-element
cost is measured as the difference between n = 1,000 and 1,002). Array contents 3,1,4,1,5,9,2,6,… (any values give the same
timing; the pipeline has no data-dependent latency).

## Checked / not checked

Checked: every encoding against Capstone; x86 bytes with clang + objdump; all prose numbers recomputed from models.js and pinned
(tests/models.cjs, 1,855 checks); hand-worked pipeline rows (stall placement, forwarding sources, flushes); live-sentence branches at
control extremes; browser test (zh, 1280/390/320, reduced motion); canvas sweep; screenshots of every model and diagram at three widths.

Not checked against a primary source opened for this page:
- P&H's example latencies (200/100/200 ps), its control table and the statement that its first pipelined design decides branches
  in MEM (3 flushed) — from knowledge of the textbook, not re-opened.
- x86's 15-byte instruction length limit (Intel SDM vol. 2 §2.3.11, not opened) and x86's 1978 origin, Pentium Pro (1995) as the
  first Intel core to translate to micro-ops, MIPS delayed branches, Berkeley RISC lineage of RISC-V — from knowledge.
- Nova Lake AVX10.2 + APX: via Phoronix's report of Intel's ISE programming reference (Nov 2025); the Phoronix page returned 403 and
  Intel's reference page showed an older revision; the page labels it a report.
- AMD/Intel x86 Ecosystem Advisory Group statements (AMD blog timed out) — not used on the page.
- "a mispredict costs a dozen or more cycles on modern cores" is stated as an order of magnitude only.

## Notes for the registrar (one word, one owner)

- Aliases taken here avoid every alias of switches-that-compute, why-compute-waits-for-memory, how-cpu-caches-work, how-pcie-works,
  how-a-computer-is-wired and how-thunderbolt-works (tested), and every alias string in atlas/graph (checked once by script).
- Candidates for the registrar to move to this page (not taken): 指令集 / instruction set / ISA and 机器码 / machine code
  (switches #ch9; this page's #ch1/#ch2 answer them in depth); CPU 怎么执行程序 / how a CPU runs a program (switches #ch9; this
  page's title); 流水线 / pipelining (switches #ch11, which mentions pipelining in one paragraph; this page's #ch6); 关键路径 /
  critical path stays on switches #ch4 (gate level) — this page's #ch5 uses 时钟周期由什么决定 instead. Leave 流水线气泡, 数据旁路,
  forwarding, load-use hazard, pipeline stall and CPI on why-compute-waits-for-memory #ch1.

## Review

Reviewer: Claude Code (claude-opus-5-5), separate session, independent of the builder. Date: 2026-11-15.
Verified-By form: `Claude Code (claude-opus-5-5): independent review of zh and en (every key of copy.zh.js and copy.en.js), models re-derived, diagrams viewed at 1280/390/320 zh/en`.
Scope: zh and en read in full; models.js, app.js, index.html, REGISTRY.json, tests.

Checks (independent of the page's code; scratch in /tmp/agent-tasks/arch/review-a1/):
- RV32I encoder: my own encoder typed from the spec listing, 29 ops × 60 random/edge operand sets (1,740 words, incl. B/J
  immediates at ±range limits, negative offsets, shamt 0/31) — 0 differences from models.js; all 1,740 disassembled by
  Capstone 5.0.7 agree (after expanding Capstone's aliases mv/not/j/bnez/…). The page has 29 instructions, not 33.
- ISA manual v20260120 (docs.riscv.org, opened): RV32I 2.1, IALIGN=32, B offsets in multiples of 2, ±4 KiB, JAL ±1 MiB, NOP = ADDI x0,x0,0.
- Pipeline: my own cycle-by-cycle simulator (own interpreter, PC-based fetch with real wrong-path fetches, P&H hazard rules)
  over v1/v2/v3 × {no fwd, fwd, ID branch, stall, stall+ID} × n ∈ {2,4,6,8,1000,1002}: 90/90 configurations match models.js in
  cycles, data stalls and flushes. Per element 16/9/9/9/9, 7/6/5/6/5, 5/4/3.5/4/3.5; v1 n=2: 24 cycles.
- Iron law: 6,004/4,005/3,005; v1 single 4.80 ns → v3 ID-branch 0.70 ns/element; ratio of totals at n=1,000 = 6.846 (prose 6.8;
  4.80/0.70 from rounded readouts would give 6.9 — the prose ratio is the exact model ratio). Critical path 800/700/600/500 ps,
  waste 22.9%, ideal 4.0×; halving/doubling each latency keeps lw on the critical path and ideal ≤ 5 (= 5 only when balanced).
- x86 bytes re-assembled with Apple clang 21 (x86_64-linux target) + objdump: all six match; SIB/ModRM roles decoded by hand.
- Sources opened: Intel APX page (10% fewer loads, >20% fewer stores, 10% fewer instructions; 16→32 GPRs; updated 2024-10-31);
  RVA23 post 2024-10-21 (V and H mandatory; Google: Android RISC-V ABI baseline); Canonical 2026-02-05 (Ubuntu 25.10 RVA23
  baseline, K3) + second place: CNX Software / Canonical retro / Phoronix coverage; Arm 2025-10-02 (Armv9.7: TLBI domains, FP6
  SVE/SME) and 2026-10-05 (Armv9.8: Conditional Fault instructions, Rust named); Nova Lake AVX10.2 + APX: Phoronix and
  HotHardware/eTeknix reports of Intel's ISE reference (Intel PDF not opened); 15-byte limit: SDM vol. 2 §2.3.11, read in a mirrored
  copy (xem.github.io/minix86), not on intel.com; P&H latencies 200/100/200 ps and ld/sd/R/beq = 800/700/600/500 ps, Tc 800 → 200:
  IIT Kanpur CASS 2018 slides that cite COD RISC-V edition ch. 4 (not the book itself); control-table rows R/lw/sw/beq consistent
  with P&H MIPS-edition copies (Berkeley/NUS); RISC-V edition figure not opened.
- Browser test ×3 (zh+en, 1280/390/320, reduced motion): PASS each time. Canvas sweep (scroll-aware, zh+en): 467 states PASS.
  Screenshots of all eight diagrams at 1280/390/320 zh and en looked at.

Changes:
- ch11.c1 zh was garbled; now matches Intel's wording (loads −10%, stores −20%+, instructions −10%); pinned in tests.
- REGISTRY desc / doc.desc: "data dependences" → "data hazards"; zh 数据相关 → 数据冒险 in desc, ch7 title and TOC; ch7.p2
  (zh/en) now separates the dependence (RAW) from the hazard it causes.
- "第 9 章的小机器" (ch3.p4, ch4.p1, ch5.p4) meant switches-that-compute #ch9, but this page's ch9 is the iron law; now named. The
  claims that machine is multi-cycle / splits instructions into several cycles were not true of it (it is modelled
  behaviourally); removed.
- ch5.law said most of the time is wasted; the model gives 23%. Reworded ("part of almost every cycle"); pinned.
- ch2.say.err.align said RISC-V instructions are 2-byte aligned; base RV32I has IALIGN=32. Fixed.
- New live sentence ch2.say.Ish: shifts put shamt in bits 24:20 and funct7 above (the I sentence said "top 12 bits").
  ch2.say.U now covers auipc (adds the PC), not only lui.
- ch6.p5: separate instruction/data memories are the model's choice (caches in real chips), not something RISC-V specifies.
- ch8.limit zh "教科书第一版" (reads as "1st edition") → "教科书最初的流水线设计".
- ch9.say.mid "是起点的 {x}" (ambiguous: reads as slower) → "比起点快 {x}"; en likewise.
- ch10.p3: 15-byte limit now cited (SDM §2.3.11) instead of "not rechecked"; ch10.say.many: decoder "usually" splits, varies by core.
- ch11.c2: removed "Intel only said before end of 2026" (stale by Nov 2026; launch reportedly slipping to 2027, unconfirmed).
- en ch12.q3: "“cycles per instruction” is the reciprocal of the second" → "instructions per cycle".
- Diagrams: fwd/flush wide headers crowded ("Cycle 9Cycle 10…") → one "Cycle" row label + bare numbers; en uops "Compute address
  rdi + 4·rcx + 16" overran its box → "Address …"; en pipe write-back label shortened; single-cycle caption no longer claims
  dashed control wiring that is not drawn.

Unverified / left:
- RVA23 profile PDF date 2024-10-17 (not opened); exact P&H text that the first pipeline resolves branches in MEM (3 flushed);
  the RISC-V-edition control-table figure; Nova Lake from Intel's own PDF; Pentium Pro 1995 / x86 1978 / Berkeley lineage of
  RISC-V / MIPS delayed branch (from knowledge); "a dozen or more cycles" per mispredict (order of magnitude only).
- en pipe diagram at 1280: the write-back label still runs across the translucent EX/MEM bar (readable).
- Design note, not changed: per-element times are total/n at n=1,000, so the speed-ups (2.7, 2.2, 6.0, 6.8) are exact model ratios
  while the rounded readouts (1.80/0.80/0.70) suggest 2.25 and 6.86.
- Registrar: 指令集 / ISA / 机器码 / 流水线 still on switches-that-compute; not moved here. Script cache keys not bumped.
