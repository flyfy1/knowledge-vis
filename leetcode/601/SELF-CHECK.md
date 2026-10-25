# #601 author self-check — candidate 601-author-c1

Status: complete author candidate, ready for a separate independent review.
This is an author run, not independent acceptance, actual learner evidence,
a LeetCode submission result, registration, deployment, or public verification.
Preview: http://127.0.0.1:18770/leetcode/601/
Candidate identity: `tests/evidence/candidate-sha256.json`.

## Official verification

Public official page and public GraphQL were available on 2026-10-25.
`provenance/official.json` records access time, query, original content, free
access status, all five selector snippets, and Pandas callable. Python faithfully
implements the offered DataFrame interface. The lesson preserves ID adjacency,
>=100 inclusivity, full-run inclusion, ascending date output, and the official
date-gap exception. No numeric size limit or unspecified null rule is invented.

## Executed checks

| Check | Observed result |
|---|---|
| `/tmp/venv262/bin/python -B leetcode/601/tests/check_solution.py` | Pass: 2,698 generated DataFrame cases, plus exact official fixture and nullable-people extension; pandas 3.1.0, Python 3.12.3 |
| `node leetcode/601/tests/check_core.cjs` | Pass: 6,569 cases, 24,089 intermediate frames, exact union invariant and replay |
| `node leetcode/601/tests/browser.cjs` | Pass: Chromium 156.0.8078.4, both locales, eight presets, all endpoints and forward/back replay, quiz, clipboard and source checks |
| `python3 -B scripts/register_leetcode_lesson.py 601 --validate-only` | Exit 0, empty stdout/stderr; run from repository root, recorded in `metadata-preflight.json` |

The independent algorithmic oracle sorts qualifying distinct IDs into maximal
consecutive runs; it does not enumerate production triples. Exhaustive cases
cover absent/99/100 states (3^7 Python, 3^8 JS). Python also tests seed 601,
500 randomized/shuffled inputs, nontrivial DataFrame indexes, empty/short cases,
duplicates/equal people, gaps, threshold breaks, 10,000 consecutive IDs, input
non-mutation, schema and ordered output. The 10,000-row load is a chosen test,
not an official maximum. Nullable people tests are extra robustness evidence,
not a claimed official null contract. All tests that write output honor OUTPUT_DIR.

Source fidelity: decoded offline mirror, DOM textContent, clipboard API argument,
real Chromium clipboard write/read, full selected fallback textarea, and downloaded
bytes all equal solution.py including final newline. Offline file:// rendering
and trace interaction pass. Storage denial preserves working in-memory locale.
Copy fallback has its own localized message, distinct from failed-triple feedback.
95 localization keys are checked for duplicates before parsing and all values
are checked as nonempty [zh,en] pairs. Browser semantic samples are stored in
browser-results.json.

## Author walkthrough observations

| Step | Operation and visible observation | Inference checked |
|---|---|---|
| 0 | Switch ID 5 from 100 to 99, then restore; [4,5,6] becomes [] and returns | Inclusive threshold; a low middle visit breaks the whole triple |
| 1 | Recompute [4,5,6] and [5,6,7], compare [4,5,7] | Overlap covers a four-run; adjacent table rows alone are insufficient |
| 2 | Test starts 4 then 5, rewind/replay; later failed starts retain marks | marked equals the union of complete triples already tested |
| 3 | Choose each distractor, reveal, switch locale, change answer | Only [20,21,22] survives; stale feedback clears on changed prediction |
| 4 | Read named code mapping and compare all source transfers | Hash membership avoids repeated scans; final filtering/sorting fulfills the DataFrame contract |

This author walkthrough is not a source-blind independent cold walkthrough.

## Browser states / visual inspection

Both EN and zh exercise initial state; successful s=4; failed s=7 after prior
evidence; all preset terminal outputs; empty/no-eligible terminal states;
all three quiz choices; revealed language roundtrip; changed-choice clearing;
copy success and denial; independent experiment reset behavior. Locale switches
preserve preset, position, prediction, reveal and disclosure state. Keyboard Enter
activates the next test; ArrowRight changes the slider and scrolls the table.
Focused containers have localized region names and first-column identities stay
visible at the horizontal scroll endpoint. Deep navigation clears the sticky
header; related target anchors exist. Reduced motion and forced-color focus pass.

Visually inspected all 14 saved screenshots using the image viewer:
`trace-{en,zh}-{320,390,736,1440}.png`, `header-{en,zh}-320.png`,
`ledger-right-{en,zh}.png`, and `zoom200-{en,zh}.png`.
Headers and body copy wrap; selected preset labels are readable; controls reflow;
ledger cells remain separated; row IDs stay paired with union values during
horizontal scrolling. Narrow tables deliberately scroll rather than shrinking
their columns to fit. Some non-frozen columns/captions are partly outside the
scroll viewport; keyboard scrolling exposes them. The live region label and
frozen first column retain context. No page-wide horizontal overflow was found.

Element captures temporarily hide the sticky nav to prevent an element-screenshot
overlay artifact; actual header screenshots and actual deep-link geometry are
tested separately with the nav visible. Zoom captures use 200% CSS page zoom at
a 1280px viewport, testing doubled content dimensions and reflow. Native browser
toolbar zoom and physical phones were not tested. Platform: Linux ARM64, system
font stack PingFang SC / Microsoft YaHei / system-ui / sans-serif; no claim about
which physical font supplied each glyph. All eight selected preset strings are
measured against control widths at every tested viewport in each locale.

Contrast measured from rendered shared tokens: text/bg 16.09:1, text/panel 14.70:1,
text/panel2 13.40:1; muted minimum 6.45:1 (panel2); accent minimum 10.91:1;
focus accent2/panel2 8.94:1; primary ink/bg-on-accent 13.10:1. Core text exceeds
7:1; muted supplementary text exceeds AA. Disabled controls retain opacity 1.
Combined shipped shared/local CSS: **11,171 bytes**, below 25,000. No external
runtime asset request, console error or local asset error in the final run.
Official captures and screenshots are audit material, never runtime dependencies.

## Author iteration and boundaries

An early browser test incorrectly tried to click the already-disabled End button
on the no-eligible preset; the test now verifies that valid terminal state.
The first browser run also exposed the browser's implicit favicon 404, fixed with
a data favicon declaration. Screenshot inspection led to frozen row headers and
removal of scroll-container padding that exposed slivers of underlying text at
the left edge. The complete browser suite passed after the final presentation fix.
No prior independent acceptance or campaign records were modified.

No shared file, registry, CONCEPT-MAP, other lesson, script, Git configuration,
credential or system service was changed. Registration and independent review
remain dispatcher-owned. Separate reviewer should perform the frozen rubric's
cold walkthrough before reading this brief/source/evidence, then audit the
candidate and choose an unseen example.
