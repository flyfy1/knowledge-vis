# Essay builders, batch 3 (2026-11-11): what differs from BRIEF-COMMON, and the rules

Repo: /Users/songyy/Documents/projects/knowledge-vis (static site, live at visual.integ.life). The owner's goal:
"whatever I don't understand, I can come in, click once, and see a visualization of it", and he has asked for the
range of subjects to keep widening. Ten long interactive essays exist so far; `demos/scarcity-moves/` is his stated
model of quality. You build one more, on the topic in your task message.

## Read first, in this order
1. `AGENTS.md`
2. `/tmp/agent-tasks/standard/STANDARD.md` — the quality bar.
3. `/tmp/agent-tasks/essays/BRIEF-COMMON.md` — file layout, copy files, models, tests, REGISTRY.json. Follow it
   exactly except where this file differs.
4. `specs/essays.md` — the standard as now recorded in the repo, and the registration steps a later agent will run.
5. One finished essay in full as a structural model: `biology/body/body-in-balance/` (every file, tests and BRIEF.md).
6. `pages.config.js`: find existing pages on or near your topic. Link to them; do not repeat them. If an existing
   page already answers your essay's question at this depth, stop and report that instead of building.

## Differences from BRIEF-COMMON (learned from reviewing the first ten)
- Write `copy.zh.js` only (Chinese, written natively, plain register). Do not write `copy.en.js`: a translation step
  and an independent review follow. But build everything language-aware from the start: no Chinese produced in code
  or left in `app.js`; canvas labels, aria-labels and the document title come from copy; number formatting switches
  by language (no hard-wired 万/亿/成, no `10^8.9`-style output); whole-sentence templates per case rather than
  sentences assembled from fragments (word order differs in English); the toggle reads "中 | EN". Keep a Chinese
  `<title>` and meta description in the static HTML so crawlers and link previews see them.
- Do not use "left/right figure" in the text: figures stack on phones.
- Most common defect so far: a live interpretive sentence that is wrong, or reads oddly, in some control states.
  Drive every control to its extremes and to awkward middle values and read each live sentence; the node test must
  evaluate every sentence branch at least at the extremes.
- Second most common: prose stating a number the model does not produce. The node test derives each prose number
  from `models.js`; it must not repeat a literal.
- Third: a "model" that is hand-set curves. Every model must implement a named, standard result (a formula, a
  textbook model, a published method) that a reviewer can re-derive independently. Where parameters are tuned for
  shape rather than fitted to data, the page must say so in the text next to the model.
- Real-world facts and figures: sourced in BRIEF.md, each checked against a source you open yourself, given as
  ranges where the literature gives ranges, and conditioned where contested. Say on the page which numbers are the
  model's output and which are measured or assessed values from the literature. Health, money and politics are
  where an overconfident sentence does the most harm.
- Canvases draw only while on screen. `tests/canvas-text-overlap.cjs --sweep` is scroll-aware: run it on your page
  (`CANVAS_BASE_URL=http://127.0.0.1:<port> node tests/canvas-text-overlap.cjs --sweep <path>/`) and also look at
  screenshots, since it cannot see text sitting on lines.
- Controls at least 48px tall including sliders and buttons; visible focus; keyboard operation; reduced motion
  respected by model animations, not only by the hero.

## Hard rules
- Work only inside your essay directory. Do not edit `pages.config.js`, `index.html`, `page-provenance.json`, atlas
  files, shared scripts or anything else; registration is a later step by someone else. Write a complete
  `REGISTRY.json` (concepts with zh/en names, aliases a layperson would actually type in either language, including
  question forms, and `#ch` anchors) so that step can import it.
- Do not commit, stage, stash, checkout or clean anything: many other agents are working in this repository and
  some are committing. Leave your files untracked.
- Do not run delete commands of any kind (`rm`, `rmdir`, `git clean`, `find -delete`…): each interrupts the owner
  with a permission prompt. Leave scratch files in place; write to a new file if you need a clean slate. Scratch
  goes in `/tmp/agent-tasks/essays/<slug>/`, and browser test output (screenshots) must go there too, not into the
  repo.
- Local server on the port in your task: `python3 -m http.server <port> --bind 127.0.0.1` from the repo root;
  stop it when done. Playwright: `NODE_PATH=~/Documents/integ-life/integ-games/node_modules`. Browser tests serially.
- Do not weaken a test or a tolerance to get green.

## Verify before reporting
Node model test passes; browser test passes in Chinese at 1280, 390 and 320 (no overflow, no clipped or overlapping
text, targets ≥ 48px, keyboard, reduced motion, no console errors); canvas sweep passes; you looked at screenshots
at all three widths; you re-read the essay top to bottom in the browser as its reader and fixed what confused you.

## Report back (under 400 words)
The path; the chapter list with each chapter's model in one line and the standard result it implements; the
numbers pinned by tests; facts you sourced and against what; test output lines; what you fixed after looking at the
page; parameters that are tuned rather than sourced; what you did not verify; and what a registrar needs (zh/en
title, one-line zh/en description, category/subtopic with zh/en names if new, stage).
