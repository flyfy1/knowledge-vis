# Independent diagnosis: #765 conservative native-select fit failure

Date: 2026-10-25. Accepted candidate:
`7ec592bddf5642212cdcb3363510982354da780e`; supplied frozen snapshot `81bee47`
at `/tmp/leetcode-765-778-candidate-20261025`. Followed the diagnosing-bugs and
website-design skills. Evidence: [diagnosis directory](765-mac-fit-diagnosis-20261025/).

**Confirmed: the original numerical width-budget assertion fails on Mac, but the
observed selected label is not clipped.** The original screenshot displays the
complete `8 people · counterexample` and its native arrow. Do not describe this
as an established product-clipping defect or a wrong-font measurement. The
existing 24px reserve yields a conservative budget for this rendered control.
The original browser suite remains failed; this diagnosis does not waive it.

## Red-capable loop and hypotheses

The original `test_browser.cjs:63` failure is retained as
`original-browser-failure.log`. A focused actual-browser loop reproduced the
same assertion in under a second, exiting 1. At 320px it checked all five presets
in both languages; only English preset 3 failed. Before differential tests,
`hypotheses.md` ranked: genuine tight text/padding budget; conservative arrow
allowance; incorrect canvas font; stale locale rendering. Temporary interventions
changed one variable at a time and never wrote into the snapshot.

Mac Chromium 151.0.7922.34, 320px viewport:

| Probe | Text width | Original 24px-reserve budget | Result |
| --- | ---: | ---: | --- |
| Original label, 15px padding each side | 209.440px | 206px | Assertion fails; full label visible |
| EN→ZH→EN | 209.440px | 206px | Same failure and visible result |
| Padding only: 12px each side | 209.440px | 212px | Pass |
| Label only: `8 people: counterexample` | 200.016px | 206px | Pass; 5.984px remaining |
| Width only: 390px viewport | 209.440px | 276px | Pass |
| Deliberately overlong label with ` demonstration` | 326.304px | 206px | Fails and visibly clips |

The original control client width is 260px. Font is 16px with the existing
PingFang SC / Microsoft YaHei / system-ui / sans-serif stack. A DOM span using
the computed text styles measures 209.453px, agreeing with canvas to 0.014px.
Thus the font measurement is credible; the precise resolved font was not
identified. The unchanged roundtrip rejects stale locale state as the explanation.
The overlong positive control visibly loses the appended word, confirming that
the screenshot path can expose actual native clipping. These tests do not derive
a universal native-arrow width or justify replacing 24 with 16 in the assertion.

Inspected original, roundtrip, padding-only, concise-label and positive-control
select screenshots. The proposed colon label remains complete with the arrow,
preserving both eight-person scope and counterexample purpose. All probe results,
screenshots, scripts and the original failed log remain in the evidence directory.

## Smallest proposed repair and closure boundary

Prefer the English label-only change `8 people: counterexample`, retaining the
24px assertion, font, padding, Chinese meaning, preset identity and algorithm.
This passes the unchanged focused predicate with approximately 5.98px spare width
in the tested Mac environment. It is a prospective margin improvement, not a
claim that the old label visibly clipped. No implementation change was made.

If adopted, create a new candidate, retain the original red case, run the unchanged
full browser suite and applicable regression checks, inspect both locales/all
presets at narrow widths and locale roundtrip, and obtain separate review. A
temporary DOM experiment does not establish repaired source, full-suite success,
lesson acceptance or publication. Other original-suite checks after line 63 remain
outside this diagnosis. No acceptance, scores, release counters or Pi state changed.

## Reproduction and immutable receipt

Serve the frozen directory with `python3 -m http.server 18865 --bind 127.0.0.1
--directory /tmp/leetcode-765-778-candidate-20261025`. With
`NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules`,
run `node /tmp/leetcode-765-fit-diagnosis-20261025.cjs` (exit 1) and
`node /tmp/leetcode-765-fit-probes-20261025.cjs` (exit 0; records include the
original failure and green diagnostic variants). Exact script copies are archived
as `baseline-probe.cjs` and `differential-probe.cjs`. Initial sandboxed server/browser
launches were denied by OS restrictions; the same commands ran with authorized
tool escalation. No browser installation or clipboard operation was needed.

`candidate-receipt.json` compares every exported #765 file byte-for-byte with the
accepted Git candidate after the probes. All match. The diagnostic HTTP server
served only that frozen snapshot. This is native Mac Chromium with an emulated
viewport, not a physical-phone, public-delivery or full independent teaching review.
