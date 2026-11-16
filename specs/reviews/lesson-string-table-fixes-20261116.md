# Lesson string-table fixes (2026-11-16): Codex editions trigonometry, pinhole-camera, reflection-refraction, fixed by Claude Code

Evidence note for the provenance repoint of the three labelled lessons below, and the record of the same fix on five
unlabelled lessons. Found by the site-template Phase 3 dry run (specs/site-template.md §12): the lesson converter
refuses a table whose zh and en key sets differ, and a page whose markup names a key its table lacks.

## What was wrong

**A key written twice in the zh table (8 keys on 6 pages).** Each "bridge" hint (`<p class="hint" data-i18n="sNbridge">`)
was added as two adjacent lines inside `STR.zh`: the Chinese string, then its English translation under the same key.
In a JavaScript object literal the second line wins, so `STR.zh.sNbridge` held the English text and `STR.en` had no
such key. Every page's `t()` falls back to `STR.zh[key]`, so **Chinese readers saw the English sentence** and English
readers saw it correctly.

| Page | Keys | Label |
| --- | --- | --- |
| math/geometry/trigonometry | `s4bridge` | Codex, revised edition |
| physics/optics/pinhole-camera | `s2bridge`, `s3bridge` | Codex, revised edition |
| physics/optics/reflection-refraction | `s3bridge`, `s4bridge` | Codex, revised edition |
| math/algebra/parabola | `s3bridge` | none |
| math/geometry/circle-angles | `s3bridge`, `s4bridge` | none |
| physics/mechanics/lever-pulley | `s4bridge` | none |

The duplicates entered in the "Bridge …" commits of 2026-10-29 (none has a `Built-By` line): trigonometry d84d6bd7,
parabola 491b9759, circle-angles 0c9f8e7d, lever-pulley b9a82fc7, pinhole-camera cd52d85a, reflection-refraction
b1755342. The pages'
own key-set tests caught it and have failed since: trigonometry `tests/tangent-core.cjs`, pinhole-camera
`tests/geometry-core.cjs` and reflection-refraction `tests/snell-core.cjs`.

**A key the table lacks (2 pages).** The runtime `t()` returns the key itself when neither table has it.
- language/phonology/phonemes: the step-3 button `<a data-i18n="next4">` read "next4" in both languages once the
  script ran (its hand-written text 继续：自测 ↓ showed only without JavaScript).
- math/algebra/coordinate-plane: the step-6 button `<button id="s6-reset" data-i18n="reset">` read "reset" in both
  languages (hand-written text 重置本步).

## What the fix commits change

Only the string tables (`i18n.js`):
- the English line of each duplicated key moves, unchanged, from `STR.zh` into `STR.en` right after that step's
  `sNt` title. No text is new: the Chinese and English strings are the page authors' own;
- phonemes gains `next4` (zh 继续：自测 ↓, the button's hand-written text; en "Continue: take the quiz ↓", after the
  other `next` buttons and step 4's English kicker "Quiz"); coordinate-plane gains `reset` (zh 重置本步, the
  hand-written text; en "Reset this step").

No markup, model, style or test changed. One authored commit per page, `Built-By: Claude Code (claude-opus-5-5)`.
The commits do not make Claude Code the developer of these editions. The three labels keep developer Codex, kind
revised, edition and scope; `sourceRevision` moves to the fix commit, the replaced value goes to
`previousSourceRevision`, and this note is the `provenanceEvidence`, as for the 2026-11-15 navigation sweep
(specs/reviews/site-navigation-sweep-20261115.md; specs/visual-page-provenance.md「Cross-developer repoint」).

## Checks

- trigonometry `tests/tangent-core.cjs`, pinhole-camera `tests/geometry-core.cjs`, reflection-refraction
  `tests/snell-core.cjs`: fail before, pass after.
- `tests/linguistics-phonology.cjs`, `tests/coordinate-distance.cjs`: pass before and after.
- For all eight pages, the zh and en tables have the same key set and every key the markup names is defined.
