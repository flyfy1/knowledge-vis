# #736 author self-check — candidate 736-author-1

Status: complete author candidate, ready for a separate independent review. This is
not independent acceptance, a learner study, a LeetCode submission result or a deployment.
Only leetcode/736/ was authored; registry, campaign records and shared files were not edited.

## Reproduce

From the repository root, with the existing preview at http://127.0.0.1:18770:

```sh
python3 -B leetcode/736/tests/check.py
node leetcode/736/tests/browser.cjs
node leetcode/736/tests/inspect.cjs
python3 -B scripts/register_leetcode_lesson.py 736 --validate-only
```

All three emitting test runners accept OUTPUT_DIR. Set it to a fresh evidence directory
when reviewing a frozen candidate. Browser packages resolve through NODE_PATH when set;
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is used as executablePath when supplied. No server
is started. The final command is validation only and exited 0 with empty stdout/stderr;
see evidence/preflight.json. No registration was run.

## Observed

- Public official GraphQL content and complete observed snippets saved in
  ../provenance/official-graphql.json, with request URL and access timestamp.
  Python3 callable was explicitly offered. Direct curl's challenge page is preserved
  separately; no authenticated or restricted access was used.
- Numerical: 2,037 independent AST/copied-environment comparisons; exhaustive small
  signed arithmetic and shadow/reassignment cases; seed 736 generated grammar;
  official 14/2/5 examples, signed 32-bit endpoints, deep nesting, repeated assignments,
  and an exactly 2,000-character legal expression. 45,769 trace frames checked for
  arithmetic, lookup tops, binding restoration and monotone cursor position.
- Chromium 156.0.8078.4 on Linux: both locales, all seven presets, start/end disabled
  states, forward/back/replay/reset, each prediction option, reveal/change, locale
  preservation, blocked storage, keyboard Enter/Tab, 3px focus, exact source display,
  automatic clipboard copy, manual fallback, download and offline file opening.
  Manual fallback uses an unrelated clipboard sentinel, verifies focus/full selection,
  dispatches Linux Control+C and reads back the full source, including its final newline.
- Layout: 320/390/736/1440 CSS-pixel widths and CSS zoom 200% at a 780px viewport;
  screenshots inspected visually. This zoom check uses CSS zoom, not a claim about a
  physical device or the browser chrome zoom menu. Closed default preset labels were
  measured with the actual browser font stack and a recorded 24px arrow allowance.
  The font stack is shared PingFang SC / Microsoft YaHei / system-ui / sans-serif;
  the exact resolved native font is not independently identified.
- Focused bilingual return: event 9/13 returns 5, changes x from [2,5] to [2], leaves
  the outer let/add calls waiting. Event 10/13 reads x=2 and leaves cursor 13/15.
  Before/after maps, calls, unread tokens and cumulative history agree. The zh→en→zh
  heading/interaction sequence preserves meaning. Focused screenshots wait two animation
  frames after scrolling so raster capture represents the settled DOM.
- Actual visible headings and document titles match #736 and metadata in each locale;
  the official link is exact. Both related links return 200 and contain their step2 IDs.
- No console, request or asset errors in the exercised HTTP paths. Runtime uses only
  local assets. Canonical mirror, textContent, automatic/manual copied text and downloaded
  bytes equal solution.py. Baseline is visible and executable independently in tests.
- Contrast helper is calibrated against black/white (21), primary luminances and
  #747474 on black (below 4.5). Final browser pass measured 71 visible text elements on
  solid/composited backgrounds, minimum 7.078851579017443:1. Focus uses the shared orange
  token; forced-colors screenshot preserves readable controls and visible focus.
- Total shared plus local shipped CSS: 10,661 bytes, below 25,000.

Inspected screenshots: en/zh at 320,390,736,1440; en/zh zoom200; bilingual heading,
return and prediction; forced-colors. Text and binding cards remain separate and readable;
stack comparison becomes a vertical pair on narrow viewports. Horizontal step navigation
is deliberately scrollable. Source/code wraps rather than forcing page overflow.

Evidence: numerical.json, browser.json, inspect.json, preflight.json and PNGs in evidence/.
Candidate identity: evidence/candidate.json contains source/test/provenance hashes and
read-only base Git HEAD. Shared dependency hashes identify what this candidate consumed.
The report and receipt are author evidence; a different reviewer must perform the cold
walkthrough and independent checks. Physical devices, native menu zoom, novice outcomes,
LeetCode acceptance and public production delivery are unverified.
