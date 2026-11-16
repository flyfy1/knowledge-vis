Fixture site for tests/site-template.cjs (specs/site-template.md). Not a real page: it is a miniature site root
with its own pages.config.js and atlas/data.js, so the template build, the converter and their failure modes
can be tested without touching live pages. The test copies this folder to a scratch directory before building;
nothing here is ever written to.

- `demo/basics/fixture-essay/` — template sources (content.zh.md, content.en.md, page.json, page.css,
  figures/, models.js, bindings.cjs, tools/gen.cjs). It has a lab, an inline-SVG diagram (figures/dg-stack.html,
  written by tools/gen.cjs and declared in page.json "generators") and a diagram shell built by app.js.
- `demo/basics/fixture-target/` — an unmigrated page (index.html + copy.zh.js) that the essay links to and that
  links back, for anchors and backlinks.
- `demo/basics/fixture-lesson/` — a hand-written lesson (index.html + i18n.js `STR` table, Phase 3, specs/site-template.md
  §3c). It is not in pages.config.js: tests/site-template.cjs §6 registers it in its scratch copy, writes the current
  site-nav include lines and the provenance label into index.html (the `<!--SITE-NAV-…-->` and `<!--LABEL-->`
  placeholders; tests/page-provenance-core.cjs counts every labelled .html in the repo), converts it and builds it.
