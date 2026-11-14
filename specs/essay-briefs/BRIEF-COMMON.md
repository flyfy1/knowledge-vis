# Common brief for essay builders (batch 2026-11-11)

Repo: /Users/songyy/Documents/projects/knowledge-vis — a static site of interactive learning pages
(https://visual.integ.life). Read `AGENTS.md` first, then `/tmp/agent-tasks/standard/STANDARD.md`, then the
reference page `demos/scarcity-moves/index.html` in full (it is the owner's stated quality bar), and
`specs/demos.md` for the notes on its models.

## Why this batch exists
The owner wants the site to reach the point where "whenever there is something I don't understand, I can come
here, click once and see a visualization of it", and wants more subject areas. He singled out
`demos/scarcity-moves` as the standard: one long interactive essay that carries a reader through the ten or so
ideas a whole subject rests on, each with a live model they can push around. This batch writes one such essay
per new subject area. Six builders work in parallel, one essay each. A separate integrator registers the pages
on the homepage and in the knowledge atlas afterwards, and a separate translator writes the English copy.

## What you build
One essay, in its own directory (given in your task). The reader is a curious adult or senior-high student with
no background in the subject. Aim for 8–12 chapters and 6–9 real models; a chapter without a model is fine when
a model would be decoration. Meet every item of the checklist in STANDARD.md §5, avoid every weakness in §6,
and follow §7 for fitting the format to site rules. In particular:

- **One question** in the opening that every chapter helps answer. The chapter list in your task is a starting
  point from a planning pass, not a specification: reorder, drop, merge or replace chapters if that makes a
  better single argument. Tell me what you changed and why.
- **Models are models.** Evolving state or an exact solution, a parameter the reader owns, a result the prose
  did not give away, defaults that already show the effect. Each simulation steps on real elapsed time (`dt`),
  runs only while on screen, uses a seeded RNG where random, and is implemented as a pure function/module that
  a node test can import.
- **Prose and model agree.** Every number the prose states must be reproduced by the page's own model code, and
  a node test must pin it. STANDARD.md §6 lists places where the reference page's prose drifted from its model;
  do not repeat that. Write the prose after the model works, reading the numbers off it.
- **Facts.** Real-world figures (physical constants, medical values, historical dates, statistics) need a source
  you actually checked, recorded in BRIEF.md with the URL or citation; if you cannot check one, either mark it in
  the text as an order of magnitude or leave it out. State what each model leaves out. Contested claims carry a
  condition or a confidence label. No medical, legal or financial advice: explain mechanisms, and say so once
  where it matters.
- **Link out.** Where the site already has a page on a chapter's idea (see `pages.config.js`; e.g.
  `probability/stochastic/bayes-updating/`, `physics/thermal/carnot-cycle/`, `investment/rates/compound-interest/`),
  link to it from the chapter in one line rather than re-teaching it, using a relative URL.

## Files and layout
```
<your-dir>/
  index.html        markup + styles; self-contained, no CDN libraries, no external assets
  copy.zh.js        window.ESSAY_COPY = window.ESSAY_COPY || {}; window.ESSAY_COPY.zh = { key: "…", … }
  models.js         the models as plain functions (UMD-style: usable from the page and from node)
  app.js            wiring, drawing, i18n, IntersectionObserver gating
  BRIEF.md          see below
  REGISTRY.json     see below
  tests/models.cjs  node test pinning every number the prose states
  tests/browser.cjs Playwright smoke test (see Verification)
```
- **All visible text lives in `copy.zh.js`**: prose (as HTML strings applied with `data-i18n-html`), headings,
  control labels, `aria-label`s, readout templates with `{placeholders}`, canvas labels, the footer, the document
  title. No Chinese text in index.html, app.js or models.js apart from comments. This is what lets a translator
  produce `copy.en.js` with the same keys without touching your code. The page must load `copy.en.js` if it
  exists (plain `<script src="copy.en.js">` placed after copy.zh.js is fine; a 404 must not break the page) and
  fall back to zh for any missing key. Do not write `copy.en.js` yourself.
- Keep keys stable and descriptive (`ch3.law`, `ch3.p1`, `ch3.model.how`, `ch3.say.shortage`). Keep each value a
  self-contained sentence or paragraph; do not build sentences by concatenating keys, because word order differs
  in English. Numbers that come from the model go in as `{placeholders}`.
- **Language toggle** per `UI-I18N-SPEC.md`: a `#langToggle` group with `button[data-lang="zh"]` / `[data-lang="en"]`
  top right, state in `localStorage['knowledge-lang']` inside try/catch with an in-memory fallback, first visit
  follows `navigator.language`, switching is instant and redraws canvases.
- A back link to the site index at the top (relative URL to the repo root, e.g. `../../../`), like other pages.
- Do **not** add the `page-provenance` header label, and do not load `lesson-shell.js`; the integrator adds the
  label once the commit exists. You may take the dark palette and type choices of the reference page (see
  STANDARD.md §4) but fix its contrast and target-size problems: all text ≥ 4.5:1, every interactive target
  ≥ 48px in both dimensions (enlarge the hit area, not the visual weight), visible `:focus-visible`, sliders and
  buttons operable by keyboard with meaningful accessible names, live interpretive sentences in an
  `aria-live="polite"` region.
- `prefers-reduced-motion: reduce`: no decorative animation, no smooth scrolling; models jump to their steady
  state or advance by a button.
- No horizontal overflow at 1280, 390 and 320 px wide. Numeric readouts are DOM text, not canvas text; keep
  canvas text to axis names and a few labels and lay them out so they never overlap at any slider position.

### BRIEF.md
Follow the header convention of an existing BRIEF (look at two, e.g. `math/arithmetic/fractions/BRIEF.md` and a
recent one) and `AUTHORSHIP.md`: author agent and exact model at the top. Then: the essay's one question; for
each chapter its law, its everyday case, its model (state, parameters, what the reader controls, what they should
discover, closed-form solution if any), and its stated limits; the sources for every real-world figure; and a
"Checked / not checked" section.

### REGISTRY.json
The integrator uses this; do not edit any shared file yourself.
```json
{
  "slug": "…", "path": "<category>/<subtopic>/<slug>/", "category": "…", "subtopic": "…", "stage": "senior|university",
  "title": {"zh": "…", "en": "…"}, "desc": {"zh": "…", "en": "…"},
  "tags": [{"zh": "…", "en": "…"}],
  "concepts": [
    {"id": "kebab-case-id", "title": {"zh": "…", "en": "…"}, "desc": {"zh": "one sentence", "en": "one sentence"},
     "aliases": {"zh": ["what people would type when they don't understand this"], "en": ["…"]},
     "anchor": "#ch3", "relatedPages": ["existing page slugs this idea connects to"]}
  ]
}
```
One concept per chapter idea (so a visitor searching "辛普森悖论" lands on that chapter). Each chapter needs a
stable `id` on its section to serve as the anchor. Aliases matter: include the everyday phrasing, not only the
textbook term.

## Hard rules
- Work only inside your directory. Do not edit, stage or commit anything else, and do **not** commit at all;
  leave your files untracked. Seven other agents are working in this repository at the same time and one of them
  is committing; if you run `git add` or `git commit` you will sweep up or break their work. Do not run
  `git checkout`, `git stash` or `git clean`.
- Scratch files (screenshots, probe scripts) go in `/tmp/agent-tasks/essays/<slug>/`, not in the repo.
- Local server: use the port given in your task (`python3 -m http.server <port> --bind 127.0.0.1` from the repo
  root). Stop it when done; do not touch other ports.
- Playwright is not installed in this repo: run node with
  `NODE_PATH=~/fast/integ-life/integ-games/node_modules`.
- Do not weaken a test or widen a tolerance to make it pass; if a number in the prose does not match the model,
  fix the prose or the model.

## Verification you must do before reporting
1. `node <your-dir>/tests/models.cjs` passes and covers every number in the prose.
2. `tests/browser.cjs` (takes the base URL from an env var; say which) loads the page in zh, checks no console
   or page errors, no horizontal overflow at 1280/390/320, all interactive targets ≥ 48px, the language toggle
   works with `copy.en.js` absent, and drives each model once.
3. Screenshots at 1280, 390 and 320 of every chapter with its model scrolled into view (off-screen canvases do
   not draw), plus reduced motion. Look at every one. Then drag every slider through its range and press every
   button, looking for overlapping canvas labels, readouts that wrap badly, states where the interpretive
   sentence is wrong, and anything where the model shows something the prose contradicts.
4. `CANVAS_BASE_URL=http://127.0.0.1:<port> node tests/canvas-text-overlap.cjs --sweep <your-dir>/` (see
   AGENTS.md) reports no overlaps, or you explain each remaining report.
5. Re-read the whole essay once as its intended reader, top to bottom, after everything works. Cut anything that
   is there to sound good, any sentence that restates the previous one, and any chapter whose model you would
   not show a friend.

## Report back (under 500 words)
The essay's question and final chapter list (what you changed from the starting list and why); for each model,
one line on what the reader can discover; test results with the actual output lines; what you looked at in
screenshots and what you fixed as a result; every real-world figure you could not source; anything in the page
you are not satisfied with; total size of copy.zh.js in characters; and what you did not verify.
