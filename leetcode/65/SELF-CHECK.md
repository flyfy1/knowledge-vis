# #65 author self-check

Status: complete author candidate, **independent review pending**. Author and checks: the same Codex implementation run; exact model identifier unavailable. This report establishes neither independent acceptance, actual learner results, LeetCode judge acceptance, nor production delivery.

Candidate: `/leetcode/65/`, preview `http://127.0.0.1:18770/leetcode/65/`. Official statement and public GraphQL verified 2026-10-18, raw response and timezone-qualified observation date in `tests/official.json`. The selector explicitly offers Python3 and its `Solution.isNumber(self, s: str) -> bool` snippet. Canonical language is Python; no exception contract is needed. All writes in this author run are inside `leetcode/65/`. No registry/shared files, credentials, services, commits, pushes, agents, or deployment actions were used.

## Computational evidence

- `tests/evidence/python-results.json`: 46,484 Python cases passed. Independent split-grammar and full-match regex oracles agree. Includes all 23 listed official valid/invalid strings (including the three numbered examples), exhaustive short strings, seeded random strings, grammar-generated valid cases, maximum-length strings, and defensive out-of-scope boundaries. Calls the actual `Solution().isNumber` interface and checks Boolean returns.
- `tests/evidence/core-results.json`: 44,460 simulation cases and 142,951 intermediate states passed. Prefix legality/completability and flag meanings are checked independently; the first fatal character terminates the trace and leaves the suffix visibly unprocessed. Flags on a rejected character retain the preceding legal prefix's values, matching Python's immediate return.
- Source mirror is exactly the JSON encoding of `solution.py` with the sole `window.PYTHON_SOURCE` assignment. Real browser display, clipboard contents, manual fallback selection and downloaded source match canonical bytes.

## Interaction and visual evidence

`tests/evidence/browser-results.json` records passing actual Chromium checks on the running preview:

- Both locales, every frame of all ten presets, forward/back/forward snapshots and history, reset, disabled endpoints and slider Home/End/arrow keys. Custom valid/invalid/max input; invalid edits preserve the current trace.
- Every prediction option, prediction before explicit reveal, changing selection clears feedback, locale preserves answers/reveal/preset/frame/edited fields/disclosures/focus; unrelated trace changes preserve the quiz.
- Native clipboard success, denied clipboard manual-copy fallback, selected/focused fallback text, recovery and actual browser download parity. Storage denied and offline file opening also work.
- EN/ZH at 320, 390, 736 and 1440 CSS pixels; landscape and 200% CSS zoom with a 320px-equivalent layout. No document/state overflow. The history table intentionally scrolls within its own labeled, keyboard-focusable container; localized instructions explain this.
- Sticky navigation targets clear the nav; both related lesson links resolve to existing `#step1` anchors. Keyboard Enter/Space, 3px visible focus, forced colors, reduced motion and 48px controls are checked. Every preview asset request remains local, with no HTTP/console/page errors.
- Total shipped CSS: 11,887 uncompressed bytes (9,425 shared + 2,462 local). Actual computed contrast ratios: body 16.09:1; explanation 12.62:1; primary action 13.10:1; disabled controls 6.45:1; wrong-answer feedback 6.35:1; correct-answer feedback 10.00:1; focus against panel2 8.94:1. All measured text pairs pass AA; core text exceeds 7:1. Exact pairs are in the browser JSON.

The author visually inspected all 23 screenshots using the six contact sheets, with full-size spot inspection of phone/desktop/zoom states and the rejection cases after the final copy clarification. The exponent ledger shows `digit: true → false` when e starts the new part; the terminal rejection screenshot shows the unprocessed suffix and explains that unchanged flags describe the state before rejection. Text remains readable and wraps; the selected quiz option remains visible alongside revealed correction. Horizontal table overflow is contained and documented, rather than hidden or shrunk.

Self-check corrections: corrected a copied maximum-length exponent example to exactly 20 characters; restored opaque disabled primary styling through a local override after visual inspection; widened the history flag column; clarified flag preservation when a character is rejected. The final browser rerun follows these corrections. No independent reviewer has closed findings or scored this lesson.

## Reproduce and next gate

Commands, environment variables, oracle construction, and evidence locations are in `tests/README.md`. `tests/candidate-sha256.json` identifies the complete candidate and shared dependencies. A separate reviewer should cold-walk the frozen preview before reading this brief/self-check, then apply the six-dimension gates in `specs/leetcode-review-gates.md` with fresh examples.

Remaining unverified: separate independent lesson review, novice teach-back, actual physical mobile/assistive-technology behavior, browser-toolbar zoom, online judge submission, and public delivery. These are not implied by synthetic browser or algorithm checks. Registry/concept-map integration is left to the dispatcher because this author owns only the lesson folder.
