# #828 author self-check — candidate r2

Author: Codex, this author run; exact underlying model identifier unavailable. Separate reviewer: pending, no reviewer agent spawned. Independent acceptance, public delivery, actual novice outcomes, and LeetCode submission acceptance are not claimed. Candidate r2 is frozen by candidate-sha256.json (the manifest excludes itself). No shared registry, campaign state, scripts, services, or other lessons were edited.

## Official verification

2026-10-26: opened the exact official problem URL and fetched public https://leetcode.com/graphql/ with question/titleSlug, content and codeSnippets. See official.json for timestamp, full statement, examples, constraints and complete observed selector snippets. It identifies frontend ID 828, Hard, nonpaid. Official Python3 interface is `class Solution: def uniqueLetterString(self, s: str) -> int`. Python is the preferred faithful submission; no non-Python language contract is necessary. Repeated positional substrings count; uppercase A–Z, 1≤n≤100000, result fits 32-bit, no modulo and no empty official input. No paywall or authenticated access used.

## Actual commands and results

From repository root:

- `python3 -B leetcode/828/tests/test_solution.py` → exit 0. Independent substring Counter oracle: all ternary strings length 1…8 plus 500 seeded strings = 10,340 cases; official examples 10/8/92; A=1; max-length all A=100000 and alternating AB=399996. Exact Python mirror and 74 unique two-language copy pairs passed.
- `node leetcode/828/tests/test_core.cjs` → exit 0. 3,286 exhaustive/preset inputs. Every intermediate occurrence count, nearest equal boundary, legal substring pair, cumulative sum, frame count, and nested snapshot independence checked against enumeration that does not use nearest-neighbor multiplication.
- `node leetcode/828/tests/browser.cjs` → exit 0 using installed Playwright, Chromium 156.0.8078.4, Linux arm64 and existing http://127.0.0.1:18770. 28 state/meaning records, 22 layout/fit records, all seven presets, all forward and rewind frames, start/end/reset, all six hand selections, prediction pending/reveal/correct/wrong/change/reset, and locale switches preserving state. H1/document titles match metadata in both languages, including a narrow zh→en→zh roundtrip. All lesson requests local; lesson runtime/asset errors zero. Read-only related navigation to #2916 generated a preexisting root `/favicon.ico` 404; retained separately as relatedErrors, outside this folder's ownership. Both destination lesson routes and actual concept sections loaded.
- `node leetcode/828/tests/states.cjs` → exit 0. Settled longest selected value at 320px/200% zoom in both locales; disabled/selected/correct text and conservative translucent-nav contrast; #76 related label/target/meaning at 320px via keyboard. See states-results.json.
- `node --check leetcode/828/app.js`, `node --check leetcode/828/core.js`, `node --check leetcode/828/tests/browser.cjs` → exit 0.
- `python3 -B scripts/register_leetcode_lesson.py 828 --validate-only` → exit 0, no stdout/stderr. Metadata complexity is exactly `O(n) time; O(n) auxiliary space`. No registration ran. Metadata has not changed after this validation; the frozen candidate requires its own independent review.

Browser tests use NODE_PATH and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH; every evidence-producing test honors OUTPUT_DIR. See ../README.md for rerun commands that keep this candidate untouched.

## Browser/source/accessibility boundary

Rendered Python textContent, window.PYTHON_SOURCE, downloaded bytes, automatic clipboard and manual clipboard all equal solution.py including final newline. Fallback was actually copied with Linux Control+C twice in each locale; every attempt began with a fresh, verified non-source clipboard sentinel. Focus and full selection checked. Storage denial and file:// offline source display passed. No source fetch or execution service is required.

Layout checks: 320, 390, 736, 1440 CSS px in both languages; CSS zoom 2 at 320/390/1440, component scroll-width checks, 120-character Latin/CJK wrapping, 48×48 action targets, Enter/Tab, 3px focus and forced-colors focus. Native browser-chrome zoom and physical phones were not tested. Horizontal step navigation intentionally scrolls, while cards and readouts wrap.

Exact CSS shipped: 11,214 bytes (shared + local), below 25,000. Contrast helper calibrated using black/white, RGB primaries, 21:1 and #747474 on black ≈4.492948 (fails 4.5). Core body/explanation ratios 16.09/12.62, muted position text 6.45, disabled text 7.08, selected hand 11.41, correct feedback 10.00, focus/panel2 8.94. Translucent nav text is at least 7.11 even using conservative white backing at 4% transmission; full opaque-pair values are separately recorded. All tested text ≥4.5 and focus ≥3. No unsupported gradient-compositing claim.

## Visual inspection (author, not independent review)

Opened and read screenshots, including en-desktop-top; en-320-trace; zh-390-trace; en-320-event; zh-320-event and pairs; en-320-quiz; zh-1440-quiz; zh-320-ledger; en-390-ledger; en-320-zoom200; zh-390-zoom200; both 320 zoom-select-settled images and zh context. Observed distinct position labels/status, readable wrapping, correct E at index1 p=-1 q=2 giving 2×1=2, cumulative LEETCODE ledger 8,10,15,35,55,73,87,92, fresh ABACA answer 4 with both excluded neighbors, and full LEETCODE selector text at 200%. Sticky navigation overlaps the top of some viewport captures because of capture scroll positioning; focused element captures confirm the associated labels/formulas themselves are not clipped.

The first immediate zh zoom-select element screenshot captured a blank native-select text paint. It is retained; a fresh-context settled capture after 250ms shows the full label, with matching selected value and sufficient width. This is capture timing evidence, not a changed algorithm or a waiver of label fitting.

## Draft issues found and resolved before freeze

1. Language button measured 44.02×48 and official link 84.17×44. Added local minimum-width and specific minimum-height overrides; full rerun passed.
2. The native-select conservative width budget initially failed: width128 < 77.616 text +30 padding +24 arrow =131.616. The original normal-width screenshot showed full text; this was a failed reserve predicate, not proof of clipping. Adjusted local padding/layout while retaining the 24px reserve. Final 320/200% width116 ≥113.616; visually confirmed in both locales. No font-size reduction or semantic shortening.
3. Snapshot objects now deep-copy nested pairs; the regression mutates the final snapshot and confirms earlier state remains unchanged.
4. Separated preexisting related-page favicon error from this lesson's zero runtime/asset errors; the error is retained verbatim in browser-results.json. No shared files changed to hide it.

These are author iterations before independent review, not independent findings/closure. No prior acceptance record was edited. Next action: separate source-blind reviewer walkthrough and six-dimension scoring against the frozen candidate, then source/oracle/browser audit. Review status stays in this record and BRIEF, not lesson UI.
