# Native Mac repair evidence for 679-R1

Repaired candidate: `bc79795d3b2b0b151533594f9f3b95af2d64f526`.
Original red candidate: `c368c0b018d41763af8de9d6ac36a323900bb4a3`.
Date: 2026-10-25. Dispatcher evidence for independent adjudication, not an
acceptance decision. Read this after the required cold walkthrough.

The original English label clipped at 320px on both the independent review's
Pi and the dispatcher's Mac. The Mac red probe and screenshot are preserved in
[the first-candidate report](679-review-mac-candidate-20261025.md). Its text was
261.776px wide in a 230px content budget, before reserving arrow space.

The repair changes only the English label to `[1,5,5,5] · intermediate < 1` and
updates its copy-asset URL. Algorithm, canonical Python, trace code, application
logic and styles are byte-identical to the original candidate. It also adds
focused regression tests, documentation and author evidence. No shared policy
or runtime changed.

On Mac Chromium 151.0.7922.34, the **unchanged original dispatcher probe** now
passes all 20 selected-label observations at 320/390px in both locales. Its hash
matches the archived red probe. The repaired English text measures 205.104px;
the content budget remains 230px. The author's unchanged focused label test also
passes all eight observations, including locale roundtrips, with its stricter
214px budget (16px arrow reservation for that recorded control). The recorded CSS
font stack does not establish a uniquely resolved font.

Inspected the closed English control at 320px and both English and Chinese
320px locale-roundtrip screenshots: the entire description is visible, including
`< 1`, with clear separation from the native arrow. The numerical check alone is
not used as proof of arrow clearance. The separate rendered-contract check
passes in both locales: hand operation counts, exact fractions and original-card
identity, rewind/replay, formula/value mapping, and independent prediction scope.

The isolated archive's 196 selected tracked files matched immutable Git bytes
before and after testing. Numeric checks were not repeated because their source
and the algorithm did not change. The first focused run passed but two scripts
shared an output filename; the evidence rerun gives each script its own folder.
An intermediate local runner failed before executing a test because of a Python
path alias typo; that log is retained separately from the final all-pass log.
No original candidate file or test assertion was modified.

The earlier Mac native-select keyboard automation gap remains explicitly
documented; this label repair does not claim to fix it or turn the full original
Mac browser suite green. Prior native clipboard/actual-zoom evidence applies to
the unchanged functionality and is not a new repaired-candidate full-suite claim.
Physical devices, human learning, online judge acceptance and public delivery are
outside this evidence. Independent review must still assess the complete lesson
and decide whether 679-R1 can close.

Evidence: [native repair records](679-evidence/mac-repair-bc79795-20261025/).
The receipt contains candidate file hashes and exact commands; separate folders
retain the unchanged red-probe rerun, author label test and rendered-contract
results. Screenshots and all evidence files have a SHA-256 manifest.
