# Site template: pages from Markdown + components, one registry, generated links

- **Status: adopted 2026-11-16.** Yangyu approved the proposal with every recommended default (D1–D10), verbatim:
  「OK，就按照你的方案来吧。补设计图的话，你可以先通过 SVG 生成的方式去；如果需要画图的话，你可以通过我的 LLM proxy 去调用其他的 API 做图片生成」.
- Background, measurements and the prototype: [proposals/site-template.md](proposals/site-template.md).
  Where the two differ, this file wins.
- Phase 0 (tooling, no page converted) landed 2026-11-16. Phases 1–3 are below; the plan of record is in
  HANDOFF.md 「模板迁移与示意图补齐」.

## 1. Decisions as taken

| # | Decision |
| --- | --- |
| D1 | One Markdown file per language (`content.zh.md`, `content.en.md`); the build checks parity mechanically. |
| D2 | Build-time rendering; outputs (`index.html`, `copy.zh.js`, `copy.en.js`, `refs.json`) are committed, so deploy stays `git archive \| rsync`. |
| D3 | Authorship follows content through a `Derived-From: <old> -> <new>` commit trailer (AUTHORSHIP.md §4, §9 entry 2026-11-16). |
| D4 | A mechanical migration does not repoint `sourceRevision`; the label credits the content. |
| D5 | Essays first, then lessons. `variants/claude-code/` is frozen; LeetCode keeps its pipeline and only gets chrome and registry rows. |
| D6 | Static `/en/` twins later, once essays are migrated. |
| D7 | Positional keys (`chN.pK`) plus explicit `{#key}` where a key is referenced or out of sequence. Renumbering shows as drift. |
| D8 | `KNOWLEDGE_PAGES` becomes generated (Phase 2); categories, subtopics, FEATURED and ESSAYS order stay hand-edited. |
| D9 | Prose references never become atlas edges. Missing edges are listed as a to-do. |
| D10 | The runtime 《title》 linker skips template pages (`site-nav.js`, `html[data-template]`); for them it is a build lint that suggests `[[slug]]`. |

## 2. Commands

```sh
node scripts/build-pages.cjs <page-dir>...      # write index.html, copy.zh.js, copy.en.js, refs.json
node scripts/build-pages.cjs --all              # every live page with a page.json
node scripts/build-pages.cjs --all --check      # in memory; exit 1 on drift, parity, refs, bindings, partials
node scripts/convert-essay.cjs <page-dir>       # migration: write sources next to a live essay and prove equivalence
node tests/site-template.cjs                    # fixture build, failure modes, converter round trip, site-nav skip
```

- `--all` covers only live pages in `pages.config.js` whose directory has `page.json`. Untracked drafts and the
  fixture site are never included.
- An unregistered draft is built by naming its directory. Its slug is not in `pages.config.js`, so the build reads
  slug, path, category, subtopic, stage and title from the draft's `REGISTRY.json` and warns `draft: …`. The
  draft has no backlinks, related pages or provenance label, and no other page can `[[link]]` to it until it is
  registered. A `page.json` slug that differs from the slug registered for that directory is an error.
- `--no-chrome --no-prefill` rebuild the pre-template page byte for byte. They exist for equivalence checks;
  never commit their output.
- `--root <dir>` points every tool at another site root (the tests use `tests/fixtures/site-template/`).
- The Pages workflow runs `--all --check` before publishing and does not publish `templates/`.

## 3. Files of a migrated page

```
<category>/<subtopic>/<slug>/
  page.json         slug, kind, layout, scripts, version (the ?v= cache key), provenanceNote, optional prefill, legacyLayout
  content.zh.md     the Chinese text: front matter, chapters, directive blocks        (source, edit this)
  content.en.md     the same skeleton in English                                       (source, edit this)
  page.css          the page's own styles, inlined by the layout                       (source)
  figures/*.html    language-neutral partials: labs, diagrams, raw-HTML regions        (source)
  bindings.cjs      optional: prose numbers computed from models.js                   (source)
  models.js app.js  unchanged page code                                                (source)
  index.html copy.zh.js copy.en.js refs.json                                           (GENERATED, do not edit)
  REGISTRY.json BRIEF.md tests/                                                        (unchanged until Phase 2)
templates/layouts/essay.html   the essay layout (head, top bar, hero, TOC, sections, footer, scripts)
scripts/lib/template.cjs       registry, refs, inline Markdown, content parser, builder
```

Every generated file says so in its first line (`<!-- GENERATED … -->`, `/* GENERATED … */`, refs.json
`"_generated"`). Category, subtopic, stage and titles still come from `pages.config.js` until Phase 2.

## 4. Content format

```markdown
---
lang: zh
title: 硬盘里到底是什么 · 一篇可以动手的长文      ← doc.title (and <title>)
desc: 机械硬盘和固态硬盘里装的东西完全不同……       ← doc.desc (and meta description)
---

::: strings                                        ← page-wide strings, absolute keys
nav.back: ← 知识索引
:::

# 硬盘里到底是什么 {#hero}

::: strings
kicker: 计算机 · 存储 · 一篇可以动手的长文
:::

一块机械硬盘和一块固态硬盘……<br>为什么…… {.sub}

## 盘片与磁头 {#ch2}

::: strings
toc: 盘片与磁头                                    ← toc.ch2
:::

机械硬盘读一小块数据，大部分时间不在读，而在等…… {.law}

想象从一张转着的黑胶唱片上找一句歌词……             ← ch2.p1

::: diagram dg-hdd keys=dg.hdd                     ← figures/dg-hdd.html + its strings (dg.hdd.cap, dg.hdd.arm…)
cap: 图 2　盘片、磁头和磁道（示意，不按比例）。
arm: 磁头臂
:::

::: lab ch2-model                                  ← figures/ch2-model.html + its strings (ch2.model.title…)
model.title: 一次 4 KB 随机读
say.full: 平均寻道 {s} 毫秒……                       ← {s}: filled by app.js at run time
:::

用 7,200 转……平均寻道 {=ch2.seek} 毫秒……             ← {=…}: bound at build time from models.js
[[why-nvme-is-fast#ch1|「NVMe 为什么这么快」第一章]]给机械硬盘……

### 已确立 {#h.est .sub3}                            ← ch2.h.est

- 第一条 {#e1}                                      ← ch2.e1 (list items always carry a key)

模型的边界：…… {.take}                              ← ch2.limit

::: footer
Markdown paragraphs, separated by blank lines.
:::
```

**Page-wide keys.** The layout names these keys, so every page defines them, or the build fails:
- front matter `title` and `desc`;
- in the first `::: strings` block (before `# … {#hero}`): `nav.back`, `nav.lang`, `toc.label` and `toc.title`;
- in the hero's `::: strings`: `kicker`;
- one `::: footer`.

**Keys.**
- A paragraph without a class gets the next positional key, `<chapter>.p1`, `p2`… The counter runs through the
  whole chapter, labs included.
- `.law` maps to `<chapter>.law`, `.take` to `<chapter>.limit`, and a hero paragraph to `hero.<first class>`.
- Anything else needs `{#key}`. Keys written inside a chapter are relative (`f.seagate` → `ch9.f.seagate`). A key
  whose first segment is a section id is absolute.
- `keys=<prefix>` on a block makes its entries relative to that prefix instead.
- Trailing attributes: `{#key .class tag=div style="…"}`. A line holding only `{.class …}` applies to the next
  list or paragraph.

**Inline.** `**bold**`, `*em*`, `[[ref]]`, `{=name}`, `{v}` (runtime, untouched), and raw inline HTML for
the rest (`<br>`, `<span class="tag m">`, external `<a href>`). Escapes `\*`, `\[`, `\{`, `\\` give the
literal character. A paragraph that would read as block syntax (`- `, `1. `, `#`, `:::`, `{#`, `<!--`) starts
with a backslash, which is dropped.

**Directives.** Each `::: <type> <name> [keys=<prefix>]` block holds `key: value` lines (a value that starts
or ends with a space, contains a line break or starts with `"` is written as a JSON string).
- `strings`: labels, units, aria text, live sentences. `toc:` and the hero's `kicker:` are special.
- `lab`: an interactive figure. Its DOM is `figures/<name>.html`, owned with `app.js` because `app.js` binds
  to its ids. It renders inside `<div class="wide">`.
- `diagram`: a static schematic (STANDARD.md §4a). Its markup is `figures/<name>.html`, inside the prose
  column. It comes in two shapes, both with all labels in the block:
  - **(a)** the shell `app.js` fills (`<figure class="dia" data-dg="x"><div class="svg"></div><figcaption …>`),
    with every label `app.js` reads (`dg.x.*`) listed in the block even when the partial does not name it;
  - **(b)** an inline `<svg viewBox …>` whose `<text>` elements carry `data-i18n` keys.

  Numbers drawn on a diagram use `{=name}` like prose, or come from `models.js` in `app.js`.
- `html`: any other raw region inside the prose column (a table, a hand-built grid). Keys it names go in the
  block. The converter uses it wherever a region is not prose, a list, a lab or a diagram.
- `footer`: Markdown paragraphs. `::: footer wrap=none` is one paragraph without `<p>` (older pages).

A partial is language-neutral. It holds no text, only `data-i18n` / `data-i18n-html` / `data-i18n-aria`
keys, and the build fails if it names a key no block defines.

## 5. Cross-references

| Syntax | Resolves to | Text |
| --- | --- | --- |
| `[[slug]]` | `../slug/`, relative to this page | the target's title in this language |
| `[[slug#ch7]]` | `../slug/#ch7` | target title |
| `[[slug#ch7\|text]]` | same | as written |
| `[[#ch3\|text]]` | `#ch3` on this page | as written |
| `[[concept:id-or-alias]]` | the concept's primary page and anchor in the atlas | the concept title |

- The build fails on an unknown slug, an anchor the target does not have, an unknown or ambiguous concept (an
  alias owned by two concepts is an error, never a guess), and a zh and en ref that point to different targets.
- Prefer `[[…]]` to a hand-written `<a href="../…">`. Raw links still work. The build warns when one points
  at no live page or a missing anchor, and compares targets between languages, in either quote style.
- The lint (D10) warns about an exact 《title》 / “Title” of another live page that is not a link. It never
  rewrites prose; decide, then write `[[slug]]` or leave the quotation.
- Concepts resolve through `atlas/data.js` node titles and aliases. The merged search alias table comes in
  Phase 2.

## 6. Numbers: bindings

```js
// bindings.cjs, language-neutral; translators never see it
module.exports = M => ({ 'ch2.seek': M.fmt(M.disk.random(7200, 1).seek, 1) /* … */ });
```

`{=ch2.seek}` in both files becomes the string at build time. An unknown name fails. A binding no paragraph uses
also fails, so typing a number over a binding is caught. Page tests keep pinning prose numbers. Bindings are added
chapter by chapter when the prose is next edited, not during migration.

## 7. The checks (`--check` and every build)

- **Drift:** each output equals a fresh build.
- **Parity:** the same block skeleton in zh and en (blocks, keys, figures), the same key set, the same `{v}`
  multiset per key, the same `{=…}` per key, and the same link targets per key.
- **Refs:** as in §5.
- **Bindings:** every name known, every binding used.
- **Partials:** each exists and names only defined keys.
- **Layout keys:** every `data-i18n*` key in the built page, including those the layout and chrome name, is
  defined (§4 「Page-wide keys」).
- **Warnings (do not fail):** lint suggestions and raw links to missing pages or anchors.

Backlinks are generated. When a page gains a link to a migrated page, the migrated page's `index.html` and
`refs.json` drift, and `--all --check` fails until someone runs `node scripts/build-pages.cjs --all`. Run it
after registering a page or adding cross-links.

A backlink is a link written in another page's sources. For an unmigrated page those are `copy.zh.js`,
`i18n.js` and `index.html`. For a migrated page they are `copy.zh.js` without its `site.*` keys, plus
`figures/*.html`. Its `index.html` is not scanned, because pre-fill copies the copy table into it, and the
`site.*` keys are themselves generated backlinks. Scanning either would make links echo between migrated pages,
and one `--all` pass would no longer be final (review 2026-11-16).

## 8. Chrome (what the layout adds)

- `<html data-template="essay">` and a GENERATED comment.
- A static breadcrumb with the site-nav markup and styles (`nav.site-nav`, `site-nav.css`).
- A "被这些页面引用 / Linked from" block (backlinks with source and target chapters) and "相关页面" (REGISTRY
  `relatedPages` minus backlinks), styled by `.site-xref` in `site-nav.css`.
- Their strings are `site.*` keys added to the page's own copy tables, so the page's i18n swaps them and the
  English CJK sweep needs no exemption. Content may not define `site.*` keys.
- The site-nav include lines come from `scripts/build-site-nav.cjs` (`includeLines`), so its `sn-` cache key
  has one source. `build-site-nav.cjs` never writes into a template page. It reports a stale one with the
  build-pages command. `site-nav.js` does nothing on `html[data-template]`.
- The provenance label is rendered from `page-provenance.json` plus `page.json.provenanceNote` (the free-text
  first paragraph). To repoint a label, edit `page-provenance.json` and rebuild. The AGENTS.md rule about
  `data-source-revision` / link / short SHA is then satisfied by the build.
- **Pre-fill:** the zh text inside every empty `data-i18n*` element and `aria-label` from `data-i18n-aria`, so
  readers without JS see the essay. Values with `{v}` placeholders are left to `app.js`. `"prefill": false` in
  `page.json` turns it off. `scripts/lib/prefill.cjs` holds `prefill` and its exact inverse `unprefill`, which page
  tests use to read the markup without it (§10 step 3).

## 9. How agents edit a migrated page

1. Edit `content.zh.md` and `content.en.md` together, keeping the skeleton identical. Edit `figures/*.html`,
   `page.css`, `page.json`, `bindings.cjs`, `models.js` or `app.js` as needed.
2. Run `node scripts/build-pages.cjs <page-dir>`, then the page's own tests and `--all --check`.
3. **Never hand-edit `index.html`, `copy.zh.js`, `copy.en.js` or `refs.json`.** The next build overwrites them,
   and `--check` fails until then.
4. Cache keys: when a script file changes, set `page.json.version` (same rule as specs/essays.md step 7) and
   rebuild.
5. Commit sources and outputs together with normal trailers. `page-provenance.json` `sourceRevision` follows
   AGENTS.md as before; the label in the page updates on rebuild.
6. Haiku translation: give it the whole `content.zh.md` and the contract below; it returns `content.en.md`.
   Then build. Parity failures name the key.

**Translation contract.** Translate the text only. Copy verbatim:
- everything inside `{…}`;
- the target part of `[[target|text]]` (translate only `text`; a bare `[[target]]` stays as is);
- every `::: …` line, every `key:` prefix and every `{#key .class}`;
- the front-matter keys.

Do not merge or split paragraphs or list items.

## 9a. Writing a new essay directly in Markdown

The next essays (first: CPU SIMD and floating point) start as template pages. Everything in specs/essays.md
and STANDARD.md still applies; only the files differ.

1. **Files.** Create these in the essay's directory:
   - `REGISTRY.json` (essays.md「Files」), which the draft build reads;
   - `page.json`: `{"slug", "kind": "essay", "layout": "essay", "scripts": ["models.js", "copy.zh.js",
     "copy.en.js", "app.js"], "version": "<date>"}`;
   - `content.zh.md` (§4, including the page-wide keys);
   - `page.css`, `figures/`, `models.js`, `app.js` and `tests/`.
2. **Runtime.** The template ships no i18n runtime. `app.js` must apply the copy itself:
   - `document.title` and the `data-i18n` / `data-i18n-html` / `data-i18n-aria` fill, with `{v}` placeholders;
   - the `#langToggle` buttons and the stored language.

   Copy that head from a recent essay's `app.js` (for example `computing/systems/how-a-gpu-computes/app.js`,
   the first 50 lines).
3. **Styles.** No shared theme exists yet. Start `page.css` from a recent essay's `<style>` block and keep only
   the classes the page uses. The layout's classes (`topbar`, `hero`, `kicker`, `toc`, `ch`, `num`, `wrap`,
   `wide`, `law`, `take`, `lab`, `dia`) must be styled.
4. **Diagrams.** Shape (b), an inline `<svg>` in `figures/<name>.html` with `data-i18n` labels, needs no `app.js`
   code. Shape (a) needs drawing code in `app.js`.
5. **Build and test.** Run `node scripts/build-pages.cjs <dir>`; the `draft:` warning is expected until
   registration. Write `content.en.md` (§9 translation contract) and rebuild until parity passes. Then run the
   page tests, the canvas sweep and the independent review on the built output.
   - Pre-fill puts Chinese into `index.html`. A test that inspects the markup reads it through
     `unprefill(html, Z)` from `scripts/lib/prefill.cjs` (§10 step 3), or the page sets `"prefill": false`.
6. **Commit.** Commit sources and outputs together, never the outputs alone.
7. **Registration.** Follow essays.md「Registering」:
   - add the row to `pages.config.js`;
   - add the `page-provenance.json` entry and rebuild the page (the label is rendered from it);
   - run `node scripts/build-pages.cjs --all`, which picks the page up and refreshes backlinks;
   - run `node scripts/build-site-nav.cjs` (it does not edit template pages) and `--all --check`.

## 10. Converting a page (Phase 1 procedure)

Only convert a page no one else holds. Drafts written in the old pattern are converted after they are
registered.

1. `node scripts/convert-essay.cjs <page-dir>` writes the sources. Then it rebuilds without chrome and pre-fill
   and requires `index.html` to be byte-identical and both copy tables key-for-key equal. If they are not, it
   exits 1 naming the first difference, and the sources stay for inspection. The old `index.html` and copy
   files are not touched.
   - The copy tables have the same keys and values, but key order may differ, so `copy.*.js` are not
     byte-identical.
   - A failed run leaves `page.json`. Delete the written sources (`page.json`, `content.*.md`, `page.css`,
     `figures/`) before you retry or commit anything else, or `--all --check` fails.
   - A page with more than one `<style>` block is refused. Merge them in `index.html` in a commit of its own,
     then convert. how-a-gpu-computes had two; they were merged in bb10f897.
2. Run the page's `tests/models.cjs` and `tests/browser.cjs` on a `--no-chrome --no-prefill` build. Its
   `index.html` is identical to the old page, and its copy tables are equal key for key.
3. **Decide on pre-fill before the full build.** Most 2026-11-15 computing essays have a `tests/models.cjs` check
   that forbids CJK in `index.html`, and some match regexes that expect empty elements (`<figcaption …></figcaption>`),
   so they fail on pre-filled text. Resolve it per page, either way:
   - in a separate authored commit, read `index.html` in the test through `unprefill(html, Z)` from
     `scripts/lib/prefill.cjs`. It is the exact inverse of pre-fill (same file, so they cannot drift): it removes a
     value only where it sits in the element whose key it is, and an `aria-label` only where it equals that key's
     value. A hand-typed string, or extra text next to a value, survives and still fails the check
     (tests/site-template.cjs pins this). On a page that is not yet converted it is a no-op. Checks that count links
     or literal numbers over the copy table skip the generated `site.*` keys. This is what batch A did;
   - or set `"prefill": false` in `page.json`.

   Do not loosen any other assertion.
4. Run the full build (`node scripts/build-pages.cjs <page-dir>`), the page tests again and the canvas sweep.
5. Commit the sources **and** the rebuilt outputs in one commit, so that `--all --check` passes on every commit.
   The moment `page.json` exists, `--all` picks the page up, and the old hand-written outputs count as drift.
   - Trailers: `Built-By: script (deterministic, no model: scripts/convert-essay.cjs)` and
     `Authorship-Impact: mechanical`, plus the `Derived-From:` lines the converter prints.
   - Name the operating agent in the body or Verified-By, not in Built-By. A registered agent name there would
     attribute the commit to that agent (`authorship/agents.json`, first match wins).
   - `sourceRevision` stays (D4).

**`legacyLayout` in page.json** records whitespace of the hand-written HTML so step 1 can compare byte for byte:
- `join`: blocks written on the same line as the previous one;
- `compactLists`: lists on one line;
- `gaps`: blank lines between head, sections, main and footer.

It is safe to delete. Only whitespace between block elements changes, and then the page shows drift until it
is rebuilt.

**What the converter handles.**
- **Heroes:** kicker, title, paragraphs, label.
- **Chapters:** a `.wrap` with `.num` and `h2`, then prose, labs and diagrams. Prose is `<p>` or `<div>` with
  `data-i18n-html`, plus `class` and `style`.
- **Lists and headings:** `h3` with `data-i18n`, and `ul` / `ol` with keyed `li`.
- **Diagrams:** `figure.dia`, either shape.
- **Everything else** becomes `::: html`.
- **Links:** double-quoted site links become `[[refs]]` when the round trip is exact. Single-quoted ones stay HTML
  (converting them would change the copy value).

Older essays with other hero or section shapes need converter variants. Where a region cannot be reproduced
exactly, keep it as `::: html`.

**Round trips run in Phase 0** (scratch mirror, HEAD copies, 2026-11-16):
- **what-a-drive-is-made-of:** 317 keys, 9 labs, no diagrams. A working-tree draft with 8 diagrams in shape (a)
  also round-tripped.
- **how-memory-talks:** 459 keys, 10 labs, 11 diagrams in shape (a), 1 table as `::: html`.
- **how-a-computer-boots:** 608 keys, 10 labs, 13 diagrams in shape (a).

All three were byte-identical with both copy tables equal, and their `models.cjs` and `browser.cjs` passed on
the rebuilt outputs. The full builds passed too, the memory and boot essays with pre-fill off. Shape (b) is
exercised only by the fixture: no live essay has inline SVG diagrams yet.

The independent review (specs/reviews/site-template-phase0-review-20261116.md) ran the same round trip on
how-a-gpu-computes after merging its two `<style>` blocks in a scratch copy. It had 447 keys, 10 labs, 11 diagrams and
one `::: html` partial. `index.html` was byte-identical, both copy tables were equal key for key, and `tests/models.cjs`
passed (4516 checks). The full build failed only the CJK-in-`index.html` check of step 3.

**Phase 1 batch A (2026-11-16, computing/systems, committed, not pushed or deployed until reviewed).**
- **Converted (19):** what-a-drive-is-made-of, how-sata-works, how-usb-drives-talk, storage-over-a-network,
  how-memory-talks, coherent-interconnects, how-a-cpu-runs-a-program, how-a-cpu-guesses-ahead, how-cpu-caches-work,
  how-a-computer-boots, how-the-os-talks-to-hardware, how-pixels-reach-a-screen, how-power-reaches-the-cpu,
  how-a-nic-moves-packets, how-cores-share-memory, how-virtual-memory-works, how-a-gpu-computes,
  how-a-computer-is-wired, how-thunderbolt-works, in commits fca24bb5 … 8b2dac73 (that order). One mechanical commit per page; each round-tripped byte for byte
  at 42fba818 before its `version` bump, and `--all --check` passes on every intermediate commit (checked in a
  `git archive` mirror, pages added in commit order).
- **Before them:** bb10f897 (whitespace in four pages, the missing `</head>` in how-a-computer-is-wired, the GPU
  `<style>` merge; no rendered change), 9a470caf (`unprefill`, page tests; authored), 42fba818 (labels repointed).
- **Pre-fill:** on for all 19. No converter change was needed.
- **Not converted:** how-sas-works (its footer is three keyed paragraphs, `footer.sources` / `.models` / `.ai`;
  the layout has one `footer` key) and how-pcie-works (whole sections on one line, diagrams as `figure.diag` in
  `.wide`). Both need converter variants. why-nvme-is-fast, why-compute-waits-for-memory and switches-that-compute
  are later batches.
- **Checked per page on the full build:** `tests/models.cjs`, `tests/browser.cjs` (zh+en 1280/390/320) and the
  canvas sweep all pass. Screenshots of hero, breadcrumb and linked-from block (memory, storage, wired; 1280 and
  320, zh and en) look right. One cosmetic point: at 320 px in English the breadcrumb wraps and its `›` separator
  starts the second line (site-nav.css).
- **Lint:** the runtime 《title》 linker no longer runs on these pages (D10). The build lists 19 such mentions
  (for example 《NVMe 为什么这么快》 in storage-over-a-network ch5). They are left for the page owners to turn into
  `[[slug]]` or keep as quotations.

## 11. Authorship

- Conversion commits use `Derived-From:` (AUTHORSHIP.md §4) so `content.<lang>.md` inherits the history of
  `copy.<lang>.js`, and partials and `page.css` inherit the history of `index.html`.
- The old files stay committed as outputs and keep their own history.
- Later edits to the Markdown are attributed as usual.

## 12. Not yet

- **Phase 1:** the rest of the essays (batch A is done, §10): how-sas-works and how-pcie-works need converter
  variants; then the older essays with other hero or section shapes.
- **Phase 2:**
  - `page.json` replaces `REGISTRY.json`;
  - `site-registry.json` and `scripts/build-registry.cjs`;
  - generated `KNOWLEDGE_PAGES` and CONCEPT-MAP tables, with `site-nav-data.js` projected from the new registry
    (today it reads the same `pages.config.js` through `scripts/lib/template.cjs`);
  - concept refs through the merged alias table;
  - backlinks for every page.
- **Phase 3:** the lesson layout and the `i18n.js` converter.
- **Later:**
  - the unbound-digit lint;
  - static `/en/` twins;
  - extracting a shared `essay-theme.css` from page CSS.
