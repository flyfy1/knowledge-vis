# BRIEF — CPU 是怎么猜着往前跑的 (How a CPU Guesses Ahead)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots of every model and diagram at three widths); Claude Code (claude-opus-5-5), independent review in a separate session, 2026-11-15: zh and en read in full, models re-derived, diagrams checked at 1280/390/320 in both languages (see Review)
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: computer architecture series A4 (`specs/essay-briefs/TASK-arch-series.md`)
Format: long interactive essay, zh and en (`copy.en.js` translated; no `enStub`).
Files: index.html, copy.zh.js, copy.en.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs

## The one question

一条分支要等十几拍才知道往哪走，CPU 却不等：它先猜，猜对了白赚，猜错了推倒重来。它是怎么猜得这么准的？为什么一颗 CPU 能同时有几百条指令在路上？这种猜测又为什么会泄露秘密？

## Changes from the starting list (TASK file)

- Starts where A1 ends (A1 #ch8 static not-taken, #ch9 iron law): ch1 reuses the iron law only to show the cost grows with width × depth; the 5-stage pipeline, hazards, flush and µops are linked, not retaught.
- Sorted vs unsorted array is merged into ch2 (second model) rather than a chapter of its own.
- Memory disambiguation and store-to-load forwarding are prose only (ch8.p4); no model.
- Window size has its own chapter (ch9) tied to branch accuracy: IPC against ROB size × accuracy, with real ROB sizes.
- Spectre (ch10) runs on a toy machine in models.js only. Mitigation costs come from the toy (cycles per call) plus quoted figures from the paper and Retbleed; no code that times real hardware (the tests check models.js and app.js never use performance.now, SharedArrayBuffer, Atomics or WebAssembly).

## Chapters, models, results, tuned parameters

1. Cost of a wrong guess. CPI = 1/W + f_br × (1 − acc) × penalty. Zen 5 (W 8, 15 cycles) at 95 % loses 55 % of time, IPC 3.6; the A1 pipeline loses 2 %. TUNED f_br = 1/5; at 1/10 and 1/3 the loss is 38 % and 67 %.
2. 1-bit / 2-bit counters (Smith 1981) on a loop with an if (K = 4, p = 0.9): never-taken 15.6 %, BTFN 48.8 %, 1-bit 69.7 %, 2-bit 84.0 %; inner exit 50 % vs 25 % misses (twice vs once per exit). Sorted array: 32,768 values, 2-bit misses 3 times sorted, 49.8 % unsorted; 8.6 vs 1.13 cycles/element (7.6×), measured 11.54 s vs 1.93 s on Stack Overflow; branchless 1.75.
3. gshare (McFarling 1993): eqntott-style correlated branches 62.8 % → 74.3 % at h = 2 (75 % is the ceiling: four branches per pass with the loop back-edge, two of them coin tosses); a 4-trip loop 88.9 % → 99.9 % at h = 8; the mixed trace barely gains in a 64-entry table (71.1 → 76.7 %): aliasing.
4. TAGE (Seznec & Michaud 2006): 4 tagged tables, history 4/10/25/64, 8-bit tags, 3-bit ctr, 2-bit u, alt-on-new-alloc, u halved every 2^14 branches. At 16 Kbit, mixed trace: 2-bit 73.4 %, gshare 75.8 % at h = n (13) and 83.6 % at its best h (2), TAGE 85.8 %; long loop best-h gshare 96.9 % vs TAGE 99.8 %; TAGE at 4 Kbit (84.4 %) slightly above best-h gshare at 32 Kbit (83.6 %). (Changed in review: compare() now gives gshare its best history length per trace.) TAGE's configuration uses 1/16 more bits than the budget (stated on the page and pinned).
5. BTB and return stack: call chain of depth D (TUNED: two call sites per level, a quarter of calls repeated). D = 24: BTB-last-target 50 % wrong, 16-entry RAS 2.5 %, 24 or 52 entries 0 %; D = 32 with 24 entries 0.4 %.
6. Superscalar: 8-instruction dot-product loop, all L1 hits. In-order IPC 0.61 / 0.99 / 0.99 at width 1 / 4 / 8; out-of-order 3.74 / 7.01 at 4 / 8.
7. OoO stepper (rename R10000-style, scoreboard CDC 6600-style, in-order), 12 iterations, a[i] misses every 2nd iteration (TUNED) to L3 (46 cycles): 351 / 307 / 156 cycles; ROB 16: 290.
8. ROB and precise exceptions on the same simulator (ROB 16, no misses): mispredict in iteration 3 costs 13 cycles (59 vs 46), 10 wrong-path instructions squashed; TUNED front-end refill FE = 10 so a mispredict costs inside Zen 5's 12–18. A fault in iteration 4 commits exactly 24.
9. Window size: ROB 16–512 × accuracy, width 8, a miss every 16th iteration (one 64-byte line). L3: 2.16 / 2.69 / 7.16 at 64 / 128 / 512 with perfect prediction; 512 at 99 % 6.26, at 95 % 4.77 (one miss per 800 vs 160 instructions). Memory misses: 1.25 even at 512.
10. Spectre v1 toy: 16 public bytes, secret "Squeamish", 2-bit counter on the bounds check, 4/399-cycle hit/miss, Gaussian timing noise. Trained 6×, noise 20: 9/9 bytes; untrained, lfence or index masking: 0; noise 160: 0. Call cost 8 / 9 (mask) / 13 (lfence) cycles.
11. Frontier (as of 2026-11), ch12 closing with three questions.

## Diagrams (STANDARD §4a, inline SVG from app.js, labels from copy, 720-wide and 340-wide layouts)

fsm (2-bit saturating counter FSM, ch2), gs (gshare index: PC XOR GHR → counter table, bits computed, ch3), tage (T0 + T1–T4 with model history lengths, provider/alt, entry fields, ch4), btb (one fetch cycle: PC → BTB / direction / RAS → next-PC mux, ch5), ren (renaming removes WAR/WAW, ch7), ooo (superscalar OoO block diagram, in-order gold vs out-of-order cyan, ch7), rob (ROB ring with head/tail, miss at head, done, mispredicted branch, squashed slots, ch8), sp (Spectre v1 four steps with speculative window and cache row, ch10).

## Sources (each opened by me on 2026-11-15)

- AMD, Software Optimization Guide for the AMD Zen5 Microarchitecture, pub. 58455 rev 1.00 (Aug 2024), §2.8–2.10 (mispredict 12–18, typical 15; L1 BTB 16K, L2 BTB 8K; RAS 52 per thread; indirect 3072; dispatch 8; retire queue 448 / 224 per thread; retire 8; 240 integer PRF; 6 ALU issue): https://www.amd.com/content/dam/amd/en/documents/processor-tech-docs/software-optimization-guides/58455.zip
- Chips and Cheese, "Lion Cove: Intel's P-core roars" (2024-09-27): https://old.chipsandcheese.com/2024/09/27/lion-cove-intels-p-core-roars/
- Chips and Cheese, "Arm's Cortex X925: Reaching Desktop Performance" (2026-03-03; ~525 in flight, 10/cycle, 29-entry RAS; quotes WikiChip's 768): https://chipsandcheese.com/p/arms-cortex-x925-reaching-desktop
- Kocher et al., "Spectre Attacks: Exploiting Speculative Execution" (Haswell ROB 192; ~10 KB/s, < 0.01 % errors on i7-4650U; mitigation cost "a few percent to a factor of 4 or more"; Listing 1 code): https://spectreattack.com/spectre.pdf
- Seznec, "TAGE-SC-L Branch Predictors Again" (CBP-5, 2016; 64 KB winner): https://jilp.org/cbp2016/paper/AndreSeznecLimited.pdf
- Seznec & Michaud, "A case for (partially) TAgged GEometric history length branch prediction", JILP vol. 8 (2006): https://jilp.org/vol8/v8paper1.pdf (downloaded; text extraction failed, see below)
- CBP2025 championship page and closing remarks (2025-06-21, ISCA 2025; 64 KB TAGE-SC-L baseline, 192 KB budget): https://ericrotenberg.wordpress.ncsu.edu/cbp2025/ and https://ericrotenberg.wordpress.ncsu.edu/files/2025/06/CBP2025-Closing-Remarks.pdf
- Intel, "Analysis of Speculative Execution Side Channels" (first 2018-01, updated 2021-05-25; lfence after bounds check; eIBRS + CET instead of retpoline): https://www.intel.com/content/www/us/en/developer/articles/technical/software-security-guidance/technical-documentation/analysis-speculative-execution-side-channels.html
- ETH COMSEC, Branch Privilege Injection (USENIX Security 2025, CVE-2024-45332; 5.6 KiB/s; microcode up to 2.7 %, software 1.6–8.3 %): https://comsec.ethz.ch/research/microarch/branch-privilege-injection/
- ETH COMSEC, Retbleed (USENIX Security 2022; overheads 14 % AMD, 39 % Intel): https://comsec.ethz.ch/research/microarch/retbleed/
- VUSec, Branch Target Reuse (ACM CCS 2026; ~8 B/s on cBPF; CVE-2026-64507/64508): https://www.vusec.net/projects/btr/
- The Register, 2026-09-30: https://www.theregister.com/security/2026/09/30/spectre-bug-is-back-this-time-to-haunt-jit-engines/5299937
- Stack Overflow question 11227809 (2012-06-27; 11.54 s vs 1.93 s), read via https://api.stackexchange.com/2.3/questions/11227809?site=stackoverflow&filter=withbody (stackoverflow.com itself blocked fetching)

## Not verified from a primary source

- Hennessy & Patterson ch. 3 (not opened; eqntott example, Tomasulo, ROB as textbook background only).
- Seznec & Michaud 2006 JILP: PDF downloaded but text extraction failed; the TAGE description follows the 2016 CBP-5 paper.
- Smith 1981, Yeh & Patt 1991, McFarling 1993, Tomasulo 1967, Smith & Pleszkun 1985, Yeager 1996 (R10000), CDC 6600 scoreboard: cited from memory as classics, not reopened.
- Spectre paper venue (IEEE S&P 2019) is not printed in the PDF I read.
- AMD security bulletins SB-7029 / SB-7061 timed out; the AMD-side frontier items they would support were dropped. An interrupt-injection report (The Hacker News, 2026-08) was read but not used.
- X925's 768 is WikiChip's figure as quoted by Chips and Cheese; Arm's own number not seen.
- CBP2025 winners' names and scores not taken (only baseline and budget used).
- "Modern compilers turn the sorted-array loop branchless or vectorised" (ch2.p5) is from the Stack Overflow answers, not a compiler document.
- No perf counter names (branch-misses etc.) were checked against perf documentation; ch12 mentions measuring only generally.

## Facts that will go stale

ch11 (as of 2026-11): ROB sizes of Lion Cove / X925, CBP2025 as the latest championship, BTR as the latest disclosed attack, Intel's eIBRS + CET guidance.

## Checked / not checked

Screenshots were taken after the last layout change (all eight diagrams and every model at 1280/390/320, the ch7/ch8 steppers mid-run); reduced motion was checked by the browser test (no smooth scroll, still canvas, diagrams pass) and a full-page shot at 390, where off-screen canvases are blank by design.
Checked: tests/models.cjs (hand-worked predictors, RAS by definition, core invariants including in-order commit and exact commits before a fault, toy machine, every prose number pinned, tuned-parameter sweeps, sibling aliases and anchors); tests/browser.cjs (1280/390/320, reduced motion, eight diagrams, every model driven); canvas-text-overlap sweep; screenshots of every model and diagram at three widths. Not checked by the builder: English (checked in review, below), screen-reader pass.

## For the translator

Keys carry HTML (`<strong>`, `<em>`, `<code>`, `<a href>`); keep placeholders `{…}` and sibling links. Once `enStub` is removed, tests/models.cjs requires `EN['doc.desc']` to equal REGISTRY.json `desc.en` and `EN['doc.title'].split(' · ')[0]` to equal `title.en` ("How a CPU Guesses Ahead") exactly; update one or the other together. The Spectre code in ch10.code is Listing 1 of the paper (array2 stride 4096); keep it verbatim.

## Registrar notes

- Title zh 「CPU 是怎么猜着往前跑的」, en "How a CPU Guesses Ahead"; desc = doc.desc (REGISTRY.json has an English desc); category computing, subtopic systems, stage university; 12 concepts #ch1–#ch12.
- No provenance label, no page-provenance.css link, no pages.config/atlas edits made.
- Aliases avoid every word owned by A1 (控制冒险, 分支的代价, 流水线冲刷, 静态分支预测, predict not taken, branch penalty, iron law/CPI), the memory essay (pipeline stall, CPI, latency hiding, in-flight memory requests), A3 (KPTI, Meltdown 补丁) and A2 (cache words, MESI). New owned words here: 分支预测是什么 / branch prediction, 两位饱和计数器, gshare, TAGE, BTB, 返回地址栈, 超标量, ILP, 乱序执行, 寄存器重命名, Tomasulo, 重排序缓冲 / ROB, 精确异常, 推测执行 / speculative execution, 内存消歧, Spectre / 幽灵漏洞, retpoline, Flush+Reload, Retbleed, CBP2025. "speculative execution" may also suit A3's Meltdown chapter: keep it here.
- Siblings that name this essay in plain text and should link it once it is live: A1 ch6.limit and ch8.p3 (→ #ch2 / #ch7), A3 ch10.p4 (→ #ch10). A2 names only A5. This page names A5 in plain text (ch12.links) and does not link it.
- A5 (how-cores-share-memory) is being built concurrently and had no REGISTRY.json when this page's owned-alias check ran (the check reads it when it exists): rerun `node computing/systems/how-a-cpu-guesses-ahead/tests/models.cjs` before registering. Most likely collisions: 内存消歧 / memory disambiguation (A5) and 推测执行 / speculative execution (A3's Meltdown chapter).
- Search pins worth adding: 为什么排序后的数组更快 → #ch2; Spectre → #ch10; 乱序执行 → #ch7.

## Review

Reviewer: Claude Code (claude-opus-5-5), separate session; did not build the page. Date: 2026-11-15.
Scope: zh and en read in full (every key of copy.zh.js and copy.en.js); every model driven in the browser at 1280; eight diagrams screenshotted at 1280/390/320 in zh and en (scratch in /tmp/agent-tasks/arch/review-a4/).

Checks
- Independent script (own 1-bit/2-bit/gshare/RAS code on the page's traces, own cost formula) reproduces: CPI formula 54.5 % lost / IPC 3.64 (Zen 5, 8 wide, 15 cycles, f = 1/5, 95 %), A1 2.0 %, 90 % 70.6 %, 99 % 19.4 %, f = 1/10 37.5 %, 1/3 66.7 %; with the penalty at the ends of AMD's range (12 / 18) 49 % / 59 %. Loop-with-if 15.6 / 48.8 / 69.7 / 84.0 %, inner exit 50 % vs 25 %; sorted 3 misses, unsorted 49.8 %, 8.59 vs 1.127 cycles (7.6×), branchless 1.75; gshare 62.8 → 74.3, 88.9 → 99.9, 71.1 / 76.7 / 78.6; RAS 50 % / 2.5 % / 0 / 0 / 0.4 %. The formula's assumption (ideal IPC = width) is stated in ch1.limit.
- Core simulator, by hand: in-order width 1 = 13 cycles per 8-instruction pass (0.615); width 4 ≈ 8 per pass (0.99); OoO width 8 limited by three 1-cycle recurrences (7.01 incl. start-up). Stepped core: 351 ≈ 12 × 8 + 6 × (46 − 4) + tail; 156 ≈ misses overlapping in pairs; ROB 16 (290) cannot hold two misses' worth of instructions; fault at pass index 3 commits 3 × 8 = 24; mispredict 13 = FE 10 + 3 to resolve; 160 / 800 instructions between misses = 1 / (1/8 × 0.05 / 0.01). Invariants are pinned by the existing tests; no second simulator was written.
- Spectre toy: only models.js state (a Set as cache, Gaussian noise); no timers, clflush, SharedArrayBuffer or WebAssembly (test checks this); the only code shown is the paper's two-line Listing 1. Nothing runnable against hardware.
- Sources opened by the reviewer: Spectre PDF (10 KB/s and < 0.01 % on i7-4650U, Haswell ROB 192 micro-ops, Listing 1 with * 4096, "a few percent to a factor of 4 or more", Intel/AMD/ARM confirmed); Stack Overflow 11227809 via the API (2012-06-27, 32768, 11.54 s vs 1.93 s, ratio 5.98); Zen 5 penalty "12 to 18 cycles … common case 15" quoted on the AnandTech forum (thread 2619688, post 41283341) alongside the Zen 4 guide's "11 to 18 … 13" wording (the AMD zip itself returned an HTML page to curl); Chips and Cheese Lion Cove (576 / 512, rename 8 from 6, RAS 24 from 20); Arm newsroom blog 2024-09-23 ("2x increase in max instruction-window capacity", no number) for X925, now cited in ch11.c1; VUSec BTR page (CCS 2026, 8 B/s, CVE-2026-64507/64508, vendors: IBPB exists, fix in software) and The Register 2026-09-30 (same attack, CCS 2026; also 5.7 / 5.4 KB/s figures not used); CBP2025 page (2025-06-21, ISCA 2025 Tokyo, 192 KB, 64 KB TAGE-SC-L baseline from CBP2016). McFarling TN-36 (June 1993) as gshare's origin: confirmed through secondary sources (course notes, MPR 1997); the note's PDF could not be text-extracted here.
- Sibling links and anchors resolve (A1 #ch8 #ch9, A3 #ch7 #ch10, A2 #ch8 #ch10, memory essay #ch1 #ch4); English titles match pages.config.js (now tested). No registered REGISTRY.json or atlas/search file uses 推测执行 / speculative execution / 内存消歧 / memory disambiguation, so they stay here; A5 has a REGISTRY.json and the owned-alias test passes against it.

Changes
- ch4 fairness (model change): gshare in the equal-storage comparison ran at h = n (13 bits), its worst setting on the mixed trace (75.8 %); at its best h (2) it gets 83.6 %. compare() now sweeps h and keeps the best (the most favourable comparison for gshare) and also returns the h = n figure. ch4.p3 rewritten: it wrongly said the gap came mainly from the long loop; per-segment misses show the h = n gap is dilution of short-history branches, and the remaining gap to best-h gshare lies entirely in the loop segments (pinned). 4 Kbit TAGE vs 32 Kbit gshare is now "slightly above" (84.4 vs 83.6). TAGE's extra 1/16 storage is fair in effect: doubling gshare's budget does not improve it (pinned).
- English: ch3.p2 had the eqntott polarity reversed (third branch "not taken" when the first two agree; the model and zh say taken / skips); doubled unit "{cyc} cycles" in three live sentences; ch9 Zen 5 cell garbled ("each of 224"); table headers now "ROB size (instructions in flight)" and "Instructions per cycle (stage)", with the stage in the Zen 5 / Lion Cove cells (zh too); FSM arcs "taken"/"not" → T / NT with the legend in the caption.
- Diagrams: FSM boxes widened (1280) and captions made layout-neutral ("towards state 3 / 0"); ROB legend's "Waiting" now has a slot, caption says the tail moves back from 10 to 7; OoO write-back drawn as a bus from all units to the physical registers (it came from the branch unit only); TAGE caption names the alternate (T1) and says table sizes are not to scale.
- ch2.p4: the sorted-array weakness is no longer attributed to 2-bit counters specifically. ch3.p3 explains the 75 % ceiling. ch11.c1 cites Arm's own blog; ch11.d4 describes BTR as the VUSec page does. Narrow-screen table header made a 1 px visually-hidden block (the longer English header overflowed at 320). Script keys bumped to ?v=20261115r.
- tests/models.cjs: new pins for cmGf / cmGh / gsN and the changed cmG, clG, ccG, c32G; best-h sweep, TAGE > best-h gshare at every budget, loop-segment attribution; English sibling titles, doubled-unit, eqntott-polarity and T/NT checks.

Unverified
- AMD 58455 itself (penalty, ROB 448, PRF 240, BTB, RAS 52) not opened by the reviewer; penalty corroborated only by a forum quotation.
- X925 768 remains WikiChip's figure (labelled a claim); Arm publishes only "2x".
- Hennessy & Patterson ch. 3 (eqntott example), Seznec & Michaud 2006 (TAGE description follows the 2016 paper), Smith 1981, Yeh & Patt 1991, Tomasulo 1967, Smith & Pleszkun 1985, Yeager 1996: not opened; the attributions are the standard ones.
- Branch Privilege Injection and Retbleed figures, Intel guidance dates: not re-opened.
- "4 Kbit TAGE beats 32 Kbit gshare" holds by 0.8 points only against best-h gshare; not swept over other mixes. Screen-reader pass not done.
