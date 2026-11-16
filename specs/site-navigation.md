# Site navigation: breadcrumb, subtopic views, auto-links

Added 2026-11-15 by Claude Code (claude-opus-5-5) at Yangyu's request:

1. 「我在一个部分的话，希望可以看到它的 parent 页面是什么样子的。比如看到"计算机系统"，我点到"计算机"可以看到计算机的所有内容，然后"系统"就是计算机系统下面的内容。」
2. 「如果你的文章里有对应的链接，我希望你可以都加上。比如，这里提到"硬盘里到底是什么"，我希望在那个地方是可以点击对应的。你可以考虑做一个 template 来动态生成，而不是自己去写这些东西。」

Everything is generated from `pages.config.js`; nothing on a page is written by hand.

**Template pages (2026-11-16, specs/site-template.md).**
- Pages built by `scripts/build-pages.cjs` carry `<html data-template>`, a static breadcrumb with the same
  markup (`nav.site-nav`) and build-time links. `site-nav.js` does nothing on them (it leaves a `SiteNav` stub
  with `skipped: 'data-template'`).
- For them the 《title》 auto-link becomes a build lint (D10).
- `build-site-nav.cjs` reads `pages.config.js` through `scripts/lib/template.cjs`, the registry the template
  build uses, so `site-nav-data.js` is a projection of it.
- It never writes into a page that has a `page.json`: the layout emits the include lines from `includeLines()`.
  A stale one is reported with the build-pages command.
- `site-nav.css` also styles the generated "linked from / related" block (`.site-xref`). The `sn-` version was
  not bumped for that, because no unmigrated page uses those classes.

## Files

| File | What |
| --- | --- |
| `site-nav.js` | The include: breadcrumb + auto-links. Pure matcher is UMD (node tests load it). |
| `site-nav.css` | Breadcrumb and auto-link styles; colours inherit from the page. |
| `site-nav-data.js` | **Generated.** `window.SITE_NAV_DATA = {cats, subs, pages, noAutolink}`; one row per live page `[slug or "" if it equals the last path segment, path, title.zh, title.en, category, subtopic]`. Cap 60,000 bytes (about 41 KB now). |
| `scripts/build-site-nav.cjs` | Writes the data file, the subtopic redirect stubs and the include lines. `--check` fails on any drift and writes nothing. |
| `<category>/<subtopic>/index.html` | **Generated** redirect stubs, one per registered subtopic that has live pages (48 on 2026-11-15). |
| `tests/site-nav.cjs` | Node: `--check`, data vs registry, stubs, includes, matcher. |
| `tests/site-nav-browser.cjs` | Playwright: home views, breadcrumb on sample page types, auto-links, skip rules, language switch, overflow. |

## URL scheme

| URL | Shows |
| --- | --- |
| `/` | Home (featured, long reads, entrances) |
| `/?category=<cat>` | Every page of the category, grouped by subtopic; each group heading links to its subtopic view |
| `/?category=<cat>&subtopic=<sub>` | Only that subtopic; no group heading (the breadcrumb names it) |
| `/<cat>/` | Redirect stub → `/?category=<cat>` (hand-made, one per category) |
| `/<cat>/<sub>/` | Redirect stub → `/?category=<cat>&subtopic=<sub>` (generated) |

Unknown `subtopic` values fall back to the category view, as unknown categories fall back to home. `stage`
and `s` combine with `subtopic` (AND), and so does the concept search scope. Pages whose subtopic is missing
or unregistered are listed under 「其他 / Other」 in the category view; there is no subtopic view for them.
Details of the home page: specs/index-pagination.md.

## Breadcrumbs

- **Home page** (`index.html`): `全部 › <category> › <subtopic>` / `All › …`, shown in category and subtopic
  views only, above the grid. Each item is a real `<a href>` with a 48 × 48 target; a plain click switches the
  view in place (`pushState`), a modified click opens the URL. The current level carries
  `aria-current="page"`. The three links are built once and only their text, `href` and visibility change, so
  focus stays on the pressed crumb (same rule as the chips).
- **Pages**: `首页 › <category> › <subtopic>` / `Home › …`, names from `KNOWLEDGE_CATEGORIES` /
  `KNOWLEDGE_SUBTOPICS`, links to `/`, `/?category=` and `/?category=&subtopic=` with a relative URL that
  goes up through the page's depth. Pages without a registered subtopic (`atlas/`, `leetcode/`,
  `investment/atlas/`, the two demos) get two levels.
  - The `›` separator is drawn after each item but the last (`li:not(:last-child)::after` in `site-nav.css`), so
    when the trail wraps (English at 320 px) a line ends with `›` instead of the next line starting with one
    (2026-11-16, site-template Phase 1 batch A review).
- **Placement**: inside an element marked `data-site-nav` if the page has one; otherwise immediately before
  the page's only `<h1>`, or before the `.kicker` / `.eyebrow` line right above it. That keeps it in the
  normal flow of the header on every layout (essay heroes under an absolute top bar, lesson-shell headers,
  sticky step navigations below the header are untouched). It is not sticky.
- **Language** follows `html[lang]` (watched with a MutationObserver), falling back to `knowledge-lang`
  storage. `biology/cells/membrane-transport/` and `demos/fable-flight/` do not update `html[lang]` when they
  switch, so their breadcrumb stays in the language of the static attribute (known limitation).
- **Essay kickers are left as written.** Most computing essays say 「计算机 · 系统 · 一篇可以动手的长文」 in
  their copy while the registry names are 计算与智能 / 系统与安全; the breadcrumb always uses the registry
  names and sits above the kicker. Making the kickers match is a copy change for each essay.

## Auto-link contract

`site-nav.js` turns a mention of another live page into a link to that page (relative URL through the site
root, e.g. `../../../computing/systems/what-a-drive-is-made-of/`). The link covers the title only; brackets,
quotes and following text stay outside.

- **What matches**: exact full titles from `pages.config.js`, case-sensitive.
  - zh: `《title》`.
  - en: `“Title”` with curly quotes, optionally with `,` or `.` inside the closing quote (US style);
    `'` and `’` inside a title are treated as equal.
  - `<cite>Title</cite>` whose whole text is a title.
  - Not matched: shortened titles (《一堆开关》), the part before ` · ` (《RSA 公钥加密》 for
    「RSA 公钥加密 · 乘起来容易，拆开来难」), unquoted or straight-quoted titles, different case.
- **Skipped**: text inside `a`, `h1`–`h6`, `button`, `label`, form controls, `summary`, `svg`, `canvas`,
  `code`/`pre`, `[contenteditable]`, interactive ARIA roles, `[aria-hidden="true"]`, the provenance label
  (`.page-provenance`), the breadcrumb, and anything under `[data-no-autolink]` (the opt-out). A page never
  links to itself.
- **Exclusions**: `NO_AUTOLINK` in `scripts/build-site-nav.cjs` lists `[page path, title, reason]` for an
  exact match that must stay text (for example a book that shares a page's title). Empty on 2026-11-15:
  every exact match was read in context and all are references to the site's own pages.
- **Dynamic pages**: a debounced (60 ms) MutationObserver re-runs the breadcrumb mount and the auto-linker on
  added or changed nodes that contain `《`, `“` or `<cite>`, so text that `app.js` renders or re-renders on a
  language switch is linked again. Its own writes happen with the observer disconnected (`takeRecords()`
  before re-observing), so it never loops.
- **Audit**: `SiteNav.report()` in the console lists every auto-link on the page with its paragraph.
  On 2026-11-15 a sweep of all 244 live pages in both languages created 22 links (10 zh, 12 en) on 9 pages,
  eight computing/systems essays and chemistry/matter/particles-states; about 410 other exact mentions in
  the page sources were already hand-written links. Near misses that stay text because they are not exact:
  《一堆开关》 (×3), 《RSA 公钥加密》 (×2), 《复利与贴现》 (×2), 《利率与债券》, 《频率响应与滤波》,
  《计算机图形学》, 《疫苗》, 《科学》.

## Caching

The include lines carry `?v=<VERSION>` (`VERSION` in `scripts/build-site-nav.cjs`). Change it when
`site-nav.js` or `site-nav.css` changes and rerun the script; it rewrites the key in every page.
`site-nav-data.js` is fetched by `site-nav.js` with `?v=<VERSION>-<hour>`, so a newly registered page shows
up in other pages' breadcrumbs and auto-links within an hour without touching every page (Cloudflare caches
JS for four hours, HTML not at all).

## New pages

Registering a page (specs/essays.md § Registering an essay, step 4) ends with

```sh
node scripts/build-site-nav.cjs          # include lines, data file, subtopic stub
node scripts/build-site-nav.cjs --check
node tests/site-nav.cjs
```

The script inserts `<link rel="stylesheet" href="../../../site-nav.css?v=…">` before `</head>` (before
`<body>` if the page has no `</head>`) and `<script defer src="../../../site-nav.js?v=…"></script>` as the
last thing in `<body>`, so the page's own scripts have set `html[lang]` before it runs. It only touches
pages that are `live` in `pages.config.js`; drafts are never edited. Builders may add the two lines
themselves; the script leaves correct lines alone. Template pages (with `page.json`) are never edited:
rebuild them with `node scripts/build-pages.cjs` instead.

When a page's prose names another page, writing the exact title in 《》 or “” is enough for a link; a
hand-written link with a chapter anchor (`../x/#ch7`) is still better where a chapter is meant.

## Provenance

Adding the include changes each page's `index.html`, so labelled pages were repointed to the include commit
(AGENTS.md). The change is navigation only: `Authorship-Impact: mechanical`. Codex, Antigravity and
Alberto (Muse) editions keep their developer and take `specs/reviews/site-navigation-sweep-20261115.md` as
evidence, as on why-nvme-is-fast (specs/visual-page-provenance.md, 2026-11-14). Note that
specs/claude-code-editions.md did **not** repoint Codex labels for the navigation-only compare link; this
sweep follows AGENTS.md instead.

## Tests

```sh
node scripts/build-site-nav.cjs --check
node tests/site-nav.cjs
SITE_NAV_BASE_URL=http://127.0.0.1:18871/ node tests/site-nav-browser.cjs   # Playwright, serial
```
