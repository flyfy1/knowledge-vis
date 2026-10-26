# 903-COPY-R1 · author self-check · 2026-10-26

New candidate: fixed awaiting independent review. Candidate identity is the
per-file SHA-256 manifest `candidate-hashes.json`; previous candidate identity is
`26f8fd8ec1e79a233779b82a4c8ee3d63edaee17`. No commit, registration, release,
historical acceptance change or independent closure was performed.

## Mapping

903-COPY-R1: removed the complete `<footer class="site-foot" data-i18n="foot">`
element and the unused two-language `foot` key. A source binding inventory found
no other consumer. `copy.js` receives the local `?v=903-copy-r1` cache version.
Exact old/new bilingual diff is `runtime.diff`. `before-hashes.json` records
historical identity; `candidate-hashes.json` records before/after hashes.
The five protected algorithm/source/style files are unchanged, as is metadata.
All other localization pairs are compared verbatim to the historical version.

Before repair, the actual supplied preview rendered:
“Author candidate · bilingual interaction and complete small simulations · independent review pending”.
The browser probe reported `903-COPY-R1 baseline: FAIL workflow footer still rendered`.
After repair the regression rejects the `foot` key, footer DOM, old workflow
wording and replacement acceptance wording. It also checks every remaining bound
translation, so a missing-key fallback or unintended neighboring-copy change
cannot pass merely because the page remains nonempty. Acorn checks duplicate
keys before evaluation.

## Commands and observations

From repository root:

- `node leetcode/903/tests/copy-r1.cjs` — PASS. Actual preview
  `http://127.0.0.1:18770/leetcode/903/`, Chromium, Linux host. Structured output:
  `browser-results.json`. No page, console or HTTP errors.
- `python3 -B scripts/register_leetcode_lesson.py 903 --validate-only` — PASS,
  exit 0, no output (`preflight.txt` is intentionally empty). Non-mutating gate;
  no registration. Complexity is already one time-and-space string.
- Executed `solution.py` via Python `exec` and called
  `Solution().numPermsDISequence(s)`: DID=5, D=1, DI=2, fresh IID=3, I×200=1,
  D×200=1 all passed. IID hand oracle: ascending first three values, last value
  may be 0, 1 or 2, giving three orders; last 3 would fail the final D.
  No broad numerical suite rerun for this prose deletion.

Saved official GraphQL evidence `../../../provenance/official.json` has the
faithful Python3 signature `Solution.numPermsDISequence(self, s: str) -> int`.
Canonical Python remains the preferred language. No non-Python contract or
supportedLanguages omission applies. Read registration policy's exact source
pair: `solution.py` / `python-code.js` / `PYTHON_SOURCE`.

## Rendered-state and transfer regressions

The test operates zh→en→zh after reaching DI frame 4/5, current j=1. The
current cell remains →1, source k=0 remains *1, addition is nxt[1]=1=1,
progress is 4/5 computed cells and 2/2 comparisons processed. Formula includes
0≤k<j, j≤k<m and 0≤j≤m in both locales. These are cell/row progress units,
not submission runtime or a cumulative comparison-work metric. Rewind/replay
restores the same numeric cells and markers; final frame yields two orders.

The independent II+D, j=1 quiz retains selected 1 and revealed explanation
0+1=1 through locale switches. Changing to 0 hides the stale explanation.
Its scope remains independent of the trace preset.

`sim`, `costs` and `verification` remain verbatim in both locales. Thus one-cell
frames, display order versus Python D accumulation order, exact small counts,
length-four presets and O(n⁴) simulator versus O(n²)/O(n) submission bounds
remain intact. The contextual verification paragraph is preserved as requested.

Canonical source, decoded offline mirror, DOM textContent, automatic clipboard,
manual fallback transfer and downloaded bytes match exactly, including final
newline. Each locale's fallback first writes and verifies a unique non-source
sentinel, then forces only automatic writes to fail, checks full selection/focus,
presses Linux Control+C, and reads the actual clipboard. Download artifacts are
`download-zh.py` and `download-en.py`.

## Page-end and keyboard inspection

Four screenshots: `zh-320-zoom1-page-end.png`, `en-320-zoom1-page-end.png`,
`zh-1280-zoom2-page-end.png`, `en-1280-zoom2-page-end.png`.
Inspected all four: readable verification text and continuation links; links
wrap at narrow width; no footer, acceptance badge or reserved footer gap.
200% uses CSS zoom in a real browser at 1280×900. Script waits for actual page
bottom before capture (an initial screenshot attempt caught unsettled scrolling
and was replaced). Geometry verifies the last link is visible, main ends at the
viewport bottom and body has no extra footer area. No page overflow.

Copy, source disclosure and both neighboring links remain keyboard focusable,
with the existing 3px focus outline. Existing design/tokens are unchanged.
Real devices, novice comprehension, public delivery and independent acceptance
are unverified. A separate reviewer must close 903-COPY-R1 against these exact
candidate hashes; these checks do not independently accept it.
