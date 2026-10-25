# Author candidate 745-v1 — self-check only

Date: 2026-10-25. Canonical language: Python. Candidate lives exclusively in leetcode/745/. Design pattern is reused under the existing product/design adjudication; this report does not independently accept the lesson.

Executed from repository root:

| Command | Actual result |
|---|---|
| `python3 -B leetcode/745/tests/test_solution.py` | PASS: 34,342 oracle queries; 258 exhaustive dictionaries; 500 seeded dictionaries; 10,000 extra repeated stress calls; source mirror exact |
| `node leetcode/745/tests/test_core.cjs` | PASS: 14 full preset states, independent intermediate map/write-count checks; 87 two-language copy entries; zero duplicate keys |
| `node leetcode/745/tests/browser.cjs` | PASS: real Chromium on Linux, both languages, four presets and every reachable frame/query; eight width/locale states plus zoom, interaction, clipboard, assets and contrast |
| `python3 -B scripts/register_leetcode_lesson.py 745 --validate-only` | PASS: exit 0, no stdout/stderr; no registration performed |

Machine-readable results, screenshots and downloaded-source receipts are under tests/evidence/. Candidate/source/shared-policy hashes are recorded separately in candidate-sha256.json. All test output locations honor LESSON_TEST_OUTPUT_DIR.

The official public GET GraphQL capture verifies the actual Python3 constructor and repeated method interface. The browser animation is a separate JavaScript simulation. Python is executed by the numerical test, not in the page. Neither test type claims an accepted LeetCode submission.

## Rendered evidence inspected

Visually inspected the eight trace screenshots (EN and ZH at 320, 390, 736 and 1440), both 200% zoom screenshots, and forced-colors.png. The grid retains pair identities and a sticky prefix header column; narrow layouts deliberately scroll the two-dimensional grid, with bilingual visible instructions and a tested keyboard path. Labels/readouts wrap and remain associated. The native selected-preset text was measured for all four options in both languages at every width and at rendered zoom (40 measurements); actual font stacks and available widths are in browser-results.json. No resolved-font identity is inferred across machines.

Observed causal path: default ap/e key goes absent → 0 → 1 → 2. The changed ap/pe query goes absent → 0 → 0 → 2, visibly retaining its value through apple. Each terminal frame shows the just-completed word's own grid, the queried pair's current value, all stored keys and cumulative old→new history. Independent map tests verify the values rather than trusting the page's formatter. In the fresh exercise, (aba,aba) goes 0→1→2 and axa leaves it unchanged. Feedback is hidden until selection plus reveal; changing choice clears it; locale and unrelated reset preserve it.

Both related links were followed by keyboard in both languages at 320px. #336 step1 actually explains reversed-trie end matching; #472 step2 actually explains prefix boundaries and piece cuts. Resolved local preview URLs, labels and destination excerpts are in browser-results.json. This verifies local availability and meaning, not a future public release manifest.

The browser recorded no console errors, failed asset requests or external runtime requests. Shared CSS plus local CSS is 11,291 bytes, below 25,000. No runtime imagery or external font is shipped. Disabled controls have measured opacity 1 and muted-on-panel2 contrast 6.4494:1; body text on panel is 14.7046:1. Accent, warning, good, source text and focus pairs also pass; full unrounded ratios are saved. The actual contrast helper is calibrated against black, white, RGB primaries and the near-threshold #747474/black case (4.492948, correctly below 4.5). Solid-color roles were tested; this is not a general audit of arbitrary transparent effects.

Clipboard success, fallback selection and the Linux native Control+C transfer were read back exactly, including the final newline. Downloaded bytes and rendered textContent each match solution.py. Storage denial preserves the working in-memory locale and trace. Keyboard Enter operates controls; a focused grid responds to ArrowRight; focus outlines and forced colors are checked. Reduced motion is enabled in the suite; no automatic animation/timer exists.

## Author findings and final candidate

The initial browser run caught a nonexistent related target (#642); it was replaced with the available #472 explanation. The #336 target was corrected to its actual reversed-trie section. Screenshots exposed a lagging nav highlight; the local active-section calculation now follows scroll position and keeps the current tab visible. Native labels were shortened and disabled styling made explicit. A subsequent test-only width-variable error was corrected without weakening assertions. Historical author discovery details remain in tests/evidence/initial-browser-finding.txt.

Before final preflight, the complexity string was refined to use the query's own |pref|+|suff|, since a query may exceed the maximum word length. The prose also distinguishes baseline input storage from O(1) scan workspace. This is the final author candidate for fresh independent review; there is no prior independent acceptance to rewrite.

## Limits and next gate

200% testing uses actual Chromium CSS zoom=2, not OS/browser-chrome UI scaling. No physical phone, screen reader, other native font environment, public deployment, learner teach-back, independent reviewer run, or LeetCode submission is claimed. The next gate is a separate independent lesson review of this frozen candidate. No registry, shared assets, campaign state, prior review, Git configuration, services or credentials were changed; no commit/push/deployment was performed.
