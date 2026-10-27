# Independent review: LeetCode 1192

Revision reviewed: `d748c7483399d8ea79ed9ec74321b27391e6775d`  
Candidate: `http://127.0.0.1:18770/leetcode/1192/`  
Reviewer identity: unavailable (independent fresh run)

## Cold walkthrough (performed before source, tests, briefs, or prior reports)

I opened the candidate in a real Playwright Chromium browser at 1280x900 and recorded the visible lesson without reading implementation files.

| Step/question | Action | Observable result | Causal conclusion paraphrase |
|---|---|---|---|
| 01, “which edge is the only route?” | Read the worked graph `0–1–2–0` plus tail `1–3`; toggled each displayed edge-removal row. | Removing 0–1, 1–2, or 2–0 says “Still connected”; removing 1–3 says “Separated: {a} and {b}”. | A cycle supplies an alternate route, while the tail has no alternate route, so only 1–3 is critical. The page identifies undirected edges, vertex range, output, and constraints. |
| 02, “why does removing every edge and rerunning DFS repeat work?” | Read baseline paragraph and tempting-mistake paragraph. | Baseline is stated as removing each edge and running DFS from 0, with worst case `O(m(n+m))`; the page warns that ignoring every visited edge mislabels cycle edges as bridges. | Re-running explores the same graph repeatedly; one traversal should preserve the useful reachability information. The cycle counterexample motivates treating back edges specially. |
| 03, “what exactly does low[u] record?” | Read the invariant text, then clicked `Next` three times from frame 0 and `Previous` once. | Frame 0 shows “Not started”; Next shows discovery of 0 (`tin=low=0`), then tree edge 0–1, then discovery of 1 (`tin=low=1`); Previous returns to frame 2. The table and frame caption change while the explanatory text remains. | `tin` is assigned on first discovery; a reversible trace exposes DFS order and retained state, and Previous rewinds one transition. The prose gives the merge `low[parent]=min(...)` and strict `low[child] > tin[parent]` bridge test, but the trace itself is a teaching simulation rather than code execution. |
| 04, “from tin and low, which edge is a bridge?” | Before revealing, selected “Only 1–3”; then clicked `Reveal`. | Reveal says “Correct: use strict >. In the cycle-plus-tail graph, only 1–3 is a bridge.” | The strict inequality excludes cycle edges whose low value reaches an ancestor at or above the parent; a child subtree with no such back edge is separated by its parent edge. |
| 05, “how does the invariant become the official function?” | Read the mapping and cost text; noted the source controls. | Page says Python DFS writes `tin/low`, back edges use `tin[v]`, returns merge child `low`, and strict `>` appends bridges; cost shown as `O(n+m)` time and `O(n+m)` space. It explicitly labels the visual as a simulation and says source mirrors the official Python callable offline. | The intended bridge from state to executable implementation is present at a summary level, with the canonical Python function and asymptotic claim deferred to source inspection. |

### Independent prediction and counterexample

Before any source inspection, I chose a fresh small input not editable in the UI: `n=3, edges=[[0,1],[1,2]]` (a path). Prediction: both `[0,1]` and `[1,2]` are critical because removing either disconnects the suffix. This is a **code check**, since the page exposes presets only and no custom-input editor. I also predicted the tempting wrong rule “every edge to a visited vertex is a bridge” fails on triangle `0–1–2–0`: the correct answer is empty, because each edge has an alternate route. The visible cycle-plus-tail reveal independently confirms the same excluded-case reasoning, but the fresh path requires canonical-code verification below.

Cold-walk evidence screenshots: `specs/reviews/1192-evidence/1192-review-1-afe23d65/cold-initial.png`, `cold-interactions.png`, and `cold-zh.png`.

## Post-cold audit

Pending: canonical source, official statement/constraints, language contract, tests, responsive/keyboard checks, and metadata preflight.

## Audit observations and independent checks

- `lesson-entry.json` uses the required single string complexity, `O(n+m) time; O(n+m) space`.
- The safe preflight was run from the repository root: `python3 -B scripts/register_leetcode_lesson.py 1192 --validate-only` (exit 0).
- The official provenance records the Python3 callable `Solution.criticalConnections(self, n, connections)` and constraints through `10^5`; the page omits the lower bound `n - 1 <= connections.length` but otherwise communicates the key input/output and no-repeat-edge condition.
- `solution.py`, the displayed `<pre>` source, and `python-code.js`'s embedded source matched byte-for-byte after extracting the displayed code (SHA-256 `5969cb1192ab2dd8a5c0f39b2fd7a9c1c45bb148d264814e78d0347928ae3893`). The download link is `solution.py`.
- Direct execution of the canonical Python source passed the listed cases, the seeded oracle cases (80 random graphs per n=2..7), and the fresh path/triangle/single-edge checks: path returns both edges, triangle returns `[]`, and n=2 returns `[0,1]` (order unrestricted).
- The repository's `pytest` executable was unavailable (`pytest: command not found`), so I ran the test module functions directly; this is a tooling limitation, not a passing pytest claim.
- Preset trace checks: selecting Path, `End` produced frame `14/14` with bridges `2–3, 1–2, 0–1`; `Reset` returned frame `0/14` and no bridges. At 320, 390, and 1280 CSS pixels, document scroll width equaled viewport width. Tab traversal reached language controls, the graph select, and Next/End; 200% body zoom was captured. Chinese text preserved the algorithm sequence and controls, with terminology translations visible in the saved screenshot.
- The visualization is explicitly a simulation and not execution of Python. It does show state changes and rewinding, but it does not accept arbitrary graph input; the fresh path is therefore a code check as recorded above.

## Required findings

### L1192-R1-RECURSION (open, required, correctness/cost)

- **Candidate/reproduction:** revision `d748c7483399d8ea79ed9ec74321b27391e6775d`, canonical `leetcode/1192/solution.py`; call `Solution().criticalConnections(n, [[i,i+1] for i in range(n-1)])`.
- **Expected:** handle the official connected-path boundary up to `n=10^5` and return all `n-1` bridges.
- **Actual:** direct execution raises `RecursionError: maximum recursion depth exceeded` already at `n=1000` (and at 1100, 2000, and 100000) because recursive DFS never raises Python's recursion limit or uses an iterative traversal. The lesson presents this as the official callable and claims `O(n+m)` for the stated constraints, so the canonical executable is not correct across the official input domain.
- **Violated requirement:** frozen rubric maintained-state correctness and transfer to executable Python/cost; missing executable evidence for the official boundary is a required fix. Owner action: provide a recursion-safe canonical implementation (or an explicitly justified limit-safe strategy), update displayed/embedded/downloaded parity, and submit a new candidate for fresh review.

## Scores (0–4, frozen weights)

1. Problem, terms, hand calculation: **3/4** — clear graph/output and a worked cycle-tail result, with a small lower-bound constraint omission.
2. Causal derivation and saved work: **3/4** — baseline, repeated work, low-link merge, strict inequality, counterexample, and reversible frames are present; the step-to-code bridge remains summary-level.
3. Maintained state and correctness: **1/4** — invariant and trace are coherent on presets, but canonical recursion fails a valid deep-path boundary.
4. Interaction and visual meaning: **3/4** — prediction/reveal, preset traces, End/Previous/Reset, and retained frame values are observable; custom-input transfer is unavailable and the trace is simulation-only.
5. Transfer to Python and cost: **1/4** — source parity and ordinary cases pass, but the advertised Python callable fails at recursion depth far below the official 10^5 constraint.
6. Bilingual and device access: **3/4** — English/Chinese reasoning is materially aligned; keyboard, 320/390/desktop widths, 200% zoom, and screenshots were checked, with no horizontal overflow observed.

Weighted score: **57.5/100**. The open required recursion finding prevents acceptance regardless of score.

## Conclusion

Outcome: **changes required**. The lesson is independently understandable on its small worked examples and its controls are usable, but the frozen candidate cannot be accepted until `L1192-R1-RECURSION` is fixed in a new revision and re-reviewed with the deep-path executable check.
