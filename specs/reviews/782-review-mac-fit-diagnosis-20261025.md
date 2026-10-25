# Independent Mac diagnosis: #782 selected failure label

Date: 2026-10-25. Frozen candidate:
`0e53a2131353accc11a5ef746c5eba164efb14e4`.
Snapshot: `/tmp/leetcode-782-candidate-20261025`.
Evidence: [mac-fit-diagnosis-20261025](782-evidence/mac-fit-diagnosis-20261025/).

**Confirmed: English preset 4 fails the original width predicate and its closed
native control does not display the complete result `−1` at 320px on this Mac.**
The captured first line ends after `Four-corner check fails ·`; only a fragment
appears below it. The visible result is incomplete, not merely a conservative
numeric failure as in the earlier #765 case. No inference about other platforms
or the exact native clipping/wrapping implementation is needed for this finding.

## Reproduction and hypothesis tests

The focused baseline reproduces the original predicate unchanged:
`textWidth + paddingLeft + paddingRight + 20 <= clientWidth`.
It ran against the real frozen page in Mac Chromium 151.0.7922.34, checked all
seven presets in both locales at 320px, and exited 1 in approximately 1.13 seconds.
Only English preset 4 fails. Measurements and all fourteen original selected-control
screenshots are archived; the original full-browser failure log is retained.

Before differential probes, `hypotheses.md` ranked actual text-budget overflow,
overconservative reserve, incorrect font measurement and stale locale rendering.
The interventions changed one variable at a time and only changed temporary DOM.

| Case | Canvas text width | Original budget | Observation |
| --- | ---: | ---: | --- |
| Original English preset 4 at 320px | 219.574px | 210px | Fails; full `−1` not visible |
| EN→ZH→EN, unchanged copy/style | 219.574px | 210px | Same failure and rendering |
| `Four-corner failure · −1`, label only | 184.774px | 210px | Pass; complete label and arrow |
| `Four-corner failure: −1`, label only | 175.350px | 210px | Pass; complete label and arrow |
| Original label at 390px | 219.574px | 280px | Pass; complete label and arrow |

The control is 260px wide with 15px horizontal padding on each side at 320px.
The existing font is 16px PingFang SC / Microsoft YaHei / system-ui / sans-serif;
the exact resolved font is unverified. A DOM span using the same computed font
measures 219.578px, within 0.005px of canvas. Thus the numerical text measurement
is credible. The roundtrip does not remove the failure. Wider space or shorter
equivalent text restores complete rendering without touching the 20px allowance.

All other original labels satisfy the predicate. The narrowest passing margin is
English preset 3, approximately 2.053px; its inspected screenshot displays the full
`Official 3 · 2×2, answer −1` and arrow. This measurement is evidence of the tested
environment, not a guarantee for every font installation.

## Smallest proposed repair

Change only English preset 4 to **`Four-corner failure: −1`**. This is the shorter
of the tested semantically equivalent labels: it retains the four-corner check's
failure category and impossible-result value, with approximately 34.65px spare
under the unchanged predicate. Keep Chinese meaning, preset identity, font,
padding, algorithm and original assertions. The middle-dot variant also works,
with approximately 25.23px spare, if consistency of separators is preferred.

This is a diagnostic DOM proposal, not an implemented or accepted repair. Let the
current frozen independent review finish unchanged. If the dispatcher selects the
repair, create a new candidate, rerun the original Mac browser suite and relevant
tests, inspect every preset/both locales and roundtrip at narrow widths, and obtain
fresh separate closure. A focused test passing elsewhere does not waive the failed
full-browser check. No score, acceptance, campaign state or publication changed.

## Commands and immutable evidence

Served the snapshot with `python3 -m http.server 18792 --bind 127.0.0.1
--directory /tmp/leetcode-782-candidate-20261025`. With installed Playwright via
`NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules`,
ran `/tmp/leetcode-782-fit-baseline-20261025.cjs` (exit 1) and
`/tmp/leetcode-782-fit-probes-20261025.cjs` (exit 0, records both red and green
diagnostic cases). Exact scripts are archived alongside JSON and screenshots.

After the probes, `candidate-receipt.json` verifies all 132 exported files against
the exact candidate's Git bytes; every file matches. The local server is stopped.
No clipboard access, frozen-file modification, Pi action, commit or deployment
occurred. Only this report, its evidence and temporary probe scripts were written.
