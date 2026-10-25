# Frozen #803 Mac compatibility check

Candidate `3960c91f27e095983bfe639fede452427eb5bc62` was exported with 115 files,
including #685/#407 related runtime dependencies. The original snapshot remained
byte-identical throughout the original and adapted diagnostic runs.

## Original tests and platform diagnosis

Metadata preflight passed. Numerical checks passed 11,746 cases against a forward
search/set-difference oracle, 388 actual Python DSU intermediate checks, and maximum
200×200/40,000-hit boundary cases. The browser model passed 49,573 intermediate
frames across the same cases; 95 bilingual pairs were parsed before evaluation.

The unchanged original browser test **failed** on Mac at its hardcoded Linux
`Control+c` fallback step: readback was the unique fresh sentinel, not source.
The immediately preceding focus/full-selection/sentinel checks passed, as did
successful automatic copy. The ranked diagnosis was wrong native shortcut first,
then selection/focus, then permission failure. The latter two predictions conflict
with those already-passing assertions. The application asks for the system copy
shortcut, so it does not instruct Mac users to press Control+C.

A separate external diagnostic snapshot changes exactly two test lines: choose
Meta+C on Darwin (Control+C elsewhere), and report the actual platform/shortcut.
All assertions, runtime, source, test inputs, sentinels and output comparisons
remain identical. The [independent adapter review](803-review-mac-host-adapter-20261025.md)
verified both full manifests and exact hashes. This adapted browser run passed
in 7.015 seconds. It is **not** a claim that the unchanged Linux-host test passed
on Mac, and no frozen candidate was edited to make it pass.

## Bounded compatibility evidence

The adapted run covers both locales and five presets, 38 recorded states,
restore/rewind/replay/reset/end, hand disclosure, prediction changes, locale state,
exact displayed/downloaded/copied source and four real native fallback transfers
(two per locale, each with fresh independently verified non-source sentinel).
Also exercised keyboard focus/scrolling, local deep links, blocked storage/offline
initialization, no observed asset/console errors, and 11,635 CSS bytes.

Inspected the actual English 320px final trace for a hit at an already-fallen
position: reverse bookkeeping retains the original hit order result `[2, 0]`,
shows roof size 2→5, and explicitly excludes the restored brick. S/U labels,
solid/dashed underlines and the restored-cell outline supplement color. The narrow
grid is intentionally scrollable; the Chinese CSS-200% scrolled viewport shows
right-side column labels while captions remain outside the scrolling region.
Tests cover 320/390/736/1440 CSS pixels and CSS zoom 2, not native browser-menu
zoom, real devices, screen readers, or measured learning effectiveness.

All original red evidence, host-adapted code/results, hashes and commands are in
[the evidence directory](803-evidence/mac-preacceptance-20261025/). These are
dispatcher platform checks, separate from the still-running full independent
lesson review. No acceptance, lane import, main registration or publication is
claimed. A changed candidate requires fresh comparison and relevant rechecks.
