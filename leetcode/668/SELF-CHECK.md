# Author self-check · #668

Status: complete author candidate, ready for a separate independent review. Author: Codex (exact model identifier unavailable). No independent reviewer, novice learner outcome, official LeetCode submission acceptance, registration or deployment is claimed.

Official statement and actual Python3 callable were verified using public official GraphQL on 2026-10-25. See `provenance/README.md` and the complete captured response. Python faithfully matches `Solution.findKthNumber(self, m: int, n: int, k: int) -> int`; there is no language fallback. Chinese copy is authored translation.

## Executed checks

From the repository root:

| Command | Result |
|---|---|
| `python3 -B leetcode/668/tests/test_solution.py` | PASS: 6,892 actual Python interface cases, including all ranks for dimensions 1…12, seed 668 rectangles/transposes, both official examples and maximum-bound closed forms. Exact source mirror and 97 unique bilingual copy pairs verified. |
| `node leetcode/668/tests/test_core.cjs` | PASS: 6,390 input cases, 44,642 snapshots, 6,516 threshold checks. Independent explicit cell enumeration checks row contributions, tested mid/count, exact transitions, invariant, containment, strict shrink, terminal answer and deterministic replay. |
| `node leetcode/668/tests/browser.cjs` | PASS: Chromium 156, both locales; 44 rendered trace states, 10 viewport/zoom layouts; zero console, script, asset or local-request failures. |
| `node leetcode/668/tests/layout-audit.cjs` | PASS: 28 supplementary checks, including every closed selected preset label at 320/390 in both locales, terminal/large grids, actual keyboard scrolling and synthetic long Latin/CJK wrapping. |
| `python3 -B scripts/register_leetcode_lesson.py 668 --validate-only` | PASS: exit 0, no output; no registration or shared-file edits. Exact receipt in `tests/evidence/preflight.json`. |

Generated test receipts and screenshots are in `tests/evidence/`. `tests/README.md` explains reproduction with `OUTPUT_DIR`, so reviewer reruns need not modify this candidate.

## Rendered state and bilingual observations

- Default second round in both languages shows old [1,5], just-tested mid=3, C(mid)=5, row counts 3/1/1, new [1,3]. Forward/back/forward restores the full text, marks and accumulated history. Terminal result is separately labeled; the grid continues to describe the last test, not the updated boundary.
- All six presets reach independently enumerated answers; 1×1 starts terminal with 0/0 rounds and disabled next/end. First/last/reset/scrub and language-after-interaction preserve their stated scope. Threshold slider is an independent fixed 3×3 experiment; every x=1…9 is checked, including C(4)=C(5)=6.
- The fresh 3×4,k=7 exercise hides explanation until a selection and explicit check. All three options are exercised in both locales. Feedback explains 4+3+2=9 and retaining [1,6]; changing the option clears feedback. Locale preserves selection/reveal; lab reset/preset does not reset this independent exercise.
- The rendered formula in both languages is exactly `C(x) = Σᵢ₌₁ᵐ min(n, ⌊x/i⌋)`. Locale keys are checked before silent duplicate overwrite can occur. Algorithm feedback and clipboard fallback have distinct observed bilingual meanings.
- Embedded, DOM `textContent`, copied and downloaded Python are exactly the 419-character canonical source, including its final newline. Clipboard success and manual Ctrl+C each replace a distinct sentinel; denial exposes the complete selected source. Language changes preserve the open disclosure and manual source. Offline `file://` opening and denied storage work without fetching source.
- Keyboard Enter/ArrowRight operates the real controls; navigation lands below the sticky strip; language focus remains on its button. History is intentionally a focusable horizontal scroll region, with headers and arrow-key guidance. All local related links resolve to existing concept anchors.

## Visual and accessibility inspection

Visually inspected all retained screenshots: headers, hand calculation, intermediate tables at 320/390/736/1440 in EN/zh, predictions, manual source fallback, largest/single-row/1×1 endpoints, right-scrolled history, count experiment, forced colors and native 200% zoom controls/diagram. Labels, values and row associations remain distinguishable. Long history is intentionally horizontally scrollable; screenshots at its right edge show the new interval and reason columns, while its left edge shows round/old interval/test columns.

Native browser zoom is actually 2 via `chrome.tabs.setZoom`; measured innerWidth=720, outerWidth=1440 and devicePixelRatio=2. Native screen capture is used because default headless surface screenshots sometimes produced blank/stale scrolled content despite correct DOM geometry. The corrected captures were inspected, including the 390px English history. This capture limitation is not presented as a tested learner outcome.

Measured rendered sRGB contrast ratios:

| Pair | Ratio |
|---|---:|
| Explanation / step background | 12.62:1 |
| Hint / step background | 7.74:1 |
| Formula / panel2 | 13.40:1 |
| Primary button, selected language, marked grid | 13.10:1 |
| Disabled control text / panel2, opacity 1 | 6.45:1 |
| Table headers / panel | 7.08:1 |
| Focus outline / adjacent surface at 4px offset | 9.81:1 or higher |

Touched buttons/select/language controls are at least 48px. Focus outlines are 3px with 4px separation; forced-colors retains a visible outline. Reduced motion is honored. Shipped shared+local CSS is 12,046 bytes. No runtime images, fonts, remote assets, services or dependencies were added.

## Author fixes and limits

Pre-freeze browser testing exposed unescaped `<` characters in the static English fallback markup, which swallowed radio controls. Static text is now HTML-escaped; the real browser verifies the choices and feedback. Clipboard tests await asynchronous completion, focus tests use actual keyboard modality, and focus contrast is measured against the surface adjacent to the offset ring. These are author checks, not independent finding closure.

Loading/sending/reconnect/expiry states are inapplicable to this synchronous offline lesson. It has no network computation or background process. Only official-valid positive integer inputs are taught; huge input execution is tested in Python outside the bounded visual presets. Physical phones, other OS font environments, virtual keyboards, production delivery and actual novice teach-back remain unverified. Independent lesson acceptance remains pending.

The frozen source/dependency hashes are in `tests/evidence/candidate.json`. Any subsequent implementation or metadata correction is a new candidate for separate review.
