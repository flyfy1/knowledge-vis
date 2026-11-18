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
  In `browser.cjs` the "elements outside the viewport" check skips only elements inside `<defs>` (marker
  shapes are not laid out); it must not skip `e.closest('svg')`, which also exempts the `<svg>` itself, so a
  diagram wider than a 320 px screen would pass (a reviewer forced one SVG to 420 px at 320: 0 failures with
  the skip, 24 without). The clipped-text check has no SVG skip at all. Restored in the five storage essays in
  9fcb9fac and in the other computing/systems essays on 2026-11-16 (specs/reviews/storage-diagrams-s1-s3-review-20261116.md item 4).
  On a template page (specs/site-template.md) `index.html` carries the zh copy pre-filled and generated
  `site.*` keys (breadcrumb, backlinks, related pages). `tests/models.cjs` reads `index.html` through
  `unprefill(html, Z)` from `scripts/lib/prefill.cjs`, which removes exactly the pre-filled values and nothing
  else, so the "no Chinese in index.html" check and the empty-element regexes keep their meaning: a hand-typed
  string, or text in a `data-i18n` element that is not that key's value, still fails. Link counts and literal-number
  scans over the copy table skip `site.*` keys. Added to the computing/systems essays on 2026-11-16 (template
  Phase 1 batch A); a no-op on pages that are not yet converted.

## Files

```
<category>/<subtopic>/<slug>/
  index.html        structure and styles; static provenance label in the hero
  copy.zh.js        every visible string (window.COPY_ZH or similar), key → text/HTML
  copy.en.js        same keys in English
  models.js         pure functions, UMD (page + node)
  app.js            drawing, wiring, i18n, on-screen gating
  REGISTRY.json     the essay's concepts for the atlas and search
                    (index.html also loads ../../../site-nav.css and, last in <body>, site-nav.js:
                    breadcrumb and auto-links, added by scripts/build-site-nav.cjs; specs/site-navigation.md)
  BRIEF.md          builder notes, sources, checked / not checked, review
  tests/models.cjs  tests/browser.cjs
  page.json         once registered: the registry row (slug, kind, title, desc, tags, place, status, order;
                    no "layout"), from which pages.config.js KNOWLEDGE_PAGES is generated (Registering, step 4)
```

**Pages migrated to the site template** (a `page.json` with a `"layout"`; specs/site-template.md) keep
`models.js`, `app.js`, `REGISTRY.json`, `BRIEF.md` and `tests/`. Their text and structure move into sources:

```
  page.json         slug, layout, scripts, version (cache key), provenance note, and the registry fields
                    (place, status, tags, order; title and desc come from the content)
  content.zh.md     the Chinese text (front matter, chapters, ::: strings / lab / diagram / html / footer)
  content.en.md     the same skeleton in English
  page.css          the page's own styles
  figures/*.html    language-neutral partials: labs, diagrams, raw-HTML regions
  bindings.cjs      optional: prose numbers from models.js ({=name})
  index.html copy.zh.js copy.en.js refs.json   GENERATED by scripts/build-pages.cjs; never edit by hand
```

On those pages, edit the Markdown and partials and rebuild (`node scripts/build-pages.cjs <dir>`). Cross-links
are written `[[slug#chN|text]]` and checked at build. The rules above (copy outside the markup, toggle, layout,
tests) still hold, because the build produces the same kind of files. Unmigrated pages keep the layout above.
New essays may be written in either form until Phase 1 ends. The first essay planned directly in Markdown is the
CPU SIMD and floating-point one (HANDOFF.md). The steps for a new template essay, including the draft build from
`REGISTRY.json`, the `app.js` runtime and pre-fill versus CJK tests, are in specs/site-template.md §9a.

`REGISTRY.json`: `slug`, `path`, `category`, `subtopic`, `stage`, `title`/`desc` `{zh,en}` equal to the
page's `doc.title`/`doc.desc`, `tags`, and `concepts[]`. Each concept has `id`, `anchor` (must exist in the
page), `title`, `desc`, `aliases: {zh:[], en:[]}` and `relatedPages`. Aliases are what a confused person
types ("为什么要打疫苗", "how does my phone know where I am"), not only textbook terms.

## Registering an essay

1. **Consistency.** Check that `REGISTRY.json` titles match `doc.title`, that every anchor exists, and that
   any quoted title of another site page matches `pages.config.js` in both languages. For a template page,
   run `node scripts/build-pages.cjs <dir>` and `--all --check`: anchors, refs and zh/en parity are checked
   there. The lint lists exact 《titles》 that are not links yet.
2. **Commit the essay**, alone, with the builder and reviewer trailers taken from its BRIEF.
3. **Provenance.** Add the header label and a `page-provenance.json` entry (`kind: "original"`,
   `sourceRevision` = the essay commit) in a follow-up mechanical commit, and link
   `../../../page-provenance.css`. On a template page the label is rendered from `page-provenance.json` and
   `page.json.provenanceNote`: edit those and rebuild, never the HTML. Do not set `originalSourceRevision` on first labelling:
   `tests/page-provenance-core.cjs` requires it to differ from `sourceRevision`. Add it when the label is
   first repointed.
4. **Register: page.json, not pages.config.js** (Phase 2, 2026-11-16; specs/site-template.md §3b). The
   `KNOWLEDGE_PAGES` block of `pages.config.js` is generated: do not add or edit a row there by hand
   (`node scripts/build-registry.cjs --check` fails, and the next run drops the row).
   - Hand-edited, as before: a new category in `KNOWLEDGE_CATEGORIES` and subtopic in `KNOWLEDGE_SUBTOPICS`, plus a
     `<category>/index.html` redirect (copy `probability/index.html`); append the slug to `window.KNOWLEDGE_ESSAYS`.
   - **A hand-written essay** (the old pattern, e.g. the 17 drafts): create `<category>/<subtopic>/<slug>/page.json`
     with the metadata only, copying title, desc and tags from its `REGISTRY.json`:
     ```json
     {"slug": "<slug>", "kind": "essay",
      "title": {"zh": "…", "en": "…"}, "desc": {"zh": "…", "en": "…"},
      "tags": [{"zh": "…", "en": "…"}],
      "category": "<category>", "subtopic": "<subtopic>", "stage": "university",
      "status": "live", "path": "<category>/<subtopic>/<slug>/"}
     ```
     No `"layout"` (that would make it a template page). Add `"languages": ["zh"]` if there is no English yet. Leave
     `"order"` out: the page goes after every registered page.
   - **A template essay** (content.zh.md): its `page.json` already exists; add `"category"`, `"subtopic"`,
     `"stage"`, `"status": "live"`, `"path"` and `"tags"`. Title and desc stay in the content. A registered page may
     not have `"languages": {"en": "stub"}` (build error).
   - Then run `node scripts/build-registry.cjs`. It rewrites the KNOWLEDGE_PAGES block, `site-registry.json`, the
     CONCEPT-MAP.md page → concept section and `specs/atlas-edge-todo.md`; commit them with the page.json.
     If you already pasted a row into pages.config.js, `node scripts/build-registry.cjs --adopt` moves it into a
     page.json.
   - Then `node scripts/build-site-nav.cjs` (adds the site-nav include to the page, the subtopic redirect stub and the
     page to `site-nav-data.js`) and `node tests/site-nav.cjs`; see specs/site-navigation.md. A template page gets
     its include lines from the layout, and build-site-nav never edits it. After registering any page, run
     `node scripts/build-pages.cjs --all`, because template pages list their backlinks. On a hand-written page,
     quoting another page's exact title in 《》 / “” makes it a link automatically.
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
   were already deployed under today's key, append a letter (`?v=20261115b`, then `c`) so the new key differs.
   On a template page the key is `page.json.version`; set it and rebuild. The
   storage essays (what-a-drive-is-made-of, how-sata-works, how-sas-works, how-usb-drives-talk, storage-over-a-network),
   the bus essays (how-pcie-works, how-a-computer-is-wired, how-thunderbolt-works, how-memory-talks, coherent-interconnects), how-cpu-caches-work, how-a-cpu-runs-a-program, how-virtual-memory-works, how-a-cpu-guesses-ahead, how-cores-share-memory, how-a-gpu-computes, how-a-computer-boots, how-the-os-talks-to-hardware, how-pixels-reach-a-screen, how-power-reaches-the-cpu, how-a-nic-moves-packets, why-compute-waits-for-memory and why-nvme-is-fast use it since 2026-11-15, switches-that-compute since 2026-11-16 (template pages, including how-a-cpu-does-math, through page.json.version); older essays do not yet, so add the key the next time one of them
   changes.
8. **CONCEPT-MAP.md and the registry.** After the atlas import (step 5), run `node scripts/build-registry.cjs` again:
   the page → concept → anchor table in CONCEPT-MAP.md is generated from the atlas, so do not hand-write rows for
   the essay. Its links that no atlas edge covers appear in `specs/atlas-edge-todo.md` (D9); write an edge only
   where the reason holds (step 5). `node scripts/build-registry.cjs --check` must pass before committing.

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
| how-a-cpu-does-math | computing/systems/how-a-cpu-does-math/ | 13 concepts in 14 chapters (`#ch1…#ch13`) | computing | `ESSAY_BASE_URL` |
| how-memory-talks | computing/systems/how-memory-talks/ | 12 (`#ch1…#ch12`) | computing | `ESSAY_BASE_URL` |
| coherent-interconnects | computing/systems/coherent-interconnects/ | 13 (`#ch1…#ch13`) | computing | `ESSAY_BASE_URL` |
| how-a-gpu-computes | computing/systems/how-a-gpu-computes/ | 12 (`#ch1…#ch12`) | computing | `ESSAY_BASE_URL` |
| how-a-computer-boots | computing/systems/how-a-computer-boots/ | 14 (`#ch1…#ch14`) | computing | `ESSAY_BASE_URL` |
| how-the-os-talks-to-hardware | computing/systems/how-the-os-talks-to-hardware/ | 14 (`#ch1…#ch14`) | computing | `ESSAY_BASE_URL` |
| how-pixels-reach-a-screen | computing/systems/how-pixels-reach-a-screen/ | 13 (`#ch1…#ch13`) | computing | `ESSAY_BASE_URL` |
| how-power-reaches-the-cpu | computing/systems/how-power-reaches-the-cpu/ | 12 (`#ch1…#ch12`) | computing | `ESSAY_BASE_URL` |
| how-a-nic-moves-packets | computing/systems/how-a-nic-moves-packets/ | 14 (`#ch1…#ch14`) | computing | `ESSAY_BASE_URL` |
| how-a-chatbot-writes | computing/ml/how-a-chatbot-writes/ | 9 (`#ch1…#ch9`) | computing | `ESSAY_BASE_URL` |
| what-a-frontier-model-takes | computing/ml/what-a-frontier-model-takes/ | 17 concepts in 13 chapters (`#ch1…#ch13`) | computing | `ESSAY_BASE_URL` |
| a-secret-in-public | computing/systems/a-secret-in-public/ | 11 concepts (`#ch1…#ch10`, `#mod`) | computing | `ESSAY_BASE_URL` |
| what-quantum-computers-do | computing/quantum/what-quantum-computers-do/ | 12 (`#ch1…#ch12`) | computing | `QC_BASE_URL` |
| why-chips-are-hard | tech/semiconductors/why-chips-are-hard/ | 11 concepts in 12 chapters (`#ch1…#ch11`) | tech | `ESSAY_BASE_URL` |
| why-fusion-is-hard | physics/modern/why-fusion-is-hard/ | 11 (`#ch1…#ch11`) | circuits | `ESSAY_BASE_URL` |
| why-batteries-hold-so-little | chemistry/reactions/why-batteries-hold-so-little/ | 9 concepts in 10 chapters (`#ch1…#ch9`) | matter | `ESSAY_BASE_URL` |
| why-atoms-stick-together | chemistry/matter/why-atoms-stick-together/ | 15 concepts in 11 chapters (`#ch1…#ch11`) | matter | `ESSAY_BASE_URL` |
| why-one-rate-moves-everything | economics/money/why-one-rate-moves-everything/ | 12 concepts in 13 chapters (`#ch1…#ch12`) | society | `ESSAY_BASE_URL` |

The eleven from 2026-11-11, the two food essays of 2026-11-12 and the five storage essays of 2026-11-14/15
(what-a-drive-is-made-of, how-sata-works, how-sas-works, how-usb-drives-talk, storage-over-a-network) and the three bus essays of
2026-11-15 (how-pcie-works, how-a-computer-is-wired, how-thunderbolt-works, and later how-memory-talks and coherent-interconnects) and the architecture essays how-cpu-caches-work,
how-a-cpu-runs-a-program, how-virtual-memory-works, how-a-cpu-guesses-ahead, how-cores-share-memory, how-a-gpu-computes, how-a-computer-boots, how-the-os-talks-to-hardware, how-pixels-reach-a-screen, how-power-reaches-the-cpu and how-a-nic-moves-packets (2026-11-15), and how-a-cpu-does-math (2026-11-16, the first essay written directly in the Markdown site template) were built by Claude Code (claude-opus-5-5). The English copy was drafted by Claude
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
SIMD/float registrar (2026-11-16): bare 浮点数 and IEEE 754 left #ch10 for how-a-cpu-does-math #ch1; #ch10 keeps 0.1 + 0.2, 浮点误差, 精度丢失, rounding error, double vs float. New ch10.see line (a 48 px .see link like ch3/ch5) to that essay's #ch1. Scripts get their first cache key, `?v=20261116`. Label at 1ef6c3b9 (previous 70d9f2e1).

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
On 2026-11-15 the B3/B4 registrar moved NVLink 带宽 / NVLink vs PCIe from #ch9 to coherent-interconnects #ch8 and CXL 内存池 / CXL
memory pooling from #ch10 to coherent-interconnects #ch6 (team-lead decision: B4 answers both in depth); #ch9 keeps HBM, CoWoS and the
energy words, #ch10 keeps HBM4, HBM3e, Rubin, co-packaged optics and PIM. ch5.p2's existing words "DDR 内存通道" / "DDR channels" now
link how-memory-talks #ch5. Scripts `?v=20261115b`; label repointed to that commit (52df5521, previous d34e98bb) with
specs/reviews/why-compute-waits-for-memory-cxl-nvlink-alias-move-20261115.md as evidence (the edition stays Antigravity's).
A6/boot registrar (2026-11-15): ch6.p1 links its existing words about warps (足够多独立线程（Warp） / thousands of independent threads (warps)) to how-a-gpu-computes #ch3; label at 4e4585ca (previous 52df5521, original e975710b), evidence specs/reviews/why-compute-waits-for-memory-gpu-link-20261115.md; scripts `?v=20261115c`. #ch6 keeps 张量核 / tensor core and GPU vs CPU (pinned).
Power/NIC registrar (2026-11-15): ch5.p1 links its words "动态功耗公式" / "dynamic power formula" to how-power-reaches-the-cpu #ch2 and #ch10 gains the alias CPO (note specs/reviews/why-compute-waits-for-memory-power-link-20261115.md); label at d0821bc1 (previous 70d9f2e1), scripts `?v=20261115d`.

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
OS/pixels registrar (2026-11-15): ch7.p2 links its existing words io_uring IOPOLL to how-the-os-talks-to-hardware #ch11; label at e916a267 (previous 70d9f2e1, original fb63041c), evidence specs/reviews/why-nvme-is-fast-os-link-20261115.md; scripts `?v=20261115c`. SPDK and io_uring IOPOLL stay here.

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
A6/boot registrar (2026-11-15): ch1.p3 links its words 分区表 / partition table to how-a-computer-boots #ch7 (GPT, protective MBR); label at 4e4585ca (previous 4353c314), scripts `?v=20261115d`.
Diagram retrofit registrar (2026-11-16): eight static diagrams (STANDARD §4a) added in 9fcb9fac, review specs/reviews/storage-diagrams-s1-s3-review-20261116.md, fixes mirrored in specs/what-a-drive-is-made-of.md; label at 9fcb9fac (previous 70d9f2e1), scripts `?v=20261116a`.

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
Diagram retrofit registrar (2026-11-16): eight static diagrams (STANDARD §4a) added in 9fcb9fac, review specs/reviews/storage-diagrams-s1-s3-review-20261116.md, fixes mirrored in specs/how-sata-works.md; label at 9fcb9fac (previous 70d9f2e1), scripts `?v=20261116a`.
Template Phase 1 batch A (2026-11-16): tests/models.cjs reads index.html through unprefill() and skips generated site.* keys in link/number scans (9a470caf, test only, no-op before conversion). Label at 9a470caf (previous 9fcb9fac), no script change.

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
Diagram retrofit registrar (2026-11-16): ten static diagrams (STANDARD §4a) added in 9fcb9fac, review specs/reviews/storage-diagrams-s1-s3-review-20261116.md, fixes mirrored in specs/how-sas-works.md; label at 9fcb9fac (previous 70d9f2e1), scripts `?v=20261116a`.

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
Diagram retrofit registrar (2026-11-16): nine static diagrams (STANDARD §4a) added in 9fcb9fac, review specs/reviews/storage-diagrams-s4-s5-review-20261116.md, fixes mirrored in specs/how-usb-drives-talk.md; label at 9fcb9fac (previous 70d9f2e1), scripts `?v=20261116d`.
Template Phase 1 batch A (2026-11-16): tests/models.cjs reads index.html through unprefill() and skips generated site.* keys in link/number scans (9a470caf, test only, no-op before conversion). Label at 9a470caf (previous 9fcb9fac), no script change.

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
OS/pixels registrar (2026-11-15): ch6.p1 links how-the-os-talks-to-hardware #ch12 (kernel bypass inside one machine); RDMA 是什么 / RDMA and "kernel bypass zero copy" stay on #ch6 here (pinned), plain "kernel bypass" / 内核旁路 open the OS essay #ch12. Label at e916a267 (previous 70d9f2e1), scripts `?v=20261115b`.
Power/NIC registrar (2026-11-15): ch6.p1 links how-a-nic-moves-packets #ch11; #ch6 gains bare RDMA (it tied with the NIC essay's #ch11). Label at d0821bc1 (previous e916a267), scripts `?v=20261115c`.
Diagram retrofit registrar (2026-11-16): ten static diagrams (STANDARD §4a) added in 9fcb9fac, review specs/reviews/storage-diagrams-s4-s5-review-20261116.md, fixes mirrored in specs/storage-over-a-network.md; label at 9fcb9fac (previous d0821bc1), scripts `?v=20261116d`.
Template Phase 1 batch A (2026-11-16): tests/models.cjs reads index.html through unprefill() and skips generated site.* keys in link/number scans (9a470caf, test only, no-op before conversion). Label at 9a470caf (previous 9fcb9fac), no script change.

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
assignment in PCIe 6.0. B4 is linked since it went live (2026-11-15): ch11.e3 (CXL 4.0) gains one sentence linking coherent-interconnects
#ch3; label at 52df5521 (previous 4353c314), scripts `?v=20261115b`. The CXL words (什么是 CXL, CXL 是什么, what is CXL) it reserved are B4's.
A6/boot registrar (2026-11-15): ch6.limit gains one sentence linking how-a-computer-boots #ch6 (where in the boot the firmware enumerates); PCIe 枚举 / PCIe enumeration stay on #ch6 here (pinned). Label at 4e4585ca (previous 52df5521), scripts `?v=20261115c`.
OS/pixels registrar (2026-11-15): ch6.p5 links how-the-os-talks-to-hardware #ch4 (registers behind a BAR) and ch7.p3 its #ch5 (the interrupt path after MSI); MSI / MSI-X stay on #ch7 here. Label at e916a267 (previous 70d9f2e1), scripts `?v=20261115d`.
Power/NIC registrar (2026-11-15): #ch3 gains PCIe 开销 / PCIe overhead, PCIe bandwidth (REGISTRY only; the NIC essay's #ch4 phrases contain them). #ch10 has no NIC sentence and is not linked. Label at d0821bc1 (previous e916a267), scripts unchanged.
SVG-check registrar (2026-11-16): browser.cjs clipped-text check loses its never-firing SVG skip in c3cef443 (test only, page passes at 1280/390/320 zh+en); label at c3cef443 (previous d0821bc1), no script change.
Template follow-up (2026-11-16): tests/models.cjs reads index.html through unprefill(html, Z), skips the generated site.* keys in the unused-key, sibling-link and en/zh href checks, and takes the cache key from page.json.version on a template page (as batch A, 9a470caf). Label at b44d5f06 (previous c3cef443), no script change. Converted to template sources in 50e7421e (mechanical; version 20261116a).

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
numbers, the Xeon 6+ launch date. B4 is linked since it went live (2026-11-15): ch9.d2 links coherent-interconnects #ch3 where it
said the series might cover CXL later; ch8.p5 (B5, small buses) stays plain text. Label at 52df5521 (previous 4353c314), scripts
`?v=20261115b`; the reserved CXL / NVLink words are B4's, 内存频率 / CL 值 are B3's.
A6/boot registrar (2026-11-15): ch8.p5 links its words BIOS 闪存 / the BIOS flash to how-a-computer-boots #ch3; plain SPI / SPI bus stay on #ch8 here (pinned) while the boot essay takes SPI 闪存 / SPI flash / quad SPI read. Label at 4e4585ca (previous 52df5521), scripts `?v=20261115c`.
SVG-check registrar (2026-11-16): browser.cjs outside-viewport check skips only <defs> again (not the <svg>), clipped-text SVG skip removed in c3cef443 (test only, page passes at 1280/390/320 zh+en); label at c3cef443 (previous 70d9f2e1), no script change.
Template Phase 1 batch A (2026-11-16): tests/models.cjs reads index.html through unprefill() and skips generated site.* keys in link/number scans (9a470caf, test only, no-op before conversion). Index markup normalised in bb10f897 (prose-column </div> on its own line and the missing </head>; no rendered change). Label at 9a470caf (previous c3cef443), no script change.
Nine-essay registrar (2026-11-18): ch7.p1 links why-chips-are-hard #ch10 (the yield arithmetic behind chiplets); tests/models.cjs requires it. Chiplet words (芯粒, chiplet, chiplets) stay on #ch7 (pinned). page.json version 20261118a; label at 3a4bbfb6 (previous 9a470caf).

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
OS/pixels registrar (2026-11-15): ch8.p2 links how-the-os-talks-to-hardware #ch8; ch6.p1 links how-pixels-reach-a-screen #ch2 and ch6.p4 its #ch7. #ch6 takes bare DSC, 显示流压缩 and Display Stream Compression (unowned; the pixels essay left the DSC definitions here). Label at e916a267 (previous 70d9f2e1), scripts `?v=20261115b`.
**FEC fix (2026-11-15, power/NIC registrar):** DSC on an 8b/10b DP link (Alt Mode HBR2/HBR3, the DP 1.4 stream in a TB4 tunnel) runs with FEC, (256·6 + 1)/(256·250) = 2.4016 % (Linux drm_dp_bw_overhead, i915 intel_dp_supports_dsc; specs/reviews/how-pixels-reach-a-screen-review-20261115.md finding 3). `SCREEN.fecK` applies it only to those links and only to a DSC setting (bpp < 18): Alt Mode capacity 25.92 → 25.31 Gb/s, Max Link BW gives the stream 1/k of the reserved link, allocation mode reserves need × k; UHBR (77.37) already includes FEC. ch6.p4 now computes 8K60 30-bit with FEC: HBR3 ×4 leaves {hbr3fec} = 25.31 Gb/s, so DSC must reach ≤ 12.2 bpp (×2.45; 12.5 without FEC); the 12-bit example still fits. The figure differs from how-pixels-reach-a-screen's 10.63 bpp because that page uses the CTA-861 8K60 timing, this one CVT-RB2. ch6.limit says what is modelled; the #scD readout uses `SCREEN.bppMax`. Scripts `?v=20261115c`.
SVG-check registrar (2026-11-16): browser.cjs clipped-text check loses its never-firing SVG skip in c3cef443 (test only, page passes at 1280/390/320 zh+en); label at c3cef443 (previous 93d7b195), no script change.
Template Phase 1 batch A (2026-11-16): tests/models.cjs reads index.html through unprefill() and skips generated site.* keys in link/number scans (9a470caf, test only, no-op before conversion). Index markup normalised in bb10f897 (blank lines before </section>; no rendered change). Label at 9a470caf (previous c3cef443), no script change.

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
ch9.limit to its #ch3; B3 is linked since it went live (2026-11-15): one clause in ch12.links to how-memory-talks; label at 52df5521
(previous d34e98bb), scripts `?v=20261115d`. A5 took 缓存一致性 / cache coherence, MESI 协议,
MOESI, MSI 协议 and 总线窥探; #ch9 keeps 伪共享 / false sharing and MESI 状态. Atlas edges: 8 between chapters, 4 from why-compute-waits-for-
memory (#ch2 twice, #ch3, #ch4), 1 from switches-that-compute #ch11. Not verified (BRIEF): Arm's Neoverse V3 TRM (quoted via
jia.je), Intel Xeon 6980P cache, Zen 6 (claimed), Apple's ways and latencies, Skymont L1.
SVG-check registrar (2026-11-16): browser.cjs outside-viewport check skips only <defs> again (not the <svg>), clipped-text SVG skip removed in c3cef443 (test only, page passes at 1280/390/320 zh+en); label at c3cef443 (previous 70d9f2e1), no script change.
Template Phase 1 batch A (2026-11-16): tests/models.cjs reads index.html through unprefill() and skips generated site.* keys in link/number scans (9a470caf, test only, no-op before conversion). Label at 9a470caf (previous c3cef443), no script change.
SIMD/float registrar (2026-11-16): only the generated linked-from rows changed (how-a-cpu-does-math ch10 links #ch2); page.json version 20261116b, label not repointed (generated backlinks are mechanical, D4).

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
SVG-check registrar (2026-11-16): browser.cjs outside-viewport check skips only <defs> again (not the <svg>), clipped-text SVG skip removed in c3cef443 (test only, page passes at 1280/390/320 zh+en); label at c3cef443 (previous 70d9f2e1), no script change.
Template Phase 1 batch A (2026-11-16): tests/models.cjs reads index.html through unprefill() and skips generated site.* keys in link/number scans (9a470caf, test only, no-op before conversion). Label at 9a470caf (previous c3cef443), no script change.
SIMD/float registrar (2026-11-16): ch11.e2 links how-a-cpu-does-math #ch9 (vector and matrix instructions) and ch12.links its page top, as [[refs]]; tests/models.cjs also scans double-quoted [[ref]] links outside site.* rows. Label at 1ef6c3b9 (previous 144500ef), page.json version 20261116b.

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
OS/pixels registrar (2026-11-15): ch10.limit links how-the-os-talks-to-hardware #ch3 (the cost of one crossing) and ch11.p3 its #ch8 (the IOMMU mappings a driver makes). Label at e916a267 (previous 70d9f2e1), scripts `?v=20261115c`.
SVG-check registrar (2026-11-16): browser.cjs outside-viewport check skips only <defs> again (not the <svg>), clipped-text SVG skip removed in c3cef443 (test only, page passes at 1280/390/320 zh+en); label at c3cef443 (previous e916a267), no script change.
Template Phase 1 batch A (2026-11-16): tests/models.cjs reads index.html through unprefill() and skips generated site.* keys in link/number scans (9a470caf, test only, no-op before conversion). Index markup normalised in bb10f897 (a blank line in <head>; no rendered change). Label at 9a470caf (previous c3cef443), no script change.

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
SVG-check registrar (2026-11-16): browser.cjs outside-viewport check skips only <defs> again (not the <svg>), clipped-text SVG skip removed in c3cef443 (test only, page passes at 1280/390/320 zh+en); label at c3cef443 (previous 70d9f2e1), no script change.
Template Phase 1 batch A (2026-11-16): tests/models.cjs reads index.html through unprefill() and skips generated site.* keys in link/number scans (9a470caf, test only, no-op before conversion). Label at 9a470caf (previous c3cef443), no script change.
SIMD/float registrar (2026-11-16): only the generated linked-from rows changed (how-a-cpu-does-math ch9 links #ch2); page.json version 20261116b, label not repointed (generated backlinks are mechanical, D4).

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
how-a-cpu-guesses-ahead (#ch8, the page) and, since B4 went live (2026-11-15), coherent-interconnects (ch11.p2 and ch12.links, page top;
label at 52df5521, previous d34e98bb). A2 (ch9.p1, ch9.limit,
ch12.links), A3 ch13.links and A4 ch12.links link here. Scripts `?v=20261115b`. Atlas edges: 8 between chapters, 3 from
how-cpu-caches-work (#ch5, #ch9 twice), 3 from how-a-computer-is-wired (#ch4, #ch6, #ch7), 1 from A4 #ch8. Not verified (BRIEF):
the Arm ARM and the RISC-V RVWMO chapter, the Primer, Sewell et al. and Mellor-Crummey & Scott texts, the current Intel SDM
chapter number, Lamport 1979.
A6/boot registrar (2026-11-15): ch12.links gains one clause linking how-a-gpu-computes #ch10 (why GPU L1s are not kept coherent); 缓存一致性 / cache coherence stay on #ch1 here (pinned; A6 #ch10 has only "GPU cache coherence"). Label at 4e4585ca (previous 52df5521), scripts `?v=20261115c`.
SVG-check registrar (2026-11-16): browser.cjs outside-viewport check skips only <defs> again (not the <svg>), clipped-text SVG skip removed in c3cef443 (test only, page passes at 1280/390/320 zh+en); label at c3cef443 (previous 70d9f2e1), no script change.
Template Phase 1 batch A (2026-11-16): tests/models.cjs reads index.html through unprefill() and skips generated site.* keys in link/number scans (9a470caf, test only, no-op before conversion). Index markup normalised in bb10f897 (whitespace-only lines before </section>; no rendered change). Label at 9a470caf (previous c3cef443), no script change.

### how-a-cpu-does-math: CPU 是怎么算小数的，又怎么一次算一排

Architecture series, the SIMD / floating-point essay the A6 builder asked for (TASK-arch-series.md follow-ups), and the first essay
written directly in the Markdown site template (content.zh.md / content.en.md → scripts/build-pages.cjs; specs/site-template.md §9a).
Fourteen chapters: the three fields of binary32 with an exact BigInt encoder, ulp spacing and the float clock, rounding modes with
guard / round / sticky, subnormals, NaN and infinity with FTZ, cancellation and summation (naive, pairwise, Kahan), FMA, FP16 / BF16 /
FP8 with a generated format table, INT8 and OCP MX block scaling (an outlier of 1000 in MXFP8 is stored as 896), SIMD lanes and masks,
auto-vectorisation, FMA latency and throughput with AVX-512 frequency licences, SVE / SME / AMX, a dated frontier and three closing
questions. 14 labs, 13 static SVG diagrams (wide and narrow variants generated by tools/diagrams*.cjs); bindings.cjs carries 106
model-computed numbers into the prose. Essay commit b6dcadc4 (English by Claude Code, claude-haiku-5-5); registration and cross-links
c7795a74 + 1ef6c3b9 (the atlas fragment went in alone by a shell slip); labels and cache keys 3a15d04b; browser-test fix 3d2b65c8
(the hidden zh half of the provenance label is skipped in the English sweep); label at 3d2b65c8 (previous 1ef6c3b9, original b6dcadc4);
page.json version 20261116. Template follow-up (2026-11-16): English-pending state moved from the page-wide `meta.en`
string to page.json `languages` (app.js reads `data-lang-en` on `<html>`), page.json declares `dynamicKeys` and the
diagram generator (`generators`; partials carry a GENERATED header), version 20261116b. Label at 79d42caa (previous 3d2b65c8,
original b6dcadc4). It owns, since 2026-11-16, 浮点数 / floating point / IEEE 754 (moved from switches-that-compute #ch10), 浮点,
浮点数格式, 单精度 双精度, binary32 (#ch1), ulp, machine epsilon (#ch2), 舍入模式, 四舍五入, 随机舍入 (#ch3), 次正规数, NaN, FTZ (#ch4),
Kahan 求和, catastrophic cancellation (#ch5), FMA, 融合乘加 (#ch6), BF16, FP16, 半精度, bare FP8 / E4M3 / E5M2 (#ch7), INT8 量化, MX 格式,
NVFP4, bare FP4 (#ch8), SIMD, AVX-512, NEON, 掩码寄存器 (#ch9), 自动向量化 (#ch10), AVX-512 降频, CPU 算力, multiple accumulators
(#ch11), SVE, SME, AMX (#ch12), AVX10.2, P3109 (#ch13). switches #ch10 keeps 0.1 + 0.2, 浮点误差, rounding error, double vs float;
how-a-gpu-computes #ch8 keeps "FP8 E4M3 E5M2", "FP4 格式", "FP8 formats"; FLOPS stays on why-compute-waits-for-memory #ch7. It links
switches-that-compute (#ch5, #ch10), how-a-cpu-runs-a-program, how-a-cpu-guesses-ahead #ch2, how-cpu-caches-work #ch2,
why-compute-waits-for-memory #ch7 and #ch8, how-a-gpu-computes #ch8 and how-power-reaches-the-cpu #ch2; the draft
what-a-frontier-model-takes is named in plain text in ch14 (link it when that draft is registered). Linked from how-a-gpu-computes ch1
(#ch9) and its ch8 take (#ch7, #ch8), how-a-cpu-runs-a-program ch11.e2 (#ch9) and ch12.links, switches-that-compute ch10.see (#ch1).
Not verified (BRIEF, review): the AVX10.2 rev 7.0 text, P3109 arXiv 2606.04028, Zen 5's 2 × 512-bit loads per cycle (one source),
Intel's AMX ops per cycle (via Wikipedia).
Nine-essay registrar (2026-11-18): ch14.links names what-a-frontier-model-takes as a [[ref]] (it registered). page.json version 20261118a; label at 3a4bbfb6 (previous 79d42caa).

### how-memory-talks: 内存是怎么和 CPU 说话的

Bus series B3 (specs/essay-briefs/TASK-bus-series.md). A DDR5-6400 CL32 module has a bigger latency number than DDR4: is it faster,
what happens inside the module when the CPU asks for one byte, and why does memory still use a wide set of parallel wires? A bit
as a leaking capacitor and what refresh costs (DDR4/DDR5 tRFC, tREFI, FGR, same-bank refresh), banks, rows and columns with a
physical address split bit by bit, the five DRAM commands on a cycle-by-cycle simulator checked against every timing rule (hit,
miss, conflict; open vs close page; FR-FCFS), CL in cycles and nanoseconds on real JEDEC bins and two XMP kits, BL16 and the DDR5
subchannels, bank groups with tCCD_L and tFAW, fly-by routing, DIMMs per channel and training, on-die vs side-band ECC with exact
Hamming enumeration, LPDDR5X, GDDR7 PAM3, CAMM2 and MRDIMM, row hammer with TRR, RFM and PRAC, a dated frontier and a closing.
Eleven static diagrams. Essay commit d165655d; label at 52df5521 (the cross-link, alias and one-click commit). It owns the DDR
words: DRAM 刷新 / DRAM refresh, tRFC, 1T1C (#ch1), 内存 bank 和行, 行缓冲 / row buffer, 内存地址映射 (#ch2), 内存时序 CL-tRCD-tRP,
行命中 行冲突, 开页 关页策略 (#ch3), CL 值, CL 是什么, CL 值越高越慢吗, DDR5 延迟比 DDR4 高吗, 内存频率越高延迟越高吗, CAS latency,
XMP (#ch4), DDR5 子通道, BL16, 内存条峰值带宽 (#ch5), bank 组 / bank groups, tCCD_L, tFAW (#ch6), 内存条插四根为什么降频, 插四根内存为什么
降频, 内存训练, 飞越式拓扑 / fly-by (#ch7), DDR5 自带 ECC 吗, 片上 ECC / on-die ECC, 旁路 ECC, ECC 内存 (#ch8), LPDDR5X, GDDR7, CAMM2,
MRDIMM, GDDR7 为什么用 PAM3 (#ch9), 行锤 RowHammer / row hammer, PRAC, TRR, RFM (#ch10), DDR6, LPDDR6, DDR5-8800 (#ch11), 怎么看内存条参数
(#ch12). Its page tags 内存 / Memory, 内存条 / Memory Modules and DRAM open the page top for those plain words (内存 used to land on
how-virtual-memory-works #ch8, memory on why-compute-waits-for-memory #ch2). **ECC decision:** nothing on the live site owned ECC
内存, so #ch8 takes it (zh). Plain ECC is the elliptic-curve alias of the unregistered draft a-secret-in-public, and ecc memory /
内存纠错ECC sit on the Hamming-code chapter of the unregistered draft how-much-a-wire-can-carry; this page's tests reserve them.
When either draft is registered, decide: ECC memory belongs here (#ch8 compares ECC DIMMs with on-die ECC), plain ECC is ambiguous
(crypto vs error correction). Left to their owners: 内存控制器 / NUMA (how-a-computer-is-wired), 内存墙, 延迟与带宽的区别, HBM
(why-compute-waits-for-memory), PAM3 是什么 (how-thunderbolt-works #ch5), PAM4 / NRZ (how-pcie-works #ch9), CXL words
(coherent-interconnects). It links switches-that-compute #ch6, why-compute-waits-for-memory (#ch2, #ch4, #ch5, #ch9, the page),
what-a-drive-is-made-of #ch4, how-cpu-caches-work (#ch1, the page), how-a-computer-is-wired (#ch2, #ch4), how-sata-works #ch2,
how-pcie-works (#ch2, #ch9, the page), how-thunderbolt-works #ch5 and coherent-interconnects (ch11.c3 #ch5, ch12.links); B4 ch3.p4
(#ch5) and ch13.links, how-cpu-caches-work ch12.links and why-compute-waits-for-memory ch5.p2 (#ch5) link here. Scripts
`?v=20261115r`. Atlas edges (15, in its fragment): 7 between chapters, 1 from why-compute-waits-for-memory #ch2, 1 from
how-cpu-caches-work #ch1, 1 from why-compute-waits-for-memory #ch4, 1 to why-compute-waits-for-memory #ch5, 1 from
how-a-computer-is-wired #ch2, 1 from how-sata-works #ch2, 1 from how-thunderbolt-works #ch5, 1 from how-pcie-works #ch9. Not verified
(BRIEF): the JEDEC documents themselves (403), GDDR7 48 Gb/s per pin, CAMM2 8–128 GB, LPDDR6 rates, RTX 5090 28 Gb/s, GDDR7's PAM3
code table beyond the unused pair.
A6/boot registrar (2026-11-15): ch7.p4 links how-a-computer-boots #ch5 (memory training on the boot timeline); 内存训练 / memory training stay on #ch7 here (pinned). Its tests/models.cjs now requires the provenance label (it forbade it and failed since 011e6f9b). Label at 4e4585ca (previous 52df5521), scripts `?v=20261115s`.
SVG-check registrar (2026-11-16): browser.cjs outside-viewport check skips only <defs> again (not the <svg>), clipped-text SVG skip removed in c3cef443 (test only, page passes at 1280/390/320 zh+en); label at c3cef443 (previous 70d9f2e1), no script change.
Template Phase 1 batch A (2026-11-16): tests/models.cjs reads index.html through unprefill() and skips generated site.* keys in link/number scans (9a470caf, test only, no-op before conversion). Label at 9a470caf (previous c3cef443), no script change.

### coherent-interconnects: 芯片之间怎么共用内存

Bus series B4 (TASK-bus-series.md). A server's CPU, GPUs, accelerators and memory-expansion cards each have their own memory: why do
they all want to share one, how is a cache kept coherent across a PCIe wire, and how are dozens of GPUs joined into one machine?
Copy or share (DMA against CXL.cache by size and requests in flight), coherence across a link with a home agent, the three CXL
protocols and the 68 B / 256 B flit accounting (Das Sharma et al.), the three device types, memory expansion with hot/cold tiering on
measured cards (Liu et al.), pooling and CXL switches (Pond's stranded memory, a Monte Carlo pool), back-invalidate (CXL 3.0, GFAM),
NVLink and NVSwitch generations, ring all-reduce stepped and timed, scale-up vs scale-out with UALink and a hierarchical all-reduce,
coherence inside a package (MI300A, Grace Hopper, NVLink-C2C), a dated frontier and three questions. Ten static diagrams. Essay
commit 0f6572c0; label at 52df5521. It owns 零拷贝 / zero-copy (#ch1), 家代理 / home agent (#ch2), 什么是 CXL, CXL 是什么, plain CXL,
what is CXL, CXL.mem CXL.cache 区别, CXL 帧 (#ch3), CXL Type 3, CXL 设备类型, HDM (#ch4), CXL 内存扩展, CXL 延迟, 冷热分层 (#ch5), CXL
交换机, 多逻辑设备, 内存搁浅, CXL 内存池 / CXL memory pooling, 内存池化 / memory pooling (#ch6), 背向作废 / back-invalidate, GFAM (#ch7),
NVLink 是什么, plain NVLink, NVSwitch, NVL72, NVLink 带宽 / NVLink vs PCIe (#ch8), 环形全归约 / ring all-reduce, all-reduce (#ch9),
scale-up scale-out 区别, UALink, 分层全归约 (#ch10), Grace Hopper, NVLink-C2C, MI300A (#ch11), CXL 4.0, UALink 2.0, Vera Rubin NVL72
(#ch12), 怎么看懂一套互连 (#ch13). **Moves (2026-11-15, team-lead decision):** CXL 内存池 / CXL memory pooling from
why-compute-waits-for-memory #ch10 and NVLink 带宽 / NVLink vs PCIe from its #ch9 (Antigravity edition; note in
specs/reviews/why-compute-waits-for-memory-cxl-nvlink-alias-move-20261115.md); storage-over-a-network #ch10 keeps CXL 内存池和存储有什么
区别. Plain CXL (#ch3) and NVLink (#ch8) were added so the chapter beats the page tags. Left to their owners: 缓存一致性, MESI, 目录协议,
一致性域 (how-cores-share-memory), NUMA, 芯粒 / chiplets, Infinity Fabric (how-a-computer-is-wired), HBM, 共封装光学 / co-packaged
optics (why-compute-waits-for-memory), RDMA, Ultra Ethernet (storage-over-a-network). It links how-pcie-works (#ch3, #ch7, #ch10, the
page), why-compute-waits-for-memory (#ch4, #ch9, #ch10, the page), how-cores-share-memory (#ch1, #ch3, #ch4, #ch7, the page),
how-cpu-caches-work #ch9, how-a-computer-is-wired (#ch4, #ch7, the page), how-virtual-memory-works (#ch12, the page),
storage-over-a-network (#ch6, #ch10) and how-memory-talks (ch3.p4 #ch5, ch13.links); B3 (ch11.c3 #ch5, ch12.links), A5 (ch11.p2,
ch12.links), how-a-computer-is-wired ch9.d2 (#ch3) and how-pcie-works ch11.e3 (#ch3) link here. Scripts `?v=20261115r`. Atlas edges
(26, in its fragment): 9 between chapters, 3 from how-cores-share-memory (#ch3, #ch4, #ch7), 3 from how-pcie-works (#ch3, #ch7,
#ch10), 3 from why-compute-waits-for-memory (#ch4, #ch9, #ch10), 2 from how-memory-talks (#ch5, #ch7), 2 from how-a-computer-is-wired
(#ch4, #ch7), 1 from how-virtual-memory-works #ch12, 1 from storage-over-a-network #ch6, 2 into how-pcie-works #ch11 and
how-a-computer-is-wired #ch9. Not verified (BRIEF): UALink's flit sizes and 2025-04-08 date, Das Sharma Table 4's 256 B CXL.mem
cell, which NVIDIA Rubin figure is final (3,000 vs 3,600 GB/s).
tests/models.cjs requires exactly one page-provenance label since 2026-11-15 (power/NIC registrar; it used to forbid one and failed
since 011e6f9b), as how-memory-talks' test does since 4e4585ca.
Power/NIC registrar (2026-11-15): ch10.limit links how-a-nic-moves-packets #ch12; tests/models.cjs requires the one page-provenance label (888856c4). Label at d0821bc1 (previous 70d9f2e1), scripts `?v=20261115s`.
SVG-check registrar (2026-11-16): browser.cjs outside-viewport check skips only <defs> again (not the <svg>), clipped-text SVG skip removed in c3cef443 (test only, page passes at 1280/390/320 zh+en); label at c3cef443 (previous d0821bc1), no script change.
Template Phase 1 batch A (2026-11-16): tests/models.cjs reads index.html through unprefill() and skips generated site.* keys in link/number scans (9a470caf, test only, no-op before conversion). Label at 9a470caf (previous c3cef443), no script change.

### how-a-gpu-computes: GPU 是怎么算的

Computer architecture series A6 (TASK-arch-series.md). A GPU has tens of thousands of simple cores: how does it split an image or a
matrix multiply across them, and why can a small rewrite make the same code several times slower? Two ways to spend transistors (AMAT
with a cache against Little's law with many threads), grid / block / warp / lane (thread ID = x + y·Dx), a cycle-by-cycle warp scheduler
checked against its closed form plus H100 occupancy limits, branch divergence with an active mask, memory coalescing into 32-byte
sectors, shared-memory bank conflicts (gcd(s, 32), the 33-column pad), tiled matrix multiply on a two-level roofline, tensor cores and
number formats (m16n8k16, peaks against a GEMM roofline on H100 and B200), 2×2 quad shading, the GPU memory hierarchy without L1
coherence, a dated frontier and a checklist. Eleven static diagrams. Essay commit e844143c; label at 4e4585ca (the cross-link, alias and
one-click commit). Review note specs/reviews/how-a-gpu-computes-review-20261115.md. It owns GPU 是怎么工作的 / how does a GPU work, 显卡是怎么
工作的, GPU 为什么快 / why are GPUs fast (#ch1), 线程束 / warp, SIMT, CUDA 线程块 (#ch2), 线程束调度, 占用率 / occupancy (#ch3), 分支发散 / warp
divergence (#ch4), 合并访存 / memory coalescing (#ch5), bank 冲突, GPU 共享内存 / GPU shared memory (#ch6), 共享内存分块, GEMM 怎么写快 (#ch7),
MMA 指令, FP8 E4M3 E5M2, m16n8k16, wgmma (#ch8), quad shading, 2×2 像素组 (#ch9), GPU 内存层次, GPU 为什么不做缓存一致性 / GPU cache coherence
(#ch10), Blackwell Ultra, B300, MI355X, MI455X (#ch11), GPU 代码为什么慢 (#ch12); its page tags GPU and CUDA open the page top. **Near-ties
(2026-11-15, registrar decision after the one-click check):** "GPU cache coherence" is kept, plain cache coherence / 缓存一致性 still open
how-cores-share-memory #ch1; "GPU shared memory" is kept, "shared memory bus bottleneck" still opens why-compute-waits-for-memory #ch5 and
"coherent shared memory" coherent-interconnects #ch1. Plain "shared memory" / 共享内存 had no exact owner (the memory essay #ch5 matched at
75 by prefix); they now open #ch6 through its title 共享内存的 bank 冲突, not through the alias. Left to their owners: 张量核 / tensor core,
GPU vs CPU, 为什么 AI 用 GPU, roofline, HBM (why-compute-waits-for-memory), 渲染管线 / 光栅化 (computer-graphics), NVLink, all-reduce
(coherent-interconnects), GDDR7 (how-memory-talks). It links why-compute-waits-for-memory (#ch3, #ch4, #ch6–#ch9, the page),
how-cpu-caches-work #ch1, how-a-cpu-guesses-ahead #ch9, how-cores-share-memory (#ch3, #ch4), how-pcie-works, how-memory-talks #ch9,
coherent-interconnects (#ch8, #ch11, the page) and computer-graphics; why-compute-waits-for-memory ch6.p1 (#ch3) and how-cores-share-memory
ch12.links (#ch10) link here. Scripts `?v=20261115r`. Atlas edges (20, in its fragment): 8 between chapters, 3 into #ch1 (how-cpu-caches-work
#ch1, why-compute-waits-for-memory #ch4, how-a-cpu-guesses-ahead #ch9), 2 into #ch7 and 2 into #ch8 from why-compute-waits-for-memory
(#ch3, #ch7; #ch7, #ch6), 1 from its #ch6 into #ch3, 3 into #ch10 (how-cores-share-memory #ch3, #ch4, how-memory-talks #ch9), 1 from
coherent-interconnects #ch8 into #ch11. Not verified (BRIEF): the PTX wgmma operand rules, atomics carried out in L2, Volta's one path
per cycle, the Volkov talk, MI355X figures, the Rubin sparsity label, Narasiman 2011, Fatahalian 2010, Pineda 1988, Williams 2009.
OS/pixels registrar (2026-11-15): ch9.p2 links how-pixels-reach-a-screen #ch1 (the framebuffer); #ch1 takes 显卡 / graphics card (the pixels essay's page tag 显卡 would take bare 显卡). Label at e916a267 (previous 70d9f2e1), scripts `?v=20261115s`.
Power/NIC registrar (2026-11-15): ch11.p2 links how-power-reaches-the-cpu #ch10 (a kilowatt a card). Label at d0821bc1 (previous e916a267), scripts `?v=20261115t`.
SVG-check registrar (2026-11-16): browser.cjs outside-viewport check skips only <defs> again (not the <svg>), clipped-text SVG skip removed in c3cef443 (test only, page passes at 1280/390/320 zh+en); label at c3cef443 (previous d0821bc1), no script change.
Template Phase 1 batch A (2026-11-16): tests/models.cjs reads index.html through unprefill() and skips generated site.* keys in link/number scans (9a470caf, test only, no-op before conversion). Index markup normalised in bb10f897 (its two adjacent <style> blocks merged; no rendered change). Label at 9a470caf (previous c3cef443), no script change.
SIMD/float registrar (2026-11-16): ch1 links how-a-cpu-does-math #ch9 (one slot in a wide vector) and the ch8 take its #ch7 and #ch8 (FP8, FP4 scaling), as [[refs]]; tests/models.cjs also scans double-quoted [[ref]] links outside site.* rows. Bare FP8 / FP4 now land there; #ch8 keeps "FP8 E4M3 E5M2", "FP8 formats", "FP4 格式". Label at 1ef6c3b9 (previous 9a470caf), page.json version 20261116b.

### how-a-computer-boots: 电脑是怎么开机的

Computer architecture series, first of the queued system essays (TASK-arch-series.md). About a dozen seconds pass between the power
button and the login screen: how does a CPU that knows nothing find its first instruction, its memory, its disk and the operating
system, and how does it know what it loads is not malicious? ATX power-on timing and PWR_OK, the x86 reset vector, SPI flash read
timing, the security processors and microcode that wake first, cache as RAM and a boot timeline with S3 / S4 / S0ix, UEFI phases with a
byte-exact ACPI MADT, a GPT builder and parser with real CRC32, the Secure Boot chain with an RSA verifier, revocation (dbx, SBAT,
BootHole, BlackLotus), measured boot with SHA-256 PCR extends, the kernel handoff and INIT-SIPI-SIPI, Arm and Apple boot chains, a dated
frontier (the 2011 certificates expiring in 2026) and three questions. Thirteen static diagrams. Essay commit 509b4d6e; label at 4e4585ca.
Review note specs/reviews/how-a-computer-boots-review-20261115.md. It owns 上电时序 / PWR_OK, 按电源键后发生了什么, 电脑开机过程, 开机过程 /
how does a computer boot, boot process (#ch1), 复位向量 / reset vector, CPU 第一条指令 (#ch2), SPI 闪存 / SPI flash, BIOS 芯片, 四线 SPI 读 /
quad SPI read (#ch3), 硬件信任根, Boot Guard, AMD PSP, Intel CSME, 微码更新 (#ch4), 用缓存当内存, 开机时间都花在哪, 睡眠和休眠的区别 (#ch5),
UEFI, 传统 BIOS 与 UEFI, BIOS 是什么 / BIOS, ACPI 表, MADT (#ch6), GPT 分区表, MBR 与 GPT, EFI 系统分区 (#ch7), 安全启动 / Secure Boot,
安全启动信任链 / Secure Boot chain of trust, shim, db 和 dbx (#ch8), dbx 撤销, BootHole, BlackLotus, SBAT (#ch9), 度量启动, TPM PCR, BitLocker
要恢复密钥 (#ch10), INIT-SIPI-SIPI, 多核启动 (#ch11), TF-A, iBoot, DeviceTree (#ch12), 安全启动证书过期, openSIL, Pluton (#ch13), 电脑开不了机
(#ch14); its page tags 开机 / Booting and 固件 / Firmware open the page top. **Alias decisions (2026-11-15):** #ch8 uses "Secure Boot
chain of trust" / 安全启动信任链 (and keeps 开机信任链), never the bare "chain of trust", which is reserved for the unregistered draft
a-secret-in-public #ch6 (until it registers, a bare query reaches #ch8 only by substring, score 55); #ch3 keeps SPI flash / quad SPI read,
distinct from plain SPI / SPI bus on how-a-computer-is-wired #ch8 (pinned). Bare BIOS used to open a biology page by substring and TF-A
how-memory-talks #ch6 through tFAW; both now land here. Left to their owners: 内存训练 (how-memory-talks #ch7), PCIe 枚举, BAR
(how-pcie-works #ch6), SPI, eSPI, I2C (how-a-computer-is-wired), IOMMU, DMA 攻击 (how-thunderbolt-works #ch8), the signature and hash words
(a-secret-in-public), bare GPT (the language model). It links how-pcie-works #ch6, how-a-computer-is-wired #ch8, how-thunderbolt-works #ch8,
how-memory-talks #ch7, how-virtual-memory-works #ch3, what-a-drive-is-made-of #ch1, how-a-cpu-runs-a-program, how-cores-share-memory and
rsa-encryption; 《当着所有人的面约定一个秘密》 (ch8.p2, ch14.links) stays plain text until a-secret-in-public registers. how-memory-talks ch7.p4
(#ch5), how-pcie-works ch6.limit (#ch6), how-a-computer-is-wired ch8.p5 (#ch3) and what-a-drive-is-made-of ch1.p3 (#ch7) link here. Scripts
`?v=20261115r`. Atlas edges (16, in its fragment): 10 between chapters, 1 each from how-memory-talks #ch7, how-pcie-works #ch6,
how-a-computer-is-wired #ch8, what-a-drive-is-made-of #ch1, how-virtual-memory-works #ch3 and rsa-encryption. Not verified (BRIEF): Boot
Guard, CSME-first and PSP internals, the W25Q256JV command table (not reopened), the ACPI 6.6 date, the openSIL schedule, chipset SPI
limits, the Apple guide wording, the ESET and Eclypsium pages; the stage durations are tuned.
OS/pixels registrar (2026-11-15): ch11.p6 links how-the-os-talks-to-hardware #ch9 (how the initramfs drivers find their devices). Label at e916a267 (previous 70d9f2e1), scripts `?v=20261115s`.
Power/NIC registrar (2026-11-15): ch1.p3 links how-power-reaches-the-cpu #ch4 (the regulator that makes the core voltage); power sequencing and PWR_OK stay here. Label at d0821bc1 (previous e916a267), scripts `?v=20261115t`.
SVG-check registrar (2026-11-16): browser.cjs outside-viewport check skips only <defs> again (not the <svg>), clipped-text SVG skip removed in c3cef443 (test only, page passes at 1280/390/320 zh+en); label at c3cef443 (previous d0821bc1), no script change.
Template Phase 1 batch A (2026-11-16): tests/models.cjs reads index.html through unprefill() and skips generated site.* keys in link/number scans (9a470caf, test only, no-op before conversion). Label at 9a470caf (previous c3cef443), no script change.
Nine-essay registrar (2026-11-18): ch8.p2 and ch14.links now link a-secret-in-public as [[refs]] (it registered); tests/models.cjs requires both links instead of forbidding them. Bare "chain of trust" stays here (#ch8, pinned in concept-search; the new essay dropped that alias). page.json version 20261118a; label at 3a4bbfb6 (previous 9a470caf).

### how-the-os-talks-to-hardware: 操作系统是怎么和硬件说话的

Computer architecture series, queued system essay (TASK-arch-series.md). A read() in a program brings data back from a disk or a network
card within microseconds, yet a user program cannot touch any hardware: how does that line cross the wall, find the right driver and
device, and bring the result back? Privilege levels on x86 rings and Arm exception levels, the system call (register contents on x86-64
and arm64), the cost of a crossing with and without KPTI / PCID, MMIO and port I/O, the path of an interrupt (diagram), interrupts against
polling and NAPI on a seeded simulation, DMA and descriptor rings with wrapping counters, the IOMMU, match / probe / bind with
-EPROBE_DEFER, one read() through every layer, epoll and io_uring, kernel bypass (DPDK, SPDK, VFIO, virtio, SR-IOV), a dated frontier
(Linux 7.4-rc2 / 7.3.4, Rust in the kernel, Google's io_uring bounty) and three questions. Ten static diagrams. Essay commit 20a942e2;
label at e916a267 (the cross-link, alias and one-click commit). Review note specs/reviews/how-the-os-talks-to-hardware-review-20261115.md.
It owns 特权级, 用户态和内核态 / user mode vs kernel mode, ring 0, 操作系统 / operating system, 操作系统怎么和硬件通信 / how does the OS talk to
hardware (#ch1), 系统调用 / system call, what is a syscall (#ch2), 系统调用开销 / syscall cost (#ch3), MMIO 是什么, 端口 I/O / memory-mapped
I/O, port I/O (#ch4), 中断 / interrupt, 中断处理, 软中断, APIC 是什么 (#ch5), NAPI, 中断合并 / interrupt coalescing, 接收活锁 (#ch6), 描述符环,
DMA 是什么 / what is DMA, 直接内存访问 (#ch7), DMA 重映射, IOVA (#ch8), 驱动模型, driver probe, EPROBE_DEFER (#ch9), VFS, 页缓存 / page cache,
O_DIRECT (#ch10), epoll, io_uring, 异步 I/O (#ch11), DPDK, virtio, SR-IOV, 用户态驱动, 内核旁路 / kernel bypass (#ch12), Rust 写驱动 / Rust in
the Linux kernel, io_uring 安全 (#ch13), 程序卡在 I/O 上 (#ch14); its page tags 操作系统, 驱动, 系统调用 / Operating Systems, Device Drivers,
System Calls open the page top. **Alias decisions (2026-11-15, review and registrar):** RDMA / remote direct memory access stay on
storage-over-a-network #ch6; bare DMA is not taken (the unregistered draft why-a-few-firms-win uses it for the Digital Markets Act; on the
live site it ties at 80 between #ch7 and how-pcie-works #ch7, not pinned); "kernel bypass" / 内核旁路 open #ch12 while
storage-over-a-network's "kernel bypass zero copy" opens its #ch6 (both pinned). Left to their owners: IOMMU, DMA 攻击
(how-thunderbolt-works #ch8), MSI / MSI-X, BAR (how-pcie-works), doorbells, SQ/CQ, SPDK and io_uring IOPOLL (why-nvme-is-fast), KPTI, PCID,
page faults (how-virtual-memory-works), 内存屏障 (how-cores-share-memory). It links how-virtual-memory-works (#ch3, #ch4, #ch10),
how-pcie-works (#ch6, #ch7), why-nvme-is-fast (#ch4, #ch7), how-thunderbolt-works #ch8, how-a-computer-boots (#ch6, #ch11, #ch12),
how-cores-share-memory #ch9, how-a-cpu-guesses-ahead #ch10, how-a-cpu-runs-a-program #ch8, how-cpu-caches-work, coherent-interconnects #ch3
and what-a-drive-is-made-of (#ch1, #ch2); 《网页是怎么来到你手机上的》 (ch14.links) stays plain text until tech/networks/how-a-web-page-arrives
registers. how-virtual-memory-works ch10.limit (#ch3) and ch11.p3 (#ch8), how-pcie-works ch6.p5 (#ch4) and ch7.p3 (#ch5), why-nvme-is-fast
ch7.p2 (#ch11), how-a-computer-boots ch11.p6 (#ch9), how-thunderbolt-works ch8.p2 (#ch8) and storage-over-a-network ch6.p1 (#ch12) link
here. Scripts `?v=20261115`. Atlas edges (28, in its fragment): 11 between chapters, 17 from the siblings it links or that link it (see
specs/atlas-search-index.md). Not verified (BRIEF): Ren et al. cycle counts, Lee Fig. 4(a) values, FlexSC, the Arm MSR-at-EL0 pseudocode,
IOMMU strict / lazy costs, virtio 1.3 final status, whether the C Binder removal landed exactly in 7.4-rc1.
Power/NIC registrar (2026-11-15): ch6.limit links how-a-nic-moves-packets #ch5 (RSS) and ch7.limit its #ch3 (descriptor prefetch and write-back); NAPI, descriptor ring, DPDK, SR-IOV and kernel bypass stay here. Label at d0821bc1 (previous e916a267), scripts `?v=20261115b`.
SVG-check registrar (2026-11-16): browser.cjs outside-viewport check skips only <defs> again (not the <svg>), clipped-text SVG skip removed in c3cef443 (test only, page passes at 1280/390/320 zh+en); label at c3cef443 (previous d0821bc1), no script change.
Template Phase 1 batch A (2026-11-16): tests/models.cjs reads index.html through unprefill() and skips generated site.* keys in link/number scans (9a470caf, test only, no-op before conversion). Label at 9a470caf (previous c3cef443), no script change.

### how-pixels-reach-a-screen: 像素是怎么到屏幕上的

Computer architecture series, queued system essay (TASK-arch-series.md). A 4K screen at 120 Hz has to deliver nearly a billion pixels a
second: how do they get from a block of GPU memory, through one cable, to light, and why does the picture tear or stutter? The
framebuffer, pixel clock and blanking on CTA-861 and CVT-RB2 timings, tearing and stutter on an event-driven present queue (immediate /
FIFO / mailbox), variable refresh and LFC, the display engine, compositor and colour pipeline (KMS planes, DEGAMMA / CTM / GAMMA), DisplayPort
and HDMI links with training (UHBR payloads from Linux's 96.71 %), DSC with the FEC that 8b/10b DP requires and 4:2:0 on text, the timing
controller and row time, LCD / OLED and motion blur, HDR and PQ, a click-to-photon waterfall, a dated frontier and three questions. Twelve
static diagrams. Essay commit 3e6bf23d; label at e916a267. Review note specs/reviews/how-pixels-reach-a-screen-review-20261115.md. It owns
像素是怎么到屏幕上的, 显示器是怎么工作的 / how does a monitor work, 帧缓冲 / framebuffer, sRGB 和线性 (#ch1), 像素时钟 / pixel clock, 消隐,
刷新率 / refresh rate (#ch2), 画面撕裂 / screen tearing, 垂直同步 / vsync, 三缓冲 (#ch3), 可变刷新率 / VRR, FreeSync, G-SYNC, LFC (#ch4),
显示引擎, 桌面合成器, 颜色管理 / color management, 伽马 LUT (#ch5), DP, HDMI, HDMI 和 DP 区别 / HDMI vs DisplayPort, 4K 120Hz 要什么线, 链路训练,
TMDS, FRL (#ch6), DSC 有损吗 / is DSC lossy, 视觉无损 / visually lossless, 4:2:0, 色度抽样 / chroma subsampling (#ch7), TCON, 时序控制器, TFT
背板 (#ch8), OLED 和 LCD 区别 / OLED vs LCD, 运动模糊 / motion blur, 响应时间, PWM 调光 (#ch9), HDR 是什么 / what is HDR, nits, PQ 曲线, HDR10
(#ch10), 输入延迟 / input lag, 显示延迟 (#ch11), HDMI 2.2, DP80LL, 720Hz OLED, Panel Replay (#ch12), 显示器参数怎么看, 为什么显示器跑不到 144Hz
(#ch13); its page tags 显示器 / Displays, DisplayPort and HDR open the page top. **Alias decisions (2026-11-15, review and registrar):**
显示流压缩 / Display Stream Compression stay off this page (the review left the DSC definitions to how-thunderbolt-works); they had no owner
and returned nothing, so how-thunderbolt-works #ch6 now takes them with bare DSC (it already had DSC 压缩是什么 / what is DSC). The page tag
显卡 / Graphics Cards would take bare 显卡 from the GPU essay, so 显卡 / graphics card are aliases of how-a-gpu-computes #ch1 (pinned). Left
to their owners: 像素 / pixel, 色域 / gamut, RGB 子像素 (inside-a-phone #screen), DP Alt Mode, USB-C 接显示器, 4K 60Hz 需要多少带宽
(how-thunderbolt-works #ch6), GDDR7 (how-memory-talks #ch9), PAM4 / NRZ (how-pcie-works #ch9), 渲染管线 (computer-graphics), quad shading
(how-a-gpu-computes #ch9). It links how-a-gpu-computes #ch9, how-thunderbolt-works #ch6, how-usb-drives-talk #ch8, how-pcie-works #ch8,
how-memory-talks #ch9, computer-graphics and inside-a-phone #screen; how-thunderbolt-works ch6.p1 (#ch2) and ch6.p4 (#ch7) and
how-a-gpu-computes ch9.p2 (#ch1) link here. Scripts `?v=20261115b`. Atlas edges (18, in its fragment): 9 between chapters, 9 from siblings.
how-thunderbolt-works ch6.p4 used to fit 8K60 30-bit into HBR3 at 25.92 Gb/s with DSC; since 2026-11-15 its model deducts the FEC this page
explains (25.31 Gb/s, ≤ 12.2 bpp on CVT-RB2 timing). Not verified (BRIEF): HDMI FRL RS-FEC overhead, HDMI 2.2 line coding, AMD's 2.5× LFC range, the
BT.2100 / BT.2087 PDFs, LG Display's 720 Hz OLED.
SVG-check registrar (2026-11-16): browser.cjs outside-viewport check skips only <defs> again (not the <svg>), clipped-text SVG skip removed in c3cef443 (test only, page passes at 1280/390/320 zh+en); label at c3cef443 (previous e916a267), no script change.
Template Phase 1 batch A (2026-11-16): tests/models.cjs reads index.html through unprefill() and skips generated site.* keys in link/number scans (9a470caf, test only, no-op before conversion). Label at 9a470caf (previous c3cef443), no script change.

### how-power-reaches-the-cpu: 电是怎么送进 CPU 的

Computer architecture series, queued system essay (TASK-arch-series.md). A CPU runs on about one volt yet draws two or three hundred watts,
some two hundred amps, and the load jumps within about ten nanoseconds: how does power get from the wall socket into the chip, and why
does the chip slow itself down? The chain from wall to die (253 W at the CPU draws 401 W at the wall), dynamic power and leakage on an
alpha-power V/f curve, the PSU and 80 PLUS (a three-point loss fit, ATX 3 rev 2.1a), the multiphase VRM (TI SLVA882B ripple
cancellation), the load line and decoupling on a time-domain PDN ladder and |Z(f)|, pins, bumps, electromigration, FIVR and power gating,
DVFS and race to idle, C-states under a menu-style governor over intel_idle's Skylake table, PL1 / PL2 / Tau over a thermal RC chain,
data-centre power (48 V, 800 V DC), a dated frontier (PowerVia, A16, vertical power) and three questions. Ten static diagrams. Essay
commit e8b05fa7; label at d0821bc1 (the cross-link, alias and one-click commit). Review note
specs/reviews/how-power-reaches-the-cpu-review-20261115.md. It owns CPU 供电, 电是怎么送进 CPU 的, 主板供电 / CPU power delivery, how does
power reach the CPU (#ch1), 动态功耗, V/f 曲线, CPU 为什么电压这么低 / dynamic power (#ch2), 电源效率, 电源瓦数怎么选, 电源怎么选, 功率因数校正,
ATX 电源 / 80 PLUS, PSU efficiency, what wattage PSU, PSU wattage, how to choose a PSU (#ch3), 供电相数, 多相供电, 纹波抵消 / VRM, power phases
(#ch4), 负载线, Load-Line Calibration, 防掉压, 去耦电容, 电压跌落 / load line, adaptive voltage positioning, voltage droop, PDN impedance (#ch5),
电迁移, 片上稳压, 电源门控 / FIVR, power gating (#ch6), 动态调频调压, P-state, 冲刺再睡 / DVFS, race to idle, schedutil (#ch7), C-state, CPU 空闲状态,
menu 调速器 / C-states, cpuidle, target residency (#ch8), CPU 降频, CPU 为什么降频, 功率墙, 温度墙, 热阻 / CPU throttling, why does my CPU throttle,
PL1 PL2, Tjmax (#ch9), 48 伏供电, 800 伏直流, 机架供电 / 48 V rack power, 800 V DC, Open Rack V3 (#ch10), 垂直供电, A16 工艺 / PowerVia, Super
Power Rail (#ch11), 降频排查, CPU 跑不满 / throttling checklist, CPU not reaching boost (#ch12); its page tags 供电, 电源管理 / Power Delivery,
Power Management open the page top. **Alias decisions (2026-11-15, review and registrar):** bare LLC is not taken (it reads as last-level
cache); #ch5 has 防掉压 and Load-Line Calibration instead. Left to their owners: USB PD, EPR (how-thunderbolt-works #ch7), power sequencing,
PWR_OK, S3 S4 S0ix (how-a-computer-boots #ch1, #ch5), buck / boost (power-converters), Dennard scaling / 登纳德缩放
(why-compute-waits-for-memory #ch5), CPU 频率 / 主频为什么有上限 (switches-that-compute #ch7); 漏电 / leakage current, 背面供电 / backside power
delivery, 功率密度, 暗硅 wait for the why-chips-are-hard draft and AI data center power for the frontier-model draft. CPO (it matched "CPU
power formula" by one letter) became an alias of why-compute-waits-for-memory #ch10. It links how-a-computer-boots (#ch1, #ch5),
power-converters, ohms-law, how-thunderbolt-works #ch7, switches-that-compute #ch7, why-compute-waits-for-memory #ch5,
how-a-cpu-guesses-ahead, how-cpu-caches-work and how-a-gpu-computes #ch11; how-a-computer-boots ch1.p3 (#ch4), how-a-gpu-computes ch11.p2
(#ch10) and why-compute-waits-for-memory ch5.p1 (#ch2) link here. 《芯片为什么越来越难做》 and 《按下开关的那一刻，电是从哪儿来的》 stay
plain text until those drafts register. Scripts `?v=20261115b`. Atlas edges (18, in its fragment): 10 between chapters, 8 with siblings.
Not verified (BRIEF): the 230 W PPT, Smith 1999, the 14900K's Tau, A16 in production, PROCHOT bidirectionality, per-cluster rails.
SVG-check registrar (2026-11-16): browser.cjs outside-viewport check skips only <defs> again (not the <svg>), clipped-text SVG skip removed in c3cef443 (test only, page passes at 1280/390/320 zh+en); label at c3cef443 (previous d0821bc1), no script change.
Template Phase 1 batch A (2026-11-16): tests/models.cjs reads index.html through unprefill() and skips generated site.* keys in link/number scans (9a470caf, test only, no-op before conversion). Label at 9a470caf (previous c3cef443), no script change.
SIMD/float registrar (2026-11-16): only the generated linked-from rows changed (how-a-cpu-does-math ch11 links #ch2); page.json version 20261116b, label not repointed (generated backlinks are mechanical, D4).
Nine-essay registrar (2026-11-18): ch2.p1 links why-chips-are-hard #ch3 (why a switched-off transistor leaks) and ch12.links links why-chips-are-hard (it registered; the English list was re-punctuated); tests/models.cjs requires all three. page.json version 20261118a; label at 3a4bbfb6 (previous 9a470caf).

### how-a-nic-moves-packets: 网卡是怎么搬运数据包的

Computer architecture series, queued system essay (TASK-arch-series.md). A 400G card has 1.68 ns per 64-byte packet: how does it get
packets into memory and onto the right core without the CPU touching every byte? Inside a NIC (PHY, MAC, queues, DMA), the Ethernet frame
with a real CRC-32 and the line-rate budget, the receive path and descriptor prefetch, PCIe bytes per packet (Neugebauer et al.), RSS and
the Toeplitz hash (Microsoft's 16 verification values), RPS / RFS / aRFS / XPS and IRQ affinity, checksum, TSO and GRO offloads on a fit to
Cai et al., DDIO and leaky DMA on an LRU simulation, the transmit path and BQL, XDP / AF_XDP / DPDK, RDMA inside the NIC (verbs, queue
pairs, one-sided writes, SmartNIC / DPU), ECMP against packet spraying with PTP, a dated frontier (802.3dj, UEC 1.0 / 1.1, Thor Ultra,
ConnectX-8 / -9) and three questions. Eight static diagrams. Essay commit 230d5aac; label at d0821bc1. Review note
specs/reviews/how-a-nic-moves-packets-review-20261115.md. It owns 网卡, 网卡是怎么工作的, 网卡里有什么, 网络接口卡 / network card, NIC, how does a
network card work, network interface card (#ch1), 以太网帧, 帧校验序列, 巨型帧, 线速包率 / Ethernet frame, jumbo frame (#ch2), 网卡怎么收包, 描述符
预取 / descriptor prefetch, descriptor write-back (#ch3), 400G 网卡 PCIe 够不够, 每个包的 PCIe 开销 (#ch4), RSS, 接收端缩放, 托普利茨哈希 / receive
side scaling, Toeplitz hash (#ch5), aRFS, 接收流导向, 网卡中断亲和性 (#ch6), TSO 分段卸载, GRO, LRO, 校验和卸载 / checksum offload (#ch7), DDIO,
直接缓存访问, leaky DMA (#ch8), BQL, 字节队列限制, 网卡发送环 (#ch9), XDP, AF_XDP, eBPF 网络 (#ch10), 队列对, 单边写, RDMA verbs, SmartNIC, DPU
(#ch11), 包喷洒, ECMP, PTP 硬件时间戳 (#ch12), UEC 1.1, 800G 网卡, 1.6T 网卡 (#ch13), 怎么看网卡规格, 网卡选型 (#ch14); its page tags 网卡,
网络硬件 / Network Cards, Network Hardware open the page top (the builder's tag 网络 / Networking would have taken bare 网络 from
tcp-congestion). **Alias decisions (2026-11-15, review and registrar):** bare RDMA tied at 80 with storage-over-a-network #ch6, so that
chapter gained the alias RDMA (pinned); PCIe 开销 / PCIe overhead / PCIe bandwidth are aliases of how-pcie-works #ch3 and "packet" of
tcp-congestion, because this page's longer phrases and #ch8's title contain them. Left to their owners: bare TSO (how-cores-share-memory,
total store order), NAPI, descriptor ring, DPDK, SR-IOV, kernel bypass, interrupt coalescing (how-the-os-talks-to-hardware), RoCE, PFC,
DCQCN, lossless Ethernet (storage-over-a-network #ch6), MSI / MSI-X, TLP (how-pcie-works, why-nvme-is-fast), NUMA (how-a-computer-is-wired),
all-reduce, scale-out (coherent-interconnects), Ultra Ethernet (storage-over-a-network #ch10), MTU, 丢包 (tcp-congestion and the
web-page draft). It links how-the-os-talks-to-hardware (#ch6, #ch7, #ch12), how-pcie-works (#ch3, #ch9, #ch10), how-cpu-caches-work
(#ch1, #ch3), how-a-computer-is-wired #ch4, storage-over-a-network #ch6, coherent-interconnects (#ch9, #ch10),
why-compute-waits-for-memory #ch10, tcp-congestion, distributed-systems and how-a-gpu-computes; how-the-os-talks-to-hardware ch6.limit
(#ch5) and ch7.limit (#ch3), storage-over-a-network ch6.p1 (#ch11) and coherent-interconnects ch10.limit (#ch12) link here.
《网页是怎么来到你手机上的》 and 《一根线到底能传多少信息》 stay plain text until those drafts register. Scripts `?v=20261115b`. Atlas edges
(20, in its fragment): 10 between chapters, 10 with siblings. Not verified (BRIEF): the 802.3df / 802.3dj approval dates, Gen6 FLIT header
sizes, DDIO's replacement policy, the ConnectX-7 message rate.
SVG-check registrar (2026-11-16): browser.cjs outside-viewport check skips only <defs> again (not the <svg>), clipped-text SVG skip removed in c3cef443 (test only, page passes at 1280/390/320 zh+en); label at c3cef443 (previous d0821bc1), no script change.
Template Phase 1 batch A (2026-11-16): tests/models.cjs reads index.html through unprefill() and skips generated site.* keys in link/number scans (9a470caf, test only, no-op before conversion). Label at 9a470caf (previous c3cef443), no script change.

### The nine essays registered on 2026-11-18

how-a-chatbot-writes, what-a-frontier-model-takes, a-secret-in-public, what-quantum-computers-do, why-chips-are-hard,
why-fusion-is-hard, why-batteries-hold-so-little, why-atoms-stick-together (a site-template page) and
why-one-rate-moves-everything. Built by Claude Code (claude-opus-5-5, drafted 2026-11-11; atoms by claude-fable-5-2), finished
and independently reviewed 2026-11-18/19 by Claude Code sessions (claude-fable-5-2 and claude-opus-5-5); English drafted by
claude-haiku-5-5 and corrected by the reviewers. Each commit's trailers name builder and reviewers exactly. Essay commits 5f65e9f3,
4a16e24b, 1bfc5702, b9d1df78, 9a934eae, 25ab7a91, b60bb4cd, 351003c0, f7e8b240; registration and first labels 046b13df. New subtopics
computing/quantum and tech/semiconductors (with redirect stubs). Regions: the four computing essays → computing, chips → tech, fusion →
circuits (an energy balance; thermodynamics sits there), batteries and atoms → matter, money → society. Per-page alias decisions, links
and cache keys are in specs/<slug>.md; open items from each review record and the remaining unreviewed drafts are in
specs/essays-status-20261119.md. The atlas up-front index was raised to 160,000 bytes as a stop-gap for this import
(specs/atlas-search-index.md "Limits").

### scarcity-moves: 稀缺会搬家

The first essay: ten economic ideas, then applied to AI. It is Chinese only (`languages: ["zh"]`), so in
English mode its card shows a "Chinese only" badge. It stays in the `demos` category. Its REGISTRY.json was written on 2026-11-11 for search (gap audit) and
imported with `--region society` (category `demos` has no region); c15, advice to a student, is not a concept.
