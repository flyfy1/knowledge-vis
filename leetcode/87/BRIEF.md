# #87 Scramble String — author brief

Reuse verdict: extend the approved LeetCode lesson pattern, as adjudicated in
specs/reviews/leetcode-all-hard-design-review.md (D3, D6, D8). Website-design
skill read at /home/songyy/Documents/agent-skills/website-design/SKILL.md.
No new layout/service or independent acceptance is claimed. Author run only.
Category: computing / collection leetcode. Stage: university.
Reader: knows strings, loops and Python; new to interval dynamic programming.
Outcome: reconstruct the two legal root alignments, predict a fresh witness,
then implement and test the officially supported Python3 method.
Official capture: tests/evidence/official.json, public GraphQL, accessed 2026-10-18.
Contract: equal length 1..30, lowercase English; Boolean; no empty input,
mutation, modulus, or special exceptions. Examples great/rgeat true,
abcde/caebd false, a/a true. Python3 template observed, so Python preferred.

## Learning loop / five fields per step

| Step | Already knows | Single question | Input → sought value | Action → observation | Scope |
|---|---|---|---|---|---|
| 0 | Characters concatenate | What is a legal scramble? | ab, ba → Boolean | Hand-cut a/b and swap → ba | Nonempty contiguous pieces; recurse independently |
| 1 | Legal recursive split | What must match on both sides? | great/rgeat → smaller pairs | Read both alignments, compare k=1 and k=2 | All k=1..length−1, both children required |
| 2 | State = two starts and length | How do smaller answers settle larger ones? | Preset/custom ≤5 → full dp | Forward adds one base or cut test; back restores table and ledger | Complete bottom-up simulation, no omitted cuts except success short circuit |
| 3 | Two children AND, choices OR | Which construction works on a fresh case? | abcd/badc → witness | Predict, reveal, change answer → stale feedback clears | Separate exercise, unaffected by trace presets |
| 4 | State meaning and dependencies | Why is this complete and how is it coded? | n≤30 → canonical Python | Compare code/source copy/download, tests | O(n⁴) time, O(n³) auxiliary space; no runtime execution in browser |

## First-use dependency table

- Step 0: substring = contiguous piece; recursion = apply same rule to smaller pieces.
- Step 1: k = source left-piece length; i,j = zero-based source/target starts;
  length = equal compared lengths; dp[length][i][j] = whether those pieces scramble;
  AND = both, OR = at least one; dynamic programming = save smaller answers.
- Step 2: repeats local state definition, ? unknown versus false ×, true ✓;
  root = whole pair; ledger = tests completed so far; indices never character identities.
- Step 4: repeats state/invariant and costs; induction = justify increasing lengths.

## Visual/state contract

Two alignment blocks list actual source/target substrings, their starts/lengths,
and child truth values. Full tables retain all smaller completed cells; ? stays
unknown until a proof or exhausted choices. Each frame completes a singleton
comparison or both alignments for one cut. The browser evaluates both alignments
for teaching, whereas Python short-circuits expressions. A successful cut ends
that cell; remaining cuts are unnecessary, explicitly described in copy.
Previous/back/reset are immutable snapshot navigation. Preset/custom restarts
only this experiment. Changing locale preserves all state and focus. No timers.
Invalid custom input preserves the last valid experiment. Clipboard denial shows
selected readonly source. No fetch/loading/reconnect runtime state is necessary.

## Exact token contract

Use ../style.css unchanged: --bg #0d1117, --panel #161b22, --panel2 #1c2330,
--line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff,
--accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Existing alternate step
background #0a0e14 and explain text #c9d4e2 retained. System font stack and
1.75 line-height inherited. Existing 8/14px control/card radii. Local layout:
8/12/16/20/24px spacing; shared 952px content width. 48px minimum controls;
disabled opacity 1 with muted ink/panel2 surface. 3px accent2 focus offset 4px.
No extra palette, shadows, animation or external assets. Tables scroll within
labeled focusable containers; columns never shrink below readable dimensions.

P0 / highest-return 20%: causal two-alignment explanation, retained DP answers,
faithful Python, bilingual controls, independent oracle and real browser checks.
P1: custom tiny cases and reversible slider within the approved shell.
P2: none. Deferred: animation/platform/execution service (no learning need),
registry/concept-map edits (outside author ownership), independent review and
release (separate runs). Related existing anchors used without shared edits.
Self-check evidence is not a novice study or an independent teaching review.
