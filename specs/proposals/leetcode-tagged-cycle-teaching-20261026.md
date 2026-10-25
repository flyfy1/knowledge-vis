# Proposal: make the repeated-letter cycle bridge concrete

**Status: independent teaching proposal, pending dispatcher adjudication and future candidate review.** No active specification, lesson, score or acceptance changes. Scope: optional `854-A01` from [the original accepted review](../reviews/854-outcome-20261026/854-review-1-9601268b.md), candidate `1be3c657ef0c1ef3152f8abced78df2e278f09da`, 92.5/100, no required findings. Original report SHA-256: `4e2a60a96948e7a6d51783423ac5d91162b57f878a9e73d4267ff81bcc7cd705`.

**Reuse verdict:** add one short worked bridge immediately before the existing singleton argument. The basic-Python reader's task is to distinguish changing a proof assignment from performing a charged swap. Reuse the lesson's typography, tokens and existing step controls; no new route, framework or general cycle explorer.

## Worked bridge / 具体桥段

EN: Use zero-based positions 0,1,2,3. Target stays **abca**. Tag the two source a occurrences **a₀,a₁** only to distinguish them; tags are not input characters. An arrow `i→j` means “the token currently at position i is assigned target position j.” A cycle follows these arrows back to its start. “Remaining tagged cost” means the minimum swaps **for this particular assignment**, not necessarily the minimum for the original untagged strings.

ZH: 位置从 0 编号到 3，目标始终是 **abca**。给源串中的两个 a 暂贴 **a₀、a₁** 标签，标签不是输入字符。箭头 `i→j` 表示“当前位置 i 的字母被分配到目标位置 j”。沿箭头回到起点就形成一个环。“剩余带标签代价”只指**当前这份分配**所需的最少交换数，不一定是原题的最少次数。

| Step / 步骤 | Actual string; tagged tokens / 实际串；标签 | Destination arrows / 目的地箭头 | Cycles / 环 | Remaining tagged cost / 剩余带标签代价 | Physical swaps so far / 已做实际交换 |
| --- | --- | --- | --- | --- | --- |
| Arbitrary assignment / 任意分配 | aabc; a₀ a₁ b c | 0→3, 1→0, 2→1, 3→2 | (0 3 2 1) | 4−1=3 | 0 |
| Reassign equal a destinations / 重分配两个 a 的目的地 | **aabc; a₀ a₁ b c (unchanged / 不变)** | **0→0, 1→3**, 2→1, 3→2 | (0)(1 3 2) | 4−2=2 | **0** |
| Swap positions1,2 / 交换位置1、2 | abac; a₀ b a₁ c | 0→0, 1→1, 2→3, 3→2 | (0)(1)(2 3) | 4−3=1 | 1 |
| Swap positions2,3 / 交换位置2、3 | abca; a₀ b c a₁ | 0→0, 1→1, 2→2, 3→3 | (0)(1)(2)(3) | 4−4=0 | 2 |

EN: In the second row, **change only the two arrows; move no letters**. Both destinations need a, so the reassignment remains valid. Position0 becomes its own cycle. This bookkeeping costs **zero physical swaps**: the earlier value3 was the cost of an unnecessarily restrictive labeling, not a lower bound for the original problem. The next two rows really exchange tokens and cost one each.

ZH: 第二行**只改两条箭头，不移动任何字母**。两个目的地都需要 a，因此新分配仍合法，位置0单独成环。这一步只是记账，**实际交换次数为0**；先前的3只是较差标签分配的代价，不是原题答案的下界。后两行才真的移动字母，每次计1。

## Why the singleton claim holds

For a valid destination permutation p, require `source[k] = target[p(k)]`. If position i already matches but p(i)≠i, let k be the unique position with p(k)=i. Then source[k]=target[i]=source[i]. Exchanging **only** p(i) and p(k) is therefore legal. In their one cycle, replace `i→p(i)→…→k→i` by `(i)` and `p(i)→…→k→p(i)`: cycle count increases by one, so tagged minimum `n−cycles` decreases by one. Other singleton positions remain untouched. Repeating this shows an optimal assignment can fix every already-correct position. The arbitrary first row above is deliberately not an optimal assignment.

In a maximum-cycle assignment, let i be the first mismatch and j its predecessor, p(j)=i. Correct positions are singletons, so j is misplaced and j>i; its letter is target[i]. A **physical** swap of i,j splits off i and consumes one swap of an optimal route. This establishes existence of an eligible optimal move, not a way to discover the optimal assignment cheaply. **Keep every eligible j** (`j>i`, current[j]=target[i], current[j]≠target[j]); do not choose the leftmost j or turn the proof's hypothetical predecessor into a greedy algorithm. The example illustrates the operation; the arbitrary-p argument supplies the proof.

## Small proposed interaction and checks

P0 / highest-return slice: four explicit snapshots using this one table, Next/Previous/Reset and bilingual action labels. The reassignment transition keeps token positions and physical counter unchanged; arrows and cycle/cost labels change. Physical transitions move the tagged tokens with their assigned destinations. Ask once before reveal: “Did any letters move? How many physical swaps were spent? / 有字母移动吗？实际交换了几次？” Correct feedback: “No; zero / 没有；0次”. No automatic motion is needed.

Design-review material only, not an approved implementation brief. The candidate is a tiny inline manually stepped example. Keep existing `hand`, `preset/at/frames`, `selected/revealed` and `copyState` ownership unchanged; a local example-row index must not alter BFS frames, quiz answers or source-copy state. The existing locale rerender preserves that row. Reuse the exact frozen token contract: `--bg #0d1117`, `--panel #161b22`, `--panel2 #1c2330`, `--line #2b3547`, `--text #e8edf4`, `--muted #9aa7b8`, `--accent #6ee7ff`, `--accent2 #ffb454`, `--good #7ee2a8`, `--bad #ff7a93`; shared system font, 1.75 line height, 14px stage/8px control radii, 48px targets and 3px orange focus. No new widget system, new tokens, animation or timers. Separate design adjudication must precede an implementation brief.

Acceptance checks for a future candidate: exact four rows and costs3,2,1,0; physical counter0,0,1,2; unchanged tokens at reassignment; stable target; both locale switches preserve the row/counter; rewind restores arrows, tags and costs; reset returns the arbitrary assignment; start/end controls have truthful disabled states. At320px/200% allow readable stacked rows or a labeled keyboard-scroll region using existing tokens; never truncate the explanation distinguishing zero-cost reassignment. Keep learner copy free of workflow status. Loading/network/error states are inapplicable to this fixed synchronous example.

P1: none required. P2: none. Deferred: arbitrary matching input, animated edges and a reusable permutation platform—no demonstrated need for this advisory. Implement only through a new lesson candidate at an agreed future boundary, then obtain fresh independent review. Existing #854 acceptance stays intact; this proposal is not rendered UI evidence.

## Independent arithmetic evidence

[Verifier](leetcode-tagged-cycle-teaching-evidence-20261026/verify.py) and [result](leetcode-tagged-cycle-teaching-evidence-20261026/result.json): exact table assertions pass; an independent untagged BFS finds distance2; 442 binary-source/permutation cases through n=4 validate628 applicable singleton reassignments. These finite checks corroborate arithmetic, not a proof for arbitrary n. No lesson imports or runtime changes occurred. Verifier SHA-256 `175630afba8ec9edc8cffce172528b120fca3e08ccad25714bfcb1f772f6f89a`; result `4ecee1fa750d28f7724bf0bff9ec4cef421576cc508fbe84ada08d60e1a1c820`.
