# #188 author brief — 2026-10-18

Reuse verdict: build one local lesson using the approved five-part shell from
specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication.
Audience: university / computing, readers who know arrays, loops and max.
Job: derive maximum profit with a limited number of sequential trades, then
implement the verified Python interface. No submission/acceptance claim.
Website-design skill applied; the existing design gate is reused as authorized.

Official source: https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/
Public GraphQL GET on 2026-10-18 returned statement and actual codeSnippets;
tests/evidence/official-graphql.json preserves the response. Direct requests to
the HTML URL returned 403 (capture retained); browser-backed web reading and
public GraphQL succeeded. Python3 selector: class Solution,
maxProfit(self, k: int, prices: list[int]) -> int. Python is the preferred faithful
interface. k=1..100, n=1..1000, prices=0..1000. At most k trades; sell before
buying again; no fee/cooldown; no date reconstruction requested. Empty input and
k=0 are outside official constraints, supported defensively. Official examples:
k=2,[2,4,1] =>2; k=2,[3,2,6,5,0,3]=>7.

Learning loop: calculate [2,5,1,4] with k=1 then k=2 → inspect the repeated
future choices → derive budget-indexed cash states → rewind daily transitions
and retain a prefix ledger → predict a fresh state → map to Python and proof.
Five sections suit these five distinct tasks; no universal visualization layer.

| Step | Already known | Single question | Input / wanted quantity | Action / observation | Conditions |
|---|---|---|---|---|---|
|0|buy then sell|What does the budget change?|[2,5,1,4], k / max profit|Hand-compute k=1:3, k=2:6; read counterexample|one share, at most k|
|1|cash receipts minus payments|Which past histories can be merged?|same prices / h[t],c[t]|Follow values at 2,5,1,4; compare old and candidate|same holding status and remaining budget|
|2|h[t],c[t] meanings|Why does each daily maximum change?|preset prices,k / all daily maxima|Advance one day, compare old/candidate/new; rewind or change preset (resets)|complete small simulation, at most 6 days and k<=3|
|3|budget-state invariant|Can a positive holding cash still be improved?|fresh [1,4,2], k=2 then price 5 / c[2]|choose, reveal, change clears feedback|yesterday's states only|
|4|all transitions|Why is the result optimal and implementable?|canonical source / proof, costs|inspect, copy, download; follow code names|official limits; no acceptance assertion|

Terminology dependency / first appearance: step0 transaction=buy followed by
sell, profit=sales minus purchases; budget k=maximum completed trades. Step1
cash=receipts minus payments excluding held share; flat=no share; prefix=days
already processed; h[t]=greatest holding cash with at most t buys;
c[t]=greatest flat cash with at most t completed trades; invariant=meaning
preserved after every day. Step2 repeats state definitions locally. Step3 repeats
them in its standalone exercise. Step4 repeats the invariant and all symbols.

Simulation: browser JavaScript evaluates the recurrence, not the Python submission.
One frame is a completed day; day zero is before any prices. All candidates use
previous-day snapshots. Full ledger retains day 0..current day, no omitted frames.
Solution stores two O(k) arrays plus snapshots; tutorial stores O(nk) frames.
All displayed states are maxima of potentially different histories, not one path.

Token contract: exact shared --bg #0d1117, --panel #161b22, --panel2 #1c2330,
--line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff,
--accent2 #ffb454, --good #7ee2a8, --bad #ff7a93; system font and inherited
sizes/spacing/radii. Local overrides reuse #123 accessibility/geometry rules:
48px controls, 3px focus offset 4px, readable disabled states, 1-column phone
cards, horizontally scrollable labeled ledger. No new color literals or motion.

P0 / highest return: causal examples, budget-indexed old/new cards and ledger,
full bilingual states, canonical source parity, independent numerical oracle,
real browser boundaries/keyboard/layout/contrast and metadata preflight.
P1: related deep links to existing stock and DP explanations. P2: none.
Deferred: automatic animation (no need), arbitrary input editor (presets isolate
one variable), unlimited-trade shortcut (O(nk) already fits 100000 state updates),
shared registry/concept-map registration (outside author ownership), deployment,
independent acceptance and actual learner evidence (separate authorized runs).
States: initial / intermediate / endpoint, preset reset, unanswered / chosen /
revealed / changed answer, copy success / denied fallback, locale and storage denial.
No loading/reconnect branch: static local assets only. Locale preserves all state.
