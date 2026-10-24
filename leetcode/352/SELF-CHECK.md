# #352 author self-check — frozen candidate 352-author-r1

Status: ready for a separate independent review; **not independently accepted**.
Preview: http://127.0.0.1:18770/leetcode/352/
All writes are inside leetcode/352/. Shared assets, registry, campaign state,
prior reviews and services were not changed. No commit, publication or submission.

## Official contract and implementation

Public official statement and actual Python3 codeSnippets verified; see
provenance/official.json and provenance/README.md. Python is the preferred faithful
interface, so no fallback language contract is needed. solution.py is canonical;
python-code.js is its exact JSON source mirror. The browser expressly labels its
trace as a simulation rather than execution of that Python class.

The maintained ranges are exact, sorted and separated by a missing integer.
Binary search locates the first start >= value. A duplicate inside the predecessor
returns; otherwise zero, one or two touching neighbors are replaced. Python list
shifts are disclosed as linear in k, even though the search is logarithmic.
The baseline is presented as a valid query-time sorting alternative, especially
with only 100 queries; no fabricated necessity for a particular optimization.

## Executed checks

- `python3 -B leetcode/352/tests/test_solution.py`: PASS. 19,531 exhaustive
  streams of length 0..6 on values 0..4; 122,315 intermediate states checked
  against integer-membership runs, including official and seeded random cases.
  Exact coverage, sorted maximal separation, return-copy mutation isolation,
  canonical and embedded source execution, 30,000-call boundary, values 0 and
  10000, maximum 5001 disjoint ranges and eventual full merge all passed.
- `node leetcode/352/tests/test_core.cjs`: PASS. 122,310 independently checked
  simulation frames, snapshot isolation, binary-search position, seeded cases;
  80 bilingual copy keys checked, with AST duplicate-definition detection.
- `node leetcode/352/tests/browser.cjs`: PASS on the given preview in real
  Chromium. Both locales; all five presets from empty to terminal, every rewind,
  replay/end/reset; all prediction options, reveal/change/reset; language after
  interaction; actual clipboard success and rejection/manual fallback; exact
  display/copy/download source parity; source offline and storage unavailable;
  button Enter/Tab and radio ArrowDown/ArrowUp/Tab/Enter; focus, forced colors,
  reduced motion, local asset failures, internal/deep anchors; 320/390/736/1440px.
  Narrow boundary captures additionally inspect 10000 and the full history.
  No page or console errors; all 8 runtime resources local.
- `node leetcode/352/tests/zoom.cjs`: PASS. Native Chromium tab zoom 2.0,
  verified through chrome.tabs.getZoom, DPR=2 and 780→390 / 640→320 CSS-pixel
  layouts. Both locales, bridge diagram, prediction and expanded source checked.
  A fresh temporary profile and test-only local extension avoid existing accounts.
- `python3 -B scripts/register_leetcode_lesson.py 352 --validate-only` from
  repository root: PASS, exit 0, empty stdout/stderr. See evidence/preflight.json.
  No registration was run. Complexity is one nonempty time-and-space string.

Evidence is in tests/evidence/{algorithm,core,browser,native-zoom,contrast,preflight}.json.
All result/screenshot producers accept OUTPUT_DIR; commands are in tests/README.md.
Combined shared + local shipped CSS: **11,781 bytes** (<25,000).
Measured normal body/explanation contrast: 16.09:1 / 12.62:1. Lowest sampled text
pair, including disabled primary and secondary controls: **6.45:1**. Focus is 3px
with 4px offset; orange outline against panel2 is 8.94:1.

## Visual inspection and author reading pass

Visually inspected focused captures, contact sheets and phone sections in both
languages: headers; hand example; baseline/derivation; trace across four widths;
before/after at each width; fresh prediction and revealed explanation; Python
mapping/costs; boundary history at 320/390; native 200% zoom at effective 320/390.
No remaining text collision, clipped endpoint or unreadable control was observed.
Section-only captures hide the sticky nav for capture to avoid its known
full-element overlay artifact; real viewport/deep-link checks retain it.

Observed and fixed before this freeze: long native select text clipped at 320px
(shorter labels now accompany the full input row); disabled primary button looked
active due to shared selector specificity (local .btn:disabled now wins).
Test harness corrections waited for asynchronous clipboard completion and smooth
anchor scrolling. Native zoom screenshots use direct CDP capture without a clip:
Playwright's default clip had produced blank zoom images despite correct DOM
geometry; final images contain the actual zoomed interface and were inspected.

Author reading observations, not learner-study results:

| Step | Visible evidence | Causal conclusion checked in both locales |
|---|---|---|
| 0 | [4,4] and [6,6], reveal [4,6] after 5 | Missing 5 forbids the earlier merge; duplicates do not change coverage |
| 1 | Min/max and one-sided counterexamples; baseline and gap condition | Exact coverage and maximal separation derive the need for both neighbors |
| 2 | p=1, probes 1→0, two old singleton ranges → [4,6], retained history | Neighbor replacement preserves values, order and gaps; rewind restores state |
| 3 | Choose independently, reveal two ranges, absent 17/18/19 explained | Filling one gap joins only touching ranges, not distant 20 |
| 4 | first=0,last=2 mapping, complete executable class, costs and source controls | Implement the same transition with half-open slice replacement; list shifts cost O(k) |

## Review boundary

These are author checks and computational oracles, not an independent reviewer,
actual novice teach-back, LeetCode acceptance, real phone/device study, or public
release verification. Those claims remain unmade. The dispatcher owns registry
and CONCEPT-MAP integration after separate review. Candidate hashes are frozen
in tests/evidence/candidate.json; reruns should use an external OUTPUT_DIR.
