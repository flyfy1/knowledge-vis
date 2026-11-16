# Review: site template Phase 1 batch A (19 computing/systems essays)

- Reviewer: Claude Code (claude-opus-5-5), independent of the builder session, 2026-11-16.
- Scope: bb10f897, 9a470caf, 42fba818, fca24bb5 … 8b2dac73 (19 conversions), 07c86274. Not pushed or deployed at the
  time of review; the live site (https://visual.integ.life) still serves the hand-written pages.
- Fix commits: `55ca4889` (site-nav key, mechanical), `78c4ed90` (breadcrumb separator), `144500ef` (links, lint,
  backlinks), `25da71be` (labels, mechanical).

## Verdict

**Deploy, with the fixes above.** The conversion itself is sound: every page rebuilds byte for byte, renders the same
text as the live page in both languages, and passes its own tests. One real regression was in the batch: the 20
runtime 《title》 links readers have today would have disappeared, and the build lint undercounted them (19). Both are
fixed, together with a backlink defect that made `--all` need two passes. Deploy with the usual
`git archive HEAD` route; the page script keys were not bumped (see 5).

## 1. Equivalence

- **Round trip.** In a `git archive HEAD` mirror, `--no-chrome --no-prefill` builds of how-a-nic-moves-packets,
  how-a-computer-is-wired, how-cores-share-memory, storage-over-a-network and how-a-gpu-computes were compared with
  `git show <conversion>~1:…/index.html`. The only difference is the `?v=` key of the four page scripts (the
  intended bump). Both copy tables are equal key for key (470, 420, 476, 518, 447 keys).
- **Live vs new.** The parent commits differ from the live HTML only by the pre-batch commits (label repoint, GPU
  `<style>` merge, wired whitespace and `</head>`).
- **Rendered semantics.** All 19 pages were loaded from live and from the new build in Chromium (zh and en, 1280 px).
  The script compared body text (label, breadcrumb and linked-from removed), every `<a href>` with its text, all
  element ids, the breadcrumb and console errors.
  - Before the fix: text identical everywhere; the only losses were the runtime auto-links (2.).
  - After the fix: text identical on all 19 pages. Every live link is present; the new ones are the static
    breadcrumb (same three crumbs), `#linked-from`, and the link restorations. No console errors.

## 2. The lost links (fixed in 144500ef)

- `site-nav.js` skips `html[data-template]` (D10). A sweep of the live pages with `SiteNav.report()` found **20**
  runtime links on 8 of the 19 pages. The lint listed 19: it matched only `“Title”`, while the runtime accepts
  `“Title.”` / `“Title,”`, `'` / `’` and `<cite>`. The miss was `“Drives Across a Wire.”` in how-a-nic-moves-packets.
  - The spec's procedure leaves lint lines to page owners. Following it, an owner would still have lost that link.
- **Fix.** All 20 are now `[[slug]]` / `[[slug#chN|…]]` refs in both `content.*.md`. Where the prose names a chapter,
  the ref points to it, and the build checks the anchor.
  - Parity forced two links the runtime never made: the zh 「NVMe 为什么这么快」第五章 in what-a-drive ch6.limit, and
    the unquoted English title in the virtual-memory footer.
  - The lint now mirrors the runtime matcher; `--all --check` reports 0 lint lines.
- Two of the 20 were not paragraphs: how-cores-share-memory `dg.mesi.cap` and how-memory-talks `ch7.model.how`.
  Both partials use `data-i18n-html`, and the app fill uses `innerHTML`, so the links render.

## 3. Backlinks needed two `--all` passes (fixed in 144500ef)

- `scanBacklinks` read another migrated page's generated `copy.zh.js`. `--all` builds in order, so after adding links
  the first `--all` left four pages drifting: what-a-drive, wired, cpu-caches and cores. They were built before the
  pages that now cite them.
  - The Phase 0 claim "one `--all` pass is final" held only when no source changed.
- Now the scan compiles the cited page's `content.zh.md`. The new fixture check fails on the old library.
- A link in a non-chapter key (a diagram caption) used to render as a bare `；→ 本页第 11 章`. One was already live
  in the NIC page, from a storage-over-a-network ch6 caption. Such a link is now credited to its chapter.
- **Wording.** The source chapter in the linked-from row now reads 该文第 N 章 / its chapter N, so it is no longer
  confused with this page's chapter.

## 4. The 9a470caf test changes

- **unprefill negatives.** These ran on the built how-a-nic-moves-packets in a mirror, through `tests/models.cjs`.
  Each failed "Chinese text in index.html":
  - a hand-typed `<p>` in `<main>`;
  - extra text before a `data-i18n-html` value;
  - the value followed by 。;
  - extra text in a figcaption;
  - a stale pre-filled `nav.back`;
  - a wrong `aria-label`.

  Text inside the provenance `<details>` passes, as it did before (that block was always stripped).
- **`site.*` skips.** They are correct for generated keys. Before the fix, content could define its own
  `site.whatever` key: it would escape those scans and collide with nothing. The build now fails on any content
  key under `site.` (fixture test added).
- **Cache-key pins** (cpu-runs, gpu, memory, power). They now compare the HTML with `page.json.version`, which
  the build writes. That is weaker than a literal pin in principle. But the literal pin also passed whenever a bump
  was forgotten, and it only forced a test edit on each bump. **Not counted as loosening.**
- **Tests that count links or numbers** (sata, usb, storage, wired) still pass with the restored links; none needed
  changes.

## 5. Cache keys

- `page.json` versions were not bumped although copy tables changed. Live serves 20261115x, or 20261116a / 20261116d
  on S1, S2, S4 and S5. Batch A's keys (20261116a, 20261116b on S1/S2, 20261116e on S4/S5) have never been deployed,
  so nothing is cached under them.
  - Anyone who deploys a batch A version and then changes a copy file must bump.
- `site-nav.css` changed, so the include key went from sn-20261115 to sn-20261116 on all 248 live pages
  (`55ca4889`, the token only).
- **Untracked draft.** `computing/systems/how-a-cpu-does-math/` still names sn-20261115. Its owner gets the new key
  on the next `build-pages` run.

## 6. Authorship

- `scripts/authorship.cjs` was run on:
  - nic `content.zh.md`, wired `content.en.md`, sata `content.en.md`, drive `content.zh.md`;
  - GPU `page.css`, memory `figures/ch1-model.html`;
  - nic and cpu-caches `copy.zh.js`.

  Each inherits the creating commit and the authored commit counts of its old file, with `derived from` naming the
  conversion commit. The converter's script counts as mechanical only.
- Each of the 19 conversion commits:
  - is mechanical;
  - has one `Derived-From` line per added file except `page.json`.
- `--summary` writes nothing to stderr, so no `Derived-From` line was dropped.
- After 144500ef, nic `content.zh.md` shows claude-code with 2 authored commits. The repointed labels credit 144500ef.

## 7. Tests run (final state, 25da71be)

| Check | Result |
| --- | --- |
| `build-pages --all --check` | PASS 19, 0 lint lines |
| `tests/site-template.cjs` | PASS 104 (89 at 07c86274; +15 checks, which fail on the old library) |
| `build-site-nav --check`, `tests/site-nav.cjs` | PASS 248 includes, PASS 2267 |
| `tests/page-provenance-core.cjs` | PASS 271 |
| `build-atlas-data --check`, `build-search-index --check`, `atlas/tests/data-quality.cjs`, `tests/concept-search.cjs` | PASS |
| `tests/models.cjs`, all 19 pages | PASS |
| `tests/browser.cjs` (zh+en, 1280/390/320) | PASS: the 8 edited pages + wired, run while the caption-credit change (144500ef) landed, which altered only the linked-from rows of cpu-caches and nic; those two, plus gpu, boot and sata, were rerun on the final state (25da71be) |
| `PROVENANCE_BASE_URL=… tests/page-provenance-browser.cjs` | PASS 271 page headers (both locales, desktop/320, keyboard, no-JS, forced colours) |
| `SITE_NAV_BASE_URL=… tests/site-nav-browser.cjs` | PASS 367 |
| Live vs new, rendered text + links, 19 pages × zh/en | identical text, no link lost, no console errors |

- The home page does not include site-nav and was not changed, so `home-concept-search` was not run.
- Browser tests ran serially on `127.0.0.1:18968`, and the server was stopped afterwards.

## 8. Visual

- **Pages and widths.** Five pages (how-a-nic-moves-packets, how-a-computer-is-wired, how-cores-share-memory,
  storage-over-a-network, how-cpu-caches-work) at 1280 and 320 px, zh and en, new build and live. Each run captured
  the hero with the breadcrumb, the linked-from block and the first diagram.
- **Diagrams.** All 20 first-diagram screenshots are pixel-identical between live and new.
- **No horizontal overflow** at either width.
- **Breadcrumb.** It sits at the same place as the live runtime breadcrumb.
  - At 320 px English, the live page and the pre-fix build start the second line with `›`.
  - After 78c4ed90 the first line ends with `›` and the second starts with "Systems & Security", aligned with the
    text.
- **Linked-from.** The block reads clearly in both languages: 该文第 N 章 → 本页第 N 章 / its chapter N → this page
  chapter N.

## Decisions for the lead

- **Labels.** 144500ef changed generated files in all 19 page directories, but only 8 have new content. Their
  labels point to 144500ef (25da71be). The other 11 changed only in generated backlink rows, which is treated as
  mechanical, like D4:
  - the 11: how-a-computer-boots, how-a-computer-is-wired,
    how-a-cpu-guesses-ahead, how-a-gpu-computes, how-cpu-caches-work, how-pixels-reach-a-screen,
    how-power-reaches-the-cpu, how-sata-works, how-the-os-talks-to-hardware, how-thunderbolt-works and
    how-usb-drives-talk.

  42fba818 repointed pages whose only change was a test file. To match that stricter reading, do one mechanical
  commit: edit `page-provenance.json` for the 11, then `build-pages --all`.
- **Script keys.** `page.json.version` was not bumped, which departs from §9 step 4. No batch A key has been served
  yet (5). If a bump is preferred anyway, set all 19 to the next letter before deploying.
- **Deploy size.** The deploy carries 248 `index.html` files that differ only by the sn- token, plus the 19 pages.

## Residual (not blocking)

- At 320 px, a long source title in the linked-from list can push its `：` / `:` to the start of the next line,
  because `.xref-list a` is `inline-block`. It is cosmetic. The fix (inline links) needs a check that the 24 px
  target rule still holds, so it was left.

- how-sas-works and how-pcie-works still need converter variants (spec §12).
- The `figures/*.html` inheritance counts all of `index.html`'s lines (noted in Phase 0).
- Six of the eight edited pages have no `specs/<slug>.md`. Their fix is recorded in specs/site-template.md §10, and
  storage and drive got a line in their own specs.
