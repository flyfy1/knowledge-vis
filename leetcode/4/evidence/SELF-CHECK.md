# Lesson 4 — R1 author fix evidence (2026-10-18)

This is an implementation-run self-check, not an independent review or finding
closure. Candidate is the working-tree revision identified by `candidate-files.json`.
The independent report remains `specs/reviews/4-review-1-8399884b.md`, unchanged.
Only lesson 4 implementation, brief, tests and evidence are owned by this fix.

| Stable finding | Fix and observable evidence | Author disposition |
| --- | --- | --- |
| LC4-R1-01 (required) | Step 02 now starts with the same [1,3]/[2] input from step 01. Concrete cuts, group membership, middle rank and each named boundary precede the formulas. Empty sides, both wrong-direction exclusions, the shorter-array legality argument, and existence/termination follow. Mapping defines al/ar/bl/br individually. New preset 4 reproduces the decrease case. See `en-1280-derivation.png`, `zh-390-derivation.png`, `browser-results.json` and `model-results.json`. | Fixed awaiting separate re-review |
| LC4-R1-02 (optional) | Lesson-local `lesson.css` changes only active coordinate text to inherited --text. Actual rendered RGB pairs measure 8.1706:1, exceeding 4.5:1. See `contrast-results.json`, `en-320-stage.png`, `zh-390-stage.png`. | Fixed awaiting separate re-review |
| LC4-LEGACY-RANGE (previously rechecked by reviewer) | Both direction updates retain the tested cuts while displaying post-operation bounds. New decrease preset explicitly asserts cuts [1,2] and hi=0; exact rewind/replay tests pass in both locales. | Preserved behavior; no new independent closure claimed |

## Author reconstruction of the affected reading path

This is a self-walk of the served page, not a cold independent walk. In English
and Chinese, the page now lets me reconstruct these statements before reading
the submission code:

1. With a=[2], b=[1,3], cuts [2 | ] and [1 | 3] put [2,1] left and [3] right.
   Every left value is at most every right value; two left values put their
   maximum at combined rank 2. The median is 2.
2. aL is 2, aR is missing, bL is 1, bR is 3. +∞ stands for a missing right
   boundary and −∞ a missing left boundary. These placeholders do not change
   the input. Within-row order is supplied by sortedness, leaving two cross-row
   comparisons.
3. Trying i=0,j=2 instead leaves 3 on the left of 2. Increasing i gives the
   valid split above. Decreasing i cannot raise aR or lower bL.
4. On a=[10,11], b=[1,2,3], i=1,j=2 gives 10>3. Increasing i gives 11>2;
   discard this cut and larger cuts. Decreasing to i=0,j=3 gives left [1,2,3],
   right [10,11], answer 3. In the UI the first operation tests [1,2] and sets
   hi=0; the next operation returns 3. This maps directly to `hi = i - 1`.
5. With even total, left maximum and right minimum occupy the two middle ranks:
   [1,2 | ] and [ | 3,4] give (2+3)/2=2.5. The empty-input example uses the
   same boundary rules. The m≤half≤n argument explains why j cannot leave b.
6. The original fresh quiz [2,6]/[1,3,4,5] remains unrevealed until explicit
   choice/check; it asks for a new valid partition and the even median, 3.5.

The browser checks assert the ordering of concrete membership/boundary blocks
before formulas, but assertions cannot certify novice comprehension. Desktop,
Chinese 320px, both-language decrease walkthroughs, English CSS-200% boundary,
and both-language narrow populated stages were visually inspected. Text wraps,
cut labels and coordinates remain readable. Long sections require normal scroll;
code blocks retain their own scrolling areas.

## Reproducible computational and browser checks

Run from the repository root:

```sh
python3 leetcode/4/tests/check-code.py
node leetcode/4/tests/check-model.cjs
node --check leetcode/4/copy.js
node leetcode/4/tests/check-browser.cjs
```

Browser dependencies use the supplied NODE_PATH, and launch honors
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. The code/browser scripts adapt the previous
review's checks into lesson-local outputs; they remain author-run regressions.
The model invariant check was added for this fix.

- `code-results.json`: 5,507 checks execute canonical `solution.py`, including
  exhaustive small sorted arrays, 600 seeded large pairs, maximum 1000+1000,
  empties, extremes, duplicates, negatives and independently predicted fresh
  inputs. Every result is a float; inputs remain unchanged. [1,2]/[10,11,12,13]
  returns 10.5, whereas averaging the separate medians would give 6.5.
- `model-results.json`: 4,899 cases / 7,366 tested frames checked against an
  independently sorted-rank oracle. Checks include legal j, i+j=half, valid-cut
  retention, both direction updates and unchanged inputs.
- `browser-results.json`: 158 passing assertions, zero page errors. Both locales,
  all five presets, initial/terminal disabled controls, exact rewind/replay/reset,
  all three quiz choices, explicit reveal/change, locale state/focus retention,
  keyboard Home/ArrowRight/Space/Enter, 320/390/1280 layouts, sticky anchor offset,
  CSS 200% enlargement, clipboard success and denied clipboard/storage fallback,
  selection/focus, and offline opening/advancement. Served bytes match files;
  SHA-256 hashes are recorded there. Source display, clipboard, actual download,
  manual-copy textarea, offline display and embedded source match canonical Python
  exactly. No mirror regeneration was needed.
- `contrast-results.json`: actual active RGB text/background and 8.1706:1 contrast;
  total shipped shared-plus-local CSS is 13,454 bytes.
- `git diff --check` passes. No shared implementation, registry, review report,
  rubric, other lesson or service was changed.

Python remains the faithful official `Solution.findMedianSortedArrays(self,
nums1: List[int], nums2: List[int]) -> float` interface. The prior independent
report already audited that interface against the official statement. This fix
changes neither its code nor semantics. Read the exact registration table:
Python → solution.py / python-code.js / PYTHON_SOURCE. No language-contract.json
or supportedLanguages list exists to omit a preferred language; default Python
is already the highest preference. No non-Python exception is being selected.

## Limits and next action

CSS `zoom:2` is a layout/enlargement test, not native browser-menu zoom. No real
phone, novice teach-back, LeetCode submission or public deployment was performed.
No score or independent acceptance is assigned. Next action: a separate reviewer
should walk affected steps and prerequisites in both locales, reconstruct both
exclusions, inspect the five presets and recheck LC4-R1-01 / LC4-R1-02 against
this candidate. Only that reviewer can close the findings.
