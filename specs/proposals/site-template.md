# Proposal: one site template — pages from Markdown + components, one registry, generated links

- Status: **proposal, not adopted.** Nothing in the live site was changed. The prototype lives outside the repo.
- Author: Claude Code (claude-opus-5-5), 2026-11-15, at Yangyu's request (this thread).
- Supporting files: [site-template/](site-template/) (prototype build script, converter, chrome CSS, a sample chapter).
  Full prototype output and screenshots are archived at `~/Documents/archive/knowledge-vis/site-template-20261115/`.

Yangyu's direction (2026-11-15, verbatim):

> 1. 先明确我们全站的整体 template 是什么。为了做类似于"百科全书 + Knowledge Graph"的内容，它们之间应该有互相 reference 的能力。
> 2. 可以写底层的一些东西，比如使用 Markdown，但可能需要支持动态的 component，看看怎么做。
> 3. 最后把这些都做好，应该是可以把 UI 和内容分开的。

Earlier in the thread: breadcrumbs to the category/subtopic pages, every in-text mention of another page clickable,
"做一个 template 来动态生成，而不是自己去写这些东西".

## 0. Summary

1. **Every page is a record in one registry.** A page has metadata, a place (category/subtopic), chapters with
   stable anchors, the concepts it owns, and the references it makes. The registry is built from each page's
   `page.json` plus its content files. Breadcrumbs, the home views, `pages.config.js`, the atlas fragments, search,
   backlinks and CONCEPT-MAP tables are all generated from it.
2. **Content is Markdown, one file per language** (`content.zh.md`, `content.en.md`). It has a small front matter
   and fenced directive blocks (`::: lab ch2-model … :::`) for the dynamic parts. Numbers in prose are written as
   `{=name}` and bound at build time to `models.js` through a language-neutral `bindings.cjs`. Live-sentence
   placeholders stay `{v}`, filled by `app.js` as today.
3. **Cross-references are `[[slug]]`, `[[slug#ch7]]`, `[[slug#ch7|text]]`, `[[#ch3]]` and `[[concept:缓存行]]`.**
   They resolve at build time to relative links with the right title in each language. A broken page, anchor or
   ambiguous concept fails the build. Backlinks ("被这些页面引用") and related pages are generated.
4. **Build-time, not runtime.** A dependency-free node script (`scripts/build-pages.cjs`, prototype 0.2 s per page)
   writes `index.html`, `copy.zh.js` and `copy.en.js`. These outputs are committed, so deploy stays
   `git archive | rsync`. A `--check` mode fails on drift, like `build-atlas-data.cjs --check`.
5. **UI is separated from content.** One layout per page kind (essay, lesson) owns the header, breadcrumb, language
   toggle, TOC/step nav, provenance label, backlinks and footer. Figure markup that `app.js` binds to is a
   language-neutral partial. Page CSS is kept and shrunk over time into a shared theme.
6. **Prototype result.** `computing/systems/what-a-drive-is-made-of/` was converted automatically. The rebuilt
   page without chrome is **byte-identical** to the live `index.html`. All 317 copy keys in both languages match
   exactly. The page's own `tests/models.cjs` (919 checks) and `tests/browser.cjs` pass unchanged, and so do the
   canvas label sweep (936 states) and the provenance contract. Details are in §8.

---

## 1. What exists today (measured 2026-11-15, HEAD c738ebf5)

| Pattern | Pages | How copy and i18n are done | Notes |
| --- | --- | --- | --- |
| Essay (`copy.zh.js` / `copy.en.js` + `models.js` UMD + `app.js` + `REGISTRY.json` + `tests/`) | 35 live (incl. `demos/scarcity-moves`) + 17 untracked drafts in the working tree = 51 dirs | `window.ESSAY_COPY.{zh,en}` key → HTML string; `index.html` is all `data-i18n` / `data-i18n-html` / `data-i18n-aria` attributes on empty elements | Closest to the target. In the storage/bus family, 55–91 % of the `<style>` lines are shared with the drive essay. Only 21 lines are common to all 21 computing essays. Newer essays (boot, GPU, PCIe) build more DOM in `app.js` (PCIe has only 23 `data-i18n` attributes) |
| Lesson (`i18n.js` `STR` table + `style.css` + `app.js`, step nav `#step0…`) | 181 registered (+203 under `variants/claude-code/`) | same `data-i18n*` attributes; `STR.zh/en` | 16 use `lesson-shell.css/js`. Header is `header.site-head` with badges |
| LeetCode | 242 problem dirs, 1 entry in `pages.config.js` | Python pipeline (`scripts/build_leetcode_static.py`, versioned dirs) | separate owner and publication policy |
| Atlas / galaxy / home / `demos/fable-flight` | 4 | bespoke | generated data from `atlas/graph/` |

Other facts that shape the design:

- **The whole site already separates strings from structure.** At least 226 of 244 pages bind text with `data-i18n*` keys.
  The template therefore keeps the key model and changes where the keys come from (Markdown instead of a JS
  object). It does not change how pages run.
- **Cross-page links are hand-written HTML inside copy strings.** There are 341 `href="../…"` in essay
  `copy.zh.js` and 934 in lesson `i18n.js`, with both `"` and `'` quoting. Each essay test re-checks its own
  sibling anchors by hand. The drive essay's `tests/models.cjs` has about 40 lines doing only that.
- **Prose numbers are pinned by test, not generated.** For example, `says('ch2.p3', '约 ' + f1(r.t) + ' 毫秒…')`
  asserts that the prose still contains the number the model gives. If a model changes, a human edits the prose
  and the test catches any mismatch.
- **Metadata is duplicated.** `pages.config.js` (2,574 lines, hand-edited by every registering agent),
  `REGISTRY.json` (title/desc must equal `doc.title`/`doc.desc`, enforced by tests),
  `atlas/graph/lessons/<slug>.json` (generated from REGISTRY), `page-provenance.json` plus the hand-copied
  `<details>` label, and CONCEPT-MAP.md (3,572 lines, hand-maintained).
- **The stopgap now being built** (`site-nav.js` / `site-nav.css` / generated `site-nav-data.js`,
  `specs/site-navigation.md`) adds breadcrumbs, a home `?category=&subtopic=` view, subtopic directory URLs, and
  runtime auto-linking of exact 《标题》 / “Title” mentions. Its scan found 438 exact-title mentions.

## 2. The page model and the one registry

### 2.1 What every page is

```jsonc
// <category>/<subtopic>/<slug>/page.json   (replaces REGISTRY.json and the page's pages.config.js entry)
{
  "slug": "what-a-drive-is-made-of",
  "kind": "essay",                       // essay | lesson | demo | tool  → picks the layout
  "category": "computing", "subtopic": "systems", "stage": "university",
  "tags": [{ "zh": "存储系统", "en": "Storage Systems" }],
  "languages": ["zh", "en"],
  "scripts": ["models.js", "copy.zh.js", "copy.en.js", "app.js"], "version": "20261115d",
  "concepts": [ /* exactly today's REGISTRY.json concepts: id, anchor, title, desc, aliases, relatedPages */ ],
  "provenance": "page-provenance.json"   // the label is rendered from that inventory, never hand-copied
}
```

Title and description are **not** in `page.json`. They are the `title` / `desc` front matter of each
`content.<lang>.md`. There is one copy, so the "registry title = doc.title" test becomes unnecessary.

Content gives the rest:

- **Sections with stable anchors.** `## 标题 {#ch2}`. The anchor is written by the author, never derived from the
  title, so renaming a chapter does not break links. The registry lists every page's anchors. Unmigrated pages
  are scanned for `id="…"`.
- **Concepts it owns.** `page.json.concepts[]`, each tied to one anchor (one word, one owner; aliases as in
  specs/atlas-search-index.md).
- **References it makes.** Every `[[…]]` resolved by the build gives an edge `{from: page#key, to: page#anchor}`.

### 2.2 The registry

`scripts/build-registry.cjs` (new, `--check` like the others) reads every `page.json` and content file, plus
the legacy sources while migration is under way (`pages.config.js` entries of unmigrated pages, scanned `href`s
in their copy files). It writes `site-registry.json`:

```jsonc
{ "pages":   { "<slug>": { path, kind, category, subtopic, stage, title:{zh,en}, desc:{zh,en}, anchors:[…], concepts:[ids] } },
  "concepts":{ "<id>": { page, anchor, title, aliases } },                       // = atlas nodes owned by pages
  "edges":   [ { "type": "ref", "from": "how-sata-works#ch1", "to": "what-a-drive-is-made-of#ch7" },   // prose links
               { "type": "seeAlso", "from": "<concept>", "to": "<slug>" } ],                            // relatedPages
  "backlinks": { "<slug>": [ { from, fromAnchor, toAnchor } ] } }
```

Everything else is a **projection** of the registry, generated and checked:

| Consumer | Today | Proposed |
| --- | --- | --- |
| Home cards, filters (`pages.config.js` `KNOWLEDGE_PAGES`) | hand-edited | generated block. Categories, subtopics, FEATURED and ESSAYS order stay hand-edited in `site.json` (or the top of `pages.config.js`) |
| Breadcrumbs, subtopic directory pages, `site-nav-data.js` (stopgap) | stopgap generator from `pages.config.js` | same file, generated from the registry |
| Atlas essay fragments `atlas/graph/lessons/<slug>.json` | `atlas-import-registry.cjs` from REGISTRY.json | same script, reading `page.json` (hand-written edges are still kept on re-import) |
| Search chunks | `build-search-index.cjs` from `atlas/data.js` | unchanged (downstream of the atlas) |
| Backlinks / related on each page | none | generated into each page at build |
| CONCEPT-MAP.md concept → page/step tables | hand-maintained | generated section; prose rules stay hand-written |
| Provenance label in the page | hand-copied from `page-provenance.json` | rendered from it (§5) |

**Atlas edges stay hand-written.** A prose reference is not a claim that one concept builds on another, and the
atlas spec requires an edge to carry a written, sourced reason. `ref` edges feed backlinks and the "related"
list. They never become atlas edges automatically. The build lists `ref` pairs that have no atlas edge, as
candidates for a human to write up.

## 3. Content format

### 3.1 Options compared

| | Per-language files `content.zh.md` + `content.en.md` | One file, paired blocks (`zh:` / `en:` per paragraph) | MDX-like JSX tags | Fenced directives `::: lab x` + `{#key .class}` | Shortcodes `{{< lab x >}}` |
| --- | --- | --- | --- | --- | --- |
| Toolchain | none | none | needs a JSX/MDX parser (bundler-grade) | none; a 150-line parser | none |
| Cheap-model translation | **best**: give Haiku the whole zh file, get the en file back. The build then checks parity mechanically | Haiku edits a file that also holds the source, so it can damage zh | tags with JS props are easy to break | blocks and keys are plain ASCII lines, easy to keep | same as directives |
| Review / diff | one language per diff, matching today's split | both languages interleaved | — | — | — |
| Drift risk between languages | structure can drift. **Mitigated:** the build fails unless keys, blocks, placeholders, refs and figures match | none | — | — | — |
| Fit with today's keyed copy | direct (keys survive, tests keep working) | direct | poor | **direct** | direct |

**Recommendation:** one file per language, fenced directives for components, and kramdown-style trailing
attributes `{#key .class}` for keys and classes. MDX is ruled out because it needs a toolchain. Shortcodes work
but read worse than directives inside prose.

### 3.2 The syntax (as prototyped)

```markdown
---
lang: zh
title: 硬盘里到底是什么 · 一篇可以动手的长文
desc: 机械硬盘和固态硬盘里装的东西完全不同……
---

::: strings                      ← page-wide labels (absolute keys: nav.back, unit.ms, cell.tlc …)
unit.ms: 毫秒
:::

# 硬盘里到底是什么 {#hero}
一块机械硬盘和一块固态硬盘……<br>为什么…… {.sub}

## 盘片与磁头：等它移过去，再等它转过来 {#ch2}

::: strings
toc: 盘片与磁头                   ← short TOC title
:::

机械硬盘读一小块数据，大部分时间不在读，而在等…… {.law}

想象从一张转着的黑胶唱片上找一句歌词……        ← key ch2.p1 (auto)

::: lab ch2-model                ← component: figure partial figures/ch2-model.html + its strings
model.title: 一次 4 KB 随机读：寻道 + 转动等待 + 传输
ctl.rpm: 转速
say.full: 数据铺满整张盘：平均寻道 {s} 毫秒、转动等待 {r} 毫秒……   ← runtime placeholders, filled by app.js
:::

用 7,200 转……平均寻道 {=ch2.seek} 毫秒……每秒约 {=ch2.iops} 次……   ← build-time numbers from models.js
[[why-nvme-is-fast#ch1|「NVMe 为什么这么快」第一章]]给机械硬盘……

模型的边界：…… {.take}            ← key ch2.limit (auto for .take)
```

The full sample chapter is [site-template/example-ch2.zh.md](site-template/example-ch2.zh.md).

Rules:

- **Keys.** Paragraphs get positional keys (`chN.p1…`). `.law` maps to `chN.law`, `.take` to `chN.limit`, and
  hero paragraphs to `hero.<class>`. Anything else carries an explicit `{#key}`. Keys inside a section are
  relative (`f.seagate` becomes `ch9.f.seagate`). A key whose first segment names a section is absolute. The
  converter writes explicit keys wherever the old key was not positional, so every existing key, and every test
  that names one, survives.
- **Inline.** `**bold**`, `*em*`, `[[ref]]`, `[text](https://…)`, and raw inline HTML for the rest (`<br>`,
  `<span class="tag m">`). The converter turns `<strong>`, `<em>` and site links into Markdown only when the round
  trip is exact. Otherwise it keeps the HTML.
- **Components** (`::: <type> <name>`), each a layout-known block:
  - `strings` — a key: value table (labels, units, aria, live sentences).
  - `lab` — an interactive figure. Its DOM is a language-neutral partial `figures/<name>.html` (ids, controls,
    canvases, `data-i18n` attributes), owned next to `app.js` because `app.js` binds to those ids. The block holds
    its strings.
  - `diagram` (STANDARD §4a) — a static SVG partial `figures/<name>.svg.html`, or a spec built by `app.js`, with
    its labels and caption in the block. Numbers drawn on it use `{=name}` like prose.
  - `footer` — Markdown paragraphs.
  - Planned: `law` / `take` / `sum` as block classes (already supported as `{.law}` etc.), `readout` and `say`
    shorthands that render today's `.read` / `.say` markup, and a `:tag[已出货]{.m}` inline form for the frontier
    tags.
- **Translation contract for Haiku.** Translate the text only. Copy verbatim everything inside `{…}`, the target
  part of `[[target|text]]` (translate only `text`), every `::: …` line, every `key:` prefix, and every
  `{#key .class}`. Do not merge or split paragraphs. The build checks all of this mechanically: same block
  skeleton, same key set, same `{v}` multiset per key, same link targets per key. The prototype also checks that
  every binding is used. Today's check (same keys, same placeholders) becomes a strict superset.

### 3.3 How a number binds to the model

```js
// bindings.cjs: language-neutral; the translator never sees it
module.exports = M => {
  const D = M.disk, r = D.random(7200, 1), f1 = x => M.fmt(x, 1), f0 = x => M.fmt(x);
  return { 'ch2.seek': f1(r.seek), 'ch2.t': f1(r.t), 'ch2.iops': f0(r.iops) /* … */ };
};
```

- `{=ch2.iops}` in both language files becomes `79` at build time, via `require('./models.js')` (the UMD
  module the page already has).
- An unknown name fails the build. A binding that no paragraph uses also fails, so hand-typing "80" over a binding
  is caught (§8.3).
- The page tests keep pinning prose numbers (`says('ch2.p3', '每秒约 79 次')`). The build makes the number
  correct by construction, and the test still checks the model's value and the sensitivity claims.
- There are three classes of number, and the boundary is explicit:
  - **bound** `{=name}`: anything a model computes;
  - **runtime** `{v}`: live sentences, filled by `app.js`, unchanged;
  - **literal**: years, part numbers, citations, values quoted from a datasheet.

  A lint step (proposed, not in the prototype) lists digits in prose that are neither bound nor in a literal
  allowlist, as a review aid, not a failure.
- Canvas and diagram label checks keep working because the page's DOM and `app.js` are unchanged.
  `tests/canvas-text-overlap.cjs --sweep` ran unchanged on the prototype (§8).

## 4. Cross-references

| Syntax | Resolves to | Text |
| --- | --- | --- |
| `[[why-nvme-is-fast]]` | `../why-nvme-is-fast/` (relative, as today) | the target page title in this file's language |
| `[[why-nvme-is-fast#ch1]]` | `../why-nvme-is-fast/#ch1` | page title |
| `[[why-nvme-is-fast#ch1\|「NVMe 为什么这么快」第一章]]` | same | as written |
| `[[#ch3\|第三章]]` | `#ch3` on this page | as written |
| `[[concept:缓存行]]` / `[[concept:hdd-seek-rotation-latency]]` | the owning page and anchor from the atlas (`lessons[].primary`). Prototype: 缓存行 → `../how-cpu-caches-work/#ch2` | the concept title in this language |

- **Build-time checks, all failing the build:** unknown slug; unknown anchor on the target (checked against the
  registry's anchor list, so it also works for unmigrated pages); concept unknown or **ambiguous** (an alias owned
  by two concepts is an error, never a guess, which enforces one word, one owner); zh and en pointing at
  different targets. All four were tested in the prototype (§8.3).
- **Concept resolution** should use the same merged alias table that search uses (node aliases +
  `atlas/graph/aliases.json` + essay aliases). The prototype uses `atlas/data.js` node titles and aliases only.
  `写放大` therefore did not resolve there, although the NVMe page owns it.
- **Backlinks.** For each page, the build lists every page that links to it. The sources are `[[…]]` refs in
  migrated pages and scanned `href`s in unmigrated pages (`copy.zh.js`, `i18n.js`, `index.html`; both quote
  styles). Each entry gives the source chapter (from the copy key `chN.*`) and the target chapter. It is rendered
  as a "被这些页面引用 / Linked from" section before the footer. For the drive essay this found 9 pages, e.g.
  "SATA 为什么用了二十多年：第 1 章 → 本页第 7、2、4 章；第 5 章 → 本页第 2 章".
- **Related.** The union of `relatedPages` / atlas `seeAlso` (and later atlas edges), minus pages already listed
  as backlinks.
- **《Exact title》 mentions (the stopgap's runtime linker).** These become a build-time lint for migrated pages.
  It reports unlinked exact titles and suggests `[[slug]]`. It never rewrites prose silently, because the same
  words can be a quotation rather than a reference. The runtime linker keeps serving unmigrated pages and skips
  pages marked `data-template` (their links are already static).

## 5. Build vs runtime

**Recommendation: build-time rendering, with the outputs committed.**

| | Build (node script, outputs committed) | Runtime (browser fetches `.md`, renders) |
| --- | --- | --- |
| No-JS / crawlers | full zh text in the HTML (prototype: 13,427 visible characters with JS off; the live page shows 100) | nothing until JS runs |
| Performance | same scripts as today; HTML grows from 33.7 KB to 72.7 KB because zh is pre-filled | extra fetch + parser on every visit |
| Test stability | every existing test runs unchanged on real files; `--check` catches drift in CI | tests need a browser to see any text |
| Deploy | unchanged: `git archive HEAD \| rsync` from the committed HEAD; nothing runs on the Pi or GH Pages | unchanged, but every page also ships a Markdown parser |
| Broken refs | fail before commit | discovered by readers |
| Cost | a 400-line script, no dependencies; 0.2 s per page including the backlink scan of all 244 pages | parser in the client |

Runtime stays responsible only for what is truly live: the language toggle (`app.js` `t()`, unchanged), models,
live sentences, and canvases.

**The English first paint is not solved by either option.** Pre-filled zh flashes before `app.js` switches
language. That is the same as today, where the page is empty until JS runs. A later option is static `/en/`
twins, which the build makes cheap (decision D6).

Commands (proposed names):

```sh
node scripts/build-pages.cjs <page-dir>...        # write index.html, copy.zh.js, copy.en.js
node scripts/build-pages.cjs --all --check        # drift + parity + refs + bindings; exit 1 on any failure
node scripts/build-registry.cjs [--check]          # site-registry.json and its projections
```

## 6. UI / content separation

- **Layouts.** `templates/layouts/essay.html` and `lesson.html` (plain template strings) own: `<head>` (meta from
  the registry, cache keys from `page.json.version`), the top bar (back link + 中 | EN toggle), the breadcrumb,
  the hero (kicker, title, hero paragraphs, provenance), the TOC (essay) or step nav (lesson), section wrappers
  and the `.num` counters, the backlinks/related block, the footer, and the script tags.
- **Provenance label.** Rendered from `page-provenance.json`. The prototype needed one extra field for the
  free-text first paragraph (`note: {zh, en}`; prototype: `page.json.provenanceNote`). Once the label is
  rendered, a label repoint is a JSON edit plus a rebuild, and the HTML can no longer disagree with the inventory.
- **Chrome strings.** In the prototype, breadcrumb and backlink strings go into the page's own copy table as
  `site.*` keys. The page's existing i18n then swaps them, and the page's English CJK sweep needs no new
  exemption. The stopgap's dual `lang` spans would trip that sweep. If shared runtime chrome keeps dual spans, the
  one test change is to generalise the existing `.page-provenance .provenance-zh` exemption to any hidden
  `[lang="zh-CN"]` chrome element.
- **CSS.** Do not force one stylesheet in one step. Phases:
  1. Each page keeps its own `<style>`, moved verbatim into `page.css` and inlined by the layout (the prototype
     does exactly this, byte-identical).
  2. Shared chrome CSS: breadcrumb, xref block, top bar, TOC. This merges with the stopgap's `site-nav.css`.
  3. Extract `essay-theme.css` from the lines shared by the storage/bus family (55–91 % of each page's style
     today). Each page's `page.css` then shrinks to its own figures (`.fam`, `.lay`, `.ftl`…).

  Pages whose look is the point (numbers-lie, switches-that-compute, which shares only 20 %) keep their full
  `page.css`. The layout does not care how much page CSS there is.
- **What stays page code:** `models.js`, `app.js` and the figure partials. They are the "dynamic components"
  proper. The Markdown only places them and supplies their words.

## 7. Migration plan

### Phase 0 — foundation (about 1–2 agent-days)

- `scripts/build-pages.cjs` and `scripts/lib/template.cjs` (from the prototype); `layouts/essay.html`.
- Run the `--check` mode from `tests/` (and the GH Pages workflow when enabled).
- `specs/site-template.md` as the adopted spec. Add an amendment to specs/essays.md (Files, Registering) and
  STANDARD.md §4a (diagram blocks).
- Merge the stopgap: `site-nav-data.js` becomes a registry projection, and breadcrumb markup comes from the
  layout on migrated pages. `site-nav.js` skips pages with `data-template`.

### Phase 1 — essays (51 dirs: 35 live + 17 drafts now being written in the old pattern; about 2–3 agent-days including review)

- The **storage/bus/CPU family (about 21 pages)** has the same skeleton as the drive essay. The converter should
  run unchanged: a round trip byte-identical without chrome, copy keys equal, page tests green, then rebuild with
  chrome. That takes minutes per page, and the checks are mechanical.
- **Older essays** (numbers-lie, switches-that-compute, inside-a-phone, why-nvme-is-fast and others) have
  variant heroes and hand-built DOM. Extend the converter per variant. Where the round trip is not exact, keep
  that region as a `::: html` partial rather than force it.
- **Bindings** (`{=name}`) are **not** part of the conversion. They are added chapter by chapter by the page owner
  when the prose is next edited. The tests pin the numbers in the meantime.
- **Per-essay link checks** in `tests/models.cjs` become redundant once refs are checked. Leave them until the
  essay is next edited, then delete them in an authored commit.

### Phase 2 — registry inversion (about 2–3 agent-days)

- `page.json` replaces `REGISTRY.json` (rename + merge, and `atlas-import-registry.cjs` reads either).
- Generate `KNOWLEDGE_PAGES` and the CONCEPT-MAP tables. Backlinks for all pages.
- Concept refs through the merged alias table.

### Phase 3 — lessons (181 registered; about 4–6 agent-days + visual sampling)

- `layouts/lesson.html` (site-head header, badges, step nav, `lesson-shell`).
- Converter for `i18n.js` `STR` tables. Same approach: keys survive, `#stepN` anchors.
- Risks: strings with inline HTML built in `app.js`, per-lesson header variants, and the `variants/claude-code/`
  twins (203).
- Do the 16 `lesson-shell` pages first. Sample visual checks at 1280/390/320 zh/en for each batch.

### Stays hand-made

- `atlas/`, galaxy, the home `index.html`, `demos/fable-flight`.
- The LeetCode pipeline. It gets registry rows and chrome through an adapter, not conversion.
- Every `models.js`, `app.js` and figure partial.
- `variants/` unless decided otherwise (D5).

### Authorship and provenance when content moves

This was tested, not assumed. Git does **not** detect `copy.zh.js` → `content.zh.md` as a rename. A scratch repo
showed `A content.zh.md` / `D copy.zh.js` at any similarity setting, because every line changes form. So
`scripts/authorship.cjs` would see the new Markdown as first added by the converter commit. Under AUTHORSHIP.md
§4 that is a mechanical first add, so the file would be `unattributed`, and the author history would stay on a
deleted file.

The safe sequence:

1. **Keep `copy.zh.js` / `copy.en.js` / `index.html` committed** as build outputs, at the same paths. The
   tests, deploy and history of those files are untouched.
2. Commit the conversion as `Built-By: script (scripts/convert-essay.cjs; run by Claude Code claude-opus-5-5)`,
   `Authorship-Impact: mechanical`.
3. To carry authorship to the new Markdown, add a `Derived-From: <old path> -> <new path>` trailer that
   `authorship.cjs` treats like a rename. This is an AUTHORSHIP.md change, so it **needs Yangyu's consent and a §9
   entry** (D3). The alternative, per-file `overrides.json` entries, needs a human confirmation for each of about
   70 files.
4. **`sourceRevision` is not repointed by the mechanical migration.** `tests/page-provenance-core.cjs` requires the
   source revision to carry the developer's `Built-By`, which a script commit does not have. The label credits the
   content, and the content did not change. An optional `layoutRevision` field could record the template commit
   (D4).

### What can be automated

| Task | How |
| --- | --- |
| HTML + copy → Markdown, partials, page.css | the converter |
| Proving equivalence | the converter's own round-trip assertion, then byte comparison and the page's tests |
| Turning `<a href="../x/#chN">` into `[[x#chN]]` | the converter, when the round trip is exact |
| Rendering the provenance label | the layout, from `page-provenance.json` |
| Backlinks, related, breadcrumbs, `pages.config.js` entries, CONCEPT-MAP tables | the registry build |

Writing bindings, choosing concept refs and cleaning page CSS stay authored work.

### Risks

- **Concurrent edits.** Agents edit essays every day, and 17 essays are being written in the old pattern right now, so the converter must stay runnable after they land. Convert a page only when no one holds it, then tell agents
  to edit the Markdown. The `GENERATED` header on the copy files and `--check` in tests stop hand edits to outputs
  from surviving.
- **Converter edge cases.** The converter refuses to emit if any key is lost or doubled. Where it cannot
  reproduce a region exactly, it keeps that region as raw HTML.
- **HTML size doubles** with the zh pre-fill (+39 KB on the drive essay). This is acceptable at the site's scale
  (Cloudflare gzip). It can be made opt-out per page.
- **Two systems during migration.** Unmigrated pages keep working unchanged. The registry reads both forms.

## 8. Prototype

Location: `/tmp/agent-tasks/site-template/prototype/`. It is a mirror of the site root, with every sibling
symlinked read-only to the repo. Only `computing/systems/what-a-drive-is-made-of/` is real, and only it is
written. The code is copied to [site-template/](site-template/) as reference copies only. They resolve the site root
relative to their own folder, so they do not run from `specs/`.

| File | Role |
| --- | --- |
| `template/convert.cjs` | live `index.html` + copy files → `content.zh.md`, `content.en.md`, `figures/*.html` (9), `page.css`, `page.json` |
| `template/build.cjs` | sources → `index.html`, `copy.zh.js`, `copy.en.js`, `refs.json`; `--check`, `--no-prefill`, `--no-chrome` |
| `template/lib.cjs` | registry (pages.config.js + scanned anchors + atlas nodes), refs, inline Markdown, content parser |
| `template/site-chrome.css` | breadcrumb + backlinks styles |
| page `bindings.cjs` | 12 numbers for ch2.p3 and ch2.p4, bound to `models.js` |

### 8.1 Equivalence

- **Round trip, chrome off and pre-fill off:** the rebuilt `index.html` is **byte-identical** to the live one
  (`diff` exit 0).
- **Copy tables:** 317/317 keys in zh and in en, with identical values. Only the key order inside the object
  differs, which does not matter. 22 links became `[[refs]]`. After the round trip, 9 lines of each Markdown file
  still contain inline HTML in the zh file (`<br>` and the `<span class="tag …">` frontier tags).
- **Full build (pre-fill + chrome)** adds exactly these:
  - a breadcrumb in the hero (知识索引 › 计算与智能 › 系统与安全 › 硬盘里到底是什么; the current-page crumb is
    hidden at ≤ 640 px);
  - a "被这些页面引用 / Linked from" section listing 9 pages with chapter-to-chapter links, plus "相关页面"
    with 5;
  - 21 `site.*` keys per language;
  - zh text pre-filled inside every `data-i18n*` element;
  - one stylesheet link.

  `ch2.p3` / `ch2.p4` now take their 12 numbers from `bindings.cjs`. The values are identical to the live text.

### 8.2 The existing tests, unchanged

| Test | Result |
| --- | --- |
| `tests/models.cjs` | PASS 919/919 (live 854/854; the extra checks are the generated backlink links, which the test's own "link target exists" loop also verifies) |
| `tests/browser.cjs` at 1280/390/320, zh + en, keyboard, reduced motion, English CJK sweep | PASS |
| `tests/canvas-text-overlap.cjs --sweep` | PASS, 936 canvas states, no colliding or clipped text |
| `tests/page-provenance-core.cjs` | PASS, with the generated label. Only the harness was adapted: its directory walk does not follow the prototype's symlinks, so that one inventory-listing assertion was skipped and `root` pointed at the prototype. The per-page label assertions ran as written |

No page test had to change.

### 8.3 Failure modes, each exiting 1

- `[[why-nvme-is-fastt#ch1|…]]` → `unknown page "why-nvme-is-fastt"`
- `#ch99` → `page "why-nvme-is-fast" has no #ch99`
- `{=ch2.seeek}` → `unbound number {=ch2.seeek}` (and `binding ch2.seek is never used`)
- Typing `80` over `{=ch2.iops}` → `binding ch2.iops is never used`
- An English `{s}` renamed `{sec}` (a translator slip) → `parity: runtime placeholders differ in ch2.say.full`
- An English ref retargeted to `#ch6` → `parity: link targets differ in ch2.p3`
- A hand edit of the generated `copy.zh.js` → `--check`: `DRIFT: copy.zh.js differ from a fresh build`
- A concept alias owned twice → `concept "…" is ambiguous: a, b`

### 8.4 Screenshots

The prototype was served on `127.0.0.1:18981` and then stopped. It was compared with production at 1280 and 320
in zh and en, plus JS off. The screenshots are in `~/Documents/archive/knowledge-vis/site-template-20261115/shots/`.

- Compared by eye: the hero top and chapter 2 at both widths and in both languages. They are identical apart from
  the added breadcrumb row (+66 px at 1280, 2 rows at 320) and the backlinks block. Figures and the rest of the page
  were covered by `tests/browser.cjs` and the canvas sweep, not by eye.
- No horizontal overflow at either width.
- With JS off, the prototype shows the full Chinese essay; the live page shows only the provenance label and
  empty shells.

### 8.5 Not done in the prototype

- The lesson layout. Concept resolution through the merged search aliases. The unbound-digit lint.
- `::: diagram` (the drive essay has no SVG diagrams yet).
- Generating `pages.config.js`. Static `/en/` pages.

## 9. Open decisions for Yangyu

| # | Decision | Recommendation |
| --- | --- | --- |
| D1 | Content format: per-language Markdown files, or one file with paired zh/en blocks | **Per-language files** + mechanical parity check (Haiku translates a whole file; diffs stay per language) |
| D2 | Build-time rendering with committed outputs, or rendering in the browser | **Build-time, committed** (no-JS text, unchanged deploy, unchanged tests) |
| D3 | How authorship follows content into new files | **Add a `Derived-From:` trailer that `authorship.cjs` treats as a rename** (an AUTHORSHIP.md amendment, needs your consent and a §9 entry). The alternative is ~70 manual `overrides.json` confirmations |
| D4 | Does a mechanical template migration repoint `sourceRevision`? | **No.** The label credits the content. Optionally record `layoutRevision` |
| D5 | Scope | **Essays, then lessons.** Freeze `variants/claude-code/` (203) unless you want them in the same template. LeetCode stays on its pipeline and only gets chrome and registry rows |
| D6 | English for no-JS readers and crawlers | **Later:** static `/en/` twins generated by the same build, once the essays are migrated |
| D7 | Keys: positional (`chN.pK`) with explicit keys where needed, or explicit keys on every paragraph | **Positional + explicit where referenced or non-sequential**, which is what the converter emits. Renumbering shows as `--check` drift |
| D8 | Who owns the registry once `pages.config.js` entries are generated (agents now hand-edit a 2,574-line file) | **Generate `KNOWLEDGE_PAGES`.** Keep categories, subtopics, FEATURED and ESSAYS order hand-edited |
| D9 | Should prose references ever become atlas edges? | **No.** Keep atlas edges authored with a reason. Show missing ones as a to-do list |
| D10 | The stopgap's runtime 《title》 linker on migrated pages | **Turn it into a build lint** that suggests `[[slug]]`; keep it running for unmigrated pages |
