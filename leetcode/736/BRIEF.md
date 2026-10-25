# #736 · Parse Lisp Expression — author brief

Product verdict: reuse the adjudicated bilingual lesson pattern from
specs/reviews/leetcode-all-hard-design-review.md. Category computing; stage university.
Reader knows Python functions and dictionaries. Outcome: parse one expression and explain
why sequential bindings and nested scope require different lifetimes. No new shared UI.
Design skill: /home/songyy/Documents/agent-skills/website-design/SKILL.md.

Chinese title is an authored translation, not a separately verified official Chinese title.

Official verification: 2026-10-25, https://leetcode.com/problems/parse-lisp-expression/.
Public GraphQL GET succeeded; complete content and observed language snippets are in
provenance/official-graphql.json (with URL and UTC date). Direct curl page hit a challenge;
provenance/official-page.html preserves that failure. Public statement was also readable
via web retrieval. Python3 is explicitly offered: Solution.evaluate(self, expression: str)
-> int. Prefer Python. Valid expressions only, length 1..2000; single separating spaces,
no outer whitespace; integer intermediate/results fit signed 32-bit. Negative integers,
lowercase/digit names, reserved add/mult/let, sequential assignments, innermost lookup.
All three official examples retained as presets (14, 2, 5). No mutation or invalid-input
handling required; no general Lisp/eval support.

Learning loop: hand-evaluate (let x 2 (add (let x 5 x) x)) = 7 → copied dictionaries
baseline → per-name binding stacks → reversible parse events → fresh prediction → Python.

## Exact tokens and scope
Reuse ../style.css: --bg #0d1117, --panel #161b22, --panel2 #1c2330,
--line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff,
--accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Local CSS uses these values only.
Shared system font stack, line-height 1.75, heading scales, 8px controls and 14px stages;
16/24px gutters; controls >=48px; disabled opacity 1; focus 3px accent2, offset 4px.
No added animation, images, dependency, or service.

|Step|Already knows|Single question|Input → wanted|Action → observation|Conditions|
|---|---|---|---|---|---|
|0|Integer arithmetic|Which x is used?|Tiny nested let → 7|Hand ledger: child returns 5, sibling reads 2|Legal grammar, nearest binding|
|1|Dictionary lookup|How can scopes be isolated?|Same input → copied environment|Inspect baseline and global-map counterexample|Copies correct but can repeat work|
|2|Nested scopes|What must survive return?|Preset → tokens, calls, bindings, result|Step/back/reset/end; compare before/after stacks and history|Complete snapshots, all events, JS simulation|
|3|Binding lifetimes|Does a reassignment see its prior value?|Fresh expression → final integer|Predict, reveal, change clears feedback|Independent quiz; locale preserves all state|
|4|Parser state|Why does the code work and what does it cost?|Python callable → result|View/copy/download exact source|Official valid inputs, expected hash operations|

First-use table: expression = one integer-producing unit (0); scope = region where a
binding is visible (0, repeated 2/4); token = parenthesis or word/number (1/2/4);
environment = name/value table (1); stack = values ordered oldest to newest (2/4);
shadow = newer binding hides older (2); cursor i = next token index, zero-based (2/4);
invariant = preserved fact (2). All locally redefined when jumping steps.

Baseline: independently parse nested lists, recursively evaluate with copied dictionaries
per let. O(n²) conservative worst-case time/space, n=input character length, because
nested lets can repeatedly copy growing environments. Canonical: tokenize once; one
stack per name; record each let's assigned names; pop reverse-order on return. Expected
O(n) time and O(n) space including tokens/recursion, assuming bounded 32-bit arithmetic.
Hashing scanned token text totals O(n). Trace stores deep snapshots, can take O(n²),
not canonical memory. No trace omissions. Frames after listed events; enter is after
consuming '(' and operator, leave is after consuming ')' and undoing that let's bindings.
Calls show still-active parent expressions, not Python variable names. Parent state
remains while child returns; sibling begins at the returned cursor. Actual code uses
explicit pops, not a claim that returning a recursive function magically restores maps.

Invariant: at eval entry cursor points to one complete next expression; it returns its
value and leaves cursor immediately after it, with preexisting binding stacks restored.
Inside let, tops include all completed assignments in that let. RHS evaluated before
push; repeated names get separate pushes; reverse pops restore old tops. Atoms consume
one token; add/mult consume two complete children then ')'; let consumes pairs and one
final expression (a name followed by ')' is final). These smaller children and finite
tokens establish termination; induction gives value/scope correctness.

P0: causal flow, correct Python, local renderer, both locales, reversible state, source
parity, numerical/browser checks. Highest-return slice: visible [2,5] → [2] on child
return followed by sibling lookup 2. P1: focused screenshots and reproducible evidence.
P2: none. Deferred: freeform editor (grammar/error UI), autoplay (no added evidence),
shared framework/registration/deployment (outside author scope). Static page has no
loading/reconnect/auth states. Quiz unselected/selected/revealed/changed, trace endpoints,
copy success/manual fallback, blocked locale storage are applicable bilingual branches.

Author self-check only. Independent review, novice outcomes, actual LeetCode submission,
real devices and deployment remain unclaimed and pending their own workflows.
