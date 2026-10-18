# Lesson 10 repair self-check — 2026-10-18

Author evidence only. Candidate is the lesson-local working tree based on
`cdd83c0a108decef2d1b15130acf157c468a4897`; exact candidate hashes are in
[candidate-sha256.json](candidate-sha256.json). No independent acceptance or
finding closure is claimed. Ready for a separate cold re-review of steps 01–02
and their prerequisites, followed by focused source/interaction checks.

## Fix mapping

| Stable finding | Required change and observed repair | Evidence | Status |
| --- | --- | --- | --- |
| 10-DER-01 | Baseline prose now calls its arguments suffixes. In both locales, two explicit routes for `aa / a*a*b` meet at `a / a*b`. Both false branches of the shared question are hand-calculated; failed short-circuit search explains why it is actually visited twice. Saving the pair reuses the answer; a text-only key is rejected with `a/a` versus `a/b`. Step 02 explicitly changes orientation to prefixes, then calculates (1,2), (1,4), (2,4), (2,5) on the same example before the proof and table. | [Python/baseline results](solution-check.json), [browser/model results](browser-check.json), screenshots prefixed `en-` and `zh-` in this directory; source keys `cost`, `overlap*`, `suffixBridge`, `prefixExample` | Fixed awaiting independent review |

The original independent report remains unchanged at
`specs/reviews/10-review-1-2e9bf6f6.md`. Its optional disabled-label observation
is deferred; no shared style was edited.

## Executed checks

From repository root:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 leetcode/10/tests/check_solution.py
NODE_PATH="$NODE_PATH" node leetcode/10/tests/check_browser.cjs
NODE_PATH="$NODE_PATH" node leetcode/10/tests/capture_focus.cjs
node --check leetcode/10/copy.js
git diff --check
```

- Actual canonical Python and displayed recursive baseline agreed with
  `re.fullmatch` on 8,029 binary-text/pattern combinations. Baseline HTML was
  decoded and compared exactly with the executed baseline. Logged recursive
  calls confirmed the two claimed routes really occur in Python's short-circuit
  execution. Six additional worked/fresh/counterexample/maximum checks passed.
  Empty cases are extra boundary checks, not official input claims.
- Actual shared lesson-10 trace model: 8,029 inputs, 173,892 computed-cell oracle
  checks against anchored regex; known dependencies, one changed cell per
  operation, and unchanged inputs. This executes the existing model rather than
  replacing it with a copied recurrence.
- Real Playwright Chromium used NODE_PATH and
  PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. Both EN and zh-CN: four presets with
  expected endpoints true/false/true/false, reversible frames, reset, all three
  predictions and stale-feedback clearing, locale-after-interaction with exact
  snapshot preservation, keyboard range/rewind, and internal link targets.
  Event 17 current (2,4)=T and previous (2,4)=· passed.
- Both locales at 320/390/736/1440 CSS pixels: no page overflow or blank
  dictionary nodes. Captured affected sections at 320/390/1440 and CSS root
  zoom=2 at 1440. Additional settled viewport screenshots and heading geometry
  checks at 320/390 confirm sticky navigation does not cover the step-02
  heading. Some tall element captures include the sticky nav at its capture
  position; `*-viewport.png` files show the settled reading surface.
- Inspected rendered screenshots including English overlap at 390, English
  bridge at 1440, Chinese bridge at 320, and focused Chinese/English narrow
  viewports. The branch routes wrap legibly and added copy has no fixed-height
  clipping. Existing tokens/styles are reused with no new color pairs.
- Exact `solution.py` / `python-code.js` (`PYTHON_SOURCE`) parity, displayed
  source, successful clipboard readback, actual downloaded bytes, and file-URL
  offline source verified. No regeneration was necessary. Served index/copy/
  solution/mirror matched local files. Copy and storage denial remained usable
  in both locales, including the selectable exact-source fallback.
- No lesson console/page/resource errors. The server's unrelated
  `/favicon.ico` 404 is recorded explicitly in `browser-check.json` under
  `ignored`; no service/shared-file repair was attempted.
- All implementation, tests, and evidence writes are confined to `leetcode/10/`.
  No shared assets, registry, reports, rubric, services, or Git settings changed.

## Verification boundary

Python is the faithful preferred official interface, unchanged from the reviewed
candidate; non-Python language-contract/supportedLanguages requirements do not
apply. The exact source/mirror pairs in `scripts/register_leetcode_lesson.py`
were read; the Python pair above was tested. The browser's JavaScript trace is
separate from the executed Python submission. Existing fresh prediction remains
unrevealed until explicitly checked.

This is self-check evidence, not independent teaching acceptance, novice
teach-back, an actual LeetCode submission, or production verification. Zoom
coverage uses CSS layout magnification; browser-menu zoom and real devices were
not exercised. Next action: separate reviewer cold-walks the revised candidate
and decides whether to close 10-DER-01 under the unchanged rubric.
