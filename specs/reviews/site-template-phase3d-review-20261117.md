# Review: site template Phase 3 batch D (power-converters, Codex edition)

- Reviewer: Claude Code (claude-opus-5-5), independent of the builder session, 2026-11-17.
- Scope: the seven unpushed commits 453f0c4a..b12d8f5f:
  - 7b8811c4: string table, mechanical, `Derived-From: app.js -> i18n.js`;
  - 6df26b96: refactor, authored;
  - 83ace1bd: generated files;
  - 8a08139f: label;
  - 6e08c693: conversion, `Built-By: script`;
  - 1ffbcfa5: atlas browser-test fix;
  - b12d8f5f: docs.
- Baselines:
  - `git archive 453f0c4a` (full tree), served on its own port next to the working tree;
  - the parent `app.js` for the table check.
  - Scratch is in /tmp/agent-tasks/phase3d-review/.
- Fix commits:
  - 352e8f3a: English step-0 formula spacing and `enCjk` removed (authored);
  - 3c20ff01: label repointed (mechanical);
  - this note and the HANDOFF line are in the commit after 3c20ff01.

## Verdict

**Ready to deploy after 352e8f3a and 3c20ff01.** Pushing and deploying still need Yangyu's go-ahead.

- The mechanical handling of 7b8811c4 is honest.
- The page behaves like the 453f0c4a page in every state I compared.
- All seven atlas deep links land on the same headings.
- The page's own tests, the canvas sweep, the shared checks and the browser tests pass. The two atlas core tests
  are the exception: they failed before this batch, and for a different reason than HANDOFF 1g gives (§4).
- One change: the English formula's ideographic spaces and the `enCjk` exception they needed. Nothing blocks.

## 1. 7b8811c4 as a mechanical commit with Derived-From

**Verdict: acceptable as committed. No follow-up is needed.**

I reproduced the table check with my own script, `verify-table.cjs` plus `composed.cjs`. It extracts every
`tr('…','…')` / `btn(id,'…','…')` literal pair from `app.js` at 453f0c4a and evaluates `STR` from `i18n.js` at
7b8811c4. Results:

- **180 keys,** in the same order in zh and en.
- **145 values are one old literal pair, character for character.**
  - My regex matched 136 directly.
  - The other 9 are `btn()` calls whose id is an expression (`kind+'-plus'`) or whose text is an
    `isL ? … : …` choice between two literals: the six pulse buttons, `reset`, `cvNext` and `cvReset`. I checked
    those by reading the source.
- **32 values are deterministic compositions.** I rebuilt each from the old code and literals, and all 32 match
  with 0 differences:
  - kickers `${tr('第','STEP')} ${n} / 6 · ${names()[n]}`;
  - nav items `${i} ${n}`;
  - `OpenStax · ` / `TI · ` / `Analog Devices · ` + title;
  - the formula lines `s0power`, `s0laws`, `s1setup`, `s2setup` and `cvParams`;
  - the step-6 sentence, with the link markup exactly as the old code wrote it;
  - the two branches of the pulse-count ternary;
  - the status fragments. Their separators moved into code: `changed` lost its trailing space, `cyclesDone`
    its leading ` · `, and the branch strings are prefix + tail.
- **3 values are template literals** (`rateSummary`, `energyCaption`, `areaSummary`). The `${f(x)}` parts became
  `{name}`, and the fixed text is unchanged, including the original `Vµs,negative` with no space.
- All 166 literal pairs in the old `app.js` are used, so no string was dropped.

What is not Codex's in that commit:

- the 180 key identifiers;
- the names of the 14 placeholders;
- a 3-line header comment.

None of it is wording a reader sees, and none of it is structure beyond moving the strings. That fits AUTHORSHIP.md
§1.4 (纯搬迁 is mechanical) and the §4 condition that the content is a mechanical transcription backed by a
key-for-key check. Every structural change (static markup, `t()` / `applyLang()`, the `app.js` rewiring) is in
6df26b96, which is declared authored. The `Derived-From` conditions hold:

- the commit is mechanical;
- `app.js` exists in the parent;
- `i18n.js` first appears in 7b8811c4.

`node scripts/authorship.cjs` reports no refusal on stderr. It gives `primary: codex` for `i18n.js`,
`content.zh.md`, `content.en.md`, `i18n.shell.js`, `layout.html`, `index.html` and `app.js`.

One artefact is worth knowing so that a later reader does not misread it. `content.*.md` show "claude-code: 1 commits,
+17 lines" because inheritance follows the whole history of `i18n.js`, including the `t()` / `applyLang()` lines from
6df26b96, which now live in `i18n.shell.js`. Primary stays codex (141 against 17). This is the documented behaviour of
§4, not a defect.

The alternative was an authored table commit. That would have credited Claude Code with Codex's 180 strings, which
is exactly what §4 is meant to prevent. The precedent is not identical: batch C's acid-base flattening (5ac069a2)
was authored, but it was Claude Code's own text, so no credit moved.

## 2. Behaviour equivalence (independent run)

**Method:**

- My own script (`equiv.cjs`), not the builder's.
- 453f0c4a full archive on 127.0.0.1:18872 and the builder's tip b12d8f5f on 127.0.0.1:18871. The comparison
  predates 352e8f3a, which changes the English `s0power` on purpose.
- Chrome, reduced motion, device scale 1, zh and en at 1280/390/320. The language was set through `localStorage`
  before load.
- 18 states each:
  - initial;
  - output voltage 24 and 6 V;
  - inductor +,+,0,− and on to the 16-pulse limit;
  - capacitor +,−,0;
  - diode reversed with PWM 75 %;
  - Buck advanced three half-phases, then D 75 % and Vin 5 V;
  - seek 37.5 µs, derivation opened, area "ON end", then "one period";
  - reset and two-cycle completion;
  - Boost advanced, D 20 %, Vin 7 V, seek 80 µs;
  - prediction "smaller", reveal, η 80 %;
  - language switched, and switched back;
  - quiz reset, "larger", reveal;
  - inductor, capacitor and Buck reset.

**Recorded in each state:**

- title and `<html lang>`;
- the header (breadcrumb and label removed);
- step nav text, hrefs, classes and aria;
- footer text and links;
- each step's `innerText`;
- every h2/h3;
- every button/input/output/label/legend/summary/link/aria-labelled element in the steps: text or value,
  checked, disabled, aria-pressed, aria-label, href, visibility;
- every SVG's `outerHTML` in `<main>`, with `data-i18n*` removed;
- `<details>` open states;
- the document width.

**Results:**

- **84,420 comparisons, 0 differences.** No page errors.
- **Screenshots:** full page, 9 states per run, 54 pairs, with the breadcrumb, linked-from block and label hidden
  and the page scrolled to the top.
  - My first pass did not scroll to the top. The sticky step nav was captured mid-page with a different item lit,
    which made up to 83k-pixel "differences". That was an artefact of the capture method, not the page.
  - After the fix, 39 of 54 pairs are pixel-identical. The other 15 differ by 52–1,329 pixels, largest channel
    difference ≤ 53, spread over the whole page height.
  - An old-against-old run with the same script gives 13 of 54 differing, with the same sizes (679–1,054 pixels,
    max 53). So this is capture noise, and the builder's anti-aliasing explanation holds.
- **Deep links:** `atlas/graph/core.json` has 20 links into `#step1`–`#step5`. I visited `#step0`…`#step6` on both trees in zh and en. All 14 land on the same `<h2>`, at the same
  `scrollY`, with the step 88 px from the top, below the sticky nav.

## 3. The builder's open decisions

- **1ffbcfa5 (`about:blank` before each language pass): agree, nothing loosened.**
  - The diff adds only `await p.goto('about:blank')` before the existing `goto`.
  - The 200 % font-size injection, the `scrollWidth <= innerWidth` overflow check, and every other assertion are
    byte-identical.
  - Each pass still picks its language by clicking `[data-lang=…]`, so the blank visit does not change what is
    tested. It only stops the second pass from inheriting the first pass's inline 2× sizes, which would make the
    text 4×.
  - Both tests pass on HEAD (Checks).
- **No label repoint after the conversion: agree.** D4 in specs/site-template.md §1 says a mechanical migration does
  not repoint, and batches A–C followed it. The repoint after the authored refactor (8a08139f) is right and follows
  "Cross-developer repoint": Codex/revised kept, and the evidence note's heading names Codex.
- **`enCjk: ["s0power"]`: changed (352e8f3a, label 3c20ff01).**
  - The English formula carried two U+3000 ideographic spaces. They were fixed text in the old template around one
    translated word, so the Chinese typography leaked into English. It was not a deliberate bilingual string.
  - As in the batch C review, `enCjk` is meant for deliberate exceptions, not for keeping a leak.
  - `content.en.md` now uses two em spaces (U+2003). They do not collapse in HTML (`.formula` has no
    `white-space: pre`, so ASCII spaces would merge into one) and they are outside the CJK class.
  - `enCjk` was removed and `version` went to 20261117b, then build-pages. The Chinese formula keeps U+3000.
  - Visible effect: the English gap is narrower, about two monospace cells instead of four. The box size is the
    same and the line wraps at the same place at 1280/390/320 (checked against 453f0c4a).
  - This is a deliberate departure from the equivalence baseline, recorded in BRIEF.md and in a follow-up section
    of the refactor evidence note.
  - The repoint keeps Codex/revised, with previous 6df26b96 and `provenanceEvidence` that note.
- **Atlas cache keys not bumped: acceptable, not blocking.**
  - The atlas region and search chunks the batch changed (`details/circuits.nodes.js`,
    `search/chunks/circuits.js`) are loaded under content-hash keys, and those keys changed.
  - Only the hand-set `atlas/index.html` key `atlas-index.js?v=20261116-1ef6c3b9` stayed. A browser holding the old
    index for up to 4 h requests the old hash URLs. The static server ignores the query, so it still gets the
    current files.
  - The deep-link URLs themselves (`#step1`… ) did not change in this batch; only their verification status did.
  - Same handling as batch C.
- **atlas/tests/capacitor-rate-core.cjs and volt-second-core.cjs: they fail at 453f0c4a too, but the cause is not a
  path. Not fixed.**
  - Run in the full 453f0c4a archive (`GIT_DIR` pointed at this repository), both fail at the same line as on HEAD.
    The tests are byte-identical between the two commits.
  - The tests already strip `physics/circuits/` before `git show`, so the path is handled.
  - The real problem: commit `1707df178ceda771d2ea5aa1e2792c763e4c458e` does not exist in this repository at all
    (`git cat-file` cannot find it, and `git log --all` has no such commit). The pin has been in the tests since
    their first commit here, b9e73ff0 (2026-10-30), so they have probably never passed in this clone.
  - A fix would re-pin the byte-equality guard to a different, existing baseline. That changes what the guard
    protects, so it is a decision for the team lead, not a trivial path correction.
  - `model.js` and `flow.js` have not changed in content since b5a9d242 (2026-10-26); only the move 1c4c8dc9
    followed. b5a9d242 is the natural re-pin candidate.
  - HANDOFF 1g's explanation ("the path in the test was not changed after the move") is corrected in the HANDOFF
    line added by this review.

## 4. Other observations (not changed)

- Codex's original English keeps two small typography slips: `feedback control</a> . This lesson` (space before the
  full stop) and `Vµs,negative` / `Vµs,net` / `A,current` (no space after the comma).
- Now that the text lives in `content.en.md`, either is a one-line edit plus a repoint. They predate the batch and
  the batch rightly kept them verbatim, so I left them for the page's owner.
- `model.js` and `flow.js` are unchanged against 453f0c4a.

## Checks

All run one at a time on the final tree (after 3c20ff01). Local servers on 18871 (HEAD) and 18872 (453f0c4a archive),
stopped afterwards.

- **Page tests:**
  - model: 3660 checks.
  - browser: zh/en × 320/390/768/1440.
  - flow-browser: 240 cases.
  - flow-lifecycle: pass.
  - review-accessibility: pass.
  - review-matrix: 1160 assertions.
  - review-responsive: pass, `REVIEW_OUTPUT_DIR` in scratch.
- **Labels, atlas and search:**
  - page-provenance-core: 275.
  - build-atlas-data --check and --concept-map --check: OK.
  - build-search-index --check: OK (668 concepts).
  - data-quality: pass.
  - concept-search: pass.
  - registry-import: 22.
  - authorship-derived-from: pass.
- **Site template, registry and navigation:**
  - build-pages --all --check: 204 pages.
  - site-template: 234.
  - build-registry --check: 249 pages.
  - build-registry tests: 60.
  - build-site-nav --check: pass.
  - site-nav: 2275.
  - test_index_pagination: ok.
- **Browser, serial:**
  - page-provenance-browser: 275.
  - site-nav-browser: 389.
  - home-concept-search: 31.
  - lesson-shell: 8/8.
  - atlas capacitor-rate-browser and volt-second-browser: pass, evidence in scratch.
- **Canvas sweep:** `--sweep physics/circuits/power-converters/` passes with 0 canvas states. The page draws only
  inline SVG, and its SVG text is compared string for string in §2.
- No tracked evidence changed (`git status` clean apart from these commits). There is no `leetcode/*/tests/evidence`
  in this tree.
