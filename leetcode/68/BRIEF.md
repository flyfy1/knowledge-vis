# #68 Text Justification — author brief

Category computing; stage university. Reader: basic Python strings/lists and integer division. Product verdict: reuse the approved collection lesson shell under /leetcode/68/, common.js locale and exact shared style.css tokens. Design authority: specs/reviews/leetcode-all-hard-design-review.md and its dispatcher adjudication; no new product/layout review claimed.

Official verification (2026-10-18): https://leetcode.com/problems/text-justification/ and public GET /graphql/ query preserved in tests/official-graphql.json. Python3 selector snippet explicitly gives Solution.fullJustify(self, words: List[str], maxWidth: int) -> List[str]. Statement: preserve word order, pack maximal prefix, distribute gaps evenly with extra spaces on left, last line single gaps + right padding; single-word lines right padding. 1–300 words, word lengths 1–20 <= width, width 1–100; English letters/symbols; no empty input. No wrapping inside words. tests/official-page.html records direct HTTP 403; public GraphQL and web reader succeeded using normal unauthenticated access.

Learning loop: calculate a width-8 line → derive maximal prefix and even gap rule → reversible test/accept/emit simulation → fresh prediction → executable canonical Python and proof. Five sections are enough because packing, spacing, exceptions are separate causal steps within the first two.

## Steps: five required fields

|Step|Already known|Single question|Input → desired quantity|Action → visible observation|Conditions|
|---|---|---|---|---|---|
|0|Strings contain characters|Which words fit?|a bb c dddd, width 8 → first line|Hand calculation 1+2+1+2=6; next needs 11 → a··bb··c|Order fixed; at least one gap|
|1|Chosen line and letter count|Where do remaining spaces go?|L letters, g gaps → gap widths|Compare remainder-left rule, round-robin baseline, final-line exception|Nonfinal multiword only for divmod|
|2|Fit and spacing rules|What changes on each operation?|Preset, adjustable width → snapshots|Next tests candidate, accepts or rejects, emits; previous restores all history; width/preset restarts with notice|Small complete trace, no skipped events; simulation not Python execution|
|3|Maximal prefix and exceptions|Can the rule transfer?|Fresh width-9 case → correct lines|Select before reveal; changing choice clears feedback|Exercise separate from trace; locale preserves all state|
|4|Observed transitions|Why does this implement the contract?|Python source and invariant → reconstructable implementation|Source/copy/download; map fit, divmod, branch to code|Output cost and auxiliary cost include Python materialization|

## First-use terms
Greedy = take the longest fitting next word prefix (0); gap = spaces between adjacent words (0/1); L = sum of word lengths, g = word count minus one, S = width minus L (1, repeated 2); quotient q = base spaces per gap, remainder r = number of left gaps receiving one extra (1, repeated 2); invariant = fact kept true after every accepted word (2/4). Each section restates necessary definitions so deep links work.

## Visual and state contract
Tokens: inherit --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. No added colors. System fonts, shared spacing 8/12/16/20/24/64px and radius 8/14px. 48px controls, disabled opacity 1 using muted on panel2; 3px orange focus, static visuals. Monospace dot representations are character cells, not measured pixels. Width-100 lines scroll inside labeled stage; full plain text remains available. Local CSS plus shared CSS <25k.

Normal/start/end, rejected-candidate, emitted-history, all presets and width changes, quiz pending/revealed/changed, clipboard success/failure, denied storage, EN/ZH all tested. No loading/network/reconnect lifecycle: lesson uses local scripts. Source display uses embedded mirror; clipboard failure exposes selected readonly textarea. Preset/width resets trace only; quiz is independent. Locale preserves state and disclosures.

## Priorities and limits
P0/highest-return slice: accurate packing and visible spaces, exceptions, reversible history, bilingual source transfer, independent oracle and real browser checks. P1: adjustable width for a small counterfactual. P2: none. Deferred animation and arbitrary word editing: distract from deterministic inspection and add unneeded state. No universal renderer, service, external assets or registry changes. Simulation snapshot storage is separate from canonical runtime. Author self-check only; independent review, novice outcomes, LeetCode acceptance and public delivery remain unclaimed.
