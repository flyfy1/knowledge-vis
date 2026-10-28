# Photosynthesis — Codex teaching-continuity iteration (2026-10-28)

## Scope and selection

This iteration selected `photosynthesis` because the repository carries the clearest prior
white-screen evidence: a high-DPR canvas sizing feedback loop had produced a 300 → 900 → 2700
→ 8100 CSS-height growth and long blank scroll regions. The existing repair has a dedicated
Playwright suite, so the remaining change could stay small and low risk. The baseline was run
before editing and passed all nine scenarios.

Repository: `/Users/songyy/Documents/projects/knowledge-vis`, remote remains
`git@github.com:flyfy1/knowledge-vis.git`, branch `main`. The checkout was clean at the start;
no other pending user changes were touched. No push, merge, deployment, credential, or security
change was performed.

## Baseline evidence

`PHOTO_BASE_URL=http://127.0.0.1:18843 ... node photosynthesis/tests/browser.cjs` passed for
Android 360/393/412, desktop English, reduced motion, missing IntersectionObserver, missing
Canvas context, JavaScript disabled, and blocked app script. The baseline measured six visible
section headings, stable page height under repeated resize/input events, CSS canvas height of
300px, and no page errors. The mobile scroll screenshots showed no blank viewport.

## Change

Step 1 now includes `#s1-bridge`, a bilingual `.hint` immediately above the interactive ledger:
it identifies the step-0 bubbles as oxygen, directs the learner to click `6 O₂` to see the
by-product explanation, then `6 H₂O` to trace the oxygen source. The browser suite asserts the
bridge is visible in both locales and that both equation selections expose the expected ledger
copy. The equation, model, canvas lifecycle, responsive layout and fallback paths remain
unchanged.

## Verification

- `node --check photosynthesis/i18n.js` — pass.
- `node --check photosynthesis/app.js` — pass.
- `PHOTO_BASE_URL=http://127.0.0.1:18843 PHOTO_EVIDENCE=/tmp/photosynthesis-bridge ... node photosynthesis/tests/browser.cjs` — pass: all 9 scenarios; no page errors.
- `git diff --check` — pass.

The suite uses installed desktop Chrome with mobile viewport/touch/DPR emulation; physical
Android, Safari, screen-reader speech, and independent review remain outside this self-check.

## Local handoff

- Implementation commit: `4365b674` (`Connect photosynthesis observation to ledger`).
- Push/deployment: intentionally pending.
- Built-By attribution follows the repository rule; exact task model identifier is unavailable.
