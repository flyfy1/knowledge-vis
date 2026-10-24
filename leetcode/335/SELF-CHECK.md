# #335 author self-check — candidate 335-author-v1

Status: complete author candidate, ready for separate independent review. No independent acceptance, novice outcomes, LeetCode submission result, registration, commit, deployment or public delivery is claimed. Authored and checked in this run; exact underlying model identifier unavailable. Only leetcode/335/ was written.

## Official contract

Public official URL https://leetcode.com/problems/self-crossing/ and public GraphQL were accessible. `provenance/official.json` retains the dated HTTP-200 response, complete statement, all observed code snippets, and Python3 `Solution.isSelfCrossing(self, distance: list[int]) -> bool`. Python faithfully implements this interface, so no non-Python language contract is required. The Chinese title is an authored translation. Runtime assets never load this provenance file.

## Reproduce

From the repository root, using the already-running preview at http://127.0.0.1:18770:

```sh
python3 -B leetcode/335/tests/check.py
node leetcode/335/tests/browser.cjs
node leetcode/335/tests/visual.cjs
python3 -B scripts/register_leetcode_lesson.py 335 --validate-only
```

All test artifact writers accept `OUTPUT_DIR`; set it to a separate writable directory to rerun without changing the candidate evidence. Browser tests use installed Playwright through NODE_PATH and honor PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. No service is started by these commands. The core checker is invoked by check.py with its independently computed fixtures.

## Observed results

- `tests/evidence/numeric-results.json`: 34,531 original Python/oracle comparisons. Exhaustive lengths 1…9 over {1,2,3}, 5,000 seeded random arrays (seed 335), official examples and targeted touching/overlap cases. Maximum n=100000: strictly expanding [1,…,100000] is false; all-100000 lengths are true. No input mutation. Exact solution/mirror parity.
- Independent baseline uses coordinate boxes and orientation signs, not the optimized three-case predicates. For every positive result, the pre-collision prefix is separately checked as safe, and a recent (3/4/5-back) contact is independently confirmed. The first crossing may also contact a much older segment at the same point: [1,1,2,2,3,1,1] contacts both 0 and 1 on segment 6. Tests correctly require detection, not equality with the oracle’s oldest reported pair.
- JavaScript simulation: all 34,531 fixtures match the oracle’s first event, and its reported old segment is an actual coordinate intersection. Every prefix’s positions and lengths are checked, and snapshots do not share nested coordinate arrays. Duplicate localization keys: zero; all pairs contain both languages.
- `tests/evidence/browser-results.json`: real headless Chromium. Both locales; all 7 presets × 6 final lengths × 2 locales = 84 variants. Forward to termination, previous/next replay, reset and End restore identical state. Preset/length changes restart only the experiment. A/B/C visible inequalities and old-contact labels were checked against their intended meanings in both locales.
- Every prediction option was selected before explicit reveal; correct and incorrect explanations were checked; changing an answer clears feedback. Locale switching preserves frame, preset, selected answer, reveal and open source disclosure. Real clipboard read/write succeeds; simulated denial selects the exact source for manual copying, with bilingual fallback messages. Displayed, embedded, copied, selected and downloaded sources match solution.py.
- 320/390/736/1440px in both locales; each width also tested at CSS layout zoom=2 (200%). No document overflow. Enlarged plots/tables permit contained horizontal scrolling. This is browser CSS layout zoom, not an OS scaling or physical-device claim. Deep-link headings clear the sticky navigation. Buttons are at least 48px high. Actual Enter/Tab/Shift+Tab/radio ArrowDown and visible 3px focus were exercised. Storage-denied initialization and language changes work. Source display works with the solution.py request blocked; no network source fetch is needed.
- Zero page errors, HTTP asset errors or external runtime requests. Shared CSS 9,425 bytes + local CSS 2,186 bytes = 11,611 bytes, below 25,000. No external fonts, assets or dependencies are shipped.
- Computed contrast: body 16.09:1, muted body 7.74:1, explanation 12.62:1, readout 13.40:1, disabled control 6.45:1, primary action 13.10:1, focus 10.73:1, correct-answer green 10.00:1. Core text exceeds 7:1; disabled text exceeds AA. SVG labels remain 14 CSS px and do not scale down with the viewBox.
- `tests/evidence/preflight.json`: `python3 -B scripts/register_leetcode_lesson.py 335 --validate-only`, exit 0, empty stdout/stderr. Metadata complexity is the single string `O(n) time; O(1) auxiliary space`. No registry/campaign/report files were modified to pass validation.

## Visual inspection and revisions

The author opened the generated screenshots with the image viewer: both header/hand/derivation/prediction locales; A/B/C, shortest and outward plots plus coordinate tables in both locales; trace screenshots at all four widths; both 200% desktop screenshots; keyboard focus and forced-color screenshots. Numbered paths, exact tables, contact dashes, selected radio labels, feedback, wrapping and source controls were inspected. Viewport screenshots may show ordinary content continuing under the sticky nav because the plot was scrolled into view; navigation-target geometry was independently checked.

Author checks found and fixed: the overly strong claim that a first contact cannot also meet an older side; a select overflowing at 200% CSS zoom; viewBox text shrinking on phones; the B-case origin label colliding with the segment label; SVG axes losing contrast in forced colors. The final origin label is on the left, labels retain 14px size, and forced colors uses explicit Canvas/CanvasText/Highlight. Final branch checks and supplemental screenshots were rerun. A final bilingual prose refinement adds hand calculations for B/C before their formulas and clarifies that continued outward expansion is safe; numeric, localization and supplemental browser checks were rerun afterward. No earlier independent review or acceptance existed to revise.

## Limits and next gate

This is an author self-check. Separate cold teaching review of the frozen candidate is still required. Actual novices, physical touch devices, screen-reader speech, OS/browser-toolbar zoom, public deployment and LeetCode acceptance were not measured. Browser simulation costs are separated from O(1) submission auxiliary space. `CANDIDATE-SHA256.json` identifies review inputs and shared read-only dependencies. Any subsequent material fix requires a new candidate and appropriate independent review.
