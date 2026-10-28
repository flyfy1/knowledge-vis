# 2026-10-29 · climate energy ledger

## Delivered

- Added a four-step bilingual Earth-science lesson at `climate-energy/`.
- Implemented latitude / insolation, albedo / energy split, greenhouse / infrared escape, and evidence-chain interactions.
- Added the page brief, acceptance spec, focused static test, and index registration.

## Verification

- `node climate-energy/tests/core.cjs`
- `node --check climate-energy/app.js`
- `node --check climate-energy/i18n.js`

## Model note

The page labels all values as teaching quantities. Latitude uses a cosine projection, albedo is a 0–100 relative ledger, and temperature uses an effective-radiating baseline plus a greenhouse offset.
