# Frozen bubble — Codex paper-condition bridge (2026-10-28)

## Scope and selection

This iteration selected `frozen-bubble` because its prior review explicitly called out the
risk of an unexplained “paper conditions” jump. The current page already puts the Ahmadi et al.
source card before the comparison, but a learner still had to infer how the card's A/B settings
map to the visible scene labels. The change stays page-local and keeps the prescribed physics
model intact.

Repository: `/Users/songyy/Documents/projects/knowledge-vis`, remote remains
`git@github.com:flyfy1/knowledge-vis.git`, branch `main`. The checkout was clean before this
iteration; no other pending changes were touched. No push, merge, deployment, credential, or
security change was performed.

## Baseline evidence

- `node --check frozen-bubble/app.js`, `i18n.js`, `model.js`, `pages.config.js` — pass.
- `node frozen-bubble/tests/core.cjs` — pass: advancing/stalling front, undercooling comparison,
  transported paths, bilingual key parity.
- Existing `tests/browser.cjs` — pass for zh/en interaction, 320/390/640/1280 layouts, DPR
  1/2/3 resize, blocked storage, keyboard, reduced motion, forced colors, deep links and zero
  external runtime requests.
- Existing `tests/teaching.cjs` — pass for zh/en at 320/390/1280, source ordering, research
  credit, growth/undercooling interaction, paused story moments, same-time A/B switching and
  reset.
- A full-scroll Chromium sample at 390px and 1280px found meaningful content in every viewport
  and no page errors. Baseline page heights were 9,130px (390px) and 6,206px (1280px).

## Change

Added `#research-bridge` between the source card and comparison task. In both languages it maps
A to the all-cold environment and B to warm air with a cold base, states that both controls share
one diagram time, and asks the learner to compare visible crystal paths/front first before
returning to the heat/liquid-motion explanation. It deliberately avoids adding technical terms
before the plain observation. The teaching test asserts visibility, locale-specific copy and
document order between the source card and comparison.

## Verification

- `node --check frozen-bubble/app.js` — pass.
- `node --check frozen-bubble/i18n.js` — pass.
- `node frozen-bubble/tests/core.cjs` — pass.
- `LESSON_BASE_URL=http://127.0.0.1:18775 ... node frozen-bubble/tests/teaching.cjs` — pass:
  6 zh/en × viewport cases, zero page errors.
- `LESSON_BASE_URL=http://127.0.0.1:18775 ... node frozen-bubble/tests/browser.cjs` — pass:
  full interaction, accessibility, responsive, DPR and deep-link suite; zero errors/external
  requests.
- Post-change full-scroll Chromium sample at 390px and 1280px — pass; every sampled viewport
  contained readable content and page heights were 9,289px and 6,294px.
- `git diff --check` — pass.

Screenshots were inspected from the local Chromium run at the source card and comparison
moments. The tests use desktop Chrome with mobile viewport/touch emulation; physical phones,
Safari, screen-reader speech and independent learner study remain outside this self-check.

## Local handoff

- Implementation commit: `9dc17374` (`Bridge frozen bubble paper conditions`).
- Push/deployment: intentionally pending.
- Built-By attribution follows the repository rule; exact task model identifier is unavailable.
