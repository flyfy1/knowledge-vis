# Frozen bubble verification — 2026-10-25

## Delivered integration

`frozen-bubble/index.html`, `style.css`, `i18n.js`, `model.js`, `app.js`, `BRIEF.md`, `README.md`, and `tests/{core,browser}.cjs`. Registered exactly once in `pages.config.js` (`physics`, `junior`, `frozen-bubble/`); added concept mapping and existing outgoing deep links in `CONCEPT-MAP.md`. No existing lesson, shared shell, backend, dependency or deployment changed. Existing untracked files preserved; concurrent work may add further untracked files.

## Automated self-check evidence

- `node --check` for app/i18n/model and pages.config: PASS.
- `node frozen-bubble/tests/core.cjs`: PASS. Warm front advances then tends to stall; illustrative undercooling changes radius; transport begins at the base and stays on the projected shell; bilingual key parity.
- `frozen-bubble/tests/browser.cjs`, real installed Chrome 156.0.8078.47 via existing Playwright: PASS (final endpoint regression included).
- Both languages, widths 320/390/640/1280: no horizontal document overflow; 48px button/range/nav targets; seed/play/pause/resume/seek; three repeated resets; end/replay; independent state; display-only trails; six-seed boundary; homepage card/return/Back; step hash and concept deep link.
- DPR 1/2/3, repeated 320→640→390→390 resize: canvas backing store tracks CSS size, no runaway sizing.
- Blocked localStorage: fallback and language switching work; browser locale default checked. Keyboard Enter seeding and ArrowRight seeking passed. Landscape 844×390 passed.
- Reduced motion: starts paused, direct seek available. Forced-colors 3px focus retained. Live-region text changes only on state changes, not each animation frame.
- Runtime page errors: 0. External lesson requests: 0.
- Contrast: body 16.44:1; muted/panel 7.39:1; primary action 11.66:1; focus/panel 9.93:1. CSS 4,595 bytes; drawings local, no shipped images.
- Existing `tests/leetcode-home-section.cjs`: PASS (115 algorithm lessons observed). Includes filters/history, locale/IME, query/reload/Back, error/retry, timeout, malformed registry, long-title fixtures and denied storage.
- Existing `tests/lesson-shell.cjs`: PASS (sampling anchors, Fourier contrast and phone nav, eigen/convolution/kalman narrow headers).
- `git diff --check`: PASS.

## Independent learner review

Separate design_review agent (exact model identifier unavailable) first read the rendered page without BRIEF/model, then checked implementation and original author-uploaded paper. It could restate all three steps: shell water freezes; undercooling comparison changes growth; latent-heat-driven transport differs from a stalling warm-air front; color has several origins. B front is height/diameter, not frozen area. Verified Chrome 1280/390/320, both languages, pause/time retention, language/navigation retention, repeated reset/replay, trails, physics return and zero script errors.

It found one recovery defect: empty experiment seek24→seed→replay retained birth24 and never grew. Fixed by disabling endpoint seeding through both button and canvas, with localized explanation to seek backward/reset; existing seed history is preserved. A browser regression covers this path. Narrow independent re-review is recorded after completion below.

## Evidence and boundaries

JSON, representative screenshots and the independent walkthrough record are in `frozen-bubble-evidence/`. These are review records, not requested at lesson runtime. Nature direct fetch redirected to an inaccessible identity host; original article was checked through its author-uploaded full text at https://www.researchgate.net/publication/333866321_How_soap_bubbles_freeze.

No npm lint, TypeScript, or build script exists for this static site; syntax/model assertions and browser execution are the applicable checks. No installed-phone GPU performance, physical-device validation, precise CFD, real freezing-time/temperature accuracy, public deployment, push or production delivery is claimed. Headless mobile viewports and actual desktop in-app browser preview were checked.

Independent narrow re-review: PASS, must-fix count zero. Both languages: t24 disables button; canvas does not add a seed; localized recovery text is present; seeking to0 re-enables seeding; play advances with one visible seed; replay of an existing seed preserves it. Evidence: `frozen-bubble-evidence/seed-end-recheck.json` and `fixed-seed-end-zh.png`.
