# #887 — author self-check, candidate C1

Author run: this Codex implementation session, exact model identifier unavailable. Authoring and checks complete; separate independent review pending. Review report/acceptance: none. Deployed revision: none authored here. No LeetCode submission or actual learner result claimed.

## Official evidence

`official-graphql.json` records the public query, timestamp, complete statement, examples and codeSnippets; `official-verification.md` extracts the Python3 callable. The official page was also opened at https://leetcode.com/problems/super-egg-drop/. Frontend ID887 differs from the API's internal questionId923. No restricted access was needed.

## Commands and observed results

From repository root:

- `python3 -B leetcode/887/tests/check.py`: exit 0. 420 exhaustive (k=1..7,n=1..60) floor-minimax comparisons, 100 seed887 binomial checks, nine named boundary/example cases including (1,10000), (100,10000), (2,10000), and the fresh (2,11). Exact source mirror and 79 unique two-language keys pass.
- `node leetcode/887/tests/browser.cjs`: exit 0. All 86 complete core traces match independently derived intermediate capacities. All six presets in both locales reach expected endpoints, with full forward rows, rewind/replay, reset/end and slider endpoints. Both locales exercise all three prediction options, explicit reveal and changed-answer feedback clearing. Language switching preserves input, index, choice, revealed feedback, source disclosure and useful focus.
- Browser source textContent, successful clipboard, manual fallback keyboard transfer (Linux Control+C), and downloaded source equal solution.py exactly. Each locale's manual transfer follows a distinct verified clipboard sentinel. Local file opening verifies source and trace without a server fetch. Blocked storage falls back without breaking locale changes.
- Real Chromium at widths 320/390/736/1440, both locales and CSS zoom 1/2: no page overflow; native selects fit a 20px arrow budget; buttons/selects have minimum 48px dimensions. Horizontal table scrolling works via keyboard. Header, trace, split equation, completed rows, source mappings and prediction explanations retain their meaning in both languages. Both lower and upper table scroll edges captured. Forced colors, reduced motion, Tab/Enter/Home/End, 3px focus and internal anchor/link targets checked. No runtime console/page errors, HTTP asset failures or external asset requests in the final run.
- Contrast test uses the sRGB formula and calibrates black/white, RGB primaries and #747474 near the AA threshold. Final per-role measurements and selector budgets appear in browser-results.json. Shared muted text remains above AA; controls reuse that token for visible boundaries and disabled content. Shipped CSS totals 11,425 bytes.
- `python3 -B scripts/register_leetcode_lesson.py 887 --validate-only`: exit 0, no output. This non-mutating metadata preflight was run before readiness. No registration was performed.

## Visual inspection

Author actually opened and inspected representative headless screenshots via the image viewer:

- `en-320-zoom1-trace.png`, `zh-390-zoom1-trace.png`: readable controls, split ledger and exact current capacity.
- `en-1440-zoom1-trace.png`, `en-1440-zoom2-table.png`: retained rows and 6+1+7=14 split; current row marked by border plus text.
- `en-320-zoom1-table.png`, `zh-390-zoom1-table.png`, `en-320-zoom1-table-right.png`: deliberate contained scrolling, numeric cells associated with egg-count headings; both edges readable, no merged values.
- `zh-320-zoom2-table-right.png`: rightmost three-egg capacity column 0,1,3,7,14 remains readable at the most constrained tested size.
- `en-320-zoom2-selector.png`, `zh-320-zoom2-selector.png`: complete “3 / 14” selected label, locally defined as eggs / floors; text not cut off by arrow.
- `en-exercise.png`, `zh-header.png`: complete revealed reasoning, selected answer and lesson/official link hierarchy.

Screenshots named `overflow-before.png` preserve the original 320px/2x header defect. Header wrapping fixed it before C1 freeze. Early harness iterations had a smooth-scroll timing assertion, a focus-visible check attempted without keyboard modality, and screenshot positioning that moved the page with End; these checks were corrected to wait for target geometry, use actual Tab input, and capture both table edges in place. Two intermediate browser runs disconnected before completing; they did not count as passes. A temporary selector-edit regex corrupted mapping copy during authoring; syntax checking caught it, the full mapping strings were restored, and final browser checks explicitly assert both correct and incorrect array-update equations. None of these intermediate states was independently reviewed or accepted. Final results refer to the frozen files only.

## Limits and next action

Self-checks are not separate review or learner teach-back. Physical devices, native browser-chrome zoom, macOS font environment and public deployment are unverified. CSS zoom2 plus independent viewport reflow tests are the recorded zoom mechanism. No network or production service was started or changed. This author owns only leetcode/887/; shared registry/concept map remain untouched by instruction. The candidate manifest records proposed concept anchors locally. Next action: fresh source-blind independent walkthrough and review of C1 under the repository's six-dimension rubric.
