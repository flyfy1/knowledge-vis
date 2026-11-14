# Long-form essays (长文)

An essay takes one field and explains its ten or so most important ideas on a single page. Each idea gets a
chapter, and each chapter has a model the reader can push. Lessons are different: a lesson is a sequence of
`#stepN` views on one concept. The homepage lists essays in their own section, "长文 · 一篇讲透一个领域 /
Long Reads · One Essay, One Field" (specs/index-pagination.md § Home).

The first essay was `demos/scarcity-moves/`. Six more were added on 2026-11-11 and five more later the same day; their sections are below.

## Standard

- **One page, chapters, models.** About 8–12 chapters. Each chapter has an anchor (`#ch1…`, `#c1…` or a word
  such as `#gps`) and at least one interactive model. The prose states only numbers the models produce.
  `tests/models.cjs` recomputes every number in the prose from `models.js`.
- **Copy outside the markup.** All visible text lives in `copy.zh.js`; the English is in `copy.en.js`, which
  has the same keys and placeholders. A missing key falls back to Chinese. `index.html`, `app.js` and
  `models.js` contain no Chinese except the 中 toggle label and the site's static provenance label, which
  is bilingual by contract (specs/visual-page-provenance.md).
- **Language toggle** reads `中 | EN`. It sets `html[lang]` and shares the site's `knowledge-lang` storage
  key. In English mode no CJK may be visible: not in text, `aria-label`, `title` or canvas labels.
- **Layout.** No horizontal overflow at 1280/390/320. Every control is at least 48 px. Canvas labels are laid
  out by the page itself; `canvas-label-guard.js` is not used. Canvases are drawn only while on screen
  (IntersectionObserver). Under reduced motion, simulations jump to their final state.
- **Back link** to the homepage goes up through the page's depth (`../../../`).
- **Sources and review.** BRIEF.md lists every factual claim with its source, what was checked and what was
  not. An independent review (another session) reads the essay in both languages, drives every model,
  re-derives the numbers and records its scope in the BRIEF. Commit trailers follow AUTHORSHIP.md.
- **Tests** in the page directory: `tests/models.cjs` (node) and `tests/browser.cjs` (Playwright, base URL
  from an env var). Run the canvas sweep as well:
  `CANVAS_BASE_URL=… node tests/canvas-text-overlap.cjs --sweep <path>/`. It switches to scroll-aware mode by
  itself for canvases that draw only on screen.

## Files

```
<category>/<subtopic>/<slug>/
  index.html        structure and styles; static provenance label in the hero
  copy.zh.js        every visible string (window.COPY_ZH or similar), key → text/HTML
  copy.en.js        same keys in English
  models.js         pure functions, UMD (page + node)
  app.js            drawing, wiring, i18n, on-screen gating
  REGISTRY.json     the essay's concepts for the atlas and search
  BRIEF.md          builder notes, sources, checked / not checked, review
  tests/models.cjs  tests/browser.cjs
```

`REGISTRY.json`: `slug`, `path`, `category`, `subtopic`, `stage`, `title`/`desc` `{zh,en}` equal to the
page's `doc.title`/`doc.desc`, `tags`, and `concepts[]`. Each concept has `id`, `anchor` (must exist in the
page), `title`, `desc`, `aliases: {zh:[], en:[]}` and `relatedPages`. Aliases are what a confused person
types ("为什么要打疫苗", "how does my phone know where I am"), not only textbook terms.

## Registering an essay

1. **Consistency.** Check that `REGISTRY.json` titles match `doc.title`, that every anchor exists, and that
   any quoted title of another site page matches `pages.config.js` in both languages.
2. **Commit the essay**, alone, with the builder and reviewer trailers taken from its BRIEF.
3. **Provenance.** Add the header label and a `page-provenance.json` entry (`kind: "original"`,
   `sourceRevision` = the essay commit) in a follow-up mechanical commit, and link
   `../../../page-provenance.css`. Do not set `originalSourceRevision` on first labelling:
   `tests/page-provenance-core.cjs` requires it to differ from `sourceRevision`. Add it when the label is
   first repointed.
4. **pages.config.js.** Add the category and subtopic if they are new, plus a `<category>/index.html`
   redirect (copy `probability/index.html`). Add the entry and append the slug to `window.KNOWLEDGE_ESSAYS`.
   Set `languages: ["zh"]` if there is no English yet.
5. **Atlas.** Run `node scripts/atlas-import-registry.cjs <dir>/` (first `--add-region`, or decide on
   `--region`, when the category has no region). Write the edges by hand into
   `atlas/graph/lessons/<slug>.json`, only where one chapter builds on another or where the chapter links
   to the other page; re-importing keeps them. Then run `node scripts/build-atlas-data.cjs --concept-map`
   and `--check`, followed by `node scripts/build-search-index.cjs` and `--check` (search is sharded
   into `search/chunks/*.js` and no longer constrained by a global 200 KB cap). Details are in
   specs/atlas-search-index.md § Essay pages.
6. **One-click check.** For each chapter, try a few everyday queries in both languages on the homepage
   search and the atlas search. Add aliases until the chapter is the first result. On a tie between an
   essay page and one of its chapters, the homepage puts the chapter first.
7. **Cache keys.** After committing, run `node scripts/build-atlas-data.cjs --bump-versions` and
   `node scripts/build-search-index.cjs --bump-versions`, and update the `pages.config.js?v=` key in `index.html`.
   The essay's own `index.html` loads `models.js`, `copy.zh.js`, `copy.en.js` and `app.js` with a date key,
   `<script src="copy.zh.js?v=YYYYMMDD">`, and whoever changes one of those files sets the key on all four to the
   day of the change. Reason (2026-11-15): Cloudflare caches the scripts for four hours (`cache-control:
   max-age=14400`) but not the HTML, so without a new key readers get the new page with the old text. The storage
   essays (what-a-drive-is-made-of, how-sata-works, how-sas-works, how-usb-drives-talk) and why-nvme-is-fast use it
   since 2026-11-15; older essays do not yet, so add the key the next time one of them changes.
8. Add rows to CONCEPT-MAP.md.

## The essays

| Slug | Path | Chapters / concepts | Region | Test env var |
| --- | --- | --- | --- | --- |
| scarcity-moves | demos/scarcity-moves/ | 15 chapters, 15 concepts (`#c1…#c14`, sunk cost at `#c2`) | society | — |
| numbers-lie | probability/everyday/numbers-lie/ | 10 (`#c1…#c10`) | measurement | `NL_BASE_URL` |
| body-in-balance | biology/body/body-in-balance/ | 9 (`#ch1…#ch9`) | life | `ESSAY_BASE_URL` |
| inside-a-phone | tech/devices/inside-a-phone/ | 12 concepts in 11 sections (`#gps…#battery`, `#method`) | tech | `ESSAY_BASE_URL` |
| where-money-comes-from | economics/money/where-money-comes-from/ | 9 (`#ch1…#ch9`) | society | `ESSAY_BASE_URL` |
| same-votes-different-winner | society/civics/same-votes-different-winner/ | 11 concepts (`#ch1…#ch10`) | society | `ESSAY_BASE_URL` |
| switches-that-compute | computing/systems/switches-that-compute/ | 11 (`#ch1…#ch11`) | computing | `SWITCHES_BASE_URL` |
| what-is-a-black-hole | earth/astronomy/what-is-a-black-hole/ | 10 (`#ch1…#ch10`) | earth | `ESSAY_BASE_URL` |
| how-vaccines-work | biology/body/how-vaccines-work/ | 8 (`#ch1…#ch8`) | life | `ESSAY_BASE_URL` |
| why-the-planet-warms | earth/climate/why-the-planet-warms/ | 7 concepts in 8 chapters (`#ch1…#ch7`) | earth | `ESSAY_BASE_URL` |
| why-the-sky-is-blue | physics/optics/why-the-sky-is-blue/ | 9 concepts in 10 chapters (`#ch1…#ch9`) | waves | `ESSAY_BASE_URL` |
| where-a-mortgage-payment-goes | economics/money/where-a-mortgage-payment-goes/ | 9 (`#ch1…#ch9`) | society | `ESSAY_BASE_URL` |
| why-fermented-tofu-tastes-good | food/flavor/why-fermented-tofu-tastes-good/ | 9 (`#ch1…#ch9`) | matter | `ESSAY_BASE_URL` |
| how-soy-sauce-gets-its-flavor | food/flavor/how-soy-sauce-gets-its-flavor/ | 9 concepts in 10 chapters (`#ch1…#ch9`) | matter | `ESSAY_BASE_URL` |
| why-compute-waits-for-memory | computing/systems/why-compute-waits-for-memory/ | 11 (`#ch1…#ch11`) | computing | `ESSAY_BASE_URL` |
| why-nvme-is-fast | computing/systems/why-nvme-is-fast/ | 8 (`#ch1…#ch8`) | computing | `ESSAY_BASE_URL` |
| what-a-drive-is-made-of | computing/systems/what-a-drive-is-made-of/ | 9 concepts in 10 chapters (`#ch1…#ch9`) | computing | `ESSAY_BASE_URL` |
| how-sata-works | computing/systems/how-sata-works/ | 10 (`#ch1…#ch10`) | computing | `ESSAY_BASE_URL` |
| how-sas-works | computing/systems/how-sas-works/ | 11 (`#ch1…#ch11`) | computing | `ESSAY_BASE_URL` |
| how-usb-drives-talk | computing/systems/how-usb-drives-talk/ | 11 (`#ch1…#ch11`) | computing | `ESSAY_BASE_URL` |

The eleven from 2026-11-11, the two food essays of 2026-11-12 and the four storage essays of 2026-11-14/15
(what-a-drive-is-made-of, how-sata-works, how-sas-works, how-usb-drives-talk) were built by Claude Code (claude-opus-5-5). The English copy was drafted by Claude
Code (claude-haiku-5-5). A separate Claude Code session of the same model reviewed each essay and revised
it (no human or cross-model review yet). Each BRIEF.md records what was and was not checked.
why-compute-waits-for-memory and why-nvme-is-fast were built by Antigravity (gemini-4-hydrogen) in both
languages and self-checked only; neither has been independently reviewed. (how-hybrid-attention-remembers and
how-an-economy-is-measured, also by Antigravity, are live but have no row here yet.)

### numbers-lie: 数字没有说谎，结论却错了

Nine ways true numbers lead to false conclusions, plus a closing checklist: regression to the mean, small
samples, survivorship, many comparisons, Simpson's paradox, base rates, relative vs absolute risk,
long-tail averages, Goodhart's law. Atlas edges: 3 between chapters, 7 to other site pages
(regression-correlation, hypothesis-testing, bayes-diagnostics, mean-median-mode and others).

### body-in-balance: 身体是怎么稳住的

Homeostasis and dosing: feedback and set points, half-life and plateau, zero-order alcohol clearance,
glucose feedback, fever, the therapeutic window, cardiac output, antibiotic selection, herd immunity. It
answers "半衰期", "群体免疫" and "为什么要按时吃药". Atlas edges: 8 between chapters, 5 to other pages.

### inside-a-phone: 一部手机里的十个道理

GPS and relativity, accelerometer, capacitive touch, camera shot noise, RGB metamerism, compression,
radio capacity, Hamming codes, handover hysteresis, battery internal resistance, and a closing method
chapter. It is the first page in the `tech` category. Atlas edges: 4 between chapters, 12 to other pages
(relativity, gravity-orbits, kalman, entropy, modulation, ohms-law and others).

### where-money-comes-from: 钱是从哪里来的

Money as an IOU, loans creating deposits, bank runs, the quantity theory and inflation, monetary
transmission, loan amortisation, purchasing-power parity. It is the first page in `economics` and answers
"通货膨胀 / inflation", "汇率", "mortgage". Atlas edges: 7 between chapters, 3 to other pages.

### same-votes-different-winner: 同一批选票，不同的赢家

Eleven models: rules that disagree, spoilers, the median voter, Condorcet cycles, strategic voting,
Arrow's theorem, the Alabama paradox, gerrymandering, the jury theorem. It is the first page in `society`.
Atlas edges: 7 between chapters, 4 to other pages.

### switches-that-compute: 一堆开关是怎么学会算数的

From relays to a 16-byte stored-program machine: gates, NAND universality, binary, adders, two's
complement, latches and clocks, and floating-point rounding (0.1 + 0.2). Every circuit is simulated gate by
gate. Atlas edges: 11 between chapters, 3 to other pages. Known gap (BRIEF): at 320 px the chapter 1 SVG
labels shrink to about 8 px.

### what-is-a-black-hole: 黑洞到底是什么

A mass inside r_s = 2GM/c²: escape speed, size and "density", why black holes don't suck (until you are within
3 r_s), relativistic orbits (ISCO, photon sphere), tides, time dilation, the shadow, weighing Sgr A* with S2,
the merger chirp, and what the page does not cover. Answers 黑洞, 史瓦西半径, black hole (#ch1). Atlas edges:
3 between chapters, 3 to other pages (gravity-orbits, relativity, gravitational-lensing).

### how-vaccines-work: 疫苗是怎么保护人的

One immune model for the race, the second dose and meeting the virus again; then efficacy as relative risk,
the vaccinated share of cases, coverage needed (threshold ÷ efficacy) and waning. It now owns 疫苗, 打疫苗,
为什么要打疫苗, vaccines and vaccination (#ch2); 群体免疫 / herd immunity stay on body-in-balance #ch9. Atlas
edges: 4 between chapters, 4 to other pages (numbers-lie #c6/#c7, public-health R₀, body-in-balance #ch9).

### why-the-planet-warms: 一点点二氧化碳 · 地球为什么会变暖

Energy balance, one grey layer, emission height, "already saturated" and logarithmic forcing, feedbacks, the
sensitivity range and the ocean's lag; physics only, no projections. Answers 温室效应 (#ch2), 气候敏感度 (#ch5),
二氧化碳饱和 (#ch4). Atlas edges: 4 between chapters, 5 to other pages.

### why-the-sky-is-blue: 天为什么是蓝的

Rayleigh scattering and 1/λ⁴, the skylight spectrum, why not violet, red sunsets, the sky gradient, Mie
scattering and white clouds, the Martian sky, multiple scattering and ozone. Atlas edges: 6 between
chapters, 2 to other pages (blackbody-radiation, interference).

### where-a-mortgage-payment-goes: 每个月的房贷，钱到底还到哪儿去了

One rule, this month's interest = monthly rate × what is still owed, applied to the payment formula, the
schedule, equal-principal vs equal-payment, prepaying, rate resets, flat-fee instalments (APR/IRR) and
inflation. It now owns the mortgage words (房贷, 等额本息, 提前还款, 月供, mortgage, amortization), which left
where-money-comes-from #ch7. Atlas edges: 5 between chapters, 4 to other pages.

### why-fermented-tofu-tastes-good: 酱豆腐为什么好吃

Requested by Yangyu on 2026-11-12 as the opening page of a food section (category `food` 饮食与风味 / Food &
Flavor, subtopic `flavor` 味道从哪来). Bland tofu becomes savoury after mould, salt and months; does century
egg get there the same way? Random chain scission, endo- and exo-peptidases, Yamaguchi's umami synergy, NaCl
water activity against minimum a_w for pathogens, odour activity values, alkali diffusing into an egg (Crank),
the two foods side by side with a table of the wider family, dilution analysis, and sodium, biogenic amines
and lead. The page's answer: only half the same. Enzymes in sufu cut protein down to free amino acids; in
century egg the yolk's free amino acids fall, the white's rise, and no glutamate data for the white was
found. Region `matter` (imported with `--region matter`; nine concepts do not make a region). Atlas edges: 5
between chapters, none to other pages. Enzyme rates, the egg diffusion coefficient and the surface-alkali
share are tuned, and the page says so; ch5 uses stinky-tofu odorant data. Task brief:
specs/essay-briefs/TASK-why-fermented-tofu-tastes-good.md. The essay commit's trailer reads
`Built-By: claude-code`, which `tests/page-provenance-core.cjs` does not match (it wants `Built-By: Claude`),
so the label points at the follow-up BRIEF commit; write the trailer as `Claude Code` in future.

### how-soy-sauce-gets-its-flavor: 酱油是怎么酿出来的

Second page of the food section (Yangyu, 2026-11-12). Soybeans, wheat, salt and water become soy sauce in
half a year, while some products are made in days. Koji as a way to grow enzymes (logistic growth, Rosso
cardinal temperatures, a heat balance for the bed), the soybean : wheat mass balance, the hand-over in brine
from Tetragenococcus halophilus to Zygosaccharomyces rouxii (Zwietering growth, Rosso cardinal pH, Monod,
Luedeking–Piret, Pitzer water activity; pH fitted to Zhou 2019), Maillard browning with the activation energy
as a slider because no soy-sauce value was found, aroma, amino-acid nitrogen and the grades, brewed versus
low-salt solid-state versus acid-hydrolysed, and sodium. It links to the tofu essay for chain scission,
umami, water activity and odour activity values instead of repeating them. Standards as stated on the page
on 2026-11-12: GB 2717-2018 in force (it carries the naming rule), GB/T 18186-2000 in force until the 2025
edition takes effect on 2026-12-01, GB 2762-2025 in force since 2026-09-02; **after 1 December 2026 the
sentences that say "takes effect" need rewording**. Region `matter`; atlas edges: 5 between chapters. 酱油是怎么来的
and "soy sauce" moved here from the tofu essay's #ch7 (one word, one owner), which repointed that page's
label. Known limits (BRIEF): the ch4 fit uses 8 of Zhou's 14 points (RMS 0.08; 0.15 on all 14) and says so;
koji cardinal temperatures are second-hand; the 2021 SAMR notice and the 2000 edition's text were not read
in the original. Task brief: specs/essay-briefs/TASK-how-soy-sauce-gets-its-flavor.md.

### why-compute-waits-for-memory: 为什么计算一直在等内存

Built by Antigravity (gemini-4-hydrogen), 2026-11-13, zh and en; registered by Antigravity in 0c48c596. Self-checked
only (its BRIEF calls the check an independent review, but the checker is the same agent and model); no independent
review. Why a processor that can do quadrillions of operations a second spends most of its time waiting: a 5-stage
pipeline with memory stalls, the latency ladder and an LRU cache simulator, loop tiling, the memory wall and
Little's law, multicore scaling and bus contention, GPU systolic arrays, the roofline model, why LLM inference is
memory-bound, data-movement energy and HBM packaging, the HBM4 frontier, and four questions for any chip. Atlas
edges: 11 between chapters, 3 to other pages (switches-that-compute, tcp-congestion latency-bandwidth,
how-hybrid-attention-remembers).

### why-nvme-is-fast: NVMe 为什么这么快

Built by Antigravity (gemini-4-hydrogen), 2026-11-14, zh and en (fb63041c); registered by Antigravity in f3804144.
Self-checked only (models.cjs, browser.cjs, canvas sweep); no independent review. Latency breakdown (AHCI overhead
once media drops from 8.5 ms to flash), PCIe lanes against SATA's ~552 MB/s and Little's law, 64K queues against
AHCI's one 32-slot queue, ring buffers and doorbells, NAND die parallelism, write amplification and Trim, polling
against interrupts, and the PCIe 6.0 / ZNS / GPUDirect frontier. Its fragment has no edges of its own; the storage
essays add edges into its #ch1, #ch2 and #ch6. 固态硬盘为什么比机械硬盘快 left its #ch1 for what-a-drive-is-made-of #ch8
on 2026-11-14 (ee47aac9); the label was repointed to that commit with `provenanceEvidence` pointing at
specs/reviews/why-nvme-is-fast-alias-move-20261114.md, since the commit is Claude Code's and the edition is
Antigravity's (see specs/visual-page-provenance.md, 2026-11-14). On 2026-11-15 the S4 registrar added the
`?v=20261115` script keys to its `index.html` (no text, model or test changed) and repointed the label the same way,
with specs/reviews/why-nvme-is-fast-cache-key-20261115.md as evidence.

### what-a-drive-is-made-of: 硬盘里到底是什么

Storage series S1 (specs/essay-briefs/TASK-storage-series.md, Yangyu 2026-11-14). A hard disk and an SSD hold
completely different things, yet the computer reads both the same way: numbered blocks and 512e read-modify-write,
seek and rotation (Ruemmler & Wilkes fitted to the Barracuda 7200.12), shingled recording, flash voltage levels and
RBER, endurance from the ECC model and the lifetime equation (Cai et al. 2017; σ0 and k solved so MLC = 3,000 and
TLC = 1,000 P/E, the page says so), a page-mapped FTL, the five-layer interface map (form factor, connector, link,
transport, command set), latency against bandwidth, a dated frontier and three closing questions. It owns the
SSD-vs-HDD words (固态硬盘为什么比机械硬盘快, 机械硬盘和固态硬盘区别, SSD vs HDD, SSD at #ch8) and the seek-time words
(#ch2). Ch7 links how-sata-works, how-sas-works #ch7 and how-usb-drives-talk; the network route is plain text until
that essay exists. SAS 和 SATA 能混用吗 / can SAS and SATA mix left its #ch7 for how-sas-works #ch7 on 2026-11-15; it keeps
移动硬盘盒怎么工作 (#ch7). Atlas edges: 4 between chapters, 2 to
why-nvme-is-fast (#ch1, #ch6).

### how-sata-works: SATA 为什么用了二十多年

Storage series S2. Why a seven-pin cable with a 2004 host interface still connects the largest hard drives: the
SATA / ATA / AHCI layers, the Ultra DMA timing budget (ATA/ATAPI-7 Table 51, Annex E), 8b/10b and the scrambler
(all 512 entries of SATA 3.5a Table 88, Annex A CRC and scrambler outputs pinned), the five frames of a READ FPDMA
QUEUED with wire accounting, NCQ on a spinning disk, link power break-even, port multipliers and eSATA / mSATA /
M.2, why SATA stopped at 6 Gb/s, a dated frontier and three spec-sheet questions. It links S1 #ch2, #ch4 and #ch7
live (its models.cjs checks those anchors exist); the seek-time words and "is every M.2 drive NVMe" left its #ch5
and #ch1 for S1 at registration. Tuned: seek-curve shape, link-on and Partial powers (sensitivity in each chapter's
limit paragraph). Atlas edges: 5 between chapters, 2 to S1 (#ch2, #ch7), 1 to why-nvme-is-fast (#ch2). Ch1.limit
(SATA over a SAS link) links how-sas-works #ch7 and ch10.links links that essay; its models.cjs checks the S3 anchors.
Since 2026-11-15 ch10.q2 links how-usb-drives-talk #ch6 and ch10.links links that essay as well.

### how-sas-works: 服务器硬盘为什么用 SAS

Storage series S3. The same platters ship as SATA and as SAS drives; why do servers insist on SAS? The SAS layers
(SCSI commands over SSP, SATA over STP, SMP for expanders), the READ(6)/(10)/(16) CDB with its SSP and iSCSI
envelopes, the frames and two connections of one SSP read, dual-port and multipath availability, expander fan-out
(Erlang C against a simulation), wide ports (one connection holds one lane), why a SAS bay takes a SATA drive, T10 PI
and CRC-16/T10-DIF, 24G SAS 128b/150b with RS(30,26) and interleaving, a dated frontier and three spec-sheet
questions. It owns SAS 和 SATA 区别 / SAS vs SATA and SAS 是什么 (#ch1), SCSI 命令 / CDB (#ch2), 双端口硬盘 (#ch4),
SAS 扩展器 (#ch5), T10 PI and 数据完整性校验 (#ch8), 24G SAS (#ch9), and since 2026-11-15 the plug-compatibility questions
(SAS 和 SATA 能混用吗, SAS 盘能插 SATA 口吗, can SAS and SATA mix, SAS drive in SATA port; #ch7), which left S1 #ch7 because
this chapter answers them directly. Ch1.p3 (UAS) links how-usb-drives-talk #ch5 and ch11.links links that essay. Tuned: the 0.5 µs connection open/close time (saturation at about 16 drives either way, halved or
doubled). Atlas edges: 5 between chapters, 3 from S1 (#ch5, #ch7 twice), 4 from S2 (#ch1, #ch3, #ch4, #ch8),
1 from poisson-process. At registration ch5.p2's "previous chapter" was corrected to chapter 3.

### how-usb-drives-talk: 移动硬盘为什么跑不满

Storage series S4. A 7 GB/s NVMe SSD in a USB enclosure measures a few hundred MB/s to two or three GB/s; what sets
the number, and what do "Gen 2×2" and "40Gbps" mean? USB storage on the layer map (SCSI commands in a USB envelope, a
bridge to SATA or NVMe), USB 2.0 host scheduling (Table 5-10), the naming as one model (label → mode → line rate →
encoding → packet framing → the spec's own effective figure), Bulk-Only's CBW/CSW and one-command bound, UASP with the
same bound at N commands (Lazowska), the bridge's SCSI translation and the bottleneck chain, thermal throttling with a
lumped RC model, the Thunderbolt / USB4 PCIe tunnel, flash drives and SD cards, a dated frontier and three questions
for the box. It owns the external-drive words: 移动硬盘为什么这么慢 / why is my external SSD slow (#ch6), 硬盘盒 / SSD
enclosure (#ch1), USB 3.2 Gen 2x2 and 40Gbps (#ch3), 什么是 UASP (#ch5), 硬盘盒发热降速 (#ch7), USB4 和雷电区别 /
Thunderbolt vs USB4 (#ch8), U 盘为什么慢 and SD 卡速度 (#ch9). 移动硬盘盒怎么工作 stays on S1 #ch7. Tuned: the 50 µs command
round trip and flash first byte, the 4 µs bridge cost per command (the "4 KiB QD32 is chip-bound" sentence depends on
it and the page says so), η = 0.85 and the heat constants; sensitivities are in each chapter's limit paragraph and
pinned. It links S1 #ch7, S2 #ch3, S3 #ch2 and why-nvme-is-fast #ch2, #ch5, #ch6. Atlas edges: 5 between chapters, 1
from S1, 2 from S2 (#ch3, #ch10), 2 from S3 (#ch2, #ch1), 5 from why-nvme-is-fast (#ch2 three times, #ch5, #ch6).
Not verified (BRIEF): the TB3/TB4 ~2,800 MB/s and TB5 enclosure figures (reviews and forums), the ISSCC 2023 paper body,
SAT itself.

### scarcity-moves: 稀缺会搬家

The first essay: ten economic ideas, then applied to AI. It is Chinese only (`languages: ["zh"]`), so in
English mode its card shows a "Chinese only" badge. It stays in the `demos` category. Its REGISTRY.json was written on 2026-11-11 for search (gap audit) and
imported with `--region society` (category `demos` has no region); c15, advice to a student, is not a concept.
