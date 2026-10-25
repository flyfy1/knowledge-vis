# BRIEF — #262 Trips and Users

- Product fit: one bilingual LeetCode knowledge lesson in the existing collection. Category: database/Pandas; stage: university. Reuse shared dark tokens and the approved five-step lesson pattern.
- Target reader: a learner with basic Python lists, loops and functions; DataFrame filtering, joins and grouping are introduced in the lesson.
- Learning loop: hand-calculate one day, mark both users as eligible, aggregate numerator/denominator by day, predict a transfer case, then map the invariant to the official Pandas callable.
- Official contract verified 2026-10-24 Asia/Singapore from https://leetcode.com/problems/trips-and-users/ and the public Python DataFrame submission page. Statement, schema, date window, rounding, sample and callable are captured in `provenance/official-capture.md`.

## Step fields

1. **Concrete quantity** — Known: one trip row and two user rows. Question: which requests count? Inputs: client/driver IDs, banned flags, status. Action: inspect the tiny kept/dropped example; observe that one banned endpoint excludes the whole trip. Condition: both client and driver must be unbanned.
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
| groupby | step 4 | collect rows sharing the same day so each day gets one total |
| invariant | step 2 | a statement that remains true after every processed row |

## Simulation limits

The trace is a deterministic simulation of the official rule, not execution of the submission. It uses the sample rows and a small transfer fixture; Pandas source is shown and tested separately. The visualization does not claim LeetCode acceptance.

## Review-4 repair contract (2026-10-25)

Required IDs: FIND-262-003 and FIND-262-004, fixed awaiting separate review.
The report `specs/reviews/262-review-4-45c98297.md` supplies the independent
findings and approved repair direction. Reuse the five sections, existing text
styles and tokens; no feature, layout, animation or shared asset change.
Target reader is basic Python (lists/loops/functions), with no assumed Pandas
join or grouping knowledge. Highest-return/P0 work is the explicit eligible
transition and the worked route from active IDs through two inner merges to
[0,0,1], sum/count and executable source. P1/P2 decoration is outside this repair;
no required finding is deferred.

- Step 3: known daily counts; question why a new row preserves them; inputs
  sample rows #1–#4; action rewind/replay excluded #2 and compare (0,1) before
  and after; conditions include date window and both endpoints. Define invariant
  and prefix here. Explain the full-scan baseline with T=Trips rows, U=Users rows,
  12 date checks and 64 user-row checks for four trips/eight users.
- Step 5: known row eligibility and daily sum/count; question how tables implement
  that process; inputs first four sample trips and all eight Users; action read
  active IDs and each intermediate row list, then expand source; expected result
  #1/#3/#4 → [0,0,1] → sum=1/count=3 → 0.33. Conditions: unique Users primary
  keys, official status enum, inclusive dates. Define DataFrame, inner merge,
  rename, groupby, agg and hash lookup at use. Fresh transfer includes a banned
  driver, an absent day and an outside-window row. These worked values are static,
  explicitly independent of the interactive prefix. Canonical source unchanged.

The invariant/formula are both locale pairs; excluded rows alter neither count.
Canonical cost counts two merges, fixed three output dates, expected constant-time
hash lookups and intermediate frame storage. Python remains the preferred faithful
Pandas callable: no non-Python language-contract exception is needed.
