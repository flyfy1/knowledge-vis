# Geometry test/repair provenance

Red actual viewport: native maximumH90/u60/v180 gave image bottom342 outside logical330; savedred-max-viewport JSON/PNG. Original UI-only review separately reproduced linear model/native-control Back disagreement and unqualified aperture sharpness. These were application findings.

Initial geometry browser acceptance reached all model/predict/history/forced-reload/pointer checks,then a test selector requested data-i18n=s3hint although the actual element uses data-i18n-html. The30-second locator failure is a fixture mistake,not an app failure; fix the selector without removing the diffraction assertion. Sticky-nav geometry check now queries the actual class rather than assuming an ID. Denied-history fixture explicitly waits for replaceState to be called and rejected before acceptance.

World scale is fixed across edits:logicalheight420 and visible screen36..354 cover all supported imageends,while dimensionlabels are placed below the actual image. This keeps comparison/drag mapping stable and does not predict screen resizing or optical focus.

A real introduced regression was caught next: S3 fixed-scene readout stayed empty. A ground-line text replacement intended forS2 also matched independentrender3,injecting undefinedg. Locale refresh caught/logged the exception,so pageerror-only monitoring missed it. The originalS3 ground draw is restored,there are noS2 references inrender3, and new acceptance records console errors as well. No passing final result is asserted until that rerun.

After restoring S3, all geometry/history/layout assertions completed; strict console collection found one404. A separate probe recorded its exact location as the browser’s optional /favicon.ico,not an application script/style/API. Acceptance records that one known request separately and continues failing all application console/request errors. No missing-file failure is blanket suppressed and no unrelated site icon feature was added.
