---
lang: en
title: How an Encrypted Local Image Gets Decoded · An Interactive Essay
desc: Starting from an unreadable .dat file on disk, trace hybrid encryption containers, XOR involution, AES-ECB vs CBC fingerprints, known-plaintext verification, ephemeral memory windows, ARM64 calling conventions, ADRP addressing, and libc++ std::string layout. Eight interactive models from a redacted real-world debugging session.
---

::: strings
nav.back: ← Knowledge Index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.b: {v} B
u.ms: {v} ms
u.s: {v} s
u.pct: {v}%
u.mb: {v} MB
u.m: {v}M
u.bits: {v} bits
:::

# How an Encrypted Local Image Gets Decoded {#hero}

::: strings
kicker: Computing · Systems & Security · An Interactive Essay
:::

The full image sits right there on disk, yet renaming it to `.jpg` refuses to open.<br>Starting from raw bytes, how do you deduce its encryption layout and locate the real key? {.sub}

Many desktop clients encrypt cached chat images into local `.dat` files. Without source code or documentation—only the encrypted files on disk and a running client—how can you reliably restore them into standard images? This essay walks through a real-world debugging path: **deducing container layout and block modes directly from ciphertext bytes, understanding why process memory scanning misses a 1-millisecond key lifetime, and finally using ARM64 PC-relative addressing and C++ runtime memory layout to capture the key cleanly at a single function return.** {.lead}

Everything here is fully redacted with no personal keys, accounts, or private paths. Each chapter focuses on a general systems or cryptography principle with a hands-on model. Written by Antigravity (Gemini 4 Neon) from a real debugging session; every number in the prose is computed by the page's model scripts. {.note}

## Why Renaming Fails: Hybrid Encrypted Containers {#ch1}

::: strings
toc: Hybrid Encrypted Containers
:::

Modern clients rarely encrypt an entire image with an expensive block cipher; instead they lock the file header with AES and mask the rest with a lightweight byte operation. {.law}

Inspecting a V2 local `.dat` image reveals a consistent 15-byte header: a 6-byte magic signature `07 08 56 32 08 07` (embedding ASCII `V2`), two 4-byte little-endian unsigned integers giving the **AES plaintext length** (typically `1024` bytes) and the **XOR tail length**, plus a 1-byte flag.

Comparing a `{=ch1.plain}`-byte plaintext PNG with its corresponding `.dat` shows the encrypted file is `{=ch1.dat}` bytes—an overhead of exactly `{=ch1.diff}` bytes. That gap is not random: 15 bytes come from the container header, and 16 bytes come from **PKCS#7 padding**. When the plaintext length (`1024`) is already a multiple of the 16-byte AES block size, PKCS#7 appends a full extra block of sixteen `0x10` bytes, making the AES ciphertext segment `{=ch1.aesPad}` bytes long while the remaining `{=ch1.xorBytes}` bytes use single-byte XOR.

::: diagram dg-layout keys=dg.layout
cap: Fig 1. Four-segment layout of a V2 hybrid encrypted container: 15-byte header, AES ciphertext of the first 1024 bytes, a 16-byte PKCS#7 padding block, and the XOR-masked tail.
aria: Diagram: byte offset layout of a V2 hybrid encrypted .dat container
h: 15B Header
a: AES Cipher (1024B)
p: Pad Block (16B)
x: XOR Tail
h2: Magic + lengths
a2: Locks image header
p2: 16 × 0x10 encrypted
x2: Fast byte-wise XOR
:::

::: lab ch1-model
model.title: Inspect V2 Container Byte Offsets
model.how: Drag the plaintext size and AES coverage length to see how PKCS#7 padding is computed and where each segment starts and ends in the .dat file.
ctl.plain: Plaintext size
ctl.aes: AES-covered bytes
read.dat: Total .dat size
read.aesPad: AES segment (with pad)
read.xor: XOR tail length
read.diff: Total overhead (hdr + pad)
say: Out of {plain} plaintext bytes, the first {aes} bytes plus {pad} bytes of PKCS#7 padding become <em>{aesPad} bytes</em> of AES ciphertext (offsets 15..{aesEnd}); the remaining {xor} bytes are XOR-masked, adding <em>{diff} bytes</em> in total.
:::

Locking the first 1024 bytes—which hold the image magic number, dimensions, color tables, and Huffman tables—prevents any standard viewer from opening the file while keeping encryption overhead near zero on multi-megabyte images. {.take}

## XOR Involution: Recovering the Tail Key in Two Bytes {#ch2}

::: strings
toc: XOR Involution
:::

Single-byte XOR is its own inverse: applying it twice cancels out. Any known fixed trailer bytes in an image format reveal the XOR key immediately. {.law}

Exclusive-OR (`⊕`) obeys two simple identities: any byte XORed with itself is `0` ($K \oplus K = 0$), and any byte XORed with `0` is unchanged ($P \oplus 0 = P$). If encryption computes $C = P \oplus K$, then XORing the ciphertext byte with its known plaintext immediately isolates the key: $C \oplus P = (P \oplus K) \oplus P = K$.

Standard image formats end with fixed signatures: JPEG always finishes with `FF D9`, and PNG always ends with the `IEND` chunk `49 45 4E 44 AE 42 60 82`. XORing the last two bytes of several thumbnail `.dat` files with `FF` and `D9` yields the exact same byte on both positions—`{=ch2.keyHex}`—and checking all 98 KB of a known PNG tail confirms every byte shares that single key.

::: diagram dg-xor keys=dg.xor
cap: Fig 2. XORing the fixed JPEG trailer FF D9 with the last two bytes of the .dat file immediately yields the single-byte key 0x19.
aria: Diagram: recovering XOR key 0x19 from known JPEG trailer FF D9 and ciphertext E6 C0
p: Known plain trailer
c: Encrypted .dat tail
k: Recovered key
rule: Involution: C ⊕ P = (P ⊕ K) ⊕ P = K
:::

::: lab ch2-model
model.title: Recover an XOR Key from Known Trailer Bytes
model.how: Switch the image format and drag the hidden single-byte key to see how ciphertext bytes change and how XORing with the known trailer recovers the exact key.
ctl.fmt: Image format
ctl.key: Single-byte key K
read.plain: Known plain trailer
read.cipher: Encrypted .dat tail
read.derived: Recovered C ⊕ P
read.restored: Restored trailer
say: XORing the known {fmt} trailer with the ciphertext yields <em>{key}</em> at every byte; re-applying it restores the entire tail losslessly.
:::

Single-byte XOR provides obfuscation rather than cryptographic strength. All real security in this hybrid container rests on the 1040-byte AES block segment at the front. {.take}

## Why You Can Spot ECB vs CBC at a Glance {#ch3}

::: strings
toc: Spotting ECB vs CBC
:::

ECB encrypts each 16-byte block independently: whenever two completely different images share an identical plaintext block, their ciphertext blocks match byte for byte. {.law}

AES itself maps 16 bytes to 16 bytes; encrypting longer data requires a **block cipher mode**. The two classic choices are **ECB (Electronic Codebook)** and **CBC (Cipher Block Chaining)**:
- Under **ECB**, each block enters `AES(K)` independently. When two different images both have `aes_size = 1024`, their 65th block is always sixteen `0x10` bytes, so their 65th ciphertext block is **byte-for-byte identical**. {#m1}
- Under **CBC**, each plaintext block is XORed with the **previous ciphertext block** before encryption. A single differing byte earlier in the image avalanches forward, making the 65th ciphertext blocks completely unrelated. {#m2}

Comparing offsets `1039..1055` across three unrelated JPEG thumbnails and a full PNG showed the exact same 16-byte ciphertext in all four files. Without reading a single line of code, that proves the client uses **AES-ECB** with one shared key across images.

::: diagram dg-ecb keys=dg.ecb
cap: Fig 3. Encrypting the same 16 × 0x10 padding block: ECB produces identical ciphertext across all images, whereas CBC mixes in the prior ciphertext block so every image differs.
aria: Diagram: comparing AES-ECB and AES-CBC on the trailing PKCS#7 padding block
t1: ECB Mode: Independent Blocks
same: Identical Block 65 ciphertext
t2: CBC Mode: Chained Feedback
diff: Different Block 65 ciphertext
:::

::: lab ch3-model
model.title: Compare ECB and CBC Ciphertext Propagation
model.how: Toggle between ECB and CBC and change whether the two images share their first block, watching whether the trailing padding block (block 4) collides.
ctl.mode: Block mode
ctl.img: First block pair
opt.diff: Image A (JPEG) vs Image B (PNG)
opt.same: Two identical JPEG headers
read.padA: Image A pad ciphertext
read.padB: Image B pad ciphertext
read.match: Trailing block match
yes: Identical
no: Different
say.ecb: Under <em>ECB</em>, even though Image A and Image B differ, their trailing padding blocks share the same plaintext and produce identical ciphertext—a dead giveaway for ECB.
say.cbc: Under <em>CBC</em>, differences in earlier blocks chain forward through XOR, making the trailing padding ciphertexts completely unrelated.
:::

Security guides warn against ECB on structured files precisely because repeating plaintext blocks leak directly into repeating ciphertext blocks. {.take}

## Known-Plaintext Verification: Pushing False Positives to 2⁻¹²⁸ {#ch4}

::: strings
toc: Known-Plaintext Verification
:::

Having both a plaintext image and its ciphertext cannot algebraically invert AES, but it gives you a zero-assumption, zero-false-positive oracle for testing candidate keys. {.law}

Opening one image via the client's "Open With Preview" writes the decrypted plaintext file to a temporary folder. Pairing that file with its `.dat` gives an exact 16-byte plaintext block `PT[0:16]` (such as a PNG header `89 50 4E 47 ...`) and its matching 16-byte ciphertext `CT[15:31]`.

AES is built to resist **known-plaintext attacks**—even thousands of `(PT, CT)` pairs will not let you solve for `K`. Yet as a verification oracle during memory scanning or instrumentation, an exact pair is decisive:
- Checking only a 3-byte JPEG magic number `FF D8 FF` (24 bits) across 550 million candidate keys is expected to trigger **{=ch4.fp3} false positives**; {#o1}
- Assuming the 65th block must decrypt to `0x10 × 16` risks rejecting the true key if the client uses zero padding; {#o2}
- Checking full 16-byte equality (128 bits) across 550 million candidates has an expected false-positive count around **10<sup>{=ch4.fp16Exp}</sup>**—effectively zero—with no padding assumptions at all. {#o3}

::: lab ch4-model
model.title: Verification Bit-Width and False-Positive Rate
model.how: Switch between three verification strategies and drag the number of scanned candidate keys (in millions) to compare expected false positives and padding-assumption risk.
ctl.mode: Check strategy
ctl.cand: Candidate keys tested
opt.m3: 3B magic header only
opt.mp: Magic + assumed 0x10 pad
opt.e16: Exact 16B plaintext pair
read.bits: Effective check bits
read.fp: Expected false positives
read.padRisk: Padding mismatch risk
risk.hi: Yes (drops real key if not PKCS#7)
risk.no: None (zero padding assumption)
say.magic3: A 24-bit magic check over {cand}M candidates is expected to hit <em>{fp} false positives</em>, requiring extra cross-checks.
say.magicPad: Adding a padding-block check drives false positives down to <em>{fp}</em>, but any wrong padding assumption silently discards the real key.
say.exact16: An exact 16-byte known-plaintext pair enforces 128 bits of verification—expected false positives are just <em>{fp}</em>, with zero risk of rejecting the real key.
:::

Replacing guesses with an exact ground-truth pair eliminates ambiguity: once a full memory scan using an exact pair returns nothing, you know the issue is not a misguessed format. {.take}

## Why Memory Scanning Misses a 1-Millisecond Window {#ch5}

::: strings
toc: Ephemeral Memory Windows
:::

When a key lives in RAM for less than a millisecond during image decoding while a memory sweep takes seconds, polling is statistically bound to miss it. {.law}

On macOS, once a binary's restricted signature is removed, a privileged scanner can call Mach kernel APIs—`task_for_pid`, `mach_vm_region`, and `mach_vm_read_overwrite`—to iterate over every readable virtual memory region and inspect its bytes. This works reliably for **long-lived** database keys that stay resident in heap structures.

Yet scanning over 2.3 GB of memory and testing 550 million candidates found nothing, and continuous watch-mode polling missed too. The arithmetic explains why: scanning 1.35 GB takes roughly **{=ch5.scanSec} s**, while decoding a 100 KB image takes under **1 ms**, after which the temporary buffer is freed or overwritten. A single random pass overlaps that 1 ms window with probability **{=ch5.pSinglePct}**; even 30 back-to-back passes only reach **{=ch5.p30Pct}**.

::: diagram dg-window keys=dg.window
cap: Fig 4. A three-order-of-magnitude mismatch: one memory scan pass takes ~3,000 ms, while the key buffer exists for under 1 ms.
aria: Diagram: comparing a 3000 ms memory scan sweep against a 1 ms key residency window
scan: One full memory scan pass
key: Key residency window in RAM
pulse: < 1 ms (freed right after decode)
:::

::: lab ch5-model
model.title: Simulate Polling Hit Probability
model.how: Adjust scanned process memory, ephemeral key lifetime, and polling rounds to see how cumulative hit probability behaves.
ctl.ram: Scanned memory
ctl.life: Key lifetime in RAM
ctl.rounds: Polling rounds
cv.aria: Chart: cumulative probability of overlapping an ephemeral key window across polling rounds
read.scan: Time per scan pass
read.p1: Single-pass hit rate
read.pn: Cumulative hit rate (N rounds)
say: At 450 MB/s effective scan throughput, sweeping {ram} MB takes <em>{scan} s</em>; against a {life} ms window, {rounds} passes yield only <em>{pn}</em> cumulative probability.
:::

When two timescales differ by three orders of magnitude, polling harder will not fix it. You have to stop searching after the fact and intercept the exact moment the function runs. {.take}

## Calling Conventions & Breakpoints: Reading Registers Directly {#ch6}

::: strings
toc: Calling Conventions & Breakpoints
:::

On ARM64, the first eight function arguments live in registers `x0`–`x7`. A single read-only breakpoint at a crypto API entry immediately reveals who is decrypting what. {.law}

Listing undefined imported symbols (`nm -u`) showed the client imports macOS's system `libcommonCrypto.dylib` functions `CCCrypt` and `CCCryptorCreate`. Under the **ARM64 calling convention (AAPCS64)**, at the first instruction of `CCCryptorCreate(op, alg, options, key, keyLength, ...)`:
- `x0` holds the operation (`1` = decrypt) {#r1}
- `x1` holds the algorithm (`0` = AES) {#r2}
- `x2` holds the mode options (`0x0` = CBC, `0x2` = ECB) {#r3}
- `x3` points to the key buffer, and `x4` holds the key length in bytes {#r4}

Attaching a non-blocking `lldb` script breakpoint and opening an image triggered 33 hits—every single one showing `opts=0x0` (CBC) and `key_len=32` (256-bit). That was SQLCipher 4 decrypting database pages, proving **image decryption does not call system `CCCrypt` at all; it runs code compiled directly inside the client's own library.**

::: lab ch6-model
model.title: Read ARM64 Registers at a Breakpoint
model.how: Toggle between the system CCCrypt breakpoint (database) and the internal GetAesKey breakpoint (image) to see how register values separate the two crypto paths.
ctl.call: Breakpoint target
opt.db: System CCCrypt (database page)
opt.img: Internal GetAesKey (V2 image)
read.fn: Function hit
read.res: Check against image pair
ok: 16/16 exact match
no: No match (256-bit DB CBC)
say.db: <code>x2=0x0</code> (CBC) and <code>x4=32</code> (256-bit key) immediately rule out image decryption—this is the database engine reading encrypted pages.
say.img: <code>x0=2</code> selects V2; reading the 32-byte object at <code>x8/x19</code> and taking its first 16 bytes for AES-128-ECB gives a <em>100% match</em> against the plaintext pair.
:::

Elimination is just as valuable as a hit: thirty seconds of breakpoint telemetry drew a clean boundary between the OS crypto library and the client's internal code. {.take}

## Finding One Function in 160 MB of Machine Code: ADRP + LDR & ASLR {#ch7}

::: strings
toc: ADRP Addressing & ASLR
:::

Fixed-width 32-bit ARM64 instructions cannot embed a 64-bit address, so they pair a 4 KB page offset with a 12-bit in-page offset—letting a short script trace string references straight to the function. {.law}

A macOS Universal (Fat) Mach-O bundles both `x86_64` and `arm64` slices in one file. Searching the 160 MB `arm64` slice for the V2 magic prefix `\x07\x08V2` landed directly beside a cluster of internal strings: `GetDecryptInfo`, `GetXorKey`, and `GetAesKey`.

Once you know a string's slice offset (e.g., `{=ch7.target}`), how do you find the code that loads it? ARM64 uses PC-relative two-instruction addressing:
1. **`ADRP`** aligns the current instruction address `PC` down to a 4 KB page boundary and adds a signed 21-bit page delta to reach the target's 4 KB page; {#a1}
2. **`ADD` or `LDR`** then adds the remaining 12-bit offset (`0x000..0xfff`) inside that page. {#a2}

A 20-line script scanning all `ADRP` instructions across the code section pinpointed the reference to `GetAesKey` at `{=ch7.pc}` (a delta of `{=ch7.delta}` pages plus `{=ch7.off}`). At runtime, **ASLR (Address Space Layout Randomization)** shifts the library's load base, but the relative offset inside the library never changes: adding the live load base to the fixed offset lands the breakpoint on the exact instruction.

::: diagram dg-adrp keys=dg.adrp
cap: Fig 5. ARM64 combines ADRP (4 KB page base) and LDR (12-bit page offset) to address read-only strings; adding the live ASLR load base yields the runtime memory address.
aria: Diagram: ARM64 ADRP and LDR PC-relative addressing combined with ASLR load base
s1: Signed 21-bit page delta
s2: 12-bit in-page offset
s3: Relative slice offset
aslr: Runtime address = live ASLR load base + fixed slice offset
:::

::: lab ch7-model
model.title: Compute ADRP + LDR and ASLR Offsets
model.how: Drag the instruction page, target string page, and runtime ASLR slide to see the 4 KB page delta, in-page offset, and final runtime breakpoint address update live.
ctl.pc: Instruction address (MB)
ctl.tgt: String address (MB)
ctl.slide: ASLR slide (MB)
read.delta: ADRP page delta (4 KB pages)
read.off: LDR in-page offset
read.base: Library load base
read.rt: Runtime virtual address
say: Reaching <code>{tgt}</code> from <code>{pc}</code> takes an ADRP delta of <em>{delta} 4 KB pages</em> plus LDR offset <code>{off}</code>; with ASLR applied, the runtime address lands at <code>{rt}</code>.
:::

You do not need a heavy GUI decompiler to find one function: once you understand fixed-width instruction encoding, a handful of lines of Python performs surgical cross-referencing across hundreds of megabytes. {.take}

## Reading a C++ Return Value: sret & std::string Layout {#ch8}

::: strings
toc: sret & std::string Layout
:::

C++ objects larger than 16 bytes cannot fit in return registers and are written through an implicit pointer in `x8`; checking the top bit of a 24-byte `std::string` tells you whether to read inline or follow a heap pointer. {.law}

Disassembling a few dozen instructions inside `GetAesKey` showed the prologue saving `x8` into `x19` before calling an internal helper to populate the return value. Under the ARM64 ABI, **by-value return objects larger than 16 bytes** (such as a 24-byte `std::string`) are allocated by the caller, whose address is passed in `x8` (`sret`, structure return).

Setting a breakpoint at the instruction right after that helper returns and reading 24 bytes from `x19` requires decoding `libc++`'s `std::string` layout via the top bit (`0x80`) of `byte[23]`:
- **Bit 7 = `0` (SSO, Short String Optimization)**: strings up to 22 bytes live inline in `bytes[0..22]`, with `byte[23]` storing the length and zero heap allocation; {#s1}
- **Bit 7 = `1` (Heap allocation)**: strings of 23 bytes or more store an 8-byte heap pointer `ptr`, an 8-byte `size`, and an 8-byte capacity word with the flag bit set. {#s2}

At the breakpoint, `byte[23] & 0x80` was set with `size = 32`. Following `ptr` yielded 32 bytes; passing the first 16 bytes to AES-128-ECB decrypted our test `.dat` to match all 16 bytes of the PNG header. In production integration, some medium images decrypted to `77 78 67 66` (ASCII `wxgf`, a proprietary codec browsers cannot render), so the pipeline checks standard image magic bytes (JPEG/PNG/GIF/WEBP) in **HD → medium → thumbnail** order, automatically falling back to standard thumbnails whenever `wxgf` appears.

::: diagram dg-stdstr keys=dg.stdstr
cap: Fig 6. Two layouts of a 24-byte libc++ std::string on 64-bit macOS: inline SSO up to 22 bytes, or a heap pointer + size + capacity at 23 bytes and above.
aria: Diagram: libc++ 24-byte std::string SSO inline layout versus heap pointer layout
sso: Short string (≤ 22 bytes · inline SSO)
heap: Long string (≥ 23 bytes · heap pointer)
:::

::: lab ch8-model
model.title: Inspect a 24-Byte std::string Memory Layout
model.how: Type any ASCII text (try shortening it to ≤ 22 characters or extending it to ≥ 23 characters) to watch the 24-byte layout switch between inline SSO and heap mode.
ctl.str: Input string
read.len: String length
read.mode: Active storage mode
read.flag: Last byte byte[23]
mode.sso: Inline SSO (zero heap alloc)
mode.heap: Heap (ptr + size + cap)
say.sso: At {len} ≤ 22 bytes, <em>inline SSO</em> stores the characters directly in <code>bytes[0..22]</code> and puts the length in <code>0x{flag}</code> with bit 7 cleared.
say.heap: At {len} ≥ 23 bytes, it switches to <em>heap mode</em>: the first 8 bytes hold a heap pointer, the next 8 bytes hold length {len}, and <code>0x{flag}</code> sets bit 7.
:::

The entire chain closes cleanly: from 15 header bytes on disk, through block modes, virtual memory, calling conventions, instruction encoding, and C++ runtime layout, all the way back to a crisp image rendering in the browser. {.take}

**One coherent debugging arc**: squeeze every fact out of the raw bytes first (container layout, XOR involution, ECB fingerprints), replace guesses with an exact known-plaintext oracle, abandon polling once the timescale math rules it out, use system API breakpoints to separate OS libraries from internal code, trace PC-relative instructions to the exact function, and decode the C++ return object by its ABI layout. Every step narrows the search space by first principles rather than luck. {#sum .sum}

Related essays: [[a-secret-in-public]] (public-key and symmetric cryptography basics), [[how-virtual-memory-works]] (process virtual memory and address spaces), [[how-a-cpu-runs-a-program]] (machine instructions and registers). {#links}

::: footer
**Note.** This essay documents a redacted macOS ARM64 local encrypted-image debugging workflow with no personal keys, accounts, or private paths. All numerical models run locally in the browser; verification scripts and sources are recorded in BRIEF.md.
:::
