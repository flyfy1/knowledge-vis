# Common brief for essay reviewers (batch 2026-11-11)

Repo: /Users/songyy/Documents/projects/knowledge-vis. Read `AGENTS.md`, then
`/tmp/agent-tasks/standard/STANDARD.md` (the quality bar, derived from `demos/scarcity-moves`), then
`/tmp/agent-tasks/essays/BRIEF-COMMON.md` (what the builder was asked to do).

## Situation
Six long interactive essays were written today by six builders, one each, to the standard above. Each builder
tested its own page in Chinese. Then a small translation model produced `copy.en.js` from `copy.zh.js` under
mechanical checks (same keys, placeholders and tags), and nobody has yet looked at the English page in a
browser. You are the first reader of your essay who did not write it. The owner will publish these as the
model for future pages, so what matters is that a reader is not told anything false and that the page works
in both languages; polish matters less.

You review **and fix** one essay, working only inside its directory. Do not commit, stage, stash, checkout or
clean anything: other agents are working in this repository and one is committing. Leave your changes in the
working tree. Scratch files go in `/tmp/agent-tasks/essays/review-<slug>/`. Local server on the port given in
your task (`python3 -m http.server <port> --bind 127.0.0.1` from the repo root), stopped when done. Playwright:
`NODE_PATH=~/fast/integ-life/integ-games/node_modules`.

## What to do, in this order
1. **Read the essay as its reader, in Chinese, top to bottom in a browser at 1280**, using every model as the
   "how" line tells you to, before reading any code or the builder's BRIEF. Note where you were confused, where
   a sentence claimed something the model in front of you did not show, where a model was dull or its default
   view showed nothing, and where the argument lost its thread. These first-read notes are the most valuable
   thing you produce; write them down before going on.
2. **Check the claims.** For every number or factual statement in the prose: is it reproduced by the model
   (run `tests/models.cjs`, and check the test really derives the number from the model rather than repeating
   a literal), or sourced in BRIEF.md? Spot-check at least five sourced real-world facts against a source you
   open yourself, choosing the ones that would be most embarrassing if wrong. Check each model's logic against
   the standard result it claims to implement (a formula, a named theorem, a textbook model): derive two or
   three values by hand or with an independent few-line script and compare. Look for interpretive sentences
   that are wrong in some states: drive each control to its extremes and to awkward middle values and read the
   live sentence each time.
3. **English.** Load the page with `knowledge-lang = en`. Read the whole English text. Fix: mistranslations
   and places where the English says more or less than the Chinese; terms a native reader would not use;
   strings that no longer fit their sentence because of word order or a placeholder; Chinese-specific units or
   formats left in English (万, 成, date formats, `10^8.9`-style numbers); titles of other pages on this site
   (they must match the English titles registered in `pages.config.js`); the language toggle (it must read
   "中 | EN" in both languages); any Chinese left visible in English mode, including canvas labels, `aria-label`s,
   the document title and anything generated in code. Where the fix belongs in formatting code rather than copy
   (for example a number formatter that should be language-aware), fix the code. Keep `copy.en.js` and
   `copy.zh.js` key-for-key identical.
4. **Layout and behaviour in both languages** at 1280, 390 and 320: no horizontal overflow; no clipped or
   overlapping text in readout tiles, buttons, tables or on canvases (scroll each model into view first —
   canvases draw only while on screen — and sweep its sliders, because the repo's
   `tests/canvas-text-overlap.cjs --sweep` does not scroll and so sees little on these pages); interactive
   targets ≥ 48px; keyboard operation of every control; visible focus; `prefers-reduced-motion`; language
   switch redraws canvases. English strings are longer than Chinese ones: expect wrapped tiles and crowded
   axis labels, and fix them.
5. **Fix what you find**, in the page's own files. Prefer correcting the prose to match the model; change a
   model only if it is wrong, and then update its test. If you change a number, the node test must pin the new
   one. Do not weaken a test. Update BRIEF.md's "Checked / not checked" section with what you verified, and
   add your name as reviewer there in the form the repo's AUTHORSHIP.md uses for `Verified-By`
   (`<agent> (<exact model id>)` plus the scope of what you checked).
6. Extend `tests/browser.cjs` so it also runs in English (now that `copy.en.js` exists it should check that no
   CJK characters remain visible in English mode apart from the 中 toggle label, and repeat the overflow and
   target-size checks). Run all the page's tests at the end and report the actual output lines.

## Judgement calls
- If a chapter's model is not really a model (a slider that scales hand-set bars, an invented formula), say so
  and either make it one, or cut it to prose, whichever is smaller; do not leave it presented as a model.
- If a claim is contested or the builder could not source it, it needs a condition, a confidence label, or
  removal. Health, money and voting are the areas where an overconfident sentence does the most harm.
- If you disagree with the builder's design but it is not wrong, leave it and mention it.
- If you find something that needs more than about an hour of rebuilding, do not start it: describe it
  precisely so I can decide.

## Report back (under 500 words)
Your first-read notes (the five most important); every factual or model error you found, with what you
changed; the sourced facts you spot-checked and against what; what was wrong in the English and in the
English layout, and what you fixed; final test output lines; what you left unfixed and why; and what you did
not check.
