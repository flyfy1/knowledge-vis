# #895 author self-check

Outcome: complete author candidate, ready for a separate independent cold review. Independent review pending; no acceptance or publication claimed.

Official statement and actual Python3 FreqStack interface captured in official.json from the official public GraphQL endpoint, with access timestamp and complete observed codeSnippets. Python is the canonical submission language.

Final commands passed:
- python3 -B leetcode/895/tests/check.py — 79,680 operations, exhaustive valid small prefixes, seed 895, official and maximum-call closed-form cases.
- node leetcode/895/tests/core.cjs — 16,298 independent intermediate state checks, 76 unique bilingual keys.
- node leetcode/895/tests/browser.cjs — both locales and every preset/call, endpoints, rewind/replay, reset, prediction/reveal/change/locale retention, keyboard/focus, blocked storage, offline operation, exact display/download/automatic/native-fallback source parity. Fresh clipboard sentinel before each locale fallback attempt; native Linux Control+C, no newline normalization.
- python3 -B scripts/register_leetcode_lesson.py 895 --validate-only — exit 0, empty output; see preflight.json. No registration.

Browser: 320/390/736/1440 widths × CSS zoom 1/2 × English/Chinese. Focused state, preset and exercise screenshots inspected by author. All preset transitions agree with independent recount/reverse-scan physical-list expectations; both locales render matching group values. Tiny case shows demotion leaving lower order unchanged. Exercise incorrect choice 3→6 retains its selection alongside “Not quite” and explains why 6→3 is correct; changing choice clears feedback, switching locale preserves it. State/history remain independently navigable.

Final visual inspection includes en-320-zoom1-preset.png, zh-320-zoom2-preset.png, en-390-zoom1-after.png, zh-1440-zoom2-after.png and both exercise focus captures. Full preset meaning wraps next to a short coded selector. State blocks reflow vertically at narrow widths; lists and long variable names wrap inside their own region. No text intersections seen. At 320px and zoom 2, scrolling is needed to read the full state; content is not cropped.

Total shipped CSS: 12,056 bytes. Solid text palette contrast minimum: 6.449407898769069:1; focus accent/adjacent background and selected accent/background measured too. The contrast helper passes black/white 21:1, identical 1:1, red/black 5.252:1 references. Native disabled content remains legible and dashed; focus is a visible 3px orange outline. Screenshot checks do not establish physical-device behavior.

Lesson console/page/network errors: none. Existing related #32 page emits a missing shared /favicon.ico 404; retained in browser-results.json relatedErrors. Its explanatory target works, as does #84 step1. Destination texts and bilingual link labels are retained in browser-results.json logs; #32 teaches unmatched indices and #84 settling taller bars with a shorter one. This author owns neither target nor the shared favicon.

Author test-development observations: long English preset failed its width budget, recorded in preset-before.json, then replaced by A/B/C with full wrapping descriptions. Early harness unsupported locator methods were corrected; maximum-case quadratic oracle replaced by closed-form expectations while all small/seeded states remain checked. These are not independent review findings.

Scope limits: local Chromium/Linux; CSS zoom, not a physical handset or Mac browser test. No actual learner results, independent lesson acceptance, LeetCode submission or public delivery. Reviewer must first cold-walk the frozen candidate, then inspect this evidence and rerun with OUTPUT_DIR.
