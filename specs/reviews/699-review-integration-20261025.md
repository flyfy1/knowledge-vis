# Integration receipt — #699

Central import: `101769430ba0592eeff2a76430529d319e631512`.
Accepted lane: `36f240498e74886f1f8bb5b0f0e543ff4db6b7d0`.
Independent report `699-review-1-8b239bd6.md` accepts candidate
`f7c327b4cd6cf3ba04779e034952c7e22d912ba6` at 97.5/100, with no required findings.
Its Linux checks include the complete original browser suite and separate fresh
400-case oracle. Central acceptance count after import is 96.

All 54 files under `leetcode/699/` match that frozen candidate byte-for-byte.
The registry adds only #699; all 96 previous entries remain unchanged. Registered
entry count differs from campaign acceptance count. The importer preserved the
independent run/report and validated its source fingerprint. The reservation was
marked imported under ownership locks after backing up its previous value.
Main-only evidence and unrelated untracked pages remain intact.

Collection checks pass 137 assertions, including bilingual search/filter/navigation
and bounded 100/984-entry fixtures. Whitespace checks pass. Reproduction runner
and results are in `699-evidence/mac-integration-20261025/`.

Mac scope is explicitly limited as recorded in `699-review-mac-candidate-20261025.md`:
algorithm/core and separately run accessibility checks passed, but the original
browser stopped at native Home/ArrowDown/Enter selection. The same failure occurs
in a handler-free native select with focus verified. Its original assertion and
red log remain intact; no product cause or full Mac browser pass is claimed.
The independent acceptance above concerns its documented Linux/browser scope.
This integration does not convert that coverage gap into a passing result.

No public release occurred. With three released accepted lessons, 93 remain
accepted and unreleased; seven more are required for the next batch of 100.
