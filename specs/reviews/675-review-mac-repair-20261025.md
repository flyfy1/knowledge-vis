# Native Mac repair evidence for 675-R1-01

Repaired candidate: `7dec91fc5955f310f1b864e65af2d8be3b0bccfe`.
Original candidate: `c2e54cf8211dc0ca8ccff212e4863ecee2a8dd04`.
Date: 2026-10-25. Dispatcher evidence for independent adjudication after the
required cold walkthrough; no acceptance decision is made here.

The independent review and the [original Mac report](675-review-mac-candidate-20261025.md)
found incomplete selected labels at 320px, including missing move-count units.
The repair adds lesson-local `#preset{width:100%;field-sizing:content}` and updates
the style asset URL. Existing normal whitespace permits wrapping; the control
now grows vertically. Labels, algorithms, canonical source and interaction code
remain unchanged. No shared runtime or policy was changed.

## Preserve the original failure and prove the changed layout

The original dispatcher probe was rerun unchanged on the repaired candidate.
It still fails the same three English single-line width comparisons: the text
is unchanged and wider than the content area. **It is not reported as green.**
That necessary-fit calculation applies to a single line and does not decide
whether the now-multiline closed control clips. The original red case, unchanged
probe, repaired result and selected-control screenshots remain available.

A separate identical probe was therefore run against both immutable candidates
to check the layout's changed dimension. Ignoring native-arrow space, text needs
at least `ceil(textWidth/contentWidth)` lines. The content height must accommodate
at least that many font-size units; it also checks scroll bounds and selection
after a locale roundtrip. This is a conservative height lower bound, not a claim
to reconstruct native text rendering or prove arrow clearance by arithmetic.
It fails 15 of 24 original-candidate observations and passes all 24 repaired
observations (three affected presets × two widths × two zoom levels × two locales).
The unchanged test, both receipts and both outputs are archived.

The author's original focused test passes 48 observations, and the original
full browser and focused visual suites pass without adapters. Their checks
include bilingual traces, rewind/reset, predictions, exact source transfer,
sentinel-seeded actual Meta+C, keyboard focus, contrast and local asset behavior.
The focused test's `fieldSizing === 'content'` shortcut alone does not prove
readable wrapping; the independent height probe and visual inspection supply
the additional evidence. Numerical algorithms were not rerun because their
source is byte-identical and the earlier candidate's oracle evidence is retained.

## Visual inspection and boundaries

On native Mac Chromium 151.0.7922.34 at 320px, inspected the detour, official
unreachable and multiple-leg closed controls. Their full descriptions are visible;
`10 moves` and `9 moves` retain their units on the next line. The controls have
grown from the original clipped single-line height to 64px, without losing the
native arrow. Inspected English multiple-leg and Chinese unreachable controls
at 200% CSS zoom too: text wraps across more lines and stays visible. At that
extreme width English words can break across lines; no clipping is hidden by
claiming a single-line fit. This evidence covers this Chromium host, not every
browser's support for `field-sizing`, physical devices or browser-chrome zoom.

The repaired archive's 255 selected tracked files matched immutable Git bytes
before/after the checks. The unchanged original archive was separately verified.
Outputs were external and original assertions were preserved. Independent review
must assess the full candidate and decide whether 675-R1-01 closes. Public
delivery, online judge acceptance and human-learning results remain unverified.

Evidence: [native repair records](675-evidence/mac-repair-7dec91f-20261025/).
The receipt intentionally retains the original single-line probe's nonzero exit
alongside passing focused/browser checks; the wrapper continues independent
checks and must not be interpreted as an all-green exit. `original-wrap-reproduction`
contains the red multiline-height result, and the same script's repaired output
is in `leetcode-675-wrap-height-probe-20261025`. All evidence has SHA-256 hashes.
