# #943 author checks

From the repository root, using the existing preview service:

```sh
python3 -B leetcode/943/tests/numerical.py
node leetcode/943/tests/core.cjs
PREVIEW_ROOT=http://127.0.0.1:18770 node leetcode/943/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 943 --validate-only
```

All three test runners accept `OUTPUT_DIR=/absolute/path` for result JSON, screenshots, temporary zoom-extension profile and downloaded source. A reviewer should redirect outputs to preserve the candidate's evidence. Browser dependencies are resolved through the supplied `NODE_PATH`; `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`, if set, is honored for ordinary and native-zoom contexts. No service is started. Tests require Linux/macOS native Chromium clipboard permissions; the host shortcut uses `process.platform`. Each fallback attempt verifies a distinct non-source sentinel, forces automatic write failure, presses the real host copy shortcut and reads the exact source from the clipboard.

Numerical tests execute `Solution.shortestSuperstring(words)` in Python. The small independent oracle enumerates all output strings by increasing length; larger cases enumerate permutations and directly merge full strings. The exact baseline displayed in index.html is also executed. Official examples, disjoint maximum inputs and a provably minimal 12-word length-20 chain are included. Input is checked for mutation. JavaScript tests inspect all settled intermediate DP cells and candidate identity/value/parent consistency, including deep snapshot independence.

Browser tests operate every frame and both endpoints for all 5 presets in both languages, restore snapshots, preserve locale state, try all prediction options, clear changed-answer feedback, transfer source via native automatic/manual copy and download, deny storage, open the source offline, activate keyboard controls and related links, inspect real rendered formulas and source/target labels, measure control-fit budgets and contrast, use 320/390/736/1440 CSS widths and actual Chromium `tabs.setZoom(2)`. Horizontal DP table scrolling is intentional, keyboard accessible, and keeps row headers fixed. Screenshots need human visual inspection in addition to automated checks.

`evidence/official.json` is the dated public LeetCode GraphQL capture with statement, constraints, examples and all observed code snippets including Python3. No authentication/paywall workarounds were used. `candidate.json` binds local runtime/test files and shared dependencies to SHA-256 hashes. `browser-first-attempt.txt` preserves initial harness issues. These are author self-checks, not a separate reviewer or LeetCode acceptance. Physical devices, actual learners and public deployment are unverified.
