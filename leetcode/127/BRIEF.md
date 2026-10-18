# #127 Word Ladder — author brief

Reuse verdict: extend the existing collection lesson, for a reader who knows Python loops, sets and queues. Category computing / collection LeetCode; stage university. Follow the approved pattern and dispatcher adjudication in specs/reviews/leetcode-all-hard-design-review.md. No new product/layout or independent acceptance is claimed.

Learning loop: calculate aa → ab → bb, inspect a FIFO search ledger, derive first-discovery distance, predict a fresh case, map to executable Python. Five sections fit this causal sequence.

Official verification: 2026-10-18, https://leetcode.com/problems/word-ladder/ and public GET https://leetcode.com/graphql/. Raw question content and complete codeSnippets are in provenance/graphql.json. Python3 selector explicitly supplies Solution.ladderLength(self, beginWord: str, endWord: str, wordList: list[str]) -> int. Canonical language Python. beginWord need not be listed; every subsequent word including endWord must be listed. Count words, return 0 when unreachable. Width 1..10, dictionary 1..5000 unique lowercase equal-width words, different endpoints. No mutation requirement; implementation leaves input untouched. Empty list and equal endpoints are outside official constraints. Official examples yield 5 and 0. Initial direct HTML GET was 403 (official.html); public GraphQL succeeded without authentication.

## Exact design contract
Use ../style.css and ../common.js. Tokens unchanged: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. Shared system font and typography; 14px stage radius, 8px controls; local 48px controls, 3px accent2 focus. Spacing uses shared 8/10/12/14/16/20/24 scale. No motion or external assets. Disabled states retain opacity 1. No new palette.

## Steps (five required fields each)
1. Known: one-letter edits. Question: what is counted? Input/output: aa, bb, [ab,bb] → 3 words. Action/observation: read numbered route; inspect contract. Conditions: exact one-position difference, dictionary after start.
2. Known: valid chain. Question: how can we search without missing a shorter chain? Input/output: selectable finite word graph → shortest word count. Action/observation: pop one FIFO word; retained layers and history show first discoveries and queue order; back/reset restore snapshots, preset restarts. Conditions: unit-cost edits and equal lengths.
3. Known: search layers. Question: why is first discovery safe and neighbor generation cheaper? Input/output: pop (ab,2) adds (bb,3), used letters replaced position by position. Action/observation: compare permanent distance labels with queue and code. Conditions: enqueue once, FIFO; baseline compares all dictionary pairs. Strictly closer-to-target fails hit→hot→dot→dog→cog because hot and dot are equally far from cog.
4. Known: first-discovery invariant. Question: does a longer second route improve a seen word? Input/output: fresh red→tax dictionary → predicted length. Action/observation: choose then reveal; changing answer clears feedback, locale preserves it. Conditions: all moves cost one; different shortest paths can merge.
5. Known: invariant and neighbor generation. Question: how does it become a valid submission? Input/output: official arguments → int. Action/observation: inspect/copy/download exact canonical Python. Conditions: N dictionary size, L width; expected hash lookup time, Python construction/hash costs; no execution claims for simulation.

## Term dependencies (defined again locally as needed)
Step1: transformation = exactly one changed position; length = number of words.
Step2: graph = words joined by legal edits; queue = first inserted first removed; distance d = smallest word count so far; layer = words with same distance; seen = already enqueued.
Step3: invariant = statement kept after each operation; N/L = dictionary size/word width; candidate = one generated possible replacement.
Step4: rediscovery = a second route to an already queued word.
Step5: deque/popleft = FIFO implementation; auxiliary space excludes input; snapshots are teaching storage.

Simulation: complete tiny traces only, after each pop and all 26L candidates; initial and missing-target terminal frame explicit. Diagram groups discovered words by distance, retains parent and processed/queued text. No omitted operations within frame boundaries; failed candidates grouped in count. Trace is JavaScript simulation, canonical Python is separately executed offline. No server loading/reconnect states apply. Copy success/denial manual fallback, empty queue/unreachable, endpoint disabled states, locale and prediction states are bilingual.

P0: causal lesson, complete local simulation, bilingual/accessibility, verified official contract and executable tests. Highest return: visible discovered layers + queue proving shortest distance. P1: range scrubbing and related anchors. P2: none. Deferred: bidirectional BFS (unnecessary extra proof), automatic animation, custom arbitrary input, accounts, shared framework. User scope forbids editing CONCEPT-MAP; provide local metadata concepts and existing deep links only.

Validation: independent all-pairs/Floyd oracle vs original Python, exhaustive/seeded/boundary/max cases; JS frame distances against separate graph BFS; real-browser controls, locales, clipboard fallback, source parity, narrow/zoom/focus/contrast/local links. All output-producing tests accept OUT_DIR. This is author self-check only; independent review remains pending.
