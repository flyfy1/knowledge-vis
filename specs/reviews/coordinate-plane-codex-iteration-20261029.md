# Coordinate plane · Codex iteration · 2026-10-29

## Change
Added a bilingual Step 3 bridge that makes the coordinate-swap dependency explicit: x controls the twin's vertical coordinate and y controls its horizontal coordinate; equality is the only overlap case.

## Verification
- `node --check coordinate-plane/app.js`
- Local Playwright smoke in English and Chinese at 390px: bridge visible, x/y controls update, no horizontal overflow, no page errors.
- `git diff --check`

Local-only; no push or deployment.
