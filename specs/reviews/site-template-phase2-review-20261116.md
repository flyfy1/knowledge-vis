# Review: site template Phase 2 (the registry inversion)

- Reviewer: Claude Code (claude-opus-5-5), independent of the builder session, 2026-11-16.
- Scope: the unpushed commits after 356de782: 75228954 (tooling), 71144070 (seed: 227 new page.json, 22 merged, the
  fenced KNOWLEDGE_PAGES block, site-registry.json, the CONCEPT-MAP section, specs/atlas-edge-todo.md), c51930a1 (concept
  refs through the search alias table, stricter English checks, test scratch cleanup), 5de49541 (320 px colon), 3a9bfe6b
  and 71195842 (docs). The live site serves 356de782 (`cmp` of the fetched pages.config.js).
- Fix commit: `e0c9483b` (scripts, tests, spec; no generated file, page or label changes).

## Verdict

**Deploy after e0c9483b**, once Yangyu or Alberto approves the push. The inversion is exact:
- the site the reader sees is the one that is live now;
- registering a page works end to end both ways the docs describe;
- concurrent registrations merge cleanly once regenerated.

Three tooling defects were fixed. All three made the registration path an agent will now use unsafe or confusing. One
authorship side effect cannot be repaired by a commit and goes to Yangyu (5).

## 1. Equivalence

- `pages.config.js` at HEAD and at 356de782, evaluated in a vm. All six exports (CATEGORIES 18, STAGES 4, SUBTOPICS,
  FEATURED 12, ESSAYS 40, PAGES 249) deep-equal, and the key order inside every row is the same.
- `site-nav-data.js` is byte-identical to 356de782's.
- Regeneration from a clean `git archive HEAD`: `build-registry`, `build-site-nav` and `build-pages --all` change
  nothing. Then `site-registry.json` and `specs/atlas-edge-todo.md` were deleted and the KNOWLEDGE_PAGES block emptied.
  `build-registry` rewrote all three byte for byte.
- Home page, Chromium, local HEAD against https://visual.integ.life/, zh and en: the initial view, every category chip
  and every visible stage chip within each, 110 views per language. Card hrefs, titles, descriptions, badges and group
  headings are identical in content and order (origin stripped from absolute hrefs).

## 2. Registration path (scratch copy of `git archive HEAD`, /tmp/agent-tasks/p2-review/)

- **Hand-written essay**, following specs/essays.md step 4 to the letter. The draft was psychology/cognition/why-we-forget
  (copied from the untracked draft; the real draft was not touched). Steps: a page.json with title, desc and tags from
  its REGISTRY.json and `languages: ["zh"]`, an ESSAYS append, `build-registry`, `build-site-nav`, `tests/site-nav.cjs`,
  `build-pages --all`, `atlas-import-registry`, `build-atlas-data --concept-map`, `build-search-index`, `build-registry`
  again. Results:
  - every `--check` passes;
  - the row is generated last in the block;
  - the page gets its site-nav include;
  - in the browser, the card shows under 心理 in zh and en, the breadcrumb renders, and "遗忘曲线" / "forgetting curve"
    land on `why-we-forget/#ch1`.
- **Template essay.** how-a-cpu-does-math was copied to a new slug with its registry fields stripped. It builds as a
  draft (warns `draft: …`). Then the fields were added and the same commands run:
  - it appears in the block and on the home page, with `template: true` in site-registry.json and `data-template` in
    its HTML;
  - `build-pages --all` goes from 22 pages to 23;
  - every check passes.
  - Friction (not a Phase 2 defect): the draft's REGISTRY.json title must match the content heading, because
    REGISTRY.json is not yet replaced (§3b "deferred").
- **Careless paste** of a row into the generated block:
  - `--check` names the row and offers `--adopt`. Good.
  - **But the plain run dropped the row silently** (D1), and `--adopt` against a missing directory had already rewritten
    another page.json (D2).
- **Two agents at once.** Two drafts were registered on two branches (each ran build-registry, build-site-nav and
  build-pages --all), then merged:
  - conflicts in pages.config.js, site-registry.json, site-nav-data.js and specs/atlas-edge-todo.md;
  - the scripts cannot run on a conflicted pages.config.js (raw vm SyntaxError);
  - taking either side and rerunning gives exactly the tree that registering both on one branch gives (`git diff`
    empty).
  - Order cannot collide: pages without `order` sort by path. An explicit duplicate `order` or `slug` is an error naming
    both page.json files.
  - The resolution procedure was not written down; it is now in §3b.

## 3. `layout` as the template marker

- There are 22 tracked page.json files with `layout`, and exactly 22 `index.html` files with `<html data-template>`;
  the two sets are identical.
- `isTemplateDir` (template.cjs) is used by `migratedPages`/`isMigrated`, build-site-nav and the converter
  (`pjOld.layout`). site-nav.js keys on `data-template`. No page is wrongly classified.
- The one gap: `build-pages.cjs <dir>` gated on page.json existence only, so a hand-written page failed with ENOENT
  content.zh.md (D3).

## 4. Concept refs, language checks, cleanup, 320 px

- **`[[concept:…]]`** resolves through node ids, titles and the merged aliases in atlas/data.js, squashed with
  `search/concept-search.js`. It is an exact match after normalisation, and two owners is an error. All 22 pages
  rebuild unchanged.
- **`languages.en: "stub"`** is an error when `page.status !== 'draft'` (registered live or planned) and a warning on
  an unregistered draft. Correct.
  - The CJK error still told registered pages to set the stub (fixed in e0c9483b's message).
  - Residual: there is no escape hatch for an English page that legitimately needs a CJK character, e.g. a future
    essay quoting 汉字. None of the 22 needs one.
- **Scratch cleanup.** tests/site-template.cjs uses `process.on('exit')`, and tests/build-registry.cjs uses
  `try/finally`. Both clean up after a failed assertion. Neither survives SIGINT, which is acceptable. No leftovers
  were found under /tmp/agent-tasks.
- **320 px colon.** Screenshots of the linked-from block at 320 px in zh and en on how-pcie-works, how-cpu-caches-work
  and what-a-drive-is-made-of (86 rows). The ：/: sits on the title's last line in every row, and no row overflows.
  - Residual (predates Phase 2): in zh, the inline-block chapter links let "；" and "、" start a line (e.g. how-pcie-works,
    the rows from 芯片之间怎么共用内存 and 网卡是怎么搬运数据包的). These marks should never begin a line. The fix would
    be the same `display:inline` for every link in `.xref-list`, with its own cache-key bump.

## 5. Authorship

- **71144070.** The seed page.json files read `primary: unattributed`, `created: claude-code (claude-opus-5-5)
  71144070`, `claude-code (mechanical only)` (checked on physics/optics/lens/page.json), as §3b says.
  - No label or test reads page.json authorship: page-provenance-core passes 272, and the lens index.html primary is
    unchanged.
  - The fix would be 227 overrides.json entries, only if Yangyu wants it.
- **5de49541 (found in this review).** The commit is `Authorship-Impact: authored`. Besides the CSS rule, it changed the
  include line (cache key) in all 227 hand-written index.html files, so every one of them gained "claude-code: 1 commit,
  +2 lines" authored.
  - Primaries of all 227 at HEAD vs 356de782 (`scripts/authorship.cjs --json`, run in a clone at 356de782): one flipped.
    **earth/astronomy/kepler-orbits/index.html went from `unattributed` to `claude-code`**: its only other history is
    one unattributed authored line.
  - No label depends on it (kepler-orbits is not in page-provenance.json).
  - It cannot be fixed by a later commit. The rules forbid amend/rebase, even though the commit is unpushed.
    Correcting it needs Yangyu: either an overrides.json entry confirming kepler-orbits' author, or, if he prefers,
    rewriting 5de49541 before the push into an authored CSS commit plus a mechanical include-line commit.
  - Next time, split a cache-key bump that touches many pages into its own `mechanical` commit.
- Side note: `scripts/authorship.cjs --json` with many files truncates at 64 KB when piped (stdout is cut on exit);
  redirect to a file. Not fixed here (outside Phase 2).

## 6. Deploy

- **site-registry.json** (754 KB) would be published by the rsync exclude list. Everything in it is already public:
  titles and descs are in pages.config.js; concepts and aliases are in atlas/data.js and the search chunks; page.json
  is already served (`how-pcie-works/page.json` returns 200 live). No page loads it, so it costs bandwidth only on
  request. No harm. Excluding it is Yangyu's call, as HANDOFF 1c says.
- **Workflow gap.** `.github/workflows/pages.yml` does not run `build-registry --check`, and its sparse checkout drops
  `specs/`, so the check would see atlas-edge-todo.md as missing. This is documented in §3b. The workflow is
  `workflow_dispatch` only and the live deploy is `git archive | rsync`. So until the workflow gains the check,
  whoever deploys must run `node scripts/build-registry.cjs --check` locally first.

## 7. Defects and fixes (e0c9483b)

| # | Defect | Fix |
| --- | --- | --- |
| D1 | A plain `node scripts/build-registry.cjs` dropped a row pasted into the generated block and printed only `wrote pages.config.js`. The `--check` output's Fix line said to run exactly that. An agent following AGENTS.md step 2 after pasting loses its registration without a word. | The plain run refuses and writes nothing while the block holds a row no page.json registers. It names `--adopt` per row and says how to unregister on purpose. `--check`'s Fix line says `--adopt` in that case. |
| D2 | `--adopt` wrote page.json files row by row and failed later ("nothing more written"), leaving earlier rows rewritten. It also rewrote a hand-written page.json whose keys were only in another order. | All rows are validated before any write ("nothing written"). The comparison ignores key order. |
| D3 | `build-pages.cjs <dir>` on a metadata-only page.json: `ENOENT … content.zh.md`. | It now says the page.json has no `"layout"`: a hand-written page's registry row, nothing to build. Invalid JSON still reaches the parser's error. |
| D4 | The English-CJK error recommended `languages.en: "stub"` unqualified. That is an error on registered pages since c51930a1. | The message says the stub is for unregistered drafts only. |
| doc | No procedure for a merge of two registrations. | specs/site-template.md §3b "Two registrations at once". |

tests/build-registry.cjs: 54 to 60 checks. The new ones fail on the pre-fix scripts (run in the scratch archive: the
first new assertion fails).

## 8. Test results (HEAD + e0c9483b)

Static:
- page-provenance-core: 272
- site-template: 169
- build-registry: 60
- build-registry --check: 249 pages, 665 concepts, 1084 ref / 222 seeAlso edges
- build-pages --all --check: 22
- build-site-nav --check, site-nav: 2275
- build-atlas-data --check and --concept-map --check
- build-search-index --check
- atlas data-quality, concept-search: 1752
- registry-import: 22
- test_index_pagination
- authorship-derived-from

All pass.

Browser, serially, on 127.0.0.1:18974:
- home-concept-search: 31
- site-nav-browser: 374
- page-provenance-browser: 272 headers
- leetcode-home-section
- leetcode/tests/test_browser.cjs (home → collection → lesson)
- lesson-shell
- browser.cjs for how-pcie-works, how-cpu-caches-work and what-a-drive-is-made-of

All pass. No evidence directory changed.

## 9. Residual

- 5de49541's authored include-line change (kepler-orbits primary) needs Yangyu (5).
- The seed's `created: claude-code` on 227 page.json files needs Yangyu, only if wanted (5).
- The Pages workflow does not run `build-registry --check` (6).
- `--adopt` gives an adopted row `max order + 10`, so it sorts before pages registered without `order`. This is harmless
  and documented in §3b.
- A plain run still overwrites a hand edit of an *existing* row (page.json is the source). `--check` names it first.
- A conflicted pages.config.js gives a raw vm SyntaxError, not a hint.
- There is no CJK escape for English copy that legitimately quotes Chinese (4).
- zh "；"/"、" can start a line in the linked-from rows (4).
- REGISTRY.json is still required, and must agree with the content, for a template draft (deferred in §3b).
