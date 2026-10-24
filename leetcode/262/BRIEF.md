# BRIEF — #262 Trips and Users

- Product fit: one bilingual LeetCode knowledge lesson in the existing collection. Category: database/Pandas; stage: university. Reuse shared dark tokens and the approved five-step lesson pattern.
- Target reader: a learner who can read DataFrame filters and groupby, but needs to reason about two-table eligibility before computing a rate.
- Learning loop: hand-calculate one day, mark both users as eligible, aggregate numerator/denominator by day, predict a transfer case, then map the invariant to the official Pandas callable.
- Official contract verified 2026-10-24 Asia/Singapore from https://leetcode.com/problems/trips-and-users/ and the public Python DataFrame submission page. Statement, schema, date window, rounding, sample and callable are captured in `provenance/official-capture.md`.

## Step fields

1. **Concrete quantity** — Known: one trip row and two user rows. Question: which requests count? Inputs: client/driver IDs, banned flags, status. Action: toggle eligibility; observe that one banned endpoint excludes the whole trip. Condition: both client and driver must be unbanned.
2. **Hand calculation** — Known: eligible rows. Question: how is a daily rate formed? Inputs: statuses on 2013-10-01…03. Action: advance rows; observe denominator and cancellation numerator separately. Condition: only rows in the inclusive date window and with both users unbanned.
3. **Invariant and baseline** — Known: daily numerator/denominator. Question: what state is sufficient? Inputs: each eligible trip. Action: step through a reversible trace; observe per-day counters. Condition: status is cancelled_by_client/driver or completed.
4. **Prediction** — Known: invariant. Question: what changes when a driver is banned or a day has no eligible rows? Inputs: fresh tiny fixture. Action: predict, reveal, change answer. Condition: denominator is positive for displayed days; absent days are omitted.
5. **Canonical implementation** — Known: counts and eligibility. Question: how does Pandas encode them? Inputs: DataFrames. Action: inspect source/copy/download; map each line. Condition: `pd.DataFrame` input and output, two-decimal rounded `Cancellation Rate`.

## New terms

| term | first use | plain definition |
| --- | --- | --- |
| eligible request | step 0 | a trip whose client and driver are both unbanned |
| denominator | step 1 | all eligible requests counted for one day |
| numerator | step 1 | eligible requests cancelled by either side |
| conditional rate | step 1 | numerator divided by denominator after filtering |
| groupby | step 2 | collect rows sharing the same day so each day gets one total |
| invariant | step 2 | a statement that remains true after every processed row |

## Simulation limits

The trace is a deterministic simulation of the official rule, not execution of the submission. It uses the sample rows and a small transfer fixture; Pandas source is shown and tested separately. The visualization does not claim LeetCode acceptance.
