# Lesson 30 revision self-check — 2026-10-18

Author self-check only. Candidate ready for a **separate independent re-review**;
no finding is independently closed or accepted here. Exact candidate file hashes
and base HEAD are frozen in [candidate-manifest.json](candidate-manifest.json).
No commit, registration, campaign-state change or publication was performed.
The prior report and its changes-required result remain historical evidence.

## Fix mapping

| Stable finding | Change | Observed verification | Disposition |
| --- | --- | --- | --- |
| 30-R1-F01 | Added lesson-local `lesson-entry.json`, matching ID, URL, Python language, bilingual fields and existing step anchors. Complexity is exactly one nonempty string: `O(Lw + kw) expected time; O(kw) auxiliary space plus output (L text characters, k words, w word width)`. | Before editing, required preflight exited 2 for missing file. After editing, same preflight exited 0. | Fixed awaiting independent re-review |
| 30-R1-F02 | Replaced both locales' operation-position claim with a definition of the frame's retained `[left, right)` window; described removed words, empty reset, before/after timing and count rows. | Focused legend regression failed before editing, passed after. Real Chromium verified highlights against frame boundaries for add, excess shrink, overlap removal and unknown reset, including previous states. Event 7 retains indices 6/7/8, with left=6, displayed right=9, used=1, foo:1. Removed indices 3/4/5 are unhighlighted. | Fixed awaiting independent re-review |

The review's minor teaching observations also informed concrete width-three
track examples, reuse of the middle foo, Counter's missing-key-zero behavior,
the three coupled removal updates at event 6→7, and the arithmetic
`w × (L/w) = L` followed by Python's O(w) string cost. The original hand
calculation, membership counterexample and fresh predict-before-reveal case
remain in the lesson. This is no forecast of an independent rubric score.

## Commands and results

All commands ran from `/home/songyy/projects/leetcode-hard-campaign-20261018`.
Browser packages resolved through the supplied NODE_PATH. Chromium launch used
the supplied PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.

| Command | Result |
| --- | --- |
| `node leetcode/30/tests/legend.cjs` | Before fix: exit 1, legend lacks `[left, right)`. After fix: exit 0, bilingual retained-window definition passes. |
| `python3 -B leetcode/30/tests/solution_check.py` | Exit 0: 3,013 canonical Python cases, including 3,000 seeded oracle comparisons, all official examples, fresh duplicate-quota case `[0,2]`, multi-removal counterexample `[]`, width-one boundaries and maximum-size cases. Word-list input unchanged; exact offline mirror parity. |
| `node leetcode/30/tests/trace.cjs` | Exit 0: 507 inputs / 10,314 frames; actual substring counts, used, alignment, retained indices and recorded answers checked. All 773 temporary-excess frames are followed by another shrink. Initial snapshots remain empty. |
| `node leetcode/30/tests/browser.cjs` | Exit 0: EN and zh checks in [browser-results.json](browser-results.json). Add/shrink/overlap/reset and previous-state comparisons at 320/390/1280; zoom, keyboard, all four preset endpoints, replay/reset, all prediction choices, locale preservation, clipboard success/failure, actual download parity, offline display and denied storage. No page errors or HTTP failures observed. |
| `node leetcode/30/tests/layout.cjs` | Exit 0: both locales, extra transition checks at 736/1440; actual step-navigation clicks clear sticky navigation at 320/1280; all ten loaded runtime/source files match served bytes to checkout. See [additional-widths.json](additional-widths.json). |
| `python3 -B scripts/register_leetcode_lesson.py 30 --validate-only` | **Exit 0**, no output. Run from repository root after final lesson edits; safe validation only. No registration invoked. |
| `git diff --check` | Exit 0. Final worktree changes are limited to `leetcode/30/`. |

The multi-removal code check uses `s="abacacad"`, words `[ab,ac,ad]`.
After ab/ac/ac, removing ab leaves ac:2, still over quota. A second removal
is necessary. Both canonical Python and the trace return `[]`. The duplicate
case `abacabab` / `[ab,ac,ab]` returns `[0,2]`. These are code checks; the UI
continues to offer four presets.

## Language and source contract

Canonical source remains faithful Python
`Solution.findSubstring(self, s: str, words: List[str]) -> List[int]`.
Read the exact `LANGUAGE_FILES` pairs in `scripts/register_leetcode_lesson.py`:
Python is `solution.py` / `python-code.js` / `PYTHON_SOURCE`. This lesson has
no non-Python language contract or supportedLanguages exclusion; preferred
Python is already selected, so no fallback evidence is needed. The source and
mirror required no regeneration because their bytes are unchanged and equal.
Canonical Python was actually executed, separately from the JavaScript trace.

Both locales' displayed full source, embedded constant, successful clipboard
readback, actual downloaded stream, denied-clipboard textarea and offline code
display equal canonical `solution.py` exactly, including final newlines.
All loaded runtime/source responses match checkout bytes. Shared files were
only read and tested; no shared controls, model or styles were edited.

## Browser and visual observations

Opened and inspected `en-320-shrink.png`, `zh-390-shrink.png`,
`en-1280-shrink.png`, both `*-zoom200-shrink.png`, `en-320-step1.png`,
`zh-1280-step4.png`, and the viewport captures `en-320-step1-viewport.png`,
`zh-320-step4-viewport.png`, `en-1280-step4-viewport.png`.
Retained foo characters 6–8 have both fill and underline; removed foo 3–5 has
neither. Character indices and count rows remain readable when wrapped. The
legend distinguishes counts from highlighting in both languages. New prose
and mapping table wrap at 320 without clipping or document overflow.

Tall element screenshots contain the existing sticky navigation at a
capture-dependent position; viewport screenshots and explicit heading geometry
checks confirm actual deep-linked headings clear it. Zoom evidence uses 200%
CSS zoom at 1280×900, not native browser-menu zoom. No CSS tokens changed;
the review's existing normal-text contrast measurement still applies to these
same colors. Optional dim disabled styling remains deferred as recorded in the
BRIEF. No real device, novice comprehension, live LeetCode submission or public
delivery verification is claimed.

Next action: independent reviewer checks the frozen candidate against
30-R1-F01 and 30-R1-F02 and the affected teaching steps. The original review
alone cannot accept this changed candidate.
