# Review: site template Phase 0 (c94da8d5, 003feed0, 8bbed67c, 0a2623a0, 08aef9ff)

- Reviewer: Claude Code (claude-opus-5-5), independent of the builder session, 2026-11-16.
- Scope:
  - D3 (`Derived-From:`);
  - build-pages, the template library, the converter and the essay layout;
  - the site-nav stopgap and the Pages workflow;
  - whether the specs are enough to write a new essay directly in Markdown.
- Fix commit: `d90e6e07`.

## Verdict

**Ship, with the fixes in d90e6e07.**
- No page is converted, so the live site is unaffected. `--all --check` passes with zero migrated pages.
- Two defects would have hit as soon as there were two migrated pages, or a first native essay. Both are fixed:
  - backlinks echoed between migrated pages;
  - a draft could not be built.
- One open issue needs Yangyu: the D3 hardening below. It changes AUTHORSHIP.md semantics.

## What was run

| Check | Result |
| --- | --- |
| `node tests/authorship-derived-from.cjs` | PASS (before and after the fix) |
| `authorship.cjs` at HEAD vs `c94da8d5~1` on 11 files (root index.html, AUTHORSHIP.md, authorship.cjs, GPU index/copy, memory app.js, site-nav.js, pages.config.js, page-provenance-core, page-provenance.json, atlas/data.js), plus `--summary` and `--commits` | stdout byte-identical; no history commit has a `Derived-From:` line, so no stderr report |
| `node tests/site-template.cjs` | 75 checks at HEAD; 82 after the fix. The new two-page check fails on the old `template.cjs` |
| Round trip of `computing/systems/how-a-gpu-computes/` in a `git archive HEAD` mirror | see D below |
| Builder's three round trips repeated with the fixed library (memory, boot, drive) | all byte-identical, copy equal |
| `node scripts/build-pages.cjs --all --check` | PASS, 0 pages |
| `node scripts/build-site-nav.cjs --check` | PASS, 248 includes; also PASS in the mirror with the GPU page migrated |
| `node tests/site-nav.cjs` | PASS, 2267 |
| `tests/site-nav-browser.cjs` on `127.0.0.1:18961` | PASS, 367 (server stopped) |
| Browser smoke test of the migrated GPU page (mirror, 390 px) | one `nav.site-nav`, `SiteNav.skipped === 'data-template'`, linked-from block in both languages, no CJK in English, no overflow, no console errors |
| `node tests/page-provenance-core.cjs` | PASS, 271 |
| `build-atlas-data --check`, `build-search-index --check` | PASS |

## Defects found and fixed (d90e6e07)

1. **Generated backlinks fed back as links (template.cjs `scanBacklinks`).**
   - The scan read a migrated page's `index.html` and every copy key. Pre-fill copies the copy table into
     `index.html`, and the `site.bl.*` / `site.rel.*` keys are the generated "linked from" links.
   - Reproduced in a scratch fixture with two migrated pages, where A links B and B does not link A:
     - B's backlink block made A "linked from B";
     - `--all --check` failed right after `--all`, so one pass was not final;
     - B listed A's link twice: `第 1 章 → 本页第 2 章；→ 本页第 2 章`. The second copy, without its chapter,
       came from the pre-filled HTML.
   - Fix: a migrated page contributes its copy table without `site.*`, plus its `figures/*.html` partials. Those
     are sources, and a `::: html` table may hold a link. Spec §7 states the rule.
2. **A native-Markdown draft could not be built.**
   - `buildEssay` required a live `pages.config.js` entry. The repo's order is build → review → register, so the
     CPU SIMD essay could not have been built, tested or reviewed.
   - Fix: a named draft directory builds from its `REGISTRY.json` with a `draft:` warning. `--all` is unchanged
     (live pages only). A `page.json` slug that differs from the slug registered for that directory is now an
     error; before, it would have built as a draft.
3. **Layout keys were not validated.**
   - `nav.back`, `nav.lang`, `toc.label`, `toc.title`, `hero.kicker` and `footer` are named only by
     `essay.html`. The §4 example omits three of them, so an author who followed it shipped an empty TOC heading
     without any error.
   - The build now fails on any `data-i18n*` key in the built page that is not defined. The 38 live essays with
     copy files name no undefined key.
   - Spec §4 now lists the page-wide keys.
4. **The converter's two-`<style>` failure was opaque.**
   - how-a-gpu-computes (the only page with two blocks) failed with a byte offset.
   - It now refuses up front, before writing anything, and says to merge the blocks first.
5. **`Derived-From` lines that take no effect were dropped silently.**
   - `derivedMissing` was set on the attribution after `commits.push({...a})` had copied it, so it never surfaced
     anywhere.
   - A missing old path, or a new path that already existed or is not in the commit, is now reported on stderr.
     stdout and `--write` are unchanged. The test pins both messages.

## Findings by area

### A. D3 (`Derived-From:`)

- **Correct as specified.**
  - The source record is snapshotted before the commit's own changes.
  - Several sources add up, and the earliest `created` wins.
  - The old file keeps its record.
  - The deriving commit goes to the new file's `mechanical` bucket when it is marked mechanical. The test pins
    this, so a `Built-By: script … / mechanical` conversion makes no one an author.
  - Files without the trailer are unaffected (verified above).
- **Open: abuse surface (needs Yangyu, AUTHORSHIP.md §4).** The trailer is honoured on any commit, authored or
  mechanical, by any committer. It can name any path ever seen in history, including deleted files. So an agent
  could hand-write a new file, declare it derived from a well-attributed old one, and both:
  - become an author of the new lines;
  - put the old file's authors on content they never wrote.

  §4 forbids this in prose, but the script does not enforce it. Recommended hardening, which costs Phase 1
  nothing because §10 already prescribes mechanical conversion commits:
  - honour `Derived-From` only on `Authorship-Impact: mechanical` commits;
  - require the old path to exist in the commit's parent tree.

  The reviewer did not make this change, because it alters an AUTHORSHIP.md rule.
- **Noted, by design:**
  - `page.css` and every `figures/*.html` inherit `index.html`'s whole record, including line counts for prose
    they do not contain;
  - `--summary` counts inherited lines twice (old and new file);
  - a body line that happens to start with `Derived-From: x -> y` counts as a trailer.

### B. Build, library, layout

- **Failure modes of §8.3.**
  - Ref, anchor, own anchor, concept (unknown and ambiguous), parity (structure, runtime placeholders, bindings,
    link targets), drift (copy, index, unbuilt Markdown), bindings (unknown and unused) and partials (missing,
    undefined key) are each covered by a failing fixture test. They exit 1 with a message that names the problem.
  - Added: missing layout key and slug mismatch.
- **Escaping.** Content is trusted, author-written HTML by design (raw inline HTML is allowed), so Markdown is not
  an injection boundary. Attribute contexts are safe:
  - class, key and `tag=` are restricted to `[\w.-]`;
  - a `style="…"` value cannot contain `"`;
  - `<title>`, the meta description, pre-filled `data-i18n` text and `aria-label` go through `esc`;
  - `data-i18n-html` values go in raw, as the runtime `innerHTML` does;
  - `page-provenance.json` values go in unescaped, as in the hand-written labels.
- **Determinism.**
  - No clocks or randomness.
  - Backlinks are sorted by path, and related pages follow REGISTRY order.
  - With fix 1, one `--all` pass is final (tested).
- **Minor, open:**
  - `renderInline` uses U+E000–E003 as escape sentinels, so content containing those code points would be
    altered. This is negligible.
  - Only the first line of a paragraph can be backslash-escaped. A wrapped continuation line that starts with
    `- `, `1. `, `#` or `:::` starts a new block. Write one paragraph per line (all converted essays do).
  - `::: strings` values are rendered as inline Markdown, so a literal `*` in a label shown through
    `textContent` must be written `\*`.
  - A draft cannot `[[link]]` to itself by slug. Use `[[#chN|text]]`.
  - In the linked-from text, a link from a chapter with no anchor shows as a bare "chapter 12" after the target
    list, for example `How Power Reaches the CPU: chapter 10 → this page chapter 11; chapter 12`. It reads as
    if it were this page's chapter. Cosmetic.
- **Backlink coupling (documented in §7).** An agent who adds a link to a migrated page from an old-style page
  makes the migrated page drift, so `--all --check` and the Pages workflow fail until someone runs
  `build-pages --all`. AGENTS.md lists the command but not this consequence. Worth a line once Phase 1 starts.

### C. Stopgap merge

- `site-nav.js` returns before any DOM work on `html[data-template]` and leaves a stub. This was verified in the
  vm test and in a real browser on the migrated GPU page.
- `build-site-nav.cjs` loads the registry through `loadPagesConfig`. The `require` cycle with `template.cjs` is
  safe: `main()` is guarded by `require.main`, and `includeLines` is required lazily.
- Its output is unchanged.
- It skips writing into template pages, and in the mirror it reported the migrated GPU page as current.

### D. Round trip of how-a-gpu-computes (not tested by the builder)

- **As is:** the converter failed, because the page has a second `<style>` block. Now a clear refusal (fix 4).
- **After merging the two blocks in the scratch copy:**
  - 447 keys per language, 12 chapters, 10 labs, 11 diagrams and one `::: html` partial;
  - `--no-chrome --no-prefill` `index.html` was byte-identical;
  - both copy tables were equal key for key and value for value. Key order differs, so `copy.*.js` are not
    byte-identical. Spec §10 now says so;
  - `tests/models.cjs` passed (4516).
- **Full build:** the only failure was the CJK-in-`index.html` check (§10 step 3), as expected. It found 5
  backlinking pages, and `--all --check` passed in the mirror.

### E. Pages workflow

Harmless:
- The workflow is `workflow_dispatch` only.
- The ubuntu-24.04 image ships Node, and the code needs nothing newer than Node 16.
- The sparse checkout keeps everything `build-pages` reads.
- Excluding `templates/` is correct.
- `content.*.md` are already excluded by `*.md`. `page.json`, `page.css`, `figures/` and `refs.json` are
  published, which is small and harmless.

Separately, the Pi deploy in HANDOFF syncs the whole archive, `templates/` included. This was true before
Phase 0 and is harmless.

### F. Specs, for a fresh agent writing a native essay

Before the fix, an agent could not have completed the essay:
- the build refused drafts;
- §4 omitted mandatory keys;
- nothing said that `app.js` must carry the i18n runtime (the template ships none) or where `page.css` comes from;
- the pre-fill / CJK test conflict was described only in the conversion procedure.

Fixed in d90e6e07:
- specs/site-template.md now has **§9a 「Writing a new essay directly in Markdown」**, covering files,
  runtime, styles, diagram shapes, build and test, commit, and registration;
- §2 describes the draft build;
- essays.md and HANDOFF point to §9a.

Nothing else blocks the CPU SIMD essay. The remaining items are judgement calls the author makes per page:
- pre-fill versus the CJK test;
- diagram shape (a) or (b).
