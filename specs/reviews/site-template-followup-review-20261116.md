# Review: site template follow-up (template features 1–6, how-sas-works and how-pcie-works conversions)

- Reviewer: Claude Code (claude-opus-5-5), independent of the builder session, 2026-11-16.
- Scope: the unpushed commits after 57cc2422: d54606f9 (template features and converter shapes), 79d42caa, 96958c09
  (how-a-cpu-does-math on the new features), b44d5f06, 3259a4fd (SAS / PCIe test adaptations), 0c3676fa, b5cdc9bd
  (how-sas-works conversion and link restoration), 50e7421e (how-pcie-works conversion), 21a4c2c8, cc5b5526,
  209e7d36, b2ab0969 (labels and notes). The live site serves 57cc2422 for both pages (`cmp` of the fetched HTML).
- Fix commit: `7747b048` (scripts, tests, specs; no page output changes, so no label repoint).

## Verdict

**Deploy after 7747b048.** Both conversions are exact. The rebuilt pages render the same text as the live pages
in zh and en. Every live link is still there (the expected changes are listed in 2). Neither origin logs a console
error, and the screenshots match the live ones pixel for pixel. The template features do what the spec says, with
the limits listed in 5.

Three defects needed fixes:
- one browser test the builder skipped was failing at HEAD;
- the `--check` generator rerun could execute a script outside the page;
- `--print-bindings` exited 0 on errors.

One authorship gap cannot be repaired by a commit and goes to Yangyu (4). Push and deploy still need Yangyu's or
Alberto's go-ahead.

## 1. Defects and fixes (7747b048)

| # | Defect | Fix |
| --- | --- | --- |
| D1 | `tests/site-nav-browser.cjs` failed at HEAD (`essay zh auto-links`: `[]` vs two links). It used how-sas-works as its auto-link host; since 0c3676fa the runtime linker is off there (D10). The builder did not run this test. | how-sas-works is now checked for `SiteNav.skipped === 'data-template'`, no runtime links, and its two restored static links (ch1.p2, ch7.p1 → what-a-drive-is-made-of#ch7) in zh and en. The auto-link, language-switch and skip-rule checks moved to the hand-written why-compute-waits-for-memory, with one paragraph added to both copy tables at run time: a scan of all 18 hand-written essays found no organic auto-link left. The `#self` fixture now uses that page's title. PASS 374. specs/site-navigation.md records it. |
| D2 | `page.json generators[].run` was not confined. A `run` of `../` × 40 plus an absolute path reached the same file from the page directory and from the scratch copy, and `build-pages --check` executed it. A marker file showed it on the d54606f9 library. The spec says "a generator reads and writes only inside its page directory", but nothing enforced it. | `run` must be a relative `.cjs`/`.js` path with no `..`, and `writes` must be globs under `figures/`. Otherwise the build fails and `--check` runs no generator. Two new failure modes in tests/site-template.cjs; one checks that the outside script did not run. Spec §3a says the rerun is not a sandbox: a generator is page code and writes through `__dirname`. |
| D3 | `--print-bindings` printed ERROR lines but exited 0. | Exits 1 when the page has build errors (new assertion). Spec §2. |
| D4 | The two conversion commits lack `Derived-From: index.html -> page.json`. All 19 batch A conversions carry it, written by hand: the converter never printed it. As a result `node scripts/authorship.cjs computing/systems/how-pcie-works/page.json` gives `primary: unattributed`, and how-sas-works/page.json shows `created: script` (its `primary: claude-code` comes only from b5cdc9bd's version bump). page.json carries the bilingual provenance note shown on the page, so this matters a little, not a lot. | convert-essay.cjs now prints the line (new assertion). The two commits cannot be repaired: AUTHORSHIP.md §4 honours Derived-From only in the commit that creates the file, and amend is not allowed. **For Yangyu:** two `authorship/overrides.json` entries (the page.json files at 0c3676fa and 50e7421e, inheriting from index.html) if he wants them; only he may confirm. Recorded in specs/site-template.md §10. |

## 2. SAS and PCIe conversions

- **Byte identity, checked independently.** In `git archive` mirrors of 0c3676fa and 50e7421e, page.json `version`
  was set back to the parent's `?v=` (20261116a, 20261115d). A build with `--no-chrome --no-prefill` gave an
  `index.html` that `cmp` finds identical to `3259a4fd:…/how-sas-works/index.html` and
  `b5cdc9bd:…/how-pcie-works/index.html`. The built copy tables equal the parents' key for key and value for
  value (SAS 469 keys, PCIe 555 keys, zh and en).
- **HEAD copy vs parent.** Ignoring generated `site.*` keys, the only changed values are SAS `ch1.p2` and `ch7.p1`
  in both languages (b5cdc9bd). PCIe is unchanged.
- **Live vs new, in Chromium.** Both pages were loaded from https://visual.integ.life and 127.0.0.1:18972, zh and
  en, at 1280 px. Compared: title, hero, TOC, footer, the text of every `section.ch`, every link and console errors.
  - Text is identical everywhere.
  - Console errors: none on either origin.
  - The only new block is `section#linked-from`.
  - Link differences:
    - Breadcrumb: the same hrefs and text, now static (`site.crumb.*`).
    - Provenance link: the SHA (SAS 9fcb9fac → b5cdc9bd, PCIe c3cef443 → b44d5f06).
    - Linked-from links (new).
    - SAS runtime auto-links. The live page has 2 in zh and 1 in en, all to what-a-drive-is-made-of (top of page).
      Locally they are static links to `#ch7`: zh ch1.p2, zh ch7.p1 and en ch1.p2.
    - SAS zh ch7.p1 used to have two anchors: the runtime one over 《硬盘里到底是什么》 and a static one over 第 7 章.
      It now has one link over 《硬盘里到底是什么》第 7 章 → #ch7. This is b5cdc9bd's design, done for parity with
      en, not a regression.
    - PCIe has no runtime links, live or local.
- **Screenshots.** Hero with breadcrumb, and the first diagram, at 1280 and 320 px in zh and en, live vs local (16
  pairs). 12 are byte-identical; the other 4 differ in no pixel by more than 32 levels. The local linked-from block
  was checked at 1280 and 320. One cosmetic point affects every template page: at 320 px a long title can push the
  following `：` / `:` onto a line of its own. Archived in
  `~/Documents/archive/knowledge-vis/site-template-followup-review-20261116/`.
- **Authorship.** `node scripts/authorship.cjs` on content.zh.md / content.en.md, page.css and figures/* of both
  pages: `created` is the original Claude Code commit (122add13, 7174f8e4), the history is inherited, and the
  script commit counts as mechanical. page.json: see D4.
- **Label repoints.** 3259a4fd (test commit b44d5f06) and 21a4c2c8 (b5cdc9bd) follow AGENTS.md:
  previousSourceRevision takes the old value and originalSourceRevision is untouched. The conversions repoint
  nothing (D4 of the spec). page-provenance-core and page-provenance-browser pass.

## 3. b44d5f06 test adaptations

Negative probes in a HEAD mirror, against the built (pre-filled) pages:

| Probe | SAS | PCIe |
| --- | --- | --- |
| `<p>手写</p>` typed into index.html | FAIL "Chinese text in index.html" | FAIL |
| Pre-filled `ch1.title` altered so it no longer equals the copy | FAIL | FAIL |
| Sibling anchor `what-a-drive-is-made-of/#ch77` | FAIL anchor check | – |
| Unused non-`site.*` zh key | – | FAIL "unused zh key" |
| en prose link retargeted (`#ch7` → `#ch6`) | – | FAIL "en links = zh links" |

`unprefill` removes only text equal to the copy table, so hand-typed text is still caught. The `site.*` skips cover
generated keys only. A retargeted link inside a `site.rel` key is no longer checked by the page test, which is
intended: that key is generated and checked by `--all --check` drift. Coverage is not reduced.

## 4. Template features (d54606f9): adversarial probes

All on copies of real pages in a `git archive HEAD` mirror.

- **Languages.**
  - These fail on a native page: a fullwidth `（`, U+3000, `[EN pending]`, Chinese in the en front-matter desc,
    `languages.zh: "stub"`, `languages.fr`, and a non-object `languages`.
  - The error for a non-object `languages` lists one line per character. It is clumsy but it fails.
  - None of the 22 pages is failed wrongly: `--all --check` PASS.
  - A stub page passes `--check` with a WARN. See 5 for what this lets through.
- **Label room.**
  - `--print-budgets` is deterministic (two runs identical).
  - The largest share on how-a-cpu-does-math is 85%, as stated.
  - An over-long en label fails with the room and position.
  - A hand edit of a generated partial fails as DRIFT through the generator rerun.
  - how-sas-works and how-pcie-works have **no** measured labels. Their diagrams are drawn by app.js (shape (a));
    the canvas sweep covers them, not the budget check.
- **Generators.**
  - how-a-cpu-does-math's tools write through `__dirname` and do no network access, so they are safe in the
    scratch copy.
  - The scratch copy is removed in `finally`.
  - Path escape: D2.
- **Dynamic keys.** These fail: a declared value missing from content, an undeclared `t('x.' + …)` prefix, and an
  empty `dynamicKeys` object while app.js builds keys.
- **Registry text.** A REGISTRY title mismatch and a heading changed without the registry both fail. The heading
  case also names pages.config.js.

## 5. Residual limits (not fixed; stated so nobody relies on them)

- **Stub pages can ship.**
  - With `"languages": {"en": "stub"}` the build gives a WARN only, and `--all --check` exits 0 on warnings. The
    Pages workflow would therefore publish a registered stub page.
  - On a converted page, whose app.js does not read `data-lang-en`, readers who choose EN would see Chinese or
    `[EN pending]` text. Only how-a-cpu-does-math's app.js implements the fallback.
  - This is the spec's design. Making a stub on a registered, non-draft page an error is a policy choice for
    Yangyu.
- **Languages check blind spots.** Chinese inside an attribute (`<abbr title="目录">`) of an English string passes,
  because `plainText` strips tags. Lowercase `[en pending]` passes. Literal Chinese in a language-neutral partial
  is not judged (§9a says so).
- **Label room blind spots.** A whole `<svg>` is skipped if it contains any `transform=`. A `<text>` is skipped if
  it holds a `<tspan>` or takes its `font-size` from CSS. Text over a line is not seen (documented in §7).
- **Dynamic-key scan.** It sees only calls named `t(`; a differently named helper (`tr('x.' + v)`) is invisible.
- **Registry text.** It compares the rendered `hero.title`, so a title containing `&` or inline markup would be
  flagged wrongly (no current page has one).
- **Scratch directories.** tests/site-template.cjs leaves `/tmp/agent-tasks/site-template-test-*` behind when an
  assertion fails (it is removed only on success).

## 6. Tests run (serially, 127.0.0.1:18972, NODE_PATH=~/fast/integ-life/integ-games/node_modules)

| Test | Result |
| --- | --- |
| tests/site-template.cjs | PASS 155 at HEAD; 162 after 7747b048 (38 failure modes) |
| tests/page-provenance-core.cjs | PASS 272 |
| build-pages --all --check | PASS 22 (before and after the fix) |
| build-site-nav --check; tests/site-nav.cjs | PASS; PASS 2275 |
| build-atlas-data --check; build-search-index --check | PASS (atlas-index 137937 bytes; 668 concepts) |
| tests/authorship-derived-from.cjs | PASS |
| page-provenance-browser | PASS 272 headers |
| site-nav-browser | **FAIL at HEAD** (D1); PASS 374 after 7747b048 |
| home-concept-search (HOME_TEST_URL) | PASS 31 |
| how-a-cpu-does-math tests/browser.cjs | PASS 174/174 |
| how-sas-works tests/models.cjs, tests/browser.cjs | PASS 2152; PASS |
| how-pcie-works tests/models.cjs, tests/browser.cjs | PASS 3993; PASS |

No test touched `leetcode/*/tests/evidence` or the photosynthesis evidence (`git status` clean apart from the
untracked directories that were already there).
