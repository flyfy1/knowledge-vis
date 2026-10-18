# #123 Best Time to Buy and Sell Stock III — author brief

Reuse verdict: approved LeetCode lesson shell, per specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication. Category computing / collection leetcode; stage university. Reader knows lists, loops and maximum. Job: reconstruct a two-transaction algorithm, predict a fresh transition, implement Python.

Official contract verified 2026-10-18 via public GraphQL. tests/evidence/official.json retains the complete response, dated source, statement and language selector/templates. Python3: Solution.maxProfit(self, prices: list[int]) -> int. n=1..100000, prices=0..100000. At most two trades; sell before buying again; no simultaneous holdings. Official examples return 6,4,0. No fees/cooldown/mutation requirement. Empty input is outside official constraints (defensively returns 0). No submission or acceptance claimed.

## Learning loop

| Step | Known | Single question | Input → output | Action → observation | Conditions |
|---|---|---|---|---|---|
| 0 | Subtraction | What are two legal trades worth? | [2,5,1,4] → 6 | Hand calculate 3+3; compare largest single 3 | One held share, ordered buys/sells |
| 1 | Legal trades | Which past distinctions affect tomorrow? | Same prices → four cash summaries | Compare day 2 and day 3; see positive holding cash 2 | At most budgets, no fee/cooldown |
| 2 | Cash summaries | What does one day change? | Fixed small presets → daily states | Advance/back/reset/seek; inspect old/candidate/new and retained rows | All reads from previous day; full bounded trace |
| 3 | Sufficient summary invariant | Can the second holding cash be positive? | Fresh [4,9,2,8] → day 3 h2 | Choose, reveal, change; see why 3 is legal | Cash excludes value of held share |
| 4 | Recurrence | Why can four numbers replace histories? | Official list → Python integer | Source/copy/download; relate tuple assignments to table | O(n) time O(1) auxiliary |

## Dependencies and local definitions

Step 0 transaction=one buy then one sell; profit=sum of sale minus purchase; days one-based for teaching. Step 1 cash=net receipts less payments, excluding held stock. State=best cash for a prefix under a holding/budget condition. h1/h2=holding with at most 1/2 buys, s1/s2=flat with at most 1/2 completed trades. Budget means a maximum, not exactly that many actions. -∞=unreachable, not a large loss. These definitions are repeated locally in steps 2–4. Step 4 invariant=claim true after every processed prefix; no new data structure.

Baseline: enumerate ordered buy/sell quadruples and singles; O(n^4) time, O(1) extra. Oracle independently enumerates legal action paths including skip at every day, and checks every intermediate prefix/state. Wrong rule take two largest daily rises: [1,3,2,4,3,5] chooses 2+2=4, but merge across one dip: (4-1)+(5-3)=5.

## Exact token / state contract

Shared CSS and common.js unchanged. Colors bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. Shared system font, line-height 1.75, 1000/952px content, 8/14px radii; no motion/shadows/new palette. Local controls >=48px; disabled opacity 1; muted border; 3px accent2 outline with 4px gap; solid sticky nav. Ledger contained horizontal scroll preserves headings.

Both languages cover initialization, intermediate, terminal, changed preset (lab reset only), backward/seek/reset, unchosen/chosen/revealed/changed prediction, copy success/manual fallback. Locale preserves all state, focus and source disclosure. Storage denial handled by common.js. Network/loading/reconnect inapplicable: static offline assets, no runtime fetch or backend. No custom editable data to discard.

Simulation: JS derives all daily snapshots for presets of <=8 prices; not execution of Python. Ledger history and snapshots O(n) tutorial space; canonical Python four states O(1). No events omitted. Predictions independent of lab.

P0 / highest-return 20%: vivid hand cash calculation, old/candidate/new ledger, correct bilingual invariant and exact canonical source. P1: exhaustive/state-oracle and actual browser/accessibility evidence. P2: none. Deferred: editor/playback (unnecessary trace volume/lifecycle), registry/concept-map changes (dispatcher ownership), release and independent review (separate runs), learner-effectiveness claims (no learner study). Related anchors checked locally. Author self-check evidence is not independent acceptance.
