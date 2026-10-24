# #381 author self-check — candidate ready for separate review

Date: 2026-10-25. This is the author run, not independent acceptance.
Preview: http://127.0.0.1:18770/leetcode/381/
Frozen identity: tests/evidence/candidate-manifest.json (SHA-256).

## Teaching path inspected

| Step | Reconstruction checked by the author |
|---|---|
|0|The physical copies 4,4,9 correspond to three equal-chance positions. Two positions return 4. Inserting a duplicate returns false but adds a copy; deleting one leaves equal chances for 4 and 9.|
|1|An ordinary list is a correct independent baseline but scans and shifts. Replacing the hole with the tail preserves counts because order is unobservable. Sampling distinct values would wrongly assign 1/2 to both values.|
|2|Before/after arrays and every reverse-index set are visible together. The equal-tail preset shows that {0,2} must become {0}, despite unchanged value 4 at the hole. Retained operation history explains each update. Frames represent completed operations, not an in-progress invariant.|
|3|Fresh [8,3,8,8] question: selecting an answer alone does not reveal it. Reveal explains the stale-index distractor and the delete-all distractor. Changing the choice clears feedback; locale switches preserve it.|
|4|Prose maps fresh, i, j, last and each set update to executable Python. Expected/amortized costs, absent removal, last-copy cleanup, signed limits and nonempty sampling are explicit.|

This is an author walkthrough, not observed novice teach-back. The JavaScript
trace explicitly differs from executing Python and uses reproducible choices;
its snapshots and sorted display sets are not claimed as submission costs.

## Executed checks and evidence

- Official statement + full returned language templates: tests/evidence/official.json.
  Public official GraphQL confirmed Python3 class interface, complete constraints,
  methods and the official example. No paywall bypass or inferred interface.
- Python: `OUTPUT_DIR=leetcode/381/tests/evidence python3 -B leetcode/381/tests/test_solution.py`.
  PASS, 72,300 independently reconstructed invariant checks. Exhaustive update
  streams lengths 0..5 over {-1,0,1}; 150 seeded streams; forced arbitrary removal
  positions; exact position-enumeration sampling checks; 200,000-update run.
- Model: `OUTPUT_DIR=leetcode/381/tests/evidence node leetcode/381/tests/test_core.cjs`.
  PASS, 51,590 completed-frame checks against a linear-list oracle, exhaustive
  streams through length 6 and 150 seeded streams. AST-based duplicate-key check
  verifies 92 bilingual copy pairs before evaluation can overwrite definitions.
- Browser: `OUTPUT_DIR=leetcode/381/tests/evidence node leetcode/381/tests/browser.cjs`.
  PASS on the already-running preview, no page/console/asset errors. Both locales,
  four presets, every forward/backward frame, both endpoints, reset/end, three
  prediction choices, reveal/change, locale state/focus preservation, hand reveal,
  enumerated slots, keyboard Enter/Space/Tab, real clipboard success and forced
  denial fallback, displayed/copied/downloaded exact-source equality, local links,
  blocked storage and offline file opening were exercised.
- Layout: 320/390/736/1440 CSS px in both locales and all presets. 200% Chromium
  CSS zoom at desktop width plus 720px/DPR2 emulation. 14 PNGs visually inspected:
  trace-{320,390,736,1440}-{en,zh}, zoom200-{en,zh}, css-zoom200-{en,zh},
  intro-320-{en,zh}. Before/after positions remain associated and legible.
  No page overflow or compressed array cells. Source code deliberately scrolls.
- Focused accessibility: `OUTPUT_DIR=leetcode/381/tests/evidence node leetcode/381/tests/accessibility.cjs`.
  PASS: #381 heading in both locales; initial and deep-link active step; native
  keyboard activation; 3px focus outline; forced-colors outline retained.
  Focus contrast on actual adjacent stage: 9.81:1. Controls measured ≥48×48px.
- Measured computed text contrast minimum: 6.4494:1; normal explanatory text
  uses the shared high-contrast text token. Shared + local CSS: 11,684 bytes.
  All runtime requests local; official capture is never a runtime asset.

Visual self-inspection found shrinking sticky-nav pills and overlapping labels
that page-overflow assertions missed. Local flex-shrink:0 fixed it; final browser
checks cover each nav link's geometry. Navigation also now updates at the top of
the page even when no section intersects the original observer band. Screenshot
capture uses full-page coordinates to avoid sticky overlays and matched emulated
viewport dimensions to avoid capture clipping; these are test-capture fixes.

## Metadata gate

Executed from repository root:

`python3 -B scripts/register_leetcode_lesson.py 381 --validate-only`

PASS (exit 0, no stdout/stderr), recorded in tests/evidence/preflight.json.
Complexity is one time-and-space string; title excludes the numeric ID and the
lesson heading includes it. No registration or campaign/review-state mutation.

## Limits and handoff

No independent review, actual learner study, accepted LeetCode submission,
production deployment or physical-device testing is claimed. Zoom and phone
sizes are Chromium desktop emulation. The candidate and reproducible author
checks are complete; the next step is the separately dispatched cold review.
Only leetcode/381/ was authored. No shared assets or registry were edited.
