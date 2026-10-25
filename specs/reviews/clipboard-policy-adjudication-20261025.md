# Dispatcher adjudication: native clipboard verification

The [proposal](../proposals/leetcode-native-clipboard-checks-20261025.md) received
an independent [review](clipboard-policy-proposal-review-20261025.md) with no
required changes. The reviewer checked the retained #639 original/adapter diff,
receipt hashes, red/green probe, full canonical-source assertions and host scope.

Accepted for later adoption: clarify the browser-host copy shortcut, distinct
clipboard sentinel, actual copy/readback, unchanged exact-source assertions,
explicitly reported adapters and unavailable-readback gaps in section 4 of the
rendered-state contract. No runtime or scoring changes are needed.

Deferred: activation while #664 and #668 are running against the current frozen
policy. Their independent reviews and imports must finish before shared-policy
bytes change. The central runner must be stopped at a safe boundary for adoption.
This document and the proposal do not activate the change. A subsequent adoption
receipt must record the actual before/after commits and candidate boundary.

No recommendations were overridden. The shared clipboard abstraction, exhaustive
platform matrix and retroactive review campaign remain deferred for the reasons
in the proposal. No existing lesson acceptance or original evidence was changed.
