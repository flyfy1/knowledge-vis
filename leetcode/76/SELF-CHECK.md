# Author self-check — #76

Status: complete candidate, ready for a separate independent review. Date: 2026-10-18. Author: Codex in the current author run; exact model identifier unavailable. No independent acceptance, public release, LeetCode acceptance, real-device test, or actual learner result is claimed. Only `leetcode/76/` was created/changed; no registry, shared asset, service or Git configuration was changed.

## Verified source and interface

The public official problem page and public GraphQL were accessed normally. `official-evidence.json` retains the date, complete observed statement, examples, bounds and selector snippets, including Python3 `Solution.minWindow(self, s: str, t: str) -> str`. Python was selected by the required preference. The submission source, exact offline mirror, displayed text, copied payload, fallback textarea and actual downloaded file agree. This is an original Python submission interface, not a conceptual substitute. No submission was made.

## Computational evidence

- `tests/evidence/python-results.json`: 14,157 exhaustive pairs over ABC (s lengths 1–5, t lengths 1–3), 1,200 seeded case-sensitive pairs, 9 named fixtures, and 4 length-100,000 boundary cases. The actual canonical class method and displayed baseline both execute against an independent slice-enumeration oracle. Empty-input defensive behavior is checked separately from the official nonempty contract.
- `tests/evidence/core-results.json`: 15,363 trace cases and 140,387 intermediate frames. Recompute the actual window, all requested counts, sum of positive deficits, best checked candidate, and legal pointer movement at each frame. All final results agree with a separate slice oracle. Maps are separate snapshot objects.
- The baseline keeps endpoint pairs and slices once, matching its stated O(n+m²k) cost. The canonical solution stores bounds and slices once; its fixed alphabet bounds dictionary operations. The JS simulation retains/copies windows and histories only for small teaching inputs; it is not used to establish Python runtime behavior or memory cost.

## Browser evidence

`tests/evidence/browser-results.json`: real headless Chromium on the provided preview URL. Six presets × two locales, every forward/backward event, endpoint disabling, reset/replay, keyboard slider endpoints, locale-after-interaction, all prediction options/reveal/change, valid and invalid custom input, clipboard payload and manual fallback, exact displayed/downloaded source, blocked storage and offline file opening. No page/console errors, failed local assets or external requests were observed. Related links and sticky anchor landing geometry were checked.

Widths: 320, 390, 736 and 1440 CSS pixels in both locales. Zoom: 200% CSS zoom at 1440, plus 640 physical CSS pixels with 200% CSS zoom (320 CSS-pixel effective content width). This is browser layout evidence, not OS/device zoom evidence. No document overflow; tiles preserve their readable fixed width and wrap, while the genuine ledger/code tables scroll inside their own containers. All visible buttons, selector, disclosures and download controls meet 48×48px. Keyboard activation, native skipping of disabled controls, 3px focus and forced-colors focus were exercised.

`tests/evidence/reading-results.json` adds the page header, hand calculation, count derivation, proof, prediction feedback, surplus removal and severe narrow zoom states. All **26 retained PNGs were opened and visually inspected** by the author: tiles stay readable, the current AC window is explicitly invalid while best AAC remains recorded, surplus A removal leaves coverage intact, selected/revealed feedback agrees, and Chinese/English reading flow wraps. Section screenshots can include a sticky-navigation capture overlay depending on scroll position; viewport shots and actual anchor geometry establish the navigation behavior separately. The final step-4 captures use explicit scrolling before capture.

`tests/evidence/access-results.json` adds keyboard horizontal scrolling of both code panels, final dictionary parity, 18-character/18-required-kind teaching input, and rendered/composited contrast. Core explanation contrast is 12.62:1; source 16.44:1; highlighted ledger text 12.30:1; primary action 13.10:1. Muted/disabled text on panel2 is 6.45:1 (above AA, below the preferred 7:1 target); it reuses the exact shared token and has opacity 1. Focus accent2 on panel2 is 8.94:1, and muted control boundaries on panel2 are 6.45:1. These are measured sRGB ratios, not visual estimates. Final total shipped CSS: **11,903 bytes** (shared + local), under 25,000.

The final narrow checks followed small copy clarifications defining m/n/k/L locally and making fixed-right shrinking explicit. The final focus checks followed addition of keyboard access to scrollable code; the earlier complete browser run remains the evidence for unchanged trace/prediction/copy paths. No relevant algorithm or source changed after those checks.

## State and language coverage

Both languages cover initial empty trace, expanded uncovered/covered windows, surplus removal, deficit-producing removal, no-solution finish, successful finish, initial/end disabled controls, valid/invalid draft feedback, unselected/selected/unrevealed/right/wrong/changed predictions, copy success and clipboard denial. Locale changes preserve trace, draft, chosen/revealed answer and disclosure; storage denial falls back without exceptions. There is no network-dependent experiment, timer, automatic playback, reconnect or pending server operation to simulate. No blank results are labeled as successful coverage.

## Review boundary

Candidate identity is recorded in `tests/candidate-manifest.json`, with shared dependency hashes for read-only identification. Rerun commands are in `tests/README.md` and emitters accept OUTPUT_DIR. Independent reviewer/run: pending. Review rubric: `specs/leetcode-review-gates.md`, all six dimensions, ≥85 overall, each ≥3/4, zero open required fixes. Dispatcher owns later registration and concept-map integration, deliberately outside this author’s file ownership. No actual novice teach-back has occurred.
