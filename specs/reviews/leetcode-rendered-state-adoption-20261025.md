# Dispatcher adoption — rendered-state contract

Adopt the supplement and prompt wiring reviewed in
[the independent documentation review](leetcode-rendered-state-contract-review-20261025.md).
The review accepted the submitted files with no required findings. The supplement
SHA-256 is `c411afb3529e759c8c34e9f605c9669d4bf7958d26fda96a80d6757b53f505f2`.

Accepted: all four concrete checks and prospective author/fix/reviewer wiring.
The reviewer still completes and records a cold walkthrough before consulting
this supplement or its linked historical reports. Weights and acceptance gates
are unchanged. No lesson is accepted or reaccepted through this documentation work.

Deferred: optional DOC-OPT-01 (an additional fully indexed prediction example).
The supplement already requires explicit indices/boundaries and independently
computed expected values, and does not repeat the ambiguous historical #312 quiz
calculation. Keep the reviewed document unchanged. If that optional worked
example is added later, distinguish original and padded indices and review it as
new documentation. Historical reports remain unchanged.

Validation: introduced Markdown links resolve; all three task templates include
the supplement and work with the runner's literal placeholder replacement.
The existing 27 campaign tests pass with a canonical temporary directory:

```
TMPDIR=/private/tmp python3 -B -m unittest discover -s scripts -p test_leetcode_campaign.py
```

The first sandboxed run could not bind loopback servers. An unrestricted run
then exposed the unchanged resume fixture's `/var` versus `/private/var` alias
mismatch on macOS; the canonical temporary-directory rerun passed all 27 tests.
No runner or test implementation was changed. These fake-agent tests do not
prove real lesson quality; that remains the independent per-lesson review gate.

Adoption into the live Pi checkout must occur after the current run finishes,
under the campaign locks, with the previous and new HEAD recorded in maintenance
state before resuming. Do not modify a frozen candidate during its review.
