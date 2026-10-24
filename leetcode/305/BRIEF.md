# Problem-local brief — #305 Number of Islands II

Status: **blocked pending authorized official access**. This brief records the intended lesson contract and the evidence boundary; no implementation is claimed.

## Product fit
- Category: algorithms / Computing & AI
- Stage: university
- Reader: a LeetCode learner who can read Python and needs to derive dynamic connected-component counting.
- Immediate job: learn why incremental land additions require union-find with a component-count invariant.
- Smallest useful outcome: hand-calculate a four-operation trace, predict the count after a duplicate/adjacent add, then map the invariant to the official callable interface.
- Validation occasion: independent reviewer can compare the lesson to the authorized official statement and interface.

## Access gate
The public official page is reachable, but the statement and code interface are premium-gated. Public GraphQL returned metadata (`questionId` 305, title, slug, Hard, paid-only) and example testcase text, while `content` and `codeSnippets` were null. Evidence is stored in `tests/evidence/official-page-2026-10-24.txt` and `tests/evidence/public-graphql-2026-10-24.json`. Per workflow, I will not invent constraints, examples, selector/interface, or a canonical submission source.

Next needed input: an authorized, normally available view of the official statement and language selector/interface (or an owner-provided capture/export of those fields). Once supplied, verify the exact contract, then implement the bilingual lesson and run browser/oracle checks.

## Planned five-step learning loop (only after access is available)
1. **Meaning and hand calculation** — Known: a grid and an ordered list of land additions. Question: what count is reported after each operation? Inputs: `m`, `n`, `positions`; desired output: count sequence. Action: step through a tiny trace with duplicate and diagonal additions; observe that only orthogonal land joins. Conditions: four-neighbor adjacency and the official duplicate semantics.
2. **Baseline** — Known: each addition changes only nearby components. Question: why does rescanning the whole grid repeat work? Inputs: current grid; output: connected-component count. Action: compare flood-fill rescans with incremental updates. Conditions: baseline is an oracle only for small cases.
3. **Invariant experiment** — Known: each active cell starts as one component. Question: what changes when a new cell touches roots? Inputs: parent map and count. Action: add preset/custom positions; predict before stepping; observe count decrease once per distinct root merge and remain unchanged for duplicate/within-component neighbors. Conditions: path compression/union by size preserve root equivalence.
4. **Transfer exercise** — Known: the invariant and four-neighbor rule. Question: predict the next count for a fresh sequence, then explain why. Action: answer, reveal, alter a choice, reset. Conditions: prediction is for the shown simulation, not execution of the official submission.
5. **Canonical mapping and verification** — Known: union-find operations. Question: how does each visual transition map to the official function? Inputs: exact supported callable signature and constraints from the authorized source. Action: inspect source, copy/download, compare against independent brute-force oracle. Conditions: complexity and edge cases must match the official contract.

## New terms (first-use plan)
- **Union-find / 并查集**: a parent forest that represents which active cells belong to the same component.
- **Root / 根**: the representative parent reached by following parent links.
- **Path compression / 路径压缩**: shorten parent links while finding a root.
- **Union by size / 按大小合并**: attach the smaller tree under the larger root.
- **Invariant / 不变量**: a statement kept true after every operation; here, `count` equals the number of active connected components.
- **Four-neighbor adjacency / 四邻接**: only up, down, left, right cells are adjacent.

## Design-token and interaction contract
Reuse the shared dark tokens from `leetcode/common.js` and `style.css`; no new framework or external assets. All controls, feedback, canvas labels, and accessibility text will have Chinese and English strings, preserve `knowledge-lang`, and support reset, endpoints, prediction/reveal/change, copy fallback, keyboard focus, 320/390/desktop widths, and 200% zoom.

## Review boundary
This author run cannot claim independent acceptance. A separate reviewer must cold-walk the lesson, recompute examples, inspect source parity, and verify the official-language evidence after the blocker is cleared.
