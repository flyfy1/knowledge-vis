# Author self-check — candidate 154-author-v1

This is an implementation candidate, not independent acceptance. No LeetCode
submission, novice study, real-device verification or deployment is claimed.
Only leetcode/154/ was authored. The approved shared pattern was reused; no
registry, shared scripts/styles, campaign state or historical review was edited.

Official verification: tests/evidence/official.json captures the public GraphQL
request, dated response, statement, examples, constraints and actual language
selector stubs. Python3 supports Solution.findMin(self, nums: list[int]) -> int.
Python is the canonical submission. No nondefault language contract is needed.

## Author explanation pass

| Step | Operation and observed causal meaning |
| --- | --- |
| 0 | Hand scan [2,2,2,0,1] leaves records 2,2,2,0,0. Return value 0 differs from index 3. Three right rotations of [0,1,2,2,2] produce this input. Baseline keeps only a running minimum. |
| 1 | Compare 2>1 at old m=2,r=4, retain [3,4]; then 0<1 retains [3,3]. Equality counterexamples have the same compared values but minima on opposite sides, so only the duplicate r can safely go. |
| 2 | Equality preset [1,0,1,1,1] starts [0,4]; one action yields [0,3], visibly crosses out only index 4, and records the old midpoint separately. Back/forward restores all cells and history exactly. All-equal preset takes four one-item deletions; singleton starts finished. |
| 3 | Fresh [3,1,3,3,3,3,3] requires keeping a minimum, not guessing its side. Select the duplicate-removal reasoning, explicitly reveal, then change choice: feedback hides. Locale preserves selection and reveal. Distractors discard the unique minimum or return the wrong value. |
| 4 | Inclusive initialization, strict shrink and minimum preservation force the final singleton to contain a minimum. Branch descriptions map directly to Python. All-equal input defeats logarithmic worst-case time; submission stores only three indices. |

## Executed checks

- `python3 -B leetcode/154/tests/check.py`: passed 10,086 executed Python cases;
  exhaustive sorted multisets over five values up to length 8 and every rotation,
  1,500 seeded cases, maximum-sized boundaries and official examples. Independent
  linear scan oracle, no input mutation. Browser model checked on the same inputs:
  45,340 intermediate transitions preserve the minimum, decrease width, and use
  consistent old bounds/midpoint. Source mirror and bilingual placeholders match.
- `node leetcode/154/tests/browser.cjs`: passed on the running preview. Both
  locales × nine presets, 38 forward states with exact back/forward restoration,
  reset/end/scrub, all prediction choices, reveal/change and language combinations;
  code display, clipboard success, denied clipboard/manual selection, and actual
  download all match solution.py. Storage denial, offline interaction, local
  assets, keyboard, sticky anchors, 48px controls, focus and reduced motion pass.
  Browser recorded zero console/page/HTTP errors.
- Layout: 320, 390, 736 and 1440 CSS px in EN and Chinese have no page overflow.
  Array cells stay at least 102px wide in tested layouts (124px at 320).
  The history table deliberately scrolls at 320, with instructions and keyboard
  focus. 200% CSS zoom reflow and forced colors were also exercised.
- Rendered text contrast sampled from actual computed foreground/background
  pairs: minimum 6.45:1 (excluded values against panel2), exceeding AA. Core
  explanation text is 12.62:1; normal hint text 7.74:1. Disabled primary controls
  use legible muted text on panel, native disabled semantics, and visible borders.
  Keyboard focus is a 3px accent2 outline with 4px offset.
- Total shipped CSS: shared 9,425 + local 1,888 = 11,313 bytes, below 25,000.
  All fonts are system fonts and all runtime assets are local.
- From repository root: `python3 -B scripts/register_leetcode_lesson.py 154
  --validate-only` passed with exit 0, empty stdout/stderr. Recorded separately
  in tests/evidence/preflight.json. This did not register the lesson.

## Screenshot inspection

The author opened the generated screenshots with the image viewer, including
focused EN/Chinese at 320 and 390, both locales at 736 and desktop, both 200%
zoom frames and forced colors. Cells show the original value and index alongside
textual kept/excluded status; the values remain readable, grid rows wrap, and
history contains real old/new bounds. The narrow table scroll is intentional,
not clipped page content. Screenshot capture waits for scroll/paint settling;
a diagnostic capture was removed after the reproducible focused captures passed.
The inspected 200% case uses document CSS zoom, not OS scaling or a claim about
all browser chrome implementations.

Reproduction commands and output-directory overrides are in tests/README.md.
Candidate file hashes and shared dependency hashes are in
 tests/evidence/candidate.json. Independent per-problem review remains pending.
