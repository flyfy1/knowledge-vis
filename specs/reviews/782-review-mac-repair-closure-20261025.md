# Independent supplemental review: #782 Mac repair evidence

Date: 2026-10-25. Exact repaired candidate:
`efa6a0356f63e851c594c346dd2ec07b644655e7`.
Finding: **782-MAC-FIT-01**.

**Verdict: the supplied evidence is sufficient to close the affected-Mac
regression against this candidate.** This is an independent review of the new
Mac execution evidence and inspected screenshots, not a replacement whole-lesson
review or an acceptance-state mutation. The normal fix/review runner should
receive the archived evidence and adjudicate closure. Historical reports remain
unchanged; no publication success is established here.

## Prior finding and review boundary

I read the original [Mac diagnosis](782-review-mac-fit-diagnosis-20261025.md) and
the central independent report `782-review-2-4f9587dd.md` through a read-only fetch.
That report reviews this exact candidate, scores 93.75/100, and returns
`changes_required` solely because 782-MAC-FIT-01 lacks actual repaired-candidate
Mac evidence. It identifies no additional required mathematical, interaction or
translation issue. Its passing Linux result and the earlier temporary DOM probe
correctly did not establish Mac closure.

The current source diff changes only the English preset-4 label to
`Four-corner failure: −1` and the copy asset's cache reference among runtime files.
Canonical Python, mirror, renderer, numerical core and CSS are unchanged. The
four original tests `browser.cjs`, `focused.cjs`, `check.py` and `core.cjs` are
byte-identical to the original failing candidate's versions. A new targeted
selected-label regression supplements them; it does not relax the original
20px-reserve predicate.

## Candidate identity and executed checks

Inspected `/tmp/check-782-repaired-mac-20261025.py`: it serves the frozen export
on localhost, launches the installed local Mac Chromium, redirects test outputs
outside the export, records command exits and compares before/after file hashes.
Its receipt reports 189 files, with no changes or additions. Independently checked
every one of those 189 current files against both the before-manifest hashes and
immutable Git bytes at efa6a035: all match. This is the actual repaired source,
not a DOM override or modified test adapter.

`/tmp/leetcode-782-repaired-mac-20261025/checks.json` records exit 0 for all six:
metadata preflight, canonical Python check, numerical core check, original browser
suite, focused browser check and new selected-label check. The original browser
suite completed in 9.416 seconds, including checks beyond its former failure.
Recorded numerical coverage is 704 canonical cases and 3,291 simulation frames.
The original browser result includes both locales, all presets and trace replay,
prediction/state retention, exact source transfer, actual native fallback copy,
responsive layout, keyboard/focus and no asset/console errors. Those are inspected
execution records; this reviewer did not rerun the tests or use the clipboard.

## Actual Mac geometry and visible closure

`782/selected-label.json` identifies host `darwin`, Chromium **151.0.7922.34** and
status `passed`. Its 21 measurements cover all seven presets at 320px through
EN→ZH→EN. The repaired English label measures **175.350px** against the unchanged
**210px** budget: control 260px, combined padding 30px, arrow allowance 20px.
Spare width is **34.650px**, compared with the old 219.574px text that failed and
hid the complete `−1` result. Font size and CSS stack remain unchanged.

Actually inspected these four new Mac screenshots:

- `782/failure-label-en-320.png`: complete `Four-corner failure: −1` and arrow.
- `782/failure-label-zh-320.png`: complete Chinese failure label, `−1` and arrow.
- `782/selected-label-en-320.png`: complete official example 3 label/result.
- `782/selected-label-zh-320.png`: complete corresponding Chinese label/result.

The narrowest remaining passing measured margin is English preset 3 at 2.053px;
its separate screenshot is complete in this environment. No universal font or
arrow guarantee follows. The targeted test also asserts the exact approved new
wording and the terminal impossible result, retaining semantic scope alongside
geometry. The original failure evidence remains valid history, not overwritten.

## Handoff and limitations

Evidence currently inspected under `/tmp/leetcode-782-repaired-mac-20261025`, with
the before manifest `/tmp/leetcode-782-repaired-candidate-before.json` and runner
`/tmp/check-782-repaired-mac-20261025.py`. Archive these exact records/screenshots
with this report for the normal review handoff; preserve their candidate identity
and the old red reproduction. The supplementary conclusion closes the missing
affected-host evidence obligation only; campaign acceptance and release accounting
still follow their established review/publication gates.

This covers native Mac Chromium with responsive viewport/CSS zoom checks, not a
physical phone, native browser-menu zoom, successful judge submission or public
delivery. Only this report was written. No source, frozen evidence, Pi/campaign
state, score, acceptance, commit or deployment was changed.
