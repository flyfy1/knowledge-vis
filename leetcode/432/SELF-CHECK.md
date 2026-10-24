# #432 — final author candidate, independent review pending

Scope: only `leetcode/432/`. Approved shared lesson pattern reused. No registry,
shared assets, campaign records, production service or Git configuration changed.
No submission, commit, push or deployment performed. `tests/evidence/candidate.json`
identifies this final candidate by SHA-256; it includes the frozen metadata.

Official contract and Python3 selector were verified through public official
GraphQL. `tests/evidence/official.json` records the request location, exact
problem URL, access timestamp, statement, example and all returned code snippets.
The timestamp is 2026-10-24 UTC / 2026-10-25 in Asia/Singapore. Python is a faithful
supported interface, so no non-Python language exception is needed.

## Actual checks

From repository root:

- `python3 -B leetcode/432/tests/test_solution.py` — PASS; 38,097 intermediate
  structure/oracle checks. Legal two-key sequences through depth 7; 40 seeded
  300-update cases; official hello/leet example; 50,000 grow/delete calls on a
  ten-character key. Independent dictionary counts and min/max checks accept any
  correct tied key. Every tested intermediate state checks bucket order, no
  empty buckets, forward/backward links, unique entries, map identity and ownership.
- `node leetcode/432/tests/test_core.cjs` — PASS; 6,532 teaching frames checked
  against independent dictionary counts and extrema; exhaustive small operation
  sequences through depth 6; all presets; snapshot continuity and deterministic
  replay. Acorn checks all 86 bilingual copy properties for duplicate keys and
  checks every static localization binding exists.
- `node leetcode/432/tests/browser.cjs` — PASS on the already-running preview.
  Four presets × both locales, all 66 completed operation states compared with
  independent dictionary counts; next/back/next identity, reset, end, disabled
  endpoints; hand reveal/hide; every prediction, explicit reveal, changed-answer
  clearing, locale-preserved reveal and trace position. Native Chromium clipboard
  copy/readback in both locales, deterministic denial fallback with full selected
  source, displayed/embedded/downloaded source equality. Blocked localStorage and
  file:// offline source initialization pass. No browser errors or failed asset
  requests; all runtime requests local. Existing related targets were fetched and
  internal navigation landed below the sticky bar after smooth scroll settled.
- Browser geometry: EN/zh at 320, 390, 736 and 1440 CSS px, populated gapped buckets;
  no page overflow, no bucket content overflow, all measured controls ≥48px high.
  Keyboard Enter advances and Tab reaches Reset; focus is a visible 3px outline.
  Forced colors and reduced motion also exercised. CSS zoom 2 at 800px and a
  narrowed CSS viewport/DPR 2 equivalent are checked; physical device/OS zoom is
  untested. These are real headless Chromium runs, not actual-device claims.
- Final shipped CSS total: **10,754 bytes** (shared + local). Measured contrast:
  body 16.09:1, bucket text 13.40:1, count label 8.94:1, disabled text 6.45:1,
  hint text 7.74:1, focus against panel 9.81:1. Enabled primary uses the shared
  accent/bg pair, 13.10:1. Sticky background is 96% opaque bg; its reported
  nominal contrast is 7.74:1 (the composited result remains above AA).
- `python3 -B scripts/register_leetcode_lesson.py 432 --validate-only` — PASS,
  exit 0, no output. Exact run and result saved in `tests/evidence/preflight.json`.
  This was validate-only; no registration was run.

## Visual inspection and revisions

The author opened and inspected the generated screenshots: both localized
populated traces at all four widths, both intro widths/locales, CSS 200% zoom,
and both viewport/DPR zoom images. Counts and keys remain associated, arrow links
are visible, mobile snapshots stack, and text wraps. The horizontal step strip
is intentionally scrollable. Screenshots scrolled to the after-state may show
part of the preceding state above the sticky bar; this is a viewport capture,
not removal of the before-state, which remains reachable by scrolling.

Author checks found and fixed a 320px preset-select overflow (shorter localized
labels and container constraint) and primary-style precedence on disabled Next
(local muted/dashed disabled styling). The final full suite was rerun after
these fixes. The navigation test was corrected to wait for smooth scroll to
settle before measuring geometry. No earlier independent review exists or is
being rewritten. Metadata was authored once, passed preflight and is now frozen.

Representative semantic bindings are retained in browser-results.json under
`semantics`: preset, locale, operation text, independently expected counts and
observed key-location text for each completed operation. This covers new keys,
reused targets, newly created targets, empty old-bucket removal, preserved old
buckets, empty queries and tied queries. Prediction feedback explains bucket
removal; clipboard denial explains manual copying, with distinct copy keys.

## Evidence limits

All results are author self-checks. They do not establish independent acceptance,
actual novice teach-back, general learning effectiveness, a LeetCode acceptance,
physical-device accessibility, or public delivery. The canonical Python is
executed separately; browser frames are a bounded teaching simulation. A fresh
independent per-lesson review is the next gate. Reproduction commands and
OUTPUT_DIR redirection are documented in tests/README.md.
