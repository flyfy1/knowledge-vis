# Author self-check — frozen candidate 903-author-1

This is an author run, not an independent acceptance report. Separate teaching review remains pending. No submission, publication, registration, deployment, or novice-learning result is claimed.

## Contract and implementation

Public official statement and Python3 selector/interface were captured on 2026-10-25 in provenance/official.json and provenance/official-interface.json. The latter explicitly records frontend ID 903 (the internal questionId is 939), Hard, free access, and Solution.numPermsDISequence(self, s: str) -> int. Python is the preferred faithful interface; no non-Python language exception applies.

The five-section lesson starts with DI = 2, rejects independent-comparison multiplication using 6/4, derives rank standardization using [1,0] → [2,0,1], and explains why a total alone loses required information. It then exposes source cells, old/new counts, unknown versus zero, prefix totals versus final answer, the fresh II + D prediction, and a bijective correctness proof. The displayed simulation applies the direct recurrence left to right; the canonical Python uses rolling prefix/suffix sums, including right-to-left D. That distinction and the simulation's snapshot cost are stated in both locales.

Author teach-through check (not an observed learner result): DI has [1,0,2] and [2,0,1]. Its row is [0,1,1]. A fresh IDI audit has rows [1] → [0,1] → [1,1,0] → [0,1,2,2], total 5. Appending a rank relabels every old value at or above it; this yields k<j for I and k≥j for D. Deleting and standardizing reverses the operation uniquely. Empty sums explain the zero boundaries. Reusing cumulative sums removes repeated cell summation and yields O(n²) time/O(n) auxiliary space. These claims were checked in both localized explanations and code.

## Commands actually run

From repository root:

- `python3 -B leetcode/903/tests/test_solution.py`: PASS, 127 exhaustive patterns through n=6 and 75 independently decomposed maximum/seeded cases, including n=200 and official examples.
- `node leetcode/903/tests/test_core.cjs`: PASS, 2,688 computed cells, source ranks, intermediate enumeration counts, deep snapshot independence, bilingual pairs, and 59 unique raw dictionary keys using Acorn before evaluation.
- `node leetcode/903/tests/browser.cjs`: PASS, Chromium 156.0.8078.4 on Linux. Four widths × both locales (320,390,736,1440), 14 full preset runs with every rewind/replay, all three prediction choices, changed-answer invalidation, locale roundtrips, endpoints/reset, disabled appearance, ≥48px targets, keyboard activation and 3px focus, internal/related deep links, blocked storage, forced colors, and real-browser 200% CSS zoom.
- Browser source display, JSON mirror, successful copy, actual system manual copy, and downloaded source all match solution.py exactly including its final newline. Each fallback attempt has a unique verified clipboard sentinel; the host's Control+C transfers the selected text while automatic writes are disabled.
- `node leetcode/903/tests/capture-final.cjs`: PASS, additional 320px heading and endpoint captures at 1200px height avoid sticky-navigation screenshot overlap.
- `python3 -B scripts/register_leetcode_lesson.py 903 --validate-only`: exit 0; stdout and stderr empty. Full command/result retained in tests/evidence/preflight.json. This was validation only, with no registration.

Numerical and browser artifacts are in tests/evidence. Each emitting test honors OUTPUT_DIR; see tests/README.md. Browser execution uses the already-running preview, NODE_PATH packages, and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. There were zero page errors or failed asset responses; all runtime requests stayed on the local preview origin.

## Visual and accessibility inspection

Inspected all 34 screenshot captures through contact sheets, with full-size inspection of representative and constrained states. Inspected rendered Chinese/English headings, desktop and narrow trace captures, source, prediction, manual-copy selection, focus, dense endpoint, and zoomed tables. The final 320px table fits every rank and keeps row labels adjacent. Old source cells carry *, the current cell carries → plus a border, unknown cells use ·, and impossible ranks use —. Zero-valued source cells remain visible as genuine included terms. The complete IDID endpoint displays [5,5,4,2,0], total 16. The earlier wide first column was replaced before freezing. The disabled primary action and table keyboard outline were corrected and rechecked before this candidate.

Some long element captures can include the sticky nav over the top edge; the clean final endpoint captures and separate table captures establish the actual table/control geometry. No essential diagram content is clipped in the clean captures. Text and formulas retain complete operands in both languages.

Rendered solid-color contrast uses calibrated WCAG sRGB weights (0.2126,0.7152,0.0722), primary-color checks, black/white=21, and #747474/black≈4.492948 without rounding a failure up. Recorded text ratios range from 6.4494 (disabled muted text) to 16.087 (body); current-cell text is 9.8094. Focus is 3px orange with ≥3:1 contrast to its adjacent panel. Combined shipped CSS is 10,741 bytes. Exact shared palette/system-font tokens are reused; there are no external assets or ambient animations.

Both related links were keyboard-activated on the preview in both languages and their destination sections read: #115 step1 partitions prefix counts into disjoint use/skip choices; #327 step1 derives interval sums by subtracting prefix totals. Destination text and URLs are retained in browser-results.json. These are local preview checks, not a release-manifest or production claim.

## Boundary of evidence

This candidate is ready for the separately assigned independent reviewer. Physical devices, native macOS font fitting, browser-chrome zoom, production delivery, actual novice teach-back, and LeetCode judge acceptance remain unverified. The recorded zoom evidence is explicitly CSS zoom within a real browser. No current official source/access blocker exists. Candidate identity is recorded in tests/evidence/candidate.json; shared files are dependencies only and were not edited. Only leetcode/903/ was authored.
