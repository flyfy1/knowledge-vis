# Bayes S3 evidence identity correction

Base9173da78; isolated branch codex/bayes-evidence-identity-20261026. [Contract](../../atlas-bayes-evidence-identity.md), [brief](../../../bayes/BRIEF.md), baseline.json. Actual defect: independence warning incorrectly claimed a general upper bound; no observation identity. Design gate independently accepted reuse of original ledger/curve (P0=0), with same-record LR1, both-hypothesis independence and canonical effective-LR constraints.

Scope: bayes S3 and S1 continuation only; no Atlas graph/runtime, LeetCode or probability-core rewrites. Math source in contract. New/copy/undo/clear maintain a single ledger. Explicit fixed1% prior and model assumption, no mastery/profile or calibration claims. Counterexample uses invented valid joint probabilities, not measured data.

Verification commands from repository root:

```
node --check bayes/app.js
node --check bayes/i18n.js
node atlas/tests/bayes-evidence-identity-core.cjs
node atlas/tests/bayes-measurement-core.cjs
NODE_PATH=/Users/songyy/Documents/integ-life/integ-games/node_modules ATLAS_BASE_URL=http://127.0.0.1:18937 BAYES_ID_EVIDENCE=specs/reviews/bayes-evidence-identity-20261026/browser node atlas/tests/bayes-evidence-identity-browser.cjs
NODE_PATH=/Users/songyy/Documents/integ-life/integ-games/node_modules ATLAS_BASE_URL=http://127.0.0.1:18937 BAYES_MEAS_EVIDENCE=/tmp/bayes-s1-regression node atlas/tests/bayes-measurement-browser.cjs
```

Numerical checks passed: same-record plateau9.1743119%, independent new reading50.2512563%, valid dependent counterexample52.2975673%; preserved probability core/S2/S4–S6; prior input sweep and graph38/50/14 unchanged. Browser and independent final status recorded in verification.md after completion. Historical S1 preservation assertion deliberately narrowed around the authorized S3 increment, not deleted.

Publication is separate: do not claim public browser success from origin hashes. Existing Cloudflare403/1010 boundary means no new public reads/bypass. Physical phone/Safari/speech and actual learner effects remain unverified. All prior dirty/unrelated work must remain untouched; scoped backup+hash guard for any release.
