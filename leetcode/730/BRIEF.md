# #730 — Count Different Palindromic Subsequences

Author candidate; separate independent lesson review remains pending.

## Product and scope
Reuse the approved lesson contract in specs/reviews/leetcode-all-hard-design-review.md and its dispatcher adjudication. Apply the website-design skill read at /home/songyy/Documents/agent-skills/website-design/SKILL.md. Route: leetcode/730/. Category: leetcode / computing; stage: university. Reader knows Python loops and sets. Immediate job: reconstruct a duplicate-free interval count and predict a new result. Five sections expose quantity → baseline → causal partition and reversible experiment → transfer → implementation. No shared edits, registry changes or deployment.

P0/highest-return slice: explicit string-versus-index counting, earliest/latest proof, accumulated interval table, bilingual state fidelity, executable Python and independent oracle. P1: exact source transfer and related anchors. P2: none. Deferred: animations, arbitrary large browser input and execution backend; no demonstrated need and exponential teaching-set enumeration must stay bounded.

## Verified official contract
Official URL: https://leetcode.com/problems/count-different-palindromic-subsequences/
Accessed 2026-10-25 via public GraphQL, saved in provenance/official.json with timestamp, full statement, selector snippets and metadata. Free Hard algorithm problem. Return distinct nonempty palindrome strings obtainable by deletions, modulo 1,000,000,007. Length 1…1000; alphabet a,b,c,d only. Empty input is not official; empty interior has count zero. Examples: bccb → 6; official long example → 104860361. No mutation requirements or special exceptions. Actual observed Python3 interface: class Solution, countPalindromicSubsequences(self, s: str) -> int. Python is preferred and faithful; no alternate-language contract needed. No submission/acceptance claimed.

## Step contract (five fields per step)
|Step|Already known|Single question|Input → wanted|Action → visible observation|Conditions|
|---|---|---|---|---|---|
|0|Deleting letters preserves order|Do two ways of making bcb count twice?|bccb → distinct strings|Reveal hand list; compare two index triples with one bcb entry|Nonempty string identity, not index identity|
|1|Palindrome and distinct strings|Can enumeration give a reliable small baseline?|same bccb → set of palindrome strings|Read mask baseline and inspect wrong 9 versus correct 6|Exponential baseline only small n|
|2|Baseline deduplicates strings|How do we count without storing strings?|interval [i,j] → D[i][j]|Change preset (explicit restart); advance/back/reset/end; table retains completed counts and current four-group ledger|Only a…d; teaching inputs ≤6; no omitted intervals|
|3|Groups by outer letter and earliest/latest positions|Can that invariant transfer to abaca?|fresh abaca → count|Choose 5/7/6 then reveal; feedback explains all strings; change choice clears feedback|Independent of trace; locale preserves state|
|4|Bottom-up interval dependencies|How does the proof become a submittable method?|s → count modulo M|Inspect source, copy/manual fallback, download|Official Python3 callable, no browser execution claim|

## First-use terms and dependency table
- Step 0: subsequence = delete letters without reordering; palindrome = same forward/backward; distinct = different character string.
- Step 1: mask = binary choice of retained indices; set = container retaining each equal string once; enumerate = inspect every choice. Cost defined with n as length.
- Step 2, locally redefine: interval [i,j] includes both zero-based endpoints; D counts distinct nonempty palindrome strings; outer letter c is first/last letter; L/R earliest/latest c in that interval; interior excludes those positions. Dynamic programming reuses smaller-interval answers. Modulo keeps remainder, not the exact large count.
- Step 3: locally restate group/invariant for direct navigation; fresh input not an experiment preset.
- Step 4: next_pos/prev_pos are occurrence lookup tables; n absent sentinel / -1 absent sentinel; D maps to dp; M defines modulus.

## Derivation and invariant
bccb has two index choices for bcb but only one string. With outer b at L=0,R=3: b,bb plus b+c+b and b+cc+b; with outer c: c,cc. Groups cannot overlap because different first letters differ. Any longer c…c can use earliest and latest c instead of its old endpoints; its middle remains within them. Conversely wrapping each nonempty interior palindrome is legal and injective, and single c / double cc are distinct from those wraps. Absent c contributes 0; one occurrence contributes 1; two or more contribute 2+D[L+1][R-1]. Sum over a…d. Interior length is strictly smaller; filling increasing interval length establishes invariant: every completed cell is its true count modulo M. Empty interior contributes 0, not a counted empty palindrome. Precompute earliest at/after each i and latest at/before each j in O(4n); each interval inspects four letters O(4n²)=O(n²) time, O(n²) space. Tutorial stores small full history and exact string lists separately; not submission storage.

## Exact reused tokens and states
Shared style.css palette unchanged: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. Inherit system font stack, 1.75 line height, shared clamp headings, 8/14px control/panel radii, shared spacing. Local overrides only restore 48px control height, opaque disabled content, focus, table scrolling and layout. No motion or new palette. Static diagram has textual cell labels and four-group ledger.
EN/zh states: hand hidden/revealed; trace initial/middle/end, every preset, rewind/reset; prediction unselected/selected/revealed/right/wrong/changed; code closed/open, copy success/manual fallback; locale and unavailable storage. No network data load, loading, reconnect or timer exists. Language changes preserve input, step, prediction, disclosure and focus. Official captures are review-only. Numerical trace is a JavaScript simulation, never execution of submission Python.

## Validation plan
Independent masks oracle for exhaustive/seeded small inputs, every interval and outer-letter partition; different endpoint-subtraction recurrence for large tests plus all-identical closed form and official examples. Execute canonical Python. Browser checks both locales, presets/endpoints/history/prediction/fallback/native clipboard/source/download, narrow and desktop/200% zoom, keyboard, offline/local errors, contrast. Output directory overridable via OUTPUT_DIR. Inspect produced populated screenshots. Run required non-mutating preflight from root. Record only author self-checks; independent review, actual learner outcomes and public delivery remain pending/unverified.
