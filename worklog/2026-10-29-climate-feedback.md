# 2026-10-29 · climate-feedback

- Added a new Earth & Space lesson covering the energy ledger, carbon budget, feedback loops and misconception check.
- Implemented bilingual strings in `climate-feedback/app.js`; canvas graphics stay responsive and preserve control state on language switch.
- Added pure functions for climate state, carbon budget and feedback gain so the causal direction is testable without a browser.
- Registered spec/brief artifacts; parent integration still needs the `pages.config.js` card entry.
- Local validation: `node climate-feedback/tests/core.cjs` and syntax check for `climate-feedback/app.js`.
