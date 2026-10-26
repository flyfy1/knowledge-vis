# #928 · Author self-check only

Candidate: 928-r1, frozen by manifest.json. Author: Codex; precise model identifier
unavailable. Independent reviewer/run: pending. Independent acceptance: not
claimed. Release/deployment: not performed. Actual learner results: not measured.
All writes for this task are within leetcode/928/; shared files and registry are
read-only. The approved design-pattern review is not acceptance of this lesson.

## Observed results

- Official free Hard statement, examples, bounds and Python3 submission snippet
  retrieved via public official GraphQL; full response in provenance/official.json.
  The official internal questionId is 964; frontend problem number is 928.
- Canonical Python and displayed baseline: PASS 31,849 exhaustive/seeded/quiz
  cases, three official examples and four maximum-size boundary checks.
  Inputs preserved; exact offline mirror and canonical SHA checked.
- Browser model: PASS 1,137 oracle/preset cases, 3,513 intermediate transitions.
  Clean partition reachability, distinct source sets, deleted-node exclusion,
  terminal infection, saved values and prefix best candidate/value pairs checked.
- Real Chromium 156.0.8078.4 on Linux: PASS 30 preset/removal/locale paths and
  eight locale/viewport combinations at 320,390,736,1440 CSS px. All applicable
  controls >=48px. Both-locale source display, automatic copying, native manual
  fallback (two attempts per locale, sentinel reset per attempt) and downloads
  exactly match solution.py including final newline. No newline conversion seen.
- Predict/reveal/change: all three choices, correct/wrong explanatory feedback,
  answer changes clear feedback, locale changes retain selected answer/reveal.
  Formula renders complete B − 1 − saved(r) in both languages.
- Candidate identity check: repeated-contact preset, current node 1 has saved=1
  and final=3; best-so-far node 0 has saved=2 and final=2. Rewind/replay identical.
  Shared group {2,3} correctly has boundary {0,1}; repeated contact {2,3} has {0}.
- Keyboard: Enter for controls, Tab traversal, Space/ArrowRight for radio choice,
  native Control+C manual copy, scrolling both tables and graph. Locale activation
  preserves focus and a nonterminal graph/scan state. Enabled end control reached by Tab also asserts the orange 3px focus outline
  and has both-locale screenshots. 3px focus measured, contrast
  >=3:1. Forced-colors and reduced-motion states exercised; storage denial and
  offline source/interaction initialization passed. No reported local asset or
  page errors; no external runtime requests.
- Measured sampled text contrast ranges 6.45:1 (disabled muted on panel2) to
  16.09:1 (body). Hint 7.74:1, pending cell 7.08:1, active action 13.10:1.
  CSS total shared+local = 11,889 bytes (<25,000). Exact figures in browser-results.json.
- Metadata preflight: `python3 -B scripts/register_leetcode_lesson.py 928 --validate-only`
  exit 0; no registration. Command/result preserved in preflight.json.

## Author visual inspection

Inspected actual PNGs using the image viewer, including en-320-heading,
en-320-spread, en-1440-scores, en-quiz, zh-390-graph, both locales' 320px
repeated-contact ledgers, shared-group populated diagrams, narrow 200% score
views and desktop 200% graph. Readable original node indices and I/H/X labels;
X has no incident edges, orange I and cyan H also have textual markers. Candidate
1's arrow remains attached to its own row, while the readout names best 0. Tables
have deliberate contained horizontal scrolling, with visible hints; no page
horizontal overflow. At 200%/320px prose becomes a narrow vertical reading column
and tables/diagrams scroll, rather than shrinking text. Native preset options are
short A–H codes; the complete localized selected description wraps below them.

Some viewport screenshots intentionally show a partial top/bottom reading region.
Initial element captures could include a sticky-nav overlay at the top of a long
capture; focused.cjs aligns diagrams below navigation and records corrected
focused captures. This is a capture-position issue, not missing graph data.

## Limits / next gate

These are author checks, not independent review or novice teach-back. The browser
runs a deterministic bounded teaching simulation, not the Python submission.
200% is exercised via CSS zoom in headless Chromium; no physical phones, other
browser engines, assistive technology session, public deployment or LeetCode
acceptance are claimed. Dispatch a fresh reviewer to the frozen candidate using
the six-dimension rubric. Workflow status stays here/BRIEF, outside learner UI.
