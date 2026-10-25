# Author self-check — #805

Candidate: `805-author-candidate-01`  
Candidate SHA256: `c0fa7f104029f526da30844066e5e53c18bbbd6d94da965bb40b5c1740afc0bc`  
Exact candidate/test/source/provenance and evidence hashes: [candidate-manifest.json](evidence/candidate-manifest.json).
No independent reviewer, learner study, LeetCode submission, registration, commit,
deployment or public acceptance is claimed. The next step is a separate review
run against this frozen candidate, starting with a source-blind walkthrough.

Official verification: [official.json](../provenance/official.json) captures the
public GraphQL response on 2026-10-25: full statement, two examples, n=1…30,
0…10000 values, nonempty groups, and actual Python3/other-language code snippets.
Canonical language is supported Python, using the observed method signature.
There is no problem-specific exception to the two-nonempty-groups requirement.

| Executed command from repository root | Observed result |
|---|---|
| `python3 -B leetcode/805/tests/test_solution.py` | PASS: 3,729 exhaustive/seeded cases plus 12 boundary fixtures; actual official callable, independent combinations oracle, input preservation, exact mirror |
| `node leetcode/805/tests/test_core.cjs` | PASS: 1,299 inputs, 6,829 intermediate states, independent positional subset enumeration; 91 unique bilingual key pairs |
| `node leetcode/805/tests/browser.cjs` (existing NODE_PATH and Chromium executable env) | PASS: 92 rendered frames; 14 locale/width/zoom layout combinations |
| `python3 -B scripts/register_leetcode_lesson.py 805 --validate-only` | PASS, exit 0, empty stdout/stderr; receipt [preflight.json](evidence/preflight.json) |

Browser: Chromium 156.0.8078.4, Linux. Existing preview:
http://127.0.0.1:18786/leetcode/805/. Both locales, all seven presets, every frame,
replay/back/reset/start/end disabled controls, hand reveal, prediction before
reveal/all options/change/reveal and locale preservation passed. Rendered formulas,
half-set rows, complement checks, candidate identity and terminal results were
compared with expected values. Semantic text samples are in browser-results.json:
R[1]={2} before adding 3; successful i=0,j=1,target=2; failed [1,1,4];
exercise true with [4]; copy denial text is separate from algorithm feedback.

Source textContent, offline mirror, successful clipboard copy and downloaded bytes
match solution.py exactly, including the final newline. Four native fallback
transfers passed (two per locale), each with a newly written/read non-source
sentinel, selected full textarea and Linux Control+C. No test-written source was
used to stand in for a native transfer. Storage denial and offline file opening
passed; runtime network/console/asset-error lists are empty. Every rendered local
link and deep target returned successfully; sticky step2 landed at ~90px below
the 66px navigation. Keyboard Enter/Tab, focus preservation, forced colors and
reduced motion were exercised. Controls measured at least 48px tall; focus is
3px solid accent2. CSS totals 11,274 uncompressed bytes.

Visual author inspection: trace screenshots in both languages at 320/390/736/1440,
zoom control and sum-set screenshots at 320/390/1440, headings, prediction feedback,
match/failure and forced-colors screenshots were opened and inspected. Count labels
remain paired with readable sum values; the two halves stack on phones; text wraps
at 200% CSS zoom without squeezed values or page overflow. Native select labels are
short case numbers with the full localized input/result below. Actual text width,
padding and a 24px browser-arrow reserve pass at zoom. Sticky navigation is a
horizontal scroll region; captures may show surrounding content partly above or
below the viewport. The final zoom captures wait for resize/scroll handling.

Measured contrast: core text/panel2 13.40:1; muted/panel2 (disabled content)
6.45:1; muted/panel 7.08:1; accent/panel 11.97:1; accent2/panel2 8.94:1;
accent2/bg focus 10.73:1; good/panel 10.98:1; bg/accent 13.10:1.
All measured text pairs exceed AA; core reading text exceeds 7:1. Calculations
are calibrated with black/white/red and a near-4.5 threshold sample.

Costs audited from actual loops: baseline O(n·2ⁿ) time, O(1) words; canonical
expected O(n·2^ceil(n/2)) time and O(2^ceil(n/2)) storage. Half-building costs
sum of the preceding half-state sizes; copies preserve the old-state invariant.
Empty count-zero selections are necessary, while the final k range excludes
empty/full partitions. All-zero, singleton, duplicates, official examples and
maximum-count/value fixtures pass. Tutorial snapshots are additional storage.

Limits: synthetic browser checks do not establish novice comprehension, real
phone behavior, native browser zoom, other host fonts/platforms or public delivery.
Independent teaching acceptance remains pending. Harness corrections and the
interrupted rerun are preserved in iteration-notes.md; only the final complete
successful run supplies the final browser report. OUTPUT_DIR permits reviewer
reruns without altering this candidate. Metadata has the required single cost
string; no metadata repair after an independent review occurred.
