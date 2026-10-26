# #943 author self-check · candidate r1

Date: 2026-10-26. Author: Codex; exact model identifier unavailable. This is an author run, not independent lesson acceptance. Separate reviewer/run: pending. Deployment and LeetCode submission: not performed. No actual learner outcomes claimed.

## Official evidence

`tests/evidence/official.json` retains the public GraphQL response with timestamp, exact official URL, full description/examples/constraints and code snippets. The public problem page was also read. Python3's observed interface is `Solution.shortestSuperstring(self, words: list[str]) -> str`. Canonical language: Python. No non-Python contract exception applies.

## Actual commands and results

Run from `/home/songyy/projects/leetcode-hard-campaign-20261018`:

- `python3 -B leetcode/943/tests/numerical.py` — PASS, 334 canonical Python cases: 75 exhaustive valid small word sets checked by enumerating output strings, 250 seeded cases checked by permutation enumeration, 7 explicit cases including both official examples and the fresh exercise, and 2 maximum n=12 / L=20 cases. Outputs contain every input word, match the independent minimum/expected lengths, and do not mutate input. Exact displayed baseline is also executed and mirror bytes match canonical source, including final newline.
- `node leetcode/943/tests/core.cjs` — PASS, 61 cases / 807 complete frames. Every settled DP cell is checked against separately merged permutation enumeration, as are current candidates, best values, parent identities, unchanged cells and deep snapshot isolation. Copy dictionaries are checked for duplicate keys before evaluation and valid bilingual pairs afterward.
- `PREVIEW_ROOT=http://127.0.0.1:18770 node leetcode/943/tests/browser.cjs` — PASS, Chromium 156.0.8078.4 on Linux, 32 recorded interaction observations and 34 screenshots. All five presets and all candidate frames were traversed in both languages. Forward/back/replay/reset/endpoints, singleton initially terminal state, preset restart, changed prediction, all three answers, locale roundtrips, localized heading/document title, rendered recurrence operands and source/target/settled markers checked.
- The browser also passed exact rendered/copied/downloaded source parity; four native manual fallback transfers each used a separately verified distinct sentinel and Linux Control+C. Clipboard readback matched exact source without newline normalization. Denied storage and offline file opening worked. Keyboard activation, 3px focus and forced-colors focus checked; horizontal table scrolling exercised by real ArrowRight. Related links followed by keyboard at 320px and destination content/hash retained.
- Browser widths: 320, 390, 736 (landscape), 1440 CSS px, both locales; selected-label text budgets include a 24px arrow reserve. Native Chromium tabs.setZoom(2) was actually applied: devicePixelRatio=2, innerWidth=640, outerWidth=1280. No CSS transform substitute. Zero console/page/HTTP asset errors; all runtime requests stayed on the existing preview origin.
- `python3 -B scripts/register_leetcode_lesson.py 943 --validate-only` — PASS, exit status 0, no output. Run from repository root, without registration. Repeated after final runtime/copy changes. Complexity metadata is one nonempty time-and-space string. No metadata gate fix was needed.

Evidence JSON: `numerical.json`, `core.json`, `browser.json`; dated source: `official.json`; all under `tests/evidence/`. Test runners accept OUTPUT_DIR, as documented in tests/README.md, so review reruns need not mutate these records.

## Visual inspection and meaning checks

Viewed actual headless screenshots, not only file existence. Desktop full pages in English and Chinese show the concrete introduction, baseline, state derivation, trace, exercise and source in consistent shared hierarchy. Focused English/Chinese 320px calculations show the losing candidate 13 while the target correctly retains 11 with best predecessor 0; this is not mislabeled as a candidate worth 11. Source and target cells retain their Settled / 已定 labels plus independent Source / 源 and Target / 目标 markers. 320px right-scrolled captures expose endpoint 2's retained 11 while the subset row header remains fixed. Scroll clipping of adjacent columns is intentional; every column can be reached by keyboard. Table instructions remain outside the scroll region and wrap to the viewport. The large table has no page-wide overflow.

Inspected 390px prediction screenshots in both languages: selecting 6 preserves the selection, reveals the two competing endings and bcabcx, and wraps without clipping. Inspected native 200% zoom captures in both languages: table values, row/column identity and source markers are readable at doubled browser scale. Selected greedy-trap preset screenshots at 320px show the full closed option label. Viewport captures may include a sticky navigation strip above the current section; screenshots of table/select elements hide that strip only during capture, not in the runtime.

Related destination #940 step2 actually groups distinct subsequences by final letter and replaces one group; #552 step1 compares histories and derives (absence count, trailing lateness) as sufficient memory. Links describe those precise ideas, not a claim that they solve shortest-superstring paths. The preview targets returned 200 and their actual section content is saved in browser.json; public deployment of this candidate remains unverified.

Initial harness failures and diagnoses are retained in `browser-first-attempt.txt`: an overbroad destination keyword assertion and an immediate observation that raced native horizontal scrolling. Final tests retain the semantic/scroll predicates and wait for actual scrolling. During author iteration, moved table descriptions outside the scrolling component and pinned row headers for phone reading. No reviewed candidate or prior acceptance was modified.

## Measured presentation

Shared CSS: 9,425 bytes; local CSS: 1,869 bytes; total 11,294 bytes, below 25,000. No external fonts, images or assets. Exact shared palette used; no new color literals. Computed sRGB contrast measurements in browser.json: minimum regular/muted role contrast 6.449:1 on panel2, above AA 4.5:1; body/source and accent roles exceed 7:1. Focus accent2 vs panel2 exceeds 3:1. Disabled controls use full opacity with the same readable muted role; selected controls use dark bg ink on cyan. Focus rings and textual source/target state markers remain distinct from algorithm highlights.

## Boundary of the evidence

This validates the local author candidate, not a physical device, real novice teach-back, independent teaching audit, public delivery or LeetCode acceptance. Next action: a separate fresh-context reviewer performs the problem-local cold walkthrough, independently chosen cases and rubric review against the frozen hashes in candidate.json. Author self-check does not satisfy that gate. No shared asset, registry, campaign record, service, credential, commit or deployment was changed.
