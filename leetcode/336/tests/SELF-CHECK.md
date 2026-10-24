# Author self-check — candidate 336-author-v1

Status: complete author candidate, ready for a separate independent review. This is not independent acceptance, a learner result, a LeetCode submission receipt, registration or publication. Scope: only leetcode/336/. Preview used: http://127.0.0.1:18770/leetcode/336/ (existing server). Official public statement and Python3 interface evidence: ../provenance/official.json and ../provenance/README.md. Artifact identity: evidence/candidate-manifest.json.

## Implemented learning path

1. The hand calculation distinguishes slls from llss, and index pairs from returned strings. The all-pairs baseline makes the repeated character comparisons concrete. Whole-word reversal misses the same unequal-length example.
2. Outside cancellation derives the two possible middle remainders. The lls insertion example names the exact remainder at root, s, sl and sll; end and pal are defined before use. The search invariant follows from those paths.
3. aab gives explicit prefix/suffix flags and odd/even radii. The abacaba mirror example shows the reused radius 2. The explanation covers both an interior mirrored mismatch and clipping at the known frontier, then derives the linear bound and why maximal radii suffice for boundaries.
4. The reversible simulation shows the actual prebuilt path/end/pal data, current query and cut, local palindrome flag, emitted-pair ledger and retained event history. It explicitly distinguishes direct simulator checks from the executed Python preprocessing. All events are retained.
5. The fresh ab/aba/ba exercise requires the remaining-middle rule. All answers have been selected and revealed in both languages; changing selection hides stale feedback. It explains exactly which pair each distractor misses.
6. Named code mappings cover pre[k+1], suf[k], terminal checks and Python for-else. Completeness, duplicate exclusion, unique-word output bound, empty word/root terminal, no-match, costs and source controls are visible.

These are author observations about content and controls, not claims that a novice has learned the algorithm. Both translations were checked for equivalent ordered-pair direction, remainder type, terminal timing and complexity assumptions; representative rendered branches are retained in browser-results.json.

## Executed checks

From repository root:

- `python3 -B leetcode/336/tests/test_solution.py` — PASS: 2647 real-Python solution cases against an independently derived virtual-concatenation/two-pointer oracle; 1023 exhaustive palindrome-flag words, additional length-300 flags; 18168 actual canonical trie-node invariants. Includes all official examples, unique-word subsets, seeded random cases, [""], no matches, a dense 301-word same-letter family, and 5000 words each length 300 with independently known zero pairs. Duplicate outputs and input mutation rejected. Source mirror exact.
- `node leetcode/336/tests/test_core.cjs` — PASS: 433 simulator cases, 39866 event snapshots, every node candidate invariant, consumed-prefix/path equality, local flags, every output delta and final answer against independent pair enumeration.
- `node leetcode/336/tests/browser.cjs` — PASS on actual Chromium. Both locales × all six presets, every forward event, terminal disablement, backward replay and reset, event slider, all prediction options and revealed state, changed-answer clearing, locale state/focus preservation, exact displayed/copied/downloaded source, actual clipboard read-back and forced-denial manual fallback, recovery to clipboard success, keyboard Enter/Tab/ArrowRight and 3px focus, blocked localStorage, file:// offline loading, all local/related anchors, sticky navigation landing, console/network errors, 320/390/736/1440 widths and CSS zoom 200% at 780px viewport. AST localization-key check detects duplicate definitions before evaluation. Every runtime request stayed on the preview origin. Results: evidence/browser-results.json.
- `python3 -B scripts/register_leetcode_lesson.py 336 --validate-only` — PASS, exit 0, no stdout/stderr. Executed from repository root. Metadata complexity is one nonempty time-and-space string. Before/after hashes of metadata, collection registry, root registry, collection HTML and concept map are unchanged. Command/result: evidence/metadata-preflight.json. No registration command ran.

Every evidence-producing test accepts LESSON_OUTPUT_DIR; see README.md. Re-running with a separate directory does not change this candidate. No shared files were edited.

## Visual inspection and accessibility

Author opened all 22 saved browser screenshots: controls and populated search states in both locales at 320/390/736/1440 widths, narrow table scroll on both sides, and 200% zoom. Readouts wrap, controls retain their labels, word tokens keep their index association, and ledger pairs remain visible. Tables intentionally scroll horizontally on phones, retain column headers, accept keyboard focus, and have localized accessible names. The current path also appears in the event sentence, so horizontally scrolling metadata retains its meaning. The final active node is vertically visible at narrow widths and zoom; automated geometry assertions supplement screenshot inspection.

During author inspection an offscreen current tree row was found. The final candidate scrolls only the table to reveal the active path, with scaled geometry on zoom/resize; final browser rerun and screenshots passed. History's event header was widened to prevent letter-by-letter wrapping. The first browser harness used a fixed wait during smooth anchor scrolling; the final test waits for the actual settled target geometry. These are author iterations, not independent review findings or closures.

Combined shipped CSS: 11661 uncompressed bytes (shared plus local), below 25000. No images, fonts or external runtime assets. Actual rendered contrast ratios: body 16.09:1, stage text 14.70:1, muted hint 7.74:1, disabled control text 6.45:1, table header 7.08:1, selected-language text 13.10:1, focus orange against panel 9.81:1. Core text exceeds 7:1; disabled text passes AA. Explicit word/node markers and sentences carry state in addition to color. No ambient animation or timers; inherited smooth scroll honors reduced-motion preference.

## Limits

Zoom coverage is CSS zoom in headless Chromium with a resize event, not OS magnification or physical-device testing. Physical phones, real novice comprehension, assistive-technology user studies, public production delivery and successful LeetCode submission are unverified. The independent reviewer must perform the separate cold walkthrough and independent case selection required by specs/leetcode-review-gates.md; no review score is assigned here. Canonical Python uses expected constant-time dictionaries, and its output-size linear bound depends on the official uniqueness constraint. Simulator history storage is deliberately larger than submission auxiliary memory.
