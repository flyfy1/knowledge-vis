# Reproduce author self-checks

From repository root, with the already-running preview (no server startup):

```sh
OUTPUT_DIR=/tmp/1096-review python3 -B leetcode/1096/tests/test_logic.py
OUTPUT_DIR=/tmp/1096-review node leetcode/1096/tests/test_core.cjs
OUTPUT_DIR=/tmp/1096-review node leetcode/1096/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 1096 --validate-only
```

Node uses available NODE_PATH Playwright. Browser honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH; PREVIEW_URL may override the full lesson URL. Python generates cases.json in OUTPUT_DIR, consumed by test_core.cjs. All result/screenshot emitters accept OUTPUT_DIR. Default is this lesson's tests/evidence. Rerun into another directory to preserve the frozen evidence. build_copy.py is an authoring utility that mutates copy.js, not a verification command.

Python checks the actual official callable against independent innermost textual substitution. Exhaustive generation covers all expressions up to8 characters over a,b made from concatenation and binary brace unions, plus700 deterministic seeded cases, both official examples, duplicate/scoping counterexamples and60-character boundaries. The4096-output boundary is {a,b} repeated12 times. It is not a claim that every60-character expression has been exhausted.

JS compares all final sets with Python oracle results and checks each live call's U/T by separately expanding its completed input prefix. Pending child groups are excluded from parent state. Product/union equations, child return, cursor bounds and deep snapshot independence are asserted.

Chromium exercises both locales, all presets, every frame and rewind/replay, endpoints/reset, call stack and operand text, input cursor, all prediction selections and changed-answer invalidation, language state preservation, source disclosure/copy/download, native manual copy with a freshly verified distinct clipboard sentinel per attempt, blocked storage, file:// offline source, keyboard focus/Enter, local requests, related deep links,320/390/736/1440px and CSS200% zoom. CSS zoom is layout stress, not a physical device or a claim of native browser zoom/device validation. Screenshot inspection remains a human/author step; assertions alone do not prove visual readability. Contrast helper is calibrated against black/white, RGB primaries and #747474-on-black before testing actual solid rendered pairs; translucent sticky navigation is opaque-equivalent over the tested dark page, while selected active nav has a solid background.

Separate review remains pending. No accepted LeetCode submission, independent teaching audit, real novice result, physical device check or public deployment is asserted.
