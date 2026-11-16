---
lang: en
title: How Virtual Memory Works · a long essay you can play with
desc: Every program believes it has a whole memory to itself, starting at address 0, while dozens of programs share the same physical memory. The CPU translates an address before every byte it reads; why is that not slow? Eleven hands-on models: contiguous allocation and external fragmentation, the size of a page table, an x86-64 four-level walk bit by bit, the TLB and its reach, the page-walk cache, huge pages, the cost of a page fault, FIFO, LRU and the clock algorithm, copy-on-write, PCID and KPTI, and the two-dimensional walk inside a virtual machine.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.cyc: {v} cycles
u.ns: {v} ns
u.us: {v} µs
u.ms: {v} ms
u.B: {v} bytes
u.KiB: {v} KiB
u.MiB: {v} MiB
u.GiB: {v} GiB
u.TiB: {v} TiB
u.PiB: {v} PiB
u.x: {v}×
u.none: —
u.pages: {v} pages
u.tables: {v} tables
u.levels: {v} levels
u.refs: {v} reads
u.per1k: {v} per 1,000 accesses
u.oneIn: once every {v}
u.entries: {v} entries
u.procs: {v} processes
:::

# How Virtual Memory Works {#hero}

::: strings
kicker: Computing · Systems · a long essay you can play with
:::

Every program believes it has a whole memory to itself, starting at address 0,<br>while dozens of programs share the same physical memory.<br>The CPU translates an address before every byte it reads. Why is that not slow? {.sub}

We start with a question: why not let programs use the addresses on the memory chips directly? Then we split an address apart and see why a page table has to be a tree. We walk an x86-64 four-level table by hand. We see how the TLB hides the cost of translation, and how much that cost is when it is not hidden. Then huge pages, page faults, and which page to evict when memory runs short. Then why fork is fast, what happens to the TLB on a process switch or a kernel entry, and last, the two-dimensional page table inside a virtual machine. **Each model is a small version of the real mechanism**: a first-fit allocator, page tables built in the format of Intel's manual, a fully associative LRU TLB and page-walk cache, four replacement algorithms, or a named formula (effective access time, or the nm + n + m of a two-dimensional walk). {.lead}

An AI wrote this page. The page-table format comes from volume 3A of Intel's Software Developer's Manual (September 2026 edition), and the TLB sizes come from AMD's Zen 5 optimisation guide. Every other number has its source and date given. **Values marked 'tuned parameters' were chosen so that the model can be computed; they were not measured.** The page explains mechanisms only. **It does not judge which system or chip is better.** {.note}

## Why virtual addresses {#ch1}

::: strings
toc: Why virtual addresses
:::

A program sees an address as a number. Hardware and the operating system work together to translate that number into a real place on the memory chips. With this layer in between, programs cannot see each other, and they need not know where they have been placed. {.law}

On Linux, turn off address randomisation (<code>setarch -R</code>). Open two terminals and run the same program in each, so that it prints the address of a global variable. Both print the same number. Yet the two programs write different values to that address, and neither changes the other's. The reason is that this address is not a place on the memory chips. It is each process's own set of house numbers. Every time the CPU reads or writes, it first translates the house number into a real physical address.

::: diagram dg-map keys=dg.map
cap: Two processes, two page tables, one physical memory. Processes A and B both start their virtual addresses at 0. Their code, heap and stack sit in unrelated frames of physical memory. The C library's code pages exist once, and both processes map them at the same time (chapter 9). Schematic, not to scale.
aria: Diagram: two processes' virtual pages, each mapped through its own page table to frames in one physical memory. The C library's frames are shared by both processes
pa: A's virtual addresses
pb: B's virtual addresses
phys: Physical memory (frames)
ptA: A's page table
ptB: B's page table
code: Code
heap: Heap
libc: C library
stack: Stack
shared: Shared frames
zero: 0
:::

This translation gives four things. **Isolation**: one process's house numbers cannot reach another process's memory. **Freedom to move**: a program is compiled for fixed addresses, and the operating system can place it anywhere in physical memory. **More than the RAM**: some pages can sit on disk for a while and be brought back when needed (chapter 7). **Sharing**: the C library code used by dozens of processes needs only one copy in physical memory, and each process's house numbers translate to the same frames (chapter 9).

The earliest method is simple. It is called **base and bound**. Each process takes one contiguous block of physical memory. Two registers in the CPU record where the block starts and how long it is. Each access adds the base to the address and checks that the result stays under the bound. **Segmentation** generalises this, with one base-and-bound pair each for code, heap and stack. Both methods need every block to be contiguous. As processes come and go, holes of all sizes are left in memory. The model below runs two kinds of allocation side by side: one needs contiguous space, and the other places pages wherever there is a free frame.

::: lab ch1-model
model.title: Contiguous, or paged wherever there is room
model.how: 256 MiB of memory. At each step a new process arrives, with a size between half and one and a half times the mean. It leaves after 10 to 60 steps. (These numbers are **tuned parameters**.) The top strip is contiguous allocation (first fit: take the first hole from the bottom that is large enough). The bottom strip is paged allocation (take any free frame). A process that does not fit is refused, and a red dot marks it. Drag the mean size, and press 'Replay' to watch it unfold step by step.
model.aria: Two memory strips over time: contiguous allocation on top, paged allocation below. Red dots mark refused processes
leg.used: in use by a process
leg.free: free
leg.fail: refused process
ctl.mean: Mean process size
btn.play: Replay
btn.end: Jump to end
read.bb: Refused, contiguous
read.pg: Refused, paged
read.free: Total free, contiguous
read.hole: Largest single hole
cv.bb: Contiguous
cv.pg: Paged
cv.step: Step {t} of {n}
say.none: Mean {mean}: by step {t}, neither method has refused a process. Memory is still roomy.
say.bbOnly: Mean {mean}: contiguous allocation has refused *{failB}* processes, and paged allocation none. Free space totals {free}, but the largest hole is only {largest}, too small for the next arrival.
say.both: Mean {mean}: contiguous allocation has refused *{failB}*, and paged allocation has refused {failP}. The gap is roughly what fragmentation costs. The rest is memory that is really full.
say.full: Mean {mean}: contiguous allocation has refused {failB} and paged allocation *{failP}*, about the same, or even more for paging. Memory itself has run out: the processes paging accepted earlier still hold their memory, so later arrivals are turned away. The two allocators no longer hold the same processes, so a difference of a few is chance. Fragmentation is no longer the main problem.
:::

With a mean of 6 MiB, contiguous allocation refused {fFailB} processes in {fragSteps} steps, and paged allocation refused {fFailP}. At the end, {fFree} MiB is still free, but the largest hole is only {fLargest} MiB. This is called **external fragmentation**: there is enough memory, but it is not contiguous. With a mean of 3 MiB, both refuse {f3FailB}. At a mean of 12 MiB, memory itself runs short, and the counts are {f12FailB} against {f12FailP}. Paged allocation removes the need for contiguity altogether. The price is a table that records where each page is. How large that table is, is the subject of the next chapter.

This model does not count the memory the page table itself uses, or the unused part of a page (internal fragmentation). Process sizes and lifetimes are tuned parameters. Real systems do not simply refuse processes. They move some pages out to disk, which is the subject of chapters 7 and 8. {.take}

## Pages, offsets and multi-level page tables {#ch2}

::: strings
toc: Pages, offsets and multi-level page tables
:::

Split the address in two. The high bits are the page number, and that needs a table lookup. The low bits are the offset within the page, and they are copied unchanged. With 4 KiB pages, the low 12 bits are never translated. The table records only which frame holds each page. {.law}

A library call number has two parts too. The first part tells you the shelf, and the second gives the book's place on that shelf. If the whole shelf moves to another floor, the second part does not change. Memory is cut the same way. The virtual address space is cut into equal **pages**, and physical memory into equal **frames**. Any page can go into any frame. The basic x86-64 page is 4 KiB, or 2<sup>12</sup> bytes, so the low 12 bits of an address are the offset within the page, and they stay the same after translation. The high bits are the page number, which is translated into a frame number. This is why the paged allocator in chapter 1 never needed contiguous space.

::: diagram dg-split keys=dg.split
cap: Address of a 4 KiB page: the upper 36 bits are the virtual page number, which the page table turns into a physical frame number. The lower 12 bits are the offset within the page, copied unchanged after the frame number. Bit numbers follow the 48-bit x86-64 address.
aria: Diagram: a 48-bit virtual address split into a 36-bit virtual page number and a 12-bit offset. The page number is looked up and replaced by a frame number, and the offset is copied unchanged
va: Virtual address
vpn: Virtual page number (36 bits)
vpnS: page no., 36 bits
off: Offset within page (12 bits)
offS: offset
table: Page table: page number → frame number
tableS: look up
pa: Physical address
pfn: Physical frame number
pfnS: frame number
copy: copied
:::

The most direct table is an array. The index is the page number, and each entry is 8 bytes, holding a frame number and a few permission bits. For a 32-bit address with 4 KiB pages there are 2<sup>20</sup> entries, so the table takes {flat32} MiB. That is one table per process, and already a lot. x86-64 uses 48-bit addresses today, which means 2<sup>36</sup> entries. A flat table of that size would take {flat48} GiB, and with 57-bit addresses, {flat57} TiB. But a process uses only a few pieces: code, heap, a few libraries and the stack, with empty space between them. The fix is to page the table too. Each table is exactly one page holding 512 entries, and tables are built only for the pieces in use.

::: lab ch2-model
model.title: A flat table or a multi-level tree
model.how: Choose an address width and a page size, then adjust the size of this process's heap. The readout shows how large a flat table would be, how many levels a multi-level table needs, and how many tables this process actually builds. Each table takes one page, and each entry is 8 bytes, so each level uses log₂(page size ÷ 8) bits. The process layout is a **tuned parameter**: 4 MiB of code, an adjustable heap, 32 MiB of shared libraries and an 8 MiB stack, like an ordinary Linux process.
ctl.va: Address width
ctl.page: Page size
ctl.heap: Heap size
read.flat: Flat table (per process)
read.levels: Levels in the tree
read.tables: Tables this process builds
read.bytes: Total size of those tables
vafmt: {v} bits
bits.lv: Level {i}: {n} bits
bits.off: Offset within page: {n} bits
say.tree: {va} addresses, {page} pages: a flat table would need {flat}. Built as {levels}, a process that maps {mapped} needs only *{tables}*, {bytes} in all.
say.huge: {va} addresses, {page} pages: a flat table would be *{flat}*, more than the memory of any machine. Built as {levels}, this process needs only {tables}, {bytes} in all.
:::

48-bit addresses with 4 KiB pages: {lv48} levels. This process maps {t48map} MiB and needs {t48n} tables, {t48kib} KiB in all. A flat table would take {flat48} GiB. When the heap grows to {heapBig} GiB, it needs {t48bigN} tables, {t48bigMiB} MiB, about 1/512 of the memory mapped, because each 8-byte entry maps 4 KiB. The page size changes the bits per level. A 16 KiB page holds 2,048 entries per table, so each level covers {bits16k} bits, and a 47-bit address needs only {lv16k47} levels. With 64 KiB pages, a 42-bit address needs only {lv64k} levels. The cost is that a lookup reads several tables in turn. That is the walk in the next chapter.

This counts only the tables for user space, not the kernel's own mappings. The layout is illustrative. A real process has more libraries, spread further apart, so it has a few more tables. {.take}

## The x86-64 four-level page table {#ch3}

::: strings
toc: The x86-64 four-level page table
:::

The CPU takes the physical address of the first table from the CR3 register. It uses 9 bits of the virtual address to choose one entry, which points to the next table. Four such steps give a frame number. Append the low 12 bits, and you have the physical address. {.law}

Volume 3A of Intel's Software Developer's Manual (September 2026 edition), chapter 5, sets this out in detail. Four-level paging translates a {va4}-bit linear address into a physical address of up to {pa} bits. Bits 47 to 39 choose an entry in the PML4 table. Bits 38 to 30 choose one in the PDPT. Bits 29 to 21 choose one in the PD. Bits 20 to 12 choose one in the PT. The last bits, 11 to 0, are the offset within the page: 9 + 9 + 9 + 9 + 12 = 48. Each table is 4 KiB, with 512 entries of 8 bytes, so the physical address of an entry is the table's base plus index × 8. Bits 63 to 48 must match bit 47. This is a **canonical address**. User programs therefore use the lowest 128 TiB, and the kernel uses the highest 128 TiB.

::: diagram dg-walk keys=dg.walk
cap: Four-level page walk. Each 9-bit index selects one entry from a 512-entry table, and that entry points to the next table. The last entry gives the frame of a 4 KiB page. Bit numbers follow section 5.5 of the Intel manual. Table positions are schematic.
aria: Diagram: CR3 points to the PML4 table. Four 9-bit fields of the virtual address each select an entry in turn from the PML4, PDPT, PD and PT tables. The final frame number, with the 12-bit offset appended, gives the physical address
cr3: CR3
page: 4 KiB page
data: Byte to read
idx: bits {hi}–{lo}
off: bits 11–0
e: 512 entries × 8 bytes
:::

Each entry is 64 bits, and Table 5-20 of the manual lists what each bit means. Bit 0, P, marks the entry as present. Bit 1, R/W, when 0, forbids writes. Bit 2, U/S, when 0, keeps user mode out. Bit 5, A, is set by the hardware on access. Bit 6, D, is set on a write. Bit 8, G, marks the page as global, so it is not cleared on a process switch (chapter 10). Bits 12 and up hold the frame number. Bit 63, XD, when 1, forbids executing instructions from the page. In a PD entry, bit 7 is PS. When it is set, the entry maps a 2 MiB huge page directly, one level shorter (chapter 6).

::: diagram dg-pte keys=dg.pte
cap: Page-table entry mapping a 4 KiB page (Intel manual, Table 5-20). M is the number of physical address bits the processor supports, up to 52. Bits M to 51 are reserved and must be 0.
aria: Diagram: the 64-bit layout of an x86-64 page-table entry, marking the bits for P, R/W, U/S, PWT, PCD, A, D, PAT, G, the frame number, protection key and XD
xd: XD no-execute
pk: PK
ign: Ignored
ignS: ign.
rsv: Rsvd
pfn: Frame number (bits M−1 to 12)
pfnS: frame no.
low: Low 12 bits: flags
P: P present
RW: R/W writable
US: U/S user access
PWT: PWT write-through
PCD: PCD no cache
A: A accessed
D: D dirty
PAT: PAT memory type
G: G global
:::

::: lab ch3-model
model.title: Walking a page table by hand
model.how: Enter a virtual address, or pick a preset. See how the four-level (or five-level) lookup splits the address, which physical address each step reads, and what each bit of the entry means. The toy process's page tables are built from a fixed seed, with its frames scattered through 16 GiB of physical memory. The entry format follows Table 5-20 of the manual. Choose an access type, and the permission bits take effect. Accesses are treated as coming from user mode.
ctl.addr: Address
ctl.pre: Preset
pre.heap: Heap
pre.code: Code
pre.huge: 2 MiB huge page
pre.absent: Swapped-out page
pre.hole: Unmapped gap
pre.kern: Kernel address
pre.noncanon: Non-canonical address
ctl.lv: Paging
lv.4: Four-level
lv.5: Five-level
ctl.acc: Access
acc.r: Read
acc.w: Write
acc.x: Execute
steps.aria: Each step of the page walk: the physical address read, the entry read, and its flag bits
read.pa: Physical address
read.refs: Memory reads
read.page: Page size
read.fault: Exception
bits.f: {name} index {n}
bits.off: offset {n}
bits.sign: sign extension
step.cr3: CR3 → table at physical address {base}
step.row: {name}[{idx}]  read {addr}  →  {entry}
step.flags: "    {flags}"
step.next: "    next table at {next}"
step.leaf4k: "    this is frame {pfn} of a 4 KiB page"
step.leaf2m: "    PS = 1: this entry maps a 2 MiB page, starting at frame {pfn}"
step.np: "    P = 0: there is no valid mapping here"
step.pa: physical address = {pa}
f.none: None
f.noncanon: #GP
f.pf: Page fault #PF
say.bad: Enter a hexadecimal address, for example 0x555555561a38.
say.ok: All four (or five) steps found entries with P = 1. The last entry gives the frame, and appending the offset gives *{pa}*. For this one access, the hardware read memory {refs} times.
say.huge: At the PD level, PS = 1: this entry maps a 2 MiB page directly. The low 21 bits are the offset. Only {refs} reads were needed to reach *{pa}*.
say.absent: The upper levels are present, but the last entry has P = 0. This page has been swapped out to disk, and the other bits are left for the operating system to record where it is. The CPU raises a *page fault*. The operating system reads the page back and writes the entry, and the instruction runs again (chapter 7).
say.hole: At the {level} level, an entry has P = 0, and the tables below it were never built. This address range has never been mapped. The CPU raises a page fault. The operating system finds that the address is not valid, and the program gets a segmentation fault.
say.super: The entry's U/S bit is 0, so only the kernel may use it. An access from user mode raises a page fault for lack of permission, and the program gets a segmentation fault.
say.ro: The translation succeeds, but this page's R/W bit is 0 (a code page is read-only), so the write raises a page fault. If this is a copy-on-write page, the operating system makes a copy here (chapter 9).
say.xd: The translation succeeds, but this page's XD bit is 1, which forbids execution. Data on the heap and stack cannot run as code. Fetching an instruction raises a page fault.
say.noncanon: Bits 63 to {bits} do not match the bit below them. This is not a canonical address, so no tables are consulted. The CPU reports a general protection fault (#GP) at once.
:::

Level 5: set the LA57 bit in CR4, and a PML5 table is added. Bits 56 to 48 choose an entry, and addresses become {va5} bits wide. Linux's documentation says this raises the limit from {vaTiB} TiB of virtual address space and {pa4TiB} TiB of physical memory to {va5PiB} PiB and {pa5PiB} PiB. For compatibility, Linux does not by default give user processes addresses above 47 bits. A program gets one only by passing a high address as a hint to mmap.

An entry with P = 0 is a page fault. The CPU stops the instruction and hands it to the operating system (chapter 7). Writing to a read-only page, executing an XD page, or user mode touching a page with U/S = 0 also cause page faults, for different reasons. The A and D bits are the hardware's bookkeeping for the operating system. When a page must be evicted, D = 0 means it matches its copy on disk, so it can simply be dropped (chapter 8).

The toy process maps only a few regions. The page does not show how the PWT, PCD and PAT bits decide the memory type, nor the protection keys and the HLAT paging of the manual. Real CPUs cache the upper-level entries too, which chapter 5 covers. {.take}

## TLB: remembering translations {#ch4}

::: strings
toc: TLB: remembering translations
:::

If every access walked four levels of tables, one read would become five. The CPU records recently used 'page number → frame number' pairs in a small table called the TLB, and a hit makes translation almost free. The memory it can cover is the number of entries times the page size. {.law}

People remember frequently dialled numbers rather than looking them up each time. Programs work the same way. Read an array in order, and 512 eight-byte values share one 4 KiB page, so they share one translation. The small table that remembers translations is the **translation lookaside buffer** (TLB). The L1 cache and the TLB are checked at the same time, which works because the offset within a page needs no translation. This is covered in chapter 7 of <a href='../how-cpu-caches-work/#ch7'>How a CPU's Three Levels of Cache Work</a>.

::: diagram dg-tlb keys=dg.tlb
cap: The TLB sits in front of the page walk. On a hit, the page number is replaced by a frame number at once. On a miss, the hardware walker reads the page tables, which may take several memory reads, and fills the result into the TLB. Schematic.
aria: Diagram: the CPU issues a virtual address and checks the TLB first. On a hit, the physical address goes straight to the caches and memory. On a miss, the page-table walker reads the page tables, and the result is filled into the TLB
core: Core
va: Virtual address
tlb: TLB
hit: Hit: almost no time
miss: Miss
walker: Page-table walker
pt: Page tables in memory
fill: Fill the TLB
pa: Physical address → caches and memory
:::

AMD's Zen 5 optimisation guide states that the L1 data TLB has {tlbL1} entries, fully associative. The L2 data TLB has {tlbL2} entries, {tlbW}-way set associative, plus {tlb1g} entries reserved for 1 GiB pages. The instruction side has {itlb1} and {itlb2} entries. Each entry maps one page, so the L1 data TLB covers {tlbL1} × 4 KiB = {reachL1} KiB, and the L2 covers {tlbL2} × 4 KiB = {reachL2} MiB. This product is called the **TLB reach**. Once the working set is larger than the reach, misses begin.

::: lab ch4-model
model.title: One TLB, three access patterns
model.how: The TLB is fully associative with LRU replacement. There are three access patterns: random reads across an array; a sequential scan from start to finish; and a walk down a matrix column, where each row is 4 KiB, so each step crosses a row. Random reads simulate 40,000 accesses after 10,000 warm-up accesses. The two scans are cyclic page sequences, so under LRU their results can be computed exactly. The curve shows the miss rate against the number of entries, with one line for each page size. The dot marks the current setting.
model.aria: Line chart: TLB miss rate against the number of entries, with three lines for 4 KiB, 16 KiB and 2 MiB pages
ctl.trace: Access pattern
tr.rand: Random
tr.seq: Sequential
tr.col: Down a column
ctl.page: Page size
ctl.w: Array size
ctl.e: TLB entries
read.miss: Miss rate
read.reach: Reach (entries × page size)
read.pages: Pages the array occupies
read.per1k: Misses per 1,000 accesses
cv.x: TLB entries
cv.y: Miss rate
say.fits: Array {W} occupies {pages}. The TLB of {entries} covers {reach}, which holds it all, so after warm-up it almost never misses.
say.seqfit: Array {W} occupies {pages}, no more than {entries}. On the second pass every page is still there, and the miss rate is *{miss}*.
say.rand: Array {W} occupies {pages}, but the TLB covers only {reach}. For random reads the miss rate is *{miss}*, close to 1 − entries ÷ pages.
say.seq: There are more pages than entries. Under LRU each page is evicted before it is used again. But a sequential read touches many addresses in a page in a row, so only the first touch misses. Miss rate: *{miss}*.
say.col: Each step crosses a row of 4 KiB. With more pages than entries, the program reads only {per} times from each {page} page before moving on, so the miss rate is *{miss}*.
:::

Default settings: random reads over a 64 MiB array, with 1,536 entries and 4 KiB pages, give a miss rate of {r4}. The closed form 1 − entries ÷ pages gives {r4closed}. With 2 MiB pages it falls to {r2}. The sequential scan is {s4}: only the first of each page's 512 reads misses. Down a column with 4 KiB pages it is {c4}, since each access changes page. With 2 MiB pages it is {c2}. So the TLB cares not about how many bytes are read, but about how many different pages are touched in a given period.

This is also why the same code can run much faster with a different data layout. Read a matrix by rows and you finish one page before moving to the next. Read it by columns and nearly every value may need a new page. The case for caches is made in chapter 2 of <a href='../why-compute-waits-for-memory/#ch2'>Why Compute Waits for Memory</a>. The TLB follows the same logic, one layer further on.

Real TLBs have two levels and are set associative, and their replacement is not strictly LRU. The model also leaves out the instruction TLB. Uniformly random reads are the worst case; real programs are more concentrated. {.take}

## What a TLB miss costs {#ch5}

::: strings
toc: What a TLB miss costs
:::

On a TLB miss, the hardware walks the page table itself, making up to four memory reads, each waiting on the one before. Page-table entries can also be cached in the data cache, and a small dedicated cache holds the upper-level entries. Most misses then need only one or two reads. {.law}

A page walk is a chain of dependent reads. Until the PML4 entry is read, the PDPT's address is unknown. This is the same pointer chasing as in chapter 10 of <a href='../how-cpu-caches-work/#ch10'>How a CPU's Three Levels of Cache Work</a>, and the latencies stack one on another. So the CPU spends real effort here. AMD's documentation states that Zen 5 has {walkers} hardware page-table walkers, which can handle several misses at once. A dedicated **page-walk cache** (PWC) holds the PDPT and PD entries, and a hit skips two or three levels. A further cache of {pdc} entries holds the PML4 and PML5 entries.

::: diagram dg-pwc keys=dg.pwc
cap: The page-walk cache (PWC) holds entries from the upper levels. On a hit for the PD entry, the first three reads are skipped, and only the final PT read remains. Zen 5's PWC holds PDPT and PD entries, and a separate cache holds PML4 and PML5 entries (AMD optimisation guide §2.7.3). Schematic.
aria: Diagram: four reads for one page walk. A page-walk cache hit on the PD entry skips the first three reads and reads only the last level, the PT
full: No walk cache: 4 reads
hit: PD entry hit: 1 read
skip: skipped
read: read
:::

Skipping three levels means this: the PD entry is still cached, so only the final read of the PT remains. Neighbouring 512 pages of 4 KiB share one PD entry. So if accesses cluster within a few 2 MiB ranges, the PWC almost always hits.

::: lab ch5-model
model.title: How many memory reads a miss takes
model.how: Run the random reads from the chapter 4 model through Zen 5's two data TLB levels ({tlbL1} and {tlbL2} entries, both treated as fully associative LRU). If the L2 also misses, count how many memory reads that walk makes. The PD and PDPT walk caches hold {pwcT} entries each. This is a **tuned parameter**, since AMD does not publish the size. The top-level cache of {pdc} entries comes from the documentation. How many cycles each read takes depends on which cache level the entry happens to be in. The model does not simulate this. It gives two bounds: all entries in L2 ({l2lat} cycles), or all needing memory (about {dram} cycles). The data itself is counted as an L1 hit ({l1lat} cycles).
model.aria: Bar chart: average cycles per access. The gold bar is the lower bound, with all entries in L2. The red bar is the upper bound, with all entries going to memory
leg.best: Entries all in L2 (lower bound)
leg.worst: Entries all to memory (upper bound)
ctl.w: Array size
ctl.pwc: Page-walk cache
ctl.lv: Paging
read.miss: L2 TLB miss rate
read.refs: Memory reads per miss
read.best: Per access (lower bound)
read.worst: Per access (upper bound)
bar.now: Current setting
bar.nopwc: No walk cache
bar.pwc: With walk cache
say.fits: Array {W} lies within the reach of the L2 TLB ({reach}). Almost nothing misses, and each access costs {best}, the L1 hit time.
say.nopwc: Array {W}: {miss} of accesses miss the L2 TLB. Each walk goes through all {levels} and makes {refs} to memory, so each access takes between *{best}* and *{worst}*.
say.pwc: Array {W}: {miss} of accesses miss the L2 TLB. The walk cache skips the upper levels, so a walk averages only *{refs}* to memory. Each access takes between {best} and {worst}.
:::

Random reads over a 1 GiB array: the L2 TLB misses {w1miss}. Without the walk cache, each miss makes {w1refs} reads to memory, and in the worst case each access takes {w1worst} cycles. With it, a walk averages {w1prefs} reads, and each access takes between {w1pbest} and {w1pworst} cycles. At 64 GiB the upper-level entries no longer fit, and a walk needs {w64refs} reads, with a worst case of {w64worst} cycles. At 16 MiB the miss rate is only {w16miss}, since the array lies within the L2 TLB's reach. With five-level paging and the walk cache on, the cost barely rises: {w1p5refs} reads. This is why the step seen in chapter 10 of the cache essay climbs higher still for large working sets.

The model does not simulate which cache level holds each entry, so the real numbers lie between the two bounds. The upper-level entries are reused often and usually sit in cache, so most cases should be near the lower bound. This is an inference, not something measured on this page. The model also leaves out the parallel walks of six walkers, walk prefetching, and speculative walks. {.take}

## Huge pages: one entry maps 2 MiB {#ch6}

::: strings
toc: Huge pages: one entry maps 2 MiB
:::

Larger pages make each TLB entry cover more, and they remove one level of the walk. The cost is that allocation and zeroing are done in large blocks. A huge page that is only partly used still occupies its full size. {.law}

A large box needs fewer labels, but a half-empty box still takes up a whole slot in the carriage. x86-64 has two kinds of huge page. A PD entry with PS set to 1 maps 2 MiB. A PDPT entry with PS set to 1 maps 1 GiB. Linux's transparent huge page documentation lists two benefits. Touching a 2 MiB region causes only one page fault, and over time TLB misses fall and each miss is quicker. The drawbacks are also written there: a fault must zero or copy a much larger block, and a program that touches a single byte is given the whole 2 MiB.

Huge pages also change how data is spread across cache sets. That is the subject of chapter 10 of <a href='../how-cpu-caches-work/#ch10'>the cache essay</a>. Here we look only at the TLB.

::: lab ch6-model
model.title: 4 KiB, 2 MiB and 1 GiB pages
model.how: Random reads over one array, using the chapter 5 model (Zen 5's two data TLB levels plus the walk cache), compare three page sizes. The 1 GiB pages use the L2 with {tlb1g} entries, as the documentation describes. 'Sparse' means that only 4 KiB of every 64 KiB is used (this pattern is a **tuned parameter**). The readout shows how much memory is actually allocated. The bars show the upper bound per access, with all entries going to memory.
model.aria: Bar chart: upper bound of cycles per access at three page sizes, with the current page size highlighted
ctl.w: Array size
ctl.page: Page size
ctl.pat: Usage
pat.dense: Used fully
pat.sparse: Sparse
read.miss: L2 TLB miss rate
read.reach: L2 TLB reach
read.worst: Per access (upper bound)
read.alloc: Allocated / actually touched
bar: {page} pages
allocfmt: {a} / {t}
say.fits: {page} pages: the L2 TLB covers {reach}, and the {W} array lies entirely within it. Almost nothing misses, and each access costs *{worst}* at most.
say.miss: {page} pages: the L2 TLB covers only {reach}. On the {W} array, {miss} of accesses miss, and each access costs at most *{worst}*.
say.bloat: Used sparsely: only {touched} is actually touched, but with {page} pages the system allocates *{alloc}*, {bloat} what is used.
:::

A 16 GiB array: with 4 KiB pages, {h4miss} of accesses miss, and the worst case is {h4worst} cycles per access. 2 MiB pages cover {reachL2h} GiB, so only half the array fits. They miss {h2miss}, but each miss makes only {h2refs} reads, with a worst case of {h2worst} cycles. 1 GiB pages, {reach1g} entries covering 1 TiB, miss {h1gmiss}, at {h1gworst} cycles each. Conversely, when used sparsely, 4 KiB pages allocate {hs4alloc} GiB, while 2 MiB pages must allocate {hs2alloc} GiB, which is {hs2bloat} times as much. On Linux, you can inspect and use huge pages like this:

::: html ch6-html
cmd.aria: Commands for inspecting and using transparent huge pages on Linux
cmd: "# Transparent huge page mode: always / madvise / never\ncat /sys/kernel/mm/transparent_hugepage/enabled\n# Huge pages only for regions the program marks (when enabled is madvise)\nmadvise(addr, len, MADV_HUGEPAGE);\n# How much anonymous memory is using transparent huge pages now\ngrep AnonHugePages /proc/meminfo"
:::

So databases, the Java virtual machine and hypervisors often reserve huge pages, while desktop systems usually let transparent huge pages apply only when a program asks for them. There is another difficulty. A 2 MiB page needs 2 MiB of contiguous, aligned physical memory. On a long-running system, free memory breaks into small pieces. The kernel must then move other pages (memory compaction) before it can assemble one. This brings back the fragmentation problem of chapter 1.

The model counts only TLB and page-walk costs. It does not count cache misses or the time to zero pages on a fault. The sparse pattern is illustrative. Real systems mix huge and small pages. {.take}

## Page faults and demand paging {#ch7}

::: strings
toc: Page faults and demand paging
:::

An entry with P = 0 is not always an error. The page may not yet be allocated, or it may have been moved to disk. The CPU hands the fault to the operating system, which fills in the entry and lets the same instruction run again. The program notices nothing, except that this one access was slower, by a factor of several to several hundred thousand. {.law}

Food delivery starts only after you order. Calling <code>malloc</code> for a 1 GiB array returns at once, because Linux only records that this address range may be used. It gives no frames at all. A page is faulted in, allocated and zeroed on the first write to it. This is called **demand paging**. A fault that can be fixed by filling in an entry is a **minor fault**. It covers newly allocated pages, or file contents already in the page cache. A fault that needs a read from disk is a **major fault**.

::: diagram dg-fault keys=dg.fault
cap: Sequence of a major fault. Steps 1 to 6 are invisible to the program, which simply waits a long time for that one instruction. A minor fault has no steps 3 and 4.
aria: Diagram: the sequence of a page fault. The CPU finds P = 0 on access and raises a fault. The operating system locates the page on disk, reads it into an empty frame and updates the entry, and the CPU retries the instruction
cpu: CPU
os: Operating system
osS: OS
disk: Disk
s1: access; entry has P = 0
s2: page fault raised
s3: find the page on disk; issue a read
s4: read the data into an empty frame
s5: write the entry, P = 1
s6: retry the instruction
:::

The three kinds differ enormously. I measured a minor fault on the machine that wrote this page (Apple M6, macOS, 16 KiB pages). Writing one byte to each page of a newly mapped 1 GiB anonymous region took an average of {minorUs} µs per page. Several runs fell between 0.50 and 0.63 µs, and the first run was {minorHi} µs. A second pass over the same pages took {touchUs} µs per page. Major faults depend on the disk. A Samsung 990 PRO NVMe solid-state drive (its datasheet gives 22,000 random 4 KB reads per second at queue depth 1) takes about {nvmeUs} µs per fault. A 7,200 rpm hard disk (8.5 ms average seek, plus 4.16 ms for half a turn) takes about {hddMs} ms. For why storage is so slow, see chapter 8 of <a href='../what-a-drive-is-made-of/#ch8'>What a Drive Is Made Of</a>.

::: html ch7-html
th.kind: One…
th.time: takes about
th.x: equal to this many memory reads
th.src: Source of the figure
:::

::: lab ch7-model
model.title: Fault rate and effective access time
model.how: Effective access time = (1 − p) × memory access time + p × fault service time. This is the textbook formula (OSTEP chapter 21; Silberschatz's Operating System Concepts). p is the probability that any one access faults. The curve shows how many times slower than reading memory alone the access becomes. Both axes are logarithmic. Drag p, and change the kind of fault.
model.aria: Logarithmic line chart: how many times slower access becomes, against fault rate, for three kinds of fault
k.minor: minor fault
k.nvme: read from NVMe
k.hdd: read from a hard disk
ctl.kind: Each fault is a
ctl.p: Fault rate
read.tf: One fault
read.eat: Average per access
read.slow: Relative to memory alone
read.p10: Limit for a 10% slowdown
r.dram: one memory read
r.minor: minor fault
r.nvme: major fault, NVMe solid state
r.hdd: major fault, hard disk
src.dram: Chips and Cheese measurement of the Ryzen 9 9950X (August 2024)
src.minor: Measured on this machine, 15 November 2026; order of magnitude
src.nvme: Samsung 990 PRO datasheet: 22K IOPS at queue depth 1
src.hdd: Seagate Barracuda 7200.12 manual: 8.5 + 4.16 ms
pfmt: once every {v} accesses
cv.x: Fault rate (log)
cv.y: times slower (log)
say.ok: One access in {one} is a {kind}. On average each access takes {eat}, {slow} the time of a plain memory read, which is barely noticeable.
say.slow: One access in {one} is a {kind}. On average each access takes *{eat}*, {slow} the time of a plain memory read.
say.thrash: One access in {one} is a {kind}. On average each access takes *{eat}*, {slow} the time of a plain memory read. The machine spends almost all its time waiting for faults. This is called *thrashing*.
kind.minor: minor fault
kind.nvme: page to be read from NVMe
kind.hdd: page to be read from a hard disk
:::

At a fault rate of one in ten thousand, the average access takes {emSlow} times as long as a plain memory read when each fault is minor, {enSlow} times when it is a read from NVMe, and {ehSlow} times when it is a read from a hard disk. A hard disk needs a fault rate of one in a million to come back down to {eh6Slow} times. To keep the slowdown to 10%, a minor fault can occur at most once every {em10} accesses, an NVMe read once every {en10}, and a hard-disk read once every {eh10}. When memory is short, the pages just evicted are soon needed again. Major faults then follow one after another, and the machine looks stuck. This is called **thrashing**. In 1968 Denning introduced the **working set**: the pages a program is really using over a period of time. If the working set fits in memory, faults are few. If it does not fit, adding processors does not help.

The formula gives averages only. It leaves out queueing, the operating system reading several pages at once (read-ahead), and memory compressed in RAM (Linux zram, macOS's compressor), which make a swap-out much cheaper. The minor-fault figure was measured on one machine, and another system might differ by several times. {.take}

## Which page to evict {#ch8}

::: strings
toc: Which page to evict
:::

To make room for a new page, one page must be thrown out. The best one to evict is the one needed furthest in the future, but nobody knows the future. LRU guesses using 'least recently used'. The clock algorithm uses a single access bit and approximates LRU cheaply. {.law}

A desk holds only four books. To take another, you must put one away. Belady showed in 1966 that the best choice is to put away the book needed furthest ahead (OPT). But that requires knowing the future, so OPT is only a benchmark. The simplest rule, FIFO, puts away the book that came out first. LRU puts away the book that was least recently opened. It comes close to OPT, but it would need a timestamp on every access, and with billions of accesses a second the hardware cannot afford that. What the hardware can do is set the A bit from chapter 3 on each access. The **clock algorithm** arranges the pages in a circle, with a pointer sweeping round. If A = 1, it clears the bit to 0 and spares the page. When it meets A = 0, it evicts that page.

There is a counter-intuitive result. With FIFO, giving one more frame can cause more faults. Belady, Nelson and Shedler showed this in 1969 with the reference string 1 2 3 4 1 2 5 1 2 3 4 5.

::: lab ch8-model
model.title: Four algorithms, one reference string
model.how: Choose a reference string and a number of frames, then see how many faults FIFO, clock, LRU and OPT each cause. The curve shows the number of faults against the number of frames. The strip below shows, for each reference, whether the current algorithm hits (green) or faults (red). The 'locality' string is generated from a fixed seed, in three segments, each mostly cycling through four pages (**tuned parameter**).
model.aria: Line chart: number of faults for four replacement algorithms, against the number of frames
pol.clock: Clock
ctl.str: Reference string
str.belady: Belady's string
str.loop: Five-page loop
str.local: Locality
ctl.pol: Algorithm
ctl.f: Frames
trail.aria: Whether the current algorithm hits or faults on each reference
read.fifo: FIFO faults
read.clock: Clock faults
read.lru: LRU faults
read.opt: OPT faults (lower bound)
cv.x: Frames
cv.y: Faults
name.fifo: FIFO
name.clock: Clock
name.lru: LRU
name.opt: OPT
say.anomaly: {pol} with {f} frames: *{faults}* faults, more than the {prev} with {f1} frames. More memory produced more faults. This is Belady's anomaly.
say.cold: {pol} with {f} frames: {faults} faults, exactly the number of distinct pages in the string. Each page faults only on its first use.
say.n: {pol} with {f} frames: *{faults}* faults in {n} references.
:::

On Belady's string, FIFO faults {bf3} times with 3 frames, but {bf4} times with 4 frames. LRU gives {bl3} and {bl4}, and OPT needs only {bo3} with 3 frames. The clock algorithm gives {bc3} and {bc4} on this string too. It is essentially FIFO with one extra bit. LRU and OPT never show this anomaly, because they are **stack algorithms**: with n frames, the pages kept are always a subset of those kept with n + 1 frames (Mattson et al., 1970). On the five-page loop with 4 frames, LRU faults {lp4} times in {lpn} references, faulting every time, while OPT needs only {lpo}. With one more frame, LRU drops to {lp5}. One page short and the whole loop is lost. This is the same pattern as the loop in chapter 4 of <a href='../how-cpu-caches-work/#ch4'>the cache essay</a>.

Eviction has cheap and expensive cases. A page with D = 0 matches its copy on disk (program code, or an unchanged file page), so it can be dropped and read again if needed. A page with D = 1 must first be written back to disk or to swap. So the operating system prefers to evict clean pages first.

Real Linux is not a single clock. It approximates LRU with several lists and access bits, and it treats file pages and anonymous pages differently. The reference strings here are short, chosen so that each step can be seen. {.take}

## fork, copy-on-write and mapped files {#ch9}

::: strings
toc: fork, copy-on-write and mapped files
:::

After fork, parent and child each seem to have a full copy of memory. In fact they share the same frames at first, all marked read-only. The first write to a page copies that page at that moment. {.law}

Two people read one book together. Only when one of them wants to write in it do they photocopy that page. Unix creates processes with fork: the child is a copy of the parent, and it often calls exec at once to become another program, so the copied memory is thrown away straight away. **Copy-on-write** lets fork copy only the page tables, marking both sides' entries read-only and pointing them at the same frames. The first write to a page, by whichever side, raises the write-to-read-only page fault of chapter 3. Only then does the operating system copy that one page and give the writer a private, writable copy.

::: diagram dg-cow keys=dg.cow
cap: Copy-on-write: just after fork, both sides' entries point to the same frames, all read-only. The child writes page 2, which faults. The operating system copies that page, and the child's entry is changed to point to the new frame and made writable. The other pages stay shared.
aria: Diagram: copy-on-write. After fork, the parent's and child's entries point to the same read-only frames. When the child writes one page, that page is copied, and the child's entry points to the new writable frame
before: After fork
after: Child wrote page 2
parent: Parent
child: Child
frames: Frames
ro: read-only, shared
copy: new frame, writable
pg: Page {i}
:::

::: lab ch9-model
model.title: How much is copied after fork
model.how: The parent has {cowMiB} MiB, which is {cowN} pages of 4 KiB. After fork, the child writes some of these pages at random, and the parent writes some too, chosen at random from a fixed seed. Eager copying copies every page at fork time. Copy-on-write copies a page only when a shared page is first written. If the other side later writes the same page, that page now belongs to one process alone, so the operating system simply makes it writable again, with no copy. Linux does this for a page with a reference count of 1.
model.aria: Bar chart: how many pages are copied by eager copying and by copy-on-write
ctl.c: Pages written by the child
ctl.g: Pages written by the parent
read.eager: Eager copy: pages copied
read.cow: Copy-on-write: pages copied
read.faults: Copy-on-write: faults
read.mem: Memory in use by both (copy-on-write)
bar.eager: Eager copy at fork
bar.cow: Copy-on-write
say.none: Neither side writes (for example, fork followed straight away by exec): copy-on-write copies no pages at all, while eager copying would move {eager} pages.
say.some: Child writes {c}, parent writes {g}: copy-on-write copied *{copies}* pages with {faults} faults. Eager copying would copy {eager} pages.
:::

The child writes 10% of its pages and the parent writes none: copy-on-write copies {k10c} pages, against {cowN} for eager copying. If both sides write 10%, it copies {k1010c} pages with {k1010f} faults, and {k1010both} of those pages were written by both sides, where the second writer simply restores write access. The cost is one fault for each page copied. So when almost everything is written, copy-on-write ends up doing more work.

The same idea is applied to files. <code>mmap</code> maps a file into the address space. The entries point straight at frames in the kernel's page cache that hold the file's contents, so reading a file means reading memory. The first touch of a page faults and reads it in from disk. A shared library used by dozens of processes has one copy of its code pages in physical memory. That is the sharing described in chapter 1. With <code>MAP_PRIVATE</code>, a write triggers copy-on-write, and the change is not written back to the file.

The model counts pages only. It leaves out the time to copy each page, and the copying of the page tables themselves. The pages written are chosen uniformly at random. Real programs tend to write in concentrated areas of the heap and stack. {.take}

## Switching processes and the kernel: the cost of isolation {#ch10}

::: strings
toc: Switching processes and the kernel: the cost of isolation
:::

Each process has its own page tables, so switching processes means changing CR3. The old translations in the TLB must either be cleared entirely or tagged with the process's identity. Tagged entries make isolation almost free. Untagged ones mean every switch starts from a cold TLB. {.law}

The operating system switches between dozens or hundreds of processes every second. To switch to another process, it writes that process's page-table physical address into CR3. But the TLB still holds translations from the previous process, and the same virtual address points elsewhere in the new one, so keeping them would read the wrong memory. The old method is to clear the TLB when CR3 is written, keeping only the global pages marked with the G bit (the kernel's mappings). The newer method tags each entry. On x86, **PCID** is 12 bits wide, giving {pcidN} identifiers. Arm calls its equivalent ASID. The TLB uses only entries whose tag matches the current process, so nothing has to be cleared on a switch.

A further cost arises on multicore systems. When one core changes a mapping (freeing memory, copy-on-write, or moving a page), other cores' TLBs may still hold the old translation. Hardware does not synchronise TLBs automatically. The operating system sends inter-processor interrupts to those cores, so that each one clears its entry, and it waits for all of them to reply before continuing. This is called a **TLB shootdown**. The more cores, the more there are to wait for.

::: lab ch10-model
model.title: How much of the TLB survives a process switch
model.how: K processes take turns. Each runs {ctxQ} accesses per turn, reading at random across its own {ctxWs} pages. Every S accesses it makes a system call, and the kernel touches {ctxK} of its own pages. The TLB has {ctxEntries} entries and is fully associative with LRU replacement. These numbers are **tuned parameters**. 'Flush' clears the user entries on every switch, and the kernel's global pages stay. 'Tag' clears nothing. With KPTI on, CR3 is written on each entry to the kernel and again on each exit. With tags, user and kernel each use their own tag. Without tags, every CR3 write clears the whole TLB.
model.aria: Bar chart: TLB misses per 1,000 accesses under four settings, with the current setting highlighted
ctl.k: Processes taking turns
ctl.mode: On a switch
m.tagged: Tag (PCID)
m.flush: Flush
ctl.kpti: KPTI on
ctl.s: System-call interval
read.miss: TLB misses per 1,000 accesses
read.cr3: CR3 writes per 1,000 accesses
read.cyc: Cycles spent writing CR3 (per 1,000 accesses)
sfmt: every {v} accesses
bar.tag: Tag
bar.flush: Flush
bar.tagK: Tag + KPTI
bar.flushK: Flush + KPTI
say.tag: {K} processes, tagged: *{miss}* TLB misses per 1,000 accesses. When the pages of a few processes fit, switching costs almost nothing. When they do not fit, tags cannot help.
say.flush: {K} processes, flushed on every switch: *{miss}* misses per 1,000 accesses. Each process must re-walk its own pages each time it gets the processor.
say.kptiPcid: KPTI with tags: {cr3} CR3 writes per 1,000 accesses (about {cyc}). TLB misses are *{miss}*. The cost of isolation is mainly the CR3 writes themselves.
say.kptiFlush: KPTI without tags: the TLB is flushed on every entry to and exit from the kernel. Misses are *{miss}* per 1,000 accesses, and the more system calls there are, the worse it gets.
:::

With 4 processes and one system call per 1,000 accesses: flushing on every switch gives {ctFlush} misses per 1,000 accesses, and tagging gives {ctTag}. With 6 processes, the working sets together just exceed the TLB's capacity, and even tagged it has {ct6} misses. With 8 processes it is {ct8}, the same as flushing. Tags stop the TLB from forgetting, but they do not make a working set fit that does not fit.

The **Meltdown** attack, made public in 2018, added a cost to isolation. The kernel's pages had been mapped in every process's page table, with only the U/S bit set to 0, so a user-mode read faulted. But the CPU speculatively read the data before checking permissions, leaving traces in the cache. An attacker could time those traces and read kernel memory bit by bit. The mechanism is covered in <a href='../how-a-cpu-guesses-ahead/#ch10'>Chapter 10 of How a CPU Guesses Ahead</a>. Linux's fix is called **KPTI** (kernel page-table isolation). User mode uses a page table that contains almost none of the kernel, and CR3 is switched on each entry to and exit from the kernel. Linux's documentation says a CR3 write costs 'roughly a hundred cycles', and it happens on every entry and exit. Without PCID, every write flushes the TLB. In the model, with 4 processes and KPTI on, the tagged case has {ckPcid} misses and {ckCr3} CR3 writes per 1,000 accesses, about {ckCyc}. Without tags there are {ckFlush} misses.

The model's process count, working sets, system-call interval and kernel page count are all tuned parameters. It leaves out the time of TLB shootdowns, and the other costs KPTI imposes on page tables and memory. The total cost depends on how often a program enters and leaves the kernel, which this page does not measure; what one crossing itself costs is in chapter 3 of <a href='../how-the-os-talks-to-hardware/#ch3'>How the OS Talks to Hardware</a>. {.take}

## Two-dimensional page tables in virtual machines {#ch11}

::: strings
toc: Two-dimensional page tables in virtual machines
:::

A 'physical address' in a virtual machine is also fake. Every address in the guest's page tables, including the final data address, must be walked again through the host's page tables. Four levels nested in four levels can mean up to 24 memory reads for one TLB miss. {.law}

Like a letter sent to a forwarding address, the address on the envelope must itself be looked up to find the real destination. An operating system in a virtual machine believes it manages physical memory, but its 'physical addresses' (guest-physical addresses) must be translated again by the hypervisor. Early systems used **shadow page tables**. The hypervisor kept, for each guest process, a page table that translated straight to real addresses, and every change the guest made to its page tables meant the hypervisor had to step in. Later, AMD and Intel both added **nested paging** in hardware (AMD calls it NPT, Intel calls it EPT), and the hardware walks the two sets of tables itself. Bhargava and colleagues at AMD calculated in a 2008 paper that with n levels in the guest and m in the host, a two-dimensional walk reads nm + n + m page-table entries.

::: diagram dg-nested keys=dg.nested
cap: A four-on-four two-dimensional walk. Each column is a guest address (four tables and the final data). It first finds the real location through the host's four levels (red, 4 × 5 = 20 reads), then reads the guest's entry (blue, 4 reads). The total is 24 reads, not counting the data itself (gold).
aria: Diagram: the grid of a two-dimensional walk. Four guest table columns plus a data column. Each column first reads four host table entries, then the guest entry, 24 reads in all
g: Guest {i}
data: Data
h: Host {i}
gl: Guest entry
total: 4 × 4 + 4 + 4 = 24 reads
:::

::: lab ch11-model
model.title: Counting a two-dimensional walk
model.how: Choose how many levels the guest and the host each use (with 2 MiB huge pages, one level fewer). The grid below shows one two-dimensional walk. Each column is one guest level, and the last column is the data address itself. Each column first needs the host's levels to find its real location (the host rows), and then reads the guest's entry (the bottom row). Red marks reads of host entries, blue marks reads of guest entries, and gold marks the final data.
ctl.g: Guest
o.4: Four-level
o.5: Five-level
o.3: 2 MiB huge pages (three levels)
ctl.h: Host
o.0: Not virtualised
read.refs: Entries read in one miss, at most
read.native: Without virtualisation
read.x: Relative to native
grid.g: Guest level {i}
grid.data: Data
grid.h: Host {i}
grid.gl: Guest entry
say.native: Without virtualisation, the guest's address is the real address, and one walk takes {n} reads.
say.n: Guest {n} levels, host {m} levels: {n} × {m} + {n} + {m} = *{refs}* reads, which is {x} the native walk.
:::

Four levels on four is {n44} reads, which is {n44x} times the four reads of a native walk. Five on five is {n55} reads. A guest using 2 MiB pages, with a four-level host, needs {n43} reads, and with huge pages on both sides it is {n33}. So hypervisors are especially keen to back guest memory with huge pages. AMD's documentation notes one detail: when the guest uses huge pages but the host uses small ones, Zen 5 must enter the TLB at the small size (called page smashing), and the benefit of huge pages is reduced. The TLB and walk caches of chapters 4 to 6 matter even more here. In the paper, caching the entries of a two-dimensional walk improved the guest's performance by 15% to 38%. That figure is from the paper's abstract, and this page has not recalculated it.

The same idea applies to devices. Network cards and solid-state drives read and write memory directly by DMA (see chapter 7 of <a href='../how-pcie-works/#ch7'>Why PCIe Keeps Doubling</a>). The addresses they issue are first translated by the **IOMMU**, which uses a set of page tables for the device: a device can reach only the pages the driver has mapped (how a driver maps them: chapter 8 of <a href='../how-the-os-talks-to-hardware/#ch8'>How the OS Talks to Hardware</a>). For what it blocks, and what it still lets through, see chapter 8 of <a href='../how-thunderbolt-works/#ch8'>How Thunderbolt Works</a>.

This counts only the worst-case number of reads. Real misses are helped by walk caches and the TLB, so they take far fewer reads than this. The model also omits the cost of a guest's own page faults that exit to the hypervisor. {.take}

## The frontier (November 2026) {#ch12}

::: strings
toc: The frontier (November 2026)
:::

Page-table arithmetic has not changed in thirty years. What has changed is page sizes and kinds of memory: longer addresses, larger pages, and memory on CXL that sits a notch slower than local memory. {.law}

Below are three kinds of claim: principles that are settled, things that have been built (by whom, and when), and statements from interested parties. Each has its date, and the sources are listed in BRIEF.md.

### Settled {#h.est .sub3}

- x86-64 four-level paging translates a {va4}-bit address, and five-level paging a {va5}-bit one. The physical address is up to {pa} bits (Intel's Software Developer's Manual, volume 3A, September 2026 edition, chapter 5). {#e1}
- Arm's 64-bit architecture has 4 KiB, 16 KiB and 64 KiB pages (called the 'translation granule'). Linux's arm64 documentation says that 4 KiB pages use three or four table levels, giving {arm4a}-bit or 48-bit addresses. 64 KiB pages use two levels, {arm64a} bits, and up to {arm64b} bits where the hardware supports it. In the kernel configuration, {arm16}-bit addresses are allowed only with 16 KiB pages. {#e2}
- The nm + n + m of a two-dimensional walk (Bhargava et al., ASPLOS 2008): four levels on four gives {n44} reads, and five on five gives {n55} reads. {#e3}

### Built {#h.demo .sub3}

- Linux: the x86 commit that made five-level paging support unconditional was committed to the x86 maintainers' tree on 17 May 2025 and shipped in Linux {lx5rel} (released 27 July 2025), removing the build option to disable it. The discussion notes that openSUSE, Ubuntu, Fedora and RHEL kernel configurations had enabled it long before. It is used only when the processor supports it. {#d1}
- Apple: on the machine that wrote this page (Apple M6), <code>sysctl hw.pagesize</code> returns 16384, which is a {apPage} KiB page size (read 15 November 2026). {#d2}
- Android: from Android {anVer} onward, the open-source Android system supports devices with 16 KB pages. Google's developer documentation requires apps targeting Android 15 and above to support 16 KB pages on 64-bit devices. {#d3}
- Memory on CXL: Linux treats it as a more distant memory node. The kernel documentation says that when <code>/sys/kernel/mm/numa/demotion_enabled</code> is on, reclaim prefers to demote cold pages to a more distant node while that node has room, rather than swap them to disk or to compressed swap (zswap) as it does by default. The next node is chosen by performance data reported by the firmware (HMAT or CDAT). This is a new layer in the paging of chapters 7 and 8. {#d4}

### Claims {#h.claim .sub3}

- Google says, in its own preliminary tests (developer documentation, read November 2026), that devices with 16 KB pages use slightly more memory on average. But under memory pressure, apps launch {anLaunch}% faster (some up to {anMax}%), use {anPower}% less power on launch, camera warm starts are {anCamH}% faster and cold starts {anCamC}% faster, and boot is {anBoot}% faster (about {anBootMs} ms). It adds that 'results on real devices may differ'. {#c1}
- Google has announced that from 1 February 2027, app updates that do not support 16 KB pages cannot be published on Google Play. {#c2}

The facts on this page will go out of date; the date is given after each one. I have not listed when each processor maker began supporting five-level paging, because I did not find the vendors' original documentation. {.take}

## Closing: three questions to ask when a program is slow {#ch13}

::: strings
toc: Closing: three questions to ask when a program is slow
:::

Address translation costs almost nothing most of the time. It becomes expensive only in three cases: the pages touched exceed the TLB's reach, a fault must go to disk, or the translation is nested two layers deep. {.law}

{.plain .qs}
1. **How many pages is the working set?** Compare it with the TLB reach: entries × page size (Zen 5's L2 reaches {reachL2} MiB, and with 2 MiB pages, {reachL2h} GiB). Random access to a data structure much larger than that may read memory several extra times per access. Try huge pages, or make the access pattern more concentrated (chapters 4 to 6). On Linux, you can count the misses with <code>perf stat -e dTLB-load-misses</code>. {#q1}
2. **Which kind of fault is it?** A minor fault costs about a microsecond, and a major fault tens of microseconds to a dozen milliseconds (chapter 7). GNU's <code>/usr/bin/time -v</code> lists the counts of the two kinds separately. Many major faults mean that memory is short, or that the file is not in the page cache. {#q2}
3. **How many layers of translation are there?** Inside a virtual machine, one TLB miss may read up to {n44} table entries (chapter 11). When process switches and system calls are frequent, check whether PCID is in use (chapter 10). {#q3}

Back to the opening question: every program believes it has memory to itself, starting at 0, and the CPU translates every access. Why is that not slow? Because *most accesses finish in the TLB in one step*. Hundreds of accesses within a page share one translation, and a TLB of a few thousand entries covers from a dozen or so MiB to several GiB. On a miss, the hardware walks the tables itself. The upper-level entries are usually in the walk cache or the data cache, so often only one more read is needed. The real cost arises only when the working set exceeds the TLB's reach, when a fault must go to disk, or when a virtual machine adds a second layer. This translation layer provides isolation, freedom to move, an address space larger than memory, and sharing. {#sum .sum tag=div}

Read on: <a href='../how-cpu-caches-work/'>How a CPU's Three Levels of Cache Work</a> covers the three cache levels beside the TLB. <a href='../why-compute-waits-for-memory/'>Why Compute Waits for Memory</a> covers the whole ladder of latencies. <a href='../what-a-drive-is-made-of/'>What a Drive Is Made Of</a> covers the disk that a fault goes to. <a href='../how-a-cpu-guesses-ahead/'>How a CPU Guesses Ahead</a> covers how CPUs guess ahead (the origin of Meltdown), and <a href='../how-cores-share-memory/'>How Cores Share Memory</a> covers how several cores agree on the order of reads and writes. {#links style="margin-top:2em"}

::: footer
An AI (Claude) wrote this page. It is the fifth essay in the computer architecture series. The models are small versions of real mechanisms. Values marked 'tuned parameters' were chosen so that the models can be computed.

Main sources: Intel, Intel 64 and IA-32 Architectures Software Developer's Manual, volume 3A (253668-093US, September 2026), chapter 5; AMD, Software Optimization Guide for the AMD Zen 5 Microarchitecture (58455 rev 1.00, August 2024), §2.6–2.7; Linux kernel documentation (x86_64 five-level paging, page-table isolation, transparent huge pages, arm64 memory layout, CXL reclaim) and arch/arm64/Kconfig; Bhargava, Serebrin, Spadini and Manne, 'Accelerating Two-Dimensional Page Walks for Virtualized Systems' (ASPLOS 2008); Arpaci-Dusseau, Operating Systems: Three Easy Pieces, chapters 13–23; Belady (1966); Belady, Nelson and Shedler (1969); Mattson et al. (1970); Denning (1968); Android developer documentation, 'Support 16 KB page sizes'; meltdownattack.com. Storage figures come from the Samsung 990 PRO datasheet and the Seagate Barracuda 7200.12 manual, as used in What a Drive Is Made Of. Unless noted, all sources were opened on 15 November 2026.

Every link and date is listed in BRIEF.md. This page explains mechanisms only. It does not judge products.
:::
