# Space diagonal · Codex iteration · 2026-10-28

## Change
Added a bilingual Step 1 parameter-isolation hint. It asks the learner to change `a` while holding `b,c`, then change `c` while holding `a,b`, explicitly connecting the observed `e`/`d` responses to the two right-triangle calculations.

## Verification
- `node --check space-diagonal/app.js`
- Playwright smoke at desktop and 390px: bilingual bridge is visible, sliders remain usable, and no horizontal overflow is reported.
- `git diff --check`

This is a local-only experimental-page iteration; no pages registry, push, or deployment was changed.
