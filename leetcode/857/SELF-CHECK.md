# #857 — author self-check, frozen candidate r1

Author: Codex (exact model identifier unavailable). Independent reviewer/run:
pending. Ready for separate lesson review; no independent acceptance, learner
outcome, LeetCode submission or production delivery claimed. All authored files
are inside leetcode/857. No registration, shared-file edits or deployment.

Official statement and actual Python3 selector are captured in
[official verification](tests/evidence/official-verification.md) and the full
public GraphQL response. Python is the preferred supported official interface.

Actual checks run from repository root:

- `python3 -B leetcode/857/tests/test_solution.py`: PASS, 29,205 exact Fraction
  subset-oracle cases, displayed baseline agreement, input preservation, and
  5 maximum-n checks at n=10000. Includes both official examples, equal thresholds,
  equal qualities, k=1, k=n, single worker and seeded varied rational thresholds.
- `node leetcode/857/tests/test_core.cjs`: PASS, 474 intermediate snapshots over
  all 8 presets plus 100 seeded oracle fixtures. Each checks retained qualities,
  old/add/remove/new sums, eligibility, cost, best cost and attaining identities.
  Exact source mirror (including final newline), copy dictionary pair shape,
  duplicate keys before evaluation and placeholder parity pass.
- `node leetcode/857/tests/browser.cjs`: PASS, actual Chromium 156.0.8078.4 against
  http://127.0.0.1:18770/leetcode/857/. Both languages, all 8 presets and every
  frame, rewind/replay, reset/end disabled controls; all 3 prediction choices,
  reveal/change/reset and locale state preservation; full formula operands and
  candidate/best identity distinction. Both headings match bilingual metadata.
- Browser source display, embedded mirror, download, successful clipboard and
  four native manual-fallback transfers match solution.py exactly. Every fallback
  starts with a fresh verified clipboard sentinel. Host Linux, Control+C.
- 16 populated layout/zoom states: zh/en × 320/390/736/1440 × CSS zoom 1/2.
  Native selector fit measured conservatively including padding and arrow;
  no document overflow or state text clipping. Controls ≥48px, keyboard Enter/Tab,
  3px focus, forced colors, reduced-motion context. Storage denial and file://
  offline initialization pass. Console errors, bad assets and external runtime
  requests all empty. CSS total 10,906 bytes, shared + local.
- `node leetcode/857/tests/visual_supplement.cjs`: PASS, 48 additional completed
  preset-layout states across zh/en and 320/390/1440. Prediction option input/span
  geometry, keyboard locale focus, 120-character and CJK wrapping pass. Dense
  official example and newcomer-removal screenshots retained.
- `python3 -B scripts/register_leetcode_lesson.py 857 --validate-only`: PASS,
  exit 0, empty stdout/stderr, verified no lesson-file changes. Actual invocation
  and timestamp in tests/evidence/preflight.json. Metadata complexity is one
  string covering both time and space. No registration executed.

Contrast helper calibrated to black=0, white=1, primaries=.2126/.7152/.0722,
black/white ratio=21 and #747474-on-black=4.492948073 (correctly fails 4.5).
Measured rendered text ratios range 6.4494 (disabled control) to 16.0870;
focus on panel2=8.9372. All tested text meets AA; most exceeds 7:1 target.
The helper supports solid backgrounds; local nav override removes transparency.
Full colors and unrounded measurements are in browser-results.json.

## Visual inspection and semantic check

Author visually opened screenshots via image tool, including zh desktop header,
en 320 trace, en 320 zoom2 controls, zh 320 zoom2 controls, zh 390 zoom2 members,
en desktop full ledger, en 390 trace, en 320 official-2 dense state, zh 390
newcomer-removal state, and zh 320/en 390 prediction states. Wrapped labels stay
attached to values; active membership has both a border and explicit text.
Official example 2 shows current worker #1 / candidate 40 while best group
[0,2,3] is correctly attached to 30.66667. Newcomer removal shows #2 processed,
retained #0/#1, current bill 9, best 6. Predictive answer 18 remains distinct
from the final quality-minimized candidate 20.

An early main-suite English exercise screenshot had incomplete radio/leading
number paint after forced-colors changes. Fresh-context focused supplement
screenshots show all three radios and complete 14/18/20 labels; measured input
and text rectangles do not overlap. Original capture retained; no runtime
clipping reproduced in settled focused captures. Screenshot count alone is not
used as layout evidence. Initial selector fit defect and test-harness corrections
are retained in tests/evidence/harness-corrections.md.

Related links were keyboard-activated at 320px in each locale. #630 step2 actually
explains adding a course and deleting the longest after overload; #295 step2
explains lower max-heap / upper min-heap boundaries for median maintenance.
Both preview targets returned 200 with existing step2 anchors; target HTML
hashes and rendered destination text are saved. Public release link availability
must be checked by the later release workflow; local preview is the boundary here.

## Evidence limits and next step

These are author checks plus independently derived numerical oracles, not a
separate reviewer. Real phones, browser-chrome zoom, production delivery and
actual novice teach-back remain unverified. Interactive computation is a bounded
JavaScript simulation with full snapshots, separately labeled from the canonical
Python execution. No arbitrary-input editor or server execution is provided.
Next: dispatcher sends candidate.json to a fresh independent reviewer using the
frozen six-dimension rubric and a cold walkthrough before reading this report.
Reproduction commands and OUTPUT_DIR behavior: tests/README.md.
