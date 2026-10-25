# #730 author self-check — candidate 730-author-1

Date: 2026-10-25. Author: Codex (exact model identifier unavailable).
Status: complete author candidate, ready for a separate independent review.
No independent score, novice learning result, deployment or LeetCode submission is claimed.
Candidate identity: `evidence/candidate-sha256.json`; review that exact manifest.
Official contract and actual Python3 selector/interface: `../provenance/official.json`.

## Commands and observed results

Executed from `/home/songyy/projects/leetcode-hard-lane-730-20261025`:

- `python3 -B leetcode/730/tests/build_copy.py --check` — passed. The authoring helper rejects duplicate keys before insertion and checks the complete generated two-string-pair dictionary.
- `python3 -B leetcode/730/tests/test_solution.py` — passed 2,054 exhaustive/seeded mask-oracle cases, both official examples (6, 104860361), and three n=1000 cases against a different endpoint-inclusion/exclusion recurrence. Repeated a returns 1000. Runtime report in `evidence/python-results.json`.
- `node leetcode/730/tests/test_core.cjs` — passed 472 strings / 5,100 completed intervals, including every stored completed cell and all four outer-character contributions. Independent oracle expands retained/deleted strings, not the production recurrence. `evidence/core-results.json`.
- `node leetcode/730/tests/browser.cjs` — passed on real headless Chromium 156.0.8078.4, Linux. 32 semantic/layout records in `evidence/browser-results.json`. The exact browser-extracted baseline also executed for 1,092 inputs, recorded in `evidence/rendered-baseline-results.json`.
- `python3 -B scripts/register_leetcode_lesson.py 730 --validate-only` — **exit 0**, empty stdout/stderr, no registration performed. Executed from the root; command, timestamp and exit status saved in `evidence/preflight.json`.

## Browser coverage and localized meaning

Both English and Chinese exercised all six presets: bccb→6, bcb→4, a→1, abcd→4, aaaa→4, abccba→14. Every transition is checked against independent enumeration. Complete rewind, replay, reset and end reproduce the same table/ledger; unknown cells remain distinct from numeric zero. Locale changes preserve selected preset, trace position, prediction and reveal, open source disclosure and focused language button.

Representative semantic binding: bccb's final group ledger shows absent a/d=0, b at L=0/R=3 contributes 2+2=4, c contributes 2+0=2, total 6. The two rendered formula strings preserve every operand and boundary, rather than merely testing key presence. Quiz options 5/7/6 all receive explanation for abaca; 7 is correct. Choice changes clear feedback. The wrong-6 explanation identifies the missing aaa, whereas clipboard-denial feedback explains manual copying. The two meanings stay separate in both locales.

Keyboard tests use actual Tab, Enter, Space, ArrowRight and Linux Control+C. Native radio selection, focused scroll region, source disclosure and sticky navigation targets were exercised; the diagram labels use indices, letters and ▶ rather than color alone. Reduced motion and forced-colors focus are checked. Storage denial falls back without an error. Opening index.html via file:// displays the exact embedded source offline.

Displayed `textContent`, decoded embedded mirror, successful clipboard transfer, downloaded bytes and canonical solution.py match exactly, including the final newline. Each manual fallback starts with a distinct clipboard sentinel, checks full selection/focus, sends actual Control+C, and reads back the complete source in both locales. No test writes the source into the clipboard to simulate fallback success.

At 320/390/736/1440 CSS px, no page overflow; selected labels fit measured control widths. The bounded two-dimensional table intentionally scrolls inside a keyboard-focusable region, preserving row labels and column/value association. Both languages were tested at 200% CSS zoom with desktop viewport 1440px; this is not a physical-device or browser-toolbar zoom claim. Shared+local shipped CSS totals **11,656 bytes**. Browser recorded no page errors, failed asset responses, or external runtime requests.

Measured rendered contrasts: core text 16.09:1 (body), stage text 14.70:1, enabled control text 13.40:1, muted disabled text and headers 7.08:1, hints 7.74:1, selected locale 13.10:1, orange focus against panel 9.81:1. Local control borders reuse muted; disabled opacity is 1. System font stack and all palette values come from shared tokens.

## Visual inspection and author walkthrough

Author inspected actual generated images, including trace-en-320, trace-zh-320, trace-en-1440, populated-en-320, populated-zh-390, zoom200-en, zoom200-zh, step0-zh-390, step1-en-390, step3-en-390 and step4-zh-390. The table columns and labels remain readable; current value 14 is associated with column 5 / row 0 after horizontal scrolling. The final count and four-group ledger agree. Formula operands wrap together legibly; prediction selection and explanatory feedback are readable; Python code has intentional horizontal scrolling rather than shrunken text.

The long element captures may include the sticky navigation at a capture-dependent position. Settled viewport captures (`populated-*`, and diagnostic `settled-zh-390.png`) verify ordinary use. An immediate post-element-capture image once omitted table text; settled recapture showed correct content. The final harness waits after scrolling and captures the populated viewport, so this screenshot timing artifact is not treated as a runtime algorithm defect.

Author reading observations (not a novice study): step 0 distinguishes two bcb index choices from one result; step 1's mask baseline counts string identity and exposes the false 9; step 2's b-group wraps c and cc, then derives disjointness and shorter-interval dependency; step 3 transfers the rule to an unseen worked input; step 4 names the exact occurrence lookups and their bounded costs. Rewind preserves accumulated evidence rather than merely swapping an isolated number.

## Self-check corrections before freeze

The first browser harness accidentally expected bcb→5. Independent enumeration showed {b,c,bb,bcb}→4; the fixture was corrected. No lesson result or algorithm change was needed. A later extra keyboard assertion used an invalid unquoted numeric CSS attribute selector; the selector was corrected and the full browser command rerun successfully.

A real pre-freeze 320px prose overflow came from the long `Solution.countPalindromicSubsequences(s)` identifier: 324px scroll width in a 288px paragraph, page width 340px. `overflow-before.png` retains the old screenshot. Local paragraph wrapping fixes it; the complete browser rerun passes in both languages. No prior independent acceptance existed or was rewritten.

## Remaining boundary

Independent teaching review is pending. Actual learner understanding, browser-toolbar zoom, physical devices, other platforms/fonts and public release were not measured. These are not represented as passed. No registry, campaign, acceptance report, shared asset or service was modified. The next action is the separately dispatched review of this frozen candidate.
