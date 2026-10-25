# Candidate 1 — author self-check

Status: authored and self-checked; ready for the separate independent review.
This report is not an independent teaching review or LeetCode acceptance.
Scope is only leetcode/960/. No shared registry/assets, campaign status, services,
credentials, Git configuration, commits or deployment were changed.

## Observed results

- `python3 -B leetcode/960/tests/numerical.py`: 7064 cases passed. Independent
  subset/sorted-row oracle, exhaustive binary matrices, 500 seed-960 cases,
  official examples, maximum dimensions, one column, equality, row conflict,
  no input mutation. Displayed baseline code executed on all 500 seeded cases.
  Copy dictionary checked for duplicate keys before parsing and two-string shape;
  canonical source/offline mirror compared without trimming.
- `node leetcode/960/tests/core.cjs`: 4102 cases passed; all ending-column lengths
  checked independently, and every compatibility flag, candidate old/new value,
  and retained valid chain checked. Frames are deep snapshots after whole columns.
- `node leetcode/960/tests/browser.cjs`: pass, 36 recorded state groups and 38
  screenshots; real Chromium using the existing 18789 preview. See browser.json.
  Both locales, all six presets, every frame's dp values independently computed,
  both navigation endpoints, exact rewind/replay, reset, terminal state, hand
  disclosure, every prediction option and changed-answer clearing exercised.
  Language changes preserve trace/selection/reveal state. Independent prediction
  is preserved by trace reset. Keyboard Enter/Tab, 3px focus and forced-colors
  focus, real related-link navigation, blocked storage and offline source tested.
- Successful native clipboard copy, four manual fallback transfers with a new
  verified sentinel before each attempt, host Linux Control+C, complete selection
  and actual clipboard readback. Exact rendered, embedded, copied, fallback and
  downloaded source, including final newline, agree with solution.py in both
  locales. No normalization. Outputs redirected by OUTPUT_DIR.
- Viewports: 320,390,736 (landscape),1440, EN/ZH; native Chromium tabs.setZoom(2)
  yields innerWidth640/devicePixelRatio2 from a 1280px browser window. Local
  network only, no runtime console/page/HTTP errors. No persistent server started.
- Rendered token contrast measured with a calibrated sRGB helper: minimum text
  ratio 6.4494078988:1 across tested text/muted/accent/orange/success on shared
  surfaces; focus orange exceeds 3:1. Disabled controls use solid muted text,
  opacity1, and native disabled semantics. Actions are at least 48px tall.
- Shipped CSS: shared9425 + local1883 = 11308 bytes, below25000.
- Required root metadata preflight: exit0; preflight.json records exact command,
  stdout/stderr, timestamp and status. No registration was run.

## Visual inspection and semantic binding

Author inspected actual screenshot images: 320px English and 390px Chinese trace,
320px English candidate panel, 320px Chinese candidate panel, 320px English DP
ledger, 390px Chinese DP ledger, the narrow selected-preset label, English 390px
prediction, Chinese desktop full page, and both native200% captures. Also inspected
zoom-contact.png, a diagnostic side-by-side derived from the unmodified native
captures, confirming every numerical cell and candidate label is present.
Tables retain aligned headers/values, and long candidate sentences wrap without
collision. Horizontal sticky navigation scrolls; it does not squeeze table cells.
The contact sheet is an inspection aid, not a replacement for the original PNGs.

For the worked example, both locale state records show dp[2] changing1→2 from
candidate0→2 and remaining2 for1→2, with the retained chain[0,2] yielding bc/ac.
For official preset1, ending dp=[1,1,1,2,2] gives3 deletions. At j=4, 0→4 fails
b>a, 1→4 passes equality a≤a and b≤b and changes1→2; 2→4 fails b>a and retains2.
Both language screenshots explain the failing row instead of unrelated UI copy.
Fresh prediction feedback in both locales derives [1,2,2,3] and4−3=1; zero fails
z>b, two misses the length3 chain. Choice changes hide that derivation again.
Clipboard fallback is a distinct localized manual-copy instruction, preserved
across locale switches. Formula has complete indices, singleton and compatible
predecessor alternatives in both locales. Source download parity is byte exact.

## Evidence limits / next action

This is synthetic desktop Chromium with viewport emulation, not physical-phone,
novice teach-back, public delivery or LeetCode submission evidence. A separate
reviewer must cold-walk this frozen candidate, independently choose cases, apply
the six-dimension rubric and record findings/closure. No independent score or
acceptance is claimed. Candidate-sha256.json binds the submitted runtime, source,
metadata, brief, test runners and provenance to this author candidate.
