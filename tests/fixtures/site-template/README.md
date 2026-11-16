Fixture site for tests/site-template.cjs (specs/site-template.md). Not a real page: it is a miniature site root
with its own pages.config.js and atlas/data.js, so the template build, the converter and their failure modes
can be tested without touching live pages. The test copies this folder to a scratch directory before building;
nothing here is ever written to.

- `demo/basics/fixture-essay/` — template sources (content.zh.md, content.en.md, page.json, page.css,
  figures/, models.js, bindings.cjs). It has a lab, an inline-SVG diagram and a diagram shell built by app.js.
- `demo/basics/fixture-target/` — an unmigrated page (index.html + copy.zh.js) that the essay links to and that
  links back, for anchors and backlinks.
