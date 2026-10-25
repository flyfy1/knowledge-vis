# Author self-check — frozen candidate 632-author-r1

Author run only. Independent lesson acceptance: pending. No registration,
commit, deployment or LeetCode submission. Only leetcode/632/ was created.
The reused product/design approval is distinct from this candidate's review.

Official public statement and Python3 callable were verified on 2026-10-25;
see provenance/verification.md and the unmodified public GraphQL response.
Canonical source: solution.py; exact offline mirror: python-code.js.

Executed from repository root:

- `python3 -B leetcode/632/tests/test_core.py` — passed 8,744 inputs,
  including 7,239 exhaustive cases and 1,500 seed-632 random cases;
  31,729 intermediate JS simulation frames verified independently.
  Canonical Python also passed two maximum 3500×50 fixtures, including a
  near-complete heap scan. Inputs were unchanged. Both official examples pass.
- `node leetcode/632/tests/browser.cjs` — passed in Chromium 156.0.8078.4,
  Linux headless, already-running local preview. 32 recorded state checks,
  28 screenshots, all six presets in both languages, all transitions and
  rewind/replay, reset/endpoints, all predictions and changing an answer,
  reveal plus locale preservation, native clipboard exact read-back,
  denied clipboard manual selection, source/display/download equality,
  keyboard/focus, storage denial, offline file:// initialization, links,
  reduced motion, forced colors, and local-only asset responses without errors.
- `node leetcode/632/tests/accessibility.cjs` — passed all closed select labels
  at 320px in both locales, measured controls at least 48×48px, actual rendered
  color pairs and opacity, plus 390px at 200% CSS zoom. Separate row and range
  captures show readable values with their labels. Browser tests also exercise
  320/390/736/1440px and 1280px at 200% CSS zoom.
- `python3 -B scripts/register_leetcode_lesson.py 632 --validate-only` —
  exit 0, empty stdout/stderr; safe non-mutating preflight. Receipt:
  tests/evidence/preflight.json. Metadata complexity is one nonempty string.

Shared plus local shipped CSS: 11,483 bytes. Measured text ratios include
body/panel 14.70:1, disabled 6.45:1, selected 10.91:1, primary 13.10:1,
correct feedback 10.00:1; focus/panel 9.81:1 with a 3px outline.
Exact colors and computed pairs are retained in browser/accessibility JSON.

Visual inspection performed using actual screenshot images: narrow English and
Chinese rows, current/best readouts, English desktop, both desktop zoom views,
closed select labels at 320px, prediction selection/correct/focus states, manual
copy fallback, and both languages at 390px with 200% zoom (individual first row
and both range panels). Values wrap without collisions. The tall trace viewport
can place a sticky navigation strip over the top of the capture; individual
component captures distinguish this scrolling artifact from actual clipping.
The first-row label and selected value are separately visible in the focused
zoom captures.

Author inspection of meaning: [1,4] covers 1/2/4 at width 3; advancing A gives
[2,5], still width 3, so best stays [1,4]. [4,6] later improves to width 2;
the final candidate [5,7] does not steal that best identity. The fresh exercise
has widths 4,4,3,2, stops at A=8 and returns [8,10]; [9,10] misses A.
Both locale reports retain these scopes, values and their distinct system copy.

During self-check, the single-frame preset required the test to respect its
already-disabled endpoint. Additional layout checks led to local fixes for
sticky-anchor spacing, a 48px language button, wrapping a long callable name,
and an explicit local favicon to prevent the browser's default favicon 404.
Final checks above pass after these changes; no historical independent result
has been changed or claimed.

Reproduction instructions are tests/README.md. Every evidence-producing test
honors OUTPUT_DIR so a reviewer can preserve this frozen evidence. Candidate
source/test hashes and shared dependency hashes are in tests/evidence/candidate.json.

Limitations: this is an author self-check, not an independent review, novice
teach-back, official accepted submission, public delivery verification, native
phone test or assistive-technology audit. Zoom is Chromium CSS zoom; other
platform fonts and browser-toolbar zoom remain unverified. No actual learner
outcome is asserted. Next action: separate source-blind lesson review.
