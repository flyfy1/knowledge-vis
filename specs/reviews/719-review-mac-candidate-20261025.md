# LeetCode 719: frozen candidate Mac verification

Candidate: `6b5b115a77be22ec028bb53f83883988b033c94b`. This is root-agent host verification, separate from the independent reviewer and publication. Evidence: [mac-candidate-6b5b115-20261025](719-evidence/mac-candidate-6b5b115-20261025/).

The export includes 174 files: the candidate's lesson, shared collection files, and related lesson HTML targets. Every byte matched `git show` before execution, and all hashes remained unchanged afterward. Outputs and temporary browser profiles were outside the frozen export. Browser: macOS Chromium 151.0.7922.34, full Chrome for Testing executable recorded in receipts.

## Original execution and isolated host failure

The unchanged Python suite passed 86,077 canonical calls, exhaustive ordered arrays and ranks, seeded and maximum-size cases, input preservation, 92 duplicate-checked copy keys, and exact source mirror. The unchanged core suite passed 19,388 threshold scans and 73,424 traces.

The original browser suite failed at its first screenshot: `Page.captureScreenshot` with `fromSurface:false` returned `Unable to capture screenshot`. Its earlier English interaction and source-transfer assertions passed, but this original run did not complete. Its log and `browser-failure.json` are retained under `original/`.

Ranked hypotheses before testing were: unsupported Mac headless capture mode; lesson-specific content; premature capture. A short blank-page and frozen-lesson control, after two animation frames, executed false/true/false surface capture on each. Both false attempts failed on each page; true passed on each. This isolates the screenshot parameter as the operational cause in this browser environment, rather than a lesson-only rendering defect or the tested frame timing. It does not identify Chromium internals or claim all versions behave alike.

The archived adapter compiles the original test in its original module location and changes only the single `fromSurface:false` literal to `fromSurface:true`. It retains every assertion and leaves candidate files untouched. The adapted complete run passed: 70 search states, 68 experiment/prediction/source checks, 10 layout records, 43 screenshots, zero runtime/resource errors, and 11,010 CSS bytes. Native tab zoom used the original temporary extension: zoom 2, innerWidth 720, outerWidth 1440, DPR 2. This is real browser tab zoom, not CSS zoom.

## Focused native supplement and visual inspection

The supplement checked every preset in both locales at 320 and 390 pixels (28 selected-label measurements), including the actual closed native control and a 24-pixel arrow reserve. It captured the longest option in each locale/width. Actual screenshots show the full `[0,1000000] · k=1` label and arrow at 320 pixels. For each locale it read a distinct non-source clipboard sentinel back both before opening fallback and immediately before Meta+C, verified complete focused selection, then read back all 514 exact canonical source characters after the real shortcut.

Visually inspected: `adapted/en-320-search.png`, `zh-320-count.png`, `en-zoom200-search.png`, `zh-320-header.png`, and both `native/*-320-longest-native-select.png`. The inspected partial ledger shows d=2, 3/4 completed right endpoints, contributions 0/1/2 and total 3; its text explicitly says this is not yet complete C(d). The header clearly displays #719 and an official problem link. Native preset labels are readable. The sticky navigation and deliberate internal history scrolling are not evidence of whole-page overflow.

This receipt supplements the independent 95/100 acceptance of the same candidate. It does not claim the original Mac browser script passed unadapted, public deployment, a judge submission, physical-device coverage, or human learning outcomes. No required runtime fix was identified by these Mac checks.
