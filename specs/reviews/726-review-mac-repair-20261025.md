# LeetCode 726: Mac repair verification for 726-R1

Original candidate: `e8e49a0812e39a33af8585dcc0e78227fc4754c7`.
Repair candidate: `3106c17dd225e92aeea6dfb08cb2e1e630001eaa`.
Evidence: [mac-repair-3106c17-20261025](726-evidence/mac-repair-3106c17-20261025/).

The independent reviewer required correction of baseline `O(n + A*d)` when d means parenthesis nesting depth and may be zero. Canonical output tests do not establish this cost claim. The repair defines n/A/d, states d=0 without parentheses, uses `O(n + A*(d+1))`, explains base-level construction/tallying, and works through `(H2O)3` with d=1 and A=9 in both locales.

The canonical Python, JS core, renderer, CSS, source mirror and original numerical/browser tests are byte-identical to the original candidate. Runtime changes are only the bilingual baselineCost text and its HTML asset cache key. The repaired export contains 184 files, all checked against immutable Git bytes before execution and unchanged afterward.

## Same focused regression, red then green

Read the new `tests/review-r1.cjs` before execution. For the original candidate, compile that exact test externally with its module filename pointing into the preserved original export; no source or assertion is changed. This makes the test use the original app and page, with all output outside the export. On Mac Chromium 151.0.7922.34 it fails as expected: 24 recorded missing/incorrect-bound findings across en/zh and 320/390/1440. Its process exit 1 and JSON failures are preserved in `original-red/`.

The exact same test, run normally from the frozen repair, passes with zero failures and eight focused observations. It executes the displayed baseline on H1000, H100000 and (H2O)3, recording d=0/0/1 and A=1000/100000/9 with correct counts. Peak allocations show materialization but are not used as a timing proof. The source's construction and tally loops explain the unavoidable A work. The checks inspect both actual rendered cost paragraphs and exclude the old expression.

The original numerical and complete browser suites also pass unchanged on the repair: 1,294 canonical cases, 1,280 expansion-oracle cases, 15,780 intermediate frames, full bilingual trace/prediction/history behavior and actual Mac source transfer. The focused regression additionally checks inner merge event `O: 1 + 3 × 2 = 7`, retained history, independent prediction scope and CSS zoom. All outputs are under `repair/`.

Actually inspected `repair/baseline-en-320.png` and `baseline-zh-320.png`: the corrected formula, explicit zero-depth definition, base-level work and nested example are readable, with ordinary wrapping and no label/value collision. This is Mac responsive/CSS-layout evidence, not physical-device or native browser zoom coverage.

Root host checks support this exact repair. Independent closure of 726-R1 belongs to the separate reviewer of 3106c17; this receipt does not itself accept or publish the lesson. Original review, failed regression and prior candidate evidence remain preserved.
