# Reproduce the author self-check

From repository root (no server started):

```bash
export OUTPUT_DIR=/tmp/lesson-140-check
python3 -B leetcode/140/tests/test_solution.py
node leetcode/140/tests/test_core.cjs
node leetcode/140/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 140 --validate-only
```

Use the provided NODE_PATH for Playwright. Browser launch honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. The preview origin is http://127.0.0.1:18784. The first command creates independent cut-mask fixtures used to check every completed suffix in the JS model. Emitted results and screenshots all honor OUTPUT_DIR; rerunning in a new directory does not alter the frozen candidate. The non-mutating preflight writes no registration or metadata.

Canonical callable: `Solution().wordBreak(s, wordDict)` returning `List[str]`. Tests execute this Python directly, with separate cut-mask enumeration. Tests do not submit to LeetCode. No package download is required.

Browser coverage: every event of seven presets in both locales, back/forward identity, range, reset, endpoints, all quiz choices, reveal/change and locale preservation, clipboard write/read, intentional rejection and manual fallback, displayed/downloaded source equality, keyboard activation/focus, internal link anchors, denied storage, offline file-opening, zero external requests/errors, 320/390/736/1440 widths and CSS layout zoom 200% at 780px. Contrast is computed from actual CSS foreground/background pairs plus the focus token. Zoom screenshots document renderer layout zoom rather than a physical-device test.

Evidence levels: these are author self-checks and independently derived computational oracles, not an independent lesson review, learner study, accepted submission or publication. A separate reviewer must cold-walk the frozen candidate under specs/leetcode-review-gates.md.
