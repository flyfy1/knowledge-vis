# #839 author self-check — candidate 839-author-r1

Author: Codex, exact model identifier unavailable. This is an author self-check,
not an independent review. Independent reviewer/run: pending. Independent
acceptance: not claimed. Deployment and LeetCode submission: not performed.
Local preview: http://127.0.0.1:18770/leetcode/839/ .
Runtime and test identities are frozen in candidate.json; source/provenance and
shared-policy hashes identify the evidence boundary. Review criteria are the
six dimensions in specs/leetcode-review-gates.md (85+, every dimension >=3/4,
zero required findings), not an author-assigned score.

## Commands actually run

From the repository root:

- `python3 -B leetcode/839/tests/test_core.py` — pass: 2,184 canonical Python
  cases including exhaustive abc/aab/a lists, seed 839, official examples,
  length-one inputs, duplicate words, three mismatches and maximum n=L=300.
  314 browser-model inputs / 3,296 intermediate frames checked against generated
  legal swaps plus graph traversal. Explicit baseline agrees. Input unchanged;
  exact source mirror and unique bilingual localization keys pass.
- `node leetcode/839/tests/browser.cjs` — pass: 14 preset/locale paths, complete
  forward traversal, back/forward identity, reset/endpoints, singleton terminal
  state, 3→3 rejection and duplicate 1→1 no-op, all quiz options and answer changes,
  independent quiz state across trace changes, locale preservation, exact rendered
  H1/document title, actual clipboard transfers and downloads.
- `python3 -B scripts/register_leetcode_lesson.py 839 --validate-only` — exit 0,
  no output, no registration. Run after final runtime/copy changes. Metadata
  complexity is one nonempty time/space string. No metadata fix after this gate.

Both test runners accept `OUTPUT_DIR=/absolute/output/path`; the browser also
accepts `PREVIEW_ROOT`. They do not edit canonical source. Browser uses installed
Playwright via NODE_PATH and honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.
`tests/write_copy.py` is the authoring utility for regenerating the bilingual
copy from a duplicate-checked list, not a result-emitting test.

## Official evidence

`tests/evidence/official.json` contains the full public GraphQL response, URL,
endpoint, HTTP status and timezone-qualified access timestamp (UTC date Oct 25,
Singapore date Oct 26, 2026). It includes statement, both examples, constraints
and actual Python3/Python/TypeScript/JavaScript and other selector snippets.
Canonical Python3 class signature matches the official snippet. No paywall or
credentials were involved. The capture is review material and is never loaded
by the lesson.

## Rendered-state evidence

`tests/evidence/browser.json` records state/locale/observed semantic text,
contrast ratios, native-select font and longest-option fit, related-link labels
and served destination sections. Screenshots cover EN/zh at 320/390/736/1440,
CSS zoom=2 at desktop, and focused 320px controls/groups/ledger/hand/quiz.
All 30 screenshots were visually inspected, using contact-0..4.jpg for the full
set plus full-size narrow group/ledger/control, prediction and fallback captures.
The mismatching letters remain distinct and underlined; wrapped word IDs retain
association with their words. The merge at pair 1,2 changes 3→2 and retains the
previous comparisons. Rejected pairs and duplicate edges do not decrement.
No horizontal document overflow, text overlap or squeezed letters observed.
Some screenshots begin mid-section due to deliberately positioning the long
stage; separate controls and groups captures expose those regions fully.

Real keyboard Enter/Tab and visible 3px focus passed, including language focus
retention and forced-colors mode. All five local section links land below the
sticky bar. Related links were activated using Enter in both locales: #815 step2
actually teaches frontier expansion and reachable stops; #765 step3 actually
proves n−c swaps from cycles. These are available on this preview; their future
release/public availability must be checked by the release owner.

Successful copy, manual fallback via native Linux Control+C, and download bytes
match solution.py including its final newline. Each locale's fallback attempt
starts with a fresh verified non-source clipboard sentinel before automatic
writes are denied. Storage-denial initialization and file:// offline source
rendering pass. Clipboard failure text remains separate from algorithm feedback.
Zero console/page/failed-resource errors; all HTTP requests stay on the preview
origin. No external fonts or runtime dependencies. Shared + local CSS = 11,207
bytes, below 25,000. Text pairs against all four used solid surfaces have minimum
ratio 6.449407898769069; core body text exceeds 7:1. Formula is WCAG sRGB relative
luminance, (lighter+.05)/(darker+.05), with identical-color, black/white=21,
symmetry and near-AA-threshold sanity checks. Evidence records unrounded ratios.
Native platform text-selection colors are browser supplied, not a custom palette.

## Harness correction and limits

An initial browser test tried to click disabled End after resetting the singleton
preset. That input has zero pairs, so reset is already terminal. Corrected the
harness to inspect the disabled state and avoid the click; no runtime repair was
needed. The final full test passes unchanged endpoint expectations for all presets.
The final copy elaborates baseline helper operations and the local component
meaning; numerical and browser tests were rerun after these edits.

Headless Chromium and CSS zoom are synthetic device checks, not physical phone
or native browser-zoom certification. No actual novice teach-back, independent
lesson review, LeetCode acceptance or public production verification is claimed.
Next action: separate source-blind cold review of this frozen candidate, followed
by source/oracle/evidence audit. Registry, shared assets, campaign state and
reports were not modified.
