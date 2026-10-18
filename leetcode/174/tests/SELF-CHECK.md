# #174 author self-check — candidate 1

2026-10-18. Status: authored and self-checked; ready for a separate independent
review. This report supplies no independent acceptance, novice results, public
release verification, or accepted LeetCode submission. Ownership stayed inside
leetcode/174/; shared assets and registry were not edited. No agents spawned.

Official contract: `evidence/official.json`, captured from public LeetCode GraphQL,
includes the actual Python3 selector stub and statement. Canonical interface:
`Solution.calculateMinimumHP(self, dungeon: list[list[int]]) -> int`.
Python follows the preferred supported-language policy. The authored Chinese
lesson title is a translation; English title and official URL match the catalog.

## Executed checks

- `python3 -B leetcode/174/tests/check.py`: PASS, 2,100 canonical + baseline +
  direct-survival oracle cases and five closed-form maximum-size boundaries.
  All-positive, zero, negative, one row/column, nonmutation, positive integer
  return, source-mirror bytes, fresh prediction and both official examples.
- `node leetcode/174/tests/trace.cjs`: PASS, 2,100 fixtures and 14,672 snapshots.
  Every completed cell agrees with an independently derived suffix oracle;
  dependencies, initial unknowns, exact operation count and deep snapshot isolation.
- `NODE_PATH="$NODE_PATH" node leetcode/174/tests/browser.cjs`: PASS on actual
  headless Chromium at the already-running preview. Both languages, eight presets,
  56 forward/back/forward transitions, both endpoints, reset/end/scrub, death before
  later healing, every prediction option, reveal/change, cross-locale state and
  open-code preservation, real clipboard success and injected denial fallback,
  selected manual source, exact embedded/displayed/downloaded source parity,
  source display with solution.py requests blocked, keyboard Enter/Space and focus,
  blocked localStorage, all related deep targets, sticky target geometry, forced
  colors and reduced motion. Zero console/page/asset errors; local requests only.
- Widths 320/390/736/1440 in both languages; effective 200% CSS zoom at 640px
  viewport. Checked document overflow and per-cell content geometry. This is
  browser layout/zoom simulation; physical devices and browser UI zoom untested.
- `python3 -B scripts/register_leetcode_lesson.py 174 --validate-only` from the
  repository root: PASS (exit 0, no stdout/stderr). Exact record in
  `evidence/preflight.json`. No registration operation performed.

## Visual inspection and accessibility

Viewed the actual screenshots with the image-view tool: populated English 320px,
English desktop, Chinese 200% zoom, both locale headers, hand-calculation and
revealed-prediction sections, plus the 10-state contact sheet of all trace widths
and zoom captures. Controls wrap into rows; coordinates remain associated with
values; unknown versus computed versus current have text markers. Two-digit
N=11 stays on one line after the local fix. English pending status can wrap at
200% zoom, with the number and cell association retained. The orange border marks
current activity without replacing any data. Sticky nav is a horizontally
scrollable step list. Screenshot captures can naturally show the sticky nav over
content at the capture scroll position; a settled deep-target geometry assertion
also passed. No clipped numeric values or overlapping adjacent labels observed.

Measured actual rendered foreground/background contrast: body 16.09:1,
muted/disabled controls 7.08:1, pending cell text 6.45:1, primary button 13.10:1,
focus orange against panel 9.81:1. Native enabled/disabled semantics retained,
48px controls, visible 3px keyboard outlines. Shared + local CSS: 11,372 bytes.
Full raw ratios and colors are in `evidence/browser.json`.

The full table is explicitly a separate JS simulation, not execution of Python.
Its snapshot memory is disclosed separately from the submission’s O(n) space.
The numerical Python execution and browser simulation are checked separately.

## Reproduction and remaining gates

See README.md. All test programs accept OUTPUT_DIR so reruns can preserve this
candidate. `evidence/candidate-sha256.json` freezes author files and test sources;
reviewers should identify their own run and candidate separately. Independent
cold walkthrough/six-dimension scoring and public delivery remain pending with
the dispatcher. Nothing here claims independent acceptance.
