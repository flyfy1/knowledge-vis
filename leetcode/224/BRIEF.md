# #224 Basic Calculator — author candidate r1

Reuse verdict: build one lesson within the approved collection pattern. Audience: university algorithm learners who know addition, loops and lists. Category computing / collection LeetCode; stage university. Outcome: calculate a nested expression, derive saved contexts, and implement the officially supported Python Solution.calculate(s: str) -> int. Design authority: specs/reviews/leetcode-all-hard-design-review.md and its dispatcher adjudication; no new layout or product scope. Website-design skill applied; independent lesson review remains pending.

Official source: https://leetcode.com/problems/basic-calculator/ accessed 2026-10-18, public GraphQL capture tests/evidence/official.json includes full statement and real codeSnippets selector. Python3 signature verified. Valid string length 1..300000; digits, spaces,+,-,(,); unary - allowed, unary + forbidden; no consecutive operators; signed 32-bit numbers and running calculations; eval forbidden. Empty input invalid; no mutation/rounding/modulus contract.

Learning loop: calculate 8-(3-1)=6 → see why forgetting the outer minus gives 10 → retain contexts → rewind and replay nested/unary/multidigit presets → predict a fresh negative group → map to canonical Python. No learner-outcome claims.

## Steps (five required fields)
|Step|Already knows|Single question|Input → wanted quantity|Action → visible observation|Scope|
|0 Hand work|integer arithmetic|What is 8-(3-1)?|expression → integer 6|read inside-out ledger; compare official examples|valid +,- expressions only|
|1 Derivation|inside-out evaluation|What must survive a parenthesis?|8-(3-1) → outer total/sign|compare 8 + 2 =10 with 8 - 2 =6; read baseline repeated scanning|baseline small inputs, recursion not production|
|2 Reversible trace|total and next sign|How does one scan preserve the context?|preset characters → subtotal, sign, saved pairs|advance/back/range/reset; retained ledger shows exact pre/post values and push/pop; preset restarts trace only|bounded presets, simulation not Python execution|
|3 Transfer|saved pair merge|What does a negative inner group contribute?|fresh 5-(-(2-6)) → integer|choose before reveal; answer change clears feedback; locale preserves state|independent exercise, no trace answer leakage|
|4 Code/proof|all transitions|Why does the final total equal the expression?|state → supported submission|copy/download exact Python; connect each branch to trace|O(n) time, O(d) auxiliary space, no recursion|

## Terms at first use (and redefined locally)
subtotal/total: sum already consumed at current parentheses level (steps 1,2,4); sign: +1/-1 multiplying the next term (1,2,4); context: pair outer subtotal and sign (1,2,4); stack: saved pairs with most recent removed first (1,2,4); invariant: statement preserved after each operation (2,4); n character count and d maximum nesting (4). Character offsets are zero based, number event spans whole digit run; spaces produce no event. Frames are AFTER a complete event and contain deep stack snapshots; no events omitted except explicitly irrelevant spaces. Ledger includes initial and all consumed events. Tutorial snapshots are separate from submission memory.

## Exact tokens and states
Reuse ../style.css tokens verbatim: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. Existing system font/typography/spacing/radii; local 48px controls, 3px accent2 focus, no motion, same borders raised to muted where essential. No assets/fonts. Normal/start/end/back/reset/preset and unrevealed/selected/revealed/changed feedback, copy success/fallback, blocked localStorage all bilingual. Network/loading/reconnect inapplicable to local simulation.

P0 and highest-return 20%: causal subtotal/context ledger, bilingual copy, exact source and oracle/browser verification. P1: range scrubbing and multi-digit/unary presets. P2: none. Deferred: freeform editor and playback (validation complexity and no teaching need); production and independent acceptance (outside author run). Related existing anchors only; shared concept map cannot be edited under ownership.

Verification: reproducible Python AST oracle + baseline, exhaustive/seeded expressions, maximum length/depth; JS frame identities/invariants and Python parity; real Playwright browser matrix and contrast, actual screenshots inspected. Output directories configurable with OUTPUT_DIR. Evidence is self-check only, not independent review, LeetCode acceptance, public deployment, or measured novice learning.
