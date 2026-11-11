Run from repository root. Existing browser packages come from NODE_PATH; use the existing preview service.

```sh
export OUTPUT_DIR=/tmp/lesson-1125-review
python3 -B leetcode/1125/tests/test_solution.py
node leetcode/1125/tests/test_core.cjs
node leetcode/1125/tests/browser.cjs
node leetcode/1125/tests/header.cjs
python3 -B scripts/register_leetcode_lesson.py 1125 --validate-only
```

OUTPUT_DIR defaults to this folder's evidence directory. Set it for a reviewer rerun to avoid modifying the frozen author evidence. Python writes oracle-fixtures.json; the core test consumes that independent fixture file from the same OUTPUT_DIR. The browser URL defaults to the supplied preview; PREVIEW_URL may override its complete lesson URL. PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is used if set. The browser test runs on the actual host and uses Meta+C only on darwin, Control+C otherwise. Every fallback attempt verifies a distinct clipboard sentinel before denying automatic writes. It does not mock clipboard readback or inject solution text as a fallback success.

The Python test executes the canonical class method and the baseline extracted from index.html. Its oracle enumerates person combinations and set unions, independently of the DP. Exhaustive feasible lists: m=1..3, n=1..4; seeded cases up to m=6,n=10; official fixtures from the saved public GraphQL response; maximum m=16,n=60 expected-value cases. It verifies coverage, uniqueness, minimal count, bounds and no input mutation. The core test independently enumerates all person subsets at every processed prefix, compares each exact-coverage optimum, and checks every transition's source, candidate, incumbent and update decision. It parses copy.js with Acorn to reject duplicate keys before JS overwrites them.

Browser checks exercise both locales, every preset and endpoint, all forward/back round trips, hand operations, every quiz choice/reveal/change, language-state preservation, source display/copy/download bytes, denied-storage and offline source, all presets at 320/390/736/1440 widths with CSS zoom 1 and 2, selected native-option width budgets (24px conservative arrow allowance), page overflow, focus and actual keyboard actions, local asset responses and related section meanings. Screenshots are viewport captures; CSS zoom is a reproducible headless layout check and does not claim physical-device or native browser-menu zoom testing. Read the author's visual-inspection record for screenshot observations. Contrast uses rendered computed colors and a luminance helper checked against known 21:1 and 1:1 pairs. Native select fit budgets apply to this Chromium/Linux font environment, not every OS.

Passing scripts establishes author self-checks only. Independent cold review, physical-device verification, novice comprehension, LeetCode submission acceptance and public deployment are not claimed.


1125-R1 focused regression (both rendered locales, narrow wrapping, greedy trap,
and actual Python execution for m=16,n=1):

```sh
OUTPUT_DIR="$PWD/leetcode/1125/tests/evidence/review-r1/after" node leetcode/1125/tests/review_r1.cjs
```

The preserved before/ subdirectory records its failure against the reviewed wording;
after/ contains the repaired candidate checks. The repair manifest is separate from
the original author manifest. These are self-checks; independent closure is pending.
