# Review: site template Phase 3 batch A (the lesson-shell lessons)

- Reviewer: Claude Code (claude-opus-5-5), independent of the builder session, 2026-11-16.
- Scope: the unpushed commits after af7030c6: 8a781839 (lesson converter `scripts/lib/lesson.cjs`,
  `templates/layouts/lesson.html`, tests), the 17 conversions 9fadb994 … b5ce02fd, e7e3b876 (`lesson-shell.css`
  centring of the linked-from block), 5b8a47c8 (docs). The live site serves af7030c6 for these pages: `cmp` of the
  fetched `index.html` and `i18n.js` of all 17 lessons against `git show af7030c6:` is equal (34 of 34 files).
- Fix commits:
  - 86e430f0 `lesson-shell.js`: light the first step at load (authored);
  - aeeae125 cache key `?v=20261116` on lesson-shell.css/js in the 17 `layout.html` and rebuilt pages (mechanical);
  - 12bc4310 `scanLinks`: links in a lesson's `figures/` partials are credited to their step (authored);
  - afc4d75e the rebuild for it: 11 lessons, `site-registry.json`, `specs/atlas-edge-todo.md` (mechanical, script);
  - 7d9e15fb `site-nav.js`: name the static breadcrumb on lessons whose runtime cannot (authored).

## Verdict

**Deploy after 7d9e15fb**. The conversion is exact: all 17 lessons round-trip byte for byte, and their string tables
and runtimes are unchanged. Readers saw three regressions against live; all three are fixed:
- the lit step-0 pill at load (D1);
- step credit for links in partials (D2);
- the breadcrumb's accessible name (D3).

No page lost text, links, a working step nav or the language toggle.

## Incident during the review

The first run of my equivalence script got its two arguments as one word (zsh does not split `$x`). Inside it an
unquoted `rm -rf $S` split on the space, and the second half was a relative path. It deleted the tracked files of four
lesson directories: convolution, eigenvectors, kalman and bayes-updating, 86 files. They were clean at HEAD, with no
untracked or ignored files inside (session-start status; no ignore rule matches there). `git checkout HEAD -- <the
four dirs>` restored them, and `git status` showed no change before any commit. No commit was affected. The scripts
now quote every path.

## 1. Equivalence

- **All 17 at HEAD** (not only the 4 asked for), built in a `git archive HEAD` mirror with `version` set back to each
  parent's `?v=`, `--no-chrome --no-prefill`:
  - `index.html` is byte-identical to `git show <conversion>^:<page>/index.html`;
  - the `i18n.js` tables are equal key for key in zh and en, both for that build and for the committed full build
    (minus `site.*`);
  - the runtime around the table (the file minus the table literal and the GENERATED line) is identical.
- **convolution, eigenvectors, kalman, bayes-updating**: the same check at their own conversion commits, also exact.
  climate-energy's table is `const D`, not `STR`; `splitI18n` finds it by shape.
- **After the fixes**, the no-chrome round trip still holds for all 17 pages: aeeae125 touched only `layout.html`
  include lines, which are outside the round trip. 11 pages now carry `version` 20261116b.
- **Live vs build** (convolution, eigenvectors, kalman, frozen-bubble; zh and en; 1280×900; reduced motion). Same
  across all eight runs:
  - rendered body text (minus the breadcrumb, label and linked-from block), every link (href and text), `<title>` and
    the breadcrumb items;
  - clicking the step-2 pill scrolls step 2 under the header;
  - the language toggle switches `<html lang>` and the `<h1>`;
  - no console errors or page errors on either side.

## 2. The step-0 pill (convolution 1280) — D1

The builder's cause is right in substance, but its supporting sentence is wrong. "The HEAD copy served locally does
not light it either" does not hold: af7030c6 served locally lights it exactly like live.

The mechanism:
- each page's scroll spy is an IntersectionObserver over a band of the viewport (convolution: `rootMargin -40% 0 -50%`);
- the spy only ever sets `active` on a match; it never clears a pill when a step leaves the band;
- live, the first observation runs before the deferred `site-nav.js` mounts the breadcrumb. Step 0 sits 54 px higher
  then (convolution at 1280×950: 438 px with site-nav.js blocked, 492 px after), inside the band, so pill 0 lights and
  stays lit;
- the static breadcrumb puts step 0 at 492 from the first layout, below the band, so nothing lights.

Measured live, on af7030c6 served locally and on HEAD, at 1280×800 and 1280×950 and 390×844:
- the final positions are identical everywhere;
- 11 pages lost the lit pill at some size: convolution, sampling, laplace, lti-systems, frequency-response,
  bayes-updating, monte-carlo and central-limit-theorem at 1280×950; fourier at 1280×800 and 390×844; inverted-pendulum
  at 1280×800; kalman at 390×844, and at 1280×800 live only (a network-timing race);
- the build never lit a pill that live did not.

The cost is small, but it is strictly worse, so I fixed it in `lesson-shell.js` (86e430f0), not in any page's `app.js`.
- **What it does:** after `load`, on a plain navigation (not reload or back/forward), at scroll 0, with no `#fragment`
  and no lit pill, it lights the first `.nav-step`. The spies toggle every pill on their next match, so the default is
  replaced as soon as a step enters the band.
- **Checked** on the 16 pages that load `lesson-shell.js` (14 converted, trigonometry, power-converters):
  - fresh load at 1280×800/950, 390×844 and 320×640 lights `#step0` only;
  - scrolling to step 3 leaves only step 3 lit;
  - reload mid-page and `#step3` deep links do not light step 0;
  - no page errors.
- **Exceptions:**
  - frozen-bubble already ships `nav-step active` in its HTML. It has only three steps, so its `#step3` deep link
    keeps step 0 lit. That predates this batch.
  - linear-transform, climate-energy and plate-tectonics do not load `lesson-shell.js`. They never lit a pill at load
    live either.

## 3. Converter and layout code

- **Escaping:**
  - `<title>` goes through `esc`; text keys are pre-filled escaped, HTML keys raw (as for essays);
  - `serializeTables` writes `JSON.stringify` values;
  - breadcrumb hrefs use registry ids;
  - linked-from rows insert page titles raw into HTML. "Feedback & Control" carries a bare `&`, which parses fine.
    That is shared with the essay path, and no title contains `<`.
- **Determinism:**
  - `build-pages --all --check` passes on every commit I made;
  - the en table is written in zh key order (`C.zh.order` for both), which is deterministic;
  - `scanLinks` still swallows a compile error with `catch { continue }`: a lesson that fails to compile silently
    drops its outgoing backlinks (shared with essays; residual).
- **Step-credited backlinks (D2).** §3c says a link in a lesson is credited to its step. `scanLinks` did that for keys
  in `content.zh.md` but read `figures/*.html` as one source-less entry.
  - About 37 links sit in partials, mostly the step-6 "where next" cards, so rows read
    `《卷积 · 一步一交互》：→ 本页第 2 步`.
  - eigenvectors ↔ kalman showed the same target twice (`该课第 5 步 → 本页第 5 步；→ 本页第 5 步`).
  - 12bc4310 maps each partial to the step whose `::: html` names it. The essay path is unchanged.
  - A new tests/site-template.cjs §6 assertion (216 checks) appends a link to the fixture's `figures/step0-1.html` and
    requires `该课第 0 步 → 本页第 2 章、本页第 1 章` with no source-less group. It fails on the old `scanLinks` (run in a
    `git archive HEAD` with the new test) and passes now.
  - afc4d75e regenerated 11 lessons (version 20261116b). `site-registry.json` goes from 1093 to 1092 ref edges:
    frozen-bubble's figure links now coincide with its step-2 edges and merge. `specs/atlas-edge-todo.md` was
    regenerated the same way.
  - Rows from hand-written pages stay source-less (`《一部手机里的十个道理》：→ 本页第 2 步`), as for essays.
- **aria on the breadcrumb (D3).** The build pre-fills `aria-label` only when the runtime translates `data-i18n-aria`.
  14 of the 17 runtimes do not, and `site-nav.js` skips `html[data-template]`.
  - So the converted breadcrumb was an unnamed `<nav>` landmark, where live had 页面位置 / Breadcrumb. The builder
    listed this as left over, but it is a regression for screen-reader users.
  - 7d9e15fb: on a template page whose `nav.site-nav` has no `aria-label`, `site-nav.js` sets it from `<html lang>` and
    follows lang changes. A pre-filled label is left alone, so essays and frozen-bubble, thermodynamics and
    linear-transform are unchanged.
  - Checked on all 17 pages, zh and en: one breadcrumb named correctly, the same names as the af7030c6 copy.
  - `tests/site-nav-browser.cjs` gained a convolution zh/en check with a language switch (374 → 378). It cannot pass
    on the old file, because the static nav has no label and nothing sets one.
  - No `site-nav.js` cache-key bump. That would touch 249 include lines. Hand-written pages never reach the new branch.
    For up to 4 hours (the CDN's JS cache) a reader with the old file sees the unnamed breadcrumb, which is no worse.
- **Fixture tests:**
  - §6 covers the round trip, the Derived-From lines, the generated `i18n.js`, the breadcrumb placement, the label, the
    step backlinks, six failure modes and a native lesson;
  - the builder's note that 10 assertions fail on the old tooling is plausible; I did not rerun it;
  - the new partial assertion is the one gap I found, now closed.

## 4. Authorship

- Commits that do not credit `claude-code`:
  - `attribute()` (scripts/authorship.cjs) reads only a line that starts with `Built-By:`, then an override, then
    `Co-Authored-By` when there is no Built-By;
  - "Run by Claude Code (claude-opus-5-5)." in the conversion bodies is never read;
  - the 17 conversions classify as `script` (the `\bclaude\b` rule never sees the Built-By value).
- Built-By lines are exact: 17 × `script (deterministic, no model: scripts/convert-essay.cjs)`, and 3 ×
  `Claude Code (claude-opus-5-5)`.
- Inheritance through `Derived-From`, sampled:
  - convolution `content.zh.md` and `figures/step2-1.html`: primary alberto, created by alberto 185078dd;
  - eigenvectors `content.en.md` and `layout.html`: alberto, 38cd7a24;
  - kalman `i18n.shell.js`: alberto, fb116979;
  - frozen-bubble `content.zh.md`: unattributed (from its `i18n.js` history; its `index.html` and partials read codex);
  - climate-energy `content.zh.md` and its partial: unattributed;
  - in each, `script (mechanical only): 1 commit`.
- Primaries of the 51 pre-existing files (`index.html`, `i18n.js`, `page.json` × 17): HEAD against a clone at
  af7030c6, 0 changed.
- My commits:
  - 86e430f0, 12bc4310 and 7d9e15fb touch only shared files, specs and tests (authored);
  - aeeae125 (include lines; Claude Code, mechanical) and afc4d75e (script, mechanical) are the only ones touching
    page files;
  - no label was repointed (D4).

## 5. The lesson-shell cache key

The 17 `layout.html` loaded `lesson-shell.css/js` at `?v=20261018` (12 pages) or with no key (frozen-bubble,
thermodynamics, climate-energy, plate-tectonics, linear-transform). Neither the centring (e7e3b876) nor D1 would reach a
reader holding a cached copy. aeeae125 sets `?v=20261116` on both include lines in all 17 and rebuilds: `index.html`
changes only in those lines. trigonometry and power-converters keep their keys. They have no linked-from block, so the
CSS change is moot, and they pick up the JS default when their cache expires. `templates/layouts/lesson.html` still has
no keys (no native lesson exists yet).

## 6. Test results (HEAD = 7d9e15fb)

**Static.** All pass:
- page-provenance-core: 272
- site-template: 216
- tests/build-registry.cjs: 60
- build-registry --check: 249 pages, 1092 ref / 222 seeAlso edges
- build-pages --all --check: 39
- build-site-nav --check
- site-nav: 2275
- authorship-derived-from
- build-atlas-data --check and --concept-map --check
- build-search-index --check
- atlas data-quality
- concept-search: 1752
- registry-import: 22
- test_index_pagination

**Lesson node tests.** These pass:
- climate-energy core
- eigenvectors direction-core: 5780 cases
- linear-transform
- frozen-bubble core
- thermodynamics core
- lti-systems audio-model
- laplace pole-boundaries

Pre-existing failures:
- sampling pair-core and convolution support-core `git show 198b3338:…`, which is not in this clone;
- frozen-bubble `teaching.cjs` is a browser test that needs `NODE_PATH`.

**Browser.** Run serially on 127.0.0.1:18976. All pass:
- lesson-shell, twice (before and after the fixes)
- site-nav-browser: 374, then 378
- page-provenance-browser: 272 headers, twice
- home-concept-search: 31
- eigenvectors direction-browser
- frozen-bubble browser
- convolution support-browser
- sampling pair-browser

lti-systems audio-browser times out on `#s2-audio-stop`. It does the same against af7030c6 served locally, so it is
pre-existing. Evidence went to /tmp; no repo evidence directory changed.

**Canvas sweep** (1280/390/320, zh/en), HEAD against af7030c6 served locally:
- convolution: 12 findings in both (852 / 851 states);
- thermodynamics: 2 in both (2280 states);
- the findings are identical (list in 8).

**Screenshots** (1280×900, 390×844, 320×640; zh and en; reduced motion): live against HEAD for convolution,
eigenvectors, kalman and frozen-bubble, with linked-from crops of HEAD. Archived in
`~/Documents/archive/knowledge-vis/phase3a-review-20261116/` (66 PNG).
- Pixel diffs: 5 identical. The large ones are the step-0 pill now lit (D1). The rest are 8–60 px of anti-aliasing
  spread over the frame. No layout shift.
- The linked-from block is aligned with the steps at every width.
- At 320 px in English a "→" can end a line before its target (cosmetic).

## 7. Defects and fixes

| # | Defect | Fix |
| --- | --- | --- |
| D1 | 11 converted lessons lost the step-0 pill lit at load on some window heights (live lit it through a breadcrumb race). | 86e430f0 `lesson-shell.js` first-step default; aeeae125 cache key. |
| D2 | Links in lesson partials (`figures/stepN-K.html`) were not credited to their step: source-less rows, a doubled target in eigenvectors ↔ kalman, registry edges without the step. | 12bc4310 `scanLinks` + fixture assertion; afc4d75e rebuild (11 lessons → 20261116b). |
| D3 | The breadcrumb of 14 converted lessons had no accessible name. | 7d9e15fb `site-nav.js` names it by `<html lang>`; site-nav-browser check. |
| doc | §10 said the af7030c6 copy served locally does not light pill 0 (it does); §3c called the missing aria a leftover. | Corrected in 86e430f0 and 7d9e15fb. |
| cache | lesson-shell.css/js keys predate e7e3b876. | aeeae125. |

## 8. Pre-existing lesson problems (for the page owners; not blockers)

- **trigonometry:**
  - the zh table defines `s4bridge` twice (i18n.js lines 79–80), and the second, English line wins, so zh shows English
    there;
  - en lacks the key;
  - `tests/tangent-core.cjs` fails on HEAD;
  - not converted until fixed.
- **parabola, circle-angles, lever-pulley, pinhole-camera, reflection-refraction:** the same zh-only `sNbridge` shape
  (§12 dry run).
- **power-converters:** no `i18n.js`; its steps are built by JS.
- **convolution canvas:**
  - step 0's split handle "◂▸" is drawn 6 px outside the canvas at split 0 and 100 (390 and 320, zh and en);
  - step 6's English title "Time-domain convolution (point by point)" overflows the 274 px canvas at 320 (all three
    pulse shapes).
- **thermodynamics canvas:** "start 249.4 kPa" overflows the compare canvas at 320 at vf = 12 (zh and en).
- **Other canvas findings from the builder's sweep** (same before and after conversion): monte-carlo 612,
  bayes-updating 579, frequency-response 573, sampling 504, laplace 394, eigenvectors 375, linear-transform 252.
- **stale hand-written text in `figures/`:** eigenvectors 23; bayes-updating 4; sampling, fourier, lti-systems and
  frequency-response 1 each. Readers without JS see it.
- **frequency-response:** a raw link to `../../../atlas/?trail=…` is reported as not a live page. `resolveHref` ignores
  query strings.
- **Broken tests:**
  - lti-systems audio-browser times out;
  - sampling pair-core and convolution support-core read a commit object that is not in this clone.
- **frozen-bubble:** pill 0 is lit in its static HTML, so a deep link to a step it lacks keeps pill 0 lit.

## 9. Residual

- `scanLinks` swallows a compile error, so the page's outgoing backlinks silently disappear (shared with essays).
- `site-nav.js` was changed without a cache-key bump (3, D3).
- Rows from hand-written pages have no source step. They will gain one when those pages convert.
- The linked-from arrow can wrap alone at 320 px in English.
- 3 converted lessons (linear-transform, climate-energy, plate-tectonics) do not load `lesson-shell.js`, so they do not
  get the D1 default. They never lit a pill at load live either.
