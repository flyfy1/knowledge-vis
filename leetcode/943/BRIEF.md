# #943 · Find the Shortest Superstring

Author run, candidate r1. Independent problem review: pending; no acceptance, submission or publication claimed. Changes owned only by this folder. Product/design authority: `specs/reviews/leetcode-all-hard-design-review.md` and its dispatcher adjudication; reused shared lesson layout, no new platform or layout. Website-design skill read at `/home/songyy/Documents/agent-skills/website-design/SKILL.md`.

## Product and scope
Category leetcode / computing; stage university. Reader: understands strings, loops and minimums, learning subset DP. Job: reconstruct a shortest superstring, including why remembering only a set is insufficient. Highest-return slice: concrete overlap → order baseline → subset + endpoint invariant → reversible candidate ledger → fresh prediction → canonical Python. P0: bilingual causal explanation, complete small trace, source fidelity, independent numerical oracle and browser self-checks. P1: reconstruction ledger and precise related links. P2: none. Deferred: arbitrary text input (bounded complete presets keep exponential teaching work predictable), autoplay (manual reversible steps suffice), publication and separate independent review (outside author authority).

## Verified official contract
Official URL: https://leetcode.com/problems/find-the-shortest-superstring/ . Accessed 2026-10-26 through public page and public GraphQL; full response in tests/evidence/official.json. Return any minimum-length string containing every word as a contiguous substring. Unique lowercase words, 1≤n≤12, 1≤length≤20, no word is a substring of another. Empty lists, duplicate and contained words are outside the contract. Official examples have lengths 17 and 16. Observed Python3 snippet: `class Solution: def shortestSuperstring(self, words: list[str]) -> str`. Python is the preferred faithful interface. No non-Python exception needed.

## Teaching loop and step fields
|Step|Already known|Single question|Input → desired quantity|Action → observation|Conditions|
|---|---|---|---|---|---|
|0|Contiguous text|How can ab and bc share a character?|ab,bc → shortest containing string|Reveal/hide hand calculation → shared b and length 3|Suffix-prefix overlap, not subsequence|
|1|Overlap saves length|Why not just take the largest overlap?|Four specified words → globally shortest order|Read explicit counterexample and executable permutation baseline|Official no-containment guarantee makes order reduction valid|
|2|Orders and saved length|Which earlier orders have identical futures?|Selected subset + last word → minimum length|Preset resets; advance/back/reset/end → accumulated completed cells, candidate vs best, final reconstruction|Small complete presets, each candidate comparison is one frame; ties retain first predecessor|
|3|State invariant|Can two endings be collapsed?|Fresh ab,bc,bd → length ending bd|Choose then reveal; change clears feedback → need endpoint-specific source|Fresh exercise independent from trace reset|
|4|Proved recurrence|How do we submit and account for cost?|Official words → canonical Python string|Read/copy/download exact source, fallback selection|Simulation is local JS, not Python execution; official bounds only|

## Terminology, dependency and local definitions
Step 0: substring = consecutive characters; overlap = suffix equal to next prefix, maximum length saved. Step 1 repeats overlap, defines permutation/order and factorial baseline. Step 2 redefines subset/mask (bit i selects word i), endpoint (last selected word), DP (store best smaller answers), unreachable (dash), candidate (one predecessor), settled (all predecessors tested), parent (chosen predecessor for reconstruction). Step 3 repeats subset/endpoint/minimum length locally. Step 4 repeats n and L and maps overlap, dp, parent, mask and join to code. No undefined technical term is required to operate a control.

## Mathematical contract
Every official word can be sorted by occurrence start in a containing string; non-containment makes ends increase too. Consecutive occurrence distances bound how much their suffix/prefix can overlap. Max-overlap merging in that order gives a legal string no longer than the original. Thus some optimum is an ordered chain of all words. DP minimizes chain length for a selected subset and endpoint, not the set of all incidentally contained words. Removing the last word yields a feasible smaller chain, whose cost is at least the smaller optimum; extending an optimal smaller chain attains the recurrence bound. Ties are legal. Reconstruction follows parents and appends only nonoverlapping suffixes.

## Simulation/state contract
Preset input n≤4; all candidate comparisons retained, no skipped transitions. Initial frame has all singletons settled, others unknown. Frames occur after testing one predecessor; last predecessor settles target. Cumulative ledger retains tested transitions. Table marks source and target textually; target best is separately identified from current candidate. End frame additionally shows the reconstructed optimal chain and appended suffixes. Rewind is full snapshot restoration. Locale preserves preset, index, choice, reveal and disclosure. Preset/trace reset does not erase independent prediction. No timer/loading/network state: data and source local. Copy has success/manual fallback states, both localized.

## Exact tokens and layout
Import ../style.css unchanged. Reuse --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Existing system font stack and type hierarchy; local geometry only: controls 48px, 8px radius, 3px focus with 4px offset, 8/12/16/20/24 spacing. No new color literals, shadow or animation. Table can scroll horizontally with caption, focus and headers. Source scrolls independently. Disabled opacity restored to 1. Shared + local CSS below 25KB.

## Checks / freeze
Author self-check only; actual checks, commands, candidate hashes and remaining limits are recorded in SELF-CHECK.md and tests/evidence. Browser: Chromium on Linux, synthetic viewports and zoom, no physical device/novice or production evidence. Independent review remains a separate next step. Metadata preflight must pass before ready; metadata changes would create a new candidate rather than modifying prior acceptance.

## Frozen author handoff
Candidate r1: self-checks complete, independent review pending. Canonical Python, JS trace, bilingual browser suite and non-mutating metadata preflight passed. See SELF-CHECK.md and tests/evidence/candidate.json for exact scope and identities. No independent acceptance, registry change, publication or submission is asserted.
