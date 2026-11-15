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
- **Diagrams.** From 2026-11-15 (Yangyu), every chapter that introduces a structure also has a static schematic
  diagram, at least six per essay: inline SVG, labels from the copy files, schematic or pinned to the models.
  Rules in specs/essay-briefs/STANDARD.md §4a.
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
   max-age=14400`) but not the HTML, so without a new key readers get the new page with the old text. If the scripts
   were already deployed under today's key, append a letter (`?v=20261115b`, then `c`) so the new key differs. The
   storage essays (what-a-drive-is-made-of, how-sata-works, how-sas-works, how-usb-drives-talk, storage-over-a-network),
   the bus essays (how-pcie-works, how-a-computer-is-wired, how-thunderbolt-works), how-cpu-caches-work, how-a-cpu-runs-a-program, how-virtual-memory-works, how-a-cpu-guesses-ahead, how-cores-share-memory, why-compute-waits-for-memory and why-nvme-is-fast use it since 2026-11-15; older essays do not yet, so add the key the next time one of them
   changes.
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
| storage-over-a-network | computing/systems/storage-over-a-network/ | 11 (`#ch1…#ch11`) | computing | `ESSAY_BASE_URL` |
| how-pcie-works | computing/systems/how-pcie-works/ | 12 (`#ch1…#ch12`) | computing | `ESSAY_BASE_URL` |
| how-a-computer-is-wired | computing/systems/how-a-computer-is-wired/ | 10 (`#ch1…#ch10`) | computing | `ESSAY_BASE_URL` |
| how-thunderbolt-works | computing/systems/how-thunderbolt-works/ | 11 (`#ch1…#ch11`) | computing | `ESSAY_BASE_URL` |
| how-cpu-caches-work | computing/systems/how-cpu-caches-work/ | 12 (`#ch1…#ch12`) | computing | `ESSAY_BASE_URL` |
| how-a-cpu-runs-a-program | computing/systems/how-a-cpu-runs-a-program/ | 12 (`#ch1…#ch12`) | computing | `ESSAY_BASE_URL` |
| how-virtual-memory-works | computing/systems/how-virtual-memory-works/ | 13 (`#ch1…#ch13`) | computing | `ESSAY_BASE_URL` |
| how-a-cpu-guesses-ahead | computing/systems/how-a-cpu-guesses-ahead/ | 12 (`#ch1…#ch12`) | computing | `ESSAY_BASE_URL` |
| how-cores-share-memory | computing/systems/how-cores-share-memory/ | 12 (`#ch1…#ch12`) | computing | `ESSAY_BASE_URL` |

The eleven from 2026-11-11, the two food essays of 2026-11-12 and the five storage essays of 2026-11-14/15
(what-a-drive-is-made-of, how-sata-works, how-sas-works, how-usb-drives-talk, storage-over-a-network) and the three bus essays of
2026-11-15 (how-pcie-works, how-a-computer-is-wired, how-thunderbolt-works) and the architecture essays how-cpu-caches-work,
how-a-cpu-runs-a-program, how-virtual-memory-works, how-a-cpu-guesses-ahead and how-cores-share-memory (2026-11-15) were built by Claude Code (claude-opus-5-5). The English copy was drafted by Claude
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
labels shrink to about 8 px. Alias move (2026-11-15, A1 registration): 指令集 / instruction set, CPU 怎么执行程序 / how a CPU
runs a program and 机器码 / machine code left #ch9, and 流水线 / pipelining left #ch11 (with 指令流水线 and CPU 流水线 from
atlas/graph/aliases.json), all for how-a-cpu-runs-a-program; #ch9 keeps 程序计数器, 取指 译码 执行 / fetch decode execute,
冯·诺依曼结构 and 计算机怎么执行指令, #ch4 keeps 关键路径 / critical path, #ch11 keeps plain 缓存 / cache. Its label was repointed for
the first time (c0cc5c40, original and previous 9451df5d); only REGISTRY.json changed and it is a Claude Code edition, so
no review note. 取指 译码 执行 was also an alias of why-compute-waits-for-memory #ch1, which won the zh tie; the A4/A5 registrar
removed it there (2026-11-15), so it lands on #ch9 (pinned in tests/concept-search.cjs).

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
how-hybrid-attention-remembers). On 2026-11-15 the A2 registrar moved L1 L2 L3 缓存, 缓存行, 组相联缓存, cache line and set
associative cache from its #ch2 to how-cpu-caches-work (team-lead decision in TASK-arch-series.md), appended one sentence to
ch2.p3 linking that essay, gave its scripts `?v=20261115` and repointed the label to that commit (88dafe9c) with
specs/reviews/why-compute-waits-for-memory-alias-move-20261115.md as evidence (the edition stays Antigravity's). #ch2 keeps
缓存命中率, cache hierarchy, 按行遍历 按列遍历, 空间局部性 / spatial locality, row major vs column major and the latency ladder.
On 2026-11-15 the A4/A5 registrar removed 取指 译码 执行 from #ch1 (it tied with switches-that-compute #ch9 and won the zh
query for a chapter about stalls) and repointed the label to that commit (d34e98bb, previous 88dafe9c) with
specs/reviews/why-compute-waits-for-memory-fetch-decode-alias-20261115.md as evidence; no script changed (keys stay `?v=20261115`).
#ch1 keeps the stall, forwarding, load-use, CPI and "instruction pipeline" words.

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
with specs/reviews/why-nvme-is-fast-cache-key-20261115.md as evidence. On 2026-11-15 the bus-series registrar linked the
existing word PCIe in ch2.p2 to how-pcie-works #ch2, moved its scripts to `?v=20261115b` and repointed the label to that
commit (4353c314) with specs/reviews/why-nvme-is-fast-pcie-link-20261115.md as evidence. It keeps the storage-specific
PCIe words (PCIe 4.0 5.0 6.0 SSD 速度, PCIe vs SATA bandwidth, MSI-X 中断; plain "MSI-X" opens its #ch4); the generic ones
belong to how-pcie-works.

### what-a-drive-is-made-of: 硬盘里到底是什么

Storage series S1 (specs/essay-briefs/TASK-storage-series.md, Yangyu 2026-11-14). A hard disk and an SSD hold
completely different things, yet the computer reads both the same way: numbered blocks and 512e read-modify-write,
seek and rotation (Ruemmler & Wilkes fitted to the Barracuda 7200.12), shingled recording, flash voltage levels and
RBER, endurance from the ECC model and the lifetime equation (Cai et al. 2017; σ0 and k solved so MLC = 3,000 and
TLC = 1,000 P/E, the page says so), a page-mapped FTL, the five-layer interface map (form factor, connector, link,
transport, command set), latency against bandwidth, a dated frontier and three closing questions. It owns the
SSD-vs-HDD words (固态硬盘为什么比机械硬盘快, 机械硬盘和固态硬盘区别, SSD vs HDD, SSD at #ch8) and the seek-time words
(#ch2). Ch7 links how-sata-works, how-sas-works #ch7, how-usb-drives-talk and (since 2026-11-15) storage-over-a-network. SAS 和 SATA 能混用吗 / can SAS and SATA mix left its #ch7 for how-sas-works #ch7 on 2026-11-15; it keeps
移动硬盘盒怎么工作 (#ch7). Atlas edges: 4 between chapters, 2 to
why-nvme-is-fast (#ch1, #ch6).
Since the bus series (2026-11-15) ch7.p4 links the word PCIe to how-pcie-works; scripts at `?v=20261115c`.

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
Since 2026-11-15 ch10.q2 links how-usb-drives-talk #ch6 and ch10.links links that essay as well, and storage-over-a-network.
Since the bus series (2026-11-15) ch2.limit has one more sentence linking how-a-computer-is-wired #ch2 (loading and
reflections on the PCI bus); scripts at `?v=20261115c`.

### how-sas-works: 服务器硬盘为什么用 SAS

Storage series S3. The same platters ship as SATA and as SAS drives; why do servers insist on SAS? The SAS layers
(SCSI commands over SSP, SATA over STP, SMP for expanders), the READ(6)/(10)/(16) CDB with its SSP and iSCSI
envelopes, the frames and two connections of one SSP read, dual-port and multipath availability, expander fan-out
(Erlang C against a simulation), wide ports (one connection holds one lane), why a SAS bay takes a SATA drive, T10 PI
and CRC-16/T10-DIF, 24G SAS 128b/150b with RS(30,26) and interleaving, a dated frontier and three spec-sheet
questions. It owns SAS 和 SATA 区别 / SAS vs SATA and SAS 是什么 (#ch1), SCSI 命令 / CDB (#ch2), 双端口硬盘 (#ch4),
SAS 扩展器 (#ch5), T10 PI and 数据完整性校验 (#ch8), 24G SAS (#ch9), and since 2026-11-15 the plug-compatibility questions
(SAS 和 SATA 能混用吗, SAS 盘能插 SATA 口吗, can SAS and SATA mix, SAS drive in SATA port; #ch7), which left S1 #ch7 because
this chapter answers them directly. Ch1.p3 (UAS) links how-usb-drives-talk #ch5 and ch11.links links that essay. Since S5 (2026-11-15) ch1.p3 also links
storage-over-a-network #ch4 (FCP) and #ch3 (iSCSI), and ch11.links that essay, #ch3, #ch4 and #ch7. #ch4 keeps 多路径是什么
and multipath storage; plain 多路径 / multipath went to S5 #ch8. Tuned: the 0.5 µs connection open/close time (saturation at about 16 drives either way, halved or
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
enclosure (#ch1), USB 3.2 Gen 2x2 and 40Gbps (#ch3), 什么是 UASP (#ch5), 硬盘盒发热降速 (#ch7), U 盘为什么慢 and SD 卡速度 (#ch9).
USB4 和雷电区别 / Thunderbolt vs USB4 (and the reversed forms) left #ch8 for how-thunderbolt-works #ch9 on 2026-11-15; #ch8
keeps the enclosure words and PCIe 隧道是什么, and #ch3 gained plain 40Gbps (it tied with how-thunderbolt-works #ch5). 移动硬盘盒怎么工作 stays on S1 #ch7. Tuned: the 50 µs command
round trip and flash first byte, the 4 µs bridge cost per command (the "4 KiB QD32 is chip-bound" sentence depends on
it and the page says so), η = 0.85 and the heat constants; sensitivities are in each chapter's limit paragraph and
pinned. It links S1 #ch7, S2 #ch3, S3 #ch2 and why-nvme-is-fast #ch2, #ch5, #ch6, and since 2026-11-15 storage-over-a-network #ch3
(ch6.p1, ch11.links). Atlas edges: 5 between chapters, 1
from S1, 2 from S2 (#ch3, #ch10), 2 from S3 (#ch2, #ch1), 5 from why-nvme-is-fast (#ch2 three times, #ch5, #ch6).
Since the bus series (2026-11-15) ch8.p1 links how-thunderbolt-works #ch2 and how-pcie-works #ch1, ch8.p2 links
how-thunderbolt-works #ch9; scripts at `?v=20261115c`.
Not verified (BRIEF): the TB3/TB4 ~2,800 MB/s and TB5 enclosure figures (reviews and forums), the ISSCC 2023 paper body,
SAT itself.

### storage-over-a-network: 隔着网线的硬盘

Storage series S5. A disk in another machine used as if it were local: what gets expensive once a drive leaves the box
(round trips, losses, distance at 4.9 µs/km, broken paths), and which side each protocol makes pay. Block, file and
object on the layer map (bytes moved to change k bytes), NAS small-file round trips (Lazowska's asymptotic bounds; NFS
close-to-open from RFC 7530), the iSCSI write path under RFC 7143's keys (R2T, ImmediateData, burst lengths), Fibre
Channel buffer credits against distance (checked against Brocade's per-km rule), a latency budget from SPDK 24.05's
measured fabric round trips, loss under go-back-N, selective repeat and Mathis (RDMA, RoCE v2, PFC), NVMe-oF capsules
(NVMe/TCP 1.1 figures, RoCE v2 headers), multipath with the square-root split, failover and ALUA/ANA, replication against
erasure coding (overhead, MTTDL, Backblaze 2025 AFR), a dated frontier and three questions. It owns the network-storage
words: NAS 和 SAN 区别 / NAS vs SAN, block vs file vs object (#ch1), NAS 用什么协议, NFS 和 SMB 区别 (#ch2), iSCSI (#ch3),
光纤通道 / Fibre Channel (#ch4), 网络存储延迟 (#ch5), RDMA, RoCE (#ch6), NVMe-oF, NVMe over TCP (#ch7), 多路径 / multipath,
ALUA, ANA (#ch8), 三副本, 纠删码, erasure coding vs replication (#ch9). Replication, consensus and latency words stay on
distributed-systems and tcp-congestion. Tuned: switch time 1 µs per traversal, path-2 speed 0.5×, MTTR 24 h (each with
its sensitivity pinned). It links S1 #ch1 and #ch7, S3 #ch2 and #ch4, S4 and its #ch6, why-nvme-is-fast #ch1, #ch3, #ch4
and #ch8, why-compute-waits-for-memory #ch10, tcp-congestion and distributed-systems. Atlas edges: 6 between chapters, 1
from S1, 2 from S3, 2 from why-nvme-is-fast, 1 from tcp-congestion, 1 from distributed-systems. Not verified (BRIEF): the
FC-FS frame layout, MS-SMB2, S3 PUT semantics, several textbooks cited from memory, most frontier dates via two outlets
rather than the primary pages.

### how-pcie-works: PCIe 为什么能一代一代翻倍

Bus series B1 (specs/essay-briefs/TASK-bus-series.md). Graphics cards, SSDs and NICs all sit on PCIe; how did it double six
times from Gen1 to Gen7, and what happens on the wire in one read? The PCIe tree (root complex, switches, endpoints), one
lane and the generation table with the Gen3 decision (8 GT/s scrambled over 10 GT/s 8b/10b, Froelich 2008), TLP bytes and
efficiency against MPS/MRRS (two real header dumps), credit flow control with the modular rule and scaled flow control
(NVIDIA patent US9904653), ACK/NAK replay with go-back-N after Stallings, a depth-first enumerator with BAR sizing and ECAM,
MSI/MSI-X as a memory write (a real lspci record), channel loss budgets and retimers, NRZ vs PAM4 eyes, FLIT mode with FEC
and Das Sharma's latency table, a dated frontier and a closing. Twelve static diagrams (STANDARD §4a). It owns the generic
PCIe words: PCIe / PCI Express, PCIe 是什么 / what is PCIe (#ch1), PCIe 通道 / PCIe lanes, x16 x4 区别, 显卡插 x8 会慢吗,
PCIe 通道不够怎么办, PCIe 4.0 和 5.0 区别 (#ch2), TLP (#ch3), PCIe 流控 (#ch4), PCIe 重传 (#ch5), PCIe 枚举, BAR 是什么 (#ch6),
MSI 中断 (#ch7), 重定时器 / retimer (#ch8), PAM4 (#ch9), FLIT (#ch10), PCIe 7.0 / 8.0 (#ch11); why-nvme-is-fast keeps the
storage-specific ones. Tuned: credit, ACK and FLIT round trips (1000 ns), Gen6/7 package and connector loss (= Gen5), board
Dk (sensitivities stated and pinned). It links why-nvme-is-fast, how-sata-works, how-usb-drives-talk, what-a-drive-is-made-of,
storage-over-a-network, how-sas-works, frequency-response, inside-a-phone, how-a-computer-is-wired (#ch5) and
how-thunderbolt-works. Atlas edges: 7 between chapters, 2 from how-sata-works (#ch3 → #ch2, #ch2 → #ch1), 3 into storage
pages (why-nvme-is-fast #ch2 and #ch4, how-usb-drives-talk #ch8). Not verified (BRIEF): everything from pcisig.com itself
(second-hand via ServeTheHome and eeNews), Gen6/7 loss budgets (vendor material), PAM4 Gray order and FLIT byte-to-interleave
assignment in PCIe 6.0.

### how-a-computer-is-wired: 电脑里的零件是怎么连起来的

Bus series B2. CPU, memory, graphics, disks and USB: which road does each take, and why did one shared bus become a
point-to-point network? Sharing never went away, it moved: PCI 3.0 Table 3-5 reproduced on a shared bus, the Table 7-7
budget against a loaded line (reflected-wave switching, §4.3.6.2), the Intel 875P / ICH5 northbridge era, the memory
controller in the CPU and NUMA with AMD's ISSCC 2018 Zeppelin latencies, today's board (Z890 / AM5) with CPU lanes and a
shared DMI uplink, ring vs mesh on-die networks (closed forms), chiplets and UCIe energy per bit, I²C rise time against
pull-up and bus capacitance (UM10204), a dated frontier (UCIe 4.0 of 2026-11-12, CXL 4.0, DMI 5.0 as a leak) and three
questions. Eight static diagrams. It owns 共享总线, 总线 / computer bus, PCI 总线 (#ch1), 反射波 (#ch2), 北桥, 南桥 /
northbridge, southbridge, FSB (#ch3), NUMA (#ch4), 芯片组 / chipset, PCH, DMI, 主板上的 PCIe 是从哪来的 (#ch5; DMI/PCH/芯片组
had no collision), 环形总线, 网格, NoC (#ch6), UCIe, die-to-die (#ch7), I2C, 上拉电阻, SMBus, SPI (#ch8). **Chiplet words:**
芯粒 and chiplets reach #ch7 through its title only; the unregistered draft tech/semiconductors/why-chips-are-hard lists 芯粒,
小芯片 and chiplets as aliases, and this page's tests reserve them. When that draft is registered, decide where 芯粒 /
chiplets land (its yield chapter explains why designs are split; #ch7 here explains how the pieces talk) and recheck
UCIe / die-to-die. Tuned: tpd 170 ps/in and Z0 60 Ω (the favourable end of the add-in-card ranges; the spec sets none for
system boards), 10 misses in flight per core (stated and pinned). It links how-sata-works #ch2, what-a-drive-is-made-of #ch7, why-nvme-is-fast, how-usb-drives-talk,
why-compute-waits-for-memory #ch4/#ch5, how-pcie-works (#ch1, #ch2, #ch11) and how-thunderbolt-works. Atlas edges: 6
between chapters, 1 from how-sata-works (#ch2), 2 from why-compute-waits-for-memory (#ch4, #ch9), 2 from / to how-pcie-works
(#ch2 → B1 #ch1, B1 #ch2 → #ch5). Not verified (BRIEF): the AMD chipset uplink generation (PCIe 4.0 ×4, press), UCIe 4.0
numbers, the Xeon 6+ launch date.

### how-thunderbolt-works: 雷电接口是怎么工作的

Bus series B6 (requested by Yangyu 2026-11-15). One USB-C cable carries a display, a network card, a disk and power and
chains device after device; what are Thunderbolt and USB4 to each other? The 24 pins of Type-C R2.5 and the CC divider
(Table 4-36), USB4 routers and tunnels with the 4-byte transport header and its HEC (USB4 2.0 Table 5-2, Appendix A), the
connection manager's bandwidth rules (CM Guide 2.0 ch. 6), daisy chains and the depth limit, PAM3 and the 3+1 asymmetric
mode, display bandwidth from CVT-RB2 pixel clocks, USB PD and EPR negotiation (PD r3.3), DMA attacks and the IOMMU
(Thunderclap, Thunderspy), Thunderbolt 4/5 as required-feature profiles of USB4, a dated frontier and a closing. Nine
static diagrams. It owns USB-C 引脚定义 (#ch1), USB4 隧道是什么 (#ch2), 扩展坞带宽怎么分 (#ch3), 雷电串联 / daisy chain
(#ch4), PAM3 (#ch5), USB-C 接显示器, DP Alt Mode (#ch6), USB PD, PD 快充协议, EPR (#ch7; plain 快充 stays with inside-a-phone
and the battery draft), DMA 攻击, IOMMU (#ch8), 雷电 4 和雷电 5 区别, 雷电 5 / Thunderbolt 5, and since 2026-11-15 USB4 和雷电区别
/ Thunderbolt vs USB4 (#ch9, moved from how-usb-drives-talk #ch8, which answered it only for a storage enclosure), 雷电 /
Thunderbolt, 雷电接口是什么, USB-C 能干什么 (#ch11). It links how-usb-drives-talk #ch3 and #ch8 (the single-drive tunnel is
not redone), why-nvme-is-fast #ch2 and #ch4, and how-pcie-works (#ch2 and the page). Atlas edges: 6 between chapters, 3
from how-usb-drives-talk (#ch8 twice, #ch3), 1 from why-nvme-is-fast (#ch4), 1 from how-pcie-works (#ch2), 2 into
how-usb-drives-talk #ch8. Not verified (BRIEF): which DP reservation route a TB4 product uses, the Thunderspy authors'
claim about USB4, USB4's own DMA-protection wording.

### how-cpu-caches-work: CPU 的三级缓存是怎么工作的

Computer architecture series A2 (requested by Yangyu 2026-11-15, specs/essay-briefs/TASK-arch-series.md). Memory takes tens
of nanoseconds and a core does several things a nanosecond: how do caches of tens of KB to tens of MB keep it from waiting,
why three levels, and why each is the size it is? AMAT on Zen 5's documented latencies with Mattson reuse distance, the
tag / index / offset split with a toy direct-mapped cache, associativity and Hill's 3C misses, replacement (LRU, tree-PLRU,
random, SRRIP, BRRIP against Belady), write-back vs write-through with a write buffer, inclusive / non-inclusive / exclusive
L3 and five real cores, why L1 is small (VIPT, page × ways, with the Neoverse V3 and Apple exceptions), next-line and stride
prefetching (and the LRU cliff at distance 5), a first look at MESI with false sharing, the pointer-chase staircase, a dated
frontier and a closing. Eleven static diagrams. Essay commit 476c9f45; label at d34e98bb (previous c0cc5c40). It owns, since 2026-11-15, L1 L2
L3 缓存 / L1 L2 L3 cache and CPU 缓存 / CPU cache (#ch1), 缓存行 / cache line and 直接映射缓存 (#ch2), 组相联缓存 / set
associative cache, 3C, 缓存未命中 / 缓存缺失 (#ch3), LRU, 伪 LRU, RRIP (#ch4), 写回 写直达 (#ch5), 包含式 / 排他式 / 独占式缓存
(#ch6), VIPT and 为什么 L1 这么小 (#ch7), 硬件预取 / cache prefetching (#ch8), 伪共享 / false sharing and MESI 状态 / MESI
states (#ch9), 追指针 / cache latency staircase (#ch10), 3D V-Cache (#ch11), 怎么看 CPU 缓存参数 (#ch12). The first five moved
from why-compute-waits-for-memory #ch2 (team-lead decision); 缓存命中率 and cache hierarchy stay there, plain 缓存 / cache stay
with switches-that-compute #ch11. 缓存一致性 / cache coherence, MESI 协议 and MOESI are left for A5 how-cores-share-memory and
return nothing until it is registered; #ch9 takes only MESI 状态 and false sharing, which it answers. It links
why-compute-waits-for-memory (#ch2, #ch3, #ch4, the page) and switches-that-compute #ch11; that essay's ch2.p3 links back.
switches-that-compute does not link here (its only cache mention is a list item, and its browser test requires 48 × 48
links). A3 is linked since it went live (2026-11-15): ch7.p2 and ch10.limit to how-virtual-memory-works #ch4, ch7.limit and
ch12.links to its page top; A5 is linked since it went live (2026-11-15): ch9.p1 and ch12.links to how-cores-share-memory's page top,
ch9.limit to its #ch3; label at d34e98bb (previous c0cc5c40), scripts `?v=20261115c`. A5 took 缓存一致性 / cache coherence, MESI 协议,
MOESI, MSI 协议 and 总线窥探; #ch9 keeps 伪共享 / false sharing and MESI 状态. Atlas edges: 8 between chapters, 4 from why-compute-waits-for-
memory (#ch2 twice, #ch3, #ch4), 1 from switches-that-compute #ch11. Not verified (BRIEF): Arm's Neoverse V3 TRM (quoted via
jia.je), Intel Xeon 6980P cache, Zen 6 (claimed), Apple's ways and latencies, Skymont L1.

### how-a-cpu-runs-a-program: CPU 是怎么运行一个程序的

Computer architecture series A1 (TASK-arch-series.md). How does a line of code become clock-by-clock work inside a CPU, and
why can the same program run several times faster with different code or a different CPU? The ISA as a contract (diagram),
RV32I registers and the six instruction formats with an encoder/decoder on real bit fields, one C loop hand-compiled three
ways, the single-cycle datapath and control signals, the slowest instruction setting the clock (800/700/600/500 ps), the
five-stage pipeline, data hazards and the forwarding unit, control hazards (stall vs predict-not-taken, EX vs ID), the iron
law over three versions and four machines, CISC vs RISC with six real x86-64 encodings and micro-ops, a dated ISA frontier
(RVA23, Armv9.8, APX/AVX10) and a closing. Eight static diagrams. Essay commit 0daab2e9; label at c0cc5c40 (the alias-move
and one-click commit). It owns, since 2026-11-15, 指令集 / ISA / instruction set, 指令集是什么, CPU 怎么执行程序 / how a CPU runs
a program, x86 和 Arm 区别, 微架构 (#ch1), RISC-V, RISC-V 指令格式, 汇编怎么变成机器码 (#ch2), 机器码 / machine code (#ch3), 数据通路,
单周期 CPU (#ch4), 时钟周期由什么决定 (#ch5), 流水线 / pipelining, 五级流水线, 指令流水线, CPU 流水线 (#ch6), 数据冒险 (#ch7),
控制冒险, 分支为什么慢 (#ch8), 性能铁律 / CPU 性能公式 (#ch9), CISC 和 RISC 区别, 微操作 / µop (#ch10), RVA23 / APX (#ch11). The
ISA, machine-code, title and pipelining words moved from switches-that-compute #ch9 / #ch11 (registrar decision); 关键路径 /
critical path stays on switches #ch4; 流水线气泡, forwarding, load-use hazard, pipeline stall, CPI and "instruction pipeline" stay
on why-compute-waits-for-memory #ch1. The exact English title opens the page top. It links switches-that-compute #ch7 and
#ch9, why-compute-waits-for-memory #ch1 and how-cpu-caches-work; A4 is linked since it went live (2026-11-15): ch6.limit to how-a-cpu-guesses-ahead #ch6, ch8.p3 to #ch2,
ch12.links to its page top (label at d34e98bb, previous c0cc5c40; scripts `?v=20261115b`). Atlas edges: 8 between chapters,
2 from switches-that-compute (#ch9, #ch7), 1 to why-compute-waits-for-memory #ch1. Not verified (BRIEF): the RVA23 PDF date,
P&H's exact first-pipeline text and RISC-V-edition figure, Nova Lake from Intel's own PDF, "a dozen or more cycles" per
mispredict (order of magnitude).

### how-virtual-memory-works: 虚拟内存是怎么工作的

Computer architecture series A3 (TASK-arch-series.md). Every program believes it has a whole memory starting at 0 while
dozens share one; the CPU translates every address, so why is that not slow? First fit vs paging on the same seeded
arrivals, flat vs multi-level page tables, the x86-64 four-level walk bit by bit (SDM Table 5-20) and five-level paging, the
TLB and its reach (Zen 5), the cost of a miss with a page-walk cache, huge pages, page faults and demand paging (EAT),
replacement (FIFO, Clock, LRU, OPT, Belady's anomaly), fork and copy-on-write with mmap, context switches with PCID/ASID,
shootdown and KPTI, nested paging ((n+1)(m+1) − 1), a dated frontier (Linux 6.16, Android 16 KB pages, Arm granules, CXL
demotion) and a closing. Nine static diagrams. Essay commit df11763e; label at c0cc5c40. It owns 虚拟内存 / virtual memory and
为什么需要虚拟内存 (#ch1), 页表 / page table and 多级页表 (#ch2), 四级页表, CR3, 五级分页 (#ch3), TLB 是什么 / what is a TLB (#ch4),
页表遍历缓存 / page walk cache (#ch5), 大页 / huge pages, THP (#ch6), 缺页 / page fault, 按需调页 (#ch7), 页面置换, Belady 异常 /
Belady's anomaly (#ch8), 写时复制 / copy-on-write, fork 为什么快, mmap (#ch9), PCID, KPTI, 上下文切换 TLB (#ch10), 嵌套页表 / nested
paging, EPT (#ch11), 安卓 16 KB 页 (#ch12), dTLB-load-misses (#ch13). Left to their owners: VIPT and Belady 最优替换 / LRU on
how-cpu-caches-work, IOMMU words on how-thunderbolt-works #ch8, NUMA on how-a-computer-is-wired #ch4, CXL 内存池 on
why-compute-waits-for-memory. It links how-cpu-caches-work (#ch4, #ch7, #ch10), why-compute-waits-for-memory #ch2,
how-pcie-works #ch7, how-thunderbolt-works #ch8 and what-a-drive-is-made-of #ch8; how-cpu-caches-work links back (#ch4 and the
page top); how-thunderbolt-works does not (no page-table sentence there). A4 and A5 are linked since they went live (2026-11-15): ch10.p4
to how-a-cpu-guesses-ahead #ch10 (Spectre), ch13.links to both page tops (label at d34e98bb, previous c0cc5c40; scripts
`?v=20261115b`). 推测执行 / speculative execution were never here; they stay on A4 #ch8. Atlas edges: 9 between
chapters, 1 to how-cpu-caches-work #ch7, 3 from how-cpu-caches-work (#ch4, #ch10) and why-compute-waits-for-memory #ch2, 1 from
what-a-drive-is-made-of #ch8, 1 from how-pcie-works #ch7, 1 to how-thunderbolt-works #ch8. Not verified (BRIEF): Zen 5 L2
DTLB associativity, 1 GiB entries and walker count (AMD 58455 not reopened), the 990 PRO and Barracuda figures, the Linux
command lines.

### how-a-cpu-guesses-ahead: CPU 是怎么猜着往前跑的

Computer architecture series A4 (TASK-arch-series.md). A branch takes a dozen cycles to resolve and the CPU does not wait: how
does it guess so well, why can hundreds of instructions be in flight, and why does guessing leak secrets? The cost of a
mispredict on a wide, deep core (CPI = 1/W + f_br × (1 − acc) × penalty, Zen 5), 1-bit and 2-bit counters with the sorted
array, global history and gshare, TAGE in outline (compared with gshare at its best history length), the BTB and return
address stack, superscalar issue, out-of-order execution with renaming against a scoreboard and an in-order core, the reorder
buffer with precise exceptions and squashing, window size against accuracy, a toy Spectre v1 machine (models.js only, no
timers), a dated frontier (Branch Privilege Injection, BTR, CBP2025) and a closing. Eight static diagrams. Essay commit
50a4a3c2; label at d34e98bb (the cross-link and one-click commit), registration in the following commit. It owns 分支预测 /
branch prediction, 分支预测器, 分支预测是什么, 分支预测失败的代价 (#ch1), 两位饱和计数器 / 2 位计数器, 为什么排序后的数组处理更快, 无分支代码
(#ch2), gshare, 全局历史 (#ch3), TAGE (#ch4), BTB, 返回地址栈 / RAS (#ch5), 超标量, ILP, IPC 是什么 (#ch6), 乱序执行, 寄存器重命名,
Tomasulo, 保留站 (#ch7), 重排序缓冲 / ROB, 精确异常, 推测执行 / speculative execution, 内存消歧 (#ch8), 乱序窗口, ROB 大小 (#ch9),
Spectre / 幽灵漏洞, retpoline, Flush+Reload (#ch10), Retbleed, Branch Privilege Injection, CBP2025 (#ch11), 怎么减少分支预测失败 (#ch12).
Left to their owners: 控制冒险, 静态分支预测, 性能铁律 / CPI on how-a-cpu-runs-a-program; pipeline stall and latency hiding on
why-compute-waits-for-memory; KPTI and Meltdown on how-virtual-memory-works #ch10. 推测执行 sits on #ch8 (speculation and
squashing), not #ch10: A3 never carried it, so there was no move to decide. It links how-a-cpu-runs-a-program (#ch8, #ch9),
how-cpu-caches-work (#ch8, #ch10), how-virtual-memory-works (#ch7, #ch10), why-compute-waits-for-memory (#ch1, #ch4) and
how-cores-share-memory #ch8; A1 (ch6.limit, ch8.p3, ch12.links), A3 (ch10.p4, ch13.links) and A5 (ch11.p2, ch12.links) link
here. Scripts `?v=20261115r`. Atlas edges: 8 between chapters, 4 from A1 (#ch8 twice, #ch9, #ch6), 1 from A3 #ch7, 1 from
why-compute-waits-for-memory #ch4, 1 to A3 #ch10. Not verified (BRIEF): AMD 58455 itself (penalty corroborated by a forum
quotation), X925's 768 (WikiChip claim), the original Smith, Yeh & Patt, Tomasulo and Seznec papers.

### how-cores-share-memory: 多个核心怎么共用一块内存

Computer architecture series A5 (TASK-arch-series.md). Eight cores with their own caches must see one memory: how do the others
learn of a change, why do two threads adding a million each not reach two million, and why does a program correct on one CPU
fail on another? Two caches and a stale copy, the two coherence invariants, snooping MSI / MESI / MOESI on one engine,
directories (storage and messages per miss to 256 cores), the lost update counted exactly and simulated, atomic instructions
(LOCK, CAS, LL/SC, LSE), a contended line on measured Bergamo latencies, sequential consistency and the store buffer with a
litmus enumerator checked against the x86-TSO paper, x86 vs Arm fences and acquire/release, lock scaling (TAS, TTAS, ticket,
MCS), a dated frontier and a closing. Twelve static diagrams. Essay commit 445f4b67; label at d34e98bb. It owns 缓存一致性 /
cache coherence (#ch1), 单写多读 / SWMR (#ch2), MESI 协议 / MESI protocol, MOESI, MSI 协议, 总线窥探 / bus snooping (#ch3), 目录协议,
snooping vs directory (#ch4), 竞态条件 / race condition, 为什么多线程加法结果不对, i++ 是线程安全的吗 (#ch5), 原子操作, CAS 比较并交换 /
compare and swap, LL/SC (#ch6), 核间延迟 / core-to-core latency (#ch7), 顺序一致性, 内存模型 / memory model, 存储缓冲 (#ch8), TSO,
内存屏障 / memory barrier, x86 和 ARM 内存序, acquire release (#ch9), 自旋锁, MCS 锁 (#ch10), 一致性域 (#ch11), 多线程共享变量怎么写
(#ch12). These coherence words were unowned until now (TASK-arch-series.md left them for A5). Left to their owners: 伪共享 /
false sharing and MESI 状态 on how-cpu-caches-work #ch9, plain MSI on how-pcie-works #ch7, MSI-X on why-nvme-is-fast, NUMA on
how-a-computer-is-wired #ch4, the replica-consistency words on distributed-systems. It links how-cpu-caches-work (#ch5, #ch9, the
page), how-a-computer-is-wired (#ch4, #ch6, #ch7, the page), why-compute-waits-for-memory #ch5, distributed-systems and
how-a-cpu-guesses-ahead (#ch8, the page); B4 (coherent interconnects, being written) is named in plain text. A2 (ch9.p1, ch9.limit,
ch12.links), A3 ch13.links and A4 ch12.links link here. Scripts `?v=20261115`. Atlas edges: 8 between chapters, 3 from
how-cpu-caches-work (#ch5, #ch9 twice), 3 from how-a-computer-is-wired (#ch4, #ch6, #ch7), 1 from A4 #ch8. Not verified (BRIEF):
the Arm ARM and the RISC-V RVWMO chapter, the Primer, Sewell et al. and Mellor-Crummey & Scott texts, the current Intel SDM
chapter number, Lamport 1979.

### scarcity-moves: 稀缺会搬家

The first essay: ten economic ideas, then applied to AI. It is Chinese only (`languages: ["zh"]`), so in
English mode its card shows a "Chinese only" badge. It stays in the `demos` category. Its REGISTRY.json was written on 2026-11-11 for search (gap audit) and
imported with `--region society` (category `demos` has no region); c15, advice to a student, is not a concept.
