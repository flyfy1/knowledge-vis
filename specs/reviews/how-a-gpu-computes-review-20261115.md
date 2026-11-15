# Review: computing/systems/how-a-gpu-computes/ (A6, GPU 是怎么算的 / How a GPU Computes)

Reviewer: Claude Code (claude-opus-5-5), 2026-11-15. Independent; did not build the page (builder: Claude Code
claude-opus-5-5, zh; translator: Haiku, en). Followed specs/essay-briefs/REVIEW-COMMON.md, including step 7 (diagrams).
Changes are in the working tree only, inside the page directory plus this note.

## Verdict

Ready to register, after the fixes below. No model was wrong. The errors were in the prose: claims that went
beyond the sources, paraphrases presented as quotes, an uneven register comparison, and one wrong word in ch4. The
English needed editing in places and two diagram labels needed fixing.

## First-read notes

1. The argument holds together. The opening question ("why can a small rewrite make it several times slower") is
   answered by ch4–ch7, and ch12 sums it up. 慢好几倍 matches the models: divergence ×1.8–3.7 at the quoted
   settings, stride ×8, bank conflicts up to ×32 (shared memory only), and ×80 for tiled against untiled.
2. ch1.p2 compared a 256 KB *physical* SM register file with the ~2 KB of *architectural* x86 registers. That
   made the GPU look register-rich per thread, which is the opposite of the truth.
3. ch1.p2 and ch12.sum said an SM runs "32 lanes on the same instruction" per cycle. An H100 SM has four
   partitions, each issuing one warp instruction per cycle.
4. ch4.p3 said the speed depends on whether the condition "looks at the thread number or the data". A condition
   on the thread (lane) number diverges. The model's no-divergence case is the *warp* number.
5. The default views all show their effect untouched. The ch3 "send to scheduler" button and its 8 warps/scheduler
   result tie the two models together well.

## Errors found and fixed

| Where | Problem | Fix |
|---|---|---|
| ch1.p2 zh/en | Physical 256 KB vs architectural 2 KB | Compares architectural with architectural: x86-64 ~2 KB vs a CUDA thread's max 255 × 4 B = 1,020 B, and 32 regs = 128 B per thread at full residency (65,536 / 2,048). The new prose numbers come from `prose()` (gpuRegMaxB, thrSm, gpuRegFull, gpuRegFullB), are pinned in tests/models.cjs, and a test checks the inequality. CPU physical register files are explicitly left out. |
| ch1.p2, ch12.sum | "SM issues one instruction to 32 lanes" | Now says {scheds} partitions, each issuing to 32 lanes per cycle. |
| ch3.p2 zh | 原话是「在线程束之间切换没有代价」 | Now a reported statement. EN quotes the 13.5 Guide verbatim: "switching between warps incurs no cost". |
| ch4.p2 zh | 「32 个线程走同一条路时效率最高」 was a paraphrase in quote marks | Quote marks removed in zh. EN quotes the Guide verbatim ("the warp executes each branch path taken…", "full efficiency is realized when all 32 threads of a warp agree on their execution path"). |
| ch5.p2 zh/en | Paraphrased Best Practices text in quote marks | zh quote marks removed. EN keeps only the verbatim "four coalesced 32-byte transactions will service that memory access". Test literals updated, and a new test checks 4 / 5 / 50 % against the model. A test now fails if any copy says 原话. |
| ch3.p4 | "Real schedulers favour pushing one warp forward" | NVIDIA does not publish its policy. The text now refers to research schedulers, and Narasiman 2011 is described as a fix for the round-robin convoy. |
| ch3.limit | Volkov remark was vague and attributed to work not read | Cites the GTC 2010 talk "Better Performance at Lower Occupancy" (ILP instead of more warps). EN also had a mistranslation ("results would be a bit lower") about allocation granularity; fixed. |
| ch4.p3 | "thread number vs data" | Now "warp number vs each thread's own data". |
| ch8.p2 | wgmma "fetches a larger block straight from shared memory" | Now: the warpgroup computes a larger block together and reads B (optionally A) from shared memory. |
| ch10.p3 | "atomics executed at L2" stated without a source | Kept, scoped to atomics on device memory, with the Guide's scope table (L2 is the point of coherence for device scope) given as the anchor. Still listed as not verified. |
| ch11.c1 | Rubin 50 PF: dense or sparse? | NVIDIA's Rubin architecture blog (opened) does not label it. A search summary says Tom's Hardware and Guru3D list it as sparse, but neither article loaded (truncated / 403), so the page says only "some press reports list it as sparse" and warns against comparing it with the dense ch8 peaks. |
| dg.sm.cap | Credited the "Hopper white paper", which was never opened | Now credits the NVIDIA Hopper architecture blog's SM diagram. |

## English

Fixed: `dg.coal.t` "Thr" → "Thread" (the wide layout's left margin widened from 40 to 76 units so it fits; the
narrow layout has no row label, and the line "thread k reads word k" names the numbers). `dg.sm.out` "To L2,
memory" → "To L2 and device memory" (wraps in the narrow layout; narrow viewBox height 482 → 500). `dg.sm.l1`
spelled out. `dg.mma.macs` now has its unit. `dg.hier.warps` "……" → "…". `ch2.v.warp` and the pixel sentences
use "lane", matching the tile label. ch2.say.idle "and" → "or" (zh 或). "colour" → "color" for consistency.
Reworded translation-like lines in ch2.law, ch2.p5, ch5.p1, ch7.p1, ch11.law and ch11.d3. The two files keep
identical keys. Sibling titles match pages.config (checked by the existing test).

## Diagrams (step 7)

Eleven inline SVG diagrams, all from copy keys. I looked at screenshots of all eleven at zh 1280, zh 320, en 1280 and
en 390, and of most of them at en 320 (die, coal, sm, mma, pipe). I did not look at zh 390 or the rest of en 320;
the browser test's checks (labels inside the drawing, no overlap, ≥ 11 px) cover those. Model panels: viewed at
zh 320, en 390 and en 1280, plus a few at en 320 (ch2, ch3, ch5, ch7, ch9) and zh 1280 (ch9). Reduced motion was
checked only by the browser test; its full-page screenshot is too tall to inspect visually.
Each matches the prose: the warp is two rows of 16 at block width 16; the SM has 4 × (scheduler, 64 KB RF, 32 FP32,
tensor core, LD/ST) and 256 KB L1/shared; the coalescing and bank diagrams are scaled down and captioned as
such; m16n8k16 is 16×16 · 16×8 = 2,048 MACs; L2 is drawn in two halves with no L1–L1 links. Every caption says
"schematic" wherever its numbers are not pinned. I checked the ch9 rasteriser picture by hand at s = 4: the
pixel-centre edge functions give exactly the 7 gold pixels shown.

## Test output (final)

- `node tests/models.cjs`: PASS: 4500 checks
- `tests/browser.cjs` (port 18975): PASS: zh+en at 1280/390/320 (overflow, clipped text, 48px targets, raw keys,
  readouts, live sentences, eleven diagrams with role / aria / labels inside / no overlap / ≥ 11 px; toggle,
  keyboard, every model driven, reduced motion)
- `tests/canvas-text-overlap.cjs --sweep`: PASS: 1350 canvas states across 1280/390/320 × zh/en, no colliding or clipped text
- The script cache keys are still `?v=20261115`. The page has never been deployed, but the copy changed after the builder's version; the registrar should bump them.
- `atlas/tests/registry-import.cjs` was not run on the edited REGISTRY.json (only checked that it parses as JSON).
- The evidence directories (leetcode, photosynthesis) were not modified.

## Still not verified

The PTX ISA warpgroup / wgmma operand rules (the document was too long to load). Atomics on device memory carried
out in L2 (whitepapers, not reopened). Volta's "one path per cycle" (Volta whitepaper, not reopened). The Volkov
talk (seen through slide text in a search summary only). The MI355X figures (AMD page and brochure timed out; the
figures are press reports, with third-party spec sites agreeing). The Rubin sparsity label (press). Narasiman 2011,
Fatahalian 2010, Pineda 1988 and Williams 2009 were not opened. The builder's B200/B300 HGX figures were not
reopened, though the arithmetic (÷8, ÷2) checks out against the known per-GPU dense values.

## Aliases (REGISTRY.json, changed in review)

No exact clash with any atlas lesson or REGISTRY. Changes:
- 像素着色器 / pixel shader → 像素着色怎么上 SM / quad shading (computer-graphics owns rendering-pipeline words)
- TF32 是什么, BF16 和 FP16 区别 / TF32 format → mma.sync m16n8k16, wgmma 指令 / m16n8k16 (the page names these formats but does not explain them)
- CUDA ROCm Triton / CUDA vs ROCm → GPU 代码为什么慢 / why is my GPU code slow (the page does not compare vendors)

Near-ties to watch: "GPU cache coherence" against A5's "cache coherence", and "GPU shared memory" against the
memory essay's "shared memory bus bottleneck" and B4's "coherent shared memory".
