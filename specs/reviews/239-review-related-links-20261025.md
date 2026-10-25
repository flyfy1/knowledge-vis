# Non-scored follow-up: #239 related-link labels

Date: 2026-10-25. Candidate:
`e0f51bb5f022702e7eea2ff108ee1fe99077a7fe`. Inspected local main HEAD:
`3df020b1778ab78e38b8f2d6d23ae86bd19508ed`. The candidate and current main have
the same complete #239 tree, `f1ab7c435079af65a7c437c77a90fc22361380c4`;
the inspected lesson directories have no working-tree modifications.

This is a narrow navigation/content follow-up. The existing
[independent review](239-review-3-d9c54776.md) remains recorded as accepted,
95/100, with no required open IDs. This report does not rescore it, waive a
finding, reopen campaign acceptance, or certify publication.

## Confirmed observation

`leetcode/239/index.html:6` connects the two related anchors to `rel0` and `rel1`.
`leetcode/239/copy.js:11` supplies the same misleading promises in both locales:

| Link label | Destination | Actual local destination content |
| --- | --- | --- |
| “Monotonic stack: the same domination idea” / “单调栈：同样的‘支配就淘汰’思想” | `../10/#step3` | The anchor exists. It is #10 Regular Expression Matching's prediction exercise: whether `s="ab"`, `p="a*b*"` fully match, with one `a` and one `b`. It teaches neither a monotonic stack nor deque domination. |
| “Prefix sums: another window summary” / “前缀和：窗口总和的另一种摘要” | `../42/#step1` | The anchor exists. It derives #42 Trapping Rain Water's two-pointer method using `left_max` and `right_max`, then settles the side with the smaller known maximum. These are running maxima, not prefix sums. |

Evidence for the first destination is `leetcode/10/index.html:22` and its
`quizQuestion`/`option2` copy. Evidence for the second is
`leetcode/42/index.html:10` and `derive`, `proof`, and `invariant` in its copy.
The nearby #42 baseline mentions prefix/suffix **maxima**, which does not support
the advertised prefix-**sum** concept either.

## Classification

**Confirmed, actionable navigational labeling defect; advisory in this
non-scored follow-up.** The links resolve to real local anchors, so this is not
an absent-fragment defect. Their labels promise concepts that the destinations
do not teach. A learner following them receives the wrong continuation.

This inspection does not substantiate a failure of #239's deque algorithm,
window membership visualization, source parity, proof, or previously repaired
H1 identity. The misleading labels are nonetheless real content inaccuracies,
not cosmetic preferences. No new required core-correctness finding is asserted
from this narrow evidence. Acceptance disposition remains with the established
dispatcher/review workflow; the historical 95 score is not permission to ignore
this follow-up.

## Truthful repair options

The better local continuation is to point to existing lessons that actually
explain the promised structures, while making each label specific:

- `../84/#step1`: **“#84 · Monotonic stack: settle rectangle boundaries”** /
  **“#84 · 单调栈：确定矩形边界”**. The anchor explicitly contains `stackIntro`,
  explains nondecreasing pending heights, and settles a taller bar when a
  strictly shorter right boundary appears. Do not retain “the same domination
  idea”: #84's pop finalizes a rectangle contribution, whereas #239 discards a
  candidate that cannot win a later window. The shared monotonic structure does
  not make their pop meanings identical.
- `../327/#step1`: **“#327 · Prefix sums: subtract to obtain a range sum”** /
  **“#327 · 前缀和：相减得到区间和”**. The anchor contains the visible derivation
  `sum(nums[i:j]) = P[j] - P[i]` and the prefix-pair selector. This describes
  sums explicitly and does not imply prefix subtraction computes a maximum.

These alternatives were inspected in `leetcode/84/index.html:14` and
`leetcode/84/copy.js:13–16`, and `leetcode/327/index.html:3` with
`leetcode/327/copy.js:17–23`. Both fragments exist locally. Their local tree
identities at the inspected HEAD are respectively
`95c6ae5e9143a9fe8e5868d05c78bf3c31efd26c` and
`d7f0000d0d2e7c8ec7748dbafc64796cb5f21fda`.

If the destinations must remain unchanged, truthful but less relevant labels
would be **“#10 · Predict a regular-expression match”** /
**“#10 · 预测正则表达式能否匹配”**, and
**“#42 · Two pointers and running maxima”** /
**“#42 · 双指针与已知最高墙”**. The #84/#327 links provide a clearer learning path.

## Next action and limits

At a normal post-release repair boundary, update both labels and destinations
together in a new #239 candidate. Independently follow each link from the rendered
lesson in both locales, verify the target fragment and visible concept, and
confirm those destinations are in the served collection before publication.
Preserve the old candidate/review and handle the changed lesson through the
ordinary review workflow. No source-policy or scoring change is needed.

The dispatcher supplied the observation from the actual public #239 page; this
follow-up independently verified the exact local source and target sections.
It did not fetch the live destinations, rerun the whole lesson, or claim that
local fragment existence proves current public delivery. Only this report was
written; no runtime, score, campaign, ledger, policy, or production mutation was
performed.
