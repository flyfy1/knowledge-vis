# #913 author self-check — 2026-10-26

Status: complete author candidate, independent review pending. Author: Codex;
exact model identifier unavailable. These checks are not separate agent review,
actual learner outcomes, a LeetCode accepted submission, or publication evidence.
Candidate bytes are identified in candidate-hashes.json; checkout base is recorded
there. No commit, registration, deployment or shared-file edits were performed.

## Official contract

Public official page and public GraphQL accessed at 2026-10-26T02:17:33+00:00.
The complete response, supported selectors and Python3 stub are in official.json.
Frontend #913 has internal GraphQL ID 949. Python3 is supported, so the preferred
canonical interface is Solution.catMouseGame(graph: list[list[int]]) -> int.
The official example results are 0 and 1. No paid access was needed.

## Executed checks

From repository root:

- `python3 -B leetcode/913/tests/check.py`: PASS, 833 canonical cases; also executes
  the actual displayed full-scan baseline. Exhaustive valid simple undirected
  graphs for n=3..5, 180 random cases seeded 913, both official examples, dense
  and path n=50, and disconnected input. No input mutation. Literal history
  minimax independently checked every state of 31 tiny graphs against the
  synchronous oracle. Source mirror exact including final newline.
- `node leetcode/913/tests/core.cjs`: PASS, 831 graph simulations, 26,467 frames,
  1,489,043 exit inspections. Every reachable final winner matches the synchronous
  oracle. Intermediate labels are sound and monotone; unproved remaining counters
  exactly exclude processed opponent-winning children; all predecessor edges and
  counter changes are legal; residual reachable draw states have a residual exit
  and no own-winning exit. AST inspection finds 87 unique localization keys,
  every value a nonempty two-language pair.
- `node leetcode/913/tests/browser.cjs`: PASS on real headless Chromium
  156.0.8078.4, Linux host, existing preview http://127.0.0.1:18770. Eight
  preset/locale runs (all four presets in EN and Chinese), every cell at every
  frame for both turn views, rewind/replay, reset/end endpoints, locale roundtrip,
  manual hand-game win/capture/undo/reset. Exercise all prediction choices,
  explicit reveal, stale-feedback clearing on answer change and language-state
  preservation. Prediction and clipboard fallback meanings are distinct.
- Source `textContent`, offline mirror, successful clipboard copy, actual native
  fallback Control+C, and downloaded bytes all equal solution.py exactly. Before
  each locale's fallback, a fresh non-source clipboard sentinel was written and
  read back; only then automatic writes were disabled. No newline conversion
  observed. file:// opening displays embedded source and runs local simulations.
- 320/390/736/1440 widths in both languages, plus 200% CSS zoom at 1280. No
  document overflow. The table intentionally scrolls within its focused region
  at 320; native ArrowRight scroll was observed. All visible button/select/answer
  targets ≥48px. Both selectors' full labels fit at 320 (12 measurements, actual
  computed font, padding and a 24px native-arrow reserve). Keyboard activation,
  3px focus, reduced-motion preference and forced-colors capture exercised.
- Local-only runtime requests, zero page/network errors, unavailable localStorage
  still allows switching languages. Existing related anchors followed with real
  keyboard navigation in both locales. Destination text retained in results.
- Shared + shipped lesson CSS: 11,477 bytes. Rendered contrast: body 16.09:1,
  hint 7.74:1, primary/selected 13.10:1, disabled control 6.45:1, finalized result
  11.97:1, table counter 7.08:1. Focus border exceeds 3:1 adjacent contrast.
- `python3 -B scripts/register_leetcode_lesson.py 913 --validate-only`: PASS,
  exit 0, empty stdout/stderr; record metadata-preflight.json. Complexity is one
  nonempty time-and-space string. No registration ran.

## Visual inspection and meaning

Author opened actual screenshot images, rather than only generating them:
EN 320 trace, Chinese 390 trace, EN desktop trace, both 200% zoom traces,
Chinese hand capture, EN/Chinese narrow and zoom hand graphs, EN tiny-path and
Chinese tiny-capture current-marker tables, prediction and Chinese manual fallback.
Graph IDs, M/C occupants and two-way edges remain separate and legible. Captured
occupants were refined into a second text line within the circle. The table's
winner symbol and current arrow/outline remain visible together. Counter labels
stay below their own values. The 320 table crops horizontally only inside its
scrollable region; the bilingual hint explains scrolling. Sticky navigation in
viewport captures can cover content above the current scroll position; real
navigation clicks separately verified section headings land below it.

Hand calculation observed: (1,2,1) → (3,2,2) → (3,3,1) is cat win; rewind to start
and move to 0 gives mouse win. Tiny capture propagation rules out its sole exit,
r 1→0, proving 2. Official draw preset retains ? throughout propagation and
changes only residual reachable cells to 0 in the final frame. The fresh quiz
(3,2,1) on its five-node graph is 1 because mouse to 1 guarantees hole next turn;
moving to 2 or 4 loses. All three choices' feedback explains exactly that claim
in both languages; full text is in browser-results.json.

Related link semantic audit: #847 step2 introduces endpoint plus visited-set
state and why the endpoint alone loses information, matching the label about
extra state information. #329 step1 derives L(c) from larger neighbors and the
acyclic dependency proof, matching the label about deriving a recurrence from
dependencies. Served anchor content was read and captured in browser-results.
This preview verification does not prove a later public release's availability.

## Findings during authoring, preserved as history

1. The first intermediate test asserted positive remaining for every hypothetical
   unproved product state. This failed at a state with no legal cat move outside
   the reachable game (official example 2 has node 1 linked only to 0). The official
   move guarantee applies to play from the starting state. The canonical answer
   was already correct; the UI was clarified to show × for unreachable cells and
   simulate only reachable states, with this exact distinction beside the trace.
   Every legal child of a reachable nonterminal state is reachable. Canonical
   Python still processes the full product. Revised intermediate checks pass
   without inventing results for outside-contract starting states.
2. The first keyboard-scroll harness expected ArrowRight scrolling at 390 even
   when its table could fit. This was a harness precondition failure. The final
   check uses the established 320 case where actual overflow exists and asserts
   real native scroll movement; it passed. No runtime scrolling hack was added.

These are author fixes/harness corrections, not independently closed findings.

## Review boundary and remaining limits

No actual novice, physical phone, macOS/font environment, screen reader, public
origin or LeetCode judge result was measured. 200% evidence uses CSS zoom in real
Chromium rather than physical display scaling. No independent review score is
assigned. A separate fresh reviewer must cold-walk and audit this frozen candidate
under specs/leetcode-review-gates.md before independent acceptance or release.
