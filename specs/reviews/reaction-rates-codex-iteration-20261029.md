# Reaction rates · Codex iteration · 2026-10-29

## Change
Added a bilingual Step 4 bridge separating the catalyst's threshold effect from temperature's speed effect: keep particle motion fixed, lower the threshold, then compare the catalyst toggle.

## Verification
- `node --check reaction-rates/app.js`
- Local Playwright smoke at 390px in English and Chinese: bridge visible, threshold control and catalyst button present, no horizontal overflow or page errors.
- `git diff --check`

Local-only; no push or deployment.
