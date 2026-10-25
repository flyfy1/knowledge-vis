# Author iteration evidence

All observations below are author self-checks, before candidate freeze.

- Initial browser matrix passed both locales at 320/390/736/1440 and CSS zoom 2
  at 390. Expanded CSS zoom 2 at 320 failed document overflow (363 vs 320px).
  Diagnosis: header flex row could not wrap. Local fix: wrap head-top, retain
  language toggle right alignment with margin-left:auto.
- Expanded matrix then found Chinese CSS zoom 2 overflow (350 vs 320px).
  Diagnosis: Master.guess(word), buckets[score], matches[probe][i] in ordinary
  prose/list text exceeded the effective width. Local fix: allow text wrapping
  for explain/list/headings/tagline, without shrinking text. Diagnostic screenshot:
  zoom320-diagnostic.png (first failure, not a final passing screenshot).
- Final-state refinement: hide next-probe heading and scroll hint with the table
  after success. Terminal success text still states the actual reply 6; retained
  candidates and cumulative ledger remain visible.
- Contrast test was refined before freeze to compute ancestor alpha composition,
  rather than approximate the cyan selected-row overlay.

Final rerun receipts and screenshots are separate. No independent finding is
claimed closed by these author fixes.
