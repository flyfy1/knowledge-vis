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
   and `--check`, and watch `search-index.js` against its 200,000-byte limit. Details are in
   specs/atlas-search-index.md § Essay pages.
6. **One-click check.** For each chapter, try a few everyday queries in both languages on the homepage
   search and the atlas search. Add aliases until the chapter is the first result. On a tie between an
   essay page and one of its chapters, the homepage puts the chapter first.
7. **Cache keys.** After committing, run `node scripts/build-atlas-data.cjs --bump-versions` and update the
   `pages.config.js?v=` key in `index.html`.
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

All eleven were built by Claude Code (claude-opus-5-5) on 2026-11-11. The English copy was drafted by Claude
Code (claude-haiku-5-5). A separate Claude Code session of the same model reviewed each essay and revised
it (no human or cross-model review yet). Each BRIEF.md records what was and was not checked.

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

### scarcity-moves: 稀缺会搬家

The first essay: ten economic ideas, then applied to AI. It is Chinese only (`languages: ["zh"]`), so in
English mode its card shows a "Chinese only" badge. It stays in the `demos` category. Its REGISTRY.json was written on 2026-11-11 for search (gap audit) and
imported with `--region society` (category `demos` has no region); c15, advice to a student, is not a concept.
