# Review: site template Phase 3 batch B (lessons without lesson-shell)

- Reviewer: Claude Code (claude-opus-5-5), independent of the builder session, 2026-11-16.
- Scope: the 179 unpushed commits 01c291e4..234ef616:
  - authored reader fixes ffe4585a (evidence note), 3a6596f3, 1ae8d66f, dcca0529, 1d15fdbe, a2f3ce49, cee87945,
    a253b912, 106ef3e8, label repoint df2524f1, particles-states 2a57bec4 + registry d9bebc9f;
  - converter 6f70a65a, bayes-diagnostics test c6dc52dc;
  - chrome: site-nav.css c2905d2b, include key d150036e, trigonometry lesson-shell key 009c48b3, site-nav.js 67a0a991;
  - 160 conversions (8ed4b909 blood-circulation … e4ecbf56 fractions), docs 234ef616.
- Baseline for "before conversion": a `git archive d150036e` copy (all reader fixes and the new site-nav.css in, no
  page converted, old site-nav.js), served locally next to the working tree.
- Fix commits: e92e2ac8 (`site-nav.js`, authored); this note and the HANDOFF line in the next commit.

## Verdict

**Ready to deploy after e92e2ac8.** The 160 conversions are exact and correctly attributed; the
authored commits are correct. Of the builder's open issues, one was a real (small) regression and is fixed, one is
cosmetic and is fixed, one was a measurement artefact, and the rest are pre-existing. Nothing blocks deployment.
Pushing still needs the usual authorisation.

## 1. The 160 conversions

- **Trailers, script-checked on all 160:** exactly one `Built-By: script (deterministic, no model:
  scripts/convert-essay.cjs)`, exactly one `Authorship-Impact: mechanical`, a `Verified-By` line, and one
  `Derived-From:` per added file (the generated `refs.json` excepted), each old path present in the parent, each
  target added in that commit, no duplicate targets, nothing derived from outside the page.
- **No authored change mixed in:** every added file is inside the page; inside the page only `index.html`, `i18n.js`,
  `page.json` are modified; outside it only `site-registry.json`, `specs/atlas-edge-todo.md` and other template pages'
  generated outputs (`index.html`, `i18n.js`/`copy.*.js`, `page.json` with only `version` changed). In all 160
  `page.json` files every pre-existing (registry) field is unchanged except `version`, and the only added fields are
  `layout`, `version`, `titleKey`, `enCjk`, `legacyLayout`, `runtimeKeys`, `placeholderRepeats`.
- **Round trip at HEAD, all 160** (not a sample): in a `git archive HEAD` mirror, `version` set back to the parent's
  `?v=`, `build-pages --no-chrome --no-prefill`: `index.html` is byte-identical to `git show <conversion>^:index.html`
  (after normalising the site-nav include key and trigonometry's later lesson-shell key), both `i18n.js` tables equal
  key for key (minus `site.*`), and the runtime around the table identical. 160 of 160.
- **Authorship carries over** (`scripts/authorship.cjs` on `content.zh.md`, `content.en.md`, `layout.html`):
  trigonometry, pinhole-camera, particles-states, lever-pulley → alberto (created 0959e4e4 / 73ecf4b4 / 399ce9bb /
  6418df0f), cell-structure → codex (d0069dd2), each the same primary as the old `i18n.js`, with `script (mechanical
  only): 1`. trigonometry's content also lists the Claude Code table fix (claude-code: 1 commit, +1 line).

## 2. Authored commits

- **Duplicate `sNbridge` keys (6 pages):** each removes the English line from `STR.zh` and adds it unchanged to
  `STR.en`; the Chinese first line stays, so zh now shows Chinese and en has the key. Correct. The evidence note
  (ffe4585a, completed in df2524f1) names the original commits and the failing page tests.
- **phonemes `next4` / coordinate-plane `reset`:** zh values are the hand-written button text; en are new short
  strings in the pages' voice. Both pages' specs updated in the same commits (specs/linguistics-phonology.md,
  specs/coordinate-plane-distance.md).
- **Label repoint df2524f1:** trigonometry, pinhole-camera, reflection-refraction: `sourceRevision` → their fix
  commits, old 70d9f2e1 → `previousSourceRevision`, `provenanceEvidence` → the note; developer, kind, edition, scope
  kept; the static label's `data-source-revision`, link and short SHA changed together. Per AGENTS.md. The labels now
  render from `page-provenance.json` through `legacyLayout.label` (trigonometry checked in the browser: 3a6596f3).
  `page-provenance-core` 272 pass.
- **particles-states 2a57bec4:** the live runtime link becomes a real link in both languages; d9bebc9f rebuilds the
  registry (the builder documents that `build-registry --check` fails at 2a57bec4 alone). Minor wording left to the
  page owner: en still ends "(a later “Molecules & Atoms” page will pick this up; noted here in text only)", now
  around a link. Live readers already saw it linked by site-nav.js, so nothing changed for them.
- **Converter 6f70a65a:** `shellKeys` scans the shell with the main table replaced by `{}`; `runtimeKeys` fail if
  content defines them or no other table defines them in both languages; `placeholderRepeats` relaxes only the
  multiset to the set and still fails a different set; the `<html lang>` capture accepts `[\w-]+` and writes the same
  value back; the wrapped-`<h2>` detection only fires when the step has no top-level `<h2>`. tests/site-template.cjs
  234 pass. No issue found.
- **bayes-diagnostics c6dc52dc:** skips `site.*` keys as the essay tests do; page unlabelled; harmless (the page was
  not converted).
- **c2905d2b / d150036e / 009c48b3:** CSS rules match only `html[data-template="lesson"]` without lesson-shell.css (the
  colour rule is zero-specificity); d150036e changes only include keys (every `-`/`+` line differs only in
  `sn-20261116b` → `c`); 009c48b3 changes only the two lesson-shell lines in trigonometry's `layout.html` and
  `index.html`. Labels not repointed (D4), correct.
- **Docs:** §10 said the conversions run "from z-transform 57575cb0"; the first is blood-circulation 8ed4b909
  (z-transform is 157th). Corrected.

## 3. Builder's open issues

### (4) No lit pill between step 0 and step 1 — real, fixed

- **Cause** (67a0a991): on pages without a working spy the default is taken back in a `scroll` listener once step 0's
  bottom is above 40 % of the window. 84 of the 160 pages have a spy band ending exactly at 40 %
  (`rootMargin: -30% 0px -60%` on 78, `-25% 0px -60%` on 6). Step 1 enters the band at the same scroll position, but
  the scroll event runs before the IntersectionObserver callback, so the default goes first and step 1 lights a frame
  later.
- **Reproduced** with real wheel scrolling (Playwright `mouse.wheel`, 100 px notches, a rAF recorder of the lit
  pills): 67a0a991 gives `0 > (none) > 1` on cell-structure and pid-control at 1280×800, and again at 390×844 (about
  16 ms, one frame); the hand-written copy and the fix give `0 > 1`. Programmatic 12 px steps sampled two frames
  later never showed it (160 pages × 1280×800, 1280×950, 390×844), so it is a one-frame flicker, not a long stretch.
- **Fix:** take the default back only when step 0 has left the window (`bottom < 0`). Every spy band lies inside the
  window, so step 1 has crossed it by then; this matches the hand-written pages, which kept pill 0 until the spy lit
  step 1. On pages with no spy, pill 0 now stays lit while any of step 0 is on screen (the hand-written pages lit
  nothing there; the builder accepted that difference at load, as batch A did).
- **Test:** site-nav-browser gains a wheel-scroll check on cell-structure (fails on 67a0a991:
  `>0>>1>2`), and a binary-search check that pill 0 stays lit with step 0's bottom at 20 % of the window (the old
  40 % rule fails it); the existing step-3 checks (cell-structure `3`, binary-search ``) still pass.

### (1) Linked-from block 4 px in at 390/320 — fixed

- 55 batch B pages set `.step` side padding to 12px in their own media query (breakpoints 640, 720, 760px); the block
  takes `var(--gutter,16px)` from site-nav.css. No single CSS rule fits all (7 no-gutter pages keep 16px).
- **Fix:** site-nav.js copies `#step1`'s (else the first `.step`'s) computed side padding onto `section.site-xref` on
  load and resize, on lessons without lesson-shell.css. Without JavaScript the 4px stays.
- Measured on all 111 pages with a block (step-1 `<h2>` left vs block `<h2>` left): 1280 0 → 0 off, 390 45 → 0,
  320 45 → 0. site-nav-browser gains blood-circulation at 1280/390/320.

### (2) lever-pulley `#step2` / `#step3` landing short — not a defect

- The page sets `html{scroll-behavior:smooth}`, so the fragment scroll is animated. A trace of `scrollY` per frame:
  both copies start the smooth scroll about 0.89 s after navigation and reach the same place (step 3 at 76 px); the
  build fires `load` at ~60 ms, the hand-written copy at ~0.9 s. A reading taken 1.5 s after `load` therefore caught
  the build mid-animation (95 / 196 px). After 4 s both land at 76 px in every run, at 1280×950 zh and 390×844 en; the
  hand-written copy also read short (212 px) in one early sample. three.js initialises on both (`__LP3D_OK`, `#gl-fail`
  hidden, 5 canvases, no page errors).

### (5) Pre-existing

- Overflow is the same on the d150036e copy and the build: rsa-encryption 27 px at 390 and 320 (zh, en), fractions
  23 px (zh) / 35 px (en) at 320, coordinate-plane 2 px at 320 en.
- The 16 `stale:` warnings come from hand-written text in the old `index.html` that the partials keep byte for byte
  (the round trip proves it); integral and frequency-response `atlas/?trail=…` links predate the batch.
- trigonometry's "对照 Claude Code 版" button sits left of the content column at 1280; identical on the old copy.

## 4. Hand sample in the browser

14 pages across the batch B shapes, d150036e copy vs working tree, zh and en, 1280×900 / 390×844 / 320×640, reduced
motion (84 pairs): dna-replication (`runtimeKeys`), fractions and chicken-rabbit (`placeholderRepeats`; chicken-rabbit
also `lang="en"`), cell-structure (`lang="en"`), blood-circulation and particles-states (`h2part`), trigonometry and
pinhole-camera (labelled), lever-pulley, phonemes, coordinate-plane, rsa-encryption, gravity-orbits,
veil-of-ignorance.

- Equal on both sides in all 84: `<html lang>`, `<h1>`, `<title>`, breadcrumb count, name (页面位置 / Breadcrumb) and
  items, the number of links in the steps, page errors (none), console errors.
- English: CJK characters in the rendered text outside the new block equal the old page's; the linked-from block has
  none. Chinese: runs of six or more Latin words equal the old page's (no English leaked in).
- Lit pill at load: the build lights pill 0 where the old copy lit nothing at that size (the D1 default); never the
  other way round.
- Linked-from rows read `《课名》：该课第 N 步 → 本页第 M 步` / `Title: its step N → this page step M`, essays as
  `该文第 N 章` / `its chapter N`; heading aligned with the steps at every width after the fix.
- Screenshots (first screen of both copies, block crops) in /tmp/agent-tasks/phase3b-review/shots/; looked at
  chicken-rabbit en 390, trigonometry zh 1280, blood-circulation en 320, lever-pulley zh 1280: the same as the old
  page apart from the lit pill.
- One cosmetic row: pinhole-camera's row from linear-functions reads `→ 本页#geometry-bridge` / `→ this page
  #geometry-bridge`, because the link targets an element id that is not a step (shared template code; the link works).

## 5. Checks (working tree with the fix)

Static, all pass: build-pages `--all --check` (199 pages), build-registry `--check` (249 pages, 1130 ref / 222 seeAlso
edges), tests/site-template.cjs 234, tests/build-registry.cjs 60, page-provenance-core 272, build-site-nav `--check`,
tests/site-nav.cjs 2275, build-atlas-data `--check` and `--concept-map --check`, build-search-index `--check`, atlas
data-quality, concept-search 1752, registry-import 22, authorship-derived-from, test_index_pagination.

Browser, serially on 127.0.0.1:18981 (NODE_PATH as AGENTS.md): site-nav-browser 389 (twice),
page-provenance-browser 272 headers, home-concept-search 31, lesson-shell 8 of 8. Evidence went to
/tmp/agent-tasks/phase3b-review; `git status` shows no change under leetcode/*/tests/evidence or
biology/cells/photosynthesis/tests/evidence.

## 6. Cache key

The site-nav.js change keeps include key `sn-20261116c`: d150036e introduced it in this unpushed batch, so no reader
holds a cached copy under that key. No include line changed.

## 7. Residual (not blockers)

- pinhole-camera `→ 本页#geometry-bridge` row (above).
- particles-states en "noted here in text only" now sits around a link (page owner).
- Without JavaScript the linked-from block keeps the 4 px offset on the 45 pages.
- On pages with no working spy, pill 0 stays lit while step 0 is on screen; the hand-written pages lit nothing.

## My commits

- e92e2ac8 `site-nav.js`: pill 0 kept until step 0 leaves the window; linked-from block takes a step's side padding;
  site-nav-browser 384 → 389; specs/site-template.md §3c, §10 (authored).
- The commit adding this note and the HANDOFF 1e line (authored).
- No page sources changed, so no label repointed and no page rebuilt.

