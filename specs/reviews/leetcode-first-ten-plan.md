# First ten Hard lessons: scope and review contract

Date: 2026-10-17. Selection: ascending numeric frontend problem ID, difficulty
Hard, not popularity or interview frequency. Official descriptions verified on
this date: 4, 10, 23, 25, 30, 32, 37, 41, 42, 44. Existing 2916 stays available.

## MVP card

Target user: a Python reader who knows arrays, loops, functions, and basic recursion.
User job: reconstruct each algorithm from a concrete example and implement it.
Riskiest assumption: replaying correct states explains why each transition is valid.
P1 loop: collection → statement and hand calculation → baseline → invariant →
reversible experiment → unseen prediction → mapped Python → boundary checks.
Representative conditions: ten official problems, English and Chinese, desktop
and 320/390px mobile, offline code display, unavailable browser storage/clipboard.
Expected output: ten complete lessons with tested Python and independent oracles.
Success proof: computational differential checks and browser interaction evidence;
these do not establish actual novice comprehension or LeetCode acceptance.
No-gos: accounts, execution backend, autoplay, new dependencies or site framework.
Appetite: this ten-problem batch and two focused review/fix passes.

## Frozen review criteria

Adapted from the existing novice rubric before implementation. Review every
lesson as a reader first, then inspect source. Record actual defects and their
fixes; do not invent independent reviewers, scores, or learner evidence.

1. State the requested result and hand-compute the smallest meaningful example.
2. Identify the baseline's repeated work or violated memory/time requirement.
3. Explain the invariant, transition, termination, and excluded/boundary cases.
4. Observe one operation with its dependencies and retained before/after evidence.
5. Predict a fresh case before answer reveal; incorrect feedback explains why.
6. Map visible names to Python; complexity includes real implementation costs.
7. Switch locale after interaction; replay, rewind, restart, and reach endpoints.
8. Use both languages at 320/390px without page overflow or unreadable labels.

Blockers: wrong math/code, hidden causal mechanism, data structure identity loss,
stale/revealed prediction state, untranslated essential explanation, or unusable
critical controls. Pass 1 targets mechanisms and algorithm edge cases. Pass 2
checks fixes and all browser state/locale/layout paths. Self-review is labeled
as such; an independent teaching audit and human teach-back remain distinct.
