# Required publication finding 262-PUB-R1: Chinese heading remains English

The diagnostic continuation of the original publication browser gate for release `b1aeec15655d493c88b66eced787cb9f` found the same H1 `#262 · Trips and Users` after both locale selections. The independently reviewed registry supplies Chinese `行程与用户` and English `Trips and Users`. The lesson copy instead stores English in both `title` and `docTitle` slots; its renderer faithfully exposes those values. This is a confirmed localized-copy defect, not a cache or asynchronous-render hypothesis.

Expected: a clear `#262 · 行程与用户` Chinese H1 and localized document title, and `#262 · Trips and Users` English counterparts. Keep the exact official URL. Repair both locales' actual rendered heading/document identity and verify a roundtrip and narrow layout without resetting the teaching interaction. Preserve algorithm, Pandas interface and exact canonical source transfer.

The existing `tests/test_browser.cjs` wrongly treats Chinese H1 containing `Trips` as locale-switch success. Replace that assertion with meaningful localized title/ID checks; retain all existing worked-example, trace, reset and prediction assertions. Preserve original failure evidence, record red then green, rerun relevant tests and non-mutating metadata preflight. Freeze a new candidate for separate complete review; do not edit prior review evidence or acceptance history.

Evidence: [public-title-20261025](262-evidence/public-title-20261025/). The same scan also flagged #502 IPO, whose reviewed title is legitimately identical in both languages; that separate publisher false positive does not excuse #262's missing Chinese title. No publication completion is claimed and no successful release counter advanced.
