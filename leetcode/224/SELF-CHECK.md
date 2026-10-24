# Author self-check — candidate 224-r1

Status: complete author candidate, ready for a **separate independent review**. No independent acceptance, submission acceptance, learner-results claim, registration, or publication.

Official statement and supported Python3 interface verified using public official GraphQL on 2026-10-18. Full response and timestamp: tests/evidence/official.json. Canonical interface: `Solution.calculate(self, s: str) -> int`. No credentials used.

Executed from repository root:

- `python3 -B leetcode/224/tests/test_solution.py`: PASS — 3,034 exhaustive/seeded/official and targeted cases; three long inputs up to 300,000 characters and depth 149,999; 103,524 intermediate frame checks against independently reconstructed AST-evaluated subtotals and saved contexts. Recursive substring baseline tested independently on all small cases. Exact source mirror checked.
- `node leetcode/224/tests/browser.cjs`: PASS — real Chromium on the existing preview; all eight presets in both locales; endpoints, reverse/replay/reset, range navigation; every prediction option, reveal/change, language-after-reveal with preserved selection/index; actual browser clipboard write/read, deterministic write fixture and denial fallback; exact displayed/copied/downloaded source; blocked storage, offline interaction, local asset checks, deep links, keyboard and focus, forced colors and reduced motion. No console/page errors or external runtime requests.
- 320/390/736/1440 CSS widths in English and Chinese; 200% CSS zoom plus double-device-scale/halved-layout-viewport checks. Stored screenshots visually inspected: tokens wrap, subtotal/sign remain associated, saved pairs wrap without collision, table retains associated column headers with intentional focusable horizontal scrolling. The sticky navigation scrolls independently. Viewport screenshots may begin mid-stage after scrollIntoView; this is capture positioning, not clipped page content.
- `node --check leetcode/224/app.js` and `node --check leetcode/224/copy.js`: PASS.
- `python3 -B scripts/register_leetcode_lesson.py 224 --validate-only`: PASS, exit 0, empty stdout/stderr. Frozen command/result in tests/evidence/preflight.json. No registration performed; complexity is one string.

Rendered contrast evidence: body 16.09:1; explanatory text 12.62:1; stage hints 7.08:1; primary action 13.10:1; disabled labels 6.45:1; error feedback 6.35:1. Additional exact-token focus/boundary/success ratios are in tests/evidence/contrast-additional.json. All measured text exceeds AA; focus and control boundaries exceed 3:1. Shipped CSS total 12,674 bytes (shared 9,425 + local 3,249), under 25,000.

Author walkthrough: inside-out arithmetic gives 6; removing parentheses wrongly gives 4, and forgetting the saved sign gives 10. Opening a group preserves both quantities, closing merges a completed term; nested/unary/multidigit traces expose these facts. Fresh transfer gives 1 only when both saved signs survive. The formal proof handles initialization, each character branch and matched termination. The sign display is explicitly stored state; after closing a group it is temporarily unused until another operator resets it.

Test-development corrections: random generator initially emitted prohibited consecutive operators and was constrained to valid parenthesized operands. Browser harness now waits for settled smooth scroll and samples contrast only when target elements exist. Final reports reflect passing reruns, not those incomplete attempts.

Limits: no actual novice teach-back, physical device/OS clipboard testing, independent teaching audit, LeetCode submission, or public delivery. Independent rubric/review/release stages remain pending. Only leetcode/224/ is authored; shared tokens/assets, registry, workflow and services are unchanged. OUTPUT_DIR makes evidence generation rerunnable outside this candidate; see tests/README.md.
