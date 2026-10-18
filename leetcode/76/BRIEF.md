# #76 · Minimum Window Substring — author brief

## Contract and product fit
Reuse the approved LeetCode lesson shell and controls, under the product/design review and dispatcher adjudication in `specs/reviews/leetcode-all-hard-design-review.md` (D3, D6, D8). Website-design skill read on 2026-10-18. Verdict: build one local lesson, no shared framework or registry edits. Category: computing / algorithms; stage: university. Reader knows strings, indexing, loops and dictionaries. Job: derive, implement and check a minimum covering substring, with duplicates. Output: a reconstructable Python sliding-window solution plus a reversible teaching simulation and a transfer question. No independent acceptance or learner results claimed.

Official source: https://leetcode.com/problems/minimum-window-substring/ ; public GraphQL response saved in official-evidence.json, accessed 2026-10-18. Verified Hard/free, contiguous substring, repeated characters required, unique answer on official tests, empty string if impossible, case-sensitive English letters, both lengths 1..100000. Examples: ADOBECODEBANC/ABC → BANC; a/a → a; a/aa → empty. Observed Python3 selector snippet: `class Solution: def minWindow(self, s: str, t: str) -> str`. Python canonical; no language exception. Inputs not mutated. Empty inputs outside constraints get a defensive empty return.

## Learning loop and five sections
Each section begins with its one concrete question. The same ABAAC/AAC case connects hand work to counting and tracing. The distinct-set mistake is exposed with AC/AAC. Extra A in AAAC/AAC isolates surplus.

| Step | Already known | Single question | Input → desired quantity | Action → visible observation | Conditions |
|---|---|---|---|---|---|
| 0 | Indexed strings | Which contiguous piece supplies every requested copy? | ABAAC, AAC → shortest substring | Read explicit windows [0,4], [1,4], [2,4], [3,4] and baseline | Counts, not order; case-sensitive; nonempty official inputs |
| 1 | Validity by counts | Which count changes when one endpoint moves? | Same input → missing copies | Compare A counts 1→2→3 and removal 3→2→1; derive missing | Only crossing required count changes missing |
| 2 | Missing=0 means valid | How far can we shrink safely? | Preset or bounded custom strings → complete trace | Expand, check, remove; rewind/reset/scrub → visible indexed window, count table, entire event ledger and best-so-far | Frames describe just-completed atomic operation; no omitted events; preset restarts only trace |
| 3 | Removal can break coverage | After removing a surplus A, are we still valid? | Fresh AABBC / ABC → next action | Choose then reveal; change clears feedback; locale preserves choice and reveal | independent fixed question; all distractors explained |
| 4 | Shortest valid start for each right endpoint | Why do discarded starts never need revisiting? | Trace → canonical Python | Map expand/check/remove snippets; inspect/copy/download exact source | Coverage monotone under expansion and fails under excess shrinking; prior discarded starts cannot improve later |

## Terms / dependencies at first use
Step 0: substring = contiguous slice, window = candidate slice, indices = zero-based positions, cover = at least the requested count for every character. Step 1 repeats cover; need[c] requested count; have[c] current count; missing sum of positive deficits; surplus means copies beyond need. Step 2 repeats all state definitions locally, [left,right] inclusive, right=-1 empty sentinel, best=shortest candidate seen; operation ledger names exact completed events. Step 3 repeats missing and coverage. Step 4 repeats count invariant and defines m,n,k for costs. No undefined data-structure terminology is required.

## Simulation and state contract
Browser model is a deterministic JS simulation, not Python execution. Small teaching input limit s,t 1..18 English letters; official solution handles 100000. No fetch, timer, loading or reconnect state. Trace has initial, expand, check-best, remove and terminal frames, all deep snapshots; checked candidates retain best-so-far, but removal may make current window invalid. Ledger includes every event through the selected frame. Reset restores empty frame; back restores all values. New valid custom input explicitly restarts trace; invalid input preserves it. Locale, prediction and disclosure independent. Clipboard failure provides selected readonly source. Storage failure uses existing locale fallback.

## Exact visual contract
Reuse `../style.css` and `../common.js`. Palette exactly: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. No new colors. Text, focus, disabled and borders measured; local controls ≥48px and disabled opacity 1. System font stack, inherited type sizes/line-height 1.75; inherited max-width 1000/952px, 24/16px gutters, 8/14px radii; local gaps 8/12/16px. Cells fixed readable minimum 48px, wrap as indexed tiles; table scrolls locally. Local CSS plus shared <25000 bytes. No motion or decoration; 3px accent2 focus with 4px offset; forced-color focus preserved. Language control keeps focus and state.

## Priority and evidence
Highest-return 20%: count thresholds and honest reversible window trace. P0: both locales, causal derivation/proof, oracle/invariants, real browser controls, source parity, responsive/zoom/focus/contrast. P1: bounded custom input for a learner-selected counterexample, same controls/state contract. P2: none. Deferred: universal visualizer, auto-play, browser Python runtime, registry/deployment (ownership boundary), learner mastery claims (no measured learners).

Self-check artifacts and rerunnable tests live in tests/. Test emitters honor OUTPUT_DIR. Independent slice-enumeration oracle checks Python; JS trace checked per event against recomputed counts, deficits and candidate minima. Browser exercise includes locales/presets/endpoints/predictions/clipboard/storage/mobile/zoom/offline source/deep links. Real device, public delivery, LeetCode acceptance and independent review remain unverified.
