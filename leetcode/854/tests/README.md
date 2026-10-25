# Reproduce author checks

From the repository root, use the already-running preview (default http://127.0.0.1:18770). Do not start a service or register this candidate.

```sh
EVIDENCE_DIR=/tmp/854-review python3 -B leetcode/854/tests/test_solution.py
EVIDENCE_DIR=/tmp/854-review node leetcode/854/tests/test_core.cjs
EVIDENCE_DIR=/tmp/854-review NODE_PATH="$NODE_PATH" node leetcode/854/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 854 --validate-only
```

Browser needs the installed Playwright package (NODE_PATH) and honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH and optional PREVIEW_URL. Every evidence-producing test honors EVIDENCE_DIR; none changes runtime assets. `build_page.py` is the lesson-local author regeneration utility, not a review test; it rewrites copy/index/metadata and is not needed for verification. No first-ten generator was used.

Python tests compare the official callable against unrestricted pair-swap BFS: all ordered anagram pairs on the binary alphabet up to length 7, 220 seeded four-letter cases and eight boundary/official/transfer fixtures. Core tests use a separate JS unrestricted BFS and inspect every intermediate frame on 7 presets plus 180 seeded cases. Browser expectations for layer rendering are tied to the independently checked core, with literal bilingual event and formula assertions. See solution-results.json and core-results.json for separate numerical evidence.

Browser tests cover all presets/endpoints, back/forward equality, both locales, independent prediction state and clearing, locale preservation, exact source display/embedding/download, automatic copy and native manual fallback with distinct verified sentinel each locale, blocked storage, offline file loading, controls, keyboard and focus, forced colors, sticky anchors, 120-character wrapping, widths 320/390/736/1440 and CSS 200% zoom, native-select fit budget, calibrated WCAG contrast, local asset errors, and keyboard activation of both related lessons in both locales. CSS zoom tests layout at 200%; OS/browser-chrome zoom, touch hardware and real learner teach-back remain untested. Tests do not claim independent review, public deployment or an accepted LeetCode submission.

Official capture: tests/evidence/official.json contains the exact public GraphQL response, including complete codeSnippets, content, frontend ID and free-access flag. Captured at 2026-10-25T21:52Z = 2026-10-26T05:52+08:00. Python3 interface observed: `class Solution: def kSimilarity(self, s1: str, s2: str) -> int`. Canonical Python needs no exception language contract. No statement text is fetched at runtime.
